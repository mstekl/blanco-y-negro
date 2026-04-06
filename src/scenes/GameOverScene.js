// GameOverScene.js — Game Over screen!
// Shown when the hero loses all lives.
// Displays the final score and lets the player try again.

import Phaser from 'phaser';

class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    // Read the final score from the registry
    const finalScore = this.registry.get('score') || 0;

    // Dark red-tinted background
    this.cameras.main.setBackgroundColor('#331111');
    this.cameras.main.fadeIn(500);

    // Game over title
    this.add.text(400, 200, '¡Fin del Juego!', {
      fontFamily: 'Arial',
      fontSize: '56px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Final score
    this.add.text(400, 290, `Puntos: ${String(finalScore).padStart(5, '0')}`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Encouraging message
    this.add.text(400, 350, '¡Los colores te necesitan!', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffcc00',
    }).setOrigin(0.5);

    // Retry instruction (pulsing)
    const retryText = this.add.text(400, 440, 'Presiona ENTER para reintentar', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#88ff88',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: retryText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Listen for ENTER key to restart from level 1
    this.input.keyboard.once('keydown-ENTER', () => {
      // Reset game state
      this.registry.set('lives', 3);
      this.registry.set('score', 0);
      this.registry.set('currentLevel', 0);

      // Go back to level 1 intro
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LevelIntroScene', { levelIndex: 0 });
      });
    });
  }
}

export default GameOverScene;
