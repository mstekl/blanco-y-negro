// Bot.js — The MÁQUINA: a pretend player that plays against us.
//   - In the CARRERA it does not really play with the keys: it is a "ghost" that
//     moves through the level by itself, at a speed that depends on how hard we chose
//     (FÁCIL, NORMAL or DIFÍCIL). We see it as a see-through hero in OUR level.
//     It walks to the end of each level. If it finishes level 3 before us, it wins!
//   - In the FÚTBOL it is a robot on the field that "presses keys" (SoccerBot, below).

import Phaser from 'phaser';
import { levels } from '../data/levels.js';

// How good the machine is in each level
//   speed:    pixels per second (our hero walks at 160)
//   stops:    how many seconds it stands still from time to time (like a slow player)
const LEVELS = {
  facil: { speed: 80, stops: 2.5 },
  normal: { speed: 115, stops: 1 },
  dificil: { speed: 145, stops: 0.3 },
};

// Where the ghost stands on the ground (the ground top is at y = 568)
const GROUND_Y = 568 - 24;

// --- The machine in the CARRERA ---
export class RaceBot {
  constructor(level, levelsToWin) {
    this.cfg = LEVELS[level] || LEVELS.normal;
    this.levelsToWin = levelsToWin;
    this.levelIndex = 0;
    this.x = levels[0].heroStart.x;
    this.y = GROUND_Y;
    this.wait = 0;       // seconds left standing still
    this.nextStop = 4;   // seconds until the next stop
    this.finished = false;
  }

  // Called 60 times per second. Gives back 'won' when the machine wins.
  update(seconds) {
    if (this.finished) return null;
    if (this.wait > 0) {
      this.wait -= seconds;
      return null;
    }

    // From time to time it stops a little (it "makes mistakes", like us)
    this.nextStop -= seconds;
    if (this.nextStop <= 0) {
      this.wait = this.cfg.stops * (0.5 + Math.random());
      this.nextStop = 3 + Math.random() * 5;
    }

    const level = levels[this.levelIndex];
    this.x += this.cfg.speed * seconds;
    // Over a pit there is no ground: the ghost jumps over it
    this.y = groundUnder(level, this.x) ? GROUND_Y : GROUND_Y - 70;

    if (this.x >= level.goal.x) {
      // Level done! Like us, it takes a moment before the next one
      this.levelIndex += 1;
      if (this.levelIndex >= this.levelsToWin) {
        this.finished = true;
        return 'won';
      }
      this.x = levels[this.levelIndex].heroStart.x;
      this.wait = 1.8;
    }
    return null;
  }

  // How far it is, from 0 (start) to 1 (got to level 4)
  progress() {
    const level = levels[Math.min(this.levelIndex, levels.length - 1)];
    const inLevel = this.finished ? 0 : Math.min(1, this.x / level.goal.x);
    return Math.min(1, (this.levelIndex + inLevel) / this.levelsToWin);
  }

  // The words next to its bar
  label() {
    return `Nivel ${Math.min(this.levelIndex + 1, this.levelsToWin)}`;
  }
}

// Is there ground under this x? (pits have no ground)
function groundUnder(level, x) {
  return level.platforms.some((p) => p.type === 'ground' && x >= p.x - 10 && x <= p.x + p.width + 10);
}

// --- The machine in the FÚTBOL ---
// Here the machine is NOT a ghost: it is a real player on the field (a robot), with
// the same body and jumps as ours. So instead of moving by itself, it "presses keys":
// every frame it looks at the ball and says which keys it would press. SoccerScene.js
// gives those pretend keys to its hero.
//   speed:  how fast it walks, compared with us (1 = as fast as our hero)
//   think:  seconds between two decisions (a slow player looks less often)
//   aim:    the chance (0 to 1) of kicking when the ball is close
//   jumpy:  the chance of jumping for a high ball
//   dive:   as GOALKEEPER in the penalties, how well it guesses where the ball goes
const SOCCER = {
  facil: { speed: 0.6, think: 0.3, aim: 0.35, jumpy: 0.3, dive: 0.35 },
  facilPlus: { speed: 0.7, think: 0.22, aim: 0.5, jumpy: 0.45, dive: 0.45 }, // (División 4 of the TEMPORADA)
  normal: { speed: 0.82, think: 0.15, aim: 0.7, jumpy: 0.6, dive: 0.6 },
  normalPlus: { speed: 0.9, think: 0.1, aim: 0.85, jumpy: 0.75, dive: 0.72 }, // (División 2)
  dificil: { speed: 1, think: 0.05, aim: 1, jumpy: 0.9, dive: 0.85 },
};

export class SoccerBot {
  constructor(level) {
    this.cfg = SOCCER[level] || SOCCER.normal;
    this.speed = this.cfg.speed;
    this.timer = 0;
    // What it is pressing now (it only changes its mind every "think" seconds)
    this.press = { left: false, right: false, jump: false, kick: false };
  }

  // The robot defends the goal on the RIGHT and attacks the one on the LEFT.
  // s = what it sees: { me, ball, ballVX, ballVY, onGround, keeper, minX, maxX }
  // Gives back the keys to press this frame.
  think(dt, s) {
    this.timer -= dt;
    // A jump or a kick is a single press: it doesn't stay pressed
    this.press.jump = false;
    this.press.kick = false;
    if (this.timer > 0) return this.press;
    this.timer = this.cfg.think;

    const dx = s.ball.x - s.me.x;
    let target;
    if (s.keeper) {
      // GOALKEEPER (penalties): stay in the goal, and guess the height of the shot
      target = Phaser.Math.Clamp(s.ball.x, s.minX, s.maxX);
      const coming = s.ballVX > 100 && dx > -260;
      if (coming && s.ballVY < 0 && Math.random() < this.cfg.dive) this.press.jump = true;
    } else if (dx > -10) {
      // The ball is between us and OUR goal: run back, to get behind it.
      // If it is right in front of us, we JUMP over it (pushing it would be an own goal!)
      target = s.ball.x + 34;
      if (dx < 70 && s.onGround && Math.random() < this.cfg.jumpy) this.press.jump = true;
    } else {
      // The ball is in front of us: go and push it to the left (to THEIR goal)
      target = s.ball.x + 16;
    }
    this.press.left = target < s.me.x - 8;
    this.press.right = target > s.me.x + 8;

    // A high ball close to us: jump and head it!
    const high = s.ball.y < s.me.y - 30;
    if (!s.keeper && high && Math.abs(dx) < 80 && s.onGround && Math.random() < this.cfg.jumpy) this.press.jump = true;
    // The ball is close and on our left: KICK!
    const close = Math.abs(dx) < 50 && Math.abs(s.ball.y - s.me.y) < 50;
    if (!s.keeper && close && dx < 0 && Math.random() < this.cfg.aim) this.press.kick = true;
    return this.press;
  }

  // Penalties: when the robot kicks, how high does the ball go?
  // (vy: negative = up). A harder robot aims better at the corners
  penaltyShot() {
    const shots = [-330, -260, -190, 60]; // high, middle, low, along the floor
    return shots[Math.floor(Math.random() * shots.length)];
  }
}
