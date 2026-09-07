import assert from 'node:assert/strict';

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

import { recordLearningResult, getFacetMastery } from '../src/lib/learningMastery.js';

function reset() { store.clear(); }

const CAT = 'fundamentals';
const TOPIC = 'osi-model';
const t0 = Date.now();

console.log('Temporal mastery tests...');

reset();

// Spaced successes over a week
for (let i = 0; i < 3; i += 1) {
  recordLearningResult({
    categoryId: CAT,
    topicId: TOPIC,
    facetIds: ['spaced'],
    evidenceType: 'understood',
    correct: true,
    source: `s${i}`,
    at: t0 + i * 24 * 60 * 60 * 1000,
  });
}

// Identical rapid successes on a different topic to avoid clearing spaced data.
for (let i = 0; i < 3; i += 1) {
  recordLearningResult({
    categoryId: CAT,
    topicId: 'tcp-ip-model',
    facetIds: ['rapid'],
    evidenceType: 'understood',
    correct: true,
    source: `r${i}`,
    at: t0 + i * 100,
  });
}

const spaced = getFacetMastery(CAT, TOPIC, 'spaced');
const rapid = getFacetMastery(CAT, 'tcp-ip-model', 'rapid');

assert.ok(spaced.stability > rapid.stability, 'spaced success yields higher stability');
assert.ok(spaced.confidence >= rapid.confidence, 'spaced success yields at least equal confidence');

console.log('All temporal mastery tests passed.');
