// Projectile.js — Bullets and projectiles!
// Used for the hero's rainbow Color Gun shots and (later)
// for enemy dark projectiles. Each projectile flies in one
// direction and destroys itself after a short time.

import Phaser from 'phaser';
import { PROJECTILE } from '../utils/constants.js';

class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Projectiles float — no gravity!
    this.body.setAllowGravity(false);

    // Start hidden and inactive (the group pool manages activation)
    this.setActive(false);
    this.setVisible(false);
  }

  // Fire the projectile from a position in a direction
  // directionX: 1 = right, -1 = left
  // speed: how fast it travels (pixels per second)
  fire(x, y, directionX, speed) {
    // Activate and show the projectile
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);

    // Set velocity in the firing direction
    this.setVelocityX(directionX * speed);
    this.setVelocityY(0);

    // Flip the sprite to match direction
    this.setFlipX(directionX < 0);

    // Self-destruct after a short time (so bullets don't fly forever)
    this.lifeTimer = this.scene.time.delayedCall(PROJECTILE.LIFETIME, () => {
      this.deactivate();
    });
  }

  // Deactivate and hide (return to the pool for reuse)
  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.setPosition(-50, -50); // Move off-screen

    // Cancel the life timer if it's still running
    if (this.lifeTimer) {
      this.lifeTimer.destroy();
      this.lifeTimer = null;
    }
  }

  // Generate the hero's rainbow projectile texture
  static createHeroTexture(scene) {
    if (scene.textures.exists('projectile-hero')) return;

    const gfx = scene.add.graphics();
    // Rainbow gradient bar (small and colorful!)
    const colors = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0088ff, 0x8800ff];
    const segW = 3;
    for (let i = 0; i < colors.length; i++) {
      gfx.fillStyle(colors[i]);
      gfx.fillRect(i * segW, 1, segW, 6);
    }
    // White glow tip
    gfx.fillStyle(0xffffff);
    gfx.fillCircle(colors.length * segW, 4, 3);
    gfx.generateTexture('projectile-hero', colors.length * segW + 4, 8);
    gfx.destroy();
  }

  // Generate powerup textures
  static createPowerupTextures(scene) {
    // --- Color Pencil (Lápiz de Color) ---
    if (!scene.textures.exists('powerup-color-pencil')) {
      const gfx = scene.add.graphics();
      // Pencil body with rainbow stripes
      const colors = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0088ff, 0x8800ff];
      for (let i = 0; i < colors.length; i++) {
        gfx.fillStyle(colors[i]);
        gfx.fillRect(4, 2 + i * 4, 12, 4);
      }
      // Pencil tip
      gfx.fillStyle(0xffcc88);
      gfx.fillTriangle(10, 26, 4, 26, 10, 32);
      // Pencil top (eraser)
      gfx.fillStyle(0xff6699);
      gfx.fillRect(4, 0, 12, 3);
      gfx.generateTexture('powerup-color-pencil', 20, 34);
      gfx.destroy();
    }

    // --- Extra Life (heart) ---
    if (!scene.textures.exists('powerup-extra-life')) {
      const gfx = scene.add.graphics();
      // Big colorful heart
      gfx.fillStyle(0xff3366);
      gfx.fillCircle(8, 7, 7);
      gfx.fillCircle(18, 7, 7);
      gfx.fillTriangle(1, 10, 25, 10, 13, 24);
      // Little "+" sign
      gfx.fillStyle(0xffffff);
      gfx.fillRect(11, 5, 4, 10);
      gfx.fillRect(8, 8, 10, 4);
      gfx.generateTexture('powerup-extra-life', 26, 26);
      gfx.destroy();
    }

    // --- Shield (yellow star-like shape) ---
    if (!scene.textures.exists('powerup-shield')) {
      const gfx = scene.add.graphics();
      // Yellow glowing circle
      gfx.fillStyle(0xffdd00, 0.8);
      gfx.fillCircle(14, 14, 14);
      // Inner shield icon
      gfx.fillStyle(0xffff88);
      gfx.fillCircle(14, 14, 8);
      // Shine highlight
      gfx.fillStyle(0xffffff, 0.7);
      gfx.fillCircle(10, 10, 3);
      gfx.generateTexture('powerup-shield', 28, 28);
      gfx.destroy();
    }
  }
}

export default Projectile;
