# Asset cleanup plan

## Goal
Make asset organization predictable for a small team without turning asset cleanup into a giant risky rewrite.

## Status
**Phase 1 runtime cleanup is complete on the collaboration branch.**
**Phase 2/3 source-vendor separation is also now partially complete.**

What was done:
- created `assets/`
- moved runtime UI/audio/enemy/item/effect/font files under `assets/`
- copied current runtime player/skeleton sheets into `assets/characters/`
- updated game references to use the new runtime asset paths
- moved source character packs into `assets-src/character-packs/`
- moved non-runtime sprite-library files into `assets-src/enemy-packs/deepdive/`
- moved the large unused effects library into `assets-src/effects-packs/`

This plan now doubles as the roadmap for the remaining cleanup work.

This plan assumes:
- keep gameplay behavior unchanged
- improve folder structure first
- avoid moving LDtk-managed tileset files until that path is explicitly verified

---

## Current runtime asset inventory
These files are directly referenced by the current game runtime (`index.html` + `src/*.js` + LDtk):

### UI / shell
- `assets/ui/favicon.png`
- `assets/ui/chests/chest_closed.png`
- `assets/ui/chests/chest_open.png`

### Fonts
- `assets/fonts/RM2000.ttf`
- `assets/fonts/RM2000Alt.ttf`
- `assets/fonts/RMG2000.ttf`

### Character runtime sprites
- `assets/characters/player/prototype_character.png`
- `assets/characters/skeleton/skeleton.png`

### Enemy runtime sprites
- `assets/enemies/fire_elemental.png`
- `assets/enemies/ice_golem.png`
- `assets/enemies/swooping_bat.png`
- `assets/effects/planet.png`
- `assets/effects/explosion.png`

### Item runtime sprites
- `assets/items/shortbow.png`
- `assets/items/rusty_shortsword.png`
- `assets/items/buckler.png`
- `assets/items/thunder_scroll.png`
- `assets/items/heal_scroll.png`
- `assets/items/copy_mirror.png`

### Audio
- `assets/audio/battle.mp3`
- `assets/audio/title.mp3`

### LDtk / tileset runtime data
- `LDtK_Matrimony/Matrimony.ldtk`
- `LDtK_Matrimony/Tilesets/Free-Undead-Tileset-Top-Down-Pixel-Art/Tiled_files/Ground_rocks.png`

---

## Current repo smells

### 1) Runtime character/source-pack duplication still exists
Current runtime character sheets now live in `assets/characters/`, and original source packs now live under:
- `assets-src/character-packs/Snoblin_Prototype_Character/...`
- `assets-src/character-packs/Snoblin_Free_Skeleton/...`

That duplication is acceptable for now because it cleanly separates runtime dependencies from source/vendor material.

### 2) Large likely-unused sprite pool is now quarantined under `assets-src/`
Currently referenced root sprite PNGs are only:
- `FireElemental.png`
- `IceGolem.png`
- `SwoopingBat.png`
- `planet.png`
- `explosion.png`

Likely unused root sprite candidates at the moment:
- `AcidAnt.png`
- `AdeptNecromancer.png`
- `BloatedBedbug.png`
- `CorruptedTreant.png`
- `DeftSorceress.png`
- `DungBeetle.png`
- `EarthElemental.png`
- `EngorgedTick.png`
- `ExpertDruid.png`
- `FamishedTick.png`
- `FlutteringPixie.png`
- `ForagingMaggot.png`
- `GlowingWisp.png`
- `GrizzledTreant.png`
- `InfectedMouse.png`
- `IronGolem.png`
- `LavaAnt.png`
- `MagicalFairy.png`
- `MawingBeaver.png`
- `NovicePyromancer.png`
- `PlagueBat.png`
- `RhinoBeetle.png`
- `SoldierAnt.png`
- `TaintedCockroach.png`
- `TunnelingMole.png`
- `VileWitch.png`
- `WaterElemental.png`

These may be useful future content, but they are not current runtime dependencies.

### 4) Huge effects pack with no current runtime references
- `sprites/effects/` contains **273 files**
- current code does **not** reference that directory directly

This strongly suggests `sprites/effects/` is source/library material, not runtime-critical content.

### 5) Duplicate or ambiguous LDtk files
There are three `.ldtk` files:
- `LDtK_Matrimony/Matrimony.ldtk` ← current runtime file
- `LDtK_Matrimony/LDtK_Matrimony.ldtk`
- `Matrimony.ldtk`

Only `LDtK_Matrimony/Matrimony.ldtk` is referenced by runtime code today.

The other two should be treated as **investigate before delete/move** files.

---

## Recommended target structure

```text
assets/
  ui/
    favicon.png
    chests/
      chest_closed.png
      chest_open.png
  fonts/
    RM2000.ttf
    RM2000Alt.ttf
    RMG2000.ttf
  characters/
    player/
      prototype_character.png
    skeleton/
      skeleton.png
  enemies/
    fire_elemental.png
    ice_golem.png
    swooping_bat.png
  items/
    shortbow.png
    rusty_shortsword.png
    buckler.png
    thunder_scroll.png
    heal_scroll.png
    copy_mirror.png
  effects/
    explosion.png
    planet.png
  audio/
    title.mp3
    battle.mp3
```

And separately:

```text
assets-src/
  character-packs/
    Snoblin_Prototype_Character/
    Snoblin_Free_Skeleton/
  enemy-packs/
    deepdive/
  effects-packs/
    fire-punch-pack/
  docs/
    licenses/
```

---

## Recommended move map

### Phase 1 — safe runtime cleanup
Completed:

- `favicon.png` -> `assets/ui/favicon.png`
- `chest_closed.png` -> `assets/ui/chests/chest_closed.png`
- `chest_open.png` -> `assets/ui/chests/chest_open.png`
- `sounds/title.mp3` -> `assets/audio/title.mp3`
- `sounds/battle.mp3` -> `assets/audio/battle.mp3`
- `sprites/FireElemental.png` -> `assets/enemies/fire_elemental.png`
- `sprites/IceGolem.png` -> `assets/enemies/ice_golem.png`
- `sprites/SwoopingBat.png` -> `assets/enemies/swooping_bat.png`
- `sprites/planet.png` -> `assets/effects/planet.png`
- `sprites/explosion.png` -> `assets/effects/explosion.png`
- `sprites/items/*.png` -> `assets/items/`
- runtime font files -> `assets/fonts/`
- runtime player/skeleton sheets copied into `assets/characters/`

References were updated in:
- `index.html`
- `src/assets.js`
- `src/combat.js`
- `src/render.js`

### Phase 2 — separate runtime character art from pack folders
Completed:
- runtime player sheet copied to `assets/characters/player/prototype_character.png`
- runtime skeleton sheet copied to `assets/characters/skeleton/skeleton.png`
- pack originals moved under `assets-src/character-packs/`

### Phase 3 — source/vendor quarantine
Completed:
- `character sprite/` -> `assets-src/character-packs/`
- likely-unused enemy sprite library from `sprites/` -> `assets-src/enemy-packs/deepdive/`
- `sprites/effects/` -> `assets-src/effects-packs/`

Still optional later:
- consolidate font/source-pack docs into a clearer `assets-src` documentation subtree if desired

### Phase 4 — duplicate audit
Investigate and document before deleting:
- `LDtK_Matrimony/LDtK_Matrimony.ldtk`
- `Matrimony.ldtk`

Do not delete those casually.

---

## Important do-not-move-yet items

### LDtk tileset path
Do **not** move this in the first pass:
- `LDtK_Matrimony/Tilesets/Free-Undead-Tileset-Top-Down-Pixel-Art/Tiled_files/Ground_rocks.png`

Reason:
- LDtk stores a relative path inside the project file
- moving it means updating LDtk metadata and verifying editor compatibility

### Pack licenses / PDFs
Do **not** drop these on the floor:
- `assets-src/character-packs/Snoblin_Free_Skeleton/License.txt`
- `assets-src/character-packs/Snoblin_Free_Skeleton/Thank You!.pdf`
- `assets-src/character-packs/Snoblin_Prototype_Character/License.txt`
- `assets-src/character-packs/Snoblin_Prototype_Character/Thank You!.pdf`

These should remain with source/vendor material.

---

## Minimal policy for this repo

### Rule 1
All **runtime** assets live under `assets/`.

### Rule 2
All **source/vendor/library** assets live under `assets-src/`.
This is now the active convention, not just a future recommendation.

### Rule 3
New runtime asset references should be declared in `src/assets.js` or the relevant central asset map, not scattered ad hoc.

### Rule 4
If an asset is moved, update the architecture/docs in the same PR.

---

## Recommended execution order
1. Create `assets/` and move only the clearly runtime files. ✅
2. Update code references. ✅
3. Verify the game still boots and renders. ✅
4. Move source/vendor packs to `assets-src/`. ✅
5. Audit duplicates and likely-unused files. ⏳

---

## Best next step
The safest next implementation PR would be:

**"Asset audit phase: decide what to keep, archive, or delete among duplicate `.ldtk` files and quarantined source libraries"**

That is the next highest-value cleanup step, now that runtime and source assets are separated.
