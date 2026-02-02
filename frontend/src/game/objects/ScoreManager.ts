/**
 * Score Manager
 *
 * 점수, 레벨, 라인 관리
 * NES 테트리스 점수 시스템 구현
 */

import {
  SCORE_TABLE,
  NES_FRAME_TABLE,
  MAX_LEVEL,
  LINES_PER_LEVEL,
} from '../config/levels';

export class ScoreManager {
  public score: number;
  public level: number;
  public lines: number;
  private startTime: number;

  constructor() {
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.startTime = Date.now();
  }

  /**
   * 라인 클리어 추가 및 점수 계산
   * @param count 클리어된 라인 수 (1-4)
   */
  addLines(count: number): void {
    // Validate input
    if (count < 0) {
      return;
    }

    // Cap at 4 lines (tetris)
    const validCount = Math.min(count, 4);

    if (validCount === 0) {
      return;
    }

    // Add lines
    this.lines += validCount;

    // Calculate score (NES formula: base × (level + 1))
    const baseScore = SCORE_TABLE[validCount] || 0;
    const points = baseScore * (this.level + 1);
    this.score += points;

    // Update level
    this.updateLevel();
  }

  /**
   * 레벨 업데이트
   * 레벨 = floor(lines / 10) + 1, 최대 10
   */
  private updateLevel(): void {
    const newLevel = Math.floor(this.lines / LINES_PER_LEVEL) + 1;
    this.level = Math.min(newLevel, MAX_LEVEL);
  }

  /**
   * 현재 레벨의 낙하 속도 반환 (프레임 단위)
   */
  getDropSpeed(): number {
    const cappedLevel = Math.min(this.level, MAX_LEVEL);
    return NES_FRAME_TABLE[cappedLevel];
  }

  /**
   * 게임 상태 초기화
   */
  reset(): void {
    this.score = 0;
    this.level = 1;
    this.lines = 0;
  }

  /**
   * 플레이 시간 반환 (초 단위)
   */
  getPlayTimeSeconds(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * 현재 통계 반환
   */
  getStats(): { score: number; level: number; lines: number; playTimeSeconds: number } {
    return {
      score: this.score,
      level: this.level,
      lines: this.lines,
      playTimeSeconds: this.getPlayTimeSeconds(),
    };
  }
}
