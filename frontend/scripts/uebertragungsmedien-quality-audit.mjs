import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { collectQuestionsFromLesson } from '../src/lib/academyThemencheck.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';

const topicKey = 'fundamentals/kommunikation-uebertragung';
const lesson = LESSONS[topicKey];
assert(lesson, 'zusammengeführte Lektion ist registriert');
const serialized = JSON.stringify(lesson);
const requiredTerms = [
  'Übertragungsmedium', 'leitungsgebunden', 'leitungsungebunden', 'metallisch', 'nichtmetallisch',
  'Koaxialkabel', 'Innenleiter', 'Schirmung', 'Twisted Pair', 'UTP', 'STP', 'S/UTP',
  'Glasfaser', 'LWL', 'Core', 'Cladding', 'Totalreflexion', 'Singlemode', 'Monomode',
  'Multimode', 'Funk', 'Satellit', 'Uplink', 'Downlink', 'Infrarot', 'Sender', 'Empfänger',
];
for (const term of requiredTerms) assert(serialized.toLocaleLowerCase('de-DE').includes(term.toLocaleLowerCase('de-DE')), `Lektion enthält ${term}`);
assert(!/\b(?:im|laut|für den) Lehrgang\b/i.test(serialized), 'kein sichtbarer Lehrgang-Metatext');
assert(!/maximal exakt|immer das beste|STP ist immer besser/i.test(serialized), 'keine absolute Medienrangliste');

for (const sectionId of ['medien-classic', 'kupfer-classic', 'glasfaser-classic', 'drahtlos-classic']) {
  assert(lesson.explanations.some((entry) => entry.id === sectionId), `${sectionId} ist vorhanden`);
}
for (const sectionId of ['kupfer-classic', 'glasfaser-classic', 'drahtlos-classic']) {
  const section = lesson.explanations.find((entry) => entry.id === sectionId);
  assert(section.blocks.some((block) => block.type === 'diagram' && block.content.includes('<svg')), `${sectionId} besitzt responsive SVG-Grafik`);
}
for (const exerciseId of ['medien-matching', 'media-category-matching', 'shielding-notation', 'fiber-mode-matching', 'nexus-medium-selection']) {
  assert(lesson.exercises.some((exercise) => exercise.id === exerciseId), `${exerciseId} ist vorhanden`);
}
const questions = collectQuestionsFromLesson(lesson, 'kommunikation-uebertragung');
for (const facet of ['guided-unguided', 'coax', 'utp-stp', 'shielding', 'fiber', 'fiber-mode', 'satellite', 'misconception-media', 'scenario-selection']) {
  assert(questions.some((question) => question.facet === facet), `Fragenfacet ${facet} ist vorhanden`);
}
assert(!questions.some((question) => /wie viele (?:µm|km)|welche frequenz exakt|maximal exakt/i.test(question.question)), 'keine dominanten exakten Zahlenfragen');

const requiredKnowledgeIds = [
  'nb.kommu.transmissionMedium', 'nb.kommu.mediaCategories', 'nb.kommu.coax',
  'nb.kommu.utpStp', 'nb.kommu.shieldingNotation', 'nb.kommu.fiber',
  'nb.kommu.fiberModes', 'nb.kommu.wirelessTypes', 'nb.kommu.mediaMapping',
];
const allItems = getAllKnowledgeItems();
assert.equal(new Set(allItems.map((item) => item.id)).size, allItems.length, 'keine Duplicate Knowledge IDs');
for (const id of requiredKnowledgeIds) {
  assert(allItems.some((item) => item.id === id), `${id} ist registriert`);
  for (let seed = 0; seed < 10; seed += 1) {
    const question = generateQuestion(id, null, { contextType: 'coworker_question', seed: String(seed) });
    assert(question, `${id} erzeugt eine Frage`);
    assert.deepEqual(validateQuestionInstance(question), [], `${id} Seed ${seed} ist valide`);
  }
}

console.log(`uebertragungsmedien-quality-audit: PASS (${lesson.explanations.length} explanations, ${lesson.exercises.length} exercises, ${questions.length} questions)`);
