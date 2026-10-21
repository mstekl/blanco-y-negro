// check-landmarks.mjs — Checks the landmark and flag drawings WITHOUT opening the game.
//
// It calls every drawing function with a pretend "Graphics" object that writes
// down every call, and complains if a number is broken (NaN, Infinity), if a
// color was not passed through tone() (then the gray version would be colored),
// if a country is missing, or if a country uses a landmark that doesn't exist.
//
// Run: node tools/check-landmarks.mjs            (everything)
//      node tools/check-landmarks.mjs europa     (only one file: americas, europa,
//                                                 asia, africaOceania or flags)

import { readFileSync } from 'node:fs';

const only = process.argv[2];
const worldMap = JSON.parse(readFileSync(new URL('../src/data/worldMap.json', import.meta.url)));

// The 15 landmarks drawn in LandmarkArt.js (that file needs Phaser, so we don't load it)
const BUILT_IN = ['chichen', 'libertad', 'cntower', 'eiffel', 'piramides', 'muralla', 'cristo',
  'machupicchu', 'fuji', 'bigben', 'opera', 'coliseo', 'tajmahal', 'obelisco', 'partenon', 'generic'];
const BUILT_IN_COUNTRIES = ['MEX', 'USA', 'CAN', 'FRA', 'EGY', 'CHN', 'BRA', 'PER', 'JPN', 'GBR',
  'AUS', 'ITA', 'IND', 'ARG', 'GRC'];

// Which map groups belong to each file
const REGIONS = {
  americas: ['norte', 'centro', 'sur'],
  europa: ['europa'],
  asia: ['asia'],
  africaOceania: ['africa', 'oceania'],
};

let problems = 0;
const complain = (msg) => { problems++; console.log('  ✗ ' + msg); };

// The colors that went through tone() get marked, so we can tell them apart
const TONED = 0x1000000;
const tone = (hex) => hex + TONED;

// A pretend Graphics: any method can be called; numbers are checked
function mockGraphics(where) {
  let calls = 0;
  const g = new Proxy({}, {
    get(_, method) {
      if (method === 'calls') return calls;
      return (...args) => {
        calls++;
        const check = (v, path) => {
          if (typeof v === 'number' && !Number.isFinite(v)) complain(`${where}: ${String(method)}(${path}) is ${v}`);
          if (Array.isArray(v)) v.forEach((x, i) => check(x, `${path}[${i}]`));
          else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => check(x, `${path}.${k}`));
        };
        args.forEach((a, i) => check(a, i));
        // Colors: fillStyle(color, alpha), lineStyle(width, color, alpha)
        const color = method === 'fillStyle' ? args[0] : method === 'lineStyle' ? args[1] : undefined;
        if (typeof color === 'number' && color < TONED) {
          complain(`${where}: ${String(method)} got the color 0x${color.toString(16)} without tone()`);
        }
        return g;
      };
    },
  });
  return g;
}

async function checkRegion(name) {
  console.log(`\n${name}.js`);
  const { LANDMARKS, THEMES } = await import(`../src/managers/landmarks/${name}.js`);
  const span = 1600;
  const spots = [span * 0.28, span * 0.78];

  for (const [key, art] of Object.entries(LANDMARKS)) {
    if (BUILT_IN.includes(key)) complain(`landmark "${key}" already exists in LandmarkArt.js`);
    if (typeof art.size !== 'number') complain(`landmark "${key}" has no size`);
    for (const part of ['background', 'landmark']) {
      if (!art[part]) continue;
      const g = mockGraphics(`${key}.${part}`);
      try {
        if (part === 'background') art.background(g, tone, span, spots);
        else { art.landmark(g, tone, spots[0], 562, art.size); art.landmark(g, tone, spots[1], 562, art.size * 0.7); }
      } catch (e) { complain(`${key}.${part} crashed: ${e.message}`); }
      if (g.calls === 0) complain(`${key}.${part} draws nothing`);
    }
  }

  for (const [id, theme] of Object.entries(THEMES)) {
    if (!LANDMARKS[theme.landmark] && !BUILT_IN.includes(theme.landmark)) complain(`${id} uses "${theme.landmark}", which doesn't exist`);
    if (BUILT_IN_COUNTRIES.includes(id)) complain(`${id} is already in countryThemes.js`);
    if (theme.place !== null && typeof theme.place !== 'string') complain(`${id} has a wrong place`);
  }

  const missing = worldMap
    .filter((c) => REGIONS[name].includes(c.group) && !BUILT_IN_COUNTRIES.includes(c.id) && !THEMES[c.id])
    .map((c) => `${c.id} (${c.name})`);
  if (missing.length) complain(`countries without a theme: ${[...new Set(missing)].join(', ')}`);
  console.log(`  ${Object.keys(LANDMARKS).length} landmarks, ${Object.keys(THEMES).length} countries`);
}

async function checkFlags() {
  console.log('\nflags.js');
  const { FLAGS, drawFlagPole } = await import('../src/managers/landmarks/flags.js');
  for (const [id, flag] of Object.entries(FLAGS)) {
    const g = mockGraphics(`flag ${id}`);
    try { drawFlagPole(g, tone, 100, 562, flag, 1.4); } catch (e) { complain(`flag ${id} crashed: ${e.message}`); }
    if (g.calls === 0) complain(`flag ${id} draws nothing`);
  }
  const missing = worldMap.filter((c) => c.group && !FLAGS[c.id]).map((c) => `${c.id} (${c.name})`);
  if (missing.length) complain(`countries without a flag: ${[...new Set(missing)].join(', ')}`);
  console.log(`  ${Object.keys(FLAGS).length} flags`);
}

for (const name of Object.keys(REGIONS)) if (!only || only === name) await checkRegion(name);
if (!only || only === 'flags') await checkFlags();

console.log(problems ? `\n${problems} problem(s)` : '\nAll good!');
process.exit(problems ? 1 : 0);
