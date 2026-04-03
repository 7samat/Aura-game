// Game dimensions (designed for 16:9, scales to fit)
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

// Physics
export const GRAVITY = 800;
export const PLAYER_SPEED = 200;
export const PLAYER_JUMP_VELOCITY = -400;
export const ENEMY_SPEED = 60;

// Aura colors
export enum AuraColor {
  NONE = 'none',
  RED = 'red',
  BLUE = 'blue',
  YELLOW = 'yellow',
}

// Hex values for rendering
export const AURA_HEX: Record<string, number> = {
  [AuraColor.RED]: 0xff4d4d,
  [AuraColor.BLUE]: 0x4dc8ff,
  [AuraColor.YELLOW]: 0xffd94d,
};

// Aura abilities
export const AURA_ABILITIES: Record<string, { jumpBoost: number; speedBoost: number }> = {
  [AuraColor.RED]: { jumpBoost: 0, speedBoost: 1.4 },    // Red = speed boost
  [AuraColor.BLUE]: { jumpBoost: 1.5, speedBoost: 0 },   // Blue = higher jump
  [AuraColor.YELLOW]: { jumpBoost: 0, speedBoost: 0 },   // Yellow = attract (handled in GameScene)
};

// Mix results (color theory) — ready for M2
export const COLOR_MIX_TABLE: Record<string, Record<string, AuraColor>> = {
  [AuraColor.RED]: {
    [AuraColor.BLUE]: AuraColor.NONE,   // Purple — not yet defined
    [AuraColor.YELLOW]: AuraColor.NONE, // Orange — not yet defined
  },
  [AuraColor.BLUE]: {
    [AuraColor.RED]: AuraColor.NONE,
    [AuraColor.YELLOW]: AuraColor.NONE, // Green — not yet defined
  },
  [AuraColor.YELLOW]: {
    [AuraColor.RED]: AuraColor.NONE,
    [AuraColor.BLUE]: AuraColor.NONE,
  },
};

// Hold-to-mix timing (dormant for M1)
export const MIX_HOLD_DURATION = 500; // ms

// Touch button sizing
export const TOUCH_BUTTON_SIZE = 96; // Lea: bumped from 80 for kid-sized fingers
export const TOUCH_BUTTON_PADDING = 16;
export const TOUCH_BUTTON_ALPHA = 0.5;
export const TOUCH_BUTTON_ALPHA_ACTIVE = 0.9;

// NPC
export const NPC_DEMO_DELAY = 3000; // Lea: raised from 1500 — let kids settle first

// Yellow aura attract
export const ATTRACT_RADIUS = 120;
export const ATTRACT_SPEED = 80;

// Collectible
export const SPARK_SIZE = 10;
export const SPARK_PULSE_DURATION = 800;
