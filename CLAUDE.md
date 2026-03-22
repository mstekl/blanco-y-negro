# Blanco y Negro

## Project Description
Father-and-son 2D platformer game built with Phaser 3 and Vite. Vibe coded entirely with Claude Code.

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
├── public/           # Static files (images, sounds go here later)
├── src/
│   ├── assets/       # Game assets imported by code
│   ├── scenes/       # Game scenes (levels/screens)
│   │   └── GameScene.js
│   └── main.js       # Game config and entry point
├── index.html        # HTML wrapper
├── package.json
└── vite.config.js
```

## Current Status
Just scaffolded — ready for Session 1.

## Session Log
| Session | Date | What We Built |
|---------|------|---------------|
| 0 | 2026-03-21 | Project scaffolding — Vite + Phaser 3 setup |

## Code Style Notes
- Keep code simple and well-commented. A 9-year-old is learning from this.
- Use plain JavaScript (no TypeScript).
- Comments should explain the "why", not just the "what".
- Spanish text in the game UI, English in code comments.
