// countryThemes.js — What each country looks like in the background of its levels.
//
// The key is the 3-letter country code (the same "id" used in worldMap.json).
//   landmark: which scenery to draw (see src/managers/LandmarkArt.js)
//   place:    the name of the landmark, shown on the "Nivel" intro screen
//
// To give a new country its own scenery:
//   1. Draw the landmark in LandmarkArt.js (a new function + a line in LANDMARKS)
//   2. Add the country here
// Countries that are not listed here get a simple generic landscape.

export const COUNTRY_THEMES = {
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
