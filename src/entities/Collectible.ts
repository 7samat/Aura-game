import { AuraColor, AURA_HEX, SPARK_SIZE, SPARK_PULSE_DURATION } from '../config';
import { CollectibleDef } from '../data/LevelSchema';

// Map aura colors to gem sprite keys
const GEM_KEYS: Record<string, string> = {
  [AuraColor.BLUE]: 'gem-blue',
  [AuraColor.RED]: 'gem-red',
  [AuraColor.YELLOW]: 'gem-yellow',
};

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  readonly collectibleId: string;
  readonly sparkColor: AuraColor;
  readonly hidden: boolean;
  readonly scoreValue: number;
  private glow: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, def: CollectibleDef) {
    const color = def.color ?? AuraColor.NONE;
    const isHidden = def.hidden ?? false;

    // Use gem sprite if available, otherwise fall back to generated texture
    const gemKey = GEM_KEYS[color];
    const hasGemSprite = gemKey && scene.textures.exists(gemKey);
    const texKey = hasGemSprite ? gemKey : Collectible.ensureTexture(scene, color, isHidden);

    super(scene, def.x, def.y, texKey);

    this.collectibleId = def.id;
    this.sparkColor = color;
    this.hidden = isHidden;
    this.scoreValue = this.hidden ? 2 : 1;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    // Scale gem sprites down (64x64 → ~20x20)
    if (hasGemSprite) {
      this.setScale(0.32);
    }

    // Hidden sparks use diamond sprite or white glow
    if (this.hidden && scene.textures.exists('diamond-blue')) {
      this.setTexture('diamond-blue');
      this.setScale(0.28);
    }

    // Physics body
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    const bodySize = hasGemSprite ? 16 : SPARK_SIZE + 4;
    body.setCircle(bodySize);
    body.setOffset(
      hasGemSprite ? (64 - bodySize * 2) / 2 : -4,
      hasGemSprite ? (64 - bodySize * 2) / 2 : -4
    );

    // Outer glow
    const hex = this.getHex();
    this.glow = scene.add.circle(def.x, def.y, hasGemSprite ? 14 : SPARK_SIZE + 6, hex, this.hidden ? 0.08 : 0.2);
    this.glow.setDepth(this.depth - 1);

    // Pulse animation
    scene.tweens.add({
      targets: [this, this.glow],
      scaleX: { from: this.scaleX, to: this.scaleX * 1.15 },
      scaleY: { from: this.scaleY, to: this.scaleY * 1.15 },
      duration: SPARK_PULSE_DURATION,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Slow rotation for gems
    if (hasGemSprite && !this.hidden) {
      scene.tweens.add({
        targets: this,
        angle: { from: -8, to: 8 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Hidden sparks: very faint until player is near
    if (this.hidden) {
      this.setAlpha(0.12);
      this.glow.setAlpha(0.04);
    }
  }

  revealIfNear(playerX: number, playerY: number): void {
    if (!this.hidden || !this.active) return;
    const dist = Phaser.Math.Distance.Between(playerX, playerY, this.x, this.y);
    if (dist < 96) {
      const t = Phaser.Math.Clamp(1 - (dist / 96), 0, 1);
      this.setAlpha(0.12 + t * 0.7);
      this.glow.setAlpha(0.04 + t * 0.3);
    } else {
      this.setAlpha(0.12);
      this.glow.setAlpha(0.04);
    }
  }

  syncGlow(): void {
    this.glow.setPosition(this.x, this.y);
  }

  collect(): void {
    if (!this.active) return;
    this.active = false;

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = false;

    // Play SFX animation if available
    if (this.scene.textures.exists('sfx-coin-burst')) {
      const sfx = this.scene.add.sprite(this.x, this.y, 'sfx-coin-burst');
      sfx.setScale(0.5);
      sfx.setDepth(100);
      sfx.play('sfx-coin-burst');
      sfx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sfx.destroy());
    }

    // Burst effect on the gem itself
    this.scene.tweens.add({
      targets: this,
      scaleX: this.scaleX * 2,
      scaleY: this.scaleY * 2,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => this.destroy(),
    });

    this.scene.tweens.add({
      targets: this.glow,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 250,
    });

    this.scene.events.emit('spark-collected', {
      id: this.collectibleId,
      hidden: this.hidden,
      value: this.scoreValue,
    });
  }

  private getHex(): number {
    if (this.hidden) return 0xffffff;
    return AURA_HEX[this.sparkColor] ?? 0xffffff;
  }

  private static ensureTexture(scene: Phaser.Scene, color: AuraColor, hidden: boolean): string {
    const key = hidden ? 'spark-hidden' : `spark-${color}`;
    if (scene.textures.exists(key)) return key;

    const hex = hidden ? 0xffffff : (AURA_HEX[color] ?? 0xffffff);
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(hex, 0.4);
    g.fillCircle(SPARK_SIZE + 2, SPARK_SIZE + 2, SPARK_SIZE + 2);
    g.fillStyle(hex, 1);
    g.fillCircle(SPARK_SIZE + 2, SPARK_SIZE + 2, SPARK_SIZE - 2);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(SPARK_SIZE + 2, SPARK_SIZE + 2, SPARK_SIZE / 3);
    g.generateTexture(key, (SPARK_SIZE + 2) * 2, (SPARK_SIZE + 2) * 2);
    g.destroy();

    return key;
  }

  destroy(fromScene?: boolean): void {
    this.glow?.destroy();
    super.destroy(fromScene);
  }
}
