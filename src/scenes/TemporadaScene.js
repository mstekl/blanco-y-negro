// TemporadaScene.js — 🏆 TEMPORADA of the FÚTBOL (the rules are in src/data/temporada.js).
// The first time we choose our team (TeamPickScene). Then this screen shows the TABLE
// of our division, and our next match. JUGAR plays it against the robot (SoccerScene),
// and SoccerScene comes back here with the result.
// Keys: ENTER = play / next season, N = new team (asks twice), ESC = back to the FÚTBOL menu.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { findTeam, teamBadge } from '../data/soccerTeams.js';
import {
  loadTemporada, saveTemporada, forgetTemporada, newCareer, nextRival, playRound,
  standings, endSeason, nextSeason, ROUNDS, DIVISION_LEVEL, PRIZES,
} from '../data/temporada.js';
import { addCoins } from '../data/coins.js';
import { earnStars } from '../data/pass.js';
import { playSound } from '../audio/Sound.js';

class TemporadaScene extends Phaser.Scene {
  constructor() {
    super('TemporadaScene');
  }

  // data.picked = the team we just chose; data.result = the match we just played
  init(data = {}) {
    this.picked = data.picked || null;
    this.result = data.result || null;
    this.cancelled = Boolean(data.cancelled); // we pressed ESC when choosing the team
    this.leaving = false;
    this.confirmNew = false;
    this.resultMessage = '';
  }

  create() {
    let state = loadTemporada();
    if (this.picked) {
      state = newCareer(this.picked);
      saveTemporada(state);
    }
    // No season yet: first we choose our team
    if (!state) {
      if (this.cancelled) this.scene.start('FutbolMenuScene');
      else this.scene.start('TeamPickScene', { kinds: ['club', 'pais'], returnTo: 'TemporadaScene', title: 'TU EQUIPO PARA LA TEMPORADA' });
      return;
    }
    this.state = state;
    if (this.result && !state.over) this.applyResult();

    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75);
    this.drawHeader();
    this.drawTable();
    if (state.over) this.drawSeasonEnd();
    else this.drawNextMatch();

    this.add.text(400, 588, 'ENTER: jugar · N: nuevo equipo · ESC: volver', {
      fontFamily: 'Arial', fontSize: '13px', color: '#999999',
    }).setOrigin(0.5);
    this.message = this.add.text(400, 548, '', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffdd33', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
    if (this.resultMessage) this.message.setText(this.resultMessage);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo('FutbolMenuScene');
      else if (event.key === 'Enter') this.mainButton();
      else if (event.code === 'KeyN') this.newTeam();
    });
    this.cameras.main.fadeIn(250);
  }

  team(index) {
    return findTeam(this.state.teams[index]);
  }

  // We came back from a match: write it in the table, and give the coins
  applyResult() {
    const [ours, theirs] = this.result.score;
    const rivalName = this.team(nextRival(this.state)).name;
    playRound(this.state, ours, theirs);
    saveTemporada(this.state);
    if (ours > theirs) {
      addCoins(PRIZES.win);
      earnStars('ganar');
      this.resultMessage = `¡Le ganaste ${ours} a ${theirs} a ${rivalName}! +3 puntos · +${PRIZES.win} monedas`;
    } else if (ours === theirs) {
      addCoins(PRIZES.draw);
      this.resultMessage = `Empate ${ours} a ${theirs} con ${rivalName}. +1 punto · +${PRIZES.draw} monedas`;
    } else {
      this.resultMessage = `Perdiste ${ours} a ${theirs} con ${rivalName}. ¡La próxima!`;
    }
  }

  drawHeader() {
    const me = this.team(0);
    this.add.text(400, 30, `🏆 TEMPORADA ${this.state.season} · DIVISIÓN ${this.state.division}`, {
      fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    const titles = this.state.titles ? `   ·   🏆 x${this.state.titles}` : '';
    this.add.text(400, 64, `Tu equipo: ${me.name}${titles}`, {
      fontFamily: 'Arial', fontSize: '17px', color: '#ffdd33',
    }).setOrigin(0.5);
  }

  // The table: position, team, played, won, tied, lost, goals, points
  drawTable() {
    const top = 100;
    const cols = [[60, '#'], [330, 'PJ'], [375, 'G'], [415, 'E'], [455, 'P'], [505, 'GOLES'], [570, 'PTS']];
    cols.forEach(([x, label]) => this.add.text(x, top, label, {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#aaaaaa',
    }).setOrigin(0.5));

    standings(this.state).forEach((row, i) => {
      const y = top + 34 + i * 42;
      const isMe = row.team === 0;
      // Green = goes up, red = goes down (in División 1 the green one is the champion)
      let zone = 0x333333;
      if (i < 2 && this.state.division > 1) zone = 0x1d5c2e;
      if (i === 0 && this.state.division === 1) zone = 0x7a6a00;
      if (i >= 4 && this.state.division < 5) zone = 0x6a1d1d;
      this.add.rectangle(320, y, 580, 36, zone, 0.9).setStrokeStyle(isMe ? 3 : 0, 0xffdd33);
      const team = this.team(row.team);
      const badge = this.add.image(100, y, teamBadge(this, team));
      badge.setScale(28 / badge.height);
      const style = { fontFamily: 'Arial', fontSize: '17px', fontStyle: isMe ? 'bold' : 'normal', color: isMe ? '#ffdd33' : '#ffffff' };
      this.add.text(60, y, `${i + 1}`, style).setOrigin(0.5);
      const name = this.add.text(125, y, team.name, style).setOrigin(0, 0.5);
      if (name.width > 180) name.setScale(180 / name.width);
      [[330, row.pj], [375, row.g], [415, row.e], [455, row.p], [505, `${row.gf}:${row.gc}`], [570, row.pts]]
        .forEach(([x, value]) => this.add.text(x, y, `${value}`, style).setOrigin(0.5));
    });

    const legend = this.state.division === 1 ? '🟨 campeón   🟩 —   🟥 bajan' : this.state.division === 5 ? '🟩 suben' : '🟩 suben   🟥 bajan';
    this.add.text(320, top + 34 + 6 * 42 - 6, legend, { fontFamily: 'Arial', fontSize: '13px', color: '#bbbbbb' }).setOrigin(0.5);
  }

  // On the right: our next match
  drawNextMatch() {
    const rival = this.team(nextRival(this.state));
    this.add.rectangle(705, 290, 170, 300, 0x222222).setStrokeStyle(3, 0x66ee88);
    this.add.text(705, 162, `FECHA ${this.state.round + 1} DE ${ROUNDS}`, {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#66ee88',
    }).setOrigin(0.5);
    const mine = this.add.image(705, 215, teamBadge(this, this.team(0)));
    mine.setScale(48 / mine.height);
    this.add.text(705, 262, 'VS', { fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    const theirs = this.add.image(705, 310, teamBadge(this, rival));
    theirs.setScale(48 / theirs.height);
    this.add.text(705, 355, rival.name, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff', align: 'center', wordWrap: { width: 150 },
    }).setOrigin(0.5);
    this.button(705, 410, '▶ JUGAR [ENTER]', 0x66ee88, () => this.mainButton(), 150);
  }

  // The season is over: where we finished, and what happens now
  drawSeasonEnd() {
    const { place, move } = endSeason(this.state);
    const words = {
      campeon: ['🏆 ¡CAMPEÓN!', `¡Ganaste la División 1! +${PRIZES.champion} monedas`],
      sube: ['⬆ ¡SUBES!', `A la División ${this.state.division - 1}. +${PRIZES.up} monedas`],
      baja: ['⬇ BAJAS', `A la División ${this.state.division + 1}. ¡A volver a subir!`],
      queda: ['= TE QUEDAS', `Otra temporada en la División ${this.state.division}`],
    }[move];
    this.add.rectangle(705, 290, 170, 300, 0x222222).setStrokeStyle(3, 0xffdd33);
    this.add.text(705, 170, `Terminaste ${place}º`, { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(705, 225, words[0], {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: move === 'baja' ? '#ff7777' : '#66ee88',
    }).setOrigin(0.5);
    this.add.text(705, 290, words[1], {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffffff', align: 'center', wordWrap: { width: 150 },
    }).setOrigin(0.5);
    this.button(705, 400, '▶ SIGUIENTE [ENTER]', 0xffdd33, () => this.mainButton(), 160);
    playSound(move === 'baja' ? 'perder' : 'ganar');
  }

  button(x, y, label, color, onClick, width) {
    const box = this.add.rectangle(x, y, width, 44, 0x1d3b24).setStrokeStyle(3, color).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    box.on('pointerdown', onClick);
  }

  // ENTER: play the next match, or start the next season (and get the season's prize)
  mainButton() {
    if (this.state.over) {
      const { move } = endSeason(this.state);
      if (move === 'campeon') addCoins(PRIZES.champion);
      if (move === 'sube') addCoins(PRIZES.up);
      saveTemporada(nextSeason(this.state));
      this.goTo('TemporadaScene', {});
      return;
    }
    const rival = this.team(nextRival(this.state));
    this.goTo('SoccerScene', {
      how: 'maquina',
      level: DIVISION_LEVEL[this.state.division],
      teams: [this.team(0), rival],
      context: { returnTo: 'TemporadaScene', draws: true },
    });
  }

  // N: start again with another team (we ask twice, so it's never by mistake)
  newTeam() {
    if (!this.confirmNew) {
      this.confirmNew = true;
      this.message.setText('¿Empezar de nuevo con otro equipo? Se borra esta temporada. Presiona N otra vez');
      return;
    }
    forgetTemporada();
    this.goTo('TeamPickScene', { kinds: ['club', 'pais'], returnTo: 'TemporadaScene', title: 'TU EQUIPO PARA LA TEMPORADA' });
  }

  goTo(sceneName, data) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName, data));
  }
}

export default TemporadaScene;
