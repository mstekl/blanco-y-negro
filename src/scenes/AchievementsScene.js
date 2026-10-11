// AchievementsScene.js — The LOGROS screen (in the CASILLERO).
// All the trophies: the ones we won are gold 🏆, the others show how far we
// are with a little bar. Every logro gives coins (see src/data/achievements.js).
// ◀ ▶ (or the arrow keys) change the page. ESC goes back to the CASILLERO.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { drawTopBar } from '../ui/TopBar.js';
import { ACHIEVEMENTS, achievementValue, checkAchievements, loadDone, loadStats } from '../data/achievements.js';

const PER_PAGE = 12; // 3 columns x 4 rows

class AchievementsScene extends Phaser.Scene {
  constructor() {
    super('AchievementsScene');
  }

  create() {
    this.leaving = false;
    // Maybe we already have some (like 25 skins) that nobody checked yet
    checkAchievements();

    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    this.refreshCoins = drawTopBar(this, 'LockerScene', (scene) => this.goTo(scene));

    const done = loadDone();
    this.add.text(400, 74, `🏆 LOGROS  ${done.length} / ${ACHIEVEMENTS.length}`, {
      fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffdd33',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.page = 0;
    this.lastPage = Math.ceil(ACHIEVEMENTS.length / PER_PAGE) - 1;
    this.cards = this.add.container();
    this.pageText = this.add.text(400, 560, '', {
      fontFamily: 'Arial', fontSize: '15px', color: '#cccccc',
    }).setOrigin(0.5);
    this.arrow(330, '◀', -1);
    this.arrow(470, '▶', 1);
    this.add.text(400, 586, 'ESC: volver al CASILLERO', {
      fontFamily: 'Arial', fontSize: '12px', color: '#888888',
    }).setOrigin(0.5);

    this.drawPage();
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('LockerScene');
      else if (event.key === 'ArrowLeft') this.turnPage(-1);
      else if (event.key === 'ArrowRight') this.turnPage(1);
    });
    this.cameras.main.fadeIn(250);
  }

  arrow(x, label, step) {
    const box = this.add.rectangle(x, 560, 44, 30, 0x222222).setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, 560, label, { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    box.on('pointerdown', () => this.turnPage(step));
  }

  turnPage(step) {
    this.page = Phaser.Math.Clamp(this.page + step, 0, this.lastPage);
    this.drawPage();
  }

  drawPage() {
    const done = loadDone();
    const stats = loadStats();
    this.cards.removeAll(true);
    ACHIEVEMENTS.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE).forEach((a, i) => {
      const x = 140 + (i % 3) * 260;
      const y = 145 + Math.floor(i / 3) * 102;
      const won = done.includes(a.id);
      const value = Math.min(a.goal, achievementValue(a, stats));

      this.cards.add(this.add.rectangle(x, y, 244, 92, won ? 0x3b2f00 : 0x222222)
        .setStrokeStyle(3, won ? 0xffd700 : 0x555555));
      const icon = this.add.text(x - 96, y - 6, a.icon, { fontSize: '30px' }).setOrigin(0.5);
      if (!won) icon.setAlpha(0.4);
      this.cards.add(icon);
      this.cards.add(this.add.text(x - 70, y - 32, a.name, {
        fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: won ? '#ffdd33' : '#ffffff',
      }));
      this.cards.add(this.add.text(x - 70, y - 12, a.text, {
        fontFamily: 'Arial', fontSize: '11px', color: '#bbbbbb', wordWrap: { width: 180 },
      }));
      // Bottom: the prize, and a bar (or "¡LOGRADO!")
      this.cards.add(this.add.text(x + 112, y - 32, `🪙 ${a.coins}`, {
        fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(1, 0));
      if (won) {
        this.cards.add(this.add.text(x - 70, y + 22, '🏆 ¡LOGRADO!', {
          fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#66ee88',
        }).setOrigin(0, 0.5));
      } else {
        this.cards.add(this.add.rectangle(x - 70, y + 24, 130, 10, 0x444444).setOrigin(0, 0.5));
        this.cards.add(this.add.rectangle(x - 70, y + 24, 130 * (value / a.goal), 10, 0x44aaff).setOrigin(0, 0.5));
        this.cards.add(this.add.text(x + 66, y + 24, `${value}/${a.goal}`, {
          fontFamily: 'Arial', fontSize: '11px', color: '#ffffff',
        }).setOrigin(0, 0.5));
      }
    });
    this.pageText.setText(`${this.page + 1} / ${this.lastPage + 1}`);
  }

  goTo(sceneName) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName));
  }
}

export default AchievementsScene;
