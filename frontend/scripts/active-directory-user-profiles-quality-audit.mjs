import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { selectDirectTheoryExercises, getDirectExerciseLimit } from '../src/lib/lessonExerciseSelector.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const UP_KEY = topicKey('active-directory-virtualbox', 'ad-user-profiles');
const OUT_OF_SCOPE = /\b(ntfs|share permission|smb|gpo|agdlp|everyone|authenticated users)\b/i;

console.log('=== Active Directory User Profiles Quality Audit ===');

console.log('1. Checking lesson existence...');
assert(LESSONS[UP_KEY], `expected lesson ${UP_KEY}`);

console.log('2. Checking required sections...');
const lesson = LESSONS[UP_KEY];
const requiredSections = [
  'adup-einstieg',
  'adup-konto-vs-profil',
  'adup-kontoarten',
  'adup-profil-lokal',
  'adup-profil-roaming',
  'adup-profil-performance',
  'adup-ordnerumleitung',
  'adup-ordnerumleitung-vs-roaming',
  'adup-offline-nuance',
  'adup-pfad-einstieg',
  'adup-profilpfad',
  'adup-homeordner',
  'adup-home-vs-profil',
  'adup-unc',
  'adup-lokal-vs-unc',
  'adup-username-variable',
  'adup-pfad-abhaengigkeit',
  'adup-dollar-nuance',
  'adup-admin-tier',
];
const explanationIds = lesson.explanations.map((e) => e.id);
for (const s of requiredSections) {
  assert(explanationIds.includes(s), `ad-user-profiles lesson must include section ${s}`);
}

console.log('3. Checking lesson structure...');
assert(typeof lesson.title === 'string' && lesson.title.length > 0, 'title required');
assert(Array.isArray(lesson.explanations) && lesson.explanations.length >= 12, 'at least 12 explanations');
assert(Array.isArray(lesson.exercises) && lesson.exercises.length >= 5, 'at least 5 exercises');
assert(Array.isArray(lesson.quiz) && lesson.quiz.length >= 6 && lesson.quiz.length <= 8, 'quiz 6-8');
assert(Array.isArray(lesson.summary) && lesson.summary.length > 0, 'summary required');

console.log('4. Checking guided-ui...');
const guided = lesson.exercises.filter((ex) => ex.type === 'guided-ui');
assert(guided.length >= 1, `expected at least 1 guided-ui for this block, got ${guided.length}`);
const pathGuided = lesson.exercises.find((ex) => ex.id === 'ad-user-profile-home-path-guided-ui');
assert(pathGuided, 'ad-user-profile-home-path-guided-ui must exist');

console.log('5. Checking direct exercise load...');
const selected = selectDirectTheoryExercises(lesson.exercises || [], UP_KEY);
const limit = getDirectExerciseLimit(lesson.exercises.length);
assert(selected.length >= 3 && selected.length <= 5, `direct exercises should be 3-5, got ${selected.length}`);
assert.strictEqual(selected.length, Math.min(lesson.exercises.length, limit), 'selector consistency');

console.log('6. Checking out-of-scope terms...');
const sourceText = JSON.stringify(lesson);
const match = sourceText.match(OUT_OF_SCOPE);
assert(!match, `lesson contains out-of-scope term: ${match?.[0]}`);

console.log('7. Checking knowledge items...');
const upKnowledge = getAllKnowledgeItems().filter((it) => it.topicKey === UP_KEY);
assert(upKnowledge.length >= 8, `expected at least 8 knowledge items, got ${upKnowledge.length}`);
for (const it of upKnowledge) {
  assert(explanationIds.includes(it.sourceSection), `knowledge item ${it.id} references missing section ${it.sourceSection}`);
}

console.log('8. Checking conversation topic...');
const upConv = CONVERSATION_TOPICS[UP_KEY];
assert(upConv, 'conversation topic must exist');
assert(upConv.questions.length >= 4, `expected at least 4 conversation questions, got ${upConv.questions.length}`);

console.log('9. Checking prerequisite chain...');
const upTopic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === UP_KEY);
assert(upTopic, 'ad-user-profiles topic must exist');
const prereqs = upTopic.prerequisites || [];
assert(prereqs.length > 0, 'ad-user-profiles should have prerequisites');

console.log('10. Checking exercise id uniqueness...');
const exerciseIds = new Set();
for (const ex of lesson.exercises) {
  assert(!exerciseIds.has(ex.id), `duplicate exercise id: ${ex.id}`);
  exerciseIds.add(ex.id);
}

console.log('\n=== Active Directory User Profiles Quality Audit passed ===');







