import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let failures = 0;
function fail(label, detail = '') {
  console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
  failures += 1;
}
function pass(label) {
  console.log(`PASS: ${label}`);
}

console.log('=== Cisco Master Quality Audit ===');

const ciscoTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === 'cisco-packet-tracer');
const ciscoTopicKeys = new Set(ciscoTopics.map((t) => topicKey(t.categoryId, t.topicId)));
function difference(a, b) {
  return new Set([...a].filter((x) => !b.has(x)));
}

const indexOf = (id) => ciscoTopics.findIndex((t) => t.topicId === id);
const basicIdx = indexOf('basic-device-configuration');
const sshIdx = indexOf('ssh');
const vlanIdx = indexOf('vlan');

if (basicIdx === -1 || sshIdx === -1 || vlanIdx === -1) {
  fail('SSH order check: required topics missing');
} else if (basicIdx < sshIdx && sshIdx < vlanIdx) {
  pass('SSH topic positioned after Basic Config and before VLAN (Block 1.5)');
} else {
  fail('SSH topic order', `basic=${basicIdx}, ssh=${sshIdx}, vlan=${vlanIdx}`);
}

const sshTopic = ciscoTopics.find((t) => t.topicId === 'ssh');
if (sshTopic) {
  const expected = JSON.stringify(['basic-device-configuration']);
  const actual = JSON.stringify(sshTopic.prerequisites);
  if (actual === expected) {
    pass('SSH prerequisites only depend on Basic Config');
  } else {
    fail('SSH prerequisites', `expected ${expected}, got ${actual}`);
  }
}

for (const t of ciscoTopics) {
  const key = topicKey(t.categoryId, t.topicId);
  if (!LESSONS[key]) {
    fail(`Lesson exists for ${key}`);
  }
}
pass('All Cisco topics have a registered lesson');

const noConversation = difference(ciscoTopicKeys, new Set(Object.keys(CONVERSATION_TOPICS)));
if (noConversation.size === 0) {
  pass('All Cisco topics have a conversation entry');
} else {
  fail('Cisco topics without conversation', [...noConversation].join(', '));
}

const allKnowledge = getAllKnowledgeItems();
const topicsWithKnowledge = new Set(allKnowledge.filter((i) => ciscoTopicKeys.has(i.topicKey)).map((i) => i.topicKey));
const noKnowledge = difference(ciscoTopicKeys, topicsWithKnowledge);
if (noKnowledge.size === 0) {
  pass('All Cisco topics have knowledge items');
} else {
  fail('Cisco topics without knowledge items', [...noKnowledge].join(', '));
}

const knowledgeIds = allKnowledge.filter((i) => ciscoTopicKeys.has(i.topicKey)).map((i) => i.id);
const dupIds = knowledgeIds.filter((id, i) => knowledgeIds.indexOf(id) !== i);
if (dupIds.length === 0) {
  pass('No duplicate knowledge item IDs');
} else {
  fail('Duplicate knowledge item IDs', [...new Set(dupIds)].join(', '));
}

const statements = allKnowledge
  .filter((i) => ciscoTopicKeys.has(i.topicKey) && i.data?.statement)
  .map((i) => ({ id: i.id, statement: i.data.statement.trim().toLowerCase() }));
const seenStatements = new Map();
const dupStatements = [];
for (const { id, statement } of statements) {
  if (seenStatements.has(statement)) {
    dupStatements.push(`${seenStatements.get(statement)} ↔ ${id}`);
  } else {
    seenStatements.set(statement, id);
  }
}
if (dupStatements.length === 0) {
  pass('No duplicate knowledge statements');
} else {
  fail('Duplicate knowledge statements', dupStatements.slice(0, 5).join('; '));
}

const invalidSkills = [];
for (const [skillId, skill] of Object.entries(SKILL_TREE.cisco?.skills || {})) {
  for (const [subId, sub] of Object.entries(skill.subskills || {})) {
    if (sub.lessonTopic && !ciscoTopicKeys.has(sub.lessonTopic)) {
      invalidSkills.push(`${skillId}.${subId} → ${sub.lessonTopic}`);
    }
  }
}
if (invalidSkills.length === 0) {
  pass('All skill lessonTopic references are valid Cisco topics');
} else {
  fail('Invalid skill lessonTopic references', invalidSkills.join(', '));
}

const conversationQuestions = [];
for (const [topic, entry] of Object.entries(CONVERSATION_TOPICS)) {
  if (!ciscoTopicKeys.has(topic)) continue;
  for (const q of entry.questions || []) {
    conversationQuestions.push({ topic, id: q.id, text: (q.text || '').trim().toLowerCase() });
  }
}
const seenQuestions = new Map();
const dupQuestions = [];
for (const { topic, id, text } of conversationQuestions) {
  if (!text) continue;
  if (seenQuestions.has(text)) {
    dupQuestions.push(`${seenQuestions.get(text).topic}/${seenQuestions.get(text).id} ↔ ${topic}/${id}`);
  } else {
    seenQuestions.set(text, { topic, id });
  }
}
if (dupQuestions.length === 0) {
  pass('No exact duplicate conversation questions across Cisco topics');
} else {
  fail('Duplicate conversation questions', dupQuestions.slice(0, 5).join('; '));
}

const individualAudits = [
  'cisco-nat-quality-audit.mjs',
  'cisco-packet-filter-quality-audit.mjs',
  'cisco-acl-quality-audit.mjs',
  'cisco-ospf-quality-audit.mjs',
  'cisco-dhcp-quality-audit.mjs',
  'cisco-ssh-quality-audit.mjs',
  'cisco-stp-quality-audit.mjs',
  'cisco-multilayer-switching-quality-audit.mjs',
  'cisco-router-routing-intervlan-quality-audit.mjs',
  'cisco-vlan-access-trunk-quality-audit.mjs',
];

console.log('\n--- Individual audits ---');
for (const audit of individualAudits) {
  const result = spawnSync('node', [resolve(__dirname, audit)], { stdio: 'pipe', encoding: 'utf8' });
  const ok = result.status === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${audit}`);
  if (!ok) {
    console.log(result.stdout || result.stderr || '');
    failures += 1;
  }
}

console.log('\n=== Summary ===');
if (failures === 0) {
  console.log('Cisco Master Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
