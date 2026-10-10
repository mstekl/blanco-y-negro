// RaceScene.js — The race! (It also runs the BÚSQUEDA mode — see SearchLevelScene.js —
// where we look for 5 colored pencils instead of running to level 4.)
// There are 3 ways to play (we choose in ModeChoiceScene.js):
//   - OFFLINE ('dos'): two players on the same screen, split in two halves:
//       LEFT half:  player 1, plays with W A D (and S to shoot)
//       RIGHT half: player 2, plays with the arrows (and ↓ to shoot)
//   - MÁQUINA ('maquina'): we play alone on the whole screen, against the
//       machine (Bot.js), that we see as a ghost in our level
//   - ONLINE ('online'): we play alone on the whole screen, and our friend
//       plays on THEIR phone, iPad or computer (Net.js)
// Alone on the screen, a bar at the top shows how far we are, and how far the other one is.
// Each half (or the whole screen) is a copy of the normal level scene (LevelScene), with
// its own hero, enemies and camera. This scene sits ON TOP: it draws the line
// in the middle, the bars, does the 3-2-1 countdown and says who won.
// The first player to REACH LEVEL 4 (finish level 3) wins the race!
// ESC goes back to the sala.

import Phaser from 'phaser';
import LevelScene from './LevelScene.js';
import { RaceBot, SearchBot } from '../online/Bot.js';
import { loadProfile } from '../data/profile.js';
import { addCoins, makeCoinTexture } from '../data/coins.js';

// We win when we finish this many levels (3 levels done = we got to level 4)
const LEVELS_TO_WIN = 3;
const SEARCH_LIVES = 3;
const GOOD_PENCILS = 5;

// Online: faces and messages we can send to our friend (keys 1 2 3 4, or touch them)
const EMOJIS = ['😂', '😡', '👍', '¡Te gano!'];

// Coins we win when we beat the machine (more if it was harder) or a friend online
const COIN_PRIZES = { facil: 5, normal: 10, dificil: 20, online: 15 };

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

// Everything that is different for each player, in each mode
const K = Phaser.Input.Keyboard.KeyCodes;
const MODES = {
  // The race: the first one to reach level 4 wins
  carrera: {
    intro: ['¡El primero en llegar al Nivel 4 gana!'],
    players: [
      {
        player: 1, side: 0, scene: 'RaceLeft', controls: 'wasd', color: '#44aaff',
        help: 'A D Mover  |  W Saltar', shootKey: 'S',
      },
      {
        player: 2, side: 1, scene: 'RaceRight', controls: 'arrows', color: '#ff9933',
        help: '← → Mover  |  ↑ Saltar', shootKey: '↓',
      },
    ],
    // Alone on the whole screen (online or against the machine): the normal keys
    solo: {
      player: 1, scene: 'RaceLeft', controls: 'normal', full: true, color: '#44aaff',
      help: '← → Mover  |  ↑ Saltar', shootKey: 'Z',
    },
    weWon: '¡Llegaste primero al Nivel 4!',
    theyWon: 'llegó primero al Nivel 4',
  },
  // The search: the first one to find the 5 good pencils wins
  busqueda: {
    intro: [
      '¡Busca 5 lápices: rojo, azul, verde, violeta y naranja!',
      'Amarillo, rosa y marrón te quitan 1 vida',
    ],
    players: [
      {
        player: 1, side: 0, scene: 'SearchLeft', controls: 'wasd', color: '#44aaff',
        help: 'A D Mover  |  W Saltar  |  Z Agarrar', grabKey: K.Z,
      },
      {
        player: 2, side: 1, scene: 'SearchRight', controls: 'arrows', color: '#ff9933',
        help: '← → Mover  |  ↑ Saltar  |  ↓ Agarrar', grabKey: K.DOWN,
      },
    ],
    solo: {
      player: 1, scene: 'SearchLeft', controls: 'normal', full: true, color: '#44aaff',
      help: '← → Mover  |  ↑ Saltar  |  Z Agarrar', grabKey: K.Z,
    },
    weWon: '¡Encontraste los 5 lápices!',
    theyWon: 'encontró los 5 lápices',
  },
};

class RaceScene extends Phaser.Scene {
  constructor() {
    super('RaceScene');
  }

  // data.mode  = 'carrera' (the race) or 'busqueda' (the search)
  // data.how   = 'dos' (two on this screen), 'maquina' or 'online'
  // data.level = how good the machine is ('facil', 'normal', 'dificil')
  // data.net and data.friend = the online connection and our friend (name + avatar)
  init(data) {
    this.modeName = MODES[data.mode] ? data.mode : 'carrera';
    this.mode = MODES[this.modeName];
    this.how = ['maquina', 'online'].includes(data.how) ? data.how : 'dos';
    this.solo = this.how !== 'dos';
    this.players = this.solo ? [this.mode.solo] : this.mode.players;
    this.level = data.level;
    this.net = data.net || null;
    this.friend = data.friend || null;
    this.bot = null;
    // We keep everything, so the REVANCHA can start the same game again
    this.startData = data;
  }

  create() {
    // The level scenes look at "started" to know if they can move yet
    this.started = false;
    this.finished = false;
    this.leaving = false;

    // The machine must be ready BEFORE the level starts (the level draws its ghost)
    if (this.how === 'maquina') {
      this.bot = this.modeName === 'busqueda'
        ? new SearchBot(this.level, SEARCH_LIVES)
        : new RaceBot(this.level, LEVELS_TO_WIN);
    }

    // Start both halves (or the whole screen), each with its own player data
    this.players.forEach((p) => {
      this.scene.launch(p.scene, { levelIndex: 0, race: { ...p, goalLevel: LEVELS_TO_WIN } });
    });
    // This scene must be drawn ON TOP of the levels
    this.scene.bringToTop();

    if (this.solo) {
      this.createBars();
    } else {
      this.createSplitScreen();
    }

    // Online: listen to our friend
    if (this.net) {
      this.net.onMessage = (msg) => this.onFriendMessage(msg);
      this.net.onClose = () => this.friendLeft();
      this.sendTimer = 0;
      // A fresh start for the "8 seconds of silence" check (after a REVANCHA,
      // our friend was quiet on the result screen, and that doesn't count)
      this.net.lastHeard = Date.now();
      this.createEmojiButtons();
    }
    // REVANCHA: did we ask for it, and did our friend? (online both must want it)
    this.wantRematch = false;
    this.friendWantsRematch = false;

    this.add.text(400, 598, 'ESC: salir', {
      fontFamily: 'Arial', fontSize: '11px', color: '#888888',
      backgroundColor: '#000000',
    }).setOrigin(0.5, 1);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.leave();
      else if (event.key === 'Enter' && this.finished) this.leave();
      else if (event.code === 'KeyR' && this.finished) this.askRematch();
      else if (this.net && EMOJIS[parseInt(event.key, 10) - 1]) this.sendEmoji(parseInt(event.key, 10) - 1);
    });

    this.countdown();
  }

  // OFFLINE: the line in the middle, the names, and the buttons for two players
  createSplitScreen() {
    // On an iPad or phone: tell the screen buttons to give each half its own buttons
    // (and to go back to the normal ones when this scene closes)
    window.dispatchEvent(new CustomEvent('dos-jugadores', { detail: { mode: this.modeName } }));
    this.events.once('shutdown', () => window.dispatchEvent(new Event('un-jugador')));

    // The line in the middle that splits the screen
    this.add.rectangle(400, 300, 6, 600, 0xffffff);
    this.add.rectangle(400, 300, 2, 600, 0x000000);

    // "JUGADOR 1" and "JUGADOR 2" in the top-left corner of each half
    // (in the search it goes a bit lower, under the hearts)
    const labelY = this.mode === MODES.busqueda ? 40 : 10;
    this.players.forEach((p) => {
      this.add.text(p.side * 400 + 12, labelY, `JUGADOR ${p.player}`, {
        fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: p.color,
        stroke: '#000000', strokeThickness: 4,
      });
    });
  }

  // ALONE ON THE SCREEN: two bars at the top, one for us and one for the other player,
  // that fill up as we get closer to winning
  createBars() {
    const me = loadProfile();
    const rivalName = this.bot ? '🤖 MÁQUINA' : this.friend.name;
    this.add.rectangle(400, 68, 500, 54, 0x000000, 0.55).setStrokeStyle(1, 0x666666);
    this.bars = [
      this.makeBar(56, me ? me.name : 'TÚ', 0x44aaff),
      this.makeBar(80, rivalName, 0xff9933),
    ];
    this.rival = { frac: 0, label: '' };
  }

  makeBar(y, name, color) {
    const style = { fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#ffffff' };
    this.add.text(318, y, name, style).setOrigin(1, 0.5);
    this.add.rectangle(436, y, 220, 14, 0x333333).setStrokeStyle(1, 0x888888);
    const fill = this.add.rectangle(326, y, 220, 14, color).setOrigin(0, 0.5).setScale(0, 1);
    const label = this.add.text(554, y, '', { ...style, fontStyle: 'normal' }).setOrigin(0, 0.5);
    return { fill, label };
  }

  // 60 times per second: move the machine, fill the bars, tell our friend how we go
  update(time, delta) {
    // On the result screen, online, we still say "I'm here" every 2 seconds,
    // so the connection doesn't fall asleep while we decide on the REVANCHA
    if (this.net && this.finished) {
      this.sendTimer -= delta;
      if (this.sendTimer <= 0) {
        this.sendTimer = 2000;
        this.net.send({ t: 'sigo' });
      }
    }
    if (!this.solo || this.finished) return;

    const mine = this.myProgress();
    if (this.bot && this.started) {
      const result = this.bot.update(delta / 1000);
      if (result === 'won') this.finish(false, `La máquina ${this.mode.theyWon}`);
      else if (result === 'out') this.finish(true, `La máquina perdió sus ${SEARCH_LIVES} vidas`);
      this.rival = { frac: this.bot.progress(), label: this.bot.label() };
    }

    // Online: we tell our friend how we go, about 6 times per second (not 60: too many messages)
    if (this.net) {
      // Our friend sends news all the time: 8 seconds of silence means they are gone
      if (Date.now() - this.net.lastHeard > 8000) {
        this.friendLeft();
        return;
      }
      this.sendTimer -= delta;
      if (this.sendTimer <= 0) {
        this.sendTimer = 150;
        this.net.send({ t: 'progreso', frac: mine.frac, label: mine.label });
      }
    }

    this.showBar(this.bars[0], mine);
    this.showBar(this.bars[1], this.rival);
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

    if (this.modeName === 'busqueda') {
      const found = level.foundCount || 0;
      this.lastMine = {
        frac: found / GOOD_PENCILS,
        label: `${found}/${GOOD_PENCILS}  ${'❤'.repeat(Math.max(0, level.hero.lives))}`,
      };
    } else {
      const start = level.levelData.heroStart.x;
      const inLevel = Phaser.Math.Clamp((level.hero.x - start) / (level.levelData.goal.x - start), 0, 1);
      this.lastMine = {
        frac: (level.levelIndex + inLevel) / LEVELS_TO_WIN,
        label: `Nivel ${level.levelIndex + 1}`,
      };
    }
    return this.lastMine;
  }

  // A message from our friend's device
  onFriendMessage(msg) {
    if (msg.t === 'progreso') {
      this.rival = { frac: msg.frac, label: msg.label };
    } else if (msg.t === 'gane') {
      this.finish(false, `${this.friend.name} ${this.mode.theyWon}`);
    } else if (msg.t === 'perdi') {
      this.finish(true, `${this.friend.name} perdió sus ${SEARCH_LIVES} vidas`);
    } else if (msg.t === 'emoji') {
      this.showFriendEmoji(msg.i);
    } else if (msg.t === 'revancha') {
      this.friendWantsRematch = true;
      if (this.rematchStatus && !this.wantRematch) {
        this.rematchStatus.setText(`¡${this.friend.name} quiere la revancha! Presiona R`);
      }
      this.checkRematch();
    }
  }

  // Our friend closed the game or lost the internet
  friendLeft() {
    if (this.leaving) return;
    if (this.finished) {
      // We were already on the result screen: there can't be a REVANCHA anymore
      this.noRematch(`${this.friend.name} se fue`);
      return;
    }
    this.finished = true;
    this.players.forEach((p) => this.scene.pause(p.scene));
    this.showResult('SE DESCONECTÓ', '#bbbbbb', `${this.friend.name} salió del juego`, { rematch: false });
  }

  // ---------------------------------------------------------------
  // Online: faces and messages for our friend
  // ---------------------------------------------------------------

  // The buttons on the right side of the screen (or keys 1 2 3 4)
  createEmojiButtons() {
    this.lastEmojiTime = 0;
    EMOJIS.forEach((emoji, i) => {
      const y = 160 + i * 52;
      const isWord = emoji.length > 2; // "¡Te gano!" is a word, not a face
      const button = this.add.rectangle(758, y, 70, 44, 0x000000, 0.55)
        .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true }).setDepth(50);
      this.add.text(758, y, emoji, {
        fontFamily: 'Arial', fontSize: isWord ? '13px' : '26px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setDepth(51);
      this.add.text(726, y - 16, String(i + 1), {
        fontFamily: 'Arial', fontSize: '10px', color: '#aaaaaa',
      }).setDepth(51);
      button.on('pointerdown', () => this.sendEmoji(i));
    });
  }

  sendEmoji(i) {
    // Not too many at once (less than 1 second apart doesn't count)
    if (this.time.now - this.lastEmojiTime < 800) return;
    this.lastEmojiTime = this.time.now;
    this.net.send({ t: 'emoji', i });
    // A small copy flies out of the button, so we know it was sent
    this.popEmoji(EMOJIS[i], 690, 160 + i * 52, '22px', '');
  }

  // Our friend sent us one: it shows BIG at the top, with their name
  showFriendEmoji(i) {
    if (!EMOJIS[i]) return;
    this.popEmoji(EMOJIS[i], 400, 170, '56px', this.friend.name);
  }

  // A face (or message) that pops up, floats a little, and disappears
  popEmoji(emoji, x, y, size, name) {
    const parts = [this.add.text(0, 0, emoji, {
      fontFamily: 'Arial', fontSize: size, fontStyle: 'bold', color: '#ffdd33',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5)];
    if (name) {
      parts.push(this.add.text(0, -48, name, {
        fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ff9933',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5));
    }
    const pop = this.add.container(x, y, parts).setDepth(200).setScale(0.3);
    this.tweens.add({ targets: pop, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: pop, y: y - 30, alpha: 0, delay: 1400, duration: 500,
      onComplete: () => pop.destroy(),
    });
  }

  // ---------------------------------------------------------------
  // REVANCHA: play the same game again
  // ---------------------------------------------------------------
  askRematch() {
    if (!this.canRematch || this.wantRematch) return;
    this.wantRematch = true;
    if (this.net) {
      // Online, BOTH must want it: we tell our friend and wait
      this.net.send({ t: 'revancha' });
      this.rematchStatus.setText(`Esperando a ${this.friend.name}...`);
      this.checkRematch();
    } else {
      this.restartRace();
    }
  }

  checkRematch() {
    if (this.wantRematch && this.friendWantsRematch && this.canRematch) this.restartRace();
  }

  noRematch(why) {
    this.canRematch = false;
    if (this.rematchButton) this.rematchButton.setAlpha(0.3);
    if (this.rematchStatus) this.rematchStatus.setText(why);
  }

  restartRace() {
    if (this.leaving) return;
    this.leaving = true;
    // We close the levels, and start everything again with the same data
    // (online, we keep the same connection: no new secret word needed!)
    this.players.forEach((p) => this.scene.stop(p.scene));
    this.scene.restart(this.startData);
  }

  // 3... 2... 1... ¡YA! (so both players start at the same time)
  countdown() {
    const goal = this.add.text(400, 190, this.mode.intro, {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6, align: 'center',
    }).setOrigin(0.5);

    const words = ['3', '2', '1', '¡YA!'];
    words.forEach((word, i) => {
      this.time.delayedCall(600 + i * 800, () => {
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

  // A player lost all their lives (in the search): the OTHER one wins
  playerOut(player) {
    if (this.solo) {
      // Alone on the screen, the one who lost is US
      if (this.net) this.net.send({ t: 'perdi' });
      this.finish(false, `Perdiste tus ${SEARCH_LIVES} vidas`);
      return;
    }
    const other = player === 1 ? 2 : 1;
    this.playerWon(other, `El jugador ${player} perdió sus 3 vidas`);
  }

  // A level scene calls this when its player wins (got to level 4, or found the 5 pencils)
  playerWon(player, reason = 'Llegó primero al Nivel 4') {
    if (this.solo) {
      // Alone on the screen, the one who won is US
      if (this.net && !this.finished) this.net.send({ t: 'gane' });
      this.finish(true, this.mode.weWon);
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
    this.throwConfetti(winner.side * 400 + 200);
  }

  // Alone on the screen: we won, or the other one (the machine or our friend) won
  finish(weWon, reason) {
    // Only the FIRST one to get there wins
    if (this.finished) return;
    this.finished = true;
    this.players.forEach((p) => this.scene.pause(p.scene));

    let title = '¡GANASTE!';
    if (!weWon) title = this.bot ? '¡GANÓ LA MÁQUINA!' : `¡GANÓ ${this.friend.name.toUpperCase()}!`;
    // A prize for winning: coins to buy pencils! (more for a harder machine)
    const coins = weWon ? COIN_PRIZES[this.bot ? this.level : 'online'] || 0 : 0;
    if (coins) addCoins(coins);
    this.showResult(title, weWon ? '#66ee88' : '#ff9933', reason, { coins });
    if (weWon) this.throwConfetti(400);
  }

  // The big message in the middle: who won, why, the coins we won,
  // and the REVANCHA and SALA buttons
  showResult(title, color, reason, { coins = 0, rematch = true } = {}) {
    this.add.rectangle(400, 300, 540, 250, 0x000000, 0.85).setStrokeStyle(4, 0xffffff);
    const titleText = this.add.text(400, 222, title, {
      fontFamily: 'Arial', fontSize: '44px', fontStyle: 'bold', color,
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    // A long name may not fit: we make it smaller
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
    this.canRematch = rematch;
    this.rematchButton = this.resultButton(285, '🔁 REVANCHA [R]', 0x66ee88, () => this.askRematch());
    this.resultButton(515, '🏠 SALA [ENTER]', 0xffffff, () => this.leave());
    this.rematchStatus = this.add.text(400, 400, '', {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffdd33',
    }).setOrigin(0.5);
    if (!rematch) this.noRematch('');
    // Our friend asked for the REVANCHA before we got here? Tell us!
    else if (this.friendWantsRematch) this.rematchStatus.setText(`¡${this.friend.name} quiere la revancha! Presiona R`);
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

  // Back to the sala: we close the levels (and hang up, online) first
  leave() {
    if (this.leaving) return;
    this.leaving = true;
    if (this.net) this.net.close();
    this.players.forEach((p) => this.scene.stop(p.scene));
    this.scene.start('TitleScene');
  }
}

export default RaceScene;
