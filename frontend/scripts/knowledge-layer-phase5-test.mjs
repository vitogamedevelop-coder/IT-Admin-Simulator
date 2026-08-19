import {
  startEmployeeConversation,
  evaluateEmployeeAnswer,
  advanceConversation,
  resetEmployeeConversations,
  getConversationSummary,
} from '../src/lib/employeeConversations.js';
import { updateTopicProgress } from '../src/lib/academyProgress.js';
import { topicKey } from '../src/lib/academyTopics.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

// =============================================================================
// Node test environment mocks
// =============================================================================
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

function assertFalse(value, message) {
  if (value) throw new Error(message);
}

function resetState() {
  store.clear();
  resetEmployeeConversations();
}

function unlockTopic(categoryId, topicId, status = 'available') {
  updateTopicProgress(categoryId, topicId, { status });
}

function unlockAllFundamentals() {
  const topics = [
    ['fundamentals', 'grundbegriffe'],
    ['fundamentals', 'topologien'],
    ['fundamentals', 'osi-model'],
    ['fundamentals', 'tcp-ip-model'],
    ['fundamentals', 'binary-system'],
    ['fundamentals', 'ipv4'],
    ['fundamentals', 'subnet-masks'],
    ['fundamentals', 'subnetting'],
    ['fundamentals', 'switching'],
    ['fundamentals', 'vlan-basics'],
    ['fundamentals', 'dhcp'],
    ['fundamentals', 'dns'],
    ['fundamentals', 'tcp-udp'],
    ['fundamentals', 'routing'],
    ['fundamentals', 'inter-vlan-routing'],
    ['fundamentals', 'kommunikation-uebertragung'],
    ['fundamentals', 'ports'],
  ];
  for (const [cat, tid] of topics) unlockTopic(cat, tid);
}

function unlockSsh() {
  // Simulate HM3 completion: SSH topic available + underlying skills available.
  unlockTopic('cisco-packet-tracer', 'ssh');
  unlockTopic('cisco-packet-tracer', 'basic-device-configuration');
  unlockTopic('cisco-packet-tracer', 'switch-basics');
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

function isKnowledgeQuestion(question) {
  return !!question.knowledgeItemId;
}

function runFullConversation(answerCorrectly = true) {
  const conv = startEmployeeConversation();
  if (!conv) return null;
  const trace = [];
  while (!conv.completed) {
    const answer = answerForQuestion(conv.question);
    const evaluation = evaluateEmployeeAnswer(conv, answerCorrectly ? answer : 'wrong-answer-id');
    trace.push({
      topicKey: conv.currentTopicKey,
      question: conv.question,
      correct: evaluation.correct,
      samExplanation: evaluation.samExplanation,
    });
    const next = advanceConversation(conv);
    if (next.state === 'summary') break;
    Object.assign(conv, next.conversation);
  }
  return { conv, trace, summary: getConversationSummary(conv) };
}

// =============================================================================
// Tests
// =============================================================================

console.log('Pilot topic generates knowledge question');
{
  resetState();
  unlockAllFundamentals();
  // Force first topic to be binary-system by repeatedly starting until it appears.
  let conv = null;
  for (let i = 0; i < 50; i += 1) {
    resetState();
    unlockAllFundamentals();
    conv = startEmployeeConversation();
    if (conv.currentTopicKey === topicKey('fundamentals', 'binary-system')) break;
  }
  assertTrue(!!conv, 'conversation started');
  if (conv.currentTopicKey === topicKey('fundamentals', 'binary-system')) {
    assertTrue(isKnowledgeQuestion(conv.question), 'binary question should come from knowledge layer');
    assertTrue(conv.question.text.length > 10, 'question text present');
    assertTrue(['mc', 'ordering'].includes(conv.question.type), 'binary question type is mc or ordering');
  }
}

console.log('Legacy topic still uses legacy questions');
{
  resetState();
  unlockAllFundamentals();
  let conv = null;
  for (let i = 0; i < 50; i += 1) {
    resetState();
    unlockAllFundamentals();
    conv = startEmployeeConversation();
    if (conv.currentTopicKey === topicKey('fundamentals', 'ports')) break;
  }
  assertTrue(!!conv, 'conversation started');
  if (conv.currentTopicKey === topicKey('fundamentals', 'ports')) {
    assertFalse(isKnowledgeQuestion(conv.question), 'ports question should be legacy');
    assertTrue(!!conv.question.explanation, 'legacy question has explanation');
  }
}

console.log('Migrated topic uses knowledge questions');
{
  resetState();
  unlockAllFundamentals();
  let conv = null;
  for (let i = 0; i < 50; i += 1) {
    resetState();
    unlockAllFundamentals();
    conv = startEmployeeConversation();
    if (conv.currentTopicKey === topicKey('fundamentals', 'dhcp')) break;
  }
  assertTrue(!!conv, 'conversation started');
  if (conv.currentTopicKey === topicKey('fundamentals', 'dhcp')) {
    assertTrue(isKnowledgeQuestion(conv.question), 'dhcp question should come from knowledge layer');
    assertTrue(!!conv.question.explanation, 'knowledge question has explanation');
  }
}

console.log('SSH locked before HM3');
{
  resetState();
  unlockAllFundamentals();
  // Do not unlock SSH.
  for (let i = 0; i < 30; i += 1) {
    resetState();
    unlockAllFundamentals();
    const c = startEmployeeConversation();
    assertTrue(c.currentTopicKey !== topicKey('cisco-packet-tracer', 'ssh'), `ssh should not appear before HM3, got ${c.currentTopicKey}`);
  }
}

console.log('SSH unlocked after HM3 and uses knowledge layer');
{
  resetState();
  unlockAllFundamentals();
  unlockSsh();
  let foundSsh = false;
  for (let i = 0; i < 50; i += 1) {
    resetState();
    unlockAllFundamentals();
    unlockSsh();
    const c = startEmployeeConversation();
    if (c.currentTopicKey === topicKey('cisco-packet-tracer', 'ssh')) {
      foundSsh = true;
      assertTrue(isKnowledgeQuestion(c.question), 'ssh question should come from knowledge layer');
      break;
    }
  }
  assertTrue(foundSsh, 'ssh topic should appear after HM3');
}

console.log('Correct answer records semantic history');
{
  resetState();
  unlockAllFundamentals();
  const { conv, trace } = runFullConversation(true);
  assertTrue(trace.length >= 1, 'conversation had questions');
  assertTrue(conv.semanticHistory.longTerm.length > 0, 'long-term history recorded');
  assertTrue(conv.semanticHistory.session.length > 0, 'session history recorded');
  const first = conv.semanticHistory.session[0];
  assertTrue(first.knowledgeItemId || first.topicKey, 'history entry has identity');
  assertTrue(first.correct === true, 'first answer recorded as correct');
}

console.log('Wrong answer triggers Sam explanation and retry boost');
{
  resetState();
  unlockAllFundamentals();
  const { conv, trace } = runFullConversation(false);
  const wrongEntry = trace[0];
  assertTrue(wrongEntry.correct === false, 'answer evaluated as wrong');
  assertTrue(wrongEntry.samExplanation.length > 5, 'Sam provides explanation');
  const historyEntry = conv.semanticHistory.longTerm.find((h) => h.topicKey === wrongEntry.topicKey);
  assertTrue(!!historyEntry, 'wrongly answered topic recorded in long-term history');
  assertTrue(historyEntry.correct === false, 'history marks wrong answer');
}

console.log('Next question differs semantically from previous');
{
  resetState();
  unlockAllFundamentals();
  const conv = startEmployeeConversation();
  conv.plannedLength = 5;
  const firstTopic = conv.currentTopicKey;
  const firstItem = conv.question.knowledgeItemId || conv.question.archetypeId;
  const answer = answerForQuestion(conv.question);
  evaluateEmployeeAnswer(conv, answer);
  const next = advanceConversation(conv);
  assertTrue(next.state === 'question', 'conversation continues');
  const secondTopic = next.conversation.currentTopicKey;
  const secondItem = next.conversation.question.knowledgeItemId || next.conversation.question.archetypeId;
  const different = secondTopic !== firstTopic || secondItem !== firstItem;
  assertTrue(different, 'next question differs from first');
}

console.log('No ssh.configProcedure in conversation output');
{
  resetState();
  unlockAllFundamentals();
  unlockSsh();
  for (let i = 0; i < 100; i += 1) {
    resetState();
    unlockAllFundamentals();
    unlockSsh();
    const { trace } = runFullConversation(true);
    for (const t of trace) {
      assertFalse(t.question.knowledgeItemId === 'ssh.configProcedure', 'ssh.configProcedure must not appear');
    }
  }
}

console.log('OSI layer variation over many conversations');
{
  resetState();
  unlockAllFundamentals();
  const seenLayers = new Set();
  const seenArchetypes = new Set();
  for (let i = 0; i < 200; i += 1) {
    resetState();
    unlockAllFundamentals();
    const { trace } = runFullConversation(true);
    for (const t of trace) {
      if (t.topicKey === topicKey('fundamentals', 'osi-model')) {
        const match = (t.question.knowledgeItemId || '').match(/osi\.layer(\d)/);
        if (match) seenLayers.add(match[1]);
        seenArchetypes.add(t.question.archetypeId);
      }
    }
  }
  assertTrue(seenLayers.size >= 2, `osi layer variation: ${[...seenLayers].join(', ')}`);
}

console.log('Calculation questions appear in conversations');
{
  resetState();
  unlockAllFundamentals();
  let foundCalc = false;
  for (let i = 0; i < 100; i += 1) {
    resetState();
    unlockAllFundamentals();
    const { trace } = runFullConversation(true);
    for (const t of trace) {
      const item = getAllKnowledgeItems().find((it) => it.id === t.question.knowledgeItemId);
      if (item && item.type === 'CALCULATION') {
        foundCalc = true;
        assertTrue(t.question.options.length >= 2, 'calculation question has options');
        assertTrue(!!t.question.correctOptionId, 'calculation question has correct option');
      }
    }
    if (foundCalc) break;
  }
  assertTrue(foundCalc, 'at least one calculation question appeared');
}

console.log('Question instanceId changes each question (UI reset)');
{
  resetState();
  unlockAllFundamentals();
  const conv = startEmployeeConversation();
  conv.plannedLength = 5;
  const firstId = conv.question.instanceId;
  const answer = answerForQuestion(conv.question);
  evaluateEmployeeAnswer(conv, answer);
  const next = advanceConversation(conv);
  assertTrue(next.state === 'question', 'conversation continues to second question');
  assertTrue(next.conversation.question.instanceId !== firstId, 'instanceId changes between questions');
}

console.log('Summary links preserve topic keys');
{
  resetState();
  unlockAllFundamentals();
  const { summary } = runFullConversation(true);
  assertTrue(summary.touchedTopics.length > 0, 'summary lists touched topics');
  for (const t of summary.touchedTopics) {
    assertTrue(!!t.categoryId && !!t.topicId, 'summary topic has category and topic ids');
  }
}

console.log('Mass test: 100 conversations');
{
  resetState();
  unlockAllFundamentals();
  unlockSsh();
  const traces = [];
  for (let i = 0; i < 100; i += 1) {
    // Intentionally do NOT reset localStorage here so long-term semantic history persists.
    const result = runFullConversation(Math.random() > 0.3);
    if (result) traces.push(result.trace);
  }
  let total = 0;
  const topicCounts = new Map();
  const itemCounts = new Map();
  let tripleItemRepetition = 0;
  let lastItemIdentity = null;
  let itemStreak = 0;
  let calcCount = 0;
  let sshCount = 0;
  for (const trace of traces) {
    // Reset streak at conversation boundary because session history resets.
    lastItemIdentity = null;
    itemStreak = 0;
    for (const t of trace) {
      total += 1;
      topicCounts.set(t.topicKey, (topicCounts.get(t.topicKey) || 0) + 1);
      const identity = t.question.knowledgeItemId || `${t.topicKey}::${t.question.archetypeId}`;
      itemCounts.set(identity, (itemCounts.get(identity) || 0) + 1);
      if (identity === lastItemIdentity) {
        itemStreak += 1;
      } else {
        itemStreak = 1;
        lastItemIdentity = identity;
      }
      if (itemStreak >= 3) tripleItemRepetition += 1;
      const item = getAllKnowledgeItems().find((it) => it.id === t.question.knowledgeItemId);
      if (item && item.type === 'CALCULATION') calcCount += 1;
      if (t.topicKey === topicKey('cisco-packet-tracer', 'ssh')) sshCount += 1;
    }
  }
  const maxTopic = Math.max(...topicCounts.values());
  const maxRatio = maxTopic / total;
  console.log(`  total questions: ${total}`);
  console.log(`  distinct topics: ${topicCounts.size}`);
  console.log(`  distinct items/archetypes: ${itemCounts.size}`);
  console.log(`  top topic ratio: ${(maxRatio * 100).toFixed(1)}%`);
  console.log(`  calculation questions: ${calcCount}`);
  console.log(`  ssh questions: ${sshCount}`);
  console.log(`  triple item repetitions: ${tripleItemRepetition}`);
  assertTrue(total >= 100, 'at least 100 questions asked');
  assertTrue(topicCounts.size >= 5, `topic variation: ${topicCounts.size}`);
  assertTrue(maxRatio < 0.35, `no topic dominance: ${maxRatio}`);
  assertTrue(tripleItemRepetition === 0, 'no same question/item three times consecutively');
  assertTrue(calcCount >= 5, 'calculation questions appear in mass test');
  assertTrue(sshCount >= 1, 'ssh questions appear after unlock');
}

console.log('Original problem regression: no WAN/WAN/WAN chains');
{
  resetState();
  unlockAllFundamentals();
  let maxWanStreak = 0;
  let currentStreak = 0;
  const traces = [];
  for (let i = 0; i < 200; i += 1) {
    const result = runFullConversation(true);
    if (result) traces.push(result.trace);
  }
  for (const trace of traces) {
    for (const t of trace) {
      const text = t.question.text.toLowerCase();
      const isWan = (text.includes('wan') || t.question.archetypeId === 'gb-3');
      if (isWan) currentStreak += 1;
      else currentStreak = 0;
      maxWanStreak = Math.max(maxWanStreak, currentStreak);
    }
  }
  assertTrue(maxWanStreak < 3, `max WAN streak: ${maxWanStreak}`);
}

console.log('Original problem regression: no repeated Kabelbruch/Layer-1 bursts');
{
  resetState();
  unlockAllFundamentals();
  let maxKabelbruchStreak = 0;
  let currentStreak = 0;
  for (let i = 0; i < 200; i += 1) {
    const result = runFullConversation(true);
    if (!result) continue;
    for (const t of result.trace) {
      const text = t.question.text.toLowerCase();
      const isKabelbruch = text.includes('kabelbruch') ||
        (t.question.knowledgeItemId && t.question.knowledgeItemId.includes('layer1')) ||
        text.includes('kabel') && text.includes('bruch');
      if (isKabelbruch) currentStreak += 1;
      else currentStreak = 0;
      maxKabelbruchStreak = Math.max(maxKabelbruchStreak, currentStreak);
    }
  }
  assertTrue(maxKabelbruchStreak < 3, `max Kabelbruch/Layer-1 streak: ${maxKabelbruchStreak}`);
}

console.log('Original problem regression: Hub vs Switch not repeated in short window');
{
  resetState();
  unlockAllFundamentals();
  let lastHubSwitchIndex = -10;
  let violations = 0;
  let questionIndex = 0;
  for (let i = 0; i < 200; i += 1) {
    const result = runFullConversation(true);
    if (!result) continue;
    for (const t of result.trace) {
      const text = t.question.text.toLowerCase();
      const isHubSwitch = text.includes('hub') && text.includes('switch');
      if (isHubSwitch) {
        if (questionIndex - lastHubSwitchIndex <= 3) violations += 1;
        lastHubSwitchIndex = questionIndex;
      }
      questionIndex += 1;
    }
  }
  assertTrue(violations <= 10, `Hub/Switch short-window repeats: ${violations}`);
}

console.log('Original problem regression: UI reset key changes between questions');
{
  resetState();
  unlockAllFundamentals();
  const conv = startEmployeeConversation();
  conv.plannedLength = 5;
  const seenIds = new Set([conv.question.instanceId]);
  while (!conv.completed && seenIds.size < 5) {
    const answer = answerForQuestion(conv.question);
    evaluateEmployeeAnswer(conv, answer);
    const next = advanceConversation(conv);
    if (next.state === 'summary') break;
    Object.assign(conv, next.conversation);
    assertFalse(seenIds.has(conv.question.instanceId), 'instanceId must change each question');
    seenIds.add(conv.question.instanceId);
  }
  assertTrue(seenIds.size >= 2, 'at least two different question instances');
}

console.log('Original problem regression: no ambiguous OSI/TCP-IP mapping question');
{
  resetState();
  unlockAllFundamentals();
  unlockTopic('fundamentals', 'tcp-ip-model');
  for (let i = 0; i < 100; i += 1) {
    const result = runFullConversation(true);
    if (!result) continue;
    for (const t of result.trace) {
      const text = t.question.text.toLowerCase();
      const asksAboutMapping = (text.includes('osi') && text.includes('tcp/ip')) ||
        text.includes('entspricht') ||
        text.includes('mapping') ||
        text.includes('zuordnen');
      if (asksAboutMapping) {
        assertTrue(
          text.includes('tcp/ip-modell') && text.includes('osi'),
          `ambiguous OSI/TCP-IP mapping question: ${t.question.text}`,
        );
      }
    }
  }
}

console.log('\n✅ Phase 5 Conversation Integration tests passed');
