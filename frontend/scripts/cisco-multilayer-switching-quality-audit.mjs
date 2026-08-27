import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

const mlsKey = topicKey('cisco-packet-tracer', 'multilayer-switching');
const lesson = LESSONS[mlsKey];

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco Multilayer-Switching Quality Audit ===');

assert('Lesson existiert', !!lesson);
assert('Hat Erklärungen', (lesson?.explanations?.length || 0) > 0, `count=${lesson?.explanations?.length}`);
assert('Hat Übungen', (lesson?.exercises?.length || 0) > 0, `count=${lesson?.exercises?.length}`);
assert('Hat Quiz', (lesson?.quiz?.length || 0) > 0, `count=${lesson?.quiz?.length}`);
assert('Hat cliTasks', (lesson?.cliTasks?.length || 0) > 0, `count=${lesson?.cliTasks?.length}`);

const visualIds = (lesson?.explanations || []).filter((e) => e.style === 'visual').map((e) => e.id);
assert('Hat mindestens eine Visualisierung', visualIds.length > 0, `visuals=${visualIds.join(',') || 'none'}`);

const conv = CONVERSATION_TOPICS[mlsKey];
assert('Conversation existiert', !!conv);
assert('Conversation hat Fragen', (conv?.questions?.length || 0) >= 3, `count=${conv?.questions?.length}`);

const allKnowledge = getAllKnowledgeItems();
const items = allKnowledge.filter((item) => item.topicKey === mlsKey);
assert('Knowledge Items vorhanden', items.length >= 3, `count=${items.length}`);

const mlsSkills = SKILL_TREE.cisco?.skills?.multilayer_switching?.subskills || {};
assert('Skill Tree svi_create', !!mlsSkills['svi_create']);
assert('Skill Tree svi_ip', !!mlsSkills['svi_ip']);
assert('Skill Tree ip_routing', !!mlsSkills['ip_routing']);
assert('Skill Tree routed_port', !!mlsSkills['routed_port']);
assert('Skill Tree verify', !!mlsSkills['verify']);
assert('Skill Tree troubleshoot', !!mlsSkills['troubleshoot']);

const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const invalid = Object.values(mlsSkills).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

assert('CLI-Engine normalisiert ip routing', normalizeCiscoLine('ip routing') === 'ip routing');
assert('CLI-Engine normalisiert no switchport', normalizeCiscoLine('no switchport') === 'no switchport');
assert('CLI-Engine normalisiert switchport', normalizeCiscoLine('switchport') === 'switchport');
assert('CLI-Engine normalisiert interface vlan', normalizeCiscoLine('interface vlan 10') === 'interface vlan 10');
assert('CLI-Engine normalisiert show ip interface brief', normalizeCiscoLine('sh ip int br') === 'show ip interface brief');
assert('CLI-Engine normalisiert show ip route', normalizeCiscoLine('sh ip route') === 'show ip route');
assert('CLI-Engine normalisiert no shutdown', normalizeCiscoLine('no shutdown') === 'no shutdown');
assert('CLI-Engine normalisiert ip route', normalizeCiscoLine('ip route 0.0.0.0 0.0.0.0 203.0.113.1') === 'ip route 0.0.0.0 0.0.0.0 203.0.113.1');

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

assert('Befehl "ip routing" abgedeckt', allTexts.includes('ip routing'));
assert('Befehl "interface vlan" abgedeckt', allTexts.includes('interface vlan'));
assert('Befehl "no switchport" abgedeckt', allTexts.includes('no switchport'));
assert('Befehl "switchport" (Restore) abgedeckt', allTexts.includes('switchport'));
assert('Befehl "ip address" abgedeckt', allTexts.includes('ip address'));
assert('Verify-Befehl "show ip interface brief" abgedeckt', allTexts.includes('show ip interface brief'));
assert('Verify-Befehl "show ip route" abgedeckt', allTexts.includes('show ip route'));
assert('Verify-Befehl "show interfaces status" abgedeckt', allTexts.includes('show interfaces status'));
assert('Routed Port Konzept abgedeckt', allTexts.includes('routed port'));
assert('SVI vs VLAN-Existenz abgedeckt', allTexts.includes('vlan') && allTexts.includes('svi'));
assert('End-to-End-Verify / Gateway-Ping-Fehlannahme abgedeckt', allTexts.includes('end-to-end') || allTexts.includes('gateway-ping') || allTexts.includes('gateway ping') || allTexts.includes('nur die lokale svi'));
assert('Default Gateway vs Default Route abgedeckt', (allTexts.includes('ip default-gateway') || allTexts.includes('default gateway')) && allTexts.includes('default route'));
assert('Router-on-a-Stick-Abgrenzung abgedeckt', allTexts.includes('router-on-a-stick') || allTexts.includes('roas') || allTexts.includes('router on a stick'));

const exerciseIds = (lesson?.exercises || []).map((e) => e.id);
const dupEx = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco Multilayer-Switching Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
