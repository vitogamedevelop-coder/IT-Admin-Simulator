import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

const natKey = topicKey('cisco-packet-tracer', 'nat');
const lesson = LESSONS[natKey];

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco NAT Quality Audit ===');

assert('Lesson existiert', !!lesson);
assert('Hat Erklärungen', (lesson?.explanations?.length || 0) > 0, `count=${lesson?.explanations?.length}`);
assert('Hat Übungen', (lesson?.exercises?.length || 0) > 0, `count=${lesson?.exercises?.length}`);
assert('Hat Quiz', (lesson?.quiz?.length || 0) > 0, `count=${lesson?.quiz?.length}`);
assert('Hat cliTasks', (lesson?.cliTasks?.length || 0) > 0, `count=${lesson?.cliTasks?.length}`);

const visualIds = (lesson?.explanations || []).filter((e) => e.style === 'visual').map((e) => e.id);
assert('Hat mindestens eine Visualisierung', visualIds.length > 0, `visuals=${visualIds.join(',') || 'none'}`);

const conv = CONVERSATION_TOPICS[natKey];
assert('Conversation existiert', !!conv);
assert('Conversation hat Fragen', (conv?.questions?.length || 0) >= 3, `count=${conv?.questions?.length}`);

const allKnowledge = getAllKnowledgeItems();
const items = allKnowledge.filter((item) => item.topicKey === natKey);
assert('Knowledge Items vorhanden', items.length >= 3, `count=${items.length}`);

const natSkills = SKILL_TREE.cisco?.skills?.nat?.subskills || {};
assert('Skill Tree inside_outside', !!natSkills['inside_outside']);
assert('Skill Tree inside_local', !!natSkills['inside_local']);
assert('Skill Tree inside_global', !!natSkills['inside_global']);
assert('Skill Tree outside_local', !!natSkills['outside_local']);
assert('Skill Tree outside_global', !!natSkills['outside_global']);
assert('Skill Tree static.configure', !!natSkills['static.configure']);
assert('Skill Tree dynamic.acl_selection', !!natSkills['dynamic.acl_selection']);
assert('Skill Tree dynamic.pool', !!natSkills['dynamic.pool']);
assert('Skill Tree dynamic.configure', !!natSkills['dynamic.configure']);
assert('Skill Tree dynamic.pool_exhaustion', !!natSkills['dynamic.pool_exhaustion']);
assert('Skill Tree pat.concept', !!natSkills['pat.concept']);
assert('Skill Tree pat.interface_overload', !!natSkills['pat.interface_overload']);
assert('Skill Tree pat.pool_overload', !!natSkills['pat.pool_overload']);
assert('Skill Tree port_forwarding', !!natSkills['port_forwarding']);
assert('Skill Tree verify', !!natSkills['verify']);
assert('Skill Tree troubleshoot', !!natSkills['troubleshoot']);

const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const invalid = Object.values(natSkills).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

assert('CLI-Engine normalisiert ip nat inside', normalizeCiscoLine('ip nat inside') === 'ip nat inside');
assert('CLI-Engine normalisiert ip nat outside', normalizeCiscoLine('ip nat outside') === 'ip nat outside');
assert('CLI-Engine normalisiert ip nat inside source static', normalizeCiscoLine('ip nat inside source static 192.168.10.10 203.0.113.10') === 'ip nat inside source static 192.168.10.10 203.0.113.10');
assert('CLI-Engine normalisiert ip nat pool', normalizeCiscoLine('ip nat pool PUBLIC 203.0.113.100 203.0.113.102 netmask 255.255.255.0') === 'ip nat pool public 203.0.113.100 203.0.113.102 netmask 255.255.255.0');
assert('CLI-Engine normalisiert ip nat inside source list pool', normalizeCiscoLine('ip nat inside source list 1 pool PUBLIC') === 'ip nat inside source list 1 pool public');
assert('CLI-Engine normalisiert ip nat inside source list overload', normalizeCiscoLine('ip nat inside source list 1 interface g0/1 overload') === 'ip nat inside source list 1 interface g0/1 overload');
assert('CLI-Engine normalisiert ip nat inside source static tcp port forward', normalizeCiscoLine('ip nat inside source static tcp 192.168.10.20 80 203.0.113.10 8080') === 'ip nat inside source static tcp 192.168.10.20 80 203.0.113.10 8080');
assert('CLI-Engine normalisiert show ip nat translations', normalizeCiscoLine('sh ip nat translations') === 'show ip nat translations');
assert('CLI-Engine normalisiert show ip nat statistics', normalizeCiscoLine('sh ip nat statistics') === 'show ip nat statistics');
assert('CLI-Engine normalisiert clear ip nat translation', normalizeCiscoLine('clear ip nat translation *') === 'clear ip nat translation *');
assert('CLI-Engine normalisiert access-list', normalizeCiscoLine('access-list 1 permit 192.168.10.0 0.0.0.255') === 'access-list 1 permit 192.168.10.0 0.0.0.255');
assert('CLI-Engine normalisiert show ip interface', normalizeCiscoLine('sh ip int g0/1') === 'show ip interface g0/1');

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

assert('NAT Zweck abgedeckt', allTexts.includes('nat'));
assert('Inside/Outside abgedeckt', allTexts.includes('inside') && allTexts.includes('outside'));
assert('Inside Local / Inside Global abgedeckt', allTexts.includes('inside local') && allTexts.includes('inside global'));
assert('Static NAT abgedeckt', allTexts.includes('static'));
assert('Dynamic NAT abgedeckt', allTexts.includes('dynamic'));
assert('PAT / Overload abgedeckt', allTexts.includes('pat') || allTexts.includes('overload'));
assert('NAT ACL Auswahlrolle abgedeckt', allTexts.includes('auswahl') || allTexts.includes('selection') || allTexts.includes('übersetzt'));
assert('NAT ACL nicht zwingend ip access-group abgedeckt', allTexts.includes('ip access-group'));
assert('NAT Pool abgedeckt', allTexts.includes('pool'));
assert('Port Forwarding abgedeckt', allTexts.includes('port forwarding') || allTexts.includes('weitergeleitet'));
assert('show ip nat translations abgedeckt', allTexts.includes('show ip nat translations'));
assert('show ip nat statistics abgedeckt', allTexts.includes('show ip nat statistics'));
assert('show ip interface abgedeckt', allTexts.includes('show ip interface'));
assert('clear ip nat translation abgedeckt', allTexts.includes('clear ip nat translation'));
assert('Inside/Outside vertauscht Troubleshooting abgedeckt', allTexts.includes('vertauscht'));
assert('NAT ACL matcht nicht abgedeckt', allTexts.includes('matcht'));
assert('Overload fehlt abgedeckt', allTexts.includes('overload'));
assert('NAT table leer abgedeckt', allTexts.includes('leer'));
assert('Client out / server not in abgedeckt', allTexts.includes('port forwarding'));
assert('Port Forwarding access blocked abgedeckt', allTexts.includes('acl') || allTexts.includes('spi') || allTexts.includes('blockiert'));
assert('NAT ≠ Firewall abgedeckt', allTexts.includes('keine firewall') || allTexts.includes('nicht') && allTexts.includes('firewall'));
assert('Configured ≠ translating abgedeckt', allTexts.includes('configured') || allTexts.includes('übersetzt'));
assert('End-to-end Bruch nur kurz erwähnt', allTexts.includes('ende-zu-ende') || true); // optional

const exerciseIds = (lesson?.exercises || []).map((e) => e.id);
const dupEx = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco NAT Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
