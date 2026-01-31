// apps/ia/index.js
const { spawn } = require('child_process');
const axios = require('axios');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Configuración desde variables de entorno
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";
const MODEL = process.env.MODEL || "llava";
const RTSP_URL = process.env.RTSP_URL || "rtsp://10.0.0.140:8554/live";
const ANALYSIS_INTERVAL = parseInt(process.env.ANALYSIS_INTERVAL) || 5;
const PORT = process.env.PORT || 3001;
const LOG_DIR = process.env.LOG_DIR || './logs';
const SAVE_INCIDENTS = process.env.SAVE_INCIDENTS === 'true' || false;

const PROMPT = `You are a computer vision system specialized in traffic incident detection.

Analyze the image and answer strictly in this JSON format:

{
  "accident_detected": boolean,
  "vehicles_involved": number,
  "collision_visible": boolean,
  "vehicle_damage": "none" | "minor" | "moderate" | "severe",
  "hazards_visible": string[],
  "description": string,
  "confidence": number
}

Rules:
- confidence must be a number between 0 and 1
- hazards_visible must be an empty array if no hazards are visible
- Return ONLY valid JSON`;

// Inicializar servidor Express
const app = express();
app.use(express.json());

// Variables de estado
let frameCounter = 0;
let accidentCounter = 0;
let lastAnalysisTime = null;
let ffmpegProcess = null;
let isProcessing = false;
let systemStatus = 'initializing';

// Crear directorio de logs si no existe
async function ensureLogDir() {
    try {
        await fs.mkdir(LOG_DIR, { recursive: true });
        await fs.mkdir(path.join(LOG_DIR, 'incidents'), { recursive: true });
        console.log(`📁 Log directory ready: ${LOG_DIR}`);
    } catch (error) {
        console.error('Error creating log directory:', error);
    }
}

// Endpoints de API
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'traffic-incident-detection',
        system_status: systemStatus,
        timestamp: new Date().toISOString(),
        metrics: {
            frames_processed: frameCounter,
            accidents_detected: accidentCounter,
            last_analysis: lastAnalysisTime,
            uptime: process.uptime()
        }
    });
});

app.get('/metrics', (req, res) => {
    res.json({
        frames_processed: frameCounter,
        accidents_detected: accidentCounter,
        last_analysis: lastAnalysisTime,
        processing_active: isProcessing,
        system_status: systemStatus,
        uptime: process.uptime()
    });
});

app.post('/restart', (req, res) => {
    console.log('🔄 Manual restart requested');
    restartStream();
    res.json({ message: 'Restarting stream processing' });
});

app.get('/status', (req, res) => {
    res.json({
        status: systemStatus,
        rtsp_url: RTSP_URL,
        model: MODEL,
        analysis_interval: ANALYSIS_INTERVAL,
        is_processing: isProcessing,
        ffmpeg_running: ffmpegProcess !== null
    });
});

// Guardar incidente en archivo
async function saveIncident(incidentData, imageBuffer) {
    if (!SAVE_INCIDENTS) return;
    
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const incidentId = `incident_${timestamp}`;
        
        // Guardar datos JSON
        const jsonPath = path.join(LOG_DIR, 'incidents', `${incidentId}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(incidentData, null, 2));
        
        // Guardar imagen
        const imagePath = path.join(LOG_DIR, 'incidents', `${incidentId}.jpg`);
        await fs.writeFile(imagePath, imageBuffer);
        
        console.log(`💾 Incident saved: ${incidentId}`);
    } catch (error) {
        console.error('Error saving incident:', error);
    }
}

// Análisis de frame
async function analyzeFrame(imageBuffer) {
    try {
        const imageB64 = imageBuffer.toString('base64');
        
        const payload = {
            model: MODEL,
            prompt: PROMPT,
            images: [imageB64],
            stream: false,
            options: {
                temperature: 0.1,
                num_predict: 500
            }
        };

        console.log(`📤 Sending frame #${frameCounter} to LLaVA...`);
        const response = await axios.post(OLLAMA_URL, payload, {
            timeout: 120000
        });

        const rawResponse = response.data.response || "";
        
        // Extraer JSON
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
        }
        
        const result = JSON.parse(jsonMatch[0]);
        
        // Validar estructura
        if (!result.hasOwnProperty('accident_detected')) {
            throw new Error("Invalid response format");
        }
        
        return result;
        
    } catch (error) {
        console.error("❌ Error analyzing frame:", error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error("⚠️ Cannot connect to Ollama. Make sure Ollama is running.");
        }
        throw error;
    }
}

// Procesar stream RTSP
function startRTSPStream() {
    systemStatus = 'connecting';
    console.log(`🚀 Starting RTSP stream processing...`);
    console.log(`🔗 RTSP URL: ${RTSP_URL}`);
    console.log(`🤖 Model: ${MODEL}`);
    console.log(`⏱️  Analysis interval: ${ANALYSIS_INTERVAL}s`);
    
    // Verificar FFmpeg
    const ffmpegTest = spawn('which', ['ffmpeg']);
    ffmpegTest.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ FFmpeg not found. Please install FFmpeg.');
            systemStatus = 'error';
            return;
        }
    });
    
    // Argumentos de FFmpeg optimizados
    const ffmpegArgs = [
        '-rtsp_transport', 'tcp',           // TCP para más estabilidad
        '-i', RTSP_URL,
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '5',
        '-r', '1',                          // 1 frame por segundo
        '-vf', 'scale=640:480,fps=1',       // Redimensionar y limitar FPS
        '-f', 'image2pipe',
        '-c:v', 'mjpeg',
        '-q:v', '3',                        // Calidad balanceada
        '-loglevel', 'error',
        'pipe:1'
    ];
    
    console.log('🎬 FFmpeg command:', 'ffmpeg', ffmpegArgs.join(' '));
    
    ffmpegProcess = spawn('ffmpeg', ffmpegArgs, {
        stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let frameBuffer = Buffer.alloc(0);
    let lastAnalysis = 0;
    
    ffmpegProcess.stdout.on('data', (data) => {
        systemStatus = 'streaming';
        frameBuffer = Buffer.concat([frameBuffer, data]);
        
        // Buscar frames JPEG
        const startMarker = Buffer.from([0xFF, 0xD8]);
        const endMarker = Buffer.from([0xFF, 0xD9]);
        
        let startIndex = frameBuffer.indexOf(startMarker);
        
        while (startIndex !== -1) {
            const afterStart = frameBuffer.slice(startIndex + 2);
            const endIndex = afterStart.indexOf(endMarker);
            
            if (endIndex !== -1) {
                frameCounter++;
                const frameSize = startIndex + 2 + endIndex + 2;
                
                // Frame JPEG completo
                const jpegFrame = frameBuffer.slice(startIndex, frameSize);
                
                const now = Date.now();
                if (now - lastAnalysis >= ANALYSIS_INTERVAL * 1000 && !isProcessing) {
                    lastAnalysis = now;
                    lastAnalysisTime = new Date().toISOString();
                    isProcessing = true;
                    
                    // Procesar frame de manera asíncrona
                    process.nextTick(async () => {
                        try {
                            console.log(`\n📸 Frame #${frameCounter} (${jpegFrame.length} bytes)`);
                            
                            const result = await analyzeFrame(jpegFrame);
                            isProcessing = false;
                            
                            console.log("🧠 Analysis result:");
                            console.log(JSON.stringify(result, null, 2));
                            
                            if (result.accident_detected && result.confidence > 0.7) {
                                accidentCounter++;
                                console.log("🚨 ACCIDENT DETECTED! 🚨");
                                console.log(`🚗 Vehicles involved: ${result.vehicles_involved}`);
                                console.log(`⚠️  Hazards: ${result.hazards_visible.join(', ') || 'none'}`);
                                console.log(`📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
                                console.log(`📈 Total accidents: ${accidentCounter}`);
                                
                                // Guardar incidente
                                await saveIncident({
                                    ...result,
                                    frame_number: frameCounter,
                                    timestamp: lastAnalysisTime
                                }, jpegFrame);
                                
                                // Aquí podrías enviar una notificación a la API
                                // await sendAlertToAPI(result);
                            }
                            
                        } catch (error) {
                            isProcessing = false;
                            console.error("❌ Frame processing error:", error.message);
                        }
                    });
                }
                
                // Limpiar buffer
                frameBuffer = frameBuffer.slice(frameSize);
                startIndex = frameBuffer.indexOf(startMarker);
            } else {
                // Frame incompleto
                break;
            }
        }
    });
    
    ffmpegProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg && !msg.includes('deprecated')) {
            console.log('FFmpeg:', msg);
        }
    });
    
    ffmpegProcess.on('close', (code) => {
        systemStatus = 'disconnected';
        console.log(`⚠️ FFmpeg exited with code ${code}`);
        console.log("🔄 Reconnecting in 10 seconds...");
        
        frameBuffer = Buffer.alloc(0);
        
        setTimeout(restartStream, 10000);
    });
    
    ffmpegProcess.on('error', (error) => {
        systemStatus = 'error';
        console.error('🔥 FFmpeg error:', error.message);
    });
}

// Reiniciar stream
function restartStream() {
    console.log('🔄 Restarting stream...');
    
    if (ffmpegProcess) {
        ffmpegProcess.kill('SIGTERM');
        ffmpegProcess = null;
    }
    
    setTimeout(startRTSPStream, 1000);
}

// Apagado controlado
function gracefulShutdown() {
    console.log("\n👋 Shutdown requested...");
    systemStatus = 'shutting_down';
    
    if (ffmpegProcess) {
        console.log("Stopping FFmpeg...");
        ffmpegProcess.kill('SIGTERM');
    }
    
    setTimeout(() => {
        console.log("Shutdown complete");
        process.exit(0);
    }, 2000);
}

// Inicialización
async function initialize() {
    console.log('=======================================');
    console.log('🚦 Smart Traffic Light - IA Module');
    console.log('=======================================');
    
    await ensureLogDir();
    
    // Verificar conexión con Ollama
    try {
        console.log('🔗 Testing Ollama connection...');
        await axios.get(OLLAMA_URL.replace('/api/generate', '/api/tags'), { timeout: 5000 });
        console.log('✅ Ollama connection successful');
    } catch (error) {
        console.error('❌ Cannot connect to Ollama:', error.message);
        console.log('💡 Make sure Ollama is running:');
        console.log('   $ ollama run llava');
        console.log('   $ ollama serve');
    }
    
    // Iniciar servidor web
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🌐 Web server: http://localhost:${PORT}`);
        console.log(`📊 Health:    http://localhost:${PORT}/health`);
        console.log(`📈 Metrics:   http://localhost:${PORT}/metrics`);
        console.log(`🔄 Status:    http://localhost:${PORT}/status`);
        console.log('=======================================');
        
        // Iniciar procesamiento RTSP
        startRTSPStream();
    });
}

// Manejadores de señales
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Iniciar aplicación
initialize();