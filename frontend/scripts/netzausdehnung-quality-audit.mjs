import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { collectQuestionsFromLesson } from '../src/lib/academyThemencheck.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';

const topicKey = 'fundamentals/kommunikation-uebertragung';
const lesson = LESSONS[topicKey];
assert(lesson, 'zusammengeführte Kommunikations-/Übertragungslektion ist registriert');
const serialized = JSON.stringify(lesson);

const requiredTerms = [
  'BAN', 'Body Area Network', 'PAN', 'Personal Area Network', 'LAN', 'Local Area Network',
  'MAN', 'Metropolitan Area Network', 'WAN', 'Wide Area Network', 'GAN', 'Global Area Network',
  'Internet', 'Intranet', 'Reichweite', 'Ressourcen', 'Netzwerk',
];
for (const term of requiredTerms) {
  assert(serialized.toLocaleLowerCase('de-DE').includes(term.toLocaleLowerCase('de-DE')), `Lektion enthält ${term}`);
}
assert(!/\b(?:im|laut|für den) Lehrgang\b/i.test(serialized), 'kein sichtbarer Lehrgang-Metatext');
assert(serialized.includes('nicht jedes GAN ist automatisch das Internet'), 'GAN wird nicht mit Internet gleichgesetzt');
assert(serialized.includes('interner Gebrauch') || serialized.includes('internen Organisationsnetz'), 'Intranet wird als interner Organisationsbereich erklärt');

const scopeSection = lesson.explanations.find((entry) => entry.id === 'netzausdehnung-classic');
assert(scopeSection, 'Netzausdehnungs-Section ist vorhanden');
assert(scopeSection.blocks.some((block) => block.type === 'diagram' && block.content.includes('<svg')), 'responsive Größenordnungs-SVG ist vorhanden');
assert(lesson.explanations.some((entry) => entry.id === 'internet-intranet-classic'), 'Internet/Intranet-Section ist vorhanden');
for (const exerciseId of ['network-scope-acronyms', 'network-scope-scenarios', 'internet-intranet-scenario']) {
  assert(lesson.exercises.some((exercise) => exercise.id === exerciseId), `${exerciseId} ist vorhanden`);
}

const questions = collectQuestionsFromLesson(lesson, 'kommunikation-uebertragung');
const scopeFacets = new Set(questions.filter((question) => question.facet).map((question) => question.facet));
for (const facet of ['acronym', 'ban-pan', 'scope-scenario', 'scope-compare', 'wan-gan', 'internet-intranet', 'misconception', 'transfer']) {
  assert(scopeFacets.has(facet), `Fragenfacet ${facet} ist vorhanden`);
}

const requiredKnowledgeIds = [
  'nb.grundbegriffe.ban', 'nb.grundbegriffe.pan', 'nb.grundbegriffe.lan',
  'nb.grundbegriffe.man', 'nb.grundbegriffe.wan', 'nb.grundbegriffe.gan',
  'nb.grundbegriffe.networkScopeOrder', 'nb.grundbegriffe.networkScopeMapping',
  'nb.grundbegriffe.networkScopeScenarios', 'nb.grundbegriffe.internetIntranet',
  'nb.grundbegriffe.ganInternetMisconception',
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

console.log(`netzausdehnung-quality-audit: PASS (${lesson.explanations.length} explanations, ${lesson.exercises.length} exercises, ${questions.length} questions)`);
