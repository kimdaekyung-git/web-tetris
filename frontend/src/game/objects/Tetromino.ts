/**
 * Tetromino Class
 *
 * 테트로미노 블록을 나타내는 클래스
 * 회전, 이동, 모양 데이터 관리
 */

import type { TetrominoType, Rotation, Position } from '../../types/game.types';
import {
  TETROMINO_SHAPES,
  SPAWN_X,
  SPAWN_Y,
  type ShapeMatrix,
} from '../config/tetrominos';

export class Tetromino {
  public readonly type: TetrominoType;
  public rotation: Rotation;
  public x: number;
  public y: number;

  constructor(type: TetrominoType) {
    this.type = type;
    this.rotation = 0;
    this.x = SPAWN_X;
    this.y = SPAWN_Y;
  }

  /**
   * 현재 회전 상태의 모양 매트릭스를 반환
   */
  getShape(): ShapeMatrix {
    return TETROMINO_SHAPES[this.type][this.rotation];
  }

  /**
   * 시계방향 회전
   */
  rotateClockwise(): void {
    this.rotation = ((this.rotation + 1) % 4) as Rotation;
  }

  /**
   * 반시계방향 회전
   */
  rotateCounterClockwise(): void {
    this.rotation = ((this.rotation + 3) % 4) as Rotation;
  }

  /**
   * 왼쪽으로 이동
   */
  moveLeft(): void {
    this.x -= 1;
  }

  /**
   * 오른쪽으로 이동
   */
  moveRight(): void {
    this.x += 1;
  }

  /**
   * 아래로 이동
   */
  moveDown(): void {
    this.y += 1;
  }

  /**
   * 현재 테트로미노의 블록 좌표들을 절대 좌표로 반환
   * @returns 블록 위치 배열
   */
  getBlocks(): Position[] {
    const shape = this.getShape();
    const blocks: Position[] = [];

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          blocks.push({
            x: this.x + col,
            y: this.y + row,
          });
        }
      }
    }

    return blocks;
  }
}
