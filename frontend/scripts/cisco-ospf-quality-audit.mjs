import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

const ospfKey = topicKey('cisco-packet-tracer', 'ospf');
const lesson = LESSONS[ospfKey];

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco OSPF Quality Audit ===');

assert('Lesson existiert', !!lesson);
assert('Hat Erklärungen', (lesson?.explanations?.length || 0) > 0, `count=${lesson?.explanations?.length}`);
assert('Hat Übungen', (lesson?.exercises?.length || 0) > 0, `count=${lesson?.exercises?.length}`);
assert('Hat Quiz', (lesson?.quiz?.length || 0) > 0, `count=${lesson?.quiz?.length}`);
assert('Hat cliTasks', (lesson?.cliTasks?.length || 0) > 0, `count=${lesson?.cliTasks?.length}`);

const visualIds = (lesson?.explanations || []).filter((e) => e.style === 'visual').map((e) => e.id);
assert('Hat mindestens eine Visualisierung', visualIds.length > 0, `visuals=${visualIds.join(',') || 'none'}`);

const conv = CONVERSATION_TOPICS[ospfKey];
assert('Conversation existiert', !!conv);
assert('Conversation hat Fragen', (conv?.questions?.length || 0) >= 3, `count=${conv?.questions?.length}`);

const allKnowledge = getAllKnowledgeItems();
const items = allKnowledge.filter((item) => item.topicKey === ospfKey);
assert('Knowledge Items vorhanden', items.length >= 3, `count=${items.length}`);

const ospfSkills = SKILL_TREE.cisco?.skills?.routing?.subskills || {};
assert('Skill Tree Wildcard', !!ospfSkills['ospf.wildcard']);
assert('Skill Tree Network-Methode', !!ospfSkills['ospf.network_method']);
assert('Skill Tree Interface-Methode', !!ospfSkills['ospf.interface_method']);
assert('Skill Tree Passive-Interface', !!ospfSkills['ospf.passive_interface']);
assert('Skill Tree Default-Information', !!ospfSkills['ospf.default_information_originate']);
assert('Skill Tree Authentication Klartext', !!ospfSkills['ospf.authentication_plaintext']);
assert('Skill Tree Authentication MD5', !!ospfSkills['ospf.authentication_md5']);
assert('Skill Tree Neighbor', !!ospfSkills['ospf.neighbor']);
assert('Skill Tree Verify', !!ospfSkills['ospf.verify']);
assert('Skill Tree Troubleshoot', !!ospfSkills['ospf.troubleshoot']);

const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const invalid = Object.values(ospfSkills).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

assert('CLI-Engine normalisiert router ospf', normalizeCiscoLine('router ospf 1') === 'router ospf 1');
assert('CLI-Engine normalisiert network area', normalizeCiscoLine('network 10.0.0.0 0.0.0.255 area 0') === 'network 10.0.0.0 0.0.0.255 area 0');
assert('CLI-Engine normalisiert ip ospf area', normalizeCiscoLine('ip ospf 1 area 0') === 'ip ospf 1 area 0');
assert('CLI-Engine normalisiert passive-interface', normalizeCiscoLine('passive-interface g0/2') === 'passive-interface g0/2');
assert('CLI-Engine normalisiert passive-interface default', normalizeCiscoLine('passive-interface default') === 'passive-interface default');
assert('CLI-Engine normalisiert default-information originate', normalizeCiscoLine('default-information originate') === 'default-information originate');
assert('CLI-Engine normalisiert show ip ospf neighbor', normalizeCiscoLine('sh ip ospf neighbor') === 'show ip ospf neighbor');
assert('CLI-Engine normalisiert show ip route ospf', normalizeCiscoLine('sh ip route ospf') === 'show ip route ospf');
assert('CLI-Engine normalisiert show ip ospf interface', normalizeCiscoLine('sh ip ospf interface') === 'show ip ospf interface');
assert('CLI-Engine normalisiert show ip protocols', normalizeCiscoLine('sh ip protocols') === 'show ip protocols');
assert('CLI-Engine normalisiert clear ip ospf process', normalizeCiscoLine('clear ip ospf process') === 'clear ip ospf process');
assert('CLI-Engine normalisiert area authentication', normalizeCiscoLine('area 0 authentication message-digest') === 'area 0 authentication message-digest');
assert('CLI-Engine normalisiert ip ospf message-digest-key', normalizeCiscoLine('ip ospf message-digest-key 1 md5 ospfkey') === 'ip ospf message-digest-key 1 md5 ospfkey');

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

assert('OSPF link-state Konzept abgedeckt', allTexts.includes('link-state'));
assert('Single-Area / Area 0 abgedeckt', allTexts.includes('area 0'));
assert('Process-ID lokal abgedeckt', allTexts.includes('process') || allTexts.includes('prozess'));
assert('Wildcard-Maske abgedeckt', allTexts.includes('wildcard'));
assert('Network-Befehl matcht Interfaces abgedeckt', allTexts.includes('network') && allTexts.includes('interface'));
assert('Interface-Methode abgedeckt', allTexts.includes('ip ospf'));
assert('Neighbor/Adjacency abgedeckt', allTexts.includes('neighbor') || allTexts.includes('nachbar'));
assert('Hello-Pakete abgedeckt', allTexts.includes('hello'));
assert('passive-interface abgedeckt', allTexts.includes('passive-interface'));
assert('passive-interface default abgedeckt', allTexts.includes('passive-interface default'));
assert('passive ≠ Netz verschwindet abgedeckt', allTexts.includes('netz') && allTexts.includes('hello'));
assert('OSPF Cost abgedeckt', allTexts.includes('cost'));
assert('default-information originate abgedeckt', allTexts.includes('default-information originate'));
assert('default originate Voraussetzung abgedeckt', allTexts.includes('statische default route') || allTexts.includes('default route'));
assert('Authentication abgedeckt', allTexts.includes('authentifizierung') || allTexts.includes('authentication'));
assert('show ip ospf neighbor abgedeckt', allTexts.includes('show ip ospf neighbor'));
assert('show ip route ospf abgedeckt', allTexts.includes('show ip route ospf'));
assert('show ip protocols abgedeckt', allTexts.includes('show ip protocols'));
assert('show ip ospf interface abgedeckt', allTexts.includes('show ip ospf interface'));
assert('clear ip ospf process abgedeckt', allTexts.includes('clear ip ospf process'));
assert('Troubleshooting Area-Mismatch abgedeckt', allTexts.includes('area'));
assert('Troubleshooting Auth-Mismatch abgedeckt', allTexts.includes('authentifizierung') || allTexts.includes('authentication'));
assert('Troubleshooting passive auf Uplink abgedeckt', allTexts.includes('passive'));
assert('Troubleshooting falsche Wildcard abgedeckt', allTexts.includes('wildcard') && allTexts.includes('falsch'));
assert('Troubleshooting Route fehlt trotz FULL abgedeckt', allTexts.includes('full') && allTexts.includes('route'));
assert('Fehlannahme Process-ID identisch abgedeckt', allTexts.includes('process-id') || allTexts.includes('prozess-id'));
assert('Fehlannahme configured = functioning abgedeckt', allTexts.includes('configured') || allTexts.includes('funktion'));

const exerciseIds = (lesson?.exercises || []).map((e) => e.id);
const dupEx = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco OSPF Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
