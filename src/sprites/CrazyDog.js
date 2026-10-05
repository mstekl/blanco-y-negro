// CrazyDog.js — The crazy dog skin! (secret code "lebron" in the map hacks)
// It is only a picture: the Hero class uses it instead of the normal hero
// picture. We draw it with simple shapes, just like the enemies.
// It is 32 x 48 pixels, the same size as the hero, so the hitbox fits.

class CrazyDog {
  static createTexture(scene) {
    const gfx = scene.add.graphics();

    const fur = 0xc68642;      // brown
    const furDark = 0x6b3f1d;  // dark brown (ears, legs)
    const light = 0xe8c9a0;    // light patch (snout and belly)

    // Tail: wagging like crazy!
    gfx.fillStyle(furDark);
    gfx.fillTriangle(9, 30, 1, 22, 4, 34);

    // Legs, with lighter paws at the bottom
    gfx.fillStyle(furDark);
    gfx.fillRect(10, 36, 5, 12);
    gfx.fillRect(17, 36, 5, 12);
    gfx.fillStyle(light);
    gfx.fillRect(10, 45, 5, 3);
    gfx.fillRect(17, 45, 5, 3);

    // Body with a light belly
    gfx.fillStyle(fur);
    gfx.fillRect(9, 20, 14, 18);
    gfx.fillStyle(light);
    gfx.fillRect(12, 24, 8, 12);

    // Arms: one down and one up in the air (it is a crazy dog!)
    gfx.fillStyle(fur);
    gfx.fillRect(3, 24, 6, 4);
    gfx.fillRect(24, 13, 4, 11);
    gfx.fillStyle(light);
    gfx.fillRect(23, 11, 6, 3); // paw

    // Head
    gfx.fillStyle(fur);
    gfx.fillCircle(16, 12, 10);

    // Ears: one floppy, one standing up (they are not the same on purpose)
    gfx.fillStyle(furDark);
    gfx.fillTriangle(8, 5, 3, 18, 12, 13);
    gfx.fillTriangle(17, 5, 21, 0, 24, 7);

    // Snout and nose
    gfx.fillStyle(light);
    gfx.fillEllipse(24, 15, 12, 9);
    gfx.fillStyle(0x000000);
    gfx.fillCircle(29, 13, 2);

    // Crazy eyes: two big white circles of different sizes with tiny pupils
    // looking in different directions
    gfx.fillStyle(0xffffff);
    gfx.fillCircle(12, 9, 4.5);
    gfx.fillCircle(19, 8, 3.5);
    gfx.fillStyle(0x000000);
    gfx.fillCircle(13.5, 10.5, 1.6);
    gfx.fillCircle(17.5, 6.5, 1.2);

    // Mouth wide open with the tongue out
    gfx.lineStyle(1.5, 0x000000);
    gfx.lineBetween(20, 19, 28, 19);
    gfx.fillStyle(0xff6f91);
    gfx.fillRect(24, 19, 3, 6);
    gfx.fillCircle(25.5, 25, 2);

    gfx.generateTexture('skin-perro', 32, 48);
    gfx.destroy();
  }
}

export default CrazyDog;
