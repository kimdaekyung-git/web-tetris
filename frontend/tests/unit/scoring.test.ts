/**
 * Scoring Tests (RED Phase)
 *
 * 점수 및 레벨 시스템 테스트 케이스
 * Phase 2, T2.1에서 GREEN으로 전환 예정
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreManager } from '../../src/game/objects/ScoreManager';

// NES Tetris drop speeds (frames per grid cell)
const NES_FRAME_TABLE: Record<number, number> = {
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
  10: 5, // Level 10+
};

// NES scoring formula: base points × (level + 1)
// (Not used in tests, but kept for reference)

describe('ScoreManager', () => {
  let scoreManager: InstanceType<typeof ScoreManager>;

  beforeEach(() => {
    scoreManager = new ScoreManager();
  });

  // ============================================================
  // 초기화 테스트
  // ============================================================
  describe('initialization', () => {
    it('should start with score 0', () => {
      expect(scoreManager.score).toBe(0);
    });

    it('should start at level 1', () => {
      expect(scoreManager.level).toBe(1);
    });

    it('should start with 0 lines', () => {
      expect(scoreManager.lines).toBe(0);
    });
  });

  // ============================================================
  // 점수 계산 테스트 (NES 공식)
  // ============================================================
  describe('scoring (NES formula)', () => {
    it('should award 40 × (level+1) points for single line', () => {
      scoreManager.addLines(1);
      // Level 1: 40 × (1+1) = 80
      expect(scoreManager.score).toBe(80);
    });

    it('should award 100 × (level+1) points for double', () => {
      scoreManager.addLines(2);
      // Level 1: 100 × (1+1) = 200
      expect(scoreManager.score).toBe(200);
    });

    it('should award 300 × (level+1) points for triple', () => {
      scoreManager.addLines(3);
      // Level 1: 300 × (1+1) = 600
      expect(scoreManager.score).toBe(600);
    });

    it('should award 1200 × (level+1) points for tetris (4 lines)', () => {
      scoreManager.addLines(4);
      // Level 1: 1200 × (1+1) = 2400
      expect(scoreManager.score).toBe(2400);
    });

    it('should increase score based on current level', () => {
      // Manually set level to 5 by clearing 40 lines
      for (let i = 0; i < 10; i++) {
        scoreManager.addLines(4); // 40 lines total
      }
      // Should be at level 5 now
      const previousScore = scoreManager.score;

      scoreManager.addLines(1);
      // Level 5: 40 × (5+1) = 240
      expect(scoreManager.score - previousScore).toBe(240);
    });

    it('should accumulate score correctly', () => {
      scoreManager.addLines(1); // 80
      scoreManager.addLines(2); // 200
      scoreManager.addLines(1); // 80
      expect(scoreManager.score).toBe(360);
    });
  });

  // ============================================================
  // 라인 카운트 테스트
  // ============================================================
  describe('lines', () => {
    it('should track total lines cleared', () => {
      scoreManager.addLines(2);
      expect(scoreManager.lines).toBe(2);
    });

    it('should accumulate lines', () => {
      scoreManager.addLines(1);
      scoreManager.addLines(3);
      scoreManager.addLines(2);
      expect(scoreManager.lines).toBe(6);
    });
  });

  // ============================================================
  // 레벨업 테스트
  // ============================================================
  describe('level up', () => {
    it('should level up after 10 lines', () => {
      for (let i = 0; i < 10; i++) {
        scoreManager.addLines(1);
      }
      expect(scoreManager.level).toBe(2);
    });

    it('should level up to level 3 after 20 lines', () => {
      for (let i = 0; i < 5; i++) {
        scoreManager.addLines(4); // 20 lines total
      }
      expect(scoreManager.level).toBe(3);
    });

    it('should not exceed level 10', () => {
      // Clear 100 lines
      for (let i = 0; i < 25; i++) {
        scoreManager.addLines(4);
      }
      expect(scoreManager.level).toBeLessThanOrEqual(10);
    });

    it('should calculate level as floor(lines/10) + 1, capped at 10', () => {
      scoreManager.addLines(4); // 4 lines -> level 1
      expect(scoreManager.level).toBe(1);

      scoreManager.addLines(4); // 8 lines -> level 1
      expect(scoreManager.level).toBe(1);

      scoreManager.addLines(4); // 12 lines -> level 2
      expect(scoreManager.level).toBe(2);

      scoreManager.addLines(4); // 16 lines -> level 2
      expect(scoreManager.level).toBe(2);

      scoreManager.addLines(4); // 20 lines -> level 3
      expect(scoreManager.level).toBe(3);
    });
  });

  // ============================================================
  // 낙하 속도 테스트 (NES 프레임 테이블)
  // ============================================================
  describe('drop speed (NES frame table)', () => {
    it('should return correct speed for level 1', () => {
      expect(scoreManager.getDropSpeed()).toBe(NES_FRAME_TABLE[1]);
    });

    it('should return faster speed after level up', () => {
      const initialSpeed = scoreManager.getDropSpeed();

      // Level up to 2
      for (let i = 0; i < 10; i++) {
        scoreManager.addLines(1);
      }

      const newSpeed = scoreManager.getDropSpeed();
      expect(newSpeed).toBeLessThan(initialSpeed);
    });

    it('should match NES frame table for each level', () => {
      // Test levels 1-10
      for (let targetLevel = 1; targetLevel <= 10; targetLevel++) {
        const sm = new ScoreManager();
        // Clear lines to reach target level
        const linesToClear = (targetLevel - 1) * 10;
        for (let i = 0; i < linesToClear; i++) {
          sm.addLines(1);
        }

        const expectedSpeed = NES_FRAME_TABLE[Math.min(targetLevel, 10)];
        expect(sm.getDropSpeed()).toBe(expectedSpeed);
      }
    });

    it('should have maximum speed at level 10', () => {
      // Clear 90 lines to reach level 10
      for (let i = 0; i < 90; i++) {
        scoreManager.addLines(1);
      }

      expect(scoreManager.getDropSpeed()).toBe(NES_FRAME_TABLE[10]);
    });
  });

  // ============================================================
  // 리셋 테스트
  // ============================================================
  describe('reset', () => {
    it('should reset score to 0', () => {
      scoreManager.addLines(4);
      scoreManager.reset();
      expect(scoreManager.score).toBe(0);
    });

    it('should reset level to 1', () => {
      for (let i = 0; i < 20; i++) {
        scoreManager.addLines(1);
      }
      scoreManager.reset();
      expect(scoreManager.level).toBe(1);
    });

    it('should reset lines to 0', () => {
      scoreManager.addLines(10);
      scoreManager.reset();
      expect(scoreManager.lines).toBe(0);
    });
  });

  // ============================================================
  // 통계 조회 테스트
  // ============================================================
  describe('getStats', () => {
    it('should return current stats object', () => {
      scoreManager.addLines(4);
      const stats = scoreManager.getStats();

      expect(stats).toEqual({
        score: expect.any(Number),
        level: expect.any(Number),
        lines: expect.any(Number),
        playTimeSeconds: expect.any(Number),
      });
    });

    it('should return accurate stats', () => {
      scoreManager.addLines(1);
      scoreManager.addLines(2);
      scoreManager.addLines(3);
      // Lines: 6, Level: 1
      // Score: 80 + 200 + 600 = 880

      const stats = scoreManager.getStats();
      expect(stats.lines).toBe(6);
      expect(stats.level).toBe(1);
      expect(stats.score).toBe(880);
    });
  });

  // ============================================================
  // 엣지 케이스 테스트
  // ============================================================
  describe('edge cases', () => {
    it('should handle 0 lines without error', () => {
      expect(() => scoreManager.addLines(0)).not.toThrow();
      expect(scoreManager.score).toBe(0);
      expect(scoreManager.lines).toBe(0);
    });

    it('should not accept negative lines', () => {
      scoreManager.addLines(-1);
      expect(scoreManager.lines).toBe(0);
      expect(scoreManager.score).toBe(0);
    });

    it('should cap lines at 4', () => {
      // Even if somehow 5+ lines cleared, treat as 4
      scoreManager.addLines(5);
      // Should be treated as tetris (4 lines)
      expect(scoreManager.score).toBe(2400); // 1200 × 2
    });
  });
});
