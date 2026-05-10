# Tileset Reference — Ground_rocks.png

Tileset: `Tilesets/Free-Undead-Tileset-Top-Down-Pixel-Art/Tiled_files/Ground_rocks.png`
Grid: 16×16px tiles, 26 columns wide (416px)

## Tile Regions (src coordinates in px)

### Ground / Floor
| Tile | Src (x,y) | Notes |
|------|-----------|-------|
| Main fill | `(32,32)` | Beige stone — use everywhere for walkable floor |
| Alt fill | `(48,32)` | Slightly different texture, mix with main |

### Rock Wall Block (North-facing 3/4 cliff — 5 cols × 7 rows)
Place as a **group**. Top row is the cliff cap, bottom rows are the sheer face.
```
Row 0: (0,0)   (16,0)   (32,0)   (48,0)   (64,0)     ← cliff cap/overhang
Row 1: (0,16)  (16,16)  (32,16)  (48,16)  (64,16)
Row 2: (0,32)  (16,32)  (32,32)  (48,32)  (64,32)    ← blends into ground
Row 3: (0,48)  (16,48)  (32,48)  (48,48)  (64,48)
Row 4: (0,64)  (16,64)  (32,64)  (48,64)  (64,64)
Row 5: (0,80)  (16,80)  (32,80)  (48,80)  (64,80)
Row 6: (0,96)  (16,96)  (32,96)  (48,96)  (64,96)    ← base of wall
```
**In existing levels:** Used 3-5 cols wide, always full 7 rows tall. Often only cols 0-3 or 1-4 depending on left/right position. Column 2 (`x=32`) is the center, repeatable.

### Cliff Left Edge (West wall — 4 cols × 3 rows)
Connects ground to cliff at the left side.
```
Row 0: (176,176) (192,176) (208,176) (224,176)   ← top transition
Row 1: (176,192) (192,192) (208,192) (224,192)   ← cliff face mid
Row 2: (176,208) (192,208) (208,208) (224,208)   ← bottom transition
```
**Usage:** The mid row `(176-224,192)` can be repeated vertically for tall cliffs.

### Raised Area / Right Cliff (4 cols × 6 rows)
Forms elevated rocky terrain.
```
Row 0: (176,336) (192,336) (208,336) (224,336)
Row 1: (176,352) (192,352) (208,352) (224,352)    ← top edge
Row 2: (176,368) (192,368) (208,368) (224,368)
Row 3: (176,384) (192,384) (208,384) (224,384)
Row 4: (176,400) (192,400) (208,400) (224,400)
Row 5: (176,416) (192,416) (208,416) (224,416)    ← base
```

### Right Edge (vertical cliff boundary)
```
(272,224)  ← top cap
(272,240)  ← upper edge
(272,256)  ← mid edge (repeatable)
(272,272)  ← lower edge
(272,288)  ← base
```
**Usage:** `(272,256)` is the repeatable mid section. Used for long vertical right-side walls.

### Cave Back (3 cols × 3 rows)
Dark cave/alcove recesses.
```
(352,288) (368,288) (384,288)   ← top
(352,304) (368,304) (384,304)   ← mid
(352,320) (368,320) (384,320)   ← bottom
```

### Water (8+ cols × 4 rows)
```
Row 0: (16,496)  (32,496)  (48,496)  (64,496)  (80,496)  (96,496)  (112,496) (128,496) (144,496)
Row 1: (16,512)  (32,512)  (48,512)  (64,512)  (80,512)  (96,512)  (112,512) (128,512) (144,512)
Row 2: (16,528)  (32,528)  (48,528)  (64,528)  (80,528)  (96,528)  (112,528) (128,528) (144,528)
Row 3: (16,544)  (32,544)  (48,544)  (64,544)  (80,544)  (96,544)  (112,544) (128,544) (144,544)
```

### Ledge Transitions (left-side terrain steps)
```
Row 0: (16,240) (32,240) (48,240) (64,240)
Row 1: (16,256) (32,256) (48,256) (64,256)
Row 2: (16,272) (32,272) (48,272) (64,272)
Row 3: (16,288) (32,288) (48,288) (64,288)
```

### Decorative
| Tile | Src (x,y) | Notes |
|------|-----------|-------|
| Rock formation | `(304,80) (320,80) (336,80) (352,80) (368,80)` | 5-tile horizontal strip |
| Small rock | `(48,128)` | Single decorative |
| Detail | `(160,224)` | Isolated detail |
| Misc deco | `(192,672)` | Small object |

### Background
| Tile | Src (x,y) | Notes |
|------|-----------|-------|
| Void fill | `(208,912)` | Dark background — fill entire Back_Background layer |

### Grass/Path Tiles (used in FP_III)
```
4 cols × 5 rows, two sets:
Set A: (176,16)-(224,80)  — organic path edges
Set B: (256,16)-(304,80)  — more organic path edges
```
Placed side by side to form natural-looking path surfaces.

### Stone Brickwork (used in FP_III)
```
(80,0)(96,0)     ← top pair
(80,16)(96,16)   ← bottom pair
```
Place in 2×2 repeating pattern for brick flooring.

---

## Prefab Patterns (from existing levels)

### "Standard North Wall" (from FP_I, rows 10-15)
5×7 wall block placed as-is. Fill ground `(32,32)` on both sides. The wall top (row 0-1) overlaps with floor tiles on the same row in the Tiles layer.

### "Cave Entrance" (from FP_I, rows 5-7)
```
Left side:  CLIFF_L mid rows → CAVE_BACK 3×3 → Right cliff or edge
Floor below: GROUND fill
```
The cave back tiles form a dark recess. Frame with cliff edges.

### "Water Shore" (from FP_I, rows 12-15)
Ground fill → ledge transition tiles → water rows. Always 4 rows of water minimum.

### "Terrain Step-down" (from FP_I, rows 8-9)  
Edge tiles `(272,256)` + ledge transitions `(16-64,240-288)` + cliff transitions `(320-336,256-272)` create a natural elevation change.

### "Vertical Passage" (from FP_II, cols 0-2 + 7-8)
Columns of alternating tiles `(304,432)(320,432)(336,432)(352,432)` etc. forming tall rock pillars that frame a narrow passage.

---

## Tips
- **Wall blocks are PRE-COMPOSED** — place the full 5×7 (or at least 3×7) block, don't mix rows
- **Ground fill is just `(32,32)` everywhere** — the main repeating tile
- **Edge tiles transition between ground and void/cliff** — they are NOT filler
- **Back_Background layer should be `(208,912)` void** where there's no visible background feature
- **The Tiles layer goes ON TOP** — place floor and structures here
- **IntGrid collision (8px) should match** — 1=blocked, 2=fly_through (water), 0=walkable
