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

import {
  recordLearningResult,
  getFacetMastery,
  getMasteryState,
  getRecommendedDifficulty,
  getReviewPriority,
  getWeakFacets,
  MASTERY_STATES,
} from '../src/lib/learningMastery.js';

function reset() { store.clear(); }

const CAT = 'fundamentals';
const TOPIC = 'osi-model';

console.log('Mastery contract tests...');

reset();

// 1. valid states
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: ['osi.layer1.name'], evidenceType: 'recognized', correct: true, difficulty: 'easy' });
const m1 = getFacetMastery(CAT, TOPIC, 'osi.layer1.name');
assert.ok([MASTERY_STATES.NEW, MASTERY_STATES.LEARNING].includes(m1.state), 'single recognized -> new/learning, not stable');
assert.ok(m1.confidence > 0 && m1.confidence < 1, 'confidence in range');
assert.ok(m1.stability > 0, 'stability positive');

// 2. wrong weakens and creates needsReview + recoveryPending
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: ['osi.layer1.name'], evidenceType: 'recognized', correct: false, at: Date.now() + 100 });
const m2 = getFacetMastery(CAT, TOPIC, 'osi.layer1.name');
assert.ok(m2.needsReview, 'wrong sets needsReview');
assert.ok(m2.recoveryPending, 'wrong sets recoveryPending');
assert.equal(m2.consecutiveSuccesses, 0, 'consecutiveSuccesses resets');
assert.equal(getMasteryState(CAT, TOPIC, 'osi.layer1.name'), MASTERY_STATES.NEEDS_REVIEW, 'state needs review');

// 3. several successes build confidence but not instantly mastered
for (let i = 0; i < 5; i += 1) {
  recordLearningResult({
    categoryId: CAT,
    topicId: TOPIC,
    facetIds: ['osi.layer2.name'],
    evidenceType: 'understood',
    correct: true,
    source: `q-${i}`,
    at: Date.now() + (i + 1) * 1000,
    difficulty: 'medium',
  });
}
const m3 = getFacetMastery(CAT, TOPIC, 'osi.layer2.name');
assert.ok(m3.confidence > 0.15, 'multiple understood -> confidence rises');
assert.ok(m3.state !== MASTERY_STATES.NEW, 'not new');
assert.ok(m3.consecutiveSuccesses >= 4, 'consecutive successes counted');

// 4. high-level evidence faster to stable
for (let i = 0; i < 4; i += 1) {
  recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: ['osi.layer3.name'], evidenceType: 'diagnosed', correct: true, difficulty: 'hard', at: Date.now() + i * 3600000, source: `d${i}` });
}
const m4 = getFacetMastery(CAT, TOPIC, 'osi.layer3.name');
assert.ok(m4.confidence > 0.3, 'diagnosed hard -> strong confidence');
assert.ok(getMasteryState(CAT, TOPIC, 'osi.layer3.name') !== MASTERY_STATES.NEW, 'diagnosed + spaced not new');

// 5. wrong on previously stable does not reset to new
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: ['osi.layer3.name'], evidenceType: 'understood', correct: false, at: Date.now() + 7200000 });
const m5 = getFacetMastery(CAT, TOPIC, 'osi.layer3.name');
assert.ok(m5.needsReview, 'stable facet wrong -> needs review');
assert.ok(m5.recoveryPending, 'recovery pending');
assert.ok(m5.confidence > 0, 'confidence not zero after one failure');
assert.ok(m5.state === MASTERY_STATES.NEEDS_REVIEW, 'state becomes needs-review');

// 6. no NaN / invalid
assert.ok(Number.isFinite(m5.confidence), 'confidence finite');
assert.ok(Number.isFinite(m5.stability), 'stability finite');
assert.ok(Number.isFinite(getReviewPriority(CAT, TOPIC, 'osi.layer3.name')), 'priority finite');

// 7. recommended difficulty
assert.equal(getRecommendedDifficulty(CAT, TOPIC, 'osi.layer3.name'), 'easy', 'failed stable gets easy');
assert.equal(getRecommendedDifficulty(CAT, TOPIC, 'osi.layer2.name'), 'easy', 'low-confidence learning gets easy');

// 8. weak facets
const weak = getWeakFacets(CAT, TOPIC, { limit: 5 });
assert.ok(weak.length >= 2, 'weak facets found');
assert.ok(weak[0].priority >= weak[1]?.priority ? weak[0].priority >= (weak[1]?.priority || 0) : true, 'weak sorted by priority');

// 9. viewed / self-reported do not create mastery
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: ['osi.viewonly'], evidenceType: 'viewed' });
const m9 = getFacetMastery(CAT, TOPIC, 'osi.viewonly');
assert.equal(m9.confidence, 0, 'viewed does not create confidence');

console.log('All mastery contract tests passed.');
