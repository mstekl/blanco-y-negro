// CustomLevelScene.js — Play a level that WE drew in the EDITOR DE NIVELES!
// It is a copy of the normal level (LevelScene) with some changes:
//   - the level comes from our saved slots (customLevels.js), not from levels.js
//   - reaching the flag shows "¡NIVEL COMPLETADO!" with buttons
//     (OTRA VEZ, EDITAR, SALA) instead of going to the next level
//   - losing all the lives shows a panel too (no Game Over screen)
//   - no coins here: otherwise we could draw a level FULL of coins and get rich!
//
// We start it with the number of the slot: this.scene.start('CustomLevelScene', { slot: 2 })

import LevelScene from './LevelScene.js';
import { loadLevel, newLevel, toLevelData } from '../data/customLevels.js';

class CustomLevelScene extends LevelScene {
  constructor() {
    super('CustomLevelScene');
  }

  init(data = {}) {
    super.init(data);
    // Which slot are we playing? (when the level starts again after losing a
    // life, the data says so too, so we never forget it)
    this.slot = data.slot || 0;
    // true = we lost a life and the level starts again (keep the lives we have)
    this.isRetry = data.retry === true;
  }

  // Our level, from the slot (or an empty new one, just in case it was deleted)
  chooseLevelData() {
    const level = loadLevel(this.slot) || newLevel(this.slot);
    return toLevelData(level);
  }

  create() {
    // A fresh start: 3 lives and 0 points (the normal levels keep them in the registry).
    // But NOT after losing a life: then we keep the lives we have left.
    if (!this.isRetry) {
      this.registry.set('lives', 3);
      this.registry.set('score', 0);
    }
    super.create();

    // No coins in our own levels (see the top of this file)
    this.coins.clear(true, true);
    this.hud.levelText.setText(`🛠 ${this.levelData.name}`);

    this.ended = false;
    this.leaving = false;

    this.input.keyboard.on('keydown', (event) => {
      // ESC in the middle of the level: back to the editor
      if (event.key === 'Escape') this.goTo('EditorScene');
      if (!this.ended) return;
      if (event.key === 'Enter') this.goTo('TitleScene');
      else if (event.code === 'KeyR') this.goTo('CustomLevelScene');
      else if (event.code === 'KeyE') this.goTo('EditorScene');
    });
  }

  // We lost a life: start our level again (LevelScene would forget the slot)
  restartLevel() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.hero.setVelocity(0, 0);

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ slot: this.slot, retry: true });
    });
  }

  // We touched the flag: we beat our own level!
  reachGoal() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.ended = true;

    this.hero.setVelocity(0, 0);
    this.hero.body.setAllowGravity(false);
    this.hero.addScore(500);
    this.saveState();
    this.hud.updateScore(this.hero.score);

    // The same happy ending as the normal levels: the villains and the world get their colors
    this.colorizeEnemies();
    this.playColorReturn();

    // The panel comes a moment later, so we can see the colors coming back
    this.time.delayedCall(1500, () => {
      this.showResult('¡NIVEL COMPLETADO!', '#ffdd00', `Puntos: ${this.hero.score}`);
    });
  }

  // We lost all the lives
  gameOver() {
    if (this.ended) return;
    this.ended = true;
    this.levelComplete = true;
    this.hero.setVelocity(0, 0);
    this.hero.setTint(0x555555);
    this.hud.updateLives(this.hero.lives); // (falling in a pit doesn't update the hearts by itself)
    this.showResult('¡SIN VIDAS!', '#ff5555', '¿Lo intentas otra vez?');
  }

  // The panel at the end, with 3 buttons
  showResult(title, color, message) {
    const parts = [
      this.add.rectangle(400, 270, 640, 250, 0x000000, 0.85).setStrokeStyle(4, 0xffffff),
      this.add.text(400, 190, title, {
        fontFamily: 'Arial', fontSize: '42px', fontStyle: 'bold', color,
        stroke: '#000000', strokeThickness: 6,
      }).setOrigin(0.5),
      this.add.text(400, 245, `"${this.levelData.name}"   ·   ${message}`, {
        fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
      }).setOrigin(0.5),
    ];
    parts.push(...this.resultButton(190, '🔁 OTRA VEZ [R]', 0x66ee88, () => this.goTo('CustomLevelScene')));
    parts.push(...this.resultButton(400, '✏ EDITAR [E]', 0xffdd00, () => this.goTo('EditorScene')));
    parts.push(...this.resultButton(610, '🏠 SALA [ENTER]', 0xffffff, () => this.goTo('TitleScene')));
    // Everything stays still on the screen, even if the camera moves
    parts.forEach((p) => p.setScrollFactor(0).setDepth(200));
  }

  resultButton(x, label, color, onClick) {
    const box = this.add.rectangle(x, 320, 190, 48, 0x222222)
      .setStrokeStyle(3, color).setInteractive({ useHandCursor: true });
    box.on('pointerdown', onClick);
    const text = this.add.text(x, 320, label, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    return [box, text];
  }

  goTo(sceneName) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // "OTRA VEZ" starts our level again from zero (3 lives)
      if (sceneName === 'CustomLevelScene') this.scene.restart({ slot: this.slot });
      // "EDITAR" goes back to the editor, in the same slot
      else if (sceneName === 'EditorScene') this.scene.start('EditorScene', { slot: this.slot });
      else this.scene.start(sceneName);
    });
  }
}

export default CustomLevelScene;
