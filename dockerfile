FROM python:3.11-slim

RUN pip install --no-cache-dir opencv-python-headless numpy requests

WORKDIR /app
COPY ./app /app

CMD ["python3","-u","./main.py"]
