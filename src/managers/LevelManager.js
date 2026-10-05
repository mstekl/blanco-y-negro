// LevelManager.js — Builds a level from configuration data!
// This class reads a level object from levels.js and creates
// all the game objects: platforms, enemies, background, goal, etc.
// It also applies the grayscale tint system — early levels are
// more gray, later levels start getting color back.

import EnemyMR1 from '../sprites/EnemyMR1.js';
import EnemyMR2 from '../sprites/EnemyMR2.js';
import { drawLandmarkScene } from './LandmarkArt.js';
import { WORLD } from '../utils/constants.js';

// The background moves slower than the hero (parallax), so only a part of it is
// ever seen: the first 800px plus 30% of how far the camera travels
function visibleBackgroundWidth(levelData) {
  return Math.min(levelData.worldWidth, 800 + 0.3 * (levelData.worldWidth - 800));
}

class LevelManager {
  // Build everything for a level and return all the game objects
  static buildLevel(scene, levelData) {
    // --- Background ---
    // The colorful version hides BEHIND the gray one. When the level is
    // completed, the gray background fades out and the colors show up!
    const colorBg = LevelManager.createColorBackground(scene, levelData);
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

    return { bg, colorBg, platforms, enemies, goalFlag };
  }

  // Draw a brick wall that fills the whole background (used inside the castle).
  // baseColor is the brick color as {r, g, b}; each brick gets a slightly
  // different shade so the wall doesn't look flat.
  static drawBrickWall(gfx, width, baseColor) {
    const brickW = 48;
    const brickH = 24;
    const gap = 3; // the dark lines between bricks (the mortar)

    // Mortar first: one big dark rectangle, the bricks go on top of it
    gfx.fillStyle(Phaser.Display.Color.GetColor(
      baseColor.r * 0.4, baseColor.g * 0.4, baseColor.b * 0.4
    ));
    gfx.fillRect(0, 0, width, WORLD.HEIGHT);

    const rows = Math.ceil(WORLD.HEIGHT / brickH);
    for (let row = 0; row < rows; row++) {
      // Every other row is shifted by half a brick, like a real wall
      const offset = row % 2 === 0 ? 0 : -brickW / 2;
      for (let x = offset; x < width; x += brickW) {
        // Simple repeating pattern (not random, so it looks the same every time)
        const shade = 0.85 + ((row * 7 + Math.floor(x / brickW) * 13) % 5) * 0.075;
        gfx.fillStyle(Phaser.Display.Color.GetColor(
          Math.min(255, baseColor.r * shade),
          Math.min(255, baseColor.g * shade),
          Math.min(255, baseColor.b * shade)
        ));
        gfx.fillRect(x + gap / 2, row * brickH + gap / 2, brickW - gap, brickH - gap);
      }
    }
  }

  // The colorful background (blue sky + colorful buildings), same layout as the gray one
  static createColorBackground(scene, levelData) {
    const colorBg = scene.add.graphics();
    colorBg.setDepth(-10); // behind the gray background

    // Castle levels have a warm red brick wall instead of a sky
    if (levelData.backgroundStyle === 'bricks') {
      LevelManager.drawBrickWall(colorBg, levelData.worldWidth, { r: 190, g: 80, b: 60 });
      colorBg.setScrollFactor(0.3);
      return colorBg;
    }

    colorBg.fillGradientStyle(0x3d9bff, 0x3d9bff, 0xcdeeff, 0xcdeeff);
    colorBg.fillRect(0, 0, levelData.worldWidth, WORLD.HEIGHT);

    // Levels inside a country: the landmark of the country, in full color
    if (levelData.backgroundStyle === 'landmark') {
      drawLandmarkScene(colorBg, levelData.theme, visibleBackgroundWidth(levelData), true);
      colorBg.setScrollFactor(0.3);
      return colorBg;
    }

    const colors = [0xff6666, 0x66aaff, 0xffcc44, 0x66cc88, 0xcc88ff, 0xff9966, 0x44cccc];
    (levelData.buildings || []).forEach((b, i) => {
      colorBg.fillStyle(colors[i % colors.length]);
      colorBg.fillRect(b.x, b.y, b.w, b.h);
      // Windows with the lights on
      colorBg.fillStyle(0xffffaa);
      for (let wy = b.y + 15; wy < b.y + b.h - 15; wy += 20) {
        for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 16) {
          colorBg.fillRect(wx, wy, 8, 8);
        }
      }
    });

    // Same parallax speed as the gray background so they line up
    colorBg.setScrollFactor(0.3);
    return colorBg;
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

    // Castle levels: a gray brick wall, with the tall pillars standing in front of it
    if (levelData.backgroundStyle === 'bricks') {
      const brickGray = Math.floor(70 + (40 * sat));
      LevelManager.drawBrickWall(bg, levelData.worldWidth,
        { r: brickGray, g: brickGray, b: brickGray });
      // Pillars are darker than the wall so they stand out (no windows!)
      bg.fillStyle(Phaser.Display.Color.GetColor(25, 25, 25), 0.7);
      for (const b of levelData.buildings || []) {
        bg.fillRect(b.x, b.y, b.w, b.h);
      }
      bg.setScrollFactor(0.3);
      return bg;
    }

    bg.fillGradientStyle(topColor, topColor, bottomColor, bottomColor);
    bg.fillRect(0, 0, levelData.worldWidth, WORLD.HEIGHT);

    // Levels inside a country: the landmark of the country, in gray
    if (levelData.backgroundStyle === 'landmark') {
      drawLandmarkScene(bg, levelData.theme, visibleBackgroundWidth(levelData), false, sat);
      bg.setScrollFactor(0.3);
      return bg;
    }

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
