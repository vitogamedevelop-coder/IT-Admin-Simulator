import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

const aclKey = topicKey('cisco-packet-tracer', 'acl');
const lesson = LESSONS[aclKey];

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco ACL Quality Audit ===');

assert('Lesson existiert', !!lesson);
assert('Hat Erklärungen', (lesson?.explanations?.length || 0) > 0, `count=${lesson?.explanations?.length}`);
assert('Hat Übungen', (lesson?.exercises?.length || 0) > 0, `count=${lesson?.exercises?.length}`);
assert('Hat Quiz', (lesson?.quiz?.length || 0) > 0, `count=${lesson?.quiz?.length}`);
assert('Hat cliTasks', (lesson?.cliTasks?.length || 0) > 0, `count=${lesson?.cliTasks?.length}`);

const visualIds = (lesson?.explanations || []).filter((e) => e.style === 'visual').map((e) => e.id);
assert('Hat mindestens eine Visualisierung', visualIds.length > 0, `visuals=${visualIds.join(',') || 'none'}`);

const conv = CONVERSATION_TOPICS[aclKey];
assert('Conversation existiert', !!conv);
assert('Conversation hat Fragen', (conv?.questions?.length || 0) >= 3, `count=${conv?.questions?.length}`);

const allKnowledge = getAllKnowledgeItems();
const items = allKnowledge.filter((item) => item.topicKey === aclKey);
assert('Knowledge Items vorhanden', items.length >= 3, `count=${items.length}`);

const aclSkills = SKILL_TREE.cisco?.skills?.acl?.subskills || {};
assert('Skill Tree first_match', !!aclSkills['first_match']);
assert('Skill Tree implicit_deny', !!aclSkills['implicit_deny']);
assert('Skill Tree wildcard', !!aclSkills['wildcard']);
assert('Skill Tree host_any', !!aclSkills['host_any']);
assert('Skill Tree standard.numbered', !!aclSkills['standard.numbered']);
assert('Skill Tree standard.named', !!aclSkills['standard.named']);
assert('Skill Tree standard.place_correctly', !!aclSkills['standard.place_correctly']);
assert('Skill Tree extended.numbered', !!aclSkills['extended.numbered']);
assert('Skill Tree extended.named', !!aclSkills['extended.named']);
assert('Skill Tree extended.protocol', !!aclSkills['extended.protocol']);
assert('Skill Tree extended.ports', !!aclSkills['extended.ports']);
assert('Skill Tree extended.place_correctly', !!aclSkills['extended.place_correctly']);
assert('Skill Tree direction_in_out', !!aclSkills['direction_in_out']);
assert('Skill Tree bind_interface', !!aclSkills['bind_interface']);
assert('Skill Tree vty_access_class', !!aclSkills['vty_access_class']);
assert('Skill Tree sequence_editing', !!aclSkills['sequence_editing']);
assert('Skill Tree verify', !!aclSkills['verify']);
assert('Skill Tree troubleshoot', !!aclSkills['troubleshoot']);

const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const invalid = Object.values(aclSkills).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

assert('CLI-Engine normalisiert access-list permit', normalizeCiscoLine('access-list 10 permit any') === 'access-list 10 permit any');
assert('CLI-Engine normalisiert access-list deny', normalizeCiscoLine('access-list 10 deny host 192.168.1.1') === 'access-list 10 deny host 192.168.1.1');
assert('CLI-Engine normalisiert ip access-list standard', normalizeCiscoLine('ip access-list standard ADMINS') === 'ip access-list standard admins');
assert('CLI-Engine normalisiert ip access-list extended', normalizeCiscoLine('ip access-list extended WEB') === 'ip access-list extended web');
assert('CLI-Engine normalisiert permit tcp', normalizeCiscoLine('permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.1 eq 80') === 'permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.1 eq 80');
assert('CLI-Engine normalisiert ip access-group', normalizeCiscoLine('ip access-group 110 in') === 'ip access-group 110 in');
assert('CLI-Engine normalisiert access-class', normalizeCiscoLine('access-class 10 in') === 'access-class 10 in');
assert('CLI-Engine normalisiert show access-lists', normalizeCiscoLine('sh access-lists') === 'show access-lists');
assert('CLI-Engine normalisiert show ip access-lists', normalizeCiscoLine('sh ip access-lists') === 'show ip access-lists');
assert('CLI-Engine normalisiert show ip interface', normalizeCiscoLine('sh ip int g0/0') === 'show ip interface g0/0');
assert('CLI-Engine normalisiert ip access-list resequence', normalizeCiscoLine('ip access-list resequence WEB 10 10') === 'ip access-list resequence web 10 10');

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

assert('First Match abgedeckt', allTexts.includes('first match'));
assert('Implicit Deny abgedeckt', allTexts.includes('implicit deny'));
assert('Standard ACL abgedeckt', allTexts.includes('standard acl'));
assert('Extended ACL abgedeckt', allTexts.includes('extended acl'));
assert('Numbered ranges abgedeckt', allTexts.includes('1–99') && allTexts.includes('100–199'));
assert('host / any abgedeckt', allTexts.includes('host') && allTexts.includes('any'));
assert('Wildcard Mask abgedeckt', allTexts.includes('wildcard'));
assert('ip access-group abgedeckt', allTexts.includes('ip access-group'));
assert('access-class für VTY abgedeckt', allTexts.includes('access-class'));
assert('in / out Richtung abgedeckt', allTexts.includes('inbound') || allTexts.includes('outbound') || allTexts.includes('eingehend') || allTexts.includes('ausgehend'));
assert('Standard Placement abgedeckt', allTexts.includes('ziel') || allTexts.includes('ziel'));
assert('Extended Placement abgedeckt', allTexts.includes('quelle') || allTexts.includes('quell'));
assert('VTY hardening abgedeckt', allTexts.includes('vty'));
assert('Named ACL / Sequence Numbers abgedeckt', allTexts.includes('sequenz') || allTexts.includes('sequence'));
assert('show access-lists abgedeckt', allTexts.includes('show access-lists'));
assert('show ip access-lists abgedeckt', allTexts.includes('show ip access-lists'));
assert('show ip interface abgedeckt', allTexts.includes('show ip interface'));
assert('show running-config abgedeckt', allTexts.includes('show running-config'));
assert('Wrong direction / binding troubleshooting abgedeckt', allTexts.includes('falsch') && allTexts.includes('gebunden'));
assert('0 matches troubleshooting abgedeckt', allTexts.includes('0 matches'));
assert('permit any before deny misconception abgedeckt', allTexts.includes('permit any'));
assert('Configured ≠ effective abgedeckt', allTexts.includes('wirkt'));
assert('Blocklist vs Allowlist abgedeckt', allTexts.includes('allowlist') && allTexts.includes('blocklist'));

const exerciseIds = (lesson?.exercises || []).map((e) => e.id);
const dupEx = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco ACL Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
