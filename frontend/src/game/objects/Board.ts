/**
 * Board Class
 *
 * 테트리스 게임 보드를 관리하는 클래스
 * 10x20 그리드, 블록 배치, 라인 클리어 로직 포함
 */

import { BOARD_WIDTH, BOARD_HEIGHT } from '../config/constants';
import type { Position } from '../../types/game.types';

export class Board {
  public readonly width: number;
  public readonly height: number;
  public grid: number[][];

  constructor() {
    this.width = BOARD_WIDTH;
    this.height = BOARD_HEIGHT;
    this.grid = this.createEmptyGrid();
  }

  /**
   * 빈 그리드 생성
   */
  private createEmptyGrid(): number[][] {
    return Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => 0)
    );
  }

  /**
   * 특정 셀의 값 가져오기
   */
  getCell(x: number, y: number): number {
    if (!this.isValidPosition(x, y)) {
      return -1; // Invalid position
    }
    return this.grid[y][x];
  }

  /**
   * 특정 셀에 값 설정
   */
  setCell(x: number, y: number, value: number): void {
    if (this.isValidPosition(x, y)) {
      this.grid[y][x] = value;
    }
  }

  /**
   * 위치가 보드 범위 내에 있는지 확인
   */
  isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * 특정 셀이 비어있는지 확인
   * 범위 밖은 차있는 것으로 간주 (충돌 감지용)
   */
  isCellEmpty(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) {
      return false; // Out of bounds = blocked
    }
    return this.grid[y][x] === 0;
  }

  /**
   * 보드 전체를 빈 상태로 초기화
   */
  clear(): void {
    this.grid = this.createEmptyGrid();
  }

  /**
   * 블록들을 보드에 배치
   */
  placeBlocks(blocks: Position[], color: number): void {
    for (const block of blocks) {
      if (this.isValidPosition(block.x, block.y)) {
        this.grid[block.y][block.x] = color;
      }
    }
  }

  /**
   * 완성된 행(모든 칸이 채워진 행) 찾기
   */
  getFilledRows(): number[] {
    const filledRows: number[] = [];

    for (let y = 0; y < this.height; y++) {
      let isFilled = true;
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] === 0) {
          isFilled = false;
          break;
        }
      }
      if (isFilled) {
        filledRows.push(y);
      }
    }

    return filledRows;
  }

  /**
   * 지정된 행들을 제거하고 위의 행들을 아래로 내림
   * @param rows 제거할 행 번호 배열
   */
  clearRows(rows: number[]): void {
    if (rows.length === 0) return;

    // 제거할 행을 Set으로 변환 (빠른 검색)
    const rowsToRemove = new Set(rows);

    // 제거할 행을 제외한 나머지 행들만 필터링
    const remainingRows = this.grid.filter((_, index) => !rowsToRemove.has(index));

    // 제거된 행 수만큼 맨 위에 빈 행 추가
    const emptyRows = Array.from({ length: rows.length }, () =>
      Array.from({ length: this.width }, () => 0)
    );

    // 새 그리드 = 빈 행들 + 남은 행들
    this.grid = [...emptyRows, ...remainingRows];
  }
}
