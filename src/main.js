// main.js — This is where our game starts!
// It tells Phaser how big the game is, what physics to use,
// and which scenes (levels) to load.

import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';

// Game configuration — think of this as the "settings" for our game
const config = {
  // The type of renderer (AUTO lets Phaser pick the best one)
  type: Phaser.AUTO,

  // The size of our game window (800 pixels wide, 600 pixels tall)
  width: 800,
  height: 600,

  // Where to put the game on the webpage
  parent: 'game-container',

  // Background color (sky blue!)
  backgroundColor: '#87CEEB',

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

  // The scenes (levels) in our game
  scene: [GameScene]
};

// Create the game! 🎮
const game = new Phaser.Game(config);
