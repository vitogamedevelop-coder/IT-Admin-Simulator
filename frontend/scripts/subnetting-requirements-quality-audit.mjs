import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import {
  subnetBitsForCount, prefixForSubnetCount, hostBitsForRequirement, prefixForHostRequirement,
  generateFixedSubnetSequence, generateSubnetRequirementProblem, calculateUsableHosts, calculateJumpSize,
} from '../src/lib/networking/ipv4Math.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const topicKey = 'fundamentals/subnetting';
const lesson = LESSONS[topicKey];
assert(lesson, 'Subnetting-Lektion ist registriert');
const serialized = JSON.stringify(lesson);
for (const term of ['Hostbits', 'Netzbits', '2^n', '2^h − 2', 'Sprungweite', 'Fixed-Length', 'VLSM', 'erzeugt keine neuen IPv4-Adressen']) {
  assert(serialized.includes(term), `Lektion enthält ${term}`);
}
assert(!/\b(?:im|laut|für den) Lehrgang\b/i.test(serialized), 'kein sichtbarer Lehrgang-Metatext');
for (const sectionId of ['subnetting-concept-classic', 'requirements-classic', 'subnet-count-classic', 'host-count-classic', 'flsm-blocks-classic']) {
  assert(lesson.explanations.some((entry) => entry.id === sectionId), `${sectionId} ist vorhanden`);
}
for (const exerciseId of ['guided-subnetting', 'adaptive-subnetting', 'subnetting-requirements-trainer', 'subnetting-difficulty-drill']) {
  assert(lesson.exercises.some((exercise) => exercise.id === exerciseId), `${exerciseId} ist vorhanden`);
}
assert.equal(new Set(lesson.exercises.map((exercise) => exercise.id)).size, lesson.exercises.length, 'keine Duplicate Exercise IDs');

assert.equal(subnetBitsForCount(6), 3, 'sechs Subnetze benötigen drei Bits');
assert.equal(prefixForSubnetCount(23, 6), 26, '/23 mit sechs Subnetzen wird /26');
assert.equal(hostBitsForRequirement(15), 5, '15 Hosts benötigen fünf Hostbits');
assert.equal(prefixForHostRequirement(25, 15), 27, '15 Hosts ergeben /27');
assert.throws(() => prefixForSubnetCount(29, 8), /does not fit/, 'unmögliche Subnetzanforderung wird abgelehnt');
assert.throws(() => prefixForHostRequirement(27, 100), /does not fit/, 'unmöglicher Hostbedarf wird abgelehnt');
const canonical = generateFixedSubnetSequence('192.168.2.0', 23, 26);
assert.equal(canonical.length, 8, '/23 enthält acht /26-Netze');
assert.deepEqual(canonical.slice(0, 6).map((entry) => `${entry.network}/${entry.prefix}`), [
  '192.168.2.0/26', '192.168.2.64/26', '192.168.2.128/26', '192.168.2.192/26', '192.168.3.0/26', '192.168.3.64/26',
], 'Netzfolge überschreitet die Oktettgrenze korrekt');

let state = 987654;
const random = () => ((state = (state * 16807) % 2147483647) - 1) / 2147483646;
for (const difficulty of ['easy', 'medium', 'hard']) {
  for (let index = 0; index < 500; index += 1) {
    const problem = generateSubnetRequirementProblem(difficulty, random);
    assert(problem.newPrefix >= problem.basePrefix && problem.newPrefix <= 30, `${difficulty}: gültiges Präfix`);
    assert(problem.sequence.length > 0, `${difficulty}: mindestens ein Subnetz`);
    assert.equal(problem.jumpSize, calculateJumpSize(problem.newPrefix), `${difficulty}: Sprungweite`);
    if (problem.mode === 'subnets') {
      assert(problem.possibleSubnets >= problem.requiredSubnets, `${difficulty}: genügend Subnetze`);
      assert(problem.possibleSubnets / 2 < problem.requiredSubnets, `${difficulty}: minimale Bitanzahl`);
    } else {
      assert(calculateUsableHosts(problem.newPrefix) >= problem.requiredHosts, `${difficulty}: genügend Hosts`);
      assert(problem.newPrefix === 30 || calculateUsableHosts(problem.newPrefix + 1) < problem.requiredHosts, `${difficulty}: kleinster ausreichender Block`);
    }
  }
}

const allItems = getAllKnowledgeItems();
assert.equal(new Set(allItems.map((item) => item.id)).size, allItems.length, 'keine Duplicate Knowledge IDs');
for (const id of ['subnetting.definition', 'subnetting.requirementTypes', 'subnetting.borrowBits', 'subnetting.sixSubnetsMisconception', 'subnetting.fifteenHostsMisconception']) {
  assert(allItems.some((item) => item.id === id), `${id} ist registriert`);
  for (let seed = 0; seed < 10; seed += 1) {
    const question = generateQuestion(id, null, { contextType: 'coworker_question', seed: String(seed) });
    assert(question && question.conversationText, `${id} erzeugt Mitarbeiterfrage`);
    assert.deepEqual(validateQuestionInstance(question), [], `${id} Seed ${seed} ist valide`);
  }
}

const optimizedTopics = [
  'fundamentals/grundbegriffe', 'fundamentals/topologien', 'fundamentals/kommunikation-uebertragung',
  'fundamentals/osi-model', 'fundamentals/binary-system', 'fundamentals/ipv4', 'fundamentals/subnetting',
];
for (const key of optimizedTopics) {
  assert(CONVERSATION_TOPICS[key], `${key} besitzt Conversation-Registry-Eintrag`);
  assert(allItems.some((item) => item.topicKey === key), `${key} besitzt automatisch nutzbare Knowledge Items`);
}
console.log(`subnetting-requirements-quality-audit: PASS (1500 generated requirements, ${lesson.exercises.length} exercises, ${allItems.filter((item) => item.topicKey === topicKey).length} subnetting knowledge items)`);
