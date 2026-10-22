// Cosmetics.js — How the BAILES, MOCHILAS and MASCOTAS look and move.
// (Which ones exist, and which ones we have, is in src/data/cosmetics.js)
//   - cosmeticTexture(): the picture of any of them (a dance shows its emoji)
//   - attachCosmetics(): puts our mochila and mascota on a hero (or on any picture
//     of the hero, like the big one in the sala). They follow it by themselves.
//   - playEmote(): makes a hero (or a picture) dance!

import Phaser from 'phaser';
import { findCosmetic, loadCosmetics } from '../data/cosmetics.js';
import { RAINBOW } from './SkinParts.js';

const BLACK = 0x111111;
const WHITE = 0xf4f4f4;

// ---------------------------------------------------------------
// The drawings. Every mochila has:
//   size: [width, height] of the picture
//   at:   [x, y] where it goes, from the middle of the hero, when the hero
//         looks to the RIGHT (when it looks left, it is mirrored)
// The mascotas are 16 x 16. "flies" = it floats next to the head instead of walking
// ---------------------------------------------------------------
const DRAWINGS = {
  // ===== Mochilas =====
  estuche: {
    size: [12, 18], at: [-11, 2],
    draw(g) {
      // Pencils sticking out of the top, then the case in front of them
      [0xff0000, 0xffdd00, 0x0088ff].forEach((color, i) => {
        g.fillStyle(color);
        g.fillRect(2 + i * 3, 0, 2, 6);
      });
      g.fillStyle(0x555555);
      g.fillRoundedRect(0, 4, 12, 14, 3);
      g.fillStyle(0x999999);
      g.fillRect(5, 8, 2, 6);
    },
  },
  mochilaArcoiris: {
    size: [12, 18], at: [-11, 2],
    draw(g) {
      RAINBOW.forEach((color, i) => {
        g.fillStyle(color);
        g.fillRect(0, i * 3, 12, 3);
      });
      g.fillStyle(0xffffff);
      g.fillRect(3, 6, 6, 1);
    },
  },
  tablero: {
    size: [12, 16], at: [-11, 2],
    draw(g) {
      g.fillStyle(BLACK);
      g.fillRect(0, 0, 12, 16);
      g.fillStyle(WHITE);
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 3; x++) {
          if ((x + y) % 2 === 0) g.fillRect(x * 4, y * 4, 4, 4);
        }
      }
    },
  },
  cohete: {
    size: [12, 24], at: [-11, 4],
    draw(g) {
      // Red nose, white body, blue window, and fire at the bottom
      g.fillStyle(0xe52521);
      g.fillTriangle(2, 5, 10, 5, 6, 0);
      g.fillStyle(WHITE);
      g.fillRect(2, 5, 8, 12);
      g.fillStyle(0x44ccff);
      g.fillCircle(6, 9, 2);
      g.fillStyle(0xe52521);
      g.fillTriangle(0, 17, 2, 11, 2, 17);
      g.fillTriangle(12, 17, 10, 11, 10, 17);
      g.fillStyle(0xff8800);
      g.fillTriangle(3, 17, 9, 17, 6, 24);
      g.fillStyle(0xffdd00);
      g.fillTriangle(4.5, 17, 7.5, 17, 6, 21);
    },
  },
  alasTinta: {
    size: [40, 22], at: [-2, -2],
    draw(g) {
      // Two black wings with white feathers, one on each side of the hero
      [[0, 1], [40, -1]].forEach(([edge, dir]) => {
        g.fillStyle(BLACK);
        g.fillTriangle(20, 6, edge, 0, edge + dir * 6, 18);
        g.fillStyle(WHITE);
        g.fillTriangle(edge + dir * 4, 4, edge + dir * 10, 6, edge + dir * 6, 14);
      });
    },
  },
  alasArcoiris: {
    size: [40, 22], at: [-2, -2],
    draw(g) {
      [[0, 1], [40, -1]].forEach(([edge, dir]) => {
        RAINBOW.forEach((color, i) => {
          g.fillStyle(color);
          g.fillTriangle(20, 6 + i, edge + dir * i * 2, i * 3, edge + dir * (6 + i), 18);
        });
      });
    },
  },

  // A Halloween bucket shaped like a pumpkin, full of candy 🎃
  cubetaDulces: {
    size: [14, 18], at: [-11, 3],
    draw(g) {
      // Candy sticking out of the top (drawn first, so the bucket covers it)
      [0xff3366, 0x44ccff, 0xffdd00, 0x66ee88].forEach((color, i) => {
        g.fillStyle(color);
        g.fillCircle(3 + i * 2.7, 6, 2);
      });
      // The orange pumpkin bucket with its handle
      g.lineStyle(1.5, BLACK);
      g.strokeCircle(7, 6, 5.5);
      g.fillStyle(0xff7a00);
      g.fillEllipse(7, 12, 14, 11);
      g.fillStyle(0xc85a00);
      g.fillRect(4, 7, 1, 10);
      g.fillRect(9, 7, 1, 10);
      // Its happy pumpkin face
      g.fillStyle(BLACK);
      g.fillTriangle(3, 11, 6, 11, 4.5, 9);
      g.fillTriangle(8, 11, 11, 11, 9.5, 9);
      g.fillRect(4, 13.5, 6, 1.5);
    },
  },

  // ===== Mascotas =====
  // A little bat for Halloween 🦇: it flies next to the head
  murcielago: {
    flies: true,
    draw(g) {
      // Two pointy wings
      g.fillStyle(0x3a2a4a);
      g.fillTriangle(8, 7, 0, 3, 2, 12);
      g.fillTriangle(8, 7, 16, 3, 14, 12);
      g.fillStyle(0x1a1a24);
      g.fillTriangle(2, 12, 4, 8, 5, 12);
      g.fillTriangle(14, 12, 12, 8, 11, 12);
      // The round body, the ears and red eyes
      g.fillStyle(0x2a2030);
      g.fillCircle(8, 9, 4);
      g.fillTriangle(5, 6, 7, 5, 5.5, 2);
      g.fillTriangle(11, 6, 9, 5, 10.5, 2);
      g.fillStyle(0xff4444);
      g.fillCircle(6.7, 8.5, 0.9);
      g.fillCircle(9.3, 8.5, 0.9);
      // Two tiny white fangs
      g.fillStyle(WHITE);
      g.fillTriangle(7, 11, 7.8, 11, 7.4, 12.5);
      g.fillTriangle(8.2, 11, 9, 11, 8.6, 12.5);
    },
  },
  perrito: {
    draw(g) {
      g.fillStyle(0xaa7744);
      g.fillEllipse(7, 11, 10, 7);    // body
      g.fillRect(3, 13, 2, 3);        // legs
      g.fillRect(9, 13, 2, 3);
      g.fillCircle(12, 7, 4);         // head
      g.fillRect(0, 7, 3, 2);         // tail
      g.fillStyle(0x6b4423);
      g.fillEllipse(10, 5, 3, 6);     // ear
      g.fillStyle(BLACK);
      g.fillCircle(13, 6, 0.9);       // eye
      g.fillCircle(15.5, 8, 0.9);     // nose
    },
  },
  gatito: {
    draw(g) {
      g.fillStyle(0x888888);
      g.fillEllipse(7, 11, 10, 7);
      g.fillRect(3, 13, 2, 3);
      g.fillRect(9, 13, 2, 3);
      g.fillCircle(12, 7, 4);
      g.fillTriangle(9, 5, 11, 4, 9, 0);
      g.fillTriangle(15, 5, 13, 4, 15, 0);
      g.fillRect(0, 4, 2, 8);         // tail up
      g.fillStyle(0x66ee88);
      g.fillCircle(11, 6.5, 0.9);
      g.fillCircle(14, 6.5, 0.9);
      g.fillStyle(0xff77bb);
      g.fillCircle(12.5, 8.5, 0.6);
    },
  },
  pajarito: {
    flies: true,
    draw(g) {
      g.fillStyle(0xffdd00);
      g.fillCircle(8, 9, 6);
      g.fillStyle(0xffaa00);
      g.fillEllipse(6, 10, 6, 4);     // wing
      g.fillStyle(0xff8800);
      g.fillTriangle(13, 8, 13, 11, 16, 9.5);
      g.fillStyle(BLACK);
      g.fillCircle(10, 7, 1);
    },
  },
  pandita: {
    draw(g) {
      g.fillStyle(WHITE);
      g.fillEllipse(8, 11, 11, 8);
      g.fillCircle(8, 6, 5);
      g.fillStyle(BLACK);
      g.fillCircle(4, 2, 2);          // ears
      g.fillCircle(12, 2, 2);
      g.fillEllipse(6, 6, 2.5, 3);    // eye patches
      g.fillEllipse(10, 6, 2.5, 3);
      g.fillRect(3, 13, 3, 3);        // legs
      g.fillRect(10, 13, 3, 3);
      g.fillCircle(8, 8.5, 0.8);
    },
  },
  fantasmita: {
    flies: true,
    draw(g) {
      g.fillStyle(WHITE, 0.9);
      g.fillCircle(8, 6, 6);
      g.fillRect(2, 6, 12, 7);
      [2, 6, 10].forEach((x) => g.fillTriangle(x, 13, x + 4, 13, x + 2, 16));
      g.fillStyle(BLACK);
      g.fillCircle(6, 6, 1.2);
      g.fillCircle(10, 6, 1.2);
      g.fillStyle(0xff77bb);
      g.fillCircle(8, 9.5, 1);
    },
  },
  unicornio: {
    draw(g) {
      g.fillStyle(WHITE);
      g.fillEllipse(7, 11, 10, 6);
      g.fillRect(3, 13, 2, 3);
      g.fillRect(9, 13, 2, 3);
      g.fillCircle(12, 6, 3.5);
      // A rainbow mane and tail
      RAINBOW.forEach((color, i) => {
        g.fillStyle(color);
        g.fillRect(8 + (i % 3), 3 + Math.floor(i / 3) * 3, 1.5, 3);
        g.fillRect(0, 8 + i, 3, 1);
      });
      g.fillStyle(0xffcc00);
      g.fillTriangle(12, 3, 14, 3, 14.5, 0); // the horn
      g.fillStyle(BLACK);
      g.fillCircle(13, 6, 0.8);
    },
  },
  dragoncito: {
    flies: true,
    draw(g) {
      g.fillStyle(BLACK);
      g.fillTriangle(5, 7, 1, 1, 9, 6);   // wing
      g.fillStyle(0x22bb33);
      g.fillEllipse(7, 10, 10, 7);
      g.fillCircle(12, 6, 4);
      g.fillTriangle(0, 11, 4, 9, 3, 13); // tail
      g.fillStyle(0xffdd00);
      g.fillCircle(13, 5, 1);
      g.fillStyle(0xff8800);
      g.fillTriangle(15, 7, 16, 6, 16, 9); // a little fire
    },
  },
};

// A picture made from an emoji (for the dances, which have no drawing)
function makeEmojiTexture(scene, key, emoji) {
  const size = 64;
  const texture = scene.textures.createCanvas(key, size, size);
  const ctx = texture.getContext();
  ctx.font = `${size * 0.75}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + 3);
  texture.refresh();
}

// The picture of a baile, mochila or mascota (made the first time we need it)
export function cosmeticTexture(scene, id) {
  const key = `cosmetic-${id}`;
  if (scene.textures.exists(key)) return key;
  const cosmetic = findCosmetic(id);
  if (cosmetic.type === 'baile') {
    makeEmojiTexture(scene, key, cosmetic.icon);
    return key;
  }
  const drawing = DRAWINGS[id];
  const [w, h] = drawing.size || [16, 16];
  const gfx = scene.add.graphics();
  drawing.draw(gfx);
  gfx.generateTexture(key, w, h);
  gfx.destroy();
  return key;
}

// ---------------------------------------------------------------
// Our mochila and mascota, following a hero (or a picture of the hero).
// "sprite" can be big (like in the sala): the mochila grows with it.
// ---------------------------------------------------------------
// "tryOn" = { mochila, mascota } to show THOSE instead of ours (the probador of the TIENDA).
// Gives back a function that takes them off again.
export function attachCosmetics(scene, sprite, tryOn = null) {
  const { mochila, mascota } = tryOn || loadCosmetics();
  if (!mochila && !mascota) return () => {};

  // The mochila goes just behind the hero: the hero must be at least one layer up,
  // or the mochila would hide behind the background
  if (sprite.depth < 1) sprite.setDepth(1);

  let backpack = null;
  if (mochila) {
    backpack = scene.add.image(sprite.x, sprite.y, cosmeticTexture(scene, mochila));
    backpack.at = DRAWINGS[mochila].at;
  }
  let pet = null;
  if (mascota) {
    pet = scene.add.image(sprite.x, sprite.y, cosmeticTexture(scene, mascota));
    pet.flies = Boolean(DRAWINGS[mascota].flies);
  }

  // After every frame (when the hero already moved), put them in their places
  const follow = (time) => {
    if (!sprite.active) return;
    const size = Math.abs(sprite.scaleY);
    const facing = sprite.flipX ? -1 : 1;
    if (backpack) {
      backpack.setPosition(sprite.x + backpack.at[0] * facing * size, sprite.y + backpack.at[1] * size);
      backpack.setScale(size).setFlipX(sprite.flipX).setAngle(sprite.angle);
      backpack.setVisible(sprite.visible).setAlpha(sprite.alpha);
      // On the back = behind the hero
      backpack.setDepth(sprite.depth - 0.5);
    }
    if (pet) {
      // The pet walks (or flies) a bit behind the hero, and catches up slowly
      const targetX = sprite.x - facing * 26 * size;
      const targetY = pet.flies
        ? sprite.y - 16 * size + Math.sin(time / 250) * 3 * size
        : sprite.y + 16 * size;
      pet.x += (targetX - pet.x) * 0.12;
      pet.y += (targetY - pet.y) * 0.2;
      pet.setScale(size).setFlipX(targetX < pet.x - 1);
      pet.setVisible(sprite.visible).setAlpha(sprite.alpha).setDepth(sprite.depth + 0.5);
    }
  };
  scene.events.on('postupdate', follow);
  // When the hero is gone (or the scene ends), they go too
  const cleanUp = () => {
    scene.events.off('postupdate', follow);
    if (backpack) backpack.destroy();
    if (pet) pet.destroy();
  };
  sprite.once('destroy', cleanUp);
  scene.events.once('shutdown', cleanUp);
  return () => {
    sprite.off('destroy', cleanUp);
    scene.events.off('shutdown', cleanUp);
    cleanUp();
  };
}

// ---------------------------------------------------------------
// The dances! They move the hero (or the picture) and put it back
// exactly where it was. "onDone" is called at the end.
// ---------------------------------------------------------------
export function playEmote(scene, sprite, id, onDone = () => {}) {
  const cosmetic = findCosmetic(id) || findCosmetic('saludo');
  const base = { x: sprite.x, y: sprite.y, scaleX: sprite.scaleX, scaleY: sprite.scaleY, angle: sprite.angle };
  const u = Math.abs(base.scaleY); // 1 in the levels, bigger in the sala
  const steps = danceSteps(cosmetic.id, base, u);

  // Little emojis come out of the hero while it dances
  // (if the hero is inside a box (a container), we add where the box is)
  const box = sprite.parentContainer;
  const pops = scene.time.addEvent({
    delay: 450, repeat: 3,
    callback: () => floatEmoji(
      scene,
      sprite.x + (box ? box.x : 0) + Phaser.Math.Between(-12, 12) * u,
      sprite.y + (box ? box.y : 0) - 30 * u,
      cosmetic.icon, (box ? box.depth : sprite.depth) + 1,
    ),
  });
  // Fiebre disco: the hero changes colors, like a disco light
  let disco = null;
  if (cosmetic.id === 'disco') {
    let i = 0;
    disco = scene.time.addEvent({ delay: 150, loop: true, callback: () => sprite.setTint(RAINBOW[i++ % RAINBOW.length]) });
  }

  scene.tweens.chain({
    targets: sprite,
    tweens: steps,
    onComplete: () => {
      pops.remove();
      if (disco) disco.remove();
      // Back to its own color (player 2 of JUNTOS is light blue: "baseTint")
      if (sprite.baseTint) sprite.setTint(sprite.baseTint);
      else sprite.clearTint();
      sprite.setPosition(base.x, base.y).setScale(base.scaleX, base.scaleY).setAngle(base.angle);
      onDone();
    },
  });
}

// The moves of every dance (u = how big the hero is)
function danceSteps(id, b, u) {
  switch (id) {
    case 'pasito':
      return [
        { x: b.x - 8 * u, duration: 150 },
        { x: b.x + 8 * u, duration: 300, yoyo: true, repeat: 2 },
        { x: b.x, duration: 150 },
      ];
    case 'saltitos':
      return [{ y: b.y - 26 * u, duration: 200, yoyo: true, repeat: 2, ease: 'Quad.easeOut' }];
    case 'trompo':
      // Getting thin and wide again, very fast, looks like spinning
      return [{ scaleX: -b.scaleX, duration: 140, yoyo: true, repeat: 5 }];
    case 'robot':
      return [
        { angle: 10, duration: 160, ease: 'Stepped' },
        { angle: -10, duration: 160, ease: 'Stepped' },
        { scaleY: b.scaleY * 0.85, angle: 0, duration: 160, ease: 'Stepped' },
        { scaleY: b.scaleY, duration: 160, ease: 'Stepped' },
        { angle: 10, duration: 160, ease: 'Stepped' },
        { angle: -10, duration: 160, ease: 'Stepped' },
        { angle: 0, duration: 160, ease: 'Stepped' },
      ];
    case 'voltereta':
      return [
        { y: b.y - 40 * u, duration: 250, ease: 'Quad.easeOut' },
        { angle: b.angle + 360, duration: 380 },
        { y: b.y, duration: 250, ease: 'Quad.easeIn' },
      ];
    case 'disco':
      return [{ angle: 15, duration: 180, yoyo: true, repeat: 5 }];
    case 'gigante':
      return [
        { scaleX: b.scaleX * 1.8, scaleY: b.scaleY * 1.8, y: b.y - 20 * u, duration: 400, ease: 'Back.easeOut' },
        { angle: 8, duration: 120, yoyo: true, repeat: 3 },
        { scaleX: b.scaleX, scaleY: b.scaleY, y: b.y, duration: 300 },
      ];
    case 'zombiBaile':
      // The picture can't move its arms, so the whole zombie leans forward
      // and wobbles slowly from one foot to the other: "uuuuhhh..."
      return [
        { angle: 12, duration: 300, ease: 'Sine.easeInOut' },
        { x: b.x + 6 * u, angle: 6, duration: 400, ease: 'Sine.easeInOut', yoyo: true, repeat: 1 },
        { x: b.x - 6 * u, angle: 16, duration: 400, ease: 'Sine.easeInOut', yoyo: true, repeat: 1 },
        { x: b.x, angle: 0, duration: 300 },
      ];
    default: // saludo
      return [
        { angle: -14, duration: 150 },
        { angle: 14, duration: 300, yoyo: true, repeat: 2 },
        { angle: 0, duration: 150 },
      ];
  }
}

// An emoji that floats up and disappears
function floatEmoji(scene, x, y, emoji, depth) {
  const text = scene.add.text(x, y, emoji, { fontSize: '22px' }).setOrigin(0.5).setDepth(depth);
  scene.tweens.add({
    targets: text, y: y - 40, alpha: 0, duration: 900, onComplete: () => text.destroy(),
  });
}
