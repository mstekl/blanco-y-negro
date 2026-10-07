// record.js — The record: the most points anyone ever got in this browser.
// It is saved in the browser (localStorage), so it stays after closing the page,
// and friends can try to beat it!

const RECORD_KEY = 'blancoYNegro.record';

// What is the record right now? (0 if nobody played yet)
export function loadRecord() {
  try {
    return Number(window.localStorage.getItem(RECORD_KEY)) || 0;
  } catch (e) {
    return 0; // Storage blocked: no record yet
  }
}

// Give it the points of a game that just ended.
// If they beat the record, we save them and say true ("new record!")
export function checkRecord(score) {
  if (score <= loadRecord()) return false;
  try {
    window.localStorage.setItem(RECORD_KEY, String(score));
  } catch (e) {
    // Storage blocked: the record only lasts until the page is reloaded
  }
  return true;
}

// Points always look like 00350 (5 digits), like in old arcade games
export function formatPoints(points) {
  return String(points).padStart(5, '0');
}
