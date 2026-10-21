// TeamPickScene.js — ELIGE TU EQUIPO, for the FÚTBOL (TEMPORADA and MUNDIAL).
// The chosen team is big in the middle, with 3 small ones on each side.
//   ◀ ▶      the team before / after
//   ▲ ▼      CLUBES ↔ PAÍSES (only when both can be chosen)
//   a letter jumps to the first team that starts with it (P → Panamá...)
//   ENTER    chooses it, ESC goes back
// We start it with: this.scene.start('TeamPickScene', { kinds: ['club', 'pais'], returnTo: 'TemporadaScene' })
// and it goes back to "returnTo" with { picked: { kind, id } }.

import Phaser from 'phaser';
import { drawGrayCity } from './TitleScene.js';
import { CLUBS, COUNTRIES, teamBadge } from '../data/soccerTeams.js';
import { playSound } from '../audio/Sound.js';

class TeamPickScene extends Phaser.Scene {
  constructor() {
    super('TeamPickScene');
  }

  init(data = {}) {
    this.kinds = data.kinds || ['club', 'pais'];
    this.returnTo = data.returnTo || 'FutbolMenuScene';
    this.title = data.title || 'ELIGE TU EQUIPO';
    this.kind = this.kinds[0];
    this.index = 0;
    this.leaving = false;
  }

  list() {
    return this.kind === 'club' ? CLUBS : COUNTRIES;
  }

  create() {
    drawGrayCity(this);
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    this.add.text(400, 50, `⚽ ${this.title}`, {
      fontFamily: 'Arial', fontSize: '38px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.kindText = this.add.text(400, 100, '', {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffdd33',
    }).setOrigin(0.5);
    const help = this.kinds.length > 1
      ? '◀ ▶ cambiar · ▲ ▼ clubes / países · una letra salta · ENTER elegir · ESC volver'
      : '◀ ▶ cambiar · una letra salta (P = Panamá...) · ENTER elegir · ESC volver';
    this.add.text(400, 580, help, { fontFamily: 'Arial', fontSize: '14px', color: '#bbbbbb' }).setOrigin(0.5);

    // The big team in the middle
    this.bigCard = this.add.rectangle(400, 290, 260, 240, 0x222222).setStrokeStyle(4, 0xffdd33);
    this.bigBadge = this.add.image(400, 260, '__DEFAULT');
    this.bigName = this.add.text(400, 370, '', {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff', align: 'center', wordWrap: { width: 240 },
    }).setOrigin(0.5);
    // 3 small teams on each side (touch one to pick it)
    this.small = [-3, -2, -1, 1, 2, 3].map((offset) => {
      const x = 400 + Math.sign(offset) * (170 + (Math.abs(offset) - 1) * 90);
      const box = this.add.rectangle(x, 290, 80, 80, 0x222222).setStrokeStyle(2, 0x777777)
        .setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.move(offset));
      return { offset, box, badge: this.add.image(x, 290, '__DEFAULT') };
    });

    // ELEGIR, and the arrows (for touch screens)
    const choose = this.add.rectangle(400, 470, 240, 56, 0x1d3b24).setStrokeStyle(4, 0x66ee88)
      .setInteractive({ useHandCursor: true });
    this.add.text(400, 470, '✔ ELEGIR [ENTER]', { fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    choose.on('pointerdown', () => this.pick());
    [[-1, 230, '◀'], [1, 570, '▶']].forEach(([dir, x, label]) => {
      const arrow = this.add.circle(x, 470, 26, 0x000000, 0.5).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
      this.add.text(x, 470, label, { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
      arrow.on('pointerdown', () => this.move(dir));
    });
    if (this.kinds.length > 1) {
      const switcher = this.add.rectangle(400, 525, 300, 36, 0x222222).setStrokeStyle(2, 0xffdd33)
        .setInteractive({ useHandCursor: true });
      this.add.text(400, 525, '🔁 CLUBES / PAÍSES', { fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
      switcher.on('pointerdown', () => this.switchKind());
    }

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.goTo(this.returnTo, { cancelled: true });
      else if (event.key === 'Enter') this.pick();
      else if (event.key === 'ArrowLeft') this.move(-1);
      else if (event.key === 'ArrowRight') this.move(1);
      else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') this.switchKind();
      else if (/^[a-zA-Z]$/.test(event.key)) this.jumpTo(event.key);
    });
    this.show();
    this.cameras.main.fadeIn(250);
  }

  // The team that is "offset" places away from the chosen one (it goes around)
  teamAt(offset) {
    const list = this.list();
    return list[(this.index + offset + list.length * 10) % list.length];
  }

  show() {
    const team = this.teamAt(0);
    this.kindText.setText(this.kind === 'club'
      ? `CLUBES · División ${team.division}`
      : `PAÍSES · ${this.index + 1} de ${this.list().length}`);
    this.bigBadge.setTexture(teamBadge(this, team));
    this.bigBadge.setScale(Math.min(150 / this.bigBadge.width, 130 / this.bigBadge.height));
    this.bigName.setText(team.name);
    this.small.forEach(({ offset, badge }) => {
      badge.setTexture(teamBadge(this, this.teamAt(offset)));
      badge.setScale(Math.min(64 / badge.width, 60 / badge.height));
    });
  }

  move(steps) {
    this.index = (this.index + steps + this.list().length) % this.list().length;
    playSound('click');
    this.show();
  }

  switchKind() {
    if (this.kinds.length < 2) return;
    this.kind = this.kind === 'club' ? 'pais' : 'club';
    this.index = 0;
    this.show();
  }

  // A letter: the first team whose name starts with it ("Á" counts as "A")
  jumpTo(letter) {
    const plain = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
    const found = this.list().findIndex((t) => plain(t.name).startsWith(letter.toUpperCase()));
    if (found < 0) return;
    this.index = found;
    this.show();
  }

  pick() {
    const team = this.teamAt(0);
    playSound('comprar');
    this.goTo(this.returnTo, { picked: { kind: team.kind, id: team.id } });
  }

  goTo(sceneName, data) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneName, data));
  }
}

export default TeamPickScene;
