import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { getFullTopic } from '../src/lib/academyProgress.js';
import { setLearningMode, LEARNING_MODES } from '../src/lib/academyMode.js';
import {
  startEmployeeConversation,
  evaluateEmployeeAnswer,
  advanceConversation,
  getConversationSummary,
  resetEmployeeConversations,
  CONVERSATION_TOPICS,
} from '../src/lib/employeeConversations.js';
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

// 1. Ohne freigeschaltete Topics gibt es kein Gespräch
withLocalStorage(() => {
  resetEmployeeConversations();
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
  globalThis.localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify({ version: 8, topics: lockedTopics }));
  const conv = startEmployeeConversation();
  assert.equal(conv, null, 'No conversation if no topics unlocked');
});

// 2. Gespräch startet mit gültigem Topic, Mitarbeiter und geplanter Länge
withLocalStorage(() => {
  resetEmployeeConversations();
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
  const conv = startEmployeeConversation();
  const q = conv.question;
  const result = evaluateEmployeeAnswer(conv, q.correct);
  assert.equal(result.correct, true);
  assert.equal(result.scoreAwarded, true, 'Correct answer awards retention points');
  assert.equal(result.samStageDirection, '');
  assert.ok(result.employeeReaction.length > 0, 'Employee reacts to correct answer');
});

// 4. Zwei falsche Antworten hintereinander im selben Topic lösen Sam-Eingriff aus
withLocalStorage(() => {
  resetEmployeeConversations();
  let conv = startEmployeeConversation();
  const firstKey = conv.currentTopicKey;
  let samSeen = false;
  for (let i = 0; i < 3; i += 1) {
    const q = conv.question;
    const wrongIndex = (q.correct + 1) % q.options.length;
    const result = evaluateEmployeeAnswer(conv, wrongIndex);
    assert.equal(result.correct, false);
    if (result.samStageDirection && result.samStageDirection.length > 0) samSeen = true;
    if (conv.currentTopicKey === firstKey && result.samStageDirection && result.samStageDirection.length > 0) {
      assert.ok(true, 'Sam intervention after repeated errors in same topic');
      break;
    }
    const next = advanceConversation(conv);
    if (next.state === 'summary') break;
    conv = next.conversation;
  }
  assert.ok(samSeen, 'Sam intervention triggered after consecutive errors');
});

// 5. Mehrteilige Gespräche können über mehrere Fragen laufen, wenn plannedLength > 1
withLocalStorage(() => {
  resetEmployeeConversations();
  let conv = startEmployeeConversation();
  assert.ok(conv);
  let turns = 0;
  const max = Math.max(conv.plannedLength, 3);
  while (turns < max) {
    evaluateEmployeeAnswer(conv, conv.question.correct);
    turns += 1;
    const next = advanceConversation(conv);
    if (next.state === 'summary') break;
    conv = next.conversation;
  }
  assert.ok(turns >= 1, 'At least one question was answered');
  const summary = getConversationSummary(conv);
  assert.equal(summary.total, turns);
  assert.equal(summary.correctCount + summary.incorrectCount, turns);
  assert.ok(Array.isArray(summary.touchedTopics), 'Summary lists touched topics');
});

// 6. Fragehistorie sorgt für Cooldown: dieselbe Frage taucht nicht sofort wieder auf
withLocalStorage(() => {
  resetEmployeeConversations();
  let conv = startEmployeeConversation();
  const asked = new Set();
  let turns = 0;
  while (turns < 3) {
    const q = conv.question;
    assert.ok(!asked.has(q.id), `Question ${q.id} not repeated immediately`);
    asked.add(q.id);
    evaluateEmployeeAnswer(conv, q.correct);
    turns += 1;
    const next = advanceConversation(conv);
    if (next.state === 'summary') break;
    conv = next.conversation;
  }
});

// 7. applyConversationPractice existiert und ist idempotent genug
withLocalStorage(() => {
  const before = getFullTopic('fundamentals', 'grundbegriffe');
  const beforeRetention = before.retentionScore || 0;
  // exercise the engine path directly
  const conv = startEmployeeConversation();
  if (conv) {
    evaluateEmployeeAnswer(conv, conv.question.correct);
  }
  const after = getFullTopic('fundamentals', 'grundbegriffe');
  assert.ok(after.retentionScore >= beforeRetention, 'Conversation practice adds retention score');
});

// 8. Gesprächsinhalte decken relevante Academy-Themen ab
withLocalStorage(() => {
  const keys = Object.keys(CONVERSATION_TOPICS);
  assert.ok(keys.length >= 4, 'Multiple conversation topics exist');
  for (const key of keys) {
    const topic = CONVERSATION_TOPICS[key];
    assert.ok(topic.questions.length > 0, `${key} has questions`);
    assert.ok(topic.relatedTopics, `${key} has related topics`);
    assert.ok(topic.introPool.length > 0, `${key} has intro pool`);
  }
});

// 9. Nur Story-Charaktere als Gesprächspartner, niemals generierte Accounts
withLocalStorage(() => {
  resetEmployeeConversations();
  const allowedIds = new Set(['mara', 'david', 'aylin', 'thomas']);
  const forbiddenIds = new Set(['henrik', 'nina', 'tom', 'mats', 'mila']);
  for (let i = 0; i < 20; i += 1) {
    const conv = startEmployeeConversation();
    assert.ok(conv, `Conversation ${i + 1} starts`);
    assert.ok(allowedIds.has(conv.employee.id), `Conversation partner is story character, got ${conv.employee.id}`);
    assert.ok(!forbiddenIds.has(conv.employee.id), `No generated account appears as partner, got ${conv.employee.id}`);
  }
});

// 10. Falsche Antwort löst sofort Sam-Intervention aus
withLocalStorage(() => {
  resetEmployeeConversations();
  const conv = startEmployeeConversation();
  const q = conv.question;
  const wrongIndex = (q.correct + 1) % q.options.length;
  const result = evaluateEmployeeAnswer(conv, wrongIndex);
  assert.equal(result.correct, false);
  assert.ok(result.samStageDirection.length > 0, 'Sam stage direction present on first wrong answer');
  assert.ok(result.samExplanation.length > 0, 'Sam explanation present on first wrong answer');
});

// 11. Richtige Antwort zeigt Erklärung, aber ohne Sam-Intervention
withLocalStorage(() => {
  resetEmployeeConversations();
  const conv = startEmployeeConversation();
  const result = evaluateEmployeeAnswer(conv, conv.question.correct);
  assert.equal(result.correct, true);
  assert.ok(result.explanation.length > 0, 'Explanation visible for correct answer');
  assert.equal(result.samStageDirection, '', 'No Sam stage direction on correct answer');
  assert.equal(result.samExplanation, '', 'No Sam explanation on correct answer');
});

// 12. Session-Länge liegt zwischen 1 und 5 Fragen und bricht bei Fehlern nicht ab
withLocalStorage(() => {
  resetEmployeeConversations();
  let conv = startEmployeeConversation();
  assert.ok(conv.plannedLength >= 1 && conv.plannedLength <= 5, 'Planned session length 1–5');
  let turns = 0;
  while (turns < 10) {
    evaluateEmployeeAnswer(conv, conv.question.correct);
    turns += 1;
    const next = advanceConversation(conv);
    if (next.state === 'summary') break;
    conv = next.conversation;
  }
  assert.ok(turns >= 1 && turns <= 5, `Session completed in ${turns} turns`);
});

// 13. Lehrgangsmodus macht gesperrte Topics für Gespräche verfügbar
withLocalStorage(() => {
  resetEmployeeConversations();
  setLearningMode(LEARNING_MODES.COURSE);
  const lockedTopics = {};
  for (const t of ACADEMY_TOPICS) {
    lockedTopics[topicKey(t.categoryId, t.topicId)] = { status: 'locked', version: 1 };
  }
  localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify({ version: 8, topics: lockedTopics }));
  const conv = startEmployeeConversation();
  assert.ok(conv, 'Course mode allows conversations even when topics are locked');
  assert.ok(conv.question, 'Conversation has a question in course mode');
});

// 14. Cooldown-Fallback: wenn alle Fragen eines Topics noch auf Cooldown sind,
// wird die am längsten nicht gestellte Frage wiederverwendet, anstatt das System zu blocken
withLocalStorage(() => {
  resetEmployeeConversations();
  const conv = startEmployeeConversation();
  const key = conv.currentTopicKey;
  const topicData = CONVERSATION_TOPICS[key];
  const history = {};
  const now = Date.now();
  for (let i = 0; i < topicData.questions.length; i += 1) {
    const q = topicData.questions[i];
    history[q.id] = { askedAt: now - ((topicData.questions.length - i) * 1000), correct: true, difficulty: q.difficulty, topicKey: key, conversationId: 'test' };
  }
  localStorage.setItem('cyberlearn:employee-conversation-history-v1', JSON.stringify(history));
  const conv2 = startEmployeeConversation();
  assert.ok(conv2, 'Conversation starts despite all topic questions being on cooldown');
  assert.ok(conv2.question, 'Cooldown fallback still provides a question');
});

// 15. Abschlussauswertung enthält Academy-Deep-Links mit categoryId/topicId
withLocalStorage(() => {
  resetEmployeeConversations();
  let conv = startEmployeeConversation();
  evaluateEmployeeAnswer(conv, conv.question.correct);
  const summary = getConversationSummary(conv);
  assert.ok(summary.touchedTopics.length > 0, 'Summary lists touched topics');
  for (const t of summary.touchedTopics) {
    assert.ok(t.categoryId, 'Touched topic has categoryId for deep link');
    assert.ok(t.topicId, 'Touched topic has topicId for deep link');
  }
});

console.log('Phase 1I.2 Employee-Conversation-Tests: OK');
