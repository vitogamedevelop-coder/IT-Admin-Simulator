import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { CISCO_THEORY_ITEMS } from '../src/lib/knowledge/items/ciscoTheory.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';

const grundlagenKey = topicKey('cisco-packet-tracer', 'grundlagen');
const basicConfigKey = topicKey('cisco-packet-tracer', 'basic-device-configuration');

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco Grundlagen Quality Audit ===');

// Lessons exist and have required parts
const grundlagenLesson = LESSONS[grundlagenKey];
assert('Cisco Grundlagen Lesson existiert', !!grundlagenLesson);
assert('Cisco Grundlagen hat Erklärungen', grundlagenLesson?.explanations?.length > 0, `count=${grundlagenLesson?.explanations?.length}`);
assert('Cisco Grundlagen hat Übungen', grundlagenLesson?.exercises?.length > 0, `count=${grundlagenLesson?.exercises?.length}`);
assert('Cisco Grundlagen hat Quiz', grundlagenLesson?.quiz?.length > 0, `count=${grundlagenLesson?.quiz?.length}`);

const basicConfigLesson = LESSONS[basicConfigKey];
assert('Basic Device Configuration Lesson existiert', !!basicConfigLesson);
assert('Basic Device Configuration hat Übungen', basicConfigLesson?.exercises?.length > 0, `count=${basicConfigLesson?.exercises?.length}`);
assert('Basic Device Configuration hat Quiz', basicConfigLesson?.quiz?.length > 0, `count=${basicConfigLesson?.quiz?.length}`);
assert('Basic Device Configuration hat CLI-Aufgaben', basicConfigLesson?.cliTasks?.length > 0, `count=${basicConfigLesson?.cliTasks?.length}`);

// CLI exercises present in Grundlagen
const cliExercises = (grundlagenLesson?.exercises || []).filter((e) => e.type === 'cli-input');
assert('Cisco Grundlagen enthält CLI-Input-Übungen', cliExercises.length > 0, `count=${cliExercises.length}`);

// Device comparison and boot visual present
const explanationIds = new Set((grundlagenLesson?.explanations || []).map((e) => e.id));
assert('Gerätevergleich-Visualisierung vorhanden', explanationIds.has('geraete-compare-visual'));
assert('Boot-Ablauf-Visualisierung vorhanden', explanationIds.has('boot-visual'));
assert('CLI-Hilfesystem-Erklärung vorhanden', explanationIds.has('cli-hilfe-classic'));

// Conversation topics exist and have questions
const grundlagenConv = CONVERSATION_TOPICS[grundlagenKey];
assert('Cisco Grundlagen Conversation existiert', !!grundlagenConv);
assert('Cisco Grundlagen Conversation hat Fragen', (grundlagenConv?.questions?.length || 0) > 0, `count=${grundlagenConv?.questions?.length}`);

const basicConfigConv = CONVERSATION_TOPICS[basicConfigKey];
assert('Basic Device Configuration Conversation existiert', !!basicConfigConv);
assert('Basic Device Configuration Conversation hat Fragen', (basicConfigConv?.questions?.length || 0) > 0, `count=${basicConfigConv?.questions?.length}`);

// Knowledge items for both topics
const grundlagenKnowledge = CISCO_THEORY_ITEMS.filter((item) => item.topicKey === grundlagenKey);
assert('Cisco Grundlagen Knowledge Items vorhanden', grundlagenKnowledge.length > 0, `count=${grundlagenKnowledge.length}`);

const basicConfigKnowledge = CISCO_THEORY_ITEMS.filter((item) => item.topicKey === basicConfigKey);
assert('Basic Device Configuration Knowledge Items vorhanden', basicConfigKnowledge.length > 0, `count=${basicConfigKnowledge.length}`);

// Skill tree uses existing topics
const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const ciscoSkills = SKILL_TREE.cisco?.skills || {};
const lessonTopics = new Set();
Object.values(ciscoSkills).forEach((skill) => {
  Object.values(skill.subskills || {}).forEach((sub) => {
    if (sub.lessonTopic) lessonTopics.add(sub.lessonTopic);
  });
});
const invalid = [...lessonTopics].filter((k) => !validTopicKeys.has(k));
assert('Skill-Tree lessonTopic-Werte existieren im Katalog', invalid.length === 0, `invalid=${invalid.join(', ')}`);

// No duplicate knowledge item IDs
const ids = CISCO_THEORY_ITEMS.map((item) => item.id);
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
assert('Keine doppelten Knowledge-Item-IDs', new Set(duplicates).size === 0, `duplicates=${[...new Set(duplicates)].join(', ')}`);

// No duplicate exercise IDs across Cisco lessons
const allExerciseIds = [];
[grundlagenLesson, basicConfigLesson].forEach((lesson) => {
  (lesson?.exercises || []).forEach((e) => allExerciseIds.push(e.id));
});
const dupEx = allExerciseIds.filter((id, i) => allExerciseIds.indexOf(id) !== i);
assert('Keine doppelten Exercise-IDs in beiden Lektionen', new Set(dupEx).size === 0, `duplicates=${[...new Set(dupEx)].join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('Cisco Grundlagen Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
