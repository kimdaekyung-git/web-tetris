import Phaser from 'phaser';
import { COLORS } from '../config/game.config';
import { getRankings, getLocalHighScore } from '../../services/scoreApi';
import type { RankingEntry } from '@contracts/types';

export class TitleScene extends Phaser.Scene {
  private blinkTimer?: Phaser.Time.TimerEvent;
  private startText?: Phaser.GameObjects.Text;
  private canStart: boolean = false;
  private keydownHandler?: (event: KeyboardEvent) => void;
  private isStarting: boolean = false;
  private rankings: RankingEntry[] = [];

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    console.log('TitleScene: create() started');

    // Reset state
    this.isStarting = false;
    this.canStart = false;

    // Allow start after short delay (reduced to 300ms)
    this.time.delayedCall(300, () => {
      this.canStart = true;
      console.log('TitleScene: Ready to start (canStart = true)');
    });

    // Title
    this.add
      .text(width / 2, height / 2 - 100, 'CLASSIC', {
        fontFamily: '"Press Start 2P"',
        fontSize: '32px',
        color: COLORS.ACCENT,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 50, 'TETRIS', {
        fontFamily: '"Press Start 2P"',
        fontSize: '48px',
        color: COLORS.TEXT_PRIMARY,
      })
      .setOrigin(0.5);

    // Blinking start text - also include click instruction
    this.startText = this.add
      .text(width / 2, height / 2 + 80, 'CLICK HERE TO START', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: COLORS.ACCENT,
        backgroundColor: '#2a2a3e',
        padding: { x: 20, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Make the start text clickable
    this.startText.on('pointerover', () => {
      this.startText?.setStyle({ color: '#FFFFFF' });
    });
    this.startText.on('pointerout', () => {
      this.startText?.setStyle({ color: COLORS.ACCENT });
    });
    this.startText.on('pointerdown', () => {
      console.log('TitleScene: START button clicked!');
      if (this.canStart && !this.isStarting) {
        this.startGame();
      }
    });

    this.blinkTimer = this.time.addEvent({
      delay: 500,
      callback: this.toggleStartText,
      callbackScope: this,
      loop: true,
    });

    // High score display
    const localHighScore = getLocalHighScore();
    this.add
      .text(width / 2, height / 2 + 130, `HIGH SCORE: ${localHighScore.toString().padStart(6, '0')}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: COLORS.ACCENT,
      })
      .setOrigin(0.5);

    // Load and display rankings
    this.loadRankings();

    // Controls info
    this.add
      .text(width / 2, height - 80, 'CONTROLS: ARROWS / SPACE / P', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    // Remove any previous keyboard listener
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }

    // Use window-level keyboard listener for reliability
    this.keydownHandler = (event: KeyboardEvent) => {
      console.log('TitleScene: Key pressed:', event.code, event.key, 'canStart:', this.canStart);
      const isStartKey = event.code === 'Space' || event.code === 'Enter' ||
                         event.key === ' ' || event.key === 'Enter';
      if (isStartKey && this.canStart && !this.isStarting) {
        event.preventDefault();
        this.startGame();
      }
    };
    window.addEventListener('keydown', this.keydownHandler, true); // use capture phase

    // Touch/click support - make entire screen clickable
    this.input.on('pointerdown', () => {
      console.log('TitleScene: Pointer down, canStart:', this.canStart);
      if (this.canStart && !this.isStarting) {
        this.startGame();
      }
    });

    // Focus the game canvas to ensure keyboard events work
    const canvas = this.sys.game.canvas;
    if (canvas) {
      canvas.setAttribute('tabindex', '1');
      canvas.focus();
      console.log('TitleScene: Canvas focused');
    }

    console.log('TitleScene: Input handlers set up');
  }

  private toggleStartText(): void {
    if (this.startText) {
      this.startText.setVisible(!this.startText.visible);
    }
  }

  private async loadRankings(): Promise<void> {
    try {
      const result = await getRankings(5);
      if (result && result.data.length > 0) {
        this.rankings = result.data;
        this.displayRankings();
      }
    } catch (error) {
      console.log('Could not load rankings:', error);
    }
  }

  private displayRankings(): void {
    const { width, height } = this.scale;
    const startY = height / 2 + 160;

    // Rankings title
    this.add
      .text(width / 2, startY, 'TOP SCORES', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    // Display top 5 rankings
    this.rankings.slice(0, 5).forEach((entry, index) => {
      const y = startY + 18 + index * 14;
      const name = entry.player_nickname.slice(0, 6).padEnd(6);
      const score = entry.score.toString().padStart(6, '0');
      this.add
        .text(width / 2, y, `${index + 1}. ${name} ${score}`, {
          fontFamily: '"Press Start 2P"',
          fontSize: '7px',
          color: index === 0 ? COLORS.ACCENT : COLORS.TEXT_PRIMARY,
        })
        .setOrigin(0.5);
    });
  }

  private startGame(): void {
    if (this.isStarting) {
      console.log('TitleScene: Already starting, ignoring');
      return;
    }

    this.isStarting = true;
    console.log('TitleScene: startGame() called');

    // Remove keyboard listener
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler, true);
      this.keydownHandler = undefined;
    }

    if (this.blinkTimer) {
      this.blinkTimer.destroy();
    }

    console.log('TitleScene: Transitioning to GameScene...');

    // Use a small delay to ensure cleanup
    this.time.delayedCall(50, () => {
      console.log('TitleScene: scene.start(GameScene) now');
      this.scene.start('GameScene');
    });
  }

  shutdown(): void {
    // Clean up keyboard listener when scene is destroyed
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler, true);
      this.keydownHandler = undefined;
    }
  }
}
