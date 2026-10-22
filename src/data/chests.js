// chests.js — What comes out of a treasure chest (cofre)!
// There is one chest hidden in every level. Touch it and it opens with a surprise:
//   🪙 coins (most of the time), ⭐ stars for the PASE, or a surprise SKIN (rare).
// If the surprise is a skin we already have, we get coins instead.

import { addCoins, pickRandomSkin } from './coins.js';
import { addStars } from './pass.js';
import { loadSkins, saveSkins } from './skins.js';

// How many "tickets" each kind of surprise has (more tickets = comes out more often)
const SURPRISES = [
  { kind: 'monedas', tickets: 60 },
  { kind: 'estrellas', tickets: 25 },
  { kind: 'skin', tickets: 15 },
];

function pickSurprise() {
  const total = SURPRISES.reduce((sum, s) => sum + s.tickets, 0);
  let ticket = Math.random() * total;
  for (const s of SURPRISES) {
    ticket -= s.tickets;
    if (ticket < 0) return s.kind;
  }
  return 'monedas';
}

// Open a chest: give the prize, and give back the words to show (and their color)
export function openChest(registry) {
  const kind = pickSurprise();

  if (kind === 'estrellas') {
    const stars = 50 + Math.floor(Math.random() * 3) * 25; // 50, 75 or 100
    addStars(stars);
    return { text: `⭐ +${stars} estrellas del PASE`, color: '#ffd700' };
  }

  if (kind === 'skin') {
    const skin = pickRandomSkin();
    const { won, chosen } = loadSkins(registry);
    if (!won.has(skin.id)) {
      won.add(skin.id);
      saveSkins(registry, won, chosen);
      return { text: `👕 ¡Skin sorpresa: ${skin.name}!`, color: '#cc66ff' };
    }
  }

  // Coins (also when the skin was already ours)
  const coins = 10 + Math.floor(Math.random() * 21); // 10 to 30
  addCoins(coins);
  return { text: `🪙 +${coins} monedas`, color: '#ffd700' };
}
