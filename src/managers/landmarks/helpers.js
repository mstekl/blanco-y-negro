// helpers.js — Small tools that every landmark drawing uses
// (LandmarkArt.js and the landmark files of each region, in this folder).

// Where things stand (the ground platforms start at y=568)
export const GROUND = 562;

// A tiny "random" number generator that always gives the same numbers, so the
// scenery looks the same every time we play (the real random would change it)
export const pseudoRandom = (i) => ((i * 9301 + 49297) % 233280) / 233280;

// Draw a filled polygon from a list of [x, y] pairs
export function polygon(g, color, points) {
  g.fillStyle(color, 1);
  g.fillPoints(points.map(([x, y]) => ({ x, y })), true);
}

// Is x close to one of the spots where the landmarks stand? (to leave them room)
export const nearSpot = (spots, x, gap) => spots.some((spot) => Math.abs(x - spot) < gap);
