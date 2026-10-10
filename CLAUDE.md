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
To play on an iPad or phone on the same Wi-Fi: `npm run dev -- --host` and open the "Network" address it shows.

The game is also on the internet in two places: https://blanco-y-negro.vercel.app and https://mstekl.github.io/blanco-y-negro/ (both work in Safari, iPads and phones). To put new changes in BOTH: commit them and run `npm run publicar`. It builds the game, merges the current branch into `main` and pushes it (Vercel rebuilds itself from `main`), and uploads the `dist` folder to the `gh-pages` branch (which GitHub Pages shows). It stops if there are uncommitted changes, so the two pages never end up different.
To share it: `npm run compartir` makes a `compartir` folder with a QR code, an invitation to print (`invitacion.html`) and a zip ready to upload to itch.io. The link shows a preview picture (`public/preview.png`) and can be added to the home screen of an iPad or phone like an app (`public/manifest.webmanifest` and the icons in `public/`).

## Project Structure
```
blanco-y-negro/
├── public/                    # Static files
├── src/
│   ├── main.js                # Game config and entry point
│   ├── data/
│   │   ├── levels.js          # Level configurations (6 levels)
│   │   ├── countryLevels.js   # The 3 levels played inside a country (built from normal levels)
│   │   ├── skins.js           # The skin list, the codes that win them, and saving them
│   │   ├── profile.js         # Our player (name + avatar), saved in the browser
│   │   ├── coins.js           # Coins, the pencil price, and how rare each skin is
│   │   ├── countryThemes.js   # Which landmark each country has in the background
│   │   └── worldMap.json      # Country shapes for the map (made by tools/build-world-map.mjs)
│   ├── scenes/
│   │   ├── BootScene.js       # Initial boot
│   │   ├── PreloadScene.js    # Asset loading with progress bar
│   │   ├── TitleScene.js      # The "sala": JUGAR button, Hacks de sala and the SKINS button
│   │   ├── ProfileScene.js    # "TU JUGADOR": write a name (4 to 13 letters) and pick an avatar
│   │   ├── SkinsScene.js      # Skins screen (like Paper.io 2): big skin in the middle, arrows, ELEGIR
│   │   ├── PencilsScene.js    # LÁPICES screen: buy a pencil with coins, it paints a surprise skin
│   │   ├── LevelIntroScene.js # Level splash ("Nivel X")
│   │   ├── LevelScene.js      # Main gameplay
│   │   ├── GameOverScene.js   # Game over screen
│   │   ├── CelebrationScene.js # City gets its color back (after level 6)
│   │   ├── WorldMapScene.js   # World map: pick a country to color (after the celebration)
│   │   ├── WinScene.js        # Victory celebration
│   │   ├── ModeChoiceScene.js # Before CARRERA or BÚSQUEDA: ONLINE / OFFLINE / MÁQUINA (and FÁCIL / NORMAL / DIFÍCIL)
│   │   ├── OnlineScene.js     # ONLINE: CREAR PARTIDA (get a secret word) or UNIRSE (type the friend's word)
│   │   ├── RaceScene.js       # The race: 2 players split screen (RaceLeft + RaceRight are copies of LevelScene), or alone on the whole screen (online / máquina) with progress bars. Also runs BÚSQUEDA
│   │   └── SearchLevelScene.js # BÚSQUEDA: one half of the screen, find the 5 colored pencils (SearchLeft + SearchRight)
│   ├── sprites/
│   │   ├── Hero.js            # Player character
│   │   ├── Enemy.js           # Base enemy class
│   │   ├── EnemyMR1.js        # Walker enemy
│   │   ├── EnemyMR2.js        # Shooter enemy
│   │   ├── EnemyMR3.js        # MR.3 on his eraser tank (chases the hero)
│   │   ├── CrazyDog.js        # Secret crazy dog skin (code "lebron" in the Hacks de sala)
│   │   ├── MoreSkins.js       # More skins: final boss, storm cloud, color pencil, rainbow ninja, astronaut, robot, painter cat, rainbow dinosaur, superhero
│   │   ├── SkinParts.js       # The molds for the pencil skins: person() and animal()
│   │   ├── SkinPack.js        # 30 skins that come out of the pencils
│   │   ├── SkinPack2.js       # 50 more pencil skins (jobs, animals, food, legends)
│   │   ├── PencilSkins.js     # Joins both packs in one list
│   │   ├── StormCloud.js      # Level 5 cloud that chases you and throws pencils
│   │   └── Projectile.js      # Bullets (hero & enemy)
│   ├── managers/
│   │   ├── LevelManager.js    # Builds levels from data
│   │   ├── LandmarkArt.js     # Draws the landmarks (Chichén Itzá, Statue of Liberty, CN Tower...)
│   │   ├── PowerupManager.js  # Power-up effects
│   │   └── HUDManager.js      # Score, lives, UI
│   ├── online/
│   │   ├── Net.js             # Online connection with PeerJS: the secret word becomes the name to find the friend
│   │   └── Bot.js             # The MÁQUINA: a ghost that runs the race or looks for its own pencils
│   ├── touch/
│   │   └── TouchControls.js   # On-screen buttons and small keyboard for phones and tablets
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
- **Race (CARRERA)** — player 1 (left half): A D move, W jump, S shoot · player 2 (right half): ← → move, ↑ jump, ↓ shoot. No running in the race, so both go at the same speed
- **Phones and tablets** — buttons on the screen: ◀ ▶ walk, ▲ jump, 🎨 shoot, CORRER run, OK (= Enter), ESC, and ⌨ for a small keyboard (it opens by itself in the Hacks boxes). The buttons pretend to be keyboard keys, so the rest of the game did not need changes. Add ?tactil to the URL to see them on the computer

## Game Features
- 6 levels with increasing difficulty (castle entrance at level 4, pipe at level 5, final boss in level 6)
- 3 enemy types: MR.1 (walker), MR.2 (shooter) and MR.3 (white MR.1 riding an eraser tank that chases you, levels 3, 4 and 6) + boss
- Power-ups: Color Pencil (gun), Shield, Extra Life
- Double jump mechanic
- Grayscale tint system (world gets darker each level)
- Rainbow particle effects on enemy defeat
- Parallax scrolling backgrounds with building silhouettes
- Data-driven level system (add levels by editing levels.js)
- World map after level 6: pick a country and play 3 levels INSIDE it, with its landmarks in the background (México: Chichén Itzá, EEUU: Estatua de la Libertad, Canadá: Torre CN; other countries get a generic landscape for now). Beating them colors the country; continents unlock in order (Norteamérica → Centroamérica → Sudamérica → África → Europa → Asia → Oceanía). Colored countries are saved in the browser (localStorage). Test shortcut: add ?mapa to the URL (?mapa=reset erases the saved countries)
- "Hacks de mapa" on the world map (press SPACE, next to the points): type a code and ENTER. `Emi y papá 2026` = invincible mode (until the page is reloaded), `mortal` = turns it off again; `<continente> pasar` (for example `sudamerica pasar`) = that continent gets all its colors (`pass` works too)
- The "sala" (title screen): black-and-white city, big JUGAR button bottom right (or ENTER), and in the middle left the "Hacks de sala" (SPACE) and a small SKINS button (or S). Typing a code in the hacks WINS a skin: `B Y N` = MR.1 and MR.2, `lebron` = crazy dog, `goma` = MR.3 on his eraser tank (can shoot from the start), `N A` = rainbow ninja, `N5 C` = storm cloud (can shoot), `LP` = color pencil, `J F` = the final boss (can shoot), `A B` = color astronaut (can shoot), `R S` = color robot, `G P` = painter cat, `D R` = rainbow dinosaur (can shoot), `S C` = superhero with a cape, `T` = ALL the skins at once (typing `T` again when you already have them all takes them away: only the hero is left), `10000` = 10000 coins (not a skin). A new player only has the hero. The SKINS button opens the skins screen (like Paper.io 2): the skin is big in the middle, the arrows move to the next one, ELEGIR puts it on, and skins not won yet have a lock. Won skins are saved in the browser (localStorage). Skins can ONLY be changed in the sala, never in the middle of a level
- `npm run dev:inmortal` starts a second server (port 5174) where nothing hurts the hero
- Secret key inside the levels: `E` then `P` = invincible mode on/off (the old level keys for skins, extra jumps and jumping to a level were removed)
- Coins and pencils (lápices): gold coins float above the floating platforms of every level (they are placed by themselves from the platforms) and are saved in the browser right away. In the sala, the LÁPICES button (or L) opens a screen where a pencil costs 25 coins: it paints a random skin on a sheet of paper, line by line. Skins are COMÚN, RARO, ÉPICO or LEGENDARIO; rarer ones come out less (`SKIN_RARITY` in `src/data/coins.js` for the first 13 skins, `rarity` in `src/sprites/SkinPack.js` and `SkinPack2.js` for the other 80). There are 94 skins in all: the 14 old ones plus 80 from the pencils (people with jobs and sports, animals, monsters, food with faces, and legends like the phoenix, the golden knight, the Rey and Reina del Color, the ice dragon and the golden mecha). The pencil skins have no codes of their own (only `T` gives them all). The skins screen shows 13 small pictures around the current skin, since they don't all fit. A repeated skin is just bad luck. Secret: pressing ENTER 5 times fast (in 2 seconds) on the LÁPICES screen opens 15 pencils at once, if there are enough coins (the first ENTER already opened one, so it pays the other 14), and shows the 15 skins in little cards. This is the normal way to win skins; the codes are the secret way. Test shortcut: `?monedas=100` in the URL gives 100 coins
- Record: the highest score is saved in the browser (`src/data/record.js`). It shows in the sala, and the Game Over and victory screens say "¡NUEVO RÉCORD!" when it is beaten
- CARRERA (race) from the sala (button under LÁPICES, or C): the screen is split in two halves and two players play at the same time on the same keyboard, each in their own copy of the levels. After a 3-2-1 countdown, the first one to reach level 4 (finish level 3) wins. In the race there are no hearts, points or game over: losing a life just starts that level again. ESC goes back to the sala. On phones and tablets each half gets its own buttons (see `TouchControls.js`), so two people can play on one iPad
- BÚSQUEDA (search) from the sala (button just above JUGAR, or B): split screen like the race, both players in the map of level 1 with no villains and no coins. 5 GOOD pencils are hidden all over the map (rojo, azul, verde, violeta, naranja) and 6 BAD ones (2 amarillo, 2 rosa, 2 marrón). The places are shuffled, so they are different in each half and every game. Stand next to a pencil and grab it: player 1 with Z, player 2 with ↓. A bad pencil takes 1 of your 3 lives. The first to find the 5 good ones wins; losing the 3 lives means the other player wins. Falling into a pit only sends you back to the start
- ONLINE / OFFLINE / MÁQUINA: CARRERA and BÚSQUEDA first ask how to play (keys 1 2 3). OFFLINE = the split screen above. MÁQUINA = alone on the whole screen against the computer (FÁCIL, NORMAL or DIFÍCIL), which is a see-through ghost with a 🤖 in our level (`src/online/Bot.js`; speeds and mistakes are in `LEVELS` there). ONLINE = each one on their own device: CREAR PARTIDA gives a secret word (like LEON), the friend chooses UNIRSE and types it. It uses PeerJS (free, no account: the two browsers talk directly, `src/online/Net.js`). The one who created the game decides if it is CARRERA or BÚSQUEDA. Alone on the screen, two bars at the top show how far each one is. If the friend leaves (or is silent 8 seconds) the game says SE DESCONECTÓ. Normal keys alone on the screen: arrows/WASD, Z grabs in the search. Online there are 4 buttons on the right (or keys 1 2 3 4) to send 😂 😡 👍 or "¡Te gano!": it shows big on the friend's screen. At the end there are two buttons: 🔁 REVANCHA (R) plays again (online BOTH must press it, and the same connection is kept, no new word) and 🏠 SALA (ENTER). Winning gives coins: 5 / 10 / 20 against the machine (FÁCIL / NORMAL / DIFÍCIL), 15 online (`COIN_PRIZES` in `RaceScene.js`). While `npm run dev` runs, `window.juego` in the browser console is the game, to look inside it when testing
- Our player (TU JUGADOR): the first time the game opens, before the sala, we write a name (more than 3 letters and less than 14) and pick an avatar (ANY of the 94 skins, even ones not won yet; it is only the picture other players see, not the skin we wear). It is saved in the browser (`src/data/profile.js`). It shows in the top-left corner of the sala; touching it (or N) changes it. The online race and search show it to the other player
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
