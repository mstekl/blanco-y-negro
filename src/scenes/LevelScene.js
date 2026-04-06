// LevelScene.js — The main gameplay scene!
// This is where all the action happens: the hero runs, jumps,
// and fights enemies across platforms. Every level uses this
// same scene — only the data (platforms, enemies, etc.) changes.
// The LevelManager reads the level config and builds everything.

import Phaser from 'phaser';
import Hero from '../sprites/Hero.js';
import Projectile from '../sprites/Projectile.js';
import HUDManager from '../managers/HUDManager.js';
import LevelManager from '../managers/LevelManager.js';
import PowerupManager from '../managers/PowerupManager.js';
import { levels } from '../data/levels.js';
import { WORLD, HERO } from '../utils/constants.js';

class LevelScene extends Phaser.Scene {
  constructor() {
    super('LevelScene');
  }

  // init() runs before preload — we receive data from the previous scene
  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.levelComplete = false;
  }

  // preload() — Textures are now generated in PreloadScene
  // This is kept empty in case we need to load level-specific assets later
  preload() {
  }

  // create() — Build the level using LevelManager
  create() {
    // Get the level configuration data
    this.levelData = levels[this.levelIndex];

    // Initialize game state in the registry (first time only)
    if (this.registry.get('lives') === undefined) {
      this.registry.set('lives', HERO.INITIAL_LIVES);
      this.registry.set('score', 0);
    }
    this.registry.set('currentLevel', this.levelIndex);

    // --- Build the level from data ---
    const { platforms, enemies, goalFlag } = LevelManager.buildLevel(
      this, this.levelData
    );
    this.platforms = platforms;
    this.enemies = enemies;
    this.goalFlag = goalFlag;

    // --- Power-ups ---
    this.powerupManager = new PowerupManager(this);
    this.powerupManager.spawnPowerups(this.levelData.powerups || []);

    // --- Hero projectile pool (Color Gun bullets) ---
    // We create 10 bullets ahead of time and recycle them (object pool pattern)
    this.heroProjectiles = this.add.group({
      classType: Projectile,
      runChildUpdate: false,
      maxSize: 10,
    });
    // Pre-create the projectiles so they're ready to fire
    for (let i = 0; i < 10; i++) {
      const p = new Projectile(this, -50, -50, 'projectile-hero');
      this.heroProjectiles.add(p);
    }

    // --- Enemy projectile pool (dark bullets from MR.2 enemies) ---
    this.enemyProjectiles = this.add.group({
      classType: Projectile,
      runChildUpdate: false,
      maxSize: 20,
    });
    for (let i = 0; i < 20; i++) {
      const p = new Projectile(this, -50, -50, 'projectile-enemy');
      this.enemyProjectiles.add(p);
    }

    // --- Hero ---
    this.hero = new Hero(
      this,
      this.levelData.heroStart.x,
      this.levelData.heroStart.y
    );
    // Restore lives and score from registry
    this.hero.lives = this.registry.get('lives');
    this.hero.score = this.registry.get('score');

    // --- Collisions ---
    // Hero stands on platforms
    this.physics.add.collider(this.hero, this.platforms);
    // Enemies walk on platforms
    this.physics.add.collider(this.enemies, this.platforms);

    // Hero vs Enemies — stomp or take damage
    this.physics.add.overlap(
      this.hero, this.enemies, this.handleHeroEnemyContact, null, this
    );

    // Hero reaches the goal flag
    this.physics.add.overlap(
      this.hero, this.goalFlag, this.reachGoal, null, this
    );

    // Hero collects power-ups
    this.physics.add.overlap(
      this.hero, this.powerupManager.getGroup(),
      (hero, powerup) => this.powerupManager.collectPowerup(hero, powerup),
      null, this
    );

    // Hero's projectiles hit enemies
    this.physics.add.overlap(
      this.heroProjectiles, this.enemies, this.projectileHitsEnemy, null, this
    );

    // Enemy projectiles hit hero
    this.physics.add.overlap(
      this.enemyProjectiles, this.hero, this.enemyProjectileHitsHero, null, this
    );

    // --- Camera ---
    this.cameras.main.startFollow(this.hero, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.levelData.worldWidth, WORLD.HEIGHT);
    this.cameras.main.setDeadzone(100, 50);

    // --- HUD ---
    this.hud = new HUDManager(this);
    this.hud.setLevelName(this.levelData.id, this.levelData.name);
    this.hud.updateLives(this.hero.lives);
    this.hud.updateScore(this.hero.score);

    // Fade in
    this.cameras.main.fadeIn(500);
  }

  // A hero projectile hits an enemy
  projectileHitsEnemy(projectile, enemy) {
    if (enemy.isDefeated) return;
    if (!projectile.active) return;

    // Deactivate the projectile (return to pool)
    projectile.deactivate();

    // Damage the enemy
    enemy.takeDamage(1);

    // If the enemy was defeated, add score
    if (enemy.isDefeated) {
      this.hero.addScore(enemy.scoreValue);
      this.saveState();
      this.hud.updateScore(this.hero.score);
      this.showFloatingText(enemy.x, enemy.y - 20, `+${enemy.scoreValue}`);
    }
  }

  // An enemy projectile hits the hero
  enemyProjectileHitsHero(projectile, hero) {
    if (!projectile.active) return;

    // Deactivate the projectile
    projectile.deactivate();

    // Damage the hero (shield will absorb if active)
    hero.takeDamage();
    this.saveState();
    this.hud.updateLives(hero.lives);

    if (hero.lives <= 0) {
      this.gameOver();
    }
  }

  // Hero touches an enemy — stomp or damage?
  handleHeroEnemyContact(hero, enemy) {
    if (enemy.isDefeated) return;
    if (hero.isInvincible) return;

    // STOMP: hero falling AND above enemy's head
    const heroFalling = hero.body.velocity.y > 0;
    const heroAboveEnemy = hero.body.bottom <= enemy.body.top + 16;

    if (heroFalling && heroAboveEnemy) {
      // Stomp the enemy!
      enemy.takeDamage(1);
      hero.setVelocityY(HERO.JUMP_VELOCITY * 0.6);
      hero.addScore(enemy.scoreValue);
      this.saveState();
      this.hud.updateScore(hero.score);
      this.showFloatingText(enemy.x, enemy.y - 20, `+${enemy.scoreValue}`);
    } else {
      // Take damage from the enemy
      hero.takeDamage();
      this.saveState();
      this.hud.updateLives(hero.lives);

      if (hero.lives <= 0) {
        this.gameOver();
      }
    }
  }

  // Show floating text that rises and fades (like "+100")
  showFloatingText(x, y, text) {
    const floatingText = this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: floatingText,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => floatingText.destroy(),
    });
  }

  // Hero reaches the goal flag — level complete!
  reachGoal() {
    if (this.levelComplete) return;
    this.levelComplete = true;

    // Stop the hero
    this.hero.setVelocity(0, 0);
    this.hero.body.setAllowGravity(false);

    // Bonus points for completing the level
    this.hero.addScore(500);
    this.saveState();
    this.hud.updateScore(this.hero.score);

    // Victory text!
    this.add.text(400, 250, '¡Nivel Completado!', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.showFloatingText(this.hero.x, this.hero.y - 30, '+500');

    // Flash the camera white (color restored!)
    this.cameras.main.flash(500, 255, 255, 255);

    // Go to next level or win!
    this.time.delayedCall(2000, () => {
      const nextLevel = this.levelIndex + 1;
      if (nextLevel < levels.length) {
        // Next level!
        this.cameras.main.fadeOut(400);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('LevelIntroScene', { levelIndex: nextLevel });
        });
      } else {
        // Beat all levels! You saved the colors!
        this.cameras.main.fadeOut(800, 255, 255, 255);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('WinScene');
        });
      }
    });
  }

  // Game over — lost all lives
  gameOver() {
    this.levelComplete = true;
    this.hero.setVelocity(0, 0);

    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameOverScene');
    });
  }

  // Save hero state to registry (persists between scenes)
  saveState() {
    this.registry.set('lives', this.hero.lives);
    this.registry.set('score', this.hero.score);
  }

  // update() — The game loop! 60 times per second
  update() {
    if (this.levelComplete) return;

    // Update hero (input and movement)
    this.hero.update();

    // Update all enemies (patrol movement)
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) enemy.update();
    });

    // Update HUD
    this.hud.updateLives(this.hero.lives);

    // Check if hero fell into a pit
    if (this.hero.y > WORLD.HEIGHT + 50) {
      this.heroFell();
    }
  }

  // Hero fell off the bottom of the screen — lose a life and restart this level
  heroFell() {
    // Prevent multiple triggers
    if (this.levelComplete) return;
    this.levelComplete = true;

    this.hero.lives -= 1;
    this.saveState();

    if (this.hero.lives <= 0) {
      this.gameOver();
      return;
    }

    // Fade out and restart the same level from the beginning
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ levelIndex: this.levelIndex });
    });
  }
}

export default LevelScene;
