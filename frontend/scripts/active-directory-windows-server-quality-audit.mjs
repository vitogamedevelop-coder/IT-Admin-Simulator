import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const CATEGORY = 'active-directory-virtualbox';
const WS_KEY = topicKey(CATEGORY, 'windows-server');
const DC_KEY = topicKey(CATEGORY, 'domain-controller');

const EXACT_OOS = /\b(dhcp server|dhcp scope|dhcp authorization|sysprep|ntdsutil|fsmo transfer|seize fsmo|gpo|domain join)\b/i;

console.log('=== Active Directory Windows Server Quality Audit ===');

// 1. Lesson exists
console.log('1. Checking lesson existence...');
assert(LESSONS[WS_KEY], `expected lesson ${WS_KEY}`);

// 2. Required sections
console.log('2. Checking required sections...');
const lesson = LESSONS[WS_KEY];
const requiredSections = [
  'windows-server-einstieg-classic',
  'windows-server-core-vs-gui-classic',
  'windows-server-remote-management-classic',
  'windows-server-add-server-classic',
  'windows-server-target-selection-classic',
  'windows-server-role-vs-tool-classic',
  'windows-server-powershell-classic',
  'windows-server-zusammenfassung-classic',
];
const explanationIds = lesson.explanations.map((e) => e.id);
for (const s of requiredSections) {
  assert(explanationIds.includes(s), `Windows Server lesson must include section ${s}`);
}

// 3. Lesson structure
console.log('3. Checking lesson structure...');
assert(typeof lesson.title === 'string' && lesson.title.length > 0, 'Windows Server lesson must have title');
assert(Array.isArray(lesson.explanations) && lesson.explanations.length >= 8, 'Windows Server lesson must have at least 8 explanations');
assert(Array.isArray(lesson.exercises) && lesson.exercises.length >= 3, 'Windows Server lesson must have at least 3 exercises');
assert(Array.isArray(lesson.quiz) && lesson.quiz.length >= 6 && lesson.quiz.length <= 8, 'Windows Server quiz must be 6-8 questions');
assert(Array.isArray(lesson.summary) && lesson.summary.length > 0, 'Windows Server lesson must have summary');

// 4. Guided-ui exercises
console.log('4. Checking guided-ui exercises...');
const guided = lesson.exercises.filter((ex) => ex.type === 'guided-ui');
assert(guided.length >= 2, `expected at least 2 guided-ui exercises (got ${guided.length})`);
for (const ex of guided) {
  assert(typeof ex.id === 'string' && ex.id.length, 'guided-ui exercise needs id');
  assert(Array.isArray(ex.steps) && ex.steps.length > 0, `${ex.id}: steps required`);
  for (const step of ex.steps) {
    assert(typeof step.id === 'string', `${ex.id}: step id missing`);
    assert(Array.isArray(step.targets) && step.targets.length > 1, `${ex.id}.${step.id}: targets required`);
    assert(step.correctTarget && step.targets.some((t) => t.id === step.correctTarget), `${ex.id}.${step.id}: correctTarget not in targets`);
  }
}

// 5. Out-of-scope terms
console.log('5. Checking for out-of-scope terms...');
const sourceText = JSON.stringify(lesson);
const match = sourceText.match(EXACT_OOS);
assert(!match, `Windows Server lesson contains out-of-scope term: ${match?.[0]}`);

// 6. Knowledge items
console.log('6. Checking Windows Server knowledge items...');
const wsKnowledge = getAllKnowledgeItems().filter((it) => it.topicKey === WS_KEY);
assert(wsKnowledge.length >= 5, `expected at least 5 Windows Server knowledge items (got ${wsKnowledge.length})`);

// 7. Conversation topic
console.log('7. Checking conversation topic...');
const wsConv = CONVERSATION_TOPICS[WS_KEY];
assert(wsConv, 'Windows Server conversation topic must exist');
assert(wsConv.questions.length >= 4, `expected at least 4 conversation questions (got ${wsConv.questions.length})`);

// 8. Prerequisite chain
console.log('8. Checking prerequisite chain...');
const wsTopic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === WS_KEY);
assert(wsTopic, 'windows-server topic must exist');
const prereqLessons = (wsTopic.prerequisites || []).map((p) => {
  const ref = (() => {
    if (typeof p === 'string') {
      if (p.includes('/')) return p;
      return `${CATEGORY}/${p}`;
    }
    return `${p.categoryId || CATEGORY}/${p.topicId}`;
  })();
  return ref;
});
assert(prereqLessons.includes(DC_KEY), 'windows-server should require domain-controller');

// 9. Exercise ids unique
console.log('9. Checking exercise id uniqueness...');
const exerciseIds = new Set();
for (const ex of lesson.exercises) {
  assert(!exerciseIds.has(ex.id), `duplicate exercise id: ${ex.id}`);
  exerciseIds.add(ex.id);
}

console.log('\n=== Active Directory Windows Server Quality Audit passed ===');







