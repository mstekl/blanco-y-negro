// SoccerScene.js — FÚTBOL! (from the sala: the ⚽ FÚTBOL button, or G)
// Like "Head Soccer": ONE small field on the whole screen, a goal on each side.
//   - Player 1 (BLUE) defends the goal on the LEFT and shoots at the right one.
//   - Player 2 (ORANGE), or the MÁQUINA (a robot 🤖), defends the one on the RIGHT.
//   - The ball bounces off our heads and bodies. The KICK key kicks it hard
//     towards the other goal: standing on the floor = a high shot,
//     in the air = a low, strong shot.
//   - The game lasts 1 minute and 30 seconds. The one with more goals wins.
//   - A TIE? Then come the PENALES: 5 shots each, taking turns. One kicks,
//     the other is the goalkeeper. Still a tie after 5? One more each, until
//     somebody misses!
// OFFLINE: two players on this keyboard (W A D + S, and the arrows + ↓).
// MÁQUINA: we play with the normal keys (Z kicks) against the robot (see SoccerBot in Bot.js).
//
// Unlike the race, this scene runs by itself: it is not a copy of LevelScene,
// because it has no level, only a field, two players and a ball.

import Phaser from 'phaser';
import Hero from '../sprites/Hero.js';
import { SoccerBot } from '../maquina/Bot.js';
import { addCoins, makeCoinTexture } from '../data/coins.js';
import { earnStars } from '../data/pass.js';
import { playSound, playMusic } from '../audio/Sound.js';
import { teamBadge } from '../data/soccerTeams.js';

const GROUND_Y = 540;      // the top of the grass
const GOAL_W = 70;         // how deep each goal is
const CROSSBAR_Y = 370;    // the top of the goal (the crossbar)
const BALL_R = 13;         // the ball is 26 pixels big
const MATCH_SECONDS = 90;  // 1 minute and 30 seconds
const PENALTIES = 5;       // shots each in the penalties
const PLAYER_SCALE = 1.6;  // the players are bigger than in the levels
const KICK_DISTANCE = 70;  // how close the ball must be to kick it
const KICK_SPEED = 560;
const TEAM_COLORS = ['#44aaff', '#ff9933'];

// The POWERS: a box falls from the sky every few seconds. The one who touches it gets:
//   🗿 gigante: a GIANT player for 8 seconds (bigger head = more goals saved!)
//   🔥 fuego:   the next kick is a fire ball, super fast
//   🧊 hielo:   a wall of ice covers YOUR goal for 5 seconds
const POWERS = [
  { id: 'gigante', icon: '🗿', name: '¡CABEZA GIGANTE!' },
  { id: 'fuego', icon: '🔥', name: '¡PELOTA DE FUEGO!' },
  { id: 'hielo', icon: '🧊', name: '¡ARCO CONGELADO!' },
];
const POWER_EVERY = 12;     // seconds between two boxes
const GIANT_SCALE = 2.5;
const GIANT_SECONDS = 8;
const ICE_SECONDS = 5;

// Coins for beating the machine (like in the race)
const COIN_PRIZES = { facil: 5, normal: 10, dificil: 20 };

class SoccerScene extends Phaser.Scene {
  constructor() {
    super('SoccerScene');
  }

  // data.how   = 'dos' (two on this screen) or 'maquina'
  // data.level = how good the robot is: 'facil', 'normal', 'dificil' (see SoccerBot in Bot.js)
  // data.teams = [our team, their team] (see soccerTeams.js), or nothing for a quick match
  // data.context = a match of the TEMPORADA or the MUNDIAL:
  //   { returnTo: the scene to go back to, draws: true = a tie is a tie (no penalties) }
  //   At the end we go back there with the result, and THAT scene gives the prizes.
  init(data = {}) {
    this.how = data.how === 'maquina' ? 'maquina' : 'dos';
    this.level = data.level || 'normal';
    this.teams = data.teams || null;
    this.context = data.context || null;
    this.startData = data; // for the REVANCHA
    this.leaving = false;
  }

  create() {
    this.cameras.main.fadeIn(300);
    this.physics.world.setBounds(0, 0, 800, 600);
    playMusic('juego');

    // (Phaser reuses this scene object every match: everything starts again from zero)
    this.score = [0, 0];
    this.timeLeft = MATCH_SECONDS;
    this.lastToucher = null;
    this.shots = null; // the penalties (only after a tie)
    this.pen = null;
    // The POWERS that fall from the sky (see "Powers" below)
    this.powerup = null;     // the box that is falling or waiting on the grass
    this.nextPower = POWER_EVERY;
    this.ice = [null, null]; // the ice wall in front of each goal
    this.fireTime = 0;       // how long the ball keeps burning

    this.drawField();
    this.createSolidThings();
    this.createBall();
    this.createPlayers();
    this.createScoreboard();
    // What is happening now: 'cuenta' (3 2 1), 'juego', 'gol' (a short pause),
    // 'penales' and 'fin'
    this.phase = 'cuenta';
    this.kickOff();
    const side = '¡Mete goles en el arco de la derecha!';
    const intro = this.teams
      ? [`${this.teams[0].name}  vs  ${this.teams[1].name}`, side]
      : [side, 'Gana el que hace más goles en 1:30'];
    this.countdown(intro, () => {
      this.phase = 'juego';
    });

    // On an iPad or phone: each half of the screen gets its own buttons (⚽ = kick)
    if (this.how === 'dos') {
      window.dispatchEvent(new CustomEvent('dos-jugadores', { detail: { mode: 'futbol' } }));
      this.events.once('shutdown', () => window.dispatchEvent(new Event('un-jugador')));
    }

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.leave();
      else if (event.key === 'Enter' && this.phase === 'fin') this.leave();
      else if (event.code === 'KeyR' && this.phase === 'fin') this.rematch();
    });
  }

  // ---------------------------------------------------------------
  // The field
  // ---------------------------------------------------------------
  drawField() {
    const g = this.add.graphics().setDepth(-10);
    // Sky
    g.fillGradientStyle(0x3d9bff, 0x3d9bff, 0xcdeeff, 0xcdeeff);
    g.fillRect(0, 0, 800, 600);
    // The stands far away, full of people (little colored heads)
    g.fillStyle(0x555b66);
    g.fillRect(0, 150, 800, 200);
    const shirts = [0xff5555, 0x44aaff, 0xffdd33, 0x66ee88, 0xff9933, 0xffffff, 0xcc77ff];
    for (let row = 0; row < 6; row++) {
      g.fillStyle(0x3f444d);
      g.fillRect(0, 168 + row * 30, 800, 4); // the steps
      for (let x = 8 + (row % 2) * 9; x < 800; x += 18) {
        const i = (x * 7 + row * 13) % shirts.length;
        g.fillStyle(shirts[i]);
        g.fillRect(x - 5, 150 + row * 30 + 11, 10, 8); // body
        g.fillStyle(0xf1c27d);
        g.fillCircle(x, 150 + row * 30 + 7, 4);         // head
      }
    }
    // The wall in front of the stands, with an advertising board
    g.fillStyle(0x2d6a3e);
    g.fillRect(0, 330, 800, 30);
    g.fillStyle(0xffffff);
    g.fillRect(0, 330, 800, 3);
    // The grass, in stripes (light and dark): far away (behind the players) and under our feet
    for (let x = 0; x < 800; x += 80) {
      g.fillStyle((x / 80) % 2 === 0 ? 0x5cbf60 : 0x52b356);
      g.fillRect(x, 360, 80, GROUND_Y - 360);
      g.fillStyle((x / 80) % 2 === 0 ? 0x4caf50 : 0x43a047);
      g.fillRect(x, GROUND_Y, 80, 60);
    }
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(398, GROUND_Y, 4, 60);     // the middle of the field
    g.fillEllipse(400, GROUND_Y + 20, 160, 22);
    g.fillStyle(0x4caf50);
    g.fillEllipse(400, GROUND_Y + 20, 150, 16);
    this.add.text(400, 345, 'BLANCO Y NEGRO ⚽ COPA DEL COLOR', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(-9);

    // The two goals: a net (thin lines) behind, and white posts in front
    [0, 800 - GOAL_W].forEach((left) => {
      const net = this.add.graphics().setDepth(-5);
      net.fillStyle(0xffffff, 0.15);
      net.fillRect(left, CROSSBAR_Y, GOAL_W, GROUND_Y - CROSSBAR_Y);
      net.lineStyle(1, 0xffffff, 0.5);
      for (let x = left; x <= left + GOAL_W; x += 10) net.lineBetween(x, CROSSBAR_Y, x, GROUND_Y);
      for (let y = CROSSBAR_Y; y <= GROUND_Y; y += 10) net.lineBetween(left, y, left + GOAL_W, y);
      // The post on the side of the field
      const postX = left === 0 ? GOAL_W - 3 : left;
      this.add.rectangle(postX + 1.5, (CROSSBAR_Y + GROUND_Y) / 2, 6, GROUND_Y - CROSSBAR_Y, 0xffffff).setDepth(5);
    });
  }

  // The floor and the two crossbars: the ball and the players bump into them
  createSolidThings() {
    this.solids = this.physics.add.staticGroup();
    const solid = (x, y, w, h, color) => {
      const r = this.add.rectangle(x + w / 2, y + h / 2, w, h, color, color === undefined ? 0 : 1);
      this.solids.add(r);
      return r;
    };
    solid(0, GROUND_Y, 800, 60);                                 // the grass (drawn in drawField)
    solid(0, CROSSBAR_Y - 8, GOAL_W, 8, 0xffffff).setDepth(5);   // left crossbar
    solid(800 - GOAL_W, CROSSBAR_Y - 8, GOAL_W, 8, 0xffffff).setDepth(5); // right crossbar
  }

  createBall() {
    if (!this.textures.exists('soccer-ball')) {
      const size = BALL_R * 2;
      const g = this.add.graphics();
      g.fillStyle(0x000000);
      g.fillCircle(BALL_R, BALL_R, BALL_R);
      g.fillStyle(0xffffff);
      g.fillCircle(BALL_R, BALL_R, BALL_R - 1.5);
      // The black patches of a soccer ball
      g.fillStyle(0x222222);
      g.fillCircle(BALL_R, BALL_R, 4.5);
      [0, 72, 144, 216, 288].forEach((deg) => {
        const a = Phaser.Math.DegToRad(deg - 90);
        g.fillCircle(BALL_R + Math.cos(a) * 9.5, BALL_R + Math.sin(a) * 9.5, 3);
      });
      g.generateTexture('soccer-ball', size, size);
      g.destroy();
    }
    this.ball = this.physics.add.image(400, 200, 'soccer-ball').setDepth(6);
    this.ball.setCircle(BALL_R);
    this.ball.setBounce(0.72);
    this.ball.setCollideWorldBounds(true);
    this.ball.body.onWorldBounds = true;
    this.ball.setDragX(40);
    this.ball.body.setMaxVelocity(900, 900);
    this.physics.add.collider(this.ball, this.solids, () => {
      // Rolling on the floor slows the ball down more than flying in the air
      if (this.ball.body.blocked.down || this.ball.body.touching.down) this.ball.setVelocityX(this.ball.body.velocity.x * 0.97);
    });
  }

  // ---------------------------------------------------------------
  // The players
  // ---------------------------------------------------------------
  createPlayers() {
    const K = Phaser.Input.Keyboard.KeyCodes;
    const keys = (...codes) => codes.map((c) => this.input.keyboard.addKey(c));
    const two = this.how === 'dos';

    // Player 1: our skin. Alone (against the machine) we use the normal keys.
    // Player 2: the normal hero (a bit orange if player 1 is the normal hero too),
    // or the robot of the machine.
    const hero1 = new Hero(this, 220, 480, two ? 'wasd' : 'normal');
    const hero2 = new Hero(this, 580, 480, 'arrows', { skin: two ? null : 'robot' });
    if (two && !this.registry.get('skin')) {
      hero2.baseTint = 0xffcc99;
      hero2.setTint(hero2.baseTint);
    }

    this.players = [
      { team: 0, hero: hero1, kickKeys: two ? keys(K.S) : keys(K.Z, K.X), name: 'JUGADOR 1' },
      { team: 1, hero: hero2, kickKeys: two ? keys(K.DOWN) : [], name: two ? 'JUGADOR 2' : 'LA MÁQUINA' },
    ];
    // With teams, everybody is called like their team
    if (this.teams) this.players.forEach((p, i) => { p.name = this.teams[i].name; });
    this.players.forEach((p) => {
      // Big players, like in Head Soccer (the physics body grows with them)
      p.hero.setScale(PLAYER_SCALE);
      p.hero.keys.shoot = []; // no shooting here: the kick key kicks the ball
      p.hero.keys.run = [];   // and nobody runs, so it is fair
      p.hero.hasColorGun = false;
      p.lastHead = 0;
      p.frozen = false;
      this.physics.add.collider(p.hero, this.solids);
      this.physics.add.overlap(this.ball, p.hero, () => this.ballTouchesPlayer(p));
    });
    // The two players bump into each other
    this.physics.add.collider(hero1, hero2);

    // The machine presses PRETEND keys (see SoccerBot in Bot.js)
    if (this.how === 'maquina') {
      const robot = this.players[1];
      robot.bot = new SoccerBot(this.level);
      const fake = () => ({ isDown: false, _justDown: false });
      robot.fakeKeys = { left: fake(), right: fake(), jump: fake() };
      Object.assign(robot.hero.keys, {
        left: [robot.fakeKeys.left], right: [robot.fakeKeys.right], jump: [robot.fakeKeys.jump],
      });
    }

    // A "1" and a "2" (or TÚ and 🤖) over their heads
    const labels = two ? ['1', '2'] : ['TÚ', '🤖'];
    this.tags = this.players.map((p, i) => this.add.text(0, 0, labels[i], {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: TEAM_COLORS[i],
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(50));
  }

  // Player 1 shoots to the right (+1), player 2 to the left (-1)
  attackDir(team) {
    return team === 0 ? 1 : -1;
  }

  // The ball bumps into a player: it bounces off their head or body
  ballTouchesPlayer(p) {
    if (this.phase === 'cuenta' || this.phase === 'fin' || p.frozen) return;
    const now = this.time.now;
    if (now - p.lastHead < 120) return; // (once is enough, not every frame)
    p.lastHead = now;
    this.touched(p);

    const hero = p.hero;
    const ball = this.ball;
    // Push the ball away from the middle of the player
    const away = new Phaser.Math.Vector2(ball.x - hero.x, ball.y - hero.y).normalize();
    const speed = Math.max(240, ball.body.velocity.length() * 0.7);
    let vx = away.x * speed + hero.body.velocity.x * 0.7;
    let vy = away.y * speed + hero.body.velocity.y * 0.5;
    // A HEADER: the ball goes up a little more
    if (ball.y < hero.y - 12) vy -= 90;
    ball.setVelocity(vx, vy);
    // Take the ball out of the player, so it doesn't get stuck inside
    ball.setPosition(hero.x + away.x * 30, Math.min(GROUND_Y - BALL_R, hero.y + away.y * 34));
  }

  // KICK! Only if the ball is close. On the floor = a high shot, in the air = a low one
  tryKick(p, vy = null) {
    const hero = p.hero;
    const dir = this.attackDir(p.team);
    // A little kick movement, even if we miss the ball
    this.tweens.add({ targets: hero, angle: -dir * 20, duration: 80, yoyo: true, onComplete: () => hero.setAngle(0) });
    if (Phaser.Math.Distance.Between(hero.x, hero.y, this.ball.x, this.ball.y) > KICK_DISTANCE) return;
    const onGround = hero.body.blocked.down || hero.body.touching.down;
    this.ball.setVelocity(dir * KICK_SPEED, vy !== null ? vy : (onGround ? -320 : 60));
    this.sfx('pisar');
    // 🔥 With the fire power, this kick is a FIRE BALL: much faster!
    if (p.fireReady) {
      p.fireReady = false;
      this.ball.setVelocity(this.ball.body.velocity.x * 1.6, this.ball.body.velocity.y * 0.6);
      this.fireTime = 2;
      this.ball.setTint(0xff7722);
      this.sfx('golpe');
    }
    this.touched(p);
  }

  // Remember who touched the ball last (in the penalties, the kicker can only kick once)
  touched(p) {
    this.lastToucher = p;
    if (this.phase === 'penales' && this.pen && p === this.pen.kicker && !this.pen.kicked) {
      this.pen.kicked = true;
      this.pen.timer = 2.5; // the ball has 2.5 seconds to go in
      p.frozen = true;
    }
    if (this.phase === 'penales' && this.pen && p === this.pen.keeper && this.pen.kicked) this.pen.saved = true;
  }

  // Everybody back to their place, and the ball falls in the middle
  kickOff() {
    this.players[0].hero.setPosition(220, 480).setVelocity(0, 0);
    this.players[1].hero.setPosition(580, 480).setVelocity(0, 0);
    this.ball.setPosition(400, 160).setVelocity(0, 0);
  }

  // ---------------------------------------------------------------
  // Every frame
  // ---------------------------------------------------------------
  update(time, delta) {
    const dt = delta / 1000;
    this.ball.angle += this.ball.body.velocity.x * dt * 2; // the ball rolls
    this.tags.forEach((tag, i) => tag.setPosition(this.players[i].hero.x, this.players[i].hero.y - 58));
    if (this.phase === 'fin' || this.phase === 'cuenta') {
      this.players.forEach((p) => p.hero.setVelocityX(0));
      return;
    }

    this.players.forEach((p) => this.movePlayer(p, dt));
    this.unstickBall();

    this.updateFire(dt);
    if (this.phase === 'juego') {
      this.updatePowers(dt);
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.timeUp();
      }
      this.checkGoal();
    } else if (this.phase === 'penales') {
      this.updatePenalty(dt);
    }
    this.updateScoreboard();
  }

  movePlayer(p, dt) {
    const hero = p.hero;
    if (p.frozen) {
      hero.setVelocityX(0);
      return;
    }
    if (p.bot) {
      // The machine looks at the ball and "presses" its pretend keys
      const press = p.bot.think(dt, {
        me: { x: hero.x, y: hero.y },
        ball: { x: this.ball.x, y: this.ball.y },
        ballVX: this.ball.body.velocity.x,
        ballVY: this.ball.body.velocity.y,
        onGround: hero.body.blocked.down || hero.body.touching.down,
        keeper: this.phase === 'penales' && this.pen && this.pen.keeper === p,
        minX: p.minX, maxX: p.maxX,
      });
      p.fakeKeys.left.isDown = press.left;
      p.fakeKeys.right.isDown = press.right;
      if (press.jump) p.fakeKeys.jump._justDown = true;
      hero.update();
      hero.setVelocityX(hero.body.velocity.x * p.bot.speed); // a slower robot in FÁCIL
      if (press.kick) this.tryKick(p, this.isKicker(p) ? p.bot.penaltyShot() : null);
    } else {
      hero.update();
      if (p.kickKeys.some((k) => Phaser.Input.Keyboard.JustDown(k))) this.tryKick(p);
    }
    // In the penalties the goalkeeper must stay in the goal
    if (p.minX !== undefined) hero.x = Phaser.Math.Clamp(hero.x, p.minX, p.maxX);
  }

  isKicker(p) {
    return this.phase === 'penales' && this.pen && this.pen.kicker === p;
  }

  // A ball resting on top of a crossbar would stay there forever: we push it down
  unstickBall() {
    const ball = this.ball;
    const onBar = ball.y < CROSSBAR_Y && (ball.x < GOAL_W || ball.x > 800 - GOAL_W);
    if (onBar && Math.abs(ball.body.velocity.x) < 30 && ball.body.touching.down) {
      ball.setVelocityX(ball.x < 400 ? 160 : -160);
    }
  }

  // Did the ball go INTO a goal? (all of it, under the crossbar)
  whichGoal() {
    if (this.ball.y < CROSSBAR_Y) return null;
    if (this.ball.x < GOAL_W - BALL_R) return 0;       // the goal of player 1 (left)
    if (this.ball.x > 800 - GOAL_W + BALL_R) return 1; // the goal of player 2 (right)
    return null;
  }

  checkGoal() {
    const goal = this.whichGoal();
    if (goal === null) return;
    const scorer = 1 - goal; // a ball in MY goal is a point for the other one
    this.score[scorer] += 1;
    this.phase = 'gol';
    this.sfx('ganar');
    this.bigText('¡GOOOL!', TEAM_COLORS[scorer]);
    this.confetti(goal === 0 ? 60 : 740);
    this.time.delayedCall(1800, () => {
      if (this.phase !== 'gol') return;
      this.kickOff();
      this.phase = 'juego';
    });
  }

  timeUp() {
    // In the TEMPORADA (and the groups of the MUNDIAL) a tie is just a tie
    if (this.score[0] === this.score[1] && this.context && this.context.draws) {
      this.finish(null, `Empate ${this.score[0]} a ${this.score[1]}`);
      return;
    }
    if (this.score[0] !== this.score[1]) {
      const winner = this.score[0] > this.score[1] ? 0 : 1;
      this.finish(winner, `${this.score[0]} a ${this.score[1]}`);
      return;
    }
    // A TIE: penalties!
    this.phase = 'gol'; // (a pause, while the message shows)
    this.sfx('oleada');
    this.bigText('¡EMPATE!\n¡A PENALES!', '#ffffff');
    this.time.delayedCall(2200, () => this.startPenalties());
  }

  // ---------------------------------------------------------------
  // Powers: a box falls from the sky, and the first one to touch it gets a power
  // ---------------------------------------------------------------
  updatePowers(dt) {
    if (this.powerup) return; // one box at a time
    this.nextPower -= dt;
    if (this.nextPower > 0) return;
    this.nextPower = POWER_EVERY;

    const power = Phaser.Utils.Array.GetRandom(POWERS);
    const box = this.add.text(Phaser.Math.Between(180, 620), -30, power.icon, { fontSize: '34px' })
      .setOrigin(0.5).setDepth(7);
    this.physics.add.existing(box);
    box.body.setBounce(0.4).setCollideWorldBounds(true);
    box.power = power;
    this.physics.add.collider(box, this.solids);
    this.players.forEach((p) => this.physics.add.overlap(box, p.hero, () => this.grabPower(p)));
    // It shines, so everybody sees it
    this.tweens.add({ targets: box, scale: 1.25, duration: 300, yoyo: true, repeat: -1 });
    this.powerup = box;
  }

  grabPower(p) {
    const box = this.powerup;
    if (!box || this.phase !== 'juego') return;
    this.powerup = null;
    box.destroy();
    this.sfx('powerup');
    this.bigText(box.power.name, TEAM_COLORS[p.team], 900);

    if (box.power.id === 'gigante') {
      // A GIANT for a few seconds (if we were already giant, the time starts again)
      if (p.giantTimer) p.giantTimer.remove();
      this.tweens.add({ targets: p.hero, scale: GIANT_SCALE, duration: 300 });
      p.giantTimer = this.time.delayedCall(GIANT_SECONDS * 1000, () => {
        p.giantTimer = null;
        this.tweens.add({ targets: p.hero, scale: PLAYER_SCALE, duration: 300 });
      });
    } else if (box.power.id === 'fuego') {
      p.fireReady = true; // the NEXT kick (see tryKick)
    } else {
      this.freezeGoal(p.team);
    }
  }

  // 🧊 A wall of ice in front of OUR goal: the ball bounces off it
  freezeGoal(team) {
    if (this.ice[team]) this.ice[team].destroy();
    const x = team === 0 ? GOAL_W + 8 : 800 - GOAL_W - 8;
    const wall = this.add.rectangle(x, (CROSSBAR_Y + GROUND_Y) / 2, 16, GROUND_Y - CROSSBAR_Y, 0x99ddff, 0.75)
      .setStrokeStyle(2, 0xffffff).setDepth(6);
    this.physics.add.existing(wall, true);
    this.physics.add.collider(this.ball, wall);
    this.ice[team] = wall;
    this.time.delayedCall(ICE_SECONDS * 1000, () => {
      if (this.ice[team] !== wall) return; // a newer wall took its place
      this.ice[team] = null;
      this.tweens.add({ targets: wall, alpha: 0, duration: 300, onComplete: () => wall.destroy() });
    });
  }

  // 🔥 The fire ball leaves a trail of little flames, and then cools down
  updateFire(dt) {
    if (this.fireTime <= 0) return;
    this.fireTime -= dt;
    const flame = this.add.circle(this.ball.x, this.ball.y, Phaser.Math.Between(5, 10),
      Phaser.Utils.Array.GetRandom([0xff3300, 0xff9900, 0xffdd00])).setDepth(5);
    this.tweens.add({ targets: flame, scale: 0, alpha: 0, y: flame.y - 15, duration: 350, onComplete: () => flame.destroy() });
    if (this.fireTime <= 0) this.ball.clearTint();
  }

  // Take every power away (before the penalties)
  clearPowers() {
    if (this.powerup) this.powerup.destroy();
    this.powerup = null;
    this.ice.forEach((wall) => wall && wall.destroy());
    this.ice = [null, null];
    this.fireTime = 0;
    this.ball.clearTint();
    this.players.forEach((p) => {
      p.fireReady = false;
      if (p.giantTimer) p.giantTimer.remove();
      p.giantTimer = null;
      p.hero.setScale(PLAYER_SCALE);
    });
  }

  // ---------------------------------------------------------------
  // PENALES: one kicks, the other is the goalkeeper. 5 shots each.
  // ---------------------------------------------------------------
  startPenalties() {
    this.phase = 'penales';
    this.clearPowers(); // no powers in the penalties
    this.shots = [[], []]; // true = goal, false = missed, for each player
    this.nextPenalty();
  }

  nextPenalty() {
    // Player 1 kicks first, then player 2, and so on
    const kickerTeam = this.shots[0].length > this.shots[1].length ? 1 : 0;
    const kicker = this.players[kickerTeam];
    const keeper = this.players[1 - kickerTeam];
    const dir = this.attackDir(kickerTeam);
    this.pen = { kicker, keeper, kicked: false, saved: false, timer: 6, done: false };

    // The ball on the penalty spot, the kicker behind it, the keeper in the goal
    const spot = 400 + dir * 150;
    this.ball.setPosition(spot, GROUND_Y - BALL_R).setVelocity(0, 0).setAngle(0);
    kicker.hero.setPosition(spot - dir * 80, 480).setVelocity(0, 0);
    kicker.frozen = false;
    kicker.minX = undefined;
    keeper.frozen = false;
    // The keeper can only move a little, near its goal line
    if (dir > 0) { keeper.minX = 800 - GOAL_W - 40; keeper.maxX = 800 - GOAL_W + 10; } else { keeper.minX = GOAL_W - 10; keeper.maxX = GOAL_W + 40; }
    // (standing ON the goal line: a high shot goes over a keeper who stays on the floor,
    // and a low shot goes under a keeper who jumps. You have to guess!)
    keeper.hero.setPosition(dir > 0 ? 800 - GOAL_W - 10 : GOAL_W + 10, 480).setVelocity(0, 0);
    this.lastToucher = null;
    this.bigText(`PENAL: ${kicker.name === 'LA MÁQUINA' ? '🤖 PATEA' : `PATEA ${kicker.name}`}`, TEAM_COLORS[kickerTeam], 1100);
  }

  updatePenalty(dt) {
    const pen = this.pen;
    if (pen.done) return;
    pen.timer -= dt;
    const goal = this.whichGoal();
    // A goal only counts in the goal of the keeper
    if (goal === pen.keeper.team) return this.penaltyResult(true, '¡GOOOL!');
    if (pen.timer > 0) return;
    if (!pen.kicked) return this.penaltyResult(false, '¡Se acabó el tiempo!');
    this.penaltyResult(false, pen.saved ? '¡ATAJADA!' : '¡AFUERA!');
  }

  penaltyResult(scored, message) {
    const pen = this.pen;
    pen.done = true;
    this.shots[pen.kicker.team].push(scored);
    this.bigText(message, scored ? TEAM_COLORS[pen.kicker.team] : '#ffffff');
    this.sfx(scored ? 'lapizBueno' : 'golpe');
    if (scored) this.confetti(pen.keeper.team === 0 ? 60 : 740);

    // Is it decided? (somebody can't catch up anymore)
    const goals = this.shots.map((s) => s.filter(Boolean).length);
    const taken = this.shots.map((s) => s.length);
    let winner = null;
    if (taken[0] <= PENALTIES && taken[1] <= PENALTIES) {
      const left = taken.map((t) => PENALTIES - t);
      if (goals[0] > goals[1] + left[1]) winner = 0;
      else if (goals[1] > goals[0] + left[0]) winner = 1;
    }
    // After 5 each (or in the extra shots): when both kicked the same number of times
    if (winner === null && taken[0] >= PENALTIES && taken[0] === taken[1] && goals[0] !== goals[1]) {
      winner = goals[0] > goals[1] ? 0 : 1;
    }

    this.time.delayedCall(1800, () => {
      if (winner !== null) this.finish(winner, `Empate ${this.score[0]} a ${this.score[1]}, y ganó en los penales ${goals[winner]} a ${goals[1 - winner]}`);
      else this.nextPenalty();
    });
  }

  // ---------------------------------------------------------------
  // The scoreboard, the clock, and messages
  // ---------------------------------------------------------------
  createScoreboard() {
    this.add.rectangle(400, 30, 300, 48, 0x000000, 0.6).setStrokeStyle(2, 0xffffff).setDepth(90);
    // With teams: their flag (or shield) on each side of the score, and their names under it
    if (this.teams) {
      this.teams.forEach((team, i) => {
        const x = i === 0 ? 290 : 510;
        const badge = this.add.image(x, 30, teamBadge(this, team)).setDepth(91);
        badge.setScale(40 / badge.height);
        this.add.text(i === 0 ? 248 : 552, 66, team.name, {
          fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: TEAM_COLORS[i],
          stroke: '#000000', strokeThickness: 4,
        }).setOrigin(i === 0 ? 0 : 1, 0.5).setDepth(91);
      });
    }
    this.scoreText = this.add.text(400, 22, '', {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(91);
    this.clockText = this.add.text(400, 45, '', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#ffdd33',
    }).setOrigin(0.5).setDepth(91);
    const help = this.how === 'dos'
      ? ['1: A D Mover · W Saltar · S Patear', '2: ← → Mover · ↑ Saltar · ↓ Patear']
      : ['← → Mover · ↑ Saltar · Z Patear', 'En el piso = tiro alto · en el aire = tiro bajo'];
    this.add.text(12, 590, help[0], {
      fontFamily: 'Arial', fontSize: '12px', color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0, 1).setDepth(90);
    this.add.text(788, 590, help[1], {
      fontFamily: 'Arial', fontSize: '12px', color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(1, 1).setDepth(90);
    this.add.text(400, 598, 'ESC: salir', {
      fontFamily: 'Arial', fontSize: '11px', color: '#dddddd',
    }).setOrigin(0.5, 1).setDepth(90);
    this.updateScoreboard();
  }

  updateScoreboard() {
    this.scoreText.setText(this.teams ? `${this.score[0]}  -  ${this.score[1]}` : `🔵 ${this.score[0]}  -  ${this.score[1]} 🟠`);
    if (this.shots) {
      // In the penalties: ● = goal, ✗ = missed, for each player
      const marks = (s) => s.map((goal) => (goal ? '●' : '✗')).join(' ') || '-';
      this.clockText.setText(`PENALES  ${marks(this.shots[0])}  |  ${marks(this.shots[1])}`);
      return;
    }
    const seconds = Math.ceil(this.timeLeft);
    this.clockText.setText(`⏱ ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`);
    // The last 10 seconds, the clock turns red
    this.clockText.setColor(seconds <= 10 ? '#ff5555' : '#ffdd33');
  }

  // A big word in the middle of the screen, that grows and disappears
  bigText(words, color, duration = 1500) {
    const text = this.add.text(400, 200, words, {
      fontFamily: 'Arial', fontSize: '56px', fontStyle: 'bold', color, align: 'center',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(100);
    // A long name must still fit on the screen
    const size = Math.min(1, 760 / text.width);
    text.setScale(size * 0.3);
    this.tweens.add({ targets: text, scale: size, duration: 250, ease: 'Back.easeOut' });
    this.tweens.add({ targets: text, alpha: 0, delay: duration, duration: 400, onComplete: () => text.destroy() });
  }

  // 3... 2... 1... ¡YA!
  countdown(intro, onDone) {
    const goal = this.add.text(400, 150, intro, {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6, align: 'center',
    }).setOrigin(0.5).setDepth(100);
    ['3', '2', '1', '¡YA!'].forEach((word, i) => {
      this.time.delayedCall(600 + i * 800, () => {
        playSound(i === 3 ? 'ya' : 'cuenta');
        const text = this.add.text(400, 300, word, {
          fontFamily: 'Arial', fontSize: '96px', fontStyle: 'bold', color: i === 3 ? '#66ee88' : '#ffffff',
          stroke: '#000000', strokeThickness: 10,
        }).setOrigin(0.5).setDepth(100);
        this.tweens.add({ targets: text, scale: 1.5, alpha: 0, duration: 750, onComplete: () => text.destroy() });
        if (i === 3) {
          this.tweens.add({ targets: goal, alpha: 0, duration: 400 });
          onDone();
        }
      });
    });
  }

  confetti(centerX) {
    const colors = [0xff4444, 0xff9933, 0xffee33, 0x44dd66, 0x3399ff, 0xaa55ff];
    for (let i = 0; i < 40; i++) {
      const piece = this.add.rectangle(centerX - 60 + Math.random() * 120, 300 + Math.random() * 100, 8, 12, colors[i % colors.length]).setDepth(80);
      this.tweens.add({
        targets: piece, y: piece.y - 200 - Math.random() * 150, x: piece.x + (Math.random() - 0.5) * 300,
        angle: 360, alpha: 0, duration: 1200 + Math.random() * 600, onComplete: () => piece.destroy(),
      });
    }
  }

  // ---------------------------------------------------------------
  // The end
  // ---------------------------------------------------------------
  finish(winner, reason) {
    if (this.phase === 'fin') return;
    this.phase = 'fin';
    this.ball.setVelocity(0, 0);
    this.ball.body.setAllowGravity(false);
    const vsMachine = this.how === 'maquina';
    let title = `¡GANÓ EL JUGADOR ${winner + 1}!`;
    if (vsMachine) title = winner === 0 ? '¡GANASTE!' : '¡GANÓ LA MÁQUINA!';
    if (this.teams && winner !== null) title = `¡GANÓ ${this.teams[winner].name.toUpperCase()}!`;
    if (winner === null) title = '¡EMPATE!';

    // A prize for beating the machine, and stars for the PASE
    // (in the TEMPORADA and the MUNDIAL, those scenes give their own prizes)
    let coins = 0;
    if (vsMachine && winner === 0 && !this.context) {
      coins = COIN_PRIZES[this.level] || COIN_PRIZES.normal;
      addCoins(coins);
      earnStars('ganar');
    }
    playSound(vsMachine && winner !== 0 ? 'perder' : 'ganar');
    if (winner !== null) this.confetti(400);

    this.add.rectangle(400, 300, 560, 250, 0x000000, 0.85).setStrokeStyle(4, 0xffffff).setDepth(150);
    const titleText = this.add.text(400, 222, title, {
      fontFamily: 'Arial', fontSize: '44px', fontStyle: 'bold', color: winner === null ? '#ffffff' : TEAM_COLORS[winner],
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(151);
    if (titleText.width > 520) titleText.setScale(520 / titleText.width);
    this.add.text(400, 268, reason, {
      fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setDepth(151);
    if (coins) {
      makeCoinTexture(this);
      this.add.image(352, 302, 'coin').setDepth(151);
      this.add.text(368, 302, `+${coins} monedas`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(0, 0.5).setDepth(151);
    }
    if (this.context) {
      // TEMPORADA or MUNDIAL: back to it, with the result
      // (me = which team we were: we are always team 0, the blue one)
      this.result = { score: [...this.score], winner, shots: this.shots, me: 0, tag: this.context.tag };
      this.resultButton(400, '▶ CONTINUAR [ENTER]', 0x66ee88, () => this.leave());
      return;
    }
    this.resultButton(285, '🔁 REVANCHA [R]', 0x66ee88, () => this.rematch());
    this.resultButton(515, '🏠 SALA [ENTER]', 0xffffff, () => this.leave());
  }

  resultButton(x, label, color, onClick) {
    const box = this.add.container(x, 350, [
      this.add.rectangle(0, 0, 210, 48, 0x222222).setStrokeStyle(3, color),
      this.add.text(0, 0, label, { fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5),
    ]).setSize(210, 48).setInteractive({ useHandCursor: true }).setDepth(152);
    box.on('pointerdown', onClick);
  }

  rematch() {
    if (this.leaving || this.context) return;
    this.leaving = true;
    this.scene.restart(this.startData);
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    // (a match of the TEMPORADA or the MUNDIAL goes back there; ESC in the middle = no result,
    // the match can be played again)
    const back = this.context ? this.context.returnTo : 'TitleScene';
    const data = this.context ? { result: this.phase === 'fin' ? this.result || null : null } : undefined;
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(back, data));
  }

  // A sound
  sfx(name) {
    playSound(name);
  }
}

export default SoccerScene;
