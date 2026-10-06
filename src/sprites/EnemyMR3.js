// EnemyMR3.js — MR.3, the Bat!
// The first enemy that FLIES. It swoops up and down in a wave while it
// goes back and forth, so you have to time your jump (or your shot).
// Jump on top of it or shoot it with the Color Gun to defeat it!

import Enemy from './Enemy.js';
import { ENEMIES, COLORS } from '../utils/constants.js';

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

    // Bats don't fall: no gravity, and they fly over platforms
    // (LevelScene checks this flag so the bat doesn't bump into them)
    this.body.setAllowGravity(false);
    this.isFlyer = true;

    // The wave: we swoop around the height where we were placed
    this.baseY = y;
    this.waveHeight = config.waveHeight || ENEMIES.MR3.waveHeight;
    this.waveSpeed = config.waveSpeed || ENEMIES.MR3.waveSpeed; // radians per second
    this.waveTime = Math.random() * Math.PI * 2; // (so two bats never flap in sync)

    // Hitbox that matches the body of the bat (the wings are thin)
    this.body.setSize(28, 18);
    this.body.setOffset(6, 7);
  }

  // Patrol like the others, plus the up-and-down wave
  update() {
    super.update();
    if (this.isDefeated) return;

    this.waveTime += this.waveSpeed / 60; // update() runs 60 times per second
    // We set the speed (not the position) so the physics stay happy
    const targetY = this.baseY + Math.sin(this.waveTime) * this.waveHeight;
    this.setVelocityY((targetY - this.y) * 6);

    // Flap the wings: squash the picture a little in a quick rhythm
    this.setScale(1, 0.85 + Math.abs(Math.sin(this.waveTime * 4)) * 0.25);
  }

  // Draw MR.3: a black bat with spread wings and angry red eyes
  static createTexture(scene) {
    const gfx = scene.add.graphics();
    const color = COLORS.ENEMY_MR1; // Same dark color family

    // Wings (two triangles, with a jagged edge like a bat)
    gfx.fillStyle(color);
    gfx.fillTriangle(16, 10, 0, 4, 4, 22);    // left wing
    gfx.fillTriangle(16, 10, 40, 4, 36, 22);  // right wing
    gfx.fillTriangle(4, 22, 10, 16, 12, 24);  // left wing tips
    gfx.fillTriangle(36, 22, 30, 16, 28, 24); // right wing tips

    // Body and head
    gfx.fillCircle(20, 14, 9);
    // Pointy ears
    gfx.fillTriangle(13, 8, 15, 0, 18, 7);
    gfx.fillTriangle(27, 8, 25, 0, 22, 7);

    // Angry eyes (white with red pupils, like the other villains)
    gfx.fillStyle(0xffffff);
    gfx.fillCircle(16, 13, 2.5);
    gfx.fillCircle(24, 13, 2.5);
    gfx.fillStyle(0xff0000);
    gfx.fillCircle(16, 13, 1.2);
    gfx.fillCircle(24, 13, 1.2);

    // Little fangs
    gfx.fillStyle(0xffffff);
    gfx.fillTriangle(17, 19, 19, 19, 18, 23);
    gfx.fillTriangle(21, 19, 23, 19, 22, 23);

    gfx.generateTexture('enemy-mr3', 40, 26);
    gfx.destroy();
  }
}

export default EnemyMR3;
