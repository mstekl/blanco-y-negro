// europa.js — The scenery behind the levels of the countries of EUROPA.
//
// France, the UK, Italy and Greece are drawn in LandmarkArt.js. Here are all the
// other ones: some countries have their OWN famous building (the Sagrada Familia,
// San Basilio, the windmills...) and the rest share a few sceneries of their part
// of Europe (a castle on a hill, a Nordic forest, a church with golden domes, a
// white village by the sea).
//
// Remember: EVERY color goes through tone(), because each scene is drawn twice
// (once gray, once in color). A landmark is drawn at cx, standing on y, and s is
// how big it is (1 = normal size).
//
// LANDMARKS: drawing name → { background, landmark, size } (like in LandmarkArt.js)
// THEMES:    3-letter country code → { landmark, place }  (like in countryThemes.js)

import { GROUND, pseudoRandom, polygon, nearSpot } from './helpers.js';

// ------------------------------------------------------------------
// Little helpers that several drawings use
// ------------------------------------------------------------------

// A strip of sea along the bottom, with light little waves
function sea(g, tone, span) {
  g.fillStyle(tone(0x3f8fd0), 1);
  g.fillRect(0, GROUND - 40, span + 200, 80);
  g.fillStyle(tone(0x8cc8f0), 1);
  for (let x = 10, i = 0; x < span + 200; x += 70, i++) {
    g.fillRect(x, GROUND - 30 + pseudoRandom(i + 3) * 25, 28, 3);
  }
}

// A pine tree: a brown trunk and three green triangles on top of each other
function pine(g, tone, x, base, h, color = 0x2f6b3f) {
  g.fillStyle(tone(0x6b4a2e), 1);
  g.fillRect(x - h * 0.04, base - h * 0.2, h * 0.08, h * 0.2);
  g.fillStyle(tone(color), 1);
  for (let k = 0; k < 3; k++) {
    const bottom = base - h * (0.15 + k * 0.25);
    const half = h * (0.3 - k * 0.07);
    g.fillTriangle(x - half, bottom, x + half, bottom, x, bottom - h * 0.4);
  }
}

// A row of pine trees across the whole width (leaving room for the landmarks)
function pineForest(g, tone, span, spots, gap) {
  for (let x = 20, i = 0; x < span + 100; x += 55, i++) {
    if (nearSpot(spots, x, gap)) continue;
    const h = 70 + pseudoRandom(i + 5) * 60;
    pine(g, tone, x + pseudoRandom(i + 2) * 20, GROUND, h, i % 2 ? 0x2f6b3f : 0x3d7d4a);
  }
}

// A little house: a box with a triangle roof and a window
function house(g, tone, x, base, w, h, wall, roof) {
  g.fillStyle(tone(wall), 1);
  g.fillRect(x - w / 2, base - h, w, h);
  g.fillStyle(tone(roof), 1);
  g.fillTriangle(x - w / 2 - w * 0.1, base - h, x + w / 2 + w * 0.1, base - h, x, base - h - w * 0.5);
  g.fillStyle(tone(0x3a3a48), 1);
  g.fillRect(x - w * 0.12, base - h * 0.65, w * 0.24, h * 0.3);
}

// An "onion" dome (the round, pointy roofs of Russian churches).
// It sits on top of a tower whose top is at neckY.
function onion(g, tone, x, neckY, w, color) {
  g.fillStyle(tone(color), 1);
  g.fillEllipse(x, neckY - w * 0.4, w, w * 0.85);
  g.fillTriangle(x - w * 0.32, neckY - w * 0.65, x + w * 0.32, neckY - w * 0.65, x, neckY - w * 1.25);
  // A shiny spot, so it looks round
  g.fillStyle(tone(0xffffff), 0.35);
  g.fillEllipse(x - w * 0.18, neckY - w * 0.5, w * 0.2, w * 0.35);
  // The golden spike on top
  g.fillStyle(tone(0xe6b422), 1);
  g.fillRect(x - w * 0.04, neckY - w * 1.5, w * 0.08, w * 0.3);
}

// A stone arch bridge: the curved top and the round hole underneath
function arch(g, tone, cx, base, half, h, thick, color) {
  const points = [];
  for (let k = 0; k <= 12; k++) { // the outside curve, left to right
    const a = Math.PI - (k / 12) * Math.PI;
    points.push([cx + Math.cos(a) * (half + thick), base - Math.sin(a) * (h + thick)]);
  }
  for (let k = 12; k >= 0; k--) { // the inside curve, right to left
    const a = Math.PI - (k / 12) * Math.PI;
    points.push([cx + Math.cos(a) * half, base - Math.sin(a) * h]);
  }
  polygon(g, tone(color), points);
}

// ------------------------------------------------------------------
// ESPAÑA — the Sagrada Familia in Barcelona (still being built after 140 years!)
// ------------------------------------------------------------------

// One of its tall towers: thinner at the top, with a colorful ball on the tip
function spire(g, tone, x, base, w, h, ball) {
  polygon(g, tone(0xc9b48a), [[x - w / 2, base], [x + w / 2, base], [x + w * 0.15, base - h], [x - w * 0.15, base - h]]);
  polygon(g, tone(0xa8956c), [[x, base], [x + w / 2, base], [x + w * 0.15, base - h], [x, base - h]]);
  g.fillStyle(tone(0x5a4a3a), 1); // little holes going up
  for (let k = 1; k < 6; k++) g.fillRect(x - w * 0.08, base - h * (0.3 + k * 0.1), w * 0.16, w * 0.16);
  g.fillStyle(tone(ball), 1);
  g.fillCircle(x, base - h, w * 0.3);
}

function drawSagrada(g, tone, cx, y, s) {
  // The tallest tower in the middle, with a cross on top
  spire(g, tone, cx, y, 44 * s, 330 * s, 0xf0e6c8);
  g.fillStyle(tone(0xf0e6c8), 1);
  g.fillRect(cx - 2 * s, y - 368 * s, 4 * s, 26 * s);
  g.fillRect(cx - 9 * s, y - 360 * s, 18 * s, 4 * s);
  // The four towers of the front, the middle two a bit taller
  [[-95, 230, 0xe8562a], [-50, 285, 0xf2c12e], [50, 285, 0x3fa34d], [95, 230, 0x2a6fc0]].forEach(([dx, h, ball]) => {
    spire(g, tone, cx + dx * s, y, 30 * s, h * s, ball);
  });
  // The church body in front, with three tall pointy doors
  g.fillStyle(tone(0xbfa77a), 1);
  g.fillRect(cx - 130 * s, y - 110 * s, 260 * s, 110 * s);
  g.fillStyle(tone(0x5a4a3a), 1);
  [-60, 0, 60].forEach((dx) => {
    g.fillRect(cx + dx * s - 13 * s, y - 60 * s, 26 * s, 60 * s);
    g.fillTriangle(cx + dx * s - 13 * s, y - 60 * s, cx + dx * s + 13 * s, y - 60 * s, cx + dx * s, y - 88 * s);
  });
}

// ------------------------------------------------------------------
// ALEMANIA — the Brandenburg Gate in Berlin, with its horse chariot on top
// ------------------------------------------------------------------
function drawBrandeburgo(g, tone, cx, y, s) {
  const stone = tone(0xe2d3b0);
  const shade = tone(0xbfae88);
  // The steps and the six columns
  g.fillStyle(shade, 1);
  g.fillRect(cx - 140 * s, y - 14 * s, 280 * s, 14 * s);
  g.fillStyle(stone, 1);
  for (let k = 0; k < 6; k++) g.fillRect(cx - 128 * s + k * 48 * s, y - 150 * s, 16 * s, 136 * s);
  // The big beam on the columns and the block on top (the "attic")
  g.fillRect(cx - 140 * s, y - 175 * s, 280 * s, 25 * s);
  g.fillStyle(shade, 1);
  g.fillRect(cx - 140 * s, y - 158 * s, 280 * s, 4 * s);
  g.fillStyle(stone, 1);
  g.fillRect(cx - 80 * s, y - 205 * s, 160 * s, 30 * s);
  // The Quadriga: a green chariot pulled by four horses
  const green = tone(0x4f9a7c);
  g.fillStyle(green, 1);
  for (let k = 0; k < 4; k++) {
    const hx = cx - 42 * s + k * 18 * s;
    g.fillRect(hx, y - 228 * s, 16 * s, 10 * s); // the body of a horse
    g.fillRect(hx + 2 * s, y - 218 * s, 3 * s, 13 * s); // legs
    g.fillRect(hx + 11 * s, y - 218 * s, 3 * s, 13 * s);
    g.fillRect(hx - 3 * s, y - 240 * s, 6 * s, 14 * s); // the neck and head up high
  }
  g.fillRect(cx + 34 * s, y - 232 * s, 22 * s, 27 * s); // the chariot
  g.fillRect(cx + 42 * s, y - 262 * s, 6 * s, 30 * s); // the goddess holding...
  g.fillRect(cx + 46 * s, y - 285 * s, 3 * s, 25 * s); // ...her staff
  g.fillCircle(cx + 47.5 * s, y - 288 * s, 6 * s);
}

// ------------------------------------------------------------------
// RUSIA — St Basil's Cathedral in Moscow, with its colorful onion domes
// ------------------------------------------------------------------
function drawBasilio(g, tone, cx, y, s) {
  // The red brick body
  g.fillStyle(tone(0xb03a2e), 1);
  g.fillRect(cx - 140 * s, y - 90 * s, 280 * s, 90 * s);
  g.fillStyle(tone(0xf0e6d2), 1);
  g.fillRect(cx - 140 * s, y - 94 * s, 280 * s, 6 * s);
  // The tall tent tower in the middle, green with a small gold dome
  g.fillStyle(tone(0xc04a38), 1);
  g.fillRect(cx - 24 * s, y - 190 * s, 48 * s, 100 * s);
  polygon(g, tone(0x3f9a5c), [[cx - 26 * s, y - 190 * s], [cx + 26 * s, y - 190 * s], [cx, y - 300 * s]]);
  onion(g, tone, cx, y - 296 * s, 22 * s, 0xe6b422);
  // Four towers around it, each one with an onion dome of a different color
  [[-110, 150, 0x2a6fc0], [-60, 180, 0xe6b422], [60, 180, 0x3f9a5c], [110, 150, 0xd8322a]].forEach(([dx, h, color]) => {
    const tx = cx + dx * s;
    g.fillStyle(tone(0xc04a38), 1);
    g.fillRect(tx - 16 * s, y - h * s, 32 * s, h * s - 90 * s);
    g.fillStyle(tone(0xf0e6d2), 1);
    g.fillRect(tx - 18 * s, y - h * s, 36 * s, 5 * s);
    onion(g, tone, tx, y - h * s, 44 * s, color);
  });
  // A dark door in the middle
  g.fillStyle(tone(0x3a2a24), 1);
  g.fillRect(cx - 14 * s, y - 50 * s, 28 * s, 50 * s);
}

// ------------------------------------------------------------------
// PAÍSES BAJOS — windmills and fields of tulips
// ------------------------------------------------------------------
function drawTulips(g, tone, span) {
  const colors = [0xe8323c, 0xf2c12e, 0xe86fb0, 0xf07a2a];
  for (let row = 0; row < 3; row++) {
    for (let x = 5, i = 0; x < span + 150; x += 14, i++) {
      g.fillStyle(tone(colors[(row + Math.floor(i / 12)) % colors.length]), 1);
      g.fillCircle(x + row * 5, GROUND - 6 - row * 9, 4);
    }
  }
}

function windmill(g, tone, cx, y, s) {
  // The body: wide at the bottom, narrow at the top
  polygon(g, tone(0x6b4a32), [[cx - 34 * s, y], [cx + 34 * s, y], [cx + 20 * s, y - 150 * s], [cx - 20 * s, y - 150 * s]]);
  g.fillStyle(tone(0xf0e6d2), 1);
  g.fillRect(cx - 9 * s, y - 34 * s, 18 * s, 34 * s); // the door
  g.fillRect(cx - 6 * s, y - 100 * s, 12 * s, 14 * s); // a window
  // The roof (the cap)
  g.fillStyle(tone(0x3e4a44), 1);
  g.fillEllipse(cx, y - 152 * s, 46 * s, 30 * s);
  // The four sails, crossed like an X
  const hubY = y - 150 * s;
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const side = 9 * s; // how wide each sail is
    const start = 10 * s;
    const end = 115 * s;
    polygon(g, tone(0xf4efe0), [
      [cx + dx * start, hubY + dy * start], [cx + dx * end, hubY + dy * end],
      [cx + dx * end - dy * side * 2, hubY + dy * end + dx * side * 2],
      [cx + dx * start - dy * side * 2, hubY + dy * start + dx * side * 2],
    ]);
    g.lineStyle(3 * s, tone(0x7a5c3c), 1); // the wooden pole of the sail
    g.lineBetween(cx, hubY, cx + dx * end, hubY + dy * end);
  }
  g.fillStyle(tone(0x3e4a44), 1);
  g.fillCircle(cx, hubY, 7 * s);
}

function drawMolinos(g, tone, cx, y, s) {
  windmill(g, tone, cx + 120 * s, y, s * 0.7);
  windmill(g, tone, cx, y, s * 1.3);
}

// ------------------------------------------------------------------
// PORTUGAL — the Belém Tower in Lisbon, standing in the river by the sea
// ------------------------------------------------------------------
function battlements(g, tone, x, top, w, s, color) {
  g.fillStyle(tone(color), 1);
  for (let bx = x; bx < x + w - 4 * s; bx += 12 * s) g.fillRect(bx, top - 8 * s, 7 * s, 8 * s);
}

function drawBelem(g, tone, cx, y, s) {
  const stone = tone(0xece0c4);
  const shade = tone(0xc9b998);
  // The wide bastion at the bottom, half in the water
  g.fillStyle(shade, 1);
  g.fillRect(cx - 120 * s, y - 90 * s, 240 * s, 90 * s);
  battlements(g, tone, cx - 120 * s, y - 90 * s, 240 * s, s, 0xc9b998);
  // The tall square tower
  g.fillStyle(stone, 1);
  g.fillRect(cx - 50 * s, y - 260 * s, 100 * s, 170 * s);
  g.fillStyle(shade, 1);
  g.fillRect(cx + 20 * s, y - 260 * s, 30 * s, 170 * s);
  battlements(g, tone, cx - 50 * s, y - 260 * s, 100 * s, s, 0xece0c4);
  // The balcony and the windows with round tops
  g.fillStyle(stone, 1);
  g.fillRect(cx - 60 * s, y - 165 * s, 120 * s, 10 * s);
  g.fillStyle(tone(0x4a453c), 1);
  [-22, 0, 22].forEach((dx) => {
    g.fillRect(cx + dx * s - 6 * s, y - 210 * s, 12 * s, 26 * s);
    g.fillCircle(cx + dx * s, y - 210 * s, 6 * s);
  });
  // The little round lookout towers on the corners, with domes
  [-50, 50].forEach((dx) => {
    g.fillStyle(stone, 1);
    g.fillRect(cx + dx * s - 7 * s, y - 285 * s, 14 * s, 25 * s);
    g.fillEllipse(cx + dx * s, y - 287 * s, 16 * s, 16 * s);
  });
}

// ------------------------------------------------------------------
// SUIZA — the Matterhorn (el Cervino), a mountain with a bent tip, and a chalet.
// Liechtenstein and Andorra are in the mountains too, so they use it as well.
// ------------------------------------------------------------------
function drawAlpineVillage(g, tone, span, spots) {
  pineForest(g, tone, span, spots, 200);
  // A few wooden chalets among the trees
  for (let x = 90, i = 0; x < span + 100; x += 330, i++) {
    if (nearSpot(spots, x, 220)) continue;
    house(g, tone, x, GROUND, 60, 40, 0x9a6a3e, 0xb03a2e);
  }
}

function drawCervino(g, tone, cx, y, s) {
  // The rocky mountain: its tip bends a little to the left
  polygon(g, tone(0x8f8a84), [[cx - 190 * s, y], [cx - 40 * s, y - 260 * s], [cx - 25 * s, y - 340 * s], [cx + 10 * s, y - 300 * s], [cx + 190 * s, y]]);
  polygon(g, tone(0x6e6a64), [[cx - 25 * s, y - 340 * s], [cx + 10 * s, y - 300 * s], [cx + 190 * s, y], [cx + 20 * s, y]]);
  // Snow on the top and in some cracks
  polygon(g, tone(0xffffff), [
    [cx - 52 * s, y - 230 * s], [cx - 40 * s, y - 260 * s], [cx - 25 * s, y - 340 * s], [cx + 10 * s, y - 300 * s],
    [cx + 45 * s, y - 225 * s], [cx + 15 * s, y - 245 * s], [cx - 10 * s, y - 215 * s], [cx - 30 * s, y - 245 * s],
  ]);
  // A chalet in front, at the foot of the mountain
  house(g, tone, cx - 95 * s, y, 70 * s, 45 * s, 0x9a6a3e, 0xb03a2e);
  g.fillStyle(tone(0xd8322a), 1); // a Swiss-style balcony
  g.fillRect(cx - 132 * s, y - 28 * s, 74 * s, 5 * s);
}

// ------------------------------------------------------------------
// NORUEGA — a fjord: tall cliffs with the sea between them and a waterfall
// ------------------------------------------------------------------
function drawFjordShore(g, tone, span, spots) {
  sea(g, tone, span);
  pineForest(g, tone, span, spots, 230);
}

function drawFiordo(g, tone, cx, y, s) {
  // The water that goes deep between the mountains
  polygon(g, tone(0x2f7fc0), [[cx - 60 * s, y], [cx + 60 * s, y], [cx + 15 * s, y - 120 * s], [cx - 15 * s, y - 120 * s]]);
  // The two steep cliffs (green on top, gray rock)
  polygon(g, tone(0x6f7a72), [[cx - 200 * s, y], [cx - 200 * s, y - 230 * s], [cx - 110 * s, y - 280 * s], [cx - 30 * s, y - 200 * s], [cx - 60 * s, y]]);
  polygon(g, tone(0x5a645c), [[cx + 200 * s, y], [cx + 200 * s, y - 210 * s], [cx + 100 * s, y - 300 * s], [cx + 30 * s, y - 190 * s], [cx + 60 * s, y]]);
  g.fillStyle(tone(0x4f8f4a), 1);
  g.fillEllipse(cx - 120 * s, y - 270 * s, 150 * s, 30 * s);
  g.fillEllipse(cx + 110 * s, y - 285 * s, 130 * s, 30 * s);
  // A waterfall falling down the left cliff
  g.fillStyle(tone(0xe8f4ff), 1);
  g.fillRect(cx - 100 * s, y - 255 * s, 9 * s, 230 * s);
  g.fillEllipse(cx - 95.5 * s, y - 22 * s, 34 * s, 14 * s);
  // Little red houses on the shore and a boat in the water
  house(g, tone, cx + 105 * s, y, 32 * s, 24 * s, 0xb0302a, 0x3e4a44);
  house(g, tone, cx + 150 * s, y, 26 * s, 20 * s, 0xb0302a, 0x3e4a44);
  polygon(g, tone(0xf0e6d2), [[cx - 20 * s, y - 30 * s], [cx + 20 * s, y - 30 * s], [cx + 14 * s, y - 20 * s], [cx - 14 * s, y - 20 * s]]);
  g.fillStyle(tone(0xd8322a), 1);
  g.fillTriangle(cx, y - 32 * s, cx, y - 62 * s, cx + 16 * s, y - 34 * s); // the sail
}

// ------------------------------------------------------------------
// CIUDAD DEL VATICANO — St Peter's Basilica, with its giant dome
// ------------------------------------------------------------------
function drawSanPedro(g, tone, cx, y, s) {
  const stone = tone(0xece0c4);
  const shade = tone(0xc9b998);
  // The two curved rows of columns that "hug" the square (we see them from the front)
  g.fillStyle(shade, 1);
  g.fillRect(cx - 200 * s, y - 60 * s, 400 * s, 60 * s);
  g.fillStyle(stone, 1);
  for (let x = cx - 196 * s; x < cx + 196 * s; x += 16 * s) g.fillRect(x, y - 56 * s, 7 * s, 56 * s);
  // The front of the church, with its tall columns
  g.fillStyle(stone, 1);
  g.fillRect(cx - 110 * s, y - 150 * s, 220 * s, 150 * s);
  g.fillStyle(shade, 1);
  for (let k = 0; k < 8; k++) g.fillRect(cx - 104 * s + k * 28 * s, y - 135 * s, 10 * s, 115 * s);
  g.fillRect(cx - 115 * s, y - 158 * s, 230 * s, 10 * s);
  polygon(g, stone, [[cx - 40 * s, y - 158 * s], [cx + 40 * s, y - 158 * s], [cx, y - 180 * s]]); // the small triangle
  // The big dome: a drum, the round dome, and the little lantern on top with a cross
  g.fillStyle(stone, 1);
  g.fillRect(cx - 60 * s, y - 215 * s, 120 * s, 40 * s);
  g.fillStyle(tone(0x7a9ab0), 1);
  g.fillEllipse(cx, y - 215 * s, 120 * s, 120 * s);
  g.fillStyle(stone, 1);
  g.fillRect(cx - 62 * s, y - 218 * s, 124 * s, 8 * s);
  g.fillRect(cx - 9 * s, y - 300 * s, 18 * s, 26 * s);
  g.fillEllipse(cx, y - 300 * s, 20 * s, 14 * s);
  g.fillStyle(tone(0xe6b422), 1);
  g.fillRect(cx - 1.5 * s, y - 330 * s, 3 * s, 26 * s);
  g.fillRect(cx - 7 * s, y - 322 * s, 14 * s, 3 * s);
}

// ------------------------------------------------------------------
// DINAMARCA — the Little Mermaid on her rock, and the colorful houses of Nyhavn
// ------------------------------------------------------------------
function drawNyhavn(g, tone, span, spots) {
  const colors = [0xe8562a, 0xf2c12e, 0x2a6fc0, 0xe86fb0, 0x3fa34d, 0xf0a23a];
  for (let x = 0, i = 0; x < span + 100; x += 46, i++) {
    if (nearSpot(spots, x, 170)) continue;
    const h = 90 + pseudoRandom(i + 4) * 50;
    g.fillStyle(tone(colors[i % colors.length]), 1);
    g.fillRect(x, GROUND - h, 44, h);
    g.fillTriangle(x, GROUND - h, x + 44, GROUND - h, x + 22, GROUND - h - 22); // pointy roof
    g.fillStyle(tone(0xf4f0e0), 1);
    for (let wy = GROUND - h + 12; wy < GROUND - 50; wy += 24) {
      g.fillRect(x + 8, wy, 9, 12);
      g.fillRect(x + 27, wy, 9, 12);
    }
  }
  sea(g, tone, span);
}

function drawSirenita(g, tone, cx, y, s) {
  // The big rock in the water
  g.fillStyle(tone(0x7a7a72), 1);
  g.fillEllipse(cx, y - 30 * s, 220 * s, 100 * s);
  g.fillStyle(tone(0x5f5f58), 1);
  g.fillEllipse(cx + 40 * s, y - 25 * s, 110 * s, 70 * s);
  // The mermaid (a green bronze statue): the tail curled on the rock...
  const bronze = tone(0x5aa088);
  g.fillStyle(bronze, 1);
  g.fillEllipse(cx + 10 * s, y - 85 * s, 90 * s, 28 * s);
  g.fillTriangle(cx + 50 * s, y - 85 * s, cx + 80 * s, y - 102 * s, cx + 78 * s, y - 70 * s); // the fin
  // ...her body, sitting up and looking down at the sea...
  polygon(g, bronze, [[cx - 30 * s, y - 92 * s], [cx - 6 * s, y - 92 * s], [cx - 12 * s, y - 150 * s], [cx - 30 * s, y - 150 * s]]);
  g.fillCircle(cx - 22 * s, y - 162 * s, 13 * s);
  // ...and her long hair
  g.fillStyle(tone(0x4a8a74), 1);
  g.fillEllipse(cx - 14 * s, y - 145 * s, 14 * s, 40 * s);
}

// ------------------------------------------------------------------
// BÉLGICA — the Atomium in Brussels: a giant iron crystal made of balls
// ------------------------------------------------------------------
function drawAtomium(g, tone, cx, y, s) {
  // Where the 9 balls are (like a cube standing on one corner)
  const balls = [[0, -310], [-95, -250], [95, -250], [0, -195], [-95, -140], [95, -140], [-45, -170], [45, -220], [0, -80]];
  // The tubes that join them
  g.lineStyle(9 * s, tone(0xa8b0bc), 1);
  const joins = [[0, 1], [0, 2], [1, 4], [2, 5], [4, 8], [5, 8], [3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 8], [6, 3], [7, 3]];
  joins.forEach(([a, b]) => g.lineBetween(cx + balls[a][0] * s, y + balls[a][1] * s, cx + balls[b][0] * s, y + balls[b][1] * s));
  // Three legs down to the ground
  g.lineBetween(cx, y - 80 * s, cx, y);
  g.lineBetween(cx - 95 * s, y - 140 * s, cx - 120 * s, y);
  g.lineBetween(cx + 95 * s, y - 140 * s, cx + 120 * s, y);
  // The shiny silver balls
  balls.forEach(([bx, by]) => {
    g.fillStyle(tone(0xc8ced6), 1);
    g.fillCircle(cx + bx * s, y + by * s, 24 * s);
    g.fillStyle(tone(0xffffff), 0.6);
    g.fillCircle(cx + bx * s - 8 * s, y + by * s - 8 * s, 7 * s);
  });
}

// ------------------------------------------------------------------
// CHEQUIA — the Charles Bridge in Prague, over the river, with its old tower
// ------------------------------------------------------------------
function drawPuenteCarlos(g, tone, cx, y, s) {
  const stone = tone(0x8a7a66);
  // The river under the bridge
  g.fillStyle(tone(0x3f8fd0), 1);
  g.fillRect(cx - 200 * s, y - 25 * s, 400 * s, 25 * s);
  // The bridge: a long road with round arches underneath
  g.fillStyle(stone, 1);
  g.fillRect(cx - 200 * s, y - 75 * s, 400 * s, 22 * s);
  for (let k = 0; k < 4; k++) arch(g, tone, cx - 150 * s + k * 100 * s, y, 38 * s, 48 * s, 6 * s, 0x8a7a66);
  for (let k = 0; k < 5; k++) g.fillRect(cx - 200 * s + k * 100 * s - 12 * s, y - 60 * s, 24 * s, 60 * s); // the pillars
  // Statues standing along the bridge
  g.fillStyle(tone(0x3e3a34), 1);
  for (let k = 0; k < 7; k++) {
    const sx = cx - 140 * s + k * 50 * s;
    g.fillRect(sx - 3 * s, y - 100 * s, 6 * s, 25 * s);
    g.fillCircle(sx, y - 103 * s, 4 * s);
  }
  // The dark Gothic tower at the end of the bridge, with a pointy roof
  g.fillStyle(tone(0x5a5048), 1);
  g.fillRect(cx - 230 * s, y - 220 * s, 60 * s, 220 * s);
  g.fillStyle(tone(0x2e2a28), 1);
  g.fillRect(cx - 214 * s, y - 70 * s, 28 * s, 70 * s); // the gate
  polygon(g, tone(0x3e4a44), [[cx - 236 * s, y - 220 * s], [cx - 164 * s, y - 220 * s], [cx - 200 * s, y - 310 * s]]);
}

// ------------------------------------------------------------------
// AUSTRIA — the giant Ferris wheel of Vienna (el Riesenrad), more than 100 years old
// ------------------------------------------------------------------
function drawNoria(g, tone, cx, y, s) {
  const cy = y - 175 * s; // the center of the wheel
  const r = 140 * s;
  // The legs: an A shape on each side
  g.lineStyle(8 * s, tone(0x7a2e2a), 1);
  g.lineBetween(cx - 70 * s, y, cx, cy);
  g.lineBetween(cx + 70 * s, y, cx, cy);
  // The spokes and the round rim
  g.lineStyle(3 * s, tone(0x9a3a32), 1);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    g.lineBetween(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.lineStyle(6 * s, tone(0x9a3a32), 1);
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.strokePath();
  // The red cabins hanging from the rim (they look like little train wagons)
  for (let k = 0; k < 15; k++) {
    const a = (k / 15) * Math.PI * 2;
    const gx = cx + Math.cos(a) * r;
    const gy = cy + Math.sin(a) * r;
    g.fillStyle(tone(0xd8322a), 1);
    g.fillRect(gx - 12 * s, gy, 24 * s, 14 * s);
    g.fillStyle(tone(0xf4f0e0), 1);
    g.fillRect(gx - 8 * s, gy + 3 * s, 16 * s, 5 * s);
  }
  // The hub in the middle and the little building at the bottom
  g.fillStyle(tone(0x5a2a26), 1);
  g.fillCircle(cx, cy, 12 * s);
  g.fillStyle(tone(0xe2d3b0), 1);
  g.fillRect(cx - 60 * s, y - 25 * s, 120 * s, 25 * s);
}

// ------------------------------------------------------------------
// IRLANDA — the Cliffs of Moher: green on top, falling straight into the sea
// ------------------------------------------------------------------
function drawMoher(g, tone, cx, y, s) {
  // The tall cliff, with layers of rock
  polygon(g, tone(0x6e5a48), [[cx - 200 * s, y], [cx - 200 * s, y - 200 * s], [cx + 60 * s, y - 230 * s], [cx + 80 * s, y - 120 * s], [cx + 100 * s, y]]);
  g.fillStyle(tone(0x5a4838), 1);
  for (let k = 1; k < 6; k++) g.fillRect(cx - 200 * s, y - k * 35 * s, 270 * s, 4 * s);
  // The green grass on the top (Ireland is SO green!)
  polygon(g, tone(0x4fb04a), [[cx - 200 * s, y - 200 * s], [cx + 60 * s, y - 230 * s], [cx + 62 * s, y - 218 * s], [cx - 200 * s, y - 186 * s]]);
  // A big rock standing alone in the sea
  polygon(g, tone(0x6e5a48), [[cx + 120 * s, y], [cx + 128 * s, y - 120 * s], [cx + 150 * s, y - 125 * s], [cx + 158 * s, y]]);
  g.fillStyle(tone(0x4fb04a), 1);
  g.fillRect(cx + 127 * s, y - 128 * s, 24 * s, 6 * s);
  // O'Brien's Tower: a little round stone tower on the cliff
  g.fillStyle(tone(0xb0a690), 1);
  g.fillRect(cx - 120 * s, y - 250 * s, 24 * s, 56 * s);
  battlements(g, tone, cx - 122 * s, y - 250 * s, 30 * s, s, 0xb0a690);
}

// ------------------------------------------------------------------
// ISLANDIA — a volcano, a geyser shooting water up high, and the northern lights
// ------------------------------------------------------------------
function drawAurora(g, tone, span) {
  // The northern lights: green and violet ribbons glowing in the sky
  for (let x = 0, i = 0; x < span + 200; x += 120, i++) {
    g.fillStyle(tone(i % 3 ? 0x6ef0a0 : 0xb07af0), 0.3);
    g.fillEllipse(x, 120 + Math.sin(i * 0.9) * 40, 180, 50);
  }
  // Black lava fields with little patches of moss
  for (let x = 0, i = 0; x < span + 100; x += 140, i++) {
    g.fillStyle(tone(0x4a4a4a), 1);
    g.fillEllipse(x, GROUND, 200, 60 + pseudoRandom(i + 1) * 30);
    g.fillStyle(tone(0x7aa860), 1);
    g.fillEllipse(x + 30, GROUND - 10, 50, 16);
  }
}

function drawGeiser(g, tone, cx, y, s) {
  // The volcano, with a red glow and smoke on top
  polygon(g, tone(0x55524e), [[cx - 200 * s, y], [cx + 10 * s, y - 230 * s], [cx + 70 * s, y - 230 * s], [cx + 220 * s, y]]);
  polygon(g, tone(0x3e3c3a), [[cx + 40 * s, y - 230 * s], [cx + 70 * s, y - 230 * s], [cx + 220 * s, y], [cx + 90 * s, y]]);
  g.fillStyle(tone(0xff6a1f), 1);
  g.fillRect(cx + 10 * s, y - 234 * s, 60 * s, 6 * s);
  g.fillStyle(tone(0xbfbfbf), 0.7);
  g.fillCircle(cx + 40 * s, y - 260 * s, 22 * s);
  g.fillCircle(cx + 62 * s, y - 290 * s, 28 * s);
  g.fillCircle(cx + 92 * s, y - 320 * s, 32 * s);
  // The geyser in front: a column of hot water and steam bursting up
  const gx = cx - 110 * s;
  polygon(g, tone(0xe8f4ff), [[gx - 8 * s, y], [gx + 8 * s, y], [gx + 14 * s, y - 180 * s], [gx - 14 * s, y - 180 * s]]);
  g.fillStyle(tone(0xffffff), 0.8);
  g.fillCircle(gx, y - 190 * s, 24 * s);
  g.fillCircle(gx - 18 * s, y - 172 * s, 16 * s);
  g.fillCircle(gx + 18 * s, y - 175 * s, 16 * s);
  g.fillStyle(tone(0x6ac0e0), 1);
  g.fillEllipse(gx, y - 3 * s, 70 * s, 12 * s); // the hot pool
}

// ------------------------------------------------------------------
// HUNGRÍA — the Parliament of Budapest, on the river Danube
// ------------------------------------------------------------------
function drawParlamento(g, tone, cx, y, s) {
  const wall = tone(0xece4d2);
  const roof = tone(0xb8452e);
  // The river in front
  g.fillStyle(tone(0x3f8fd0), 1);
  g.fillRect(cx - 220 * s, y - 18 * s, 440 * s, 18 * s);
  // The long building with its many windows
  g.fillStyle(wall, 1);
  g.fillRect(cx - 200 * s, y - 100 * s, 400 * s, 82 * s);
  g.fillStyle(tone(0x8a8f9c), 1);
  for (let wx = cx - 192 * s; wx < cx + 190 * s; wx += 14 * s) g.fillRect(wx, y - 88 * s, 6 * s, 50 * s);
  g.fillStyle(roof, 1);
  g.fillRect(cx - 200 * s, y - 110 * s, 400 * s, 10 * s);
  // Lots of thin pointy towers on the roof
  [-190, -140, -95, 95, 140, 190].forEach((dx) => {
    g.fillStyle(wall, 1);
    g.fillRect(cx + dx * s - 5 * s, y - 145 * s, 10 * s, 35 * s);
    g.fillStyle(roof, 1);
    g.fillTriangle(cx + dx * s - 6 * s, y - 145 * s, cx + dx * s + 6 * s, y - 145 * s, cx + dx * s, y - 170 * s);
  });
  // The big dome in the middle with its tall spike
  g.fillStyle(wall, 1);
  g.fillRect(cx - 45 * s, y - 175 * s, 90 * s, 65 * s);
  g.fillStyle(roof, 1);
  g.fillEllipse(cx, y - 180 * s, 100 * s, 90 * s);
  polygon(g, roof, [[cx - 20 * s, y - 215 * s], [cx + 20 * s, y - 215 * s], [cx, y - 290 * s]]);
  g.fillStyle(wall, 1);
  g.fillRect(cx - 50 * s, y - 180 * s, 100 * s, 6 * s);
}

// ------------------------------------------------------------------
// BOSNIA Y HERZEGOVINA — the Old Bridge of Mostar: one tall stone arch over the river
// ------------------------------------------------------------------
function drawMostar(g, tone, cx, y, s) {
  // The green river and the rocky banks on both sides
  g.fillStyle(tone(0x3fb0a0), 1);
  g.fillRect(cx - 130 * s, y - 20 * s, 260 * s, 20 * s);
  polygon(g, tone(0xa8a090), [[cx - 210 * s, y], [cx - 210 * s, y - 110 * s], [cx - 95 * s, y - 100 * s], [cx - 120 * s, y]]);
  polygon(g, tone(0x8f8778), [[cx + 210 * s, y], [cx + 210 * s, y - 110 * s], [cx + 95 * s, y - 100 * s], [cx + 120 * s, y]]);
  // The bridge: one high, thin arch (people jump from it into the river!)
  arch(g, tone, cx, y - 20 * s, 95 * s, 125 * s, 14 * s, 0xd8ccb4);
  // The two square towers that guard each end, with pointy roofs
  [-160, 160].forEach((dx) => {
    const tx = cx + dx * s;
    g.fillStyle(tone(0xc4b8a0), 1);
    g.fillRect(tx - 28 * s, y - 210 * s, 56 * s, 100 * s);
    g.fillStyle(tone(0x4a453c), 1);
    g.fillRect(tx - 6 * s, y - 190 * s, 12 * s, 18 * s);
    polygon(g, tone(0x8a6e5a), [[tx - 34 * s, y - 210 * s], [tx + 34 * s, y - 210 * s], [tx, y - 245 * s]]);
  });
}

// ==================================================================
// REGIONAL SCENERIES — for countries with no single famous building
// ==================================================================

// ------------------------------------------------------------------
// A CASTLE ON A HILL (Central and Eastern Europe): Romania, Poland, Slovakia,
// Slovenia, Luxembourg, San Marino
// ------------------------------------------------------------------
function drawLeafyForest(g, tone, span, spots) {
  for (let x = 30, i = 0; x < span + 100; x += 70, i++) {
    if (nearSpot(spots, x, 220)) continue;
    const h = 40 + pseudoRandom(i + 3) * 40;
    g.fillStyle(tone(0x7a5230), 1);
    g.fillRect(x - 4, GROUND - h, 8, h);
    g.fillStyle(tone(i % 2 ? 0x4f9a48 : 0x3f8a3c), 1);
    g.fillCircle(x, GROUND - h - 14, 26);
  }
}

// A round tower with a pointy red roof
function roundTower(g, tone, x, base, w, h) {
  g.fillStyle(tone(0xc4b8a0), 1);
  g.fillRect(x - w / 2, base - h, w, h);
  g.fillStyle(tone(0x4a453c), 1);
  g.fillRect(x - w * 0.12, base - h * 0.7, w * 0.24, w * 0.35);
  polygon(g, tone(0xb03a2e), [[x - w * 0.62, base - h], [x + w * 0.62, base - h], [x, base - h - w * 1.3]]);
}

function drawCastillo(g, tone, cx, y, s) {
  // The green hill
  g.fillStyle(tone(0x5a9a50), 1);
  g.fillEllipse(cx, y, 400 * s, 170 * s);
  const base = y - 70 * s;
  // The walls between the towers
  g.fillStyle(tone(0xb0a690), 1);
  g.fillRect(cx - 110 * s, base - 70 * s, 220 * s, 70 * s);
  battlements(g, tone, cx - 110 * s, base - 70 * s, 220 * s, s, 0xb0a690);
  g.fillStyle(tone(0x3a302a), 1);
  g.fillRect(cx - 16 * s, base - 40 * s, 32 * s, 40 * s); // the gate
  // The tall keep in the middle and round towers at the sides
  roundTower(g, tone, cx + 40 * s, base, 50 * s, 160 * s);
  roundTower(g, tone, cx - 115 * s, base, 38 * s, 110 * s);
  roundTower(g, tone, cx + 115 * s, base, 38 * s, 100 * s);
  roundTower(g, tone, cx - 50 * s, base, 30 * s, 125 * s);
  // A little flag on the top of the keep
  g.fillStyle(tone(0x3e3a34), 1);
  g.fillRect(cx + 39 * s, base - 255 * s, 2 * s, 32 * s);
  g.fillStyle(tone(0xf2c12e), 1);
  g.fillTriangle(cx + 41 * s, base - 255 * s, cx + 41 * s, base - 241 * s, cx + 62 * s, base - 248 * s);
}

// ------------------------------------------------------------------
// A NORDIC FOREST (the north): Sweden, Finland, Estonia, Latvia, Lithuania.
// Dark pines, a lake, and a red wooden cabin with white corners.
// ------------------------------------------------------------------
function drawLakeForest(g, tone, span, spots) {
  // A calm lake at the back, then pines in front
  g.fillStyle(tone(0x5f9fd0), 1);
  g.fillRect(0, GROUND - 60, span + 200, 22);
  pineForest(g, tone, span, spots, 180);
}

function drawCabana(g, tone, cx, y, s) {
  // Two big pines behind the cabin
  pine(g, tone, cx - 120 * s, y, 260 * s);
  pine(g, tone, cx + 130 * s, y, 220 * s, 0x3d7d4a);
  // The cabin (the red comes from a paint made in an old copper mine!)
  g.fillStyle(tone(0xa8302a), 1);
  g.fillRect(cx - 80 * s, y - 80 * s, 160 * s, 80 * s);
  g.fillStyle(tone(0xf4f0e0), 1);
  g.fillRect(cx - 80 * s, y - 80 * s, 6 * s, 80 * s); // white corners
  g.fillRect(cx + 74 * s, y - 80 * s, 6 * s, 80 * s);
  [-50, 30].forEach((dx) => g.fillRect(cx + dx * s, y - 60 * s, 22 * s, 22 * s)); // windows
  g.fillStyle(tone(0x3a302a), 1);
  g.fillRect(cx - 12 * s, y - 50 * s, 24 * s, 50 * s); // the door
  polygon(g, tone(0x3e4a44), [[cx - 92 * s, y - 80 * s], [cx + 92 * s, y - 80 * s], [cx, y - 140 * s]]);
  // A chimney with a puff of smoke
  g.fillStyle(tone(0x6a5a50), 1);
  g.fillRect(cx + 35 * s, y - 135 * s, 14 * s, 30 * s);
  g.fillStyle(tone(0xdddddd), 0.6);
  g.fillCircle(cx + 45 * s, y - 150 * s, 10 * s);
  g.fillCircle(cx + 55 * s, y - 168 * s, 13 * s);
}

// ------------------------------------------------------------------
// A CHURCH WITH GOLDEN DOMES (the east and the Balkans): Ukraine, Belarus,
// Moldova, Bulgaria, Serbia, North Macedonia. Fields with white birch trees.
// ------------------------------------------------------------------
function drawBirches(g, tone, span, spots) {
  for (let x = 25, i = 0; x < span + 100; x += 60, i++) {
    if (nearSpot(spots, x, 200)) continue;
    const h = 60 + pseudoRandom(i + 8) * 50;
    g.fillStyle(tone(0xf0eee6), 1); // the white trunk...
    g.fillRect(x - 4, GROUND - h, 8, h);
    g.fillStyle(tone(0x3a3a3a), 1); // ...with black spots
    g.fillRect(x - 4, GROUND - h * 0.4, 5, 3);
    g.fillRect(x, GROUND - h * 0.7, 4, 3);
    g.fillStyle(tone(0x8cc060), 1);
    g.fillEllipse(x, GROUND - h - 10, 40, 60);
  }
}

function drawIglesia(g, tone, cx, y, s) {
  const white = tone(0xf0ece2);
  // The white church with a blue roof line
  g.fillStyle(white, 1);
  g.fillRect(cx - 110 * s, y - 120 * s, 220 * s, 120 * s);
  g.fillStyle(tone(0x2a6fc0), 1);
  g.fillRect(cx - 115 * s, y - 126 * s, 230 * s, 8 * s);
  g.fillStyle(tone(0x4a453c), 1);
  g.fillRect(cx - 16 * s, y - 60 * s, 32 * s, 60 * s);
  g.fillCircle(cx, y - 60 * s, 16 * s);
  [-70, 70].forEach((dx) => g.fillRect(cx + dx * s - 8 * s, y - 95 * s, 16 * s, 30 * s));
  // The towers with golden onion domes: a big one in the middle and four small
  [[-85, 165], [85, 165], [-42, 185], [42, 185]].forEach(([dx, h]) => {
    g.fillStyle(white, 1);
    g.fillRect(cx + dx * s - 14 * s, y - h * s, 28 * s, h * s - 120 * s);
    onion(g, tone, cx + dx * s, y - h * s, 36 * s, 0xe6b422);
  });
  g.fillStyle(white, 1);
  g.fillRect(cx - 28 * s, y - 230 * s, 56 * s, 110 * s);
  onion(g, tone, cx, y - 230 * s, 66 * s, 0xe6b422);
}

// ------------------------------------------------------------------
// A WHITE VILLAGE BY THE SEA (the Mediterranean): Croatia, Montenegro, Albania,
// Malta, Cyprus, Monaco. Houses with orange roofs going up a hill, and a bell tower.
// ------------------------------------------------------------------
function drawPuebloMar(g, tone, cx, y, s) {
  // The rocky hill the village is built on
  polygon(g, tone(0xb59a74), [[cx - 200 * s, y], [cx - 120 * s, y - 150 * s], [cx + 40 * s, y - 180 * s], [cx + 200 * s, y]]);
  // Rows of houses, smaller and higher up the hill
  const walls = [0xf4f0e0, 0xf2dfb8, 0xf4f0e0, 0xe8d0a8];
  for (let row = 0; row < 3; row++) {
    for (let k = 0; k < 5 - row; k++) {
      const hx = cx - 150 * s + row * 40 * s + k * 62 * s;
      const base = y - row * 55 * s;
      g.fillStyle(tone(walls[(row + k) % walls.length]), 1);
      g.fillRect(hx, base - 50 * s, 52 * s, 50 * s);
      g.fillStyle(tone(0xd0662e), 1); // the orange tile roof
      g.fillTriangle(hx - 4 * s, base - 50 * s, hx + 56 * s, base - 50 * s, hx + 26 * s, base - 68 * s);
      g.fillStyle(tone(0x2a6fc0), 1); // a blue window
      g.fillRect(hx + 20 * s, base - 36 * s, 12 * s, 14 * s);
    }
  }
  // The bell tower at the top of the village
  const tx = cx + 90 * s;
  g.fillStyle(tone(0xf2dfb8), 1);
  g.fillRect(tx - 18 * s, y - 280 * s, 36 * s, 130 * s);
  g.fillStyle(tone(0x4a453c), 1);
  g.fillRect(tx - 7 * s, y - 262 * s, 14 * s, 20 * s);
  g.fillStyle(tone(0xe6b422), 1);
  g.fillCircle(tx, y - 248 * s, 5 * s); // the bell
  polygon(g, tone(0xd0662e), [[tx - 22 * s, y - 280 * s], [tx + 22 * s, y - 280 * s], [tx, y - 320 * s]]);
}

// ------------------------------------------------------------------
// The list of landmarks of Europe: name (used in THEMES below) → how to draw it
// ------------------------------------------------------------------
export const LANDMARKS = {
  sagrada: { background: null, landmark: drawSagrada, size: 1.0 },
  brandeburgo: { background: null, landmark: drawBrandeburgo, size: 1.1 },
  basilio: { background: null, landmark: drawBasilio, size: 1.1 },
  molinos: { background: drawTulips, landmark: drawMolinos, size: 1.0 },
  belem: { background: sea, landmark: drawBelem, size: 1.1 },
  cervino: { background: drawAlpineVillage, landmark: drawCervino, size: 1.0 },
  fiordo: { background: drawFjordShore, landmark: drawFiordo, size: 1.1 },
  sanpedro: { background: null, landmark: drawSanPedro, size: 1.0 },
  sirenita: { background: drawNyhavn, landmark: drawSirenita, size: 1.2 },
  atomium: { background: null, landmark: drawAtomium, size: 1.0 },
  puentecarlos: { background: null, landmark: drawPuenteCarlos, size: 1.0 },
  noria: { background: null, landmark: drawNoria, size: 1.0 },
  moher: { background: sea, landmark: drawMoher, size: 1.1 },
  geiser: { background: drawAurora, landmark: drawGeiser, size: 1.0 },
  parlamento: { background: null, landmark: drawParlamento, size: 1.0 },
  mostar: { background: null, landmark: drawMostar, size: 1.0 },
  // The regional sceneries
  castillocolina: { background: drawLeafyForest, landmark: drawCastillo, size: 1.0 },
  bosquenordico: { background: drawLakeForest, landmark: drawCabana, size: 1.0 },
  iglesiadorada: { background: drawBirches, landmark: drawIglesia, size: 1.1 },
  pueblomar: { background: sea, landmark: drawPuebloMar, size: 1.0 },
};

// ------------------------------------------------------------------
// Every country of Europe (except France, the UK, Italy and Greece, which are
// in countryThemes.js). place = what the "Nivel" screen says: "Cerca de ..."
// ------------------------------------------------------------------
export const THEMES = {
  // Countries with their own famous landmark
  ESP: { landmark: 'sagrada', place: 'la Sagrada Familia' },
  DEU: { landmark: 'brandeburgo', place: 'la Puerta de Brandeburgo' },
  RUS: { landmark: 'basilio', place: 'la Catedral de San Basilio' },
  NLD: { landmark: 'molinos', place: 'los molinos de viento' },
  PRT: { landmark: 'belem', place: 'la Torre de Belém' },
  CHE: { landmark: 'cervino', place: 'el Cervino' },
  NOR: { landmark: 'fiordo', place: 'los fiordos' },
  VAT: { landmark: 'sanpedro', place: 'la Basílica de San Pedro' },
  DNK: { landmark: 'sirenita', place: 'la Sirenita de Copenhague' },
  BEL: { landmark: 'atomium', place: 'el Atomium' },
  CZE: { landmark: 'puentecarlos', place: 'el Puente de Carlos' },
  AUT: { landmark: 'noria', place: 'la Noria de Viena' },
  IRL: { landmark: 'moher', place: 'los Acantilados de Moher' },
  ISL: { landmark: 'geiser', place: 'los géiseres y volcanes' },
  HUN: { landmark: 'parlamento', place: 'el Parlamento de Budapest' },
  BIH: { landmark: 'mostar', place: 'el Puente de Mostar' },
  // Mountains like Switzerland
  LIE: { landmark: 'cervino', place: 'los Alpes' },
  AND: { landmark: 'cervino', place: 'los Pirineos' },
  // A castle on a hill
  ROU: { landmark: 'castillocolina', place: 'el Castillo de Bran' },
  POL: { landmark: 'castillocolina', place: 'el Castillo de Wawel' },
  SVK: { landmark: 'castillocolina', place: 'el Castillo de Spiš' },
  SVN: { landmark: 'castillocolina', place: 'el Castillo de Bled' },
  LUX: { landmark: 'castillocolina', place: null },
  SMR: { landmark: 'castillocolina', place: 'la Torre Guaita' },
  // A Nordic forest
  SWE: { landmark: 'bosquenordico', place: null },
  FIN: { landmark: 'bosquenordico', place: null },
  EST: { landmark: 'bosquenordico', place: null },
  LVA: { landmark: 'bosquenordico', place: null },
  LTU: { landmark: 'bosquenordico', place: null },
  // A church with golden domes
  UKR: { landmark: 'iglesiadorada', place: 'la Catedral de Santa Sofía de Kiev' },
  BLR: { landmark: 'iglesiadorada', place: null },
  MDA: { landmark: 'iglesiadorada', place: null },
  BGR: { landmark: 'iglesiadorada', place: 'la Catedral de Alejandro Nevski' },
  SRB: { landmark: 'iglesiadorada', place: 'el Templo de San Sava' },
  MKD: { landmark: 'iglesiadorada', place: null },
  // A white village by the sea
  HRV: { landmark: 'pueblomar', place: 'Dubrovnik' },
  MNE: { landmark: 'pueblomar', place: null },
  ALB: { landmark: 'pueblomar', place: null },
  MLT: { landmark: 'pueblomar', place: 'La Valeta' },
  CYP: { landmark: 'pueblomar', place: null },
  MCO: { landmark: 'pueblomar', place: 'el puerto de Mónaco' },
};
