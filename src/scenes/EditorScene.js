// EditorScene.js — EDITOR DE NIVELES: draw your OWN level and play it!
// (from the sala, with the E key)
//
// It has two steps:
//   1) MIS NIVELES: 5 places ("slots") to keep levels. Pick one, then
//      EDITAR (or CREAR if it is empty), JUGAR or BORRAR.
//   2) The editor itself: the level is 3 screens long. Pick a tool at the top
//      (ground, platform, villains, power-ups, flag, hero start, eraser) and
//      touch the level to use it. ◀ ▶ (or the arrows, or A D) move around.
//      💾 GUARDAR keeps it, ▶ PROBAR saves it and plays it (CustomLevelScene).
//
// The levels are saved in the browser (see src/data/customLevels.js).
// We start it with no data (= MIS NIVELES) or with { slot: 2 } (= edit slot 2).

import Phaser from 'phaser';
import EnemyMR1 from '../sprites/EnemyMR1.js';
import EnemyMR2 from '../sprites/EnemyMR2.js';
import EnemyMR3 from '../sprites/EnemyMR3.js';
import Projectile from '../sprites/Projectile.js';
import { isNameChar } from '../data/profile.js';
import {
  MAX_SLOTS, LEVEL_WIDTH, TILE, COLUMNS, GROUND_Y, PLATFORM_WIDTH, NAME_MAX, ENEMY_HEIGHT,
  newLevel, loadAllLevels, loadLevel, saveLevel, deleteLevel, surfaceBelow, checkLevel,
} from '../data/customLevels.js';

// The tools of the toolbar. The number key is its place in the list (1, 2... and 0 for the 10th)
const TOOLS = [
  { id: 'suelo', icon: '🟫', name: 'SUELO', hint: 'Toca una columna para poner o quitar suelo (¡haz hoyos!). Puedes arrastrar.' },
  { id: 'plataforma', icon: '▬', name: 'PLATAF.', hint: 'Toca para poner una plataforma. Tócala otra vez para quitarla.' },
  { id: 'mr1', icon: '👾', name: 'MR.1', hint: 'MR.1 camina de un lado al otro.' },
  { id: 'mr2', icon: '🔫', name: 'MR.2', hint: 'MR.2 camina y DISPARA.' },
  { id: 'mr3', icon: '🚜', name: 'MR.3', hint: 'MR.3 en su tanque de gomas: ¡te persigue!' },
  { id: 'color-pencil', icon: '🎨', name: 'LÁPIZ', hint: 'El Lápiz de Color: para disparar colores.' },
  { id: 'shield', icon: '🛡', name: 'ESCUDO', hint: 'El escudo te protege de un golpe.' },
  { id: 'meta', icon: '🏁', name: 'META', hint: 'Toca donde quieres la bandera de la meta.' },
  { id: 'inicio', icon: '🦸', name: 'INICIO', hint: 'Toca donde empieza el héroe (¡necesita suelo debajo!).' },
  { id: 'borrar', icon: '🧽', name: 'BORRAR', hint: 'Toca algo para borrarlo.' },
];

// Things we can't have too many of (so the game doesn't get slow)
const MAX_PLATFORMS = 40;
const MAX_ENEMIES = 30;
const MAX_POWERUPS = 10;

const EDIT_TOP = 140;      // above this line is the toolbar: touching there doesn't draw
const PLATFORM_TOP = 160;  // the highest a platform can go
const SCROLL_SPEED = 10;   // pixels per frame when we move around

// Snap a number to the grid of 32 (so everything lines up nicely)
function snap(value) {
  return Math.round(value / 32) * 32;
}

class EditorScene extends Phaser.Scene {
  constructor() {
    super('EditorScene');
  }

  // data.slot = the slot to edit (no slot = MIS NIVELES), data.pick = the slot
  // that is chosen in MIS NIVELES when we come back from editing
  init(data = {}) {
    this.slot = Number.isInteger(data.slot) ? data.slot : null;
    this.picked = Number.isInteger(data.pick) ? data.pick : 0;
    this.leaving = false;
  }

  create() {
    this.cameras.main.fadeIn(250);
    if (this.slot === null) this.createSlotPicker();
    else this.createEditor();
  }

  // ===============================================================
  // STEP 1: MIS NIVELES (pick one of the 5 slots)
  // ===============================================================
  createSlotPicker() {
    this.cameras.main.setBackgroundColor('#222222');
    this.slots = loadAllLevels();
    this.confirmDelete = null; // BORRAR asks twice, so we don't delete by mistake

    this.add.text(400, 45, '🛠 EDITOR DE NIVELES', {
      fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(400, 92, 'Elige un lugar para tu nivel (teclas 1 a 5)', {
      fontFamily: 'Arial', fontSize: '18px', color: '#cccccc',
    }).setOrigin(0.5);

    // The 5 cards
    this.cards = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      const x = 100 + i * 150;
      const level = this.slots[i];
      const box = this.add.rectangle(x, 215, 136, 140, 0x333333)
        .setStrokeStyle(3, 0x777777).setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.pickSlot(i));
      this.add.text(x, 168, `${i + 1}`, {
        fontFamily: 'Arial', fontSize: '32px', fontStyle: 'bold', color: '#ffdd00',
      }).setOrigin(0.5);
      this.add.text(x, 215, level ? level.name : 'VACÍO', {
        fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold',
        color: level ? '#ffffff' : '#888888', align: 'center', wordWrap: { width: 120 },
      }).setOrigin(0.5);
      // A tiny summary: how many villains and platforms it has
      if (level) {
        this.add.text(x, 260, `👾 ${level.enemies.length}   ▬ ${level.platforms.length}`, {
          fontFamily: 'Arial', fontSize: '14px', color: '#cccccc',
        }).setOrigin(0.5);
      }
      this.cards.push(box);
    }

    // The buttons for the chosen slot
    this.editButton = this.makeButton(200, 350, 180, '', 0xffdd00, () => this.editSlot());
    this.playButton = this.makeButton(400, 350, 180, '▶ JUGAR [J]', 0x66ee88, () => this.playSlot());
    this.deleteButton = this.makeButton(600, 350, 180, '🗑 BORRAR [B]', 0xff5555, () => this.deleteSlot());
    this.makeButton(400, 430, 200, '🏠 SALA [ESC]', 0xffffff, () => this.goTo('TitleScene'));

    this.pickerMessage = this.add.text(400, 300, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffaaaa',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (event) => {
      if (/^[1-5]$/.test(event.key)) this.pickSlot(Number(event.key) - 1);
      else if (event.key === 'ArrowLeft') this.pickSlot(Math.max(0, this.picked - 1));
      else if (event.key === 'ArrowRight') this.pickSlot(Math.min(MAX_SLOTS - 1, this.picked + 1));
      else if (event.key === 'Enter' || event.code === 'KeyE') this.editSlot();
      else if (event.code === 'KeyJ') this.playSlot();
      else if (event.code === 'KeyB' || event.key === 'Delete') this.deleteSlot();
      else if (event.key === 'Escape') this.goTo('TitleScene');
    });

    this.pickSlot(this.picked);
  }

  // A slot is chosen: light up its card, and show only the buttons that make sense
  pickSlot(i) {
    this.picked = i;
    this.confirmDelete = null;
    this.pickerMessage.setText('');
    this.cards.forEach((card, n) => {
      card.setStrokeStyle(n === i ? 5 : 3, n === i ? 0xffdd00 : 0x777777);
      card.setFillStyle(n === i ? 0x444444 : 0x333333);
    });
    const hasLevel = this.slots[i] !== null;
    this.editButton.label.setText(hasLevel ? '✏ EDITAR [E]' : '✨ CREAR [E]');
    // An empty slot can't be played or deleted
    [this.playButton, this.deleteButton].forEach((button) => {
      button.setVisible(hasLevel);
      button.label.setVisible(hasLevel);
    });
  }

  editSlot() {
    this.goTo('EditorScene', { slot: this.picked });
  }

  playSlot() {
    const level = this.slots[this.picked];
    if (!level) return;
    const problem = checkLevel(level);
    if (problem) {
      this.pickerMessage.setText(problem);
      return;
    }
    this.goTo('CustomLevelScene', { slot: this.picked });
  }

  deleteSlot() {
    const level = this.slots[this.picked];
    if (!level) return;
    // The first time we only ask: "are you sure?"
    if (this.confirmDelete !== this.picked) {
      this.confirmDelete = this.picked;
      this.pickerMessage.setText(`¿Borrar "${level.name}"? Toca 🗑 BORRAR otra vez para borrarlo`);
      return;
    }
    deleteLevel(this.picked);
    // Draw MIS NIVELES again, with this slot empty
    this.scene.restart({ pick: this.picked });
  }

  // ===============================================================
  // STEP 2: THE EDITOR
  // ===============================================================
  createEditor() {
    // The saved level, or a new one if the slot is empty
    this.level = loadLevel(this.slot) || newLevel(this.slot);
    this.dirty = false;        // are there changes that are not saved yet?
    this.confirmExit = false;  // SALIR asks twice when there are changes
    this.tool = 'suelo';
    this.typing = false;       // are we writing the name of the level?
    this.scrollDir = 0;        // -1 / 0 / 1 while ◀ or ▶ is held down

    // The villains' and power-ups' pictures are made when they are first needed
    if (!this.textures.exists('enemy-mr1')) EnemyMR1.createTexture(this);
    if (!this.textures.exists('enemy-mr2')) EnemyMR2.createTexture(this);
    if (!this.textures.exists('enemy-mr3')) EnemyMR3.createTexture(this);
    Projectile.createPowerupTextures(this);

    // The camera only moves left and right, over the 3 screens of the level
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, 600);
    this.cameras.main.setBackgroundColor('#666666');
    this.drawGrid();

    // Everything in the level is drawn here (and drawn again after every change)
    this.levelObjects = [];
    this.createToolbar();
    this.createScrollButtons();
    this.createMiniMap();
    this.redraw();
    this.selectTool('suelo');

    // Touching the level uses the tool (but not when touching a button)
    this.input.on('pointerdown', (pointer, over) => {
      if (over.length > 0) return;
      if (this.typing) this.stopTyping();
      if (pointer.y < EDIT_TOP) return;
      this.useTool(pointer.worldX, pointer.worldY);
    });
    // Dragging with the ground tool paints (or erases) many columns at once
    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown || this.tool !== 'suelo' || this.groundPaint === undefined) return;
      if (pointer.y < EDIT_TOP) return;
      this.setGround(Math.floor(pointer.worldX / TILE), this.groundPaint);
    });
    this.input.on('pointerup', () => { this.groundPaint = undefined; this.scrollDir = 0; });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey('A', false);
    this.keyD = this.input.keyboard.addKey('D', false);
    this.input.keyboard.on('keydown', (event) => this.onKeyDown(event));

    // If we leave while writing the name, close the small keyboard of the touch screens
    this.events.once('shutdown', () => {
      if (this.typing) window.dispatchEvent(new Event('hacks-cerrados'));
    });
  }

  // The squares of the grid, so it is easy to line things up
  drawGrid() {
    const gfx = this.add.graphics().setDepth(-5);
    for (let x = 0; x <= LEVEL_WIDTH; x += 32) {
      // Every 64px (one ground block) the line is a bit stronger
      gfx.lineStyle(1, 0xffffff, x % 64 === 0 ? 0.15 : 0.06);
      gfx.lineBetween(x, EDIT_TOP, x, 600);
    }
    for (let y = 600 - 32; y >= EDIT_TOP; y -= 32) {
      gfx.lineStyle(1, 0xffffff, 0.06);
      gfx.lineBetween(0, y, LEVEL_WIDTH, y);
    }
  }

  // --- The toolbar at the top (it doesn't move with the camera) ---
  createToolbar() {
    this.fixed(this.add.rectangle(400, EDIT_TOP / 2, 800, EDIT_TOP, 0x111111, 0.9).setDepth(99));

    // The name of the level: touch it to write a new one
    this.nameBox = this.fixed(this.add.rectangle(140, 24, 240, 36, 0x333333)
      .setStrokeStyle(2, 0x999999).setInteractive({ useHandCursor: true }));
    this.nameBox.on('pointerdown', () => (this.typing ? this.stopTyping() : this.startTyping()));
    this.nameText = this.fixed(this.add.text(140, 24, '', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5));
    this.updateName();

    // (The top right corner stays empty: on phones the ESC / OK buttons are there)
    this.makeButton(340, 24, 130, '💾 GUARDAR', 0x66aaff, () => this.save(), true);
    this.makeButton(480, 24, 130, '▶ PROBAR', 0x66ee88, () => this.tryLevel(), true);
    this.makeButton(610, 24, 110, '🏠 SALIR', 0xffffff, () => this.exitEditor(), true);

    // The 10 tools
    this.toolButtons = {};
    TOOLS.forEach((tool, i) => {
      const x = 58 + i * 76;
      const box = this.fixed(this.add.rectangle(x, 70, 70, 44, 0x333333)
        .setStrokeStyle(2, 0x777777).setInteractive({ useHandCursor: true }));
      box.on('pointerdown', () => this.selectTool(tool.id));
      // A big picture and its name under it
      this.fixed(this.add.text(x, 62, tool.icon, { fontSize: '20px' }).setOrigin(0.5));
      this.fixed(this.add.text(x, 83, tool.name, {
        fontFamily: 'Arial', fontSize: '11px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5));
      // The number key of the tool, small in the corner
      this.fixed(this.add.text(x - 32, 50, `${(i + 1) % 10}`, {
        fontFamily: 'Arial', fontSize: '10px', color: '#aaaaaa',
      }));
      this.toolButtons[tool.id] = box;
    });

    // What the chosen tool does
    this.hintText = this.fixed(this.add.text(400, 124, '', {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffdd88',
    }).setOrigin(0.5));
  }

  // ◀ ▶ on the sides: hold them down to move around the level
  createScrollButtons() {
    [[-1, 34, '◀'], [1, 766, '▶']].forEach(([dir, x, label]) => {
      const button = this.fixed(this.add.circle(x, 330, 26, 0x000000, 0.5)
        .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true }));
      this.fixed(this.add.text(x, 330, label, {
        fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
      }).setOrigin(0.5));
      button.on('pointerdown', () => { this.scrollDir = dir; });
      button.on('pointerout', () => { this.scrollDir = 0; });
    });
  }

  // A small map of the whole level, with a box that shows the part we see.
  // Touch it to jump to that part.
  createMiniMap() {
    this.mapX = 150;
    this.mapWidth = 500;
    this.mapScale = this.mapWidth / LEVEL_WIDTH;
    const area = this.fixed(this.add.rectangle(400, 102, this.mapWidth, 14, 0x000000, 0.6)
      .setInteractive({ useHandCursor: true }));
    area.on('pointerdown', (pointer) => {
      const worldX = (pointer.x - this.mapX) / this.mapScale;
      this.cameras.main.scrollX = Phaser.Math.Clamp(worldX - 400, 0, LEVEL_WIDTH - 800);
    });
    this.miniMap = this.fixed(this.add.graphics());
    this.miniView = this.fixed(this.add.rectangle(0, 102, 800 * this.mapScale, 18)
      .setStrokeStyle(2, 0xffdd00).setOrigin(0, 0.5));
  }

  // Make a UI thing stay still on the screen (not move with the camera), on top of everything
  fixed(object) {
    return object.setScrollFactor(0).setDepth(100);
  }

  // A button: a box with a word. (fixed = it stays on the screen while the camera moves)
  makeButton(x, y, width, label, color, onClick, fixed = false) {
    const box = this.add.rectangle(x, y, width, fixed ? 36 : 48, 0x222222)
      .setStrokeStyle(3, color).setInteractive({ useHandCursor: true });
    box.on('pointerdown', onClick);
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial', fontSize: fixed ? '16px' : '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    if (fixed) {
      this.fixed(box);
      this.fixed(text);
    }
    // The box remembers its word, so we can change it or hide it too
    box.label = text;
    return box;
  }

  selectTool(id) {
    this.tool = id;
    Object.entries(this.toolButtons).forEach(([toolId, box]) => {
      const on = toolId === id;
      box.setStrokeStyle(on ? 4 : 2, on ? 0xffdd00 : 0x777777);
      box.setFillStyle(on ? 0x665500 : 0x333333);
    });
    this.hintText.setText(TOOLS.find((t) => t.id === id).hint);
  }

  // --- Using the tools ---
  useTool(x, y) {
    const level = this.level;
    x = Phaser.Math.Clamp(x, 0, LEVEL_WIDTH - 1);

    if (this.tool === 'suelo') {
      // Touching a column turns its ground on or off. If we drag, the other
      // columns get the same (all on, or all off)
      const column = Math.floor(x / TILE);
      this.groundPaint = !level.ground[column];
      this.setGround(column, this.groundPaint);
      return;
    }

    if (this.tool === 'plataforma') {
      // Touching a platform takes it away; touching the air puts a new one
      const touched = this.platformAt(x, y);
      if (touched) {
        Phaser.Utils.Array.Remove(level.platforms, touched);
      } else {
        if (level.platforms.length >= MAX_PLATFORMS) return this.showMessage('¡Ya hay muchas plataformas!');
        level.platforms.push({
          x: Phaser.Math.Clamp(snap(x) - PLATFORM_WIDTH / 2, 0, LEVEL_WIDTH - PLATFORM_WIDTH),
          y: Phaser.Math.Clamp(snap(y), PLATFORM_TOP, GROUND_Y - 64),
        });
      }
      return this.changed();
    }

    if (this.tool === 'mr1' || this.tool === 'mr2' || this.tool === 'mr3') {
      if (level.enemies.length >= MAX_ENEMIES) return this.showMessage('¡Ya hay muchos villanos!');
      const ex = Phaser.Math.Clamp(snap(x), 32, LEVEL_WIDTH - 32);
      level.enemies.push({ type: this.tool, x: ex, y: this.standY(ex, y, ENEMY_HEIGHT[this.tool]) });
      return this.changed();
    }

    if (this.tool === 'color-pencil' || this.tool === 'shield') {
      if (level.powerups.length >= MAX_POWERUPS) return this.showMessage('¡Ya hay muchos poderes!');
      level.powerups.push({
        type: this.tool,
        x: Phaser.Math.Clamp(snap(x), 32, LEVEL_WIDTH - 32),
        y: Phaser.Math.Clamp(snap(y), PLATFORM_TOP, GROUND_Y - 32),
      });
      return this.changed();
    }

    if (this.tool === 'meta') {
      const gx = Phaser.Math.Clamp(snap(x), 40, LEVEL_WIDTH - 40);
      level.goal = { x: gx, y: this.standY(gx, y, 72) };
      return this.changed();
    }

    if (this.tool === 'inicio') {
      const hx = Phaser.Math.Clamp(snap(x), 32, LEVEL_WIDTH - 32);
      level.heroStart = { x: hx, y: this.standY(hx, y, 48) };
      // Tell right away if there is no floor under the hero
      if (checkLevel(level)) this.showMessage('¡Cuidado! Debajo del héroe hay un hoyo');
      return this.changed();
    }

    if (this.tool === 'borrar') this.eraseAt(x, y);
  }

  // Where should something of this height stand, if we touch (x, y)?
  // On the first floor below the finger. If there is none (a pit), right where we touched.
  standY(x, y, height) {
    const floor = surfaceBelow(this.level, x, y);
    if (floor === null) return Phaser.Math.Clamp(snap(y), EDIT_TOP + height / 2, 600 - height / 2);
    return floor - height / 2;
  }

  // Turn the ground of one column on or off
  setGround(column, on) {
    if (column < 0 || column >= COLUMNS || this.level.ground[column] === on) return;
    this.level.ground[column] = on;
    this.changed();
  }

  // The floating platform under (x, y), or undefined
  platformAt(x, y) {
    return this.level.platforms.find((p) => x >= p.x && x < p.x + PLATFORM_WIDTH &&
      y >= p.y - 16 && y <= p.y + 40);
  }

  // The eraser: the closest villain or power-up, then a platform, then the ground
  eraseAt(x, y) {
    const level = this.level;
    const near = (thing) => Phaser.Math.Distance.Between(x, y, thing.x, thing.y) < 40;
    const enemy = level.enemies.find(near);
    const powerup = level.powerups.find(near);
    const platform = this.platformAt(x, y);
    const column = Math.floor(x / TILE);

    if (enemy) Phaser.Utils.Array.Remove(level.enemies, enemy);
    else if (powerup) Phaser.Utils.Array.Remove(level.powerups, powerup);
    else if (platform) Phaser.Utils.Array.Remove(level.platforms, platform);
    else if (y >= GROUND_Y - 8 && level.ground[column]) level.ground[column] = false;
    else if (near(level.goal) || near(level.heroStart)) {
      return this.showMessage('La meta y el héroe no se borran: muévelos con 🏁 y 🦸');
    } else return this.showMessage('Aquí no hay nada para borrar');
    this.changed();
  }

  // Something changed: draw again, and remember that it is not saved
  changed() {
    this.dirty = true;
    this.confirmExit = false;
    this.redraw();
  }

  // Draw the whole level again (it is small, so this is fast enough)
  redraw() {
    this.levelObjects.forEach((obj) => obj.destroy());
    this.levelObjects = [];
    const add = (obj) => { this.levelObjects.push(obj); return obj; };
    const level = this.level;

    level.ground.forEach((hasGround, column) => {
      if (hasGround) add(this.add.image(column * TILE + TILE / 2, GROUND_Y + 32, 'ground-tile'));
      // A pit gets a warning sign, so it is easy to see
      else add(this.add.text(column * TILE + TILE / 2, 584, '⚠', { fontSize: '20px' }).setOrigin(0.5));
    });
    level.platforms.forEach((p) => {
      add(this.add.image(p.x + 32, p.y + 12, 'platform-tile'));
      add(this.add.image(p.x + 96, p.y + 12, 'platform-tile'));
    });
    level.powerups.forEach((p) => add(this.add.image(p.x, p.y, `powerup-${p.type}`).setDepth(2)));
    level.enemies.forEach((e) => add(this.add.image(e.x, e.y, `enemy-${e.type}`).setDepth(3)));
    add(this.add.image(level.goal.x, level.goal.y, 'goal-flag').setDepth(2));
    add(this.add.image(level.heroStart.x, level.heroStart.y, 'hero').setDepth(4));

    this.drawMiniMap();
  }

  drawMiniMap() {
    const gfx = this.miniMap;
    const s = this.mapScale;
    gfx.clear();
    // Ground (brown) and platforms (gray)
    gfx.fillStyle(0x996633);
    this.level.ground.forEach((hasGround, column) => {
      if (hasGround) gfx.fillRect(this.mapX + column * TILE * s, 104, TILE * s, 4);
    });
    gfx.fillStyle(0xcccccc);
    this.level.platforms.forEach((p) => {
      gfx.fillRect(this.mapX + p.x * s, 96 + (p.y - 160) / 60, PLATFORM_WIDTH * s, 2);
    });
    // Villains (red), the hero (green) and the goal (yellow)
    gfx.fillStyle(0xff4444);
    this.level.enemies.forEach((e) => gfx.fillRect(this.mapX + e.x * s - 1, 99, 2, 4));
    gfx.fillStyle(0x44ff44);
    gfx.fillRect(this.mapX + this.level.heroStart.x * s - 2, 97, 4, 8);
    gfx.fillStyle(0xffdd00);
    gfx.fillRect(this.mapX + this.level.goal.x * s - 2, 97, 4, 8);
  }

  // --- Writing the name of the level ---
  startTyping() {
    this.typing = true;
    this.nameBox.setStrokeStyle(3, 0xffdd00);
    this.updateName();
    // On phones and tablets the small keyboard opens by itself
    window.dispatchEvent(new Event('hacks-abiertos'));
  }

  stopTyping() {
    this.typing = false;
    // An empty name gets the normal name back
    if (this.level.name.trim() === '') this.level.name = `Mi nivel ${this.slot + 1}`;
    this.level.name = this.level.name.trim();
    this.nameBox.setStrokeStyle(2, 0x999999);
    this.updateName();
    window.dispatchEvent(new Event('hacks-cerrados'));
  }

  updateName() {
    // A blinking-like "|" shows that we are writing
    this.nameText.setText(this.typing ? `${this.level.name}|` : `✏ ${this.level.name}`);
  }

  onKeyDown(event) {
    if (this.leaving) return;
    if (this.typing) {
      if (event.key === 'Enter' || event.key === 'Escape') this.stopTyping();
      else if (event.key === 'Backspace') this.level.name = this.level.name.slice(0, -1);
      else if (event.key.length === 1 && isNameChar(event.key) && this.level.name.length < NAME_MAX) {
        this.level.name += event.key;
      } else return;
      this.dirty = true;
      this.updateName();
      return;
    }
    // Number keys choose a tool: 1 = the first ... 9, and 0 = the 10th
    if (/^[0-9]$/.test(event.key)) {
      const index = (Number(event.key) + 9) % 10;
      this.selectTool(TOOLS[index].id);
    } else if (event.key === 'Escape') this.exitEditor();
  }

  // --- The buttons at the top ---
  save() {
    if (this.typing) this.stopTyping();
    if (saveLevel(this.slot, this.level)) {
      this.dirty = false;
      this.showMessage('¡Guardado! 💾', '#66ee88');
      return true;
    }
    this.showMessage('No se pudo guardar en este navegador 😢');
    return false;
  }

  // PROBAR: check that it can be played, save it, and play it!
  tryLevel() {
    const problem = checkLevel(this.level);
    if (problem) return this.showMessage(problem);
    if (this.save()) this.goTo('CustomLevelScene', { slot: this.slot });
  }

  // SALIR: back to MIS NIVELES. With changes not saved, it asks first
  exitEditor() {
    if (this.typing) this.stopTyping();
    if (this.dirty && !this.confirmExit) {
      this.confirmExit = true;
      this.showMessage('¡No guardaste! Toca 💾 GUARDAR, o 🏠 SALIR otra vez para salir sin guardar');
      return;
    }
    this.goTo('EditorScene', { pick: this.slot });
  }

  // A message in the middle of the screen for a moment
  showMessage(message, color = '#ffaaaa') {
    if (this.messageText) this.messageText.destroy();
    this.messageText = this.fixed(this.add.text(400, 200, message, {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color,
      stroke: '#000000', strokeThickness: 5, align: 'center', wordWrap: { width: 640 },
    }).setOrigin(0.5).setDepth(150));
    this.tweens.add({ targets: this.messageText, alpha: 0, delay: 2200, duration: 500 });
  }

  update() {
    if (this.slot === null) return;
    // Move around the level: ◀ ▶ buttons, the arrows, or A and D
    let dir = this.scrollDir;
    if (!this.typing) {
      if (this.cursors.left.isDown || this.keyA.isDown) dir = -1;
      if (this.cursors.right.isDown || this.keyD.isDown) dir = 1;
    }
    const cam = this.cameras.main;
    if (dir !== 0) cam.scrollX = Phaser.Math.Clamp(cam.scrollX + dir * SCROLL_SPEED, 0, LEVEL_WIDTH - 800);
    this.miniView.x = this.mapX + cam.scrollX * this.mapScale;
  }

  goTo(sceneName, data) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Going to the EditorScene again (MIS NIVELES ↔ the editor) = start this same scene again
      if (sceneName === 'EditorScene') this.scene.restart(data);
      else this.scene.start(sceneName, data);
    });
  }
}

export default EditorScene;
