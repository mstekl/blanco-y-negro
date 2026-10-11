// LockerScene.js — The CASILLERO tab (in the top bar of the sala, or K).
// Our own things, in six big buttons (two rows):
//   👕 SKINS       → choose the skin we wear (SkinsScene)
//   🙂 TU JUGADOR  → our name and avatar (ProfileScene)
//   📋 MISIONES    → the 3 missions of today (MissionsScene)
//   💃 BAILES      → choose our dance (CosmeticsScene)
//   🎒 ACCESORIOS  → choose our mochila and mascota (CosmeticsScene)
//   🏆 LOGROS      → all the trophies (AchievementsScene)
// Keys 1 to 6 open them, ESC goes back to the sala.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { drawTopBar } from '../ui/TopBar.js';
import { loadSkins, skinTexture, fitImage, SKIN_LIST } from '../data/skins.js';
import { loadProfile } from '../data/profile.js';
import { missionStatus } from '../data/missions.js';
import { loadCosmetics, findCosmetic } from '../data/cosmetics.js';
import { ACHIEVEMENTS, loadDone } from '../data/achievements.js';
import { cosmeticTexture } from '../sprites/Cosmetics.js';

class LockerScene extends Phaser.Scene {
  constructor() {
    super('LockerScene');
  }

  create() {
    this.leaving = false;
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    drawTopBar(this, 'LockerScene', (scene) => this.goTo(scene));

    this.add.text(400, 78, '🎒 CASILLERO', {
      fontFamily: 'Arial', fontSize: '36px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5);

    const { won, chosen } = loadSkins(this.registry);
    const profile = loadProfile() || { name: 'Jugador', avatar: 'heroe' };
    const done = missionStatus().filter((m) => m.done).length;
    const cosmetics = loadCosmetics();
    const dance = findCosmetic(cosmetics.baile);
    const accessory = cosmetics.mascota || cosmetics.mochila;
    const trophies = loadDone().length;

    this.buttons = [
      this.card(160, 225, '👕 SKINS', `${won.size} de ${SKIN_LIST.length}`, skinTexture(this, chosen), 0x44aaff,
        () => this.goTo('SkinsScene')),
      this.card(400, 225, '🙂 TU JUGADOR', profile.name, skinTexture(this, profile.avatar), 0x66ee88,
        () => this.goTo('ProfileScene')),
      this.card(640, 225, '📋 MISIONES', `${done} de 3 hechas hoy`, '📋', 0xffdd33,
        () => this.goTo('MissionsScene')),
      this.card(160, 445, '💃 BAILES', dance ? dance.name : 'Saludo', cosmeticTexture(this, cosmetics.baile || 'saludo'), 0xff77bb,
        () => this.goTo('CosmeticsScene', { type: 'baile' })),
      this.card(400, 445, '🎒 ACCESORIOS', 'Mochilas y mascotas', accessory ? cosmeticTexture(this, accessory) : '🐾', 0xaa77ff,
        () => this.goTo('CosmeticsScene', { type: cosmetics.mascota || !cosmetics.mochila ? 'mascota' : 'mochila' })),
      this.card(640, 445, '🏆 LOGROS', `${trophies} de ${ACHIEVEMENTS.length}`, '🏆', 0xffaa33,
        () => this.goTo('AchievementsScene')),
    ];

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('TitleScene');
      const number = parseInt(event.key, 10);
      if (this.buttons[number - 1]) this.buttons[number - 1]();
    });
    this.cameras.main.fadeIn(250);
  }

  // A big card with a picture (a texture, or an emoji), a name and a small line under it
  card(x, y, title, line, picture, color, onClick) {
    const box = this.add.rectangle(x, y, 210, 190, 0x222222)
      .setStrokeStyle(4, color).setInteractive({ useHandCursor: true });
    box.on('pointerover', () => box.setFillStyle(0x3a3a3a));
    box.on('pointerout', () => box.setFillStyle(0x222222));
    box.on('pointerdown', onClick);
    if (this.textures.exists(picture)) fitImage(this.add.image(x, y - 30, picture), 80);
    else this.add.text(x, y - 30, picture, { fontSize: '56px' }).setOrigin(0.5);
    this.add.text(x, y + 40, title, {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(x, y + 68, line, {
      fontFamily: 'Arial', fontSize: '14px', color: '#bbbbbb',
    }).setOrigin(0.5);
    return onClick;
  }

  goTo(sceneName, data) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName, data));
  }
}

export default LockerScene;
