// EnemyMR1.js — MR.1, the Walker!
// This is the basic enemy inspired by Emi's drawing:
// a solid black stick figure with a round head.
// MR.1 just walks back and forth — like a Goomba in Mario.
// Jump on its head to defeat it!

import Enemy from './Enemy.js';
import { ENEMIES, COLORS } from '../utils/constants.js';

class EnemyMR1 extends Enemy {
  constructor(scene, x, y, config = {}) {
    // Generate the MR.1 texture if it doesn't exist yet
    if (!scene.textures.exists('enemy-mr1')) {
      EnemyMR1.createTexture(scene);
    }

    // Call the parent Enemy constructor with MR.1 stats
    super(scene, x, y, 'enemy-mr1', {
      health: config.health || ENEMIES.MR1.health,
      speed: config.speed || ENEMIES.MR1.speed,
      scoreValue: config.scoreValue || ENEMIES.MR1.score,
      direction: config.direction || 'left',
      patrolMin: config.patrolMin,
      patrolMax: config.patrolMax,
    });

    // Adjust the hitbox to match the stick figure shape
    this.body.setSize(20, 38);
    this.body.setOffset(6, 8);
  }

  // Draw MR.1 based on Emi's sketch: a black stick figure with a round head
  static createTexture(scene) {
    const gfx = scene.add.graphics();
    const color = COLORS.ENEMY_MR1;

    // Head (big round circle, just like Emi drew it)
    gfx.fillStyle(color);
    gfx.fillCircle(16, 8, 8);

    // Eyes (small white dots so it looks alive)
    gfx.fillStyle(0xffffff);
    gfx.fillCircle(13, 7, 2);
    gfx.fillCircle(19, 7, 2);
    // Pupils (red — they're evil!)
    gfx.fillStyle(0xff0000);
    gfx.fillCircle(13, 7, 1);
    gfx.fillCircle(19, 7, 1);

    // Body (thick black rectangle, like the stick figure drawing)
    gfx.fillStyle(color);
    gfx.fillRect(10, 16, 12, 18);

    // Arms (sticking out to the sides)
    gfx.fillRect(2, 20, 8, 4);   // left arm
    gfx.fillRect(22, 20, 8, 4);  // right arm

    // Legs (two rectangles going down)
    gfx.fillRect(10, 34, 5, 12);  // left leg
    gfx.fillRect(17, 34, 5, 12);  // right leg

    // Generate the texture (32x48 pixels, same size as hero)
    gfx.generateTexture('enemy-mr1', 32, 48);
    gfx.destroy();
  }
}

export default EnemyMR1;
