import fs from 'fs';
import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-fsmo-transfer');
const buildGradle = fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');

function auditRequires(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`PASS: ${message}`);
  }
}

function hasText(lesson, ...terms) {
  const haystack = lesson.explanations.map((e) => e.title + ' ' + e.blocks.map((b) => b.content || b.items?.join(' ') || '').join(' ')).join(' ').toLowerCase();
  return terms.every((t) => haystack.includes(t.toLowerCase()));
}

function exerciseHasId(lesson, id) {
  return lesson.exercises.some((e) => e.id === id);
}

console.log('=== Active Directory FSMO Transfer Quality Audit ===\n');

const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === TOPIC_ID);
auditRequires(!!topic, 'Topic ad-fsmo-transfer is registered');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-fsmo-admin-groups'), 'Prerequisite is ad-fsmo-admin-groups');

const lesson = LESSONS[TOPIC_ID];
auditRequires(!!lesson, 'Lesson exists for ad-fsmo-transfer');
auditRequires(Array.isArray(lesson.explanations) && lesson.explanations.length >= 6, `Has at least 6 explanations (found ${lesson.explanations.length})`);
auditRequires(lesson.explanations.some((e) => e.blocks.some((b) => b.type === 'diagram')), 'Has at least one visual diagram');
auditRequires(Array.isArray(lesson.exercises) && lesson.exercises.length >= 12, `Has at least 12 exercises (found ${lesson.exercises.length})`);
auditRequires(Array.isArray(lesson.quiz) && lesson.quiz.length >= 5, `Has at least 5 quiz questions (found ${lesson.quiz.length})`);
auditRequires(Array.isArray(lesson.summary) && lesson.summary.length >= 4, 'Has summary');

auditRequires(hasText(lesson, 'Transfer', 'Seize'), 'Transfer vs Seize covered');
auditRequires(hasText(lesson, 'zweiten DC', 'DC02', 'Ziel-DC'), 'Second DC prerequisite covered');
auditRequires(hasText(lesson, 'netdom query fsmo'), 'netdom query fsmo covered');
auditRequires(hasText(lesson, 'aktuellen Rolleninhaber', 'Rolleninhaber'), 'Current owner identification covered');
auditRequires(hasText(lesson, 'Betriebsmaster', 'Active Directory-Benutzer und -Computer'), 'ADUC role view covered');
auditRequires(hasText(lesson, 'Domänencontroller ändern', 'Ziel-DC'), 'Target DC selection covered');
auditRequires(hasText(lesson, 'Ändern', 'übertragen'), 'Transfer action covered');
auditRequires(hasText(lesson, 'verifizieren', 'netdom query fsmo'), 'Verification covered');
auditRequires(hasText(lesson, 'Active Directory-Domänen und -Vertrauensstellungen', 'Domain Naming Master'), 'Domain Naming Master tool covered');
auditRequires(hasText(lesson, 'regsvr32 schmmgmt.dll', 'Schema Snap-In'), 'Schema registration covered');
auditRequires(hasText(lesson, 'Active Directory-Schema', 'MMC'), 'Schema Snap-In covered');
auditRequires(hasText(lesson, 'Schema Master', 'übertragen'), 'Schema Master transfer covered');
auditRequires(hasText(lesson, 'RID', 'PDC', 'Infrastructure', 'ADUC'), 'Tool mapping covered');

auditRequires(exerciseHasId(lesson, 'fsmo-transfer-view-domain-roles-guided-ui'), 'Guided UI: view domain roles');
auditRequires(exerciseHasId(lesson, 'fsmo-transfer-select-target-dc-guided-ui'), 'Guided UI: select target DC');
auditRequires(exerciseHasId(lesson, 'fsmo-transfer-domain-role-transfer-guided-ui'), 'Guided UI: domain role transfer');
auditRequires(exerciseHasId(lesson, 'fsmo-transfer-domain-naming-transfer-guided-ui'), 'Guided UI: domain naming transfer');
auditRequires(exerciseHasId(lesson, 'fsmo-transfer-schema-snapin-guided-ui'), 'Guided UI: schema snap-in');
auditRequires(exerciseHasId(lesson, 'fsmo-transfer-schema-master-transfer-guided-ui'), 'Guided UI: schema master transfer');

auditRequires(exerciseHasId(lesson, 'fsmo-transfer-netdom-goal'), 'Command recall: netdom goal');
auditRequires(exerciseHasId(lesson, 'fsmo-transfer-netdom-effect'), 'Command recall: netdom effect');
auditRequires(exerciseHasId(lesson, 'fsmo-transfer-schmmgmt-goal'), 'Command recall: schmmgmt goal');
auditRequires(exerciseHasId(lesson, 'fsmo-transfer-schmmgmt-effect'), 'Command recall: schmmgmt effect');

const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);
auditRequires(items.length >= 10, `Has at least 10 knowledge items (found ${items.length})`);
auditRequires(items.some((i) => i.conceptCluster === 'ad.fsmo.transfer'), 'Has transfer cluster items');
auditRequires(items.some((i) => i.id.includes('query')), 'Has netdom query item');
auditRequires(items.some((i) => i.id.includes('schemaRegistration')), 'Has schema registration item');
auditRequires(items.some((i) => i.id.includes('roleToolMapping')), 'Has tool mapping item');
auditRequires(items.some((i) => i.id.includes('noSeize')), 'Has no-seize clarification item');

const conv = CONVERSATION_TOPICS[TOPIC_ID];
auditRequires(!!conv, 'Topic has conversation entry');
auditRequires(Array.isArray(conv.questions) && conv.questions.length >= 5, `Has at least 5 conversation questions (found ${conv?.questions?.length || 0})`);

auditRequires(!/ntdsutil|seize.*praktisch|rollen.*seizen|seize-prozess/i.test(JSON.stringify(lesson)), 'No practical seize procedure taught');

auditRequires(/versionCode 18900/.test(buildGradle), 'versionCode must be 18900 for 1.89.0');

console.log('\n=== Active Directory FSMO Transfer Quality Audit passed ===');





