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
    // Hero can stand on hidden platforms — landing on one gives an extra life
    this.physics.add.collider(
      this.hero, this.powerupManager.getHiddenPlatforms(),
      (hero, platform) => this.powerupManager.heroLandsOnHiddenPlatform(hero, platform),
      null, this
    );
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
    const livesBefore = hero.lives;
    hero.takeDamage();
    this.saveState();
    this.hud.updateLives(hero.lives);

    if (hero.lives <= 0) {
      this.gameOver();
    } else if (hero.lives < livesBefore) {
      // A life was lost (the shield did NOT absorb it) — start the level again
      this.restartLevel();
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
      const livesBefore = hero.lives;
      hero.takeDamage();
      this.saveState();
      this.hud.updateLives(hero.lives);

      if (hero.lives <= 0) {
        this.gameOver();
      } else if (hero.lives < livesBefore) {
        // A life was lost (the shield did NOT absorb it) — start the level again
        this.restartLevel();
      }
    }
  }

  // Fade out and restart the same level from the beginning
  restartLevel() {
    // Prevent multiple triggers
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.hero.setVelocity(0, 0);

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ levelIndex: this.levelIndex });
    });
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

    // A castle goal gets a special animation: the hero walks inside!
    if (this.levelData.goal.type === 'castle') {
      this.enterCastle();
      return;
    }
    // A pipe goal: the hero hops on top and slides down inside
    if (this.levelData.goal.type === 'pipe') {
      this.enterPipe();
      return;
    }

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
        // Beat all levels! The city celebrates (then the WinScene comes next)
        this.cameras.main.fadeOut(800, 255, 255, 255);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('CelebrationScene');
        });
      }
    });
  }

  // The hero walks to the castle door, the door lights up, and the hero
  // shrinks into the doorway — then the next level starts INSIDE the castle.
  enterCastle() {
    const hero = this.hero;
    const goal = this.levelData.goal;

    // Turn off physics so the tweens below have full control of the hero
    hero.body.enable = false;
    hero.setDepth(2); // draw the hero in front of the castle
    if (hero.shieldIndicator) hero.shieldIndicator.setVisible(false);

    // Door position (the door is drawn in the bottom-middle of the castle texture)
    const doorX = goal.x;
    const doorY = goal.y + 45;
    // Where the hero's center sits when standing on the ground (ground top is y=568)
    const groundY = hero.y + (568 - hero.body.bottom);

    this.showFloatingText(hero.x, hero.y - 40, '+500');
    this.add.text(doorX, goal.y - 90, '¡Entrando al castillo!', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);

    // Step 1: walk to the door
    const distance = Math.abs(doorX - hero.x);
    hero.setFlipX(doorX < hero.x);
    this.tweens.add({
      targets: hero,
      x: doorX,
      y: groundY,
      duration: 300 + distance * 4, // farther away = a longer walk
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Step 2: the door opens (a warm glowing light behind the hero)
        const light = this.add.rectangle(doorX, doorY, 20, 38, 0xffee88)
          .setDepth(1); // above the castle (depth 0), below the hero
        this.tweens.add({ targets: light, alpha: 0.6, duration: 150, yoyo: true, repeat: 2 });
        this.powerupManager.spawnCollectParticles(doorX, doorY);

        // Step 3: the hero gets smaller and fades, like walking into the distance
        this.tweens.add({
          targets: hero,
          scale: 0.3,
          alpha: 0,
          y: doorY + 10,
          duration: 700,
          delay: 300,
          ease: 'Sine.easeIn',
          onComplete: () => {
            // Step 4: fade to black, then start the next level (inside the castle!)
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start('LevelIntroScene', { levelIndex: this.levelIndex + 1 });
            });
          },
        });
      },
    });
  }

  // The hero hops on top of the pipe, then sinks down inside it — and comes
  // out in the next level (outside the castle!).
  enterPipe() {
    const hero = this.hero;
    const goal = this.levelData.goal;

    // Turn off physics so the tweens below have full control of the hero
    hero.body.enable = false;
    if (hero.shieldIndicator) hero.shieldIndicator.setVisible(false);

    // The pipe is 96px tall and its bottom sits on the ground, so its top is here
    const pipeTop = goal.y - 48;
    // Where the hero's center sits when standing on top of the pipe
    const standY = pipeTop - hero.body.height / 2 - 8;

    this.showFloatingText(hero.x, hero.y - 40, '+500');
    this.add.text(goal.x, pipeTop - 70, '¡Al tubo!', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);

    // The pipe is drawn in front of the hero so the hero looks like it goes INSIDE
    const pipe = this.goalFlag;
    pipe.setDepth(2);
    hero.setDepth(1);

    // Step 1: hop up onto the pipe (a little arc: x moves steadily, y goes up)
    const distance = Math.abs(goal.x - hero.x);
    hero.setFlipX(goal.x < hero.x);
    this.tweens.add({
      targets: hero,
      x: goal.x,
      duration: 300 + distance * 4,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: hero,
      y: standY,
      duration: 300 + distance * 4,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Step 2: slide down into the pipe (the pipe covers the hero as it sinks)
        this.powerupManager.spawnCollectParticles(goal.x, pipeTop);
        this.tweens.add({
          targets: hero,
          y: pipeTop + 60,
          duration: 800,
          delay: 250,
          ease: 'Sine.easeIn',
          onComplete: () => {
            // Step 3: fade to black, then start the next level
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start('LevelIntroScene', { levelIndex: this.levelIndex + 1 });
            });
          },
        });
      },
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
      // Enemies that fall into a pit are removed (no invisible floor anymore)
      if (enemy.active && enemy.y > WORLD.HEIGHT + 100) enemy.destroy();
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
    this.levelComplete = false; // restartLevel() sets it again (it guards against repeats)
    this.restartLevel();
  }
}

export default LevelScene;
