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

// Three more skins (won with "A C", "R C" and "G P" in the Hacks de sala):
//   AstronautSkin: an astronaut who paints space — rainbow visor and a paint rocket backpack
//   RobotSkin:     a square robot with rainbow lights on its belly
//   CatSkin:       a painter cat with a beret and a brush on its tail

// The color astronaut: white suit with paint stains, a rainbow visor, and a backpack
// that is a rocket full of paint (32 x 48). He can shoot color rays from the start!
export const AstronautSkin = {
  createTexture(scene) {
    const gfx = scene.add.graphics();
    const suit = 0xf4f4f4;

    // The rocket backpack behind him, with a rainbow flame coming out of the bottom
    gfx.fillStyle(0xbbbbbb);
    gfx.fillRect(2, 18, 7, 16);
    RAINBOW.forEach((color, i) => {
      gfx.fillStyle(color);
      gfx.fillRect(2 + (i % 3) * 2, 34 + Math.floor(i / 3) * 2, 2, 2);
    });

    // Round helmet
    gfx.fillStyle(suit);
    gfx.fillCircle(16, 11, 10);

    // The visor: every rainbow color, one stripe under the other
    RAINBOW.forEach((color, i) => {
      gfx.fillStyle(color);
      gfx.fillRect(10, 6 + i * 2, 13, 2);
    });
    gfx.fillStyle(0xffffff);
    gfx.fillRect(19, 7, 2, 2); // a little shine, so it looks like glass

    // Puffy suit: body, arms and legs
    gfx.fillStyle(suit);
    gfx.fillRect(9, 21, 15, 17);
    gfx.fillRect(4, 23, 6, 5);
    gfx.fillRect(23, 23, 6, 5);
    gfx.fillRect(10, 38, 5, 8);
    gfx.fillRect(18, 38, 5, 8);

    // Paint stains on the suit — he paints space!
    gfx.fillStyle(0xff3399);
    gfx.fillCircle(13, 26, 2);
    gfx.fillStyle(0x00ccff);
    gfx.fillCircle(20, 31, 2);
    gfx.fillStyle(0xffdd00);
    gfx.fillCircle(14, 34, 1.5);

    // Big boots
    gfx.fillStyle(0x777777);
    gfx.fillRect(9, 45, 7, 3);
    gfx.fillRect(17, 45, 7, 3);

    gfx.generateTexture('skin-astronauta', 32, 48);
    gfx.destroy();
  },
};

// The color robot: a gray square robot with an antenna and rainbow lights on its belly (32 x 48)
export const RobotSkin = {
  createTexture(scene) {
    const gfx = scene.add.graphics();
    const metal = 0x8a8f99;
    const darkMetal = 0x5a5f69;

    // Antenna with a little light on top
    gfx.fillStyle(darkMetal);
    gfx.fillRect(15, 0, 2, 5);
    gfx.fillStyle(0xff0000);
    gfx.fillCircle(16, 2, 2);

    // Square head with screen eyes and a grid mouth
    gfx.fillStyle(metal);
    gfx.fillRect(8, 5, 16, 13);
    gfx.fillStyle(0x00ffcc);
    gfx.fillRect(11, 8, 4, 4);
    gfx.fillRect(18, 8, 4, 4);
    gfx.fillStyle(darkMetal);
    gfx.fillRect(12, 14, 9, 2);

    // Square body
    gfx.fillStyle(metal);
    gfx.fillRect(7, 19, 18, 19);

    // The rainbow lights on the belly: 2 rows of 3 little squares
    RAINBOW.forEach((color, i) => {
      gfx.fillStyle(color);
      gfx.fillRect(10 + (i % 3) * 4, 23 + Math.floor(i / 3) * 5, 3, 3);
    });

    // Arms with claw hands
    gfx.fillStyle(darkMetal);
    gfx.fillRect(2, 21, 5, 3);
    gfx.fillRect(25, 21, 5, 3);
    gfx.fillRect(1, 24, 3, 4);
    gfx.fillRect(28, 24, 3, 4);

    // Legs and flat feet
    gfx.fillRect(10, 38, 4, 8);
    gfx.fillRect(18, 38, 4, 8);
    gfx.fillRect(8, 45, 7, 3);
    gfx.fillRect(17, 45, 7, 3);

    gfx.generateTexture('skin-robot', 32, 48);
    gfx.destroy();
  },
};

// The painter cat: an orange cat with a red beret, standing on two legs,
// with a paint brush at the end of its tail (32 x 48)
export const CatSkin = {
  createTexture(scene) {
    const gfx = scene.add.graphics();
    const fur = 0xff9933;

    // The tail goes up behind the cat, and the brush tip is full of blue paint
    gfx.fillStyle(fur);
    gfx.fillRect(2, 22, 3, 18);
    gfx.fillStyle(0x8b5a2b);
    gfx.fillRect(1, 17, 5, 5);
    gfx.fillStyle(0x0088ff);
    gfx.fillTriangle(1, 17, 6, 17, 3.5, 11);

    // Pointy ears and head
    gfx.fillStyle(fur);
    gfx.fillTriangle(8, 8, 13, 6, 9, 0);
    gfx.fillTriangle(19, 6, 24, 8, 23, 0);
    gfx.fillCircle(16, 12, 8);

    // Red painter beret, a bit tilted, with a little stem on top
    gfx.fillStyle(0xdd1133);
    gfx.fillEllipse(14, 5, 14, 5);
    gfx.fillRect(13, 1, 2, 2);

    // Green eyes, pink nose and whiskers
    gfx.fillStyle(0x33cc33);
    gfx.fillCircle(13, 12, 2);
    gfx.fillCircle(19, 12, 2);
    gfx.fillStyle(0x000000);
    gfx.fillRect(12.5, 11, 1, 2.5);
    gfx.fillRect(18.5, 11, 1, 2.5);
    gfx.fillStyle(0xff88aa);
    gfx.fillTriangle(15, 15, 17, 15, 16, 16.5);
    gfx.lineStyle(1, 0x000000);
    gfx.lineBetween(7, 15, 12, 16);
    gfx.lineBetween(20, 16, 25, 15);

    // Body with a white painter apron full of paint stains
    gfx.fillStyle(fur);
    gfx.fillRect(9, 20, 14, 18);
    gfx.fillStyle(0xffffff);
    gfx.fillRect(11, 23, 10, 14);
    RAINBOW.forEach((color, i) => {
      gfx.fillStyle(color);
      gfx.fillCircle(13 + (i % 2) * 5, 26 + Math.floor(i / 2) * 4, 1.3);
    });

    // Arms, legs and paws
    gfx.fillStyle(fur);
    gfx.fillRect(5, 22, 4, 4);
    gfx.fillRect(23, 22, 4, 4);
    gfx.fillRect(10, 38, 5, 8);
    gfx.fillRect(17, 38, 5, 8);
    gfx.fillStyle(0xffffff);
    gfx.fillRect(9, 45, 7, 3);
    gfx.fillRect(16, 45, 7, 3);

    gfx.generateTexture('skin-gato', 32, 48);
    gfx.destroy();
  },
};
