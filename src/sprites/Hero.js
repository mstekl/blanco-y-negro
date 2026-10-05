// Hero.js — Our colorful hero who saves the world!
// This class controls everything about the player character:
// how it moves, jumps, and looks on screen.

import Phaser from 'phaser';
import { HERO, PROJECTILE } from '../utils/constants.js';

class Hero extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Create the hero sprite using our placeholder texture
    super(scene, x, y, 'hero');

    // Add the hero to the scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics settings
    this.setBounce(HERO.BOUNCE);
    this.setCollideWorldBounds(true);

    // Make the hitbox a bit smaller than the texture so it feels fair
    this.body.setSize(24, 40);
    this.body.setOffset(4, 8);

    // Hero state — keeps track of what's happening to our hero
    this.lives = HERO.INITIAL_LIVES;
    this.score = 0;
    this.facingRight = true;   // Which direction are we looking?
    this.isInvincible = false; // Can't be hurt when true
    this.hasColorGun = false;  // Can we shoot? (unlocked later with power-up)
    this.hasShield = false;    // Do we have a shield?
    this.shieldIndicator = null; // The pencil-case shield image (when active)
    this.lastShotTime = 0;     // Track cooldown between shots
    this.jumpCount = 0;        // How many jumps since leaving the ground (0, 1, or 2)
    this.maxJumps = 2;         // Allow double jump (press jump twice!)

    // Set up keyboard controls
    // Arrow keys
    this.cursors = scene.input.keyboard.createCursorKeys();
    // WASD keys (alternative controls)
    this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    // Run key
    this.keyShift = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    // Shoot keys (Z and X — easy for small hands!)
    this.keyZ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }

  // update() runs every frame (60 times per second!)
  // This is where we read the keyboard and move the hero
  update() {
    const onGround = this.body.touching.down || this.body.blocked.down;

    // --- Horizontal movement ---
    const leftPressed = this.cursors.left.isDown || this.keyA.isDown;
    const rightPressed = this.cursors.right.isDown || this.keyD.isDown;
    const running = this.keyShift.isDown;

    if (leftPressed) {
      // Move left (negative X = left on screen)
      const speed = running ? HERO.RUN_SPEED : HERO.WALK_SPEED;
      this.setVelocityX(-speed);
      this.facingRight = false;
      this.setFlipX(true); // Mirror the sprite to face left
    } else if (rightPressed) {
      // Move right (positive X = right on screen)
      const speed = running ? HERO.RUN_SPEED : HERO.WALK_SPEED;
      this.setVelocityX(speed);
      this.facingRight = true;
      this.setFlipX(false);
    } else {
      // No key pressed — stop horizontal movement
      this.setVelocityX(0);
    }

    // --- Jumping (with double jump!) ---
    // When on the ground, reset the jump counter
    if (onGround) {
      this.jumpCount = 0;
    }

    // Use JustDown so each key press counts as one jump
    const jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)
      || Phaser.Input.Keyboard.JustDown(this.keyW)
      || Phaser.Input.Keyboard.JustDown(this.cursors.space);

    if (jumpJustPressed && this.jumpCount < this.maxJumps) {
      // First jump = normal, second jump = a bit weaker (like a boost)
      const jumpPower = this.jumpCount === 0
        ? HERO.JUMP_VELOCITY
        : HERO.JUMP_VELOCITY * 0.75;
      this.setVelocityY(jumpPower);
      this.jumpCount += 1;
    }

    // --- Shooting ---
    // Press Z or X to fire the Color Gun (if we have it!)
    const shootPressed = Phaser.Input.Keyboard.JustDown(this.keyZ)
      || Phaser.Input.Keyboard.JustDown(this.keyX);

    if (shootPressed && this.hasColorGun) {
      this.shoot();
    }

    // --- The pencil-case shield follows the hero ---
    this.updateShield();
  }

  // Keep the shield in front of the hero, covering half of the body
  updateShield() {
    const shield = this.shieldIndicator;
    if (!shield || !shield.visible) return;

    // In front = the side the hero is looking at
    const side = this.facingRight ? 1 : -1;
    shield.setPosition(this.x + side * 11, this.y + 4);
    shield.setFlipX(!this.facingRight);
    shield.setDepth(this.depth + 1);
  }

  // Fire a rainbow projectile from the Color Gun!
  shoot() {
    const now = this.scene.time.now;

    // Check cooldown — can't fire too fast
    if (now - this.lastShotTime < HERO.SHOOT_COOLDOWN) return;
    this.lastShotTime = now;

    // Get a projectile from the pool (reuses inactive ones)
    if (!this.scene.heroProjectiles) return;
    const projectile = this.scene.heroProjectiles.getFirstDead(false);
    if (!projectile) return;

    // Fire it in the direction the hero is facing
    const offsetX = this.facingRight ? 16 : -16;
    const direction = this.facingRight ? 1 : -1;
    projectile.fire(
      this.x + offsetX, this.y,
      direction,
      PROJECTILE.HERO_SPEED
    );
  }

  // Called when the hero gets hurt by an enemy
  takeDamage() {
    // If we're invincible, ignore the damage
    if (this.isInvincible) return;

    // If we have a shield, use it instead of losing a life
    if (this.hasShield) {
      this.hasShield = false;
      // The shield breaks: a copy flies away spinning while the real one hides
      if (this.shieldIndicator) {
        const broken = this.scene.add.image(
          this.shieldIndicator.x, this.shieldIndicator.y, 'pencil-shield'
        ).setFlipX(this.shieldIndicator.flipX).setDepth(this.depth + 2);
        this.scene.tweens.add({
          targets: broken,
          x: broken.x + (this.facingRight ? 50 : -50),
          y: broken.y - 40,
          angle: this.facingRight ? 200 : -200,
          alpha: 0,
          duration: 600,
          ease: 'Quad.easeOut',
          onComplete: () => broken.destroy(),
        });
        this.shieldIndicator.setVisible(false);
      }
      // Brief invincibility so the same enemy doesn't hit us again immediately
      this.isInvincible = true;
      this.scene.tweens.add({
        targets: this,
        alpha: 0.5,
        duration: 80,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.alpha = 1;
          this.isInvincible = false;
        },
      });
      // Flash to show shield broke
      this.scene.cameras.main.shake(150, 0.008);
      return;
    }

    // Lose a life
    this.lives -= 1;

    // Become invincible for a short time (so we don't lose all lives at once)
    this.isInvincible = true;

    // Blink effect — the hero flashes to show invincibility
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: Math.floor(HERO.INVINCIBLE_DURATION / 200),
      onComplete: () => {
        this.alpha = 1;
        this.isInvincible = false;
      },
    });

    // Small knockback — push the hero away from danger
    const knockbackDir = this.facingRight ? -1 : 1;
    this.setVelocityX(knockbackDir * 150);
    this.setVelocityY(-200);

    // Camera shake to feel the impact!
    this.scene.cameras.main.shake(200, 0.01);
  }

  // Add points to the score
  addScore(points) {
    this.score += points;
  }
}

export default Hero;
