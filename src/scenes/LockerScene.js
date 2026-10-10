// LockerScene.js — The CASILLERO tab (in the top bar of the sala, or K).
// Our own things, in three big buttons:
//   👕 SKINS       → choose the skin we wear (SkinsScene)
//   🙂 TU JUGADOR  → our name and avatar (ProfileScene)
//   📋 MISIONES    → the 3 missions of today (MissionsScene)
// Keys 1 2 3 open them, ESC goes back to the sala.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { drawTopBar } from '../ui/TopBar.js';
import { loadSkins, skinTexture, fitImage, SKIN_LIST } from '../data/skins.js';
import { loadProfile } from '../data/profile.js';
import { missionStatus } from '../data/missions.js';

class LockerScene extends Phaser.Scene {
  constructor() {
    super('LockerScene');
  }

  create() {
    this.leaving = false;
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    drawTopBar(this, 'LockerScene', (scene) => this.goTo(scene));

    this.add.text(400, 90, '🎒 CASILLERO', {
      fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5);

    const { won, chosen } = loadSkins(this.registry);
    const profile = loadProfile() || { name: 'Jugador', avatar: 'heroe' };
    const done = missionStatus().filter((m) => m.done).length;

    this.buttons = [
      this.card(160, '👕 SKINS', `${won.size} de ${SKIN_LIST.length}`, skinTexture(this, chosen), 0x44aaff,
        () => this.goTo('SkinsScene')),
      this.card(400, '🙂 TU JUGADOR', profile.name, skinTexture(this, profile.avatar), 0x66ee88,
        () => this.goTo('ProfileScene')),
      this.card(640, '📋 MISIONES', `${done} de 3 hechas hoy`, null, 0xffdd33,
        () => this.goTo('MissionsScene')),
    ];

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('TitleScene');
      const number = parseInt(event.key, 10);
      if (this.buttons[number - 1]) this.buttons[number - 1]();
    });
    this.cameras.main.fadeIn(250);
  }

  // A big card with a picture, a name and a small line under it
  card(x, title, line, texture, color, onClick) {
    const box = this.add.rectangle(x, 330, 210, 290, 0x222222)
      .setStrokeStyle(4, color).setInteractive({ useHandCursor: true });
    box.on('pointerover', () => box.setFillStyle(0x3a3a3a));
    box.on('pointerout', () => box.setFillStyle(0x222222));
    box.on('pointerdown', onClick);
    if (texture) fitImage(this.add.image(x, 290, texture), 120);
    else this.add.text(x, 290, '📋', { fontSize: '80px' }).setOrigin(0.5);
    this.add.text(x, 400, title, {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(x, 432, line, {
      fontFamily: 'Arial', fontSize: '15px', color: '#bbbbbb',
    }).setOrigin(0.5);
    return onClick;
  }

  goTo(sceneName) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName));
  }
}

export default LockerScene;
