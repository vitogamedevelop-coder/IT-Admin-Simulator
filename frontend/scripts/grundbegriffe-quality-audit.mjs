import assert from 'node:assert/strict';
import { BASICS_BEATS, BASICS_PRACTICE_QUESTIONS, pickDiverseBasicsQuestions } from '../src/lib/academyLessons/grundbegriffe.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';

const topicKey = 'fundamentals/grundbegriffe';
const knowledgeItems = getAllKnowledgeItems().filter((item) => item.topicKey === topicKey);
const text = BASICS_BEATS.map((beat) => [beat.text, beat.prompt, beat.explanation, ...(beat.options || [])].filter(Boolean).join(' ')).join(' ');
const requiredTerms = [
  'Netzwerk', 'Ressourcen', 'Dienst', 'Protokoll', 'leitungsvermittelt', 'paketvermittelt',
  'verbindungsorientiert', 'verbindungslos', 'Sender', 'Empfänger', 'Vermittlungsstellen',
  'Router', 'Steuerinformationen', 'Nutzdaten',
];

for (const term of requiredTerms) {
  assert(text.toLocaleLowerCase('de-DE').includes(term.toLocaleLowerCase('de-DE')), `Theorie enthält ${term}`);
}
assert(text.includes('Paketvermittelte Kommunikation kann verbindungsorientiert oder verbindungslos stattfinden.'), 'beide Kommunikationsachsen werden ausdrücklich getrennt');
assert(!text.includes('Simplex (nur eine Richtung)'), 'keine neue Simplex-Definition ohne Lehrgangsquelle');
assert(!text.includes('Halbduplex (abwechselnd'), 'keine neue Halbduplex-Definition ohne Lehrgangsquelle');
assert.equal(new Set(BASICS_PRACTICE_QUESTIONS.map((question) => question.question)).size, BASICS_PRACTICE_QUESTIONS.length, 'keine doppelten Praxisfragen');
assert(new Set(BASICS_PRACTICE_QUESTIONS.map((question) => question.facet)).size >= 6, 'Praxis deckt mindestens sechs Lernfacets ab');
assert(BASICS_PRACTICE_QUESTIONS.some((question) => question.facet === 'service-protocol'), 'Dienst/Protokoll ist in Praxis enthalten');
assert(BASICS_PRACTICE_QUESTIONS.some((question) => question.facet === 'axes'), 'Kommunikationsachsen sind in Praxis enthalten');
for (let seed = 1; seed <= 100; seed += 1) {
  let state = seed;
  const round = pickDiverseBasicsQuestions(() => ((state = (state * 16807) % 2147483647) - 1) / 2147483646);
  assert.equal(round.length, 5, `Runde ${seed} enthält fünf Fragen`);
  assert.equal(new Set(round.map((question) => question.facet)).size, 5, `Runde ${seed} enthält fünf verschiedene Facets`);
  assert(round.some((question) => question.facet === 'service-protocol'), `Runde ${seed} enthält Dienst/Protokoll`);
  assert(round.some((question) => question.facet === 'axes'), `Runde ${seed} enthält Kommunikationsachsen`);
}

const requiredItemIds = [
  'nb.grundbegriffe.network',
  'nb.grundbegriffe.service',
  'nb.grundbegriffe.protocol',
  'nb.grundbegriffe.serviceProtocolMapping',
  'nb.grundbegriffe.switchingTypes',
  'nb.grundbegriffe.connectionBehavior',
  'nb.grundbegriffe.communicationAxes',
];
const allIds = getAllKnowledgeItems().map((item) => item.id);
assert.equal(new Set(allIds).size, allIds.length, 'keine Duplicate Knowledge IDs');
for (const id of requiredItemIds) {
  const item = knowledgeItems.find((entry) => entry.id === id);
  assert(item, `${id} ist registriert`);
  for (let seed = 0; seed < 10; seed += 1) {
    const question = generateQuestion(id, null, { contextType: 'coworker_question', seed: String(seed) });
    assert(question, `${id} erzeugt Frage für Seed ${seed}`);
    const issues = validateQuestionInstance(question);
    assert.deepEqual(issues, [], `${id} Seed ${seed} ist valide: ${JSON.stringify(issues)}`);
  }
}

console.log(`grundbegriffe-quality-audit: PASS (${BASICS_BEATS.length} beats, ${BASICS_PRACTICE_QUESTIONS.length} practice questions, ${knowledgeItems.length} knowledge items)`);
