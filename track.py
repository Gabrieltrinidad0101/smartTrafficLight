from ultralytics import YOLO
from yolox.tracker.byte_tracker import BYTETracker
import cv2

model = YOLO("yolov8n.pt")
tracker = BYTETracker()

cap = cv2.VideoCapture("./video.mp4") 

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)[0]
    detections = []

    for b in results.boxes:
        x1, y1, x2, y2 = b.xyxy[0]
        score = b.conf[0]
        detections.append([x1, y1, x2, y2, score])

    tracks = tracker.update(detections)

    for t in tracks:
        x, y, w, h = t.tlwh
        track_id = t.track_id
        cv2.rectangle(frame, (int(x), int(y)), (int(x+w), int(y+h)), (0,255,0), 2)
        cv2.putText(frame, f"ID {track_id}", (int(x), int(y)-5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,0), 2)

    cv2.imshow("ByteTrack", frame)
    if cv2.waitKey(1) == 27:
        break
