import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { selectDirectTheoryExercises, getDirectExerciseLimit } from '../src/lib/lessonExerciseSelector.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const KEY = topicKey('active-directory-virtualbox', 'ntfs-permissions');
const BAD_UNIVERSAL_RECIPE = /nur\s+Administrator\s+auf\s+Root|Authenticated\s+Users\s+Full\s+Control|Home\s*=\s*nur\s+Administrator|Profile\s*=\s*Authenticated\s+Users\s+Read\/Write/i;
const BAD_DOLLAR_MISCONCEPTION = /\$\s*=\s*Sicherheit|\$\s*schützt|\$\s*=\s*geschützt/i;

console.log('=== Active Directory Home & Profile Share Security Quality Audit ===');

console.log('1. Checking lesson existence...');
assert(LESSONS[KEY], `expected lesson ${KEY}`);

console.log('2. Checking required home/profile sections...');
const lesson = LESSONS[KEY];
const requiredSections = [
  'adn-home-profile-einstieg',
  'adn-home-vs-profile',
  'adn-dollar-nuance',
  'adn-root-vs-child',
  'adn-home-practice',
  'adn-profile-practice',
  'adn-authenticated-users-nuance',
  'adn-creation',
  'adn-verification',
];
const explanationIds = lesson.explanations.map((e) => e.id);
for (const s of requiredSections) {
  assert(explanationIds.includes(s), `home/profile security lesson must include section ${s}`);
}

console.log('3. Checking lesson structure...');
assert(typeof lesson.title === 'string' && lesson.title.length > 0, 'title required');
assert(Array.isArray(lesson.explanations) && lesson.explanations.length >= 12, 'at least 12 explanations');
assert(Array.isArray(lesson.exercises) && lesson.exercises.length >= 6, 'at least 6 exercises');
assert(Array.isArray(lesson.quiz) && lesson.quiz.length >= 6 && lesson.quiz.length <= 8, 'quiz 6-8');
assert(Array.isArray(lesson.summary) && lesson.summary.length > 0, 'summary required');

console.log('4. Checking home/profile guided-ui...');
const guided = lesson.exercises.filter((ex) => ex.type === 'guided-ui');
assert(guided.length >= 2, `expected at least 2 guided-ui, got ${guided.length}`);
assert(lesson.exercises.find((ex) => ex.id === 'ad-home-share-permissions-guided-ui'), 'ad-home-share-permissions-guided-ui must exist');
assert(lesson.exercises.find((ex) => ex.id === 'ad-profile-share-permissions-guided-ui'), 'ad-profile-share-permissions-guided-ui must exist');

console.log('5. Checking direct exercise load...');
const selected = selectDirectTheoryExercises(lesson.exercises || [], KEY);
const limit = getDirectExerciseLimit(lesson.exercises.length);
assert(selected.length >= 3 && selected.length <= 6, `direct exercises should be 3-6, got ${selected.length}`);
assert.strictEqual(selected.length, Math.min(lesson.exercises.length, limit), 'selector consistency');

console.log('6. Checking source precision...');
const sourceText = JSON.stringify(lesson);
assert(!BAD_UNIVERSAL_RECIPE.test(sourceText), 'lesson must not present a simplistic universal Home/Profile ACL recipe');
assert(!BAD_DOLLAR_MISCONCEPTION.test(sourceText), 'lesson must not claim $ equals security');

const homePractice = lesson.explanations.find((e) => e.id === 'adn-home-practice');
assert(homePractice, 'adn-home-practice must exist');
const homeText = JSON.stringify(homePractice).toLowerCase();
assert(homeText.includes('eigen') && homeText.includes('fremd'), 'home practice must explain own vs foreign access');

const profilePractice = lesson.explanations.find((e) => e.id === 'adn-profile-practice');
assert(profilePractice, 'adn-profile-practice must exist');
const profileText = JSON.stringify(profilePractice).toLowerCase();
assert(profileText.includes('les') && profileText.includes('schreib'), 'profile practice must explain read+write for the user');

const authUsers = lesson.explanations.find((e) => e.id === 'adn-authenticated-users-nuance');
assert(authUsers, 'adn-authenticated-users-nuance must exist');
const authText = JSON.stringify(authUsers).toLowerCase();
assert(authText.includes('breit') || authText.includes('bewusst'), 'Authenticated Users nuance must warn about broad scope');

const verification = lesson.explanations.find((e) => e.id === 'adn-verification');
assert(verification, 'adn-verification must exist');
const verText = JSON.stringify(verification).toLowerCase();
assert(verText.includes('anmeldung') || verText.includes('h:') || verText.includes('profil'), 'verification must mention concrete checks');

console.log('7. Checking knowledge items...');
const ntfsKnowledge = getAllKnowledgeItems().filter((it) => it.topicKey === KEY);
assert(ntfsKnowledge.length >= 8, `expected at least 8 knowledge items, got ${ntfsKnowledge.length}`);
for (const it of ntfsKnowledge) {
  assert(explanationIds.includes(it.sourceSection), `knowledge item ${it.id} references missing section ${it.sourceSection}`);
}
const homeKnowledgeIds = ['adn.homeProfilePath', 'adn.rootVsChild', 'adn.ownForeign', 'adn.profileWrite', 'adn.verified'];
for (const k of homeKnowledgeIds) {
  assert(ntfsKnowledge.some((it) => it.id === k), `home/profile knowledge item ${k} must exist`);
}

console.log('8. Checking conversation topic...');
const conv = CONVERSATION_TOPICS[KEY];
assert(conv, 'conversation topic must exist');
assert(conv.questions.length >= 8, `expected at least 8 conversation questions, got ${conv.questions.length}`);
const convText = JSON.stringify(conv).toLowerCase();
assert(convText.includes('h:') || convText.includes('home') || convText.includes('profil'), 'conversation must include home/profile questions');

console.log('9. Checking prerequisite chain...');
const topic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === KEY);
assert(topic, 'ntfs-permissions topic must exist');
const prereqs = topic.prerequisites || [];
assert(prereqs.length > 0, 'ntfs-permissions should have prerequisites');
assert(prereqs.includes('shares'), 'shares should be a prerequisite');

console.log('10. Checking exercise id uniqueness...');
const exerciseIds = new Set();
for (const ex of lesson.exercises) {
  assert(!exerciseIds.has(ex.id), `duplicate exercise id: ${ex.id}`);
  exerciseIds.add(ex.id);
}

console.log('\n=== Active Directory Home & Profile Share Security Quality Audit passed ===');


