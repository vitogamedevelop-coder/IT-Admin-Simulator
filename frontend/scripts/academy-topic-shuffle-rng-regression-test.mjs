import assert from 'node:assert/strict';
import { createRng, makeSeed, RNG_NAMESPACE_QUESTIONS } from '../src/lib/random.js';
import { shuffleOptions } from '../src/lib/shuffleOptions.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';

console.log('Academy topic shuffle RNG contract...\n');

// 1. shuffleOptions enforces an explicit rng and does NOT silently fall back.
assert.throws(
  () => shuffleOptions(['A', 'B', 'C'], 1),
  /Invalid rng/,
  'shuffleOptions without rng must throw explicitly',
);

assert.throws(
  () => shuffleOptions(['A', 'B', 'C'], 1, null),
  /Invalid rng/,
  'shuffleOptions with null rng must throw explicitly',
);

// 2. Canonical shared RNG object works.
const rng1 = createRng(makeSeed({
  subsystem: RNG_NAMESPACE_QUESTIONS,
  category: 'fundamentals',
  topic: 'dhcp',
  runIndex: 0,
  nonce: 'contract',
}));
const result1 = shuffleOptions(['A', 'B', 'C', 'D'], 2, rng1);
assert.ok(Array.isArray(result1.options) && result1.options.length === 4, 'returns shuffled options');
assert.equal(result1.options[result1.correct], 'C', 'correct index points to the original correct option');

// 3. Legacy function-style rng still works (C1 backwards compatibility contract).
const legacyRng = (() => {
  let s = 12345;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
})();
const result2 = shuffleOptions(['W', 'X', 'Y', 'Z'], 0, legacyRng);
assert.ok(result2.options.length === 4, 'legacy function rng produces shuffled options');

// 4. Determinism: same seed -> same order + same correct index.
function seededQuestion(seed, options, correct) {
  const rng = createRng(seed);
  return shuffleOptions(options, correct, rng);
}
const a = seededQuestion('same-seed', ['opt-0', 'opt-1', 'opt-2'], 1);
const b = seededQuestion('same-seed', ['opt-0', 'opt-1', 'opt-2'], 1);
assert.deepEqual(a.options, b.options, 'same seed is deterministic');
assert.equal(a.correct, b.correct, 'same correct index with same seed');

// 5. Correct answer alignment is preserved after shuffle.
const source = ['Gateway des Clientnetzes', 'IP des DHCP-Servers', 'DNS-Server', 'Broadcast'];
const correctIndex = 0;
const rng = createRng(makeSeed({
  subsystem: RNG_NAMESPACE_QUESTIONS,
  category: 'cisco-packet-tracer',
  topic: 'dhcp',
  runIndex: 0,
  nonce: 'alignment',
}));
const shuffled = shuffleOptions(source, correctIndex, rng);
assert.equal(shuffled.options[shuffled.correct], source[correctIndex], 'correct value matches the original correct option');

// 6. Representative topics must be shufflable with a canonical rng.
const TOPICS = [
  ['fundamentals', 'dhcp'],
  ['cisco-packet-tracer', 'dhcp'],
  ['cisco-packet-tracer', 'ssh'],
  ['cisco-packet-tracer', 'stp'],
  ['fundamentals', 'osi-model'],
  ['fundamentals', 'tcp-ip-model'],
  ['fundamentals', 'subnetting'],
  ['security', 'information-security'],
];

let checked = 0;
for (const [categoryId, topicId] of TOPICS) {
  const lesson = LESSONS[topicKey(categoryId, topicId)];
  if (!lesson || !Array.isArray(lesson.quiz) || lesson.quiz.length === 0) {
    console.log(`  skip ${categoryId}/${topicId} (no quiz or no lesson)`);
    continue;
  }
  const quizRng = createRng(makeSeed({
    subsystem: RNG_NAMESPACE_QUESTIONS,
    category: categoryId,
    topic: topicId,
    runIndex: 0,
    nonce: 'quiz',
  }));
  const question = lesson.quiz[0];
  const out = shuffleOptions(question.options, question.correct, quizRng);
  assert.ok(out.options.length === question.options.length, `${categoryId}/${topicId} shuffles quiz options`);
  assert.ok(out.correct >= 0 && out.correct < out.options.length, `${categoryId}/${topicId} correct index in range`);
  console.log(`  ok ${categoryId}/${topicId} quiz shuffles correctly`);
  checked += 1;
}

assert.ok(checked >= 3, 'at least three representative topics have shufflable quiz questions');

console.log(`\nAll shuffle RNG regression tests passed (${checked} topics checked).`);
