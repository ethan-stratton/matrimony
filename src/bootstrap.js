// ══════════════════════════════════
// LDtk LEVEL DATA (embedded)
// ══════════════════════════════════
let levelData = null;

// ══════════════════════════════════
// GAME CONFIG
// ══════════════════════════════════
const TILE = 16;       // tile size in pixels
const SCALE = 2;       // render scale (16px tiles → 32px on screen)
const CANVAS_W = 640;  // native resolution width
const CANVAS_H = 480;  // native resolution height
const DISPLAY_SCALE = 1.4; // CSS scale for display
const CANVAS_TILES_X = Math.ceil(CANVAS_W / (TILE * SCALE)) + 1;
const CANVAS_TILES_Y = Math.ceil(CANVAS_H / (TILE * SCALE)) + 1;
const canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

// ══════════════════════════════════
// AUDIO
// ══════════════════════════════════
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}
// Unlock audio on first interaction (silent buffer trick for Safari)
function unlockAudio() {
  const ac = getAudioCtx();
  const buf = ac.createBuffer(1, 1, ac.sampleRate);
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.connect(ac.destination);
  src.start(0);
  if (ac.state !== 'running') ac.resume();
  // Start title music if on title screen
  if (state.screen === 'title' && !titleMusicStarted) {
    titleMusic.play().then(() => { console.log('title music started via unlockAudio'); titleMusicStarted = true; }).catch(e => console.warn('title music unlock fail:', e));
  }
  // Start ambient wind
  startAmbientWind();
}
document.addEventListener('touchstart', unlockAudio, { once: true });
document.addEventListener('mousedown', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });

let windNode = null;
function startAmbientWind() {
  if (windNode) return;
  const ac = getAudioCtx();
  // Generate brown noise (low-freq wind)
  const len = ac.sampleRate * 2;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  // Low-pass for soft wind
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  // Very quiet
  const gain = ac.createGain();
  gain.gain.value = 0.06;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  src.start(0);
  windNode = { src, gain };
}
let footstepAlt = false;
function playFootstep() {
  const ac = getAudioCtx();
  if (ac.state !== 'running') return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'square';
  const basePitch = footstepAlt ? 175 : 145;
  osc.frequency.value = basePitch + (Math.random() - 0.5) * 40;
  footstepAlt = !footstepAlt;
  gain.gain.value = 0.1;
  osc.connect(gain);
  gain.connect(ac.destination);
  const t = ac.currentTime;
  osc.start(t);
  osc.stop(t + 0.07);
  // Fade out manually
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.07);
}
function playTick() {
  const ac = getAudioCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'square';
  osc.frequency.value = 600;
  gain.gain.value = 0.12;
  osc.connect(gain);
  gain.connect(ac.destination);
  const t = ac.currentTime;
  osc.start(t);
  osc.stop(t + 0.05);
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.05);
}
function playHit(isEnemy) {
  const ac = getAudioCtx();
  const bufferSize = Math.floor(ac.sampleRate * 0.1);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const gain = ac.createGain();
  const t = ac.currentTime;
  gain.gain.value = isEnemy ? 0.2 : 0.15;
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.1);
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = isEnemy ? 800 : 1200;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  src.start(t);
}
function playChestOpen() {
  const ac = getAudioCtx();
  if (ac.state !== 'running') return;
  const t = ac.currentTime;
  // Ascending sparkle — three quick tones
  [523, 659, 784].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    gain.gain.setValueAtTime(0.08, t + i * 0.08);
    gain.gain.linearRampToValueAtTime(0, t + i * 0.08 + 0.12);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t + i * 0.08);
    osc.stop(t + i * 0.08 + 0.12);
  });
}
function playBattleStart() {
  const ac = getAudioCtx();
  if (ac.state !== 'running') return;
  const t = ac.currentTime;
  // Rising sweep + impact
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.25);
  gain.gain.value = 0.1;
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0.15, t + 0.2);
  gain.gain.linearRampToValueAtTime(0, t + 0.35);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.35);
  // Impact thud at end
  const bufSize = Math.floor(ac.sampleRate * 0.1);
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g2 = ac.createGain();
  g2.gain.value = 0.2;
  g2.gain.setValueAtTime(0.2, t + 0.25);
  g2.gain.linearRampToValueAtTime(0, t + 0.4);
  const filt = ac.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 600;
  src.connect(filt);
  filt.connect(g2);
  g2.connect(ac.destination);
  src.start(t + 0.25);
}
// ── Earthbound-style battle backgrounds (loaded from JSON) ──
let EB_PALETTES = {};
let EB_PRESETS = {};
let ENEMY_BG = {};

// ── Load all game data from JSON files ──
async function loadGameData() {
  const v = '?v=' + Date.now();
  const [bgData, enemyData, actionData] = await Promise.all([
    fetch('assets/data/backgrounds.json' + v).then(r => r.json()),
    fetch('assets/data/enemies.json' + v).then(r => r.json()),
    fetch('assets/data/actions.json' + v).then(r => r.json()),
  ]);
  // Populate background globals
  Object.assign(EB_PALETTES, bgData.palettes);
  Object.assign(EB_PRESETS, bgData.presets);
  Object.assign(ENEMY_BG, bgData.enemyBackgrounds);
  // Populate combat globals
  Object.assign(ENEMY_DATA, enemyData);
  Object.assign(COMBAT_ACTIONS, actionData);
  console.log('[Data] Loaded', Object.keys(ENEMY_DATA).length, 'enemies,', Object.keys(COMBAT_ACTIONS).length, 'actions,', Object.keys(EB_PRESETS).length, 'BG presets');
}

function ebSampleColors(colors, t) {
  const n = colors.length;
  const idx = ((t % 1) + 1) % 1 * n;
  const i0 = Math.floor(idx) % n;
  const i1 = (i0 + 1) % n;
  const f = idx - Math.floor(idx);
  return [
    colors[i0][0] + (colors[i1][0] - colors[i0][0]) * f,
    colors[i0][1] + (colors[i1][1] - colors[i0][1]) * f,
    colors[i0][2] + (colors[i1][2] - colors[i0][2]) * f
  ];
}

function ebBasePattern(x, y, scale) {
  const sx = x / (32 * scale), sy = y / (32 * scale);
  const v = (Math.sin(sx * 6.28) * Math.cos(sy * 6.28)
           + Math.sin((sx + sy) * 4.5)
           + Math.cos((sx - sy) * 3.7)) / 3;
  return (v + 1) / 2;
}

// Offscreen canvas for EB background
let ebCanvas = null, ebCtx = null, ebImgData = null, ebBuf = null;
let ebTime = 0;

function drawEBBackground(ctx, x, y, w, h, presetName) {
  if (!ebCanvas) {
    ebCanvas = document.createElement('canvas');
    ebCanvas.width = 128; // low-res for performance
    ebCanvas.height = 64;
    ebCtx = ebCanvas.getContext('2d');
    ebImgData = ebCtx.createImageData(128, 64);
    ebBuf = ebImgData.data;
  }
  const preset = EB_PRESETS[presetName] || EB_PRESETS['Giygas'];
  const RW = 128, RH = 64;
  ebTime++;
  const t = ebTime;
  
  // Render two layers and blend
  for (let py = 0; py < RH; py++) {
    for (let px = 0; px < RW; px++) {
      let r = 0, g = 0, b = 0;
      for (const [li, layer] of [preset.l1, preset.l2].entries()) {
        if (!layer) continue;
        const offset = layer.amp * Math.sin(layer.freq * py + layer.speed * t);
        let sx = px, sy = py;
        if (layer.distType === 0) sx = px + offset;
        else if (layer.distType === 1) sx = px + (py % 2 === 0 ? offset : -offset);
        else if (layer.distType === 2) sy = py + offset;
        sx += layer.scrollX * t;
        sy += layer.scrollY * t;
        const v = ebBasePattern(sx, sy, layer.scale);
        const palT = v + layer.palSpeed * t * 0.001;
        const pal = EB_PALETTES[layer.palette] || EB_PALETTES['fire'];
        const c = ebSampleColors(pal, palT);
        const op = li === 1 ? (layer.opacity || 0.5) : 1;
        if (li === 0) { r = c[0]; g = c[1]; b = c[2]; }
        else { r = r * (1 - op) + c[0] * op; g = g * (1 - op) + c[1] * op; b = b * (1 - op) + c[2] * op; }
      }
      const bi = (py * RW + px) * 4;
      ebBuf[bi] = r | 0; ebBuf[bi+1] = g | 0; ebBuf[bi+2] = b | 0; ebBuf[bi+3] = 255;
    }
  }
  ebCtx.putImageData(ebImgData, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(ebCanvas, x, y, w, h);
  ctx.imageSmoothingEnabled = false;
}

canvas.style.width = (CANVAS_W * DISPLAY_SCALE) + 'px';
canvas.style.height = (CANVAS_H * DISPLAY_SCALE) + 'px';

