// EnemyMR3.js — MR.3 and his Eraser Tank!
// MR.3 looks like MR.1, but he is WHITE. He rides on top of a war tank
// built out of erasers (gomas) — because erasers are what rub out color!
// The tank drives back and forth, but when it SEES the hero it chases him.
// Jump on MR.3's head (twice, the tank is tough) or shoot it to win.

import Enemy from './Enemy.js';
import { ENEMIES } from '../utils/constants.js';

class EnemyMR3 extends Enemy {
  constructor(scene, x, y, config = {}) {
    // Generate the MR.3 texture if it doesn't exist yet
    if (!scene.textures.exists('enemy-mr3')) {
      EnemyMR3.createTexture(scene);
    }

    super(scene, x, y, 'enemy-mr3', {
      health: config.health || ENEMIES.MR3.health,
      speed: config.speed || ENEMIES.MR3.speed,
      scoreValue: config.scoreValue || ENEMIES.MR3.score,
      direction: config.direction || 'left',
      patrolMin: config.patrolMin,
      patrolMax: config.patrolMax,
    });

    // When the hero gets this close, the tank stops patrolling and chases him
    this.chaseSpeed = config.chaseSpeed || ENEMIES.MR3.chaseSpeed;
    this.chaseRange = config.chaseRange || ENEMIES.MR3.chaseRange;
    this.rumbleTime = 0; // used to shake the tank while it chases

    // Hitbox covers the tank AND MR.3 sitting on top
    // (so jumping on his head counts as a stomp)
    this.body.setSize(58, 52);
    this.body.setOffset(3, 8);
  }

  update() {
    if (this.isDefeated) return;

    const hero = this.scene.hero;
    const dx = hero ? hero.x - this.x : 9999;
    const dy = hero ? hero.y - this.y : 9999;

    // Can the tank see the hero? (close enough, and more or less on the same floor)
    const seesHero = Math.abs(dx) < this.chaseRange && Math.abs(dy) < 150;

    if (seesHero) {
      // CHASE! Drive toward the hero, faster than when patrolling
      this.direction = dx > 0 ? 1 : -1;
      let speed = this.chaseSpeed;

      // But never leave its piece of ground — tanks can't jump over holes!
      if ((this.direction === -1 && this.x <= this.patrolMin) ||
          (this.direction === 1 && this.x >= this.patrolMax)) {
        speed = 0;
      }
      this.setVelocityX(speed * this.direction);

      // Shake a little, like an angry engine going "brrrrr"
      this.rumbleTime += 0.6;
      this.setAngle(Math.sin(this.rumbleTime) * 2);
    } else {
      // Nobody around: patrol back and forth like the other villains
      if (this.x <= this.patrolMin || this.body.blocked.left) this.direction = 1;
      else if (this.x >= this.patrolMax || this.body.blocked.right) this.direction = -1;
      this.setVelocityX(this.speed * this.direction);
      this.setAngle(0);
    }

    // The picture faces right, so flip it when going left
    this.setFlipX(this.direction === -1);
  }

  // Draw MR.3 on his eraser tank (facing right)
  static createTexture(scene) {
    const gfx = scene.add.graphics();
    const black = 0x1a1a1a;
    const eraser = 0xeeeeee; // erasers are white...
    const sleeve = 0x8a8a8a; // ...with a gray paper sleeve, like a real eraser

    // --- MR.3 popping out of the hatch (like MR.1, but WHITE) ---
    // Head with a black outline so we can see him against the white tank
    gfx.fillStyle(black);
    gfx.fillCircle(26, 9, 9);
    gfx.fillStyle(0xffffff);
    gfx.fillCircle(26, 9, 7.5);
    // Angry red eyes (black around them so they stand out on white)
    gfx.fillStyle(black);
    gfx.fillCircle(23, 8, 2);
    gfx.fillCircle(29, 8, 2);
    gfx.fillStyle(0xff0000);
    gfx.fillCircle(23, 8, 1);
    gfx.fillCircle(29, 8, 1);
    // Body and arms (white with black outline), resting on the hatch
    gfx.fillStyle(black);
    gfx.fillRect(19, 17, 14, 12);
    gfx.fillRect(12, 19, 28, 5);
    gfx.fillStyle(0xffffff);
    gfx.fillRect(20, 18, 12, 11);
    gfx.fillRect(13, 20, 26, 3);

    // --- The cannon: a long eraser stick pointing forward ---
    gfx.fillStyle(black);
    gfx.fillRect(38, 30, 26, 8);
    gfx.fillStyle(eraser);
    gfx.fillRect(39, 31, 24, 6);
    gfx.fillStyle(sleeve);
    gfx.fillRect(44, 31, 8, 6); // little sleeve band on the cannon

    // --- The turret: a fat eraser block ---
    gfx.fillStyle(black);
    gfx.fillRect(14, 27, 26, 13);
    gfx.fillStyle(eraser);
    gfx.fillRect(15, 28, 24, 11);
    gfx.fillStyle(sleeve);
    gfx.fillRect(21, 28, 12, 11);

    // --- The body of the tank: a big eraser block ---
    gfx.fillStyle(black);
    gfx.fillRect(2, 39, 60, 12);
    gfx.fillStyle(eraser);
    gfx.fillRect(3, 40, 58, 10);
    gfx.fillStyle(sleeve);
    gfx.fillRect(16, 40, 32, 10);

    // --- Treads: a row of little erasers acting as wheels ---
    gfx.fillStyle(black);
    gfx.fillRoundedRect(0, 50, 64, 14, 6);
    gfx.fillStyle(eraser);
    for (let i = 0; i < 6; i++) {
      gfx.fillCircle(7 + i * 10, 57, 4);
    }

    gfx.generateTexture('enemy-mr3', 64, 64);
    gfx.destroy();
  }
}

export default EnemyMR3;
