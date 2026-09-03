import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { selectDirectTheoryExercises, getDirectExerciseLimit } from '../src/lib/lessonExerciseSelector.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const USERS_KEY = topicKey('active-directory-virtualbox', 'users');

console.log('=== Active Directory User Template Quality Audit ===');

console.log('1. Checking lesson existence...');
assert(LESSONS[USERS_KEY], `expected lesson ${USERS_KEY}`);

console.log('2. Checking required sections...');
const lesson = LESSONS[USERS_KEY];
const requiredSections = [
  'adusrtemplate-einstieg',
  'adusrtemplate-begriff',
  'adusrtemplate-namensgebung',
  'adusrtemplate-status',
  'adusrtemplate-einstellungen',
  'adusrtemplate-username',
  'adusrtemplate-copy',
  'adusrtemplate-nicht-100',
  'adusrtemplate-verifikation',
  'adusrtemplate-troubleshooting',
];
const explanationIds = lesson.explanations.map((e) => e.id);
for (const s of requiredSections) {
  assert(explanationIds.includes(s), `users lesson must include section ${s}`);
}

console.log('3. Checking lesson structure...');
assert(typeof lesson.title === 'string' && lesson.title.length > 0, 'title required');
assert(Array.isArray(lesson.explanations) && lesson.explanations.length >= 15, 'at least 15 explanations');
assert(Array.isArray(lesson.exercises) && lesson.exercises.length >= 10, 'at least 10 exercises');
assert(Array.isArray(lesson.quiz) && lesson.quiz.length >= 10 && lesson.quiz.length <= 15, 'quiz 10-15');
assert(Array.isArray(lesson.summary) && lesson.summary.length > 0, 'summary required');

console.log('4. Checking template presence...');
const full = JSON.stringify(lesson);
assert(full.includes('_Vorlage') || full.includes('%username%'), 'template concept must be present');
assert(full.includes('%username%'), 'username variable must be present');
assert(full.includes('disabled'), 'disabled state must be mentioned');
assert(full.includes('Kopieren') || full.includes('Copy'), 'copy action must be present');

console.log('5. Checking guided-ui...');
const guided = lesson.exercises.filter((ex) => ex.type === 'guided-ui');
assert(guided.length >= 4, `expected at least 4 guided-ui, got ${guided.length}`);
assert(lesson.exercises.find((ex) => ex.id === 'ad-user-template-create-guided-ui'), 'ad-user-template-create-guided-ui must exist');
assert(lesson.exercises.find((ex) => ex.id === 'ad-user-template-copy-guided-ui'), 'ad-user-template-copy-guided-ui must exist');

console.log('6. Checking direct exercise load...');
const selected = selectDirectTheoryExercises(lesson.exercises || [], USERS_KEY);
const limit = getDirectExerciseLimit(lesson.exercises.length);
assert(selected.length >= 3 && selected.length <= 6, `direct exercises should be 3-6, got ${selected.length}`);
assert.strictEqual(selected.length, Math.min(lesson.exercises.length, limit), 'selector consistency');

console.log('7. Checking knowledge items...');
const items = getAllKnowledgeItems().filter((it) => it.topicKey === USERS_KEY);
assert(items.length >= 16, `expected at least 16 knowledge items, got ${items.length}`);
for (const it of items) {
  assert(explanationIds.includes(it.sourceSection), `knowledge item ${it.id} references missing section ${it.sourceSection}`);
}

console.log('8. Checking conversation topic...');
const conv = CONVERSATION_TOPICS[USERS_KEY];
assert(conv, 'conversation topic must exist');
assert(conv.questions.length >= 10, `expected at least 10 conversation questions, got ${conv.questions.length}`);

console.log('9. Checking prerequisite chain...');
const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === USERS_KEY);
assert(topic, 'users topic must exist');
const prereqs = topic.prerequisites || [];
assert(prereqs.length > 0, 'users should have prerequisites');
assert(prereqs.includes('organizational-units'), 'organizational-units should be a prerequisite');

console.log('10. Checking exercise id uniqueness...');
const exerciseIds = new Set();
for (const ex of lesson.exercises) {
  assert(!exerciseIds.has(ex.id), `duplicate exercise id: ${ex.id}`);
  exerciseIds.add(ex.id);
}

console.log('\n=== Active Directory User Template Quality Audit passed ===');





