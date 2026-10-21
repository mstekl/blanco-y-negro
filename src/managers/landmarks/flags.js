// flags.js — The flag of every country, drawn on a pole next to its landmark.
//
// HOW A FLAG IS WRITTEN (so ~190 flags fit in one file without huge code):
//   h: [colors]   = horizontal stripes, from top to bottom
//   v: [colors]   = vertical stripes, from left (next to the pole) to right
//   w: [numbers]  = (optional) how thick each stripe is, if they are not equal
//   bg: color     = one color for the whole flag (when it has no stripes)
//   x: [shapes]   = extra things drawn ON TOP, in order, like stickers
//
// The shapes use "flag coordinates": x and y go from 0 to 1, so 0.5 is always
// the middle, no matter how big the flag is drawn. Sizes (r, t) are measured
// with the HEIGHT of the flag, so circles stay round.
//   ['rect', x, y, w, h, color]        a box (x, y = top-left corner)
//   ['circle', x, y, r, color]         a circle
//   ['oval', x, y, w, h, color]        a squashed circle
//   ['half', x, y, r, color]           the top half of a circle (a rising sun)
//   ['star', x, y, r, color]           a 5-point star
//   ['star6', x, y, r, color, hole]    the 6-point star of Israel (hollow)
//   ['moon', x, y, r, color, bite, dx, dy]  a crescent: a circle with a bite of color
//                                      "bite" (dx, dy = where the bite is; 0.3 to the right if not given)
//   ['diamond', x, y, r, color]        a little diamond
//   ['tri', color, length]             a triangle that starts at the pole (Cuba, Czechia)
//   ['cross', color, x, y, t]          a cross with its center at x, y (Nordic crosses too)
//   ['diag', color, t, up]             a band from corner to corner (up = goes up to the right)
//   ['poly', color, [[x, y], ...]]     any shape made of points
//   ['zig', color, x, teeth]           a zigzag edge at x (Qatar, Bahrain)
//   ['rays', x, y, r, n, color]        n sun rays coming out of a point
//   ['jack', x, y, w, h]               a small Union Jack (Australia, New Zealand, Fiji)
//
// Big coats of arms are made simple (a circle, a star, an oval): it is a game,
// a flag that is easy to recognize is the goal, not a perfect copy.

import { polygon } from './helpers.js';

// Colors that many flags share (each country's exact color is written when it matters)
const WHITE = 0xffffff;
const BLACK = 0x000000;
const RED = 0xce1126;
const BLUE = 0x0038a8;
const NAVY = 0x012169;
const SKY = 0x75aadb;
const GREEN = 0x009a44;
const DGREEN = 0x006a4e;
const YELLOW = 0xfcd116;
const GOLD = 0xffc72c;
const ORANGE = 0xff883e;

// A circle of little stars (Europe-style rings, Venezuela's arc...).
// from / to = which part of the circle, in turns (0 = right, 0.25 = bottom)
function ring(n, x, y, rad, r, color, from = 0, to = 1) {
  const stars = [];
  const full = to - from === 1; // a full circle: don't put two stars on the same spot
  for (let i = 0; i < n; i++) {
    const turn = from + (to - from) * (full ? i / n : i / Math.max(1, n - 1));
    const angle = turn * Math.PI * 2;
    // x is divided by 1.5 because the flag is 1.5 times wider than tall
    stars.push(['star', x + (Math.cos(angle) * rad) / 1.5, y + Math.sin(angle) * rad, r, color]);
  }
  return stars;
}

// Alternating stripes (USA, Greece, Malaysia...): a list with n colors a, b, a, b...
const alternate = (n, a, b) => Array.from({ length: n }, (_, i) => (i % 2 === 0 ? a : b));

// The leaf of Canada, as points around its middle (-1..1)
const MAPLE = [[0, -1], [0.15, -0.65], [0.35, -0.75], [0.3, -0.3], [0.7, -0.5], [0.6, -0.25],
  [0.95, -0.15], [0.75, 0.05], [0.85, 0.2], [0.4, 0.3], [0.45, 0.5], [0.05, 0.45], [0.05, 0.95],
  [-0.05, 0.95], [-0.05, 0.45], [-0.45, 0.5], [-0.4, 0.3], [-0.85, 0.2], [-0.75, 0.05],
  [-0.95, -0.15], [-0.6, -0.25], [-0.7, -0.5], [-0.3, -0.3], [-0.35, -0.75], [-0.15, -0.65]]
  .map(([u, v]) => [0.5 + u * 0.13, 0.5 + v * 0.3]);

// FLAGS: 3-letter country code → how the flag looks
export const FLAGS = {
  // ---------------- NORTEAMÉRICA ----------------
  CAN: { v: [0xd80621, WHITE, 0xd80621], w: [1, 2, 1], x: [['poly', 0xd80621, MAPLE]] },
  USA: {
    h: alternate(13, 0xb22234, WHITE),
    x: [['rect', 0, 0, 0.4, 0.54, 0x3c3b6e],
      ...[0.07, 0.2, 0.33].flatMap((x) => [0.12, 0.27, 0.42].map((y) => ['star', x, y, 0.05, WHITE]))],
  },
  MEX: { v: [0x006847, WHITE, 0xce1126], x: [['circle', 0.5, 0.5, 0.14, 0x8c5a2b], ['circle', 0.5, 0.5, 0.07, 0x5a8a2b]] },

  // ---------------- CENTROAMÉRICA y EL CARIBE ----------------
  ATG: {
    bg: RED,
    x: [['poly', WHITE, [[0, 0], [1, 0], [0.5, 1]]],
      ['poly', 0x0072c6, [[0, 0], [1, 0], [0.67, 0.66], [0.33, 0.66]]],
      ['poly', BLACK, [[0, 0], [1, 0], [0.79, 0.42], [0.21, 0.42]]],
      ['half', 0.5, 0.42, 0.16, YELLOW]],
  },
  BHS: { h: [0x00778b, GOLD, 0x00778b], x: [['tri', BLACK, 0.4]] },
  BRB: {
    v: [0x00267f, 0xffc726, 0x00267f],
    x: [['rect', 0.48, 0.32, 0.04, 0.45, BLACK], ['rect', 0.4, 0.42, 0.2, 0.05, BLACK],
      ['rect', 0.4, 0.28, 0.03, 0.18, BLACK], ['rect', 0.57, 0.28, 0.03, 0.18, BLACK]],
  },
  BLZ: { h: [RED, 0x003f87, RED], w: [1, 8, 1], x: [['circle', 0.5, 0.5, 0.28, WHITE], ['circle', 0.5, 0.5, 0.2, 0x3a7d2c]] },
  CRI: { h: [0x002b7f, WHITE, RED, WHITE, 0x002b7f], w: [1, 1, 2, 1, 1] },
  CUB: { h: alternate(5, 0x002a8f, WHITE), x: [['tri', 0xcf142b, 0.45], ['star', 0.15, 0.5, 0.15, WHITE]] },
  DMA: {
    bg: 0x006b3f,
    x: [['cross', YELLOW, 0.5, 0.5, 0.2], ['cross', BLACK, 0.5, 0.5, 0.13], ['cross', WHITE, 0.5, 0.5, 0.06],
      ['circle', 0.5, 0.5, 0.2, 0xd41c30], ['circle', 0.5, 0.5, 0.08, 0x5a2d82]],
  },
  DOM: {
    bg: WHITE,
    x: [['rect', 0, 0, 0.44, 0.42, 0x002d62], ['rect', 0.56, 0, 0.44, 0.42, 0xce1126],
      ['rect', 0, 0.58, 0.44, 0.42, 0xce1126], ['rect', 0.56, 0.58, 0.44, 0.42, 0x002d62],
      ['circle', 0.5, 0.5, 0.07, 0x00843d]],
  },
  GRD: {
    bg: 0xce1126,
    x: [['rect', 0.08, 0.12, 0.84, 0.76, 0x007a5e],
      ['poly', 0xfcd116, [[0.08, 0.12], [0.92, 0.12], [0.5, 0.5]]],
      ['poly', 0xfcd116, [[0.08, 0.88], [0.92, 0.88], [0.5, 0.5]]],
      ['circle', 0.5, 0.5, 0.12, 0xce1126], ['star', 0.5, 0.5, 0.08, 0xfcd116],
      ['star', 0.3, 0.06, 0.04, 0xfcd116], ['star', 0.5, 0.06, 0.04, 0xfcd116], ['star', 0.7, 0.06, 0.04, 0xfcd116],
      ['star', 0.3, 0.94, 0.04, 0xfcd116], ['star', 0.5, 0.94, 0.04, 0xfcd116], ['star', 0.7, 0.94, 0.04, 0xfcd116]],
  },
  GTM: { v: [0x4997d0, WHITE, 0x4997d0], x: [['circle', 0.5, 0.5, 0.12, 0x6c9a3c], ['circle', 0.5, 0.5, 0.06, 0x8bc34a]] },
  HTI: { h: [0x00209f, 0xd21034], x: [['rect', 0.38, 0.32, 0.24, 0.36, WHITE], ['circle', 0.5, 0.48, 0.08, 0x016a16]] },
  HND: { h: [0x0073cf, WHITE, 0x0073cf], x: [['star', 0.5, 0.5, 0.06, 0x0073cf], ...ring(4, 0.5, 0.5, 0.11, 0.05, 0x0073cf, 0.125, 1.125)] },
  JAM: {
    bg: 0x009b3a,
    x: [['poly', BLACK, [[0, 0], [0.5, 0.5], [0, 1]]], ['poly', BLACK, [[1, 0], [0.5, 0.5], [1, 1]]],
      ['diag', 0xfed100, 0.16, true], ['diag', 0xfed100, 0.16, false]],
  },
  KNA: {
    bg: 0x009e49,
    x: [['poly', 0xce1126, [[1, 0], [1, 1], [0, 1]]], ['diag', 0xfcd116, 0.4, true], ['diag', BLACK, 0.28, true],
      ['star', 0.36, 0.62, 0.09, WHITE], ['star', 0.64, 0.38, 0.09, WHITE]],
  },
  LCA: {
    bg: 0x65cfff,
    x: [['poly', WHITE, [[0.5, 0.1], [0.28, 0.9], [0.72, 0.9]]], ['poly', BLACK, [[0.5, 0.2], [0.33, 0.9], [0.67, 0.9]]],
      ['poly', 0xfcd116, [[0.5, 0.52], [0.28, 0.9], [0.72, 0.9]]]],
  },
  VCT: {
    v: [0x0072c6, 0xfcd116, 0x009e60], w: [1, 2, 1],
    x: [['diamond', 0.42, 0.42, 0.11, 0x009e60], ['diamond', 0.58, 0.42, 0.11, 0x009e60], ['diamond', 0.5, 0.62, 0.11, 0x009e60]],
  },
  NIC: { h: [0x0067c6, WHITE, 0x0067c6], x: [['poly', 0x3a9b3a, [[0.5, 0.38], [0.44, 0.6], [0.56, 0.6]]]] },
  PAN: {
    bg: WHITE,
    x: [['rect', 0.5, 0, 0.5, 0.5, 0xda121a], ['rect', 0, 0.5, 0.5, 0.5, 0x072357],
      ['star', 0.25, 0.25, 0.12, 0x072357], ['star', 0.75, 0.75, 0.12, 0xda121a]],
  },
  SLV: { h: [0x0f47af, WHITE, 0x0f47af], x: [['circle', 0.5, 0.5, 0.1, 0xffcc00], ['circle', 0.5, 0.5, 0.06, 0x3a7d2c]] },
  TTO: { bg: 0xda1a35, x: [['diag', WHITE, 0.4, false], ['diag', BLACK, 0.28, false]] },

  // ---------------- SUDAMÉRICA ----------------
  ARG: { h: [0x74acdf, WHITE, 0x74acdf], x: [['circle', 0.5, 0.5, 0.11, 0xf6b40e]] },
  BOL: { h: [0xd52b1e, 0xf9e300, 0x007934] },
  BRA: {
    bg: 0x009c3b,
    x: [['poly', 0xffdf00, [[0.5, 0.1], [0.92, 0.5], [0.5, 0.9], [0.08, 0.5]]],
      ['circle', 0.5, 0.5, 0.24, 0x002776], ['rect', 0.35, 0.47, 0.3, 0.05, WHITE]],
  },
  CHL: { h: [WHITE, 0xd52b1e], x: [['rect', 0, 0, 0.33, 0.5, 0x0039a6], ['star', 0.165, 0.25, 0.14, WHITE]] },
  COL: { h: [0xfcd116, 0x003893, 0xce1126], w: [2, 1, 1] },
  ECU: { h: [0xffdd00, 0x034ea2, 0xed1c24], w: [2, 1, 1], x: [['oval', 0.5, 0.5, 0.16, 0.36, 0x5a8a2b], ['circle', 0.5, 0.48, 0.09, 0x6ec1e4]] },
  GUY: {
    bg: 0x009e49,
    x: [['poly', WHITE, [[0, 0], [1, 0.5], [0, 1]]], ['poly', 0xfcd116, [[0, 0.05], [0.94, 0.5], [0, 0.95]]],
      ['poly', BLACK, [[0, 0], [0.5, 0.5], [0, 1]]], ['poly', 0xce1126, [[0, 0.07], [0.44, 0.5], [0, 0.93]]]],
  },
  PRY: { h: [0xd52b1e, WHITE, 0x0038a8], x: [['circle', 0.5, 0.5, 0.1, 0x0038a8], ['circle', 0.5, 0.5, 0.07, WHITE], ['star', 0.5, 0.5, 0.05, 0xfcd116]] },
  PER: { v: [0xd91023, WHITE, 0xd91023] },
  SUR: { h: [0x377e3f, WHITE, 0xb40a2d, WHITE, 0x377e3f], w: [2, 1, 4, 1, 2], x: [['star', 0.5, 0.5, 0.2, 0xecc81d]] },
  URY: {
    h: alternate(9, WHITE, 0x0038a8),
    x: [['rect', 0, 0, 0.4, 0.555, WHITE], ['rays', 0.2, 0.28, 0.22, 12, 0xfcd116], ['circle', 0.2, 0.28, 0.12, 0xfcd116]],
  },
  VEN: { h: [0xffcc00, 0x00247d, 0xcf142b], x: ring(8, 0.5, 0.62, 0.22, 0.04, WHITE, 0.6, 0.9) },

  // ---------------- EUROPA ----------------
  ALB: {
    bg: 0xe41e20,
    x: [['poly', BLACK, [[0.5, 0.25], [0.3, 0.2], [0.36, 0.5], [0.45, 0.55], [0.5, 0.8], [0.55, 0.55], [0.64, 0.5], [0.7, 0.2]]],
      ['circle', 0.44, 0.22, 0.06, BLACK], ['circle', 0.56, 0.22, 0.06, BLACK]],
  },
  AND: { v: [0x10069f, 0xfedf00, 0xd50032], x: [['rect', 0.43, 0.35, 0.14, 0.3, 0xc7a000], ['rect', 0.46, 0.4, 0.08, 0.2, 0xd50032]] },
  AUT: { h: [0xed2939, WHITE, 0xed2939] },
  BLR: {
    h: [0xc8313e, 0x4aa657], w: [2, 1],
    x: [['rect', 0, 0, 0.13, 1, WHITE], ...[0.1, 0.3, 0.5, 0.7, 0.9].map((y) => ['diamond', 0.065, y, 0.06, 0xc8313e])],
  },
  BEL: { v: [BLACK, 0xfdda24, 0xef3340] },
  BIH: {
    bg: 0x002395,
    x: [['poly', 0xfecb00, [[0.27, 0], [0.73, 0], [0.73, 1]]],
      ...[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((y) => ['star', 0.18 + y * 0.46, y + 0.02, 0.05, WHITE])],
  },
  BGR: { h: [WHITE, 0x00966e, 0xd62612] },
  HRV: {
    h: [0xff0000, WHITE, 0x171796],
    x: [['rect', 0.42, 0.28, 0.16, 0.4, 0xff0000], ['rect', 0.42, 0.28, 0.08, 0.1, WHITE], ['rect', 0.5, 0.38, 0.08, 0.1, WHITE],
      ['rect', 0.42, 0.48, 0.08, 0.1, WHITE], ['rect', 0.5, 0.58, 0.08, 0.1, WHITE]],
  },
  CYP: {
    bg: WHITE,
    x: [['poly', 0xd57800, [[0.25, 0.4], [0.5, 0.3], [0.78, 0.22], [0.65, 0.38], [0.55, 0.45], [0.3, 0.5]]],
      ['oval', 0.4, 0.7, 0.18, 0.08, 0x4e5b31], ['oval', 0.6, 0.7, 0.18, 0.08, 0x4e5b31]],
  },
  CZE: { h: [WHITE, 0xd7141a], x: [['tri', 0x11457e, 0.5]] },
  DNK: { bg: 0xc8102e, x: [['cross', WHITE, 0.36, 0.5, 0.2]] },
  EST: { h: [0x0072ce, BLACK, WHITE] },
  FIN: { bg: WHITE, x: [['cross', 0x002f6c, 0.36, 0.5, 0.24]] },
  FRA: { v: [0x0055a4, WHITE, 0xef4135] },
  DEU: { h: [BLACK, 0xdd0000, 0xffce00] },
  GRC: {
    h: alternate(9, 0x0d5eaf, WHITE),
    // The white cross of Greece only lives inside the blue box, so it is made of 2 rects
    x: [['rect', 0, 0, 0.37, 0.556, 0x0d5eaf], ['rect', 0.148, 0, 0.074, 0.556, WHITE], ['rect', 0, 0.222, 0.37, 0.111, WHITE]],
  },
  HUN: { h: [0xcd2a3e, WHITE, 0x436f4d] },
  ISL: { bg: 0x02529c, x: [['cross', WHITE, 0.36, 0.5, 0.28], ['cross', 0xdc1e35, 0.36, 0.5, 0.14]] },
  IRL: { v: [0x169b62, WHITE, ORANGE] },
  ITA: { v: [0x009246, WHITE, 0xce2b37] },
  LVA: { h: [0x9e3039, WHITE, 0x9e3039], w: [2, 1, 2] },
  LIE: { h: [0x002b7f, 0xce1126], x: [['rect', 0.15, 0.17, 0.12, 0.12, 0xffd83d], ['half', 0.21, 0.17, 0.06, 0xffd83d]] },
  LTU: { h: [0xfdb913, 0x006a44, 0xc1272d] },
  LUX: { h: [0xed2939, WHITE, 0x00a1de] },
  MKD: { bg: 0xd20000, x: [['rays', 0.5, 0.5, 0.9, 8, 0xffe600], ['circle', 0.5, 0.5, 0.15, 0xd20000], ['circle', 0.5, 0.5, 0.12, 0xffe600]] },
  MLT: { v: [WHITE, 0xcf142b], x: [['rect', 0.06, 0.08, 0.12, 0.2, 0xa0a0a0], ['rect', 0.1, 0.08, 0.04, 0.2, 0xcf142b]] },
  MDA: { v: [0x0046ae, 0xffd200, 0xcc092f], x: [['oval', 0.5, 0.5, 0.14, 0.4, 0xb07e09], ['rect', 0.47, 0.42, 0.06, 0.2, 0xcc092f]] },
  MCO: { h: [0xce1126, WHITE] },
  MNE: { bg: 0xd3ae3b, x: [['rect', 0.04, 0.06, 0.92, 0.88, 0xc40308], ['circle', 0.5, 0.5, 0.22, 0xd3ae3b], ['rect', 0.45, 0.48, 0.1, 0.16, 0x1d5e91]] },
  NLD: { h: [0xae1c28, WHITE, 0x21468b] },
  NOR: { bg: 0xba0c2f, x: [['cross', WHITE, 0.36, 0.5, 0.26], ['cross', 0x00205b, 0.36, 0.5, 0.13]] },
  POL: { h: [WHITE, 0xdc143c] },
  PRT: { v: [0x046a38, 0xda291c], w: [2, 3], x: [['circle', 0.4, 0.5, 0.22, 0xffe900], ['circle', 0.4, 0.5, 0.14, 0xda291c], ['rect', 0.36, 0.42, 0.08, 0.16, WHITE]] },
  ROU: { v: [0x002b7f, 0xfcd116, 0xce1126] },
  RUS: { h: [WHITE, 0x0039a6, 0xd52b1e] },
  SMR: { h: [WHITE, 0x5eb6e4], x: [['circle', 0.5, 0.5, 0.15, 0xc8a400], ['circle', 0.5, 0.5, 0.1, 0x5eb6e4]] },
  SRB: { h: [0xc6363c, 0x0c4076, WHITE], x: [['oval', 0.32, 0.45, 0.16, 0.42, 0xc6363c], ['rect', 0.31, 0.32, 0.02, 0.24, WHITE], ['rect', 0.27, 0.41, 0.1, 0.05, WHITE]] },
  SVK: { h: [WHITE, 0x0b4ea2, 0xee1c25], x: [['oval', 0.33, 0.5, 0.24, 0.6, WHITE], ['oval', 0.33, 0.5, 0.2, 0.52, 0xee1c25], ['rect', 0.315, 0.3, 0.03, 0.34, WHITE], ['rect', 0.27, 0.4, 0.12, 0.05, WHITE]] },
  SVN: { h: [WHITE, 0x0000ff, 0xff0000], x: [['oval', 0.28, 0.4, 0.14, 0.32, 0x0000ff], ['poly', WHITE, [[0.22, 0.45], [0.28, 0.33], [0.34, 0.45]]]] },
  ESP: { h: [0xaa151b, 0xf1bf00, 0xaa151b], w: [1, 2, 1], x: [['oval', 0.32, 0.5, 0.12, 0.3, 0xaa151b], ['rect', 0.3, 0.42, 0.04, 0.16, 0xf1bf00]] },
  SWE: { bg: 0x006aa7, x: [['cross', 0xfecc00, 0.36, 0.5, 0.2]] },
  CHE: { bg: 0xda291c, x: [['rect', 0.42, 0.2, 0.16, 0.6, WHITE], ['rect', 0.3, 0.38, 0.4, 0.24, WHITE]] },
  UKR: { h: [0x0057b7, 0xffd700] },
  GBR: { bg: NAVY, x: [['jack', 0, 0, 1, 1]] },
  VAT: { v: [0xffe000, WHITE], x: [['oval', 0.75, 0.5, 0.2, 0.3, 0xc8a400], ['rect', 0.73, 0.4, 0.04, 0.3, 0xa0a0a0]] },

  // ---------------- ÁFRICA ----------------
  DZA: { v: [0x006233, WHITE], x: [['moon', 0.56, 0.5, 0.21, 0xd21034, WHITE], ['star', 0.62, 0.5, 0.09, 0xd21034]] },
  AGO: { h: [0xcc092f, BLACK], x: [['rays', 0.5, 0.5, 0.2, 10, 0xffcb00], ['circle', 0.5, 0.5, 0.13, 0xffcb00], ['star', 0.5, 0.5, 0.08, 0xcc092f]] },
  BEN: { h: [0xfcd116, 0xe8112d], x: [['rect', 0, 0, 0.4, 1, 0x008751]] },
  BWA: { bg: 0x75aadb, x: [['rect', 0, 0.38, 1, 0.24, WHITE], ['rect', 0, 0.43, 1, 0.14, BLACK]] },
  BFA: { h: [0xef2b2d, 0x009e49], x: [['star', 0.5, 0.5, 0.17, 0xfcd116]] },
  BDI: {
    bg: 0xce1126,
    x: [['poly', 0x1eb53a, [[0, 0], [0.5, 0.5], [0, 1]]], ['poly', 0x1eb53a, [[1, 0], [0.5, 0.5], [1, 1]]],
      ['diag', WHITE, 0.14, true], ['diag', WHITE, 0.14, false], ['circle', 0.5, 0.5, 0.26, WHITE],
      ['star', 0.5, 0.39, 0.06, 0xce1126], ['star', 0.43, 0.57, 0.06, 0xce1126], ['star', 0.57, 0.57, 0.06, 0xce1126]],
  },
  CPV: { h: [0x003893, WHITE, 0xcf2027, WHITE, 0x003893], w: [6, 1, 1, 1, 3], x: ring(10, 0.38, 0.6, 0.24, 0.04, 0xf7d116) },
  CMR: { v: [0x007a5e, 0xce1126, 0xfcd116], x: [['star', 0.5, 0.5, 0.15, 0xfcd116]] },
  CAF: {
    h: [0x003082, WHITE, 0x289728, 0xffce00],
    x: [['rect', 0.43, 0, 0.14, 1, 0xd21034], ['star', 0.12, 0.12, 0.08, 0xffce00]],
  },
  TCD: { v: [0x002664, 0xfecb00, 0xc60c30] },
  COM: {
    h: [0xffc61e, WHITE, 0xce1126, 0x3a75c4],
    x: [['tri', 0x3d8e33, 0.45], ['moon', 0.14, 0.5, 0.2, WHITE, 0x3d8e33], ...ring(4, 0.14, 0.5, 0.11, 0.03, WHITE, 0.82, 1.18)],
  },
  COG: { bg: 0x009543, x: [['poly', 0xdc241f, [[1, 0], [1, 1], [0, 1]]], ['diag', 0xfbde4a, 0.36, true]] },
  COD: { bg: 0x007fff, x: [['diag', 0xf7d618, 0.3, true], ['diag', 0xce1021, 0.2, true], ['star', 0.15, 0.2, 0.13, 0xf7d618]] },
  CIV: { v: [0xf77f00, WHITE, 0x009e60] },
  DJI: { h: [0x6ab2e7, 0x12ad2b], x: [['tri', WHITE, 0.45], ['star', 0.15, 0.5, 0.1, 0xd7141a]] },
  EGY: { h: [0xce1126, WHITE, BLACK], x: [['oval', 0.5, 0.5, 0.1, 0.24, 0xc09300]] },
  GNQ: { h: [0x3e9a00, WHITE, 0xe32118], x: [['tri', 0x0073ce, 0.22], ['oval', 0.5, 0.5, 0.08, 0.2, 0xa0a0a0]] },
  ERI: {
    h: [0x12ad2b, 0x4189dd],
    x: [['poly', 0xea0437, [[0, 0], [1, 0.5], [0, 1]]], ['circle', 0.22, 0.5, 0.16, 0xffc726], ['circle', 0.22, 0.5, 0.11, 0xea0437]],
  },
  SWZ: {
    h: [0x3e5eb9, 0xffd900, 0xb10c0c, 0xffd900, 0x3e5eb9], w: [3, 1, 6, 1, 3],
    x: [['rect', 0.15, 0.48, 0.7, 0.04, 0xffd900], ['oval', 0.5, 0.5, 0.36, 0.3, BLACK], ['poly', WHITE, [[0.5, 0.35], [0.68, 0.5], [0.5, 0.65]]]],
  },
  ETH: { h: [0x078930, 0xfcdd09, 0xda121a], x: [['circle', 0.5, 0.5, 0.24, 0x0f47af], ['star', 0.5, 0.5, 0.16, 0xfcdd09]] },
  GAB: { h: [0x009e60, 0xfcd116, 0x3a75c4] },
  GMB: { h: [0xce1126, WHITE, 0x0c1c8c, WHITE, 0x3a7728], w: [6, 1, 4, 1, 6] },
  GHA: { h: [0xce1126, 0xfcd116, 0x006b3f], x: [['star', 0.5, 0.5, 0.16, BLACK]] },
  GIN: { v: [0xce1126, 0xfcd116, 0x009460] },
  GNB: { h: [0xfcd116, 0x009e49], x: [['rect', 0, 0, 0.33, 1, 0xce1126], ['star', 0.165, 0.5, 0.14, BLACK]] },
  KEN: {
    h: [BLACK, WHITE, 0xbb0000, WHITE, 0x006600], w: [6, 1, 6, 1, 6],
    x: [['oval', 0.5, 0.5, 0.2, 0.7, 0xbb0000], ['oval', 0.5, 0.5, 0.1, 0.6, BLACK], ['rect', 0.48, 0.3, 0.04, 0.4, WHITE]],
  },
  LSO: { h: [0x00209f, WHITE, 0x009543], w: [3, 4, 3], x: [['poly', BLACK, [[0.5, 0.33], [0.42, 0.62], [0.58, 0.62]]], ['rect', 0.4, 0.6, 0.2, 0.04, BLACK]] },
  LBR: { h: alternate(11, 0xbf0a30, WHITE), x: [['rect', 0, 0, 0.36, 0.455, 0x002868], ['star', 0.18, 0.227, 0.15, WHITE]] },
  LBY: { h: [0xe70013, BLACK, 0x239e46], w: [1, 2, 1], x: [['moon', 0.47, 0.5, 0.17, WHITE, BLACK], ['star', 0.55, 0.5, 0.07, WHITE]] },
  MDG: { h: [0xfc3d32, 0x007e3a], x: [['rect', 0, 0, 0.33, 1, WHITE]] },
  MWI: { h: [BLACK, 0xce1126, 0x339e35], x: [['half', 0.5, 0.33, 0.17, 0xce1126], ['rays', 0.5, 0.31, 0.24, 15, 0xce1126]] },
  MLI: { v: [0x14b53a, 0xfcd116, 0xce1126] },
  MRT: { h: [0xd01c1f, 0x00a95c, 0xd01c1f], w: [1, 4, 1], x: [['moon', 0.5, 0.48, 0.24, 0xffd700, 0x00a95c, 0, -0.35], ['star', 0.5, 0.36, 0.08, 0xffd700]] },
  MUS: { h: [0xea2839, 0x1a206d, 0xffd500, 0x00a551] },
  MAR: { bg: 0xc1272d, x: [['star', 0.5, 0.5, 0.3, 0x006233], ['star', 0.5, 0.5, 0.18, 0xc1272d]] },
  MOZ: {
    h: [0x007168, WHITE, BLACK, WHITE, 0xfce100], w: [5, 1, 5, 1, 5],
    x: [['tri', 0xd21034, 0.42], ['star', 0.14, 0.5, 0.14, 0xfce100], ['rect', 0.1, 0.48, 0.08, 0.06, BLACK]],
  },
  NAM: {
    bg: 0x003580,
    x: [['poly', 0x009543, [[1, 0], [1, 1], [0, 1]]], ['diag', WHITE, 0.36, true], ['diag', 0xd21034, 0.25, true],
      ['rays', 0.18, 0.25, 0.2, 12, 0xffce00], ['circle', 0.18, 0.25, 0.09, 0xffce00]],
  },
  NER: { h: [0xe05206, WHITE, 0x0db02b], x: [['circle', 0.5, 0.5, 0.12, 0xe05206]] },
  NGA: { v: [0x008751, WHITE, 0x008751] },
  RWA: { h: [0x00a1de, 0xfad201, 0x20603d], w: [2, 1, 1], x: [['rays', 0.85, 0.24, 0.17, 16, 0xe5be01], ['circle', 0.85, 0.24, 0.08, 0xe5be01]] },
  STP: { h: [0x12ad2b, 0xffce00, 0x12ad2b], w: [2, 3, 2], x: [['tri', 0xd21034, 0.3], ['star', 0.5, 0.5, 0.12, BLACK], ['star', 0.75, 0.5, 0.12, BLACK]] },
  SEN: { v: [0x00853f, 0xfdef42, 0xe31b23], x: [['star', 0.5, 0.5, 0.15, 0x00853f]] },
  SYC: {
    bg: WHITE,
    x: [['poly', 0x003f87, [[0, 1], [0, 0], [0.33, 0]]], ['poly', 0xfcd856, [[0, 1], [0.33, 0], [0.67, 0]]],
      ['poly', 0xd62828, [[0, 1], [0.67, 0], [1, 0], [1, 0.33]]], ['poly', 0x007a3d, [[0, 1], [1, 0.67], [1, 1]]]],
  },
  SLE: { h: [0x1eb53a, WHITE, 0x0072c6] },
  SOM: { bg: 0x4189dd, x: [['star', 0.5, 0.5, 0.26, WHITE]] },
  ZAF: {
    h: [0xe03c31, 0x001489],
    x: [['rect', 0, 0.33, 1, 0.34, WHITE], ['rect', 0, 0.4, 1, 0.2, 0x007749],
      ['tri', WHITE, 0.48], ['tri', 0x007749, 0.43], ['tri', 0xffb612, 0.35], ['tri', BLACK, 0.3]],
  },
  SSD: {
    h: [BLACK, WHITE, 0xda121a, WHITE, 0x078930], w: [6, 1, 6, 1, 6],
    x: [['tri', 0x0f47af, 0.4], ['star', 0.12, 0.5, 0.11, 0xfcdd09]],
  },
  SDN: { h: [0xd21034, WHITE, BLACK], x: [['tri', 0x007229, 0.35]] },
  TZA: {
    bg: 0x1eb53a,
    x: [['poly', 0x00a3dd, [[1, 0], [1, 1], [0, 1]]], ['diag', 0xfcd116, 0.4, true], ['diag', BLACK, 0.28, true]],
  },
  TGO: {
    h: alternate(5, 0x006a4e, 0xffce00),
    x: [['rect', 0, 0, 0.4, 0.6, 0xd21034], ['star', 0.2, 0.3, 0.18, WHITE]],
  },
  TUN: {
    bg: 0xe70013,
    x: [['circle', 0.5, 0.5, 0.3, WHITE], ['moon', 0.48, 0.5, 0.2, 0xe70013, WHITE], ['star', 0.54, 0.5, 0.11, 0xe70013]],
  },
  UGA: {
    h: [BLACK, 0xfcdc04, 0xd90000, BLACK, 0xfcdc04, 0xd90000],
    x: [['circle', 0.5, 0.5, 0.22, WHITE], ['oval', 0.5, 0.5, 0.1, 0.24, 0x9ca69c]],
  },
  ZMB: {
    bg: 0x198a00,
    x: [['rect', 0.7, 0.4, 0.1, 0.6, 0xde2010], ['rect', 0.8, 0.4, 0.1, 0.6, BLACK], ['rect', 0.9, 0.4, 0.1, 0.6, 0xef7d00],
      ['oval', 0.85, 0.22, 0.2, 0.12, 0xef7d00]],
  },
  ZWE: {
    h: [0x319208, 0xffd200, 0xde2010, BLACK, 0xde2010, 0xffd200, 0x319208],
    x: [['tri', BLACK, 0.48], ['tri', WHITE, 0.45], ['star', 0.15, 0.5, 0.15, 0xde2010]],
  },

  // ---------------- ASIA ----------------
  AFG: { v: [BLACK, 0xd32011, 0x007a36], x: [['circle', 0.5, 0.5, 0.2, WHITE], ['circle', 0.5, 0.5, 0.15, 0xd32011]] },
  ARM: { h: [0xd90012, 0x0033a0, 0xf2a800] },
  AZE: {
    h: [0x00b5e2, 0xef3340, 0x509e2f],
    x: [['moon', 0.47, 0.5, 0.13, WHITE, 0xef3340], ['star', 0.55, 0.5, 0.06, WHITE]],
  },
  BHR: { bg: 0xce1126, x: [['zig', WHITE, 0.25, 5]] },
  BGD: { bg: 0x006a4e, x: [['circle', 0.45, 0.5, 0.3, 0xf42a41]] },
  BTN: {
    bg: 0xffd520,
    x: [['poly', 0xff4e12, [[1, 0], [1, 1], [0, 1]]], ['oval', 0.5, 0.5, 0.5, 0.18, WHITE], ['circle', 0.3, 0.45, 0.07, WHITE]],
  },
  BRN: {
    bg: 0xf7e017,
    x: [['poly', WHITE, [[0, 0.1], [1, 0.6], [1, 0.78], [0, 0.28]]], ['poly', BLACK, [[0, 0.28], [1, 0.78], [1, 0.92], [0, 0.42]]],
      ['circle', 0.5, 0.5, 0.15, 0xcf1126], ['moon', 0.5, 0.58, 0.12, 0xcf1126, 0xf7e017, 0, -0.35]],
  },
  KHM: {
    h: [0x032ea1, 0xe00025, 0x032ea1], w: [1, 2, 1],
    x: [['rect', 0.33, 0.55, 0.34, 0.12, WHITE], ['poly', WHITE, [[0.38, 0.55], [0.42, 0.35], [0.46, 0.55]]],
      ['poly', WHITE, [[0.45, 0.55], [0.5, 0.28], [0.55, 0.55]]], ['poly', WHITE, [[0.54, 0.55], [0.58, 0.35], [0.62, 0.55]]]],
  },
  CHN: {
    bg: 0xee1c25,
    x: [['star', 0.17, 0.27, 0.16, 0xffff00], ['star', 0.33, 0.1, 0.05, 0xffff00], ['star', 0.4, 0.2, 0.05, 0xffff00],
      ['star', 0.4, 0.35, 0.05, 0xffff00], ['star', 0.33, 0.45, 0.05, 0xffff00]],
  },
  GEO: {
    bg: WHITE,
    x: [['cross', 0xff0000, 0.5, 0.5, 0.2],
      ['rect', 0.18, 0.14, 0.06, 0.16, 0xff0000], ['rect', 0.15, 0.19, 0.12, 0.06, 0xff0000],
      ['rect', 0.76, 0.14, 0.06, 0.16, 0xff0000], ['rect', 0.73, 0.19, 0.12, 0.06, 0xff0000],
      ['rect', 0.18, 0.7, 0.06, 0.16, 0xff0000], ['rect', 0.15, 0.75, 0.12, 0.06, 0xff0000],
      ['rect', 0.76, 0.7, 0.06, 0.16, 0xff0000], ['rect', 0.73, 0.75, 0.12, 0.06, 0xff0000]],
  },
  IND: {
    h: [0xff9933, WHITE, 0x138808],
    x: [['circle', 0.5, 0.5, 0.13, 0x000080], ['circle', 0.5, 0.5, 0.1, WHITE], ['rays', 0.5, 0.5, 0.1, 12, 0x000080], ['circle', 0.5, 0.5, 0.03, 0x000080]],
  },
  IDN: { h: [0xff0000, WHITE] },
  IRN: { h: [0x239f40, WHITE, 0xda0000], x: [['circle', 0.5, 0.5, 0.11, 0xda0000], ['circle', 0.5, 0.5, 0.07, WHITE], ['rect', 0.49, 0.4, 0.02, 0.2, 0xda0000]] },
  IRQ: {
    h: [0xce1126, WHITE, BLACK],
    x: [['rect', 0.3, 0.45, 0.4, 0.04, 0x007a3d], ['rect', 0.34, 0.39, 0.03, 0.08, 0x007a3d], ['rect', 0.48, 0.39, 0.03, 0.08, 0x007a3d], ['rect', 0.62, 0.39, 0.03, 0.08, 0x007a3d]],
  },
  ISR: { h: [WHITE, 0x0038b8, WHITE, 0x0038b8, WHITE], w: [2, 3, 10, 3, 2], x: [['star6', 0.5, 0.5, 0.2, 0x0038b8, WHITE]] },
  JPN: { bg: WHITE, x: [['circle', 0.5, 0.5, 0.3, 0xbc002d]] },
  JOR: { h: [BLACK, WHITE, 0x007a3d], x: [['tri', 0xce1126, 0.42], ['star', 0.14, 0.5, 0.08, WHITE]] },
  KAZ: {
    bg: 0x00afca,
    x: [['rays', 0.5, 0.42, 0.32, 24, 0xfec50c], ['circle', 0.5, 0.42, 0.15, 0xfec50c], ['oval', 0.5, 0.7, 0.3, 0.08, 0xfec50c],
      ['rect', 0.05, 0.05, 0.04, 0.9, 0xfec50c]],
  },
  KWT: { h: [0x007a3d, WHITE, 0xce1126], x: [['poly', BLACK, [[0, 0], [0.25, 0.33], [0.25, 0.67], [0, 1]]]] },
  KGZ: { bg: 0xe8112d, x: [['rays', 0.5, 0.5, 0.36, 40, 0xffef00], ['circle', 0.5, 0.5, 0.2, 0xffef00], ['circle', 0.5, 0.5, 0.13, 0xe8112d]] },
  LAO: { h: [0xce1126, 0x002868, 0xce1126], w: [1, 2, 1], x: [['circle', 0.5, 0.5, 0.2, WHITE]] },
  LBN: {
    h: [0xed1c24, WHITE, 0xed1c24], w: [1, 2, 1],
    x: [['poly', 0x00a651, [[0.5, 0.28], [0.36, 0.55], [0.43, 0.55], [0.33, 0.68], [0.67, 0.68], [0.57, 0.55], [0.64, 0.55]]],
      ['rect', 0.48, 0.68, 0.04, 0.05, 0x00a651]],
  },
  MYS: {
    h: alternate(14, 0xcc0001, WHITE),
    x: [['rect', 0, 0, 0.5, 0.57, 0x010066], ['moon', 0.2, 0.285, 0.2, 0xffcc00, 0x010066], ['star', 0.33, 0.285, 0.12, 0xffcc00]],
  },
  MDV: { bg: 0xd21034, x: [['rect', 0.25, 0.25, 0.5, 0.5, 0x007e3a], ['moon', 0.5, 0.5, 0.18, WHITE, 0x007e3a]] },
  MNG: {
    v: [0xc4272f, 0x015197, 0xc4272f],
    x: [['circle', 0.17, 0.22, 0.06, 0xf9cf02], ['rect', 0.12, 0.32, 0.1, 0.06, 0xf9cf02], ['circle', 0.17, 0.5, 0.07, 0xf9cf02],
      ['rect', 0.12, 0.62, 0.1, 0.06, 0xf9cf02], ['rect', 0.09, 0.3, 0.025, 0.42, 0xf9cf02], ['rect', 0.225, 0.3, 0.025, 0.42, 0xf9cf02]],
  },
  MMR: { h: [0xfecb00, 0x34b233, 0xea2839], x: [['star', 0.5, 0.55, 0.38, WHITE]] },
  NPL: {
    // Nepal is the only flag that is not a rectangle: two triangles, one on top of the other
    x: [['poly', 0x003893, [[0, 0], [0.75, 0.48], [0.3, 0.48], [0.75, 1], [0, 1]]],
      ['poly', 0xdc143c, [[0.04, 0.08], [0.6, 0.44], [0.2, 0.44], [0.62, 0.96], [0.04, 0.96]]],
      ['moon', 0.18, 0.3, 0.11, WHITE, 0xdc143c, 0, -0.4], ['circle', 0.18, 0.75, 0.1, WHITE]],
  },
  PRK: {
    h: [0x024fa2, WHITE, 0xed1c27, WHITE, 0x024fa2], w: [5, 1, 14, 1, 5],
    x: [['circle', 0.35, 0.5, 0.2, WHITE], ['star', 0.35, 0.5, 0.19, 0xed1c27]],
  },
  OMN: {
    h: [WHITE, 0xdb161b, 0x008000],
    x: [['rect', 0, 0, 0.3, 1, 0xdb161b], ['rect', 0.08, 0.1, 0.12, 0.04, WHITE], ['rect', 0.12, 0.05, 0.04, 0.2, WHITE]],
  },
  PAK: { v: [WHITE, 0x01411c], w: [1, 3], x: [['moon', 0.62, 0.5, 0.28, WHITE, 0x01411c, 0.25], ['star', 0.72, 0.38, 0.1, WHITE]] },
  PHL: {
    h: [0x0038a8, 0xce1126],
    x: [['tri', WHITE, 0.45], ['rays', 0.15, 0.5, 0.2, 8, 0xfcd116], ['circle', 0.15, 0.5, 0.09, 0xfcd116],
      ['star', 0.04, 0.1, 0.05, 0xfcd116], ['star', 0.04, 0.9, 0.05, 0xfcd116], ['star', 0.37, 0.5, 0.05, 0xfcd116]],
  },
  QAT: { bg: 0x8a1538, x: [['zig', WHITE, 0.3, 9]] },
  SAU: {
    bg: 0x006c35,
    x: [['rect', 0.25, 0.68, 0.5, 0.04, WHITE], ['rect', 0.22, 0.3, 0.56, 0.07, WHITE],
      ['rect', 0.3, 0.42, 0.4, 0.05, WHITE], ['rect', 0.3, 0.22, 0.04, 0.2, WHITE], ['rect', 0.62, 0.22, 0.04, 0.2, WHITE]],
  },
  SGP: {
    h: [0xef3340, WHITE],
    x: [['moon', 0.15, 0.25, 0.17, WHITE, 0xef3340], ...ring(5, 0.28, 0.25, 0.1, 0.04, WHITE, 0.75, 1.75)],
  },
  KOR: {
    bg: WHITE,
    x: [['circle', 0.5, 0.5, 0.25, 0x003478], ['half', 0.5, 0.5, 0.25, 0xcd2e3a],
      ['rect', 0.15, 0.15, 0.1, 0.18, BLACK], ['rect', 0.75, 0.15, 0.1, 0.18, BLACK],
      ['rect', 0.15, 0.67, 0.1, 0.18, BLACK], ['rect', 0.75, 0.67, 0.1, 0.18, BLACK]],
  },
  LKA: {
    bg: 0xffb700,
    x: [['rect', 0.04, 0.07, 0.12, 0.86, 0x005f56], ['rect', 0.17, 0.07, 0.12, 0.86, 0xff5b00],
      ['rect', 0.33, 0.07, 0.63, 0.86, 0x8d153a], ['oval', 0.64, 0.5, 0.3, 0.5, 0xffb700], ['rect', 0.7, 0.3, 0.04, 0.4, 0x8d153a]],
  },
  SYR: { h: [0x007a3d, WHITE, BLACK], x: [['star', 0.3, 0.5, 0.11, 0xce1126], ['star', 0.5, 0.5, 0.11, 0xce1126], ['star', 0.7, 0.5, 0.11, 0xce1126]] },
  TJK: {
    h: [0xcc0000, WHITE, 0x006600], w: [2, 3, 2],
    x: [['half', 0.5, 0.52, 0.1, 0xf8c300], ...ring(7, 0.5, 0.52, 0.18, 0.035, 0xf8c300, 0.55, 0.95)],
  },
  THA: { h: [0xa51931, 0xf4f5f8, 0x2d2a4a, 0xf4f5f8, 0xa51931], w: [1, 1, 2, 1, 1] },
  TLS: { bg: 0xdc241f, x: [['tri', 0xffc726, 0.5], ['tri', BLACK, 0.33], ['star', 0.11, 0.5, 0.11, WHITE]] },
  TUR: { bg: 0xe30a17, x: [['moon', 0.36, 0.5, 0.25, WHITE, 0xe30a17], ['star', 0.53, 0.5, 0.12, WHITE]] },
  TKM: {
    bg: 0x00843d,
    x: [['rect', 0.18, 0, 0.14, 1, 0xd22630], ...[0.12, 0.3, 0.5, 0.7, 0.88].map((y) => ['diamond', 0.25, y, 0.06, 0xffc72c]),
      ['moon', 0.45, 0.25, 0.14, WHITE, 0x00843d], ...ring(5, 0.5, 0.25, 0.13, 0.035, WHITE, 0.7, 1.3)],
  },
  ARE: { h: [0x00732f, WHITE, BLACK], x: [['rect', 0, 0, 0.25, 1, 0xff0000]] },
  UZB: {
    h: [0x0099b5, 0xce1126, WHITE, 0xce1126, 0x1eb53a], w: [10, 1, 10, 1, 10],
    x: [['moon', 0.13, 0.17, 0.12, WHITE, 0x0099b5], ...[0.25, 0.32, 0.39].map((x) => ['star', x, 0.17, 0.035, WHITE])],
  },
  VNM: { bg: 0xda251d, x: [['star', 0.5, 0.5, 0.3, 0xffff00]] },
  YEM: { h: [0xce1126, WHITE, BLACK] },
  // (These Asian countries are also on the map)
  PNG: {
    bg: 0xce1126,
    x: [['poly', BLACK, [[0, 0], [1, 1], [0, 1]]], ['oval', 0.7, 0.3, 0.22, 0.12, 0xfcd116],
      ['star', 0.2, 0.55, 0.05, WHITE], ['star', 0.3, 0.7, 0.05, WHITE], ['star', 0.12, 0.72, 0.05, WHITE], ['star', 0.22, 0.88, 0.05, WHITE]],
  },

  // ---------------- OCEANÍA ----------------
  AUS: {
    bg: NAVY,
    x: [['jack', 0, 0, 0.5, 0.5], ['star', 0.25, 0.75, 0.15, WHITE],
      ['star', 0.75, 0.2, 0.06, WHITE], ['star', 0.62, 0.45, 0.06, WHITE], ['star', 0.88, 0.4, 0.06, WHITE], ['star', 0.75, 0.82, 0.07, WHITE]],
  },
  FJI: {
    bg: 0x68bfe5,
    x: [['jack', 0, 0, 0.5, 0.5], ['rect', 0.62, 0.3, 0.24, 0.42, WHITE], ['rect', 0.62, 0.3, 0.24, 0.1, 0xce1126],
      ['rect', 0.72, 0.4, 0.04, 0.32, 0xce1126], ['rect', 0.62, 0.53, 0.24, 0.04, 0xce1126]],
  },
  KIR: {
    h: [0xce1126, 0x003f87],
    x: [['half', 0.5, 0.5, 0.22, 0xfcd116],
      ['rect', 0, 0.58, 1, 0.07, WHITE], ['rect', 0, 0.73, 1, 0.07, WHITE], ['rect', 0, 0.88, 1, 0.07, WHITE],
      ['oval', 0.5, 0.2, 0.3, 0.08, 0xfcd116]],
  },
  MHL: {
    bg: 0x003893,
    x: [['diag', 0xdd7500, 0.2, true], ['diag', WHITE, 0.08, true], ['rays', 0.2, 0.3, 0.17, 12, WHITE], ['circle', 0.2, 0.3, 0.05, WHITE]],
  },
  FSM: {
    bg: 0x75b2dd,
    x: [['star', 0.5, 0.22, 0.1, WHITE], ['star', 0.5, 0.78, 0.1, WHITE], ['star', 0.3, 0.5, 0.1, WHITE], ['star', 0.7, 0.5, 0.1, WHITE]],
  },
  NRU: { bg: 0x002b7f, x: [['rect', 0, 0.45, 1, 0.1, 0xffc61e], ['star', 0.25, 0.72, 0.13, WHITE]] },
  NZL: {
    bg: NAVY,
    x: [['jack', 0, 0, 0.5, 0.5], ['star', 0.75, 0.22, 0.09, WHITE], ['star', 0.75, 0.22, 0.06, 0xc8102e],
      ['star', 0.66, 0.45, 0.09, WHITE], ['star', 0.66, 0.45, 0.06, 0xc8102e],
      ['star', 0.86, 0.4, 0.08, WHITE], ['star', 0.86, 0.4, 0.05, 0xc8102e],
      ['star', 0.75, 0.78, 0.1, WHITE], ['star', 0.75, 0.78, 0.07, 0xc8102e]],
  },
  PLW: { bg: 0x4aadd6, x: [['circle', 0.45, 0.5, 0.3, 0xffde00]] },
  WSM: {
    bg: 0xce1126,
    x: [['rect', 0, 0, 0.5, 0.5, 0x002b7f], ['star', 0.25, 0.1, 0.06, WHITE], ['star', 0.33, 0.22, 0.05, WHITE],
      ['star', 0.17, 0.25, 0.06, WHITE], ['star', 0.25, 0.4, 0.07, WHITE]],
  },
  SLB: {
    bg: 0x0051ba,
    x: [['poly', 0x215b33, [[1, 0], [1, 1], [0, 1]]], ['diag', 0xfcd116, 0.1, true],
      ...ring(5, 0.2, 0.28, 0.14, 0.04, WHITE)],
  },
  TON: { bg: 0xc10000, x: [['rect', 0, 0, 0.45, 0.5, WHITE], ['rect', 0.18, 0.08, 0.09, 0.34, 0xc10000], ['rect', 0.1, 0.19, 0.25, 0.12, 0xc10000]] },
  VUT: {
    h: [0xd21034, 0x009543],
    x: [['rect', 0, 0.42, 1, 0.16, BLACK], ['rect', 0, 0.47, 1, 0.06, 0xfdce12],
      ['tri', 0xfdce12, 0.47], ['tri', BLACK, 0.42], ['circle', 0.15, 0.5, 0.11, 0xfdce12], ['circle', 0.15, 0.5, 0.07, BLACK]],
  },
};

// ------------------------------------------------------------------
// Drawing
// ------------------------------------------------------------------

// Cut a polygon so it stays inside a box (the "Sutherland–Hodgman" trick):
// we walk around the polygon and cut it with each of the 4 sides of the box,
// one side at a time. Without this, diagonal bands would stick out of the flag.
function clipToBox(points, left, top, right, bottom) {
  const sides = [
    { inside: (p) => p.x >= left, cross: (a, b) => cutAtX(a, b, left) },
    { inside: (p) => p.x <= right, cross: (a, b) => cutAtX(a, b, right) },
    { inside: (p) => p.y >= top, cross: (a, b) => cutAtY(a, b, top) },
    { inside: (p) => p.y <= bottom, cross: (a, b) => cutAtY(a, b, bottom) },
  ];
  let result = points;
  for (const side of sides) {
    const input = result;
    result = [];
    for (let i = 0; i < input.length; i++) {
      const current = input[i];
      const previous = input[(i + input.length - 1) % input.length];
      if (side.inside(current)) {
        if (!side.inside(previous)) result.push(side.cross(previous, current));
        result.push(current);
      } else if (side.inside(previous)) {
        result.push(side.cross(previous, current));
      }
    }
  }
  return result;
}
// Where the line from a to b crosses a vertical line (x) or a horizontal line (y)
function cutAtX(a, b, x) {
  const t = (x - a.x) / (b.x - a.x);
  return { x, y: a.y + (b.y - a.y) * t };
}
function cutAtY(a, b, y) {
  const t = (y - a.y) / (b.y - a.y);
  return { x: a.x + (b.x - a.x) * t, y };
}

// Fill a list of {x, y} points, cut so they stay inside the box
function fillInBox(g, color, points, box) {
  const inside = clipToBox(points, box.x, box.y, box.x + box.w, box.y + box.h);
  if (inside.length >= 3) polygon(g, color, inside.map((p) => [p.x, p.y]));
}

// The points of a star with n tips (for the 5-point stars and the sun rays)
function starPoints(cx, cy, outer, inner, tips, turn = -Math.PI / 2) {
  const points = [];
  for (let i = 0; i < tips * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = turn + (i * Math.PI) / tips;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return points;
}

// A band from one corner of the box to the other, "t" pixels thick
function diagonalBand(g, color, box, t, up) {
  // The middle line goes from bottom-left to top-right (up) or top-left to bottom-right
  const a = up ? { x: box.x, y: box.y + box.h } : { x: box.x, y: box.y };
  const b = up ? { x: box.x + box.w, y: box.y } : { x: box.x + box.w, y: box.y + box.h };
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  // dx, dy = one step along the line; nx, ny = one step sideways (to make it thick)
  const dx = (b.x - a.x) / length;
  const dy = (b.y - a.y) / length;
  const nx = -dy * (t / 2);
  const ny = dx * (t / 2);
  // Make the band a bit longer than the flag, then cut it to fit exactly
  const extra = t;
  const start = { x: a.x - dx * extra, y: a.y - dy * extra };
  const end = { x: b.x + dx * extra, y: b.y + dy * extra };
  fillInBox(g, color, [
    { x: start.x + nx, y: start.y + ny }, { x: end.x + nx, y: end.y + ny },
    { x: end.x - nx, y: end.y - ny }, { x: start.x - nx, y: start.y - ny },
  ], box);
}

// A small Union Jack (the flag of the United Kingdom) inside the box
function unionJack(g, tone, box) {
  g.fillStyle(tone(NAVY), 1);
  g.fillRect(box.x, box.y, box.w, box.h);
  const t = box.h; // the thickness of each band is a part of the box's height
  diagonalBand(g, tone(WHITE), box, t * 0.2, true);
  diagonalBand(g, tone(WHITE), box, t * 0.2, false);
  diagonalBand(g, tone(0xc8102e), box, t * 0.07, true);
  diagonalBand(g, tone(0xc8102e), box, t * 0.07, false);
  // The straight cross: white, then a thinner red one on top
  g.fillStyle(tone(WHITE), 1);
  g.fillRect(box.x, box.y + box.h / 2 - t * 0.17, box.w, t * 0.34);
  g.fillRect(box.x + box.w / 2 - t * 0.17, box.y, t * 0.34, box.h);
  g.fillStyle(tone(0xc8102e), 1);
  g.fillRect(box.x, box.y + box.h / 2 - t * 0.1, box.w, t * 0.2);
  g.fillRect(box.x + box.w / 2 - t * 0.1, box.y, t * 0.2, box.h);
}

// Draw the flag inside the box (fx, fy = top-left corner, W x H = size in pixels)
export function drawFlag(g, tone, flag, fx, fy, W, H) {
  const box = { x: fx, y: fy, w: W, h: H };
  // px / py change flag coordinates (0..1) into real pixels on the screen
  const px = (u) => fx + u * W;
  const py = (v) => fy + v * H;

  // 1. The background: one color, or stripes
  if (flag.bg !== undefined) {
    g.fillStyle(tone(flag.bg), 1);
    g.fillRect(fx, fy, W, H);
  }
  const stripes = flag.h || flag.v;
  if (stripes) {
    const weights = flag.w || stripes.map(() => 1);
    const total = weights.reduce((sum, n) => sum + n, 0);
    let done = 0;
    stripes.forEach((color, i) => {
      const from = done / total;
      done += weights[i];
      const to = done / total;
      g.fillStyle(tone(color), 1);
      // +0.5 pixel so no thin gap shows between two stripes
      if (flag.h) g.fillRect(fx, py(from), W, (to - from) * H + 0.5);
      else g.fillRect(px(from), fy, (to - from) * W + 0.5, H);
    });
  }

  // 2. The shapes on top, in order
  for (const shape of flag.x || []) {
    const [type] = shape;
    if (type === 'rect') {
      const [, x, y, w, h, color] = shape;
      g.fillStyle(tone(color), 1);
      g.fillRect(px(x), py(y), w * W, h * H);
    } else if (type === 'circle') {
      const [, x, y, r, color] = shape;
      g.fillStyle(tone(color), 1);
      g.fillCircle(px(x), py(y), r * H);
    } else if (type === 'oval') {
      const [, x, y, w, h, color] = shape;
      g.fillStyle(tone(color), 1);
      g.fillEllipse(px(x), py(y), w * W, h * H);
    } else if (type === 'half') {
      // The top half of a circle, made with points (like a sun coming up)
      const [, x, y, r, color] = shape;
      const points = [];
      for (let i = 0; i <= 12; i++) {
        const angle = Math.PI + (i * Math.PI) / 12;
        points.push([px(x) + Math.cos(angle) * r * H, py(y) + Math.sin(angle) * r * H]);
      }
      polygon(g, tone(color), points);
    } else if (type === 'star') {
      const [, x, y, r, color] = shape;
      polygon(g, tone(color), starPoints(px(x), py(y), r * H, r * H * 0.4, 5));
    } else if (type === 'star6') {
      // Two triangles make the star; two smaller ones in the "hole" color make it hollow
      const [, x, y, r, color, hole] = shape;
      const cx = px(x);
      const cy = py(y);
      for (const [size, c] of [[r * H, color], [r * H * 0.72, hole]]) {
        polygon(g, tone(c), [[cx, cy - size], [cx + size * 0.87, cy + size / 2], [cx - size * 0.87, cy + size / 2]]);
        polygon(g, tone(c), [[cx, cy + size], [cx + size * 0.87, cy - size / 2], [cx - size * 0.87, cy - size / 2]]);
      }
    } else if (type === 'moon') {
      // A full circle, then a smaller circle moved a bit "bites" it, painted in the
      // color behind it. dx, dy = how far the bite moves (as a part of r)
      const [, x, y, r, color, bite, dx = 0.3, dy = 0] = shape;
      g.fillStyle(tone(color), 1);
      g.fillCircle(px(x), py(y), r * H);
      g.fillStyle(tone(bite), 1);
      g.fillCircle(px(x) + r * H * dx, py(y) + r * H * dy, r * H * 0.8);
    } else if (type === 'diamond') {
      const [, x, y, r, color] = shape;
      const cx = px(x);
      const cy = py(y);
      polygon(g, tone(color), [[cx, cy - r * H], [cx + r * H * 0.7, cy], [cx, cy + r * H], [cx - r * H * 0.7, cy]]);
    } else if (type === 'tri') {
      // From the top and bottom corners next to the pole, to a point in the middle
      const [, color, length] = shape;
      polygon(g, tone(color), [[px(0), py(0)], [px(length), py(0.5)], [px(0), py(1)]]);
    } else if (type === 'cross') {
      const [, color, x, y, t] = shape;
      g.fillStyle(tone(color), 1);
      g.fillRect(fx, py(y) - (t * H) / 2, W, t * H); // the lying-down bar
      g.fillRect(px(x) - (t * H) / 2, fy, t * H, H); // the standing-up bar
    } else if (type === 'diag') {
      const [, color, t, up] = shape;
      diagonalBand(g, tone(color), box, t * H, up);
    } else if (type === 'poly') {
      const [, color, points] = shape;
      fillInBox(g, tone(color), points.map(([x, y]) => ({ x: px(x), y: py(y) })), box);
    } else if (type === 'zig') {
      // A box at the pole side with a zigzag edge (the "teeth" of Qatar and Bahrain)
      const [, color, x, teeth] = shape;
      const points = [[px(0), py(0)], [px(x), py(0)]];
      for (let i = 0; i < teeth; i++) {
        points.push([px(x + 0.08), py((i + 0.5) / teeth)]);
        points.push([px(x), py((i + 1) / teeth)]);
      }
      points.push([px(0), py(1)]);
      polygon(g, tone(color), points);
    } else if (type === 'rays') {
      // A star with many thin tips looks like the rays of a sun
      const [, x, y, r, n, color] = shape;
      fillInBox(g, tone(color), starPoints(px(x), py(y), r * H, r * H * 0.45, n)
        .map(([a, b]) => ({ x: a, y: b })), box);
    } else if (type === 'jack') {
      const [, x, y, w, h] = shape;
      unionJack(g, tone, { x: px(x), y: py(y), w: w * W, h: h * H });
    }
  }
}

// Draw the flag of a country on a pole. (x, groundY) = the bottom of the pole,
// s = how big (1 = a pole 110 pixels tall with a 45 x 30 flag)
export function drawFlagPole(g, tone, x, groundY, flag, s = 1) {
  const poleHeight = 110 * s;
  const poleWidth = 3 * s;
  const top = groundY - poleHeight;

  // The gray pole, a little base and a golden ball on top
  g.fillStyle(tone(0x8a8a8a), 1);
  g.fillRect(x - poleWidth / 2, top, poleWidth, poleHeight);
  g.fillStyle(tone(0x6e6e6e), 1);
  g.fillRect(x - 5 * s, groundY - 4 * s, 10 * s, 4 * s);
  g.fillStyle(tone(0xd4af37), 1);
  g.fillCircle(x, top, 3 * s);

  // The flag hangs from the top, right next to the pole
  const W = 45 * s;
  const H = 30 * s;
  drawFlag(g, tone, flag, x + poleWidth / 2, top + 3 * s, W, H);
}
