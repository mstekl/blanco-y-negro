// SkinParts.js — The pieces we use to draw the pencil skins (SkinPack.js and SkinPack2.js).
// Like molds for play-dough: person() makes a whole person with the colors we
// ask for, animal() makes a round little animal, and the skins add their own details.
// Every skin is 32 x 48 pixels, with the feet at the bottom.

export const RAINBOW = [0xff0000, 0xff8800, 0xffee00, 0x00cc00, 0x0088ff, 0x8800ff];
export const SKIN_COLOR = 0xf1c27d;

// The mold of a person. The head is a circle in the middle top (16, 13).
//   o.skin, o.shirt, o.pants, o.shoes: colors
//   o.arms: 'forward' = both arms stretched in front (like a zombie!)
//   o.face: false = don't draw eyes and mouth (when something covers the face)
export function person(gfx, o) {
  const skin = o.skin ?? SKIN_COLOR;

  // Legs and shoes
  gfx.fillStyle(o.pants);
  gfx.fillRect(11, 37, 4, 9);
  gfx.fillRect(17, 37, 4, 9);
  gfx.fillStyle(o.shoes ?? 0x333333);
  gfx.fillRect(10, 45, 6, 3);
  gfx.fillRect(16, 45, 6, 3);

  // Body
  gfx.fillStyle(o.shirt);
  gfx.fillRect(9, 21, 14, 17);

  // Arms and hands
  gfx.fillStyle(o.sleeves ?? o.shirt);
  if (o.arms === 'forward') {
    gfx.fillRect(20, 22, 10, 3);
    gfx.fillRect(20, 27, 10, 3);
    gfx.fillStyle(skin);
    gfx.fillCircle(30, 23.5, 2);
    gfx.fillCircle(30, 28.5, 2);
  } else {
    gfx.fillRect(5, 22, 4, 11);
    gfx.fillRect(23, 22, 4, 11);
    gfx.fillStyle(o.hands ?? skin);
    gfx.fillCircle(7, 34, 2.2);
    gfx.fillCircle(25, 34, 2.2);
  }

  // Head
  gfx.fillStyle(skin);
  gfx.fillCircle(16, 13, 7);
  if (o.face !== false) face(gfx, o.eyes ?? 0x000000);
}

// Two eyes and a little mouth
export function face(gfx, eyeColor = 0x000000, y = 13) {
  gfx.fillStyle(eyeColor);
  gfx.fillCircle(13, y, 1.3);
  gfx.fillCircle(19, y, 1.3);
  gfx.fillStyle(0x000000);
  gfx.fillRect(14, y + 4, 4, 1.2);
}

// A cape behind the body (draw it BEFORE the person, so it stays behind)
export function cape(gfx, color) {
  gfx.fillStyle(color);
  gfx.fillTriangle(9, 20, 23, 20, 3, 46);
  gfx.fillTriangle(9, 20, 23, 20, 29, 46);
  gfx.fillRect(9, 20, 14, 26);
}

// Round eyes with a black dot, for animals
export function bigEyes(gfx, y, left = 12, right = 20, size = 3) {
  gfx.fillStyle(0xffffff);
  gfx.fillCircle(left, y, size);
  gfx.fillCircle(right, y, size);
  gfx.fillStyle(0x000000);
  gfx.fillCircle(left + 0.5, y + 0.5, size / 2);
  gfx.fillCircle(right + 0.5, y + 0.5, size / 2);
}

// The mold of a little animal standing up: round body, round head, short legs.
//   o.color: the fur     o.belly: the lighter tummy (and face)
//   o.ears: 'round' (bear), 'long' (bunny), 'pointy' (cat, fox) or 'none'
//   o.earColor: inside of the ears     o.nose: color of the nose
//   o.snout: false = no snout (the nose goes right on the face)
export function animal(gfx, o) {
  // Legs and arms
  gfx.fillStyle(o.color);
  gfx.fillRect(10, 40, 5, 8);
  gfx.fillRect(17, 40, 5, 8);
  gfx.fillRect(5, 26, 5, 10);
  gfx.fillRect(22, 26, 5, 10);

  // Ears (behind the head)
  if (o.ears === 'round') {
    gfx.fillCircle(8, 7, 4);
    gfx.fillCircle(24, 7, 4);
    gfx.fillStyle(o.earColor ?? o.belly);
    gfx.fillCircle(8, 7, 2);
    gfx.fillCircle(24, 7, 2);
  } else if (o.ears === 'long') {
    gfx.fillEllipse(11, 5, 5, 12);
    gfx.fillEllipse(21, 5, 5, 12);
    gfx.fillStyle(o.earColor ?? o.belly);
    gfx.fillEllipse(11, 5, 2, 8);
    gfx.fillEllipse(21, 5, 2, 8);
  } else if (o.ears === 'pointy') {
    gfx.fillTriangle(7, 11, 13, 7, 7, 0);
    gfx.fillTriangle(25, 11, 19, 7, 25, 0);
    gfx.fillStyle(o.earColor ?? o.belly);
    gfx.fillTriangle(8, 8, 11, 7, 8, 3);
    gfx.fillTriangle(24, 8, 21, 7, 24, 3);
  }

  // Body with a tummy, and the head
  gfx.fillStyle(o.color);
  gfx.fillEllipse(16, 32, 18, 20);
  gfx.fillCircle(16, 15, 9);
  gfx.fillStyle(o.belly);
  gfx.fillEllipse(16, 34, 10, 13);

  // Snout, nose and eyes
  if (o.snout !== false) {
    gfx.fillEllipse(16, 19, 9, 6);
  }
  gfx.fillStyle(o.nose ?? 0x222222);
  gfx.fillCircle(16, 17.5, 1.4);
  gfx.fillStyle(0x000000);
  gfx.fillCircle(12.5, 13, 1.5);
  gfx.fillCircle(19.5, 13, 1.5);
}

// Draw a skin of the pack and save it as a picture called "skin-<id>"
export function makeSkinTexture(scene, skin) {
  const gfx = scene.add.graphics();
  skin.draw(gfx);
  gfx.generateTexture(`skin-${skin.id}`, 32, 48);
  gfx.destroy();
}
