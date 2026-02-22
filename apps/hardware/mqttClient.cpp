#include "mqttClient.h"
#include "lightsControl.h"

#include <PubSubClient.h>

#ifdef ESP32
  #include <WiFi.h>
#elif defined(ESP8266)
  #include <ESP8266WiFi.h>
#else
  #error "This module requires an ESP32 or ESP8266 board."
#endif

static WiFiClient   wifiClient;
static PubSubClient mqtt(wifiClient);

// ── Message callback ──────────────────────────────────────────────────────────
static void onMessage(char* topic, byte* payload, unsigned int len) {
  // Null-terminate the payload
  char msg[len + 1];
  memcpy(msg, payload, len);
  msg[len] = '\0';

  Serial.print("[MQTT] ");
  Serial.print(topic);
  Serial.print(" -> ");
  Serial.println(msg);

  if (strcmp(topic, TOPIC_COMMAND) == 0) {
    if (strcasecmp(msg, "AUTO") == 0) {
      setMode(AUTO_MODE);
    } else {
      setMode(MANUAL_MODE);
      setPhaseByName(msg);
    }
    mqttPublishStatus(getCurrentPhaseName());
  }
}

// ── WiFi ──────────────────────────────────────────────────────────────────────
static void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print("[WiFi] Connecting to ");
  Serial.print(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }
  Serial.print("\n[WiFi] IP: ");
  Serial.println(WiFi.localIP());
}

// ── MQTT ──────────────────────────────────────────────────────────────────────
static void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("[MQTT] Connecting...");
    if (mqtt.connect(MQTT_CLIENT)) {
      Serial.println(" OK");
      mqtt.subscribe(TOPIC_COMMAND);
      Serial.print("[MQTT] Subscribed: ");
      Serial.println(TOPIC_COMMAND);
      mqttPublishStatus(getCurrentPhaseName());
    } else {
      Serial.print(" failed rc=");
      Serial.print(mqtt.state());
      Serial.println(" – retry in 5 s");
      delay(5000);
    }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
void mqttSetup() {
  connectWiFi();
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(onMessage);
  connectMQTT();
}

void mqttLoop() {
  if (!mqtt.connected()) {
    connectWiFi();
    connectMQTT();
  }
  mqtt.loop();
}

void mqttPublishStatus(const char* status) {
  mqtt.publish(TOPIC_STATUS, status);
  Serial.print("[MQTT] Status published: ");
  Serial.println(status);
}
