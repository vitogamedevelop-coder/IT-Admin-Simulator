import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

const vlanKey = topicKey('cisco-packet-tracer', 'vlan');
const accessKey = topicKey('cisco-packet-tracer', 'access-port');
const trunkKey = topicKey('cisco-packet-tracer', 'trunk');
const keys = [vlanKey, accessKey, trunkKey];

const lessons = {
  vlan: LESSONS[vlanKey],
  access: LESSONS[accessKey],
  trunk: LESSONS[trunkKey],
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

console.log('=== Cisco VLAN / Access / Trunk Quality Audit ===');

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
const switching = SKILL_TREE.cisco?.skills?.switching?.subskills || {};
assert('Skill Tree vlan.create', !!switching['vlan.create']);
assert('Skill Tree vlan.verify', !!switching['vlan.verify']);
assert('Skill Tree vlan.troubleshoot', !!switching['vlan.troubleshoot']);
assert('Skill Tree access_port.configure', !!switching['access_port.configure']);
assert('Skill Tree access_port.verify', !!switching['access_port.verify']);
assert('Skill Tree access_port.troubleshoot', !!switching['access_port.troubleshoot']);
assert('Skill Tree trunk.configure', !!switching['trunk.configure']);
assert('Skill Tree trunk.allowed_vlans', !!switching['trunk.allowed_vlans']);
assert('Skill Tree trunk.allowed_vlans_add_remove', !!switching['trunk.allowed_vlans_add_remove']);
assert('Skill Tree trunk.verify', !!switching['trunk.verify']);
assert('Skill Tree trunk.troubleshoot', !!switching['trunk.troubleshoot']);

const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const invalid = Object.values(switching).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

// CLI engine sanity for key commands
assert('CLI-Engine normalisiert show vlan brief', normalizeCiscoLine('sh vlan brief') === 'show vlan brief');
assert('CLI-Engine normalisiert show interfaces trunk', normalizeCiscoLine('sh int trunk') === 'show interfaces trunk');
assert('CLI-Engine normalisiert switchport access vlan', normalizeCiscoLine('sw access vlan 10') === 'switchport access vlan 10');
assert('CLI-Engine normalisiert switchport mode trunk', normalizeCiscoLine('sw mode trunk') === 'switchport mode trunk');

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
assert('Befehl "vlan <id>" abgedeckt', allTexts.includes('vlan <id>') || allTexts.includes('vlan ') || allTexts.includes('vlan 10'));
assert('Befehl "name <name>" abgedeckt', allTexts.includes('name <name>') || allTexts.includes('name '));
assert('Befehl "switchport mode access" abgedeckt', allTexts.includes('switchport mode access'));
assert('Befehl "switchport access vlan" abgedeckt', allTexts.includes('switchport access vlan'));
assert('Befehl "switchport mode trunk" abgedeckt', allTexts.includes('switchport mode trunk'));
assert('Befehl "switchport trunk allowed vlan" abgedeckt', allTexts.includes('switchport trunk allowed vlan'));
assert('Befehl "switchport trunk allowed vlan add" abgedeckt', allTexts.includes('switchport trunk allowed vlan add'));
assert('Befehl "switchport trunk native vlan" abgedeckt', allTexts.includes('switchport trunk native vlan'));
assert('Verify-Befehl "show vlan brief" abgedeckt', allTexts.includes('show vlan brief'));
assert('Verify-Befehl "show interfaces trunk" abgedeckt', allTexts.includes('show interfaces trunk'));
assert('Troubleshooting "allowed vs active" abgedeckt', allTexts.includes('allowed') && allTexts.includes('active'));
assert('Troubleshooting "native vlan mismatch" abgedeckt', allTexts.includes('mismatch') && allTexts.includes('native vlan'));

// Duplicate IDs check
const exerciseIds = [];
Object.values(lessons).forEach((lesson) => (lesson?.exercises || []).forEach((e) => exerciseIds.push(e.id)));
const dupEx = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco VLAN / Access / Trunk Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
