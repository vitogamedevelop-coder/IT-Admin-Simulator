import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = { dispatchEvent: () => {} };
globalThis.Event = class { constructor(t) { this.type = t; } };

const { readAcademyProgress } = await import('../src/lib/academyProgress.js');
const { getAllFullTopics } = await import('../src/lib/academyProgress.js');
const { ACADEMY_TOPICS } = await import('../src/lib/academyTopics.js');
const { getCategorySummary } = await import('../src/lib/academyThemencheck.js');

console.log('=== Academy Fresh Install State Audit ===');
store.clear();
const data = readAcademyProgress();

assert(data.stateVersion > 0, 'fresh install has a state version');
assert(Object.keys(data.topics).length === ACADEMY_TOPICS.length, 'fresh install has one topic entry per catalog topic');

let learned = 0;
for (const topic of Object.values(data.topics)) {
  assert(Array.isArray(topic.completedSectionIds), 'completedSectionIds is an array');
  assert(Array.isArray(topic.completedQuestionIds), 'completedQuestionIds is an array');
  assert(Array.isArray(topic.completedExerciseIds), 'completedExerciseIds is an array');
  assert(topic.completedSectionIds.length === 0, 'fresh install has no completed sections');
  assert(topic.completedQuestionIds.length === 0, 'fresh install has no completed questions');
  assert(topic.completedExerciseIds.length === 0, 'fresh install has no completed exercises');
  if (['learned', 'applied', 'consolidated'].includes(topic.status)) learned += 1;
}
assert.strictEqual(learned, 0, 'fresh install has no learned topics');

const fundamentals = getCategorySummary('fundamentals');
assert(fundamentals.completedLessons === 0, 'fundamentals category shows 0 completed lessons on fresh install');

const full = getAllFullTopics();
const learnedFull = full.filter((t) => ['learned', 'applied', 'consolidated'].includes(t.status));
assert.strictEqual(learnedFull.length, 0, 'getAllFullTopics has no learned topics on fresh install');

console.log('=== Academy Fresh Install State Audit passed ===');








