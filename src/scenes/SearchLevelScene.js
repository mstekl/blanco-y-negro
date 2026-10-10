// SearchLevelScene.js — One half of the screen in the BÚSQUEDA mode (search).
// Two players, split screen (like the race), but here we don't run to the end:
// we have to FIND 5 colored pencils hidden all over the map of level 1:
//   GOOD pencils: rojo, azul, verde, violeta, naranja → find all 5 to win!
//   BAD pencils:  amarillo, rosa, marrón → grabbing one takes away 1 life
// We have 3 lives. Losing all 3 means the OTHER player wins.
// We grab a pencil standing next to it: player 1 with Z, player 2 with ↓.
// Each half hides the pencils in DIFFERENT places (they are shuffled), so
// looking at the other half doesn't help!
//
// This scene is a copy of the normal level (LevelScene) with some changes:
// no villains, no goal flag, no coins, and the pencils.

import Phaser from 'phaser';
import LevelScene from './LevelScene.js';
import { isGodMode } from '../utils/constants.js';

// The 5 pencils we must find, and the 3 that trick us
export const GOOD_PENCILS = [
  { name: 'Rojo', color: 0xff2222 },
  { name: 'Azul', color: 0x2266ff },
  { name: 'Verde', color: 0x22bb33 },
  { name: 'Violeta', color: 0x9933ff },
  { name: 'Naranja', color: 0xff8800 },
];
const BAD_PENCILS = [
  { name: 'Amarillo', color: 0xffdd00 },
  { name: 'Rosa', color: 0xff77cc },
  { name: 'Marrón', color: 0x8b5a2b },
];
// How many of EACH bad color are hidden in the map
const BAD_COPIES = 2;
// How close (in pixels) we must be to a pencil to grab it
const GRAB_DISTANCE = 45;
const LIVES = 3;

class SearchLevelScene extends LevelScene {
  create() {
    // First, build the normal level (map, hero, our half of the screen, HUD...)
    super.create();

    // No villains, no coins and no goal flag: this is about searching!
    this.enemies.clear(true, true);
    this.coins.clear(true, true);
    this.goalFlag.setVisible(false);
    this.goalFlag.body.enable = false;
    // No shooting either (↓ is player 2's grab key, not a shoot key here).
    // We also take the shoot keys away from the hero: otherwise the hero reads ↓
    // first (as "shoot") and uses up the press, and the grab never sees it!
    this.hero.hasColorGun = false;
    this.hero.keys.shoot = [];

    this.hero.lives = LIVES;
    this.hud.showHearts();
    this.hud.updateLives(this.hero.lives);
    this.hud.levelText.setText('');

    this.grabKey = this.input.keyboard.addKey(this.race.grabKey);
    this.foundCount = 0;
    this.createFoundBar();
    this.hidePencils();
  }

  // Top middle of our half: 5 empty slots that fill up with the pencils we find
  createFoundBar() {
    this.slots = GOOD_PENCILS.map((pencil, i) => {
      const x = 200 + (i - 2) * 28;
      this.add.rectangle(x, 24, 22, 30, 0x000000, 0.5)
        .setStrokeStyle(2, pencil.color).setScrollFactor(0).setDepth(100);
      // The pencil picture is hidden until we find that color
      return this.add.image(x, 24, pencilTexture(this, pencil.color))
        .setScale(0.6).setScrollFactor(0).setDepth(101).setVisible(false);
    });
  }

  // Hide the pencils all over the map: on top of every floating platform and
  // along the ground. The places are SHUFFLED, so they are different every
  // time, and different in each half of the screen.
  hidePencils() {
    const spots = [];
    for (const plat of this.levelData.platforms) {
      if (plat.type === 'ground') {
        // Along the ground, one spot every 260 pixels (but not right at the start)
        for (let x = plat.x + 130; x < plat.x + plat.width; x += 260) {
          if (x > 250) spots.push({ x, y: plat.y - 26 });
        }
      } else {
        spots.push({ x: plat.x + plat.width / 2, y: plat.y - 26 });
      }
    }
    Phaser.Utils.Array.Shuffle(spots);

    // 5 good ones and 2 of each bad color
    const toHide = [
      ...GOOD_PENCILS.map((p) => ({ ...p, good: true })),
      ...BAD_PENCILS.flatMap((p) => Array(BAD_COPIES).fill({ ...p, good: false })),
    ];

    this.pencils = toHide.slice(0, spots.length).map((pencil, i) => {
      const image = this.add.image(spots[i].x, spots[i].y, pencilTexture(this, pencil.color))
        .setDepth(3);
      // Pencils float a little and wiggle, so they catch the eye
      this.tweens.add({
        targets: image, y: spots[i].y - 6, angle: 8, duration: 700 + Math.random() * 300,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      return { ...pencil, image };
    });
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.levelComplete || !this.scene.get('RaceScene').started) return;

    if (Phaser.Input.Keyboard.JustDown(this.grabKey)) this.grabPencil();
  }

  // We pressed the grab key: is there a pencil close enough?
  grabPencil() {
    const near = this.pencils.find((p) => p.image.active
      && Phaser.Math.Distance.Between(this.hero.x, this.hero.y, p.image.x, p.image.y) < GRAB_DISTANCE);
    if (!near) return;

    near.image.destroy();
    if (near.good) this.foundGood(near);
    else this.foundBad(near);
  }

  // A good pencil! It goes to its slot at the top
  foundGood(pencil) {
    this.foundCount += 1;
    this.slots[GOOD_PENCILS.findIndex((p) => p.name === pencil.name)].setVisible(true);
    this.showFloatingText(pencil.image.x, pencil.image.y - 20, `¡${pencil.name}!`);
    this.powerupManager.spawnCollectParticles(pencil.image.x, pencil.image.y);

    if (this.foundCount === GOOD_PENCILS.length) {
      // All 5! We win the search
      this.levelComplete = true;
      this.hero.setVelocity(0, 0);
      this.scene.get('RaceScene').playerWon(this.race.player, 'Encontró los 5 lápices');
    }
  }

  // A tricky pencil: we lose a life
  foundBad(pencil) {
    this.showFloatingText(pencil.image.x, pencil.image.y - 20, `¡${pencil.name} no! -1 ❤`);
    this.cameras.main.shake(200, 0.01);
    if (isGodMode(this.registry)) return; // invincible mode: it doesn't hurt

    this.hero.lives -= 1;
    this.hud.updateLives(this.hero.lives);
    if (this.hero.lives <= 0) {
      // No lives left: we are out, and the other player wins
      this.levelComplete = true;
      this.hero.setVelocity(0, 0);
      this.hero.setTint(0x555555);
      this.scene.get('RaceScene').playerOut(this.race.player);
    }
  }

  // There is no goal flag in the search
  reachGoal() {}

  // Falling into a pit doesn't cost a life here (only bad pencils do):
  // we just go back to the start, and the pencils we found stay found
  heroFell() {
    this.hero.setPosition(this.levelData.heroStart.x, this.levelData.heroStart.y);
    this.hero.setVelocity(0, 0);
  }
}

// A colored pencil picture (one for each color, made the first time we need it)
function pencilTexture(scene, color) {
  const key = `search-pencil-${color.toString(16)}`;
  if (scene.textures.exists(key)) return key;
  const gfx = scene.add.graphics();
  // A black outline, so every color can be seen on the gray world
  gfx.fillStyle(0x000000);
  gfx.fillRect(1, 0, 16, 34);
  gfx.fillTriangle(1, 33, 17, 33, 9, 47);
  // The eraser (white) and the metal band (gray)
  gfx.fillStyle(0xffffff);
  gfx.fillRect(3, 2, 12, 6);
  gfx.fillStyle(0xaaaaaa);
  gfx.fillRect(3, 8, 12, 4);
  // The colored body
  gfx.fillStyle(color);
  gfx.fillRect(3, 12, 12, 21);
  // The sharpened wood and the colored tip
  gfx.fillStyle(0xf0c890);
  gfx.fillTriangle(3, 33, 15, 33, 9, 44);
  gfx.fillStyle(color);
  gfx.fillTriangle(7, 40, 11, 40, 9, 44);
  gfx.generateTexture(key, 18, 48);
  gfx.destroy();
  return key;
}

// Two copies, one for each half (Phaser needs a different name for each)
export class SearchLeftScene extends SearchLevelScene {
  constructor() {
    super('SearchLeft');
  }
}
export class SearchRightScene extends SearchLevelScene {
  constructor() {
    super('SearchRight');
  }
}
