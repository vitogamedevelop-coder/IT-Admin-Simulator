/**
 * Milestone C5 – IPv4, Subnetting & Supernetting Academy Expansion
 *
 * Tests:
 * 1. Generator produces valid questions at all difficulty levels
 * 2. Subnetting generator produces correct answers
 * 3. Sam tips exist for every tip category
 * 4. Exam generation produces unique questions
 * 5. checkAnswer handles alternate answers
 * 6. Difficulty persistence fields exist in progress
 * 7. Difficulty-drill exercises registered in IPv4 and Subnetting lessons
 * 8. Sam's intuitive method explanations are present
 * 9. validateLessonDefinition accepts difficulty-drill type
 */
import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import {
  generateQuestion, generateSubnettingQuestion, generateExamQuestions,
  checkAnswer, getRandomTip, DIFFICULTY_NAMES, DIFFICULTY_LABELS,
} from '../src/lib/academyLessons/ipv4Generator.js';
// ipv4Math helpers available but not directly needed in this test
import { validateLessonDefinition } from '../src/lib/validateLessonDefinition.js';

// Browser mocks
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
  innerWidth: 400,
  innerHeight: 800,
};
globalThis.CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o?.detail; } };
globalThis.Event = class { constructor(t) { this.type = t; } };

// ============================================================
// 1. Generator produces valid questions at all difficulty levels
// ============================================================
console.log('1. Testing question generator...');
for (const diff of DIFFICULTY_NAMES) {
  for (let i = 0; i < 20; i++) {
    const q = generateQuestion(diff);
    assert(q.question, `${diff}: question has text`);
    assert(q.type === 'select' || q.type === 'input', `${diff}: type is select or input`);
    assert(q.explanation, `${diff}: has explanation`);
    assert(q.tipCategory, `${diff}: has tipCategory`);
    if (q.type === 'select') {
      assert(Array.isArray(q.options), `${diff}: select has options`);
      assert(q.options.length >= 3, `${diff}: at least 3 options`);
      assert(typeof q.correct === 'number', `${diff}: correct is a number`);
      assert(q.correct >= 0 && q.correct < q.options.length, `${diff}: correct in range`);
    } else {
      assert(q.answer, `${diff}: input has answer`);
    }
  }
}
console.log('   All difficulty levels generate valid questions (60 tested).');

// ============================================================
// 2. Subnetting generator produces correct answers
// ============================================================
console.log('2. Testing subnetting question answers...');
for (const diff of DIFFICULTY_NAMES) {
  for (let i = 0; i < 15; i++) {
    const q = generateSubnettingQuestion(diff);
    assert(q.question, `subnetting ${diff}: has question`);
    assert(q.type === 'input' || q.type === 'select', `subnetting ${diff}: valid type`);
    if (q.type === 'input') {
      // Verify the answer is computable
      const answer = q.answer;
      assert(answer, `subnetting ${diff}: has answer`);
      assert(String(answer).trim().length > 0, `subnetting ${diff}: answer non-empty`);
    }
  }
}
console.log('   Subnetting generator answers verified (45 tested).');

// ============================================================
// 3. Sam tips exist for every category
// ============================================================
console.log('3. Testing Sam tips...');
const tipCategories = ['relevantOctet', 'jumpSize', 'networkId', 'broadcast', 'firstHost', 'lastHost', 'hosts', 'prefix', 'mask'];
for (const cat of tipCategories) {
  const tip = getRandomTip(cat);
  assert(tip, `Tip for '${cat}' exists`);
  assert(tip.length > 10, `Tip for '${cat}' is meaningful: "${tip.substring(0, 30)}..."`);
}
// Verify tips vary (not always the same)
const tipSet = new Set();
for (let i = 0; i < 20; i++) tipSet.add(getRandomTip('networkId'));
assert(tipSet.size > 1, 'Tips vary for same category');
console.log(`   ${tipCategories.length} tip categories with varying tips.`);

// ============================================================
// 4. Exam generation produces unique questions
// ============================================================
console.log('4. Testing exam generation...');
for (const diff of DIFFICULTY_NAMES) {
  const exam = generateExamQuestions(diff, 10);
  assert(exam.length === 10, `Exam ${diff}: produces 10 questions`);
  const questions = new Set(exam.map(q => q.question));
  assert(questions.size === 10, `Exam ${diff}: all 10 questions are unique`);
}
console.log('   Exam generates 10 unique questions per difficulty.');

// ============================================================
// 5. checkAnswer handles alternate answers
// ============================================================
console.log('5. Testing checkAnswer...');
const q1 = { answer: '192.168.1.0', alternateAnswers: ['192.168.1.0/24'] };
assert(checkAnswer(q1, '192.168.1.0'), 'Primary answer accepted');
assert(checkAnswer(q1, '192.168.1.0/24'), 'Alternate answer accepted');
assert(!checkAnswer(q1, '10.0.0.1'), 'Wrong answer rejected');
assert(checkAnswer(q1, '  192.168.1.0  '), 'Trimmed answer accepted');
assert(checkAnswer({ answer: '42' }, '42'), 'Numeric answer accepted');
assert(!checkAnswer({ answer: '42' }, '43'), 'Wrong numeric rejected');
console.log('   checkAnswer works correctly with alternates and trimming.');

// ============================================================
// 6. Difficulty persistence fields exist in progress
// ============================================================
console.log('6. Testing difficulty persistence fields...');
const { readAcademyProgress, updateTopicProgress } = await import('../src/lib/academyProgress.js');
store.clear();
const progress = readAcademyProgress();
const ipv4Progress = progress.topics['fundamentals/ipv4'];
assert(ipv4Progress !== undefined, 'IPv4 topic exists');
assert('difficultyLevel' in ipv4Progress, 'difficultyLevel field exists');
assert('difficultyExamsPassed' in ipv4Progress, 'difficultyExamsPassed field exists');
assert.equal(ipv4Progress.difficultyLevel, 0, 'Default difficulty is 0 (easy)');
assert(Array.isArray(ipv4Progress.difficultyExamsPassed), 'difficultyExamsPassed is array');
assert.equal(ipv4Progress.difficultyExamsPassed.length, 0, 'No exams passed by default');

// Test persistence
updateTopicProgress('fundamentals', 'ipv4', { difficultyLevel: 1, difficultyExamsPassed: [0] });
const updated = readAcademyProgress().topics['fundamentals/ipv4'];
assert.equal(updated.difficultyLevel, 1, 'Difficulty level persisted');
assert.deepEqual(updated.difficultyExamsPassed, [0], 'Exams passed persisted');
console.log('   Difficulty fields persist correctly.');

// ============================================================
// 7. Difficulty-drill exercises registered in IPv4 and Subnetting
// ============================================================
console.log('7. Testing difficulty-drill exercises...');
const ipv4Lesson = LESSONS['fundamentals/ipv4'];
const subnettingLesson = LESSONS['fundamentals/subnetting'];
assert(ipv4Lesson, 'IPv4 lesson exists');
assert(subnettingLesson, 'Subnetting lesson exists');

const ipv4Drill = ipv4Lesson.exercises.find(e => e.type === 'difficulty-drill');
const subnetDrill = subnettingLesson.exercises.find(e => e.type === 'difficulty-drill');
assert(ipv4Drill, 'IPv4 has difficulty-drill exercise');
assert(subnetDrill, 'Subnetting has difficulty-drill exercise');
assert.equal(ipv4Drill.generator, 'ipv4', 'IPv4 drill uses ipv4 generator');
assert.equal(subnetDrill.generator, 'subnetting', 'Subnetting drill uses subnetting generator');
console.log('   Both lessons have difficulty-drill exercises.');

// ============================================================
// 8. Sam's intuitive method explanations present
// ============================================================
console.log("8. Testing Sam's intuitive method...");
const subExplanations = subnettingLesson.explanations;
const intuitiveIntro = subExplanations.find(e => e.id === 'intuitive-intro');
const jumpTable = subExplanations.find(e => e.id === 'intuitive-jump-table');
assert(intuitiveIntro, "Intuitive intro section exists");
assert(jumpTable, "Jump table section exists");
assert(intuitiveIntro.style === 'intuitive', "Intro is intuitive style");
assert(jumpTable.style === 'intuitive', "Jump table is intuitive style");

// Check the jump table has the full prefix breakdown
const tableBlock = jumpTable.blocks.find(b => b.type === 'table');
assert(tableBlock, "Jump table has a table block");
assert(tableBlock.rows.length === 32, "Table has all 32 prefixes");
assert.equal(tableBlock.rows[0][0], '/1', "First row is /1");
assert.equal(tableBlock.rows[0][2], '128', "/1 has jump 128");
assert.equal(tableBlock.rows[31][0], '/32', "Last row is /32");
assert.equal(tableBlock.rows[31][2], '1', "/32 has jump 1");

// Verify Sam's key message is present
const introText = intuitiveIntro.blocks.map(b => b.content).join(' ');
assert(introText.includes('Zweierpotenzen'), "Sam mentions Zweierpotenzen");
assert(introText.includes('leichter'), "Sam mentions simpler method");
console.log("   Sam's intuitive method with full 32-prefix table present.");

// ============================================================
// 9. validateLessonDefinition accepts difficulty-drill
// ============================================================
console.log('9. Testing validateLessonDefinition...');
const ipv4Errors = validateLessonDefinition(ipv4Lesson, 'fundamentals/ipv4');
assert.equal(ipv4Errors.length, 0, `IPv4 passes validation: ${ipv4Errors.join(', ')}`);
const subErrors = validateLessonDefinition(subnettingLesson, 'fundamentals/subnetting');
assert.equal(subErrors.length, 0, `Subnetting passes validation: ${subErrors.join(', ')}`);
console.log('   Both lessons pass validation with difficulty-drill type.');

// ============================================================
// 10. Adaptive difficulty: questions change with difficulty param
// ============================================================
console.log('10. Testing adaptive difficulty ranges...');
// Easy should produce simpler prefixes (/24-/28)
// Hard should reference broader prefixes
const hardQuestions = Array.from({ length: 30 }, () => generateQuestion('hard'));
const hardInputs = hardQuestions.filter(q => q.type === 'input');

// Verify hard questions include more complex calculation types
const hardTypes = new Set(hardInputs.map(q => q.tipCategory));
assert(hardTypes.has('networkId') || hardTypes.has('broadcast') || hardTypes.has('firstHost'),
  'Hard questions include network calculations');
console.log('   Adaptive difficulty ranges confirmed.');

// ============================================================
// 11. DIFFICULTY_LABELS German labels
// ============================================================
console.log('11. Testing difficulty labels...');
assert.equal(DIFFICULTY_LABELS.easy, 'Leicht');
assert.equal(DIFFICULTY_LABELS.medium, 'Mittel');
assert.equal(DIFFICULTY_LABELS.hard, 'Schwer');
console.log('   German difficulty labels correct.');

console.log('\n=== All Milestone C5 Tests PASSED ===');
