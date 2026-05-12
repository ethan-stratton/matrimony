// ══════════════════════════════════
// TILESET (fallback colors until real art)
// ══════════════════════════════════
let tilesetImg = null;
let tilesetLoaded = false;
let tilesetCols = 0;

// Color fallback for IntGrid values
const INTGRID_COLORS = {
  0: '#2a2820', // walkable floor
  1: '#4a4540', // wall
};

// ══════════════════════════════════
// SPRITES (DeepDive 16x16, 4-frame strips)
// ══════════════════════════════════
const SPRITE_FRAME_SIZE = 16;
const SPRITE_FRAMES = 4;
const ANIM_SPEED = 200; // ms per frame

const sprites = {};
function loadSprite(name, src) {
  const img = new Image();
  img.src = src;
  sprites[name] = { img, loaded: false };
  img.onload = () => { sprites[name].loaded = true; };
}

// Player sprite (Snoblin prototype character)
// 128x384 sheet, 32x32 frames, 4 cols × 12 rows
// Row 0: Idle down (2f)
// Row 1: Idle right (2f)
// Row 2: Idle up (2f)
// Row 3: Walk down (4f)
// Row 4: Walk right (4f)
// Row 5: Walk up (4f)
// Row 6: ignore
// Row 7: Hurt (2f)
// Row 8: ignore
// Row 9: Death down (3f)
// Row 10: Death right (3f)
// Row 11: Death left (3f)
const PLAYER_SHEET = {
  img: null, loaded: false,
  frameW: 32, frameH: 32, cols: 4,
  anims: {
    idle_down:  { row: 0, frames: 2 },
    idle_right: { row: 1, frames: 2 },
    idle_up:    { row: 2, frames: 2 },
    walk_down:  { row: 3, frames: 4 },
    walk_right: { row: 4, frames: 4 },
    walk_up:    { row: 5, frames: 4 },
    hurt:       { row: 7, frames: 2 },
    hurt_down:  { row: 7, frames: 2 },
    hurt_right: { row: 8, frames: 2 },
    hurt_up:    { row: 9, frames: 2 },
    death_down: { row: 10, frames: 3 },
    death_right:{ row: 11, frames: 3 },
  }
};
{
  const img = new Image();
  img.src = 'assets/characters/player/prototype_character.png';
  img.onload = () => { PLAYER_SHEET.loaded = true; };
  PLAYER_SHEET.img = img;
}

// Skeleton sprite (same layout as prototype character)
const SKELETON_SHEET = {
  img: null, loaded: false,
  frameW: 32, frameH: 32, cols: 4,
  anims: {
    idle_down:  { row: 0, frames: 2 },
    idle_right: { row: 1, frames: 2 },
    idle_up:    { row: 2, frames: 2 },
    walk_down:  { row: 3, frames: 4 },
    walk_right: { row: 4, frames: 4 },
    walk_up:    { row: 5, frames: 4 },
    hurt:       { row: 7, frames: 2 },
    hurt_down:  { row: 7, frames: 2 },
    hurt_right: { row: 8, frames: 2 },
    hurt_up:    { row: 9, frames: 2 },
    death_down: { row: 10, frames: 3 },
    death_right:{ row: 11, frames: 3 },
  },
};
{
  const img = new Image();
  img.src = 'assets/characters/skeleton/skeleton.png';
  img.onload = () => { SKELETON_SHEET.loaded = true; };
  SKELETON_SHEET.img = img;
}

function getPlayerSheet() {
  return (state.isSkeleton && SKELETON_SHEET.loaded) ? SKELETON_SHEET : PLAYER_SHEET;
}

// Enemy sprites — loaded dynamically from ENEMY_DATA after loadGameData() completes.
// Called from main.js init, NOT at parse time, because ENEMY_DATA isn't populated yet.
function loadEnemySprites() {
  if (typeof ENEMY_DATA === 'undefined') return;
  for (const [key, entry] of Object.entries(ENEMY_DATA)) {
    if (entry.spriteFile) loadSprite(key, entry.spriteFile);
  }
}

// Ground item sprites
const GROUND_ITEM_SPRITES = {};
const GROUND_ITEM_MAP = {
  'Shortbow': 'assets/items/shortbow.png',
  'Rusty Shortsword': 'assets/items/rusty_shortsword.png',
  'Buckler': 'assets/items/buckler.png',
  'Thunder': 'assets/items/thunder_scroll.png',
  'Heal': 'assets/items/heal_scroll.png',
  'Copy': 'assets/items/copy_mirror.png',
  'Severed Wing': 'assets/items/severed_wing.png',
};
for (const [name, src] of Object.entries(GROUND_ITEM_MAP)) {
  const img = new Image();
  img.src = src;
  GROUND_ITEM_SPRITES[name] = { img, loaded: false };
  img.onload = () => { GROUND_ITEM_SPRITES[name].loaded = true; };
}

