import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';

console.log('=== Active Directory Prerequisite Graph Audit ===');

const adTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === 'active-directory-virtualbox');
const hasLesson = (cat, id) => Boolean(LESSONS[topicKey(cat, id)]);

function resolveKey(ref, categoryId) {
  if (ref.includes('/')) {
    const [cat, id] = ref.split('/');
    return topicKey(cat, id);
  }
  return topicKey(categoryId, ref);
}

console.log('1. Checking ad-foundation is not blocked by a placeholder...');
const adFoundation = adTopics.find((t) => t.topicId === 'ad-foundation');
assert(adFoundation, 'ad-foundation topic must exist');
assert(adFoundation.prerequisites.length === 0, `ad-foundation must not have prerequisites, got ${adFoundation.prerequisites}`);

console.log('2. Checking all AD prerequisites resolve to existing topics...');
for (const topic of adTopics) {
  for (const pre of topic.prerequisites) {
    const preKey = resolveKey(pre, topic.categoryId);
    assert(ACADEMY_TOPICS.some((t) => topicKey(t.categoryId, t.topicId) === preKey), `prerequisite ${pre} for ${topic.topicId} does not exist`);
  }
}

console.log('3. Checking no productive AD topic is blocked only by a placeholder...');
function isPlaceHolder(topic) {
  return !hasLesson(topic.categoryId, topic.topicId);
}

function chainHasLesson(topic, seen = new Set()) {
  const key = topicKey(topic.categoryId, topic.topicId);
  if (seen.has(key)) return false;
  seen.add(key);
  if (!isPlaceHolder(topic)) return true;
  if (topic.prerequisites.length === 0) return false;
  return topic.prerequisites.some((pre) => {
    const preKey = resolveKey(pre, topic.categoryId);
    const preTopic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === preKey);
    if (!preTopic) return false;
    return chainHasLesson(preTopic, new Set(seen));
  });
}

const adProductive = adTopics.filter((t) => hasLesson(t.categoryId, t.topicId));
for (const topic of adProductive) {
  assert(topic.prerequisites.length === 0 || chainHasLesson(topic), `productive AD topic ${topic.topicId} is blocked only by placeholder prerequisites`);
}

console.log('4. Checking for prerequisite cycles...');
function hasCycle(topic, stack = new Set(), seen = new Set()) {
  const key = topicKey(topic.categoryId, topic.topicId);
  if (stack.has(key)) return true;
  if (seen.has(key)) return false;
  seen.add(key);
  stack.add(key);
  for (const pre of topic.prerequisites) {
    const preKey = resolveKey(pre, topic.categoryId);
    const preTopic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === preKey);
    if (preTopic && hasCycle(preTopic, stack, seen)) return true;
  }
  stack.delete(key);
  return false;
}

for (const topic of adTopics) {
  assert(!hasCycle(topic), `prerequisite cycle detected involving ${topic.topicId}`);
}

console.log('5. Checking virtualbox-lab remains as a placeholder topic...');
const vbox = adTopics.find((t) => t.topicId === 'virtualbox-lab');
const vboxKey = topicKey(vbox.categoryId, vbox.topicId);
assert(vbox, 'virtualbox-lab topic must still exist');
assert(!hasLesson(vbox.categoryId, vbox.topicId), 'virtualbox-lab must have no lesson (placeholder)');
assert(!adProductive.some((t) => t.prerequisites.some((pre) => resolveKey(pre, t.categoryId) === vboxKey)), 'virtualbox-lab must not be a direct prerequisite of any productive AD topic');

console.log('\n=== Active Directory Prerequisite Graph Audit passed ===');


