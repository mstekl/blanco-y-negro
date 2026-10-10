// SurvivalScene.js — SUPERVIVENCIA: how long can you last?
// (from the sala: the SUPERVIVENCIA button, or V)
// We play alone in a closed arena (two screens wide, no pits). The villains
// come in WAVES ("oleadas") from both sides, and every wave is bigger:
//   - waves 1 and 2: only MR.1 walkers
//   - from wave 3:   MR.2 shooters too
//   - from wave 5:   MR.3 on his eraser tank too
// A new wave comes when all the villains are defeated (or after 25 seconds).
// We have 3 lives and the Color Pencil from the start. Every 3 waves a shield
// shows up on a platform. When we lose the 3 lives, the game says how long we
// lasted, and the best time is saved (the record).
//
// This scene is a copy of the normal level (LevelScene) with some changes:
// its own arena, the waves, a clock, and no "start the level again".

import Phaser from 'phaser';
import LevelScene from './LevelScene.js';
import LevelManager from '../managers/LevelManager.js';
import { levels } from '../data/levels.js';
import { addCoins, makeCoinTexture } from '../data/coins.js';
import { reportMission } from '../data/missions.js';

const RECORD_KEY = 'blancoYNegro.supervivencia';
const ARENA_WIDTH = 1600;
const WAVE_MAX_TIME = 25000; // after 25 seconds the next wave comes anyway

// The arena: flat ground everywhere (no pits) and floating platforms to jump on
const ARENA = {
  id: 0,
  name: 'Supervivencia',
  worldWidth: ARENA_WIDTH,
  worldHeight: 600,
  backgroundColor: '#888888',
  saturation: 0.3,
  heroStart: { x: 800, y: 450 },
  goal: { x: -200, y: 504 }, // far away and hidden: there is no goal here
  platforms: [
    { x: 0, y: 568, width: 800, type: 'ground' },
    { x: 800, y: 568, width: 800, type: 'ground' },
    { x: 180, y: 440, width: 128, type: 'platform' },
    { x: 430, y: 350, width: 128, type: 'platform' },
    { x: 704, y: 270, width: 192, type: 'platform' },
    { x: 1040, y: 350, width: 128, type: 'platform' },
    { x: 1290, y: 440, width: 128, type: 'platform' },
  ],
  enemies: [],
  powerups: [],
  // The same city in the background as level 1
  buildings: levels[0].buildings,
};

// The best time (in seconds) saved in the browser
function loadBest() {
  try {
    return parseInt(window.localStorage.getItem(RECORD_KEY), 10) || 0;
  } catch (e) {
    return 0;
  }
}
function saveBest(seconds) {
  try {
    window.localStorage.setItem(RECORD_KEY, String(seconds));
  } catch (e) {
    // Storage blocked: the record only lasts until the page is reloaded
  }
}

// 83 seconds → "1:23"
function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

class SurvivalScene extends LevelScene {
  constructor() {
    super('SurvivalScene');
  }

  chooseLevelData() {
    return ARENA;
  }

  create() {
    // A fresh start: 3 lives (the normal levels keep lives and points in the registry)
    this.registry.set('lives', 3);
    this.registry.set('score', 0);
    super.create();

    this.goalFlag.setVisible(false);
    this.goalFlag.body.enable = false;
    // The Color Pencil from the start: we will need it!
    this.hero.hasColorGun = true;
    this.hud.showColorGun(true);
    this.hud.levelText.setText('SUPERVIVENCIA');
    this.hud.scoreText.setVisible(false);

    // The clock and the wave number, at the top in the middle
    this.clockText = this.add.text(400, 12, '', {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    this.add.text(400, 40, `🏆 Récord: ${formatTime(loadBest())}`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffdd00',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.elapsed = 0;       // milliseconds we have survived
    this.wave = 0;
    this.waveTime = 0;      // milliseconds since this wave started
    this.spawning = 0;      // villains of this wave that haven't come out yet
    this.lastReport = 0;    // seconds we last told the missions about
    this.ended = false;
    this.leaving = false;

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('TitleScene');
      if (!this.ended) return;
      if (event.key === 'Enter') this.goTo('TitleScene');
      else if (event.code === 'KeyR') this.goTo('SurvivalScene');
    });

    // The first wave comes a moment after we start
    this.time.delayedCall(1500, () => this.startWave());
  }

  // A new wave of villains, coming from both sides of the arena
  startWave() {
    if (this.ended) return;
    this.wave += 1;
    this.waveTime = 0;
    reportMission('oleada', this.wave);

    const count = 2 + this.wave; // wave 1 = 3 villains, wave 2 = 4...
    this.spawning = count;
    for (let i = 0; i < count; i++) {
      // They don't all come at once: one every 0.7 seconds
      this.time.delayedCall(i * 700, () => this.spawnVillain(i));
    }

    // Every 3 waves, a shield on a random platform (a little help!)
    if (this.wave % 3 === 0) {
      const plat = Phaser.Utils.Array.GetRandom(ARENA.platforms.filter((p) => p.type !== 'ground'));
      this.powerupManager.spawnPowerups([{ type: 'shield', x: plat.x + plat.width / 2, y: plat.y - 30 }]);
    }

    // "OLEADA 3" in big letters
    const text = this.add.text(400, 200, `OLEADA ${this.wave}`, {
      fontFamily: 'Arial', fontSize: '56px', fontStyle: 'bold', color: '#ff5555',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({
      targets: text, scale: 1.3, alpha: 0, delay: 600, duration: 700,
      onComplete: () => text.destroy(),
    });
  }

  // One villain comes in from the left or the right edge
  spawnVillain(i) {
    if (this.ended) return;
    this.spawning -= 1;
    let type = 'mr1';
    if (this.wave >= 5 && i % 4 === 3) type = 'mr3';
    else if (this.wave >= 3 && i % 3 === 2) type = 'mr2';

    const fromLeft = i % 2 === 0;
    LevelManager.spawnEnemies(this, this.enemies, [{
      type,
      x: fromLeft ? 60 : ARENA_WIDTH - 60,
      y: type === 'mr3' ? 500 : 520,
      // Every wave the villains are a little faster, and shoot more often
      speed: Math.min(200, 90 + this.wave * 8),
      fireRate: Math.max(900, 2200 - this.wave * 150),
      patrolMin: 0,
      patrolMax: ARENA_WIDTH,
      direction: fromLeft ? 'right' : 'left',
    }]);
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.ended || this.wave === 0) return;

    this.elapsed += delta;
    this.waveTime += delta;
    const seconds = Math.floor(this.elapsed / 1000);
    this.clockText.setText(`⏱ ${formatTime(seconds)}   ·   Oleada ${this.wave}`);

    // Every 10 seconds we tell the missions how long we lasted
    if (seconds >= this.lastReport + 10) {
      this.lastReport = seconds;
      reportMission('supervivencia', seconds);
    }

    // Next wave: when every villain is defeated, or when the wave took too long
    const alive = this.enemies.getChildren().filter((e) => e.active && !e.isDefeated).length;
    if (this.spawning === 0 && (alive === 0 || this.waveTime > WAVE_MAX_TIME)) this.startWave();
  }

  // Losing a life does NOT start the level again here: we keep fighting!
  // (The hero blinks for a moment and nothing can hurt it, see Hero.takeDamage)
  restartLevel() {}

  // There are no pits, but just in case: back to the middle
  heroFell() {
    this.hero.setPosition(ARENA.heroStart.x, ARENA.heroStart.y);
    this.hero.setVelocity(0, 0);
  }

  // There is no goal in the arena
  reachGoal() {}

  // We lost the 3 lives: how long did we last?
  gameOver() {
    if (this.ended) return;
    this.ended = true;
    this.levelComplete = true;
    this.hero.setVelocity(0, 0);
    this.hero.setTint(0x555555);

    const seconds = Math.floor(this.elapsed / 1000);
    const best = loadBest();
    const newRecord = seconds > best;
    if (newRecord) saveBest(seconds);
    // Coins: 1 for every 10 seconds, and 2 for every wave we passed
    const coins = Math.floor(seconds / 10) + (this.wave - 1) * 2;
    if (coins > 0) addCoins(coins);
    reportMission('supervivencia', seconds);

    this.showResult(seconds, newRecord ? null : best, coins);
  }

  showResult(seconds, oldBest, coins) {
    const parts = [
      this.add.rectangle(400, 300, 540, 270, 0x000000, 0.85).setStrokeStyle(4, 0xffffff),
      this.add.text(400, 200, '¡TE ATRAPARON!', {
        fontFamily: 'Arial', fontSize: '42px', fontStyle: 'bold', color: '#ff5555',
        stroke: '#000000', strokeThickness: 6,
      }).setOrigin(0.5),
      this.add.text(400, 250, `Aguantaste ${formatTime(seconds)}  ·  Llegaste a la oleada ${this.wave}`, {
        fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
      }).setOrigin(0.5),
      this.add.text(400, 282, oldBest === null ? '🏆 ¡NUEVO RÉCORD!' : `🏆 Récord: ${formatTime(oldBest)}`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffdd00',
      }).setOrigin(0.5),
    ];
    if (coins > 0) {
      makeCoinTexture(this);
      parts.push(this.add.image(352, 316, 'coin'));
      parts.push(this.add.text(368, 316, `+${coins} monedas`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(0, 0.5));
    }
    parts.push(...this.resultButton(285, '🔁 OTRA VEZ [R]', 0x66ee88, () => this.goTo('SurvivalScene')));
    parts.push(...this.resultButton(515, '🏠 SALA [ENTER]', 0xffffff, () => this.goTo('TitleScene')));
    // Everything stays still on the screen, even if the camera moves
    parts.forEach((p) => p.setScrollFactor(0).setDepth(200));
  }

  resultButton(x, label, color, onClick) {
    const box = this.add.rectangle(x, 370, 210, 48, 0x222222)
      .setStrokeStyle(3, color).setInteractive({ useHandCursor: true });
    box.on('pointerdown', onClick);
    const text = this.add.text(x, 370, label, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    return [box, text];
  }

  goTo(sceneName) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // "OTRA VEZ" starts this same scene again from zero
      if (sceneName === 'SurvivalScene') this.scene.restart();
      else this.scene.start(sceneName);
    });
  }
}

export default SurvivalScene;
