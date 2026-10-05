// TitleScene.js — The title screen!
// This is the first thing the player sees. It shows the game name,
// a colorful animation, and waits for the player to press ENTER.

import Phaser from 'phaser';
import { levels } from '../data/levels.js';

class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a1a');
    this.cameras.main.fadeIn(600);

    // --- Background: gray-to-color gradient effect ---
    const bg = this.add.graphics();
    // Left side is gray, right side has color peeking through
    bg.fillGradientStyle(0x333333, 0x444444, 0x222222, 0x333333);
    bg.fillRect(0, 0, 800, 600);

    // Rainbow stripe at the bottom (color trying to break through!)
    const rainbowColors = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0088ff, 0x8800ff];
    const stripeW = Math.ceil(800 / rainbowColors.length);
    for (let i = 0; i < rainbowColors.length; i++) {
      bg.fillStyle(rainbowColors[i], 0.4);
      bg.fillRect(i * stripeW, 560, stripeW, 40);
    }

    // --- Title ---
    const title = this.add.text(400, 180, 'BLANCO\nY NEGRO', {
      fontFamily: 'Arial',
      fontSize: '72px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 8,
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Title color animation — letters pulse between white and rainbow
    this.tweens.add({
      targets: title,
      scale: 1.03,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // --- Tagline ---
    this.add.text(400, 310, '¡Devuelve el color al mundo!', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // --- Hero sprite preview ---
    if (this.textures.exists('hero')) {
      const heroPreview = this.add.image(400, 400, 'hero');
      heroPreview.setScale(3);
      // Gentle floating animation
      this.tweens.add({
        targets: heroPreview,
        y: 390,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // --- "Press ENTER" ---
    const startText = this.add.text(400, 490, 'Presiona ENTER para jugar', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#88ff88',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // --- Credits ---
    this.add.text(400, 555, 'Por Emi y Papá', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#888888',
    }).setOrigin(0.5);

    // --- Start the game on ENTER ---
    this.input.keyboard.once('keydown-ENTER', () => {
      // Reset game state for a fresh start
      this.registry.set('lives', 3);
      this.registry.set('score', 0);
      this.registry.set('currentLevel', 0);

      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Testing shortcut: add ?nivel=4 to the URL to start at that level
        const wanted = parseInt(new URLSearchParams(window.location.search).get('nivel'), 10);
        const startLevel = wanted >= 1 && wanted <= levels.length ? wanted - 1 : 0;
        this.scene.start('LevelIntroScene', { levelIndex: startLevel });
      });
    });
  }
}

export default TitleScene;
