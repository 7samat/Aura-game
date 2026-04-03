# AURA — UX Guidelines for Child-Centered Features
**Author:** Lea, UX/Child Interaction Specialist | **Date:** 2026-04-02
**Audience:** Developers and designers | **Target ages:** 6-9 (primary: 6-7)

---

## 1. Character Selection Screen

Present exactly 2 characters side by side, centered, equal size. No text labels — identity communicated through animation alone. Each character idles continuously; on hover/focus it bounces once with a soft sparkle burst. Tap triggers a 0.4s "happy wiggle" and the character turns to face the player.

- Minimum touch target: **180×180px**
- Selected character: warm yellow pulsing ring (1Hz) + small heart icon above head
- Unselected character: dims to 60% opacity, turns slightly away
- Confirm button (checkmark + star icon): appears **only** after selection is made
- Show "this one will be your friend" by having the unchosen character wave at the chosen one

---

## 2. Sidekick Behavior UX

**Follow distance:** 2-2.5 character-widths behind player. Never overlap. If player stands still 3+ seconds, sidekick moves to 1.5 widths and faces them.

**Pointing:** Face the direction, bob 3 times with pointing animation. No repeat for 15 seconds — once is helpful, repeating is nagging.

**Cheers:** Trigger only on: first spark per level, recovery from near-fall, level complete. Max 1.5 seconds. Never cheer mid-platforming sequence.

**Revive cushion:** Pause gameplay 0.8s. Sidekick holds player in cradle animation, soft golden glow, player set down with bounce. No text — the visual is self-explanatory.

---

## 3. Collectible Sparks

**Size:** Minimum 48×48px on screen regardless of zoom.

**Animation:** Continuous slow spin + subtle pulse (scale 1.0→1.1→1.0, 0.8s loop).

**Audio:** Every single pickup must have a sound. Rising 3-note chime. **No silent collectibles, ever.**

**Counter:** Fixed top-center. Large icon (32px spark) + number in rounded bubble. Show collected/total using spark icon as separator — no slash character.

**Hidden spark hints:** When player is within 3 tiles, a faint shimmer particle drifts from the hidden spark's direction. No arrow, no highlight — just atmosphere.

---

## 4. Level Complete Screen

Layout (top to bottom):
1. Character celebrating (full animation, 2s loop)
2. Trophy drop animation (falls from top, lands with bounce at 0.5s)
3. Trophy fills to earned state (0.3s transition)
4. Large NEXT button (bottom-center, glowing, auto-focuses after 2.5s)

**Do NOT show:** score numbers, time, comparisons to other runs, failure count, or any ranking. The trophy is the only feedback metric.

NEXT button uses a forward-arrow icon only — no text required.

---

## 5. Save/Profile System

Each profile slot is a large square tile (min **140×140px**) displaying a unique animal icon + distinct background color (never reuse color across slots). No names required. Empty slots show a blinking "+" with soft pulse. Selection uses same warm yellow glow ring as character selection. Maximum 3 slots visible.

---

## 6. General Rules

| Rule | Constraint |
|------|-----------|
| Max UI elements during gameplay | 3 (aura indicator, spark counter, sidekick) |
| Text in gameplay | **Prohibited.** Icons and animation only. |
| Text in menus | Permitted as supplement to icons, font min 22px |
| Failure/death | Fade to white (not black), sidekick catches player, no "Game Over" text |
| Color accessibility | Never red/green as only differentiator. All states must differ in shape or animation. |
| Button minimum tap target | 80×80px, no exceptions |
| Loading/transition screens | Always show sidekick doing something (juggling, napping) — never blank screen or spinner |
| Sound | Every interactive element needs audio feedback. Silence = broken. |
