// BootScene.js — The very first scene!
// It runs before anything else and sets up the loading bar texture
// that PreloadScene will use. It's super fast — you'll barely see it.

import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Go straight to the preloader
    this.scene.start('PreloadScene');
  }
}

export default BootScene;
