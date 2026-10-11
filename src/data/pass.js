// pass.js — The PASE BLANCO Y NEGRO (our "battle pass", like in Fortnite)!
//
//   - Playing gives ⭐ STARS: defeating villains, completing levels, winning
//     races, finishing missions... (see STAR_VALUES below)
//   - Every 100 stars we go up one LEVEL of the pass. There are 100 levels.
//   - Every level gives us 1 🏅 MEDALLA. Like the battle stars of Fortnite,
//     we SPEND the medals to unlock the prizes WE choose.
//   - The prizes are in 10 PAGES of 8 prizes: 4 GRATIS (for everybody) and
//     4 PREMIUM (only with the PREMIUM pass, 950 coins, like the 950 V-Bucks).
//     Unlocking 4 prizes of a page opens the next page.
//     All the prizes together cost exactly 100 medals: reach level 100 and you can have them all!
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

export const PASS_LEVELS = 100;
export const STARS_PER_LEVEL = 100;
export const PREMIUM_PRICE = 950; // like the 950 V-Bucks of Fortnite
export const MISSION_STARS = 50;
export const PAGE_COUNT = 10;
export const PRIZES_TO_OPEN_PAGE = 4; // unlock 4 prizes of a page to open the next one

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
// The 10 pages of prizes. Every page has the same shape:
//   GRATIS:  coins, a power-up, coins (or a skin on pages 5 and 10), a power-up
//   PREMIUM: coins, a power-up, more coins, and THE BIG SKIN of the page
// Coins and power-ups cost 1 medal. The big skin costs more on later pages
// (2, then 3, then 4), so all the 80 prizes cost exactly 100 medals.
// The skins are drawn in src/sprites/PassSkins.js
// ---------------------------------------------------------------
const PAGE_SKINS = [
  'paseCaballero', 'pasePinguino', 'pasePanda', 'paseDomino', 'paseTiburon',
  'paseMago', 'paseSamurai', 'paseFantasma', 'paseDragon', 'paseRey',
];
const FREE_SKINS = { 5: 'paseExplorador', 10: 'paseCebra' };
const ITEM_IDS = SHOP_ITEMS.map((item) => item.id); // escudo, vida, lapiz

// The 8 prizes of a page (page = 1 to 10). Each prize is like
//   { id: '3-8', row: 'premium', type: 'skin', id: ..., cost: 2 }
// with type 'coins' (+ amount), 'item' (+ item) or 'skin' (+ skin)
export function pagePrizes(page) {
  const season = currentSeason();
  const item = (n) => ITEM_IDS[(page + season + n) % ITEM_IDS.length];
  const skinCost = page <= 3 ? 2 : page <= 7 ? 3 : 4;
  const prizes = [
    { row: 'gratis', type: 'coins', amount: 20 + page * 5, cost: 1 },
    { row: 'gratis', type: 'item', item: item(0), cost: 1 },
    FREE_SKINS[page]
      ? { row: 'gratis', type: 'skin', skin: FREE_SKINS[page], cost: 1 }
      : { row: 'gratis', type: 'coins', amount: 30 + page * 5, cost: 1 },
    { row: 'gratis', type: 'item', item: item(1), cost: 1 },
    { row: 'premium', type: 'coins', amount: 50 + page * 10, cost: 1 },
    { row: 'premium', type: 'item', item: item(2), cost: 1 },
    { row: 'premium', type: 'coins', amount: 80 + page * 10, cost: 1 },
    { row: 'premium', type: 'skin', skin: PAGE_SKINS[page - 1], cost: skinCost },
  ];
  // Each prize gets a name like "3-8" (page 3, prize 8), to remember which ones we took
  return prizes.map((prize, i) => ({ ...prize, id: `${page}-${i + 1}` }));
}

// The words for a prize, like "25 monedas" or "Escudo"
export function prizeText(prize, skinName = null) {
  if (prize.type === 'coins') return `${prize.amount} monedas`;
  if (prize.type === 'item') return SHOP_ITEMS.find((item) => item.id === prize.item).name;
  return `Skin: ${skinName || prize.skin}`;
}

// ---------------------------------------------------------------
// Saving: { season, stars, premium: true/false, claimed: ['1-1', '1-8', ...] }
// ---------------------------------------------------------------
export function loadPass() {
  const season = currentSeason();
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    if (saved && saved.season === season) {
      // Older saves (before the pages) had no "claimed" list
      if (!Array.isArray(saved.claimed)) saved.claimed = [];
      return saved;
    }
  } catch (e) {
    // Storage blocked or broken: a fresh pass
  }
  // A new season: everything starts again from zero
  return { season, stars: 0, premium: false, claimed: [] };
}

function savePass(pass) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(pass));
  } catch (e) {
    // Storage blocked: the pass only lasts until the page is reloaded
  }
}

// Our level in the pass (0 to 100)
export function passLevel(pass = loadPass()) {
  return Math.min(PASS_LEVELS, Math.floor(pass.stars / STARS_PER_LEVEL));
}

// Find a prize by its name ("3-8")
function findPrize(id) {
  const page = Number(id.split('-')[0]);
  return pagePrizes(page).find((prize) => prize.id === id);
}

// The medals we still have: one per level, minus the ones we spent
export function medalsLeft(pass = loadPass()) {
  const spent = pass.claimed.reduce((sum, id) => sum + (findPrize(id)?.cost || 0), 0);
  return Math.max(0, passLevel(pass) - spent);
}

// How many prizes of a page we already took
export function claimedOnPage(pass, page) {
  return pass.claimed.filter((id) => id.startsWith(`${page}-`)).length;
}

// Page 1 is always open. The others open after taking 4 prizes of the page before
export function isPageOpen(pass, page) {
  return page === 1 || claimedOnPage(pass, page - 1) >= PRIZES_TO_OPEN_PAGE;
}

// ---------------------------------------------------------------
// Getting stars and going up levels (each level = 1 medal)
// ---------------------------------------------------------------
// quiet = true: no message for every level
// (the hack "100 niv p" jumps many levels at once: 100 messages would take minutes!)
// Gives back how many levels we went up.
export function addStars(amount, quiet = false) {
  if (!amount) return 0;
  const pass = loadPass();
  const before = passLevel(pass);
  pass.stars += amount;
  savePass(pass);
  const after = passLevel(pass);
  if (!quiet) {
    for (let level = before + 1; level <= after; level++) {
      playSound('mision');
      showToast(`⭐ ¡Nivel ${level} del PASE! +1 🏅 medalla: elige un premio en el PASE`, '#ffd700');
    }
  }
  return after - before;
}

// Unlock a prize with our medals. Gives back null if it worked, or the words
// that say why it can't be done
export function claimPrize(id) {
  const pass = loadPass();
  const prize = findPrize(id);
  const page = Number(id.split('-')[0]);
  if (!prize) return 'Ese premio no existe';
  if (pass.claimed.includes(id)) return '¡Ya es tuyo!';
  if (!isPageOpen(pass, page)) return `Primero desbloquea ${PRIZES_TO_OPEN_PAGE} premios de la página ${page - 1}`;
  if (prize.row === 'premium' && !pass.premium) return 'Este premio es del PASE PREMIUM 👑';
  const medals = medalsLeft(pass);
  if (medals < prize.cost) {
    return `Necesitas ${prize.cost} 🏅 (tienes ${medals}). ¡Juega para subir de nivel!`;
  }
  givePrize(prize);
  pass.claimed.push(id);
  savePass(pass);
  return null;
}

// Buy the PREMIUM pass (for this season)
export function buyPremium() {
  const pass = loadPass();
  if (pass.premium) return 'Ya tienes el PASE PREMIUM';
  if (loadCoins() < PREMIUM_PRICE) return `Necesitas ${PREMIUM_PRICE.toLocaleString('es')} monedas`;
  addCoins(-PREMIUM_PRICE);
  pass.premium = true;
  savePass(pass);
  return null;
}

// Give one prize
function givePrize(prize) {
  if (prize.type === 'coins') {
    addCoins(prize.amount);
  } else if (prize.type === 'item') {
    // A full backpack? Then coins instead
    if (!addToBackpack(prize.item)) addCoins(15);
  } else if (!winSkin(prize.skin)) {
    // We already had that skin (from an older season): coins instead
    addCoins(100);
  }
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
