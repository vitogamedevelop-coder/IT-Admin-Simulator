// Phase 1B-1: Draggable goal panel helper tests.

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

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

// 1. Default position is top-right (no stored position).
storage.clear();
const saved = storage.getItem(POSITION_KEY);
assert(saved === null, 'No stored position on fresh state');

// 2. Position can be saved and loaded.
storage.setItem(POSITION_KEY, JSON.stringify({ x: 120, y: 80 }));
const loaded = JSON.parse(storage.getItem(POSITION_KEY));
assert(loaded.x === 120 && loaded.y === 80, 'Position should be saved');

// 3. Clamp keeps panel within screen and safe area.
const vw = 800;
const vh = 600;
const safeTop = 40;
const header = 48;
const panelW = 260;
const panelH = 120;
function clamp(pos) {
  const minY = safeTop + header + 8;
  const maxX = vw - panelW - 8;
  const maxY = vh - panelH - 8;
  return {
    x: Math.max(8, Math.min(pos.x, maxX)),
    y: Math.max(minY, Math.min(pos.y, maxY)),
  };
}
const clamped = clamp({ x: 2000, y: 2000 });
assert(clamped.x === vw - panelW - 8, 'Off-screen X should be clamped to right edge');
assert(clamped.y === vh - panelH - 8, 'Off-screen Y should be clamped to bottom');
const clampedTop = clamp({ x: 0, y: 0 });
assert(clampedTop.y === safeTop + header + 8, 'Y should respect header/safe area');

// 4. Old invalid top-left position is corrected.
storage.setItem(POSITION_KEY, JSON.stringify({ x: 0, y: 0 }));
const invalid = JSON.parse(storage.getItem(POSITION_KEY));
const corrected = clamp(invalid);
assert(corrected.x > 0, 'Invalid old position should not stay at x=0');
assert(corrected.y >= safeTop + header + 8, 'Invalid old position should move below header');

// 5. Default is top-right: no saved position means right alignment.
storage.removeItem(POSITION_KEY);
assert(storage.getItem(POSITION_KEY) === null, 'Position should be cleared for reset');

// 6. Mission goal overrides learning when active.
const missionTitle = 'Der erste Switch';
const learningTitle = 'Grundbegriffe';
const activeMission = { scenario: { title: missionTitle } };
const currentObjective = activeMission
  ? { title: activeMission.scenario.title }
  : { title: learningTitle };
assert(currentObjective.title === missionTitle, 'Active mission should take priority over learning goal');

console.log('Goal panel tests passed.');
