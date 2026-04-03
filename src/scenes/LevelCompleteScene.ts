import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SaveManager } from '../systems/SaveManager';
import { LEVELS } from '../data/LevelManifest';

export type TrophyState = 'empty' | 'half' | 'full' | 'sparkling';

interface LevelCompleteData {
  sparksCollected: number;
  totalSparks: number;
  timeMs: number;
  levelId: string;
  thresholds?: { half: number; full: number };
  nextLevelId?: string;
}

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  create(data: LevelCompleteData): void {
    const trophy = this.calculateTrophy(data);

    // Save progress
    const saveManager = SaveManager.getInstance();
    saveManager.completeLevel(data.levelId, data.sparksCollected, data.totalSparks, data.timeMs, trophy);

    // Determine next level
    const currentIndex = LEVELS.findIndex(l => l.id === data.levelId);
    const nextLevel = currentIndex >= 0 && currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
    data.nextLevelId = nextLevel?.id;

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a2e, 0);
    this.tweens.add({
      targets: overlay,
      fillAlpha: 0.92,
      duration: 400,
    });

    // Celebration particles
    this.time.delayedCall(300, () => {
      this.createCelebration(trophy);
    });

    // "LEVEL CLEAR" text
    const title = this.add.text(GAME_WIDTH / 2, -40, 'LEVEL CLEAR', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#ffd94d',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title,
      y: GAME_HEIGHT * 0.25,
      alpha: 1,
      duration: 600,
      delay: 400,
      ease: 'Back.easeOut',
    });

    // Trophy display
    this.time.delayedCall(800, () => {
      this.showTrophy(trophy);
    });

    // Spark count
    const sparkText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.65, '', {
      fontSize: '16px',
      color: '#4dc8ff',
    }).setOrigin(0.5).setAlpha(0);

    this.time.delayedCall(1400, () => {
      sparkText.setText(`${data.sparksCollected} / ${data.totalSparks}`);
      this.tweens.add({
        targets: sparkText,
        alpha: 1,
        duration: 300,
      });
    });

    // NEXT button (auto-focuses after 2.5s per Lea's guidelines)
    this.time.delayedCall(2000, () => {
      this.createNextButton(data.nextLevelId);
    });
  }

  private calculateTrophy(data: LevelCompleteData): TrophyState {
    const ratio = data.totalSparks > 0 ? data.sparksCollected / data.totalSparks : 0;
    const halfThreshold = data.thresholds?.half ?? 0.6;
    const fullThreshold = data.thresholds?.full ?? 1.0;

    if (ratio >= fullThreshold) {
      // Sparkling: collected all + fast time (hidden criteria)
      const estimatedMs = (data.thresholds ? 180 : 180) * 1000;
      if (data.timeMs < estimatedMs * 0.7) {
        return 'sparkling';
      }
      return 'full';
    }
    if (ratio >= halfThreshold) return 'half';
    return 'empty';
  }

  private showTrophy(state: TrophyState): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT * 0.45;
    const gemColors = [0xff4d4d, 0x4dc8ff, 0xffd94d];
    const gemsToFill = state === 'empty' ? 0 : state === 'half' ? 1 : state === 'full' ? 3 : 3;

    for (let i = 0; i < 3; i++) {
      const gx = cx + (i - 1) * 40;

      // Dark gem slot
      const slot = this.add.circle(gx, cy - 30, 14, 0x2a2a4a, 1);
      slot.setStrokeStyle(2, 0x4dc8ff, 0.3);

      // Drop from above
      slot.y = -30;
      this.tweens.add({
        targets: slot,
        y: cy,
        duration: 400,
        delay: i * 150,
        ease: 'Bounce.easeOut',
      });

      // Fill gem if earned
      if (i < gemsToFill) {
        const gem = this.add.circle(gx, -30, 12, gemColors[i], 0);
        this.tweens.add({
          targets: gem,
          y: cy,
          duration: 400,
          delay: i * 150,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: gem,
              alpha: 1,
              duration: 200,
            });
          },
        });

        // Sparkle for sparkling trophy
        if (state === 'sparkling') {
          this.time.delayedCall(800 + i * 150, () => {
            this.tweens.add({
              targets: gem,
              scale: { from: 1, to: 1.3 },
              duration: 400,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
          });
        }
      }
    }
  }

  private createCelebration(trophy: TrophyState): void {
    const colors = [0xff4d4d, 0x4dc8ff, 0xffd94d];
    const count = trophy === 'sparkling' ? 40 : trophy === 'full' ? 25 : 15;

    for (let i = 0; i < count; i++) {
      const color = colors[i % 3];
      const px = GAME_WIDTH * 0.2 + Math.random() * GAME_WIDTH * 0.6;
      const particle = this.add.circle(px, GAME_HEIGHT + 10, 3 + Math.random() * 3, color, 0.8);

      this.tweens.add({
        targets: particle,
        y: GAME_HEIGHT * 0.1 + Math.random() * GAME_HEIGHT * 0.3,
        x: particle.x + (Math.random() - 0.5) * 100,
        alpha: 0,
        duration: 1200 + Math.random() * 800,
        delay: Math.random() * 400,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private createNextButton(nextLevelId?: string): void {
    const bx = GAME_WIDTH / 2;
    const by = GAME_HEIGHT * 0.82;

    // Use real Kenney button if available
    const hasBtn = this.textures.exists('btn-rect-green');
    let clickTarget: Phaser.GameObjects.GameObject;

    if (hasBtn) {
      const btn = this.add.image(bx, by, 'btn-rect-green');
      btn.setScale(0.9);
      btn.setInteractive({ useHandCursor: true });
      clickTarget = btn;

      // Arrow icon
      if (this.textures.exists('arrow-right')) {
        this.add.image(bx, by - 1, 'arrow-right').setScale(1.2);
      }

      this.add.text(bx - 30, by - 1, 'NEXT', {
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 1,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: btn,
        scale: { from: 0.9, to: 0.98 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 500,
      });
    } else {
      const btn = this.add.circle(bx, by, 28, 0x4dc8ff, 0.8);
      btn.setStrokeStyle(3, 0xffffff, 0.6);
      btn.setInteractive({ useHandCursor: true });
      clickTarget = btn;

      this.add.triangle(bx + 3, by, 0, 0, 16, 10, 0, 20, 0xffffff).setOrigin(0.5);

      this.tweens.add({
        targets: btn,
        scale: { from: 1, to: 1.1 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 500,
      });
    }

    clickTarget.on('pointerdown', () => {
      this.scene.stop('LevelCompleteScene');
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      if (nextLevelId) {
        this.scene.start('PreloadScene', { levelId: nextLevelId });
      } else {
        this.scene.start('LevelSelectScene');
      }
    });
  }
}
