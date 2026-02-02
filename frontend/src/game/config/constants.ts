/**
 * Game Constants
 *
 * Phaser import 없이 사용 가능한 상수들
 */

// Board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BLOCK_SIZE = 24;

// Colors (NES Tetris style)
export const COLORS = {
  BACKGROUND: '#0F0F23',
  BOARD_BG: '#000000',  // Pure black for board background
  GRID: '#333366',      // Brighter grid lines
  BORDER: '#6666AA',    // Visible border color
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
