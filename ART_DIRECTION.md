# AURA — Art Direction Guide
**Art Director: Reo | Audience: Ages 6-9 | Theme: Soul vs. Machine**

---

## 1. Color Palette

### Aura Colors
| Name | Hex | Meaning | Ability |
|------|-----|---------|---------|
| Ember Red | `#FF4D4D` | Courage, fire, will | Speed boost (1.4×) |
| Sky Blue | `#4DC8FF` | Calm, reach, flow | Jump boost (1.5×) |
| Solar Yellow | `#FFD94D` | Curiosity, warmth | Reserved M2 |

All three are saturated and warm-leaning — they pop against the cold environment by design. Never desaturate them.

### Environment
- **Sky top:** `#0A0A2E` — deep indigo-void
- **Sky bottom:** `#1A1A4E` — midnight blue
- **City silhouette:** `#1A1A5A` at 80% opacity — machine-dark
- **Neon city edges:** `#4DC8FF` at 40% — cold tech echo, same blue as Sky Blue to tie world to player agency
- **Ground / platforms:** `#2A2A4A` base, with a 1px top-edge highlight at `#4DC8FF` 30% — platforms feel like data slabs

### Warmth vs. Coldness
Characters (Kenney Platformer Characters) are warm-skinned, soft-edged. The world is hard rectangles and neon lines. Maintain this by:
- Characters: no neon outlines. Use warm glow ellipses (`#FF4D4D`, `#4DC8FF`, `#FFD94D`).
- Environment: only hard strokes, no soft glows except on interactive elements.
- Enemies: `#1A1A5A` base tint. They belong to the machine world.

### UI Color Scheme
- **Background/panel:** `#0A0A2E` at 85% alpha
- **Aura indicator (empty):** `#333366` fill, white stroke — "the slot is waiting"
- **Aura indicator (active):** fills with zone color at 100%
- **Text:** `#FFFFFF` primary, `#4DC8FF` secondary/labels
- **Buttons:** Kenney UI Pack Sci-Fi Space. Default state tinted `#2A2A4A`; pressed state full white.

---

## 2. Absorption Node Design

Current implementation (`ColorZone`) renders as a filled rectangle at 15–35% alpha with a colored stroke. Upgrade target:

**Energy Node visual:** Render as a hexagonal or circular "conduit pod" — not a flat rectangle. Sprite should suggest a charging socket embedded in the machine world.

- **Active state:** Zone color fill at 20–35% (pulsing tween already wired: 1500ms Sine yoyo). Add 4–6 small particles drifting upward in zone color — speed: 20px/s, alpha 0.6→0, lifespan 1200ms.
- **Conduit lines:** Thin 1px lines (`strokeRect` style) radiating from node center to platform edges. Color: zone hex at 25% alpha. Suggests the node is "plugged in."
- **Platform tint:** The platform directly beneath a node gets a subtle top-edge glow strip in zone color at 20% alpha.
- **Depleted state:** After absorption — fill drops to 0, stroke becomes `#333366`, particles stop. Add a 500ms flash-to-white then fade. Node stays visible as a dark socket so kids see where they charged.

---

## 3. Spark Collectible Design

Sparks map to `CollectibleDef` (type: `star` | `fragment`).

- **Size on screen:** 18–20px diameter. At 800×450 this reads clearly. On phone (scaled down), 18px is the minimum; do not go smaller.
- **Color-coded sparks:** Match zone color. Star = round sprite with inner bright core + outer soft halo in zone color. Use a 3-frame shimmer animation (frames rotate through 80%→100%→80% scale, 400ms loop).
- **Zone matching:** Red zone sparks are `#FF4D4D` with a warm orange inner glow `#FF8844`. Blue zone sparks are `#4DC8FF` with a white-blue core. Yellow sparks are `#FFD94D` with cream core `#FFFACC`.
- **Hidden white sparks:** Color `#FFFFFF`, slightly larger (22px), faint rainbow shimmer cycling through all three zone colors at 15% alpha. They should feel "out of place" — pure light in a neon world. No label or arrow pointing to them.
- **Pickup animation:** Scale burst (1.0 → 1.6 → 0) over 250ms + 8 tiny particles ejecting outward in zone color. Sound cue should feel like a warm chime, not a digital beep.

---

## 4. Sidekick Visual Treatment

The NPC uses the `adventurer` tilesheet at scale 0.35 (player is 0.40) — already slightly smaller. Build on this:

- **Identity marker:** Render a small name-tag text object above the NPC at all times (`#FFFFFF` 70% alpha, 9px, font: same as game UI). Tag reads "ECHO" or the character name. Fades to 0 when NPC is walking; returns on idle.
- **Ambient glow:** NPC glow ellipse (`#FFFFFF`) pulses softly at alpha 0.15–0.25, 2000ms Sine yoyo — always present, even without an aura. Player glow only appears after absorbing a color. This is the key visual distinction.
- **State: following** — `npc-move` anim, glow steady.
- **State: pointing** — `npc-idle` anim + a small arrow sprite rendered to the right/left of NPC, bobbing up/down, zone color tinted.
- **State: cheering** — `player-cheer` frames [3,4] (same tilesheet, same frames), glow scales up to 1.3× and flashes white, confetti particles burst from NPC position.
- **State: catching player** — NPC snaps to player X position instantly (teleport, no tween), plays `action` frames [0,1], glow flashes zone color at 0.8 alpha for 300ms.

---

## 5. Level Complete Screen

No implementation yet. Spec:

- **Background:** Full-screen overlay `#0A0A2E` at 92% alpha with a slow radial gradient bloom in the player's last aura color emanating from screen center.
- **Trophy/gem progression:** 3 gem slots displayed horizontally.
  - *Empty:* Dark gem shape `#2A2A4A`, no shine. Stroke `#4DC8FF` 30%.
  - *Earned (1 gem):* Zone-color fill, 3-frame sparkle animation, white top-facet highlight.
  - *Full (3 gems):* All three gems lit in Red/Blue/Yellow, rotating slowly (0.5 deg/frame), rainbow particle burst on fill.
- **Celebration particles:** 40 particles, colors cycling through `#FF4D4D`, `#4DC8FF`, `#FFD94D`. Physics: burst upward with gravity, lifespan 1800ms.
- **Text:** "LEVEL CLEAR" in bold, `#FFFFFF`, stroke `#FFD94D` 2px. Sub-label with spark count in `#FFD94D`.

---

## 6. Color Echo Platforms

Color Echo Platforms require a specific aura to activate (maps to `AuraGateDef` behavior; same color-gating logic applies to platforms in M2).

- **Inactive state:** Platform rendered in `#2A2A4A` with a faint colored icon centered on top — a small circle in the required aura color at 40% alpha + the shape icon (see Accessibility below). Slow pulse: alpha 0.3→0.5, 1800ms Sine yoyo.
- **Requirement hint:** The hint icon circle (already implemented on `AuraGate` at 16px, pulsing 1→1.3× scale) is the visual contract. Do not add text labels.
- **Active state:** Platform surface fills with aura color at 30% alpha. Top edge glow strip brightens to 60% alpha. Hint icon fades out.
- **Transition animation:** 400ms ease-Power2 fill sweep left-to-right (not instant fade). Platform emits 6 upward particles in aura color on activation.

---

## 7. Accessibility

Every color-coded element uses **color + shape** simultaneously. Never color alone.

| Element | Color | Shape/Icon |
|---------|-------|-----------|
| Red aura / zone | `#FF4D4D` | Triangle / flame tip |
| Blue aura / zone | `#4DC8FF` | Diamond / upward arrow |
| Yellow aura / zone | `#FFD94D` | Circle / star burst |
| White spark (hidden) | `#FFFFFF` | 6-pointed star outline |

**Contrast ratios (WCAG AA minimum 4.5:1 for text, 3:1 for UI components):**
- Aura indicator on `#0A0A2E`: all three aura colors exceed 3:1 against the dark panel.
- White text `#FFFFFF` on `#0A0A2E`: ~17:1. Compliant.
- `#4DC8FF` secondary text on `#0A0A2E`: ~6.5:1. Compliant.
- Zone stroke (`zone color` at 80%) on environment `#1A1A4E`: verify per color. Red and Yellow both exceed 3:1. Blue `#4DC8FF` on `#1A1A4E`: ~4.2:1 — acceptable for non-text UI.

**Additional rules:**
- Never rely on red-green distinction. Red and Yellow zones must differ in shape, not just hue.
- Touch button minimum size: 96px (already enforced via `TOUCH_BUTTON_SIZE`). Do not reduce.
- Particle effects must not be the sole carrier of information — always pair with a shape or audio cue.

---

*This document reflects M1 implementation. M2 additions (color mixing, yellow ability, color echo platforms as separate entities) will require a revision.*
