// BlockManager.js — The SECRET BLOCKS (bloques secretos), like in Mario!
//
// A golden block with a "?" floats in the air. Jump and hit it with your head
// from BELOW and a coin jumps out of it. Every block has some coins inside
// (3 if the level doesn't say), and when it is empty it turns into a brown
// "used" block that is just a normal brick.
//
// Some blocks are INVISIBLE: you can't see them and you can walk right through
// them... but if you jump in the right place, BONK! The block appears.
//
// In the level data (levels.js) they look like this:
//   blocks: [
//     { x: 400, y: 440 },                       // a ? block with 3 coins
//     { x: 700, y: 440, coins: 5 },             // a ? block with 5 coins
//     { x: 1000, y: 440, hidden: true },        // an invisible block
//   ]
// (x, y) is the CENTER of the block. Blocks are 32×32.
//
// In the levels of the EDITOR the coins are only points: otherwise we could
// draw a level full of blocks and get rich (see CustomLevelScene.js).

import { addCoins, makeCoinTexture } from '../data/coins.js';
import { reportMission } from '../data/missions.js';
import { playSound } from '../audio/Sound.js';

const SIZE = 32;
const DEFAULT_COINS = 3;
// After a hit, the block waits a moment before it can be hit again
// (otherwise one jump could take 2 coins in two frames in a row)
const HIT_COOLDOWN = 250;

// Make the pictures of the blocks (only the first time)
export function makeBlockTextures(scene) {
  if (!scene.textures.exists('block-question')) {
    // A canvas lets us write the "?" with a real letter
    const texture = scene.textures.createCanvas('block-question', SIZE, SIZE);
    const ctx = texture.getContext();
    ctx.fillStyle = '#8a5a00'; // dark border
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#ffc21a'; // gold
    ctx.fillRect(2, 2, SIZE - 4, SIZE - 4);
    ctx.fillStyle = '#ffe680'; // a shine on the top and the left
    ctx.fillRect(2, 2, SIZE - 4, 3);
    ctx.fillRect(2, 2, 3, SIZE - 4);
    // Four little screws in the corners
    ctx.fillStyle = '#8a5a00';
    [[6, 6], [SIZE - 8, 6], [6, SIZE - 8], [SIZE - 8, SIZE - 8]].forEach(([x, y]) => ctx.fillRect(x, y, 2, 2));
    // The "?"
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#8a5a00';
    ctx.fillText('?', SIZE / 2 + 1, SIZE / 2 + 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('?', SIZE / 2, SIZE / 2 + 1);
    texture.refresh();
  }

  if (!scene.textures.exists('block-used')) {
    // The empty block: brown, with its screws, but no "?"
    const gfx = scene.add.graphics();
    gfx.fillStyle(0x4a2e14);
    gfx.fillRect(0, 0, SIZE, SIZE);
    gfx.fillStyle(0x9a6434);
    gfx.fillRect(2, 2, SIZE - 4, SIZE - 4);
    gfx.fillStyle(0x4a2e14);
    [[6, 6], [SIZE - 8, 6], [6, SIZE - 8], [SIZE - 8, SIZE - 8]].forEach(([x, y]) => gfx.fillRect(x, y, 2, 2));
    gfx.generateTexture('block-used', SIZE, SIZE);
    gfx.destroy();
  }
}

class BlockManager {
  constructor(scene, blockList = []) {
    this.scene = scene;
    makeBlockTextures(scene);
    makeCoinTexture(scene);

    // Static = the blocks never move by themselves (only the little "bonk" jump)
    this.group = scene.physics.add.staticGroup();
    for (const config of blockList) {
      const block = this.group.create(config.x, config.y, 'block-question');
      block.coinsLeft = config.coins || DEFAULT_COINS;
      block.hidden = Boolean(config.hidden);
      block.lastHit = 0;
      // An invisible block is there (it has a body), but we can't see it
      if (block.hidden) block.setAlpha(0);
    }
  }

  // Make a hero bump into the blocks (called for every hero, JUNTOS has two)
  addHero(hero) {
    this.scene.physics.add.collider(
      hero, this.group,
      (h, block) => this.heroTouchesBlock(h, block),
      // An invisible block is only solid when we hit it from BELOW: we can walk
      // and fall through it, so nobody bumps into a wall they can't see
      (h, block) => !block.hidden || (h.body.velocity.y < 0 && h.body.top > block.body.bottom - 12),
      this
    );
  }

  // The hero touched a block. Was it with the head, from below?
  heroTouchesBlock(hero, block) {
    if (!hero.body.touching.up && !hero.body.blocked.up) return;
    const now = this.scene.time.now;
    if (now - block.lastHit < HIT_COOLDOWN) return;
    block.lastHit = now;

    // BONK! The block jumps up a little and comes back
    playSound('bloque');
    this.scene.tweens.add({ targets: block, y: block.y - 8, duration: 70, yoyo: true });

    // An invisible block appears forever
    if (block.hidden) {
      block.hidden = false;
      block.setAlpha(1);
      this.scene.showFloatingText(block.x, block.y - 40, '¡Bloque secreto!');
    }

    if (block.coinsLeft <= 0) return; // already empty: just a brick
    block.coinsLeft -= 1;
    this.popCoin(block);
    if (block.coinsLeft === 0) block.setTexture('block-used');
  }

  // A coin jumps out of the top of the block, spins and disappears
  popCoin(block) {
    const scene = this.scene;
    const coin = scene.add.image(block.x, block.y - SIZE / 2, 'coin').setDepth(5);
    scene.tweens.add({ targets: coin, y: coin.y - 60, duration: 300, ease: 'Quad.easeOut', yoyo: true });
    scene.tweens.add({ targets: coin, scaleX: 0.2, duration: 120, yoyo: true, repeat: 2 });
    scene.time.delayedCall(560, () => coin.destroy());

    playSound('moneda');
    if (scene.blocksGiveCoins === false) {
      // The levels of the editor: points instead of real coins
      scene.hero.addScore(10);
      scene.saveState();
      scene.hud.updateScore(scene.hero.score);
      scene.showFloatingText(block.x, block.y - 50, '+10');
      return;
    }
    const total = addCoins(1);
    reportMission('monedas');
    scene.hud.updateCoins(total);
    scene.showFloatingText(block.x, block.y - 50, '+1');
  }

  // Take all the blocks away (the modes that have no coins, like the BÚSQUEDA)
  clear() {
    this.group.clear(true, true);
  }
}

export default BlockManager;
