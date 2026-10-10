// OnlineScene.js — Getting ready to play ONLINE with friends (on other devices).
//   [1] CREAR PARTIDA → the game gives us a SECRET WORD. We tell it to our friends.
//   [2] UNIRSE        → we type our friend's secret word and connect to them.
// From 2 to 4 players can play. Everybody sees who is in the game (name and
// avatar). When everybody is there, the one who CREATED the game presses
// EMPEZAR (or ENTER), and the CARRERA (or BÚSQUEDA) starts for everybody.
// The creator also decides if it is a CARRERA or a BÚSQUEDA.
// ESC goes back.

import Phaser from 'phaser';
import Net, { cleanWord, MAX_PLAYERS } from '../online/Net.js';
import { drawGrayCity } from './TitleScene.js';
import { loadProfile } from '../data/profile.js';
import { skinTexture, fitImage } from '../data/skins.js';

const PLAYER_COLORS = ['#44aaff', '#ff9933', '#66ee88', '#ff77cc'];

class OnlineScene extends Phaser.Scene {
  constructor() {
    super('OnlineScene');
  }

  init(data) {
    this.mode = data.mode === 'busqueda' ? 'busqueda' : 'carrera';
    // 'menu' (choose create or join), 'crear', 'unirse' or 'error'
    this.step = 'menu';
    this.typed = '';
    this.net = null;
    this.leaving = false;
    this.connecting = false;
    this.playing = false;
    // Everybody in the game: { id, name, avatar }. We are always in the list
    this.players = [];
  }

  create() {
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    this.title = this.add.text(400, 50, '', {
      fontFamily: 'Arial', fontSize: '36px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.showTitle();
    this.add.text(400, 585, 'ESC: volver', {
      fontFamily: 'Arial', fontSize: '14px', color: '#999999',
    }).setOrigin(0.5);

    // The two buttons of the first step
    this.menu = this.add.container();
    this.menuButton(200, '[1]  ✨ CREAR PARTIDA', 'Te damos una palabra secreta para tus amigos', () => this.createGame());
    this.menuButton(330, '[2]  🔑 UNIRSE', 'Escribe la palabra secreta de tu amigo', () => this.startJoin());

    // Everything else is written in these texts
    this.info = this.add.text(400, 115, '', {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4, align: 'center',
    }).setOrigin(0.5);
    this.big = this.add.text(400, 180, '', {
      fontFamily: 'Arial', fontSize: '64px', fontStyle: 'bold', color: '#ffdd33',
      stroke: '#000000', strokeThickness: 8, align: 'center',
    }).setOrigin(0.5);
    this.message = this.add.text(400, 255, '', {
      fontFamily: 'Arial', fontSize: '18px', color: '#bbbbbb', align: 'center',
    }).setOrigin(0.5);

    // The players who are in the game (it is drawn again every time it changes)
    this.playerCards = this.add.container();
    this.startButton = this.makeStartButton();

    this.input.keyboard.on('keydown', (event) => this.onKeyDown(event));
    // If we leave this screen without starting to play, we hang up
    this.events.once('shutdown', () => {
      window.dispatchEvent(new Event('hacks-cerrados'));
      if (this.net && !this.playing) this.net.close();
    });
    this.cameras.main.fadeIn(250);
  }

  showTitle() {
    this.title.setText(`🌐 ONLINE · ${this.mode === 'busqueda' ? 'BÚSQUEDA' : 'CARRERA'}`);
  }

  menuButton(y, label, explain, onClick) {
    const box = this.add.rectangle(400, y, 520, 100, 0x222222)
      .setStrokeStyle(4, 0x44aaff).setInteractive({ useHandCursor: true });
    const name = this.add.text(400, y - 16, label, {
      fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    const small = this.add.text(400, y + 26, explain, {
      fontFamily: 'Arial', fontSize: '16px', color: '#bbbbbb',
    }).setOrigin(0.5);
    box.on('pointerover', () => box.setFillStyle(0x444444));
    box.on('pointerout', () => box.setFillStyle(0x222222));
    box.on('pointerdown', () => { if (this.step === 'menu') onClick(); });
    this.menu.add([box, name, small]);
  }

  // The EMPEZAR button: only the creator sees it, when there are 2 or more players
  makeStartButton() {
    const box = this.add.rectangle(400, 530, 300, 56, 0x1d3b24)
      .setStrokeStyle(4, 0x66ee88).setInteractive({ useHandCursor: true });
    const label = this.add.text(400, 530, '▶ EMPEZAR [ENTER]', {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    box.on('pointerdown', () => this.startPlaying());
    return this.add.container(0, 0, [box, label]).setVisible(false);
  }

  hideMenu() {
    this.menu.setVisible(false);
    this.menu.each((thing) => thing.input && (thing.input.enabled = false));
  }

  onKeyDown(event) {
    if (event.key === 'Escape') {
      this.goBack();
      return;
    }
    if (this.step === 'menu') {
      if (event.key === '1') this.createGame();
      else if (event.key === '2') this.startJoin();
    } else if (this.step === 'crear') {
      if (event.key === 'Enter') this.startPlaying();
    } else if (this.step === 'unirse' && !this.connecting && !this.net) {
      // Typing the secret word
      if (event.key === 'Enter') this.joinGame();
      else if (event.key === 'Backspace') this.typed = this.typed.slice(0, -1);
      else if (event.key.length === 1 && this.typed.length < 12) this.typed += event.key;
      this.typed = cleanWord(this.typed);
      this.big.setText(`${this.typed}|`);
    }
  }

  // Our own name and avatar
  me() {
    const profile = loadProfile() || { name: 'Jugador', avatar: 'heroe' };
    return { id: this.net.myId, name: profile.name, avatar: profile.avatar };
  }

  // [1] We create the game: we get a secret word and wait for our friends
  async createGame() {
    this.step = 'crear';
    this.hideMenu();
    this.info.setText('Conectando...');
    this.net = this.makeNet();
    try {
      const word = await this.net.host();
      if (this.leaving) return;
      this.info.setText('Tu palabra secreta es:');
      this.big.setText(word);
      this.message.setText(`Dile a tus amigos que elijan ONLINE → UNIRSE\ny que escriban esta palabra (hasta ${MAX_PLAYERS} jugadores).`);
      this.players = [this.me()];
      this.showPlayers();
    } catch (err) {
      this.showProblem(err);
    }
  }

  // [2] We want to join: first we type the word
  startJoin() {
    this.step = 'unirse';
    this.hideMenu();
    this.info.setText('Escribe la palabra secreta de tu amigo:');
    this.big.setText('|');
    this.message.setText('ENTER: conectar');
    // On phones and tablets, the small keyboard comes up by itself
    window.dispatchEvent(new Event('hacks-abiertos'));
  }

  async joinGame() {
    if (!this.typed) return;
    this.connecting = true;
    this.message.setText('Buscando la partida...');
    this.net = this.makeNet();
    try {
      await this.net.join(this.typed);
      window.dispatchEvent(new Event('hacks-cerrados'));
      this.connecting = false;
      this.message.setText('¡Conectado! Esperando a que el creador empiece...');
    } catch (err) {
      // Wrong word? Let them try again
      this.net.close();
      this.net = null;
      this.connecting = false;
      this.message.setText(err.type === 'peer-unavailable'
        ? `No hay ninguna partida con la palabra ${this.typed}.\nRevísala y presiona ENTER otra vez.`
        : 'No pudimos conectar. ¿Hay internet?\nPresiona ENTER para probar otra vez.');
    }
  }

  // The connection, and what we do with the messages it brings
  makeNet() {
    const net = new Net();
    // A friend who joins says hello to the center: name and avatar
    net.onConnected = () => {
      if (!net.isHost) net.send({ t: 'hola', name: this.me().name, avatar: this.me().avatar });
    };
    net.onMessage = (msg) => {
      if (msg.t === 'hola' && net.isHost) this.playerArrived(msg);
      else if (msg.t === 'lista') this.listArrived(msg);
      else if (msg.t === 'empezar') this.play(msg.mode, msg.players);
      else if (msg.t === 'llena') this.showFull();
    };
    // Somebody left before the game started: take them out of the list
    net.onPlayerLeft = (id) => {
      this.players = this.players.filter((p) => p.id !== id);
      if (net.isHost) this.sendList();
      this.showPlayers();
    };
    net.onClose = () => {
      if (this.leaving || this.playing) return;
      this.step = 'error';
      this.big.setText('');
      this.info.setText('El creador de la partida se fue 😢');
      this.message.setText('ESC: volver');
      this.playerCards.removeAll(true);
    };
    return net;
  }

  // (center) A friend said hello: add them and tell everybody who is in the game
  playerArrived(msg) {
    if (this.players.some((p) => p.id === msg.from)) return;
    this.players.push({ id: msg.from, name: msg.name, avatar: msg.avatar });
    this.sendList();
    this.showPlayers();
  }

  sendList() {
    this.net.send({ t: 'lista', players: this.players, mode: this.mode });
  }

  // (friend) The center told us who is in the game
  listArrived(msg) {
    this.players = msg.players;
    this.mode = msg.mode === 'busqueda' ? 'busqueda' : 'carrera';
    this.showTitle();
    this.showPlayers();
  }

  // The players in the game: a card with the avatar and the name of each one
  showPlayers() {
    this.playerCards.removeAll(true);
    const count = this.players.length;
    this.players.forEach((player, i) => {
      const x = 400 + (i - (count - 1) / 2) * 170;
      const isMe = this.net && player.id === this.net.myId;
      const card = this.add.rectangle(x, 380, 150, 150, 0x222222)
        .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(PLAYER_COLORS[i]).color);
      const avatar = this.add.image(x, 360, skinTexture(this, player.avatar));
      fitImage(avatar, 80);
      const name = this.add.text(x, 425, isMe ? `${player.name} (tú)` : player.name, {
        fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: PLAYER_COLORS[i],
      }).setOrigin(0.5);
      if (name.width > 140) name.setScale(140 / name.width);
      const crown = i === 0 ? this.add.text(x, 312, '👑', { fontSize: '20px' }).setOrigin(0.5) : null;
      this.playerCards.add([card, avatar, name, ...(crown ? [crown] : [])]);
    });
    // Only the creator can start, and only with friends
    const canStart = this.net && this.net.isHost && count >= 2;
    this.startButton.setVisible(canStart);
    if (this.net && this.net.isHost && this.step === 'crear') {
      this.message.setText(count >= 2
        ? `${count} jugadores. ¿Están todos? ¡Presiona EMPEZAR!`
        : `Dile a tus amigos que elijan ONLINE → UNIRSE\ny que escriban esta palabra (hasta ${MAX_PLAYERS} jugadores).`);
    }
  }

  // (center) EMPEZAR: nobody else can join, and we all start at the same time
  startPlaying() {
    if (!this.net || !this.net.isHost || this.players.length < 2 || this.playing) return;
    this.net.locked = true;
    this.net.send({ t: 'empezar', mode: this.mode, players: this.players });
    this.play(this.mode, this.players);
  }

  // Everybody goes to the race (or the search)!
  play(mode, players) {
    if (this.playing || this.leaving) return;
    this.playing = true; // the race keeps the connection, so we don't hang up
    this.leaving = true;
    this.scene.start('RaceScene', { mode, how: 'online', net: this.net, players });
  }

  showFull() {
    this.step = 'error';
    this.message.setText('Esa partida ya está llena o ya empezó 😢\nESC: volver');
  }

  showProblem(err) {
    this.step = 'error';
    this.big.setText('');
    this.info.setText('No pudimos conectar a internet 😢');
    this.message.setText(`(${err.type || err.message})\nESC: volver`);
  }

  // ESC: from the word screens back to the 2 buttons; from the buttons back to the 3 options
  goBack() {
    if (this.leaving) return;
    this.leaving = true;
    if (this.step === 'menu') this.scene.start('ModeChoiceScene', { mode: this.mode });
    else this.scene.restart({ mode: this.mode });
  }
}

export default OnlineScene;
