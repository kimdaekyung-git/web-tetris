/**
 * AudioManager - 테트리스 오디오 시스템
 *
 * 고전 테트리스 BGM (코로베이니키) + 효과음
 * Web Audio API 기반으로 외부 파일 없이 동작
 */

import { logger } from '../../utils/logger';

type SoundEffect = 'move' | 'rotate' | 'drop' | 'clear' | 'tetris' | 'levelup' | 'gameover';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmTimeouts: number[] = [];

  private volume: number = 0.5;
  private bgmVolume: number = 0.3;
  private sfxVolume: number = 0.5;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Master gain
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;

      // BGM gain
      this.bgmGain = this.audioContext.createGain();
      this.bgmGain.connect(this.masterGain);
      this.bgmGain.gain.value = this.bgmVolume;

      // SFX gain
      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = this.sfxVolume;

      logger.log('AudioManager: Initialized');
    } catch (e) {
      logger.warn('AudioManager: Web Audio API not supported');
    }
  }

  private resumeContext(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // ============================================================
  // 코로베이니키 (Korobeiniki) - 고전 테트리스 BGM
  // ============================================================

  // 음계 주파수 (Hz)
  private readonly NOTE_FREQ: Record<string, number> = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
    'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'E3': 164.81, 'A3': 220.00, 'B3': 246.94, 'G3': 196.00,
    'F3': 174.61, 'D3': 146.83, 'C3': 130.81,
  };

  // 코로베이니키 멜로디 (음표, 길이)
  private readonly KOROBEINIKI_MELODY: [string, number][] = [
    // 첫 번째 프레이즈
    ['E5', 1], ['B4', 0.5], ['C5', 0.5], ['D5', 1], ['C5', 0.5], ['B4', 0.5],
    ['A4', 1], ['A4', 0.5], ['C5', 0.5], ['E5', 1], ['D5', 0.5], ['C5', 0.5],
    ['B4', 1.5], ['C5', 0.5], ['D5', 1], ['E5', 1],
    ['C5', 1], ['A4', 1], ['A4', 2],

    // 두 번째 프레이즈
    ['D5', 1.5], ['F5', 0.5], ['A5', 1], ['G5', 0.5], ['F5', 0.5],
    ['E5', 1.5], ['C5', 0.5], ['E5', 1], ['D5', 0.5], ['C5', 0.5],
    ['B4', 1], ['B4', 0.5], ['C5', 0.5], ['D5', 1], ['E5', 1],
    ['C5', 1], ['A4', 1], ['A4', 2],
  ];

  // 베이스 라인
  private readonly KOROBEINIKI_BASS: [string, number][] = [
    ['E3', 2], ['A3', 2], ['G3', 2], ['A3', 2],
    ['E3', 2], ['A3', 2], ['G3', 2], ['A3', 2],
    ['D3', 2], ['F3', 2], ['A3', 2], ['G3', 2],
    ['E3', 2], ['A3', 2], ['G3', 2], ['A3', 2],
  ];

  public startBGM(): void {
    if (!this.audioContext || this.bgmPlaying || this.isMuted) return;

    this.resumeContext();
    this.bgmPlaying = true;
    this.playKorobeiniki();
    logger.log('AudioManager: BGM started');
  }

  private playKorobeiniki(): void {
    if (!this.audioContext || !this.bgmGain || !this.bgmPlaying) return;

    const bpm = 140;
    const beatDuration = 60 / bpm;
    let melodyTime = this.audioContext.currentTime + 0.1;
    let bassTime = this.audioContext.currentTime + 0.1;

    // 멜로디 재생
    for (const [note, duration] of this.KOROBEINIKI_MELODY) {
      this.scheduleNote(note, melodyTime, duration * beatDuration, 'square', 0.15);
      melodyTime += duration * beatDuration;
    }

    // 베이스 재생
    for (const [note, duration] of this.KOROBEINIKI_BASS) {
      this.scheduleNote(note, bassTime, duration * beatDuration, 'triangle', 0.12);
      bassTime += duration * beatDuration;
    }

    // 루프
    const loopDuration = melodyTime - this.audioContext.currentTime;
    const timeoutId = window.setTimeout(() => {
      if (this.bgmPlaying) {
        this.playKorobeiniki();
      }
    }, loopDuration * 1000);

    this.bgmTimeouts.push(timeoutId);
  }

  private scheduleNote(
    note: string,
    startTime: number,
    duration: number,
    waveform: OscillatorType,
    volume: number
  ): void {
    if (!this.audioContext || !this.bgmGain) return;

    const freq = this.NOTE_FREQ[note];
    if (!freq) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = waveform;
    osc.frequency.value = freq;

    gain.connect(this.bgmGain);
    osc.connect(gain);

    // 엔벨로프 (부드러운 시작/끝)
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.setValueAtTime(volume, startTime + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.bgmOscillators.push(osc);
  }

  public stopBGM(): void {
    this.bgmPlaying = false;

    // 모든 오실레이터 정지
    for (const osc of this.bgmOscillators) {
      try {
        osc.stop();
      } catch (e) {
        // 이미 정지된 경우 무시
      }
    }
    this.bgmOscillators = [];

    // 모든 타임아웃 클리어
    for (const id of this.bgmTimeouts) {
      clearTimeout(id);
    }
    this.bgmTimeouts = [];

    logger.log('AudioManager: BGM stopped');
  }

  // ============================================================
  // 효과음
  // ============================================================

  public playSFX(effect: SoundEffect): void {
    if (!this.audioContext || !this.sfxGain || this.isMuted) return;

    this.resumeContext();

    switch (effect) {
      case 'move':
        this.playTone(200, 0.05, 'square', 0.1);
        break;
      case 'rotate':
        this.playTone(300, 0.08, 'square', 0.15);
        this.playTone(400, 0.08, 'square', 0.15, 0.04);
        break;
      case 'drop':
        this.playTone(150, 0.1, 'triangle', 0.2);
        break;
      case 'clear':
        this.playTone(523, 0.1, 'square', 0.2);
        this.playTone(659, 0.1, 'square', 0.2, 0.1);
        this.playTone(784, 0.15, 'square', 0.2, 0.2);
        break;
      case 'tetris':
        // 4줄 클리어 - 더 화려한 사운드
        this.playTone(523, 0.1, 'square', 0.25);
        this.playTone(659, 0.1, 'square', 0.25, 0.08);
        this.playTone(784, 0.1, 'square', 0.25, 0.16);
        this.playTone(1047, 0.2, 'square', 0.3, 0.24);
        break;
      case 'levelup':
        this.playArpeggio([261, 329, 392, 523], 0.1, 'square', 0.2);
        break;
      case 'gameover':
        this.playTone(200, 0.3, 'sawtooth', 0.2);
        this.playTone(150, 0.3, 'sawtooth', 0.2, 0.3);
        this.playTone(100, 0.5, 'sawtooth', 0.15, 0.6);
        break;
    }
  }

  private playTone(
    freq: number,
    duration: number,
    waveform: OscillatorType,
    volume: number,
    delay: number = 0
  ): void {
    if (!this.audioContext || !this.sfxGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = waveform;
    osc.frequency.value = freq;

    gain.connect(this.sfxGain);
    osc.connect(gain);

    const startTime = this.audioContext.currentTime + delay;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playArpeggio(
    freqs: number[],
    noteDuration: number,
    waveform: OscillatorType,
    volume: number
  ): void {
    freqs.forEach((freq, i) => {
      this.playTone(freq, noteDuration, waveform, volume, i * noteDuration * 0.8);
    });
  }

  // ============================================================
  // 볼륨 & 음소거
  // ============================================================

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    }

    if (this.isMuted && this.bgmPlaying) {
      this.stopBGM();
    }

    logger.log('AudioManager: Muted =', this.isMuted);
    return this.isMuted;
  }

  public setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.value = this.volume;
    }
  }

  public setBGMVolume(value: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, value));
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.bgmVolume;
    }
  }

  public setSFXVolume(value: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, value));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  public isBGMPlaying(): boolean {
    return this.bgmPlaying;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public destroy(): void {
    this.stopBGM();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// 싱글톤 인스턴스
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}
