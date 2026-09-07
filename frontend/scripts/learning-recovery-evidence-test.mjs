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

import { recordLearningResult, getFacetMastery, needsRecovery, markRecoverySuccess } from '../src/lib/learningMastery.js';

function reset() { store.clear(); }

const CAT = 'fundamentals';
const TOPIC = 'osi-model';
const FACET = 'dhcp.relay';
const t0 = Date.now();

console.log('Recovery evidence tests...');

reset();

// 1. wrong -> recovery pending
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: [FACET], evidenceType: 'diagnosed', correct: false, source: 'q1', at: t0 });
assert.ok(needsRecovery(CAT, TOPIC, FACET), 'wrong creates recovery pending');

// 2. immediately same source correct -> still pending (short-term memory)
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: [FACET], evidenceType: 'diagnosed', correct: true, source: 'q1', at: t0 + 500 });
assert.ok(needsRecovery(CAT, TOPIC, FACET), 'same-source quick correct does not clear recovery');

// 3. different source correct but too soon (within min gap) -> still pending
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: [FACET], evidenceType: 'diagnosed', correct: true, source: 'q2', at: t0 + 1000 });
assert.ok(needsRecovery(CAT, TOPIC, FACET), 'too-soon different source still pending');

// 4. different source after enough time -> recovery clears
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: [FACET], evidenceType: 'diagnosed', correct: true, source: 'q3', at: t0 + 120000 });
assert.ok(!needsRecovery(CAT, TOPIC, FACET), 'spaced different correct clears recovery');

// 5. markRecoverySuccess explicit clears
reset();
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: [FACET], evidenceType: 'understood', correct: false, source: 'qA', at: t0 });
const cleared = markRecoverySuccess(CAT, TOPIC, FACET, { evidenceType: 'understood', source: 'qB', at: t0 + 120000 });
assert.ok(cleared, 'explicit mark recovery clears');
assert.ok(!needsRecovery(CAT, TOPIC, FACET), 'explicit mark recovery successful');

// 6. recovery after failure -> not instantly mastered
reset();
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: [FACET], evidenceType: 'understood', correct: false, source: 'qA', at: t0 });
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: [FACET], evidenceType: 'understood', correct: true, source: 'qB', at: t0 + 120000 });
const m = getFacetMastery(CAT, TOPIC, FACET);
assert.ok(!m.recoveryPending, 'recovery closed by spaced correct');
assert.ok(m.confidence < 1, 'confidence not maxed after recovery');

console.log('All recovery evidence tests passed.');
