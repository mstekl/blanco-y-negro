// compartir.mjs — Makes the things we need to share the game with the world.
// Run it with: npm run compartir   (it builds the game first)
// It creates, inside the "compartir" folder:
//   qr-juego.png               a QR code: point a phone camera at it and the game opens
//   invitacion.html            a page to print and take to school (with the QR)
//   blanco-y-negro-itch.zip    the whole game in one file, ready to upload to itch.io
import QRCode from 'qrcode';
import { execSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';

const GAME_URL = 'https://mstekl.github.io/blanco-y-negro/';

// 1. The QR code (big, so it can be printed)
await QRCode.toFile('compartir/qr-juego.png', GAME_URL, { width: 600, margin: 2 });

// 2. The invitation to print
writeFileSync('compartir/invitacion.html', `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Invitación — Blanco y Negro</title>
<style>
  body { font-family: Arial, sans-serif; text-align: center; margin: 40px; }
  h1 { font-size: 56px; margin: 0; }
  .rainbow { height: 18px; background: linear-gradient(90deg, red, orange, yellow, green, dodgerblue, purple); margin: 20px 0; }
  p { font-size: 24px; }
  img.qr { width: 320px; }
  img.preview { width: 100%; max-width: 700px; border: 4px solid #000; }
</style></head>
<body>
  <h1>BLANCO Y NEGRO</h1>
  <div class="rainbow"></div>
  <p><b>¡Devuelve el color al mundo!</b><br>Un juego hecho por Emi y Papá</p>
  <img class="preview" src="../public/preview.png" alt="">
  <p>Apunta la cámara del celular o del iPad aquí para jugar:</p>
  <img class="qr" src="qr-juego.png" alt="Código QR del juego">
  <p>${GAME_URL}</p>
  <p>🤫 Código secreto para la sala: <b>GP</b></p>
</body></html>
`);

// 3. The zip for itch.io (it wants all the game files together, with index.html inside)
rmSync('compartir/blanco-y-negro-itch.zip', { force: true });
execSync('tar -a -c -f ../compartir/blanco-y-negro-itch.zip *', { cwd: 'dist', stdio: 'inherit', shell: true });

console.log('¡Listo! Todo está en la carpeta "compartir"');
