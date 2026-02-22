#include "lightsControl.h"
#include "shapes.h"
#include <string.h>

// ── Phase table ───────────────────────────────────────────────────────────────
TrafficPhase phases[] = {
  { CRGB::Red,         "RED",    10000 },
  { CRGB(255, 150, 0), "YELLOW",  3000 },
  { CRGB::Green,       "GREEN",  10000 },
};

const int NUM_PHASES  = sizeof(phases) / sizeof(phases[0]);
int       currentPhase = 0;
LightMode lightMode    = AUTO_MODE;

static unsigned long phaseStart = 0;

// ── Internal helper ───────────────────────────────────────────────────────────
static void applyCurrentPhase() {
  matrixFill(phases[currentPhase].color);
  Serial.print("[Lights] Phase -> ");
  Serial.println(phases[currentPhase].name);
}

// ── Public API ────────────────────────────────────────────────────────────────
void lightsSetup() {
  phaseStart = millis();
  applyCurrentPhase();
}

void lightsUpdate() {
  if (lightMode == MANUAL_MODE) return;

  unsigned long now = millis();
  if (now - phaseStart >= phases[currentPhase].duration) {
    currentPhase = (currentPhase + 1) % NUM_PHASES;
    phaseStart   = now;
    applyCurrentPhase();
  }
}

void setMode(LightMode mode) {
  lightMode = mode;
  if (mode == AUTO_MODE) {
    phaseStart = millis();
    Serial.println("[Lights] Mode -> AUTO");
  } else {
    Serial.println("[Lights] Mode -> MANUAL");
  }
}

void setPhase(int index) {
  if (index < 0 || index >= NUM_PHASES) return;
  currentPhase = index;
  phaseStart   = millis();
  applyCurrentPhase();
}

void setPhaseByName(const char* name) {
  for (int i = 0; i < NUM_PHASES; i++) {
    if (strcasecmp(phases[i].name, name) == 0) {
      setPhase(i);
      return;
    }
  }
  Serial.print("[Lights] Unknown phase name: ");
  Serial.println(name);
}

int         getCurrentPhase()     { return currentPhase; }
const char* getCurrentPhaseName() { return phases[currentPhase].name; }
