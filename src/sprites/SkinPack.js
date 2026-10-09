// SkinPack.js — 30 more skins for the hero! They come out of the pencils (LÁPICES).
// Every skin is a little drawing of 32 x 48 pixels, made with simple shapes.
// Many of them are people, drawn with the "person mold" of SkinParts.js:
// every skin only draws the things that make it special on top (a helmet, a hat...).
//
// To add a new skin: add one more object to SKIN_PACK (or to SKIN_PACK_2 in
// SkinPack2.js). It shows up by itself in the skins screen, in the pencils and in the "T" code!
//   id:       a short name (no spaces, different from all the other skins)
//   name:     the name the player sees
//   rarity:   'comun', 'raro', 'epico' or 'legendario' (see src/data/coins.js)
//   canShoot: true = it shoots from the start     gunAt: where the shots come out
//   draw:     draws the skin

import { RAINBOW, SKIN_COLOR, person, face, cape, bigEyes } from './SkinParts.js';

export const SKIN_PACK = [
  // =============================================================
  // COMUNES (they come out a lot)
  // =============================================================
  {
    id: 'bombero', name: 'Bombero', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0xcc2222, pants: 0x222244 });
      // Shiny yellow stripes on the jacket
      gfx.fillStyle(0xffdd33);
      gfx.fillRect(9, 30, 14, 2);
      gfx.fillRect(5, 30, 4, 2);
      gfx.fillRect(23, 30, 4, 2);
      // Red helmet with a long back and a gold badge
      gfx.fillStyle(0xcc2222);
      gfx.fillRect(9, 3, 14, 5);
      gfx.fillRect(6, 7, 21, 2);
      gfx.fillStyle(0xffdd33);
      gfx.fillCircle(16, 5, 1.5);
    },
  },
  {
    id: 'chef', name: 'Chef', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0xffffff, pants: 0x444444 });
      // Red scarf and buttons
      gfx.fillStyle(0xcc0000);
      gfx.fillRect(12, 21, 8, 2);
      gfx.fillStyle(0x333333);
      gfx.fillCircle(16, 27, 0.9);
      gfx.fillCircle(16, 32, 0.9);
      // A big curly mustache
      gfx.fillStyle(0x442200);
      gfx.fillRect(12, 15.5, 8, 1.5);
      // The tall puffy chef hat
      gfx.fillStyle(0xffffff);
      gfx.fillRect(10, 3, 12, 5);
      gfx.fillCircle(11, 3, 3);
      gfx.fillCircle(16, 2.5, 3.5);
      gfx.fillCircle(21, 3, 3);
    },
  },
  {
    id: 'futbolista', name: 'Futbolista', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0x2266ff, pants: 0xffffff, shoes: 0x111111 });
      // White stripe on the shirt, and brown hair
      gfx.fillStyle(0xffffff);
      gfx.fillRect(15, 21, 2, 12);
      gfx.fillStyle(0x553311);
      gfx.fillRect(9, 6, 14, 3);
      // The ball at the feet
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(27, 44, 4);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(27, 44, 1.5);
    },
  },
  {
    id: 'doctor', name: 'Doctora', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0xffffff, pants: 0x3366aa });
      // Long hair
      gfx.fillStyle(0x6b3a1e);
      gfx.fillRect(8, 7, 3, 12);
      gfx.fillRect(21, 7, 3, 12);
      gfx.fillRect(9, 5, 14, 3);
      // Stethoscope around the neck
      gfx.lineStyle(1.5, 0x555555);
      gfx.lineBetween(12, 21, 14, 30);
      gfx.lineBetween(20, 21, 18, 30);
      gfx.fillStyle(0x888888);
      gfx.fillCircle(16, 31, 1.8);
      // A red cross on the pocket
      gfx.fillStyle(0xdd0000);
      gfx.fillRect(18, 25, 4, 1.4);
      gfx.fillRect(19.3, 23.7, 1.4, 4);
    },
  },
  {
    id: 'pinguino', name: 'Pingüino', rarity: 'comun',
    draw(gfx) {
      // Black body, white belly, little wings
      gfx.fillStyle(0x1a1a2a);
      gfx.fillEllipse(5, 28, 5, 16);
      gfx.fillEllipse(27, 28, 5, 16);
      gfx.fillEllipse(16, 27, 22, 38);
      gfx.fillStyle(0xffffff);
      gfx.fillEllipse(16, 31, 14, 26);
      bigEyes(gfx, 15, 13, 19, 2.5);
      // Orange beak and feet
      gfx.fillStyle(0xff9900);
      gfx.fillTriangle(14, 19, 18, 19, 16, 23);
      gfx.fillEllipse(12, 46, 7, 3);
      gfx.fillEllipse(20, 46, 7, 3);
    },
  },
  {
    id: 'rana', name: 'Rana', rarity: 'comun',
    draw(gfx) {
      // Back legs, body and a lighter belly
      gfx.fillStyle(0x2e9e2e);
      gfx.fillEllipse(8, 44, 10, 5);
      gfx.fillEllipse(24, 44, 10, 5);
      gfx.fillEllipse(16, 33, 22, 24);
      gfx.fillStyle(0x99dd66);
      gfx.fillEllipse(16, 35, 14, 16);
      // Big wide head with eyes on top
      gfx.fillStyle(0x33aa33);
      gfx.fillEllipse(16, 19, 26, 16);
      gfx.fillCircle(9, 11, 4.5);
      gfx.fillCircle(23, 11, 4.5);
      bigEyes(gfx, 11, 9, 23, 3);
      // A long smile and pink cheeks
      gfx.fillStyle(0x114411);
      gfx.fillRect(9, 21, 14, 1.5);
      gfx.fillStyle(0xff99aa);
      gfx.fillCircle(7, 19, 1.8);
      gfx.fillCircle(25, 19, 1.8);
    },
  },
  {
    id: 'pollito', name: 'Pollito', rarity: 'comun',
    draw(gfx) {
      // Orange legs
      gfx.fillStyle(0xff8800);
      gfx.fillRect(12, 42, 2, 6);
      gfx.fillRect(18, 42, 2, 6);
      // Round yellow body and head, with a little feather on top
      gfx.fillStyle(0xffdd22);
      gfx.fillCircle(16, 33, 11);
      gfx.fillCircle(16, 16, 9);
      gfx.fillTriangle(14, 8, 18, 8, 17, 2);
      // A wing
      gfx.fillStyle(0xeebb00);
      gfx.fillEllipse(9, 33, 7, 11);
      bigEyes(gfx, 14, 12, 20, 2.2);
      // Orange beak
      gfx.fillStyle(0xff8800);
      gfx.fillTriangle(13, 18, 19, 18, 16, 22);
    },
  },
  {
    id: 'abeja', name: 'Abeja', rarity: 'comun',
    draw(gfx) {
      // See-through wings behind the body
      gfx.fillStyle(0xddeeff, 0.85);
      gfx.fillEllipse(6, 20, 11, 8);
      gfx.fillEllipse(26, 20, 11, 8);
      // The stinger
      gfx.fillStyle(0x222222);
      gfx.fillTriangle(14, 41, 18, 41, 16, 47);
      // Yellow body with black stripes
      gfx.fillStyle(0xffcc00);
      gfx.fillEllipse(16, 31, 18, 22);
      gfx.fillStyle(0x222222);
      gfx.fillRect(8, 26, 16, 3);
      gfx.fillRect(7, 32, 18, 3);
      gfx.fillRect(10, 38, 12, 2);
      // Head with antennae
      gfx.fillStyle(0xffcc00);
      gfx.fillCircle(16, 13, 7);
      gfx.lineStyle(1.5, 0x222222);
      gfx.lineBetween(13, 7, 10, 1);
      gfx.lineBetween(19, 7, 22, 1);
      gfx.fillStyle(0x222222);
      gfx.fillCircle(10, 1.5, 1.5);
      gfx.fillCircle(22, 1.5, 1.5);
      face(gfx);
    },
  },
  {
    id: 'payaso', name: 'Payaso', rarity: 'comun',
    draw(gfx) {
      person(gfx, { skin: 0xffffff, shirt: 0x9933cc, pants: 0xffcc00, shoes: 0xdd0000 });
      // Giant clown shoes
      gfx.fillStyle(0xdd0000);
      gfx.fillRect(6, 45, 9, 3);
      gfx.fillRect(17, 45, 9, 3);
      // Polka dots on the shirt
      gfx.fillStyle(0xffee00);
      gfx.fillCircle(12, 25, 1.5);
      gfx.fillCircle(19, 29, 1.5);
      gfx.fillCircle(13, 34, 1.5);
      // Orange hair, red nose and a big red smile
      gfx.fillStyle(0xff7700);
      gfx.fillCircle(8, 10, 4);
      gfx.fillCircle(24, 10, 4);
      gfx.fillStyle(0xdd0000);
      gfx.fillCircle(16, 15, 2);
      gfx.fillRect(12, 17.5, 8, 1.5);
      // Little party hat
      gfx.fillStyle(0x2288ff);
      gfx.fillTriangle(12, 7, 20, 7, 16, 0);
    },
  },
  {
    id: 'vaquero', name: 'Vaquero', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0xcc8844, pants: 0x3355aa, shoes: 0x6b3a1e });
      // Red bandana and belt with a gold buckle
      gfx.fillStyle(0xcc2222);
      gfx.fillTriangle(11, 20, 21, 20, 16, 26);
      gfx.fillStyle(0x553311);
      gfx.fillRect(9, 35, 14, 2);
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(15, 35, 3, 2);
      // Cowboy hat with a wide brim
      gfx.fillStyle(0x8b5a2b);
      gfx.fillRect(4, 6, 24, 2);
      gfx.fillRect(10, 1, 12, 6);
    },
  },
  {
    id: 'granjero', name: 'Granjero', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0xcc3333, pants: 0x3366cc, shoes: 0x6b3a1e });
      // Overalls: the front piece and the straps
      gfx.fillStyle(0x3366cc);
      gfx.fillRect(11, 27, 10, 11);
      gfx.fillRect(11, 21, 2, 6);
      gfx.fillRect(19, 21, 2, 6);
      // Straw hat
      gfx.fillStyle(0xeedd88);
      gfx.fillRect(4, 6, 24, 2);
      gfx.fillRect(10, 2, 12, 5);
      gfx.fillStyle(0xcc3333);
      gfx.fillRect(10, 5, 12, 1);
    },
  },
  {
    id: 'policia', name: 'Policía', rarity: 'comun',
    draw(gfx) {
      person(gfx, { shirt: 0x223388, pants: 0x111a44, shoes: 0x111111 });
      // Gold star badge on the chest
      gfx.fillStyle(0xffcc00);
      gfx.fillCircle(12, 26, 2);
      // Police cap with a black brim
      gfx.fillStyle(0x223388);
      gfx.fillRect(8, 3, 16, 5);
      gfx.fillStyle(0x111111);
      gfx.fillRect(8, 7, 17, 2);
      gfx.fillStyle(0xffcc00);
      gfx.fillCircle(16, 5, 1.3);
    },
  },

  // =============================================================
  // RAROS
  // =============================================================
  {
    id: 'pirata', name: 'Pirata', rarity: 'raro',
    draw(gfx) {
      person(gfx, { shirt: 0xffffff, pants: 0x333333 });
      // Red stripes on the shirt
      gfx.fillStyle(0xcc0000);
      gfx.fillRect(9, 25, 14, 2);
      gfx.fillRect(9, 30, 14, 2);
      // Black beard and an eye patch
      gfx.fillStyle(0x222222);
      gfx.fillTriangle(10, 15, 22, 15, 16, 22);
      gfx.fillRect(9, 10.5, 14, 1);
      gfx.fillCircle(13, 13, 2.2);
      // Pirate hat with a skull
      gfx.fillStyle(0x111111);
      gfx.fillTriangle(5, 8, 27, 8, 16, 0);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(16, 5, 1.5);
      // A shiny sword
      gfx.fillStyle(0xcccccc);
      gfx.fillRect(25, 20, 2, 13);
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(23, 32, 6, 2);
    },
  },
  {
    id: 'fantasma', name: 'Fantasma', rarity: 'raro',
    draw(gfx) {
      // A round head, a long body and a wavy bottom
      gfx.fillStyle(0xeef3ff);
      gfx.fillCircle(16, 15, 12);
      gfx.fillRect(4, 15, 24, 26);
      gfx.fillCircle(7, 41, 3);
      gfx.fillCircle(13, 42, 3);
      gfx.fillCircle(19, 41, 3);
      gfx.fillCircle(25, 42, 3);
      // Little arms
      gfx.fillEllipse(3, 26, 5, 8);
      gfx.fillEllipse(29, 26, 5, 8);
      // Big black eyes and an "oooh" mouth
      gfx.fillStyle(0x111111);
      gfx.fillEllipse(12, 15, 4, 6);
      gfx.fillEllipse(20, 15, 4, 6);
      gfx.fillEllipse(16, 24, 4, 5);
      // Pink cheeks: it's a friendly ghost
      gfx.fillStyle(0xffaacc);
      gfx.fillCircle(8, 20, 1.8);
      gfx.fillCircle(24, 20, 1.8);
    },
  },
  {
    id: 'momia', name: 'Momia', rarity: 'raro',
    draw(gfx) {
      const wrap = 0xe6dfc6;
      person(gfx, { skin: wrap, shirt: wrap, pants: wrap, shoes: wrap, face: false });
      // Bandage lines all over
      gfx.lineStyle(1, 0xa89f80);
      for (let y = 8; y < 47; y += 3) {
        gfx.lineBetween(y < 21 ? 10 : 9, y, y < 21 ? 22 : 23, y + 1);
      }
      // A dark gap in the bandages, with glowing yellow eyes
      gfx.fillStyle(0x333333);
      gfx.fillRect(10, 11, 12, 4);
      gfx.fillStyle(0xffee33);
      gfx.fillCircle(13, 13, 1.3);
      gfx.fillCircle(19, 13, 1.3);
    },
  },
  {
    id: 'zombi', name: 'Zombi', rarity: 'raro',
    draw(gfx) {
      person(gfx, { skin: 0x88bb77, shirt: 0x6655aa, pants: 0x554433, arms: 'forward', face: false });
      // Torn shirt (green skin shows through the holes)
      gfx.fillStyle(0x88bb77);
      gfx.fillTriangle(10, 38, 13, 38, 11, 33);
      gfx.fillTriangle(17, 38, 21, 38, 19, 34);
      // One big eye, one small eye, and a zig-zag mouth
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(13, 12, 2.5);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(13, 12, 1.2);
      gfx.fillCircle(19, 13, 1);
      gfx.lineStyle(1, 0x000000);
      gfx.lineBetween(12, 17, 14, 16);
      gfx.lineBetween(14, 16, 16, 17);
      gfx.lineBetween(16, 17, 18, 16);
      gfx.lineBetween(18, 16, 20, 17);
      // Messy hair
      gfx.fillStyle(0x333322);
      gfx.fillTriangle(9, 9, 13, 9, 10, 4);
      gfx.fillTriangle(13, 7, 18, 7, 16, 3);
      gfx.fillTriangle(18, 8, 23, 9, 22, 4);
    },
  },
  {
    id: 'buzo', name: 'Buzo', rarity: 'raro',
    draw(gfx) {
      person(gfx, { shirt: 0x111111, pants: 0x111111, shoes: 0xffcc00 });
      // Orange stripe on the wetsuit
      gfx.fillStyle(0xff7700);
      gfx.fillRect(9, 28, 14, 2);
      // Big yellow flippers
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(7, 45, 9, 3);
      gfx.fillRect(16, 45, 9, 3);
      // Diving mask and snorkel
      gfx.fillStyle(0x66ccff);
      gfx.fillRect(10, 10, 12, 5);
      gfx.lineStyle(1.5, 0x444444);
      gfx.strokeRect(10, 10, 12, 5);
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(23, 3, 2, 11);
    },
  },
  {
    id: 'pulpo', name: 'Pulpo', rarity: 'raro',
    draw(gfx) {
      // Six wiggly tentacles with round tips
      gfx.fillStyle(0xaa44cc);
      for (let i = 0; i < 6; i++) {
        const x = 5 + i * 4;
        const length = i % 2 === 0 ? 16 : 13;
        gfx.fillRect(x, 28, 3, length);
        gfx.fillCircle(x + 1.5, 28 + length, 2);
      }
      // Big round head with lighter spots
      gfx.fillEllipse(16, 18, 26, 26);
      gfx.fillStyle(0xcc77ee);
      gfx.fillCircle(9, 10, 2);
      gfx.fillCircle(22, 8, 1.5);
      gfx.fillCircle(24, 14, 1.8);
      bigEyes(gfx, 19, 12, 20, 3.5);
      gfx.fillStyle(0x551166);
      gfx.fillEllipse(16, 26, 4, 2);
    },
  },
  {
    id: 'panda', name: 'Panda', rarity: 'raro',
    draw(gfx) {
      // Black legs and arms, white tummy
      gfx.fillStyle(0x111111);
      gfx.fillRect(10, 40, 5, 8);
      gfx.fillRect(17, 40, 5, 8);
      gfx.fillRect(5, 26, 5, 11);
      gfx.fillRect(22, 26, 5, 11);
      gfx.fillStyle(0xffffff);
      gfx.fillEllipse(16, 33, 18, 18);
      gfx.fillStyle(0x111111);
      gfx.fillRect(8, 25, 16, 4);
      // White head with black ears and eye patches
      gfx.fillCircle(8, 6, 3.5);
      gfx.fillCircle(24, 6, 3.5);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(16, 14, 9);
      gfx.fillStyle(0x111111);
      gfx.fillEllipse(12, 14, 5, 6);
      gfx.fillEllipse(20, 14, 5, 6);
      gfx.fillCircle(16, 18, 1.5);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(12.5, 13.5, 1);
      gfx.fillCircle(20.5, 13.5, 1);
    },
  },
  {
    id: 'samurai', name: 'Samurái', rarity: 'raro',
    draw(gfx) {
      person(gfx, { shirt: 0x993333, pants: 0x222222 });
      // Wide black pants (hakama)
      gfx.fillStyle(0x222222);
      gfx.fillRect(9, 37, 14, 9);
      // Gold lines on the armor
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(9, 26, 14, 1);
      gfx.fillRect(9, 31, 14, 1);
      // Helmet with golden horns
      gfx.fillStyle(0x333333);
      gfx.fillRect(8, 4, 16, 5);
      gfx.lineStyle(2, 0xffcc00);
      gfx.lineBetween(12, 4, 8, 0);
      gfx.lineBetween(20, 4, 24, 0);
      // The katana on the back
      gfx.lineStyle(2, 0xdddddd);
      gfx.lineBetween(4, 18, 28, 42);
    },
  },
  {
    id: 'detective', name: 'Detective', rarity: 'raro',
    draw(gfx) {
      person(gfx, { shirt: 0xb08850, pants: 0x554433 });
      // A long coat with a belt
      gfx.fillStyle(0xb08850);
      gfx.fillRect(9, 36, 14, 4);
      gfx.fillStyle(0x6b4a2a);
      gfx.fillRect(9, 31, 14, 1.5);
      // Mustache and a checkered hat
      gfx.fillStyle(0x442200);
      gfx.fillRect(13, 15.5, 6, 1.5);
      gfx.fillStyle(0x8b6a3a);
      gfx.fillRect(9, 3, 14, 5);
      gfx.fillRect(7, 7, 18, 2);
      // Magnifying glass
      gfx.lineStyle(1.5, 0x664422);
      gfx.lineBetween(25, 34, 22, 39);
      gfx.fillStyle(0xbbe6ff);
      gfx.fillCircle(27, 30, 3.5);
      gfx.lineStyle(1.5, 0x664422);
      gfx.strokeCircle(27, 30, 3.5);
    },
  },

  // =============================================================
  // ÉPICOS
  // =============================================================
  {
    id: 'vampiro', name: 'Vampiro', rarity: 'epico',
    draw(gfx) {
      // Black cape with a red inside
      cape(gfx, 0x111111);
      gfx.fillStyle(0xaa0000);
      gfx.fillTriangle(9, 22, 23, 22, 16, 44);
      person(gfx, { skin: 0xdcdcf0, shirt: 0x111111, pants: 0x111111, eyes: 0xdd0000 });
      // High red collar
      gfx.fillStyle(0xaa0000);
      gfx.fillTriangle(7, 15, 12, 21, 9, 21);
      gfx.fillTriangle(25, 15, 20, 21, 23, 21);
      // Slicked black hair with a point
      gfx.fillStyle(0x111111);
      gfx.fillRect(9, 5, 14, 4);
      gfx.fillTriangle(14, 9, 18, 9, 16, 11);
      // Little fangs
      gfx.fillStyle(0xffffff);
      gfx.fillTriangle(14, 18, 15.5, 18, 14.5, 20);
      gfx.fillTriangle(16.5, 18, 18, 18, 17.5, 20);
    },
  },
  {
    id: 'unicornio', name: 'Unicornio', rarity: 'epico',
    draw(gfx) {
      person(gfx, { skin: 0xffffff, shirt: 0xffffff, pants: 0xffffff, shoes: 0xff88cc });
      // Rainbow mane down the side of the head and a rainbow tail
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillCircle(9, 7 + i * 2.5, 2.5);
        gfx.fillRect(23 + (i % 2), 30 + i * 2, 5, 2);
      });
      // Golden horn
      gfx.fillStyle(0xffd700);
      gfx.fillTriangle(14, 7, 18, 7, 17, 0);
      // Pink cheeks
      gfx.fillStyle(0xffaacc);
      gfx.fillCircle(12, 16, 1.5);
      gfx.fillCircle(21, 16, 1.5);
    },
  },
  {
    id: 'alien', name: 'Alien', rarity: 'epico', canShoot: true, gunAt: [14, 4],
    draw(gfx) {
      person(gfx, { skin: 0x66ee66, shirt: 0x8888ff, pants: 0x6666cc, face: false });
      // A bigger head with two antennae
      gfx.lineStyle(1.5, 0x66ee66);
      gfx.lineBetween(12, 6, 9, 1);
      gfx.lineBetween(20, 6, 23, 1);
      gfx.fillStyle(0xffee33);
      gfx.fillCircle(9, 1.5, 1.5);
      gfx.fillCircle(23, 1.5, 1.5);
      gfx.fillStyle(0x66ee66);
      gfx.fillEllipse(16, 12, 20, 15);
      // Giant black eyes with a shine
      gfx.fillStyle(0x000000);
      gfx.fillEllipse(12, 12, 5, 7);
      gfx.fillEllipse(20, 12, 5, 7);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(11, 10.5, 1);
      gfx.fillCircle(19, 10.5, 1);
      // Ray gun in the hand
      gfx.fillStyle(0xdddddd);
      gfx.fillRect(25, 32, 6, 3);
      gfx.fillStyle(0xff44ff);
      gfx.fillCircle(31, 33.5, 1.5);
    },
  },
  {
    id: 'nieve', name: 'Muñeco de nieve', rarity: 'epico',
    draw(gfx) {
      // Stick arms
      gfx.lineStyle(1.5, 0x664422);
      gfx.lineBetween(9, 23, 1, 16);
      gfx.lineBetween(23, 23, 31, 16);
      // Three snow balls
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(16, 38, 10);
      gfx.fillCircle(16, 24, 8);
      gfx.fillCircle(16, 12, 6);
      // Coal eyes and buttons, carrot nose
      gfx.fillStyle(0x111111);
      gfx.fillCircle(14, 11, 1);
      gfx.fillCircle(18, 11, 1);
      gfx.fillCircle(16, 24, 1.2);
      gfx.fillCircle(16, 29, 1.2);
      gfx.fillCircle(16, 36, 1.2);
      gfx.fillStyle(0xff8800);
      gfx.fillTriangle(16, 12, 16, 14, 23, 13);
      // Red scarf
      gfx.fillStyle(0xdd2222);
      gfx.fillRect(10, 17, 12, 3);
      gfx.fillRect(18, 17, 3, 8);
      // Black top hat
      gfx.fillStyle(0x111111);
      gfx.fillRect(11, 0, 10, 6);
      gfx.fillRect(8, 5, 16, 2);
    },
  },
  {
    id: 'mago', name: 'Mago', rarity: 'epico', canShoot: true, gunAt: [12, -11],
    draw(gfx) {
      person(gfx, { shirt: 0x3344aa, pants: 0x3344aa, shoes: 0x3344aa });
      // A long robe with little stars
      gfx.fillStyle(0x3344aa);
      gfx.fillRect(8, 21, 16, 27);
      gfx.fillStyle(0xffee33);
      gfx.fillCircle(12, 30, 1);
      gfx.fillCircle(19, 36, 1);
      gfx.fillCircle(13, 42, 1);
      // Long white beard
      gfx.fillStyle(0xffffff);
      gfx.fillTriangle(10, 16, 22, 16, 16, 30);
      // Pointy wizard hat
      gfx.fillStyle(0x3344aa);
      gfx.fillTriangle(9, 7, 23, 7, 18, 0);
      gfx.fillRect(7, 6, 18, 2);
      gfx.fillStyle(0xffee33);
      gfx.fillCircle(15, 4, 1);
      // Magic staff with a glowing ball (the magic comes out of it!)
      gfx.fillStyle(0x8b5a2b);
      gfx.fillRect(27, 14, 2, 32);
      gfx.fillStyle(0xff66ff);
      gfx.fillCircle(28, 12, 3);
    },
  },
  {
    id: 'tiburon', name: 'Tiburón', rarity: 'epico',
    draw(gfx) {
      const shark = 0x6688aa;
      person(gfx, { shirt: shark, pants: shark, shoes: shark, hands: shark, face: false });
      // White belly
      gfx.fillStyle(0xffffff);
      gfx.fillRect(12, 25, 8, 13);
      // Shark hood with a fin on top
      gfx.fillStyle(shark);
      gfx.fillTriangle(13, 5, 20, 5, 18, 0);
      gfx.fillCircle(16, 13, 9);
      // The face peeking out of the shark mouth, with teeth around it
      gfx.fillStyle(SKIN_COLOR);
      gfx.fillCircle(16, 15, 5);
      gfx.fillStyle(0xffffff);
      for (let x = 11; x <= 19; x += 2.5) {
        gfx.fillTriangle(x, 10, x + 2.5, 10, x + 1.25, 12.5);
      }
      face(gfx, 0x000000, 15);
      // A tail behind
      gfx.fillStyle(shark);
      gfx.fillTriangle(23, 34, 31, 28, 31, 40);
    },
  },

  // =============================================================
  // LEGENDARIOS (almost never!)
  // =============================================================
  {
    id: 'fenix', name: 'Fénix de colores', rarity: 'legendario', canShoot: true, gunAt: [12, -12],
    draw(gfx) {
      // Fire wings: orange outside, yellow inside
      gfx.fillStyle(0xff6600);
      gfx.fillTriangle(10, 20, 0, 8, 3, 36);
      gfx.fillTriangle(22, 20, 32, 8, 29, 36);
      gfx.fillStyle(0xffcc00);
      gfx.fillTriangle(10, 22, 3, 14, 5, 32);
      gfx.fillTriangle(22, 22, 29, 14, 27, 32);
      // Tail feathers
      gfx.fillStyle(0xdd1111);
      gfx.fillTriangle(10, 34, 22, 34, 16, 48);
      gfx.fillStyle(0xffcc00);
      gfx.fillTriangle(13, 36, 19, 36, 16, 45);
      // Body and head
      gfx.fillStyle(0xff3311);
      gfx.fillEllipse(16, 27, 14, 20);
      gfx.fillCircle(16, 12, 6);
      // Flame crest on the head
      gfx.fillStyle(0xffcc00);
      gfx.fillTriangle(11, 8, 14, 7, 11, 1);
      gfx.fillTriangle(14, 7, 18, 7, 16, 0);
      gfx.fillTriangle(18, 7, 21, 8, 21, 1);
      // Beak and eye
      gfx.fillStyle(0xffdd00);
      gfx.fillTriangle(20, 11, 26, 13, 20, 14);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(17, 11, 1.2);
    },
  },
  {
    id: 'caballero', name: 'Caballero dorado', rarity: 'legendario',
    draw(gfx) {
      const gold = 0xffcc33;
      person(gfx, { skin: gold, shirt: gold, pants: 0xddaa22, shoes: 0xbb8800, hands: 0xbb8800, face: false });
      // Lines on the armor
      gfx.fillStyle(0xbb8800);
      gfx.fillRect(9, 28, 14, 1);
      gfx.fillRect(15.5, 21, 1, 17);
      // Helmet visor with eye slits, and a red plume
      gfx.fillStyle(0x553300);
      gfx.fillRect(10, 11, 12, 4);
      gfx.fillStyle(0x111111);
      gfx.fillRect(11, 12.5, 10, 1);
      gfx.fillStyle(0xdd0000);
      gfx.fillTriangle(14, 7, 18, 6, 22, 0);
      // Silver sword
      gfx.fillStyle(0xdddddd);
      gfx.fillRect(27, 12, 2, 21);
      gfx.fillStyle(0x553300);
      gfx.fillRect(24, 32, 8, 2);
      // Blue shield with a gold cross
      gfx.fillStyle(0x2255dd);
      gfx.fillRect(1, 23, 8, 12);
      gfx.fillStyle(gold);
      gfx.fillRect(4.3, 24, 1.5, 10);
      gfx.fillRect(2, 27.5, 6, 1.5);
    },
  },
  {
    id: 'rey', name: 'Rey del Color', rarity: 'legendario',
    draw(gfx) {
      // Purple royal cape with a white fluffy border
      cape(gfx, 0x7722aa);
      gfx.fillStyle(0xffffff);
      gfx.fillRect(3, 44, 26, 3);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(8, 45.5, 0.8);
      gfx.fillCircle(16, 45.5, 0.8);
      gfx.fillCircle(24, 45.5, 0.8);
      person(gfx, { shirt: 0xffffff, pants: 0x6633aa, shoes: 0xffcc00 });
      // A rainbow shirt: the king who has ALL the colors
      RAINBOW.forEach((color, i) => {
        gfx.fillStyle(color);
        gfx.fillRect(9, 21 + i * 2.8, 14, 2.8);
      });
      // Golden crown with colored gems
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(10, 3, 12, 4);
      gfx.fillTriangle(10, 3, 13, 3, 10, 0);
      gfx.fillTriangle(14, 3, 18, 3, 16, 0);
      gfx.fillTriangle(19, 3, 22, 3, 22, 0);
      gfx.fillStyle(0xff0000);
      gfx.fillCircle(13, 5, 1);
      gfx.fillStyle(0x00cc00);
      gfx.fillCircle(16, 5, 1);
      gfx.fillStyle(0x0088ff);
      gfx.fillCircle(19, 5, 1);
      // Scepter with a star
      gfx.fillStyle(0xffcc00);
      gfx.fillRect(26, 18, 2, 18);
      gfx.fillCircle(27, 16, 3);
    },
  },
];
