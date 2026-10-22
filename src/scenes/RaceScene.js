// RaceScene.js — The race!
// There are 2 ways to play (we choose in ModeChoiceScene.js):
//   - OFFLINE ('dos'): two players on the same screen, split in two halves:
//       LEFT half:  player 1, plays with W A D (and S to shoot)
//       RIGHT half: player 2, plays with the arrows (and ↓ to shoot)
//   - MÁQUINA ('maquina'): we play alone on the whole screen, against the
//       machine (Bot.js), that we see as a ghost in our level
// Against the machine, bars at the top show how far we are, and how far the machine is.
// Each half (or the whole screen) is a copy of the normal level scene (LevelScene), with
// its own hero, enemies and camera. This scene sits ON TOP: it draws the line
// in the middle, the bars, does the 3-2-1 countdown and says who won.
// The first player to REACH LEVEL 4 (finish level 3) wins the race!
// ESC goes back to the sala.

import Phaser from 'phaser';
import LevelScene from './LevelScene.js';
import { RaceBot } from '../maquina/Bot.js';
import { loadProfile } from '../data/profile.js';
import { addCoins, makeCoinTexture } from '../data/coins.js';
import { earnStars } from '../data/pass.js';
import { playSound } from '../audio/Sound.js';
import { forgetWeather } from '../managers/WeatherManager.js';

// We win when we finish this many levels (3 levels done = we got to level 4)
const LEVELS_TO_WIN = 3;

// Coins we win when we beat the machine (more if it was harder)
const COIN_PRIZES = { facil: 5, normal: 10, dificil: 20 };

// Two copies of the level scene, one for each half.
// Phaser needs a different name (key) for each copy, that's why there are two.
export class RaceLeftScene extends LevelScene {
  constructor() {
    super('RaceLeft');
  }
}
export class RaceRightScene extends LevelScene {
  constructor() {
    super('RaceRight');
  }
}

// What is different for each player
const PLAYERS = [
  {
    player: 1, side: 0, scene: 'RaceLeft', controls: 'wasd', color: '#44aaff',
    help: 'A D Mover  |  W Saltar', shootKey: 'S',
  },
  {
    player: 2, side: 1, scene: 'RaceRight', controls: 'arrows', color: '#ff9933',
    help: '← → Mover  |  ↑ Saltar', shootKey: '↓',
  },
];
// Alone on the whole screen (against the machine): the normal keys
const SOLO = {
  player: 1, scene: 'RaceLeft', controls: 'normal', full: true, color: '#44aaff',
  help: '← → Mover  |  ↑ Saltar', shootKey: 'Z',
};

class RaceScene extends Phaser.Scene {
  constructor() {
    super('RaceScene');
  }

  // data.how   = 'dos' (two on this screen) or 'maquina'
  // data.level = how good the machine is ('facil', 'normal', 'dificil')
  init(data) {
    this.how = data.how === 'maquina' ? 'maquina' : 'dos';
    this.solo = this.how === 'maquina';
    this.players = this.solo ? [SOLO] : PLAYERS;
    this.level = data.level;
    this.bot = null;
    // We keep everything, so the REVANCHA can start the same game again
    this.startData = data;
  }

  create() {
    // The level scenes look at "started" to know if they can move yet
    this.started = false;
    this.finished = false;
    this.leaving = false;
    // A new race = new weather in every level (both halves share it, see WeatherManager.js)
    forgetWeather(this.registry, 'carrera:');

    // The machine must be ready BEFORE the level starts (the level draws its ghost)
    if (this.solo) this.bot = new RaceBot(this.level, LEVELS_TO_WIN);

    // Start both halves (or the whole screen), each with its own player data
    this.players.forEach((p) => {
      this.scene.launch(p.scene, { levelIndex: 0, race: { ...p, goalLevel: LEVELS_TO_WIN }, players: this.players });
    });
    // This scene must be drawn ON TOP of the levels
    this.scene.bringToTop();

    if (this.solo) {
      this.createBars();
    } else {
      this.createSplitScreen();
    }

    this.add.text(400, 598, 'ESC: salir', {
      fontFamily: 'Arial', fontSize: '11px', color: '#888888',
      backgroundColor: '#000000',
    }).setOrigin(0.5, 1);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.leave();
      else if (event.key === 'Enter' && this.finished) this.leave();
      else if (event.code === 'KeyR' && this.finished) this.restartRace();
    });

    this.countdown();
  }

  // OFFLINE: the line in the middle, the names, and the buttons for two players
  createSplitScreen() {
    // On an iPad or phone: tell the screen buttons to give each half its own buttons
    // (and to go back to the normal ones when this scene closes)
    window.dispatchEvent(new CustomEvent('dos-jugadores', { detail: { mode: 'carrera' } }));
    this.events.once('shutdown', () => window.dispatchEvent(new Event('un-jugador')));

    // The line in the middle that splits the screen
    this.add.rectangle(400, 300, 6, 600, 0xffffff);
    this.add.rectangle(400, 300, 2, 600, 0x000000);

    // "JUGADOR 1" and "JUGADOR 2" in the top-left corner of each half
    this.players.forEach((p) => {
      this.add.text(p.side * 400 + 12, 10, `JUGADOR ${p.player}`, {
        fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: p.color,
        stroke: '#000000', strokeThickness: 4,
      });
    });
  }

  // AGAINST THE MACHINE: two bars at the top, one for us and one for the machine,
  // that fill up as we get closer to winning
  createBars() {
    const me = loadProfile();
    this.add.rectangle(400, 68, 500, 54, 0x000000, 0.55).setStrokeStyle(1, 0x666666);
    this.myBar = this.makeBar(56, me ? me.name : 'TÚ', 0x44aaff);
    this.botBar = this.makeBar(80, '🤖 MÁQUINA', 0xff9933);
  }

  makeBar(y, name, color) {
    const style = { fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#ffffff' };
    this.add.text(318, y, name, style).setOrigin(1, 0.5);
    this.add.rectangle(436, y, 220, 14, 0x333333).setStrokeStyle(1, 0x888888);
    const fill = this.add.rectangle(326, y, 220, 14, color).setOrigin(0, 0.5).setScale(0, 1);
    const label = this.add.text(554, y, '', { ...style, fontStyle: 'normal' }).setOrigin(0, 0.5);
    return { fill, label };
  }

  // 60 times per second: move the machine and fill the bars
  update(time, delta) {
    if (!this.solo || this.finished) return;

    if (this.started) {
      const result = this.bot.update(delta / 1000);
      if (result === 'won') this.finish(false, 'La máquina llegó primero al Nivel 4');
    }
    this.showBar(this.myBar, this.myProgress());
    this.showBar(this.botBar, { frac: this.bot.progress(), label: this.bot.label() });
  }

  showBar(bar, progress) {
    bar.fill.setScale(Phaser.Math.Clamp(progress.frac, 0, 1), 1);
    bar.label.setText(progress.label);
  }

  // How far we are, from 0 to 1, and the words next to our bar
  myProgress() {
    const level = this.scene.get(this.players[0].scene);
    // While the level is (re)starting, it has no hero yet: we keep the last answer
    if (!level.hero || !level.hero.active || !level.levelData) return this.lastMine || { frac: 0, label: '' };

    const start = level.levelData.heroStart.x;
    const inLevel = Phaser.Math.Clamp((level.hero.x - start) / (level.levelData.goal.x - start), 0, 1);
    this.lastMine = {
      frac: (level.levelIndex + inLevel) / LEVELS_TO_WIN,
      label: `Nivel ${level.levelIndex + 1}`,
    };
    return this.lastMine;
  }

  // REVANCHA: we close the levels, and start everything again with the same data
  restartRace() {
    if (this.leaving) return;
    this.leaving = true;
    this.players.forEach((p) => this.scene.stop(p.scene));
    this.scene.restart(this.startData);
  }

  // 3... 2... 1... ¡YA! (so both players start at the same time)
  countdown() {
    const goal = this.add.text(400, 190, '¡El primero en llegar al Nivel 4 gana!', {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6, align: 'center',
    }).setOrigin(0.5);

    const words = ['3', '2', '1', '¡YA!'];
    words.forEach((word, i) => {
      this.time.delayedCall(600 + i * 800, () => {
        playSound(i === 3 ? 'ya' : 'cuenta');
        const text = this.add.text(400, 300, word, {
          fontFamily: 'Arial', fontSize: '96px', fontStyle: 'bold',
          color: i === 3 ? '#66ee88' : '#ffffff',
          stroke: '#000000', strokeThickness: 10,
        }).setOrigin(0.5);
        // Each number grows and disappears
        this.tweens.add({
          targets: text, scale: 1.5, alpha: 0, duration: 750,
          onComplete: () => text.destroy(),
        });
        if (i === 3) {
          this.started = true;
          this.tweens.add({ targets: goal, alpha: 0, duration: 400 });
        }
      });
    });
  }

  // A level scene calls this when its player gets to level 4
  playerWon(player, reason = 'Llegó primero al Nivel 4') {
    if (this.solo) {
      // Alone on the screen, the one who won is US
      this.finish(true, '¡Llegaste primero al Nivel 4!');
      return;
    }

    // Only the FIRST one to get there wins
    if (this.finished) return;
    this.finished = true;

    // Both halves freeze, so we can see where everybody was
    this.players.forEach((p) => this.scene.pause(p.scene));

    const winner = this.players[player - 1];
    const color = Phaser.Display.Color.HexStringToColor(winner.color).color;

    // A colored frame around the winner's half
    this.add.rectangle(winner.side * 400 + 200, 300, 392, 592)
      .setStrokeStyle(8, color);

    this.showResult(`¡GANÓ EL JUGADOR ${player}!`, winner.color, reason);
    playSound('ganar');
    this.throwConfetti(winner.side * 400 + 200);
  }

  // Against the machine: we won, or the machine won
  finish(weWon, reason) {
    // Only the FIRST one to get there wins
    if (this.finished) return;
    this.finished = true;
    this.players.forEach((p) => this.scene.pause(p.scene));

    // A prize for winning: coins to buy pencils! (more for a harder machine)
    // and stars for the PASE
    let coins = 0;
    if (weWon) {
      coins = COIN_PRIZES[this.level] || COIN_PRIZES.normal;
      addCoins(coins);
      earnStars('ganar');
    }
    this.showResult(weWon ? '¡GANASTE!' : '¡GANÓ LA MÁQUINA!', weWon ? '#66ee88' : '#ff9933', reason, coins);
    playSound(weWon ? 'ganar' : 'perder');
    if (weWon) this.throwConfetti(400);
  }

  // The big message in the middle: who won, why, the coins we won,
  // and the REVANCHA and SALA buttons
  showResult(title, color, reason, coins = 0) {
    this.add.rectangle(400, 300, 540, 250, 0x000000, 0.85).setStrokeStyle(4, 0xffffff);
    const titleText = this.add.text(400, 222, title, {
      fontFamily: 'Arial', fontSize: '44px', fontStyle: 'bold', color,
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    // A long title may not fit: we make it smaller
    if (titleText.width > 500) titleText.setScale(500 / titleText.width);
    this.tweens.add({
      targets: titleText, scale: titleText.scale * 1.08, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.add.text(400, 268, reason, {
      fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);
    if (coins) {
      makeCoinTexture(this);
      this.add.image(352, 302, 'coin');
      this.add.text(368, 302, `+${coins} monedas`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(0, 0.5);
    }

    // The two buttons (they also work with the keys R and ENTER)
    this.resultButton(285, '🔁 REVANCHA [R]', 0x66ee88, () => this.restartRace());
    this.resultButton(515, '🏠 SALA [ENTER]', 0xffffff, () => this.leave());
  }

  resultButton(x, label, color, onClick) {
    const box = this.add.container(x, 350, [
      this.add.rectangle(0, 0, 210, 48, 0x222222).setStrokeStyle(3, color),
      this.add.text(0, 0, label, {
        fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5),
    ]).setSize(210, 48).setInteractive({ useHandCursor: true });
    box.on('pointerdown', onClick);
    return box;
  }

  // Rainbow confetti falling over the winner's half
  throwConfetti(centerX) {
    const colors = [0xff4444, 0xff9933, 0xffee33, 0x44dd66, 0x3399ff, 0xaa55ff];
    for (let i = 0; i < 60; i++) {
      const piece = this.add.rectangle(
        centerX - 190 + Math.random() * 380, -20 - Math.random() * 300,
        8, 12, colors[i % colors.length]
      );
      this.tweens.add({
        targets: piece,
        y: 640,
        angle: 360 + Math.random() * 360,
        duration: 1800 + Math.random() * 1500,
        onComplete: () => piece.destroy(),
      });
    }
  }

  // Back to the sala: we close the levels first
  leave() {
    if (this.leaving) return;
    this.leaving = true;
    this.players.forEach((p) => this.scene.stop(p.scene));
    this.scene.start('TitleScene');
  }
}

export default RaceScene;
