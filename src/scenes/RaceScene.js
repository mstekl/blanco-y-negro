// RaceScene.js — The race! Two players on the same computer, at the same time.
// (It also runs the BÚSQUEDA mode — see SearchLevelScene.js — which is split
// in two halves too, but there we look for 5 colored pencils instead.)
// The screen is split in two halves:
//   - LEFT half:  player 1, plays with W A D (and S to shoot)
//   - RIGHT half: player 2, plays with the arrows (and ↓ to shoot)
// Each half is a whole copy of the normal level scene (LevelScene), with
// its own hero, enemies and camera. This scene sits ON TOP of both: it draws
// the line in the middle, does the 3-2-1 countdown and says who won.
// The first player to REACH LEVEL 4 (finish level 3) wins the race!
// ESC goes back to the sala.

import Phaser from 'phaser';
import LevelScene from './LevelScene.js';

// We win when we finish this many levels (3 levels done = we got to level 4)
const LEVELS_TO_WIN = 3;

// Two copies of the level scene, one for each half.
// Phaser needs a different name (key) for each copy, that's why there are two.
export class RaceLeftScene extends LevelScene {
  constructor() {
    super('RaceLeft');
  }
}
export class RaceRightScene extends LevelScene {
  constructor() {
    super('RaceRight');
  }
}

// Everything that is different for each player, in each mode
const K = Phaser.Input.Keyboard.KeyCodes;
const MODES = {
  // The race: the first one to reach level 4 wins
  carrera: {
    intro: ['¡El primero en llegar al Nivel 4 gana!'],
    players: [
      {
        player: 1, side: 0, scene: 'RaceLeft', controls: 'wasd', color: '#44aaff',
        help: 'A D Mover  |  W Saltar', shootKey: 'S',
      },
      {
        player: 2, side: 1, scene: 'RaceRight', controls: 'arrows', color: '#ff9933',
        help: '← → Mover  |  ↑ Saltar', shootKey: '↓',
      },
    ],
  },
  // The search: the first one to find the 5 good pencils wins
  busqueda: {
    intro: [
      '¡Busca 5 lápices: rojo, azul, verde, violeta y naranja!',
      'Amarillo, rosa y marrón te quitan 1 vida',
    ],
    players: [
      {
        player: 1, side: 0, scene: 'SearchLeft', controls: 'wasd', color: '#44aaff',
        help: 'A D Mover  |  W Saltar  |  Z Agarrar', grabKey: K.Z,
      },
      {
        player: 2, side: 1, scene: 'SearchRight', controls: 'arrows', color: '#ff9933',
        help: '← → Mover  |  ↑ Saltar  |  ↓ Agarrar', grabKey: K.DOWN,
      },
    ],
  },
};

class RaceScene extends Phaser.Scene {
  constructor() {
    super('RaceScene');
  }

  // data.mode = 'carrera' (the race) or 'busqueda' (the search)
  init(data) {
    this.mode = MODES[data.mode] || MODES.carrera;
    this.players = this.mode.players;
  }

  create() {
    // The level scenes look at "started" to know if they can move yet
    this.started = false;
    this.finished = false;
    this.leaving = false;

    // Start both halves, each with its own player data
    this.players.forEach((p) => {
      this.scene.launch(p.scene, { levelIndex: 0, race: { ...p, goalLevel: LEVELS_TO_WIN } });
    });
    // This scene must be drawn ON TOP of the two halves
    this.scene.bringToTop();

    // The line in the middle that splits the screen
    this.add.rectangle(400, 300, 6, 600, 0xffffff);
    this.add.rectangle(400, 300, 2, 600, 0x000000);

    // "JUGADOR 1" and "JUGADOR 2" in the top-left corner of each half
    // (in the search it goes a bit lower, under the hearts)
    const labelY = this.mode === MODES.busqueda ? 40 : 10;
    this.players.forEach((p) => {
      this.add.text(p.side * 400 + 12, labelY, `JUGADOR ${p.player}`, {
        fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: p.color,
        stroke: '#000000', strokeThickness: 4,
      });
    });

    this.add.text(400, 598, 'ESC: salir', {
      fontFamily: 'Arial', fontSize: '11px', color: '#888888',
      backgroundColor: '#000000',
    }).setOrigin(0.5, 1);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') this.leave();
      else if (event.key === 'Enter' && this.finished) this.leave();
    });

    this.countdown();
  }

  // 3... 2... 1... ¡YA! (so both players start at the same time)
  countdown() {
    const goal = this.add.text(400, 190, this.mode.intro, {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6, align: 'center',
    }).setOrigin(0.5);

    const words = ['3', '2', '1', '¡YA!'];
    words.forEach((word, i) => {
      this.time.delayedCall(600 + i * 800, () => {
        const text = this.add.text(400, 300, word, {
          fontFamily: 'Arial', fontSize: '96px', fontStyle: 'bold',
          color: i === 3 ? '#66ee88' : '#ffffff',
          stroke: '#000000', strokeThickness: 10,
        }).setOrigin(0.5);
        // Each number grows and disappears
        this.tweens.add({
          targets: text, scale: 1.5, alpha: 0, duration: 750,
          onComplete: () => text.destroy(),
        });
        if (i === 3) {
          this.started = true;
          this.tweens.add({ targets: goal, alpha: 0, duration: 400 });
        }
      });
    });
  }

  // A player lost all their lives (in the search): the OTHER one wins
  playerOut(player) {
    const other = player === 1 ? 2 : 1;
    this.playerWon(other, `El jugador ${player} perdió sus 3 vidas`);
  }

  // A level scene calls this when its player wins (got to level 4, or found the 5 pencils)
  playerWon(player, reason = 'Llegó primero al Nivel 4') {
    // Only the FIRST one to get there wins
    if (this.finished) return;
    this.finished = true;

    // Both halves freeze, so we can see where everybody was
    this.players.forEach((p) => this.scene.pause(p.scene));

    const winner = this.players[player - 1];
    const color = Phaser.Display.Color.HexStringToColor(winner.color).color;

    // A colored frame around the winner's half
    this.add.rectangle(winner.side * 400 + 200, 300, 392, 592)
      .setStrokeStyle(8, color);

    // The big message
    this.add.rectangle(400, 300, 520, 170, 0x000000, 0.8).setStrokeStyle(4, 0xffffff);
    const title = this.add.text(400, 270, `¡GANÓ EL JUGADOR ${player}!`, {
      fontFamily: 'Arial', fontSize: '44px', fontStyle: 'bold', color: winner.color,
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title, scale: 1.08, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.add.text(400, 320, reason, {
      fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(400, 355, 'ENTER: volver a la sala', {
      fontFamily: 'Arial', fontSize: '15px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.throwConfetti(winner.side * 400 + 200);
  }

  // Rainbow confetti falling over the winner's half
  throwConfetti(centerX) {
    const colors = [0xff4444, 0xff9933, 0xffee33, 0x44dd66, 0x3399ff, 0xaa55ff];
    for (let i = 0; i < 60; i++) {
      const piece = this.add.rectangle(
        centerX - 190 + Math.random() * 380, -20 - Math.random() * 300,
        8, 12, colors[i % colors.length]
      );
      this.tweens.add({
        targets: piece,
        y: 640,
        angle: 360 + Math.random() * 360,
        duration: 1800 + Math.random() * 1500,
        onComplete: () => piece.destroy(),
      });
    }
  }

  // Back to the sala: we close both halves first
  leave() {
    if (this.leaving) return;
    this.leaving = true;
    this.players.forEach((p) => this.scene.stop(p.scene));
    this.scene.start('TitleScene');
  }
}

export default RaceScene;
