import {
  ACADEMY_TOPICS,
  topicKey,
  resolvePrerequisiteRef,
} from '../src/lib/academyTopics.js';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const topics = ACADEMY_TOPICS.filter((t) => t.categoryId === 'fundamentals');
const allKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));

function countBlocks(lesson) {
  if (!lesson || !lesson.explanations) return 0;
  return lesson.explanations.reduce((sum, e) => sum + (e.blocks ? e.blocks.length : 0), 0);
}

function countDiagrams(lesson) {
  if (!lesson || !lesson.explanations) return 0;
  return lesson.explanations.reduce((sum, e) => sum + (e.blocks ? e.blocks.filter((b) => b.type === 'diagram').length : 0), 0);
}

function countQuestions(lesson) {
  if (!lesson || !lesson.explanations) return 0;
  return lesson.explanations.reduce((sum, e) => sum + (e.blocks ? e.blocks.filter((b) => b.type === 'question').length : 0), 0);
}

const knowledgeItems = getAllKnowledgeItems();
const knowledgeByTopic = new Map();
for (const item of knowledgeItems) {
  const arr = knowledgeByTopic.get(item.topicKey) || [];
  arr.push(item);
  knowledgeByTopic.set(item.topicKey, arr);
}

const rows = [];
for (const t of topics) {
  const key = topicKey(t.categoryId, t.topicId);
  const lesson = LESSONS[key];
  const hasContent = hasLessonContent(t.categoryId, t.topicId);
  const prereqs = t.prerequisites.map((ref) => {
    const r = resolvePrerequisiteRef(t.categoryId, ref);
    const ok = allKeys.has(topicKey(r.categoryId, r.topicId));
    return { ref, ...r, ok };
  });
  const dependents = topics
    .filter((other) => {
      return other.prerequisites.some((ref) => {
        const r = resolvePrerequisiteRef(other.categoryId, ref);
        return r.categoryId === t.categoryId && r.topicId === t.topicId;
      });
    })
    .map((other) => other.topicId);
  rows.push({
    id: t.topicId,
    title: t.title,
    hasLesson: hasContent,
    sections: lesson?.explanations?.length || 0,
    blocks: countBlocks(lesson),
    diagrams: countDiagrams(lesson),
    inlineQuestions: countQuestions(lesson),
    exercises: lesson?.exercises?.length || 0,
    quiz: lesson?.quiz?.length || 0,
    knowledge: (knowledgeByTopic.get(key) || []).length,
    conversation: !!CONVERSATION_TOPICS[key],
    prereqs,
    dependents,
  });
}

console.log('--- Fundamentals structure audit ---');
for (const r of rows) {
  const pre = r.prereqs.map((p) => `${p.ref}${p.ok ? '' : ' [DANGLING]'}`).join(', ') || 'none';
  const dep = r.dependents.join(', ') || 'none';
  const status = r.hasLesson ? 'LESSON' : 'NO LESSON';
  console.log(`${r.id.padEnd(26)} | ${r.title.padEnd(36)} | ${status.padEnd(9)} | sec=${String(r.sections).padStart(2)} blk=${String(r.blocks).padStart(3)} q=${String(r.inlineQuestions).padStart(2)} ex=${String(r.exercises).padStart(2)} quiz=${String(r.quiz).padStart(2)} know=${String(r.knowledge).padStart(2)} conv=${r.conversation ? 'Y' : 'N'} | pre: ${pre} | dep: ${dep}`);
}

console.log('');
console.log('--- Issues ---');
let issueCount = 0;
for (const r of rows) {
  if (!r.hasLesson && r.dependents.length > 0) {
    console.log(`Placeholder ${r.id} is required by: ${r.dependents.join(', ')}`);
    issueCount += 1;
  }
  for (const p of r.prereqs) {
    if (!p.ok) {
      console.log(`Topic ${r.id} has dangling prerequisite ${p.ref}`);
      issueCount += 1;
    }
  }
}
for (const key of Object.keys(CONVERSATION_TOPICS)) {
  if (!allKeys.has(key)) {
    console.log(`Conversation topic ${key} points to missing Academy topic`);
    issueCount += 1;
  }
}
for (const item of knowledgeItems) {
  if (!allKeys.has(item.topicKey)) {
    console.log(`Knowledge item ${item.id} references missing topic ${item.topicKey}`);
    issueCount += 1;
  }
}
console.log(`Total issues: ${issueCount}`);
process.exit(issueCount === 0 ? 0 : 1);
