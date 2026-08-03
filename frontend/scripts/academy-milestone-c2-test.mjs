import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';
import { readAcademyProgress } from '../src/lib/academyProgress.js';
import {
  applyMentorLesson, recordLessonCompletion, recordSectionCompletion,
  recordQuestionAnswer, recordExerciseCompletion, markTopicLearned,
} from '../src/lib/academyEngine.js';
import {
  decimalToBinaryOctet, binaryOctetToDecimal, prefixToSubnetMask,
  subnetMaskToPrefix, isValidIpv4Address, getRelevantOctet,
} from '../src/lib/networking/ipv4Math.js';

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

function reset() { store.clear(); }
function topicId(id) { return topicKey('fundamentals', id); }

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

// ============================================================
// IPv4 math helpers
// ============================================================
console.log('Testing IPv4 math helpers...');

assertEqual(decimalToBinaryOctet(0), '00000000', '0 binary');
assertEqual(decimalToBinaryOctet(1), '00000001', '1 binary');
assertEqual(decimalToBinaryOctet(192), '11000000', '192 binary');
assertEqual(decimalToBinaryOctet(255), '11111111', '255 binary');

assertEqual(binaryOctetToDecimal('00000000'), 0, '0 decimal');
assertEqual(binaryOctetToDecimal('11000000'), 192, '192 decimal');
assertEqual(binaryOctetToDecimal('11111111'), 255, '255 decimal');

assertEqual(prefixToSubnetMask(0).decimal, '0.0.0.0', '/0 mask');
assertEqual(prefixToSubnetMask(8).decimal, '255.0.0.0', '/8 mask');
assertEqual(prefixToSubnetMask(12).decimal, '255.240.0.0', '/12 mask');
assertEqual(prefixToSubnetMask(16).decimal, '255.255.0.0', '/16 mask');
assertEqual(prefixToSubnetMask(20).decimal, '255.255.240.0', '/20 mask');
assertEqual(prefixToSubnetMask(24).decimal, '255.255.255.0', '/24 mask');
assertEqual(prefixToSubnetMask(26).decimal, '255.255.255.192', '/26 mask');
assertEqual(prefixToSubnetMask(30).decimal, '255.255.255.252', '/30 mask');
assertEqual(prefixToSubnetMask(32).decimal, '255.255.255.255', '/32 mask');

assertEqual(subnetMaskToPrefix('255.255.255.0'), 24, '/24 prefix');
assertEqual(subnetMaskToPrefix('255.255.255.192'), 26, '/26 prefix');
assertEqual(subnetMaskToPrefix('255.255.240.0'), 20, '/20 prefix');

assert.throws(() => subnetMaskToPrefix('255.0.255.0'), 'non-contiguous mask invalid');
assert.throws(() => subnetMaskToPrefix('255.255.240.128'), 'non-contiguous mask invalid 2');

assert.strictEqual(isValidIpv4Address('192.168.1.10'), true, 'valid IP');
assert.strictEqual(isValidIpv4Address('10.0.0.256'), false, 'octet > 255');
assert.strictEqual(isValidIpv4Address('192.168.-1.5'), false, 'negative octet');
assert.strictEqual(isValidIpv4Address('1.2.3'), false, 'only 3 octets');

assertEqual(getRelevantOctet(8), 0, 'relevant octet /8');
assertEqual(getRelevantOctet(16), 1, 'relevant octet /16');
assertEqual(getRelevantOctet(20), 2, 'relevant octet /20');
assertEqual(getRelevantOctet(26), 3, 'relevant octet /26');

// ============================================================
// Lesson registration
// ============================================================
console.log('Testing lesson registration...');

const binary = LESSONS[topicId('binary-system')];
assert(binary, 'binary-system lesson registered');
assertEqual(binary.title, 'Binärsystem für IPv4', 'binary title');

const ipv4 = LESSONS[topicId('ipv4')];
assert(ipv4, 'ipv4 lesson registered');
assertEqual(ipv4.title, 'IPv4-Grundlagen', 'ipv4 title');

const masks = LESSONS[topicId('subnet-masks')];
assert(masks, 'subnet-masks lesson registered');
assertEqual(masks.title, 'Subnetzmasken', 'subnet-masks title');

assert(LESSONS[topicId('osi-model')], 'OSI lesson still registered');
assert(LESSONS[topicId('tcp-ip-model')], 'TCP/IP lesson still registered');
assert(LESSONS[topicId('topologien')], 'Topologien lesson still registered');

// ============================================================
// Progress engine guards
// ============================================================
console.log('Testing progress engine guards...');

reset();

// binary-system has no prerequisites, so it starts available. Use ipv4 (requires tcp-ip-model)
// to test locked topic scoring.
const lockedKey = topicId('ipv4');
let before = readAcademyProgress().topics[lockedKey];
assertEqual(before.status, 'locked', 'IPv4 topic starts locked');
let afterOpen = applyMentorLesson('fundamentals', 'ipv4');
assertEqual(afterOpen.theoryScore, before.theoryScore, 'Locked topic gives no theory points');
assertEqual(afterOpen.status, 'locked', 'Locked topic stays locked');

assert.equal(recordLessonCompletion('fundamentals', 'ipv4', 'classic'), null, 'Lesson completion locked');
assert.equal(recordQuestionAnswer('fundamentals', 'ipv4', 'q-1', 'theory'), null, 'Question locked');
assert.equal(recordExerciseCompletion('fundamentals', 'ipv4', 'ex-1'), null, 'Exercise locked');

// Unlock binary-system for real activity test.
markTopicLearned('fundamentals', 'binary-system');
const firstQuestion = recordQuestionAnswer('fundamentals', 'binary-system', 'q-bits', 'theory');
assert(firstQuestion, 'Question answered');
const scoreAfterFirst = firstQuestion.theoryScore;
assert(scoreAfterFirst > 0, 'First answer gives theory points');

const secondQuestion = recordQuestionAnswer('fundamentals', 'binary-system', 'q-bits', 'theory');
assertEqual(secondQuestion.theoryScore, scoreAfterFirst, 'Repeated answer no extra points');
assertEqual(secondQuestion.completedQuestionIds.length, 1, 'Question id not duplicated');

const firstExercise = recordExerciseCompletion('fundamentals', 'binary-system', 'ex-decimal');
assert(firstExercise, 'Exercise completed');
const practiceAfterFirst = firstExercise.practiceScore;
assert(practiceAfterFirst > 0, 'First exercise gives practice points');

const secondExercise = recordExerciseCompletion('fundamentals', 'binary-system', 'ex-decimal');
assertEqual(secondExercise.practiceScore, practiceAfterFirst, 'Repeated exercise no extra points');

const sectionResult = recordSectionCompletion('fundamentals', 'binary-system', 'conversion', 'Umrechnen');
assert(sectionResult.completedSectionIds.includes('conversion'), 'Section recorded');
assertEqual(sectionResult.lastCompletedSectionId, 'conversion', 'last section stored');
assertEqual(sectionResult.lastCompletedSectionTitle, 'Umrechnen', 'last section title stored');

// ============================================================
// Existing C1 tests should still pass
// ============================================================
console.log('Testing existing C1 lessons...');
assert(LESSONS[topicId('osi-model')].exercises.length > 0, 'OSI exercises exist');
assert(LESSONS[topicId('tcp-ip-model')].exercises.length > 0, 'TCP/IP exercises exist');

console.log('All Milestone C2 tests passed.');
