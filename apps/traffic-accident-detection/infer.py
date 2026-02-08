import cv2
import time
import requests
import yaml
import threading
from ultralytics import YOLO

def load_config(config_path="config.yml"):
    with open(config_path, "r") as file:
        return yaml.safe_load(file)

def process_camera(rtsp_url, api_url, model_path):
    print(f"Starting analysis on {rtsp_url}...")
    try:
        model = YOLO(model_path)
    except Exception as e:
        print(f"Error loading model from {model_path} for {rtsp_url}: {e}")
        return

    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        print(f"Error: Could not open RTSP stream at {rtsp_url}")
        return

    target_fps = 5
    frame_interval = 1.0 / target_fps
    last_processed_time = 0

    headers = {"Content-Type": "application/json"}

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print(f"Error: Failed to retrieve frame from {rtsp_url}. Retrying in 5s...")
                time.sleep(5)
                cap.release()
                cap = cv2.VideoCapture(rtsp_url)
                if not cap.isOpened():
                     continue
                continue
            
            current_time = time.time()
            if current_time - last_processed_time >= frame_interval:
                last_processed_time = current_time
                
                results = model(frame, verbose=False, conf=0.25)
                
                accident_found = False
                detections_data = []

                for r in results:
                    if r.boxes:
                        for box in r.boxes:
                            cls_id = int(box.cls)
                            cls_name = model.names[cls_id]
                            conf = float(box.conf)
                            
                            detections_data.append({
                                "class_id": cls_id,
                                "class_name": cls_name,
                                "confidence": conf,
                                "bbox_xyxy": [float(x) for x in box.xyxy[0]]
                            })
                            if cls_id == 0:
                                accident_found = True

                if accident_found:
                    print(f"!!! Accident Detected on {rtsp_url} at {time.strftime('%H:%M:%S')} !!!")
                    print(detections_data)
                    payload = {"sub_label": "manual_trigger", "duration": 1, "include_recording": True}
                    try:
                        response = requests.post(api_url, headers=headers, json=payload, timeout=5)
                        print(f"Status Code: {response.status_code}")
                        if response.status_code == 200:
                            print("Success! Event created.")
                            print(f"Response: {response.json()}")
                        else:
                            print(f"Error: {response.text}")
                    except requests.RequestException as e:
                        print(f"Request Error: {e}")
                    print("-" * 30)

    except KeyboardInterrupt:
        print(f"Stopping analysis for {rtsp_url}...")
    finally:
        cap.release()

def main():
    config = load_config()
    cameras = config.get("cameras", {})
    model_path = r"./weights/epoch14.pt"

    if not cameras:
        print("Error: No cameras found in config.")
        return

    threads = []
    for cam_name, cam_data in cameras.items():
        if not cam_data.get("active", False):
            print(f"Skipping camera {cam_name}: Inactive.")
            continue
            
        rtsp_url = cam_data.get("rtsp_url")
        api_url = cam_data.get("api_url")
        
        if rtsp_url and api_url:
            print(f"Initializing camera: {cam_name}")
            t = threading.Thread(target=process_camera, args=(rtsp_url, api_url, model_path))
            t.daemon = True
            t.start()
            threads.append(t)
        else:
            print(f"Skipping camera {cam_name}: Missing rtsp_url or api_url")
    
    if not threads:
        print("No active cameras to process.")
        return

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping main process...")

if __name__ == "__main__":
    main()
