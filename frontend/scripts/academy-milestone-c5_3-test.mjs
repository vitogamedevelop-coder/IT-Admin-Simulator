/**
 * Milestone C5.3 – Grundlagen überarbeiten und Inhalte konsolidieren
 *
 * Tests:
 * 1. Themencheck renders before the topic list in AcademyCategory.jsx
 * 2. TCP & UDP merged topic exists, is a full LessonRunner lesson, and covers
 *    the required content (acronyms, properties, handshake, admin scenarios)
 * 3. Old tcp/udp/tcp-vs-udp topicIds no longer exist in the catalog
 * 4. Kommunikations-/Übertragungsarten merged topic exists with all 4 sections
 * 5. Old kommunikationsarten/betriebsarten/ausbreitungsarten/uebertragungsmedien
 *    topicIds no longer exist in the catalog
 * 6. Progress migration folds legacy topic progress into the merged topics
 * 7. Placement test targets the merged "tcp-udp" topic
 * 8. No orphaned/duplicate lesson content; category summary stays consistent
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';
import { validateLessonDefinition } from '../src/lib/validateLessonDefinition.js';
import { getCategorySummary } from '../src/lib/academyThemencheck.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src');

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
// 1. Themencheck renders before the topic list
// ============================================================
console.log('1. Testing Themencheck position in AcademyCategory.jsx...');
const categorySource = fs.readFileSync(path.join(srcDir, 'pages', 'AcademyCategory.jsx'), 'utf8');
const themencheckIdx = categorySource.indexOf('Themencheck');
const topicListIdx = categorySource.indexOf('{/* Topic list */}');
assert(themencheckIdx >= 0, 'Themencheck block exists');
assert(topicListIdx >= 0, 'Topic list marker exists');
assert(themencheckIdx < topicListIdx, 'Themencheck renders before the topic list');
// Only one Themencheck card should exist (not duplicated at top AND bottom).
const themencheckButtonCount = (categorySource.match(/navigate\(`\/academy\/themencheck\//g) || []).length;
assert.equal(themencheckButtonCount, 1, 'Exactly one Themencheck card is rendered');
console.log('   Themencheck is the first quiz-style entry.');

// ============================================================
// 2. TCP & UDP merged lesson
// ============================================================
console.log('2. Testing merged "TCP & UDP" lesson...');
const tcpUdpKey = topicKey('fundamentals', 'tcp-udp');
const tcpUdpLesson = LESSONS[tcpUdpKey];
assert(tcpUdpLesson, 'tcp-udp lesson is registered in LESSONS');
assert.deepEqual(validateLessonDefinition(tcpUdpLesson, tcpUdpKey), [], 'tcp-udp lesson passes structural validation');
assert(hasLessonContent('fundamentals', 'tcp-udp'), 'tcp-udp has lesson content');

const explanationIds = tcpUdpLesson.explanations.map((e) => e.id);
assert(explanationIds.some((id) => id.startsWith('tcp-')), 'Has a dedicated TCP section');
assert(explanationIds.some((id) => id.startsWith('udp-')), 'Has a dedicated UDP section');
assert(explanationIds.some((id) => id.startsWith('handshake')), 'Has a dedicated Three-Way Handshake section');
assert(explanationIds.some((id) => id.startsWith('comparison')), 'Has a dedicated TCP vs. UDP comparison section');

const handshakeExercise = tcpUdpLesson.exercises.find((ex) => ex.id === 'handshake-ordering');
assert(handshakeExercise, 'Handshake ordering exercise exists');
assert.deepEqual(handshakeExercise.correctOrder, ['syn', 'synack', 'ack'], 'Handshake order is SYN -> SYN-ACK -> ACK');

const tcpUdpQuiz = tcpUdpLesson.quiz;
assert(tcpUdpQuiz.length >= 15, `TCP & UDP quiz has at least 15 questions (has ${tcpUdpQuiz.length})`);
const quizText = tcpUdpQuiz.map((q) => [q.question, ...(q.options || [])].join(' ')).join(' ');
assert(quizText.includes('TCP') && quizText.includes('UDP'), 'Quiz covers both TCP and UDP');
assert(/Transmission Control Protocol/.test(quizText), 'Quiz asks for the TCP acronym');
assert(/User Datagram Protocol/.test(quizText), 'Quiz asks for the UDP acronym');
assert(quizText.toLowerCase().includes('handshake'), 'Quiz covers the handshake');
assert(quizText.toLowerCase().includes('firewall') || quizText.toLowerCase().includes('administrator'), 'Quiz covers an administrator scenario');
console.log(`   TCP & UDP lesson has ${explanationIds.length} sections, ${tcpUdpLesson.exercises.length} exercises, ${tcpUdpQuiz.length} quiz questions.`);

// ============================================================
// 3. Old TCP/UDP topicIds no longer exist
// ============================================================
console.log('3. Testing old tcp/udp/tcp-vs-udp topicIds are gone...');
for (const oldId of ['tcp', 'udp', 'tcp-vs-udp']) {
  const exists = ACADEMY_TOPICS.some((t) => t.categoryId === 'fundamentals' && t.topicId === oldId);
  assert.equal(exists, false, `Old topicId "${oldId}" no longer exists in the catalog`);
}
console.log('   Old topicIds removed.');

// ============================================================
// 4. Kommunikations-/Übertragungsarten merged lesson
// ============================================================
console.log('4. Testing merged "Kommunikations- und Übertragungsarten" lesson...');
const kommKey = topicKey('fundamentals', 'kommunikation-uebertragung');
const kommLesson = LESSONS[kommKey];
assert(kommLesson, 'kommunikation-uebertragung lesson is registered in LESSONS');
assert.deepEqual(validateLessonDefinition(kommLesson, kommKey), [], 'kommunikation-uebertragung lesson passes structural validation');

const kommIds = kommLesson.explanations.map((e) => e.id);
assert(kommIds.some((id) => id.startsWith('kommunikation-')), 'Covers Kommunikationsarten');
assert(kommIds.some((id) => id.startsWith('betrieb-')), 'Covers Betriebsarten');
assert(kommIds.some((id) => id.startsWith('ausbreitung-')), 'Covers Ausbreitungsarten');
assert(kommIds.some((id) => id.startsWith('medien-')), 'Covers Übertragungsmedien');
assert(kommLesson.quiz.length >= 10, `Quiz has at least 10 questions (has ${kommLesson.quiz.length})`);
console.log(`   Kommunikations-/Übertragungslektion has ${kommIds.length} sections, ${kommLesson.quiz.length} quiz questions.`);

// ============================================================
// 5. Old four placeholder topicIds no longer exist
// ============================================================
console.log('5. Testing old Kommunikations-/Betriebs-/... topicIds are gone...');
for (const oldId of ['kommunikationsarten', 'betriebsarten', 'ausbreitungsarten', 'uebertragungsmedien']) {
  const exists = ACADEMY_TOPICS.some((t) => t.categoryId === 'fundamentals' && t.topicId === oldId);
  assert.equal(exists, false, `Old topicId "${oldId}" no longer exists in the catalog`);
}
console.log('   Old topicIds removed.');

// ============================================================
// 6. Progress migration folds legacy progress into merged topics
// ============================================================
console.log('6. Testing legacy progress migration...');
store.clear();
const { readAcademyProgress } = await import('../src/lib/academyProgress.js');
const { TOPIC_STATUS } = await import('../src/lib/academyTopics.js');

// Simulate an old save (pre-C5.3) with legacy topic keys.
const legacySave = {
  stateVersion: 6,
  playerProfile: { preferredExplanationStyle: null },
  topics: {
    'fundamentals/tcp': { status: TOPIC_STATUS.LEARNED, theoryScore: 40, practiceScore: 0, retentionScore: 0 },
    'fundamentals/udp': { status: TOPIC_STATUS.STARTED, theoryScore: 20, practiceScore: 0, retentionScore: 0 },
    'fundamentals/betriebsarten': { status: TOPIC_STATUS.AVAILABLE, theoryScore: 0, practiceScore: 0, retentionScore: 0 },
  },
};
localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(legacySave));
const migrated = readAcademyProgress();
const mergedTcpUdp = migrated.topics['fundamentals/tcp-udp'];
assert(mergedTcpUdp, 'Merged tcp-udp progress entry exists after migration');
assert.equal(mergedTcpUdp.status, TOPIC_STATUS.LEARNED, 'Merged tcp-udp takes the most advanced legacy status (learned)');
assert.equal(mergedTcpUdp.theoryScore, 40, 'Merged tcp-udp takes the max legacy theoryScore');
assert(!migrated.topics['fundamentals/tcp'], 'Old "tcp" key is dropped after migration');
assert(!migrated.topics['fundamentals/udp'], 'Old "udp" key is dropped after migration');
console.log('   Legacy tcp/udp progress correctly folded into tcp-udp.');
store.clear();

// ============================================================
// 7. Placement test targets the merged topic
// ============================================================
console.log('7. Testing placement test targets merged topic...');
const placementSource = fs.readFileSync(path.join(srcDir, 'pages', 'AcademyPlacementTcpUdp.jsx'), 'utf8');
assert(placementSource.includes("topicId: 'tcp-udp'"), 'Placement test marks the merged tcp-udp topic as learned');
assert(!placementSource.includes("topicId: 'tcp-vs-udp'"), 'Placement test no longer references the old tcp-vs-udp topic');
console.log('   Placement test targets the merged topic.');

// ============================================================
// 8. Category summary stays consistent (no orphaned/duplicate content)
// ============================================================
console.log('8. Testing category summary consistency...');
store.clear();
const summary = getCategorySummary('fundamentals');
assert(summary.lessonCount > 0, 'Category summary reports at least one lesson');
assert(summary.totalQuestions > 0, 'Category summary reports quiz questions');
const seenTitles = new Set();
for (const name of summary.topicNames) {
  assert(!seenTitles.has(name), `No duplicate topic name in summary: ${name}`);
  seenTitles.add(name);
}
console.log(`   Category summary: ${summary.lessonCount} lessons, ${summary.totalQuestions} questions, no duplicates.`);

console.log('\n=== All Milestone C5.3 Tests PASSED ===');
