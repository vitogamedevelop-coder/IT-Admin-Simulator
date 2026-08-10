/**
 * Cisco – Grundlagen als erste Lektion
 *
 * Tests:
 * 1. "Grundlagen" is registered as a full LessonRunner lesson, no new
 *    mechanics/exercise types used.
 * 2. It is the first topic in the "cisco-packet-tracer" catalog, before
 *    "packet-tracer-ui" (which now depends on it).
 * 3. All previously existing Cisco topics are unchanged and still present,
 *    just shifted one prerequisite step later.
 * 4. Theory covers every topic from the brief; quiz covers all objectives.
 */
import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';
import { validateLessonDefinition } from '../src/lib/validateLessonDefinition.js';

globalThis.window = { innerWidth: 400, innerHeight: 800 };

// ============================================================
// 1. Registered as a full lesson
// ============================================================
console.log('1. Testing "Grundlagen" lesson registration...');
const key = topicKey('cisco-packet-tracer', 'grundlagen');
const lesson = LESSONS[key];
assert(lesson, 'grundlagen lesson is registered in LESSONS');
assert.deepEqual(validateLessonDefinition(lesson, key), [], 'grundlagen lesson passes structural validation');
assert(hasLessonContent('cisco-packet-tracer', 'grundlagen'), 'hasLessonContent is true');
console.log(`   ${lesson.explanations.length} sections, ${lesson.exercises.length} exercises, ${lesson.quiz.length} quiz questions.`);

// ============================================================
// 2. First topic in the category, before packet-tracer-ui
// ============================================================
console.log('2. Testing catalog order and prerequisites...');
const ciscoTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === 'cisco-packet-tracer');
assert.equal(ciscoTopics[0].topicId, 'grundlagen', 'grundlagen is the first Cisco topic');
assert.deepEqual(ciscoTopics[0].prerequisites, [], 'grundlagen has no prerequisites (entry point)');
const uiTopic = ciscoTopics.find((t) => t.topicId === 'packet-tracer-ui');
assert(uiTopic, 'packet-tracer-ui still exists');
assert.deepEqual(uiTopic.prerequisites, ['grundlagen'], 'packet-tracer-ui now depends on grundlagen');
console.log('   grundlagen is first; packet-tracer-ui shifted to depend on it.');

// ============================================================
// 3. All previously existing Cisco topics still present
// ============================================================
console.log('3. Testing all previous Cisco topics are unchanged...');
// Note: "grundkonfiguration" was inserted after "grundlagen" by the later
// "Themenstruktur-Anpassung" milestone (see academy-themenstruktur-test.mjs)
// - included here too so this test keeps passing without re-litigating that
// change. "multilayer-switching" was added by Milestone C6 (deep-dive Cisco
// lessons) as a genuinely new topic, alongside the same existing topics.
const EXPECTED_EXISTING = [
  'grundkonfiguration', 'packet-tracer-ui', 'connect-end-devices', 'switch-basics', 'router-basics',
  'basic-device-configuration', 'ip-configuration', 'vlan', 'access-port',
  'trunk', 'inter-vlan-routing', 'static-routing', 'multilayer-switching', 'stp', 'acl', 'nat', 'troubleshooting', 'ssh',
];
for (const topicId of EXPECTED_EXISTING) {
  const exists = ciscoTopics.some((t) => t.topicId === topicId);
  assert(exists, `Existing topic "${topicId}" is still present`);
}
assert.equal(ciscoTopics.length, EXPECTED_EXISTING.length + 1, 'Exactly the expected topics are present, nothing removed');
console.log(`   All ${EXPECTED_EXISTING.length} previous topics preserved, plus 1 new ("grundlagen").`);

// ============================================================
// 4. Theory + quiz coverage
// ============================================================
console.log('4. Testing content coverage of the brief...');
const allText = [
  ...lesson.explanations.flatMap((e) => e.blocks.map((b) => b.content || b.question || JSON.stringify(b.rows || b.items || ''))),
].join(' ');
const REQUIRED_TOPICS = [
  'Access', 'Distribution', 'Core', 'Collapsed Core', 'L2-Switch', 'Multilayer-Switch',
  'GigabitEthernet', 'IOS', 'NVRAM', 'running-config', 'startup-config', 'POST',
  'Konsolen', 'Setup Mode', 'ROMMON', 'erase startup-config', 'Tabulator',
];
for (const term of REQUIRED_TOPICS) {
  assert(allText.includes(term), `Theory covers "${term}"`);
}
assert(lesson.quiz.length >= 20, `Quiz has at least 20 questions (has ${lesson.quiz.length})`);
console.log(`   Theory covers all ${REQUIRED_TOPICS.length} required terms. Quiz has ${lesson.quiz.length} questions.`);

console.log('\n=== Cisco "Grundlagen" lesson verified ===');
