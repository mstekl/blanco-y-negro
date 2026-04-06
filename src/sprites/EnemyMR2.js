// EnemyMR2.js — MR.2, the Shooter!
// A taller, thinner black stick figure inspired by Emi's drawing.
// MR.2 is smarter than MR.1: it walks AND shoots dark projectiles
// at the hero! It takes 2 hits from the Color Gun to defeat.

import Enemy from './Enemy.js';
import { ENEMIES, COLORS } from '../utils/constants.js';

class EnemyMR2 extends Enemy {
  constructor(scene, x, y, config = {}) {
    // Generate the MR.2 texture if it doesn't exist yet
    if (!scene.textures.exists('enemy-mr2')) {
      EnemyMR2.createTexture(scene);
    }

    // Call the parent Enemy constructor with MR.2 stats
    super(scene, x, y, 'enemy-mr2', {
      health: config.health || ENEMIES.MR2.health,
      speed: config.speed || ENEMIES.MR2.speed,
      scoreValue: config.scoreValue || ENEMIES.MR2.score,
      direction: config.direction || 'left',
      patrolMin: config.patrolMin,
      patrolMax: config.patrolMax,
    });

    // Adjust the hitbox for the taller, thinner body
    this.body.setSize(18, 46);
    this.body.setOffset(7, 6);

    // Shooting behavior
    this.fireRate = config.fireRate || ENEMIES.MR2.fireRate;
    this.lastFireTime = 0;
    this.isBoss = config.isBoss || false;

    // Boss scaling — make the boss bigger and tougher!
    if (this.isBoss) {
      this.setScale(config.scale || 2);
      this.body.setSize(18, 46); // Reset after scale
    }
  }

  // Override update to add shooting behavior
  update() {
    // Call parent patrol logic
    super.update();
    if (this.isDefeated) return;

    // --- Shooting logic ---
    const now = this.scene.time.now;
    const hero = this.scene.hero;
    if (!hero || !hero.active) return;

    // Only shoot if enough time has passed since last shot
    if (now - this.lastFireTime < this.fireRate) return;

    // Only shoot if the hero is within range (800px)
    const distToHero = Math.abs(this.x - hero.x);
    if (distToHero > 800) return;

    this.lastFireTime = now;

    // Get a projectile from the enemy pool
    const pool = this.scene.enemyProjectiles;
    if (!pool) return;
    const projectile = pool.getFirstDead(false);
    if (!projectile) return;

    // Fire toward the hero's direction
    const dirX = hero.x < this.x ? -1 : 1;
    projectile.fire(this.x, this.y, dirX, 200);
  }

  // Draw MR.2 based on Emi's sketch: taller, thinner stick figure
  static createTexture(scene) {
    const gfx = scene.add.graphics();
    const color = COLORS.ENEMY_MR1; // Same dark color family

    // Head (slightly smaller than MR.1, more angular)
    gfx.fillStyle(color);
    gfx.fillCircle(16, 7, 7);

    // Angry eyes (white with red pupils, narrower)
    gfx.fillStyle(0xffffff);
    gfx.fillRect(12, 5, 3, 3);
    gfx.fillRect(18, 5, 3, 3);
    gfx.fillStyle(0xff0000);
    gfx.fillCircle(13, 6, 1);
    gfx.fillCircle(19, 6, 1);

    // Thin body (narrower than MR.1)
    gfx.fillStyle(color);
    gfx.fillRect(12, 14, 8, 22);

    // Arms (one arm extended forward, like pointing/shooting)
    gfx.fillRect(2, 18, 10, 3);   // left arm
    gfx.fillRect(20, 18, 10, 3);  // right arm (shooting arm)
    // Hand/gun detail on shooting arm
    gfx.fillStyle(0x333333);
    gfx.fillRect(28, 16, 4, 6);

    // Thin legs (longer than MR.1)
    gfx.fillStyle(color);
    gfx.fillRect(12, 36, 4, 16);  // left leg
    gfx.fillRect(18, 36, 4, 16);  // right leg

    // Generate texture (32x54 — taller than MR.1)
    gfx.generateTexture('enemy-mr2', 32, 54);
    gfx.destroy();
  }
}

export default EnemyMR2;
