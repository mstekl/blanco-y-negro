// build-world-map.mjs — Makes src/data/worldMap.json (the world map for the game).
//
// WHY a script? The game only needs a small JSON file with the outline of every
// country, so we prepare it ONCE here instead of loading big map libraries
// while the game runs. Run it again only if you want to change the map data:
//
//   node tools/build-world-map.mjs
//
// Data comes from the dev packages "world-atlas" (country shapes) and
// "world-countries" (names in Spanish, continents, who is independent).

import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const atlas = require('world-atlas/countries-50m.json');
const countryInfo = require('world-countries');

// The continents of the game, in the order they are unlocked.
// (Central America includes the Caribbean islands.)
function groupOf(info) {
  if (info.region === 'Africa') return 'africa';
  if (info.region === 'Europe') return 'europa';
  if (info.region === 'Asia') return 'asia';
  if (info.region === 'Oceania') return 'oceania';
  if (info.region === 'Americas') {
    if (info.subregion === 'South America') return 'sur';
    if (info.subregion === 'North America') return 'norte';
    return 'centro'; // Central America + Caribbean
  }
  return null; // Antarctica etc. — not part of the game
}

// Round to 0.1 degrees: smaller file, and you can't see the difference
const round = (n) => Math.round(n * 10) / 10;

// Area of a ring (in square degrees) — used to sort and to drop tiny specks
function ringArea(ring) {
  let area = 0;
  for (let i = 0; i < ring.length; i += 2) {
    const j = (i + 2) % ring.length;
    area += ring[i] * ring[j + 1] - ring[j] * ring[i + 1];
  }
  return Math.abs(area / 2);
}

// Turn [[lon, lat], ...] into a flat, rounded [lon, lat, lon, lat, ...] list
// without points that are very close to the previous one
function flatten(ring, minStep = 0.25) {
  // A piece that crosses the date line (Russia, Fiji) has points at +179° AND -179°,
  // which would draw a line across the whole map. We move the western points
  // past 180° instead (-179° becomes 181°) so the shape stays in one piece.
  const crossesDateLine = ring.some(([lon]) => lon > 170) && ring.some(([lon]) => lon < -170);
  if (crossesDateLine) ring = ring.map(([lon, lat]) => [lon < 0 ? lon + 360 : lon, lat]);

  const flat = [];
  for (const [lon, lat] of ring) {
    const x = round(lon);
    const y = round(lat);
    const n = flat.length;
    // Skip points that are almost on top of the previous one (keeps the file small)
    if (n >= 2 && Math.abs(flat[n - 2] - x) + Math.abs(flat[n - 1] - y) < minStep) continue;
    flat.push(x, y);
  }
  // Very small countries (islands) would vanish: draw them with every point instead
  if (flat.length < 6 && minStep > 0) return flatten(ring, 0);
  return flat;
}

const features = feature(atlas, atlas.objects.countries).features;
const countries = [];

for (const f of features) {
  const info = countryInfo.find((c) => c.ccn3 === f.id);
  const name = info?.translations?.spa?.common || info?.name?.common || f.properties.name;
  const group = info ? groupOf(info) : null;
  if (info && info.region === 'Antarctic') continue; // skip Antarctica
  if (!info && f.properties.name === 'Antarctica') continue;

  // Only independent countries can be colored; the rest (Greenland, Puerto Rico...)
  // are drawn in gray just so the map looks complete.
  const playable = Boolean(info && info.independent && group);

  // Collect the OUTER ring of every piece (islands count as pieces too)
  const polygons = f.geometry.type === 'Polygon'
    ? [f.geometry.coordinates]
    : f.geometry.coordinates;
  let rings = polygons.map((p) => flatten(p[0])).filter((r) => r.length >= 6);
  rings.sort((a, b) => ringArea(b) - ringArea(a));
  // Drop tiny specks, but always keep the biggest piece
  rings = rings.filter((r, i) => i === 0 || ringArea(r) > 0.08);
  if (rings.length === 0) continue;

  countries.push({
    id: info ? info.cca3 : `X-${f.properties.name}`,
    name,
    group: playable ? group : null,
    rings,
  });
}

writeFileSync(
  new URL('../src/data/worldMap.json', import.meta.url),
  JSON.stringify(countries)
);

const playable = countries.filter((c) => c.group);
const perGroup = {};
playable.forEach((c) => { perGroup[c.group] = (perGroup[c.group] || 0) + 1; });
console.log(`Wrote ${countries.length} shapes, ${playable.length} playable countries`, perGroup);
