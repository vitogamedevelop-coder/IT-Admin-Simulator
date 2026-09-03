import fs from 'fs';
import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-site-config');
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

function hasExercise(lesson, idFragment) {
  return lesson.exercises.some((ex) => ex.id.includes(idFragment));
}

console.log('=== Active Directory Replication Site Config Quality Audit ===\n');

const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === TOPIC_ID);
auditRequires(!!topic, 'Topic ad-replication-site-config is registered');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-replication-topology'), 'Prerequisite is ad-replication-topology');

const lesson = LESSONS[TOPIC_ID];
auditRequires(!!lesson, 'Lesson exists for ad-replication-site-config');
auditRequires(Array.isArray(lesson.explanations) && lesson.explanations.length >= 3, `Has at least 3 explanations (found ${lesson.explanations.length})`);
auditRequires(Array.isArray(lesson.exercises) && lesson.exercises.length >= 15, `Has at least 15 exercises (found ${lesson.exercises.length})`);
auditRequires(Array.isArray(lesson.quiz) && lesson.quiz.length >= 4, `Has at least 4 quiz questions (found ${lesson.quiz.length})`);
auditRequires(Array.isArray(lesson.summary) && lesson.summary.length >= 4, 'Has summary');

auditRequires(hasText(lesson, 'Standorte und -Dienste', 'Sites and Services') || hasText(lesson, 'Standorte und Dienste', 'Sites and Services'), 'Sites and Services tool covered');
auditRequires(hasText(lesson, 'Default-First-Site-Name'), 'Default-First-Site-Name covered');
auditRequires(hasExercise(lesson, 'create-site-guided-ui'), 'Create site guided UI exists');
auditRequires(hasExercise(lesson, 'create-subnet-guided-ui'), 'Create subnet guided UI exists');
auditRequires(hasText(lesson, 'CIDR'), 'CIDR/Subnet creation covered');
auditRequires(hasExercise(lesson, 'move-dc-guided-ui'), 'Move DC guided UI exists');
auditRequires(hasText(lesson, 'verschieben'), 'DC move action covered');
auditRequires(hasText(lesson, 'DEFAULTIPSITELINK') || hasText(lesson, 'defaultipsitelink'), 'DEFAULTIPSITELINK covered');
auditRequires(hasExercise(lesson, 'create-site-link-guided-ui'), 'Create site link guided UI exists');
auditRequires(hasText(lesson, 'inter-site transports'), 'Inter-Site Transports covered');
auditRequires(hasExercise(lesson, 'site-link-cost-guided-ui') || hasText(lesson, 'cost') && hasText(lesson, 'site link'), 'Cost configuration covered');
auditRequires(hasExercise(lesson, 'site-link-interval-guided-ui') || hasText(lesson, 'intervall'), 'Interval configuration covered');
auditRequires(hasExercise(lesson, 'set-schedule-guided-ui') || hasText(lesson, 'zeitplan'), 'Schedule configuration covered');
auditRequires(hasExercise(lesson, 'preferred-bridgehead-guided-ui') || hasText(lesson, 'preferred bridgehead') || hasText(lesson, 'bevorzugten bridgehead'), 'Preferred Bridgehead caution covered');
auditRequires(hasText(lesson, 'verifizieren') || hasText(lesson, 'prüfen'), 'Verification covered');
auditRequires(hasText(lesson, 'troubleshoot') || hasText(lesson, 'fehlkonfiguration') || hasText(lesson, 'falsch'), 'Troubleshooting covered');

const guidedUis = lesson.exercises.filter((ex) => ex.type === 'guided-ui');
auditRequires(guidedUis.length >= 6, `Has at least 6 guided UIs (found ${guidedUis.length})`);

const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);
auditRequires(items.length >= 8, `Has at least 8 knowledge items (found ${items.length})`);
auditRequires(items.some((i) => i.id.includes('siteConfigTool')), 'Has site config tool item');
auditRequires(items.some((i) => i.id.includes('createSite')), 'Has create site item');
auditRequires(items.some((i) => i.id.includes('createSubnet')), 'Has create subnet item');
auditRequires(items.some((i) => i.id.includes('moveDc')), 'Has move DC item');
auditRequires(items.some((i) => i.id.includes('createSiteLink')), 'Has create site link item');
auditRequires(items.some((i) => i.id.includes('configureCost')), 'Has configure cost item');

const conv = CONVERSATION_TOPICS[TOPIC_ID];
auditRequires(!!conv, 'Topic has conversation entry');
auditRequires(Array.isArray(conv.questions) && conv.questions.length >= 5, `Has at least 5 conversation questions (found ${conv?.questions?.length || 0})`);

auditRequires(!/site link bridge.*praktisch|site-link-bridge.*konfig|ad-papierkorb aktivieren|ad recycle bin aktivieren|adsiedit.*praktisch/i.test(JSON.stringify(lesson)), 'No Site Link Bridge / Recycle Bin / ADSI Edit practice yet');

auditRequires(/versionCode 19000/.test(buildGradle), 'versionCode must be 19000 for 1.90.0');

console.log('\n=== Active Directory Replication Site Config Quality Audit passed ===');

