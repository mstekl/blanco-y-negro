// PowerupManager.js — Handles power-up creation and collection!
// Power-ups are special items the hero can collect to gain abilities.
// They float with a gentle bob animation and show effects when collected.

import Phaser from 'phaser';
import Projectile from '../sprites/Projectile.js';
import { HERO } from '../utils/constants.js';

class PowerupManager {
  constructor(scene) {
    this.scene = scene;

    // Create the power-up textures
    Projectile.createPowerupTextures(scene);

    // Static group holds all power-up sprites
    this.powerups = scene.physics.add.staticGroup();

    // Floating platforms that give an extra life when you stand on them
    this.hiddenLifePlatforms = scene.physics.add.staticGroup();
  }

  // Extra lives are NOT floating items. They are pink floating platforms:
  // jump up through them, land on top, and you get the life!
  // x = center of the platform, y = top surface of the platform
  spawnHiddenLifePlatform(config) {
    const platform = this.hiddenLifePlatforms.create(
      config.x, config.y + 12, 'platform-tile'
    );
    platform.setDisplaySize(128, 24);
    platform.refreshBody();
    platform.setTint(0xff6688); // Pink, so it stands out from normal platforms
    platform.used = false;

    // One-way platform: only solid from above, so the hero can jump up
    // through it from below (and walk past it from the sides)
    platform.body.checkCollision.down = false;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;
  }

  // Called when the hero lands on a hidden platform
  heroLandsOnHiddenPlatform(hero, platform) {
    if (platform.used) return;
    // Only count it when the hero is really standing on top
    if (!hero.body.touching.down) return;
    platform.used = true;

    // Give the extra life (up to maximum)
    if (hero.lives < HERO.MAX_LIVES) {
      hero.lives += 1;
      this.scene.saveState();
      this.scene.hud.updateLives(hero.lives);
    }
    this.showCollectText(platform.x, platform.y - 20, '¡Vida Extra!', '#ff3366');
    hero.addScore(50);
    this.scene.saveState();
    this.scene.hud.updateScore(hero.score);
    this.spawnCollectParticles(platform.x, platform.y - 10);

    // Back to a normal color — the life has been taken
    platform.clearTint();
  }

  // Get the hidden platforms group (for setting up the collider)
  getHiddenPlatforms() {
    return this.hiddenLifePlatforms;
  }

  // Spawn all power-ups defined in the level data
  spawnPowerups(powerupList) {
    for (const config of powerupList) {
      // Extra lives are hidden platforms, not regular power-ups
      if (config.type === 'extra-life') {
        this.spawnHiddenLifePlatform(config);
        continue;
      }

      const textureKey = `powerup-${config.type}`;

      // Make sure we have a texture for this power-up type
      if (!this.scene.textures.exists(textureKey)) continue;

      // Create the power-up sprite
      const powerup = this.powerups.create(config.x, config.y, textureKey);
      powerup.powerupType = config.type; // Remember what type it is

      // Refresh the physics body after positioning
      powerup.refreshBody();

      // Bob animation — float up and down gently
      this.scene.tweens.add({
        targets: powerup,
        y: config.y - 8,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Subtle glow — pulse the alpha slightly
      this.scene.tweens.add({
        targets: powerup,
        alpha: 0.7,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  // Called when the hero overlaps with a power-up
  collectPowerup(hero, powerup) {
    const type = powerup.powerupType;
    const scene = this.scene;

    // Apply the power-up effect based on type
    switch (type) {
      case 'color-pencil':
        // Grant the Color Gun!
        hero.hasColorGun = true;
        scene.hud.showColorGun(true);
        this.showCollectText(powerup.x, powerup.y, '¡Lápiz de Color!', '#ff44ff');
        break;

      case 'extra-life':
        // Extra life (up to maximum)
        if (hero.lives < HERO.MAX_LIVES) {
          hero.lives += 1;
          scene.saveState();
          scene.hud.updateLives(hero.lives);
        }
        this.showCollectText(powerup.x, powerup.y, '¡Vida Extra!', '#ff3366');
        break;

      case 'shield':
        // Shield — each one absorbs one hit, and we can hold 2 at once
        // The hero holds pencil-case shields in front of the body
        // (Hero.update keeps them in the right place and facing the right way)
        hero.addShield();
        this.showCollectText(
          powerup.x, powerup.y,
          hero.shieldCount > 1 ? '¡Doble Escudo!' : '¡Escudo!',
          '#ffdd00'
        );
        break;
    }

    // Add score for collecting
    hero.addScore(50);
    scene.saveState();
    scene.hud.updateScore(hero.score);

    // Spawn color particles at the pickup location
    this.spawnCollectParticles(powerup.x, powerup.y);

    // Remove the power-up
    powerup.destroy();
  }

  // Show floating text when collecting a power-up
  showCollectText(x, y, text, color) {
    const floatingText = this.scene.add.text(x, y - 10, text, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    this.scene.tweens.add({
      targets: floatingText,
      y: y - 50,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => floatingText.destroy(),
    });
  }

  // Colorful particle burst when collecting a power-up
  spawnCollectParticles(x, y) {
    if (!this.scene.textures.exists('color-particle')) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0xffffff);
      gfx.fillRect(0, 0, 6, 6);
      gfx.generateTexture('color-particle', 6, 6);
      gfx.destroy();
    }

    const emitter = this.scene.add.particles(x, y, 'color-particle', {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 8,
      tint: [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0xff44ff],
      emitting: false,
    });
    emitter.explode();

    this.scene.time.delayedCall(600, () => emitter.destroy());
  }

  // Get the power-up group (for setting up overlaps)
  getGroup() {
    return this.powerups;
  }
}

export default PowerupManager;
