import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from './config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { ProfileSelectScene } from './scenes/ProfileSelectScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { SettingsScene } from './scenes/SettingsScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
    min: { width: 400, height: 225 },
    max: { width: 1600, height: 900 },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY },
      debug: false,
    },
  },
  scene: [
    BootScene,
    TitleScene,
    ProfileSelectScene,
    CharacterSelectScene,
    LevelSelectScene,
    SettingsScene,
    PreloadScene,
    GameScene,
    UIScene,
    LevelCompleteScene,
  ],
  backgroundColor: '#0a0a1a',
  input: {
    activePointers: 4,
    keyboard: true,
  },
};

const game = new Phaser.Game(config);

// Ensure canvas gets keyboard focus
game.events.once('ready', () => {
  const canvas = game.canvas;
  if (canvas) {
    canvas.tabIndex = 0;
    canvas.focus();

    // Unlock Web Audio on first user gesture (mobile autoplay policy)
    const unlockAudio = () => {
      if (game.sound && 'context' in game.sound) {
        const ctx = (game.sound as any).context as AudioContext;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }
    };

    canvas.addEventListener('mousedown', () => {
      canvas.focus();
      unlockAudio();
    });
    canvas.addEventListener('touchstart', unlockAudio, { once: true });
  }
});
