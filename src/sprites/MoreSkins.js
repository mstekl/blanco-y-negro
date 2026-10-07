// MoreSkins.js — Four more skins for the hero! (won in the "Hacks de sala")
//   BossSkin:    the final boss (MR.2 with a crown and a cape) — he can shoot
//   CloudSkin:   the storm cloud of level 5, walking on lightning legs — it can shoot
//   PencilSkin:  a rainbow color pencil with legs
//   NinjaSkin:   a black ninja with a rainbow headband
// They are only pictures: the Hero class uses them instead of the normal hero picture.
// We draw them with simple shapes, just like the enemies.

const RAINBOW = [0xff0000, 0xff8800, 0xffee00, 0x00cc00, 0x0088ff, 0x8800ff];

// The final boss: MR.2 with a golden crown and a red cape (32 x 54, like MR.2)
export const BossSkin = {
  createTexture(scene) {
    const gfx = scene.add.graphics();
    const dark = 0x1a1a1a;

    // Red cape behind the body (a big triangle from the shoulders down)
    gfx.fillStyle(0xaa1111);
    gfx.fillTriangle(10, 20, 22, 20, 4, 50);
    gfx.fillTriangle(10, 20, 22, 20, 28, 50);
    gfx.fillRect(10, 20, 12, 30);

    // Golden crown with three points
    gfx.fillStyle(0xffcc00);
    gfx.fillRect(10, 4, 12, 4);
    gfx.fillTriangle(10, 4, 13, 4, 10, 0);
    gfx.fillTriangle(14, 4, 18, 4, 16, 0);
    gfx.fillTriangle(19, 4, 22, 4, 22, 0);
    gfx.fillStyle(0xff0000);
    gfx.fillCircle(16, 6, 1.2); // a ruby in the middle

    // Head with glowing red eyes
    gfx.fillStyle(dark);
    gfx.fillCircle(16, 13, 6);
    gfx.fillStyle(0xff3333);
    gfx.fillRect(12, 11, 3, 3);
    gfx.fillRect(18, 11, 3, 3);

    // Thin body and arms (one arm with the gun, like MR.2)
    gfx.fillStyle(dark);
    gfx.fillRect(12, 19, 8, 19);
    gfx.fillRect(2, 22, 10, 3);
    gfx.fillRect(20, 22, 10, 3);
    gfx.fillStyle(0x555555);
    gfx.fillRect(28, 20, 4, 6);

    // Long legs
    gfx.fillStyle(dark);
    gfx.fillRect(12, 38, 4, 16);
    gfx.fillRect(18, 38, 4, 16);

    gfx.generateTexture('skin-jefe', 32, 54);
    gfx.destroy();
  },
};

// The storm cloud, small enough to be the hero, walking on lightning (32 x 48)
export const CloudSkin = {
  createTexture(scene) {
    const gfx = scene.add.graphics();

    // Lightning legs (yellow zig-zags)
    gfx.fillStyle(0xffee33);
    gfx.fillTriangle(9, 26, 15, 26, 10, 38);
    gfx.fillTriangle(8, 36, 14, 36, 10, 48);
    gfx.fillTriangle(18, 26, 24, 26, 19, 38);
    gfx.fillTriangle(17, 36, 23, 36, 19, 48);

    // The cloud: a dark shadow first, then the lighter puffs on top
    gfx.fillStyle(0x2e2e38);
    gfx.fillCircle(8, 19, 8);
    gfx.fillCircle(24, 19, 8);
    gfx.fillRect(8, 18, 16, 10);
    gfx.fillStyle(0x4a4a55);
    gfx.fillCircle(8, 16, 7);
    gfx.fillCircle(16, 11, 10);
    gfx.fillCircle(24, 16, 7);
    gfx.fillRect(8, 14, 16, 10);

    // Angry eyes and eyebrows
    gfx.fillStyle(0xffffff);
    gfx.fillCircle(12, 15, 3);
    gfx.fillCircle(20, 15, 3);
    gfx.fillStyle(0x000000);
    gfx.fillCircle(12.5, 16, 1.4);
    gfx.fillCircle(19.5, 16, 1.4);
    gfx.lineStyle(2, 0x000000);
    gfx.lineBetween(8, 10, 14, 12);
    gfx.lineBetween(24, 10, 18, 12);

    gfx.generateTexture('skin-nube', 32, 48);
    gfx.destroy();
  },
};

// A color pencil with legs: the tip is up and the body has all the rainbow colors (32 x 48)
export const PencilSkin = {
  createTexture(scene) {
    const gfx = scene.add.graphics();

    // Legs and arms (thin black lines, like a drawing)
    gfx.fillStyle(0x222222);
    gfx.fillRect(11, 40, 3, 8);
    gfx.fillRect(18, 40, 3, 8);
    gfx.fillRect(3, 22, 7, 2);
    gfx.fillRect(22, 22, 7, 2);

    // Sharpened wood tip, with the colored lead at the very top
    gfx.fillStyle(0xe8c48a);
    gfx.fillTriangle(10, 12, 22, 12, 16, 0);
    gfx.fillStyle(0xff0000);
    gfx.fillTriangle(14, 4, 18, 4, 16, 0);

    // The body: one stripe of every rainbow color
    RAINBOW.forEach((color, i) => {
      gfx.fillStyle(color);
      gfx.fillRect(10 + i * 2, 12, 2, 24);
    });

    // Metal band and pink eraser at the bottom
    gfx.fillStyle(0xaaaaaa);
    gfx.fillRect(10, 36, 12, 2);
    gfx.fillStyle(0xff9999);
    gfx.fillRect(10, 38, 12, 3);

    // A happy face
    gfx.fillStyle(0xffffff);
    gfx.fillCircle(13, 18, 2.5);
    gfx.fillCircle(19, 18, 2.5);
    gfx.fillStyle(0x000000);
    gfx.fillCircle(13.5, 18.5, 1.2);
    gfx.fillCircle(19.5, 18.5, 1.2);
    gfx.fillRect(13, 24, 6, 1.5);

    gfx.generateTexture('skin-lapiz', 32, 48);
    gfx.destroy();
  },
};

// A black ninja with a rainbow headband (32 x 48)
export const NinjaSkin = {
  createTexture(scene) {
    const gfx = scene.add.graphics();
    const black = 0x111111;

    // The ends of the headband flying behind the head (rainbow ribbons)
    RAINBOW.forEach((color, i) => {
      gfx.fillStyle(color);
      gfx.fillRect(0, 4 + i, 8, 1);
    });

    // Head
    gfx.fillStyle(black);
    gfx.fillCircle(16, 11, 9);

    // Rainbow headband across the forehead
    RAINBOW.forEach((color, i) => {
      gfx.fillStyle(color);
      gfx.fillRect(7 + i * 3, 4, 3, 3);
    });

    // The slit of the mask, with the eyes
    gfx.fillStyle(0xf1c27d);
    gfx.fillRect(9, 9, 15, 4);
    gfx.fillStyle(0x000000);
    gfx.fillRect(14, 10, 2, 2);
    gfx.fillRect(20, 10, 2, 2);

    // Body and arms
    gfx.fillStyle(black);
    gfx.fillRect(10, 20, 12, 18);
    gfx.fillRect(4, 22, 6, 4);
    gfx.fillRect(22, 22, 6, 4);

    // Rainbow belt
    RAINBOW.forEach((color, i) => {
      gfx.fillStyle(color);
      gfx.fillRect(10 + i * 2, 32, 2, 2);
    });

    // Legs
    gfx.fillStyle(black);
    gfx.fillRect(10, 38, 5, 10);
    gfx.fillRect(17, 38, 5, 10);

    gfx.generateTexture('skin-ninja', 32, 48);
    gfx.destroy();
  },
};
