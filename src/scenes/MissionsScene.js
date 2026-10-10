// MissionsScene.js — The MISIONES DEL DÍA screen (from the sala: button or M).
// It shows the 3 missions of today (easy, medium and hard), how far we got
// in each one, and the coins they give. They change every day by themselves.
// The missions themselves live in src/data/missions.js.
// ESC or ENTER goes back to the sala.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { missionStatus, TIER_NAMES } from '../data/missions.js';
import { makeCoinTexture } from '../data/coins.js';

const TIER_COLORS = { facil: 0x66ee88, media: 0xffdd33, dificil: 0xff5555 };

class MissionsScene extends Phaser.Scene {
  constructor() {
    super('MissionsScene');
  }

  create() {
    this.leaving = false;
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    makeCoinTexture(this);

    this.add.text(400, 60, '📋 MISIONES DEL DÍA', {
      fontFamily: 'Arial', fontSize: '42px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(400, 110, 'Complétalas para ganar monedas. ¡Mañana hay misiones nuevas!', {
      fontFamily: 'Arial', fontSize: '18px', color: '#cccccc',
    }).setOrigin(0.5);

    missionStatus().forEach((mission, i) => this.drawMission(mission, 200 + i * 120));

    // Back button (it works with the finger too)
    const back = this.add.rectangle(400, 555, 220, 44, 0x222222)
      .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.text(400, 555, '🏠 SALA [ENTER]', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    back.on('pointerdown', () => this.leave());

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape' || event.key === 'Enter') this.leave();
    });
    this.cameras.main.fadeIn(250);
  }

  // One mission: a card with its tier, the text, a progress bar and the prize
  drawMission(mission, y) {
    const color = TIER_COLORS[mission.tier];
    this.add.rectangle(400, y, 640, 100, mission.done ? 0x1d3b24 : 0x222222)
      .setStrokeStyle(3, color);
    this.add.text(96, y - 42, TIER_NAMES[mission.tier], {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold',
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
    });
    this.add.text(96, y - 6, mission.text, {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
      wordWrap: { width: 470 },
    }).setOrigin(0, 0.5);

    // The bar fills up as we get closer to the goal
    this.add.rectangle(96, y + 28, 380, 14, 0x444444).setOrigin(0, 0.5);
    this.add.rectangle(96, y + 28, 380 * (mission.progress / mission.goal), 14, color).setOrigin(0, 0.5);
    this.add.text(486, y + 28, `${mission.progress} / ${mission.goal}`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#dddddd',
    }).setOrigin(0, 0.5);

    // The prize (or a big check when it is done)
    if (mission.done) {
      this.add.text(660, y, '✅', { fontSize: '44px' }).setOrigin(0.5);
    } else {
      this.add.image(640, y, 'coin').setScale(1.3);
      this.add.text(660, y, `+${mission.reward}`, {
        fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(0, 0.5);
    }
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'));
  }
}

export default MissionsScene;
