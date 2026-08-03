import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';
import { readAcademyProgress, writeAcademyProgress } from '../src/lib/academyProgress.js';
import {
  applyMentorLesson, applyQuiz, applyMiniExercise, recordLessonStart,
  recordQuestionAnswer, isTopicMastered,
} from '../src/lib/academyEngine.js';
import { shuffleOptions, getOrderedOptions, isCorrectAnswer } from '../src/lib/shuffleOptions.js';
import {
  getRecommendedLearningTopic, getNextMainMission, getRecommendedSideMissions,
  FUNDAMENTALS_COURSE_ORDER,
} from '../src/lib/objectives.js';
import { readGameState, writeGameState } from '../src/lib/gameState.js';
import { ensureInbox } from '../src/lib/sideMissionEngine.js';

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
}

function topicId(id) {
  return topicKey('fundamentals', id);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function setProgress(key, patch) {
  const data = readAcademyProgress();
  data.topics[key] = { ...data.topics[key], ...patch };
  writeAcademyProgress(data);
}

// ============================================================
// Progress values and migration
// ============================================================
console.log('Testing progress values and migration...');
reset();

// Scores stay within 0..100 after normal activity.
applyMentorLesson('fundamentals', 'grundbegriffe');
applyQuiz('fundamentals', 'grundbegriffe', 'theory');
applyMiniExercise('fundamentals', 'grundbegriffe');
const p1 = readAcademyProgress().topics[topicId('grundbegriffe')];
assert(p1.theoryScore >= 0 && p1.theoryScore <= 100, 'theoryScore is clamped 0-100');
assert(p1.practiceScore >= 0 && p1.practiceScore <= 100, 'practiceScore is clamped 0-100');
assert(p1.theoryScore < 20, 'a single lesson + question does not rocket to high values');

// Duplicate activity does not double-count.
const beforeTheory = p1.theoryScore;
recordQuestionAnswer('fundamentals', 'grundbegriffe', 'q-dup', 'theory', true);
recordQuestionAnswer('fundamentals', 'grundbegriffe', 'q-dup', 'theory', true);
const afterTheory = readAcademyProgress().topics[topicId('grundbegriffe')].theoryScore;
assertEqual(afterTheory - beforeTheory, 2, 'duplicate question answer is only counted once');

// Mere opening does not award points.
reset();
recordLessonStart('fundamentals', 'grundbegriffe');
const pStart = readAcademyProgress().topics[topicId('grundbegriffe')];
assertEqual(pStart.theoryScore, 0, 'recordLessonStart does not award points');
assertEqual(pStart.practiceScore, 0, 'recordLessonStart does not award practice points');

// Old inflated or fractional values are migration-safe.
reset();
const old = readAcademyProgress();
old.topics[topicId('grundbegriffe')] = {
  ...old.topics[topicId('grundbegriffe')],
  theoryScore: 0.75, // old fractional 0-1 value
  practiceScore: 250, // accidentally inflated value
  retentionScore: -5, // invalid negative
};
writeAcademyProgress(old);
const migrated = readAcademyProgress().topics[topicId('grundbegriffe')];
assertEqual(migrated.theoryScore, 75, 'fractional score <=1 is scaled to 0-100');
assertEqual(migrated.practiceScore, 100, 'inflated score is clamped to 100');
assertEqual(migrated.retentionScore, 0, 'negative score is clamped to 0');

// ============================================================
// Answer evaluation
// ============================================================
console.log('Testing answer evaluation...');
reset();

// Shuffling must keep correctness tied to the answer content, not position.
const options = ['A', 'B', 'C'];
let correctIndexAlwaysMatches = true;
for (let i = 0; i < 30; i += 1) {
  const shuffled = shuffleOptions(options, 1);
  const correctLabel = options[1];
  const correctShuffledIndex = shuffled.options.indexOf(correctLabel);
  if (correctShuffledIndex !== shuffled.correct) correctIndexAlwaysMatches = false;
}
assert(correctIndexAlwaysMatches, 'shuffleOptions reports the correct shuffled index for the original correct answer');

// isCorrectAnswer works on normalized objects with isCorrect, not on raw index.
const normalized = getOrderedOptions([
  { text: 'falsch', isCorrect: false, feedback: 'falsch' },
  { text: 'richtig', isCorrect: true, feedback: 'richtig' },
], 'test-q');
assert(isCorrectAnswer(normalized.find((o) => o.text === 'richtig')), 'isCorrectAnswer accepts isCorrect object');
assert(!isCorrectAnswer(normalized.find((o) => o.text === 'falsch')), 'isCorrectAnswer rejects wrong object');

// No per-option feedback for a wrong answer uses purely positive wording.
const positivePattern = /\b(genau|richtig|perfekt|super|korrekt|gut gemacht|das passt)\b/i;
function hasPositive(text) {
  return positivePattern.test(text);
}
function wrongOptionFeedback() {
  const bad = [];
  Object.values(LESSONS).forEach((lesson) => {
    lesson.explanations.forEach((ex) => ex.blocks.forEach((block) => {
      if (block.type === 'question' && Array.isArray(block.options)) {
        block.options.forEach((opt, i) => {
          if (typeof opt !== 'object') return;
          if (i === block.correct) return;
          if (opt.feedback && hasPositive(opt.feedback)) bad.push(opt.feedback);
        });
      }
    }));
    (lesson.exercises || []).forEach((ex) => {
      if (ex.type === 'select-best' && Array.isArray(ex.options)) {
        ex.options.forEach((opt, i) => {
          if (typeof opt !== 'object') return;
          if (i === ex.correct) return;
          if (opt.feedback && hasPositive(opt.feedback)) bad.push(opt.feedback);
        });
      }
    });
  });
  return bad;
}
const badFeedback = wrongOptionFeedback();
assert.deepStrictEqual(badFeedback, [], `wrong-answer option feedback must not contain positive affirmation: ${badFeedback.join(' | ')}`);

// ============================================================
// Mastery
// ============================================================
console.log('Testing mastery...');
reset();
const key = topicId('grundbegriffe');
setProgress(key, {
  contentSeenPercent: 100,
  completedSectionIds: ['s1', 's2', 's3'],
  quizPerfectCount: 2,
  quizAttempts: 2,
});
assert(!isTopicMastered('fundamentals', 'grundbegriffe', false), 'topic with <3 perfect quizzes is not mastered');
setProgress(key, { quizPerfectCount: 3 });
assert(isTopicMastered('fundamentals', 'grundbegriffe', false), 'topic with content + 3 perfect quizzes is mastered when no practice required');

// Practice-required topic stays unmastered without practice.
reset();
setProgress(key, {
  contentSeenPercent: 100,
  quizPerfectCount: 3,
  practiceScore: 0,
});
assert(!isTopicMastered('fundamentals', 'grundbegriffe', true), 'practice-required topic is not mastered without practice score');
setProgress(key, { practiceScore: 30 });
assert(isTopicMastered('fundamentals', 'grundbegriffe', true), 'practice-required topic is mastered with enough practice');

// ============================================================
// Learning priority
// ============================================================
console.log('Testing learning priority...');
reset();
// All fundamentals topics start at 0, so the first one in course order should be recommended.
let rec = getRecommendedLearningTopic();
assert(rec, 'a learning recommendation exists');
assertEqual(rec.topicId, 'grundbegriffe', 'first under-30 course topic is recommended');
assert(rec.progress < 30, 'recommended topic progress is below 30');

// Push first topic above 30 and mark learned; manually unlock next topic to simulate engine unlock.
setProgress(topicId('grundbegriffe'), {
  status: 'learned', theoryScore: 40, practiceScore: 0, retentionScore: 0, contentSeenPercent: 100, quizPerfectCount: 0,
});
setProgress(topicId('topologien'), { status: 'available' });
rec = getRecommendedLearningTopic();
assertEqual(rec.topicId, 'topologien', 'next under-30 course topic is recommended');

// Once all course topics have some progress, the weakest non-mastered is chosen.
FUNDAMENTALS_COURSE_ORDER.forEach((k, i) => {
  setProgress(k, { theoryScore: 30 + i, contentSeenPercent: 100 });
});
rec = getRecommendedLearningTopic();
assert(rec, 'weakest non-mastered topic is recommended after first round');

// Mastered topics are skipped.
setProgress(topicId('topologien'), { quizPerfectCount: 3, contentSeenPercent: 100 });
rec = getRecommendedLearningTopic();
assert(rec.topicId !== 'topologien', 'mastered topic is not recommended again');

// ============================================================
// Main mission priority
// ============================================================
console.log('Testing main mission priority...');
reset();
let main = getNextMainMission();
assert(main, 'a next main mission exists');
assertEqual(main.quest.id, 'first-day', 'first main mission is first-day');
assert(main.available, 'first main mission is immediately available');

const state = readGameState();
state.completedQuests = ['first-day'];
state.completedSideMissions = [];
writeGameState(state);
main = getNextMainMission();
assert(main, 'next main mission exists after completing first');
assert(!main.available, 'second main mission is locked without enough side missions');
assert(main.reasons.some((r) => r.includes('Nebenmission')), 'missing side missions are shown as requirement');
assertEqual(main.sideProgress.completed, 0, 'side mission progress starts at 0');
assertEqual(main.sideProgress.needed, 2, 'chapter 2 needs 2 side missions');

// Complete enough side missions; next mission unlocks.
state.completedSideMissions = ['s1', 's2'];
writeGameState(state);
main = getNextMainMission();
assert(main.available, 'second main mission unlocks after required side missions');

// ============================================================
// Side mission recommendations
// ============================================================
console.log('Testing side mission recommendations...');
reset();
const gs = readGameState();
gs.completedQuests = ['first-day'];
gs.lastEventDate = '1999-01-01';
writeGameState(gs);
ensureInbox();
const side = getRecommendedSideMissions(2);
assert(Array.isArray(side), 'side missions array returned');
assert(side.length <= 2, 'at most two side missions recommended');
assert(side.length > 0, 'at least one side mission is available after ensureInbox');
const ids = side.map((s) => s.id);
assertEqual(new Set(ids).size, ids.length, 'recommended side mission IDs are unique');

// ============================================================
// Reflection of progress updates in objectives panel
// ============================================================
console.log('Testing objective recomputation after actions...');
reset();
const before = getRecommendedLearningTopic().progress;
applyMentorLesson('fundamentals', 'grundbegriffe');
const after = getRecommendedLearningTopic().progress;
assert(after > before, 'learning recommendation progress increases after mentor lesson');

console.log('All Milestone D3 tests passed.');
