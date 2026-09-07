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

import { recordLearningResult, getReviewPriority, getReviewCandidates } from '../src/lib/learningMastery.js';

function reset() { store.clear(); }

const CAT = 'fundamentals';
const TOPIC = 'osi-model';
const t0 = Date.now();

console.log('Review priority tests...');

reset();

// Facet A: recent failure
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: ['A'], evidenceType: 'understood', correct: false, source: 'a1', at: t0 });

// Facet B: recent success
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: ['B'], evidenceType: 'understood', correct: true, source: 'b1', at: t0 });

// Facet C: multiple stable successes over time
for (let i = 0; i < 4; i += 1) {
  recordLearningResult({
    categoryId: CAT,
    topicId: TOPIC,
    facetIds: ['C'],
    evidenceType: 'diagnosed',
    correct: true,
    source: `c${i}`,
    at: t0 + i * 24 * 60 * 60 * 1000,
    difficulty: 'hard',
  });
}

// Facet D: long not seen
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: ['D'], evidenceType: 'recognized', correct: true, source: 'd1', at: t0 - 10 * 24 * 60 * 60 * 1000 });

const pA = getReviewPriority(CAT, TOPIC, 'A');
const pB = getReviewPriority(CAT, TOPIC, 'B');
const pC = getReviewPriority(CAT, TOPIC, 'C');
const pD = getReviewPriority(CAT, TOPIC, 'D');

assert.ok(pA > pB, 'recent failure has higher priority than recent success');
assert.ok(pA > pC, 'recent failure has higher priority than stable');
assert.ok(pD > pC, 'long not seen rises above stable');
assert.ok(pD < pA, 'long not seen still below active failure');

const candidates = getReviewCandidates(CAT, TOPIC, { limit: 10 });
assert.equal(candidates[0].facetId, 'A', 'highest priority candidate is A');

console.log('All review priority tests passed.');
