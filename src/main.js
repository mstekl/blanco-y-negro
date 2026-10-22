// main.js — This is where our game starts!
// It tells Phaser how big the game is, what physics to use,
// and which scenes (levels) to load.

import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import TitleScene from './scenes/TitleScene.js';
import SkinsScene from './scenes/SkinsScene.js';
import PencilsScene from './scenes/PencilsScene.js';
import ProfileScene from './scenes/ProfileScene.js';
import LevelIntroScene from './scenes/LevelIntroScene.js';
import LevelScene from './scenes/LevelScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import CelebrationScene from './scenes/CelebrationScene.js';
import WorldMapScene from './scenes/WorldMapScene.js';
import WinScene from './scenes/WinScene.js';
import RaceScene, { RaceLeftScene, RaceRightScene } from './scenes/RaceScene.js';
import ModeChoiceScene from './scenes/ModeChoiceScene.js';
import OnlineScene from './scenes/OnlineScene.js';
import SurvivalScene from './scenes/SurvivalScene.js';
import MissionsScene from './scenes/MissionsScene.js';
import ShopScene from './scenes/ShopScene.js';
import PassScene from './scenes/PassScene.js';
import LockerScene from './scenes/LockerScene.js';
import EditorScene from './scenes/EditorScene.js';
import CustomLevelScene from './scenes/CustomLevelScene.js';
import CosmeticsScene from './scenes/CosmeticsScene.js';
import AchievementsScene from './scenes/AchievementsScene.js';
import ShareLevelScene from './scenes/ShareLevelScene.js';
import { SearchLeftScene, SearchRightScene } from './scenes/SearchLevelScene.js';
import { LavaLeftScene, LavaRightScene } from './scenes/LavaLevelScene.js';
import CaptureScene from './scenes/CaptureScene.js';
import HideSeekScene from './scenes/HideSeekScene.js';
import FutbolMenuScene from './scenes/FutbolMenuScene.js';
import SoccerScene from './scenes/SoccerScene.js';
import TeamPickScene from './scenes/TeamPickScene.js';
import TemporadaScene from './scenes/TemporadaScene.js';
import MundialScene from './scenes/MundialScene.js';
import HalloweenScene from './scenes/HalloweenScene.js';
import { setupTouchControls } from './touch/TouchControls.js';

// Game configuration — think of this as the "settings" for our game
const config = {
  // The type of renderer (AUTO lets Phaser pick the best one)
  type: Phaser.AUTO,

  // The size of our game window (800 pixels wide, 600 pixels tall)
  width: 800,
  height: 600,

  // Where to put the game on the webpage
  parent: 'game-container',

  // Make the game as big as the screen allows (without stretching it),
  // so it fits on a computer, a tablet or a phone
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Background color (dark — sets the mood!)
  backgroundColor: '#111111',

  // Physics engine — this makes things fall with gravity!
  physics: {
    default: 'arcade',
    arcade: {
      // Gravity pulls things down (500 pixels per second)
      gravity: { y: 500 },
      // Set to true if you want to see the physics boxes (helpful for debugging)
      debug: false
    }
  },

  // All the scenes in our game — Boot starts first!
  // Boot → PreloadScene → TitleScene (↔ SkinsScene, PencilsScene) → LevelIntro → Level → GameOver/Celebration → WorldMap → Win
  // The race (from the sala): RaceScene on top, with RaceLeft and RaceRight (one level for each half)
  // The search (BÚSQUEDA) uses RaceScene too, with SearchLeft and SearchRight, and LAVA QUE SUBE with LavaLeft and LavaRight
  // CAPTURA LA BANDERA uses RaceScene with ONE CaptureScene for both players (two cameras)
  // ESCONDIDAS (HideSeekScene) runs by itself: turns on the whole screen
  // FÚTBOL: FutbolMenuScene (4 ways to play) → SoccerScene (one match on the whole screen);
  // the TEMPORADA (TemporadaScene) and the MUNDIAL (MundialScene) choose their team in TeamPickScene
  // Before them, ModeChoiceScene asks ONLINE / OFFLINE / MÁQUINA (and OnlineScene connects with a friend)
  scene: [BootScene, PreloadScene, TitleScene, ProfileScene, SkinsScene, PencilsScene, LevelIntroScene, LevelScene, GameOverScene, CelebrationScene, WorldMapScene, WinScene,
    ModeChoiceScene, OnlineScene, SurvivalScene, MissionsScene, ShopScene, PassScene, LockerScene, EditorScene, CustomLevelScene, CosmeticsScene, AchievementsScene, ShareLevelScene, RaceLeftScene, RaceRightScene, SearchLeftScene, SearchRightScene, LavaLeftScene, LavaRightScene, CaptureScene, HideSeekScene, FutbolMenuScene, SoccerScene, TeamPickScene, TemporadaScene, MundialScene, HalloweenScene, RaceScene]
};

// Create the game!
const game = new Phaser.Game(config);

// Only while we build the game (npm run dev): we can look inside it from the
// browser console, for example window.juego.scene.getScenes(true)
if (import.meta.env.DEV) window.juego = game;

// On phones and tablets: buttons and a small keyboard on the screen
setupTouchControls();