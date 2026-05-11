// ══════════════════════════════════
// CRISP TEXT RENDERING
// ══════════════════════════════════
const CRISP_THRESHOLD = 220;
const CRISP_FONT = 'RM2000';
const CRISP_FONT_ALT = 'RM2000Alt';
const CRISP_SIZE = 12;

function crispText(text, x, y, size, color, spacing, fontOverride) {
  if (!crispText._c) {
    crispText._c = document.createElement('canvas');
    crispText._ctx = crispText._c.getContext('2d', { willReadFrequently: true });
    crispText._c2 = document.createElement('canvas');
    crispText._ctx2 = crispText._c2.getContext('2d', { willReadFrequently: true });
  }
  const fs = size || CRISP_SIZE;
  const sp = spacing != null ? spacing : 0;
  const ff = fontOverride || CRISP_FONT;
  const oc = crispText._c, octx = crispText._ctx;
  const w = 700, h = fs + 8;
  oc.width = w; oc.height = h;
  octx.clearRect(0, 0, w, h);
  octx.font = fs + 'px "' + ff + '"';
  octx.textAlign = 'left'; octx.textBaseline = 'top';
  octx.fillStyle = '#ffffff';
  let tx = 2;
  for (let i = 0; i < text.length; i++) { octx.fillText(text[i], tx, 2); tx += octx.measureText(text[i]).width + sp; }
  const imgData = octx.getImageData(0, 0, tx + 2, h);
  for (let i = 3; i < imgData.data.length; i += 4) imgData.data[i] = imgData.data[i] >= CRISP_THRESHOLD ? 255 : 0;
  octx.putImageData(imgData, 0, 0);
  octx.globalCompositeOperation = 'source-atop';
  octx.fillStyle = color || '#e8e0d0';
  octx.fillRect(0, 0, tx + 2, h);
  octx.globalCompositeOperation = 'source-over';
  const sc = crispText._c2, sctx = crispText._ctx2;
  sc.width = w; sc.height = h;
  sctx.clearRect(0, 0, w, h);
  sctx.font = fs + 'px "' + ff + '"';
  sctx.textAlign = 'left'; sctx.textBaseline = 'top';
  sctx.fillStyle = '#ffffff';
  let stx = 2;
  for (let i = 0; i < text.length; i++) { sctx.fillText(text[i], stx, 2); stx += sctx.measureText(text[i]).width + sp; }
  const sData = sctx.getImageData(0, 0, stx + 2, h);
  for (let i = 3; i < sData.data.length; i += 4) sData.data[i] = sData.data[i] >= CRISP_THRESHOLD ? 255 : 0;
  for (let i = 0; i < sData.data.length; i += 4) { sData.data[i] = 0; sData.data[i+1] = 0; sData.data[i+2] = 0; }
  sctx.putImageData(sData, 0, 0);
  ctx.drawImage(sc, 0, 0, stx + 2, h, x + 2, y + 2, stx + 2, h);
  ctx.drawImage(oc, 0, 0, tx + 2, h, x, y, tx + 2, h);
  return tx;
}

function crispGradientText(text, x, y, size, stops, spacing, fontOverride) {
  if (!crispGradientText._c) {
    crispGradientText._c = document.createElement('canvas');
    crispGradientText._ctx = crispGradientText._c.getContext('2d', { willReadFrequently: true });
    crispGradientText._c2 = document.createElement('canvas');
    crispGradientText._ctx2 = crispGradientText._c2.getContext('2d', { willReadFrequently: true });
  }
  const fs = size || CRISP_SIZE;
  const sp = spacing != null ? spacing : 0;
  const ff = fontOverride || CRISP_FONT;
  const oc = crispGradientText._c, octx = crispGradientText._ctx;
  const w = 700, h = fs + 8;
  oc.width = w; oc.height = h;
  octx.clearRect(0, 0, w, h);
  octx.font = fs + 'px "' + ff + '"';
  octx.textAlign = 'left'; octx.textBaseline = 'top';
  octx.fillStyle = '#ffffff';
  let tx = 2;
  for (let i = 0; i < text.length; i++) { octx.fillText(text[i], tx, 2); tx += octx.measureText(text[i]).width + sp; }
  const imgData = octx.getImageData(0, 0, tx + 2, h);
  for (let i = 3; i < imgData.data.length; i += 4) imgData.data[i] = imgData.data[i] >= CRISP_THRESHOLD ? 255 : 0;
  octx.putImageData(imgData, 0, 0);
  octx.globalCompositeOperation = 'source-atop';
  const grad = octx.createLinearGradient(0, 0, 0, h);
  for (const [pos, col] of stops) grad.addColorStop(pos, col);
  octx.fillStyle = grad;
  octx.fillRect(0, 0, tx + 2, h);
  octx.globalCompositeOperation = 'source-over';
  const sc = crispGradientText._c2, sctx = crispGradientText._ctx2;
  sc.width = w; sc.height = h;
  sctx.clearRect(0, 0, w, h);
  sctx.font = fs + 'px "' + ff + '"';
  sctx.textAlign = 'left'; sctx.textBaseline = 'top';
  sctx.fillStyle = '#ffffff';
  let stx = 2;
  for (let i = 0; i < text.length; i++) { sctx.fillText(text[i], stx, 2); stx += sctx.measureText(text[i]).width + sp; }
  const sData = sctx.getImageData(0, 0, stx + 2, h);
  for (let i = 3; i < sData.data.length; i += 4) sData.data[i] = sData.data[i] >= CRISP_THRESHOLD ? 255 : 0;
  for (let i = 0; i < sData.data.length; i += 4) { sData.data[i] = 0; sData.data[i+1] = 0; sData.data[i+2] = 0; }
  sctx.putImageData(sData, 0, 0);
  ctx.drawImage(sc, 0, 0, stx + 2, h, x + 2, y + 2, stx + 2, h);
  ctx.drawImage(oc, 0, 0, tx + 2, h, x, y, tx + 2, h);
  return tx;
}

const GOLD_GRADIENT = [[0, '#f0d060'], [0.4, '#ffe8a0'], [0.6, '#ffe8a0'], [1, '#c89830']];

// Draw a gold gradient outline rect
function drawGoldOutline(x, y, w, h, thickness) {
  const t = thickness || 3;
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, '#f0d060');
  grad.addColorStop(0.3, '#ffe8a0');
  grad.addColorStop(0.7, '#ffe8a0');
  grad.addColorStop(1, '#c89830');
  ctx.strokeStyle = grad;
  ctx.lineWidth = t;
  ctx.strokeRect(x, y, w, h);
}

function getInventoryActions() {
  // All combat actions come from inventory — no innate moves
  const items = state.inventory || [];
  if (state.actionOrder) {
    // Filter out any actions no longer in inventory, preserve order
    return state.actionOrder.filter(a => items.includes(a));
  }
  return [...items];
}

function drawInventory() {
  const W = canvas.width;
  const H = canvas.height;
  const now = performance.now();
  
  const topH = Math.round(H * 0.16);
  const botContentY = Math.round(H * 0.52);
  const botH = H - botContentY;
  const portraitH = Math.round(topH * 0.42);
  const portraitW = Math.round(portraitH * 3.5);
  const pad = 8;
  
  // ── TOP BAR (semi-transparent, no opaque arena) ──
  ctx.fillStyle = 'rgba(8, 8, 14, 0.90)';
  ctx.fillRect(0, 0, W, topH);
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, topH - 0.5); ctx.lineTo(W, topH - 0.5); ctx.stroke();
  
  // EXP display
  crispText('EXP: ' + (state.player.exp || 0), pad + 8, Math.round(topH / 2) - 10, 32, '#e8e0d0', 0, CRISP_FONT_ALT);
  crispText('Shift : Save', W - pad - 170, Math.round(topH / 2) - 10, 32, '#8c828c', 0, CRISP_FONT_ALT);
  
  // ── BOTTOM BAR ──
  ctx.fillStyle = 'rgba(8, 8, 14, 0.90)';
  ctx.fillRect(0, botContentY, W, botH);
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, botContentY + 0.5); ctx.lineTo(W, botContentY + 0.5); ctx.stroke();
  
  // Player portrait
  const pPortraitX = pad + 20;
  const pPortraitY = botContentY + pad + 2;
  ctx.fillStyle = '#0c0c14';
  ctx.fillRect(pPortraitX, pPortraitY, portraitW, portraitH);
  drawGoldOutline(pPortraitX, pPortraitY, portraitW, portraitH, 3);
  if (getPlayerSheet().loaded) {
    const anim = getPlayerSheet().anims['idle_down'];
    ctx.save();
    ctx.beginPath();
    ctx.rect(pPortraitX + 1, pPortraitY + 1, portraitW - 2, portraitH - 2);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    const pDrawSize = Math.round(portraitW * 0.7);
    const pdx = pPortraitX + 1 + Math.round((portraitW - 2 - pDrawSize) / 2);
    const pdy = pPortraitY + 1 + Math.round((portraitH - 2 - pDrawSize) / 2);
    ctx.drawImage(getPlayerSheet().img, 0, anim.row * getPlayerSheet().frameH, getPlayerSheet().frameW, getPlayerSheet().frameH,
      pdx, pdy, pDrawSize, pDrawSize);
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
  }
  
  // HP below portrait
  crispText('HP 30/30', pPortraitX + 12, pPortraitY + portraitH + 4, 32, '#e8e0d0', 0, CRISP_FONT_ALT);
  
  // Equipment slots below HP — aligned with portrait
  const equipY = pPortraitY + portraitH + 42;
  const equipSlotW = portraitW;
  const equipSlotH = 28;
  const equipSpacing = 10;
  for (let i = 0; i < 2; i++) {
    const ey = equipY + i * (equipSlotH + equipSpacing);
    const equipped = (state.equipment && state.equipment[i]) || null;
    const isEquipHovered = mouse.x >= pPortraitX && mouse.x <= pPortraitX + equipSlotW && mouse.y >= ey && mouse.y <= ey + equipSlotH;
    // Background
    ctx.fillStyle = 'rgba(12, 12, 20, 0.6)';
    ctx.fillRect(pPortraitX, ey, equipSlotW, equipSlotH);
    // Gold border (brighter than other elements)
    const borderPulse = 0.5 + 0.2 * Math.sin(now / 500);
    ctx.strokeStyle = 'rgba(208, 168, 48,' + borderPulse + ')';
    ctx.lineWidth = 2;
    ctx.strokeRect(pPortraitX, ey, equipSlotW, equipSlotH);
    // Hover/highlight effect — stronger than regular items
    if (isEquipHovered) {
      const ePulse = 0.20 + 0.12 * Math.sin(now / 250);
      ctx.fillStyle = 'rgba(200, 170, 50,' + ePulse + ')';
      ctx.fillRect(pPortraitX + 1, ey, equipSlotW - 2, 1);
      ctx.fillRect(pPortraitX, ey + 1, equipSlotW, equipSlotH - 2);
      ctx.fillRect(pPortraitX + 1, ey + equipSlotH - 1, equipSlotW - 2, 1);
      // Inner glow
      ctx.shadowColor = '#d4a830';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = 'rgba(212, 168, 48, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(pPortraitX + 2, ey + 2, equipSlotW - 4, equipSlotH - 4);
      ctx.shadowBlur = 0;
    }
    const label = equipped || (i === 0 ? 'Slot 1' : 'Slot 2');
    crispText(label, pPortraitX + 6, ey + 2, 24, equipped ? '#e8e0d0' : '#706050', 0, CRISP_FONT_ALT);
  }
  
  // ── ACTION/ITEM GRID ──
  const gridX = pPortraitX + portraitW + 48;
  const gridRowH = 34;
  const gridY = pPortraitY;
  const colW = Math.round((W - gridX - 24) / 2);
  const items = getInventoryActions();
  
  // Mouse hover
  let hovered = -1;
  if (!state.inventorySubMenu) {
    for (let i = 0; i < items.length && i < 8; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ax = gridX + col * colW;
      const ay = gridY + row * gridRowH;
      if (mouse.x >= ax && mouse.x <= ax + colW && mouse.y >= ay && mouse.y <= ay + gridRowH) {
        hovered = i;
      }
    }
    if (hovered >= 0) state.inventorySelected = hovered;
  }
  
  for (let i = 0; i < items.length && i < 8; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ax = gridX + col * colW;
    const ay = gridY + row * gridRowH;
    const isSelected = !state.inventorySubMenu && i === (state.inventorySelected || 0);
    const isOrderSource = state.inventoryOrdering !== undefined && i === state.inventoryOrdering;
    
    if (isOrderSource) {
      // Highlight source item in gold
      ctx.fillStyle = 'rgba(200, 160, 40, 0.25)';
      ctx.fillRect(ax + 4, ay, colW - 4, gridRowH);
    } else if (isSelected) {
      const hx = ax + 4;
      const hy = ay;
      const hw = colW - 4;
      const hh = gridRowH;
      const pulse = 0.14 + 0.08 * Math.sin(now / 300);
      ctx.fillStyle = 'rgba(80, 200, 60,' + pulse + ')';
      ctx.fillRect(hx + 1, hy, hw - 2, 1);
      ctx.fillRect(hx, hy + 1, hw, hh - 2);
      ctx.fillRect(hx + 1, hy + hh - 1, hw - 2, 1);
    }
    
    crispText(items[i], ax + 2, ay + 2, 32, '#ffffff');
  }
  
  // Selected item stats — aligned with action grid
  const sel = state.inventorySelected || 0;
  if (sel < items.length) {
    const act = COMBAT_ACTIONS[items[sel]] || {};
    const numRows = 4; // always reserve space for 8 slots (4 rows × 2 cols)
    const statsY = gridY + numRows * gridRowH + 4;
    let sx = gridX;
    const STAT_GRADIENT = [[0, '#8a6010'], [0.2, '#c89830'], [0.4, '#ffe8a0'], [0.5, '#fffff0'], [0.6, '#ffe8a0'], [0.8, '#c89830'], [1, '#8a6010']];
    const pad3 = (n) => String(n).padStart(3, ' ');
    sx += crispGradientText('Eff:', sx, statsY, 32, STAT_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    sx += crispText(pad3(act.eff || 0), sx, statsY, 32, '#e8e0d0', 0, CRISP_FONT_ALT) + 12;
    sx += crispGradientText('Def:', sx, statsY, 32, STAT_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    sx += crispText(pad3(act.def || 0), sx, statsY, 32, '#e8e0d0', 0, CRISP_FONT_ALT) + 12;
    sx += crispGradientText('Wait:', sx, statsY, 32, STAT_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    sx += crispText(pad3(act.wait || 0), sx, statsY, 32, '#e8e0d0', 0, CRISP_FONT_ALT) + 12;
    
    // Attack type tag (e.g. "Guard" for Defend) and Pierce — same line after Wait
    const ACTION_TAGS = { 'Defend': 'Guard' };
    const tag = ACTION_TAGS[items[sel]];
    if (tag) {
      sx += crispText(tag, sx, statsY, 32, '#a0c8ff', 0, CRISP_FONT_ALT) + 12;
    }
    // Pierce stat with special shimmer gradient
    if (act.pierce) {
      const PIERCE_GRADIENT = [[0, '#40a0d0'], [0.2, '#60d0ff'], [0.35, '#a0f0ff'], [0.5, '#ffffff'], [0.65, '#a0f0ff'], [0.8, '#60d0ff'], [1, '#40a0d0']];
      if (act.pierce === true) {
        sx += crispGradientText('Pierce', sx, statsY, 32, PIERCE_GRADIENT, 0, CRISP_FONT_ALT) + 12;
      } else {
        sx += crispGradientText('Pierce', sx, statsY, 32, PIERCE_GRADIENT, 0, CRISP_FONT_ALT) + 2;
        sx += crispText(String(act.pierce), sx, statsY, 32, '#a0f0ff', 0, CRISP_FONT_ALT) + 12;
      }
    }
    // Heal tag with gradient
    if (act.heal) {
      const HEAL_GRADIENT = [[0, '#20a040'], [0.2, '#40d060'], [0.35, '#80ff90'], [0.5, '#ffffff'], [0.65, '#80ff90'], [0.8, '#40d060'], [1, '#20a040']];
      sx += crispGradientText('Heal', sx, statsY, 32, HEAL_GRADIENT, 0, CRISP_FONT_ALT) + 12;
    }
    // Stun tag with gradient
    if (act.stun) {
      const STUN_GRADIENT = [[0, '#c08000'], [0.2, '#e0a020'], [0.35, '#ffd060'], [0.5, '#ffffff'], [0.65, '#ffd060'], [0.8, '#e0a020'], [1, '#c08000']];
      sx += crispGradientText('Stun', sx, statsY, 32, STUN_GRADIENT, 0, CRISP_FONT_ALT) + 2;
      sx += crispText(String(act.stun), sx, statsY, 32, '#ffd060', 0, CRISP_FONT_ALT) + 12;
    }
    
    // Item description — two lines below stats
    const ACTION_DESCRIPTIONS = {
      'Shortbow': ['Fires an arrow.', 'Balanced ranged attack.'],
      'Shortbow ★': ['Trekking with this bow gave', 'keener insight and precision.'],
      'Rusty Shortsword': ['A worn blade, still sharp.', 'Good offense with some guard.'],
      'Buckler': ['A small but sturdy shield.', 'Brace and endure.'],
      'Thunder': ['A crackling bolt from above.', 'Pierces all armor. Slow to charge.'],
      'Supersonic': ['A disorienting sonic pulse.', 'Low damage but stuns the target.'],
      'Heal': ['Mend your wounds.', 'Restores HP equal to EFF.'],
      'Bone Throw': ['A fragment of yourself,', 'hurled with hollow conviction.'],
      'Slash!': ['A fierce follow-up strike!', 'Combo finisher.'],
    };
    const desc = ACTION_DESCRIPTIONS[items[sel]];
    if (desc) {
      const descY = statsY + 28;
      crispText(desc[0], gridX, descY, 32, '#a09888', 0, CRISP_FONT_ALT);
      if (desc[1]) crispText(desc[1], gridX, descY + 20, 32, '#a09888', 0, CRISP_FONT_ALT);
    }
  }
  
  // ── SUB-MENU (Lv Up / Order / Drop) ──
  if (state.inventorySubMenu) {
    const subOpts = ['Lv Up', 'Order', 'Drop'];
    const subX = pPortraitX;
    const subY = pPortraitY + portraitH + 26;
    const subW = portraitW + 40;
    const subRowH = 28;
    
    // Background
    ctx.fillStyle = 'rgba(8, 8, 14, 0.95)';
    ctx.fillRect(subX, subY, subW, subRowH * subOpts.length + 8);
    drawGoldOutline(subX, subY, subW, subRowH * subOpts.length + 8, 4);
    
    for (let i = 0; i < subOpts.length; i++) {
      const sy = subY + 4 + i * subRowH;
      const isSel = i === (state.inventorySubSelected || 0);
      if (isSel) {
        const subPulse = 0.14 + 0.08 * Math.sin(now / 300);
        ctx.fillStyle = 'rgba(80, 200, 60,' + subPulse + ')';
        ctx.fillRect(subX + 5, sy, subW - 10, 1);
        ctx.fillRect(subX + 4, sy + 1, subW - 8, subRowH - 2);
        ctx.fillRect(subX + 5, sy + subRowH - 1, subW - 10, 1);
      }
      crispText(subOpts[i], subX + 12, sy + 2, 32, isSel ? '#ffffff' : '#a0a0a0');
    }
    
    // Mouse hover for sub-menu
    for (let i = 0; i < subOpts.length; i++) {
      const sy = subY + 4 + i * subRowH;
      if (mouse.x >= subX && mouse.x <= subX + subW && mouse.y >= sy && mouse.y <= sy + subRowH) {
        state.inventorySubSelected = i;
      }
    }
  }
  
  // Order mode hint
  if (state.inventoryOrdering !== undefined) {
    crispText('Select swap target', pPortraitX, pPortraitY + portraitH + 26, 32, '#c8a040', 0, CRISP_FONT_ALT);
  }
  
  // Save slot picker overlay
  if (state.saveMenu) {
    const boxW = 400, boxH = 130;
    const boxX = Math.round((W - boxW) / 2);
    const boxY = Math.round((H - boxH) / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#d4a830';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    crispText('Save to:', boxX + 10, boxY + 8, 32, '#f0d060', 0, CRISP_FONT_ALT);
    for (let i = 0; i < 3; i++) {
      const sy = boxY + 32 + i * 30;
      const info = getSaveInfo(i);
      const label = info ? 'Slot ' + (i + 1) + ' - ' + info.location : 'Slot ' + (i + 1) + ' - Empty';
      if (i === state.saveMenu.selected) {
        const savePulse = 0.20 + 0.10 * Math.sin(now / 300);
        ctx.fillStyle = 'rgba(80, 200, 60,' + savePulse + ')';
        ctx.fillRect(boxX + 5, sy - 2, boxW - 10, 1);
        ctx.fillRect(boxX + 4, sy - 1, boxW - 8, 24);
        ctx.fillRect(boxX + 5, sy + 22, boxW - 10, 1);
      }
      crispText(label, boxX + 14, sy, 32, i === state.saveMenu.selected ? '#ffffff' : '#a0a0a0', 0, CRISP_FONT_ALT);
    }
  }
}

// ══════════════════════════════════
// TITLE SCREEN
// ══════════════════════════════════
let titleStartTime = performance.now();

// ══════════════════════════════════
// PIXEL FRAME BORDER
// ══════════════════════════════════
function drawPixelFrame() {
  const W = canvas.width, H = canvas.height;
  const borderW = 6; // outer solid border
  const frayW = 8; // inner fray zone
  
  // Solid dark border
  ctx.fillStyle = '#0a0808';
  ctx.fillRect(0, 0, W, borderW); // top
  ctx.fillRect(0, H - borderW, W, borderW); // bottom
  ctx.fillRect(0, 0, borderW, H); // left
  ctx.fillRect(W - borderW, 0, borderW, H); // right
  
  // Gold inner edge (1px line)
  ctx.fillStyle = '#8a7030';
  ctx.fillRect(borderW, borderW, W - borderW * 2, 1);
  ctx.fillRect(borderW, H - borderW - 1, W - borderW * 2, 1);
  ctx.fillRect(borderW, borderW, 1, H - borderW * 2);
  ctx.fillRect(W - borderW - 1, borderW, 1, H - borderW * 2);
  
  // Corner accents (small gold squares)
  const cs = 3;
  ctx.fillStyle = '#c09840';
  ctx.fillRect(borderW - cs, borderW - cs, cs * 2, cs * 2);
  ctx.fillRect(W - borderW - cs, borderW - cs, cs * 2, cs * 2);
  ctx.fillRect(borderW - cs, H - borderW - cs, cs * 2, cs * 2);
  ctx.fillRect(W - borderW - cs, H - borderW - cs, cs * 2, cs * 2);
}

function drawTitle() {
  const W = canvas.width;
  const H = canvas.height;
  const now = performance.now();
  const t = (now - titleStartTime) / 1000;
  
  // Init persistent title state
  if (!drawTitle._stars) {
    drawTitle._stars = [];
    for (let i = 0; i < 120; i++) {
      const seed = i * 7919;
      drawTitle._stars.push({
        x: ((seed * 13 + seed * seed) % (W * 100)) / 100,
        y: ((seed * 31 + seed * seed * 3) % (H * 100)) / 100,
        size: Math.random() < 0.08 ? 2 : 1,
        baseAlpha: 0.1 + Math.random() * 0.5,
        flickerSpeed: 0.5 + Math.random() * 3,
        flickerPhase: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.3 ? (Math.random() < 0.5 ? '#ffd0a0' : '#a0c0ff') : '#d0c8e0',
      });
    }
    drawTitle._sats = [];
    for (let i = 0; i < 5; i++) {
      drawTitle._sats.push({
        x: Math.random() * W * 1.5 - W * 0.25,
        y: 10 + Math.random() * (H * 0.85),
        speed: 4 + Math.random() * 25,
        blinkRate: 1 + Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
        dir: Math.random() < 0.3 ? -1 : 1, // some go right to left
        size: Math.random() < 0.2 ? 2 : 1,
      });
    }
    // Comet — rare, dramatic
    drawTitle._comet = {
      x: -50, y: H * 0.15,
      speed: 60 + Math.random() * 40,
      angle: 0.15 + Math.random() * 0.1, // slight downward
      tailLen: 20 + Math.random() * 15,
      active: false, nextTime: 3 + Math.random() * 8, // seconds until first appearance
    };
    // Sprite-based planet
    drawTitle._spritePlanet = {
      img: PLANET_IMG,
      loaded: PLANET_IMG.complete && PLANET_IMG.naturalWidth > 0,
      frameW: 100, frameH: 100, frameCount: 100,
      cx: W * 0.50, cy: H * 0.55, scale: 0.6,
      rotSpeed: 1.333, // frames per second (~75 sec full rotation)
    };
    if (!drawTitle._spritePlanet.loaded) {
      PLANET_IMG.onload = () => { drawTitle._spritePlanet.loaded = true; };
    }
    drawTitle._planets = [];
    // Hash-based 2D noise for planet surfaces
    function _hash(x, y, seed) {
      let h = seed + x * 374761393 + y * 668265263;
      h = (h ^ (h >> 13)) * 1274126177;
      h = h ^ (h >> 16);
      return (h & 0x7fffffff) / 0x7fffffff;
    }
    function _smooth(x, y, seed) {
      const ix = Math.floor(x), iy = Math.floor(y);
      const fx = x - ix, fy = y - iy;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const a = _hash(ix, iy, seed), b = _hash(ix + 1, iy, seed);
      const c = _hash(ix, iy + 1, seed), d = _hash(ix + 1, iy + 1, seed);
      return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    }
    function _fbm(x, y, seed, octaves) {
      let v = 0, amp = 0.5, freq = 1;
      for (let i = 0; i < octaves; i++) {
        v += _smooth(x * freq, y * freq, seed + i * 77) * amp;
        amp *= 0.5; freq *= 2;
      }
      return v;
    }
    const planetDefs = [
      { cx: W * 0.10, cy: H * 0.28, r: 20, palette: ['#1a0a2a', '#301848', '#4a2870', '#6a3898', '#8a50b8', '#a068d0'], seed: 42, octaves: 5, scale: 4, rotSpeed: 0.015, hasRing: false, type: 'terr' },
      { cx: W * 0.90, cy: H * 0.38, r: 14, palette: ['#0a180a', '#183818', '#285828', '#408840', '#58b058', '#70d070'], seed: 137, octaves: 4, scale: 3, rotSpeed: -0.025, hasRing: false, type: 'terr' },
      { cx: W * 0.78, cy: H * 0.10, r: 9, palette: ['#2a1808', '#4a3018', '#6a4828', '#907040', '#b89058', '#d8b070'], seed: 271, octaves: 6, scale: 5, rotSpeed: 0.035, hasRing: false, type: 'terr' },
      { cx: W * 0.22, cy: H * 0.70, r: 11, palette: ['#0a1020', '#182838', '#284858', '#387088', '#5090b0', '#68b0d0'], seed: 503, octaves: 4, scale: 3.5, rotSpeed: 0.02, hasRing: true, type: 'gas' },
    ];
    for (const def of planetDefs) {
      const frames = [];
      const frameCount = 60;
      const size = def.r * 2 + 2;
      const extra = def.hasRing ? 8 : 0;
      for (let f = 0; f < frameCount; f++) {
        const pc = document.createElement('canvas');
        pc.width = size + extra; pc.height = size + extra;
        const pctx = pc.getContext('2d');
        const ox = def.hasRing ? 4 : 0;
        const ccx = def.r + 1 + ox, ccy = def.r + 1 + ox;
        const timeOffset = (f / frameCount) * def.scale * 2;
        if (def.hasRing) {
          pctx.globalAlpha = 0.3;
          pctx.strokeStyle = def.palette[4] || def.palette[3];
          pctx.lineWidth = 1;
          pctx.beginPath();
          pctx.ellipse(ccx, ccy + 1, def.r + 4, Math.round(def.r * 0.3), 0, 0, Math.PI * 2);
          pctx.stroke();
          pctx.globalAlpha = 1;
        }
        for (let py = -def.r; py <= def.r; py++) {
          for (let px = -def.r; px <= def.r; px++) {
            const dist = Math.sqrt(px * px + py * py);
            if (dist > def.r) continue;
            const nx = px / def.r;
            const ny = py / def.r;
            const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
            // Spherical UV
            const u = (Math.atan2(nx, nz) / Math.PI) * def.scale + timeOffset;
            const v = (Math.asin(ny) / (Math.PI * 0.5)) * def.scale;
            // FBM noise
            let n;
            if (def.type === 'gas') {
              // Gas giant — horizontal bands + turbulence
              n = _fbm(u * 0.5, v * 3, def.seed, def.octaves) * 0.6
                + _fbm(u * 2, v * 0.8, def.seed + 100, 3) * 0.4;
            } else {
              // Terrestrial — continent-like blobs
              n = _fbm(u, v, def.seed, def.octaves);
            }
            n = Math.max(0, Math.min(1, n));
            // Dither: quantize with slight noise to avoid banding
            const dither = (_hash(px + def.r + f * 97, py + def.r, def.seed + 999) - 0.5) * 0.08;
            const ci = Math.min(def.palette.length - 1, Math.max(0, Math.floor((n + dither) * def.palette.length)));
            // Lighting
            const light = Math.max(0.2, nz * 0.5 + nx * -0.35 + ny * -0.25 + 0.5);
            const rim = 1 - nz;
            const rimBoost = rim > 0.65 ? (rim - 0.65) * 2 : 0;
            pctx.fillStyle = def.palette[ci];
            pctx.globalAlpha = Math.min(1, light + rimBoost * 0.25);
            pctx.fillRect(ccx + px, ccy + py, 1, 1);
          }
        }
        pctx.globalAlpha = 1;
        frames.push(pc);
      }
      drawTitle._planets.push({ ...def, frames, frameCount: frames.length, drawOx: extra / 2, orbitR: 3 + def.r * 0.4, orbitSpeed: 0.08 + Math.random() * 0.12, orbitPhase: Math.random() * Math.PI * 2 });
    }
  }
  
  // Dark background with subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#06060e');
  bgGrad.addColorStop(0.5, '#0a0a16');
  bgGrad.addColorStop(1, '#08081a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);
  
  // Draw stars
  for (const star of drawTitle._stars) {
    const flicker = Math.sin(t * star.flickerSpeed + star.flickerPhase);
    const alpha = star.baseAlpha * (0.5 + 0.5 * flicker);
    if (alpha < 0.02) continue;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = star.hue;
    ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
    if (alpha > 0.35) {
      ctx.globalAlpha = alpha * 0.2;
      ctx.fillRect(Math.round(star.x) - 1, Math.round(star.y), 1, 1);
      ctx.fillRect(Math.round(star.x) + star.size, Math.round(star.y), 1, 1);
      ctx.fillRect(Math.round(star.x), Math.round(star.y) - 1, 1, 1);
      ctx.fillRect(Math.round(star.x), Math.round(star.y) + star.size, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
  
  // Draw satellites
  for (const sat of drawTitle._sats) {
    sat.x += sat.speed * sat.dir * (1/60);
    if (sat.dir > 0 && sat.x > W + 10) { sat.x = -10; sat.y = 10 + Math.random() * (H * 0.85); }
    if (sat.dir < 0 && sat.x < -10) { sat.x = W + 10; sat.y = 10 + Math.random() * (H * 0.85); }
    const blink = Math.sin(t * sat.blinkRate + sat.phase) > 0.3;
    if (blink) {
      ctx.globalAlpha = 0.5 + Math.random() * 0.2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(sat.x), Math.round(sat.y), sat.size, sat.size);
      ctx.globalAlpha = 0.12;
      for (let ti = 1; ti <= 3; ti++) {
        ctx.fillRect(Math.round(sat.x - ti * sat.dir), Math.round(sat.y), 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  }
  
  // Draw comet
  const comet = drawTitle._comet;
  comet.nextTime -= 1/60;
  if (!comet.active && comet.nextTime <= 0) {
    comet.active = true;
    comet.x = -30;
    comet.y = Math.random() * H * 0.4;
    comet.speed = 80 + Math.random() * 60;
    comet.angle = 0.1 + Math.random() * 0.2;
  }
  if (comet.active) {
    comet.x += comet.speed * (1/60);
    comet.y += comet.speed * comet.angle * (1/60);
    if (comet.x > W + 50) {
      comet.active = false;
      comet.nextTime = 10 + Math.random() * 20;
    }
    // Head
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(comet.x), Math.round(comet.y), 2, 2);
    // Tail
    for (let ti = 1; ti <= comet.tailLen; ti++) {
      const tx = comet.x - ti * 1.2;
      const ty = comet.y - ti * comet.angle * 0.3;
      const a = 0.6 * (1 - ti / comet.tailLen);
      if (a <= 0) break;
      ctx.globalAlpha = a;
      ctx.fillStyle = ti < comet.tailLen * 0.3 ? '#ffe8c0' : '#a0b0d0';
      ctx.fillRect(Math.round(tx), Math.round(ty), 1, 1);
    }
    ctx.globalAlpha = 1;
  }
  
  // Draw sprite planet (featured, behind UI)
  const sp = drawTitle._spritePlanet;
  if (sp && sp.loaded) {
    const frameIdx = ((Math.floor(t * sp.rotSpeed) % sp.frameCount) + sp.frameCount) % sp.frameCount;
    const drawSize = Math.round(sp.frameW * sp.scale);
    const dx = Math.round(sp.cx - drawSize / 2);
    const dy = Math.round(sp.cy - drawSize / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.7;
    ctx.drawImage(sp.img, frameIdx * sp.frameW, 0, sp.frameW, sp.frameH, dx, dy, drawSize, drawSize);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
  }
  
  // Draw procedural pixel planets
  for (const planet of drawTitle._planets) {
    const frameIdx = Math.floor((t * planet.rotSpeed * planet.frameCount + 1000) % planet.frameCount);
    const frame = planet.frames[Math.abs(frameIdx) % planet.frameCount];
    const ox = Math.sin(t * planet.orbitSpeed + planet.orbitPhase) * planet.orbitR;
    const oy = Math.cos(t * planet.orbitSpeed * 0.7 + planet.orbitPhase) * planet.orbitR * 0.5;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(frame, Math.round(planet.cx + ox - planet.r - 1 - planet.drawOx), Math.round(planet.cy + oy - planet.r - 1 - planet.drawOx));
    ctx.imageSmoothingEnabled = true;
  }
  
  // Title text
  const titleY = Math.round(H * 0.18);
  ctx.font = '32px "' + CRISP_FONT_ALT + '"';
  const title1W = ctx.measureText('Matrimony').width;
  const title2W = ctx.measureText('Beyond Space and Time').width;
  crispGradientText('Matrimony', Math.round((W - title1W) / 2), titleY, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT);
  crispGradientText('Beyond Space and Time', Math.round((W - title2W) / 2), titleY + 38, 32, [[0, '#a0a0c0'], [0.5, '#d0d0e8'], [1, '#a0a0c0']], 0, CRISP_FONT_ALT);
  
  // Save slots
  const slotW = 280;
  const slotH = 60;
  const slotX = Math.round((W - slotW) / 2);
  const startY = Math.round(H * 0.42);
  const slots = [0, 1, 2].map(i => {
    const info = getSaveInfo(i);
    return info
      ? { label: 'Slot ' + (i + 1), sub: info.location }
      : { label: 'Slot ' + (i + 1), sub: 'Empty' };
  });
  for (let i = 0; i < slots.length; i++) {
    const sy = startY + i * (slotH + 12);
    const selected = state.titleSelection === i;
    ctx.fillStyle = selected ? (state.titleDeleteMode ? 'rgba(80, 30, 30, 0.8)' : 'rgba(60, 50, 80, 0.8)') : 'rgba(20, 18, 30, 0.7)';
    ctx.fillRect(slotX, sy, slotW, slotH);
    if (selected) {
      if (state.titleDeleteMode) {
        ctx.strokeStyle = '#c04040';
        ctx.lineWidth = 2;
        ctx.strokeRect(slotX, sy, slotW, slotH);
      } else {
        drawGoldOutline(slotX, sy, slotW, slotH, 2);
      }
    } else {
      ctx.strokeStyle = 'rgba(100, 90, 120, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(slotX + 0.5, sy + 0.5, slotW - 1, slotH - 1);
    }
    crispText(slots[i].label, slotX + 16, sy + 6, 32, selected ? '#f0e8d0' : '#8a8090', 0, CRISP_FONT_ALT);
    crispText(slots[i].sub, slotX + 16, sy + 28, 32, selected ? '#a09888' : '#504858', 0, CRISP_FONT_ALT);
  }
  
  const hintAlpha = 0.4 + 0.2 * Math.sin(now / 600);
  ctx.globalAlpha = hintAlpha;
  ctx.font = '32px "' + CRISP_FONT_ALT + '"';
  if (state.titleDeleteMode) {
    const delW = ctx.measureText('Choose file to delete (X = Cancel)').width;
    crispText('Choose file to delete (X = Cancel)', Math.round((W - delW) / 2), Math.round(H * 0.88), 32, '#c04040', 0, CRISP_FONT_ALT);
  } else {
    const hintW = ctx.measureText('Press Z to select').width;
    crispText('Press Z to select', Math.round((W - hintW) / 2), Math.round(H * 0.88), 32, '#706878', 0, CRISP_FONT_ALT);
  }
  ctx.globalAlpha = 1;

  // Delete confirmation overlay
  if (state.titleDeleteConfirm) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);
    const boxW = 420, boxH = 140;
    const boxX = Math.round((W - boxW) / 2), boxY = Math.round((H - boxH) / 2);
    ctx.fillStyle = 'rgba(40, 15, 15, 0.95)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#c04040';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    const slotName = 'File ' + ((state.titleSelection || 0) + 1);
    crispText('Delete ' + slotName + '?', boxX + Math.round(boxW / 2), boxY + 30, 32, '#f04040', 0.5, CRISP_FONT_ALT);
    crispText('This cannot be undone.', boxX + Math.round(boxW / 2), boxY + 62, 32, '#a08080', 0.5, CRISP_FONT_ALT);
    const pulse = 0.7 + 0.3 * Math.sin(now / 400);
    crispText('Z = Delete    X = Cancel', boxX + Math.round(boxW / 2), boxY + 100, 32, 'rgba(200,180,170,' + pulse + ')', 0.5, CRISP_FONT_ALT);
  }

  
}
function drawCombat() {
  const c = state.combat;
  const W = canvas.width;
  const H = canvas.height;
  const now = performance.now();
  const elapsed = now - c.startTime;
  
  // Death sequence rendering
  if (c.playerDied && c.deathSequence) {
    const ds = c.deathSequence;
    if (ds.phase === 'combat_death') {
      drawCombatNormal(c, W, H, now, elapsed);
      return;
    }
    if (ds.phase === 'combat_fade') {
      drawCombatNormal(c, W, H, now, elapsed);
      const t = Math.min(1, (now - ds.startTime) / 800);
      ctx.fillStyle = `rgba(0,0,0,${t})`;
      ctx.fillRect(0, 0, W, H);
      return;
    }
    return;
  }
  
  drawCombatNormal(c, W, H, now, elapsed);
}

function drawCombatNormal(c, W, H, now, elapsed) {
  
  // Screen shake
  let shakeX = 0, shakeY = 0;
  if (c.screenShake) {
    const st = now - c.screenShake.startTime;
    if (st < c.screenShake.duration) {
      const decay = 1 - st / c.screenShake.duration;
      const intensity = c.screenShake.intensity * decay * decay;
      shakeX = Math.round((Math.random() * 2 - 1) * intensity);
      shakeY = Math.round((Math.random() * 2 - 1) * intensity);
      ctx.save();
      ctx.translate(shakeX, shakeY);
    } else {
      c.screenShake = null;
    }
  }
  
  const FONT = '"RM2000Alt", sans-serif';
  const spr = sprites[c.enemySprite];
  
  // Slide-in easing (SmoothStop2: 1-(1-t)^2)
  const slideT = Math.min(1, elapsed / c.slideInDuration);
  const eased = 1 - (1 - slideT) * (1 - slideT);
  
  // Layout
  const topH = Math.round(H * 0.16);
  const arenaH = Math.round(H * 0.36);
  const arenaY = topH;
  const botContentY = arenaY + arenaH;
  const botH = H - botContentY;
  
  const portraitH = Math.round(topH * 0.42) - 8;
  const portraitW = Math.round(portraitH * 3.5);
  
  // ── TOP BAR ──
  ctx.fillStyle = 'rgba(8, 8, 14, 0.90)';
  ctx.fillRect(0, 0, W, topH);
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, topH - 0.5); ctx.lineTo(W, topH - 0.5); ctx.stroke();
  
  // Enemy portrait
  const pad = 8; // padding from edges
  const ePortraitX = pad + 20;
  const ePortraitY = Math.round((topH - portraitH) / 2) - 13;
  ctx.fillStyle = '#0c0c14';
  ctx.fillRect(ePortraitX, ePortraitY, portraitW, portraitH);
  drawGoldOutline(ePortraitX, ePortraitY, portraitW, portraitH, 3);
  if (spr && spr.loaded) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(ePortraitX + 1, ePortraitY + 1, portraitW - 2, portraitH - 2);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    // Draw sprite at natural scale, centered, clipped by portrait rect
    const sprDrawSize = Math.round(portraitW * 0.7);
    const dx = ePortraitX + 1 + Math.round((portraitW - 2 - sprDrawSize) / 2);
    const dy = ePortraitY + 1 + Math.round((portraitH - 2 - sprDrawSize) / 2);
    ctx.drawImage(spr.img, 0, 0, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE, dx, dy, sprDrawSize, sprDrawSize);
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
  }
  
  // Enemy HP bar
  const infoX = ePortraitX + portraitW + 16;
  const barW = Math.round(W * 0.22);
  const barH = Math.min(portraitH, 14);
  const barY = ePortraitY + 2;
  // Animated HP bar — ease display toward actual, speed proportional to damage
  if (c.enemyDisplayHp > c.enemyHp) {
    const diff = c.enemyDisplayHp - c.enemyHp;
    const speed = Math.max(0.5, diff * 0.08); // faster for bigger hits
    c.enemyDisplayHp = Math.max(c.enemyHp, c.enemyDisplayHp - speed);
  }
  ctx.fillStyle = '#2a1a1a'; ctx.fillRect(infoX, barY, barW, barH);
  const hpRatio = c.enemyDisplayHp / c.enemyMaxHp;
  ctx.fillStyle = hpRatio > 0.5 ? '#3a8a3a' : hpRatio > 0.25 ? '#b89030' : '#a03030';
  ctx.fillRect(infoX, barY, Math.round(barW * hpRatio), barH);
  drawGoldOutline(infoX - 2, barY - 2, barW + 4, barH + 4, 4);
  
  // HP chip particles
  if (c.hpChipParticles && c.hpChipParticles.length > 0) {
    const fdt = frameDt || 0.016;
    for (let i = c.hpChipParticles.length - 1; i >= 0; i--) {
      const p = c.hpChipParticles[i];
      p.life -= fdt;
      if (p.life <= 0) { c.hpChipParticles.splice(i, 1); continue; }
      p.x += p.vx * fdt * 60;
      p.vy += 4 * fdt * 60; // gravity
      p.y += p.vy * fdt * 60;
      // Position relative to the appropriate HP bar
      const barCX = p.enemy ? (infoX + barW * hpRatio) : (pad + 32);
      const barCY = p.enemy ? (barY + barH / 2) : (H - 80);
      const alpha = Math.min(1, p.life * 2);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.enemy ? (hpRatio > 0.5 ? '#5ab85a' : hpRatio > 0.25 ? '#d8b040' : '#d04040') : '#d04040';
      ctx.fillRect(barCX + p.x, barCY + p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
  
  // Enemy action display — hidden on first exchange until player commits, always visible after
  const showEnemyAction = c.enemyAction && c.enemyActionRevealed;
  if (showEnemyAction) {
    const act = COMBAT_ACTIONS[c.enemyAction] || {};
    crispText(c.enemyAction, infoX + barW + 12, barY - 8, 32, '#d0c0a0');
    const statY = barY + barH + 11;
    let sx = infoX;
    const waitVal = c.enemyWaitCountdown >= 0 ? c.enemyWaitCountdown : (act.wait || 0);
    sx += crispGradientText('Eff:', sx, statY, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    sx += crispText('' + (act.eff || 0), sx, statY, 32, '#e8e0d0', 0, CRISP_FONT_ALT) + 16;
    sx += crispGradientText('Def:', sx, statY, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    sx += crispText('' + (act.def || 0), sx, statY, 32, '#e8e0d0', 0, CRISP_FONT_ALT) + 16;
    sx += crispGradientText('Wait:', sx, statY, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    sx += crispText('' + waitVal, sx, statY, 32, '#e8e0d0', 0, CRISP_FONT_ALT) + 12;
    // Guard tag (for Defend moves)
    if (act.guard || c.enemyAction === 'Defend') {
      sx += crispText('Guard', sx, statY, 32, '#a0c8ff', 0, CRISP_FONT_ALT) + 12;
    }
    // Pierce tag
    if (act.pierce) {
      const PIERCE_GRADIENT = [[0, '#40a0d0'], [0.2, '#60d0ff'], [0.35, '#a0f0ff'], [0.5, '#ffffff'], [0.65, '#a0f0ff'], [0.8, '#60d0ff'], [1, '#40a0d0']];
      sx += crispGradientText('Pierce', sx, statY, 32, PIERCE_GRADIENT, 0, CRISP_FONT_ALT) + 12;
    }
    // Stun tag
    if (act.stun) {
      const STUN_GRADIENT = [[0, '#c08000'], [0.2, '#e0a020'], [0.35, '#ffd060'], [0.5, '#ffffff'], [0.65, '#ffd060'], [0.8, '#e0a020'], [1, '#c08000']];
      sx += crispGradientText('Stun', sx, statY, 32, STUN_GRADIENT, 0, CRISP_FONT_ALT) + 2;
      sx += crispText(String(act.stun), sx, statY, 32, '#ffd060', 0, CRISP_FONT_ALT) + 12;
    }
  }
  
  // ── ARENA ──
  const bgPreset = ENEMY_BG[c.enemy.type] || 'Giygas';
  drawEBBackground(ctx, 0, arenaY, W, arenaH, bgPreset);
  
  const playerCombatSize = 96;
  const enemyCombatSize = 48;
  const groundY = arenaY + Math.round(arenaH * 0.82);
  
  // Camera: smooth easing between positions
  const isActionPhase = c.phase === 'action' && !c.waiting && !c.playerAttackAnim && !c.enemyAttackAnim;
  const camTarget = isActionPhase ? 1.0 : 0.0; // 1 = centered on player, 0 = normal
  if (c.camLerp == null) c.camLerp = 0;
  c.camLerp += (camTarget - c.camLerp) * 0.08; // asymptotic easing
  const cl = c.camLerp;
  
  // Player/enemy positions interpolated by camera lerp
  const enemyNormalX = Math.round(W * 0.28) - enemyCombatSize / 2;
  const playerNormalX = Math.round(W * 0.72) - playerCombatSize / 2;
  const enemyActionX = Math.round(W * 0.12) - enemyCombatSize / 2; // pushed left
  const playerActionX = Math.round(W * 0.5) - playerCombatSize / 2; // centered
  
  const enemyTargetX = Math.round(enemyNormalX + (enemyActionX - enemyNormalX) * cl);
  const playerTargetX = Math.round(playerNormalX + (playerActionX - playerNormalX) * cl);
  
  // Slide in from edges
  const enemySlideFrom = -enemyCombatSize - 20;
  const playerSlideFrom = W + 20;
  let playerArenaX = Math.round(playerSlideFrom + (playerTargetX - playerSlideFrom) * eased);
  let enemyArenaX = Math.round(enemySlideFrom + (enemyTargetX - enemySlideFrom) * eased);
  const enemyArenaY = groundY - enemyCombatSize - 8;
  const playerArenaY = groundY - playerCombatSize;
  
  // Player attack animation — rush toward enemy then return
  let playerAttacking = false;
  if (c.playerAttackAnim) {
    const a = c.playerAttackAnim;
    const t = now - a.startTime;
    const targetX = enemyTargetX + enemyCombatSize; // just past enemy
    playerAttacking = true;
    if (t < a.rushDuration) {
      // Rush toward enemy (SmoothStop)
      const rt = t / a.rushDuration;
      const re = 1 - (1 - rt) * (1 - rt);
      playerArenaX = Math.round(playerTargetX + (targetX - playerTargetX) * re);
    } else if (t < a.rushDuration + a.hitPause) {
      // Hit pause — hold position
      playerArenaX = targetX;
    } else {
      // Return (SmoothStart)
      const rt = (t - a.rushDuration - a.hitPause) / a.returnDuration;
      const re = Math.min(1, rt * rt);
      playerArenaX = Math.round(targetX + (playerTargetX - targetX) * re);
    }
  }
  
  // Enemy attack animation — rush toward player then return
  let enemyAttacking = false;
  if (c.enemyAttackAnim) {
    const a = c.enemyAttackAnim;
    const t = now - a.startTime;
    const targetX = playerTargetX - enemyCombatSize; // just before player
    enemyAttacking = true;
    if (t < a.rushDuration) {
      const rt = t / a.rushDuration;
      const re = 1 - (1 - rt) * (1 - rt); // SmoothStop
      enemyArenaX = Math.round(enemyTargetX + (targetX - enemyTargetX) * re);
    } else if (t < a.rushDuration + a.hitPause) {
      enemyArenaX = targetX;
    } else {
      const rt = (t - a.rushDuration - a.hitPause) / a.returnDuration;
      const re = Math.min(1, rt * rt); // SmoothStart
      enemyArenaX = Math.round(targetX + (enemyTargetX - targetX) * re);
    }
  }
  
  // Draw enemy
  if (spr && spr.loaded) {
    const frame = Math.floor(now / ANIM_SPEED) % SPRITE_FRAMES;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spr.img, frame * SPRITE_FRAME_SIZE, 0, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
      enemyArenaX, enemyArenaY, enemyCombatSize, enemyCombatSize);
    
    // White tint on enemy pixels — baseline + flash during target phase
    if (slideT >= 1 && c.phase === 'target' && !c.targetSelf) {
      const baseAlpha = 0.15; // constant white tint so you always see selection
      const flashAlpha = baseAlpha + 0.2 * (0.5 + 0.5 * Math.sin(now / 180));
      if (flashAlpha > 0) {
        // Use offscreen canvas to create white silhouette
        if (!drawCombat._flashCanvas) {
          drawCombat._flashCanvas = document.createElement('canvas');
          drawCombat._flashCtx = drawCombat._flashCanvas.getContext('2d');
        }
        const fc = drawCombat._flashCanvas;
        const fctx = drawCombat._flashCtx;
        fc.width = enemyCombatSize;
        fc.height = enemyCombatSize;
        fctx.clearRect(0, 0, fc.width, fc.height);
        fctx.imageSmoothingEnabled = false;
        // Draw sprite
        fctx.drawImage(spr.img, frame * SPRITE_FRAME_SIZE, 0, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
          0, 0, enemyCombatSize, enemyCombatSize);
        // Fill white, only on existing pixels
        fctx.globalCompositeOperation = 'source-atop';
        fctx.fillStyle = 'white';
        fctx.fillRect(0, 0, fc.width, fc.height);
        fctx.globalCompositeOperation = 'source-over';
        // Draw the white silhouette with alpha
        ctx.globalAlpha = flashAlpha;
        ctx.drawImage(fc, enemyArenaX, enemyArenaY);
        ctx.globalAlpha = 1;
      }
    }
    ctx.imageSmoothingEnabled = true;
  }
  
  // Enemy attack flash — red tint during hit pause
  if (c.enemyAttackAnim) {
    const a = c.enemyAttackAnim;
    const t = now - a.startTime;
    if (t >= a.rushDuration && t < a.rushDuration + a.hitPause) {
      // Flash player red during hit — pixel-only using offscreen canvas
      if (getPlayerSheet().loaded) {
        if (!drawCombat._hitCanvas) {
          drawCombat._hitCanvas = document.createElement('canvas');
          drawCombat._hitCtx = drawCombat._hitCanvas.getContext('2d');
        }
        const hc = drawCombat._hitCanvas;
        const hctx = drawCombat._hitCtx;
        hc.width = playerCombatSize; hc.height = playerCombatSize;
        hctx.clearRect(0, 0, hc.width, hc.height);
        hctx.imageSmoothingEnabled = false;
        const anim2 = getPlayerSheet().anims['idle_right'];
        const frame2 = Math.floor(now / 400) % anim2.frames;
        hctx.save(); hctx.translate(playerCombatSize, 0); hctx.scale(-1, 1);
        hctx.drawImage(getPlayerSheet().img, frame2 * getPlayerSheet().frameW, anim2.row * getPlayerSheet().frameH, getPlayerSheet().frameW, getPlayerSheet().frameH, 0, 0, playerCombatSize, playerCombatSize);
        hctx.restore();
        hctx.globalCompositeOperation = 'source-atop';
        hctx.fillStyle = '#ff4444';
        hctx.fillRect(0, 0, hc.width, hc.height);
        hctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.4;
        ctx.drawImage(hc, playerArenaX, playerArenaY);
        ctx.globalAlpha = 1;
      }
    }
  }
  
  // Enemy bark — text above enemy for non-damaging moves
  if (c.enemyBark) {
    const bt = (now - c.enemyBark.startTime) / c.enemyBark.duration;
    const bAlpha = bt < 0.1 ? bt / 0.1 : bt > 0.7 ? (1 - bt) / 0.3 : 1;
    const bobY = -Math.sin(bt * Math.PI) * 6;
    ctx.globalAlpha = Math.max(0, bAlpha);
    crispText(c.enemyBark.text, enemyArenaX + enemyCombatSize / 2 - 30, enemyArenaY - 20 + bobY, 32, '#ffdc50');
    ctx.globalAlpha = 1;
  }
  // Stun bark (yellow/orange flash text)
  if (c.stunBark) {
    const bt = (now - c.stunBark.startTime) / c.stunBark.duration;
    if (bt >= 1) { c.stunBark = null; }
    else {
      const bAlpha = bt < 0.1 ? bt / 0.1 : bt > 0.7 ? (1 - bt) / 0.3 : 1;
      const bobY = -Math.sin(bt * Math.PI) * 10;
      ctx.globalAlpha = Math.max(0, bAlpha);
      crispText(c.stunBark.text, enemyArenaX + enemyCombatSize / 2 - 40, enemyArenaY - 45 + bobY, 32, '#ff8800');
      ctx.globalAlpha = 1;
    }
  }
  
  // Draw persistent "Defend" text above player while waiting with Defend
  if (c.waiting && c.attackText === 'Defend') {
    const defBob = -Math.sin(now / 400 * Math.PI) * 3;
    crispText('Defend', playerArenaX + playerCombatSize / 2 - 30, playerArenaY - 20 + defBob, 32, '#80d0ff');
  }
  // Draw player bark (non-damaging move like Defend — brief flash on resolve)
  if (c.playerBark) {
    const bt = (now - c.playerBark.startTime) / c.playerBark.duration;
    const bAlpha = bt < 0.1 ? bt / 0.1 : bt > 0.7 ? (1 - bt) / 0.3 : 1;
    const bobY = -Math.sin(bt * Math.PI) * 6;
    ctx.globalAlpha = Math.max(0, bAlpha);
    crispText(c.playerBark.text, playerArenaX + playerCombatSize / 2 - 30, playerArenaY - 20 + bobY, 32, '#80d0ff');
    ctx.globalAlpha = 1;
  }
  
  // Draw player (facing left)
  if (getPlayerSheet().loaded) {
    // Determine which animation to show
    let animName = playerAttacking ? 'walk_right' : 'idle_right';
    let animSpeed = 400;
    let hurtElapsed = 0;
    if (c.playerDied && c.deathSequence) {
      animName = 'death_right';
      animSpeed = 300;
      hurtElapsed = now - c.deathSequence.startTime;
    } else if (c.playerHurtAnim && (now - c.playerHurtAnim.startTime < c.playerHurtAnim.duration)) {
      animName = 'hurt_down';
      animSpeed = 200;
      hurtElapsed = now - c.playerHurtAnim.startTime;
    }
    const anim = getPlayerSheet().anims[animName] || getPlayerSheet().anims['idle_right'];
    const frame = hurtElapsed > 0 
      ? Math.min(anim.frames - 1, Math.floor(hurtElapsed / animSpeed))
      : Math.floor(now / 400) % anim.frames;
    const srcX = frame * getPlayerSheet().frameW;
    const srcY = anim.row * getPlayerSheet().frameH;
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate(playerArenaX + playerCombatSize, playerArenaY);
    ctx.scale(-1, 1);
    ctx.drawImage(getPlayerSheet().img, srcX, srcY, getPlayerSheet().frameW, getPlayerSheet().frameH,
      0, 0, playerCombatSize, playerCombatSize);
    ctx.restore();
    
    // White flash on player pixels — when self-targeting
    if (slideT >= 1 && c.phase === 'target' && c.targetSelf) {
      const flashAlpha = 0.1 + 0.2 * Math.sin(now / 180);
      if (flashAlpha > 0) {
        if (!drawCombat._flashCanvas2) {
          drawCombat._flashCanvas2 = document.createElement('canvas');
          drawCombat._flashCtx2 = drawCombat._flashCanvas2.getContext('2d');
        }
        const fc = drawCombat._flashCanvas2;
        const fctx = drawCombat._flashCtx2;
        fc.width = playerCombatSize;
        fc.height = playerCombatSize;
        fctx.clearRect(0, 0, fc.width, fc.height);
        fctx.imageSmoothingEnabled = false;
        fctx.save();
        fctx.translate(playerCombatSize, 0);
        fctx.scale(-1, 1);
        fctx.drawImage(getPlayerSheet().img, srcX, srcY, getPlayerSheet().frameW, getPlayerSheet().frameH,
          0, 0, playerCombatSize, playerCombatSize);
        fctx.restore();
        fctx.globalCompositeOperation = 'source-atop';
        fctx.fillStyle = 'white';
        fctx.fillRect(0, 0, fc.width, fc.height);
        fctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = flashAlpha;
        ctx.drawImage(fc, playerArenaX, playerArenaY);
        ctx.globalAlpha = 1;
      }
    }
    ctx.imageSmoothingEnabled = true;
  }

  // Draw ghost companion in combat
  if (c.allyPresent && getPlayerSheet().loaded) {
    const allySize = playerCombatSize;
    let allyX = playerArenaX - 40;
    let allyY = playerArenaY;

    // Attack flash/rush animation
    if (c.allyAttackAnim) {
      const at = (now - c.allyAttackAnim.startTime) / c.allyAttackAnim.duration;
      if (at < 0.3) allyX -= (at / 0.3) * 60; // rush toward enemy
      else if (at < 0.5) allyX -= 60;
      else allyX -= 60 * (1 - (at - 0.5) / 0.5); // return
      // Flash
      if (at > 0.25 && at < 0.45) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#c0e0ff';
        ctx.fillRect(0, arenaY, W, arenaH);
        ctx.globalAlpha = 1;
      }
    }

    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.imageSmoothingEnabled = false;
    const allyAnim = getPlayerSheet().anims['idle_right'] || getPlayerSheet().anims['idle_down'];
    const allyFrame = Math.floor(now / 400) % allyAnim.frames;
    const allySrcX = allyFrame * getPlayerSheet().frameW;
    const allySrcY = allyAnim.row * getPlayerSheet().frameH;
    // Face left (mirror)
    ctx.translate(allyX + allySize, allyY);
    ctx.scale(-1, 1);
    ctx.drawImage(getPlayerSheet().img, allySrcX, allySrcY, getPlayerSheet().frameW, getPlayerSheet().frameH,
      0, 0, allySize, allySize);
    ctx.restore();

    // Ally action label and wait bar
    ctx.globalAlpha = 0.8;
    crispText(c.allyAction || '', allyX + allySize / 2 - 20, allyY - 22, 14, '#a0c8ff', 0, CRISP_FONT_ALT);
    // Wait bar
    const barW = allySize, barH = 5;
    const barX = allyX, barY = allyY - 6;
    ctx.fillStyle = 'rgba(60, 80, 120, 0.5)';
    ctx.fillRect(barX, barY, barW, barH);
    const waitFill = Math.max(0, 1 - c.allyWaitCountdown / 6);
    ctx.fillStyle = '#80b0ff';
    ctx.fillRect(barX, barY, barW * waitFill, barH);
    ctx.globalAlpha = 1;
  }
  
  // Block sheen — white sweep across player pixels only on full block
  if (c.blockSheen && getPlayerSheet().loaded) {
    const bt = now - c.blockSheen.startTime;
    if (bt < c.blockSheen.duration) {
      const progress = bt / c.blockSheen.duration;
      if (!drawCombat._sheenCanvas) {
        drawCombat._sheenCanvas = document.createElement('canvas');
        drawCombat._sheenCtx = drawCombat._sheenCanvas.getContext('2d');
      }
      const sc = drawCombat._sheenCanvas;
      const sctx = drawCombat._sheenCtx;
      sc.width = playerCombatSize; sc.height = playerCombatSize;
      sctx.clearRect(0, 0, sc.width, sc.height);
      sctx.imageSmoothingEnabled = false;
      const anim3 = getPlayerSheet().anims['idle_right'];
      const frame3 = Math.floor(now / 400) % anim3.frames;
      sctx.save(); sctx.translate(playerCombatSize, 0); sctx.scale(-1, 1);
      sctx.drawImage(getPlayerSheet().img, frame3 * getPlayerSheet().frameW, anim3.row * getPlayerSheet().frameH, getPlayerSheet().frameW, getPlayerSheet().frameH, 0, 0, playerCombatSize, playerCombatSize);
      sctx.restore();
      sctx.globalCompositeOperation = 'source-atop';
      const sweepX = -playerCombatSize + progress * playerCombatSize * 3;
      sctx.fillStyle = '#ffffff';
      sctx.beginPath();
      sctx.moveTo(sweepX, 0);
      sctx.lineTo(sweepX + 16, 0);
      sctx.lineTo(sweepX - playerCombatSize + 16, playerCombatSize);
      sctx.lineTo(sweepX - playerCombatSize, playerCombatSize);
      sctx.fill();
      sctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.7 * (1 - progress);
      ctx.drawImage(sc, playerArenaX, playerArenaY);
      ctx.globalAlpha = 1;
    }
  }
  
  // ESC — after 5s idle
  if (elapsed > 9000) {
    const alpha = 0.3 + 0.3 * Math.sin(now / 800);
    ctx.globalAlpha = alpha;
    if (now - c.lastInputTime > 10000) {
      crispText('Esc = Run Away', W - 180, arenaY + 4, 32, '#8c828c');
    }
    ctx.globalAlpha = 1;
  }
  
  // ── BOTTOM BAR ──
  ctx.fillStyle = 'rgba(8, 8, 14, 0.90)';
  ctx.fillRect(0, botContentY, W, botH);
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, botContentY + 0.5); ctx.lineTo(W, botContentY + 0.5); ctx.stroke();
  
  // Player portrait
  const pPortraitX = pad + 20;
  const pPortraitY = botContentY + pad + 2;
  ctx.fillStyle = '#0c0c14';
  ctx.fillRect(pPortraitX, pPortraitY, portraitW, portraitH);
  drawGoldOutline(pPortraitX, pPortraitY, portraitW, portraitH, 3);
  if (getPlayerSheet().loaded) {
    const anim = getPlayerSheet().anims['idle_down'];
    ctx.save();
    ctx.beginPath();
    ctx.rect(pPortraitX + 1, pPortraitY + 1, portraitW - 2, portraitH - 2);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    // Draw sprite at natural scale, centered, clipped by portrait rect
    const pDrawSize = Math.round(portraitW * 0.7);
    const pdx = pPortraitX + 1 + Math.round((portraitW - 2 - pDrawSize) / 2);
    const pdy = pPortraitY + 1 + Math.round((portraitH - 2 - pDrawSize) / 2);
    ctx.drawImage(getPlayerSheet().img, 0, anim.row * getPlayerSheet().frameH, getPlayerSheet().frameW, getPlayerSheet().frameH,
      pdx, pdy, pDrawSize, pDrawSize);
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
  }
  
  // HP below portrait
  // HP text — flash on hit + animated HP drain
  if (c.displayPlayerHp === undefined) c.displayPlayerHp = c.playerHp;
  if (c.displayPlayerHp > c.playerHp) {
    c.displayPlayerHp = Math.max(c.playerHp, c.displayPlayerHp - 1);
  } else {
    c.displayPlayerHp = c.playerHp;
  }
  let hpColor = '#e8e0d0';
  if (c.hpFlash) {
    const ht = now - c.hpFlash.startTime;
    if (ht < c.hpFlash.duration) {
      // 2 slow pulses over 600ms
      const pulse = Math.sin(ht / c.hpFlash.duration * Math.PI * 2);
      if (pulse > 0) {
        if (c.hpFlash.blocked) {
          hpColor = '#ffffff';
        } else {
          // Red intensity based on % of max HP lost
          const pct = Math.min(1, (c.hpFlash.damage || 1) / c.playerMaxHp * 3);
          const r = Math.round(255);
          const g = Math.round(200 * (1 - pct));
          const b = Math.round(200 * (1 - pct));
          hpColor = `rgb(${r},${g},${b})`;
        }
      }
    } else {
      c.hpFlash = null;
    }
  }
  crispText('HP ' + c.displayPlayerHp + '/' + c.playerMaxHp, pPortraitX + 12, pPortraitY + portraitH + 4, 32, hpColor, 0, CRISP_FONT_ALT);
  
  // ── ACTION GRID: 2 columns × 4 rows, fill left-to-right then down ──
  const gridX = pPortraitX + portraitW + 48;
  const gridRowH = 34;
  const gridY = pPortraitY;
  const colW = Math.round((W - gridX - 24) / 2);
  
  const actions = c.actions && c.actions.length > 0 ? c.actions : ['Stand Still'];
  
  // Mouse hover (only when in action phase and not waiting)
  let hovered = -1;
  if (c.phase === 'action' && !c.waiting) {
    for (let i = 0; i < actions.length && i < 8; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ax = gridX + col * colW;
      const ay = gridY + row * gridRowH;
      if (mouse.x >= ax && mouse.x <= ax + colW && mouse.y >= ay && mouse.y <= ay + gridRowH) {
        hovered = i;
      }
    }
    if (hovered >= 0) c.selectedAction = hovered;
  }
  
  // Draw grid items
  for (let i = 0; i < actions.length && i < 8; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ax = gridX + col * colW;
    const ay = gridY + row * gridRowH;
    const isSelected = (c.phase === 'action') && i === (c.selectedAction || 0);
    const dimmed = c.waiting;
    
    // Highlight background — starts at first character pixel, rounded corners
    if (isSelected && !dimmed) {
      const hx = ax + 4;  // highlight start
      const hy = ay;
      const hw = colW - 4;
      const hh = gridRowH;
      ctx.fillStyle = 'rgba(80, 200, 60, 0.18)';
      ctx.fillRect(hx + 1, hy, hw - 2, 1);
      ctx.fillRect(hx, hy + 1, hw, hh - 2);
      ctx.fillRect(hx + 1, hy + hh - 1, hw - 2, 1);
    }
    
    // Draw action name — combo-ready shows flashing gradient "Slash!"
    const actionName = actions[i];
    const isComboReady = actionName === 'Rusty Shortsword' && c.comboCount >= 2;
    if (isComboReady) {
      const shimmer = (now / 150) % 1;
      const SLASH_GRADIENT = [
        [Math.max(0, shimmer - 0.3), '#c84020'],
        [shimmer, '#ffe8a0'],
        [Math.min(1, shimmer + 0.3), '#ff6030'],
      ];
      crispGradientText('Slash!', ax + 2, ay + 2, 32, SLASH_GRADIENT, 0, CRISP_FONT_ALT);
    } else {
      crispText(actions[i], ax + 2, ay + 2, 32, '#ffffff');
    }
  }
  
  // Selected action stats — centered on screen, anchored positions for each stat
  const sel = c.selectedAction || 0;
  if (c.phase === 'action' && sel < actions.length) {
    const selectedName = actions[sel];
    const isComboReady = selectedName === 'Rusty Shortsword' && c.comboCount >= 2;
    const displayAction = isComboReady ? 'Slash!' : selectedName;
    const act = COMBAT_ACTIONS[displayAction] || {};
    const statsY = H - pad - 26;
    const waitVal = c.waiting ? c.waitCountdown : (act.wait || 0);
    // Fixed-width slots: label + 3-digit number space. Center the whole block.
    const slotW = 120; // enough for "Wait:" + "100"
    const totalW = slotW * 3;
    const startX = Math.round((W - totalW) / 2);
    
    const STAT_GRADIENT = [[0, '#8a6010'], [0.2, '#c89830'], [0.4, '#ffe8a0'], [0.5, '#fffff0'], [0.6, '#ffe8a0'], [0.8, '#c89830'], [1, '#8a6010']];
    let sx = startX;
    crispGradientText('Eff:', sx, statsY, 32, STAT_GRADIENT, 0, CRISP_FONT_ALT);
    crispText('' + (act.eff || 0), sx + 55, statsY, 32, '#e8e0d0', 0, CRISP_FONT_ALT);
    sx += slotW;
    crispGradientText('Def:', sx, statsY, 32, STAT_GRADIENT, 0, CRISP_FONT_ALT);
    crispText('' + (act.def || 0), sx + 55, statsY, 32, '#e8e0d0', 0, CRISP_FONT_ALT);
    sx += slotW;
    crispGradientText('Wait:', sx, statsY, 32, STAT_GRADIENT, 0, CRISP_FONT_ALT);
    crispText('' + waitVal, sx + 65, statsY, 32, '#e8e0d0', 0, CRISP_FONT_ALT);
    sx += slotW;
    // Guard tag for Defend
    if (displayAction === 'Defend' || (act.guard)) {
            sx += crispText('Guard', sx, statsY, 32, '#a0c8ff', 0, CRISP_FONT_ALT) + 12;
    }
    // Pierce stat with shimmer
    if (act.pierce) {
      const PIERCE_GRADIENT = [[0, '#40a0d0'], [0.2, '#60d0ff'], [0.35, '#a0f0ff'], [0.5, '#ffffff'], [0.65, '#a0f0ff'], [0.8, '#60d0ff'], [1, '#40a0d0']];
      if (act.pierce === true) {
        sx += crispGradientText('Pierce', sx, statsY, 32, PIERCE_GRADIENT, 0, CRISP_FONT_ALT) + 12;
      } else {
        sx += crispGradientText('Pierce', sx, statsY, 32, PIERCE_GRADIENT, 0, CRISP_FONT_ALT) + 2;
        sx += crispText(String(act.pierce), sx, statsY, 32, '#a0f0ff', 0, CRISP_FONT_ALT) + 12;
      }
    }
    // Heal tag
    if (act.heal) {
      const HEAL_GRADIENT = [[0, '#20a040'], [0.2, '#40d060'], [0.35, '#80ff90'], [0.5, '#ffffff'], [0.65, '#80ff90'], [0.8, '#40d060'], [1, '#20a040']];
      sx += crispGradientText('Heal', sx, statsY, 32, HEAL_GRADIENT, 0, CRISP_FONT_ALT) + 12;
    }
    // Stun tag
    if (act.stun) {
      const STUN_GRADIENT = [[0, '#c08000'], [0.2, '#e0a020'], [0.35, '#ffd060'], [0.5, '#ffffff'], [0.65, '#ffd060'], [0.8, '#e0a020'], [1, '#c08000']];
      sx += crispGradientText('Stun', sx, statsY, 32, STUN_GRADIENT, 0, CRISP_FONT_ALT) + 2;
      sx += crispText(String(act.stun), sx, statsY, 32, '#ffd060', 0, CRISP_FONT_ALT) + 12;
    }
  }
  
  // Hints removed — no cancelling once committed
  
  // ── COPY MENU OVERLAY ──
  if (c.copyMenu) {
    // Darken background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, W, H);
    
    // Title
    const COPY_GRADIENT = [[0, '#6040b0'], [0.3, '#a080ff'], [0.5, '#e0d0ff'], [0.7, '#a080ff'], [1, '#6040b0']];
    const titleText = 'Copy: ' + c.copyMenu.enemyMove;
    crispGradientText(titleText, Math.round(W / 2 - 100), 30, 32, COPY_GRADIENT, 0, CRISP_FONT_ALT);
    crispText('Replace which slot?', Math.round(W / 2 - 80), 60, 32, '#908880', 0, CRISP_FONT_ALT);
    
    // Draw slots in same 2x4 grid layout
    const copyActions = c.actions || [];
    const copyGridX = Math.round(W * 0.2);
    const copyGridY = 100;
    const copyRowH = 38;
    const copyColW = Math.round(W * 0.3);
    const copySelected = c.copyMenu.selectedSlot || 0;
    
    for (let i = 0; i < copyActions.length && i < 8; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ax = copyGridX + col * copyColW;
      const ay = copyGridY + row * copyRowH;
      const isSelected = i === copySelected;
      
      if (isSelected) {
        ctx.fillStyle = 'rgba(160, 80, 255, 0.25)';
        ctx.fillRect(ax, ay, copyColW - 8, copyRowH - 4);
        // Border
        ctx.strokeStyle = 'rgba(180, 140, 255, 0.6)';
        ctx.strokeRect(ax, ay, copyColW - 8, copyRowH - 4);
      }
      
      const color = isSelected ? '#ffffff' : '#808080';
      crispText(copyActions[i], ax + 4, ay + 4, 32, color, 0, CRISP_FONT_ALT);
    }
    
    // Show stats of the move being copied
    const copiedAct = COMBAT_ACTIONS[c.copyMenu.enemyMove] || {};
    const infoY = copyGridY + 4 * copyRowH + 20;
    crispText('Copying: Eff ' + (copiedAct.eff || 0) + '  Def ' + (copiedAct.def || 0) + '  Wait ' + (copiedAct.wait || 0), copyGridX, infoY, 32, '#b89cff', 0, CRISP_FONT_ALT);
  }
  
  // Win state overlay
  if (c.winState && c.enemyDisplayHp <= 0.5) {
    const ws = c.winState;
    const wt = (now - ws.startTime) / 1000;
    
    // Darken
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, W, H);
    
    // "You Win!" with flashing vertical gradient
    const textY = Math.round(H * 0.42);
    const gradShift = (now / 400) % 1;
    const winStops = [
      [Math.max(0, gradShift - 0.3), '#f0d060'],
      [gradShift, '#fffce0'],
      [Math.min(1, gradShift + 0.3), '#f0d060'],
    ];
    const clampedStops = winStops.map(([s, c]) => [Math.max(0, Math.min(1, s)), c]);
    const winTextW = crispGradientText('You Win!', 0, -999, 32, clampedStops, 0, 'Pixelify Sans');
    const winX = Math.round((W - winTextW) / 2);
    crispGradientText('You Win!', winX, textY, 32, clampedStops, 0, 'Pixelify Sans');
    
    // Show EXP gained — centered below "You Win!"
    const expReward = ENEMY_DATA[c.enemy.type]?.exp || 0;
    if (expReward > 0 && wt > 0.5) {
      const expAlpha = Math.min(1, (wt - 0.5) * 3);
      ctx.globalAlpha = expAlpha;
      const expStr = '+' + expReward + ' EXP';
      const expW = crispText(expStr, 0, -999, 24, '#a0e0ff', 0, 'Pixelify Sans');
      crispText(expStr, Math.round((W - expW) / 2), textY + 36, 24, '#a0e0ff', 0, 'Pixelify Sans');
      ctx.globalAlpha = 1;
    }
  }
  
  // Explosion animation (over player portrait area)
  if (c.explosionAnim && EXPLOSION_IMG.complete) {
    const et = now - c.explosionAnim.startTime;
    if (et < c.explosionAnim.duration) {
      const frame = Math.min(EXPLOSION_FRAMES - 1, Math.floor(et / (1000 / EXPLOSION_FPS)));
      const pad = 8;
      const pPortraitX = pad + 20;
      const botContentY = Math.round(H * 0.52);
      const topH = Math.round(H * 0.16);
      const portraitH = Math.round(topH * 0.42);
      const portraitW = Math.round(portraitH * 3.5);
      const pPortraitY = botContentY + pad + 2;
      // Center explosion over player portrait
      const exSize = Math.max(portraitW, portraitH) * 1.5;
      const exX = pPortraitX + portraitW / 2 - exSize / 2;
      const exY = pPortraitY + portraitH / 2 - exSize / 2;
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(EXPLOSION_IMG, frame * EXPLOSION_FRAME_W, 0, EXPLOSION_FRAME_W, EXPLOSION_FRAME_H,
        Math.round(exX), Math.round(exY), Math.round(exSize), Math.round(exSize));
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = true;
    } else {
      c.explosionAnim = null;
    }
  }
  
  // Restore screen shake
  if (c.screenShake) ctx.restore();
}

function drawCombatTransition() {
  // No screen wipe — combat overlays directly on the overworld
}

function showDialogue(speaker, text, portrait) {
  state.dialogue = { speaker, text, portrait: portrait || null };
}

function closeDialogue() {
  state.dialogue = null;
  // Continue dialogue queue if present
  if (state.dialogueQueue && state.dialogueQueue.length > 0) {
    const next = state.dialogueQueue.shift();
    showDialogue(next.speaker, next.text, next.portrait);
    return;
  }
  state.dialogueQueue = null;
  // Start pending combat after dialogue finishes
  if (state.pendingCombat) {
    const { entity, data } = state.pendingCombat;
    state.pendingCombat = null;
    startCombat(entity, data);
  }
}

function drawDialogue() {
  if (!state.dialogue || !state.dialogue.text) return;
  const W = canvas.width;
  const H = canvas.height;
  const FONT = '"RM2000Alt", sans-serif';
  
  // Box in bottom third of canvas
  const boxH = Math.round(H * 0.22);
  const boxY = H - boxH - 16;
  const boxX = 16;
  const boxW = W - 32;
  
  // Background
  ctx.fillStyle = 'rgba(10, 8, 15, 0.92)';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = '#5a5060';
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  
  // Portrait above dialogue box (for enemy dialogues)
  if (state.dialogue.portrait) {
    const pSize = 48;
    const pX = boxX;
    const pY = boxY - pSize - 4;
    ctx.fillStyle = 'rgba(10, 8, 15, 0.92)';
    ctx.fillRect(pX, pY, pSize, pSize);
    ctx.strokeStyle = '#5a5060';
    ctx.lineWidth = 2;
    ctx.strokeRect(pX, pY, pSize, pSize);
    if (state.dialogue.portrait === 'player') {
      if (getPlayerSheet().loaded) {
        const anim = getPlayerSheet().anims['idle_down'];
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(getPlayerSheet().img, 0, anim.row * getPlayerSheet().frameH, 32, 32, pX + 4, pY + 4, 40, 40);
        ctx.imageSmoothingEnabled = true;
      }
    } else {
      drawSprite(ctx, state.dialogue.portrait, pX + 4, pY + 4, 0);
    }
  }
  
  // Text (word wrap) — use crisp text
  const textY = boxY + 8;
  // We need to word-wrap with crisp text. Measure using an offscreen ctx.
  if (!drawDialogue._mc) {
    drawDialogue._mc = document.createElement('canvas').getContext('2d');
  }
  const mctx = drawDialogue._mc;
  mctx.font = '32px "' + CRISP_FONT + '"';
  const maxW = boxW - 24;
  const words = state.dialogue.text.split(' ');
  let line = '';
  let lineY = textY;
  for (const word of words) {
    const test = line + word + ' ';
    if (mctx.measureText(test).width > maxW && line) {
      crispText(line.trim(), boxX + 12, lineY, 32, '#c8b8a0');
      line = word + ' ';
      lineY += 18;
    } else {
      line = test;
    }
  }
  crispText(line.trim(), boxX + 12, lineY, 32, '#c8b8a0');
}

// ══════════════════════════════════
// WEAPON TRANSFORMATION PROMPT
// ══════════════════════════════════
function drawWeaponTransformPrompt() {
  const p = state.weaponTransformPrompt;
  if (!p) return;
  const now = performance.now();
  const age = (now - p.startTime) / 1000;
  const fadeIn = Math.min(1, age * 3);
  
  const W = canvas.width, H = canvas.height;
  const boxW = 320, boxH = 200;
  const bx = Math.round((W - boxW) / 2);
  const by = Math.round((H - boxH) / 2);
  
  // Darken background
  ctx.globalAlpha = fadeIn * 0.7;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = fadeIn;
  
  // Box background — match chest style
  ctx.fillStyle = 'rgba(10, 8, 15, 0.95)';
  ctx.fillRect(bx, by, boxW, boxH);
  ctx.strokeStyle = '#5a5060';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, boxW, boxH);
  
  // Title — weapon name with shimmer, left-aligned
  const shimmerT = (now / 600) % 1;
  const TITLE_GRADIENT = [
    [Math.max(0, shimmerT - 0.3), '#80c0e0'],
    [shimmerT, '#ffffff'],
    [Math.min(1, shimmerT + 0.3), '#80c0e0'],
  ].map(([s, c]) => [Math.max(0, Math.min(1, s)), c]);
  crispGradientText(p.newName, bx + 16, by + 12, 32, TITLE_GRADIENT, 0, CRISP_FONT_ALT);
  
  // Stats line — match chest exactly (32px, GOLD_GRADIENT, #fff values)
  let sx = bx + 16;
  const statY = by + 46;
  sx += crispGradientText('Eff:', sx, statY, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
  sx += crispText('' + (p.stats.eff || 0), sx, statY, 32, '#fff') + 8;
  sx += crispGradientText('Def:', sx, statY, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
  sx += crispText('' + (p.stats.def || 0), sx, statY, 32, '#fff') + 8;
  sx += crispGradientText('Wait:', sx, statY, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
  crispText('' + (p.stats.wait || 0), sx, statY, 32, '#fff');
  
  // Special effect — Pierce with shimmer
  const effectY = by + 86;
  const PIERCE_GRADIENT = [[0, '#40a0d0'], [0.15, '#60d0ff'], [0.3, '#a0f0ff'], [0.5, '#ffffff'], [0.7, '#a0f0ff'], [0.85, '#60d0ff'], [1, '#40a0d0']];
  const scrollT = (now / 800) % 1;
  const PIERCE_SHIMMER = PIERCE_GRADIENT.map(([s, c]) => [Math.max(0, Math.min(1, (s + scrollT) % 1)), c]).sort((a, b) => a[0] - b[0]);
  if (p.pierceVal) {
    const pierceText = 'Pierce' + (p.pierceVal === true ? '' : ' ' + p.pierceVal);
    crispGradientText(pierceText, bx + 16, effectY, 32, PIERCE_SHIMMER, 0, CRISP_FONT_ALT);
    crispText('1 damage ignores defense', bx + 16, effectY + 30, 32, '#8090a0', 0, CRISP_FONT_ALT);
  }
  
  // Accept / Reject — match chest prompt style (#ffe060, 32px)
  const btnY = by + boxH - 40;
  crispText('(Z) Accept   (X) Reject', bx + 16, btnY, 32, '#ffe060', 0, CRISP_FONT_ALT);
  
  ctx.globalAlpha = 1;
}

// CHEST INTERACTION
// ══════════════════════════════════
function drawChestInteraction() {
  const ci = state.chestInteraction;
  if (!ci) return;
  const W = canvas.width;
  const H = canvas.height;
  const boxH = Math.round(H * 0.28);
  const boxY = H - boxH - 8;
  const boxX = 0;
  const boxW = W;
  const now = performance.now();

  // Background
  ctx.fillStyle = 'rgba(10, 8, 15, 0.95)';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = '#5a5060';
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  if (ci.step === 'reveal') {
    // Item name in gold
    crispGradientText(ci.item, boxX + 16, boxY + 12, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT);
    // Flashing "Next"
    if (Math.sin(now / 300) > 0) {
      crispText('Next ▶', boxW - 80, boxY + boxH - 24, 32, '#d4a830');
    }
  } else if (ci.step === 'stats') {
    const act = COMBAT_ACTIONS[ci.item] || { eff: 0, def: 0, wait: 0 };
    // Item name
    crispGradientText(ci.item, boxX + 16, boxY + 10, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT);
    // Stats line
    let sx = boxX + 16;
    const statY = boxY + 36;
    sx += crispGradientText('Eff:', sx, statY, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    sx += crispText('' + act.eff, sx, statY, 32, '#fff') + 8;
    sx += crispGradientText('Def:', sx, statY, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    sx += crispText('' + act.def, sx, statY, 32, '#fff') + 8;
    sx += crispGradientText('Wait:', sx, statY, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    crispText('' + act.wait, sx, statY, 32, '#fff');
    // Take / Leave prompt
    crispText('(Z) Take it   (X) Leave it', boxX + 16, boxY + 62, 32, '#ffe060');
  } else if (ci.step === 'inventoryFull') {
    crispText('Inventory full! Choose item to drop:', boxX + 16, boxY + 8, 32, '#ffe060');
    const items = getInventoryActions();
    const sel = ci.selectedSlot || 0;
    for (let i = 0; i < items.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ix = boxX + 16 + col * Math.round(boxW / 2);
      const iy = boxY + 32 + row * 20;
      const color = i === sel ? '#ffe060' : '#c8b8a0';
      const prefix = i === sel ? '▶ ' : '  ';
      crispText(prefix + items[i], ix, iy, 32, color);
    }
    // Show selected item stats at bottom
    const selItem = items[sel];
    const act = COMBAT_ACTIONS[selItem] || { eff: 0, def: 0, wait: 0 };
    let sx2 = boxX + 16;
    const sy2 = boxY + boxH - 24;
    sx2 += crispGradientText('Eff:', sx2, sy2, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    sx2 += crispText('' + act.eff, sx2, sy2, 32, '#fff') + 8;
    sx2 += crispGradientText('Def:', sx2, sy2, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    sx2 += crispText('' + act.def, sx2, sy2, 32, '#fff') + 8;
    sx2 += crispGradientText('Wait:', sx2, sy2, 32, GOLD_GRADIENT, 0, CRISP_FONT_ALT) + 2;
    crispText('' + act.wait, sx2, sy2, 32, '#fff');
  } else if (ci.step === 'confirmDrop') {
    const items = getInventoryActions();
    const dropItem = items[ci.selectedSlot || 0];
    crispText('Drop ' + dropItem + '?', boxX + 16, boxY + 20, 32, '#ffe060');
    crispText('(Z) Yes   (X) No', boxX + 16, boxY + 50, 32, '#c8b8a0');
  }
}


function drawFishStream(ctx) {
  if (!state.fishParticles || state.fishParticles.length === 0) return;
  const cam = getCameraOffset();
  const camX = cam.x;
  const camY = cam.y;
  const ts = TILE * SCALE;
  
  for (const f of state.fishParticles) {
    const sx = (f.x - camX) * ts;
    const sy = (f.y - camY) * ts;
    // Fade in/out at edges
    const fadeIn = Math.min(1, (f.initialLife - f.life) / 0.8);
    const fadeOut = Math.min(1, f.life / 0.8);
    const alpha = fadeIn * fadeOut;
    const sz = f.size * SCALE;
    const wobbleAngle = Math.PI + Math.sin(f.wobble) * 0.15;
    
    // Shadow — offset down, smaller, very faint
    ctx.save();
    ctx.globalAlpha = alpha * f.shade * 0.4;
    ctx.translate(sx + 3 * SCALE, sy + 5 * SCALE);
    ctx.rotate(wobbleAngle);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 0.35, sz * 1.0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Fish body with dark outline
    ctx.save();
    ctx.globalAlpha = alpha * f.shade;
    ctx.translate(sx, sy);
    ctx.rotate(wobbleAngle);
    
    // Outline stroke first (darker, thicker)
    ctx.strokeStyle = '#020208';
    ctx.lineWidth = Math.max(1.5, sz * 0.2);
    ctx.fillStyle = '#0a0810';
    
    // Body — teardrop ellipse
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 0.5, sz * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Tail — smooth sine curve sweep instead of V
    const tailSway = Math.sin(f.finPhase) * sz * 0.35;
    ctx.beginPath();
    ctx.moveTo(-sz * 0.15, sz * 1.1);
    ctx.quadraticCurveTo(-sz * 0.3 + tailSway * 0.4, sz * 1.5, -sz * 0.45 + tailSway, sz * 1.9);
    ctx.moveTo(sz * 0.15, sz * 1.1);
    ctx.quadraticCurveTo(sz * 0.3 + tailSway * 0.4, sz * 1.5, sz * 0.45 + tailSway, sz * 1.9);
    ctx.stroke();
    // Fill between the two curves
    ctx.beginPath();
    ctx.moveTo(0, sz * 1.1);
    ctx.quadraticCurveTo(-sz * 0.3 + tailSway * 0.4, sz * 1.5, -sz * 0.45 + tailSway, sz * 1.9);
    ctx.lineTo(tailSway * 0.5, sz * 1.5);
    ctx.lineTo(sz * 0.45 + tailSway, sz * 1.9);
    ctx.quadraticCurveTo(sz * 0.3 + tailSway * 0.4, sz * 1.5, 0, sz * 1.1);
    ctx.fill();
    
    // Spine line
    ctx.strokeStyle = '#030308';
    ctx.lineWidth = Math.max(1, sz * 0.12);
    ctx.beginPath();
    ctx.moveTo(0, -sz * 0.8);
    ctx.lineTo(0, sz * 0.9);
    ctx.stroke();
    
    // Side fins — pectoral fins with smoother curves
    const finFlap = Math.sin(f.finPhase * 0.7) * 0.3;
    ctx.strokeStyle = '#020208';
    ctx.lineWidth = Math.max(1, sz * 0.15);
    ctx.fillStyle = '#0a0810';
    ctx.beginPath();
    ctx.moveTo(-sz * 0.3, -sz * 0.1);
    ctx.quadraticCurveTo(-sz * 0.7 - finFlap * sz, sz * 0.05, -sz * 0.2, sz * 0.3);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sz * 0.3, -sz * 0.1);
    ctx.quadraticCurveTo(sz * 0.7 + finFlap * sz, sz * 0.05, sz * 0.2, sz * 0.3);
    ctx.fill();
    ctx.stroke();
    
    // Eye glint — rare subtle catch of light
    if (f.glint) {
      ctx.globalAlpha = alpha * 0.18;
      ctx.fillStyle = '#506070';
      ctx.beginPath();
      ctx.arc(-sz * 0.15, -sz * 0.55, sz * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sz * 0.15, -sz * 0.55, sz * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

// ══════════════════════════════════
// RENDERING
// ══════════════════════════════════
function draw() {
  // Fill with dark color to prevent black edges at map boundaries
  ctx.fillStyle = '#1a1a20';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Don't render until tileset is loaded (prevents flash of IntGrid)
  if (!tilesetLoaded) return;
  
  const cam = getCameraOffset();
  const camX = cam.x;
  const camY = cam.y;
  const vis = getPlayerVisualPos();
  
  // Draw IntGrid (floor/walls) as fallback
  // We need to draw extra tiles to cover fractional camera offsets
  const startX = Math.floor(camX) - 1;
  const startY = Math.floor(camY) - 1;
  const endX = Math.ceil(camX) + CANVAS_TILES_X + 1;
  const endY = Math.ceil(camY) + CANVAS_TILES_Y + 1;
  
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      if (x < 0 || x >= state.mapW || y < 0 || y >= state.mapH) continue;
      const val = state.collision[y][x];
      const sx = (x - camX) * TILE * SCALE;
      const sy = (y - camY) * TILE * SCALE;
      ctx.fillStyle = INTGRID_COLORS[val] || '#1a1520';
      ctx.fillRect(Math.round(sx), Math.round(sy), TILE * SCALE + 1, TILE * SCALE + 1); // +1 to avoid seams
    }
  }
  
  // Draw tile layers (background first, foreground last)
  if (tilesetLoaded && tilesetImg) {
    ctx.imageSmoothingEnabled = false;
    for (const tileLayer of state.tiles) {
      for (const tile of tileLayer) {
        const gx = Math.floor(tile.px[0] / TILE);
        const gy = Math.floor(tile.px[1] / TILE);
        if (gx < startX || gx > endX || gy < startY || gy > endY) continue;
        const sx = (gx - camX) * TILE * SCALE;
        const sy = (gy - camY) * TILE * SCALE;
        ctx.drawImage(tilesetImg,
          tile.src[0], tile.src[1], TILE, TILE,
          Math.round(sx), Math.round(sy), TILE * SCALE, TILE * SCALE
        );
      }
    }
    ctx.imageSmoothingEnabled = true;
  }
  
  // Draw entities
  for (const e of state.entities) {
    if (state.defeatedEnemies[e.id]) continue;
    // Calculate interpolated position for smooth movement
    let ex = e.x, ey = e.y;
    if (e.aiMoving && e.moveStart) {
      const t = Math.min(1, (performance.now() - e.moveStart) / MOVE_DURATION);
      ex = e.prevX + (e.x - e.prevX) * t;
      ey = e.prevY + (e.y - e.prevY) * t;
    }
    if (ex < startX - 1 || ex > endX + 1 || ey < startY - 1 || ey > endY + 1) continue;
    const sx = Math.round((ex - camX) * TILE * SCALE);
    let sy = Math.round((ey - camY) * TILE * SCALE);
    // Alert hop — quick bounce up and back down
    if (e.alertHop) {
      const hopAge = performance.now() - e.alertHop.startTime;
      if (hopAge > e.alertHop.duration) {
        e.alertHop = null;
      } else {
        const hopT = hopAge / e.alertHop.duration;
        sy -= Math.sin(hopT * Math.PI) * 12; // arc up 12px and back
      }
    }
    drawEntity(ctx, e, sx, sy);
    // Draw alert bark — gold gradient "!" using crisp text
    if (e.alertBark) {
      const barkAge = performance.now() - e.alertBark.startTime;
      if (barkAge > e.alertBark.duration) {
        e.alertBark = null;
      } else {
        const barkAlpha = barkAge < 100 ? barkAge / 100 : (1 - (barkAge - 100) / (e.alertBark.duration - 100));
        const bounceY = barkAge < 200 ? -8 * (1 - (barkAge/200) * (barkAge/200)) : 0;
        ctx.globalAlpha = Math.max(0, barkAlpha);
        const barkGradient = [[0, '#f0d060'], [0.35, '#ffe8a0'], [0.5, '#fffff0'], [0.65, '#ffe8a0'], [1, '#c89830']];
        crispGradientText('!', sx + TILE * SCALE / 2 - 6, sy - 29 + bounceY, 32, barkGradient, 0, CRISP_FONT);
        ctx.globalAlpha = 1;
      }
    }
  }
  
  // Draw footsteps (fading trail)
  const footFadeMs = 3000; // fade over 3 seconds
  const nowFoot = performance.now();
  for (let i = state.footsteps.length - 1; i >= 0; i--) {
    const f = state.footsteps[i];
    const age = nowFoot - f.time;
    if (age > footFadeMs) { state.footsteps.splice(i, 1); continue; }
    const alpha = 0.25 * (1 - age / footFadeMs);
    const fx = Math.round((f.x - camX) * TILE * SCALE);
    const fy = Math.round((f.y - camY) * TILE * SCALE);
    // Two dots at different heights — left foot higher, right foot lower
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#2a1a10';
    if (f.side === 0) {
      ctx.fillRect(fx + 8, fy + 19, 4, 3);
      ctx.fillRect(fx + 18, fy + 24, 4, 3);
    } else {
      ctx.fillRect(fx + 8, fy + 24, 4, 3);
      ctx.fillRect(fx + 18, fy + 19, 4, 3);
    }
    ctx.globalAlpha = 1;
  }

  // Draw enemy footsteps
  for (const e of state.entities) {
    if (!e.footsteps || state.defeatedEnemies[e.id]) continue;
    const isFireElemental = e.type === 'FireElemental';
    const isIceGolem = e.type === 'IceGolem';
    const fadeMs = isFireElemental ? 6000 : isIceGolem ? 5000 : footFadeMs;
    for (let i = e.footsteps.length - 1; i >= 0; i--) {
      const f = e.footsteps[i];
      const age = nowFoot - f.time;
      if (age > fadeMs) { e.footsteps.splice(i, 1); continue; }
      const alpha = 0.2 * (1 - age / fadeMs);
      const fx = Math.round((f.x - camX) * TILE * SCALE);
      const fy = Math.round((f.y - camY) * TILE * SCALE);
      if (isFireElemental) {
        // Scorched ground — dark charred patch under each footstep
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = '#0a0400';
        if (f.side === 0) {
          ctx.fillRect(fx + 6, fy + 18, 7, 5);
          ctx.fillRect(fx + 15, fy + 22, 7, 5);
        } else {
          ctx.fillRect(fx + 6, fy + 22, 7, 5);
          ctx.fillRect(fx + 15, fy + 18, 7, 5);
        }
        // Orange glow around scorch
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = '#ff6600';
        if (f.side === 0) {
          ctx.fillRect(fx + 5, fy + 17, 9, 7);
          ctx.fillRect(fx + 14, fy + 21, 9, 7);
        } else {
          ctx.fillRect(fx + 5, fy + 21, 9, 7);
          ctx.fillRect(fx + 14, fy + 17, 9, 7);
        }
        // Charred footprint
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#1a0800';
      } else if (isIceGolem) {
        // Frost patch on ground
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = '#c0e8ff';
        if (f.side === 0) {
          ctx.fillRect(fx + 5, fy + 17, 9, 7);
          ctx.fillRect(fx + 14, fy + 21, 9, 7);
        } else {
          ctx.fillRect(fx + 5, fy + 21, 9, 7);
          ctx.fillRect(fx + 14, fy + 17, 9, 7);
        }
        // Bright ice center
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = '#e8f4ff';
      } else {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#3a1510';
      }
      if (f.side === 0) {
        ctx.fillRect(fx + 8, fy + 19, 4, 3);
        ctx.fillRect(fx + 18, fy + 24, 4, 3);
      } else {
        ctx.fillRect(fx + 8, fy + 24, 4, 3);
        ctx.fillRect(fx + 18, fy + 19, 4, 3);
      }
      ctx.globalAlpha = 1;
    }
  }

  // Draw fish stream
  drawFishStream(ctx);
  
  // Draw and update burn particles (frame-rate independent)
  const fdt = frameDt;
  for (let i = state.burnParticles.length - 1; i >= 0; i--) {
    const p = state.burnParticles[i];
    if (p.ice) {
      // Ice particles: gentle drift downward with slight wobble
      p.x += (p.vx + Math.sin(p.life * 8) * 0.1) * 1.5 * fdt;
      p.y += p.vy * 1.5 * fdt;
      p.life -= 1.2 * fdt;
    } else if (p.steam) {
      // Steam: float up slowly, spread out
      p.x += p.vx * 1.0 * fdt;
      p.y += p.vy * 1.0 * fdt;
      p.vx *= (1 - 0.5 * fdt); // slow horizontal drift
      p.life -= 1.0 * fdt;
    } else if (p.wisp) {
      // Wisp: gentle float upward, slight wobble, slow fade
      p.x += p.vx * fdt + Math.sin(p.life * 5) * 0.02 * fdt;
      p.y += p.vy * fdt;
      p.life -= 0.9 * fdt;
    } else if (p.ghost) {
      // Ghost: gentle float upward, fade
      p.x += p.vx * fdt + Math.sin(p.life * 4) * 0.01 * fdt;
      p.y += p.vy * fdt;
      p.life -= 0.8 * fdt;
    } else if (p.life > p.initialLife * 0.6) {
      p.x += p.vx * 1.44 * fdt;
      p.y += p.vy * 2.88 * fdt;
    } else {
      p.vx += 27.0 * fdt;
      p.vy -= 3.6 * fdt;
      p.x += p.vx * 2.88 * fdt;
      p.y += p.vy * 2.88 * fdt;
    }
    p.life -= (p.ember ? 1.44 : 2.52) * fdt;
    if (p.life <= 0) { state.burnParticles.splice(i, 1); continue; }
    const px = Math.round((p.x - camX) * TILE * SCALE);
    const py = Math.round((p.y - camY) * TILE * SCALE);
    // Color: dust = grey, ice = blue/white, fire = red/orange glow
    let color;
    const lifeRatio = p.life / (p.initialLife || 1.5);
    if (p.dust) {
      if (lifeRatio > 0.5) color = '#a09080';
      else color = '#706050';
    } else if (p.ice) {
      if (lifeRatio > 0.8) color = '#eef8ff';
      else if (lifeRatio > 0.4) color = '#a0d8f0';
      else color = '#60a8c8';
    } else if (p.steam) {
      if (lifeRatio > 0.6) color = '#e0e8f0';
      else if (lifeRatio > 0.3) color = '#a0a8b0';
      else color = '#707880';
    } else if (p.wisp) {
      if (lifeRatio > 0.7) color = '#e0f0ff';
      else if (lifeRatio > 0.4) color = '#80c0ff';
      else color = '#4080c0';
    } else if (p.ghost) {
      if (lifeRatio > 0.7) color = '#e8f0ff';
      else if (lifeRatio > 0.4) color = '#b0d0ff';
      else color = '#6090c0';
    } else if (lifeRatio > 0.95) color = '#ffeecc';
    else if (lifeRatio > 0.5) color = '#ff6600';
    else if (lifeRatio > 0.2) color = '#cc2200';
    else color = '#661100';
    const alpha = p.life > 0.2 ? Math.min(p.life, 1.0) * 0.8 : p.life * 2.0;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    // Single pixel (1x1 at render scale)
    ctx.fillRect(px, py, 2, 2);
    ctx.globalAlpha = 1;
  }

  // Draw player at visual (interpolated) position
  const playerDrawX = Math.round((vis.x - camX) * TILE * SCALE);
  const playerDrawY = Math.round((vis.y - camY) * TILE * SCALE);
  // Flying shadow on ground (also during transitions)
  if (state.flying || state.flyTransition) {
    let shadowAlpha = 0.3;
    let shadowOffsetY = 1.2;
    if (state.flyTransition) {
      const ft = state.flyTransition;
      const t = Math.min(1, (performance.now() - ft.startTime) / ft.duration);
      if (ft.type === 'takeoff') {
        shadowAlpha = 0.3 * t; // fade in
        shadowOffsetY = 0.8 + t * 0.4; // shadow drops away
      } else {
        shadowAlpha = 0.3 * (1 - t); // fade out
        shadowOffsetY = 0.8 + (1 - t) * 0.4;
      }
    }
    const shadowX = playerDrawX + TILE * SCALE / 2;
    const shadowY = playerDrawY + TILE * SCALE * shadowOffsetY;
    ctx.globalAlpha = shadowAlpha;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(shadowX, shadowY, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Draw ghost companion (before player so player draws on top)
  if (state.companion && state.companion.opacity > 0) {
    const comp = state.companion;
    let cx = comp.x, cy = comp.y;
    const compDrawX = Math.round((cx - camX) * TILE * SCALE);
    const compDrawY = Math.round((cy - camY) * TILE * SCALE);
    drawCompanion(ctx, compDrawX, compDrawY, comp.facing, comp.aiMoving, comp.opacity);
  }

  drawPlayer(ctx, playerDrawX, playerDrawY);

  // Debug hitbox overlay
  if (state.showHitboxes) {
    const ts = TILE * SCALE;
    // Draw collision grid
    for (let y = Math.max(0, Math.floor(camY)); y < Math.min(state.mapH, Math.ceil(camY + CANVAS_H / (TILE * SCALE))); y++) {
      for (let x = Math.max(0, Math.floor(camX)); x < Math.min(state.mapW, Math.ceil(camX + CANVAS_W / (TILE * SCALE))); x++) {
        const blocked = isTileBlocked(x, y, false);
        if (blocked) {
          ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.fillRect(Math.round((x - camX) * ts), Math.round((y - camY) * ts), ts, ts);
        }
        // Draw fine collision sub-cells
        if (state.fineCollision) {
          const s = state.fineCollisionScale || 2;
          const subSize = ts / s;
          for (let dy = 0; dy < s; dy++) {
            for (let dx = 0; dx < s; dx++) {
              const r = y * s + dy, c = x * s + dx;
              if (state.fineCollision[r] && state.fineCollision[r][c] > 0) {
                ctx.fillStyle = state.fineCollision[r][c] === 1 ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 255, 0, 0.3)';
                ctx.fillRect(Math.round((x - camX) * ts + dx * subSize), Math.round((y - camY) * ts + dy * subSize), Math.ceil(subSize), Math.ceil(subSize));
              }
            }
          }
        }
      }
    }
    // Player hitbox (the tile they occupy)
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(Math.round((state.player.x - camX) * ts), Math.round((state.player.y - camY) * ts), ts, ts);
    // Label
    crispText('H = Hide Hitboxes', 8, CANVAS_H - 24, 32, '#00ff00', 0, CRISP_FONT_ALT);
  }
  
  // Wind particles — simulate debris/leaves blown bottom-left to upper-right
  if (!state.windParticles) state.windParticles = [];
  if (!state.windTime) state.windTime = 0;
  const now = performance.now();
  state.windTime = now * 0.001; // seconds
  const wt = state.windTime;
  
  // Global wind field — slowly varying base angle and strength
  const windAngle = -0.45 + Math.sin(wt * 0.3) * 0.15 + Math.sin(wt * 0.7) * 0.08; // radians, ~-25° to -40° from horizontal
  const windStrength = 170 + Math.sin(wt * 0.5) * 50 + Math.sin(wt * 1.3) * 35; // gusts
  
  // Spawn
  if (Math.random() < 0.18) {
    // Spawn from left edge or bottom edge
    const fromBottom = Math.random() < 0.35;
    state.windParticles.push({
      x: fromBottom ? Math.random() * canvas.width * 0.6 : -5,
      y: fromBottom ? canvas.height + 5 : Math.random() * canvas.height,
      speed: 0.7 + Math.random() * 0.6, // multiplier on wind
      size: 1 + Math.random() * 2,
      alpha: 0.06 + Math.random() * 0.14,
      phase: Math.random() * Math.PI * 2, // unique oscillation phase
      wobbleFreq: 3 + Math.random() * 4, // how fast it wobbles
      wobbleAmp: 25 + Math.random() * 40, // wobble radius — big enough for loops
      born: now,
      trail: [], // position history for streaky look
    });
  }
  
  for (let i = state.windParticles.length - 1; i >= 0; i--) {
    const p = state.windParticles[i];
    const age = (now - p.born) / 1000;
    
    // Base wind velocity
    const baseVx = Math.cos(windAngle) * windStrength * p.speed;
    const baseVy = Math.sin(windAngle) * windStrength * p.speed;
    
    // Circular wobble (loop-de-loops)
    const loopX = Math.sin(age * p.wobbleFreq + p.phase) * p.wobbleAmp;
    const loopY = Math.cos(age * p.wobbleFreq * 0.8 + p.phase) * p.wobbleAmp * 0.7;
    const wobbleVx = loopX;
    const wobbleVy = loopY;
    
    // Local turbulence — Perlin-like using sin
    const turbX = Math.sin(p.y * 0.02 + wt * 2) * 25 + Math.sin(p.x * 0.015 + wt * 1.3) * 18;
    const turbY = Math.cos(p.x * 0.02 + wt * 1.7) * 15 + Math.sin(p.y * 0.03 + wt * 2.3) * 10;
    
    const wdt = frameDt * 3;
    p.x += (baseVx + wobbleVx + turbX) * wdt;
    p.y += (baseVy + wobbleVy + turbY) * wdt;
    
    // Store trail
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 8) p.trail.shift();
    
    // Remove if off screen
    if (p.x > canvas.width + 20 || p.y < -20 || p.x < -40 || p.y > canvas.height + 20) {
      state.windParticles.splice(i, 1); continue;
    }
    
    // Fade in/out
    const fadeIn = Math.min(1, age * 3);
    const fadeOut = 1 - Math.max(0, (p.x - canvas.width + 60)) / 60;
    const fadeTop = 1 - Math.max(0, (-p.y + 20)) / 40;
    const a = p.alpha * fadeIn * Math.max(0, fadeOut) * Math.max(0, fadeTop);
    
    // Draw trail (streaky look)
    ctx.strokeStyle = '#d0c8c0';
    ctx.lineWidth = p.size * 0.8;
    ctx.globalAlpha = a * 0.4;
    if (p.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(Math.round(p.trail[0].x), Math.round(p.trail[0].y));
      for (let j = 1; j < p.trail.length; j++) {
        ctx.lineTo(Math.round(p.trail[j].x), Math.round(p.trail[j].y));
      }
      ctx.stroke();
    }
    // Draw particle head
    ctx.globalAlpha = a;
    ctx.fillStyle = '#d8d0c8';
    ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y), Math.round(p.size * 2), Math.round(p.size));
    ctx.globalAlpha = 1;
  }
  
  // Screen flash (battle start)
  if (state.screenFlash) {
    const t = now - state.screenFlash.startTime;
    if (t < state.screenFlash.duration) {
      ctx.globalAlpha = 0.7 * (1 - t / state.screenFlash.duration);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    } else {
      state.screenFlash = null;
    }
  }
  
  
  // Font comparison overlay (press F to toggle, scroll with mousewheel or drag)
  if (state.showFontTest) {
    const panelX = 10, panelY = 10, panelW = canvas.width - 20, panelH = canvas.height - 20;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    // Subtle background pattern so shadows/outlines are visible
    ctx.fillStyle = 'rgba(30, 25, 40, 1)';
    ctx.fillRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);
    // Checkerboard pattern
    for (let cy = panelY; cy < panelY + panelH; cy += 8) {
      for (let cx = panelX; cx < panelX + panelW; cx += 8) {
        if ((cx + cy) % 16 === 0) {
          ctx.fillStyle = 'rgba(40, 35, 55, 1)';
          ctx.fillRect(cx, cy, 8, 8);
        }
      }
    }
    ctx.strokeStyle = '#5a5060'; ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, panelW, panelH);
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);
    ctx.clip();
    
    // Helper: draw text with extra letter spacing and optional drop shadow
    function drawSpaced(text, x, y, spacing, shadow) {
      if (shadow) {
        const origFill = ctx.fillStyle;
        ctx.fillStyle = '#000000';
        let sx = x + 2;
        for (let i = 0; i < text.length; i++) {
          ctx.fillText(text[i], sx, y + 2);
          sx += ctx.measureText(text[i]).width + spacing;
        }
        ctx.fillStyle = origFill;
      }
      let tx = x;
      for (let i = 0; i < text.length; i++) {
        ctx.fillText(text[i], tx, y);
        tx += ctx.measureText(text[i]).width + spacing;
      }
      return tx;
    }
    
    // Helper: render crisp pixel text — no anti-aliasing outlines
    // Renders to offscreen canvas, thresholds alpha to kill grey AA fringe,
    // then stamps result with drop shadow
    function drawCrispText(text, x, y, fontSize, color, spacing, fontFamily) {
      if (!drawCrispText._c) {
        drawCrispText._c = document.createElement('canvas');
        drawCrispText._ctx = drawCrispText._c.getContext('2d', { willReadFrequently: true });
      }
      const oc = drawCrispText._c;
      const octx = drawCrispText._ctx;
      const w = 500, h = fontSize + 8;
      const ff = fontFamily || 'RM2000';
      oc.width = w; oc.height = h;
      octx.clearRect(0, 0, w, h);
      octx.font = fontSize + 'px "' + ff + '"';
      octx.textAlign = 'left';
      octx.textBaseline = 'top';
      octx.fillStyle = '#ffffff';
      
      // Draw each character with spacing
      let tx = 2;
      const sp = spacing || 2;
      for (let i = 0; i < text.length; i++) {
        octx.fillText(text[i], tx, 2);
        tx += octx.measureText(text[i]).width + sp;
      }
      
      // Threshold alpha: anything < 220 becomes 0, anything >= 220 becomes 255
      const imgData = octx.getImageData(0, 0, tx + 2, h);
      const d = imgData.data;
      for (let i = 3; i < d.length; i += 4) {
        d[i] = d[i] >= 220 ? 255 : 0;
      }
      octx.putImageData(imgData, 0, 0);
      
      // Now colorize: draw a color rect with source-atop to recolor white→target
      octx.globalCompositeOperation = 'source-atop';
      octx.fillStyle = color || '#e8e0d0';
      octx.fillRect(0, 0, tx + 2, h);
      octx.globalCompositeOperation = 'source-over';
      
      // Draw shadow first (offset version in black)
      if (!drawCrispText._c2) {
        drawCrispText._c2 = document.createElement('canvas');
        drawCrispText._ctx2 = drawCrispText._c2.getContext('2d', { willReadFrequently: true });
      }
      const sc = drawCrispText._c2;
      const sctx = drawCrispText._ctx2;
      sc.width = w; sc.height = h;
      sctx.clearRect(0, 0, w, h);
      sctx.font = fontSize + 'px "' + ff + '"';
      sctx.textAlign = 'left';
      sctx.textBaseline = 'top';
      sctx.fillStyle = '#ffffff';
      let stx = 2;
      for (let i = 0; i < text.length; i++) {
        sctx.fillText(text[i], stx, 2);
        stx += sctx.measureText(text[i]).width + sp;
      }
      const sData = sctx.getImageData(0, 0, stx + 2, h);
      const sd = sData.data;
      for (let i = 3; i < sd.length; i += 4) {
        sd[i] = sd[i] >= 220 ? 255 : 0;
      }
      // Make shadow black
      for (let i = 0; i < sd.length; i += 4) {
        sd[i] = 0; sd[i+1] = 0; sd[i+2] = 0;
      }
      sctx.putImageData(sData, 0, 0);
      
      // Stamp shadow then text
      ctx.drawImage(sc, 0, 0, stx + 2, h, x + 2, y + 2, stx + 2, h);
      ctx.drawImage(oc, 0, 0, tx + 2, h, x, y, tx + 2, h);
      
      return tx + 2;
    }
    
    // Render at small native size, threshold AA, then scale up with nearest-neighbor
    function drawCrispScaled(text, x, y, fontSize, scale, color, spacing, fontFamily) {
      if (!drawCrispScaled._c) {
        drawCrispScaled._c = document.createElement('canvas');
        drawCrispScaled._ctx = drawCrispScaled._c.getContext('2d', { willReadFrequently: true });
        drawCrispScaled._c2 = document.createElement('canvas');
        drawCrispScaled._ctx2 = drawCrispScaled._c2.getContext('2d', { willReadFrequently: true });
      }
      const oc = drawCrispScaled._c;
      const octx = drawCrispScaled._ctx;
      const w = 500, h = fontSize + 6;
      const ff = fontFamily || 'RM2000';
      oc.width = w; oc.height = h;
      octx.clearRect(0, 0, w, h);
      octx.font = fontSize + 'px "' + ff + '"';
      octx.textAlign = 'left';
      octx.textBaseline = 'top';
      octx.fillStyle = '#ffffff';
      
      const sp = spacing || 1;
      let tx = 1;
      for (let i = 0; i < text.length; i++) {
        octx.fillText(text[i], tx, 1);
        tx += octx.measureText(text[i]).width + sp;
      }
      
      // Threshold alpha
      const imgData = octx.getImageData(0, 0, tx + 2, h);
      const d = imgData.data;
      for (let i = 3; i < d.length; i += 4) {
        d[i] = d[i] >= 220 ? 255 : 0;
      }
      octx.putImageData(imgData, 0, 0);
      
      // Colorize
      octx.globalCompositeOperation = 'source-atop';
      octx.fillStyle = color || '#e8e0d0';
      octx.fillRect(0, 0, tx + 2, h);
      octx.globalCompositeOperation = 'source-over';
      
      // Shadow version
      const sc2 = drawCrispScaled._c2;
      const sctx = drawCrispScaled._ctx2;
      sc2.width = w; sc2.height = h;
      sctx.clearRect(0, 0, w, h);
      sctx.font = fontSize + 'px "' + ff + '"';
      sctx.textAlign = 'left';
      sctx.textBaseline = 'top';
      sctx.fillStyle = '#ffffff';
      let stx = 1;
      for (let i = 0; i < text.length; i++) {
        sctx.fillText(text[i], stx, 1);
        stx += sctx.measureText(text[i]).width + sp;
      }
      const sData = sctx.getImageData(0, 0, stx + 2, h);
      const sd = sData.data;
      for (let i = 3; i < sd.length; i += 4) {
        sd[i] = sd[i] >= 220 ? 255 : 0;
      }
      for (let i = 0; i < sd.length; i += 4) {
        sd[i] = 0; sd[i+1] = 0; sd[i+2] = 0;
      }
      sctx.putImageData(sData, 0, 0);
      
      // Scale up with nearest-neighbor
      const dw = (tx + 2) * scale, dh = h * scale;
      ctx.imageSmoothingEnabled = false;
      // Shadow offset = 1 source pixel = `scale` display pixels
      ctx.drawImage(sc2, 0, 0, stx + 2, h, x + scale, y + scale, (stx + 2) * scale, h * scale);
      ctx.drawImage(oc, 0, 0, tx + 2, h, x, y, dw, dh);
      ctx.imageSmoothingEnabled = true;
      
      return dw;
    }
    
    // Like drawCrispText but with adjustable threshold
    function drawCrispTextThresh(text, x, y, fontSize, color, spacing, threshold, fontFamily) {
      if (!drawCrispTextThresh._c) {
        drawCrispTextThresh._c = document.createElement('canvas');
        drawCrispTextThresh._ctx = drawCrispTextThresh._c.getContext('2d', { willReadFrequently: true });
        drawCrispTextThresh._c2 = document.createElement('canvas');
        drawCrispTextThresh._ctx2 = drawCrispTextThresh._c2.getContext('2d', { willReadFrequently: true });
      }
      const oc = drawCrispTextThresh._c;
      const octx = drawCrispTextThresh._ctx;
      const w = 500, h = fontSize + 8;
      const ff = fontFamily || 'RM2000';
      oc.width = w; oc.height = h;
      octx.clearRect(0, 0, w, h);
      octx.font = fontSize + 'px "' + ff + '"';
      octx.textAlign = 'left';
      octx.textBaseline = 'top';
      octx.fillStyle = '#ffffff';
      const sp = spacing || 2;
      let tx = 2;
      for (let i = 0; i < text.length; i++) {
        octx.fillText(text[i], tx, 2);
        tx += octx.measureText(text[i]).width + sp;
      }
      const imgData = octx.getImageData(0, 0, tx + 2, h);
      const d = imgData.data;
      for (let i = 3; i < d.length; i += 4) {
        d[i] = d[i] >= threshold ? 255 : 0;
      }
      octx.putImageData(imgData, 0, 0);
      octx.globalCompositeOperation = 'source-atop';
      octx.fillStyle = color || '#e8e0d0';
      octx.fillRect(0, 0, tx + 2, h);
      octx.globalCompositeOperation = 'source-over';
      
      // Shadow
      const sc = drawCrispTextThresh._c2;
      const sctx = drawCrispTextThresh._ctx2;
      sc.width = w; sc.height = h;
      sctx.clearRect(0, 0, w, h);
      sctx.font = fontSize + 'px "' + ff + '"';
      sctx.textAlign = 'left';
      sctx.textBaseline = 'top';
      sctx.fillStyle = '#ffffff';
      let stx = 2;
      for (let i = 0; i < text.length; i++) {
        sctx.fillText(text[i], stx, 2);
        stx += sctx.measureText(text[i]).width + sp;
      }
      const sData = sctx.getImageData(0, 0, stx + 2, h);
      const sd = sData.data;
      for (let i = 3; i < sd.length; i += 4) {
        sd[i] = sd[i] >= threshold ? 255 : 0;
      }
      for (let i = 0; i < sd.length; i += 4) {
        sd[i] = 0; sd[i+1] = 0; sd[i+2] = 0;
      }
      sctx.putImageData(sData, 0, 0);
      
      ctx.drawImage(sc, 0, 0, stx + 2, h, x + 2, y + 2, stx + 2, h);
      ctx.drawImage(oc, 0, 0, tx + 2, h, x, y, tx + 2, h);
      return tx + 2;
    }
    
    const sample = 'Punch  Kick  Eff: 12  Def: 5  Wait: 8  HP 30/30';
    const scrollY = -(state.fontTestScroll || 0);
    const scrollX = -(state.fontTestScrollX || 0);
    ctx.textAlign = 'left';
    ctx.translate(scrollX, 0);
    let y = 30 + scrollY;
    
    // RM2000 32px threshold + scale
    const sampleText = 'Punch  Kick  Eff: 12  Def: 5  Wait: 8  HP 30/30  ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    ctx.fillStyle = '#d4a830'; ctx.font = '10px "Pixelify Sans"';
    ctx.fillText('RM2000 32px threshold+scale (nearest-neighbor):', 20, y); y += 16;
    
    const scaledCombos = [
      { sc: 1, label: '32px × 1 (32)' },
      { sc: 2, label: '32px × 2 (64)' },
    ];
    for (const c2 of scaledCombos) {
      ctx.fillStyle = '#706860'; ctx.font = '9px "Pixelify Sans"';
      ctx.fillText(c2.label + ':', 20, y + 16);
      drawCrispScaled(sampleText, 130, y, 32, c2.sc, '#e8e0d0', 2);
      y += 32 * c2.sc + 12;
    }
    y += 10;
    
    // Try lowering threshold to be more aggressive at killing AA
    ctx.fillStyle = '#d4a830'; ctx.font = '10px "Pixelify Sans"';
    ctx.fillText('32px direct — varying threshold (killing more AA):', 20, y); y += 16;
    
    const thresholds = [180, 190, 200, 210, 220, 230, 240];
    for (const thresh of thresholds) {
      ctx.fillStyle = '#706860'; ctx.font = '9px "Pixelify Sans"';
      ctx.fillText('thresh ' + thresh + ':', 20, y + 12);
      drawCrispTextThresh(sampleText, 110, y, 32, '#e8e0d0', 2, thresh);
      y += 40;
    }
    y += 10;
    
    // RM2000Alt 32px with varying thresholds
    ctx.fillStyle = '#d4a830'; ctx.font = '10px "Pixelify Sans"';
    ctx.fillText('RM2000Alt 32px — varying threshold:', 20, y); y += 16;
    for (const thresh of thresholds) {
      ctx.fillStyle = '#706860'; ctx.font = '9px "Pixelify Sans"';
      ctx.fillText('thresh ' + thresh + ':', 20, y + 12);
      drawCrispTextThresh(sampleText, 110, y, 32, '#e8e0d0', 2, thresh, 'RM2000Alt');
      y += 40;
    }
    
    // Other fonts at 24px with shadow
    const others = [
      { name: 'RM2000Alt 24px', font: '24px "RM2000Alt"', sp: 1 },
      { name: 'RM2000Alt 32px', font: '32px "RM2000Alt"', sp: 1 },
      { name: 'RMG2000 24px', font: '24px "RMG2000"', sp: 1 },
      { name: 'RMG2000 32px', font: '32px "RMG2000"', sp: 1 },
      { name: 'Pixelify 24px', font: '24px "Pixelify Sans"', sp: 0 },
      { name: 'Pixelify 32px', font: '32px "Pixelify Sans"', sp: 0 },
    ];
    for (const o of others) {
      ctx.fillStyle = '#706860'; ctx.font = '9px "Pixelify Sans"';
      ctx.fillText(o.name + ':', 20, y + 10);
      ctx.fillStyle = '#e8e0d0'; ctx.font = o.font;
      drawSpaced(sampleText, 120, y + 10, o.sp, true);
      y += 28;
    }
    y += 16;
    
    // ═══ RM2000 24px HORIZONTAL GRADIENTS ═══
    ctx.fillStyle = '#d4a830'; ctx.font = '10px "Pixelify Sans"';
    ctx.fillText('── RM2000 24px — Horizontal Gradients (left→right) ──', 20, y); y += 20;
    
    const gradSamples = [
      { text: '★ CRITICAL HIT ★', stops: [[0,'#ff4040'],[0.5,'#ffcc00'],[1,'#ff4040']] },
      { text: '♦ LEVEL UP ♦', stops: [[0,'#60c0ff'],[0.4,'#ffffff'],[0.6,'#ffffff'],[1,'#60c0ff']] },
      { text: '◆ FIRE STORM ◆', stops: [[0,'#ff2200'],[0.3,'#ff8800'],[0.6,'#ffdd00'],[1,'#ff2200']] },
      { text: '✦ HOLY LIGHT ✦', stops: [[0,'#ffffa0'],[0.3,'#ffffff'],[0.7,'#ffffff'],[1,'#ffffa0']] },
      { text: '☠ POISON FANG ☠', stops: [[0,'#40ff40'],[0.3,'#a0ff60'],[0.7,'#40ff40'],[1,'#208020']] },
      { text: '❄ ICE SHARD ❄', stops: [[0,'#80c0ff'],[0.3,'#c0e8ff'],[0.7,'#ffffff'],[1,'#80c0ff']] },
      { text: '⚡ THUNDER ⚡', stops: [[0,'#ffff40'],[0.3,'#ffffff'],[0.5,'#ffff40'],[0.8,'#ffffff'],[1,'#ffff40']] },
      { text: 'RAINBOW BLADE', stops: [[0,'#ff4040'],[0.17,'#ff8800'],[0.33,'#ffff00'],[0.5,'#40ff40'],[0.67,'#4080ff'],[0.83,'#8040ff'],[1,'#ff40ff']] },
    ];
    for (const gs of gradSamples) {
      ctx.font = '24px "RM2000"';
      // Heavy shadow (2px offset, opaque black)
      ctx.fillStyle = '#000000';
      drawSpaced(gs.text, 22, y + 22, 1, false);
      // Gradient on top
      const tw = ctx.measureText(gs.text).width + gs.text.length;
      const grad = ctx.createLinearGradient(20, 0, 20 + tw, 0);
      for (const [pos, color] of gs.stops) grad.addColorStop(pos, color);
      ctx.fillStyle = grad;
      drawSpaced(gs.text, 20, y + 20, 1, false);
      y += 32;
    }
    y += 16;
    
    // ═══ RM2000 24px VERTICAL GRADIENTS (top→bottom) ═══
    ctx.fillStyle = '#d4a830'; ctx.font = '10px "Pixelify Sans"';
    ctx.fillText('── RM2000 24px — Vertical Gradients (top→bottom) ──', 20, y); y += 20;
    
    for (const gs of [...gradSamples]) {
      ctx.font = '24px "RM2000"';
      const textY = y + 20;
      // Heavy shadow
      ctx.fillStyle = '#000000';
      drawSpaced(gs.text, 22, textY + 2, 1, false);
      // Vertical gradient
      const grad = ctx.createLinearGradient(0, textY - 20, 0, textY + 4);
      for (const [pos, color] of gs.stops) grad.addColorStop(pos, color);
      ctx.fillStyle = grad;
      drawSpaced(gs.text, 20, textY, 1, false);
      y += 32;
    }
    y += 16;
    
    // Pixelify Sans gradient for comparison
    ctx.fillStyle = '#d4a830'; ctx.font = '10px "Pixelify Sans"';
    ctx.fillText('── Pixelify Sans 20px with Gradients ──', 20, y); y += 20;
    for (const gs of gradSamples.slice(0, 3)) {
      ctx.font = 'bold 20px "Pixelify Sans"';
      const tw = ctx.measureText(gs.text).width;
      const grad = ctx.createLinearGradient(20, 0, 20 + tw, 0);
      for (const [pos, color] of gs.stops) grad.addColorStop(pos, color);
      ctx.fillStyle = grad;
      ctx.fillText(gs.text, 20, y + 16);
      y += 28;
    }
    
    // Track content height for scrollbar
    const contentH = (y - scrollY) - 10;
    state.fontTestContentH = contentH;
    state.fontTestContentW = Math.max(0, 1200 - panelW); // estimated content width overflow
    
    ctx.restore();
    
    // Scroll hint
    ctx.fillStyle = 'rgba(140, 130, 140, 0.6)';
    ctx.font = '10px "Pixelify Sans"';
    ctx.textAlign = 'left';
    ctx.fillText('Scroll: wheel=vertical, shift+wheel=horizontal  |  Press F to close', panelX + 8, panelY + panelH - 6);
    
    // Scrollbar
    const viewH = panelH - 4;
    if (contentH > viewH) {
      const maxScroll = contentH - viewH;
      const scrollRatio = Math.min(1, (state.fontTestScroll || 0) / maxScroll);
      const barH = Math.max(20, Math.round(viewH * viewH / contentH));
      const barY = panelY + 2 + Math.round(scrollRatio * (viewH - barH));
      ctx.fillStyle = state.fontTestDragging ? 'rgba(200, 180, 200, 0.7)' : 'rgba(160, 140, 160, 0.4)';
      ctx.fillRect(panelX + panelW - 8, barY, 6, barH);
    }
  }
  ctx.textAlign = 'left';
}

function drawSprite(ctx, spriteName, x, y, time) {
  const s = TILE * SCALE;
  const spr = sprites[spriteName];
  if (spr && spr.loaded) {
    const frame = Math.floor((time || performance.now()) / ANIM_SPEED) % SPRITE_FRAMES;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spr.img,
      frame * SPRITE_FRAME_SIZE, 0, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
      x, y, s, s
    );
    ctx.imageSmoothingEnabled = true;
  } else {
    // Fallback rectangle
    ctx.fillStyle = spriteName === 'player' ? '#6a8aca' : '#d77643';
    ctx.fillRect(x + s*0.2, y + s*0.15, s*0.6, s*0.7);
  }
}

function drawPlayer(ctx, x, y) {
  const s = TILE * SCALE;
  const sheet = getPlayerSheet();
  if (!sheet.loaded) {
    ctx.fillStyle = '#6a8aca';
    ctx.fillRect(x + s*0.2, y + s*0.15, s*0.6, s*0.7);
    return;
  }
  
  // Left uses right's rows but flipped
  let dir = state.facing;
  let flip = false;
  if (dir === 'left') { dir = 'right'; flip = true; }
  
  const animName = (state.moving ? 'walk_' : 'idle_') + dir;
  const anim = getPlayerSheet().anims[animName] || getPlayerSheet().anims['idle_down'];
  const isRunning = state.moving && keys['Shift'];
  const speed = state.moving ? (isRunning ? 100 : 120) : 400;
  const frame = Math.floor(performance.now() / speed) % anim.frames;
  
  const srcX = frame * getPlayerSheet().frameW;
  const srcY = anim.row * getPlayerSheet().frameH;
  
  const drawSize = s * 2;
  const drawX = Math.round(x - s / 2);
  const drawY = Math.round(y - s / 2);
  
  ctx.imageSmoothingEnabled = false;
  
  if (flip) {
    ctx.save();
    ctx.translate(drawX + drawSize, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(getPlayerSheet().img,
      srcX, srcY, getPlayerSheet().frameW, getPlayerSheet().frameH,
      0, 0, drawSize, drawSize
    );
    ctx.restore();
  } else {
    ctx.drawImage(getPlayerSheet().img,
      srcX, srcY, getPlayerSheet().frameW, getPlayerSheet().frameH,
      drawX, drawY, drawSize, drawSize
    );
  }
  
  ctx.imageSmoothingEnabled = true;
}

function drawCompanion(ctx, x, y, facing, moving, opacity) {
  const s = TILE * SCALE;
  const sheet = getPlayerSheet();
  if (!sheet.loaded) return;

  // Glow effect
  ctx.save();
  ctx.globalAlpha = 0.15 * (opacity / 0.6);
  const glowX = x + s / 2;
  const glowY = y + s / 2;
  const grad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, s * 1.2);
  grad.addColorStop(0, 'rgba(200, 220, 255, 1)');
  grad.addColorStop(1, 'rgba(200, 220, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(glowX, glowY, s * 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  let dir = facing;
  let flip = false;
  if (dir === 'left') { dir = 'right'; flip = true; }

  const animName = (moving ? 'walk_' : 'idle_') + dir;
  const anim = sheet.anims[animName] || sheet.anims['idle_down'];
  const speed = moving ? 120 : 400;
  const frame = Math.floor(performance.now() / speed) % anim.frames;

  const srcX = frame * sheet.frameW;
  const srcY = anim.row * sheet.frameH;
  const drawSize = s * 2;
  const drawX = Math.round(x - s / 2);
  const drawY = Math.round(y - s / 2);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.imageSmoothingEnabled = false;

  if (flip) {
    ctx.translate(drawX + drawSize, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(sheet.img, srcX, srcY, sheet.frameW, sheet.frameH, 0, 0, drawSize, drawSize);
  } else {
    ctx.drawImage(sheet.img, srcX, srcY, sheet.frameW, sheet.frameH, drawX, drawY, drawSize, drawSize);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.restore();
}

// Load chest sprites
const CHEST_CLOSED = new Image(); CHEST_CLOSED.src = 'assets/ui/chests/chest_closed.png';
// Preload planet sprite so it's ready before title screen renders
const PLANET_IMG = new Image(); PLANET_IMG.src = 'assets/effects/planet.png?v=1';
const CHEST_OPEN = new Image(); CHEST_OPEN.src = 'assets/ui/chests/chest_open.png';
// Explosion sprite sheet — 8x9 grid of 64x64, row 0 = fire, 7 frames
const EXPLOSION_IMG = new Image(); EXPLOSION_IMG.src = 'assets/effects/explosion.png';
const EXPLOSION_FRAME_W = 64, EXPLOSION_FRAME_H = 64, EXPLOSION_FRAMES = 7, EXPLOSION_FPS = 14;

function drawEntity(ctx, entity, x, y) {
  if (entity.type === 'Stream') return; // stream entities are invisible anchors
  if (entity.type === 'GroundItem') {
    if (state.openedChests[entity.id]) return; // already picked up
    const itemName = entity.fields.Item || '';
    const spr = GROUND_ITEM_SPRITES[itemName];
    const s = TILE * SCALE;
    const now = performance.now();

    // Smooth bob
    const bob = Math.sin(now / 600) * 3 * SCALE;

    // Shadow — squishes as item bobs up
    const shadowStretch = 1 - Math.abs(bob) / (3 * SCALE) * 0.3;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(
      Math.round(x + s / 2), Math.round(y + s - 2 * SCALE),
      Math.round(s * 0.3 * shadowStretch), Math.round(SCALE * 1.5),
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // Draw sprite at integer-multiple size
    const drawY = Math.round(y - bob);
    if (spr && spr.loaded) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spr.img, Math.round(x), drawY, s, s);
      ctx.imageSmoothingEnabled = true;
    } else {
      ctx.fillStyle = '#c8a040';
      ctx.fillRect(Math.round(x + s * 0.25), drawY + Math.round(s * 0.25), Math.round(s * 0.5), Math.round(s * 0.5));
    }

    // Particles — rising motes + orbiting sparkle
    // Orbiting sparkle
    const sparkAngle = (now / 800) % (Math.PI * 2);
    const sparkR = s * 0.4;
    const sx2 = x + s / 2 + Math.cos(sparkAngle) * sparkR;
    const sy2 = y + s / 2 - bob + Math.sin(sparkAngle) * sparkR * 0.5;
    const sparkAlpha = 0.5 + 0.4 * Math.sin(now / 180);
    ctx.fillStyle = `rgba(255,255,180,${sparkAlpha})`;
    ctx.fillRect(Math.round(sx2), Math.round(sy2), 2, 2);
    // Second sparkle offset
    const spark2Angle = sparkAngle + Math.PI;
    const sx3 = x + s / 2 + Math.cos(spark2Angle) * sparkR * 0.7;
    const sy3 = y + s / 2 - bob + Math.sin(spark2Angle) * sparkR * 0.4;
    const spark2Alpha = 0.3 + 0.3 * Math.sin(now / 250 + 1.5);
    ctx.fillStyle = `rgba(200,220,255,${spark2Alpha})`;
    ctx.fillRect(Math.round(sx3), Math.round(sy3), 2, 2);
    // Rising motes — 3 seeded by entity position
    for (let i = 0; i < 3; i++) {
      const seed = (entity.x * 73 + entity.y * 137 + i * 311) % 1000;
      const period = 2000 + seed;
      const phase = (now + seed * 500) % period;
      const t = phase / period; // 0→1
      const moteX = x + s * 0.2 + (seed % 10) / 10 * s * 0.6;
      const moteY = y + s - t * s * 1.2;
      const moteAlpha = t < 0.1 ? t / 0.1 : t > 0.7 ? (1 - t) / 0.3 : 1;
      ctx.fillStyle = `rgba(255,245,200,${moteAlpha * 0.5})`;
      ctx.fillRect(Math.round(moteX), Math.round(moteY), 1, 1);
    }
    return;
  }
  if (entity.type === 'Chest') {
    const s = TILE * SCALE;
    const img = state.openedChests[entity.id] ? CHEST_OPEN : CHEST_CLOSED;
    if (img.complete && img.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x, y, s, s);
      ctx.imageSmoothingEnabled = true;
    }
    return;
  }
  // Flying enemy hover: bob up/down + shadow
  const enemyData = ENEMY_DATA[entity.type];
  const isFlying = enemyData && enemyData.flying;
  let hoverOffset = 0;
  if (isFlying && !entity.deathAnim) {
    const t = performance.now() / 600;
    hoverOffset = Math.sin(t * Math.PI) * 4 * SCALE;
    // Draw shadow — lower position, shrinks when bat is high
    const s = TILE * SCALE;
    const hoverNorm = Math.sin(t * Math.PI); // 0=low, 1=high
    const shadowScale = 1 - hoverNorm * 0.4; // shrinks to 60% at peak
    ctx.save();
    ctx.globalAlpha = 0.2 + (1 - hoverNorm) * 0.1; // fainter when high
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s + 4 * SCALE, s * 0.22 * shadowScale, s * 0.08 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    y -= hoverOffset;
  }
  // Death animation: flash then fade
  if (entity.deathAnim) {
    const elapsed = performance.now() - entity.deathAnim.startTime;
    if (elapsed < 1200) {
      if (Math.floor(elapsed / 150) % 2 === 1) return;
    } else if (elapsed < 2000) {
      ctx.globalAlpha = 1 - (elapsed - 1200) / 800;
    } else {
      ctx.globalAlpha = 1;
      return;
    }
  }
  // Flip sprite based on facing direction
  if (entity.facing === 'left') {
    ctx.save();
    ctx.translate(x + TILE * SCALE, y);
    ctx.scale(-1, 1);
    drawSprite(ctx, entity.type, 0, 0, performance.now());
    ctx.restore();
  } else {
    drawSprite(ctx, entity.type, x, y, performance.now());
  }
  if (entity.deathAnim) ctx.globalAlpha = 1;
}

