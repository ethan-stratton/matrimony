// ══════════════════════════════════
// GAME STATE
// ══════════════════════════════════
// ══════════════════════════════════
// SAVE SYSTEM
// ══════════════════════════════════
function saveGame(slot) {
  if (state.combat || state.screen !== 'game') return false;
  const data = {
    version: 1,
    levelId: currentLevelId,
    levelName: state.levelName || currentLevelId || 'Unknown',
    playerX: state.player.x,
    playerY: state.player.y,
    facing: state.facing,
    inventory: state.inventory,
    actionOrder: state.actionOrder || null,
    flags: state.flags,
    openedChests: state.openedChests,
    defeatedEnemies: state.defeatedEnemies,
    encounterCounts: state.encounterCounts || {},
    playerHp: 30, // TODO: track persistent HP
    playerExp: state.player.exp || 0,
    playerSteps: state.player.totalSteps || 0,
    itemSteps: state.itemSteps || {},
    rejectedTransforms: state.rejectedTransforms || {},
    isSkeleton: state.isSkeleton || false,
    flying: state.flying || false,
    flyX: state.flying ? state.flyX : null,
    flyY: state.flying ? state.flyY : null,
    canFly: state.canFly || false,
    equipment: state.equipment || [null, null],
    companion: state.companion ? {
      x: state.companion.x,
      y: state.companion.y,
      facing: state.companion.facing,
      opacity: state.companion.opacity,
      phase: state.companion.phase,
      combatHelpUsed: state.companion.combatHelpUsed || false,
    } : null,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem('matrimony_slot_' + slot, JSON.stringify(data));
    return true;
  } catch (e) { console.warn('Save failed:', e); return false; }
}

function loadGame(slot) {
  try {
    const raw = localStorage.getItem('matrimony_slot_' + slot);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { console.warn('Load failed:', e); return null; }
}

function getSaveInfo(slot) {
  const data = loadGame(slot);
  if (!data) return null;
  const location = (data.levelName || data.levelId || 'Unknown').replace(/_/g, ' ');
  return { location };
}

async function applySave(slot) {
  const data = loadGame(slot);
  if (!data) return false;
  // Load the saved level
  await loadLevel(data.levelId || null);
  state.player.x = data.playerX;
  state.player.y = data.playerY;
  state.facing = data.facing || 'down';
  state.inventory = data.inventory || [];
  state.actionOrder = data.actionOrder || null;
  state.flags = data.flags || {};
  state.openedChests = data.openedChests || {};
  state.defeatedEnemies = data.defeatedEnemies || {};
  state.encounterCounts = data.encounterCounts || {};
  state.player.exp = data.playerExp || 0;
  state.player.totalSteps = data.playerSteps || 0;
  state.itemSteps = data.itemSteps || {};
  state.rejectedTransforms = data.rejectedTransforms || {};
  state.isSkeleton = data.isSkeleton || false;
  state.flying = data.flying || false;
  state.canFly = data.canFly !== undefined ? data.canFly : false;
  state.equipment = data.equipment || [null, null];
  if (data.companion) {
    state.companion = {
      ...data.companion,
      aiMoving: false,
      moveStart: 0,
      prevX: data.companion.x,
      prevY: data.companion.y,
      fadeStart: data.companion.phase === 'fadeout' ? performance.now() : 0,
      _lastParticleTime: 0,
    };
  } else {
    state.companion = null;
  }
  if (state.flying && data.flyX != null) {
    state.flyX = data.flyX;
    state.flyY = data.flyY;
    state.flyVx = 0;
    state.flyVy = 0;
  }
  state.smoothX = state.player.x;
  state.smoothY = state.player.y;
  state.footsteps = [];
  state.burnParticles = [];
  state.fishParticles = [];
  state.fishSpawnTimer = 0;
  updateCamera();
  // Pre-populate fish so they appear to have been swimming already
  prepopulateFish();
  return true;
}

const state = {
  screen: 'splash', // 'splash' | 'title' | 'game'
  titleSelection: 0, // 0=Slot 1, 1=Slot 2, 2=Slot 3
  titleDeleteMode: false, // delete save mode
  titleDeleteConfirm: false, // confirmation prompt active
  player: { x: 0, y: 0 },  // grid coords (destination)
  entities: [],
  collision: [],  // 2D array: 0=walk, 1=wall
  collisionScale: 1, // how many collision cells per movement tile (e.g., 2 for 8px grid on 16px tiles)
  fineCollision: null, // optional fine collision grid (8×8)
  fineCollisionScale: 2,
  mapW: 0, mapH: 0,
  tiles: [],      // from LDtk tile layers (all of them, in draw order)
  facing: 'down',
  moving: false,
  moveTimer: 0,
  moveFrom: { x: 0, y: 0 },
  dialogue: null,
  flags: {},
  canFly: false, // Set via event flag
  flying: false,
  flyX: 0,
  flyY: 0,
  flyVx: 0, // velocity
  flyVy: 0,
  flyBobTimer: 0,
  flyTransition: null, // { type: 'takeoff'|'landing', startTime, duration, originX, originY, targetX, targetY }
  saveMenu: null,
  showFontTest: false,
  showHitboxes: false,
  fontTestScroll: 0,
  fontTestScrollX: 0,
  fontTestDragging: false,
  fontTestDragStartY: 0,
  fontTestDragStartScroll: 0,
  fontTestContentH: 600,
  defeatedEnemies: {},
  openedChests: {},
  chestInteraction: null,
  inventory: [],
  footsteps: [], // { x, y, time, dir } — fading footprint trail
  burnParticles: [],
  equipment: [null, null], // 2 equipment slots (transformations fill both) // { x, y, vx, vy, life, size } — fire elemental particles
  wasWalking: false,
  justStartedRunning: false,
  currentMoveDuration: 230, // smoothed move duration for momentum transitions
  // Smooth camera position (in tile coords, fractional)
  smoothX: 0,
  smoothY: 0,
  // Combat
  combat: null, // { enemy, enemyHp, enemyMaxHp, enemyEff, enemyDef, enemyWait, playerHp, playerMaxHp, playerEff, playerDef, playerWait, attackText }
  combatTransition: null, // { type: 'in'|'out', startTime, duration }
  companion: null, // { x, y, facing, opacity, phase, combatHelpUsed, fadeStart }
};

