import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { BackgroundDef, ThemeId } from './LevelSchema';

export interface ParallaxLayer {
  obj: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Image;
  scrollFactor: number;
  isTileSprite: boolean;
}

interface BackgroundBuilderFn {
  (scene: Phaser.Scene, levelWidth: number, config: BackgroundDef): ParallaxLayer[];
}

const builders: Record<ThemeId, BackgroundBuilderFn> = {
  cyberpunk: buildCyberpunk,
  space: buildCyberpunk,
  forest: buildForest,
  cave: buildCave,
};

export function buildBackground(scene: Phaser.Scene, levelWidth: number, config: BackgroundDef): ParallaxLayer[] {
  const builder = builders[config.theme] ?? builders.cyberpunk;
  return builder(scene, levelWidth, config);
}

function buildCyberpunk(scene: Phaser.Scene, levelWidth: number, config: BackgroundDef): ParallaxLayer[] {
  const topColor = parseHex(config.gradientTop, 0x0a0a2e);
  const bottomColor = parseHex(config.gradientBottom, 0x1a1a4e);
  const layers: ParallaxLayer[] = [];

  // Sky gradient — fixed, doesn't scroll
  const bg = scene.add.graphics();
  bg.fillGradientStyle(topColor, topColor, bottomColor, bottomColor);
  bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  bg.setScrollFactor(0);

  // Stars — drawn onto a Graphics, fixed scroll
  const starCount = config.starCount ?? 80;
  const stars = scene.add.graphics();
  stars.setScrollFactor(0);
  const rng = seedRng(config.seed ?? 42);
  for (let i = 0; i < starCount; i++) {
    const sx = rng() * GAME_WIDTH;
    const sy = rng() * GAME_HEIGHT * 0.7;
    const size = rng() * 2 + 0.5;
    const alpha = rng() * 0.5 + 0.3;
    stars.fillStyle(0xffffff, alpha);
    stars.fillCircle(sx, sy, size);
  }

  // Moon — very slow parallax
  if (scene.textures.exists('bg-moon')) {
    const moon = scene.add.image(GAME_WIDTH * 0.8, 60, 'bg-moon');
    moon.setScrollFactor(0);
    moon.setAlpha(0.6);
    moon.setTint(0x8888ff);
    layers.push({ obj: moon, scrollFactor: 0.02, isTileSprite: false });
  }

  // Cloud layer — TileSprite for seamless tiling
  if (scene.textures.exists('bg-cloud1')) {
    const cloud = scene.add.tileSprite(
      GAME_WIDTH / 2, GAME_HEIGHT * 0.3, GAME_WIDTH, 400,
      'bg-cloud1'
    );
    cloud.setScrollFactor(0);
    cloud.setAlpha(0.06);
    cloud.setTint(0x4dc8ff);
    cloud.setScale(1, 0.35);
    layers.push({ obj: cloud, scrollFactor: 0.05, isTileSprite: true });
  }

  // Mountain silhouettes — TileSprite for seamless repeating
  if (scene.textures.exists('bg-mountains')) {
    const mtn = scene.add.tileSprite(
      GAME_WIDTH / 2, GAME_HEIGHT - 100, GAME_WIDTH, 400,
      'bg-mountains'
    );
    mtn.setScrollFactor(0);
    mtn.setAlpha(0.2);
    mtn.setTint(0x2a1a4e);
    mtn.setScale(1, 0.5);
    mtn.setOrigin(0.5, 1);
    layers.push({ obj: mtn, scrollFactor: 0.1, isTileSprite: true });
  }

  // Tower silhouettes — scattered, slow parallax
  if (scene.textures.exists('bg-tower')) {
    for (let i = 0; i < 5; i++) {
      const tx = rng() * GAME_WIDTH;
      const tower = scene.add.image(tx, GAME_HEIGHT - 80, rng() > 0.5 ? 'bg-tower' : 'bg-tower-alt');
      tower.setScrollFactor(0);
      tower.setAlpha(0.12 + rng() * 0.1);
      tower.setTint(0x1a1a5a);
      tower.setScale(0.3 + rng() * 0.2);
      tower.setOrigin(0.5, 1);
      layers.push({ obj: tower, scrollFactor: 0.15 + rng() * 0.1, isTileSprite: false });
    }
  }

  // City silhouette — procedural, rendered to a texture then used as TileSprite
  const cityWidth = 800;
  const cityG = scene.make.graphics({ x: 0, y: 0 });
  let x = 0;
  while (x < cityWidth) {
    const bw = 20 + rng() * 25;
    const bh = 40 + rng() * 80;
    const by = GAME_HEIGHT - bh - 48;
    cityG.fillStyle(0x1a1a5a, 0.8);
    cityG.fillRect(x, by, bw, bh);
    cityG.lineStyle(1, 0x4dc8ff, 0.4);
    cityG.strokeRect(x, by, bw, 1);
    if (rng() > 0.5) {
      const wy = by + 8 + rng() * (bh - 16);
      cityG.fillStyle(0x4dc8ff, 0.2 + rng() * 0.2);
      cityG.fillRect(x + 4, wy, 4, 3);
      cityG.fillRect(x + bw - 8, wy - 6, 4, 3);
    }
    x += 40 + rng() * 30;
  }
  cityG.generateTexture('bg-city-gen', cityWidth, GAME_HEIGHT);
  cityG.destroy();

  const cityTile = scene.add.tileSprite(
    GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT,
    'bg-city-gen'
  );
  cityTile.setScrollFactor(0);
  layers.push({ obj: cityTile, scrollFactor: 0.25, isTileSprite: true });

  return layers;
}

function buildForest(scene: Phaser.Scene, levelWidth: number, config: BackgroundDef): ParallaxLayer[] {
  const topColor = parseHex(config.gradientTop, 0x0a2e0a);
  const bottomColor = parseHex(config.gradientBottom, 0x1a4e2a);

  const bg = scene.add.graphics();
  bg.fillGradientStyle(topColor, topColor, bottomColor, bottomColor);
  bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  bg.setScrollFactor(0);

  return [];
}

function buildCave(scene: Phaser.Scene, levelWidth: number, config: BackgroundDef): ParallaxLayer[] {
  const topColor = parseHex(config.gradientTop, 0x1a1a1a);
  const bottomColor = parseHex(config.gradientBottom, 0x2a2a3a);

  const bg = scene.add.graphics();
  bg.fillGradientStyle(topColor, topColor, bottomColor, bottomColor);
  bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  bg.setScrollFactor(0);

  return [];
}

function seedRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function parseHex(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  return parseInt(value.replace('#', ''), 16) || fallback;
}
