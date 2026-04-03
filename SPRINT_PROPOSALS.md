# Aura — Sprint 7-9 Proposals
**Team debate:** 2026-04-03 | **Status:** Proposed — pending creative lead approval

---

## Context

Six sprints completed. The game has core mechanics, 3 levels with terrain variety, UI flow, save system, sidekick companion, and reliable touch controls. Deployed at https://7samat.github.io/Aura-game/.

**Key gaps identified by the team:**
- Zero audio (universal blocker)
- Sidekick revive cushion not built (frustration risk for pit deaths)
- No onboarding for yellow aura / echo platforms in levels 2-3
- Color mixing not implemented (hold-to-mix for secondary auras)
- Only 3 levels (need 5+ for a real session)
- No hazards (spike/saw assets exist but unused)
- Accessibility not audited (color-only aura system is risky)
- Trophy system leads nowhere (no unlockable rewards)

---

## Team Perspectives

**Mika (Game Designer):** Audio first, then color mixing for depth. Two more levels built around mixed auras with hazards. "Replayability lives in depth — right now we have breadth with no depth."

**Lea (UX/Child Specialist):** Audio + sidekick revive cushion together. Then onboarding for yellow/echo. Then accessibility pass. "Six-year-olds will quit after three falls into a pit."

**Sam (Tech Lead):** Audio infrastructure + stability pass. Then clean aura state machine for mixing. Then tech debt (error handling, localStorage quota). "Technical debt compounds. Every sprint we skip it, the next costs more."

**Reo (Art Director):** Audio + visual polish on existing effects. Then accessibility (shape overlays on aura colors, contrast audit). Then unlockable palette swaps. "The game runs on color — we owe colorblind kids a shape fallback."

---

## Jay's Synthesized Plan

### Sprint 7: "Foundation" — Audio + Stability

| Aspect | Detail |
|--------|--------|
| **Theme** | Make the game feel alive |
| **Duration** | ~1.5 weeks |
| **Lead** | Sam (infra) + Reo (SFX tie-ins) |

**Scope:**
- Audio infrastructure (SoundManager singleton, Web Audio API)
- Background music loop (1 track, title screen + gameplay)
- 8 core SFX: absorb, gem pickup, stomp, jump, aura switch, level complete, UI tap, pit fall
- Performance baseline on mid-range Android (target: 55fps+)
- Loading states on all async paths
- Wire existing Settings music/sfx toggles to actual audio

**Acceptance criteria:**
- [ ] BGM plays on title screen
- [ ] All 8 SFX fire on correct events
- [ ] No frame drops below 55fps on mid-range device
- [ ] Zero silent-freeze crashes on slow connections

**Risk:** Web Audio API autoplay policy on mobile — needs user-gesture unlock on first tap.

**Playtest question:** *"Does the game feel alive now? Do kids look up when they hear a sound?"*

---

### Sprint 8: "Survivability + Onboarding" — Revive Cushion + Teaching

| Aspect | Detail |
|--------|--------|
| **Theme** | Make dying safe, make mechanics learnable |
| **Duration** | ~1.5 weeks |
| **Lead** | Lea (UX spec) + Mika (level design) |

**Scope:**
- Sidekick revive cushion (respawn at sidekick position on pit death)
- Sidekick point behavior (bounce toward hidden sparks/zones)
- Contextual onboarding for yellow aura + echo platforms (sidekick dialogue bubbles at first encounter, no tutorial screens)
- Fix any P1 bugs from Sprint 7 playtest

**Acceptance criteria:**
- [ ] Zero 6-year-old rage-quits on pit death in playtests
- [ ] 80% of 7-9 year olds identify yellow aura function without prompting after level 2
- [ ] Sidekick revive triggers on pit death, visual "catch" animation
- [ ] Sidekick points at first echo platform and first yellow zone

**Risk:** Revive cushion edge cases — sidekick in a pit, sidekick on a moving platform.

**Playtest question:** *"Does the sidekick make dying feel safe instead of punishing? Do kids understand yellow without being told?"*

---

### Sprint 9: "Depth + Reward" — Color Mixing + Content + Accessibility

| Aspect | Detail |
|--------|--------|
| **Theme** | Give players a reason to master and replay |
| **Duration** | ~2 weeks |
| **Lead** | Mika (mixing + levels) + Reo (accessibility + palette) |

**Scope:**
- Color mixing MVP (hold Action 250ms to blend two auras → purple/orange/green, 10s duration)
- Levels 4 and 5 built around mixed auras with spike/saw hazards
- Unlockable palette swaps tied to trophy milestones
- WCAG contrast audit on all UI
- Shape fallback on aura orbs (triangle=red, diamond=blue, circle=yellow) for colorblind players

**Acceptance criteria:**
- [ ] 70% of playtesters attempt color mixing without instruction
- [ ] Levels 4-5 completable by target age group on first or second try
- [ ] Trophy → palette swap unlock visible in profile screen
- [ ] All aura colors distinguishable by players with deuteranopia

**Risk:** Color mixing is the biggest unknown — if playtest shows confusion, cut mixing and ship levels 4-5 alone.

**Playtest question:** *"Do kids discover mixing on their own? Is the game long enough to feel like a session?"*

---

## Cut Line

If Sprint 8 playtests show kids aren't surviving long enough to reach yellow aura, push color mixing to Sprint 10 and spend Sprint 9 on more levels with better pacing. Palette swaps and accessibility ship regardless — low-risk, high-integrity.

**Non-negotiable:** Shape fallbacks on aura colors ship before any public kid playtest. The game is called Aura — it runs on color. We owe colorblind kids a fallback.

---

## Backlog (post-Sprint 9)

- Sidekick rare enemy stomp (30% chance)
- More levels (6-8 total)
- Unlockable pet companion
- Aura trail cosmetic
- Bonus Rainbow Level
- Capacitor wrapper for app stores
- Proper error handling / localStorage quota management
