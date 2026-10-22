// halloween.js — The HALLOWEEN EVENT! 🎃
// For a few days every year (from October 20 to November 2, so it also has
// the Día de Muertos) the game dresses up for Halloween:
//   - 3 CALABAZAS (pumpkins) are hidden in every level. Picking them up
//     fills the event counter, and the counter gives PRIZES (see PRIZES below)
//   - the villains wear costumes (src/managers/HalloweenManager.js)
//   - the TIENDA sells the 4 Halloween skins instead of the skins of the day
//   - the sala gets an orange moon, bats and pumpkins
// The pumpkins are saved per YEAR: next Halloween we start again from 0.
// Testing shortcut: ?halloween in the URL turns the event on any day,
// ?halloween=no turns it off.

import { loadSkins, saveSkins } from './skins.js';
import { giveCosmetic } from './cosmetics.js';
import { addCoins } from './coins.js';
import { HALLOWEEN_SKINS } from '../sprites/HalloweenSkins.js';

// The days of the event: [month, day] (months start at 1 = January)
const START = [10, 20];
const END = [11, 2];

// The 4 skins of the TIENDA during the event, and the big prize (drawn in HalloweenSkins.js).
// They never come out of the pencils, and the hack "T" doesn't give them
export const HALLOWEEN_SHOP_SKINS = HALLOWEEN_SKINS.filter((s) => s.shop).map((s) => s.id);
export const HALLOWEEN_PRIZE_SKIN = 'hwReyCalabaza';

// The baile, mochila and mascota of Halloween (only won with pumpkins)
export const HALLOWEEN_COSMETIC_IDS = ['murcielago', 'zombiBaile', 'cubetaDulces'];

// The prizes: how many pumpkins we need, and what we win
//   kind: 'cosmetico' (baile/mochila/mascota), 'skin' or 'monedas'
export const PRIZES = [
  { pumpkins: 5, kind: 'cosmetico', id: 'murcielago', name: 'Mascota Murciélago', icon: '🦇' },
  { pumpkins: 12, kind: 'cosmetico', id: 'zombiBaile', name: 'Baile Zombi', icon: '🧟' },
  { pumpkins: 20, kind: 'cosmetico', id: 'cubetaDulces', name: 'Mochila Cubeta de dulces', icon: '🍬' },
  { pumpkins: 31, kind: 'skin', id: HALLOWEEN_PRIZE_SKIN, name: 'Skin Rey Calabaza', icon: '👑' },
];
export const MAX_PUMPKINS = PRIZES[PRIZES.length - 1].pumpkins;

// Is today a Halloween day? (the URL can say yes or no, for testing)
export function isHalloween(date = new Date()) {
  const wanted = new URLSearchParams(window.location.search).get('halloween');
  if (wanted !== null) return wanted !== 'no';
  const today = (date.getMonth() + 1) * 100 + date.getDate(); // October 25 → 1025
  return today >= START[0] * 100 + START[1] && today <= END[0] * 100 + END[1];
}

// How many days are left (today counts), for the sala: "¡Quedan 5 días!"
export function daysLeft(date = new Date()) {
  const end = new Date(date.getFullYear(), END[0] - 1, END[1]);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(1, Math.round((end - today) / 86400000) + 1);
}

// One counter for each year: "blancoYNegro.halloween2026"
function saveKey() {
  return `blancoYNegro.halloween${new Date().getFullYear()}`;
}

// If the browser doesn't let us save, we keep the pumpkins here (until the page is reloaded)
let pumpkinsInMemory = 0;

// How many pumpkins we picked up this year
export function loadPumpkins() {
  try {
    return Number(window.localStorage.getItem(saveKey())) || 0;
  } catch (e) {
    return pumpkinsInMemory;
  }
}

// We picked up a pumpkin! Gives back the prize we just won (or null)
// so the level can show a big message.
export function addPumpkin(registry) {
  const total = loadPumpkins() + 1;
  pumpkinsInMemory = total;
  try {
    window.localStorage.setItem(saveKey(), String(total));
  } catch (e) {
    // Storage blocked: the pumpkins only last until the page is reloaded
  }
  const prize = PRIZES.find((p) => p.pumpkins === total);
  if (prize) givePrize(registry, prize);
  return { total, prize };
}

// Give a prize (something we already have gives 50 coins instead)
function givePrize(registry, prize) {
  if (prize.kind === 'cosmetico') {
    if (!giveCosmetic(prize.id)) addCoins(50);
  } else if (prize.kind === 'skin') {
    const { won, chosen } = loadSkins(registry);
    if (won.has(prize.id)) addCoins(50);
    else {
      won.add(prize.id);
      saveSkins(registry, won, chosen);
    }
  }
}
