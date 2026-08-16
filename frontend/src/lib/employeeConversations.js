import { ACADEMY_TOPICS, topicKey } from './academyTopics.js';
import { getTopicProgress, getFullTopic } from './academyProgress.js';
import { topicOverallProgress, isTopicMastered, applyConversationPractice } from './academyEngine.js';
import { randomConversationPartner } from './officeWorld.js';
import { readAcademyMode, LEARNING_MODES } from './academyMode.js';
import { OSI_LAYERS } from './academyLessons/osi.js';
import { SKILL_DIMENSION, SKILL_SOURCE, recordSkillEvent } from './skillTree.js';
import { recordConversationResult, resetConversationMastery } from './conversationMastery.js';

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

function pickWeakestTopic(topics) {
  const nonMastered = topics.filter((t) => !t.mastered).sort((a, b) => a.overall - b.overall);
  const pool = nonMastered.length ? nonMastered : topics.sort((a, b) => a.overall - b.overall);
  // Randomize among the weakest candidates so restarts do not always pick the
  // exact same topic first.
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

function pickQuestionForTopic(key, topicState, session, history) {
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
  const firstTopic = pickWeakestTopic(topics);
  const employee = pickEmployee();
  const session = readSession();
  const topicState = ensureTopicState(session, firstTopic.key);
  const history = readHistory();
  const question = pickQuestionForTopic(firstTopic.key, topicState, { questions: [] }, history);
  if (!question) return null;

  const conversation = {
    conversationId: `conv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
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
  };

  writeSession(session);
  return conversation;
}

function difficultyToNumber(d) {
  if (d === 'easy') return 1;
  if (d === 'hard') return 3;
  return 2;
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
    return question.correctPairs.every((p) => matches[p.left] === p.right);
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
    samExplanation = question.explanation;

    recordConversationResult(currentTopicKey, {
      correct: false,
      concept: question.concept,
      samIntervention: true,
    });

    const { topicId } = topicIdsFromKey(currentTopicKey);
    recordSkillEvent('fundamentals', topicId, question.concept || 'general', {
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
  const nextQuestion = pickQuestionForTopic(nextTopicKey, topicState, conversation, history);
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
    samHelp: 'Bei den Netzwerk-Grundbegriffen geht es um Geräte (Endgeräte, Switch, Router), Adressierung (MAC, IP) und die Unterscheidung zwischen LAN/WAN. MAC ist lokal und physikalisch, IP ist logisch und routbar.',
    questions: [
      { id: 'gb-1', difficulty: 'easy', text: 'Was ist die Hauptaufgabe eines Switches?', options: ['IP-Adressen vergeben', 'Frames innerhalb eines LAN weiterleiten', 'Verbindung ins Internet herstellen', 'E-Mails filtern'], correct: 1, explanation: 'Ein Switch arbeitet auf Schicht 2 und leitet Frames anhand von MAC-Adressen innerhalb des lokalen Netzes weiter.' },
      { id: 'gb-2', difficulty: 'easy', text: 'Welche Adresse ist weltweit eindeutig und fest im Netzwerkgerät hinterlegt?', options: ['IPv4-Adresse', 'MAC-Adresse', 'Subnetzmaske', 'Gateway'], correct: 1, explanation: 'Die MAC-Adresse (Media Access Control) wird vom Hersteller vergeben und ist auf dem Netzwerkinterface physikalisch hinterlegt.' },
      { id: 'gb-3', difficulty: 'medium', text: 'Was charakterisiert ein WAN?', options: ['Hohe Datenrate im Büro', 'Begrenzt auf ein Gebäude', 'Große geografische Reichweite', 'Nur kabelgebundene Verbindungen'], correct: 2, explanation: 'WAN (Wide Area Network) verbindet geografisch getrennte Standorte, typischerweise über Provider-Leitungen.' },
      { id: 'gb-4', difficulty: 'hard', text: 'Was unterscheidet einen Hub von einem Switch?', options: ['Nichts, beide leiten Frames gezielt weiter', 'Ein Hub verstärkt Signale, ein Switch nicht', 'Ein Hub sendet eingehende Daten an alle Ports, ein Switch lernt MAC-Adressen', 'Nur ein Hub kann mit Glasfaser arbeiten'], correct: 2, explanation: 'Ein Hub wiederholt Signale auf allen Ports (Collision Domain), während ein Switch anhand seiner MAC-Tabelle gezielte Weiterleitung ermöglicht.' },
    ],
  },
  [topicKey('fundamentals', 'topologien')]: {
    title: 'Topologien',
    relatedTopics: [topicKey('fundamentals', 'grundbegriffe'), topicKey('fundamentals', 'osi-model')],
    introPool: [
      'Ich muss das Netzwerk-Layout für den neuen Standort skizzieren. Welche Topologie passt wann?',
      'Bei dem neuen Verkabelungsplan streiten wir uns über Vor- und Nachteile der Topologien.',
    ],
    samHelp: 'Topologien beschreiben die physische oder logische Verkabelung. Stern ist heute Standard (Switch zentral). Ring, Bus und Baum sind historisch oder spezialisiert. Vermascht bietet Redundanz, ist aber aufwendig.',
    questions: [
      { id: 'topo-1', difficulty: 'easy', text: 'In welcher Topologie ist ein zentraler Switch der Mittelpunkt?', options: ['Bus', 'Ring', 'Stern', 'Vermascht'], correct: 2, explanation: 'Bei der Stern-Topologie sind alle Endgeräte an einem zentralen Knoten (meist Switch) angeschlossen.' },
      { id: 'topo-2', difficulty: 'medium', text: 'Welche Topologie fällt am leichtesten bei einem einzelnen Kabelbruch aus?', options: ['Stern', 'Bus', 'Vermascht', 'Ring'], correct: 1, explanation: 'Beim Bus ist das Backbone-Kabel ein Single Point of Failure; ein Bruch legt das gesamte Segment lahm.' },
      { id: 'topo-3', difficulty: 'medium', text: 'Welche Topologie bietet die höchste Ausfallsicherheit, ist aber teuer?', options: ['Bus', 'Stern', 'Baum', 'Vermascht'], correct: 3, explanation: 'Eine vermaschte Topologie hat redundante Pfade, braucht aber mehr Kabel und aufwendigere Protokolle (z. B. Spanning Tree).' },
      { id: 'topo-4', difficulty: 'hard', text: 'Welche Aussage über den Baum ist korrekt?', options: ['Er hat keinen Single Point of Failure', 'Er verbindet mehrere Stern-Strukturen hierarchisch', 'Er ist identisch mit einem Ring', 'Er funktioniert nur drahtlos'], correct: 1, explanation: 'Baum-Topologie = hierarchische Verknüpfung mehrerer Sterne, typisch für größere Unternehmensnetze.' },
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
      { id: 'tcpip-2', difficulty: 'medium', text: 'Welche Schicht entspricht in etwa OSI Schicht 3?', options: ['Netzzugang', 'Internet', 'Transport', 'Anwendung'], correct: 1, explanation: 'Die Internet-Schicht des TCP/IP-Modells entspricht ungefähr der OSI-Vermittlungsschicht (Schicht 3) und kümmert sich um IP/Routing.' },
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
    title: 'IPv4',
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
    samHelp: 'Beim Subnetting werden Bits vom Hostanteil für das Subnetz genutzt. /26 heißt 6 Host-Bits, also 2⁶ - 2 = 62 Hosts pro Subnetz. Das Block-Offset ist 2⁸⁻²⁶mod⁸ = 2² = 4 (im relevanten Oktett).',
    questions: [
      { id: 'sub-1', difficulty: 'easy', text: 'Wie viele Hosts hat ein /26-Subnetz?', options: ['30', '62', '126', '254'], correct: 1, explanation: '/26 lässt 6 Host-Bits: 2⁶ = 64 Adressen, abzüglich Netz-ID und Broadcast = 62 Hosts.' },
      { id: 'sub-2', difficulty: 'medium', text: 'Wie lautet die Broadcast-Adresse von 192.168.1.64/26?', options: ['192.168.1.127', '192.168.1.128', '192.168.1.63', '192.168.1.255'], correct: 0, explanation: '/26-Blöcke im 4. Oktett springen in 64er-Schritten. Block 64–127, Broadcast = 127.' },
      { id: 'sub-3', difficulty: 'medium', text: 'Von einem /24 werden 4 gleich große Subnetze benötigt. Welche Präfixlänge entsteht?', options: ['/25', '/26', '/27', '/28'], correct: 1, explanation: '4 Subnetze brauchen 2 zusätzliche Subnetz-Bits: /24 + 2 = /26.' },
      { id: 'sub-4', difficulty: 'hard', text: 'In welchem Subnetz liegt 10.0.5.130/22?', options: ['10.0.4.0/22', '10.0.5.0/22', '10.0.6.0/22', '10.0.8.0/22'], correct: 0, explanation: '/22 umfasst im 3. Oktett 4er-Blöcke (256 Hosts pro /22). 10.0.4.0–10.0.7.255 enthält 10.0.5.130.' },
    ],
  },
  [topicKey('fundamentals', 'dhcp')]: {
    title: 'DHCP',
    relatedTopics: [topicKey('fundamentals', 'dns'), topicKey('fundamentals', 'ipv4')],
    introPool: [
      'Ein Client bekommt keine IP. Woran kann das liegen?',
      'Wie funktioniert DHCP nochmal im Detail?',
    ],
    samHelp: 'DHCP (Dynamic Host Configuration Protocol) vergibt automatisch IP, Subnetzmaske, Gateway und DNS. Ablauf: Discover (Broadcast), Offer, Request, Acknowledge (DORA).',
    questions: [
      { id: 'dhcp-1', difficulty: 'easy', text: 'Welches Protokoll verteilt automatisch IP-Adressen?', options: ['DNS', 'DHCP', 'HTTP', 'ARP'], correct: 1, explanation: 'DHCP (Dynamic Host Configuration Protocol) konfiguriert Hosts automatisch mit IP-Parametern.' },
      { id: 'dhcp-2', difficulty: 'medium', text: 'Wie heißt der erste Schritt des DHCP-Ablaufs?', options: ['Offer', 'Request', 'Discover', 'Acknowledge'], correct: 2, explanation: 'Der Client sendet zuerst einen DHCP-Discover als Broadcast, um einen Server zu finden.' },
      { id: 'dhcp-3', difficulty: 'medium', text: 'Was passiert, wenn der DHCP-Pool erschöpft ist?', options: ['Der Client bekommt eine zufällige IP', 'Der Client bekommt keine IP', 'Der Switch übernimmt', 'Das Gateway wird DHCP-Server'], correct: 1, explanation: 'Ohne freie Lease kann der DHCP-Server dem Client keine Adresse zuweisen.' },
      { id: 'dhcp-4', difficulty: 'hard', text: 'Wofür steht DORA?', options: ['Discover Offer Request Acknowledge', 'Dynamic Over Router Allocation', 'Domain Origin Resolution Address', 'Data Offer Relay Acknowledge'], correct: 0, explanation: 'DORA ist die Abkürzung für Discover, Offer, Request, Acknowledge – den DHCP-Vier-Wege-Handshake.' },
    ],
  },
  [topicKey('fundamentals', 'dns')]: {
    title: 'DNS',
    relatedTopics: [topicKey('fundamentals', 'dhcp'), topicKey('fundamentals', 'ipv4')],
    introPool: [
      'Ein Benutzer kann google.de nicht öffnen, alle anderen Seiten gehen. DNS-Problem?',
      'Wie wird eigentlich ein Name in eine IP aufgelöst?',
    ],
    samHelp: 'DNS (Domain Name System) übersetzt Namen in IP-Adressen. Rekursive Resolver fragen Root-, Top-Level-Domain- und authoritative Server, bis die Antwort gefunden ist.',
    questions: [
      { id: 'dns-1', difficulty: 'easy', text: 'Was ist die Hauptaufgabe von DNS?', options: ['IP-Adressen vergeben', 'Namen in IP-Adressen auflösen', 'E-Mails verschicken', 'Dateien speichern'], correct: 1, explanation: 'DNS übersetzt menschenlesbare Domain-Namen wie example.com in IP-Adressen.' },
      { id: 'dns-2', difficulty: 'medium', text: 'Welcher Record-Typ zeigt auf eine IPv4-Adresse?', options: ['AAAA', 'CNAME', 'A', 'MX'], correct: 2, explanation: 'Der A-Record verweist auf eine IPv4-Adresse; AAAA auf IPv6.' },
      { id: 'dns-3', difficulty: 'medium', text: 'Welche Komponente fragt nacheinander Root-, TLD- und autoritative Server?', options: ['Authoritative Server', 'Recursive Resolver', 'Webserver', 'DHCP-Server'], correct: 1, explanation: 'Der rekursive Resolver (z. B. DNS-Server des Providers) löst Anfragen schrittlich auf.' },
      { id: 'dns-4', difficulty: 'hard', text: 'Was passiert bei einem Cache-Poisoning-Angriff?', options: ['Server wird langsamer', 'Falsche Einträge werden in den DNS-Cache eingeschleust', 'Alle Zonen werden gelöscht', 'Das Root-Server-Netzwerk stürzt ab'], correct: 1, explanation: 'Bei DNS-Cache-Poisoning werden manipulierte Einträge in den Resolver-Cache eingeschleust, die Anfragen umleiten.' },
    ],
  },
  [topicKey('fundamentals', 'tcp-udp')]: {
    title: 'TCP & UDP',
    relatedTopics: [topicKey('fundamentals', 'tcp-ip-model'), topicKey('fundamentals', 'osi-model')],
    introPool: [
      'Wann nimmt man TCP, wann UDP?',
      'Mein VoIP-Anruf ruckelt. Hat das mit dem Transportprotokoll zu tun?',
    ],
    samHelp: 'TCP ist verbindungsorientiert, zuverlässig und reihenfolgetreu (Three-Way Handshake, ACKs, Wiederholung). UDP ist verbindungslos, schneller, aber unzuverlässig – gut für Streaming, VoIP, DNS.',
    questions: [
      { id: 'tp-1', difficulty: 'easy', text: 'Welches Protokoll ist zuverlässig und verbindungsorientiert?', options: ['UDP', 'TCP', 'ICMP', 'ARP'], correct: 1, explanation: 'TCP baut eine Verbindung auf, bestätigt Empfang und sorgt für korrekte Reihenfolge.' },
      { id: 'tp-2', difficulty: 'medium', text: 'Wie viele Pakete umfasst der TCP-Three-Way-Handshake?', options: ['2', '3', '4', '5'], correct: 1, explanation: 'SYN, SYN-ACK, ACK – insgesamt drei Pakete.' },
      { id: 'tp-3', difficulty: 'medium', text: 'Für welche Anwendung ist UDP typisch besser geeignet?', options: ['Datei-Download', 'E-Mail', 'VoIP/Video-Streaming', 'Webseitenaufruf'], correct: 2, explanation: 'UDP hat weniger Overhead und akzeptiert gelegentliche Paketverluste, was für Echtzeit-Anwendungen ideal ist.' },
      { id: 'tp-4', difficulty: 'hard', text: 'Was passiert, wenn ein TCP-Segment verloren geht?', options: ['Nichts', 'Der Sender wiederholt es nach Timeout', 'Der Empfänger ignoriert es', 'Das nächste Segment ersetzt es'], correct: 1, explanation: 'TCP erkennt fehlende ACKs und sendet das betroffene Segment erneut.' },
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
  [topicKey('fundamentals', 'ports')]: {
    title: 'Ports',
    relatedTopics: [topicKey('fundamentals', 'tcp-ip-model'), topicKey('fundamentals', 'tcp-udp')],
    introPool: [
      'Mein Browser ruft eine Seite ab. Wie weiß der Server, welche Anwendung antworten soll?',
      'Warum reicht eine IP-Adresse allein nicht für eine Verbindung aus?',
    ],
    samHelp: 'IP-Adressen identifizieren Hosts, Port-Nummern identifizieren Dienste auf einem Host. Bekannte Ports: HTTP 80, HTTPS 443, DNS 53, SSH 22, DHCP 67/68. TCP- und UDP-Header tragen jeweils Quell- und Zielport.',
    questions: [
      { id: 'port-1', difficulty: 'easy', text: 'Wozu dienen Port-Nummern?', options: ['MAC-Adressen vergeben', 'Dienste auf einem Host unterscheiden', 'Den Gateway festlegen', 'Subnetze bilden'], correct: 1, explanation: 'Port-Nummern ermöglichen es, mehrere Dienste auf einer IP-Adresse zu betreiben.' },
      { id: 'port-2', difficulty: 'easy', text: 'Welcher Port wird typischerweise für HTTP verwendet?', options: ['21', '53', '80', '443'], correct: 2, explanation: 'HTTP verwendet standardmäßig TCP-Port 80; HTTPS verwendet 443.' },
      { id: 'port-3', difficulty: 'medium', text: 'Welcher Dienst nutzt typischerweise UDP-Port 53?', options: ['HTTP', 'DNS', 'SMTP', 'SSH'], correct: 1, explanation: 'DNS-Anfragen werden oft über UDP-Port 53 gesendet (TCP für größere Antworten).' },
      { id: 'port-4', difficulty: 'medium', text: 'Warum reicht eine IP-Adresse allein nicht für eine TCP-Verbindung?', options: ['Weil Ports optional sind', 'Weil auch Quell- und Zielport bekannt sein müssen', 'Weil MAC-Adressen fehlen', 'Weil DNS nicht funktioniert'], correct: 1, explanation: 'Eine TCP-Verbindung besteht aus Quell-IP:Port und Ziel-IP:Port; beides ist nötig.' },
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
  [topicKey('fundamentals', 'kommunikation-uebertragung')]: {
    title: 'Kommunikations- und Übertragungsarten',
    relatedTopics: [topicKey('fundamentals', 'grundbegriffe'), topicKey('fundamentals', 'osi-model')],
    introPool: [
      'Wann spricht man von Broadcast, wann von Multicast?',
      'Simplex, Halbduplex, Vollduplex – wo ist der Unterschied?',
    ],
    samHelp: 'Unicast = ein Sender, ein Empfänger. Broadcast = ein Sender, alle im Netz. Multicast = ein Sender, interessierte Gruppe. Simplex = nur eine Richtung, Halbduplex = abwechselnd beide Richtungen, Vollduplex = gleichzeitig senden und empfangen.',
    questions: [
      { id: 'comm-1', difficulty: 'easy', text: 'Was ist Unicast?', options: ['Ein Sender, alle Empfänger', 'Ein Sender, ein Empfänger', 'Ein Sender, eine Gruppe', 'Kein Empfänger'], correct: 1, explanation: 'Unicast beschreibt die Kommunikation zwischen genau einem Sender und einem Empfänger.' },
      { id: 'comm-2', difficulty: 'easy', text: 'Welcher Übertragungsmodus erlaubt gleichzeitiges Senden und Empfangen?', options: ['Simplex', 'Halbduplex', 'Vollduplex', 'Unicast'], correct: 2, explanation: 'Vollduplex ermöglicht gleichzeitiges Senden und Empfangen, wie moderne Switched Ethernet-Links.' },
      { id: 'comm-3', difficulty: 'medium', text: 'Welche Adressierungsart erreicht eine ausgewählte Gruppe von Empfängern?', options: ['Unicast', 'Broadcast', 'Multicast', 'Anycast'], correct: 2, explanation: 'Multicast sendet an eine bestimmte, angemeldete Gruppe von Empfängern.' },
      { id: 'comm-4', difficulty: 'medium', text: 'In welchem Modus senden beide Seiten abwechselnd?', options: ['Simplex', 'Halbduplex', 'Vollduplex', 'Broadcast'], correct: 1, explanation: 'Halbduplex erlaubt beide Richtungen, aber nicht gleichzeitig – beispielsweise bei klassischen Hubs oder Walkie-Talkies.' },
    ],
  },
};
