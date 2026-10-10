// profile.js — Our player: a NAME and an AVATAR (the picture other players see).
// It is saved in the browser (localStorage), so we only write it once.
// The online race and search (on iPads and phones) will show it to the other player.
//   - The name must have MORE than 3 letters and LESS than 14 (so 4 to 13)
//   - The avatar can be ANY skin of the list (even one we haven't won)

const PROFILE_KEY = 'blancoYNegro.perfil';

export const NAME_MIN = 4;
export const NAME_MAX = 13;

// Our player, or null if we never made one
export function loadProfile() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PROFILE_KEY));
    if (saved && checkName(saved.name) === null) return saved;
  } catch (e) {
    // Storage blocked or broken: as if we never made one
  }
  return null;
}

export function saveProfile(profile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    // Storage blocked: the player only lasts until the page is reloaded
  }
}

// Is this name OK? Gives back null if it is, or a message saying what is wrong.
// Spaces at the start and the end don't count.
export function checkName(name) {
  const clean = (name || '').trim();
  if (clean.length < NAME_MIN) return `Muy corto: mínimo ${NAME_MIN} letras`;
  if (clean.length > NAME_MAX) return `Muy largo: máximo ${NAME_MAX} letras`;
  return null;
}

// Which letters can a name have? Letters (also á, ñ...), numbers and spaces
export function isNameChar(char) {
  return /^[\p{L}\p{N} ]$/u.test(char);
}
