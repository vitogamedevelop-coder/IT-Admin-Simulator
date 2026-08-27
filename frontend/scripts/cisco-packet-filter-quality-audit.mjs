import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

const pfKey = topicKey('cisco-packet-tracer', 'packet-filter');
const lesson = LESSONS[pfKey];

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco Packet Filter Quality Audit ===');

assert('Lesson existiert', !!lesson);
assert('Hat Erklärungen', (lesson?.explanations?.length || 0) > 0, `count=${lesson?.explanations?.length}`);
assert('Hat Übungen', (lesson?.exercises?.length || 0) > 0, `count=${lesson?.exercises?.length}`);
assert('Hat Quiz', (lesson?.quiz?.length || 0) > 0, `count=${lesson?.quiz?.length}`);
assert('Hat cliTasks', (lesson?.cliTasks?.length || 0) > 0, `count=${lesson?.cliTasks?.length}`);

const visualIds = (lesson?.explanations || []).filter((e) => e.style === 'visual').map((e) => e.id);
assert('Hat mindestens eine Visualisierung', visualIds.length > 0, `visuals=${visualIds.join(',') || 'none'}`);

const conv = CONVERSATION_TOPICS[pfKey];
assert('Conversation existiert', !!conv);
assert('Conversation hat Fragen', (conv?.questions?.length || 0) >= 3, `count=${conv?.questions?.length}`);

const allKnowledge = getAllKnowledgeItems();
const items = allKnowledge.filter((item) => item.topicKey === pfKey);
assert('Knowledge Items vorhanden', items.length >= 3, `count=${items.length}`);

const pfSkills = SKILL_TREE.cisco?.skills?.packet_filter?.subskills || {};
assert('Skill Tree stateless_concept', !!pfSkills['stateless_concept']);
assert('Skill Tree stateful_concept', !!pfSkills['stateful_concept']);
assert('Skill Tree return_traffic', !!pfSkills['return_traffic']);
assert('Skill Tree cbac_inspect_rule', !!pfSkills['cbac_inspect_rule']);
assert('Skill Tree cbac_interface_binding', !!pfSkills['cbac_interface_binding']);
assert('Skill Tree session_state', !!pfSkills['session_state']);
assert('Skill Tree verify', !!pfSkills['verify']);
assert('Skill Tree troubleshoot', !!pfSkills['troubleshoot']);

const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const invalid = Object.values(pfSkills).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

assert('CLI-Engine normalisiert ip inspect name', normalizeCiscoLine('ip inspect name INTERNET tcp') === 'ip inspect name internet tcp');
assert('CLI-Engine normalisiert ip inspect bind', normalizeCiscoLine('ip inspect INTERNET out') === 'ip inspect internet out');
assert('CLI-Engine normalisiert no ip inspect', normalizeCiscoLine('no ip inspect INTERNET out') === 'no ip inspect internet out');
assert('CLI-Engine normalisiert show ip inspect all', normalizeCiscoLine('sh ip inspect all') === 'show ip inspect all');
assert('CLI-Engine normalisiert show ip inspect interfaces', normalizeCiscoLine('sh ip inspect interfaces') === 'show ip inspect interfaces');
assert('CLI-Engine normalisiert show ip inspect sessions', normalizeCiscoLine('sh ip inspect sessions') === 'show ip inspect sessions');
assert('CLI-Engine normalisiert show ip inspect statistics', normalizeCiscoLine('sh ip inspect statistics') === 'show ip inspect statistics');
assert('CLI-Engine normalisiert show ip interface', normalizeCiscoLine('sh ip int g0/1') === 'show ip interface g0/1');
assert('CLI-Engine normalisiert show access-lists', normalizeCiscoLine('sh access-lists') === 'show access-lists');
assert('CLI-Engine normalisiert ip access-group', normalizeCiscoLine('ip access-group OUTBOUND out') === 'ip access-group outbound out');
assert('CLI-Engine normalisiert ip access-list extended', normalizeCiscoLine('ip access-list extended OUTBOUND') === 'ip access-list extended outbound');

function stringifyBlock(block) {
  if (!block) return '';
  if (typeof block.content === 'string') return block.content;
  if (Array.isArray(block.content)) return block.content.join(' ');
  if (typeof block.content === 'object' && block.content !== null) return JSON.stringify(block.content);
  if (typeof block.title === 'string') return block.title;
  if (block.rows || block.headers) return JSON.stringify({ headers: block.headers || [], rows: block.rows || [] });
  if (Array.isArray(block.items)) return block.items.join(' ');
  if (Array.isArray(block.options)) return block.options.join(' ');
  return '';
}

const expText = (lesson?.explanations || []).flatMap((e) => e.blocks.map(stringifyBlock)).join(' ');
const exText = (lesson?.exercises || []).map((e) => `${e.id} ${e.question} ${e.explanation}`).join(' ');
const quizText = (lesson?.quiz || []).map((q) => `${q.question} ${q.explanation}`).join(' ');
const cliText = (lesson?.cliTasks || []).map((t) => `${t.prompt} ${t.explanation}`).join(' ');
const allTexts = [expText, exText, quizText, cliText].join(' ').toLowerCase();

assert('Stateless Paketfilter abgedeckt', allTexts.includes('stateless'));
assert('Stateful Paketfilter abgedeckt', allTexts.includes('stateful'));
assert('ACL-Basis abgedeckt', allTexts.includes('acl'));
assert('First Match / implicit deny abgedeckt', allTexts.includes('first match') || allTexts.includes('implicit deny'));
assert('Rückverkehr-Problem abgedeckt', allTexts.includes('rückverkehr') || allTexts.includes('antwort'));
assert('CBAC ip inspect abgedeckt', allTexts.includes('ip inspect'));
assert('established vs SPI abgedeckt', allTexts.includes('established'));
assert('established ist kein echter State abgedeckt', allTexts.includes('tcp-flags') || allTexts.includes('session'));
assert('ACL + SPI Zusammenspiel abgedeckt', allTexts.includes('zusammen') || allTexts.includes('arbeiten'));
assert('Binding direction abgedeckt', allTexts.includes('out') && allTexts.includes('in'));
assert('Temporary session rules abgedeckt', allTexts.includes('temporär') || allTexts.includes('timeout'));
assert('Protokolle tcp/udp abgedeckt', allTexts.includes('tcp') && allTexts.includes('udp'));
assert('show ip inspect config abgedeckt', allTexts.includes('show ip inspect config'));
assert('show ip inspect interfaces abgedeckt', allTexts.includes('show ip inspect interfaces'));
assert('show ip inspect sessions abgedeckt', allTexts.includes('show ip inspect sessions'));
assert('show ip inspect statistics abgedeckt', allTexts.includes('show ip inspect statistics'));
assert('show access-lists abgedeckt', allTexts.includes('show access-lists'));
assert('show ip interface abgedeckt', allTexts.includes('show ip interface'));
assert('Troubleshooting missing inspect rule abgedeckt', allTexts.includes('not defined') || allTexts.includes('definiert'));
assert('Troubleshooting wrong direction abgedeckt', allTexts.includes('richtung') || allTexts.includes('richtung'));
assert('Troubleshooting wrong protocol abgedeckt', allTexts.includes('protokoll'));
assert('Troubleshooting expired session abgedeckt', allTexts.includes('abgelaufen') || allTexts.includes('timeout'));
assert('Configured ≠ functioning abgedeckt', allTexts.includes('configured') || allTexts.includes('funktion'));
assert('Legacy/Packet-Tracer-Kontext abgedeckt', allTexts.includes('packet-tracer') || allTexts.includes('cisco ios') || allTexts.includes('legacy'));

const exerciseIds = (lesson?.exercises || []).map((e) => e.id);
const dupEx = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco Packet Filter Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
