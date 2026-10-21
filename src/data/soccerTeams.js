// soccerTeams.js — The teams of the FÚTBOL: the COUNTRIES (with their flag) and
// the CLUBS we invented (with a shield in their two colors).
//
// A team is a small object:
//   { kind: 'pais', id: 'ARG', name: 'Argentina' }
//   { kind: 'club', id: 'lapices', name: 'Lápices FC', colors: [0xffdd33, 0x222222] }
// Every team has a little picture (its "badge") made with teamBadge(scene, team):
// the flag for a country, a two-color shield with letters for a club.

import worldMap from './worldMap.json';
import { FLAGS, drawFlag } from '../managers/landmarks/flags.js';

// The clubs, 6 in each division (División 5 is the easiest, División 1 the best).
// In the TEMPORADA we play against the clubs of our division.
export const DIVISIONS = {
  5: [
    { id: 'lapices', name: 'Lápices FC', colors: [0xffdd33, 0x333333] },
    { id: 'goma', name: 'Deportivo Goma', colors: [0xff88aa, 0xffffff] },
    { id: 'tiza', name: 'Club Tiza', colors: [0xffffff, 0x2e7d32] },
    { id: 'sacapuntas', name: 'Sacapuntas United', colors: [0x90a4ae, 0xd32f2f] },
    { id: 'crayon', name: 'Atlético Crayón', colors: [0xff7043, 0x1565c0] },
    { id: 'cartulina', name: 'Real Cartulina', colors: [0x81d4fa, 0xffffff] },
  ],
  4: [
    { id: 'pincel', name: 'Sporting Pincel', colors: [0x8d6e63, 0xffcc80] },
    { id: 'acuarela', name: 'Unión Acuarela', colors: [0x4fc3f7, 0xba68c8] },
    { id: 'marcador', name: 'Racing Marcador', colors: [0x00c853, 0x000000] },
    { id: 'tempera', name: 'Inter Témpera', colors: [0x1e88e5, 0x000000] },
    { id: 'plastilina', name: 'Olímpico Plastilina', colors: [0xff5252, 0xffeb3b] },
    { id: 'brillantina', name: 'Estrella Brillantina', colors: [0xe040fb, 0xffd700] },
  ],
  3: [
    { id: 'arcoiris', name: 'Arcoíris Juniors', colors: [0xff1744, 0x2979ff] },
    { id: 'dinamo', name: 'Dínamo Pintura', colors: [0x3949ab, 0xffffff] },
    { id: 'cometas', name: 'Cometas FC', colors: [0x263238, 0xffab00] },
    { id: 'rayo', name: 'Rayo Naranja', colors: [0xff6d00, 0xffffff] },
    { id: 'ciclon', name: 'Ciclón Violeta', colors: [0x6a1b9a, 0xffffff] },
    { id: 'tornado', name: 'Tornado Verde', colors: [0x2e7d32, 0xffeb3b] },
  ],
  2: [
    { id: 'realcolor', name: 'Real Color', colors: [0xffffff, 0x7c4dff] },
    { id: 'neon', name: 'Atlético Neón', colors: [0x76ff03, 0xff4081] },
    { id: 'galaxia', name: 'Galaxia FC', colors: [0x1a237e, 0xe1f5fe] },
    { id: 'volcan', name: 'Volcán Rojo', colors: [0xb71c1c, 0x212121] },
    { id: 'tiburones', name: 'Tiburones Azules', colors: [0x0277bd, 0xb0bec5] },
    { id: 'leones', name: 'Leones Dorados', colors: [0xffc400, 0x4e342e] },
  ],
  1: [
    { id: 'dragones', name: 'Dragones del Color', colors: [0xd50000, 0xffd600] },
    { id: 'fenix', name: 'Fénix Arcoíris', colors: [0xff9100, 0x00b0ff] },
    { id: 'titanes', name: 'Titanes Grises', colors: [0x757575, 0xffffff] },
    { id: 'reyes', name: 'Reyes del Pincel', colors: [0x4a148c, 0xffd700] },
    { id: 'galacticos', name: 'Galácticos Pastel', colors: [0xf8bbd0, 0xb2ebf2] },
    // The villains have a team too: black and white, of course!
    { id: 'villanos', name: 'Villanos FC', colors: [0x000000, 0xffffff] },
  ],
};

// All the clubs in one list (División 5 first)
export const CLUBS = [5, 4, 3, 2, 1].flatMap((d) => DIVISIONS[d].map((c) => ({ ...c, kind: 'club', division: d })));

// All the countries that have a flag, in alphabetical order
export const COUNTRIES = worldMap
  .filter((c) => c.group && FLAGS[c.id])
  .filter((c, i, list) => list.findIndex((other) => other.id === c.id) === i) // (Australia is twice)
  .map((c) => ({ kind: 'pais', id: c.id, name: c.name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'));

// Find a team again from what we saved ({ kind, id })
export function findTeam(saved) {
  if (!saved) return null;
  const list = saved.kind === 'club' ? CLUBS : COUNTRIES;
  return list.find((t) => t.id === saved.id) || null;
}

// A random country (not one of "except")
export function randomCountries(count, except = []) {
  const pool = COUNTRIES.filter((c) => !except.includes(c.id));
  const chosen = [];
  while (chosen.length < count && pool.length) {
    chosen.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return chosen;
}

// The 1, 2 or 3 big letters on a club's shield ("Lápices FC" → "LF")
function initials(name) {
  return name.split(' ').filter((w) => w.length > 2 || w === 'FC').map((w) => w[0]).join('').slice(0, 3).toUpperCase();
}

// The picture of a team (made the first time we need it): 48 × 32 for a flag,
// 36 × 40 for a club's shield. Gives back the name of the texture.
export function teamBadge(scene, team) {
  const key = `badge-${team.kind}-${team.id}`;
  // (a club's finished picture has its letters: it is called "...-letras")
  const finished = team.kind === 'pais' ? key : `${key}-letras`;
  if (scene.textures.exists(finished)) return finished;
  const g = scene.add.graphics();
  const same = (hex) => hex; // (the flags are drawn in full color, never gray)
  if (team.kind === 'pais') {
    g.fillStyle(0x000000);
    g.fillRect(0, 0, 48, 32);
    drawFlag(g, same, FLAGS[team.id], 1, 1, 46, 30);
    g.generateTexture(key, 48, 32);
  } else {
    // A shield: a black outline, the two colors (left and right), and a band
    const shield = (inset) => [
      { x: inset, y: inset }, { x: 36 - inset, y: inset }, { x: 36 - inset, y: 24 }, { x: 18, y: 40 - inset }, { x: inset, y: 24 },
    ];
    g.fillStyle(0x000000);
    g.fillPoints(shield(0), true);
    g.fillStyle(team.colors[0]);
    g.fillPoints(shield(2), true);
    g.fillStyle(team.colors[1]);
    g.fillPoints([{ x: 18, y: 2 }, { x: 34, y: 2 }, { x: 34, y: 24 }, { x: 18, y: 38 }], true);
    g.generateTexture(key, 36, 40);
    // The letters go on top, written on a canvas (Graphics can't write)
    const texture = scene.textures.get(key);
    const canvas = scene.textures.createCanvas(`${key}-letras`, 36, 40);
    const ctx = canvas.getContext();
    ctx.drawImage(texture.getSourceImage(), 0, 0);
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(initials(team.name), 18, 17);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(initials(team.name), 18, 17);
    canvas.refresh();
    g.destroy();
    return finished;
  }
  g.destroy();
  return key;
}
