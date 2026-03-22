// GameScene.js — This is our main game scene!
// A "scene" is like a level or screen in the game.
// Right now it just shows a message, but soon we'll add
// a character, platforms, and enemies!

import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  constructor() {
    // Give this scene a name so we can find it later
    super('GameScene');
  }

  // preload() — Load images, sounds, and other files here
  // (We don't have any yet, but we will soon!)
  preload() {
    // Coming soon: load our character sprite, platforms, etc.
  }

  // create() — Set up the game objects when the scene starts
  create() {
    // Add a welcome message in the center of the screen
    // 400 = half of 800 (center X), 300 = half of 600 (center Y)
    this.add.text(400, 260, '¡Listos para construir\nnuestro juego!', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5); // Center the text on its position

    // A smaller message below
    this.add.text(400, 380, 'Blanco y Negro 🎮', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  // update() — This runs 60 times per second (the game loop!)
  // We'll add movement and game logic here later
  update() {
    // Coming soon: check for keyboard input, move the player, etc.
  }
}

export default GameScene;
