// Projectile.js — Bullets and projectiles!
// Used for the hero's rainbow Color Gun shots and (later)
// for enemy dark projectiles. Each projectile flies in one
// direction and destroys itself after a short time.

import Phaser from 'phaser';
import { PROJECTILE } from '../utils/constants.js';

// The special colored pencils (found in the levels). Each one changes our shots:
//   rojo  🔥 FUEGO:  hits twice as hard, and goes THROUGH the villains (it burns them all!)
//   azul  ❄️ HIELO:  freezes the villains for a few seconds (frozen ones can't hurt you)
//   verde 🟢 REBOTE: the shots bounce on the floor and the walls
export const COLOR_GUNS = {
  rojo: { name: 'Lápiz de fuego', icon: '🔥', color: 0xff4400 },
  azul: { name: 'Lápiz de hielo', icon: '❄️', color: 0x44ccff },
  verde: { name: 'Lápiz rebotador', icon: '🟢', color: 0x33cc33 },
};

class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Projectiles float — no gravity!
    this.body.setAllowGravity(false);

    // Start hidden and inactive (the group pool manages activation)
    this.setActive(false);
    this.setVisible(false);
  }

  // Fire the projectile from a position in a direction
  // directionX: 1 = right, -1 = left
  // speed: how fast it travels (pixels per second)
  // kind: 'normal' (rainbow, or the enemies' dark shot), or a colored pencil: 'rojo', 'azul', 'verde'
  fire(x, y, directionX, speed, kind = 'normal') {
    // Activate and show the projectile
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);

    // A colored pencil shot has its own picture (the normal one keeps the one it had)
    this.kind = kind;
    if (COLOR_GUNS[kind]) {
      Projectile.createColorShotTextures(this.scene);
      if (!this.normalTexture) this.normalTexture = this.texture.key;
      this.setTexture(`projectile-${kind}`);
    } else if (this.normalTexture) {
      this.setTexture(this.normalTexture);
    }
    this.setBodySize(this.width, this.height);
    this.hitEnemies = new Set(); // (the fire shot hurts each villain only once)
    this.bounces = 0;

    // Set velocity in the firing direction
    this.setVelocityX(directionX * speed);
    this.setVelocityY(0);
    // The bouncing shot falls and bounces like a ball
    const bouncy = kind === 'verde';
    this.body.setAllowGravity(bouncy);
    this.setBounce(bouncy ? 0.85 : 0);
    if (bouncy) this.setVelocityY(-180);

    // Flip the sprite to match direction
    this.setFlipX(directionX < 0);

    // Self-destruct after a short time (so bullets don't fly forever)
    this.lifeTimer = this.scene.time.delayedCall(bouncy ? PROJECTILE.LIFETIME * 1.5 : PROJECTILE.LIFETIME, () => {
      this.deactivate();
    });
  }

  // Deactivate and hide (return to the pool for reuse)
  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.body.setAllowGravity(false); // (the bouncing shot had gravity)
    this.setPosition(-50, -50); // Move off-screen

    // Cancel the life timer if it's still running
    if (this.lifeTimer) {
      this.lifeTimer.destroy();
      this.lifeTimer = null;
    }
  }

  // Generate the hero's rainbow projectile texture
  static createHeroTexture(scene) {
    if (scene.textures.exists('projectile-hero')) return;

    const gfx = scene.add.graphics();
    // Rainbow gradient bar (small and colorful!)
    const colors = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0088ff, 0x8800ff];
    const segW = 3;
    for (let i = 0; i < colors.length; i++) {
      gfx.fillStyle(colors[i]);
      gfx.fillRect(i * segW, 1, segW, 6);
    }
    // White glow tip
    gfx.fillStyle(0xffffff);
    gfx.fillCircle(colors.length * segW, 4, 3);
    gfx.generateTexture('projectile-hero', colors.length * segW + 4, 8);
    gfx.destroy();
  }

  // The shots of the colored pencils: a fireball, an ice crystal and a green ball
  static createColorShotTextures(scene) {
    if (scene.textures.exists('projectile-rojo')) return;
    let gfx = scene.add.graphics();
    gfx.fillStyle(0xff4400);
    gfx.fillTriangle(0, 3, 0, 11, 10, 7); // the flame's tail
    gfx.fillCircle(13, 7, 7);
    gfx.fillStyle(0xffdd00);
    gfx.fillCircle(14, 7, 4);
    gfx.generateTexture('projectile-rojo', 20, 14);
    gfx.destroy();

    gfx = scene.add.graphics();
    gfx.fillStyle(0x44ccff);
    gfx.fillTriangle(0, 6, 9, 0, 9, 12);
    gfx.fillTriangle(9, 0, 18, 6, 9, 12);
    gfx.fillStyle(0xffffff);
    gfx.fillTriangle(6, 6, 9, 3, 12, 6);
    gfx.generateTexture('projectile-azul', 18, 12);
    gfx.destroy();

    gfx = scene.add.graphics();
    gfx.fillStyle(0x33cc33);
    gfx.fillCircle(6, 6, 6);
    gfx.fillStyle(0xaaffaa);
    gfx.fillCircle(4, 4, 2);
    gfx.generateTexture('projectile-verde', 12, 12);
    gfx.destroy();
  }

  // Generate powerup textures
  static createPowerupTextures(scene) {
    // --- The 3 colored pencils: a pencil of ONE color, with its sign on top ---
    Object.entries(COLOR_GUNS).forEach(([kind, gun]) => {
      const key = `powerup-lapiz-${kind}`;
      if (scene.textures.exists(key)) return;
      const gfx = scene.add.graphics();
      gfx.fillStyle(0xffffff);
      gfx.fillRoundedRect(0, 0, 24, 38, 5); // a white glow behind, so it shines
      gfx.fillStyle(gun.color);
      gfx.fillRect(6, 4, 12, 24);
      gfx.fillStyle(0x000000, 0.25);
      gfx.fillRect(14, 4, 4, 24); // shadow on one side
      gfx.fillStyle(0xffcc88);
      gfx.fillTriangle(6, 28, 18, 28, 12, 36);
      gfx.fillStyle(gun.color);
      gfx.fillTriangle(10, 32, 14, 32, 12, 36);
      gfx.fillStyle(0xff6699);
      gfx.fillRect(6, 1, 12, 4); // eraser
      gfx.generateTexture(key, 24, 38);
      gfx.destroy();
    });

    // --- The vehicles: a skateboard and a rocket ---
    if (!scene.textures.exists('powerup-patineta')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0xff8800);
      gfx.fillRoundedRect(0, 0, 36, 6, 3);
      gfx.fillStyle(0x2255ee);
      gfx.fillRect(6, 1, 24, 2); // a blue stripe
      gfx.fillStyle(0x333333);
      gfx.fillCircle(8, 9, 3);
      gfx.fillCircle(28, 9, 3);
      gfx.generateTexture('powerup-patineta', 36, 12);
      gfx.destroy();
    }
    if (!scene.textures.exists('powerup-cohete')) {
      const gfx = scene.add.graphics();
      // A rocket lying down, pointing right (the way it flies)
      gfx.fillStyle(0xe52521);
      gfx.fillTriangle(30, 3, 30, 15, 38, 9); // nose
      gfx.fillStyle(0xf4f4f4);
      gfx.fillRect(10, 3, 20, 12);
      gfx.fillStyle(0x44ccff);
      gfx.fillCircle(24, 9, 3); // window
      gfx.fillStyle(0xe52521);
      gfx.fillTriangle(10, 3, 16, 3, 8, 0);
      gfx.fillTriangle(10, 15, 16, 15, 8, 18);
      gfx.fillStyle(0xff8800);
      gfx.fillTriangle(10, 5, 10, 13, 0, 9); // fire
      gfx.fillStyle(0xffdd00);
      gfx.fillTriangle(10, 7, 10, 11, 4, 9);
      gfx.generateTexture('powerup-cohete', 38, 18);
      gfx.destroy();
    }

    // --- The treasure chest: closed, and open ---
    if (!scene.textures.exists('powerup-cofre')) {
      [false, true].forEach((open) => {
        const gfx = scene.add.graphics();
        gfx.fillStyle(0x8b5a2b);
        gfx.fillRect(2, 14, 32, 18); // box
        gfx.fillStyle(0x6b4423);
        gfx.fillRect(2, 22, 32, 2);
        if (open) {
          gfx.fillStyle(0xffdd00);
          gfx.fillEllipse(18, 14, 26, 8); // gold inside!
          gfx.fillStyle(0x8b5a2b);
          gfx.fillRect(2, 0, 32, 8); // the lid, standing up
        } else {
          gfx.fillStyle(0xa0703a);
          gfx.fillRoundedRect(2, 6, 32, 10, { tl: 6, tr: 6, bl: 0, br: 0 }); // the lid, closed
        }
        // Gold corners and the lock
        gfx.fillStyle(0xffcc00);
        gfx.fillRect(2, 14, 4, 18);
        gfx.fillRect(30, 14, 4, 18);
        gfx.fillRect(15, open ? 18 : 12, 6, 7);
        gfx.generateTexture(open ? 'cofre-abierto' : 'powerup-cofre', 36, 32);
        gfx.destroy();
      });
    }

    // --- Color Pencil (Lápiz de Color) ---
    if (!scene.textures.exists('powerup-color-pencil')) {
      const gfx = scene.add.graphics();
      // Pencil body with rainbow stripes
      const colors = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0088ff, 0x8800ff];
      for (let i = 0; i < colors.length; i++) {
        gfx.fillStyle(colors[i]);
        gfx.fillRect(4, 2 + i * 4, 12, 4);
      }
      // Pencil tip
      gfx.fillStyle(0xffcc88);
      gfx.fillTriangle(10, 26, 4, 26, 10, 32);
      // Pencil top (eraser)
      gfx.fillStyle(0xff6699);
      gfx.fillRect(4, 0, 12, 3);
      gfx.generateTexture('powerup-color-pencil', 20, 34);
      gfx.destroy();
    }

    // --- Extra Life (heart) ---
    if (!scene.textures.exists('powerup-extra-life')) {
      const gfx = scene.add.graphics();
      // Big colorful heart
      gfx.fillStyle(0xff3366);
      gfx.fillCircle(8, 7, 7);
      gfx.fillCircle(18, 7, 7);
      gfx.fillTriangle(1, 10, 25, 10, 13, 24);
      // Little "+" sign
      gfx.fillStyle(0xffffff);
      gfx.fillRect(11, 5, 4, 10);
      gfx.fillRect(8, 8, 10, 4);
      gfx.generateTexture('powerup-extra-life', 26, 26);
      gfx.destroy();
    }

    // --- Shield pickup: a WAR shield (pointed at the bottom) with a pencil on it ---
    if (!scene.textures.exists('powerup-shield')) {
      const gfx = scene.add.graphics();
      const shape = [
        new Phaser.Geom.Point(2, 2), new Phaser.Geom.Point(26, 2),
        new Phaser.Geom.Point(26, 16), new Phaser.Geom.Point(14, 32),
        new Phaser.Geom.Point(2, 16),
      ];
      // Gold border, then blue shield inside
      gfx.fillStyle(0xffcc33);
      gfx.fillPoints(shape, true);
      gfx.fillStyle(0x3366cc);
      gfx.fillPoints([
        new Phaser.Geom.Point(5, 5), new Phaser.Geom.Point(23, 5),
        new Phaser.Geom.Point(23, 15), new Phaser.Geom.Point(14, 28),
        new Phaser.Geom.Point(5, 15),
      ], true);
      // A little colored pencil on the shield
      gfx.fillStyle(0xff3333);
      gfx.fillRect(12, 8, 4, 10);
      gfx.fillStyle(0xffdd33);
      gfx.fillTriangle(12, 18, 16, 18, 14, 23);
      gfx.fillStyle(0xffffff, 0.5);
      gfx.fillRect(6, 6, 3, 8); // shine
      gfx.generateTexture('powerup-shield', 28, 34);
      gfx.destroy();
    }

    // --- The shield the hero HOLDS: a pencil case (caja de lápices)! ---
    // A metal box with a latch and colored pencil tips poking out the top.
    if (!scene.textures.exists('pencil-shield')) {
      const gfx = scene.add.graphics();
      // Colored pencil tips sticking out of the top
      const tipColors = [0xff3333, 0xff8800, 0xffdd00, 0x33cc55, 0x3399ff];
      tipColors.forEach((color, i) => {
        gfx.fillStyle(0xe8c48a); // wood
        gfx.fillRect(2 + i * 4, 4, 4, 6);
        gfx.fillStyle(color);    // pencil body
        gfx.fillRect(2 + i * 4, 8, 4, 4);
        gfx.fillTriangle(2 + i * 4, 4, 6 + i * 4, 4, 4 + i * 4, 0); // sharp tip
      });
      // The box (rounded corners, like a metal tin)
      gfx.fillStyle(0x556677);
      gfx.fillRoundedRect(0, 10, 22, 34, 4);
      gfx.fillStyle(0x7799bb);
      gfx.fillRoundedRect(2, 12, 18, 30, 3);
      // War shield decoration: gold border, a stripe and rivets
      gfx.lineStyle(2, 0xffcc33);
      gfx.strokeRoundedRect(1, 11, 20, 32, 4);
      gfx.fillStyle(0xffcc33);
      gfx.fillRect(2, 24, 18, 4);
      gfx.fillCircle(5, 16, 1.5);
      gfx.fillCircle(17, 16, 1.5);
      gfx.fillCircle(5, 38, 1.5);
      gfx.fillCircle(17, 38, 1.5);
      // Latch in the middle
      gfx.fillStyle(0xdddddd);
      gfx.fillRect(8, 22, 6, 8);
      gfx.fillStyle(0x555555);
      gfx.fillRect(10, 25, 2, 2);
      gfx.generateTexture('pencil-shield', 22, 44);
      gfx.destroy();
    }
  }
}

export default Projectile;
