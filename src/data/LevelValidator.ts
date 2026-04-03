import { AuraColor, GAME_HEIGHT } from '../config';
import { LevelDef } from './LevelSchema';

export class LevelValidationError extends Error {
  constructor(public field: string, message: string) {
    super(`Level validation error at '${field}': ${message}`);
    this.name = 'LevelValidationError';
  }
}

const VALID_COLORS = new Set(Object.values(AuraColor));

export function validateLevel(raw: unknown): LevelDef {
  const data = raw as Record<string, any>;

  // Version
  if (data.version !== 1) {
    throw new LevelValidationError('version', `expected 1, got ${data.version}`);
  }

  // Meta
  if (!data.meta?.id || typeof data.meta.id !== 'string') {
    throw new LevelValidationError('meta.id', 'required string');
  }
  if (!data.meta?.name || typeof data.meta.name !== 'string') {
    throw new LevelValidationError('meta.name', 'required string');
  }

  // Dimensions
  if (typeof data.levelWidth !== 'number' || data.levelWidth <= 0) {
    throw new LevelValidationError('levelWidth', 'must be a positive number');
  }

  // Player spawn
  assertPoint(data.playerSpawn, 'playerSpawn', data.levelWidth);

  // End zone
  assertPoint(data.endZone, 'endZone', data.levelWidth);

  // Platforms
  assertArray(data.platforms, 'platforms');
  data.platforms.forEach((p: any, i: number) => assertRect(p, `platforms[${i}]`));

  // Color zones
  assertArray(data.colorZones, 'colorZones');
  data.colorZones.forEach((z: any, i: number) => {
    assertRect(z, `colorZones[${i}]`);
    assertColor(z.color, `colorZones[${i}].color`);
  });

  // Aura gates
  assertArray(data.auraGates, 'auraGates');
  const availableColors = new Set(data.colorZones.map((z: any) => z.color));
  data.auraGates.forEach((g: any, i: number) => {
    assertRect(g, `auraGates[${i}]`);
    assertColor(g.color, `auraGates[${i}].color`);
    if (!availableColors.has(g.color)) {
      console.warn(`Level warning: auraGates[${i}] requires '${g.color}' but no colorZone provides it`);
    }
  });

  // Enemies
  assertArray(data.enemies, 'enemies');
  data.enemies.forEach((e: any, i: number) => {
    assertPoint(e, `enemies[${i}]`, data.levelWidth);
    if (e.patrolRange !== undefined && (typeof e.patrolRange !== 'number' || e.patrolRange < 0)) {
      throw new LevelValidationError(`enemies[${i}].patrolRange`, 'must be a non-negative number');
    }
  });

  // NPCs (optional)
  if (data.npcs) {
    assertArray(data.npcs, 'npcs');
    data.npcs.forEach((n: any, i: number) => {
      assertPoint(n, `npcs[${i}]`, data.levelWidth);
    });
  }

  // Background
  if (!data.background?.theme) {
    throw new LevelValidationError('background.theme', 'required');
  }

  return data as LevelDef;
}

function assertRect(obj: any, field: string): void {
  if (typeof obj?.x !== 'number' || typeof obj?.y !== 'number') {
    throw new LevelValidationError(field, 'must have numeric x, y');
  }
  if (typeof obj?.w !== 'number' || obj.w <= 0 || typeof obj?.h !== 'number' || obj.h <= 0) {
    throw new LevelValidationError(field, 'must have positive w, h');
  }
}

function assertPoint(obj: any, field: string, maxX: number): void {
  if (typeof obj?.x !== 'number' || typeof obj?.y !== 'number') {
    throw new LevelValidationError(field, 'must have numeric x, y');
  }
  if (obj.x < 0 || obj.x > maxX || obj.y < 0 || obj.y > GAME_HEIGHT) {
    throw new LevelValidationError(field, `out of bounds (${obj.x}, ${obj.y})`);
  }
}

function assertColor(color: any, field: string): void {
  if (!VALID_COLORS.has(color)) {
    throw new LevelValidationError(field, `invalid color '${color}', expected one of: ${[...VALID_COLORS].join(', ')}`);
  }
}

function assertArray(arr: any, field: string): void {
  if (!Array.isArray(arr)) {
    throw new LevelValidationError(field, 'must be an array');
  }
}
