import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';
import {
  hostsToPrefix,
  prefixToHosts,
  calculateVlsmAllocations,
  generateVlsmProblem,
  calculateSupernet,
  generateSupernetProblem,
} from '../src/lib/networking/ipv4Math.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

// ============================================================
// VLSM math tests
// ============================================================
console.log('Testing VLSM math...');

assertEqual(hostsToPrefix(60), 26, '60 hosts needs /26');
assertEqual(hostsToPrefix(5), 29, '5 hosts needs /29');
assertEqual(prefixToHosts(26), 62, '/26 has 62 usable hosts');
assertEqual(prefixToHosts(29), 6, '/29 has 6 usable hosts');

const vlsm = calculateVlsmAllocations('192.168.0.0', 24, [60, 28, 12, 5]);
assertEqual(vlsm.length, 4, 'all requested subnets returned');
const largest = vlsm.find((a) => a.requiredHosts === 60);
assertEqual(largest.network, '192.168.0.0', 'largest subnet starts at base');
assertEqual(largest.prefix, 26, 'largest subnet is /26');
// Sum of block sizes must fit inside /24.
const totalUsed = vlsm.reduce((sum, a) => sum + a.totalAddresses, 0);
assert(totalUsed <= 256, 'allocated blocks fit in /24');

// Generated problem must be internally consistent.
const gen = generateVlsmProblem();
const genAlloc = calculateVlsmAllocations(gen.baseNetwork, gen.basePrefix, gen.requiredHosts);
assertEqual(genAlloc.length, gen.requiredHosts.length, 'generated VLSM problem solvable');

// ============================================================
// Supernetting math tests
// ============================================================
console.log('Testing Supernetting math...');

const supernet = calculateSupernet(['192.168.0.0/24', '192.168.1.0/24', '192.168.2.0/24', '192.168.3.0/24']);
assertEqual(supernet.superNetwork, '192.168.0.0', 'four /24 networks summarize to 192.168.0.0');
assertEqual(supernet.superPrefix, 22, 'four consecutive /24 networks summarize to /22');

const gen2 = generateSupernetProblem();
assert(gen2.networks.length >= 2, 'generated supernet problem has networks');
assertEqual(gen2.superNetwork, calculateSupernet(gen2.networks).superNetwork, 'generated problem consistent');

// ============================================================
// Lesson data tests
// ============================================================
console.log('Testing lesson data...');

const vlsmLesson = LESSONS[topicKey('fundamentals', 'vlsm')];
assert(vlsmLesson, 'VLSM lesson exists');
assert(vlsmLesson.title === 'VLSM', 'VLSM title');
assert(vlsmLesson.explanations.length > 0, 'VLSM explanations exist');
assert(vlsmLesson.exercises.length > 0, 'VLSM exercises exist');
assert(vlsmLesson.quiz.length > 0, 'VLSM quiz exists');

const supernettingLesson = LESSONS[topicKey('fundamentals', 'supernetting')];
assert(supernettingLesson, 'Supernetting lesson exists');
assert(supernettingLesson.title === 'Supernetting', 'Supernetting title');
assert(supernettingLesson.explanations.length > 0, 'Supernetting explanations exist');
assert(supernettingLesson.exercises.length > 0, 'Supernetting exercises exist');
assert(supernettingLesson.quiz.length > 0, 'Supernetting quiz exists');

console.log('All Milestone C4 tests passed.');
