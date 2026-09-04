import fs from 'fs';
import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-fsmo-admin-groups');
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

function noForbiddenTerms(lesson, ...terms) {
  const haystack = JSON.stringify(lesson).toLowerCase();
  return !terms.some((t) => haystack.includes(t.toLowerCase()));
}

console.log('=== Active Directory FSMO & Admin Groups Quality Audit ===\n');

const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === TOPIC_ID);
auditRequires(!!topic, 'Topic ad-fsmo-admin-groups is registered');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-tree-forest'), 'Prerequisite is active-directory-virtualbox/ad-tree-forest');

const lesson = LESSONS[TOPIC_ID];
auditRequires(!!lesson, 'Lesson exists for ad-fsmo-admin-groups');
auditRequires(Array.isArray(lesson.explanations) && lesson.explanations.length >= 8, 'Has at least 8 explanations');
auditRequires(lesson.explanations.some((e) => e.blocks.some((b) => b.type === 'diagram')), 'Has at least one visual diagram');
auditRequires(Array.isArray(lesson.exercises) && lesson.exercises.length >= 10, `Has at least 10 exercises (found ${lesson.exercises.length})`);
auditRequires(Array.isArray(lesson.quiz) && lesson.quiz.length >= 5, `Has at least 5 quiz questions (found ${lesson.quiz.length})`);
auditRequires(Array.isArray(lesson.summary) && lesson.summary.length >= 4, 'Has summary');

auditRequires(hasText(lesson, 'Multi-Master', 'FSMO', 'Flexible Single Master Operations'), 'FSMO definition covered');
auditRequires(hasText(lesson, 'Schema Master', 'Domain Naming Master', 'RID Master', 'PDC Emulator', 'Infrastructure Master'), 'All five FSMO roles mentioned');
auditRequires(hasText(lesson, 'forest', 'domänenweit', 'Domain Naming Master', 'Schema Master'), 'Forest-wide roles covered');
auditRequires(hasText(lesson, 'RID Master', 'PDC Emulator', 'Infrastructure Master'), 'Domain-wide roles covered');
auditRequires(hasText(lesson, 'Domainstruktur', 'Domain-Namespace'), 'Domain Naming Master purpose covered');
auditRequires(hasText(lesson, 'Schema', 'Objekttypen', 'Attribute'), 'Schema Master purpose covered');
auditRequires(hasText(lesson, 'Ausfall', 'blockiert', 'weiter'), 'Failure behavior covered');
auditRequires(hasText(lesson, 'Platzierung', 'Designentscheidung'), 'Placement as design decision covered');
auditRequires(hasText(lesson, 'Lokale Administratoren', 'Domain Admins', 'Enterprise Admins', 'Schema Admins'), 'Privileged admin groups covered');
auditRequires(hasText(lesson, 'Least Privilege', 'Delegation'), 'Least Privilege covered');

auditRequires(exerciseHasId(lesson, 'fsmo-admin-role-scope-matching'), 'Role-to-scope matching exercise exists');
auditRequires(exerciseHasId(lesson, 'fsmo-admin-admin-scope-matching'), 'Admin-group-to-scope matching exercise exists');
auditRequires(exerciseHasId(lesson, 'fsmo-admin-domain-add-scenario'), 'Domain-add scenario exists');
auditRequires(exerciseHasId(lesson, 'fsmo-admin-schema-change-scenario'), 'Schema-change scenario exists');
auditRequires(exerciseHasId(lesson, 'fsmo-admin-failure-scenario'), 'Failure scenario exists');
auditRequires(exerciseHasId(lesson, 'fsmo-admin-helpdesk-delegation'), 'Helpdesk delegation scenario exists');

auditRequires(noForbiddenTerms(lesson, 'netdom query fsmo', 'Betriebsmaster', 'regsvr32 schmmgmt.dll', 'Schema-Snap-In', 'Domain Naming Master praktisch verschieben', 'Rollenübertragung'), 'No Thema 21 transfer practice content');

const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);
auditRequires(items.length >= 10, `Has at least 10 knowledge items (found ${items.length})`);
auditRequires(items.some((i) => i.id.startsWith('ad.fsmo.forestRoles')), 'Has forest-role knowledge items');
auditRequires(items.some((i) => i.id.startsWith('ad.fsmo.domainNamingMaster')), 'Has Domain Naming Master knowledge item');
auditRequires(items.some((i) => i.id.startsWith('ad.fsmo.schemaMaster')), 'Has Schema Master knowledge item');
auditRequires(items.some((i) => i.id.startsWith('ad.admin.scope')), 'Has admin scope knowledge items');
auditRequires(items.some((i) => i.id.startsWith('ad.admin.leastPrivilege')), 'Has least-privilege knowledge items');

const conv = CONVERSATION_TOPICS[TOPIC_ID];
auditRequires(!!conv, 'Topic has conversation entry');
auditRequires(Array.isArray(conv.questions) && conv.questions.length >= 5, `Has at least 5 conversation questions (found ${conv?.questions?.length || 0})`);

auditRequires(/versionCode 19200/.test(buildGradle), 'versionCode must be 19200 for 1.92.0');

console.log('\n=== Active Directory FSMO & Admin Groups Quality Audit passed ===');








