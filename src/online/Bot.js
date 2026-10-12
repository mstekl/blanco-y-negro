// Bot.js — The MÁQUINA: a pretend player that plays against us.
// It does not really play with the keys: it is a "ghost" that moves through
// the level by itself, at a speed that depends on how hard we chose
// (FÁCIL, NORMAL or DIFÍCIL). We see it as a see-through hero in OUR level.
//   - In the CARRERA it walks to the end of each level. If it finishes
//     level 3 before us, it wins!
//   - In the BÚSQUEDA it flies from place to place looking for ITS OWN
//     5 good pencils (its pencils are hidden in other places than ours).
//     Sometimes it makes a mistake and grabs a bad one, and loses a life!
//   - In LAVA QUE SUBE it climbs the tower from platform to platform,
//     with its own lava rising under it.
//   - In CAPTURA LA BANDERA it flies to steal our flag, and chases us
//     when we steal its flag.
//   - In ESCONDIDAS it looks inside the hiding places, one by one.

import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { pencilSpots, pencilsToHide } from '../scenes/SearchLevelScene.js';
import { lavaSpeed, LAVA_START_Y, PIXELS_PER_METER } from '../scenes/LavaLevelScene.js';
import { BASE_X as CAPTURE_BASE_X } from '../scenes/CaptureScene.js';

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

// --- The machine in LAVA QUE SUBE ---
// It climbs the SAME tower as us, from platform to platform, and it has its
// own lava rising under it (at the same speed as ours). If the lava touches it,
// it loses a life and jumps out onto a higher platform, like us.
// climb = pixels per second along the way up, for each level
const CLIMB = { facil: 75, normal: 110, dificil: 145 };

export class LavaBot {
  constructor(level, lives, tower) {
    this.cfg = LEVELS[level] || LEVELS.normal;
    this.speed = CLIMB[level] || CLIMB.normal;
    this.levelIndex = 0; // the tower is "level 0" (the ghost looks at this)
    this.lives = lives;
    this.tower = tower;
    // The way up: the top of every platform, in order (without the ground)
    this.steps = tower.platforms.slice(1).map((p) => ({ x: p.x + p.width / 2, y: p.y - 24 }));
    this.next = 0;
    this.x = tower.heroStart.x;
    this.y = GROUND_Y;
    this.startY = this.y;
    this.lavaY = LAVA_START_Y;
    this.lavaTime = 0;
    this.wait = 0;
    this.nextStop = 4;
    this.finished = false;
  }

  // Gives back 'won' (got to the top) or 'out' (lost its lives)
  update(seconds) {
    if (this.finished) return null;

    // Its lava rises like ours
    this.lavaTime += seconds;
    this.lavaY -= lavaSpeed(this.lavaTime) * seconds;
    if (this.y + 24 > this.lavaY + 8) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.finished = true;
        return 'out';
      }
      // Out of the lava, onto the first safe platform
      const safe = this.steps.findIndex((s) => s.y < this.lavaY - 120);
      if (safe >= 0) {
        this.next = safe;
        this.x = this.steps[safe].x;
        this.y = this.steps[safe].y;
      }
      this.lavaY += 60;
    }

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

    // Float towards the next platform (it's a ghost: it can fly a little)
    const target = this.steps[this.next];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * seconds;
    if (dist <= step) {
      this.x = target.x;
      this.y = target.y;
      this.next += 1;
      if (this.next >= this.steps.length) {
        this.finished = true;
        return 'won';
      }
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }
    return null;
  }

  progress() {
    const top = this.tower.goal.y;
    return Phaser.Math.Clamp((this.startY - this.y) / (this.startY - top), 0, 1);
  }

  label() {
    const meters = Math.max(0, Math.round((568 - (this.y + 24)) / PIXELS_PER_METER));
    return `${meters} m  ${'❤'.repeat(Math.max(0, this.lives))}`;
  }
}

// --- The machine in CAPTURA LA BANDERA ---
// It is the ORANGE team (base on the right). The arena (CaptureScene.js) tells
// it what is going on every moment (think), and it decides where to fly:
//   - carrying our flag      → home to its base, to score a point
//   - we carry ITS flag      → it chases us, to touch us and get its flag back
//   - otherwise              → it goes to steal our flag
// The arena does the grabbing, the touching and the points, like for a hero.
const FLY = { facil: 85, normal: 120, dificil: 150 }; // our hero walks at 160

export class CaptureBot {
  constructor(level, pointsToWin) {
    this.cfg = LEVELS[level] || LEVELS.normal;
    this.speed = FLY[level] || FLY.normal;
    this.goal = pointsToWin;
    this.levelIndex = 0; // the arena is "level 0" (the ghost looks at this)
    this.home = { x: CAPTURE_BASE_X[1], y: GROUND_Y };
    this.x = this.home.x;
    this.y = this.home.y;
    this.score = 0;      // the arena counts the points and writes them here
    this.target = null;
    this.wait = 0;
    this.nextStop = 4;
    this.finished = false;
  }

  // The arena tells us what is going on, and we choose where to go
  think(view) {
    if (view.botCarrying) this.target = this.home;
    else if (view.heroCarrying) this.target = { x: view.heroX, y: view.heroY };
    else this.target = { x: view.flagX, y: view.flagY };
  }

  // We were touched while carrying the flag: back to our base, and a little wait
  sendHome() {
    this.x = this.home.x;
    this.y = this.home.y;
    this.wait = 1.5;
  }

  // Gives back 'won' when we have all the points
  update(seconds) {
    if (this.finished) return null;
    if (this.score >= this.goal) {
      this.finished = true;
      return 'won';
    }
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
    if (!this.target) return null;

    // Fly towards the target (it's a ghost: it can float over everything)
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * seconds;
    if (dist <= step) {
      this.x = this.target.x;
      this.y = this.target.y;
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }
    return null;
  }

  progress() {
    return this.score / this.goal;
  }

  label() {
    return `🚩 ${this.score}/${this.goal}`;
  }
}

// --- The machine in ESCONDIDAS, when it SEEKS ---
// It flies from hiding place to hiding place (the closest ones first, with a bit
// of luck) and looks inside each one. When it FLEW past us without seeing us
// (a "miss"), it comes back later. If we didn't hide, it sees us from far away!
//   speed: pixels per second · look: seconds looking inside · miss: the chance of not seeing us
const SEEK = {
  facil: { speed: 110, look: 1.2, miss: 0.4 },
  normal: { speed: 150, look: 0.8, miss: 0.15 },
  dificil: { speed: 190, look: 0.5, miss: 0 },
};

export class HideBot {
  constructor(level, places, start) {
    this.cfg = SEEK[level] || SEEK.normal;
    this.x = start.x;
    this.y = start.y;
    this.toVisit = [...places];
    this.later = []; // places where it didn't see us (it comes back at the end)
    this.target = null;
    this.wait = 0;
  }

  // "hidingPlace" = where the hider is (null if they didn't hide), "hiderHero" = the hider.
  // Gives back { looked: place } after looking inside a place, { found: true }, or null
  update(seconds, hidingPlace, hiderHero) {
    if (this.wait > 0) {
      this.wait -= seconds;
      if (this.wait <= 0 && this.target) return this.look(hidingPlace);
      return null;
    }
    // The hider is standing outside: the machine sees them and goes straight there!
    if (!hidingPlace && hiderHero && Math.abs(hiderHero.x - this.x) < 350) {
      this.target = { x: hiderHero.x, y: hiderHero.y, isHero: true };
    }
    if (!this.target) this.target = this.choosePlace(hidingPlace);
    if (!this.target) return null;

    // Fly towards it (it's a ghost: it can float over the pits)
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.cfg.speed * seconds;
    if (dist > step) {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
      return null;
    }
    this.x = this.target.x;
    this.y = this.target.y;
    if (this.target.isHero) return { found: true };
    this.wait = this.cfg.look; // look inside for a moment
    return null;
  }

  // One of the 2 closest places we haven't looked into yet
  choosePlace(hidingPlace) {
    if (this.toVisit.length === 0) {
      // We looked everywhere: back to the place where we didn't see them,
      // and this time we look better
      this.toVisit = this.later;
      this.later = [];
      this.cfg = { ...this.cfg, miss: 0 };
      if (this.toVisit.length === 0) return null;
    }
    const byDistance = [...this.toVisit].sort((a, b) => Math.abs(a.x - this.x) - Math.abs(b.x - this.x));
    return Phaser.Utils.Array.GetRandom(byDistance.slice(0, 2));
  }

  look(hidingPlace) {
    const place = this.target;
    this.target = null;
    this.toVisit = this.toVisit.filter((p) => p !== place);
    if (place === hidingPlace) {
      if (Math.random() >= this.cfg.miss) return { found: true };
      // It didn't see us! It will come back when it has looked everywhere else
      this.later.push(place);
    }
    return { looked: place };
  }
}

// Is there ground under this x? (pits have no ground)
function groundUnder(level, x) {
  return level.platforms.some((p) => p.type === 'ground' && x >= p.x - 10 && x <= p.x + p.width + 10);
}
