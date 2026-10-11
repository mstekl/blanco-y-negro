// CosmeticsScene.js — In the CASILLERO: choose our BAILE, MOCHILA and MASCOTA.
// Three tabs (or keys 1 2 3): 💃 BAILES, 🎒 MOCHILAS, 🐾 MASCOTAS.
// On the left our hero, big, wearing what we chose. On the right all the things
// of that tab: the ones we have in color, the others are a black shadow with a lock
// (and they say where to get them: TIENDA or PASE).
// Touch one we have to put it on (a dance also dances). ESC goes back to the CASILLERO.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { drawTopBar } from '../ui/TopBar.js';
import { COSMETICS, COSMETIC_TYPES, loadCosmetics, equip } from '../data/cosmetics.js';
import { RARITIES } from '../data/coins.js';
import { loadSkins, skinTexture, fitImage } from '../data/skins.js';
import { cosmeticTexture, attachCosmetics, playEmote } from '../sprites/Cosmetics.js';
import { reportMission } from '../data/missions.js';
import { playSound } from '../audio/Sound.js';

const TYPES = Object.keys(COSMETIC_TYPES); // baile, mochila, mascota
const COLUMNS_X = [375, 485, 595, 705];
const ROWS_Y = [215, 325, 435];

class CosmeticsScene extends Phaser.Scene {
  constructor() {
    super('CosmeticsScene');
  }

  init(data = {}) {
    this.type = TYPES.includes(data.type) ? data.type : 'baile';
  }

  create() {
    this.leaving = false;
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75);
    drawTopBar(this, 'LockerScene', (scene) => this.goTo(scene));

    this.add.text(400, 74, '🎒 BAILES Y ACCESORIOS', {
      fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);

    // The 3 tabs
    TYPES.forEach((type, i) => {
      const x = 330 + i * 160 + 40;
      const on = type === this.type;
      const box = this.add.rectangle(x, 128, 150, 38, on ? 0x665500 : 0x222222)
        .setStrokeStyle(on ? 4 : 2, on ? 0xffdd00 : 0x777777).setInteractive({ useHandCursor: true });
      const info = COSMETIC_TYPES[type];
      this.add.text(x, 128, `${info.icon} ${info.name} [${i + 1}]`, {
        fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      box.on('pointerdown', () => this.switchType(type));
    });

    // Our hero, big, on the left
    this.add.circle(150, 330, 110, 0x8a8a8a, 0.4);
    this.add.ellipse(150, 425, 180, 34, 0x555555).setStrokeStyle(3, 0x999999);
    this.hero = this.add.image(150, 330, skinTexture(this, loadSkins(this.registry).chosen));
    fitImage(this.hero, 160);
    this.takeOff = attachCosmetics(this, this.hero);
    this.chosenText = this.add.text(150, 470, '', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffdd33',
      align: 'center', wordWrap: { width: 260 },
    }).setOrigin(0.5);

    this.message = this.add.text(550, 520, '', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#cccccc',
      align: 'center', wordWrap: { width: 440 },
    }).setOrigin(0.5);
    this.add.text(400, 578, 'ESC: volver al CASILLERO', {
      fontFamily: 'Arial', fontSize: '13px', color: '#888888',
    }).setOrigin(0.5);

    this.cards = this.add.container();
    this.drawCards();

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('LockerScene');
      const n = parseInt(event.key, 10);
      if (TYPES[n - 1]) this.switchType(TYPES[n - 1]);
    });
    this.cameras.main.fadeIn(250);
  }

  switchType(type) {
    if (type === this.type || this.leaving) return;
    this.scene.restart({ type });
  }

  // The things of this tab (mochilas and mascotas also have "NADA", to take it off)
  drawCards() {
    const state = loadCosmetics();
    this.cards.removeAll(true);
    const items = COSMETICS.filter((c) => c.type === this.type);
    if (this.type !== 'baile') items.unshift(null); // null = NADA
    const current = state[this.type];

    items.forEach((cosmetic, i) => {
      const x = COLUMNS_X[i % 4];
      const y = ROWS_Y[Math.floor(i / 4)];
      const id = cosmetic ? cosmetic.id : null;
      const owned = !cosmetic || state.owned.includes(id);
      const wearing = id === current;
      const color = cosmetic
        ? Phaser.Display.Color.HexStringToColor(RARITIES[cosmetic.rarity].color).color : 0x777777;

      const box = this.add.rectangle(x, y, 100, 100, wearing ? 0x665500 : 0x222222)
        .setStrokeStyle(wearing ? 5 : 3, wearing ? 0xffdd00 : color).setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.choose(cosmetic, owned));
      this.cards.add(box);

      if (cosmetic) {
        const picture = this.add.image(x, y - 12, cosmeticTexture(this, id));
        fitImage(picture, 50);
        if (!owned) picture.setTint(0x000000);
        this.cards.add(picture);
      } else {
        this.cards.add(this.add.text(x, y - 12, '🚫', { fontSize: '34px' }).setOrigin(0.5));
      }
      let words = cosmetic ? cosmetic.name : 'NADA';
      if (!owned) words = cosmetic.pass ? '🔒 PASE' : '🔒 TIENDA';
      this.cards.add(this.add.text(x, y + 32, words, {
        fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold', color: owned ? '#ffffff' : '#999999',
        align: 'center', wordWrap: { width: 94 },
      }).setOrigin(0.5));
      if (wearing) this.cards.add(this.add.text(x + 38, y - 40, '✓', {
        fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffdd33',
      }).setOrigin(0.5));
    });

    const chosen = COSMETICS.find((c) => c.id === current);
    this.chosenText.setText(`${COSMETIC_TYPES[this.type].icon} ${chosen ? chosen.name : 'Nada'}`);
    if (this.type === 'baile') this.message.setText('Toca un baile para elegirlo. Baila con Q (o 💃) en la sala y en los niveles');
  }

  // Touch a thing: put it on (if we have it)
  choose(cosmetic, owned) {
    if (!owned) {
      this.message.setText(cosmetic.pass
        ? `${cosmetic.name} se gana en el PASE BLANCO Y NEGRO`
        : `${cosmetic.name} sale en la TIENDA (pestaña BAILES Y MÁS)`);
      return;
    }
    equip(this.type, cosmetic ? cosmetic.id : null);
    playSound('click');
    // Show it on our hero
    this.takeOff();
    this.takeOff = attachCosmetics(this, this.hero);
    if (cosmetic && cosmetic.type === 'baile' && !this.dancing) {
      this.dancing = true;
      playEmote(this, this.hero, cosmetic.id, () => { this.dancing = false; });
      reportMission('baile');
    }
    this.drawCards();
  }

  goTo(sceneName) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName));
  }
}

export default CosmeticsScene;
