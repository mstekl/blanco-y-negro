// temporada.js — The TEMPORADA of the FÚTBOL (like the divisions of the FC games).
//
// We start in DIVISIÓN 5 with the team we chose. A season = 5 matches, one against
// each of the other 5 clubs of our division (and the other clubs play each other too,
// "pretend" matches with random goals). A win = 3 points, a tie = 1, a loss = 0.
// At the end of the season:
//   1st or 2nd place  → we go UP one division (División 1 is the best)
//   5th or 6th place  → we go DOWN one division
//   1st in División 1 → ¡CAMPEÓN! (and we stay there to win it again)
// Everything is saved in the browser, so the season can go on another day.

import { DIVISIONS } from './soccerTeams.js';

const KEY = 'blancoYNegro.temporada';
export const ROUNDS = 5;

// How good the robot is in each division (see SoccerBot in Bot.js)
export const DIVISION_LEVEL = { 5: 'facil', 4: 'facilPlus', 3: 'normal', 2: 'normalPlus', 1: 'dificil' };

// Coins: for each match, and at the end of the season
export const PRIZES = { win: 10, draw: 3, up: 50, champion: 200 };

export function loadTemporada() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY));
    if (saved && saved.team && Array.isArray(saved.teams)) return saved;
  } catch (e) {
    // Broken or blocked: no season
  }
  return null;
}

export function saveTemporada(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // Storage blocked: the season lasts until the page is reloaded
  }
}

export function forgetTemporada() {
  try {
    window.localStorage.removeItem(KEY);
  } catch (e) {
    // nothing to do
  }
}

// A brand new career with this team, in División 5
export function newCareer(team) {
  return newSeason({ team, season: 1, division: 5, history: [], titles: 0 });
}

// A new season in the division of "state": our team + 5 clubs of that division
export function newSeason(state) {
  const clubs = DIVISIONS[state.division]
    .filter((c) => !(state.team.kind === 'club' && c.id === state.team.id))
    .slice(0, 5)
    .map((c) => ({ kind: 'club', id: c.id }));
  const teams = [state.team, ...clubs]; // we are always number 0
  return {
    ...state,
    teams,
    round: 0,
    fixtures: roundRobin(teams.length),
    table: teams.map(() => ({ pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 })),
    over: false,
  };
}

// Who plays who in each round: every team plays every other team once.
// (The "circle" trick: team 0 stays still, the others turn around it like a clock)
export function roundRobin(n) {
  const others = Array.from({ length: n - 1 }, (_, i) => i + 1);
  const rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const circle = [0, ...others];
    const pairs = [];
    for (let i = 0; i < n / 2; i++) pairs.push([circle[i], circle[n - 1 - i]]);
    rounds.push(pairs);
    others.push(others.shift()); // turn the clock one step
  }
  return rounds;
}

// Our rival in this round (the team that plays against number 0)
export function nextRival(state) {
  const pair = state.fixtures[state.round].find((p) => p.includes(0));
  return pair[0] === 0 ? pair[1] : pair[0];
}

// Write a result in the table
function record(state, a, b, goalsA, goalsB) {
  const ta = state.table[a];
  const tb = state.table[b];
  ta.pj += 1; tb.pj += 1;
  ta.gf += goalsA; ta.gc += goalsB;
  tb.gf += goalsB; tb.gc += goalsA;
  if (goalsA > goalsB) { ta.g += 1; tb.p += 1; } else if (goalsA < goalsB) { tb.g += 1; ta.p += 1; } else { ta.e += 1; tb.e += 1; }
}

// A pretend match between two robots: 0 to 3 goals each (few goals are more likely)
function randomGoals() {
  return [0, 0, 1, 1, 1, 2, 2, 3][Math.floor(Math.random() * 8)];
}

// We played our match of this round: write it, and the other matches of the round
// (the MUNDIAL uses this too, for its groups of 4)
export function playRound(state, ourGoals, theirGoals) {
  const rival = nextRival(state);
  record(state, 0, rival, ourGoals, theirGoals);
  state.fixtures[state.round].filter((p) => !p.includes(0))
    .forEach(([a, b]) => record(state, a, b, randomGoals(), randomGoals()));
  state.round += 1;
  if (state.round >= state.fixtures.length) state.over = true;
  return state;
}

export const points = (row) => row.g * 3 + row.e;

// The table in order: more points first, then better goal difference, then more goals
export function standings(state) {
  return state.table
    .map((row, i) => ({ ...row, team: i, pts: points(row), dif: row.gf - row.gc }))
    .sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf || a.team - b.team);
}

// The season is over: where did we finish, and what happens now?
//   move: 'campeon', 'sube', 'baja' or 'queda'
export function endSeason(state) {
  const place = standings(state).findIndex((row) => row.team === 0) + 1;
  let move = 'queda';
  if (state.division === 1 && place === 1) move = 'campeon';
  else if (place <= 2 && state.division > 1) move = 'sube';
  else if (place >= 5 && state.division < 5) move = 'baja';
  return { place, move };
}

// Start the next season (up, down, or in the same division)
export function nextSeason(state) {
  const { place, move } = endSeason(state);
  const history = [...state.history, { season: state.season, division: state.division, place, move }];
  let division = state.division;
  if (move === 'sube') division -= 1;
  if (move === 'baja') division += 1;
  return newSeason({
    team: state.team,
    season: state.season + 1,
    division,
    history,
    titles: state.titles + (move === 'campeon' ? 1 : 0),
  });
}
