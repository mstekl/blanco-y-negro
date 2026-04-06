// WinScene.js — Victory! The hero saved all the colors!
// This scene plays when the player beats the final level.
// The background transitions from gray to full color,
// rainbow confetti falls, and we celebrate!

import Phaser from 'phaser';

class WinScene extends Phaser.Scene {
  constructor() {
    super('WinScene');
  }

  create() {
    const finalScore = this.registry.get('score') || 0;

    // --- Background starts gray ---
    this.cameras.main.setBackgroundColor('#555555');
    this.cameras.main.fadeIn(800);

    // Gray background that will be covered by color
    const bg = this.add.graphics();
    bg.fillStyle(0x555555);
    bg.fillRect(0, 0, 800, 600);

    // --- Color wash effect ---
    // Rainbow bands sweep across the screen from left to right
    const rainbowColors = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0088ff, 0x8800ff];
    const bandWidth = 800 / rainbowColors.length;

    rainbowColors.forEach((color, i) => {
      const band = this.add.rectangle(
        -bandWidth, 300, bandWidth + 10, 600, color, 0.5
      );

      // Animate each band sliding in from left with a stagger
      this.tweens.add({
        targets: band,
        x: (i * bandWidth) + bandWidth / 2,
        duration: 1000,
        delay: 500 + (i * 200),
        ease: 'Power2',
      });
    });

    // --- Hero in the center (big!) ---
    if (this.textures.exists('hero')) {
      const hero = this.add.image(400, 300, 'hero');
      hero.setScale(0);
      // Hero pops in with a bounce
      this.tweens.add({
        targets: hero,
        scale: 4,
        duration: 800,
        delay: 2000,
        ease: 'Back.easeOut',
      });
      // Then gently floats
      this.tweens.add({
        targets: hero,
        y: 290,
        duration: 1500,
        delay: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // --- Victory title ---
    const victoryText = this.add.text(400, 100, '¡SALVASTE\nTODOS LOS COLORES!', {
      fontFamily: 'Arial',
      fontSize: '44px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6,
      lineSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: victoryText,
      alpha: 1,
      duration: 800,
      delay: 2200,
    });

    // --- Score ---
    const scoreText = this.add.text(400, 420, `Puntos finales: ${String(finalScore).padStart(5, '0')}`, {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      duration: 600,
      delay: 3000,
    });

    // --- Confetti particles ---
    // Create a small white square for confetti
    if (!this.textures.exists('confetti')) {
      const gfx = this.add.graphics();
      gfx.fillStyle(0xffffff);
      gfx.fillRect(0, 0, 8, 8);
      gfx.generateTexture('confetti', 8, 8);
      gfx.destroy();
    }

    // Start confetti after the color wash
    this.time.delayedCall(2000, () => {
      const confetti = this.add.particles(400, -20, 'confetti', {
        x: { min: 0, max: 800 },
        y: { min: -20, max: -10 },
        speedY: { min: 50, max: 150 },
        speedX: { min: -30, max: 30 },
        rotate: { min: 0, max: 360 },
        scale: { min: 0.5, max: 1.2 },
        lifespan: 4000,
        quantity: 2,
        frequency: 100,
        tint: [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0088ff, 0x8800ff, 0xff44ff],
      });
    });

    // --- Play again text ---
    const replayText = this.add.text(400, 500, 'Presiona ENTER para jugar de nuevo', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#88ff88',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: replayText,
      alpha: 1,
      duration: 600,
      delay: 3500,
      onComplete: () => {
        // Pulse effect after appearing
        this.tweens.add({
          targets: replayText,
          alpha: 0.3,
          duration: 700,
          yoyo: true,
          repeat: -1,
        });
      },
    });

    // --- Credits ---
    const credits = this.add.text(400, 560, 'Hecho con amor por Emi y Papá', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cccccc',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: credits,
      alpha: 1,
      duration: 600,
      delay: 4000,
    });

    // --- Restart on ENTER ---
    this.input.keyboard.on('keydown-ENTER', () => {
      // Reset everything
      this.registry.set('lives', undefined);
      this.registry.set('score', 0);

      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('TitleScene');
      });
    });
  }
}

export default WinScene;
