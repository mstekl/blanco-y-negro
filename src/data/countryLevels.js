// countryLevels.js — The 3 levels we play INSIDE a country.
//
// When the player picks a country on the world map, they play 3 levels there.
// We build them from existing levels (so we don't have to design 3 new levels
// for each of the 190 countries!) but with the country's own scenery behind:
//   country level 1 → the layout of level 2 (gaps in the ground)
//   country level 2 → the layout of level 3 (shooters!)
//   country level 3 → the layout of level 4 (with the boss at the end)

import { levels } from './levels.js';
import { getTheme } from './countryThemes.js';

// Which of the normal levels (0 = level 1) each country level copies
const BASE_LEVELS = [1, 2, 3];

export const COUNTRY_LEVEL_COUNT = BASE_LEVELS.length;

// Build the list of levels for a country: { id, name, group } → [level, level, level]
export function getCountryLevels(country) {
  const theme = getTheme(country);

  return BASE_LEVELS.map((baseIndex, i) => {
    // A full copy, so changing it never changes the normal levels
    const level = JSON.parse(JSON.stringify(levels[baseIndex]));

    level.id = i + 1;
    level.name = country.name;
    level.introTitle = country.name;
    level.introName = `Nivel ${i + 1} de ${BASE_LEVELS.length}`;
    // ("de el Coliseo" is not good Spanish: it must be "del Coliseo")
    level.subtitle = theme.place ? `Cerca de ${theme.place}`.replace('de el ', 'del ') : 'Devuélvele el color a este país';

    // Scenery of the country instead of the city buildings
    level.backgroundStyle = 'landmark';
    level.theme = theme.landmark;
    level.buildings = [];

    // Every country level ends at a flag (the normal level 4 ends at a castle)
    delete level.goal.type;

    return level;
  });
}

// The list of levels we are playing right now: the 6 normal levels, or the
// 3 levels of the country the player picked (the registry remembers it)
export function getLevels(registry) {
  const country = registry.get('country');
  return country ? getCountryLevels(country) : levels;
}
