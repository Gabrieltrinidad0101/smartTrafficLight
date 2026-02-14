import cv2
import time
import requests
import yaml
import threading
from ultralytics import YOLO

def load_config(config_path="config.yml"):
    with open(config_path, "r") as file:
        return yaml.safe_load(file)

def process_camera(camera_name, rtsp_url, api_url, model_path, cooldown_seconds=300):
    print(f"Starting analysis on {rtsp_url} with cooldown {cooldown_seconds}s...")
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

    # Validation and Cooldown variables
    consecutive_accident_frames = 0
    REQUIRED_CONSECUTIVE_FRAMES = 5
    last_accident_report_time = 0

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

            # Check cooldown
            if current_time - last_accident_report_time < cooldown_seconds:
                continue

            if current_time - last_processed_time >= frame_interval:
                last_processed_time = current_time
                
                results = model(frame, verbose=False, conf=0.25)
                
                accident_found_in_frame = False
                max_conf = 0.0
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
                                accident_found_in_frame = True
                                if conf > max_conf:
                                    max_conf = conf

                if accident_found_in_frame:
                    consecutive_accident_frames += 1
                else:
                    consecutive_accident_frames = 0

                if consecutive_accident_frames >= REQUIRED_CONSECUTIVE_FRAMES:
                    timestamp_struct = time.localtime(current_time)
                    date_str = time.strftime("%d/%m", timestamp_struct)
                    time_str = time.strftime("%I%p", timestamp_struct).lower()
                    
                    time_filename = time.strftime("%Y-%m-%d-%H-%M-%S", timestamp_struct)
                    filename = f"{camera_name}-{time_filename}-conf-{max_conf}.jpg"
                    
                    try:
                        cv2.imwrite(filename, frame) # Saving in working dir (which is /app in container)
                        
                        with open(filename, 'rb') as img_file:
                            files = {'image': (filename, img_file, 'image/jpeg')}
                            data = {
                                "date": date_str,
                                "time": time_str
                            }

                            try:
                                api_notification_url = "http://api:3000/api/notifications/send" 
                                notif_response = requests.post(api_notification_url, data=data,timeout=10)
                                print(f"Notification API Response: {notif_response.status_code} - {notif_response.text}")
                            except Exception as e:
                                print(f"Error calling Notification API: {e}")
                                
                    except Exception as e:
                        print(f"Error handling notification/image save: {e}")

                    payload = {"sub_label": "manual_trigger", "duration": 1, "include_recording": True}
                    try:
                        response = requests.post(api_url, headers=headers, json=payload, timeout=5)
                        if response.status_code != 200:
                            print(f"Error: {response.text}")
                    except requests.RequestException as e:
                        print(f"Request Error: {e}")

                    consecutive_accident_frames = 0
                    last_accident_report_time = time.time()

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
        cooldown = cam_data.get("cooldown", 300) # Default to 300s (5 mins) if not specified
        
        if rtsp_url and api_url:
            print(f"Initializing camera: {cam_name}")
            t = threading.Thread(target=process_camera, args=(cam_name, rtsp_url, api_url, model_path, cooldown))
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
