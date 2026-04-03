import Phaser from 'phaser';
import { AURA_HEX, AuraColor } from '../config';
import { AuraSystem } from '../systems/AuraSystem';

export class UIScene extends Phaser.Scene {
  private auraIndicator!: Phaser.GameObjects.Arc;
  private auraIndicatorBorder!: Phaser.GameObjects.Arc;
  private sparkIcon!: Phaser.GameObjects.Arc;
  private sparkText!: Phaser.GameObjects.Text;
  private sparksCollected = 0;
  private totalSparks = 0;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { totalSparks?: number }): void {
    this.totalSparks = data?.totalSparks ?? 0;
    this.sparksCollected = 0;
  }

  create(): void {
    // Clean up any stale listeners from previous runs (Sam: prevent stacking)
    this.game.events.off(AuraSystem.AURA_CHANGED, this.onAuraChanged, this);
    this.game.events.off('spark-collected', this.onSparkCollected, this);

    const w = this.scale.width;

    // Aura color indicator — top-left area
    this.auraIndicatorBorder = this.add.circle(28, 28, 16, 0xffffff, 0.3);
    this.auraIndicatorBorder.setStrokeStyle(2, 0xffffff, 0.5);
    this.auraIndicator = this.add.circle(28, 28, 12, 0x333366, 0.5);

    // Spark counter — top-center (Lea: large icon + number in rounded bubble)
    const cx = w / 2;
    this.sparkIcon = this.add.circle(cx - 20, 24, 8, 0xffd94d, 0.9);
    this.sparkIcon.setStrokeStyle(1, 0xffffff, 0.5);

    // Spark counter background bubble
    const bubble = this.add.rectangle(cx + 8, 24, 50, 22, 0x0a0a2e, 0.7);
    bubble.setStrokeStyle(1, 0x4dc8ff, 0.3);

    this.sparkText = this.add.text(cx + 8, 24, `0`, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Listen for aura changes
    this.game.events.on(AuraSystem.AURA_CHANGED, this.onAuraChanged, this);

    // Listen for spark collection
    this.game.events.on('spark-collected', this.onSparkCollected, this);
  }

  private onAuraChanged(state: { color: AuraColor } | null): void {
    if (!state || state.color === AuraColor.NONE) {
      this.auraIndicator.setFillStyle(0x333366, 0.5);
      return;
    }

    const hex = AURA_HEX[state.color] ?? 0xffffff;
    this.auraIndicator.setFillStyle(hex, 1);

    this.tweens.add({
      targets: [this.auraIndicator, this.auraIndicatorBorder],
      scale: { from: 1.4, to: 1 },
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  private onSparkCollected(data: { collected: number; total: number }): void {
    this.sparksCollected = data.collected;
    this.sparkText.setText(`${data.collected}`);

    // Pop animation on the counter
    this.tweens.add({
      targets: [this.sparkIcon, this.sparkText],
      scale: { from: 1.3, to: 1 },
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  shutdown(): void {
    this.game.events.off(AuraSystem.AURA_CHANGED, this.onAuraChanged, this);
    this.game.events.off('spark-collected', this.onSparkCollected, this);
  }
}
