// HalloweenSkins.js — The 5 skins of the HALLOWEEN EVENT 🎃 (see src/data/halloween.js).
// They NEVER come out of the pencils:
//   shop: true = sold in the TIENDA, only during the event
//   the Rey Calabaza is the big prize for picking up 31 pumpkins
// Like the pencil skins, each one is 32 x 48 pixels and draws itself with draw(gfx).

import { person, cape } from './SkinParts.js';

const BLACK = 0x111111;
const WHITE = 0xf4f4f4;
const ORANGE = 0xff7a00;
const DARK_ORANGE = 0xc85a00;
const GREEN = 0x3a9a2a;

export const HALLOWEEN_SKINS = [
  {
    id: 'hwEsqueleto', name: 'Esqueleto', rarity: 'raro', shop: true,
    draw(gfx) {
      // A black suit, and the white bones painted on top
      person(gfx, { skin: WHITE, shirt: BLACK, pants: BLACK, shoes: BLACK, hands: WHITE, face: false });
      gfx.fillStyle(WHITE);
      // The backbone down the middle, and the ribs on each side
      gfx.fillRect(15, 21, 2, 16);
      [23, 26.5, 30].forEach((y) => {
        gfx.fillRect(10, y, 4, 1.5);
        gfx.fillRect(18, y, 4, 1.5);
      });
      // The hip bone, and the bones of the arms and legs
      gfx.fillRect(11, 35, 10, 2);
      gfx.fillRect(6.5, 22, 1, 11);
      gfx.fillRect(24.5, 22, 1, 11);
      gfx.fillRect(12.5, 38, 1, 7);
      gfx.fillRect(18.5, 38, 1, 7);
      // The skull face: two big black eyes, a little nose and teeth
      gfx.fillStyle(BLACK);
      gfx.fillCircle(13, 12, 2.2);
      gfx.fillCircle(19, 12, 2.2);
      gfx.fillTriangle(15, 16, 17, 16, 16, 14.5);
      gfx.fillRect(12, 18, 8, 1);
      [13, 15, 17, 19].forEach((x) => gfx.fillRect(x, 17.5, 0.6, 2));
    },
  },
  {
    id: 'hwLobo', name: 'Hombre Lobo', rarity: 'raro', shop: true,
    draw(gfx) {
      const fur = 0x6b5a4a;
      const light = 0x9c8a74;
      // A torn shirt and torn pants, like he just turned into a wolf
      person(gfx, { skin: fur, shirt: 0x8a2020, pants: 0x3a4a6a, shoes: fur, face: false });
      // Torn edges: fur shows through the shirt and pants
      gfx.fillStyle(fur);
      gfx.fillTriangle(9, 38, 13, 38, 11, 33);
      gfx.fillTriangle(17, 38, 23, 38, 20, 32);
      gfx.fillTriangle(11, 46, 15, 46, 13, 42);
      gfx.fillTriangle(17, 46, 21, 46, 19, 42);
      // Pointy wolf ears
      gfx.fillTriangle(8, 10, 12, 6, 9, 0);
      gfx.fillTriangle(24, 10, 20, 6, 23, 0);
      // Furry cheeks and a long snout
      gfx.fillTriangle(8, 13, 10, 18, 5, 18);
      gfx.fillTriangle(24, 13, 22, 18, 27, 18);
      gfx.fillStyle(light);
      gfx.fillEllipse(16, 17, 9, 6);
      gfx.fillStyle(BLACK);
      gfx.fillCircle(16, 15, 1.5); // nose
      // Yellow eyes and sharp white teeth
      gfx.fillStyle(0xffdd00);
      gfx.fillCircle(12.5, 11.5, 1.4);
      gfx.fillCircle(19.5, 11.5, 1.4);
      gfx.fillStyle(WHITE);
      gfx.fillTriangle(13, 19, 15, 19, 14, 21.5);
      gfx.fillTriangle(17, 19, 19, 19, 18, 21.5);
    },
  },
  {
    id: 'hwFrankie', name: 'Frankenstein', rarity: 'epico', shop: true,
    draw(gfx) {
      const skin = 0x8cc46a;
      // Arms forward, like he walks in the movies
      person(gfx, { skin, shirt: 0x333344, pants: 0x222222, shoes: BLACK, arms: 'forward', face: false });
      // The square head (on top of the round one)
      gfx.fillStyle(skin);
      gfx.fillRect(9, 6, 14, 14);
      // Flat black hair with a fringe
      gfx.fillStyle(BLACK);
      gfx.fillRect(9, 5, 14, 4);
      [10, 13, 16, 19].forEach((x) => gfx.fillTriangle(x, 9, x + 3, 9, x + 1.5, 11));
      // The bolts in the neck
      gfx.fillStyle(0xaaaaaa);
      gfx.fillRect(5, 17, 4, 2.5);
      gfx.fillRect(23, 17, 4, 2.5);
      // Sleepy eyes, a stitched scar and a straight mouth
      gfx.fillStyle(BLACK);
      gfx.fillRect(11.5, 12, 3, 1.5);
      gfx.fillRect(17.5, 12, 3, 1.5);
      gfx.fillRect(13, 17, 6, 1);
      gfx.fillRect(18, 7.5, 1, 3);
      gfx.fillRect(17, 8.5, 3, 0.6);
      gfx.fillRect(17, 9.7, 3, 0.6);
    },
  },
  {
    id: 'hwCatrina', name: 'Catrina', rarity: 'epico', shop: true,
    draw(gfx) {
      // A long purple dress with a yellow line, like the Catrinas of the Día de Muertos
      person(gfx, { skin: WHITE, shirt: 0x7a2aa8, pants: 0x7a2aa8, shoes: BLACK, face: false });
      gfx.fillStyle(0x7a2aa8);
      gfx.fillTriangle(16, 28, 4, 46, 28, 46);
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(6, 43, 20, 1.5);
      // A big black hat with flowers
      gfx.fillStyle(BLACK);
      gfx.fillEllipse(16, 7, 28, 5);
      gfx.fillRoundedRect(10, 1, 12, 6, 2);
      gfx.fillStyle(0xff3366);
      gfx.fillCircle(11, 4, 2);
      gfx.fillStyle(ORANGE);
      gfx.fillCircle(15, 3, 2);
      gfx.fillStyle(0xffdd00);
      gfx.fillCircle(20, 4, 1.6);
      // The painted skull face: dark eyes with flowers around, a little nose and stitched mouth
      gfx.fillStyle(BLACK);
      gfx.fillCircle(13, 13, 2);
      gfx.fillCircle(19, 13, 2);
      gfx.fillStyle(0xff3366);
      [[13, 13], [19, 13]].forEach(([x, y]) => {
        gfx.fillCircle(x - 2.8, y, 0.7);
        gfx.fillCircle(x + 2.8, y, 0.7);
        gfx.fillCircle(x, y - 2.8, 0.7);
      });
      gfx.fillStyle(BLACK);
      gfx.fillTriangle(15, 17, 17, 17, 16, 15.5);
      gfx.fillRect(13, 18.5, 6, 0.8);
      [14, 16, 18].forEach((x) => gfx.fillRect(x, 17.8, 0.6, 2.2));
    },
  },
  {
    // The big prize: 31 pumpkins! He throws seeds, so he shoots from the start
    id: 'hwReyCalabaza', name: 'Rey Calabaza', rarity: 'legendario', canShoot: true, gunAt: [14, -14],
    draw(gfx) {
      // A purple king cape (behind the body)
      cape(gfx, 0x5a1a7a);
      person(gfx, { shirt: 0x2a2a2a, pants: 0x2a2a2a, shoes: BLACK, hands: GREEN, face: false });
      // A pumpkin for a head: wider than a normal head, with lines
      gfx.fillStyle(ORANGE);
      gfx.fillEllipse(16, 14, 22, 15);
      gfx.fillStyle(DARK_ORANGE);
      gfx.fillRect(11, 7, 1.2, 14);
      gfx.fillRect(20, 7, 1.2, 14);
      // The face is cut out of the pumpkin, with a light inside
      gfx.fillStyle(0xffee55);
      gfx.fillTriangle(9, 15, 14, 15, 11.5, 11);
      gfx.fillTriangle(18, 15, 23, 15, 20.5, 11);
      gfx.fillTriangle(15, 17, 17, 17, 16, 15.5);
      gfx.fillRect(10, 18, 12, 2.5);
      gfx.fillStyle(ORANGE);
      gfx.fillRect(12.5, 18, 1.5, 1.2);
      gfx.fillRect(18, 19.3, 1.5, 1.2);
      // A golden crown on top (the stem of the pumpkin sticks out of it)
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(10, 4, 12, 3);
      gfx.fillTriangle(10, 4, 13, 4, 11.5, 0);
      gfx.fillTriangle(14.5, 4, 17.5, 4, 16, 0);
      gfx.fillTriangle(19, 4, 22, 4, 20.5, 0);
      gfx.fillStyle(0xff3366);
      gfx.fillCircle(16, 5.5, 1);
      // A gold buckle on the shirt
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(14, 33, 4, 3);
    },
  },
];
