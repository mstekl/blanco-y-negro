// PassScene.js — The PASE BLANCO Y NEGRO tab (in the top bar of the sala, or P).
// It looks like the battle pass of Fortnite:
//   - At the top: our level (of 100), the ⭐ stars toward the next level,
//     and our 🏅 medals (each level gives one).
//   - On the right: a PAGE with 8 prizes (4 GRATIS, 4 PREMIUM 👑).
//     ◀ ▶ (or the arrow keys) change the page. Locked pages open after
//     unlocking 4 prizes of the page before.
//   - On the left: the prize we touched, BIG and turning around, with its name
//     and rarity, and the DESBLOQUEAR button that spends the medals.
// Keys: 1 to 8 pick a prize, ENTER unlocks it, P buys PREMIUM, ESC goes back to the sala.
// (The rules and the prizes are in src/data/pass.js)

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { drawTopBar } from '../ui/TopBar.js';
import {
  loadPass, passLevel, pagePrizes, medalsLeft, claimedOnPage, isPageOpen, claimPrize, buyPremium,
  currentSeason, daysLeftInSeason, PASS_LEVELS, STARS_PER_LEVEL, PREMIUM_PRICE, PAGE_COUNT,
  PRIZES_TO_OPEN_PAGE,
} from '../data/pass.js';
import { SKIN_LIST, skinTexture, fitImage } from '../data/skins.js';
import { makeCoinTexture, RARITIES, SKIN_RARITY } from '../data/coins.js';
import { playSound } from '../audio/Sound.js';

// Where the 8 prize cards go: 4 columns and 2 rows (GRATIS on top, PREMIUM below)
const CARD_W = 96;
const CARD_H = 118;
const COLUMNS_X = [395, 497, 599, 701];
const ROWS_Y = [262, 392];
// The big prize on the left
const BIG_X = 160;
const BIG_Y = 290;

class PassScene extends Phaser.Scene {
  constructor() {
    super('PassScene');
  }

  create() {
    this.leaving = false;
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75);
    makeCoinTexture(this);
    this.refreshCoins = drawTopBar(this, 'PassScene', (scene) => this.goTo(scene));

    this.add.text(400, 72, `PASE BLANCO Y NEGRO · TEMPORADA ${currentSeason()}`, {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(400, 99, `Quedan ${daysLeftInSeason()} días · Gana ⭐ jugando · Cada nivel = 1 🏅 para elegir un premio`, {
      fontFamily: 'Arial', fontSize: '13px', color: '#bbbbbb',
    }).setOrigin(0.5);

    this.createLevelBar();
    this.createBigPrize();
    this.createPageHeader();
    this.cards = this.add.container();
    this.premiumButton = this.makePremiumButton();

    // We start on the newest page that is open and still has prizes to take
    const pass = loadPass();
    this.page = 1;
    for (let page = 1; page <= PAGE_COUNT; page++) {
      if (!isPageOpen(pass, page)) break;
      this.page = page;
      if (claimedOnPage(pass, page) < pagePrizes(page).length) break;
    }
    this.selected = this.firstFreePrize(pass);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('TitleScene');
      else if (event.key === 'ArrowLeft') this.turnPage(-1);
      else if (event.key === 'ArrowRight') this.turnPage(1);
      else if (event.key === 'Enter') this.unlockSelected();
      else if (event.code === 'KeyP') this.tryBuyPremium();
      else if (/^[1-8]$/.test(event.key)) this.select(Number(event.key) - 1);
    });

    this.refresh();
    this.cameras.main.fadeIn(250);
  }

  // --- Top: level, stars and medals ---
  createLevelBar() {
    this.levelText = this.add.text(24, 132, '', {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffdd33',
    }).setOrigin(0, 0.5);
    this.add.rectangle(200, 132, 250, 16, 0x333333).setOrigin(0, 0.5).setStrokeStyle(1, 0x888888);
    this.starBar = this.add.rectangle(200, 132, 250, 16, 0xffdd33).setOrigin(0, 0.5);
    this.starText = this.add.text(460, 132, '', {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffffff',
    }).setOrigin(0, 0.5);
    // Our medals, in a gold box: this is what we spend
    this.add.rectangle(700, 132, 170, 36, 0x3b2f00).setStrokeStyle(2, 0xffd700);
    this.medalText = this.add.text(700, 132, '', {
      fontFamily: 'Arial', fontSize: '19px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
  }

  // --- Left: the prize we chose, big, on a pedestal ---
  createBigPrize() {
    this.add.rectangle(BIG_X, 370, 290, 420, 0x1a1a1a, 0.9).setStrokeStyle(2, 0x555555);
    this.bigGlow = this.add.circle(BIG_X, BIG_Y, 95, 0x8a8a8a, 0.35);
    this.add.ellipse(BIG_X, BIG_Y + 95, 190, 36, 0x555555).setStrokeStyle(3, 0x999999);
    this.bigImage = this.add.image(BIG_X, BIG_Y, 'coin');
    this.bigName = this.add.text(BIG_X, 418, '', {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4, align: 'center', wordWrap: { width: 270 },
    }).setOrigin(0.5);
    this.bigRarity = this.add.text(BIG_X, 446, '', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    // The DESBLOQUEAR button under the big prize
    this.unlockBox = this.add.rectangle(BIG_X, 495, 250, 50, 0x222222).setStrokeStyle(3, 0x66ee88)
      .setInteractive({ useHandCursor: true });
    this.unlockLabel = this.add.text(BIG_X, 495, '', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.unlockBox.on('pointerdown', () => this.unlockSelected());

    this.message = this.add.text(BIG_X, 545, '', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#ff8888',
      align: 'center', wordWrap: { width: 280 },
    }).setOrigin(0.5);
  }

  // --- Right, at the top: ◀ PÁGINA 3 / 10 ▶ ---
  createPageHeader() {
    this.arrow(345, '◀', () => this.turnPage(-1));
    this.arrow(751, '▶', () => this.turnPage(1));
    this.pageText = this.add.text(548, 178, '', {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.pageHint = this.add.text(548, 470, '', {
      fontFamily: 'Arial', fontSize: '14px', color: '#cccccc', align: 'center',
    }).setOrigin(0.5);
  }

  arrow(x, label, onClick) {
    const box = this.add.rectangle(x, 178, 44, 34, 0x222222).setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, 178, label, { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
    box.on('pointerdown', onClick);
  }

  makePremiumButton() {
    const box = this.add.rectangle(548, 530, 400, 46, 0x3b2f00).setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(548, 530, '', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    box.on('pointerdown', () => this.tryBuyPremium());
    return { box, label };
  }

  // The first prize of this page we don't have yet (or the first one)
  firstFreePrize(pass) {
    const index = pagePrizes(this.page).findIndex((prize) => !pass.claimed.includes(prize.id));
    return Math.max(0, index);
  }

  turnPage(step) {
    const page = Phaser.Math.Clamp(this.page + step, 1, PAGE_COUNT);
    if (page === this.page) return;
    this.page = page;
    this.selected = this.firstFreePrize(loadPass());
    this.message.setText('');
    this.refresh();
  }

  select(index) {
    this.selected = index;
    this.message.setText('');
    this.refresh();
  }

  unlockSelected() {
    const prize = pagePrizes(this.page)[this.selected];
    const problem = claimPrize(prize.id);
    if (problem) {
      this.message.setColor('#ff8888').setText(problem);
      this.tweens.add({ targets: this.unlockBox, x: BIG_X + 8, duration: 50, yoyo: true, repeat: 2 });
      return;
    }
    playSound('ganar');
    this.message.setColor('#66ee88').setText(`¡Desbloqueaste: ${this.prizeName(prize)}! 🎉`);
    // A little jump of happiness, and the page may open the next one
    this.tweens.add({ targets: this.bigImage, y: BIG_Y - 30, duration: 160, yoyo: true, ease: 'Quad.easeOut' });
    const pass = loadPass();
    if (claimedOnPage(pass, this.page) === PRIZES_TO_OPEN_PAGE && this.page < PAGE_COUNT) {
      this.message.setText(`¡Desbloqueaste: ${this.prizeName(prize)}! 🎉\n¡Se abrió la página ${this.page + 1}! ▶`);
    }
    this.refresh();
  }

  tryBuyPremium() {
    const problem = buyPremium();
    if (problem) {
      this.message.setColor('#ff8888').setText(problem);
      this.cameras.main.shake(150, 0.004);
    } else {
      playSound('ganar');
      this.message.setColor('#66ee88').setText('¡Ya tienes el PASE PREMIUM! 👑🎉');
    }
    this.refresh();
  }

  // --- What a prize looks like ---
  prizeName(prize) {
    if (prize.type === 'coins') return `${prize.amount} monedas`;
    return SKIN_LIST.find((s) => s.id === prize.skin)?.name || prize.skin;
  }

  prizeTexture(prize) {
    if (prize.type === 'coins') return 'coin';
    return skinTexture(this, prize.skin);
  }

  // Coins are COMÚN; skins have their own rarity
  prizeRarity(prize) {
    return RARITIES[prize.type === 'skin' ? SKIN_RARITY[prize.skin] || 'raro' : 'comun'];
  }

  // Draw everything again
  refresh() {
    const pass = loadPass();
    const level = passLevel(pass);
    const inLevel = level >= PASS_LEVELS ? STARS_PER_LEVEL : pass.stars % STARS_PER_LEVEL;
    this.levelText.setText(`NIVEL ${level} / ${PASS_LEVELS}`);
    this.starBar.setScale(inLevel / STARS_PER_LEVEL, 1);
    this.starText.setText(level >= PASS_LEVELS ? '¡NIVEL MÁXIMO!' : `⭐ ${inLevel} / ${STARS_PER_LEVEL}`);
    this.medalText.setText(`🏅 ${medalsLeft(pass)} medallas`);
    this.refreshCoins();

    if (pass.premium) {
      this.premiumButton.label.setText('👑 PASE PREMIUM ACTIVO 👑');
      this.premiumButton.box.disableInteractive();
    } else {
      this.premiumButton.label.setText(`👑 COMPRAR PREMIUM: ${PREMIUM_PRICE.toLocaleString('es')} monedas [P]`);
    }

    this.drawPage(pass);
    this.drawBigPrize(pass);
  }

  // The 8 cards of the page
  drawPage(pass) {
    const open = isPageOpen(pass, this.page);
    const prizes = pagePrizes(this.page);
    this.pageText.setText(`${open ? '' : '🔒 '}PÁGINA ${this.page} / ${PAGE_COUNT}`);
    this.cards.removeAll(true);

    prizes.forEach((prize, i) => {
      const x = COLUMNS_X[i % 4];
      const y = ROWS_Y[Math.floor(i / 4)];
      const got = pass.claimed.includes(prize.id);
      const premiumLocked = prize.row === 'premium' && !pass.premium;
      const rarity = this.prizeRarity(prize);
      const color = Phaser.Display.Color.HexStringToColor(rarity.color).color;
      const here = i === this.selected;

      const box = this.add.rectangle(x, y, CARD_W, CARD_H, prize.type === 'skin' ? 0x3a2a55 : 0x222222)
        .setStrokeStyle(here ? 5 : 3, here ? 0xffffff : color)
        .setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.select(i));
      this.cards.add(box);

      const picture = this.add.image(x, y - 12, this.prizeTexture(prize));
      fitImage(picture, prize.type === 'skin' ? 64 : 40);
      if (!open) picture.setTint(0x000000); // a locked page only shows the shapes
      else if (premiumLocked && !got) picture.setAlpha(0.6);
      this.cards.add(picture);

      // Top left: 👑 for PREMIUM. Bottom: what it costs, or ✅ when it is ours
      if (prize.row === 'premium') {
        this.cards.add(this.add.text(x - 38, y - 50, '👑', { fontSize: '14px' }).setOrigin(0.5));
      }
      this.cards.add(this.add.text(x, y + 44, got ? '✅' : `🏅 ${prize.cost}`, {
        fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5));
      // The number key, small in the top right corner
      this.cards.add(this.add.text(x + 40, y - 52, `${i + 1}`, {
        fontFamily: 'Arial', fontSize: '11px', color: '#999999',
      }).setOrigin(0.5));
    });

    const taken = claimedOnPage(pass, this.page);
    if (!open) {
      this.pageHint.setText(`🔒 Desbloquea ${PRIZES_TO_OPEN_PAGE} premios de la página ${this.page - 1} para abrir esta`);
    } else if (this.page < PAGE_COUNT && taken < PRIZES_TO_OPEN_PAGE) {
      this.pageHint.setText(`Tienes ${taken} de 8 · Desbloquea ${PRIZES_TO_OPEN_PAGE} para abrir la página ${this.page + 1}`);
    } else {
      this.pageHint.setText(`Tienes ${taken} de 8 premios de esta página`);
    }
  }

  // The prize we chose, BIG and turning around (like the skins in the Fortnite pass)
  drawBigPrize(pass) {
    const prize = pagePrizes(this.page)[this.selected];
    const open = isPageOpen(pass, this.page);
    const got = pass.claimed.includes(prize.id);
    const rarity = this.prizeRarity(prize);

    this.bigImage.setTexture(this.prizeTexture(prize));
    fitImage(this.bigImage, prize.type === 'skin' ? 170 : 110);
    if (open) this.bigImage.clearTint(); else this.bigImage.setTint(0x000000);
    this.bigGlow.setFillStyle(Phaser.Display.Color.HexStringToColor(rarity.color).color, 0.3);
    this.bigName.setText(open ? this.prizeName(prize) : '???');
    this.bigRarity.setColor(rarity.color)
      .setText(`${rarity.name} · ${prize.row === 'premium' ? '👑 PREMIUM' : 'GRATIS'}`);

    // Turning around: the picture gets thin, flips, and gets wide again, over and over
    const scale = this.bigImage.scaleY;
    if (this.turning) this.turning.stop();
    this.bigImage.setScale(scale);
    this.turning = this.tweens.add({
      targets: this.bigImage, scaleX: -scale, duration: 1400, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut', hold: 600, repeatDelay: 600,
    });

    // What the button says
    let label;
    let color = 0x66ee88;
    if (got) {
      label = '✅ ¡YA ES TUYO!';
      color = 0x888888;
    } else if (!open) {
      label = '🔒 PÁGINA BLOQUEADA';
      color = 0x888888;
    } else if (prize.row === 'premium' && !pass.premium) {
      label = '👑 SOLO PREMIUM';
      color = 0xffd700;
    } else {
      label = `DESBLOQUEAR 🏅 ${prize.cost} [ENTER]`;
      if (medalsLeft(pass) < prize.cost) color = 0xff8888;
    }
    this.unlockLabel.setText(label);
    this.unlockBox.setStrokeStyle(3, color);
  }

  goTo(sceneName) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName));
  }
}

export default PassScene;
