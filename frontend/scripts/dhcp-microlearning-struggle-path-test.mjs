import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

import { buildCiscoDhcpLesson, CISCO_DHCP_TOPIC_KEY } from '../src/lib/academyLessons/ciscoDhcp.js';
import { selectDirectTheoryExercises } from '../src/lib/lessonExerciseSelector.js';
import { recordLearningResult, getReviewPriority, getRecommendedDifficulty } from '../src/lib/learningMastery.js';
import { readAcademyProgress } from '../src/lib/academyProgress.js';

const [categoryId, topicId] = CISCO_DHCP_TOPIC_KEY.split('/');
const t0 = Date.now();
const FACET = 'ciscoDhcp.helperPlacement';

readAcademyProgress();

// Multiple failures on the same facet.
for (let i = 0; i < 3; i += 1) {
  recordLearningResult({
    categoryId, topicId, facetIds: [FACET],
    evidenceType: 'understood', correct: false,
    difficulty: 'medium', source: `struggle-${i}`, at: t0 + i * 2000,
  });
}

const p = getReviewPriority(categoryId, topicId, FACET);
assert.ok(p > 0, 'struggling player has elevated review priority');
assert.ok(getRecommendedDifficulty(categoryId, topicId, FACET) !== 'hard', 'struggling player gets easier difficulty');

const lesson = buildCiscoDhcpLesson();
const direct = selectDirectTheoryExercises(lesson.exercises, CISCO_DHCP_TOPIC_KEY);
assert.ok(direct.length > 0, 'lesson still provides exercises');

// No dead-end: the full pool can always yield a set.
const all = selectDirectTheoryExercises(lesson.exercises, CISCO_DHCP_TOPIC_KEY);
assert.ok(all.length >= 3, 'enough exercises remain selectable');

console.log('DHCP struggle path OK');
