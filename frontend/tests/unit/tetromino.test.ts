/**
 * Tetromino Tests (RED Phase)
 *
 * 테트로미노 클래스 테스트 케이스
 * Phase 1, T1.1에서 GREEN으로 전환 예정
 */

import { describe, it, expect } from 'vitest';
import { Tetromino } from '../../src/game/objects/Tetromino';
import type { TetrominoType } from '../../src/types/game.types';

describe('Tetromino', () => {
  // ============================================================
  // 생성 테스트
  // ============================================================
  describe('creation', () => {
    it('should create I tetromino', () => {
      const tetromino = new Tetromino('I');
      expect(tetromino).toBeDefined();
      expect(tetromino.type).toBe('I');
    });

    it('should create O tetromino', () => {
      const tetromino = new Tetromino('O');
      expect(tetromino).toBeDefined();
      expect(tetromino.type).toBe('O');
    });

    it('should create T tetromino', () => {
      const tetromino = new Tetromino('T');
      expect(tetromino).toBeDefined();
      expect(tetromino.type).toBe('T');
    });

    it('should create S tetromino', () => {
      const tetromino = new Tetromino('S');
      expect(tetromino).toBeDefined();
      expect(tetromino.type).toBe('S');
    });

    it('should create Z tetromino', () => {
      const tetromino = new Tetromino('Z');
      expect(tetromino).toBeDefined();
      expect(tetromino.type).toBe('Z');
    });

    it('should create J tetromino', () => {
      const tetromino = new Tetromino('J');
      expect(tetromino).toBeDefined();
      expect(tetromino.type).toBe('J');
    });

    it('should create L tetromino', () => {
      const tetromino = new Tetromino('L');
      expect(tetromino).toBeDefined();
      expect(tetromino.type).toBe('L');
    });

    it('should initialize with rotation 0', () => {
      const tetromino = new Tetromino('T');
      expect(tetromino.rotation).toBe(0);
    });

    it('should initialize at spawn position (x=3, y=0)', () => {
      const tetromino = new Tetromino('T');
      expect(tetromino.x).toBe(3);
      expect(tetromino.y).toBe(0);
    });
  });

  // ============================================================
  // 모양 테스트
  // ============================================================
  describe('getShape', () => {
    it('should return 4x4 matrix for I tetromino', () => {
      const tetromino = new Tetromino('I');
      const shape = tetromino.getShape();
      expect(shape).toHaveLength(4);
      expect(shape[0]).toHaveLength(4);
    });

    it('should return correct I shape at rotation 0', () => {
      const tetromino = new Tetromino('I');
      const shape = tetromino.getShape();
      // I piece horizontal: [0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]
      expect(shape[1]).toEqual([1, 1, 1, 1]);
    });

    it('should return 3x3 matrix for T tetromino', () => {
      const tetromino = new Tetromino('T');
      const shape = tetromino.getShape();
      expect(shape).toHaveLength(3);
      expect(shape[0]).toHaveLength(3);
    });

    it('should return correct T shape at rotation 0', () => {
      const tetromino = new Tetromino('T');
      const shape = tetromino.getShape();
      // T piece: [0,1,0], [1,1,1], [0,0,0]
      expect(shape[0]).toEqual([0, 1, 0]);
      expect(shape[1]).toEqual([1, 1, 1]);
    });

    it('should return 2x2 matrix for O tetromino', () => {
      const tetromino = new Tetromino('O');
      const shape = tetromino.getShape();
      expect(shape).toHaveLength(2);
      expect(shape[0]).toHaveLength(2);
    });

    it('should return all 1s for O tetromino', () => {
      const tetromino = new Tetromino('O');
      const shape = tetromino.getShape();
      expect(shape).toEqual([
        [1, 1],
        [1, 1],
      ]);
    });
  });

  // ============================================================
  // 회전 테스트
  // ============================================================
  describe('rotation', () => {
    it('should rotate clockwise', () => {
      const tetromino = new Tetromino('T');
      expect(tetromino.rotation).toBe(0);
      tetromino.rotateClockwise();
      expect(tetromino.rotation).toBe(1);
    });

    it('should wrap rotation from 3 to 0', () => {
      const tetromino = new Tetromino('T');
      tetromino.rotateClockwise(); // 0 -> 1
      tetromino.rotateClockwise(); // 1 -> 2
      tetromino.rotateClockwise(); // 2 -> 3
      tetromino.rotateClockwise(); // 3 -> 0
      expect(tetromino.rotation).toBe(0);
    });

    it('should rotate counter-clockwise', () => {
      const tetromino = new Tetromino('T');
      tetromino.rotateCounterClockwise();
      expect(tetromino.rotation).toBe(3);
    });

    it('should change shape after rotation', () => {
      const tetromino = new Tetromino('T');
      const originalShape = tetromino.getShape();
      tetromino.rotateClockwise();
      const rotatedShape = tetromino.getShape();
      expect(rotatedShape).not.toEqual(originalShape);
    });

    it('should not change O tetromino shape after rotation', () => {
      const tetromino = new Tetromino('O');
      const originalShape = tetromino.getShape();
      tetromino.rotateClockwise();
      const rotatedShape = tetromino.getShape();
      expect(rotatedShape).toEqual(originalShape);
    });

    it('should return to original shape after 4 rotations', () => {
      const tetromino = new Tetromino('T');
      const originalShape = JSON.stringify(tetromino.getShape());
      tetromino.rotateClockwise();
      tetromino.rotateClockwise();
      tetromino.rotateClockwise();
      tetromino.rotateClockwise();
      expect(JSON.stringify(tetromino.getShape())).toBe(originalShape);
    });
  });

  // ============================================================
  // 이동 테스트
  // ============================================================
  describe('movement', () => {
    it('should move left', () => {
      const tetromino = new Tetromino('T');
      const initialX = tetromino.x;
      tetromino.moveLeft();
      expect(tetromino.x).toBe(initialX - 1);
    });

    it('should move right', () => {
      const tetromino = new Tetromino('T');
      const initialX = tetromino.x;
      tetromino.moveRight();
      expect(tetromino.x).toBe(initialX + 1);
    });

    it('should move down', () => {
      const tetromino = new Tetromino('T');
      const initialY = tetromino.y;
      tetromino.moveDown();
      expect(tetromino.y).toBe(initialY + 1);
    });
  });

  // ============================================================
  // 블록 좌표 테스트
  // ============================================================
  describe('getBlocks', () => {
    it('should return array of block positions', () => {
      const tetromino = new Tetromino('T');
      const blocks = tetromino.getBlocks();
      expect(Array.isArray(blocks)).toBe(true);
      expect(blocks.length).toBeGreaterThan(0);
    });

    it('should return 4 blocks for all tetrominoes', () => {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      types.forEach((type) => {
        const tetromino = new Tetromino(type);
        const blocks = tetromino.getBlocks();
        expect(blocks).toHaveLength(4);
      });
    });

    it('should return world coordinates based on position', () => {
      const tetromino = new Tetromino('O');
      // O is at spawn (3, 0) and is 2x2 of 1s
      const blocks = tetromino.getBlocks();
      // Should include positions like (3,0), (4,0), (3,1), (4,1)
      expect(blocks).toContainEqual({ x: 3, y: 0 });
      expect(blocks).toContainEqual({ x: 4, y: 0 });
    });

    it('should update block positions after movement', () => {
      const tetromino = new Tetromino('O');
      tetromino.moveRight();
      const blocks = tetromino.getBlocks();
      expect(blocks).toContainEqual({ x: 4, y: 0 });
      expect(blocks).toContainEqual({ x: 5, y: 0 });
    });
  });
});
