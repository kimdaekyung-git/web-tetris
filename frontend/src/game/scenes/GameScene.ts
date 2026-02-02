import Phaser from 'phaser';
import { BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE, COLORS } from '../config/game.config';

export class GameScene extends Phaser.Scene {
  // Game state (will be expanded in Phase 1)
  private score: number = 0;
  private level: number = 1;
  private lines: number = 0;
  private isPaused: boolean = false;
  private isGameOver: boolean = false;

  // UI elements
  private scoreText?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;
  private linesText?: Phaser.GameObjects.Text;
  private boardGraphics?: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.resetGameState();
    this.createBoard();
    this.createUI();
    this.setupInput();

    // Placeholder message (will be removed in Phase 1)
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'GAME SCENE\n(Press P to pause)', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: COLORS.TEXT_SECONDARY,
        align: 'center',
      })
      .setOrigin(0.5);
  }

  update(_time: number, _delta: number): void {
    if (this.isPaused || this.isGameOver) {
      return;
    }

    // Game loop will be implemented in Phase 1
  }

  private resetGameState(): void {
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.isPaused = false;
    this.isGameOver = false;
  }

  private createBoard(): void {
    const { width, height } = this.scale;

    // Calculate board position (centered horizontally, with offset for UI)
    const boardX = width / 2 - (BOARD_WIDTH * BLOCK_SIZE) / 2 - 100;
    const boardY = height / 2 - (BOARD_HEIGHT * BLOCK_SIZE) / 2;

    this.boardGraphics = this.add.graphics();

    // Draw board background
    this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.BOARD_BG).color);
    this.boardGraphics.fillRect(boardX, boardY, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

    // Draw grid lines
    this.boardGraphics.lineStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.GRID).color, 0.5);
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      this.boardGraphics.moveTo(boardX + x * BLOCK_SIZE, boardY);
      this.boardGraphics.lineTo(boardX + x * BLOCK_SIZE, boardY + BOARD_HEIGHT * BLOCK_SIZE);
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      this.boardGraphics.moveTo(boardX, boardY + y * BLOCK_SIZE);
      this.boardGraphics.lineTo(boardX + BOARD_WIDTH * BLOCK_SIZE, boardY + y * BLOCK_SIZE);
    }
    this.boardGraphics.strokePath();

    // Draw border
    this.boardGraphics.lineStyle(4, 0x4a4a6a, 1);
    this.boardGraphics.strokeRect(
      boardX - 2,
      boardY - 2,
      BOARD_WIDTH * BLOCK_SIZE + 4,
      BOARD_HEIGHT * BLOCK_SIZE + 4
    );
  }

  private createUI(): void {
    const { width } = this.scale;
    const uiX = width / 2 + (BOARD_WIDTH * BLOCK_SIZE) / 2 + 50;

    // Score
    this.add
      .text(uiX, 100, 'SCORE', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(uiX, 130, this.formatNumber(this.score), {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    // Level
    this.add
      .text(uiX, 200, 'LEVEL', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    this.levelText = this.add
      .text(uiX, 230, this.formatNumber(this.level, 2), {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    // Lines
    this.add
      .text(uiX, 300, 'LINES', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    this.linesText = this.add
      .text(uiX, 330, this.formatNumber(this.lines, 3), {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    // Next piece placeholder
    this.add
      .text(uiX, 400, 'NEXT', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);
  }

  private setupInput(): void {
    // Pause
    this.input.keyboard?.on('keydown-P', this.togglePause, this);
    this.input.keyboard?.on('keydown-ESC', this.togglePause, this);

    // Game controls (will be expanded in Phase 1)
    // Left: ←, A
    // Right: →, D
    // Soft drop: ↓, S
    // Hard drop: Space
    // Rotate CW: ↑, W, X
    // Rotate CCW: Z
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.showPauseOverlay();
    } else {
      this.hidePauseOverlay();
    }
  }

  private showPauseOverlay(): void {
    const { width, height } = this.scale;

    const overlay = this.add.graphics();
    overlay.setName('pauseOverlay');
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, height / 2, 'PAUSED', {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5)
      .setName('pauseText');

    this.add
      .text(width / 2, height / 2 + 50, 'PRESS P TO RESUME', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5)
      .setName('resumeText');
  }

  private hidePauseOverlay(): void {
    this.children.getByName('pauseOverlay')?.destroy();
    this.children.getByName('pauseText')?.destroy();
    this.children.getByName('resumeText')?.destroy();
  }

  private formatNumber(num: number, digits: number = 6): string {
    return num.toString().padStart(digits, '0');
  }

  // Public methods for updating UI (will be used by game logic)
  public updateScore(score: number): void {
    this.score = score;
    this.scoreText?.setText(this.formatNumber(this.score));
  }

  public updateLevel(level: number): void {
    this.level = level;
    this.levelText?.setText(this.formatNumber(this.level, 2));
  }

  public updateLines(lines: number): void {
    this.lines = lines;
    this.linesText?.setText(this.formatNumber(this.lines, 3));
  }

  public gameOver(): void {
    this.isGameOver = true;
    this.scene.start('GameOverScene', {
      score: this.score,
      level: this.level,
      lines: this.lines,
    });
  }
}
