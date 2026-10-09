// SkinPack2.js — 50 MORE skins for the hero! They come out of the pencils too.
// Same rules as SkinPack.js: every skin is 32 x 48 pixels, people use the
// person() mold and animals use the animal() mold (both in SkinParts.js).

import { RAINBOW, SKIN_COLOR, person, face, cape, bigEyes, animal } from './SkinParts.js';

// A darker skin color, so not every person looks the same
const SKIN_DARK = 0x8d5524;
const SKIN_MID = 0xc68642;

// Hair on top of the head (a cap of hair, with a little fringe)
function hair(gfx, color) {
  gfx.fillStyle(color);
  gfx.fillRect(9, 5, 14, 4);
  gfx.fillCircle(10, 8, 2);
  gfx.fillCircle(22, 8, 2);
}

export const SKIN_PACK_2 = [
  // =============================================================
  // COMUNES
  // =============================================================
  {
    id: 'cartero', name: 'Cartero', rarity: 'comun',
    draw(gfx) {
      person(gfx, { skin: SKIN_MID, shirt: 0x3366cc, pants: 0x223355 });
      // Brown bag with letters, on a strap across the chest
      gfx.lineStyle(2, 0x6b3a1e);
      gfx.lineBetween(10, 21, 22, 33);
      gfx.fillStyle(0x8b5a2b);
      gfx.fillRect(19, 30, 9, 7);
      gfx.fillStyle(0xffffff);
      gfx.fillRect(21, 28, 5, 3);
      // Blue cap
      gfx.fillStyle(0x3366cc);
      gfx.fillRect(9, 4, 14, 4);
      gfx.fillRect(9, 7, 17, 2);
    },
  },
  {
    id: 'pintora', name: 'Pintora', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0xffffff, pants: 0x4466aa });
      // Paint spots on the apron
      [0xff3333, 0x33aa33, 0x3366ff, 0xffcc00].forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillCircle(11 + (i % 2) * 8, 25 + i * 3, 1.6);
      });
      // Red beret
      gfx.fillStyle(0xcc2222);
      gfx.fillEllipse(15, 6, 18, 6);
      gfx.fillRect(15, 1, 2, 3);
      // Brush with paint on the tip
      gfx.fillStyle(0x8b5a2b);
      gfx.fillRect(25, 22, 2, 12);
      gfx.fillStyle(0xff44aa);
      gfx.fillRect(24.5, 19, 3, 4);
    },
  },
  {
    id: 'constructor', name: 'Constructor', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0x4477aa, pants: 0x334455, shoes: 0x6b3a1e });
      // Orange vest with shiny stripes
      gfx.fillStyle(0xff7700);
      gfx.fillRect(9, 21, 4, 17);
      gfx.fillRect(19, 21, 4, 17);
      gfx.fillStyle(0xeeeeee);
      gfx.fillRect(9, 30, 4, 1.5);
      gfx.fillRect(19, 30, 4, 1.5);
      // Yellow hard hat
      gfx.fillStyle(0xffcc00);
      gfx.fillEllipse(16, 7, 16, 8);
      gfx.fillRect(6, 7, 20, 2);
      // A hammer
      gfx.fillStyle(0x8b5a2b);
      gfx.fillRect(25, 24, 2, 12);
      gfx.fillStyle(0x777777);
      gfx.fillRect(22, 22, 8, 3);
    },
  },
  {
    id: 'enfermero', name: 'Enfermero', rarity: 'comun',
    draw(gfx) {
      person(gfx, { skin: SKIN_DARK, shirt: 0x33bbaa, pants: 0x33bbaa, shoes: 0xffffff });
      hair(gfx, 0x111111);
      // V neck and a little pocket with a pen
      gfx.fillStyle(SKIN_DARK);
      gfx.fillTriangle(13, 21, 19, 21, 16, 25);
      gfx.fillStyle(0x229988);
      gfx.fillRect(18, 27, 4, 4);
      gfx.fillStyle(0x2244cc);
      gfx.fillRect(19, 25, 1, 3);
    },
  },
  {
    id: 'maestra', name: 'Maestra', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0xcc4477, pants: 0x333355 });
      // Hair in a bun
      gfx.fillStyle(0x6b3a1e);
      gfx.fillRect(9, 5, 14, 4);
      gfx.fillCircle(16, 4, 3.5);
      // Glasses
      gfx.lineStyle(1, 0x000000);
      gfx.strokeCircle(13, 13, 2.5);
      gfx.strokeCircle(19, 13, 2.5);
      gfx.lineBetween(15.5, 13, 16.5, 13);
      // A green book
      gfx.fillStyle(0x228833);
      gfx.fillRect(22, 28, 7, 9);
      gfx.fillStyle(0xffffff);
      gfx.fillRect(23, 29, 1, 7);
    },
  },
  {
    id: 'cientifico', name: 'Científico', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0xffffff, pants: 0x555555 });
      // Crazy white hair sticking out
      gfx.fillStyle(0xeeeeee);
      gfx.fillCircle(8, 9, 3.5);
      gfx.fillCircle(24, 9, 3.5);
      gfx.fillCircle(11, 5, 3);
      gfx.fillCircle(21, 5, 3);
      // Lab goggles
      gfx.fillStyle(0x99ddff);
      gfx.fillRect(10, 11, 5, 4);
      gfx.fillRect(17, 11, 5, 4);
      // A bubbling green potion
      gfx.fillStyle(0xccffcc);
      gfx.fillRect(25, 25, 3, 4);
      gfx.fillStyle(0x33ee55);
      gfx.fillCircle(26.5, 32, 4);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(25.5, 31, 1);
    },
  },
  {
    id: 'karateca', name: 'Karateca', rarity: 'comun',
    draw(gfx) {
      person(gfx, { skin: SKIN_MID, shirt: 0xffffff, pants: 0xffffff, shoes: SKIN_MID });
      hair(gfx, 0x111111);
      // The gi folds and the black belt
      gfx.lineStyle(1, 0xcccccc);
      gfx.lineBetween(12, 21, 17, 28);
      gfx.lineBetween(20, 21, 15, 28);
      gfx.fillStyle(0x111111);
      gfx.fillRect(9, 31, 14, 2.5);
      gfx.fillRect(14, 33, 2, 4);
      gfx.fillRect(17, 33, 2, 4);
      // Red headband
      gfx.fillStyle(0xdd0000);
      gfx.fillRect(9, 8, 14, 2);
    },
  },
  {
    id: 'basquet', name: 'Basquetbolista', rarity: 'comun',
    draw(gfx) {
      person(gfx, { skin: SKIN_DARK, shirt: 0xffaa00, pants: 0xffaa00, shoes: 0xffffff });
      hair(gfx, 0x111111);
      // Jersey number
      gfx.fillStyle(0x6633aa);
      gfx.fillRect(14, 25, 1.5, 7);
      gfx.fillRect(17, 25, 1.5, 7);
      gfx.fillRect(17, 25, 3, 1.5);
      gfx.fillRect(18.5, 25, 1.5, 7);
      gfx.fillRect(17, 30.5, 3, 1.5);
      // Orange basketball in the hand
      gfx.fillStyle(0xff7700);
      gfx.fillCircle(28, 33, 4);
      gfx.lineStyle(1, 0x000000);
      gfx.lineBetween(24, 33, 32, 33);
      gfx.lineBetween(28, 29, 28, 37);
    },
  },
  {
    id: 'tenista', name: 'Tenista', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0xffffff, pants: 0xffffff, shoes: 0xffffff });
      // Blond ponytail and a green visor
      gfx.fillStyle(0xf5d76e);
      gfx.fillRect(9, 6, 14, 3);
      gfx.fillEllipse(23, 12, 4, 9);
      gfx.fillStyle(0x22aa44);
      gfx.fillRect(8, 7, 17, 2);
      // Racket and a yellow ball
      gfx.lineStyle(1.5, 0x333333);
      gfx.strokeEllipse(28, 24, 6, 9);
      gfx.fillStyle(0x333333);
      gfx.fillRect(27, 28, 2, 6);
      gfx.fillStyle(0xddff33);
      gfx.fillCircle(5, 18, 2);
    },
  },
  {
    id: 'surfista', name: 'Surfista', rarity: 'comun',
    draw(gfx) {
      // The surfboard behind
      gfx.fillStyle(0x22bbee);
      gfx.fillEllipse(27, 26, 7, 42);
      gfx.fillStyle(0xffffff);
      gfx.fillRect(26.5, 6, 1, 40);
      person(gfx, { skin: SKIN_MID, shirt: SKIN_MID, pants: 0xff6699, shoes: SKIN_MID });
      // Flower shorts and long blond hair
      gfx.fillStyle(0xffee33);
      gfx.fillCircle(13, 40, 1.2);
      gfx.fillCircle(19, 42, 1.2);
      gfx.fillStyle(0xf5d76e);
      gfx.fillRect(9, 5, 14, 4);
      gfx.fillRect(8, 7, 3, 9);
    },
  },
  {
    id: 'esquiador', name: 'Esquiador', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0xee3333, pants: 0x222266, shoes: 0x222222 });
      // The skis under the feet
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(3, 47, 26, 1.5);
      // White stripe on the jacket
      gfx.fillStyle(0xffffff);
      gfx.fillRect(9, 27, 14, 2);
      // Beanie with a pompom and ski goggles
      gfx.fillStyle(0x3366ff);
      gfx.fillRect(9, 4, 14, 5);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(16, 3, 2.5);
      gfx.fillStyle(0xffaa00);
      gfx.fillRect(10, 10, 12, 4);
    },
  },
  {
    id: 'cerdito', name: 'Cerdito', rarity: 'comun',
    draw(gfx) {
      animal(gfx, { color: 0xffaacc, belly: 0xffc8dd, ears: 'pointy', earColor: 0xff88aa, snout: false });
      // The flat pig nose with two holes
      gfx.fillStyle(0xff88aa);
      gfx.fillEllipse(16, 18, 7, 5);
      gfx.fillStyle(0x993355);
      gfx.fillCircle(14.5, 18, 0.9);
      gfx.fillCircle(17.5, 18, 0.9);
      // Curly tail
      gfx.lineStyle(1.5, 0xff88aa);
      gfx.strokeCircle(26, 38, 2);
    },
  },
  {
    id: 'vaca', name: 'Vaca', rarity: 'comun',
    draw(gfx) {
      animal(gfx, { color: 0xffffff, belly: 0xffccdd, ears: 'pointy', earColor: 0xffccdd, nose: 0x553333 });
      // Black spots
      gfx.fillStyle(0x111111);
      gfx.fillCircle(10, 28, 3);
      gfx.fillCircle(22, 35, 3.5);
      gfx.fillCircle(20, 9, 2.5);
      gfx.fillRect(10, 44, 5, 4);
      gfx.fillRect(17, 44, 5, 4);
      // Little horns and a bell
      gfx.fillStyle(0xeeddaa);
      gfx.fillTriangle(10, 7, 13, 6, 10, 1);
      gfx.fillTriangle(22, 7, 19, 6, 22, 1);
      gfx.fillStyle(0xffcc00);
      gfx.fillCircle(16, 25, 2);
    },
  },
  {
    id: 'conejo', name: 'Conejo', rarity: 'comun',
    draw(gfx) {
      animal(gfx, { color: 0xeeeeee, belly: 0xffffff, ears: 'long', earColor: 0xffaacc, nose: 0xff6699 });
      // Two big front teeth and a carrot
      gfx.fillStyle(0xffffff);
      gfx.fillRect(15, 20, 2, 2.5);
      gfx.fillStyle(0xff8800);
      gfx.fillTriangle(24, 30, 29, 30, 26.5, 40);
      gfx.fillStyle(0x33aa33);
      gfx.fillTriangle(25, 30, 28, 30, 26.5, 26);
    },
  },
  {
    id: 'oso', name: 'Oso', rarity: 'comun',
    draw(gfx) {
      animal(gfx, { color: 0x8b5a2b, belly: 0xd2a679, ears: 'round' });
      // A pot of honey
      gfx.fillStyle(0xffaa00);
      gfx.fillRect(22, 30, 7, 7);
      gfx.fillStyle(0xffdd55);
      gfx.fillRect(22, 29, 7, 2);
    },
  },
  {
    id: 'raton', name: 'Ratón', rarity: 'comun',
    draw(gfx) {
      animal(gfx, { color: 0x999999, belly: 0xdddddd, ears: 'round', earColor: 0xffaacc, nose: 0xff6699 });
      // Extra big ears for a mouse
      gfx.fillStyle(0x999999);
      gfx.fillCircle(6, 7, 5);
      gfx.fillCircle(26, 7, 5);
      gfx.fillStyle(0xffaacc);
      gfx.fillCircle(6, 7, 3);
      gfx.fillCircle(26, 7, 3);
      // Whiskers and a long tail
      gfx.lineStyle(0.8, 0x333333);
      gfx.lineBetween(9, 17, 13, 18);
      gfx.lineBetween(23, 17, 19, 18);
      gfx.lineStyle(1.5, 0xffaacc);
      gfx.lineBetween(24, 40, 31, 44);
    },
  },
  {
    id: 'pato', name: 'Pato', rarity: 'comun',
    draw(gfx) {
      // Orange feet
      gfx.fillStyle(0xff9900);
      gfx.fillEllipse(12, 46, 7, 3);
      gfx.fillEllipse(20, 46, 7, 3);
      // White body, wing and head
      gfx.fillStyle(0xffffff);
      gfx.fillEllipse(16, 33, 22, 22);
      gfx.fillCircle(16, 15, 8);
      gfx.fillStyle(0xdddddd);
      gfx.fillEllipse(9, 32, 8, 12);
      bigEyes(gfx, 13, 13, 19, 2.2);
      // Wide flat orange beak
      gfx.fillStyle(0xff9900);
      gfx.fillEllipse(16, 19, 10, 4);
      // A blue sailor hat
      gfx.fillStyle(0x2255cc);
      gfx.fillRect(11, 5, 10, 3);
    },
  },
  {
    id: 'perrito', name: 'Perrito café', rarity: 'comun',
    draw(gfx) {
      animal(gfx, { color: 0xb07a45, belly: 0xf0d8b0, ears: 'none' });
      // Floppy ears hanging down
      gfx.fillStyle(0x6b3a1e);
      gfx.fillEllipse(7, 14, 5, 11);
      gfx.fillEllipse(25, 14, 5, 11);
      // Tongue out and a red collar
      gfx.fillStyle(0xff6699);
      gfx.fillEllipse(16, 22, 3, 3);
      gfx.fillStyle(0xdd0000);
      gfx.fillRect(10, 23, 12, 2);
      gfx.fillStyle(0xffcc00);
      gfx.fillCircle(16, 26, 1.3);
    },
  },
  {
    id: 'caracol', name: 'Caracol', rarity: 'comun',
    draw(gfx) {
      // The soft body along the ground, standing up at the front
      gfx.fillStyle(0xaadd66);
      gfx.fillRect(2, 42, 28, 6);
      gfx.fillRect(22, 22, 8, 22);
      gfx.fillCircle(26, 22, 5);
      // Eye stalks
      gfx.lineStyle(1.5, 0xaadd66);
      gfx.lineBetween(24, 18, 22, 10);
      gfx.lineBetween(28, 18, 30, 10);
      bigEyes(gfx, 10, 22, 30, 2);
      gfx.fillStyle(0x000000);
      gfx.fillRect(24, 25, 4, 1);
      // The shell: a spiral of rainbow circles
      gfx.fillStyle(0xcc7733);
      gfx.fillCircle(12, 33, 10);
      gfx.fillStyle(0xee9944);
      gfx.fillCircle(12, 33, 7);
      gfx.fillStyle(0xcc7733);
      gfx.fillCircle(13, 32, 4);
      gfx.fillStyle(0xee9944);
      gfx.fillCircle(13.5, 31.5, 1.8);
    },
  },
  {
    id: 'mariquita', name: 'Mariquita', rarity: 'comun',
    draw(gfx) {
      // Little black legs
      gfx.fillStyle(0x111111);
      gfx.fillRect(10, 42, 3, 6);
      gfx.fillRect(19, 42, 3, 6);
      gfx.fillRect(3, 28, 4, 2);
      gfx.fillRect(25, 28, 4, 2);
      // Red shell with a line down the middle and black dots
      gfx.fillStyle(0xdd1111);
      gfx.fillEllipse(16, 31, 22, 24);
      gfx.fillStyle(0x111111);
      gfx.fillRect(15.5, 20, 1, 22);
      gfx.fillCircle(10, 27, 2.5);
      gfx.fillCircle(22, 27, 2.5);
      gfx.fillCircle(11, 36, 2);
      gfx.fillCircle(21, 36, 2);
      // Black head with antennae
      gfx.fillCircle(16, 14, 7);
      gfx.lineStyle(1.2, 0x111111);
      gfx.lineBetween(13, 8, 10, 2);
      gfx.lineBetween(19, 8, 22, 2);
      bigEyes(gfx, 13, 13, 19, 2.2);
    },
  },

  // =============================================================
  // RAROS
  // =============================================================
  {
    id: 'rockero', name: 'Rockero', rarity: 'raro',
    draw(gfx) {
      person(gfx, { shirt: 0x111111, pants: 0x223366, shoes: 0x111111 });
      // Long wild hair
      gfx.fillStyle(0x442211);
      gfx.fillRect(8, 5, 16, 4);
      gfx.fillRect(7, 7, 3, 14);
      gfx.fillRect(22, 7, 3, 14);
      // Electric guitar (red with a long neck)
      gfx.fillStyle(0xdd1111);
      gfx.fillEllipse(13, 32, 11, 8);
      gfx.fillStyle(0x8b5a2b);
      gfx.fillRect(16, 23, 13, 2);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(13, 32, 1.3);
    },
  },
  {
    id: 'dj', name: 'DJ', rarity: 'raro',
    draw(gfx) {
      person(gfx, { skin: SKIN_DARK, shirt: 0x8822cc, pants: 0x222222, shoes: 0xffffff });
      // Big headphones
      gfx.lineStyle(2, 0x222222);
      gfx.beginPath();
      gfx.arc(16, 13, 8, Math.PI, 0);
      gfx.strokePath();
      gfx.fillStyle(0x22ddff);
      gfx.fillRect(6, 11, 4, 6);
      gfx.fillRect(22, 11, 4, 6);
      // Cool sunglasses
      gfx.fillStyle(0x000000);
      gfx.fillRect(11, 11, 4, 3);
      gfx.fillRect(17, 11, 4, 3);
      gfx.fillRect(15, 12, 2, 1);
      // Music notes on the shirt
      gfx.fillStyle(0x22ddff);
      gfx.fillCircle(13, 31, 1.5);
      gfx.fillRect(14, 25, 1, 6);
      gfx.fillCircle(19, 29, 1.5);
      gfx.fillRect(20, 23, 1, 6);
    },
  },
  {
    id: 'bailarina', name: 'Bailarina', rarity: 'raro',
    draw(gfx) {
      person(gfx, { shirt: 0xff99cc, pants: 0xffddee, shoes: 0xff99cc });
      // The fluffy tutu
      gfx.fillStyle(0xffbbdd);
      gfx.fillEllipse(16, 35, 26, 7);
      // Hair bun with a pink bow
      gfx.fillStyle(0x6b3a1e);
      gfx.fillRect(9, 5, 14, 3);
      gfx.fillCircle(16, 3, 3);
      gfx.fillStyle(0xff3399);
      gfx.fillTriangle(12, 3, 16, 4, 12, 6);
      gfx.fillTriangle(20, 3, 16, 4, 20, 6);
    },
  },
  {
    id: 'hada', name: 'Hada', rarity: 'raro',
    draw(gfx) {
      // Shiny see-through wings
      gfx.fillStyle(0xaaeeff, 0.8);
      gfx.fillEllipse(6, 20, 10, 16);
      gfx.fillEllipse(26, 20, 10, 16);
      gfx.fillStyle(0xffccff, 0.8);
      gfx.fillEllipse(7, 33, 7, 10);
      gfx.fillEllipse(25, 33, 7, 10);
      person(gfx, { shirt: 0x66dd99, pants: 0x66dd99, shoes: 0x66dd99 });
      // Golden hair and a flower crown
      gfx.fillStyle(0xf5d76e);
      gfx.fillRect(9, 5, 14, 4);
      gfx.fillRect(8, 7, 3, 12);
      gfx.fillRect(21, 7, 3, 12);
      gfx.fillStyle(0xff66aa);
      gfx.fillCircle(11, 5, 1.6);
      gfx.fillCircle(16, 4, 1.6);
      gfx.fillCircle(21, 5, 1.6);
      // Magic wand with a star
      gfx.fillStyle(0xffffff);
      gfx.fillRect(26, 22, 1.5, 12);
      gfx.fillStyle(0xffee33);
      gfx.fillCircle(27, 21, 2.5);
    },
  },
  {
    id: 'elfo', name: 'Elfo', rarity: 'raro',
    draw(gfx) {
      person(gfx, { shirt: 0x228833, pants: 0x664422, shoes: 0x664422 });
      // Pointy ears
      gfx.fillStyle(SKIN_COLOR);
      gfx.fillTriangle(9, 11, 9, 15, 4, 9);
      gfx.fillTriangle(23, 11, 23, 15, 28, 9);
      // Long green hat that falls to one side
      gfx.fillStyle(0x228833);
      gfx.fillTriangle(8, 8, 24, 8, 27, 0);
      gfx.fillStyle(0xffcc00);
      gfx.fillCircle(27, 1, 1.5);
      // Belt
      gfx.fillStyle(0x553311);
      gfx.fillRect(9, 31, 14, 2);
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(15, 31, 2, 2);
    },
  },
  {
    id: 'vikingo', name: 'Vikingo', rarity: 'raro',
    draw(gfx) {
      person(gfx, { shirt: 0x775533, pants: 0x553311 });
      // Big orange beard and braids
      gfx.fillStyle(0xee7722);
      gfx.fillTriangle(9, 14, 23, 14, 16, 27);
      gfx.fillRect(8, 9, 3, 12);
      gfx.fillRect(21, 9, 3, 12);
      // Helmet with horns
      gfx.fillStyle(0x999999);
      gfx.fillEllipse(16, 7, 16, 8);
      gfx.fillStyle(0xffffee);
      gfx.fillTriangle(8, 7, 10, 5, 3, 0);
      gfx.fillTriangle(24, 7, 22, 5, 29, 0);
      // Round wooden shield
      gfx.fillStyle(0x8b5a2b);
      gfx.fillCircle(5, 30, 5);
      gfx.fillStyle(0xcccccc);
      gfx.fillCircle(5, 30, 1.5);
    },
  },
  {
    id: 'explorador', name: 'Explorador', rarity: 'raro',
    draw(gfx) {
      person(gfx, { shirt: 0xc8b07a, pants: 0x8b7a50, shoes: 0x553311 });
      // Pockets and a map
      gfx.fillStyle(0xa89060);
      gfx.fillRect(10, 24, 4, 4);
      gfx.fillRect(18, 24, 4, 4);
      gfx.fillStyle(0xffeeaa);
      gfx.fillRect(23, 29, 7, 6);
      gfx.fillStyle(0xdd0000);
      gfx.fillRect(26, 31, 1.5, 1.5);
      // Explorer hat
      gfx.fillStyle(0xd8c48a);
      gfx.fillEllipse(16, 7, 24, 5);
      gfx.fillEllipse(16, 5, 13, 7);
      gfx.fillStyle(0x6b3a1e);
      gfx.fillRect(10, 6, 12, 1.5);
    },
  },
  {
    id: 'luchador', name: 'Luchador', rarity: 'raro',
    draw(gfx) {
      person(gfx, { skin: SKIN_MID, shirt: SKIN_MID, pants: 0x2244cc, shoes: 0xdd0000, face: false });
      // Wrestling mask covering the head, with flames around the eyes
      gfx.fillStyle(0x2244cc);
      gfx.fillCircle(16, 13, 7.5);
      gfx.fillStyle(0xffcc00);
      gfx.fillTriangle(9, 11, 14, 9, 13, 16);
      gfx.fillTriangle(23, 11, 18, 9, 19, 16);
      gfx.fillStyle(0xffffff);
      gfx.fillEllipse(13, 13, 3.5, 2.5);
      gfx.fillEllipse(19, 13, 3.5, 2.5);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(13, 13, 0.9);
      gfx.fillCircle(19, 13, 0.9);
      gfx.fillRect(14, 17, 4, 1.2);
      // Champion belt
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(9, 33, 14, 3);
      gfx.fillCircle(16, 34.5, 2.5);
    },
  },
  {
    id: 'mono', name: 'Mono', rarity: 'raro',
    draw(gfx) {
      animal(gfx, { color: 0x7a4a24, belly: 0xe8c39e, ears: 'none', snout: false });
      // Side ears and a light face
      gfx.fillStyle(0xe8c39e);
      gfx.fillCircle(6, 14, 3.5);
      gfx.fillCircle(26, 14, 3.5);
      gfx.fillEllipse(16, 16, 12, 10);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(13, 14, 1.4);
      gfx.fillCircle(19, 14, 1.4);
      gfx.fillRect(13, 19, 6, 1.2);
      // Long curly tail and a banana
      gfx.lineStyle(2, 0x7a4a24);
      gfx.lineBetween(24, 40, 30, 34);
      gfx.strokeCircle(28, 31, 2.5);
      gfx.fillStyle(0xffdd22);
      gfx.fillEllipse(5, 37, 4, 8);
    },
  },
  {
    id: 'leon', name: 'León', rarity: 'raro',
    draw(gfx) {
      // The big mane goes behind the head
      gfx.fillStyle(0xcc6611);
      gfx.fillCircle(16, 15, 13);
      animal(gfx, { color: 0xeeaa44, belly: 0xffdd99, ears: 'round', earColor: 0xcc6611 });
      // Tail with a fluffy tip
      gfx.lineStyle(1.5, 0xeeaa44);
      gfx.lineBetween(24, 40, 30, 32);
      gfx.fillStyle(0xcc6611);
      gfx.fillCircle(30, 31, 2.5);
    },
  },
  {
    id: 'tigre', name: 'Tigre', rarity: 'raro',
    draw(gfx) {
      animal(gfx, { color: 0xff8822, belly: 0xffffff, ears: 'round', nose: 0xff6699 });
      // Black stripes
      gfx.fillStyle(0x111111);
      gfx.fillRect(14, 6, 1.5, 4);
      gfx.fillRect(17, 6, 1.5, 4);
      gfx.fillRect(7, 14, 3, 1.3);
      gfx.fillRect(22, 14, 3, 1.3);
      gfx.fillRect(7, 29, 4, 1.5);
      gfx.fillRect(21, 29, 4, 1.5);
      gfx.fillRect(8, 34, 3, 1.5);
      gfx.fillRect(21, 34, 3, 1.5);
      gfx.fillRect(5, 30, 5, 1.3);
      gfx.fillRect(22, 30, 5, 1.3);
    },
  },
  {
    id: 'zorro', name: 'Zorro', rarity: 'raro',
    draw(gfx) {
      // Big fluffy tail with a white tip
      gfx.fillStyle(0xee6611);
      gfx.fillEllipse(27, 36, 8, 16);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(28, 43, 3);
      animal(gfx, { color: 0xee6611, belly: 0xffffff, ears: 'pointy', earColor: 0x222222 });
      // Black paws
      gfx.fillStyle(0x222222);
      gfx.fillRect(10, 45, 5, 3);
      gfx.fillRect(17, 45, 5, 3);
    },
  },
  {
    id: 'koala', name: 'Koala', rarity: 'raro',
    draw(gfx) {
      animal(gfx, { color: 0x999aa5, belly: 0xdddde5, ears: 'none', snout: false });
      // Big fluffy round ears
      gfx.fillStyle(0x999aa5);
      gfx.fillCircle(6, 9, 5.5);
      gfx.fillCircle(26, 9, 5.5);
      gfx.fillStyle(0xeeeeee);
      gfx.fillCircle(6, 9, 3);
      gfx.fillCircle(26, 9, 3);
      // A big dark nose
      gfx.fillStyle(0x333333);
      gfx.fillEllipse(16, 17, 5, 6);
      // Hugging a eucalyptus branch
      gfx.fillStyle(0x6b3a1e);
      gfx.fillRect(2, 32, 28, 2);
      gfx.fillStyle(0x55aa66);
      gfx.fillEllipse(4, 30, 4, 3);
      gfx.fillEllipse(28, 30, 4, 3);
    },
  },
  {
    id: 'tortuga', name: 'Tortuga', rarity: 'raro',
    draw(gfx) {
      // Legs, head and arms
      gfx.fillStyle(0x77bb55);
      gfx.fillRect(10, 40, 5, 8);
      gfx.fillRect(17, 40, 5, 8);
      gfx.fillRect(4, 26, 5, 8);
      gfx.fillRect(23, 26, 5, 8);
      gfx.fillCircle(16, 13, 8);
      // Shell with a pattern
      gfx.fillStyle(0x336622);
      gfx.fillEllipse(16, 32, 22, 22);
      gfx.fillStyle(0x558833);
      gfx.fillCircle(16, 32, 4);
      gfx.fillCircle(10, 28, 2.5);
      gfx.fillCircle(22, 28, 2.5);
      gfx.fillCircle(10, 37, 2.5);
      gfx.fillCircle(22, 37, 2.5);
      // A blue mask, like a ninja turtle
      gfx.fillStyle(0x2266ee);
      gfx.fillRect(8, 11, 16, 4);
      bigEyes(gfx, 13, 13, 19, 1.8);
      gfx.fillStyle(0x000000);
      gfx.fillRect(13, 17, 6, 1);
    },
  },
  {
    id: 'medusa', name: 'Medusa', rarity: 'raro',
    draw(gfx) {
      // Wavy see-through tentacles
      gfx.lineStyle(2, 0xff88dd, 0.9);
      for (let i = 0; i < 5; i++) {
        const x = 7 + i * 4.5;
        gfx.lineBetween(x, 22, x - 2, 32);
        gfx.lineBetween(x - 2, 32, x + 1, 40);
        gfx.lineBetween(x + 1, 40, x - 1, 47);
      }
      // Round shiny top
      gfx.fillStyle(0xff99ee, 0.9);
      gfx.fillEllipse(16, 15, 28, 20);
      gfx.fillStyle(0xffccf5);
      gfx.fillEllipse(11, 11, 6, 4);
      bigEyes(gfx, 16, 12, 20, 2.5);
      gfx.fillStyle(0xcc3399);
      gfx.fillEllipse(16, 21, 4, 2);
    },
  },

  // =============================================================
  // ÉPICOS
  // =============================================================
  {
    id: 'bruja', name: 'Bruja', rarity: 'epico', canShoot: true, gunAt: [12, -8],
    draw(gfx) {
      person(gfx, { skin: 0x99dd88, shirt: 0x442266, pants: 0x442266, shoes: 0x111111 });
      // Long dress
      gfx.fillStyle(0x442266);
      gfx.fillRect(8, 30, 16, 16);
      // Long black hair and a tall pointy hat
      gfx.fillStyle(0x111111);
      gfx.fillRect(8, 7, 3, 14);
      gfx.fillRect(21, 7, 3, 14);
      gfx.fillRect(4, 6, 24, 2);
      gfx.fillTriangle(9, 7, 23, 7, 14, 0);
      gfx.fillStyle(0xff8800);
      gfx.fillRect(10, 5, 12, 1.5);
      // Magic broom
      gfx.fillStyle(0x8b5a2b);
      gfx.fillRect(26, 14, 2, 26);
      gfx.fillStyle(0xddbb55);
      gfx.fillTriangle(24, 40, 30, 40, 27, 48);
      gfx.fillStyle(0x66ff99);
      gfx.fillCircle(27, 15, 2);
    },
  },
  {
    id: 'lobo', name: 'Hombre lobo', rarity: 'epico',
    draw(gfx) {
      animal(gfx, { color: 0x555566, belly: 0x9999aa, ears: 'pointy', earColor: 0x9999aa });
      // Torn purple pants
      gfx.fillStyle(0x553388);
      gfx.fillRect(10, 38, 12, 6);
      gfx.fillTriangle(10, 44, 14, 44, 12, 47);
      gfx.fillTriangle(18, 44, 22, 44, 20, 47);
      // Glowing yellow eyes, fangs and claws
      gfx.fillStyle(0xffee33);
      gfx.fillCircle(12.5, 13, 1.6);
      gfx.fillCircle(19.5, 13, 1.6);
      gfx.fillStyle(0xffffff);
      gfx.fillTriangle(13.5, 20, 15, 20, 14, 23);
      gfx.fillTriangle(17, 20, 18.5, 20, 18, 23);
      gfx.fillRect(5, 36, 1, 2);
      gfx.fillRect(8, 36, 1, 2);
      gfx.fillRect(23, 36, 1, 2);
      gfx.fillRect(26, 36, 1, 2);
    },
  },
  {
    id: 'sirena', name: 'Sirena', rarity: 'epico',
    draw(gfx) {
      // Fish tail instead of legs, with a fin at the bottom
      gfx.fillStyle(0x22bbaa);
      gfx.fillTriangle(9, 30, 23, 30, 16, 44);
      gfx.fillTriangle(16, 42, 8, 48, 24, 48);
      gfx.fillStyle(0x44ddcc);
      gfx.fillCircle(13, 34, 1.5);
      gfx.fillCircle(19, 34, 1.5);
      gfx.fillCircle(16, 39, 1.5);
      // Body, arms and head (no legs!)
      gfx.fillStyle(SKIN_COLOR);
      gfx.fillRect(10, 21, 12, 10);
      gfx.fillRect(5, 22, 4, 10);
      gfx.fillRect(23, 22, 4, 10);
      gfx.fillCircle(16, 13, 7);
      face(gfx);
      // Purple shell top
      gfx.fillStyle(0xaa55dd);
      gfx.fillCircle(13, 24, 2.5);
      gfx.fillCircle(19, 24, 2.5);
      // Long red hair with a starfish
      gfx.fillStyle(0xdd3322);
      gfx.fillRect(9, 5, 14, 4);
      gfx.fillRect(7, 7, 3, 18);
      gfx.fillRect(22, 7, 3, 18);
      gfx.fillStyle(0xffcc00);
      gfx.fillCircle(21, 6, 2);
    },
  },
  {
    id: 'ciborg', name: 'Ciborg', rarity: 'epico', canShoot: true, gunAt: [14, 0],
    draw(gfx) {
      person(gfx, { shirt: 0x445566, pants: 0x334455, shoes: 0x222222 });
      // Half of the face is metal, with a red laser eye
      gfx.fillStyle(0xaabbcc);
      gfx.fillRect(16, 6, 7, 14);
      gfx.fillStyle(0xff0000);
      gfx.fillCircle(19, 13, 1.8);
      // Glowing blue lines on the body
      gfx.fillStyle(0x33ddff);
      gfx.fillRect(9, 25, 14, 1);
      gfx.fillRect(15.5, 21, 1, 17);
      gfx.fillCircle(16, 29, 2);
      // A robot arm with a cannon
      gfx.fillStyle(0xaabbcc);
      gfx.fillRect(23, 22, 4, 11);
      gfx.fillStyle(0x666666);
      gfx.fillRect(24, 31, 7, 4);
    },
  },
  {
    id: 'lava', name: 'Monstruo de lava', rarity: 'epico', canShoot: true, gunAt: [12, -4],
    draw(gfx) {
      // Body made of dark rocks with glowing cracks
      gfx.fillStyle(0x332222);
      gfx.fillRect(10, 38, 5, 10);
      gfx.fillRect(17, 38, 5, 10);
      gfx.fillRect(3, 22, 7, 14);
      gfx.fillRect(22, 22, 7, 14);
      gfx.fillRoundedRect(7, 18, 18, 22, 4);
      gfx.fillCircle(16, 12, 9);
      gfx.lineStyle(2, 0xff6600);
      gfx.lineBetween(10, 22, 15, 30);
      gfx.lineBetween(15, 30, 12, 38);
      gfx.lineBetween(22, 21, 18, 33);
      gfx.lineBetween(5, 26, 8, 32);
      gfx.lineBetween(26, 26, 24, 32);
      // Fire on the head
      gfx.fillStyle(0xff6600);
      gfx.fillTriangle(9, 7, 14, 5, 10, 0);
      gfx.fillTriangle(13, 5, 19, 5, 16, 0);
      gfx.fillTriangle(18, 5, 23, 7, 22, 0);
      // Glowing eyes and mouth
      gfx.fillStyle(0xffee33);
      gfx.fillRect(11, 10, 4, 3);
      gfx.fillRect(17, 10, 4, 3);
      gfx.fillRect(12, 16, 8, 2);
    },
  },
  {
    id: 'cactus', name: 'Cactus', rarity: 'epico',
    draw(gfx) {
      // Flower pot
      gfx.fillStyle(0xcc6633);
      gfx.fillRect(8, 38, 16, 10);
      gfx.fillRect(6, 36, 20, 3);
      // Green body with two arms
      gfx.fillStyle(0x33aa44);
      gfx.fillRoundedRect(10, 4, 12, 34, 6);
      gfx.fillRoundedRect(2, 16, 5, 12, 2);
      gfx.fillRect(2, 24, 10, 4);
      gfx.fillRoundedRect(25, 12, 5, 12, 2);
      gfx.fillRect(20, 20, 10, 4);
      // Little spines
      gfx.fillStyle(0xffffcc);
      [[12, 22], [20, 26], [12, 32], [20, 12], [4, 18], [28, 14]].forEach(([x, y]) => {
        gfx.fillRect(x, y, 1, 1);
      });
      // A pink flower on top and a happy face
      gfx.fillStyle(0xff66aa);
      gfx.fillCircle(16, 4, 3);
      gfx.fillStyle(0xffee33);
      gfx.fillCircle(16, 4, 1.2);
      face(gfx, 0x000000, 14);
    },
  },
  {
    id: 'hamburguesa', name: 'Hamburguesa', rarity: 'epico',
    draw(gfx) {
      // Legs
      gfx.fillStyle(0x222222);
      gfx.fillRect(11, 40, 3, 8);
      gfx.fillRect(18, 40, 3, 8);
      // Bottom bun, meat, cheese, lettuce, tomato, top bun
      gfx.fillStyle(0xdd9944);
      gfx.fillRoundedRect(3, 34, 26, 7, 3);
      gfx.fillStyle(0x6b3a1e);
      gfx.fillRoundedRect(2, 28, 28, 6, 3);
      gfx.fillStyle(0xffcc00);
      gfx.fillTriangle(3, 27, 29, 27, 22, 32);
      gfx.fillStyle(0x44cc44);
      gfx.fillRect(2, 25, 28, 3);
      gfx.fillStyle(0xee3333);
      gfx.fillRect(4, 23, 24, 2);
      gfx.fillStyle(0xdd9944);
      gfx.fillEllipse(16, 15, 28, 18);
      gfx.fillRect(2, 15, 28, 8);
      // Sesame seeds and a face on the bun
      gfx.fillStyle(0xffffee);
      gfx.fillEllipse(9, 9, 2, 1.2);
      gfx.fillEllipse(16, 7, 2, 1.2);
      gfx.fillEllipse(23, 9, 2, 1.2);
      bigEyes(gfx, 14, 12, 20, 2.3);
      gfx.fillStyle(0x000000);
      gfx.fillRect(13, 19, 6, 1.2);
    },
  },
  {
    id: 'helado', name: 'Helado', rarity: 'epico',
    draw(gfx) {
      // The crunchy cone with a crossed pattern
      gfx.fillStyle(0xe0a050);
      gfx.fillTriangle(6, 24, 26, 24, 16, 48);
      gfx.lineStyle(1, 0xb07830);
      gfx.lineBetween(9, 26, 18, 44);
      gfx.lineBetween(15, 25, 22, 36);
      gfx.lineBetween(23, 26, 14, 44);
      gfx.lineBetween(17, 25, 10, 36);
      // Three scoops: strawberry, mint and chocolate
      gfx.fillStyle(0xff99bb);
      gfx.fillCircle(16, 21, 10);
      gfx.fillStyle(0x99eebb);
      gfx.fillCircle(16, 12, 8);
      gfx.fillStyle(0x7a4a24);
      gfx.fillCircle(16, 5, 5);
      // A cherry on top and rainbow sprinkles
      gfx.fillStyle(0xdd0000);
      gfx.fillCircle(19, 1.5, 1.5);
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillRect(9 + i * 2.5, 13 + (i % 2) * 3, 1.5, 1);
      });
      bigEyes(gfx, 20, 12, 20, 2.3);
    },
  },
  {
    id: 'pizza', name: 'Pizza', rarity: 'epico',
    draw(gfx) {
      // Legs and arms
      gfx.fillStyle(0x222222);
      gfx.fillRect(13, 38, 2, 10);
      gfx.fillRect(17, 38, 2, 10);
      gfx.fillRect(3, 20, 6, 2);
      gfx.fillRect(23, 20, 6, 2);
      // A slice of pizza, point down: crust on top, cheese, pepperoni
      gfx.fillStyle(0xffcc33);
      gfx.fillTriangle(3, 8, 29, 8, 16, 42);
      gfx.fillStyle(0xcc8833);
      gfx.fillRoundedRect(2, 3, 28, 7, 3);
      gfx.fillStyle(0xcc2222);
      gfx.fillCircle(10, 15, 2.5);
      gfx.fillCircle(21, 14, 2.5);
      gfx.fillCircle(16, 28, 2.2);
      bigEyes(gfx, 19, 13, 19, 2.2);
      gfx.fillStyle(0x000000);
      gfx.fillRect(14, 23, 4, 1.2);
    },
  },
  {
    id: 'dona', name: 'Dona', rarity: 'epico',
    draw(gfx) {
      // Legs
      gfx.fillStyle(0x222222);
      gfx.fillRect(11, 38, 3, 10);
      gfx.fillRect(18, 38, 3, 10);
      // The donut: dough, pink icing and a hole in the middle
      gfx.fillStyle(0xdd9944);
      gfx.fillCircle(16, 22, 15);
      gfx.fillStyle(0xff77bb);
      gfx.fillCircle(16, 21, 13);
      // Rainbow sprinkles
      RAINBOW.forEach((color, i) => {
        const angle = (i / RAINBOW.length) * Math.PI * 2;
        gfx.fillStyle(color);
        gfx.fillRect(16 + Math.cos(angle) * 9, 21 + Math.sin(angle) * 9, 2, 1);
      });
      gfx.fillStyle(0x000000);
      gfx.fillCircle(16, 25, 3);
      bigEyes(gfx, 15, 12, 20, 2.3);
    },
  },

  // =============================================================
  // LEGENDARIOS
  // =============================================================
  {
    id: 'dragon', name: 'Dragón de hielo', rarity: 'legendario', canShoot: true, gunAt: [12, -12],
    draw(gfx) {
      // Big wings behind
      gfx.fillStyle(0x88ccff);
      gfx.fillTriangle(8, 20, 0, 6, 2, 30);
      gfx.fillTriangle(24, 20, 32, 6, 30, 30);
      // Tail
      gfx.fillStyle(0x3388dd);
      gfx.fillTriangle(20, 38, 32, 46, 22, 44);
      animal(gfx, { color: 0x3388dd, belly: 0xbbeeff, ears: 'none', snout: false });
      // Ice spikes on the head and back
      gfx.fillStyle(0xffffff);
      gfx.fillTriangle(10, 8, 13, 7, 10, 1);
      gfx.fillTriangle(19, 7, 22, 8, 22, 1);
      gfx.fillTriangle(14, 6, 18, 6, 16, 2);
      // A long snout with an icy breath
      gfx.fillStyle(0x3388dd);
      gfx.fillEllipse(22, 17, 10, 6);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(25, 16, 0.8);
      gfx.fillStyle(0xffee33);
      gfx.fillCircle(17, 12, 1.6);
      gfx.fillStyle(0xddf6ff);
      gfx.fillCircle(29, 19, 1.5);
      gfx.fillCircle(31, 16, 1);
    },
  },
  {
    id: 'angel', name: 'Ángel del color', rarity: 'legendario',
    draw(gfx) {
      // Rainbow wings
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillEllipse(6, 18 + i * 3, 10 - i, 4);
        gfx.fillEllipse(26, 18 + i * 3, 10 - i, 4);
      });
      person(gfx, { shirt: 0xffffff, pants: 0xffffff, shoes: 0xffcc00 });
      // Long white robe with a gold belt
      gfx.fillStyle(0xffffff);
      gfx.fillRect(8, 30, 16, 16);
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(9, 30, 14, 1.5);
      // Golden curls and a halo
      gfx.fillStyle(0xf5d76e);
      gfx.fillCircle(10, 7, 3);
      gfx.fillCircle(16, 5.5, 3);
      gfx.fillCircle(22, 7, 3);
      gfx.lineStyle(1.5, 0xffdd00);
      gfx.strokeEllipse(16, 1.5, 12, 3);
    },
  },
  {
    id: 'reina', name: 'Reina del Color', rarity: 'legendario',
    draw(gfx) {
      cape(gfx, 0xdd2266);
      person(gfx, { skin: SKIN_MID, shirt: 0xffffff, pants: 0xffffff, shoes: 0xffcc00 });
      // A big rainbow dress
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillRect(9 - i * 0.6, 22 + i * 4, 14 + i * 1.2, 4);
      });
      // Long dark hair and a crown with a big jewel
      gfx.fillStyle(0x2a1a0a);
      gfx.fillRect(9, 5, 14, 4);
      gfx.fillRect(7, 7, 3, 15);
      gfx.fillRect(22, 7, 3, 15);
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(11, 2, 10, 3);
      gfx.fillTriangle(11, 2, 13, 2, 11, 0);
      gfx.fillTriangle(15, 2, 17, 2, 16, 0);
      gfx.fillTriangle(19, 2, 21, 2, 21, 0);
      gfx.fillStyle(0x33ddff);
      gfx.fillCircle(16, 3.5, 1.2);
    },
  },
  {
    id: 'mecha', name: 'Mecha dorado', rarity: 'legendario', canShoot: true, gunAt: [14, -2],
    draw(gfx) {
      const gold = 0xffcc33;
      const dark = 0x886611;
      // Big robot legs and feet
      gfx.fillStyle(dark);
      gfx.fillRect(8, 36, 6, 10);
      gfx.fillRect(18, 36, 6, 10);
      gfx.fillStyle(gold);
      gfx.fillRect(6, 44, 9, 4);
      gfx.fillRect(17, 44, 9, 4);
      // Wide chest with a rainbow power core
      gfx.fillRoundedRect(4, 18, 24, 19, 3);
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillRect(11 + i * 1.7, 24, 1.7, 7);
      });
      // Shoulder cannons
      gfx.fillStyle(dark);
      gfx.fillRect(0, 18, 5, 8);
      gfx.fillRect(27, 18, 5, 8);
      gfx.fillStyle(0x333333);
      gfx.fillRect(28, 20, 4, 4);
      // Head with a visor and an antenna
      gfx.fillStyle(gold);
      gfx.fillRoundedRect(9, 5, 14, 12, 2);
      gfx.fillStyle(0x33ddff);
      gfx.fillRect(11, 9, 10, 3);
      gfx.fillStyle(dark);
      gfx.fillRect(15, 1, 2, 4);
      gfx.fillStyle(0xff3333);
      gfx.fillCircle(16, 1.5, 1.5);
    },
  },
  {
    id: 'galactico', name: 'Héroe galáctico', rarity: 'legendario', canShoot: true, gunAt: [14, 0],
    draw(gfx) {
      cape(gfx, 0x6622cc);
      const space = 0x1a1a55;
      person(gfx, { shirt: space, pants: space, shoes: 0xffcc00, hands: 0xffcc00, face: false });
      // Little stars and a planet on the suit
      gfx.fillStyle(0xffffff);
      [[11, 24], [20, 23], [13, 33], [21, 35], [12, 42], [19, 41]].forEach(([x, y]) => {
        gfx.fillCircle(x, y, 0.8);
      });
      gfx.fillStyle(0xff8844);
      gfx.fillCircle(16, 29, 2.5);
      gfx.lineStyle(1, 0xffdd88);
      gfx.strokeEllipse(16, 29, 9, 2.5);
      // A shiny space helmet with the face inside
      gfx.fillStyle(0x88ccff, 0.6);
      gfx.fillCircle(16, 13, 8.5);
      gfx.fillStyle(SKIN_COLOR);
      gfx.fillCircle(16, 14, 5.5);
      face(gfx, 0x000000, 14);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(11, 9, 1.5);
    },
  },
];
