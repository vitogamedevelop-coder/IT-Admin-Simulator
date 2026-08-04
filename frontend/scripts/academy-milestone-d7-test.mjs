/**
 * Milestone D7 – Academy Stabilization & Progression Tests
 *
 * 1. OSI quiz shuffling
 * 2. Binary system input fields (no answer in placeholder)
 * 3. Unlock threshold: single completion unlocks next topic
 * 4. Full unlock chain
 */
import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, TOPIC_STATUS } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { shuffleOptions } from '../src/lib/shuffleOptions.js';
import {
  prerequisitesMet, recordLessonCompletion,
} from '../src/lib/academyEngine.js';
import { readAcademyProgress, writeAcademyProgress } from '../src/lib/academyProgress.js';

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
globalThis.CustomEvent = class CustomEvent {
  constructor(type, { detail } = {}) { this.type = type; this.detail = detail; }
};
globalThis.Event = class Event {
  constructor(type) { this.type = type; }
};

// ============================================================
// 1. OSI quiz shuffling
// ============================================================
console.log('1. Testing OSI quiz shuffling...');
const osiLesson = LESSONS['fundamentals/osi-model'];
assert(osiLesson.quiz, 'OSI lesson has quiz');
assert(osiLesson.quiz.length >= 5, 'OSI quiz has 5+ questions');

for (let qi = 0; qi < osiLesson.quiz.length; qi++) {
  const q = osiLesson.quiz[qi];
  const correctText = q.options[q.correct];
  const positions = new Set();
  for (let run = 0; run < 30; run++) {
    const shuffled = shuffleOptions(q.options, q.correct);
    // Verify correct answer text is preserved
    assert.equal(shuffled.options[shuffled.correct], correctText,
      `OSI Q${qi}: correct answer text preserved`);
    positions.add(shuffled.correct);
  }
  assert(positions.size > 1,
    `OSI Q${qi}: correct answer at varying positions (${positions.size} distinct)`);
}

// Also verify inline questions shuffle
let inlineQuestions = 0;
for (const exp of osiLesson.explanations) {
  for (const block of exp.blocks) {
    if (block.type === 'question') {
      inlineQuestions++;
      const correctText = block.options[block.correct];
      const positions = new Set();
      for (let run = 0; run < 20; run++) {
        const s = shuffleOptions(block.options, block.correct);
        assert.equal(s.options[s.correct], correctText, 'inline Q correct preserved');
        positions.add(s.correct);
      }
      assert(positions.size > 1, `Inline question "${block.question?.slice(0, 30)}..." shuffles`);
    }
  }
}
assert(inlineQuestions >= 10, `OSI has ${inlineQuestions} inline questions (expected 10+)`);
console.log(`   OSI quiz (${osiLesson.quiz.length}) and inline questions (${inlineQuestions}) shuffle correctly.`);

// ============================================================
// 2. Binary system input fields
// ============================================================
console.log('2. Testing binary system input fields...');
const bsLesson = LESSONS['fundamentals/binary-system'];
const inputExercises = bsLesson.exercises.filter(e => e.type === 'input');
assert(inputExercises.length >= 4, `Binary system has ${inputExercises.length} input exercises`);

for (const ex of inputExercises) {
  // Placeholder must NOT be the answer
  if (ex.placeholder) {
    const isAnswer = ex.answers.some(a =>
      String(a).trim().toLowerCase() === String(ex.placeholder).trim().toLowerCase()
    );
    assert(!isAnswer,
      `${ex.id}: placeholder "${ex.placeholder}" must NOT equal answer "${ex.answers[0]}"`);
  }
  // No defaultValue or initialValue that reveals the answer
  assert(!ex.defaultValue, `${ex.id}: no defaultValue`);
  assert(!ex.initialValue, `${ex.id}: no initialValue`);
}

// Also check all other lessons for the same bug
for (const [key, lesson] of Object.entries(LESSONS)) {
  for (const ex of lesson.exercises) {
    if (ex.type === 'input' && ex.placeholder && ex.answers) {
      const isAnswer = ex.answers.some(a =>
        String(a).trim().toLowerCase() === String(ex.placeholder).trim().toLowerCase()
      );
      assert(!isAnswer, `${key}/${ex.id}: placeholder must not be the answer`);
    }
  }
}
console.log('   No input exercise reveals the answer in its placeholder.');

// ============================================================
// 3. Single completion unlocks next topic
// ============================================================
console.log('3. Testing single-completion unlock...');
store.clear();

// Make grundbegriffe AVAILABLE (it starts that way)
const data3 = readAcademyProgress();
data3.topics['fundamentals/grundbegriffe'].status = TOPIC_STATUS.AVAILABLE;
writeAcademyProgress(data3);

// Simulate completing grundbegriffe once
recordLessonCompletion('fundamentals', 'grundbegriffe', 'classic');

// After 1x completion, topologien should be unlocked
const after3 = readAcademyProgress();
assert.equal(after3.topics['fundamentals/topologien'].status, TOPIC_STATUS.AVAILABLE,
  'Topologien unlocked after grundbegriffe 1x completion');
console.log('   Grundbegriffe 1x → Topologien unlocked.');

// ============================================================
// 4. Full unlock chain via single completions
// ============================================================
console.log('4. Testing full unlock chain...');
store.clear();

const CHAIN = [
  { cat: 'fundamentals', topic: 'grundbegriffe', unlocks: ['topologien', 'kommunikation-uebertragung'] },
  { cat: 'fundamentals', topic: 'topologien', unlocks: ['osi-model'] },
  { cat: 'fundamentals', topic: 'osi-model', unlocks: ['tcp-ip-model'] },
  { cat: 'fundamentals', topic: 'tcp-ip-model', unlocks: ['ipv4'] },
  { cat: 'fundamentals', topic: 'ipv4', unlocks: ['subnet-masks'] },
  { cat: 'fundamentals', topic: 'binary-system', unlocks: ['subnet-masks'] },
  { cat: 'fundamentals', topic: 'subnet-masks', unlocks: ['subnetting'] },
  { cat: 'fundamentals', topic: 'subnetting', unlocks: ['vlsm'] },
  { cat: 'fundamentals', topic: 'vlsm', unlocks: ['supernetting'] },
];

// Start: grundbegriffe and binary-system are both initially AVAILABLE
const data4 = readAcademyProgress();
data4.topics['fundamentals/grundbegriffe'].status = TOPIC_STATUS.AVAILABLE;
data4.topics['fundamentals/binary-system'].status = TOPIC_STATUS.AVAILABLE;
writeAcademyProgress(data4);

for (const step of CHAIN) {
  // Complete the topic once
  recordLessonCompletion(step.cat, step.topic, 'classic');
  const current = readAcademyProgress();
  
  for (const dep of step.unlocks) {
    const depKey = `${step.cat}/${dep}`;
    const depStatus = current.topics[depKey]?.status;
    // Some dependents have multiple prerequisites (e.g. subnet-masks needs ipv4 AND binary-system)
    // So they might not unlock until ALL prereqs are met
    const depDef = ACADEMY_TOPICS.find(t => t.categoryId === step.cat && t.topicId === dep);
    const allPrereqsMet = depDef.prerequisites.every(ref => {
      const refKey = `${step.cat}/${ref}`;
      const refProgress = current.topics[refKey];
      return refProgress && ((refProgress.lessonCompletions || 0) >= 1 || refProgress.status === TOPIC_STATUS.LEARNED);
    });
    
    if (allPrereqsMet) {
      assert.equal(depStatus, TOPIC_STATUS.AVAILABLE,
        `${depKey} unlocked after ${step.topic} completion (all prereqs met)`);
    }
    // If not all prereqs met yet, it's expected to still be locked
  }
}

// Final verification: after all chain steps, everything should be unlocked
// (status >= AVAILABLE, i.e. not LOCKED). Completed topics will be STARTED.
const final4 = readAcademyProgress();
const mustBeUnlocked = [
  'topologien', 'osi-model', 'tcp-ip-model', 'ipv4',
  'subnet-masks', 'subnetting', 'vlsm', 'supernetting',
];
for (const t of mustBeUnlocked) {
  const key = `fundamentals/${t}`;
  assert.notEqual(final4.topics[key].status, TOPIC_STATUS.LOCKED,
    `${key} is not locked after full chain completion`);
}
console.log('   Full unlock chain works with single completions.');

// ============================================================
// 5. lessonCompletions >= 1 directly satisfies prerequisites
// ============================================================
console.log('5. Testing lessonCompletions prerequisite check...');
store.clear();
const data5 = readAcademyProgress();
// Simulate: grundbegriffe has 1 completion but low scores
data5.topics['fundamentals/grundbegriffe'].status = TOPIC_STATUS.STARTED;
data5.topics['fundamentals/grundbegriffe'].lessonCompletions = 1;
data5.topics['fundamentals/grundbegriffe'].theoryScore = 0;
data5.topics['fundamentals/grundbegriffe'].contentSeenPercent = 0;
writeAcademyProgress(data5);

// topologien prereq is grundbegriffe
const topologienDef = ACADEMY_TOPICS.find(t => t.topicId === 'topologien');
const met = prerequisitesMet(topologienDef, readAcademyProgress().topics);
assert(met, 'lessonCompletions >= 1 satisfies prerequisite even with 0% progress');
console.log('   lessonCompletions >= 1 is sufficient for prerequisite.');

// ============================================================
// 6. No grind required: 15% OR 1x completion
// ============================================================
console.log('6. Verifying no grind required...');
store.clear();
const data6 = readAcademyProgress();
// Simulate: osi-model with 12% progress but 1 completion
data6.topics['fundamentals/osi-model'].status = TOPIC_STATUS.STARTED;
data6.topics['fundamentals/osi-model'].lessonCompletions = 1;
data6.topics['fundamentals/osi-model'].theoryScore = 2;
data6.topics['fundamentals/osi-model'].contentSeenPercent = 10;
writeAcademyProgress(data6);

const tcpDef = ACADEMY_TOPICS.find(t => t.topicId === 'tcp-ip-model');
const tcpMet = prerequisitesMet(tcpDef, readAcademyProgress().topics);
assert(tcpMet, 'tcp-ip-model unlocks with just 1 osi completion, even below 15%');
console.log('   No grind: 1x completion is enough regardless of score.');

console.log('\n=== All Milestone D7 Tests PASSED ===');
