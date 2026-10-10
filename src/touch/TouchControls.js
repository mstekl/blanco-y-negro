// TouchControls.js — Buttons on the screen for phones and tablets!
// Phones have no keyboard, so we draw our own buttons on top of the game.
// The trick: every button PRETENDS to be a key of the keyboard. When you touch
// "◀", the game thinks you pressed the left arrow. That way the whole game
// (the hero, the hacks, the "press ENTER" screens...) works without changing it.
//
//   - Game pad: ◀ ▶ to walk, ▲ to jump, 🎨 to shoot, CORRER to run
//   - OK (= ENTER), ESC, and ⌨ to open the small keyboard
//   - The small keyboard (letters, numbers, space, delete) to type the hack codes.
//     It opens by itself when a "Hacks" box opens.
//   - In the CARRERA and the BÚSQUEDA (two players, split screen) the game pad
//     changes: each half of the screen gets its OWN buttons.
//     Player 1 (left) buttons pretend to be A D W (and S or Z), player 2 (right)
//     buttons pretend to be the arrows. So two people can play on one iPad!
//
// They only appear on touch screens (or with ?tactil in the URL, to test on the computer).

// Every key we can pretend to press: what the game sees (key, code and keyCode)
const KEYS = {
  ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
  ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
  ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
  ArrowDown: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
  Shift: { key: 'Shift', code: 'ShiftLeft', keyCode: 16 },
  Enter: { key: 'Enter', code: 'Enter', keyCode: 13 },
  Escape: { key: 'Escape', code: 'Escape', keyCode: 27 },
  Backspace: { key: 'Backspace', code: 'Backspace', keyCode: 8 },
  Space: { key: ' ', code: 'Space', keyCode: 32 },
};

// A letter or number key (for example "a" or "5")
function charKey(char) {
  const upper = char.toUpperCase();
  const isDigit = /[0-9]/.test(char);
  return { key: char, code: isDigit ? `Digit${char}` : `Key${upper}`, keyCode: upper.charCodeAt(0) };
}

// Send a fake key event to the game (Phaser listens to the whole window)
function sendKey(type, info) {
  const event = new KeyboardEvent(type, { key: info.key, code: info.code, bubbles: true, cancelable: true });
  // Phaser reads the old "keyCode" number, which fake events don't have, so we add it
  Object.defineProperty(event, 'keyCode', { get: () => info.keyCode });
  Object.defineProperty(event, 'which', { get: () => info.keyCode });
  window.dispatchEvent(event);
}

// A quick press: down and up (used by the small keyboard and the OK / ESC buttons)
function tapKey(info) {
  sendKey('keydown', info);
  setTimeout(() => sendKey('keyup', info), 60);
}

// Is this a phone or tablet (a screen we touch with our fingers)?
function isTouchDevice() {
  if (new URLSearchParams(window.location.search).has('tactil')) return true;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// The look of the buttons (black and white, like the game)
const STYLE = `
  .tc-layer { position: fixed; left: 0; right: 0; bottom: 0; z-index: 10;
    pointer-events: none; font-family: Arial, sans-serif; user-select: none;
    -webkit-user-select: none; touch-action: none; }
  .tc-layer button, .tc-top button { pointer-events: auto; touch-action: none; border: 2px solid #fff;
    background: rgba(30, 30, 30, 0.7); color: #fff; font-family: inherit; font-weight: bold;
    border-radius: 12px; -webkit-tap-highlight-color: transparent; }
  .tc-layer button.tc-down, .tc-top button.tc-down { background: rgba(200, 200, 200, 0.9); color: #000; }
  .tc-pad { display: flex; justify-content: space-between; align-items: flex-end; gap: 8px;
    padding: 0 12px 12px; }
  .tc-group { display: flex; gap: 8px; align-items: flex-end; }
  .tc-big { width: 58px; height: 58px; font-size: 24px; border-radius: 50%; padding: 0; }
  .tc-small { height: 36px; padding: 0 10px; font-size: 13px; }
  .tc-top { position: fixed; top: 8px; right: 8px; display: flex; gap: 8px; z-index: 10; }
  .tc-keyboard { display: none; background: rgba(15, 15, 15, 0.92); padding: 8px 4px 10px;
    border-top: 2px solid #777; }
  .tc-keyboard.tc-open { display: block; }
  .tc-row { display: flex; justify-content: center; gap: 4px; margin-top: 5px; }
  .tc-row button { flex: 0 1 36px; height: 40px; font-size: 16px; border-radius: 6px; padding: 0; }
  .tc-row button.tc-wide { flex: 0 1 120px; }
  .tc-hidden { display: none !important; }
  .tc-two { display: none; }
  .tc-two.tc-open { display: flex; }
  .tc-half { flex: 1; display: flex; justify-content: space-between; align-items: flex-end;
    gap: 6px; padding: 0 10px 10px; }
  .tc-half + .tc-half { border-left: 2px dashed rgba(255, 255, 255, 0.4); }
  .tc-p1 button { border-color: #44aaff; }
  .tc-p2 button { border-color: #ff9933; }
  /* On a narrow phone, each half is small: smaller buttons so the 4 of each player fit */
  @media (max-width: 700px) {
    .tc-half { gap: 4px; padding: 0 4px 8px; }
    .tc-half .tc-group { gap: 4px; }
    .tc-half .tc-big { width: 42px; height: 42px; font-size: 18px; }
  }
`;

export function setupTouchControls() {
  if (!isTouchDevice()) return;

  const style = document.createElement('style');
  style.textContent = STYLE;
  document.head.appendChild(style);

  // Make a button. "hold" buttons stay pressed while the finger is on them
  // (like walking); the others are a quick tap (like OK)
  const makeButton = (label, className, info, hold) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.className = className;
    let pressed = false;
    const release = () => {
      if (!pressed) return;
      pressed = false;
      button.classList.remove('tc-down');
      if (hold) sendKey('keyup', info);
    };
    button.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      // Keep listening to this finger even if it slides off the button a little
      // (if the browser can't do it, the button still works)
      try { button.setPointerCapture(e.pointerId); } catch (err) { /* not important */ }
      pressed = true;
      button.classList.add('tc-down');
      if (hold) sendKey('keydown', info); else tapKey(info);
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('contextmenu', (e) => e.preventDefault());
    return button;
  };

  // --- Buttons at the top right: OK, ESC and the keyboard ---
  const top = document.createElement('div');
  top.className = 'tc-top';
  top.appendChild(makeButton('ESC', 'tc-small', KEYS.Escape, false));
  top.appendChild(makeButton('OK', 'tc-small', KEYS.Enter, false));
  const keyboardButton = document.createElement('button');
  keyboardButton.textContent = '⌨';
  keyboardButton.className = 'tc-small';
  top.appendChild(keyboardButton);

  // --- Bottom: the game pad ---
  const layer = document.createElement('div');
  layer.className = 'tc-layer';

  const pad = document.createElement('div');
  pad.className = 'tc-pad';
  const left = document.createElement('div');
  left.className = 'tc-group';
  left.appendChild(makeButton('◀', 'tc-big', KEYS.ArrowLeft, true));
  left.appendChild(makeButton('▶', 'tc-big', KEYS.ArrowRight, true));
  const right = document.createElement('div');
  right.className = 'tc-group';
  right.appendChild(makeButton('CORRER', 'tc-small', KEYS.Shift, true));
  right.appendChild(makeButton('🎨', 'tc-big', charKey('z'), true));
  right.appendChild(makeButton('▲', 'tc-big', KEYS.ArrowUp, true));
  pad.appendChild(left);
  pad.appendChild(right);

  // --- The small keyboard (for the hack codes) ---
  const keyboard = document.createElement('div');
  keyboard.className = 'tc-keyboard';
  ['1234567890', 'qwertyuiop', 'asdfghjklñ', 'zxcvbnm'].forEach((letters) => {
    const row = document.createElement('div');
    row.className = 'tc-row';
    [...letters].forEach((char) => {
      // (ñ has no letter code of its own, so we give it the code of the key where it lives)
      const info = char === 'ñ' ? { key: 'ñ', code: 'Semicolon', keyCode: 192 } : charKey(char);
      row.appendChild(makeButton(char.toUpperCase(), '', info, false));
    });
    keyboard.appendChild(row);
  });
  const lastRow = document.createElement('div');
  lastRow.className = 'tc-row';
  lastRow.appendChild(makeButton('⌫ borrar', 'tc-wide', KEYS.Backspace, false));
  lastRow.appendChild(makeButton('espacio', 'tc-wide', KEYS.Space, false));
  lastRow.appendChild(makeButton('OK', 'tc-wide', KEYS.Enter, false));
  keyboard.appendChild(lastRow);

  // --- The two-player game pad (race and search): one set of buttons per half ---
  // (the action button is "shoot" in the race and "grab" in the search)
  const two = document.createElement('div');
  two.className = 'tc-two';
  const actionButtons = {};
  const makeHalf = (className, keys) => {
    const half = document.createElement('div');
    half.className = `tc-half ${className}`;
    const walk = document.createElement('div');
    walk.className = 'tc-group';
    walk.appendChild(makeButton('◀', 'tc-big', keys.left, true));
    walk.appendChild(makeButton('▶', 'tc-big', keys.right, true));
    const jump = document.createElement('div');
    jump.className = 'tc-group';
    jump.appendChild(makeButton('▲', 'tc-big', keys.jump, true));
    half.appendChild(walk);
    half.appendChild(jump);
    two.appendChild(half);
    return jump; // the action button is added here, next to ▲, when the mode starts
  };
  const jump1 = makeHalf('tc-p1', { left: charKey('a'), right: charKey('d'), jump: charKey('w') });
  const jump2 = makeHalf('tc-p2', { left: KEYS.ArrowLeft, right: KEYS.ArrowRight, jump: KEYS.ArrowUp });

  // The action keys of each mode (see RaceScene.js): player 1 shoots with S in the
  // race and grabs with Z in the search; player 2 always uses ↓
  const ACTIONS = {
    carrera: { label: '🎨', p1: charKey('s'), p2: KEYS.ArrowDown },
    busqueda: { label: '✋', p1: charKey('z'), p2: KEYS.ArrowDown },
  };
  Object.entries(ACTIONS).forEach(([mode, action]) => {
    actionButtons[mode] = [
      makeButton(action.label, 'tc-big', action.p1, true),
      makeButton(action.label, 'tc-big', action.p2, true),
    ];
  });

  layer.appendChild(keyboard);
  layer.appendChild(pad);
  layer.appendChild(two);
  document.body.appendChild(layer);
  document.body.appendChild(top);

  // Show the keyboard OR the game pad (both together don't fit)
  const showKeyboard = (open) => {
    keyboard.classList.toggle('tc-open', open);
    pad.classList.toggle('tc-hidden', open);
  };
  keyboardButton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    showKeyboard(!keyboard.classList.contains('tc-open'));
  });

  // The "Hacks" boxes tell us when they open and close, so the keyboard comes by itself
  window.addEventListener('hacks-abiertos', () => showKeyboard(true));
  window.addEventListener('hacks-cerrados', () => showKeyboard(false));

  // The race and the search tell us when they start and end, so we switch pads
  window.addEventListener('dos-jugadores', (e) => {
    const [button1, button2] = actionButtons[e.detail.mode] || actionButtons.carrera;
    jump1.insertBefore(button1, jump1.firstChild);
    jump2.insertBefore(button2, jump2.firstChild);
    showKeyboard(false);
    pad.classList.add('tc-hidden');
    two.classList.add('tc-open');
  });
  window.addEventListener('un-jugador', () => {
    two.classList.remove('tc-open');
    pad.classList.remove('tc-hidden');
    // Take the action buttons out, so the next mode puts in its own ones
    Object.values(actionButtons).flat().forEach((button) => button.remove());
  });
}
