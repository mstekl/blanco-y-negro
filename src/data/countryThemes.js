// countryThemes.js — What each country looks like in the background of its levels.
//
// The key is the 3-letter country code (the same "id" used in worldMap.json).
//   landmark: which scenery to draw (see src/managers/LandmarkArt.js)
//   place:    the name of the landmark, shown on the "Nivel" intro screen
//
// The first 15 are drawn in LandmarkArt.js. All the other countries are in the
// file of their region, in src/managers/landmarks/ (americas.js, europa.js,
// asia.js, africaOceania.js), with their own landmark or the scenery of their region.
// Every country also has its flag (src/managers/landmarks/flags.js).

import { THEMES as AMERICAS } from '../managers/landmarks/americas.js';
import { THEMES as EUROPA } from '../managers/landmarks/europa.js';
import { THEMES as ASIA } from '../managers/landmarks/asia.js';
import { THEMES as AFRICA_OCEANIA } from '../managers/landmarks/africaOceania.js';

export const COUNTRY_THEMES = {
  ...AMERICAS,
  ...EUROPA,
  ...ASIA,
  ...AFRICA_OCEANIA,
  MEX: { landmark: 'chichen', place: 'Chichén Itzá' },
  USA: { landmark: 'libertad', place: 'la Estatua de la Libertad' },
  CAN: { landmark: 'cntower', place: 'la Torre CN y las Montañas Rocosas' },
  FRA: { landmark: 'eiffel', place: 'la Torre Eiffel' },
  EGY: { landmark: 'piramides', place: 'las pirámides de Guiza' },
  CHN: { landmark: 'muralla', place: 'la Gran Muralla' },
  BRA: { landmark: 'cristo', place: 'el Cristo Redentor' },
  PER: { landmark: 'machupicchu', place: 'Machu Picchu' },
  JPN: { landmark: 'fuji', place: 'el Monte Fuji' },
  GBR: { landmark: 'bigben', place: 'el Big Ben' },
  AUS: { landmark: 'opera', place: 'la Ópera de Sídney' },
  ITA: { landmark: 'coliseo', place: 'el Coliseo' },
  IND: { landmark: 'tajmahal', place: 'el Taj Mahal' },
  ARG: { landmark: 'obelisco', place: 'el Obelisco de Buenos Aires' },
  GRC: { landmark: 'partenon', place: 'el Partenón' },
};

// Theme of a country (or the generic landscape if it has no special scenery yet)
export function getTheme(country) {
  return COUNTRY_THEMES[country.id] || { landmark: 'generic', place: null };
}
