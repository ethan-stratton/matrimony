# Contribution guide

## How to work in this repo
This project is a static browser game with ordered script files, not a bundled app.

Before changing code:
1. Read `docs/architecture.md`
2. Check `TEAM_COLLAB_PLAN.md`
3. Use `docs/playtest-checklist.md` before merge

## Local run
```bash
python3 -m http.server 8123
```
Open `http://127.0.0.1:8123/index.html`.

## Rules for safe changes
- Keep script load order intact unless you are intentionally changing dependencies.
- Prefer one subsystem per PR.
- If you change save data shape, document it in the PR.
- If you change `state`, call it out explicitly.
- If you move code between files, update `docs/architecture.md`.
- Runtime assets should live under `assets/`.
- Source/vendor packs should live under `assets-src/` and stay separate from runtime asset paths.

## Current ownership-friendly file layout
- `src/bootstrap.js` — config/audio/bootstrap
- `src/assets.js` — sprites/images/assets
- `src/state.js` — shared state/save helpers
- `src/level.js` — LDtk loading/camera
- `src/input.js` — input/movement/interaction wiring
- `src/combat.js` — combat systems/data
- `src/render.js` — rendering and UI
- `src/main.js` — loop and orchestration
