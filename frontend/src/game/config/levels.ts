/**
 * Level Configuration
 *
 * NES 테트리스 레벨 시스템 설정
 */

/**
 * NES Tetris drop speeds (frames per grid cell)
 * 낮을수록 빠름
 */
export const NES_FRAME_TABLE: Record<number, number> = {
  0: 48, // Level 0: 48 frames
  1: 43,
  2: 38,
  3: 33,
  4: 28,
  5: 23,
  6: 18,
  7: 13,
  8: 8,
  9: 6,
  10: 5, // Level 10+: maximum speed
};

/**
 * Convert frames to milliseconds (assuming 60 FPS)
 */
export function framesToMs(frames: number): number {
  return (frames / 60) * 1000;
}

/**
 * Get drop speed in milliseconds for a given level
 */
export function getDropSpeedMs(level: number): number {
  const cappedLevel = Math.min(level, 10);
  const frames = NES_FRAME_TABLE[cappedLevel];
  return framesToMs(frames);
}

/**
 * NES scoring formula: base points × (level + 1)
 */
export const SCORE_TABLE: Record<number, number> = {
  0: 0, // No lines
  1: 40, // Single
  2: 100, // Double
  3: 300, // Triple
  4: 1200, // Tetris
};

/**
 * Maximum level
 */
export const MAX_LEVEL = 10;

/**
 * Lines needed to level up
 */
export const LINES_PER_LEVEL = 10;
