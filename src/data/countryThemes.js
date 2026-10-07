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
};

// Theme of a country (or the generic landscape if it has no special scenery yet)
export function getTheme(country) {
  return COUNTRY_THEMES[country.id] || { landmark: 'generic', place: null };
}
