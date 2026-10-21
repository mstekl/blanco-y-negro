// asia.js — The landmarks of the countries of Asia (China, Japan and India are
// in LandmarkArt.js). Everything is drawn with simple shapes, like in LandmarkArt.js.
//
// LANDMARKS: drawing name → { background, landmark, size } (like in LandmarkArt.js)
// THEMES:    3-letter country code → { landmark, place }  (like in countryThemes.js)
//
// Remember: EVERY color goes through tone(), because the scene is drawn twice
// (once gray, once in color).

import { GROUND, pseudoRandom, polygon, nearSpot } from './helpers.js';

// ------------------------------------------------------------------
// Small helpers used by many drawings
// ------------------------------------------------------------------

// A rectangle with its right third in the shade (looks like a 3D block)
function block(g, light, shade, x, top, w, h) {
  g.fillStyle(light, 1);
  g.fillRect(x, top, w, h);
  g.fillStyle(shade, 1);
  g.fillRect(x + w * 0.66, top, w * 0.34, h);
}

// A tower made of blocks, each one thinner than the one below.
// parts = [[width, height], ...] from the bottom up. Returns where the top is.
function stackedTower(g, light, shade, cx, y, s, parts) {
  let bottom = y;
  parts.forEach(([w, h]) => {
    block(g, light, shade, cx - (w / 2) * s, bottom - h * s, w * s, h * s);
    bottom -= h * s;
  });
  return bottom;
}

// A thin pointy tower (minaret), with a little balcony and a cone on top
function minaret(g, tone, x, y, h, s, roof) {
  const white = tone(0xf1ece0);
  polygon(g, white, [[x - 7 * s, y], [x + 7 * s, y], [x + 5 * s, y - h * s], [x - 5 * s, y - h * s]]);
  g.fillStyle(tone(0xcfc8b6), 1);
  g.fillRect(x - 9 * s, y - h * 0.65 * s, 18 * s, 5 * s); // the balcony
  polygon(g, roof, [[x - 6 * s, y - h * s], [x + 6 * s, y - h * s], [x, y - (h + 26) * s]]);
}

// One palm tree (the same kind as in the desert of Egypt)
function palm(g, tone, x, h) {
  g.fillStyle(tone(0x8a6238), 1);
  g.fillRect(x - 4, GROUND - h, 8, h);
  g.fillStyle(tone(0x3c9a46), 1);
  for (let k = -2; k <= 2; k++) {
    g.fillTriangle(x - 4, GROUND - h, x + 4, GROUND - h, x + k * 22, GROUND - h + 18 - Math.abs(k) * 4);
    g.fillTriangle(x - 3, GROUND - h - 4, x + 3, GROUND - h + 4, x + k * 14, GROUND - h - 22 + Math.abs(k) * 6);
  }
}

// ------------------------------------------------------------------
// Backgrounds (they fill the whole width, behind the landmarks)
// ------------------------------------------------------------------

// Sand dunes and palm trees (Arabia, Jordan)
function bgDunes(g, tone, span, spots) {
  for (let x = -100, i = 0; x < span + 200; x += 260, i++) {
    g.fillStyle(tone(0xeac27c), 1);
    g.fillEllipse(x, 610, 560, 200 + pseudoRandom(i + 2) * 80);
    g.fillStyle(tone(0xd8a95e), 1);
    g.fillEllipse(x + 130, 625, 480, 140 + pseudoRandom(i + 6) * 50);
  }
  for (let x = 40, i = 0; x < span + 100; x += 190, i++) {
    if (!nearSpot(spots, x, 230)) palm(g, tone, x, 70 + pseudoRandom(i + 4) * 40);
  }
}

// The blue sea with palm trees on the beach (islands, Turkey, Vietnam...)
function bgSea(g, tone, span, spots) {
  g.fillStyle(tone(0x3f8fd0), 1);
  g.fillRect(0, GROUND - 40, span + 200, 80);
  g.fillStyle(tone(0x8cc8f0), 1);
  for (let x = 10, i = 0; x < span + 200; x += 70, i++) {
    g.fillRect(x, GROUND - 30 + pseudoRandom(i + 3) * 25, 28, 3);
  }
  for (let x = 60, i = 0; x < span + 100; x += 260, i++) {
    if (!nearSpot(spots, x, 240)) palm(g, tone, x, 80 + pseudoRandom(i + 8) * 40);
  }
}

// A thick jungle of round trees (Cambodia, Thailand, Indonesia...)
function bgJungle(g, tone, span, spots) {
  for (let x = 20, i = 0; x < span + 100; x += 80, i++) {
    const px = x + pseudoRandom(i + 7) * 30;
    if (nearSpot(spots, px, 200)) continue;
    const h = 50 + pseudoRandom(i + 1) * 60;
    g.fillStyle(tone(0x6b4a2c), 1);
    g.fillRect(px - 4, GROUND - h, 8, h);
    g.fillStyle(tone(0x2f7d3a), 1);
    g.fillCircle(px, GROUND - h - 6, 28);
    g.fillStyle(tone(0x46a050), 1);
    g.fillCircle(px - 14, GROUND - h + 2, 18);
  }
}

// High snowy mountains far away (Himalaya, Caucasus, Korea...)
// They are in the back, so they don't need a gap for the landmark.
function bgPeaks(g, tone, span) {
  for (let x = -60, i = 0; x < span + 200; x += 180, i++) {
    const h = 130 + pseudoRandom(i + 5) * 110;
    const half = 120 + pseudoRandom(i + 2) * 50;
    polygon(g, tone(0x9aa6c0), [[x - half, GROUND], [x, GROUND - h], [x + half, GROUND]]);
    polygon(g, tone(0x7d89a4), [[x, GROUND], [x, GROUND - h], [x + half, GROUND]]);
    polygon(g, tone(0xffffff), [ // the snow on top
      [x - half * 0.28, GROUND - h * 0.72], [x, GROUND - h], [x + half * 0.28, GROUND - h * 0.72], [x, GROUND - h * 0.66],
    ]);
  }
}

// The steppe: far mountains and wide yellow-green grass (Mongolia, Kazakhstan...)
function bgSteppe(g, tone, span) {
  bgPeaks(g, tone, span);
  for (let x = -100, i = 0; x < span + 200; x += 300, i++) {
    g.fillStyle(tone(0xb8c46a), 1);
    g.fillEllipse(x, 620, 640, 150 + pseudoRandom(i + 9) * 50);
  }
}

// Shiny glass skyscrapers (Dubai, Kuwait, Kuala Lumpur...)
function bgCity(g, tone, span, spots) {
  const colors = [0x7f9db5, 0x93b1c6, 0x6d879e];
  for (let x = 0, i = 0; x < span + 100; x += 58, i++) {
    if (nearSpot(spots, x, 150)) continue;
    const w = 34 + pseudoRandom(i + 2) * 22;
    const h = 80 + pseudoRandom(i + 5) * 130;
    g.fillStyle(tone(colors[i % 3]), 1);
    g.fillRect(x, GROUND - h, w, h);
    // Lines of glass windows
    g.fillStyle(tone(0xd6ecf7), 1);
    for (let wy = GROUND - h + 8; wy < GROUND - 8; wy += 14) g.fillRect(x + 4, wy, w - 8, 3);
  }
}

// ------------------------------------------------------------------
// EMIRATOS ÁRABES UNIDOS — the Burj Khalifa, the tallest building in the world
// ------------------------------------------------------------------
function drawBurj(g, tone, cx, y, s) {
  // It is so tall that we make it thin instead (so it fits on the screen)
  const top = stackedTower(g, tone(0xc4d6e4), tone(0x8ea4b8), cx, y, s,
    [[50, 80], [40, 72], [30, 64], [22, 54], [14, 40]]);
  // The long needle on top
  polygon(g, tone(0xc4d6e4), [[cx - 5 * s, top], [cx + 5 * s, top], [cx, top - 48 * s]]);
}

// ------------------------------------------------------------------
// KUWAIT — the Kuwait Towers: needles with blue balls
// ------------------------------------------------------------------
function needle(g, tone, x, y, h, s) {
  polygon(g, tone(0xe4e4dc), [[x - 7 * s, y], [x + 7 * s, y], [x + 1.5 * s, y - h * s], [x - 1.5 * s, y - h * s]]);
}

// A ball covered with little blue-green dots (like the real tiles)
function dottedBall(g, tone, x, by, r) {
  g.fillStyle(tone(0x2f6fb0), 1);
  g.fillCircle(x, by, r);
  g.fillStyle(tone(0x5fc0b0), 1);
  for (let dy = -r * 0.6; dy <= r * 0.6; dy += r * 0.4) {
    for (let dx = -r * 0.6; dx <= r * 0.6; dx += r * 0.4) g.fillCircle(x + dx, by + dy, r * 0.08);
  }
}

function drawKuwait(g, tone, cx, y, s) {
  needle(g, tone, cx - 50 * s, y, 170, s); // the small one has no ball
  needle(g, tone, cx + 55 * s, y, 210, s);
  dottedBall(g, tone, cx + 55 * s, y - 135 * s, 26 * s);
  needle(g, tone, cx, y, 320, s); // the tallest one has two balls
  dottedBall(g, tone, cx, y - 175 * s, 36 * s);
  dottedBall(g, tone, cx, y - 245 * s, 17 * s);
}

// ------------------------------------------------------------------
// MALASIA — the Petronas Twin Towers, joined by a bridge in the sky
// ------------------------------------------------------------------
function drawPetronas(g, tone, cx, y, s) {
  const steel = tone(0xd5dbe2);
  const shade = tone(0xa9b3bf);
  [-42, 42].forEach((dx) => {
    const tx = cx + dx * s;
    const top = stackedTower(g, steel, shade, tx, y, s, [[46, 150], [38, 45], [30, 32], [22, 22], [12, 16]]);
    polygon(g, steel, [[tx - 3 * s, top], [tx + 3 * s, top], [tx, top - 55 * s]]); // the spire
  });
  // The skybridge and its two legs
  g.fillStyle(shade, 1);
  g.fillRect(cx - 20 * s, y - 145 * s, 40 * s, 8 * s);
  g.fillTriangle(cx - 20 * s, y - 137 * s, cx - 20 * s, y - 120 * s, cx - 4 * s, y - 137 * s);
  g.fillTriangle(cx + 20 * s, y - 137 * s, cx + 20 * s, y - 120 * s, cx + 4 * s, y - 137 * s);
}

// ------------------------------------------------------------------
// SINGAPUR — Marina Bay Sands (a ship on top of 3 towers!) and the Merlion
// ------------------------------------------------------------------
function drawMarinaBay(g, tone, cx, y, s) {
  const light = tone(0xdfe5ea);
  const shade = tone(0xb2bcc6);
  // The three towers, a bit wider at the bottom
  [-70, 0, 70].forEach((dx) => {
    const tx = cx + dx * s;
    polygon(g, light, [[tx - 22 * s, y], [tx + 22 * s, y], [tx + 15 * s, y - 200 * s], [tx - 15 * s, y - 200 * s]]);
    polygon(g, shade, [[tx + 5 * s, y], [tx + 22 * s, y], [tx + 15 * s, y - 200 * s], [tx + 5 * s, y - 200 * s]]);
  });
  // The long "ship" (a park with a swimming pool) on top, with a pointy front
  polygon(g, shade, [[cx - 105 * s, y - 200 * s], [cx + 125 * s, y - 200 * s], [cx + 105 * s, y - 214 * s], [cx - 105 * s, y - 214 * s]]);
  g.fillStyle(tone(0x5fc0e0), 1);
  g.fillRect(cx - 95 * s, y - 218 * s, 150 * s, 4 * s); // the pool
  // The Merlion: half lion, half fish, spitting water into the sea
  const mx = cx - 150 * s;
  const white = tone(0xf2efe8);
  g.fillStyle(tone(0xb7ad9a), 1);
  g.fillRect(mx - 16 * s, y - 30 * s, 32 * s, 30 * s); // the stone it sits on
  polygon(g, white, [[mx - 14 * s, y - 30 * s], [mx + 12 * s, y - 30 * s], [mx + 10 * s, y - 80 * s], [mx - 10 * s, y - 80 * s]]);
  polygon(g, white, [[mx - 14 * s, y - 30 * s], [mx - 30 * s, y - 50 * s], [mx - 22 * s, y - 34 * s]]); // the fish tail
  g.fillStyle(white, 1);
  g.fillCircle(mx, y - 88 * s, 14 * s); // the lion head with its mane
  g.fillStyle(tone(0xd8d2c4), 1);
  g.fillCircle(mx + 4 * s, y - 86 * s, 7 * s);
  g.lineStyle(3 * s, tone(0x8cc8f0), 1);
  g.lineBetween(mx + 12 * s, y - 84 * s, mx + 32 * s, y - 70 * s);
  g.lineBetween(mx + 32 * s, y - 70 * s, mx + 42 * s, y - 30 * s);
}

// ------------------------------------------------------------------
// CAMBOYA — Angkor Wat, the temple with 5 towers shaped like lotus flowers
// ------------------------------------------------------------------
function lotusTower(g, tone, x, base, w, h) {
  const stone = tone(0xb3a07a);
  const shade = tone(0x8f7d58);
  // Rings that get thinner and thinner, then a round tip
  for (let k = 0; k < 6; k++) {
    const rw = w * (1 - k * 0.13);
    g.fillStyle(k % 2 ? shade : stone, 1);
    g.fillRect(x - rw / 2, base - (k + 1) * h * 0.12, rw, h * 0.12);
  }
  g.fillStyle(stone, 1);
  g.fillEllipse(x, base - h * 0.78, w * 0.3, h * 0.22);
  g.fillTriangle(x - w * 0.08, base - h * 0.85, x + w * 0.08, base - h * 0.85, x, base - h);
}

function drawAngkor(g, tone, cx, y, s) {
  // Three wide terraces of stone, one on top of the other
  block(g, tone(0xa8956e), tone(0x86744f), cx - 170 * s, y - 30 * s, 340 * s, 30 * s);
  block(g, tone(0xb3a07a), tone(0x8f7d58), cx - 130 * s, y - 60 * s, 260 * s, 30 * s);
  block(g, tone(0xa8956e), tone(0x86744f), cx - 90 * s, y - 90 * s, 180 * s, 30 * s);
  // Dark doors in the terraces
  g.fillStyle(tone(0x4a3e2a), 1);
  for (let k = -2; k <= 2; k++) g.fillRect(cx + k * 50 * s - 6 * s, y - 24 * s, 12 * s, 24 * s);
  // The 5 towers: 4 small at the corners and the big one in the middle
  lotusTower(g, tone, cx - 145 * s, y - 30 * s, 40 * s, 130 * s);
  lotusTower(g, tone, cx + 145 * s, y - 30 * s, 40 * s, 130 * s);
  lotusTower(g, tone, cx - 70 * s, y - 90 * s, 46 * s, 150 * s);
  lotusTower(g, tone, cx + 70 * s, y - 90 * s, 46 * s, 150 * s);
  lotusTower(g, tone, cx, y - 90 * s, 70 * s, 220 * s);
}

// ------------------------------------------------------------------
// TURQUÍA — Santa Sofía (Hagia Sophia): a giant dome and 4 minarets
// ------------------------------------------------------------------
function drawSantaSofia(g, tone, cx, y, s) {
  const wall = tone(0xd9a07e);
  const shade = tone(0xb57f60);
  const dome = tone(0x9aa7b5);
  // The domes (drawn first, so the walls cover their bottom half)
  g.fillStyle(dome, 1);
  g.fillEllipse(cx - 62 * s, y - 112 * s, 80 * s, 50 * s);
  g.fillEllipse(cx + 62 * s, y - 112 * s, 80 * s, 50 * s);
  g.fillEllipse(cx, y - 150 * s, 130 * s, 110 * s);
  g.fillStyle(tone(0xe6b422), 1);
  g.fillRect(cx - 1.5 * s, y - 222 * s, 3 * s, 18 * s); // the golden tip
  // The walls: the big building and the square part under the dome
  block(g, wall, shade, cx - 110 * s, y - 105 * s, 220 * s, 105 * s);
  g.fillStyle(wall, 1);
  g.fillRect(cx - 55 * s, y - 150 * s, 110 * s, 45 * s);
  // Rows of little dark windows
  g.fillStyle(tone(0x5a4636), 1);
  for (let wx = cx - 45 * s; wx < cx + 45 * s; wx += 15 * s) g.fillRect(wx, y - 140 * s, 6 * s, 14 * s);
  for (let wx = cx - 96 * s; wx < cx + 100 * s; wx += 22 * s) g.fillRect(wx, y - 80 * s, 8 * s, 30 * s);
  // The four minarets, two on each side
  [-165, -128, 128, 165].forEach((dx) => minaret(g, tone, cx + dx * s, y, 220, s, tone(0x8a96a4)));
}

// ------------------------------------------------------------------
// JORDANIA — Petra: a palace carved INSIDE a pink rock mountain
// ------------------------------------------------------------------
function drawPetra(g, tone, cx, y, s) {
  const rock = tone(0xc97e5e);
  const carved = tone(0xe3a483);
  const dark = tone(0x6b3a2a);
  // The rock mountain
  polygon(g, rock, [[cx - 180 * s, y], [cx - 170 * s, y - 250 * s], [cx - 90 * s, y - 300 * s], [cx + 40 * s, y - 290 * s], [cx + 150 * s, y - 310 * s], [cx + 180 * s, y]]);
  // The carved front: a lower floor with 6 columns and a triangle roof...
  g.fillStyle(carved, 1);
  g.fillRect(cx - 90 * s, y - 120 * s, 180 * s, 120 * s);
  polygon(g, carved, [[cx - 70 * s, y - 120 * s], [cx + 70 * s, y - 120 * s], [cx, y - 150 * s]]);
  // ...and an upper floor with a round little temple in the middle
  g.fillRect(cx - 90 * s, y - 240 * s, 180 * s, 90 * s);
  g.fillRect(cx - 26 * s, y - 250 * s, 52 * s, 10 * s);
  polygon(g, carved, [[cx - 22 * s, y - 250 * s], [cx + 22 * s, y - 250 * s], [cx, y - 275 * s]]);
  // The columns are shadows between lighter stone
  g.fillStyle(rock, 1);
  for (let k = 0; k < 6; k++) g.fillRect(cx - 80 * s + k * 32 * s, y - 112 * s, 4 * s, 112 * s);
  for (let k = 0; k < 6; k++) g.fillRect(cx - 80 * s + k * 32 * s, y - 232 * s, 4 * s, 82 * s);
  // The dark door
  g.fillStyle(dark, 1);
  g.fillRect(cx - 14 * s, y - 70 * s, 28 * s, 70 * s);
}

// ------------------------------------------------------------------
// NEPAL — Mount Everest, the highest mountain in the world (with prayer flags)
// The same mountain without the flags is used by other mountain countries.
// ------------------------------------------------------------------
function makeMountain(withFlags) {
  return (g, tone, cx, y, s) => {
    // A smaller peak behind on the left, then the big one
    polygon(g, tone(0x7f8aa0), [[cx - 200 * s, y], [cx - 110 * s, y - 220 * s], [cx - 20 * s, y]]);
    polygon(g, tone(0x8d98ae), [[cx - 150 * s, y], [cx + 10 * s, y - 330 * s], [cx + 190 * s, y]]);
    polygon(g, tone(0x6b7690), [[cx + 10 * s, y - 330 * s], [cx + 190 * s, y], [cx + 30 * s, y]]);
    // Snow on both tops
    polygon(g, tone(0xffffff), [[cx - 145 * s, y - 150 * s], [cx - 110 * s, y - 220 * s], [cx - 78 * s, y - 155 * s], [cx - 110 * s, y - 170 * s]]);
    polygon(g, tone(0xffffff), [
      [cx - 55 * s, y - 195 * s], [cx + 10 * s, y - 330 * s], [cx + 80 * s, y - 190 * s],
      [cx + 45 * s, y - 210 * s], [cx + 15 * s, y - 185 * s], [cx - 20 * s, y - 210 * s],
    ]);
    if (!withFlags) return;
    // The colored prayer flags on a rope (blue, white, red, green, yellow)
    const colors = [0x2f6fd0, 0xffffff, 0xd8322a, 0x3fa34d, 0xf2c32e];
    const x1 = cx - 190 * s;
    const x2 = cx - 40 * s;
    g.fillStyle(tone(0x6b4a2c), 1);
    g.fillRect(x1 - 2 * s, y - 80 * s, 4 * s, 80 * s);
    g.lineStyle(2 * s, tone(0x5a4a3a), 1);
    g.lineBetween(x1, y - 80 * s, x2, y - 20 * s);
    for (let k = 0; k < 10; k++) {
      const fx = x1 + ((x2 - x1) * (k + 0.5)) / 10;
      const fy = y - 80 * s + (60 * s * (k + 0.5)) / 10;
      g.fillStyle(tone(colors[k % 5]), 1);
      g.fillRect(fx - 4 * s, fy, 8 * s, 11 * s);
    }
  };
}

// ------------------------------------------------------------------
// COREA DEL SUR — the Gyeongbokgung palace, with its curved roofs
// ------------------------------------------------------------------
// A tiled roof whose corners turn up (like a smile)
function curvedRoof(g, tone, cx, bottom, w, h) {
  polygon(g, tone(0x45524f), [
    [cx - w / 2, bottom - h * 0.5], [cx - w * 0.44, bottom], [cx + w * 0.44, bottom], [cx + w / 2, bottom - h * 0.5],
    [cx + w * 0.32, bottom - h], [cx - w * 0.32, bottom - h],
  ]);
  g.fillStyle(tone(0x3e8f73), 1); // the painted green band under the roof
  g.fillRect(cx - w * 0.38, bottom, w * 0.76, 5);
}

function drawGyeongbok(g, tone, cx, y, s) {
  const red = tone(0xb8322a);
  // The stone base with its stairs
  block(g, tone(0xc9c4b8), tone(0xa6a194), cx - 150 * s, y - 30 * s, 300 * s, 30 * s);
  // The lower hall: light walls and red columns
  g.fillStyle(tone(0xe7d9b8), 1);
  g.fillRect(cx - 115 * s, y - 100 * s, 230 * s, 70 * s);
  g.fillStyle(red, 1);
  for (let k = 0; k <= 8; k++) g.fillRect(cx - 115 * s + k * 28 * s, y - 100 * s, 6 * s, 70 * s);
  curvedRoof(g, tone, cx, y - 100 * s, 340 * s, 50 * s);
  // The upper hall and its roof
  g.fillStyle(tone(0xe7d9b8), 1);
  g.fillRect(cx - 85 * s, y - 180 * s, 170 * s, 30 * s);
  g.fillStyle(red, 1);
  for (let k = 0; k <= 6; k++) g.fillRect(cx - 85 * s + k * 27.5 * s, y - 180 * s, 5 * s, 30 * s);
  curvedRoof(g, tone, cx, y - 180 * s, 260 * s, 55 * s);
  g.fillStyle(tone(0x2f3836), 1);
  g.fillRect(cx - 85 * s, y - 240 * s, 170 * s, 6 * s); // the ridge on top
}

// ------------------------------------------------------------------
// TAILANDIA — Wat Arun, the Temple of Dawn, with its tall round towers ("prangs")
// ------------------------------------------------------------------
function prang(g, tone, x, base, w, h) {
  // Rings that get thinner, decorated with little colored dots (porcelain!)
  for (let k = 0; k < 7; k++) {
    const rw = w * (1 - k * 0.1);
    const top = base - (k + 1) * h * 0.1;
    g.fillStyle(tone(k % 2 ? 0xd9cfbd : 0xefe8da), 1);
    g.fillRect(x - rw / 2, top, rw, h * 0.1);
    g.fillStyle(tone(k % 2 ? 0x3f8fd0 : 0xd8603a), 1);
    for (let d = -rw / 2 + 5; d < rw / 2 - 3; d += 9) g.fillCircle(x + d, top + h * 0.05, 1.8);
  }
  // The round top and the long point
  g.fillStyle(tone(0xefe8da), 1);
  g.fillEllipse(x, base - h * 0.72, w * 0.36, h * 0.12);
  polygon(g, tone(0xd9cfbd), [[x - w * 0.12, base - h * 0.74], [x + w * 0.12, base - h * 0.74], [x, base - h]]);
}

function drawWatArun(g, tone, cx, y, s) {
  block(g, tone(0xd9cfbd), tone(0xb8ad98), cx - 160 * s, y - 25 * s, 320 * s, 25 * s);
  prang(g, tone, cx - 115 * s, y - 25 * s, 44 * s, 150 * s);
  prang(g, tone, cx + 115 * s, y - 25 * s, 44 * s, 150 * s);
  prang(g, tone, cx, y - 25 * s, 96 * s, 310 * s);
}

// ------------------------------------------------------------------
// MYANMAR, LAOS (golden) and SRI LANKA (white) — the stupa: a giant bell
// ------------------------------------------------------------------
function makeStupa(color, shadeColor) {
  return (g, tone, cx, y, s) => {
    const main = tone(color);
    const shade = tone(shadeColor);
    // The bell (its bottom gets covered by the base)
    g.fillStyle(main, 1);
    g.fillEllipse(cx, y - 95 * s, 160 * s, 140 * s);
    // The base: three wide steps
    block(g, main, shade, cx - 150 * s, y - 20 * s, 300 * s, 20 * s);
    block(g, shade, main, cx - 125 * s, y - 40 * s, 250 * s, 20 * s);
    block(g, main, shade, cx - 100 * s, y - 60 * s, 200 * s, 20 * s);
    // Rings on top of the bell, then the long point and a shiny tip
    for (let k = 0; k < 4; k++) {
      g.fillStyle(k % 2 ? shade : main, 1);
      g.fillRect(cx - (30 - k * 5) * s, y - (172 + k * 10) * s, (60 - k * 10) * s, 10 * s);
    }
    polygon(g, main, [[cx - 16 * s, y - 202 * s], [cx + 16 * s, y - 202 * s], [cx, y - 300 * s]]);
    polygon(g, shade, [[cx + 4 * s, y - 202 * s], [cx + 16 * s, y - 202 * s], [cx, y - 300 * s]]);
    g.fillStyle(tone(0xfff3a0), 1);
    g.fillCircle(cx, y - 302 * s, 4 * s);
  };
}

// ------------------------------------------------------------------
// INDONESIA — Borobudur: a mountain of stone steps with little bell stupas
// ------------------------------------------------------------------
function smallBell(g, tone, x, base, r) {
  g.fillStyle(tone(0x8d8a7c), 1);
  g.fillEllipse(x, base - r * 0.6, r * 2, r * 1.6);
  g.fillTriangle(x - r * 0.25, base - r * 1.2, x + r * 0.25, base - r * 1.2, x, base - r * 2);
}

function drawBorobudur(g, tone, cx, y, s) {
  // Six square terraces, each smaller than the one below
  for (let k = 0; k < 6; k++) {
    const w = (330 - k * 40) * s;
    block(g, tone(k % 2 ? 0x7d7a6d : 0x9b9888), tone(0x6f6c60), cx - w / 2, y - (k + 1) * 20 * s, w, 20 * s);
  }
  // Rows of little bell stupas on the top three terraces
  for (let k = 3; k < 6; k++) {
    const half = (330 - k * 40) / 2 - 20;
    for (let bx = -half; bx <= half; bx += 26) smallBell(g, tone, cx + bx * s, y - (k + 1) * 20 * s, 8 * s);
  }
  // The big stupa on the very top
  g.fillStyle(tone(0x9b9888), 1);
  g.fillEllipse(cx, y - 145 * s, 60 * s, 50 * s);
  g.fillTriangle(cx - 6 * s, y - 165 * s, cx + 6 * s, y - 165 * s, cx, y - 205 * s);
}

// ------------------------------------------------------------------
// UZBEKISTÁN — the Registán of Samarkand: 3 schools with giant blue doors
// ------------------------------------------------------------------
function portal(g, tone, x, y, w, h, s) {
  // The tall front wall
  block(g, tone(0xd9b98a), tone(0xb89a6c), x - w / 2, y - h, w, h);
  // The blue tiled panel and the big dark arch inside it
  g.fillStyle(tone(0x2f7fc0), 1);
  g.fillRect(x - w * 0.36, y - h * 0.9, w * 0.72, h * 0.9);
  g.fillStyle(tone(0x24496e), 1);
  g.fillRect(x - w * 0.22, y - h * 0.55, w * 0.44, h * 0.55);
  g.fillCircle(x, y - h * 0.55, w * 0.22);
  // Two little minarets at the corners, with blue tops
  [-1, 1].forEach((side) => minaret(g, tone, x + side * (w / 2 + 4 * s), y, h / s + 20, s, tone(0x2f7fc0)));
}

function drawRegistan(g, tone, cx, y, s) {
  // The ribbed blue domes behind
  [-110, 110].forEach((dx) => {
    g.fillStyle(tone(0x3fa9c9), 1);
    g.fillEllipse(cx + dx * s, y - 150 * s, 60 * s, 70 * s);
    g.fillStyle(tone(0x2b86a3), 1);
    for (let k = -2; k <= 2; k++) g.fillRect(cx + dx * s + k * 10 * s - 1, y - 180 * s, 2 * s, 50 * s);
  });
  portal(g, tone, cx - 120 * s, y, 90 * s, 140 * s, s);
  portal(g, tone, cx + 120 * s, y, 90 * s, 140 * s, s);
  portal(g, tone, cx, y, 120 * s, 190 * s, s);
}

// ------------------------------------------------------------------
// IRÁN — the Azadi Tower in Tehran: like an upside-down "Y"
// ------------------------------------------------------------------
function drawAzadi(g, tone, cx, y, s) {
  const white = tone(0xe9e3d3);
  const shade = tone(0xc7bfaa);
  // The whole shape: wide at the bottom, narrow at the top
  polygon(g, white, [[cx - 115 * s, y], [cx + 115 * s, y], [cx + 45 * s, y - 210 * s], [cx - 45 * s, y - 210 * s]]);
  polygon(g, shade, [[cx + 20 * s, y], [cx + 115 * s, y], [cx + 45 * s, y - 210 * s], [cx + 20 * s, y - 210 * s]]);
  // The big pointed arch in the middle (in the shadow)
  polygon(g, tone(0x5f6a78), [[cx - 60 * s, y], [cx + 60 * s, y], [cx + 22 * s, y - 120 * s], [cx, y - 160 * s], [cx - 22 * s, y - 120 * s]]);
  // The top part with its small blue dome
  block(g, white, shade, cx - 50 * s, y - 240 * s, 100 * s, 30 * s);
  g.fillStyle(tone(0x3f8fd0), 1);
  g.fillEllipse(cx, y - 244 * s, 40 * s, 26 * s);
  g.fillRect(cx - 1.5 * s, y - 275 * s, 3 * s, 20 * s);
}

// ------------------------------------------------------------------
// ISRAEL — Jerusalem: the old city wall and the golden dome
// ------------------------------------------------------------------
function drawJerusalen(g, tone, cx, y, s) {
  // The blue building with eight sides, its golden dome and the drum under it
  g.fillStyle(tone(0x3d78b5), 1);
  g.fillRect(cx - 80 * s, y - 150 * s, 160 * s, 90 * s);
  g.fillStyle(tone(0xf1ece0), 1);
  g.fillRect(cx - 80 * s, y - 150 * s, 160 * s, 6 * s);
  g.fillStyle(tone(0xe6b422), 1);
  g.fillEllipse(cx, y - 182 * s, 90 * s, 90 * s);
  g.fillRect(cx - 1.5 * s, y - 245 * s, 3 * s, 20 * s);
  g.fillStyle(tone(0x3d78b5), 1);
  g.fillRect(cx - 42 * s, y - 176 * s, 84 * s, 26 * s);
  // The old stone wall in front, with its teeth and a gate
  const stone = tone(0xd8c9a0);
  block(g, stone, tone(0xb8a77c), cx - 170 * s, y - 70 * s, 340 * s, 70 * s);
  g.fillStyle(stone, 1);
  for (let tx = cx - 170 * s; tx < cx + 165 * s; tx += 20 * s) g.fillRect(tx, y - 80 * s, 10 * s, 10 * s);
  g.fillStyle(tone(0x5a4a36), 1);
  g.fillRect(cx - 18 * s, y - 40 * s, 36 * s, 40 * s);
  g.fillCircle(cx, y - 40 * s, 18 * s);
}

// ------------------------------------------------------------------
// VIETNAM — Ha Long Bay: tall rocks in the sea and a boat with red sails
// ------------------------------------------------------------------
function seaRock(g, tone, x, base, w, h) {
  polygon(g, tone(0x7f9a86), [
    [x - w / 2, base], [x - w * 0.45, base - h * 0.7], [x - w * 0.25, base - h],
    [x + w * 0.2, base - h * 0.95], [x + w * 0.45, base - h * 0.6], [x + w / 2, base],
  ]);
  g.fillStyle(tone(0x4f8f55), 1); // trees growing on top
  g.fillEllipse(x - w * 0.02, base - h * 0.95, w * 0.55, h * 0.16);
}

function drawHaLong(g, tone, cx, y, s) {
  const base = y - 25 * s; // the rocks stand in the water
  seaRock(g, tone, cx - 130 * s, base, 80 * s, 170 * s);
  seaRock(g, tone, cx + 120 * s, base, 90 * s, 200 * s);
  seaRock(g, tone, cx - 30 * s, base, 110 * s, 270 * s);
  // The junk boat: a wooden hull and three fan-shaped sails
  const bx = cx + 40 * s;
  polygon(g, tone(0x7a4a26), [[bx - 60 * s, base - 22 * s], [bx + 60 * s, base - 22 * s], [bx + 45 * s, base], [bx - 45 * s, base]]);
  [-35, 0, 35].forEach((dx, k) => {
    const sx = bx + dx * s;
    const top = base - (75 + (k === 1 ? 20 : 0)) * s;
    polygon(g, tone(0xd8603a), [[sx - 14 * s, base - 24 * s], [sx + 14 * s, base - 24 * s], [sx + 18 * s, top], [sx - 12 * s, top]]);
    g.fillStyle(tone(0x7a3a20), 1);
    for (let ly = top + 10 * s; ly < base - 26 * s; ly += 12 * s) g.fillRect(sx - 13 * s, ly, 28 * s, 2 * s);
  });
}

// ------------------------------------------------------------------
// BUTÁN — the Tiger's Nest monastery, hanging on the side of a cliff
// ------------------------------------------------------------------
function drawNidoTigre(g, tone, cx, y, s) {
  // The giant cliff
  polygon(g, tone(0x6f6658), [[cx - 40 * s, y], [cx - 55 * s, y - 130 * s], [cx - 30 * s, y - 270 * s], [cx + 20 * s, y - 330 * s], [cx + 100 * s, y - 300 * s], [cx + 160 * s, y]]);
  polygon(g, tone(0x5a5246), [[cx + 20 * s, y - 330 * s], [cx + 100 * s, y - 300 * s], [cx + 160 * s, y], [cx + 60 * s, y]]);
  // A rocky ledge where the monastery stands
  polygon(g, tone(0x6f6658), [[cx - 140 * s, y - 150 * s], [cx - 40 * s, y - 150 * s], [cx - 40 * s, y - 120 * s]]);
  // Three white houses with red bands and golden roofs, stacked on the cliff
  [[-115, -150, 60], [-80, -190, 54], [-50, -228, 40]].forEach(([dx, dy, w]) => {
    const hx = cx + dx * s;
    const bottom = y + dy * s;
    g.fillStyle(tone(0xf2eee4), 1);
    g.fillRect(hx - (w / 2) * s, bottom - 34 * s, w * s, 34 * s);
    g.fillStyle(tone(0x9b2f22), 1);
    g.fillRect(hx - (w / 2) * s, bottom - 34 * s, w * s, 6 * s);
    polygon(g, tone(0xd9a62a), [[hx - (w / 2 + 6) * s, bottom - 34 * s], [hx + (w / 2 + 6) * s, bottom - 34 * s], [hx + (w / 2 - 6) * s, bottom - 46 * s], [hx - (w / 2 - 6) * s, bottom - 46 * s]]);
  });
}

// ------------------------------------------------------------------
// FILIPINAS (and the rice fields of Bangladesh) — rice terraces: green steps
// up a hill, with a little hut on stilts at the top
// ------------------------------------------------------------------
function drawArrozal(g, tone, cx, y, s) {
  // From the top step to the bottom one, so the lower steps go in front
  for (let k = 5; k >= 0; k--) {
    g.fillStyle(tone(0x6f5a3a), 1); // the mud wall of the step
    g.fillEllipse(cx, y - k * 30 * s + 4 * s, (380 - k * 55) * s, 64 * s);
    g.fillStyle(tone(k % 2 ? 0x7cc06a : 0x5eaa52), 1);
    g.fillEllipse(cx, y - k * 30 * s, (370 - k * 55) * s, 56 * s);
  }
  // The hut: stilts, brown walls and a big straw roof
  const top = y - 170 * s;
  g.fillStyle(tone(0x5a3e22), 1);
  g.fillRect(cx - 22 * s, top, 4 * s, 20 * s);
  g.fillRect(cx + 18 * s, top, 4 * s, 20 * s);
  g.fillStyle(tone(0x9a6a3a), 1);
  g.fillRect(cx - 26 * s, top - 30 * s, 52 * s, 30 * s);
  polygon(g, tone(0xc9a35a), [[cx - 40 * s, top - 26 * s], [cx + 40 * s, top - 26 * s], [cx, top - 80 * s]]);
}

// ------------------------------------------------------------------
// MONGOLIA (and the steppe of Kazakhstan and Kyrgyzstan) — round tents called yurts
// ------------------------------------------------------------------
function yurt(g, tone, x, y, r) {
  g.fillStyle(tone(0xf2ede0), 1);
  g.fillRect(x - r, y - r * 0.7, r * 2, r * 0.7);
  polygon(g, tone(0xe2dccd), [[x - r * 1.05, y - r * 0.7], [x + r * 1.05, y - r * 0.7], [x + r * 0.2, y - r * 1.15], [x - r * 0.2, y - r * 1.15]]);
  g.fillStyle(tone(0xc0392b), 1);
  g.fillRect(x - r, y - r * 0.55, r * 2, r * 0.1); // the red band
  g.fillStyle(tone(0xd8603a), 1);
  g.fillRect(x - r * 0.18, y - r * 0.45, r * 0.36, r * 0.45); // the orange door
}

function drawYurtas(g, tone, cx, y, s) {
  yurt(g, tone, cx - 95 * s, y, 38 * s);
  yurt(g, tone, cx + 100 * s, y, 32 * s);
  yurt(g, tone, cx, y, 55 * s);
  // An eagle flying above (Mongolian hunters ride with eagles!)
  polygon(g, tone(0x5a4630), [[cx - 40 * s, y - 150 * s], [cx, y - 135 * s], [cx + 40 * s, y - 150 * s], [cx, y - 128 * s]]);
}

// ------------------------------------------------------------------
// LÍBANO — the cedar of Lebanon (it is on their flag): flat green layers
// ------------------------------------------------------------------
function drawCedro(g, tone, cx, y, s) {
  g.fillStyle(tone(0x6b4a2c), 1);
  g.fillRect(cx - 10 * s, y - 230 * s, 20 * s, 230 * s);
  // The layers of branches: wide at the bottom, small at the top
  [[180, 0x2f6b3a], [150, 0x3a7d45], [115, 0x2f6b3a], [80, 0x3a7d45], [45, 0x2f6b3a]].forEach(([w, color], k) => {
    g.fillStyle(tone(color), 1);
    g.fillEllipse(cx + (k % 2 ? 12 : -12) * s, y - (100 + k * 42) * s, w * 2 * s, 44 * s);
  });
}

// ------------------------------------------------------------------
// Regional: ARABIA — a mosque with a dome and two minarets in the desert
// (the same mosque with a golden dome by the sea is for Brunei)
// ------------------------------------------------------------------
function makeMosque(domeColor) {
  return (g, tone, cx, y, s) => {
    const dome = tone(domeColor);
    [-125, 125].forEach((dx) => minaret(g, tone, cx + dx * s, y, 230, s, dome));
    // The domes first, then the walls cover their bottom half
    g.fillStyle(dome, 1);
    g.fillEllipse(cx - 68 * s, y - 92 * s, 50 * s, 46 * s);
    g.fillEllipse(cx + 68 * s, y - 92 * s, 50 * s, 46 * s);
    g.fillEllipse(cx, y - 130 * s, 120 * s, 110 * s);
    g.fillStyle(tone(0xe6b422), 1);
    g.fillRect(cx - 1.5 * s, y - 205 * s, 3 * s, 22 * s);
    g.fillCircle(cx, y - 205 * s, 4 * s);
    block(g, tone(0xece0c2), tone(0xcdbf9c), cx - 100 * s, y - 90 * s, 200 * s, 90 * s);
    g.fillStyle(tone(0xece0c2), 1);
    g.fillRect(cx - 50 * s, y - 130 * s, 100 * s, 40 * s); // the drum under the big dome
    // Pointed arches in a row
    g.fillStyle(tone(0x6a5a44), 1);
    for (let ax = cx - 82 * s; ax < cx + 85 * s; ax += 28 * s) {
      g.fillRect(ax, y - 50 * s, 14 * s, 50 * s);
      g.fillTriangle(ax, y - 50 * s, ax + 14 * s, y - 50 * s, ax + 7 * s, y - 62 * s);
    }
  };
}

// ------------------------------------------------------------------
// Regional: ISLAS TROPICALES (Maldivas, Timor Oriental) — little houses on
// stilts over the water, and a sandy island with palm trees
// ------------------------------------------------------------------
function drawAtolon(g, tone, cx, y, s) {
  // The sandy island and its palm trees
  g.fillStyle(tone(0xf0dca0), 1);
  g.fillEllipse(cx - 110 * s, y - 20 * s, 150 * s, 40 * s);
  [[-140, 90], [-90, 120]].forEach(([dx, h]) => {
    const px = cx + dx * s;
    g.fillStyle(tone(0x8a6238), 1);
    g.fillRect(px - 4 * s, y - h * s, 8 * s, h * s - 20 * s);
    g.fillStyle(tone(0x3c9a46), 1);
    for (let k = -2; k <= 2; k++) g.fillTriangle(px - 4 * s, y - h * s, px + 4 * s, y - h * s, px + k * 24 * s, y - (h - 18 + Math.abs(k) * 4) * s);
  });
  // The wooden walk over the water and three huts on stilts
  g.fillStyle(tone(0x9a6a3a), 1);
  g.fillRect(cx - 40 * s, y - 40 * s, 210 * s, 6 * s);
  [10, 80, 150].forEach((dx) => {
    const hx = cx + dx * s;
    g.fillStyle(tone(0x6b4a2c), 1);
    g.fillRect(hx - 18 * s, y - 40 * s, 4 * s, 40 * s);
    g.fillRect(hx + 14 * s, y - 40 * s, 4 * s, 40 * s);
    g.fillStyle(tone(0xc49a62), 1);
    g.fillRect(hx - 22 * s, y - 70 * s, 44 * s, 30 * s);
    polygon(g, tone(0xd9b56a), [[hx - 32 * s, y - 66 * s], [hx + 32 * s, y - 66 * s], [hx, y - 100 * s]]);
  });
}

// ------------------------------------------------------------------
// Regional: CÁUCASO (Georgia, Armenia, Azerbaiyán) — an old stone church
// with a pointy cone roof, on a green hill
// ------------------------------------------------------------------
function drawCaucaso(g, tone, cx, y, s) {
  polygon(g, tone(0x5f9a58), [[cx - 190 * s, y], [cx - 120 * s, y - 55 * s], [cx + 110 * s, y - 60 * s], [cx + 190 * s, y]]);
  const stone = tone(0xc9b48f);
  const shade = tone(0xa8936e);
  const base = y - 55 * s;
  block(g, stone, shade, cx - 70 * s, base - 90 * s, 140 * s, 90 * s);
  polygon(g, tone(0x8a7a62), [[cx - 78 * s, base - 90 * s], [cx + 78 * s, base - 90 * s], [cx, base - 125 * s]]); // the roof
  block(g, stone, shade, cx - 22 * s, base - 160 * s, 44 * s, 55 * s); // the round drum
  polygon(g, tone(0x8a7a62), [[cx - 28 * s, base - 160 * s], [cx + 28 * s, base - 160 * s], [cx, base - 205 * s]]); // the cone
  g.fillStyle(tone(0x4a3e30), 1);
  g.fillRect(cx - 12 * s, base - 50 * s, 24 * s, 50 * s); // the door
  g.fillRect(cx - 3 * s, base - 145 * s, 6 * s, 20 * s); // a thin window
  g.fillRect(cx - 50 * s, base - 70 * s, 6 * s, 18 * s);
  g.fillRect(cx + 44 * s, base - 70 * s, 6 * s, 18 * s);
}

// ------------------------------------------------------------------
// The list of landmarks of Asia (the names must not be the same as in other files)
// ------------------------------------------------------------------
export const LANDMARKS = {
  burj: { background: bgCity, landmark: drawBurj, size: 1.0 },
  kuwait: { background: bgCity, landmark: drawKuwait, size: 1.0 },
  petronas: { background: bgCity, landmark: drawPetronas, size: 1.0 },
  marinabay: { background: bgSea, landmark: drawMarinaBay, size: 1.0 },
  angkor: { background: bgJungle, landmark: drawAngkor, size: 1.0 },
  santasofia: { background: bgSea, landmark: drawSantaSofia, size: 1.0 },
  petra: { background: bgDunes, landmark: drawPetra, size: 1.0 },
  everest: { background: bgPeaks, landmark: makeMountain(true), size: 1.0 },
  gyeongbok: { background: bgPeaks, landmark: drawGyeongbok, size: 1.15 },
  watarun: { background: bgJungle, landmark: drawWatArun, size: 1.0 },
  shwedagon: { background: bgJungle, landmark: makeStupa(0xe8b830, 0xc0901a), size: 1.0 },
  dagoba: { background: bgJungle, landmark: makeStupa(0xf2efe6, 0xcfcabd), size: 1.0 },
  borobudur: { background: bgJungle, landmark: drawBorobudur, size: 1.3 },
  registan: { background: bgSteppe, landmark: drawRegistan, size: 1.1 },
  azadi: { background: bgPeaks, landmark: drawAzadi, size: 1.1 },
  jerusalen: { background: null, landmark: drawJerusalen, size: 1.1 },
  halong: { background: bgSea, landmark: drawHaLong, size: 1.0 },
  nidotigre: { background: bgPeaks, landmark: drawNidoTigre, size: 1.0 },
  arrozal: { background: bgJungle, landmark: drawArrozal, size: 1.1 },
  estepa: { background: bgSteppe, landmark: drawYurtas, size: 1.3 },
  cedro: { background: bgPeaks, landmark: drawCedro, size: 1.0 },
  pamir: { background: bgPeaks, landmark: makeMountain(false), size: 1.0 },
  arabia: { background: bgDunes, landmark: makeMosque(0x3fa0a8), size: 1.0 },
  brunei: { background: bgSea, landmark: makeMosque(0xe2b33a), size: 1.0 },
  atolon: { background: bgSea, landmark: drawAtolon, size: 1.2 },
  caucaso: { background: bgPeaks, landmark: drawCaucaso, size: 1.1 },
};

// ------------------------------------------------------------------
// Every country of Asia → its scenery. "place" is shown as "Cerca de ..."
// (null = no famous place, it is the scenery of the region)
// ------------------------------------------------------------------
export const THEMES = {
  // Countries with their own famous landmark
  ARE: { landmark: 'burj', place: 'el Burj Khalifa' },
  KWT: { landmark: 'kuwait', place: 'las Torres de Kuwait' },
  MYS: { landmark: 'petronas', place: 'las Torres Petronas' },
  SGP: { landmark: 'marinabay', place: 'Marina Bay y el Merlion' },
  KHM: { landmark: 'angkor', place: 'Angkor Wat' },
  TUR: { landmark: 'santasofia', place: 'Santa Sofía' },
  JOR: { landmark: 'petra', place: 'Petra' },
  NPL: { landmark: 'everest', place: 'el Monte Everest' },
  KOR: { landmark: 'gyeongbok', place: 'el palacio Gyeongbokgung' },
  THA: { landmark: 'watarun', place: 'el templo Wat Arun' },
  MMR: { landmark: 'shwedagon', place: 'la pagoda de Shwedagon' },
  LAO: { landmark: 'shwedagon', place: 'Pha That Luang' },
  LKA: { landmark: 'dagoba', place: 'la estupa Ruwanwelisaya' },
  IDN: { landmark: 'borobudur', place: 'Borobudur' },
  UZB: { landmark: 'registan', place: 'el Registán de Samarcanda' },
  IRN: { landmark: 'azadi', place: 'la Torre Azadi' },
  ISR: { landmark: 'jerusalen', place: 'Jerusalén' },
  VNM: { landmark: 'halong', place: 'la bahía de Ha Long' },
  BTN: { landmark: 'nidotigre', place: 'el Nido del Tigre' },
  PHL: { landmark: 'arrozal', place: 'las terrazas de arroz de Banaue' },
  MNG: { landmark: 'estepa', place: 'las yurtas de la estepa' },
  LBN: { landmark: 'cedro', place: 'los cedros del Líbano' },
  // Desert with a mosque
  SAU: { landmark: 'arabia', place: null },
  YEM: { landmark: 'arabia', place: null },
  OMN: { landmark: 'arabia', place: null },
  QAT: { landmark: 'arabia', place: null },
  BHR: { landmark: 'arabia', place: null },
  IRQ: { landmark: 'arabia', place: null },
  SYR: { landmark: 'arabia', place: null },
  PAK: { landmark: 'arabia', place: null },
  TKM: { landmark: 'arabia', place: null },
  BRN: { landmark: 'brunei', place: null }, // golden dome by the sea
  // Steppe with yurts
  KAZ: { landmark: 'estepa', place: null },
  KGZ: { landmark: 'estepa', place: null },
  // High mountains
  TJK: { landmark: 'pamir', place: 'las montañas del Pamir' },
  AFG: { landmark: 'pamir', place: null },
  PRK: { landmark: 'pamir', place: null },
  // Rice fields
  BGD: { landmark: 'arrozal', place: null },
  // Tropical islands
  MDV: { landmark: 'atolon', place: null },
  TLS: { landmark: 'atolon', place: null },
  // Caucasus churches
  GEO: { landmark: 'caucaso', place: null },
  ARM: { landmark: 'caucaso', place: null },
  AZE: { landmark: 'caucaso', place: null },
};
