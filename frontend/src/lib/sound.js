function tone(frequency, duration, type = 'sine', volume = 0.06) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch {}
}

export function playClickSound() { tone(420, 0.05, 'square', 0.025); }
export function playQuizFeedback(correct) { tone(correct ? 660 : 180, correct ? 0.16 : 0.28, correct ? 'sine' : 'sawtooth', correct ? 0.08 : 0.06); }
export function enableUiSounds() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button && !button.disabled && localStorage.getItem('cyberlearn:sound') !== 'off') playClickSound();
  });
}

// === Ambient Sound System ===
// All sounds synthesized via Web Audio API - no files needed.

let ambientCtx = null;
let ambientNodes = [];
let ambientRunning = false;

function isSoundEnabled() { return localStorage.getItem('cyberlearn:sound') !== 'off'; }

function createNoise(context, duration) {
  const bufferSize = context.sampleRate * duration;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function startAmbient() {
  if (ambientRunning || !isSoundEnabled()) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ambientCtx = new AC();
    // Server fan hum - very low filtered noise
    const noise = ambientCtx.createBufferSource();
    noise.buffer = createNoise(ambientCtx, 4);
    noise.loop = true;
    const fanFilter = ambientCtx.createBiquadFilter();
    fanFilter.type = 'lowpass';
    fanFilter.frequency.value = 120;
    const fanGain = ambientCtx.createGain();
    fanGain.gain.value = 0.012;
    noise.connect(fanFilter).connect(fanGain).connect(ambientCtx.destination);
    noise.start();
    // Low electrical hum (50Hz mains)
    const hum = ambientCtx.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 50;
    const humGain = ambientCtx.createGain();
    humGain.gain.value = 0.004;
    hum.connect(humGain).connect(ambientCtx.destination);
    hum.start();
    ambientNodes = [noise, hum];
    ambientRunning = true;
  } catch {}
}

export function stopAmbient() {
  if (!ambientRunning) return;
  try {
    ambientNodes.forEach((n) => { try { n.stop(); } catch {} });
    ambientNodes = [];
    if (ambientCtx) ambientCtx.close();
    ambientCtx = null;
    ambientRunning = false;
  } catch {}
}

// One-shot ambient events
export function playKeyboardTap() {
  if (!isSoundEnabled()) return;
  const base = 2000 + Math.random() * 2000;
  tone(base, 0.03, 'square', 0.008);
}

export function playPhoneRing() {
  if (!isSoundEnabled()) return;
  tone(1400, 0.12, 'sine', 0.04);
  setTimeout(() => tone(1800, 0.12, 'sine', 0.04), 150);
}

export function playMailNotification() {
  if (!isSoundEnabled()) return;
  tone(880, 0.08, 'sine', 0.03);
  setTimeout(() => tone(1100, 0.1, 'sine', 0.035), 100);
  setTimeout(() => tone(1320, 0.14, 'sine', 0.03), 220);
}

export function playMonitorOn() {
  if (!isSoundEnabled()) return;
  tone(200, 0.15, 'sine', 0.02);
  setTimeout(() => tone(400, 0.08, 'sine', 0.015), 100);
}
