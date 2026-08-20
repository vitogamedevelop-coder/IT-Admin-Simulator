import {
  startEmployeeConversation,
  evaluateEmployeeAnswer,
  advanceConversation,
  resetEmployeeConversations,
} from '../src/lib/employeeConversations.js';
import { getTopicProgress, updateTopicProgress } from '../src/lib/academyProgress.js';
import { ACADEMY_TOPICS } from '../src/lib/academyTopics.js';

// Node test environment mocks
const store = new Map();
global.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, value),
  removeItem: (key) => store.delete(key),
};
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  location: { href: '' },
};
global.document = { createElement: () => ({}) };

function assertTrue(value, message) {
  if (!value) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message} (expected ${expected}, got ${actual})`);
}

function resetState() {
  store.clear();
  resetEmployeeConversations();
}

function unlockAllTopics() {
  for (const topic of ACADEMY_TOPICS) {
    updateTopicProgress(topic.categoryId, topic.topicId, { status: 'available' });
  }
}

function answerForQuestion(question) {
  if (question.type === 'mc') return question.correctOptionId;
  if (question.type === 'ordering') return question.correctOrderIds;
  if (question.type === 'matching') {
    const result = {};
    for (const pair of question.correctPairs) {
      result[pair.leftId ?? pair.left] = pair.rightId ?? pair.right;
    }
    return result;
  }
  if (question.type === 'input') return question.answers?.[0] || '';
  return null;
}

function progressFor(topicKeyName) {
  const [categoryId, ...rest] = topicKeyName.split('/');
  return getTopicProgress(categoryId, rest.join('/'));
}

function runUntilTopic(topicKeyName, maxStarts = 300) {
  resetState();
  unlockAllTopics();
  for (let i = 0; i < maxStarts; i += 1) {
    const conv = startEmployeeConversation();
    if (!conv) throw new Error('no conversation could be started');
    let safety = 0;
    while (!conv.completed && safety < 20) {
      if (conv.currentTopicKey === topicKeyName) return { conv, question: conv.question };
      const answer = answerForQuestion(conv.question);
      evaluateEmployeeAnswer(conv, answer);
      const next = advanceConversation(conv);
      if (next.state === 'summary') break;
      Object.assign(conv, next.conversation);
      safety += 1;
    }
  }
  throw new Error(`could not reach ${topicKeyName} in conversation within ${maxStarts} starts`);
}

function testTopicProgress(topicKeyName) {
  const { conv, question } = runUntilTopic(topicKeyName);
  const before = progressFor(topicKeyName)?.practiceScore || 0;
  evaluateEmployeeAnswer(conv, answerForQuestion(question));
  const after = progressFor(topicKeyName);
  assertTrue(after.practiceScore > before, `practiceScore did not increase for ${topicKeyName} (before ${before}, after ${after.practiceScore})`);
  assertEqual(after.practiceScore, before + 4, `unexpected practice delta for ${topicKeyName}`);
  return { topicKeyName, before, after: after.practiceScore };
}

const results = [
  testTopicProgress('fundamentals/grundbegriffe'),
  testTopicProgress('cisco-packet-tracer/grundlagen'),
];

console.log('✅ Phase 7.1 Conversation Progress tests passed');
for (const r of results) {
  console.log(`   ${r.topicKeyName}: practice ${r.before} → ${r.after}`);
}
