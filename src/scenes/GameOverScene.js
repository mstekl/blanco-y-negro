// GameOverScene.js — Game Over screen!
// Shown when the hero loses all lives.
// Displays the final score and lets the player try again.

import Phaser from 'phaser';
import EnemyMR1 from '../sprites/EnemyMR1.js';
import EnemyMR2 from '../sprites/EnemyMR2.js';

class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  // Make a big laughing villain: the enemy picture + an open mouth that
  // opens and closes, while the whole body shakes with laughter.
  // mouthY is where the mouth goes, measured from the middle of the picture.
  addLaughingEnemy(x, y, textureKey, mouthY, delay) {
    const container = this.add.container(x, y);
    const body = this.add.image(0, 0, textureKey);

    // The mouth: a red oval with a white row of teeth on top
    const mouth = this.add.graphics();
    mouth.fillStyle(0xcc2222);
    mouth.fillEllipse(0, 0, 11, 8);
    mouth.fillStyle(0xffffff);
    mouth.fillRect(-4, -4, 8, 2);
    mouth.setPosition(0, mouthY);

    container.add([body, mouth]);
    container.setScale(3.5); // big! so the laugh is easy to see

    // The mouth opens and closes: "ja ja ja!"
    this.tweens.add({
      targets: mouth,
      scaleY: 0.3,
      duration: 180,
      yoyo: true,
      repeat: -1,
      delay,
    });

    // The body rocks back and forth and bounces, laughing so hard!
    this.tweens.add({
      targets: container,
      angle: { from: -6, to: 6 },
      y: y - 12,
      duration: 180,
      yoyo: true,
      repeat: -1,
      delay,
    });

    // The laugh text pops up above the head
    const laugh = this.add.text(x, y - 130, '¡JA JA JA!', {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: laugh,
      scale: 1.2,
      duration: 360,
      yoyo: true,
      repeat: -1,
      delay,
    });
  }

  create() {
    // Read the final score from the registry
    const finalScore = this.registry.get('score') || 0;

    // Dark red-tinted background
    this.cameras.main.setBackgroundColor('#331111');
    this.cameras.main.fadeIn(500);

    // The enemy pictures are drawn by their classes — make sure they exist
    // (they do if we just played a level, but this keeps the scene safe on its own)
    if (!this.textures.exists('enemy-mr1')) EnemyMR1.createTexture(this);
    if (!this.textures.exists('enemy-mr2')) EnemyMR2.createTexture(this);

    // MR.1 and MR.2 laugh at the hero: they won!
    this.addLaughingEnemy(190, 370, 'enemy-mr1', -12, 0);
    this.addLaughingEnemy(610, 370, 'enemy-mr2', -16, 90);

    // Game over title
    this.add.text(400, 70, '¡Fin del Juego!', {
      fontFamily: 'Arial',
      fontSize: '56px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Final score
    this.add.text(400, 150, `Puntos: ${String(finalScore).padStart(5, '0')}`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Encouraging message
    this.add.text(400, 205, '¡Los colores te necesitan!', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffcc00',
    }).setOrigin(0.5);

    // Retry instruction (pulsing)
    const retryText = this.add.text(400, 540,
      this.registry.get('country') ? 'Presiona ENTER para volver al mapa' : 'Presiona ENTER para reintentar', {
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

    // Listen for ENTER key to try again
    this.input.keyboard.once('keydown-ENTER', () => {
      // Reset game state
      this.registry.set('lives', 3);
      this.registry.set('score', 0);
      this.registry.set('currentLevel', 0);

      // If we were playing inside a country, we go back to the world map
      // (the colored countries are saved, so nothing is lost!)
      const wasInCountry = Boolean(this.registry.get('country'));

      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (wasInCountry) {
          this.scene.start('WorldMapScene');
        } else {
          // Go back to level 1 intro
          this.scene.start('LevelIntroScene', { levelIndex: 0 });
        }
      });
    });
  }
}

export default GameOverScene;
