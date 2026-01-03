import cv2
import base64
import requests
import time
import json
import re

OLLAMA_URL = "http://ollama:11434/api/generate"
MODEL = "llava"

STREAM_URL = "rtsp://10.0.0.136:8554/live"

ANALYSIS_INTERVAL = 5

PROMPT = """
You are a computer vision system specialized in traffic incident detection.

Analyze the image and answer strictly in this JSON format:

{
  "accident_detected": true | false,
  "vehicles_involved": number,
  "collision_visible": true | false,
  "vehicle_damage": "none | minor | moderate | severe",
  "hazards_visible": [],
  "description": "short explanation"
}

Rules:
- hazards_visible must be an empty array if no hazards are visible
- Do not add explanations outside JSON
- Return ONLY valid JSON
"""

def frame_to_base64(frame):
    _, buffer = cv2.imencode(
        ".jpg",
        frame,
        [cv2.IMWRITE_JPEG_QUALITY, 80]
    )
    return base64.b64encode(buffer).decode("utf-8")

def extract_json(text):
    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        raise ValueError("No valid JSON found in model response")
    return json.loads(match.group())

def analyze_frame(frame):
    image_b64 = frame_to_base64(frame)

    payload = {
        "model": MODEL,
        "prompt": PROMPT,
        "images": [image_b64],
        "stream": False
    }

    response = requests.post(
        OLLAMA_URL,
        json=payload,
        timeout=120
    )
    response.raise_for_status()
    print(response)
    raw = response.json().get("response", "")
    return extract_json(raw)

def main():
    cap = cv2.VideoCapture(STREAM_URL)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    if not cap.isOpened():
        print("❌ Failed to open stream")
        return

    print("✅ Stream connected")

    last_analysis = 0

    while True:
        ret, frame = cap.read()

        if not ret:
            print("⚠️ No frame received, retrying...")
            time.sleep(1)
            continue

        now = time.time()
        if now - last_analysis < ANALYSIS_INTERVAL:
            continue

        last_analysis = now

        try:
            result = analyze_frame(frame)

            print("🧠 LLaVA result:")
            print(json.dumps(result, indent=2))

            if result.get("accident_detected"):
                print("🚨 ACCIDENT DETECTED 🚨")

        except Exception as e:
            print("❌ Analysis error:", str(e))

if __name__ == "__main__":
    main()
