# Aura — Technical Specification
**Author:** Sam, Tech Lead | **Date:** 2026-04-02 | **Status:** Sprint 3-5 Reference

---

## 1. Collectible Spark System — Size: M

**Create:** `src/entities/Collectible.ts`
**Modify:** `src/data/LevelLoader.ts`, `src/scenes/UIScene.ts`, `src/data/LevelSchema.ts`

`Collectible` extends `Phaser.GameObjects.Container`. Constructor accepts `scene`, `x`, `y`, and `CollectibleDef`. Internally creates an `Arc` (or sprite if asset exists) with a tweened scale pulse. Hidden sparks use `setBlendMode(ADD)` plus a glow effect. On overlap with player: call `destroy()`, emit `scene.events.emit('spark-collected', { hidden })`.

`LevelLoader` iterates `levelData.collectibles`, creates `new Collectible(...)`, adds to a `collectiblesGroup` (static physics group returned in `LoadedLevel`).

`UIScene` listens for `spark-collected`, increments counter, updates display. Add `sparkCount` and `totalSparks` to `UIScene` state.

`LevelSchema.ts` — add `hidden?: boolean` field to `CollectibleDef`.

**Depends on:** nothing upstream.

---

## 2. Character Selection — Size: M

**Create:** `src/scenes/CharacterSelectScene.ts`
**Modify:** `src/entities/Player.ts`, `src/scenes/PreloadScene.ts`, `src/scenes/GameScene.ts`

`CharacterSelectScene` renders two character portraits side by side. On confirm: `this.registry.set('selectedCharacter', key)` and `this.registry.set('sidekickCharacter', otherKey)`, then `this.scene.start('PreloadScene')`.

`Player.ts` constructor takes `spriteKey: string` parameter. Animation registration becomes dynamic: `createPlayerAnims(scene, spriteKey)` helper generates all 8 animation keys prefixed with the sprite key.

`GameScene` reads `this.registry.get('selectedCharacter')` and passes it to `new Player(...)`.

**Depends on:** Save System (read last-used character on boot).

---

## 3. Sidekick Companion — Size: L

**Create:** `src/entities/Companion.ts`
**Modify:** `src/scenes/GameScene.ts`

`Companion` extends `Phaser.Physics.Arcade.Sprite`. Behaviors are state-machine driven: `idle | following | pointing | cheering | reviving`.

- **Follow:** compute delta to `player.x - 100`, apply `setVelocityX` proportional to distance; mirror player jumps with delay.
- **Point:** within 150px of an uncollected `Collectible`, switch state, play bounce tween.
- **Cheer:** subscribe to `spark-collected` and `gate-passed` events, play cheer animation for 1.2s then return to follow.
- **Revive:** on `player-died` event, respawn player at companion position instead of level start.
- **Stomp:** in `GameScene.update`, if any enemy approaching player from behind within 180px, 30% RNG chance → companion stomps enemy.

Uses same tilesheet as selected character. Animation keys prefixed `sidekick-*`. Sprite key from `registry.get('sidekickCharacter')`.

**Depends on:** Character Selection (key), Collectible Spark System (events).

---

## 4. Level Complete Screen — Size: M

**Create:** `src/scenes/LevelCompleteScene.ts`
**Modify:** `src/scenes/GameScene.ts`, `src/data/LevelSchema.ts`

`GameScene` emits `level-complete` with `{ sparksCollected, totalSparks, timeMs }` and launches `LevelCompleteScene` as parallel overlay. Scene reads `levelMeta.sparkThresholds`, maps ratio to `empty | half | full | sparkling`. Renders trophy sprite frame by state. NEXT button calls `saveManager.writeLevel(...)` then starts next level.

`LevelSchema.ts` — add `sparkThresholds: { half: number; full: number }` to `LevelMeta`.

**Depends on:** Save System, Collectible Spark System.

---

## 5. Save System — Size: S

**Create:** `src/systems/SaveManager.ts`

Singleton class, no Phaser dependency.

```ts
interface SaveState {
  selectedCharacter: string;
  levelsCompleted: Record<string, {
    trophy: 'empty' | 'half' | 'full' | 'sparkling';
    sparksCollected: number;
    bestTime: number;
  }>;
  unlockedItems: string[];
}
```

Methods: `load(slot)`, `save(slot, state)`, `getActiveSlot()`. All `localStorage` calls wrapped in `try/catch` (Safari private mode). Profile slots: `aura-save-A`, `aura-save-B`, `aura-save-C`.

**Depends on:** nothing.

---

## 6. Yellow Aura Attract — Size: S

**Modify:** `src/systems/AuraSystem.ts`, `src/scenes/GameScene.ts`, `src/config.ts`

Add `ATTRACT_RADIUS: 120` and `ATTRACT_SPEED: 80` to config. In `GameScene.update`, if `auraSystem.getCurrentColor() === AuraColor.YELLOW`, iterate `collectiblesGroup.getChildren()`, compute angle to player, apply velocity toward player.

**Depends on:** Collectible Spark System.

---

## 7. Color Zone Visual Polish — Size: S

**Modify:** `src/systems/ColorZone.ts`

Add `Phaser.GameObjects.Particles.ParticleEmitter` per zone; particles drift toward zone center. Use `setTint` on overlapping platforms. Render `Graphics` conduit lines from platform edges to node.

**Depends on:** nothing.

---

## 8. Color Echo Platforms — Size: M

**Modify:** `src/data/LevelLoader.ts`, `src/scenes/GameScene.ts`, `src/data/LevelSchema.ts`

`PlatformDef.echoColor` already reserved. `LevelLoader` tags echo platforms into separate `echoPlatformsGroup`. In `GameScene.update`, iterate group: if player's aura matches `platform.echoColor`, tween alpha to 1 and `body.enable = true`; otherwise tween to 0.3 and `body.enable = false`. Transition duration: 200ms.

**Depends on:** AuraSystem.

---

## 9. Schema Updates — Size: S

**Modify:** `src/data/LevelSchema.ts`, `src/data/LevelValidator.ts`

- Add `hidden?: boolean` to `CollectibleDef`
- Add `sparkThresholds: { half: number; full: number }` to `LevelMeta`
- Confirm `echoColor?: AuraColor` typed on `PlatformDef`
- Update validator for new fields

**Depends on:** nothing.

---

## Dependency Graph

```
SaveSystem ──→ CharacterSelect ──→ Player/Companion
                                         ↓
Schema Updates ──→ Collectibles ──→ YellowAura
                        ↓              ↓
                  LevelComplete    EchoPlatforms
```

## Critical Risk

**Collectible ID immutability:** If a designer renames an `id` in level JSON after shipping, save files silently lose that entry. Rule: collectible and level IDs are immutable once shipped. Add validation or document prominently.
