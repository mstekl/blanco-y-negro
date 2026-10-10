// toast.js — A message that slides in at the top of the page for a few seconds
// ("¡Misión completada!", "¡Subiste al nivel 5 del PASE!"...).
// It is made with the page (HTML), not with Phaser, so it shows over ANY scene.
// If several come at once, they wait in line and show one after the other.

const queue = [];
let showing = false;

export function showToast(message, color = '#66ee88') {
  queue.push({ message, color });
  if (!showing) showNext();
}

function showNext() {
  const next = queue.shift();
  if (!next) {
    showing = false;
    return;
  }
  showing = true;
  const toast = document.createElement('div');
  toast.textContent = next.message;
  toast.style.cssText = `position: fixed; top: 12px; left: 50%; transform: translate(-50%, -90px);
    z-index: 20; background: #1b1b1b; color: #fff; border: 3px solid ${next.color}; border-radius: 12px;
    padding: 10px 18px; font: bold 16px Arial, sans-serif; max-width: 90vw; text-align: center;
    transition: transform 0.4s; pointer-events: none;`;
  document.body.appendChild(toast);
  // Slide down, wait, slide up, remove it, and show the next one
  requestAnimationFrame(() => { toast.style.transform = 'translate(-50%, 0)'; });
  setTimeout(() => { toast.style.transform = 'translate(-50%, -90px)'; }, 3000);
  setTimeout(() => {
    toast.remove();
    showNext();
  }, 3500);
}
