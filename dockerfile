# Base image with Python 3.9 (CPU only)
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    torch torchvision \
    opencv-python \
    numpy \
    cython \
    tqdm \
    scipy \
    pyyaml \
    loguru

# Clone YOLOX (which includes BYTETracker)
RUN git clone https://github.com/Megvii-BaseDetection/YOLOX.git
WORKDIR /app/YOLOX

# Install YOLOX in editable mode
RUN pip install -v -e .

# Copy any local config, weights, or scripts into the container
# (optional — adjust path to match your project)
# COPY . /app/YOLOX

# Set default command: run tracker on CPU
# Example: replace with your weights + input path
CMD ["python", "tools/demo_track.py", "video", \
     "-f", "exps/example/mot/yolox_x_mix_det.py", \
     "-c", "pretrained.pth.tar", \
     "--path", "assets/test.mp4", \
     "--device", "cpu", \
     "--save_result"]
