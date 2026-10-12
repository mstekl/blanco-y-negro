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
│   │   ├── missions.js        # The MISIONES DEL DÍA: the list, today's 3, progress, prizes (reportMission)
│   │   ├── pass.js            # PASE BLANCO Y NEGRO: stars, 100 levels, medals, 10 pages of prizes, seasons, PREMIUM
│   │   ├── shop.js            # TIENDA power-ups and the backpack (mochila)
│   │   ├── cosmetics.js       # BAILES, MOCHILAS and MASCOTAS: the list, which we have, which we wear, shop of the day
│   │   ├── achievements.js    # LOGROS: counts everything forever (countStat) and gives trophies with coins
│   │   ├── chests.js          # What comes out of a COFRE: coins, stars, a surprise skin, or a baile/mochila/mascota
│   │   ├── customLevels.js    # The 5 levels made in the editor
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
│   │   ├── OnlineScene.js     # ONLINE: CREAR PARTIDA (get a secret word) or UNIRSE (type the friend's word), 2 to 4 players, the creator presses EMPEZAR
│   │   ├── SurvivalScene.js   # SUPERVIVENCIA: alone in an arena, waves of villains, how long can you last?
│   │   ├── MissionsScene.js   # MISIONES DEL DÍA: the 3 missions of today and how far we got
│   │   ├── PassScene.js       # PASE BLANCO Y NEGRO tab: like Fortnite: pages of 8 prizes, the chosen one big and turning
│   │   ├── ShopScene.js       # TIENDA tab: 4 skins of the day + power-ups; second tab (B): bailes, mochilas, mascotas + PROBADOR
│   │   ├── LockerScene.js     # CASILLERO tab: SKINS, TU JUGADOR, MISIONES, BAILES, ACCESORIOS and LOGROS
│   │   ├── CosmeticsScene.js  # CASILLERO: choose the baile, mochila and mascota (tabs 1 2 3)
│   │   ├── AchievementsScene.js # CASILLERO: the LOGROS (trophies) and how far we are
│   │   ├── ShareLevelScene.js # Share a level of the editor with a friend (secret word, PeerJS)
│   │   ├── EditorScene.js     # EDITOR DE NIVELES: 5 slots, draw a level with tools
│   │   ├── CustomLevelScene.js # Plays a level made in the editor
│   │   ├── RaceScene.js       # The race: 2 players split screen (RaceLeft + RaceRight are copies of LevelScene), or alone on the whole screen (online / máquina) with progress bars. Also runs BÚSQUEDA
│   │   ├── SearchLevelScene.js # BÚSQUEDA: one half of the screen, find the 5 colored pencils (SearchLeft + SearchRight)
│   │   └── LavaLevelScene.js  # LAVA QUE SUBE: a tall tower, climb before the lava gets you (LavaLeft + LavaRight)
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
│   │   ├── Cosmetics.js       # How the bailes, mochilas and mascotas look and move: cosmeticTexture, attachCosmetics, playEmote
│   │   ├── StormCloud.js      # Level 5 cloud that chases you and throws pencils
│   │   └── Projectile.js      # Bullets (hero & enemy)
│   ├── managers/
│   │   ├── LevelManager.js    # Builds levels from data
│   │   ├── LandmarkArt.js     # Draws the landmarks (Chichén Itzá, Statue of Liberty, CN Tower...)
│   │   ├── PowerupManager.js  # Power-up effects (also colored pencils, vehicles and chests)
│   │   ├── WeatherManager.js  # Random weather: día, noche (flashlight), lluvia, nieve (slippery)
│   │   └── HUDManager.js      # Score, lives, UI
│   ├── online/
│   │   ├── Net.js             # Online connection with PeerJS: the secret word becomes the name to find the creator, who is the CENTER that passes every message on to everybody (up to 4 players)
│   │   └── Bot.js             # The MÁQUINA: a ghost that runs the race, looks for its own pencils or climbs the lava tower
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
- **Race (CARRERA)** — player 1 (left half): A D move, W jump, S shoot · player 2 (right half): ← → move, ↑ jump, ↓ shoot. No running in the race, so both go at the same speed. LAVA QUE SUBE uses the same keys (without shooting)
- **Phones and tablets** — buttons on the screen: ◀ ▶ walk, ▲ jump, 🎨 shoot, CORRER run, 💃 dance, OK (= Enter), ESC, and ⌨ for a small keyboard (it opens by itself in the Hacks boxes). The buttons pretend to be keyboard keys, so the rest of the game did not need changes. Add ?tactil to the URL to see them on the computer
- **Q** — Dance (the baile chosen in the CASILLERO), in the sala and in the levels. In JUNTOS player 2 dances with L
- **JUNTOS** — player 1: A D move, W jump, S shoot · player 2: ← → move, ↑ jump, ↓ shoot

## Game Features
- 6 levels with increasing difficulty (castle entrance at level 4, pipe at level 5, final boss in level 6)
- 4 enemy types: MR.1 (walker), MR.2 (shooter), MR.3 (white MR.1 riding an eraser tank that chases you, levels 3, 4 and 6) and DOBLE-X (fat with zebra stripes: defeating him splits him in 2 smaller and faster ones, 3 times: 1 → 2 → 4 → 8, so 15 in all; levels 2, 3 and 6, survival from wave 7, and in the editor as the second variant of the MR.3 tool) + boss
- Power-ups: Color Pencil (gun), Shield, Extra Life
- Double jump mechanic
- Grayscale tint system (world gets darker each level)
- Rainbow particle effects on enemy defeat
- Parallax scrolling backgrounds with building silhouettes
- Data-driven level system (add levels by editing levels.js)
- World map after level 6: pick a country and play 3 levels INSIDE it, with its landmarks in the background (México: Chichén Itzá, EEUU: Estatua de la Libertad, Canadá: Torre CN, Francia: Torre Eiffel, Egipto: pirámides, China: Gran Muralla, Brasil: Cristo Redentor, Perú: Machu Picchu, Japón: Monte Fuji, Reino Unido: Big Ben, Australia: Ópera de Sídney, Italia: Coliseo, India: Taj Mahal, Argentina: Obelisco, Grecia: Partenón; other countries get a generic landscape for now). Beating them colors the country; continents unlock in order (Norteamérica → Centroamérica → Sudamérica → África → Europa → Asia → Oceanía). Colored countries are saved in the browser (localStorage). Test shortcut: add ?mapa to the URL (?mapa=reset erases the saved countries)
- "Hacks de mapa" on the world map (press SPACE, next to the points): type a code and ENTER. `Emi y papá 2026` = invincible mode (until the page is reloaded), `mortal` = turns it off again; `<continente> pasar` (for example `sudamerica pasar`) = that continent gets all its colors (`pass` works too)
- The "sala" (title screen): black-and-white city, big JUGAR button bottom right (or ENTER), and in the middle left the "Hacks de sala" (SPACE) and a small SKINS button (or S). Typing a code in the hacks WINS a skin: `B Y N` = MR.1 and MR.2, `lebron` = crazy dog, `goma` = MR.3 on his eraser tank (can shoot from the start), `N A` = rainbow ninja, `N5 C` = storm cloud (can shoot), `LP` = color pencil, `J F` = the final boss (can shoot), `A B` = color astronaut (can shoot), `R S` = color robot, `G P` = painter cat, `D R` = rainbow dinosaur (can shoot), `S C` = superhero with a cape, `D X` = Doble-X, `T` = ALL the skins at once (typing `T` again when you already have them all takes them away: only the hero is left), `10000` = 10000 coins, `100000` = 100000 coins and `1000000` = 1000000 coins (not skins), and `100 niv p` = 100 levels up in the PASE BLANCO Y NEGRO (= 100 🏅 medals to choose prizes, with one message instead of 100). A new player only has the hero. The SKINS button opens the skins screen (like Paper.io 2): the skin is big in the middle, the arrows move to the next one, ELEGIR puts it on, and skins not won yet have a lock. Won skins are saved in the browser (localStorage). Skins can ONLY be changed in the sala, never in the middle of a level
- `npm run dev:inmortal` starts a second server (port 5174) where nothing hurts the hero
- Secret key inside the levels: `E` then `P` = invincible mode on/off (the old level keys for skins, extra jumps and jumping to a level were removed)
- Coins and pencils (lápices): gold coins float above the floating platforms of every level (they are placed by themselves from the platforms) and are saved in the browser right away. In the sala, the LÁPICES button (or L) opens a screen where a pencil costs 25 coins: it paints a random skin on a sheet of paper, line by line. Skins are COMÚN, RARO, ÉPICO or LEGENDARIO; rarer ones come out less (`SKIN_RARITY` in `src/data/coins.js` for the first 13 skins, `rarity` in `src/sprites/SkinPack.js` and `SkinPack2.js` for the other 80). There are 95 skins in all: the 15 old ones plus 80 from the pencils (people with jobs and sports, animals, monsters, food with faces, and legends like the phoenix, the golden knight, the Rey and Reina del Color, the ice dragon and the golden mecha). The pencil skins have no codes of their own (only `T` gives them all). The skins screen shows 13 small pictures around the current skin, since they don't all fit. A repeated skin is just bad luck. Secret: pressing ENTER 5 times fast (in 2 seconds) on the LÁPICES screen opens 15 pencils at once, if there are enough coins (the first ENTER already opened one, so it pays the other 14), and shows the 15 skins in little cards. This is the normal way to win skins; the codes are the secret way. Test shortcut: `?monedas=100` in the URL gives 100 coins
- Record: the highest score is saved in the browser (`src/data/record.js`). It shows in the sala, and the Game Over and victory screens say "¡NUEVO RÉCORD!" when it is beaten
- CARRERA (race) from the sala (button under LÁPICES, or C): the screen is split in two halves and two players play at the same time on the same keyboard, each in their own copy of the levels. After a 3-2-1 countdown, the first one to reach level 4 (finish level 3) wins. In the race there are no hearts, points or game over: losing a life just starts that level again. ESC goes back to the sala. On phones and tablets each half gets its own buttons (see `TouchControls.js`), so two people can play on one iPad
- BÚSQUEDA (search) from the sala (button just above JUGAR, or B): split screen like the race, both players in the map of level 1 with no villains and no coins. 5 GOOD pencils are hidden all over the map (rojo, azul, verde, violeta, naranja) and 6 BAD ones (2 amarillo, 2 rosa, 2 marrón). The places are shuffled, so they are different in each half and every game. Stand next to a pencil and grab it: player 1 with Z, player 2 with ↓. A bad pencil takes 1 of your 3 lives. The first to find the 5 good ones wins; losing the 3 lives means the other player wins. Falling into a pit only sends you back to the start
- LAVA QUE SUBE (sala button 🌋 LAVA on the right, or U): a tall tower of platforms (24 platforms in zigzag, about 117 m) and the lava rises from below, faster and faster (`lavaSpeed` in `LavaLevelScene.js`: 18 → 55 pixels per second). The first to reach the flag at the top wins. Touching the lava takes 1 of 3 hearts (the shield in the middle of the tower saves you once) and the hero jumps out onto a higher platform; losing the 3 hearts = out. The platforms can be jumped THROUGH from below. No villains, no coins, no shooting. Same ONLINE / OFFLINE / MÁQUINA as the race (it runs inside `RaceScene.js`, mode `lava`). Everybody gets the same tower, built from today's date (`todaysSeed`), so it changes every day. The MÁQUINA (`LavaBot`): FÁCIL never reaches the top (the lava gets it at ~45 s, so surviving wins), NORMAL ~50 s, DIFÍCIL ~33 s
- ONLINE / OFFLINE / MÁQUINA: CARRERA, BÚSQUEDA and LAVA QUE SUBE first ask how to play (keys 1 2 3). OFFLINE = the split screen above. MÁQUINA = alone on the whole screen against the computer (FÁCIL, NORMAL or DIFÍCIL), which is a see-through ghost with a 🤖 in our level (`src/online/Bot.js`; speeds and mistakes are in `LEVELS` there). ONLINE = each one on their own device: CREAR PARTIDA gives a secret word (like LEON), the friend chooses UNIRSE and types it. It uses PeerJS (free, no account: the two browsers talk directly, `src/online/Net.js`). The one who created the game decides if it is CARRERA or BÚSQUEDA. Alone on the screen, two bars at the top show how far each one is. If the friend leaves (or is silent 8 seconds) the game says SE DESCONECTÓ. Normal keys alone on the screen: arrows/WASD, Z grabs in the search. Online there are 4 buttons on the right (or keys 1 2 3 4) to send 😂 😡 👍 or "¡Te gano!": it shows big on the friend's screen. At the end there are two buttons: 🔁 REVANCHA (R) plays again (online BOTH must press it, and the same connection is kept, no new word) and 🏠 SALA (ENTER). Winning gives coins: 5 / 10 / 20 against the machine (FÁCIL / NORMAL / DIFÍCIL), 15 online (`COIN_PRIZES` in `RaceScene.js`). While `npm run dev` runs, `window.juego` in the browser console is the game, to look inside it when testing
- ONLINE with 3 or 4: everybody types the same secret word, the creator sees the list (👑 = creator) and presses EMPEZAR (ENTER). One bar per player. The first to win wins for everybody; in the search, losing the 3 lives means "¡QUEDASTE FUERA!" and the others keep playing (the last one left wins). The REVANCHA starts when everybody who is still there presses R. If the creator leaves, the game ends for everybody (the creator is the center). Online prize: 15 coins + 5 for each extra rival
- SUPERVIVENCIA (sala button on the right, or V): alone in an arena with no pits, 3 lives and the Color Pencil from the start. Villains come in waves from both sides (MR.1, then MR.2 from wave 3, MR.3 from wave 5), a new wave when all are defeated or after 25 seconds, a shield every 3 waves. At the end: time, wave, record (`blancoYNegro.supervivencia`) and coins (1 per 10 seconds + 2 per wave)
- MISIONES DEL DÍA (sala button on the right, or M): 3 missions a day (FÁCIL, MEDIA, DIFÍCIL) picked from the date, so they change every day. The game calls `reportMission(event)` (villains, coins, levels, pencils, wins, countries, survival...) and a finished mission gives its coins right away with a message at the top. The list is in `src/data/missions.js`
- TOP BAR in the sala (like Fortnite): INICIO · PASE BLANCO Y NEGRO (P) · TIENDA (T) · CASILLERO (K), with the coins on the right. CASILLERO has SKINS, TU JUGADOR and MISIONES (M). The sala also has EDITOR (E), SUPERVIVENCIA (V) and the 🔊/🔇 sound button next to our player
- PASE BLANCO Y NEGRO (`src/data/pass.js`), like the Fortnite battle pass: playing gives ⭐ stars (every `reportMission` event: villains, coins, levels, pencils, wins, countries, waves; a finished mission gives 50). 100 stars = 1 level, 100 levels, and every level gives 1 🏅 MEDALLA. The prizes are in 10 PAGES of 8 (4 GRATIS + 4 PREMIUM 👑): touch a prize to see it big and turning on the left, and DESBLOQUEAR (ENTER) spends medals on it (coins and power-ups cost 1, the big skin of each page 2, 3 or 4; all 80 prizes cost exactly 100). Unlocking 4 prizes of a page opens the next one. PREMIUM costs 950 coins per season (like 950 V-Bucks). Each page has a PREMIUM skin (Caballero, Pingüino, Panda, Dominó, Tiburón, Mago, Samurái, Fantasma, Dragón, Rey) and pages 5 and 10 have a GRATIS skin (Explorador, Cebra): the 12 skins of `PassSkins.js` (an already-owned skin gives 100 coins). Keys: ◀ ▶ pages, 1-8 pick a prize, P buys PREMIUM. A new SEASON every month (season 1 = October 2026): the pass goes back to 0. The hack `T` does NOT give the pass skins
- TIENDA: 4 skins of the day (picked from the date, never pass skins; 50 / 100 / 200 / 400 coins by rarity) and the power-ups Escudo (15), Vida extra (20), Lápiz de color (25), up to 5 of each in the backpack. When JUGAR or SUPERVIVENCIA starts, the hero gets one of each thing in the backpack (`takeShopItems` / `useShopItems` in `src/data/shop.js`)
- SUPERVIVENCIA ONLINE: SUPERVIVENCIA asks ONLINE or SOLO. Online (2 to 4, same secret word) everybody has the same waves, a line per player shows hearts and wave, and the last one still alive wins (coins: survival coins + 10 + 5 per rival). REVANCHA when everybody presses R
- EDITOR DE NIVELES (E): 5 slots saved in the browser. Tools 1-9 and 0: SUELO (toggle ground columns, makes pits), PLATAFORMA, MR.1, MR.2, MR.3, LÁPIZ, ESCUDO, META, INICIO, BORRAR. ◀ ▶ or the mini-map move along the 2400px level. GUARDAR, PROBAR (plays it in CustomLevelScene), SALIR. Custom levels have no coins (so nobody can farm them) and do not count for missions
- BAILES, MOCHILAS y MASCOTAS (`src/data/cosmetics.js`, drawn and animated in `src/sprites/Cosmetics.js`), like in Fortnite: they only look cool. 💃 8 bailes (everybody has the Saludo): press Q (or 💃 on touch screens, or 💃 BAILAR in the sala) and the hero dances. 🎒 6 mochilas on the hero's back (alas, cohete...) and 🐾 7 mascotas that follow the hero (perrito, unicornio...). They show in the sala and in every level, survival and race (not on player 2). Won in the TIENDA (second tab "BAILES Y MÁS", 4 of the day, 40/80/150/300 coins by rarity, with a PROBADOR to try them first) or in the PASE (the ones with `pass: true` are only there: GRATIS pages 2, 4, 7 and PREMIUM pages 3, 6, 9). Chosen in CASILLERO → BAILES / ACCESORIOS. ONLINE: the 💃 button (or Q) in the race sends our dance, and our friends see our hero dancing in a little window
- JUNTOS (sala button, or J): two players in the SAME story on the same screen (`this.coop` in `LevelScene.js`). Player 1 = our skin with W A D + S, player 2 = the normal hero (light blue if player 1 is the hero too) with the arrows + ↓. They share the hearts and the points; the camera looks between them; one that stays 700px behind jumps next to the other; falling in a pit costs a heart but you come back next to your friend. Either one can reach the goal. Shooting villains aim at the closest hero. On touch screens each half gets its own buttons
- LOGROS (`src/data/achievements.js`, CASILLERO → LOGROS): 23 trophies. Every `reportMission` event is also counted FOREVER (`countStat`), plus `jefe` (CelebrationScene), `baile`, `juntos` and `misiones`. Some look at what we have (skins, bailes/mochilas/mascotas, the pass level, the record). Each logro gives coins and a 🏆 message at the top
- LÁPICES DE COLORES (`COLOR_GUNS` in `src/sprites/Projectile.js`), found in the levels: 🔥 `lapiz-rojo` = fire (double damage, goes THROUGH the villains), ❄️ `lapiz-azul` = ice (the villain becomes a block of ice for 3.5 s: it can't hurt you and you can STAND on it; flying ones stay in the air), 🟢 `lapiz-verde` = bouncing shots (5 bounces). Picking one gives the gun with that kind of shot (`hero.gunColor`); the normal Lápiz de Color gives the rainbow shot back
- VEHÍCULOS (in the levels, `Hero.mountVehicle`): 🛹 `patineta` = 10 s much faster, and jumping does a spin TRICK (+50 points); 🚀 `cohete` = 4 s TURBO forward that can't stop or turn, and knocks out the villains it crashes into. They blink before they end
- COFRES: one hidden chest per level (`cofre`, never in the race). It opens with an animation and gives a surprise (`src/data/chests.js`): coins (60%), ⭐ stars for the pass (25%), a surprise skin (10%) or a baile/mochila/mascota of the shop (5%); something we already have gives coins instead. In levels 1 and 2 the chest shines with gold sparkles; from level 3 on there is no hint
- CLIMA (`src/managers/WeatherManager.js`): every time we play a level the weather is picked at random (día twice as often): 🌙 noche (dark, with a flashlight around each hero and stars), 🌧 lluvia (rain and lightning), ❄️ nieve (snow, and the floor is SLIPPERY). The "Nivel X" screen says which one came out. Losing a heart keeps the same weather; in every mode (also race, survival and the editor's levels), and in the race both halves get the same one
- COMPARTIR NIVELES (`src/scenes/ShareLevelScene.js`): in MIS NIVELES, 📤 COMPARTIR (C) gives a secret word; the friend chooses 📥 RECIBIR (R) and types it (both with the game open). The level is cleaned (`cleanReceivedLevel` in `customLevels.js`, never trusted as it comes) and saved in the first empty slot, then JUGAR or EDITAR. The editor tools LÁPIZ and ESCUDO have VARIANTS: touch them again (or press their number again) to switch to 🔥 ❄️ 🟢 and 🛹 🚀 🧰
- SOUND: retro sounds and music made with code (`src/audio/Sound.js`): jump, coin, shoot, stomp, hit, power-up, pencils, countdown, waves, win, lose, missions, buying. Music in the sala and in the levels. 🔊/🔇 in the sala (remembered)
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
