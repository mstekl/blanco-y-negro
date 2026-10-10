// main.js — This is where our game starts!
// It tells Phaser how big the game is, what physics to use,
// and which scenes (levels) to load.

import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import TitleScene from './scenes/TitleScene.js';
import SkinsScene from './scenes/SkinsScene.js';
import PencilsScene from './scenes/PencilsScene.js';
import ProfileScene from './scenes/ProfileScene.js';
import LevelIntroScene from './scenes/LevelIntroScene.js';
import LevelScene from './scenes/LevelScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import CelebrationScene from './scenes/CelebrationScene.js';
import WorldMapScene from './scenes/WorldMapScene.js';
import WinScene from './scenes/WinScene.js';
import RaceScene, { RaceLeftScene, RaceRightScene } from './scenes/RaceScene.js';
import ModeChoiceScene from './scenes/ModeChoiceScene.js';
import OnlineScene from './scenes/OnlineScene.js';
import { SearchLeftScene, SearchRightScene } from './scenes/SearchLevelScene.js';
import { setupTouchControls } from './touch/TouchControls.js';

// Game configuration — think of this as the "settings" for our game
const config = {
  // The type of renderer (AUTO lets Phaser pick the best one)
  type: Phaser.AUTO,

  // The size of our game window (800 pixels wide, 600 pixels tall)
  width: 800,
  height: 600,

  // Where to put the game on the webpage
  parent: 'game-container',

  // Make the game as big as the screen allows (without stretching it),
  // so it fits on a computer, a tablet or a phone
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Background color (dark — sets the mood!)
  backgroundColor: '#111111',

  // Physics engine — this makes things fall with gravity!
  physics: {
    default: 'arcade',
    arcade: {
      // Gravity pulls things down (500 pixels per second)
      gravity: { y: 500 },
      // Set to true if you want to see the physics boxes (helpful for debugging)
      debug: false
    }
  },

  // All the scenes in our game — Boot starts first!
  // Boot → PreloadScene → TitleScene (↔ SkinsScene, PencilsScene) → LevelIntro → Level → GameOver/Celebration → WorldMap → Win
  // The race (from the sala): RaceScene on top, with RaceLeft and RaceRight (one level for each half)
  // The search (BÚSQUEDA) uses RaceScene too, with SearchLeft and SearchRight
  // Before both, ModeChoiceScene asks ONLINE / OFFLINE / MÁQUINA (and OnlineScene connects with a friend)
  scene: [BootScene, PreloadScene, TitleScene, ProfileScene, SkinsScene, PencilsScene, LevelIntroScene, LevelScene, GameOverScene, CelebrationScene, WorldMapScene, WinScene,
    ModeChoiceScene, OnlineScene, RaceLeftScene, RaceRightScene, SearchLeftScene, SearchRightScene, RaceScene]
};

// Create the game!
const game = new Phaser.Game(config);

// On phones and tablets: buttons and a small keyboard on the screen
setupTouchControls();