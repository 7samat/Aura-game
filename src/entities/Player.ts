import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY, AURA_HEX, AuraColor } from '../config';
import { InputManager } from '../utils/InputManager';
import { AuraSystem } from '../systems/AuraSystem';
import { SPRITES } from '../data/AssetManifest';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private inputManager: InputManager;
  private auraSystem: AuraSystem;
  private auraGlow: Phaser.GameObjects.Ellipse;
  private glowPulseTween: Phaser.Tweens.Tween | null = null;
  private inColorZone: AuraColor = AuraColor.NONE;
  private canJump = true;
  private wasAirborne = false;
  private actionPrompt: Phaser.GameObjects.Text;
  private hasAnimations: boolean;
  private spriteKey: string;

  constructor(scene: Phaser.Scene, x: number, y: number, inputManager: InputManager, auraSystem: AuraSystem, spriteKey: string = 'player') {
    super(scene, x, y, spriteKey);

    this.spriteKey = spriteKey;
    this.inputManager = inputManager;
    this.auraSystem = auraSystem;
    this.hasAnimations = scene.textures.getFrame(spriteKey, 0)?.width === 80;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale down the large Kenney sprites (80x110) to fit the game world
    if (this.hasAnimations) {
      this.setScale(0.4); // 80x110 → 32x44 effective size
    }

    this.setCollideWorldBounds(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.hasAnimations) {
      body.setSize(50, 90);   // hitbox within the 80x110 frame
      body.setOffset(15, 15);
    } else {
      body.setSize(24, 32);
      body.setOffset(4, 0);
    }

    // Aura glow — visible halo around the character
    this.setDepth(10);
    const glowSize = this.hasAnimations ? 56 : 48;
    this.auraGlow = scene.add.ellipse(x, y, glowSize, glowSize + 10, 0xffffff, 0);
    this.auraGlow.setDepth(9); // just behind player, above everything else
    this.auraGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Action prompt
    this.actionPrompt = scene.add.text(x, y - 28, '● Press!', {
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    // Start idle animation
    if (this.hasAnimations) {
      this.play(`${this.spriteKey}-idle`);
    }

    scene.events.on(AuraSystem.AURA_CHANGED, this.onAuraChanged, this);
  }

  setInColorZone(color: AuraColor): void {
    this.inColorZone = color;
  }

  getInColorZone(): AuraColor {
    return this.inColorZone;
  }

  update(): void {
    const input = this.inputManager.getState();
    const body = this.body as Phaser.Physics.Arcade.Body;
    const abilities = this.auraSystem.getAbilities();

    // Movement
    const speed = PLAYER_SPEED * (abilities.speedBoost > 0 ? abilities.speedBoost : 1);
    if (input.left) {
      body.setVelocityX(-speed);
      this.setFlipX(true);
    } else if (input.right) {
      body.setVelocityX(speed);
      this.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    // Jump
    const jumpVel = PLAYER_JUMP_VELOCITY * (abilities.jumpBoost > 0 ? abilities.jumpBoost : 1);
    if (input.jump && body.blocked.down && this.canJump) {
      body.setVelocityY(jumpVel);
      this.canJump = false;
      this.scene.time.delayedCall(200, () => { this.canJump = true; });
    }

    // Jump stretch
    if (input.jump && body.blocked.down && this.canJump) {
      // Stretch on takeoff
      this.scene.tweens.add({
        targets: this,
        scaleX: this.scaleX * 0.85,
        scaleY: this.scaleY * 1.15,
        duration: 80,
        yoyo: true,
        ease: 'Power2',
      });
    }

    // Landing squash detection
    if (body.blocked.down && this.wasAirborne) {
      this.scene.tweens.add({
        targets: this,
        scaleX: this.scaleX * 1.2,
        scaleY: this.scaleY * 0.8,
        duration: 80,
        yoyo: true,
        ease: 'Power2',
      });
    }
    this.wasAirborne = !body.blocked.down;

    // Action — absorb color from zone
    if (input.action && this.inColorZone !== AuraColor.NONE) {
      this.auraSystem.absorb(this.inColorZone);
    }

    // Animations
    if (this.hasAnimations) {
      this.updateAnimation(body, input);
    }

    // Update glow position
    this.auraGlow.setPosition(this.x, this.y);

    // Action prompt
    this.actionPrompt.setPosition(this.x, this.y - (this.hasAnimations ? 32 : 28));
    if (this.inColorZone !== AuraColor.NONE && !this.auraSystem.hasColor(this.inColorZone)) {
      this.actionPrompt.setAlpha(0.9);
    } else {
      this.actionPrompt.setAlpha(0);
    }
  }

  private updateAnimation(body: Phaser.Physics.Arcade.Body, input: { left: boolean; right: boolean }): void {
    if (!body.blocked.down) {
      if (body.velocity.y < 0) {
        this.playAnim('jump');
      } else {
        this.playAnim('fall');
      }
    } else if (input.left || input.right) {
      this.playAnim('run');
    } else {
      this.playAnim('idle');
    }
  }

  /** Play animation using this character's sprite key prefix */
  private playAnim(name: string): void {
    const key = `${this.spriteKey}-${name}`;
    if (this.anims.currentAnim?.key !== key) {
      this.play(key, true);
    }
  }

  private onAuraChanged(state: { color: AuraColor } | null): void {
    if (this.glowPulseTween) {
      this.glowPulseTween.stop();
      this.glowPulseTween = null;
    }

    if (!state || state.color === AuraColor.NONE) {
      this.auraGlow.setFillStyle(0xffffff, 0);
      return;
    }

    const hex = AURA_HEX[state.color] ?? 0xffffff;
    this.auraGlow.setFillStyle(hex, 0.5);

    // Play charge-up SFX animation on absorption
    if (this.scene.textures.exists('sfx-charge-up')) {
      const sfx = this.scene.add.sprite(this.x, this.y, 'sfx-charge-up');
      sfx.setScale(0.8);
      sfx.setTint(hex);
      sfx.setDepth(100);
      sfx.setBlendMode(Phaser.BlendModes.ADD);
      sfx.play('sfx-charge-up');
      sfx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sfx.destroy());
    }

    this.scene.tweens.add({
      targets: this.auraGlow,
      scaleX: { from: 1.5, to: 1 },
      scaleY: { from: 1.5, to: 1 },
      alpha: { from: 0.7, to: 0.5 },
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.glowPulseTween = this.scene.tweens.add({
      targets: this.auraGlow,
      alpha: { from: 0.4, to: 0.6 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  die(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 30,
      duration: 400,
      onComplete: () => {
        this.scene.events.emit('player-died');
      },
    });
  }

  destroy(fromScene?: boolean): void {
    this.scene.events.off(AuraSystem.AURA_CHANGED, this.onAuraChanged, this);
    this.auraGlow.destroy();
    this.actionPrompt.destroy();
    super.destroy(fromScene);
  }
}
