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

// Only unlocks the SSH topic (plus its prerequisites, so the real unlock
// chain from academyTopics.js stays intact) - everything else stays locked
// so a conversation is forced onto the SSH topic.
function onlySshUnlockedProgress() {
  const data = baseLockedProgress();
  const sshKey = topicKey('cisco-packet-tracer', 'ssh');
  const prereqKeys = [
    topicKey('cisco-packet-tracer', 'static-routing'),
    topicKey('cisco-packet-tracer', 'inter-vlan-routing'),
    topicKey('cisco-packet-tracer', 'multilayer-switching'),
  ];
  for (const key of [sshKey, ...prereqKeys]) {
    data.topics[key].status = 'available';
  }
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

console.log('\nEnd-to-end: a real conversation can be forced onto the SSH topic and played');
{
  withLocalStorage(() => {
    resetEmployeeConversations();
    globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(onlySshUnlockedProgress()));
    const conv = startEmployeeConversation();
    test('a conversation starts when only the SSH topic (and its prerequisites) are unlocked', () => assert.ok(conv));
    test('the conversation topic is cisco-packet-tracer/ssh', () => assert.equal(conv.currentTopicKey, SSH_KEY));
    test('the first question is a well-formed mc question', () => {
      assert.equal(conv.question.type, 'mc');
      assert.ok(conv.question.correctOptionId);
    });

    const correctAnswer = conv.question.correctOptionId;
    const result = evaluateEmployeeAnswer(conv, correctAnswer);
    test('answering correctly is recognised as correct', () => assert.equal(result.correct, true));
    test('a correct answer awards practice score', () => assert.equal(result.scoreAwarded, true));

    const conv2 = startEmployeeConversation();
    const wrongResult = evaluateEmployeeAnswer(conv2, conv2.question.options.find((o) => o.id !== conv2.question.correctOptionId).id);
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
      const answer = conv.question.correctOptionId;
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
