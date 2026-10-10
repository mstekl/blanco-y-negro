// PassScene.js — The PASE BLANCO Y NEGRO tab (in the top bar of the sala, or P).
// It shows our level in the pass, the ⭐ stars, and the 50 levels with their
// prizes in two rows: GRATIS (for everybody) and PREMIUM (if we bought it).
// ◀ ▶ (or the arrow keys) move along the levels. The prizes are given by
// themselves when we reach a level (see src/data/pass.js).
// ESC goes back to the sala.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { drawTopBar } from '../ui/TopBar.js';
import {
  loadPass, passLevel, prizeFor, prizeText, buyPremium, currentSeason, daysLeftInSeason,
  PASS_LEVELS, STARS_PER_LEVEL, PREMIUM_PRICE,
} from '../data/pass.js';
import { SHOP_ITEMS } from '../data/shop.js';
import { SKIN_LIST, skinTexture, fitImage } from '../data/skins.js';
import { makeCoinTexture } from '../data/coins.js';
import Projectile from '../sprites/Projectile.js';
import { playSound } from '../audio/Sound.js';

const CARD_W = 100;   // how wide one level column is
const PER_PAGE = 7;   // how many levels we see at once

class PassScene extends Phaser.Scene {
  constructor() {
    super('PassScene');
  }

  create() {
    this.leaving = false;
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75);
    makeCoinTexture(this);
    Projectile.createPowerupTextures(this);
    this.refreshCoins = drawTopBar(this, 'PassScene', (scene) => this.goTo(scene));

    this.add.text(400, 78, `PASE BLANCO Y NEGRO · TEMPORADA ${currentSeason()}`, {
      fontFamily: 'Arial', fontSize: '28px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(400, 108, `Quedan ${daysLeftInSeason()} días · Gana ⭐ jugando: villanos, niveles, carreras, misiones...`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#bbbbbb',
    }).setOrigin(0.5);

    // Our level and the stars toward the next one
    this.levelText = this.add.text(60, 140, '', {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffdd33',
    }).setOrigin(0, 0.5);
    this.add.rectangle(330, 140, 300, 16, 0x333333).setOrigin(0, 0.5).setStrokeStyle(1, 0x888888);
    this.starBar = this.add.rectangle(330, 140, 300, 16, 0xffdd33).setOrigin(0, 0.5);
    this.starText = this.add.text(640, 140, '', {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffffff',
    }).setOrigin(0, 0.5);

    // The row names on the left
    this.add.text(14, 250, 'GRATIS', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#66ee88',
    }).setOrigin(0, 0.5).setAngle(-90).setOrigin(0.5);
    this.add.text(14, 400, 'PREMIUM', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffd700',
    }).setAngle(-90).setOrigin(0.5);

    // The cards are drawn again every time we move along the levels
    this.cards = this.add.container();
    this.page = Math.floor(Math.max(0, passLevel() - 1) / PER_PAGE);

    // ◀ ▶ to see the other levels
    this.arrow(26, '◀', () => this.turnPage(-1));
    this.arrow(774, '▶', () => this.turnPage(1));

    this.premiumButton = this.makePremiumButton();
    this.message = this.add.text(400, 525, '', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#ff8888',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('TitleScene');
      else if (event.key === 'ArrowLeft') this.turnPage(-1);
      else if (event.key === 'ArrowRight') this.turnPage(1);
      else if (event.key === 'Enter') this.tryBuyPremium();
    });

    this.refresh();
    this.cameras.main.fadeIn(250);
  }

  arrow(x, label, onClick) {
    const box = this.add.rectangle(x, 325, 40, 80, 0x222222).setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, 325, label, { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
    box.on('pointerdown', onClick);
  }

  turnPage(step) {
    const lastPage = Math.ceil(PASS_LEVELS / PER_PAGE) - 1;
    this.page = Phaser.Math.Clamp(this.page + step, 0, lastPage);
    this.refresh();
  }

  makePremiumButton() {
    const box = this.add.rectangle(400, 488, 360, 46, 0x3b2f00).setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(400, 488, '', {
      fontFamily: 'Arial', fontSize: '19px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    box.on('pointerdown', () => this.tryBuyPremium());
    return { box, label };
  }

  tryBuyPremium() {
    const problem = buyPremium();
    if (problem) {
      this.message.setColor('#ff8888').setText(problem);
      this.cameras.main.shake(150, 0.004);
    } else {
      playSound('ganar');
      this.message.setColor('#66ee88').setText('¡Ya tienes el PASE PREMIUM! 🎉');
    }
    this.refresh();
  }

  // Draw everything again: our level, the stars, and the 7 levels of this page
  refresh() {
    const pass = loadPass();
    const level = passLevel(pass);
    const inLevel = level >= PASS_LEVELS ? STARS_PER_LEVEL : pass.stars % STARS_PER_LEVEL;
    this.levelText.setText(`NIVEL ${level} / ${PASS_LEVELS}`);
    this.starBar.setScale(inLevel / STARS_PER_LEVEL, 1);
    this.starText.setText(level >= PASS_LEVELS ? '¡PASE COMPLETO!' : `⭐ ${inLevel} / ${STARS_PER_LEVEL}`);
    this.refreshCoins();

    if (pass.premium) {
      this.premiumButton.label.setText('⭐ PASE PREMIUM ACTIVO ⭐');
      this.premiumButton.box.disableInteractive();
    } else {
      this.premiumButton.label.setText(`👑 COMPRAR PREMIUM: ${PREMIUM_PRICE.toLocaleString('es')} monedas [ENTER]`);
    }

    this.cards.removeAll(true);
    const first = this.page * PER_PAGE + 1;
    for (let i = 0; i < PER_PAGE; i++) {
      const n = first + i;
      if (n > PASS_LEVELS) break;
      const x = 100 + i * CARD_W;
      const reached = n <= level;
      // The level number
      this.cards.add(this.add.text(x, 172, `${n}`, {
        fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: reached ? '#ffdd33' : '#888888',
      }).setOrigin(0.5));
      this.drawPrize(x, 255, prizeFor('gratis', n), reached, false);
      this.drawPrize(x, 395, prizeFor('premium', n), reached && pass.premium, !pass.premium);
    }
  }

  // One prize card: a picture and the words. Green check = we got it. Lock = premium not bought
  drawPrize(x, y, prize, got, locked) {
    const big = prize.type === 'skin';
    this.cards.add(this.add.rectangle(x, y, CARD_W - 8, 120, big ? 0x3a2a55 : 0x222222)
      .setStrokeStyle(3, got ? 0x66ee88 : big ? 0xcc88ff : 0x555555));

    let picture;
    let words;
    if (prize.type === 'coins') {
      picture = this.add.image(x, y - 18, 'coin').setScale(1.6);
      words = `${prize.amount}`;
    } else if (prize.type === 'item') {
      const item = SHOP_ITEMS.find((it) => it.id === prize.id);
      picture = this.add.image(x, y - 18, item.texture);
      fitImage(picture, 40);
      words = item.name;
    } else {
      const skin = SKIN_LIST.find((s) => s.id === prize.id);
      picture = this.add.image(x, y - 18, skinTexture(this, prize.id));
      fitImage(picture, 56);
      words = skin ? skin.name : prizeText(prize);
    }
    this.cards.add(picture);
    this.cards.add(this.add.text(x, y + 36, words, {
      fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
      align: 'center', wordWrap: { width: CARD_W - 14 },
    }).setOrigin(0.5));
    if (got) this.cards.add(this.add.text(x + 36, y - 48, '✅', { fontSize: '16px' }).setOrigin(0.5));
    if (locked) {
      picture.setAlpha(0.5);
      this.cards.add(this.add.text(x + 36, y - 48, '🔒', { fontSize: '16px' }).setOrigin(0.5));
    }
  }

  goTo(sceneName) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName));
  }
}

export default PassScene;
