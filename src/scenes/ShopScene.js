// ShopScene.js — The TIENDA tab (in the top bar of the sala, or T).
// Two parts:
//   - SKINS DEL DÍA: 4 skins to buy with coins. They change every day!
//     (the price depends on how rare the skin is; the PASE skins are never here)
//   - POWER-UPS: Escudo, Vida extra and Lápiz de color. They go to our backpack
//     and are used when the next game of JUGAR or SUPERVIVENCIA starts
//     (see src/data/shop.js).
// Keys: 1 2 3 4 buy a skin, 5 6 7 buy a power-up, ESC goes back to the sala.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { drawTopBar } from '../ui/TopBar.js';
import { SHOP_ITEMS, MAX_EACH, buy, loadBackpack } from '../data/shop.js';
import { loadCoins, addCoins, RARITIES, SKIN_RARITY } from '../data/coins.js';
import { SKIN_LIST, PASS_SKIN_IDS, loadSkins, saveSkins, skinTexture, fitImage } from '../data/skins.js';
import Projectile from '../sprites/Projectile.js';
import { playSound } from '../audio/Sound.js';

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

  create() {
    this.leaving = false;
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75);
    Projectile.createPowerupTextures(this);
    this.refreshCoins = drawTopBar(this, 'ShopScene', (scene) => this.goTo(scene));

    this.sectionTitle(76, '⭐ SKINS DEL DÍA', '¡Cambian todos los días!');
    this.skinCards = skinsOfTheDay().map((skin, i) => this.makeSkinCard(skin, 115 + i * 190, i));

    this.sectionTitle(300, '🎒 POWER-UPS', 'Se usan al empezar tu próxima partida de JUGAR o SUPERVIVENCIA');
    this.itemCards = SHOP_ITEMS.map((item, i) => this.makeItemCard(item, 160 + i * 240, i));

    this.message = this.add.text(400, 568, '', {
      fontFamily: 'Arial', fontSize: '19px', fontStyle: 'bold', color: '#ff8888',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('TitleScene');
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

  // Show our coins, the skins we already have, and the backpack
  refresh() {
    this.refreshCoins();
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
