// shop.js — The TIENDA (shop): we buy power-ups with our coins!
// What we buy waits in our "backpack" (saved in the browser). When we start
// a new game of JUGAR or SUPERVIVENCIA, we take ONE of each thing we have
// out of the backpack, and the hero starts with it:
//   🛡 Escudo         → starts with a shield
//   ❤ Vida extra      → starts with one more life
//   🎨 Lápiz de color → can shoot from the start

import { loadCoins, addCoins } from './coins.js';
import { HERO } from '../utils/constants.js';

const SAVE_KEY = 'blancoYNegro.mochila';

// The things in the shop
//   texture: the picture (the same one the power-up has in the levels)
export const SHOP_ITEMS = [
  { id: 'escudo', name: 'Escudo', price: 15, texture: 'powerup-shield', text: 'Empiezas con un escudo' },
  { id: 'vida', name: 'Vida extra', price: 20, texture: 'powerup-extra-life', text: 'Empiezas con una vida más' },
  { id: 'lapiz', name: 'Lápiz de color', price: 25, texture: 'powerup-color-pencil', text: 'Puedes disparar desde el principio' },
];

// The most of each thing we can have in the backpack
export const MAX_EACH = 5;

// Our backpack: how many of each thing, like { escudo: 2, vida: 0, lapiz: 1 }
export function loadBackpack() {
  const backpack = { escudo: 0, vida: 0, lapiz: 0 };
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    if (saved) Object.keys(backpack).forEach((id) => { backpack[id] = saved[id] || 0; });
  } catch (e) {
    // Storage blocked or broken: an empty backpack
  }
  return backpack;
}

function saveBackpack(backpack) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(backpack));
  } catch (e) {
    // Storage blocked: the backpack only lasts until the page is reloaded
  }
}

// Buy one thing. Gives back a message if we can't (not enough coins, backpack full)
export function buy(id) {
  const item = SHOP_ITEMS.find((it) => it.id === id);
  const backpack = loadBackpack();
  if (backpack[id] >= MAX_EACH) return `Ya tienes ${MAX_EACH}: ¡úsalos primero!`;
  if (loadCoins() < item.price) return 'No te alcanzan las monedas';
  addCoins(-item.price);
  backpack[id] += 1;
  saveBackpack(backpack);
  return null;
}

// A present (from the PASE BLANCO Y NEGRO): one more in the backpack, for free.
// Gives back false if the backpack already has the most of that thing.
export function addToBackpack(id) {
  const backpack = loadBackpack();
  if (backpack[id] >= MAX_EACH) return false;
  backpack[id] += 1;
  saveBackpack(backpack);
  return true;
}

// A new game starts: we take ONE of each thing out of the backpack.
// They wait in the registry (the memory shared by all scenes) until the
// first level is built, and then useShopItems() gives them to the hero.
export function takeShopItems(registry) {
  const backpack = loadBackpack();
  const taken = {};
  Object.keys(backpack).forEach((id) => {
    if (backpack[id] > 0) {
      backpack[id] -= 1;
      taken[id] = true;
    }
  });
  saveBackpack(backpack);
  registry.set('compras', taken);
}

// The level is ready: give the hero the things we took (only once)
export function useShopItems(scene) {
  const taken = scene.registry.get('compras');
  if (!taken) return;
  scene.registry.set('compras', null);
  const hero = scene.hero;
  if (taken.escudo) hero.addShield();
  if (taken.vida) {
    hero.lives = Math.min(HERO.MAX_LIVES, hero.lives + 1);
    scene.saveState();
    scene.hud.updateLives(hero.lives);
  }
  if (taken.lapiz) {
    hero.hasColorGun = true;
    scene.hud.showColorGun(true);
  }
  // A message so we know what we brought from the shop
  const names = SHOP_ITEMS.filter((it) => taken[it.id]).map((it) => it.name);
  if (names.length) scene.showCheatMessage(`🎒 De la tienda: ${names.join(', ')}`);
}
