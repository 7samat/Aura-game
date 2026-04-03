import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SaveManager } from '../systems/SaveManager';
import { LEVELS } from '../data/LevelManifest';
import { createBackButton, createPanel } from '../ui/UIHelper';

const TROPHY_COLORS: Record<string, number> = {
  empty: 0x333366,
  half: 0xffd94d,
  full: 0xff4d4d,
  sparkling: 0x4dc8ff,
};

export class LevelSelectScene extends Phaser.Scene {
  private saveManager: SaveManager;

  constructor() {
    super({ key: 'LevelSelectScene' });
    this.saveManager = SaveManager.getInstance();
  }

  create(): void {
    const profile = this.saveManager.getActiveProfile();
    if (!profile) {
      this.scene.start('ProfileSelectScene');
      return;
    }

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a2e);

    this.add.text(GAME_WIDTH / 2, 40, 'Choose a Level', {
      fontSize: '20px',
      color: '#4dc8ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Character idle in corner
    if (this.textures.exists(profile.characterKey)) {
      const char = this.add.sprite(GAME_WIDTH - 70, GAME_HEIGHT - 55, profile.characterKey, 18);
      char.setScale(0.4);
      this.tweens.add({
        targets: char,
        y: char.y - 4,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Level nodes
    const nodeGap = 160;
    const totalWidth = (LEVELS.length - 1) * nodeGap;
    const startX = (GAME_WIDTH - totalWidth) / 2;
    const nodeY = GAME_HEIGHT * 0.48;

    // Connecting path
    const path = this.add.graphics();
    path.lineStyle(3, 0x4dc8ff, 0.2);
    path.beginPath();
    path.moveTo(startX, nodeY);
    path.lineTo(startX + totalWidth, nodeY);
    path.strokePath();

    for (let i = 0; i < LEVELS.length; i++) {
      const level = LEVELS[i];
      const x = startX + i * nodeGap;
      const isUnlocked = profile.unlockedLevels.includes(level.id);
      const stat = profile.levelStats[level.id];

      this.createLevelNode(x, nodeY, level, i, isUnlocked, stat);
    }

    createBackButton(this, 50, GAME_HEIGHT - 36, () => {
      this.scene.start('ProfileSelectScene');
    });
  }

  private createLevelNode(
    x: number,
    y: number,
    level: typeof LEVELS[number],
    index: number,
    unlocked: boolean,
    stat?: { trophy: string },
  ): void {
    const nodeColor = unlocked ? 0x2a2a5a : 0x1a1a3a;
    const borderColor = unlocked ? 0x4dc8ff : 0x333366;

    // Use round button sprite if available
    const hasRoundBtn = this.textures.exists('btn-round-blue');

    if (hasRoundBtn && unlocked) {
      const btn = this.add.image(x, y, 'btn-round-blue');
      btn.setScale(1.1);
      btn.setInteractive({ useHandCursor: true });

      // Pulse on latest unlocked without completion
      if (!stat) {
        this.tweens.add({
          targets: btn,
          scale: { from: 1.1, to: 1.2 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }

      btn.on('pointerdown', () => {
        this.scene.start('PreloadScene', { levelId: level.id });
      });
    } else {
      const node = this.add.circle(x, y, 36, nodeColor, 0.9);
      node.setStrokeStyle(3, borderColor, unlocked ? 0.8 : 0.3);

      if (unlocked) {
        node.setInteractive({ useHandCursor: true });
        if (!stat) {
          this.tweens.add({
            targets: node,
            scale: { from: 1, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1,
          });
        }
        node.on('pointerdown', () => {
          this.scene.start('PreloadScene', { levelId: level.id });
        });
      }
    }

    // Level number
    this.add.text(x, y, String(index + 1), {
      fontSize: '20px',
      color: unlocked ? '#ffffff' : '#555555',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Lock icon
    if (!unlocked) {
      this.add.text(x, y + 2, '\uD83D\uDD12', { fontSize: '16px' }).setOrigin(0.5);
    }

    // Level name
    this.add.text(x, y + 50, level.name, {
      fontSize: '11px',
      color: unlocked ? '#4dc8ff' : '#555555',
    }).setOrigin(0.5);

    // Difficulty dots
    for (let d = 0; d < level.difficulty; d++) {
      this.add.circle(x - (level.difficulty - 1) * 6 + d * 12, y + 66, 3, unlocked ? 0xffd94d : 0x333366);
    }

    // Trophy
    if (stat?.trophy && stat.trophy !== 'empty') {
      const trophyColor = TROPHY_COLORS[stat.trophy] ?? 0xffd94d;
      const trophy = this.add.circle(x + 28, y - 28, 8, trophyColor, 1);
      trophy.setStrokeStyle(1, 0xffffff, 0.5);
      if (stat.trophy === 'sparkling') {
        this.tweens.add({
          targets: trophy,
          scale: { from: 1, to: 1.3 },
          duration: 600,
          yoyo: true,
          repeat: -1,
        });
      }
    }
  }
}
