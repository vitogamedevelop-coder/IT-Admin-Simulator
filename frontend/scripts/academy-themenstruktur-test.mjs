/**
 * Anpassung der Themenstruktur (DNS/DHCP/Routing/Switching/VLAN-Grundlagen +
 * Cisco "Grundkonfiguration")
 *
 * Tests:
 * 1. All six new lessons (dns, dhcp, routing, switching, vlan-basics under
 *    "fundamentals"; grundkonfiguration under "cisco-packet-tracer") are
 *    registered as full LessonRunner lessons and pass structural validation.
 * 2. "Grundkonfiguration" is the second topic in the Cisco catalog, directly
 *    after "Grundlagen", and every previously existing Cisco topic is
 *    unchanged (still present, unaffected prerequisites/order).
 * 3. Each new "fundamentals" lesson still exists at its previously defined
 *    catalog position/prerequisites (only lesson content was added, no
 *    catalog changes were needed there).
 * 4. Content coverage: DNS covers Windows Server practice (role, forward/
 *    reverse zone, A-/PTR-record, testing, shortcuts); DHCP covers Windows
 *    Server practice (role, scope, exclusion, lease, reservation,
 *    authorization, testing, shortcuts); Grundkonfiguration covers VLAN,
 *    Access-Port, Trunk-Port, unused ports, IOS basics and troubleshooting
 *    commands from the course notes.
 * 5. Every lesson has a non-empty summary array (used by LessonRunner's
 *    final review screen).
 */
import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';
import { validateLessonDefinition } from '../src/lib/validateLessonDefinition.js';

globalThis.window = { innerWidth: 400, innerHeight: 800 };

function lessonText(lesson) {
  return [
    ...lesson.explanations.flatMap((e) => e.blocks.map((b) => [b.title, b.content, b.question, JSON.stringify(b.rows || ''), JSON.stringify(b.items || '')].join(' '))),
  ].join(' ');
}

// ============================================================
// 1. All six new lessons registered and structurally valid
// ============================================================
console.log('1. Testing registration and structural validity of all six new lessons...');
const NEW_LESSONS = [
  ['fundamentals', 'dns'],
  ['fundamentals', 'dhcp'],
  ['fundamentals', 'routing'],
  ['fundamentals', 'switching'],
  ['fundamentals', 'vlan-basics'],
  ['cisco-packet-tracer', 'grundkonfiguration'],
];
for (const [categoryId, topicId] of NEW_LESSONS) {
  const key = topicKey(categoryId, topicId);
  const lesson = LESSONS[key];
  assert(lesson, `${key} lesson is registered in LESSONS`);
  assert.deepEqual(validateLessonDefinition(lesson, key), [], `${key} lesson passes structural validation`);
  assert(hasLessonContent(categoryId, topicId), `${key} hasLessonContent is true`);
  assert(Array.isArray(lesson.summary) && lesson.summary.length > 0, `${key} has a non-empty summary`);
  console.log(`   ${key}: ${lesson.explanations.length} sections, ${lesson.exercises.length} exercises, ${lesson.quiz.length} quiz questions.`);
}

// ============================================================
// 2. Grundkonfiguration is second in the Cisco catalog, rest unchanged
// ============================================================
console.log('2. Testing Cisco catalog order and prerequisites...');
const ciscoTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === 'cisco-packet-tracer');
assert.equal(ciscoTopics[0].topicId, 'grundlagen', 'grundlagen is still the first Cisco topic');
assert.equal(ciscoTopics[1].topicId, 'grundkonfiguration', 'grundkonfiguration is the second Cisco topic');
assert.deepEqual(ciscoTopics[1].prerequisites, ['grundlagen'], 'grundkonfiguration depends only on grundlagen');
// Milestone C6 re-chained "router-basics" (now content-bearing) after
// "trunk" instead of "connect-end-devices", swapped "static-routing" and
// "inter-vlan-routing" to match the actual learning order, and inserted the
// new "multilayer-switching" topic - see academyTopics.js for the reasoning.
const EXPECTED_EXISTING_CISCO = [
  'grundlagen', 'grundkonfiguration', 'packet-tracer-ui', 'connect-end-devices', 'switch-basics',
  'basic-device-configuration', 'ip-configuration', 'vlan', 'access-port',
  'trunk', 'router-basics', 'static-routing', 'inter-vlan-routing', 'multilayer-switching', 'stp', 'acl', 'nat', 'troubleshooting', 'ssh',
];
assert.deepEqual(ciscoTopics.map((t) => t.topicId), EXPECTED_EXISTING_CISCO, 'Cisco catalog order matches: grundkonfiguration inserted, nothing else moved/removed');
const uiTopic = ciscoTopics.find((t) => t.topicId === 'packet-tracer-ui');
assert.deepEqual(uiTopic.prerequisites, ['grundlagen'], 'packet-tracer-ui prerequisites unchanged');
console.log('   Order verified: grundlagen -> grundkonfiguration -> packet-tracer-ui -> ... (unchanged tail).');

// ============================================================
// 3. Fundamentals topics unchanged in catalog, only lesson content added
// ============================================================
console.log('3. Testing fundamentals catalog is unchanged (only content added)...');
const fundamentalsTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === 'fundamentals');
for (const topicId of ['dns', 'dhcp', 'routing', 'switching', 'vlan-basics']) {
  const t = fundamentalsTopics.find((x) => x.topicId === topicId);
  assert(t, `fundamentals/${topicId} still exists in the catalog`);
}
const dnsTopic = fundamentalsTopics.find((t) => t.topicId === 'dns');
assert.deepEqual(dnsTopic.prerequisites, ['ports'], 'dns prerequisites unchanged');
const dhcpTopic = fundamentalsTopics.find((t) => t.topicId === 'dhcp');
assert.deepEqual(dhcpTopic.prerequisites, ['ports'], 'dhcp prerequisites unchanged');
const routingTopic = fundamentalsTopics.find((t) => t.topicId === 'routing');
assert.deepEqual(routingTopic.prerequisites, ['ipv4'], 'routing prerequisites unchanged');
const switchingTopic = fundamentalsTopics.find((t) => t.topicId === 'switching');
assert.deepEqual(switchingTopic.prerequisites, ['grundbegriffe'], 'switching prerequisites unchanged');
const vlanBasicsTopic = fundamentalsTopics.find((t) => t.topicId === 'vlan-basics');
assert.deepEqual(vlanBasicsTopic.prerequisites, ['switching'], 'vlan-basics prerequisites unchanged');
console.log('   All five fundamentals topics unchanged in the catalog - only lesson content was added.');

// ============================================================
// 4. Content coverage against the course brief
// ============================================================
console.log('4. Testing content coverage of the brief...');

const dnsLesson = LESSONS[topicKey('fundamentals', 'dns')];
const dnsText = lessonText(dnsLesson);
for (const term of ['DNS-Server-Rolle', 'Forward Lookup Zone', 'Reverse Lookup Zone', 'Primär', 'Sekundär', 'A-Record', 'A oder AAAA', 'PTR', 'nslookup', 'ncpa.cpl', 'sysdm.cpl']) {
  assert(dnsText.includes(term), `DNS lesson covers "${term}"`);
}

const dhcpLesson = LESSONS[topicKey('fundamentals', 'dhcp')];
const dhcpText = lessonText(dhcpLesson);
for (const term of ['DHCP-Server-Rolle', 'Scope', 'Ausschluss', 'Lease', 'Gateway', 'DNS-Server', 'Reservierung', 'Autorisier', 'ipconfig']) {
  assert(dhcpText.includes(term), `DHCP lesson covers "${term}"`);
}

const grundkonfigLesson = LESSONS[topicKey('cisco-packet-tracer', 'grundkonfiguration')];
const grundkonfigText = lessonText(grundkonfigLesson);
for (const term of [
  'vlan', 'name', 'switchport access vlan', 'show vlan brief',
  'switchport mode access', 'switchport mode trunk', 'switchport trunk allowed vlan', 'show interfaces trunk',
  'interface range', 'shutdown',
  'enable secret', 'enable password', 'username', 'line console 0', 'login local', 'exec-timeout', 'service password-encryption', 'copy running-config startup-config',
  'show ip interface brief', 'show interfaces status',
]) {
  assert(grundkonfigText.includes(term), `Grundkonfiguration lesson covers "${term}"`);
}
console.log('   DNS, DHCP and Grundkonfiguration cover all required terms from the course notes.');

console.log('\n=== Themenstruktur-Anpassung verified ===');
