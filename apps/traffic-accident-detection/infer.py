import matplotlib.pyplot as plt
import json
from ultralytics import YOLO

model=YOLO(r"./weights/epoch14.pt")
results = model(r"./testing/fig7.png", show=True, conf=0.25)


output = []
for r in results:
    detections = []
    if r.boxes is not None:
        for box in r.boxes:
            detections.append({
                "class_id": int(box.cls),
                "confidence": float(box.conf),
                "bbox_xyxy": [float(x) for x in box.xyxy[0]]
            })

    output.append({
        "image": r.path,
        "detections": detections
    })

with open("results.json", "w") as f:
    json.dump(output, f, indent=2)

print("✅ results.json generado")
