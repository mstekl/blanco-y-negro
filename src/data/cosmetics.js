// cosmetics.js — BAILES (dances), MOCHILAS (backpacks) and MASCOTAS (pets)!
// Like in Fortnite, they don't make the hero stronger: they just look cool.
//   💃 BAILES:   press Q (or 💃) and the hero dances. Online, our friends see it too!
//   🎒 MOCHILAS: something on the hero's back (a pencil case, wings, a rocket...)
//   🐾 MASCOTAS: a little friend that follows the hero everywhere
// We win them in the TIENDA (with coins) or in the PASE BLANCO Y NEGRO
// (the ones with "pass: true" are ONLY in the pass), and put them on in the CASILLERO.
// How they look and move is in src/sprites/Cosmetics.js
// Everything is saved in the browser (localStorage).

import { loadCoins, addCoins } from './coins.js';

const SAVE_KEY = 'blancoYNegro.cosmeticos';

// The names of the three kinds, for the screens
export const COSMETIC_TYPES = {
  baile: { name: 'BAILES', icon: '💃' },
  mochila: { name: 'MOCHILAS', icon: '🎒' },
  mascota: { name: 'MASCOTAS', icon: '🐾' },
};

// How much they cost in the TIENDA, by rarity
export const COSMETIC_PRICES = { comun: 40, raro: 80, epico: 150, legendario: 300 };

// All of them. "icon" is the picture of a dance (dances have no drawing of their own)
export const COSMETICS = [
  // --- Bailes ---
  { id: 'saludo', type: 'baile', name: 'Saludo', rarity: 'comun', icon: '👋' }, // everybody has it
  { id: 'pasito', type: 'baile', name: 'Pasito', rarity: 'comun', icon: '👟' },
  { id: 'saltitos', type: 'baile', name: 'Saltitos', rarity: 'comun', icon: '🐸' },
  { id: 'trompo', type: 'baile', name: 'Trompo', rarity: 'raro', icon: '🌀' },
  { id: 'robot', type: 'baile', name: 'Baile robot', rarity: 'raro', icon: '🤖', pass: true },
  { id: 'voltereta', type: 'baile', name: 'Voltereta', rarity: 'epico', icon: '🤸' },
  { id: 'disco', type: 'baile', name: 'Fiebre disco', rarity: 'epico', icon: '🕺', pass: true },
  { id: 'gigante', type: 'baile', name: 'Gigante', rarity: 'legendario', icon: '💥' },
  // --- Mochilas ---
  { id: 'estuche', type: 'mochila', name: 'Estuche de lápices', rarity: 'comun' },
  { id: 'mochilaArcoiris', type: 'mochila', name: 'Mochila arcoíris', rarity: 'raro' },
  { id: 'tablero', type: 'mochila', name: 'Mochila ajedrez', rarity: 'raro', pass: true },
  { id: 'cohete', type: 'mochila', name: 'Cohete', rarity: 'epico' },
  { id: 'alasTinta', type: 'mochila', name: 'Alas de tinta', rarity: 'epico', pass: true },
  { id: 'alasArcoiris', type: 'mochila', name: 'Alas arcoíris', rarity: 'legendario' },
  // --- Mascotas ---
  { id: 'perrito', type: 'mascota', name: 'Perrito', rarity: 'comun' },
  { id: 'gatito', type: 'mascota', name: 'Gatito', rarity: 'comun' },
  { id: 'pajarito', type: 'mascota', name: 'Pajarito', rarity: 'raro' },
  { id: 'pandita', type: 'mascota', name: 'Pandita', rarity: 'raro', pass: true },
  { id: 'fantasmita', type: 'mascota', name: 'Fantasmita', rarity: 'epico' },
  { id: 'unicornio', type: 'mascota', name: 'Unicornio', rarity: 'legendario' },
  { id: 'dragoncito', type: 'mascota', name: 'Dragoncito', rarity: 'legendario', pass: true },
];

export function findCosmetic(id) {
  return COSMETICS.find((c) => c.id === id);
}

// What we have, and what we are wearing:
//   { owned: ['saludo', 'perrito'], baile: 'saludo', mochila: null, mascota: 'perrito' }
export function loadCosmetics() {
  const state = { owned: ['saludo'], baile: 'saludo', mochila: null, mascota: null };
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    if (saved) {
      if (Array.isArray(saved.owned)) state.owned = [...new Set(['saludo', ...saved.owned])];
      // We can only wear things we have
      Object.keys(COSMETIC_TYPES).forEach((type) => {
        if (saved[type] && state.owned.includes(saved[type])) state[type] = saved[type];
      });
    }
  } catch (e) {
    // Storage blocked or broken: only the Saludo
  }
  return state;
}

function saveCosmetics(state) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    // Storage blocked: they only last until the page is reloaded
  }
}

// The one we are wearing of a kind ('baile', 'mochila' or 'mascota'), or null
export function equipped(type) {
  return loadCosmetics()[type];
}

// Put one on (or take it off: id = null)
export function equip(type, id) {
  const state = loadCosmetics();
  if (id !== null && !state.owned.includes(id)) return;
  state[type] = id;
  saveCosmetics(state);
}

// A present (from the pass): gives back false if we already had it
export function giveCosmetic(id) {
  const state = loadCosmetics();
  if (state.owned.includes(id)) return false;
  state.owned.push(id);
  // A brand new mochila or mascota goes on right away, if we had none
  const { type } = findCosmetic(id);
  if (type !== 'baile' && !state[type]) state[type] = id;
  saveCosmetics(state);
  return true;
}

// Buy one in the TIENDA. Gives back the words that say why not, or null if it worked
export function buyCosmetic(id) {
  const cosmetic = findCosmetic(id);
  const price = COSMETIC_PRICES[cosmetic.rarity];
  if (loadCosmetics().owned.includes(id)) return '¡Ya es tuyo!';
  if (loadCoins() < price) return 'No te alcanzan las monedas';
  addCoins(-price);
  giveCosmetic(id);
  return null;
}

// The 4 things of the day in the TIENDA (never the ones of the pass).
// Like the skins of the day: picked with the date, so they change every day
export function cosmeticsOfTheDay() {
  const d = new Date();
  let seed = d.getFullYear() * 500 + d.getMonth() * 37 + d.getDate() * 3 + 11;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const choices = COSMETICS.filter((c) => !c.pass && c.id !== 'saludo');
  const picked = [];
  while (picked.length < 4 && choices.length) {
    picked.push(choices.splice(Math.floor(random() * choices.length), 1)[0]);
  }
  return picked;
}
