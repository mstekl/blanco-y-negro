// SkinsScene.js — The skins screen (like choosing a skin in Paper.io 2)!
// We get here with the SKINS button of the sala.
//   - The skin we are looking at is BIG in the middle; the ones next to it are small on the sides
//   - The arrows (on screen or on the keyboard) move to the next skin
//   - ELEGIR puts on the skin. The ones we haven't won have a lock:
//     they are won with a secret code in the "Hacks de sala"
//   - ESC or "← SALA" goes back

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { SKIN_LIST, loadSkins, saveSkins, skinTexture, fitImage } from '../data/skins.js';

class SkinsScene extends Phaser.Scene {
  constructor() {
    super('SkinsScene');
  }

  create() {
    this.leaving = false;
    const { won, chosen } = loadSkins(this.registry);
    this.skinsWon = won;
    this.chosenSkin = chosen;
    // We start looking at the skin we are wearing
    this.index = SKIN_LIST.findIndex((s) => s.id === chosen);

    this.cameras.main.fadeIn(250);
    drawGrayCity(this);
    // Darker on top of the city, so the skins stand out
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.55);

    this.createTopBar();
    this.createCarousel();
    this.createChooseButton();
    this.createThumbnails();

    // Keyboard: arrows = move, ENTER = choose, ESC = back to the sala
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'ArrowLeft') this.move(-1);
      else if (event.key === 'ArrowRight') this.move(1);
      else if (event.key === 'Enter') this.choose();
      else if (event.key === 'Escape') this.back();
    });

    this.refresh();
  }

  // ---------------------------------------------------------------
  // Top: back button, title, and how many skins we have
  // ---------------------------------------------------------------
  createTopBar() {
    const backButton = this.add.rectangle(75, 40, 120, 40, 0x222222)
      .setStrokeStyle(2, 0xbbbbbb)
      .setInteractive({ useHandCursor: true });
    this.add.text(75, 40, '← SALA', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    backButton.on('pointerover', () => backButton.setFillStyle(0x444444));
    backButton.on('pointerout', () => backButton.setFillStyle(0x222222));
    backButton.on('pointerdown', () => this.back());

    this.add.text(400, 40, 'SKINS', {
      fontFamily: 'Arial', fontSize: '44px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.counter = this.add.text(780, 40, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#cccccc',
    }).setOrigin(1, 0.5);
  }

  // ---------------------------------------------------------------
  // Middle: the big skin, the small ones on the sides, and the arrows
  // ---------------------------------------------------------------
  createCarousel() {
    // Gray circles of light behind the skins, so the black ones (ninja, MR.1...) can be seen
    this.add.circle(400, 240, 115, 0x8a8a8a, 0.55);
    this.add.circle(195, 260, 58, 0x8a8a8a, 0.3);
    this.add.circle(605, 260, 58, 0x8a8a8a, 0.3);

    // A round floor (pedestal) under the big skin
    this.add.ellipse(400, 345, 230, 50, 0x555555).setStrokeStyle(3, 0x999999);

    this.leftImage = this.add.image(195, 260, 'hero').setAlpha(0.45);
    this.rightImage = this.add.image(605, 260, 'hero').setAlpha(0.45);
    this.bigImage = this.add.image(400, 245, 'hero');

    // The lock for skins we haven't won (it goes on top of the big skin)
    this.lock = this.add.text(400, 245, '🔒', {
      fontFamily: 'Arial', fontSize: '64px',
    }).setOrigin(0.5);

    this.nameText = this.add.text(400, 400, '', {
      fontFamily: 'Arial', fontSize: '32px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);

    // Clicking the small skins on the sides also moves to them
    this.leftImage.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.move(-1));
    this.rightImage.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.move(1));

    this.makeArrow(60, -1);
    this.makeArrow(740, 1);
  }

  // A round button with a triangle inside, pointing left (-1) or right (1)
  makeArrow(x, direction) {
    const circle = this.add.circle(x, 260, 34, 0xffffff)
      .setStrokeStyle(4, 0x000000)
      .setInteractive({ useHandCursor: true });
    // The triangle is drawn point by point: the tip looks to the side we go
    const triangle = this.add.graphics({ x, y: 260 });
    triangle.fillStyle(0x000000);
    triangle.fillTriangle(-direction * 10, -16, -direction * 10, 16, direction * 16, 0);
    circle.on('pointerover', () => circle.setFillStyle(0xdddddd));
    circle.on('pointerout', () => circle.setFillStyle(0xffffff));
    circle.on('pointerdown', () => this.move(direction));
  }

  // ---------------------------------------------------------------
  // The ELEGIR button (or ELEGIDA, or BLOQUEADA)
  // ---------------------------------------------------------------
  createChooseButton() {
    this.chooseButton = this.add.rectangle(400, 470, 260, 64, 0xffffff)
      .setStrokeStyle(5, 0x000000)
      .setInteractive({ useHandCursor: true });
    this.chooseLabel = this.add.text(400, 470, '', {
      fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#000000',
    }).setOrigin(0.5);
    this.chooseHint = this.add.text(400, 515, '', {
      fontFamily: 'Arial', fontSize: '15px', color: '#cccccc',
    }).setOrigin(0.5);
    this.chooseButton.on('pointerdown', () => this.choose());
  }

  // ---------------------------------------------------------------
  // Bottom: a little picture of every skin (click one to go to it)
  // ---------------------------------------------------------------
  createThumbnails() {
    this.thumbs = SKIN_LIST.map((info, i) => {
      const x = 400 + (i - (SKIN_LIST.length - 1) / 2) * 56;
      const frame = this.add.rectangle(x, 565, 46, 46, 0x777777)
        .setStrokeStyle(2, 0x333333)
        .setInteractive({ useHandCursor: true });
      const image = this.add.image(x, 565, skinTexture(this, info.id));
      fitImage(image, 36);
      const check = this.add.text(x + 18, 545, '✓', {
        fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5);
      frame.on('pointerdown', () => { this.index = i; this.refresh(true); });
      return { info, frame, image, check };
    });
  }

  // The skin at a position of the list (going around: after the last one comes the first one)
  skinAt(index) {
    const n = SKIN_LIST.length;
    return SKIN_LIST[((index % n) + n) % n];
  }

  move(step) {
    if (this.leaving) return;
    this.index = (this.index + step + SKIN_LIST.length) % SKIN_LIST.length;
    this.refresh(true);
  }

  // Put on the skin we are looking at (only if we won it!)
  choose() {
    if (this.leaving) return;
    const info = this.skinAt(this.index);
    if (!this.skinsWon.has(info.id)) {
      // Shake the button: "no, you can't!"
      this.tweens.add({ targets: this.chooseButton, x: 410, duration: 50, yoyo: true, repeat: 2 });
      return;
    }
    this.chosenSkin = info.id;
    saveSkins(this.registry, this.skinsWon, this.chosenSkin);
    this.refresh();
    // A little jump of happiness
    this.tweens.add({ targets: this.bigImage, y: 215, duration: 150, yoyo: true, ease: 'Quad.easeOut' });
  }

  back() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TitleScene');
    });
  }

  // Draw everything again for the skin we are looking at
  refresh(animate = false) {
    const show = (image, info, size) => {
      image.setTexture(skinTexture(this, info.id));
      fitImage(image, size);
      // Skins we haven't won are a black shadow (we only see their shape)
      if (this.skinsWon.has(info.id)) image.clearTint(); else image.setTint(0x000000);
    };

    const info = this.skinAt(this.index);
    const isWon = this.skinsWon.has(info.id);
    show(this.bigImage, info, 190);
    show(this.leftImage, this.skinAt(this.index - 1), 90);
    show(this.rightImage, this.skinAt(this.index + 1), 90);
    this.lock.setVisible(!isWon);
    this.nameText.setText(isWon ? info.name : '???');

    // The button says what we can do with this skin
    if (!isWon) {
      this.chooseButton.setFillStyle(0x333333);
      this.chooseLabel.setColor('#888888').setText('BLOQUEADA');
      this.chooseHint.setText('Gánala con un código en los Hacks de sala');
    } else if (info.id === this.chosenSkin) {
      this.chooseButton.setFillStyle(0xaaaaaa);
      this.chooseLabel.setColor('#000000').setText('ELEGIDA ✓');
      this.chooseHint.setText('');
    } else {
      this.chooseButton.setFillStyle(0xffffff);
      this.chooseLabel.setColor('#000000').setText('ELEGIR');
      this.chooseHint.setText('o presiona ENTER');
    }

    this.thumbs.forEach(({ info: t, frame, image, check }, i) => {
      const here = i === this.index;
      if (this.skinsWon.has(t.id)) image.clearTint(); else image.setTint(0x000000);
      frame.setStrokeStyle(here ? 4 : 2, here ? 0xffffff : 0x333333);
      frame.setFillStyle(here ? 0xaaaaaa : 0x777777);
      check.setVisible(t.id === this.chosenSkin);
    });

    this.counter.setText(`${this.skinsWon.size} de ${SKIN_LIST.length} skins`);

    // The new big skin "pops" in
    if (animate) {
      const scale = this.bigImage.scale;
      this.bigImage.setScale(scale * 0.8);
      this.tweens.add({ targets: this.bigImage, scale, duration: 160, ease: 'Back.easeOut' });
    }
  }
}

export default SkinsScene;
