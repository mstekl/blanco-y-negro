// skins.js — Everything about the skins we can win and wear.
// The sala (TitleScene) and the skins screen (SkinsScene) both use this,
// so we keep it in ONE place.

import { SKINS } from '../sprites/Hero.js';

// The browser remembers the skins we won and the one we chose, even after closing the page
const SKINS_WON_KEY = 'blancoYNegro.skinsGanadas';
const SKIN_CHOSEN_KEY = 'blancoYNegro.skinElegida';

// All the skins, in the order they appear ("heroe" is the normal hero, always ours)
export const SKIN_LIST = [
  { id: 'heroe', name: 'Héroe' },
  { id: 'mr1', name: 'MR.1' },
  { id: 'mr2', name: 'MR.2' },
  { id: 'perro', name: 'Perro loco' },
  { id: 'mr3', name: 'MR.3 (tanque)' },
  { id: 'jefe', name: 'El jefe final' },
  { id: 'nube', name: 'Nube de tormenta' },
  { id: 'lapiz', name: 'Lápiz de color' },
  { id: 'ninja', name: 'Ninja arcoíris' },
];

// The secret codes of the "Hacks de sala", and which skins each one gives us.
// They are written WITHOUT spaces, because spaces don't matter: "B Y N" and "byn" are the same code
export const SKIN_CODES = {
  byn: ['mr1', 'mr2'],
  lebron: ['perro'],
  goma: ['mr3'],
  na: ['ninja'],
  n5c: ['nube'],
  lp: ['lapiz'],
  jf: ['jefe'],
};

// Which skins did we win, and which one are we wearing?
// The registry (the memory shared by all scenes) wins over the browser storage.
export function loadSkins(registry) {
  const won = new Set(['heroe']); // the normal hero is always ours
  let chosen = registry.get('skin') || null;
  try {
    const saved = JSON.parse(window.localStorage.getItem(SKINS_WON_KEY));
    if (Array.isArray(saved)) saved.forEach((id) => won.add(id));
    if (chosen === null) chosen = window.localStorage.getItem(SKIN_CHOSEN_KEY);
  } catch (e) {
    // Storage blocked: we just start with the normal hero
  }
  // We can only wear a skin we really won
  return { won, chosen: chosen && won.has(chosen) ? chosen : 'heroe' };
}

// Remember the skins (in the browser AND in the registry, so the hero is born with it)
export function saveSkins(registry, won, chosen) {
  registry.set('skin', chosen === 'heroe' ? null : chosen);
  try {
    window.localStorage.setItem(SKINS_WON_KEY, JSON.stringify([...won]));
    window.localStorage.setItem(SKIN_CHOSEN_KEY, chosen);
  } catch (e) {
    // Storage blocked: the skins only last until the page is reloaded
  }
}

// The picture (texture) of a skin. Villain pictures are drawn by code
// the first time we need them.
export function skinTexture(scene, id) {
  const skin = SKINS[id];
  if (!skin) return 'hero';
  if (!scene.textures.exists(skin.texture)) skin.make.createTexture(scene);
  return skin.texture;
}

// Make an image fit inside a box of "size" pixels (big or small pictures look the same size)
export function fitImage(image, size) {
  image.setScale(size / Math.max(image.width, image.height));
}
