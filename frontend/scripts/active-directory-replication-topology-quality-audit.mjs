import fs from 'fs';
import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-topology');
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

console.log('=== Active Directory Replication Topology Quality Audit ===\n');

const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === TOPIC_ID);
auditRequires(!!topic, 'Topic ad-replication-topology is registered');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-replication-sites'), 'Prerequisite is ad-replication-sites');

const lesson = LESSONS[TOPIC_ID];
auditRequires(!!lesson, 'Lesson exists for ad-replication-topology');
auditRequires(Array.isArray(lesson.explanations) && lesson.explanations.length >= 10, `Has at least 10 explanations (found ${lesson.explanations.length})`);
auditRequires(lesson.explanations.some((e) => e.blocks.some((b) => b.type === 'diagram')), 'Has at least one visual diagram');
auditRequires(Array.isArray(lesson.exercises) && lesson.exercises.length >= 12, `Has at least 12 exercises (found ${lesson.exercises.length})`);
auditRequires(Array.isArray(lesson.quiz) && lesson.quiz.length >= 5, `Has at least 5 quiz questions (found ${lesson.quiz.length})`);
auditRequires(Array.isArray(lesson.summary) && lesson.summary.length >= 4, 'Has summary');

auditRequires(hasText(lesson, 'KCC', 'Knowledge Consistency Checker'), 'KCC covered');
auditRequires(hasText(lesson, 'Rahmenbedingungen', 'berechnet'), 'KCC purpose covered');
auditRequires(hasText(lesson, 'repliziert nicht selbst', 'kein Replikationsdienst') || hasText(lesson, 'plant', 'Topologie', 'Connection Objects'), 'KCC != replication engine covered');
auditRequires(hasText(lesson, 'reagiert', 'Änderungen') || hasText(lesson, 'regelmäßig', 'neu bewerten'), 'KCC reacts to changes covered');
auditRequires(hasText(lesson, 'Replikationstopologie', 'logische Struktur'), 'Replication topology covered');
auditRequires(hasText(lesson, 'Store-and-Forward'), 'Store-and-forward link covered');
auditRequires(hasText(lesson, 'Site Link', 'logische', 'Site'), 'Site Link covered');
auditRequires(hasText(lesson, 'Connection Object', 'konkrete'), 'Connection Object covered');
auditRequires(hasText(lesson, 'Site Link', 'Connection Object', 'Unterschied') || hasText(lesson, 'Site-Ebene', 'DC-Ebene'), 'Site Link vs Connection Object covered');
auditRequires(hasText(lesson, 'Cost', 'Gewichtung'), 'Cost covered');
auditRequires(hasText(lesson, 'bevorzugt', 'niedrigere') || hasText(lesson, 'niedrigere', 'Kosten'), 'Cost path preference covered');
auditRequires(hasText(lesson, 'Schedule', 'Zeitplan'), 'Schedule covered');
auditRequires(hasText(lesson, 'Intervall', 'Aktualität', 'Verkehr'), 'Interval tradeoff covered');
auditRequires(hasText(lesson, 'Bridgehead', 'Intersite'), 'Bridgehead covered');
auditRequires(hasText(lesson, 'automatisch', 'Bridgehead') || hasText(lesson, 'manuell', 'optional', 'Bridgehead'), 'Automatic Bridgehead covered');
auditRequires(hasText(lesson, 'Site Link Bridge') || hasText(lesson, 'Bridge', 'transitiv'), 'Site Link Bridge covered');
auditRequires(hasText(lesson, 'Cost', 'Struktur', 'prüft') || hasText(lesson, 'Cost', 'Struktur', 'prüfen'), 'Troubleshooting covered');

const explanationText = lesson.explanations.map((e) => e.blocks.filter((b) => b.type === 'text').map((b) => b.content).join(' ')).join(' ').toLowerCase();
auditRequires(!/(immer|jederzeit).*ring|feste(r|s)? (hop|hop-anzahl|hop-grenze)|15 sekunden|15 minuten/i.test(explanationText), 'No rigid ring / fixed timing dogma in explanations');

const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);
auditRequires(items.length >= 10, `Has at least 10 knowledge items (found ${items.length})`);
auditRequires(items.some((i) => i.id.includes('kcc')), 'Has KCC item');
auditRequires(items.some((i) => i.id.includes('siteLink')), 'Has Site Link item');
auditRequires(items.some((i) => i.id.includes('connectionObject')), 'Has Connection Object item');
auditRequires(items.some((i) => i.id.includes('cost')), 'Has Cost item');
auditRequires(items.some((i) => i.id.includes('bridgehead')), 'Has Bridgehead item');
auditRequires(items.some((i) => i.id.includes('siteLinkBridge')), 'Has Site Link Bridge item');

const conv = CONVERSATION_TOPICS[TOPIC_ID];
auditRequires(!!conv, 'Topic has conversation entry');
auditRequires(Array.isArray(conv.questions) && conv.questions.length >= 5, `Has at least 5 conversation questions (found ${conv?.questions?.length || 0})`);

auditRequires(!/Site Link.*praktisch.*erstellen|Kosten.*praktisch.*setzen|Zeitplan.*praktisch.*setzen|Site-Link-Bridge.*praktisch.*erstellen|Bridgehead.*praktisch.*konfigurieren|Sites and Services.*bedienen|AD-Papierkorb aktivieren/i.test(JSON.stringify(lesson)), 'No practical Sites/Site-Link configuration taught yet');

auditRequires(/versionCode 19000/.test(buildGradle), 'versionCode must be 19000 for 1.90.0');

console.log('\n=== Active Directory Replication Topology Quality Audit passed ===');


