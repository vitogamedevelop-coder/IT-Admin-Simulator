import { buildSubnettingLesson } from '../src/lib/academyLessons/subnetting.js';
import {
  calculateNetworkId,
  calculateBroadcast,
  calculateFirstHost,
  calculateLastHost,
  calculateUsableHosts,
  calculateTotalAddresses,
} from '../src/lib/networking/ipv4Math.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function assertTrue(condition, message) {
  if (!condition) throw new Error(message);
}

console.log('=== Select-Best Subnetting Regression Test ===\n');

const lesson = buildSubnettingLesson();

// ---------------------------------------------------------------------------
// 1. /21 find-error exercise: selecting "letzter Host" must be correct.
// ---------------------------------------------------------------------------
const findError21 = lesson.exercises.find((ex) => ex.id === 'find-error-2');
assertTrue(!!findError21, 'find-error-2 exercise must exist');
assertEqual(findError21.type, 'select-best', 'find-error-2 must be a select-best exercise');

console.log('/21 question:\n', findError21.question);
console.log('/21 options:', findError21.options);
console.log('/21 correct index:', findError21.correct);
console.log('/21 correct label:', findError21.options[findError21.correct]);

assertEqual(findError21.options[findError21.correct], 'letzter Host', 'Correct answer for /21 find-error must be "letzter Host"');

const network21 = calculateNetworkId('10.25.140.18', 21);
const broadcast21 = calculateBroadcast('10.25.140.18', 21);
const firstHost21 = calculateFirstHost('10.25.140.18', 21);
const lastHost21 = calculateLastHost('10.25.140.18', 21);
const usable21 = calculateUsableHosts(21);
const total21 = calculateTotalAddresses(21);

assertEqual(network21, '10.25.136.0', 'Network ID for 10.25.140.18/21');
assertEqual(broadcast21, '10.25.143.255', 'Broadcast for 10.25.140.18/21');
assertEqual(firstHost21, '10.25.136.1', 'First host for 10.25.140.18/21');
assertEqual(lastHost21, '10.25.143.254', 'Last host for 10.25.140.18/21');
assertEqual(usable21, 2046, 'Usable hosts for /21');
assertEqual(total21, 2048, 'Total addresses for /21');

// The profile in the question must show the wrong "letzter Host" value.
assertTrue(findError21.question.includes(firstHost21), 'Question must display the deliberately wrong last-host value');
assertTrue(!findError21.question.includes(lastHost21), 'Question must NOT display the correct last-host value');

// ---------------------------------------------------------------------------
// 2. /18 reference case: a wrong answer with 63 in the third octet must be rejected.
// ---------------------------------------------------------------------------
console.log('\n=== /18 reference check ===');
const broadcast18 = calculateBroadcast('172.16.200.10', 18);
const network18 = calculateNetworkId('172.16.200.10', 18);
console.log(`172.16.200.10/18 -> network ${network18}, broadcast ${broadcast18}`);

assertEqual(network18, '172.16.192.0', 'Network ID for 172.16.200.10/18');
assertEqual(broadcast18, '172.16.255.255', 'Broadcast for 172.16.200.10/18');
assertTrue(!broadcast18.includes('63'), 'Broadcast must not contain 63 in the third octet');

// Verify that the mixed broadcast input exercise for 172.16.200.10/18 expects the correct broadcast.
const broadcastMixed0 = lesson.exercises.find((ex) => ex.id === 'broadcast-mixed-0');
assertTrue(!!broadcastMixed0, 'broadcast-mixed-0 exercise must exist');
assertEqual(broadcastMixed0.type, 'input', 'broadcast-mixed-0 must be an input exercise');
assertEqual(broadcastMixed0.answers[0], broadcast18, 'broadcast-mixed-0 answer must be the correct /18 broadcast');
assertTrue(!broadcastMixed0.answers.includes('172.16.63.255'), 'broadcast-mixed-0 must not accept the wrong 63-octet answer');

// ---------------------------------------------------------------------------
// 3. Simulated SelectBestExercise evaluation: selecting the correct index yields true.
// ---------------------------------------------------------------------------
function evaluateSelectBest(exercise, selectedIndex) {
  return selectedIndex === exercise.correct;
}

assertTrue(
  evaluateSelectBest(findError21, findError21.correct),
  'Selecting the correct "letzter Host" index must evaluate to true',
);
assertTrue(
  !evaluateSelectBest(findError21, 0),
  'Selecting "Netz-ID" for the /21 question must evaluate to false',
);

console.log('\n=== Select-Best Subnetting Regression Test PASSED ===');
