// HideSeekScene.js — ESCONDIDAS! (from the sala: the ESCONDIDAS button, or H)
// Hide and seek in the map of level 1, full of bushes, boxes and trash cans.
// It is played in TURNS, on the whole screen (like real hide and seek):
//   1. One player HIDES: walk to a bush, a box or a trash can and press ↓ (or Z)
//      to get inside. Meanwhile the other player CLOSES THEIR EYES! 🙈
//   2. The other player SEEKS: press ↓ (or Z) next to a hiding place to look
//      inside. From time to time the hiding place moves a little... a clue!
//   3. Then they switch. The one who found the other one FASTER wins.
// OFFLINE = two players taking turns on this screen (the same keys for both).
// MÁQUINA = the machine hides first and we seek; then we hide and it seeks
// (we see it as a ghost 🤖 flying from place to place, see HideBot in Bot.js).
//
// This scene is a copy of the normal level (LevelScene) with some changes:
// no villains, no coins, the hiding places, and its own clock with the turns.

import Phaser from 'phaser';
import LevelScene from './LevelScene.js';
import Hero from '../sprites/Hero.js';
import { levels } from '../data/levels.js';
import { pencilSpots } from './SearchLevelScene.js';
import { HideBot } from '../online/Bot.js';
import { loadProfile } from '../data/profile.js';
import { addCoins, makeCoinTexture } from '../data/coins.js';
import { reportMission } from '../data/missions.js';
import { playSound } from '../audio/Sound.js';
import { forgetWeather } from '../managers/WeatherManager.js';

const HIDE_TIME = 20;      // seconds to hide
const SEEK_TIME = 45;      // seconds to find the one who hid
const CLUE_EVERY = 10;     // every 10 seconds the hiding place moves a little (a clue!)
const HIDING_PLACES = 14;  // how many bushes, boxes and trash cans there are
const NEAR = 42;           // how close we must be to a hiding place to use it
const KINDS = ['arbusto', 'caja', 'tacho'];
const COIN_PRIZES = { facil: 5, normal: 10, dificil: 20 };

class HideSeekScene extends LevelScene {
  constructor() {
    super('HideSeekScene');
  }

  // data.how = 'dos' (two players taking turns) or 'maquina'; data.level = how good the machine is
  init(data) {
    this.how = data.how === 'maquina' ? 'maquina' : 'dos';
    this.level = data.level || 'normal';
    this.startData = data;
    // Alone on the screen, with the normal keys (both players use the same ones: they take turns)
    super.init({
      levelIndex: 0,
      race: {
        player: 1, controls: 'normal', full: true,
        help: '← → Mover  |  ↑ Saltar  |  ↓ o Z: esconderse / buscar', shootKey: 'Z',
      },
    });
  }

  chooseLevelData() {
    return levels[0];
  }

  // Our own clock decides when the heroes can move, and we have our own machine
  raceStarted() {
    return this.moving;
  }

  raceBot() {
    return null;
  }

  create() {
    // Phaser reuses this scene object every game: forget the last game's things
    this.hero2 = null;
    this.bot = null;
    this.botGhost = null;
    this.moving = false;
    this.leaving = false;
    this.ended = false;
    // A new weather every game (at night, the one who seeks carries a flashlight!)
    forgetWeather(this.registry, 'carrera:');
    super.create();

    // No villains, no coins, no goal and no power-ups: this is about hiding!
    this.enemies.clear(true, true);
    this.coins.clear(true, true);
    this.powerupManager.getGroup().clear(true, true);
    this.goalFlag.setVisible(false);
    this.goalFlag.body.enable = false;
    this.hud.levelText.setText('🙈 ESCONDIDAS');

    // The two players. With the machine, the second one is the machine (it has no hero)
    const me = loadProfile();
    this.players = this.how === 'maquina'
      ? [{ name: me ? me.name : 'TÚ', color: '#44aaff' }, { name: '🤖 MÁQUINA', color: '#ff9933', bot: true }]
      : [{ name: 'JUGADOR 1', color: '#44aaff' }, { name: 'JUGADOR 2', color: '#ff9933' }];
    this.allHeroes = [this.hero];
    if (this.how === 'dos') this.createPlayerTwoHero();
    this.allHeroes.forEach((hero) => {
      hero.hasColorGun = false;
      hero.keys.shoot = []; // Z and ↓ are for hiding and seeking here, not for shooting
    });

    this.actionKeys = ['Z', 'X', 'S', 'DOWN'].map((k) => this.input.keyboard.addKey(k));
    this.createHidingPlaces();
    this.createScreenTexts();

    // The turns: who hides and who seeks. Against the machine, the machine hides first
    this.rounds = [{ hider: 1, seeker: 0 }, { hider: 0, seeker: 1 }];
    if (this.how === 'dos') this.rounds.reverse();
    this.roundIndex = 0;
    // How long each player took to find the other one (null = not yet)
    this.results = [null, null];

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('TitleScene');
      else if (event.key === 'Enter' && this.ended) this.goTo('TitleScene');
      else if (event.key === 'Enter' && this.phase === 'hide' && this.hidden) this.endHiding();
      else if (event.code === 'KeyR' && this.ended) this.goTo('HideSeekScene');
    });

    this.startRound();
  }

  // OFFLINE: player 2 is the normal hero, a bit orange so we can tell them apart
  createPlayerTwoHero() {
    this.hero2 = new Hero(this, this.levelData.heroStart.x, this.levelData.heroStart.y, 'normal', { skin: null, cosmetics: false });
    this.hero2.baseTint = 0xffcc99;
    this.hero2.setTint(this.hero2.baseTint);
    this.hero2.keys.run = [];
    this.hero2.slippery = this.hero.slippery; // the snow is slippery for both
    this.physics.add.collider(this.hero2, this.platforms);
    this.allHeroes.push(this.hero2);
  }

  // Bushes, boxes and trash cans, in shuffled places all over the map
  createHidingPlaces() {
    const spots = pencilSpots(this.levelData);
    Phaser.Utils.Array.Shuffle(spots);
    this.places = spots.slice(0, HIDING_PLACES).map((spot, i) => {
      const kind = KINDS[i % KINDS.length];
      const bottom = spot.y + 26; // the top of the floor or the platform
      const image = this.add.image(spot.x, bottom, hidingTexture(this, kind)).setOrigin(0.5, 1).setDepth(5);
      return { x: spot.x, bottom, y: bottom - 24, kind, image, checked: false };
    });
    // The words over the hiding place that is close to us ("↓ esconderse")
    this.placeHint = this.add.text(0, 0, '', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 1).setDepth(60).setVisible(false);
  }

  // The clock and the big messages at the top
  createScreenTexts() {
    this.clockText = this.add.text(400, 40, '', {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    this.infoText = this.add.text(400, 78, '', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffdd33',
      stroke: '#000000', strokeThickness: 4, align: 'center',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    // A black curtain over everything, for the "close your eyes" moments
    this.curtain = this.add.rectangle(400, 300, 800, 600, 0x000000).setScrollFactor(0).setDepth(300).setVisible(false);
    this.curtainText = this.add.text(400, 300, '', {
      fontFamily: 'Arial', fontSize: '32px', fontStyle: 'bold', color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);
  }

  // ---------------------------------------------------------------
  // The turns
  // ---------------------------------------------------------------
  startRound() {
    const round = this.rounds[this.roundIndex];
    this.hider = this.players[round.hider];
    this.seeker = this.players[round.seeker];
    this.hiderIndex = round.hider;
    this.seekerIndex = round.seeker;
    this.places.forEach((place) => {
      place.checked = false;
      place.image.clearTint();
      if (place.mark) place.mark.destroy();
      place.mark = null;
    });
    this.hidden = false;
    this.hidingPlace = null;
    this.hiderHero = this.hider.bot ? null : this.allHeroes[round.hider];
    this.seekerHero = this.seeker.bot ? null : this.allHeroes[round.seeker];

    if (this.hider.bot) {
      // The machine hides by itself, while we can't look
      this.useHero(null);
      this.hidingPlace = Phaser.Utils.Array.GetRandom(this.places);
      this.hidden = true;
      this.showCurtain('🤖 La máquina se está escondiendo...\n¡No mires! 🙈', 2500, () => this.startSeeking());
      return;
    }
    // A player hides: the other one closes their eyes
    const text = this.seeker.bot
      ? `¡${this.hider.name}, escóndete!\nLa máquina no mira 🙈`
      : `${this.hider.name} se esconde\n\n¡${this.seeker.name},\ncierra los ojos! 🙈`;
    this.showCurtain(text, 3000, () => this.startHiding());
  }

  // The black curtain with a message, for a moment
  showCurtain(text, time, then) {
    this.moving = false;
    this.phase = 'curtain';
    this.placeHint.setVisible(false);
    this.curtain.setVisible(true);
    this.curtainText.setText(text).setVisible(true);
    this.time.delayedCall(time, () => {
      this.curtain.setVisible(false);
      this.curtainText.setVisible(false);
      then();
    });
  }

  // HIDING: the hider walks to a hiding place and gets in
  startHiding() {
    this.phase = 'hide';
    this.phaseTime = HIDE_TIME;
    const hero = this.hiderHero;
    hero.setPosition(this.levelData.heroStart.x, this.levelData.heroStart.y);
    hero.setVelocity(0, 0);
    this.useHero(hero);
    this.moving = true;
    this.infoText.setText(`${this.hider.name}: ¡escóndete en un arbusto, una caja o un tacho! (↓ o Z)`);
    playSound('ya');
  }

  // We pressed ↓ next to a hiding place while hiding: in we go (or out again, to change places)
  hideInPlace(place) {
    const hero = this.hiderHero;
    if (this.hidden) {
      // Out again: we want another place
      this.hidden = false;
      this.hidingPlace = null;
      hero.setPosition(place.x, place.y);
      hero.setVisible(true);
      hero.body.enable = true;
      this.infoText.setText(`${this.hider.name}: ¡escóndete! (↓ o Z)`);
      return;
    }
    this.hidden = true;
    this.hidingPlace = place;
    hero.setVelocity(0, 0);
    hero.body.enable = false;
    // The hero jumps inside, and the hiding place shakes a little
    this.tweens.add({
      targets: hero, x: place.x, y: place.y, scale: 0.4, duration: 250,
      onComplete: () => { hero.setVisible(false); hero.setScale(1); },
    });
    this.wiggle(place);
    playSound('moneda');
    this.infoText.setText('¡Escondido! ENTER (OK) = ¡listo!   ·   ↓ o Z = salir');
  }

  // Time is up (or we pressed ENTER): now the other one seeks
  endHiding() {
    if (this.phase !== 'hide') return;
    this.moving = false;
    if (!this.hidden) {
      // Didn't hide in time: we stay where we are... easy to find!
      this.hiderHero.setVelocity(0, 0);
      this.hiderHero.body.enable = false;
    }
    const text = this.seeker.bot
      ? '🤖 ¡La máquina empieza a buscarte!'
      : `${this.seeker.name}:\n¡abre los ojos y busca\na ${this.hider.name}! 👀`;
    this.showCurtain(text, 2500, () => this.startSeeking());
  }

  // SEEKING: look inside the hiding places until we find the hider
  startSeeking() {
    this.phase = 'seek';
    this.phaseTime = SEEK_TIME;
    this.seekTime = 0;
    this.nextClue = CLUE_EVERY;
    // The one who hid can't be seen (unless they didn't hide in time)
    if (this.hiderHero) this.hiderHero.setVisible(!this.hidden);

    if (this.seeker.bot) {
      // The machine seeks: we watch its ghost
      this.bot = new HideBot(this.level, this.places, this.levelData.heroStart);
      this.createBotGhost();
      this.useHero(null);
      this.cameras.main.startFollow(this.botGhost, true, 0.1, 0.1);
      this.heroes = [this.botGhost]; // (at night the flashlight follows the ghost)
      this.infoText.setText('🤖 La máquina te está buscando...');
    } else {
      const hero = this.seekerHero;
      hero.setPosition(this.levelData.heroStart.x, this.levelData.heroStart.y);
      hero.setVelocity(0, 0);
      this.useHero(hero, this.hiderHero && !this.hidden ? this.hiderHero : null);
      this.infoText.setText(`${this.seeker.name}: busca a ${this.hider.name} (↓ o Z para mirar)`);
    }
    this.moving = true;
    playSound('ya');
  }

  // Only ONE hero moves at a time (and the camera follows it).
  // "alsoShow" = a hero that stays still where it is, but can be seen
  useHero(hero, alsoShow = null) {
    this.allHeroes.forEach((h) => {
      const on = h === hero;
      h.setVisible(on || h === alsoShow);
      h.body.enable = on;
    });
    this.heroes = hero ? [hero] : [];
    if (hero) {
      this.hero = hero;
      this.cameras.main.startFollow(hero, true, 0.1, 0.1);
    }
  }

  // The machine's ghost: a see-through hero with a 🤖 on top
  createBotGhost() {
    if (this.botGhost) this.botGhost.destroy();
    const body = this.add.image(0, 0, 'hero').setTint(0x99ddff);
    const tag = this.add.text(0, -36, '🤖', { fontSize: '18px' }).setOrigin(0.5);
    this.botGhost = this.add.container(this.bot.x, this.bot.y, [body, tag]).setAlpha(0.6).setDepth(6);
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.ended || !this.moving) return;

    // The clock
    this.phaseTime -= delta / 1000;
    this.clockText.setText(`⏱ ${Math.max(0, Math.ceil(this.phaseTime))}`);
    if (this.phase === 'hide') {
      this.updateHiding();
      if (this.phaseTime <= 0) this.endHiding();
    } else if (this.phase === 'seek') {
      this.seekTime += delta / 1000;
      this.giveClues();
      if (this.seeker.bot) this.updateBot(delta / 1000);
      else this.updateSeeking();
      if (this.phase === 'seek' && this.phaseTime <= 0) this.notFound();
    }
  }

  // The hiding place that is close to the hero (or null)
  placeNear(hero) {
    return this.places.find((p) => Math.abs(hero.x - p.x) < NEAR && Math.abs(hero.body.bottom - p.bottom) < 30) || null;
  }

  actionPressed() {
    return this.actionKeys.some((key) => Phaser.Input.Keyboard.JustDown(key));
  }

  // Show "↓ esconderse" (or "↓ mirar") over the hiding place next to us
  showHint(place, words) {
    this.placeHint.setVisible(Boolean(place));
    if (place) this.placeHint.setText(words).setPosition(place.x, place.bottom - 58);
  }

  updateHiding() {
    const pressed = this.actionPressed();
    if (this.hidden) {
      this.showHint(null);
      if (pressed) this.hideInPlace(this.hidingPlace);
      return;
    }
    const place = this.placeNear(this.hiderHero);
    this.showHint(place, '↓ esconderse');
    if (place && pressed) this.hideInPlace(place);
  }

  updateSeeking() {
    const hero = this.seekerHero;
    // The hider didn't hide in time: just touch them!
    if (!this.hidden && Phaser.Math.Distance.Between(hero.x, hero.y, this.hiderHero.x, this.hiderHero.y) < 40) {
      this.found();
      return;
    }
    const place = this.placeNear(hero);
    this.showHint(place && !place.checked ? place : null, '↓ mirar');
    if (place && !place.checked && this.actionPressed()) this.lookInside(place);
  }

  // Look inside a hiding place: is somebody there?
  lookInside(place) {
    this.wiggle(place);
    if (this.hidden && place === this.hidingPlace) {
      this.found();
      return;
    }
    place.checked = true;
    place.image.setTint(0x777777);
    place.mark = this.add.text(place.x, place.bottom - 30, '✗', {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#ff5555', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(6);
    playSound('lapizMalo');
    this.showFloatingText(place.x, place.bottom - 60, '¡Aquí no hay nadie!');
  }

  // The machine seeks: it flies from place to place
  updateBot(seconds) {
    const result = this.bot.update(seconds, this.hidden ? this.hidingPlace : null, this.hiderHero);
    this.botGhost.setPosition(this.bot.x, this.bot.y);
    if (result && result.looked) {
      const place = result.looked;
      this.wiggle(place);
      if (!(this.hidden && place === this.hidingPlace)) {
        place.checked = true;
        place.image.setTint(0x777777);
      }
    }
    if (result && result.found) this.found();
  }

  // Every 10 seconds the hiding place moves a little: a clue for the seeker!
  giveClues() {
    if (!this.hidden || this.seekTime < this.nextClue) return;
    this.nextClue += CLUE_EVERY;
    this.wiggle(this.hidingPlace);
    this.showFloatingText(this.hidingPlace.x, this.hidingPlace.bottom - 60, 'ji ji');
  }

  // A hiding place shakes from side to side
  wiggle(place) {
    this.tweens.add({ targets: place.image, angle: { from: -8, to: 8 }, duration: 80, yoyo: true, repeat: 3, onComplete: () => place.image.setAngle(0) });
  }

  // FOUND! The hider jumps out
  found() {
    this.endSeeking(true);
    playSound('lapizBueno');
    const where = this.hidden ? this.hidingPlace : this.hiderHero;
    this.showFloatingText(where.x, (where.bottom || where.y) - 70, '¡TE ENCONTRÉ!');
    this.powerupManager.spawnCollectParticles(where.x, where.y);
  }

  // Time is up: the hider wins this turn, and shows where they were
  notFound() {
    this.endSeeking(false);
    playSound('perder');
    const where = this.hidden ? this.hidingPlace : this.hiderHero;
    this.showFloatingText(where.x, (where.bottom || where.y) - 70, '¡Estaba aquí!');
  }

  endSeeking(wasFound) {
    this.phase = 'done';
    this.moving = false;
    this.placeHint.setVisible(false);
    this.results[this.seekerIndex] = { found: wasFound, seconds: Math.min(SEEK_TIME, Math.ceil(this.seekTime)) };
    // The hider comes out of the hiding place
    if (this.hiderHero) {
      const hero = this.hiderHero;
      if (this.hidden) hero.setPosition(this.hidingPlace.x, this.hidingPlace.y);
      hero.setVisible(true);
      if (this.seeker.bot) this.cameras.main.startFollow(hero, true, 0.1, 0.1);
    } else {
      // The machine was hiding: its ghost appears in its hiding place
      this.bot = new HideBot(this.level, this.places, this.hidingPlace);
      this.createBotGhost();
    }
    const who = this.results[this.seekerIndex];
    this.infoText.setText(wasFound
      ? `¡${this.seeker.name} encontró a ${this.hider.name} en ${who.seconds} segundos!`
      : `¡${this.seeker.name} no encontró a ${this.hider.name}!`);

    this.time.delayedCall(3000, () => {
      if (this.botGhost && !this.seeker.bot) this.botGhost.setVisible(false);
      this.roundIndex += 1;
      if (this.roundIndex < this.rounds.length) this.startRound();
      else this.showResult();
    });
  }

  // ---------------------------------------------------------------
  // Who won? The one who found the other one faster
  // (not finding them at all counts as the worst time)
  // ---------------------------------------------------------------
  showResult() {
    this.ended = true;
    this.clockText.setText('');
    this.infoText.setText('');
    const score = (r) => (r.found ? r.seconds : SEEK_TIME + 1);
    const [a, b] = this.results.map(score);
    let winner = null;
    if (a < b) winner = 0;
    else if (b < a) winner = 1;

    let title = '¡EMPATE!';
    if (winner !== null) {
      if (this.how === 'maquina') title = winner === 0 ? '¡GANASTE!' : '¡GANÓ LA MÁQUINA!';
      else title = `¡GANÓ EL ${this.players[winner].name}!`;
    }
    const weWon = this.how === 'maquina' && winner === 0;
    let coins = 0;
    if (weWon) {
      coins = COIN_PRIZES[this.level] || 10;
      addCoins(coins);
      reportMission('ganar');
      reportMission(`maquina-${this.level}`);
    }
    playSound(winner === 1 && this.how === 'maquina' ? 'perder' : 'ganar');

    const line = (i) => {
      const r = this.results[i];
      const other = this.players[1 - i].name;
      return r.found ? `${this.players[i].name} encontró a ${other} en ${r.seconds} s` : `${this.players[i].name} no encontró a ${other}`;
    };
    const color = winner === null ? '#ffdd33' : this.players[winner].color;
    const parts = [
      this.add.rectangle(400, 300, 580, 300, 0x000000, 0.88).setStrokeStyle(4, 0xffffff),
      this.add.text(400, 190, title, {
        fontFamily: 'Arial', fontSize: '42px', fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 6,
      }).setOrigin(0.5),
      this.add.text(400, 245, `${line(0)}\n${line(1)}`, {
        fontFamily: 'Arial', fontSize: '19px', color: '#ffffff', align: 'center', lineSpacing: 6,
      }).setOrigin(0.5),
    ];
    if (coins) {
      makeCoinTexture(this);
      parts.push(this.add.image(352, 296, 'coin'));
      parts.push(this.add.text(368, 296, `+${coins} monedas`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(0, 0.5));
    }
    parts.push(...this.resultButton(285, '🔁 OTRA VEZ [R]', 0x66ee88, () => this.goTo('HideSeekScene')));
    parts.push(...this.resultButton(515, '🏠 SALA [ENTER]', 0xffffff, () => this.goTo('TitleScene')));
    parts.forEach((p) => p.setScrollFactor(0).setDepth(200));
  }

  resultButton(x, label, color, onClick) {
    const box = this.add.rectangle(x, 380, 210, 48, 0x222222)
      .setStrokeStyle(3, color).setInteractive({ useHandCursor: true });
    box.on('pointerdown', onClick);
    const text = this.add.text(x, 380, label, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    return [box, text];
  }

  goTo(sceneName) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (sceneName === 'HideSeekScene') this.scene.restart(this.startData);
      else this.scene.start(sceneName);
    });
  }

  // Falling into a pit just sends us back to the start
  heroFell() {
    this.hero.setPosition(this.levelData.heroStart.x, this.levelData.heroStart.y);
    this.hero.setVelocity(0, 0);
  }

  // There is no goal flag here
  reachGoal() {}
}

// The hiding places, drawn with code (made the first time we need them)
function hidingTexture(scene, kind) {
  const key = `escondite-${kind}`;
  if (scene.textures.exists(key)) return key;
  const gfx = scene.add.graphics();
  if (kind === 'arbusto') {
    // A round bush: dark outline, then green balls of leaves
    gfx.fillStyle(0x1e2e1e);
    [[14, 34, 15], [30, 26, 19], [46, 34, 15], [30, 40, 18]].forEach(([x, y, r]) => gfx.fillCircle(x, y, r + 2));
    gfx.fillStyle(0x4f7a4f);
    [[14, 34, 15], [30, 26, 19], [46, 34, 15], [30, 40, 18]].forEach(([x, y, r]) => gfx.fillCircle(x, y, r));
    gfx.fillStyle(0x6f9a6f);
    gfx.fillCircle(24, 20, 6);
    gfx.fillCircle(40, 30, 5);
    gfx.generateTexture(key, 60, 58);
  } else if (kind === 'caja') {
    // A big cardboard box
    gfx.fillStyle(0x3a2a18);
    gfx.fillRect(0, 6, 58, 50);
    gfx.fillStyle(0x9a7448);
    gfx.fillRect(3, 9, 52, 44);
    gfx.fillStyle(0x7a5a34);
    gfx.fillRect(3, 9, 52, 8);
    gfx.lineStyle(2, 0x5a3e22);
    gfx.lineBetween(29, 9, 29, 53);
    gfx.generateTexture(key, 58, 56);
  } else {
    // A trash can with its lid
    gfx.fillStyle(0x1a1a1a);
    gfx.fillRect(6, 10, 44, 48);
    gfx.fillRect(2, 2, 52, 10);
    gfx.fillStyle(0x8a8a8a);
    gfx.fillRect(9, 12, 38, 44);
    gfx.fillStyle(0xa8a8a8);
    gfx.fillRect(4, 4, 48, 6);
    gfx.fillStyle(0x6a6a6a);
    [16, 27, 38].forEach((x) => gfx.fillRect(x, 16, 3, 36));
    gfx.generateTexture(key, 56, 58);
  }
  gfx.destroy();
  return key;
}

export default HideSeekScene;
