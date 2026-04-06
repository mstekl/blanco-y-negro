// Enemy.js — Base class for all enemies!
// Enemies are the black-and-white villains trying to drain color from the world.
// This base class handles the common behavior: walking back and forth (patrolling).
// Specific enemy types (MR.1, MR.2, etc.) extend this class and add their own tricks.

import Phaser from 'phaser';

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, config = {}) {
    super(scene, x, y, texture);

    // Add to the scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics settings
    this.setBounce(0);
    this.setCollideWorldBounds(true);

    // Enemy stats — can be overridden by config or subclasses
    this.health = config.health || 1;
    this.speed = config.speed || 80;
    this.scoreValue = config.scoreValue || 100;

    // Patrol boundaries — the enemy walks between these X positions
    this.patrolMin = config.patrolMin || (x - 100);
    this.patrolMax = config.patrolMax || (x + 100);

    // Start walking in the configured direction
    this.direction = config.direction === 'right' ? 1 : -1;
    this.setVelocityX(this.speed * this.direction);

    // Track if this enemy is alive (to prevent double-kills)
    this.isDefeated = false;
  }

  // update() — Called every frame from LevelScene
  update() {
    if (this.isDefeated) return;

    // Patrol logic: if we've reached a boundary, turn around!
    if (this.x <= this.patrolMin) {
      this.direction = 1; // Turn right
      this.setFlipX(false);
    } else if (this.x >= this.patrolMax) {
      this.direction = -1; // Turn left
      this.setFlipX(true);
    }

    // Also turn around if we hit a wall
    if (this.body.blocked.left) {
      this.direction = 1;
      this.setFlipX(false);
    } else if (this.body.blocked.right) {
      this.direction = -1;
      this.setFlipX(true);
    }

    // Keep walking in the current direction
    this.setVelocityX(this.speed * this.direction);
  }

  // Called when this enemy takes a hit (from stomp or projectile)
  takeDamage(amount = 1) {
    if (this.isDefeated) return;

    this.health -= amount;

    if (this.health <= 0) {
      this.defeat();
    } else {
      // Flash white to show the enemy was hit but survived
      this.setTintFill(0xffffff);
      this.scene.time.delayedCall(100, () => {
        if (this.active) this.clearTint();
      });
    }
  }

  // Called when the enemy is defeated — plays death effects and removes it
  defeat() {
    if (this.isDefeated) return;
    this.isDefeated = true;

    // Stop moving
    this.setVelocity(0, 0);
    this.body.setAllowGravity(false);

    // Rainbow particle burst! (color explodes out when an enemy is defeated)
    this.spawnColorParticles();

    // Shrink and fade out animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });
  }

  // Spawn rainbow-colored particles where the enemy died
  spawnColorParticles() {
    const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff];

    // Create a small colored square texture for particles (if not already made)
    if (!this.scene.textures.exists('color-particle')) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0xffffff);
      gfx.fillRect(0, 0, 6, 6);
      gfx.generateTexture('color-particle', 6, 6);
      gfx.destroy();
    }

    // Emit particles in all directions with rainbow colors!
    const emitter = this.scene.add.particles(this.x, this.y, 'color-particle', {
      speed: { min: 60, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 12,
      tint: colors,
      emitting: false,
    });
    emitter.explode();

    // Clean up the particle emitter after the particles fade
    this.scene.time.delayedCall(800, () => {
      emitter.destroy();
    });
  }
}

export default Enemy;
