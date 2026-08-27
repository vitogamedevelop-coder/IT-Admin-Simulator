import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const topicKey = 'fundamentals/dns';
const lesson = LESSONS[topicKey];
assert(lesson, 'DNS-Lektion ist registriert');
const serialized = JSON.stringify(lesson);
for (const term of [
  'Domain Name System', 'Domain', 'Zone', 'FQDN', 'Root', 'A bis M', 'Top-Level-Domain',
  'Forward Lookup', 'Reverse Lookup', 'Primäre Zone', 'Sekundäre Zone', 'AD-integrierte Zone', 'Stubzone',
  'AAAA', 'CNAME', 'MX', 'PTR', 'SRV', 'SOA', 'NS', 'Port 53', 'UDP', 'TCP',
  'rekursiv', 'iterativ', 'Cache', 'TTL', 'autoritativ', 'Conditional Forwarder', 'General Forwarder', 'Delegierung',
]) assert(serialized.toLocaleLowerCase('de-DE').includes(term.toLocaleLowerCase('de-DE')), `Lektion enthält ${term}`);
assert(!/weltweit nur 13 physische Root-Server/i.test(serialized), 'Root-Server werden nicht als nur 13 physische Server dargestellt');
assert(!/DNS (?:läuft|verwendet) (?:immer|ausschließlich) (?:über )?UDP/i.test(serialized), 'DNS-Transport wird nicht absolut dargestellt');
assert(!/\b(?:im|laut|für den) Lehrgang\b/i.test(serialized), 'kein sichtbarer Lehrgang-Metatext');
for (const sectionId of ['was-classic', 'aufbau-classic', 'ablauf-classic', 'query-types-classic', 'authority-forwarding-classic', 'records-classic', 'zonen-classic', 'praxis-fehler-classic']) {
  assert(lesson.explanations.some((entry) => entry.id === sectionId), `${sectionId} ist vorhanden`);
}
for (const sectionId of ['aufbau-classic', 'ablauf-classic']) {
  assert(lesson.explanations.find((entry) => entry.id === sectionId).blocks.some((block) => block.type === 'diagram'), `${sectionId} ist visualisiert`);
}
for (const exerciseId of ['dns-query-ordering', 'dns-record-matching', 'dns-zone-matching', 'dns-fqdn-matching', 'dns-query-types', 'dns-forwarding-delegation', 'dns-ip-works-name-fails']) {
  assert(lesson.exercises.some((exercise) => exercise.id === exerciseId), `${exerciseId} ist vorhanden`);
}
assert.equal(new Set(lesson.exercises.map((exercise) => exercise.id)).size, lesson.exercises.length, 'keine Duplicate Exercise IDs');
const recordExercise = lesson.exercises.find((exercise) => exercise.id === 'dns-record-matching');
assert.deepEqual(new Set(recordExercise.pairs.map((pair) => pair.left)), new Set(['A', 'AAAA', 'PTR', 'CNAME', 'MX', 'SRV', 'SOA', 'NS']), 'alle acht Kernrecords sind zugeordnet');

const allItems = getAllKnowledgeItems();
assert.equal(new Set(allItems.map((item) => item.id)).size, allItems.length, 'keine Duplicate Knowledge IDs');
for (const id of ['nb.dns.definition', 'nb.dns.records', 'nb.dns.resolution', 'nb.dns.domainZone', 'nb.dns.fqdn', 'nb.dns.queryTypes', 'nb.dns.authority', 'nb.dns.forwardingDelegation', 'nb.dns.troubleshooting']) {
  assert(allItems.some((item) => item.id === id), `${id} ist registriert`);
  for (let seed = 0; seed < 10; seed += 1) {
    const question = generateQuestion(id, null, { contextType: 'coworker_question', seed: String(seed) });
    assert(question?.conversationText, `${id} erzeugt Mitarbeiterfrage`);
    assert.deepEqual(validateQuestionInstance(question), [], `${id} Seed ${seed} ist valide`);
  }
}
assert(CONVERSATION_TOPICS[topicKey], 'DNS ist in CONVERSATION_TOPICS registriert');
assert(CONVERSATION_TOPICS[topicKey].questions.some((question) => question.id === 'dns-4' && question.text.includes('IP')), 'statische DNS-Troubleshootingfrage ist vorhanden');
console.log(`dns-quality-audit: PASS (${lesson.explanations.length} explanations, ${lesson.exercises.length} exercises, ${lesson.quiz.length} quiz questions, ${allItems.filter((item) => item.topicKey === topicKey).length} knowledge items)`);
