// Bot.js — The MÁQUINA: a pretend player that plays against us.
// It does not really play with the keys: it is a "ghost" that moves through
// the level by itself, at a speed that depends on how hard we chose
// (FÁCIL, NORMAL or DIFÍCIL). We see it as a see-through hero in OUR level.
//   - In the CARRERA it walks to the end of each level. If it finishes
//     level 3 before us, it wins!
//   - In the BÚSQUEDA it flies from place to place looking for ITS OWN
//     5 good pencils (its pencils are hidden in other places than ours).
//     Sometimes it makes a mistake and grabs a bad one, and loses a life!

import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { pencilSpots, pencilsToHide } from '../scenes/SearchLevelScene.js';

// How good the machine is in each level
//   speed:    pixels per second (our hero walks at 160)
//   stops:    how many seconds it stands still from time to time (like a slow player)
//   mistakes: in the search, the chance (0 to 1) of grabbing a BAD pencil
//   look:     in the search, how many seconds it looks at each place
const LEVELS = {
  facil: { speed: 80, stops: 2.5, mistakes: 0.5, look: 1.6 },
  normal: { speed: 115, stops: 1, mistakes: 0.25, look: 0.9 },
  dificil: { speed: 145, stops: 0.3, mistakes: 0.05, look: 0.4 },
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

// --- The machine in the BÚSQUEDA ---
export class SearchBot {
  constructor(level, lives) {
    this.cfg = LEVELS[level] || LEVELS.normal;
    this.levelIndex = 0; // the search is always in the map of level 1
    this.lives = lives;
    this.found = 0;
    this.goal = pencilsToHide().filter((p) => p.good).length;
    this.finished = false;
    this.x = levels[0].heroStart.x;
    this.y = GROUND_Y;
    this.wait = 1;

    // The machine's OWN pencils, hidden in its own shuffled places
    const spots = pencilSpots(levels[0]);
    Phaser.Utils.Array.Shuffle(spots);
    const pencils = pencilsToHide();
    this.places = spots.map((spot, i) => ({ ...spot, pencil: pencils[i] || null }));
    this.target = null;
  }

  // Gives back 'won' (found the 5) or 'out' (lost its lives)
  update(seconds) {
    if (this.finished) return null;
    if (this.wait > 0) {
      this.wait -= seconds;
      if (this.wait <= 0 && this.target) return this.look();
      return null;
    }

    // Go to the closest place we haven't looked at yet
    if (!this.target) {
      if (this.places.length === 0) return null; // nowhere left to look
      this.target = this.places.reduce((best, place) => {
        const dist = Math.abs(place.x - this.x) + Math.abs(place.y - this.y);
        return !best || dist < best.dist ? { place, dist } : best;
      }, null).place;
    }

    // Fly towards it (it's a ghost: it can float up to the platforms)
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.cfg.speed * seconds;
    if (dist <= step) {
      this.x = this.target.x;
      this.y = this.target.y;
      this.wait = this.cfg.look; // look around a little before grabbing
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }
    return null;
  }

  // We got to a place and looked: is there a pencil?
  look() {
    const place = this.target;
    this.places = this.places.filter((p) => p !== place);
    this.target = null;
    const pencil = place.pencil;
    if (!pencil) return null;

    if (pencil.good) {
      this.found += 1;
      if (this.found >= this.goal) {
        this.finished = true;
        return 'won';
      }
    } else if (Math.random() < this.cfg.mistakes) {
      // Oops! It grabbed a bad one
      this.lives -= 1;
      if (this.lives <= 0) {
        this.finished = true;
        return 'out';
      }
    }
    return null;
  }

  progress() {
    return this.found / this.goal;
  }

  label() {
    return `${this.found}/${this.goal}  ${'❤'.repeat(Math.max(0, this.lives))}`;
  }
}

// Is there ground under this x? (pits have no ground)
function groundUnder(level, x) {
  return level.platforms.some((p) => p.type === 'ground' && x >= p.x - 10 && x <= p.x + p.width + 10);
}
