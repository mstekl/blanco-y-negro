// TopBar.js — The bar at the top of the sala, like in Fortnite!
//   INICIO · PASE BLANCO Y NEGRO · TIENDA · CASILLERO          🪙 coins
// Each tab is a different screen (scene). The bar is drawn the same way in
// all four, so it feels like ONE place with tabs.

import { loadCoins, makeCoinTexture } from '../data/coins.js';

export const TABS = [
  { scene: 'TitleScene', label: 'INICIO' },
  { scene: 'PassScene', label: 'PASE BLANCO Y NEGRO' },
  { scene: 'ShopScene', label: 'TIENDA' },
  { scene: 'LockerScene', label: 'CASILLERO' },
];

export const BAR_HEIGHT = 46;

// Draw the bar. "active" = the scene we are in (its tab is yellow).
// "goTo" = what to do when a tab is touched (each scene has its own goTo, with its fade).
// Gives back a function to show the coins again when they change.
export function drawTopBar(scene, active, goTo) {
  scene.add.rectangle(400, BAR_HEIGHT / 2, 800, BAR_HEIGHT, 0x000000, 0.85).setDepth(150);
  scene.add.rectangle(400, BAR_HEIGHT, 800, 2, 0x666666).setDepth(150);

  let x = 16;
  TABS.forEach((tab) => {
    const isActive = tab.scene === active;
    const label = scene.add.text(x, BAR_HEIGHT / 2, tab.label, {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold',
      color: isActive ? '#ffdd33' : '#bbbbbb',
    }).setOrigin(0, 0.5).setDepth(151);
    // The active tab is underlined (like in Fortnite)
    if (isActive) scene.add.rectangle(x + label.width / 2, BAR_HEIGHT - 4, label.width, 4, 0xffdd33).setDepth(151);
    // A bigger invisible box, so it is easy to touch with a finger
    const hit = scene.add.rectangle(x + label.width / 2, BAR_HEIGHT / 2, label.width + 20, BAR_HEIGHT, 0xffffff, 0.001)
      .setDepth(152).setInteractive({ useHandCursor: true });
    hit.on('pointerover', () => { if (!isActive) label.setColor('#ffffff'); });
    hit.on('pointerout', () => { if (!isActive) label.setColor('#bbbbbb'); });
    hit.on('pointerdown', () => { if (!isActive) goTo(tab.scene); });
    x += label.width + 34;
  });

  // Our coins, on the right
  makeCoinTexture(scene);
  scene.add.image(706, BAR_HEIGHT / 2, 'coin').setDepth(151);
  const coins = scene.add.text(722, BAR_HEIGHT / 2, '', {
    fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffd700',
  }).setOrigin(0, 0.5).setDepth(151);
  const refresh = () => coins.setText(String(loadCoins()));
  refresh();
  return refresh;
}
