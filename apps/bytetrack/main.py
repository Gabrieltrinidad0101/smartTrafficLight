import os
import shutil
from ultralytics import YOLO

def main():
    # Configuration
    input_path = os.getenv("INPUT_VIDEO", "/app/videos/video.mp4")
    output_dir = "/app/output"
    
    if not os.path.exists(input_path):
        print(f"Error: Input video not found at {input_path}")
        return

    # Load model
    print("Loading YOLOv8 model...")
    model = YOLO("yolov8n.pt")

    # Run tracking with ByteTrack and GPU (RTX 5090)
    print(f"Processing video: {input_path} on GPU...")
    project = "runs"
    name = "track_output"
    
    results = model.track(
        source=input_path,
        conf=0.3,
        iou=0.5,
        show=False,
        save=True,
        tracker="bytetrack.yaml",
        device=0,  # Use GPU
        project=project,
        name=name,
        exist_ok=True
    )
    
    # The file will be in runs/track_output/video.mp4 (or whatever the filename is)
    filename = os.path.basename(input_path)
    # Note: Ultralytics might change the extension or filename slightly if it re-encodes
    # But usually it keeps it. Let's look for any .mp4 or .avi in that directory.
    
    saved_dir = os.path.join(project, name)
    found_file = None
    for f in os.listdir(saved_dir):
        if f.endswith(('.mp4', '.avi', '.mkv')):
            found_file = os.path.join(saved_dir, f)
            break
            
    if found_file:
        os.makedirs(output_dir, exist_ok=True)
        final_output = os.path.join(output_dir, "output.mp4")
        shutil.move(found_file, final_output)
        print(f"✅ Success! Video exported to {final_output}")
    else:
        print("❌ Error: Could not find processed video in output directory.")

if __name__ == "__main__":
    main()
