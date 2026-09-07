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

console.log('Academy progress mastery migration tests...');

store.clear();

// Simulate a 1.97.0 save with evidence but without mastery.
const legacy = {
  stateVersion: 12,
  playerProfile: { preferredExplanationStyle: 'classic' },
  topics: {
    [topicKey('fundamentals', 'osi-model')]: {
      status: 'learned',
      theoryScore: 14,
      practiceScore: 10,
      retentionScore: 4,
      contentSeenPercent: 100,
      theoryCompletion: 100,
      completedSectionIds: ['intro', 'layer1'],
      completedQuestionIds: ['q1'],
      completedExerciseIds: ['osi-ordering'],
      evidence: {
        'osi.layer1.name': { type: 'recognized', source: 'q1', at: Date.now() },
      },
    },
  },
};
store.set('cyberlearn:academy-progress-v1', JSON.stringify(legacy));

const migrated = readAcademyProgress();
const key = topicKey('fundamentals', 'osi-model');
const topic = migrated.topics[key];

assert.equal(migrated.stateVersion, 14, 'stateVersion upgraded to 14');
assert.equal(topic.status, 'learned', 'status preserved');
assert.equal(topic.theoryScore, 14, 'theoryScore preserved');
assert.equal(topic.practiceScore, 10, 'practiceScore preserved');
assert.equal(topic.retentionScore, 4, 'retentionScore preserved');
assert.deepEqual(topic.completedSectionIds, ['intro', 'layer1'], 'completed sections preserved');
assert.deepEqual(topic.completedQuestionIds, ['q1'], 'completed questions preserved');
assert.deepEqual(topic.completedExerciseIds, ['osi-ordering'], 'completed exercises preserved');
assert.equal(topic.evidence['osi.layer1.name']?.type, 'recognized', 'C3 evidence preserved');
assert.ok(topic.mastery && typeof topic.mastery === 'object', 'mastery field seeded');
assert.equal(Object.keys(topic.mastery).length, 0, 'mastery starts empty for legacy saves');

writeAcademyProgress(migrated);
const roundTripped = readAcademyProgress();
assert.equal(roundTripped.topics[key].status, 'learned', 'round-trip preserves status');
assert.deepEqual(roundTripped.topics[key].evidence, legacy.topics[key].evidence, 'round-trip preserves evidence');

console.log('All academy progress mastery migration tests passed.');
