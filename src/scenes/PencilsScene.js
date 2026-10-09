// PencilsScene.js — The LÁPICES screen: buy a pencil with coins and open it!
// We get here with the LÁPICES button of the sala.
//   - A pencil costs PENCIL_PRICE coins (we pick up coins inside the levels)
//   - When we open it, the pencil PAINTS a surprise skin on a sheet of paper,
//     line by line, like coloring a drawing
//   - Some skins are común (they come out a lot) and some are rare: raro,
//     épico and the LEGENDARIO one (almost never!)
//   - If the skin was already ours... bad luck, it's repeated
//   - ESC or "← SALA" goes back

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { SKIN_LIST, loadSkins, saveSkins, skinTexture, fitImage } from '../data/skins.js';
import {
  PENCIL_PRICE, RARITIES, SKIN_RARITY, loadCoins, addCoins, pickRandomSkin, makeCoinTexture,
} from '../data/coins.js';

// The sheet of paper where the pencil paints (center and size)
const PAPER_X = 400;
const PAPER_Y = 250;
const PAPER_SIZE = 230;
// The pencil paints the skin in this many lines, going left → right, then right → left...
const PAINT_ROWS = 7;
const PAINT_TIME = 2600; // milliseconds

class PencilsScene extends Phaser.Scene {
  constructor() {
    super('PencilsScene');
  }

  create() {
    this.leaving = false;
    // 'listo' = waiting, 'pintando' = the pencil is painting, 'terminado' = we see the prize
    this.state = 'listo';
    const { won, chosen } = loadSkins(this.registry);
    this.skinsWon = won;
    this.chosenSkin = chosen;

    makeCoinTexture(this);
    if (!this.textures.exists('big-pencil')) createPencilTexture(this);

    this.cameras.main.fadeIn(250);
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.55);

    this.createTopBar();
    this.createPaper();
    this.createOpenButton();

    // Keyboard: ENTER = open a pencil, ESC = back to the sala
    // (holding ENTER down repeats the key: we ignore the repeats, so we
    // don't spend ALL our coins by accident)
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Enter' && !event.repeat) this.openPencil();
      else if (event.key === 'Escape') this.back();
    });

    this.refresh();
  }

  // ---------------------------------------------------------------
  // Top: back button, title, and our coins
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

    this.add.text(400, 40, 'LÁPICES', {
      fontFamily: 'Arial', fontSize: '44px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.coinText = this.add.text(780, 40, '', {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(1, 0.5);
    this.coinIcon = this.add.image(0, 40, 'coin').setScale(1.3);
  }

  // ---------------------------------------------------------------
  // Middle: the sheet of paper, the skin hidden on it, and the pencil
  // ---------------------------------------------------------------
  createPaper() {
    // The paper, with a little shadow
    this.add.rectangle(PAPER_X + 6, PAPER_Y + 6, PAPER_SIZE, PAPER_SIZE, 0x000000, 0.4);
    this.paper = this.add.rectangle(PAPER_X, PAPER_Y, PAPER_SIZE, PAPER_SIZE, 0xf4f1e8)
      .setStrokeStyle(4, 0xffffff);

    // A big "?" while we wait
    this.question = this.add.text(PAPER_X, PAPER_Y, '?', {
      fontFamily: 'Arial', fontSize: '130px', fontStyle: 'bold', color: '#c8c3b4',
    }).setOrigin(0.5);

    // The prize skin. It is hidden behind a "mask": only the parts the pencil
    // already painted can be seen. The mask is a drawing we make bigger and bigger.
    this.prizeImage = this.add.image(PAPER_X, PAPER_Y, 'hero').setVisible(false);
    this.maskShape = this.make.graphics({}, false);
    this.prizeImage.setMask(this.maskShape.createGeometryMask());

    // The pencil: the point of the picture is at its tip, so we move the tip around
    this.pencil = this.add.image(PAPER_X + 120, PAPER_Y + 10, 'big-pencil')
      .setOrigin(0.5, 1).setAngle(30).setDepth(5);
    // While waiting, the pencil floats up and down
    this.floatTween = this.tweens.add({
      targets: this.pencil, y: PAPER_Y - 5, duration: 900,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // The rarity (COMÚN, RARO...) and the name of the skin, under the paper
    this.rarityText = this.add.text(400, 388, '', {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.nameText = this.add.text(400, 420, '', {
      fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);
  }

  // ---------------------------------------------------------------
  // The ABRIR button
  // ---------------------------------------------------------------
  createOpenButton() {
    this.openButton = this.add.rectangle(400, 495, 300, 64, 0xffffff)
      .setStrokeStyle(5, 0x000000)
      .setInteractive({ useHandCursor: true });
    this.openLabel = this.add.text(400, 495, '', {
      fontFamily: 'Arial', fontSize: '28px', fontStyle: 'bold', color: '#000000',
    }).setOrigin(0.5);
    this.openHint = this.add.text(400, 545, '', {
      fontFamily: 'Arial', fontSize: '15px', color: '#cccccc',
    }).setOrigin(0.5);
    this.openButton.on('pointerdown', () => this.openPencil());
  }

  // Draw the coins and the button again
  refresh() {
    const coins = loadCoins();
    this.coinText.setText(String(coins));
    this.coinIcon.setX(this.coinText.x - this.coinText.width - 18);

    const canBuy = coins >= PENCIL_PRICE;
    const word = this.state === 'terminado' ? 'ABRIR OTRO' : 'ABRIR';
    this.openLabel.setText(`${word} (${PENCIL_PRICE} 🪙)`);
    this.openButton.setFillStyle(canBuy ? 0xffffff : 0x333333);
    this.openLabel.setColor(canBuy ? '#000000' : '#888888');
    const missing = PENCIL_PRICE - coins;
    this.openHint.setText(canBuy
      ? 'o presiona ENTER'
      : `Te ${missing === 1 ? 'falta 1 moneda' : `faltan ${missing} monedas`} · agárralas en los niveles`);
  }

  // ---------------------------------------------------------------
  // Open a pencil!
  // ---------------------------------------------------------------
  openPencil() {
    if (this.leaving || this.state === 'pintando') return;

    if (loadCoins() < PENCIL_PRICE) {
      // Shake the button: "not enough coins!"
      this.tweens.add({ targets: this.openButton, x: 410, duration: 50, yoyo: true, repeat: 2 });
      return;
    }

    addCoins(-PENCIL_PRICE);
    this.state = 'pintando';
    this.refresh();

    // Pick the prize now, and save it right away (so closing the page
    // in the middle of the painting doesn't lose it)
    this.prize = pickRandomSkin();
    this.isNew = !this.skinsWon.has(this.prize.id);
    this.skinsWon.add(this.prize.id);
    saveSkins(this.registry, this.skinsWon, this.chosenSkin);

    // Clean the paper
    this.question.setVisible(false);
    this.rarityText.setText('');
    this.nameText.setText('');
    this.maskShape.clear();
    this.prizeImage.setTexture(skinTexture(this, this.prize.id)).setVisible(true);
    fitImage(this.prizeImage, PAPER_SIZE - 40);

    // The pencil stops floating and shakes with excitement before painting
    this.floatTween.stop();
    this.tweens.add({
      targets: this.pencil, angle: 40, duration: 70, yoyo: true, repeat: 4,
      onComplete: () => this.paint(),
    });
  }

  // The pencil goes over the paper line by line (zig-zag), and every place
  // it passes shows that part of the skin
  paint() {
    const left = PAPER_X - PAPER_SIZE / 2;
    const top = PAPER_Y - PAPER_SIZE / 2;
    const rowHeight = PAPER_SIZE / PAINT_ROWS;
    const progress = { value: 0 };

    this.tweens.add({
      targets: progress,
      value: 1,
      duration: PAINT_TIME,
      onUpdate: () => {
        // Which line are we on, and how far along it (0 = start, 1 = end)?
        const done = progress.value * PAINT_ROWS;
        const row = Math.min(PAINT_ROWS - 1, Math.floor(done));
        const along = done - row;
        // Even lines go to the right, odd lines come back to the left
        const goingRight = row % 2 === 0;
        const tipX = goingRight ? left + along * PAPER_SIZE : left + (1 - along) * PAPER_SIZE;
        const tipY = top + row * rowHeight + rowHeight / 2;

        // The mask: all the finished lines, plus the piece of this line
        this.maskShape.clear();
        this.maskShape.fillStyle(0xffffff);
        this.maskShape.fillRect(left, top, PAPER_SIZE, row * rowHeight);
        const pieceX = goingRight ? left : tipX;
        this.maskShape.fillRect(pieceX, top + row * rowHeight, along * PAPER_SIZE, rowHeight);

        // The pencil tip follows the painting, wiggling a little like a real hand
        this.pencil.setPosition(tipX, tipY + Math.sin(progress.value * 90) * 4);
        this.pencil.setAngle(goingRight ? 30 : 15);
      },
      onComplete: () => this.showPrize(),
    });
  }

  // The painting is finished: show the whole skin, its rarity and its name
  showPrize() {
    this.maskShape.clear();
    this.maskShape.fillStyle(0xffffff);
    this.maskShape.fillRect(PAPER_X - PAPER_SIZE / 2, PAPER_Y - PAPER_SIZE / 2, PAPER_SIZE, PAPER_SIZE);

    // The pencil goes back to its place and floats again
    this.tweens.add({
      targets: this.pencil, x: PAPER_X + 120, y: PAPER_Y + 10, angle: 30, duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.floatTween = this.tweens.add({
          targets: this.pencil, y: PAPER_Y - 5, duration: 900,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      },
    });

    const rarity = RARITIES[SKIN_RARITY[this.prize.id]];
    this.rarityText.setColor(rarity.color).setText(rarity.name);
    this.nameText.setText(this.isNew ? `¡NUEVO! ${this.prize.name}` : `${this.prize.name} (repetido)`);

    // The skin "pops" and colored sparks fly out (more sparks for rarer skins!)
    const scale = this.prizeImage.scale;
    this.prizeImage.setScale(scale * 0.85);
    this.tweens.add({ targets: this.prizeImage, scale, duration: 300, ease: 'Back.easeOut' });
    const sparks = { comun: 12, raro: 20, epico: 30, legendario: 50 }[SKIN_RARITY[this.prize.id]];
    this.throwSparks(sparks);

    this.state = 'terminado';
    this.refresh();
  }

  // Little rainbow dots that fly out from the paper and disappear
  throwSparks(count) {
    const colors = [0xff4444, 0xff9933, 0xffee33, 0x44dd66, 0x3399ff, 0xaa55ff];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 140 + Math.random() * 120;
      const spark = this.add.circle(PAPER_X, PAPER_Y, 4 + Math.random() * 4, colors[i % colors.length])
        .setDepth(10);
      this.tweens.add({
        targets: spark,
        x: PAPER_X + Math.cos(angle) * distance,
        y: PAPER_Y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 700 + Math.random() * 500,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  back() {
    // We don't leave in the middle of the painting (the prize is already saved anyway)
    if (this.leaving || this.state === 'pintando') return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TitleScene');
    });
  }
}

// A big colored pencil, standing up, with the tip at the bottom.
// (The real pencil is rainbow: it is the one that brings the color back!)
function createPencilTexture(scene) {
  const gfx = scene.add.graphics();
  const stripes = [0xff4444, 0xff9933, 0xffee33, 0x44dd66, 0x3399ff, 0xaa55ff];
  // The eraser on top
  gfx.fillStyle(0xff99aa);
  gfx.fillRect(4, 0, 20, 12);
  gfx.fillStyle(0xbbbbbb);
  gfx.fillRect(4, 12, 20, 6);
  // The body, with rainbow stripes
  stripes.forEach((color, i) => {
    gfx.fillStyle(color);
    gfx.fillRect(4, 18 + i * 12, 20, 12);
  });
  // The sharpened wood, and the colored tip
  gfx.fillStyle(0xf0c890);
  gfx.fillTriangle(4, 90, 24, 90, 14, 112);
  gfx.fillStyle(0xff4444);
  gfx.fillTriangle(10, 104, 18, 104, 14, 112);
  gfx.generateTexture('big-pencil', 28, 112);
  gfx.destroy();
}

export default PencilsScene;
