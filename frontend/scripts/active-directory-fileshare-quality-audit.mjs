import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { selectDirectTheoryExercises, getDirectExerciseLimit } from '../src/lib/lessonExerciseSelector.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const SHARES_KEY = topicKey('active-directory-virtualbox', 'shares');
const OUT_OF_SCOPE = /\b(ntfs|share permission|everyone|authenticated users|inheritance|acl|full control|read only|change)\b/i;

console.log('=== Active Directory Fileserver & Shares Quality Audit ===');

console.log('1. Checking lesson existence...');
assert(LESSONS[SHARES_KEY], `expected lesson ${SHARES_KEY}`);

console.log('2. Checking required sections...');
const lesson = LESSONS[SHARES_KEY];
const requiredSections = [
  'ads-einstieg',
  'ads-fileserver',
  'ads-gui-core',
  'ads-fileserver-role',
  'ads-freigabe-definition',
  'ads-smb',
  'ads-nfs-basic',
  'ads-smb-quick',
  'ads-target-server',
  'ads-path',
  'ads-share-name',
  'ads-hidden-share',
  'ads-abe',
  'ads-caching-encryption',
  'ads-next-permissions',
];
const explanationIds = lesson.explanations.map((e) => e.id);
for (const s of requiredSections) {
  assert(explanationIds.includes(s), `shares lesson must include section ${s}`);
}

console.log('3. Checking lesson structure...');
assert(typeof lesson.title === 'string' && lesson.title.length > 0, 'title required');
assert(Array.isArray(lesson.explanations) && lesson.explanations.length >= 12, 'at least 12 explanations');
assert(Array.isArray(lesson.exercises) && lesson.exercises.length >= 5, 'at least 5 exercises');
assert(Array.isArray(lesson.quiz) && lesson.quiz.length >= 6 && lesson.quiz.length <= 8, 'quiz 6-8');
assert(Array.isArray(lesson.summary) && lesson.summary.length > 0, 'summary required');

console.log('4. Checking guided-ui...');
const guided = lesson.exercises.filter((ex) => ex.type === 'guided-ui');
assert(guided.length >= 2, `expected at least 2 guided-ui for this block, got ${guided.length}`);
const roleGuided = lesson.exercises.find((ex) => ex.id === 'ad-fileserver-role-guided-ui');
assert(roleGuided, 'ad-fileserver-role-guided-ui must exist');
const shareGuided = lesson.exercises.find((ex) => ex.id === 'ad-fileshare-create-guided-ui');
assert(shareGuided, 'ad-fileshare-create-guided-ui must exist');

console.log('5. Checking direct exercise load...');
const selected = selectDirectTheoryExercises(lesson.exercises || [], SHARES_KEY);
const limit = getDirectExerciseLimit(lesson.exercises.length);
assert(selected.length >= 3 && selected.length <= 4, `direct exercises should be 3-4, got ${selected.length}`);
assert.strictEqual(selected.length, Math.min(lesson.exercises.length, limit), 'selector consistency');

console.log('6. Checking out-of-scope terms...');
const sourceText = JSON.stringify(lesson);
const match = sourceText.match(OUT_OF_SCOPE);
assert(!match, `lesson contains out-of-scope term: ${match?.[0]}`);

console.log('7. Checking knowledge items...');
const sharesKnowledge = getAllKnowledgeItems().filter((it) => it.topicKey === SHARES_KEY);
assert(sharesKnowledge.length >= 8, `expected at least 8 knowledge items, got ${sharesKnowledge.length}`);
for (const it of sharesKnowledge) {
  assert(explanationIds.includes(it.sourceSection), `knowledge item ${it.id} references missing section ${it.sourceSection}`);
}

console.log('8. Checking conversation topic...');
const sharesConv = CONVERSATION_TOPICS[SHARES_KEY];
assert(sharesConv, 'conversation topic must exist');
assert(sharesConv.questions.length >= 4, `expected at least 4 conversation questions, got ${sharesConv.questions.length}`);

console.log('9. Checking prerequisite chain...');
const sharesTopic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === SHARES_KEY);
assert(sharesTopic, 'shares topic must exist');
const prereqs = sharesTopic.prerequisites || [];
assert(prereqs.length > 0, 'shares should have prerequisites');

console.log('10. Checking exercise id uniqueness...');
const exerciseIds = new Set();
for (const ex of lesson.exercises) {
  assert(!exerciseIds.has(ex.id), `duplicate exercise id: ${ex.id}`);
  exerciseIds.add(ex.id);
}

console.log('\n=== Active Directory Fileserver & Shares Quality Audit passed ===');




