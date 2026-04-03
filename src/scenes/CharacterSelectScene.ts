import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SaveManager } from '../systems/SaveManager';
import { createButton, createBackButton, createPanel } from '../ui/UIHelper';

interface CharacterOption {
  key: string;
  label: string;
  frame: number;
}

const CHARACTERS: CharacterOption[] = [
  { key: 'player', label: 'Kai', frame: 13 },
  { key: 'female', label: 'Nova', frame: 13 },
];

export class CharacterSelectScene extends Phaser.Scene {
  private saveManager: SaveManager;
  private selectedKey: string | null = null;
  private slotId: string = 'A';
  private isNewProfile = true;

  constructor() {
    super({ key: 'CharacterSelectScene' });
    this.saveManager = SaveManager.getInstance();
  }

  init(data: { slotId?: string; isNewProfile?: boolean }): void {
    this.slotId = data.slotId ?? 'A';
    this.isNewProfile = data.isNewProfile ?? true;
    this.selectedKey = null;
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a2e);

    this.add.text(GAME_WIDTH / 2, 40, 'Choose Your Hero', {
      fontSize: '22px',
      color: '#ffd94d',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 66, 'The other will be your sidekick!', {
      fontSize: '12px',
      color: '#4dc8ff',
    }).setOrigin(0.5).setAlpha(0.6);

    // Character cards
    const cards: { panel: Phaser.GameObjects.Rectangle; key: string; sprite?: Phaser.GameObjects.Sprite }[] = [];

    for (let i = 0; i < CHARACTERS.length; i++) {
      const char = CHARACTERS[i];
      const x = GAME_WIDTH / 2 + (i === 0 ? -100 : 100);
      const y = GAME_HEIGHT * 0.44;

      const panel = createPanel(this, x, y, 150, 200, 0x4dc8ff);
      panel.setInteractive({ useHandCursor: true });

      let sprite: Phaser.GameObjects.Sprite | undefined;
      if (this.textures.exists(char.key)) {
        sprite = this.add.sprite(x, y - 15, char.key, char.frame);
        sprite.setScale(0.55);
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 3,
          duration: 1200 + i * 200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }

      this.add.text(x, y + 70, char.label, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      cards.push({ panel, key: char.key, sprite });

      panel.on('pointerdown', () => {
        this.selectedKey = char.key;

        for (const card of cards) {
          if (card.key === char.key) {
            card.panel.setStrokeStyle(3, 0xffd94d, 1);
            if (card.sprite) {
              this.tweens.add({
                targets: card.sprite,
                angle: { from: -5, to: 5 },
                duration: 100,
                yoyo: true,
                repeat: 2,
                onComplete: () => { if (card.sprite) card.sprite.angle = 0; },
              });
            }
          } else {
            card.panel.setStrokeStyle(2, 0x4dc8ff, 0.3);
            card.panel.setAlpha(0.5);
            if (card.sprite) card.sprite.setAlpha(0.4);
          }
        }

        confirmContainer.setVisible(true);
      });
    }

    // Confirm button — hidden until selection
    const confirmContainer = createButton({
      scene: this,
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.83,
      label: 'GO!',
      style: 'rect-yellow',
      fontSize: '20px',
      onClick: () => {
        if (!this.selectedKey) return;

        if (this.isNewProfile) {
          this.saveManager.createProfile(this.slotId, this.selectedKey);
        } else {
          const profile = this.saveManager.getActiveProfile();
          if (profile) {
            profile.characterKey = this.selectedKey;
            this.saveManager.saveProfile(profile);
          }
        }

        this.scene.start('LevelSelectScene');
      },
    });
    confirmContainer.setVisible(false);

    createBackButton(this, 50, GAME_HEIGHT - 36, () => {
      this.scene.start('ProfileSelectScene');
    });
  }
}
