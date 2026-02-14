FROM ultralytics/ultralytics:latest

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download model (pre-cache)
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"

COPY . .

# Environment variables for input/output if needed
ENV INPUT_VIDEO="/app/videos/video.mp4"
ENV OUTPUT_VIDEO="/app/output/output.mp4"

CMD ["python", "main.py"]
