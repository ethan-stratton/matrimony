# Architecture

## Overview
Matrimony is a static browser game built with plain JavaScript, HTML5 Canvas, LDtk level data, browser audio APIs, and localStorage saves.

There is no bundler or framework. Scripts are loaded directly by `index.html` in order.

## Recommended structure for this repo
For a **2-person team**, the current target structure is:

```html
<script src="src/bootstrap.js"></script>
<script src="src/assets.js"></script>
<script src="src/state.js"></script>
<script src="src/level.js"></script>
<script src="src/input.js"></script>
<script src="src/combat.js"></script>
<script src="src/render.js"></script>
<script src="src/main.js"></script>
```

## Asset layout
### Runtime assets
Runtime assets live under `assets/`.

- `assets/ui/` — favicon and chest UI art
- `assets/fonts/` — RM2000 font files
- `assets/characters/` — runtime player/skeleton sheets
- `assets/enemies/` — enemy runtime sprites
- `assets/items/` — runtime item icons
- `assets/effects/` — runtime effect/planet art
- `assets/audio/` — music/SFX files loaded by the game

### Source/vendor assets
Source packs and library-style art now live under `assets-src/`.

- `assets-src/character-packs/`
- `assets-src/enemy-packs/`
- `assets-src/effects-packs/`

LDtk tileset art remains under `LDtK_Matrimony/` because that path is editor/runtime-coupled.

## Source map
### `src/bootstrap.js`
- canvas sizing/config constants
- audio context and sound helpers
- title/battle music bootstrap
- EarthBound-style battle background helpers

### `src/assets.js`
- tileset globals
- sprite loading helpers
- player/skeleton sheet setup
- ground item sprite registration

### `src/state.js`
- save/load helpers
- slot metadata helpers
- `applySave()`
- central shared `state`

### `src/level.js`
- LDtk loading and parsing
- tiles/entity extraction
- camera helpers

### `src/input.js`
- keyboard handlers
- mouse handlers
- movement/transition helpers
- interaction entrypoints
- chest interaction input helper

### `src/combat.js`
- combat AI
- enemy/action data
- combat start/exit/update helpers
- weapon transformation logic

### `src/render.js`
- crisp text helpers
- inventory/title/dialogue/chest/combat rendering
- world rendering helpers
- fish rendering

### `src/main.js`
- world AI updates
- fish stream updates
- game loop orchestration
- init/boot sequence

## Shared state hotspots
These areas are most likely to cause conflicts if edited carelessly:
- `state`
- save format fields
- combat state object shape
- rendering order / overlays
- movement and transition behavior

If a PR changes any of those, call it out explicitly.
