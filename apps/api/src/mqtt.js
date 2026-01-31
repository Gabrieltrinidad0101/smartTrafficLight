import mqtt from 'mqtt'

class FrigateLPRBridge {
  constructor() {
    this.client = mqtt.connect('mqtt://mqtt:1883')
    this.setupMQTT()
  }
  
  setupMQTT() {
    this.client.on('connect', () => {
      console.log('Connected to Frigate MQTT')
      
      this.client.subscribe('frigate/events')
      this.client.subscribe('frigate/tracked_object_update')
    })
    
    this.client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString())

        if (topic === 'frigate/tracked_object_update' && data.type === 'lpr') {
          this.handleExternalLPR(data)
        }
        
        if (topic === 'frigate/events') {
          this.handleFrigateEvent(data)
        }
      } catch (error) {
        console.error('Error parsing MQTT message:', error)
      }
    })
  }
  
  handleExternalLPR(lprData) {
    console.log(`📸 Placa externa detectada: ${lprData.plate}`)
    this.sendWhatsAppAlert(lprData)
    this.publishToFrigate({
      plate: lprData.plate,
      confidence: lprData.confidence || 0.90,
      camera: lprData.camera || 'gate_camera',
      timestamp: lprData.timestamp || Date.now(),
      box: lprData.bbox || this.calculateDefaultBox(lprData.camera)
    })
  }
  
  publishToFrigate(plateData) {
    const event = {
      "type": "new",
      "after": {
        "id": `ext_lpr_${Date.now()}`,
        "camera": plateData.camera,
        "frame_time": plateData.timestamp / 1000,
        "label": "license_plate",
        "top_score": plateData.confidence,
        "start_time": (plateData.timestamp / 1000) - 3,
        "end_time": plateData.timestamp / 1000,
        "has_snapshot": true,
        "has_clip": false,
        "attributes": {
          "license_plate": plateData.plate,
          "license_plate_confidence": plateData.confidence,
          "source": "external_lpr_system"
        },
        "recognized_license_plate": {
          "plate": plateData.plate,
          "confidence": plateData.confidence,
          "matches_template": true
        }
      }
    }
    
    this.client.publish('frigate/events', JSON.stringify(event))
    
    const update = {
      "type": "lpr",
      "camera": plateData.camera,
      "plate": plateData.plate,
      "confidence": plateData.confidence,
      "timestamp": plateData.timestamp / 1000
    }
    
    this.client.publish('frigate/tracked_object_update', JSON.stringify(update))
    
    //console.log(`✅ Placa ${plateData.plate} publicada en Frigate`)
  }
  
  handleFrigateEvent(eventData) {
    if (eventData.after?.label === 'license_plate') {
      console.log('Frigate detectó placa:', eventData.after.recognized_license_plate)
    }
  }
  
  sendWhatsAppAlert(lprData) {
    // console.log(`📱 Enviando WhatsApp para placa: ${lprData.plate}`)
  }
  
  calculateDefaultBox(cameraName) {
    const defaults = {
      'gate_camera': [100, 100, 200, 150],
      'entrance_camera': [50, 50, 150, 120],
      'exit_camera': [80, 80, 180, 140]
    }
    return defaults[cameraName] || [0, 0, 100, 100]
  }
}

const bridge = new FrigateLPRBridge()