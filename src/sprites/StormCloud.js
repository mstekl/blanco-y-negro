// StormCloud.js — An angry storm cloud that follows the hero and throws pencils!
// It throws BLACK and WHITE pencils (no color anywhere...). It can't be
// defeated, so the hero has to keep moving and dodge.
// When the level ends, colored pencils appear in the cloud and turn it
// into a happy, normal cloud.

import Phaser from 'phaser';

// The colors of the pencils that cure the cloud
const COLOR_PENCILS = [0xff3333, 0xff8800, 0xffdd00, 0x33cc55, 0x3399ff, 0xaa44ff];

class StormCloud extends Phaser.GameObjects.Image {
  constructor(scene, x, y, hero, config = {}) {
    StormCloud.createTextures(scene);
    super(scene, x, y, 'storm-cloud');
    scene.add.existing(this);
    this.setDepth(30);

    this.hero = hero;
    this.speed = config.speed || 120;          // How fast it flies after the hero
    this.fireRate = config.fireRate || 1400;   // Milliseconds between pencils
    this.baseY = y;                            // It floats around this height
    this.nextFire = scene.time.now + 2000;     // Short pause before the first pencil
    this.nextPencilIsBlack = true;
    this.isHappy = false;

    // Group for the flying pencils (no gravity — they fly straight)
    this.pencils = scene.physics.add.group({ allowGravity: false });
  }

  // Called every frame by the LevelScene
  update(time, delta) {
    if (this.isHappy) return;
    const dt = delta / 1000;

    // Fly toward the hero (a little wobble so it feels alive)
    const targetX = this.hero.x + Math.sin(time / 900) * 70;
    const dx = targetX - this.x;
    const vx = Phaser.Math.Clamp(dx * 2, -this.speed, this.speed);
    this.x = Phaser.Math.Clamp(this.x + vx * dt, 0, this.scene.levelData.worldWidth);
    this.y = this.baseY + Math.sin(time / 500) * 12;
    // Lean a little in the direction of travel
    this.setAngle(Phaser.Math.Clamp(vx / 12, -8, 8));

    // Throw a pencil!
    if (time > this.nextFire) {
      this.nextFire = time + this.fireRate;
      this.throwPencil();
    }
  }

  // Throw a pencil aimed at the hero (black and white take turns)
  throwPencil() {
    const key = this.nextPencilIsBlack ? 'pencil-black' : 'pencil-white';
    this.nextPencilIsBlack = !this.nextPencilIsBlack;

    const pencil = this.pencils.create(this.x, this.y + 30, key);
    pencil.body.setSize(8, 24);

    // Aim at the hero, with a tiny random spread so it's not too perfect
    const angle = Phaser.Math.Angle.Between(pencil.x, pencil.y, this.hero.x, this.hero.y)
      + Phaser.Math.FloatBetween(-0.12, 0.12);
    const pencilSpeed = 230;
    pencil.setVelocity(Math.cos(angle) * pencilSpeed, Math.sin(angle) * pencilSpeed);
    // The texture draws the pencil tip pointing DOWN, so we turn it 90 degrees
    pencil.setRotation(angle - Math.PI / 2);

    // Pencils disappear after a while (so they don't pile up off-screen)
    this.scene.time.delayedCall(3500, () => { if (pencil.active) pencil.destroy(); });
  }

  // The cloud gets cured! Colored pencils pop up and the cloud turns happy.
  // (Called from the level's final animation.)
  turnHappy() {
    if (this.isHappy) return;
    this.isHappy = true;
    const scene = this.scene;

    // Remove the dangerous pencils that were still flying
    this.pencils.clear(true, true);
    this.setAngle(0);

    // Colored pencils appear one by one around the cloud
    COLOR_PENCILS.forEach((color, i) => {
      const key = `pencil-color-${i}`;
      const angle = -Math.PI / 2 + (i - 2.5) * 0.45; // a fan above the cloud
      const px = this.x + Math.cos(angle) * 70;
      const py = this.y + Math.sin(angle) * 55 + 10;
      const pencil = scene.add.image(this.x, this.y, key)
        .setDepth(31).setScale(0).setRotation(angle + Math.PI / 2);
      scene.tweens.add({
        targets: pencil,
        x: px,
        y: py,
        scale: 1.4,
        duration: 500,
        delay: 300 + i * 250,
        ease: 'Back.easeOut',
      });
    });

    // After all the pencils are in, the cloud changes into a happy cloud!
    scene.time.delayedCall(300 + COLOR_PENCILS.length * 250 + 500, () => {
      this.setTexture('cloud-happy');
      scene.cameras.main.flash(300, 255, 255, 255);
      // A happy little bounce
      scene.tweens.add({
        targets: this,
        scale: 1.15,
        duration: 300,
        yoyo: true,
        repeat: 2,
      });
    });
  }

  // Draw all the textures (only the first time)
  static createTextures(scene) {
    // --- Pencils: tip pointing down. Black, white and the 6 colors ---
    const drawPencil = (key, bodyColor, outlineColor) => {
      if (scene.textures.exists(key)) return;
      const gfx = scene.add.graphics();
      gfx.fillStyle(0xff9999);
      gfx.fillRect(0, 0, 10, 5);              // eraser
      gfx.fillStyle(0xaaaaaa);
      gfx.fillRect(0, 5, 10, 3);              // metal band
      gfx.fillStyle(bodyColor);
      gfx.fillRect(0, 8, 10, 18);             // body
      gfx.lineStyle(1, outlineColor);
      gfx.strokeRect(0.5, 8.5, 9, 17);        // outline (so white shows on light colors)
      gfx.fillStyle(0xe8c48a);
      gfx.fillTriangle(0, 26, 10, 26, 5, 34); // wood tip
      gfx.fillStyle(bodyColor);
      gfx.fillTriangle(3, 31, 7, 31, 5, 34);  // pencil lead
      gfx.generateTexture(key, 10, 34);
      gfx.destroy();
    };
    drawPencil('pencil-black', 0x111111, 0x888888);
    drawPencil('pencil-white', 0xffffff, 0x444444);
    COLOR_PENCILS.forEach((color, i) => drawPencil(`pencil-color-${i}`, color, 0x333333));

    // --- The cloud shape (shared by the angry and the happy cloud) ---
    const drawCloudShape = (gfx, main, shade) => {
      gfx.fillStyle(shade);
      gfx.fillCircle(35, 52, 28);
      gfx.fillCircle(75, 56, 28);
      gfx.fillCircle(105, 52, 24);
      gfx.fillRect(35, 52, 70, 32);
      gfx.fillStyle(main);
      gfx.fillCircle(35, 46, 28);
      gfx.fillCircle(68, 32, 34);
      gfx.fillCircle(102, 46, 26);
      gfx.fillRect(35, 46, 68, 30);
    };

    // --- Angry storm cloud ---
    if (!scene.textures.exists('storm-cloud')) {
      const gfx = scene.add.graphics();
      drawCloudShape(gfx, 0x4a4a55, 0x2e2e38);
      // Angry eyes
      gfx.fillStyle(0xffffff);
      gfx.fillEllipse(52, 46, 18, 16);
      gfx.fillEllipse(86, 46, 18, 16);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(55, 49, 5);
      gfx.fillCircle(83, 49, 5);
      // Angry eyebrows
      gfx.lineStyle(5, 0x000000);
      gfx.lineBetween(40, 32, 62, 40);
      gfx.lineBetween(98, 32, 76, 40);
      // Frown
      gfx.lineStyle(4, 0x000000);
      gfx.beginPath();
      gfx.arc(69, 78, 14, 1.15 * Math.PI, 1.85 * Math.PI, false);
      gfx.strokePath();
      // Little lightning bolt
      gfx.fillStyle(0xffee33);
      gfx.fillTriangle(60, 86, 76, 86, 62, 104);
      gfx.fillTriangle(66, 98, 80, 98, 64, 116);
      gfx.generateTexture('storm-cloud', 140, 120);
      gfx.destroy();
    }

    // --- Happy normal cloud (after the cure!) ---
    if (!scene.textures.exists('cloud-happy')) {
      const gfx = scene.add.graphics();
      drawCloudShape(gfx, 0xffffff, 0xd8ecff);
      // Happy eyes
      gfx.fillStyle(0x000000);
      gfx.fillCircle(54, 46, 5);
      gfx.fillCircle(84, 46, 5);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(53, 44, 2);
      gfx.fillCircle(83, 44, 2);
      // Big smile
      gfx.lineStyle(4, 0x000000);
      gfx.beginPath();
      gfx.arc(69, 54, 16, 0.15 * Math.PI, 0.85 * Math.PI, false);
      gfx.strokePath();
      // Rosy cheeks
      gfx.fillStyle(0xff9999, 0.8);
      gfx.fillCircle(42, 58, 6);
      gfx.fillCircle(96, 58, 6);
      gfx.generateTexture('cloud-happy', 140, 120);
      gfx.destroy();
    }
  }
}

export default StormCloud;
