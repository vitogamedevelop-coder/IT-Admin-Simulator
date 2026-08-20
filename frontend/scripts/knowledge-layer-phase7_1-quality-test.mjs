import { generateQuestion, getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import {
  validateDistractorDomain,
  validateOrderingPositionLeak,
} from '../src/lib/knowledge/validators.js';
import {
  startEmployeeConversation,
  evaluateEmployeeAnswer,
  advanceConversation,
  resetEmployeeConversations,
} from '../src/lib/employeeConversations.js';
import { updateTopicProgress, getTopicProgress } from '../src/lib/academyProgress.js';
import { applyConversationPractice } from '../src/lib/academyEngine.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';

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

function assertArrayEqual(actual, expected, message) {
  if (actual.length !== expected.length || !actual.every((v, i) => v === expected[i])) {
    throw new Error(`${message} (expected [${expected.join(', ')}], got [${actual.join(', ')}])`);
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

function wrongAnswerForQuestion(question) {
  if (question.type === 'mc') {
    return question.options.find((o) => !o.isCorrect && o.id !== question.correctOptionId)?.id || question.options[0].id;
  }
  if (question.type === 'ordering' && question.correctOrderIds.length > 1) {
    const a = [...question.correctOrderIds];
    [a[0], a[1]] = [a[1], a[0]];
    return a;
  }
  if (question.type === 'matching') {
    const result = {};
    const pairs = question.correctPairs;
    for (let i = 0; i < pairs.length; i += 1) {
      const p = pairs[i];
      const next = pairs[(i + 1) % pairs.length];
      result[p.leftId ?? p.left] = next.rightId ?? next.right;
    }
    return result;
  }
  return null;
}

function unlockAllTopics() {
  for (const topic of ACADEMY_TOPICS) {
    updateTopicProgress(topic.categoryId, topic.topicId, { status: 'available' });
  }
}

function runUntilItem(itemId) {
  resetEmployeeConversations();
  unlockAllTopics();
  for (let i = 0; i < 300; i += 1) {
    const conv = startEmployeeConversation();
    if (!conv) throw new Error('could not start conversation');
    let safety = 0;
    while (!conv.completed && safety < 20) {
      if (conv.question.knowledgeItemId === itemId) return { conv, question: conv.question };
      const answer = answerForQuestion(conv.question);
      evaluateEmployeeAnswer(conv, answer);
      const next = advanceConversation(conv);
      if (next.state === 'summary') break;
      Object.assign(conv, next.conversation);
      safety += 1;
    }
  }
  throw new Error(`could not find item ${itemId}`);
}

// ---------------------------------------------------------------------------
// 1. MAC MC contains no cross-domain distractors
// ---------------------------------------------------------------------------
{
  const allItemsById = Object.fromEntries(getAllKnowledgeItems().map((i) => [i.id, i]));
  const item = allItemsById['nb.grundbegriffe.mac'];
  assertTrue(item, 'MAC item exists');
  let leaked = false;
  for (let seed = 0; seed < 20; seed += 1) {
    const q = generateQuestion(item.id, null, { contextType: 'coworker_question', seed: String(seed) });
    assertEqual(q.type, 'mc', 'MAC question is MC');
    const issues = validateDistractorDomain(q, item, allItemsById);
    const bad = issues.filter((iss) => iss.sourceCluster?.startsWith('grundbegriffe.networkSizes'));
    if (bad.length > 0) {
      console.log('MAC cross-domain distractor:', bad[0]);
      leaked = true;
      break;
    }
  }
  assertTrue(!leaked, 'MAC MC distractors stay within the addressing domain');
  console.log('✅ MAC MC distractors stay within the addressing domain');
}

// ---------------------------------------------------------------------------
// 2. OSI ordering contains no position-leaking labels
// ---------------------------------------------------------------------------
{
  const allItemsById = Object.fromEntries(getAllKnowledgeItems().map((i) => [i.id, i]));
  const item = allItemsById['osi.encapsulationOrder'];
  assertTrue(item, 'OSI encapsulation order item exists');
  let leaked = false;
  for (let seed = 0; seed < 20; seed += 1) {
    const q = generateQuestion(item.id, null, { contextType: 'coworker_question', seed: String(seed) });
    assertEqual(q.type, 'ordering', 'OSI encapsulation question is ordering');
    const issues = validateOrderingPositionLeak(q);
    if (issues.length > 0) {
      console.log('OSI ordering leak:', issues[0]);
      leaked = true;
      break;
    }
  }
  assertTrue(!leaked, 'OSI ordering labels do not leak positions');
  console.log('✅ OSI ordering labels do not leak positions');
}

// ---------------------------------------------------------------------------
// 3. Binary ordering prompt uses no left/right direction
// ---------------------------------------------------------------------------
{
  const allItemsById = Object.fromEntries(getAllKnowledgeItems().map((i) => [i.id, i]));
  const item = allItemsById['binary.bitValues'];
  assertTrue(item, 'Binary bit values item exists');
  let bad = false;
  for (let seed = 0; seed < 20; seed += 1) {
    const q = generateQuestion(item.id, null, { contextType: 'coworker_question', seed: String(seed) });
    const text = `${q.prompt || ''} ${q.conversationText || ''}`.toLowerCase();
    if (/\b(links nach rechts|von links|rechts nach links|von rechts)\b/.test(text)) {
      console.log('Binary ordering direction leak:', q.prompt);
      bad = true;
      break;
    }
  }
  assertTrue(!bad, 'Binary ordering prompt avoids left/right UI direction');
  console.log('✅ Binary ordering prompt avoids left/right UI direction');
}

// ---------------------------------------------------------------------------
// 4. Network scope ordering is correct
// ---------------------------------------------------------------------------
{
  const allItemsById = Object.fromEntries(getAllKnowledgeItems().map((i) => [i.id, i]));
  const item = allItemsById['nb.grundbegriffe.networkScopeOrder'];
  assertTrue(item, 'Network scope order item exists');
  const q = generateQuestion(item.id, null, { contextType: 'coworker_question', seed: '0' });
  assertEqual(q.type, 'ordering', 'Network scope order is ordering');
  assertArrayEqual(q.correctOrderLabels, ['PAN', 'LAN', 'MAN', 'WAN'], 'Network scope order is PAN→LAN→MAN→WAN');
  console.log('✅ Network scope ordering correct: PAN → LAN → MAN → WAN');
}

// ---------------------------------------------------------------------------
// 5. Network scope matching pairs are correct
// ---------------------------------------------------------------------------
{
  const allItemsById = Object.fromEntries(getAllKnowledgeItems().map((i) => [i.id, i]));
  const item = allItemsById['nb.grundbegriffe.networkScopeMapping'];
  assertTrue(item, 'Network scope mapping item exists');
  const q = generateQuestion(item.id, null, { contextType: 'coworker_question', seed: '0' });
  assertEqual(q.type, 'matching', 'Network scope mapping is matching');
  const pairs = Object.fromEntries(q.correctPairLabels.map((p) => [p.left, p.right]));
  assertTrue(pairs.PAN, 'PAN pair present');
  assertTrue(pairs.LAN, 'LAN pair present');
  assertTrue(pairs.MAN, 'MAN pair present');
  assertTrue(pairs.WAN, 'WAN pair present');
  console.log('✅ Network scope matching pairs present for PAN/LAN/MAN/WAN');
}

// ---------------------------------------------------------------------------
// 6. Ordering wrong-answer feedback shows user order and correct order
// ---------------------------------------------------------------------------
{
  const { conv, question } = runUntilItem('nb.grundbegriffe.networkScopeOrder');
  const wrongOrder = wrongAnswerForQuestion(question);
  const result = evaluateEmployeeAnswer(conv, wrongOrder);
  assertTrue(!result.correct, 'wrong ordering answer is evaluated as incorrect');
  assertTrue(result.samExplanation.includes('Deine Reihenfolge'), 'Sam feedback mentions user order');
  assertTrue(result.samExplanation.includes('Korrekt wäre'), 'Sam feedback shows correct order');
  assertTrue(result.samExplanation.includes('PAN'), 'Sam feedback names PAN');
  console.log('✅ Ordering wrong-answer feedback shows user order and correct order');
}

// ---------------------------------------------------------------------------
// 7. Matching wrong-answer feedback shows user pairs and correct pairs
// ---------------------------------------------------------------------------
{
  const { conv, question } = runUntilItem('ct.grundlagen.memory');
  const wrongPairs = wrongAnswerForQuestion(question);
  const result = evaluateEmployeeAnswer(conv, wrongPairs);
  assertTrue(!result.correct, 'wrong matching answer is evaluated as incorrect');
  assertTrue(result.samExplanation.includes('Deine Zuordnung'), 'Sam feedback mentions user pairs');
  assertTrue(result.samExplanation.includes('Korrekt wäre'), 'Sam feedback shows correct pairs');
  console.log('✅ Matching wrong-answer feedback shows user pairs and correct pairs');
}

// ---------------------------------------------------------------------------
// 8. MC wrong-answer feedback is answer-aware
// ---------------------------------------------------------------------------
{
  const { conv, question } = runUntilItem('nb.grundbegriffe.mac');
  const wrongId = wrongAnswerForQuestion(question);
  const result = evaluateEmployeeAnswer(conv, wrongId);
  assertTrue(!result.correct, 'wrong MC answer is evaluated as incorrect');
  assertTrue(
    question.wrongOptionExplanations && question.wrongOptionExplanations[wrongId],
    'MC question has an answer-aware explanation for the chosen distractor',
  );
  assertTrue(result.samExplanation.length > 20, 'Sam MC explanation is substantive');
  console.log('✅ MC wrong-answer feedback is answer-aware');
}

// ---------------------------------------------------------------------------
// 9. Direct progress mapping is correct for every conversation-capable topic
// ---------------------------------------------------------------------------
{
  const conversationTopics = ACADEMY_TOPICS
    .filter((t) => ['fundamentals', 'cisco-packet-tracer'].includes(t.categoryId))
    .map((t) => topicKey(t.categoryId, t.topicId));
  for (const key of conversationTopics) {
    store.clear();
    const [categoryId, ...rest] = key.split('/');
    const topicId = rest.join('/');
    updateTopicProgress(categoryId, topicId, { status: 'available', practiceScore: 0 });
    applyConversationPractice(categoryId, topicId, 4);
    const after = getTopicProgress(categoryId, topicId);
    assertEqual(after.practiceScore, 4, `conversation practice credits the correct topic ${key}`);
    // Make sure no other topic received a bump.
    const wrongTopic = conversationTopics.find((k) => k !== key);
    if (wrongTopic) {
      const [wCat, ...wRest] = wrongTopic.split('/');
      const wId = wRest.join('/');
      const wProgress = getTopicProgress(wCat, wId);
      assertEqual(wProgress?.practiceScore || 0, 0, `conversation practice for ${key} did not credit ${wrongTopic}`);
    }
  }
  console.log(`✅ Direct progress mapping works for ${conversationTopics.length} conversation topics`);
}

console.log('\n✅ Phase 7.1 Quality & Learning tests passed');
