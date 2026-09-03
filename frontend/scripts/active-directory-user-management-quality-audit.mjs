import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { selectDirectTheoryExercises, getDirectExerciseLimit } from '../src/lib/lessonExerciseSelector.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const USERS_KEY = topicKey('active-directory-virtualbox', 'users');
const OUT_OF_SCOPE = /\b(gpo|agdlp)\b/i;

console.log('=== Active Directory User Management Quality Audit ===');

console.log('1. Checking topic/lesson existence...');
const usersTopic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === USERS_KEY);
assert(usersTopic, 'users topic must exist in ACADEMY_TOPICS');
assert(LESSONS[USERS_KEY], `expected lesson ${USERS_KEY}`);

console.log('2. Checking required sections...');
const lesson = LESSONS[USERS_KEY];
const requiredSections = [
  'adusers-einstieg',
  'adusers-wer-darf',
  'adusers-creation-flow',
  'adusers-name-vs-logon',
  'adusers-eindeutigkeit',
  'adusers-kennwort',
  'adusers-eigenschaften',
  'adusers-ou-vs-workstation',
  'adusers-expiry',
  'adusers-gruppen',
  'adusers-computerkonto',
  'adusers-powershell',
];
const explanationIds = lesson.explanations.map((e) => e.id);
for (const s of requiredSections) {
  assert(explanationIds.includes(s), `users lesson must include section ${s}`);
}

console.log('3. Checking lesson structure...');
assert(typeof lesson.title === 'string' && lesson.title.length > 0, 'title required');
assert(Array.isArray(lesson.explanations) && lesson.explanations.length >= 10, 'at least 10 explanations');
assert(Array.isArray(lesson.exercises) && lesson.exercises.length >= 6, 'at least 6 exercises');
assert(Array.isArray(lesson.quiz) && lesson.quiz.length >= 6, 'quiz at least 6');
assert(Array.isArray(lesson.summary) && lesson.summary.length > 0, 'summary required');

console.log('4. Checking guided-ui exercises...');
const guided = lesson.exercises.filter((ex) => ex.type === 'guided-ui');
assert(guided.length >= 2, `expected at least 2 guided-ui exercises, got ${guided.length}`);
for (const ex of guided) {
  assert(Array.isArray(ex.steps) && ex.steps.length >= 1, `${ex.id} must have steps`);
  for (const step of ex.steps) {
    assert(Array.isArray(step.targets) && step.targets.length >= 2, `${step.id} needs multiple targets`);
    assert(step.correctTarget, `${step.id} needs correctTarget`);
  }
}

console.log('5. Checking direct exercise load...');
const selected = selectDirectTheoryExercises(lesson.exercises || [], USERS_KEY);
const limit = getDirectExerciseLimit(lesson.exercises.length);
assert(selected.length >= 3 && selected.length <= 6, `direct exercises should be 3-6, got ${selected.length}`);
assert.strictEqual(selected.length, Math.min(lesson.exercises.length, limit), 'selector consistency');

console.log('6. Checking out-of-scope terms...');
const sourceText = JSON.stringify(lesson);
const match = sourceText.match(OUT_OF_SCOPE);
assert(!match, `lesson contains out-of-scope term: ${match?.[0]}`);

console.log('7. Checking knowledge items...');
const usersKnowledge = getAllKnowledgeItems().filter((it) => it.topicKey === USERS_KEY);
assert(usersKnowledge.length >= 5, `expected at least 5 knowledge items, got ${usersKnowledge.length}`);
for (const it of usersKnowledge) {
  assert(explanationIds.includes(it.sourceSection), `knowledge item ${it.id} references missing section ${it.sourceSection}`);
}

console.log('8. Checking conversation topic...');
const usersConv = CONVERSATION_TOPICS[USERS_KEY];
assert(usersConv, 'conversation topic must exist');
assert(usersConv.questions.length >= 4, `expected at least 4 conversation questions, got ${usersConv.questions.length}`);

console.log('9. Checking prerequisite chain...');
const prereqs = usersTopic.prerequisites || [];
assert(prereqs.length > 0, 'users should have prerequisites');

console.log('10. Checking exercise id uniqueness...');
const exerciseIds = new Set();
for (const ex of lesson.exercises) {
  assert(!exerciseIds.has(ex.id), `duplicate exercise id: ${ex.id}`);
  exerciseIds.add(ex.id);
}

console.log('\n=== Active Directory User Management Quality Audit passed ===');








