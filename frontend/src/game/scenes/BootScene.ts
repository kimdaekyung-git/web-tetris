import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Display loading progress
    const { width, height } = this.scale;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();

    progressBox.fillStyle(0x2d2d44, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add
      .text(width / 2, height / 2 - 50, 'LOADING...', {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffd700, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load assets here (will be added in later phases)
    // this.load.audio('bgm', 'assets/audio/bgm-korobeiniki.mp3');
    // this.load.audio('sfx-move', 'assets/audio/sfx-move.wav');
  }

  create(): void {
    this.scene.start('TitleScene');
  }
}
