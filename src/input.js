// ══════════════════════════════════
// INPUT
// ══════════════════════════════════
const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  
  // Splash screen — any key starts audio + transitions to title
  if (state.screen === 'splash') {
    const actx = getAudioCtx();
    if (actx) actx.resume();
    if (!titleMusicStarted) {
      titleMusic.play().then(() => { titleMusicStarted = true; }).catch(() => {});
    }
    state.screen = 'title';
    // Don't preventDefault on Meta to avoid OS shortcut issues, but still transition
    if (e.key !== 'Meta') e.preventDefault();
    return;
  }
  // If Meta was pressed on splash but music didn't start, retry on next key
  if (state.screen === 'title' && !titleMusicStarted) {
    const actx = getAudioCtx();
    if (actx) actx.resume();
    titleMusic.play().then(() => { titleMusicStarted = true; }).catch(() => {});
  }
  
  // Title screen input
  if (state.screen === 'title') {
    if (state.titleDeleteMode) {
      if (state.titleDeleteConfirm) {
        // Confirmation prompt: Z = yes delete, X/Esc = cancel
        if (e.key === 'z' || e.key === 'Z') {
          const slot = state.titleSelection || 0;
          localStorage.removeItem('matrimony_slot_' + slot);
          playHit(true);
          state.titleDeleteConfirm = false;
          state.titleDeleteMode = false;
        } else if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') {
          state.titleDeleteConfirm = false;
          playTick();
        }
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowUp') {
        state.titleSelection = (state.titleSelection + 2) % 3;
        playTick();
      } else if (e.key === 'ArrowDown') {
        state.titleSelection = (state.titleSelection + 1) % 3;
        playTick();
      } else if (e.key === 'z' || e.key === 'Z') {
        // Show confirmation before deleting
        state.titleDeleteConfirm = true;
        playTick();
      } else if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') {
        state.titleDeleteMode = false;
        playTick();
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowUp') {
      state.titleSelection = (state.titleSelection + 2) % 3;
      playTick();
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      state.titleSelection = (state.titleSelection + 1) % 3;
      playTick();
      e.preventDefault();
    } else if (e.key === 'x' || e.key === 'X') {
      // Enter delete mode
      state.titleDeleteMode = true;
      playTick();
      e.preventDefault();
    } else if (e.key === 'z' || e.key === 'Z') {
      // Guard against multi-press during transition
      if (state.titleToGame) { e.preventDefault(); return; }
      // Start game — apply save immediately, then fade game in over title
      const slot = state.titleSelection || 0;
      const hasSave = loadGame(slot) !== null;
      if (hasSave) playChestOpen(); else playHit(true);
      (async () => {
        if (hasSave) await applySave(slot);
        state.titleToGame = { startTime: performance.now(), duration: 1200 };
        // Fade title music out over 1200ms transition
        const fadeStart = performance.now();
        const fadeInterval = setInterval(() => {
          const elapsed = performance.now() - fadeStart;
          const t = Math.min(1, elapsed / 1200);
          titleMusic.volume = 0.7 * (1 - t);
          if (t >= 1) {
            clearInterval(fadeInterval);
            titleMusic.pause();
            titleMusic.currentTime = 0;
            titleMusic.volume = 0.7;
          }
        }, 30);
        setTimeout(() => {
          state.screen = 'game';
          state.titleToGame = null;
        }, 1200);
      })();
      e.preventDefault();
    }
    return;
  }
  
  // ESC — exit combat after 3s
  // C key — toggle flight
  if (e.key === 'c' && state.screen === 'game' && !state.combat && !state.combatTransition && !state.dialogue && !state.inventoryOpen && state.canFly && !state.flyTransition) {
    if (!state.flying) {
      // Takeoff animation
      state.moving = false;
      const startFacingIdx = ['down', 'left', 'up', 'right'].indexOf(state.facing);
      state.flyTransition = {
        type: 'takeoff',
        startTime: performance.now(),
        duration: 500,
        originX: state.player.x,
        originY: state.player.y,
        startFacing: startFacingIdx >= 0 ? startFacingIdx : 0
      };
    } else {
      // Landing animation — spiral down to nearest tile
      const snapX = Math.round(state.flyX);
      const snapY = Math.round(state.flyY);
      if (!isTileBlocked(snapX, snapY, false)) {
        const startFacingIdx = ['down', 'left', 'up', 'right'].indexOf(state.facing);
        state.flyTransition = {
          type: 'landing',
          startTime: performance.now(),
          duration: 600,
          originX: state.flyX,
          originY: state.flyY,
          targetX: snapX,
          targetY: snapY,
          startFacing: startFacingIdx >= 0 ? startFacingIdx : 0
        };
      }
    }
    e.preventDefault();
    return;
  }

  if (e.key === 'Escape' && state.combat && !state.combatTransition) {
    if (performance.now() - state.combat.lastInputTime > 10000) {
      exitCombat(true);
    }
    return;
  }
  
  // Inventory navigation
  if (state.inventoryOpen && !state.combat) {
    // Save slot picker intercepts all input when open
    if (state.saveMenu) {
      if (e.key === 'ArrowUp') { state.saveMenu.selected = Math.max(0, state.saveMenu.selected - 1); playTick(); e.preventDefault(); return; }
      if (e.key === 'ArrowDown') { state.saveMenu.selected = Math.min(2, state.saveMenu.selected + 1); playTick(); e.preventDefault(); return; }
      if (e.key === 'z' || e.key === 'Z') {
        if (saveGame(state.saveMenu.selected)) {
          state.saveFeedback = { text: 'Saved to Slot ' + (state.saveMenu.selected + 1) + '!', startTime: performance.now(), duration: 1500 };
          playHit(false);
        }
        state.saveMenu = null;
        e.preventDefault(); return;
      }
      if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') { state.saveMenu = null; e.preventDefault(); return; }
      e.preventDefault(); return;
    }
    const items = getInventoryActions();
    if (state.inventorySubMenu) {
      const subOpts = ['Lv Up', 'Order', 'Drop'];
      if (e.key === 'ArrowUp') { state.inventorySubSelected = Math.max(0, (state.inventorySubSelected || 0) - 1); e.preventDefault(); return; }
      if (e.key === 'ArrowDown') { state.inventorySubSelected = Math.min(subOpts.length - 1, (state.inventorySubSelected || 0) + 1); e.preventDefault(); return; }
    } else {
      const numItems = Math.min(items.length, 8);
      if (numItems > 0) {
        const sel = state.inventorySelected || 0;
        const col = sel % 2;
        const row = Math.floor(sel / 2);
        if (e.key === 'ArrowUp') { const nr = row - 1; if (nr >= 0) { const ni = nr * 2 + col; state.inventorySelected = ni < numItems ? ni : sel; } e.preventDefault(); return; }
        if (e.key === 'ArrowDown') { const nr = row + 1; const ni = nr * 2 + col; state.inventorySelected = ni < numItems ? ni : sel; e.preventDefault(); return; }
        if (e.key === 'ArrowLeft') { if (col === 1) { const ni = row * 2; state.inventorySelected = ni < numItems ? ni : sel; } e.preventDefault(); return; }
        if (e.key === 'ArrowRight') { if (col === 0) { const ni = row * 2 + 1; state.inventorySelected = ni < numItems ? ni : sel; } e.preventDefault(); return; }
      }
    }
  }

  // Combat input — depends on phase
  if (state.combat) {
    const c = state.combat;
    c.lastInputTime = performance.now();
    
    if (c.phase === 'target') {
      // Left/Right to toggle between enemy and self
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        c.targetSelf = !c.targetSelf;
        e.preventDefault(); return;
      }
    } else if (c.copyMenu) {
      // Copy menu slot navigation — same 2x4 grid as actions
      const numSlots = Math.min((c.actions || []).length, 8);
      if (numSlots > 0) {
        const sel = c.copyMenu.selectedSlot || 0;
        const col = sel % 2;
        const row = Math.floor(sel / 2);
        if (e.key === 'ArrowUp') {
          const newRow = row - 1;
          if (newRow >= 0) { const newIdx = newRow * 2 + col; c.copyMenu.selectedSlot = newIdx < numSlots ? newIdx : sel; }
          e.preventDefault(); return;
        }
        if (e.key === 'ArrowDown') {
          const newRow = row + 1;
          const newIdx = newRow * 2 + col;
          c.copyMenu.selectedSlot = newIdx < numSlots ? newIdx : sel;
          e.preventDefault(); return;
        }
        if (e.key === 'ArrowLeft') {
          if (col === 1) { const newIdx = row * 2; c.copyMenu.selectedSlot = newIdx < numSlots ? newIdx : sel; }
          e.preventDefault(); return;
        }
        if (e.key === 'ArrowRight') {
          if (col === 0) { const newIdx = row * 2 + 1; c.copyMenu.selectedSlot = newIdx < numSlots ? newIdx : sel; }
          e.preventDefault(); return;
        }
      }
    } else if (c.phase === 'action') {
      // Action selection phase — 2x4 grid navigation
      const numActions = Math.min((c.actions || []).length, 8);
      if (numActions > 0) {
        const sel = c.selectedAction || 0;
        const col = sel % 2;
        const row = Math.floor(sel / 2);
        if (e.key === 'ArrowUp') {
          const newRow = row - 1;
          if (newRow >= 0) { const newIdx = newRow * 2 + col; c.selectedAction = newIdx < numActions ? newIdx : sel; }
          e.preventDefault(); return;
        }
        if (e.key === 'ArrowDown') {
          const newRow = row + 1;
          const newIdx = newRow * 2 + col;
          c.selectedAction = newIdx < numActions ? newIdx : sel;
          e.preventDefault(); return;
        }
        if (e.key === 'ArrowLeft') {
          if (col === 1) { const newIdx = row * 2; c.selectedAction = newIdx < numActions ? newIdx : sel; }
          e.preventDefault(); return;
        }
        if (e.key === 'ArrowRight') {
          if (col === 0) { const newIdx = row * 2 + 1; c.selectedAction = newIdx < numActions ? newIdx : sel; }
          e.preventDefault(); return;
        }
      }
    }
  }
  
  // Chest interaction intercepts all input
  if (state.chestInteraction) {
    if (handleChestInput(e.key)) { e.preventDefault(); }
    return;
  }
  
  // Death offer phase — arrow keys toggle, X rejects
  if (state.deathOverworld && state.deathOverworld.phase === 'offer') {
    e.preventDefault();
    const ds = state.deathOverworld;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      ds.offerSelected = ds.offerSelected === 0 ? 1 : 0;
      playTick();
    }
    if ((e.key === 'x' || e.key === 'X' || e.key === 'Escape')) {
      // Reject
      state.deathOverworld = null;
    }
    // Z handled below
    if (e.key !== 'z' && e.key !== 'Z') return;
  }
  
  // Z = Confirm
  if (e.key === 'z' || e.key === 'Z') {
    e.preventDefault();
    if (state.deathOverworld) {
      const ds = state.deathOverworld;
      if (ds.phase === 'dots') {
        ds.dotIndex++;
        if (ds.dotIndex >= ds.dots.length) {
          ds.phase = 'wake';
          ds.wakeStart = performance.now();
        }
        return;
      }
      if (ds.phase === 'wake') {
        state.isSkeleton = true;
        state.player.hp = 15;
        // Clear all enemies in this level
        for (const e of state.entities) {
          state.defeatedEnemies[e.id] = true;
        }
        state.entities = state.entities.filter(e => !state.defeatedEnemies[e.id]);
        // Show Bone Throw offer (if not already in inventory)
        if (!state.inventory.includes('Bone Throw')) {
          ds.phase = 'offer';
          ds.offerSelected = 0; // 0 = Take, 1 = Leave
        } else {
          state.deathOverworld = null;
        }
        return;
      }
      if (ds.phase === 'offer') {
        if (ds.offerSelected === 0) {
          // Accept Bone Throw
          if (state.inventory.length >= 8) {
            // Funnel into chest drop-picker flow
            state.chestInteraction = { item: 'Bone Throw', entityId: '__skeleton_bone_throw', step: 'inventoryFull', selectedSlot: 0 };
          } else {
            state.inventory.push('Bone Throw');
          }
        }
        state.deathOverworld = null;
        return;
      }
      return; // block Z during other phases
    }
    if (state.weaponTransformPrompt) {
      acceptWeaponTransform();
      playTick();
      return;
    }
    if (state.inventoryOpen && !state.combat) {
      if (state.inventoryOrdering !== undefined) {
        // In order mode — swap the two items
        const items = getInventoryActions();
        const from = state.inventoryOrdering;
        const to = state.inventorySelected || 0;
        if (from !== to && from < items.length && to < items.length) {
          // Swap in the actual inventory/action list
          const actionList = state.actionOrder || items.slice();
          const tmp = actionList[from];
          actionList[from] = actionList[to];
          actionList[to] = tmp;
          state.actionOrder = actionList;
          playTick();
        }
        state.inventoryOrdering = undefined;
        return;
      }
      if (state.inventorySubMenu) {
        const subSel = state.inventorySubSelected || 0;
        if (subSel === 1) {
          // Order — enter ordering mode
          state.inventoryOrdering = state.inventorySelected || 0;
          state.inventorySubMenu = false;
          playTick();
        } else if (subSel === 2) {
          // Drop — remove item from inventory
          const items = getInventoryActions();
          const item = items[state.inventorySelected || 0];
          if (item) {
            // Remove from inventory
            const idx = state.inventory.indexOf(item);
            if (idx !== -1) state.inventory.splice(idx, 1);
            // Remove from actionOrder
            if (state.actionOrder) {
              const oi = state.actionOrder.indexOf(item);
              if (oi !== -1) state.actionOrder.splice(oi, 1);
            }
            playHit(false);
          }
          state.inventorySubMenu = false;
          // Clamp selection
          const newItems = getInventoryActions();
          if ((state.inventorySelected || 0) >= newItems.length) {
            state.inventorySelected = Math.max(0, newItems.length - 1);
          }
        } else {
          // Lv Up — placeholder
          state.inventorySubMenu = false;
        }
      } else {
        const items = getInventoryActions();
        if (items.length > 0) {
          state.inventorySubMenu = true;
          state.inventorySubSelected = 0;
        }
      }
      return;
    }
    if (state.combat) {
      const c = state.combat;
      // Death sequence — Z advances through "..." dialogue
      if (c.playerDied && c.deathSequence) {
        return; // Z does nothing during combat death phases — auto-advance
      }
      // Win state — Z exits immediately
      if (c.winState) {
        // Award EXP
        const expReward = ENEMY_DATA[c.enemy.type]?.exp || 0;
        if (expReward > 0) {
          if (!state.player.exp) state.player.exp = 0;
          state.player.exp += expReward;
        }
        // Start death animation on the enemy entity
        const ent = state.entities.find(en => en.id === c.enemy.id);
        if (ent) ent.deathAnim = { startTime: performance.now() };
        exitCombat();
        return;
      }
      // Copy menu — player selects slot to replace with copied move
      if (c.copyMenu) {
        const slot = c.copyMenu.selectedSlot || 0;
        const actions = c.actions || [];
        const copiedMove = c.copyMenu.enemyMove;
        if (copiedMove && actions.length > 0) {
          // Replace the selected slot in inventory and action list
          const oldItem = actions[slot];
          actions[slot] = copiedMove;
          // Update actual inventory
          const invIdx = state.inventory.indexOf(oldItem);
          if (invIdx !== -1) state.inventory[invIdx] = copiedMove;
          else state.inventory.push(copiedMove);
          // Update action order if it exists
          if (state.actionOrder) {
            const aoIdx = state.actionOrder.indexOf(oldItem);
            if (aoIdx !== -1) state.actionOrder[aoIdx] = copiedMove;
          }
          // Register the copied move in COMBAT_ACTIONS if not already there
          if (!COMBAT_ACTIONS[copiedMove]) {
            COMBAT_ACTIONS[copiedMove] = { eff: 5, def: 0, wait: 6 }; // fallback stats
          }
        }
        c.copyMenu = null;
        c.phase = 'action';
        c.attackText = null;
        playChestOpen(); // satisfying confirmation sound
        return;
      }
      if (c.phase === 'target') {
        // Confirm enemy target → move to action selection
        c.phase = 'action';
        c.selectedAction = 0;
      } else if (c.phase === 'action' && !c.waiting) {
        const actionList = c.actions && c.actions.length > 0 ? c.actions : ['Stand Still'];
        const action = actionList[c.selectedAction || 0];
        if (action) {
          // Combo system: track consecutive Rusty Shortsword uses
          if (!c.comboCount) c.comboCount = 0;
          if (!c.comboAction) c.comboAction = null;
          let resolvedAction = action;
          if (action === 'Rusty Shortsword') {
            c.comboCount++;
            c.comboAction = 'Rusty Shortsword';
            if (c.comboCount >= 3) {
              resolvedAction = 'Slash!';
              c.comboCount = 0; // reset after combo fires
            }
          } else {
            c.comboCount = 0;
            c.comboAction = null;
          }
          const act = COMBAT_ACTIONS[resolvedAction] || {};
          c.waitCountdown = act.wait || 0;
          c.lastWaitTick = performance.now();
          c.waitAccumulator = 0;
          c.waiting = true;
          c.attackText = resolvedAction;
          // If enemy has NO remaining countdown (resolved or fresh start), pick new action
          if (c.enemyWaitCountdown <= 0) {
            c.enemyAction = pickEnemyAction(c);
            const enemyAct = COMBAT_ACTIONS[c.enemyAction] || {};
            c.enemyWaitCountdown = enemyAct.wait || 0;
          }
          // Enemy resumes counting (frozen countdown resumes, or fresh one starts)
          c.enemyWaiting = true;
          c.enemyActionRevealed = true; // Always show enemy action after first commit
        }
      }
    } else if (state.dialogue) {
      closeDialogue();
    } else {
      interact();
    }
    return;
  }
  
  // Shift = Save (only inside inventory menu)
  if (e.key === 'Shift' && state.screen === 'game' && !state.combat && !state.dialogue && state.inventoryOpen) {
    e.preventDefault();
    if (state.saveMenu) {
      state.saveMenu = null;
    } else {
      state.saveMenu = { selected: 0 };
    }
    return;
  }
  
  // X = Cancel
  if (e.key === 'x' || e.key === 'X') {
    e.preventDefault();
    if (state.weaponTransformPrompt) {
      rejectWeaponTransform();
      playTick();
      return;
    }
    if (state.combat) {
      // Copy menu can be cancelled — go back to action select
      if (state.combat.copyMenu) {
        state.combat.copyMenu = null;
        state.combat.phase = 'action';
        state.combat.waiting = false;
        state.combat.attackText = null;
        state.combat.waitCountdown = -1;
        playTick();
        return;
      }
      // No cancelling once committed — you're locked in
    } else if (state.inventoryOpen) {
      // Close inventory or back out of sub-menu/ordering
      if (state.inventoryOrdering !== undefined) {
        state.inventoryOrdering = undefined;
      } else if (state.inventorySubMenu) {
        state.inventorySubMenu = false;
      } else {
        state.inventoryOpen = false;
        state.saveMenu = null;
      }
    } else if (state.dialogue) {
      closeDialogue();
    } else if (!state.moving && !state.combatTransition) {
      // Open inventory
      state.inventoryOpen = true;
      state.inventorySelected = 0;
      state.inventorySubMenu = false;
      state.inventorySubSelected = 0;
    }
    return;
  }
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  if (e.key === 'f' || e.key === 'F') state.showFontTest = !state.showFontTest;
  if (e.key === 'h' || e.key === 'H') state.showHitboxes = !state.showHitboxes;
  if (state.showFontTest && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    e.preventDefault();
    if (e.key === 'ArrowUp') state.fontTestScroll = Math.max(0, state.fontTestScroll - 20);
    if (e.key === 'ArrowDown') state.fontTestScroll = Math.min(Math.max(0, state.fontTestContentH - (canvas.height - 24)), state.fontTestScroll + 20);
    if (e.key === 'ArrowLeft') state.fontTestScrollX = Math.max(0, state.fontTestScrollX - 20);
    if (e.key === 'ArrowRight') state.fontTestScrollX = Math.min(state.fontTestContentW || 0, state.fontTestScrollX + 20);
    return;
  }
});

// ══════════════════════════════════
// SCREEN TRANSITIONS
// ══════════════════════════════════
async function doScreenTransition(targetLevelIid, fromDir) {
  state.transitioning = true;
  const fadeDuration = 150;
  
  // Fade out
  state.screenFade = { type: 'out', startTime: performance.now(), duration: fadeDuration };
  await new Promise(r => setTimeout(r, fadeDuration));
  
  // Save player position and level IID before loading new level
  const oldPlayerX = state.player.x;
  const oldPlayerY = state.player.y;
  const oldLevelIid = currentLevelId;
  
  // Clear particles from previous level
  state.burnParticles = [];
  state.fishParticles = [];
  state.fishSpawnTimer = 0;
  
  // Load new level
  await loadLevel(targetLevelIid);
  
  // Get both level's world positions from LDtk data for exact alignment
  const oldLevel = ldtkData.levels.find(l => l.iid === oldLevelIid);
  const newLevel = ldtkData.levels.find(l => l.iid === targetLevelIid);
  
  if (oldLevel && newLevel) {
    // Convert player position to world coordinates (in tiles)
    const worldTileX = oldPlayerX + oldLevel.worldX / TILE;
    const worldTileY = oldPlayerY + oldLevel.worldY / TILE;
    
    // Convert to new level's local coordinates
    let newX = worldTileX - newLevel.worldX / TILE;
    let newY = worldTileY - newLevel.worldY / TILE;
    
    // Clamp to new level bounds and adjust for edge entry
    if (fromDir === 'e') newX = 0;
    else if (fromDir === 'w') newX = state.mapW - 1;
    else if (fromDir === 's') newY = 0;
    else if (fromDir === 'n') newY = state.mapH - 1;
    
    // Clamp the other axis
    newX = Math.max(0, Math.min(state.mapW - 1, Math.round(newX)));
    newY = Math.max(0, Math.min(state.mapH - 1, Math.round(newY)));
    
    // Find walkable tile near calculated position
    if (fromDir === 'e' || fromDir === 'w') {
      state.player.x = newX;
      state.player.y = findNearestWalkable(newX, newY, 'col');
    } else {
      state.player.y = newY;
      state.player.x = findNearestWalkable(newX, newY, 'row');
    }
  } else {
    // Fallback to old relative method
    const relY = oldPlayerY / state.mapH;
    const relX = oldPlayerX / state.mapW;
    if (fromDir === 'w') {
      state.player.x = state.mapW - 1;
      state.player.y = findNearestWalkable(state.mapW - 1, Math.round(relY * state.mapH), 'col');
    } else if (fromDir === 'e') {
      state.player.x = 0;
      state.player.y = findNearestWalkable(0, Math.round(relY * state.mapH), 'col');
    } else if (fromDir === 'n') {
      state.player.y = state.mapH - 1;
      state.player.x = findNearestWalkable(Math.round(relX * state.mapW), state.mapH - 1, 'row');
    } else if (fromDir === 's') {
      state.player.y = 0;
      state.player.x = findNearestWalkable(Math.round(relX * state.mapW), 0, 'row');
    }
  }
  
  state.smoothX = state.player.x;
  state.smoothY = state.player.y;
  // Sync flying position after level transition
  if (state.flying) { state.flyX = state.player.x; state.flyY = state.player.y; }
  state.footsteps = [];
  updateCamera();
  prepopulateFish();

  // Ghost companion: spawn in Forgotten_Plains_III, fadeout when leaving
  if (state.levelName === 'Forgotten_Plains_III' && !state.companion) {
    state.companion = {
      x: state.player.x + 3, y: state.player.y,
      facing: 'left', opacity: 0, phase: 'fadein',
      fadeStart: performance.now(), combatHelpUsed: false,
      lastMoveTime: 0,
    };
  } else if (state.companion && state.levelName !== 'Forgotten_Plains_III') {
    if (state.companion.phase !== 'fadeout') {
      state.companion.phase = 'fadeout';
      state.companion.fadeStart = performance.now();
      // Burst of ghost particles on farewell
      for (let i = 0; i < 12; i++) {
        state.burnParticles.push({
          x: state.companion.x + 0.3 + Math.random() * 0.4,
          y: state.companion.y + 0.2 + Math.random() * 0.4,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.3 - 0.1,
          life: 1.5 + Math.random(), initialLife: 2.5,
          size: 1.5 + Math.random(), ghost: true,
        });
      }
    }
  }
  
  // Fade in
  state.screenFade = { type: 'in', startTime: performance.now(), duration: fadeDuration };
  await new Promise(r => setTimeout(r, fadeDuration));
  
  state.screenFade = null;
  state.transitioning = false;
}

// Check if placing a 1×1 tile hitbox at position (tx, ty) overlaps any collision
// tx, ty can be at half-tile increments (e.g., 3.5)
// The hitbox spans from (tx, ty) to (tx+1, ty+1)
function isTileBlocked(tx, ty, allowFly) {
  const s = state.fineCollisionScale || 2;
  // Fine cells the 1×1 hitbox covers: from (tx*s, ty*s) to ((tx+1)*s-1, (ty+1)*s-1)
  const fxStart = Math.floor(tx * s);
  const fyStart = Math.floor(ty * s);
  const fxEnd = Math.ceil((tx + 1) * s) - 1;
  const fyEnd = Math.ceil((ty + 1) * s) - 1;
  
  // Check coarse collision for all tiles the hitbox overlaps
  const txStart = Math.floor(tx), txEnd = Math.floor(tx + 0.999);
  const tyStart = Math.floor(ty), tyEnd = Math.floor(ty + 0.999);
  for (let cy = tyStart; cy <= tyEnd; cy++) {
    for (let cx = txStart; cx <= txEnd; cx++) {
      if (state.collision && state.collision[cy]) {
        const val = state.collision[cy][cx];
        if (val === 1) return true;
        if (val === 2 && !allowFly) return true;
      }
    }
  }
  
  // Check fine collision — all sub-cells the hitbox overlaps
  if (state.fineCollision) {
    for (let fy = fyStart; fy <= fyEnd; fy++) {
      for (let fx = fxStart; fx <= fxEnd; fx++) {
        if (!state.fineCollision[fy] || state.fineCollision[fy][fx] === undefined) continue;
        const val = state.fineCollision[fy][fx];
        if (val === 1) return true;
        if (val === 2 && !allowFly) return true;
      }
    }
  }
  return false;
}

// Check if a full tile position has ANY fine collision sub-cell blocked
function isTileFullyBlocked(tx, ty, allowFly) {
  return isTileBlocked(Math.floor(tx), Math.floor(ty), allowFly);
}

// Check if a full tile has ANY fine collision painted in it
function hasFineCollisionInTile(tx, ty) {
  if (!state.fineCollision) return false;
  const s = state.fineCollisionScale || 2;
  const cx = tx * s, cy = ty * s;
  for (let dy = 0; dy < s; dy++) {
    for (let dx = 0; dx < s; dx++) {
      const r = cy + dy, c = cx + dx;
      if (state.fineCollision[r] && state.fineCollision[r][c] > 0) return true;
    }
  }
  return false;
}

function findNearestWalkable(x, y, axis) {
  // Search nearby tiles for a walkable one
  const isWalkable = (r, c) => !isTileBlocked(c, r, state.flying);
  if (isWalkable(y, x)) return axis === 'col' ? y : x;
  for (let offset = 1; offset < 8; offset++) {
    if (axis === 'col') {
      if (y - offset >= 0 && isWalkable(y - offset, x)) return y - offset;
      if (y + offset < state.mapH && isWalkable(y + offset, x)) return y + offset;
    } else {
      if (x - offset >= 0 && isWalkable(y, x - offset)) return x - offset;
      if (x + offset < state.mapW && isWalkable(y, x + offset)) return x + offset;
    }
  }
  return axis === 'col' ? y : x; // fallback
}

function tryMove(dx, dy) {
  if (state.moving || state.dialogue || state.combat || state.combatTransition || state.inventoryOpen || state.chestInteraction || state.flying || state.flyTransition || state.deathOverworld) return;
  
  // Set facing
  if (dx < 0) state.facing = 'left';
  if (dx > 0) state.facing = 'right';
  if (dy < 0) state.facing = 'up';
  if (dy > 0) state.facing = 'down';
  
  // Adaptive step: try full tile, fall back to half tile near fine collision
  const half = 1 / (state.fineCollisionScale || 2); // 0.5 for 8px grid
  const px = state.player.x, py = state.player.y;
  
  // Check if off-grid on the MOVEMENT axis
  const movingAxisVal = dx !== 0 ? px : py;
  const offGridOnMoveAxis = movingAxisVal % 1 !== 0;
  
  let nx, ny;
  if (offGridOnMoveAxis) {
    // Off-grid on movement axis — half step to re-align
    nx = px + dx * half; ny = py + dy * half;
  } else {
    // On-grid — try full step first
    nx = px + dx; ny = py + dy;
  }
  
  // Bounds check — trigger screen transition if neighbour exists
  // Only check from full tile positions (round to nearest tile for bounds)
  const bnx = Math.floor(nx), bny = Math.floor(ny);
  if (bnx < 0 || bnx >= state.mapW || bny < 0 || bny >= state.mapH) {
    if (state.transitioning) return;
    // Determine direction
    let dir = null;
    if (nx < 0) dir = 'w';
    else if (nx >= state.mapW) dir = 'e';
    else if (ny < 0) dir = 'n';
    else if (ny >= state.mapH) dir = 's';
    // Find neighbour
    if (dir && ldtkData && currentLevelId) {
      const curLevel = ldtkData.levels.find(l => l.iid === currentLevelId);
      if (curLevel) {
        // Filter all neighbours in this direction
        const nbs = (curLevel.__neighbours || []).filter(n => n.dir === dir);
        if (nbs.length === 1) {
          doScreenTransition(nbs[0].levelIid, dir);
        } else if (nbs.length > 1) {
          // Multiple neighbours — pick the one whose world position best matches player's current position
          const playerWorldX = state.player.x * TILE + curLevel.worldX;
          const playerWorldY = state.player.y * TILE + curLevel.worldY;
          let best = nbs[0], bestDist = Infinity;
          for (const n of nbs) {
            const nl = ldtkData.levels.find(l => l.iid === n.levelIid);
            if (!nl) continue;
            // Check overlap on the perpendicular axis
            let dist;
            if (dir === 'e' || dir === 'w') {
              // Match Y axis
              const nlTop = nl.worldY;
              const nlBot = nl.worldY + nl.pxHei;
              const py = playerWorldY;
              dist = py < nlTop ? nlTop - py : py >= nlBot ? py - nlBot + 1 : 0;
            } else {
              // Match X axis
              const nlLeft = nl.worldX;
              const nlRight = nl.worldX + nl.pxWid;
              const px = playerWorldX;
              dist = px < nlLeft ? nlLeft - px : px >= nlRight ? px - nlRight + 1 : 0;
            }
            if (dist < bestDist) { bestDist = dist; best = n; }
          }
          doScreenTransition(best.levelIid, dir);
        }
      }
    }
    return;
  }
  // Collision check with adaptive step
  if (isTileBlocked(nx, ny, state.flying)) {
    if (!offGridOnMoveAxis && state.fineCollision) {
      // Full step blocked — try half step
      const halfNx = px + dx * half, halfNy = py + dy * half;
      if (!isTileBlocked(halfNx, halfNy, state.flying)) {
        nx = halfNx; ny = halfNy;
      } else {
        return;
      }
    } else {
      return;
    }
  }
  
  // Entity collision — check 1×1 box overlap
  const blocking = state.entities.find(e => {
    if (state.defeatedEnemies[e.id] || e.deathAnim) return false;
    if (e.type === 'Stream') return false; // streams don't block movement
    // Player box: (nx, ny) to (nx+1, ny+1). Entity box: (e.x, e.y) to (e.x+1, e.y+1)
    if (!(nx < e.x + 1 && nx + 1 > e.x && ny < e.y + 1 && ny + 1 > e.y)) return false;
    if (e.type === 'GroundItem') return !state.openedChests[e.id] && e.id !== state.groundItemPassthrough; // block until picked up (or passed through)
    return true;
  });
  if (blocking) {
    state.facing = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
    // Enemies trigger combat on contact (no Z needed)
    if (blocking.type !== 'Chest') {
      handleEntityContact(blocking);
    }
    return;
  }
  
  // Start movement
  state.wasWalking = !keys['Shift'];
  state.moving = true;
  state.moveTimer = 0;
  // Momentum: blend toward target duration instead of snapping (prevents Shift-spam jitter)
  const targetDuration = getMoveDuration();
  state.currentMoveDuration += (targetDuration - state.currentMoveDuration) * 0.4;
  state.lockedMoveDuration = Math.round(state.currentMoveDuration);
  state.moveFrom.x = state.player.x;
  state.moveFrom.y = state.player.y;
  // Scale duration by step size (half step = half duration)
  const stepSize = Math.max(Math.abs(nx - px), Math.abs(ny - py));
  state.moveStepScale = stepSize; // store for duration scaling
  // Leave a footstep at the position we're leaving
  state.footsteps.push({ x: state.moveFrom.x, y: state.moveFrom.y, time: performance.now(), side: state.footsteps.length % 2 });
  if (state.footsteps.length > 12) state.footsteps.shift();
  state.player.x = nx;
  state.player.y = ny;
  // Track total steps for weapon transformations
  if (!state.player.totalSteps) state.player.totalSteps = 0;
  state.player.totalSteps++;
  // Track per-item steps for inventory items
  if (!state.itemSteps) state.itemSteps = {};
  for (const item of (state.inventory || [])) {
    if (WEAPON_TRANSFORMATIONS[item]) {
      state.itemSteps[item] = (state.itemSteps[item] || 0) + 1;
    }
  }
  checkWeaponTransformations();
  // Only play footstep if a direction key is currently held
  if (keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown']) {
    playFootstep();
  }
}

const MOVE_DURATION = 230; // ms for grid movement
const RUN_DURATION = 130; // ms for running (Shift held)
function getMoveDuration() { return keys['Shift'] ? RUN_DURATION : MOVE_DURATION; }
let lastFrameTime = 0;
let frameDt = 1 / 60; // delta time in seconds, global for frame-rate-independent updates

function handleMovement(now) {
  const dtMs = lastFrameTime ? Math.min(now - lastFrameTime, 50) : 16; // cap to avoid jumps on tab-back
  frameDt = dtMs / 1000; // seconds
  lastFrameTime = now;
  const dt = dtMs; // keep local ms dt for existing movement code

  // Block movement during weapon transform prompt
  if (state.weaponTransformPrompt) return;

  // Fly transition animations (takeoff / landing)
  if (state.flyTransition) {
    const ft = state.flyTransition;
    const elapsed = now - ft.startTime;
    if (elapsed >= ft.duration) {
      if (ft.type === 'takeoff') {
        state.flying = true;
        state.flyX = ft.originX;
        state.flyY = ft.originY;
        state.flyVx = 0;
        state.flyVy = 0;
        state.flyBobTimer = 0;
      } else if (ft.type === 'landing') {
        state.flying = false;
        state.player.x = ft.targetX;
        state.player.y = ft.targetY;
        state.flyX = 0;
        state.flyY = 0;
        // Check for GroundItem at landing tile — auto-trigger pickup
        const lx = ft.targetX, ly = ft.targetY;
        const landItem = state.entities.find(e => e.type === 'GroundItem' && !state.openedChests[e.id] &&
          Math.floor(lx) === Math.floor(e.x) && Math.floor(ly) === Math.floor(e.y));
        if (landItem) {
          const item = landItem.fields.Item || 'Unknown';
          playChestOpen();
          state.chestInteraction = { step: 'reveal', item: item, entityId: landItem.id, isGroundItem: true };
        }
        // Landing dust puff
        for (let d = 0; d < 8; d++) {
          const angle = (d / 8) * Math.PI * 2;
          state.burnParticles.push({
            x: ft.targetX + 0.5 + Math.cos(angle) * 0.3,
            y: ft.targetY + 0.8 + Math.sin(angle) * 0.15,
            vx: Math.cos(angle) * 0.3,
            vy: Math.sin(angle) * 0.1 - 0.1,
            life: 1.0, initialLife: 1.0, size: 2, dust: true
          });
        }
      }
      // Restore original facing
      const dirs = ['down', 'left', 'up', 'right'];
      state.facing = dirs[ft.startFacing || 0];
      state.flyTransition = null;
    } else {
      // Cycle facing — fast spins that decelerate, then hold final facing
      const ft2 = state.flyTransition;
      const t2 = Math.min(1, (now - ft2.startTime) / ft2.duration);
      const dirs = ['down', 'left', 'up', 'right'];
      const startIdx = ft2.startFacing || 0;
      // Spin fills first 75% of duration, last 25% holds final facing
      const spinT = Math.min(1, t2 / 0.75);
      const eased = 1 - (1 - spinT) * (1 - spinT) * (1 - spinT);
      const totalSteps = 12; // 3 full rotations — ends back on start
      state.facing = dirs[(startIdx + Math.floor(eased * totalSteps)) % 4];
    }
    return; // block all movement during transition
  }

  // Flying mode — velocity-based 8-way movement with momentum
  if (state.flying) {
    // Block flight input during inventory/dialogue/combat
    if (state.inventoryOpen || state.dialogue || state.combat || state.combatTransition) {
      // Still apply drag so you slow to a stop
      state.flyVx *= 0.92;
      state.flyVy *= 0.92;
      if (Math.abs(state.flyVx) < 0.0001) state.flyVx = 0;
      if (Math.abs(state.flyVy) < 0.0001) state.flyVy = 0;
      state.flyX += state.flyVx * dt;
      state.flyY += state.flyVy * dt;
      state.player.x = state.flyX;
      state.player.y = state.flyY;
      state.flyBobTimer += dt;
      return;
    }
    state.flyBobTimer += dt;
    const maxSpeed = keys['Shift'] ? 0.009 : 0.006;
    const accel = 0.00003; // acceleration per ms
    const drag = 0.96; // velocity multiplier per frame (applied each tick)
    let fdx = 0, fdy = 0;
    if (keys['ArrowLeft']) { fdx -= 1; state.facing = 'left'; }
    if (keys['ArrowRight']) { fdx += 1; state.facing = 'right'; }
    if (keys['ArrowUp']) { fdy -= 1; state.facing = 'up'; }
    if (keys['ArrowDown']) { fdy += 1; state.facing = 'down'; }
    // Track pressed directions for stream current
    state.flyKeys = { up: !!keys['ArrowUp'], down: !!keys['ArrowDown'], left: !!keys['ArrowLeft'], right: !!keys['ArrowRight'] };
    // Normalize diagonal input
    if (fdx !== 0 && fdy !== 0) {
      const norm = 1 / Math.sqrt(2);
      fdx *= norm;
      fdy *= norm;
    }
    // Apply acceleration
    state.flyVx += fdx * accel * dt;
    state.flyVy += fdy * accel * dt;
    // Clamp to max speed
    const speed = Math.sqrt(state.flyVx * state.flyVx + state.flyVy * state.flyVy);
    if (speed > maxSpeed) {
      state.flyVx *= maxSpeed / speed;
      state.flyVy *= maxSpeed / speed;
    }
    // Apply drag (stronger when no input for quick-ish stop)
    const dragMul = (fdx === 0 && fdy === 0) ? 0.92 : drag;
    state.flyVx *= dragMul;
    state.flyVy *= dragMul;
    // Kill tiny velocities
    if (Math.abs(state.flyVx) < 0.0001) state.flyVx = 0;
    if (Math.abs(state.flyVy) < 0.0001) state.flyVy = 0;
    const newFlyX = state.flyX + state.flyVx * dt;
    const newFlyY = state.flyY + state.flyVy * dt;
    // Boundary check — trigger screen transition if at map edge
    if ((newFlyX < -0.5 || newFlyX >= state.mapW - 0.5 ||
         newFlyY < -0.5 || newFlyY >= state.mapH - 0.5) && !state.transitioning) {
      let dir = null;
      if (newFlyX < -0.5) dir = 'w';
      else if (newFlyX >= state.mapW - 0.5) dir = 'e';
      else if (newFlyY < -0.5) dir = 'n';
      else if (newFlyY >= state.mapH - 0.5) dir = 's';
      if (dir && typeof ldtkData !== 'undefined' && typeof currentLevelId !== 'undefined' && currentLevelId) {
        const curLevel = ldtkData.levels.find(l => l.iid === currentLevelId);
        if (curLevel) {
          const nbs = (curLevel.__neighbours || []).filter(n => n.dir === dir);
          if (nbs.length >= 1) {
            // Pick best match
            let best = nbs[0];
            if (nbs.length > 1) {
              const playerWorldX = state.flyX * 16 + curLevel.worldX;
              const playerWorldY = state.flyY * 16 + curLevel.worldY;
              let bestDist = Infinity;
              for (const n of nbs) {
                const nl = ldtkData.levels.find(l => l.iid === n.levelIid);
                if (!nl) continue;
                let dist;
                if (dir === 'e' || dir === 'w') {
                  const py = playerWorldY;
                  dist = py < nl.worldY ? nl.worldY - py : py >= nl.worldY + nl.pxHei ? py - nl.worldY - nl.pxHei + 1 : 0;
                } else {
                  const px = playerWorldX;
                  dist = px < nl.worldX ? nl.worldX - px : px >= nl.worldX + nl.pxWid ? px - nl.worldX - nl.pxWid + 1 : 0;
                }
                if (dist < bestDist) { bestDist = dist; best = n; }
              }
            }
            doScreenTransition(best.levelIid, dir);
          }
        }
      }
      return;
    }
    if (newFlyX >= -0.5 && newFlyX < state.mapW - 0.5 &&
        newFlyY >= -0.5 && newFlyY < state.mapH - 0.5) {
      state.flyX = newFlyX;
      state.flyY = newFlyY;
    }
    state.player.x = state.flyX;
    state.player.y = state.flyY;
    return;
  }

  if (state.moving) {
    state.moveTimer += dt;
    const stepScale = state.moveStepScale || 1;
    if (state.moveTimer >= (state.lockedMoveDuration || getMoveDuration()) * stepScale) {
      state.moving = false;
      // Clear GroundItem passthrough once player has moved off
      if (state.groundItemPassthrough) {
        const passEntity = state.entities.find(e => e.id === state.groundItemPassthrough);
        if (!passEntity || Math.floor(state.player.x) !== Math.floor(passEntity.x) || Math.floor(state.player.y) !== Math.floor(passEntity.y)) {
          state.groundItemPassthrough = null;
        }
      }
      state.justStartedRunning = state.wasWalking && keys['Shift'];
      // Chain movement immediately if key held — no gap between steps
      if (keys['ArrowLeft']) tryMove(-1, 0);
      else if (keys['ArrowRight']) tryMove(1, 0);
      else if (keys['ArrowUp']) tryMove(0, -1);
      else if (keys['ArrowDown']) tryMove(0, 1);
    }
    return;
  }

  if (keys['ArrowLeft']) tryMove(-1, 0);
  else if (keys['ArrowRight']) tryMove(1, 0);
  else if (keys['ArrowUp']) tryMove(0, -1);
  else if (keys['ArrowDown']) tryMove(0, 1);
}

// ══════════════════════════════════
// INTERACTION
// ══════════════════════════════════
function getFacingTile() {
  const dx = state.facing === 'left' ? -1 : state.facing === 'right' ? 1 : 0;
  const dy = state.facing === 'up' ? -1 : state.facing === 'down' ? 1 : 0;
  return { x: state.player.x + dx, y: state.player.y + dy };
}

function interact() {
  const { x, y } = getFacingTile();
  // Use AABB overlap: player facing tile is (x,y) to (x+1,y+1), entity is (e.x,e.y) to (e.x+1,e.y+1)
  let entity = state.entities.find(e => !state.defeatedEnemies[e.id] && x < e.x + 1 && x + 1 > e.x && y < e.y + 1 && y + 1 > e.y);
  // While flying, also check tile directly below player for GroundItems
  if (!entity && state.flying) {
    const px = Math.floor(state.flyX), py = Math.floor(state.flyY);
    entity = state.entities.find(e => e.type === 'GroundItem' && !state.openedChests[e.id] &&
      px === Math.floor(e.x) && py === Math.floor(e.y));
  }
  if (entity) {
    handleEntityContact(entity);
  }
}

// Enemy dialogue — cycles through on each encounter
// Load enemy dialogue from editor data (localStorage or Firebase)
function loadEditorDialogue() {
  try {
    const editorData = JSON.parse(localStorage.getItem('matrimony_editor_data'));
    if (editorData && editorData.enemies) {
      const dialogueMap = {};
      for (const enemy of editorData.enemies) {
        if (enemy.dialogue && enemy.dialogue.length > 0) {
          dialogueMap[enemy.sprite] = enemy.dialogue.map(encounter => {
            const parts = encounter.split('|').map(s => s.trim()).filter(Boolean);
            return parts.map((text, i) => ({
              speaker: i % 2 === 0 ? enemy.name : 'You',
              text: text
            }));
          });
        }
      }
      return dialogueMap;
    }
  } catch(e) {}
  return {};
}
let ENEMY_DIALOGUE = loadEditorDialogue();
if (!state.encounterCounts) state.encounterCounts = {};

function handleEntityContact(entity) {
  if (state.weaponTransformPrompt) return; // don't start combat during transform prompt
  if (entity.type === 'Stream') return; // stream entities are visual only
  if (entity.type === 'GroundItem') {
    if (!state.openedChests[entity.id]) {
      const item = entity.fields.Item || 'Unknown';
      playChestOpen();
      state.chestInteraction = { step: 'reveal', item: item, entityId: entity.id, isGroundItem: true };
    }
    return;
  }
  const data = ENEMY_DATA[entity.type];
  if (data) {
    const dialogues = ENEMY_DIALOGUE[entity.type];
    if (dialogues) {
      const count = state.encounterCounts[entity.type] || 0;
      const lines = dialogues[Math.min(count, dialogues.length - 1)];
      state.encounterCounts[entity.type] = count + 1;
      state.dialogueQueue = lines.slice(1).map(l => ({ speaker: l.speaker, text: l.text, portrait: l.speaker === 'You' ? 'player' : entity.type }));
      state.pendingCombat = { entity, data };
      showDialogue(lines[0].speaker, lines[0].text, lines[0].speaker === 'You' ? 'player' : entity.type);
    } else {
      startCombat(entity, data);
    }
  } else if (entity.type === 'Chest') {
    if (!state.openedChests[entity.id]) {
      const item = entity.fields.Item || 'Shortbow';
      playChestOpen();
      state.chestInteraction = { step: 'reveal', item: item, entityId: entity.id };
    } else {
      showDialogue('', 'The chest is empty.');
    }
  } else if (entity.type === 'GroundItem') {
    if (!state.openedChests[entity.id]) {
      const item = entity.fields.Item || 'Unknown';
      playChestOpen();
      state.chestInteraction = { step: 'reveal', item: item, entityId: entity.id, isGroundItem: true };
    }
  } else {
    showDialogue('', 'Nothing happens.');
  }
}


// Mouse state for combat menu
const mouse = { x: 0, y: 0 };
canvas.addEventListener('wheel', (e) => {
  if (state.showFontTest) { e.preventDefault(); if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) { state.fontTestScrollX += (e.deltaX || e.deltaY) > 0 ? 10 : -10; state.fontTestScrollX = Math.max(0, Math.min(state.fontTestScrollX, state.fontTestContentW || 0)); } else { state.fontTestScroll += e.deltaY > 0 ? 10 : -10; state.fontTestScroll = Math.max(0, Math.min(state.fontTestScroll, Math.max(0, state.fontTestContentH - (canvas.height - 24)))); } }
}, { passive: false });
canvas.addEventListener('mousedown', (e) => {
  if (!state.showFontTest) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);
  // Check if click is near scrollbar area (right 12px of panel)
  if (mx >= canvas.width - 22) {
    state.fontTestDragging = true;
    state.fontTestDragStartY = my;
    state.fontTestDragStartScroll = state.fontTestScroll;
  }
});
canvas.addEventListener('mousemove', (e) => {
  if (!state.fontTestDragging) return;
  const rect = canvas.getBoundingClientRect();
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);
  const panelH = canvas.height - 24;
  const contentH = state.fontTestContentH;
  const maxScroll = Math.max(0, contentH - panelH);
  const dragRatio = (my - state.fontTestDragStartY) / panelH;
  state.fontTestScroll = Math.max(0, Math.min(maxScroll, state.fontTestDragStartScroll + dragRatio * contentH));
});
document.addEventListener('mouseup', () => { state.fontTestDragging = false; });
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
});
canvas.addEventListener('click', (e) => {
  if (state.screen === 'splash') {
    const actx = getAudioCtx();
    if (actx) actx.resume();
    if (!titleMusicStarted) {
      titleMusic.play().then(() => { titleMusicStarted = true; }).catch(() => {});
    }
    state.screen = 'title';
    return;
  }
  if (state.screen === 'title' && !titleMusicStarted) {
    titleMusic.play().then(() => { titleMusicStarted = true; }).catch(() => {});
  }
  if (!state.combat) return;
  const c = state.combat;
  
  if (c.phase === 'target') {
    // Click on enemy in arena to confirm target
    c.phase = 'action';
    c.selectedAction = 0;
    return;
  }
  
  if (c.phase === 'action') {
    const actions = c.actions || [];
    const W = canvas.width;
    const H = canvas.height;
    const topH = Math.round(H * 0.10);
    const arenaH = Math.round(H * 0.42);
    const botContentY = topH + arenaH;
    const botH = H - botContentY;
    const pad = 8;
    const portraitH = Math.round(topH * 0.7) - 8;
    const portraitW = Math.round(portraitH * 2.5);
    const pPortraitY = botContentY + pad + 2;
    const portraitCenterY = pPortraitY + Math.round(portraitH / 2);
    const gridX = pad + 12 + portraitW + 16;
    const gridRowH = 20;
    const gridTotalH = 4 * gridRowH;
    const gridY = portraitCenterY - Math.round(gridTotalH / 2);
    const colW = Math.round((W - gridX - 16) / 2);
    for (let i = 0; i < actions.length && i < 8; i++) {
      const col = i < 4 ? 0 : 1;
      const row = i < 4 ? i : i - 4;
      const ax = gridX + col * colW;
      const ay = gridY + row * gridRowH;
      if (mouse.x >= ax && mouse.x <= ax + colW && mouse.y >= ay && mouse.y <= ay + gridRowH) {
        c.selectedAction = i;
        c.firstAttackDone = true;
        c.attackText = actions[i];
        break;
      }
    }
  }
});

function handleChestInput(key) {
  const ci = state.chestInteraction;
  if (!ci) return false;

  if (ci.step === 'reveal') {
    if (key === 'z' || key === 'Z' || key === 'x' || key === 'X') {
      ci.step = 'stats';
      return true;
    }
  } else if (ci.step === 'stats') {
    if (key === 'z' || key === 'Z') {
      // Take it
      if (state.inventory.length >= 8) {
        ci.step = 'inventoryFull';
        ci.selectedSlot = 0;
      } else {
        state.inventory.push(ci.item);
        state.openedChests[ci.entityId] = true;
        state.chestInteraction = null;
      }
      return true;
    }
    if (key === 'x' || key === 'X') {
      // Leave it — close without taking
      // If standing on this GroundItem, mark it pass-through until player steps off
      if (ci.isGroundItem) {
        state.groundItemPassthrough = ci.entityId;
      }
      state.chestInteraction = null;
      return true;
    }
  } else if (ci.step === 'inventoryFull') {
    const items = getInventoryActions();
    const sel = ci.selectedSlot || 0;
    const numItems = items.length;
    const row = Math.floor(sel / 2);
    const col = sel % 2;
    if (key === 'ArrowUp') { const nr = row - 1; if (nr >= 0) { const ni = nr * 2 + col; ci.selectedSlot = ni < numItems ? ni : sel; } return true; }
    if (key === 'ArrowDown') { const nr = row + 1; const ni = nr * 2 + col; ci.selectedSlot = ni < numItems ? ni : sel; return true; }
    if (key === 'ArrowLeft') { if (col === 1) { ci.selectedSlot = row * 2; } return true; }
    if (key === 'ArrowRight') { if (col === 0) { const ni = row * 2 + 1; ci.selectedSlot = ni < numItems ? ni : sel; } return true; }
    if (key === 'z' || key === 'Z') {
      ci.step = 'confirmDrop';
      return true;
    }
    if (key === 'x' || key === 'X') {
      // Cancel — go back to stats
      ci.step = 'stats';
      return true;
    }
  } else if (ci.step === 'confirmDrop') {
    if (key === 'z' || key === 'Z') {
      // Drop the selected item, take the new one
      const items = getInventoryActions();
      const dropItem = items[ci.selectedSlot || 0];
      // Remove from inventory
      const invIdx = state.inventory.indexOf(dropItem);
      if (invIdx >= 0) state.inventory.splice(invIdx, 1);
      // Remove from actionOrder
      if (state.actionOrder) {
        const aoIdx = state.actionOrder.indexOf(dropItem);
        if (aoIdx >= 0) state.actionOrder.splice(aoIdx, 1);
      }
      // Add new item
      state.inventory.push(ci.item);
      state.openedChests[ci.entityId] = true;
      state.chestInteraction = null;
      return true;
    }
    if (key === 'x' || key === 'X') {
      ci.step = 'inventoryFull';
      return true;
    }
  }
  return false;
}
