# Aura — Game Design Specification
**Author:** Mika, Lead Game Designer | **Date:** 2026-04-02 | **Status:** Active Reference

---

## 1. Core Identity

| Field | Value |
|---|---|
| Title | Aura |
| Genre | 2D side-scrolling platformer |
| Platform | Browser-first (Phaser 3); Capacitor wrapper for app store release |
| Audience | Ages 6–9 |
| Theme | Soul vs. Machine — warm human characters navigating a cold neon cyberpunk world |
| Session Length | 3–5 minutes per level |

---

## 2. Characters

Three characters share an identical **80×110 px Kenney tilesheet** format for full sprite-swap compatibility.

| ID | Name | Appearance | Status |
|---|---|---|---|
| `player` | Player | Green shirt kid | Starter — pick at game start |
| `female` | Female | Blue dress kid | Starter — becomes sidekick if not chosen |
| `adventurer` | Adventurer | TBD | Unlockable (post-validation) |

**Selection flow:** Title screen presents Player and Female. Kid taps one. The other immediately becomes the autonomous sidekick NPC for the entire session. No mechanical difference between the two starters.

---

## 3. Core Mechanic — Aura Absorption

### 3.1 Aura Colors

| Color | Effect |
|---|---|
| Red | Speed boost — increased run velocity |
| Blue | Jump boost — increased jump height/hang |
| Yellow | Attract — nearby sparks drift toward player |

Auras persist until replaced by a new absorption. There is no timed expiry (timer system exists but stays dormant unless activated by a future design decision).

### 3.2 Absorption Nodes

Nodes are discrete power-up stations placed in levels — they do **not** tint the whole environment. Each node carries three environmental cues so young players can read intent without text:

- Particles drifting inward toward the node
- Subtle color tint on platforms within ~150 px
- Glowing conduit lines connecting nearby geometry to the node

**Tap Action** near a node = absorb its aura. **Hold Action** (unlocked mid-game) = mix two auras using color theory (red + blue = purple, etc.).

### 3.3 Color Echo Platforms

Platforms tagged as Color Echo only exist (become solid) while the player holds the matching aura color. Used for gated mid-level barriers and optional secret paths.

---

## 4. Sidekick Companion System

The unchosen starter character follows the player autonomously. The kid never directly controls the sidekick. All behaviors are scripted state-machine transitions.

| Behavior | Trigger | Action |
|---|---|---|
| FOLLOW | Default state | Runs ~100 px behind player; mirrors jumps with a short delay |
| POINT | Nearby unnoticed color node or hidden spark | Stops, bounces in place facing the target |
| CHEER | Spark collected or gate passed | Plays cheer animation (1–2 s) then returns to FOLLOW |
| REVIVE CUSHION | Player death | Respawn occurs at sidekick's current position instead of level start |
| ENEMY STOMP | Enemy approaches player from behind | ~30% chance to stomp and defeat enemy — rare, surprising |

REVIVE CUSHION is the mechanical heart of the sidekick: it acts as a mobile checkpoint without requiring the kid to manage saves.

---

## 5. Collectibles — Aura Sparks

- **Regular sparks:** ~18 per level, color-coded to the zone they sit in (red / blue / yellow)
- **Hidden white sparks:** 3 per level, placed in secret or tricky spots — count double toward trophy fill
- Any active aura can collect any spark color — no color-locking on collection
- Yellow attract aura pulls nearby sparks toward the player passively

---

## 6. Progression & Rewards

### 6.1 Level Complete Screen

Big celebration animation plays. Reward badge is shown. Single giant NEXT button. No score breakdown or number totals — designed for the 6–9 attention span.

### 6.2 Trophy System

Replaces 1–3 stars. Completion always awards *something*.

| Trophy State | Condition |
|---|---|
| Empty (awarded) | Finish the level |
| Half-full | Collect 60% of sparks |
| Full | Collect all sparks including hidden whites |
| Sparkling | Full trophy + fast time (criteria never shown — feels like a surprise) |

### 6.3 Unlockables (post-validation)

| Trophies | Reward |
|---|---|
| 5 | NPC pet companion |
| 10 | Character palette swap |
| 20 | Aura trail cosmetic |
| 30 | Bonus Rainbow Level |

---

## 7. Enemies

- Source: Kenney Robot Pack — reinforces soul vs. machine theme
- Behavior: patrol back-and-forth on platforms
- Defeat: player (or sidekick) stomps from above
- Violence bar: light, non-human, no blood or distress sounds
- Aura interaction: none — enemies are independent of the aura system

---

## 8. Level Design Recipe

**Canvas:** 3200–4800 px wide. Target playtime 3–5 minutes.

| Element | Count per Level |
|---|---|
| Colored sparks | ~18 |
| Hidden white sparks | 3 |
| Absorption nodes (color zones) | 2–3 |
| Robot enemies | 3–4 |
| Aura-gated barrier (mid-level) | 1 |
| Optional side path to hidden spark | 1 |

**Flow notes:**
- Auto-save triggers at every zone transition
- On death: respawn at sidekick position (or level start if sidekick not yet established)
- No death counter is shown at any point

---

## 9. Controls

### Touch (primary)

- 4 buttons: Left / Right / Jump / Action
- Button size: 96 px, bottom corners, sci-fi UI skin
- Action tap = absorb; Action hold = mix (once unlocked)

### Keyboard (secondary)

| Input | Action |
|---|---|
| A / Left Arrow | Move left |
| D / Right Arrow | Move right |
| W / Up Arrow / Space | Jump |
| E | Action (tap = absorb, hold = mix) |

---

## 10. Technical Stack

| Layer | Choice |
|---|---|
| Engine | Phaser 3 |
| Build | Vite + TypeScript |
| Level data | JSON schema (data-driven, editor-friendly) |
| Assets | Asset manifest — sprite keys decoupled from filenames for easy swapping |
| Save | localStorage, 3 profile slots (A / B / C) |
| Distribution | Browser-first; Capacitor wrapper for iOS/Android app store submission |
