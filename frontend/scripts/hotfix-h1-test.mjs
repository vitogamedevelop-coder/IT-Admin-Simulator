/**
 * Hotfix H1 – Übungen in IPv4 funktionieren nicht
 *
 * Root cause: subnetting.js, vlsm.js and supernetting.js each had a local
 * `inputExercise()` helper that returned the field `acceptedAnswers` instead
 * of `answers`. The InputExercise component in LessonRunner.jsx reads
 * `exercise.answers.some(...)` unconditionally on every render - with
 * `answers` undefined, this threw a TypeError as soon as the exercises
 * phase was opened, which the ErrorBoundary caught and displayed as an
 * error dialog instead of the exercise. Only Subnetting, VLSM and
 * Supernetting used this specific (buggy) helper, which is why exactly
 * those three - and no other lessons - were affected.
 *
 * This test:
 * 1. Verifies every "input" exercise across ALL registered lessons has a
 *    non-empty `answers` array (via validateLessonDefinition).
 * 2. Simulates the actual InputExercise answer-checking logic for every
 *    input exercise in Subnetting/VLSM/Supernetting/Binärsystem/IPv4/
 *    Subnetzmasken so a real, correct answer is actually accepted.
 * 3. Confirms the old, broken `acceptedAnswers` field is gone.
 * 4. Confirms every exercise type used anywhere is one LessonRunner
 *    actually knows how to render (no silent blank exercises either).
 */
import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { validateLessonDefinition } from '../src/lib/validateLessonDefinition.js';

// Browser mocks (some lesson builders read these indirectly via imports)
globalThis.window = { innerWidth: 400, innerHeight: 800 };

// Mirrors LessonRunner.jsx's InputExercise correctness check exactly.
function isInputAnswerAccepted(exercise, typedValue) {
  const normalized = String(typedValue).trim().toLowerCase();
  const stripSlash = (s) => s.replace(/^\//, '');
  return exercise.answers.some((a) => {
    const expected = String(a).trim().toLowerCase();
    if (expected === normalized) return true;
    if (/^\/?(\d+)$/.test(normalized) && /^\/?(\d+)$/.test(expected)) {
      return stripSlash(normalized) === stripSlash(expected);
    }
    return false;
  });
}

// Exercise types LessonRunner.jsx's renderExercise() actually handles.
// "cli-input" added by Milestone C6 (Cisco CLI-input exercises).
const RENDERABLE_TYPES = ['ordering', 'matching', 'input', 'cli-input', 'select-best', 'guided-subnetting', 'adaptive-subnetting', 'difficulty-drill'];

// ============================================================
// 1 + 3 + 4. Validate every lesson, every exercise
// ============================================================
console.log('1. Validating every registered lesson and every exercise...');
let inputExerciseCount = 0;
for (const [key, lesson] of Object.entries(LESSONS)) {
  const errors = validateLessonDefinition(lesson, key);
  assert.deepEqual(errors, [], `${key} passes structural validation (incl. input exercises having "answers")`);

  for (const ex of lesson.exercises || []) {
    assert(!('acceptedAnswers' in ex), `${key}/${ex.id}: does not use the old, broken "acceptedAnswers" field`);
    assert(RENDERABLE_TYPES.includes(ex.type), `${key}/${ex.id}: type "${ex.type}" is rendered by LessonRunner`);
    if (ex.type === 'input') inputExerciseCount++;
  }
}
console.log(`   All lessons valid. ${inputExerciseCount} input exercises checked across ${Object.keys(LESSONS).length} lessons.`);

// ============================================================
// 2. Simulate real answer-checking for the previously-broken topics
//    plus the other IPv4-family lessons mentioned in the bug report.
// ============================================================
console.log('2. Simulating InputExercise answer checking for the affected lessons...');
const TOPICS_TO_CHECK = [
  'fundamentals/binary-system',
  'fundamentals/ipv4',
  'fundamentals/subnet-masks',
  'fundamentals/subnetting',
  'fundamentals/vlsm',
  'fundamentals/supernetting',
];
for (const key of TOPICS_TO_CHECK) {
  const lesson = LESSONS[key];
  assert(lesson, `${key} lesson is registered`);
  const inputExercises = (lesson.exercises || []).filter((ex) => ex.type === 'input');
  for (const ex of inputExercises) {
    assert(Array.isArray(ex.answers) && ex.answers.length > 0, `${key}/${ex.id}: has a non-empty answers array`);
    // The first listed answer must itself be accepted - proves the
    // component's own comparison logic actually works against this data,
    // not just that the field exists.
    assert(isInputAnswerAccepted(ex, ex.answers[0]), `${key}/${ex.id}: its own correct answer "${ex.answers[0]}" is accepted`);
  }
  console.log(`   ${key}: ${inputExercises.length} input exercise(s) OK.`);
}

console.log('\n=== Hotfix H1 verified: exercises load and accept correct answers ===');
