// pass.js — The PASE BLANCO Y NEGRO (our "battle pass", like in Fortnite)!
//
//   - Playing gives ⭐ STARS: defeating villains, completing levels, winning
//     races, finishing missions... (see STAR_VALUES below)
//   - Every 100 stars we go up one LEVEL of the pass. There are 50 levels.
//   - Every level has a prize in the GRATIS row (for everybody) and a prize in
//     the PREMIUM row (only if we bought the PREMIUM pass, with 1.000.000 coins).
//     The prizes are given right away when we reach the level.
//   - Every month a new SEASON (temporada) starts: the pass goes back to level 0
//     (and PREMIUM must be bought again). The prizes we won are ours forever.
// Everything is saved in the browser (localStorage).

import { addCoins, loadCoins } from './coins.js';
import { addToBackpack, SHOP_ITEMS } from './shop.js';
import { showToast } from '../ui/toast.js';
import { playSound } from '../audio/Sound.js';

const SAVE_KEY = 'blancoYNegro.pase';
// The same key the skins screen uses to remember the skins we won (src/data/skins.js)
const SKINS_WON_KEY = 'blancoYNegro.skinsGanadas';

export const PASS_LEVELS = 50;
export const STARS_PER_LEVEL = 100;
export const PREMIUM_PRICE = 1000000; // one MILLION coins!
export const MISSION_STARS = 50;

// How many stars each thing gives (the same names the missions use, see missions.js)
const STAR_VALUES = {
  villanos: 5,     // each villain defeated
  monedas: 1,      // each coin picked up
  niveles: 30,     // each level completed
  lapices: 5,      // each good pencil found in the BÚSQUEDA
  ganar: 40,       // each race, search or survival won (machine or online)
  online: 20,      // ...and a bit more when it was online
  paises: 60,      // each country colored on the map
  oleada: 10,      // each wave reached in SUPERVIVENCIA
};

export function starsFor(event, amount = 1) {
  // "oleada" says WHICH wave we reached, not how many: it is always one more wave
  if (event === 'oleada') return STAR_VALUES.oleada;
  return (STAR_VALUES[event] || 0) * amount;
}

// ---------------------------------------------------------------
// The season: season 1 is October 2026, season 2 November 2026...
// ---------------------------------------------------------------
export function currentSeason() {
  const now = new Date();
  return (now.getFullYear() - 2026) * 12 + now.getMonth() - 9 + 1;
}

// How many days until the next season starts
export function daysLeftInSeason() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((next - now) / (24 * 60 * 60 * 1000));
}

// ---------------------------------------------------------------
// The prizes. They change a little every season (the coins and the
// order of the power-ups), and the special skins are at the big levels:
//   GRATIS:  a skin at levels 25 and 50
//   PREMIUM: a skin at levels 10, 20, 30, 40 and 50 (the last one is LEGENDARIA!)
// The skins are drawn in src/sprites/PassSkins.js
// ---------------------------------------------------------------
const FREE_SKINS = { 25: 'paseExplorador', 50: 'paseCebra' };
const PREMIUM_SKINS = { 10: 'paseCaballero', 20: 'pasePanda', 30: 'paseDomino', 40: 'paseFantasma', 50: 'paseRey' };
const ITEM_IDS = SHOP_ITEMS.map((item) => item.id); // escudo, vida, lapiz

// The prize of a level: { type: 'coins', amount } or { type: 'item', id } or { type: 'skin', id }
export function prizeFor(row, level) {
  const season = currentSeason();
  if (row === 'gratis') {
    if (FREE_SKINS[level]) return { type: 'skin', id: FREE_SKINS[level] };
    if (level % 5 === 0) return { type: 'item', id: ITEM_IDS[(level / 5 + season) % ITEM_IDS.length] };
    return { type: 'coins', amount: 10 + ((level + season) % 3) * 5 };
  }
  if (PREMIUM_SKINS[level]) return { type: 'skin', id: PREMIUM_SKINS[level] };
  if (level % 3 === 0) return { type: 'item', id: ITEM_IDS[(level / 3 + season) % ITEM_IDS.length] };
  return { type: 'coins', amount: 25 + ((level + season) % 3) * 5 };
}

// The words for a prize, like "25 monedas" or "Escudo"
export function prizeText(prize, skinName = null) {
  if (prize.type === 'coins') return `${prize.amount} monedas`;
  if (prize.type === 'item') return SHOP_ITEMS.find((item) => item.id === prize.id).name;
  return `Skin: ${skinName || prize.id}`;
}

// ---------------------------------------------------------------
// Saving: { season, stars, premium: true/false }
// ---------------------------------------------------------------
export function loadPass() {
  const season = currentSeason();
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    if (saved && saved.season === season) return saved;
  } catch (e) {
    // Storage blocked or broken: a fresh pass
  }
  // A new season: everything starts again from zero
  return { season, stars: 0, premium: false };
}

function savePass(pass) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(pass));
  } catch (e) {
    // Storage blocked: the pass only lasts until the page is reloaded
  }
}

// Our level in the pass (0 to 50)
export function passLevel(pass = loadPass()) {
  return Math.min(PASS_LEVELS, Math.floor(pass.stars / STARS_PER_LEVEL));
}

// ---------------------------------------------------------------
// Getting stars, going up levels, and giving the prizes
// ---------------------------------------------------------------
export function addStars(amount) {
  if (!amount) return;
  const pass = loadPass();
  const before = passLevel(pass);
  pass.stars += amount;
  savePass(pass);
  const after = passLevel(pass);
  // Every new level gives its prizes
  for (let level = before + 1; level <= after; level++) {
    const prizes = [givePrize(prizeFor('gratis', level))];
    if (pass.premium) prizes.push(givePrize(prizeFor('premium', level)));
    playSound('mision');
    showToast(`⭐ ¡Nivel ${level} del PASE BLANCO Y NEGRO!  ${prizes.join(' + ')}`, '#ffd700');
  }
}

// Buy the PREMIUM pass: we also get the premium prizes of the levels we already reached
export function buyPremium() {
  const pass = loadPass();
  if (pass.premium) return 'Ya tienes el PASE PREMIUM';
  if (loadCoins() < PREMIUM_PRICE) return `Necesitas ${PREMIUM_PRICE.toLocaleString('es')} monedas`;
  addCoins(-PREMIUM_PRICE);
  pass.premium = true;
  savePass(pass);
  for (let level = 1; level <= passLevel(pass); level++) givePrize(prizeFor('premium', level));
  return null;
}

// Give one prize. Gives back the words for it (for the message)
function givePrize(prize) {
  if (prize.type === 'coins') {
    addCoins(prize.amount);
  } else if (prize.type === 'item') {
    // A full backpack? Then coins instead
    if (!addToBackpack(prize.id)) {
      addCoins(15);
      return '15 monedas';
    }
  } else if (!winSkin(prize.id)) {
    // We already had that skin (from an older season): coins instead
    addCoins(100);
    return '100 monedas';
  }
  return prizeText(prize);
}

// Add a skin to the ones we won. Gives back false if we already had it
function winSkin(id) {
  try {
    const won = JSON.parse(window.localStorage.getItem(SKINS_WON_KEY)) || [];
    if (won.includes(id)) return false;
    won.push(id);
    window.localStorage.setItem(SKINS_WON_KEY, JSON.stringify(won));
  } catch (e) {
    // Storage blocked: we can't keep it
  }
  return true;
}
