import Phaser from 'phaser';
import { SaveManager } from './SaveManager';

/**
 * Singleton wrapper around Phaser's sound system.
 * Reads mute settings from SaveManager profiles and guards all
 * operations against missing WebAudio support.
 */
export class SoundManager {
  private static instance: SoundManager;
  private game!: Phaser.Game;

  private bgmKey: string | null = null;
  private bgm: Phaser.Sound.BaseSound | null = null;

  private musicVolume = 0.4;
  private sfxVolume = 0.6;

  private musicEnabled = true;
  private sfxEnabled = true;

  private constructor() {
    // Use init() or getInstance()
  }

  /** First-time initialisation with a Phaser.Game reference. */
  static init(game: Phaser.Game): SoundManager {
    const inst = SoundManager.getInstance();
    inst.game = game;
    inst.syncSettings();
    return inst;
  }

  /** Lazy singleton accessor. */
  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  // ─── Settings ──────────────────────────────────────────────────

  /** Read musicOn / sfxOn from the active SaveManager profile. */
  syncSettings(): void {
    const profile = SaveManager.getInstance().getActiveProfile();
    if (profile) {
      this.musicEnabled = profile.settings.musicOn;
      this.sfxEnabled = profile.settings.sfxOn;

      // Apply immediately to any running BGM
      if (!this.musicEnabled && this.bgm && (this.bgm as Phaser.Sound.WebAudioSound).isPlaying) {
        this.bgm.stop();
      }
    }
  }

  /** Enable or disable music. Stops / resumes BGM in real time. */
  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!this.isAvailable()) return;

    if (!enabled) {
      if (this.bgm && (this.bgm as Phaser.Sound.WebAudioSound).isPlaying) {
        this.bgm.stop();
      }
    } else if (this.bgmKey) {
      // Resume whatever was playing
      this.playBGM(this.bgmKey);
    }
  }

  /** Enable or disable SFX. */
  setSFXEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  // ─── BGM ───────────────────────────────────────────────────────

  /** Play background music (looped). Stops any current BGM first. */
  playBGM(key: string): void {
    if (!this.isAvailable()) return;
    if (!this.game.cache.audio.exists(key)) {
      console.warn(`SoundManager: audio key "${key}" not found in cache`);
      return;
    }

    // Remember the key so we can resume after re-enable
    this.bgmKey = key;

    if (!this.musicEnabled) return;

    // Stop existing BGM
    this.stopBGM();

    this.bgm = this.game.sound.add(key, {
      loop: true,
      volume: this.musicVolume,
    });
    this.bgm.play();
  }

  /** Stop current BGM. Does NOT clear bgmKey so it can be resumed. */
  stopBGM(): void {
    if (this.bgm) {
      this.bgm.stop();
      this.bgm.destroy();
      this.bgm = null;
    }
  }

  // ─── SFX ───────────────────────────────────────────────────────

  /** Play a one-shot sound effect. Phaser handles cleanup. */
  playSFX(key: string): void {
    if (!this.isAvailable()) return;
    if (!this.sfxEnabled) return;
    if (!this.game.cache.audio.exists(key)) {
      console.warn(`SoundManager: audio key "${key}" not found in cache`);
      return;
    }

    this.game.sound.play(key, { volume: this.sfxVolume });
  }

  // ─── Utility ───────────────────────────────────────────────────

  /** True if Phaser has a working WebAudio (or HTML5Audio) sound manager. */
  isAvailable(): boolean {
    if (!this.game || !this.game.sound) return false;
    // Phaser uses NoAudioSoundManager when no audio backend is available
    if (this.game.sound instanceof Phaser.Sound.NoAudioSoundManager) return false;
    return true;
  }
}
