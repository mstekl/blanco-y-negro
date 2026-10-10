// OnlineScene.js — Getting ready to play ONLINE with a friend (on another device).
//   [1] CREAR PARTIDA → the game gives us a SECRET WORD. We tell it to our friend.
//   [2] UNIRSE        → we type our friend's secret word and connect to them.
// When the two are connected, each one sees the other's name and avatar,
// and the CARRERA (or BÚSQUEDA) starts. The one who CREATED the game
// decides if it is a CARRERA or a BÚSQUEDA.
// ESC goes back.

import Phaser from 'phaser';
import Net, { cleanWord } from '../online/Net.js';
import { drawGrayCity } from './TitleScene.js';
import { loadProfile } from '../data/profile.js';
import { skinTexture, fitImage } from '../data/skins.js';

class OnlineScene extends Phaser.Scene {
  constructor() {
    super('OnlineScene');
  }

  init(data) {
    this.mode = data.mode === 'busqueda' ? 'busqueda' : 'carrera';
    // 'menu' (choose create or join), 'crear', 'unirse' or 'listo' (connected)
    this.step = 'menu';
    this.typed = '';
    this.net = null;
    this.leaving = false;
    this.connecting = false;
    this.playing = false;
  }

  create() {
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    this.add.text(400, 60, `🌐 ONLINE · ${this.mode === 'busqueda' ? 'BÚSQUEDA' : 'CARRERA'}`, {
      fontFamily: 'Arial', fontSize: '38px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(400, 585, 'ESC: volver', {
      fontFamily: 'Arial', fontSize: '14px', color: '#999999',
    }).setOrigin(0.5);

    // The two buttons of the first step
    this.menu = this.add.container();
    this.menuButton(200, '[1]  ✨ CREAR PARTIDA', 'Te damos una palabra secreta para tu amigo', () => this.createGame());
    this.menuButton(330, '[2]  🔑 UNIRSE', 'Escribe la palabra secreta de tu amigo', () => this.startJoin());

    // Everything else is written in these texts
    this.big = this.add.text(400, 250, '', {
      fontFamily: 'Arial', fontSize: '64px', fontStyle: 'bold', color: '#ffdd33',
      stroke: '#000000', strokeThickness: 8, align: 'center',
    }).setOrigin(0.5);
    this.info = this.add.text(400, 160, '', {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4, align: 'center',
    }).setOrigin(0.5);
    this.message = this.add.text(400, 350, '', {
      fontFamily: 'Arial', fontSize: '20px', color: '#bbbbbb', align: 'center',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (event) => this.onKeyDown(event));
    // If we leave this screen without starting to play, we hang up
    this.events.once('shutdown', () => {
      window.dispatchEvent(new Event('hacks-cerrados'));
      if (this.net && !this.playing) this.net.close();
    });
    this.cameras.main.fadeIn(250);
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
    } else if (this.step === 'unirse' && !this.connecting) {
      // Typing the secret word
      if (event.key === 'Enter') this.joinGame();
      else if (event.key === 'Backspace') this.typed = this.typed.slice(0, -1);
      else if (event.key.length === 1 && this.typed.length < 12) this.typed += event.key;
      this.typed = cleanWord(this.typed);
      this.big.setText(`${this.typed}|`);
    }
  }

  // [1] We create the game: we get a secret word and wait for our friend
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
      this.message.setText('Dile a tu amigo que elija ONLINE → UNIRSE\ny que escriba esta palabra.\n\nEsperando a tu amigo...');
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
    // As soon as we are connected, we say hello: our name, our avatar, and the mode
    net.onConnected = () => {
      const profile = loadProfile() || { name: 'Jugador', avatar: 'heroe' };
      net.send({ t: 'hola', name: profile.name, avatar: profile.avatar, mode: this.mode, creator: this.step === 'crear' });
    };
    net.onMessage = (msg) => {
      if (msg.t === 'hola') this.friendArrived(msg);
    };
    net.onClose = () => {
      if (this.leaving) return;
      this.step = 'error';
      this.big.setText('');
      this.info.setText('Tu amigo se fue 😢');
      this.message.setText('ESC: volver');
    };
    return net;
  }

  // Our friend said hello: show who it is, and start!
  friendArrived(friend) {
    if (this.step === 'listo') return;
    // The one who created the game decides if it is a race or a search
    if (friend.creator) this.mode = friend.mode === 'busqueda' ? 'busqueda' : 'carrera';
    this.step = 'listo';
    this.hideMenu();

    this.info.setText('¡Conectado con!');
    this.big.setText('');
    this.message.setText('');
    const avatar = this.add.image(400, 255, skinTexture(this, friend.avatar));
    fitImage(avatar, 110);
    this.add.text(400, 345, friend.name, {
      fontFamily: 'Arial', fontSize: '36px', fontStyle: 'bold', color: '#ff9933',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(400, 400, this.mode === 'busqueda' ? '🔍 Van a jugar BÚSQUEDA' : '🏁 Van a jugar CARRERA', {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5);

    this.time.delayedCall(2200, () => {
      if (this.leaving || this.net.closed) return;
      this.playing = true; // the race keeps the connection, so we don't hang up
      this.leaving = true;
      this.scene.start('RaceScene', { mode: this.mode, how: 'online', net: this.net, friend });
    });
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
    if (this.step === 'menu') {
      this.leaving = true;
      this.scene.start('ModeChoiceScene', { mode: this.mode });
    } else {
      this.leaving = true;
      this.scene.restart({ mode: this.mode });
    }
  }
}

export default OnlineScene;
