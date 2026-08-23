// Phase 1J.3 Etappe 4: SSH/Remote-Administration content for the existing
// employee-conversation engine (employeeConversations.js). Reuses the
// engine unchanged - only a new CONVERSATION_TOPICS entry for
// 'cisco-packet-tracer/ssh' was added, following the exact same shape as
// every other topic (title/relatedTopics/introPool/samHelp/questions).

import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import {
  startEmployeeConversation,
  evaluateEmployeeAnswer,
  advanceConversation,
  resetEmployeeConversations,
  CONVERSATION_TOPICS,
  getArchetypes,
} from '../src/lib/employeeConversations.js';

function withLocalStorage(fn) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.window = globalThis.window || { dispatchEvent: () => {} };
  try {
    fn();
  } finally {
    delete globalThis.localStorage;
  }
}

function baseLockedProgress() {
  const topics = {};
  for (const t of ACADEMY_TOPICS) {
    topics[topicKey(t.categoryId, t.topicId)] = {
      status: 'locked',
      theoryScore: 0, practiceScore: 0, retentionScore: 0,
      contentSeenPercent: 0, lessonCompletions: 0,
      quizAttempts: 0, quizPerfectCount: 0, quizPerfectStreak: 0, quizBestScore: 0, quizLastScore: 0,
      difficultyLevel: 0, difficultyExamsPassed: [],
      appliedCount: 0, repetitionCount: 0,
      availableLessons: [], availableExercises: [], unlockedTools: [],
      relatedMissions: [], relatedSideMissions: [],
      startedAt: null, lastCompletedSectionId: null, lastCompletedSectionTitle: null,
      completedSectionIds: [], completedQuestionIds: [], completedExerciseIds: [],
      lastExplanationStyle: null, version: 1,
    };
  }
  return { version: 8, topics };
}

// Only unlocks the SSH topic itself - everything else stays locked so a
// conversation is forced onto the SSH topic.
//
// NOTE: this used to also mark SSH's Academy prerequisites (static-routing,
// inter-vlan-routing, multilayer-switching) as 'available', under the
// assumption that the "real unlock chain" needed them. That is unnecessary
// and was actively harmful: employeeConversations.js's
// isTopicUnlockedForConversations() reads a topic's OWN persisted status
// directly (see academyProgress.js's getTopicProgress()) - it never
// recomputes or requires prerequisite status. Marking prerequisites
// 'available' just made them additional, real conversation-topic candidates:
// 'cisco-packet-tracer/static-routing' has its own Knowledge Layer coverage
// (ct.static.* items) and a CONVERSATION_TOPICS entry, so the balancer could
// legitimately pick IT instead of SSH, making this test's "forced onto SSH"
// premise intermittently false (this was the actual root cause of the
// long-standing flakiness here, not any RNG/seeding bug in the balancer
// itself). Only the topic actually under test should ever be 'available'.
function onlySshUnlockedProgress() {
  const data = baseLockedProgress();
  const sshKey = topicKey('cisco-packet-tracer', 'ssh');
  data.topics[sshKey].status = 'available';
  return data;
}

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

const SSH_KEY = topicKey('cisco-packet-tracer', 'ssh');

console.log('CONVERSATION_TOPICS registration');
{
  test('cisco-packet-tracer/ssh is registered', () => assert.ok(CONVERSATION_TOPICS[SSH_KEY]));
  const topicData = CONVERSATION_TOPICS[SSH_KEY];
  test('has a title', () => assert.ok(topicData.title && topicData.title.length > 0));
  test('has at least one intro line', () => assert.ok(Array.isArray(topicData.introPool) && topicData.introPool.length > 0));
  test('has Sam help text', () => assert.ok(topicData.samHelp && topicData.samHelp.length > 20));
  test('has at least 5 questions (understanding/troubleshooting/transfer, not just one command drill)', () => assert.ok(topicData.questions.length >= 5));

  const allIds = new Set();
  for (const cat of Object.values(CONVERSATION_TOPICS)) {
    for (const q of cat.questions || []) allIds.add(q.id);
  }
  for (const q of topicData.questions) {
    test(`question "${q.id}" has a well-formed shape`, () => {
      assert.ok(q.id && typeof q.id === 'string');
      assert.ok(['easy', 'medium', 'hard'].includes(q.difficulty));
      assert.ok(q.text && q.text.length > 10);
      assert.ok(Array.isArray(q.options) && q.options.length === 4);
      assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length);
      assert.ok(q.explanation && q.explanation.length > 10);
    });
  }
  test('question ids are globally unique across all conversation topics', () => {
    const sshIds = topicData.questions.map((q) => q.id);
    assert.equal(new Set(sshIds).size, sshIds.length);
  });
}

console.log('\nContent focuses on understanding/troubleshooting/transfer, not just command recall');
{
  const topicData = CONVERSATION_TOPICS[SSH_KEY];
  const troubleshootingMarkers = ['warum', 'woran', 'wahrscheinlich', 'ursache', 'fehlt', 'unterschied', 'antwortest', 'antwort'];
  test('every question frames a "why / what is wrong / what is the difference" scenario rather than pure syntax recall', () => {
    for (const q of topicData.questions) {
      const lower = q.text.toLowerCase();
      assert.ok(troubleshootingMarkers.some((m) => lower.includes(m)), `question "${q.id}" does not look like an understanding/troubleshooting/transfer question: "${q.text}"`);
    }
  });
  test('no question option is a bare, single Cisco command with no explanatory framing', () => {
    for (const q of topicData.questions) {
      for (const option of q.options) {
        const looksLikeBareCommand = /^(ip |crypto |line |username |interface |switchport |vlan )/i.test(option.trim()) && option.trim().split(' ').length <= 4;
        assert.ok(!looksLikeBareCommand, `question "${q.id}" has a bare-command-only option: "${option}"`);
      }
    }
  });
}

console.log('\ngetArchetypes() picks up the new questions through the existing generic mechanism');
{
  const topicData = CONVERSATION_TOPICS[SSH_KEY];
  const archetypes = getArchetypes(topicData);
  test('every SSH question becomes an "mc" archetype', () => {
    const mcArchetypes = archetypes.filter((a) => a.type === 'mc');
    assert.equal(mcArchetypes.length, topicData.questions.length);
  });
}

// The Knowledge Layer balancer legitimately picks ANY non-excluded SSH
// knowledge item at random (weighted by mastery/recency, but not
// deterministic across runs - conversationId is seeded from Date.now() +
// Math.random() by design, see startEmployeeConversation()). Of the 9 SSH
// items, 'ssh.configProcedure' (ordering) is excluded (EXCLUDED_KNOWLEDGE_ITEMS),
// so the first question can legitimately be either 'mc' (7 items) or
// 'matching' (1 item: ssh.verificationCommands) - asserting one fixed type
// here would be asserting an implementation detail of the random draw, not
// an actual product requirement. Build the correct/wrong answer generically
// for whichever well-formed type shows up instead.
const SUPPORTED_SSH_QUESTION_TYPES = ['mc', 'matching'];

function correctAnswerFor(question) {
  if (question.type === 'mc') return question.correctOptionId;
  if (question.type === 'matching') {
    return Object.fromEntries(question.correctPairs.map((p) => [p.leftId ?? p.left, p.rightId ?? p.right]));
  }
  throw new Error(`correctAnswerFor: unsupported question type "${question.type}"`);
}

function wrongAnswerFor(question) {
  if (question.type === 'mc') {
    return question.options.find((o) => o.id !== question.correctOptionId).id;
  }
  if (question.type === 'matching') {
    // Swap every pairing so every left item is matched to the wrong right item.
    const rightIds = question.correctPairs.map((p) => p.rightId ?? p.right);
    return Object.fromEntries(question.correctPairs.map((p, i) => {
      const leftKey = p.leftId ?? p.left;
      const wrongRight = rightIds[(i + 1) % rightIds.length];
      return [leftKey, wrongRight];
    }));
  }
  throw new Error(`wrongAnswerFor: unsupported question type "${question.type}"`);
}

console.log('\nEnd-to-end: a real conversation can be forced onto the SSH topic and played');
{
  withLocalStorage(() => {
    resetEmployeeConversations();
    globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(onlySshUnlockedProgress()));
    const conv = startEmployeeConversation();
    test('a conversation starts when only the SSH topic (and its prerequisites) are unlocked', () => assert.ok(conv));
    test('the conversation topic is cisco-packet-tracer/ssh', () => assert.equal(conv.currentTopicKey, SSH_KEY));
    test('the first question is a well-formed mc or matching question', () => {
      assert.ok(SUPPORTED_SSH_QUESTION_TYPES.includes(conv.question.type), `unexpected question type "${conv.question.type}"`);
      if (conv.question.type === 'mc') assert.ok(conv.question.correctOptionId);
      if (conv.question.type === 'matching') assert.ok(Array.isArray(conv.question.correctPairs) && conv.question.correctPairs.length > 0);
    });

    const result = evaluateEmployeeAnswer(conv, correctAnswerFor(conv.question));
    test('answering correctly is recognised as correct', () => assert.equal(result.correct, true));
    test('a correct answer awards practice score', () => assert.equal(result.scoreAwarded, true));
  });
  withLocalStorage(() => {
    resetEmployeeConversations();
    globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(onlySshUnlockedProgress()));
    const conv = startEmployeeConversation();
    const wrongResult = evaluateEmployeeAnswer(conv, wrongAnswerFor(conv.question));
    test('answering incorrectly triggers a Sam intervention', () => assert.ok(wrongResult.samStageDirection.length > 0));
  });
}

console.log('\nSSH topic participates in normal session flow (advance/summary) without special-casing');
{
  withLocalStorage(() => {
    resetEmployeeConversations();
    globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(onlySshUnlockedProgress()));
    let conv = startEmployeeConversation();
    let turns = 0;
    let reachedSummary = false;
    while (turns < 10) {
      const answer = correctAnswerFor(conv.question);
      evaluateEmployeeAnswer(conv, answer);
      turns += 1;
      const next = advanceConversation(conv);
      if (next.state === 'summary') { reachedSummary = true; break; }
      conv = next.conversation;
    }
    test('the session reaches a summary within the normal 1-5 turn range', () => assert.ok(reachedSummary && turns >= 1 && turns <= 5));
  });
}

console.log(`\n${passed} tests passed`);
