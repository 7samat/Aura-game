import Phaser from 'phaser';
import { AuraColor, AURA_HEX, GAME_HEIGHT } from '../config';
import { AuraSystem } from './AuraSystem';

const GATE_WIDTH = 16;
const GROUND_Y = GAME_HEIGHT - 32;
const SLAT_HEIGHT = 4;
const SLAT_GAP = 3;

/**
 * Full-height energy wall barrier. Requires a specific aura color to pass.
 * Visually rendered as a vertical force field with horizontal energy slats.
 */
export class AuraGate extends Phaser.GameObjects.Container {
  readonly requiredColor: AuraColor;
  private auraSystem: AuraSystem;
  private isOpen = false;
  private gateX: number;
  private beamGraphics: Phaser.GameObjects.Graphics;
  private outerGlow: Phaser.GameObjects.Rectangle;
  private coreGlow: Phaser.GameObjects.Rectangle;
  private hintIcon: Phaser.GameObjects.Arc;
  private particles: Phaser.GameObjects.Arc[] = [];
  public physicsBody: Phaser.GameObjects.Rectangle;
  private hex: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    _y: number,        // ignored — gate always spans full height
    _width: number,    // ignored — gate uses GATE_WIDTH
    _height: number,   // ignored — gate spans ground to top
    requiredColor: AuraColor,
    auraSystem: AuraSystem,
  ) {
    super(scene, x, 0);

    this.gateX = x;
    this.requiredColor = requiredColor;
    this.auraSystem = auraSystem;
    this.hex = AURA_HEX[requiredColor] ?? 0xffffff;

    scene.add.existing(this);

    // Physics body — full height, invisible
    const bodyH = GROUND_Y;
    this.physicsBody = scene.add.rectangle(x, bodyH / 2, GATE_WIDTH + 8, bodyH);
    this.physicsBody.setVisible(false);
    scene.physics.add.existing(this.physicsBody, true);

    // Outer glow — soft wide bloom
    this.outerGlow = scene.add.rectangle(x, bodyH / 2, GATE_WIDTH + 20, bodyH, this.hex, 0.1);
    this.setDepth(5);

    // Core glow — narrow bright center
    this.coreGlow = scene.add.rectangle(x, bodyH / 2, 4, bodyH, 0xffffff, 0.3);

    // Beam graphics — horizontal energy slats
    this.beamGraphics = scene.add.graphics();
    this.drawSlats(1);

    // Hint icon at top
    this.hintIcon = scene.add.circle(x, 20, 16, this.hex, 0.9);
    this.hintIcon.setStrokeStyle(2, 0xffffff, 0.6);

    // Hint pulse
    scene.tweens.add({
      targets: this.hintIcon,
      scale: { from: 1, to: 1.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Outer glow pulse
    scene.tweens.add({
      targets: this.outerGlow,
      alpha: { from: 0.08, to: 0.18 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Core flicker
    scene.tweens.add({
      targets: this.coreGlow,
      alpha: { from: 0.2, to: 0.5 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Floating particles along the beam
    for (let i = 0; i < 6; i++) {
      const py = Math.random() * GROUND_Y;
      const p = scene.add.circle(x + (Math.random() - 0.5) * 10, py, 2, this.hex, 0.6);
      this.particles.push(p);
      scene.tweens.add({
        targets: p,
        x: x + (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 15),
        alpha: 0,
        duration: 600 + Math.random() * 600,
        delay: i * 200,
        repeat: -1,
        yoyo: false,
        onRepeat: () => {
          p.setPosition(x + (Math.random() - 0.5) * 6, Math.random() * GROUND_Y);
          p.setAlpha(0.6);
        },
      });
    }

    // Slat ripple animation — redraw every 300ms with slight variation
    scene.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        if (!this.isOpen) {
          this.drawSlats(0.8 + Math.random() * 0.4);
        }
      },
    });
  }

  /** Access the physics body for collider registration */
  getBody(): Phaser.Physics.Arcade.StaticBody {
    return this.physicsBody.body as Phaser.Physics.Arcade.StaticBody;
  }

  update(): void {
    if (this.isOpen) return;

    if (this.auraSystem.hasColor(this.requiredColor)) {
      this.open();
    }
  }

  wobble(): void {
    if (this.isOpen) return;
    // Flash the beam brighter
    this.scene.tweens.add({
      targets: this.outerGlow,
      alpha: 0.4,
      duration: 80,
      yoyo: true,
      repeat: 3,
    });
    // Shake hint icon
    this.scene.tweens.add({
      targets: this.hintIcon,
      x: this.gateX + 4,
      duration: 50,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.easeInOut',
    });
  }

  private open(): void {
    this.isOpen = true;

    const body = this.physicsBody.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = false;

    // Phase 1: Rapid flicker (150ms)
    this.scene.tweens.add({
      targets: [this.outerGlow, this.coreGlow],
      alpha: { from: 0.8, to: 0 },
      duration: 150,
      repeat: 2,
      yoyo: true,
    });

    // Phase 2: Slats collapse from center outward
    this.scene.time.delayedCall(200, () => {
      this.beamGraphics.clear();

      // Particle burst — 20 circles exploding outward
      for (let i = 0; i < 20; i++) {
        const py = Math.random() * GROUND_Y;
        const burst = this.scene.add.circle(this.gateX, py, 3, this.hex, 0.8);
        burst.setBlendMode(Phaser.BlendModes.ADD);
        this.scene.tweens.add({
          targets: burst,
          x: this.gateX + (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 40),
          alpha: 0,
          scale: 0.2,
          duration: 300 + Math.random() * 200,
          onComplete: () => burst.destroy(),
        });
      }

      // Play sfx if available
      if (this.scene.textures.exists('sfx-spark-burst')) {
        const sfx = this.scene.add.sprite(this.gateX, GROUND_Y / 2, 'sfx-spark-burst');
        sfx.setTint(this.hex);
        sfx.setBlendMode(Phaser.BlendModes.ADD);
        sfx.setScale(1.5);
        sfx.play('sfx-spark-burst');
        sfx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sfx.destroy());
      }
    });

    // Phase 3: Fade everything out
    this.scene.time.delayedCall(400, () => {
      this.scene.tweens.add({
        targets: [this.outerGlow, this.coreGlow, this.hintIcon, ...this.particles],
        alpha: 0,
        duration: 300,
        onComplete: () => {
          // Clean up
          this.outerGlow.destroy();
          this.coreGlow.destroy();
          this.hintIcon.destroy();
          this.beamGraphics.destroy();
          this.particles.forEach(p => p.destroy());
        },
      });
    });
  }

  private drawSlats(intensityMultiplier: number): void {
    this.beamGraphics.clear();
    const x = this.gateX;

    for (let sy = 0; sy < GROUND_Y; sy += SLAT_HEIGHT + SLAT_GAP) {
      const isEven = Math.floor(sy / (SLAT_HEIGHT + SLAT_GAP)) % 2 === 0;
      const alpha = (isEven ? 0.5 : 0.35) * intensityMultiplier;

      this.beamGraphics.fillStyle(this.hex, alpha);
      this.beamGraphics.fillRect(x - GATE_WIDTH / 2, sy, GATE_WIDTH, SLAT_HEIGHT);
    }
  }

  destroy(fromScene?: boolean): void {
    this.outerGlow?.destroy();
    this.coreGlow?.destroy();
    this.hintIcon?.destroy();
    this.beamGraphics?.destroy();
    this.physicsBody?.destroy();
    this.particles.forEach(p => p?.destroy());
    super.destroy(fromScene);
  }
}
