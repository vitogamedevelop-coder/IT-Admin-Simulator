import fs from 'fs';
import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-sites');
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

console.log('=== Active Directory Replication Sites Quality Audit ===\n');

const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === TOPIC_ID);
auditRequires(!!topic, 'Topic ad-replication-sites is registered');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-replication-basics'), 'Prerequisite is ad-replication-basics');

const lesson = LESSONS[TOPIC_ID];
auditRequires(!!lesson, 'Lesson exists for ad-replication-sites');
auditRequires(Array.isArray(lesson.explanations) && lesson.explanations.length >= 10, `Has at least 10 explanations (found ${lesson.explanations.length})`);
auditRequires(lesson.explanations.some((e) => e.blocks.some((b) => b.type === 'diagram')), 'Has at least one visual diagram');
auditRequires(Array.isArray(lesson.exercises) && lesson.exercises.length >= 12, `Has at least 12 exercises (found ${lesson.exercises.length})`);
auditRequires(Array.isArray(lesson.quiz) && lesson.quiz.length >= 5, `Has at least 5 quiz questions (found ${lesson.quiz.length})`);
auditRequires(Array.isArray(lesson.summary) && lesson.summary.length >= 4, 'Has summary');

auditRequires(hasText(lesson, 'Site', 'physische', 'Netzwerk'), 'Site definition covered');
auditRequires(hasText(lesson, 'Domain', 'logisch', 'Site', 'physisch'), 'Site vs Domain covered');
auditRequires(hasText(lesson, 'OU', 'administrativ'), 'Site vs OU covered');
auditRequires(hasText(lesson, 'Namensraum', 'nicht', 'DNS') || hasText(lesson, 'Namespace', 'nicht', 'DNS'), 'Site vs namespace covered');
auditRequires(hasText(lesson, 'Subnetz'), 'Subnet covered');
auditRequires(hasText(lesson, 'IP', 'Subnetz', 'Site', 'DC'), 'Subnet-to-site flow covered');
auditRequires(hasText(lesson, 'lokal', 'DC', 'Authentifizierung'), 'Local DC / authentication covered');
auditRequires(hasText(lesson, 'Intrasite'), 'Intrasite covered');
auditRequires(hasText(lesson, 'Intersite'), 'Intersite covered');
auditRequires(hasText(lesson, 'WAN', 'LAN'), 'LAN/WAN distinction covered');
auditRequires(hasText(lesson, 'Bandbreite', 'Aktualität'), 'Bandwidth tradeoff covered');
auditRequires(hasText(lesson, 'Bridgehead'), 'Bridgehead basic covered');
auditRequires(hasText(lesson, 'Site', 'Subnetzzuordnung'), 'Troubleshooting covered');
const lessonText = lesson.explanations.map((e) => e.title + ' ' + e.blocks.map((b) => b.content || b.items?.join(' ') || '').join(' ')).join(' ').toLowerCase();
auditRequires(
  (!/\bkcc\b/.test(lessonText) || /keine kcc|folgen in späteren themen|nicht in diesem thema/.test(lessonText)) &&
  !/\bsite link\b/.test(lessonText) &&
  !/\bsites and services\b/.test(lessonText),
  'No deep KCC/Site-Link/Sites-and-Services config in this topic'
);

const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);
auditRequires(items.length >= 10, `Has at least 10 knowledge items (found ${items.length})`);
auditRequires(items.some((i) => i.id.includes('siteDefinition')), 'Has site definition item');
auditRequires(items.some((i) => i.id.includes('siteVsDomain')), 'Has site vs domain item');
auditRequires(items.some((i) => i.id.includes('siteVsOu')), 'Has site vs OU item');
auditRequires(items.some((i) => i.id.includes('subnetToSite')), 'Has subnet-to-site item');
auditRequires(items.some((i) => i.id.includes('intrasite')), 'Has intrasite item');
auditRequires(items.some((i) => i.id.includes('intersite')), 'Has intersite item');
auditRequires(items.some((i) => i.id.includes('bridgeheadBasic')), 'Has bridgehead basic item');

const conv = CONVERSATION_TOPICS[TOPIC_ID];
auditRequires(!!conv, 'Topic has conversation entry');
auditRequires(Array.isArray(conv.questions) && conv.questions.length >= 5, `Has at least 5 conversation questions (found ${conv?.questions?.length || 0})`);

auditRequires(!/KCC.*konfigurieren|KCC.*detailliert|Site Link.*konfigurieren|Site Link.*Costs|Subnetz.*praktisch.*anlegen|Site.*praktisch.*anlegen|DC.*praktisch.*verschieben|Replikationszeitplan.*erstellen|Sites and Services.*bedienen|AD-Papierkorb aktivieren/i.test(JSON.stringify(lesson)), 'No practical deep KCC/Site-Link/Recycle Bin configuration taught');

auditRequires(/versionCode 19000/.test(buildGradle), 'versionCode must be 19000 for 1.90.0');

console.log('\n=== Active Directory Replication Sites Quality Audit passed ===');



