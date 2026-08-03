import assert from 'node:assert/strict';
import {
  prefixToSubnetMask,
  calculateNetworkId,
  calculateBroadcast,
  calculateFirstHost,
  calculateLastHost,
  calculateTotalAddresses,
  calculateUsableHosts,
  calculateJumpSize,
  getRelevantOctet,
  getSubnetBlockBounds,
  generateSubnetProblem,
} from '../src/lib/networking/ipv4Math.js';
import { buildSubnettingLesson, SUBNETTING_TOPIC_KEY } from '../src/lib/academyLessons/subnetting.js';
import { LESSONS } from '../src/lib/academyLessonData.js';

function assertApprox(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function assertValidProblem(p, message) {
  const fields = ['ip', 'prefix', 'network', 'broadcast', 'firstHost', 'lastHost', 'total', 'usable', 'jump', 'relevantOctet'];
  for (const f of fields) {
    if (p[f] === undefined) throw new Error(`${message}: missing field ${f}`);
  }
}

console.log('Testing subnetting math functions...');

// Canonical classic example
assertApprox(calculateNetworkId('192.168.1.50', 26), '192.168.1.0', 'Classic network ID');
assertApprox(calculateBroadcast('192.168.1.50', 26), '192.168.1.63', 'Classic broadcast');
assertApprox(calculateFirstHost('192.168.1.50', 26), '192.168.1.1', 'Classic first host');
assertApprox(calculateLastHost('192.168.1.50', 26), '192.168.1.62', 'Classic last host');
assertApprox(calculateTotalAddresses(26), 64, 'Classic total addresses');
assertApprox(calculateUsableHosts(26), 62, 'Classic usable hosts');
assertApprox(prefixToSubnetMask(26).decimal, '255.255.255.192', 'Classic subnet mask');
assertApprox(calculateJumpSize(26), 64, 'Classic jump size');

// Intuitive examples
assertApprox(calculateNetworkId('192.168.199.3', 20), '192.168.192.0', 'Intuitive 1 network');
assertApprox(calculateBroadcast('192.168.199.3', 20), '192.168.207.255', 'Intuitive 1 broadcast');
assertApprox(calculateNetworkId('10.25.140.18', 21), '10.25.136.0', 'Intuitive 2 network');
assertApprox(calculateBroadcast('10.25.140.18', 21), '10.25.143.255', 'Intuitive 2 broadcast');

// Extra test cases from prompt
assertApprox(calculateNetworkId('172.16.200.10', 18), '172.16.192.0', '172.16.200.10/18 network');
assertApprox(calculateBroadcast('172.16.200.10', 18), '172.16.255.255', '172.16.200.10/18 broadcast');
assertApprox(calculateNetworkId('192.168.1.130', 27), '192.168.1.128', '192.168.1.130/27 network');
assertApprox(calculateBroadcast('192.168.1.130', 27), '192.168.1.159', '192.168.1.130/27 broadcast');
assertApprox(calculateNetworkId('10.0.0.1', 8), '10.0.0.0', '10.0.0.1/8 network');
assertApprox(calculateBroadcast('10.0.0.1', 8), '10.255.255.255', '10.0.0.1/8 broadcast');

// Relevant octets
assertApprox(getRelevantOctet(26), 3, '/26 relevant octet index 3');
assertApprox(getRelevantOctet(20), 2, '/20 relevant octet index 2');
assertApprox(getRelevantOctet(21), 2, '/21 relevant octet index 2');
assertApprox(getRelevantOctet(18), 2, '/18 relevant octet index 2 (third octet)');
assertApprox(getRelevantOctet(8), 0, '/8 relevant octet index 0');

// Block bounds
const bounds = getSubnetBlockBounds('192.168.1.50', 26);
assertApprox(bounds.lower, 0, 'Classic block lower');
assertApprox(bounds.upper, 63, 'Classic block upper');
assertApprox(bounds.network, '192.168.1.0', 'Block bounds network');
assertApprox(bounds.broadcast, '192.168.1.63', 'Block bounds broadcast');

// Special /31 and /32
assertApprox(calculateTotalAddresses(31), 2, '/31 total');
assertApprox(calculateUsableHosts(31), 0, '/31 usable hosts (traditional)');
assertApprox(calculateTotalAddresses(32), 1, '/32 total');
assertApprox(calculateUsableHosts(32), 0, '/32 usable hosts');

console.log('Testing lesson data...');
const lesson = buildSubnettingLesson();
assert(lesson.title === 'Subnetting', 'Lesson title');
assert(lesson.explanations.length >= 5, 'Has explanations');
assert(lesson.exercises.length >= 5, 'Has exercises');
assert(lesson.quiz.length >= 3, 'Has quiz');
assert(lesson.summary.length >= 4, 'Has summary');

const styles = new Set(lesson.explanations.map((ex) => ex.style));
assert(styles.has('classic'), 'Classic style exists');
assert(styles.has('intuitive'), 'Intuitive style exists');

const hasInput = lesson.exercises.some((ex) => ex.type === 'input');
const hasSelect = lesson.exercises.some((ex) => ex.type === 'select-best');
const hasGuided = lesson.exercises.some((ex) => ex.type === 'guided-subnetting');
const hasAdaptive = lesson.exercises.some((ex) => ex.type === 'adaptive-subnetting');
assert(hasInput, 'Has input exercises');
assert(hasSelect, 'Has select-best exercises');
assert(hasGuided, 'Has guided exercise');
assert(hasAdaptive, 'Has adaptive exercise');

console.log('Testing lesson registration...');
assert(LESSONS[SUBNETTING_TOPIC_KEY], 'Subnetting lesson registered');

console.log('Testing generator...');
for (let i = 0; i < 10; i += 1) {
  const p = generateSubnetProblem({ prefixMin: 16, prefixMax: 30 });
  assertValidProblem(p, `Generated problem ${i}`);
  assertApprox(p.network, calculateNetworkId(p.ip, p.prefix), 'Generated network matches');
  assertApprox(p.broadcast, calculateBroadcast(p.ip, p.prefix), 'Generated broadcast matches');
}

console.log('All Milestone C3 tests passed.');
