// SurvivalScene.js — SUPERVIVENCIA: how long can you last?
// (from the sala: the SUPERVIVENCIA button, or V)
// We play alone in a closed arena (two screens wide, no pits). The villains
// come in WAVES ("oleadas") from both sides, and every wave is bigger:
//   - waves 1 and 2: only MR.1 walkers
//   - from wave 3:   MR.2 shooters too
//   - from wave 5:   MR.3 on his eraser tank too
// A new wave comes when all the villains are defeated (or after 25 seconds).
// ONLINE (2 to 4 players, each on their own device): the same waves for everybody,
// and the last one still alive wins!
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
import { playSound } from '../audio/Sound.js';
import { takeShopItems } from '../data/shop.js';

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

  // data.net and data.players = playing ONLINE with friends (see OnlineScene.js)
  init(data) {
    super.init(data);
    this.net = data.net || null;
    this.startData = data;
  }

  chooseLevelData() {
    return ARENA;
  }

  create() {
    // A fresh start: 3 lives (the normal levels keep lives and points in the registry)
    this.registry.set('lives', 3);
    this.registry.set('score', 0);
    this.won = false;
    // One of each thing we bought in the TIENDA (the level gives them to the hero)
    takeShopItems(this.registry);
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
      else if (event.code === 'KeyR') this.playAgain();
    });

    if (this.net) this.setupOnline();

    // The first wave comes a moment after we start
    this.time.delayedCall(1500, () => this.startWave());
  }

  // A new wave of villains, coming from both sides of the arena
  startWave() {
    if (this.ended) return;
    this.wave += 1;
    this.waveTime = 0;
    reportMission('oleada', this.wave);
    playSound('oleada');

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
    if (this.net) this.updateOnline(delta);
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
    playSound('perder');

    const seconds = Math.floor(this.elapsed / 1000);
    const best = loadBest();
    const newRecord = seconds > best;
    if (newRecord) saveBest(seconds);
    // Coins: 1 for every 10 seconds, and 2 for every wave we passed
    const coins = Math.floor(seconds / 10) + (this.wave - 1) * 2;
    if (coins > 0) addCoins(coins);
    reportMission('supervivencia', seconds);

    // Online: we tell our friends we are out (the last one still alive wins)
    let status = '';
    if (this.net) {
      this.net.send({ t: 'perdi' });
      const alive = this.aliveRivals();
      status = alive.length === 1 ? `¡Ganó ${alive[0].name}!` : 'Los demás siguen jugando...';
    }
    this.showResult({
      title: '¡TE ATRAPARON!', color: '#ff5555', seconds, oldBest: newRecord ? null : best, coins, status,
    });
  }

  // The result panel: the title, how long we lasted, the record, the coins and the buttons
  showResult({ title, color, seconds, oldBest, coins, status = '' }) {
    const parts = [
      this.add.rectangle(400, 300, 540, 290, 0x000000, 0.85).setStrokeStyle(4, 0xffffff),
      this.add.text(400, 195, title, {
        fontFamily: 'Arial', fontSize: '42px', fontStyle: 'bold', color,
        stroke: '#000000', strokeThickness: 6,
      }).setOrigin(0.5),
      this.add.text(400, 245, `Aguantaste ${formatTime(seconds)}  ·  Llegaste a la oleada ${this.wave}`, {
        fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
      }).setOrigin(0.5),
      this.add.text(400, 277, oldBest === null ? '🏆 ¡NUEVO RÉCORD!' : `🏆 Récord: ${formatTime(oldBest)}`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffdd00',
      }).setOrigin(0.5),
    ];
    if (coins > 0) {
      makeCoinTexture(this);
      parts.push(this.add.image(352, 311, 'coin'));
      parts.push(this.add.text(368, 311, `+${coins} monedas`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(0, 0.5));
    }
    const again = this.net ? '🔁 REVANCHA [R]' : '🔁 OTRA VEZ [R]';
    parts.push(...this.resultButton(285, again, 0x66ee88, () => this.playAgain()));
    parts.push(...this.resultButton(515, '🏠 SALA [ENTER]', 0xffffff, () => this.goTo('TitleScene')));
    // A line under the buttons (online: who won, who wants the REVANCHA...)
    this.statusText = this.add.text(400, 418, status, {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffdd33',
    }).setOrigin(0.5);
    parts.push(this.statusText);
    // Everything stays still on the screen, even if the camera moves
    parts.forEach((p) => p.setScrollFactor(0).setDepth(200));
  }

  resultButton(x, label, color, onClick) {
    const box = this.add.rectangle(x, 368, 210, 48, 0x222222)
      .setStrokeStyle(3, color).setInteractive({ useHandCursor: true });
    box.on('pointerdown', onClick);
    const text = this.add.text(x, 368, label, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    return [box, text];
  }

  // OTRA VEZ (alone) or REVANCHA (online: everybody who is still here must want it)
  playAgain() {
    if (!this.net) {
      this.goTo('SurvivalScene');
      return;
    }
    if (this.wantRematch || !this.presentRivals().length) return;
    this.wantRematch = true;
    this.net.send({ t: 'revancha' });
    this.checkRematch();
  }

  goTo(sceneName) {
    if (this.leaving) return;
    this.leaving = true;
    // Leaving to the sala online: we hang up
    if (sceneName !== 'SurvivalScene' && this.net) this.net.close();
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // "OTRA VEZ" starts this same scene again from zero (online: with the friends who stayed)
      if (sceneName !== 'SurvivalScene') this.scene.start(sceneName);
      else if (!this.net) this.scene.restart({});
      else {
        const players = this.startData.players.filter((p) => !this.net.gone.has(p.id));
        this.scene.restart({ ...this.startData, players });
      }
    });
  }

  // ---------------------------------------------------------------
  // ONLINE: everybody plays in the same arena, each one on their own device,
  // with the same waves. The last one still alive wins!
  // ---------------------------------------------------------------
  setupOnline() {
    this.rivals = this.startData.players
      .filter((p) => p.id !== this.net.myId && !this.net.gone.has(p.id))
      .map((p) => ({ ...p, lives: 3, wave: 0, out: false, gone: false, wantsRematch: false }));
    this.wantRematch = false;
    this.sendTimer = 0;
    this.rivals.forEach((r) => this.net.lastHeard.set(r.id, Date.now()));

    // How everybody is doing: one line for each player, under the clock
    const rows = 1 + this.rivals.length;
    this.add.rectangle(400, 62 + rows * 10, 330, rows * 20 + 8, 0x000000, 0.55)
      .setScrollFactor(0).setDepth(99);
    const style = { fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff' };
    const me = this.startData.players.find((p) => p.id === this.net.myId);
    this.myRow = this.add.text(250, 72, '', { ...style, color: '#44aaff' }).setScrollFactor(0).setDepth(100);
    this.myName = me ? me.name : 'Tú';
    this.rivals.forEach((r, i) => {
      r.row = this.add.text(250, 92 + i * 20, '', style).setScrollFactor(0).setDepth(100);
    });

    this.net.onMessage = (msg) => this.onFriendMessage(msg);
    this.net.onPlayerLeft = (id) => this.friendLeft(id);
    this.net.onClose = () => this.rivals.forEach((r) => this.friendLeft(r.id));
  }

  updateOnline(delta) {
    // 8 seconds without news from a friend: they are gone
    this.rivals.forEach((r) => {
      if (!r.gone && Date.now() - this.net.lastHeard.get(r.id) > 8000) this.net.dropped(r.id);
    });
    // We tell everybody how we are (and "I'm still here" on the result screen)
    this.sendTimer -= delta;
    if (this.sendTimer <= 0) {
      this.sendTimer = this.ended ? 2000 : 300;
      if (this.ended) this.net.send({ t: 'sigo' });
      else this.net.send({ t: 'progreso', lives: this.hero.lives, wave: this.wave });
    }

    const hearts = (n) => '❤'.repeat(Math.max(0, n));
    this.myRow.setText(`${this.myName}:  ${this.ended && !this.won ? '❌ fuera' : `${hearts(this.hero.lives)}  Oleada ${this.wave}`}`);
    this.rivals.forEach((r) => {
      let text = `${hearts(r.lives)}  Oleada ${r.wave}`;
      if (r.gone) text = 'se fue';
      else if (r.out) text = '❌ fuera';
      r.row.setText(`${r.name}:  ${text}`);
    });
  }

  onFriendMessage(msg) {
    const r = this.rivals.find((rival) => rival.id === msg.from);
    if (!r || r.gone) return;
    if (msg.t === 'progreso') {
      r.lives = msg.lives;
      r.wave = msg.wave;
    } else if (msg.t === 'perdi') {
      r.out = true;
      r.lives = 0;
      this.checkLastAlive();
    } else if (msg.t === 'gane') {
      if (this.statusText) this.statusText.setText(`¡Ganó ${r.name}!`);
    } else if (msg.t === 'revancha') {
      r.wantsRematch = true;
      if (this.statusText && !this.wantRematch) this.statusText.setText(`¡${r.name} quiere la revancha! Presiona R`);
      this.checkRematch();
    }
  }

  aliveRivals() {
    return this.rivals.filter((r) => !r.out && !r.gone);
  }

  presentRivals() {
    return this.rivals.filter((r) => !r.gone);
  }

  // Everybody else is out, and we are still alive: WE WIN!
  checkLastAlive() {
    if (this.ended || this.aliveRivals().length > 0 || !this.rivals.some((r) => r.out)) return;
    this.ended = true;
    this.won = true;
    this.levelComplete = true;
    this.hero.setVelocity(0, 0);
    playSound('ganar');
    this.net.send({ t: 'gane' });

    const seconds = Math.floor(this.elapsed / 1000);
    const best = loadBest();
    if (seconds > best) saveBest(seconds);
    // The prize: the normal survival coins, and more for every friend we beat
    const coins = Math.floor(seconds / 10) + (this.wave - 1) * 2 + 10 + 5 * this.rivals.length;
    addCoins(coins);
    reportMission('supervivencia', seconds);
    reportMission('online');
    reportMission('ganar');
    this.showResult({
      title: '¡GANASTE!', color: '#66ee88', seconds, oldBest: seconds > best ? null : best, coins,
      status: 'Eres el último que sigue vivo',
    });
  }

  checkRematch() {
    const present = this.presentRivals();
    if (!this.wantRematch) return;
    const waiting = present.filter((r) => !r.wantsRematch);
    if (this.statusText) this.statusText.setText(waiting.length ? `Esperando a ${waiting.map((r) => r.name).join(', ')}...` : '');
    if (present.length > 0 && waiting.length === 0) this.goTo('SurvivalScene');
  }

  // A friend closed the game or lost the internet
  friendLeft(id) {
    const r = this.rivals.find((rival) => rival.id === id);
    if (!r || r.gone || this.leaving) return;
    r.gone = true;
    if (!this.presentRivals().length) {
      // Nobody left to play with
      if (this.statusText) this.statusText.setText('Todos se fueron');
      if (!this.ended) this.showCheatMessage('Todos se fueron: ahora juegas solo');
      return;
    }
    this.checkLastAlive();
    this.checkRematch();
  }
}

export default SurvivalScene;
