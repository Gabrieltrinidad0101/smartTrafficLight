#include "shapes.h"

// ── Serpentine mapping ────────────────────────────────────────────────────────
int xy(int x, int y) {
  if (x < 0 || x >= MATRIX_W || y < 0 || y >= MATRIX_H) return -1;
  return (y % 2 == 0) ? y * MATRIX_W + x
                       : y * MATRIX_W + (MATRIX_W - 1 - x);
}

// ── Matrix helpers ────────────────────────────────────────────────────────────
void matrixFill(CRGB color) {
  fill_solid(leds, NUM_LEDS, color);
  FastLED.show();
}

void matrixClear() {
  matrixFill(CRGB::Black);
}

// ── Bitmaps (bit 15 = column 0) ───────────────────────────────────────────────
static const uint16_t treeStar[MATRIX_H] = {
  0x0180,                                     // ★ star (row 0)
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
};

static const uint16_t treeGreen[MATRIX_H] = {
  0x0000,            // row 0  (star row – empty here)
  0x03C0,            // tier 1 – narrow
  0x07E0,
  0x0FF0,
  0x03C0,            // tier 2
  0x07E0,
  0x0FF0,
  0x1FF8,
  0x03C0,            // tier 3
  0x07E0,
  0x0FF0,
  0x1FF8,
  0x3FFC,            // widest base
  0x0000, 0x0000, 0x0000,
};

static const uint16_t treeTrunk[MATRIX_H] = {
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  0x0000,
  0x03C0,            // trunk (rows 13-15)
  0x03C0,
  0x03C0,
};

// ── Drawing functions ─────────────────────────────────────────────────────────
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
  drawBitmap(treeTrunk, CRGB(80, 40, 0));   // brown
  drawBitmap(treeStar,  CRGB::Yellow);
  FastLED.show();
}
