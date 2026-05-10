import json, uuid

with open('Matrimony.ldtk') as f:
    data = json.load(f)

COLS = 26  # tileset columns

def tid(sx, sy):
    return sx // 16 + (sy // 16) * COLS

def tile(px_x, px_y, sx, sy):
    gx, gy = px_x // 16, px_y // 16
    return {"px": [px_x, px_y], "src": [sx, sy], "f": 0, "t": tid(sx, sy), "d": [gy * 25 + gx]}

# Level dimensions: 25 wide, 35 tall (in tiles)
W, H = 25, 35

# === BACK_BACKGROUND: fill with (208,912) ===
bg_tiles = []
for y in range(H):
    for x in range(W):
        bg_tiles.append(tile(x*16, y*16, 208, 912))

# === TILES LAYER: cave room ===
tiles = []

# Room layout map: 0=empty, 'g'=ground, 'w'=wall, 'W'=water, 'r'=raised
# Design:
# Rows 0-3: wall (top)
# Rows 4-6: wall top with cave back tiles
# Row 7-8: transition - ground starts
# Rows 9-26: main room area  
# Rows 27-30: water area
# Rows 31-34: wall (bottom)
# Cols 0-2: wall (left) except cave entrance at rows 14-18
# Cols 22-24: wall (right) or raised platform rows 12-22

layout = [['e'] * W for _ in range(H)]

# Fill ground for the open area (rows 5-26, cols 3-21)
for y in range(5, 27):
    for x in range(3, 22):
        layout[y][x] = 'g'

# Cave entrance on left (rows 14-18, cols 0-2 are ground)
for y in range(14, 19):
    for x in range(0, 3):
        layout[y][x] = 'g'

# Raised platform on right (rows 12-20, cols 19-24)
for y in range(12, 21):
    for x in range(19, 25):
        layout[y][x] = 'r'

# Water at bottom (rows 27-30, cols 3-21)
for y in range(27, 31):
    for x in range(3, 22):
        layout[y][x] = 'W'

# Now generate tiles based on layout
for y in range(H):
    for x in range(W):
        cell = layout[y][x]
        px_x, px_y = x * 16, y * 16
        
        if cell == 'g':
            tiles.append(tile(px_x, px_y, 32, 32))
        elif cell == 'W':
            # Water tiles - use different rows based on position in water block
            wy = y - 27  # 0-3 within water
            water_src_y = 496 + wy * 16
            wx = (x - 3) % 8
            water_src_x = 16 + wx * 16
            tiles.append(tile(px_x, px_y, water_src_x, water_src_y))
        elif cell == 'r':
            # Raised platform tiles
            ry = y - 12  # 0-8 within raised area
            rx = x - 19  # 0-5
            if ry < 5:
                src_y = 352 + ry * 16
                src_x = 176 + min(rx, 3) * 16
                tiles.append(tile(px_x, px_y, src_x, src_y))
            else:
                # Lower part of raised area - just use ground with some variation
                tiles.append(tile(px_x, px_y, 32, 32))
        elif cell == 'e':
            # Wall/empty areas - use rock wall tiles for top, cave back for sides
            # Top wall area (rows 0-4)
            if y < 5 and 3 <= x < 22:
                # Rock wall cluster - use the 5-wide pattern repeating
                wx = x % 5
                tiles.append(tile(px_x, px_y, wx * 16, min(y, 6) * 16))
            elif y >= 31 and 3 <= x < 22:
                # Bottom wall
                wx = x % 5
                wy = y - 31
                tiles.append(tile(px_x, px_y, wx * 16, wy * 16))
            elif x < 3 and not (14 <= y <= 18):
                # Left wall (not cave entrance)
                if y < 5 or y >= 31:
                    wx = x % 5
                    tiles.append(tile(px_x, px_y, wx * 16, 0))
                else:
                    # Left cliff edge
                    cx = min(x, 3)
                    tiles.append(tile(px_x, px_y, 176 + cx * 16, 192))
            elif x >= 22 and not (12 <= y <= 20):
                # Right wall (not raised platform)
                if y < 5 or y >= 31:
                    wx = x % 5
                    tiles.append(tile(px_x, px_y, wx * 16, 0))
                else:
                    tiles.append(tile(px_x, px_y, 272, 256))

# Add cave back tiles around the cave entrance (decorative framing)
# Top of entrance (row 13, cols 0-2)
for x in range(3):
    tiles.append(tile(x*16, 13*16, 352 + x*16, 288))
# Bottom of entrance (row 19, cols 0-2)  
for x in range(3):
    tiles.append(tile(x*16, 19*16, 352 + x*16, 320))

# Decorative details
tiles.append(tile(8*16, 10*16, 192, 672))  # small decoration
tiles.append(tile(15*16, 15*16, 48, 128))   # small rock detail
tiles.append(tile(10*16, 8*16, 160, 224))   # isolated detail

# Decorative rock formation near top
for i, sx in enumerate([304, 320, 336, 352, 368]):
    tiles.append(tile((7+i)*16, 6*16, sx, 80))

# === INTGRID_FINE_COLLISION (50x70, 8px cells) ===
# 2 cells per tile in each direction
collision = [0] * 3500  # 50 * 70

for ty in range(H):
    for tx in range(W):
        cell = layout[ty][tx]
        for dy in range(2):
            for dx in range(2):
                cx = tx * 2 + dx
                cy = ty * 2 + dy
                idx = cy * 50 + cx
                if cell == 'e':
                    collision[idx] = 1
                elif cell == 'W':
                    collision[idx] = 2
                elif cell == 'r':
                    # Raised platform - top 5 rows blocked, bottom walkable
                    if ty - 12 < 5:
                        collision[idx] = 1
                    else:
                        collision[idx] = 0
                else:
                    collision[idx] = 0

# Cave entrance is walkable (rows 14-18, cols 0-2) - already 'g' so 0

# === ENTITIES ===
worldX, worldY = 320, -304

def make_iid():
    return str(uuid.uuid4())

entities = [
    {
        "__identifier": "Main",
        "__grid": [10, 15],
        "__pivot": [0, 0],
        "__tags": [],
        "__tile": None,
        "__smartColor": "#BE4A2F",
        "iid": make_iid(),
        "width": 16,
        "height": 16,
        "defUid": 8,
        "px": [160, 240],
        "fieldInstances": [],
        "__worldX": worldX + 160,
        "__worldY": worldY + 240
    },
    {
        "__identifier": "Enemy",
        "__grid": [7, 20],
        "__pivot": [0, 0],
        "__tags": [],
        "__tile": None,
        "__smartColor": "#D77643",
        "iid": make_iid(),
        "width": 16,
        "height": 16,
        "defUid": 9,
        "px": [112, 320],
        "fieldInstances": [
            {
                "__identifier": "EnemyType",
                "__type": "String",
                "__value": "GlowingWisp",
                "__tile": None,
                "defUid": 50,
                "realEditorValues": [{"id": "V_String", "params": ["GlowingWisp"]}]
            }
        ],
        "__worldX": worldX + 112,
        "__worldY": worldY + 320
    },
    {
        "__identifier": "Enemy",
        "__grid": [14, 10],
        "__pivot": [0, 0],
        "__tags": [],
        "__tile": None,
        "__smartColor": "#D77643",
        "iid": make_iid(),
        "width": 16,
        "height": 16,
        "defUid": 9,
        "px": [224, 160],
        "fieldInstances": [
            {
                "__identifier": "EnemyType",
                "__type": "String",
                "__value": "IceGolem",
                "__tile": None,
                "defUid": 50,
                "realEditorValues": [{"id": "V_String", "params": ["IceGolem"]}]
            }
        ],
        "__worldX": worldX + 224,
        "__worldY": worldY + 160
    }
]

# === Apply to Level_4 ===
for level in data['levels']:
    if level['identifier'] == 'Level_4':
        for li in level['layerInstances']:
            if li['__identifier'] == 'Back_Background':
                li['gridTiles'] = bg_tiles
            elif li['__identifier'] == 'Tiles':
                li['gridTiles'] = tiles
            elif li['__identifier'] == 'IntGrid_Fine_Collision':
                li['intGridCsv'] = collision
            elif li['__identifier'] == 'Entities':
                li['entityInstances'] = entities
        break

with open('Matrimony.ldtk', 'w') as f:
    json.dump(data, f, indent='\t')

print(f"Done! BG tiles: {len(bg_tiles)}, Tiles: {len(tiles)}, Entities: {len(entities)}")
print(f"Collision non-zero: {sum(1 for v in collision if v != 0)}")
