FROM node:18-alpine

LABEL maintainer="gabrieltrinidad"
LABEL description="Smart Traffic Light - IA Module"
LABEL version="1.0.0"

RUN apk add --no-cache \
    ffmpeg \
    tzdata \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

ENV TZ=America/Mexico_City

WORKDIR /app

COPY package*.json ./

RUN npm i 

COPY . .

RUN mkdir -p /app/logs/incidents

ENV PORT=3001
ENV RTSP_URL=rtsp://10.0.0.136:8554/live
ENV OLLAMA_URL=http://ollama:11434/api/generate
ENV MODEL=llava
ENV ANALYSIS_INTERVAL=5
ENV LOG_DIR=/app/logs
ENV SAVE_INCIDENTS=true

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "run","dev"]