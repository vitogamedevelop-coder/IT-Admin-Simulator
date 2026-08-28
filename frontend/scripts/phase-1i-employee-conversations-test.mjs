import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { setLearningMode, LEARNING_MODES } from '../src/lib/academyMode.js';
import {
  startEmployeeConversation,
  evaluateEmployeeAnswer,
  advanceConversation,
  getConversationSummary,
  resetEmployeeConversations,
  CONVERSATION_TOPICS,
  getArchetypes,
  buildInstance,
} from '../src/lib/employeeConversations.js';
import { hasConversationMastery, getConversationMastery } from '../src/lib/conversationMastery.js';
import assert from 'node:assert/strict';

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

function makeLockedProgress() {
  const lockedTopics = {};
  for (const t of ACADEMY_TOPICS) {
    lockedTopics[topicKey(t.categoryId, t.topicId)] = {
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
  return { version: 8, topics: lockedTopics };
}

function firstUnlockedTopic() {
  // Start with all fundamentals topics available so tests don't depend on the
  // exact progression state unless explicitly locking topics.
  const data = makeLockedProgress();
  for (const key of Object.keys(data.topics)) {
    if (key.startsWith('fundamentals/')) {
      data.topics[key].status = 'available';
    }
  }
  return data;
}

// 1. Ohne freigeschaltete Topics gibt es kein Gespräch
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(makeLockedProgress()));
  const conv = startEmployeeConversation();
  assert.equal(conv, null, 'No conversation if no topics unlocked');
});

// 2. Gespräch startet mit gültigem Topic, Mitarbeiter und geplanter Länge
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(firstUnlockedTopic()));
  const conv = startEmployeeConversation();
  const allowedIds = new Set(['mara', 'david', 'aylin', 'thomas']);
  assert.ok(conv, 'Conversation starts when topics are available');
  assert.ok(conv.conversationId, 'Has session id');
  assert.ok(conv.employee, 'Has employee');
  assert.ok(allowedIds.has(conv.employee.id), `Conversation partner is a story character, got ${conv.employee.id}`);
  assert.ok(conv.topicData, 'Has topicData');
  assert.ok(conv.question, 'Has first question');
  assert.ok(conv.plannedLength >= 1 && conv.plannedLength <= 5, 'Planned length 1–5');
  assert.ok(conv.intro.length > 0, 'Has intro');
});

// 3. Richtige Antwort vergibt Punkte, keine Sam-Intervention
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(firstUnlockedTopic()));
  const conv = startEmployeeConversation();
  const q = conv.question;
  const answer = q.type === 'mc'
    ? q.correctOptionId
    : q.type === 'matching'
      ? Object.fromEntries(q.correctPairs.map((p) => [p.leftId ?? p.left, p.rightId ?? p.right]))
      : q.correctOrderIds;
  const result = evaluateEmployeeAnswer(conv, answer);
  assert.equal(result.correct, true);
  assert.equal(result.scoreAwarded, true, 'Correct answer awards practice points');
  assert.equal(result.samStageDirection, '');
  assert.ok(result.employeeReaction.length > 0, 'Employee reacts to correct answer');
});

// 4. Falsche Antwort löst sofort Sam-Intervention aus
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(firstUnlockedTopic()));
  const conv = startEmployeeConversation();
  const q = conv.question;
  let wrongAnswer;
  if (q.type === 'mc') wrongAnswer = q.options.find((o) => o.id !== q.correctOptionId).id;
  else if (q.type === 'ordering') wrongAnswer = [...q.correctOrderIds].reverse();
  else if (q.type === 'matching') wrongAnswer = {};
  const result = evaluateEmployeeAnswer(conv, wrongAnswer);
  assert.equal(result.correct, false);
  assert.ok(result.samStageDirection.length > 0, 'Sam stage direction present on first wrong answer');
  assert.ok(result.samExplanation.length > 0, 'Sam explanation present on first wrong answer');
});

// 5. Session-Länge liegt zwischen 1 und 5 Fragen und bricht bei Fehlern nicht ab
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(firstUnlockedTopic()));
  let conv = startEmployeeConversation();
  assert.ok(conv.plannedLength >= 1 && conv.plannedLength <= 5, 'Planned session length 1–5');
  let turns = 0;
  while (turns < 10) {
    const q = conv.question;
    const answer = q.type === 'mc'
      ? q.correctOptionId
      : q.type === 'matching'
        ? Object.fromEntries(q.correctPairs.map((p) => [p.leftId ?? p.left, p.rightId ?? p.right]))
        : q.correctOrderIds;
    evaluateEmployeeAnswer(conv, answer);
    turns += 1;
    const next = advanceConversation(conv);
    if (next.state === 'summary') break;
    conv = next.conversation;
  }
  assert.ok(turns >= 1 && turns <= 5, `Session completed in ${turns} turns`);
});

// 6. Lehrgangsmodus macht gesperrte Topics für Gespräche verfügbar
withLocalStorage(() => {
  resetEmployeeConversations();
  setLearningMode(LEARNING_MODES.COURSE);
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(makeLockedProgress()));
  const conv = startEmployeeConversation();
  assert.ok(conv, 'Course mode allows conversations even when topics are locked');
  assert.ok(conv.question, 'Conversation has a question in course mode');
});

// 7. Nur Story-Charaktere als Gesprächspartner, niemals generierte Accounts
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(firstUnlockedTopic()));
  const allowedIds = new Set(['mara', 'david', 'aylin', 'thomas']);
  const forbiddenIds = new Set(['henrik', 'nina', 'tom', 'mats', 'mila']);
  for (let i = 0; i < 20; i += 1) {
    const conv = startEmployeeConversation();
    assert.ok(conv, `Conversation ${i + 1} starts`);
    assert.ok(allowedIds.has(conv.employee.id), `Conversation partner is story character, got ${conv.employee.id}`);
    assert.ok(!forbiddenIds.has(conv.employee.id), `No generated account appears as partner, got ${conv.employee.id}`);
  }
});

// 8. Multiple-Choice-Antworten werden gemischt; correctOptionId bleibt stabil
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(firstUnlockedTopic()));
  const positions = new Set();
  for (let i = 0; i < 30; i += 1) {
    const conv = startEmployeeConversation();
    const q = conv.question;
    if (q.type !== 'mc') continue;
    const idx = q.options.findIndex((o) => o.id === q.correctOptionId);
    positions.add(idx);
  }
  assert.ok(positions.size > 1, `Correct answer appears in different positions: ${[...positions]}`);
});

// 9. OSI-Ordering: es können beide Richtungen erzeugt werden
withLocalStorage(() => {
  resetEmployeeConversations();
  const osiKey = topicKey('fundamentals', 'osi-model');
  const archetypes = getArchetypes(CONVERSATION_TOPICS[osiKey]);
  const orderingArchetype = archetypes.find((a) => a.id === 'osi-ordering');
  assert.ok(orderingArchetype, 'OSI ordering archetype exists');
  const seen = new Set();
  for (let i = 0; i < 30; i += 1) {
    const inst = buildInstance(osiKey, orderingArchetype);
    assert.equal(inst.type, 'ordering');
    assert.equal(inst.items.length, 7);
    assert.equal(inst.correctOrderIds.length, 7);
    seen.add(inst.correctOrderIds[0]);
    if (seen.size >= 2) break;
  }
  assert.ok(seen.size >= 2, 'OSI ordering generates both top-down and bottom-up directions');
});

// 10. OSI-Matching: rechte Seite wird gemischt, korrekte Zuordnung erkannt
withLocalStorage(() => {
  resetEmployeeConversations();
  const osiKey = topicKey('fundamentals', 'osi-model');
  const archetypes = getArchetypes(CONVERSATION_TOPICS[osiKey]);
  const matchingArchetype = archetypes.find((a) => a.id === 'osi-matching');
  assert.ok(matchingArchetype, 'OSI matching archetype exists');
  const inst = buildInstance(osiKey, matchingArchetype);
  assert.equal(inst.type, 'matching');
  assert.equal(inst.leftItems.length, 7);
  assert.equal(inst.rightItems.length, 7);
  const answer = {};
  for (const p of inst.correctPairs) answer[p.left] = p.right;
  const conv = { question: inst, currentTopicKey: osiKey, employee: { id: 'mara', name: 'Mara', role: 'Tester' }, questions: [], correctCount: 0, incorrectCount: 0, samInterventions: 0, conversationId: 'test' };
  const result = evaluateEmployeeAnswer(conv, answer);
  assert.equal(result.correct, true);
});

// 11. Cooldown-Fallback: wenn alle Fragen eines Topics auf Cooldown sind, wird die
// älteste wiederverwendet, statt das System zu blocken
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(firstUnlockedTopic()));
  const conv = startEmployeeConversation();
  const key = conv.currentTopicKey;
  const topicData = CONVERSATION_TOPICS[key];
  const archetypes = getArchetypes(topicData);
  const history = {};
  const now = Date.now();
  for (let i = 0; i < archetypes.length; i += 1) {
    const a = archetypes[i];
    history[`${key}/${a.id}`] = { askedAt: now - ((archetypes.length - i) * 1000), correct: true, difficulty: a.difficulty, concept: a.concept, topicKey: key, conversationId: 'test' };
  }
  globalThis.localStorage.setItem('cyberlearn:employee-conversation-history-v1', JSON.stringify(history));
  const conv2 = startEmployeeConversation();
  assert.ok(conv2, 'Conversation starts despite all topic archetypes being on cooldown');
  assert.ok(conv2.question, 'Cooldown fallback still provides a question');
});

// 12. Abschlussauswertung enthält Academy-Deep-Links mit categoryId/topicId
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(firstUnlockedTopic()));
  let conv = startEmployeeConversation();
  const q = conv.question;
  const answer = q.type === 'mc' ? q.correctOptionId : q.correctOrderIds;
  evaluateEmployeeAnswer(conv, answer);
  const summary = getConversationSummary(conv);
  assert.ok(summary.touchedTopics.length > 0, 'Summary lists touched topics');
  for (const t of summary.touchedTopics) {
    assert.ok(t.categoryId, 'Touched topic has categoryId for deep link');
    assert.ok(t.topicId, 'Touched topic has topicId for deep link');
  }
});

// 13. Richtige unabhängige Antworten füllen Conversation-Mastery
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(firstUnlockedTopic()));
  const key = topicKey('fundamentals', 'osi-model');
  const topicData = CONVERSATION_TOPICS[key];
  const archetypes = getArchetypes(topicData);
  for (const a of archetypes.slice(0, 3)) {
    const inst = buildInstance(key, a);
    let answer;
    if (inst.type === 'mc') answer = inst.correctOptionId;
    else if (inst.type === 'ordering') answer = inst.correctOrderIds;
    else if (inst.type === 'matching') {
      answer = {};
      for (const p of inst.correctPairs) answer[p.left] = p.right;
    }
    const conv = { question: inst, currentTopicKey: key, employee: { id: 'mara', name: 'Mara', role: 'Tester' }, questions: [], correctCount: 0, incorrectCount: 0, samInterventions: 0, conversationId: `test-${a.id}` };
    evaluateEmployeeAnswer(conv, answer);
  }
  const mastery = getConversationMastery(key);
  assert.ok(mastery.correct >= 3, 'Conversation mastery records correct answers');
  assert.ok(mastery.independentCorrect >= 3, 'Only independent successes count toward mastery');
  assert.ok(hasConversationMastery(key, { minCorrect: 3, minUniqueConcepts: 1 }), 'Mastery threshold can be reached');
});

// 14. Wiederholte Starts wählen unterschiedliche erste Topics / Fragen
withLocalStorage(() => {
  resetEmployeeConversations();
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(firstUnlockedTopic()));
  const firstTopics = new Set();
  const firstQuestions = new Set();
  for (let i = 0; i < 30; i += 1) {
    const conv = startEmployeeConversation();
    firstTopics.add(conv.currentTopicKey);
    firstQuestions.add(conv.question.instanceId.split('::')[1]);
  }
  assert.ok(firstTopics.size > 1, `Conversation starts vary topics: ${firstTopics.size}`);
  assert.ok(firstQuestions.size > 1, `Conversation starts vary questions: ${firstQuestions.size}`);
});

console.log('Phase 1I.2.3 Employee-Conversation-Tests: OK');
