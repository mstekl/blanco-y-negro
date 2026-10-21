// FutbolMenuScene.js — The menu of the FÚTBOL (from the sala: ⚽ FÚTBOL, or G).
// There are 4 ways to play:
//   [1] 🤖 MÁQUINA   → one match against the robot (FÁCIL, NORMAL or DIFÍCIL)
//   [2] 👥 OFFLINE   → two players on this keyboard
//   [3] 🏆 TEMPORADA → like the FC: climb from División 5 to División 1 (TemporadaScene.js)
//   [4] 🌍 MUNDIAL   → choose a country and win the World Cup; the FINAL is online
//                      against a friend (MundialScene.js)
// Keys: 1 2 3 4 choose, ESC goes back.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';

class FutbolMenuScene extends Phaser.Scene {
  constructor() {
    super('FutbolMenuScene');
  }

  init() {
    this.leaving = false;
  }

  create() {
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6);
    this.add.text(400, 55, '⚽ FÚTBOL', {
      fontFamily: 'Arial', fontSize: '48px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5);
    this.subtitle = this.add.text(400, 105, '', {
      fontFamily: 'Arial', fontSize: '20px', color: '#dddddd', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(400, 585, 'ESC: volver', { fontFamily: 'Arial', fontSize: '14px', color: '#999999' }).setOrigin(0.5);

    // Two "pages": the 4 ways to play, and how good the machine is
    this.howPage = this.add.container();
    this.levelPage = this.add.container();

    this.makeButton(this.howPage, 175, '1', '🤖 MÁQUINA', 'Un partido contra el robot', 0xff9933,
      () => this.showPage('levels'));
    this.makeButton(this.howPage, 275, '2', '👥 OFFLINE', 'Dos personas en este teclado', 0x66ee88,
      () => this.goTo('SoccerScene', { how: 'dos' }));
    this.makeButton(this.howPage, 375, '3', '🏆 TEMPORADA', 'De la División 5 a la División 1', 0xffdd33,
      () => this.goTo('TemporadaScene'));
    this.makeButton(this.howPage, 475, '4', '🌍 MUNDIAL', 'Elige un país... ¡y la final es online!', 0x44aaff,
      () => this.goTo('MundialScene'));

    this.makeButton(this.levelPage, 200, '1', '🙂 FÁCIL', 'El robot es lento', 0x66ee88, () => this.playMachine('facil'));
    this.makeButton(this.levelPage, 320, '2', '😐 NORMAL', 'El robot juega bien', 0xffdd33, () => this.playMachine('normal'));
    this.makeButton(this.levelPage, 440, '3', '😈 DIFÍCIL', '¡El robot es un crack!', 0xff4444, () => this.playMachine('dificil'));

    this.showPage('how');
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.page === 'levels') this.showPage('how');
        else this.goTo('TitleScene');
        return;
      }
      const buttons = this.page === 'how' ? this.howPage.buttons : this.levelPage.buttons;
      const press = buttons[parseInt(event.key, 10) - 1];
      if (press) press();
    });
    this.cameras.main.fadeIn(250);
  }

  // A big button: the number key, the name, and a small line that explains it
  makeButton(page, y, number, label, explain, color, onClick) {
    const box = this.add.rectangle(400, y, 520, 86, 0x222222).setStrokeStyle(4, color)
      .setInteractive({ useHandCursor: true });
    const name = this.add.text(400, y - 14, label, {
      fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    const small = this.add.text(400, y + 22, explain, { fontFamily: 'Arial', fontSize: '16px', color: '#bbbbbb' }).setOrigin(0.5);
    const key = this.add.text(160, y, `[${number}]`, { fontFamily: 'Arial', fontSize: '18px', color: '#888888' }).setOrigin(0, 0.5);
    box.on('pointerover', () => box.setFillStyle(0x444444));
    box.on('pointerout', () => box.setFillStyle(0x222222));
    box.on('pointerdown', onClick);
    page.add([box, name, small, key]);
    page.buttons = [...(page.buttons || []), onClick];
  }

  showPage(page) {
    this.page = page;
    this.howPage.setVisible(page === 'how');
    this.levelPage.setVisible(page === 'levels');
    // A hidden page must not catch touches either
    this.howPage.each((thing) => thing.input && (thing.input.enabled = page === 'how'));
    this.levelPage.each((thing) => thing.input && (thing.input.enabled = page === 'levels'));
    this.subtitle.setText(page === 'how' ? '¿Cómo quieres jugar?' : '¿Qué tan bueno es el robot?');
  }

  playMachine(level) {
    this.goTo('SoccerScene', { how: 'maquina', level });
  }

  goTo(sceneName, data) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName, data));
  }
}

export default FutbolMenuScene;
