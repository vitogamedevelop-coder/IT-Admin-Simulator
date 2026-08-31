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
const { ACADEMY_TOPICS } = await import('../src/lib/academyTopics.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');
const { topicKey } = await import('../src/lib/academyTopics.js');

console.log('=== Academy Update Sanitization Test ===');

// Pick an existing topic that has a lesson with sections and exercises
const targetTopic = ACADEMY_TOPICS.find((t) => LESSONS[topicKey(t.categoryId, t.topicId)]?.explanations?.length);
assert(targetTopic, 'need at least one topic with a lesson');
const key = topicKey(targetTopic.categoryId, targetTopic.topicId);
const lesson = LESSONS[key];
const validSections = new Set(lesson.explanations.map((e) => e.id));
const validExercises = new Set(lesson.exercises.map((e) => e.id));
const firstSection = Array.from(validSections)[0];
const firstExercise = Array.from(validExercises)[0];

// Simulate an old save that contains valid current AND obsolete removed IDs
store.clear();
const initial = {
  stateVersion: 1,
  playerProfile: { preferredExplanationStyle: null },
  topics: {
    [key]: {
      status: 'learned',
      theoryScore: 100,
      practiceScore: 0,
      retentionScore: 0,
      theoryCompletion: 100,
      contentSeenPercent: 100,
      completedSectionIds: [firstSection, 'removed-section-1'],
      completedQuestionIds: ['q-1', 'q-1', 'removed-q'],
      completedExerciseIds: [firstExercise, 'removed-exercise-1'],
      lastCompletedSectionId: 'removed-last-section',
      lastCompletedSectionTitle: 'Removed Title',
      lessonCompletions: 1,
    },
    'removed-topic/obsolete': {
      status: 'learned',
      theoryScore: 80,
      completedSectionIds: ['x'],
    },
  },
};
localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(initial));

const data = readAcademyProgress();
const topic = data.topics[key];

assert(topic, 'existing topic is preserved');
assert(!topic.completedSectionIds.includes('removed-section-1'), 'removed section id is filtered');
assert(topic.completedSectionIds.includes(firstSection), 'current section id is kept');
assert.strictEqual(new Set(topic.completedQuestionIds).size, topic.completedQuestionIds.length, 'question ids are deduplicated');
assert(!topic.completedExerciseIds.includes('removed-exercise-1'), 'removed exercise id is filtered');
assert(topic.completedExerciseIds.includes(firstExercise), 'current exercise id is kept');
assert(!data.topics['removed-topic/obsolete'], 'removed topic is dropped');
assert(!topic.lastCompletedSectionId || validSections.has(topic.lastCompletedSectionId), 'lastCompletedSectionId is valid');

console.log('=== Academy Update Sanitization Test passed ===');
