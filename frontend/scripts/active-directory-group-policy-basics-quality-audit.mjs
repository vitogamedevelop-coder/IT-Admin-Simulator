import fs from 'fs';
import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-group-policy-basics');
const buildGradle = fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');

function auditRequires(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`PASS: ${message}`);
  }
}

const lesson = LESSONS[TOPIC_ID];
const lessonText = JSON.stringify(lesson).toLowerCase();

console.log('=== Active Directory Group Policy Basics Quality Audit ===\n');

const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === TOPIC_ID);
auditRequires(!!topic, 'Topic ad-group-policy-basics is registered');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-recycle-bin'), 'Prerequisite is ad-recycle-bin');

auditRequires(!!lesson, 'Lesson exists for ad-group-policy-basics');
auditRequires(Array.isArray(lesson.explanations) && lesson.explanations.length >= 4, `Has at least 4 explanations (found ${lesson.explanations.length})`);
auditRequires(Array.isArray(lesson.exercises) && lesson.exercises.length >= 10, `Has at least 10 exercises (found ${lesson.exercises.length})`);
auditRequires(Array.isArray(lesson.quiz) && lesson.quiz.length >= 4, `Has at least 4 quiz questions (found ${lesson.quiz.length})`);
auditRequires(Array.isArray(lesson.summary) && lesson.summary.length >= 4, 'Has summary');

auditRequires(/gruppenrichtlinie|group policy/i.test(lessonText), 'Group Policy definition covered');
auditRequires(/gpo/i.test(lessonText), 'GPO covered');
auditRequires(/benutzerkonfiguration|user configuration/i.test(lessonText), 'User configuration covered');
auditRequires(/computerkonfiguration|computer configuration/i.test(lessonText), 'Computer configuration covered');
auditRequires(/lokal/i.test(lessonText) && /zentral/i.test(lessonText), 'Local vs central covered');
auditRequires(/site/i.test(lessonText) && /domain/i.test(lessonText) && /ou/i.test(lessonText), 'Link locations Site/Domain/OU covered');
auditRequires(/gpmc/i.test(lessonText), 'GPMC covered');
auditRequires(/gpc/i.test(lessonText), 'GPC covered');
auditRequires(/gpt/i.test(lessonText), 'GPT covered');
auditRequires(/sysvol/i.test(lessonText), 'SYSVOL covered');
auditRequires(/gpupdate/i.test(lessonText) && /gpresult/i.test(lessonText), 'CLI preview covered');

const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);
auditRequires(items.length >= 10, `Has at least 10 knowledge items (found ${items.length})`);

const conv = CONVERSATION_TOPICS[TOPIC_ID];
auditRequires(!!conv, 'Topic has conversation entry');
auditRequires(Array.isArray(conv.questions) && conv.questions.length >= 5, `Has at least 5 conversation questions (found ${conv?.questions?.length || 0})`);

auditRequires(!/vererbung|lsdou|block inheritance|enforced|link order|softwareverteilung|gpupdate \/force|gpresult \/r|security filtering|wmi filter|administrative templates/i.test(lessonText), 'No advanced concepts prematurely taught');

auditRequires(/versionCode 19300/.test(buildGradle), 'versionCode must be 19200 for 1.93.0');

console.log('\n=== Active Directory Group Policy Basics Quality Audit passed ===');

