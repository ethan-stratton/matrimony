// ══════════════════════════════════
// COMBAT SYSTEM
// ══════════════════════════════════
// COMBAT AI
// ══════════════════════════════════
function pickEnemyAction(c) {
  const enemyData = ENEMY_DATA[c.enemy.type];
  const actions = enemyData?.actions || ['Stand Still'];

  // If last action was Charging, must follow up with the big attack
  if (c.enemyAction === 'Charging...') {
    // Find the highest-eff action available (Fire Punch, Frost Slam, etc.)
    let bigHit = null, bigEff = 0;
    for (const name of actions) {
      const act = COMBAT_ACTIONS[name] || {};
      if ((act.eff || 0) > bigEff) { bigHit = name; bigEff = act.eff; }
    }
    if (bigHit) { c.enemyActionIndex++; return bigHit; }
  }

  // Default AI: cycle sequentially
  if (enemyData?.ai !== 'smart') {
    const action = actions[c.enemyActionIndex % actions.length];
    c.enemyActionIndex++;
    return action;
  }

  // Smart AI: knows player's queued action (except first turn)
  const playerAction = c.attackText;
  const playerAct = COMBAT_ACTIONS[playerAction || ''] || {};
  const playerWait = c.waitCountdown || 0;

  // Score each possible action
  let bestAction = actions[0];
  let bestScore = -Infinity;

  for (const name of actions) {
    const act = COMBAT_ACTIONS[name] || {};
    let score = 0;

    // If player is using a high-eff attack that will land soon, go defensive
    if ((playerAct.eff || 0) >= 8 && playerWait <= 5 && (act.def || 0) >= 8) {
      score += 30 + (act.def || 0); // strongly prefer guarding
    }

    // If player is vulnerable (low def AND long wait), punish hard with biggest damage
    if ((playerAct.def || 0) <= 2 && (playerAct.wait || 0) >= 8 && (act.eff || 0) > 0) {
      score += 25 + (act.eff || 0) * 2; // go all-in on damage
    }

    // If player is defending (high def, low eff), use pierce to bypass
    if ((playerAct.def || 0) >= 6 && act.pierce) {
      score += 25;
    }

    // If player is defending, don't use a big non-pierce attack (it'll get blocked)
    if ((playerAct.def || 0) >= 6 && (act.eff || 0) > 0 && !act.pierce) {
      score -= (playerAct.def || 0) * 2;
    }

    // Damage potential (consider pierce)
    if (act.eff > 0) {
      const dmg = act.pierce ? act.eff : Math.max(0, act.eff - (playerAct.def || 0));
      score += dmg * 2;
    }

    // Prefer faster moves slightly (lower wait = resolves sooner)
    score -= (act.wait || 0) * 0.5;

    // Stun value — delaying the player is always useful
    if (act.stun) {
      score += act.stun * 3;
    }

    // Charging provides some defense while building up
    if (name === 'Charging...' && (act.def || 0) > 0) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestAction = name;
    }
  }

  c.enemyActionIndex++;
  return bestAction;
}

// ══════════════════════════════════
let ENEMY_DATA = {};

// Battle music
const battleMusic = new Audio('assets/audio/battle.mp3');
battleMusic.loop = true;
battleMusic.volume = 0.30;

// Title music
const titleMusic = new Audio('assets/audio/title.mp3');
titleMusic.loop = true;
titleMusic.volume = 0.7;
let titleMusicStarted = false;

function startCombat(entity, enemyStats) {
  playBattleStart();
  state.screenFlash = { startTime: performance.now(), duration: 300 };
  battleMusic.currentTime = 0;
  battleMusic.play().catch(() => {});
  // Dismiss any weapon transform prompt
  state.weaponTransformPrompt = null;
  state.combat = {
    enemy: entity,
    enemyName: enemyStats.name || entity.type,
    enemySprite: entity.type,
    enemyHp: enemyStats.maxHp,
    enemyMaxHp: enemyStats.maxHp,
    enemyDisplayHp: enemyStats.maxHp,
    enemyEff: enemyStats.eff,
    enemyDef: enemyStats.def,
    enemyWait: enemyStats.wait,
    playerHp: 30,
    playerMaxHp: 30,
    playerEff: 10,
    playerDef: 2,
    playerWait: 0,
    attackText: '',
    startTime: performance.now(),
    slideInDuration: 500,
    phase: 'action', // skip target phase — single enemy, go straight to action select
    targetSelf: false,
    selectedEnemy: 0,
    actions: getInventoryActions(),
    selectedAction: 0,
    waitCountdown: -1, // player wait: -1 = not counting, >=0 = ticking down
    waitTickSpeed: 240, // ms per tick
    lastWaitTick: 0,
    waitAccumulator: 0, // accumulator for precise ticking
    waiting: false, // true while player wait is counting down
    // Enemy action state
    enemyAction: null, // name of enemy's chosen action
    enemyWaitCountdown: -1,
    enemyWaiting: false,
    enemyActionIndex: 1, // start at 1 because we set initial action to index 0 (Charging)
    // Attack animation
    playerAttackAnim: null, // { startTime, duration, phase: 'rush'|'hit'|'return' }
    enemyAttackAnim: null, // enemy rush toward player animation
    enemyActionRevealed: false, // enemy action visible after first exchange
    lastInputTime: performance.now(), // track idle for Esc hint
  };
  // Enemy always starts with first action (Charging for Fire Elemental)
  const c = state.combat;
  const initialActions = ENEMY_DATA[c.enemy.type]?.actions || ['Stand Still'];
  c.enemyAction = initialActions[0];
  const initAct = COMBAT_ACTIONS[c.enemyAction] || {};
  c.enemyWaitCountdown = initAct.wait || 5;
  c.enemyWaiting = true;
  c.lastEnemyWaitTick = performance.now();
}

function exitCombat(ranAway) {
  const enemy = state.combat.enemy;
  battleMusic.pause();
  battleMusic.currentTime = 0;
  if (ranAway && enemy) {
    // Mark enemy as fled — disappears until level re-entry
    state.defeatedEnemies[enemy.id] = true;
    // Start a quick fade-out (no flash, just fade)
    const ent = state.entities.find(e => e.id === enemy.id);
    if (ent) {
      ent.deathAnim = { startTime: performance.now() - 1200 }; // Skip flash phase, go straight to fade
    }
  }
  state.combat = null;
}

// Weapon transformations — conditions and effects
const WEAPON_TRANSFORMATIONS = {
  'Shortbow': { condition: 'steps', threshold: 50, newName: 'Shortbow ★', effect: 'pierce1', pierceVal: 1, description: 'Walk 10 steps with Shortbow' },
};

function checkWeaponTransformations() {
  if (!state.inventory || state.weaponTransformPrompt || state.combat || state.dialogue) return;
  if (!state.itemSteps) state.itemSteps = {};
  for (let i = 0; i < state.inventory.length; i++) {
    const item = state.inventory[i];
    const tf = WEAPON_TRANSFORMATIONS[item];
    if (!tf) continue;
    if (state.rejectedTransforms && state.rejectedTransforms[item]) continue;
    // Initialize step counter for this item if needed
    if (state.itemSteps[item] === undefined) state.itemSteps[item] = 0;
    if (tf.condition === 'steps' && state.itemSteps[item] >= tf.threshold) {
      // Register the transformed weapon stats ahead of time
      const base = COMBAT_ACTIONS[item] || {};
      COMBAT_ACTIONS[tf.newName] = { ...base, pierce: tf.pierceVal || base.pierce };
      // Show transformation prompt
      state.weaponTransformPrompt = {
        index: i,
        oldName: item,
        newName: tf.newName,
        stats: COMBAT_ACTIONS[tf.newName],
        effect: tf.effect,
        pierceVal: tf.pierceVal,
        startTime: performance.now(),
      };
      return; // only one at a time
    }
  }
}

function acceptWeaponTransform() {
  const p = state.weaponTransformPrompt;
  if (!p) return;
  state.inventory[p.index] = p.newName;
  if (state.actionOrder) {
    state.actionOrder = state.actionOrder.map(a => a === p.oldName ? p.newName : a);
  }
  state.weaponTransformPrompt = null;
}

function rejectWeaponTransform() {
  const p = state.weaponTransformPrompt;
  if (!p) return;
  // Mark as rejected so it doesn't re-trigger
  if (!state.rejectedTransforms) state.rejectedTransforms = {};
  state.rejectedTransforms[p.oldName] = true;
  state.weaponTransformPrompt = null;
}

// Combat action data
let COMBAT_ACTIONS = {};

// ── Load editor overrides from localStorage ──
function loadEditorData() {
  try {
    const ed = JSON.parse(localStorage.getItem('matrimony_editor_data'));
    if (!ed) return;
    // Override weapons/actions
    if (ed.weapons) {
      for (const w of ed.weapons) {
        if (w.name) COMBAT_ACTIONS[w.name] = { eff: w.eff||0, def: w.def||0, wait: w.wait||0, pierce: !!w.pierce, stun: w.stun||0 };
      }
    }
    // Override enemies
    if (ed.enemies) {
      for (const e of ed.enemies) {
        if (!e.sprite) continue;
        const actionNames = (e.actions||[]).map(a => {
          const name = typeof a === 'string' ? a : a.name;
          // Also register enemy action stats
          if (typeof a === 'object' && a.name) {
            COMBAT_ACTIONS[a.name] = { eff: a.eff||0, def: a.def||0, wait: a.wait||0, pierce: !!a.pierce, stun: a.stun||0 };
          }
          return name;
        });
        ENEMY_DATA[e.sprite] = {
          name: e.name || e.sprite,
          sprite: e.sprite,
          maxHp: e.maxHp || 100,
          exp: e.exp || ENEMY_DATA[e.sprite]?.exp || 0,
          actions: actionNames,
          startsWithCharge: e.startsWithCharge || false,
        };
      }
    }
    console.log('[Editor] Loaded overrides:', ed.weapons?.length, 'weapons,', ed.enemies?.length, 'enemies');
  } catch (e) { console.warn('[Editor] Failed to load:', e); }
}

