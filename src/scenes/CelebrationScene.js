// CelebrationScene.js — The city gets its color back!
// This plays right after the hero beats the final level (before the WinScene).
// The gray city turns colorful, a happy sun smiles in the sky,
// and all the people in the city jump for joy!

import Phaser from 'phaser';

const GROUND_Y = 520; // Where the street starts

class CelebrationScene extends Phaser.Scene {
  constructor() {
    super('CelebrationScene');
  }

  create() {
    this.cameras.main.fadeIn(800, 255, 255, 255);
    this.canContinue = false;

    this.createPersonTextures();

    // The order matters here: things created first are drawn behind
    this.createSky();
    this.createBuildings();
    this.createGround();
    this.createClouds();
    this.createSun();
    this.createPeople();
    this.createHero();
    this.createConfetti();
    this.createTexts();

    // After a few seconds the player can continue (ENTER or SPACE)
    this.time.delayedCall(5000, () => {
      this.canContinue = true;
      const hint = this.add.text(400, 575, 'Presiona ENTER para continuar', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(50);
      this.tweens.add({ targets: hint, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
    });

    // If nobody presses anything, move on by itself after 14 seconds
    this.time.delayedCall(14000, () => this.goToWinScene());
    this.input.keyboard.on('keydown-ENTER', () => this.goToWinScene());
    this.input.keyboard.on('keydown-SPACE', () => this.goToWinScene());
  }

  // Go to the final victory screen
  goToWinScene() {
    if (!this.canContinue || this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(800, 255, 255, 255);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldMapScene');
    });
  }

  // --- People textures: 6 different shirt colors, arms up in the air! ---
  createPersonTextures() {
    const shirtColors = [0xff4444, 0x44aaff, 0x44cc66, 0xffcc00, 0xff66cc, 0xff8800];
    const skinColors = [0xffdbac, 0xf1c27d, 0xc68642, 0x8d5524];

    shirtColors.forEach((shirt, i) => {
      const key = `person-${i}`;
      if (this.textures.exists(key)) return;
      const gfx = this.add.graphics();
      // Head (every person gets a different skin color)
      gfx.fillStyle(skinColors[i % skinColors.length]);
      gfx.fillCircle(12, 8, 7);
      // Smile and eyes
      gfx.fillStyle(0x000000);
      gfx.fillRect(9, 6, 2, 2);
      gfx.fillRect(14, 6, 2, 2);
      gfx.fillRect(10, 11, 5, 1);
      // Body
      gfx.fillStyle(shirt);
      gfx.fillRect(6, 15, 12, 14);
      // Arms up! (celebrating)
      gfx.fillStyle(skinColors[i % skinColors.length]);
      gfx.fillRect(2, 4, 3, 14);
      gfx.fillRect(19, 4, 3, 14);
      // Legs
      gfx.fillStyle(0x334455);
      gfx.fillRect(7, 29, 4, 9);
      gfx.fillRect(13, 29, 4, 9);
      gfx.generateTexture(key, 24, 38);
      gfx.destroy();
    });
  }

  // --- Sky: starts gray, then a bright blue sky fades in (color is back!) ---
  createSky() {
    const gray = this.add.graphics();
    gray.fillGradientStyle(0x555555, 0x555555, 0x999999, 0x999999);
    gray.fillRect(0, 0, 800, 600);

    const blue = this.add.graphics();
    blue.fillGradientStyle(0x3d9bff, 0x3d9bff, 0xcdeeff, 0xcdeeff);
    blue.fillRect(0, 0, 800, 600);
    blue.setAlpha(0);
    this.tweens.add({ targets: blue, alpha: 1, duration: 2500, delay: 800 });
  }

  // --- Buildings: gray ones with a colorful copy that fades in on top ---
  createBuildings() {
    const colors = [0xff6666, 0x66aaff, 0xffcc44, 0x66cc88, 0xcc88ff, 0xff9966, 0x44cccc];
    let x = -10;
    let i = 0;
    while (x < 800) {
      const w = 70 + (i * 37) % 50;
      const h = 150 + (i * 53) % 150;
      const top = GROUND_Y - h;

      // The gray building (the way the city looked before)
      const grayBuilding = this.add.graphics();
      grayBuilding.fillStyle(0x444444);
      grayBuilding.fillRect(x, top, w, h);

      // The colorful building, hidden at first
      const color = this.add.graphics();
      color.fillStyle(colors[i % colors.length]);
      color.fillRect(x, top, w, h);
      // Windows with lights on
      color.fillStyle(0xffffaa);
      for (let wy = top + 14; wy < GROUND_Y - 24; wy += 26) {
        for (let wx = x + 10; wx < x + w - 14; wx += 20) {
          color.fillRect(wx, wy, 10, 12);
        }
      }
      // Little roof
      color.fillStyle(0x884433);
      color.fillRect(x - 3, top - 6, w + 6, 8);
      color.setAlpha(0);

      // Each building gets its color one after the other, left to right
      this.tweens.add({ targets: color, alpha: 1, duration: 900, delay: 1200 + i * 250 });

      x += w + 8;
      i++;
    }
  }

  // --- Ground: gray street that turns into green grass ---
  createGround() {
    const gray = this.add.graphics();
    gray.fillStyle(0x333333);
    gray.fillRect(0, GROUND_Y, 800, 600 - GROUND_Y);

    const grass = this.add.graphics();
    grass.fillStyle(0x44bb55);
    grass.fillRect(0, GROUND_Y, 800, 600 - GROUND_Y);
    grass.fillStyle(0x66dd77);
    grass.fillRect(0, GROUND_Y, 800, 8);
    // Little flowers!
    const flowerColors = [0xff4466, 0xffee44, 0xffffff, 0xff88ff];
    for (let i = 0; i < 30; i++) {
      grass.fillStyle(flowerColors[i % flowerColors.length]);
      grass.fillCircle(15 + i * 27, GROUND_Y + 25 + (i * 17) % 50, 4);
    }
    grass.setAlpha(0);
    this.tweens.add({ targets: grass, alpha: 1, duration: 2000, delay: 1500 });
  }

  // --- Fluffy clouds that drift slowly ---
  createClouds() {
    for (let i = 0; i < 4; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.9);
      cloud.fillCircle(0, 0, 22);
      cloud.fillCircle(25, -8, 28);
      cloud.fillCircle(55, 0, 22);
      cloud.fillRect(0, 0, 55, 22);
      cloud.setPosition(60 + i * 220, 80 + (i % 2) * 60);
      cloud.setAlpha(0);
      this.tweens.add({ targets: cloud, alpha: 1, duration: 1500, delay: 2000 });
      this.tweens.add({
        targets: cloud,
        x: cloud.x + 60,
        duration: 6000 + i * 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  // --- The happy sun! It rises, spins its rays and smiles ---
  createSun() {
    const sun = this.add.container(650, 130);

    // Rays (a separate graphics so only the rays spin, not the face)
    const rays = this.add.graphics();
    rays.lineStyle(6, 0xffcc00);
    for (let a = 0; a < 12; a++) {
      const angle = (a / 12) * Math.PI * 2;
      rays.lineBetween(Math.cos(angle) * 52, Math.sin(angle) * 52,
                       Math.cos(angle) * 72, Math.sin(angle) * 72);
    }
    this.tweens.add({ targets: rays, angle: 360, duration: 12000, repeat: -1 });

    // Face
    const face = this.add.graphics();
    face.fillStyle(0xffdd33);
    face.fillCircle(0, 0, 46);
    face.fillStyle(0xffee77);
    face.fillCircle(-10, -12, 18); // shiny spot
    face.fillStyle(0x000000);
    face.fillCircle(-16, -8, 5); // eyes
    face.fillCircle(16, -8, 5);
    face.fillStyle(0xffffff);
    face.fillCircle(-17, -10, 2); // sparkle in the eyes
    face.fillCircle(15, -10, 2);
    // Big smile!
    face.lineStyle(4, 0x000000);
    face.beginPath();
    face.arc(0, 4, 24, 0.15 * Math.PI, 0.85 * Math.PI, false);
    face.strokePath();
    // Rosy cheeks
    face.fillStyle(0xff8866, 0.7);
    face.fillCircle(-30, 8, 6);
    face.fillCircle(30, 8, 6);

    sun.add([rays, face]);
    sun.setAlpha(0).setY(230);

    // The sun rises into the sky...
    this.tweens.add({ targets: sun, alpha: 1, y: 130, duration: 2000, delay: 1000, ease: 'Back.easeOut' });
    // ...and keeps bouncing happily
    this.tweens.add({
      targets: sun, scale: 1.12, duration: 600, delay: 3200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // --- People of the city, jumping with joy ---
  createPeople() {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const x = 30 + (i * 49) % 750;
      const y = GROUND_Y + 22 + (i * 13) % 50; // some stand a little closer to us
      const person = this.add.image(x, y, `person-${i % 6}`).setOrigin(0.5, 1);
      person.setAlpha(0).setDepth(y); // lower on the screen = in front
      this.tweens.add({ targets: person, alpha: 1, duration: 500, delay: 1800 + i * 120 });

      // Jump up and down! Everyone has their own rhythm
      this.tweens.add({
        targets: person,
        y: y - 40 - (i % 4) * 10,
        duration: 350 + (i % 5) * 60,
        delay: 2200 + i * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Quad.easeOut',
      });
    }

    // A few people shout thanks!
    const thanks = ['¡Gracias!', '¡Volvió el color!', '¡Viva!', '¡Eres un héroe!'];
    thanks.forEach((message, i) => {
      this.time.delayedCall(3500 + i * 1100, () => {
        const text = this.add.text(150 + i * 170, GROUND_Y - 30 - (i % 2) * 30, message, {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: '#ffffff',
          stroke: '#cc3366',
          strokeThickness: 5,
        }).setOrigin(0.5).setDepth(40);
        this.tweens.add({
          targets: text,
          y: text.y - 50,
          alpha: 0,
          duration: 2500,
          ease: 'Sine.easeOut',
          onComplete: () => text.destroy(),
        });
      });
    });
  }

  // --- Our hero, in the middle of the party! ---
  createHero() {
    if (!this.textures.exists('hero')) return;
    const hero = this.add.image(400, GROUND_Y + 60, 'hero').setOrigin(0.5, 1).setScale(2);
    hero.setDepth(GROUND_Y + 60);
    this.tweens.add({
      targets: hero,
      y: GROUND_Y + 60 - 70,
      duration: 450,
      delay: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeOut',
    });
  }

  // --- Confetti and floating hearts ---
  createConfetti() {
    if (!this.textures.exists('confetti')) {
      const gfx = this.add.graphics();
      gfx.fillStyle(0xffffff);
      gfx.fillRect(0, 0, 8, 8);
      gfx.generateTexture('confetti', 8, 8);
      gfx.destroy();
    }

    this.time.delayedCall(2500, () => {
      this.add.particles(0, 0, 'confetti', {
        x: { min: 0, max: 800 },
        y: { min: -20, max: -10 },
        speedY: { min: 60, max: 160 },
        speedX: { min: -30, max: 30 },
        rotate: { min: 0, max: 360 },
        scale: { min: 0.5, max: 1.2 },
        lifespan: 5000,
        quantity: 2,
        frequency: 90,
        tint: [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0088ff, 0x8800ff, 0xff44ff],
      }).setDepth(45);
    });

    // Hearts that float up from the street
    if (!this.textures.exists('heart-particle')) {
      const gfx = this.add.graphics();
      gfx.fillStyle(0xff3366);
      gfx.fillCircle(5, 5, 5);
      gfx.fillCircle(13, 5, 5);
      gfx.fillTriangle(0, 7, 18, 7, 9, 18);
      gfx.generateTexture('heart-particle', 18, 18);
      gfx.destroy();
    }
    this.time.delayedCall(3000, () => {
      this.add.particles(0, 0, 'heart-particle', {
        x: { min: 0, max: 800 },
        y: GROUND_Y + 40,
        speedY: { min: -120, max: -60 },
        speedX: { min: -20, max: 20 },
        scale: { start: 1, end: 0.3 },
        alpha: { start: 1, end: 0 },
        lifespan: 2500,
        frequency: 250,
      }).setDepth(45);
    });
  }

  // --- Title text ---
  createTexts() {
    const title = this.add.text(400, 230, '¡El color volvió\na la ciudad!', {
      fontFamily: 'Arial',
      fontSize: '44px',
      color: '#ffffff',
      align: 'center',
      stroke: '#cc3366',
      strokeThickness: 8,
      lineSpacing: 4,
    }).setOrigin(0.5).setDepth(50).setAlpha(0).setScale(0.5);

    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 900,
      delay: 3200,
      ease: 'Back.easeOut',
    });
  }
}

export default CelebrationScene;
