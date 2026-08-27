import { createRng } from './knowledge/random.js';
import { ACADEMY_TOPICS, topicKey } from './academyTopics.js';
import { getTopicProgress, getFullTopic } from './academyProgress.js';
import { topicOverallProgress, isTopicMastered, applyConversationPractice } from './academyEngine.js';
import { randomConversationPartner } from './officeWorld.js';
import { readAcademyMode, LEARNING_MODES } from './academyMode.js';
import { OSI_LAYERS } from './academyLessons/osi.js';
import { SKILL_DIMENSION, SKILL_SOURCE, recordSkillEvent } from './skillTree.js';
import { recordConversationResult, resetConversationMastery } from './conversationMastery.js';
import {
  getAllKnowledgeItems,
  getKnowledgeItem,
  generateQuestion,
  createSemanticHistory,
  pushHistoryRecord,
  readLongTermHistory,
  writeLongTermHistory,
  selectCandidate,
  createBalancerState,
  recordFacetCorrect,
  recordFacetWrong,
  getAllFacetMasteryScores,
} from './knowledge/index.js';
import { validateSolvability } from './knowledge/validators.js';
import { getLoreLeadIn } from './knowledge/contextFamilies.js';

// =============================================================================
// NEXUS Mitarbeitergespräche – adaptive Wiederholung im Flur (Phase 1I / 1I.2).
//
// Eine Begegnung ist jetzt ein echtes Gespräch mit 1–5 bewerteten Fragen,
// thematischen Übergängen, Character-Voices, Sam-Eingriffen nach Fehlern,
// Frage-Cooldown, verschiedenen Aufgabentypen und einer Abschlussauswertung
// mit Academy-Deep-Links.
// =============================================================================

const SESSION_KEY = 'cyberlearn:employee-conversations-v2';
const HISTORY_KEY = 'cyberlearn:employee-conversation-history-v1';

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

// Cooldown baseline: correct answers are suppressed a bit longer so the player
// gets new material; incorrect answers come back almost immediately for spaced
// repetition. In absolute terms the values are short so a player is never
// artificially locked out of hallway conversations.
const CORRECT_COOLDOWN_MS = 3 * 60 * 1000;
const INCORRECT_COOLDOWN_MS = 10 * 1000;

// Prevent the same concept (e.g. "osi.layer_order") from appearing back-to-back
// across sessions, without hard-locking the pool.
const CONCEPT_COOLDOWN_MS = 2 * 60 * 1000;

// =============================================================================
// Knowledge Layer pilot integration (Phase 5)
// =============================================================================

const EXCLUDED_KNOWLEDGE_ITEMS = new Set([
  'osi.toTcpIp',       // intentionally has no template yet (ambiguity)
  'ssh.configProcedure', // rigid 10-step ordering – disabled until dependency graph
]);

/**
 * Returns true when the Knowledge Layer has at least one non-excluded item for
 * the given topic. Replaces the hard-coded PILOT_KNOWLEDGE_TOPICS allowlist so
 * new topics become available automatically once their knowledge items exist.
 */
function hasKnowledgeCoverage(topicKeyName) {
  return knowledgeItemsForTopic(topicKeyName).length > 0;
}

function knowledgeItemsForTopic(topicKeyName) {
  return getAllKnowledgeItems().filter((item) => {
    if (item.topicKey !== topicKeyName) return false;
    if (EXCLUDED_KNOWLEDGE_ITEMS.has(item.id)) return false;
    return true;
  });
}

function mapEmployeeRoleToHint(employee) {
  if (!employee || !employee.role) return null;
  const role = employee.role.toLowerCase();
  if (role.includes('netzwerk') || role.includes('technik') || role.includes('admin')) return 'technical';
  if (role.includes('helpdesk') || role.includes('support') || role.includes('service')) return 'support';
  if (role.includes('sicherheit') || role.includes('security')) return 'security';
  if (role.includes('leitung') || role.includes('management') || role.includes('chef')) return 'management';
  return null;
}

function buildKnowledgeCandidates(topicKeyName) {
  return knowledgeItemsForTopic(topicKeyName).map((item) => ({
    kind: 'knowledge',
    id: item.id,
    topicKey: topicKeyName,
    conceptCluster: item.conceptCluster,
    questionArchetype: item.type,
    difficulty: item.difficulty,
    roleHints: item.roleHints || null,
    item,
  }));
}

function buildProgressByTopic(topicsByKey) {
  const progress = {};
  for (const topic of Object.values(topicsByKey || {})) {
    progress[topic.key] = {
      overall: Number.isFinite(topic.overall) ? topic.overall : 0,
      mastered: !!topic.mastered,
    };
  }
  return progress;
}

function clampDifficulty(d) {
  return DIFFICULTY_ORDER[Math.max(0, Math.min(DIFFICULTY_ORDER.length - 1, DIFFICULTY_ORDER.indexOf(d)))] || 'medium';
}

function easierDifficulty(d) {
  return clampDifficulty(DIFFICULTY_ORDER[DIFFICULTY_ORDER.indexOf(d) - 1] || d);
}

function harderDifficulty(d) {
  return clampDifficulty(DIFFICULTY_ORDER[DIFFICULTY_ORDER.indexOf(d) + 1] || d);
}

function topicIdsFromKey(key) {
  const [categoryId, ...rest] = key.split('/');
  return { categoryId, topicId: rest.join('/') };
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function ensureTopicState(session, key) {
  if (!session.perTopic) session.perTopic = {};
  if (!session.perTopic[key]) {
    session.perTopic[key] = { currentDifficulty: 'medium', consecutiveWrong: 0, consecutiveCorrect: 0 };
  }
  return session.perTopic[key];
}

function isTopicUnlockedForConversations(topic) {
  const progress = getTopicProgress(topic.categoryId, topic.topicId);
  if (progress && progress.status !== 'locked') return true;
  // In course/free-learning mode the player explicitly wants access to all
  // fundamentals learning content, so conversations may also draw from it.
  const mode = readAcademyMode().mode;
  return mode === LEARNING_MODES.COURSE;
}

function availableTopics() {
  return ACADEMY_TOPICS
    .filter((t) => CONVERSATION_TOPICS[topicKey(t.categoryId, t.topicId)])
    .map((t) => {
      const key = topicKey(t.categoryId, t.topicId);
      const full = getFullTopic(t.categoryId, t.topicId);
      return {
        ...t,
        key,
        unlocked: isTopicUnlockedForConversations(t),
        mastered: isTopicMastered(t.categoryId, t.topicId, false),
        overall: topicOverallProgress(full),
      };
    })
    .filter((t) => t.unlocked);
}

function pickWeakestTopic(topics, semanticHistory, employee) {
  const progressByTopic = buildProgressByTopic(Object.fromEntries(topics.map((t) => [t.key, t])));
  const candidates = topics.map((t) => ({
    id: t.key,
    topicKey: t.key,
    conceptCluster: t.key,
    questionArchetype: 'topic',
    difficulty: 'medium',
    roleHints: null,
  }));
  const state = createBalancerState({
    history: semanticHistory || createSemanticHistory(),
    progressByTopic,
    lastResult: null,
    difficultyProfile: 'medium',
    currentRole: mapEmployeeRoleToHint(employee),
    facetMasteryMap: getAllFacetMasteryScores(),
  });
  const selected = selectCandidate(candidates, state, { seed: `topic-${Date.now()}` });
  if (selected) return topics.find((t) => t.key === selected.topicKey) || topics[0];
  // Fallback to old deterministic weakest-topic behaviour if balancer returns nothing.
  const nonMastered = topics.filter((t) => !t.mastered).sort((a, b) => a.overall - b.overall);
  const pool = nonMastered.length ? nonMastered : topics.sort((a, b) => a.overall - b.overall);
  const top = pool.slice(0, Math.min(3, pool.length));
  return top[Math.floor(Math.random() * top.length)];
}

function pickConversationLength() {
  const roll = Math.random();
  if (roll < 0.18) return 1;
  if (roll < 0.53) return 2;
  if (roll < 0.83) return 3;
  if (roll < 0.95) return 4;
  return 5;
}

function pickEmployee() {
  return randomConversationPartner();
}

function pickIntro(topicData, employee) {
  const pool = topicData.introPool || [`${employee.name} möchte kurz etwas zu ${topicData.title} besprechen.`];
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickTransition(topicData, previousTopicKey) {
  if (previousTopicKey === topicData.key) {
    const same = [
      'Okay, dann bleiben wir noch kurz bei dem Thema.',
      'Noch eine Sache dazu.',
      'Das hängt direkt damit zusammen:',
    ];
    return same[Math.floor(Math.random() * same.length)];
  }
  const bridge = [
    'Ach, wo wir gerade dabei sind ...',
    'Das erinnert mich an etwas anderes.',
    'Eine Sache wollte ich dich sowieso noch fragen.',
    'Dann passt das gut zu einer anderen Frage.',
  ];
  return bridge[Math.floor(Math.random() * bridge.length)];
}

function pickEmployeeReaction(employee, correct) {
  if (correct) {
    const pool = [
      'Ah, okay. Dann ergibt das Sinn.',
      'Super, genau das meinte ich.',
      'Alles klar, verstanden.',
      'Gut, das hilft mir weiter.',
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const pool = [
    'Hm ... ich dachte, das wäre anders.',
    'Bin ich da falsch informiert?',
    'Irgendwie verwirrt mich das noch.',
    'Das hatte ich anders verstanden.',
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickSamStageDirection() {
  const pool = [
    'Sam schaut aus seinem Büro in den Flur.',
    'Die Bürotür geht auf. Sam hat offenbar mitgehört.',
    'Sam lehnt sich aus seinem Büro.',
    'Sam mischt sich ein.',
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeInstanceBase(topicKey, archetype) {
  return {
    instanceId: `${topicKey}::${archetype.id}::${Date.now()}::${Math.random().toString(36).slice(2, 7)}`,
    archetypeId: archetype.id,
    concept: archetype.concept,
    type: archetype.type,
    difficulty: archetype.difficulty,
  };
}

function generateMcInstance(topicKey, archetype) {
  const indexed = archetype.options.map((label, i) => ({ id: `opt-${i}`, label, originalIndex: i }));
  const shuffled = shuffleArray(indexed);
  const correctOptionId = shuffled.find((o) => o.originalIndex === archetype.correct).id;
  return {
    ...makeInstanceBase(topicKey, archetype),
    text: archetype.text,
    ttsText: archetype.text,
    options: shuffled.map(({ id, label }) => ({ id, label })),
    correctOptionId,
    explanation: archetype.explanation,
  };
}

function generateOsiOrderingInstance(topicKey, archetype) {
  const direction = Math.random() < 0.5 ? 'top-down' : 'bottom-up';
  const items = OSI_LAYERS.map((l) => ({ id: `osi-layer-${l.num}`, label: l.de }));
  const correctOrderIds = direction === 'top-down'
    ? items.slice().reverse().map((i) => i.id)
    : items.map((i) => i.id);
  const text = direction === 'top-down'
    ? 'Wie lautet die Reihenfolge der OSI-Schichten von oben (Schicht 7) nach unten (Schicht 1)?'
    : 'Wie lautet die Reihenfolge der OSI-Schichten von unten (Schicht 1) nach oben (Schicht 7)?';
  return {
    ...makeInstanceBase(topicKey, archetype),
    text,
    ttsText: text,
    items: shuffleArray(items),
    correctOrderIds,
    explanation: 'Die OSI-Reihenfolge von oben nach unten ist: Anwendung, Darstellung, Sitzung, Transport, Vermittlung, Sicherung, Bitübertragung.',
  };
}

function generateOsiMatchingInstance(topicKey, archetype) {
  const leftItems = OSI_LAYERS.map((l) => ({ id: `osi-left-${l.num}`, label: `${l.num}. ${l.de}` }));
  const rightItems = OSI_LAYERS.map((l) => ({ id: `osi-right-${l.num}`, label: l.examples.split(',')[0].trim() }));
  const correctPairs = OSI_LAYERS.map((l) => ({ left: `osi-left-${l.num}`, right: `osi-right-${l.num}` }));
  return {
    ...makeInstanceBase(topicKey, archetype),
    text: 'Ordne jeder OSI-Schicht ein typisches Merkmal zu.',
    ttsText: 'Ordne jeder OSI-Schicht ein typisches Merkmal zu.',
    leftItems,
    rightItems: shuffleArray(rightItems),
    correctPairs,
    explanation: 'Jede OSI-Schicht hat charakteristische Aufgaben: Bitübertragung = physikalisches Signal, Sicherung = MAC/Frames, Vermittlung = IP/Routing, Transport = Ports/TCP/UDP, Sitzung = Dialogkontrolle, Darstellung = Format/Verschlüsselung, Anwendung = Dienste wie HTTP/DNS.',
  };
}

export function buildInstance(topicKey, archetype) {
  if (archetype.type === 'mc') return generateMcInstance(topicKey, archetype);
  if (archetype.id === 'osi-ordering') return generateOsiOrderingInstance(topicKey, archetype);
  if (archetype.id === 'osi-matching') return generateOsiMatchingInstance(topicKey, archetype);
  if (archetype.generate) return archetype.generate(topicKey);
  return null;
}

export function getArchetypes(topicData) {
  if (topicData._archetypes) return topicData._archetypes;
  const fromQuestions = (topicData.questions || []).map((q) => ({
    id: q.id,
    type: 'mc',
    concept: q.concept || q.id,
    difficulty: q.difficulty,
    text: q.text,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
  }));
  const extra = (topicData.archetypes || []).map((a) => ({ ...a }));
  topicData._archetypes = [...fromQuestions, ...extra];
  return topicData._archetypes;
}

function historyKey(topicKey, archetypeId) {
  return `${topicKey}/${archetypeId}`;
}

function generateSeed(conversation, questionIndex) {
  return `${conversation?.conversationId || 'conv'}-${questionIndex ?? 0}`;
}

function normalizeConversationDifficulty(d) {
  if (d === 'easy' || d === 'medium' || d === 'hard') return d;
  return 'medium';
}

function generateQuestionFromCandidate(candidate, seed, contextType, difficulty, history = null) {
  if (candidate.kind === 'knowledge') {
    const item = candidate.item;
    const question = generateQuestion(item.id, null, {
      seed,
      contextType,
      difficulty,
      history,
    });
    if (!question.concept) {
      question.concept = question.learningObjective || question.conceptCluster || 'general';
    }
    return question;
  }
  // Legacy fallback.
  return buildInstance(candidate.topicKey, candidate.archetype);
}

function splitIntoCoreAndContext(text) {
  if (!text) return { core: '', context: '' };
  const m = text.match(/^([\s\S]*?)(?:\s+)?([^?]*\?)\s*$/);
  if (m) {
    const core = m[2].trim();
    const context = m[1].trim();
    return { core, context };
  }
  return { core: text.trim(), context: '' };
}

function pickQuestionForTopic(key, topicState, session, history, options = {}) {
  const { conversation = null, questionIndex = 0, employee = null, topicsByKey = null } = options;

  // If the topic is covered by the Knowledge Layer, use the semantic balancer
  // to pick a concrete knowledge item; otherwise fall back to the legacy
  // archetype pool.
  if (hasKnowledgeCoverage(key)) {
    const candidates = buildKnowledgeCandidates(key);
    if (!candidates.length) return null;

    const semanticHistory = conversation?.semanticHistory || createSemanticHistory();
    const state = createBalancerState({
      history: semanticHistory,
      progressByTopic: buildProgressByTopic(topicsByKey),
      lastResult: conversation?.lastResult || null,
      difficultyProfile: normalizeConversationDifficulty(topicState?.currentDifficulty),
      currentRole: mapEmployeeRoleToHint(employee),
      facetMasteryMap: getAllFacetMasteryScores(),
    });

    const selected = selectCandidate(candidates, state, { seed: generateSeed(conversation, questionIndex) });
    if (!selected) return null;
    const difficulty = normalizeConversationDifficulty(topicState?.currentDifficulty);
    const baseSeed = generateSeed(conversation, questionIndex);

    let question = generateQuestionFromCandidate(selected, baseSeed, 'coworker_question', difficulty, semanticHistory);
    if (!question || validateSolvability(question).length > 0) {
      const tried = new Set([selected.item?.id || selected.id]);
      for (const fallback of candidates.filter((c) => !tried.has(c.item?.id || c.id))) {
        const seed = `${baseSeed}-${fallback.item?.id || fallback.id}`;
        const q = generateQuestionFromCandidate(fallback, seed, 'coworker_question', difficulty, semanticHistory);
        if (q && validateSolvability(q).length === 0) {
          question = q;
          break;
        }
        tried.add(fallback.item?.id || fallback.id);
      }
    }
    if (!question || validateSolvability(question).length > 0) return null;
    if (question) {
      const item = getKnowledgeItem(question.knowledgeItemId);
      const loreRng = createRng(`${baseSeed}|lore`);
      const lead = getLoreLeadIn(item, loreRng);
      const displayText = question.conversationText || question.text;
      const { core, context } = splitIntoCoreAndContext(displayText);
      question.coreQuestion = core;
      question.context = context;
      if (lead) {
        question.loreLeadIn = lead;
        question.conversationText = `${lead}${context ? ` ${context}` : ''} ${core}`.trim();
        question.ttsText = question.conversationText;
      } else if (context) {
        question.conversationText = `${context} ${core}`.trim();
        question.ttsText = question.conversationText;
      } else {
        question.conversationText = core;
        question.ttsText = question.conversationText;
      }
      question.text = core;
    }
    return question;
  }

  const topicData = CONVERSATION_TOPICS[key];
  const archetypes = getArchetypes(topicData);
  if (!archetypes.length) return null;

  const now = Date.now();
  const askedArchetypeIds = new Set((session.questions || []).map((q) => q.archetypeId));

  const recentConcepts = new Set();
  for (const q of (session.questions || [])) {
    if (q.concept) recentConcepts.add(q.concept);
  }
  for (const h of Object.values(history)) {
    if (now - h.askedAt < CONCEPT_COOLDOWN_MS && h.concept) {
      recentConcepts.add(h.concept);
    }
  }

  const usable = archetypes.filter((a) => {
    if (askedArchetypeIds.has(a.id)) return false;
    const hk = historyKey(key, a.id);
    const h = history[hk];
    if (!h) return true;
    const cooldown = h.correct ? CORRECT_COOLDOWN_MS : INCORRECT_COOLDOWN_MS;
    return now - h.askedAt >= cooldown;
  });

  // If every archetype is on cooldown, ignore the time gate but still avoid
  // questions already used in the current session.
  const pool = usable.length ? usable : archetypes.filter((a) => !askedArchetypeIds.has(a.id));
  if (!pool.length) return null;

  // Prefer concepts that have not appeared recently.
  const freshConceptPool = pool.filter((a) => !recentConcepts.has(a.concept));
  const conceptPool = freshConceptPool.length ? freshConceptPool : pool;

  // Prefer the current adaptive difficulty.
  const byDifficulty = conceptPool.filter((a) => a.difficulty === topicState.currentDifficulty);
  const chosenPool = byDifficulty.length ? byDifficulty : conceptPool;

  const chosen = chosenPool[Math.floor(Math.random() * chosenPool.length)];
  return buildInstance(key, chosen);
}

function hasUsableQuestion(key, session) {
  if (hasKnowledgeCoverage(key)) return true;
  const topicData = CONVERSATION_TOPICS[key];
  const archetypes = getArchetypes(topicData);
  const askedArchetypeIds = new Set((session.questions || []).map((q) => q.archetypeId));
  return archetypes.some((a) => !askedArchetypeIds.has(a.id));
}

function selectNextTopicKey(session, lastResult, topicsByKey) {
  const lastKey = lastResult?.topicKey;
  const lastTopic = lastKey ? CONVERSATION_TOPICS[lastKey] : null;

  if (!lastResult || !lastResult.correct) {
    // After an error stay on the same topic if possible.
    if (lastKey && hasUsableQuestion(lastKey, session)) return lastKey;
  }

  // Try related topic.
  if (lastTopic && lastTopic.relatedTopics && lastTopic.relatedTopics.length) {
    const related = lastTopic.relatedTopics
      .map((k) => topicsByKey[k])
      .filter(Boolean)
      .filter((t) => t.unlocked)
      .filter((t) => hasUsableQuestion(t.key, session));
    if (related.length) return related[Math.floor(Math.random() * related.length)].key;
  }

  // Fall back to any topic that still has a usable question.
  const usable = Object.values(topicsByKey)
    .filter((t) => t.unlocked)
    .filter((t) => hasUsableQuestion(t.key, session));
  if (usable.length) return usable[Math.floor(Math.random() * usable.length)].key;

  return null;
}

export function startEmployeeConversation() {
  const topics = availableTopics();
  if (!topics.length) return null;

  const topicsByKey = Object.fromEntries(topics.map((t) => [t.key, t]));
  const employee = pickEmployee();
  const semanticHistory = createSemanticHistory({ longTerm: readLongTermHistory().longTerm });
  const firstTopic = pickWeakestTopic(topics, semanticHistory, employee);
  const session = readSession();
  const topicState = ensureTopicState(session, firstTopic.key);
  const history = readHistory();
  const conversationSeed = {
    conversationId: `conv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    employee,
    semanticHistory,
    lastResult: null,
  };
  const question = pickQuestionForTopic(firstTopic.key, topicState, { questions: [] }, history, {
    conversation: conversationSeed,
    questionIndex: 0,
    employee,
    topicsByKey,
  });
  if (!question) return null;

  const conversation = {
    conversationId: conversationSeed.conversationId,
    employeeId: employee.id,
    employee,
    startedAt: Date.now(),
    plannedLength: pickConversationLength(),
    questionIndex: 0,
    questions: [],
    correctCount: 0,
    incorrectCount: 0,
    samInterventions: 0,
    completed: false,
    currentTopicKey: firstTopic.key,
    topicData: CONVERSATION_TOPICS[firstTopic.key],
    question,
    intro: pickIntro(CONVERSATION_TOPICS[firstTopic.key], employee),
    transition: null,
    topicsByKey,
    semanticHistory,
    lastResult: null,
  };

  writeSession(session);
  return conversation;
}

function difficultyToNumber(d) {
  if (d === 'easy') return 1;
  if (d === 'hard') return 3;
  return 2;
}

/**
 * Build a Sam explanation that addresses the actual wrong answer when possible.
 * Falls back to the question's base explanation if no answer-aware explanation
 * is available.
 */
function buildAnswerAwareExplanation(question, answer) {
  if (question.type === 'mc' && answer && question.wrongOptionExplanations) {
    const specific = question.wrongOptionExplanations[answer];
    if (specific) return specific;
  }
  if (question.type === 'ordering' && Array.isArray(answer) && question.correctOrderLabels) {
    const userOrderLabel = answer.map((id) => question.itemMap?.[id] || id).join(' → ');
    const correctOrderLabel = question.correctOrderLabels.join(' → ');
    let mismatchIndex = -1;
    for (let i = 0; i < answer.length; i += 1) {
      if (answer[i] !== question.correctOrderIds[i]) {
        mismatchIndex = i;
        break;
      }
    }
    const mismatchText = mismatchIndex >= 0
      ? `Erster Fehler bei Position ${mismatchIndex + 1}: ${question.itemMap?.[answer[mismatchIndex]] || answer[mismatchIndex]} steht nicht an der richtigen Stelle.`
      : (answer.length !== question.correctOrderIds.length
        ? `Deine Reihenfolge ist unvollständig (${answer.length} von ${question.correctOrderIds.length} Elementen).`
        : '');
    return `Deine Reihenfolge: ${userOrderLabel}. Korrekt wäre: ${correctOrderLabel}. ${mismatchText}${question.explanation ? ' ' + question.explanation : ''}`;
  }
  if (question.type === 'matching' && answer && typeof answer === 'object' && question.correctPairs) {
    const correctLookup = Object.fromEntries(
      question.correctPairs.map((p) => [p.leftId ?? p.left, p.rightId ?? p.right]),
    );
    const correctLabels = question.correctPairLabels
      ? question.correctPairLabels.map((p) => `${p.left} → ${p.right}`).join(', ')
      : '';
    const userPairLines = [];
    const wrongDetails = [];
    const correctLefts = [];

    for (const left of question.leftItems || []) {
      const leftId = left.id;
      const leftLabel = question.leftMap?.[leftId] || leftId;
      const userRightId = answer[leftId];
      const userRightLabel = userRightId ? (question.rightMap?.[userRightId] || userRightId) : null;
      const expectedRightId = correctLookup[leftId];
      const expectedRightLabel = expectedRightId ? (question.rightMap?.[expectedRightId] || expectedRightId) : null;

      userPairLines.push(`${leftLabel} → ${userRightLabel || 'nicht zugeordnet'}`);

      if (userRightId === expectedRightId) {
        correctLefts.push(leftLabel);
      } else {
        wrongDetails.push({
          leftLabel,
          userLabel: userRightLabel,
          expectedLabel: expectedRightLabel,
        });
      }
    }

    const userPairsText = userPairLines.join(', ');
    let detailText = '';
    if (wrongDetails.length > 0) {
      const lines = wrongDetails.map((w) => {
        const expected = w.expectedLabel ? `Richtig wäre „${w.expectedLabel}“` : 'Keine passende Bedeutung hinterlegt';
        return `Bei ${w.leftLabel} hast du „${w.userLabel || 'nichts'}“ gewählt; ${expected}.`;
      });
      detailText = ` ${lines.join(' ')}`;
    }
    const praiseText = correctLefts.length > 0
      ? ` Richtig war${correctLefts.length > 1 ? 'en' : ''}: ${correctLefts.join(', ')}.`
      : '';
    return `Deine Zuordnung: ${userPairsText}. Korrekt wäre: ${correctLabels}.${detailText}${praiseText}${question.explanation ? ' ' + question.explanation : ''}`;
  }
  return question.explanation;
}

function evaluateAnswer(question, answer) {
  if (!answer) return false;
  if (question.type === 'mc') return answer === question.correctOptionId;
  if (question.type === 'ordering') {
    if (!Array.isArray(answer) || answer.length !== question.correctOrderIds.length) return false;
    return answer.every((id, i) => id === question.correctOrderIds[i]);
  }
  if (question.type === 'matching') {
    const matches = answer || {};
    return question.correctPairs.every((p) => {
      const leftKey = p.leftId ?? p.left;
      const rightKey = p.rightId ?? p.right;
      return matches[leftKey] === rightKey;
    });
  }
  if (question.type === 'input') {
    const normalized = String(answer).trim().toLowerCase();
    return question.answers.some((a) => String(a).trim().toLowerCase() === normalized);
  }
  return false;
}

export function evaluateEmployeeAnswer(conversation, answer) {
  const { question, currentTopicKey, employee } = conversation;
  const correct = evaluateAnswer(question, answer);
  const session = readSession();
  const topicState = ensureTopicState(session, currentTopicKey);
  const history = readHistory();

  let samStageDirection = '';
  let samExplanation = '';
  let scoreAwarded = false;

  if (correct) {
    topicState.consecutiveCorrect += 1;
    topicState.consecutiveWrong = 0;
    topicState.currentDifficulty = harderDifficulty(topicState.currentDifficulty);
    const { categoryId, topicId } = topicIdsFromKey(currentTopicKey);
    applyConversationPractice(categoryId, topicId);
    scoreAwarded = true;

    recordConversationResult(currentTopicKey, {
      correct: true,
      concept: question.concept,
      samIntervention: false,
      usedHint: false,
    });

    recordSkillEvent('fundamentals', topicId, question.concept || 'general', {
      correct: true,
      source: SKILL_SOURCE.CONVERSATION,
      dimension: SKILL_DIMENSION.KNOWLEDGE,
      difficulty: difficultyToNumber(question.difficulty),
      usedHint: false,
      responseTimeMs: null,
    });
  } else {
    topicState.consecutiveWrong += 1;
    topicState.consecutiveCorrect = 0;
    topicState.currentDifficulty = easierDifficulty(topicState.currentDifficulty);
    // Sam intervenes on every wrong answer so the player immediately gets
    // the explanation from the mentor.
    samStageDirection = pickSamStageDirection();
    samExplanation = buildAnswerAwareExplanation(question, answer);

    recordConversationResult(currentTopicKey, {
      correct: false,
      concept: question.concept,
      samIntervention: true,
    });

    const { categoryId, topicId } = topicIdsFromKey(currentTopicKey);
    recordSkillEvent(categoryId, topicId, question.concept || 'general', {
      correct: false,
      source: SKILL_SOURCE.CONVERSATION,
      dimension: SKILL_DIMENSION.KNOWLEDGE,
      difficulty: difficultyToNumber(question.difficulty),
      usedHint: false,
      responseTimeMs: null,
    });
  }

  history[historyKey(currentTopicKey, question.archetypeId)] = {
    askedAt: Date.now(),
    correct,
    difficulty: question.difficulty,
    concept: question.concept,
    topicKey: currentTopicKey,
    conversationId: conversation.conversationId,
  };
  writeHistory(history);

  // Phase 5: record in semantic history for cross-topic balancing.
  const questionWithTopic = { ...question, topicKey: currentTopicKey };
  conversation.semanticHistory = pushHistoryRecord(
    conversation.semanticHistory || createSemanticHistory(),
    questionWithTopic,
    { correct },
  );

  // Phase 5.1: update per-facet mastery for adaptive cooldown.
  if (question.knowledgeFacet) {
    if (correct) recordFacetCorrect(question.knowledgeFacet);
    else recordFacetWrong(question.knowledgeFacet);
  }

  conversation.lastResult = {
    knowledgeItemId: question.knowledgeItemId || null,
    topicKey: currentTopicKey,
    conceptCluster: question.conceptCluster || null,
    learningObjective: question.learningObjective || null,
    knowledgeFacet: question.knowledgeFacet || null,
    questionArchetype: question.questionArchetype || question.type,
    templateId: question.context?.templateId || null,
    correct,
  };
  writeLongTermHistory(conversation.semanticHistory);
  writeSession(session);

  conversation.questions.push({
    topicKey: currentTopicKey,
    instanceId: question.instanceId,
    archetypeId: question.archetypeId,
    concept: question.concept,
    correct,
    difficulty: question.difficulty,
    touchedAt: Date.now(),
  });
  if (correct) conversation.correctCount += 1;
  else conversation.incorrectCount += 1;
  if (!correct) conversation.samInterventions += 1;

  return {
    correct,
    explanation: question.explanation,
    employeeReaction: pickEmployeeReaction(employee, correct),
    samStageDirection,
    samExplanation,
    scoreAwarded,
  };
}

export function advanceConversation(conversation) {
  const session = readSession();
  const history = readHistory();
  const nextIndex = conversation.questionIndex + 1;

  if (nextIndex >= conversation.plannedLength) {
    conversation.questionIndex = nextIndex;
    conversation.completed = true;
    return { state: 'summary', conversation };
  }

  const lastResult = conversation.questions[conversation.questions.length - 1];
  const nextTopicKey = selectNextTopicKey(conversation, lastResult, conversation.topicsByKey);
  if (!nextTopicKey) {
    conversation.questionIndex = nextIndex;
    conversation.completed = true;
    return { state: 'summary', conversation };
  }

  const topicState = ensureTopicState(session, nextTopicKey);
  const nextQuestion = pickQuestionForTopic(nextTopicKey, topicState, conversation, history, {
    conversation,
    questionIndex: nextIndex,
    employee: conversation.employee,
    topicsByKey: conversation.topicsByKey,
  });
  if (!nextQuestion) {
    conversation.questionIndex = nextIndex;
    conversation.completed = true;
    return { state: 'summary', conversation };
  }

  conversation.questionIndex = nextIndex;
  conversation.currentTopicKey = nextTopicKey;
  conversation.topicData = CONVERSATION_TOPICS[nextTopicKey];
  conversation.question = nextQuestion;
  conversation.transition = pickTransition(conversation.topicData, lastResult?.topicKey);
  writeSession(session);
  return { state: 'question', conversation };
}

export function getConversationSummary(conversation) {
  const touched = {};
  for (const entry of conversation.questions) {
    if (!touched[entry.topicKey]) touched[entry.topicKey] = { topicKey: entry.topicKey, ...topicIdsFromKey(entry.topicKey), title: CONVERSATION_TOPICS[entry.topicKey].title, correct: 0, incorrect: 0 };
    if (entry.correct) touched[entry.topicKey].correct += 1;
    else touched[entry.topicKey].incorrect += 1;
  }
  return {
    total: conversation.questions.length,
    correctCount: conversation.correctCount,
    incorrectCount: conversation.incorrectCount,
    samInterventions: conversation.samInterventions,
    touchedTopics: Object.values(touched),
    weakTopics: Object.values(touched).filter((t) => t.incorrect > 0 || (t.correct === 0 && t.incorrect > 0)),
  };
}

export function resetEmployeeConversations() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(HISTORY_KEY);
  resetConversationMastery();
}

// =============================================================================
// Conversation topic content
// =============================================================================

export const CONVERSATION_TOPICS = {
  [topicKey('fundamentals', 'grundbegriffe')]: {
    title: 'Grundbegriffe',
    relatedTopics: [topicKey('fundamentals', 'topologien'), topicKey('fundamentals', 'ipv4')],
    introPool: [
      'Wir bauen gerade das Schulungswiki um. Kannst du mir kurz die Basics bestätigen?',
      'Mein Praktikant hat eben nach den Grundbegriffen gefragt. Wie würdest du es kurz sagen?',
    ],
    samHelp: 'Netzwerk = verbundene eigenständige Computer zum Informationsaustausch. Dienst = bereitgestellte Funktion. Protokoll = gemeinsame Kommunikationsregeln. Leitungs-/Paketvermittlung und verbindungsorientiert/verbindungslos sind zwei getrennte Kommunikationsachsen.',
    questions: [
      { id: 'gb-1', difficulty: 'easy', text: 'Braucht ein Netzwerk zwingend einen Internetzugang?', options: ['Ja, sonst ist es kein Netzwerk', 'Nein, auch ein lokales Netz ohne Internet verbindet Computer zum Austausch', 'Nur wenn ein Server vorhanden ist'], correct: 1, explanation: 'Ein Netzwerk setzt keinen Internetzugang voraus. Entscheidend sind verbundene eigenständige Computer und der mögliche Informationsaustausch.' },
      { id: 'gb-2', difficulty: 'medium', text: 'Ein Kollege nennt HTTP einen angebotenen Web-Dienst. Wie ordnest du das präziser ein?', options: ['HTTP ist das Protokoll; Web bezeichnet die angebotene Funktion', 'HTTP und Web sind immer derselbe Begriff', 'HTTP ist eine Vermittlungsstelle'], correct: 0, explanation: 'Dienst beschreibt die angebotene Funktion, Protokoll die Kommunikationsregeln. HTTP kann für den Web-Dienst verwendet werden.' },
      { id: 'gb-3', difficulty: 'medium', text: 'Warum brauchen Sender und Empfänger ein gemeinsames Protokoll?', options: ['Damit sie Regeln zu Nachrichten und Fehlerprüfung gleich verstehen', 'Damit jedes Paket zwingend einen anderen Weg nimmt', 'Damit keine Nutzdaten mehr erforderlich sind'], correct: 0, explanation: 'Protokolle stimmen Regeln etwa zu Reihenfolge, Inhalt, Darstellung und Fehlerüberprüfung ab.' },
      { id: 'gb-4', difficulty: 'hard', text: 'Unser Netzwerk arbeitet paketvermittelt. Bedeutet das automatisch, dass UDP verwendet wird?', options: ['Ja, Pakete sind immer verbindungslos', 'Nein, Vermittlungsart und Verbindungsverhalten sind getrennte Eigenschaften', 'Ja, TCP ist nur leitungsvermittelt möglich'], correct: 1, explanation: 'Paketvermittelte Kommunikation kann verbindungsorientiert oder verbindungslos stattfinden. Paketvermittlung legt nicht automatisch TCP oder UDP fest.' },
      { id: 'gb-5', difficulty: 'easy', text: 'Am Patienten erfassen körpernahe Sensoren Puls und Sauerstoffsättigung. BAN oder PAN?', options: ['BAN, weil die Sensorik am Körper einer Person arbeitet', 'PAN, weil jedes persönliche Gerät automatisch PAN ist', 'LAN, weil mehrere Sensoren beteiligt sind'], correct: 0, explanation: 'BAN steht für Body Area Network und bezeichnet körpernahe Geräte oder Sensorik. PAN verbindet persönliche Geräte in unmittelbarer Umgebung.' },
      { id: 'gb-6', difficulty: 'medium', text: 'Warum würdest du unser einzelnes NEXUS-Bürogebäude nicht als WAN bezeichnen?', options: ['Es ist ein räumlich begrenztes LAN; ein WAN verbindet weit entfernte Netze oder Standorte', 'Ein WAN darf keine Computer enthalten', 'Ein Gebäude ist immer ein PAN'], correct: 0, explanation: 'LAN beschreibt den lokalen Gebäude- oder Geländekontext. WAN verbindet räumlich weit entfernte Netze beziehungsweise Standorte.' },
      { id: 'gb-7', difficulty: 'medium', text: 'Unser Mitarbeiterportal läuft im Browser. Ist es deshalb automatisch Teil des öffentlichen Internets?', options: ['Nein, ein internes Organisationsportal kann ein Intranet sein', 'Ja, jede Browseranwendung ist öffentliches Internet', 'Ja, sofern es HTML verwendet'], correct: 0, explanation: 'Webtechnik allein entscheidet nicht über den Geltungsbereich. Ein nur intern vorgesehenes Informationsnetz ist ein Intranet.' },
      { id: 'gb-8', difficulty: 'hard', text: 'Ist jedes Global Area Network automatisch das Internet?', options: ['Nein, das Internet kann als GAN gelten, aber GAN bezeichnet allgemein einen globalen Netzverbund', 'Ja, GAN und Internet sind vollständig identische Begriffe', 'Nein, weil das Internet nur ein LAN ist'], correct: 0, explanation: 'GAN beschreibt eine globale Verbindung mehrerer WANs. Das Internet ist ein Beispiel, aber nicht jedes GAN ist automatisch das öffentliche Internet.' },
    ],
  },
  [topicKey('fundamentals', 'topologien')]: {
    title: 'Topologien',
    relatedTopics: [topicKey('fundamentals', 'grundbegriffe'), topicKey('fundamentals', 'osi-model')],
    introPool: [
      'Ich muss das Netzwerk-Layout für den neuen Standort skizzieren. Welche Topologie passt wann?',
      'Bei dem neuen Verkabelungsplan streiten wir uns über Vor- und Nachteile der Topologien.',
    ],
    samHelp: 'Topologie beschreibt die Struktur eines Netzwerks. Physisch meint reale Verbindungen, logisch den tatsächlichen Datenweg. Vergleiche Strukturen anhand von Aufwand, Skalierbarkeit, Kapazität und Ausfallsicherheit statt über eine starre Bestenliste.',
    questions: [
      { id: 'topo-1', difficulty: 'easy', text: 'Was passiert in einer Sterntopologie typischerweise, wenn nur das Kabel eines einzelnen PCs beschädigt wird?', options: ['Zunächst verliert nur dieser PC die Verbindung', 'Der gesamte Stern fällt zwingend aus', 'Die Topologie wird zum Ring'], correct: 0, explanation: 'Jeder Teilnehmer besitzt eine eigene Leitung zum zentralen Verteiler. Der einzelne Leitungsfehler bleibt deshalb zunächst auf diesen Teilnehmer begrenzt.' },
      { id: 'topo-2', difficulty: 'medium', text: 'Physisch hängen alle PCs an Verteilern. Ist damit auch ihr tatsächlicher logischer Datenweg vollständig beschrieben?', options: ['Nein, physischer Aufbau und logischer Datenfluss sind getrennte Sichten', 'Ja, beide Begriffe bedeuten immer dasselbe', 'Nur bei einem Bus'], correct: 0, explanation: 'Die physische Topologie zeigt reale Verbindungen; die logische Topologie zeigt den tatsächlich genutzten Daten- oder Signalweg.' },
      { id: 'topo-3', difficulty: 'medium', text: 'Warum ist eine Vollvermaschung nicht automatisch für jedes NEXUS-Netz die beste Wahl?', options: ['Mehr Redundanz steht deutlich mehr Verbindungen und Aufwand gegenüber', 'Sie besitzt keine alternativen Wege', 'Sie lässt sich nur mit zwei Geräten aufbauen'], correct: 0, explanation: 'Vollvermaschung bietet viele direkte Wege, aber Aufwand und Komplexität steigen mit jedem Teilnehmer stark.' },
      { id: 'topo-4', difficulty: 'hard', text: 'Ein oberer Verteiler bündelt mehrere Unterverteilungen über Uplinks. Welche Struktur wird beschrieben?', options: ['Baum', 'Bus', 'Einfacher Ring', 'Vollvermaschung'], correct: 0, explanation: 'Eine Baumtopologie verbindet Sternstrukturen hierarchisch über Wurzel, Verteiler, Unterverteilungen und Uplinks.' },
    ],
  },
  [topicKey('fundamentals', 'osi-model')]: {
    title: 'OSI-Modell',
    relatedTopics: [topicKey('fundamentals', 'tcp-ip-model'), topicKey('fundamentals', 'tcp-udp')],
    introPool: [
      'Wir debuggen gerade ein Verbindungsproblem. Auf welcher OSI-Schicht soll ich anfangen?',
      'Kannst du mir die OSI-Schichten nochmal in Kurzform durchgehen?',
    ],
    samHelp: 'Das OSI-Modell hat 7 Schichten: 1 Bitübertragung, 2 Sicherung, 3 Vermittlung, 4 Transport, 5 Sitzung, 6 Darstellung, 7 Anwendung. Fehler findet man, indem man von unten (Kabel) nach oben (Anwendung) arbeitet.',
    questions: [
      { id: 'osi-1', difficulty: 'easy', text: 'Auf welcher OSI-Schicht arbeitet ein Switch typischerweise?', options: ['Schicht 1', 'Schicht 2', 'Schicht 3', 'Schicht 4'], correct: 1, explanation: 'Switches arbeiten auf der Sicherungsschicht (Schicht 2) mit MAC-Adressen.' },
      { id: 'osi-2', difficulty: 'easy', text: 'Welche Schicht ist für logische IP-Adressierung zuständig?', options: ['Sicherung', 'Vermittlung', 'Transport', 'Anwendung'], correct: 1, explanation: 'Schicht 3 (Vermittlung/Vermittlungsschicht) kümmert sich um Routing und IP-Adressierung.' },
      { id: 'osi-3', difficulty: 'medium', text: 'Wie heißt die oberste OSI-Schicht?', options: ['Darstellung', 'Sitzung', 'Anwendung', 'Netzwerk'], correct: 2, explanation: 'Schicht 7 ist die Anwendungsschicht, mit der der Nutzer interagiert (HTTP, FTP, SMTP usw.).' },
      { id: 'osi-4', difficulty: 'hard', text: 'Ein Kabelbruch betrifft primär …', options: ['Schicht 1', 'Schicht 2', 'Schicht 3', 'Schicht 7'], correct: 0, explanation: 'Schicht 1 (Bitübertragung) beschreibt physische Signale, Kabel und Stecker. Ein Kabelbruch ist ein Schicht-1-Problem.' },
      { id: 'osi-5', difficulty: 'medium', text: 'Warum braucht ein NEXUS-PC für lokale Ethernet-Kommunikation sowohl IP- als auch MAC-Adresse?', options: ['IP beschreibt das logische Ziel, MAC adressiert den lokalen Frame', 'Beide erfüllen exakt dieselbe Aufgabe', 'Die MAC-Adresse ersetzt den Port'], correct: 0, explanation: 'Layer 3 nutzt logische IP-Adressierung; Layer 2 benötigt die lokale MAC-Adresse für den Ethernet-Frame.' },
      { id: 'osi-6', difficulty: 'hard', text: 'Der Switch kennt die Ziel-MAC eines Frames noch nicht. Was tut er?', options: ['Er floodet den Frame außer am Eingangsport', 'Er berechnet eine IP-Route', 'Er verwirft grundsätzlich alle unbekannten Ziele'], correct: 0, explanation: 'Bei unbekannter Ziel-MAC verteilt ein Layer-2-Switch den Frame zunächst. Aus Quell-MAC-Adressen lernt er seine Tabelle.' },
      { id: 'osi-7', difficulty: 'hard', text: 'Warum wird ein IP-Paket zusätzlich in einen Ethernet-Frame verpackt?', options: ['Der lokale Link benötigt Layer-2-Informationen wie MAC-Adressen', 'Damit der Browser eine IP-Adresse erhält', 'Damit Layer 1 eine Routingtabelle aufbaut'], correct: 0, explanation: 'Kapselung ergänzt pro Schicht die Informationen, die für deren Aufgabe benötigt werden.' },
      { id: 'osi-8', difficulty: 'medium', text: 'Der Host ist erreichbar, aber der gewünschte Dienst reagiert am falschen Port nicht. Welche Ebene prüfst du?', options: ['Layer 4 und den Anwendungskontext', 'Nur Layer 1', 'Nur Layer 2'], correct: 0, explanation: 'Ports ordnen die Kommunikation auf Layer 4 einem Dienst beziehungsweise einer Anwendung zu.' },
    ],
    archetypes: [
      {
        id: 'osi-ordering',
        type: 'ordering',
        concept: 'osi.layer_order',
        difficulty: 'medium',
      },
      {
        id: 'osi-matching',
        type: 'matching',
        concept: 'osi.layer_functions',
        difficulty: 'medium',
      },
    ],
  },
  [topicKey('fundamentals', 'tcp-ip-model')]: {
    title: 'TCP/IP-Modell',
    relatedTopics: [topicKey('fundamentals', 'osi-model'), topicKey('fundamentals', 'tcp-udp')],
    introPool: [
      'Das TCP/IP-Modell verwirrt mich immer wieder. Kannst du mir den Unterschied zum OSI-Modell erklären?',
      'Auf welcher TCP/IP-Schicht läuft eigentlich HTTP?',
    ],
    samHelp: 'Das TCP/IP-Modell hat 4 Schichten: Netzzugang, Internet, Transport, Anwendung. Es ist praxisnäher als OSI. HTTP, FTP, DNS etc. laufen auf der Anwendungsschicht, TCP/UDP auf Transport, IP auf Internet.',
    questions: [
      { id: 'tcpip-1', difficulty: 'easy', text: 'Wie viele Schichten hat das TCP/IP-Modell?', options: ['4', '5', '6', '7'], correct: 0, explanation: 'TCP/IP besteht aus vier Schichten: Netzzugang, Internet, Transport und Anwendung.' },
      { id: 'tcpip-2', difficulty: 'medium', text: 'Welche Schicht des TCP/IP-Modells entspricht ungefähr der OSI-Vermittlungsschicht (Layer 3)?', options: ['Netzzugang', 'Internet', 'Transport', 'Anwendung'], correct: 1, explanation: 'Die Internet-Schicht des TCP/IP-Modells entspricht ungefähr der OSI-Vermittlungsschicht (Schicht 3) und kümmert sich um IP/Routing.' },
      { id: 'tcpip-3', difficulty: 'medium', text: 'Auf welcher TCP/IP-Schicht arbeitet HTTP?', options: ['Internet', 'Transport', 'Anwendung', 'Netzzugang'], correct: 2, explanation: 'HTTP ist ein Anwendungsprotokoll und liegt daher auf der obersten TCP/IP-Schicht (Anwendung).' },
      { id: 'tcpip-4', difficulty: 'hard', text: 'Welches Protokoll ist verbindungslos und eher schnell?', options: ['TCP', 'UDP', 'HTTP', 'FTP'], correct: 1, explanation: 'UDP (User Datagram Protocol) ist verbindungslos und hat weniger Overhead als TCP, dafür aber keine Garantie für Reihenfolge oder Zustellung.' },
    ],
  },
  [topicKey('fundamentals', 'binary-system')]: {
    title: 'Binärsystem',
    relatedTopics: [topicKey('fundamentals', 'ipv4'), topicKey('fundamentals', 'subnet-masks')],
    introPool: [
      'Subnetting steht an und ich muss binär rechnen. Hilfst du mir kurz?',
      'Wie war nochmal die Umrechnung von Dezimal zu Binär?',
    ],
    samHelp: 'Im Binärsystem hat jede Stelle die Wertigkeit 2 hoch ihre Position (von rechts beginnend mit 0). 1011 = 1·8 + 0·4 + 1·2 + 1·1 = 11. Für Netzwerkadressen arbeitet man meist mit 8-Bit-Blöcken.',
    questions: [
      { id: 'bin-1', difficulty: 'easy', text: 'Wie viele Werte kann ein Bit annehmen?', options: ['1', '2', '8', '10'], correct: 1, explanation: 'Ein Bit kann entweder 0 oder 1 sein, also zwei Zustände.' },
      { id: 'bin-2', difficulty: 'easy', text: 'Wie viele Bit hat ein Byte?', options: ['4', '8', '16', '32'], correct: 1, explanation: 'Ein Byte besteht aus 8 Bit.' },
      { id: 'bin-3', difficulty: 'medium', text: 'Wie lautet die Dezimalzahl für 1010?', options: ['8', '9', '10', '12'], correct: 2, explanation: '1010₂ = 1·2³ + 0·2² + 1·2¹ + 0·2⁰ = 8 + 0 + 2 + 0 = 10.' },
      { id: 'bin-4', difficulty: 'hard', text: 'Wie lautet 255 als 8-Bit-Binärzahl?', options: ['10000000', '11110000', '11111111', '10101010'], correct: 2, explanation: '255 = 128+64+32+16+8+4+2+1, also alle 8 Bits gesetzt: 11111111.' },
    ],
  },
  [topicKey('fundamentals', 'ipv4')]: {
    title: 'IP-Adressen',
    relatedTopics: [topicKey('fundamentals', 'binary-system'), topicKey('fundamentals', 'subnet-masks')],
    introPool: [
      'Mein Praktikant verwechselt IPv4 und IPv6 ständig. Was sind die wichtigsten IPv4-Eigenschaften?',
      'Kannst du mir IPv4-Adressen in 30 Sekunden erklären?',
    ],
    samHelp: 'IPv4-Adressen sind 32 Bit lang, meist in vier Oktette geschrieben (z. B. 192.168.1.1). Jede Zahl darf 0–255 sein. Es gibt Netz- und Host-Anteil, getrennt durch die Subnetzmaske.',
    questions: [
      { id: 'ipv4-1', difficulty: 'easy', text: 'Wie viele Bit hat eine IPv4-Adresse?', options: ['16', '32', '64', '128'], correct: 1, explanation: 'IPv4-Adressen sind 32 Bit lang, aufgeteilt in vier Oktette zu je 8 Bit.' },
      { id: 'ipv4-2', difficulty: 'medium', text: 'Welche Adresse liegt im privaten Bereich?', options: ['8.8.8.8', '172.32.0.1', '192.168.10.5', '127.0.0.1'], correct: 2, explanation: '192.168.0.0/16 ist ein privater IPv4-Bereich. 127.0.0.1 ist Loopback, 8.8.8.8 öffentlich.' },
      { id: 'ipv4-3', difficulty: 'medium', text: 'Was ist die Loopback-Adresse?', options: ['0.0.0.0', '127.0.0.1', '255.255.255.255', '10.0.0.1'], correct: 1, explanation: '127.0.0.1 dient als Loopback, um den eigenen Rechner anzusprechen.' },
      { id: 'ipv4-4', difficulty: 'hard', text: 'Welcher Adresstyp identifiziert alle Hosts in einem Subnetz?', options: ['Netz-ID', 'Host-ID', 'Broadcast', 'Gateway'], correct: 2, explanation: 'Die Broadcast-Adresse spricht alle Hosts im selben Subnetz an (letzte Adresse des Subnetzes).' },
      { id: 'ipv4-5', difficulty: 'medium', text: 'Was sagt mir /24 eigentlich?', options: ['Die ersten 24 Bit gehören zum Netzanteil', 'Das Netz besitzt genau 24 Hosts', 'Die Adresse besteht aus 24 Oktetten'], correct: 0, explanation: 'Die CIDR-Präfixlänge nennt die Anzahl zusammenhängender Netzbits.' },
      { id: 'ipv4-6', difficulty: 'hard', text: 'Warum kann die Netz-ID normalerweise keinem PC zugewiesen werden?', options: ['Sie beschreibt das Netz selbst, weil alle Hostbits 0 sind', 'Sie ist immer eine öffentliche Adresse', 'Sie enthält keine Netzbits'], correct: 0, explanation: 'Die Netz-ID bezeichnet den gesamten Netzblock und keine einzelne Hostschnittstelle.' },
      { id: 'ipv4-7', difficulty: 'medium', text: 'Ein NEXUS-PC hat plötzlich 169.254.12.88. Was vermutest du zuerst?', options: ['APIPA nach fehlgeschlagenem DHCP-Bezug', 'erfolgreiche öffentliche Adressierung', 'Loopback-Test'], correct: 0, explanation: '169.254.0.0/16 ist Link-Local/APIPA und häufig ein Hinweis auf fehlende DHCP-Erreichbarkeit.' },
      { id: 'ipv4-8', difficulty: 'hard', text: 'Beginnt jede moderne Adresse mit 192 automatisch ein /24-Netz der Klasse C?', options: ['Nein, moderne Netzgrößen bestimmt der CIDR-Präfix', 'Ja, die erste Zahl bestimmt immer den Präfix', 'Ja, aber nur bei privaten Adressen'], correct: 0, explanation: 'Klassenbasierte Adressierung ist historisch. Heute bestimmt die explizite Präfixlänge die Netzgröße.' },
    ],
  },
  [topicKey('fundamentals', 'subnet-masks')]: {
    title: 'Subnetzmasken',
    relatedTopics: [topicKey('fundamentals', 'ipv4'), topicKey('fundamentals', 'subnetting')],
    introPool: [
      'Ich prüfe gerade eine DHCP-Konfiguration. Wann ist die Subnetzmaske falsch?',
      'Wie finde ich eigentlich aus IP und Maske die Netz-ID?',
    ],
    samHelp: 'Die Subnetzmaske trennt den Netzanteil vom Hostanteil. Sie wird oft als CIDR-Suffix geschrieben (/24). Netz-ID = IP AND Maske, Broadcast = Netz-ID OR umgekehrte Maske, Host-Bereich dazwischen.',
    questions: [
      { id: 'mask-1', difficulty: 'easy', text: 'Welche Subnetzmaske gehört zu /24?', options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'], correct: 2, explanation: '/24 bedeutet 24 gesetzte Bits, also 255.255.255.0.' },
      { id: 'mask-2', difficulty: 'medium', text: 'Wie viele Hostadressen sind in einem /24-Netz verfügbar?', options: ['256', '254', '255', '128'], correct: 1, explanation: 'In einem /24-Netz bleiben 8 Host-Bits = 256 Adressen, abzüglich Netz-ID und Broadcast = 254 nutzbare Hosts.' },
      { id: 'mask-3', difficulty: 'medium', text: 'Was passiert, wenn Host und Gateway unterschiedliche Subnetzmasken haben?', options: ['Nichts', 'Die Kommunikation kann scheitern', 'Das Netz wird schneller', 'Der Host bekommt eine neue IP'], correct: 1, explanation: 'Unterschiedliche Masken führen dazu, dass ein Host den Gateway außerhalb seines eigenen Netzes vermutet oder umgekehrt.' },
      { id: 'mask-4', difficulty: 'hard', text: 'Welche CIDR-Notation entspricht 255.255.224.0?', options: ['/18', '/19', '/20', '/21'], correct: 1, explanation: '255.255.224.0 = 11111111.11111111.11100000.00000000, also 16+3 = 19 gesetzte Bits = /19.' },
    ],
  },
  [topicKey('fundamentals', 'subnetting')]: {
    title: 'Subnetting',
    relatedTopics: [topicKey('fundamentals', 'subnet-masks'), topicKey('fundamentals', 'ipv4')],
    introPool: [
      'Wir müssen ein /24 in mehrere gleich große Subnetze teilen. Wie viele Hosts passen in /26?',
      'Subnetting-Übung kurz und schmerzlos: Netz-ID und Broadcast finden.',
    ],
    samHelp: 'Subnetting verschiebt die Grenze: mehr Netzbits ergeben mehr kleinere Netze, weniger Hostbits bedeuten weniger Hosts je Netz. Bei /26 bleiben 6 Hostbits: 2⁶ − 2 = 62 nutzbare Hosts; die Sprungweite im letzten Oktett beträgt 64.',
    questions: [
      { id: 'sub-1', difficulty: 'easy', text: 'Wie viele Hosts hat ein /26-Subnetz?', options: ['30', '62', '126', '254'], correct: 1, explanation: '/26 lässt 6 Host-Bits: 2⁶ = 64 Adressen, abzüglich Netz-ID und Broadcast = 62 Hosts.' },
      { id: 'sub-2', difficulty: 'medium', text: 'Wie lautet die Broadcast-Adresse von 192.168.1.64/26?', options: ['192.168.1.127', '192.168.1.128', '192.168.1.63', '192.168.1.255'], correct: 0, explanation: '/26-Blöcke im 4. Oktett springen in 64er-Schritten. Block 64–127, Broadcast = 127.' },
      { id: 'sub-3', difficulty: 'medium', text: 'Von einem /24 werden 4 gleich große Subnetze benötigt. Welche Präfixlänge entsteht?', options: ['/25', '/26', '/27', '/28'], correct: 1, explanation: '4 Subnetze brauchen 2 zusätzliche Subnetz-Bits: /24 + 2 = /26.' },
      { id: 'sub-4', difficulty: 'hard', text: 'In welchem Subnetz liegt 10.0.5.130/22?', options: ['10.0.4.0/22', '10.0.5.0/22', '10.0.6.0/22', '10.0.8.0/22'], correct: 0, explanation: '/22 umfasst im 3. Oktett 4er-Blöcke. 10.0.4.0–10.0.7.255 enthält 10.0.5.130.' },
      { id: 'sub-5', difficulty: 'medium', text: 'Wir brauchen sechs gleich große Subnetze. Warum sind nicht sechs zusätzliche Netzbits nötig?', options: ['Drei Bits liefern bereits 2³ = 8 mögliche Subnetze.', 'Jedes Bit liefert sechs Subnetze.', 'Sechs Netze benötigen grundsätzlich keine zusätzlichen Bits.'], correct: 0, explanation: 'Gesucht ist die kleinste Zweierpotenz, die den Bedarf abdeckt. Drei Bits reichen für bis zu acht Subnetze.' },
      { id: 'sub-6', difficulty: 'hard', text: 'Ein Kollege plant vier Hostbits für 15 PCs. Was stimmt daran nicht?', options: ['Nach Netz-ID und Broadcast bleiben bei 2⁴ Adressen nur 14 nutzbare Hosts.', 'Vier Bits stellen nur vier Gesamtadressen dar.', '15 PCs benötigen immer 15 Hostbits.'], correct: 0, explanation: 'Für normale Hostnetze gilt 2^h − 2. Fünf Hostbits liefern 30 nutzbare Adressen.' },
      { id: 'sub-7', difficulty: 'medium', text: 'Was passiert mit der Hostkapazität, wenn das Präfix von /24 auf /26 steigt?', options: ['Sie sinkt, weil zwei Hostbits zu Netzbits werden.', 'Sie bleibt gleich, weil IPv4 immer 32 Bit hat.', 'Sie steigt, weil 26 größer als 24 ist.'], correct: 0, explanation: 'Ein größeres Präfix bedeutet mehr Netzbits und damit weniger Hostbits pro Subnetz.' },
      { id: 'sub-8', difficulty: 'hard', text: 'Erzeugt Subnetting zusätzliche IPv4-Adressen?', options: ['Nein, es teilt den vorhandenen Adressraum in kleinere Blöcke.', 'Ja, jedes Netzbit verdoppelt den gesamten IPv4-Adressraum.', 'Ja, aber nur bei /26.'], correct: 0, explanation: 'Subnetting verschiebt die Grenze zwischen Netz- und Hostanteil; die Gesamtzahl der Adressen im Ausgangsnetz bleibt gleich.' },
    ],
  },
  [topicKey('fundamentals', 'dhcp')]: {
    title: 'DHCP',
    relatedTopics: [topicKey('fundamentals', 'dns'), topicKey('fundamentals', 'ipv4')],
    introPool: [
      'Ein Client bekommt keine IP. Woran kann das liegen?',
      'Wie funktioniert DHCP nochmal im Detail?',
      'Ein PC zeigt plötzlich 169.254.x.x - was prüfst du zuerst?',
      'Warum brauchen Clients in einem anderen VLAN oft einen DHCP Relay?',
    ],
    samHelp: 'DHCP (Dynamic Host Configuration Protocol) vergibt automatisch IP, Subnetzmaske, Gateway und DNS. Ablauf: Discover (Broadcast), Offer, Request, Acknowledge (DORA). Über Netzgrenzen braucht es einen Relay-Agenten, sonst erreichen Broadcasts den Server nicht. Eine Lease ist zeitlich begrenzt; 169.254.x.x (APIPA) deutet auf ein DHCP-Problem hin.',
    questions: [
      { id: 'dhcp-1', difficulty: 'easy', text: 'Welches Protokoll verteilt automatisch IP-Adressen?', options: ['DNS', 'DHCP', 'HTTP', 'ARP'], correct: 1, explanation: 'DHCP (Dynamic Host Configuration Protocol) konfiguriert Hosts automatisch mit IP-Parametern.' },
      { id: 'dhcp-2', difficulty: 'medium', text: 'Wie heißt der erste Schritt des DHCP-Ablaufs?', options: ['Offer', 'Request', 'Discover', 'Acknowledge'], correct: 2, explanation: 'Der Client sendet zuerst einen DHCP-Discover als Broadcast, um einen Server zu finden.' },
      { id: 'dhcp-3', difficulty: 'medium', text: 'Was passiert, wenn der DHCP-Pool erschöpft ist?', options: ['Der Client bekommt eine zufällige IP', 'Der Client bekommt keine IP', 'Der Switch übernimmt', 'Das Gateway wird DHCP-Server'], correct: 1, explanation: 'Ohne freie Lease kann der DHCP-Server dem Client keine Adresse zuweisen.' },
      { id: 'dhcp-4', difficulty: 'hard', text: 'Wofür steht DORA?', options: ['Discover Offer Request Acknowledge', 'Dynamic Over Router Allocation', 'Domain Origin Resolution Address', 'Data Offer Relay Acknowledge'], correct: 0, explanation: 'DORA ist die Abkürzung für Discover, Offer, Request, Acknowledge – den DHCP-Vier-Wege-Handshake.' },
      { id: 'dhcp-5', difficulty: 'medium', text: 'Ein NEXUS-PC hat plötzlich 169.254.12.88. Was vermutest du zuerst?', options: ['APIPA nach fehlgeschlagenem DHCP-Bezug', 'erfolgreiche öffentliche Adressierung', 'Loopback-Test'], correct: 0, explanation: '169.254.0.0/16 ist Link-Local/APIPA und ein starker Hinweis, dass der Client keine reguläre DHCP-Konfiguration erhalten hat.' },
      { id: 'dhcp-6', difficulty: 'medium', text: 'Warum funktioniert DHCP ohne Relay-Agent normalerweise nicht durch einen Router hindurch?', options: ['Router leiten Broadcasts standardmäßig nicht in andere Netze weiter', 'DHCP verwendet TCP, das Router blockieren', 'Router kennen die MAC-Adresse des Clients nicht', 'DHCP ist ein Anwendungsprotokoll'], correct: 0, explanation: 'DHCP-Discover ist ein Broadcast; Router leiten Broadcasts nicht über Netzgrenzen weiter, daher braucht es einen Relay-Agenten.' },
      { id: 'dhcp-7', difficulty: 'hard', text: 'Was ist der Unterschied zwischen einer festen DHCP-Reservierung und einer manuell gesetzten statischen IP?', options: ['Bei der Reservierung bleibt die Konfiguration zentral im DHCP-Server; bei der statischen IP steht sie direkt am Gerät', 'Beides ist identisch', 'Eine Reservierung wird nie an ein Gerät vergeben', 'Eine statische IP kann nicht dieselbe sein wie eine Reservierung'], correct: 0, explanation: 'Eine DHCP-Reservierung liefert dieselbe IP, bleibt aber zentral verwaltet und profitiert z. B. von DNS-Änderungen.' },
      { id: 'dhcp-8', difficulty: 'medium', text: 'Warum verliert ein Client nicht sofort seine IP, nur weil der DHCP-Server kurz offline ist?', options: ['Weil die Lease noch gültig ist', 'Weil der Client die IP dauerhaft besitzt', 'Weil der Router Ersatzadressen vergibt', 'Weil APIPA sofort aktiv wird'], correct: 0, explanation: 'Die Lease ist zeitlich begrenzt; solange sie gültig ist, bleibt die Konfiguration auch ohne erreichbaren Server bestehen.' },
      { id: 'dhcp-9', difficulty: 'medium', text: 'Ein Client bekommt zwar eine IP, aber das Gateway ist falsch. Was prüfst du?', options: ['DHCP-Scope-Optionen', 'DNS-Server-Autorisierung', 'MAC-Adresse des Clients', 'Switch-Port-VLAN'], correct: 0, explanation: 'Gateway und DNS werden typischerweise über DHCP-Scope-Optionen verteilt; ein falsches Gateway deutet darauf hin.' },
      { id: 'dhcp-10', difficulty: 'hard', text: 'Erkläre DORA - nicht nur die vier Buchstaben.', options: ['Discover: Client sucht Server; Offer: Server bietet an; Request: Client nimmt an; ACK: Server bestätigt Lease', 'Discover: Server sucht Client; Offer: Client bittet um IP; Request: Server lehnt ab; ACK: Lease endet', 'Discover: Router sendet Broadcast; Offer: Client wählt Gateway; Request: DNS antwortet; ACK: DHCP startet'], correct: 0, explanation: 'Discover = Client sucht Server per Broadcast; Offer = Server bietet Konfiguration an; Request = Client fordert das Angebot an; ACK = Server bestätigt die Lease.' },
    ],
  },
  [topicKey('fundamentals', 'dns')]: {
    title: 'DNS',
    relatedTopics: [topicKey('fundamentals', 'dhcp'), topicKey('fundamentals', 'ipv4')],
    introPool: [
      'Ein Benutzer kann google.de nicht öffnen, alle anderen Seiten gehen. DNS-Problem?',
      'Wie wird eigentlich ein Name in eine IP aufgelöst?',
    ],
    samHelp: 'DNS verknüpft Namen mit Adress- und Dienstinformationen. Der Client fragt seinen Resolver rekursiv; dieser prüft Zone und Cache, nutzt gegebenenfalls Forwarder und folgt bei Bedarf iterativen Referrals bis zu einem für die Zone autoritativen Server.',
    questions: [
      { id: 'dns-1', difficulty: 'easy', text: 'Was ist die Hauptaufgabe von DNS?', options: ['IP-Adressen vergeben', 'Namen in IP-Adressen auflösen', 'E-Mails verschicken', 'Dateien speichern'], correct: 1, explanation: 'DNS übersetzt menschenlesbare Domain-Namen wie example.com in IP-Adressen.' },
      { id: 'dns-2', difficulty: 'medium', text: 'Welcher Record-Typ zeigt auf eine IPv4-Adresse?', options: ['AAAA', 'CNAME', 'A', 'MX'], correct: 2, explanation: 'Der A-Record verweist auf eine IPv4-Adresse; AAAA auf IPv6.' },
      { id: 'dns-3', difficulty: 'medium', text: 'Welche Komponente verfolgt bei Bedarf iterative Referrals zu Root-, TLD- und autoritativen Servern?', options: ['Recursive Resolver', 'Webserver', 'DHCP-Client', 'Mailserver'], correct: 0, explanation: 'Der Resolver übernimmt die Auflösung für den Client; Cache oder bekannte Referrals können dabei einzelne Hierarchiestufen überspringen.' },
      { id: 'dns-4', difficulty: 'hard', text: 'ping auf die Server-IP funktioniert, der FQDN aber nicht. Was prüfst du zuerst?', options: ['DNS-Server, Resolver-Konfiguration und passenden Record', 'das Kabel trotz erfolgreicher IP-Verbindung', 'die Subnetting-Sprungweite'], correct: 0, explanation: 'Die IP-Erreichbarkeit grenzt den Fehler ein. Wenn nur der Name scheitert, ist DNS besonders wahrscheinlich.' },
      { id: 'dns-5', difficulty: 'medium', text: 'Was ist der Unterschied zwischen einer Domain und einer Zone?', options: ['Domain ist ein logischer Namensbereich, Zone der administrativ verwaltete Teil mit DNS-Daten', 'Beides ist immer identisch', 'Eine Zone ist nur eine IP-Adresse'], correct: 0, explanation: 'Domains strukturieren den Namensraum; Zonen bilden administrative Zuständigkeit ab.' },
      { id: 'dns-6', difficulty: 'hard', text: 'Warum kann derselbe DNS-Server für eine Anfrage autoritativ und für eine andere nicht autoritativ sein?', options: ['Autorität bezieht sich auf die konkrete Zone, für die er maßgebliche Daten besitzt', 'Autorität wechselt zufällig pro Anfrage', 'Nur der verwendete Port entscheidet'], correct: 0, explanation: 'Ein Server kann eigene Zonendaten autoritativ beantworten und andere Namen aus Cache oder über weitere Resolver liefern.' },
      { id: 'dns-7', difficulty: 'hard', text: 'Was unterscheidet Delegierung von Forwarding?', options: ['Delegierung überträgt Namespace-Zuständigkeit; Forwarding gibt Anfragen an einen Resolver weiter', 'Beide leeren nur den DNS-Cache', 'Forwarding erstellt immer eine neue Zone'], correct: 0, explanation: 'Delegierung strukturiert Autorität im DNS-Baum. Forwarding ist ein Weg zur Auflösung einer Anfrage.' },
    ],
  },
  [topicKey('fundamentals', 'tcp-udp')]: {
    title: 'TCP & UDP',
    relatedTopics: [topicKey('fundamentals', 'tcp-ip-model'), topicKey('fundamentals', 'osi-model')],
    introPool: [
      'Wann nimmt man TCP, wann UDP?',
      'Mein VoIP-Anruf ruckelt. Hat das mit dem Transportprotokoll zu tun?',
      'Mein Browser ruft eine Seite ab. Wie weiß der Server, welche Anwendung antworten soll?',
      'Warum reicht eine IP-Adresse allein nicht für eine Verbindung aus?',
    ],
    samHelp: 'TCP ist verbindungsorientiert, zuverlässig und reihenfolgetreu (Three-Way Handshake, ACKs, Wiederholung). UDP ist verbindungslos, schneller, aber unzuverlässig – gut für Streaming, VoIP, DNS. IP-Adressen identifizieren Hosts, Port-Nummern identifizieren Dienste auf einem Host. Bekannte Ports: HTTP 80, HTTPS 443, DNS 53, SSH 22, DHCP 67/68. TCP- und UDP-Header tragen jeweils Quell- und Zielport.',
    questions: [
      { id: 'tp-1', difficulty: 'easy', text: 'Welches Protokoll ist zuverlässig und verbindungsorientiert?', options: ['UDP', 'TCP', 'ICMP', 'ARP'], correct: 1, explanation: 'TCP baut eine Verbindung auf, bestätigt Empfang und sorgt für korrekte Reihenfolge.' },
      { id: 'tp-2', difficulty: 'medium', text: 'Wie viele Pakete umfasst der TCP-Three-Way-Handshake?', options: ['2', '3', '4', '5'], correct: 1, explanation: 'SYN, SYN-ACK, ACK – insgesamt drei Pakete.' },
      { id: 'tp-3', difficulty: 'medium', text: 'Für welche Anwendung ist UDP typisch besser geeignet?', options: ['Datei-Download', 'E-Mail', 'VoIP/Video-Streaming', 'Webseitenaufruf'], correct: 2, explanation: 'UDP hat weniger Overhead und akzeptiert gelegentliche Paketverluste, was für Echtzeit-Anwendungen ideal ist.' },
      { id: 'tp-4', difficulty: 'hard', text: 'Was passiert, wenn ein TCP-Segment verloren geht?', options: ['Nichts', 'Der Sender wiederholt es nach Timeout', 'Der Empfänger ignoriert es', 'Das nächste Segment ersetzt es'], correct: 1, explanation: 'TCP erkennt fehlende ACKs und sendet das betroffene Segment erneut.' },
      { id: 'port-1', difficulty: 'easy', text: 'Wozu dienen Port-Nummern?', options: ['MAC-Adressen vergeben', 'Dienste auf einem Host unterscheiden', 'Den Gateway festlegen', 'Subnetze bilden'], correct: 1, explanation: 'Port-Nummern ermöglichen es, mehrere Dienste auf einer IP-Adresse zu betreiben.' },
      { id: 'port-2', difficulty: 'easy', text: 'Welcher Port wird typischerweise für HTTP verwendet?', options: ['21', '53', '80', '443'], correct: 2, explanation: 'HTTP verwendet standardmäßig TCP-Port 80; HTTPS verwendet 443.' },
      { id: 'port-3', difficulty: 'medium', text: 'Welcher Dienst nutzt typischerweise UDP-Port 53?', options: ['HTTP', 'DNS', 'SMTP', 'SSH'], correct: 1, explanation: 'DNS-Anfragen werden oft über UDP-Port 53 gesendet (TCP für größere Antworten).' },
      { id: 'port-4', difficulty: 'medium', text: 'Warum reicht eine IP-Adresse allein nicht für eine TCP-Verbindung?', options: ['Weil Ports optional sind', 'Weil auch Quell- und Zielport bekannt sein müssen', 'Weil MAC-Adressen fehlen', 'Weil DNS nicht funktioniert'], correct: 1, explanation: 'Eine TCP-Verbindung besteht aus Quell-IP:Port und Ziel-IP:Port; beides ist nötig.' },
    ],
  },
  [topicKey('fundamentals', 'switching')]: {
    title: 'Switching',
    relatedTopics: [topicKey('fundamentals', 'grundbegriffe'), topicKey('fundamentals', 'vlan-basics')],
    introPool: [
      'Mein Switch leitet manche Frames nicht weiter. Woran liegt das?',
      'Wie unterscheidet ein Switch eigentlich Broadcast von Unicast?',
    ],
    samHelp: 'Ein Switch arbeitet auf Schicht 2 und leitet Frames anhand seiner MAC-Adresstabelle gezielt weiter. Er lernt MAC-Adressen aus eingehenden Frames. Jeder Port bildet eine eigene Collision Domain. Unbekannte Ziele werden gefloodet, Broadcasts werden an alle Ports verteilt.',
    questions: [
      { id: 'sw-1', difficulty: 'easy', text: 'Womit leitet ein Switch Frames primär weiter?', options: ['IP-Adresse', 'MAC-Adresse', 'Port-Nummer', 'Hostname'], correct: 1, explanation: 'Ein Switch baut eine MAC-Adresstabelle auf und leitet Frames anhand der Ziel-MAC weiter.' },
      { id: 'sw-2', difficulty: 'easy', text: 'Auf welcher OSI-Schicht arbeitet ein typischer Switch?', options: ['Schicht 1', 'Schicht 2', 'Schicht 3', 'Schicht 4'], correct: 1, explanation: 'Ein Switch arbeitet auf der Sicherungsschicht (Schicht 2) mit MAC-Adressen.' },
      { id: 'sw-3', difficulty: 'medium', text: 'Was passiert, wenn ein Switch die Ziel-MAC noch nicht kennt?', options: ['Er verwirft das Frame', 'Er leitet es an alle Ports außer dem Eingangsport weiter', 'Er fragt den Router', 'Er wartet auf eine ARP-Antwort'], correct: 1, explanation: 'Bei einer unbekannten Ziel-MAC flooded der Switch das Frame an alle Ports (außer dem Eingangsport).' },
      { id: 'sw-4', difficulty: 'hard', text: 'Wie viele separate Kollisionsdomänen entstehen typischerweise bei einem 8-Port-Switch?', options: ['Eine', 'Acht', 'Sechzehn', 'Keine'], correct: 1, explanation: 'Jeder Port eines Switches bildet seine eigene Collision Domain, da Full-Duplex-Betrieb möglich ist.' },
    ],
  },
  [topicKey('fundamentals', 'vlan-basics')]: {
    title: 'VLAN-Grundlagen',
    relatedTopics: [topicKey('fundamentals', 'switching'), topicKey('fundamentals', 'subnet-masks')],
    introPool: [
      'Wir überlegen, die Abteilungen per VLAN zu trennen. Was ist dabei wichtig?',
      'Wieso reicht es nicht, einfach nur verschiedene IP-Netze zu verwenden?',
    ],
    samHelp: 'VLANs trennen ein physisches Netzwerk logisch in Broadcast-Domains. Access-Ports gehören zu genau einem VLAN, Trunk-Ports transportieren mehrere VLANs. VLANs erhöhen die Sicherheit und reduzieren Broadcast-Verkehr, ersetzen aber nicht IP-Subnetze; beides zusammen ist üblich.',
    questions: [
      { id: 'vlan-1', difficulty: 'easy', text: 'Wozu dienen VLANs?', options: ['Physische Verkabelung vereinfachen', 'Logische Trennung im selben Netzwerk', 'WLAN-Signal verstärken', 'IP-Adressen automatisch vergeben'], correct: 1, explanation: 'VLANs teilen ein physisches Netz in mehrere logische Broadcast-Domains ein.' },
      { id: 'vlan-2', difficulty: 'easy', text: 'Welcher Port-Modus transportiert typischerweise mehrere VLANs?', options: ['Access', 'Trunk', 'Loopback', 'Console'], correct: 1, explanation: 'Ein Trunk-Port transportiert mehrere VLANs gleichzeitig, oft zwischen Switchen.' },
      { id: 'vlan-3', difficulty: 'medium', text: 'Welcher Befehl weist einen Access-Port einem VLAN zu?', options: ['switchport mode trunk', 'switchport access vlan 10', 'vlan 10 name SALES', 'interface vlan 10'], correct: 1, explanation: 'Im Interface-Konfigurationsmodus setzt „switchport access vlan <id>" den Access-VLAN.' },
      { id: 'vlan-4', difficulty: 'medium', text: 'Was passiert, wenn zwei Hosts im selben VLAN aber unterschiedlichen IP-Subnetzen sind?', options: ['Sie kommunizieren normal', 'Sie können nicht direkt kommunizieren', 'Der Switch verweigert die Verbindung', 'Das VLAN wird deaktiviert'], correct: 1, explanation: 'VLAN und IP-Subnetz müssen zusammenpassen; unterschiedliche Subnetze brauchen einen Router/L3-Switch.' },
    ],
  },
  [topicKey('fundamentals', 'routing')]: {
    title: 'Routing',
    relatedTopics: [topicKey('fundamentals', 'ipv4'), topicKey('fundamentals', 'tcp-ip-model')],
    introPool: [
      'Warum antwortet ein Host in einem anderen Netz nicht auf meinen Ping?',
      'Wie entscheidet ein Router, wohin ein Paket geschickt wird?',
    ],
    samHelp: 'Router verbinden verschiedene IP-Netze und entscheiden anhand ihrer Routing-Tabelle, wohin Pakete weitergeleitet werden. Der Default Gateway ist der Router für Ziele außerhalb des eigenen Subnetzes. Routing findet auf Schicht 3 statt.',
    questions: [
      { id: 'route-1', difficulty: 'easy', text: 'Welches Gerät verbindet typischerweise zwei IP-Netzwerke?', options: ['Switch', 'Router', 'Access Point', 'Hub'], correct: 1, explanation: 'Ein Router verbindet unterschiedliche Netzwerke und leitet Pakete zwischen ihnen weiter.' },
      { id: 'route-2', difficulty: 'easy', text: 'Auf welcher OSI-Schicht arbeitet Routing?', options: ['Schicht 2', 'Schicht 3', 'Schicht 4', 'Schicht 7'], correct: 1, explanation: 'Routing arbeitet auf der Vermittlungsschicht (Schicht 3) mit IP-Adressen.' },
      { id: 'route-3', difficulty: 'medium', text: 'Welche Information nutzt ein Router, um ein Paket weiterzuleiten?', options: ['MAC-Adresse des Senders', 'Ziel-IP-Adresse und Routing-Tabelle', 'VLAN-ID allein', 'Hostname des Empfängers'], correct: 1, explanation: 'Der Router prüft die Ziel-IP und sucht den besten Eintrag in seiner Routing-Tabelle.' },
      { id: 'route-4', difficulty: 'medium', text: 'Was ist der Default Gateway?', options: ['Der schnellste Router im Internet', 'Der Router, den ein Host für fremde Netze verwendet', 'Das lokale Subnetz', 'Ein DNS-Server'], correct: 1, explanation: 'Der Default Gateway ist der Router, an den ein Host Pakete sendet, deren Ziel nicht im lokalen Subnetz liegt.' },
    ],
  },
  // Der aus den Fundamentals entfernte Platzhalter "Inter-VLAN Routing" lebt
  // fachlich in der Cisco-Lektion "Router on a Stick" weiter. Die
  // Gesprächsfragen werden daher dem Cisco-Topic zugeordnet.
  [topicKey('cisco-packet-tracer', 'inter-vlan-routing')]: {
    title: 'Router on a Stick',
    relatedTopics: [topicKey('cisco-packet-tracer', 'trunk'), topicKey('cisco-packet-tracer', 'router-basics')],
    introPool: [
      'Wie können Geräte in unterschiedlichen VLANs miteinander kommunizieren?',
      'Router-on-a-Stick – wie funktioniert das eigentlich?',
    ],
    samHelp: 'VLANs trennen Broadcast-Domains auf Schicht 2. Für Inter-VLAN-Routing braucht man einen Router (oder L3-Switch): auf dem Router-Physikinterface werden Subinterfaces angelegt, jedes mit "encapsulation dot1q" für genau ein VLAN getaggt und mit der passenden Gateway-IP versehen. Der Switch-Uplink muss Trunk sein und alle VLANs erlauben.',
    questions: [
      { id: 'ivr-1', difficulty: 'easy', text: 'Wozu dient Router-on-a-Stick?', options: ['Schnelleres WLAN', 'Routing zwischen VLANs über einen Router-Port', 'Redundanter Internetzugang', 'DHCP für mehrere Netze'], correct: 1, explanation: 'Router-on-a-Stick ermöglicht Inter-VLAN-Routing über Subinterfaces auf einem einzelnen Router-Port.' },
      { id: 'ivr-2', difficulty: 'medium', text: 'Welchen Befehl verwendet man auf einem Subinterface für VLAN-Tagging?', options: ['switchport mode trunk', 'encapsulation dot1q', 'vlan trunk encapsulation', 'ip routing vlan'], correct: 1, explanation: 'Mit "encapsulation dot1q <vlan-id>" weist man ein Subinterface einem VLAN zu.' },
      { id: 'ivr-3', difficulty: 'medium', text: 'Was muss der Switch-Uplink zum Router sein?', options: ['Access-Port', 'Trunk-Port', 'Loopback', 'Shutdown'], correct: 1, explanation: 'Der Uplink muss Trunk sein, damit mehrere VLAN-Tags zum Router gelangen.' },
      { id: 'ivr-4', difficulty: 'hard', text: 'Was passiert, wenn ein Subinterface heruntergefahren ist?', options: ['Nur dieses VLAN kann nicht geroutet werden', 'Alle VLANs werden ausfallen', 'Der Switch-Uplink wird deaktiviert', 'Nichts'], correct: 0, explanation: 'Ein shutdown auf einem Subinterface unterbricht das Routing für genau das zugehörige VLAN.' },
    ],
  },
  [topicKey('fundamentals', 'kommunikation-uebertragung')]: {
    title: 'Kommunikations- und Übertragungsarten',
    relatedTopics: [topicKey('fundamentals', 'grundbegriffe'), topicKey('fundamentals', 'osi-model')],
    introPool: [
      'Wann spricht man von Broadcast, wann von Multicast?',
      'Simplex, Halbduplex, Vollduplex – wo ist der Unterschied?',
    ],
    samHelp: 'Unicast, Broadcast und Multicast beschreiben die Empfänger. Simplex, Halbduplex und Vollduplex beschreiben die Richtungen. Bei Medien gilt: Koax/Twisted Pair übertragen elektrisch, Glasfaser optisch; Funk, Satellit und Infrarot benötigen keinen verlegten Leiter. Die Auswahl hängt von der konkreten Anforderung ab.',
    questions: [
      { id: 'comm-1', difficulty: 'easy', text: 'Was ist Unicast?', options: ['Ein Sender, alle Empfänger', 'Ein Sender, ein Empfänger', 'Ein Sender, eine Gruppe', 'Kein Empfänger'], correct: 1, explanation: 'Unicast beschreibt die Kommunikation zwischen genau einem Sender und einem Empfänger.' },
      { id: 'comm-2', difficulty: 'easy', text: 'Welcher Übertragungsmodus erlaubt gleichzeitiges Senden und Empfangen?', options: ['Simplex', 'Halbduplex', 'Vollduplex', 'Unicast'], correct: 2, explanation: 'Vollduplex ermöglicht gleichzeitiges Senden und Empfangen, wie moderne Switched Ethernet-Links.' },
      { id: 'comm-3', difficulty: 'medium', text: 'Welche Adressierungsart erreicht eine ausgewählte Gruppe von Empfängern?', options: ['Unicast', 'Broadcast', 'Multicast', 'Anycast'], correct: 2, explanation: 'Multicast sendet an eine bestimmte, angemeldete Gruppe von Empfängern.' },
      { id: 'comm-4', difficulty: 'medium', text: 'In welchem Modus senden beide Seiten abwechselnd?', options: ['Simplex', 'Halbduplex', 'Vollduplex', 'Broadcast'], correct: 1, explanation: 'Halbduplex erlaubt beide Richtungen, aber nicht gleichzeitig – beispielsweise bei klassischen Hubs oder Walkie-Talkies.' },
      { id: 'comm-5', difficulty: 'medium', text: 'Wenn Glasfaser leitungsgebunden ist, warum zählt sie trotzdem nicht zu den metallischen Leitern?', options: ['Sie führt Licht in Core und Cladding statt elektrische Signale in Metall.', 'Sie verwendet unsichtbares Kupfer.', 'Leitungsgebunden bedeutet immer drahtlos.'], correct: 0, explanation: 'Leitungsgebunden beschreibt den physischen Signalweg. Glasfaser besitzt einen solchen Weg, überträgt aber optisch und nicht elektrisch.' },
      { id: 'comm-6', difficulty: 'medium', text: 'Warum hilft die Verdrillung bei einem Twisted-Pair-Kabel?', options: ['Sie reduziert elektromagnetische Störeinflüsse und gegenseitige Beeinflussung.', 'Sie ersetzt jede Form der Signalübertragung.', 'Sie macht aus Kupfer automatisch Glasfaser.'], correct: 0, explanation: 'Verdrillung ist bereits eine Maßnahme gegen Störeinflüsse. Zusätzliche Schirmung ist davon getrennt.' },
      { id: 'comm-7', difficulty: 'hard', text: 'Ist STP für jedes NEXUS-Büro automatisch besser als UTP?', options: ['Nein, Störumgebung, Installation, Kosten und Anforderungen entscheiden.', 'Ja, zusätzliche Schirmung hat niemals Nachteile.', 'Ja, weil UTP keine verdrillten Adern hat.'], correct: 0, explanation: 'Geschirmte Varianten können störfester sein, benötigen aber fachgerechte Installation und zusätzlichen Aufwand.' },
      { id: 'comm-8', difficulty: 'hard', text: 'Warum kann Satellitenkommunikation mehr Laufzeit verursachen als eine kurze lokale Kabelverbindung?', options: ['Uplink und Downlink ergeben einen sehr großen Signalweg.', 'Satelliten speichern jedes Signal mehrere Stunden.', 'Weil Satelliten ausschließlich Kupfer verwenden.'], correct: 0, explanation: 'Die Signallaufzeit steigt durch den langen Weg von der Bodenstation zum Satelliten und zurück.' },
    ],
  },
  // ---------------------------------------------------------------------
  // Cisco / Packet Tracer (Phase 1J.3 Etappe 4): hands-on device topics,
  // reusing the exact same intro/samHelp/questions shape as the fundamentals
  // topics above. Questions deliberately favor understanding, troubleshooting
  // and transfer ("why", "given this symptom what's wrong", "what's the one
  // real difference") over pure command-syntax recall - the CLI missions and
  // Academy lesson (academyLessons/ciscoSsh.js) already drill exact syntax.
  // ---------------------------------------------------------------------
  [topicKey('cisco-packet-tracer', 'ssh')]: {
    title: 'Fernwartung mit SSH',
    relatedTopics: [
      topicKey('cisco-packet-tracer', 'router-basics'),
      topicKey('cisco-packet-tracer', 'trunk'),
      topicKey('cisco-packet-tracer', 'multilayer-switching'),
      topicKey('fundamentals', 'tcp-udp'),
    ],
    introPool: [
      'SW-ADM-01 ist jetzt per SSH erreichbar, aber ein Kollege fragt mich, warum wir nicht einfach Telnet lassen konnten. Was sag ich ihm?',
      'Ich habe eben versucht, mich per SSH auf einen frisch aufgesetzten Switch zu verbinden - Verbindung wird abgelehnt. Wo würdest du zuerst nachsehen?',
      'Ein Azubi hat versehentlich "crypto key generate rsa" auf einem Gerät ohne Hostname und Domain ausgeführt. Warum bricht das ab?',
    ],
    samHelp: 'SSH (Port 22) verschlüsselt die gesamte Verbindung inklusive Zugangsdaten, Telnet (Port 23) überträgt alles im Klartext. Die Reihenfolge Hostname → Domain-Name → enable secret → lokaler Benutzer → RSA-Schlüssel → SSH Version 2 → IP-Erreichbarkeit → VTY (login local, transport input ssh) ist bei Router, L2-Switch und Multilayer-Switch identisch - nur WIE die IP-Erreichbarkeit hergestellt wird, unterscheidet sich (physisches Interface beim Router, Management-SVI beim L2-Switch).',
    questions: [
      { id: 'ssh-conv-1', difficulty: 'easy', text: 'Ein Kollege fragt, warum ihr für die Fernwartung nicht einfach bei Telnet bleiben konntet. Was ist die richtige Antwort?', options: ['Telnet ist neuer, aber noch nicht stabil genug', 'Telnet überträgt Login und Konfigurationsbefehle unverschlüsselt im Klartext, SSH verschlüsselt die gesamte Verbindung', 'Telnet funktioniert nur mit IPv6, SSH mit IPv4', 'Es gibt keinen echten Unterschied, nur die Portnummer ist anders'], correct: 1, explanation: 'Der entscheidende Unterschied ist Verschlüsselung: Telnet ist komplett im Klartext mitlesbar, SSH verschlüsselt Login und gesamten Datenverkehr.' },
      { id: 'ssh-conv-2', difficulty: 'medium', text: 'Auf einem frisch aufgesetzten Gerät bricht "crypto key generate rsa" sofort mit einer Fehlermeldung ab. Was fehlt am wahrscheinlichsten?', options: ['Eine IP-Adresse auf dem Management-Interface', 'Hostname und/oder Domain-Name - der Schlüsselname setzt sich aus beiden zusammen', 'Ein bereits aktiver SSH-Client', 'Das Gerät muss zuerst neu gestartet werden'], correct: 1, explanation: 'Der RSA-Schlüsselname wird aus Hostname und Domain-Name gebildet - fehlt einer von beiden, kann IOS keinen Schlüssel benennen und bricht ab.' },
      { id: 'ssh-conv-3', difficulty: 'medium', text: 'Ein Switch antwortet zuverlässig auf Ping, aber jeder SSH-Verbindungsversuch wird abgelehnt, bevor überhaupt ein Passwort abgefragt wird. Woran liegt das am ehesten?', options: ['Am fehlenden Default Gateway', 'Daran, dass kein gültiger RSA-Schlüssel existiert oder SSH nicht aktiviert ist (z. B. "ip ssh version 2" fehlt)', 'An einem falschen VLAN-Namen', 'An einem zu kurzen Passwort'], correct: 1, explanation: 'Erreichbarkeit (Ping) und SSH-Dienst sind zwei unabhängige Voraussetzungen. Wird die Verbindung sofort verweigert, läuft der SSH-Server auf dem Gerät noch gar nicht - meist fehlt der RSA-Schlüssel oder SSH wurde nie aktiviert.' },
      { id: 'ssh-conv-4', difficulty: 'medium', text: 'SSH-Verbindungsaufbau klappt, das Gerät fragt sogar Benutzername und Passwort ab, aber die Anmeldung wird trotz korrekter Daten immer abgelehnt. Was ist die wahrscheinlichste Ursache?', options: ['Die VTY-Leitungen nutzen "login local", aber der verwendete Benutzer wurde nie mit "username" angelegt', 'Der RSA-Schlüssel ist zu kurz', 'Die Domain ist falsch geschrieben', 'SSH Version 1 statt 2 ist aktiv'], correct: 0, explanation: 'Wenn Zugangsdaten abgefragt, aber nie akzeptiert werden, prüft das Gerät gegen eine Benutzerdatenbank, die den verwendeten Benutzer nicht enthält - "login local" ist aktiv, aber der Benutzer fehlt oder Nutzername/Passwort stimmen nicht mit einem angelegten Konto überein.' },
      { id: 'ssh-conv-5', difficulty: 'medium', text: 'Warum reicht es bei einem reinen Layer-2-Switch nicht, einem beliebigen Access-Port einfach eine IP-Adresse zu geben, um ihn per SSH erreichbar zu machen?', options: ['Weil Access-Ports grundsätzlich keine IP-Adressen unterstützen können und die Erreichbarkeit stattdessen über eine SVI in einem Management-VLAN läuft', 'Weil SSH auf Access-Ports technisch blockiert ist', 'Weil ein Access-Port immer VLAN 1 verwendet', 'Weil dafür zusätzlich ein Router nötig wäre'], correct: 0, explanation: 'Ein Cisco-Switch-Interface bekommt keine eigene IP - die Management-Erreichbarkeit läuft über eine virtuelle Schnittstelle (SVI) in einem eigenen Management-VLAN, unabhängig von einzelnen physischen Ports.' },
      { id: 'ssh-conv-6', difficulty: 'hard', text: 'Router, L2-Switch und Multilayer-Switch werden alle per SSH verwaltet. Was ist der EINE tatsächliche Unterschied zwischen den drei Geräten in der SSH-Konfiguration?', options: ['Nur der Router braucht einen RSA-Schlüssel', 'Nichts unterscheidet sich, alle drei sind identisch konfiguriert', 'Nur die Art, wie die IP-Erreichbarkeit hergestellt wird (physisches Interface vs. Management-SVI) - Hostname, Domain, Benutzer, RSA-Key, SSHv2 und VTY-Absicherung sind bei allen dreien identisch', 'Multilayer-Switches benötigen kein "login local"'], correct: 2, explanation: 'Die eigentliche SSH-Absicherung (Hostname/Domain für den Schlüsselnamen, enable secret, lokaler Benutzer, RSA-Key, SSHv2, VTY-Zugriff) ist bei allen drei Gerätetypen gleich. Unterschiedlich ist ausschließlich, wie das Gerät überhaupt eine erreichbare IP-Adresse bekommt.' },
      { id: 'ssh-conv-7', difficulty: 'hard', text: 'Ein Kollege hat "transport input ssh" vergessen und fragt, welches konkrete Sicherheitsrisiko dadurch entsteht, obwohl SSH selbst korrekt konfiguriert ist. Was antwortest du?', options: ['Keins, SSH ist ja trotzdem verfügbar', 'Ohne diesen Befehl bleibt auf denselben VTY-Leitungen weiterhin unverschlüsseltes Telnet erlaubt - ein Angreifer könnte sich also trotz vorhandenem SSH per Telnet im Klartext anmelden', 'Der RSA-Schlüssel wird dadurch ungültig', 'Der lokale Benutzer wird automatisch gelöscht'], correct: 1, explanation: '"transport input ssh" schränkt die erlaubten Protokolle auf den VTY-Leitungen ein. Ohne diesen Befehl bleibt Telnet zusätzlich zu SSH erlaubt - SSH allein zu konfigurieren schließt die unsichere Telnet-Tür nicht automatisch.' },
    ],
  },
  [topicKey('fundamentals', 'vlsm')]: {
    title: 'VLSM',
    relatedTopics: [topicKey('fundamentals', 'subnetting'), topicKey('fundamentals', 'supernetting')],
    introPool: [
      'Wir müssen ein Netz in unterschiedlich große Subnetze aufteilen. Wie geht das nochmal?',
      'VLSM – wann spare ich damit wirklich Adressen?',
    ],
    samHelp: 'VLSM erlaubt unterschiedlich große Subnetze innerhalb desselben Netzes. Planung: größte Subnetze zuerst, kleinstmöglicher passender Präfix, Blöcke lückenlos aneinanderreihen.',
    questions: [],
  },
  [topicKey('fundamentals', 'supernetting')]: {
    title: 'Supernetting',
    relatedTopics: [topicKey('fundamentals', 'vlsm'), topicKey('fundamentals', 'routing')],
    introPool: [
      'Wann fasse ich mehrere kleine Netze zu einer Route zusammen?',
      'Supernetting – was ist dabei fachlich wichtig?',
    ],
    samHelp: 'Supernetting verkürzt den Netzanteil und fasst passende Netze zu einer größeren Route zusammen. Prüfe Nachbarschaft, Alignment und Adressraum. Ohne erlaubte Erweiterung dürfen keine Lücken oder fremden Netze eingeschlossen werden.',
    questions: [
      { id: 'super-1', difficulty: 'medium', text: 'Wir haben zwei /26-Netze. Kann ich daraus immer ein /25 machen?', options: ['Nein, Nachbarschaft und gültige /25-Ausrichtung müssen ebenfalls passen.', 'Ja, gleiche Präfixe reichen immer.', 'Ja, sofern beide Netze privat sind.'], correct: 0, explanation: 'Ein gültiges Geschwisterpaar muss benachbart sein und gemeinsam an einer /25-Grenze beginnen.' },
      { id: 'super-2', difficulty: 'hard', text: 'Warum kann eine Route Summary riskant sein, wenn sie einen fremdverwalteten Zwischenbereich einschließt?', options: ['Sie kann Verkehr für diesen Bereich fälschlich in unsere Richtung lenken.', 'Sie vergrößert automatisch die Bandbreite des fremden Netzes.', 'Sie löscht dessen MAC-Adressen.'], correct: 0, explanation: 'Die Summary behauptet Erreichbarkeit für den gesamten abgedeckten Bereich. Ohne Erlaubnis darf sie fremde Netze nicht einschließen.' },
      { id: 'super-3', difficulty: 'medium', text: 'Müssen beim Supernetting am Ende alle Routen in genau einem Netz stehen?', options: ['Nein, nicht exakt aggregierbare Netze dürfen separat bleiben.', 'Ja, sonst war die Berechnung falsch.', 'Ja, notfalls als 0.0.0.0/0.'], correct: 0, explanation: 'Ziel sind möglichst wenige fachlich korrekte Einträge. Eine unerlaubt breite Summary wäre schlechter als ein verbleibender Einzelbereich.' },
      { id: 'super-4', difficulty: 'hard', text: 'Was ist der Unterschied zwischen technisch möglich und sinnvoll bei einer Summary?', options: ['Die kleinste erlaubte Summary vermeidet unnötig eingeschlossene Bereiche.', '0.0.0.0/0 ist immer die sinnvollste Lösung.', 'Sinnvoll ist grundsätzlich das kürzeste denkbare Präfix.'], correct: 0, explanation: 'Eine technisch breite Abdeckung kann falsche Erreichbarkeit behaupten. Entscheidend ist die kleinste fachlich erlaubte Zusammenfassung.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'grundlagen')]: {
    title: 'Cisco IOS-Grundlagen',
    relatedTopics: [topicKey('cisco-packet-tracer', 'basic-device-configuration'), topicKey('cisco-packet-tracer', 'router-basics'), topicKey('fundamentals', 'routing')],
    introPool: [
      'Wie ist der Cisco IOS-Bootvorgang nochmal sortiert?',
      'Was ist der Unterschied zwischen running-config und startup-config?',
      'Kannst du mir die Unterschiede zwischen L2-Switch, Multilayer-Switch und Router kurz erklären?',
      'Woran erkenne ich am Prompt, in welchem IOS-Modus ich bin?',
    ],
    samHelp: 'Cisco IOS ist das Betriebssystem auf Cisco-Geräten. Boot: POST, Bootstrap, IOS laden, Konfiguration laden. Speicher: ROM (Bootstrap), Flash (IOS), NVRAM (startup-config), RAM (running-config). Konfigurationsmodi: User EXEC, Privileged EXEC, Global Config, Interface Config. Ein Multilayer-Switch kann zusätzlich zur Switch-Funktion auch routen.',
    questions: [
      { id: 'cisco-grund-1', difficulty: 'easy', text: 'Wo liegt die startup-config gespeichert?', options: ['RAM', 'ROM', 'NVRAM', 'Flash'], correct: 2, explanation: 'Die startup-config liegt im NVRAM und wird beim nächsten Start geladen.' },
      { id: 'cisco-grund-2', difficulty: 'medium', text: 'Warum reicht es nicht, nur die running-config zu ändern?', options: ['Die running-config liegt im flüchtigen RAM und geht ohne Speichern beim Neustart verloren', 'Die running-config kann gar nicht geändert werden', 'Änderungen werden automatisch ins ROM geschrieben'], correct: 0, explanation: 'Änderungen an der running-config sind erst dauerhaft, wenn sie mit "copy running-config startup-config" ins NVRAM übernommen werden.' },
      { id: 'cisco-grund-3', difficulty: 'medium', text: 'Welcher Prompt zeigt den Privileged EXEC Mode an?', options: ['Switch>', 'Switch#', 'Switch(config)#', 'Switch(config-if)#'], correct: 1, explanation: 'Der Prompt endet im Privileged EXEC Mode mit "#", im User EXEC Mode mit ">".' },
      { id: 'cisco-grund-4', difficulty: 'medium', text: 'Was passiert, wenn beim Booten kein ladbares IOS-Image gefunden wird?', options: ['Das Gerät startet den Setup Mode', 'Das Gerät landet im ROMMON', 'Das Gerät schaltet sich ab', 'Das Gerät lädt automatisch aus dem Internet'], correct: 1, explanation: 'Ohne ladbares IOS-Image startet das Gerät in den ROM Monitor (ROMMON), einem Notfallmodus im ROM.' },
      { id: 'cisco-grund-5', difficulty: 'hard', text: 'Ein Techniker sagt: "Ein Multilayer-Switch ist einfach nur ein schnellerer L2-Switch." Stimmt das?', options: ['Ja, er arbeitet nur auf Layer 2', 'Nein, er kann zusätzlich zwischen Subnetzen/VLANs routen', 'Nein, er ist reiner Layer-3-Router'], correct: 1, explanation: 'Ein Multilayer-Switch beherrscht Layer-2-Switching und Layer-3-Routing, deshalb kann er auch zwischen VLANs routen.' },
      { id: 'cisco-grund-6', difficulty: 'medium', text: 'Warum brauchst du bei einem fabrikneuen Gerät oft zuerst die Konsole?', options: ['Weil noch keine IP oder Remote-Zugang konfiguriert ist', 'Weil Ethernet immer langsamer als seriell ist', 'Weil SSH standardmäßig aktiviert ist'], correct: 0, explanation: 'Ein neues Gerät hat meist keine IP und keinen Fernzugriff; über den Konsolenport kannst du es lokal ersteinrichten.' },
      { id: 'cisco-grund-7', difficulty: 'medium', text: 'Was bedeutet "% Ambiguous command"?', options: ['Der Befehl ist unvollständig', 'Die Abkürzung passt auf mehrere Befehle', 'Der Befehl ist im aktuellen Modus ungültig', 'Die Eingabe enthält einen Tippfehler'], correct: 1, explanation: '"% Ambiguous command" bedeutet, dass die eingegebene Abkürzung nicht eindeutig ist und auf mehrere Befehle passt.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'basic-device-configuration')]: {
    title: 'Cisco Grund- & IP-Konfiguration',
    relatedTopics: [topicKey('cisco-packet-tracer', 'grundlagen'), topicKey('cisco-packet-tracer', 'router-basics')],
    introPool: [
      'Wie sichere ich einen neuen Switch in der Grundkonfiguration ab?',
      'Ich habe das Interface konfiguriert, aber es bleibt down. Woran liegt das meistens?',
      'Hostname, lokaler Benutzer, enable secret – in welcher Reihenfolge macht man das?',
    ],
    samHelp: 'Grundkonfiguration: "enable" → "configure terminal" → Hostname, Domain-Name, lokaler Benutzer, enable secret, line console/vty mit login local, ggf. no ip domain-lookup, Interface auswählen → IP + Maske → no shutdown. Danach prüfen mit "show ip interface brief" und speichern mit "copy running-config startup-config" (oder "write").',
    questions: [
      { id: 'cisco-basic-1', difficulty: 'easy', text: 'Welcher Befehl setzt den Hostnamen auf SW-Core?', options: ['name SW-Core', 'hostname SW-Core', 'set hostname SW-Core', 'sysname SW-Core'], correct: 1, explanation: '"hostname <Name>" setzt den Gerätenamen in der Global Configuration.' },
      { id: 'cisco-basic-2', difficulty: 'medium', text: 'Du hast einen lokalen Benutzer "admin secret ..." angelegt. Wie aktivierst du die Anmeldung mit diesem Benutzer auf der Console?', options: ['line console 0 → login', 'line console 0 → login local', 'username admin login', 'console login local'], correct: 1, explanation: '"login local" auf der Line prüft gegen die lokale Benutzerdatenbank statt eines einzelnen Line-Passworts.' },
      { id: 'cisco-basic-3', difficulty: 'medium', text: 'Was bewirkt "no ip domain-lookup"?', options: ['Das Gerät löscht die IP-Adresse', 'Vertippte Befehle werden nicht mehr als Hostnamen per DNS aufgelöst', 'Es deaktiviert den Domainnamen', 'Es aktiviert SSH automatisch'], correct: 1, explanation: 'Ohne "no ip domain-lookup" versucht IOS, unbekannte Befehle als Hostnamen per DNS aufzulösen, was bei Tippfehlern zu Wartezeiten führt.' },
      { id: 'cisco-basic-4', difficulty: 'medium', text: 'Ein Routerinterface hat die korrekte IP-Adresse, "show ip interface brief" zeigt aber "administratively down". Was fehlt wahrscheinlich?', options: ['no shutdown', 'ip routing', 'clock rate', 'bandwidth'], correct: 0, explanation: 'Routerinterfaces sind standardmäßig administrativ deaktiviert; "no shutdown" aktiviert sie.' },
      { id: 'cisco-basic-5', difficulty: 'medium', text: 'Mit welchem Befehl führst du "show running-config" direkt aus dem Interface-Konfigurationsmodus aus?', options: ['do show running-config', 'run show', 'show run config', 'display running-config'], correct: 0, explanation: '"do <Befehl>" führt einen Privileged-EXEC-Befehl direkt aus einem Konfigurationsmodus aus, ohne vorher "exit" zu benutzen.' },
      { id: 'cisco-basic-6', difficulty: 'hard', text: 'Warum wird "enable secret" gegenüber "enable password" bevorzugt?', options: ['Es speichert das Passwort als Hash statt im Klartext', 'Es ist kürzer zu tippen', 'Es funktioniert nur bei Routern', 'Es ersetzt service password-encryption'], correct: 0, explanation: '"enable secret" speichert das Passwort verschlüsselt (gehasht); "enable password" speichert es im Klartext.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'router-basics')]: {
    title: 'Router-Grundlagen',
    relatedTopics: [topicKey('cisco-packet-tracer', 'static-routing'), topicKey('fundamentals', 'routing')],
    introPool: [
      'Wie entscheidet ein Router, wohin ein Paket geschickt wird?',
      'Was ist die Longest Prefix Match?',
    ],
    samHelp: 'Ein Router verbindet Netze und leitet Pakete anhand der Ziel-IP und der Routing-Tabelle weiter. Die Routing-Tabelle enthält Zielnetz, Next Hop, Ausgangsschnittstelle und Metrik. Bei mehreren passenden Einträgen gewinnt die längste Präfixmaske.',
    questions: [],
  },
  [topicKey('cisco-packet-tracer', 'static-routing')]: {
    title: 'Statisches Routing',
    relatedTopics: [topicKey('cisco-packet-tracer', 'router-basics'), topicKey('fundamentals', 'routing')],
    introPool: [
      'Wann setzt man eine statische Route statt eines dynamischen Protokolls ein?',
      'Was braucht eine statische Route mindestens?',
    ],
    samHelp: 'Statische Routen werden manuell eingetragen. Sie brauchen Zielnetz, Subnetzmaske und Next Hop (oder Ausgangsschnittstelle). Die Default Route 0.0.0.0/0 greift, wenn keine spezifischere Route passt.',
    questions: [],
  },
};
