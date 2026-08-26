import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { OSI_LAYERS } from '../src/lib/academyLessons/osi.js';
import { collectQuestionsFromLesson } from '../src/lib/academyThemencheck.js';
import { getAllKnowledgeItems, generateQuestion, validateQuestionInstance } from '../src/lib/knowledge/index.js';

const topicKey = 'fundamentals/osi-model';
const lesson = LESSONS[topicKey];
assert(lesson, 'OSI-Lektion ist registriert');
assert.equal(OSI_LAYERS.length, 7, 'genau sieben Schichten');
assert.deepEqual(OSI_LAYERS.map((layer) => layer.num), [1, 2, 3, 4, 5, 6, 7], 'Schichtreihenfolge stimmt');
for (const layer of OSI_LAYERS) {
  assert(layer.de && layer.en && layer.pdu, `Layer ${layer.num} hat deutsche/englische Bezeichnung und PDU`);
  assert(lesson.explanations.some((entry) => entry.id === `layer${layer.num}-classic`), `Layer ${layer.num} bleibt vorhanden`);
}
const serialized = JSON.stringify(lesson);
assert(serialized.includes('Open Systems Interconnection'), 'OSI-Akronym ist erklärt');
assert(!/\b(?:im|laut|für den) Lehrgang\b/i.test(serialized), 'kein sichtbarer Lehrgang-Metatext');
assert(!/IPv4 Header|Time to Live|Sliding Window|Portbereich/i.test(serialized), 'keine unnötige Detailvertiefung aus eigenen Topics');
for (const sectionId of ['layer2-frame-classic', 'arp-classic', 'encapsulation-classic']) {
  const section = lesson.explanations.find((entry) => entry.id === sectionId);
  assert(section, `${sectionId} ist vorhanden`);
  assert(section.blocks.some((block) => block.type === 'diagram' && block.content.includes('<svg')), `${sectionId} besitzt responsive SVG-Grafik`);
}
for (const exerciseId of ['osi-ordering', 'osi-tasks', 'osi-encapsulation-order', 'osi-arp-order', 'osi-switch-learning', 'osi-troubleshooting-gateway']) {
  assert(lesson.exercises.some((exercise) => exercise.id === exerciseId), `${exerciseId} ist vorhanden`);
}
const questions = collectQuestionsFromLesson(lesson, 'osi-model');
for (const facet of ['pdu', 'encapsulation', 'switch-learning', 'arp', 'troubleshooting', 'misconception-osi']) {
  assert(questions.some((question) => question.facet === facet), `Fragenfacet ${facet} ist vorhanden`);
}
const itemIds = getAllKnowledgeItems().map((item) => item.id);
assert.equal(new Set(itemIds).size, itemIds.length, 'keine Duplicate Knowledge IDs');
for (const layer of OSI_LAYERS) {
  const id = `osi.layer${layer.num}`;
  for (let seed = 0; seed < 10; seed += 1) {
    const question = generateQuestion(id, 'osi.layer.pduToLayer', { contextType: 'coworker_question', seed: String(seed) });
    assert(question, `${id} erzeugt PDU-Frage`);
    assert.equal(question.templateId, 'osi.layer.pduToLayer', `${id} nutzt PDU-Template`);
    assert.deepEqual(validateQuestionInstance(question), [], `${id} Seed ${seed} ist valide`);
  }
}
console.log(`osi-referenzmodelle-quality-audit: PASS (${lesson.explanations.length} explanations, ${lesson.exercises.length} exercises, ${questions.length} questions)`);
