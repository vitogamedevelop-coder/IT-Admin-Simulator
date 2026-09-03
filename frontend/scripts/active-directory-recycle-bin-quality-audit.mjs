import fs from 'fs';
import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-recycle-bin');
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

console.log('=== Active Directory Recycle Bin Quality Audit ===\n');

const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === TOPIC_ID);
auditRequires(!!topic, 'Topic ad-recycle-bin is registered');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-replication-site-config') || topic.prerequisites.includes('active-directory-virtualbox/ad-replication-basics'), 'Prerequisite is an AD replication topic');

const lesson = LESSONS[TOPIC_ID];
auditRequires(!!lesson, 'Lesson exists for ad-recycle-bin');
auditRequires(Array.isArray(lesson.explanations) && lesson.explanations.length >= 4, `Has at least 4 explanations (found ${lesson.explanations.length})`);
auditRequires(Array.isArray(lesson.exercises) && lesson.exercises.length >= 10, `Has at least 10 exercises (found ${lesson.exercises.length})`);
auditRequires(Array.isArray(lesson.quiz) && lesson.quiz.length >= 4, `Has at least 4 quiz questions (found ${lesson.quiz.length})`);
auditRequires(Array.isArray(lesson.summary) && lesson.summary.length >= 4, 'Has summary');

auditRequires(hasText(lesson, 'wiederherstellung') || hasText(lesson, 'wiederherstellen') || hasText(lesson, 'papierkorb') || hasText(lesson, 'recycle bin'), 'Recycle Bin purpose covered');
auditRequires(hasText(lesson, 'aktiviert') || hasText(lesson, 'aktivierung'), 'Enablement covered');
auditRequires(hasText(lesson, 'forest') || hasText(lesson, 'gesamten forest'), 'Forest scope covered');
auditRequires(hasText(lesson, 'irreversible') || hasText(lesson, 'rückgängig') || hasText(lesson, 'nicht einfach'), 'Irreversible caution covered');
auditRequires(hasText(lesson, 'deleted objects') || hasText(lesson, 'gelöschte objekte'), 'Deleted Objects covered');
auditRequires(hasExercise(lesson, 'ad-recycle-bin-restore-guided-ui'), 'Restore guided UI exists');
auditRequires(hasExercise(lesson, 'ad-recycle-bin-restore-to-guided-ui'), 'Restore To guided UI exists');
auditRequires(hasText(lesson, 'verifizier') || hasText(lesson, 'prüf') || hasText(lesson, 'verifikation'), 'Verification covered');
auditRequires(hasText(lesson, 'backup') || hasText(lesson, 'sicherung'), 'Backup distinction covered');
auditRequires(hasText(lesson, 'adsi edit'), 'ADSI Edit advanced mention covered');

const guidedUis = lesson.exercises.filter((ex) => ex.type === 'guided-ui');
auditRequires(guidedUis.length >= 3, `Has at least 3 guided UIs (found ${guidedUis.length})`);

const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);
auditRequires(items.length >= 10, `Has at least 10 knowledge items (found ${items.length})`);
auditRequires(items.some((i) => i.id.includes('definition')), 'Has definition item');
auditRequires(items.some((i) => i.id.includes('enable')), 'Has enable item');
auditRequires(items.some((i) => i.id.includes('deletedObjects')), 'Has deleted objects item');
auditRequires(items.some((i) => i.id.includes('vsBackup')), 'Has vs backup item');

const conv = CONVERSATION_TOPICS[TOPIC_ID];
auditRequires(!!conv, 'Topic has conversation entry');
auditRequires(Array.isArray(conv.questions) && conv.questions.length >= 5, `Has at least 5 conversation questions (found ${conv?.questions?.length || 0})`);

auditRequires(!/site.*link.*bridge.*praktisch|ad-papierkorb.*praktisch.*backup|authoritative.*restore|ntdsutil.*restore|bare-metal/i.test(JSON.stringify(lesson)), 'No Site Link Bridge / Backup deep dive / authoritative restore');

auditRequires(/versionCode 19100/.test(buildGradle), 'versionCode must be 19100 for 1.91.0');

console.log('\n=== Active Directory Recycle Bin Quality Audit passed ===');

