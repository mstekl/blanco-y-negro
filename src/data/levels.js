// levels.js — All our level configurations live here!
// Each level is an object that describes everything:
// where the platforms are, where enemies spawn, where power-ups appear, etc.
// The LevelScene reads this data and builds the level automatically.
// To create a new level, just add another object to this array!

export const levels = [
  // ============================================================
  // LEVEL 1 — Las Afueras (The Outskirts)
  // The first level! Simple enemies, no gaps, easy to learn.
  // ============================================================
  {
    id: 1,
    name: 'Las Afueras',
    subtitle: 'Donde los colores empiezan a desaparecer...',
    worldWidth: 2400,
    worldHeight: 600,
    backgroundColor: '#888888',
    saturation: 0.3,

    // Where the hero starts
    heroStart: { x: 50, y: 450 },

    // Where the goal flag is (reach this to beat the level!)
    goal: { x: 2350, y: 504 },

    // Platforms — the ground and floating platforms
    platforms: [
      // Ground (continuous — no gaps in level 1, nice and safe)
      { x: 0, y: 568, width: 800, type: 'ground' },
      { x: 800, y: 568, width: 800, type: 'ground' },
      { x: 1600, y: 568, width: 800, type: 'ground' },

      // Floating platforms (jump up to explore!)
      { x: 250, y: 430, width: 128, type: 'platform' },
      { x: 550, y: 360, width: 128, type: 'platform' },
      { x: 900, y: 300, width: 192, type: 'platform' },
      { x: 1250, y: 380, width: 128, type: 'platform' },
      { x: 1500, y: 430, width: 128, type: 'platform' },
      { x: 1800, y: 350, width: 192, type: 'platform' },
      { x: 2100, y: 420, width: 128, type: 'platform' },
    ],

    // Enemies — MR.1 stick figures patrolling the ground
    enemies: [
      { type: 'mr1', x: 400, y: 520, speed: 110, patrolMin: 200, patrolMax: 700, direction: 'left' },
      { type: 'mr1', x: 1000, y: 520, speed: 120, patrolMin: 800, patrolMax: 1300, direction: 'left' },
      { type: 'mr1', x: 1900, y: 520, speed: 115, patrolMin: 1600, patrolMax: 2200, direction: 'right' },
      // Extra walkers to make it harder
      { type: 'mr1', x: 700, y: 520, speed: 100, patrolMin: 600, patrolMax: 1000, direction: 'right' },
      { type: 'mr1', x: 1450, y: 520, speed: 125, patrolMin: 1300, patrolMax: 1750, direction: 'left' },
      { type: 'mr1', x: 2250, y: 520, speed: 110, patrolMin: 2100, patrolMax: 2330, direction: 'left' },
    ],

    // Power-ups — collect them for special abilities!
    powerups: [
      { type: 'extra-life', x: 614, y: 260 },   // Hidden platform above the platform at x=550
    ],

    // Background buildings silhouettes for parallax
    buildings: [
      { x: 100, y: 350, w: 80, h: 218 },
      { x: 220, y: 380, w: 60, h: 188 },
      { x: 500, y: 330, w: 100, h: 238 },
      { x: 900, y: 360, w: 70, h: 208 },
      { x: 1300, y: 340, w: 90, h: 228 },
      { x: 1700, y: 370, w: 80, h: 198 },
      { x: 2000, y: 350, w: 60, h: 218 },
    ],
  },

  // ============================================================
  // LEVEL 2 — El Parque Gris (The Gray Park)
  // Harder! Gaps in the ground, more enemies, faster speeds.
  // ============================================================
  {
    id: 2,
    name: 'El Parque Gris',
    subtitle: 'El parque perdió su verde...',
    worldWidth: 3200,
    worldHeight: 600,
    backgroundColor: '#777777',
    saturation: 0.2,

    heroStart: { x: 50, y: 450 },
    goal: { x: 3100, y: 504 },

    platforms: [
      // Ground with GAPS — careful, don't fall!
      { x: 0, y: 568, width: 640, type: 'ground' },
      // ~~ GAP 1 (160px wide) ~~
      { x: 800, y: 568, width: 576, type: 'ground' },
      // ~~ GAP 2 (224px wide — bigger!) ~~
      { x: 1600, y: 568, width: 640, type: 'ground' },
      // ~~ GAP 3 (160px wide) ~~
      { x: 2400, y: 568, width: 800, type: 'ground' },

      // Floating platforms — some help you cross the gaps!
      { x: 300, y: 420, width: 128, type: 'platform' },
      { x: 680, y: 460, width: 128, type: 'platform' },   // over gap 1
      { x: 600, y: 340, width: 128, type: 'platform' },
      { x: 1000, y: 320, width: 192, type: 'platform' },
      { x: 1420, y: 450, width: 128, type: 'platform' },  // over gap 2
      { x: 1500, y: 350, width: 128, type: 'platform' },
      { x: 1900, y: 400, width: 128, type: 'platform' },
      { x: 2280, y: 460, width: 128, type: 'platform' },  // over gap 3
      { x: 2200, y: 330, width: 192, type: 'platform' },
      { x: 2600, y: 380, width: 128, type: 'platform' },
      { x: 2900, y: 430, width: 128, type: 'platform' },
    ],

    enemies: [
      { type: 'mr1', x: 300, y: 520, speed: 120, patrolMin: 100, patrolMax: 550, direction: 'left' },
      { type: 'mr1', x: 950, y: 520, speed: 130, patrolMin: 800, patrolMax: 1200, direction: 'left' },
      { type: 'mr1', x: 1050, y: 272, speed: 90, patrolMin: 1000, patrolMax: 1180, direction: 'right' },
      { type: 'mr1', x: 1800, y: 520, speed: 125, patrolMin: 1600, patrolMax: 2050, direction: 'right' },
      { type: 'mr1', x: 2600, y: 520, speed: 140, patrolMin: 2400, patrolMax: 2900, direction: 'left' },
      // Extra walkers, and the first shooter shows up early!
      { type: 'mr1', x: 1250, y: 520, speed: 120, patrolMin: 800, patrolMax: 1350, direction: 'right' },
      { type: 'mr1', x: 2000, y: 520, speed: 130, patrolMin: 1700, patrolMax: 2200, direction: 'left' },
      { type: 'mr2', x: 2850, y: 520, speed: 60, patrolMin: 2500, patrolMax: 3150, direction: 'left', fireRate: 2200 },
      // The first flying bat!
      { type: 'mr3', x: 1500, y: 230, speed: 70, patrolMin: 1300, patrolMax: 1800, direction: 'left' },
    ],

    // Power-ups — the Color Gun appears here!
    powerups: [
      { type: 'color-pencil', x: 1000, y: 280 },  // On a high platform — grants shooting!
      { type: 'shield', x: 2200, y: 290 },         // Shield to protect from enemies ahead
      { type: 'extra-life', x: 2664, y: 280 },     // Hidden platform above the platform at x=2600
    ],

    buildings: [
      { x: 80, y: 360, w: 70, h: 208 },
      { x: 200, y: 330, w: 90, h: 238 },
      { x: 450, y: 370, w: 60, h: 198 },
      { x: 750, y: 340, w: 100, h: 228 },
      { x: 1100, y: 360, w: 80, h: 208 },
      { x: 1500, y: 320, w: 70, h: 248 },
      { x: 1800, y: 350, w: 90, h: 218 },
      { x: 2100, y: 370, w: 60, h: 198 },
      { x: 2500, y: 340, w: 100, h: 228 },
      { x: 2800, y: 360, w: 70, h: 208 },
    ],
  },

  // ============================================================
  // LEVEL 3 — La Ciudad Gris (The Gray City)
  // MR.2 shooters appear! Need the Color Gun to survive.
  // ============================================================
  {
    id: 3,
    name: 'La Ciudad Gris',
    subtitle: 'Los edificios perdieron su brillo...',
    worldWidth: 4000,
    worldHeight: 600,
    backgroundColor: '#666666',
    saturation: 0.1,

    heroStart: { x: 50, y: 450 },
    goal: { x: 3900, y: 504 },

    platforms: [
      // Ground with gaps
      { x: 0, y: 568, width: 640, type: 'ground' },
      { x: 800, y: 568, width: 640, type: 'ground' },
      { x: 1600, y: 568, width: 512, type: 'ground' },
      // Big gap
      { x: 2300, y: 568, width: 576, type: 'ground' },
      { x: 3100, y: 568, width: 900, type: 'ground' },

      // Floating platforms
      { x: 300, y: 420, width: 128, type: 'platform' },
      { x: 580, y: 340, width: 192, type: 'platform' },
      { x: 720, y: 460, width: 128, type: 'platform' },   // over gap
      { x: 1000, y: 380, width: 128, type: 'platform' },
      { x: 1300, y: 300, width: 192, type: 'platform' },
      { x: 1500, y: 420, width: 128, type: 'platform' },
      { x: 2150, y: 430, width: 128, type: 'platform' },  // over gap
      { x: 2050, y: 340, width: 128, type: 'platform' },
      { x: 2500, y: 370, width: 192, type: 'platform' },
      { x: 2800, y: 300, width: 128, type: 'platform' },
      { x: 3000, y: 430, width: 128, type: 'platform' },  // over gap
      { x: 3400, y: 380, width: 192, type: 'platform' },
      { x: 3700, y: 420, width: 128, type: 'platform' },
    ],

    enemies: [
      // MR.1 walkers
      { type: 'mr1', x: 300, y: 520, speed: 130, patrolMin: 100, patrolMax: 550, direction: 'left' },
      { type: 'mr1', x: 1000, y: 520, speed: 130, patrolMin: 800, patrolMax: 1300, direction: 'right' },
      { type: 'mr1', x: 1700, y: 520, speed: 140, patrolMin: 1600, patrolMax: 1950, direction: 'left' },
      { type: 'mr1', x: 2500, y: 520, speed: 135, patrolMin: 2300, patrolMax: 2700, direction: 'right' },
      { type: 'mr1', x: 3300, y: 520, speed: 140, patrolMin: 3100, patrolMax: 3500, direction: 'right' },
      // MR.2 shooters! (new in this level) — more of them, and they shoot faster
      { type: 'mr2', x: 1300, y: 250, speed: 60, patrolMin: 1300, patrolMax: 1480, direction: 'left', fireRate: 1600 },
      { type: 'mr2', x: 3400, y: 520, speed: 70, patrolMin: 3100, patrolMax: 3700, direction: 'left', fireRate: 1600 },
      { type: 'mr2', x: 900, y: 520, speed: 60, patrolMin: 800, patrolMax: 1400, direction: 'right', fireRate: 1800 },
      { type: 'mr3', x: 1000, y: 230, speed: 80, patrolMin: 800, patrolMax: 1300, direction: 'right' },
      { type: 'mr3', x: 2800, y: 230, speed: 80, patrolMin: 2500, patrolMax: 3000, direction: 'left' },
      { type: 'mr2', x: 2600, y: 520, speed: 60, patrolMin: 2300, patrolMax: 2850, direction: 'left', fireRate: 1800 },
      { type: 'mr2', x: 3800, y: 520, speed: 60, patrolMin: 3700, patrolMax: 3980, direction: 'left', fireRate: 1600 },
    ],

    powerups: [
      { type: 'color-pencil', x: 580, y: 300 },   // Get the gun early — you'll need it!
      { type: 'shield', x: 1300, y: 260 },
      { type: 'extra-life', x: 2864, y: 200 },    // Hidden platform above the platform at x=2800
      { type: 'shield', x: 3400, y: 340 },
    ],

    buildings: [
      { x: 60, y: 320, w: 100, h: 248 },
      { x: 200, y: 340, w: 80, h: 228 },
      { x: 400, y: 300, w: 120, h: 268 },
      { x: 700, y: 330, w: 90, h: 238 },
      { x: 1000, y: 310, w: 110, h: 258 },
      { x: 1400, y: 340, w: 80, h: 228 },
      { x: 1700, y: 320, w: 100, h: 248 },
      { x: 2100, y: 300, w: 120, h: 268 },
      { x: 2500, y: 330, w: 90, h: 238 },
      { x: 2900, y: 310, w: 110, h: 258 },
      { x: 3300, y: 340, w: 80, h: 228 },
      { x: 3600, y: 320, w: 100, h: 248 },
    ],
  },

  // ============================================================
  // LEVEL 4 — La Fábrica Oscura (The Dark Factory)
  // Boss fight at the end! MR.2 shooters everywhere.
  // ============================================================
  {
    id: 4,
    name: 'La Fábrica Oscura',
    subtitle: 'Aquí fabrican la oscuridad...',
    worldWidth: 3200,
    worldHeight: 600,
    backgroundColor: '#555555',
    saturation: 0.05,

    heroStart: { x: 50, y: 450 },
    // This level ends at a castle instead of a flag! Walking in leads to level 5.
    // (castle is 128px tall, so y=504 puts its bottom right on the ground at y=568)
    goal: { x: 3100, y: 504, type: 'castle' },

    platforms: [
      // Ground with gaps
      { x: 0, y: 568, width: 576, type: 'ground' },
      { x: 768, y: 568, width: 512, type: 'ground' },
      { x: 1472, y: 568, width: 448, type: 'ground' },
      { x: 2112, y: 568, width: 512, type: 'ground' },
      // Boss arena — wide flat ground
      { x: 2750, y: 568, width: 450, type: 'ground' },

      // Floating platforms
      { x: 200, y: 420, width: 128, type: 'platform' },
      { x: 450, y: 340, width: 192, type: 'platform' },
      { x: 650, y: 450, width: 128, type: 'platform' },   // over gap
      { x: 900, y: 380, width: 128, type: 'platform' },
      { x: 1150, y: 300, width: 192, type: 'platform' },
      { x: 1350, y: 430, width: 128, type: 'platform' },  // over gap
      { x: 1600, y: 350, width: 128, type: 'platform' },
      { x: 1850, y: 420, width: 128, type: 'platform' },
      { x: 2000, y: 430, width: 128, type: 'platform' },  // over gap
      { x: 2300, y: 380, width: 192, type: 'platform' },
      { x: 2550, y: 300, width: 128, type: 'platform' },
      // Platforms in boss arena to dodge projectiles
      { x: 2700, y: 420, width: 128, type: 'platform' },
      { x: 2900, y: 350, width: 128, type: 'platform' },
    ],

    enemies: [
      // MR.2 shooters guarding the path
      { type: 'mr2', x: 900, y: 520, speed: 70, patrolMin: 768, patrolMax: 1100, direction: 'left', fireRate: 1500 },
      { type: 'mr2', x: 1600, y: 520, speed: 75, patrolMin: 1472, patrolMax: 1800, direction: 'right', fireRate: 1500 },
      { type: 'mr1', x: 1150, y: 250, speed: 90, patrolMin: 1150, patrolMax: 1330, direction: 'left' },
      { type: 'mr3', x: 1700, y: 220, speed: 85, patrolMin: 1500, patrolMax: 2000, direction: 'left' },
      { type: 'mr3', x: 2400, y: 220, speed: 85, patrolMin: 2200, patrolMax: 2700, direction: 'right' },
      { type: 'mr2', x: 2300, y: 520, speed: 80, patrolMin: 2112, patrolMax: 2500, direction: 'left', fireRate: 1500 },
      // Extra enemies on the ground between the gaps
      { type: 'mr1', x: 300, y: 520, speed: 130, patrolMin: 100, patrolMax: 550, direction: 'right' },
      { type: 'mr1', x: 1000, y: 520, speed: 140, patrolMin: 768, patrolMax: 1250, direction: 'left' },
      { type: 'mr2', x: 500, y: 520, speed: 70, patrolMin: 200, patrolMax: 570, direction: 'right', fireRate: 1800 },
      { type: 'mr1', x: 2200, y: 520, speed: 140, patrolMin: 2112, patrolMax: 2600, direction: 'right' },
      // THE BOSS! Big MR.2 at the end of the level — tougher and shoots faster
      { type: 'mr2', x: 2950, y: 490, speed: 35, patrolMin: 2800, patrolMax: 3050,
        direction: 'left', isBoss: true, health: 7, fireRate: 1100, scale: 1.8 },
    ],

    powerups: [
      { type: 'color-pencil', x: 200, y: 380 },   // Gun right at the start — you'll need it!
      { type: 'extra-life', x: 546, y: 240 },    // Hidden platform above the platform at x=450
      { type: 'shield', x: 1150, y: 260 },
      { type: 'extra-life', x: 1914, y: 320 },   // Hidden platform above the platform at x=1850
      { type: 'shield', x: 2550, y: 260 },         // Shield before boss fight!
      { type: 'extra-life', x: 2764, y: 320 },     // Hidden platform in boss arena
    ],

    buildings: [
      { x: 50, y: 280, w: 130, h: 288 },
      { x: 250, y: 300, w: 110, h: 268 },
      { x: 500, y: 270, w: 140, h: 298 },
      { x: 800, y: 290, w: 120, h: 278 },
      { x: 1100, y: 260, w: 150, h: 308 },
      { x: 1400, y: 280, w: 130, h: 288 },
      { x: 1700, y: 270, w: 140, h: 298 },
      { x: 2000, y: 290, w: 120, h: 278 },
      { x: 2400, y: 260, w: 150, h: 308 },
      { x: 2700, y: 280, w: 130, h: 288 },
    ],
  },

  // ============================================================
  // LEVEL 5 — Adentro del Castillo (Inside the Castle)
  // INSIDE the castle from level 4! Tall pillars replace the buildings.
  // No enemies here: a storm cloud chases you and throws pencils! The green pipe at the end leads outside (level 6).
  // ============================================================
  {
    id: 5,
    name: 'Adentro del Castillo',
    subtitle: 'Hay un tubo misterioso al final...',
    worldWidth: 3000,
    worldHeight: 600,
    backgroundColor: '#333333',
    saturation: 0,
    backgroundStyle: 'bricks', // inside a castle: brick wall instead of a city sky

    heroStart: { x: 50, y: 450 },
    // A pipe instead of a flag! (pipe is 96px tall, so y=520 puts its bottom on the ground)
    goal: { x: 2950, y: 520, type: 'pipe' },

    platforms: [
      // Ground with gaps (all small enough to jump over)
      { x: 0, y: 568, width: 700, type: 'ground' },
      { x: 860, y: 568, width: 640, type: 'ground' },
      { x: 1680, y: 568, width: 600, type: 'ground' },
      // Boss arena
      { x: 2440, y: 568, width: 560, type: 'ground' },

      // Floating platforms
      { x: 300, y: 420, width: 128, type: 'platform' },
      { x: 500, y: 340, width: 192, type: 'platform' },
      { x: 732, y: 450, width: 128, type: 'platform' },   // over gap 1
      { x: 1000, y: 400, width: 128, type: 'platform' },
      { x: 1200, y: 320, width: 192, type: 'platform' },
      { x: 1520, y: 450, width: 128, type: 'platform' },  // over gap 2
      { x: 1750, y: 400, width: 128, type: 'platform' },
      { x: 1950, y: 330, width: 192, type: 'platform' },
      { x: 2150, y: 420, width: 128, type: 'platform' },
      { x: 2312, y: 450, width: 128, type: 'platform' },  // over gap 3
      // Platforms in the boss arena to dodge projectiles
      { x: 2550, y: 380, width: 128, type: 'platform' },
      { x: 2750, y: 320, width: 128, type: 'platform' },
    ],

    // No enemies in this level — a STORM CLOUD chases the hero instead!
    enemies: [],

    // The angry cloud flies after the hero and throws black and white pencils.
    // In the final animation, colored pencils turn it into a happy cloud.
    stormCloud: { x: 300, y: 110, speed: 120, fireRate: 1400 },

    powerups: [
      { type: 'color-pencil', x: 340, y: 380 },   // Gun right at the start
      { type: 'extra-life', x: 596, y: 240 },     // Hidden platform above the platform at x=500
      { type: 'shield', x: 1250, y: 280 },
      { type: 'shield', x: 2200, y: 380 },        // Shield before the final boss!
      { type: 'extra-life', x: 2814, y: 220 },    // Hidden platform in boss arena
    ],

    // Tall castle pillars
    buildings: [
      { x: 80, y: 120, w: 60, h: 448 },
      { x: 400, y: 150, w: 60, h: 418 },
      { x: 750, y: 120, w: 60, h: 448 },
      { x: 1100, y: 150, w: 60, h: 418 },
      { x: 1450, y: 120, w: 60, h: 448 },
      { x: 1800, y: 150, w: 60, h: 418 },
      { x: 2150, y: 120, w: 60, h: 448 },
      { x: 2500, y: 150, w: 60, h: 418 },
      { x: 2800, y: 120, w: 60, h: 448 },
    ],
  },

  // ============================================================
  // LEVEL 6 — Afuera del Castillo (Outside the Castle)
  // You came out of the pipe on the other side! The colors are coming back,
  // but the FINAL boss is waiting. Beat him and reach the flag to win!
  // ============================================================
  {
    id: 6,
    name: 'Afuera del Castillo',
    subtitle: '¡El color vuelve! Falta un último jefe...',
    worldWidth: 3400,
    worldHeight: 600,
    backgroundColor: '#999999',
    saturation: 0.6,

    heroStart: { x: 50, y: 450 },
    goal: { x: 3330, y: 504 },

    platforms: [
      // Ground with gaps
      { x: 0, y: 568, width: 600, type: 'ground' },
      { x: 780, y: 568, width: 700, type: 'ground' },
      { x: 1660, y: 568, width: 640, type: 'ground' },
      // Boss arena
      { x: 2480, y: 568, width: 920, type: 'ground' },

      // Floating platforms
      { x: 300, y: 420, width: 128, type: 'platform' },
      { x: 480, y: 340, width: 192, type: 'platform' },
      { x: 626, y: 450, width: 128, type: 'platform' },   // over gap 1
      { x: 950, y: 400, width: 128, type: 'platform' },
      { x: 1150, y: 310, width: 192, type: 'platform' },
      { x: 1506, y: 450, width: 128, type: 'platform' },  // over gap 2
      { x: 1800, y: 400, width: 128, type: 'platform' },
      { x: 2000, y: 330, width: 192, type: 'platform' },
      { x: 2326, y: 450, width: 128, type: 'platform' },  // over gap 3
      // Platforms in the boss arena to dodge projectiles
      { x: 2600, y: 380, width: 128, type: 'platform' },
      { x: 2850, y: 320, width: 128, type: 'platform' },
      { x: 3100, y: 380, width: 128, type: 'platform' },
    ],

    enemies: [
      { type: 'mr1', x: 350, y: 520, speed: 120, patrolMin: 150, patrolMax: 580, direction: 'right' },
      { type: 'mr2', x: 900, y: 520, speed: 75, patrolMin: 780, patrolMax: 1450, direction: 'left', fireRate: 1400 },
      { type: 'mr1', x: 1150, y: 260, speed: 90, patrolMin: 1150, patrolMax: 1330, direction: 'left' },
      { type: 'mr2', x: 1800, y: 520, speed: 80, patrolMin: 1660, patrolMax: 2280, direction: 'right', fireRate: 1400 },
      // Extra enemies (and bats to dodge on the way to the boss)
      { type: 'mr3', x: 1300, y: 220, speed: 90, patrolMin: 1100, patrolMax: 1600, direction: 'left' },
      { type: 'mr3', x: 2200, y: 220, speed: 90, patrolMin: 2000, patrolMax: 2500, direction: 'right' },
      { type: 'mr1', x: 1000, y: 520, speed: 140, patrolMin: 780, patrolMax: 1450, direction: 'right' },
      { type: 'mr1', x: 2000, y: 520, speed: 140, patrolMin: 1660, patrolMax: 2280, direction: 'left' },
      { type: 'mr2', x: 400, y: 520, speed: 70, patrolMin: 200, patrolMax: 580, direction: 'left', fireRate: 1600 },
      { type: 'mr2', x: 1300, y: 520, speed: 75, patrolMin: 1100, patrolMax: 1470, direction: 'right', fireRate: 1500 },
      // THE FINAL BOSS! The biggest and toughest of the whole game
      { type: 'mr2', x: 2950, y: 490, speed: 45, patrolMin: 2700, patrolMax: 3150,
        direction: 'left', isBoss: true, health: 12, fireRate: 800, scale: 2.0 },
    ],

    powerups: [
      { type: 'color-pencil', x: 340, y: 380 },   // Gun right at the start
      { type: 'extra-life', x: 576, y: 240 },     // Hidden platform above the platform at x=480
      { type: 'shield', x: 1250, y: 270 },
      { type: 'shield', x: 2080, y: 290 },        // Shield before the final boss!
      { type: 'extra-life', x: 2914, y: 220 },    // Hidden platform in boss arena
    ],

    buildings: [
      { x: 60, y: 300, w: 110, h: 268 },
      { x: 300, y: 320, w: 90, h: 248 },
      { x: 600, y: 280, w: 120, h: 288 },
      { x: 900, y: 310, w: 100, h: 258 },
      { x: 1250, y: 290, w: 120, h: 278 },
      { x: 1600, y: 310, w: 100, h: 258 },
      { x: 1950, y: 280, w: 130, h: 288 },
      { x: 2300, y: 300, w: 110, h: 268 },
      { x: 2650, y: 290, w: 120, h: 278 },
      { x: 3000, y: 310, w: 100, h: 258 },
    ],
  },
];
