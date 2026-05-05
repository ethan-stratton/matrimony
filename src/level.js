// ══════════════════════════════════
// LOAD LEVEL
// ══════════════════════════════════
let ldtkData = null;
let currentLevelId = null;

async function loadLevel(levelIdentifier) {
  if (!ldtkData) {
    const resp = await fetch('LDtK_Matrimony/Matrimony.ldtk?v=' + Date.now());
    ldtkData = await resp.json();
  }
  const data = ldtkData;
  const level = levelIdentifier
    ? data.levels.find(l => l.identifier === levelIdentifier || l.iid === levelIdentifier)
    : data.levels[0];
  if (!level) { console.warn('Level not found:', levelIdentifier); return; }
  currentLevelId = level.iid;
  state.levelName = level.identifier || level.iid;
  
  // Load tileset image
  const tsDef = data.defs.tilesets[0];
  if (tsDef && tsDef.relPath) {
    tilesetCols = Math.floor(tsDef.pxWid / tsDef.tileGridSize);
    tilesetImg = new Image();
    tilesetImg.onload = () => { tilesetLoaded = true; };
    tilesetImg.src = 'LDtK_Matrimony/' + tsDef.relPath;
  }

  // Collect tile layers in reverse order (LDtk stores top-first, we want background drawn first)
  const tileLayers = [];
  
  for (const layer of level.layerInstances) {
    if (layer.__identifier === 'IntGrid') {
      state.mapW = Math.floor(level.pxWid / TILE);
      state.mapH = Math.floor(level.pxHei / TILE);
      state.collisionScale = 1;
      state.collision = [];
      for (let y = 0; y < layer.__cHei; y++) {
        const row = [];
        for (let x = 0; x < layer.__cWid; x++) {
          row.push(layer.intGridCsv[y * layer.__cWid + x]);
        }
        state.collision.push(row);
      }
    }
    if (layer.__identifier === 'IntGrid_Fine_Collision') {
      const colGridSize = layer.__gridSize || 8;
      state.fineCollisionScale = TILE / colGridSize; // e.g., 2
      state.fineCollision = [];
      for (let y = 0; y < layer.__cHei; y++) {
        const row = [];
        for (let x = 0; x < layer.__cWid; x++) {
          row.push(layer.intGridCsv[y * layer.__cWid + x]);
        }
        state.fineCollision.push(row);
      }
    }
    if (layer.__type === 'Tiles' && layer.gridTiles && layer.gridTiles.length > 0) {
      tileLayers.push(layer.gridTiles);
    }
    if (layer.__identifier === 'Entities') {
      state.entities = [];
      for (const e of layer.entityInstances) {
        const gx = Math.floor(e.px[0] / TILE);
        const gy = Math.floor(e.px[1] / TILE);
        if (e.__identifier === 'Main') {
          state.player.x = gx;
          state.player.y = gy;
        } else {
          state.entities.push({
            type: e.__identifier,
            x: gx, y: gy,
            origX: gx, origY: gy,
            id: `${e.__identifier}_${gx}_${gy}`,
            fields: e.fieldInstances ? Object.fromEntries(e.fieldInstances.map(f => [f.__identifier, f.__value])) : {},
            widthTiles: (e.width || TILE) / TILE,
            heightTiles: (e.height || TILE) / TILE,
          });
        }
      }
    }
  }
  
  // Reverse so background layers draw first
  tileLayers.reverse();
  state.tiles = tileLayers;
  
  // Clear defeated enemies for this level (they respawn on re-entry)
  for (const e of state.entities) {
    if (e.type !== 'Chest' && e.type !== 'GroundItem') {
      delete state.defeatedEnemies[e.id];
      e.deathAnim = null;
    }
  }
  
  updateCamera();
}

// ══════════════════════════════════
// CAMERA
// ══════════════════════════════════
function updateCamera() {
  state.smoothX = state.player.x;
  state.smoothY = state.player.y;
}

function getPlayerVisualPos() {
  if (state.flyTransition) {
    const ft = state.flyTransition;
    const t = Math.min(1, (performance.now() - ft.startTime) / ft.duration);
    const ease = t * t * (3 - 2 * t); // SmoothStep
    if (ft.type === 'takeoff') {
      // Circle outward while rising — like banking up
      const angle = ease * Math.PI * 2; // one full loop
      const radius = Math.sin(ease * Math.PI) * 0.4; // grows then shrinks
      return {
        x: ft.originX + Math.cos(angle) * radius,
        y: ft.originY + Math.sin(angle) * radius * 0.5 - ease * 0.3
      };
    } else {
      // Spiral down to target — tightening circle
      const spiral = (1 - ease) * Math.PI * 2;
      const radius = (1 - ease) * 0.5;
      const cx = ft.originX + (ft.targetX - ft.originX) * ease;
      const cy = ft.originY + (ft.targetY - ft.originY) * ease;
      return {
        x: cx + Math.cos(spiral) * radius,
        y: cy + Math.sin(spiral) * radius * 0.5 - (1 - ease) * 0.3
      };
    }
  }
  if (state.flying) {
    // Gentle bob while flying
    const bob = Math.sin(state.flyBobTimer / 400) * 0.08;
    return { x: state.flyX, y: state.flyY + bob };
  }
  if (!state.moving) return { x: state.player.x, y: state.player.y };
  const stepScale = state.moveStepScale || 1;
  let t = Math.min(1, state.moveTimer / ((state.lockedMoveDuration || getMoveDuration()) * stepScale));
  // Smooth easing on all movement: SmoothStep (3t²-2t³) for buttery interpolation
  // Extra SmoothStart on first run step to prevent visual snap
  if (state.justStartedRunning) {
    t = t * t; // SmoothStart for acceleration feel on walk→run transition only
  }
  // Linear interpolation for chained movement (no decel pulse between steps)
  return {
    x: state.moveFrom.x + (state.player.x - state.moveFrom.x) * t,
    y: state.moveFrom.y + (state.player.y - state.moveFrom.y) * t,
  };
}

function getCameraOffset() {
  const vis = getPlayerVisualPos();
  const viewW = CANVAS_W / (TILE * SCALE); // 20
  const viewH = CANVAS_H / (TILE * SCALE); // 15
  
  let camX, camY;
  
  // If map is smaller than viewport, center it
  if (state.mapW <= viewW) {
    camX = (state.mapW - viewW) / 2; // negative = centered
  } else {
    camX = vis.x - viewW / 2;
    camX = Math.max(0, Math.min(state.mapW - viewW, camX));
  }
  
  if (state.mapH <= viewH) {
    camY = (state.mapH - viewH) / 2;
  } else {
    camY = vis.y - viewH / 2;
    camY = Math.max(0, Math.min(state.mapH - viewH, camY));
  }
  
  return { x: camX, y: camY };
}

