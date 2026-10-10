// coins.js — The coins we pick up in the levels, and the pencils we buy with them.
// The normal way to win skins is to buy a pencil (lápiz) with coins and open it:
// it PAINTS a surprise skin! (The secret way is still the codes in the Hacks de sala.)

import { SKIN_LIST, PASS_SKIN_IDS } from './skins.js';
import { PENCIL_SKINS } from '../sprites/PencilSkins.js';
import { PASS_SKINS } from '../sprites/PassSkins.js';

// The browser remembers our coins, even after closing the page
const COINS_KEY = 'blancoYNegro.monedas';

// How many coins one pencil costs
export const PENCIL_PRICE = 25;

// If the browser doesn't let us save, we keep the coins here (until the page is reloaded)
let coinsInMemory = 0;

export function loadCoins() {
  try {
    return Number(window.localStorage.getItem(COINS_KEY)) || 0;
  } catch (e) {
    return coinsInMemory;
  }
}

export function saveCoins(amount) {
  coinsInMemory = amount;
  try {
    window.localStorage.setItem(COINS_KEY, String(amount));
  } catch (e) {
    // Storage blocked: the coins only last until the page is reloaded
  }
}

// Add (or take away, with a negative number) coins and return how many we have now
export function addCoins(amount) {
  const total = Math.max(0, loadCoins() + amount);
  saveCoins(total);
  return total;
}

// The picture of a gold coin (levels, HUD, sala and the LÁPICES screen all use it).
// It has a darker border and a little shine.
export function makeCoinTexture(scene) {
  if (scene.textures.exists('coin')) return;
  const gfx = scene.add.graphics();
  gfx.fillStyle(0xb8860b);
  gfx.fillCircle(10, 10, 10);
  gfx.fillStyle(0xffd700);
  gfx.fillCircle(10, 10, 7.5);
  gfx.fillStyle(0xfff3a0);
  gfx.fillRect(7, 5, 3, 9); // the shine
  gfx.generateTexture('coin', 20, 20);
  gfx.destroy();
}

// ---------------------------------------------------------------
// Rarity: some skins come out a lot, others almost never.
// "weight" is how many "tickets" each skin of that rarity has in the raffle:
// a común skin has 10 tickets, the legendary one only 1!
// ---------------------------------------------------------------
export const RARITIES = {
  comun: { name: 'COMÚN', color: '#dddddd', weight: 10 },
  raro: { name: 'RARO', color: '#55aaff', weight: 4 },
  epico: { name: 'ÉPICO', color: '#cc66ff', weight: 2 },
  legendario: { name: 'LEGENDARIO', color: '#ffcc00', weight: 1 },
};

// Which rarity each skin has (the normal hero never comes out: he is always ours)
export const SKIN_RARITY = {
  mr1: 'comun',
  mr2: 'comun',
  lapiz: 'comun',
  gato: 'comun',
  robot: 'comun',
  perro: 'raro',
  ninja: 'raro',
  astronauta: 'raro',
  mr3: 'raro',
  nube: 'epico',
  dino: 'epico',
  super: 'epico',
  jefe: 'legendario',
};
// The skins of the pack say their own rarity
PENCIL_SKINS.forEach((skin) => { SKIN_RARITY[skin.id] = skin.rarity; });
// The skins of the PASE BLANCO Y NEGRO have a rarity too (the skins screen shows it)...
PASS_SKINS.forEach((skin) => { SKIN_RARITY[skin.id] = skin.rarity; });

// Open a pencil: pick a skin at random, using the tickets of each rarity.
// Like putting all the tickets in a hat and taking one out with closed eyes.
export function pickRandomSkin() {
  // ...but they are NOT in the hat: only the pass gives them, never a pencil
  const prizes = SKIN_LIST.filter((skin) => SKIN_RARITY[skin.id] && !PASS_SKIN_IDS.includes(skin.id));
  const tickets = (skin) => RARITIES[SKIN_RARITY[skin.id]].weight;
  const totalTickets = prizes.reduce((sum, skin) => sum + tickets(skin), 0);

  let ticket = Math.random() * totalTickets;
  for (const skin of prizes) {
    ticket -= tickets(skin);
    if (ticket < 0) return skin;
  }
  return prizes[prizes.length - 1]; // (only happens if the math rounds a tiny bit)
}
