// HUDManager.js — The Heads-Up Display!
// This draws the lives (hearts), score, and level name on screen.
// Everything uses setScrollFactor(0) so it stays fixed even when
// the camera moves to follow the hero.

class HUDManager {
  constructor(scene) {
    this.scene = scene;

    // We need a heart texture for the lives display
    if (!scene.textures.exists('heart')) {
      this.createHeartTexture(scene);
    }

    // --- Lives (hearts in the top-left corner) ---
    this.hearts = [];
    for (let i = 0; i < 5; i++) {
      const heart = scene.add.image(24 + (i * 28), 24, 'heart');
      heart.setScrollFactor(0); // Stay fixed on screen
      heart.setDepth(100);      // Draw on top of everything
      this.hearts.push(heart);
    }

    // --- Score (top-center) ---
    this.scoreText = scene.add.text(400, 12, 'Puntos: 00000', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // --- Level name (top-right) ---
    this.levelText = scene.add.text(780, 12, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // --- Coins (below the level name) ---
    this.coinIcon = scene.add.image(0, 44, 'coin').setScrollFactor(0).setDepth(100);
    this.coinText = scene.add.text(780, 44, '0', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(100);

    // --- Color Gun status (below hearts) ---
    this.colorGunText = scene.add.text(24, 48, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ff44ff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setScrollFactor(0).setDepth(100);

    // --- Controls help (bottom) ---
    this.helpText = scene.add.text(400, 576, '← → Mover  |  ↑ Saltar  |  Shift Correr', {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(100);
  }

  // Draw a heart shape using graphics
  createHeartTexture(scene) {
    const gfx = scene.add.graphics();
    // Red heart
    gfx.fillStyle(0xff3333);
    // Two circles for the top bumps
    gfx.fillCircle(6, 5, 5);
    gfx.fillCircle(14, 5, 5);
    // Triangle for the bottom point
    gfx.fillTriangle(1, 7, 19, 7, 10, 18);
    gfx.generateTexture('heart', 20, 20);
    gfx.destroy();
  }

  // Race (split screen): each player only has HALF the screen (400 pixels wide),
  // so we move things to fit. Hearts and points are hidden: in a race the only
  // thing that matters is who gets there first!
  useHalfScreen(controlsHelp, shootKey) {
    this.halfScreen = true;
    this.shootKey = shootKey;
    this.hearts.forEach((heart) => heart.setVisible(false));
    this.scoreText.setVisible(false);
    this.levelText.setX(380);
    this.coinText.setX(380);
    this.helpText.setX(200).setText(controlsHelp);
  }

  // The search mode (BÚSQUEDA) is also on half the screen, but there the lives DO matter
  showHearts() {
    this.heartsInHalf = true;
  }

  // Show/hide hearts based on current lives
  updateLives(currentLives) {
    if (this.halfScreen && !this.heartsInHalf) return; // no hearts in the race
    for (let i = 0; i < this.hearts.length; i++) {
      // Show heart if we have that many lives, hide if not
      this.hearts[i].setVisible(i < currentLives);
    }
  }

  // Update the score display
  updateScore(score) {
    // Pad the score with zeros so it always shows 5 digits (like 00350)
    const padded = String(score).padStart(5, '0');
    this.scoreText.setText(`Puntos: ${padded}`);
  }

  // Update the coins display (the coin picture sits just left of the number)
  updateCoins(coins) {
    this.coinText.setText(String(coins));
    this.coinIcon.setX(this.coinText.x - this.coinText.width - 14);
  }

  // Set the level name text
  setLevelName(levelNumber, name) {
    this.levelText.setText(`Nivel ${levelNumber}: ${name}`);
  }

  // Show or hide the Color Gun indicator
  showColorGun(hasGun) {
    if (hasGun && this.halfScreen) {
      // In the race each player has their own shoot key
      this.colorGunText.setText(`🎨 Lápiz de Color [${this.shootKey}]`);
    } else if (hasGun) {
      this.colorGunText.setText('🎨 Lápiz de Color [Z/X]');
      // Update help text to include shooting controls
      this.helpText.setText('← → Mover  |  ↑ Saltar  |  Shift Correr  |  Z/X Disparar');
    } else {
      this.colorGunText.setText('');
    }
  }
}

export default HUDManager;
