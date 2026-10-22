// HalloweenManager.js — Halloween inside the levels 🎃 (only during the event, see src/data/halloween.js)
//   - addPumpkins():   puts 3 CALABAZAS on the platforms of a level. They live in the
//                      SAME group as the coins, so the modes with no coins (BÚSQUEDA,
//                      LAVA, the editor's levels...) take them away by themselves too
//   - dressUpEnemies(): every villain gets a costume on the head: a witch hat,
//                      a pumpkin or little devil horns
//   - the drawings of the pumpkin and the costumes

import Phaser from 'phaser';

const PUMPKINS_PER_LEVEL = 3;

// ---------------------------------------------------------------
// The drawings (made once, the first time we need them)
// ---------------------------------------------------------------
export function makeHalloweenTextures(scene) {
  if (scene.textures.exists('calabaza')) return;
  const g = scene.add.graphics();

  // The pumpkin of the levels: 26 x 24, with a green stem and a happy face
  g.fillStyle(0x3a9a2a);
  g.fillRect(12, 0, 3, 6);
  g.fillStyle(0xff7a00);
  g.fillEllipse(13, 14, 26, 19);
  g.fillStyle(0xc85a00);
  g.fillRect(7, 6, 1.5, 16);
  g.fillRect(18, 6, 1.5, 16);
  g.fillStyle(0x221100);
  g.fillTriangle(5, 13, 10, 13, 7.5, 9);
  g.fillTriangle(16, 13, 21, 13, 18.5, 9);
  g.fillRect(7, 16, 12, 3);
  g.generateTexture('calabaza', 26, 24);
  g.clear();

  // A witch hat (purple, with a gold buckle): 24 x 16
  g.fillStyle(0x4a1a6a);
  g.fillEllipse(12, 14, 24, 4);
  g.fillTriangle(5, 14, 19, 14, 15, 0);
  g.fillStyle(0xffcc00);
  g.fillRect(9, 10, 6, 2.5);
  g.generateTexture('disfraz-bruja', 24, 16);
  g.clear();

  // A pumpkin to wear like a hat: 20 x 15
  g.fillStyle(0x3a9a2a);
  g.fillRect(9, 0, 2, 4);
  g.fillStyle(0xff7a00);
  g.fillEllipse(10, 9, 20, 12);
  g.fillStyle(0x221100);
  g.fillTriangle(4, 9, 8, 9, 6, 6);
  g.fillTriangle(12, 9, 16, 9, 14, 6);
  g.fillRect(6, 11, 8, 1.5);
  g.generateTexture('disfraz-calabaza', 20, 15);
  g.clear();

  // Red devil horns: 22 x 9
  g.fillStyle(0xdd2222);
  g.fillTriangle(1, 9, 7, 9, 2, 0);
  g.fillTriangle(21, 9, 15, 9, 20, 0);
  g.generateTexture('disfraz-cuernos', 22, 9);
  g.destroy();
}

// ---------------------------------------------------------------
// The pumpkins of a level
// ---------------------------------------------------------------
// We put them on 3 platforms spread along the level (left, middle and right),
// sitting on the platform, next to the edge, so we have to go and look for them.
export function addPumpkins(scene, coins, platformList) {
  makeHalloweenTextures(scene);
  // Not too close to the start, and only platforms wide enough to stand on
  const places = platformList
    .filter((p) => p.width >= 64 && p.x > 300)
    .sort((a, b) => a.x - b.x);
  if (!places.length) return;

  for (let i = 0; i < PUMPKINS_PER_LEVEL; i++) {
    const plat = places[Math.floor((places.length * (i + 0.5)) / PUMPKINS_PER_LEVEL)];
    const pumpkin = coins.create(plat.x + 18, plat.y - 12, 'calabaza');
    pumpkin.isPumpkin = true;
    // It wobbles a little, like it is laughing
    scene.tweens.add({
      targets: pumpkin, angle: { from: -8, to: 8 }, duration: 700,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }
}

// ---------------------------------------------------------------
// The costumes of the villains
// ---------------------------------------------------------------
const COSTUMES = ['disfraz-bruja', 'disfraz-calabaza', 'disfraz-cuernos'];

// Dress up every villain of the group... and the ones that come later
// (the waves of the survival, the little Doble-X that split): the group
// calls "createCallback" every time something is added to it
export function dressUpEnemies(scene, enemies) {
  makeHalloweenTextures(scene);
  enemies.getChildren().forEach((enemy) => dressUp(scene, enemy));
  enemies.createCallback = (enemy) => dressUp(scene, enemy);
}

function dressUp(scene, enemy) {
  if (enemy.costume) return;
  const hat = scene.add.image(enemy.x, enemy.y, Phaser.Utils.Array.GetRandom(COSTUMES));
  enemy.costume = hat;

  // After every frame (when the villain already moved), the hat goes on its head.
  // It shrinks and fades with the villain when we defeat it
  const follow = () => {
    if (!enemy.active) {
      cleanUp();
      return;
    }
    const top = enemy.getTopCenter();
    hat.setPosition(top.x, top.y + 2 * Math.abs(enemy.scaleY))
      .setScale(Math.abs(enemy.scaleX), Math.abs(enemy.scaleY))
      .setFlipX(enemy.flipX)
      .setAlpha(enemy.alpha)
      .setVisible(enemy.visible)
      .setDepth(enemy.depth + 0.1);
  };
  const cleanUp = () => {
    scene.events.off('postupdate', follow);
    scene.events.off('shutdown', cleanUp);
    hat.destroy();
  };
  scene.events.on('postupdate', follow);
  scene.events.once('shutdown', cleanUp);
  follow();
}
