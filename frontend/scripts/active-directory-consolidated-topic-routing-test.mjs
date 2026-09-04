import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const category = 'active-directory-virtualbox';
const adTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === category);
const allKnowledge = getAllKnowledgeItems();

function check(cond, msg) {
  if (!cond) {
    console.log(`[FAIL] ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`[PASS] ${msg}`);
  }
}

console.log('=== Active Directory Consolidated Topic Routing Test ===');

for (const t of adTopics) {
  const key = topicKey(category, t.topicId);
  const lesson = LESSONS[key];
  const knowledge = allKnowledge.filter((i) => i.topicKey === key);
  const conv = CONVERSATION_TOPICS[key];

  check(!!lesson, `${t.topicId}: LESSONS entry exists`);
  check((lesson?.explanations?.length || 0) >= 2, `${t.topicId}: at least 2 explanation objects`);
  check(knowledge.length >= 5, `${t.topicId}: at least 5 knowledge items (found ${knowledge.length})`);
  check(!!conv && conv.questions.length >= 4, `${t.topicId}: at least 4 conversation questions (found ${conv?.questions?.length || 0})`);
}

if (!process.exitCode) {
  console.log('\n=== Active Directory Consolidated Topic Routing Test passed ===');
} else {
  console.log('\n=== Active Directory Consolidated Topic Routing Test FAILED ===');
  process.exit(1);
}
