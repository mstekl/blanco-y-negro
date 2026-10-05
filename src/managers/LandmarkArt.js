// LandmarkArt.js — Draws the scenery behind the levels of a country!
// Chichén Itzá for México, the Statue of Liberty for the USA, the CN Tower
// for Canada... everything is drawn with simple shapes (no image files).
//
// Every scene is drawn TWICE (just like the city buildings):
//   - in gray, for the dark world at the start of the level
//   - in full color, hidden behind it, that shows up when the level is completed
//
// To add a new landmark: write a function like drawChichen() below and add it
// to the LANDMARKS list at the bottom. Then give a country that landmark in
// src/data/countryThemes.js.

import Phaser from 'phaser';

const GROUND = 562; // where things stand (the ground platforms start at y=568)

// A tiny "random" number generator that always gives the same numbers, so the
// scenery looks the same every time we play (the real random would change it)
const pseudoRandom = (i) => ((i * 9301 + 49297) % 233280) / 233280;

// Draw a filled polygon from a list of [x, y] pairs
function polygon(g, color, points) {
  g.fillStyle(color, 1);
  g.fillPoints(points.map(([x, y]) => ({ x, y })), true);
}

// The gray version of a color: less color, and darker (like a shadow)
function makeTone(colored, saturation) {
  return (hex) => {
    if (colored) return hex;
    const r = (hex >> 16) & 255;
    const gr = (hex >> 8) & 255;
    const b = hex & 255;
    const lum = 0.3 * r + 0.59 * gr + 0.11 * b;
    const keep = saturation * 0.3; // how much of the real color is left
    const dark = 0.45;
    const mix = (c) => Math.floor((lum + (c - lum) * keep) * dark);
    return (mix(r) << 16) | (mix(gr) << 8) | mix(b);
  };
}

// ------------------------------------------------------------------
// Things every scene has: sun and hills
// ------------------------------------------------------------------
function drawSun(g, tone, x, y) {
  g.fillStyle(tone(0xfff3a0), 0.5);
  g.fillCircle(x, y, 62);
  g.fillStyle(tone(0xffd93d), 1);
  g.fillCircle(x, y, 40);
}

function drawHills(g, tone, span) {
  // Far hills (light) and near hills (darker) make the world feel deep
  for (let x = -100, i = 0; x < span + 200; x += 240, i++) {
    g.fillStyle(tone(0x8fc9a0), 1);
    g.fillEllipse(x, 600, 520, 220 + pseudoRandom(i + 3) * 90);
  }
  for (let x = 40, i = 0; x < span + 200; x += 300, i++) {
    g.fillStyle(tone(0x58a468), 1);
    g.fillEllipse(x, 620, 560, 190 + pseudoRandom(i + 11) * 70);
  }
}

// ------------------------------------------------------------------
// MÉXICO — Chichén Itzá (the pyramid "El Castillo") in the jungle
// ------------------------------------------------------------------
function drawJungle(g, tone, span) {
  for (let x = 20, i = 0; x < span + 100; x += 95, i++) {
    const height = 55 + pseudoRandom(i + 1) * 60;
    const px = x + pseudoRandom(i + 7) * 40;
    // Trunk
    g.fillStyle(tone(0x7a5230), 1);
    g.fillRect(px - 4, GROUND - height, 8, height);
    // Leaves: three green balls
    g.fillStyle(tone(0x2e8b3d), 1);
    g.fillCircle(px, GROUND - height - 8, 26);
    g.fillStyle(tone(0x3fa34d), 1);
    g.fillCircle(px - 16, GROUND - height + 4, 18);
    g.fillCircle(px + 16, GROUND - height + 4, 18);
  }
}

function drawChichen(g, tone, cx, y, s) {
  const tiers = 5;
  const tierHeight = 34 * s;
  const stone = tone(0xdcc88e);
  const shadow = tone(0xb39b62);

  // The steps of the pyramid, from the big one at the bottom to the small top
  for (let i = 0; i < tiers; i++) {
    const w = (250 - i * 40) * s;
    const top = y - (i + 1) * tierHeight;
    g.fillStyle(stone, 1);
    g.fillRect(cx - w / 2, top, w, tierHeight);
    // The right side is in the shade
    g.fillStyle(shadow, 1);
    g.fillRect(cx + w / 4, top, w / 4, tierHeight);
  }

  // The big staircase in the middle, with its little steps
  const stairTop = y - tiers * tierHeight;
  g.fillStyle(tone(0xf0e6bf), 1);
  g.fillRect(cx - 17 * s, stairTop, 34 * s, tiers * tierHeight);
  g.fillStyle(shadow, 1);
  for (let sy = stairTop; sy < y; sy += 9 * s) {
    g.fillRect(cx - 17 * s, sy, 34 * s, 2 * s);
  }

  // The temple on top: walls, a dark door and a roof
  g.fillStyle(stone, 1);
  g.fillRect(cx - 28 * s, stairTop - 38 * s, 56 * s, 38 * s);
  g.fillStyle(tone(0x4a3a20), 1);
  g.fillRect(cx - 9 * s, stairTop - 28 * s, 18 * s, 28 * s);
  g.fillStyle(shadow, 1);
  g.fillRect(cx - 34 * s, stairTop - 46 * s, 68 * s, 8 * s);
  g.fillStyle(stone, 1);
  g.fillRect(cx - 14 * s, stairTop - 56 * s, 28 * s, 10 * s);
}

// ------------------------------------------------------------------
// ESTADOS UNIDOS — the Statue of Liberty with the New York skyline
// ------------------------------------------------------------------
function drawSkyline(g, tone, span, spots) {
  const colors = [0x6f7f9c, 0x8393ad, 0x5e6e8a];
  for (let x = 0, i = 0; x < span + 100; x += 62, i++) {
    // Leave an empty space around the statue, so it can be seen!
    if (spots.some((spot) => Math.abs(x - spot) < 130)) continue;
    const w = 40 + pseudoRandom(i + 2) * 30;
    const h = 90 + pseudoRandom(i + 5) * 140;
    g.fillStyle(tone(colors[i % colors.length]), 1);
    g.fillRect(x, GROUND - h, w, h);
    // Windows with the lights on
    g.fillStyle(tone(0xffeeaa), 1);
    for (let wy = GROUND - h + 10; wy < GROUND - 10; wy += 16) {
      for (let wx = x + 6; wx < x + w - 8; wx += 12) {
        g.fillRect(wx, wy, 5, 7);
      }
    }
    // Every few buildings: a stepped tower with an antenna (like the Empire State)
    if (i % 5 === 3) {
      g.fillStyle(tone(colors[i % colors.length]), 1);
      g.fillRect(x + w * 0.25, GROUND - h - 30, w * 0.5, 30);
      g.fillRect(x + w * 0.4, GROUND - h - 55, w * 0.2, 25);
      g.fillRect(x + w * 0.48, GROUND - h - 90, 3, 35);
    }
  }
}

function drawLibertad(g, tone, cx, y, s) {
  const stone = tone(0xcfcfc0);
  const stoneShade = tone(0xa9a99a);
  const green = tone(0x66bfa6);
  const greenShade = tone(0x4a9a85);

  // Base: two wide steps and the tall pedestal
  g.fillStyle(stoneShade, 1);
  g.fillRect(cx - 90 * s, y - 22 * s, 180 * s, 22 * s);
  g.fillStyle(stone, 1);
  g.fillRect(cx - 62 * s, y - 48 * s, 124 * s, 26 * s);
  polygon(g, stone, [
    [cx - 46 * s, y - 48 * s], [cx + 46 * s, y - 48 * s],
    [cx + 38 * s, y - 118 * s], [cx - 38 * s, y - 118 * s],
  ]);
  polygon(g, stoneShade, [ // the shaded right half
    [cx + 8 * s, y - 48 * s], [cx + 46 * s, y - 48 * s],
    [cx + 38 * s, y - 118 * s], [cx + 8 * s, y - 118 * s],
  ]);
  g.fillStyle(stoneShade, 1);
  g.fillRect(cx - 44 * s, y - 126 * s, 88 * s, 8 * s);

  // The robe (wider at the bottom)
  polygon(g, green, [
    [cx - 30 * s, y - 126 * s], [cx + 30 * s, y - 126 * s],
    [cx + 20 * s, y - 240 * s], [cx - 20 * s, y - 240 * s],
  ]);
  polygon(g, greenShade, [ // folds on the right
    [cx + 6 * s, y - 126 * s], [cx + 30 * s, y - 126 * s],
    [cx + 20 * s, y - 240 * s], [cx + 6 * s, y - 240 * s],
  ]);

  // The arm holding the book (the tablet)
  polygon(g, green, [
    [cx - 18 * s, y - 238 * s], [cx - 8 * s, y - 238 * s],
    [cx - 26 * s, y - 196 * s], [cx - 36 * s, y - 200 * s],
  ]);
  polygon(g, greenShade, [
    [cx - 42 * s, y - 204 * s], [cx - 20 * s, y - 198 * s],
    [cx - 24 * s, y - 166 * s], [cx - 46 * s, y - 172 * s],
  ]);

  // The head and the crown with its rays
  g.fillStyle(green, 1);
  g.fillCircle(cx, y - 256 * s, 14 * s);
  for (let k = 0; k < 7; k++) {
    const angle = Phaser.Math.DegToRad(-160 + k * 23.3);
    const a1 = angle - 0.1;
    const a2 = angle + 0.1;
    g.fillStyle(green, 1);
    g.fillTriangle(
      cx + Math.cos(a1) * 12 * s, y - 256 * s + Math.sin(a1) * 12 * s,
      cx + Math.cos(a2) * 12 * s, y - 256 * s + Math.sin(a2) * 12 * s,
      cx + Math.cos(angle) * 32 * s, y - 256 * s + Math.sin(angle) * 32 * s
    );
  }

  // The arm raised high, with the golden torch and its flame
  polygon(g, green, [
    [cx + 12 * s, y - 240 * s], [cx + 26 * s, y - 234 * s],
    [cx + 46 * s, y - 322 * s], [cx + 34 * s, y - 326 * s],
  ]);
  g.fillStyle(tone(0xe6b422), 1);
  g.fillRect(cx + 31 * s, y - 342 * s, 18 * s, 14 * s);
  g.fillTriangle(
    cx + 40 * s, y - 382 * s, cx + 30 * s, y - 342 * s, cx + 50 * s, y - 342 * s
  );
  g.fillStyle(tone(0xff8a1f), 1);
  g.fillTriangle(
    cx + 40 * s, y - 376 * s, cx + 33 * s, y - 345 * s, cx + 47 * s, y - 345 * s
  );
  g.fillStyle(tone(0xffe14d), 1);
  g.fillCircle(cx + 40 * s, y - 354 * s, 6 * s);
}

// ------------------------------------------------------------------
// CANADÁ — the CN Tower, the Rocky Mountains and a big maple leaf
// ------------------------------------------------------------------
function drawRockies(g, tone, span) { // (the mountains are in the back, no gap needed)
  for (let x = -60, i = 0; x < span + 200; x += 170, i++) {
    const h = 150 + pseudoRandom(i + 4) * 110;
    const half = 120 + pseudoRandom(i + 9) * 40;
    polygon(g, tone(0x8fa0b6), [[x - half, GROUND], [x, GROUND - h], [x + half, GROUND]]);
    polygon(g, tone(0x71839b), [[x, GROUND], [x, GROUND - h], [x + half, GROUND]]); // shaded side
    // Snow on top
    polygon(g, tone(0xffffff), [
      [x - half * 0.3, GROUND - h * 0.7], [x, GROUND - h], [x + half * 0.3, GROUND - h * 0.7],
      [x + half * 0.12, GROUND - h * 0.78], [x, GROUND - h * 0.68], [x - half * 0.14, GROUND - h * 0.78],
    ]);
  }

  // A big red maple leaf in the sky
  const leaf = [
    [0, -1], [0.14, -0.72], [0.34, -0.8], [0.3, -0.36], [0.55, -0.5], [0.52, -0.2],
    [0.9, -0.1], [0.72, 0.1], [0.8, 0.25], [0.4, 0.3], [0.46, 0.48], [0.08, 0.42],
    [0.08, 0.9], [-0.08, 0.9], [-0.08, 0.42], [-0.46, 0.48], [-0.4, 0.3], [-0.8, 0.25],
    [-0.72, 0.1], [-0.9, -0.1], [-0.52, -0.2], [-0.55, -0.5], [-0.3, -0.36],
    [-0.34, -0.8], [-0.14, -0.72],
  ];
  const lx = span * 0.42;
  const ly = 150;
  const size = 62;
  polygon(g, tone(0xd8261e), leaf.map(([px, py]) => [lx + px * size, ly + py * size]));
}

function drawCnTower(g, tone, cx, y, s) {
  const concrete = tone(0xcdd2d8);
  const shade = tone(0xa4abb4);

  // The wide legs at the bottom and the thin shaft going up
  polygon(g, concrete, [
    [cx - 28 * s, y], [cx + 28 * s, y], [cx + 9 * s, y - 70 * s], [cx - 9 * s, y - 70 * s],
  ]);
  polygon(g, concrete, [
    [cx - 9 * s, y - 70 * s], [cx + 9 * s, y - 70 * s],
    [cx + 3.5 * s, y - 255 * s], [cx - 3.5 * s, y - 255 * s],
  ]);
  polygon(g, shade, [
    [cx, y - 70 * s], [cx + 9 * s, y - 70 * s],
    [cx + 3.5 * s, y - 255 * s], [cx, y - 255 * s],
  ]);

  // The big round deck (the "pod") with its windows
  g.fillStyle(concrete, 1);
  g.fillEllipse(cx, y - 266 * s, 52 * s, 16 * s);
  g.fillStyle(tone(0x5a7a99), 1);
  g.fillRect(cx - 22 * s, y - 276 * s, 44 * s, 8 * s);
  g.fillStyle(concrete, 1);
  g.fillEllipse(cx, y - 282 * s, 40 * s, 12 * s);

  // The small upper deck and the long antenna with a red light on top
  g.fillEllipse(cx, y - 312 * s, 14 * s, 10 * s);
  g.fillRect(cx - 1.5 * s, y - 392 * s, 3 * s, 82 * s);
  g.fillStyle(tone(0xff3030), 1);
  g.fillCircle(cx, y - 394 * s, 3 * s);
}

// ------------------------------------------------------------------
// The list of landmarks: name (used in countryThemes.js) → how to draw it
//   background: things that fill the whole width (behind the landmark)
//   landmark:   the famous building, drawn two times (near and far)
// ------------------------------------------------------------------
const LANDMARKS = {
  chichen: { background: drawJungle, landmark: drawChichen, size: 1.0 },
  libertad: { background: drawSkyline, landmark: drawLibertad, size: 1.0 },
  cntower: { background: drawRockies, landmark: drawCnTower, size: 1.0 },
  generic: { background: null, landmark: null, size: 1 }, // countries with no landmark yet
};

// Draw the whole scenery on a Graphics object.
//   span:       how wide the picture has to be (the background moves slowly,
//               so it never needs to be as wide as the whole level)
//   colored:    true = real colors, false = the gray version
//   saturation: how much color is left in the gray version (0 to 1)
export function drawLandmarkScene(g, themeKey, span, colored, saturation = 0) {
  const tone = makeTone(colored, saturation);
  const art = LANDMARKS[themeKey] || LANDMARKS.generic;

  drawSun(g, tone, span * 0.86, 110);
  drawHills(g, tone, span);
  // One landmark close to the start, and a smaller one further away
  const spots = [span * 0.28, span * 0.78];
  if (art.background) art.background(g, tone, span, spots);

  if (art.landmark) {
    art.landmark(g, tone, spots[0], GROUND, art.size);
    art.landmark(g, tone, spots[1], GROUND, art.size * 0.7);
  }
}
