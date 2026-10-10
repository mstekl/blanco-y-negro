// TitleScene.js — The "sala" (the title screen / lobby)!
// This is the first thing the player sees. Everything is black and white
// (the villains took the color!). From here we can:
//   - press the big JUGAR button (or ENTER) to start the game
//   - open the "Hacks de sala" (SPACE) and type a secret code to WIN a skin
//   - press the SKINS button (or S) to go to the skins screen and choose one
//     (only here: skins can't be changed in the middle of a level)
//   - press the LÁPICES button (or L) to buy a pencil with coins and open it
//   - press the CARRERA button (or C) for a race: two players, split screen
//   - press the BÚSQUEDA button (or B) to look for 5 colored pencils: two players, split screen
//   - press SUPERVIVENCIA (or V): alone, against waves of villains. How long can you last?
//   - press MISIONES (or M) to see the 3 missions of the day
//   - press our player (name + avatar, top left, or N) to change them.
//     The very first time, we go to make our player before anything else

import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { SAVE_KEY } from './WorldMapScene.js';
import { SKIN_LIST, SKIN_CODES, loadSkins, saveSkins, skinTexture, fitImage } from '../data/skins.js';
import { loadRecord, formatPoints } from '../data/record.js';
import { loadCoins, saveCoins, addCoins, makeCoinTexture } from '../data/coins.js';
import { loadProfile } from '../data/profile.js';
import { drawTopBar } from '../ui/TopBar.js';
import { takeShopItems } from '../data/shop.js';
import { playMusic, isMuted, toggleSound } from '../audio/Sound.js';

class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    // Testing shortcut: add ?reset to the URL to erase the colored countries
    // (so the world map starts with every country white)
    if (new URLSearchParams(window.location.search).has('reset')) {
      try {
        window.localStorage.removeItem(SAVE_KEY);
      } catch (e) {
        // Storage blocked: nothing was saved anyway
      }
    }

    // Testing shortcut: add ?monedas=100 to the URL to have 100 coins
    const testCoins = new URLSearchParams(window.location.search).get('monedas');
    if (testCoins !== null) saveCoins(Math.max(0, parseInt(testCoins, 10) || 0));

    // Testing shortcut: add ?mapa to the URL to jump straight to the world map
    if (new URLSearchParams(window.location.search).has('mapa')) {
      this.scene.start('WorldMapScene');
      return;
    }

    // No player yet (first time playing)? First we write a name and pick an avatar
    this.profile = loadProfile();
    if (!this.profile) {
      this.scene.start('ProfileScene');
      return;
    }

    this.leaving = false;
    const { won, chosen } = loadSkins(this.registry);
    this.skinsWon = won;
    this.chosenSkin = chosen;

    this.cameras.main.setBackgroundColor('#1a1a1a');
    this.cameras.main.fadeIn(600);

    drawGrayCity(this);
    // The bar at the top, like in Fortnite: INICIO · PASE · TIENDA · CASILLERO
    this.refreshBarCoins = drawTopBar(this, 'TitleScene', (scene) => this.goTo(scene));
    this.drawTitle();
    this.createProfileButton();
    this.createHeroPreview();
    this.createLeftButtons();
    this.createPlayButton();
    this.createRightButtons();
    playMusic('sala');
    this.createHackBox();

    // --- Credits ---
    this.add.text(16, 578, 'Por Emi y Papá', {
      fontFamily: 'Arial', fontSize: '14px', color: '#888888',
    });

    // --- Record --- (only once somebody has played: a "00000" record is boring)
    const record = loadRecord();
    if (record > 0) {
      this.add.text(400, 578, `🏆 Récord: ${formatPoints(record)}`, {
        fontFamily: 'Arial', fontSize: '16px', color: '#ffdd00',
      }).setOrigin(0.5, 0);
    }

    // --- Keyboard ---
    // ENTER = play, SPACE = open the hacks, S = skins, L = pencils
    // (while the hacks box is open, the keys are for typing the code)
    this.input.keyboard.on('keydown', (event) => this.onKeyDown(event));

    this.refreshSkin();
  }

  drawTitle() {
    const title = this.add.text(400, 134, 'BLANCO Y NEGRO', {
      fontFamily: 'Arial', fontSize: '56px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5);

    // Gentle "breathing" animation
    this.tweens.add({
      targets: title, scale: 1.03, duration: 2000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.add.text(400, 186, '¡Devuelve el color al mundo!', {
      fontFamily: 'Arial', fontSize: '22px', color: '#dddddd',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
  }

  // ---------------------------------------------------------------
  // Top left: our player (avatar + name). Touching it lets us change them
  // ---------------------------------------------------------------
  createProfileButton() {
    const button = this.add.rectangle(84, 74, 156, 44, 0x222222)
      .setStrokeStyle(2, 0xbbbbbb)
      .setInteractive({ useHandCursor: true });
    const avatar = this.add.image(28, 74, skinTexture(this, this.profile.avatar));
    fitImage(avatar, 34);
    this.add.text(52, 74, this.profile.name, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0, 0.5);
    button.on('pointerover', () => button.setFillStyle(0x444444));
    button.on('pointerout', () => button.setFillStyle(0x222222));
    button.on('pointerdown', () => { if (!this.hackOpen) this.goTo('ProfileScene'); });
  }

  // ---------------------------------------------------------------
  // The big hero in the middle, wearing the chosen skin
  // ---------------------------------------------------------------
  createHeroPreview() {
    // A gray circle of light behind the hero, so the black skins can be seen
    this.add.circle(500, 325, 105, 0x8a8a8a, 0.45);
    this.heroPreview = this.add.image(500, 330, 'hero');
    this.tweens.add({
      targets: this.heroPreview, y: 318, duration: 1500,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // ---------------------------------------------------------------
  // Middle left: the "Hacks de sala" button and the smaller SKINS button
  // ---------------------------------------------------------------
  createLeftButtons() {
    // "Hacks de sala" button
    const hackButton = this.add.rectangle(150, 250, 240, 40, 0x222222)
      .setStrokeStyle(2, 0xbbbbbb)
      .setInteractive({ useHandCursor: true });
    this.add.text(150, 250, 'Hacks de sala [ESPACIO]', {
      fontFamily: 'Arial', fontSize: '17px', color: '#ffffff',
    }).setOrigin(0.5);
    hackButton.on('pointerover', () => hackButton.setFillStyle(0x444444));
    hackButton.on('pointerout', () => hackButton.setFillStyle(0x222222));
    hackButton.on('pointerdown', () => { if (!this.hackOpen) this.openHacks(); });

    // SKINS button: a square with the skin we are wearing inside
    const skinButton = this.add.rectangle(150, 330, 84, 96, 0x777777)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.skinButtonImage = this.add.image(150, 318, 'hero');
    this.add.text(150, 362, 'SKINS', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(150, 390, '[S]', {
      fontFamily: 'Arial', fontSize: '13px', color: '#999999',
    }).setOrigin(0.5);

    skinButton.on('pointerover', () => skinButton.setFillStyle(0x999999));
    skinButton.on('pointerout', () => skinButton.setFillStyle(0x777777));
    skinButton.on('pointerdown', () => { if (!this.hackOpen) this.openSkins(); });

    // LÁPICES button, under SKINS, with a gold border and how many coins we have
    makeCoinTexture(this);
    const pencilButton = this.add.rectangle(150, 440, 180, 48, 0x222222)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.add.text(150, 432, '✏️ LÁPICES [L]', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.image(148, 452, 'coin').setScale(0.7);
    // We keep the coin number, so a hack that gives coins can change it right away
    this.coinLabel = this.add.text(158, 452, String(loadCoins()), {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#ffd700',
    }).setOrigin(0, 0.5);
    pencilButton.on('pointerover', () => pencilButton.setFillStyle(0x444444));
    pencilButton.on('pointerout', () => pencilButton.setFillStyle(0x222222));
    pencilButton.on('pointerdown', () => { if (!this.hackOpen) this.openPencils(); });

    // CARRERA button, under LÁPICES: two players race, each on half of the screen
    const raceButton = this.add.rectangle(150, 500, 180, 44, 0x222222)
      .setStrokeStyle(3, 0x66ee88)
      .setInteractive({ useHandCursor: true });
    this.add.text(150, 500, '🏁 CARRERA [C]', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    raceButton.on('pointerover', () => raceButton.setFillStyle(0x444444));
    raceButton.on('pointerout', () => raceButton.setFillStyle(0x222222));
    raceButton.on('pointerdown', () => { if (!this.hackOpen) this.startRace(); });
  }

  // Show the chosen skin in the big preview and in the SKINS button
  refreshSkin() {
    const texture = skinTexture(this, this.chosenSkin);
    this.heroPreview.setTexture(texture);
    fitImage(this.heroPreview, 150);
    this.skinButtonImage.setTexture(texture);
    fitImage(this.skinButtonImage, 46);
  }

  // Go to the skins screen
  openSkins() {
    this.goTo('SkinsScene');
  }

  // Go to the race (mode 'carrera') or the search (mode 'busqueda'),
  // first to the screen that asks ONLINE, OFFLINE or MÁQUINA:
  // both heroes wear the skin chosen here
  startRace(mode = 'carrera') {
    this.registry.set('skin', this.chosenSkin === 'heroe' ? null : this.chosenSkin);
    this.goTo('ModeChoiceScene', { mode });
  }

  // Go to the pencils screen (buy and open pencils)
  openPencils() {
    this.goTo('PencilsScene');
  }

  goTo(sceneName, data) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneName, data);
    });
  }

  // ---------------------------------------------------------------
  // Bottom right: the big JUGAR button
  // ---------------------------------------------------------------
  createPlayButton() {
    const button = this.add.rectangle(645, 525, 250, 90, 0xffffff)
      .setStrokeStyle(6, 0x000000)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(645, 525, 'JUGAR', {
      fontFamily: 'Arial', fontSize: '52px', fontStyle: 'bold', color: '#000000',
    }).setOrigin(0.5);

    // It grows a little when the mouse is over it
    button.on('pointerover', () => { button.setFillStyle(0xdddddd); label.setScale(1.08); });
    button.on('pointerout', () => { button.setFillStyle(0xffffff); label.setScale(1); });
    button.on('pointerdown', () => { if (!this.hackOpen) this.startGame(); });

    // BÚSQUEDA button, just above JUGAR: two players look for 5 colored pencils
    const searchButton = this.add.rectangle(645, 452, 220, 40, 0x222222)
      .setStrokeStyle(3, 0xff77cc)
      .setInteractive({ useHandCursor: true });
    this.add.text(645, 452, '🔍 BÚSQUEDA [B]', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    searchButton.on('pointerover', () => searchButton.setFillStyle(0x444444));
    searchButton.on('pointerout', () => searchButton.setFillStyle(0x222222));
    searchButton.on('pointerdown', () => { if (!this.hackOpen) this.startRace('busqueda'); });

    this.add.text(645, 582, 'o presiona ENTER', {
      fontFamily: 'Arial', fontSize: '13px', color: '#aaaaaa',
    }).setOrigin(0.5);
  }

  // ---------------------------------------------------------------
  // Right side, next to the big hero: EDITOR and SUPERVIVENCIA
  // (and the 🔊 button at the top left, next to our player)
  // ---------------------------------------------------------------
  createRightButtons() {
    // (MISIONES is in the CASILLERO tab, and the TIENDA has its own tab in the top bar)
    this.sideButton(700, 341, '✏️ EDITOR [E]', 0xaa77ff, () => this.openEditor());
    this.sideButton(700, 395, '🛡 SUPERVIVENCIA [V]', 0xff5555, () => this.startSurvival());

    // Sound on / off
    const soundButton = this.add.rectangle(190, 74, 44, 44, 0x222222)
      .setStrokeStyle(2, 0xbbbbbb).setInteractive({ useHandCursor: true });
    const soundIcon = this.add.text(190, 74, isMuted() ? '🔇' : '🔊', { fontSize: '22px' }).setOrigin(0.5);
    soundButton.on('pointerdown', () => soundIcon.setText(toggleSound() ? '🔇' : '🔊'));
  }

  sideButton(x, y, label, color, onClick) {
    const button = this.add.rectangle(x, y, 190, 40, 0x222222)
      .setStrokeStyle(3, color)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    button.on('pointerover', () => button.setFillStyle(0x444444));
    button.on('pointerout', () => button.setFillStyle(0x222222));
    button.on('pointerdown', () => { if (!this.hackOpen) onClick(); });
  }

  // SUPERVIVENCIA: first we choose ONLINE or SOLO.
  // The hero wears the skin chosen here, like in the levels
  startSurvival() {
    this.registry.set('skin', this.chosenSkin === 'heroe' ? null : this.chosenSkin);
    this.goTo('ModeChoiceScene', { mode: 'supervivencia' });
  }

  // The EDITOR DE NIVELES: draw our own levels
  openEditor() {
    this.goTo('EditorScene');
  }

  startGame() {
    if (this.leaving) return;
    this.leaving = true;

    // Reset game state for a fresh start
    this.registry.set('lives', 3);
    this.registry.set('score', 0);
    this.registry.set('currentLevel', 0);
    this.registry.set('country', null); // we start in the normal levels, not inside a country
    // The hero is born with the skin chosen in the skins screen (null = the normal hero)
    this.registry.set('skin', this.chosenSkin === 'heroe' ? null : this.chosenSkin);
    // We take one of each thing we bought in the TIENDA (the hero gets them in the first level)
    takeShopItems(this.registry);

    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Testing shortcut: add ?nivel=4 to the URL to start at that level (?nivel=6&reset also erases the colored countries)
      const wanted = parseInt(new URLSearchParams(window.location.search).get('nivel'), 10);
      const startLevel = wanted >= 1 && wanted <= levels.length ? wanted - 1 : 0;
      this.scene.start('LevelIntroScene', { levelIndex: startLevel });
    });
  }

  // ---------------------------------------------------------------
  // "Hacks de sala": a box where we type a secret code to win a skin
  //   B Y N   → MR.1 and MR.2
  //   lebron  → crazy dog
  //   N A     → rainbow ninja       N5 C → storm cloud
  //   LP      → color pencil        J F  → the final boss
  //   goma    → MR.3 on his eraser tank (he can shoot from the start!)
  //   A B     → color astronaut (he can shoot too!)
  //   R S     → color robot         G P  → painter cat
  //   D R     → rainbow dinosaur (he can shoot too!)
  //   S C     → superhero with a cape
  //   T       → ALL the skins at once! (T again, with all of them → only the hero is left)
  //   10000   → 10000 coins to buy pencils!     100000 → 100000 coins!
  // ---------------------------------------------------------------
  createHackBox() {
    this.hackOpen = false;
    this.hackText = '';

    const dark = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    const panel = this.add.rectangle(400, 300, 520, 220, 0x222222).setStrokeStyle(3, 0xffffff);
    const title = this.add.text(400, 224, 'Hacks de sala', {
      fontFamily: 'Arial', fontSize: '26px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
    const field = this.add.rectangle(400, 290, 440, 44, 0x111111).setStrokeStyle(2, 0x777777);
    this.hackInput = this.add.text(190, 290, '', {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.hackMessage = this.add.text(400, 336, '', {
      fontFamily: 'Arial', fontSize: '18px', color: '#ff8888',
    }).setOrigin(0.5);
    const hint = this.add.text(400, 372, 'Escribe el código y ENTER  ·  ESC: cerrar', {
      fontFamily: 'Arial', fontSize: '14px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.hackBox = this.add.container(0, 0, [dark, panel, title, field, this.hackInput, this.hackMessage, hint])
      .setDepth(100).setVisible(false);
  }

  openHacks() {
    if (this.leaving) return;
    // If the box was going to close by itself (after the last code), it must not close this new one
    if (this.closeTimer) this.closeTimer.remove();
    this.hackOpen = true;
    this.hackText = '';
    this.hackMessage.setText('');
    this.updateHackInput();
    this.hackBox.setVisible(true);
    // Tell the screen buttons (phones and tablets) to show the small keyboard
    window.dispatchEvent(new Event('hacks-abiertos'));
  }

  closeHacks() {
    this.hackOpen = false;
    this.hackBox.setVisible(false);
    window.dispatchEvent(new Event('hacks-cerrados'));
  }

  // The text we typed, with a "|" at the end like a cursor
  updateHackInput() {
    this.hackInput.setText(`${this.hackText}|`);
  }

  // Every key press goes through here
  onKeyDown(event) {
    if (!this.hackOpen) {
      if (event.key === 'Enter') this.startGame();
      else if (event.code === 'Space') this.openHacks();
      else if (event.code === 'KeyS') this.openSkins();
      else if (event.code === 'KeyL') this.openPencils();
      else if (event.code === 'KeyC') this.startRace();
      else if (event.code === 'KeyB') this.startRace('busqueda');
      else if (event.code === 'KeyN') this.goTo('ProfileScene');
      else if (event.code === 'KeyM') this.goTo('MissionsScene');
      else if (event.code === 'KeyV') this.startSurvival();
      else if (event.code === 'KeyT') this.goTo('ShopScene');
      else if (event.code === 'KeyP') this.goTo('PassScene');
      else if (event.code === 'KeyK') this.goTo('LockerScene');
      else if (event.code === 'KeyE') this.openEditor();
      return;
    }

    if (event.key === 'Escape') {
      this.closeHacks();
    } else if (event.key === 'Enter') {
      this.submitHack();
    } else if (event.key === 'Backspace') {
      this.hackText = this.hackText.slice(0, -1);
      this.updateHackInput();
    } else if (event.key.length === 1 && this.hackText.length < 30) {
      // A normal letter, number or space
      this.hackText += event.key;
      this.updateHackInput();
    }
  }

  // "Lebrón", "lebron" and "LE BRON" are the same code: we ignore capital
  // letters, accents and spaces (we keep only letters and numbers)
  normalizeCode(text) {
    return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  submitHack() {
    const code = this.normalizeCode(this.hackText);
    // "10000" and "100000" are not skins: they give us that many coins
    if (code === '10000' || code === '100000') {
      const amount = Number(code);
      const total = addCoins(amount);
      this.coinLabel.setText(String(total));
      this.refreshBarCoins();
      this.hackMessage.setColor('#ffd700').setText(`¡Ganaste ${amount.toLocaleString('es')} monedas!`);
      this.closeTimer = this.time.delayedCall(1300, () => this.closeHacks());
      return;
    }

    const prize = SKIN_CODES[code];

    if (!prize) {
      this.hackMessage.setColor('#ff8888').setText('Ese código no existe');
      return;
    }

    const isNew = prize.some((id) => !this.skinsWon.has(id));

    // "T" again when we ALREADY have every skin takes them all away:
    // we go back to having only the normal hero (like a new player)
    if (code === 't' && !isNew) {
      this.skinsWon.clear();
      this.skinsWon.add('heroe');
      this.chosenSkin = 'heroe';
      saveSkins(this.registry, this.skinsWon, this.chosenSkin);
      this.refreshSkin();
      this.hackMessage.setColor('#ffffff').setText('¡Perdiste TODAS las skins! Solo te queda el Héroe');
      this.closeTimer = this.time.delayedCall(1300, () => this.closeHacks());
      return;
    }

    prize.forEach((id) => this.skinsWon.add(id));
    // We put on the first skin of the prize right away, to see it
    this.chosenSkin = prize[0];
    saveSkins(this.registry, this.skinsWon, this.chosenSkin);
    this.refreshSkin();

    // With "T" the list of names would be too long for the box, so we just say "TODAS"
    const names = code === 't' ? 'TODAS las skins'
      : prize.map((id) => SKIN_LIST.find((s) => s.id === id).name).join(' y ');
    this.hackMessage.setColor('#ffffff')
      .setText(isNew ? `¡Ganaste: ${names}!` : `Ya tenías: ${names}`);
    // Close the box by itself after a moment, so we can see the result
    this.closeTimer = this.time.delayedCall(1300, () => this.closeHacks());
  }
}

// Background: a gray city with no color at all
// (the skins screen uses it too, so it lives outside the class)
export function drawGrayCity(scene) {
  const bg = scene.add.graphics();
  bg.fillGradientStyle(0x3a3a3a, 0x3a3a3a, 0x111111, 0x111111);
  bg.fillRect(0, 0, 800, 600);

  // Building silhouettes. We use fixed numbers (not random) so the city
  // always looks the same every time we come back to the sala.
  const heights = [180, 250, 140, 300, 210, 160, 270, 190, 230, 150, 280, 200];
  const width = 800 / heights.length;
  heights.forEach((h, i) => {
    const x = i * width;
    const shade = i % 2 === 0 ? 0x2a2a2a : 0x333333;
    bg.fillStyle(shade);
    bg.fillRect(x, 600 - h, width - 4, h);

    // Little windows, some lit (light gray) and some dark
    for (let wy = 600 - h + 14; wy < 580; wy += 26) {
      for (let wx = x + 10; wx < x + width - 18; wx += 18) {
        const lit = (wx * 7 + wy * 3) % 5 === 0;
        bg.fillStyle(lit ? 0x8a8a8a : 0x1e1e1e);
        bg.fillRect(wx, wy, 8, 12);
      }
    }
  });

  // The ground
  bg.fillStyle(0x0d0d0d);
  bg.fillRect(0, 590, 800, 10);
}

export default TitleScene;
