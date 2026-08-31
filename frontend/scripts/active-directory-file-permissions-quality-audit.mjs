import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { selectDirectTheoryExercises, getDirectExerciseLimit } from '../src/lib/lessonExerciseSelector.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const NTFS_KEY = topicKey('active-directory-virtualbox', 'ntfs-permissions');
const BAD_HOME_ACL = /Home\$|Profile\$|Creator\s+Owner/i;

console.log('=== Active Directory File Permissions Quality Audit ===');

console.log('1. Checking lesson existence...');
assert(LESSONS[NTFS_KEY], `expected lesson ${NTFS_KEY}`);

console.log('2. Checking required sections...');
const lesson = LESSONS[NTFS_KEY];
const requiredSections = [
  'adn-einstieg',
  'adn-share-definition',
  'adn-ntfs-definition',
  'adn-principal',
  'adn-user-vs-group',
  'adn-ntfs-levels',
  'adn-share-levels',
  'adn-local-vs-network',
  'adn-two-gates',
  'adn-effective',
  'adn-source-correction',
  'adn-nexus-standard',
  'adn-everyone-authusers',
  'adn-inheritance',
  'adn-disable-inheritance',
  'adn-convert-remove',
  'adn-deny',
  'adn-no-home-profile',
];
const explanationIds = lesson.explanations.map((e) => e.id);
for (const s of requiredSections) {
  assert(explanationIds.includes(s), `ntfs-permissions lesson must include section ${s}`);
}

console.log('3. Checking lesson structure...');
assert(typeof lesson.title === 'string' && lesson.title.length > 0, 'title required');
assert(Array.isArray(lesson.explanations) && lesson.explanations.length >= 12, 'at least 12 explanations');
assert(Array.isArray(lesson.exercises) && lesson.exercises.length >= 6, 'at least 6 exercises');
assert(Array.isArray(lesson.quiz) && lesson.quiz.length >= 6 && lesson.quiz.length <= 8, 'quiz 6-8');
assert(Array.isArray(lesson.summary) && lesson.summary.length > 0, 'summary required');

console.log('4. Checking guided-ui...');
const guided = lesson.exercises.filter((ex) => ex.type === 'guided-ui');
assert(guided.length >= 2, `expected at least 2 guided-ui, got ${guided.length}`);
assert(lesson.exercises.find((ex) => ex.id === 'ad-ntfs-permission-guided-ui'), 'ad-ntfs-permission-guided-ui must exist');
assert(lesson.exercises.find((ex) => ex.id === 'ad-share-permission-guided-ui'), 'ad-share-permission-guided-ui must exist');
assert(lesson.exercises.find((ex) => ex.id === 'ad-effective-permission-guided-ui'), 'ad-effective-permission-guided-ui must exist');

console.log('5. Checking direct exercise load...');
const selected = selectDirectTheoryExercises(lesson.exercises || [], NTFS_KEY);
const limit = getDirectExerciseLimit(lesson.exercises.length);
assert(selected.length >= 3 && selected.length <= 4, `direct exercises should be 3-4, got ${selected.length}`);
assert.strictEqual(selected.length, Math.min(lesson.exercises.length, limit), 'selector consistency');

console.log('6. Checking source precision (home/profile ACLs and source correction)...');
const sourceCorrection = lesson.explanations.find((e) => e.id === 'adn-source-correction');
assert(sourceCorrection, 'adn-source-correction section must exist to address misleading source claim');
assert(JSON.stringify(sourceCorrection).toLowerCase().includes('restriktivere'), 'source correction must explain restrictive combination');
assert(JSON.stringify(sourceCorrection).toLowerCase().includes('wirken beide zusammen'), 'source correction must explain both share and NTFS apply');
const noHomeAcl = lesson.explanations.find((e) => e.id === 'adn-no-home-profile');
assert(noHomeAcl, 'adn-no-home-profile section must exist');
const contentExplanations = JSON.stringify(lesson.explanations.filter((e) => e.id !== 'adn-no-home-profile'));
const match = contentExplanations.match(BAD_HOME_ACL);
assert(!match, `lesson contains home/profile ACL special case: ${match?.[0]}`);

console.log('7. Checking knowledge items...');
const ntfsKnowledge = getAllKnowledgeItems().filter((it) => it.topicKey === NTFS_KEY);
assert(ntfsKnowledge.length >= 8, `expected at least 8 knowledge items, got ${ntfsKnowledge.length}`);
for (const it of ntfsKnowledge) {
  assert(explanationIds.includes(it.sourceSection), `knowledge item ${it.id} references missing section ${it.sourceSection}`);
}

console.log('8. Checking conversation topic...');
const ntfsConv = CONVERSATION_TOPICS[NTFS_KEY];
assert(ntfsConv, 'conversation topic must exist');
assert(ntfsConv.questions.length >= 4, `expected at least 4 conversation questions, got ${ntfsConv.questions.length}`);

console.log('9. Checking prerequisite chain...');
const ntfsTopic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === NTFS_KEY);
assert(ntfsTopic, 'ntfs-permissions topic must exist');
const prereqs = ntfsTopic.prerequisites || [];
assert(prereqs.length > 0, 'ntfs-permissions should have prerequisites');
assert(prereqs.includes('shares'), 'shares should be a prerequisite');

console.log('10. Checking exercise id uniqueness...');
const exerciseIds = new Set();
for (const ex of lesson.exercises) {
  assert(!exerciseIds.has(ex.id), `duplicate exercise id: ${ex.id}`);
  exerciseIds.add(ex.id);
}

console.log('\n=== Active Directory File Permissions Quality Audit passed ===');
