// LevelIntroScene.js — The "Level X" splash screen!
// This shows a brief title card before each level starts.
// It tells the player which level they're about to play
// and gives them a moment to get ready.

import Phaser from 'phaser';
import { getLevels } from '../data/countryLevels.js';
import { WEATHERS, weatherFor, forgetWeather } from '../managers/WeatherManager.js';

class LevelIntroScene extends Phaser.Scene {
  constructor() {
    super('LevelIntroScene');
  }

  // Receive which level we're about to play
  init(data) {
    this.levelIndex = data.levelIndex || 0;
  }

  create() {
    const levelData = getLevels(this.registry)[this.levelIndex];

    // Dark background
    this.cameras.main.setBackgroundColor('#222222');

    // Fade in
    this.cameras.main.fadeIn(400);

    // Level number (big!) — inside a country, the big title is the country's name
    this.add.text(400, 220, levelData.introTitle || `Nivel ${levelData.id}`, {
      fontFamily: 'Arial',
      fontSize: '64px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Level name
    this.add.text(400, 300, levelData.introName || levelData.name, {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Subtitle (if it has one)
    if (levelData.subtitle) {
      this.add.text(400, 360, levelData.subtitle, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#aaaaaa',
        fontStyle: 'italic',
      }).setOrigin(0.5);
    }

    // The weather of this level: a NEW one every time we arrive at a level
    // (if we lose a heart and try again, it stays the same — see WeatherManager.js)
    const key = `LevelScene:${this.levelIndex}`;
    forgetWeather(this.registry, key);
    const weather = WEATHERS[weatherFor(this.registry, key)];
    this.add.text(400, 400, `${weather.icon} ${weather.name}`, {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#88ccff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    // "Get ready" text that pulses
    const readyText = this.add.text(400, 450, '¡Prepárate!', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#88ff88',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: readyText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // After 2.5 seconds, fade out and start the level
    this.time.delayedCall(2500, () => {
      this.cameras.main.fadeOut(400);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LevelScene', { levelIndex: this.levelIndex });
      });
    });
  }
}

export default LevelIntroScene;
