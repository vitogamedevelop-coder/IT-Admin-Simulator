import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

const dhcpKey = topicKey('cisco-packet-tracer', 'dhcp');
const lesson = LESSONS[dhcpKey];

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco DHCP Quality Audit ===');

assert('Lesson existiert', !!lesson);
assert('Hat Erklärungen', (lesson?.explanations?.length || 0) > 0, `count=${lesson?.explanations?.length}`);
assert('Hat Übungen', (lesson?.exercises?.length || 0) > 0, `count=${lesson?.exercises?.length}`);
assert('Hat Quiz', (lesson?.quiz?.length || 0) > 0, `count=${lesson?.quiz?.length}`);
assert('Hat cliTasks', (lesson?.cliTasks?.length || 0) > 0, `count=${lesson?.cliTasks?.length}`);

const visualIds = (lesson?.explanations || []).filter((e) => e.style === 'visual').map((e) => e.id);
assert('Hat mindestens eine Visualisierung', visualIds.length > 0, `visuals=${visualIds.join(',') || 'none'}`);

const conv = CONVERSATION_TOPICS[dhcpKey];
assert('Conversation existiert', !!conv);
assert('Conversation hat Fragen', (conv?.questions?.length || 0) >= 3, `count=${conv?.questions?.length}`);

const allKnowledge = getAllKnowledgeItems();
const items = allKnowledge.filter((item) => item.topicKey === dhcpKey);
assert('Knowledge Items vorhanden', items.length >= 3, `count=${items.length}`);

const dhcpSkills = SKILL_TREE.cisco?.skills?.dhcp?.subskills || {};
assert('Skill Tree relay_concept', !!dhcpSkills['relay_concept']);
assert('Skill Tree helper_address', !!dhcpSkills['helper_address']);
assert('Skill Tree relay_interface_choice', !!dhcpSkills['relay_interface_choice']);
assert('Skill Tree server_simulation', !!dhcpSkills['server_simulation']);
assert('Skill Tree verify', !!dhcpSkills['verify']);
assert('Skill Tree troubleshoot', !!dhcpSkills['troubleshoot']);

const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const invalid = Object.values(dhcpSkills).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

assert('CLI-Engine normalisiert ip helper-address', normalizeCiscoLine('ip helper-address 10.0.0.2') === 'ip helper-address 10.0.0.2');
assert('CLI-Engine normalisiert show ip interface', normalizeCiscoLine('sh ip interface fa0/0') === 'show ip interface fa0/0');
assert('CLI-Engine normalisiert show running-config | include helper', normalizeCiscoLine('sh run | include helper') === 'show running-config | include helper');
assert('CLI-Engine normalisiert show ip route', normalizeCiscoLine('sh ip route') === 'show ip route');
assert('CLI-Engine normalisiert no ip helper-address', normalizeCiscoLine('no ip helper-address 10.0.0.2') === 'no ip helper-address 10.0.0.2');
assert('CLI-Engine normalisiert ip dhcp excluded-address', normalizeCiscoLine('ip dhcp excluded-address 192.168.1.1 192.168.1.10') === 'ip dhcp excluded-address 192.168.1.1 192.168.1.10');
assert('CLI-Engine normalisiert ip dhcp pool', normalizeCiscoLine('ip dhcp pool POOL1') === 'ip dhcp pool pool1');
assert('CLI-Engine normalisiert default-router', normalizeCiscoLine('default-router 192.168.1.1') === 'default-router 192.168.1.1');
assert('CLI-Engine normalisiert dns-server', normalizeCiscoLine('dns-server 8.8.8.8') === 'dns-server 8.8.8.8');
assert('CLI-Engine normalisiert ip address dhcp', normalizeCiscoLine('ip address dhcp') === 'ip address dhcp');
assert('CLI-Engine normalisiert show ip dhcp binding', normalizeCiscoLine('sh ip dhcp binding') === 'show ip dhcp binding');
assert('CLI-Engine normalisiert show ip dhcp pool', normalizeCiscoLine('sh ip dhcp pool') === 'show ip dhcp pool');

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

assert('DHCP Relay Konzept abgedeckt', allTexts.includes('relay') && allTexts.includes('broadcast'));
assert('ip helper-address abgedeckt', allTexts.includes('ip helper-address'));
assert('Helper auf Gateway-Interface des Client-Netzes abgedeckt', allTexts.includes('gateway') && allTexts.includes('client-netz'));
assert('Falsches Interface Szenario abgedeckt', allTexts.includes('falsch'));
assert('Falsche Server-IP Szenario abgedeckt', allTexts.includes('server-ip') || allTexts.includes('dhcp-server-ip'));
assert('Routing-Abhängigkeit abgedeckt', allTexts.includes('route'));
assert('Multi-VLAN abgedeckt', allTexts.includes('vlan 10') && allTexts.includes('vlan 20'));
assert('Physisches Interface abgedeckt', allTexts.includes('physisches interface') || allTexts.includes('fa0/0'));
assert('Router-on-a-Stick abgedeckt', allTexts.includes('router on a stick') || allTexts.includes('subinterface'));
assert('Multilayer-Switch / SVI abgedeckt', allTexts.includes('svi') || allTexts.includes('interface vlan'));
assert('show ip interface brief abgedeckt', allTexts.includes('show ip interface brief'));
assert('show ip interface <Interface> abgedeckt', allTexts.includes('show ip interface'));
assert('show running-config | include helper abgedeckt', allTexts.includes('show running-config'));
assert('show ip route abgedeckt', allTexts.includes('show ip route'));
assert('Packet Tracer DHCP Server Pool abgedeckt', allTexts.includes('default gateway') && allTexts.includes('pool'));
assert('Optional Cisco DHCP Server abgedeckt', allTexts.includes('ip dhcp pool'));
assert('Optional excluded-address abgedeckt', allTexts.includes('excluded-address'));
assert('Optional ip address dhcp abgedeckt', allTexts.includes('ip address dhcp'));
assert('Optional show ip dhcp binding/pool abgedeckt', allTexts.includes('show ip dhcp binding') && allTexts.includes('show ip dhcp pool'));

const exerciseIds = (lesson?.exercises || []).map((e) => e.id);
const dupEx = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco DHCP Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
