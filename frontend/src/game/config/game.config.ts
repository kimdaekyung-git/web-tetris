import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { TitleScene } from '../scenes/TitleScene';
import { GameScene } from '../scenes/GameScene';
import { GameOverScene } from '../scenes/GameOverScene';

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#0F0F23',
  scene: [BootScene, TitleScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
};

// Game constants
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BLOCK_SIZE = 24;

// Colors (NES Tetris style)
export const COLORS = {
  BACKGROUND: '#0F0F23',
  BOARD_BG: '#1A1A2E',
  GRID: '#2D2D44',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#B8B8D0',
  ACCENT: '#FFD700',
} as const;

// Tetromino colors
export const TETROMINO_COLORS: Record<string, number> = {
  I: 0x00f0f0,
  O: 0xf0f000,
  T: 0xa000f0,
  S: 0x00f000,
  Z: 0xf00000,
  J: 0x0000f0,
  L: 0xf0a000,
};
