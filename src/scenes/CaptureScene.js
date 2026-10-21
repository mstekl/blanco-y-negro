// CaptureScene.js — CAPTURA LA BANDERA! (from the sala: the BANDERA button, or F)
// Two teams in the SAME arena: BLUE (player 1, base on the left) and ORANGE
// (player 2 or the MÁQUINA, base on the right). Each base has its flag.
//   - Walk over the OTHER team's flag to grab it, and carry it to YOUR base:
//     that is 1 point. The first to 3 points wins!
//   - If somebody is carrying your flag, TOUCH them: the flag goes back to
//     your base, and they go back to theirs.
// OFFLINE (two players on this screen): the screen is split in two, but both
// halves look at the SAME world, with two cameras (one follows each hero).
// MÁQUINA: we play alone on the whole screen, and the machine is a see-through
// ghost 🤖 that flies to steal our flag, and chases us when we steal its flag.
// It runs inside the race (RaceScene.js), that does the 3-2-1 and says who won.
//
// This scene is a copy of the normal level (LevelScene) with some changes:
// its own arena, a second hero (and a second camera), the bases and the flags.

import Phaser from 'phaser';
import LevelScene from './LevelScene.js';
import Hero from '../sprites/Hero.js';
import { levels } from '../data/levels.js';
import { playSound } from '../audio/Sound.js';
import { weatherFor } from '../managers/WeatherManager.js';

export const ARENA_WIDTH = 2400;
const GROUND_Y = 568;
export const POINTS_TO_WIN = 3;
export const BASE_X = [150, ARENA_WIDTH - 150]; // blue base, orange base
const TEAM_COLORS = [0x44aaff, 0xff9933];
const TEAM_NAMES = ['AZUL', 'NARANJA'];
const GRAB_DISTANCE = 45;  // how close we must be to a flag to grab it
const TAG_DISTANCE = 38;   // how close two players must be to touch each other
const SAFE_TIME = 1500;    // after being touched, nobody can touch us for a moment
const BASE_HALF_WIDTH = 85; // each base is 170 pixels wide

// The platforms of the left half; the right half is the same, but mirrored,
// so it is fair for both teams
const LEFT_PLATFORMS = [
  { x: 320, y: 450, width: 128 },
  { x: 540, y: 370, width: 192 },
  { x: 820, y: 450, width: 128 },
  { x: 880, y: 290, width: 128 },
];
const mirror = (p) => ({ ...p, x: ARENA_WIDTH - p.x - p.width });

const ARENA = {
  id: 0,
  name: 'Captura la bandera',
  worldWidth: ARENA_WIDTH,
  saturation: 0.3,
  heroStart: { x: BASE_X[0], y: 500 },
  goal: { x: -200, y: 504 }, // far away and hidden: there is no goal here
  platforms: [
    { x: 0, y: GROUND_Y, width: ARENA_WIDTH, type: 'ground' },
    ...LEFT_PLATFORMS.map((p) => ({ ...p, type: 'platform' })),
    ...LEFT_PLATFORMS.map((p) => ({ ...mirror(p), type: 'platform' })),
    // A high platform right in the middle
    { x: ARENA_WIDTH / 2 - 128, y: 360, width: 256, type: 'platform' },
  ],
  enemies: [],
  powerups: [],
  buildings: levels[0].buildings,
};

class CaptureScene extends LevelScene {
  constructor() {
    super('CaptureScene');
  }

  // data.players = the players of the race (one or two); data.race = player 1
  init(data) {
    super.init(data);
    this.racePlayers = data.players || [data.race];
  }

  chooseLevelData() {
    return ARENA;
  }

  create() {
    // Phaser reuses this scene object every game: forget player 2 of the last game
    // (an OFFLINE game and then one against the MÁQUINA must not mix)
    this.hero2 = null;
    this.cam2 = null;
    this.playerTags = null;
    // No night here: with two cameras the flashlight would only follow one of them
    if (weatherFor(this.registry, 'carrera:0') === 'noche') this.registry.get('climas')['carrera:0'] = 'dia';
    super.create();

    // No villains, no coins and no goal: this is about the flags!
    this.enemies.clear(true, true);
    this.removeCoins();
    this.goalFlag.setVisible(false);
    this.goalFlag.body.enable = false;
    // The normal HUD (hearts, points...) is not needed: we show the score instead
    const hud = this.hud;
    [...hud.hearts, hud.scoreText, hud.levelText, hud.coinIcon, hud.coinText, hud.colorGunText, hud.helpText]
      .forEach((thing) => thing.setVisible(false));

    this.race0 = this.scene.get('RaceScene');
    this.scores = [0, 0];
    this.drawBases();

    // The players: player 1 is always the blue team. The orange team is player 2,
    // or the machine (it has no hero: it is the ghost, see Bot.js)
    this.agents = [{ team: 0, player: 1, hero: this.hero, safeUntil: 0 }];
    this.bot = this.race0.bot;
    if (this.racePlayers.length > 1) {
      this.createSecondPlayer();
      this.agents.push({ team: 1, player: 2, hero: this.hero2, safeUntil: 0 });
    } else if (this.bot) {
      this.agents.push({ team: 1, player: 2, bot: this.bot, safeUntil: 0 });
    }

    // The two flags, each one at home in its base
    this.flags = [0, 1].map((team) => ({
      team,
      carrier: null,
      sprite: this.add.image(BASE_X[team], GROUND_Y, flagTexture(this, TEAM_COLORS[team]))
        .setOrigin(0.15, 1).setDepth(4),
    }));

    this.createScoreboard();
  }

  // OFFLINE: the second hero, with its own camera on the right half of the screen
  createSecondPlayer() {
    this.hero2 = new Hero(this, BASE_X[1], 500, 'arrows', { skin: null, cosmetics: false });
    this.hero2.setFlipX(true);
    this.hero2.facingRight = false;
    this.hero2.keys.run = [];
    // If player 1 is the normal hero too, player 2 is a bit orange, so we can tell them apart
    if (!this.registry.get('skin')) {
      this.hero2.baseTint = 0xffcc99;
      this.hero2.setTint(this.hero2.baseTint);
    }
    this.hero2.slippery = this.hero.slippery; // the snow is slippery for both
    this.physics.add.collider(this.hero2, this.platforms);
    this.heroes.push(this.hero2);

    // A "1" and a "2" over their heads
    this.playerTags = this.heroes.map((hero, i) => this.add.text(hero.x, hero.y - 40, `${i + 1}`, {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: i === 0 ? '#44aaff' : '#ff9933',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(50));

    // The second camera: the right half of the screen, following player 2
    this.cam2 = this.cameras.add(400, 0, 400, 600);
    this.cam2.setBounds(0, 0, ARENA_WIDTH, 600);
    this.cam2.startFollow(this.hero2, true, 0.1, 0.1);
    this.cam2.setDeadzone(100, 50);
  }

  // Each base: a colored floor, a soft colored light, and its name
  drawBases() {
    BASE_X.forEach((x, team) => {
      const color = TEAM_COLORS[team];
      this.add.rectangle(x, 300, BASE_HALF_WIDTH * 2, 540, color, 0.12).setDepth(-1);
      this.add.rectangle(x, GROUND_Y + 4, BASE_HALF_WIDTH * 2, 10, color).setDepth(1);
      this.add.text(x, 230, `BASE ${TEAM_NAMES[team]}`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
        color: team === 0 ? '#44aaff' : '#ff9933', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(1);
    });
  }

  // The score at the top, and the keys at the bottom (one for each half)
  createScoreboard() {
    // (in the split screen it goes a bit lower, under "JUGADOR 1" and "JUGADOR 2")
    this.scoreText = this.add.text(this.midX, this.cam2 ? 38 : 14, '', {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    this.updateScoreboard();

    // The keys: in the split screen, each half only shows ITS keys
    // (a camera can "ignore" things, so the other half doesn't draw them)
    this.racePlayers.forEach((p, i) => {
      const help = this.add.text(this.midX, 590, `${p.help}  |  Toca al que lleva tu bandera`, {
        fontFamily: 'Arial', fontSize: '12px', color: '#dddddd', stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(100);
      if (this.cam2) (i === 0 ? this.cam2 : this.cameras.main).ignore(help);
    });
  }

  updateScoreboard() {
    this.scoreText.setText(`🔵 ${this.scores[0]}   -   ${this.scores[1]} 🟠`);
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.playerTags) {
      this.playerTags.forEach((tag, i) => tag.setPosition(this.heroes[i].x, this.heroes[i].y - 40));
    }
    if (this.levelComplete || !this.race0.started) return;

    this.agents.forEach((agent) => this.checkFlags(agent));
    if (this.agents.length > 1) this.checkTouch(this.agents[0], this.agents[1]);
    if (this.bot && this.agents[1]) this.tellTheBot();
    this.moveCarriedFlags();
  }

  // Where a player is (a hero, or the machine's ghost)
  pos(agent) {
    return agent.hero ? { x: agent.hero.x, y: agent.hero.y } : { x: agent.bot.x, y: agent.bot.y };
  }

  // Grab the other team's flag, or bring it home
  checkFlags(agent) {
    const p = this.pos(agent);
    const theirFlag = this.flags[1 - agent.team];
    const flagSpot = { x: theirFlag.sprite.x, y: theirFlag.sprite.y - 30 };

    if (!theirFlag.carrier && this.time.now > agent.safeUntil
      && Phaser.Math.Distance.Between(p.x, p.y, flagSpot.x, flagSpot.y) < GRAB_DISTANCE) {
      theirFlag.carrier = agent;
      playSound('moneda');
      this.showFloatingText(p.x, p.y - 50, agent.bot ? '¡La máquina tiene tu bandera!' : '¡Llévala a tu base!');
    }

    if (theirFlag.carrier === agent && Math.abs(p.x - BASE_X[agent.team]) < 70 && p.y > GROUND_Y - 120) {
      this.capture(agent, theirFlag);
    }
  }

  // A point! The flag goes back to its base
  capture(agent, flag) {
    this.scores[agent.team] += 1;
    this.sendFlagHome(flag);
    this.updateScoreboard();
    playSound('lapizBueno');
    const p = this.pos(agent);
    this.showFloatingText(p.x, p.y - 50, `¡BANDERA! ${this.scores[agent.team]}/${POINTS_TO_WIN}`);
    this.powerupManager.spawnCollectParticles(p.x, p.y);

    if (agent.bot) {
      // The machine counts its points; the race asks it, and sees when it wins
      agent.bot.score = this.scores[agent.team];
      return;
    }
    if (this.scores[agent.team] >= POINTS_TO_WIN) {
      this.levelComplete = true;
      this.heroes.forEach((h) => h.setVelocity(0, 0));
      this.race0.playerWon(agent.player, `Capturó ${POINTS_TO_WIN} banderas`);
    }
  }

  // Two players touch: whoever carries a flag drops it (it goes home), and goes home too.
  // But INSIDE the other team's base nobody can touch us: otherwise a player could
  // just stand on their own flag, and nobody could ever take it!
  checkTouch(a, b) {
    const pa = this.pos(a);
    const pb = this.pos(b);
    if (Phaser.Math.Distance.Between(pa.x, pa.y, pb.x, pb.y) > TAG_DISTANCE) return;
    [a, b].forEach((agent) => {
      const carried = this.flags[1 - agent.team];
      const p = this.pos(agent);
      const inTheirBase = Math.abs(p.x - BASE_X[1 - agent.team]) < BASE_HALF_WIDTH;
      if (carried.carrier === agent && !inTheirBase && this.time.now > agent.safeUntil) this.tag(agent, carried);
    });
  }

  tag(agent, flag) {
    playSound('golpe');
    const p = this.pos(agent);
    this.showFloatingText(p.x, p.y - 50, '¡Te atraparon!');
    this.sendFlagHome(flag);
    agent.safeUntil = this.time.now + SAFE_TIME;
    if (agent.bot) {
      agent.bot.sendHome();
      return;
    }
    // Back to our base, blinking for a moment
    const hero = agent.hero;
    this.powerupManager.spawnCollectParticles(hero.x, hero.y);
    hero.setPosition(BASE_X[agent.team], 500);
    hero.setVelocity(0, 0);
    this.tweens.add({ targets: hero, alpha: 0.3, duration: 120, yoyo: true, repeat: 5, onComplete: () => hero.setAlpha(1) });
  }

  sendFlagHome(flag) {
    flag.carrier = null;
    flag.sprite.setPosition(BASE_X[flag.team], GROUND_Y).setScale(1);
  }

  // A carried flag goes over the head of whoever carries it
  moveCarriedFlags() {
    this.flags.forEach((flag) => {
      if (!flag.carrier) return;
      const p = this.pos(flag.carrier);
      flag.sprite.setPosition(p.x - 4, p.y - 18).setScale(0.7);
    });
  }

  // The machine decides where to go, with what it sees (see CaptureBot in Bot.js)
  tellTheBot() {
    const botAgent = this.agents[1];
    this.bot.think({
      heroX: this.hero.x,
      heroY: this.hero.y,
      botCarrying: this.flags[0].carrier === botAgent,
      heroCarrying: this.flags[1].carrier === this.agents[0],
      flagX: this.flags[0].sprite.x,
      flagY: this.flags[0].sprite.y - 30,
    });
  }

  // The ground covers the whole arena, so we can't fall... but just in case
  heroFell() {
    this.hero.setPosition(BASE_X[0], 500);
    this.hero.setVelocity(0, 0);
  }

  // There is no goal flag here (and no villains to hurt us)
  reachGoal() {}
}

// A flag on a pole, in the color of its team (made the first time we need it)
function flagTexture(scene, color) {
  const key = `capture-flag-${color.toString(16)}`;
  if (scene.textures.exists(key)) return key;
  const gfx = scene.add.graphics();
  // The pole, with a black outline so it can be seen on the gray world
  gfx.fillStyle(0x000000);
  gfx.fillRect(3, 0, 6, 64);
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(4, 1, 4, 63);
  // The cloth
  gfx.fillStyle(0x000000);
  gfx.fillTriangle(8, 2, 42, 14, 8, 28);
  gfx.fillStyle(color);
  gfx.fillTriangle(9, 5, 38, 14, 9, 24);
  gfx.generateTexture(key, 44, 64);
  gfx.destroy();
  return key;
}

export default CaptureScene;
