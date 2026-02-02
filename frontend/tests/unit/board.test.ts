/**
 * Board Tests (RED Phase)
 *
 * 게임 보드 테스트 케이스
 * Phase 1, T1.2에서 GREEN으로 전환 예정
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../../src/game/objects/Board';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../src/game/config/constants';

describe('Board', () => {
  let board: InstanceType<typeof Board>;

  beforeEach(() => {
    board = new Board();
  });

  // ============================================================
  // 초기화 테스트
  // ============================================================
  describe('initialization', () => {
    it('should create a board with correct dimensions', () => {
      expect(board.width).toBe(BOARD_WIDTH);
      expect(board.height).toBe(BOARD_HEIGHT);
    });

    it('should create a 10x20 grid', () => {
      expect(board.width).toBe(10);
      expect(board.height).toBe(20);
    });

    it('should initialize with all cells empty (0)', () => {
      for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
          expect(board.getCell(x, y)).toBe(0);
        }
      }
    });

    it('should have grid property as 2D array', () => {
      expect(Array.isArray(board.grid)).toBe(true);
      expect(board.grid).toHaveLength(BOARD_HEIGHT);
      expect(board.grid[0]).toHaveLength(BOARD_WIDTH);
    });
  });

  // ============================================================
  // 셀 접근 테스트
  // ============================================================
  describe('cell access', () => {
    it('should get cell value at valid position', () => {
      const value = board.getCell(0, 0);
      expect(typeof value).toBe('number');
    });

    it('should set cell value', () => {
      board.setCell(5, 10, 1);
      expect(board.getCell(5, 10)).toBe(1);
    });

    it('should set cell with color value', () => {
      const color = 0x00f0f0; // Cyan for I piece
      board.setCell(3, 5, color);
      expect(board.getCell(3, 5)).toBe(color);
    });
  });

  // ============================================================
  // 위치 검증 테스트
  // ============================================================
  describe('position validation', () => {
    it('should return true for valid position (0, 0)', () => {
      expect(board.isValidPosition(0, 0)).toBe(true);
    });

    it('should return true for valid position (9, 19)', () => {
      expect(board.isValidPosition(9, 19)).toBe(true);
    });

    it('should return false for negative x', () => {
      expect(board.isValidPosition(-1, 0)).toBe(false);
    });

    it('should return false for negative y', () => {
      expect(board.isValidPosition(0, -1)).toBe(false);
    });

    it('should return false for x >= width', () => {
      expect(board.isValidPosition(10, 0)).toBe(false);
    });

    it('should return false for y >= height', () => {
      expect(board.isValidPosition(0, 20)).toBe(false);
    });
  });

  // ============================================================
  // 셀 상태 테스트
  // ============================================================
  describe('cell state', () => {
    it('should return true for empty cell', () => {
      expect(board.isCellEmpty(0, 0)).toBe(true);
    });

    it('should return false for filled cell', () => {
      board.setCell(5, 5, 1);
      expect(board.isCellEmpty(5, 5)).toBe(false);
    });

    it('should return false for out of bounds (treat as blocked)', () => {
      expect(board.isCellEmpty(-1, 0)).toBe(false);
      expect(board.isCellEmpty(10, 0)).toBe(false);
      expect(board.isCellEmpty(0, 20)).toBe(false);
    });
  });

  // ============================================================
  // 보드 초기화 테스트
  // ============================================================
  describe('clear', () => {
    it('should clear all cells', () => {
      // Fill some cells
      board.setCell(0, 0, 1);
      board.setCell(5, 10, 1);
      board.setCell(9, 19, 1);

      board.clear();

      expect(board.getCell(0, 0)).toBe(0);
      expect(board.getCell(5, 10)).toBe(0);
      expect(board.getCell(9, 19)).toBe(0);
    });
  });

  // ============================================================
  // 블록 배치 테스트
  // ============================================================
  describe('placeBlocks', () => {
    it('should place blocks on the board', () => {
      const blocks = [
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
        { x: 6, y: 0 },
      ];
      const color = 0x00f0f0;

      board.placeBlocks(blocks, color);

      expect(board.getCell(3, 0)).toBe(color);
      expect(board.getCell(4, 0)).toBe(color);
      expect(board.getCell(5, 0)).toBe(color);
      expect(board.getCell(6, 0)).toBe(color);
    });

    it('should not place blocks outside valid positions', () => {
      const blocks = [
        { x: -1, y: 0 },
        { x: 10, y: 0 },
      ];

      // Should not throw, just ignore invalid positions
      expect(() => board.placeBlocks(blocks, 1)).not.toThrow();
    });
  });

  // ============================================================
  // 완성된 행 감지 테스트
  // ============================================================
  describe('getFilledRows', () => {
    it('should return empty array when no rows are filled', () => {
      expect(board.getFilledRows()).toEqual([]);
    });

    it('should detect single filled row', () => {
      // Fill bottom row completely
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board.setCell(x, 19, 1);
      }

      const filledRows = board.getFilledRows();
      expect(filledRows).toContain(19);
    });

    it('should detect multiple filled rows', () => {
      // Fill bottom two rows
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board.setCell(x, 18, 1);
        board.setCell(x, 19, 1);
      }

      const filledRows = board.getFilledRows();
      expect(filledRows).toContain(18);
      expect(filledRows).toContain(19);
      expect(filledRows).toHaveLength(2);
    });

    it('should not detect partially filled row', () => {
      // Fill row except one cell
      for (let x = 0; x < BOARD_WIDTH - 1; x++) {
        board.setCell(x, 19, 1);
      }

      const filledRows = board.getFilledRows();
      expect(filledRows).not.toContain(19);
    });
  });

  // ============================================================
  // 행 제거 테스트
  // ============================================================
  describe('clearRows', () => {
    it('should clear specified rows', () => {
      // Fill a row
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board.setCell(x, 19, 1);
      }

      board.clearRows([19]);

      // Row should be empty
      for (let x = 0; x < BOARD_WIDTH; x++) {
        expect(board.getCell(x, 19)).toBe(0);
      }
    });

    it('should drop rows above cleared row', () => {
      // Fill row 18 with color A
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board.setCell(x, 18, 0xaaaaaa);
      }

      // Fill row 19 (to be cleared)
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board.setCell(x, 19, 0xbbbbbb);
      }

      board.clearRows([19]);

      // Row 18's content should now be at row 19
      for (let x = 0; x < BOARD_WIDTH; x++) {
        expect(board.getCell(x, 19)).toBe(0xaaaaaa);
      }
    });

    it('should handle clearing multiple rows', () => {
      // Fill rows 17, 18, 19
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board.setCell(x, 17, 0x111111);
        board.setCell(x, 18, 0x222222);
        board.setCell(x, 19, 0x333333);
      }

      // Clear middle row
      board.clearRows([18, 19]);

      // Row 17's content should drop down by 2
      for (let x = 0; x < BOARD_WIDTH; x++) {
        expect(board.getCell(x, 19)).toBe(0x111111);
      }
    });

    it('should add empty rows at top after clearing', () => {
      // Fill rows 18 and 19
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board.setCell(x, 18, 1);
        board.setCell(x, 19, 1);
      }

      board.clearRows([18, 19]);

      // Top 2 rows should be empty
      for (let x = 0; x < BOARD_WIDTH; x++) {
        expect(board.getCell(x, 0)).toBe(0);
        expect(board.getCell(x, 1)).toBe(0);
      }
    });
  });
});
