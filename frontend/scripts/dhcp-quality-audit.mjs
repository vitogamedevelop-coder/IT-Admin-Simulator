import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const topicKey = 'fundamentals/dhcp';
const lesson = LESSONS[topicKey];
assert(lesson, 'DHCP-Lektion ist registriert');
const serialized = JSON.stringify(lesson);

for (const term of [
  'Dynamic Host Configuration Protocol', 'DHCP', 'DORA', 'Discover', 'Offer', 'Request', 'Acknowledge',
  'Lease', 'Renew', 'Rebind', 'Expire', 'Relay-Agent', 'APIPA', '169.254', 'Scope',
  'Reservierung', 'MAC-Adresse', 'UDP 67', 'UDP 68', 'NAK', 'Decline', 'Release', 'Inform',
  'automatisch', 'dynamisch', 'statisch', '80/20', '50/50', 'Failover',
]) {
  assert(serialized.toLocaleLowerCase('de-DE').includes(term.toLocaleLowerCase('de-DE')), `Lektion enthält ${term}`);
}

assert(/DHCP.*Anwendungsprotokoll.*UDP/i.test(serialized) || /UDP.*Transport/i.test(serialized), 'DHCP-Transport wird korrekt dargestellt');
assert(!/Schicht 5[–-]7/i.test(serialized), 'DHCP wird nicht als feste OSI-Schicht dargestellt');
assert(!/169\.254.*garantiert kaputt/i.test(serialized), 'APIPA wird nicht als garantierten Serverausfall dargestellt');
assert(/Router.*DHCP-Broadcasts.*nicht.*automatisch.*weiter/i.test(serialized), 'Router leiten DHCP-Broadcasts nicht automatisch weiter');

for (const sectionId of [
  'was-classic', 'was-intuitive', 'dora-classic', 'dora-visual', 'dora-example',
  'relay-classic', 'lease-classic', 'lease-visual', 'modes-classic', 'redundancy-classic',
  'praxis-rolle-classic', 'praxis-autorisierung-classic', 'praxis-scope-classic',
  'praxis-reservierung-classic', 'praxis-test-classic', 'praxis-fehler-classic',
  'shortcuts-classic', 'summary-classic',
]) {
  assert(lesson.explanations.some((entry) => entry.id === sectionId), `${sectionId} ist vorhanden`);
}

for (const sectionId of ['dora-visual', 'lease-visual']) {
  const section = lesson.explanations.find((entry) => entry.id === sectionId);
  assert(section.blocks.some((block) => block.type === 'diagram'), `${sectionId} ist visualisiert`);
}

for (const exerciseId of [
  'dhcp-dora-ordering', 'dhcp-extra-messages-matching', 'dhcp-lease-timeline-ordering',
  'dhcp-udp-ports-matching', 'dhcp-allocation-modes-matching', 'dhcp-scope-ordering',
  'dhcp-terms-matching', 'dhcp-options-matching', 'dhcp-relay-select',
  'dhcp-apipa-select', 'dhcp-renew-input', 'dhcp-troubleshooting-select',
]) {
  assert(lesson.exercises.some((exercise) => exercise.id === exerciseId), `${exerciseId} ist vorhanden`);
}

assert.equal(new Set(lesson.exercises.map((exercise) => exercise.id)).size, lesson.exercises.length, 'keine Duplicate Exercise IDs');

const doraExercise = lesson.exercises.find((exercise) => exercise.id === 'dhcp-dora-ordering');
assert.deepStrictEqual(doraExercise.correctOrder, ['discover', 'offer', 'request', 'ack'], 'DORA-Reihenfolge korrekt');

const leaseExercise = lesson.exercises.find((exercise) => exercise.id === 'dhcp-lease-timeline-ordering');
assert.deepStrictEqual(leaseExercise.correctOrder, ['start', 'renew', 'rebind', 'expire'], 'Lease-Timeline korrekt');

const allItems = getAllKnowledgeItems();
assert.equal(new Set(allItems.map((item) => item.id)).size, allItems.length, 'keine Duplicate Knowledge IDs');
for (const id of [
  'nb.dhcp.definition', 'nb.dhcp.options', 'nb.dhcp.dora', 'nb.dhcp.extraMessages',
  'nb.dhcp.udpPorts', 'nb.dhcp.lease', 'nb.dhcp.relay', 'nb.dhcp.allocation',
  'nb.dhcp.apipa', 'nb.dhcp.redundancy',
]) {
  assert(allItems.some((item) => item.id === id), `${id} ist registriert`);
  for (let seed = 0; seed < 10; seed += 1) {
    const question = generateQuestion(id, null, { contextType: 'coworker_question', seed: String(seed) });
    assert(question?.conversationText, `${id} erzeugt Mitarbeiterfrage`);
    assert.deepStrictEqual(validateQuestionInstance(question), [], `${id} Seed ${seed} ist valide`);
  }
}

assert(CONVERSATION_TOPICS[topicKey], 'DHCP ist in CONVERSATION_TOPICS registriert');
const conversation = CONVERSATION_TOPICS[topicKey];
assert(conversation.questions.some((question) => question.id === 'dhcp-5' && question.text.includes('169.254')), 'APIPA-Transferfrage ist vorhanden');
assert(conversation.questions.some((question) => question.id === 'dhcp-6' && question.text.includes('Relay')), 'Relay-Transferfrage ist vorhanden');
assert(conversation.questions.some((question) => question.id === 'dhcp-7' && question.text.includes('Reservierung')), 'Reservierungs-Transferfrage ist vorhanden');
assert(conversation.questions.some((question) => question.id === 'dhcp-10' && question.text.includes('DORA')), 'DORA-Erklärungsfrage ist vorhanden');

console.log(`dhcp-quality-audit: PASS (${lesson.explanations.length} explanations, ${lesson.exercises.length} exercises, ${lesson.quiz.length} quiz questions, ${allItems.filter((item) => item.topicKey === topicKey).length} knowledge items)`);
