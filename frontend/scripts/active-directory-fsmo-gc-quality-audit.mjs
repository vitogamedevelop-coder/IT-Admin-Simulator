import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const CATEGORY = 'active-directory-virtualbox';
const DC_KEY = topicKey(CATEGORY, 'domain-controller');

function deriveSectionId(ex) {
  if (ex.sectionId) return ex.sectionId;
  const dash = ex.id.lastIndexOf('-');
  return dash > 0 ? ex.id.slice(0, dash) : ex.id;
}

console.log('=== Active Directory FSMO + Global Catalog Quality Audit ===');

// 1. Lesson exists
console.log('1. Checking lesson existence...');
assert(LESSONS[DC_KEY], `expected lesson ${DC_KEY}`);

// 2. Required sections
console.log('2. Checking required sections...');
const requiredSections = [
  'dc-einstieg',
  'dc-definition',
  'dc-mehrere',
  'dc-physisch-logisch',
  'dc-vs-domain-component',
  'dc-zusammenfassung',
  'fsmo-einstieg',
  'fsmo-ueberblick',
  'rid-master',
  'pdc-emulator',
  'infrastructure-master',
  'forest-roles',
  'global-catalog',
  'fsmo-gc-zusammenfassung',
];
const dcLesson = LESSONS[DC_KEY];
const sectionIds = dcLesson.explanations.map((e) => deriveSectionId(e));
for (const s of requiredSections) {
  assert(sectionIds.includes(s), `domain-controller lesson must include section ${s}`);
}

// 3. Lesson structure
console.log('3. Checking lesson structure...');
assert(typeof dcLesson.title === 'string' && dcLesson.title.length > 0, 'domain-controller lesson must have title');
assert(Array.isArray(dcLesson.explanations) && dcLesson.explanations.length >= 10, 'domain-controller lesson must have at least 10 explanations');
assert(Array.isArray(dcLesson.summary) && dcLesson.summary.length > 0, 'domain-controller lesson must have summary');

const diagramCount = dcLesson.explanations.flatMap((e) => e.blocks || []).filter((b) => b.type === 'diagram').length;
assert(diagramCount >= 5, `domain-controller lesson should have at least 5 diagrams (got ${diagramCount})`);

const exercises = dcLesson.exercises || [];
assert(exercises.length >= 5 && exercises.length <= 8, `domain-controller exercises must be 5-8 (got ${exercises.length})`);
for (const ex of exercises) {
  assert(typeof ex.question === 'string' && ex.question.length > 0, `domain-controller exercise ${ex.id} must have question`);
  assert(typeof ex.explanation === 'string' && ex.explanation.length > 0, `domain-controller exercise ${ex.id} must have explanation`);
}

const quiz = dcLesson.quiz || [];
assert(quiz.length >= 6 && quiz.length <= 8, `domain-controller quiz must be 6-8 questions (got ${quiz.length})`);
for (const q of quiz) {
  assert(Array.isArray(q.options) && q.options.length >= 2, 'domain-controller quiz question must have options');
  assert(typeof q.correct === 'number', 'domain-controller quiz question must have correct index');
}

// 4. Prohibited procedure / out-of-scope terms
console.log('4. Checking for out-of-scope procedural terms...');
const forbiddenTerms = ['NTDSUTIL', 'Sysprep', 'OU-GUI', 'Domain Join', 'MMC'];
const lessonText = JSON.stringify(dcLesson).toLowerCase();
const violations = [];
for (const term of forbiddenTerms) {
  if (lessonText.includes(term.toLowerCase())) {
    violations.push(term);
  }
}
assert.deepStrictEqual(violations, [], 'FSMO/GC lesson must not contain out-of-scope procedural terms');

// 5. Factual precision checks via keywords
console.log('5. Checking factual precision keywords...');
const expectedSnippets = [
  'multi-master',
  'ausnahm',
  'eindeutig',
  'rid-bereich',
  'rid-pool',
  'domänenzeit',
  'partial attribute set',
  'global catalog',
  'forest',
];
const lowerText = lessonText;
const missingSnippets = expectedSnippets.filter((s) => !lowerText.includes(s));
assert.strictEqual(missingSnippets.length, 0, `domain-controller lesson should mention: ${missingSnippets.join(', ')}`);

// 6. Knowledge items for FSMO + GC
console.log('6. Checking FSMO/GC knowledge items...');
const dcKnowledge = getAllKnowledgeItems().filter((i) => i.topicKey === DC_KEY);
console.log(`   Domain-controller knowledge items: ${dcKnowledge.length}`);
assert(dcKnowledge.length >= 15, 'expected at least 15 knowledge items for domain-controller (existing + FSMO/GC)');

const requiredClusters = ['ad.fsmo', 'ad.gc', 'ad.sid'];
const clusters = new Set(dcKnowledge.map((i) => i.conceptCluster));
for (const c of requiredClusters) {
  assert(clusters.has(c), `expected concept cluster ${c}`);
}

const ids = dcKnowledge.map((i) => i.id);
assert.strictEqual(new Set(ids).size, ids.length, 'no duplicate knowledge IDs within domain-controller items');

const invalidSources = [];
for (const item of dcKnowledge) {
  const lesson = LESSONS[item.sourceTopicKey];
  if (!lesson) {
    invalidSources.push({ item: item.id, reason: 'sourceTopicKey missing lesson', sourceTopicKey: item.sourceTopicKey });
    continue;
  }
  const explanationIds = (lesson.explanations || []).map((e) => e.id);
  if (!explanationIds.includes(item.sourceSection)) {
    invalidSources.push({ item: item.id, reason: 'sourceSection not found', sourceSection: item.sourceSection });
  }
}
assert.deepStrictEqual(invalidSources, [], 'all domain-controller knowledge items must reference valid source sections');

// 7. Conversation topic coverage
console.log('7. Checking conversation topics...');
const dcConv = CONVERSATION_TOPICS[DC_KEY];
assert(dcConv, `expected conversation topic for ${DC_KEY}`);
assert(Array.isArray(dcConv.questions) && dcConv.questions.length >= 6, 'expected at least 6 conversation questions for domain-controller');
const convIds = dcConv.questions.map((q) => q.id);
assert.strictEqual(new Set(convIds).size, convIds.length, 'conversation question IDs must be unique');
const fsmoQuestions = dcConv.questions.filter((q) =>
  /fsmo|rid|pdc|infrastructure|schema|domain naming|global catalog/gi.test(q.text)
);
assert(fsmoQuestions.length >= 4, 'expected at least 4 FSMO/GC conversation questions');

// 8. No guided-ui in this conceptual block
console.log('8. Checking no guided-ui exercises...');
const guidedUiExercise = exercises.find((ex) => ex.type === 'guided-ui');
assert(!guidedUiExercise, 'FSMO/GC lesson should not use guided-ui exercises');

// 9. Prerequisite chain
console.log('9. Checking prerequisite chain...');
const dcTopic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === DC_KEY);
assert(dcTopic, 'domain-controller topic must exist');
const prereqLessons = (dcTopic.prerequisites || []).map((p) => (typeof p === 'string' ? p : topicKey(p.categoryId || CATEGORY, p.topicId)));
const hasDomainPrereq = prereqLessons.includes(topicKey(CATEGORY, 'domain'));
assert(hasDomainPrereq, 'domain-controller should require domain');

console.log('\n=== Active Directory FSMO + Global Catalog Quality Audit passed ===');






