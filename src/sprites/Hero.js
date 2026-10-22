// Hero.js — Our colorful hero who saves the world!
// This class controls everything about the player character:
// how it moves, jumps, and looks on screen.

import Phaser from 'phaser';
import { HERO, PROJECTILE, isGodMode } from '../utils/constants.js';
import EnemyMR1 from './EnemyMR1.js';
import EnemyMR2 from './EnemyMR2.js';
import EnemyMR3 from './EnemyMR3.js';
import EnemyDobleX from './EnemyDobleX.js';
import CrazyDog from './CrazyDog.js';
import {
  BossSkin, CloudSkin, PencilSkin, NinjaSkin, AstronautSkin, RobotSkin, CatSkin,
  DinoSkin, HeroCapeSkin,
} from './MoreSkins.js';
import { PENCIL_SKINS } from './PencilSkins.js';
import { PASS_SKINS } from './PassSkins.js';
import { HALLOWEEN_SKINS } from './HalloweenSkins.js';
import { makeSkinTexture } from './SkinParts.js';
import { playSound } from '../audio/Sound.js';

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
  // Doble-X, the villain that splits in two (code "D X")
  doblex: { texture: 'enemy-doblex', make: EnemyDobleX, body: [24, 40, 4, 8] }, // picture is 32x48
};

// The 80 skins of the pencils (SkinPack.js and SkinPack2.js) and the 7 skins of the
// PASE BLANCO Y NEGRO (PassSkins.js) and the 5 of HALLOWEEN (HalloweenSkins.js) are added here.
// They are all 32x48, so they all use the same hitbox.
for (const skin of [...PENCIL_SKINS, ...PASS_SKINS, ...HALLOWEEN_SKINS]) {
  SKINS[skin.id] = {
    texture: `skin-${skin.id}`,
    make: { createTexture: (scene) => makeSkinTexture(scene, skin) },
    body: [24, 40, 4, 8],
    canShoot: skin.canShoot,
    gunAt: skin.gunAt,
  };
}

class Hero extends Phaser.Physics.Arcade.Sprite {
  // "controls" says which keys move this hero:
  //   'normal' = arrows AND WASD both work (one player)
  //   'wasd'   = only W A D (+ S to shoot): player 1 in the race
  //   'arrows' = only the arrows (+ ↓ to shoot): player 2 in the race
  //   'arrows' is also player 2 in JUNTOS (two players in the same story).
  // "options" can change one thing:
  //   options.skin:      the skin to wear (null = the normal hero) instead of the one chosen in the sala
  constructor(scene, x, y, controls = 'normal', options = {}) {
    // Which picture do we wear? The normal hero, or a secret skin chosen in the sala
    // (the registry is the memory shared by all scenes)
    const skinId = options.skin !== undefined ? options.skin : scene.registry.get('skin');
    const skin = SKINS[skinId];
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

    // Set up keyboard controls: a list of keys for each action
    const K = Phaser.Input.Keyboard.KeyCodes;
    const key = (code) => scene.input.keyboard.addKey(code);
    if (controls === 'wasd') {
      // Race, player 1 (left half). No run key: both players walk at the same speed
      this.keys = {
        left: [key(K.A)], right: [key(K.D)], jump: [key(K.W)], shoot: [key(K.S)], run: [],
      };
    } else if (controls === 'arrows') {
      // Race, player 2 (right half)
      this.keys = {
        left: [key(K.LEFT)], right: [key(K.RIGHT)], jump: [key(K.UP)], shoot: [key(K.DOWN)], run: [],
      };
    } else {
      // One player: arrows or WASD to move, Shift to run,
      // Z and X to shoot (easy for small hands!)
      this.keys = {
        left: [key(K.LEFT), key(K.A)],
        right: [key(K.RIGHT), key(K.D)],
        jump: [key(K.UP), key(K.W), key(K.SPACE)],
        shoot: [key(K.Z), key(K.X)],
        run: [key(K.SHIFT)],
      };
    }

    // A colored pencil ('rojo', 'azul', 'verde') or null = the normal rainbow shot
    this.gunColor = null;
    // Snow makes the floor slippery (WeatherManager turns this on)
    this.slippery = false;
    // The vehicle we ride: null, 'patineta' or 'cohete' (picked up in the levels)
    this.vehicle = null;
    this.vehicleImage = null;
    scene.events.on('postupdate', this.moveVehicle, this);
    this.once('destroy', () => scene.events.off('postupdate', this.moveVehicle, this));
  }

  // ---------------------------------------------------------------
  // Vehicles!
  //   🛹 PATINETA: we go much faster for 10 seconds (we still steer and stop)
  //   🚀 COHETE:   TURBO forward for 4 seconds: it can't stop or turn,
  //                and it knocks out the villains it touches!
  // ---------------------------------------------------------------
  mountVehicle(type) {
    this.dismount(true);
    this.vehicle = type;
    this.vehicleImage = this.scene.add.image(this.x, this.y, `powerup-${type}`).setDepth(this.depth + 0.2);
    const seconds = type === 'cohete' ? 4 : 10;
    // The last 2 seconds it blinks, so we know it is about to end
    this.vehicleBlink = this.scene.time.delayedCall((seconds - 2) * 1000, () => {
      if (this.vehicleImage) {
        this.scene.tweens.add({ targets: this.vehicleImage, alpha: 0.3, duration: 150, yoyo: true, repeat: 6 });
      }
    });
    this.vehicleTimer = this.scene.time.delayedCall(seconds * 1000, () => this.dismount());
  }

  // Get off the vehicle (quiet = no puff of smoke, like when we enter the castle)
  dismount(quiet = false) {
    if (this.vehicleTimer) this.vehicleTimer.remove();
    if (this.vehicleBlink) this.vehicleBlink.remove();
    if (this.vehicleImage) {
      if (!quiet && this.scene.powerupManager) {
        this.scene.powerupManager.spawnCollectParticles(this.vehicleImage.x, this.vehicleImage.y);
      }
      this.vehicleImage.destroy();
    }
    this.vehicle = null;
    this.vehicleImage = null;
  }

  // After every frame: the skateboard goes under our feet, the rocket on our back
  moveVehicle() {
    if (!this.vehicleImage || !this.active) return;
    const facing = this.facingRight ? 1 : -1;
    if (this.vehicle === 'patineta') {
      this.vehicleImage.setPosition(this.x, this.body.bottom + 4);
    } else {
      this.vehicleImage.setPosition(this.x - facing * 8, this.y + 2);
    }
    this.vehicleImage.setFlipX(!this.facingRight).setVisible(this.visible);
  }

  // Is any key of this list held down?
  anyDown(keys) {
    return keys.some((k) => k.isDown);
  }

  // Was any key of this list JUST pressed? (each press counts only once)
  anyJustDown(keys) {
    return keys.some((k) => Phaser.Input.Keyboard.JustDown(k));
  }

  // update() runs every frame (60 times per second!)
  // This is where we read the keyboard and move the hero
  update() {
    const onGround = this.body.touching.down || this.body.blocked.down;

    // --- Horizontal movement ---
    const leftPressed = this.anyDown(this.keys.left);
    const rightPressed = this.anyDown(this.keys.right);
    const running = this.anyDown(this.keys.run);
    let speed = running ? HERO.RUN_SPEED : HERO.WALK_SPEED;
    // On the skateboard we always go fast!
    if (this.vehicle === 'patineta') speed = HERO.RUN_SPEED * 1.3;

    // The speed we WANT to go at (negative = left)
    let wanted = 0;
    if (this.vehicle === 'cohete') {
      // The rocket: TURBO forward, and it can't stop or turn around!
      wanted = (this.facingRight ? 1 : -1) * HERO.RUN_SPEED * 1.8;
    } else if (leftPressed) {
      // Move left (negative X = left on screen)
      wanted = -speed;
      this.facingRight = false;
      this.setFlipX(true); // Mirror the sprite to face left
    } else if (rightPressed) {
      // Move right (positive X = right on screen)
      wanted = speed;
      this.facingRight = true;
      this.setFlipX(false);
    }
    // On snow (slippery = true) we speed up and stop slowly, like on ice.
    // Otherwise we go at the wanted speed right away (and stop when no key is pressed)
    if (this.slippery && onGround) {
      this.setVelocityX(this.body.velocity.x + (wanted - this.body.velocity.x) * 0.05);
    } else {
      this.setVelocityX(wanted);
    }

    // --- Jumping (with double jump!) ---
    // When on the ground, reset the jump counter
    if (onGround) {
      this.jumpCount = 0;
    }

    // Use JustDown so each key press counts as one jump
    const jumpJustPressed = this.anyJustDown(this.keys.jump);

    if (jumpJustPressed && this.jumpCount < this.maxJumps) {
      // First jump = normal, second jump = a bit weaker (like a boost)
      const jumpPower = this.jumpCount === 0
        ? HERO.JUMP_VELOCITY
        : HERO.JUMP_VELOCITY * 0.75;
      this.setVelocityY(jumpPower);
      // A TRICK on the skateboard: a full spin in the air! (the scene gives the points)
      if (this.vehicle === 'patineta' && this.jumpCount === 0) {
        this.scene.tweens.add({
          targets: this, angle: this.facingRight ? 360 : -360, duration: 550,
          onComplete: () => this.setAngle(0),
        });
        this.emit('truco');
      }
      this.jumpCount += 1;
      playSound('saltar');
    }

    // --- Shooting ---
    // Press Z or X (or S / ↓ in the race) to fire the Color Gun (if we have it!)
    const shootPressed = this.anyJustDown(this.keys.shoot);

    if (shootPressed && this.hasColorGun) {
      this.shoot();
      playSound('disparo');
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
    this.dismount(true); // (and the vehicle goes away too)
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
      PROJECTILE.HERO_SPEED,
      this.gunColor || 'normal' // a colored pencil changes the shot (see Projectile.js)
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

    // Lose a life (ouch!)
    playSound('golpe');
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
