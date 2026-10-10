// ModeChoiceScene.js — Before a CARRERA or a BÚSQUEDA we choose HOW to play:
//   🌐 ONLINE  → against a friend on ANOTHER phone, iPad or computer,
//               connected with a secret word (see OnlineScene.js)
//   👥 OFFLINE → two players on THIS screen, each one on half (like always)
//   🤖 MÁQUINA → against the computer. Then we choose FÁCIL, NORMAL or DIFÍCIL
// Keys: 1 2 3 choose, ESC goes back (to the sala, or from the levels to the 3 options).

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';

const TITLES = {
  carrera: '🏁 CARRERA',
  busqueda: '🔍 BÚSQUEDA',
  supervivencia: '🛡 SUPERVIVENCIA',
};

class ModeChoiceScene extends Phaser.Scene {
  constructor() {
    super('ModeChoiceScene');
  }

  // data.mode = 'carrera', 'busqueda' or 'supervivencia'
  init(data) {
    this.mode = ['busqueda', 'supervivencia'].includes(data.mode) ? data.mode : 'carrera';
    this.leaving = false;
  }

  create() {
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6);

    this.add.text(400, 70, TITLES[this.mode], {
      fontFamily: 'Arial', fontSize: '48px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5);
    this.subtitle = this.add.text(400, 125, '', {
      fontFamily: 'Arial', fontSize: '22px', color: '#dddddd',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(400, 585, 'ESC: volver', {
      fontFamily: 'Arial', fontSize: '14px', color: '#999999',
    }).setOrigin(0.5);

    // Two "pages": the 3 ways to play, and the 3 levels of the machine
    this.howPage = this.add.container();
    this.levelPage = this.add.container();

    if (this.mode === 'supervivencia') {
      // SUPERVIVENCIA has only 2 ways: with friends online, or alone
      this.makeButton(this.howPage, 230, '1', '🌐 ONLINE', 'Con amigos: gana el último que sigue vivo', 0x44aaff,
        () => this.goTo('OnlineScene', { mode: this.mode }));
      this.makeButton(this.howPage, 380, '2', '🙂 SOLO', '¿Cuánto aguantas tú solo?', 0x66ee88,
        () => this.goTo('SurvivalScene'));
    } else {
      this.makeButton(this.howPage, 200, '1', '🌐 ONLINE', 'Juega con otra persona con una palabra secreta', 0x44aaff,
        () => this.goTo('OnlineScene', { mode: this.mode }));
      this.makeButton(this.howPage, 330, '2', '👥 OFFLINE', 'Dos personas en esta pantalla, mitad y mitad', 0x66ee88,
        () => this.goTo('RaceScene', { mode: this.mode, how: 'dos' }));
      this.makeButton(this.howPage, 460, '3', '🤖 MÁQUINA', 'Juega contra la máquina', 0xff9933,
        () => this.showPage('levels'));
    }

    this.makeButton(this.levelPage, 200, '1', '🙂 FÁCIL', 'La máquina va despacito', 0x66ee88,
      () => this.playMachine('facil'));
    this.makeButton(this.levelPage, 330, '2', '😐 NORMAL', 'La máquina juega bien', 0xffdd33,
      () => this.playMachine('normal'));
    this.makeButton(this.levelPage, 460, '3', '😈 DIFÍCIL', '¡La máquina es muy rápida!', 0xff4444,
      () => this.playMachine('dificil'));

    this.showPage('how');

    // Keys 1 2 3 press the buttons of the page we see
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.page === 'levels') this.showPage('how');
        else this.goTo('TitleScene');
        return;
      }
      const number = parseInt(event.key, 10);
      const buttons = this.page === 'how' ? this.howPage.buttons : this.levelPage.buttons;
      if (buttons[number - 1]) buttons[number - 1]();
    });

    this.cameras.main.fadeIn(250);
  }

  // A big button: the number key, the name, and a small line that explains it
  makeButton(page, y, number, label, explain, color, onClick) {
    const box = this.add.rectangle(400, y, 520, 100, 0x222222)
      .setStrokeStyle(4, color)
      .setInteractive({ useHandCursor: true });
    const name = this.add.text(400, y - 16, label, {
      fontFamily: 'Arial', fontSize: '34px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    const small = this.add.text(400, y + 26, explain, {
      fontFamily: 'Arial', fontSize: '16px', color: '#bbbbbb',
    }).setOrigin(0.5);
    const key = this.add.text(160, y, `[${number}]`, {
      fontFamily: 'Arial', fontSize: '18px', color: '#888888',
    }).setOrigin(0, 0.5);
    box.on('pointerover', () => box.setFillStyle(0x444444));
    box.on('pointerout', () => box.setFillStyle(0x222222));
    box.on('pointerdown', onClick);
    page.add([box, name, small, key]);
    // We remember the buttons in order, so the keys 1 2 3 can press them
    page.buttons = [...(page.buttons || []), onClick];
  }

  showPage(page) {
    this.page = page;
    this.howPage.setVisible(page === 'how');
    this.levelPage.setVisible(page === 'levels');
    // A hidden page must not catch touches either
    this.howPage.each((thing) => thing.input && (thing.input.enabled = page === 'how'));
    this.levelPage.each((thing) => thing.input && (thing.input.enabled = page === 'levels'));
    this.subtitle.setText(page === 'how' ? '¿Cómo quieres jugar?' : '¿Qué tan buena es la máquina?');
  }

  playMachine(level) {
    this.goTo('RaceScene', { mode: this.mode, how: 'maquina', level });
  }

  goTo(sceneName, data) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName, data));
  }
}

export default ModeChoiceScene;
