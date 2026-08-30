import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const incidentsKey = topicKey('information-security', 'security-incidents');
const lesson = LESSONS[incidentsKey];
let failures = 0;

function assert(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${label}${detail ? ` (${detail})` : ''}`);
  if (!condition) failures += 1;
}

function blockText(block) {
  return [block.content, block.title, block.question, ...(block.items || []), JSON.stringify(block.rows || [])].filter(Boolean).join(' ');
}

console.log('=== Security Incidents Quality Audit ===');
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
  ['Belehrungen', ['belehrungen', 'handlungssicherheit']],
  ['Verantwortung', ['gesamtverantwortung', 'dienststellenleiter', 'kommandeur']],
  ['ISB', ['informationssicherheitsbeauftragter', 'isb']],
  ['ADSB', ['adsb', 'datenschutzbeauftragter']],
  ['SiBe', ['sibe', 'sicherheitsbeauftragter']],
  ['KryVw', ['kryvw', 'kryptoverwalter']],
  ['CSOCBw', ['csocbw', 'lagebild']],
  ['CERTBw', ['certbw', 'notfallreaktion']],
  ['IT-Forensik', ['forensik', 'beweise', 'ursachen']],
  ['BAMAD', ['bamad', 'extremistischen', 'nachrichtendienstlichen']],
  ['Informationssicherheitslücke', ['informationssicherheitslücke', 'gefährdung']],
  ['Informationssicherheitsverstoß', ['informationssicherheitsverstoß', 'regelwidrige']],
  ['Informationssicherheitsvorkommnis', ['informationssicherheitsvorkommnis', 'beeinträchtigt']],
  ['Lücke vs Verstoß vs Vorkommnis', ['lücke', 'verstoß', 'vorkommnis']],
  ['Phishing-Fall', ['phishing', 'gefährdung']],
  ['Antivirus trotz Verstoß', ['virenschutz', 'regelverstoß']],
  ['Kleine Vorfälle melden', ['einzelmeldung', 'lagebild']],
  ['Meldeweg', ['meldeweg', 'isb', 'csocbw']],
  ['Erstbewertung', ['erstbewertung', 'betroffene systeme']],
  ['Sofortmaßnahmen', ['sofortmaßnahmen', 'beweise', 'warnen']],
  ['Stabsstruktur Kontext', ['stabsstruktur', 'kein kern']],
]) {
  assert(label, needles.every((needle) => text.includes(needle)), `needles=${needles.join(', ')}`);
}

const diagrams = (lesson?.explanations || []).flatMap((e) => e.blocks).filter((b) => b.type === 'diagram');
assert('Mindestens drei lernwertige Visuals', diagrams.length >= 3, `count=${diagrams.length}`);
assert('Visuals sind mobile SVGs', diagrams.every((b) => typeof b.content === 'string' && b.content.includes('<svg') && b.content.includes('viewBox')));

const allItems = getAllKnowledgeItems();
const requestedKeys = new Set([
  'security-incidents', 'security-breach', 'security-incident', 'incident-response',
].map((id) => topicKey('information-security', id)));
const incidentItems = allItems.filter((item) => requestedKeys.has(item.topicKey));
for (const id of [
  'security.incidents.awareness',
  'security.incidents.responsibility',
  'security.incidents.roles.isb',
  'security.incidents.roles.adsb',
  'security.incidents.roles.sibe',
  'security.incidents.roles.kryvw',
  'security.incidents.roles.csoc',
  'security.incidents.roles.cert',
  'security.incidents.roles.forensics',
  'security.incidents.roles.bamad',
  'security.incidents.gap.definition',
  'security.incidents.violation.definition',
  'security.incidents.incident.definition',
  'security.incidents.gapVsViolation',
  'security.incidents.phishingProgression',
  'security.incidents.malwareViolation',
  'security.incidents.reportingWhy',
  'security.incidents.reportingFlow',
  'security.incidents.initialAssessment',
  'security.incidents.immediateMeasures',
  'security.incidents.centralCorrelation',
]) {
  assert(`Knowledge Facet ${id}`, incidentItems.some((item) => item.id === id));
}
const ids = allItems.map((item) => item.id);
assert('Keine doppelten Knowledge IDs', new Set(ids).size === ids.length);
const sourceSectionIds = new Set((lesson?.explanations || []).map((e) => e.id));
const blockThreeItems = incidentItems.filter((item) => item.sourceTopicKey === incidentsKey);
assert('Block-3 Knowledge verweist auf gültige Sections', blockThreeItems.every((item) => sourceSectionIds.has(item.sourceSection)), `items=${blockThreeItems.length}`);

const conversationKeys = ['security-incidents', 'security-breach', 'security-incident', 'incident-response'].map((id) => topicKey('information-security', id));
assert('Conversation Coverage vollständig', conversationKeys.every((key) => !!CONVERSATION_TOPICS[key]));
assert('Security-Incidents Conversation hat Transferfragen', (CONVERSATION_TOPICS[incidentsKey]?.questions?.length || 0) >= 6);

const validTopics = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
assert('Alle Conversation Topic Keys gültig', conversationKeys.every((key) => validTopics.has(key)));

console.log('');
if (failures === 0) {
  console.log('Security Incidents Quality Audit bestanden.');
  process.exit(0);
}
console.log(`${failures} Fehler gefunden.`);
process.exit(1);
