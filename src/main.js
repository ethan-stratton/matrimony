// ══════════════════════════════════
// GHOST COMPANION AI
// ══════════════════════════════════
function updateCompanion(time) {
  const c = state.companion;
  if (!c) return;

  const now = performance.now();
  const elapsed = now - c.fadeStart;

  // Fade logic
  if (c.phase === 'fadein') {
    c.opacity = Math.min(0.6, (elapsed / 2000) * 0.6);
    if (elapsed >= 2000) { c.phase = 'follow'; c.opacity = 0.6; }
  } else if (c.phase === 'fadeout') {
    c.opacity = Math.max(0, 0.6 * (1 - elapsed / 2000));
    if (elapsed >= 2000) { state.companion = null; return; }
    // Don't follow during fadeout
  }

  // Movement (follow phase only) — grid-based like player
  if (c.phase === 'follow') {
    // If currently mid-move, wait for it to finish
    if (c.aiMoving) {
      if (now - c.moveStart >= MOVE_DURATION) {
        c.aiMoving = false;
      }
    }
    
    if (!c.aiMoving) {
      const dx = state.player.x - c.x;
      const dy = state.player.y - c.y;
      const dist = Math.abs(dx) + Math.abs(dy);
      
      if (dist > 2.5) {
        // Pick direction that reduces distance most
        let bestDir = null, bestDist = Infinity;
        const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
        for (const d of dirs) {
          const nx = c.x + d.dx, ny = c.y + d.dy;
          if (nx < 0 || ny < 0 || nx >= state.mapW || ny >= state.mapH) continue;
          const nd = Math.abs(state.player.x - nx) + Math.abs(state.player.y - ny);
          if (nd < bestDist) { bestDist = nd; bestDir = d; }
        }
        if (bestDir) {
          c.prevX = c.x; c.prevY = c.y;
          c.x += bestDir.dx; c.y += bestDir.dy;
          c.moveStart = now;
          c.aiMoving = true;
          if (bestDir.dx < 0) c.facing = 'left';
          else if (bestDir.dx > 0) c.facing = 'right';
          else if (bestDir.dy < 0) c.facing = 'up';
          else c.facing = 'down';
        }
      } else {
        // Face same direction as player when idle
        c.facing = state.facing;
      }
    }
  }

  // Ghost particles
  if (c.opacity > 0) {
    if (!c._lastParticleTime) c._lastParticleTime = 0;
    if (now - c._lastParticleTime > 500) {
      c._lastParticleTime = now;
      state.burnParticles.push({
        x: c.x + 0.3 + Math.random() * 0.4,
        y: c.y + 0.2 + Math.random() * 0.3,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -Math.random() * 0.15 - 0.05,
        life: 1.2, initialLife: 1.2,
        size: 1 + Math.random() * 0.5, ghost: true,
      });
    }
  }
}

// ══════════════════════════════════
// ENEMY AI — Patrol + Chase
// ══════════════════════════════════
// ══════════════════════════════════
// FISH STREAM
// ══════════════════════════════════
function prepopulateFish() {
  if (!state.fishParticles) state.fishParticles = [];
  const streams = state.entities.filter(e => e.type === 'Stream');
  for (const s of streams) {
    const sw = s.widthTiles || 1;
    const sh = s.heightTiles || 1;
    // Scatter ~30 fish throughout the stream at various Y positions
    for (let i = 0; i < 30; i++) {
      const spawnX = s.x + 0.5 + Math.random() * (sw - 1);
      const spawnY = s.y + Math.random() * sh;
      const speed = 2.0 + Math.random() * 1.5;
      const drift = (Math.random() - 0.5) * 0.4;
      const fishSize = 1.5 + Math.random() * 2.5;
      const totalLife = (sh + 4) / speed;
      // Set life as if they've been swimming for a while (partial life remaining)
      const elapsed = (spawnY - s.y) / speed;
      state.fishParticles.push({
        x: spawnX, y: spawnY,
        vx: drift, vy: speed,
        life: totalLife - elapsed,
        initialLife: totalLife,
        size: fishSize,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 1.5 + Math.random() * 2,
        wobbleAmp: 0.15 + Math.random() * 0.2,
        streamX: s.x, streamW: sw, streamBottom: s.y + sh,
        shade: 0.08 + Math.random() * 0.12,
        finPhase: Math.random() * Math.PI * 2,
        finSpeed: 4 + Math.random() * 3,
        glint: Math.random() < 0.3,
        big: fishSize > 3,
      });
    }
  }
}

function updateFishStream(time) {
  if (state.combat || state.dialogue) return;
  if (!state.fishParticles) state.fishParticles = [];
  
  const streams = state.entities.filter(e => e.type === 'Stream');
  if (streams.length === 0) { state.fishParticles.length = 0; return; }
  
  if (!state.fishSpawnTimer) state.fishSpawnTimer = time;
  if (time - state.fishSpawnTimer > 180) {
    state.fishSpawnTimer = time;
    for (const s of streams) {
      const sw = s.widthTiles || 1;
      const sh = s.heightTiles || 1;
      // Spawn at top of stream entity
      const spawnX = s.x + 0.5 + Math.random() * (sw - 1);
      const spawnY = s.y - 1;
      const speed = 2.0 + Math.random() * 1.5;
      // Mostly downward with gentle drift
      const drift = (Math.random() - 0.5) * 0.4;
      const fishSize = 1.5 + Math.random() * 2.5; // varying sizes — some big, some small
      state.fishParticles.push({
        x: spawnX, y: spawnY,
        vx: drift,
        vy: speed,
        life: (sh + 4) / speed,
        initialLife: (sh + 4) / speed,
        size: fishSize,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 1.5 + Math.random() * 2,
        wobbleAmp: 0.15 + Math.random() * 0.2,
        streamX: s.x, streamW: sw, streamBottom: s.y + sh,
        // Visual variation
        shade: 0.08 + Math.random() * 0.12, // how dark (0.08-0.20 alpha range)
        finPhase: Math.random() * Math.PI * 2,
        finSpeed: 4 + Math.random() * 3,
        glint: Math.random() < 0.3, // 30% chance of eye glint
        big: fishSize > 3, // big fish have more detail
      });
    }
  }
  
  const fdt = frameDt || 0.016;
  for (let i = state.fishParticles.length - 1; i >= 0; i--) {
    const f = state.fishParticles[i];
    f.life -= fdt;
    if (f.life <= 0 || f.y > f.streamBottom + 2) { state.fishParticles.splice(i, 1); continue; }
    f.wobble += f.wobbleSpeed * fdt;
    f.finPhase += f.finSpeed * fdt;
    f.x += f.vx * fdt + Math.sin(f.wobble) * f.wobbleAmp * fdt;
    f.y += f.vy * fdt;
    // Arc back into stream if drifted outside
    const streamLeft = f.streamX;
    const streamRight = f.streamX + f.streamW;
    if (f.x < streamLeft) f.vx += 0.8 * fdt;
    else if (f.x > streamRight) f.vx -= 0.8 * fdt;
    // Dampen horizontal drift gently
    f.vx *= (1 - 0.3 * fdt);
  }
  
  // Push player if flying — stream current mechanics (not during menus)
  if (state.flying && streams.length > 0 && !state.inventoryOpen && !state.saveMenu && !state.dialogue) {
    for (const s of streams) {
      const sw = s.widthTiles || 1;
      const sh = s.heightTiles || 1;
      const px = state.flyX;
      const py = state.flyY;
      // Only push when player is actually inside the stream bounds
      if (px >= s.x && px < s.x + sw && py >= s.y && py < s.y + sh) {
        // Stream direction: default 'down', can be set per entity in LDtk
        const dir = (s.fields && s.fields.Direction) || 'down';
        // Proximity to center on the axis perpendicular to flow
        let proximity = 1;
        if (dir === 'down' || dir === 'up') {
          const centerX = s.x + sw / 2;
          const dx = px - centerX;
          proximity = 1 - Math.min(1, Math.abs(dx) / (sw / 2));
        } else {
          const centerY = s.y + sh / 2;
          const dy = py - centerY;
          proximity = 1 - Math.min(1, Math.abs(dy) / (sh / 2));
        }
        
        // Flow direction vectors
        const flowX = dir === 'right' ? 1 : dir === 'left' ? -1 : 0;
        const flowY = dir === 'down' ? 1 : dir === 'up' ? -1 : 0;
        // Perpendicular push-out direction (away from center)
        let perpX = 0, perpY = 0;
        if (dir === 'down' || dir === 'up') {
          const centerX = s.x + sw / 2;
          perpX = px >= centerX ? 1 : -1;
        } else {
          const centerY = s.y + sh / 2;
          perpY = py >= centerY ? 1 : -1;
        }
        
        const pressing = state.flyKeys && (state.flyKeys.up || state.flyKeys.down || state.flyKeys.left || state.flyKeys.right);
        
        if (pressing) {
          // Gentle downstream current
          state.flyVx += flowX * proximity * 0.0006;
          state.flyVy += flowY * proximity * 0.0006;
          // Dampen movement against the current
          if (state.flyKeys && ((dir === 'down' && state.flyKeys.up) || (dir === 'up' && state.flyKeys.down))) {
            if (state.flyVy * flowY < 0) state.flyVy *= 0.985;
          }
          if (state.flyKeys && ((dir === 'right' && state.flyKeys.left) || (dir === 'left' && state.flyKeys.right))) {
            if (state.flyVx * flowX < 0) state.flyVx *= 0.985;
          }
        } else {
          // Not pressing — current pushes downstream and out to nearest edge
          state.flyVx += flowX * proximity * 0.0015;
          state.flyVy += flowY * proximity * 0.0015;
          state.flyVx += perpX * 0.001 * proximity;
          state.flyVy += perpY * 0.001 * proximity;
        }
      }
    }
  }
}


// ── Data-driven enemy particle spawning ──
function spawnEnemyIdleParticles(e, time) {
  const cfg = ENEMY_DATA[e.type]?.particles?.idle;
  if (!cfg || !cfg.type) return;
  if (!e._lastIdleParticleTime) e._lastIdleParticleTime = time;
  if (time - e._lastIdleParticleTime <= cfg.interval) return;
  e._lastIdleParticleTime = time;
  if (cfg.type === 'ember') {
    state.burnParticles.push({ x: e.x + Math.random(), y: e.y + Math.random()*0.3, vx: 0.2+Math.random()*0.3, vy: -Math.random()*0.2-0.05, life: 2.0, initialLife: 2.0, size: 1, ember: true });
  } else if (cfg.type === 'ice') {
    state.burnParticles.push({ x: e.x + Math.random(), y: e.y + Math.random()*0.3, vx: (Math.random()-0.5)*0.15, vy: Math.random()*0.2+0.05, life: 1.8, initialLife: 1.8, size: 1, ice: true });
  } else if (cfg.type === 'wisp') {
    // Soft glowing orbs that float upward and fade — ethereal aura
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.2 + Math.random() * 0.3;
    state.burnParticles.push({ x: e.x + 0.5 + Math.cos(angle)*dist, y: e.y + 0.3 + Math.sin(angle)*dist, vx: (Math.random()-0.5)*0.1, vy: -Math.random()*0.15-0.05, life: 1.2, initialLife: 1.2, size: 1+Math.random(), wisp: true });
  }
}

function spawnEnemyBreathParticles(e, time) {
  const cfg = ENEMY_DATA[e.type]?.particles?.breath;
  if (!cfg || !cfg.type) return;
  if (!e._lastBreathTime) e._lastBreathTime = time;
  if (time - e._lastBreathTime <= cfg.interval + Math.random() * 1500) return;
  e._lastBreathTime = time;
  if (cfg.type === 'steam') {
    for (let bp = 0; bp < cfg.count; bp++) {
      const bx = e.facing === 'left' ? -0.15 : e.facing === 'right' ? 1.15 : 0.5;
      const by = 0.15 + bp * 0.05;
      state.burnParticles.push({ x: e.x + bx + (Math.random()-0.5)*0.1, y: e.y + by, vx: (e.facing === 'left' ? -0.3 : e.facing === 'right' ? 0.3 : (Math.random()-0.5)*0.2), vy: -Math.random()*0.2-0.1, life: 1.0 + Math.random()*0.5, initialLife: 1.5, size: 1, steam: true });
    }
  }
}

function spawnEnemyMoveParticles(e) {
  const cfg = ENEMY_DATA[e.type]?.particles?.move;
  if (!cfg || !cfg.type) return;
  const side = e.footsteps ? e.footsteps.length % 2 : 0;
  if (cfg.type === 'fire_burst') {
    // Active foot fire burst
    const footX = side === 0 ? 0.25 : 0.75;
    const footY = side === 0 ? 0.7 : 0.8;
    state.burnParticles.push({ x: e.x + footX, y: e.y + footY, vx: (Math.random()-0.5)*0.2, vy: -Math.random()*0.4-0.2, life: 1.5, initialLife: 1.5, size: 2+Math.random()*2 });
    // Big random fire chunks
    state.burnParticles.push({ x: e.x + Math.random(), y: e.y + 0.5 + Math.random()*0.3, vx: (Math.random()-0.5)*0.5, vy: -Math.random()*0.6-0.3, life: 2.0, initialLife: 2.0, size: 1 });
    // Embers floating with wind
    for (let bp = 0; bp < 1; bp++) {
      state.burnParticles.push({ x: e.x + Math.random(), y: e.y + Math.random()*0.5, vx: 0.3+Math.random()*0.4, vy: -Math.random()*0.3-0.1, life: 2.5, initialLife: 2.5, size: 1+Math.random()*1.5, ember: true });
    }
  } else if (cfg.type === 'ice_puff') {
    // Active foot snow puff
    const footX = side === 0 ? 0.25 : 0.65;
    state.burnParticles.push({ x: e.x + footX, y: e.y + 0.6 + Math.random()*0.2, vx: (Math.random()-0.5)*0.3, vy: Math.random()*0.15+0.05, life: 1.2, initialLife: 1.2, size: 1+Math.random(), ice: true });
    // Snow flakes drifting off body
    for (let bp = 0; bp < 2; bp++) {
      state.burnParticles.push({ x: e.x + Math.random(), y: e.y + Math.random()*0.5, vx: (Math.random()-0.5)*0.2, vy: Math.random()*0.3+0.1, life: 1.8, initialLife: 1.8, size: 1, ice: true });
    }
  } else if (cfg.type === 'wisp_trail') {
    // Lingering afterimage glow left behind — stays in place and fades
    for (let bp = 0; bp < (cfg.count || 2); bp++) {
      state.burnParticles.push({ x: e.prevX + 0.3 + Math.random()*0.4, y: e.prevY + 0.2 + Math.random()*0.4, vx: (Math.random()-0.5)*0.05, vy: -Math.random()*0.08, life: 1.5, initialLife: 1.5, size: 1.5+Math.random(), wisp: true });
    }
  }
}

function updateEnemyAI(time) {
  if (state.transitioning || state.dialogue || state.combat || state.chestInteraction ||
      state.combatTransition || state.inventoryOpen || state.saveMenu || state.weaponTransformPrompt || state.deathOverworld) return;

  for (const e of state.entities) {
    if (e.type === 'Chest' || e.type === 'Stream' || e.type === 'GroundItem') continue;
    if (state.defeatedEnemies[e.id] || e.deathAnim) continue;

    // Initialize AI state
    if (e.aiTimer === undefined) {
      e.aiTimer = 0;
      e.aiInterval = 1500 + Math.random() * 1500;
      e.aiMoving = false;
      e.prevX = e.x;
      e.prevY = e.y;
      e.moveStart = 0;
    }

    // Handle smooth movement interpolation
    if (e.aiMoving) {
      if (time - e.moveStart >= MOVE_DURATION) {
        e.aiMoving = false;
      }
      continue; // Don't pick new move while animating
    }

    e.aiTimer += (time - (e._lastAITime || time));
    e._lastAITime = time;

    // Data-driven idle particles
    if (!e.aiMoving) {
      spawnEnemyIdleParticles(e, time);
    }
    // Data-driven breath particles
    spawnEnemyBreathParticles(e, time);

    const px = state.player.x;
    const py = state.player.y;
    const dist = Math.abs(e.x - px) + Math.abs(e.y - py);

    // Directional awareness cone: 5 tiles forward, 3 sides, 2 behind
    const dx = px - e.x;
    const dy = py - e.y;
    let forwardDist = 0, sideDist = 0;
    switch (e.facing || 'down') {
      case 'right': forwardDist = dx; sideDist = Math.abs(dy); break;
      case 'left':  forwardDist = -dx; sideDist = Math.abs(dy); break;
      case 'down':  forwardDist = dy; sideDist = Math.abs(dx); break;
      case 'up':    forwardDist = -dy; sideDist = Math.abs(dx); break;
    }
    // Forward cone: 5 tiles ahead (within 3 tiles wide), sides: 4 tiles, behind: 2 tiles
    const inRange = (forwardDist >= 0 && forwardDist <= 5 && sideDist <= 3) ||
                    (forwardDist < 0 && Math.abs(forwardDist) <= 2 && sideDist <= 1) ||
                    (dist <= 4 && sideDist <= 3);
    // Aggro memory: stay aware for 3 seconds after losing sight
    if (inRange) {
      e.lastSeenTime = time;
      if (!e.aggroed) {
        e.aggroed = true;
        e.alertBark = { text: '!', startTime: time, duration: 800 };
        e.alertHop = { startTime: time, duration: 400 };
        // Face the player on alert
        const fdx = px - e.x;
        const fdy = py - e.y;
        if (Math.abs(fdx) >= Math.abs(fdy)) {
          e.facing = fdx < 0 ? 'left' : 'right';
        } else {
          e.facing = fdy < 0 ? 'up' : 'down';
        }
        // Reset move timer so they pause briefly before chasing
        e.aiTimer = 0;
      }
    } else if (e.aggroed && time - (e.lastSeenTime || 0) > 3000) {
      e.aggroed = false;
    }
    const chasing = e.aggroed;
    const chaseSpeed = ENEMY_DATA[e.type]?.chaseInterval || 550;
    const interval = chasing ? chaseSpeed : e.aiInterval;

    if (e.aiTimer < interval) continue;
    e.aiTimer = 0;
    e.aiInterval = 1500 + Math.random() * 1500; // New random interval for next patrol step

    // Check if already adjacent to player - trigger combat (AABB: within 1 tile)
    if (chasing && dist <= 1.5 && Math.abs(e.x - px) < 2 && Math.abs(e.y - py) < 2) {
      const fdx = px - e.x;
      const fdy = py - e.y;
      if (fdx < 0) e.facing = 'left';
      else if (fdx > 0) e.facing = 'right';
      else if (fdy < 0) e.facing = 'up';
      else if (fdy > 0) e.facing = 'down';
      handleEntityContact(e);
      return;
    }

    // Pick target tile
    const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
    let bestDir = null;
    const patrolRange = (ENEMY_DATA[e.type] && ENEMY_DATA[e.type].patrolRange) || 3;

    if (chasing) {
      // Greedy chase: pick direction that minimizes distance to player
      let bestDist = Infinity;
      const shuffled = dirs.slice().sort(() => Math.random() - 0.5);
      for (const d of shuffled) {
        const nx = e.x + d.dx;
        const ny = e.y + d.dy;
        if (!canEntityMoveTo(e, nx, ny)) continue;
        const nd = Math.abs(nx - px) + Math.abs(ny - py);
        if (nd < bestDist) {
          bestDist = nd;
          bestDir = d;
        }
      }
    } else if (Math.abs(e.x - e.origX) > patrolRange || Math.abs(e.y - e.origY) > patrolRange) {
      // Return to patrol zone — greedy walk toward spawn
      let bestDist = Infinity;
      for (const d of dirs) {
        const nx = e.x + d.dx;
        const ny = e.y + d.dy;
        if (!canEntityMoveTo(e, nx, ny)) continue;
        const nd = Math.abs(nx - e.origX) + Math.abs(ny - e.origY);
        if (nd < bestDist) {
          bestDist = nd;
          bestDir = d;
        }
      }
    } else {
      // Random patrol within patrolRange tiles of spawn
      const shuffled = dirs.slice().sort(() => Math.random() - 0.5);
      for (const d of shuffled) {
        const nx = e.x + d.dx;
        const ny = e.y + d.dy;
        if (Math.abs(nx - e.origX) > patrolRange || Math.abs(ny - e.origY) > patrolRange) continue;
        if (!canEntityMoveTo(e, nx, ny)) continue;
        bestDir = d;
        break;
      }
    }

    if (bestDir) {
      e.prevX = e.x;
      e.prevY = e.y;
      // Leave footprint at old position
      if (!e.footsteps) e.footsteps = [];
      e.footsteps.push({ x: e.prevX, y: e.prevY, time: time, side: e.footsteps.length % 2 });
      if (e.footsteps.length > 8) e.footsteps.shift();
      // Data-driven move particles
      spawnEnemyMoveParticles(e);
      e.x += bestDir.dx;
      e.y += bestDir.dy;
      e.aiMoving = true;
      e.moveStart = time;
      if (bestDir.dx < 0) e.facing = 'left';
      else if (bestDir.dx > 0) e.facing = 'right';
      else if (bestDir.dy < 0) e.facing = 'up';
      else if (bestDir.dy > 0) e.facing = 'down';
    }
  }
}

function canEntityMoveTo(entity, nx, ny) {
  // Flying enemies bypass fly-through collision (same as player flying)
  const isFlying = ENEMY_DATA[entity.type]?.flying;
  if (isTileBlocked(nx, ny, !!isFlying)) return false;
  // Check other entities
  for (const other of state.entities) {
    if (other === entity) continue;
    if (state.defeatedEnemies[other.id] || other.deathAnim) continue;
    if (other.x === nx && other.y === ny) return false;
  }
  // Check player position
  if (nx === state.player.x && ny === state.player.y) return false; // Don't allow moving onto player tile
  return true;
}


// ══════════════════════════════════
// GAME LOOP
// ══════════════════════════════════
let lastTime = 0;

function gameLoop(time) {
  try {
  // Cache buster: v2.45
  if (!window._v240) { window._v240 = true; const _ver = 'v2.50'; console.warn('=== MATRIMONY ' + _ver + ' LOADED ==='); const _vl = document.getElementById('version-label'); if (_vl) _vl.textContent = _ver; }
  // Splash screen
  if (state.screen === 'splash') {
    if (windNode) windNode.gain.gain.value = 0;
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, W, H);
    const alpha = 0.4 + 0.3 * Math.sin(time / 600);
    ctx.globalAlpha = alpha;
    ctx.font = '32px "' + CRISP_FONT_ALT + '"';
    const tw = ctx.measureText('Press any key').width;
    crispText('Press any key', Math.round((W - tw) / 2), Math.round(H * 0.48), 32, '#a0a0c0', 0, CRISP_FONT_ALT);
    ctx.globalAlpha = 1;
    requestAnimationFrame(gameLoop);
    return;
  }
  // Title screen
  if (state.screen === 'title') {
    // Mute wind on title
    if (windNode) windNode.gain.gain.value = 0;
    drawTitle();
    // If transitioning to game, draw game on top with increasing alpha
    if (state.titleToGame) {
      const elapsed = performance.now() - state.titleToGame.startTime;
      const progress = Math.min(1, elapsed / state.titleToGame.duration);
      // Ease in (SmoothStart)
      const alpha = progress * progress;
      // Render entire game scene to offscreen canvas, then composite as single image
      // This prevents layer seams and ensures everything appears at uniform alpha
      if (!state.titleToGame._offscreen) {
        state.titleToGame._offscreen = document.createElement('canvas');
        state.titleToGame._offCtx = state.titleToGame._offscreen.getContext('2d');
      }
      const osc = state.titleToGame._offscreen;
      const osctx = state.titleToGame._offCtx;
      if (osc.width !== canvas.width || osc.height !== canvas.height) {
        osc.width = canvas.width; osc.height = canvas.height;
      }
      osctx.clearRect(0, 0, osc.width, osc.height);
      // Temporarily swap ctx to draw everything to offscreen
      const realCtx = ctx;
      ctx = osctx;
      draw();
      if (state.inventoryOpen && !state.combat) drawInventory();
      if (state.combat) drawCombat();
      // Overworld death overlay
      if (state.overWorldDeath) {
        const ds = state.overWorldDeath;
        const W = canvas.width, H = canvas.height;
        if (ds.phase === 'black') {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, W, H);
        } else if (ds.phase === 'dots') {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, W, H);
          const text = ds.dots[ds.dotIndex] || '.  .  .';
          crispText(text, W / 2, H / 2, 36, '#888', 0.5, CRISP_FONT_ALT);
        } else if (ds.phase === 'wake') {
          const t = Math.min(1, (performance.now() - ds.wakeStart) / 1500);
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, W, H);
          ctx.save();
          ctx.globalAlpha = t;
          if (SKELETON_SHEET.loaded) {
            const anim = PLAYER_SHEET.anims['idle_down'];
            const sz = 96;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(SKELETON_SHEET.img, 0, anim.row * 32, 32, 32,
              W / 2 - sz / 2, H / 2 - sz / 2 - 20, sz, sz);
          }
          if (t > 0.5) {
            ctx.globalAlpha = (t - 0.5) * 2;
            crispText('You are still here.', W / 2, H / 2 + 50, 28, '#a0a0a0', 0.5, CRISP_FONT_ALT);
            if (t >= 1) crispText('[ Z ]', W / 2, H / 2 + 85, 22, '#666', 0.5, CRISP_FONT_ALT);
          }
          ctx.restore();
        }
      }
      if (state.dialogue) drawDialogue();
      if (state.chestInteraction) drawChestInteraction();
      // Swap ctx back and composite offscreen at uniform alpha
      ctx = realCtx;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(osc, 0, 0);
      ctx.restore();
    }
    requestAnimationFrame(gameLoop);
    return;
  }
  // Fade wind in/out based on combat
  if (windNode) {
    const target = state.combat ? 0 : 0.06;
    const cur = windNode.gain.gain.value;
    windNode.gain.gain.value += (target - cur) * 0.05;
  }
  if (!state.combat) {
    // Check death animations completion
    for (const e of state.entities) {
      if (e.deathAnim && performance.now() - e.deathAnim.startTime >= 2000) {
        state.defeatedEnemies[e.id] = true;
        e.deathAnim = null;
      }
    }
    handleMovement(time);
    updateEnemyAI(time);
    updateCompanion(time);
    updateFishStream(time);
  }
  // Death overworld sequence
  if (state.deathOverworld) {
    const ds = state.deathOverworld;
    const now = performance.now();
    if (ds.phase === 'overworld') {
      if (now - ds.startTime >= 2500) {
        ds.phase = 'black';
        ds.startTime = now;
      }
    }
    if (ds.phase === 'black') {
      if (now - ds.startTime >= 800) {
        ds.phase = 'dots';
        ds.dotIndex = 0;
      }
    }
    if (ds.phase === 'wake') {
      // Just wait for Z press
    }
  }
  // Update combat wait countdowns + animations
  if (state.combat) {
    const c = state.combat;
    
    // Death sequence — freeze combat, run cinematic
    if (c.playerDied) {
      if (!c.deathSequence) {
        c.deathSequence = {
          phase: 'combat_death',
          startTime: performance.now(),
          dots: ['.  .  .', '.  .  .  .  .  .', '.  .  .  .  .  .  .  .  .'],
          dotIndex: -1,
          enemyType: c.enemy?.type,
          enemyId: c.enemy?.id,
        };
        c.phase = 'dead';
        c.waiting = false;
        c.enemyWaiting = false;
      }
      const ds = c.deathSequence;
      const now = performance.now();
      const elapsed = now - ds.startTime;

      if (ds.phase === 'combat_death') {
        // Fade battle music
        const fadeT = Math.min(1, elapsed / 1200);
        battleMusic.volume = Math.max(0, 0.30 * (1 - fadeT));
        if (elapsed >= 1200) {
          ds.phase = 'combat_fade';
          ds.startTime = now;
        }
      }
      if (ds.phase === 'combat_fade') {
        if (now - ds.startTime >= 800) {
          battleMusic.pause();
          battleMusic.currentTime = 0;
          battleMusic.volume = 0.30;
          // Transfer to overworld
          state.flying = false;
          state.flyTransition = null;
          state.flyVx = 0;
          state.flyVy = 0;
          state.moving = false;
          state.smoothX = state.player.x;
          state.smoothY = state.player.y;
          state.deathOverworld = {
            phase: 'overworld',
            startTime: performance.now(),
            dots: ds.dots,
            dotIndex: -1,
            enemyType: ds.enemyType,
            enemyId: ds.enemyId,
          };
          state.combat = null;
        }
      }
      // Skip normal combat updates but DON'T return — need to reach draw() below
    } else {
    
    // Update player attack animation
    if (c.playerAttackAnim) {
      const a = c.playerAttackAnim;
      const t = time - a.startTime;
      if (t >= a.totalDuration) {
        c.playerAttackAnim = null;
        // Copy resolution — add move to empty slot
        if (c.copyTarget) {
          const copiedMove = c.copyTarget;
          c.copyTarget = null;
          c.actions.push(copiedMove);
          state.inventory.push(copiedMove);
          if (state.actionOrder) state.actionOrder.push(copiedMove);
          // Show bark with copied move name
          c.playerBark = { text: '» ' + copiedMove, startTime: time, duration: 1000 };
          playChestOpen();
          c.phase = 'action';
          c.waiting = false;
          c.attackText = null;
          c.waitCountdown = -1;
        }
        // Apply damage to enemy (or heal if heal action)
        else if (c.attackText) {
          const act = COMBAT_ACTIONS[c.attackText] || {};
          if (act.heal) {
            // Heal player — amount equals EFF stat
            const healAmt = act.eff || 0;
            c.playerHp = Math.min(c.playerMaxHp, c.playerHp + healAmt);
            c.hpFlash = { startTime: performance.now(), duration: 600, blocked: true, damage: 0 };
            playHit(true);
          } else {
          const enemyAct = COMBAT_ACTIONS[c.enemyAction] || {};
          const pierceDmg = typeof act.pierce === 'number' ? act.pierce : 0;
          const dmg = act.pierce === true ? (act.eff || 0) : Math.max(pierceDmg, (act.eff || 0) - (enemyAct.def || 0));
          c.enemyHp = Math.max(0, c.enemyHp - dmg);
          playHit(false);
          // Screen shake on enemy hit (lighter than player hit)
          if (dmg > 0) {
            c.screenShake = { startTime: performance.now(), duration: 200, intensity: 3 };
            // HP chip particles from enemy health bar
            if (!c.hpChipParticles) c.hpChipParticles = [];
            for (let i = 0; i < 4 + Math.floor(dmg / 2); i++) {
              c.hpChipParticles.push({
                x: 0, y: 0, // positioned at draw time relative to enemy HP bar
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2 - 1,
                life: 0.6 + Math.random() * 0.4,
                size: 2 + Math.random() * 3,
                enemy: true,
              });
            }
          }
          // Stun: add wait ticks to enemy countdown
          const stunTicks = act.stun || 0;
          if (stunTicks > 0 && dmg > 0) {
            c.enemyWaitCountdown = (c.enemyWaitCountdown > 0 ? c.enemyWaitCountdown : 0) + stunTicks;
            c.stunFlash = { startTime: performance.now(), duration: 600 };
            c.stunBark = { text: 'STUNNED +' + stunTicks, startTime: performance.now(), duration: 1200 };
          }
          if (c.enemyHp <= 0 && !c.winState) {
            c.winState = { startTime: performance.now() };
          }
          } // end else (not heal)
        }
                // PAUSE — player always picks next action first, even on simultaneous resolution.
        // Enemy countdown stays at 0; their attack fires after player's next commit.
          c.phase = 'action';
          c.waiting = false;
          c.attackText = null;
          c.waitCountdown = -1;
      }
    }
    
    // Update player bark (non-damaging move like Defend — no rush, just text)
    if (c.playerBark) {
      const t = time - c.playerBark.startTime;
      if (t >= c.playerBark.duration) {
        c.playerBark = null;
        // PAUSE — player picks next action first, even on simultaneous resolution.
          c.phase = 'action';
          c.waiting = false;
          c.attackText = null;
          c.waitCountdown = -1;
      }
    }
    
    // Update enemy attack animation (damaging move — rush toward player)
    if (c.enemyAttackAnim) {
      const a = c.enemyAttackAnim;
      const t = time - a.startTime;
      if (t >= a.totalDuration) {
        c.enemyAttackAnim = null;
        // Apply damage to player — player ALWAYS has def from their queued action
        const enemyAct = COMBAT_ACTIONS[c.enemyAction] || {};
        const playerAct = COMBAT_ACTIONS[c.attackText || ''] || {};
        const ePierceDmg = typeof enemyAct.pierce === 'number' ? enemyAct.pierce : 0;
        const enemyDmg = enemyAct.pierce === true ? (enemyAct.eff || 0) : Math.max(ePierceDmg, (enemyAct.eff || 0) - (playerAct.def || 0));
        // Screen shake on ANY hit (stronger if damage, lighter if blocked)
        c.screenShake = { startTime: time, duration: enemyDmg > 0 ? 400 : 200, intensity: enemyDmg > 0 ? 6 : 3 };
        // Explosion effect for fire-type attacks
        if (c.enemyAction === 'Fire Punch') {
          c.explosionAnim = { startTime: time, duration: EXPLOSION_FRAMES / EXPLOSION_FPS * 1000 };
        }
        // HP flash on any hit attempt
        c.hpFlash = { startTime: time, duration: 600, blocked: enemyDmg === 0, damage: enemyDmg };
        if (enemyDmg > 0) {
          c.playerHp = Math.max(0, c.playerHp - enemyDmg);
          playHit(true);
          c.playerHurtAnim = { startTime: time, duration: 400 };
          // HP chip particles from player health bar
          if (!c.hpChipParticles) c.hpChipParticles = [];
          for (let i = 0; i < 4 + Math.floor(enemyDmg / 2); i++) {
            c.hpChipParticles.push({
              x: 0, y: 0,
              vx: (Math.random() - 0.5) * 3,
              vy: -Math.random() * 2 - 1,
              life: 0.6 + Math.random() * 0.4,
              size: 2 + Math.random() * 3,
              enemy: false,
            });
          }
          // Check for death
          if (c.playerHp <= 0) {
            if (state.isSkeleton) {
              c.playerHp = 1;
              c.playerBark = { text: '...', startTime: time, duration: 800 };
            } else {
              c.playerDied = true;
              c.deathTime = time;
            }
          }
        } else {
          // Full block — hitstop + shield sheen
          c.hitstop = { startTime: time, duration: 120 };
          c.blockSheen = { startTime: time, duration: 350 };
          playHit(false); // lighter hit sound for blocked
        }
        // Enemy immediately picks next action + starts new countdown — NO PAUSE
        c.enemyAction = pickEnemyAction(c);
        c.enemyActionRevealed = true;
        const nextAct = COMBAT_ACTIONS[c.enemyAction] || {};
        c.enemyWaitCountdown = nextAct.wait || 0;
        c.enemyWaiting = true;
        // Ticking resumes immediately (player is still counting)
        // But if player countdown already resolved (deferred enemy attack), return to action select
        if (c.waitCountdown <= 0) {
          c.phase = 'action';
          c.waiting = false;
          c.attackText = null;
          c.waitCountdown = -1;
        }
      }
    }
    
    // Update enemy bark (non-damaging move like Charging — no rush, just text)
    if (c.enemyBark) {
      const t = time - c.enemyBark.startTime;
      if (t >= c.enemyBark.duration) {
        c.enemyBark = null;
        // Same as attack resolve but no damage — enemy picks next action, NO PAUSE
        c.enemyAction = pickEnemyAction(c);
        c.enemyActionRevealed = true;
        const nextAct = COMBAT_ACTIONS[c.enemyAction] || {};
        c.enemyWaitCountdown = nextAct.wait || 0;
        c.enemyWaiting = true;
        // If player countdown already resolved (deferred enemy bark), return to action select
        if (c.waitCountdown <= 0) {
          c.phase = 'action';
          c.waiting = false;
          c.attackText = null;
          c.waitCountdown = -1;
        }
      }
    }

    // Ally (ghost companion) attack animation
    if (c.allyAttackAnim) {
      const t = time - c.allyAttackAnim.startTime;
      if (t >= c.allyAttackAnim.duration) {
        c.allyAttackAnim = null;
        // Apply Ghost Strike damage (pierce: true, eff: 8)
        const allyDmg = 8; // pierce ignores defense
        c.enemyHp = Math.max(0, c.enemyHp - allyDmg);
        c.screenShake = { startTime: performance.now(), duration: 200, intensity: 3 };
        if (c.enemyHp <= 0 && !c.winState) {
          c.winState = { startTime: performance.now() };
        }
      }
    }
    
    // Hitstop — freeze everything briefly
    if (c.hitstop && (time - c.hitstop.startTime < c.hitstop.duration)) {
      // Skip all tick/anim updates during hitstop
    } else {
      c.hitstop = null;
    // Tick system — ticks when both committed, not during animations
    const anyCountdown = (c.waitCountdown > 0) || (c.enemyWaitCountdown > 0);
    const animPlaying = c.playerAttackAnim || c.playerBark || c.enemyAttackAnim || c.enemyBark;
    if (c.waiting && c.enemyWaiting && anyCountdown && !animPlaying && !c.winState && !c.copyMenu) {
      const dt = time - c.lastWaitTick;
      c.lastWaitTick = time;
      c.waitAccumulator += dt;
      
      if (c.waitAccumulator >= c.waitTickSpeed) {
        c.waitAccumulator -= c.waitTickSpeed;
        if (c.waitAccumulator > c.waitTickSpeed) c.waitAccumulator = 0;
        playTick();
        
        if (c.waitCountdown > 0) c.waitCountdown--;
        if (c.enemyWaitCountdown > 0) c.enemyWaitCountdown--;
        if (c.allyPresent && c.allyWaitCountdown > 0) c.allyWaitCountdown--;
        
        // Player hit zero first (or tie — player priority)
        if (c.waitCountdown <= 0 && !c.playerAttackAnim && !c.playerBark) {
          c.waitAccumulator = 0;
          const pAct = COMBAT_ACTIONS[c.attackText || ''] || {};
          if (pAct.copy) {
            const copiedMove = c.enemyAction;
            // Register copied move in COMBAT_ACTIONS if not already there
            if (copiedMove && !COMBAT_ACTIONS[copiedMove]) {
              COMBAT_ACTIONS[copiedMove] = { eff: 5, def: 0, wait: 6 };
            }
            if (c.actions.length < 8) {
              // Has space — rush animation toward enemy, then add move
              c.copyTarget = copiedMove;
              c.playerAttackAnim = {
                startTime: time,
                rushDuration: 200, hitPause: 100, returnDuration: 200, totalDuration: 500,
              };
              c.waiting = false;
              c.waitCountdown = -1;
            } else {
              // Full — show slot-select menu
              c.copyMenu = { enemyMove: copiedMove, selectedSlot: 0 };
              c.waiting = false;
              c.waitCountdown = -1;
            }
          } else if ((pAct.eff || 0) === 0) {
            // Non-damaging move (Defend, etc.) — bark instead of rushing
            c.playerBark = { text: c.attackText, startTime: time, duration: 800 };
          } else {
            c.playerAttackAnim = {
              startTime: time,
              rushDuration: 200, hitPause: 100, returnDuration: 200, totalDuration: 500,
            };
          }
        }
        // Enemy hit zero
        else if (c.enemyWaitCountdown <= 0 && !c.enemyAttackAnim && !c.enemyBark) {
          c.waitAccumulator = 0;
          const enemyAct = COMBAT_ACTIONS[c.enemyAction] || {};
          if ((enemyAct.eff || 0) === 0) {
            c.enemyBark = { text: c.enemyAction, startTime: time, duration: 800 };
          } else {
            c.enemyAttackAnim = {
              startTime: time,
              rushDuration: 200, hitPause: 100, returnDuration: 200, totalDuration: 500,
            };
          }
        }
        // Ally (ghost companion) hit zero — auto-attack enemy
        else if (c.allyPresent && c.allyWaitCountdown <= 0 && !c.allyAttackAnim) {
          c.allyAttackAnim = { startTime: time, duration: 600 };
          c.allyWaitCountdown = 6; // reset for next attack
        }
      }
    }
    } // end hitstop else
    } // end else (not playerDied)
  }
  draw(); // Always draw overworld
  if (state.inventoryOpen && !state.combat) {
    drawInventory(); // Inventory overlay
  }
  if (state.combat) {
    drawCombat(); // Overlay combat on top
  }
  // Death overworld overlay
  if (state.deathOverworld) {
    const ds = state.deathOverworld;
    const W = canvas.width, H = canvas.height;
    const now = performance.now();
    if (ds.phase === 'overworld') {
      // Player death sprite on ground — draw last frame of death_down
      const sheet = PLAYER_SHEET; // dying as human
      if (sheet.loaded) {
        const anim = sheet.anims['death_down'];
        if (anim) {
          const frame = anim.frames - 1; // last frame
          const srcX = frame * sheet.frameW;
          const srcY = anim.row * sheet.frameH;
          const px = Math.round(state.player.x * state.tileSize - getCameraOffset().x);
          const py = Math.round(state.player.y * state.tileSize - getCameraOffset().y);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(sheet.img, srcX, srcY, sheet.frameW, sheet.frameH, px, py, state.tileSize, state.tileSize);
        }
      }
      // Fade to signal transition coming
      const t = Math.min(1, (now - ds.startTime) / 2500);
      if (t > 0.6) {
        ctx.fillStyle = `rgba(0,0,0,${(t - 0.6) / 0.4})`;
        ctx.fillRect(0, 0, W, H);
      }
    }
    if (ds.phase === 'black' || ds.phase === 'dots' || ds.phase === 'wake') {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
    }
    if (ds.phase === 'dots') {
      const text = ds.dots[ds.dotIndex] || '.  .  .';
      ctx.font = '36px "RM2000Alt"';
      const tw = ctx.measureText(text).width;
      crispText(text, Math.round(W / 2 - tw / 2), Math.round(H / 2 - 18), 36, '#888', 0.5, CRISP_FONT_ALT);
    }
    if (ds.phase === 'wake') {
      const t = Math.min(1, (now - ds.wakeStart) / 1500);
      ctx.save();
      ctx.globalAlpha = t;
      if (SKELETON_SHEET.loaded) {
        const anim = SKELETON_SHEET.anims['idle_down'];
        const sz = 96;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(SKELETON_SHEET.img, 0, anim.row * 32, 32, 32,
          W / 2 - sz / 2, H / 2 - sz / 2 - 20, sz, sz);
      }
      if (t > 0.5) {
        ctx.globalAlpha = (t - 0.5) * 2;
        ctx.font = '28px "RM2000Alt"';
        const tw2 = ctx.measureText('You are still here.').width;
        crispText('You are still here.', Math.round(W / 2 - tw2 / 2), H / 2 + 50, 28, '#a0a0a0', 0.5, CRISP_FONT_ALT);
      }
      ctx.restore();
    }
    if (ds.phase === 'offer') {
      // Black background with chest-style item offer box
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      const boxW = 260, boxH = 160;
      const bx = Math.round(W / 2 - boxW / 2), by = Math.round(H / 2 - boxH / 2);
      // Dark box with bone-white border
      ctx.fillStyle = '#111';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = '#b0a890';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, boxW, boxH);
      // Title
      const title = 'Bone Throw';
      crispGradientText(title, bx + boxW / 2 - 50, by + 14, 22,
        [{ pos: 0, color: '#c8b880' }, { pos: 0.5, color: '#fff8e0' }, { pos: 1, color: '#c8b880' }], 0.5, CRISP_FONT_ALT);
      // Stats
      const act = COMBAT_ACTIONS['Bone Throw'];
      const sy = by + 44;
      crispText('Eff ' + act.eff + '  Def ' + act.def + '  Wait ' + act.wait, bx + 30, sy, 18, '#c0b888', 0.3, CRISP_FONT_ALT);
      if (act.pierce) {
        crispText('Pierce' + (act.pierce === true ? '' : ' ' + act.pierce), bx + 30, sy + 22, 16, '#88c8d0', 0.3, CRISP_FONT_ALT);
      }
      // Description
      crispText('A fragment of yourself,', bx + 30, sy + 48, 14, '#888', 0.2, CRISP_FONT_ALT);
      crispText('hurled with hollow conviction.', bx + 30, sy + 64, 14, '#888', 0.2, CRISP_FONT_ALT);
      // Take / Leave buttons
      const btnY = by + boxH - 30;
      const takeX = bx + boxW / 2 - 70;
      const leaveX = bx + boxW / 2 + 20;
      const sel = ds.offerSelected || 0;
      if (sel === 0) {
        const pulse = 0.20 + 0.10 * Math.sin(now / 300);
        ctx.fillStyle = 'rgba(80, 200, 60,' + pulse + ')';
        ctx.fillRect(takeX - 4, btnY - 2, 54, 20);
      } else {
        const pulse = 0.20 + 0.10 * Math.sin(now / 300);
        ctx.fillStyle = 'rgba(200, 80, 60,' + pulse + ')';
        ctx.fillRect(leaveX - 4, btnY - 2, 54, 20);
      }
      crispText('(Z) Take', takeX, btnY, 16, sel === 0 ? '#fff' : '#666', 0.2, CRISP_FONT_ALT);
      crispText('(X) Leave', leaveX, btnY, 16, sel === 1 ? '#fff' : '#666', 0.2, CRISP_FONT_ALT);
    }
  }
  if (state.dialogue) {
    drawDialogue(); // Dialogue box on canvas
  }
  if (state.chestInteraction) {
    drawChestInteraction();
  }
  // Weapon transformation prompt
  if (state.weaponTransformPrompt && !state.combat) {
    drawWeaponTransformPrompt();
  }
  // Screen transition fade
  if (state.screenFade) {
    const f = state.screenFade;
    const elapsed = performance.now() - f.startTime;
    let alpha = Math.min(1, elapsed / f.duration);
    if (f.type === 'in') alpha = 1 - alpha;
    if (alpha > 0) {
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = alpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }
  }
  // Save feedback toast
  if (state.saveFeedback) {
    const sf = state.saveFeedback;
    const elapsed = performance.now() - sf.startTime;
    if (elapsed < sf.duration) {
      const fadeIn = Math.min(1, elapsed / 200);
      const fadeOut = Math.max(0, 1 - (elapsed - sf.duration + 400) / 400);
      const alpha = Math.min(fadeIn, fadeOut);
      ctx.globalAlpha = alpha;
      crispText(sf.text, canvas.width / 2 - 60, 20, 32, '#f0d060', 0, CRISP_FONT_ALT);
      ctx.globalAlpha = 1;
    } else {
      state.saveFeedback = null;
    }
  }
  } catch(err) {
    console.error('[GAMELOOP CRASH]', err);
  }
  requestAnimationFrame(gameLoop);
}

// ══════════════════════════════════
// INIT
// ══════════════════════════════════
loadGameData().then(() => {
  loadEditorData();
  loadEnemySprites();
  return loadLevel();
}).then(() => {
  // Wait for fonts before first render to prevent flash
  Promise.all([
    document.fonts.load('32px "RM2000"'),
    document.fonts.load('32px "RM2000Alt"'),
    document.fonts.load('32px "Pixelify Sans"')
  ]).then(() => requestAnimationFrame(gameLoop))
    .catch(() => requestAnimationFrame(gameLoop));
});
