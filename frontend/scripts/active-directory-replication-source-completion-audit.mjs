import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';

function hasTopic(topicId) {
  const key = topicKey('active-directory-virtualbox', topicId);
  return !!hasLessonContent('active-directory-virtualbox', topicId) && !!LESSONS[key];
}

function hasConversation(topicId) {
  const key = topicKey('active-directory-virtualbox', topicId);
  const conv = CONVERSATION_TOPICS[key];
  return !!conv && Array.isArray(conv.questions) && conv.questions.length > 0;
}

function itemsFor(topicId) {
  const key = topicKey('active-directory-virtualbox', topicId);
  return getAllKnowledgeItems().filter((i) => i.topicKey === key);
}

let hasError = false;
function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    hasError = true;
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('=== Active Directory Replikation.txt Source Completion Audit ===\n');

const requiredTopics = [
  ['ad-tree-forest', 'Trees, Forests & Subdomänen'],
  ['ad-trusts', 'Vertrauensstellungen'],
  ['ad-fsmo-admin-groups', 'FSMO-Rollen & Admin-Gruppen'],
  ['ad-fsmo-transfer', 'FSMO-Rollen anzeigen & verschieben'],
  ['ad-replication-basics', 'Replikationsgrundlagen & AD-Datenbank'],
];

for (const [id, title] of requiredTopics) {
  check(hasTopic(id), `Topic "${title}" (${id}) has a registered lesson`);
  check(hasConversation(id), `Topic "${title}" (${id}) has conversation questions`);
  check(itemsFor(id).length >= 5, `Topic "${title}" (${id}) has at least 5 knowledge items`);
}

const replicationLesson = LESSONS[topicKey('active-directory-virtualbox', 'ad-replication-basics')];
const replicationText = JSON.stringify(replicationLesson).toLowerCase();

check(/replikation/i.test(replicationText), 'Replication topic covers replication definition');
check(/ohne replikation|unterschiedliche datenstände/i.test(replicationText), 'Replication topic covers what happens without replication');
check(/multi.?master/i.test(replicationText), 'Replication topic covers Multi-Master');
check(/rodc|read.?only domain controller/i.test(replicationText), 'Replication topic covers RODC');
check(/ntds\.dit/i.test(replicationText), 'Replication topic covers NTDS.DIT');
check(/schema.?partition|schema-partition/i.test(replicationText), 'Replication topic covers Schema Partition');
check(/configuration.?partition|config-partition/i.test(replicationText), 'Replication topic covers Configuration Partition');
check(/domain.?partition|domain-partition/i.test(replicationText), 'Replication topic covers Domain Partition');
check(/application.?partition|anwendungsverzeichnis/i.test(replicationText), 'Replication topic covers Application Partition');
check(/forestweit/i.test(replicationText) && /domänenspezifisch|domain-spezifisch/i.test(replicationText), 'Replication topic covers scopes');
check(/objekt erstellen|objekt ändern|objekt verschieben|objekt löschen/i.test(replicationText), 'Replication topic covers triggers');
check(/delta|änderungen übertragen/i.test(replicationText), 'Replication topic covers delta replication');
check(/store.?and.?forward|store-and-forward/i.test(replicationText), 'Replication topic covers Store-and-Forward');
check(/statusinformation|bekannten änderungen/i.test(replicationText), 'Replication topic covers state tracking');

const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === topicKey('active-directory-virtualbox', 'ad-replication-basics'));
check(!!topic, 'ad-replication-basics topic registered');
if (topic) {
  check(topic.prerequisites.includes('active-directory-virtualbox/ad-fsmo-transfer') || topic.prerequisites.includes('active-directory-virtualbox/ad-fsmo-admin-groups'), 'ad-replication-basics has valid AD prerequisite');
}

check(!/KCC (konfigurieren|als).*Detaill?iert|Sites? (konfigurieren|zuweisen)|Site Link|Subnetz.*zuweisen|Replikationszeitplan|AD-Papierkorb aktivieren|AD Recycle Bin aktivieren/i.test(replicationText), 'No deep Sites/KCC/Recycle Bin configuration prematurely included');

if (hasError) {
  console.error('\nReplikation.txt source completion audit FAILED.');
  process.exit(1);
}
console.log('\n==================================================');
console.log('Replikation.txt');
console.log('FACHLICH ABGESCHLOSSEN');
console.log('==================================================');
console.log('\n=== Active Directory Replikation.txt Source Completion Audit passed ===');





