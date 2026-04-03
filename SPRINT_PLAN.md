# Aura — Sprint Plan
**Author:** Jay, Producer | **Date:** 2026-04-02

---

## Sprint 3: Core Loop
**Duration:** 2 weeks | **Goal:** Validate that collecting + switching auras drives forward momentum

### In scope
- Collectible aura sparks (colored only — white sparks deferred to Sprint 4)
- Yellow aura attract mechanic
- Color Echo Platforms
- Level-complete screen (trophy feedback, no persistence yet)
- 1-2 new levels (JSON, rough layout)

### Cut (and why)
- Character selection → adds decision friction before we know the loop is fun
- Sidekick → depends on character select; premature
- Save system → not needed to answer the core question
- Hidden white sparks → polish item, not core loop

### Acceptance criteria
- [ ] Player collects sparks, counter visible in HUD
- [ ] Yellow aura visibly pulls nearby sparks
- [ ] Color Echo Platforms activate/deactivate based on aura
- [ ] Level-complete screen shows trophy state
- [ ] Zero crash bugs on Chrome desktop
- [ ] ~10 minutes of playable content across 3 levels

### Playtest question
**"Is collecting and switching auras satisfying enough to drive forward momentum on its own?"**

---

## Sprint 4: Polish & Content
**Duration:** 2 weeks | **Goal:** Test sidekick value and visual quality bar

### In scope
- Character selection (pick 1 of 2)
- Sidekick companion (follow, point, cheer, revive cushion, rare enemy stomp)
- Hidden white sparks
- Color zone visual polish (particles, conduit lines)
- 3 more levels (total: 5-6)

### Acceptance criteria
- [ ] Character select screen functional, unchosen character appears as sidekick
- [ ] Sidekick revive cushion triggers correctly
- [ ] Sidekick stomp fires at ~30% probability
- [ ] White sparks hidden but discoverable
- [ ] Particle/conduit effects at 60fps on mid-range hardware
- [ ] 5+ levels completable start to finish

### Playtest question
**"Does the sidekick make kids feel less alone? Does visual polish elevate perceived quality?"**

---

## Sprint 5: Progression & Meta
**Duration:** 2 weeks | **Goal:** Test retention and ownership

### In scope
- Save system (localStorage, profile slots A/B/C)
- Trophy persistence across sessions
- Level select screen with trophy display
- Accessibility pass (contrast, font size, button targets)
- Bug sweep

### Acceptance criteria
- [ ] Progress persists across browser sessions
- [ ] Profile slots selectable from main menu
- [ ] Full 5+ level run completable with no blocker bugs
- [ ] Accessibility audit passes (WCAG AA for UI components)

### Playtest question
**"Do kids want to return? Does saving create ownership?"**

---

## GO / NO-GO Decision Point

**End of Sprint 3 playtest.**

If kids aged 6-9 don't self-direct toward spark collection without prompting, the core loop isn't working. Cut losses or pivot before character, sidekick, and content investment compounds.

**Green light signals:**
- Kids spontaneously collect sparks (not just run past them)
- At least one kid tries to replay a level for more sparks
- Kids experiment with aura switching (not just sticking to one color)
- The attract mechanic gets a visible "whoa" reaction
