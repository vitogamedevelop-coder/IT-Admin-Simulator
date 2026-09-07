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

import { readAcademyProgress, writeAcademyProgress } from '../src/lib/academyProgress.js';
import { topicKey } from '../src/lib/academyTopics.js';

console.log('Academy progress evidence migration tests...');

store.clear();

// Simulate a v11 save without the new `evidence` field.
const legacy = {
  stateVersion: 11,
  playerProfile: { preferredExplanationStyle: 'classic' },
  topics: {
    [topicKey('fundamentals', 'osi-model')]: {
      status: 'started',
      theoryScore: 10,
      practiceScore: 5,
      retentionScore: 0,
      contentSeenPercent: 14,
      theoryCompletion: 14,
      completedSectionIds: ['intro', 'layer1'],
      completedQuestionIds: ['q1'],
      completedExerciseIds: ['osi-ordering'],
      lessonCompletions: 0,
      quizAttempts: 0,
    },
  },
};
store.set('cyberlearn:academy-progress-v1', JSON.stringify(legacy));

const migrated = readAcademyProgress();
const key = topicKey('fundamentals', 'osi-model');
const topic = migrated.topics[key];

assert.equal(topic.status, 'started', 'status preserved');
assert.equal(topic.theoryScore, 10, 'theoryScore preserved');
assert.equal(topic.practiceScore, 5, 'practiceScore preserved');
assert.deepEqual(topic.completedSectionIds, ['intro', 'layer1'], 'completedSectionIds preserved');
assert.deepEqual(topic.completedQuestionIds, ['q1'], 'completedQuestionIds preserved');
assert.deepEqual(topic.completedExerciseIds, ['osi-ordering'], 'completedExerciseIds preserved');
assert.equal(migrated.stateVersion, 14, 'stateVersion upgraded');
assert.ok(topic.evidence && typeof topic.evidence === 'object', 'evidence field seeded');
assert.equal(Object.keys(topic.evidence).length, 0, 'evidence starts empty for legacy saves');

// Write round-trip keeps progress.
writeAcademyProgress(migrated);
const roundTripped = readAcademyProgress();
assert.equal(roundTripped.topics[key].status, 'started', 'round-trip preserves status');
assert.deepEqual(roundTripped.topics[key].completedSectionIds, ['intro', 'layer1'], 'round-trip preserves sections');

console.log('All academy progress evidence migration tests passed.');
