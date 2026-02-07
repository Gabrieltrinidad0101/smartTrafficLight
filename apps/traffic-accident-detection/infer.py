import cv2
import time
from ultralytics import YOLO
import requests

url = "http://10.0.0.138:5000/api/events/LicensePlateRecognition/accidente/create"
headers = {"Content-Type": "application/json"}


def main():
    model_path = r"./weights/epoch14.pt"
    try:
        model = YOLO(model_path)
    except Exception as e:
        print(f"Error loading model from {model_path}: {e}")
        return

    rtsp_url = "rtsp://10.0.0.140:8554/accident"
    cap = cv2.VideoCapture(rtsp_url)

    if not cap.isOpened():
        print(f"Error: Could not open RTSP stream at {rtsp_url}")
        return

    target_fps = 5
    frame_interval = 1.0 / target_fps
    last_processed_time = 0

    print(f"Starting analysis on {rtsp_url} at {target_fps} fps analysis rate...")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Error: Failed to retrieve frame (stream ended or connection lost).")
                break
            
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
                    print(f"!!! Accident Detected at {time.strftime('%H:%M:%S')} !!!")
                    print(detections_data)
                    payload = {"sub_label": "manual_trigger", "duration": 1, "include_recording": True}
                    response = requests.post(url, headers=headers, json=payload)

                    print(f"Status Code: {response.status_code}")
                    if response.status_code == 200:
                        print("Success! Event created.")
                        print(f"Response: {response.json()}")
                    else:
                        print(f"Error: {response.text}")
                    print("-" * 30)

    except KeyboardInterrupt:
        print("Stopping analysis...")
    finally:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
