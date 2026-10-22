// HalloweenScene.js — The screen of the HALLOWEEN EVENT 🎃 (from the sala: button or O).
// It shows how many pumpkins we found, a bar up to 31, and the 5 prizes:
// the ones we already won have a ✅, the others say how many pumpkins are missing.
// The rules of the event are in src/data/halloween.js.
// ESC or ENTER goes back to the sala.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { PRIZES, MAX_PUMPKINS, loadPumpkins, daysLeft } from '../data/halloween.js';
import { makeHalloweenTextures } from '../managers/HalloweenManager.js';
import { skinTexture, fitImage } from '../data/skins.js';

const ORANGE = 0xff7a00;

class HalloweenScene extends Phaser.Scene {
  constructor() {
    super('HalloweenScene');
  }

  create() {
    this.leaving = false;
    drawGrayCity(this);
    // A dark purple night over the city
    this.add.rectangle(400, 300, 800, 600, 0x14061e, 0.82);
    makeHalloweenTextures(this);
    drawMoonAndBats(this, 700, 80);

    this.add.text(400, 52, '🎃 HALLOWEEN 🎃', {
      fontFamily: 'Arial', fontSize: '44px', fontStyle: 'bold', color: '#ff9922',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5);
    const days = daysLeft();
    this.add.text(400, 100, `Busca las calabazas en los niveles · ¡Quedan ${days} ${days === 1 ? 'día' : 'días'}!`, {
      fontFamily: 'Arial', fontSize: '18px', color: '#dddddd',
    }).setOrigin(0.5);

    this.drawCounter(loadPumpkins());
    PRIZES.forEach((prize, i) => this.drawPrize(prize, 96 + i * 152, loadPumpkins()));

    this.add.text(400, 500, 'Hay 3 calabazas en cada nivel. Cada una da 5 monedas 🪙\n'
      + 'Los villanos también se disfrazaron... ¡búscalos!', {
      fontFamily: 'Arial', fontSize: '15px', color: '#bbbbbb', align: 'center', lineSpacing: 4,
    }).setOrigin(0.5);

    // Back button (it works with the finger too)
    const back = this.add.rectangle(400, 562, 220, 44, 0x222222)
      .setStrokeStyle(2, ORANGE).setInteractive({ useHandCursor: true });
    this.add.text(400, 562, '🏠 SALA [ENTER]', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    back.on('pointerdown', () => this.goBack());
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape' || event.key === 'Enter') this.goBack();
    });

    this.cameras.main.fadeIn(250);
  }

  // The big counter: a pumpkin, "7 / 31", and an orange bar that fills up
  drawCounter(pumpkins) {
    const shown = Math.min(pumpkins, MAX_PUMPKINS);
    this.add.image(285, 160, 'calabaza').setScale(2.2);
    this.add.text(330, 160, `${pumpkins} / ${MAX_PUMPKINS}`, {
      fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0, 0.5);

    const width = 600;
    this.add.rectangle(400, 212, width, 18, 0x333333).setStrokeStyle(2, 0x000000);
    if (shown > 0) {
      this.add.rectangle(400 - width / 2, 212, (width * shown) / MAX_PUMPKINS, 18, ORANGE).setOrigin(0, 0.5);
    }
    // A little mark on the bar for every prize
    PRIZES.forEach((prize) => {
      const x = 400 - width / 2 + (width * prize.pumpkins) / MAX_PUMPKINS;
      this.add.rectangle(x, 212, 3, 24, 0xffffff);
    });
  }

  // One prize: its picture, its name, and if we already won it
  drawPrize(prize, x, pumpkins) {
    const won = pumpkins >= prize.pumpkins;
    this.add.rectangle(x, 345, 140, 200, won ? 0x2a1a10 : 0x1c1c1c)
      .setStrokeStyle(3, won ? ORANGE : 0x555555);
    this.add.text(x, 262, `🎃 ${prize.pumpkins}`, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ff9922',
    }).setOrigin(0.5);

    const picture = this.add.image(x, 322, skinTexture(this, prize.id));
    fitImage(picture, 70);
    // A prize we don't have yet is a dark shadow: a surprise!
    if (!won) picture.setTint(0x333333);

    this.add.text(x, 384, prize.name, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      align: 'center', wordWrap: { width: 130 },
    }).setOrigin(0.5);
    const missing = prize.pumpkins - pumpkins;
    this.add.text(x, 424, won ? '✅ ¡GANADO!' : `🔒 Faltan ${missing}`, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: won ? '#66ee88' : '#aaaaaa',
    }).setOrigin(0.5);
  }

  goBack() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'));
  }
}

// ---------------------------------------------------------------
// An orange moon with bats that fly around it (the sala uses it too)
// ---------------------------------------------------------------
export function drawMoonAndBats(scene, x, y) {
  scene.add.circle(x, y, 34, 0xffaa33, 0.25);
  scene.add.circle(x, y, 26, 0xffb347);
  scene.add.circle(x - 8, y - 6, 5, 0xe8962e);
  scene.add.circle(x + 7, y + 8, 4, 0xe8962e);

  // 3 bats: the far ones (in the back) are smaller and slower
  for (let i = 0; i < 3; i++) {
    const bat = scene.add.text(x, y, '🦇', { fontSize: `${18 - i * 3}px` }).setOrigin(0.5);
    const radius = 50 + i * 22;
    const speed = 5000 + i * 1500;
    // Each bat flies in a circle around the moon, starting at a different place
    const start = i * 2.1;
    scene.tweens.addCounter({
      from: 0, to: Math.PI * 2, duration: speed, repeat: -1,
      onUpdate: (tween) => {
        const a = tween.getValue() + start;
        bat.setPosition(x + Math.cos(a) * radius, y + Math.sin(a) * radius * 0.45);
      },
    });
  }
}

export default HalloweenScene;
