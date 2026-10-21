// mundial.js — The MUNDIAL of the FÚTBOL: choose a country and win the World Cup!
//
//   1) GRUPOS: a group of 4 countries, everybody plays everybody (3 matches).
//      The first 2 of the group go on (a tie is a tie here, like in the TEMPORADA).
//   2) CUARTOS DE FINAL, 3) SEMIFINAL: one match, the winner goes on.
//      A tie? PENALES!
//   4) LA FINAL: ONLINE against a friend (each one on their own device),
//      or against the robot if there is no friend around.
// Win the final = ¡CAMPEÓN DEL MUNDO! Everything is saved in the browser.

import { randomCountries } from './soccerTeams.js';
import { roundRobin, playRound, standings } from './temporada.js';

const KEY = 'blancoYNegro.mundial';

export const STAGES = ['grupos', 'cuartos', 'semi', 'final'];
export const STAGE_NAMES = { grupos: 'FASE DE GRUPOS', cuartos: 'CUARTOS DE FINAL', semi: 'SEMIFINAL', final: '¡LA FINAL!' };
// How good the robot is in each stage
export const STAGE_LEVEL = { grupos: 'normal', cuartos: 'normal', semi: 'normalPlus', final: 'dificil' };
// Coins: a won match, getting to the next stage, and the cup
export const PRIZES = { win: 10, draw: 3, nextStage: 20, champion: 300 };

export function loadMundial() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY));
    if (saved && saved.country && saved.stage) return saved;
  } catch (e) {
    // Broken or blocked: no Mundial
  }
  return null;
}

export function saveMundial(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // Storage blocked: the Mundial lasts until the page is reloaded
  }
}

// A new Mundial with our country: a group with 3 other random countries
export function newMundial(country, titles = 0) {
  const others = randomCountries(3, [country.id]).map((c) => ({ kind: 'pais', id: c.id }));
  const teams = [country, ...others];
  return {
    country,
    titles,
    stage: 'grupos',
    // The group works exactly like a little TEMPORADA (see temporada.js)
    group: { teams, fixtures: roundRobin(4), table: teams.map(() => ({ pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 })), round: 0, over: false },
    rival: null,       // the rival of the next match (after the groups)
    beaten: others.map((c) => c.id), // countries we already met (no repeats)
    result: null,      // 'campeon' or 'eliminado' when the Mundial is over
  };
}

// Our next rival: in the groups, from the table; after that, a new country
export function rivalFor(state) {
  if (state.stage === 'grupos') {
    const pair = state.group.fixtures[state.group.round].find((p) => p.includes(0));
    return state.group.teams[pair[0] === 0 ? pair[1] : pair[0]];
  }
  if (!state.rival) {
    const [country] = randomCountries(1, [state.country.id, ...state.beaten]);
    state.rival = { kind: 'pais', id: country.id };
  }
  return state.rival;
}

// We played a match: what happens now? Gives back a little report for the screen:
//   { won, tie, passed, message }
export function applyMatch(state, ours, theirs, wonOnPenalties) {
  if (state.stage === 'grupos') {
    playRound(state.group, ours, theirs);
    if (!state.group.over) return { won: ours > theirs, tie: ours === theirs };
    // The group is over: the first 2 go on
    const place = standings(state.group).findIndex((row) => row.team === 0) + 1;
    if (place <= 2) {
      state.stage = 'cuartos';
      return { won: ours > theirs, tie: ours === theirs, passed: true, message: `¡Terminaste ${place}º del grupo! A CUARTOS DE FINAL` };
    }
    state.result = 'eliminado';
    return { won: ours > theirs, tie: ours === theirs, message: `Terminaste ${place}º del grupo... ¡Quedaste afuera!` };
  }

  // The knockout: the one who wins (or wins the penalties) goes on
  const won = ours > theirs || (ours === theirs && wonOnPenalties);
  if (state.rival) state.beaten.push(state.rival.id); // (an online final has no rival country saved)
  state.rival = null;
  if (!won) {
    state.result = 'eliminado';
    return { won: false, message: `¡Quedaste afuera en ${STAGE_NAMES[state.stage].toLowerCase()}!` };
  }
  if (state.stage === 'final') {
    state.result = 'campeon';
    state.titles += 1;
    return { won: true, champion: true, message: '🏆 ¡CAMPEÓN DEL MUNDO! 🏆' };
  }
  state.stage = STAGES[STAGES.indexOf(state.stage) + 1];
  return { won: true, passed: true, message: `¡Ganaste! Ahora: ${STAGE_NAMES[state.stage]}` };
}
