import fs from 'fs';
import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-basics');
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

console.log('=== Active Directory Replication Basics Quality Audit ===\n');

const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === TOPIC_ID);
auditRequires(!!topic, 'Topic ad-replication-basics is registered');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-fsmo-transfer'), 'Prerequisite is ad-fsmo-transfer');

const lesson = LESSONS[TOPIC_ID];
auditRequires(!!lesson, 'Lesson exists for ad-replication-basics');
auditRequires(Array.isArray(lesson.explanations) && lesson.explanations.length >= 6, `Has at least 6 explanations (found ${lesson.explanations.length})`);
auditRequires(lesson.explanations.some((e) => e.blocks.some((b) => b.type === 'diagram')), 'Has at least one visual diagram');
auditRequires(Array.isArray(lesson.exercises) && lesson.exercises.length >= 12, `Has at least 12 exercises (found ${lesson.exercises.length})`);
auditRequires(Array.isArray(lesson.quiz) && lesson.quiz.length >= 5, `Has at least 5 quiz questions (found ${lesson.quiz.length})`);
auditRequires(Array.isArray(lesson.summary) && lesson.summary.length >= 4, 'Has summary');

auditRequires(hasText(lesson, 'Replikation', 'konsistent'), 'Replication definition covered');
auditRequires(hasText(lesson, 'Ohne Replikation', 'unterschiedliche Datenstände'), 'Problem without replication covered');
auditRequires(hasText(lesson, 'Multi-Master'), 'Multi-Master covered');
auditRequires(hasText(lesson, 'FSMO', 'Ausnahme'), 'FSMO exception covered');
auditRequires(hasText(lesson, 'RODC', 'Read-Only'), 'RODC covered');
auditRequires(hasText(lesson, 'NTDS.DIT'), 'NTDS.DIT covered');
auditRequires(hasText(lesson, 'Partitionen', 'Scope'), 'Partition concept covered');
auditRequires(hasText(lesson, 'Schema-Partition', 'forestweit'), 'Schema partition covered');
auditRequires(hasText(lesson, 'Configuration-Partition', 'forestweit'), 'Configuration partition covered');
auditRequires(hasText(lesson, 'Domain-Partition', 'domänenspezifisch'), 'Domain partition covered');
auditRequires(hasText(lesson, 'Application', 'anwendungsspezifisch'), 'Application partition covered');
auditRequires(hasText(lesson, 'Objekt erstellen', 'ändern', 'löschen'), 'Replication triggers covered');
auditRequires(hasText(lesson, 'Delta', 'Änderungen'), 'Delta replication covered');
auditRequires(hasText(lesson, 'Store-and-Forward'), 'Store-and-forward covered');
auditRequires(hasText(lesson, 'Statusinformationen'), 'State tracking covered');
auditRequires(hasText(lesson, 'Sites', 'KCC', 'Papierkorb', 'AD Recycle Bin') === false || hasText(lesson, 'folgt später', 'nicht in diesem Thema'), 'No deep Sites/KCC/Recycle Bin in this topic');

const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);
auditRequires(items.length >= 10, `Has at least 10 knowledge items (found ${items.length})`);
auditRequires(items.some((i) => i.id.includes('definition')), 'Has definition item');
auditRequires(items.some((i) => i.id.includes('multiMaster')), 'Has multi-master item');
auditRequires(items.some((i) => i.id.includes('ntdsDit')), 'Has NTDS.DIT item');
auditRequires(items.some((i) => i.id.includes('schemaPartition')), 'Has schema partition item');
auditRequires(items.some((i) => i.id.includes('configurationPartition')), 'Has configuration partition item');
auditRequires(items.some((i) => i.id.includes('domainPartition')), 'Has domain partition item');
auditRequires(items.some((i) => i.id.includes('delta')), 'Has delta item');

const conv = CONVERSATION_TOPICS[TOPIC_ID];
auditRequires(!!conv, 'Topic has conversation entry');
auditRequires(Array.isArray(conv.questions) && conv.questions.length >= 5, `Has at least 5 conversation questions (found ${conv?.questions?.length || 0})`);

auditRequires(!/KCC (konfigurieren|als).*Detaill?iert|Sites? (konfigurieren|zuweisen)|Site Link|Subnetz.*zuweisen|Replikationszeitplan|AD-Papierkorb aktivieren|AD Recycle Bin aktivieren/i.test(JSON.stringify(lesson)), 'No practical deep Sites/KCC/Recycle Bin configuration taught');

auditRequires(/versionCode 18701/.test(buildGradle), 'versionCode must be 18701 for 1.87.1');

console.log('\n=== Active Directory Replication Basics Quality Audit passed ===');


