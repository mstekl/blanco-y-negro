// ProfileScene.js — "TU JUGADOR": write your name and pick your avatar.
// The first time we open the game we come here by ourselves (from the sala).
// Later we can come back with the player button in the top-left corner of the sala.
//   - Type the name (4 to 13 letters). On iPads and phones the small keyboard opens
//   - ◀ ▶ (on the screen, or the arrow keys) change the avatar: ANY skin
//   - GUARDAR (or ENTER) saves it and goes to the sala
//   - ESC goes back without saving (only if we already had a player)

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { SKIN_LIST, skinTexture, fitImage } from '../data/skins.js';
import { loadProfile, saveProfile, checkName, isNameChar, NAME_MAX } from '../data/profile.js';

class ProfileScene extends Phaser.Scene {
  constructor() {
    super('ProfileScene');
  }

  create() {
    this.leaving = false;
    this.oldProfile = loadProfile();
    this.name = this.oldProfile ? this.oldProfile.name : '';
    const avatarIndex = SKIN_LIST.findIndex((s) => this.oldProfile && s.id === this.oldProfile.avatar);
    this.index = Math.max(0, avatarIndex);

    this.cameras.main.fadeIn(250);
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6);

    this.add.text(400, 40, 'TU JUGADOR', {
      fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.createNameField();
    this.createAvatarPicker();
    this.createSaveButton();

    // Keyboard: letters = write the name, ← → = change avatar,
    // ENTER = save, ESC = back to the sala
    this.input.keyboard.on('keydown', (event) => this.onKeyDown(event));

    // On iPads and phones: open the small keyboard to write the name
    // (it is the same keyboard the "Hacks" boxes use)
    window.dispatchEvent(new Event('hacks-abiertos'));
    this.events.once('shutdown', () => window.dispatchEvent(new Event('hacks-cerrados')));

    this.refresh();
  }

  // ---------------------------------------------------------------
  // The name: a box where we type, and a message if it is too short/long
  // ---------------------------------------------------------------
  createNameField() {
    this.add.text(400, 88, 'Tu nombre (de 4 a 13 letras)', {
      fontFamily: 'Arial', fontSize: '17px', color: '#dddddd',
    }).setOrigin(0.5);
    this.add.rectangle(400, 125, 380, 48, 0x111111).setStrokeStyle(2, 0xffffff);
    this.nameText = this.add.text(400, 125, '', {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.nameMessage = this.add.text(400, 162, '', {
      fontFamily: 'Arial', fontSize: '15px', color: '#ff8888',
    }).setOrigin(0.5);
  }

  // ---------------------------------------------------------------
  // The avatar: big in the middle, with arrows on the sides
  // ---------------------------------------------------------------
  createAvatarPicker() {
    this.add.text(400, 192, 'Tu avatar', {
      fontFamily: 'Arial', fontSize: '17px', color: '#dddddd',
    }).setOrigin(0.5);
    this.add.circle(400, 262, 58, 0x8a8a8a, 0.45);
    this.avatarImage = this.add.image(400, 262, 'hero');
    this.avatarName = this.add.text(400, 334, '', {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    // The ◀ ▶ arrows (big, so fingers can touch them easily)
    [[-1, 270, '◀'], [1, 530, '▶']].forEach(([step, x, label]) => {
      const arrow = this.add.circle(x, 262, 30, 0x222222)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true });
      this.add.text(x, 262, label, {
        fontFamily: 'Arial', fontSize: '28px', color: '#ffffff',
      }).setOrigin(0.5);
      arrow.on('pointerdown', () => this.moveAvatar(step));
    });
  }

  createSaveButton() {
    this.saveButton = this.add.rectangle(400, 385, 240, 54, 0xffffff)
      .setStrokeStyle(5, 0x000000)
      .setInteractive({ useHandCursor: true });
    this.add.text(400, 385, 'GUARDAR', {
      fontFamily: 'Arial', fontSize: '28px', fontStyle: 'bold', color: '#000000',
    }).setOrigin(0.5);
    this.saveButton.on('pointerdown', () => this.save());
  }

  onKeyDown(event) {
    if (event.key === 'Enter') this.save();
    else if (event.key === 'Escape') this.back();
    else if (event.key === 'ArrowLeft') this.moveAvatar(-1);
    else if (event.key === 'ArrowRight') this.moveAvatar(1);
    else if (event.key === 'Backspace') {
      this.name = this.name.slice(0, -1);
      this.refresh();
    } else if (event.key.length === 1 && isNameChar(event.key) && this.name.length < NAME_MAX) {
      this.name += event.key;
      this.refresh();
    }
  }

  // Go to the next (or previous) skin; after the last one comes the first again
  moveAvatar(step) {
    this.index = (this.index + step + SKIN_LIST.length) % SKIN_LIST.length;
    this.refresh();
  }

  refresh() {
    this.nameText.setText(`${this.name}|`);
    this.nameMessage.setText('');
    const skin = SKIN_LIST[this.index];
    this.avatarImage.setTexture(skinTexture(this, skin.id));
    fitImage(this.avatarImage, 96);
    this.avatarName.setText(skin.name);
  }

  save() {
    if (this.leaving) return;
    const problem = checkName(this.name);
    if (problem) {
      this.nameMessage.setText(problem);
      // Shake the name box: "fix the name first!"
      this.tweens.add({ targets: this.nameText, x: 410, duration: 50, yoyo: true, repeat: 2 });
      return;
    }
    saveProfile({ name: this.name.trim(), avatar: SKIN_LIST[this.index].id });
    this.goToSala();
  }

  // ESC only works if we already had a player (the first time we MUST make one)
  back() {
    if (this.oldProfile) this.goToSala();
  }

  goToSala() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'));
  }
}

export default ProfileScene;
