# AURA

**A color-powered 2D platformer for kids ages 6-9.**

*Soul vs. Machine* — warm human characters navigating a cold neon cyberpunk world.

## About

Aura is a browser-based platformer where players absorb colors from the environment to gain abilities and overcome obstacles. Built with Phaser 3, designed for touch-first play on tablets and phones.

### Core Mechanic: Aura Absorption

The player absorbs color from energy nodes scattered throughout each level. Each color grants a different power:

| Aura | Ability | Color |
|------|---------|-------|
| Red | Speed boost (1.4x) | `#FF4D4D` |
| Blue | Jump boost (1.5x) | `#4DC8FF` |
| Yellow | Attract nearby sparks | `#FFD94D` |

### Features

- **3 playable levels** with increasing complexity
- **Aura absorption** — color-based power-up system
- **Color Echo Platforms** — platforms that only exist when you hold the matching aura
- **Collectible aura sparks** — color-coded gems with hidden white sparks for mastery
- **Trophy system** — empty/half/full/sparkling per level
- **Character selection** — choose between Kai and Nova, the other becomes your sidekick
- **Profile system** — 3 save slots with persistent progress
- **Touch controls** — 4-button layout optimized for kids' fingers (96px touch targets)
- **Keyboard support** — WASD/Arrows + Space + E
- **Data-driven levels** — JSON schema for easy level authoring
- **SFX animations** — pixel art effects for absorption and spark collection

## Getting Started

### Prerequisites

- Node.js 18+

### Install and Run

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run preview
```

Output goes to `dist/`.

## Controls

### Keyboard
| Key | Action |
|-----|--------|
| A / Left Arrow | Move left |
| D / Right Arrow | Move right |
| W / Up Arrow / Space | Jump |
| E | Absorb aura (when near a color node) |

### Touch
4 on-screen buttons: Left, Right, Jump (top-right), Action (bottom-right).

## Project Structure

```
src/
  main.ts                  # Phaser game bootstrap
  config.ts                # Game constants, colors, physics
  scenes/                  # 10 Phaser scenes (title, menus, gameplay, UI)
  entities/                # Player, Enemy, NPC, Collectible
  systems/                 # AuraSystem, ColorZone, AuraGate, SaveManager
  data/                    # LevelSchema, LevelLoader, LevelValidator,
                           #   BackgroundBuilder, AssetManifest, LevelManifest
  ui/                      # TouchControls, UIHelper
  utils/                   # InputManager

public/
  levels/                  # Level JSON files (level-01, 02, 03)
  assets/
    sprites/               # Kenney Platformer Characters + Robot Pack
    tiles/                 # Platform tiles (Kenney Simplified Platformer + Shape Characters)
    items/                 # Collectible gem sprites
    bg/                    # Background elements (moon, mountains, clouds, towers)
    sfx/                   # Pixel effect spritesheets (burst, charge, warp)
    ui/                    # Kenney UI Pack buttons, arrows, bars
```

## Level Authoring

Levels are JSON files in `public/levels/`. The schema supports:

- **Platforms** — with optional `echoColor` for color echo platforms
- **Color zones** — absorption nodes placed at specific coordinates
- **Aura gates** — barriers requiring a specific color to pass
- **Enemies** — patrol range and position
- **Collectibles** — color-coded sparks with optional `hidden` flag
- **NPCs** — with optional onboarding demo sequences
- **Background** — theme selection (cyberpunk, forest, cave) with parallax config

See [TECH_SPEC.md](TECH_SPEC.md) for the full schema reference.

To add a new level:
1. Create `public/levels/level-04.json` following the schema
2. Add an entry to `src/data/LevelManifest.ts`
3. That's it — no other code changes needed

## Tech Stack

| Layer | Choice |
|-------|--------|
| Engine | Phaser 3.90 |
| Language | TypeScript |
| Bundler | Vite |
| Save System | localStorage (3 profile slots) |
| Target | Browser-first, Capacitor-ready for app stores |

## Asset Credits

All game assets are **CC0 (public domain)** from [Kenney.nl](https://kenney.nl):

- [Platformer Characters](https://kenney.nl/assets/platformer-characters) — player and NPC sprites
- [Robot Pack](https://kenney.nl/assets/robot-pack) — enemy sprites
- [UI Pack](https://kenney.nl/assets/ui-pack) — buttons, arrows, bars
- [UI Pack Sci-Fi Space Expansion](https://kenney.nl/assets/ui-pack-sci-fi) — sci-fi themed UI panels
- [Simplified Platformer Pack](https://kenney.nl/assets/simplified-platformer-pack) — platform tiles, gems, hazards
- [Shape Characters](https://kenney.nl/assets/shape-characters) — platform edge tiles
- [Background Elements Remastered](https://kenney.nl/assets/background-elements-remastered) — parallax backgrounds

SFX spritesheets from **Super Pixel Effects Gigapack** (Free Version).

## Design Documents

| Document | Description |
|----------|-------------|
| [GDD.md](GDD.md) | Game Design Specification — mechanics, characters, progression |
| [TECH_SPEC.md](TECH_SPEC.md) | Technical Specification — system architecture, build plan |
| [ART_DIRECTION.md](ART_DIRECTION.md) | Art Direction Guide — color palette, visual treatments |
| [UX_GUIDELINES.md](UX_GUIDELINES.md) | UX Guidelines — child-specific design rules |
| [SPRINT_PLAN.md](SPRINT_PLAN.md) | Sprint Plan — roadmap, milestones, go/no-go criteria |

## License

Game code: MIT. Art assets: CC0 (see individual pack licenses).
