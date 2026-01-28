import json
from ultralytics import YOLO
from huggingface_hub import hf_hub_download

# Descargar el modelo desde Hugging Face
model_path = hf_hub_download(
    repo_id="Enos-123/traffic-accident-detection-yolo11x",
    filename="best.pt"
)

# Cargar modelo desde archivo local
model = YOLO(model_path)

results = model.predict(
    source="http://images.cocodataset.org/val2017/000000039769.jpg",
    device="cpu",
    conf=0.4,
    imgsz=640,
    save=True
)

# Guardar resultados en JSON
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
