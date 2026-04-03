# Aura — Sprint Plan
**Author:** Jay, Producer | **Last updated:** 2026-04-03

---

## Completed Sprints

### Sprint 1-2: Foundation (Completed)
- Project scaffold (Phaser 3 + Vite + TypeScript)
- Core aura mechanics (absorb, 3 colors, gates, echo platforms)
- Data-driven level system (JSON schema, loader, validator)
- Placeholder graphics → Kenney asset integration
- 1 playable level

### Sprint 3: Core Loop (Completed)
- Collectible aura sparks (colored gems + hidden white)
- Yellow aura attract mechanic
- Color Echo Platforms
- Level-complete screen with trophy system
- HUD spark counter
- 3 playable levels

### Sprint 4: UI & Progression (Completed)
- Full UI flow: Title → Profile → Character Select → Level Select → Settings
- Save system (localStorage, 3 profile slots)
- Character selection (Kai / Nova — works in gameplay)
- Kenney UI Pack integration (glossy buttons, arrows)

### Sprint 5: Game Feel & Sidekick (Completed)
- Sidekick companion (follow + cheer)
- AuraGate redesign — full-height energy walls (can't jump over)
- ColorZone redesign — energy node beacons with rings, particles, beacon pulse
- Screen shake on stomp, landing squash/stretch
- Death/respawn fade-to-white
- Camera deadzone + look-ahead
- Character selection → gameplay texture wiring fixed
- Kenney tile/gem/background/SFX asset integration
- TileSprite parallax backgrounds
- CLAUDE.md + Phaser skill references

### Sprint 6: Controls & Terrain (Completed)
- Touch controls rewritten with raw DOM events (fixes 30s death, cross-trigger)
- Ground segments with gaps/pits (replaces flat ground)
- Bounce pads, moving platforms, elevation changes
- Killzone for pit death
- All 3 levels redesigned with terrain variety
- GitHub Pages deployment + CI/CD

---

## Upcoming Sprints

See [SPRINT_PROPOSALS.md](SPRINT_PROPOSALS.md) for the team's proposed scope for Sprints 7-9.

---

## GO / NO-GO Decision Point

**After Sprint 7 playtest.** The game now has enough mechanics and content for a meaningful kid playtest. Key signals:

- Kids spontaneously collect sparks (not just run past them)
- At least one kid tries to replay a level
- Kids experiment with aura switching
- Touch controls work reliably for 2+ minutes
- Sidekick is noticed and appreciated
