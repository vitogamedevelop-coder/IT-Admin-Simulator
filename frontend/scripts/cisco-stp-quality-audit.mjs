import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

const stpKey = topicKey('cisco-packet-tracer', 'stp');
const lesson = LESSONS[stpKey];

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco STP Quality Audit ===');

assert('Lesson existiert', !!lesson);
assert('Hat Erklärungen', (lesson?.explanations?.length || 0) > 0, `count=${lesson?.explanations?.length}`);
assert('Hat Übungen', (lesson?.exercises?.length || 0) > 0, `count=${lesson?.exercises?.length}`);
assert('Hat Quiz', (lesson?.quiz?.length || 0) > 0, `count=${lesson?.quiz?.length}`);
assert('Hat cliTasks', (lesson?.cliTasks?.length || 0) > 0, `count=${lesson?.cliTasks?.length}`);

const visualIds = (lesson?.explanations || []).filter((e) => e.style === 'visual').map((e) => e.id);
assert('Hat mindestens eine Visualisierung', visualIds.length > 0, `visuals=${visualIds.join(',') || 'none'}`);

const conv = CONVERSATION_TOPICS[stpKey];
assert('Conversation existiert', !!conv);
assert('Conversation hat Fragen', (conv?.questions?.length || 0) >= 3, `count=${conv?.questions?.length}`);

const allKnowledge = getAllKnowledgeItems();
const items = allKnowledge.filter((item) => item.topicKey === stpKey);
assert('Knowledge Items vorhanden', items.length >= 3, `count=${items.length}`);

const stpSkills = SKILL_TREE.cisco?.skills?.stp?.subskills || {};
assert('Skill Tree loop_problem', !!stpSkills['loop_problem']);
assert('Skill Tree bridge_id', !!stpSkills['bridge_id']);
assert('Skill Tree root_election', !!stpSkills['root_election']);
assert('Skill Tree root_primary_secondary', !!stpSkills['root_primary_secondary']);
assert('Skill Tree port_roles', !!stpSkills['port_roles']);
assert('Skill Tree path_cost', !!stpSkills['path_cost']);
assert('Skill Tree port_states', !!stpSkills['port_states']);
assert('Skill Tree portfast', !!stpSkills['portfast']);
assert('Skill Tree bpdu_guard', !!stpSkills['bpdu_guard']);

const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const invalid = Object.values(stpSkills).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

assert('CLI-Engine normalisiert spanning-tree', normalizeCiscoLine('spanning-tree vlan 10 root primary') === 'spanning-tree vlan 10 root primary');
assert('CLI-Engine normalisiert spanning-tree portfast', normalizeCiscoLine('spanning-tree portfast') === 'spanning-tree portfast');
assert('CLI-Engine normalisiert spanning-tree bpduguard enable', normalizeCiscoLine('spanning-tree bpduguard enable') === 'spanning-tree bpduguard enable');
assert('CLI-Engine normalisiert show spanning-tree', normalizeCiscoLine('sh spanning-tree') === 'show spanning-tree');
assert('CLI-Engine normalisiert show spanning-tree summary', normalizeCiscoLine('sh spanning-tree summary') === 'show spanning-tree summary');
assert('CLI-Engine normalisiert shutdown/no shutdown', normalizeCiscoLine('shutdown') === 'shutdown');

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

assert('Befehl "spanning-tree vlan ... priority" abgedeckt', allTexts.includes('priority'));
assert('Befehl "spanning-tree vlan ... root primary/secondary" abgedeckt', allTexts.includes('root primary') && allTexts.includes('root secondary'));
assert('Befehl "spanning-tree portfast" abgedeckt', allTexts.includes('portfast'));
assert('Befehl "spanning-tree bpduguard enable" abgedeckt', allTexts.includes('bpduguard'));
assert('Verify-Befehl "show spanning-tree" abgedeckt', allTexts.includes('show spanning-tree'));
assert('Verify-Befehl "show spanning-tree vlan" abgedeckt', allTexts.includes('show spanning-tree vlan'));
assert('Verify-Befehl "show spanning-tree summary" abgedeckt', allTexts.includes('show spanning-tree summary'));
assert('Verify-Befehl "show spanning-tree detail" abgedeckt', allTexts.includes('show spanning-tree detail'));
assert('Verify-Befehl "show interfaces status" abgedeckt', allTexts.includes('show interfaces status'));
assert('Konzept "Root Bridge" abgedeckt', allTexts.includes('root bridge'));
assert('Konzept "Bridge ID" abgedeckt', allTexts.includes('bridge id'));
assert('Konzept "Root Port" abgedeckt', allTexts.includes('root port'));
assert('Konzept "Designated Port" abgedeckt', allTexts.includes('designated port'));
assert('Konzept "Alternate Port" abgedeckt', allTexts.includes('alternate'));
assert('Konzept "Blocking" abgedeckt', allTexts.includes('blocking'));
assert('Konzept "PVST+" abgedeckt', allTexts.includes('pvst'));
assert('Konzept "err-disabled" abgedeckt', allTexts.includes('err-disabled') || allTexts.includes('err disabled'));
assert('Konzept "Role vs State" abgedeckt', allTexts.includes('rolle') && allTexts.includes('zustand'));
assert('Fehlannahme PortFast auf Uplink abgedeckt', allTexts.includes('uplink') || allTexts.includes('switch-zu-switch'));
assert('Recovery shutdown/no shutdown abgedeckt', allTexts.includes('shutdown') && allTexts.includes('no shutdown'));

const exerciseIds = (lesson?.exercises || []).map((e) => e.id);
const dupEx = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco STP Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
