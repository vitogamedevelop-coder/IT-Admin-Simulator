/**
 * Milestone C5.1 – Academy Feinschliff (Subnetting & IPv4)
 *
 * Tests:
 * 1. TCP/IP matching: many-to-one assignments work (6 protocols → 4 layers)
 * 2. IPv4 generator: no network class questions
 * 3. Subnet masks: Bitwerte + Sprungweiten tables present
 * 4. Prefix input: /26 and 26 both accepted
 * 5. Academy intro tutorial key exists
 * 6. Placeholder detection: hasLessonContent
 * 7. checkAnswer prefix normalization
 */
import assert from 'node:assert/strict';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';
import {
  generateQuestion, generateSubnettingQuestion, generateExamQuestions,
  checkAnswer, getRandomTip, DIFFICULTY_NAMES, DIFFICULTY_LABELS,
} from '../src/lib/academyLessons/ipv4Generator.js';

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
// 1. TCP/IP matching: many-to-one (6 protocols → 4 layers)
// ============================================================
console.log('1. Testing TCP/IP matching many-to-one...');
const tcpIpLesson = LESSONS['fundamentals/tcp-ip-model'];
assert(tcpIpLesson, 'TCP/IP lesson exists');
const protocolMatching = tcpIpLesson.exercises.find(e => e.id === 'tcpip-protocols');
assert(protocolMatching, 'Protocol matching exercise exists');
assert.equal(protocolMatching.pairs.length, 6, 'Has 6 protocols to match');

// Count unique right-side values
const rightValues = new Set(protocolMatching.pairs.map(p => p.right));
assert.equal(rightValues.size, 4, 'Only 4 unique right-side targets (layers)');

// HTTP and DNS both map to Anwendung
const httpPair = protocolMatching.pairs.find(p => p.left === 'HTTP');
const dnsPair = protocolMatching.pairs.find(p => p.left === 'DNS');
assert(httpPair, 'HTTP pair exists');
assert(dnsPair, 'DNS pair exists');
assert.equal(httpPair.right, dnsPair.right, 'HTTP and DNS map to same layer');
assert(httpPair.right.includes('Anwendung'), 'Both map to Anwendung');

// TCP and UDP both map to Transport
const tcpPair = protocolMatching.pairs.find(p => p.left === 'TCP');
const udpPair = protocolMatching.pairs.find(p => p.left === 'UDP');
assert(tcpPair, 'TCP pair exists');
assert(udpPair, 'UDP pair exists');
assert.equal(tcpPair.right, udpPair.right, 'TCP and UDP map to same layer');
assert(tcpPair.right.includes('Transport'), 'Both map to Transport');
console.log('   Many-to-one matching verified (HTTP+DNS→Anwendung, TCP+UDP→Transport).');

// ============================================================
// 2. IPv4 generator: no network class questions
// ============================================================
console.log('2. Testing no network class questions...');
for (let i = 0; i < 200; i++) {
  const q = generateQuestion('easy');
  assert(!q.question.includes('Netzklasse'), `Question must not contain Netzklasse: "${q.question}"`);
  assert(!q.question.includes('Klasse A'), `Question must not contain Klasse A: "${q.question}"`);
  assert(!q.question.includes('Klasse B'), `Question must not contain Klasse B: "${q.question}"`);
  assert(!q.question.includes('Klasse C'), `Question must not contain Klasse C: "${q.question}"`);
  assert(!q.question.includes('Klasse D'), `Question must not contain Klasse D: "${q.question}"`);
}
// Verify new question types exist
const easyTypes = new Set();
for (let i = 0; i < 300; i++) {
  const q = generateQuestion('easy');
  if (q.question.includes('privat') || q.question.includes('öffentlich')) easyTypes.add('privateOrPublic');
  if (q.question.includes('Adresstyp') || q.question.includes('Loopback') || q.question.includes('APIPA') || q.question.includes('Multicast')) easyTypes.add('specialAddress');
}
assert(easyTypes.has('privateOrPublic'), 'Easy questions include private/public questions');
assert(easyTypes.has('specialAddress'), 'Easy questions include special address questions');
console.log('   No network class questions found. Private/public and special address types present.');

// ============================================================
// 3. Subnet masks: Bitwerte + Sprungweiten tables
// ============================================================
console.log('3. Testing subnet mask explanations...');
const subnetMasksLesson = LESSONS['fundamentals/subnet-masks'];
assert(subnetMasksLesson, 'Subnet masks lesson exists');

const bitwerteSection = subnetMasksLesson.explanations.find(e => e.id === 'bitwerte-classic');
assert(bitwerteSection, 'Bitwerte section exists');
const bitwerteText = bitwerteSection.blocks.map(b => b.content || '').join(' ');
assert(bitwerteText.includes('128 | 64 | 32 | 16 | 8 | 4 | 2 | 1'), 'Contains bit values row');

const prefixTable = subnetMasksLesson.explanations.find(e => e.id === 'prefix-tabelle-classic');
assert(prefixTable, 'Prefix table section exists');
const tableBlock = prefixTable.blocks.find(b => b.type === 'table');
assert(tableBlock, 'Contains a table block');
assert.equal(tableBlock.rows.length, 8, 'Table has 8 rows (/25-/32)');
assert.deepEqual(tableBlock.headers, ['Präfix', 'Netzbits', 'Maskenwert'], 'Correct headers');
assert.deepEqual(tableBlock.rows[0], ['/25', '1', '128'], 'First row is /25');
assert.deepEqual(tableBlock.rows[7], ['/32', '8', '255'], 'Last row is /32');

const sprungTable = subnetMasksLesson.explanations.find(e => e.id === 'sprungweiten-classic');
assert(sprungTable, 'Sprungweiten section exists');
const sprungTableBlock = sprungTable.blocks.find(b => b.type === 'table');
assert(sprungTableBlock, 'Contains a Sprungweiten table');
assert.deepEqual(sprungTableBlock.headers, ['Präfix', 'Maskenwert', 'Sprungweite'], 'Correct Sprungweiten headers');
assert.deepEqual(sprungTableBlock.rows[0], ['/25', '128', '128'], 'First jump row');
assert.deepEqual(sprungTableBlock.rows[7], ['/32', '255', '1'], 'Last jump row');

// Verify Sam's note about not memorizing
const sprungText = sprungTable.blocks.map(b => b.content || '').join(' ');
assert(sprungText.includes('keine Auswendiglernhilfe'), 'Sam says not to memorize');
assert(sprungText.includes('256'), 'Mentions 256 formula');

// Old cheat sheet should be gone
const oldCheat = subnetMasksLesson.explanations.find(e => e.id === 'cheat-sheet-classic');
assert(!oldCheat, 'Old cheat sheet section removed');
console.log('   Bitwerte + Sprungweiten tables present, old cheat sheet removed.');

// ============================================================
// 4. Prefix input: /26 and 26 both accepted
// ============================================================
console.log('4. Testing prefix input normalization...');
// checkAnswer should accept both /26 and 26
assert(checkAnswer({ answer: '26' }, '26'), 'Plain number accepted');
assert(checkAnswer({ answer: '26' }, '/26'), '/26 accepted when answer is 26');
assert(checkAnswer({ answer: '/26' }, '26'), '26 accepted when answer is /26');
assert(checkAnswer({ answer: '/26' }, '/26'), '/26 accepted when answer is /26');
assert(!checkAnswer({ answer: '26' }, '27'), 'Wrong number rejected');
assert(!checkAnswer({ answer: '26' }, '/27'), 'Wrong /number rejected');
assert(checkAnswer({ answer: '20' }, ' /20 '), 'Trimmed /20 accepted');

// Non-prefix answers should still work normally
assert(checkAnswer({ answer: '192.168.1.0' }, '192.168.1.0'), 'IP answer still works');
assert(!checkAnswer({ answer: '192.168.1.0' }, '192.168.1.1'), 'Wrong IP rejected');
console.log('   /prefix and plain prefix both accepted correctly.');

// ============================================================
// 5. Academy intro tutorial key
// ============================================================
console.log('5. Testing academy intro key...');
// Just verify the import constant exists in the source
import fs from 'node:fs';
const academySrc = fs.readFileSync(new URL('../src/pages/Academy.jsx', import.meta.url), 'utf8');
assert(academySrc.includes('ACADEMY_INTRO_KEY'), 'ACADEMY_INTRO_KEY constant exists');
assert(academySrc.includes('academy-intro-seen'), 'Uses localStorage key');
assert(academySrc.includes('Lernmodus'), 'Tutorial mentions Lernmodus');
assert(academySrc.includes('Lehrgangsmodus'), 'Tutorial mentions Lehrgangsmodus');
assert(academySrc.includes('characterAsset'), 'Sam portrait used');
assert(academySrc.includes('showIntro'), 'showIntro state exists');
assert(academySrc.includes('dismissIntro'), 'dismissIntro function exists');
console.log('   Academy intro tutorial verified in source.');

// ============================================================
// 6. Placeholder detection: hasLessonContent
// ============================================================
console.log('6. Testing hasLessonContent...');
// Topics with real lessons
assert(hasLessonContent('fundamentals', 'topologien'), 'topologien has lesson');
assert(hasLessonContent('fundamentals', 'osi-model'), 'osi-model has lesson');
assert(hasLessonContent('fundamentals', 'tcp-ip-model'), 'tcp-ip-model has lesson');
assert(hasLessonContent('fundamentals', 'ipv4'), 'ipv4 has lesson');
assert(hasLessonContent('fundamentals', 'subnetting'), 'subnetting has lesson');

// Custom mini-lesson (not in LESSONS but not a placeholder)
assert(hasLessonContent('fundamentals', 'grundbegriffe'), 'grundbegriffe has lesson');
// Merged (Milestone C5.3): tcp/udp/tcp-vs-udp -> tcp-udp; the four separate
// "Grundlagen" placeholders -> kommunikation-uebertragung. Both are now full
// LessonRunner lessons registered in LESSONS.
assert(hasLessonContent('fundamentals', 'tcp-udp'), 'tcp-udp has lesson');
assert(hasLessonContent('fundamentals', 'kommunikation-uebertragung'), 'kommunikation-uebertragung has lesson');

// Placeholder topics (no content yet)
// dns/dhcp/routing gained full LessonRunner lessons in the
// "Themenstruktur-Anpassung" milestone (see academy-themenstruktur-test.mjs).
assert(hasLessonContent('fundamentals', 'dns'), 'dns has lesson');
assert(hasLessonContent('fundamentals', 'dhcp'), 'dhcp has lesson');
assert(hasLessonContent('fundamentals', 'routing'), 'routing has lesson');
// "packet-tracer-ui" was removed from the catalog entirely (Milestone:
// Cisco-Struktur bereinigen); "acl" now has lesson content.
assert(hasLessonContent('cisco-packet-tracer', 'acl'), 'acl has lesson');
assert(hasLessonContent('cisco-packet-tracer', 'grundlagen'), 'cisco grundlagen has lesson');

// AcademyCategory source should use hasLessonContent
const categorySrc = fs.readFileSync(new URL('../src/pages/AcademyCategory.jsx', import.meta.url), 'utf8');
assert(categorySrc.includes('hasLessonContent'), 'AcademyCategory uses hasLessonContent');
assert(categorySrc.includes('isPlaceholder'), 'isPlaceholder variable exists');
assert(categorySrc.includes('Noch nicht verfügbar'), 'Shows placeholder badge');
assert(categorySrc.includes('in Entwicklung'), 'Shows development message');
console.log('   Placeholder detection works correctly.');

// ============================================================
// 7. Subnet mask exercises accept /prefix
// ============================================================
console.log('7. Testing subnet mask prefix exercises...');
const maskExercises = subnetMasksLesson.exercises;
const prefixExercise = maskExercises.find(e => e.id === 'subnet-mask-to-prefix');
assert(prefixExercise, 'Mask-to-prefix exercise exists');
// The answers array contains '26'
assert(prefixExercise.answers.includes('26'), 'Answer is 26');
console.log('   Subnet mask prefix exercises verified.');

console.log('\n=== All Milestone C5.1 Tests PASSED ===');
