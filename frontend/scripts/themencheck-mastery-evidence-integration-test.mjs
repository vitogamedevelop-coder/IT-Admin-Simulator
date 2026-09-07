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

import { saveThemencheckResult } from '../src/lib/academyThemencheck.js';
import { getFacetMastery, getReviewPriority } from '../src/lib/learningMastery.js';

console.log('Themencheck mastery integration tests...');

store.clear();

const result = saveThemencheckResult('fundamentals', {
  questions: [
    { question: 'Q1', sourceTopicId: 'osi-model', correct: 0, competency: 'recall', facet: 'osi.layer1.name', difficulty: 'easy' },
    { question: 'Q2', sourceTopicId: 'osi-model', correct: 1, competency: 'diagnosis', facet: 'osi.diag', difficulty: 'medium' },
    { question: 'Q3', sourceTopicId: 'osi-model', correct: 0, competency: 'interpretation', facet: 'osi.interpret', difficulty: 'hard' },
  ],
  answers: [
    { selectedIndex: 0, correct: true, sourceTopicId: 'osi-model' },
    { selectedIndex: 1, correct: false, sourceTopicId: 'osi-model' },
    { selectedIndex: 0, correct: true, sourceTopicId: 'osi-model' },
  ],
  startedAt: Date.now() - 300000,
  finishedAt: Date.now(),
});

assert.ok(result, 'saveThemencheckResult returns entry');

const mRecall = getFacetMastery('fundamentals', 'osi-model', 'osi.layer1.name');
assert.ok(mRecall.confidence > 0, 'recall correct builds confidence');

const mDiagnosis = getFacetMastery('fundamentals', 'osi-model', 'osi.diag');
assert.ok(mDiagnosis.recoveryPending, 'wrong diagnosis marks recovery pending');
assert.ok(getReviewPriority('fundamentals', 'osi-model', 'osi.diag') > 30, 'wrong diagnosis has high review priority');

const mInterpret = getFacetMastery('fundamentals', 'osi-model', 'osi.interpret');
assert.ok(mInterpret.confidence > 0, 'interpretation correct builds confidence');

console.log('All Themencheck mastery integration tests passed.');
