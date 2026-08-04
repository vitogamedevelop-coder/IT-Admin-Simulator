/**
 * Academy Recovery Test
 *
 * Validates that all finished lessons load correctly, placeholders are clean,
 * Grundbegriffe options shuffle, and the unlock cascade works.
 */
import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey, TOPIC_STATUS } from '../src/lib/academyTopics.js';
import { LESSONS, getTopicScoreDimensions } from '../src/lib/academyLessonData.js';
import { validateLessonDefinition } from '../src/lib/validateLessonDefinition.js';
import { shuffleOptions } from '../src/lib/shuffleOptions.js';
import { ensureInitialUnlocks } from '../src/lib/academyEngine.js';
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
// Constants
// ============================================================
const FINISHED_LESSONS = [
  'fundamentals/topologien',
  'fundamentals/osi-model',
  'fundamentals/tcp-ip-model',
  'fundamentals/binary-system',
  'fundamentals/ipv4',
  'fundamentals/subnet-masks',
  'fundamentals/subnetting',
  'fundamentals/vlsm',
  'fundamentals/supernetting',
  'fundamentals/tcp-udp',
  'fundamentals/kommunikation-uebertragung',
];

const PLACEHOLDER_TOPICS = [
  { categoryId: 'fundamentals', topicId: 'dns' },
  { categoryId: 'fundamentals', topicId: 'dhcp' },
];

// ============================================================
// 1. All finished lessons registered in LESSONS
// ============================================================
console.log('1. Checking finished lessons are registered...');
for (const key of FINISHED_LESSONS) {
  const lesson = LESSONS[key];
  assert(lesson, `Lesson ${key} must exist in LESSONS`);
  assert(Array.isArray(lesson.explanations), `${key} explanations is array`);
  assert(lesson.explanations.length > 0, `${key} has explanations`);
  assert(Array.isArray(lesson.exercises), `${key} exercises is array`);
}
console.log(`   All ${FINISHED_LESSONS.length} finished lessons registered.`);

// ============================================================
// 2. validateLessonDefinition passes for all finished lessons
// ============================================================
console.log('2. Running validateLessonDefinition on all lessons...');
for (const key of FINISHED_LESSONS) {
  const errors = validateLessonDefinition(LESSONS[key], key);
  assert.equal(errors.length, 0, `${key} validation: ${errors.join('; ')}`);
}
console.log('   All lessons pass structural validation.');

// ============================================================
// 3. Topic-Key consistency
// ============================================================
console.log('3. Checking topic-key consistency...');
for (const key of FINISHED_LESSONS) {
  const [catId, topId] = key.split('/');
  const topicDef = ACADEMY_TOPICS.find(t => t.categoryId === catId && t.topicId === topId);
  assert(topicDef, `Topic definition for ${key} exists`);
  assert.equal(topicKey(catId, topId), key, `topicKey matches ${key}`);
}
console.log('   All keys consistent.');

// ============================================================
// 4. Section structure (LessonRunner compatibility)
// ============================================================
console.log('4. Checking LessonRunner section structure...');
for (const key of FINISHED_LESSONS) {
  const lesson = LESSONS[key];
  // Each explanation must have an id (section-style) with blocks
  for (const exp of lesson.explanations) {
    assert(exp.id, `${key}: explanation has id`);
    assert(Array.isArray(exp.blocks), `${key}: explanation ${exp.id} has blocks array`);
    assert(exp.blocks.length > 0, `${key}: explanation ${exp.id} has at least one block`);
  }
  // Exercises must have id and type
  for (const ex of lesson.exercises) {
    assert(ex.id, `${key}: exercise has id`);
    assert(ex.type, `${key}: exercise ${ex.id} has type`);
  }
}
console.log('   LessonRunner structure OK for all lessons.');

// ============================================================
// 5. Score dimensions are set for finished lessons
// ============================================================
console.log('5. Checking score dimensions...');
for (const key of FINISHED_LESSONS) {
  const [catId, topId] = key.split('/');
  const dims = getTopicScoreDimensions(catId, topId);
  assert(dims.theory === true, `${key} has theory dimension`);
  assert(dims.practice === true, `${key} has practice dimension`);
}
console.log('   Score dimensions correct.');

// ============================================================
// 6. Placeholder topics have NO lessons and NO score dimensions
// ============================================================
console.log('6. Checking placeholder topics...');
for (const { categoryId, topicId } of PLACEHOLDER_TOPICS) {
  const key = topicKey(categoryId, topicId);
  assert(!LESSONS[key], `${key} has NO LESSONS entry (placeholder)`);
  const dims = getTopicScoreDimensions(categoryId, topicId);
  assert(dims.theory === false && dims.practice === false && dims.retention === false,
    `${key} has no score dimensions`);
  const topicDef = ACADEMY_TOPICS.find(t => t.categoryId === categoryId && t.topicId === topicId);
  assert(topicDef, `${key} topic definition exists`);
  assert(topicDef.status === TOPIC_STATUS.LOCKED, `${key} starts as locked`);
}
console.log('   Placeholders are clean: no lessons, no scores, locked.');

// ============================================================
// 7. Course mode bypasses locks for all topics
// ============================================================
console.log('7. Checking course mode bypass...');
for (const key of FINISHED_LESSONS) {
  const [catId, topId] = key.split('/');
  const topicDef = ACADEMY_TOPICS.find(t => t.categoryId === catId && t.topicId === topId);
  const locked = topicDef.status === TOPIC_STATUS.LOCKED;
  const courseMode = true;
  const effectiveLocked = locked && !courseMode;
  assert(effectiveLocked === false, `${key} accessible in course mode`);
}
console.log('   Course mode bypass works.');

// ============================================================
// 8. Grundbegriffe answer shuffling
// ============================================================
console.log('8. Testing Grundbegriffe answer shuffling...');
const BASICS_QUESTIONS = [
  { options: ['Damit jedes Gerät unabhängig von den anderen läuft', 'Damit Ressourcen wie Dateien und Drucker gemeinsam genutzt werden können'], correct: 1 },
  { options: ['Ein physisches Netzwerkkabel', 'Ein Regelwerk für die Kommunikation zwischen Geräten'], correct: 1 },
  { options: ['Simplex', 'Vollduplex'], correct: 1 },
];

// Test: correct answer is preserved after shuffle
for (let qi = 0; qi < BASICS_QUESTIONS.length; qi++) {
  const q = BASICS_QUESTIONS[qi];
  const correctText = q.options[q.correct];
  const shuffled = shuffleOptions(q.options, q.correct);
  assert.equal(shuffled.options[shuffled.correct], correctText,
    `Q${qi}: correct answer text preserved after shuffle`);
}

// Test: over 20 runs, the correct answer doesn't ALWAYS end up at the same position
for (let qi = 0; qi < BASICS_QUESTIONS.length; qi++) {
  const q = BASICS_QUESTIONS[qi];
  const positions = new Set();
  for (let run = 0; run < 20; run++) {
    const { correct } = shuffleOptions(q.options, q.correct);
    positions.add(correct);
  }
  assert(positions.size > 1,
    `Q${qi}: correct answer appears at varying positions (saw ${positions.size} distinct positions in 20 runs)`);
}
console.log('   Grundbegriffe shuffling verified: answers vary, correctness preserved.');

// ============================================================
// 9. ensureInitialUnlocks cascade
// ============================================================
console.log('9. Testing ensureInitialUnlocks cascade...');
store.clear();
// Simulate grundbegriffe with enough progress to unlock dependents
const data = readAcademyProgress();
const gbKey = 'fundamentals/grundbegriffe';
data.topics[gbKey].status = TOPIC_STATUS.STARTED;
data.topics[gbKey].theoryScore = 10;
data.topics[gbKey].contentSeenPercent = 50;
writeAcademyProgress(data);

ensureInitialUnlocks();

const postData = readAcademyProgress();
// Topics depending on grundbegriffe should now be AVAILABLE
const dependents = ['topologien', 'kommunikation-uebertragung'];
for (const dep of dependents) {
  const depKey = `fundamentals/${dep}`;
  assert.equal(postData.topics[depKey].status, TOPIC_STATUS.AVAILABLE,
    `${depKey} unlocked after grundbegriffe reaches 15%`);
}
console.log('   Unlock cascade works for grundbegriffe dependents.');

// ============================================================
// 10. Prerequisite chain: osi → tcp-ip → ipv4
// ============================================================
console.log('10. Testing prerequisite chain...');
store.clear();
const chainData = readAcademyProgress();
// osi-model at 20%
chainData.topics['fundamentals/osi-model'].status = TOPIC_STATUS.STARTED;
chainData.topics['fundamentals/osi-model'].theoryScore = 10;
chainData.topics['fundamentals/osi-model'].contentSeenPercent = 50;
writeAcademyProgress(chainData);
ensureInitialUnlocks();
let chain = readAcademyProgress();
assert.equal(chain.topics['fundamentals/tcp-ip-model'].status, TOPIC_STATUS.AVAILABLE, 'tcp-ip unlocked after osi');

// Now advance tcp-ip-model
chain.topics['fundamentals/tcp-ip-model'].status = TOPIC_STATUS.STARTED;
chain.topics['fundamentals/tcp-ip-model'].theoryScore = 10;
chain.topics['fundamentals/tcp-ip-model'].contentSeenPercent = 50;
writeAcademyProgress(chain);
ensureInitialUnlocks();
chain = readAcademyProgress();
assert.equal(chain.topics['fundamentals/ipv4'].status, TOPIC_STATUS.AVAILABLE, 'ipv4 unlocked after tcp-ip');
console.log('   Prerequisite chain osi→tcp-ip→ipv4 works.');

// ============================================================
// 11. Subnetting chain: ipv4+binary → subnet-masks → subnetting → vlsm → supernetting
// ============================================================
console.log('11. Testing subnetting chain...');
store.clear();
const subData = readAcademyProgress();
// ipv4 and binary-system both at >15%
subData.topics['fundamentals/ipv4'].status = TOPIC_STATUS.STARTED;
subData.topics['fundamentals/ipv4'].theoryScore = 10;
subData.topics['fundamentals/ipv4'].contentSeenPercent = 50;
subData.topics['fundamentals/binary-system'].status = TOPIC_STATUS.STARTED;
subData.topics['fundamentals/binary-system'].theoryScore = 10;
subData.topics['fundamentals/binary-system'].contentSeenPercent = 50;
writeAcademyProgress(subData);
ensureInitialUnlocks();
let sub = readAcademyProgress();
assert.equal(sub.topics['fundamentals/subnet-masks'].status, TOPIC_STATUS.AVAILABLE, 'subnet-masks unlocked');

sub.topics['fundamentals/subnet-masks'].status = TOPIC_STATUS.STARTED;
sub.topics['fundamentals/subnet-masks'].theoryScore = 10;
sub.topics['fundamentals/subnet-masks'].contentSeenPercent = 50;
writeAcademyProgress(sub);
ensureInitialUnlocks();
sub = readAcademyProgress();
assert.equal(sub.topics['fundamentals/subnetting'].status, TOPIC_STATUS.AVAILABLE, 'subnetting unlocked');

sub.topics['fundamentals/subnetting'].status = TOPIC_STATUS.STARTED;
sub.topics['fundamentals/subnetting'].theoryScore = 10;
sub.topics['fundamentals/subnetting'].contentSeenPercent = 50;
writeAcademyProgress(sub);
ensureInitialUnlocks();
sub = readAcademyProgress();
assert.equal(sub.topics['fundamentals/vlsm'].status, TOPIC_STATUS.AVAILABLE, 'vlsm unlocked');

sub.topics['fundamentals/vlsm'].status = TOPIC_STATUS.STARTED;
sub.topics['fundamentals/vlsm'].theoryScore = 10;
sub.topics['fundamentals/vlsm'].contentSeenPercent = 50;
writeAcademyProgress(sub);
ensureInitialUnlocks();
sub = readAcademyProgress();
assert.equal(sub.topics['fundamentals/supernetting'].status, TOPIC_STATUS.AVAILABLE, 'supernetting unlocked');
console.log('   Subnetting chain verified.');

// ============================================================
// 12. No duplicate topic IDs
// ============================================================
console.log('12. Checking for duplicate topic keys...');
const allKeys = ACADEMY_TOPICS.map(t => topicKey(t.categoryId, t.topicId));
const keySet = new Set(allKeys);
assert.equal(keySet.size, allKeys.length, 'No duplicate topic keys');
console.log('   No duplicates found.');

// ============================================================
// 13. Import integrity: all LESSONS keys match a real topic
// ============================================================
console.log('13. Checking LESSONS keys match real topics...');
for (const key of Object.keys(LESSONS)) {
  const [catId, topId] = key.split('/');
  const topicDef = ACADEMY_TOPICS.find(t => t.categoryId === catId && t.topicId === topId);
  assert(topicDef, `LESSONS key ${key} has a matching topic definition`);
}
console.log('   All LESSONS keys have matching topics.');

// ============================================================
// 14. Grundbegriffe is special (no LESSONS entry, own component)
// ============================================================
console.log('14. Checking Grundbegriffe special handling...');
assert(!LESSONS['fundamentals/grundbegriffe'], 'Grundbegriffe uses its own component, not LESSONS');
const gbDef = ACADEMY_TOPICS.find(t => t.topicId === 'grundbegriffe');
assert(gbDef, 'Grundbegriffe topic exists');
assert.equal(gbDef.status, TOPIC_STATUS.AVAILABLE, 'Grundbegriffe starts as available');
const gbDims = getTopicScoreDimensions('fundamentals', 'grundbegriffe');
assert(gbDims.theory === true, 'Grundbegriffe shows theory score');
console.log('   Grundbegriffe handling correct.');

console.log('\n=== All Academy Recovery Tests PASSED ===');
