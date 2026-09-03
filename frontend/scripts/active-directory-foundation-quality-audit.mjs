import assert from 'node:assert/strict';
import {
  ACADEMY_TOPICS,
  topicKey,
} from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { collectQuestionsFromLesson } from '../src/lib/academyThemencheck.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const CATEGORY = 'active-directory-virtualbox';
const FOUNDATION_KEY = topicKey(CATEGORY, 'ad-foundation');

console.log(`=== Active Directory Foundation Quality Audit for ${CATEGORY} ===`);

// 1. Topics and placeholders
const adTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === CATEGORY);
console.log(`1. Found ${adTopics.length} AD topics.`);
assert.strictEqual(adTopics.length, 18, 'expected 18 AD topics');

const withLesson = [];
const withoutLesson = [];
for (const topic of adTopics) {
  const key = topicKey(topic.categoryId, topic.topicId);
  if (LESSONS[key]) {
    withLesson.push(key);
  } else {
    withoutLesson.push(key);
  }
}

console.log(`2. Lessons registered: ${withLesson.length}`);
console.log(`   Placeholder topics: ${withoutLesson.length}`);
assert.strictEqual(withLesson.length, 6, 'expected 6 AD lessons');
assert.strictEqual(withoutLesson.length, 12, 'expected 12 AD placeholder topics');

const expectedLessons = [
  topicKey(CATEGORY, 'ad-foundation'),
  topicKey(CATEGORY, 'ad-user-profiles'),
  topicKey(CATEGORY, 'ad-permissions'),
  topicKey(CATEGORY, 'domain'),
  topicKey(CATEGORY, 'organizational-units'),
  topicKey(CATEGORY, 'domain-controller'),
];
for (const key of expectedLessons) {
  assert(LESSONS[key], `expected lesson ${key}`);
}

// 3. AD foundation lesson structure
console.log('3. Checking ad-foundation lesson structure...');
const foundationLesson = LESSONS[FOUNDATION_KEY];
assert(foundationLesson, 'ad-foundation lesson must exist');
assert(typeof foundationLesson.title === 'string' && foundationLesson.title.length > 0, 'ad-foundation must have a title');
assert(Array.isArray(foundationLesson.explanations) && foundationLesson.explanations.length >= 8, 'ad-foundation must have at least 8 explanations');
assert(Array.isArray(foundationLesson.summary) && foundationLesson.summary.length > 0, 'ad-foundation must have a summary');

function deriveSectionId(ex) {
  if (ex.sectionId) return ex.sectionId;
  const dash = ex.id.lastIndexOf('-');
  return dash > 0 ? ex.id.slice(0, dash) : ex.id;
}
const sectionIds = foundationLesson.explanations.map((e) => deriveSectionId(e));
const requiredSections = [
  'nexus-einstieg',
  'verzeichnisdienst',
  'objekt-attribut-schema',
  'lokale-verwaltung',
  'ad-ds',
  'dns-kerberos',
  'smb-ntfs',
  'authn-authz',
  'replikation-delegation',
  'ad-zusammenfassung',
];
for (const s of requiredSections) {
  assert(sectionIds.includes(s), `ad-foundation must include section ${s}`);
}

// Visuals
const diagramCount = foundationLesson.explanations
  .flatMap((e) => e.blocks || [])
  .filter((b) => b.type === 'diagram').length;
console.log(`   Diagram blocks: ${diagramCount}`);
assert(diagramCount >= 1, 'ad-foundation must contain at least one visual diagram');

// 4. AD knowledge items
const adKnowledge = getAllKnowledgeItems().filter((i) =>
  (i.topicKey || '').startsWith(`${CATEGORY}/`)
);
console.log(`4. AD knowledge items: ${adKnowledge.length}`);
assert.ok(adKnowledge.length >= 44, 'expected at least 44 AD knowledge items');

// 5. No duplicate IDs
const idCounts = {};
for (const item of adKnowledge) {
  idCounts[item.id] = (idCounts[item.id] || 0) + 1;
}
const duplicates = Object.entries(idCounts).filter(([, count]) => count > 1);
assert.deepStrictEqual(duplicates, [], 'no duplicate AD knowledge IDs');

// Required concept clusters
const clusters = new Set(adKnowledge.map((i) => i.conceptCluster));
const requiredClusters = [
  'ad.directory',
  'ad.directory.object',
  'ad.directory.attribute',
  'ad.directory.objectVsAttribute',
  'ad.schema',
  'ad.centralized.problem',
  'ad.adds',
  'ad.adds.purpose',
  'ad.dns.role',
  'ad.kerberos',
  'ad.time',
  'ad.ldap',
  'ad.ldap.vsDirectory',
  'ad.smbntfs.smb',
  'ad.smbntfs.ntfs',
  'ad.smbntfs.compare',
  'ad.replication',
  'ad.authn',
  'ad.authz',
  'ad.authnVsAuthz',
  'ad.capabilities',
  'ad.delegation',
  'ad.policyManagement',
  'ad.interoperability',
];
for (const cluster of requiredClusters) {
  assert(clusters.has(cluster), `expected concept cluster ${cluster} in AD knowledge`);
}

// 6. All sourceSection IDs resolve to existing sections
const invalidSources = [];
for (const item of adKnowledge) {
  const lesson = LESSONS[item.sourceTopicKey];
  if (!lesson) {
    invalidSources.push({ item: item.id, reason: 'sourceTopicKey has no LESSON', sourceTopicKey: item.sourceTopicKey });
    continue;
  }
  const explanationIds = (lesson.explanations || []).map((e) => e.sectionId || e.id);
  if (!explanationIds.includes(item.sourceSection)) {
    invalidSources.push({
      item: item.id,
      reason: 'sourceSection not in lesson',
      sourceTopicKey: item.sourceTopicKey,
      sourceSection: item.sourceSection,
    });
  }
}
console.log(`5. Invalid AD sourceSection links: ${invalidSources.length}`);
if (invalidSources.length > 0) {
  console.log(invalidSources);
}
assert.strictEqual(invalidSources.length, 0, 'all AD knowledge items must reference existing source sections');

// 7. Exercises
console.log('6. Checking ad-foundation exercises...');
const exercises = foundationLesson.exercises || [];
console.log(`   Exercises in full pool: ${exercises.length}`);
assert(exercises.length >= 4 && exercises.length <= 8, 'ad-foundation full exercise pool should be between 4 and 8');
const allowedTypes = new Set(['matching', 'select-best', 'ordering', 'input']);
for (const ex of exercises) {
  assert(allowedTypes.has(ex.type), `ad-foundation exercise ${ex.id} has unsupported type ${ex.type}`);
  assert(typeof ex.question === 'string' && ex.question.length > 0, `ad-foundation exercise ${ex.id} must have a question`);
  assert(typeof ex.explanation === 'string' && ex.explanation.length > 0, `ad-foundation exercise ${ex.id} must have an explanation`);
}

// 8. Final quiz
console.log('7. Checking ad-foundation final quiz...');
const quizQuestions = foundationLesson.quiz || [];
console.log(`   Quiz questions: ${quizQuestions.length}`);
assert(quizQuestions.length >= 6 && quizQuestions.length <= 8, 'ad-foundation quiz should contain 6 to 8 questions');
for (const q of quizQuestions) {
  assert(Array.isArray(q.options) && q.options.length >= 2, 'quiz question must have options');
  assert(typeof q.correct === 'number', 'quiz question must have correct index');
}

// 9. Conversation topic
console.log('8. Checking ad-foundation conversation topic...');
const convo = CONVERSATION_TOPICS[FOUNDATION_KEY];
assert(convo, 'ad-foundation must have a conversation topic');
assert(Array.isArray(convo.introPool) && convo.introPool.length > 0, 'conversation topic must have introPool');
assert(typeof convo.samHelp === 'string' && convo.samHelp.length > 0, 'conversation topic must have samHelp');
assert(Array.isArray(convo.questions) && convo.questions.length >= 6, 'conversation topic should have at least 6 questions');
for (const q of convo.questions) {
  assert(Array.isArray(q.options) && q.options.length >= 2, 'conversation question must have options');
  assert(typeof q.correct === 'number', 'conversation question must have correct index');
}

// 10. Fachgespräch coverage
console.log('9. Checking Fachgespräch coverage...');
const fachgespraechQuestions = collectQuestionsFromLesson(foundationLesson, 'ad-foundation');
console.log(`   Fachgespräch pool size: ${fachgespraechQuestions.length}`);
assert(fachgespraechQuestions.length >= 10, 'ad-foundation should contribute at least 10 Fachgespräch questions');

// 11. guided-ui type is recognized in LessonRunner source
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const runnerSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'LessonRunner.jsx'), 'utf8');
console.log('10. Checking guided-ui integration in LessonRunner...');
assert(runnerSrc.includes("ex.type === 'guided-ui'"), 'LessonRunner must handle guided-ui exercise type');
assert(runnerSrc.includes("import GuidedUiExercise from './GuidedUiExercise'"), 'LessonRunner must import GuidedUiExercise');

// 12. No production AD lesson uses guided-ui yet
console.log('11. Checking no production AD lesson has guided-ui exercises...');
for (const key of withLesson) {
  const exes = LESSONS[key].exercises || [];
  const guided = exes.filter((ex) => ex.type === 'guided-ui');
  assert.strictEqual(guided.length, 0, `${key} must not contain production guided-ui exercises yet`);
}

console.log('\n=== Active Directory Foundation Quality Audit passed ===');




