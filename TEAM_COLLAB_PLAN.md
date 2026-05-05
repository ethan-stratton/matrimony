# Matrimony collaboration plan

## Goal
Keep the repo comfortable for a **2-person team** while reducing merge conflicts and making responsibilities clearer.

## Current recommendation
Stop at a **middle-weight structure** instead of over-modularizing.

Recommended source layout:

```text
src/
  bootstrap.js
  assets.js
  state.js
  level.js
  input.js
  combat.js
  render.js
  main.js
```

This is the sweet spot for a small team:
- enough separation to avoid constant collisions
- not so many files that development gets annoying

---

## Ownership lanes

### Person A — systems/gameplay
- `src/input.js`
- `src/combat.js`
- relevant parts of `src/state.js`

### Person B — rendering/content
- `src/render.js`
- `src/level.js`
- assets / LDtk / polish

### Shared
- `src/main.js`
- `src/bootstrap.js`
- save format changes in `src/state.js`

---

## Why stop here
Going further into lots of tiny files (`ui-title.js`, `ui-dialogue.js`, `movement.js`, `ai.js`, etc.) is more useful for a larger team than a 2-person team.

For two people, the goal is:
- clear seams
- not too many seams

---

## PR guidance
- One subsystem per PR.
- Prefer smaller PRs.
- Avoid drive-by edits in unrelated files.
- Call out `state` or save-format changes explicitly.

---

## Manual smoke checks
Before merge, verify:
1. Splash -> title -> game works.
2. Movement / running / flying still work.
3. Ground items / chests still work.
4. Combat still starts and resolves.
5. Inventory and save/load still work.
6. Audio still behaves correctly.
