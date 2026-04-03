import Phaser from 'phaser';
import { AuraColor, AURA_HEX, AURA_ABILITIES, COLOR_MIX_TABLE, MIX_HOLD_DURATION } from '../config';

export interface AuraState {
  color: AuraColor;
  acquiredAt: number;
  expiresAt: number | null; // dormant for M1
}

export class AuraSystem {
  private currentAura: AuraState | null = null;
  private scene: Phaser.Scene;
  private mixEnabled = false; // activate in M2

  // Event keys
  static readonly AURA_CHANGED = 'aura-changed';
  static readonly AURA_EXPIRED = 'aura-expired';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  absorb(color: AuraColor): void {
    if (color === AuraColor.NONE) return;

    this.currentAura = {
      color,
      acquiredAt: this.scene.time.now,
      expiresAt: null,
    };

    this.scene.events.emit(AuraSystem.AURA_CHANGED, this.currentAura);
  }

  /** Hold-to-mix stub — architecture ready, returns primary for M1 */
  mix(incomingColor: AuraColor): AuraColor {
    if (!this.mixEnabled || !this.currentAura) {
      return incomingColor;
    }

    const result = COLOR_MIX_TABLE[this.currentAura.color]?.[incomingColor];
    return result ?? incomingColor;
  }

  getCurrentColor(): AuraColor {
    return this.currentAura?.color ?? AuraColor.NONE;
  }

  hasColor(color: AuraColor): boolean {
    return this.currentAura?.color === color;
  }

  getAbilities() {
    const color = this.getCurrentColor();
    return AURA_ABILITIES[color] ?? { jumpBoost: 0, speedBoost: 0 };
  }

  getHex(): number | null {
    const color = this.getCurrentColor();
    return AURA_HEX[color] ?? null;
  }

  clear(): void {
    this.currentAura = null;
    this.scene.events.emit(AuraSystem.AURA_CHANGED, null);
  }

  update(): void {
    // Timer check — dormant for M1
    if (this.currentAura?.expiresAt && this.scene.time.now >= this.currentAura.expiresAt) {
      this.scene.events.emit(AuraSystem.AURA_EXPIRED, this.currentAura);
      this.clear();
    }
  }
}
