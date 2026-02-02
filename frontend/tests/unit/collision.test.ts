/**
 * Collision Tests (RED Phase)
 *
 * 충돌 감지 시스템 테스트 케이스
 * Phase 1, T1.3에서 GREEN으로 전환 예정
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CollisionSystem } from '../../src/game/systems/CollisionSystem';
import type { IBoard, ITetromino } from '../../src/game/systems/CollisionSystem';

// Use interface types from CollisionSystem
type MockBoard = IBoard;
type MockTetromino = ITetromino;

describe('CollisionSystem', () => {
  let collisionSystem: InstanceType<typeof CollisionSystem>;
  let mockBoard: MockBoard;

  beforeEach(() => {
    // Create mock board (empty board)
    mockBoard = {
      isCellEmpty: (x: number, y: number) => {
        if (x < 0 || x >= 10 || y < 0 || y >= 20) return false;
        return true;
      },
      isValidPosition: (x: number, y: number) => {
        return x >= 0 && x < 10 && y >= 0 && y < 20;
      },
    };
    collisionSystem = new CollisionSystem(mockBoard);
  });

  // ============================================================
  // 이동 가능 여부 테스트
  // ============================================================
  describe('canMove', () => {
    it('should allow move left when space is available', () => {
      const tetromino: MockTetromino = {
        x: 5,
        y: 10,
        getBlocks: () => [
          { x: 5, y: 10 },
          { x: 6, y: 10 },
          { x: 5, y: 11 },
          { x: 6, y: 11 },
        ],
      };

      expect(collisionSystem.canMove(tetromino, -1, 0)).toBe(true);
    });

    it('should allow move right when space is available', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 10,
        getBlocks: () => [
          { x: 4, y: 10 },
          { x: 5, y: 10 },
          { x: 4, y: 11 },
          { x: 5, y: 11 },
        ],
      };

      expect(collisionSystem.canMove(tetromino, 1, 0)).toBe(true);
    });

    it('should allow move down when space is available', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 10,
        getBlocks: () => [
          { x: 4, y: 10 },
          { x: 5, y: 10 },
          { x: 4, y: 11 },
          { x: 5, y: 11 },
        ],
      };

      expect(collisionSystem.canMove(tetromino, 0, 1)).toBe(true);
    });

    it('should block move left at left wall', () => {
      const tetromino: MockTetromino = {
        x: 0,
        y: 10,
        getBlocks: () => [
          { x: 0, y: 10 },
          { x: 1, y: 10 },
          { x: 0, y: 11 },
          { x: 1, y: 11 },
        ],
      };

      expect(collisionSystem.canMove(tetromino, -1, 0)).toBe(false);
    });

    it('should block move right at right wall', () => {
      const tetromino: MockTetromino = {
        x: 8,
        y: 10,
        getBlocks: () => [
          { x: 8, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 11 },
          { x: 9, y: 11 },
        ],
      };

      expect(collisionSystem.canMove(tetromino, 1, 0)).toBe(false);
    });

    it('should block move down at floor', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 18,
        getBlocks: () => [
          { x: 4, y: 18 },
          { x: 5, y: 18 },
          { x: 4, y: 19 },
          { x: 5, y: 19 },
        ],
      };

      expect(collisionSystem.canMove(tetromino, 0, 1)).toBe(false);
    });

    it('should block move into occupied cell', () => {
      // Board with a block at (3, 10)
      const boardWithBlock: MockBoard = {
        isCellEmpty: (x, y) => {
          if (x < 0 || x >= 10 || y < 0 || y >= 20) return false;
          if (x === 3 && y === 10) return false; // Occupied
          return true;
        },
        isValidPosition: (x, y) => x >= 0 && x < 10 && y >= 0 && y < 20,
      };
      const cs = new CollisionSystem(boardWithBlock);

      const tetromino: MockTetromino = {
        x: 4,
        y: 10,
        getBlocks: () => [
          { x: 4, y: 10 },
          { x: 5, y: 10 },
        ],
      };

      expect(cs.canMove(tetromino, -1, 0)).toBe(false);
    });
  });

  // ============================================================
  // 회전 가능 여부 테스트
  // ============================================================
  describe('canRotate', () => {
    it('should allow rotation when space is available', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 10,
        getBlocks: () => [],
      };
      const rotatedBlocks = [
        { x: 5, y: 9 },
        { x: 5, y: 10 },
        { x: 5, y: 11 },
        { x: 4, y: 10 },
      ];

      expect(collisionSystem.canRotate(tetromino, rotatedBlocks)).toBe(true);
    });

    it('should block rotation into wall', () => {
      const tetromino: MockTetromino = {
        x: 0,
        y: 10,
        getBlocks: () => [],
      };
      const rotatedBlocks = [
        { x: -1, y: 10 },
        { x: 0, y: 10 },
        { x: 1, y: 10 },
        { x: 2, y: 10 },
      ];

      expect(collisionSystem.canRotate(tetromino, rotatedBlocks)).toBe(false);
    });

    it('should block rotation into floor', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 18,
        getBlocks: () => [],
      };
      const rotatedBlocks = [
        { x: 4, y: 18 },
        { x: 4, y: 19 },
        { x: 4, y: 20 }, // Out of bounds
        { x: 4, y: 21 },
      ];

      expect(collisionSystem.canRotate(tetromino, rotatedBlocks)).toBe(false);
    });

    it('should block rotation into occupied cell', () => {
      const boardWithBlock: MockBoard = {
        isCellEmpty: (x, y) => {
          if (x < 0 || x >= 10 || y < 0 || y >= 20) return false;
          if (x === 5 && y === 10) return false; // Occupied
          return true;
        },
        isValidPosition: (x, y) => x >= 0 && x < 10 && y >= 0 && y < 20,
      };
      const cs = new CollisionSystem(boardWithBlock);

      const tetromino: MockTetromino = {
        x: 4,
        y: 10,
        getBlocks: () => [],
      };
      const rotatedBlocks = [
        { x: 4, y: 10 },
        { x: 5, y: 10 }, // Occupied
        { x: 6, y: 10 },
        { x: 4, y: 11 },
      ];

      expect(cs.canRotate(tetromino, rotatedBlocks)).toBe(false);
    });
  });

  // ============================================================
  // 충돌 감지 테스트
  // ============================================================
  describe('isColliding', () => {
    it('should return false when tetromino is in valid position', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 10,
        getBlocks: () => [
          { x: 4, y: 10 },
          { x: 5, y: 10 },
          { x: 4, y: 11 },
          { x: 5, y: 11 },
        ],
      };

      expect(collisionSystem.isColliding(tetromino)).toBe(false);
    });

    it('should return true when tetromino overlaps wall', () => {
      const tetromino: MockTetromino = {
        x: -1,
        y: 10,
        getBlocks: () => [
          { x: -1, y: 10 },
          { x: 0, y: 10 },
        ],
      };

      expect(collisionSystem.isColliding(tetromino)).toBe(true);
    });

    it('should return true when tetromino overlaps floor', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 19,
        getBlocks: () => [
          { x: 4, y: 19 },
          { x: 4, y: 20 },
        ],
      };

      expect(collisionSystem.isColliding(tetromino)).toBe(true);
    });

    it('should return true when tetromino overlaps placed block', () => {
      const boardWithBlock: MockBoard = {
        isCellEmpty: (x, y) => {
          if (x < 0 || x >= 10 || y < 0 || y >= 20) return false;
          if (x === 4 && y === 10) return false;
          return true;
        },
        isValidPosition: (x, y) => x >= 0 && x < 10 && y >= 0 && y < 20,
      };
      const cs = new CollisionSystem(boardWithBlock);

      const tetromino: MockTetromino = {
        x: 4,
        y: 10,
        getBlocks: () => [{ x: 4, y: 10 }],
      };

      expect(cs.isColliding(tetromino)).toBe(true);
    });
  });

  // ============================================================
  // 바닥 감지 테스트
  // ============================================================
  describe('isAtBottom', () => {
    it('should return true when tetromino cannot move down', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 18,
        getBlocks: () => [
          { x: 4, y: 18 },
          { x: 5, y: 18 },
          { x: 4, y: 19 },
          { x: 5, y: 19 },
        ],
      };

      expect(collisionSystem.isAtBottom(tetromino)).toBe(true);
    });

    it('should return false when tetromino can move down', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 10,
        getBlocks: () => [
          { x: 4, y: 10 },
          { x: 5, y: 10 },
          { x: 4, y: 11 },
          { x: 5, y: 11 },
        ],
      };

      expect(collisionSystem.isAtBottom(tetromino)).toBe(false);
    });

    it('should return true when resting on placed blocks', () => {
      const boardWithBlock: MockBoard = {
        isCellEmpty: (x, y) => {
          if (x < 0 || x >= 10 || y < 0 || y >= 20) return false;
          if (y === 15) return false; // Row 15 is full
          return true;
        },
        isValidPosition: (x, y) => x >= 0 && x < 10 && y >= 0 && y < 20,
      };
      const cs = new CollisionSystem(boardWithBlock);

      const tetromino: MockTetromino = {
        x: 4,
        y: 13,
        getBlocks: () => [
          { x: 4, y: 13 },
          { x: 5, y: 13 },
          { x: 4, y: 14 },
          { x: 5, y: 14 },
        ],
      };

      expect(cs.isAtBottom(tetromino)).toBe(true);
    });
  });

  // ============================================================
  // 게임 오버 감지 테스트
  // ============================================================
  describe('isGameOver', () => {
    it('should return false when spawn position is clear', () => {
      const tetromino: MockTetromino = {
        x: 3,
        y: 0,
        getBlocks: () => [
          { x: 3, y: 0 },
          { x: 4, y: 0 },
          { x: 5, y: 0 },
          { x: 4, y: 1 },
        ],
      };

      expect(collisionSystem.isGameOver(tetromino)).toBe(false);
    });

    it('should return true when spawn position is blocked', () => {
      const boardWithTopBlock: MockBoard = {
        isCellEmpty: (x, y) => {
          if (x < 0 || x >= 10 || y < 0 || y >= 20) return false;
          if (y === 0) return false; // Top row is full
          return true;
        },
        isValidPosition: (x, y) => x >= 0 && x < 10 && y >= 0 && y < 20,
      };
      const cs = new CollisionSystem(boardWithTopBlock);

      const tetromino: MockTetromino = {
        x: 3,
        y: 0,
        getBlocks: () => [
          { x: 3, y: 0 },
          { x: 4, y: 0 },
        ],
      };

      expect(cs.isGameOver(tetromino)).toBe(true);
    });
  });

  // ============================================================
  // 고스트 위치 테스트
  // ============================================================
  describe('getGhostPosition', () => {
    it('should return y position where tetromino would land', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 0,
        getBlocks: () => [
          { x: 4, y: 0 },
          { x: 5, y: 0 },
          { x: 4, y: 1 },
          { x: 5, y: 1 },
        ],
      };

      // O piece at y=0, should land at y=18 (bottom of board - 2)
      expect(collisionSystem.getGhostPosition(tetromino)).toBe(18);
    });

    it('should account for placed blocks', () => {
      const boardWithBlock: MockBoard = {
        isCellEmpty: (x, y) => {
          if (x < 0 || x >= 10 || y < 0 || y >= 20) return false;
          if (y >= 15) return false; // Rows 15-19 are filled
          return true;
        },
        isValidPosition: (x, y) => x >= 0 && x < 10 && y >= 0 && y < 20,
      };
      const cs = new CollisionSystem(boardWithBlock);

      const tetromino: MockTetromino = {
        x: 4,
        y: 0,
        getBlocks: () => [
          { x: 4, y: 0 },
          { x: 5, y: 0 },
          { x: 4, y: 1 },
          { x: 5, y: 1 },
        ],
      };

      // Should land at y=13 (just above filled rows)
      expect(cs.getGhostPosition(tetromino)).toBe(13);
    });

    it('should return current y if already at bottom', () => {
      const tetromino: MockTetromino = {
        x: 4,
        y: 18,
        getBlocks: () => [
          { x: 4, y: 18 },
          { x: 5, y: 18 },
          { x: 4, y: 19 },
          { x: 5, y: 19 },
        ],
      };

      expect(collisionSystem.getGhostPosition(tetromino)).toBe(18);
    });
  });
});
