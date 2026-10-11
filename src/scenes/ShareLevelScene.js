// ShareLevelScene.js — Share a level of the EDITOR DE NIVELES with a friend!
// It works like ONLINE (with PeerJS, see src/online/Net.js), with a secret word:
//   📤 COMPARTIR: we get a secret word (like TIGRE) and wait. Every friend who
//      connects with that word gets our level.
//   📥 RECIBIR: we type our friend's word, the level arrives, and it is saved
//      in our first empty slot of MIS NIVELES. Then we can play it or change it!
// Both have to have the game open at the same time.
// We start it with { mode: 'enviar', slot: 2 } or { mode: 'recibir' }.

import Phaser from 'phaser';
import Net, { cleanWord } from '../online/Net.js';
import { loadLevel, saveLevel, firstEmptySlot, cleanReceivedLevel } from '../data/customLevels.js';
import { loadProfile } from '../data/profile.js';
import { playSound } from '../audio/Sound.js';

class ShareLevelScene extends Phaser.Scene {
  constructor() {
    super('ShareLevelScene');
  }

  init(data = {}) {
    this.mode = data.mode === 'enviar' ? 'enviar' : 'recibir';
    this.slot = Number.isInteger(data.slot) ? data.slot : 0;
    this.leaving = false;
    this.net = null;
    this.typed = '';
    this.typing = false;
    this.received = null; // the slot where the received level was saved
  }

  create() {
    this.cameras.main.setBackgroundColor('#222222');
    this.add.text(400, 50, this.mode === 'enviar' ? '📤 COMPARTIR NIVEL' : '📥 RECIBIR NIVEL', {
      fontFamily: 'Arial', fontSize: '38px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.info = this.add.text(400, 130, '', {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff', align: 'center',
    }).setOrigin(0.5);
    this.big = this.add.text(400, 210, '', {
      fontFamily: 'Arial', fontSize: '64px', fontStyle: 'bold', color: '#ffdd33',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5);
    this.message = this.add.text(400, 300, '', {
      fontFamily: 'Arial', fontSize: '18px', color: '#bbbbbb', align: 'center', wordWrap: { width: 700 },
    }).setOrigin(0.5);
    this.add.text(400, 580, 'ESC: volver a MIS NIVELES', {
      fontFamily: 'Arial', fontSize: '14px', color: '#999999',
    }).setOrigin(0.5);

    // After receiving: buttons to play it or to change it in the editor
    this.afterButtons = this.add.container().setVisible(false);
    this.makeButton(260, 420, '▶ JUGAR [J]', 0x66ee88, () => this.playReceived());
    this.makeButton(540, 420, '✏ EDITAR [E]', 0xffdd00, () => this.editReceived());

    this.input.keyboard.on('keydown', (event) => this.onKeyDown(event));
    // Leaving this screen: hang up, and close the small keyboard of touch screens
    this.events.once('shutdown', () => {
      if (this.typing) window.dispatchEvent(new Event('hacks-cerrados'));
      if (this.net) this.net.close();
    });

    if (this.mode === 'enviar') this.startSending();
    else this.startReceiving();
    this.cameras.main.fadeIn(250);
  }

  makeButton(x, y, label, color, onClick) {
    const box = this.add.rectangle(x, y, 220, 56, 0x222222).setStrokeStyle(3, color)
      .setInteractive({ useHandCursor: true });
    box.on('pointerdown', () => { if (this.received !== null) onClick(); });
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.afterButtons.add([box, text]);
  }

  // ---------------------------------------------------------------
  // 📤 Sending: get a word, and give our level to every friend who comes
  // ---------------------------------------------------------------
  async startSending() {
    const level = loadLevel(this.slot);
    if (!level) {
      this.info.setText('Ese lugar está vacío');
      return;
    }
    this.info.setText('Conectando...');
    this.net = new Net();
    this.sentTo = 0;
    this.net.onConnected = () => this.net.send({ t: 'nivel', level });
    this.net.onMessage = (msg) => {
      if (msg.t !== 'gracias') return;
      this.sentTo += 1;
      playSound('mision');
      const who = typeof msg.name === 'string' ? msg.name.slice(0, 13) : 'Tu amigo';
      this.message.setColor('#66ee88').setText(`¡${who} recibió "${level.name}"! 🎉\n(Puedes esperar a más amigos, o ESC para salir)`);
    };
    try {
      const word = await this.net.host();
      if (this.leaving) return;
      this.info.setText(`Para compartir "${level.name}", tu palabra secreta es:`);
      this.big.setText(word);
      this.message.setText('Dile a tu amigo que vaya a EDITOR → 📥 RECIBIR\ny que escriba esta palabra. ¡No cierres esta pantalla hasta que le llegue!');
    } catch (err) {
      this.info.setText('No pudimos conectar. ¿Hay internet?');
    }
  }

  // ---------------------------------------------------------------
  // 📥 Receiving: type the word of our friend
  // ---------------------------------------------------------------
  startReceiving() {
    if (firstEmptySlot() === -1) {
      this.info.setText('¡Tus 5 lugares de MIS NIVELES están llenos!');
      this.message.setText('Borra un nivel (🗑 BORRAR) para hacerle lugar al nivel de tu amigo.');
      return;
    }
    this.typing = true;
    this.info.setText('Escribe la palabra secreta de tu amigo:');
    this.big.setText('|');
    this.message.setText('ENTER: conectar');
    window.dispatchEvent(new Event('hacks-abiertos'));
  }

  async connect() {
    if (!this.typed || this.net) return;
    this.message.setColor('#bbbbbb').setText('Buscando el nivel...');
    this.net = new Net();
    this.net.onMessage = (msg) => {
      if (msg.t === 'nivel') this.gotLevel(msg.level);
    };
    try {
      await this.net.join(this.typed);
    } catch (err) {
      if (this.received !== null) return;
      this.net.close();
      this.net = null;
      this.message.setText(err.type === 'peer-unavailable'
        ? `Nadie está compartiendo con la palabra ${this.typed}.\nRevísala y presiona ENTER otra vez.`
        : 'No pudimos conectar. ¿Hay internet?\nPresiona ENTER para probar otra vez.');
    }
  }

  // The level arrived! We clean it and save it in our first empty slot
  gotLevel(data) {
    if (this.received !== null) return;
    const level = cleanReceivedLevel(data);
    const slot = firstEmptySlot();
    if (!level || slot === -1 || !saveLevel(slot, level)) {
      this.message.setColor('#ff8888').setText('Ese nivel no se pudo guardar 😢');
      return;
    }
    this.received = slot;
    this.typing = false;
    window.dispatchEvent(new Event('hacks-cerrados'));
    // We say thank you (so our friend knows it arrived), then we hang up
    const me = loadProfile();
    this.net.send({ t: 'gracias', name: me ? me.name : 'Tu amigo' });
    this.time.delayedCall(800, () => {
      if (this.net) this.net.close();
      this.net = null;
    });
    playSound('ganar');
    this.info.setText('¡Te llegó un nivel! 🎉');
    this.big.setText(level.name).setFontSize(44);
    this.message.setColor('#66ee88').setText(`Está guardado en MIS NIVELES, en el lugar ${slot + 1}.`);
    this.afterButtons.setVisible(true);
  }

  playReceived() {
    this.goTo('CustomLevelScene', { slot: this.received });
  }

  editReceived() {
    this.goTo('EditorScene', { slot: this.received });
  }

  onKeyDown(event) {
    if (this.leaving) return;
    if (event.key === 'Escape') {
      this.goTo('EditorScene', { pick: this.received !== null ? this.received : this.slot });
      return;
    }
    if (this.received !== null) {
      if (event.code === 'KeyJ') this.playReceived();
      else if (event.code === 'KeyE') this.editReceived();
      return;
    }
    if (!this.typing || this.net) return;
    if (event.key === 'Enter') this.connect();
    else if (event.key === 'Backspace') this.typed = this.typed.slice(0, -1);
    else if (event.key.length === 1 && this.typed.length < 12) this.typed = cleanWord(this.typed + event.key);
    if (!this.net) this.big.setText(`${this.typed}|`);
  }

  goTo(sceneName, data) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName, data));
  }
}

export default ShareLevelScene;
