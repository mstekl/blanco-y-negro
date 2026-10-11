// achievements.js — The LOGROS (trophies)! 🏆
// The game counts everything we do, FOREVER (not only today, like the missions):
// villains, coins, levels, wins, countries, dances... When a number gets big
// enough, we win a LOGRO, and every logro gives coins.
//   - reportMission() (missions.js) tells us everything that happens: countStat()
//   - Some logros look at what we HAVE (skins, the level of the pass, the record)
// Everything is saved in the browser (localStorage).

import { addCoins } from './coins.js';
import { showToast } from '../ui/toast.js';
import { playSound } from '../audio/Sound.js';
import { loadPass, passLevel } from './pass.js';
import { loadRecord } from './record.js';
import { loadCosmetics } from './cosmetics.js';

const STATS_KEY = 'blancoYNegro.estadisticas';
const DONE_KEY = 'blancoYNegro.logros';
const SKINS_WON_KEY = 'blancoYNegro.skinsGanadas';

// Things that count the BEST time, not "one more" (like the wave we reached)
const BEST_ONLY = ['oleada', 'supervivencia'];

// The logros. "stat" = which number to look at, "goal" = how big it must be.
// The ones with "have" look at what we have instead of the numbers.
export const ACHIEVEMENTS = [
  { id: 'villano1', icon: '👾', name: 'Primer villano', text: 'Derrota a 1 villano', stat: 'villanos', goal: 1, coins: 10 },
  { id: 'villano100', icon: '💪', name: 'Cazavillanos', text: 'Derrota a 100 villanos', stat: 'villanos', goal: 100, coins: 50 },
  { id: 'villano1000', icon: '🦸', name: 'Superhéroe', text: 'Derrota a 1000 villanos', stat: 'villanos', goal: 1000, coins: 300 },
  { id: 'moneda100', icon: '🪙', name: 'Ahorrador', text: 'Junta 100 monedas en los niveles', stat: 'monedas', goal: 100, coins: 30 },
  { id: 'moneda1000', icon: '💰', name: 'Millonario', text: 'Junta 1000 monedas en los niveles', stat: 'monedas', goal: 1000, coins: 150 },
  { id: 'nivel1', icon: '🏁', name: 'Primer nivel', text: 'Termina 1 nivel', stat: 'niveles', goal: 1, coins: 10 },
  { id: 'nivel25', icon: '🗺', name: 'Viajero', text: 'Termina 25 niveles', stat: 'niveles', goal: 25, coins: 100 },
  { id: 'jefe', icon: '👑', name: 'Adiós jefe', text: 'Derrota al jefe final', stat: 'jefe', goal: 1, coins: 100 },
  { id: 'pais1', icon: '🎨', name: 'Primer color', text: 'Colorea 1 país', stat: 'paises', goal: 1, coins: 30 },
  { id: 'pais20', icon: '🌎', name: 'Pintor del mundo', text: 'Colorea 20 países', stat: 'paises', goal: 20, coins: 200 },
  { id: 'ganar1', icon: '🥇', name: 'Ganador', text: 'Gana 1 carrera, búsqueda o supervivencia', stat: 'ganar', goal: 1, coins: 20 },
  { id: 'ganar25', icon: '🏆', name: 'Campeón', text: 'Gana 25 veces', stat: 'ganar', goal: 25, coins: 150 },
  { id: 'online1', icon: '🌐', name: 'Amigos online', text: 'Gana una partida ONLINE', stat: 'online', goal: 1, coins: 50 },
  { id: 'juntos', icon: '👫', name: 'Mejores amigos', text: 'Termina 3 niveles en JUNTOS', stat: 'juntos', goal: 3, coins: 60 },
  { id: 'oleada10', icon: '🛡', name: 'Sobreviviente', text: 'Llega a la oleada 10 en SUPERVIVENCIA', stat: 'oleada', goal: 10, coins: 100 },
  { id: 'lapices50', icon: '✏️', name: 'Buscador', text: 'Encuentra 50 lápices buenos en la BÚSQUEDA', stat: 'lapices', goal: 50, coins: 80 },
  { id: 'misiones10', icon: '📋', name: 'Cumplidor', text: 'Completa 10 misiones del día', stat: 'misiones', goal: 10, coins: 100 },
  { id: 'bailes10', icon: '💃', name: 'Bailarín', text: 'Baila 10 veces', stat: 'baile', goal: 10, coins: 30 },
  { id: 'skins25', icon: '👕', name: 'Coleccionista', text: 'Ten 25 skins', have: 'skins', goal: 25, coins: 100 },
  { id: 'cosmeticos5', icon: '🎒', name: 'A la moda', text: 'Ten 5 bailes, mochilas o mascotas', have: 'cosmeticos', goal: 5, coins: 60 },
  { id: 'pase50', icon: '⭐', name: 'Medio pase', text: 'Llega al nivel 50 del PASE', have: 'pase', goal: 50, coins: 150 },
  { id: 'pase100', icon: '🌟', name: 'Pase completo', text: 'Llega al nivel 100 del PASE', have: 'pase', goal: 100, coins: 400 },
  { id: 'record', icon: '🔥', name: 'Récord', text: 'Haz 10.000 puntos en JUGAR', have: 'record', goal: 10000, coins: 100 },
];

function loadJSON(key, empty) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) || empty;
  } catch (e) {
    return empty; // Storage blocked or broken
  }
}

function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage blocked: it only lasts until the page is reloaded
  }
}

export function loadStats() {
  return loadJSON(STATS_KEY, {});
}

export function loadDone() {
  return loadJSON(DONE_KEY, []);
}

// Something happened (the same names as the missions: 'villanos', 'monedas'...)
export function countStat(event, amount = 1) {
  const stats = loadStats();
  const before = stats[event] || 0;
  stats[event] = BEST_ONLY.includes(event) ? Math.max(before, amount) : before + amount;
  saveJSON(STATS_KEY, stats);
  checkAchievements();
}

// How far we are in a logro: a number to compare with its goal
export function achievementValue(a, stats = loadStats()) {
  if (a.stat) return stats[a.stat] || 0;
  if (a.have === 'skins') return loadJSON(SKINS_WON_KEY, []).length + 1; // +1 = the hero, always ours
  if (a.have === 'cosmeticos') return loadCosmetics().owned.length;
  if (a.have === 'pase') return passLevel(loadPass());
  if (a.have === 'record') return loadRecord();
  return 0;
}

// Did we win new logros? Each new one gives its coins and a message at the top
export function checkAchievements() {
  const stats = loadStats();
  const done = loadDone();
  const fresh = ACHIEVEMENTS.filter((a) => !done.includes(a.id) && achievementValue(a, stats) >= a.goal);
  if (fresh.length === 0) return;
  fresh.forEach((a) => {
    done.push(a.id);
    addCoins(a.coins);
    showToast(`🏆 ¡LOGRO: ${a.name}! ${a.text}  +${a.coins} 🪙`, '#ffaa33');
  });
  playSound('mision');
  saveJSON(DONE_KEY, done);
}
