import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const legalDataKey = topicKey('information-security', 'security-legal-data');
const lesson = LESSONS[legalDataKey];
let failures = 0;

function assert(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${label}${detail ? ` (${detail})` : ''}`);
  if (!condition) failures += 1;
}

function blockText(block) {
  return [block.content, block.title, block.question, ...(block.items || []), JSON.stringify(block.rows || [])].filter(Boolean).join(' ');
}

console.log('=== Security Legal/Data Quality Audit ===');
assert('Lesson existiert', !!lesson);
assert('Mindestens 12 Theory Sections', (lesson?.explanations?.length || 0) >= 12, `count=${lesson?.explanations?.length || 0}`);
assert('Mindestens 5 Übungen', (lesson?.exercises?.length || 0) >= 5, `count=${lesson?.exercises?.length || 0}`);
assert('Quiz hat 6–8 Fragen', (lesson?.quiz?.length || 0) >= 6 && (lesson?.quiz?.length || 0) <= 8, `count=${lesson?.quiz?.length || 0}`);

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
  ['Personenbezogene Daten', ['personenbezogene daten', 'identifiziert', 'identifizierbar']],
  ['Direkte vs indirekte Identifizierbarkeit', ['direkte', 'indirekte', 'personalnummer', 'ip-adresse']],
  ['Datenschutzzweck', ['rechte und freiheiten', 'informationelle selbstbestimmung']],
  ['Rechtsgrundlage vs Einwilligung', ['rechtsgrundlage', 'einwilligung', 'vertragsabwicklung']],
  ['Art. 9 DSGVO', ['art. 9', 'gesundheitsdaten', 'politische meinungen', 'biometrische daten']],
  ['APersDat vs BPersDat', ['apersdat', 'bpersdat', 'besondere personenbezogene daten']],
  ['Schutzbereich 1', ['schutzbereich 1', 'funktionsträgerdaten']],
  ['Schutzbereich 2', ['schutzbereich 2', 'private adresse', 'kontodaten']],
  ['Schutzbereich 3', ['schutzbereich 3', 'sicherheitsakte', 'disziplinarakte']],
  ['Höchstprinzip', ['höchstprinzip', 'höchste', 'gemischten']],
  ['Öffentlich vs Offen vs VS', ['öffentliche informationen', 'offene informationen', 'verschlusssachen']],
  ['VS-Stufen', ['vs-nfd', 'vs-vertraulich', 'geheim', 'streng geheim']],
  ['Need-to-know', ['need-to-know', 'dienstliche notwendigkeit']],
  ['Systemfreigabe', ['systemfreigabe', 'maximale einstufung']],
]) {
  assert(label, needles.every((needle) => text.includes(needle)), `needles=${needles.join(', ')}`);
}

const diagrams = (lesson?.explanations || []).flatMap((e) => e.blocks).filter((b) => b.type === 'diagram');
assert('Mindestens drei lernwertige Visuals', diagrams.length >= 3, `count=${diagrams.length}`);
assert('Visuals sind mobile SVGs', diagrams.every((b) => typeof b.content === 'string' && b.content.includes('<svg') && b.content.includes('viewBox')));

const allItems = getAllKnowledgeItems();
const requestedKeys = new Set([
  'security-legal-data', 'data-protection', 'art9-dsgvo', 'information-categories',
].map((id) => topicKey('information-security', id)));
const legalDataItems = allItems.filter((item) => requestedKeys.has(item.topicKey));
for (const id of [
  'security.legalData.threeLevels',
  'security.legalData.personalData.definition',
  'security.legalData.personalData.identifiability',
  'security.legalData.purpose',
  'security.legalData.legalBasisVsConsent',
  'security.legalData.art9',
  'security.legalData.apersdatVsBpersdat',
  'security.legalData.sb1',
  'security.legalData.sb2',
  'security.legalData.sb3',
  'security.legalData.highestWins',
  'security.legalData.infoCategories',
  'security.legalData.vsOrder',
  'security.legalData.needToKnow',
  'security.legalData.systemApproval',
]) {
  assert(`Knowledge Facet ${id}`, legalDataItems.some((item) => item.id === id));
}
const ids = allItems.map((item) => item.id);
assert('Keine doppelten Knowledge IDs', new Set(ids).size === ids.length);
const sourceSectionIds = new Set((lesson?.explanations || []).map((e) => e.id));
const blockTwoItems = legalDataItems.filter((item) => item.sourceTopicKey === legalDataKey);
assert('Block-2 Knowledge verweist auf gültige Sections', blockTwoItems.every((item) => sourceSectionIds.has(item.sourceSection)), `items=${blockTwoItems.length}`);

const conversationKeys = ['security-legal-data', 'data-protection', 'art9-dsgvo', 'information-categories'].map((id) => topicKey('information-security', id));
assert('Conversation Coverage vollständig', conversationKeys.every((key) => !!CONVERSATION_TOPICS[key]));
assert('Security-Legal-Data Conversation hat Transferfragen', (CONVERSATION_TOPICS[legalDataKey]?.questions?.length || 0) >= 6);

const validTopics = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
assert('Alle Conversation Topic Keys gültig', conversationKeys.every((key) => validTopics.has(key)));

console.log('');
if (failures === 0) {
  console.log('Security Legal/Data Quality Audit bestanden.');
  process.exit(0);
}
console.log(`${failures} Fehler gefunden.`);
process.exit(1);
