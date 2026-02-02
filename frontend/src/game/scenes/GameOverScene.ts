import Phaser from 'phaser';
import { COLORS } from '../config/game.config';

interface GameOverData {
  score: number;
  level: number;
  lines: number;
}

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private finalLevel: number = 1;
  private finalLines: number = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.finalScore = data.score || 0;
    this.finalLevel = data.level || 1;
    this.finalLines = data.lines || 0;
  }

  create(): void {
    const { width, height } = this.scale;

    // Game Over title
    this.add
      .text(width / 2, height / 2 - 120, 'GAME OVER', {
        fontFamily: '"Press Start 2P"',
        fontSize: '32px',
        color: '#F00000',
      })
      .setOrigin(0.5);

    // Final stats
    this.add
      .text(width / 2, height / 2 - 40, 'FINAL SCORE', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, this.finalScore.toString().padStart(6, '0'), {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: COLORS.ACCENT,
      })
      .setOrigin(0.5);

    // Level and lines
    this.add
      .text(width / 2 - 80, height / 2 + 60, `LEVEL: ${this.finalLevel}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2 + 80, height / 2 + 60, `LINES: ${this.finalLines}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    // Restart prompt
    const restartText = this.add
      .text(width / 2, height / 2 + 120, 'PRESS SPACE TO RESTART', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    // Blink restart text
    this.time.addEvent({
      delay: 500,
      callback: () => {
        restartText.setVisible(!restartText.visible);
      },
      loop: true,
    });

    // Title prompt
    this.add
      .text(width / 2, height / 2 + 150, 'PRESS T FOR TITLE', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    // Input handlers
    this.input.keyboard?.once('keydown-SPACE', this.restartGame, this);
    this.input.keyboard?.once('keydown-ENTER', this.restartGame, this);
    this.input.keyboard?.once('keydown-T', this.goToTitle, this);

    // Touch support
    this.input.once('pointerdown', this.restartGame, this);
  }

  private restartGame(): void {
    this.scene.start('GameScene');
  }

  private goToTitle(): void {
    this.scene.start('TitleScene');
  }
}
