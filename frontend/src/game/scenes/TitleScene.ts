import Phaser from 'phaser';
import { COLORS } from '../config/game.config';

export class TitleScene extends Phaser.Scene {
  private blinkTimer?: Phaser.Time.TimerEvent;
  private startText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const { width, height } = this.scale;

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

    // Blinking start text
    this.startText = this.add
      .text(width / 2, height / 2 + 80, 'PRESS SPACE TO START', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    this.blinkTimer = this.time.addEvent({
      delay: 500,
      callback: this.toggleStartText,
      callbackScope: this,
      loop: true,
    });

    // Controls info
    this.add
      .text(width / 2, height - 80, 'CONTROLS: ARROWS / SPACE / P', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: COLORS.TEXT_SECONDARY,
      })
      .setOrigin(0.5);

    // Input handlers
    this.input.keyboard?.once('keydown-SPACE', this.startGame, this);
    this.input.keyboard?.once('keydown-ENTER', this.startGame, this);

    // Touch support
    this.input.once('pointerdown', this.startGame, this);
  }

  private toggleStartText(): void {
    if (this.startText) {
      this.startText.setVisible(!this.startText.visible);
    }
  }

  private startGame(): void {
    if (this.blinkTimer) {
      this.blinkTimer.destroy();
    }
    this.scene.start('GameScene');
  }
}
