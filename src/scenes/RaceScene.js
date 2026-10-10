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
import { reportMission } from '../data/missions.js';

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
  // data.net and data.players = the online connection and everybody in the game
  //   (2 to 4 players: { id, name, avatar }, we are one of them)
  init(data) {
    this.modeName = MODES[data.mode] ? data.mode : 'carrera';
    this.mode = MODES[this.modeName];
    this.how = ['maquina', 'online'].includes(data.how) ? data.how : 'dos';
    this.solo = this.how !== 'dos';
    this.players = this.solo ? [this.mode.solo] : this.mode.players;
    this.level = data.level;
    this.net = data.net || null;
    this.bot = null;
    // Alone on the screen, the RIVALS are the machine or our online friends.
    // For each one we remember how far they are, and if they are out or gone.
    this.rivals = [];
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
      this.rivals = [this.makeRival({ id: 'bot', name: '🤖 MÁQUINA' })];
    }
    if (this.net) {
      this.rivals = this.startData.players
        .filter((p) => p.id !== this.net.myId && !this.net.gone.has(p.id))
        .map((p) => this.makeRival(p));
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

    // Online: listen to our friends
    if (this.net) {
      this.net.onMessage = (msg) => this.onFriendMessage(msg);
      this.net.onPlayerLeft = (id) => this.friendLeft(id);
      // The center left: everybody is gone for us (without the center, nobody can talk)
      this.net.onClose = () => {
        this.centerGone = true;
        this.rivals.forEach((r) => this.friendLeft(r.id));
      };
      this.centerGone = false;
      this.sendTimer = 0;
      // A fresh start for the "8 seconds of silence" check (after a REVANCHA,
      // our friends were quiet on the result screen, and that doesn't count)
      this.rivals.forEach((r) => this.net.lastHeard.set(r.id, Date.now()));
      this.createEmojiButtons();
    }
    // REVANCHA: did we ask for it? (online, everybody must want it)
    this.wantRematch = false;

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

  // A rival: who it is, how far they are, and what happened to them
  makeRival(player) {
    return {
      ...player,
      frac: 0, label: '',
      out: false,           // lost all their lives (in the search)
      gone: false,          // left the game
      wantsRematch: false,  // pressed REVANCHA
    };
  }

  rival(id) {
    return this.rivals.find((r) => r.id === id);
  }

  // ALONE ON THE SCREEN: bars at the top, one for us and one for each rival,
  // that fill up as we get closer to winning
  createBars() {
    const me = loadProfile();
    const colors = [0x44aaff, 0xff9933, 0x66ee88, 0xff77cc];
    const rows = 1 + this.rivals.length;
    this.add.rectangle(400, 44 + rows * 12, 500, rows * 24 + 6, 0x000000, 0.55).setStrokeStyle(1, 0x666666);
    this.myBar = this.makeBar(56, me ? me.name : 'TÚ', colors[0]);
    this.rivals.forEach((r, i) => { r.bar = this.makeBar(80 + i * 24, r.name, colors[i + 1]); });
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
      if (result === 'won') this.finish(false, `La máquina ${this.mode.theyWon}`, 'LA MÁQUINA');
      else if (result === 'out') this.finish(true, `La máquina perdió sus ${SEARCH_LIVES} vidas`);
      Object.assign(this.rivals[0], { frac: this.bot.progress(), label: this.bot.label() });
    }

    // Online: we tell our friends how we go, about 6 times per second (not 60: too many messages)
    if (this.net) {
      // Our friends send news all the time: 8 seconds of silence means they are gone
      this.rivals.forEach((r) => {
        if (!r.gone && Date.now() - this.net.lastHeard.get(r.id) > 8000) this.net.dropped(r.id);
      });
      if (this.finished) return; // (a friend leaving can end the game)
      this.sendTimer -= delta;
      if (this.sendTimer <= 0) {
        this.sendTimer = 150;
        this.net.send({ t: 'progreso', frac: mine.frac, label: mine.label });
      }
    }

    this.showBar(this.myBar, mine);
    this.rivals.forEach((r) => {
      let label = r.label;
      if (r.gone) label = 'se fue';
      else if (r.out) label = '❌ fuera';
      this.showBar(r.bar, { frac: r.frac, label });
    });
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

  // A message from a friend's device ("from" says who sent it)
  onFriendMessage(msg) {
    const r = this.rival(msg.from);
    if (!r || r.gone) return;
    if (msg.t === 'progreso') {
      r.frac = msg.frac;
      r.label = msg.label;
    } else if (msg.t === 'gane') {
      this.finish(false, `${r.name} ${this.mode.theyWon}`, r.name);
    } else if (msg.t === 'perdi') {
      r.out = true;
      this.checkLastOneStanding();
    } else if (msg.t === 'emoji') {
      this.showFriendEmoji(msg.i, r.name);
    } else if (msg.t === 'revancha') {
      r.wantsRematch = true;
      this.updateRematchStatus();
      this.checkRematch();
    }
  }

  // The rivals who are still playing (not out of lives, not gone)
  playingRivals() {
    return this.rivals.filter((r) => !r.out && !r.gone);
  }

  // In the search: if every rival lost their lives, WE win!
  checkLastOneStanding() {
    if (this.finished || this.playingRivals().length > 0) return;
    if (!this.rivals.some((r) => r.out)) return; // they all LEFT: that's not winning
    const reason = this.rivals.length === 1
      ? `${this.rivals[0].name} perdió sus ${SEARCH_LIVES} vidas`
      : `Los demás perdieron sus ${SEARCH_LIVES} vidas`;
    this.finish(true, reason);
  }

  // A friend closed the game or lost the internet
  friendLeft(id) {
    const r = this.rival(id);
    if (!r || r.gone || this.leaving) return;
    r.gone = true;
    // Is anybody still here to play with? (if the center left, nobody is)
    if (this.centerGone) this.rivals.forEach((other) => { other.gone = true; });
    const someoneLeft = this.rivals.some((other) => !other.gone);

    if (this.finished) {
      // We were already on the result screen: the REVANCHA is only with the ones who stayed
      if (!someoneLeft) this.noRematch(this.centerGone ? 'El creador de la partida se fue' : `${r.name} se fue`);
      else {
        this.updateRematchStatus();
        this.checkRematch();
      }
      return;
    }
    if (someoneLeft) {
      // The game goes on with the others
      this.popEmoji(`${r.name} se fue`, 400, 170, '26px', '');
      this.checkLastOneStanding();
      return;
    }
    // Everybody left: nobody to play with
    this.finished = true;
    this.players.forEach((p) => this.scene.pause(p.scene));
    let reason = this.rivals.length === 1 ? `${r.name} salió del juego` : 'Todos salieron del juego';
    if (this.centerGone && this.rivals.length > 1) reason = 'El creador de la partida se fue';
    this.showResult('SE DESCONECTÓ', '#bbbbbb', reason, { rematch: false });
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

  // A friend sent us one: it shows BIG at the top, with their name
  showFriendEmoji(i, name) {
    if (!EMOJIS[i]) return;
    this.popEmoji(EMOJIS[i], 400, 170, '56px', name);
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
      // Online, EVERYBODY must want it: we tell our friends and wait
      this.net.send({ t: 'revancha' });
      this.updateRematchStatus();
      this.checkRematch();
    } else {
      this.restartRace();
    }
  }

  // The friends who are still here (they didn't leave)
  presentRivals() {
    return this.rivals.filter((r) => !r.gone);
  }

  // The line under the buttons: who wants the REVANCHA, or who we are waiting for
  updateRematchStatus() {
    if (!this.rematchStatus || !this.canRematch) return;
    const names = (list) => list.map((r) => r.name).join(', ');
    if (this.wantRematch) {
      const waiting = this.presentRivals().filter((r) => !r.wantsRematch);
      this.rematchStatus.setText(waiting.length ? `Esperando a ${names(waiting)}...` : '');
    } else {
      const wanting = this.presentRivals().filter((r) => r.wantsRematch);
      if (wanting.length) {
        const verb = wanting.length === 1 ? 'quiere' : 'quieren';
        this.rematchStatus.setText(`¡${names(wanting)} ${verb} la revancha! Presiona R`);
      }
    }
  }

  checkRematch() {
    const present = this.presentRivals();
    const everybody = present.length > 0 && present.every((r) => r.wantsRematch);
    if (this.wantRematch && everybody && this.canRematch) this.restartRace();
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
    // (online, the friends who left don't play the REVANCHA)
    const players = this.net ? this.startData.players.filter((p) => !this.net.gone.has(p.id)) : undefined;
    this.scene.restart({ ...this.startData, players });
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
      // With only one rival left playing, that one wins. With more, they keep playing
      const left = this.playingRivals();
      this.finish(false, `Perdiste tus ${SEARCH_LIVES} vidas`, left.length === 1 ? left[0].name : null);
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

  // Alone on the screen: we won, or somebody else (the machine or a friend) won.
  // "winner" = the name of who won (when it wasn't us), or null if we just lost
  finish(weWon, reason, winner = null) {
    // Only the FIRST one to get there wins
    if (this.finished) return;
    this.finished = true;
    this.players.forEach((p) => this.scene.pause(p.scene));

    let title = '¡GANASTE!';
    if (!weWon) title = winner ? `¡GANÓ ${winner.toUpperCase()}!` : '¡QUEDASTE FUERA!';
    // A prize for winning: coins to buy pencils! (more for a harder machine,
    // and online more when there were more friends to beat)
    let coins = 0;
    if (weWon) coins = this.bot ? COIN_PRIZES[this.level] : COIN_PRIZES.online + 5 * (this.rivals.length - 1);
    if (coins) addCoins(coins);
    // Winning counts for the MISIONES DEL DÍA
    if (weWon) {
      reportMission('ganar');
      reportMission(this.bot ? `maquina-${this.level}` : 'online');
    }
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
    // A friend asked for the REVANCHA before we got here? Tell us!
    else this.updateRematchStatus();
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
