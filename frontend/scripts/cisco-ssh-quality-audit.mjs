import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

const sshKey = topicKey('cisco-packet-tracer', 'ssh');
const lesson = LESSONS[sshKey];

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco SSH Quality Audit ===');

assert('Lesson existiert', !!lesson);
assert('Hat Erklärungen', (lesson?.explanations?.length || 0) > 0, `count=${lesson?.explanations?.length}`);
assert('Hat Übungen', (lesson?.exercises?.length || 0) > 0, `count=${lesson?.exercises?.length}`);
assert('Hat Quiz', (lesson?.quiz?.length || 0) > 0, `count=${lesson?.quiz?.length}`);
assert('Hat cliTasks', (lesson?.cliTasks?.length || 0) > 0, `count=${lesson?.cliTasks?.length}`);

const visualIds = (lesson?.explanations || []).filter((e) => e.style === 'visual').map((e) => e.id);
assert('Hat mindestens eine Visualisierung', visualIds.length > 0, `visuals=${visualIds.join(',') || 'none'}`);

const conv = CONVERSATION_TOPICS[sshKey];
assert('Conversation existiert', !!conv);
assert('Conversation hat Fragen', (conv?.questions?.length || 0) >= 3, `count=${conv?.questions?.length}`);

const allKnowledge = getAllKnowledgeItems();
const items = allKnowledge.filter((item) => item.topicKey === sshKey);
assert('Knowledge Items vorhanden', items.length >= 3, `count=${items.length}`);

const sshSkills = SKILL_TREE.cisco?.skills?.remote_administration?.subskills || {};
assert('Skill Tree telnet_vs_ssh', !!sshSkills['telnet_vs_ssh']);
assert('Skill Tree hostname_domain_dependency', !!sshSkills['hostname_domain_dependency']);
assert('Skill Tree rsa_keys', !!sshSkills['rsa_keys']);
assert('Skill Tree ssh_version', !!sshSkills['ssh_version']);
assert('Skill Tree local_user', !!sshSkills['local_user']);
assert('Skill Tree vty_login_local', !!sshSkills['vty_login_local']);
assert('Skill Tree vty_transport_ssh', !!sshSkills['vty_transport_ssh']);
assert('Skill Tree management_svi', !!sshSkills['management_svi']);
assert('Skill Tree ssh_connect', !!sshSkills['ssh_connect']);
assert('Skill Tree verify', !!sshSkills['verify']);
assert('Skill Tree troubleshoot', !!sshSkills['troubleshoot']);

const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const invalid = Object.values(sshSkills).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

assert('CLI-Engine normalisiert crypto key generate rsa', normalizeCiscoLine('crypto key generate rsa') === 'crypto key generate rsa');
assert('CLI-Engine normalisiert crypto key zeroize rsa', normalizeCiscoLine('crypto key zeroize rsa') === 'crypto key zeroize rsa');
assert('CLI-Engine normalisiert ip ssh version 2', normalizeCiscoLine('ip ssh version 2') === 'ip ssh version 2');
assert('CLI-Engine normalisiert line vty 0 15', normalizeCiscoLine('line vty 0 15') === 'line vty 0 15');
assert('CLI-Engine normalisiert transport input ssh', normalizeCiscoLine('transport input ssh') === 'transport input ssh');
assert('CLI-Engine normalisiert login local', normalizeCiscoLine('login local') === 'login local');
assert('CLI-Engine normalisiert show ip ssh', normalizeCiscoLine('sh ip ssh') === 'show ip ssh');
assert('CLI-Engine normalisiert show crypto key mypubkey rsa', normalizeCiscoLine('show crypto key mypubkey rsa') === 'show crypto key mypubkey rsa');
assert('CLI-Engine normalisiert ip default-gateway', normalizeCiscoLine('ip default-gateway 192.168.99.1') === 'ip default-gateway 192.168.99.1');
assert('CLI-Engine normalisiert ssh -l', normalizeCiscoLine('ssh -l admin 192.168.100.254') === 'ssh -l admin 192.168.100.254');

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

assert('SSH vs Telnet abgedeckt', allTexts.includes('telnet') && allTexts.includes('ssh'));
assert('TCP 22 / Port 22 abgedeckt', allTexts.includes('22'));
assert('SSHv2 abgedeckt', allTexts.includes('ip ssh version 2'));
assert('crypto key generate rsa abgedeckt', allTexts.includes('crypto key generate rsa'));
assert('Hostname + Domain Abhängigkeit abgedeckt', allTexts.includes('hostname') && allTexts.includes('domain'));
assert('username secret abgedeckt', allTexts.includes('username') && allTexts.includes('secret'));
assert('line vty abgedeckt', allTexts.includes('line vty'));
assert('login local abgedeckt', allTexts.includes('login local'));
assert('transport input ssh abgedeckt', allTexts.includes('transport input ssh'));
assert('Management-SVI abgedeckt', allTexts.includes('interface vlan') || allTexts.includes('svi'));
assert('L2-Switch Default Gateway abgedeckt', allTexts.includes('ip default-gateway'));
assert('Router MLS Unterschied abgedeckt', allTexts.includes('router') && allTexts.includes('multilayer'));
assert('Verify show ip ssh abgedeckt', allTexts.includes('show ip ssh'));
assert('Verify show crypto key mypubkey rsa abgedeckt', allTexts.includes('show crypto key mypubkey rsa'));
assert('Verify show running-config | include vty abgedeckt', allTexts.includes('show running-config'));
assert('Verify show ip interface brief abgedeckt', allTexts.includes('show ip interface brief'));
assert('crypto key zeroize rsa abgedeckt', allTexts.includes('crypto key zeroize rsa'));
assert('Troubleshooting SSH disabled abgedeckt', allTexts.includes('ssh disabled') || allTexts.includes('disabled'));
assert('Troubleshooting Telnet still allowed abgedeckt', allTexts.includes('telnet'));
assert('SSH Client Syntax abgedeckt', allTexts.includes('ssh -l'));

const exerciseIds = (lesson?.exercises || []).map((e) => e.id);
const dupEx = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco SSH Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
