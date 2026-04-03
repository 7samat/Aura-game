import Phaser from 'phaser';
import { GAME_HEIGHT, NPC_DEMO_DELAY, AURA_HEX, AuraColor } from '../config';
import { SaveManager } from '../systems/SaveManager';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { NPC } from '../entities/NPC';
import { Collectible } from '../entities/Collectible';
import { AuraSystem } from '../systems/AuraSystem';
import { ColorZone } from '../systems/ColorZone';
import { AuraGate } from '../systems/AuraGate';
import { InputManager } from '../utils/InputManager';
import { LevelDef, PlatformDef } from './LevelSchema';
import { validateLevel } from './LevelValidator';
import { buildBackground, ParallaxLayer } from './BackgroundBuilder';

export interface EchoPlatform {
  rect: Phaser.GameObjects.Rectangle;
  echoColor: AuraColor;
  hint: Phaser.GameObjects.Arc;
}

export interface LoadedLevel {
  player: Player;
  enemies: Enemy[];
  npcs: NPC[];
  colorZones: ColorZone[];
  auraGates: AuraGate[];
  collectibles: Collectible[];
  platforms: Phaser.Physics.Arcade.StaticGroup;
  echoPlatforms: EchoPlatform[];
  endZone: Phaser.GameObjects.Rectangle;
  parallaxLayers: ParallaxLayer[];
  levelWidth: number;
  totalSparks: number;
  def: LevelDef;
}

export function loadLevel(
  scene: Phaser.Scene,
  rawData: unknown,
  auraSystem: AuraSystem,
  inputManager: InputManager,
): LoadedLevel {
  const def = validateLevel(rawData);
  const levelWidth = def.levelWidth;

  scene.physics.world.setBounds(0, 0, levelWidth, GAME_HEIGHT);
  const parallaxLayers = buildBackground(scene, levelWidth, def.background);

  // ── Ground ──────────────────────────────────────────────
  const platforms = scene.physics.add.staticGroup();

  // Ground — use tiled metal plates if available
  const hasMetalTile = scene.textures.exists('tile-metal-block');
  if (hasMetalTile) {
    const tileSize = 32; // scale 64x64 tiles to 32x32
    for (let gx = 0; gx < levelWidth; gx += tileSize) {
      const tile = scene.add.image(gx + tileSize / 2, GAME_HEIGHT - tileSize / 2, 'tile-metal-block');
      tile.setScale(tileSize / 64);
      tile.setTint(0x6666aa); // tint to sci-fi purple-gray
    }
    // Neon top edge
    const groundLine = scene.add.graphics();
    groundLine.lineStyle(2, 0x4dc8ff, 0.5);
    groundLine.lineBetween(0, GAME_HEIGHT - 32, levelWidth, GAME_HEIGHT - 32);
  } else {
    // Fallback procedural ground
    const groundG = scene.add.graphics();
    groundG.fillStyle(0x1a1a3a, 1);
    groundG.fillRect(0, GAME_HEIGHT - 32, levelWidth, 32);
    groundG.lineStyle(2, 0x4dc8ff, 0.4);
    groundG.lineBetween(0, GAME_HEIGHT - 32, levelWidth, GAME_HEIGHT - 32);
    groundG.lineStyle(1, 0x2a2a5a, 0.5);
    for (let x = 0; x < levelWidth; x += 32) {
      groundG.lineBetween(x, GAME_HEIGHT - 32, x, GAME_HEIGHT);
    }
  }

  const ground = scene.add.rectangle(levelWidth / 2, GAME_HEIGHT - 16, levelWidth, 32);
  ground.setVisible(false);
  platforms.add(ground);

  // ── Platforms ───────────────────────────────────────────
  const echoPlatforms: EchoPlatform[] = [];
  for (const p of def.platforms) {
    if (p.echoColor && p.echoColor !== AuraColor.NONE) {
      const echo = createEchoPlatform(scene, p, platforms);
      echoPlatforms.push(echo);
    } else {
      createPlatformVisual(scene, p, platforms);
    }
  }

  // ── Color zones ────────────────────────────────────────
  const colorZones = def.colorZones.map(
    z => new ColorZone(scene, z.x, z.y, z.w, z.h, z.color),
  );

  // ── Aura gates ─────────────────────────────────────────
  const auraGates = def.auraGates.map(
    g => new AuraGate(scene, g.x, g.y, g.w, g.h, g.color, auraSystem),
  );

  // ── Player ─────────────────────────────────────────────
  // Read selected character from save profile
  const profile = SaveManager.getInstance().getActiveProfile();
  const characterKey = profile?.characterKey ?? 'player';

  const player = new Player(
    scene,
    def.playerSpawn.x,
    def.playerSpawn.y,
    inputManager,
    auraSystem,
    characterKey,
  );

  // ── Enemies ────────────────────────────────────────────
  const enemies = def.enemies.map(e => {
    const patrolRange = e.patrolRange ?? 0;
    return new Enemy(scene, e.x, e.y, patrolRange);
  });

  // ── NPCs ───────────────────────────────────────────────
  const npcs: NPC[] = [];
  if (def.npcs) {
    for (const n of def.npcs) {
      const npc = new NPC(scene, n.x, n.y);
      npcs.push(npc);
      if (n.demo) {
        const delay = n.demo.delay ?? NPC_DEMO_DELAY;
        scene.time.delayedCall(delay, () => {
          npc.demonstrate(n.demo!.targetX, n.demo!.color, n.demo!.gateX);
        });
      }
    }
  }

  // ── Collectibles ───────────────────────────────────────
  const collectibles: Collectible[] = [];
  let totalSparks = 0;
  if (def.collectibles) {
    for (const c of def.collectibles) {
      const collectible = new Collectible(scene, c);
      collectibles.push(collectible);
      totalSparks += collectible.scoreValue;
    }
  }

  // ── End zone ───────────────────────────────────────────
  const ez = def.endZone;
  const ezW = ez.w ?? 60;
  const ezH = ez.h ?? 48;
  createEndFlag(scene, ez.x, ez.y);
  const endZone = scene.add.rectangle(ez.x, ez.y, ezW, ezH, 0xffd94d, 0.05);
  scene.physics.add.existing(endZone, true);

  return {
    player, enemies, npcs, colorZones, auraGates, collectibles,
    platforms, echoPlatforms, endZone, parallaxLayers, levelWidth, totalSparks, def,
  };
}

// ── Visual Builders ────────────────────────────────────────

function createPlatformVisual(
  scene: Phaser.Scene,
  p: PlatformDef,
  platforms: Phaser.Physics.Arcade.StaticGroup,
): void {
  const hasTiles = scene.textures.exists('tile-plat-left');
  const left = p.x - p.w / 2;
  const top = p.y - p.h / 2;

  if (hasTiles && p.w >= 48) {
    // Use real tile images — left edge, center fill, right edge
    // Shape Characters tiles are 80x80, scale to fit platform height
    const tileScale = p.h / 80;
    const tileDisplayW = 80 * tileScale;
    const isNarrow = p.w < tileDisplayW * 3;

    if (isNarrow) {
      // Single tile for narrow platforms
      const tile = scene.add.image(p.x, p.y, 'tile-plat-full');
      tile.setScale(p.w / 80, tileScale);
      tile.setTint(0x8888cc); // tint to our sci-fi palette
    } else {
      // Left edge
      const lTile = scene.add.image(left + tileDisplayW / 2, p.y, 'tile-plat-left');
      lTile.setScale(tileScale);
      lTile.setTint(0x8888cc);

      // Right edge
      const rTile = scene.add.image(left + p.w - tileDisplayW / 2, p.y, 'tile-plat-right');
      rTile.setScale(tileScale);
      rTile.setTint(0x8888cc);

      // Center fill
      const centerStart = left + tileDisplayW;
      const centerEnd = left + p.w - tileDisplayW;
      for (let cx = centerStart; cx < centerEnd; cx += tileDisplayW) {
        const cTile = scene.add.image(cx + tileDisplayW / 2, p.y, 'tile-plat-center');
        cTile.setScale(tileScale);
        cTile.setTint(0x8888cc);
      }
    }

    // Neon top-edge highlight (keeps the sci-fi feel)
    const g = scene.add.graphics();
    g.lineStyle(1, 0x4dc8ff, 0.4);
    g.lineBetween(left, top, left + p.w, top);
  } else {
    // Fallback — procedural sci-fi platform
    const g = scene.add.graphics();
    g.fillStyle(0x1e1e40, 1);
    g.fillRect(left, top, p.w, p.h);
    g.fillStyle(0x2a2a5a, 0.7);
    g.fillRect(left + 2, top + 2, p.w - 4, p.h / 2 - 2);
    g.lineStyle(2, 0x4dc8ff, 0.6);
    g.lineBetween(left, top, left + p.w, top);
    g.lineStyle(1, 0x4dc8ff, 0.2);
    g.lineBetween(left, top, left, top + p.h);
    g.lineBetween(left + p.w, top, left + p.w, top + p.h);
  }

  // Physics body
  const plat = scene.add.rectangle(p.x, p.y, p.w, p.h);
  plat.setVisible(false);
  platforms.add(plat);
}

function createEchoPlatform(
  scene: Phaser.Scene,
  p: PlatformDef,
  platforms: Phaser.Physics.Arcade.StaticGroup,
): EchoPlatform {
  const echoColor = p.echoColor!;
  const hex = AURA_HEX[echoColor] ?? 0xffffff;

  // Platform visual — semi-transparent with colored edges
  const g = scene.add.graphics();
  const left = p.x - p.w / 2;
  const top = p.y - p.h / 2;

  g.fillStyle(hex, 0.08);
  g.fillRect(left, top, p.w, p.h);
  g.lineStyle(2, hex, 0.4);
  g.strokeRect(left, top, p.w, p.h);
  // Dashed inner lines for "holographic" feel
  g.lineStyle(1, hex, 0.15);
  g.lineBetween(left + 4, top + p.h / 2, left + p.w - 4, top + p.h / 2);

  const rect = scene.add.rectangle(p.x, p.y, p.w, p.h);
  rect.setVisible(false);
  platforms.add(rect);

  const body = rect.body as Phaser.Physics.Arcade.StaticBody;
  body.enable = false;

  // Color hint icon
  const hint = scene.add.circle(p.x, p.y - p.h / 2 - 10, 8, hex, 0.5);
  hint.setStrokeStyle(1, 0xffffff, 0.3);
  scene.tweens.add({
    targets: hint,
    alpha: { from: 0.3, to: 0.6 },
    scale: { from: 1, to: 1.2 },
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  // Store the graphics object on the rect for alpha manipulation
  (rect as any)._echoGraphics = g;

  return { rect, echoColor: echoColor as AuraColor, hint };
}

function createEndFlag(scene: Phaser.Scene, x: number, y: number): void {
  const g = scene.add.graphics();

  // Pole
  g.lineStyle(3, 0xffd94d, 0.8);
  g.lineBetween(x, y + 24, x, y - 40);

  // Pole base — glowing disc
  g.fillStyle(0xffd94d, 0.3);
  g.fillEllipse(x, y + 24, 24, 8);

  // Flag — animated triangle
  const flag = scene.add.triangle(x + 14, y - 28, 0, 0, 20, 8, 0, 16, 0xffd94d);
  flag.setAlpha(0.9);

  // Flag wave animation
  scene.tweens.add({
    targets: flag,
    scaleX: { from: 1, to: 0.85 },
    duration: 500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  // Star on top of pole
  const star = scene.add.circle(x, y - 44, 4, 0xffd94d, 1);
  scene.tweens.add({
    targets: star,
    scale: { from: 1, to: 1.4 },
    alpha: { from: 0.8, to: 1 },
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  // Glow around the flag area
  const glow = scene.add.circle(x + 8, y - 20, 30, 0xffd94d, 0.08);
  scene.tweens.add({
    targets: glow,
    alpha: { from: 0.05, to: 0.12 },
    scale: { from: 1, to: 1.2 },
    duration: 1200,
    yoyo: true,
    repeat: -1,
  });
}
