import Phaser from 'phaser';
import { COLORS } from '../config/game.config';
import { saveScore, updateLocalHighScore, getLocalHighScore } from '../../services/scoreApi';

interface GameOverData {
  score: number;
  level: number;
  lines: number;
  playTimeSeconds: number;
}

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private finalLevel: number = 1;
  private finalLines: number = 0;
  private finalPlayTime: number = 0;
  private isNewHighScore: boolean = false;
  private saveStatusText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.finalScore = data.score || 0;
    this.finalLevel = data.level || 1;
    this.finalLines = data.lines || 0;
    this.finalPlayTime = data.playTimeSeconds || 0;

    // Check for new high score
    this.isNewHighScore = updateLocalHighScore(this.finalScore);
  }

  create(): void {
    const { width, height } = this.scale;

    // Game Over title
    this.add
      .text(width / 2, height / 2 - 140, 'GAME OVER', {
        fontFamily: '"Press Start 2P"',
        fontSize: '32px',
        color: '#F00000',
      })
      .setOrigin(0.5);

    // New high score indicator
    if (this.isNewHighScore) {
      this.add
        .text(width / 2, height / 2 - 100, 'NEW HIGH SCORE!', {
          fontFamily: '"Press Start 2P"',
          fontSize: '12px',
          color: COLORS.ACCENT,
        })
        .setOrigin(0.5);
    }

    // Final stats
    this.add
      .text(width / 2, height / 2 - 50, 'FINAL SCORE', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 10, this.finalScore.toString().padStart(6, '0'), {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: this.isNewHighScore ? COLORS.ACCENT : COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    // Level and lines
    this.add
      .text(width / 2 - 80, height / 2 + 40, `LEVEL: ${this.finalLevel}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2 + 80, height / 2 + 40, `LINES: ${this.finalLines}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    // Play time
    const minutes = Math.floor(this.finalPlayTime / 60);
    const seconds = this.finalPlayTime % 60;
    this.add
      .text(width / 2, height / 2 + 70, `TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    // High score display
    this.add
      .text(width / 2, height / 2 + 100, `HIGH SCORE: ${getLocalHighScore().toString().padStart(6, '0')}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    // Save status
    this.saveStatusText = this.add
      .text(width / 2, height / 2 + 130, 'SAVING...', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    // Save score to API
    this.submitScore();

    // Restart prompt
    const restartText = this.add
      .text(width / 2, height / 2 + 160, 'PRESS SPACE TO RESTART', {
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
      .text(width / 2, height / 2 + 190, 'PRESS T FOR TITLE', {
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

  private async submitScore(): Promise<void> {
    try {
      const result = await saveScore(
        this.finalScore,
        this.finalLevel,
        this.finalLines,
        this.finalPlayTime
      );

      if (result) {
        this.saveStatusText?.setText('SCORE SAVED!');
        this.saveStatusText?.setColor('#00FF00');
      } else {
        this.saveStatusText?.setText('SAVED LOCALLY');
        this.saveStatusText?.setColor(COLORS.TEXT_SECONDARY);
      }
    } catch {
      this.saveStatusText?.setText('SAVED LOCALLY');
      this.saveStatusText?.setColor(COLORS.TEXT_SECONDARY);
    }
  }

  private restartGame(): void {
    this.scene.start('GameScene');
  }

  private goToTitle(): void {
    this.scene.start('TitleScene');
  }
}
