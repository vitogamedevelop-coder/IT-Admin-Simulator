import assert from 'node:assert/strict';
import {
  ACADEMY_TOPICS,
  topicKey,
} from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const CATEGORY = 'active-directory-virtualbox';

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
assert.strictEqual(withLesson.length, 3, 'expected 3 AD lessons');
assert.strictEqual(withoutLesson.length, 15, 'expected 15 AD placeholder topics');

const expectedLessons = [
  topicKey(CATEGORY, 'ad-foundation'),
  topicKey(CATEGORY, 'ad-user-profiles'),
  topicKey(CATEGORY, 'ad-permissions'),
];
for (const key of expectedLessons) {
  assert(LESSONS[key], `expected lesson ${key}`);
}

// 3. AD knowledge items
const adKnowledge = getAllKnowledgeItems().filter((i) =>
  (i.topicKey || '').startsWith(`${CATEGORY}/`)
);
console.log(`3. AD knowledge items: ${adKnowledge.length}`);
assert.strictEqual(adKnowledge.length, 44, 'expected 44 AD knowledge items');

// 4. No duplicate IDs
const idCounts = {};
for (const item of adKnowledge) {
  idCounts[item.id] = (idCounts[item.id] || 0) + 1;
}
const duplicates = Object.entries(idCounts).filter(([, count]) => count > 1);
assert.deepStrictEqual(duplicates, [], 'no duplicate AD knowledge IDs');

// 5. All sourceSection IDs resolve to existing sections
const invalidSources = [];
for (const item of adKnowledge) {
  const lesson = LESSONS[item.sourceTopicKey];
  if (!lesson) {
    invalidSources.push({ item: item.id, reason: 'sourceTopicKey has no LESSON', sourceTopicKey: item.sourceTopicKey });
    continue;
  }
  const sectionIds = (lesson.explanations || []).map((e) => e.sectionId || e.id);
  if (!sectionIds.includes(item.sourceSection)) {
    invalidSources.push({
      item: item.id,
      reason: 'sourceSection not in lesson',
      sourceTopicKey: item.sourceTopicKey,
      sourceSection: item.sourceSection,
    });
  }
}
console.log(`4. Invalid AD sourceSection links: ${invalidSources.length}`);
if (invalidSources.length > 0) {
  console.log(invalidSources);
}
assert.strictEqual(invalidSources.length, 0, 'all AD knowledge items must reference existing source sections');

// 6. guided-ui type is recognized in LessonRunner source
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const runnerSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'LessonRunner.jsx'), 'utf8');
console.log('5. Checking guided-ui integration in LessonRunner...');
assert(runnerSrc.includes("ex.type === 'guided-ui'"), 'LessonRunner must handle guided-ui exercise type');
assert(runnerSrc.includes("import GuidedUiExercise from './GuidedUiExercise'"), 'LessonRunner must import GuidedUiExercise');

// 7. No production AD lesson uses guided-ui yet (this is a platform preparation step)
console.log('6. Checking no production AD lesson has guided-ui exercises...');
for (const key of withLesson) {
  const exercises = LESSONS[key].exercises || [];
  const guided = exercises.filter((ex) => ex.type === 'guided-ui');
  assert.strictEqual(guided.length, 0, `${key} must not contain production guided-ui exercises yet`);
}

console.log('\n=== Active Directory Foundation Quality Audit passed ===');
