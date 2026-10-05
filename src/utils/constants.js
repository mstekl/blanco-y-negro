// constants.js — All the magic numbers for our game live here!
// Instead of typing "160" everywhere, we give it a name like WALK_SPEED.
// This way, if we want to make the hero faster, we only change it in ONE place.

// Invincible mode is turned on with a secret code typed in the "Hacks de
// mapa" box of the world map. The code is remembered in the registry (the memory
// shared by all scenes) until the page is reloaded.
export function isGodMode(registry) {
  return Boolean(registry && registry.get('godMode'));
}

// The game window size and gravity
export const WORLD = {
  WIDTH: 800,
  HEIGHT: 600,
  GRAVITY: 500,
};

// Everything about our hero
export const HERO = {
  WALK_SPEED: 160,       // How fast the hero walks (pixels per second)
  RUN_SPEED: 280,        // How fast the hero runs (holding Shift)
  JUMP_VELOCITY: -350,   // How high the hero jumps (negative = up!)
  BOUNCE: 0.1,           // A tiny bounce when landing
  INITIAL_LIVES: 3,      // Starting lives
  MAX_LIVES: 5,          // Maximum lives we can have
  INVINCIBLE_DURATION: 1500,  // Milliseconds of invincibility after getting hit
  SHOOT_COOLDOWN: 400,        // Milliseconds between shots
};

// Projectile speeds (for later sessions)
export const PROJECTILE = {
  HERO_SPEED: 400,
  ENEMY_SPEED: 200,
  LIFETIME: 2000,
};

// Enemy stats (for later sessions)
export const ENEMIES = {
  MR1: { speed: 80, health: 1, score: 100 },
  MR2: { speed: 60, health: 2, score: 200, fireRate: 2500 },
  BOSS: { speed: 0, health: 10, score: 1000, fireRate: 1500 },
};

// Colors we use to draw things
export const COLORS = {
  GROUND: 0x4a4a4a,
  GROUND_TOP: 0x6a6a6a,
  PLATFORM: 0x5a5a5a,
  PLATFORM_TOP: 0x7a7a7a,
  HERO_BODY: 0xff4444,
  HERO_HEAD: 0xffcc00,
  ENEMY_MR1: 0x1a1a1a,
};
