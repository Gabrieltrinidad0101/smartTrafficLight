#include <FastLED.h>
#include "shapes.h"
#include "lightsControl.h"
#include "mqttClient.h"

#define LED_PIN    6
#define BRIGHTNESS 40

// Single source of truth for the LED array – shared via extern in shapes.h
CRGB leds[NUM_LEDS];

void setup() {
  Serial.begin(9600);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);

  drawChristmasTree();   // welcome animation
  delay(3000);

  lightsSetup();         // paint first traffic phase
  mqttSetup();           // connect WiFi + broker

  Serial.println("[System] Ready.");
}

void loop() {
  mqttLoop();            // keep MQTT alive, dispatch incoming commands
  lightsUpdate();        // auto-advance phase when in AUTO_MODE
}
