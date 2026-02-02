/**
 * Tetromino types (7 classic pieces)
 */
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/**
 * Position on the board
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Rotation state (0, 1, 2, 3 = 0°, 90°, 180°, 270°)
 */
export type Rotation = 0 | 1 | 2 | 3;

/**
 * Tetromino state
 */
export interface TetrominoState {
  type: TetrominoType;
  position: Position;
  rotation: Rotation;
}

/**
 * Cell state on the board
 */
export type CellState = TetrominoType | null;

/**
 * Board state (2D array)
 */
export type BoardState = CellState[][];

/**
 * Game state
 */
export interface GameState {
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
}

/**
 * Input action types
 */
export type InputAction =
  | 'moveLeft'
  | 'moveRight'
  | 'softDrop'
  | 'hardDrop'
  | 'rotateCW'
  | 'rotateCCW'
  | 'pause';

/**
 * Score event types
 */
export interface ScoreEvent {
  linesCleared: number;
  level: number;
  isTetris: boolean;
}

/**
 * API types for score submission
 */
export interface ScoreSubmission {
  playerId: string;
  score: number;
  level: number;
  lines: number;
  playTimeSeconds: number;
}

export interface ScoreResponse {
  id: string;
  playerId: string;
  score: number;
  level: number;
  lines: number;
  playTimeSeconds: number;
  createdAt: string;
}

export interface RankingEntry {
  rank: number;
  playerNickname: string;
  score: number;
  level: number;
  lines: number;
  createdAt: string;
}
