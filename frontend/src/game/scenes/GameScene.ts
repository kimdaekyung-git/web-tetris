import Phaser from 'phaser';
import { BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE, COLORS } from '../config/game.config';
import { Board } from '../objects/Board';
import { Tetromino } from '../objects/Tetromino';
import { CollisionSystem } from '../systems/CollisionSystem';
import { ScoreManager } from '../objects/ScoreManager';
import { TETROMINO_COLORS } from '../config/tetrominos';
import { getDropSpeedMs } from '../config/levels';
import { getAudioManager } from '../systems/AudioManager';
import type { TetrominoType } from '../../types/game.types';

export class GameScene extends Phaser.Scene {
  // Game state
  private isPaused: boolean = false;
  private isGameOver: boolean = false;

  // Game objects
  private board!: Board;
  private currentTetromino?: Tetromino;
  private nextTetromino?: Tetromino;
  private collisionSystem!: CollisionSystem;
  private scoreManager!: ScoreManager;

  // Timer
  private dropTimer: number = 0;
  private dropInterval: number = 1000; // 1초에 한 칸 (레벨에 따라 변경)

  // Board rendering
  private boardX: number = 0;
  private boardY: number = 0;

  // UI elements
  private scoreText?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;
  private linesText?: Phaser.GameObjects.Text;
  private boardGraphics?: Phaser.GameObjects.Graphics;
  private tetrominoGraphics?: Phaser.GameObjects.Graphics;
  private nextPreviewGraphics?: Phaser.GameObjects.Graphics;
  private nextPreviewX: number = 0;
  private nextPreviewY: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    console.log('GameScene: create() started');
    this.resetGameState();
    this.initializeGameObjects();
    this.createBoard();
    this.createUI();
    this.setupInput();
    this.createTouchControls();
    this.spawnTetromino();

    // Start BGM
    getAudioManager().startBGM();

    console.log('GameScene: create() completed, currentTetromino:', this.currentTetromino?.type);
  }

  private initializeGameObjects(): void {
    this.board = new Board();
    this.collisionSystem = new CollisionSystem(this.board);
    this.scoreManager = new ScoreManager();
    // tetrominoGraphics is created in createBoard() AFTER board background

    // Update drop interval based on level
    this.updateDropInterval();
  }

  private frameCount: number = 0;

  update(_time: number, delta: number): void {
    this.frameCount++;

    // Log first few frames
    if (this.frameCount <= 3) {
      console.log('GameScene: update() frame', this.frameCount,
        'isPaused:', this.isPaused,
        'isGameOver:', this.isGameOver,
        'currentTetromino:', this.currentTetromino?.type);
    }

    if (this.isPaused || this.isGameOver) {
      return;
    }

    if (!this.currentTetromino) {
      console.log('GameScene: No currentTetromino!');
      return;
    }

    // Handle key repeat
    this.handleKeyRepeat(delta);

    // Drop timer
    this.dropTimer += delta;
    if (this.dropTimer >= this.dropInterval) {
      this.dropTimer = 0;
      this.moveDown();
    }

    this.render();
  }

  private resetGameState(): void {
    this.isPaused = false;
    this.isGameOver = false;
  }

  private createBoard(): void {
    const { width, height } = this.scale;

    // Calculate board position (centered horizontally, with offset for UI)
    this.boardX = width / 2 - (BOARD_WIDTH * BLOCK_SIZE) / 2 - 80;
    this.boardY = height / 2 - (BOARD_HEIGHT * BLOCK_SIZE) / 2;

    console.log('GameScene: Board position:', this.boardX, this.boardY);

    this.boardGraphics = this.add.graphics();

    // Draw board background (black)
    this.boardGraphics.fillStyle(0x000000, 1);
    this.boardGraphics.fillRect(this.boardX, this.boardY, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

    // Draw grid lines (more visible)
    this.boardGraphics.lineStyle(1, 0x333355, 0.8);
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      this.boardGraphics.moveTo(this.boardX + x * BLOCK_SIZE, this.boardY);
      this.boardGraphics.lineTo(this.boardX + x * BLOCK_SIZE, this.boardY + BOARD_HEIGHT * BLOCK_SIZE);
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      this.boardGraphics.moveTo(this.boardX, this.boardY + y * BLOCK_SIZE);
      this.boardGraphics.lineTo(this.boardX + BOARD_WIDTH * BLOCK_SIZE, this.boardY + y * BLOCK_SIZE);
    }
    this.boardGraphics.strokePath();

    // Draw bright border (very visible)
    this.boardGraphics.lineStyle(4, 0x6666cc, 1);
    this.boardGraphics.strokeRect(
      this.boardX - 2,
      this.boardY - 2,
      BOARD_WIDTH * BLOCK_SIZE + 4,
      BOARD_HEIGHT * BLOCK_SIZE + 4
    );

    // Create tetromino graphics ON TOP of board
    this.tetrominoGraphics = this.add.graphics();
    console.log('GameScene: Board drawn, tetrominoGraphics created');
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
      .text(uiX, 130, this.formatNumber(0), {
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
      .text(uiX, 230, this.formatNumber(1, 2), {
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
      .text(uiX, 330, this.formatNumber(0, 3), {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    // Next piece
    this.add
      .text(uiX, 400, 'NEXT', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    // Next preview area
    this.nextPreviewX = uiX;
    this.nextPreviewY = 440;
    this.nextPreviewGraphics = this.add.graphics();
  }

  // Key repeat settings
  private keys: {
    left?: Phaser.Input.Keyboard.Key;
    right?: Phaser.Input.Keyboard.Key;
    down?: Phaser.Input.Keyboard.Key;
  } = {};
  private keyRepeatDelay: number = 170; // Initial delay before repeat
  private keyRepeatRate: number = 50;   // Repeat rate
  private keyTimers: { left: number; right: number; down: number } = { left: 0, right: 0, down: 0 };
  private keyInitial: { left: boolean; right: boolean; down: boolean } = { left: true, right: true, down: true };

  private setupInput(): void {
    if (!this.input.keyboard) {
      console.error('Keyboard input not available');
      return;
    }

    const keyboard = this.input.keyboard;

    // Pause
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P).on('down', this.togglePause, this);
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', this.togglePause, this);

    // Movement keys (with repeat)
    this.keys.left = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keys.right = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keys.down = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // Also add A/S/D as alternatives
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).on('down', this.moveLeft, this);
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).on('down', this.moveRight, this);
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on('down', this.moveDown, this);

    // Hard Drop
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', this.hardDrop, this);

    // Rotate CW
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP).on('down', this.rotateCW, this);
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).on('down', this.rotateCW, this);
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X).on('down', this.rotateCW, this);

    // Rotate CCW
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z).on('down', this.rotateCCW, this);

    // Mute toggle
    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M).on('down', this.toggleMute, this);
  }

  private toggleMute(): void {
    const muted = getAudioManager().toggleMute();
    console.log('Audio muted:', muted);
  }

  private handleKeyRepeat(delta: number): void {
    // Left key
    if (this.keys.left?.isDown) {
      if (this.keyInitial.left) {
        this.moveLeft();
        this.keyInitial.left = false;
      }
      this.keyTimers.left += delta;
      if (this.keyTimers.left >= this.keyRepeatDelay) {
        this.moveLeft();
        this.keyTimers.left = this.keyRepeatDelay - this.keyRepeatRate;
      }
    } else {
      this.keyTimers.left = 0;
      this.keyInitial.left = true;
    }

    // Right key
    if (this.keys.right?.isDown) {
      if (this.keyInitial.right) {
        this.moveRight();
        this.keyInitial.right = false;
      }
      this.keyTimers.right += delta;
      if (this.keyTimers.right >= this.keyRepeatDelay) {
        this.moveRight();
        this.keyTimers.right = this.keyRepeatDelay - this.keyRepeatRate;
      }
    } else {
      this.keyTimers.right = 0;
      this.keyInitial.right = true;
    }

    // Down key
    if (this.keys.down?.isDown) {
      if (this.keyInitial.down) {
        this.moveDown();
        this.keyInitial.down = false;
      }
      this.keyTimers.down += delta;
      if (this.keyTimers.down >= this.keyRepeatDelay) {
        this.moveDown();
        this.keyTimers.down = this.keyRepeatDelay - this.keyRepeatRate;
      }
    } else {
      this.keyTimers.down = 0;
      this.keyInitial.down = true;
    }
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      getAudioManager().stopBGM();
      this.showPauseOverlay();
    } else {
      getAudioManager().startBGM();
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

  // Public methods for updating UI
  public updateScore(score: number): void {
    this.scoreText?.setText(this.formatNumber(score));
  }

  public updateLevel(level: number): void {
    this.levelText?.setText(this.formatNumber(level, 2));
  }

  public updateLines(lines: number): void {
    this.linesText?.setText(this.formatNumber(lines, 3));
  }

  public gameOver(): void {
    this.isGameOver = true;
    getAudioManager().stopBGM();
    getAudioManager().playSFX('gameover');
    const stats = this.scoreManager.getStats();
    this.scene.start('GameOverScene', stats);
  }

  // ============================================================
  // Game Logic
  // ============================================================

  private spawnTetromino(): void {
    // Generate next if not exists
    if (!this.nextTetromino) {
      this.nextTetromino = new Tetromino(this.getRandomTetrominoType());
    }

    this.currentTetromino = this.nextTetromino;
    this.nextTetromino = new Tetromino(this.getRandomTetrominoType());

    // Check game over
    if (this.collisionSystem.isGameOver(this.currentTetromino)) {
      this.gameOver();
    }
  }

  private getRandomTetrominoType(): TetrominoType {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private moveLeft(): void {
    if (!this.currentTetromino || this.isPaused || this.isGameOver) return;

    if (this.collisionSystem.canMove(this.currentTetromino, -1, 0)) {
      this.currentTetromino.moveLeft();
      getAudioManager().playSFX('move');
    }
  }

  private moveRight(): void {
    if (!this.currentTetromino || this.isPaused || this.isGameOver) return;

    if (this.collisionSystem.canMove(this.currentTetromino, 1, 0)) {
      this.currentTetromino.moveRight();
      getAudioManager().playSFX('move');
    }
  }

  private moveDown(): void {
    if (!this.currentTetromino || this.isPaused || this.isGameOver) return;

    if (this.collisionSystem.canMove(this.currentTetromino, 0, 1)) {
      this.currentTetromino.moveDown();
    } else {
      // Lock tetromino
      this.lockTetromino();
    }
  }

  private hardDrop(): void {
    if (!this.currentTetromino || this.isPaused || this.isGameOver) return;

    const ghostY = this.collisionSystem.getGhostPosition(this.currentTetromino);
    this.currentTetromino.y = ghostY;
    getAudioManager().playSFX('drop');
    this.lockTetromino();
  }

  private rotateCW(): void {
    if (!this.currentTetromino || this.isPaused || this.isGameOver) return;

    const originalRotation = this.currentTetromino.rotation;
    this.currentTetromino.rotateClockwise();

    const rotatedBlocks = this.currentTetromino.getBlocks();
    if (!this.collisionSystem.canRotate(this.currentTetromino, rotatedBlocks)) {
      this.currentTetromino.rotation = originalRotation;
    } else {
      getAudioManager().playSFX('rotate');
    }
  }

  private rotateCCW(): void {
    if (!this.currentTetromino || this.isPaused || this.isGameOver) return;

    const originalRotation = this.currentTetromino.rotation;
    this.currentTetromino.rotateCounterClockwise();

    const rotatedBlocks = this.currentTetromino.getBlocks();
    if (!this.collisionSystem.canRotate(this.currentTetromino, rotatedBlocks)) {
      this.currentTetromino.rotation = originalRotation;
    } else {
      getAudioManager().playSFX('rotate');
    }
  }

  private lockTetromino(): void {
    if (!this.currentTetromino) return;

    // Place blocks on board
    const blocks = this.currentTetromino.getBlocks();
    const color = TETROMINO_COLORS[this.currentTetromino.type];
    this.board.placeBlocks(blocks, color);

    // Check for filled rows
    const filledRows = this.board.getFilledRows();
    if (filledRows.length > 0) {
      this.board.clearRows(filledRows);

      // Play sound effect
      if (filledRows.length === 4) {
        getAudioManager().playSFX('tetris');
      } else {
        getAudioManager().playSFX('clear');
      }

      // Update score and lines using ScoreManager
      const previousLevel = this.scoreManager.level;
      this.scoreManager.addLines(filledRows.length);

      // Update UI
      this.updateScore(this.scoreManager.score);
      this.updateLevel(this.scoreManager.level);
      this.updateLines(this.scoreManager.lines);

      // Update drop interval if level changed
      if (this.scoreManager.level !== previousLevel) {
        this.updateDropInterval();
        getAudioManager().playSFX('levelup');
      }
    }

    // Spawn next tetromino
    this.spawnTetromino();
  }

  private updateDropInterval(): void {
    this.dropInterval = getDropSpeedMs(this.scoreManager.level);
  }

  private render(): void {
    if (!this.tetrominoGraphics || !this.currentTetromino) {
      console.log('GameScene: render() skipped - no graphics or tetromino');
      return;
    }

    // Log first render
    if (this.frameCount <= 3) {
      console.log('GameScene: render() type:', this.currentTetromino.type);
    }

    this.tetrominoGraphics.clear();

    // Render placed blocks on board
    for (let y = 0; y < this.board.height; y++) {
      for (let x = 0; x < this.board.width; x++) {
        const cell = this.board.getCell(x, y);
        if (cell !== 0) {
          this.drawBlock(x, y, cell);
        }
      }
    }

    // Render current tetromino
    const blocks = this.currentTetromino.getBlocks();
    const tetrominoColor = TETROMINO_COLORS[this.currentTetromino.type];
    for (const block of blocks) {
      this.tetrominoGraphics.fillStyle(tetrominoColor, 1);
      const px = this.boardX + block.x * BLOCK_SIZE;
      const py = this.boardY + block.y * BLOCK_SIZE;
      this.tetrominoGraphics.fillRect(px, py, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    }

    // Render next piece preview
    this.renderNextPreview();
  }

  private renderNextPreview(): void {
    if (!this.nextPreviewGraphics || !this.nextTetromino) return;

    this.nextPreviewGraphics.clear();

    const shape = this.nextTetromino.getShape();
    const color = TETROMINO_COLORS[this.nextTetromino.type];
    const previewBlockSize = 16; // Smaller blocks for preview

    // Center the preview
    const offsetX = this.nextPreviewX - (shape[0].length * previewBlockSize) / 2;
    const offsetY = this.nextPreviewY;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          const x = offsetX + col * previewBlockSize;
          const y = offsetY + row * previewBlockSize;

          // Fill
          this.nextPreviewGraphics.fillStyle(color, 1);
          this.nextPreviewGraphics.fillRect(x + 1, y + 1, previewBlockSize - 2, previewBlockSize - 2);

          // Highlight
          this.nextPreviewGraphics.fillStyle(0xffffff, 0.3);
          this.nextPreviewGraphics.fillRect(x + 2, y + 2, previewBlockSize - 6, 2);
        }
      }
    }
  }

  private drawBlock(x: number, y: number, color: number): void {
    if (!this.tetrominoGraphics) return;

    const pixelX = this.boardX + x * BLOCK_SIZE;
    const pixelY = this.boardY + y * BLOCK_SIZE;

    // Fill
    this.tetrominoGraphics.fillStyle(color, 1);
    this.tetrominoGraphics.fillRect(pixelX + 1, pixelY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

    // Highlight
    this.tetrominoGraphics.fillStyle(0xffffff, 0.3);
    this.tetrominoGraphics.fillRect(pixelX + 2, pixelY + 2, BLOCK_SIZE - 6, 3);

    // Shadow
    this.tetrominoGraphics.fillStyle(0x000000, 0.3);
    this.tetrominoGraphics.fillRect(pixelX + 2, pixelY + BLOCK_SIZE - 5, BLOCK_SIZE - 4, 3);
  }

  // ============================================================
  // Touch Controls (Mobile)
  // ============================================================

  private createTouchControls(): void {
    const { width, height } = this.scale;
    const buttonSize = 60;
    const padding = 20;

    // Only show on mobile/touch devices
    if (!this.sys.game.device.input.touch) {
      return;
    }

    // Left button
    this.createTouchButton(
      padding + buttonSize / 2,
      height - padding - buttonSize / 2,
      '◄',
      () => this.moveLeft()
    );

    // Right button
    this.createTouchButton(
      padding + buttonSize * 1.5 + 10,
      height - padding - buttonSize / 2,
      '►',
      () => this.moveRight()
    );

    // Down button
    this.createTouchButton(
      padding + buttonSize * 2.5 + 20,
      height - padding - buttonSize / 2,
      '▼',
      () => this.moveDown()
    );

    // Rotate button
    this.createTouchButton(
      width - padding - buttonSize / 2,
      height - padding - buttonSize / 2,
      '↻',
      () => this.rotateCW()
    );

    // Drop button
    this.createTouchButton(
      width - padding - buttonSize * 1.5 - 10,
      height - padding - buttonSize / 2,
      '▼▼',
      () => this.hardDrop()
    );
  }

  private createTouchButton(
    x: number,
    y: number,
    label: string,
    callback: () => void
  ): void {
    const buttonSize = 60;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a3e, 0.7);
    bg.fillRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, 8);
    bg.lineStyle(2, 0x4a4a6a, 1);
    bg.strokeRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, 8);

    // Label
    this.add
      .text(x, y, label, {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    // Make interactive
    const zone = this.add.zone(x, y, buttonSize, buttonSize).setInteractive();
    zone.on('pointerdown', () => {
      if (!this.isPaused && !this.isGameOver) {
        callback();
        // Visual feedback
        bg.clear();
        bg.fillStyle(0x4a4a6a, 0.9);
        bg.fillRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, 8);
      }
    });

    zone.on('pointerup', () => {
      // Reset visual
      bg.clear();
      bg.fillStyle(0x2a2a3e, 0.7);
      bg.fillRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, 8);
      bg.lineStyle(2, 0x4a4a6a, 1);
      bg.strokeRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, 8);
    });
  }
}
