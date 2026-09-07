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
import { recordLearningResult } from '../src/lib/learningMastery.js';
import { readAcademyProgress } from '../src/lib/academyProgress.js';

const [categoryId, topicId] = CISCO_DHCP_TOPIC_KEY.split('/');
const t0 = Date.now();

readAcademyProgress();

const facets = [
  'ciscoDhcp.relayPurpose',
  'ciscoDhcp.helperPlacement',
  'ciscoDhcp.helperVsGatewayIp',
  'ciscoDhcp.placementVariations',
  'ciscoDhcp.multiVlan',
  'ciscoDhcp.routingDependency',
  'ciscoDhcp.verify',
  'ciscoDhcp.troubleshooting',
];

facets.forEach((facet, i) => {
  recordLearningResult({
    categoryId, topicId, facetIds: [facet],
    evidenceType: 'diagnosed', correct: true,
    difficulty: 'hard', source: `strong-${i}`, at: t0 + i * 120000,
  });
});

const lesson = buildCiscoDhcpLesson();
const direct = selectDirectTheoryExercises(lesson.exercises, CISCO_DHCP_TOPIC_KEY);
assert.ok(direct.length > 0, 'strong player still sees a compact subset');
assert.ok(!direct.some((ex) => ex.adaptive === 'recovery'), 'strong player not forced into recovery drill');
assert.ok(new Set(direct.map((ex) => ex.id)).size === direct.length, 'no duplicate exercises');

console.log('DHCP strong player OK');
