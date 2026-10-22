// halloween.js — The HALLOWEEN EVENT! 🎃
// For a few days every year (from October 20 to November 2, so it also has
// the Día de Muertos) the game dresses up for Halloween:
//   - 3 CALABAZAS (pumpkins) are hidden in every level. Picking them up
//     fills the event counter, and the counter gives PRIZES (see PRIZES below)
//   - the villains wear costumes (src/managers/HalloweenManager.js)
//   - the sala gets an orange moon, bats and pumpkins
// The pumpkins are saved per YEAR: next Halloween we start again from 0.
// Testing shortcut: ?halloween in the URL turns the event on any day,
// ?halloween=no turns it off.

import { loadSkins, saveSkins } from './skins.js';
import { addCoins } from './coins.js';

// The days of the event: [month, day] (months start at 1 = January)
const START = [10, 20];
const END = [11, 2];

// The prizes: how many pumpkins we need, and the skin we win (drawn in HalloweenSkins.js).
// These skins never come out of the pencils, and the hack "T" doesn't give them
export const PRIZES = [
  { pumpkins: 5, id: 'hwEsqueleto', name: 'Skin Esqueleto', icon: '💀' },
  { pumpkins: 10, id: 'hwLobo', name: 'Skin Hombre Lobo', icon: '🐺' },
  { pumpkins: 16, id: 'hwFrankie', name: 'Skin Frankenstein', icon: '🧟' },
  { pumpkins: 23, id: 'hwCatrina', name: 'Skin Catrina', icon: '💐' },
  { pumpkins: 31, id: 'hwReyCalabaza', name: 'Skin Rey Calabaza', icon: '👑' },
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

// Give a prize (a skin we already have gives 50 coins instead)
function givePrize(registry, prize) {
  const { won, chosen } = loadSkins(registry);
  if (won.has(prize.id)) addCoins(50);
  else {
    won.add(prize.id);
    saveSkins(registry, won, chosen);
  }
}
