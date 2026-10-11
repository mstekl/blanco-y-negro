// EnemyDobleX.js — DOBLE-X, the villain that splits in two!
// He looks like MR.1, but FAT and with black and white stripes (like a zebra).
// When you defeat him he doesn't disappear: he splits into 2 smaller Doble-X!
// And those split again... 3 times in all:
//   1 big  ->  2 medium  ->  4 small  ->  8 tiny ones (the tiny ones don't split anymore)
// So to win you have to defeat 15 of them. The smaller they are, the FASTER they run!

import Enemy from './Enemy.js';
import { ENEMIES } from '../utils/constants.js';

// One line for each size: how big he looks, how fast he walks, and how many points he gives.
// "size 0" is the big one at the start, "size 3" the tiny ones at the end.
const SIZES = [
  { scale: 1.5, speed: 60, score: 100 },
  { scale: 1.1, speed: 90, score: 60 },
  { scale: 0.8, speed: 120, score: 40 },
  { scale: 0.55, speed: 150, score: 20 },
];

class EnemyDobleX extends Enemy {
  constructor(scene, x, y, config = {}) {
    if (!scene.textures.exists('enemy-doblex')) {
      EnemyDobleX.createTexture(scene);
    }

    // Which size are we? (a new Doble-X from the level is always the big one)
    const size = config.size || 0;
    const sizeData = SIZES[size];

    super(scene, x, y, 'enemy-doblex', {
      health: ENEMIES.DOBLEX.health,
      // In the survival the villains get faster every wave: then we keep that speed
      // (but the small ones are still a bit faster than the big one)
      // (never faster than 220, or nobody could catch the tiny ones!)
      speed: Math.min(220, (config.speed || ENEMIES.DOBLEX.speed) + (sizeData.speed - SIZES[0].speed)),
      scoreValue: sizeData.score,
      direction: config.direction || 'left',
      patrolMin: config.patrolMin,
      patrolMax: config.patrolMax,
    });

    this.size = size;
    this.baseSpeed = config.speed; // remembered for the children
    this.setScale(sizeData.scale);

    // Hitbox of the fat body (the picture is 32x48; Phaser makes it bigger with the scale)
    this.body.setSize(24, 40);
    this.body.setOffset(4, 8);
  }

  // When he is defeated... he splits!
  defeat() {
    if (this.isDefeated) return;
    super.defeat(); // the rainbow burst and the shrinking, like every villain

    // The tiny ones (size 3) don't split anymore
    if (this.size >= SIZES.length - 1) return;

    // Where do the new villains go? In the same group as us, so they collide
    // with the floor, the hero and the shots like every other villain
    const group = this.scene.enemies;
    if (!group) return;

    for (const side of [-1, 1]) {
      const child = new EnemyDobleX(this.scene, this.x + side * 10, this.y - 10, {
        size: this.size + 1,
        speed: this.baseSpeed,
        direction: side === 1 ? 'right' : 'left',
        patrolMin: this.patrolMin,
        patrolMax: this.patrolMax,
      });
      group.add(child);
      // They jump out to the sides, like popcorn!
      child.setVelocity(side * 150, -220);
      // For a moment they can't hurt the hero (or he would get hurt right after stomping)
      child.harmlessUntil = this.scene.time.now + 500;
      child.setAlpha(0.6);
      this.scene.time.delayedCall(500, () => {
        if (child.active) child.setAlpha(1);
      });
    }
  }

  // Draw Doble-X: a FAT stick figure with zebra stripes and two "X" eyes
  static createTexture(scene) {
    const gfx = scene.add.graphics();
    const black = 0x1a1a1a;
    const white = 0xf2f2f2;

    // Legs (short and thick)
    gfx.fillStyle(black);
    gfx.fillRect(8, 38, 6, 10);
    gfx.fillRect(18, 38, 6, 10);

    // Arms
    gfx.fillRect(0, 22, 6, 5);
    gfx.fillRect(26, 22, 6, 5);

    // The fat round belly, white...
    gfx.fillStyle(white);
    gfx.fillRoundedRect(4, 16, 24, 24, 8);
    // ...with black zebra stripes
    gfx.fillStyle(black);
    gfx.fillRect(4, 20, 24, 3);
    gfx.fillRect(4, 27, 24, 3);
    gfx.fillRect(4, 34, 24, 3);
    // A black outline so he doesn't get lost on white backgrounds
    gfx.lineStyle(2, black);
    gfx.strokeRoundedRect(4, 16, 24, 24, 8);

    // Head (black and round, like MR.1)
    gfx.fillStyle(black);
    gfx.fillCircle(16, 9, 9);

    // The eyes are little white "X" — that's why he's called Doble-X!
    gfx.lineStyle(2, white);
    for (const eyeX of [12, 20]) {
      gfx.lineBetween(eyeX - 2, 6, eyeX + 2, 10);
      gfx.lineBetween(eyeX + 2, 6, eyeX - 2, 10);
    }

    gfx.generateTexture('enemy-doblex', 32, 48);
    gfx.destroy();
  }
}

export default EnemyDobleX;
