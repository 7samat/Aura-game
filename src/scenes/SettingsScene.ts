import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SaveManager, GameSettings } from '../systems/SaveManager';
import { SoundManager } from '../systems/SoundManager';

export class SettingsScene extends Phaser.Scene {
  private saveManager: SaveManager;
  private settings: GameSettings = { musicOn: true, sfxOn: true, colorblindMode: false };

  constructor() {
    super({ key: 'SettingsScene' });
    this.saveManager = SaveManager.getInstance();
  }

  create(): void {
    // Load current settings
    const profile = this.saveManager.getActiveProfile();
    if (profile) {
      this.settings = { ...profile.settings };
    }

    // Semi-transparent overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    overlay.setInteractive(); // block clicks through

    // Panel
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 300, 260, 0x0a0a2e, 0.95);
    panel.setStrokeStyle(2, 0x4dc8ff, 0.6);

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 105, 'Settings', {
      fontSize: '20px',
      color: '#4dc8ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Toggle rows
    const startY = GAME_HEIGHT / 2 - 55;
    const rowHeight = 50;

    this.createToggle(GAME_WIDTH / 2, startY, '\uD83C\uDFB5 Music', this.settings.musicOn, (val) => {
      this.settings.musicOn = val;
      SoundManager.getInstance().setMusicEnabled(val);
      this.saveSettings();
    });

    this.createToggle(GAME_WIDTH / 2, startY + rowHeight, '\uD83D\uDD0A Sound', this.settings.sfxOn, (val) => {
      this.settings.sfxOn = val;
      SoundManager.getInstance().setSFXEnabled(val);
      this.saveSettings();
    });

    this.createToggle(GAME_WIDTH / 2, startY + rowHeight * 2, '\uD83C\uDFA8 Colorblind', this.settings.colorblindMode, (val) => {
      this.settings.colorblindMode = val;
      this.saveSettings();
    });

    // Close button
    const closeBtn = this.add.circle(GAME_WIDTH / 2 + 135, GAME_HEIGHT / 2 - 115, 16, 0xff4d4d, 0.8);
    closeBtn.setStrokeStyle(2, 0xffffff, 0.5);
    closeBtn.setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH / 2 + 135, GAME_HEIGHT / 2 - 115, '\u2715', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => {
      this.scene.stop('SettingsScene');
    });
  }

  private createToggle(x: number, y: number, label: string, initialValue: boolean, onChange: (val: boolean) => void): void {
    // Label
    this.add.text(x - 80, y, label, {
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);

    // Toggle switch
    let isOn = initialValue;
    const track = this.add.rectangle(x + 80, y, 50, 24, isOn ? 0x4dc8ff : 0x333366, 0.8);
    track.setStrokeStyle(1, 0xffffff, 0.3);
    track.setInteractive({ useHandCursor: true });

    const knob = this.add.circle(x + (isOn ? 92 : 68), y, 10, 0xffffff, 0.9);

    const statusText = this.add.text(x + 115, y, isOn ? 'ON' : 'OFF', {
      fontSize: '11px',
      color: isOn ? '#4dc8ff' : '#666666',
    }).setOrigin(0, 0.5);

    track.on('pointerdown', () => {
      isOn = !isOn;
      track.setFillStyle(isOn ? 0x4dc8ff : 0x333366, 0.8);
      this.tweens.add({
        targets: knob,
        x: x + (isOn ? 92 : 68),
        duration: 150,
        ease: 'Power2',
      });
      statusText.setText(isOn ? 'ON' : 'OFF');
      statusText.setColor(isOn ? '#4dc8ff' : '#666666');
      onChange(isOn);
    });
  }

  private saveSettings(): void {
    this.saveManager.updateSettings(this.settings);
  }
}
