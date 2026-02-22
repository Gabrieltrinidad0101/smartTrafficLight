#pragma once
#include <FastLED.h>

#define NUM_LEDS  256
#define MATRIX_W  16
#define MATRIX_H  16

// Defined in hardware.ino
extern CRGB leds[NUM_LEDS];

// Maps (x, y) to the serpentine LED index
int  xy(int x, int y);

// Fill the whole matrix with a solid color and push to LEDs
void matrixFill(CRGB color);

// Turn off all LEDs
void matrixClear();

// Draw a 16-row bitmask onto the matrix using the given color
void drawBitmap(const uint16_t* bitmap, CRGB color);

// Draw the Christmas tree (star + green + trunk)
void drawChristmasTree();
