// Net.js — Playing ONLINE: two phones, iPads or computers talk to each other.
// We use PeerJS: a free helper on the internet that lets two browsers find
// each other. After that they talk DIRECTLY (no server in the middle).
//
// How the secret word works:
//   - The player who CREATES the game gets a secret word (for example GATO).
//     PeerJS gives that browser the name "blanco-y-negro-gato".
//   - The friend who JOINS types GATO, so we look for "blanco-y-negro-gato"
//     on the internet and connect to it. Nobody else knows the word!
//
// The messages are small objects, like { t: 'progreso', level: 1, frac: 0.5 }.
// "t" says what kind of message it is.

import Peer from 'peerjs';

// Every name starts with this, so we never mix with other games that use PeerJS
const PREFIX = 'blanco-y-negro-';

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
    this.conn = null;
    // The scenes put their own functions here, to hear the messages
    this.onMessage = () => {};
    this.onClose = () => {};
    this.closed = false;
  }

  // CREATE a game with a new secret word. Gives back the word when we are ready.
  // If somebody else is already using that word, we try another one.
  async host() {
    for (let tries = 0; tries < 5; tries++) {
      const word = randomWord();
      try {
        await this.openPeer(PREFIX + word.toLowerCase());
        // Now we wait for our friend to connect to us
        this.peer.on('connection', (conn) => {
          if (this.conn) { conn.close(); return; } // only ONE friend per game
          this.useConnection(conn);
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
      // "peer-unavailable" = nobody has that word
      this.peer.on('error', reject);
      // If nobody answers in 15 seconds, we give up
      setTimeout(() => reject({ type: 'timeout' }), 15000);
      conn.on('open', () => {
        this.useConnection(conn);
        resolve();
      });
    });
  }

  // Register on the PeerJS helper with this name
  openPeer(id) {
    return new Promise((resolve, reject) => {
      this.peer = new Peer(id);
      this.peer.once('open', resolve);
      this.peer.once('error', reject);
    });
  }

  // We have a friend! Listen to what they send us
  useConnection(conn) {
    this.conn = conn;
    // We listen right away, so we never miss the first message.
    // We also remember WHEN we last heard from our friend: if they go quiet
    // for too long, the internet probably went away (see RaceScene.js)
    this.lastHeard = Date.now();
    conn.on('data', (msg) => {
      this.lastHeard = Date.now();
      if (msg.t === 'adios') this.lost();
      else this.onMessage(msg);
    });
    // If the page is closed, we say goodbye so our friend knows right away
    this.sayBye = () => this.send({ t: 'adios' });
    window.addEventListener('pagehide', this.sayBye);
    const ready = () => {
      conn.on('close', () => this.lost());
      conn.on('error', () => this.lost());
      this.onConnected();
    };
    if (conn.open) ready(); else conn.on('open', ready);
  }

  // A scene can put a function here to know when the friend arrived
  onConnected() {}

  send(msg) {
    if (this.conn && this.conn.open) this.conn.send(msg);
  }

  // The friend closed the game, or the internet went away
  lost() {
    if (this.closed) return;
    this.closed = true;
    this.onClose();
  }

  // We are leaving: hang up
  close() {
    this.send({ t: 'adios' });
    this.closed = true;
    if (this.sayBye) window.removeEventListener('pagehide', this.sayBye);
    if (this.conn) this.conn.close();
    if (this.peer) this.peer.destroy();
  }
}

export default Net;
