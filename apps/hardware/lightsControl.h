#pragma once
#include <FastLED.h>

// ── Modes ─────────────────────────────────────────────────────────────────────
enum LightMode {
  AUTO_MODE,    // cycles through phases automatically
  MANUAL_MODE,  // stays on the phase set via MQTT
};

// ── Phase descriptor ──────────────────────────────────────────────────────────
struct TrafficPhase {
  CRGB          color;
  const char*   name;
  unsigned long duration;   // ms
};

// Exposed so mqttClient can read current state
extern TrafficPhase phases[];
extern const int    NUM_PHASES;
extern int          currentPhase;
extern LightMode    lightMode;

// ── API ───────────────────────────────────────────────────────────────────────

// Call once in setup() – paints the first phase
void lightsSetup();

// Call every loop() – advances phase when in AUTO_MODE
void lightsUpdate();

// Switch between AUTO / MANUAL
void setMode(LightMode mode);

// Activate a phase by index (0=RED, 1=YELLOW, 2=GREEN)
void setPhase(int index);

// Activate a phase by name: "RED", "YELLOW", "GREEN" (case-insensitive)
void setPhaseByName(const char* name);

// Getters
int         getCurrentPhase();
const char* getCurrentPhaseName();
