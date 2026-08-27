import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import {
  areNetworksAdjacent, canAggregateExactly, findMinimalSupernet, aggregateWithoutExpansion,
  aggregateWithExpansion, calculateNetworkId, calculateBroadcast,
} from '../src/lib/networking/ipv4Math.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const topicKey = 'fundamentals/supernetting';
const lesson = LESSONS[topicKey];
assert(lesson, 'Supernetting-Lektion ist registriert');
const serialized = JSON.stringify(lesson);
for (const term of ['Subnetting', 'Supernetting', 'Nachbarschaft', 'Alignment', 'Adressraumerweiterung', 'gemischte Präfixe', 'Route Summarization', '0.0.0.0/0']) {
  assert(serialized.toLocaleLowerCase('de-DE').includes(term.toLocaleLowerCase('de-DE')), `Lektion enthält ${term}`);
}
assert(!/\b(?:im|laut|für den) Lehrgang\b/i.test(serialized), 'kein sichtbarer Lehrgang-Metatext');
for (const sectionId of ['supernetting-concept-classic', 'supernetting-validity-classic', 'supernetting-expansion-classic', 'supernetting-mixed-classic', 'supernetting-method']) {
  assert(lesson.explanations.some((entry) => entry.id === sectionId), `${sectionId} ist vorhanden`);
}
for (const exerciseId of ['supernetting-prefix', 'supernetting-network', 'supernetting-without-expansion', 'supernetting-alignment-check', 'supernetting-with-expansion', 'supernetting-adaptive-trainer']) {
  assert(lesson.exercises.some((exercise) => exercise.id === exerciseId), `${exerciseId} ist vorhanden`);
}
assert.equal(new Set(lesson.exercises.map((exercise) => exercise.id)).size, lesson.exercises.length, 'keine Duplicate Exercise IDs');

assert(areNetworksAdjacent('192.168.0.0/26', '192.168.0.64/26'), 'direkte Nachbarschaft erkannt');
assert(!areNetworksAdjacent('192.168.0.64/26', '192.168.0.192/26'), 'Lücke erkannt');
assert(canAggregateExactly(['192.168.0.0/26', '192.168.0.64/26']).exact, 'ausgerichtetes Paar exakt aggregierbar');
assert(!canAggregateExactly(['192.168.0.64/26', '192.168.0.128/26']).exact, 'benachbartes, aber falsch ausgerichtetes Paar nicht exakt aggregierbar');
assert.deepEqual(aggregateWithoutExpansion(['128.192.25.0/28', '128.192.25.16/29', '128.192.25.24/29']), ['128.192.25.0/27'], 'gemischte Präfixe schrittweise aggregiert');
assert.deepEqual(aggregateWithoutExpansion(['192.168.0.0/26', '192.168.0.64/26', '192.168.0.192/26']), ['192.168.0.0/25', '192.168.0.192/26'], 'Lücke bleibt ohne Erweiterung separat');
const expansion = aggregateWithExpansion(['220.78.168.0/28', '220.78.168.16/28', '220.78.168.48/28']);
assert.equal(expansion.network, '220.78.168.0/26', 'kleinste Summary mit Erweiterung');
assert.equal(expansion.addedAddresses, 16, 'nur fehlender /28-Block wird zusätzlich eingeschlossen');

let state = 24681357;
const random = () => ((state = (state * 16807) % 2147483647) - 1) / 2147483646;
for (let index = 0; index < 1000; index += 1) {
  const prefix = 18 + Math.floor(random() * 11);
  const parentPrefix = prefix - 1;
  const parentBase = `10.${Math.floor(random() * 128) * 2}.0.0`;
  const parentNetwork = calculateNetworkId(parentBase, parentPrefix);
  const parentBroadcast = calculateBroadcast(parentNetwork, parentPrefix);
  const parentStart = parentNetwork.split('.').map(Number);
  const total = 2 ** (32 - parentPrefix);
  const half = total / 2;
  const startLong = parentStart.reduce((sum, octet) => sum * 256 + octet, 0);
  const toIp = (value) => [24, 16, 8, 0].map((shift) => Math.floor(value / 2 ** shift) % 256).join('.');
  const children = [`${parentNetwork}/${prefix}`, `${toIp(startLong + half)}/${prefix}`];
  const result = findMinimalSupernet(children);
  assert.equal(`${result.superNetwork}/${result.superPrefix}`, `${parentNetwork}/${parentPrefix}`, `zufälliges Geschwisterpaar ${index}`);
  assert.equal(result.summaryBroadcast, parentBroadcast, `Broadcast des Elternblocks ${index}`);
  assert(canAggregateExactly(children).exact, `exakte Aggregation ${index}`);
}

const allItems = getAllKnowledgeItems();
assert.equal(new Set(allItems.map((item) => item.id)).size, allItems.length, 'keine Duplicate Knowledge IDs');
for (const id of ['nb.supernetting.definition', 'nb.supernetting.rule', 'nb.supernetting.direction', 'nb.supernetting.alignment', 'nb.supernetting.expansion', 'nb.supernetting.partialResult', 'nb.supernetting.mixedPrefixes']) {
  assert(allItems.some((item) => item.id === id), `${id} ist registriert`);
  for (let seed = 0; seed < 10; seed += 1) {
    const question = generateQuestion(id, null, { contextType: 'coworker_question', seed: String(seed) });
    assert(question?.conversationText, `${id} erzeugt Mitarbeiterfrage`);
    assert.deepEqual(validateQuestionInstance(question), [], `${id} Seed ${seed} ist valide`);
  }
}
assert(CONVERSATION_TOPICS[topicKey], 'Supernetting ist in CONVERSATION_TOPICS registriert');
assert(CONVERSATION_TOPICS[topicKey].questions.length >= 4, 'statische Transferfragen sind vorhanden');
console.log(`supernetting-quality-audit: PASS (1000 random sibling pairs, ${lesson.exercises.length} exercises, ${allItems.filter((item) => item.topicKey === topicKey).length} knowledge items)`);
