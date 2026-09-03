import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const CATEGORY = 'active-directory-virtualbox';
const DOMAIN_KEY = topicKey(CATEGORY, 'domain');
const OU_KEY = topicKey(CATEGORY, 'organizational-units');
const DC_KEY = topicKey(CATEGORY, 'domain-controller');

const LESSON_KEYS = [DOMAIN_KEY, OU_KEY, DC_KEY];

function deriveSectionId(ex) {
  if (ex.sectionId) return ex.sectionId;
  const dash = ex.id.lastIndexOf('-');
  return dash > 0 ? ex.id.slice(0, dash) : ex.id;
}

console.log('=== Active Directory Logical Components Quality Audit ===');

// 1. Lessons exist
console.log('1. Checking lesson existence...');
for (const key of LESSON_KEYS) {
  assert(LESSONS[key], `expected lesson ${key}`);
}

// 2. Topic metadata matches lesson count bump
console.log('2. Checking AD topic/lesson counts...');
const adTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === CATEGORY);
const adLessons = adTopics.filter((t) => LESSONS[topicKey(t.categoryId, t.topicId)]);
console.log(`   AD topics: ${adTopics.length}; AD lessons: ${adLessons.length}`);
assert(adLessons.length >= 6, 'expected at least 6 AD lessons (foundation + logical components)');

// 3. Each lesson has required structure
console.log('3. Checking lesson structure...');
const requiredSectionsByKey = {
  [DOMAIN_KEY]: ['domain-einstieg', 'domain-logisch-physikalisch', 'domain-rueckblick', 'domain-definition', 'domain-vs-ou', 'domain-vs-dc', 'domain-zusammenfassung'],
  [OU_KEY]: ['ou-einstieg', 'ou-definition', 'ou-vs-gruppe', 'ou-hierarchie', 'dn-einfuehrung', 'dn-dc-missverstaendnis', 'ou-zusammenfassung'],
  [DC_KEY]: ['dc-einstieg', 'dc-definition', 'dc-mehrere', 'dc-physisch-logisch', 'dc-vs-domain-component', 'dc-zusammenfassung'],
};

for (const key of LESSON_KEYS) {
  const lesson = LESSONS[key];
  assert(typeof lesson.title === 'string' && lesson.title.length > 0, `${key} must have title`);
  assert(Array.isArray(lesson.explanations) && lesson.explanations.length >= 5, `${key} must have at least 5 explanations`);
  assert(Array.isArray(lesson.summary) && lesson.summary.length > 0, `${key} must have summary`);

  const sectionIds = lesson.explanations.map((e) => deriveSectionId(e));
  const required = requiredSectionsByKey[key];
  for (const s of required) {
    assert(sectionIds.includes(s), `${key} must include section ${s}`);
  }

  const diagramCount = lesson.explanations.flatMap((e) => e.blocks || []).filter((b) => b.type === 'diagram').length;
  assert(diagramCount >= 2, `${key} must contain at least 2 diagrams`);

  const exercises = lesson.exercises || [];
  assert(exercises.length >= 3 && exercises.length <= 8, `${key} exercises must be 3-8 (got ${exercises.length})`);
  for (const ex of exercises) {
    assert(typeof ex.question === 'string' && ex.question.length > 0, `${key} exercise ${ex.id} must have question`);
    assert(typeof ex.explanation === 'string' && ex.explanation.length > 0, `${key} exercise ${ex.id} must have explanation`);
  }

  const quiz = lesson.quiz || [];
  assert(quiz.length >= 6 && quiz.length <= 8, `${key} quiz must be 6-8 questions (got ${quiz.length})`);
  for (const q of quiz) {
    assert(Array.isArray(q.options) && q.options.length >= 2, `${key} quiz question must have options`);
    assert(typeof q.correct === 'number', `${key} quiz question must have correct index`);
  }
}

// 4. No FSMO / Global Catalog / GUI procedure / later topics sneak in
console.log('4. Checking for out-of-scope terms...');
const forbiddenTerms = ['Sysprep', 'NTDSUTIL', 'OU-GUI', 'MMC', 'Domain Join', 'GPO'];
const violations = [];
for (const key of [DOMAIN_KEY, OU_KEY]) {
  const lessonText = JSON.stringify(LESSONS[key]).toLowerCase();
  for (const term of forbiddenTerms) {
    if (lessonText.includes(term.toLowerCase())) {
      violations.push({ key, term });
    }
  }
}
assert.deepStrictEqual(violations, [], 'domain and OU lessons must not contain out-of-scope terms');

// 5. Knowledge items for these topics
console.log('5. Checking logical-components knowledge items...');
const logicalKnowledge = getAllKnowledgeItems().filter((i) => [DOMAIN_KEY, OU_KEY, DC_KEY].includes(i.topicKey));
console.log(`   Logical components knowledge items: ${logicalKnowledge.length}`);
assert(logicalKnowledge.length >= 10, 'expected at least 10 knowledge items for logical components');

const requiredClusters = [
  'ad.logicalPhysical',
  'ad.domain',
  'ad.ou',
  'ad.object',
  'ad.dn',
  'ad.dc',
];
const clusters = new Set(logicalKnowledge.map((i) => i.conceptCluster));
for (const c of requiredClusters) {
  assert(clusters.has(c), `expected concept cluster ${c}`);
}

const idCounts = {};
for (const item of getAllKnowledgeItems()) {
  idCounts[item.id] = (idCounts[item.id] || 0) + 1;
}
const duplicates = Object.entries(idCounts).filter(([, count]) => count > 1);
assert.deepStrictEqual(duplicates, [], 'no duplicate knowledge IDs across whole registry');

const invalidSources = [];
for (const item of logicalKnowledge) {
  const lesson = LESSONS[item.sourceTopicKey];
  if (!lesson) {
    invalidSources.push({ item: item.id, reason: 'sourceTopicKey missing lesson', sourceTopicKey: item.sourceTopicKey });
    continue;
  }
  const explanationIds = (lesson.explanations || []).map((e) => e.id);
  if (!explanationIds.includes(item.sourceSection)) {
    invalidSources.push({ item: item.id, reason: 'sourceSection not in lesson', sourceTopicKey: item.sourceTopicKey, sourceSection: item.sourceSection });
  }
}
console.log(`   Invalid sourceSection links: ${invalidSources.length}`);
if (invalidSources.length > 0) console.log(invalidSources);
assert.strictEqual(invalidSources.length, 0, 'all logical-components knowledge items must reference existing source sections');

// 6. Conversation topics for all three
console.log('6. Checking conversation topics...');
for (const key of LESSON_KEYS) {
  const convo = CONVERSATION_TOPICS[key];
  assert(convo, `${key} must have a conversation topic`);
  assert(Array.isArray(convo.introPool) && convo.introPool.length > 0, `${key} conversation must have introPool`);
  assert(typeof convo.samHelp === 'string' && convo.samHelp.length > 0, `${key} conversation must have samHelp`);
  assert(Array.isArray(convo.questions) && convo.questions.length >= 6, `${key} conversation should have at least 6 questions`);
  for (const q of convo.questions) {
    assert(Array.isArray(q.options) && q.options.length >= 2, `${key} conversation question must have options`);
    assert(typeof q.correct === 'number', `${key} conversation question must have correct index`);
  }
}

// 7. Prerequisite chain playability
console.log('7. Checking prerequisite chain...');
const domainTopic = adTopics.find((t) => topicKey(t.categoryId, t.topicId) === DOMAIN_KEY);
const dcTopic = adTopics.find((t) => topicKey(t.categoryId, t.topicId) === DC_KEY);
const ouTopic = adTopics.find((t) => topicKey(t.categoryId, t.topicId) === OU_KEY);
assert(domainTopic.prerequisites.includes('active-directory-virtualbox/ad-foundation'), 'domain should depend on ad-foundation');
assert(dcTopic.prerequisites.includes('active-directory-virtualbox/domain'), 'domain-controller should depend on domain');
assert(ouTopic.prerequisites.includes('domain-controller'), 'organizational-units should depend on domain-controller');

// 8. guided-ui is allowed in organizational-units (practical OU management block),
// but should remain absent from the conceptual domain and domain-controller lessons.
console.log('8. Checking guided-ui scope...');
for (const key of [DOMAIN_KEY, DC_KEY]) {
  const guided = (LESSONS[key].exercises || []).filter((ex) => ex.type === 'guided-ui');
  assert.strictEqual(guided.length, 0, `${key} must not contain guided-ui exercises`);
}

console.log('\n=== Active Directory Logical Components Quality Audit passed ===');





