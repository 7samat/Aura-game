import { ENEMY_SPEED } from '../config';
import { ENEMY_SPRITES } from '../data/AssetManifest';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private patrolLeft: number;
  private patrolRight: number;
  private moveDirection = 1;
  private hasRealSprites: boolean;
  private walkToggle = false;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolRange: number = 100) {
    // Use first real sprite if available, otherwise placeholder
    const hasReal = scene.textures.exists('enemy-idle');
    const textureKey = hasReal ? 'enemy-idle' : 'enemy';
    super(scene, x, y, textureKey);

    this.hasRealSprites = hasReal;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.patrolLeft = x - patrolRange;
    this.patrolRight = x + patrolRange;

    // Scale down the large robot PNGs (~180x128) to game size
    if (this.hasRealSprites) {
      this.setScale(0.22); // ~180x128 → ~40x28 effective
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.hasRealSprites) {
      body.setSize(140, 110);
      body.setOffset(20, 10);
    } else {
      body.setSize(24, 24);
      body.setOffset(4, 8);
    }
    body.setCollideWorldBounds(true);

    // Simple walk animation via timer (swap between drive1/drive2)
    if (this.hasRealSprites) {
      scene.time.addEvent({
        delay: 300,
        loop: true,
        callback: () => {
          if (!this.active) return;
          this.walkToggle = !this.walkToggle;
          this.setTexture(this.walkToggle ? 'enemy-walk1' : 'enemy-walk2');
        },
      });
    }
  }

  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    body.setVelocityX(ENEMY_SPEED * this.moveDirection);

    if (this.x <= this.patrolLeft) {
      this.moveDirection = 1;
      this.setFlipX(true); // Robot faces right by default, flip for left
    } else if (this.x >= this.patrolRight) {
      this.moveDirection = -1;
      this.setFlipX(false);
    }
  }

  stomp(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    body.setVelocity(0, 0);

    if (this.hasRealSprites) {
      this.setTexture('enemy-hurt');
    }

    this.scene.tweens.add({
      targets: this,
      scaleY: this.hasRealSprites ? 0.05 : 0.1,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
