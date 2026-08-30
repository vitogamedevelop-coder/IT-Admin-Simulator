import { readAcademyProgress, writeAcademyProgress } from '../src/lib/academyProgress.js';
import { getCategorySummary, isThemencheckAvailable } from '../src/lib/academyThemencheck.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';

// Minimal browser mock for Node tests.
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
globalThis.CustomEvent = class CustomEvent {
  constructor(type, { detail } = {}) { this.type = type; this.detail = detail; }
};

function reset() {
  store.clear();
  writeAcademyProgress(readAcademyProgress());
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function assertTrue(condition, message) {
  if (!condition) throw new Error(message);
}

console.log('=== Category Completion Count Regression Test ===\n');

// Use the 'fundamentals' category as a representative example.
const categoryId = 'fundamentals';
const topicIds = ACADEMY_TOPICS.filter((t) => t.categoryId === categoryId).map((t) => t.topicId);

console.log(`Category ${categoryId} has ${topicIds.length} topics.`);

reset();

// Simulate a scenario where multiple topics reached LEARNED through
// exercises/questions but never triggered a full lesson completion.
// This is exactly the bug reported: topic cards show GELERNT while the
// category header still says "1 / 17" because it only counted lessonCompletions.
const learnedTopicIds = ['topologien', 'osi-model', 'tcp-ip-model', 'kommunikation-uebertragung', 'binary-system'];
const data = readAcademyProgress();
for (const topicId of learnedTopicIds) {
  const key = topicKey(categoryId, topicId);
  data.topics[key].status = 'learned';
  data.topics[key].theoryCompletion = 100;
  data.topics[key].theoryScore = 30;
  data.topics[key].lessonCompletions = 0; // deliberately 0
}
writeAcademyProgress(data);

const summary = getCategorySummary(categoryId);
console.log(`completedLessons: ${summary.completedLessons} / ${summary.lessonCount}`);
console.log(`progressPercent: ${summary.progressPercent}%`);

assertEqual(
  summary.completedLessons,
  learnedTopicIds.length,
  'Completed count must match the number of topics with LEARNED status (the same badge shown on cards)',
);
assertEqual(
  summary.completedTopics,
  learnedTopicIds.length,
  'completedTopics must also use LEARNED status',
);
assertTrue(
  summary.completedLessons !== 1,
  'Must not report only 1 completion when 5 topics are LEARNED',
);
assertEqual(
  summary.progressPercent,
  Math.round((learnedTopicIds.length / summary.lessonCount) * 100),
  'progressPercent must be derived from the same completed count',
);

// Verify Themencheck availability uses the same completion semantics.
for (const topicId of topicIds) {
  const key = topicKey(categoryId, topicId);
  if (data.topics[key].status !== 'learned') {
    data.topics[key].status = 'learned';
    data.topics[key].theoryCompletion = 100;
    data.topics[key].lessonCompletions = 0;
  }
}
writeAcademyProgress(data);

const themencheckAvailable = isThemencheckAvailable(categoryId);
assertTrue(
  themencheckAvailable,
  'Themencheck should be available once all topics in the category are LEARNED',
);

console.log('\n=== Category Completion Count Regression Test PASSED ===');
