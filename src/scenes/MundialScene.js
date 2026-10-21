// MundialScene.js — 🌍 MUNDIAL of the FÚTBOL (the rules are in src/data/mundial.js).
// The first time we choose our COUNTRY (TeamPickScene). Then this screen shows where
// we are: the table of our group, or the next knockout match. The matches are played
// in SoccerScene, which comes back here with the result.
// THE FINAL: 🌐 ONLINE against a friend (OnlineScene → SoccerScene online), or 🤖 the robot.
// A friend who wants to play OUR final chooses 🔑 UNIRSE A LA FINAL DE UN AMIGO.
// Keys: ENTER = play, O = final online, M = final against the robot, U = join a friend's final,
//       N = new Mundial (asks twice), ESC = back to the FÚTBOL menu.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { findTeam, teamBadge, randomCountries } from '../data/soccerTeams.js';
import { standings } from '../data/temporada.js';
import {
  loadMundial, saveMundial, newMundial, rivalFor, applyMatch, STAGES, STAGE_NAMES, STAGE_LEVEL, PRIZES,
} from '../data/mundial.js';
import { addCoins } from '../data/coins.js';
import { reportMission } from '../data/missions.js';
import { playSound } from '../audio/Sound.js';

class MundialScene extends Phaser.Scene {
  constructor() {
    super('MundialScene');
  }

  // data.picked = the country we just chose; data.result = the match we just played
  init(data = {}) {
    this.picked = data.picked || null;
    this.result = data.result || null;
    this.cancelled = Boolean(data.cancelled);
    this.leaving = false;
    this.confirmNew = false;
    this.report = null;
  }

  create() {
    let state = loadMundial();
    if (this.picked) {
      state = newMundial(this.picked, state ? state.titles : 0);
      saveMundial(state);
    }
    if (!state) {
      if (this.cancelled) this.scene.start('FutbolMenuScene');
      else this.chooseCountry();
      return;
    }
    this.state = state;
    // A match of OUR Mundial (not a friend's final that we helped to play)
    if (this.result && this.result.tag === 'mundial' && !state.result) this.applyResult();

    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75);
    this.drawHeader();
    if (state.result) this.drawEnd();
    else if (state.stage === 'grupos') this.drawGroup();
    else this.drawKnockout();

    this.message = this.add.text(400, 520, '', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffdd33', stroke: '#000000', strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5);
    if (this.report) this.message.setText(this.report);
    else if (this.result && this.result.tag !== 'mundial') this.message.setText('¡Gracias por jugar la final de tu amigo!');

    // Help a friend: play THEIR final, online
    this.button(140, 560, '🔑 FINAL DE UN AMIGO [U]', 0x44aaff, () => this.joinFriend(), 250, 36);
    this.add.text(560, 560, 'N: nuevo Mundial · ESC: volver', { fontFamily: 'Arial', fontSize: '13px', color: '#999999' }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('FutbolMenuScene');
      else if (event.key === 'Enter') this.mainButton();
      else if (event.code === 'KeyO') this.finalOnline();
      else if (event.code === 'KeyM') this.finalMachine();
      else if (event.code === 'KeyU') this.joinFriend();
      else if (event.code === 'KeyN') this.newMundial();
    });
    this.cameras.main.fadeIn(250);
  }

  chooseCountry() {
    this.scene.start('TeamPickScene', { kinds: ['pais'], returnTo: 'MundialScene', title: 'TU PAÍS PARA EL MUNDIAL' });
  }

  // We came back from a match: what happened, and the coins
  applyResult() {
    const [ours, theirs] = this.result.score;
    const weWon = this.result.winner === this.result.me;
    const report = applyMatch(this.state, ours, theirs, weWon);
    saveMundial(this.state);
    let coins = 0;
    if (ours > theirs || (weWon && ours === theirs)) coins += PRIZES.win;
    else if (ours === theirs && !weWon && this.result.winner === null) coins += PRIZES.draw;
    if (report.passed) coins += PRIZES.nextStage;
    if (report.champion) {
      coins += PRIZES.champion;
      reportMission('ganar');
    }
    if (coins) addCoins(coins);
    const score = `${ours} a ${theirs}`;
    this.report = `${report.message || (report.won ? `¡Ganaste ${score}!` : report.tie ? `Empate ${score}` : `Perdiste ${score}`)}${coins ? `  +${coins} monedas` : ''}`;
  }

  drawHeader() {
    const me = findTeam(this.state.country);
    const stage = this.state.result ? 'TERMINADO' : STAGE_NAMES[this.state.stage];
    this.add.text(400, 30, `🌍 MUNDIAL · ${stage}`, {
      fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    const flag = this.add.image(330, 66, teamBadge(this, me));
    flag.setScale(24 / flag.height);
    const titles = this.state.titles ? `   🏆 x${this.state.titles}` : '';
    this.add.text(350, 66, `${me.name}${titles}`, { fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffdd33' }).setOrigin(0, 0.5);

    // The road to the cup: GRUPOS → CUARTOS → SEMI → FINAL
    const at = this.state.result === 'campeon' ? STAGES.length : STAGES.indexOf(this.state.stage);
    STAGES.forEach((stage, i) => {
      const x = 130 + i * 180;
      const done = i < at;
      const now = i === at && !this.state.result;
      this.add.rectangle(x, 105, 160, 30, now ? 0x7a6a00 : done ? 0x1d5c2e : 0x333333).setStrokeStyle(now ? 3 : 1, 0xffffff);
      this.add.text(x, 105, `${done ? '✔ ' : ''}${['GRUPOS', 'CUARTOS', 'SEMIFINAL', 'FINAL'][i]}`, {
        fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      if (i < STAGES.length - 1) this.add.text(x + 90, 105, '▶', { fontSize: '14px', color: '#888888' }).setOrigin(0.5);
    });
  }

  // The table of our group (4 countries, the first 2 go on)
  drawGroup() {
    const group = this.state.group;
    const top = 150;
    [[330, 'PJ'], [375, 'G'], [415, 'E'], [455, 'P'], [505, 'GOLES'], [570, 'PTS']].forEach(([x, label]) => {
      this.add.text(x, top, label, { fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#aaaaaa' }).setOrigin(0.5);
    });
    standings(group).forEach((row, i) => {
      const y = top + 36 + i * 46;
      const isMe = row.team === 0;
      this.add.rectangle(320, y, 580, 40, i < 2 ? 0x1d5c2e : 0x333333, 0.9).setStrokeStyle(isMe ? 3 : 0, 0xffdd33);
      const team = findTeam(group.teams[row.team]);
      const flag = this.add.image(100, y, teamBadge(this, team));
      flag.setScale(26 / flag.height);
      const style = { fontFamily: 'Arial', fontSize: '17px', fontStyle: isMe ? 'bold' : 'normal', color: isMe ? '#ffdd33' : '#ffffff' };
      this.add.text(60, y, `${i + 1}`, style).setOrigin(0.5);
      const name = this.add.text(125, y, team.name, style).setOrigin(0, 0.5);
      if (name.width > 180) name.setScale(180 / name.width);
      [[330, row.pj], [375, row.g], [415, row.e], [455, row.p], [505, `${row.gf}:${row.gc}`], [570, row.pts]]
        .forEach(([x, value]) => this.add.text(x, y, `${value}`, style).setOrigin(0.5));
    });
    this.add.text(320, top + 36 + 4 * 46 - 10, '🟩 los 2 primeros pasan a CUARTOS', { fontFamily: 'Arial', fontSize: '13px', color: '#bbbbbb' }).setOrigin(0.5);
    this.drawNextMatch(`PARTIDO ${group.round + 1} DE 3`);
  }

  // Cuartos, semifinal or the final: one big match
  drawKnockout() {
    if (this.state.stage === 'final') {
      this.drawMatchCard(400, 290, 'LA FINAL', 360);
      this.button(270, 455, '🌐 ONLINE [O]', 0x44aaff, () => this.finalOnline(), 230, 50);
      this.button(530, 455, '🤖 MÁQUINA [M]', 0xff9933, () => this.finalMachine(), 230, 50);
      this.add.text(400, 492, 'Online: tu amigo elige 🌍 MUNDIAL → 🔑 FINAL DE UN AMIGO y escribe tu palabra secreta', {
        fontFamily: 'Arial', fontSize: '13px', color: '#bbbbbb',
      }).setOrigin(0.5);
      return;
    }
    this.drawMatchCard(400, 290, STAGE_NAMES[this.state.stage], 360);
    this.button(400, 455, '▶ JUGAR [ENTER]', 0x66ee88, () => this.mainButton(), 240, 50);
  }

  // A card with the two flags: us VS them (in the final, the rival is a friend or the robot)
  drawMatchCard(x, y, title, width) {
    this.add.rectangle(x, y, width, 230, 0x222222).setStrokeStyle(3, 0xffdd33);
    this.add.text(x, y - 95, title, { fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffdd33' }).setOrigin(0.5);
    const me = findTeam(this.state.country);
    const mine = this.add.image(x - 100, y - 10, teamBadge(this, me));
    mine.setScale(70 / mine.height);
    this.add.text(x - 100, y + 50, me.name, { fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(x, y - 10, 'VS', { fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    if (this.state.stage === 'final') {
      this.add.text(x + 100, y - 10, '❓', { fontSize: '56px' }).setOrigin(0.5);
      this.add.text(x + 100, y + 50, '¿un amigo o el robot?', { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
      return;
    }
    const rival = findTeam(rivalFor(this.state));
    saveMundial(this.state); // (the rival was just chosen: keep it, so it is the same next time)
    const theirs = this.add.image(x + 100, y - 10, teamBadge(this, rival));
    theirs.setScale(70 / theirs.height);
    this.add.text(x + 100, y + 50, rival.name, { fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
  }

  // In the groups: the next match, on the right of the table
  drawNextMatch(title) {
    const rival = findTeam(rivalFor(this.state));
    this.add.rectangle(705, 290, 170, 280, 0x222222).setStrokeStyle(3, 0x66ee88);
    this.add.text(705, 172, title, { fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#66ee88' }).setOrigin(0.5);
    const mine = this.add.image(705, 220, teamBadge(this, findTeam(this.state.country)));
    mine.setScale(44 / mine.height);
    this.add.text(705, 262, 'VS', { fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    const theirs = this.add.image(705, 305, teamBadge(this, rival));
    theirs.setScale(44 / theirs.height);
    this.add.text(705, 345, rival.name, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff', align: 'center', wordWrap: { width: 150 },
    }).setOrigin(0.5);
    this.button(705, 400, '▶ JUGAR [ENTER]', 0x66ee88, () => this.mainButton(), 150, 44);
  }

  // The Mundial is over: champion, or out
  drawEnd() {
    const champion = this.state.result === 'campeon';
    this.add.text(400, 240, champion ? '🏆' : '😢', { fontSize: '110px' }).setOrigin(0.5);
    this.add.text(400, 350, champion ? '¡CAMPEÓN DEL MUNDO!' : 'Esta vez no se pudo...', {
      fontFamily: 'Arial', fontSize: '38px', fontStyle: 'bold', color: champion ? '#ffdd33' : '#ffffff',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.button(400, 440, '🌍 NUEVO MUNDIAL [ENTER]', 0x66ee88, () => this.mainButton(), 300, 50);
    if (champion && this.report) {
      playSound('ganar');
      this.confetti();
    }
  }

  button(x, y, label, color, onClick, width, height) {
    const box = this.add.rectangle(x, y, width, height, 0x1d3b24).setStrokeStyle(3, color).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    box.on('pointerdown', onClick);
  }

  confetti() {
    const colors = [0xff4444, 0xff9933, 0xffee33, 0x44dd66, 0x3399ff, 0xaa55ff];
    for (let i = 0; i < 80; i++) {
      const piece = this.add.rectangle(Math.random() * 800, -20 - Math.random() * 300, 8, 12, colors[i % colors.length]);
      this.tweens.add({ targets: piece, y: 640, angle: 720, duration: 2000 + Math.random() * 1500, onComplete: () => piece.destroy() });
    }
  }

  // The match against the robot (groups, cuartos, semi... or the final without a friend)
  playMatch() {
    const rival = findTeam(rivalFor(this.state));
    saveMundial(this.state);
    this.goTo('SoccerScene', {
      how: 'maquina',
      level: STAGE_LEVEL[this.state.stage],
      teams: [findTeam(this.state.country), rival],
      // In the groups a tie is a tie; after that, PENALES
      context: { returnTo: 'MundialScene', draws: this.state.stage === 'grupos', tag: 'mundial' },
    });
  }

  mainButton() {
    if (this.state.result) {
      this.goTo('TeamPickScene', { kinds: ['pais'], returnTo: 'MundialScene', title: 'TU PAÍS PARA EL MUNDIAL' });
      return;
    }
    if (this.state.stage === 'final') return; // the final has its own two buttons
    this.playMatch();
  }

  finalMachine() {
    if (this.state.result || this.state.stage !== 'final') return;
    // The robot plays with a strong country
    const [rival] = randomCountries(1, [this.state.country.id, ...this.state.beaten]);
    this.state.rival = { kind: 'pais', id: rival.id };
    this.playMatch();
  }

  // The final ONLINE: we create a game and tell our friend the secret word
  finalOnline() {
    if (this.state.result || this.state.stage !== 'final') return;
    this.goTo('OnlineScene', { mode: 'futbol', team: this.state.country, returnTo: 'MundialScene', tag: 'mundial', start: 'crear' });
  }

  // We play a FRIEND's final: with our country (or a random one if we have no Mundial)
  joinFriend() {
    const [random] = randomCountries(1);
    const team = this.state ? this.state.country : { kind: 'pais', id: random.id };
    this.goTo('OnlineScene', { mode: 'futbol', team, returnTo: 'MundialScene', tag: 'amistoso', start: 'unirse' });
  }

  newMundial() {
    if (!this.confirmNew) {
      this.confirmNew = true;
      this.message.setText('¿Empezar otro Mundial con otro país? Presiona N otra vez');
      return;
    }
    this.goTo('TeamPickScene', { kinds: ['pais'], returnTo: 'MundialScene', title: 'TU PAÍS PARA EL MUNDIAL' });
  }

  goTo(sceneName, data) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName, data));
  }
}

export default MundialScene;
