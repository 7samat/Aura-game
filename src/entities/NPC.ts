import { AuraColor, AURA_HEX } from '../config';
import { NPC_SPRITE } from '../data/AssetManifest';

/**
 * Onboarding NPC — demonstrates aura absorption by example.
 * Uses the Adventurer character from Kenney Platformer Characters.
 */
export class NPC extends Phaser.Physics.Arcade.Sprite {
  private glow: Phaser.GameObjects.Ellipse;
  private hasDemonstrated = false;
  private hasAnimations: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, NPC_SPRITE.useSpriteSheet ? 'npc' : 'npc');

    this.hasAnimations = NPC_SPRITE.useSpriteSheet;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale down Kenney sprites
    if (this.hasAnimations) {
      this.setScale(0.35); // Slightly smaller than player
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    if (this.hasAnimations) {
      body.setSize(50, 90);
      body.setOffset(15, 15);
    } else {
      body.setSize(20, 28);
      body.setOffset(6, 4);
    }

    // NPC glow
    this.glow = scene.add.ellipse(x, y, 40, 44, 0xffffff, 0);
    this.glow.setDepth(this.depth - 1);

    if (this.hasAnimations) {
      this.play('npc-idle');
    }
  }

  demonstrate(targetX: number, color: AuraColor, gateX: number): void {
    if (this.hasDemonstrated) return;
    this.hasDemonstrated = true;

    const hex = AURA_HEX[color] ?? 0xffffff;

    if (this.hasAnimations) this.play('npc-move');

    // Step 1: Walk to color zone
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      duration: 1500,
      ease: 'Linear',
      onUpdate: () => { this.glow.setPosition(this.x, this.y); },
      onComplete: () => {
        if (this.hasAnimations) this.play('npc-idle');

        // Step 2: Absorb
        this.scene.time.delayedCall(400, () => {
          this.glow.setFillStyle(hex, 0.4);
          this.scene.tweens.add({
            targets: this.glow,
            scaleX: { from: 1.6, to: 1 },
            scaleY: { from: 1.6, to: 1 },
            duration: 300,
            ease: 'Back.easeOut',
          });

          // Step 3: Walk through gate
          this.scene.time.delayedCall(800, () => {
            if (this.hasAnimations) this.play('npc-move');

            this.scene.tweens.add({
              targets: this,
              x: gateX + 60,
              duration: 1500,
              ease: 'Linear',
              onUpdate: () => { this.glow.setPosition(this.x, this.y); },
              onComplete: () => {
                // Step 4: Fade out
                this.scene.tweens.add({
                  targets: [this, this.glow],
                  alpha: 0,
                  x: gateX + 140,
                  duration: 1000,
                  onComplete: () => { this.destroy(); },
                });
              },
            });
          });
        });
      },
    });
  }

  update(): void {
    this.glow.setPosition(this.x, this.y);
  }

  destroy(fromScene?: boolean): void {
    this.glow?.destroy();
    super.destroy(fromScene);
  }
}
