// LavaLevelScene.js — LAVA QUE SUBE! (from the sala: the LAVA button, or U)
// We are at the bottom of a tall tower of platforms, and the LAVA is rising
// from below... faster and faster! We have to climb up, platform by platform.
//   - The first one to reach the flag at the TOP wins.
//   - Touching the lava takes 1 of our 3 lives (a shield saves us), and the
//     hero jumps out onto a platform above it. Losing the 3 lives = we are out.
// The platforms let us jump THROUGH them from below (like in many platform
// games), so we only land on them coming down.
// It is played like the race (RaceScene.js): OFFLINE (two halves of the
// screen), against the MÁQUINA, or ONLINE. Everybody gets the SAME tower
// (it is built from today's date), so it is fair.
//
// This scene is a copy of the normal level (LevelScene) with some changes:
// a tall tower instead of a long street, no villains, no coins, and the lava.

import Phaser from 'phaser';
import LevelScene from './LevelScene.js';
import { levels } from '../data/levels.js';
import { isGodMode } from '../utils/constants.js';
import { playSound } from '../audio/Sound.js';

const GROUND_Y = 568;      // the top of the ground, like in every level
const FLOORS = 24;         // how many platforms there are on the way up
const LIVES = 3;
export const PIXELS_PER_METER = 20; // to say "45 m" instead of "900 pixels"

// How fast the lava rises (pixels per second) after "seconds" of game:
// slow at the start, a bit faster every second, but never more than 55
export function lavaSpeed(seconds) {
  return Math.min(55, 18 + seconds * 0.9);
}
// Where the lava starts: deep under the ground (we can't see it yet),
// so we have a few seconds to start climbing
export const LAVA_START_Y = GROUND_Y + 200;

// The tower: the ground, then platforms that go up in zigzag, and a wide
// platform at the top with the flag. "seed" is like the secret recipe of the
// random numbers: the same seed always builds the same tower.
// (The MÁQUINA uses this too, see Bot.js)
export function buildTower(seed) {
  const random = new Phaser.Math.RandomDataGenerator([seed]);
  const platforms = [{ x: 0, y: GROUND_Y, width: 800, type: 'ground' }];
  let x = 336;
  let y = GROUND_Y;
  for (let i = 0; i < FLOORS; i++) {
    // Each platform is a little higher than the last one: a jump can reach it
    y -= random.between(85, 105);
    // Higher up, the platforms are smaller (harder!)
    const width = i < 12 ? random.pick([128, 192]) : random.pick([128, 128, 192]);
    // Move left or right, but not too far (and not off the tower)
    let shift = random.between(110, 230) * random.pick([-1, 1]);
    if (x + shift < 32 || x + shift + width > 768) shift = -shift;
    x = Phaser.Math.Clamp(x + shift, 32, 768 - width);
    platforms.push({ x, y, width, type: 'platform' });
  }
  // The top: a wide platform with the flag
  y -= 100;
  platforms.push({ x: 272, y, width: 256, type: 'platform' });

  return {
    id: 0,
    name: 'Lava que sube',
    worldWidth: 800,
    topY: y - 220, // the sky over the top platform
    saturation: 0.3,
    heroStart: { x: 400, y: 500 },
    goal: { x: 400, y: y - 40 },
    platforms,
    enemies: [],
    // A shield in the middle of the tower: it saves us from the lava once!
    powerups: [{ type: 'shield', x: platforms[12].x + platforms[12].width / 2, y: platforms[12].y - 30 }],
    buildings: levels[0].buildings,
  };
}

// Today's tower: everybody who plays today (also online) gets the same one
export function todaysSeed() {
  const d = new Date();
  return `lava-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

class LavaLevelScene extends LevelScene {
  chooseLevelData() {
    this.tower = buildTower(this.scene.get('RaceScene').towerSeed || todaysSeed());
    return this.tower;
  }

  create() {
    // First, build the normal level (platforms, hero, our half of the screen, HUD...)
    super.create();
    const tower = this.tower;

    // No villains and no coins: the lava is the enemy here!
    this.enemies.clear(true, true);
    this.removeCoins();
    this.hero.hasColorGun = false;

    // The world is TALL: it goes up into the sky (negative y = higher than the screen)
    const height = GROUND_Y + 32 - tower.topY;
    this.physics.world.setBounds(0, tower.topY, tower.worldWidth, height);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.cameras.main.setBounds(0, tower.topY, tower.worldWidth, height);
    // The city in the background stays still while we climb
    this.grayBackground.setScrollFactor(0.3, 0);

    // We can jump THROUGH the platforms from below and land on them from above
    this.platforms.getChildren().forEach((tile) => {
      if (tile.texture.key !== 'platform-tile') return;
      tile.body.checkCollision.down = false;
      tile.body.checkCollision.left = false;
      tile.body.checkCollision.right = false;
    });

    this.hero.lives = LIVES;
    this.hud.showHearts();
    this.hud.updateLives(this.hero.lives);
    this.hud.levelText.setText('🌋 LAVA');

    this.drawMeterMarks();
    this.createLava();
    this.climbFrac = 0;
  }

  // A line every 20 meters on the left side, so we see how high we are
  drawMeterMarks() {
    const step = 20 * PIXELS_PER_METER;
    for (let y = GROUND_Y - step; y > this.tower.topY + 100; y -= step) {
      this.add.rectangle(30, y, 40, 3, 0xffffff, 0.35).setDepth(1);
      this.add.text(54, y, `${Math.round((GROUND_Y - y) / PIXELS_PER_METER)} m`, {
        fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0, 0.5).setAlpha(0.6).setDepth(1);
    }
  }

  // The lava: a wavy orange top, and a big red-orange body under it
  createLava() {
    makeLavaTexture(this);
    this.lavaY = LAVA_START_Y;
    this.lavaTime = 0;
    this.lavaTop = this.add.tileSprite(0, this.lavaY, this.tower.worldWidth, 40, 'lava-top')
      .setOrigin(0, 0).setDepth(10);
    this.lavaBody = this.add.rectangle(0, this.lavaY + 38, this.tower.worldWidth, 1400, 0xe02800)
      .setOrigin(0, 0).setDepth(10);
    // Bubbles that pop on top of the lava
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.lavaBubble() });

    // A warning at the bottom of our screen: how far the lava is
    this.lavaWarning = this.add.text(this.midX, 540, '', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffaa33',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  lavaBubble() {
    const bubble = this.add.circle(
      Phaser.Math.Between(10, this.tower.worldWidth - 10), this.lavaY + 14,
      Phaser.Math.Between(3, 7), 0xffcc33
    ).setDepth(11);
    this.tweens.add({
      targets: bubble, y: bubble.y - 18, scale: 1.6, alpha: 0, duration: 600,
      onComplete: () => bubble.destroy(),
    });
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.levelComplete || !this.scene.get('RaceScene').started) return;

    // The lava rises (faster and faster)
    this.lavaTime += delta / 1000;
    this.lavaY -= lavaSpeed(this.lavaTime) * (delta / 1000);
    this.lavaTop.setY(this.lavaY);
    this.lavaTop.tilePositionX += 0.6; // the waves move
    this.lavaBody.setY(this.lavaY + 38);

    // How high we climbed, from 0 (the ground) to 1 (the flag), for the bars at the top
    const start = this.tower.heroStart.y;
    this.climbFrac = Phaser.Math.Clamp((start - this.hero.y) / (start - this.tower.goal.y), 0, 1);

    // Did the lava touch our feet?
    if (this.hero.body.bottom > this.lavaY + 8) this.touchLava();

    this.updateWarning();
  }

  // How high we are, in meters
  heroMeters() {
    return Math.max(0, Math.round((GROUND_Y - this.hero.body.bottom) / PIXELS_PER_METER));
  }

  // The warning at the bottom: far away = how many meters; close = RUN!
  updateWarning() {
    const distance = this.lavaY - this.hero.body.bottom;
    if (distance < 140) {
      this.lavaWarning.setText('🔥 ¡SUBE RÁPIDO! 🔥').setColor('#ff4422');
      this.lavaWarning.setAlpha(Math.floor(this.time.now / 200) % 2 ? 1 : 0.5);
    } else {
      this.lavaWarning.setText(`🌋 La lava está a ${Math.round(distance / PIXELS_PER_METER)} m`)
        .setColor('#ffaa33').setAlpha(1);
    }
  }

  // OUCH! The lava burns: we lose a life (or the shield), and jump out of it
  touchLava() {
    const before = this.hero.lives;
    // (takeDamage knows about the shield, the invincible mode and the blinking)
    this.hero.takeDamage();
    this.hud.updateLives(this.hero.lives);
    this.cameras.main.shake(200, 0.01);
    this.showFloatingText(this.hero.x, this.hero.y - 30, before > this.hero.lives ? '¡Quema! -1 ❤' : '¡Uf!');

    if (this.hero.lives <= 0 && !isGodMode(this.registry)) {
      // No lives left: we are out
      this.levelComplete = true;
      this.hero.setVelocity(0, 0);
      this.hero.body.setAllowGravity(false);
      this.hero.setTint(0x555555);
      this.scene.get('RaceScene').playerOut(this.race.player);
      return;
    }

    // The hero jumps out onto the first platform that is safe (well above the lava),
    // and the lava goes down a little, so we have time to breathe
    const safe = this.tower.platforms
      .filter((p) => p.y < this.lavaY - 120)
      .reduce((best, p) => (!best || p.y > best.y ? p : best), null);
    if (safe) {
      this.hero.setPosition(safe.x + safe.width / 2, safe.y - 40);
      this.hero.setVelocity(0, 0);
      this.powerupManager.spawnCollectParticles(this.hero.x, this.hero.y);
    }
    this.lavaY += 60;
  }

  // We reached the flag at the top: WE WIN!
  reachGoal() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.hero.setVelocity(0, 0);
    this.hero.body.setAllowGravity(false);
    playSound('ganar');
    this.add.text(this.midX, 250, '¡Llegaste arriba!', {
      fontFamily: 'Arial', fontSize: '32px', color: '#ffff00',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.scene.get('RaceScene').playerWon(this.race.player, 'Llegó arriba antes que la lava');
  }

  // The ground covers the whole tower, so we can't fall... but just in case
  heroFell() {
    this.hero.setPosition(this.tower.heroStart.x, this.tower.heroStart.y);
    this.hero.setVelocity(0, 0);
  }
}

// The top of the lava: orange waves, with yellow spots of very hot lava
function makeLavaTexture(scene) {
  if (scene.textures.exists('lava-top')) return;
  const gfx = scene.add.graphics();
  const wave = [];
  for (let x = 0; x <= 64; x += 4) wave.push({ x, y: 8 + Math.sin((x / 64) * Math.PI * 2) * 5 });
  // Orange waves on top...
  gfx.fillStyle(0xff7a00);
  gfx.fillPoints([...wave, { x: 64, y: 40 }, { x: 0, y: 40 }], true);
  // ...and the red-orange lava under them
  gfx.fillStyle(0xe02800);
  gfx.fillRect(0, 22, 64, 18);
  gfx.fillStyle(0xffdd33);
  gfx.fillCircle(14, 16, 3);
  gfx.fillCircle(44, 20, 2);
  gfx.fillCircle(52, 12, 2);
  gfx.generateTexture('lava-top', 64, 40);
  gfx.destroy();
}

// Two copies, one for each half (Phaser needs a different name for each)
export class LavaLeftScene extends LavaLevelScene {
  constructor() {
    super('LavaLeft');
  }
}
export class LavaRightScene extends LavaLevelScene {
  constructor() {
    super('LavaRight');
  }
}
