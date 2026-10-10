// LandmarkArt.js — Draws the scenery behind the levels of a country!
// Chichén Itzá for México, the Statue of Liberty for the USA, the CN Tower
// for Canada, the Eiffel Tower for France, the pyramids for Egypt, the Great
// Wall for China, Christ the Redeemer for Brazil, Machu Picchu for Peru,
// Mount Fuji for Japan, Big Ben for the UK, the Opera House for Australia,
// the Colosseum for Italy, the Taj Mahal for India, the Obelisk for Argentina
// and the Parthenon for Greece... everything is drawn with simple shapes
// (no image files).
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
// Helpers shared by several countries
// ------------------------------------------------------------------

// Is x too close to one of the landmark spots? (so the background leaves a gap)
const nearSpot = (spots, x, gap) => spots.some((spot) => Math.abs(x - spot) < gap);

// A strip of blue sea along the bottom, with light little waves
function drawSea(g, tone, span) {
  g.fillStyle(tone(0x3f8fd0), 1);
  g.fillRect(0, GROUND - 40, span + 200, 80);
  g.fillStyle(tone(0x8cc8f0), 1);
  for (let x = 10, i = 0; x < span + 200; x += 70, i++) {
    g.fillRect(x, GROUND - 30 + pseudoRandom(i + 3) * 25, 28, 3);
  }
}

// ------------------------------------------------------------------
// FRANCIA — the Eiffel Tower
// ------------------------------------------------------------------
function drawEiffel(g, tone, cx, y, s) {
  const iron = tone(0x8a6e4b);
  const shade = tone(0x6e5638);

  // The four legs (we only see two from the front), wide apart at the bottom
  polygon(g, iron, [[cx - 85 * s, y], [cx - 55 * s, y], [cx - 24 * s, y - 110 * s], [cx - 46 * s, y - 110 * s]]);
  polygon(g, shade, [[cx + 85 * s, y], [cx + 55 * s, y], [cx + 24 * s, y - 110 * s], [cx + 46 * s, y - 110 * s]]);
  // The big arch between the legs
  polygon(g, iron, [
    [cx - 52 * s, y - 70 * s], [cx - 25 * s, y - 92 * s], [cx, y - 96 * s],
    [cx + 25 * s, y - 92 * s], [cx + 52 * s, y - 70 * s], [cx + 46 * s, y - 100 * s], [cx - 46 * s, y - 100 * s],
  ]);

  // The first floor (a wide platform)
  g.fillStyle(iron, 1);
  g.fillRect(cx - 54 * s, y - 116 * s, 108 * s, 12 * s);

  // The middle part, getting thinner, with crossed bars
  polygon(g, iron, [[cx - 38 * s, y - 116 * s], [cx + 38 * s, y - 116 * s], [cx + 16 * s, y - 228 * s], [cx - 16 * s, y - 228 * s]]);
  polygon(g, shade, [[cx, y - 116 * s], [cx + 38 * s, y - 116 * s], [cx + 16 * s, y - 228 * s], [cx, y - 228 * s]]);
  g.fillStyle(tone(0x5a4630), 1);
  for (let k = 1; k < 4; k++) {
    const by = y - 116 * s - k * 28 * s;
    const half = (38 - k * 5.5) * s;
    g.fillRect(cx - half, by, half * 2, 3 * s);
  }

  // The second floor
  g.fillStyle(iron, 1);
  g.fillRect(cx - 24 * s, y - 236 * s, 48 * s, 9 * s);

  // The tall thin top and the little flag pole
  polygon(g, iron, [[cx - 14 * s, y - 236 * s], [cx + 14 * s, y - 236 * s], [cx + 3 * s, y - 350 * s], [cx - 3 * s, y - 350 * s]]);
  polygon(g, shade, [[cx, y - 236 * s], [cx + 14 * s, y - 236 * s], [cx + 3 * s, y - 350 * s], [cx, y - 350 * s]]);
  g.fillRect(cx - 6 * s, y - 358 * s, 12 * s, 8 * s); // the top floor
  g.fillRect(cx - 1.5 * s, y - 388 * s, 3 * s, 30 * s); // the antenna
}

// ------------------------------------------------------------------
// EGIPTO — the pyramids of Giza in the desert, with palm trees
// ------------------------------------------------------------------
function drawDesert(g, tone, span, spots) {
  // Sand dunes that cover the green hills
  for (let x = -100, i = 0; x < span + 200; x += 260, i++) {
    g.fillStyle(tone(0xe8c77a), 1);
    g.fillEllipse(x, 610, 560, 200 + pseudoRandom(i + 2) * 80);
    g.fillStyle(tone(0xd9b25e), 1);
    g.fillEllipse(x + 130, 625, 480, 140 + pseudoRandom(i + 6) * 50);
  }

  // Palm trees (but not in front of the pyramids)
  for (let x = 40, i = 0; x < span + 100; x += 150, i++) {
    if (nearSpot(spots, x, 230)) continue;
    const h = 70 + pseudoRandom(i + 4) * 40;
    // The trunk
    g.fillStyle(tone(0x8a6238), 1);
    g.fillRect(x - 4, GROUND - h, 8, h);
    // The leaves: thin green triangles hanging all around the top
    g.fillStyle(tone(0x3c9a46), 1);
    for (let k = -2; k <= 2; k++) {
      g.fillTriangle(x - 4, GROUND - h, x + 4, GROUND - h, x + k * 22, GROUND - h + 18 - Math.abs(k) * 4);
      g.fillTriangle(x - 3, GROUND - h - 4, x + 3, GROUND - h + 4, x + k * 14, GROUND - h - 22 + Math.abs(k) * 6);
    }
  }
}

// One pyramid: a sunny left side and a shaded right side
function pyramid(g, tone, cx, y, half, h) {
  polygon(g, tone(0xe2bf72), [[cx - half, y], [cx, y - h], [cx + half, y]]);
  polygon(g, tone(0xb8924a), [[cx, y - h], [cx + half, y], [cx + half * 0.25, y]]);
}

function drawPyramids(g, tone, cx, y, s) {
  // The middle-sized one at the back, the giant one, and the little one in front
  pyramid(g, tone, cx + 120 * s, y, 85 * s, 125 * s);
  pyramid(g, tone, cx, y, 135 * s, 200 * s);
  pyramid(g, tone, cx - 125 * s, y, 55 * s, 75 * s);
}

// ------------------------------------------------------------------
// CHINA — the Great Wall going up and down the mountains
// ------------------------------------------------------------------
function drawGreatWall(g, tone, cx, y, s) {
  // The top line of the mountains (the wall walks on it)
  const ridge = [
    [cx - 170 * s, y - 20 * s], [cx - 80 * s, y - 160 * s], [cx + 10 * s, y - 85 * s],
    [cx + 95 * s, y - 210 * s], [cx + 170 * s, y - 30 * s],
  ];

  // The rocky mountains (with the right half of each one in the shade)
  polygon(g, tone(0x8c9a80), [[cx - 190 * s, y], ...ridge, [cx + 190 * s, y]]);
  polygon(g, tone(0x6e7c64), [[cx - 80 * s, y - 160 * s], [cx + 10 * s, y - 85 * s], [cx - 20 * s, y]]);
  polygon(g, tone(0x6e7c64), [[cx + 95 * s, y - 210 * s], [cx + 170 * s, y - 30 * s], [cx + 190 * s, y], [cx + 70 * s, y]]);

  // The wall: a thick stone band on top of the ridge, with little teeth
  const stone = tone(0xc4a87c);
  for (let i = 0; i < ridge.length - 1; i++) {
    const [x1, y1] = ridge[i];
    const [x2, y2] = ridge[i + 1];
    polygon(g, stone, [[x1, y1 - 6 * s], [x2, y2 - 6 * s], [x2, y2 + 10 * s], [x1, y1 + 10 * s]]);
    // The teeth on top (called "battlements")
    g.fillStyle(stone, 1);
    for (let t = 0; t < 1; t += 0.12) {
      g.fillRect(x1 + (x2 - x1) * t - 2 * s, y1 + (y2 - y1) * t - 12 * s, 5 * s, 7 * s);
    }
  }

  // Watchtowers on the high points
  [ridge[1], ridge[3]].forEach(([tx, ty]) => {
    g.fillStyle(tone(0xb0946a), 1);
    g.fillRect(tx - 15 * s, ty - 40 * s, 30 * s, 44 * s);
    g.fillStyle(tone(0x4a3a28), 1);
    g.fillRect(tx - 4 * s, ty - 28 * s, 8 * s, 12 * s); // a dark window
    g.fillStyle(tone(0xb0946a), 1);
    for (let k = -1; k <= 1; k++) g.fillRect(tx + k * 11 * s - 3 * s, ty - 47 * s, 6 * s, 7 * s);
  });
}

// ------------------------------------------------------------------
// BRASIL — Christ the Redeemer on his mountain, and the Sugarloaf by the sea
// ------------------------------------------------------------------
function drawRioBay(g, tone, span, spots) {
  // The round "Sugarloaf" mountains (Pan de Azúcar), away from the statue
  for (let x = 60, i = 0; x < span + 100; x += 280, i++) {
    if (nearSpot(spots, x, 230)) continue;
    g.fillStyle(tone(0x5f7f5a), 1);
    g.fillEllipse(x, GROUND - 30, 110, 250 + pseudoRandom(i + 1) * 40);
    g.fillStyle(tone(0x6e9068), 1);
    g.fillEllipse(x + 95, GROUND - 20, 100, 140);
  }
  drawSea(g, tone, span);
}

function drawCristo(g, tone, cx, y, s) {
  const white = tone(0xe8e4d8);
  const shade = tone(0xc4bfae);

  // The mountain (Corcovado) with its shaded right side
  polygon(g, tone(0x4f8f4a), [[cx - 160 * s, y], [cx - 50 * s, y - 165 * s], [cx - 15 * s, y - 185 * s], [cx + 20 * s, y - 180 * s], [cx + 160 * s, y]]);
  polygon(g, tone(0x3c7238), [[cx + 20 * s, y - 180 * s], [cx + 160 * s, y], [cx + 30 * s, y]]);

  // The pedestal on the top
  g.fillStyle(shade, 1);
  g.fillRect(cx - 12 * s, y - 208 * s, 24 * s, 26 * s);

  // The long robe
  polygon(g, white, [[cx - 15 * s, y - 208 * s], [cx + 15 * s, y - 208 * s], [cx + 9 * s, y - 290 * s], [cx - 9 * s, y - 290 * s]]);
  polygon(g, shade, [[cx + 3 * s, y - 208 * s], [cx + 15 * s, y - 208 * s], [cx + 9 * s, y - 290 * s], [cx + 3 * s, y - 290 * s]]);

  // The open arms (a big cross shape) and the hands
  g.fillStyle(white, 1);
  g.fillRect(cx - 62 * s, y - 292 * s, 124 * s, 11 * s);
  g.fillCircle(cx - 62 * s, y - 286 * s, 5 * s);
  g.fillCircle(cx + 62 * s, y - 286 * s, 5 * s);

  // The head
  g.fillCircle(cx, y - 302 * s, 9 * s);
}

// ------------------------------------------------------------------
// PERÚ — Machu Picchu: stone ruins, green terraces and a pointy mountain
// ------------------------------------------------------------------
function drawMachuPicchu(g, tone, cx, y, s) {
  // Huayna Picchu, the tall pointy mountain at the back
  polygon(g, tone(0x3f7a45), [[cx + 10 * s, y - 100 * s], [cx + 75 * s, y - 310 * s], [cx + 100 * s, y - 330 * s], [cx + 120 * s, y - 305 * s], [cx + 185 * s, y - 100 * s]]);
  polygon(g, tone(0x2f5f35), [[cx + 100 * s, y - 330 * s], [cx + 120 * s, y - 305 * s], [cx + 185 * s, y - 100 * s], [cx + 110 * s, y - 100 * s]]);

  // The flat mountain where the city was built
  polygon(g, tone(0x7f8f5a), [[cx - 175 * s, y], [cx - 150 * s, y - 110 * s], [cx + 185 * s, y - 110 * s], [cx + 190 * s, y]]);

  // The terraces: steps of grass held up by stone walls (for farming!)
  for (let i = 0; i < 5; i++) {
    const top = y - 22 * s * (i + 1);
    const left = cx - 165 * s + i * 16 * s;
    g.fillStyle(tone(0x7cc06a), 1);
    g.fillRect(left, top, cx - 30 * s - left, 22 * s);
    g.fillStyle(tone(0x9c9584), 1);
    g.fillRect(left, top, cx - 30 * s - left, 4 * s);
  }

  // The stone houses (their roofs fell down long ago, only the walls are left)
  for (let k = 0; k < 5; k++) {
    const hx = cx - 20 * s + k * 38 * s;
    const hTop = y - 110 * s - (20 + (k % 2) * 8) * s;
    g.fillStyle(tone(0xa8a294), 1);
    g.fillRect(hx, hTop, 28 * s, y - 110 * s - hTop);
    g.fillTriangle(hx, hTop, hx + 28 * s, hTop, hx + 14 * s, hTop - 12 * s); // the pointy wall
    g.fillStyle(tone(0x4a453c), 1);
    g.fillRect(hx + 10 * s, hTop + 6 * s, 8 * s, y - 110 * s - hTop - 6 * s); // a door
  }
}

// ------------------------------------------------------------------
// JAPÓN — Mount Fuji with a red torii gate
// ------------------------------------------------------------------
function drawFuji(g, tone, cx, y, s) {
  // The volcano: flat top, sunny left side and shaded right side
  polygon(g, tone(0x6f7fa8), [[cx - 160 * s, y], [cx - 35 * s, y - 230 * s], [cx + 35 * s, y - 230 * s], [cx + 160 * s, y]]);
  polygon(g, tone(0x56658c), [[cx, y - 230 * s], [cx + 35 * s, y - 230 * s], [cx + 160 * s, y], [cx + 20 * s, y]]);

  // The snow on top, with a wavy bottom edge
  polygon(g, tone(0xffffff), [
    [cx - 35 * s, y - 230 * s], [cx + 35 * s, y - 230 * s], [cx + 75 * s, y - 160 * s],
    [cx + 50 * s, y - 172 * s], [cx + 30 * s, y - 155 * s], [cx + 8 * s, y - 175 * s],
    [cx - 15 * s, y - 158 * s], [cx - 38 * s, y - 175 * s], [cx - 58 * s, y - 158 * s], [cx - 75 * s, y - 160 * s],
  ]);

  // The red torii gate in front: two posts and two beams
  const red = tone(0xd8322a);
  const gx = cx - 100 * s;
  g.fillStyle(red, 1);
  g.fillRect(gx - 28 * s, y - 85 * s, 8 * s, 85 * s);
  g.fillRect(gx + 20 * s, y - 85 * s, 8 * s, 85 * s);
  g.fillRect(gx - 36 * s, y - 72 * s, 72 * s, 7 * s);
  // The top beam curves up at the ends
  polygon(g, tone(0x2b2b2b), [[gx - 48 * s, y - 100 * s], [gx + 48 * s, y - 100 * s], [gx + 40 * s, y - 92 * s], [gx - 40 * s, y - 92 * s]]);
  g.fillStyle(red, 1);
  g.fillRect(gx - 40 * s, y - 92 * s, 80 * s, 7 * s);
}

// ------------------------------------------------------------------
// REINO UNIDO — Big Ben and the Parliament building
// ------------------------------------------------------------------
function drawBigBen(g, tone, cx, y, s) {
  const stone = tone(0xc9a86a);
  const shade = tone(0xa5884f);
  const dark = tone(0x3e4a44);

  // The long Parliament building on the left, with windows and little towers
  g.fillStyle(stone, 1);
  g.fillRect(cx - 180 * s, y - 90 * s, 160 * s, 90 * s);
  g.fillStyle(shade, 1);
  for (let wx = cx - 172 * s; wx < cx - 30 * s; wx += 14 * s) {
    g.fillRect(wx, y - 78 * s, 5 * s, 60 * s); // tall thin windows
  }
  g.fillStyle(stone, 1);
  for (let k = 0; k < 5; k++) {
    const tx = cx - 175 * s + k * 36 * s;
    g.fillRect(tx, y - 106 * s, 6 * s, 16 * s);
    g.fillTriangle(tx - 1 * s, y - 106 * s, tx + 7 * s, y - 106 * s, tx + 3 * s, y - 118 * s);
  }

  // The tower: a long body with lines on it
  g.fillStyle(stone, 1);
  g.fillRect(cx - 20 * s, y - 232 * s, 40 * s, 232 * s);
  g.fillStyle(shade, 1);
  g.fillRect(cx + 6 * s, y - 232 * s, 14 * s, 232 * s);
  for (let ly = y - 30 * s; ly > y - 230 * s; ly -= 30 * s) g.fillRect(cx - 20 * s, ly, 40 * s, 3 * s);

  // The clock part (a bit wider) and the clock face with its hands
  g.fillStyle(stone, 1);
  g.fillRect(cx - 26 * s, y - 284 * s, 52 * s, 52 * s);
  g.fillStyle(tone(0xfaf6e8), 1);
  g.fillCircle(cx, y - 258 * s, 19 * s);
  g.fillStyle(dark, 1);
  g.fillRect(cx - 1.5 * s, y - 272 * s, 3 * s, 14 * s); // big hand
  g.fillRect(cx, y - 259.5 * s, 10 * s, 3 * s); // small hand

  // The bell room with its dark arches
  g.fillStyle(stone, 1);
  g.fillRect(cx - 22 * s, y - 306 * s, 44 * s, 22 * s);
  g.fillStyle(dark, 1);
  for (let k = -1; k <= 1; k++) g.fillRect(cx + k * 12 * s - 3 * s, y - 302 * s, 6 * s, 14 * s);

  // The pointy roof and the tiny spike on top
  polygon(g, dark, [[cx - 25 * s, y - 306 * s], [cx + 25 * s, y - 306 * s], [cx, y - 372 * s]]);
  g.fillRect(cx - 1 * s, y - 392 * s, 2 * s, 22 * s);
}

// ------------------------------------------------------------------
// AUSTRALIA — the Sydney Opera House by the sea (and the Harbour Bridge)
// ------------------------------------------------------------------
function drawHarbour(g, tone, span, spots) {
  drawSea(g, tone, span);

  // The Harbour Bridge: a big steel arch, right between the two landmarks
  const bx = (spots[0] + spots[1]) / 2;
  g.lineStyle(7, tone(0x5b6470), 1);
  g.beginPath();
  g.arc(bx, GROUND - 30, 150, Math.PI, Math.PI * 2);
  g.strokePath();
  g.fillStyle(tone(0x5b6470), 1);
  g.fillRect(bx - 190, GROUND - 70, 380, 8); // the road
  g.fillStyle(tone(0xcfc2a0), 1);
  g.fillRect(bx - 185, GROUND - 100, 22, 70); // the stone towers at both ends
  g.fillRect(bx + 163, GROUND - 100, 22, 70);
}

// One "sail" (shell) of the Opera House: a straight front and a round back
function sail(g, tone, x, base, w, h) {
  polygon(g, tone(0xf4f2ea), [[x, base], [x + w, base], [x + w * 0.8, base - h * 0.5], [x + w * 0.45, base - h * 0.88], [x, base - h]]);
  polygon(g, tone(0xd2cfc4), [[x, base], [x + w * 0.35, base], [x, base - h * 0.75]]); // the shadow inside
}

function drawOpera(g, tone, cx, y, s) {
  // The big platform the building stands on
  g.fillStyle(tone(0xd9b98a), 1);
  g.fillRect(cx - 140 * s, y - 40 * s, 280 * s, 40 * s);
  g.fillStyle(tone(0xb89a6c), 1);
  g.fillRect(cx - 140 * s, y - 14 * s, 280 * s, 14 * s);

  // The shells: a big group on the left and a smaller one on the right
  const base = y - 40 * s;
  sail(g, tone, cx - 120 * s, base, 60 * s, 95 * s);
  sail(g, tone, cx - 80 * s, base, 70 * s, 140 * s);
  sail(g, tone, cx - 30 * s, base, 55 * s, 105 * s);
  sail(g, tone, cx + 35 * s, base, 50 * s, 80 * s);
  sail(g, tone, cx + 70 * s, base, 55 * s, 110 * s);
}

// ------------------------------------------------------------------
// ITALIA — the Colosseum (one side is broken, it is almost 2000 years old!)
// ------------------------------------------------------------------
function drawColiseo(g, tone, cx, y, s) {
  const stone = tone(0xd9b98a);
  const dark = tone(0x7a5c3c);

  // The wall: tall on the left, broken and lower on the right
  polygon(g, stone, [
    [cx - 150 * s, y], [cx + 150 * s, y], [cx + 150 * s, y - 95 * s], [cx + 115 * s, y - 105 * s],
    [cx + 90 * s, y - 140 * s], [cx + 45 * s, y - 150 * s], [cx + 25 * s, y - 175 * s], [cx - 150 * s, y - 175 * s],
  ]);

  // Three rows of round arches (fewer on the right, where the wall is broken)
  for (let row = 0; row < 3; row++) {
    const bottom = y - row * 45 * s;
    const lastX = cx + (130 - row * 55) * s;
    g.fillStyle(tone(0xc4a476), 1);
    g.fillRect(cx - 150 * s, bottom - 45 * s, 300 * s - row * 55 * s, 4 * s); // the ledge
    g.fillStyle(dark, 1);
    for (let ax = cx - 140 * s; ax < lastX; ax += 24 * s) {
      g.fillRect(ax, bottom - 32 * s, 13 * s, 26 * s);
      g.fillCircle(ax + 6.5 * s, bottom - 32 * s, 6.5 * s);
    }
  }

  // The top floor only has small square windows
  g.fillStyle(dark, 1);
  for (let wx = cx - 136 * s; wx < cx + 15 * s; wx += 30 * s) {
    g.fillRect(wx, y - 162 * s, 9 * s, 9 * s);
  }
}

// ------------------------------------------------------------------
// INDIA — the Taj Mahal
// ------------------------------------------------------------------
function drawTajMahal(g, tone, cx, y, s) {
  const white = tone(0xf3efe6);
  const shade = tone(0xd8d2c4);
  const arch = tone(0x8a8f9c);

  // The wide platform
  g.fillStyle(shade, 1);
  g.fillRect(cx - 150 * s, y - 24 * s, 300 * s, 24 * s);

  // The two thin towers (minarets) at the sides, with little domes
  [-138, 138].forEach((dx) => {
    const mx = cx + dx * s;
    polygon(g, white, [[mx - 7 * s, y - 24 * s], [mx + 7 * s, y - 24 * s], [mx + 5 * s, y - 200 * s], [mx - 5 * s, y - 200 * s]]);
    g.fillStyle(shade, 1);
    for (let by = y - 70 * s; by > y - 200 * s; by -= 45 * s) g.fillRect(mx - 8 * s, by, 16 * s, 4 * s);
    g.fillStyle(white, 1);
    g.fillEllipse(mx, y - 206 * s, 14 * s, 14 * s);
  });

  // The main building, with one big arch and smaller ones at the sides
  g.fillStyle(white, 1);
  g.fillRect(cx - 80 * s, y - 134 * s, 160 * s, 110 * s);
  g.fillStyle(arch, 1);
  g.fillRect(cx - 18 * s, y - 100 * s, 36 * s, 76 * s);
  g.fillTriangle(cx - 18 * s, y - 100 * s, cx + 18 * s, y - 100 * s, cx, y - 118 * s);
  [-56, -38, 38, 56].forEach((dx) => {
    g.fillRect(cx + dx * s - 6 * s, y - 70 * s, 12 * s, 30 * s);
    g.fillRect(cx + dx * s - 6 * s, y - 120 * s, 12 * s, 30 * s);
  });

  // The big round "onion" dome, with a golden point on top
  g.fillStyle(white, 1);
  g.fillRect(cx - 40 * s, y - 152 * s, 80 * s, 18 * s); // the drum under the dome
  g.fillEllipse(cx, y - 196 * s, 110 * s, 100 * s);
  g.fillTriangle(cx - 22 * s, y - 236 * s, cx + 22 * s, y - 236 * s, cx, y - 262 * s);
  g.fillStyle(shade, 1);
  g.fillStyle(tone(0xe6b422), 1);
  g.fillRect(cx - 1.5 * s, y - 282 * s, 3 * s, 22 * s);

  // Small domes on the corners of the roof
  g.fillStyle(white, 1);
  [-66, 66].forEach((dx) => g.fillEllipse(cx + dx * s, y - 144 * s, 24 * s, 22 * s));
}

// ------------------------------------------------------------------
// ARGENTINA — the Obelisk of Buenos Aires, in the middle of the city
// ------------------------------------------------------------------
function drawObelisco(g, tone, cx, y, s) {
  const white = tone(0xf1efe8);
  const shade = tone(0xcdc9bd);

  // The little base
  g.fillStyle(shade, 1);
  g.fillRect(cx - 32 * s, y - 10 * s, 64 * s, 10 * s);

  // The tall shaft, a little thinner at the top
  polygon(g, white, [[cx - 19 * s, y - 10 * s], [cx + 19 * s, y - 10 * s], [cx + 12 * s, y - 330 * s], [cx - 12 * s, y - 330 * s]]);
  polygon(g, shade, [[cx + 3 * s, y - 10 * s], [cx + 19 * s, y - 10 * s], [cx + 12 * s, y - 330 * s], [cx + 3 * s, y - 330 * s]]);

  // The pointy tip and its little window
  polygon(g, white, [[cx - 12 * s, y - 330 * s], [cx + 12 * s, y - 330 * s], [cx, y - 362 * s]]);
  g.fillStyle(tone(0x4a4a55), 1);
  g.fillRect(cx - 3 * s, y - 318 * s, 6 * s, 8 * s);

  // A small Argentine flag at the bottom: light blue, white, light blue and the sun
  const fx = cx + 40 * s;
  g.fillStyle(tone(0x555555), 1);
  g.fillRect(fx, y - 70 * s, 2 * s, 70 * s);
  g.fillStyle(tone(0x74acdf), 1);
  g.fillRect(fx + 2 * s, y - 70 * s, 30 * s, 18 * s);
  g.fillStyle(tone(0xffffff), 1);
  g.fillRect(fx + 2 * s, y - 64 * s, 30 * s, 6 * s);
  g.fillStyle(tone(0xf6b40e), 1);
  g.fillCircle(fx + 17 * s, y - 61 * s, 2 * s);
}

// ------------------------------------------------------------------
// GRECIA — the Parthenon on top of the Acropolis hill
// ------------------------------------------------------------------
function drawPartenon(g, tone, cx, y, s) {
  const marble = tone(0xeee6d2);
  const shade = tone(0xcfc4ab);

  // The rocky hill
  polygon(g, tone(0xb59a74), [[cx - 160 * s, y], [cx - 135 * s, y - 60 * s], [cx + 135 * s, y - 60 * s], [cx + 160 * s, y]]);
  polygon(g, tone(0x977d5a), [[cx + 60 * s, y - 60 * s], [cx + 135 * s, y - 60 * s], [cx + 160 * s, y], [cx + 90 * s, y]]);

  // Three steps
  const top = y - 60 * s;
  g.fillStyle(shade, 1);
  g.fillRect(cx - 120 * s, top - 6 * s, 240 * s, 6 * s);
  g.fillStyle(marble, 1);
  g.fillRect(cx - 114 * s, top - 12 * s, 228 * s, 6 * s);
  g.fillStyle(shade, 1);
  g.fillRect(cx - 108 * s, top - 18 * s, 216 * s, 6 * s);

  // Eight columns
  g.fillStyle(marble, 1);
  for (let k = 0; k < 8; k++) {
    const colX = cx - 102 * s + k * 28 * s;
    g.fillRect(colX, top - 108 * s, 14 * s, 90 * s);
  }

  // The beam on top of the columns, and the triangle roof (the "pediment")
  g.fillStyle(shade, 1);
  g.fillRect(cx - 110 * s, top - 126 * s, 220 * s, 18 * s);
  polygon(g, marble, [[cx - 114 * s, top - 126 * s], [cx + 114 * s, top - 126 * s], [cx, top - 156 * s]]);
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
  eiffel: { background: null, landmark: drawEiffel, size: 1.0 },
  piramides: { background: drawDesert, landmark: drawPyramids, size: 1.0 },
  muralla: { background: null, landmark: drawGreatWall, size: 1.0 },
  cristo: { background: drawRioBay, landmark: drawCristo, size: 1.0 },
  machupicchu: { background: null, landmark: drawMachuPicchu, size: 1.0 },
  fuji: { background: null, landmark: drawFuji, size: 1.25 },
  bigben: { background: null, landmark: drawBigBen, size: 1.0 },
  opera: { background: drawHarbour, landmark: drawOpera, size: 1.15 },
  coliseo: { background: null, landmark: drawColiseo, size: 1.0 },
  tajmahal: { background: null, landmark: drawTajMahal, size: 1.0 },
  obelisco: { background: drawSkyline, landmark: drawObelisco, size: 1.0 }, // Buenos Aires is a big city too
  partenon: { background: null, landmark: drawPartenon, size: 1.25 },
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
