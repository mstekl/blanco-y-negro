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
│   │   ├── pass.js            # PASE BLANCO Y NEGRO: stars (earnStars), 100 levels, medals, 10 pages of prizes, seasons, PREMIUM
│   │   ├── chests.js          # What comes out of a COFRE: coins, stars or a surprise skin
│   │   ├── customLevels.js    # The 5 levels made in the editor
│   │   ├── coins.js           # Coins, the pencil price, and how rare each skin is
│   │   ├── countryThemes.js   # Which landmark each country has in the background
│   │   ├── soccerTeams.js     # FÚTBOL teams: the countries (with flag) and 30 invented clubs (6 per division), and their badges
│   │   ├── temporada.js       # FÚTBOL TEMPORADA: divisions 5 → 1, tables, pretend matches, going up and down
│   │   ├── mundial.js         # FÚTBOL MUNDIAL: group of 4, cuartos, semifinal and the final
│   │   ├── halloween.js       # The HALLOWEEN EVENT 🎃: which days, the pumpkins we found and their prizes
│   │   └── worldMap.json      # Country shapes for the map (made by tools/build-world-map.mjs)
│   ├── scenes/
│   │   ├── BootScene.js       # Initial boot
│   │   ├── PreloadScene.js    # Asset loading with progress bar
│   │   ├── TitleScene.js      # The "sala": JUGAR, Hacks de sala, SKINS, LÁPICES, JUNTOS, CARRERA, FÚTBOL and EDITOR
│   │   ├── ProfileScene.js    # "TU JUGADOR": write a name (4 to 13 letters) and pick an avatar
│   │   ├── SkinsScene.js      # Skins screen (like Paper.io 2): big skin in the middle, arrows, ELEGIR
│   │   ├── PencilsScene.js    # LÁPICES screen: buy a pencil with coins, it paints a surprise skin
│   │   ├── LevelIntroScene.js # Level splash ("Nivel X")
│   │   ├── LevelScene.js      # Main gameplay
│   │   ├── GameOverScene.js   # Game over screen
│   │   ├── CelebrationScene.js # City gets its color back (after level 6)
│   │   ├── WorldMapScene.js   # World map: pick a country to color (after the celebration)
│   │   ├── WinScene.js        # Victory celebration
│   │   ├── ModeChoiceScene.js # Before the CARRERA: OFFLINE / MÁQUINA (and FÁCIL / NORMAL / DIFÍCIL)
│   │   ├── PassScene.js       # PASE BLANCO Y NEGRO tab: like Fortnite: pages of 8 prizes, the chosen one big and turning
│   │   ├── EditorScene.js     # EDITOR DE NIVELES: 5 slots, draw a level with tools
│   │   ├── CustomLevelScene.js # Plays a level made in the editor
│   │   ├── RaceScene.js       # The race: 2 players split screen (RaceLeft + RaceRight are copies of LevelScene), or alone on the whole screen against the MÁQUINA, with progress bars
│   │   ├── FutbolMenuScene.js # ⚽ FÚTBOL menu: MÁQUINA, OFFLINE, TEMPORADA, MUNDIAL
│   │   ├── SoccerScene.js     # One FÚTBOL match (like Head Soccer): 1:30, powers, penalties
│   │   ├── TeamPickScene.js   # ELIGE TU EQUIPO: clubs or countries
│   │   ├── TemporadaScene.js  # The table of the TEMPORADA and the next match
│   │   ├── MundialScene.js    # The road of the MUNDIAL (groups → final)
│   │   └── HalloweenScene.js  # 🎃 HALLOWEEN screen: the pumpkins we found and the 5 prizes (also the moon and bats of the sala)
│   ├── sprites/
│   │   ├── Hero.js            # Player character
│   │   ├── Enemy.js           # Base enemy class
│   │   ├── EnemyMR1.js        # Walker enemy
│   │   ├── EnemyMR2.js        # Shooter enemy
│   │   ├── EnemyMR3.js        # MR.3 on his eraser tank (chases the hero)
│   │   ├── EnemyDobleX.js     # DOBLE-X: fat zebra MR.1 that splits in two when defeated (1 → 2 → 4 → 8)
│   │   ├── CrazyDog.js        # Secret crazy dog skin (code "lebron" in the Hacks de sala)
│   │   ├── MoreSkins.js       # More skins: final boss, storm cloud, color pencil, rainbow ninja, astronaut, robot, painter cat, rainbow dinosaur, superhero
│   │   ├── SkinParts.js       # The molds for the pencil skins: person() and animal()
│   │   ├── SkinPack.js        # 30 skins that come out of the pencils
│   │   ├── SkinPack2.js       # 50 more pencil skins (jobs, animals, food, legends)
│   │   ├── PencilSkins.js     # Joins both packs in one list
│   │   ├── PassSkins.js       # The 12 skins of the PASE BLANCO Y NEGRO (never from pencils)
│   │   ├── HalloweenSkins.js  # The 5 skins of Halloween: Esqueleto, Hombre Lobo, Frankenstein, Catrina and the Rey Calabaza
│   │   ├── StormCloud.js      # Level 5 cloud that chases you and throws pencils
│   │   └── Projectile.js      # Bullets (hero & enemy)
│   ├── managers/
│   │   ├── LevelManager.js    # Builds levels from data
│   │   ├── LandmarkArt.js     # Draws the landmarks (Chichén Itzá, Statue of Liberty, CN Tower...)
│   │   ├── landmarks/         # The landmarks of every other country, one file per region (americas, europa, asia, africaOceania), the 193 flags (flags.js) and helpers.js
│   │   ├── BlockManager.js    # The secret blocks ❓: hit them from below and coins jump out (some are invisible)
│   │   ├── PowerupManager.js  # Power-up effects (also colored pencils, vehicles and chests)
│   │   ├── WeatherManager.js  # Random weather: día, noche (flashlight), lluvia, nieve (slippery)
│   │   ├── HUDManager.js      # Score, lives, UI
│   │   └── HalloweenManager.js # Halloween in the levels: the 3 pumpkins and the costumes of the villains
│   ├── maquina/
│   │   └── Bot.js             # The MÁQUINA: a ghost that runs the race (RaceBot), and the robot of the FÚTBOL that "presses keys" (SoccerBot)
│   ├── touch/
│   │   └── TouchControls.js   # On-screen buttons and small keyboard for phones and tablets
│   └── utils/
│       └── constants.js       # Game constants
├── arte/                      # Reference art from Emi
├── tools/
│   ├── build-world-map.mjs    # Builds src/data/worldMap.json (run: node tools/build-world-map.mjs)
│   ├── check-landmarks.mjs    # Checks the landmark and flag drawings without opening the game (node tools/check-landmarks.mjs)
│   └── galeria.html           # All the landmarks at once: http://localhost:5173/tools/galeria.html (?gris, ?solo=moai,fuji)
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
- **JUNTOS** — player 1: A D move, W jump, S shoot · player 2: ← → move, ↑ jump, ↓ shoot
- **FÚTBOL** — alone: ← → move, ↑ jump, Z kick · OFFLINE: player 1 A D W + S kicks, player 2 ← → ↑ + ↓ kicks. Kicking on the floor = a high shot, in the air = a low one

## Game Features
- 6 levels with increasing difficulty (castle entrance at level 4, pipe at level 5, final boss in level 6)
- 4 enemy types: MR.1 (walker), MR.2 (shooter), MR.3 (white MR.1 riding an eraser tank that chases you, levels 3, 4 and 6) and DOBLE-X (fat with zebra stripes: defeating him splits him in 2 smaller and faster ones, 3 times: 1 → 2 → 4 → 8, so 15 in all; levels 2, 3 and 6, and in the editor as the second variant of the MR.3 tool) + boss
- Power-ups: Color Pencil (gun), Shield, Extra Life
- BLOQUES SECRETOS ❓ (`src/managers/BlockManager.js`, `blocks` in levels.js): golden blocks floating in every level. Hit one from BELOW with your head and a coin jumps out (3 or 5 coins inside; empty = brown brick). Some are INVISIBLE: you can walk through them, but jumping under one makes it appear ("¡Bloque secreto!"). In the editor's levels they give points, not coins
- Double jump mechanic
- Grayscale tint system (world gets darker each level)
- Rainbow particle effects on enemy defeat
- Parallax scrolling backgrounds with building silhouettes
- Data-driven level system (add levels by editing levels.js)
- World map after level 6: pick a country and play 3 levels INSIDE it, with its landmarks in the background (México: Chichén Itzá, EEUU: Estatua de la Libertad, Canadá: Torre CN, Francia: Torre Eiffel, Egipto: pirámides, China: Gran Muralla, Brasil: Cristo Redentor, Perú: Machu Picchu, Japón: Monte Fuji, Reino Unido: Big Ben, Australia: Ópera de Sídney, Italia: Coliseo, India: Taj Mahal, Argentina: Obelisco, Grecia: Partenón; ALL the other countries have their own landmark, like la Sagrada Familia, los moáis, el Kilimanjaro or el Burj Khalifa, or the scenery of their region, like a Caribbean beach, the savanna, the Sahara or a Nordic forest, in `src/managers/landmarks/`). Every country also has its flag waving on a pole at the start of its levels. Beating them colors the country; continents unlock in order (Norteamérica → Centroamérica → Sudamérica → África → Europa → Asia → Oceanía). Colored countries are saved in the browser (localStorage). Test shortcut: add ?mapa to the URL (?mapa=reset erases the saved countries)
- "Hacks de mapa" on the world map (press SPACE, next to the points): type a code and ENTER. `Emi y papá 2026` = invincible mode (until the page is reloaded), `mortal` = turns it off again; `<continente> pasar` (for example `sudamerica pasar`) = that continent gets all its colors (`pass` works too)
- The "sala" (title screen): black-and-white city, big JUGAR button bottom right (or ENTER), and in the middle left the "Hacks de sala" (SPACE) and a small SKINS button (or S). Typing a code in the hacks WINS a skin: `B Y N` = MR.1 and MR.2, `lebron` = crazy dog, `goma` = MR.3 on his eraser tank (can shoot from the start), `N A` = rainbow ninja, `N5 C` = storm cloud (can shoot), `LP` = color pencil, `J F` = the final boss (can shoot), `A B` = color astronaut (can shoot), `R S` = color robot, `G P` = painter cat, `D R` = rainbow dinosaur (can shoot), `S C` = superhero with a cape, `D X` = Doble-X, `T` = ALL the skins at once (typing `T` again when you already have them all takes them away: only the hero is left), `10000` = 10000 coins, `100000` = 100000 coins and `1000000` = 1000000 coins (not skins), and `100 niv p` = 100 levels up in the PASE BLANCO Y NEGRO (= 100 🏅 medals to choose prizes, with one message instead of 100). A new player only has the hero. The SKINS button opens the skins screen (like Paper.io 2): the skin is big in the middle, the arrows move to the next one, ELEGIR puts it on, and skins not won yet have a lock. Won skins are saved in the browser (localStorage). Skins can ONLY be changed in the sala, never in the middle of a level
- `npm run dev:inmortal` starts a second server (port 5174) where nothing hurts the hero
- Secret key inside the levels: `E` then `P` = invincible mode on/off (the old level keys for skins, extra jumps and jumping to a level were removed)
- Coins and pencils (lápices): gold coins float above the floating platforms of every level (they are placed by themselves from the platforms) and are saved in the browser right away. In the sala, the LÁPICES button (or L) opens a screen where a pencil costs 25 coins: it paints a random skin on a sheet of paper, line by line. Skins are COMÚN, RARO, ÉPICO or LEGENDARIO; rarer ones come out less (`SKIN_RARITY` in `src/data/coins.js` for the first 13 skins, `rarity` in `src/sprites/SkinPack.js` and `SkinPack2.js` for the other 80). There are 95 skins in all: the 15 old ones plus 80 from the pencils (people with jobs and sports, animals, monsters, food with faces, and legends like the phoenix, the golden knight, the Rey and Reina del Color, the ice dragon and the golden mecha). The pencil skins have no codes of their own (only `T` gives them all). The skins screen shows 13 small pictures around the current skin, since they don't all fit. A repeated skin is just bad luck. Secret: pressing ENTER 5 times fast (in 2 seconds) on the LÁPICES screen opens 15 pencils at once, if there are enough coins (the first ENTER already opened one, so it pays the other 14), and shows the 15 skins in little cards. This is the normal way to win skins; the codes are the secret way. Test shortcut: `?monedas=100` in the URL gives 100 coins
- Record: the highest score is saved in the browser (`src/data/record.js`). It shows in the sala, and the Game Over and victory screens say "¡NUEVO RÉCORD!" when it is beaten
- CARRERA (race) from the sala (button on the right, or C): first choose 👥 OFFLINE or 🤖 MÁQUINA (`ModeChoiceScene.js`). OFFLINE: the screen is split in two halves and two players play at the same time on the same keyboard, each in their own copy of the levels. After a 3-2-1 countdown, the first one to reach level 4 (finish level 3) wins. In the race there are no hearts, points or game over: losing a life just starts that level again. ESC goes back to the sala. On phones and tablets each half gets its own buttons (see `TouchControls.js`), so two people can play on one iPad. MÁQUINA: alone on the whole screen against a see-through ghost with a 🤖 (`RaceBot` in `src/maquina/Bot.js`: FÁCIL, NORMAL or DIFÍCIL), with two bars at the top that say how far each one is. Winning gives 5 / 10 / 20 coins. At the end: 🔁 REVANCHA (R) or 🏠 SALA (ENTER). While `npm run dev` runs, `window.juego` in the browser console is the game, to look inside it when testing
- TOP BAR in the sala (like Fortnite): INICIO · PASE BLANCO Y NEGRO (P), with the coins on the right. On the right of the sala: JUNTOS (J), CARRERA (C), FÚTBOL (G) and EDITOR (E); the 🔊/🔇 sound button is next to our player
- PASE BLANCO Y NEGRO (`src/data/pass.js`), like the Fortnite battle pass: playing gives ⭐ stars (`earnStars(event)` in pass.js: villains, coins, levels, wins and countries; chests give stars too). 100 stars = 1 level, 100 levels, and every level gives 1 🏅 MEDALLA. The prizes are in 10 PAGES of 8 (4 GRATIS + 4 PREMIUM 👑): touch a prize to see it big and turning on the left, and DESBLOQUEAR (ENTER) spends medals on it (coins cost 1, the big skin of each page 2, 3 or 4; all 80 prizes cost exactly 100). Unlocking 4 prizes of a page opens the next one. PREMIUM costs 950 coins per season (like 950 V-Bucks). Each page has a PREMIUM skin (Caballero, Pingüino, Panda, Dominó, Tiburón, Mago, Samurái, Fantasma, Dragón, Rey) and pages 5 and 10 have a GRATIS skin (Explorador, Cebra): the 12 skins of `PassSkins.js` (an already-owned skin gives 100 coins). Keys: ◀ ▶ pages, 1-8 pick a prize, P buys PREMIUM. A new SEASON every month (season 1 = October 2026): the pass goes back to 0. The hack `T` does NOT give the pass skins
- EDITOR DE NIVELES (E): 5 slots saved in the browser. Tools 1-9 and 0: SUELO (toggle ground columns, makes pits), PLATAFORMA, MR.1, MR.2, MR.3, LÁPIZ, ESCUDO, META, INICIO, BORRAR. ◀ ▶ or the mini-map move along the 2400px level. GUARDAR, PROBAR (plays it in CustomLevelScene), SALIR. Custom levels have no coins (so nobody can farm them). The PLATAFORMA tool has variants too: ▬ PLATAFORMA, ❓ BLOQUE and 👻 INVISIBLE (secret blocks; in the editor's levels they give points, not coins)
- JUNTOS (sala button, or J): two players in the SAME story on the same screen (`this.coop` in `LevelScene.js`). Player 1 = our skin with W A D + S, player 2 = the normal hero (light blue if player 1 is the hero too) with the arrows + ↓. They share the hearts and the points; the camera looks between them; one that stays 700px behind jumps next to the other; falling in a pit costs a heart but you come back next to your friend. Either one can reach the goal. Shooting villains aim at the closest hero. On touch screens each half gets its own buttons
- LÁPICES DE COLORES (`COLOR_GUNS` in `src/sprites/Projectile.js`), found in the levels: 🔥 `lapiz-rojo` = fire (double damage, goes THROUGH the villains), ❄️ `lapiz-azul` = ice (the villain becomes a block of ice for 3.5 s: it can't hurt you and you can STAND on it; flying ones stay in the air), 🟢 `lapiz-verde` = bouncing shots (5 bounces). Picking one gives the gun with that kind of shot (`hero.gunColor`); the normal Lápiz de Color gives the rainbow shot back
- VEHÍCULOS (in the levels, `Hero.mountVehicle`): 🛹 `patineta` = 10 s much faster, and jumping does a spin TRICK (+50 points); 🚀 `cohete` = 4 s TURBO forward that can't stop or turn, and knocks out the villains it crashes into. They blink before they end
- COFRES: one hidden chest per level (`cofre`, never in the race). It opens with an animation and gives a surprise (`src/data/chests.js`): coins (60%), ⭐ stars for the pass (25%), or a surprise skin (15%); a skin we already have gives coins instead. In levels 1 and 2 the chest shines with gold sparkles; from level 3 on there is no hint
- CLIMA (`src/managers/WeatherManager.js`): every time we play a level the weather is picked at random (día twice as often): 🌙 noche (dark, with a flashlight around each hero and stars), 🌧 lluvia (rain and lightning), ❄️ nieve (snow, and the floor is SLIPPERY). The "Nivel X" screen says which one came out. Losing a heart keeps the same weather; in every mode (also race, survival and the editor's levels), and in the race both halves get the same one
- SOUND: retro sounds and music made with code (`src/audio/Sound.js`): jump, coin, shoot, stomp, hit, power-up, pencils, countdown, waves, win, lose, missions, buying. Music in the sala and in the levels. 🔊/🔇 in the sala (remembered)
- Our player (TU JUGADOR): the first time the game opens, before the sala, we write a name (more than 3 letters and less than 14) and pick an avatar (ANY of the 94 skins, even ones not won yet; it is only the picture other players see, not the skin we wear). It is saved in the browser (`src/data/profile.js`). It shows in the top-left corner of the sala; touching it (or N) changes it
- FÚTBOL (sala button ⚽ FÚTBOL, between SKINS and the big hero, or G): like Head Soccer, ONE field on the whole screen, big players, a goal on each side (blue defends the left one). The ball bounces off heads and bodies; the kick key kicks hard to the other goal. 1:30 per match; a TIE = PENALES (5 each, then one more each until somebody misses; the keeper stands on the goal line, so you have to guess: jump or not). POWERS fall from the sky every 12 s (only in the normal time): 🗿 CABEZA GIGANTE (8 s), 🔥 PELOTA DE FUEGO (the next kick is super fast), 🧊 ARCO CONGELADO (a wall of ice covers YOUR goal for 5 s). 4 ways (FutbolMenuScene): 🤖 MÁQUINA (FÁCIL/NORMAL/DIFÍCIL, coins 5/10/20), 👥 OFFLINE, 🏆 TEMPORADA (choose a club or country; División 5 → 1, 5 matches per season against the other clubs of the division, table with points; 1st and 2nd go up, 5th and 6th go down, 1st of División 1 = CAMPEÓN; ties count; coins: win 10, tie 3, going up 50, champion 200; N = new team) and 🌍 MUNDIAL (choose a country: group of 4 → cuartos → semifinal → FINAL; the final is against the robot at its hardest, with a surprise country; coins: win 10, next stage 20, champion 300). Both are saved in the browser (`blancoYNegro.temporada`, `blancoYNegro.mundial`).
- HALLOWEEN 🎃 (`src/data/halloween.js`), an event every year from October 20 to November 2 (so it has the Día de Muertos too). Test: `?halloween` in the URL turns it on any day, `?halloween=no` turns it off. During the event: 3 CALABAZAS in every level, on platforms spread along it (they live in the coins group, so the editor's levels have none). Each gives 5 coins and counts for the prizes, the 5 skins of `HalloweenSkins.js`: 5 🎃 = Esqueleto, 10 = Hombre Lobo, 16 = Frankenstein, 23 = Catrina, 31 = Rey Calabaza (legendario, can shoot). The count is saved per year (`blancoYNegro.halloween2026`). The villains wear a costume on the head (witch hat, pumpkin or devil horns; `dressUpEnemies` in `HalloweenManager.js`). The sala has an orange moon with bats, pumpkins on the street, "¡Feliz Halloween!" and the 🎃 HALLOWEEN button (or O) with the prizes. The Halloween skins never come out of pencils, chests or the hack `T`
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
