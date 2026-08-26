import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { collectQuestionsFromLesson } from '../src/lib/academyThemencheck.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';

const topicKey = 'fundamentals/topologien';
const lesson = LESSONS[topicKey];
assert(lesson, 'Topologien-Lektion ist registriert');

const serialized = JSON.stringify(lesson);
const requiredTerms = [
  'Topologie', 'physische Topologie', 'logische Topologie', 'Bus', 'Stern', 'Ring', 'Baum',
  'vermascht', 'Teilvermaschung', 'Vollvermaschung', 'Aufwand', 'Skalierbarkeit',
  'Kapazität', 'Ausfallsicherheit', 'Verteiler', 'Uplink', 'gemeinsames Übertragungsmedium', 'Redundanz',
];
for (const term of requiredTerms) {
  assert(serialized.toLocaleLowerCase('de-DE').includes(term.toLocaleLowerCase('de-DE')), `Lektion enthält ${term}`);
}
assert(!/\b(?:im|laut|für den) Lehrgang\b/i.test(serialized), 'kein sichtbarer Lehrgang-Metatext');

for (const topology of ['bus', 'ring', 'star', 'tree', 'mesh']) {
  const section = lesson.explanations.find((entry) => entry.id === `${topology}-classic`);
  assert(section, `${topology}-classic ist vorhanden`);
  const diagram = section.blocks.find((block) => block.type === 'diagram');
  assert(diagram?.content.includes('<svg'), `${topology} besitzt bestehende SVG-Grafik`);
}
const physicalLogical = lesson.explanations.find((entry) => entry.id === 'physical-logical-classic');
assert(physicalLogical?.blocks.some((block) => block.type === 'diagram' && block.content.includes('<svg')), 'physisch/logisch besitzt erklärende SVG-Grafik');
const criteria = lesson.explanations.find((entry) => entry.id === 'criteria-classic');
assert(criteria?.blocks.some((block) => block.type === 'table'), 'Vergleichskriterien sind als Tabelle vorhanden');
assert(lesson.exercises.some((exercise) => exercise.id === 'topo-match'), 'bestehende Matching-Übung bleibt erhalten');
assert(lesson.exercises.some((exercise) => exercise.id === 'topo-nexus-failure'), 'NEXUS-Fehlerauswirkung ist vorhanden');
assert(lesson.exercises.some((exercise) => exercise.id === 'topo-nexus-tradeoff'), 'NEXUS-Trade-off ist vorhanden');

const questions = collectQuestionsFromLesson(lesson, 'topologien');
assert(questions.length >= 10, 'ausreichender Fragenpool');
assert(new Set(questions.filter((question) => question.facet).map((question) => question.facet)).size >= 7, 'Fragenpool deckt verschiedene Lernfacets ab');

const knowledgeItems = getAllKnowledgeItems().filter((item) => item.topicKey === topicKey);
const requiredItemIds = [
  'nb.topologien.definition',
  'nb.topologien.physicalLogical',
  'nb.topologien.criteriaMapping',
  'nb.topologien.meshTypes',
  'nb.topologien.resilienceCompare',
  'nb.topologien.taglineMapping',
];
const allIds = getAllKnowledgeItems().map((item) => item.id);
assert.equal(new Set(allIds).size, allIds.length, 'keine Duplicate Knowledge IDs');
for (const id of requiredItemIds) {
  assert(knowledgeItems.some((item) => item.id === id), `${id} ist registriert`);
  for (let seed = 0; seed < 10; seed += 1) {
    const question = generateQuestion(id, null, { contextType: 'coworker_question', seed: String(seed) });
    assert(question, `${id} erzeugt eine Frage`);
    assert.deepEqual(validateQuestionInstance(question), [], `${id} Seed ${seed} ist valide`);
  }
}

console.log(`topologien-quality-audit: PASS (${lesson.explanations.length} explanations, ${lesson.exercises.length} exercises, ${questions.length} questions, ${knowledgeItems.length} knowledge items)`);
