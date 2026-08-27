import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

const routerKey = topicKey('cisco-packet-tracer', 'router-basics');
const staticKey = topicKey('cisco-packet-tracer', 'static-routing');
const interVlanKey = topicKey('cisco-packet-tracer', 'inter-vlan-routing');
const keys = [routerKey, staticKey, interVlanKey];

const lessons = {
  router: LESSONS[routerKey],
  static: LESSONS[staticKey],
  interVlan: LESSONS[interVlanKey],
};

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco Router / Static Routing / Inter-VLAN Quality Audit ===');

for (const [name, lesson] of Object.entries(lessons)) {
  assert(`${name} Lesson existiert`, !!lesson);
  assert(`${name} hat Erklärungen`, (lesson?.explanations?.length || 0) > 0, `count=${lesson?.explanations?.length}`);
  assert(`${name} hat Übungen`, (lesson?.exercises?.length || 0) > 0, `count=${lesson?.exercises?.length}`);
  assert(`${name} hat Quiz`, (lesson?.quiz?.length || 0) > 0, `count=${lesson?.quiz?.length}`);
  assert(`${name} hat cliTasks`, (lesson?.cliTasks?.length || 0) > 0, `count=${lesson?.cliTasks?.length}`);
}

// Visualizations
for (const key of keys) {
  const visualIds = (LESSONS[key]?.explanations || []).filter((e) => e.style === 'visual').map((e) => e.id);
  assert(`${key} hat mindestens eine Visualisierung`, visualIds.length > 0, `visuals=${visualIds.join(',') || 'none'}`);
}

// Conversations
for (const key of keys) {
  const conv = CONVERSATION_TOPICS[key];
  assert(`${key} Conversation existiert`, !!conv);
  assert(`${key} Conversation hat Fragen`, (conv?.questions?.length || 0) >= 3, `count=${conv?.questions?.length}`);
}

// Knowledge Items per topic
const allKnowledge = getAllKnowledgeItems();
for (const key of keys) {
  const items = allKnowledge.filter((item) => item.topicKey === key);
  assert(`${key} Knowledge Items vorhanden`, items.length >= 3, `count=${items.length}`);
}

// Skill tree subskills
const routing = SKILL_TREE.cisco?.skills?.routing?.subskills || {};
assert('Skill Tree router_interface.configure', !!routing['router_interface.configure']);
assert('Skill Tree router_interface.verify', !!routing['router_interface.verify']);
assert('Skill Tree route_selection.longest_prefix_match', !!routing['route_selection.longest_prefix_match']);
assert('Skill Tree route_selection.administrative_distance', !!routing['route_selection.administrative_distance']);
assert('Skill Tree static_route.configure', !!routing['static_route.configure']);
assert('Skill Tree static_route.verify', !!routing['static_route.verify']);
assert('Skill Tree static_route.troubleshoot', !!routing['static_route.troubleshoot']);
assert('Skill Tree inter_vlan.subinterface', !!routing['inter_vlan.subinterface']);
assert('Skill Tree inter_vlan.encapsulation_dot1q', !!routing['inter_vlan.encapsulation_dot1q']);
assert('Skill Tree inter_vlan.verify', !!routing['inter_vlan.verify']);
assert('Skill Tree inter_vlan.troubleshoot', !!routing['inter_vlan.troubleshoot']);

const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const allSubskills = { ...routing };
const invalid = Object.values(allSubskills).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

// CLI engine sanity for key commands
assert('CLI-Engine normalisiert ip address', normalizeCiscoLine('ip address 10.0.0.1 255.255.255.0') === 'ip address 10.0.0.1 255.255.255.0');
assert('CLI-Engine normalisiert no shutdown', normalizeCiscoLine('no shutdown') === 'no shutdown');
assert('CLI-Engine normalisiert show ip interface brief', normalizeCiscoLine('sh ip int br') === 'show ip interface brief');
assert('CLI-Engine normalisiert show ip route', normalizeCiscoLine('sh ip route') === 'show ip route');
assert('CLI-Engine normalisiert ip route', normalizeCiscoLine('ip route 192.168.1.0 255.255.255.0 10.0.0.2') === 'ip route 192.168.1.0 255.255.255.0 10.0.0.2');
assert('CLI-Engine normalisiert encapsulation dot1q', normalizeCiscoLine('encapsulation dot1q 10') === 'encapsulation dot1q 10');

// Check key commands are covered in some lesson text or expected lines
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

function collectTexts(lesson) {
  const expText = (lesson?.explanations || []).flatMap((e) => e.blocks.map(stringifyBlock)).join(' ');
  const exText = (lesson?.exercises || []).map((e) => `${e.id} ${e.question} ${e.explanation}`).join(' ');
  const quizText = (lesson?.quiz || []).map((q) => `${q.question} ${q.explanation}`).join(' ');
  const cliText = (lesson?.cliTasks || []).map((t) => `${t.prompt} ${t.explanation}`).join(' ');
  return [expText, exText, quizText, cliText].join(' ').toLowerCase();
}

const allTexts = Object.values(lessons).map(collectTexts).join(' ');
assert('Befehl "ip address" abgedeckt', allTexts.includes('ip address'));
assert('Befehl "no shutdown" abgedeckt', allTexts.includes('no shutdown'));
assert('Befehl "ip route" abgedeckt', allTexts.includes('ip route'));
assert('Befehl "encapsulation dot1q" abgedeckt', allTexts.includes('encapsulation dot1q'));
assert('Verify-Befehl "show ip interface brief" abgedeckt', allTexts.includes('show ip interface brief'));
assert('Verify-Befehl "show ip route" abgedeckt', allTexts.includes('show ip route'));
assert('Longest Prefix Match abgedeckt', allTexts.includes('longest prefix'));
assert('Administrative Distance abgedeckt', allTexts.includes('administrative distance'));
assert('Rückweg / Return Path abgedeckt', allTexts.includes('rückweg') || allTexts.includes('return') || allTexts.includes('zurück'));
assert('Configured vs Active / Next Hop unreachable abgedeckt', allTexts.includes('next hop') && allTexts.includes('show ip route'));
assert('Default Route abgedeckt', allTexts.includes('0.0.0.0') || allTexts.includes('default route'));
assert('Inter-VLAN Trunk-Anforderung abgedeckt', allTexts.includes('trunk'));

// Duplicate IDs check
const exerciseIds = [];
Object.values(lessons).forEach((lesson) => (lesson?.exercises || []).forEach((e) => exerciseIds.push(e.id)));
const dupEx = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco Router / Static Routing / Inter-VLAN Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
