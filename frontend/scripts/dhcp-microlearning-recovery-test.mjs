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
import { recordLearningResult, getFacetMastery, needsRecovery } from '../src/lib/learningMastery.js';
import { readAcademyProgress } from '../src/lib/academyProgress.js';

const [categoryId, topicId] = CISCO_DHCP_TOPIC_KEY.split('/');
const FACET = 'ciscoDhcp.helperPlacement';
const t0 = Date.now();

// Initial read creates the topic progress bucket.
readAcademyProgress();

// Wrong answer in one context creates recoveryPending.
recordLearningResult({
  categoryId, topicId, facetIds: [FACET],
  evidenceType: 'understood', correct: false,
  difficulty: 'medium', source: 'placement-wrong', at: t0,
});
assert.ok(needsRecovery(categoryId, topicId, FACET), 'wrong answer sets needsRecovery');

const lesson = buildCiscoDhcpLesson();
const direct = selectDirectTheoryExercises(lesson.exercises, CISCO_DHCP_TOPIC_KEY);
const ids = direct.map((ex) => ex.id);
assert.ok(ids.includes('dhcp-recovery-wrong-svi'), 'recovery exercise is selected while pending');

// Later, an independent success in a different context clears recovery.
recordLearningResult({
  categoryId, topicId, facetIds: [FACET],
  evidenceType: 'applied', correct: true,
  difficulty: 'medium', source: 'svi-ok', at: t0 + 120000,
});

assert.ok(!needsRecovery(categoryId, topicId, FACET), 'later success clears needsRecovery');
const m = getFacetMastery(categoryId, topicId, FACET);
assert.equal(m.recoveryPending, false, 'recoveryPending is false after recovery');

const direct2 = selectDirectTheoryExercises(lesson.exercises, CISCO_DHCP_TOPIC_KEY);
assert.ok(!direct2.some((ex) => ex.id === 'dhcp-recovery-wrong-svi'), 'recovery not forced once recovered');

console.log('DHCP micro-learning recovery OK');
