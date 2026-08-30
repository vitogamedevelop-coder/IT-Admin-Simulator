import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const fundamentalsKey = topicKey('information-security', 'security-fundamentals');
const lesson = LESSONS[fundamentalsKey];
let failures = 0;

function assert(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${label}${detail ? ` (${detail})` : ''}`);
  if (!condition) failures += 1;
}

function blockText(block) {
  return [block.content, block.title, block.question, ...(block.items || []), JSON.stringify(block.rows || [])].filter(Boolean).join(' ');
}

console.log('=== Security Fundamentals Quality Audit ===');
assert('Lesson existiert', !!lesson);
assert('Mindestens 15 Theory Sections', (lesson?.explanations?.length || 0) >= 15, `count=${lesson?.explanations?.length || 0}`);
assert('Mindestens 8 Übungen', (lesson?.exercises?.length || 0) >= 8, `count=${lesson?.exercises?.length || 0}`);
assert('Mindestens 8 Quizfragen', (lesson?.quiz?.length || 0) >= 8, `count=${lesson?.quiz?.length || 0}`);

const sectionIds = (lesson?.explanations || []).map((e) => e.sectionId || e.id);
assert('Section IDs eindeutig', new Set(sectionIds).size === sectionIds.length);
const exerciseIds = (lesson?.exercises || []).map((e) => e.id);
assert('Exercise IDs eindeutig', new Set(exerciseIds).size === exerciseIds.length);
assert('Exercise-Typen unterstützt', (lesson?.exercises || []).every((e) => ['matching', 'ordering', 'select-best', 'input'].includes(e.type)));

const text = [
  ...(lesson?.explanations || []).flatMap((e) => e.blocks.map(blockText)),
  ...(lesson?.exercises || []).map((e) => `${e.question} ${e.explanation} ${JSON.stringify(e.pairs || e.options || [])}`),
  ...(lesson?.quiz || []).map((q) => `${q.question} ${q.explanation}`),
].join(' ').toLowerCase();

for (const [label, needles] of [
  ['Zentrale Definition', ['vertraulichkeit', 'integrität', 'verfügbarkeit', 'geforderten maß']],
  ['A-960/1 und ISMS Bw', ['a-960/1', 'isms bw']],
  ['Authentizität bei Integrität', ['authentizität', 'im zusammenhang mit integrität']],
  ['Mehrere Grundwerte', ['mehrere grundwerte', 'vertraulichkeit und verfügbarkeit']],
  ['PIMO', ['pimo', 'personell', 'infrastrukturell', 'materiell', 'organisatorisch']],
  ['OPTI', ['opti', 'technisch', 'keine „materiellen maßnahmen“']],
  ['PIMO vs OPTI', ['pimo fragt', 'opti fragt']],
  ['PDCA', ['plan', 'do', 'check', 'act', 'kreislauf']],
  ['Gefordertes Maß', ['schutzbedarf', '100 % sicherheit']],
  ['Administratorrolle', ['administratoren', 'do-phase']],
]) {
  assert(label, needles.every((needle) => text.includes(needle)), `needles=${needles.join(', ')}`);
}

const diagrams = (lesson?.explanations || []).flatMap((e) => e.blocks).filter((b) => b.type === 'diagram');
assert('Mindestens fünf lernwertige Visuals', diagrams.length >= 5, `count=${diagrams.length}`);
assert('Visuals sind mobile SVGs', diagrams.every((b) => typeof b.content === 'string' && b.content.includes('<svg') && b.content.includes('viewBox')));

const allItems = getAllKnowledgeItems();
const requestedKeys = new Set([
  'security-objectives', 'authenticity', 'isms', 'pimo', 'opti', 'pdca', 'required-level',
].map((id) => topicKey('information-security', id)));
const securityItems = allItems.filter((item) => requestedKeys.has(item.topicKey));
for (const id of ['security.cia.definition', 'security.cia.confidentiality', 'security.cia.integrity', 'security.cia.authenticity', 'security.cia.availability', 'security.cia.interaction', 'security.cia.measureMapping', 'security.isms.definition', 'security.pimo.mapping', 'security.opti.mapping', 'security.pimoVsOpti', 'security.pdca.order', 'security.pdca.adminRole', 'security.requiredLevel.definition']) {
  assert(`Knowledge Facet ${id}`, securityItems.some((item) => item.id === id));
}
const ids = allItems.map((item) => item.id);
assert('Keine doppelten Knowledge IDs', new Set(ids).size === ids.length);
const sourceSectionIds = new Set((lesson?.explanations || []).map((e) => e.id));
const blockOneItems = securityItems.filter((item) => item.sourceTopicKey === fundamentalsKey);
assert('Block-1 Knowledge verweist auf gültige Sections', blockOneItems.every((item) => sourceSectionIds.has(item.sourceSection)), `items=${blockOneItems.length}`);

const conversationKeys = ['security-fundamentals', 'security-objectives', 'confidentiality', 'integrity', 'availability', 'authenticity', 'isms', 'pimo', 'opti', 'pdca', 'required-level'].map((id) => topicKey('information-security', id));
assert('Conversation Coverage vollständig', conversationKeys.every((key) => !!CONVERSATION_TOPICS[key]));
assert('Security-Fundamentals Conversation hat Transferfragen', (CONVERSATION_TOPICS[fundamentalsKey]?.questions?.length || 0) >= 6);

const validTopics = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
assert('Alle Conversation Topic Keys gültig', conversationKeys.every((key) => validTopics.has(key)));

console.log('');
if (failures === 0) {
  console.log('Security Fundamentals Quality Audit bestanden.');
  process.exit(0);
}
console.log(`${failures} Fehler gefunden.`);
process.exit(1);
