import { AuraColor, AURA_HEX } from '../config';

/**
 * Energy absorption node — the player stands in this zone and presses Action to absorb its color.
 * Visually: a pulsing core orb with concentric rings, orbiting particles, and a beacon pulse.
 */
export class ColorZone extends Phaser.GameObjects.Rectangle {
  readonly auraColor: AuraColor;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color: AuraColor) {
    const hex = AURA_HEX[color] ?? 0xffffff;
    // The rectangle is the physics body — mostly invisible
    super(scene, x, y, width, height, hex, 0.03);

    this.auraColor = color;
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    // ── Base panel ──
    const g = scene.add.graphics();
    const left = x - width / 2;
    const top = y - height / 2;

    // Subtle border
    g.lineStyle(1, hex, 0.3);
    g.strokeRect(left, top, width, height);

    // Corner accent marks (circuit feel)
    const cLen = 8;
    g.lineStyle(2, hex, 0.6);
    g.lineBetween(left, top + cLen, left, top);
    g.lineBetween(left, top, left + cLen, top);
    g.lineBetween(left + width - cLen, top, left + width, top);
    g.lineBetween(left + width, top, left + width, top + cLen);
    g.lineBetween(left, top + height - cLen, left, top + height);
    g.lineBetween(left, top + height, left + cLen, top + height);
    g.lineBetween(left + width - cLen, top + height, left + width, top + height);
    g.lineBetween(left + width, top + height - cLen, left + width, top + height);

    // ── Core orb — pulsing energy center ──
    const orbInner = scene.add.circle(x, y, 6, 0xffffff, 0.9);
    const orbOuter = scene.add.circle(x, y, 10, hex, 0.7);
    orbOuter.setStrokeStyle(2, hex, 0.4);

    // Orb breathing
    scene.tweens.add({
      targets: orbOuter,
      scale: { from: 0.9, to: 1.3 },
      alpha: { from: 0.5, to: 0.9 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
      targets: orbInner,
      scale: { from: 0.8, to: 1.1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Concentric rings — rotating ──
    for (let r = 0; r < 3; r++) {
      const radius = 18 + r * 10;
      const ring = scene.add.circle(x, y, radius);
      ring.setStrokeStyle(1, hex, 0.5 - r * 0.15);
      ring.setFillStyle(hex, 0);

      scene.tweens.add({
        targets: ring,
        angle: (r % 2 === 0 ? 360 : -360),
        duration: 8000 + r * 4000,
        repeat: -1,
      });

      scene.tweens.add({
        targets: ring,
        alpha: { from: 0.3 - r * 0.1, to: 0.6 - r * 0.1 },
        duration: 1500 + r * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // ── Beacon pulse — expanding ring every 2s ──
    scene.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        const beacon = scene.add.circle(x, y, 10, hex, 0);
        beacon.setStrokeStyle(2, hex, 0.4);
        scene.tweens.add({
          targets: beacon,
          scale: 4,
          alpha: 0,
          duration: 800,
          ease: 'Power2',
          onComplete: () => beacon.destroy(),
        });
      },
    });

    // ── Orbiting particles — 4 small dots circling the orb ──
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4;
      const orbitR = 22;
      const p = scene.add.circle(
        x + Math.cos(angle) * orbitR,
        y + Math.sin(angle) * orbitR,
        2.5, hex, 0.7
      );

      // Orbit via angle tween
      const startAngle = angle;
      scene.tweens.addCounter({
        from: 0,
        to: 360,
        duration: 3000,
        repeat: -1,
        onUpdate: (tween) => {
          const a = startAngle + Phaser.Math.DegToRad(tween.getValue() ?? 0);
          p.setPosition(x + Math.cos(a) * orbitR, y + Math.sin(a) * orbitR);
        },
      });
    }

    // ── Outer ambient glow ──
    const ambientGlow = scene.add.circle(x, y, width / 2.2, hex, 0.04);
    scene.tweens.add({
      targets: ambientGlow,
      alpha: { from: 0.03, to: 0.08 },
      scale: { from: 0.95, to: 1.1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Keep the rectangle nearly invisible (it's just the physics body)
    scene.tweens.add({
      targets: this,
      alpha: { from: 0.02, to: 0.05 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  getBody(): Phaser.Physics.Arcade.StaticBody {
    return this.body as Phaser.Physics.Arcade.StaticBody;
  }
}
