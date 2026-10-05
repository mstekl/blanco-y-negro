// WorldMapScene.js — The world map! Shown after beating all 6 levels.
// The player picks a country and gives it its colors back.
// Continents unlock in order: Norteamérica → Centroamérica → Sudamérica →
// África → Europa → Asia → Oceanía. The painted countries are saved in the
// browser, so the map remembers them the next time we play.
//
// The shapes of the countries come from src/data/worldMap.json
// (made by tools/build-world-map.mjs). Every shape is a list of
// longitude/latitude points that we turn into screen positions.

import Phaser from 'phaser';
import worldMap from '../data/worldMap.json';

// The continents, in the order they unlock.
// "view" is the piece of the world (longitude / latitude) that fills the screen
// when we look at that continent. Oceania crosses the date line, so it wraps.
const GROUPS = [
  { key: 'norte', name: 'Norteamérica', view: { lon: [-170, -50], lat: [14, 84] } },
  { key: 'centro', name: 'Centroamérica', view: { lon: [-93, -58], lat: [7, 27.5] } },
  { key: 'sur', name: 'Sudamérica', view: { lon: [-82, -34], lat: [-56, 13] } },
  { key: 'africa', name: 'África', view: { lon: [-18, 52], lat: [-36, 38] } },
  { key: 'europa', name: 'Europa', view: { lon: [-25, 60], lat: [34, 72] } },
  { key: 'asia', name: 'Asia', view: { lon: [25, 150], lat: [-11, 56] } },
  { key: 'oceania', name: 'Oceanía', view: { lon: [110, 215], lat: [-50, 8], wrap: true } },
];
const WORLD_VIEW = { lon: [-180, 180], lat: [-58, 84] };

// Where the map is drawn on the 800x600 screen
const MAP = { x: 10, y: 92, w: 780, h: 410 };

// How many countries we can color each time we beat the game
const PICKS_PER_VICTORY = 1;

// The browser remembers the colored countries under this name
const SAVE_KEY = 'blancoYNegro.paisesColoreados';

// Colors for the painted countries (every country gets one of these)
const PALETTE = [
  0xff4d4d, 0xff9933, 0xffdd33, 0x55cc55, 0x33aaff, 0x9966ff,
  0xff66b2, 0x22ccaa, 0xff7043, 0x8bc34a,
];

// Map colors
const SEA = '#16283f';
const COLOR_AVAILABLE = 0xf2f2f2;  // can be painted now
const COLOR_SELECTED = 0xffee55;   // the one we picked
const COLOR_LOCKED = 0x59616b;     // belongs to a continent that is still locked
const COLOR_OTHER = 0x3b424a;      // not a country of the game (Groenlandia, Puerto Rico...)

class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMapScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(SEA);
    this.cameras.main.fadeIn(500);

    this.progress = this.loadProgress();   // Set of country ids already painted
    this.picksLeft = PICKS_PER_VICTORY;
    this.selected = null;                  // the country picked (not painted yet)
    this.hovered = null;
    this.finished = false;                 // true when we are done picking
    this.showWorld = false;                // false = zoom on the current continent

    // Testing shortcut: ?mapa=reset in the URL erases the saved countries
    if (new URLSearchParams(window.location.search).get('mapa') === 'reset') {
      this.progress.clear();
      this.saveProgress();
    }

    // One object per country, with its points ready to draw
    this.countries = worldMap.map((data) => ({
      data,
      color: PALETTE[this.hash(data.id) % PALETTE.length],
      shapes: [],
      bbox: null,
    }));
    // Big countries are drawn first so small ones (islands!) stay on top
    this.countries.sort((a, b) => this.totalArea(b.data) - this.totalArea(a.data));

    // --- Layers (the mask hides whatever goes outside of the map box) ---
    this.baseGfx = this.add.graphics();
    this.pulseGfx = this.add.graphics();
    this.hoverGfx = this.add.graphics();
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);
    const mask = maskShape.createGeometryMask();
    [this.baseGfx, this.pulseGfx, this.hoverGfx].forEach((g) => g.setMask(mask));

    // Available countries blink softly so it's clear where to click
    this.tweens.add({
      targets: this.pulseGfx,
      alpha: { from: 0.1, to: 0.55 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // A frame around the map
    this.add.rectangle(MAP.x + MAP.w / 2, MAP.y + MAP.h / 2, MAP.w, MAP.h)
      .setStrokeStyle(2, 0x4a6a94).setFillStyle(0x000000, 0);

    this.createTexts();
    this.refreshView();

    // --- Mouse ---
    this.input.on('pointermove', (pointer) => this.onPointerMove(pointer));
    this.input.on('pointerdown', (pointer) => this.onPointerDown(pointer));

    // --- Keyboard ---
    this.input.keyboard.on('keydown-ENTER', () => this.onEnter());
    this.input.keyboard.on('keydown-M', () => this.toggleWorld());
  }

  // ---------------------------------------------------------------
  // Saved progress (the browser may block storage, so we always try/catch)
  // ---------------------------------------------------------------
  loadProgress() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
      if (Array.isArray(saved)) return new Set(saved);
    } catch (e) {
      // No saved data (or storage is blocked): we simply start with a gray world
    }
    return new Set();
  }

  saveProgress() {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify([...this.progress]));
    } catch (e) {
      // Storage blocked: the countries just won't be remembered next time
    }
  }

  // ---------------------------------------------------------------
  // Which continent is open right now?
  // ---------------------------------------------------------------
  // Playable countries of a continent
  groupCountries(groupKey) {
    return this.countries.filter((c) => c.data.group === groupKey);
  }

  paintedCount(groupKey) {
    return this.groupCountries(groupKey).filter((c) => this.progress.has(c.data.id)).length;
  }

  // The first continent that still has countries without color (or null if all are done)
  currentGroup() {
    return GROUPS.find((g) => this.paintedCount(g.key) < this.groupCountries(g.key).length) || null;
  }

  // Can the player paint this country right now?
  isAvailable(country) {
    const group = this.currentGroup();
    return Boolean(group)
      && country.data.group === group.key
      && !this.progress.has(country.data.id);
  }

  // ---------------------------------------------------------------
  // Texts and labels
  // ---------------------------------------------------------------
  createTexts() {
    const style = (size, color) => ({
      fontFamily: 'Arial', fontSize: `${size}px`, color,
      stroke: '#000000', strokeThickness: 4,
    });

    this.add.text(400, 22, '¡Elige un país para devolverle el color!', style(28, '#ffee55'))
      .setOrigin(0.5);

    // Row with all the continents and how many countries each one has painted
    this.chips = GROUPS.map((group, i) => (
      this.add.text(70 + i * 110, 62, '', {
        fontFamily: 'Arial', fontSize: '13px', color: '#ffffff',
        stroke: '#000000', strokeThickness: 3, align: 'center',
      }).setOrigin(0.5)
    ));

    // Name of the country under the mouse
    this.tooltip = this.add.text(0, 0, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff',
      backgroundColor: '#000000cc', padding: { x: 8, y: 4 },
    }).setDepth(50).setVisible(false);

    // The country we picked, and what to do next
    this.infoText = this.add.text(400, 530, '', style(20, '#ffffff')).setOrigin(0.5);
    this.hintText = this.add.text(400, 572, '', {
      fontFamily: 'Arial', fontSize: '14px', color: '#9fb4d0',
    }).setOrigin(0.5);
  }

  // Update the continent chips, the info line and the hint
  refreshTexts() {
    const current = this.currentGroup();
    GROUPS.forEach((group, i) => {
      const total = this.groupCountries(group.key).length;
      const painted = this.paintedCount(group.key);
      const done = painted >= total;
      const isCurrent = current && current.key === group.key;
      this.chips[i].setText(`${group.name}\n${painted}/${total}`);
      this.chips[i].setColor(done ? '#66ee88' : isCurrent ? '#ffee55' : '#7f8a99');
    });

    if (this.finished) return; // the final messages are written by the painting animation

    if (!current) {
      this.infoText.setText('¡Todo el mundo tiene color!').setColor('#66ee88');
      this.hintText.setText('ENTER: continuar');
    } else if (this.selected) {
      this.infoText.setText(`${this.selected.data.name}  —  ENTER para colorearlo`).setColor('#ffee55');
      this.hintText.setText('Haz clic en otro país para cambiar  ·  M: mapa del mundo');
    } else {
      this.infoText.setText(`Ahora toca: ${current.name}`).setColor('#ffffff');
      this.hintText.setText('Haz clic en un país blanco  ·  M: mapa del mundo');
    }
  }

  // ---------------------------------------------------------------
  // Turning longitude/latitude into screen positions
  // ---------------------------------------------------------------
  // Pick the zoom (continent or whole world), project every country and redraw
  refreshView() {
    const current = this.currentGroup();
    this.view = (this.showWorld || !current) ? { ...WORLD_VIEW, world: true } : current.view;
    this.projectAll();
    this.drawMap();
    this.refreshTexts();
  }

  projectAll() {
    const { lon, lat, wrap, world } = this.view;
    // Squeeze longitudes a little near the poles so the shapes don't look stretched
    const midLat = (lat[0] + lat[1]) / 2;
    const kx = world ? 0.8 : Math.cos((midLat * Math.PI) / 180);
    const scale = Math.min(MAP.w / ((lon[1] - lon[0]) * kx), MAP.h / (lat[1] - lat[0]));
    // Center the picture inside the map box
    const offX = MAP.x + (MAP.w - (lon[1] - lon[0]) * kx * scale) / 2;
    const offY = MAP.y + (MAP.h - (lat[1] - lat[0]) * scale) / 2;

    for (const country of this.countries) {
      let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
      country.shapes = country.data.rings.map((ring) => {
        // Oceania wraps around the date line: islands at -170° must show up
        // at 190°. Only pieces that really reach the far west (like Samoa) are
        // moved; the rest of the world keeps its place.
        let shift = false;
        if (wrap) {
          for (let i = 0; i < ring.length; i += 2) {
            if (ring[i] < -100) { shift = true; break; }
          }
        }

        const points = [];
        for (let i = 0; i < ring.length; i += 2) {
          const lo = shift && ring[i] < 0 ? ring[i] + 360 : ring[i];
          const x = offX + (lo - lon[0]) * kx * scale;
          const y = offY + (lat[1] - ring[i + 1]) * scale;
          points.push(new Phaser.Math.Vector2(x, y));
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
        return points;
      });
      country.bbox = { minX, minY, maxX, maxY };

      // The "center" of the country is the center of its BIGGEST piece. (The
      // whole box would be wrong for countries with far islands, like Hawaii.)
      const main = country.shapes[0];
      const xs = main.map((p) => p.x);
      const ys = main.map((p) => p.y);
      country.center = {
        x: (Math.min(...xs) + Math.max(...xs)) / 2,
        y: (Math.min(...ys) + Math.max(...ys)) / 2,
      };
    }
  }

  totalArea(data) {
    // Only needs to be good enough to sort countries from big to small
    return data.rings.reduce((sum, ring) => {
      let xmin = Infinity; let xmax = -Infinity; let ymin = Infinity; let ymax = -Infinity;
      for (let i = 0; i < ring.length; i += 2) {
        xmin = Math.min(xmin, ring[i]); xmax = Math.max(xmax, ring[i]);
        ymin = Math.min(ymin, ring[i + 1]); ymax = Math.max(ymax, ring[i + 1]);
      }
      return sum + (xmax - xmin) * (ymax - ymin);
    }, 0);
  }

  hash(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    return h;
  }

  // ---------------------------------------------------------------
  // Drawing
  // ---------------------------------------------------------------
  fillFor(country) {
    if (this.progress.has(country.data.id)) return country.color;
    if (!country.data.group) return COLOR_OTHER;
    if (this.selected === country) return COLOR_SELECTED;
    if (this.isAvailable(country)) return COLOR_AVAILABLE;
    return COLOR_LOCKED;
  }

  drawShapes(gfx, country) {
    for (const points of country.shapes) {
      gfx.fillPoints(points, true);
      gfx.strokePoints(points, true);
    }
  }

  drawMap() {
    this.baseGfx.clear();
    this.pulseGfx.clear();
    this.baseGfx.lineStyle(1, 0x1c2430, 1);

    for (const country of this.countries) {
      this.baseGfx.fillStyle(this.fillFor(country), 1);
      this.drawShapes(this.baseGfx, country);

      // Countries we can paint right now also get a blinking yellow glow
      if (this.isAvailable(country) && this.selected !== country) {
        this.pulseGfx.fillStyle(0xffdd33, 1);
        for (const points of country.shapes) this.pulseGfx.fillPoints(points, true);
      }
    }
    this.drawHover();
  }

  // A white outline around the country under the mouse
  drawHover() {
    this.hoverGfx.clear();
    const country = this.hovered;
    if (!country) return;
    this.hoverGfx.lineStyle(3, 0xffffff, 1);
    for (const points of country.shapes) this.hoverGfx.strokePoints(points, true);
  }

  // ---------------------------------------------------------------
  // Mouse
  // ---------------------------------------------------------------
  // Which country is under this position? (smallest ones are checked first)
  countryAt(x, y) {
    if (x < MAP.x || x > MAP.x + MAP.w || y < MAP.y || y > MAP.y + MAP.h) return null;
    for (let i = this.countries.length - 1; i >= 0; i--) {
      const country = this.countries[i];
      const b = country.bbox;
      if (x < b.minX || x > b.maxX || y < b.minY || y > b.maxY) continue;
      for (const points of country.shapes) {
        if (Phaser.Geom.Polygon.Contains({ points }, x, y)) return country;
      }
    }

    // Tiny countries (small islands) are almost impossible to hit with the
    // mouse, so clicking CLOSE to them counts too
    let closest = null;
    let closestDistance = 10;
    for (const country of this.countries) {
      if (!country.data.group) continue;
      const b = country.bbox;
      if (b.maxX - b.minX > 12 || b.maxY - b.minY > 12) continue; // only the small ones
      const d = Phaser.Math.Distance.Between(x, y, country.center.x, country.center.y);
      if (d < closestDistance) {
        closest = country;
        closestDistance = d;
      }
    }
    return closest;
  }

  onPointerMove(pointer) {
    if (this.finished) return;
    const country = this.countryAt(pointer.x, pointer.y);
    if (country !== this.hovered) {
      this.hovered = country;
      this.drawHover();
    }

    if (!country) {
      this.tooltip.setVisible(false);
      return;
    }
    let text = country.data.name;
    if (country.data.group && !this.progress.has(country.data.id) && !this.isAvailable(country)) {
      text += '  (todavía bloqueado)';
    }
    this.tooltip.setText(text).setVisible(true);
    // Keep the label inside the screen
    const x = Math.min(pointer.x + 14, 800 - this.tooltip.width - 4);
    this.tooltip.setPosition(x, Math.max(pointer.y - 30, 2));
  }

  onPointerDown(pointer) {
    if (this.finished) return;
    const country = this.countryAt(pointer.x, pointer.y);
    if (!country) return;

    if (this.isAvailable(country)) {
      this.selected = country;
      this.drawMap();
      this.refreshTexts();
    } else if (country.data.group && !this.progress.has(country.data.id)) {
      const current = this.currentGroup();
      this.flashMessage(current
        ? `Primero hay que colorear ${current.name}`
        : '');
    }
  }

  // A short red message that fades away (for clicks that don't work)
  flashMessage(text) {
    if (!text) return;
    const msg = this.add.text(400, 300, text, {
      fontFamily: 'Arial', fontSize: '24px', color: '#ff8888',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({
      targets: msg, alpha: 0, y: 270, duration: 1200, delay: 500,
      onComplete: () => msg.destroy(),
    });
  }

  // ---------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------
  toggleWorld() {
    if (this.finished || !this.currentGroup()) return;
    this.showWorld = !this.showWorld;
    this.hovered = null;
    this.tooltip.setVisible(false);
    this.refreshView();
  }

  onEnter() {
    if (this.finished) {
      this.leave();
    } else if (this.selected) {
      this.paintSelected();
    } else if (!this.currentGroup()) {
      this.leave();
    }
  }

  // ---------------------------------------------------------------
  // Painting a country!
  // ---------------------------------------------------------------
  paintSelected() {
    const country = this.selected;
    this.selected = null;
    this.hovered = null;
    this.tooltip.setVisible(false);
    this.progress.add(country.data.id);
    this.saveProgress();
    this.picksLeft -= 1;

    const group = GROUPS.find((g) => g.key === country.data.group);
    const groupDone = this.paintedCount(group.key) >= this.groupCountries(group.key).length;
    const next = this.currentGroup();

    // We stay on the continent while it is open; if it was just finished, the
    // view moves to the next continent right away
    this.refreshView();
    this.celebrate(country);

    // Message under the map
    const total = this.groupCountries(group.key).length;
    let info = `¡${country.data.name} ya tiene color!  (${this.paintedCount(group.key)}/${total} de ${group.name})`;
    if (groupDone && next) info = `¡${group.name} ya tiene todos sus colores!  Sigue ${next.name}`;
    if (!next) info = '¡Todo el mundo tiene color!';

    this.finished = this.picksLeft <= 0 || !next;
    this.infoText.setText(info).setColor('#66ee88');
    this.hintText.setText(this.finished ? 'ENTER: continuar' : 'Elige otro país');
  }

  // Rainbow sparkles + a big name over the painted country
  celebrate(country) {
    const x = Phaser.Math.Clamp(country.center.x, MAP.x + 60, MAP.x + MAP.w - 60);
    const y = Phaser.Math.Clamp(country.center.y, MAP.y + 20, MAP.y + MAP.h - 20);

    // Small colored square for the particles (it may not exist yet)
    if (!this.textures.exists('color-particle')) {
      const gfx = this.add.graphics();
      gfx.fillStyle(0xffffff);
      gfx.fillRect(0, 0, 6, 6);
      gfx.generateTexture('color-particle', 6, 6);
      gfx.destroy();
    }
    const emitter = this.add.particles(x, y, 'color-particle', {
      speed: { min: 80, max: 260 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.6, end: 0 },
      lifespan: 900,
      quantity: 40,
      tint: PALETTE,
      emitting: false,
    }).setDepth(40);
    emitter.explode();
    this.time.delayedCall(1200, () => emitter.destroy());

    this.cameras.main.flash(250, 255, 255, 255);

    const label = this.add.text(x, y, country.data.name, {
      fontFamily: 'Arial', fontSize: '30px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(45);
    this.tweens.add({
      targets: label, scale: 1.4, alpha: 0, y: y - 40, duration: 1400,
      ease: 'Quad.easeOut', onComplete: () => label.destroy(),
    });
  }

  // Leave the map: the victory screen comes next
  leave() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WinScene');
    });
  }
}

export default WorldMapScene;
