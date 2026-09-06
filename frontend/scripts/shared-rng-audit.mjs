import {
  createRng,
  makeSeed,
  shuffle,
  pickOne,
  randomInt,
  RNG_NAMESPACE_QUESTIONS,
  RNG_NAMESPACE_CONVERSATIONS,
} from '../src/lib/random.js';
import { shuffleOptions } from '../src/lib/shuffleOptions.js';
import { generateQuestion, generateExamQuestions, getRandomTip } from '../src/lib/academyLessons/ipv4Generator.js';
import { generateSubnetProblem } from '../src/lib/networking/ipv4Math.js';

function assert(condition, message) {
  if (!condition) throw new Error(`Audit failed: ${message}`);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// 1. Determinism / repeatability
{
  const seed = makeSeed({ subsystem: RNG_NAMESPACE_QUESTIONS, nonce: 'audit-repeat' });
  const r1 = createRng(seed);
  const r2 = createRng(seed);
  const seq1 = Array.from({ length: 5 }, () => r1.next());
  const seq2 = Array.from({ length: 5 }, () => r2.next());
  assert(arraysEqual(seq1, seq2), 'Same seed must produce identical sequence');
  console.log('✓ same seed -> same sequence');
}

// 2. Namespace isolation
{
  const a = createRng(makeSeed({ subsystem: RNG_NAMESPACE_QUESTIONS, nonce: 'ns' }));
  const b = createRng(makeSeed({ subsystem: RNG_NAMESPACE_CONVERSATIONS, nonce: 'ns' }));
  const drawsA = Array.from({ length: 20 }, () => a.next());
  const drawsB = Array.from({ length: 20 }, () => b.next());
  let overlap = 0;
  for (let i = 0; i < drawsA.length; i += 1) {
    if (drawsA[i] === drawsB[i]) overlap += 1;
  }
  assert(overlap < drawsA.length, 'Different namespaces should not be identical streams');
  console.log('✓ namespace streams are isolated');
}

// 3. nextInt ranges
{
  const r = createRng('range-test');
  for (let i = 0; i < 100; i += 1) {
    const v = r.nextInt(1, 6);
    assert(v >= 1 && v <= 6 && Number.isInteger(v), `nextInt out of range: ${v}`);
  }
  console.log('✓ nextInt respects bounds');
}

// 4. Shuffle preserves all elements
{
  const r = createRng('shuffle-test');
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let i = 0; i < 50; i += 1) {
    const shuffled = shuffle(r, [...original]).slice().sort((a, b) => a - b);
    assert(arraysEqual(shuffled, original.slice().sort((a, b) => a - b)), 'Shuffle must preserve elements');
  }
  console.log('✓ shuffle preserves all elements');
}

// 5. Correct answer index remains aligned after shuffleOptions
{
  const r = createRng('shuffle-options-test');
  const options = ['A', 'B', 'C', 'D'];
  const shuffled = shuffleOptions(options, 1, r);
  assert(shuffled.options.includes('B'), 'Correct option must remain in options');
  assert(shuffled.options[shuffled.correct] === 'B', 'Correct index must point to original correct option');
  console.log('✓ shuffleOptions keeps correct answer aligned');
}

// 6. IPv4 generator determinism
{
  const seed = 'ipv4-audit';
  const r1 = createRng(seed);
  const r2 = createRng(seed);
  const q1 = generateQuestion('easy', r1);
  const q2 = generateQuestion('easy', r2);
  assert(q1.question === q2.question, 'IPv4 generator should be deterministic with same seed');
  console.log('✓ ipv4Generator is deterministic with seeded rng');
}

// 7. IPv4 math subnet problem determinism
{
  const r1 = createRng('subnet-audit');
  const r2 = createRng('subnet-audit');
  const p1 = generateSubnetProblem({ prefixMin: 24, prefixMax: 30 }, r1);
  const p2 = generateSubnetProblem({ prefixMin: 24, prefixMax: 30 }, r2);
  assert(p1.ip === p2.ip && p1.prefix === p2.prefix, 'generateSubnetProblem should be deterministic with same seed');
  console.log('✓ ipv4Math subnet problem is deterministic with seeded rng');
}

// 8. Exam generation determinism / variety
{
  const rng = createRng('exam-audit');
  const exam = generateExamQuestions('easy', 5, rng);
  assert(exam.length === 5, 'Exam should contain requested count');
  const questions = exam.map((q) => q.question);
  const unique = new Set(questions);
  assert(unique.size === questions.length, 'Exam questions should be unique');
  console.log('✓ generateExamQuestions produces requested unique count');
}

// 9. Tip pick remains valid
{
  const r = createRng('tip-audit');
  const tip = getRandomTip('networkId', r);
  assert(typeof tip === 'string' && tip.length > 0, 'getRandomTip must return a string');
  console.log('✓ getRandomTip returns a valid tip');
}

// 10. pickOne / randomInt helpers accept object and legacy function rng
{
  const objRng = createRng('helpers-obj');
  assert(pickOne(objRng, ['a', 'b', 'c']), 'pickOne works with object rng');
  const legacyRng = () => 0.5;
  assert(pickOne(legacyRng, ['x', 'y', 'z']), 'pickOne works with legacy function rng');
  assert(randomInt(legacyRng, 0, 2) >= 0 && randomInt(legacyRng, 0, 2) <= 2, 'randomInt works with legacy function rng');
  console.log('✓ helpers support object and legacy function rngs');
}

console.log('\nAll shared-RNG audit checks passed.');
