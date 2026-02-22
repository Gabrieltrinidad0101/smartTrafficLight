#pragma once

// ── WiFi credentials ──────────────────────────────────────────────────────────
#define WIFI_SSID     "YOUR_SSID"
#define WIFI_PASSWORD "YOUR_PASSWORD"

// ── Broker ────────────────────────────────────────────────────────────────────
#define MQTT_BROKER   "192.168.1.100" 
#define MQTT_PORT     1883
#define MQTT_CLIENT   "smartTrafficLight"

// ── Topics ────────────────────────────────────────────────────────────────────
// Subscribe – accepted payloads: RED | YELLOW | GREEN | AUTO
#define TOPIC_COMMAND  "traffic/command"

// Publish  – current phase name or "AUTO"
#define TOPIC_STATUS   "traffic/status"

// ── API ───────────────────────────────────────────────────────────────────────

// Connect to WiFi and MQTT broker, subscribe to TOPIC_COMMAND.
// Call once in setup().
void mqttSetup();

// Keep the MQTT connection alive and process incoming messages.
// Call every loop().
void mqttLoop();

// Publish the current phase name to TOPIC_STATUS.
void mqttPublishStatus(const char* status);
