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
    try {
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
    } catch {
      return null;
    }
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
  let firstTopic = pickWeakestTopic(topics, semanticHistory, employee);
  const session = readSession();
  const history = readHistory();
  const conversationSeed = {
    conversationId: `conv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    employee,
    semanticHistory,
    lastResult: null,
  };
  let topicState = ensureTopicState(session, firstTopic.key);
  let question = pickQuestionForTopic(firstTopic.key, topicState, { questions: [] }, history, {
    conversation: conversationSeed,
    questionIndex: 0,
    employee,
    topicsByKey,
  });
  if (!question) {
    for (const fallbackTopic of topics.filter((topic) => topic.key !== firstTopic.key)) {
      const fallbackState = ensureTopicState(session, fallbackTopic.key);
      const fallbackQuestion = pickQuestionForTopic(fallbackTopic.key, fallbackState, { questions: [] }, history, {
        conversation: conversationSeed,
        questionIndex: 0,
        employee,
        topicsByKey,
      });
      if (fallbackQuestion) {
        firstTopic = fallbackTopic;
        topicState = fallbackState;
        question = fallbackQuestion;
        break;
      }
    }
  }
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

    recordSkillEvent(categoryId, topicId, question.concept || 'general', {
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
  [topicKey('information-security', 'security-fundamentals')]: {
    title: 'Grundlagen der Informationssicherheit',
    relatedTopics: [topicKey('information-security', 'security-objectives'), topicKey('information-security', 'pimo'), topicKey('information-security', 'opti'), topicKey('information-security', 'pdca'), topicKey('information-security', 'required-level')],
    introPool: ['Kannst du mir helfen, einen Vorfall ganzheitlich einzuordnen?', 'Ich verwechsle PIMO und OPTI noch. Wie gehst du dabei vor?', 'Warum gilt Informationssicherheit eigentlich als fortlaufender Prozess?'],
    samHelp: 'Informationssicherheit bedeutet: Vertraulichkeit, Integrität und Verfügbarkeit im geforderten Maß. Authentizität wird hier im Zusammenhang mit Integrität betrachtet. PIMO beschreibt die Elemente des Systems, OPTI die Arten von Maßnahmen. PDCA entwickelt die Sicherheit fortlaufend weiter.',
    questions: [
      { id: 'sec-fund-conv-1', difficulty: 'easy', text: 'Ein Kollege meint, Informationssicherheit schütze nur vor Hackern. Was fehlt in dieser Aussage?', options: ['Nichts', 'Auch Fehlbedienung, unberechtigter Zugriff, Manipulation, Ausfälle, Infrastruktur, Personal und Prozesse gehören dazu', 'Nur Datenschutz fehlt', 'Nur Firewalls fehlen'], correct: 1, explanation: 'Informationssicherheit betrachtet Informationen und Dienste ganzheitlich, unabhängig davon, ob ein Angriff, Fehler oder Ausfall die Ursache ist.' },
      { id: 'sec-fund-conv-2', difficulty: 'medium', text: 'Warum kann derselbe Vorfall mehrere Grundwerte verletzen?', options: ['Weil jeder Vorfall automatisch alle Grundwerte verletzt', 'Weil ein Ereignis unterschiedliche Wirkungen haben kann, etwa unbefugte Kenntnisnahme und Ausfall', 'Weil Grundwerte austauschbar sind', 'Das ist nicht möglich'], correct: 1, explanation: 'Bewertet werden die konkreten Wirkungen. Ein gestohlenes und gelöschtes Medium kann beispielsweise Vertraulichkeit und Verfügbarkeit beeinträchtigen.' },
      { id: 'sec-fund-conv-3', difficulty: 'medium', text: 'Warum ist Accountsharing auch ein Problem der Authentizität?', options: ['Weil nicht mehr eindeutig zugeordnet werden kann, wer gehandelt hat', 'Weil Accounts dadurch immer gelöscht werden', 'Weil Authentizität nur Verschlüsselung meint', 'Weil dadurch kein Netzwerk mehr verfügbar ist'], correct: 0, explanation: 'Authentizität betrifft Echtheit und Zuordenbarkeit und wird in diesem Kursmodell im Zusammenhang mit Integrität betrachtet.' },
      { id: 'sec-fund-conv-4', difficulty: 'medium', text: 'Was unterscheidet PIMO von OPTI?', options: ['PIMO beschreibt Elemente des Systems, OPTI Arten von Maßnahmen', 'PIMO beschreibt Maßnahmen, OPTI Geräte', 'Beide beschreiben dasselbe', 'PIMO gilt nur für Personen'], correct: 0, explanation: 'PIMO fragt WAS zum Gesamtsystem gehört. OPTI fragt WELCHE ART von Maßnahme eingesetzt wird.' },
      { id: 'sec-fund-conv-5', difficulty: 'hard', text: 'Ein Serverraum überhitzt. Wie ordnest du das als PIMO und OPTI ein?', options: ['PIMO materiell, OPTI technisch', 'PIMO infrastrukturell, OPTI infrastrukturell', 'PIMO organisatorisch, OPTI materiell', 'PIMO personell, OPTI technisch'], correct: 1, explanation: 'Der Serverraum und seine Umgebung sind infrastrukturelle Elemente; geeignete Kühlung ist eine infrastrukturelle Maßnahme.' },
      { id: 'sec-fund-conv-6', difficulty: 'hard', text: 'Warum endet Informationssicherheit nicht, nachdem ein System einmal abgesichert wurde?', options: ['Weil Risiken, Systeme und Anforderungen sich verändern und Maßnahmen geprüft sowie verbessert werden müssen', 'Weil PLAN nie abgeschlossen werden darf', 'Weil technische Maßnahmen wirkungslos sind', 'Weil nur Audits Sicherheit schaffen'], correct: 0, explanation: 'PDCA beschreibt kontinuierliche Planung, Umsetzung, Prüfung und Verbesserung.' },
      { id: 'sec-fund-conv-7', difficulty: 'hard', text: 'Warum braucht eine Lernplattform nicht zwingend dieselbe Verfügbarkeit wie ein 24/7 einsatzkritisches System?', options: ['Weil Lernplattformen keine Informationen enthalten', 'Weil das geforderte Maß vom Schutzbedarf und Zweck des Systems abhängt', 'Weil Verfügbarkeit nur für Server gilt', 'Weil maximale Sicherheit immer kostenlos ist'], correct: 1, explanation: 'Beide brauchen Verfügbarkeit, aber das erforderliche Niveau und der vertretbare Ressourceneinsatz unterscheiden sich.' },
      { id: 'sec-fund-conv-8', difficulty: 'medium', text: 'Welche Rolle spielt ein Administrator besonders im PDCA-Modell?', options: ['Er legt allein den Schutzbedarf fest', 'Er setzt viele geplante technische Maßnahmen in DO praktisch um und liefert Informationen für CHECK und ACT', 'Er ist ausschließlich für ACT zuständig', 'Er schreibt nur Vorschriften'], correct: 1, explanation: 'Administratoren setzen Sicherheitsmaßnahmen praktisch um; Planung, Prüfung und Verbesserung sind ein Zusammenspiel mehrerer Rollen.' },
    ],
  },
  [topicKey('information-security', 'security-legal-data')]: {
    title: 'Rechtliche Grundlagen, Datenschutz & Informationskategorien',
    relatedTopics: [topicKey('information-security', 'data-protection'), topicKey('information-security', 'art9-dsgvo'), topicKey('information-security', 'information-categories')],
    introPool: [
      'Ich habe hier eine Liste mit Namen und privaten Nummern. Wie hoch ist der Schutzbedarf mindestens?',
      'Ein Kollege meint, OFFEN bedeute öffentlich. Stimmt das?',
      'Wann ist eine Information eigentlich personenbezogen, wenn der Name nicht direkt drinsteht?',
    ],
    samHelp: 'Trenne drei Ebenen: Datenschutz (personenbezogen?), Schutzbereiche (SB1/SB2/SB3) und Geheimhaltung (Öffentlich/Offen/VS). Bei gemischten Daten gilt der höchste Schutzbereich. Need-to-know und Systemfreigabe begrenzen, was womit verarbeitet werden darf.',
    questions: [
      { id: 'sec-legal-conv-1', difficulty: 'easy', text: 'Wem oder was dient der Datenschutz primär?', options: ['Natürlichen Personen', 'Softwarelizenzen', 'Servern vor Ausfall', 'Militärischen Geheimnissen'], correct: 0, explanation: 'Datenschutz schützt natürliche Personen bei der Verarbeitung ihrer Daten.' },
      { id: 'sec-legal-conv-2', difficulty: 'medium', text: 'Eine Personalnummer steht allein in einer Liste. Ist das personenbezogen?', options: ['Nie', 'Immer, wenn sie einer Person zugeordnet werden kann', 'Nur zusammen mit dem Namen', 'Nur in einem Personalsystem'], correct: 1, explanation: 'Entscheidend ist die Zuordnung zu einer Person – direkt oder indirekt.' },
      { id: 'sec-legal-conv-3', difficulty: 'medium', text: 'Welche Daten sind typisch für BPersDat?', options: ['Name und Dienstgrad', 'Gesundheitsdiagnose', 'Dienstliche E-Mail-Adresse', 'Personalnummer'], correct: 1, explanation: 'Gesundheitsdaten sind besondere personenbezogene Daten und damit BPersDat.' },
      { id: 'sec-legal-conv-4', difficulty: 'medium', text: 'Eine Datei enthält Name (SB1), private Adresse (SB2) und ein Gesundheitsdatum (SB3). Welcher Schutzbereich gilt für die gesamte Datei?', options: ['SB1', 'SB2', 'SB3', 'Der niedrigste, damit der Umgang einfacher bleibt'], correct: 2, explanation: 'Bei gemischten Daten gilt der höchste enthaltene Schutzbereich.' },
      { id: 'sec-legal-conv-5', difficulty: 'medium', text: 'Was bedeutet „offene Informationen"?', options: ['Jeder darf sie sehen', 'Intern, nicht öffentlich, nicht als Verschlusssache eingestuft', 'Streng geheim', 'Ohne Urheber'], correct: 1, explanation: 'Offen heißt nicht klassifiziert, muss aber nicht öffentlich sein.' },
      { id: 'sec-legal-conv-6', difficulty: 'hard', text: 'Ein Dokument ist auf einem internen Portal als OFFEN verfügbar und wird unerlaubt auf Social Media hochgeladen. Was folgt daraus?', options: ['Es wird dadurch öffentlich', 'Es bleibt intern/dienstlich; die private Veröffentlichung war nicht erlaubt', 'Es wird automatisch VS-NfD', 'OFFEN bedeutet, dass jeder es veröffentlichen darf'], correct: 1, explanation: 'OFFEN bedeutet keine VS-Einstufung, aber nicht „öffentlich". Eine private Veröffentlichung ist keine offizielle Freigabe.' },
      { id: 'sec-legal-conv-7', difficulty: 'hard', text: 'Ein Mitarbeiter ist für VS-VERTRAULICH freigegeben, arbeitet aber nicht an einem bestimmten Vorgang. Darf er die zugehörige VS-V-Datei lesen?', options: ['Ja, die Freigabe reicht', 'Nein, es fehlt Need-to-know', 'Ja, wenn er sie im selben Gebäude öffnet', 'Nur außerhalb der Dienstzeit'], correct: 1, explanation: 'Need-to-know verlangt eine dienstliche Notwendigkeit für die konkrete Information.' },
      { id: 'sec-legal-conv-8', difficulty: 'hard', text: 'Ein System ist maximal für OFFEN zugelassen. Was gilt für eine VS-NfD-Datei?', options: ['Sie darf dort gespeichert werden, weil VS-NfD niedrig ist', 'Sie darf nicht gespeichert werden, weil sie die maximale Systemeinstufung übersteigt', 'Sie wird automatisch OFFEN', 'Systemfreigaben gelten nur für Personen, nicht für Daten'], correct: 1, explanation: 'Das System ist nur für OFFEN zugelassen. VS-NfD übersteigt diese Einstufung.' },
    ],
  },
  [topicKey('information-security', 'data-protection')]: { title: 'Datenschutz & Schutzbereiche', relatedTopics: [topicKey('information-security', 'security-legal-data'), topicKey('information-security', 'art9-dsgvo')], introPool: ['Was genau macht einen Datensatz personenbezogen?', 'Wie unterscheidest du APersDat und BPersDat?'], samHelp: 'Personenbezogene Daten betreffen eine identifizierte oder identifizierbare natürliche Person. BPersDat orientieren sich an Art. 9 DSGVO; APersDat sind allgemeine personenbezogene Daten.' },
  [topicKey('information-security', 'art9-dsgvo')]: { title: 'Art. 9 DSGVO', relatedTopics: [topicKey('information-security', 'security-legal-data'), topicKey('information-security', 'data-protection')], introPool: ['Welche Daten fallen unter die besonderen Kategorien?', 'Sind biometrische Daten immer Art. 9?'], samHelp: 'Art. 9 DSGVO nennt besondere Kategorien wie Gesundheitsdaten, politische Meinungen, religiöse Überzeugungen, Gewerkschaftszugehörigkeit und biometrische Daten zur eindeutigen Identifizierung.' },
  [topicKey('information-security', 'information-categories')]: { title: 'Informationskategorien', relatedTopics: [topicKey('information-security', 'security-legal-data')], introPool: ['Was ist der Unterschied zwischen öffentlich und offen?', 'Wie lautet die richtige Reihenfolge der VS-Stufen?'], samHelp: 'Öffentlich = offiziell veröffentlicht. Offen = nicht öffentlich, nicht VS. Die VS-Stufen lauten VS-NfD, VS-VERTRAULICH, GEHEIM, STRENG GEHEIM.' },
  [topicKey('information-security', 'security-incidents')]: {
    title: 'Informationssicherheitslücken, -verstöße, -vorkommnisse & Meldewesen',
    relatedTopics: [topicKey('information-security', 'security-breach'), topicKey('information-security', 'security-incident'), topicKey('information-security', 'incident-response')],
    introPool: [
      'Du findest eine Passwortliste unter einer Tastatur. Ist das schon ein Verstoß?',
      'Antivirus hat eine Datei gelöscht. Warum kann trotzdem ein Verstoß vorliegen?',
      'Warum ist eine einzelne Phishingmail meldewürdig?',
    ],
    samHelp: 'Lücke = Gefährdung, Verstoß = Regelwidrige Handlung, Vorkommnis = Sicherheit gefährdet. Lücke und Verstoß können jeweils ein Vorkommnis begründen. Meldungen gehen typischerweise an den ISB, der das CSOCBw einbinden kann.',
    questions: [
      { id: 'sec-inc-conv-1', difficulty: 'easy', text: 'Ein nicht benötigter USB-Port ist freigeschaltet, aber noch wurde kein Stick eingesteckt. Was liegt vor?', options: ['Verstoß', 'Lücke', 'Vorkommnis', 'Nichts'], correct: 1, explanation: 'Ein freigeschalteter USB-Port ist eine Gefährdung und damit eine Lücke. Ein Verstoß wäre das tatsächliche Anschließen.' },
      { id: 'sec-inc-conv-2', difficulty: 'medium', text: 'Ein Mitarbeiter gibt sein Passwort weiter. Was liegt vor?', options: ['Lücke', 'Verstoß', 'Vorkommnis', 'Nur ein Versehen'], correct: 1, explanation: 'Das Weitergeben eines Passworts ist eine regelwidrige Handlung und damit ein Verstoß.' },
      { id: 'sec-inc-conv-3', difficulty: 'medium', text: 'Wann liegt ein Informationssicherheitsvorkommnis vor?', options: ['Nur bei erfolgreichem Hackerangriff', 'Wenn die Sicherheit durch Lücke, Verstoß oder Kryptovorkommnis gefährdet oder beeinträchtigt wird', 'Nur bei Straftaten', 'Nur bei Datenschutzverstößen'], correct: 1, explanation: 'Ein Vorkommnis ist das übergeordnete Ereignis, bei dem die Sicherheit gefährdet oder beeinträchtigt ist.' },
      { id: 'sec-inc-conv-4', difficulty: 'medium', text: 'Wer ist im lokalen Meldewesen die zentrale Rolle?', options: ['CERTBw', 'ISB', 'CSOCBw', 'BAMAD'], correct: 1, explanation: 'Der ISB nimmt vor Ort die Erstbewertung vor und leitet bei Bedarf an das CSOCBw weiter.' },
      { id: 'sec-inc-conv-5', difficulty: 'medium', text: 'Welche Stelle erzeugt aus vielen Einzelmeldungen ein zentrales Lagebild?', options: ['CERTBw', 'CSOCBw', 'IT-Forensik', 'ADSB'], correct: 1, explanation: 'Das CSOCBw sammelt Meldungen und bewertet die Gesamtlage.' },
      { id: 'sec-inc-conv-6', difficulty: 'hard', text: 'Eine Phishingmail ist angekommen, aber noch nicht geöffnet. Warum trotzdem melden?', options: ['Damit andere gewarnt und der Vorfall früh gestoppt werden kann', 'Weil sie automatisch ein Verstoß ist', 'Weil sonst die Mailbox gelöscht wird', 'Weil jede Mail gemeldet werden muss'], correct: 0, explanation: 'Schon eine ungeöffnete Phishingmail ist eine Gefährdung; frühes Melden schützt andere.' },
      { id: 'sec-inc-conv-7', difficulty: 'hard', text: 'Der Virenschutz blockiert eine nicht genehmigte Datei. Warum kann trotzdem ein Verstoß vorliegen?', options: ['Weil der Nutzer die Software heruntergeladen hat', 'Weil Antivirus keine Software erkennt', 'Weil die Datei automatisch erlaubt ist', 'Weil kein Schaden entstanden ist'], correct: 0, explanation: 'Die Regelverletzung bleibt bestehen, auch wenn technische Schutzmaßnahmen den Schaden verhindern.' },
      { id: 'sec-inc-conv-8', difficulty: 'hard', text: 'Bei einer verdächtigen Mail mit vielen potenziell betroffenen Nutzern ist die beste Sofortmaßnahme:', options: ['Ignorieren, bis ein Schaden sichtbar ist', 'Alle Server sofort und ohne Absprache abschalten', 'Meldung an ISB und Warnung der Nutzer, nicht zu klicken', 'Alle betroffenen Mails sofort unwiderruflich löschen'], correct: 2, explanation: 'Meldung und gezielte Warnung schützen vor Folgeschäden, ohne Beweise zu zerstören oder überzutreiben.' },
    ],
  },
  [topicKey('information-security', 'security-breach')]: { title: 'Informationssicherheitslücke', relatedTopics: [topicKey('information-security', 'security-incidents'), topicKey('information-security', 'security-incident')], introPool: ['Wann ist eine Lücke keine Lücke mehr?', 'Kann eine Lücke ein Vorkommnis begründen?'], samHelp: 'Eine Informationssicherheitslücke liegt vor, wenn Vorgaben oder Maßnahmen unzureichend umgesetzt sind und ein Grundwert gefährdet werden kann. Ein Schaden muss noch nicht eingetreten sein.' },
  [topicKey('information-security', 'security-incident')]: { title: 'Informationssicherheitsvorkommnis', relatedTopics: [topicKey('information-security', 'security-incidents'), topicKey('information-security', 'security-breach')], introPool: ['Was ist der Unterschied zwischen Verstoß und Vorkommnis?', 'Kann ein Vorkommnis aus einer Lücke entstehen?'], samHelp: 'Ein Vorkommnis liegt vor, wenn die Informationssicherheit durch eine Lücke, einen Verstoß oder ein Kryptosicherheitsvorkommnis gefährdet oder beeinträchtigt wird.' },
  [topicKey('information-security', 'incident-response')]: { title: 'Incident Response', relatedTopics: [topicKey('information-security', 'security-incidents')], introPool: ['Was braucht eine gute Erstbewertung?', 'Wann ist CERTBw sinnvoll?'], samHelp: 'Erstbewertung sammelt Systeme, Informationskategorien, Nutzerhandlungen und bereits getroffene Maßnahmen. CERTBw hilft bei technischer Notfallreaktion, Forensik bei Ursachen und Beweisen, BAMAD bei extremistischen oder nachrichtendienstlichen Bezügen.' },
  [topicKey('information-security', 'security-threats-malware')]: {
    title: 'Gefährdungen, Angriffsmethoden & Schadsoftware',
    relatedTopics: [topicKey('information-security', 'malware'), topicKey('information-security', 'malware-types'), topicKey('information-security', 'attacks'), topicKey('information-security', 'malware-prevention'), topicKey('information-security', 'phishing')],
    introPool: [
      'Wann wird aus einer Bedrohung eine konkrete Gefährdung?',
      'Was ist der Unterschied zwischen Virus und Wurm?',
      'Ist eine CVE schon ein Exploit?',
      'Warum ist Pharming nicht dasselbe wie Phishing?',
    ],
    samHelp: 'Bedrohung plus passende Schwachstelle ergibt Gefährdung; realisiert sie sich, entsteht Schaden an Grundwerten. Virus braucht Wirt, Wurm verbreitet sich selbst. Botnetze koordinieren viele kompromittierte Geräte. CVE ist eine Kennung, kein Exploit. SQLi betrifft Datenbankabfragen, XSS den Browserkontext.',
    questions: [
      { id: 'sec-threat-conv-1', difficulty: 'easy', text: 'Wann entsteht aus einer Bedrohung eine konkrete Gefährdung?', options: ['Sobald sie benannt wird', 'Wenn sie auf eine passende Schwachstelle trifft', 'Erst nach einem Schaden', 'Nur bei Vorsatz'], correct: 1, explanation: 'Eine Bedrohung allein reicht nicht; die passende Schwachstelle macht sie wirksam.' },
      { id: 'sec-threat-conv-2', difficulty: 'easy', text: 'Was unterscheidet Virus und Wurm?', options: ['Virus braucht Wirt, Wurm verbreitet sich selbstständig', 'Wurm braucht Wirt, Virus verbreitet sich selbst', 'Beide sind identisch', 'Nur Viren sind Malware'], correct: 0, explanation: 'Der Virus hängt an einen Wirt; der Wurm verbreitet sich eigenständig.' },
      { id: 'sec-threat-conv-3', difficulty: 'medium', text: 'Was ist ein Botnetz?', options: ['Ein einzelner automatisierter Task', 'Viele koordinierte kompromittierte Geräte', 'Eine CVE-Liste', 'Ein Backupverbund'], correct: 1, explanation: 'Viele fremdgesteuerte Geräte bilden ein Botnetz.' },
      { id: 'sec-threat-conv-4', difficulty: 'medium', text: 'Welchen Grundwert greift DDoS primär an?', options: ['Verfügbarkeit', 'Vertraulichkeit', 'Integrität', 'Authentizität'], correct: 0, explanation: 'DDoS überlastet Dienste und macht sie unerreichbar.' },
      { id: 'sec-threat-conv-5', difficulty: 'medium', text: 'Was grenzt Pharming von Phishing ab?', options: ['Manipulierte Namensauflösung statt primär täuschender Nachricht', 'Pharming ist ein Virus', 'Phishing betrifft nur Strom', 'Es gibt keinen Unterschied'], correct: 0, explanation: 'Pharming verändert den Weg zum Ziel, Phishing täuscht typischerweise über Nachricht oder Webseite.' },
      { id: 'sec-threat-conv-6', difficulty: 'hard', text: 'Ist eine CVE automatisch ein Exploit?', options: ['Ja, CVE ist ein fertiger Angriffscode', 'Nein, CVE ist eine standardisierte Schwachstellenkennung', 'Ja, nur bekannte Schwachstellen haben CVEs', 'Nein, CVEs sind Botnetze'], correct: 1, explanation: 'CVE dient der eindeutigen Referenz und defensiven Bewertung, nicht dem direkten Angriff.' },
      { id: 'sec-threat-conv-7', difficulty: 'hard', text: 'Ein Mitarbeiter öffnet nach einer Täuschung unbewusst einen schädlichen Anhang. Wie ist die interne Beteiligung zu bewerten?', options: ['Als möglicher unbewusster Innentäter-Fall', 'Immer als vorsätzlicher Angriff', 'Nie sicherheitsrelevant', 'Als Pharming'], correct: 0, explanation: 'Innentäter können bewusst oder unbewusst zur Verteilung beitragen.' },
      { id: 'sec-threat-conv-8', difficulty: 'hard', text: 'Welche Aussage unterscheidet SQL Injection und XSS korrekt?', options: ['SQLi manipuliert Datenbankabfragen; XSS wirkt im Browser-/Session-Kontext', 'Beide sind Botnetze', 'XSS manipuliert Stromversorgung', 'SQLi ist eine CVE-Kennung'], correct: 0, explanation: 'SQLi zielt auf Datenbankinteraktion, XSS auf Ausführung fremden Codes im Browser.' },
    ],
  },
  [topicKey('information-security', 'malware')]: { title: 'Malware', relatedTopics: [topicKey('information-security', 'security-threats-malware'), topicKey('information-security', 'malware-types')], introPool: ['Was ist der Oberbegriff Malware?', 'Kann eine Schadsoftware mehrere Eigenschaften haben?'], samHelp: 'Malware ist der Oberbegriff für Schadsoftware. Programme können mehrere Merkmale kombinieren, etwa ein Wurm mit Ransomware-Payload.' },
  [topicKey('information-security', 'malware-types')]: { title: 'Malware-Arten', relatedTopics: [topicKey('information-security', 'security-threats-malware'), topicKey('information-security', 'malware')], introPool: ['Was unterscheidet Virus und Wurm?', 'Warum ist ein Trojaner kein Wurm?'], samHelp: 'Virus braucht Wirt; Wurm verbreitet sich selbst; Trojaner tarnt sich; Ransomware sperrt/verschlüsselt; Spyware sammelt; Rootkit tarnt; Backdoor öffnet Zugang; Bot ist automatisiert; Scareware täuscht Warnungen vor.' },
  [topicKey('information-security', 'attacks')]: { title: 'Angriffsmethoden', relatedTopics: [topicKey('information-security', 'security-threats-malware'), topicKey('information-security', 'phishing')], introPool: ['Welcher Grundwert wird bei DoS primär betroffen?', 'Was unterscheidet Phishing und Pharming?'], samHelp: 'DoS/DDoS zielt primär auf Verfügbarkeit. Phishing täuscht über Nachricht/Seite; Pharming manipuliert Namensauflösung; Spoofing täuscht Identität/Herkunft vor. Innentäter können bewusst oder unbewusst handeln.' },
  [topicKey('information-security', 'malware-prevention')]: { title: 'Malware-Prävention', relatedTopics: [topicKey('information-security', 'security-threats-malware')], introPool: ['Warum reicht eine Schutzmaßnahme nicht aus?', 'Was gehört zu Defense in Depth?'], samHelp: 'Defense in Depth setzt mehrere Maßnahmen übereinander: Updates, Backups, Awareness, Segmentierung, Least Privilege, Malware-Schutz.' },
  [topicKey('information-security', 'phishing')]: { title: 'Phishing', relatedTopics: [topicKey('information-security', 'security-threats-malware'), topicKey('information-security', 'attacks')], introPool: ['Was macht Spear-Phishing besonders?', 'Wie unterscheidet man Phishing und Pharming?'], samHelp: 'Phishing täuscht mit gefälschter Nachricht oder Seite. Spear-Phishing ist gezielt personalisiert. Pharming manipuliert die Namensauflösung.' },
  [topicKey('information-security', 'security-technical-measures')]: {
    title: 'Technische Schutzmaßnahmen',
    relatedTopics: [topicKey('information-security', 'firewall-types'), topicKey('information-security', 'allowlist-denylist'), topicKey('information-security', 'dmz'), topicKey('information-security', 'ids-ips')],
    introPool: [
      'Warum ist eine ACL nicht automatisch die ganze Firewall?',
      'Was unterscheidet stateless und stateful?',
      'Warum gehört ein öffentlicher Webserver in die DMZ?',
      'Wann ist ein IDS besser als ein IPS?',
    ],
    samHelp: 'Firewall ist der Oberbegriff; Paketfilter, Stateful Inspection und ALG sind Techniken. DMZ trennt öffentliche Dienste vom internen Netz. IDS erkennt und meldet, IPS kann aktiv blocken und dabei False Positives verursachen. VPN-Typen: Site-to-Site, End-to-Site, End-to-End. Authentisierung = Nachweis, Authentifizierung = Prüfung, Autorisierung = Rechte.',
    questions: [
      { id: 'sec-tech-conv-1', difficulty: 'easy', text: 'Was ist der Unterschied zwischen Firewall und Paketfilter?', options: ['Firewall und Paketfilter sind exakt dasselbe', 'Paketfilter ist eine Technik innerhalb einer Firewall', 'Eine Firewall besteht nur aus Paketfiltern', 'Eine ACL ist immer die gesamte Firewall'], correct: 1, explanation: 'Paketfilter ist eine mögliche Komponente, nicht gleich dem Gesamtkonzept Firewall.' },
      { id: 'sec-tech-conv-2', difficulty: 'easy', text: 'Was versteht eine Stateful Firewall besser als ein statischer Paketfilter?', options: ['Den Verbindungszustand', 'Den Inhalt von E-Mail-Anhängen', 'Die Farbe eines Kabels', 'Den Standort eines Nutzers'], correct: 0, explanation: 'Stateful Inspection merkt sich Verbindungen und erlaubt zugehörigen Rückverkehr temporär.' },
      { id: 'sec-tech-conv-3', difficulty: 'medium', text: 'Wofür ist ein Application Layer Gateway zuständig?', options: ['Anwendungsprotokolle und Inhalte prüfen', 'Physische Kabel verlegen', 'Passwörter vergeben', 'Alle Ports blockieren'], correct: 0, explanation: 'ALG prüft auf höheren Schichten als Paketfilter.' },
      { id: 'sec-tech-conv-4', difficulty: 'medium', text: 'Warum platziert man einen öffentlichen Webserver in eine DMZ?', options: ['Damit er schneller ist', 'Um eine Kompromittierung vom internen Netz abzuschirmen', 'Damit er keine Backups braucht', 'Weil die DMZ ihn automatisch unangreifbar macht'], correct: 1, explanation: 'Segmentierung begrenzt den möglichen Schadensradius.' },
      { id: 'sec-tech-conv-5', difficulty: 'medium', text: 'Was ist der entscheidende Unterschied zwischen IDS und IPS?', options: ['IDS blockt automatisch', 'IPS kann aktiv reagieren', 'IDS ist kein Sicherheitssystem', 'IPS kann nichts erkennen'], correct: 1, explanation: 'IPS kann zusätzlich zu Erkennung und Meldung Gegenmaßnahmen einleiten.' },
      { id: 'sec-tech-conv-6', difficulty: 'hard', text: 'Warum kann ein IPS legitimen Traffic blocken?', options: ['Weil es keine Regeln hat', 'Weil legitimer Traffic manchmal anomal wirkt', 'Weil es nur auf Layer 1 arbeitet', 'Weil es keine Logs liest'], correct: 1, explanation: 'False Positives sind ein Risiko automatischer Reaktion.' },
      { id: 'sec-tech-conv-7', difficulty: 'hard', text: 'Welcher VPN-Typ passt für zwei dauerhaft zu koppelnde Unternehmensstandorte?', options: ['End-to-Site', 'Site-to-Site', 'End-to-End', 'Peer-to-Peer'], correct: 1, explanation: 'Site-to-Site verbindet zwei Netze miteinander.' },
      { id: 'sec-tech-conv-8', difficulty: 'hard', text: 'Welche Reihenfolge ist korrekt?', options: ['Authentisierung → Authentifizierung → Autorisierung', 'Autorisierung → Authentifizierung → Authentisierung', 'Authentifizierung → Autorisierung → Authentisierung', 'Authentisierung = Autorisierung'], correct: 0, explanation: 'Zuerst Nachweis, dann Prüfung, dann Rechtevergabe.' },
    ],
  },
  [topicKey('information-security', 'firewall-types')]: { title: 'Firewall-Typen', relatedTopics: [topicKey('information-security', 'security-technical-measures'), topicKey('information-security', 'allowlist-denylist')], introPool: ['Was ist der Unterschied zwischen Paketfilter, Stateful Inspection und ALG?', 'Warum ist Firewall der Oberbegriff?'], samHelp: 'Paketfilter prüft Header; Stateful Inspection kennt Verbindungszustände; ALG prüft Anwendungsinhalte. Alle können Teil einer Firewall sein.' },
  [topicKey('information-security', 'allowlist-denylist')]: { title: 'Allowlist & Denylist', relatedTopics: [topicKey('information-security', 'security-technical-measures'), topicKey('information-security', 'firewall-types')], introPool: ['Wann ist eine Allowlist sicherer als eine Denylist?', 'Was ist der Unterschied zwischen Whitelist und Blacklist?'], samHelp: 'Allowlist erlaubt nur explizit Erlaubtes und ist damit strenger; Denylist blockiert nur bekannt Verbotenes. Whitelist/Blacklist sind alternative Bezeichnungen.' },
  [topicKey('information-security', 'dmz')]: { title: 'DMZ', relatedTopics: [topicKey('information-security', 'security-technical-measures'), topicKey('information-security', 'firewall-types')], introPool: ['Warum setzt man eine DMZ ein?', 'Was ist der Unterschied zwischen einstufiger und mehrstufiger DMZ?'], samHelp: 'Eine DMZ ist ein getrennter Netzwerkbereich für öffentlich erreichbare Dienste. Sie begrenzt Auswirkungen einer Kompromittierung auf das interne Netz.' },
  [topicKey('information-security', 'ids-ips')]: { title: 'IDS & IPS', relatedTopics: [topicKey('information-security', 'security-technical-measures'), topicKey('information-security', 'firewall-types')], introPool: ['Wann sollte ich ein IDS statt IPS verwenden?', 'Was ist ein False Positive?'], samHelp: 'IDS erkennt und meldet Angriffe; IPS kann zusätzlich aktiv blocken. Automatische Reaktion birgt das Risiko von False Positives.' },
  [topicKey('information-security', 'backup')]: { title: 'Backup', relatedTopics: [topicKey('information-security', 'security-technical-measures'), topicKey('information-security', 'availability')], introPool: ['Warum allein ein Backup nicht reicht?', 'Was gehört zu einer 3-2-1-Regel?'], samHelp: 'Backup schützt primär Verfügbarkeit und hilft bei Integrität. Es gehört zu Defense in Depth und muss getestet und sicher aufbewahrt werden.' },
  [topicKey('information-security', 'logging')]: { title: 'Logging', relatedTopics: [topicKey('information-security', 'security-technical-measures'), topicKey('information-security', 'incident-response')], introPool: ['Was macht Logging für die Incident-Erkennung?', 'Welche Logdaten sollten besonders geschützt werden?'], samHelp: 'Logging protokolliert sicherheitsrelevante Ereignisse, ermöglicht Nachvollziehbarkeit und ist Voraussetzung für Erkennung, Analyse und Beweissicherung.' },
  [topicKey('information-security', 'firewall-basics')]: { title: 'Firewall-Grundlagen', relatedTopics: [topicKey('information-security', 'security-technical-measures'), topicKey('information-security', 'firewall-types')], introPool: ['Was ist die Kernaufgabe einer Firewall?', 'Warum ist eine Firewall kein einzelnes Produkt?'], samHelp: 'Eine Firewall ist ein Sicherungssystem zur kontrollierten Kopplung von Netzen. Paketfilter, Stateful Inspection und ALG können ihre Komponenten sein.' },
  [topicKey('information-security', 'hardening')]: { title: 'Hardening', relatedTopics: [topicKey('information-security', 'security-technical-measures'), topicKey('information-security', 'firewall-basics')], introPool: ['Was bedeutet Hardening konkret?', 'Warum reduziert Hardening die Angriffsfläche?'], samHelp: 'Hardening reduziert die Angriffsfläche durch Deaktivieren ungenutzter Dienste, Ports und Funktionen, Updates, Berechtigungsrestriktionen und bewusste Konfiguration.' },
  [topicKey('information-security', 'security-objectives')]: { title: 'Grundwerte der Informationssicherheit', relatedTopics: [topicKey('information-security', 'security-fundamentals'), topicKey('information-security', 'authenticity')], introPool: ['Welche Grundwerte sind in diesem Fall betroffen?', 'Kann eine Maßnahme mehrere Grundwerte unterstützen?'], samHelp: 'Vertraulichkeit, Integrität und Verfügbarkeit werden im geforderten Maß betrachtet. Vorfälle und Maßnahmen können mehrere Grundwerte betreffen.' },
  [topicKey('information-security', 'confidentiality')]: { title: 'Vertraulichkeit', relatedTopics: [topicKey('information-security', 'security-objectives')], introPool: ['Wer darf diese Information sehen?'], samHelp: 'Vertraulichkeit schützt vor unbefugter Informationsgewinnung.', questions: [{ id: 'sec-conf-conv-1', difficulty: 'medium', text: 'Ein Mitarbeiter kann einen Ordner lesen, den er nicht sehen dürfte. Welcher Grundwert ist primär betroffen?', options: ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit'], correct: 0, explanation: 'Unberechtigte Kenntnisnahme verletzt die Vertraulichkeit.' }] },
  [topicKey('information-security', 'integrity')]: { title: 'Integrität', relatedTopics: [topicKey('information-security', 'security-objectives'), topicKey('information-security', 'authenticity')], introPool: ['Wurde eine Information unzulässig verändert?'], samHelp: 'Integrität schützt vor unbefugten oder unzulässigen Veränderungen und macht Veränderungen erkennbar.', questions: [{ id: 'sec-int-conv-1', difficulty: 'medium', text: 'Eine Konfiguration wurde unberechtigt geändert. Welcher Grundwert ist primär betroffen?', options: ['Integrität', 'Verfügbarkeit', 'Vertraulichkeit'], correct: 0, explanation: 'Die unzulässige Veränderung verletzt die Integrität.' }] },
  [topicKey('information-security', 'availability')]: { title: 'Verfügbarkeit', relatedTopics: [topicKey('information-security', 'security-objectives')], introPool: ['Ist der Dienst zum benötigten Zeitpunkt nutzbar?'], samHelp: 'Verfügbarkeit betrachtet die gesamte Dienstkette, nicht nur einen laufenden Server.', questions: [{ id: 'sec-avail-conv-1', difficulty: 'medium', text: 'Der Server läuft, aber die einzige Verbindung ist ausgefallen. Ist der Dienst verfügbar?', options: ['Ja, weil der Server läuft', 'Nein, weil die erforderliche Nutzung nicht möglich ist', 'Nur wenn kein Backup existiert'], correct: 1, explanation: 'Die gesamte Kette zur zugesicherten Nutzung muss verfügbar sein.' }] },
  [topicKey('information-security', 'authenticity')]: { title: 'Authentizität', relatedTopics: [topicKey('information-security', 'integrity')], introPool: ['Kannst du eindeutig sagen, wer gehandelt hat?'], samHelp: 'Authentizität betrifft Echtheit und Zuordenbarkeit und wird hier im Zusammenhang mit Integrität behandelt.' },
  [topicKey('information-security', 'isms')]: { title: 'ISMS Bw', relatedTopics: [topicKey('information-security', 'pdca'), topicKey('information-security', 'pimo'), topicKey('information-security', 'opti')], introPool: ['Warum ist ein ISMS kein einzelnes Produkt?'], samHelp: 'Ein ISMS organisiert Informationssicherheit systematisch und kontinuierlich.' },
  [topicKey('information-security', 'pimo')]: { title: 'PIMO', relatedTopics: [topicKey('information-security', 'opti')], introPool: ['Welches Element des Gesamtsystems ist betroffen?'], samHelp: 'PIMO beschreibt personelle, infrastrukturelle, materielle und organisatorische Elemente.' },
  [topicKey('information-security', 'opti')]: { title: 'OPTI', relatedTopics: [topicKey('information-security', 'pimo')], introPool: ['Welche Art von Maßnahme passt hier?'], samHelp: 'OPTI umfasst organisatorische, personelle, technische und infrastrukturelle Maßnahmen; materiell gehört nicht dazu.' },
  [topicKey('information-security', 'pdca')]: { title: 'PDCA', relatedTopics: [topicKey('information-security', 'isms')], introPool: ['In welcher Phase befinden wir uns?'], samHelp: 'PLAN plant, DO setzt um, CHECK prüft, ACT verbessert und führt zurück zu PLAN.' },
  [topicKey('information-security', 'required-level')]: { title: 'Gefordertes Maß', relatedTopics: [topicKey('information-security', 'security-objectives')], introPool: ['Wie hoch muss das Schutzniveau hier wirklich sein?'], samHelp: 'Das geforderte Maß hängt von Schutzbedarf, Risiko und Aufgabe des konkreten Systems ab.' },
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
      { id: 'ivr-5', difficulty: 'hard', text: 'In welcher Topologie würdest du Inter-VLAN-Routing mit einem Router-on-a-Stick lösen und wann mit einem Multilayer-Switch per SVI?', options: ['RoaS, wenn kein L3-Switch verfügbar ist; SVI, wenn ein L3-Switch die VLANs direkt routen kann', 'Immer RoaS, weil SVI langsamer ist', 'Immer SVI, weil RoaS veraltet ist', 'Beide sind identisch aufgebaut'], correct: 0, explanation: 'Router-on-a-Stick kommt zum Einsatz, wenn nur ein externer Router verfügbar ist. Ein Multilayer-Switch kann das Routing intern über SVIs erledigen.' },
      { id: 'ivr-6', difficulty: 'hard', text: 'Ein Netz hat keine VLANs und der Router ist direkt mit dem Clientnetz verbunden. Wo konfigurierst du das Gateway?', options: ['Auf dem physischen Router-Interface', 'Auf einem Subinterface', 'Auf einer SVI', 'Auf einem Routed Port'], correct: 0, explanation: 'Ohne VLANs ist kein Subinterface oder SVI nötig - das Gateway sitzt auf dem physischen Router-Interface.' },
      { id: 'ivr-7', difficulty: 'hard', text: 'Ein Multilayer-Switch soll über eine Punkt-zu-Punkt-Verbindung zu einem Router weiterrouten. Welcher Interface-Typ ist hier typisch?', options: ['Routed Port (no switchport)', 'SVI', 'Router-Subinterface', 'Access-Port'], correct: 0, explanation: 'Bei einer reinen L3-Verbindung zwischen zwei Geräten verwendet man auf einem L3-Switch typischerweise einen Routed Port mit "no switchport".' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'vlan')]: {
    title: 'Cisco VLAN – Anlegen und Verwalten',
    relatedTopics: [topicKey('fundamentals', 'vlan-basics'), topicKey('cisco-packet-tracer', 'access-port')],
    introPool: [
      'Wie lege ich ein VLAN auf einem Cisco-Switch an?',
      'Was ist der Unterschied zwischen Normal Range und Extended Range?',
      'Wieso ist VLAN 1 besonders?',
    ],
    samHelp: 'Ein VLAN auf einem Cisco-Switch anlegen: "configure terminal" → "vlan <ID>" → "name <Name>" → "exit". VLAN 1 ist das Default VLAN und existiert automatisch. VLAN-IDs aus dem Normal Range (1-1005) werden in der Praxis fast immer verwendet. Innerhalb eines VLANs vermittelt der Switch auf Layer 2; zwischen VLANs ist ein Router oder Multilayer-Switch nötig.',
    questions: [
      { id: 'cisco-vlan-1', difficulty: 'easy', text: 'Welcher Befehl legt VLAN 50 mit dem Namen "Buchhaltung" an?', options: ['vlan 50 name Buchhaltung', 'vlan 50 → name Buchhaltung', 'interface vlan 50 → name Buchhaltung', 'create vlan 50 Buchhaltung'], correct: 1, explanation: 'Mit "vlan 50" wechselst du in den VLAN-Konfigurationsmodus, dort benennst du das VLAN mit "name Buchhaltung".' },
      { id: 'cisco-vlan-2', difficulty: 'medium', text: 'Welche VLAN-IDs solltest du in der Praxis normalerweise verwenden?', options: ['1002 - 1005', '1 - 1005 (Normal Range)', '1006 - 4094', 'Es ist egal'], correct: 1, explanation: 'Der Normal Range (1-1005) ist der praxisübliche Bereich, meist zweistellige, gut merkbare Nummern.' },
      { id: 'cisco-vlan-3', difficulty: 'medium', text: 'Ein Port wurde nie konfiguriert. In welchem VLAN befindet er sich?', options: ['In VLAN 99', 'In VLAN 1', 'In keinem VLAN', 'Im Management-VLAN'], correct: 1, explanation: 'Jeder Switchport gehört im Auslieferungszustand automatisch zum Default VLAN 1.' },
      { id: 'cisco-vlan-4', difficulty: 'hard', text: 'Zwei PCs stecken am selben Switch, einer in VLAN 10, der andere in VLAN 20. Was brauchen sie, um miteinander zu kommunizieren?', options: ['Nur den Switch', 'Einen Router oder Multilayer-Switch', 'Einen Trunk', 'Ein größeres VLAN'], correct: 1, explanation: 'Ein Switch leitet standardmäßig nicht zwischen VLANs weiter; dafür braucht es ein Layer-3-Gerät.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'access-port')]: {
    title: 'Cisco Access-Port',
    relatedTopics: [topicKey('cisco-packet-tracer', 'vlan'), topicKey('cisco-packet-tracer', 'trunk')],
    introPool: [
      'Wie bringe ich einen PC in ein bestimmtes VLAN?',
      'Access vs Trunk – wann verwende ich was?',
      'Welche typischen Fehler gibt es bei Access-Ports?',
    ],
    samHelp: 'Ein Access-Port verbindet ein einzelnes Endgerät mit genau einem VLAN: "interface <Port>" → "switchport mode access" → "switchport access vlan <ID>". Mehrere Ports gleichzeitig konfiguriert man mit "interface range". Kontrolle mit "show vlan brief" oder "show interfaces switchport". Häufigster Fehler: das VLAN existiert noch nicht oder der Port wurde versehentlich als Trunk konfiguriert.',
    questions: [
      { id: 'cisco-access-1', difficulty: 'easy', text: 'Wie viele VLANs bedient ein Access-Port?', options: ['Beliebig viele', 'Genau eines', 'Maximal zwei', 'Keines'], correct: 1, explanation: 'Ein Access-Port ist für genau ein VLAN gedacht.' },
      { id: 'cisco-access-2', difficulty: 'medium', text: 'Ein PC an fa0/5 soll VLAN 20 gehören. Welche Befehle sind nötig?', options: ['interface fa0/5 → switchport mode trunk → switchport access vlan 20', 'interface fa0/5 → switchport mode access → switchport access vlan 20', 'interface fa0/5 → vlan 20', 'vlan 20 → interface fa0/5'], correct: 1, explanation: 'Access-Modus setzen und dann das VLAN zuweisen.' },
      { id: 'cisco-access-3', difficulty: 'medium', text: '"switchport access vlan 30" zeigt keine Wirkung. Was prüfst du zuerst?', options: ['Ob das VLAN existiert', 'Ob der PC eingeschaltet ist', 'Ob das Kabel zu lang ist', 'Ob der Switch neu starten muss'], correct: 0, explanation: 'Ein VLAN muss zuerst mit "vlan <ID>" angelegt sein, bevor es einem Port zugewiesen werden kann.' },
      { id: 'cisco-access-4', difficulty: 'medium', text: 'Was ist der Vorteil von "interface range fa0/1-10"?', options: ['Es erstellt VLANs 1-10', 'Es wählt mehrere Ports gleichzeitig aus', 'Es aktiviert Trunking', 'Es löscht die Ports'], correct: 1, explanation: '"interface range" ermöglicht dieselbe Konfiguration für mehrere Ports ohne jeden einzeln zu wiederholen.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'trunk')]: {
    title: 'Cisco Trunk',
    relatedTopics: [topicKey('cisco-packet-tracer', 'access-port'), topicKey('cisco-packet-tracer', 'inter-vlan-routing')],
    introPool: [
      'Wozu braucht man einen Trunk?',
      'Was ist das Native VLAN?',
      'Warum reicht "allowed" nicht automatisch für "active"?',
    ],
    samHelp: 'Ein Trunk transportiert mehrere VLANs über eine Leitung und taggt Frames mit 802.1Q. Konfiguration: "interface <Port>" → "switchport mode trunk" → optional "switchport trunk allowed vlan <Liste>". "switchport trunk allowed vlan 10,20" ersetzt die Liste; mit "add" ergänzt man, mit "remove" entfernt man. Das Native VLAN (Standard VLAN 1) wird ungetaggt übertragen; beide Trunk-Enden müssen übereinstimmen. Verifizieren mit "show interfaces trunk".',
    questions: [
      { id: 'cisco-trunk-1', difficulty: 'medium', text: 'Wozu dient ein 802.1Q-Tag?', options: ['Verschlüsselung', 'Priorisierung', 'Kennzeichnung der VLAN-ID auf einem Trunk', 'MAC-Adressersetzung'], correct: 2, explanation: 'Das 802.1Q-Tag enthält die VLAN-ID, damit der empfangende Switch den Frame dem richtigen VLAN zuordnen kann.' },
      { id: 'cisco-trunk-2', difficulty: 'medium', text: 'Was ist das Native VLAN auf einem Trunk?', options: ['Das VLAN mit der höchsten ID', 'Das einzige VLAN, dessen Frames ungetaggt bleiben', 'Das VLAN für Broadcasts', 'Ein reserviertes Management-VLAN'], correct: 1, explanation: 'Frames des Native VLANs werden auf einem Trunk ohne 802.1Q-Tag übertragen.' },
      { id: 'cisco-trunk-3', difficulty: 'hard', text: 'Der Trunk erlaubt VLAN 30, aber "show interfaces trunk" zeigt es nicht als aktiv. Was fehlt?', options: ['Das Native VLAN', 'VLAN 30 existiert auf diesem Switch nicht', 'Der Trunk ist down', 'DTP ist deaktiviert'], correct: 1, explanation: '"allowed" bedeutet, dass das VLAN auf dem Trunk erlaubt ist. "active" bedeutet, dass es auch auf dem Switch existiert.' },
      { id: 'cisco-trunk-4', difficulty: 'hard', text: 'Was ist der Unterschied zwischen "switchport trunk allowed vlan 10,20" und "... add 30"?', options: ['Keiner', 'Der erste Befehl ersetzt die Liste, der zweite ergänzt', 'Der erste ergänzt, der zweite ersetzt', 'Beide löschen VLAN 30'], correct: 1, explanation: 'Ohne "add" wird die erlaubte Liste ersetzt. Mit "add" wird VLAN 30 zur bestehenden Liste hinzugefügt.' },
      { id: 'cisco-trunk-5', difficulty: 'medium', text: 'Warum sollte man Access- und Trunk-Modi explizit konfigurieren statt DTP zu vertrauen?', options: ['DTP funktioniert nie', 'DTP-Defaults können je nach Plattform variieren', 'Trunks funktionieren nur ohne DTP', 'DTP ist veraltet'], correct: 1, explanation: 'DTP-Verhalten hängt von Switch-Modell und IOS ab; explizite Modi sind vorhersagbarer.' },
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
      { id: 'ssh-conv-8', difficulty: 'hard', text: 'Ein reiner L2-Switch ist im Management-VLAN per SSH erreichbar, aber nicht aus einem entfernten Büro. Was prüfst du zuerst?', options: ['Ob eine statische Route fehlt', 'Ob "ip default-gateway" korrekt gesetzt ist', 'Ob der Switch "ip routing" unterstützt', 'Ob ein neuer RSA-Key nötig ist'], correct: 1, explanation: 'Ein L2-Switch routet selbst nicht. Für SSH-Erreichbarkeit aus anderen Netzen braucht er ein Default Gateway.' },
      { id: 'ssh-conv-9', difficulty: 'medium', text: '"show ip ssh" meldet "SSH disabled". Was sind die zwei wahrscheinlichsten Ursachen?', options: ['RSA-Schlüssel fehlt und/oder SSHv2 wurde nicht aktiviert', 'VTY-Lines fehlen', 'Das Passwort ist falsch', 'Das Kabel ist defekt'], correct: 0, explanation: 'SSH ist erst aktiv, wenn ein RSA-Schlüssel existiert und "ip ssh version 2" gesetzt ist. Fehlende VTY-Konfiguration verhindert dagegen keinen erfolgreichen SSH-Dienst, sondern das Login.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'dhcp')]: {
    title: 'DHCP Relay',
    relatedTopics: [
      topicKey('cisco-packet-tracer', 'router-basics'),
      topicKey('cisco-packet-tracer', 'inter-vlan-routing'),
      topicKey('cisco-packet-tracer', 'multilayer-switching'),
      topicKey('fundamentals', 'dhcp'),
    ],
    introPool: [
      'Clients bekommen keine IP aus einem entfernten Netz. Woran liegt das wohl?',
      'Was macht ein DHCP Relay Agent eigentlich konkret auf einem Cisco-Gerät?',
      'Wo genau gehört "ip helper-address" hin?',
    ],
    samHelp: 'DHCP Discover ist ein Broadcast, den Router normalerweise nicht weiterleiten. "ip helper-address" nimmt diesen Broadcast auf dem clientseitigen Gateway-Interface entgegen und leitet ihn als Unicast an den DHCP-Server weiter. Das Relay gehört auf das Gateway-Interface des Client-Netzes - physisches Interface, Subinterface oder SVI - und zeigt immer auf die IP-Adresse des DHCP-Servers.',
    questions: [
      { id: 'dhcp-conv-1', difficulty: 'easy', text: 'Ein Client sendet DHCP Discover als Broadcast. Warum kommt diese Anfrage nicht bei einem DHCP-Server in einem anderen Netz an?', options: ['Weil der DHCP-Server Broadcasts blockiert', 'Weil Router Broadcasts normalerweise nicht in andere Netze weiterleiten', 'Weil der Client die Server-IP nicht kennt', 'Weil DHCP nur im gleichen VLAN funktioniert'], correct: 1, explanation: 'Router trennen Broadcast-Domänen. DHCP Discover ist ein Broadcast und wird nicht automatisch ins andere Netz weitergeleitet.' },
      { id: 'dhcp-conv-2', difficulty: 'medium', text: 'Auf welchem Interface wird "ip helper-address" typischerweise konfiguriert?', options: ['Auf dem Interface Richtung DHCP-Server', 'Auf dem Layer-3-Interface, das Gateway des Client-Netzes ist', 'Global im Config-Modus', 'Auf einem L2-Switch-Access-Port'], correct: 1, explanation: 'Der Helper muss dort sitzen, wo die DHCP-Broadcasts aus dem Client-Netz ankommen - also auf dem clientseitigen Gateway-Interface.' },
      { id: 'dhcp-conv-3', difficulty: 'medium', text: 'Was bedeutet der Wert hinter "ip helper-address"?', options: ['Die eigene Gateway-IP des Interfaces', 'Die IP-Adresse des DHCP-Servers', 'Die Broadcast-Adresse des Client-Netzes', 'Die Subnetzmaske des Client-Netzes'], correct: 1, explanation: '"ip helper-address" zeigt auf die IP-Adresse des DHCP-Servers, an den der Relay-Agent die Anfrage weiterleiten soll.' },
      { id: 'dhcp-conv-4', difficulty: 'hard', text: 'Ein Router-on-a-Stick bedient VLAN 10 und VLAN 20. Beide sollen den zentralen DHCP-Server 10.0.0.2 nutzen. Auf welchen Interfaces muss "ip helper-address" stehen?', options: ['Nur auf fa0/0.10', 'Nur auf fa0/0.20', 'Auf fa0/0.10 und fa0/0.20', 'Auf dem physischen fa0/0'], correct: 2, explanation: 'Jedes Client-VLAN braucht auf seinem Subinterface einen eigenen Helper. Ein einzelner Helper reicht nicht für alle VLANs.' },
      { id: 'dhcp-conv-5', difficulty: 'hard', text: 'Der Helper ist korrekt konfiguriert, aber Clients bekommen trotzdem keine IP. "show ip route" zeigt keine Route zum Netz 10.0.0.0/24, in dem der DHCP-Server liegt. Was fehlt?', options: ['Ein zweiter DHCP-Server im Client-Netz', 'Eine funktionierende Route zum DHCP-Server-Netz', 'Ein neuer Helper auf dem Server-Interface', 'Die Subnetzmaske des Clients ist falsch'], correct: 1, explanation: 'DHCP Relay setzt voraus, dass der Relay-Agent den DHCP-Server routingmäßig erreichen kann. Ohne passende Route klappt die Weiterleitung nicht.' },
      { id: 'dhcp-conv-6', difficulty: 'hard', text: 'Ein Multilayer-Switch hat SVIs für VLAN 10 (Clients) und VLAN 20 (Server). Der Helper "ip helper-address 10.0.0.2" steht auf "interface vlan 20". Was ist das Problem?', options: ['Der DHCP-Server ist ausgefallen', 'Der Helper steht auf der falschen SVI - er muss auf interface vlan 10, dem Gateway des Client-VLANs, konfiguriert werden', 'VLAN 10 muss gelöscht werden', 'Die Subnetzmaske des DHCP-Servers ist falsch'], correct: 1, explanation: 'Der Helper gehört auf das Gateway-Interface DES CLIENT-NETZES. Auf VLAN 20 kommt kein DHCP-Broadcast aus VLAN 10 an.' },
      { id: 'dhcp-conv-7', difficulty: 'medium', text: 'Welchen Unterschied macht "show ip dhcp binding" im Vergleich zu "show ip dhcp pool"?', options: ['binding zeigt vergebene Leases, pool zeigt Poolstatus und verfügbare Adressen', 'binding zeigt Poolstatus, pool zeigt vergebene Leases', 'Beide zeigen das Gleiche', 'binding zeigt nur statische Reservierungen'], correct: 0, explanation: '"show ip dhcp binding" listet aktive Leases; "show ip dhcp pool" zeigt Poolstatistiken wie verfügbare und vergebenen Adressen.' },
      { id: 'dhcp-conv-8', difficulty: 'hard', text: 'Ein Client bekommt eine IP, aber kann andere Netze nicht erreichen. Was ist die wahrscheinlichste Ursache im DHCP-Pool?', options: ['Falsche DNS-Server-Adresse', 'Falsches Default Gateway', 'Falsche DHCP-Server-IP', 'Der Helper fehlt'], correct: 1, explanation: 'Wenn der Client eine Lease bekommt, funktionieren Helper und Server grundsätzlich. Kann er andere Netze nicht erreichen, stimmt meist das vom Pool vergebene Default Gateway nicht.' },
      { id: 'dhcp-conv-9', difficulty: 'hard', text: 'Warum sollte die Gateway-IP eines Netzes im DHCP-Pool ausgeschlossen werden?', options: ['Damit sie nicht dynamisch an einen Client vergeben wird', 'Weil Gateways keine IP-Adressen brauchen', 'Damit der Pool kleiner bleibt', 'Weil DHCP-Server Gateways ablehnen'], correct: 0, explanation: 'Wichtige statische Adressen wie das Default Gateway dürfen nicht dynamisch vergeben werden; daher werden sie mit "ip dhcp excluded-address" ausgeschlossen.' },
      { id: 'dhcp-conv-10', difficulty: 'hard', text: 'Wo gehört "ip helper-address" in einem Netz ohne VLANs, in dem ein Router direkt am Clientnetz hängt?', options: ['Auf dem physischen Router-Interface, das das Clientnetz erreicht', 'Auf einem Loopback-Interface', 'Auf dem DHCP-Server', 'Auf einem beliebigen Trunk'], correct: 0, explanation: 'Ohne VLANs ist das Gateway des Clientnetzes ein physisches Router-Interface. Der Helper muss dort sitzen, wo die DHCP-Broadcasts aus dem Clientnetz ankommen.' },
      { id: 'dhcp-conv-11', difficulty: 'hard', text: 'Ein Multilayer-Switch routet zwischen VLAN 10 (Clients) und VLAN 20 (Server). Der DHCP-Server liegt in VLAN 20. Wo muss der Helper stehen?', options: ['Auf interface vlan 10, dem Gateway des Client-VLANs', 'Auf interface vlan 20, dem Server-VLAN', 'Auf einem Access-Port in VLAN 10', 'Global im Config-Modus'], correct: 0, explanation: 'Der Relay-Agent muss das Gateway-Interface des Client-VLANs konfigurieren, also die SVI von VLAN 10.' },
      { id: 'dhcp-conv-12', difficulty: 'hard', text: 'Router-on-a-Stick bedient VLAN 10 und VLAN 20 über Subinterfaces. Wo konfigurierst du den DHCP-Helper für VLAN 10?', options: ['Auf dem physischen fa0/0', 'Auf fa0/0.10', 'Auf fa0/0.20', 'Global'], correct: 1, explanation: 'Jedes Client-VLAN hat sein eigenes Subinterface als Gateway. Der Helper gehört auf fa0/0.10 für VLAN 10.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'ospf')]: {
    title: 'OSPF Single-Area',
    relatedTopics: [
      topicKey('cisco-packet-tracer', 'router-basics'),
      topicKey('cisco-packet-tracer', 'static-routing'),
      topicKey('fundamentals', 'routing'),
      topicKey('fundamentals', 'subnetting'),
    ],
    introPool: [
      'Wieso reicht "show running-config" nicht, um sicher zu sagen, dass OSPF funktioniert?',
      'Was genau macht die Wildcard-Maske im OSPF network-Befehl?',
      'Wenn zwei Router verbunden sind, aber kein OSPF-Nachbar auftaucht - was prüfst du zuerst?',
    ],
    samHelp: 'OSPF ist ein link-state Protokoll. Mit "router ospf <ID>" startest du den Prozess; "network" oder "ip ospf" aktivieren Interfaces. Area und ggf. Authentifizierung müssen auf dem Verbindungsinterface passen. Die Process-ID ist lokal und muss nicht identisch sein. Verifizieren mit show ip ospf neighbor, show ip route ospf und show ip protocols.',
    questions: [
      { id: 'ospf-conv-1', difficulty: 'easy', text: 'Was bedeutet es, wenn OSPF als link-state Protokoll bezeichnet wird?', options: ['Router tauschen direkt die komplette Routingtabelle aus', 'Jeder Router kennt die Topologie und berechnet selbst den kürzesten Pfad', 'Router merken sich nur den nächsten Hop'], correct: 1, explanation: 'Bei link-state kennen die Router die Topologie und berechnen mit SPF den günstigsten Pfad, anstatt nur eine Entfernung zu merken.' },
      { id: 'ospf-conv-2', difficulty: 'medium', text: 'Müssen die OSPF-Prozess-IDs auf zwei Nachbarroutern identisch sein?', options: ['Ja, sonst entsteht keine Nachbarschaft', 'Nein, die Process-ID ist nur lokal relevant', 'Nur in Area 0'], correct: 1, explanation: 'Die OSPF-Prozess-ID ist lokal. Area, Subnetz und Authentifizierung müssen passen, nicht die Process-ID.' },
      { id: 'ospf-conv-3', difficulty: 'medium', text: 'Was macht die Wildcard-Maske im network-Befehl?', options: ['Sie legt die OSPF-Cost fest', 'Sie bestimmt, welche Bits der Interface-IP zur Auswahl herangezogen werden', 'Sie definiert die OSPF-Area'], correct: 1, explanation: 'Eine 0 in der Wildcard bedeutet „muss passen", eine 255 bedeutet „egal". So werden passende Interfaces ausgewählt.' },
      { id: 'ospf-conv-4', difficulty: 'hard', text: 'show ip ospf neighbor zeigt keinen Nachbarn. Beide Interfaces sind up und im selben Subnetz. Was prüfst du zuerst?', options: ['Ob auf beiden Seiten OSPF aktiv ist und die Area übereinstimmt', 'Ob die Prozess-IDs identisch sind', 'Ob der Switch zwischen den Routern VLAN 99 transportiert'], correct: 0, explanation: 'Zuerst prüft man, ob OSPF auf den Interfaces aktiv ist und beide Seiten in derselben Area sind. Process-IDs sind irrelevant.' },
      { id: 'ospf-conv-5', difficulty: 'hard', text: 'show ip ospf neighbor zeigt FULL, aber eine bestimmte Route fehlt. Was ist die wahrscheinlichste Ursache?', options: ['Das Zielnetz ist beim Nachbarn nicht korrekt in OSPF aktiviert', 'Das Kabel ist defekt', 'Die Prozess-ID ist falsch'], correct: 0, explanation: 'FULL bedeutet, die Nachbarschaft funktioniert. Damit Routen gelernt werden, muss das Zielnetz aber auch beim Nachbarn in OSPF aktiv sein.' },
      { id: 'ospf-conv-6', difficulty: 'medium', text: 'Was bewirkt passive-interface auf einem Interface?', options: ['OSPF wird komplett deaktiviert und das Netz verschwindet', 'Das Interface sendet keine OSPF-Hellos, bewirbt das Netz aber weiterhin', 'Das Interface wird heruntergefahren'], correct: 1, explanation: 'passive-interface verhindert Nachbarschaften auf dem Interface, das Netz wird aber weiter über OSPF angekündigt.' },
      { id: 'ospf-conv-7', difficulty: 'hard', text: 'Welche Voraussetzung muss für "default-information originate" gegeben sein?', options: ['Es reicht, den Befehl im OSPF-Prozess einzugeben', 'Eine statische Default Route muss bereits existieren', 'Das Interface muss passive sein'], correct: 1, explanation: '"default-information originate" verteilt eine bereits vorhandene Default Route über OSPF. Er erstellt sie nicht automatisch.' },
      { id: 'ospf-conv-8', difficulty: 'medium', text: 'Welcher Buchstabe kennzeichnet OSPF-Routen in show ip route?', options: ['S', 'C', 'O', 'D'], correct: 2, explanation: '"O" steht für OSPF, "S" für Static, "C" für Connected.' },
      { id: 'ospf-conv-9', difficulty: 'hard', text: 'Warum reicht "show running-config" allein nicht, um funktionierendes OSPF zu beweisen?', options: ['Weil die Konfiguration nur zeigt, was eingestellt ist, nicht ob Nachbarn und Routen wirklich funktionieren', 'Weil show running-config keine Wildcard-Masken anzeigt', 'Weil der Befehl OSPF deaktiviert'], correct: 0, explanation: 'Configured ≠ functioning. show ip ospf neighbor, show ip route ospf und show ip protocols zeigen den tatsächlichen Betriebszustand.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'acl')]: {
    title: 'Access Control Lists',
    relatedTopics: [
      topicKey('cisco-packet-tracer', 'router-basics'),
      topicKey('cisco-packet-tracer', 'multilayer-switching'),
      topicKey('cisco-packet-tracer', 'ssh'),
      topicKey('cisco-packet-tracer', 'nat'),
    ],
    introPool: [
      'Eine ACL ist korrekt geschrieben, aber funktioniert nicht. Woran liegt das?',
      'Warum ist die Reihenfolge in einer ACL so entscheidend?',
      'Wann nutzt man Standard-ACLs, wann Extended-ACLs?',
    ],
    samHelp: 'ACLs arbeiten nach First Match, dann Stop. Am Ende jeder ACL wirkt implicit deny. Standard ACLs filtern nur nach Source, Extended ACLs auch nach Protokoll, Destination und Port. ACLs müssen mit ip access-group an ein Interface/Richtung gebunden werden, VTY-Zugriffe dagegen mit access-class. Verifizieren mit show access-lists, show ip access-lists und show ip interface.',
    questions: [
      { id: 'acl-conv-1', difficulty: 'easy', text: 'Was bedeutet "First Match" bei einer ACL?', options: ['Alle Regeln werden geprüft und am Ende entschieden', 'Die erste passende Regel gewinnt und stoppt die Auswertung', 'Die letzte Regel gewinnt immer'], correct: 1, explanation: 'Sobald eine Regel passt, wird die Aktion ausgeführt und die restlichen Regeln übersprungen.' },
      { id: 'acl-conv-2', difficulty: 'easy', text: 'Was passiert, wenn ein Paket auf keine ACL-Regel passt?', options: ['Es wird erlaubt', 'Es wird verworfen', 'Der Router fragt den Admin'], correct: 1, explanation: 'Am Ende jeder ACL wirkt ein unsichtbarer deny any / deny ip any any.' },
      { id: 'acl-conv-3', difficulty: 'medium', text: 'Eine ACL ist korrekt geschrieben, aber zeigt keine Wirkung. Was prüfst du zuerst?', options: ['Ob sie an das richtige Interface/Richtung gebunden ist', 'Ob die Nummer im richtigen Bereich liegt', 'Ob implicit deny deaktiviert ist'], correct: 0, explanation: 'Eine ACL wirkt erst, wenn sie mit ip access-group oder access-class gebunden wird.' },
      { id: 'acl-conv-4', difficulty: 'medium', text: 'Wo liegt der Unterschied zwischen "ip access-group" und "access-class"?', options: ['Keiner', 'ip access-group bindet an Interfaces, access-class an VTY-Lines', 'access-class ist nur für Standard ACLs'], correct: 1, explanation: 'Interface-Traffic wird mit ip access-group gefiltert, Management-Zugriff auf VTYs mit access-class.' },
      { id: 'acl-conv-5', difficulty: 'medium', text: 'Warum sollte "permit ip any any" nicht vor spezifischen deny-Regeln stehen?', options: ['Weil es dann fast alles erlaubt und die denies nie erreicht werden', 'Weil es einen Syntaxfehler ergibt', 'Weil implicit deny trotzdem zuerst kommt'], correct: 0, explanation: 'First Match: permit any trifft fast alles, bevor deny-Regeln geprüft werden.' },
      { id: 'acl-conv-6', difficulty: 'hard', text: 'Ein erwarteter Datenfluss wird blockiert. "show access-lists" zeigt 0 matches für die vermutete Regel. Was sagt das?', options: ['Die Regel matcht nicht, möglicherweise ist Binding/Richtung/Match falsch', 'Der Router ist defekt', 'Implicit deny ist ausgeschaltet'], correct: 0, explanation: '0 matches deutet darauf hin, dass das Paket die Regel nicht erreicht - typische Ursachen sind falsche Bindung/Richtung oder ein falscher Match.' },
      { id: 'acl-conv-7', difficulty: 'hard', text: 'Wann brauchst du zwingend eine Extended ACL statt einer Standard ACL?', options: ['Wenn du nach Quell-IP filtern willst', 'Wenn du nach Ziel-IP, Protokoll oder Port filtern willst', 'Wenn du die ACL benennen willst'], correct: 1, explanation: 'Extended ACLs können Source, Destination, Protokoll und Port prüfen. Standard ACLs nur Source.' },
      { id: 'acl-conv-8', difficulty: 'hard', text: 'Aus Sicht eines Router-Interfaces bedeutet "in", dass das Paket...', options: ['...den Router über das Interface verlässt', '...auf diesem Interface in den Router hineinkommt', '...vom Client zum Server geschickt wird'], correct: 1, explanation: 'in/out beziehen sich immer auf das Router-Interface, nicht auf den Client. in = hinein in den Router.' },
      { id: 'acl-conv-9', difficulty: 'hard', text: 'Warum sollte eine Standard ACL eher näher am Ziel platziert werden?', options: ['Weil sie schneller ist', 'Weil sie nur nach Source filtern und sonst ungewollt viel Verkehr blockieren könnte', 'Weil Extended ACLs keine Richtung haben'], correct: 1, explanation: 'Da Standard ACLs nur die Quelle kennen, könnten sie nahe der Quelle zu viel blockieren. Deshalb zielnäher platzieren.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'packet-filter')]: {
    title: 'Packet Filter / Stateful Inspection',
    relatedTopics: [
      topicKey('cisco-packet-tracer', 'acl'),
      topicKey('cisco-packet-tracer', 'router-basics'),
      topicKey('cisco-packet-tracer', 'nat'),
    ],
    introPool: [
      'Was ist eigentlich der Unterschied zwischen einem stateless und einem stateful Paketfilter?',
      'Warum reicht eine ACL allein oft nicht für ausgehenden und zurückkommenden Verkehr?',
      'Warum ist "established" keine echte Stateful Inspection?',
    ],
    samHelp: 'Ein stateless Paketfilter prüft jedes Paket isoliert gegen ACL-Regeln - das ist das Thema ACL. Packet Filter geht einen Schritt weiter: ein stateful Filter merkt sich initiierte Verbindungen und erlaubt passenden Rückverkehr temporär. Cisco CBAC verwendet dafür ip inspect. WICHTIG: established in einer ACL prüft nur TCP-Flags, speichert aber keine echten Sessions.',
    questions: [
      { id: 'pf-conv-1', difficulty: 'easy', text: 'Was ist der entscheidende Unterschied zwischen stateless und stateful Paketfilter?', options: ['Stateless ist schneller, stateful langsamer', 'Stateless prüft jedes Paket isoliert, stateful kennt Verbindungszustände', 'Stateless verwendet ACLs, stateful verwendet keine ACLs'], correct: 1, explanation: 'Stateless wertet jedes Paket für sich anhand von Regeln; stateful merkt sich initiierte Verbindungen und erlaubt passenden Rückverkehr temporär.' },
      { id: 'pf-conv-2', difficulty: 'easy', text: 'Was ist das Hauptproblem eines statischen Paketfilters beim Rückverkehr?', options: ['Er ist zu langsam', 'Er weiß nicht, dass ein eingehendes Antwortpaket zu einer erlaubten Anfrage gehört', 'Er unterstützt keine TCP-Ports'], correct: 1, explanation: 'Weil der stateless Filter keine Verbindungen speichert, kann er Antwortpakete nicht automatisch der vorherigen Anfrage zuordnen.' },
      { id: 'pf-conv-3', difficulty: 'medium', text: 'Was bewirkt "ip inspect name INTERNET tcp"?', options: ['Es blockiert TCP-Verkehr', 'Es erstellt eine Inspection Rule, die TCP-Verbindungen überwacht', 'Es ersetzt die ACL'], correct: 1, explanation: 'ip inspect name definiert eine Inspection Rule für ein Protokoll; sie muss später an ein Interface gebunden werden.' },
      { id: 'pf-conv-4', difficulty: 'medium', text: 'Was ist der Unterschied zwischen "established" in einer ACL und echter Stateful Inspection?', options: ['Keiner', 'established prüft TCP-Flags, Stateful Inspection merkt sich echte Sessions', 'established funktioniert nur bei UDP'], correct: 1, explanation: 'established ist ein ACL-Flag-Check; CBAC/ip inspect verwaltet eine Session-State und erlaubt passenden Rückverkehr temporär.' },
      { id: 'pf-conv-5', difficulty: 'medium', text: 'Warum wird SPI typischerweise in Flussrichtung der ausgehenden Anfrage gebunden?', options: ['Weil eingehender Verkehr nicht inspiziert werden darf', 'Weil nur so die initiierte Session erfasst werden kann', 'Weil ACLs nur outbound funktionieren'], correct: 1, explanation: 'SPI muss die ausgehende Verbindung sehen, um den passenden Rückverkehr temporär zuzulassen.' },
      { id: 'pf-conv-6', difficulty: 'hard', text: 'Ein Client kann HTTP (TCP 80) nach draußen nutzen, aber DNS über UDP nicht. Was könnte fehlen?', options: ['Die ACL erlaubt kein TCP', 'Die Inspection Rule enthält nicht udp', 'Das Interface ist down'], correct: 1, explanation: 'ip inspect muss das Protokoll explizit enthalten. Für DNS über UDP muss auch "ip inspect name INTERNET udp" konfiguriert sein.' },
      { id: 'pf-conv-7', difficulty: 'hard', text: 'Welcher Show-Befehl zeigt aktive SPI-Sessions?', options: ['show ip inspect config', 'show ip inspect sessions', 'show access-lists'], correct: 1, explanation: 'show ip inspect sessions listet die aktiven, inspizierten Verbindungen.' },
      { id: 'pf-conv-8', difficulty: 'hard', text: 'Was passiert mit einer temporären SPI-Freigabe, wenn die Verbindung endet?', options: ['Sie bleibt für immer aktiv', 'Sie verschwindet nach Timeout oder Verbindungsende', 'Sie wird zu einer statischen ACL'], correct: 1, explanation: 'Stateful-Einträge sind temporär. Nach Verbindungsende oder Timeout entfernt der Router sie wieder.' },
      { id: 'pf-conv-9', difficulty: 'hard', text: 'Warum ersetzt SPI die ACL nicht vollständig?', options: ['Weil die ACL die Baseline-Policy definiert, die SPI ergänzt', 'Weil SPI keine Regeln kennt', 'Weil ACLs schneller sind'], correct: 0, explanation: 'Die ACL legt fest, welcher Verkehr grundsätzlich erlaubt ist; SPI merkt sich daraus resultierende Sessions und erlaubt passenden Rückverkehr.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'nat')]: {
    title: 'NAT / PAT / Port Forwarding',
    relatedTopics: [
      topicKey('cisco-packet-tracer', 'router-basics'),
      topicKey('cisco-packet-tracer', 'acl'),
      topicKey('cisco-packet-tracer', 'packet-filter'),
      topicKey('cisco-packet-tracer', 'static-routing'),
    ],
    introPool: [
      'Was ist der Unterschied zwischen Inside Local und Inside Global?',
      'Wann verwendet man statisches NAT, wann PAT?',
      'Warum reicht PAT nicht aus, um einen internen Server von außen erreichbar zu machen?',
    ],
    samHelp: 'NAT übersetzt private in globale Adressen. Inside Local ist die private Adresse eines internen Hosts, Inside Global die Adresse, unter der er nach außen erscheint. Interfaces müssen als inside/outside gekennzeichnet werden. Static NAT ist 1:1, Dynamic NAT nutzt einen Pool, PAT teilt sich globale Adressen über Ports. Port Forwarding leitet externe Ports an interne Server weiter. NAT ist keine Firewall.',
    questions: [
      { id: 'nat-conv-1', difficulty: 'easy', text: 'Was ist Inside Local?', options: ['Die öffentliche Adresse eines internen Hosts', 'Die private Adresse eines internen Hosts', 'Die Adresse eines externen Servers'], correct: 1, explanation: 'Inside Local ist die reale private Adresse des internen Geräts, z. B. 192.168.10.10.' },
      { id: 'nat-conv-2', difficulty: 'easy', text: 'Was ist Inside Global?', options: ['Die private Adresse eines internen Hosts', 'Die Adresse, unter der ein interner Host nach außen erscheint', 'Die öffentliche Adresse des externen Servers'], correct: 1, explanation: 'Inside Global ist die globale Adresse, unter der der interne Host extern sichtbar ist.' },
      { id: 'nat-conv-3', difficulty: 'medium', text: 'Welcher Befehl markiert das LAN-Interface als inside?', options: ['ip nat outside', 'ip nat inside', 'ip nat pool'], correct: 1, explanation: 'interface ... ip nat inside kennzeichnet das Interface zum internen Netz.' },
      { id: 'nat-conv-4', difficulty: 'medium', text: 'Wann ist statisches NAT sinnvoll?', options: ['Wenn viele Clients ins Internet sollen', 'Wenn ein interner Server unter einer festen öffentlichen Adresse erreichbar sein soll', 'Wenn keine öffentlichen IPs verfügbar sind'], correct: 1, explanation: 'Statisches NAT bietet eine feste 1:1-Zuordnung für Server, die dauerhaft erreichbar sein sollen.' },
      { id: 'nat-conv-5', difficulty: 'medium', text: 'Was ist der Hauptunterschied zwischen dynamischem NAT und PAT?', options: ['PAT übersetzt keine Ports', 'PAT erlaubt Port-Sharing und viele Clients auf wenige öffentliche IPs', 'Dynamisches NAT kann mehr gleichzeitige Verbindungen als PAT'], correct: 1, explanation: 'PAT teilt sich globale Adressen durch unterschiedliche Source-Ports; dynamisches NAT ohne overload belegt pro Verbindung eine eigene globale Adresse.' },
      { id: 'nat-conv-6', difficulty: 'hard', text: 'Was fehlt in "ip nat inside source list 1 interface g0/1", wenn mehrere Clients dieselbe globale IP nutzen sollen?', options: ['overload', 'static', 'pool'], correct: 0, explanation: 'overload aktiviert PAT, sodass mehrere Verbindungen dieselbe globale Adresse teilen können.' },
      { id: 'nat-conv-7', difficulty: 'hard', text: 'Warum reicht PAT nicht aus, um einen internen Webserver von außen erreichbar zu machen?', options: ['Weil PAT keine Ports kennt', 'Weil PAT nur ausgehende Verbindungen ermöglicht; für eingehende Dienste braucht man Port Forwarding', 'Weil der Server keine private IP hat'], correct: 1, explanation: 'PAT lässt interne Clients nach außen kommunizieren. Damit externe Clients einen internen Server erreichen, benötigt man typischerweise Port Forwarding.' },
      { id: 'nat-conv-8', difficulty: 'hard', text: 'Was prüfst du zuerst, wenn show ip nat translations leer bleibt?', options: ['Ob die Interfaces korrekt als inside/outside markiert sind und die Auswahl-ACL die Clients matcht', 'Ob der externe Server online ist', 'Ob der Router rebootet wurde'], correct: 0, explanation: 'Eine leere Translation Table zeigt, dass keine Pakete den NAT-Prozess erreichen. Ursachen sind oft falsche inside/outside-Kennzeichnung oder eine nicht passende ACL.' },
      { id: 'nat-conv-9', difficulty: 'hard', text: 'NAT verbirgt interne Adressen. Ist NAT deshalb eine Firewall?', options: ['Ja, NAT ersetzt eine Firewall', 'Nein, NAT ersetzt keine Firewall/ACL/SPI', 'Nur bei PAT'], correct: 1, explanation: 'NAT ändert Adressierung und kann Sichtbarkeit reduzieren, ist aber kein Ersatz für gezielte Sicherheitskontrollen.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'troubleshooting')]: {
    title: 'Cisco Troubleshooting',
    relatedTopics: [
      topicKey('cisco-packet-tracer', 'router-basics'),
      topicKey('cisco-packet-tracer', 'static-routing'),
      topicKey('cisco-packet-tracer', 'inter-vlan-routing'),
      topicKey('cisco-packet-tracer', 'multilayer-switching'),
      topicKey('cisco-packet-tracer', 'vlan'),
      topicKey('cisco-packet-tracer', 'trunk'),
    ],
    introPool: [
      'Ein PC bekommt keine IP. Welche Befehle nutzt du in welcher Reihenfolge?',
      'show running-config sieht korrekt aus, aber es funktioniert trotzdem nicht. Warum?',
      'Wie finde ich heraus, an welchem Port ein bestimmter Client hängt?',
    ],
    samHelp: 'Troubleshooting ist systematisch. Meist startest du mit "show ip interface brief", prüfst VLAN/Trunk mit "show vlan brief" und "show interfaces trunk", Routing mit "show ip route" und die Position eines Hosts mit "show mac address-table". "show running-config" zeigt nur, was konfiguriert ist - nicht, ob es funktioniert.',
    questions: [
      { id: 'trouble-conv-1', difficulty: 'easy', text: 'Ein Host hat keine Verbindung. Welcher Befehl ist meist der sinnvollste erste Schritt?', options: ['show running-config', 'show ip interface brief', 'show mac address-table', 'show arp'], correct: 1, explanation: '"show ip interface brief" zeigt sofort, ob das Interface up/down ist und ob es eine IP-Adresse hat.' },
      { id: 'trouble-conv-2', difficulty: 'medium', text: 'Die Konfiguration in "show running-config" sieht korrekt aus, aber der Verkehr läuft trotzdem nicht. Was bedeutet das?', options: ['Configured ist gleich functioning', 'Configured ≠ functioning - es muss noch geprüft werden, ob Nachbarn, Routen oder VLANs tatsächlich aktiv sind', 'show running-config zeigt keine Fehler'], correct: 1, explanation: 'Eine korrekte Konfiguration beweist noch keinen funktionierenden Betrieb. Betriebsbefehle zeigen den tatsächlichen Zustand.' },
      { id: 'trouble-conv-3', difficulty: 'medium', text: 'Ein Gerät scheint im falschen VLAN zu sein. Welche Befehle helfen?', options: ['show vlan brief und show interfaces switchport', 'show ip route', 'show ip interface brief'], correct: 0, explanation: 'Diese Befehle zeigen, welchem VLAN ein Port zugewiesen ist.' },
      { id: 'trouble-conv-4', difficulty: 'medium', text: 'VLAN 30 existiert und ist korrekt zugewiesen, aber Geräte in VLAN 30 erreichen das andere Gebäude nicht. Was prüfst du?', options: ['show interfaces trunk', 'show ip route', 'show arp'], correct: 0, explanation: 'Wenn VLAN 30 nicht in der allowed-VLAN-Liste des Trunks erlaubt ist, kommt der Verkehr nicht zum anderen Switch.' },
      { id: 'trouble-conv-5', difficulty: 'medium', text: 'Ein Router soll ein entferntes Netz erreichen, kennt es aber nicht. Welcher Befehl zeigt das?', options: ['show ip route', 'show vlan brief', 'show mac address-table'], correct: 0, explanation: '"show ip route" zeigt, ob eine Route zum Zielnetz existiert.' },
      { id: 'trouble-conv-6', difficulty: 'hard', text: 'Du kennst die MAC-Adresse eines Clients, aber nicht seinen Switch-Port. Welcher Befehl hilft?', options: ['show mac address-table', 'show arp', 'show ip interface brief'], correct: 0, explanation: '"show mac address-table" verknüpft MAC-Adressen mit dem Port, an dem sie gelernt wurden.' },
      { id: 'trouble-conv-7', difficulty: 'hard', text: 'Ein PC hat IP, Gateway und VLAN stimmen, aber das Internet ist nicht erreichbar. Welche Schicht kommt nach VLAN und Interface-Status als Nächstes?', options: ['Routing und Default Route prüfen', 'Ein neues Kabel verlegen', 'Den Switch neu starten'], correct: 0, explanation: 'Nachdem L2 und lokale IP stimmen, prüft man Routing - etwa mit "show ip route" oder einem Ping zum Default Gateway.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'grundkonfiguration')]: {
    title: 'Cisco Grundkonfiguration (L2-Switch-Einstieg)',
    relatedTopics: [
      topicKey('cisco-packet-tracer', 'grundlagen'),
      topicKey('cisco-packet-tracer', 'vlan'),
      topicKey('cisco-packet-tracer', 'access-port'),
      topicKey('cisco-packet-tracer', 'trunk'),
      topicKey('cisco-packet-tracer', 'basic-device-configuration'),
    ],
    introPool: [
      'Was macht einen L2-Switch aus der Grundkonfiguration heraus vollständig betriebsbereit?',
      'Wann ist ein Switch-Port "sicher"?',
      'Welche Fehler passieren typischerweise beim ersten Konfigurieren?',
    ],
    samHelp: 'Die Grundkonfiguration eines L2-Switches umfasst Hostname, Passwörter, lokale Benutzer, Console/VTY, VLANs, Access- und Trunk-Ports sowie ungenutzte Ports in einem Parking-VLAN mit shutdown. Am Ende wird die Konfiguration gespeichert. Dieses Topic bündelt den Einstieg; die späteren Einzeltopics vertiefen jeden Bereich.',
    questions: [
      { id: 'grundkonfig-conv-1', difficulty: 'easy', text: 'Welche Punkte gehören zu einer vollständigen L2-Switch-Grundkonfiguration?', options: ['Nur Hostname', 'Hostname, Passwörter, Benutzer, VLANs, Access/Trunk, unsichere Ports abschalten, speichern', 'Nur VLANs und Trunk'], correct: 1, explanation: 'Eine vollständige Grundkonfiguration sichert das Gerät und bringt es in den gewünschten Betriebszustand.' },
      { id: 'grundkonfig-conv-2', difficulty: 'medium', text: 'Warum werden ungenutzte Ports in ein Parking-VLAN gelegt und heruntergefahren?', options: ['Damit sie keine IP bekommen', 'Damit sie nicht versehentlich als Angriffs- oder Fehlerquelle genutzt werden können', 'Damit der Switch schneller bootet'], correct: 1, explanation: 'Nicht benötigte Ports sind potenzielle Sicherheitsrisiken und sollten isoliert und deaktiviert werden.' },
      { id: 'grundkonfig-conv-3', difficulty: 'medium', text: 'Ein Port wurde frisch als Access-Port VLAN 20 konfiguriert, aber "show vlan brief" zeigt ihn nicht in VLAN 20. Was prüfst du zuerst?', options: ['Ob VLAN 20 existiert', 'Ob der Switch neu gestartet wurde', 'Ob der Port administrativ down ist'], correct: 0, explanation: 'Ein VLAN muss zuerst angelegt sein, bevor ein Port ihm zugewiesen werden kann.' },
      { id: 'grundkonfig-conv-4', difficulty: 'medium', text: 'Wann sollte man "interface range" verwenden?', options: ['Nur für Trunks', 'Wenn mehrere Ports dieselbe Konfiguration bekommen sollen', 'Nur für Router-Interfaces'], correct: 1, explanation: '"interface range" spart Zeit, wenn mehrere Ports gleich behandelt werden sollen.' },
      { id: 'grundkonfig-conv-5', difficulty: 'hard', text: 'Nach einem Neustart ist die Konfiguration wieder weg. Was wurde vergessen?', options: ['Die VLAN-Datenbank wurde nicht gespeichert', 'Die running-config wurde nicht in die startup-config übernommen', 'Der Port wurde nicht aktiv'], correct: 1, explanation: 'Änderungen an der running-config liegen im RAM. Mit "copy running-config startup-config" bzw. "write" werden sie dauerhaft gesichert.' },
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
      { id: 'cisco-basic-7', difficulty: 'medium', text: 'Du hast Hostname und Passwörter konfiguriert, aber nach einem Neustart ist alles wieder weg. Was ist der wahrscheinlichste Fehler?', options: ['Es wurde kein Benutzer angelegt', 'Die running-config wurde nicht in die startup-config gespeichert', 'Das Interface war nicht aktiv', 'Es fehlte "no ip domain-lookup"'], correct: 1, explanation: 'Änderungen an der running-config im RAM gehen beim Neustart verloren, wenn sie nicht mit "copy running-config startup-config" dauerhaft gesichert werden.' },
      { id: 'cisco-basic-8', difficulty: 'medium', text: 'Was passiert, wenn du auf einer Line "login local" verwendest, aber vorher keinen lokalen Benutzer angelegt hast?', options: ['Die Line verwendet automatisch das Line-Passwort', 'Es existieren keine gültigen Zugangsdaten - die Authentifizierung schlägt fehl', 'Die Anmeldung ist ohne Passwort möglich', 'Das Gerät legt automatisch den Benutzer "admin" an'], correct: 1, explanation: '"login local" prüft gegen die lokale Benutzerdatenbank. Ohne Einträge gibt es keine gültigen Zugangsdaten.' },
      { id: 'cisco-basic-9', difficulty: 'medium', text: 'Warum ist "exec-timeout 0 0" aus Sicherheitssicht problematisch?', options: ['Es beendet die Sitzung sofort', 'Es schaltet den Timeout aus - eine offene Sitzung bleibt dauerhaft aktiv', 'Es speichert die Konfiguration nicht', 'Es deaktiviert den Konsolenzugang'], correct: 1, explanation: '"exec-timeout 0 0" deaktiviert den automatischen Inaktivitäts-Timeout und hinterlässt damit potenziell dauerhaft geöffnete Sessions.' },
      { id: 'cisco-basic-10', difficulty: 'hard', text: 'Ein Kollege sagt: "service password-encryption macht mein Line-Passwort kryptografisch sicher." Stimmt das?', options: ['Ja, es ist ein starker Hash', 'Nein, es ist nur eine reversible Verschleierung (Typ 7), kein echter Hash wie bei enable secret', 'Ja, aber nur auf Routern', 'Nein, es speichert das Passwort im Klartext'], correct: 1, explanation: '"service password-encryption" verschleiert Klartextpasswörter, bietet aber keine starke Hash-Sicherheit. "enable secret" ist deutlich besser.' },
      { id: 'cisco-basic-11', difficulty: 'medium', text: 'Ein frisch konfigurierter Switch soll aus dem Management-VLAN heraus per SSH erreichbar werden. Welcher Befehl fehlt dafür typischerweise als Letztes?', options: ['ip routing', 'ip default-gateway <Gateway-IP>', 'no shutdown auf dem physischen Port', 'crypto key generate rsa'], correct: 1, explanation: 'Ein reiner L2-Switch routet nicht selbst. Für Erreichbarkeit aus anderen Netzen benötigt er ein Default Gateway, nachdem die Management-SVI eingerichtet ist.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'router-basics')]: {
    title: 'Router-Grundlagen',
    relatedTopics: [topicKey('cisco-packet-tracer', 'static-routing'), topicKey('fundamentals', 'routing')],
    introPool: [
      'Wie entscheidet ein Router, wohin ein Paket geschickt wird?',
      'Was ist die Longest Prefix Match?',
      'Warum muss ich bei Router-Interfaces "no shutdown" eingeben?',
    ],
    samHelp: 'Ein Router verbindet Netze und leitet Pakete anhand der Ziel-IP und der Routing-Tabelle weiter. Router-Interfaces sind im Auslieferungszustand administrativ deaktiviert und brauchen "no shutdown". Die Routing-Tabelle enthält Zielnetz, Next Hop, Ausgangsschnittstelle und Metrik. Bei mehreren passenden Einträgen gewinnt zuerst der längste Präfix (Longest Prefix Match), bei Gleichstand die niedrigere Administrative Distance (Connected=0, Static=1, OSPF=110), und erst dann die Metrik.',
    questions: [
      { id: 'router-basics-1', difficulty: 'easy', text: 'Warum muss ein Router-Interface nach der IP-Konfiguration meist noch mit "no shutdown" aktiviert werden?', options: ['Weil sonst die IP-Adresse verloren geht', 'Weil Router-Interfaces im Auslieferungszustand administrativ deaktiviert sind', 'Weil sonst kein SSH funktioniert', 'Weil der Hostname noch fehlt'], correct: 1, explanation: 'Router-Interfaces sind standardmäßig administrativ down und müssen explizit mit "no shutdown" aktiviert werden.' },
      { id: 'router-basics-2', difficulty: 'medium', text: 'Ein Router kennt drei Routen zum Ziel: 10.0.0.0/8 (AD 1), 10.1.0.0/16 (AD 110), 10.1.1.0/24 (AD 110). Wohin wird ein Paket an 10.1.1.5 geschickt?', options: ['Über 10.0.0.0/8 wegen niedriger AD', 'Über 10.1.1.0/24 wegen Longest Prefix Match', 'Über 10.1.0.0/16 wegen OSPF', 'Zufällig'], correct: 1, explanation: 'Longest Prefix Match hat Vorrang: die /24-Route ist spezifischer als /16 und /8.' },
      { id: 'router-basics-3', difficulty: 'medium', text: 'Wann spielt Administrative Distance überhaupt eine Rolle?', options: ['Immer, bevor LPM greift', 'Nur wenn mehrere Routen für dasselbe Präfix existieren', 'Nur bei OSPF', 'Nur bei statischen Routen'], correct: 1, explanation: 'AD entscheidet erst, wenn mehrere Routen zum exakt gleichen Zielpräfix aus unterschiedlichen Quellen stammen.' },
      { id: 'router-basics-4', difficulty: 'hard', text: 'Was bedeutet "show ip interface brief" für g0/0: "administratively down/down"?', options: ['Das Interface ist aktiv', 'Das Interface ist wegen "shutdown" deaktiviert', 'Das Kabel ist nicht angeschlossen', 'Das Interface hat keine IP'], correct: 1, explanation: '"administratively down" heißt, dass das Interface per Konfiguration deaktiviert wurde - "no shutdown" ist nötig.' },
      { id: 'router-basics-5', difficulty: 'hard', text: 'Welcher Befehl zeigt am schnellsten IP-Adresse und Status aller Router-Interfaces?', options: ['show running-config', 'show ip interface brief', 'show interfaces trunk', 'show ip route'], correct: 1, explanation: '"show ip interface brief" listet Interface, IP, Status und Protocol kompakt.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'static-routing')]: {
    title: 'Statisches Routing',
    relatedTopics: [topicKey('cisco-packet-tracer', 'router-basics'), topicKey('fundamentals', 'routing')],
    introPool: [
      'Wann setzt man eine statische Route statt eines dynamischen Protokolls ein?',
      'Was braucht eine statische Route mindestens?',
      'Warum reicht eine Route in Hinrichtung nicht aus?',
      'Was ist der Unterschied zwischen konfiguriert und aktiv?',
    ],
    samHelp: 'Statische Routen werden manuell eingetragen: "ip route <Zielnetz> <Maske> <Next-Hop>". Sie brauchen Zielnetz, Subnetzmaske und Next Hop. Die Default Route 0.0.0.0/0 greift, wenn keine spezifischere Route passt. Wichtig: der Rückweg muss ebenfalls vorhanden sein, sonst kommen Antworten nicht an. Eine Route kann in der running-config sichtbar sein, aber nur in "show ip route" aktiv, wenn der Next Hop erreichbar ist.',
    questions: [
      { id: 'static-route-1', difficulty: 'easy', text: 'Wofür steht die Zeile "S 192.168.10.0/24 [1/0] via 10.0.0.2" in "show ip route"?', options: ['Eine Connected Route', 'Eine statische Route mit AD 1, Metrik 0', 'Eine OSPF-Route', 'Eine Default Route'], correct: 1, explanation: '"S" steht für Static. [1/0] bedeutet AD 1 und Metrik 0, "via" gibt den Next Hop an.' },
      { id: 'static-route-2', difficulty: 'medium', text: 'Eine statische Route ist in "show running-config" sichtbar, taucht aber nicht in "show ip route" auf. Was ist wahrscheinlich?', options: ['Der Next Hop ist nicht erreichbar', 'Die Syntax ist falsch', 'Das Zielnetz existiert nicht', 'IOS zeigt statische Routen nie an'], correct: 0, explanation: 'IOS installiert eine statische Route nur, wenn der Next Hop aktuell erreichbar ist.' },
      { id: 'static-route-3', difficulty: 'medium', text: 'Ein Ping von LAN A zu LAN B kommt an, aber die Antwort geht verloren. Was fehlt?', options: ['Der Hinweg ist falsch', 'Der Rückweg vom Ziel-Router zurück zu LAN A', 'Die Default Route', 'Die Subnetzmaske'], correct: 1, explanation: 'Bidirektionale Kommunikation braucht Hin- und Rückweg. Antworten gehen verloren, wenn der Ziel-Router keine Route zurück hat.' },
      { id: 'static-route-4', difficulty: 'medium', text: 'Wann greift die Default Route 0.0.0.0/0?', options: ['Immer zuerst', 'Nur wenn keine spezifischere Route passt', 'Nie, sie ist nur ein Platzhalter', 'Nur bei statischen Routen'], correct: 1, explanation: 'Die Default Route ist die unspezifischste Route und greift nur, wenn kein spezifischeres Präfix passt.' },
      { id: 'static-route-5', difficulty: 'hard', text: 'Warum brauchen direkt angeschlossene Netze keine statische Route?', options: ['Weil der Router sie automatisch als Connected-Routen kennt', 'Weil sie immer über die Default Route erreicht werden', 'Weil statische Routen nur für Remote-Netze erlaubt sind', 'Weil der Switch sie bereitstellt'], correct: 0, explanation: 'Sobald ein Interface korrekt adressiert und aktiv ist, erscheint das Netz automatisch als Connected-Route in der Routing-Tabelle.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'multilayer-switching')]: {
    title: 'Multilayer-Switch / SVI / Routed Port',
    relatedTopics: [topicKey('cisco-packet-tracer', 'vlan'), topicKey('cisco-packet-tracer', 'trunk'), topicKey('cisco-packet-tracer', 'inter-vlan-routing')],
    introPool: [
      'Was kann ein Multilayer-Switch, was ein normaler L2-Switch nicht kann?',
      'Wann verwende ich einen Routed Port statt eines Trunks?',
      'Warum reicht es nicht, einfach SVIs anzulegen?',
      'Was ist der Unterschied zwischen Router-on-a-Stick und SVI-Routing?',
    ],
    samHelp: 'Ein Multilayer-Switch kann wie ein normaler Switch VLANs/Trunks betreiben und zusätzlich mit "ip routing" zwischen VLANs routen. Pro VLAN legt man eine SVI an ("interface vlan <ID>" → "ip address" → "no shutdown"). Eine SVI braucht ein existierendes VLAN und mindestens einen aktiven L2-Port/Trunk dafür, sonst bleibt sie up/down. Einzelne physische Ports können mit "no switchport" zu Routed Ports (Layer-3-Ports) umgewandelt werden. Auf einem routenden MLS verwendet man für unbekannte Ziele eine Default Route ("ip route 0.0.0.0 0.0.0.0"), nicht "ip default-gateway". End-to-End-Tests zwischen Hosts unterschiedlicher VLANs beweisen funktionierendes Routing.',
    questions: [
      { id: 'mls-conv-1', difficulty: 'easy', text: 'Was ist eine SVI auf einem Multilayer-Switch?', options: ['Ein physischer Trunk-Port', 'Ein virtuelles Interface für ein VLAN, das als Gateway dient', 'Ein Router-on-a-Stick-Interface', 'Ein Access-Port'], correct: 1, explanation: 'Die SVI ("interface vlan <ID>") ist das virtuelle Gateway für genau ein VLAN.' },
      { id: 'mls-conv-2', difficulty: 'medium', text: 'Warum reichen konfigurierte SVIs allein nicht, um Inter-VLAN-Routing zu ermöglichen?', options: ['Sie müssen noch mit "no shutdown" aktiviert werden', 'Das globale Kommando "ip routing" muss zusätzlich aktiv sein', 'Es fehlt immer ein externer Router', 'SVIs können keine IP-Adressen haben'], correct: 1, explanation: 'Ohne "ip routing" routet der Multilayer-Switch nicht zwischen seinen SVIs.' },
      { id: 'mls-conv-3', difficulty: 'medium', text: 'Eine SVI "interface vlan 20" ist aktiv, bleibt aber up/down. Was prüfst du zuerst?', options: ['Ob "ip routing" aktiv ist', 'Ob VLAN 20 existiert und einen aktiven L2-Port/Trunk hat', 'Ob der Switch neu gestartet werden muss', 'Ob das Default Gateway korrekt ist'], correct: 1, explanation: 'Eine SVI braucht ein existierendes VLAN mit aktivem L2-Port/Trunk, um operativ up/up zu werden.' },
      { id: 'mls-conv-4', difficulty: 'medium', text: 'Was bewirkt "no switchport" auf einem Switch-Port?', options: ['Er wird gelöscht', 'Er wird von Layer-2 zu Layer-3 (Routed Port)', 'Er wird automatisch Trunk', 'Er bekommt VLAN 1'], correct: 1, explanation: '"no switchport" deaktiviert die Switchport-Funktion und ermöglicht eine IP-Konfiguration auf dem Port.' },
      { id: 'mls-conv-5', difficulty: 'medium', text: 'Wann ist ein Routed Port sinnvoller als ein Trunk?', options: ['Wenn mehrere VLANs über dieselbe Leitung sollen', 'Bei einer reinen Layer-3-Punkt-zu-Punkt-Verbindung', 'Wenn der Port ein Access-Port bleiben soll', 'Nie'], correct: 1, explanation: 'Ein Routed Port ist für reine L3-Verbindungen gedacht, ein Trunk für den Transport mehrerer VLANs.' },
      { id: 'mls-conv-6', difficulty: 'hard', text: 'Ein Host kann seine Gateway-IP anpingen, aber nicht Hosts in anderen VLANs. Was bedeutet das?', options: ['Inter-VLAN-Routing funktioniert einwandfrei', 'Nur die lokale SVI ist erreichbar; Routing zwischen VLANs ist noch nicht korrekt', 'Die VLANs existieren nicht', 'Der Switch ist defekt'], correct: 1, explanation: 'Ein Gateway-Ping testet nur die lokale Erreichbarkeit der SVI. End-to-End zwischen VLANs testet das eigentliche Routing.' },
      { id: 'mls-conv-7', difficulty: 'hard', text: 'Auf einem routenden Multilayer-Switch soll der Verkehr ins Internet über 203.0.113.1 laufen. Welcher Befehl ist richtig?', options: ['ip default-gateway 203.0.113.1', 'ip route 0.0.0.0 0.0.0.0 203.0.113.1', 'default-route 203.0.113.1', 'ip routing 203.0.113.1'], correct: 1, explanation: 'Bei aktivem "ip routing" wird eine Default Route verwendet. "ip default-gateway" ist für nicht-routende Switches.' },
      { id: 'mls-conv-8', difficulty: 'hard', text: 'Was ist der Hauptunterschied zwischen Router-on-a-Stick und Multilayer-Switch-Routing?', options: ['Es gibt keinen', 'Router-on-a-Stick nutzt externe Subinterfaces auf einem Router; Multilayer-Switch verwendet interne SVIs', 'Router-on-a-Stick braucht keinen Trunk', 'Multilayer-Switch kann keine statischen Routen verwenden'], correct: 1, explanation: 'Router-on-a-Stick löst Inter-VLAN-Routing extern mit Subinterfaces; der MLS löst es intern über SVIs.' },
    ],
  },
  [topicKey('cisco-packet-tracer', 'stp')]: {
    title: 'STP, PVST+, PortFast & BPDU Guard',
    relatedTopics: [topicKey('cisco-packet-tracer', 'vlan'), topicKey('cisco-packet-tracer', 'trunk')],
    introPool: [
      'Warum blockiert STP absichtlich einen Port?',
      'Woran erkenne ich, wer Root Bridge ist?',
      'PortFast auf einem Switch-Uplink - was ist das Problem?',
      'Was tun, wenn ein Port plötzlich "err-disabled" ist?',
    ],
    samHelp: 'STP verhindert Layer-2-Loops, indem es redundante Pfade logisch blockiert. Root Bridge = niedrigste Bridge ID (Priority + MAC). Jeder Nicht-Root-Switch hat genau einen Root Port, pro Segment einen Designated Port, überschüssige Pfade werden Alternate/Blocking. PortFast bringt Endgeräte-Ports sofort in Forwarding, BPDU Guard schaltet sie bei Empfang einer BPDU in err-disabled. Recovery: Ursache beseitigen, dann shutdown/no shutdown.',
    questions: [
      { id: 'stp-conv-1', difficulty: 'easy', text: 'Warum blockiert STP überhaupt Ports, wenn Redundanz doch gut ist?', options: ['Um Strom zu sparen', 'Um Layer-2-Loops und Broadcast-Storms zu verhindern, während die physische Redundanz erhalten bleibt', 'Weil Ports defekt sind', 'Weil VLANs blockiert werden müssen'], correct: 1, explanation: 'STP blockiert logisch, um Schleifen zu verhindern. Fällt ein aktiver Pfad aus, wird ein blockierter Ersatzweg aktiviert.' },
      { id: 'stp-conv-2', difficulty: 'medium', text: 'Welche Portrolle hat ein Nicht-Root-Switch auf seinem besten Pfad zur Root Bridge?', options: ['Designated Port', 'Root Port', 'Alternate Port', 'Blocking Port'], correct: 1, explanation: 'Genau ein Port pro Nicht-Root-Switch wird Root Port - derjenige mit dem günstigsten Pfad zur Root Bridge.' },
      { id: 'stp-conv-3', difficulty: 'medium', text: 'Was bedeutet es, wenn ein Port in "show spanning-tree" die Rolle "Altn" und den Status "BLK" hat?', options: ['Der Port ist defekt', 'Es ist ein blockierter Ersatzweg (Alternate), der bei Bedarf aktiviert werden kann', 'Der Port ist die Root Bridge', 'Der Port ist ein Root Port'], correct: 1, explanation: '"Altn" ist die Rolle im Spannbaum, "BLK" der aktuelle Zustand. So wird eine Schleife verhindert.' },
      { id: 'stp-conv-4', difficulty: 'medium', text: 'Warum darf man PortFast normalerweise nicht auf einem Switch-zu-Switch-Uplink aktivieren?', options: ['Weil der Port dann langsamer wird', 'Weil der Port sofort in Forwarding wechselt und eine mögliche Schleife nicht mehr durch die STP-Zwischenzustände abgefedert wird', 'Weil PortFast Trunks deaktiviert', 'Weil Uplinks keine BPDUs senden'], correct: 1, explanation: 'PortFast überspringt Listening/Learning. Auf Uplinks könnte eine Schleife sofort aktiv werden und einen Broadcast-Storm auslösen.' },
      { id: 'stp-conv-5', difficulty: 'medium', text: 'Was passiert, wenn ein PortFast-Port mit aktiviertem BPDU Guard eine BPDU empfängt?', options: ['Nichts', 'Der Port wird in den Zustand err-disabled versetzt', 'Der Port wird schneller', 'BPDU Guard deaktiviert STP'], correct: 1, explanation: 'BPDU Guard deaktiviert einen PortFast-Port sofort, wenn er eine BPDU empfängt - das deutet auf einen versehentlich angeschlossenen Switch hin.' },
      { id: 'stp-conv-6', difficulty: 'medium', text: 'Ein Port zeigt "err-disabled". Was ist die richtige Reihenfolge?', options: ['shutdown, no shutdown, dann Ursache suchen', 'Ursache beseitigen, dann shutdown, dann no shutdown, dann verifizieren', 'Sofach den Port ersetzen', 'BPDU Guard global abschalten'], correct: 1, explanation: 'Zuerst muss die Ursache behoben werden, sonst wird der Port nach dem Recover sofort wieder err-disabled.' },
      { id: 'stp-conv-7', difficulty: 'hard', text: 'Warum kann VLAN 10 in einem PVST+-Netz eine andere Root Bridge haben als VLAN 20?', options: ['Weil PVST+ pro VLAN einen eigenen Spanning Tree berechnet', 'Weil VLANs unterschiedliche MAC-Adressen haben', 'Weil STP zufällig arbeitet', 'Das ist bei PVST+ nicht möglich'], correct: 0, explanation: 'PVST+ (Per-VLAN Spanning Tree) berechnet für jedes VLAN einen eigenen Baum, daher können die Root Bridges pro VLAN unterschiedlich sein.' },
      { id: 'stp-conv-8', difficulty: 'hard', text: 'Ein PC-Port mit PortFast + BPDU Guard ist err-disabled. Ein anderer Switch wurde versehentlich an diesen Port angeschlossen. Was ist die sauberste Lösung?', options: ['Einfach shutdown/no shutdown', 'Den angeschlossenen Switch entfernen oder den Port als normalen Trunk/Switch-Port konfigurieren, PortFast/BPDU Guard entfernen, dann recover', 'BPDU Guard global deaktivieren', 'STP komplett abschalten'], correct: 1, explanation: 'Die Ursache muss beseitigt werden. Danach kann der Port mit shutdown/no shutdown reaktiviert werden.' },
      { id: 'stp-conv-9', difficulty: 'hard', text: 'Was ist der Unterschied zwischen Root ID und Bridge ID in "show spanning-tree"?', options: ['Keiner', 'Root ID beschreibt die Root Bridge, Bridge ID beschreibt den aktuellen Switch', 'Root ID ist die MAC-Adresse, Bridge ID die Priority', 'Bridge ID gehört immer zur Root Bridge'], correct: 1, explanation: 'Root ID zeigt Informationen über die gewählte Root Bridge, Bridge ID beschreibt den eigenen Switch.' },
    ],
  },
};
