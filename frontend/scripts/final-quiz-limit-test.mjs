import {
  LESSONS,
  selectFinalQuiz,
  defaultFinalQuizCount,
  FINAL_QUIZ_MAX,
} from '../src/lib/academyLessonData.js';
import { collectQuestionsFromLesson } from '../src/lib/academyThemencheck.js';
import { topicKey, ACADEMY_TOPICS } from '../src/lib/academyTopics.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function assertTrue(condition, message) {
  if (!condition) throw new Error(message);
}

function assertLessEqual(actual, expected, message) {
  if (!(actual <= expected)) throw new Error(`${message}: expected <= ${expected}, got ${actual}`);
}

console.log('=== Final Quiz Limit Regression Test ===\n');

// ---------------------------------------------------------------------------
// 1. defaultFinalQuizCount rules
// ---------------------------------------------------------------------------
console.log('Testing defaultFinalQuizCount...');
assertEqual(defaultFinalQuizCount(0), 0, 'empty pool -> 0');
assertEqual(defaultFinalQuizCount(3), 3, 'small pool (<=8) -> all');
assertEqual(defaultFinalQuizCount(8), 8, 'exactly 8 -> 8');
assertEqual(defaultFinalQuizCount(9), 7, '9 questions -> 7');
assertEqual(defaultFinalQuizCount(13), 7, '13 questions (Subnetting) -> 7');
assertEqual(defaultFinalQuizCount(15), 7, '15 questions -> 7');
assertEqual(defaultFinalQuizCount(16), 8, '16 questions -> 8');
assertEqual(defaultFinalQuizCount(30), 8, '30 questions -> 8 (hard cap)');
assertLessEqual(defaultFinalQuizCount(1000), FINAL_QUIZ_MAX, 'hard cap never exceeded');

// ---------------------------------------------------------------------------
// 2. selectFinalQuiz respects explicit count and preserves order
// ---------------------------------------------------------------------------
console.log('Testing selectFinalQuiz...');
const sample = [
  { facet: 'a', question: 'q1' },
  { facet: 'b', question: 'q2' },
  { facet: 'a', question: 'q3' },
  { facet: 'c', question: 'q4' },
  { facet: 'b', question: 'q5' },
  { facet: 'c', question: 'q6' },
  { facet: 'd', question: 'q7' },
  { facet: 'd', question: 'q8' },
  { facet: 'd', question: 'q9' },
];
const selected5 = selectFinalQuiz(sample, 5);
assertEqual(selected5.length, 5, 'explicit count 5 respected');
// With round-robin by facet and original order preserved, we expect facets a,b,c,d,a.
assertEqual(selected5[0].facet, 'a', 'first pick from facet a');
assertEqual(selected5[1].facet, 'b', 'second pick from facet b');
assertEqual(selected5[2].facet, 'c', 'third pick from facet c');
assertEqual(selected5[3].facet, 'd', 'fourth pick from facet d');
assertEqual(selected5[4].facet, 'a', 'fifth pick from facet a (second round)');

// Round-robin order: facet a gets the second pick in round 2, so the second a follows d.
assertEqual(selected5[4].facet, 'a', 'fifth pick from facet a (second round)');

// ---------------------------------------------------------------------------
// 3. Every lesson final-quiz length <= FINAL_QUIZ_MAX
// ---------------------------------------------------------------------------
console.log('\nTesting every lesson final-quiz length...');
const tooLong = [];
const subnettingKey = topicKey('fundamentals', 'subnetting');
let subnettingFinalCount = null;

for (const topic of ACADEMY_TOPICS) {
  const key = topicKey(topic.categoryId, topic.topicId);
  const lesson = LESSONS[key];
  if (!lesson || !lesson.quiz || lesson.quiz.length === 0) continue;

  const finalQuiz = selectFinalQuiz(lesson.quiz, lesson.finalQuizCount);
  assertLessEqual(
    finalQuiz.length,
    FINAL_QUIZ_MAX,
    `${key}: final quiz must not exceed ${FINAL_QUIZ_MAX}`,
  );

  if (key === subnettingKey) {
    subnettingFinalCount = finalQuiz.length;
  }

  if (finalQuiz.length > lesson.quiz.length) {
    tooLong.push(`${key}: ${finalQuiz.length} > ${lesson.quiz.length}`);
  }
}

assertTrue(tooLong.length === 0, `No final quiz longer than its pool:\n${tooLong.join('\n')}`);

// ---------------------------------------------------------------------------
// 4. Subnetting specific target
// ---------------------------------------------------------------------------
console.log('\nTesting Subnetting specific target...');
assertEqual(subnettingFinalCount, 7, 'Subnetting final quiz must be 7 questions');
const subnettingLesson = LESSONS[subnettingKey];
assertEqual(subnettingLesson.quiz.length, 13, 'Subnetting quiz pool remains 13 questions');
const subnettingFinal = selectFinalQuiz(subnettingLesson.quiz);
assertTrue(subnettingFinal.length < subnettingLesson.quiz.length, 'Subnetting final quiz is a proper subset of the pool');

// ---------------------------------------------------------------------------
// 5. Full pool remains available for practice / Fachgespräch / Themencheck
// ---------------------------------------------------------------------------
console.log('\nTesting full pool availability...');
for (const topic of ACADEMY_TOPICS) {
  const key = topicKey(topic.categoryId, topic.topicId);
  const lesson = LESSONS[key];
  if (!lesson) continue;
  const pool = collectQuestionsFromLesson(lesson, topic.topicId);
  if (pool.length === 0) continue;

  const finalQuiz = selectFinalQuiz(lesson.quiz || [], lesson.finalQuizCount);
  assertTrue(
    pool.length >= finalQuiz.length,
    `${key}: practice/interview/themencheck pool must be at least as large as final quiz`,
  );
}

// ---------------------------------------------------------------------------
// 6. Final quiz determinism (same input -> same output)
// ---------------------------------------------------------------------------
const run1 = selectFinalQuiz(subnettingLesson.quiz);
const run2 = selectFinalQuiz(subnettingLesson.quiz);
assertEqual(run1.length, run2.length, 'selectFinalQuiz is deterministic in length');
for (let i = 0; i < run1.length; i += 1) {
  assertEqual(run1[i].question, run2[i].question, `selectFinalQuiz deterministic question ${i}`);
}

console.log('\n=== Final Quiz Limit Regression Test PASSED ===');
