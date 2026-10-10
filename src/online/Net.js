// Net.js — Playing ONLINE: 2, 3 or 4 phones, iPads or computers talk to each other.
// We use PeerJS: a free helper on the internet that lets browsers find
// each other. After that they talk DIRECTLY (no server in the middle).
//
// How the secret word works:
//   - The player who CREATES the game gets a secret word (for example GATO).
//     PeerJS gives that browser the name "blanco-y-negro-gato".
//   - The friends who JOIN type GATO, so we look for "blanco-y-negro-gato"
//     on the internet and connect to it. Nobody else knows the word!
//
// With more than 2 players, the one who CREATED the game is the CENTER
// (like a post office): every friend is connected only to the center, and the
// center passes every message on to all the others.
//
//      friend 1 ──┐
//      friend 2 ──┼── CENTER (the creator)
//      friend 3 ──┘
//
// The messages are small objects, like { t: 'progreso', frac: 0.5, from: 'abc' }.
// "t" says what kind of message it is, "from" says WHO sent it.

import Peer from 'peerjs';

// Every name starts with this, so we never mix with other games that use PeerJS
const PREFIX = 'blanco-y-negro-';

// The most players in one game (the creator + 3 friends)
export const MAX_PLAYERS = 4;

// Easy words to say out loud and type on a phone (no accents, no ñ)
const WORDS = [
  'GATO', 'PERRO', 'LUNA', 'SOL', 'NUBE', 'PATO', 'OSO', 'LEON', 'TIGRE', 'MONO',
  'RANA', 'PEZ', 'VACA', 'CERDO', 'BURRO', 'LORO', 'BUHO', 'ZORRO', 'LOBO', 'CEBRA',
  'PIZZA', 'TACO', 'PAN', 'QUESO', 'MANGO', 'PERA', 'UVA', 'COCO', 'LIMON', 'FRESA',
  'ROJO', 'AZUL', 'VERDE', 'ROSA', 'GRIS', 'ORO', 'PLATA', 'NEGRO', 'BLANCO', 'MORADO',
  'BOTA', 'GORRA', 'LAPIZ', 'GOMA', 'LIBRO', 'MESA', 'SILLA', 'CAMA', 'TAZA', 'VASO',
  'BARCO', 'TREN', 'AVION', 'COHETE', 'BICI', 'AUTO', 'MOTO', 'GLOBO', 'COMETA', 'ROBOT',
  'CASTILLO', 'TORRE', 'PUENTE', 'ISLA', 'PLAYA', 'MONTE', 'RIO', 'LAGO', 'BOSQUE', 'CUEVA',
  'NINJA', 'PIRATA', 'MAGO', 'HADA', 'DRAGON', 'GIGANTE', 'REY', 'REINA', 'HEROE', 'FANTASMA',
];

export function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

// "Gato ", "gató" and "GATO" are the same word: capitals, accents and spaces don't count
export function cleanWord(text) {
  return text.normalize('NFD').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

class Net {
  constructor() {
    this.peer = null;
    this.conns = new Map();    // who we are connected to: their id → the connection
    this.lastHeard = new Map(); // when we last heard from each player: id → time
    this.gone = new Set();     // players who left
    this.isHost = false;       // are we the CENTER (the one who created the game)?
    this.myId = null;
    this.hostId = null;
    this.locked = false;       // true = the game started, nobody else can come in
    this.closed = false;
    // The scenes put their own functions here, to hear what happens
    this.onMessage = () => {};     // a message arrived
    this.onConnected = () => {};   // a new player connected to us
    this.onPlayerLeft = () => {};  // one player left (the others are still here)
    this.onClose = () => {};       // EVERYBODY is gone (or the center left)
  }

  // CREATE a game with a new secret word. Gives back the word when we are ready.
  // If somebody else is already using that word, we try another one.
  async host() {
    for (let tries = 0; tries < 5; tries++) {
      const word = randomWord();
      try {
        await this.openPeer(PREFIX + word.toLowerCase());
        this.isHost = true;
        this.hostId = this.myId;
        // Now we wait for our friends to connect to us
        this.peer.on('connection', (conn) => {
          if (this.locked || this.conns.size >= MAX_PLAYERS - 1) {
            // Full, or already playing: we say so, and hang up
            conn.on('open', () => {
              conn.send({ t: 'llena' });
              setTimeout(() => conn.close(), 500);
            });
            return;
          }
          this.addConnection(conn);
        });
        return word;
      } catch (err) {
        if (err.type !== 'unavailable-id') throw err; // a real problem (no internet...)
        this.peer.destroy(); // that word was taken: try another one
      }
    }
    throw new Error('No encontramos una palabra libre');
  }

  // JOIN a friend's game by typing their secret word
  async join(word) {
    await this.openPeer(undefined); // we don't need a special name: PeerJS gives us one
    return new Promise((resolve, reject) => {
      const conn = this.peer.connect(PREFIX + cleanWord(word).toLowerCase(), { reliable: true });
      this.hostId = conn.peer;
      // "peer-unavailable" = nobody has that word
      this.peer.on('error', reject);
      // If nobody answers in 15 seconds, we give up
      setTimeout(() => reject({ type: 'timeout' }), 15000);
      this.addConnection(conn, resolve);
    });
  }

  // Register on the PeerJS helper with this name
  openPeer(id) {
    return new Promise((resolve, reject) => {
      this.peer = new Peer(id);
      this.peer.once('open', (myId) => {
        this.myId = myId;
        resolve();
      });
      this.peer.once('error', reject);
    });
  }

  // A new connection (for the center: a friend; for a friend: the center)
  addConnection(conn, whenOpen) {
    const id = conn.peer;
    this.conns.set(id, conn);
    this.lastHeard.set(id, Date.now());
    // We listen right away, so we never miss the first message
    conn.on('data', (msg) => this.receive(id, msg));
    // If the page is closed, we say goodbye so the others know right away
    if (!this.sayBye) {
      this.sayBye = () => this.send({ t: 'adios' });
      window.addEventListener('pagehide', this.sayBye);
    }
    const ready = () => {
      conn.on('close', () => this.dropped(id));
      conn.on('error', () => this.dropped(id));
      if (whenOpen) whenOpen();
      this.onConnected(id);
    };
    if (conn.open) ready(); else conn.on('open', ready);
  }

  // A message arrived through the connection with "connId"
  receive(connId, msg) {
    if (this.isHost) {
      // We are the center: the message is from that friend (we trust the
      // connection, not what the message says), and we pass it on to the others
      msg.from = connId;
      this.conns.forEach((conn, id) => {
        if (id !== connId && conn.open) conn.send(msg);
      });
    } else if (!msg.from) {
      msg.from = connId;
    }
    this.lastHeard.set(msg.from, Date.now());

    if (msg.t === 'adios') this.dropped(msg.from);
    else this.onMessage(msg);
  }

  // Send a message to EVERYBODY (a friend sends it to the center, who passes it on)
  send(msg) {
    const withName = { ...msg, from: this.myId };
    this.conns.forEach((conn) => {
      if (conn.open) conn.send(withName);
    });
  }

  // One player is gone (they closed the game, or the internet went away)
  dropped(id) {
    if (this.closed || this.gone.has(id) || id === this.myId) return;
    this.gone.add(id);
    if (this.isHost) {
      // The center tells everybody else that this friend left
      this.conns.delete(id);
      this.conns.forEach((conn) => {
        if (conn.open) conn.send({ t: 'adios', from: id });
      });
      this.onPlayerLeft(id);
    } else if (id === this.hostId) {
      // The center left: without the center, nobody can talk anymore
      this.closed = true;
      this.onClose();
    } else {
      this.onPlayerLeft(id);
    }
  }

  // We are leaving: hang up
  close() {
    this.send({ t: 'adios' });
    this.closed = true;
    if (this.sayBye) window.removeEventListener('pagehide', this.sayBye);
    this.conns.forEach((conn) => conn.close());
    if (this.peer) this.peer.destroy();
  }
}

export default Net;
