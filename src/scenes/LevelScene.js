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
import BlockManager from '../managers/BlockManager.js';
import { addCoins, loadCoins } from '../data/coins.js';
import { reportMission } from '../data/missions.js';
import { playSound, playMusic } from '../audio/Sound.js';
import { useShopItems } from '../data/shop.js';
import StormCloud from '../sprites/StormCloud.js';
import { getLevels } from '../data/countryLevels.js';
import { levels } from '../data/levels.js';
import { WORLD, HERO, isGodMode } from '../utils/constants.js';
import WeatherManager, { weatherFor } from '../managers/WeatherManager.js';

class LevelScene extends Phaser.Scene {
  // The race (RaceScene) makes two copies of this scene, one for each half of
  // the screen, and Phaser needs a different name (key) for each copy
  constructor(key = 'LevelScene') {
    super(key);
  }

  // init() runs before preload — we receive data from the previous scene
  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.levelComplete = false;
    // In a race (two players, split screen) this says which player we are,
    // which half of the screen is ours and which keys we use. null = normal game
    this.race = data.race || null;
    // The middle of OUR part of the screen: half of a half (200) in the split
    // screen, or the middle of the whole screen (400) when the screen is all ours
    this.midX = this.race && !this.race.full ? 200 : 400;
  }

  // preload() — Textures are now generated in PreloadScene
  // This is kept empty in case we need to load level-specific assets later
  preload() {
  }

  // create() — Build the level using LevelManager
  create() {
    // Get the level configuration data
    // (the 6 normal levels, or the 3 levels of the country we are playing in)
    // (the race always uses the normal levels)
    this.levelData = this.chooseLevelData();

    // Initialize game state in the registry (first time only).
    // The race does NOT use the registry: there are two heroes, and the
    // registry can only remember the lives and points of one
    if (!this.race) {
      if (this.registry.get('lives') === undefined) {
        this.registry.set('lives', HERO.INITIAL_LIVES);
        this.registry.set('score', 0);
      }
      this.registry.set('currentLevel', this.levelIndex);
    }

    // --- Build the level from data ---
    const { bg, platforms, enemies, goalFlag, coins } = LevelManager.buildLevel(
      this, this.levelData
    );
    this.coins = coins;
    this.grayBackground = bg;
    this.platforms = platforms;
    this.enemies = enemies;
    this.goalFlag = goalFlag;

    // --- Secret blocks (hit them from below: coins jump out!) ---
    this.blocks = new BlockManager(this, this.levelData.blocks);

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
    // JUNTOS (chosen in the sala): two players in the SAME story, on the same screen.
    // Player 1 uses W A D (S shoots), player 2 the arrows (↓ shoots). They share the hearts.
    // (Only in the normal levels: not in the race, the survival or the levels of the editor)
    this.coop = !this.race && this.scene.key === 'LevelScene' && Boolean(this.registry.get('coop'));
    let controls = 'normal';
    if (this.race) controls = this.race.controls;
    else if (this.coop) controls = 'wasd';
    this.hero = new Hero(
      this,
      this.levelData.heroStart.x,
      this.levelData.heroStart.y,
      controls,
      // Player 2 of the race doesn't wear OUR mochila and mascota
      { cosmetics: controls !== 'arrows' }
    );
    this.heroes = [this.hero];
    if (this.coop) this.createPlayerTwo();
    // Every dance counts for the LOGROS
    this.heroes.forEach((hero) => hero.on('baile', () => reportMission('baile')));
    // Restore lives and score from registry
    // (in the race we always have all our lives: losing one just starts the level again)
    this.hero.lives = this.race ? HERO.INITIAL_LIVES : this.registry.get('lives');
    this.hero.score = this.race ? 0 : this.registry.get('score');
    // No running in a race (alone on the screen we have the normal keys, Shift too):
    // so everybody goes at the same speed, also online
    if (this.race) this.hero.keys.run = [];

    // --- Collisions ---
    // (with JUNTOS there are two heroes: each one gets all of these)
    this.heroes.forEach((player) => {
      // Hero stands on platforms
      this.physics.add.collider(player, this.platforms);
      // Hero bumps into the secret blocks (and hits them with the head)
      this.blocks.addHero(player);
      // Hero can stand on hidden platforms — landing on one gives an extra life
      this.physics.add.collider(
        player, this.powerupManager.getHiddenPlatforms(),
        (hero, platform) => this.powerupManager.heroLandsOnHiddenPlatform(hero, platform),
        null, this
      );

      // Hero vs Enemies — stomp or take damage
      this.physics.add.overlap(player, this.enemies, this.handleHeroEnemyContact, null, this);

      // Hero reaches the goal flag
      this.physics.add.overlap(player, this.goalFlag, this.reachGoal, null, this);

      // Hero collects power-ups
      this.physics.add.overlap(
        player, this.powerupManager.getGroup(),
        (hero, powerup) => this.powerupManager.collectPowerup(hero, powerup),
        null, this
      );

      // Hero picks up coins (to buy pencils in the sala)
      this.physics.add.overlap(player, this.coins, this.collectCoin, null, this);

      // Enemy projectiles hit hero
      this.physics.add.overlap(this.enemyProjectiles, player, this.enemyProjectileHitsHero, null, this);
    });

    // A frozen villain (❄️ ice pencil) is a block of ice: solid, and we can stand on it!
    this.heroes.forEach((player) => this.physics.add.collider(
      player, this.enemies, null, (hero, enemy) => this.isFrozen(enemy), this
    ));
    // Every dance counts for the LOGROS... and a skateboard trick gives points!
    this.heroes.forEach((player) => player.on('truco', () => {
      this.hero.addScore(50);
      this.saveState();
      this.hud.updateScore(this.hero.score);
      this.showFloatingText(player.x, player.y - 40, '¡Truco! +50');
    }));

    // Enemies walk on platforms (the flying bats go right through them)
    this.physics.add.collider(this.enemies, this.platforms, null, (enemy) => !enemy.isFlyer, this);

    // The 🟢 bouncing shots bounce on the floor and the platforms (5 bounces at most)
    this.physics.add.collider(this.heroProjectiles, this.platforms, (shot) => {
      shot.bounces += 1;
      if (shot.bounces > 5) shot.deactivate();
    }, (shot) => shot.active && shot.kind === 'verde', this);

    // Hero's projectiles hit enemies
    this.physics.add.overlap(
      this.heroProjectiles, this.enemies, this.projectileHitsEnemy, null, this
    );

    // --- Storm cloud (only in levels that have one) ---
    // It chases the hero and throws black and white pencils
    // (The scene object is reused for every level, so we forget the cloud of the
    // previous level first — otherwise an old, destroyed cloud keeps updating)
    this.stormCloud = null;
    if (this.levelData.stormCloud) {
      const cfg = this.levelData.stormCloud;
      this.stormCloud = new StormCloud(this, cfg.x, cfg.y, this.hero, cfg);
      // A pencil hits the hero — works like an enemy bullet.
      // Careful: when a single sprite (the hero) meets a group, Phaser gives
      // us the SPRITE first and the group member second — so (hero, pencil)!
      this.heroes.forEach((player) => this.physics.add.overlap(
        player, this.stormCloud.pencils,
        (hero, pencil) => this.pencilHitsHero(pencil, hero), null, this
      ));
    }

    // --- Camera ---
    // With JUNTOS the camera follows an invisible point in the middle of the two heroes
    this.camTarget = this.coop ? this.add.zone(this.hero.x, this.hero.y, 1, 1) : this.hero;
    this.cameras.main.startFollow(this.camTarget, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.levelData.worldWidth, WORLD.HEIGHT);
    this.cameras.main.setDeadzone(100, 50);
    // In the race our camera only draws on OUR half of the screen
    // (ONLINE and against the MÁQUINA we play alone on this screen: the whole screen is ours)
    if (this.race && !this.race.full) this.cameras.main.setViewport(this.race.side * 400, 0, 400, 600);

    // --- HUD ---
    this.hud = new HUDManager(this);
    this.hud.setLevelName(this.levelData.id, this.levelData.name);
    if (this.race && this.race.full) this.hud.useFullRace(this.race.help, this.race.shootKey);
    else if (this.race) this.hud.useHalfScreen(this.race.help, this.race.shootKey);

    // The weather: day, night, rain or snow, picked at random (see WeatherManager.js).
    // In the race both halves share the same one (same name = same weather)
    const weatherKey = this.race ? `carrera:${this.levelIndex}` : `${this.scene.key}:${this.levelIndex}`;
    this.weather = new WeatherManager(this, weatherFor(this.registry, weatherKey));

    // Against the MÁQUINA, we see it as a see-through "ghost" in our level
    this.createGhost();

    // A small reminder so we never forget that nothing can hurt us here
    // (always created, because the E+P hack can turn the mode on or off while we play)
    // (in a full-screen race it goes a bit lower, under the bars that say how everybody goes)
    this.godLabel = this.add.text(this.midX, this.race && this.race.full ? 112 : 80, 'MODO INMORTAL', {
      fontFamily: 'Arial', fontSize: '14px', color: '#66ee88',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100)
      .setVisible(isGodMode(this.registry));

    // No secret keys in the race: both halves would hear the keys, and
    // E+P would turn the mode on in one half and off again in the other!
    if (!this.race) this.setupCheats();
    // In the race, a big "Nivel 2" tells us we got to the next level
    if (this.race && this.levelIndex > 0) this.showRaceLevel();
    this.hud.updateLives(this.hero.lives);
    this.hud.updateScore(this.hero.score);
    this.hud.updateCoins(loadCoins());

    // The game song (it keeps playing if it was already on)
    playMusic('juego');
    // Things we bought in the TIENDA (only when a new game starts, see shop.js)
    if (!this.race) useShopItems(this);

    // Fade in
    this.cameras.main.fadeIn(500);
  }

  // Which level do we play? (SUPERVIVENCIA changes this: it has its own arena)
  chooseLevelData() {
    return (this.race ? levels : getLevels(this.registry))[this.levelIndex];
  }

  // ---------------------------------------------------------------
  // JUNTOS: player 2
  // ---------------------------------------------------------------
  createPlayerTwo() {
    const start = this.levelData.heroStart;
    // Player 2 is the normal hero. If player 1 is the normal hero too, player 2
    // is light blue, so we can tell them apart
    this.hero2 = new Hero(this, start.x - 40, start.y, 'arrows', { skin: null, cosmetics: false });
    if (!this.registry.get('skin')) {
      this.hero2.baseTint = 0x99ddff;
      this.hero2.setTint(this.hero2.baseTint);
    }
    this.hero2.lives = this.hero.lives;
    this.hero2.score = 0;
    this.heroes.push(this.hero2);
    // The two heroes share the hearts: this remembers how many we had
    this.sharedLives = this.hero.lives;

    // A "1" and a "2" over their heads
    this.playerTags = this.heroes.map((hero, i) => this.add.text(hero.x, hero.y - 40, `${i + 1}`, {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: i === 0 ? '#44aaff' : '#ff9933',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(50));

    // On an iPad or phone: each half of the screen gets its own buttons (like in the race)
    window.dispatchEvent(new CustomEvent('dos-jugadores', { detail: { mode: 'carrera' } }));
    this.events.once('shutdown', () => window.dispatchEvent(new Event('un-jugador')));
  }

  // The hearts are shared: if one hero lost (or won) a heart, the other one gets the same
  syncLives() {
    if (!this.coop) return;
    if (this.hero2.lives !== this.sharedLives) this.hero.lives = this.hero2.lives;
    else if (this.hero.lives !== this.sharedLives) this.hero2.lives = this.hero.lives;
    this.sharedLives = this.hero.lives;
  }

  // The hero that is closest to x (the villains that aim or chase use it)
  closestHero(x) {
    if (!this.coop) return this.hero;
    const visible = this.heroes.filter((h) => h.visible);
    return visible.reduce((best, h) => (Math.abs(h.x - x) < Math.abs(best.x - x) ? h : best), visible[0] || this.hero);
  }

  // Every frame with JUNTOS: the camera looks between the two heroes, the "1" and
  // "2" follow them, and if one stays too far behind, it jumps next to the other one
  updateCoop() {
    const [p1, p2] = this.heroes;
    this.camTarget.setPosition((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    this.playerTags.forEach((tag, i) => {
      const hero = this.heroes[i];
      tag.setPosition(hero.x, hero.y - 40).setVisible(hero.visible);
    });
    if (Math.abs(p1.x - p2.x) > 700) {
      const [behind, ahead] = p1.x < p2.x ? [p1, p2] : [p2, p1];
      this.bringNextTo(behind, ahead);
    }
  }

  // Put a hero right next to the other one, with a puff of color
  bringNextTo(hero, other) {
    hero.setPosition(other.x - 30, other.y - 20);
    hero.setVelocity(0, 0);
    this.powerupManager.spawnCollectParticles(hero.x, hero.y);
  }

  // Secret key combo for the levels:
  //   E then P      → invincible mode on / off
  // (the skins are chosen in the 'sala' before playing, never in the middle of a level)
  // The second key of the combo must come soon after the first one.
  setupCheats() {
    this.lastCheatKey = null;
    this.lastCheatTime = 0;

    this.input.keyboard.on('keydown', (event) => {
      if (this.levelComplete || event.repeat) return;
      const key = event.key.toLowerCase();
      const previous = this.time.now - this.lastCheatTime < 1500 ? this.lastCheatKey : null;
      this.lastCheatKey = key;
      this.lastCheatTime = this.time.now;

      if (key === 'p' && previous === 'e') {
        const on = !this.registry.get('godMode');
        this.registry.set('godMode', on);
        this.godLabel.setVisible(isGodMode(this.registry));
        this.showCheatMessage(on ? '¡Modo inmortal activado!' : 'Ya eres mortal otra vez');
      }
    });
  }

  // The MÁQUINA's ghost: a see-through, light blue hero with a 🤖 on top.
  // The machine itself lives in the RaceScene (see Bot.js); here we only draw it.
  createGhost() {
    this.ghost = null;
    const bot = this.race && this.raceBot();
    if (!bot) return;
    const body = this.add.image(0, 0, 'hero').setTint(0x99ddff);
    const tag = this.add.text(0, -36, '🤖', { fontSize: '18px' }).setOrigin(0.5);
    this.ghost = this.add.container(bot.x, bot.y, [body, tag]).setAlpha(0.5).setDepth(2);
  }

  // The race (the scene on top) says when we can move, and has the machine.
  // (ESCONDIDAS has its own clock and its own machine, so it changes these two)
  raceStarted() {
    return this.scene.get('RaceScene').started;
  }

  raceBot() {
    return this.scene.get('RaceScene').bot;
  }

  // The ghost goes where the machine is, but only if it is in OUR level
  moveGhost() {
    if (!this.ghost) return;
    const bot = this.raceBot();
    this.ghost.setVisible(bot.levelIndex === this.levelIndex && !bot.finished);
    // It glides there smoothly (no jumps from one place to another),
    // unless it is very far away (it just started a new level)
    if (Math.abs(bot.x - this.ghost.x) > 400) this.ghost.setPosition(bot.x, bot.y);
    this.ghost.x += (bot.x - this.ghost.x) * 0.3;
    this.ghost.y += (bot.y - this.ghost.y) * 0.15;
    // It looks the way it walks
    this.ghost.first.setFlipX(bot.x < this.ghost.x - 1);
  }

  // Race: "Nivel 2" in big letters in the middle of our half, for a moment
  showRaceLevel() {
    const text = this.add.text(this.midX, 260, `Nivel ${this.levelData.id}`, {
      fontFamily: 'Arial', fontSize: '48px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({
      targets: text, alpha: 0, delay: 1000, duration: 500,
      onComplete: () => text.destroy(),
    });
  }

  // A short message at the top of the screen
  showCheatMessage(message) {
    const text = this.add.text(400, 110, message, {
      fontFamily: 'Arial', fontSize: '18px', color: '#66ee88',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({
      targets: text, alpha: 0, delay: 900, duration: 400,
      onComplete: () => text.destroy(),
    });
  }

  // A hero projectile hits an enemy
  projectileHitsEnemy(projectile, enemy) {
    if (enemy.isDefeated) return;
    if (!projectile.active) return;

    if (projectile.kind === 'rojo') {
      // 🔥 FIRE: it keeps going (through all the villains) and hurts twice as much,
      // but each villain only once
      if (projectile.hitEnemies.has(enemy)) return;
      projectile.hitEnemies.add(enemy);
      enemy.takeDamage(2);
    } else {
      // Deactivate the projectile (return to pool)
      projectile.deactivate();
      // Damage the enemy
      enemy.takeDamage(1);
      // ❄️ ICE: the villain that is still standing gets frozen
      if (projectile.kind === 'azul' && !enemy.isDefeated) this.freezeEnemy(enemy);
    }

    // If the enemy was defeated, add score
    if (enemy.isDefeated) {
      this.hero.addScore(enemy.scoreValue);
      reportMission('villanos'); // for the MISIONES DEL DÍA
      playSound('pisar');
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

  // A pencil from the storm cloud hits the hero
  pencilHitsHero(pencil, hero) {
    if (!pencil.active || this.levelComplete) return;
    pencil.destroy();

    // The shield absorbs it; otherwise we lose a life but KEEP playing.
    // We don't restart the level here: the cloud keeps chasing us, so going
    // back to the start every time would be too harsh.
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
    // A frozen villain is a block of ice: it can't hurt us (we can stand on it)
    if (this.isFrozen(enemy)) return;
    // A Doble-X that just split out of a bigger one can't hurt us for a moment
    if (enemy.harmlessUntil && this.time.now < enemy.harmlessUntil) return;
    // 🚀 On the rocket we knock out the villains we crash into!
    // (a short wait between hits, or the big boss would lose all its life at once)
    if (hero.vehicle === 'cohete') {
      if (this.time.now - (enemy.lastCrash || 0) < 500) return;
      enemy.lastCrash = this.time.now;
      enemy.takeDamage(3);
      playSound('pisar');
      if (enemy.isDefeated) {
        reportMission('villanos');
        this.hero.addScore(enemy.scoreValue);
        this.saveState();
        this.hud.updateScore(this.hero.score);
        this.showFloatingText(enemy.x, enemy.y - 20, `+${enemy.scoreValue}`);
      }
      return;
    }
    if (hero.isInvincible) return;

    // STOMP: hero falling AND above enemy's head
    const heroFalling = hero.body.velocity.y > 0;
    const heroAboveEnemy = hero.body.bottom <= enemy.body.top + 16;

    if (heroFalling && heroAboveEnemy) {
      // Stomp the enemy!
      enemy.takeDamage(1);
      hero.setVelocityY(HERO.JUMP_VELOCITY * 0.6);
      // (the points always go to the first hero: with JUNTOS, the points are shared too)
      this.hero.addScore(enemy.scoreValue);
      if (enemy.isDefeated) reportMission('villanos');
      playSound('pisar');
      this.saveState();
      this.hud.updateScore(this.hero.score);
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

  // ❄️ The ice pencil: the villain becomes a block of ice for 3.5 seconds
  freezeEnemy(enemy) {
    enemy.frozenUntil = this.time.now + 3500;
    enemy.setVelocity(0, 0);
    enemy.body.setImmovable(true);
    enemy.body.moves = false; // it doesn't fall either: flying ones stay in the air
    enemy.setTint(0x88ddff);
  }

  isFrozen(enemy) {
    return enemy.frozenUntil > this.time.now;
  }

  // The ice melts: the villain moves again. A hero standing on top gets a little hop,
  // so the villain doesn't hurt them right away
  unfreeze(enemy) {
    enemy.frozenUntil = 0;
    if (!enemy.active) return;
    enemy.body.setImmovable(false);
    enemy.body.moves = true;
    enemy.clearTint();
    this.heroes.forEach((hero) => {
      if (Math.abs(hero.x - enemy.x) < 34 && hero.body.bottom <= enemy.body.top + 6) hero.setVelocityY(-260);
    });
  }

  // Fade out and restart the same level from the beginning
  restartLevel() {
    // Prevent multiple triggers
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.hero.setVelocity(0, 0);

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ levelIndex: this.levelIndex, race: this.race });
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

  // The modes with no coins (BÚSQUEDA, LAVA, ESCONDIDAS...) take the coins
  // AND the secret blocks away (the blocks have coins inside)
  removeCoins() {
    this.coins.clear(true, true);
    this.blocks.clear();
  }

  // Pick up a coin: it is saved right away, so we keep it even if we lose
  collectCoin(hero, coin) {
    coin.destroy();
    const total = addCoins(1);
    reportMission('monedas');
    playSound('moneda');
    this.hud.updateCoins(total);
    this.showFloatingText(coin.x, coin.y - 10, '+1');
  }

  // Hero reaches the goal flag — level complete!
  // ("hero" = the one that got there: with JUNTOS it can be player 2)
  reachGoal(hero = this.hero) {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.goalHero = hero;
    // Off the skateboard or the rocket: the level is done
    this.heroes.forEach((h) => h.dismount(true));

    // Stop the hero
    hero.setVelocity(0, 0);
    hero.body.setAllowGravity(false);

    // JUNTOS: the other hero disappears in a puff of color (they go on together)
    if (this.coop) {
      this.heroes.filter((h) => h !== hero).forEach((other) => {
        this.powerupManager.spawnCollectParticles(other.x, other.y);
        other.body.enable = false;
        other.setVisible(false);
      });
      this.playerTags.forEach((tag) => tag.setVisible(false));
      reportMission('juntos'); // for the LOGROS
    }

    // A level done counts for the MISIONES (only real levels, not the race)
    if (!this.race) reportMission('niveles');
    playSound('ganar');

    // Bonus points for completing the level
    this.hero.addScore(500);
    this.saveState();
    this.hud.updateScore(this.hero.score);

    // The black-and-white villains that are still around get their colors back
    this.colorizeEnemies();

    // In the race there are no castle or color animations: we hurry to the next level!
    if (this.race) {
      this.finishRaceLevel();
      return;
    }

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

    this.showFloatingText(hero.x, hero.y - 30, '+500');

    // The camera flies back over the level while the color returns to the world
    this.playColorReturn();

    // Go to next level or win!
    this.time.delayedCall(4200, () => {
      const nextLevel = this.levelIndex + 1;
      const country = this.registry.get('country');
      if (nextLevel < getLevels(this.registry).length) {
        // Next level!
        this.cameras.main.fadeOut(400);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('LevelIntroScene', { levelIndex: nextLevel });
        });
      } else if (country) {
        // Beat the 3 levels of a country: back to the map, where it gets its color
        this.cameras.main.fadeOut(800, 255, 255, 255);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('WorldMapScene', { completedCountry: country.id });
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

  // Race: we finished a level. Was it the last one? Then we WIN the race!
  finishRaceLevel() {
    const nextLevel = this.levelIndex + 1;
    const wonRace = nextLevel >= this.race.goalLevel;

    this.add.text(this.midX, 250, wonRace ? `¡Llegaste al Nivel ${nextLevel + 1}!` : '¡Nivel Completado!', {
      fontFamily: 'Arial', fontSize: '32px', color: '#ffff00',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    if (wonRace) {
      // Tell the race (the scene on top) that we got there first
      this.scene.get('RaceScene').playerWon(this.race.player);
      return;
    }

    // A short moment to see the message, then the next level in OUR half
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.restart({ levelIndex: nextLevel, race: this.race });
      });
    });
  }

  // Every enemy still standing turns a bright color (blue, orange, red,
  // violet, yellow...) with a little hop and a burst of color.
  colorizeEnemies() {
    const colors = [0x0088ff, 0xff8800, 0xff0000, 0x8800ff, 0xffdd00, 0x00cc44, 0xff44aa];

    this.enemies.getChildren().forEach((enemy, i) => {
      if (!enemy.active || enemy.isDefeated) return;

      // Freeze the enemy so it doesn't keep walking (or shooting) while it celebrates
      enemy.isDefeated = true;
      enemy.setVelocity(0, 0);

      // Each enemy changes a little after the previous one, so it feels like a wave.
      // The color is a solid "fill" because the enemies are almost black: a normal
      // tint would multiply with black and stay dark.
      this.time.delayedCall(300 + i * 150, () => {
        if (!enemy.active) return;
        enemy.setTintFill(colors[i % colors.length]);
        enemy.spawnColorParticles();
        // A happy little hop
        enemy.body.setAllowGravity(true);
        enemy.setVelocityY(-180);
      });
    });
  }

  // Level complete! The camera slides BACK over the whole level (so you see
  // what you just crossed) while the color spreads through the world.
  playColorReturn() {
    const cam = this.cameras.main;
    const duration = 3600;

    // Stop following the hero so the camera can travel on its own
    cam.stopFollow();
    this.tweens.add({
      targets: cam,
      scrollX: 0,
      duration,
      delay: 400,
      ease: 'Sine.easeInOut',
    });

    // 1) The gray background fades away, showing the colorful one behind it
    this.tweens.add({
      targets: this.grayBackground,
      alpha: 0,
      duration: duration - 600,
      delay: 600,
    });

    // 2) The platforms change from gray to their real colors
    const gray = Math.floor(128 + (127 * (this.levelData.saturation || 0)));
    const from = new Phaser.Display.Color(gray, gray, gray);
    const white = new Phaser.Display.Color(255, 255, 255);
    this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: duration - 600,
      delay: 600,
      onUpdate: (tween) => {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(from, white, 100, tween.getValue());
        const tint = Phaser.Display.Color.GetColor(c.r, c.g, c.b);
        this.platforms.getChildren().forEach(p => p.setTint(tint));
      },
    });

    // 3) A wave of rainbow color sweeps across the screen
    const rainbow = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0088ff, 0x8800ff];
    const bandWidth = 800 / rainbow.length;
    rainbow.forEach((color, i) => {
      const band = this.add.rectangle(-bandWidth, 300, bandWidth + 10, 600, color, 0.3)
        .setScrollFactor(0).setDepth(90);
      this.tweens.add({
        targets: band,
        x: (i * bandWidth) + bandWidth / 2,
        duration: 900,
        delay: 500 + i * 250,
        ease: 'Power2',
      });
      // ...and then each band fades out, leaving the world colorful
      this.tweens.add({
        targets: band,
        alpha: 0,
        duration: 900,
        delay: 2300 + i * 150,
      });
    });
  }

  // The hero walks to the castle door, the door lights up, and the hero
  // shrinks into the doorway — then the next level starts INSIDE the castle.
  enterCastle() {
    const hero = this.goalHero || this.hero;
    const goal = this.levelData.goal;

    // Turn off physics so the tweens below have full control of the hero
    hero.body.enable = false;
    hero.setDepth(2); // draw the hero in front of the castle
    hero.hideShields();

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
    const hero = this.goalHero || this.hero;
    const goal = this.levelData.goal;

    // Turn off physics so the tweens below have full control of the hero
    hero.body.enable = false;
    hero.hideShields();

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

    // The storm cloud flies over the pipe and gets cured by colored pencils
    // (the colors are coming back!). It happens while the hero is entering.
    if (this.stormCloud) {
      this.stormCloud.pencils.clear(true, true); // no more dangerous pencils
      this.tweens.add({
        targets: this.stormCloud,
        x: goal.x - 20,
        y: pipeTop - 190,
        duration: 900,
        ease: 'Sine.easeInOut',
        onComplete: () => this.stormCloud.turnHappy(),
      });
    }

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
          // If there is a storm cloud, wait on top of the pipe until it is cured
          delay: this.stormCloud ? 3600 : 250,
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
    // In the race there is no game over: we just try the level again
    if (this.race) {
      this.levelComplete = false; // heroFell() may have set it: restartLevel() must not skip
      this.restartLevel();
      return;
    }
    this.levelComplete = true;
    this.hero.setVelocity(0, 0);
    playSound('perder');

    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameOverScene');
    });
  }

  // Save hero state to registry (persists between scenes)
  saveState() {
    if (this.race) return; // the race doesn't use the registry (see create)
    this.syncLives();
    this.registry.set('lives', this.hero.lives);
    this.registry.set('score', this.hero.score);
  }

  // update() — The game loop! 60 times per second
  update(time, delta) {
    this.moveGhost();
    if (this.levelComplete) return;
    // In the race nobody moves until the countdown says "¡YA!"
    if (this.race && !this.raceStarted()) return;

    // Update hero (input and movement) — both of them with JUNTOS
    this.heroes.forEach((hero) => hero.update());
    if (this.coop) {
      this.syncLives();
      this.updateCoop();
    }

    // Update the storm cloud (flies after the hero and throws pencils)
    if (this.stormCloud) this.stormCloud.update(time, delta);

    // Night: the light of the flashlight follows the heroes
    this.weather.update();

    // Update all enemies (patrol movement)
    this.enemies.getChildren().forEach(enemy => {
      // A frozen villain doesn't move or shoot until the ice melts
      if (enemy.frozenUntil) {
        if (this.isFrozen(enemy) && !enemy.isDefeated) {
          enemy.setTint(0x88ddff);
          return;
        }
        this.unfreeze(enemy);
      }
      if (enemy.active) enemy.update();
      // Enemies that fall into a pit are removed (no invisible floor anymore)
      if (enemy.active && enemy.y > WORLD.HEIGHT + 100) enemy.destroy();
    });

    // Update HUD
    this.hud.updateLives(this.hero.lives);

    // Check if hero fell into a pit
    if (this.coop) {
      this.heroes.forEach((hero) => {
        if (hero.y > WORLD.HEIGHT + 50) this.coopHeroFell(hero);
      });
    } else if (this.hero.y > WORLD.HEIGHT + 50) {
      this.heroFell();
    }
  }

  // JUNTOS: a hero fell into a pit. It costs a (shared) heart, but the level does
  // NOT start again: the hero comes back next to the other one
  coopHeroFell(hero) {
    if (this.levelComplete) return;
    const other = this.heroes.find((h) => h !== hero);
    if (!isGodMode(this.registry)) {
      hero.lives -= 1;
      this.saveState();
      this.hud.updateLives(this.hero.lives);
      playSound('golpe');
      if (this.hero.lives <= 0) {
        this.gameOver();
        return;
      }
    }
    // (if the other one is falling too, both go back to the start)
    if (other.y > WORLD.HEIGHT) {
      other.setPosition(this.levelData.heroStart.x, this.levelData.heroStart.y);
      other.setVelocity(0, 0);
    }
    this.bringNextTo(hero, other);
  }

  // Hero fell off the bottom of the screen — lose a life and restart this level
  heroFell() {
    // Invincible mode: falling into a pit just puts us back at the start
    if (isGodMode(this.registry)) {
      this.hero.setPosition(this.levelData.heroStart.x, this.levelData.heroStart.y);
      this.hero.setVelocity(0, 0);
      return;
    }

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
