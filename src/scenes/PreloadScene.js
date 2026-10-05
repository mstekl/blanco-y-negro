// PreloadScene.js — Loading screen!
// This is where we generate ALL the placeholder textures for the game.
// It shows a progress bar while loading. Later when we have real art,
// we'll load image files here instead of generating textures.

import Phaser from 'phaser';
import Projectile from '../sprites/Projectile.js';
import { COLORS } from '../utils/constants.js';

class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#111111');

    // --- Loading text ---
    const titleText = this.add.text(400, 220, 'BLANCO Y NEGRO', {
      fontFamily: 'Arial',
      fontSize: '42px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const loadText = this.add.text(400, 280, 'Cargando...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // --- Progress bar (fake it since we generate textures, not load files) ---
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333);
    barBg.fillRect(200, 320, 400, 24);

    const bar = this.add.graphics();
    let progress = 0;

    // Generate all textures step by step with a visual progress effect
    const steps = [
      () => this.generateHeroTexture(),
      () => this.generateGroundTexture(),
      () => this.generatePlatformTexture(),
      () => this.generateGoalTexture(),
      () => this.generateCastleTexture(),
      () => this.generatePipeTexture(),
      () => this.generateProjectileTextures(),
      () => this.generatePowerupTextures(),
      () => this.generateEnemyProjectileTexture(),
    ];

    const totalSteps = steps.length;
    const runStep = (index) => {
      if (index >= totalSteps) {
        // All done! Go to title screen
        loadText.setText('¡Listo!');
        this.time.delayedCall(300, () => {
          this.cameras.main.fadeOut(400);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('TitleScene');
          });
        });
        return;
      }

      steps[index]();
      progress = (index + 1) / totalSteps;
      bar.clear();
      bar.fillStyle(0xffcc00);
      bar.fillRect(202, 322, 396 * progress, 20);
      loadText.setText(`Cargando... ${Math.floor(progress * 100)}%`);

      // Small delay between steps so the bar animates
      this.time.delayedCall(80, () => runStep(index + 1));
    };

    runStep(0);
  }

  generateHeroTexture() {
    if (this.textures.exists('hero')) return;
    const gfx = this.add.graphics();
    gfx.fillStyle(0xff4444);
    gfx.fillRect(6, 16, 20, 20);
    gfx.fillStyle(0xffcc00);
    gfx.fillCircle(16, 10, 9);
    gfx.fillStyle(0xff0000);
    gfx.fillRect(7, 2, 5, 4);
    gfx.fillStyle(0x00cc00);
    gfx.fillRect(12, 1, 5, 4);
    gfx.fillStyle(0x0066ff);
    gfx.fillRect(17, 2, 5, 4);
    gfx.fillStyle(0xffffff);
    gfx.fillCircle(12, 10, 2);
    gfx.fillCircle(20, 10, 2);
    gfx.fillStyle(0x000000);
    gfx.fillCircle(13, 10, 1);
    gfx.fillCircle(21, 10, 1);
    gfx.fillStyle(0xff0000);
    gfx.fillRect(24, 16, 4, 6);
    gfx.fillStyle(0xff8800);
    gfx.fillRect(24, 22, 4, 6);
    gfx.fillStyle(0xffff00);
    gfx.fillRect(24, 28, 4, 6);
    gfx.fillStyle(0x00cc00);
    gfx.fillRect(24, 34, 4, 6);
    gfx.fillStyle(0x3366ff);
    gfx.fillRect(8, 36, 8, 10);
    gfx.fillRect(18, 36, 8, 10);
    gfx.fillStyle(0xff4400);
    gfx.fillRect(6, 44, 10, 4);
    gfx.fillStyle(0x00cc44);
    gfx.fillRect(18, 44, 10, 4);
    gfx.generateTexture('hero', 32, 48);
    gfx.destroy();
  }

  generateGroundTexture() {
    if (this.textures.exists('ground-tile')) return;
    const gfx = this.add.graphics();
    gfx.fillStyle(COLORS.GROUND);
    gfx.fillRect(0, 0, 64, 64);
    gfx.fillStyle(COLORS.GROUND_TOP);
    gfx.fillRect(0, 0, 64, 6);
    gfx.lineStyle(1, 0x3a3a3a);
    gfx.lineBetween(0, 20, 64, 20);
    gfx.lineBetween(32, 20, 32, 40);
    gfx.lineBetween(0, 40, 64, 40);
    gfx.lineBetween(16, 40, 16, 60);
    gfx.lineBetween(48, 40, 48, 60);
    gfx.generateTexture('ground-tile', 64, 64);
    gfx.destroy();
  }

  generatePlatformTexture() {
    if (this.textures.exists('platform-tile')) return;
    const gfx = this.add.graphics();
    gfx.fillStyle(COLORS.PLATFORM);
    gfx.fillRect(0, 0, 64, 24);
    gfx.fillStyle(COLORS.PLATFORM_TOP);
    gfx.fillRect(0, 0, 64, 5);
    gfx.generateTexture('platform-tile', 64, 24);
    gfx.destroy();
  }

  generateGoalTexture() {
    if (this.textures.exists('goal-flag')) return;
    const gfx = this.add.graphics();
    gfx.fillStyle(0xcccccc);
    gfx.fillRect(2, 0, 4, 64);
    gfx.fillStyle(0xff4444);
    gfx.fillTriangle(8, 4, 8, 28, 36, 16);
    gfx.fillStyle(0xffff00);
    gfx.fillCircle(4, 3, 4);
    gfx.generateTexture('goal-flag', 40, 64);
    gfx.destroy();
  }

  // A colorful castle for the last level's goal (128x128)
  generateCastleTexture() {
    if (this.textures.exists('goal-castle')) return;
    const gfx = this.add.graphics();

    // Main wall
    gfx.fillStyle(0xb0b0c0);
    gfx.fillRect(32, 56, 64, 72);
    // Two side towers
    gfx.fillRect(8, 40, 32, 88);
    gfx.fillRect(88, 40, 32, 88);
    // Tower tops (crenellations — the little "teeth" of a castle)
    gfx.fillStyle(0x8888a0);
    for (let i = 0; i < 3; i++) {
      gfx.fillRect(8 + i * 12, 30, 8, 10);
      gfx.fillRect(88 + i * 12, 30, 8, 10);
    }
    for (let i = 0; i < 4; i++) {
      gfx.fillRect(34 + i * 16, 46, 10, 10);
    }
    // Colorful roof flags — the colors are coming back!
    gfx.fillStyle(0xcccccc);
    gfx.fillRect(23, 6, 3, 24);
    gfx.fillRect(103, 6, 3, 24);
    gfx.fillStyle(0xff4444);
    gfx.fillTriangle(26, 6, 26, 18, 42, 12);
    gfx.fillStyle(0x44aaff);
    gfx.fillTriangle(106, 6, 106, 18, 122, 12);
    // Big door
    gfx.fillStyle(0xffcc00);
    gfx.fillRect(52, 88, 24, 40);
    gfx.fillCircle(64, 88, 12);
    gfx.fillStyle(0x8b4513);
    gfx.fillRect(54, 90, 20, 38);
    gfx.fillCircle(64, 90, 10);
    // Windows
    gfx.fillStyle(0x44cc66);
    gfx.fillRect(16, 60, 10, 16);
    gfx.fillRect(102, 60, 10, 16);
    gfx.fillStyle(0xff66cc);
    gfx.fillRect(58, 66, 12, 12);

    gfx.generateTexture('goal-castle', 128, 128);
    gfx.destroy();
  }

  // A green pipe (like a warp pipe!) for the goal of level 5 (64x96)
  generatePipeTexture() {
    if (this.textures.exists('goal-pipe')) return;
    const gfx = this.add.graphics();

    // Pipe body
    gfx.fillStyle(0x22aa44);
    gfx.fillRect(6, 28, 52, 68);
    // Pipe rim at the top (wider than the body)
    gfx.fillStyle(0x33cc55);
    gfx.fillRect(0, 0, 64, 28);
    // Dark opening at the top
    gfx.fillStyle(0x0a4418);
    gfx.fillRect(6, 0, 52, 6);
    // Light shine on the left side
    gfx.fillStyle(0x88ee99);
    gfx.fillRect(8, 8, 6, 16);
    gfx.fillRect(12, 34, 6, 58);
    // Dark shade on the right side
    gfx.fillStyle(0x187a30);
    gfx.fillRect(48, 8, 10, 16);
    gfx.fillRect(46, 34, 10, 58);

    gfx.generateTexture('goal-pipe', 64, 96);
    gfx.destroy();
  }

  generateProjectileTextures() {
    Projectile.createHeroTexture(this);
  }

  generatePowerupTextures() {
    Projectile.createPowerupTextures(this);
  }

  generateEnemyProjectileTexture() {
    if (this.textures.exists('projectile-enemy')) return;
    const gfx = this.add.graphics();
    gfx.fillStyle(0x222222);
    gfx.fillCircle(5, 5, 5);
    gfx.fillStyle(0x444444);
    gfx.fillCircle(4, 4, 2);
    gfx.generateTexture('projectile-enemy', 10, 10);
    gfx.destroy();
  }
}

export default PreloadScene;
