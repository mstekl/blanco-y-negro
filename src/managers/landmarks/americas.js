// americas.js — The landmarks of Central America, the Caribbean and South America.
// (México, USA, Canadá, Perú, Brasil and Argentina live in LandmarkArt.js.)
//
// LANDMARKS: drawing name → { background, landmark, size } (like in LandmarkArt.js)
// THEMES:    3-letter country code → { landmark, place }  (like in countryThemes.js)
//
// Countries with a famous place get their own drawing (the moái of Chile, the
// Panama Canal, Angel Falls...). The small islands share the "faro" (a lighthouse
// on a Caribbean beach) and the rainforest countries share the giant "ceiba" tree.
//
// Remember: EVERY color goes through tone(), because the scene is drawn twice
// (once in gray, once in color).

import { GROUND, pseudoRandom, polygon, nearSpot } from './helpers.js';

// ------------------------------------------------------------------
// Little helpers used by several drawings
// ------------------------------------------------------------------

// The leaves of a palm tree: thin green triangles around the top of the trunk
function palmLeaves(g, tone, tx, ty, len) {
  g.fillStyle(tone(0x2f9a45), 1);
  for (let k = -2; k <= 2; k++) {
    g.fillTriangle(tx - 4, ty, tx + 4, ty, tx + k * len, ty + len * 0.8 - Math.abs(k) * 4);
    g.fillTriangle(tx - 3, ty - 4, tx + 3, ty + 4, tx + k * len * 0.6, ty - len * 0.9 + Math.abs(k) * 6);
  }
}

// A coconut palm, a bit bent (lean = how far the top goes to the side)
function palm(g, tone, x, base, h, lean, s = 1) {
  polygon(g, tone(0x9a6b3c), [[x - 5 * s, base], [x + 5 * s, base], [x + lean + 3 * s, base - h], [x + lean - 3 * s, base - h]]);
  palmLeaves(g, tone, x + lean, base - h, 24 * s);
  // Two coconuts hanging under the leaves
  g.fillStyle(tone(0x6b4a26), 1);
  g.fillCircle(x + lean - 4 * s, base - h + 6 * s, 4 * s);
  g.fillCircle(x + lean + 4 * s, base - h + 7 * s, 4 * s);
}

// A row of mountains along the whole width (they stay at the back, so no gap is needed)
function mountainRange(g, tone, span, light, dark, snow, minH, seed) {
  for (let x = -60, i = 0; x < span + 200; x += 170, i++) {
    const h = minH + pseudoRandom(i + seed) * 110;
    const half = 120 + pseudoRandom(i + seed + 5) * 40;
    polygon(g, tone(light), [[x - half, GROUND], [x, GROUND - h], [x + half, GROUND]]);
    polygon(g, tone(dark), [[x, GROUND], [x, GROUND - h], [x + half, GROUND]]); // shaded side
    if (snow) {
      polygon(g, tone(0xffffff), [
        [x - half * 0.3, GROUND - h * 0.7], [x, GROUND - h], [x + half * 0.3, GROUND - h * 0.7],
        [x, GROUND - h * 0.66],
      ]);
    }
  }
}

// ------------------------------------------------------------------
// Backgrounds
// ------------------------------------------------------------------

// The high Andes mountains, with snow on top
function drawAndes(g, tone, span) {
  mountainRange(g, tone, span, 0x9a8fb0, 0x7b7092, true, 150, 4);
}

// Soft green mountains (where coffee grows!)
function drawGreenMountains(g, tone, span) {
  mountainRange(g, tone, span, 0x7fae6a, 0x5f8f50, false, 110, 7);
}

// A beach: turquoise sea, little sailboats, sand and palm trees
function drawBeach(g, tone, span, spots) {
  g.fillStyle(tone(0x2bb5c8), 1);
  g.fillRect(0, GROUND - 60, span + 200, 120);
  g.fillStyle(tone(0x1d8fb0), 1);
  g.fillRect(0, GROUND - 60, span + 200, 8); // the deep blue far away
  g.fillStyle(tone(0xbdf0f5), 1);
  for (let x = 10, i = 0; x < span + 200; x += 70, i++) {
    g.fillRect(x, GROUND - 46 + pseudoRandom(i + 3) * 22, 26, 3); // little waves
  }

  // Sailboats far away (not behind the landmark)
  for (let x = 150, i = 0; x < span + 100; x += 520, i++) {
    if (nearSpot(spots, x, 170)) continue;
    g.fillStyle(tone(0x8a5a3a), 1);
    g.fillRect(x - 16, GROUND - 58, 32, 6);
    g.fillStyle(tone(i % 2 ? 0xffffff : 0xff7a5a), 1);
    g.fillTriangle(x - 2, GROUND - 60, x - 2, GROUND - 100, x + 18, GROUND - 60);
  }

  // The sand and the palm trees
  g.fillStyle(tone(0xf2dfa0), 1);
  g.fillRect(0, GROUND - 16, span + 200, 40);
  for (let x = 60, i = 0; x < span + 100; x += 190, i++) {
    if (nearSpot(spots, x, 170)) continue;
    palm(g, tone, x, GROUND - 8, 70 + pseudoRandom(i + 5) * 50, (pseudoRandom(i + 9) - 0.5) * 40);
  }
}

// The rainforest: a wall of treetops at the back and tall trees in front
function drawRainforest(g, tone, span, spots) {
  // The low wall of treetops (the landmark is drawn on top of it)
  g.fillStyle(tone(0x2a6634), 1);
  g.fillRect(0, GROUND - 60, span + 200, 70);
  for (let x = -20, i = 0; x < span + 100; x += 55, i++) {
    g.fillStyle(tone(i % 2 ? 0x2f6f3a : 0x3a7f44), 1);
    g.fillCircle(x, GROUND - 60 - pseudoRandom(i + 2) * 50, 45 + pseudoRandom(i + 8) * 20);
  }

  // Tall trees in front, leaving room for the landmark
  for (let x = 40, i = 0; x < span + 100; x += 130, i++) {
    if (nearSpot(spots, x, 200)) continue;
    const h = 120 + pseudoRandom(i + 4) * 80;
    g.fillStyle(tone(0x6e4e30), 1);
    g.fillRect(x - 5, GROUND - h, 10, h);
    g.fillStyle(tone(0x24753a), 1);
    g.fillEllipse(x, GROUND - h, 110, 50);
    g.fillStyle(tone(0x3c9a4c), 1);
    g.fillEllipse(x - 10, GROUND - h - 14, 70, 34);
  }
}

// The Uyuni salt flat: brown volcanoes far away and a giant white floor of salt
function drawSaltFlat(g, tone, span) {
  mountainRange(g, tone, span, 0xa7836a, 0x8a6a55, true, 70, 12);
  g.fillStyle(tone(0xf5f3ec), 1);
  g.fillRect(0, GROUND - 50, span + 200, 110);
  // The salt cracks into shapes like a honeycomb
  g.lineStyle(2, tone(0xd6d1c2), 1);
  [GROUND - 36, GROUND - 12].forEach((row, r) => {
    for (let x = r * 25; x < span + 200; x += 50) {
      g.lineBetween(x, row, x + 25, row - 7);
      g.lineBetween(x + 25, row - 7, x + 50, row);
      g.lineBetween(x + 25, row - 7, x + 25, row - 20);
    }
  });
}

// ------------------------------------------------------------------
// CHILE — the moái of Easter Island (giant stone heads, they are 800 years old!)
// ------------------------------------------------------------------
function moaiStatue(g, tone, x, base, h, hat) {
  const w = 0.34 * h;
  const stone = tone(0x7d7468);
  const shade = tone(0x5e564c);
  const dark = tone(0x3a342e);

  // The long head and body (the moái are mostly HEAD)
  polygon(g, stone, [[x - w * 0.45, base], [x + w * 0.45, base], [x + w * 0.42, base - h * 0.55],
    [x + w * 0.5, base - h * 0.97], [x - w * 0.5, base - h * 0.97], [x - w * 0.42, base - h * 0.55]]);
  polygon(g, shade, [[x + w * 0.15, base], [x + w * 0.45, base], [x + w * 0.42, base - h * 0.55],
    [x + w * 0.5, base - h * 0.97], [x + w * 0.2, base - h * 0.97]]);

  // The long ears
  g.fillStyle(stone, 1);
  g.fillRect(x - w * 0.6, base - h * 0.82, w * 0.12, h * 0.3);
  g.fillStyle(shade, 1);
  g.fillRect(x + w * 0.48, base - h * 0.82, w * 0.12, h * 0.3);

  // Heavy eyebrows, deep eyes, the long nose and a serious mouth
  g.fillStyle(dark, 1);
  g.fillRect(x - w * 0.42, base - h * 0.8, w * 0.84, h * 0.05);
  g.fillRect(x - w * 0.34, base - h * 0.74, w * 0.22, h * 0.04);
  g.fillRect(x + w * 0.12, base - h * 0.74, w * 0.22, h * 0.04);
  polygon(g, shade, [[x - w * 0.06, base - h * 0.75], [x + w * 0.06, base - h * 0.75],
    [x + w * 0.14, base - h * 0.58], [x - w * 0.14, base - h * 0.58]]);
  g.fillStyle(dark, 1);
  g.fillRect(x - w * 0.18, base - h * 0.52, w * 0.36, h * 0.02);

  // Thin arms carved on the body
  g.fillStyle(shade, 1);
  g.fillRect(x - w * 0.36, base - h * 0.4, w * 0.05, h * 0.3);

  // Some moái wear a red stone hat (called "pukao")
  if (hat) {
    g.fillStyle(tone(0xa8452c), 1);
    g.fillEllipse(x, base - h * 1.0, w * 0.8, h * 0.12);
  }
}

function drawMoai(g, tone, cx, y, s) {
  // The grassy ground and the long stone platform (the "ahu")
  g.fillStyle(tone(0x6fa84a), 1);
  g.fillEllipse(cx, y, 400 * s, 50 * s);
  g.fillStyle(tone(0x8f877a), 1);
  g.fillRect(cx - 150 * s, y - 22 * s, 300 * s, 22 * s);

  // Five moái in a row, looking at us
  const heights = [170, 195, 205, 185, 175];
  heights.forEach((h, k) => moaiStatue(g, tone, cx + (k - 2) * 56 * s, y - 22 * s, h * s, k === 1 || k === 3));
}

// ------------------------------------------------------------------
// CUBA — the Capitol of Havana, with old colorful cars in front
// ------------------------------------------------------------------
function oldCar(g, tone, x, base, color, s) {
  g.fillStyle(tone(color), 1);
  g.fillRoundedRect(x - 34 * s, base - 24 * s, 68 * s, 16 * s, 5 * s);
  g.fillRoundedRect(x - 18 * s, base - 36 * s, 34 * s, 14 * s, 4 * s);
  g.fillStyle(tone(0xbfe6f5), 1);
  g.fillRect(x - 14 * s, base - 33 * s, 26 * s, 8 * s); // the windows
  g.fillStyle(tone(0x2b2b2b), 1);
  g.fillCircle(x - 20 * s, base - 7 * s, 7 * s); // the wheels
  g.fillCircle(x + 20 * s, base - 7 * s, 7 * s);
}

function drawCapitolio(g, tone, cx, y, s) {
  const stone = tone(0xe9e1cc);
  const shade = tone(0xc9bea4);
  const dark = tone(0x6b6250);

  // The steps and the two long wings with windows
  g.fillStyle(shade, 1);
  g.fillRect(cx - 150 * s, y - 14 * s, 300 * s, 14 * s);
  g.fillStyle(stone, 1);
  g.fillRect(cx - 170 * s, y - 80 * s, 340 * s, 66 * s);
  g.fillStyle(dark, 1);
  for (let wx = cx - 162 * s; wx < cx + 160 * s; wx += 18 * s) {
    if (Math.abs(wx - cx) < 60 * s) continue; // the middle is for the columns
    g.fillRect(wx, y - 68 * s, 8 * s, 18 * s);
    g.fillRect(wx, y - 42 * s, 8 * s, 18 * s);
  }

  // The entrance: dark inside, white columns, and a triangle roof
  g.fillRect(cx - 52 * s, y - 100 * s, 104 * s, 86 * s);
  g.fillStyle(stone, 1);
  for (let k = 0; k < 6; k++) g.fillRect(cx - 50 * s + k * 18 * s, y - 100 * s, 9 * s, 86 * s);
  g.fillStyle(shade, 1);
  g.fillRect(cx - 58 * s, y - 110 * s, 116 * s, 10 * s);
  polygon(g, stone, [[cx - 58 * s, y - 110 * s], [cx + 58 * s, y - 110 * s], [cx, y - 134 * s]]);

  // The big dome (drawn first, so the round "drum" under it covers its bottom)
  g.fillStyle(stone, 1);
  g.fillEllipse(cx, y - 196 * s, 84 * s, 130 * s);
  g.fillStyle(shade, 1);
  g.fillEllipse(cx + 20 * s, y - 196 * s, 30 * s, 110 * s);
  g.fillStyle(stone, 1);
  g.fillRect(cx - 44 * s, y - 192 * s, 88 * s, 58 * s);
  g.fillStyle(dark, 1);
  for (let k = -3; k <= 3; k++) g.fillRect(cx + k * 12 * s - 2 * s, y - 182 * s, 4 * s, 38 * s);

  // The little lantern and the spike on top
  g.fillStyle(stone, 1);
  g.fillRect(cx - 9 * s, y - 280 * s, 18 * s, 22 * s);
  g.fillTriangle(cx - 11 * s, y - 280 * s, cx + 11 * s, y - 280 * s, cx, y - 298 * s);
  g.fillStyle(tone(0xe6b422), 1);
  g.fillRect(cx - 1.5 * s, y - 318 * s, 3 * s, 22 * s);

  // Two old American cars (Cuba is famous for them!)
  oldCar(g, tone, cx - 112 * s, y, 0xff6fa8, s);
  oldCar(g, tone, cx + 108 * s, y, 0x2fc4c0, s);
}

// ------------------------------------------------------------------
// PANAMÁ — the Panama Canal: a big ship in a lock, under the Bridge of the Americas
// ------------------------------------------------------------------
function drawCanal(g, tone, cx, y, s) {
  // The Bridge of the Americas: a steel arch with the road hanging from it
  const r = 230 * s;
  const archY = (dx) => y + 40 * s - Math.sqrt(r * r - dx * dx);
  g.lineStyle(7 * s, tone(0x3f6f8f), 1);
  for (let dx = -220 * s; dx < 220 * s; dx += 20 * s) {
    g.lineBetween(cx + dx, archY(dx), cx + dx + 20 * s, archY(dx + 20 * s));
  }
  g.lineStyle(2 * s, tone(0x3f6f8f), 1);
  for (let dx = -150 * s; dx <= 150 * s; dx += 30 * s) g.lineBetween(cx + dx, archY(dx), cx + dx, y - 130 * s);
  g.fillStyle(tone(0x3f6f8f), 1);
  g.fillRect(cx - 250 * s, y - 132 * s, 500 * s, 7 * s);

  // The lock: water between two concrete walls
  g.fillStyle(tone(0x2f7fb8), 1);
  g.fillRect(cx - 190 * s, y - 40 * s, 380 * s, 40 * s);
  g.fillStyle(tone(0xb9b6ad), 1);
  g.fillRect(cx - 200 * s, y - 60 * s, 30 * s, 60 * s);
  g.fillRect(cx + 170 * s, y - 60 * s, 30 * s, 60 * s);

  // The ship: red bottom, black sides
  polygon(g, tone(0xb83a2e), [[cx - 140 * s, y - 20 * s], [cx + 130 * s, y - 20 * s], [cx + 150 * s, y - 50 * s], [cx - 155 * s, y - 50 * s]]);
  polygon(g, tone(0x2d3440), [[cx - 155 * s, y - 50 * s], [cx + 150 * s, y - 50 * s], [cx + 158 * s, y - 80 * s], [cx - 162 * s, y - 80 * s]]);

  // Colorful containers stacked on the deck
  const colors = [0xe04b3a, 0x3a7fe0, 0xf2b233, 0x3fae5a];
  for (let row = 0; row < 3; row++) {
    for (let k = 0; k < 7; k++) {
      g.fillStyle(tone(colors[(k + row) % colors.length]), 1);
      g.fillRect(cx - 140 * s + k * 28 * s, y - 98 * s - row * 18 * s, 26 * s, 16 * s);
    }
  }

  // The white bridge tower (where the captain drives) and the chimney
  g.fillStyle(tone(0xf2f2f2), 1);
  g.fillRect(cx + 70 * s, y - 170 * s, 60 * s, 90 * s);
  g.fillStyle(tone(0x2d3440), 1);
  g.fillRect(cx + 74 * s, y - 162 * s, 52 * s, 8 * s); // the windows
  g.fillStyle(tone(0xe04b3a), 1);
  g.fillRect(cx + 108 * s, y - 196 * s, 16 * s, 26 * s);
}

// ------------------------------------------------------------------
// VENEZUELA (and GUYANA) — Angel Falls, the tallest waterfall in the world,
// falling from a "tepuy" (a mountain with a flat top like a table)
// ------------------------------------------------------------------
function drawSaltoAngel(g, tone, cx, y, s) {
  // The tepuy, with its shaded right side and green top
  polygon(g, tone(0x8a5a44), [[cx - 180 * s, y], [cx - 140 * s, y - 250 * s], [cx - 110 * s, y - 320 * s],
    [cx + 120 * s, y - 330 * s], [cx + 150 * s, y - 260 * s], [cx + 190 * s, y]]);
  polygon(g, tone(0x6a4232), [[cx + 40 * s, y], [cx + 60 * s, y - 200 * s], [cx + 120 * s, y - 330 * s],
    [cx + 150 * s, y - 260 * s], [cx + 190 * s, y]]);
  polygon(g, tone(0x4f8f3e), [[cx - 118 * s, y - 308 * s], [cx - 112 * s, y - 320 * s], [cx + 120 * s, y - 332 * s], [cx + 128 * s, y - 318 * s]]);
  // Lines in the rock (layers of stone)
  g.fillStyle(tone(0x744a38), 1);
  for (let k = 1; k < 5; k++) g.fillRect(cx - 130 * s + k * 6 * s, y - 60 * s * k, 90 * s, 3 * s);

  // The waterfall: a white ribbon that gets wider as it falls
  polygon(g, tone(0xeaf6ff), [[cx - 20 * s, y - 314 * s], [cx - 6 * s, y - 314 * s], [cx + 4 * s, y - 50 * s], [cx - 34 * s, y - 50 * s]]);
  polygon(g, tone(0xb8dcf2), [[cx - 14 * s, y - 300 * s], [cx - 10 * s, y - 300 * s], [cx - 8 * s, y - 50 * s], [cx - 18 * s, y - 50 * s]]);

  // The cloud of water drops at the bottom
  g.fillStyle(tone(0xffffff), 0.8);
  g.fillCircle(cx - 32 * s, y - 50 * s, 22 * s);
  g.fillCircle(cx - 4 * s, y - 56 * s, 26 * s);
  g.fillCircle(cx + 20 * s, y - 46 * s, 18 * s);

  // The jungle at the foot of the mountain
  for (let k = 0; k < 13; k++) {
    g.fillStyle(tone(k % 2 ? 0x2e7a3a : 0x3c8f45), 1);
    g.fillCircle(cx - 180 * s + k * 30 * s, y - 20 * s - pseudoRandom(k + 3) * 15 * s, 24 * s);
  }
}

// ------------------------------------------------------------------
// BOLIVIA — the Uyuni salt flat, with the cactus island and a llama
// ------------------------------------------------------------------
function cactus(g, tone, x, base, h, s) {
  g.fillStyle(tone(0x4f9a4a), 1);
  g.fillRoundedRect(x - 7 * s, base - h, 14 * s, h, 6 * s); // the trunk
  g.fillRoundedRect(x - 22 * s, base - h * 0.6, 10 * s, h * 0.3, 5 * s); // left arm
  g.fillRect(x - 17 * s, base - h * 0.36, 12 * s, 8 * s);
  g.fillRoundedRect(x + 12 * s, base - h * 0.75, 10 * s, h * 0.3, 5 * s); // right arm
  g.fillRect(x + 5 * s, base - h * 0.5, 12 * s, 8 * s);
}

function llama(g, tone, x, base, s) {
  const wool = tone(0xf3ece0);
  g.fillStyle(wool, 1);
  for (const lx of [-18, -8, 10, 20]) g.fillRect(x + lx * s, base - 34 * s, 5 * s, 34 * s); // legs
  g.fillEllipse(x, base - 40 * s, 56 * s, 28 * s); // body
  g.fillRect(x + 18 * s, base - 88 * s, 11 * s, 50 * s); // the long neck
  g.fillEllipse(x + 28 * s, base - 90 * s, 24 * s, 12 * s); // head
  g.fillTriangle(x + 18 * s, base - 94 * s, x + 23 * s, base - 94 * s, x + 20 * s, base - 108 * s); // ears
  g.fillStyle(tone(0x2b2b2b), 1);
  g.fillCircle(x + 28 * s, base - 92 * s, 2 * s); // eye
  // Colorful tassels on the ears and a blanket (like the llamas of the Andes)
  g.fillStyle(tone(0xe8407a), 1);
  g.fillCircle(x + 20 * s, base - 106 * s, 3 * s);
  g.fillRect(x - 12 * s, base - 54 * s, 24 * s, 12 * s);
  g.fillStyle(tone(0x3ab0e0), 1);
  g.fillRect(x - 12 * s, base - 46 * s, 24 * s, 4 * s);
}

function drawUyuni(g, tone, cx, y, s) {
  // Incahuasi, the rocky island in the middle of the salt
  polygon(g, tone(0xa58a66), [[cx - 170 * s, y], [cx - 120 * s, y - 70 * s], [cx - 50 * s, y - 120 * s],
    [cx + 30 * s, y - 112 * s], [cx + 110 * s, y - 80 * s], [cx + 170 * s, y]]);
  polygon(g, tone(0x86704f), [[cx + 30 * s, y - 112 * s], [cx + 110 * s, y - 80 * s], [cx + 170 * s, y], [cx + 50 * s, y]]);

  // Giant cactus all over it (some are older than 1000 years!)
  [[-120, 70, 90], [-60, 116, 120], [0, 112, 100], [60, 100, 130], [120, 74, 80]].forEach(([dx, up, h]) => {
    cactus(g, tone, cx + dx * s, y - up * s + 6 * s, h * s, s);
  });

  // A llama on the salt, in front
  llama(g, tone, cx + 140 * s, y, s);
}

// ------------------------------------------------------------------
// ECUADOR — the Middle of the World monument: here the Equator line
// splits the Earth in two halves
// ------------------------------------------------------------------
function drawMitadDelMundo(g, tone, cx, y, s) {
  const stone = tone(0xd8cdb2);
  const shade = tone(0xb3a78a);

  // The yellow Equator line painted on the ground
  g.fillStyle(tone(0xf2c230), 1);
  g.fillRect(cx - 180 * s, y - 6 * s, 360 * s, 6 * s);

  // The steps and the tall tower, thinner at the top
  g.fillStyle(shade, 1);
  g.fillRect(cx - 70 * s, y - 20 * s, 140 * s, 14 * s);
  polygon(g, stone, [[cx - 46 * s, y - 20 * s], [cx + 46 * s, y - 20 * s], [cx + 34 * s, y - 220 * s], [cx - 34 * s, y - 220 * s]]);
  polygon(g, shade, [[cx + 6 * s, y - 20 * s], [cx + 46 * s, y - 20 * s], [cx + 34 * s, y - 220 * s], [cx + 6 * s, y - 220 * s]]);
  g.fillStyle(tone(0x5a4e3a), 1);
  g.fillRect(cx - 10 * s, y - 56 * s, 20 * s, 36 * s); // the door
  g.fillStyle(shade, 1);
  g.fillRect(cx - 40 * s, y - 228 * s, 80 * s, 8 * s);

  // The big metal globe on top, with its Equator ring
  g.fillStyle(tone(0x5f6b78), 1);
  g.fillCircle(cx, y - 276 * s, 46 * s);
  g.fillStyle(tone(0x7c8a99), 1);
  g.fillCircle(cx - 14 * s, y - 290 * s, 18 * s); // a shiny spot
  g.fillStyle(tone(0xc9a64a), 1);
  g.fillRect(cx - 50 * s, y - 278 * s, 100 * s, 5 * s);
  g.fillRect(cx - 2 * s, y - 322 * s, 4 * s, 92 * s);
}

// ------------------------------------------------------------------
// URUGUAY — "La Mano", the giant hand coming out of the sand in Punta del Este
// ------------------------------------------------------------------
function drawMano(g, tone, cx, y, s) {
  const concrete = tone(0xd9d3c7);
  const shade = tone(0xb3ab9c);

  // The sand around the fingers
  g.fillStyle(tone(0xf0d9a0), 1);
  g.fillEllipse(cx, y, 380 * s, 60 * s);

  // The fingers: [where, how tall, how much it leans]. The last one is the thumb
  const fingers = [[-80, 120, -18], [-35, 190, -6], [10, 210, 4], [55, 170, 12], [105, 90, 40]];
  const base = y - 10 * s;
  const w = 34 * s;
  fingers.forEach(([dx, h, lean]) => {
    const x = cx + dx * s;
    const tipX = x + lean * s;
    const tipY = base - h * s;
    polygon(g, concrete, [[x - w / 2, base], [x + w / 2, base], [tipX + w / 2, tipY], [tipX - w / 2, tipY]]);
    g.fillStyle(concrete, 1);
    g.fillCircle(tipX, tipY, w / 2); // the round fingertip
    polygon(g, shade, [[x + w / 4, base], [x + w / 2, base], [tipX + w / 2, tipY], [tipX + w / 4, tipY]]);
    g.fillRect(x + (tipX - x) * 0.45 - w / 2, base + (tipY - base) * 0.45, w, 3 * s); // a knuckle line
  });
}

// ------------------------------------------------------------------
// GUATEMALA (also HONDURAS and BELICE) — a Mayan temple in the jungle,
// like the Temple of the Great Jaguar in Tikal
// ------------------------------------------------------------------
function drawTikal(g, tone, cx, y, s) {
  const stone = tone(0xb8ad94);
  const shade = tone(0x8f856e);
  const tierH = 24 * s;

  // Nine steep steps, with moss on the edges
  for (let i = 0; i < 9; i++) {
    const w = (200 - i * 14) * s;
    const top = y - (i + 1) * tierH;
    g.fillStyle(stone, 1);
    g.fillRect(cx - w / 2, top, w, tierH);
    g.fillStyle(shade, 1);
    g.fillRect(cx + w / 4, top, w / 4, tierH);
    g.fillStyle(tone(0x6f8f4f), 1);
    g.fillRect(cx - w / 2, top, w, 3 * s);
  }

  // The staircase in the middle
  const topBase = y - 9 * tierH;
  g.fillStyle(tone(0xcfc5ab), 1);
  g.fillRect(cx - 14 * s, topBase, 28 * s, 9 * tierH);
  g.fillStyle(shade, 1);
  for (let sy = topBase; sy < y; sy += 8 * s) g.fillRect(cx - 14 * s, sy, 28 * s, 2 * s);

  // The temple on top with a dark door, and the tall "roof comb" over it
  g.fillStyle(stone, 1);
  g.fillRect(cx - 34 * s, topBase - 40 * s, 68 * s, 40 * s);
  g.fillRect(cx - 26 * s, topBase - 100 * s, 52 * s, 60 * s);
  g.fillStyle(tone(0x3d372c), 1);
  g.fillRect(cx - 8 * s, topBase - 26 * s, 16 * s, 26 * s);
  for (let k = -1; k <= 1; k++) g.fillRect(cx + k * 14 * s - 4 * s, topBase - 84 * s, 8 * s, 10 * s);
  g.fillStyle(shade, 1);
  g.fillRect(cx + 10 * s, topBase - 100 * s, 16 * s, 100 * s);
}

// ------------------------------------------------------------------
// COSTA RICA (also NICARAGUA and EL SALVADOR) — a smoking volcano,
// like the Arenal volcano (a perfect cone!)
// ------------------------------------------------------------------
function drawVolcan(g, tone, cx, y, s) {
  // The green cone with its shaded right side
  polygon(g, tone(0x4f8a45), [[cx - 190 * s, y], [cx - 25 * s, y - 260 * s], [cx + 25 * s, y - 260 * s], [cx + 190 * s, y]]);
  polygon(g, tone(0x3d6e36), [[cx, y - 260 * s], [cx + 25 * s, y - 260 * s], [cx + 190 * s, y], [cx + 40 * s, y]]);

  // The dark rocky top, with a little bit of glowing lava
  polygon(g, tone(0x5b4a40), [[cx - 25 * s, y - 260 * s], [cx + 25 * s, y - 260 * s], [cx + 60 * s, y - 195 * s],
    [cx + 30 * s, y - 205 * s], [cx, y - 185 * s], [cx - 30 * s, y - 205 * s], [cx - 60 * s, y - 195 * s]]);
  g.fillStyle(tone(0xff6a1f), 1);
  g.fillRect(cx - 14 * s, y - 262 * s, 28 * s, 5 * s);
  polygon(g, tone(0xff8a1f), [[cx - 10 * s, y - 258 * s], [cx - 4 * s, y - 258 * s], [cx - 24 * s, y - 200 * s], [cx - 30 * s, y - 202 * s]]);

  // The smoke going up and to the side
  g.fillStyle(tone(0xb8b8b8), 0.85);
  g.fillCircle(cx + 6 * s, y - 282 * s, 20 * s);
  g.fillCircle(cx + 32 * s, y - 304 * s, 26 * s);
  g.fillCircle(cx + 68 * s, y - 318 * s, 30 * s);
}

// ------------------------------------------------------------------
// HAITÍ — the Citadelle Laferrière, a giant fortress on top of a mountain
// ------------------------------------------------------------------
function drawCiudadela(g, tone, cx, y, s) {
  // The mountain
  polygon(g, tone(0x4f8a45), [[cx - 200 * s, y], [cx - 70 * s, y - 195 * s], [cx + 100 * s, y - 190 * s], [cx + 200 * s, y]]);
  polygon(g, tone(0x3d6e36), [[cx + 20 * s, y - 192 * s], [cx + 100 * s, y - 190 * s], [cx + 200 * s, y], [cx + 60 * s, y]]);

  // The thick walls, with a pointy end like the front of a ship
  const wall = tone(0x8d7f6c);
  g.fillStyle(wall, 1);
  g.fillRect(cx - 100 * s, y - 280 * s, 160 * s, 92 * s);
  polygon(g, wall, [[cx + 60 * s, y - 280 * s], [cx + 125 * s, y - 234 * s], [cx + 60 * s, y - 188 * s]]);
  polygon(g, tone(0x6c604f), [[cx + 60 * s, y - 234 * s], [cx + 125 * s, y - 234 * s], [cx + 60 * s, y - 188 * s]]);
  g.fillRect(cx - 60 * s, y - 300 * s, 80 * s, 20 * s); // a higher part at the back

  // Rows of small windows for the cannons
  g.fillStyle(tone(0x3a3228), 1);
  for (let row = 0; row < 3; row++) {
    for (let wx = cx - 90 * s; wx < cx + 55 * s; wx += 20 * s) g.fillRect(wx, y - 268 * s + row * 26 * s, 8 * s, 8 * s);
  }
}

// ------------------------------------------------------------------
// PARAGUAY — the Itaipú dam, one of the biggest power plants in the world
// ------------------------------------------------------------------
function drawItaipu(g, tone, cx, y, s) {
  const concrete = tone(0xc8c4ba);
  const shade = tone(0xa29e94);

  // The lake behind the dam peeks over the top
  g.fillStyle(tone(0x3f8fd0), 1);
  g.fillRect(cx - 200 * s, y - 176 * s, 400 * s, 30 * s);

  // The giant wall with its pillars, and the road on top
  g.fillStyle(concrete, 1);
  g.fillRect(cx - 200 * s, y - 160 * s, 320 * s, 160 * s);
  g.fillStyle(shade, 1);
  for (let px = cx - 190 * s; px < cx + 110 * s; px += 32 * s) g.fillRect(px, y - 150 * s, 10 * s, 150 * s);
  g.fillStyle(tone(0x6e6a62), 1);
  g.fillRect(cx - 204 * s, y - 166 * s, 328 * s, 8 * s);

  // The spillway: the extra water rushing down in white foam
  polygon(g, tone(0xe6f3fb), [[cx + 120 * s, y - 160 * s], [cx + 200 * s, y - 160 * s], [cx + 215 * s, y], [cx + 110 * s, y]]);
  g.fillStyle(tone(0x9fd0ef), 1);
  for (let k = 0; k < 4; k++) g.fillRect(cx + 130 * s + k * 18 * s, y - 150 * s, 4 * s, 130 * s);
  g.fillStyle(tone(0xffffff), 0.85);
  g.fillCircle(cx + 140 * s, y - 14 * s, 20 * s);
  g.fillCircle(cx + 180 * s, y - 18 * s, 24 * s);

  // The river at the bottom
  g.fillStyle(tone(0x3f8fd0), 1);
  g.fillRect(cx - 210 * s, y - 12 * s, 430 * s, 12 * s);
}

// ------------------------------------------------------------------
// COLOMBIA — the Cocora Valley, with the wax palms (the tallest palms in the world!)
// ------------------------------------------------------------------
function waxPalm(g, tone, x, base, h, s) {
  polygon(g, tone(0xd8d4c4), [[x - 4 * s, base], [x + 4 * s, base], [x + 2 * s, base - h], [x - 2 * s, base - h]]);
  g.fillStyle(tone(0xaaa594), 1);
  for (let ry = base - 30 * s; ry > base - h; ry -= 30 * s) g.fillRect(x - 3.5 * s, ry, 7 * s, 2 * s); // rings
  palmLeaves(g, tone, x, base - h, 20 * s);
}

function drawCocora(g, tone, cx, y, s) {
  // The green hill
  g.fillStyle(tone(0x6fb05a), 1);
  g.fillEllipse(cx, y, 420 * s, 120 * s);

  // Very tall and thin palms
  [[-130, 220], [-70, 300], [-10, 250], [60, 320], [125, 240]].forEach(([dx, h]) => {
    waxPalm(g, tone, cx + dx * s, y - 20 * s, h * s, s);
  });

  // A little farmhouse with a red roof (coffee grows around here!)
  const hx = cx + 20 * s;
  g.fillStyle(tone(0xf5f0e6), 1);
  g.fillRect(hx, y - 40 * s, 44 * s, 26 * s);
  g.fillStyle(tone(0xc8432f), 1);
  g.fillTriangle(hx - 6 * s, y - 40 * s, hx + 50 * s, y - 40 * s, hx + 22 * s, y - 60 * s);
  g.fillStyle(tone(0x2f8f6a), 1);
  g.fillRect(hx + 16 * s, y - 30 * s, 12 * s, 16 * s); // a green door
}

// ------------------------------------------------------------------
// SANTA LUCÍA — the Pitons, two pointy green mountains by the sea
// ------------------------------------------------------------------
function drawPitones(g, tone, cx, y, s) {
  const green = tone(0x3f8a4a);
  const shade = tone(0x2f6c39);
  // Gros Piton (the big one) and Petit Piton (the thin one)
  polygon(g, green, [[cx - 190 * s, y], [cx - 110 * s, y - 200 * s], [cx - 85 * s, y - 270 * s], [cx - 65 * s, y - 272 * s],
    [cx - 40 * s, y - 190 * s], [cx + 10 * s, y - 70 * s], [cx + 50 * s, y - 180 * s], [cx + 75 * s, y - 300 * s],
    [cx + 90 * s, y - 302 * s], [cx + 110 * s, y - 200 * s], [cx + 180 * s, y]]);
  polygon(g, shade, [[cx - 65 * s, y - 272 * s], [cx - 40 * s, y - 190 * s], [cx + 5 * s, y - 70 * s], [cx - 40 * s, y]]);
  polygon(g, shade, [[cx + 90 * s, y - 302 * s], [cx + 110 * s, y - 200 * s], [cx + 180 * s, y], [cx + 95 * s, y]]);
  // Bare gray rock near the tops
  g.fillStyle(tone(0x8a8a80), 1);
  g.fillTriangle(cx - 85 * s, y - 270 * s, cx - 65 * s, y - 272 * s, cx - 78 * s, y - 240 * s);
  g.fillTriangle(cx + 75 * s, y - 300 * s, cx + 90 * s, y - 302 * s, cx + 84 * s, y - 270 * s);
}

// ------------------------------------------------------------------
// The CARIBBEAN ISLANDS — a striped lighthouse on the rocks, with palm trees
// ------------------------------------------------------------------
function drawFaro(g, tone, cx, y, s) {
  // The rocks
  g.fillStyle(tone(0x8a8277), 1);
  g.fillEllipse(cx, y - 6 * s, 220 * s, 60 * s);
  g.fillStyle(tone(0x6e675e), 1);
  g.fillEllipse(cx + 40 * s, y - 2 * s, 120 * s, 40 * s);

  // The tower, thinner at the top, with red and white stripes
  const bottom = y - 20 * s;
  const height = 220 * s;
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    const y1 = bottom - (height * i) / bands;
    const y2 = bottom - (height * (i + 1)) / bands;
    const w1 = 25 * s - (10 * s * i) / bands;
    const w2 = 25 * s - (10 * s * (i + 1)) / bands;
    polygon(g, tone(i % 2 ? 0xffffff : 0xd8322a), [[cx - w1, y1], [cx + w1, y1], [cx + w2, y2], [cx - w2, y2]]);
  }

  // The balcony, the lamp room with its glow, and the red roof
  const top = bottom - height;
  g.fillStyle(tone(0x2b2b2b), 1);
  g.fillRect(cx - 22 * s, top - 6 * s, 44 * s, 6 * s);
  g.fillStyle(tone(0xfff3a0), 0.4);
  g.fillCircle(cx, top - 20 * s, 34 * s);
  g.fillStyle(tone(0xffe14d), 1);
  g.fillRect(cx - 12 * s, top - 30 * s, 24 * s, 24 * s);
  g.fillStyle(tone(0xd8322a), 1);
  g.fillTriangle(cx - 17 * s, top - 30 * s, cx + 17 * s, top - 30 * s, cx, top - 54 * s);

  // Two palm trees next to it
  palm(g, tone, cx - 95 * s, y - 10 * s, 110 * s, -15 * s, s);
  palm(g, tone, cx + 90 * s, y - 10 * s, 130 * s, 20 * s, s);
}

// ------------------------------------------------------------------
// The RAINFOREST — a giant ceiba tree with a macaw (guacamayo) on a branch
// ------------------------------------------------------------------
function drawCeiba(g, tone, cx, y, s) {
  const bark = tone(0x8a6a4a);
  // The trunk with its big roots like walls (they hold the giant tree up)
  polygon(g, bark, [[cx - 60 * s, y], [cx - 22 * s, y - 30 * s], [cx - 16 * s, y - 210 * s], [cx + 16 * s, y - 210 * s], [cx + 22 * s, y - 30 * s], [cx + 60 * s, y]]);
  polygon(g, tone(0x6c5038), [[cx + 4 * s, y - 210 * s], [cx + 16 * s, y - 210 * s], [cx + 22 * s, y - 30 * s], [cx + 60 * s, y], [cx + 10 * s, y]]);
  // Two big branches
  polygon(g, bark, [[cx - 10 * s, y - 200 * s], [cx - 110 * s, y - 240 * s], [cx - 104 * s, y - 248 * s], [cx, y - 214 * s]]);
  polygon(g, bark, [[cx + 10 * s, y - 200 * s], [cx + 110 * s, y - 236 * s], [cx + 104 * s, y - 244 * s], [cx, y - 214 * s]]);

  // The wide flat crown, like an umbrella
  g.fillStyle(tone(0x2f7a3a), 1);
  g.fillEllipse(cx, y - 252 * s, 320 * s, 80 * s);
  g.fillStyle(tone(0x3f9a4c), 1);
  g.fillEllipse(cx - 80 * s, y - 270 * s, 150 * s, 60 * s);
  g.fillEllipse(cx + 70 * s, y - 272 * s, 160 * s, 60 * s);
  g.fillEllipse(cx, y - 290 * s, 170 * s, 50 * s);

  // Vines hanging down
  g.lineStyle(2 * s, tone(0x3f7a35), 1);
  [-120, -70, 60, 130].forEach((dx, k) => g.lineBetween(cx + dx * s, y - 230 * s, cx + dx * s, y - (150 - k * 15) * s));

  // A red macaw sitting on the right branch
  const bx = cx + 70 * s;
  const by = y - 236 * s;
  g.fillStyle(tone(0xe0302a), 1);
  g.fillEllipse(bx, by, 14 * s, 22 * s);
  g.fillCircle(bx, by - 13 * s, 7 * s);
  g.fillStyle(tone(0x2f6fd8), 1);
  g.fillEllipse(bx + 4 * s, by + 2 * s, 8 * s, 16 * s); // blue wing
  g.fillTriangle(bx - 3 * s, by + 8 * s, bx + 3 * s, by + 8 * s, bx, by + 30 * s); // long tail
  g.fillStyle(tone(0xf2c230), 1);
  g.fillRect(bx + 2 * s, by - 4 * s, 4 * s, 4 * s); // yellow feathers
  g.fillStyle(tone(0xf5f0e6), 1);
  g.fillTriangle(bx + 5 * s, by - 16 * s, bx + 12 * s, by - 12 * s, bx + 5 * s, by - 8 * s); // beak
}

// ------------------------------------------------------------------
// The list of landmarks of this region (names are used in THEMES below)
// ------------------------------------------------------------------
export const LANDMARKS = {
  moai: { background: drawBeach, landmark: drawMoai, size: 1.0 },
  capitolio: { background: drawBeach, landmark: drawCapitolio, size: 1.0 }, // Havana is by the sea
  canalpanama: { background: drawRainforest, landmark: drawCanal, size: 1.0 },
  saltoangel: { background: drawRainforest, landmark: drawSaltoAngel, size: 1.0 },
  uyuni: { background: drawSaltFlat, landmark: drawUyuni, size: 1.15 },
  mitadmundo: { background: drawAndes, landmark: drawMitadDelMundo, size: 1.0 },
  manopunta: { background: drawBeach, landmark: drawMano, size: 1.0 },
  tikal: { background: drawRainforest, landmark: drawTikal, size: 1.0 },
  volcanarenal: { background: drawRainforest, landmark: drawVolcan, size: 1.0 },
  ciudadela: { background: drawGreenMountains, landmark: drawCiudadela, size: 1.0 },
  itaipu: { background: drawRainforest, landmark: drawItaipu, size: 1.15 },
  cocora: { background: drawGreenMountains, landmark: drawCocora, size: 1.0 },
  pitones: { background: drawBeach, landmark: drawPitones, size: 1.0 },
  // Shared by many countries:
  faro: { background: drawBeach, landmark: drawFaro, size: 1.0 }, // the Caribbean islands
  ceiba: { background: drawRainforest, landmark: drawCeiba, size: 1.0 }, // the rainforest
};

// ------------------------------------------------------------------
// Which scenery each country gets. "place" is shown on the intro screen as
// "Cerca de ..." (null = no special place, just the scenery)
// ------------------------------------------------------------------
export const THEMES = {
  // Central America
  GTM: { landmark: 'tikal', place: 'el templo de Tikal' },
  BLZ: { landmark: 'tikal', place: 'el templo maya de Xunantunich' },
  HND: { landmark: 'tikal', place: 'las ruinas mayas de Copán' },
  SLV: { landmark: 'volcanarenal', place: 'el volcán de Santa Ana' },
  NIC: { landmark: 'volcanarenal', place: 'el volcán Concepción' },
  CRI: { landmark: 'volcanarenal', place: 'el volcán Arenal' },
  PAN: { landmark: 'canalpanama', place: 'el Canal de Panamá' },
  // The Caribbean
  CUB: { landmark: 'capitolio', place: 'el Capitolio de La Habana' },
  HTI: { landmark: 'ciudadela', place: 'la Ciudadela Laferrière' },
  LCA: { landmark: 'pitones', place: 'los Pitones' },
  DOM: { landmark: 'faro', place: 'las playas de Punta Cana' },
  JAM: { landmark: 'faro', place: null },
  BHS: { landmark: 'faro', place: null },
  BRB: { landmark: 'faro', place: null },
  ATG: { landmark: 'faro', place: null },
  KNA: { landmark: 'faro', place: null },
  VCT: { landmark: 'faro', place: null },
  GRD: { landmark: 'faro', place: null },
  TTO: { landmark: 'faro', place: null },
  DMA: { landmark: 'ceiba', place: null }, // "the nature island", covered in rainforest
  // South America
  COL: { landmark: 'cocora', place: 'el Valle de Cocora' },
  VEN: { landmark: 'saltoangel', place: 'el Salto Ángel' },
  GUY: { landmark: 'saltoangel', place: 'las cataratas de Kaieteur' },
  SUR: { landmark: 'ceiba', place: 'la selva tropical' },
  ECU: { landmark: 'mitadmundo', place: 'la Mitad del Mundo' },
  BOL: { landmark: 'uyuni', place: 'el Salar de Uyuni' },
  CHL: { landmark: 'moai', place: 'los moáis de la Isla de Pascua' },
  PRY: { landmark: 'itaipu', place: 'la represa de Itaipú' },
  URY: { landmark: 'manopunta', place: 'la Mano de Punta del Este' },
};
