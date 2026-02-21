#include <FastLED.h>

#define LED_PIN    6
#define NUM_LEDS   256
#define MATRIX_W   16
#define MATRIX_H   16
#define BRIGHTNESS 40

CRGB leds[NUM_LEDS];

int xy(int x, int y) {
  if (x < 0 || x >= MATRIX_W || y < 0 || y >= MATRIX_H) return -1;
  if (y % 2 == 0) return y * MATRIX_W + x;
  else            return y * MATRIX_W + (MATRIX_W - 1 - x);
}

void matrixFill(CRGB color) {
  fill_solid(leds, NUM_LEDS, color);
  FastLED.show();
}

void matrixClear() {
  matrixFill(CRGB::Black);
}

// Árbol de navidad — bit 15 = columna 0
// estrella=amarillo, árbol=verde, tronco=marrón
const uint16_t treeStar[16] = {
  0x0180,  //  . . . . . . . ★ ★ . . . . . . .   estrella
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
};

const uint16_t treeGreen[16] = {
  0x0000,  //  . . . . . . . . . . . . . . . .
  0x03C0,  //  . . . . . . 1 1 1 1 . . . . . .   tier 1
  0x07E0,  //  . . . . . 1 1 1 1 1 1 . . . . .
  0x0FF0,  //  . . . . 1 1 1 1 1 1 1 1 . . . .
  0x03C0,  //  . . . . . . 1 1 1 1 . . . . . .   tier 2
  0x07E0,  //  . . . . . 1 1 1 1 1 1 . . . . .
  0x0FF0,  //  . . . . 1 1 1 1 1 1 1 1 . . . .
  0x1FF8,  //  . . . 1 1 1 1 1 1 1 1 1 1 . . .
  0x03C0,  //  . . . . . . 1 1 1 1 . . . . . .   tier 3
  0x07E0,  //  . . . . . 1 1 1 1 1 1 . . . . .
  0x0FF0,  //  . . . . 1 1 1 1 1 1 1 1 . . . .
  0x1FF8,  //  . . . 1 1 1 1 1 1 1 1 1 1 . . .
  0x3FFC,  //  . . 1 1 1 1 1 1 1 1 1 1 1 1 . .
  0x0000,  //  . . . . . . . . . . . . . . . .   tronco (marrón aparte)
  0x0000,
  0x0000,
};

const uint16_t treeTrunk[16] = {
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  0x0000,
  0x03C0,  //  . . . . . . 1 1 1 1 . . . . . .   tronco
  0x03C0,
  0x03C0,
};

void drawBitmap(const uint16_t* bitmap, CRGB color) {
  for (int y = 0; y < MATRIX_H; y++) {
    for (int x = 0; x < MATRIX_W; x++) {
      if (bitmap[y] & (1 << (15 - x))) {
        int idx = xy(x, y);
        if (idx >= 0) leds[idx] = color;
      }
    }
  }
}

void drawChristmasTree() {
  matrixClear();
  drawBitmap(treeGreen, CRGB::Green);
  drawBitmap(treeTrunk, CRGB(80, 40, 0));   // marrón
  drawBitmap(treeStar,  CRGB::Yellow);
  FastLED.show();
}

struct TrafficPhase {
  CRGB color;
  const char* name;
  unsigned long duration;
};

TrafficPhase phases[] = {
  { CRGB::Red,         "RED",    10000 },
  { CRGB(255, 150, 0), "YELLOW", 10000 },
  { CRGB::Green,       "GREEN",  10000 },
};

const int NUM_PHASES = 3;
int currentPhase = 0;
unsigned long phaseStart = 0;

void setup() {
  Serial.begin(9600);
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  drawChristmasTree();
  Serial.println("Ready.");
}

void loop() {
  unsigned long now = millis();

  if (now - phaseStart >= phases[currentPhase].duration) {
    currentPhase = (currentPhase + 1) % NUM_PHASES;
    phaseStart = now;
    matrixFill(phases[currentPhase].color);
    Serial.print("Phase -> ");
    Serial.println(phases[currentPhase].name);
  }
}
