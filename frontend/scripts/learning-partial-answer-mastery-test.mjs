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
import { EVIDENCE_TYPES, getHighestEvidenceForFacet } from '../src/lib/learningEvidence.js';

function reset() { store.clear(); }

const CAT = 'fundamentals';
const TOPIC = 'osi-model';
const FACET = 'linux.chmod';

console.log('Partial answer mastery tests...');

reset();

// 1. partial recall does not grant full evidence
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: [FACET], evidenceType: 'recalled', correct: false, partial: true, source: 'chmod-1' });
const highest = getHighestEvidenceForFacet(CAT, TOPIC, FACET);
assert.notEqual(highest, EVIDENCE_TYPES.RECALLED, 'partial does not grant full recalled evidence');
const m = getFacetMastery(CAT, TOPIC, FACET);
assert.ok(m.confidence > 0 && m.confidence < 0.4, 'partial gives low confidence');
assert.ok(m.needsReview, 'partial flags needsReview if confidence low');

// 2. partial is not total wrong
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: [FACET], evidenceType: 'recalled', correct: false, partial: false, source: 'chmod-2', at: Date.now() + 1000 });
const mWrong = getFacetMastery(CAT, TOPIC, FACET);
assert.ok(mWrong.confidence < m.confidence, 'wrong lowers confidence more than partial');
assert.ok(mWrong.recentFailureCount > m.recentFailureCount, 'wrong increments failure count');

// 3. later full correct overwrites partial
recordLearningResult({ categoryId: CAT, topicId: TOPIC, facetIds: [FACET], evidenceType: 'recalled', correct: true, source: 'chmod-3', at: Date.now() + 2000 });
const mFull = getFacetMastery(CAT, TOPIC, FACET);
assert.equal(getHighestEvidenceForFacet(CAT, TOPIC, FACET), EVIDENCE_TYPES.RECALLED, 'full correct grants recalled evidence');
assert.ok(mFull.confidence > m.confidence, 'full correct raises confidence above partial');

console.log('All partial answer mastery tests passed.');
