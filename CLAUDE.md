# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:3000)
npm run build    # TypeScript check + Vite production build to dist/
npm run preview  # Preview production build locally
```

No test or lint commands configured yet.

## Architecture

Aura is a 2D side-scrolling platformer for kids ages 6-9, built with Phaser 3 + TypeScript + Vite. Theme: "Soul vs. Machine" — warm Kenney characters in a cold neon cyberpunk world.

### Game Configuration
- **Resolution**: 800x450 (16:9, scales to fit)
- **Renderer**: AUTO (WebGL preferred, Canvas fallback)
- **Physics**: Arcade with gravity {y: 800}
- **Scale**: FIT mode with CENTER_BOTH
- **Input**: 4 active pointers (multi-touch), keyboard enabled

### Scene Flow
```
BootScene → TitleScene → ProfileSelectScene → CharacterSelectScene → LevelSelectScene → PreloadScene → GameScene + UIScene → LevelCompleteScene
                                                                                                        ↑
SettingsScene (overlay, launchable from TitleScene or pause)
```

**BootScene** (`src/scenes/BootScene.ts`): Loads all shared assets (character spritesheets, UI, tiles, items, backgrounds, SFX). Registers SFX animations. Transitions to TitleScene.

**TitleScene** (`src/scenes/TitleScene.ts`): "AURA" branding, PLAY button, settings gear. Both characters idle at bottom corners.

**ProfileSelectScene** (`src/scenes/ProfileSelectScene.ts`): 3 save slots (fox/bear/robot animal icons). Filled slots show character preview + level count. Empty slots pulse with "+".

**CharacterSelectScene** (`src/scenes/CharacterSelectScene.ts`): Side-by-side portraits of Kai (player) and Nova (female). Unchosen becomes sidekick. Creates profile in SaveManager.

**LevelSelectScene** (`src/scenes/LevelSelectScene.ts`): Horizontal node map. Reads unlock state from SaveManager. Kenney round buttons for nodes.

**PreloadScene** (`src/scenes/PreloadScene.ts`): Loads level-specific assets (level JSON, enemy sprites). Registers character animations. Transitions to GameScene with levelData.

**GameScene** (`src/scenes/GameScene.ts`): Main gameplay. Loads level via LevelLoader, wires all collisions/overlaps, handles aura attract, echo platforms, spark collection, level completion. Launches UIScene as parallel overlay.

**UIScene** (`src/scenes/UIScene.ts`): HUD overlay — aura indicator (top-left), spark counter (top-center). Listens to game-level events.

**LevelCompleteScene** (`src/scenes/LevelCompleteScene.ts`): Overlay with trophy display, celebration particles, NEXT button. Saves progress via SaveManager. Auto-determines next level.

**SettingsScene** (`src/scenes/SettingsScene.ts`): Overlay panel with music/sfx/colorblind toggles. Saves to profile.

### Core Systems

**AuraSystem** (`src/systems/AuraSystem.ts`): Manages player's current aura color. Emits `aura-changed` and `aura-expired` events. Holds dormant timer for future difficulty tuning. Mix logic stubbed for M2.

**SaveManager** (`src/systems/SaveManager.ts`): Singleton. localStorage with try/catch. 3 profile slots (A/B/C). Stores character choice, unlocked levels, per-level stats (trophy/sparks/time), settings.

**LevelLoader** (`src/data/LevelLoader.ts`): Validates JSON via LevelValidator, builds all game objects (platforms, zones, gates, enemies, NPCs, collectibles, echo platforms, end zone). Returns LoadedLevel struct.

**LevelValidator** (`src/data/LevelValidator.ts`): Runtime validation of level JSON. Checks version, bounds, color values, warns on missing color zones for gates.

**BackgroundBuilder** (`src/data/BackgroundBuilder.ts`): Procedural backgrounds by theme (cyberpunk, forest, cave). Seeded RNG for deterministic generation. Layers: gradient → moon → mountains → clouds → towers → city silhouette.

**SoundManager** (`src/systems/SoundManager.ts`): Singleton. Wraps Phaser's sound system. Reads `musicOn`/`sfxOn` from SaveManager profiles. Methods: `playBGM(key)`, `stopBGM()`, `playSFX(key)`, `setMusicEnabled()`, `setSFXEnabled()`, `syncSettings()`. Guards all operations against missing WebAudio. Initialized in BootScene via `SoundManager.init(game)`.

### Entities

**Player** (`src/entities/Player.ts`): Extends Arcade Sprite. 80x110 Kenney tilesheet scaled to 0.4. Depth 10 with ADD-blended aura glow at depth 9. Animations: idle (4-frame breathing), run (4-frame at 12fps), jump, fall, hurt, duck, action, cheer, skid. Shows "● Press!" prompt when in color zone.

**Enemy** (`src/entities/Enemy.ts`): Kenney Robot Pack (red). Individual PNGs, timer-based walk cycle (swap textures every 300ms). Patrol range. Stomp to defeat. Scaled to 0.22.

**NPC** (`src/entities/NPC.ts`): Kenney Adventurer tilesheet at 0.35 scale. Onboarding demo: walks to zone → absorbs → walks through gate → fades out.

**Companion** (`src/entities/Companion.ts`): Sidekick — the unchosen character. Follows player with proportional velocity, jumps when player is above. States: idle, following, cheering, pointing. Revive cushion: `getSafePosition()` returns position if grounded (`body.blocked.down`), used by GameScene to respawn player at companion on pit death instead of spawn point. Onboarding: `showHint(id, targetX, msg)` triggers once per hint per level — companion hops toward target and shows speech bubble (auto-dismisses after 3.5s).

**Collectible** (`src/entities/Collectible.ts`): Uses Kenney gem sprites (64x64 scaled to 0.32). Color-coded to zone. Hidden sparks use diamond sprite at low alpha, reveal when player is within 96px. Plays `sfx-coin-burst` animation on pickup. Score: regular=1, hidden=2.

### Data-Driven Levels

Levels are JSON files in `public/levels/`. Schema defined in `src/data/LevelSchema.ts`.

**Key schema types:**
- `LevelDef` — root with version, meta, dimensions, all entity arrays
- `PlatformDef` — rect with optional `echoColor` (Color Echo Platform) and `moving` (future)
- `CollectibleDef` — position, color, optional `hidden` flag
- `LevelMeta` — id, name, difficulty, sparkThresholds, tags

**To add a level:** Create JSON in `public/levels/`, add entry to `src/data/LevelManifest.ts`. No code changes needed.

**Level IDs are immutable once shipped** — save files reference them. Renaming breaks progress.

### Asset System

**AssetManifest** (`src/data/AssetManifest.ts`): Single source of truth for all sprites, animations, and asset paths. Character tilesheets have identical 9x3 frame layout (80x110 per frame). Frame order documented in file header.

Key texture keys:
- `player` / `female` / `adventurer`: Character tilesheets (80x110 frames)
- `npc`: Adventurer tilesheet (used for NPC)
- `enemy-idle/walk1/walk2/hurt`: Robot Pack individual PNGs
- `gem-blue/red/yellow`, `diamond-blue`: Collectible items (64x64)
- `tile-metal-block`, `tile-plat-left/center/right`: Platform tiles
- `btn-rect-blue/yellow/green`, `btn-sq-blue/yellow`, `btn-round-blue`: UI buttons
- `arrow-left/right/up`: Navigation arrows
- `sfx-spark-burst`, `sfx-charge-up`, `sfx-coin-burst`, etc.: Effect spritesheets
- `bg-moon`, `bg-mountains`, `bg-cloud1/2`, `bg-tower`: Background elements

Key audio keys (Kenney CC0 OGG files in `public/assets/audio/`):
- `sfx-jump`, `sfx-land`, `sfx-absorb`, `sfx-gem`, `sfx-stomp`: Gameplay SFX
- `sfx-aura-switch`, `sfx-level-complete`, `sfx-pit-fall`: Event SFX
- `sfx-ui-tap`: Button click SFX
- `bgm-main`: Background music loop (title screen)

### UI System

**UIHelper** (`src/ui/UIHelper.ts`): Shared helpers — `createButton()`, `createBackButton()`, `createPanel()`. Uses Kenney UI Pack sprites with fallback to plain rectangles.

**TouchControls** (`src/ui/TouchControls.ts`): 4 buttons (left/right/jump/action). **Uses raw DOM touch events** — bypasses Phaser's input system entirely for reliability. Tracks touches by `Touch.identifier`, rectangle hit-tests with plain math, handles finger-drag between buttons. Auto-cleans up on scene shutdown. Kenney square button sprites, 96px targets.

**InputManager** (`src/utils/InputManager.ts`): Unified keyboard (WASD/arrows/space/E) + touch state. Single `getState()` returns `{ left, right, jump, action, actionHeld, actionHoldDuration }`.

### Aura Colors

| Color | Enum | Hex | Ability |
|-------|------|-----|---------|
| Red | `AuraColor.RED` | `0xff4d4d` | Speed boost (1.4x) |
| Blue | `AuraColor.BLUE` | `0x4dc8ff` | Jump boost (1.5x) |
| Yellow | `AuraColor.YELLOW` | `0xffd94d` | Attract nearby sparks |

## Patterns

- **Event-driven communication**: Game events (`spark-collected`, `aura-changed`, `player-died`) forwarded via `scene.events` and `game.events` for cross-scene communication (GameScene → UIScene)
- **Static physics for collectibles**: Collectibles use static bodies, repositioned during yellow attract via `body.reset(x, y)`
- **Sprite-based glow**: Player aura glow is an ADD-blended ellipse at depth 9, not a shader. Pulse tween stored and stopped before replacement to prevent accumulation.
- **Dual-mode assets**: AssetManifest supports `useSpriteSheet: boolean` flag. When false, PreloadScene generates procedural placeholder textures. Allows running without art assets.
- **Per-profile save isolation**: localStorage keys prefixed per slot (`aura_profile_A/B/C`). All reads wrapped in try/catch for Safari private mode.
- **Raw DOM touch input**: TouchControls bypasses Phaser's input system entirely. Attaches to canvas via `addEventListener`, tracks by `Touch.identifier`, hit-tests with rectangle math. Cleans up on scene SHUTDOWN event.
- **Segmented ground terrain**: Ground is an array of `GroundSegmentDef` — gaps between segments are pits. Killzone body below level catches falls.
- **TileSprite parallax**: Background layers use `Phaser.GameObjects.TileSprite` with `tilePositionX = camX * scrollFactor` updated each frame. City silhouette rendered to generated texture then used as TileSprite.
- **Bounce pad data**: Power stored via `pad.setData('bouncePower')` / `pad.getData('bouncePower')` — typed Phaser DataManager, not untyped expandos.
- **Audio via SoundManager singleton**: All audio routed through `SoundManager.getInstance()`. Kenney CC0 OGG files loaded in BootScene preload. Settings toggles in SettingsScene call `setMusicEnabled()`/`setSFXEnabled()` which both persist via SaveManager and control playback in real time. Web Audio autoplay unlock handled on first user gesture in main.ts.
- **2-hit health system**: Enemy contact with aura → aura stripped (shatter VFX + 0.8s invulnerability), player survives. Enemy contact without aura → death. Pit falls always kill (bypass 2-hit). Implemented in `Player.hurtByEnemy()`.
- **Cinematic revive catch**: Pit death + grounded companion → 1s sequence: companion alert frame → glow expands into shield → player fades in at companion → glow contracts → "Gotcha!" bubble → invulnerability. Falls back to spawn point respawn if companion is airborne.
- **Narrative beats**: Story text delivered through existing UI moments (title subtitle rotation, level intro overlay, level complete flavor text, companion speech bubbles). Lines kept short and speakable for future voice-over. Story: "Luminos lost its color. Kai and Nova bring it back."

## Design Documents

- `GDD.md` — Game Design Specification (mechanics, characters, progression, level recipe)
- `TECH_SPEC.md` — Technical Specification (system-by-system build plan, dependencies)
- `ART_DIRECTION.md` — Art Direction Guide (color palette, visual treatments, accessibility)
- `UX_GUIDELINES.md` — UX Guidelines (child-specific design rules, touch targets, no-text policy)
- `SPRINT_PLAN.md` — Sprint Plan (scope, milestones, go/no-go criteria)

## Important Constraints

- **Target audience is 6-9 year olds**: No text in gameplay. Icons and animation only. All buttons minimum 80px. Failure is gentle (no "Game Over", no death counters).
- **Touch-first**: Design for tablets/phones. 4-button layout. 96px touch targets.
- **Kenney assets are CC0**: Free for commercial use. All from kenney.nl.
- **Browser-first**: Must run in mobile browsers. No shaders for glow effects. Capacitor wrapper planned for app stores later.
