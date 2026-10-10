// missions.js — The MISIONES DEL DÍA (missions of the day)!
// Every day there are 3 new missions: one easy, one medium and one hard.
// Finishing a mission gives coins (to buy pencils). The missions are the same
// for the whole day, and change by themselves the next day.
//
// How it works:
//   - The game tells us when something happens, with reportMission('villanos'),
//     reportMission('monedas'), etc. (see the "event" of each mission below)
//   - If a mission of TODAY listens to that event, its progress goes up
//   - When the progress reaches the goal: the coins are ours, and a message
//     pops up at the top of the screen
// Everything is saved in the browser (localStorage).

import { addCoins } from './coins.js';
import { playSound } from '../audio/Sound.js';
import { showToast } from '../ui/toast.js';
import { addStars, starsFor, MISSION_STARS } from './pass.js';

const SAVE_KEY = 'blancoYNegro.misiones';

// All the missions that can come out.
//   event: what the game reports (reportMission(event, amount))
//   max:   true = the progress is the BEST number (like "survive 60 seconds"),
//          not added up
const MISSIONS = {
  facil: [
    { id: 'monedas10', text: 'Junta 10 monedas en los niveles', event: 'monedas', goal: 10, reward: 10 },
    { id: 'villanos5', text: 'Derrota a 5 villanos', event: 'villanos', goal: 5, reward: 10 },
    { id: 'nivel1', text: 'Completa 1 nivel', event: 'niveles', goal: 1, reward: 10 },
    { id: 'maquinaFacil', text: 'Gánale a la máquina en FÁCIL', event: 'maquina-facil', goal: 1, reward: 10 },
    { id: 'lapices5', text: 'Encuentra 5 lápices buenos en la BÚSQUEDA', event: 'lapices', goal: 5, reward: 10 },
    { id: 'sobrevive30', text: 'Aguanta 30 segundos en SUPERVIVENCIA', event: 'supervivencia', goal: 30, reward: 10, max: true },
  ],
  media: [
    { id: 'monedas30', text: 'Junta 30 monedas en los niveles', event: 'monedas', goal: 30, reward: 20 },
    { id: 'villanos15', text: 'Derrota a 15 villanos', event: 'villanos', goal: 15, reward: 20 },
    { id: 'niveles3', text: 'Completa 3 niveles', event: 'niveles', goal: 3, reward: 20 },
    { id: 'maquinaNormal', text: 'Gánale a la máquina en NORMAL', event: 'maquina-normal', goal: 1, reward: 20 },
    { id: 'carreras2', text: 'Gana 2 carreras o búsquedas (máquina u online)', event: 'ganar', goal: 2, reward: 20 },
    { id: 'sobrevive60', text: 'Aguanta 60 segundos en SUPERVIVENCIA', event: 'supervivencia', goal: 60, reward: 20, max: true },
  ],
  dificil: [
    { id: 'villanos40', text: 'Derrota a 40 villanos', event: 'villanos', goal: 40, reward: 40 },
    { id: 'maquinaDificil', text: 'Gánale a la máquina en DIFÍCIL', event: 'maquina-dificil', goal: 1, reward: 40 },
    { id: 'online1', text: 'Gana una partida ONLINE', event: 'online', goal: 1, reward: 40 },
    { id: 'pais1', text: 'Dale color a un país del mapa', event: 'paises', goal: 1, reward: 40 },
    { id: 'sobrevive120', text: 'Aguanta 2 minutos en SUPERVIVENCIA', event: 'supervivencia', goal: 120, reward: 40, max: true },
    { id: 'oleada6', text: 'Llega a la oleada 6 en SUPERVIVENCIA', event: 'oleada', goal: 6, reward: 40, max: true },
  ],
};
export const TIERS = ['facil', 'media', 'dificil'];
export const TIER_NAMES = { facil: 'FÁCIL', media: 'MEDIA', dificil: 'DIFÍCIL' };

// Today as text, like "2026-10-10" (the missions change when this changes)
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// A number made from the date, so everybody gets the SAME missions on the
// same day (and the same ones again if we reload the page)
function dayNumber(date) {
  return [...date].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 100000, 7);
}

// The 3 missions of today: one of each tier
export function todaysMissions() {
  const n = dayNumber(today());
  return TIERS.map((tier, i) => {
    const list = MISSIONS[tier];
    return { ...list[(n + i * 7) % list.length], tier };
  });
}

// What we did today: { date, progress: { missionId: number }, done: { missionId: true } }
function load() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    if (saved && saved.date === today()) return saved;
  } catch (e) {
    // Storage blocked or broken: start the day fresh
  }
  return { date: today(), progress: {}, done: {} };
}

function save(state) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    // Storage blocked: the missions only count until the page is reloaded
  }
}

// The missions of today, with how far we got in each one
export function missionStatus() {
  const state = load();
  return todaysMissions().map((m) => ({
    ...m,
    progress: Math.min(m.goal, state.progress[m.id] || 0),
    done: Boolean(state.done[m.id]),
  }));
}

// The game tells us something happened. For example:
//   reportMission('villanos')         → we defeated 1 villain
//   reportMission('supervivencia', 45) → we survived 45 seconds
export function reportMission(event, amount = 1) {
  // Everything we do gives ⭐ stars for the PASE BLANCO Y NEGRO (see pass.js)
  addStars(starsFor(event, amount));

  const state = load();
  let changed = false;
  let completed = 0;
  todaysMissions().forEach((m) => {
    if (m.event !== event || state.done[m.id]) return;
    const before = state.progress[m.id] || 0;
    state.progress[m.id] = m.max ? Math.max(before, amount) : before + amount;
    changed = true;
    if (state.progress[m.id] >= m.goal) {
      // Mission complete! The coins are ours right away
      state.done[m.id] = true;
      addCoins(m.reward);
      playSound('mision');
      showToast(`✅ ¡Misión completada! ${m.text}  +${m.reward} 🪙`);
      completed += 1;
    }
  });
  if (changed) save(state);
  // A finished mission gives many stars too
  if (completed) addStars(completed * MISSION_STARS);
}
