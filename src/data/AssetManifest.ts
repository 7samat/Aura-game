/**
 * Asset Manifest — single source of truth for all game assets.
 *
 * Kenney packs integrated:
 * - Platformer Characters (player, NPC) — 80x110 per frame, 9 cols x 3 rows tilesheet
 * - Robot Pack (enemies) — individual PNGs, loaded separately
 * - UI Pack Sci-Fi Space Expansion (touch buttons, HUD bars)
 *
 * Frame order for character tilesheets (0-indexed, left-to-right, top-to-bottom):
 *  0: action1    1: action2    2: back       3: cheer1     4: cheer2
 *  5: climb1     6: climb2     7: duck       8: fall       9: hang
 * 10: hold1     11: hold2     12: hurt      13: idle      14: jump
 * 15: kick      16: skid      17: slide     18: stand     19: swim1
 * 20: swim2     21: talk      22: walk1     23: walk2
 */

// ── Types ────────────────────────────────────────────────────

export interface SpriteSheetDef {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  useSpriteSheet: boolean;
}

export interface IndividualSpriteDef {
  key: string;
  path: string;
}

export interface AnimationDef {
  key: string;
  spriteKey: string;
  frames: number[];          // explicit frame indices (for tilesheet) or generated
  frameRate: number;
  repeat: number;
}

// ── Character Sprite Sheets ──────────────────────────────────

export const SPRITES: Record<string, SpriteSheetDef> = {
  player: {
    key: 'player',
    path: 'assets/sprites/player.png',
    frameWidth: 80,
    frameHeight: 110,
    useSpriteSheet: true,
  },
  // Alternative characters — same tilesheet layout, swap path to use
  adventurer: {
    key: 'adventurer',
    path: 'assets/sprites/adventurer.png',
    frameWidth: 80,
    frameHeight: 110,
    useSpriteSheet: false,  // flip to true + change player key in entities to use
  },
  female: {
    key: 'female',
    path: 'assets/sprites/female.png',
    frameWidth: 80,
    frameHeight: 110,
    useSpriteSheet: false,
  },
};

// ── Enemy Sprites (individual PNGs, not a sheet) ─────────────

export const ENEMY_SPRITES: IndividualSpriteDef[] = [
  { key: 'enemy-idle',   path: 'assets/sprites/enemy_idle.png' },
  { key: 'enemy-walk1',  path: 'assets/sprites/enemy_walk1.png' },
  { key: 'enemy-walk2',  path: 'assets/sprites/enemy_walk2.png' },
  { key: 'enemy-hurt',   path: 'assets/sprites/enemy_hurt.png' },
];

// ── NPC uses the same character tilesheet system ─────────────
// The NPC will use the 'adventurer' tilesheet as sidekick

export const NPC_SPRITE: SpriteSheetDef = {
  key: 'npc',
  path: 'assets/sprites/adventurer.png',
  frameWidth: 80,
  frameHeight: 110,
  useSpriteSheet: true,
};

// ── UI Assets ────────────────────────────────────────────────

export const UI_SPRITES: IndividualSpriteDef[] = [
  // Kenney UI Pack — rectangle buttons (192x64)
  { key: 'btn-rect-blue',    path: 'assets/ui/btn_rect_blue.png' },
  { key: 'btn-rect-yellow',  path: 'assets/ui/btn_rect_yellow.png' },
  { key: 'btn-rect-green',   path: 'assets/ui/btn_rect_green.png' },
  { key: 'btn-rect-grey',    path: 'assets/ui/btn_rect_grey.png' },
  // Square buttons (64x64)
  { key: 'btn-sq-blue',      path: 'assets/ui/btn_sq_blue.png' },
  { key: 'btn-sq-yellow',    path: 'assets/ui/btn_sq_yellow.png' },
  { key: 'btn-sq-grey',      path: 'assets/ui/btn_sq_grey.png' },
  // Round buttons (64x64)
  { key: 'btn-round-blue',   path: 'assets/ui/btn_round_blue.png' },
  { key: 'btn-round-yellow', path: 'assets/ui/btn_round_yellow.png' },
  { key: 'btn-round-border', path: 'assets/ui/btn_round_border.png' },
  // Arrows (32x32)
  { key: 'arrow-left',       path: 'assets/ui/arrow_left.png' },
  { key: 'arrow-right',      path: 'assets/ui/arrow_right.png' },
  { key: 'arrow-up',         path: 'assets/ui/arrow_up.png' },
  // Bars
  { key: 'bar-bg',           path: 'assets/ui/bar_bg.png' },
  { key: 'bar-fill',         path: 'assets/ui/bar_fill.png' },
  // Legacy (sci-fi expansion)
  { key: 'btn-default',      path: 'assets/ui/btn_default.png' },
  { key: 'btn-pressed',      path: 'assets/ui/btn_pressed.png' },
];

// ── Tile Assets (Kenney Simplified Platformer + Shape Characters) ──

export const TILE_SPRITES: IndividualSpriteDef[] = [
  // Metal tiles from Simplified Platformer (64x64)
  { key: 'tile-metal-block',  path: 'assets/tiles/metal_block.png' },
  { key: 'tile-metal-plate',  path: 'assets/tiles/metal_plate.png' },
  { key: 'tile-crate',        path: 'assets/tiles/crate.png' },
  { key: 'tile-spikes',       path: 'assets/tiles/spikes.png' },
  { key: 'tile-saw',          path: 'assets/tiles/saw.png' },
  // Edge tiles from Shape Characters (80x80)
  { key: 'tile-plat-left',    path: 'assets/tiles/plat_left.png' },
  { key: 'tile-plat-center',  path: 'assets/tiles/plat_center.png' },
  { key: 'tile-plat-right',   path: 'assets/tiles/plat_right.png' },
  { key: 'tile-plat-full',    path: 'assets/tiles/plat_full.png' },
  // Half-height platforms (80x40)
  { key: 'tile-half-left',    path: 'assets/tiles/plat_half_left.png' },
  { key: 'tile-half-center',  path: 'assets/tiles/plat_half_center.png' },
  { key: 'tile-half-right',   path: 'assets/tiles/plat_half_right.png' },
];

// ── Collectible Item Sprites (64x64 gems) ────────────────────

export const ITEM_SPRITES: IndividualSpriteDef[] = [
  { key: 'gem-blue',     path: 'assets/items/gem_blue.png' },
  { key: 'gem-yellow',   path: 'assets/items/gem_yellow.png' },
  { key: 'gem-red',      path: 'assets/items/gem_red.png' },
  { key: 'gem-green',    path: 'assets/items/gem_green.png' },
  { key: 'diamond-blue', path: 'assets/items/diamond_blue.png' },
  { key: 'diamond-red',  path: 'assets/items/diamond_red.png' },
];

// ── Background Sprites ───────────────────────────────────────

export const BG_SPRITES: IndividualSpriteDef[] = [
  { key: 'bg-moon',        path: 'assets/bg/moon.png' },
  { key: 'bg-moon-full',   path: 'assets/bg/moon_full.png' },
  { key: 'bg-mountains',   path: 'assets/bg/mountains.png' },
  { key: 'bg-cloud1',      path: 'assets/bg/cloud_layer1.png' },
  { key: 'bg-cloud2',      path: 'assets/bg/cloud_layer2.png' },
  { key: 'bg-tower',       path: 'assets/bg/tower.png' },
  { key: 'bg-tower-alt',   path: 'assets/bg/tower_alt.png' },
];

// ── SFX Spritesheets (Super Pixel Effects) ───────────────────

export interface SfxSheetDef {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
}

export const SFX_SHEETS: SfxSheetDef[] = [
  { key: 'sfx-spark-burst',   path: 'assets/sfx/spark_burst.png',   frameWidth: 64, frameHeight: 64, frameCount: 12 },
  { key: 'sfx-charge-up',     path: 'assets/sfx/charge_up.png',     frameWidth: 48, frameHeight: 48, frameCount: 12 },
  { key: 'sfx-warp',          path: 'assets/sfx/warp.png',          frameWidth: 64, frameHeight: 64, frameCount: 10 },
  { key: 'sfx-sparkle-burst', path: 'assets/sfx/sparkle_burst.png', frameWidth: 32, frameHeight: 32, frameCount: 14 },
  { key: 'sfx-coin-burst',    path: 'assets/sfx/coin_burst.png',    frameWidth: 64, frameHeight: 64, frameCount: 31 },
  { key: 'sfx-impact',        path: 'assets/sfx/impact.png',        frameWidth: 48, frameHeight: 48, frameCount: 7 },
  { key: 'sfx-success',       path: 'assets/sfx/success.png',       frameWidth: 40, frameHeight: 40, frameCount: 60 },
];

// ── Audio Assets (Kenney CC0 packs: Digital Audio, Impact Sounds, Sci-Fi Sounds, Music Jingles, Interface Sounds) ──

export interface AudioDef {
  key: string;
  paths: string[];   // OGG first (smaller), WAV fallback (Safari/iOS)
}

export const AUDIO_ASSETS: AudioDef[] = [
  // SFX
  { key: 'sfx-jump',           paths: ['assets/audio/jump.ogg',           'assets/audio/jump.wav'] },
  { key: 'sfx-gem',            paths: ['assets/audio/gem.ogg',            'assets/audio/gem.wav'] },
  { key: 'sfx-stomp',          paths: ['assets/audio/stomp.ogg',          'assets/audio/stomp.wav'] },
  { key: 'sfx-land',           paths: ['assets/audio/land.ogg',           'assets/audio/land.wav'] },
  { key: 'sfx-absorb',         paths: ['assets/audio/absorb.ogg',         'assets/audio/absorb.wav'] },
  { key: 'sfx-aura-switch',    paths: ['assets/audio/aura-switch.ogg',    'assets/audio/aura-switch.wav'] },
  { key: 'sfx-level-complete', paths: ['assets/audio/level-complete.ogg', 'assets/audio/level-complete.wav'] },
  { key: 'sfx-ui-tap',         paths: ['assets/audio/ui-tap.ogg',         'assets/audio/ui-tap.wav'] },
  { key: 'sfx-pit-fall',       paths: ['assets/audio/pit-fall.ogg',       'assets/audio/pit-fall.wav'] },
  // BGM
  { key: 'bgm-main',           paths: ['assets/audio/bgm-main.ogg',      'assets/audio/bgm-main.wav'] },
];

// ── Animations ───────────────────────────────────────────────
// Frame indices match the tilesheet layout documented above.

export const PLAYER_ANIMS: AnimationDef[] = [
  { key: 'player-idle',   spriteKey: 'player', frames: [18, 13, 18, 21], frameRate: 3,  repeat: -1 },  // stand, idle, stand, talk — breathing cycle
  { key: 'player-run',    spriteKey: 'player', frames: [22, 18, 23, 18], frameRate: 12, repeat: -1 },  // 4-frame walk cycle at higher fps
  { key: 'player-jump',   spriteKey: 'player', frames: [14],             frameRate: 1,  repeat: 0 },
  { key: 'player-fall',   spriteKey: 'player', frames: [8],              frameRate: 1,  repeat: 0 },
  { key: 'player-hurt',   spriteKey: 'player', frames: [12],             frameRate: 1,  repeat: 0 },
  { key: 'player-duck',   spriteKey: 'player', frames: [7],              frameRate: 1,  repeat: 0 },
  { key: 'player-action', spriteKey: 'player', frames: [0, 1],           frameRate: 6,  repeat: 0 },
  { key: 'player-cheer',  spriteKey: 'player', frames: [3, 4, 3, 18],   frameRate: 5,  repeat: 2 },
  { key: 'player-skid',   spriteKey: 'player', frames: [16],             frameRate: 1,  repeat: 0 },
];

export const NPC_ANIMS: AnimationDef[] = [
  { key: 'npc-idle',  spriteKey: 'npc', frames: [18, 13, 18, 21], frameRate: 3,  repeat: -1 },
  { key: 'npc-move',  spriteKey: 'npc', frames: [22, 18, 23, 18], frameRate: 12, repeat: -1 },
];

// Enemy doesn't use tilesheet anims — state is swapped via setTexture()
