// ShopScene.js — The TIENDA tab (in the top bar of the sala, or T).
// Two parts:
//   - SKINS DEL DÍA: 4 skins to buy with coins. They change every day!
//     (the price depends on how rare the skin is; the PASE skins are never here)
//   - POWER-UPS: Escudo, Vida extra and Lápiz de color. They go to our backpack
//     and are used when the next game of JUGAR or SUPERVIVENCIA starts
//     (see src/data/shop.js).
// Keys: 1 2 3 4 buy a skin, 5 6 7 buy a power-up, ESC goes back to the sala.
// The second tab (B): 4 BAILES, MOCHILAS or MASCOTAS of the day (keys 1 to 4),
// and a PROBADOR to try them on our hero before buying them.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { drawTopBar } from '../ui/TopBar.js';
import { SHOP_ITEMS, MAX_EACH, buy, loadBackpack } from '../data/shop.js';
import { loadCoins, addCoins, RARITIES, SKIN_RARITY } from '../data/coins.js';
import { SKIN_LIST, PASS_SKIN_IDS, loadSkins, saveSkins, skinTexture, fitImage } from '../data/skins.js';
import Projectile from '../sprites/Projectile.js';
import { playSound } from '../audio/Sound.js';
import {
  COSMETIC_TYPES, COSMETIC_PRICES, cosmeticsOfTheDay, buyCosmetic, loadCosmetics,
} from '../data/cosmetics.js';
import { cosmeticTexture, attachCosmetics, playEmote } from '../sprites/Cosmetics.js';

// How much a skin costs, by rarity
const SKIN_PRICES = { comun: 50, raro: 100, epico: 200, legendario: 400 };
const SKINS_PER_DAY = 4;

// The 4 skins of today. They are picked with the date, so they are the
// same all day long, and change tomorrow.
function skinsOfTheDay() {
  const d = new Date();
  let seed = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const choices = SKIN_LIST.filter((s) => SKIN_RARITY[s.id] && !PASS_SKIN_IDS.includes(s.id));
  const picked = [];
  while (picked.length < SKINS_PER_DAY && choices.length) {
    picked.push(choices.splice(Math.floor(random() * choices.length), 1)[0]);
  }
  return picked;
}

class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  // data.tab = 'mas' opens the second tab: BAILES, MOCHILAS y MASCOTAS
  init(data = {}) {
    this.tab = data.tab === 'mas' ? 'mas' : 'skins';
  }

  create() {
    this.leaving = false;
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75);
    Projectile.createPowerupTextures(this);
    this.refreshCoins = drawTopBar(this, 'ShopScene', (scene) => this.goTo(scene));

    // Bottom right: the button to change tabs (or the B key)
    const other = this.tab === 'skins' ? '💃 BAILES Y MÁS ▶ [B]' : '◀ SKINS Y POWER-UPS [B]';
    const tabButton = this.add.rectangle(670, 568, 240, 40, 0x222222)
      .setStrokeStyle(3, 0xff77bb).setInteractive({ useHandCursor: true });
    this.add.text(670, 568, other, {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    tabButton.on('pointerdown', () => this.switchTab());

    if (this.tab === 'mas') {
      this.createCosmeticsTab();
      return;
    }

    this.sectionTitle(76, '⭐ SKINS DEL DÍA', '¡Cambian todos los días!');
    this.skinCards = skinsOfTheDay().map((skin, i) => this.makeSkinCard(skin, 115 + i * 190, i));

    this.sectionTitle(300, '🎒 POWER-UPS', 'Se usan al empezar tu próxima partida de JUGAR o SUPERVIVENCIA');
    this.itemCards = SHOP_ITEMS.map((item, i) => this.makeItemCard(item, 160 + i * 240, i));

    this.message = this.add.text(290, 568, '', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#ff8888',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('TitleScene');
      if (event.code === 'KeyB') this.switchTab();
      const number = parseInt(event.key, 10);
      if (this.skinCards[number - 1]) this.buySkin(this.skinCards[number - 1].skin);
      const item = SHOP_ITEMS[number - 1 - SKINS_PER_DAY];
      if (item) this.buyItem(item);
    });

    this.refresh();
    this.cameras.main.fadeIn(250);
  }

  sectionTitle(y, title, line) {
    this.add.text(30, y, title, {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.add.text(770, y, line, {
      fontFamily: 'Arial', fontSize: '13px', color: '#aaaaaa',
    }).setOrigin(1, 0.5);
  }

  // A skin of the day: picture, name, rarity and price
  makeSkinCard(skin, x, i) {
    const rarity = RARITIES[SKIN_RARITY[skin.id]];
    const color = Phaser.Display.Color.HexStringToColor(rarity.color).color;
    this.add.rectangle(x, 185, 170, 170, 0x222222).setStrokeStyle(3, color);
    fitImage(this.add.image(x, 152, skinTexture(this, skin.id)), 70);
    this.add.text(x, 204, skin.name, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      align: 'center', wordWrap: { width: 160 },
    }).setOrigin(0.5);
    this.add.text(x, 224, rarity.name, {
      fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold', color: rarity.color,
    }).setOrigin(0.5);
    const button = this.add.rectangle(x, 252, 140, 30, 0x1d3b24)
      .setStrokeStyle(2, 0x66ee88).setInteractive({ useHandCursor: true });
    const label = this.add.text(x, 252, '', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    button.on('pointerdown', () => this.buySkin(skin));
    return { skin, price: SKIN_PRICES[SKIN_RARITY[skin.id]], button, label, key: i + 1 };
  }

  // A power-up: picture, name, what it does, how many we have, and the price
  makeItemCard(item, x, i) {
    this.add.rectangle(x, 420, 210, 190, 0x222222).setStrokeStyle(3, 0xffd700);
    const picture = this.add.image(x, 360, item.texture);
    picture.setScale(44 / Math.max(picture.width, picture.height));
    this.add.text(x, 400, item.name, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(x, 428, item.text, {
      fontFamily: 'Arial', fontSize: '13px', color: '#bbbbbb', align: 'center', wordWrap: { width: 190 },
    }).setOrigin(0.5);
    const owned = this.add.text(x, 452, '', {
      fontFamily: 'Arial', fontSize: '13px', color: '#66ee88',
    }).setOrigin(0.5);
    const button = this.add.rectangle(x, 488, 160, 34, 0x1d3b24)
      .setStrokeStyle(2, 0x66ee88).setInteractive({ useHandCursor: true });
    this.add.image(x - 46, 488, 'coin');
    this.add.text(x + 8, 488, `${item.price}  [${SKINS_PER_DAY + i + 1}]`, {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    button.on('pointerdown', () => this.buyItem(item));
    return { item, owned };
  }

  buySkin(skin) {
    const { won, chosen } = loadSkins(this.registry);
    const price = SKIN_PRICES[SKIN_RARITY[skin.id]];
    if (won.has(skin.id)) {
      this.say('¡Esa skin ya es tuya!', false);
    } else if (loadCoins() < price) {
      this.say('No te alcanzan las monedas', false);
    } else {
      addCoins(-price);
      won.add(skin.id);
      saveSkins(this.registry, won, chosen);
      playSound('comprar');
      this.say(`¡Compraste la skin ${skin.name}! Póntela en el CASILLERO`, true);
    }
    this.refresh();
  }

  buyItem(item) {
    const problem = buy(item.id);
    if (problem) this.say(problem, false);
    else {
      playSound('comprar');
      this.say(`¡Compraste: ${item.name}!`, true);
    }
    this.refresh();
  }

  say(text, good) {
    this.message.setColor(good ? '#66ee88' : '#ff8888').setText(text);
    if (!good) this.cameras.main.shake(150, 0.004);
  }

  switchTab() {
    if (this.leaving) return;
    this.scene.restart({ tab: this.tab === 'skins' ? 'mas' : 'skins' });
  }

  // ---------------------------------------------------------------
  // The second tab: 4 BAILES, MOCHILAS or MASCOTAS of the day, and the
  // PROBADOR (fitting room): touch one to see it on our hero before buying it
  // ---------------------------------------------------------------
  createCosmeticsTab() {
    this.sectionTitle(76, '💃 BAILES, MOCHILAS Y MASCOTAS DEL DÍA', '¡Cambian todos los días!');
    this.cosmeticCards = cosmeticsOfTheDay().map((c, i) => this.makeCosmeticCard(c, 115 + i * 190, i));

    // The probador: our hero, big, wearing our skin
    this.add.text(400, 300, '🪞 PROBADOR · toca algo para probártelo', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#cccccc',
    }).setOrigin(0.5);
    this.add.circle(400, 420, 95, 0x8a8a8a, 0.4);
    this.tryHero = this.add.image(400, 420, skinTexture(this, loadSkins(this.registry).chosen));
    fitImage(this.tryHero, 150);
    this.takeOff = () => {};

    this.message = this.add.text(290, 568, '', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#ff8888',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('TitleScene');
      if (event.code === 'KeyB') this.switchTab();
      const card = this.cosmeticCards[parseInt(event.key, 10) - 1];
      if (card) this.buyCosmeticCard(card.cosmetic);
    });

    this.refresh();
    this.cameras.main.fadeIn(250);
  }

  makeCosmeticCard(cosmetic, x, i) {
    const rarity = RARITIES[cosmetic.rarity];
    const color = Phaser.Display.Color.HexStringToColor(rarity.color).color;
    const box = this.add.rectangle(x, 185, 170, 170, 0x222222).setStrokeStyle(3, color)
      .setInteractive({ useHandCursor: true });
    box.on('pointerdown', () => this.tryOn(cosmetic));
    const type = COSMETIC_TYPES[cosmetic.type];
    this.add.text(x - 74, 108, type.icon, { fontSize: '16px' });
    fitImage(this.add.image(x, 148, cosmeticTexture(this, cosmetic.id)), 56);
    this.add.text(x, 198, cosmetic.name, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      align: 'center', wordWrap: { width: 160 },
    }).setOrigin(0.5);
    this.add.text(x, 220, `${rarity.name} · ${type.name.slice(0, -1)}`, {
      fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold', color: rarity.color,
    }).setOrigin(0.5);
    const button = this.add.rectangle(x, 252, 140, 30, 0x1d3b24)
      .setStrokeStyle(2, 0x66ee88).setInteractive({ useHandCursor: true });
    const label = this.add.text(x, 252, '', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    button.on('pointerdown', () => this.buyCosmeticCard(cosmetic));
    return { cosmetic, label, button, key: i + 1 };
  }

  // Show it on the hero of the probador: a dance dances, a mochila or mascota goes on
  tryOn(cosmetic) {
    if (this.trying) return;
    this.takeOff();
    if (cosmetic.type === 'baile') {
      this.trying = true;
      playEmote(this, this.tryHero, cosmetic.id, () => { this.trying = false; });
    } else {
      this.takeOff = attachCosmetics(this, this.tryHero, { [cosmetic.type]: cosmetic.id });
    }
  }

  buyCosmeticCard(cosmetic) {
    const problem = buyCosmetic(cosmetic.id);
    if (problem) this.say(problem, false);
    else {
      playSound('comprar');
      const where = cosmetic.type === 'baile' ? 'Elígelo en el CASILLERO y baila con Q' : 'Ya lo llevas puesto (cámbialo en el CASILLERO)';
      this.say(`¡Compraste ${cosmetic.name}! ${where}`, true);
      this.tryOn(cosmetic);
    }
    this.refresh();
  }

  // Show our coins, the skins we already have, and the backpack
  refresh() {
    this.refreshCoins();
    if (this.tab === 'mas') {
      const { owned } = loadCosmetics();
      this.cosmeticCards.forEach((card) => {
        if (owned.includes(card.cosmetic.id)) {
          card.label.setText('✅ YA ES TUYO');
          card.button.setFillStyle(0x333333);
        } else {
          card.label.setText(`🪙 ${COSMETIC_PRICES[card.cosmetic.rarity]}  [${card.key}]`);
        }
      });
      return;
    }
    const { won } = loadSkins(this.registry);
    this.skinCards.forEach((card) => {
      if (won.has(card.skin.id)) {
        card.label.setText('✅ YA ES TUYA');
        card.button.setFillStyle(0x333333);
      } else {
        card.label.setText(`🪙 ${card.price}  [${card.key}]`);
      }
    });
    const backpack = loadBackpack();
    this.itemCards.forEach((card) => {
      card.owned.setText(`En tu mochila: ${backpack[card.item.id]} / ${MAX_EACH}`);
    });
  }

  goTo(sceneName) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName));
  }
}

export default ShopScene;
