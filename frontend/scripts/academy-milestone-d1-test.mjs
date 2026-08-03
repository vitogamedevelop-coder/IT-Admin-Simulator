import assert from 'node:assert/strict';
import {
  CORRIDOR_ROOMS,
  buildDefaultDialog,
  buildSamOfficeDialog,
} from '../src/lib/corridorDialogs.js';
import { shuffleOptions } from '../src/lib/shuffleOptions.js';
import { OSI_LAYERS, layerQuestion, buildOsiLesson } from '../src/lib/academyLessons/osi.js';
import { getTopicScoreDimensions } from '../src/lib/academyLessonData.js';

// Minimal browser mock because some dialog builders read localStorage.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, { detail } = {}) { this.type = type; this.detail = detail; }
};

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function nodeById(dialog, id) {
  return dialog.nodes.find((n) => n.id === id);
}

// ============================================================
// 1. Corridor hotspot only leads to the overview menu.
// ============================================================
console.log('Testing corridor hotspot...');
assertEqual(CORRIDOR_ROOMS.length, 3, 'Three corridor rooms');
const actions = new Set(CORRIDOR_ROOMS.map((r) => r.action));
assertEqual(actions.size, 3, 'Each room has a distinct action');
const labels = CORRIDOR_ROOMS.map((r) => r.label);
assert(labels.includes("Sam's Büro"), 'Sam office room present');
assert(labels.includes('Aufenthaltsraum'), 'Break room present');
assert(labels.includes('Mitarbeiter'), 'Colleagues room present');
for (const room of CORRIDOR_ROOMS) {
  assert(room.description && room.description.length > 0, `${room.label} has a description`);
}

// ============================================================
// 2. Sam office menu has exactly four entries and closes correctly.
// ============================================================
console.log('Testing Sam office dialog...');
const samOffice = buildSamOfficeDialog();
assertEqual(samOffice.nodes.length, 5, 'Sam office has 5 nodes');
const startNode = nodeById(samOffice, 'start');
assert(startNode, 'Sam office has start node');
assertEqual(startNode.options.length, 4, 'Sam office menu has exactly 4 options');
const labelsLower = startNode.options.map((o) => o.label.toLowerCase());
assert(!labelsLower.some((l) => l.includes('fragen')), 'Ich habe Fragen removed');
assert(labelsLower.some((l) => l.includes('lernen')), 'Learn option present');
assert(labelsLower.some((l) => l.includes('weit')), 'Progress option present');
assert(labelsLower.some((l) => l.includes('reden')), 'Smalltalk option present');
assert(labelsLower.some((l) => l.includes('später')), 'Bye option present');

assertEqual(nodeById(samOffice, 'smalltalk').onComplete?.action, 'close', 'Smalltalk closes dialog');
assertEqual(nodeById(samOffice, 'bye').onComplete?.action, 'close', 'Bye closes dialog');

// ============================================================
// 3. Default hallway fallback also closes on smalltalk/bye.
// ============================================================
console.log('Testing default hallway dialog...');
const defaultDialog = buildDefaultDialog();
assertEqual(nodeById(defaultDialog, 'smalltalk').onComplete?.action, 'close', 'Default smalltalk closes');
assertEqual(nodeById(defaultDialog, 'bye').onComplete?.action, 'close', 'Default bye closes');

// ============================================================
// 4. Shuffle helper keeps options and remaps correct index.
// ============================================================
console.log('Testing option shuffling...');
const opts = ['A', 'B', 'C', 'D'];
const { options: shuffled, correct } = shuffleOptions(opts, 2);
assertEqual(shuffled.length, opts.length, 'Shuffled length matches');
assertEqual([...shuffled].sort().join(','), [...opts].sort().join(','), 'Shuffled options are the same set');
assertEqual(shuffled[correct], 'C', 'Correct index maps to original option C');
let differentOrderSeen = false;
for (let i = 0; i < 20; i += 1) {
  const run = shuffleOptions(opts, 2);
  if (run.options[0] !== opts[0] || run.options[1] !== opts[1]) differentOrderSeen = true;
}
assert(differentOrderSeen, 'Shuffle produces varying order at least sometimes');

// ============================================================
// 5. OSI ordering exercise no longer shows fixed numbers.
// ============================================================
console.log('Testing OSI ordering exercise...');
const osiLesson = buildOsiLesson();
const ordering = osiLesson.exercises.find((ex) => ex.id === 'osi-ordering');
assert(ordering, 'OSI ordering exercise exists');
for (const item of ordering.items) {
  assert(!/^\d+\./.test(item.label), `Ordering item "${item.label}" has no leading number`);
}
assert(ordering.correctOrder.join(',') === OSI_LAYERS.map((l) => `l${l.num}`).join(','), 'OSI correct order unchanged');

// ============================================================
// 6. OSI layer questions have varied options.
// ============================================================
console.log('Testing OSI layer questions...');
for (const layer of OSI_LAYERS) {
  const q = layerQuestion(layer);
  assertEqual(q.options.length, 3, `Layer ${layer.num} has 3 options`);
  const unique = new Set(q.options);
  assertEqual(unique.size, 3, `Layer ${layer.num} options are distinct`);
  assert(q.options.some((o) => o.includes(layerTaskStub(layer.num))), `Layer ${layer.num} correct option present`);
}

function layerTaskStub(num) {
  const tasks = [
    'elektrische, optische oder funk',
    'zuverlässige Übertragung im lokalen Netz',
    'wegweisendes Routing zwischen Netzwerken',
    'Ende-zu-Ende-Verbindungen',
    'Aufbau, Steuerung und Beendigung',
    'Umsetzung von Anwendungsdaten',
    'Schnittstelle für Anwendungen',
  ];
  return tasks[num - 1];
}

// ============================================================
// 7. Score dimensions are shown only when relevant.
// ============================================================
console.log('Testing dynamic score dimensions...');
const binaryDims = getTopicScoreDimensions('fundamentals', 'binary-system');
assert(binaryDims.theory && binaryDims.practice && !binaryDims.retention, 'Binary system shows theory + practice');
const ipv4Dims = getTopicScoreDimensions('fundamentals', 'ipv4');
assert(ipv4Dims.theory && ipv4Dims.practice && !ipv4Dims.retention, 'IPv4 shows theory + practice');
const subnetDims = getTopicScoreDimensions('fundamentals', 'subnet-masks');
assert(subnetDims.theory && subnetDims.practice && !subnetDims.retention, 'Subnet masks shows theory + practice');
// network-basics topic removed; grundbegriffe replaces it
const grundDims = getTopicScoreDimensions('fundamentals', 'grundbegriffe');
assert(grundDims.theory && !grundDims.practice && !grundDims.retention, 'Grundbegriffe shows theory only');
const tcpDims = getTopicScoreDimensions('fundamentals', 'tcp');
assert(tcpDims.theory && !tcpDims.practice && !tcpDims.retention, 'TCP shows theory');
const placeholderDims = getTopicScoreDimensions('fundamentals', 'dhcp');
assert(!placeholderDims.theory && !placeholderDims.practice && !placeholderDims.retention, 'Placeholder shows no scores');

console.log('All Milestone D1 tests passed.');
