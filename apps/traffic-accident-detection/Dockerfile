FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir ultralytics watchdog PyYAML requests opencv-python-headless

COPY . .

CMD ["watchmedo", "auto-restart", "--directory=.", "--pattern=*.py;*.yml", "--recursive", "--", "python", "infer.py"]
