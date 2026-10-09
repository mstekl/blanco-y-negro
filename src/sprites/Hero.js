// Hero.js — Our colorful hero who saves the world!
// This class controls everything about the player character:
// how it moves, jumps, and looks on screen.

import Phaser from 'phaser';
import { HERO, PROJECTILE, isGodMode } from '../utils/constants.js';
import EnemyMR1 from './EnemyMR1.js';
import EnemyMR2 from './EnemyMR2.js';
import EnemyMR3 from './EnemyMR3.js';
import CrazyDog from './CrazyDog.js';
import {
  BossSkin, CloudSkin, PencilSkin, NinjaSkin, AstronautSkin, RobotSkin, CatSkin,
  DinoSkin, HeroCapeSkin,
} from './MoreSkins.js';
import { PENCIL_SKINS } from './PencilSkins.js';
import { makeSkinTexture } from './SkinParts.js';

// The secret skins! They are won with the "Hacks de sala" on the title screen
// ("B Y N" = MR.1 and MR.2, "lebron" = crazy dog, "goma" = MR.3 on his eraser tank)
// and they can only be put on there, before playing.
//   texture:  the picture to use    make: who knows how to draw that picture
//   body:     hitbox [width, height, offsetX, offsetY] so the feet touch the ground
//   canShoot: true = we can shoot from the start (no Color Pencil needed)
//   gunAt:    where the shots come out [how far in front, how far down from the middle]
export const SKINS = {
  mr1: { texture: 'enemy-mr1', make: EnemyMR1, body: [24, 40, 4, 8] },   // picture is 32x48
  mr2: { texture: 'enemy-mr2', make: EnemyMR2, body: [24, 46, 4, 8] },   // picture is 32x54 (taller)
  perro: { texture: 'skin-perro', make: CrazyDog, body: [24, 40, 4, 8] }, // picture is 32x48
  // The tank has a cannon, so MR.3 shoots right away! (picture is 64x64)
  mr3: { texture: 'enemy-mr3', make: EnemyMR3, body: [56, 54, 4, 10], canShoot: true, gunAt: [32, 2] },
  // The final boss and the storm cloud are villains that shoot, so they shoot right away too!
  jefe: { texture: 'skin-jefe', make: BossSkin, body: [24, 46, 4, 8], canShoot: true, gunAt: [16, -4] }, // 32x54
  nube: { texture: 'skin-nube', make: CloudSkin, body: [24, 40, 4, 8], canShoot: true, gunAt: [14, -10] }, // 32x48
  lapiz: { texture: 'skin-lapiz', make: PencilSkin, body: [24, 40, 4, 8] }, // picture is 32x48
  ninja: { texture: 'skin-ninja', make: NinjaSkin, body: [24, 40, 4, 8] },  // picture is 32x48
  // The color astronaut paints space, so he shoots color rays right away!
  astronauta: { texture: 'skin-astronauta', make: AstronautSkin, body: [24, 40, 4, 8], canShoot: true, gunAt: [14, 0] }, // 32x48
  robot: { texture: 'skin-robot', make: RobotSkin, body: [24, 40, 4, 8] }, // picture is 32x48
  gato: { texture: 'skin-gato', make: CatSkin, body: [24, 40, 4, 8] },     // picture is 32x48
  // The rainbow dinosaur roars color, so he shoots right away!
  dino: { texture: 'skin-dino', make: DinoSkin, body: [24, 40, 4, 8], canShoot: true, gunAt: [14, -14] }, // 32x48
  super: { texture: 'skin-super', make: HeroCapeSkin, body: [24, 40, 4, 8] }, // picture is 32x48
};

// The 80 skins of the pencils (SkinPack.js and SkinPack2.js) are added to the list here.
// They are all 32x48, so they all use the same hitbox.
for (const skin of PENCIL_SKINS) {
  SKINS[skin.id] = {
    texture: `skin-${skin.id}`,
    make: { createTexture: (scene) => makeSkinTexture(scene, skin) },
    body: [24, 40, 4, 8],
    canShoot: skin.canShoot,
    gunAt: skin.gunAt,
  };
}

class Hero extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Which picture do we wear? The normal hero, or a secret skin chosen in the sala
    // (the registry is the memory shared by all scenes)
    const skin = SKINS[scene.registry.get('skin')];
    if (skin && !scene.textures.exists(skin.texture)) skin.make.createTexture(scene);

    // Create the hero sprite using our placeholder texture
    super(scene, x, y, skin ? skin.texture : 'hero');

    // Add the hero to the scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics settings
    this.setBounce(HERO.BOUNCE);
    this.setCollideWorldBounds(true);

    // Make the hitbox a bit smaller than the texture so it feels fair
    const [bodyWidth, bodyHeight, offsetX, offsetY] = skin ? skin.body : [24, 40, 4, 8];
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.setOffset(offsetX, offsetY);

    // Hero state — keeps track of what's happening to our hero
    this.lives = HERO.INITIAL_LIVES;
    this.score = 0;
    this.facingRight = true;   // Which direction are we looking?
    this.isInvincible = false; // Can't be hurt when true
    this.hasColorGun = Boolean(skin && skin.canShoot); // Can we shoot? (normally unlocked later with power-up)
    this.gunAt = (skin && skin.gunAt) || [16, 0];     // Where the shots come out of
    this.shieldCount = 0;      // How many shields we have (0, 1 or 2)
    this.maxShields = 2;       // Picking up a shield while holding one gives us 2!
    this.shieldImages = [];    // The pencil-case shield images (one per shield)
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

  // True when we have at least one shield
  get hasShield() {
    return this.shieldCount > 0;
  }

  // Pick up a shield (we can hold up to maxShields at the same time)
  addShield() {
    if (this.shieldCount >= this.maxShields) return;
    this.shieldCount += 1;

    // Make the picture for this shield the first time we need it
    const index = this.shieldCount - 1;
    if (!this.shieldImages[index]) {
      this.shieldImages[index] = this.scene.add.image(this.x, this.y, 'pencil-shield');
    }
    this.shieldImages[index].setVisible(true);
    this.updateShield();
  }

  // Hide all shield pictures (used when the hero walks into a door or pipe)
  hideShields() {
    this.shieldImages.forEach((img) => img.setVisible(false));
  }

  // Keep the shields in front of the hero, covering half of the body
  updateShield() {
    // In front = the side the hero is looking at
    const side = this.facingRight ? 1 : -1;
    this.shieldImages.forEach((shield, i) => {
      if (!shield.visible) return;
      // The second shield sits a bit further in front, so both can be seen
      shield.setPosition(this.x + side * (11 + i * 8), this.y + 4);
      shield.setFlipX(!this.facingRight);
      shield.setDepth(this.depth + 1 + i);
    });
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
    const direction = this.facingRight ? 1 : -1;
    projectile.fire(
      this.x + this.gunAt[0] * direction, this.y + this.gunAt[1],
      direction,
      PROJECTILE.HERO_SPEED
    );
  }

  // Called when the hero gets hurt by an enemy
  takeDamage() {
    // Invincible mode (the secret code from the map hacks): nothing hurts us
    if (isGodMode(this.scene.registry)) return;

    // If we're invincible, ignore the damage
    if (this.isInvincible) return;

    // If we have a shield, use it instead of losing a life
    if (this.hasShield) {
      // Only the last shield we picked up breaks; the other one stays
      this.shieldCount -= 1;
      const shieldImage = this.shieldImages[this.shieldCount];
      // The shield breaks: a copy flies away spinning while the real one hides
      if (shieldImage) {
        const broken = this.scene.add.image(
          shieldImage.x, shieldImage.y, 'pencil-shield'
        ).setFlipX(shieldImage.flipX).setDepth(this.depth + 3);
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
        shieldImage.setVisible(false);
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
