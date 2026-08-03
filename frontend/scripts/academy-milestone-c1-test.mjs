import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';
import { readAcademyProgress } from '../src/lib/academyProgress.js';
import {
  applyMentorLesson,
  recordLessonCompletion, recordSectionCompletion,
  recordQuestionAnswer, recordExerciseCompletion,
  markTopicLearned,
} from '../src/lib/academyEngine.js';

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

function reset() {
  store.clear();
}

function topicId(id) {
  return topicKey('fundamentals', id);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

// ============================================================
// Lesson data structure tests
// ============================================================
console.log('Testing lesson data structure...');

const osi = LESSONS[topicId('osi-model')];
assert(osi, 'OSI lesson should exist');
assertEqual(osi.title, 'OSI-Modell', 'OSI title');

const tcpip = LESSONS[topicId('tcp-ip-model')];
assert(tcpip, 'TCP/IP lesson should exist');
assertEqual(tcpip.title, 'TCP/IP-Modell', 'TCP/IP title');

// OSI has exactly seven distinct layer sections with classic/intuitive styles.
const osiLayerIds = [];
for (let i = 1; i <= 7; i += 1) {
  const classic = osi.explanations.find((e) => e.id === `layer${i}-classic`);
  const intuitive = osi.explanations.find((e) => e.id === `layer${i}-intuitive`);
  assert(classic, `OSI layer ${i} classic should exist`);
  assert(intuitive, `OSI layer ${i} intuitive should exist`);
  assert(classic.title.includes(String(i)), `OSI layer ${i} title should contain number`);
  osiLayerIds.push(`l${i}`);
}

// OSI ordering exercise uses exactly the seven layers in correct order.
const osiOrder = osi.exercises.find((e) => e.id === 'osi-ordering');
assert(osiOrder, 'OSI ordering exercise should exist');
assertEqual(osiOrder.items.length, 7, 'OSI ordering items count');
assertEqual(osiOrder.correctOrder.length, 7, 'OSI ordering correct order count');
assert.deepStrictEqual(osiOrder.correctOrder, osiLayerIds, 'OSI ordering is 1..7');

// TCP/IP has exactly four layer sections.
const tcpipLayerIds = [];
for (let i = 1; i <= 4; i += 1) {
  const classic = tcpip.explanations.find((e) => e.id === `layer${i}-classic`);
  const intuitive = tcpip.explanations.find((e) => e.id === `layer${i}-intuitive`);
  assert(classic, `TCP/IP layer ${i} classic should exist`);
  assert(intuitive, `TCP/IP layer ${i} intuitive should exist`);
  tcpipLayerIds.push(`l${i}`);
}

const tcpipOrder = tcpip.exercises.find((e) => e.id === 'tcpip-ordering');
assert(tcpipOrder, 'TCP/IP ordering exercise should exist');
assertEqual(tcpipOrder.correctOrder.length, 4, 'TCP/IP ordering count');
assert.deepStrictEqual(tcpipOrder.correctOrder, ['l4', 'l3', 'l2', 'l1'], 'TCP/IP ordering top-down');

// OSI/TCP mapping exercise sanity.
const mapping = tcpip.exercises.find((e) => e.id === 'tcpip-osi-mapping');
assert(mapping, 'TCP/IP OSI mapping exercise should exist');
const internetPair = mapping.pairs.find((p) => p.left === 'Internet');
assert(internetPair, 'TCP/IP Internet mapping should exist');
assert(internetPair.right.includes('3'), 'Internet maps to OSI 3');

// ============================================================
// Progress engine tests
// ============================================================
console.log('Testing progress engine...');

reset();

const osiKey = topicId('osi-model');
const tcpIpKey = topicId('tcp-ip-model');

// Locked topic must not award points. tcp-ip-model has osi-model as prerequisite,
// so it starts locked in a fresh progress store.
let before = readAcademyProgress().topics[tcpIpKey];
assertEqual(before.status, 'locked', 'TCP/IP topic starts locked');
let afterOpen = applyMentorLesson('fundamentals', 'tcp-ip-model');
assertEqual(afterOpen.theoryScore, before.theoryScore, 'Opening locked topic gives no theory points');
assertEqual(afterOpen.status, 'locked', 'Locked topic stays locked after open attempt');

let afterCompletion = recordLessonCompletion('fundamentals', 'tcp-ip-model', 'classic');
assert.equal(afterCompletion, null, 'recordLessonCompletion on locked topic returns null');

let afterQuestion = recordQuestionAnswer('fundamentals', 'tcp-ip-model', 'q-1', 'theory');
assert.equal(afterQuestion, null, 'recordQuestionAnswer on locked topic returns null');

let afterExercise = recordExerciseCompletion('fundamentals', 'tcp-ip-model', 'ex-1');
assert.equal(afterExercise, null, 'recordExerciseCompletion on locked topic returns null');

// Unlock OSI topic for the remaining tests.
markTopicLearned('fundamentals', 'osi-model');
let learned = readAcademyProgress().topics[osiKey];
assertEqual(learned.status, 'learned', 'markTopicLearned promotes to learned');

// Real activity awards points exactly once.
const firstQuestion = recordQuestionAnswer('fundamentals', 'osi-model', 'q-layer1-classic', 'theory');
assert(firstQuestion, 'recordQuestionAnswer should return progress');
const scoreAfterFirst = firstQuestion.theoryScore;
assert(scoreAfterFirst > 0, 'First answer increases theory score');
assert(firstQuestion.completedQuestionIds.includes('q-layer1-classic'), 'Question id recorded');

const secondQuestion = recordQuestionAnswer('fundamentals', 'osi-model', 'q-layer1-classic', 'theory');
assertEqual(secondQuestion.theoryScore, scoreAfterFirst, 'Repeated answer does not increase score');
assertEqual(secondQuestion.completedQuestionIds.length, 1, 'Question id not duplicated');

// Exercise completion awards practice points exactly once.
const firstExercise = recordExerciseCompletion('fundamentals', 'osi-model', 'ex-osi-ordering');
assert(firstExercise, 'recordExerciseCompletion should return progress');
const practiceAfterFirst = firstExercise.practiceScore;
assert(practiceAfterFirst > 0, 'First exercise increases practice score');

const secondExercise = recordExerciseCompletion('fundamentals', 'osi-model', 'ex-osi-ordering');
assertEqual(secondExercise.practiceScore, practiceAfterFirst, 'Repeated exercise does not increase score');
assertEqual(secondExercise.completedExerciseIds.length, 1, 'Exercise id not duplicated');

// Section resume persistence.
const sectionResult = recordSectionCompletion('fundamentals', 'osi-model', 'layer3', 'Vermittlungsschicht');
assert(sectionResult.completedSectionIds.includes('layer3'), 'Section id recorded');
assertEqual(sectionResult.lastCompletedSectionId, 'layer3', 'lastCompletedSectionId stored');
assertEqual(sectionResult.lastCompletedSectionTitle, 'Vermittlungsschicht', 'lastCompletedSectionTitle stored');

// Lesson completion awards theory points only the first time.
const firstCompletion = recordLessonCompletion('fundamentals', 'osi-model', 'classic');
assert(firstCompletion, 'recordLessonCompletion should return progress');
const theoryAfterFirstCompletion = firstCompletion.theoryScore;
assert(theoryAfterFirstCompletion > scoreAfterFirst, 'Lesson completion increases theory score');

const secondCompletion = recordLessonCompletion('fundamentals', 'osi-model', 'classic');
assertEqual(secondCompletion.theoryScore, theoryAfterFirstCompletion, 'Repeated lesson completion does not increase theory score');
assertEqual(secondCompletion.lessonCompletions, 2, 'Lesson completion counter increments');

// ============================================================
// Existing Topologies lesson still intact
// ============================================================
console.log('Testing existing Topologien lesson...');
const topo = LESSONS[topicId('topologien')];
assert(topo, 'Topologien lesson should still exist');
assert(topo.exercises.length > 0, 'Topologien exercises should exist');
assert(topo.quiz.length > 0, 'Topologien quiz should exist');

console.log('All Milestone C1 tests passed.');
