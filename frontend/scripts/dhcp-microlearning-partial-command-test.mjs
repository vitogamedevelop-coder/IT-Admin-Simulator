import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

import { recordLearningResult, getFacetMastery, getMasteryState, getRecommendedDifficulty } from '../src/lib/learningMastery.js';
import { readAcademyProgress } from '../src/lib/academyProgress.js';

const categoryId = 'cisco-packet-tracer';
const topicId = 'dhcp';
const FACET = 'ciscoDhcp.helperPlacement';

readAcademyProgress();

recordLearningResult({
  categoryId, topicId, facetIds: [FACET],
  evidenceType: 'recalled', correct: true, partial: true,
  difficulty: 'medium', source: 'partial-cmd',
});

const m = getFacetMastery(categoryId, topicId, FACET);
assert.equal(m.consecutiveSuccesses, 0, 'partial does not count as full success streak');
assert.ok(getMasteryState(categoryId, topicId, FACET) !== 'stable', 'partial does not produce mastery');
assert.ok(getRecommendedDifficulty(categoryId, topicId, FACET) !== 'hard', 'partial recommends lower/equal difficulty');

console.log('DHCP partial command OK');
