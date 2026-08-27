import { readAcademyProgress } from '../src/lib/academyProgress.js';
import {
  computePracticeGain, recordSectionCompletion, recordLessonCompletion,
  recordQuizResult, topicOverallProgress, overallScore,
} from '../src/lib/academyEngine.js';

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function assertGreaterEqual(actual, expected, message) {
  if (!(actual >= expected)) throw new Error(`${message}: expected >= ${expected}, got ${actual}`);
}

reset();
const categoryId = 'fundamentals';
const topicId = 'osi-model';

// ============================================================
// 1. Theory completion grows with sections and reaches 100 %
// ============================================================
console.log('Testing theory completion...');

for (let i = 1; i <= 10; i += 1) {
  recordSectionCompletion(categoryId, topicId, `section-${i}`, `Abschnitt ${i}`, 10);
}
let progress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
assertEqual(progress.theoryCompletion, 100, '10/10 sections -> 100 % theory completion');
assertEqual(progress.contentSeenPercent, 100, '10/10 sections -> 100 % content seen');

// Theory completion never sinks.
recordSectionCompletion(categoryId, topicId, 'section-11', 'Abschnitt 11', 20);
progress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
assertEqual(progress.theoryCompletion, 100, 'theoryCompletion stays at 100 %');

// ============================================================
// 2. Lesson completion sets theory completion to 100 %
// ============================================================
reset();
recordLessonCompletion(categoryId, topicId, 'classic');
progress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
assertEqual(progress.theoryCompletion, 100, 'recordLessonCompletion -> 100 % theory completion');
assertEqual(progress.contentSeenPercent, 100, 'recordLessonCompletion -> 100 % content seen');

// ============================================================
// 3. Practice gain curve
// ============================================================
console.log('Testing practice gain curve...');

for (const [percent, expectedMin, expectedMax] of [
  [0, 0, 0],
  [25, 0, 0],
  [49, 0, 0],
  [50, 4, 4],
  [60, 4, 6],
  [70, 6, 7],
  [80, 7, 9],
  [90, 10, 13],
  [100, 16, 16],
]) {
  const gain = computePracticeGain(percent, 0);
  assertGreaterEqual(gain, expectedMin, `gain at ${percent}% >= ${expectedMin}`);
  assertEqual(gain <= expectedMax, true, `gain at ${percent}% <= ${expectedMax}`);
}

// ============================================================
// 4. Perfect bonus with cap
// ============================================================
console.log('Testing perfect bonus...');

assertEqual(computePracticeGain(100, 1), 18, '1st perfect: base 16 + bonus 2');
assertEqual(computePracticeGain(100, 2), 20, '2nd perfect: base 16 + bonus 4');
assertEqual(computePracticeGain(100, 3), 22, '3rd perfect: base 16 + bonus 6');
assertEqual(computePracticeGain(100, 10), 22, '10th perfect still capped at 6 bonus');

// ============================================================
// 5. Recorded practice runs update practiceScore correctly
// ============================================================
console.log('Testing recorded practice runs...');

reset();
recordQuizResult(categoryId, topicId, { total: 10, correct: 5 });
progress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
assertEqual(progress.practiceScore, 4, '50% run gives small practice gain');
assertEqual(progress.quizPerfectStreak, 0, '50% run resets perfect streak');

recordQuizResult(categoryId, topicId, { total: 10, correct: 10 });
progress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
assertEqual(progress.practiceScore, 4 + 18, 'first perfect adds base + streak bonus');
assertEqual(progress.quizPerfectStreak, 1, 'perfect streak is 1');
assertEqual(progress.retentionScore, 2, 'perfect run also awards retention bonus');

const scoreBeforeWeak = progress.practiceScore;
recordQuizResult(categoryId, topicId, { total: 10, correct: 3 });
progress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
assertEqual(progress.practiceScore, scoreBeforeWeak, 'weak run does not reduce practiceScore');
assertEqual(progress.quizPerfectStreak, 0, 'weak run softly resets perfect streak');

// ============================================================
// 6. Save compatibility: old save without theoryCompletion
// ============================================================
console.log('Testing save compatibility...');

reset();
const key = `cyberlearn:academy-progress-v1`;
const legacy = readAcademyProgress();
legacy.topics[`${categoryId}/${topicId}`].contentSeenPercent = 100;
legacy.topics[`${categoryId}/${topicId}`].lessonCompletions = 1;
delete legacy.topics[`${categoryId}/${topicId}`].theoryCompletion;
store.set(key, JSON.stringify(legacy));
progress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
assertEqual(progress.theoryCompletion, 100, 'legacy save with completed lesson -> 100 % theoryCompletion');

reset();
const legacy2 = readAcademyProgress();
legacy2.topics[`${categoryId}/${topicId}`].contentSeenPercent = 30;
legacy2.topics[`${categoryId}/${topicId}`].lessonCompletions = 0;
delete legacy2.topics[`${categoryId}/${topicId}`].theoryCompletion;
store.set(key, JSON.stringify(legacy2));
progress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
assertEqual(progress.theoryCompletion, 30, 'legacy partial save inherits contentSeenPercent');

// ============================================================
// 7. Unlock threshold uses theory completion
// ============================================================
console.log('Testing unlock threshold...');

reset();
recordLessonCompletion(categoryId, topicId, 'classic');
progress = readAcademyProgress().topics[`${categoryId}/${topicId}`];
assertEqual(progress.status, 'learned', 'full theory pass promotes topic to learned');
assertGreaterEqual(topicOverallProgress(progress), 15, 'overall progress reaches unlock threshold after full theory');
assertGreaterEqual(overallScore(progress), 0, 'overallScore is non-negative');

console.log('progression-quality-audit: PASS');
