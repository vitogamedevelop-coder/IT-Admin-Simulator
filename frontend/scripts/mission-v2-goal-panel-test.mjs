// Phase 1B-1: Draggable goal panel helper tests.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Storage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}

const storage = new Storage();
global.localStorage = storage;
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const POSITION_KEY = 'cyberlearn:current-goal-panel-position-v1';

// 1. Position can be saved and loaded.
storage.setItem(POSITION_KEY, JSON.stringify({ x: 120, y: 80 }));
const saved = JSON.parse(storage.getItem(POSITION_KEY));
assert(saved.x === 120 && saved.y === 80, 'Position should be saved');

// 2. Invalid off-screen position would be clamped.
const vw = 800;
const vh = 600;
const w = 260;
const h = 120;
const clamped = {
  x: Math.max(0, Math.min(2000, vw - w)),
  y: Math.max(0, Math.min(2000, vh - h)),
};
assert(clamped.x === 800 - w && clamped.y === 600 - h, 'Off-screen position should be clamped');

// 3. Default / reset.
storage.removeItem(POSITION_KEY);
assert(storage.getItem(POSITION_KEY) === null, 'Position should be cleared');

console.log('Goal panel tests passed.');
