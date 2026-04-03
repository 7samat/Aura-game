import Phaser from 'phaser';
import { AuraColor, AURA_HEX } from '../config';
import { SaveManager } from '../systems/SaveManager';

type CompanionState = 'idle' | 'following' | 'cheering';

/**
 * Sidekick companion — the unchosen character from character selection.
 * Follows the player autonomously, cheers on spark collection and gate passage.
 */
export class Companion extends Phaser.Physics.Arcade.Sprite {
  private companionState: CompanionState = 'idle';
  private targetX = 0;
  private targetY = 0;
  private followOffset = -80; // trail behind player
  private glow: Phaser.GameObjects.Ellipse;
  private cheerTimer = 0;
  private hasAnimations: boolean;
  private spriteKey: string;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Determine which character is the sidekick
    const profile = SaveManager.getInstance().getActiveProfile();
    const playerKey = profile?.characterKey ?? 'player';
    const sidekickKey = playerKey === 'player' ? 'female' : 'player';
    const useKey = scene.textures.exists(sidekickKey) ? sidekickKey : 'npc';

    super(scene, x, y, useKey);

    this.spriteKey = useKey;
    this.hasAnimations = scene.textures.getFrame(useKey, 0)?.width === 80;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Slightly smaller than player
    if (this.hasAnimations) {
      this.setScale(0.35);
    }

    this.setCollideWorldBounds(true);
    this.setDepth(8);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.hasAnimations) {
      body.setSize(50, 90);
      body.setOffset(15, 15);
    } else {
      body.setSize(20, 28);
      body.setOffset(6, 4);
    }

    // Ambient white glow (Reo: distinguishes sidekick from player)
    this.glow = scene.add.ellipse(x, y, 40, 44, 0xffffff, 0.15);
    this.glow.setDepth(7);

    // Gentle glow pulse
    scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.1, to: 0.2 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Start idle
    if (this.hasAnimations) {
      this.play(`${this.spriteKey}-idle`);
    }

    // Listen for spark collection → cheer
    scene.events.on('spark-collected', this.onSparkCollected, this);
  }

  /** Called each frame from GameScene */
  follow(playerX: number, playerY: number): void {
    if (this.companionState === 'cheering') {
      this.glow.setPosition(this.x, this.y);
      return;
    }

    this.companionState = 'following';
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Target position: behind the player
    this.targetX = playerX + this.followOffset;
    this.targetY = playerY;

    // Horizontal movement — proportional to distance
    const dx = this.targetX - this.x;
    const speed = Math.abs(dx) > 5 ? Phaser.Math.Clamp(dx * 3, -160, 160) : 0;
    body.setVelocityX(speed);

    // Face the right direction
    if (speed < -5) this.setFlipX(true);
    else if (speed > 5) this.setFlipX(false);

    // Jump when player is significantly above
    if (playerY < this.y - 40 && body.blocked.down) {
      body.setVelocityY(-350);
    }

    // Animation
    if (this.hasAnimations) {
      if (!body.blocked.down) {
        this.playAnim('jump');
      } else if (Math.abs(speed) > 10) {
        this.playAnim('run');
      } else {
        this.playAnim('idle');
      }
    }

    // Update glow
    this.glow.setPosition(this.x, this.y);

    // Update follow offset direction (stay behind player's movement direction)
    if (body.velocity.x > 20) {
      this.followOffset = -80;
    } else if (body.velocity.x < -20) {
      this.followOffset = 80;
    }
  }

  private onSparkCollected(): void {
    if (this.companionState === 'cheering') return;

    this.companionState = 'cheering';

    // Play cheer animation
    if (this.hasAnimations) {
      this.play(`${this.spriteKey}-cheer`);
    }

    // Cheer bounce
    this.scene.tweens.add({
      targets: this,
      y: this.y - 12,
      duration: 150,
      yoyo: true,
      ease: 'Power2',
    });

    // Glow flash
    this.scene.tweens.add({
      targets: this.glow,
      alpha: 0.5,
      scale: 1.3,
      duration: 200,
      yoyo: true,
    });

    // Return to following after cheer
    this.scene.time.delayedCall(800, () => {
      this.companionState = 'following';
    });
  }

  private playAnim(name: string): void {
    const key = `${this.spriteKey}-${name}`;
    if (this.anims.currentAnim?.key !== key) {
      this.play(key, true);
    }
  }

  destroy(fromScene?: boolean): void {
    this.scene?.events?.off('spark-collected', this.onSparkCollected, this);
    this.glow?.destroy();
    super.destroy(fromScene);
  }
}
