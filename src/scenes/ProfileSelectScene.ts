import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SaveManager, ProfileSlot } from '../systems/SaveManager';
import { createBackButton, createPanel } from '../ui/UIHelper';

const ANIMAL_LABELS: Record<string, string> = {
  fox: '\uD83E\uDD8A',
  bear: '\uD83D\uDC3B',
  robot: '\uD83E\uDD16',
};

export class ProfileSelectScene extends Phaser.Scene {
  private saveManager: SaveManager;

  constructor() {
    super({ key: 'ProfileSelectScene' });
    this.saveManager = SaveManager.getInstance();
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a2e);

    this.add.text(GAME_WIDTH / 2, 50, 'Choose Your Save', {
      fontSize: '22px',
      color: '#4dc8ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const slotIds = this.saveManager.getSlotIds();
    const slotWidth = 150;
    const gap = 24;
    const totalWidth = slotIds.length * slotWidth + (slotIds.length - 1) * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2 + slotWidth / 2;

    for (let i = 0; i < slotIds.length; i++) {
      const x = startX + i * (slotWidth + gap);
      const y = GAME_HEIGHT * 0.48;
      const profile = this.saveManager.loadProfile(slotIds[i]);

      if (profile) {
        this.createFilledSlot(x, y, profile);
      } else {
        this.createEmptySlot(x, y, slotIds[i]);
      }
    }

    createBackButton(this, 50, GAME_HEIGHT - 36, () => {
      this.scene.start('TitleScene');
    });
  }

  private createFilledSlot(x: number, y: number, profile: ProfileSlot): void {
    const borderColor = parseInt(profile.color.replace('#', ''), 16);
    const card = createPanel(this, x, y, 150, 190, borderColor);
    card.setInteractive({ useHandCursor: true });

    const icon = ANIMAL_LABELS[profile.animalIcon] ?? '?';
    this.add.text(x, y - 55, icon, { fontSize: '40px' }).setOrigin(0.5);

    if (this.textures.exists(profile.characterKey)) {
      const preview = this.add.sprite(x, y + 10, profile.characterKey, 18);
      preview.setScale(0.25);
    }

    const levelsCleared = Object.keys(profile.levelStats).length;
    this.add.text(x, y + 65, `${levelsCleared} levels`, {
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.7);

    card.on('pointerdown', () => {
      this.saveManager.setActiveSlot(profile.id);
      this.scene.start('LevelSelectScene');
    });

    card.on('pointerover', () => {
      this.tweens.add({ targets: card, scaleX: 1.04, scaleY: 1.04, duration: 100 });
    });
    card.on('pointerout', () => {
      this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 100 });
    });
  }

  private createEmptySlot(x: number, y: number, slotId: string): void {
    const card = createPanel(this, x, y, 150, 190, 0x4dc8ff);
    card.setAlpha(0.6);
    card.setInteractive({ useHandCursor: true });

    const plus = this.add.text(x, y - 15, '+', {
      fontSize: '48px',
      color: '#4dc8ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: plus,
      scale: { from: 1, to: 1.2 },
      alpha: { from: 0.5, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.text(x, y + 55, 'New Game', {
      fontSize: '12px',
      color: '#4dc8ff',
    }).setOrigin(0.5).setAlpha(0.5);

    card.on('pointerdown', () => {
      this.scene.start('CharacterSelectScene', { slotId, isNewProfile: true });
    });
  }
}
