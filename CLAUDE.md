# Blanco y Negro

## Project Description
Father-and-son 2D platformer game built with Phaser 3 and Vite. A colorful hero fights black-and-white villains to restore color to the world. Vibe coded entirely with Claude Code.

## Tech Stack
- **Game engine:** Phaser 3 (Arcade Physics)
- **Bundler:** Vite
- **Language:** JavaScript (ES modules)
- **Physics:** Arcade with gravity (y: 500)

## How to Run
```bash
npm run dev
```
Then open the URL shown in the terminal (usually http://localhost:5173).

## Project Structure
```
blanco-y-negro/
├── public/                    # Static files
├── src/
│   ├── main.js                # Game config and entry point
│   ├── data/
│   │   ├── levels.js          # Level configurations (6 levels)
│   │   ├── countryLevels.js   # The 3 levels played inside a country (built from normal levels)
│   │   ├── countryThemes.js   # Which landmark each country has in the background
│   │   └── worldMap.json      # Country shapes for the map (made by tools/build-world-map.mjs)
│   ├── scenes/
│   │   ├── BootScene.js       # Initial boot
│   │   ├── PreloadScene.js    # Asset loading with progress bar
│   │   ├── TitleScene.js      # Title screen
│   │   ├── LevelIntroScene.js # Level splash ("Nivel X")
│   │   ├── LevelScene.js      # Main gameplay
│   │   ├── GameOverScene.js   # Game over screen
│   │   ├── CelebrationScene.js # City gets its color back (after level 6)
│   │   ├── WorldMapScene.js   # World map: pick a country to color (after the celebration)
│   │   └── WinScene.js        # Victory celebration
│   ├── sprites/
│   │   ├── Hero.js            # Player character
│   │   ├── Enemy.js           # Base enemy class
│   │   ├── EnemyMR1.js        # Walker enemy
│   │   ├── EnemyMR2.js        # Shooter enemy
│   │   ├── StormCloud.js      # Level 5 cloud that chases you and throws pencils
│   │   └── Projectile.js      # Bullets (hero & enemy)
│   ├── managers/
│   │   ├── LevelManager.js    # Builds levels from data
│   │   ├── LandmarkArt.js     # Draws the landmarks (Chichén Itzá, Statue of Liberty, CN Tower...)
│   │   ├── PowerupManager.js  # Power-up effects
│   │   └── HUDManager.js      # Score, lives, UI
│   └── utils/
│       └── constants.js       # Game constants
├── arte/                      # Reference art from Emi
├── tools/
│   └── build-world-map.mjs    # Builds src/data/worldMap.json (run: node tools/build-world-map.mjs)
├── index.html
├── package.json
└── vite.config.js
```

## Current Status
Complete game with 6 levels (level 4 ends at a castle, level 5 is inside it with a chasing storm cloud and ends at a pipe, level 6 is outside the castle with the final boss), title screen, and victory screen.

## Controls
- **Arrow keys / WASD** — Move
- **Up / W / Space** — Jump (press twice for double jump!)
- **Shift** — Run
- **Z / X** — Fire Color Gun (after picking up Color Pencil)
- **Enter** — Start game / Retry

## Game Features
- 6 levels with increasing difficulty (castle entrance at level 4, pipe at level 5, final boss in level 6)
- 2 enemy types: MR.1 (walker) and MR.2 (shooter) + boss
- Power-ups: Color Pencil (gun), Shield, Extra Life
- Double jump mechanic
- Grayscale tint system (world gets darker each level)
- Rainbow particle effects on enemy defeat
- Parallax scrolling backgrounds with building silhouettes
- Data-driven level system (add levels by editing levels.js)
- World map after level 6: pick a country and play 3 levels INSIDE it, with its landmarks in the background (México: Chichén Itzá, EEUU: Estatua de la Libertad, Canadá: Torre CN; other countries get a generic landscape for now). Beating them colors the country; continents unlock in order (Norteamérica → Centroamérica → Sudamérica → África → Europa → Asia → Oceanía). Colored countries are saved in the browser (localStorage). Test shortcut: add ?mapa to the URL (?mapa=reset erases the saved countries)
- "Hacks de mapa" on the world map (press SPACE, next to the points): type a code and ENTER. `Emi y papá 2026` = invincible mode (until the page is reloaded); `<continente> pasar` (for example `sudamerica pasar`) = that continent gets all its colors (`pass` works too); `B Y N` = the hero becomes MR.1, type it again for MR.2, and again to go back to the hero
- Full game flow: Title → Levels → Celebration → World Map → Win/Game Over

## Session Log
| Session | Date | What We Built |
|---------|------|---------------|
| 0 | 2026-03-21 | Project scaffolding — Vite + Phaser 3 setup |
| 1 | 2026-04-05 | Hero movement, platforms, scrolling level |
| 2 | 2026-04-05 | MR.1 enemies, stomping, lives, HUD |
| 3 | 2026-04-05 | Data-driven levels, 2 levels, transitions |
| 4 | 2026-04-05 | Power-ups, Color Gun, Shield |
| 5 | 2026-04-05 | MR.2 shooters, levels 3-4, boss, double jump |
| 6-7 | 2026-04-05 | Tint system, Title/Win screens, full game flow |

## Code Style Notes
- Keep code simple and well-commented. A 9-year-old is learning from this.
- Use plain JavaScript (no TypeScript).
- Comments should explain the "why", not just the "what".
- Spanish text in the game UI, English in code comments.
