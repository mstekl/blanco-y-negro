// PassSkins.js — The 7 skins of the "PASE BLANCO Y NEGRO".
// They NEVER come out of the pencils: you only get them with the pass.
// They are all about our story: a black and white world that is getting
// its colors back (so they are black and white, with a little bit of rainbow).
// Like the pencil skins, each one is 32 x 48 pixels and draws itself with draw(gfx).

import { RAINBOW, SKIN_COLOR, person, face, cape, animal } from './SkinParts.js';

const BLACK = 0x111111;
const WHITE = 0xf4f4f4;
const GOLD = 0xffcc00;

export const PASS_SKINS = [
  // =============================================================
  // RAROS
  // =============================================================
  {
    id: 'paseExplorador', name: 'Explorador Blanco y Negro', rarity: 'raro',
    draw(gfx) {
      // A big backpack behind him (drawn first so it stays behind the body)
      gfx.fillStyle(0x555555);
      gfx.fillRoundedRect(2, 20, 9, 16, 2);
      gfx.fillStyle(0x888888);
      gfx.fillRect(3, 28, 7, 2);
      // A rolled-up sleeping bag on top of the backpack, in rainbow colors
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillRect(2 + i * 1.5, 17, 1.5, 4);
      });

      // The explorer: black shirt, white pants...
      person(gfx, { shirt: BLACK, pants: WHITE, shoes: 0x555555 });
      // ...but the RIGHT half is the other way around: half black, half white!
      gfx.fillStyle(WHITE);
      gfx.fillRect(16, 21, 7, 17);
      gfx.fillRect(23, 22, 4, 11);
      gfx.fillStyle(BLACK);
      gfx.fillRect(17, 37, 4, 9);
      // The backpack straps go over the shoulders
      gfx.fillStyle(0x777777);
      gfx.fillRect(10, 21, 2, 12);
      gfx.fillRect(20, 21, 2, 12);

      // A safari hat, also half black and half white, with a rainbow band
      gfx.fillStyle(BLACK);
      gfx.fillRect(5, 7, 11, 2);
      gfx.fillRoundedRect(9, 2, 7, 6, { tl: 3, tr: 0, bl: 0, br: 0 });
      gfx.fillStyle(WHITE);
      gfx.fillRect(16, 7, 11, 2);
      gfx.fillRoundedRect(16, 2, 7, 6, { tl: 0, tr: 3, bl: 0, br: 0 });
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillRect(9 + i * (14 / 6), 5.5, 14 / 6, 1.5);
      });
      // A magnifying glass in his hand, to find the lost colors
      gfx.lineStyle(1.5, 0x888888);
      gfx.strokeCircle(28, 30, 2.5);
      gfx.fillStyle(0x88ddff, 0.7);
      gfx.fillCircle(28, 30, 2);
    },
  },
  {
    id: 'paseCebra', name: 'Cebra Ninja', rarity: 'raro',
    draw(gfx) {
      // Two pointy zebra ears (behind the head)
      gfx.fillStyle(WHITE);
      gfx.fillTriangle(9, 9, 13, 7, 9, 1);
      gfx.fillTriangle(23, 9, 19, 7, 23, 1);
      gfx.fillStyle(BLACK);
      gfx.fillTriangle(9.8, 6, 11.5, 6, 9.8, 3);
      gfx.fillTriangle(22.2, 6, 20.5, 6, 22.2, 3);

      // A white ninja suit (we paint the zebra stripes on top)
      person(gfx, { skin: WHITE, shirt: WHITE, pants: WHITE, shoes: BLACK, hands: BLACK, face: false });
      // Black zebra stripes on the body, arms and legs
      gfx.fillStyle(BLACK);
      [23, 28, 33].forEach((y) => {
        gfx.fillTriangle(9, y, 15, y + 1, 9, y + 2.5);
        gfx.fillTriangle(23, y, 17, y + 1, 23, y + 2.5);
        gfx.fillRect(5, y, 4, 1.5);
        gfx.fillRect(23, y, 4, 1.5);
      });
      [39, 42].forEach((y) => {
        gfx.fillRect(11, y, 4, 1.5);
        gfx.fillRect(17, y, 4, 1.5);
      });
      // Stripes on the head, and a black mane on top
      gfx.fillRect(10, 8, 12, 1.5);
      gfx.fillRect(9.5, 17, 13, 1.5);
      gfx.fillRect(13, 3, 6, 4);

      // The ninja mask: a black band over the eyes, with sharp white eyes
      gfx.fillRect(9, 11, 14, 4);
      gfx.fillStyle(WHITE);
      gfx.fillRect(11, 12, 3.5, 1.5);
      gfx.fillRect(17.5, 12, 3.5, 1.5);
      // A rainbow belt, and a red headband with tails that fly in the wind
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillRect(9 + i * (14 / 6), 35, 14 / 6, 2);
      });
      gfx.fillStyle(0xff2222);
      gfx.fillRect(22, 11, 2, 2);
      gfx.fillTriangle(23, 11, 31, 8, 30, 12);
      gfx.fillTriangle(23, 12, 30, 14, 28, 17);
    },
  },

  // =============================================================
  // ÉPICOS
  // =============================================================
  {
    id: 'paseCaballero', name: 'Caballero Ajedrez', rarity: 'epico',
    draw(gfx) {
      const steel = 0xc8ccd4;
      const darkSteel = 0x6a6e78;
      // A sword in the right hand (behind the arm)
      gfx.fillStyle(0xe8eef8);
      gfx.fillRect(25, 14, 2, 18);
      gfx.fillTriangle(25, 14, 27, 14, 26, 11);
      gfx.fillStyle(GOLD);
      gfx.fillRect(22.5, 31, 7, 2);

      // Shiny armor from head to toe
      person(gfx, { skin: steel, shirt: steel, pants: darkSteel, shoes: darkSteel, hands: darkSteel, face: false });
      gfx.fillStyle(darkSteel);
      gfx.fillRect(9, 29, 14, 2); // the belt
      gfx.fillRect(5, 22, 4, 2); // shoulder pads
      gfx.fillRect(23, 22, 4, 2);

      // Helmet with a dark slit to look through
      gfx.fillStyle(BLACK);
      gfx.fillRect(10, 12, 12, 2);
      gfx.fillRect(15, 14, 2, 5);
      // On top of the helmet: a black HORSE HEAD, like the knight of chess!
      gfx.fillStyle(BLACK);
      gfx.fillRect(13, 2, 6, 5);
      gfx.fillTriangle(13, 2, 19, 2, 21, 5);
      gfx.fillTriangle(14, 2, 16, 2, 14, -1);
      gfx.fillStyle(WHITE);
      gfx.fillCircle(16.5, 3, 0.8);

      // A checkerboard shield (like a chess board), with a rainbow border
      gfx.fillStyle(0xff0000);
      gfx.fillRoundedRect(0, 22, 13, 16, 3);
      gfx.fillStyle(0x0088ff);
      gfx.fillRoundedRect(0.5, 22.5, 12, 15, 3);
      const size = 2.75;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          gfx.fillStyle((row + col) % 2 === 0 ? BLACK : WHITE);
          gfx.fillRect(1 + col * size, 23 + row * size, size, size);
        }
      }
    },
  },
  {
    id: 'pasePanda', name: 'Panda Pintor', rarity: 'epico',
    draw(gfx) {
      // A panda: black arms, legs and ears, white body and head
      animal(gfx, { color: BLACK, belly: WHITE, ears: 'round', earColor: 0x444444, snout: false });
      gfx.fillStyle(WHITE);
      gfx.fillEllipse(16, 33, 14, 17);
      gfx.fillCircle(16, 15, 9);
      // The black patches around the eyes, with shiny eyes inside
      gfx.fillStyle(BLACK);
      gfx.fillEllipse(12, 14, 5, 6);
      gfx.fillEllipse(20, 14, 5, 6);
      gfx.fillStyle(WHITE);
      gfx.fillCircle(12.5, 13.5, 1.2);
      gfx.fillCircle(20.5, 13.5, 1.2);
      // Nose and smile
      gfx.fillStyle(BLACK);
      gfx.fillEllipse(16, 18.5, 3, 2);
      gfx.fillRect(15, 21, 2, 1);

      // A red painter's beret
      gfx.fillStyle(0xdd2233);
      gfx.fillEllipse(14, 6, 15, 5);
      gfx.fillRect(13.5, 2, 1.5, 2);

      // Colored paint splashes on his white tummy
      gfx.fillStyle(0x0088ff);
      gfx.fillCircle(12, 30, 1.6);
      gfx.fillStyle(0xffee00);
      gfx.fillCircle(19, 35, 1.6);
      gfx.fillStyle(0x00cc00);
      gfx.fillCircle(14, 38, 1.2);

      // The magic paintbrush in his hand: wooden stick and a rainbow tip
      gfx.fillStyle(0xaa7744);
      gfx.fillRect(25, 16, 2, 20);
      gfx.fillStyle(0xaaaaaa);
      gfx.fillRect(24.5, 14, 3, 3);
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillRect(24.5 + (i % 3), 8 + Math.floor(i / 3) * 3, 1, 6 - Math.floor(i / 3) * 3);
      });
      gfx.fillStyle(0xff0000);
      gfx.fillTriangle(24.5, 8, 27.5, 8, 26, 5);
    },
  },
  {
    id: 'paseDomino', name: 'Dominó Veloz', rarity: 'epico',
    draw(gfx) {
      // Speed lines behind him: he runs SO fast!
      gfx.fillStyle(0xbbbbbb);
      gfx.fillRect(0, 24, 5, 1);
      gfx.fillRect(0, 30, 4, 1);
      gfx.fillRect(1, 36, 4, 1);
      // A red superhero cape
      cape(gfx, 0xdd2233);

      person(gfx, { shirt: BLACK, pants: BLACK, shoes: GOLD, hands: WHITE, face: false });
      // His body IS a domino tile: black, with a white line and white dots
      gfx.fillStyle(BLACK);
      gfx.fillRoundedRect(7, 19, 18, 26, 3);
      gfx.lineStyle(1, WHITE);
      gfx.strokeRoundedRect(7.5, 19.5, 17, 25, 3);
      gfx.fillStyle(WHITE);
      gfx.fillRect(9, 31.5, 14, 1);
      // Top half: 3 dots. Bottom half: 5 dots.
      [[11, 23], [16, 26], [21, 29]].forEach(([x, y]) => gfx.fillCircle(x, y, 1.4));
      [[11, 35], [21, 35], [16, 38], [11, 41], [21, 41]].forEach(([x, y]) => gfx.fillCircle(x, y, 1.4));
      // Lightning boots: gold with a little bolt
      gfx.fillStyle(GOLD);
      gfx.fillRect(10, 44, 6, 4);
      gfx.fillRect(16, 44, 6, 4);

      // The face, with a white "domino mask" (that's what superhero masks are called!)
      face(gfx);
      gfx.fillStyle(WHITE);
      gfx.fillRoundedRect(9.5, 10.5, 13, 5, 2);
      gfx.fillStyle(BLACK);
      gfx.fillCircle(13, 13, 1.3);
      gfx.fillCircle(19, 13, 1.3);
      // Black hair blowing back in the wind
      gfx.fillStyle(BLACK);
      gfx.fillEllipse(16, 7, 14, 6);
      gfx.fillTriangle(11, 4, 11, 9, 3, 4);
      gfx.fillTriangle(13, 4, 13, 8, 6, 1);
    },
  },

  // =============================================================
  // LEGENDARIOS
  // =============================================================
  {
    id: 'paseFantasma', name: 'Fantasma de Tinta', rarity: 'legendario',
    draw(gfx) {
      // Rainbow drops of ink dripping down from the ghost
      RAINBOW.forEach((color, i) => {
        const x = 6 + i * 4;
        const length = [6, 9, 5, 8, 6, 9][i];
        gfx.fillStyle(color);
        gfx.fillRect(x - 0.75, 38, 1.5, length);
        gfx.fillCircle(x, 38 + length, 1.6);
      });
      // The ghost: a round black head and a body with a wavy bottom
      gfx.fillStyle(BLACK);
      gfx.fillCircle(16, 14, 12);
      gfx.fillRect(4, 14, 24, 24);
      [7, 13, 19, 25].forEach((x) => gfx.fillCircle(x, 38, 3));
      // Little arms waving "boo!"
      gfx.fillTriangle(4, 20, 4, 28, -1, 23);
      gfx.fillTriangle(28, 20, 28, 28, 33, 17);
      // A thin white outline glow, so the ink ghost shows on dark places
      gfx.lineStyle(1, 0x666666);
      gfx.strokeCircle(16, 14, 12);
      // Big white eyes and an open "O" mouth
      gfx.fillStyle(WHITE);
      gfx.fillEllipse(11.5, 14, 6, 8);
      gfx.fillEllipse(20.5, 14, 6, 8);
      gfx.fillEllipse(16, 24, 5, 6);
      gfx.fillStyle(BLACK);
      gfx.fillCircle(12.5, 15, 1.7);
      gfx.fillCircle(21.5, 15, 1.7);
      gfx.fillEllipse(16, 24.5, 3, 4);
      // Rainbow colors leaking out of the ink (the colors are coming back!)
      gfx.fillStyle(0xff8800);
      gfx.fillCircle(8, 31, 1.5);
      gfx.fillStyle(0x00cc00);
      gfx.fillCircle(23, 30, 1.2);
      gfx.fillStyle(0x8800ff);
      gfx.fillCircle(17, 33, 1.3);
    },
  },
  {
    id: 'paseRey', name: 'Rey Blanco y Negro', rarity: 'legendario', canShoot: true, gunAt: [12, -12],
    draw(gfx) {
      // A royal cape: black on the left, white on the right
      cape(gfx, BLACK);
      gfx.fillStyle(WHITE);
      gfx.fillTriangle(16, 20, 23, 20, 29, 46);
      gfx.fillRect(16, 20, 7, 26);

      // The king wears a long robe, also half black and half white
      person(gfx, { shirt: WHITE, pants: WHITE, shoes: GOLD, sleeves: WHITE });
      gfx.fillStyle(BLACK);
      gfx.fillRect(9, 21, 7, 17);
      gfx.fillRect(5, 22, 4, 11);
      gfx.fillRect(11, 37, 4, 9);
      gfx.fillStyle(GOLD);
      gfx.fillRect(10, 45, 6, 3);
      // A gold belt with a rainbow jewel
      gfx.fillRect(9, 31, 14, 2);
      gfx.fillStyle(0xff0000);
      gfx.fillCircle(16, 32, 1.4);
      // Fluffy white collar with black dots (like a real king!)
      gfx.fillStyle(WHITE);
      gfx.fillRoundedRect(8, 19, 16, 4, 2);
      gfx.fillStyle(BLACK);
      [11, 16, 21].forEach((x) => gfx.fillCircle(x, 21, 0.8));

      // A big white beard
      gfx.fillStyle(0xdddddd);
      gfx.fillTriangle(10, 15, 22, 15, 16, 24);
      gfx.fillStyle(SKIN_COLOR);
      gfx.fillRect(13, 15, 6, 1.5);
      gfx.fillStyle(BLACK);
      gfx.fillRect(14, 17, 4, 1);

      // A golden crown with a jewel of each rainbow color
      gfx.fillStyle(GOLD);
      gfx.fillRect(9, 4, 14, 4);
      gfx.fillTriangle(9, 4, 12, 4, 9, -1);
      gfx.fillTriangle(14, 4, 18, 4, 16, -1);
      gfx.fillTriangle(20, 4, 23, 4, 23, -1);
      [0xff0000, 0x00cc00, 0x0088ff].forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillCircle(11.5 + i * 4.5, 6, 1);
      });

      // The scepter: a gold stick with a rainbow ball that shoots color!
      gfx.fillStyle(GOLD);
      gfx.fillRect(27, 12, 2, 24);
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillCircle(28, 10, 4 - i * 0.6);
      });
      gfx.fillStyle(WHITE);
      gfx.fillCircle(27, 8.5, 0.8);
    },
  },
];
