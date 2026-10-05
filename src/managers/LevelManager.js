// LevelManager.js — Builds a level from configuration data!
// This class reads a level object from levels.js and creates
// all the game objects: platforms, enemies, background, goal, etc.
// It also applies the grayscale tint system — early levels are
// more gray, later levels start getting color back.

import EnemyMR1 from '../sprites/EnemyMR1.js';
import EnemyMR2 from '../sprites/EnemyMR2.js';
import { WORLD } from '../utils/constants.js';

class LevelManager {
  // Build everything for a level and return all the game objects
  static buildLevel(scene, levelData) {
    // --- Background ---
    const bg = LevelManager.createBackground(scene, levelData);

    // --- World bounds ---
    scene.physics.world.setBounds(
      0, 0,
      levelData.worldWidth,
      levelData.worldHeight || WORLD.HEIGHT
    );
    // Turn OFF the invisible floor at the bottom of the world. Without this,
    // the hero lands on it and never "falls" into pits (so no life is lost!)
    scene.physics.world.setBoundsCollision(true, true, true, false);

    // --- Platforms ---
    const platforms = scene.physics.add.staticGroup();
    LevelManager.buildPlatforms(scene, platforms, levelData.platforms);

    // --- Apply grayscale tint to platforms ---
    // Lower saturation = more gray. The hero is NEVER tinted (always colorful!)
    LevelManager.applyTint(platforms.getChildren(), levelData.saturation);

    // --- Enemies ---
    const enemies = scene.add.group();
    LevelManager.spawnEnemies(scene, enemies, levelData.enemies);

    // --- Goal flag ---
    // (goal can be a flag (default), a castle or a pipe)
    const goalTextures = { castle: 'goal-castle', pipe: 'goal-pipe' };
    const goalType = levelData.goal.type;
    const goalFlag = scene.physics.add.sprite(
      levelData.goal.x, levelData.goal.y, goalTextures[goalType] || 'goal-flag'
    );
    goalFlag.body.setAllowGravity(false);
    goalFlag.body.setImmovable(true);
    // Bob animation — the flag floats gently (castles and pipes stay put, they're heavy!)
    if (!goalType) {
      scene.tweens.add({
        targets: goalFlag,
        y: levelData.goal.y - 6,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    return { bg, platforms, enemies, goalFlag };
  }

  // Apply grayscale tint to sprites based on the level's saturation value
  // saturation: 0 = fully gray, 1 = full color (no tint)
  static applyTint(sprites, saturation) {
    if (saturation >= 1) return; // Full color, no tint needed

    // Calculate the gray level: lower saturation = darker gray tint
    // At saturation 0, tint is 0x888888 (mid gray)
    // At saturation 0.5, tint is 0xbbbbbb (light gray)
    // At saturation 1, no tint (full color)
    const gray = Math.floor(128 + (127 * saturation));
    const tintColor = Phaser.Display.Color.GetColor(gray, gray, gray);

    for (const sprite of sprites) {
      sprite.setTint(tintColor);
    }
  }

  // Create the parallax background with gradient sky and building silhouettes
  static createBackground(scene, levelData) {
    const sat = levelData.saturation || 0;

    // Sky colors get darker as saturation decreases
    const topGray = Math.floor(50 + (30 * sat));
    const bottomGray = Math.floor(100 + (60 * sat));
    const topColor = Phaser.Display.Color.GetColor(topGray, topGray, topGray);
    const bottomColor = Phaser.Display.Color.GetColor(bottomGray, bottomGray, bottomGray);

    const bg = scene.add.graphics();
    bg.fillGradientStyle(topColor, topColor, bottomColor, bottomColor);
    bg.fillRect(0, 0, levelData.worldWidth, WORLD.HEIGHT);

    // Building silhouettes for depth
    if (levelData.buildings) {
      const buildGray = Math.floor(35 + (20 * sat));
      const buildColor = Phaser.Display.Color.GetColor(buildGray, buildGray, buildGray);
      bg.fillStyle(buildColor, 0.6);
      for (const b of levelData.buildings) {
        bg.fillRect(b.x, b.y, b.w, b.h);
        // Windows (little light squares on buildings)
        const winColor = Phaser.Display.Color.GetColor(
          buildGray + 20, buildGray + 15 + Math.floor(15 * sat), buildGray + 10
        );
        bg.fillStyle(winColor, 0.4);
        for (let wy = b.y + 15; wy < b.y + b.h - 15; wy += 20) {
          for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 16) {
            bg.fillRect(wx, wy, 8, 8);
          }
        }
        bg.fillStyle(buildColor, 0.6);
      }
    }

    // Parallax — background scrolls slower than the foreground
    bg.setScrollFactor(0.3);

    return bg;
  }

  // Build platforms from the level data array
  static buildPlatforms(scene, platformGroup, platformList) {
    for (const plat of platformList) {
      const tileKey = plat.type === 'ground' ? 'ground-tile' : 'platform-tile';
      const tileW = 64;
      const tileH = plat.type === 'ground' ? 64 : 24;

      // How many tiles to fill the platform width?
      const tileCount = Math.ceil(plat.width / tileW);

      for (let i = 0; i < tileCount; i++) {
        const tileX = plat.x + (i * tileW) + (tileW / 2);
        const tileY = plat.y + (tileH / 2);
        platformGroup.create(tileX, tileY, tileKey);
      }
    }
  }

  // Spawn enemies from the level data array
  static spawnEnemies(scene, enemyGroup, enemyList) {
    for (const config of enemyList) {
      let enemy;

      if (config.type === 'mr1') {
        enemy = new EnemyMR1(scene, config.x, config.y, config);
      } else if (config.type === 'mr2') {
        enemy = new EnemyMR2(scene, config.x, config.y, config);
      }

      if (enemy) {
        enemyGroup.add(enemy);
      }
    }
  }
}

export default LevelManager;
