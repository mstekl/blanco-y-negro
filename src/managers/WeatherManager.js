// WeatherManager.js — Day, night, rain and snow!
// Every time we play a level, the weather is picked at random:
//   ☀️ DÍA:    the normal level
//   🌙 NOCHE:  everything is dark, and our hero carries a flashlight (we see around us)
//   🌧 LLUVIA: rain falls, and sometimes there is lightning
//   ❄️ NIEVE:  snow falls, and the floor is SLIPPERY (we speed up and stop slowly)
// The weather is remembered while we try the same level again (after losing a heart),
// and in the race both halves get the same one, so it is fair.

import Phaser from 'phaser';

export const WEATHERS = {
  dia: { name: 'De día', icon: '☀️' },
  noche: { name: '¡De noche! Llevas una linterna', icon: '🌙' },
  lluvia: { name: '¡Con lluvia!', icon: '🌧' },
  nieve: { name: '¡Con nieve! El piso resbala', icon: '❄️' },
};
// Day comes out twice as often as each of the others
const BAG = ['dia', 'dia', 'noche', 'lluvia', 'nieve'];

export function randomWeather() {
  return BAG[Math.floor(Math.random() * BAG.length)];
}

// The weather of a level, kept in the registry (the memory shared by all scenes):
// the first time we ask, it is picked at random; after that, it stays the same.
// forget() makes the next one new (a new game, a new race)
export function weatherFor(registry, key) {
  const all = registry.get('climas') || {};
  if (!all[key]) {
    all[key] = randomWeather();
    registry.set('climas', all);
  }
  return all[key];
}

export function forgetWeather(registry, startOfKey = '') {
  const all = registry.get('climas') || {};
  Object.keys(all).forEach((key) => {
    if (key.startsWith(startOfKey)) delete all[key];
  });
  registry.set('climas', all);
}

const LIGHT_SIZE = 380; // how big the circle of the flashlight is

class WeatherManager {
  constructor(scene, weather) {
    this.scene = scene;
    this.weather = weather;
    if (weather === 'noche') this.makeNight();
    if (weather === 'lluvia') this.makeRain();
    if (weather === 'nieve') this.makeSnow();
  }

  // The night: a dark layer over the level, with a hole of light around each hero
  makeNight() {
    const scene = this.scene;
    if (!scene.textures.exists('night-light')) {
      // A soft circle: white in the middle, see-through at the edges
      const texture = scene.textures.createCanvas('night-light', LIGHT_SIZE, LIGHT_SIZE);
      const ctx = texture.getContext();
      const r = LIGHT_SIZE / 2;
      const glow = ctx.createRadialGradient(r, r, r * 0.35, r, r, r);
      glow.addColorStop(0, 'rgba(255,255,255,1)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, LIGHT_SIZE, LIGHT_SIZE);
      texture.refresh();
    }
    this.dark = scene.add.renderTexture(0, 0, 800, 600).setOrigin(0).setScrollFactor(0).setDepth(80);
    // A few stars in the sky (they don't move with the camera)
    for (let i = 0; i < 25; i++) {
      scene.add.circle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 250), 1, 0xffffff, 0.8)
        .setScrollFactor(0).setDepth(81);
    }
  }

  makeRain() {
    const scene = this.scene;
    if (!scene.textures.exists('raindrop')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0xaaccff);
      gfx.fillRect(0, 0, 2, 12);
      gfx.generateTexture('raindrop', 2, 12);
      gfx.destroy();
    }
    scene.add.particles(0, -20, 'raindrop', {
      x: { min: 0, max: 900 }, speedY: { min: 550, max: 750 }, speedX: -80,
      lifespan: 1300, quantity: 3, frequency: 25, alpha: { start: 0.7, end: 0.4 }, rotate: 8,
    }).setScrollFactor(0).setDepth(85);
    // A gray sky
    scene.add.rectangle(400, 300, 800, 600, 0x223344, 0.25).setScrollFactor(0).setDepth(84);
    // Lightning, every few seconds: the screen flashes white
    this.lightning = scene.time.addEvent({
      delay: 7000, loop: true,
      callback: () => scene.cameras.main.flash(180, 255, 255, 255),
    });
  }

  makeSnow() {
    const scene = this.scene;
    if (!scene.textures.exists('snowflake')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(3, 3, 3);
      gfx.generateTexture('snowflake', 6, 6);
      gfx.destroy();
    }
    scene.add.particles(0, -10, 'snowflake', {
      x: { min: 0, max: 800 }, speedY: { min: 40, max: 90 }, speedX: { min: -25, max: 25 },
      lifespan: 9000, quantity: 1, frequency: 70, scale: { min: 0.4, max: 1 }, alpha: 0.9,
    }).setScrollFactor(0).setDepth(85);
    // A cold, light blue sky
    scene.add.rectangle(400, 300, 800, 600, 0xddeeff, 0.15).setScrollFactor(0).setDepth(84);
    // The floor is slippery for every hero
    (scene.heroes || [scene.hero]).forEach((hero) => { hero.slippery = true; });
  }

  // Every frame: at night, the light follows the heroes
  update() {
    if (!this.dark) return;
    const cam = this.scene.cameras.main;
    this.dark.clear();
    this.dark.fill(0x000018, 0.85);
    (this.scene.heroes || [this.scene.hero]).forEach((hero) => {
      if (!hero.visible) return;
      this.dark.erase('night-light', hero.x - cam.scrollX - LIGHT_SIZE / 2, hero.y - cam.scrollY - LIGHT_SIZE / 2);
    });
  }
}

export default WeatherManager;
