// customLevels.js — The levels WE draw in the EDITOR DE NIVELES!
// There are 5 places ("slots") to keep them. They are saved in the browser
// (localStorage), so they are still there tomorrow, but only on THIS device.
//
// We save the level in an easy "editor" shape:
//   {
//     name: 'Mi nivel 1',
//     ground: [true, true, false, ...],   // one box per column of 64px: is there ground?
//     platforms: [{ x, y }],              // floating platforms (always 128 wide), x = left edge, y = top
//     enemies: [{ type: 'mr1', x, y }],   // villains (where they stand)
//     powerups: [{ type: 'shield', x, y }],
//     goal: { x, y },                     // the flag
//     heroStart: { x, y },                // where the hero is born
//   }
// and toLevelData() turns it into the shape the game uses (like levels.js),
// so the normal LevelScene can build and play it.

import { levels } from './levels.js';

const LEVELS_KEY = 'blancoYNegro.niveles';

export const MAX_SLOTS = 5;
export const LEVEL_WIDTH = 2400;   // all our levels have the same length (3 screens)
export const TILE = 64;            // the ground is made of 64px blocks
export const COLUMNS = Math.ceil(LEVEL_WIDTH / TILE); // 38 columns of ground
export const GROUND_Y = 568;       // the top of the ground (like in levels.js)
export const PLATFORM_WIDTH = 128; // a floating platform = 2 tiles
export const NAME_MAX = 16;

// How tall each villain is, so we can stand it ON the floor (not inside it)
export const ENEMY_HEIGHT = { mr1: 48, mr2: 54, mr3: 64 };

// A brand new level: ground everywhere, the hero at the start, the flag at the end
export function newLevel(slot) {
  return {
    name: `Mi nivel ${slot + 1}`,
    ground: new Array(COLUMNS).fill(true),
    platforms: [],
    enemies: [],
    powerups: [],
    goal: { x: 2300, y: GROUND_Y - 36 },
    heroStart: { x: 80, y: GROUND_Y - 24 },
  };
}

// All 5 slots: a level, or null when the slot is empty
export function loadAllLevels() {
  const slots = new Array(MAX_SLOTS).fill(null);
  try {
    const saved = JSON.parse(window.localStorage.getItem(LEVELS_KEY));
    if (Array.isArray(saved)) {
      for (let i = 0; i < MAX_SLOTS; i++) {
        // Only keep things that look like a real level (a broken one = empty slot)
        if (saved[i] && Array.isArray(saved[i].ground)) slots[i] = saved[i];
      }
    }
  } catch (e) {
    // Storage blocked or broken: all slots look empty
  }
  return slots;
}

// One level, or null if that slot is empty
export function loadLevel(slot) {
  return loadAllLevels()[slot] || null;
}

// Keep a level in its slot (the other 4 slots stay the same)
export function saveLevel(slot, level) {
  const slots = loadAllLevels();
  slots[slot] = level;
  return writeAll(slots);
}

// Empty a slot
export function deleteLevel(slot) {
  const slots = loadAllLevels();
  slots[slot] = null;
  return writeAll(slots);
}

// Gives back true if it was saved, false if the browser didn't let us
function writeAll(slots) {
  try {
    window.localStorage.setItem(LEVELS_KEY, JSON.stringify(slots));
    return true;
  } catch (e) {
    // Storage blocked: the level only lasts until the page is reloaded
    return false;
  }
}

// What is the first floor under the point (x, y)? Gives back the y of its top,
// or null if there is nothing (a pit!). Floating platforms count too.
export function surfaceBelow(level, x, y) {
  let best = null;
  for (const p of level.platforms) {
    // (a little bit of room, so touching the platform itself counts as "on it")
    if (x >= p.x && x < p.x + PLATFORM_WIDTH && p.y >= y - 8) {
      if (best === null || p.y < best) best = p.y;
    }
  }
  const column = Math.floor(x / TILE);
  if (level.ground[column] && GROUND_Y >= y - 8 && (best === null || GROUND_Y < best)) {
    best = GROUND_Y;
  }
  return best;
}

// Is the level ready to play? Gives back null if it is, or a friendly message
export function checkLevel(level) {
  if (surfaceBelow(level, level.heroStart.x, level.heroStart.y) === null) {
    return '¡El héroe se caería al hoyo! Pon suelo 🟫 o una plataforma ▬ debajo de 🦸';
  }
  return null;
}

// Where can a villain walk? Back and forth around where it stands (200px to each
// side), but never off its platform or into a pit, so it doesn't fall by itself
function patrolFor(level, enemy) {
  const surface = surfaceBelow(level, enemy.x, enemy.y);
  let left = 0;
  let right = LEVEL_WIDTH;

  const platform = level.platforms.find((p) => p.y === surface &&
    enemy.x >= p.x && enemy.x < p.x + PLATFORM_WIDTH);
  if (platform) {
    // Standing on a floating platform: walk from one end to the other
    left = platform.x;
    right = platform.x + PLATFORM_WIDTH;
  } else if (surface === GROUND_Y) {
    // On the ground: look left and right until we find a pit (or the end)
    const column = Math.floor(enemy.x / TILE);
    let first = column;
    while (first > 0 && level.ground[first - 1]) first -= 1;
    let last = column;
    while (last < COLUMNS - 1 && level.ground[last + 1]) last += 1;
    left = first * TILE;
    right = Math.min(LEVEL_WIDTH, (last + 1) * TILE);
  }

  return {
    patrolMin: Math.max(left + 16, enemy.x - 200),
    patrolMax: Math.min(right - 16, enemy.x + 200),
  };
}

// Turn our editor level into a level the game can play (the same shape as levels.js)
export function toLevelData(level) {
  // The ground: one 64px block for every column that has ground
  const platforms = [];
  level.ground.forEach((hasGround, column) => {
    if (hasGround) platforms.push({ x: column * TILE, y: GROUND_Y, width: TILE, type: 'ground' });
  });
  level.platforms.forEach((p) => {
    platforms.push({ x: p.x, y: p.y, width: PLATFORM_WIDTH, type: 'platform' });
  });

  return {
    id: 0,
    name: level.name,
    worldWidth: LEVEL_WIDTH,
    worldHeight: 600,
    backgroundColor: '#888888',
    saturation: 0.3,
    heroStart: { ...level.heroStart },
    goal: { ...level.goal },
    platforms,
    // Speed, shooting and so on: each villain uses its normal values
    enemies: level.enemies.map((e) => ({
      type: e.type,
      x: e.x,
      y: e.y,
      direction: 'left',
      ...patrolFor(level, e),
    })),
    powerups: level.powerups.map((p) => ({ ...p })),
    // The same city in the background as level 1
    buildings: levels[0].buildings,
  };
}
