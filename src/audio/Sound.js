// Sound.js — All the sounds and the music of the game, made with CODE!
// There are no sound files: the browser has a little synthesizer inside
// (the "Web Audio API"), and we tell it which notes to play, like a piano.
//
//   playSound('saltar')   → a short sound effect (jump, coin, hit, win...)
//   playMusic('sala')     → a song that repeats (the sala song, or the game song)
//   toggleSound()         → turn everything off or on (it is remembered)
//
// Browsers only allow sound AFTER the player touches or presses something,
// so the synthesizer wakes up on the first click or key press.

const MUTE_KEY = 'blancoYNegro.sinSonido';

let ctx = null;        // the synthesizer (made the first time we need it)
let master = null;     // the main volume knob: everything goes through it
let muted = loadMuted();

function loadMuted() {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch (e) {
    return false;
  }
}

// Make the synthesizer (only once)
function audio() {
  if (ctx) return ctx;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null; // a very old browser: no sound, but the game works
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.5;
  master.connect(ctx.destination);
  return ctx;
}

// Wake the synthesizer up with the first touch or key (browsers need this)
['pointerdown', 'keydown', 'touchstart'].forEach((type) => {
  window.addEventListener(type, () => {
    const a = audio();
    if (a && a.state === 'suspended') a.resume();
  }, { passive: true });
});

// ---------------------------------------------------------------
// One note: a frequency (how high), when it starts, how long it lasts,
// the "wave" (the kind of sound: 'square' is very videogame, 'sine' is soft,
// 'triangle' is in between) and how loud.
// "slideTo" makes the note slide up or down (like "piuuu").
// ---------------------------------------------------------------
function note(freq, start, length, wave = 'square', volume = 0.3, slideTo = null) {
  const a = audio();
  if (!a || muted) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + length);
  // The volume goes up fast and fades away, so the notes don't "click"
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

// A noise burst (like "pshh"), for hits and explosions
function noise(start, length, volume = 0.3) {
  const a = audio();
  if (!a || muted) return;
  const t = a.currentTime + start;
  const buffer = a.createBuffer(1, Math.floor(a.sampleRate * length), a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const source = a.createBufferSource();
  const gain = a.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(master);
  source.start(t);
}

// Note names → frequencies, so the songs are easier to read (C4 = "do" in the middle)
const NOTES = {};
['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].forEach((name, i) => {
  for (let octave = 2; octave <= 6; octave++) {
    NOTES[`${name}${octave}`] = 440 * 2 ** ((i - 9) / 12 + (octave - 4));
  }
});

// ---------------------------------------------------------------
// The sound effects
// ---------------------------------------------------------------
const SOUNDS = {
  saltar: () => note(300, 0, 0.15, 'square', 0.15, 600),
  moneda: () => { note(NOTES.B5, 0, 0.07, 'square', 0.15); note(NOTES.E6, 0.07, 0.2, 'square', 0.15); },
  disparo: () => note(900, 0, 0.12, 'square', 0.1, 300),
  pisar: () => { note(200, 0, 0.1, 'square', 0.2, 80); noise(0, 0.08, 0.15); },
  golpe: () => { noise(0, 0.25, 0.35); note(160, 0, 0.3, 'sawtooth', 0.2, 60); },
  powerup: () => [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6].forEach((f, i) => note(f, i * 0.07, 0.12, 'square', 0.15)),
  lapizBueno: () => [NOTES.G5, NOTES.C6].forEach((f, i) => note(f, i * 0.09, 0.18, 'triangle', 0.3)),
  lapizMalo: () => note(300, 0, 0.35, 'sawtooth', 0.2, 90),
  cuenta: () => note(NOTES.A4, 0, 0.15, 'square', 0.2),
  ya: () => note(NOTES.A5, 0, 0.35, 'square', 0.2),
  oleada: () => [0, 0.2, 0.4].forEach((t) => note(NOTES.E4, t, 0.15, 'sawtooth', 0.15)),
  ganar: () => [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6, NOTES.G5, NOTES.C6].forEach((f, i) => note(f, i * 0.12, i === 5 ? 0.5 : 0.14, 'square', 0.18)),
  perder: () => [NOTES.G4, NOTES.F4, NOTES.E4, NOTES.C4].forEach((f, i) => note(f, i * 0.2, 0.25, 'triangle', 0.3)),
  mision: () => [NOTES.E5, NOTES.G5, NOTES.E6].forEach((f, i) => note(f, i * 0.1, 0.15, 'triangle', 0.3)),
  comprar: () => { note(NOTES.C6, 0, 0.08, 'square', 0.12); note(NOTES.G6, 0.08, 0.15, 'square', 0.12); },
  click: () => note(NOTES.C5, 0, 0.05, 'square', 0.08),
};

export function playSound(name) {
  if (SOUNDS[name]) SOUNDS[name]();
}

// ---------------------------------------------------------------
// The music: little songs that repeat. Each step is a note (or null = silence)
// and lasts the same time. The bass plays under the melody.
// ---------------------------------------------------------------
const SONGS = {
  // The sala: calm and happy
  sala: {
    step: 0.22,
    melody: ['C5', null, 'E5', 'G5', 'A5', null, 'G5', 'E5', 'F5', null, 'D5', 'F5', 'E5', null, 'C5', null,
      'C5', null, 'E5', 'G5', 'C6', null, 'B5', 'A5', 'G5', null, 'E5', 'D5', 'C5', null, null, null],
    bass: ['C3', 'C3', 'A2', 'A2', 'F2', 'F2', 'G2', 'G2'],
  },
  // While playing: faster, with more energy
  juego: {
    step: 0.16,
    melody: ['E5', 'E5', null, 'E5', null, 'C5', 'E5', null, 'G5', null, null, null, 'G4', null, null, null,
      'C5', null, 'G4', null, 'E4', null, 'A4', 'B4', 'A#4', 'A4', 'G4', 'E5', 'G5', 'A5', 'F5', 'G5'],
    bass: ['C3', 'G2', 'C3', 'G2', 'F2', 'C3', 'G2', 'G2'],
  },
};

let currentSong = null;
let songTimer = null;
let songStep = 0;

export function playMusic(name) {
  if (currentSong === name) return; // already playing it
  stopMusic();
  const song = SONGS[name];
  if (!song) return;
  currentSong = name;
  songStep = 0;
  // Every "step" we play the next note of the melody (and a bass note every 4 steps)
  songTimer = setInterval(() => {
    const melody = song.melody[songStep % song.melody.length];
    if (melody) note(NOTES[melody], 0, song.step * 0.9, 'square', 0.05);
    if (songStep % 4 === 0) {
      const bass = song.bass[Math.floor(songStep / 4) % song.bass.length];
      note(NOTES[bass], 0, song.step * 3.5, 'triangle', 0.12);
    }
    songStep += 1;
  }, song.step * 1000);
}

export function stopMusic() {
  clearInterval(songTimer);
  songTimer = null;
  currentSong = null;
}

// ---------------------------------------------------------------
// 🔊 / 🔇: turn the sound on or off (remembered in the browser)
// ---------------------------------------------------------------
export function isMuted() {
  return muted;
}

export function toggleSound() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch (e) {
    // Storage blocked: it is only remembered until the page is reloaded
  }
  return muted;
}
