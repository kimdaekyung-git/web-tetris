/**
 * Collision System
 *
 * 테트로미노와 보드 간의 충돌 감지 시스템
 * 이동, 회전, 배치 가능 여부 판단
 */

import type { Position } from '../../types/game.types';

/**
 * Board interface (for dependency injection)
 */
export interface IBoard {
  isCellEmpty(x: number, y: number): boolean;
  isValidPosition(x: number, y: number): boolean;
}

/**
 * Tetromino interface (for collision checking)
 */
export interface ITetromino {
  x: number;
  y: number;
  getBlocks(): Position[];
}

export class CollisionSystem {
  constructor(public readonly board: IBoard) {}

  /**
   * 테트로미노가 특정 방향으로 이동 가능한지 확인
   * @param tetromino 테트로미노
   * @param dx x 방향 이동량
   * @param dy y 방향 이동량
   */
  canMove(tetromino: ITetromino, dx: number, dy: number): boolean {
    const blocks = tetromino.getBlocks();

    for (const block of blocks) {
      const newX = block.x + dx;
      const newY = block.y + dy;

      // 범위 밖이거나 차있는 셀이면 이동 불가
      if (!this.board.isCellEmpty(newX, newY)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 테트로미노가 회전 가능한지 확인
   * @param _tetromino 테트로미노 (미사용)
   * @param rotatedBlocks 회전 후 블록 위치들
   */
  canRotate(_tetromino: ITetromino, rotatedBlocks: Position[]): boolean {
    for (const block of rotatedBlocks) {
      // 범위 밖이거나 차있는 셀이면 회전 불가
      if (!this.board.isCellEmpty(block.x, block.y)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 테트로미노가 현재 위치에서 충돌하는지 확인
   */
  isColliding(tetromino: ITetromino): boolean {
    const blocks = tetromino.getBlocks();

    for (const block of blocks) {
      // 범위 밖이거나 차있는 셀이면 충돌
      if (!this.board.isCellEmpty(block.x, block.y)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 테트로미노가 바닥에 닿았는지 확인
   * (아래로 더 이동할 수 없으면 바닥)
   */
  isAtBottom(tetromino: ITetromino): boolean {
    return !this.canMove(tetromino, 0, 1);
  }

  /**
   * 게임 오버 조건 확인
   * (스폰 위치에서 바로 충돌하면 게임 오버)
   */
  isGameOver(tetromino: ITetromino): boolean {
    return this.isColliding(tetromino);
  }

  /**
   * 고스트 블록 위치 계산 (하드 드롭 미리보기)
   * @returns 테트로미노가 착지할 y 좌표
   */
  getGhostPosition(tetromino: ITetromino): number {
    let ghostY = tetromino.y;

    // 테트로미노 복사 (y 위치만 변경)
    const ghostTetromino: ITetromino = {
      x: tetromino.x,
      y: ghostY,
      getBlocks: () => {
        const originalBlocks = tetromino.getBlocks();
        const deltaY = ghostY - tetromino.y;
        return originalBlocks.map((block) => ({
          x: block.x,
          y: block.y + deltaY,
        }));
      },
    };

    // 아래로 계속 이동하면서 바닥 찾기
    while (this.canMove(ghostTetromino, 0, 1)) {
      ghostY++;
      ghostTetromino.y = ghostY;
    }

    return ghostY;
  }
}
