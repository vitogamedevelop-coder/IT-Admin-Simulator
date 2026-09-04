import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const category = 'active-directory-virtualbox';
const adTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === category);

let totalSections = 0;
let totalExercises = 0;
let totalQuiz = 0;
let totalKnowledge = 0;
let totalConversation = 0;

for (const t of adTopics) {
  const key = topicKey(category, t.topicId);
  const lesson = LESSONS[key];
  const sectionIds = new Set();
  (lesson?.explanations || []).forEach((ex) => {
    const dash = (ex.id || '').lastIndexOf('-');
    sectionIds.add(ex.sectionId || (dash > 0 ? ex.id.slice(0, dash) : ex.id));
  });
  totalSections += sectionIds.size;
  totalExercises += (lesson?.exercises || []).length;
  totalQuiz += (lesson?.quiz || []).length;
  totalKnowledge += getAllKnowledgeItems().filter((i) => i.topicKey === key).length;
  const conv = CONVERSATION_TOPICS[key];
  totalConversation += conv?.questions?.length || 0;
}

function check(cond, msg) {
  if (!cond) {
    console.log(`[FAIL] ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`[PASS] ${msg}`);
  }
}

console.log('=== Academy Category Stats Contract Test (AD) ===');
check(adTopics.length === 18, `AD visible lesson count = 18`);
check(totalSections > 200, `Theory sections > 200 (found ${totalSections})`);
check(totalExercises > 250, `Exercises > 250 (found ${totalExercises})`);
check(totalQuiz > 100, `Quiz questions > 100 (found ${totalQuiz})`);
check(totalKnowledge > 300, `Knowledge items > 300 (found ${totalKnowledge})`);
check(totalConversation > 150, `Conversation questions > 150 (found ${totalConversation})`);

// No stale topic keys in LESSONS for AD
const visibleKeys = new Set(adTopics.map((t) => topicKey(category, t.topicId)));
const adLessonKeys = Object.keys(LESSONS).filter((k) => k.startsWith(category + '/'));
check(adLessonKeys.every((k) => visibleKeys.has(k)), 'All AD LESSON keys are in current catalog');
check([...visibleKeys].every((k) => !!LESSONS[k]), 'Every visible AD topic has a LESSON entry');

if (!process.exitCode) {
  console.log('\n=== Academy Category Stats Contract Test passed ===');
} else {
  console.log('\n=== Academy Category Stats Contract Test FAILED ===');
  process.exit(1);
}
