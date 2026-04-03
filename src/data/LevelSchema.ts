import { AuraColor } from '../config';

// ── Primitives ────────────────────────────────────────────────

/**
 * Absolute-pixel rectangle. x/y are the centre point (Phaser convention).
 * GAME_HEIGHT is 450. y=0 is top, y=450 is bottom. Ground is at y=434.
 */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ── Metadata ──────────────────────────────────────────────────

export interface LevelMeta {
  id: string;                 // e.g. "level-01"
  name: string;               // display name, e.g. "First Light"
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedSeconds?: number;  // designer estimate for session length
  unlockAfter?: string;       // id of prerequisite level, or omit for first level
  tags?: string[];            // e.g. ["introduces-blue", "first-enemy"] — for querying level purpose
  sparkThresholds?: {
    half: number;             // percentage (0-1) of sparks needed for half trophy
    full: number;             // percentage (0-1) for full trophy
  };
}

// ── Entities ─────────────────────────────────────────────────

export interface PlatformDef extends Rect {
  oneWay?: boolean;           // pass-through from below, solid from above
  echoColor?: AuraColor;      // Color Echo: only solid when player has this aura
  moving?: {
    axis: 'x' | 'y';
    distance: number;         // pixels to travel in each direction
    speed: number;            // pixels per second
  };
}

export interface ColorZoneDef extends Rect {
  color: AuraColor;
}

export interface AuraGateDef extends Rect {
  color: AuraColor;
}

export interface EnemyDef {
  x: number;
  y: number;
  type?: 'patrol' | 'static' | 'flying';
  patrolRange?: number;       // optional — only required for patrol type
  speed?: number;             // pixels per second, defaults to ENEMY_SPEED
}

export interface HazardDef extends Rect {
  type: 'spikes' | 'lava' | 'pit';
  damage?: number;            // defaults to instant-kill
}

export interface NPCDef {
  x: number;
  y: number;
  role: 'onboarding' | 'hint' | 'story';
  demo?: {
    targetX: number;
    color: AuraColor;
    gateX: number;
    delay?: number;           // ms; defaults to NPC_DEMO_DELAY
  };
}

export interface CollectibleDef {
  x: number;
  y: number;
  type: 'spark';
  id: string;
  color?: AuraColor;          // matches nearby zone color; omit for white/hidden
  hidden?: boolean;           // hidden sparks count double, placed in secret spots
}

export interface CheckpointDef {
  id: string;
  x: number;
  y: number;
}

export interface TriggerDef extends Rect {
  id: string;
  onEnter: {
    action: 'dialogue' | 'cutscene' | 'unlockGate' | 'dimensionShift';
    payload?: Record<string, unknown>;
  };
}

export interface EndZoneDef {
  x: number;
  y: number;
  w?: number;                 // default 60
  h?: number;                 // default 48
}

// ── Background / Theme ────────────────────────────────────────

export type ThemeId = 'cyberpunk' | 'space' | 'forest' | 'cave';

export interface BackgroundDef {
  theme: ThemeId;
  starCount?: number;          // default 80
  seed?: number;               // deterministic procedural generation
  gradientTop?: string;        // hex string, e.g. "#0a0a2e"
  gradientBottom?: string;
  music?: string;              // audio key — reserved for future use
  ambientSound?: string;       // audio key — reserved for future use
}

// ── Root ──────────────────────────────────────────────────────

/** Ground segment — replaces single flat ground. Gaps between segments become pits. */
export interface GroundSegmentDef {
  x: number;                  // start x position
  width: number;              // segment width in pixels
  y?: number;                 // y offset from default ground level (negative = higher). Default 0.
}

/** Bounce pad — launches player upward on contact */
export interface BouncePadDef {
  x: number;
  y: number;
  power?: number;             // jump velocity override, default -600
}

export interface LevelDef {
  version: 1;                 // schema version — bump on breaking changes
  meta: LevelMeta;
  levelWidth: number;          // pixels; world bounds = levelWidth × GAME_HEIGHT

  background: BackgroundDef;
  playerSpawn: { x: number; y: number };
  endZone: EndZoneDef;

  // Terrain
  groundSegments?: GroundSegmentDef[];  // replaces flat ground when present
  bouncePads?: BouncePadDef[];

  // Structural
  platforms: PlatformDef[];
  colorZones: ColorZoneDef[];
  auraGates: AuraGateDef[];

  // Entities
  enemies: EnemyDef[];
  hazards?: HazardDef[];
  npcs?: NPCDef[];
  collectibles?: CollectibleDef[];

  // Progression (optional for M1)
  checkpoints?: CheckpointDef[];
  triggers?: TriggerDef[];
}
