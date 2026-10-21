// africaOceania.js — The scenery of the countries of ÁFRICA and OCEANÍA.
//
// Some countries have their OWN famous landmark (the Kilimanjaro, Table
// Mountain, Victoria Falls...). The others share a scenery of their region:
// the SABANA (acacias, giraffes and elephants), the SELVA (giant trees and
// gorillas), the SAHARA (sand dunes and an oasis with a camel) and the ISLA
// (a beach with palm trees and a straw hut, for the islands of the oceans).
//
// Egypt and Australia are not here: they live in LandmarkArt.js.
//
// LANDMARKS: drawing name → { background, landmark, size } (like in LandmarkArt.js)
// THEMES:    3-letter country code → { landmark, place }  (like in countryThemes.js)
//
// Remember: EVERY color goes through tone(), because the scene is drawn twice
// (once in gray and once in color).

import { GROUND, pseudoRandom, polygon, nearSpot } from './helpers.js';

// ------------------------------------------------------------------
// Little helpers used by many drawings
// ------------------------------------------------------------------

// A strip of blue sea along the bottom, with light little waves
function sea(g, tone, span) {
  g.fillStyle(tone(0x3f8fd0), 1);
  g.fillRect(0, GROUND - 40, span + 200, 80);
  g.fillStyle(tone(0x8cc8f0), 1);
  for (let x = 10, i = 0; x < span + 200; x += 70, i++) {
    g.fillRect(x, GROUND - 30 + pseudoRandom(i + 3) * 25, 28, 3);
  }
}

// Sand dunes over the whole width (the colors change: yellow Sahara, red Namibia)
function dunes(g, tone, span, light, dark) {
  for (let x = -100, i = 0; x < span + 200; x += 260, i++) {
    g.fillStyle(tone(light), 1);
    g.fillEllipse(x, 610, 560, 200 + pseudoRandom(i + 2) * 80);
    g.fillStyle(tone(dark), 1);
    g.fillEllipse(x + 130, 625, 480, 140 + pseudoRandom(i + 6) * 50);
  }
}

// Pointy mountains far away (with snow on top if we want it)
function mountains(g, tone, span, color, shade, snow) {
  for (let x = -60, i = 0; x < span + 200; x += 190, i++) {
    const h = 120 + pseudoRandom(i + 4) * 100;
    const half = 130 + pseudoRandom(i + 9) * 40;
    polygon(g, tone(color), [[x - half, GROUND], [x, GROUND - h], [x + half, GROUND]]);
    polygon(g, tone(shade), [[x, GROUND], [x, GROUND - h], [x + half, GROUND]]); // the shaded side
    if (snow) {
      polygon(g, tone(0xffffff), [[x - half * 0.25, GROUND - h * 0.75], [x, GROUND - h], [x + half * 0.25, GROUND - h * 0.75]]);
    }
  }
}

// A palm tree: a (maybe leaning) trunk and leaves hanging all around the top
function palm(g, tone, x, y, h, s, lean = 0) {
  const tx = x + lean; // where the top of the trunk is
  polygon(g, tone(0x8a6238), [[x - 5 * s, y], [x + 5 * s, y], [tx + 3 * s, y - h], [tx - 3 * s, y - h]]);
  g.fillStyle(tone(0x3c9a46), 1);
  for (let k = -2; k <= 2; k++) {
    g.fillTriangle(tx - 4 * s, y - h, tx + 4 * s, y - h, tx + k * 26 * s, y - h + (20 - Math.abs(k) * 4) * s);
    g.fillTriangle(tx - 3 * s, y - h - 4 * s, tx + 3 * s, y - h + 4 * s, tx + k * 16 * s, y - h - (24 - Math.abs(k) * 6) * s);
  }
}

// An acacia: the African tree with a flat top, like an umbrella
function acacia(g, tone, x, y, h, s) {
  polygon(g, tone(0x6b4a2b), [[x - 5 * s, y], [x + 5 * s, y], [x + 4 * s, y - h * 0.6], [x - 2 * s, y - h * 0.6]]);
  // Two branches that open like a V
  polygon(g, tone(0x6b4a2b), [[x - 2 * s, y - h * 0.6], [x + 2 * s, y - h * 0.6], [x - 34 * s, y - h], [x - 40 * s, y - h]]);
  polygon(g, tone(0x6b4a2b), [[x, y - h * 0.6], [x + 4 * s, y - h * 0.6], [x + 40 * s, y - h], [x + 34 * s, y - h]]);
  // The flat crown of leaves
  g.fillStyle(tone(0x5e8a32), 1);
  g.fillEllipse(x, y - h - 4 * s, 150 * s, 30 * s);
  g.fillStyle(tone(0x76a33e), 1);
  g.fillEllipse(x - 10 * s, y - h - 12 * s, 110 * s, 20 * s);
}

// A giraffe looking to the right (the long neck makes it the tallest animal!)
function giraffe(g, tone, x, y, s) {
  const skin = tone(0xe8b04a);
  const spot = tone(0x9a5a22);
  g.fillStyle(skin, 1);
  [-22, -12, 12, 20].forEach((dx) => g.fillRect(x + dx * s, y - 70 * s, 5 * s, 70 * s)); // 4 legs
  g.fillEllipse(x, y - 78 * s, 64 * s, 34 * s); // body
  polygon(g, skin, [[x + 14 * s, y - 90 * s], [x + 28 * s, y - 84 * s], [x + 46 * s, y - 160 * s], [x + 36 * s, y - 164 * s]]); // neck
  g.fillEllipse(x + 48 * s, y - 166 * s, 24 * s, 12 * s); // head
  g.fillStyle(spot, 1);
  g.fillRect(x + 40 * s, y - 182 * s, 3 * s, 10 * s); // the two little horns
  g.fillRect(x + 46 * s, y - 182 * s, 3 * s, 10 * s);
  // The brown spots
  [[-14, -82], [0, -72], [12, -84], [-4, -90], [26, -110], [32, -132], [38, -150]].forEach(([dx, dy]) => {
    g.fillCircle(x + dx * s, y + dy * s, 4.5 * s);
  });
}

// An elephant looking to the left, with its big ear and long trunk
function elephant(g, tone, x, y, s) {
  const gray = tone(0x8e8c8a);
  g.fillStyle(gray, 1);
  [-30, -12, 10, 26].forEach((dx) => g.fillRect(x + dx * s, y - 38 * s, 13 * s, 38 * s)); // 4 legs
  g.fillEllipse(x, y - 58 * s, 96 * s, 62 * s); // body
  g.fillCircle(x - 48 * s, y - 68 * s, 24 * s); // head
  polygon(g, gray, [[x - 66 * s, y - 64 * s], [x - 56 * s, y - 60 * s], [x - 62 * s, y - 14 * s], [x - 70 * s, y - 16 * s]]); // trunk
  g.fillStyle(tone(0x737170), 1);
  g.fillEllipse(x - 34 * s, y - 66 * s, 26 * s, 40 * s); // ear
  g.fillStyle(tone(0xfaf6e8), 1);
  g.fillTriangle(x - 60 * s, y - 52 * s, x - 54 * s, y - 50 * s, x - 70 * s, y - 36 * s); // tusk
  g.fillStyle(tone(0x222222), 1);
  g.fillCircle(x - 54 * s, y - 74 * s, 2.5 * s); // eye
}

// A camel with one hump, looking to the left
function camel(g, tone, x, y, s) {
  const fur = tone(0xc8955a);
  g.fillStyle(fur, 1);
  [-24, -12, 12, 22].forEach((dx) => g.fillRect(x + dx * s, y - 50 * s, 5 * s, 50 * s)); // legs
  g.fillEllipse(x, y - 58 * s, 70 * s, 30 * s); // body
  g.fillEllipse(x + 2 * s, y - 74 * s, 36 * s, 28 * s); // the hump
  polygon(g, fur, [[x - 28 * s, y - 64 * s], [x - 20 * s, y - 56 * s], [x - 44 * s, y - 86 * s], [x - 50 * s, y - 84 * s]]); // neck
  g.fillEllipse(x - 52 * s, y - 88 * s, 20 * s, 11 * s); // head
}

// A rainforest tree: tall trunk and a big round crown of leaves
function forestTree(g, tone, x, y, h, s) {
  g.fillStyle(tone(0x5e4128), 1);
  g.fillRect(x - 6 * s, y - h, 12 * s, h);
  g.fillStyle(tone(0x1f6b30), 1);
  g.fillCircle(x, y - h - 10 * s, 40 * s);
  g.fillStyle(tone(0x2e8b3d), 1);
  g.fillCircle(x - 26 * s, y - h + 6 * s, 28 * s);
  g.fillCircle(x + 26 * s, y - h + 6 * s, 28 * s);
}

// A baobab: a VERY fat trunk with short branches on top (it looks upside down!)
function baobab(g, tone, x, y, h, w) {
  const bark = tone(0xa07a5a);
  polygon(g, bark, [[x - w / 2, y], [x + w / 2, y], [x + w * 0.36, y - h], [x - w * 0.36, y - h]]);
  polygon(g, tone(0x85624a), [[x + w * 0.12, y], [x + w / 2, y], [x + w * 0.36, y - h], [x + w * 0.1, y - h]]); // shade
  // The short branches with little tufts of leaves
  for (let k = -2; k <= 2; k++) {
    const bx = x + k * w * 0.18;
    const top = y - h - (22 - Math.abs(k) * 5);
    g.fillStyle(bark, 1);
    g.fillRect(bx - 3, top, 6, y - h - top + 2);
    g.fillStyle(tone(0x5e8a32), 1);
    g.fillEllipse(bx, top, 28, 14);
  }
}

// ------------------------------------------------------------------
// SABANA — dry yellow grass, acacias, a giraffe and an elephant
// (Kenia, Botswana, Uganda... the lands of the safaris)
// ------------------------------------------------------------------
function drawSavannaGrass(g, tone, span, spots) {
  for (let x = -100, i = 0; x < span + 200; x += 280, i++) {
    g.fillStyle(tone(0xd8c068), 1);
    g.fillEllipse(x, 615, 600, 160 + pseudoRandom(i + 2) * 60);
  }
  // Acacias all along, but not in front of the landmarks
  for (let x = 60, i = 0; x < span + 100; x += 210, i++) {
    if (nearSpot(spots, x, 220)) continue;
    acacia(g, tone, x + pseudoRandom(i + 5) * 50, GROUND, 70 + pseudoRandom(i + 1) * 40, 0.7);
  }
}

function drawSabana(g, tone, cx, y, s) {
  acacia(g, tone, cx - 40 * s, y, 150 * s, 1.3 * s);
  giraffe(g, tone, cx - 120 * s, y, 1.1 * s);
  elephant(g, tone, cx + 110 * s, y, 1.1 * s);
}

// ------------------------------------------------------------------
// SELVA — the green rainforest of the middle of Africa, with a gorilla
// (Congo, Gabón, Camerún, Ruanda...)
// ------------------------------------------------------------------
function drawForest(g, tone, span, spots) {
  for (let x = 20, i = 0; x < span + 100; x += 90, i++) {
    if (nearSpot(spots, x, 200)) continue;
    forestTree(g, tone, x + pseudoRandom(i + 7) * 40, GROUND, 70 + pseudoRandom(i + 1) * 70, 0.8);
  }
}

// A gorilla sitting down: big dark round body, gray face
function gorilla(g, tone, x, y, s) {
  g.fillStyle(tone(0x2c2c30), 1);
  g.fillEllipse(x, y - 32 * s, 60 * s, 64 * s); // body
  g.fillCircle(x, y - 72 * s, 18 * s); // head
  g.fillEllipse(x - 28 * s, y - 22 * s, 18 * s, 44 * s); // the long arms
  g.fillEllipse(x + 28 * s, y - 22 * s, 18 * s, 44 * s);
  g.fillStyle(tone(0x5a5a60), 1);
  g.fillEllipse(x, y - 68 * s, 22 * s, 18 * s); // face
  g.fillStyle(tone(0x111111), 1);
  g.fillCircle(x - 5 * s, y - 72 * s, 2 * s);
  g.fillCircle(x + 5 * s, y - 72 * s, 2 * s);
}

function drawSelva(g, tone, cx, y, s) {
  // A giant tree with big "wing" roots at the bottom (they hold it up)
  const bark = tone(0x6e5034);
  polygon(g, bark, [[cx - 16 * s, y], [cx + 16 * s, y], [cx + 12 * s, y - 230 * s], [cx - 12 * s, y - 230 * s]]);
  polygon(g, bark, [[cx - 60 * s, y], [cx - 10 * s, y], [cx - 10 * s, y - 70 * s]]);
  polygon(g, bark, [[cx + 60 * s, y], [cx + 10 * s, y], [cx + 10 * s, y - 70 * s]]);
  // Its huge crown, made of many green balls
  [[0, -250, 70, 0x1f6b30], [-70, -225, 50, 0x2e8b3d], [70, -225, 50, 0x2e8b3d], [-35, -285, 45, 0x3fa34d], [35, -285, 45, 0x3fa34d]]
    .forEach(([dx, dy, r, c]) => {
      g.fillStyle(tone(c), 1);
      g.fillCircle(cx + dx * s, y + dy * s, r * s);
    });
  // Vines hanging down
  g.fillStyle(tone(0x4c8a3a), 1);
  [-80, -50, 55, 85].forEach((dx) => g.fillRect(cx + dx * s, y - 215 * s, 3 * s, 90 * s));
  gorilla(g, tone, cx + 100 * s, y, 1.1 * s);
  // A red parrot on a vine
  g.fillStyle(tone(0xd8322a), 1);
  g.fillEllipse(cx - 78 * s, y - 128 * s, 12 * s, 22 * s);
  g.fillStyle(tone(0x3a7fd0), 1);
  g.fillTriangle(cx - 82 * s, y - 120 * s, cx - 74 * s, y - 120 * s, cx - 78 * s, y - 100 * s);
}

// ------------------------------------------------------------------
// SAHARA — the biggest hot desert in the world, with an oasis and a camel
// (Argelia, Libia, Mauritania, Chad...)
// ------------------------------------------------------------------
function drawSaharaDunes(g, tone, span) {
  dunes(g, tone, span, 0xe8c77a, 0xd9b25e);
}

function drawSahara(g, tone, cx, y, s) {
  // The oasis: a little pond of water in the middle of the sand
  g.fillStyle(tone(0x3f8fd0), 1);
  g.fillEllipse(cx, y - 4 * s, 200 * s, 22 * s);
  g.fillStyle(tone(0x6fb848), 1);
  g.fillEllipse(cx - 100 * s, y - 6 * s, 50 * s, 14 * s);
  g.fillEllipse(cx + 100 * s, y - 6 * s, 50 * s, 14 * s);
  // Palm trees around it, and a camel coming to drink
  palm(g, tone, cx - 80 * s, y, 150 * s, 1.2 * s, -15 * s);
  palm(g, tone, cx - 40 * s, y, 190 * s, 1.3 * s, 10 * s);
  palm(g, tone, cx + 70 * s, y, 130 * s, 1.1 * s, 18 * s);
  camel(g, tone, cx + 150 * s, y, 1.3 * s);
}

// ------------------------------------------------------------------
// ISLA — a tropical island beach with palm trees and a straw hut
// (the islands of the Pacific and of the Indian Ocean: Fiyi, Samoa, Seychelles...)
// ------------------------------------------------------------------
function drawIslands(g, tone, span) {
  sea(g, tone, span);
  // Small green islands far away on the sea
  for (let x = 120, i = 0; x < span + 100; x += 420, i++) {
    g.fillStyle(tone(0x5f9f5a), 1);
    g.fillEllipse(x, GROUND - 38, 120 + pseudoRandom(i + 3) * 60, 40);
  }
}

function drawIsla(g, tone, cx, y, s) {
  // The sandy beach
  g.fillStyle(tone(0xf1dca0), 1);
  g.fillEllipse(cx, y, 380 * s, 70 * s);
  // The straw hut on stilts
  const hx = cx + 60 * s;
  g.fillStyle(tone(0x7a5230), 1);
  [-40, -10, 20, 40].forEach((dx) => g.fillRect(hx + dx * s, y - 50 * s, 5 * s, 50 * s));
  g.fillStyle(tone(0xb98a52), 1);
  g.fillRect(hx - 44 * s, y - 100 * s, 92 * s, 52 * s); // the walls
  g.fillStyle(tone(0x4a3420), 1);
  g.fillRect(hx - 8 * s, y - 88 * s, 18 * s, 40 * s); // the door
  polygon(g, tone(0xd9b25e), [[hx - 62 * s, y - 96 * s], [hx + 66 * s, y - 96 * s], [hx + 2 * s, y - 160 * s]]); // straw roof
  // Two palm trees leaning over the water
  palm(g, tone, cx - 120 * s, y, 170 * s, 1.2 * s, -40 * s);
  palm(g, tone, cx - 70 * s, y, 210 * s, 1.3 * s, 15 * s);
  // A canoe on the beach
  polygon(g, tone(0xa0522d), [[cx + 120 * s, y - 14 * s], [cx + 190 * s, y - 14 * s], [cx + 178 * s, y - 2 * s], [cx + 132 * s, y - 2 * s]]);
}

// ------------------------------------------------------------------
// TANZANIA — the Kilimanjaro, the tallest mountain of Africa, with snow on top
// ------------------------------------------------------------------
function drawKilimanjaro(g, tone, cx, y, s) {
  // A huge mountain with a flat top (it is an old volcano)
  polygon(g, tone(0x7f7a8c), [[cx - 200 * s, y], [cx - 55 * s, y - 230 * s], [cx + 45 * s, y - 238 * s], [cx + 200 * s, y]]);
  polygon(g, tone(0x635f70), [[cx + 45 * s, y - 238 * s], [cx + 200 * s, y], [cx + 20 * s, y]]);
  // The snow on the top
  polygon(g, tone(0xffffff), [
    [cx - 55 * s, y - 230 * s], [cx + 45 * s, y - 238 * s], [cx + 80 * s, y - 185 * s], [cx + 50 * s, y - 198 * s],
    [cx + 20 * s, y - 182 * s], [cx - 10 * s, y - 200 * s], [cx - 40 * s, y - 184 * s], [cx - 80 * s, y - 192 * s],
  ]);
  // An acacia and a giraffe in front of the mountain
  acacia(g, tone, cx - 110 * s, y, 90 * s, s);
  giraffe(g, tone, cx + 110 * s, y, 0.9 * s);
}

// ------------------------------------------------------------------
// SUDÁFRICA — Table Mountain (Montaña de la Mesa): flat like a table,
// with a white cloud "tablecloth" and the colorful houses of Cape Town
// ------------------------------------------------------------------
function drawMesa(g, tone, cx, y, s) {
  // The mountain: a long flat top, and the pointy Lion's Head on the right
  polygon(g, tone(0x7d8a72), [[cx - 200 * s, y], [cx - 160 * s, y - 190 * s], [cx + 120 * s, y - 195 * s], [cx + 160 * s, y]]);
  polygon(g, tone(0x65725c), [[cx + 60 * s, y], [cx + 120 * s, y - 195 * s], [cx + 160 * s, y]]);
  polygon(g, tone(0x8a967e), [[cx + 120 * s, y], [cx + 175 * s, y - 130 * s], [cx + 215 * s, y]]);
  // The "tablecloth": a cloud lying on the top
  g.fillStyle(tone(0xffffff), 1);
  g.fillRoundedRect(cx - 150 * s, y - 205 * s, 250 * s, 18 * s, 9 * s);
  // The colorful little houses (the Bo-Kaap neighborhood)
  const colors = [0xe94f64, 0x4fb0e9, 0xf5d03c, 0x7ccf5a, 0xb56be0, 0xf59a3c];
  for (let k = 0; k < 8; k++) {
    const hx = cx - 170 * s + k * 34 * s;
    g.fillStyle(tone(colors[k % colors.length]), 1);
    g.fillRect(hx, y - 34 * s, 28 * s, 34 * s);
    g.fillStyle(tone(0x3a3a44), 1);
    g.fillRect(hx + 10 * s, y - 20 * s, 8 * s, 20 * s); // door
  }
}

// ------------------------------------------------------------------
// ZAMBIA / ZIMBABUE — Victoria Falls: a whole river falling down a cliff,
// with mist and a rainbow ("the smoke that thunders")
// ------------------------------------------------------------------
function drawCataratas(g, tone, cx, y, s) {
  const top = y - 210 * s;
  // The green land on top and the rock wall of the cliff
  g.fillStyle(tone(0x4f8f4a), 1);
  g.fillRect(cx - 190 * s, top - 18 * s, 380 * s, 18 * s);
  g.fillStyle(tone(0x6e5a48), 1);
  g.fillRect(cx - 190 * s, top, 380 * s, 210 * s);
  // The water falling: white and light blue stripes
  for (let k = 0; k < 15; k++) {
    g.fillStyle(tone(k % 2 ? 0xdff2ff : 0x9fd3f2), 1);
    g.fillRect(cx - 165 * s + k * 22 * s, top, 18 * s, 180 * s + (k % 3) * 10 * s);
  }
  // The mist at the bottom (white clouds)
  g.fillStyle(tone(0xf4f8fa), 1);
  for (let k = -3; k <= 3; k++) g.fillCircle(cx + k * 55 * s, y - 20 * s, 34 * s);
  // The rainbow in the mist
  const rainbow = [0xe53935, 0xfb8c00, 0xfdd835, 0x43a047, 0x1e88e5, 0x8e24aa];
  rainbow.forEach((c, i) => {
    g.lineStyle(5 * s, tone(c), 1);
    g.beginPath();
    g.arc(cx + 40 * s, y - 20 * s, (150 - i * 5) * s, Math.PI, Math.PI * 1.75);
    g.strokePath();
  });
  // Trees on the top
  [-160, -60, 70, 160].forEach((dx) => forestTree(g, tone, cx + dx * s, top - 18 * s, 25 * s, 0.6 * s));
}

// ------------------------------------------------------------------
// MALÍ — the Great Mosque of Djenné, the biggest building made of MUD
// in the world (the sticks poking out help to climb it and fix it)
// ------------------------------------------------------------------
function drawDjenne(g, tone, cx, y, s) {
  const mud = tone(0xc48a52);
  const shade = tone(0xa36f3e);
  g.fillStyle(shade, 1);
  g.fillRect(cx - 170 * s, y - 30 * s, 340 * s, 30 * s); // the platform
  g.fillStyle(mud, 1);
  g.fillRect(cx - 150 * s, y - 140 * s, 300 * s, 110 * s); // the big wall
  // Three tall towers, with round tops
  [-100, 0, 100].forEach((dx) => {
    const tx = cx + dx * s;
    const h = dx === 0 ? 230 : 195;
    polygon(g, mud, [[tx - 26 * s, y - 30 * s], [tx + 26 * s, y - 30 * s], [tx + 16 * s, y - h * s], [tx - 16 * s, y - h * s]]);
    g.fillCircle(tx, y - h * s, 16 * s);
    g.fillStyle(tone(0xf1e4c8), 1);
    g.fillCircle(tx, y - (h + 18) * s, 5 * s); // the egg on top
    // The sticks poking out
    g.fillStyle(tone(0x6e4a2a), 1);
    for (let sy = y - 60 * s; sy > y - h * s; sy -= 30 * s) {
      g.fillRect(tx - 22 * s, sy, 6 * s, 3 * s);
      g.fillRect(tx + 16 * s, sy, 6 * s, 3 * s);
    }
    g.fillStyle(mud, 1);
  });
  // Small pointy pillars along the wall, and the dark doors
  for (let px = cx - 145 * s; px < cx + 145 * s; px += 25 * s) {
    g.fillTriangle(px, y - 140 * s, px + 10 * s, y - 140 * s, px + 5 * s, y - 158 * s);
  }
  g.fillStyle(tone(0x4a3020), 1);
  [-50, 50].forEach((dx) => g.fillRect(cx + dx * s - 9 * s, y - 72 * s, 18 * s, 42 * s));
}

// ------------------------------------------------------------------
// MARRUECOS — the Koutoubia, the tall square tower of Marrakech,
// and the red walls of the old city
// ------------------------------------------------------------------
function drawRedWalls(g, tone, span) {
  g.fillStyle(tone(0xc8704a), 1);
  g.fillRect(0, GROUND - 60, span + 200, 60);
  for (let x = 0; x < span + 200; x += 24) g.fillRect(x, GROUND - 72, 12, 12); // the teeth
  // Little palms behind the wall
  for (let x = 90, i = 0; x < span + 100; x += 240, i++) palm(g, tone, x, GROUND - 60, 40 + pseudoRandom(i) * 20, 0.6);
}

function drawKoutoubia(g, tone, cx, y, s) {
  const stone = tone(0xd99a6c);
  const shade = tone(0xb87c52);
  // The square tower
  g.fillStyle(stone, 1);
  g.fillRect(cx - 34 * s, y - 250 * s, 68 * s, 250 * s);
  g.fillStyle(shade, 1);
  g.fillRect(cx + 14 * s, y - 250 * s, 20 * s, 250 * s);
  // Pretty pointy windows, one above the other
  g.fillStyle(tone(0x5a3424), 1);
  for (let wy = y - 60 * s; wy > y - 230 * s; wy -= 55 * s) {
    g.fillRect(cx - 9 * s, wy, 18 * s, 26 * s);
    g.fillTriangle(cx - 9 * s, wy, cx + 9 * s, wy, cx, wy - 10 * s);
  }
  // A band of green tiles and the teeth on the top
  g.fillStyle(tone(0x2f9a6a), 1);
  g.fillRect(cx - 34 * s, y - 262 * s, 68 * s, 12 * s);
  g.fillStyle(stone, 1);
  for (let k = 0; k < 5; k++) g.fillRect(cx - 34 * s + k * 15 * s, y - 272 * s, 8 * s, 10 * s);
  // The small tower on top, its dome and three golden balls
  g.fillRect(cx - 14 * s, y - 310 * s, 28 * s, 38 * s);
  g.fillEllipse(cx, y - 312 * s, 28 * s, 16 * s);
  g.fillStyle(tone(0xe6b422), 1);
  g.fillRect(cx - 1.5 * s, y - 346 * s, 3 * s, 30 * s);
  [-322, -330, -338].forEach((dy) => g.fillCircle(cx, y + dy * s, 3.5 * s));
}

// ------------------------------------------------------------------
// MADAGASCAR — the Avenue of the Baobabs: giant trees next to a dirt road
// ------------------------------------------------------------------
function drawBaobabs(g, tone, cx, y, s) {
  // The red dirt road going away
  polygon(g, tone(0xc0703f), [[cx - 70 * s, y], [cx + 70 * s, y], [cx + 6 * s, y - 40 * s], [cx - 6 * s, y - 40 * s]]);
  baobab(g, tone, cx - 150 * s, y, 230 * s, 56 * s);
  baobab(g, tone, cx - 70 * s, y - 20 * s, 170 * s, 38 * s);
  baobab(g, tone, cx + 70 * s, y - 20 * s, 180 * s, 40 * s);
  baobab(g, tone, cx + 150 * s, y, 250 * s, 60 * s);
}

// ------------------------------------------------------------------
// ETIOPÍA — the church of Saint George in Lalibela: it was CARVED down
// into the rock, so it stands inside a big hole, with a cross on its roof
// ------------------------------------------------------------------
function drawHighlands(g, tone, span) {
  mountains(g, tone, span, 0x8f9a6a, 0x737e52, false);
}

function drawLalibela(g, tone, cx, y, s) {
  const rock = tone(0xc0805a);
  const shade = tone(0x9a6444);
  // The walls of the hole around the church
  g.fillStyle(shade, 1);
  g.fillRect(cx - 190 * s, y - 120 * s, 70 * s, 120 * s);
  g.fillRect(cx + 120 * s, y - 120 * s, 70 * s, 120 * s);
  g.fillStyle(tone(0x6f9a4a), 1);
  g.fillRect(cx - 190 * s, y - 128 * s, 70 * s, 8 * s);
  g.fillRect(cx + 120 * s, y - 128 * s, 70 * s, 8 * s);
  // The church: a tall block with windows
  g.fillStyle(rock, 1);
  g.fillRect(cx - 70 * s, y - 170 * s, 140 * s, 170 * s);
  g.fillStyle(shade, 1);
  g.fillRect(cx + 30 * s, y - 170 * s, 40 * s, 170 * s);
  g.fillStyle(tone(0x4a2a1a), 1);
  [-40, 0, 40].forEach((dx) => {
    g.fillRect(cx + dx * s - 7 * s, y - 120 * s, 14 * s, 26 * s);
    g.fillRect(cx + dx * s - 7 * s, y - 60 * s, 14 * s, 26 * s);
  });
  // The big cross on the roof (made of crosses inside crosses!)
  g.fillStyle(rock, 1);
  g.fillRect(cx - 12 * s, y - 230 * s, 24 * s, 62 * s);
  g.fillRect(cx - 34 * s, y - 212 * s, 68 * s, 22 * s);
  g.fillStyle(shade, 1);
  g.fillRect(cx - 4 * s, y - 222 * s, 8 * s, 44 * s);
  g.fillRect(cx - 24 * s, y - 205 * s, 48 * s, 8 * s);
}

// ------------------------------------------------------------------
// NIGERIA — Zuma Rock: a giant round rock that seems to have a FACE
// ------------------------------------------------------------------
function drawZuma(g, tone, cx, y, s) {
  g.fillStyle(tone(0x8a8478), 1);
  g.fillEllipse(cx, y, 330 * s, 560 * s); // only the top half shows (the rest is underground)
  g.fillStyle(tone(0x6d685e), 1);
  g.fillEllipse(cx + 70 * s, y, 150 * s, 500 * s); // the shaded side
  // Dark lines where the rain runs down
  g.fillStyle(tone(0x5a564e), 1);
  [-110, -70, 40, 95].forEach((dx) => g.fillRect(cx + dx * s, y - 210 * s + Math.abs(dx) * s, 4 * s, 120 * s));
  // The face: two eyes, a nose and a mouth
  g.fillEllipse(cx - 30 * s, y - 190 * s, 26 * s, 14 * s);
  g.fillEllipse(cx + 30 * s, y - 190 * s, 26 * s, 14 * s);
  g.fillRect(cx - 3 * s, y - 180 * s, 6 * s, 30 * s);
  g.fillEllipse(cx, y - 130 * s, 60 * s, 12 * s);
  // Palm trees in front
  palm(g, tone, cx - 150 * s, y, 110 * s, s, -10 * s);
  palm(g, tone, cx + 160 * s, y, 90 * s, s, 12 * s);
}

// ------------------------------------------------------------------
// NAMIBIA — Deadvlei: huge RED dunes, a white dry lake and black trees
// that died a long, long time ago
// ------------------------------------------------------------------
function drawRedDunes(g, tone, span) {
  dunes(g, tone, span, 0xe08a4e, 0xc8703a);
}

// A dead tree: black trunk and bare twisted branches
function deadTree(g, tone, x, y, s) {
  const black = tone(0x2a2420);
  polygon(g, black, [[x - 4 * s, y], [x + 4 * s, y], [x + 2 * s, y - 60 * s], [x - 2 * s, y - 60 * s]]);
  g.lineStyle(3 * s, black, 1);
  g.lineBetween(x, y - 40 * s, x - 30 * s, y - 70 * s);
  g.lineBetween(x, y - 50 * s, x + 26 * s, y - 80 * s);
  g.lineBetween(x, y - 60 * s, x - 6 * s, y - 90 * s);
  g.lineBetween(x - 20 * s, y - 60 * s, x - 34 * s, y - 62 * s);
}

function drawDeadvlei(g, tone, cx, y, s) {
  // The giant dune, with a sharp edge: one side in the sun and one in the shade
  polygon(g, tone(0xe8803e), [[cx - 200 * s, y], [cx + 30 * s, y - 260 * s], [cx + 200 * s, y]]);
  polygon(g, tone(0xb85a2a), [[cx + 30 * s, y - 260 * s], [cx + 200 * s, y], [cx - 20 * s, y]]);
  // The white dry lake (cracked clay)
  g.fillStyle(tone(0xf1e8d8), 1);
  g.fillEllipse(cx, y, 360 * s, 40 * s);
  [-110, -30, 60, 130].forEach((dx, i) => deadTree(g, tone, cx + dx * s, y - 4 * s, (0.9 + (i % 2) * 0.3) * s));
}

// ------------------------------------------------------------------
// NUEVA ZELANDA — the Sky Tower of Auckland, snowy mountains and a kiwi
// (the little bird that can't fly, the symbol of the country)
// ------------------------------------------------------------------
function drawNzBackground(g, tone, span) {
  mountains(g, tone, span, 0x8fa0b6, 0x71839b, true);
  sea(g, tone, span);
}

function drawSkyTower(g, tone, cx, y, s) {
  const concrete = tone(0xd4d8dc);
  const shade = tone(0xaab0b8);
  // The shaft, a little wider at the bottom
  polygon(g, concrete, [[cx - 14 * s, y], [cx + 14 * s, y], [cx + 8 * s, y - 220 * s], [cx - 8 * s, y - 220 * s]]);
  polygon(g, shade, [[cx + 3 * s, y], [cx + 14 * s, y], [cx + 8 * s, y - 220 * s], [cx + 3 * s, y - 220 * s]]);
  // The round deck with three floors of windows
  g.fillStyle(concrete, 1);
  g.fillEllipse(cx, y - 222 * s, 60 * s, 18 * s);
  g.fillStyle(tone(0x4a6a8a), 1);
  g.fillRect(cx - 26 * s, y - 248 * s, 52 * s, 22 * s);
  g.fillStyle(concrete, 1);
  g.fillRect(cx - 26 * s, y - 240 * s, 52 * s, 3 * s);
  g.fillEllipse(cx, y - 250 * s, 50 * s, 12 * s);
  // The long thin top (the mast)
  polygon(g, concrete, [[cx - 6 * s, y - 252 * s], [cx + 6 * s, y - 252 * s], [cx + 2 * s, y - 345 * s], [cx - 2 * s, y - 345 * s]]);
  g.fillStyle(tone(0xff3030), 1);
  g.fillCircle(cx, y - 347 * s, 3 * s);
  // The kiwi bird: round brown body, small head and a long beak
  const kx = cx - 90 * s;
  g.fillStyle(tone(0x7a5a3a), 1);
  g.fillEllipse(kx, y - 22 * s, 50 * s, 36 * s);
  g.fillCircle(kx - 24 * s, y - 32 * s, 10 * s);
  g.fillRect(kx - 4 * s, y - 6 * s, 3 * s, 6 * s);
  g.fillRect(kx + 6 * s, y - 6 * s, 3 * s, 6 * s);
  g.lineStyle(2 * s, tone(0xd8c08a), 1);
  g.lineBetween(kx - 32 * s, y - 32 * s, kx - 54 * s, y - 14 * s);
}

// ------------------------------------------------------------------
// The list of landmarks of this region (names used in THEMES below)
// ------------------------------------------------------------------
export const LANDMARKS = {
  sabana: { background: drawSavannaGrass, landmark: drawSabana, size: 1.1 },
  selva: { background: drawForest, landmark: drawSelva, size: 1.0 },
  sahara: { background: drawSaharaDunes, landmark: drawSahara, size: 1.0 },
  isla: { background: drawIslands, landmark: drawIsla, size: 1.1 },
  kilimanjaro: { background: drawSavannaGrass, landmark: drawKilimanjaro, size: 1.25 },
  mesa: { background: sea, landmark: drawMesa, size: 1.1 },
  cataratas: { background: drawForest, landmark: drawCataratas, size: 1.0 },
  djenne: { background: drawSaharaDunes, landmark: drawDjenne, size: 1.0 },
  koutoubia: { background: drawRedWalls, landmark: drawKoutoubia, size: 1.0 },
  baobabs: { background: drawSavannaGrass, landmark: drawBaobabs, size: 1.0 },
  lalibela: { background: drawHighlands, landmark: drawLalibela, size: 1.0 },
  zuma: { background: drawSavannaGrass, landmark: drawZuma, size: 1.0 },
  deadvlei: { background: drawRedDunes, landmark: drawDeadvlei, size: 1.0 },
  skytower: { background: drawNzBackground, landmark: drawSkyTower, size: 1.0 },
};

// ------------------------------------------------------------------
// Every country of África and Oceanía → its scenery
// (place: "Cerca de ..." on the level intro screen; null = no special place)
// ------------------------------------------------------------------
export const THEMES = {
  // Countries with their own famous landmark
  TZA: { landmark: 'kilimanjaro', place: 'el Kilimanjaro' },
  ZAF: { landmark: 'mesa', place: 'la Montaña de la Mesa' },
  ZMB: { landmark: 'cataratas', place: 'las Cataratas Victoria' },
  ZWE: { landmark: 'cataratas', place: 'las Cataratas Victoria' },
  AGO: { landmark: 'cataratas', place: 'las cataratas de Kalandula' },
  MLI: { landmark: 'djenne', place: 'la Gran Mezquita de Djenné' },
  NER: { landmark: 'djenne', place: 'la mezquita de barro de Agadez' },
  BFA: { landmark: 'djenne', place: 'la mezquita de barro de Bobo-Dioulasso' },
  MAR: { landmark: 'koutoubia', place: 'la Koutoubia de Marrakech' },
  MDG: { landmark: 'baobabs', place: 'la Avenida de los Baobabs' },
  SEN: { landmark: 'baobabs', place: null },
  ETH: { landmark: 'lalibela', place: 'las iglesias de roca de Lalibela' },
  NGA: { landmark: 'zuma', place: 'la Roca Zuma' },
  NAM: { landmark: 'deadvlei', place: 'las dunas rojas de Deadvlei' },
  NZL: { landmark: 'skytower', place: 'la Sky Tower de Auckland' },
  // Built-in landmarks that fit other countries too
  SDN: { landmark: 'piramides', place: 'las pirámides de Meroe' },
  TUN: { landmark: 'coliseo', place: 'el anfiteatro de El Jem' },

  // SABANA
  KEN: { landmark: 'sabana', place: 'la reserva Masái Mara' },
  BWA: { landmark: 'sabana', place: 'el delta del Okavango' },
  UGA: { landmark: 'sabana', place: null },
  SSD: { landmark: 'sabana', place: null },
  MWI: { landmark: 'sabana', place: null },
  MOZ: { landmark: 'sabana', place: null },
  SWZ: { landmark: 'sabana', place: null },
  LSO: { landmark: 'sabana', place: null },
  SOM: { landmark: 'sabana', place: null },
  TGO: { landmark: 'sabana', place: null },
  BEN: { landmark: 'sabana', place: null },
  GMB: { landmark: 'sabana', place: null },
  GNB: { landmark: 'sabana', place: null },

  // SELVA
  COD: { landmark: 'selva', place: 'la selva del Congo' },
  COG: { landmark: 'selva', place: 'la selva del Congo' },
  RWA: { landmark: 'selva', place: 'los bosques de los gorilas' },
  BDI: { landmark: 'selva', place: null },
  GAB: { landmark: 'selva', place: null },
  CMR: { landmark: 'selva', place: null },
  CAF: { landmark: 'selva', place: null },
  GNQ: { landmark: 'selva', place: null },
  CIV: { landmark: 'selva', place: null },
  GHA: { landmark: 'selva', place: null },
  LBR: { landmark: 'selva', place: null },
  SLE: { landmark: 'selva', place: null },
  GIN: { landmark: 'selva', place: null },
  PNG: { landmark: 'selva', place: null },

  // SAHARA
  DZA: { landmark: 'sahara', place: 'el desierto del Sahara' },
  LBY: { landmark: 'sahara', place: 'el desierto del Sahara' },
  MRT: { landmark: 'sahara', place: 'el desierto del Sahara' },
  TCD: { landmark: 'sahara', place: 'el desierto del Sahara' },
  ERI: { landmark: 'sahara', place: null },
  DJI: { landmark: 'sahara', place: null },

  // ISLA (Indian Ocean, Atlantic and Pacific islands)
  SYC: { landmark: 'isla', place: null },
  MUS: { landmark: 'isla', place: null },
  COM: { landmark: 'isla', place: null },
  CPV: { landmark: 'isla', place: null },
  STP: { landmark: 'isla', place: null },
  FJI: { landmark: 'isla', place: null },
  VUT: { landmark: 'isla', place: null },
  FSM: { landmark: 'isla', place: null },
  MHL: { landmark: 'isla', place: null },
  TON: { landmark: 'isla', place: null },
  SLB: { landmark: 'isla', place: null },
  WSM: { landmark: 'isla', place: null },
  PLW: { landmark: 'isla', place: null },
  NRU: { landmark: 'isla', place: null },
  KIR: { landmark: 'isla', place: null },
};
