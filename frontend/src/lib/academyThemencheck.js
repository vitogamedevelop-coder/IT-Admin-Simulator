// =============================================================================
// NEXUS Academy - Themencheck Engine
//
// Generates dynamic quizzes from all available lessons within a category.
// Automatically adapts when new lessons or quiz questions are added.
// Also supports a global "Abschlusscheck" across all categories.
//
// Features:
// - Category summary (auto-generated stats)
// - Themencheck (15-30 questions, evenly distributed)
// - Result persistence (localStorage)
// - Adaptive retry (repeat errors only)
// - Category progress tracking
// =============================================================================
import { LESSONS, hasLessonContent } from './academyLessonData.js';
import { topicKey, topicsForCategory, ACADEMY_CATEGORIES, findTopic } from './academyTopics.js';
import { getAllFullTopics } from './academyProgress.js';
import { isTopicLearnedOrBeyond } from './academyEngine.js';
import { EVIDENCE_TYPES, evidenceFromThemencheckCompetency } from './learningEvidence.js';
import { recordLearningResult } from './learningMastery.js';
import { LEARNING_MODES, readAcademyMode } from './academyMode.js';
import { generateQuestion, getAllKnowledgeItems, getAllFacetMasteryScores } from './knowledge/index.js';
import { getDiagnosticScenariosForTopic } from './diagnosticScenarios.js';
import { getMultiSelectQuestionsForTopic } from './multiSelectQuestions.js';
import { getDragDropQuestionsForTopic } from './dragDropQuestions.js';
import {
  createRng, makeSeed, shuffle, weightedPick, randomInt,
  RNG_NAMESPACE_LEARNING,
} from './random.js';

const RESULTS_KEY = 'cyberlearn:themencheck-results-v1';
const HISTORY_KEY = 'cyberlearn:themencheck-history-v1';
const HISTORY_LIMIT = 1000;
const COOLDOWN_HOURS = [2, 24, 72];
const COOLDOWN_PENALTIES = [0.95, 0.7, 0.3];

// ---------- Scoring thresholds ----------
export const SCORE_GRADES = [
  { min: 95, label: 'Hervorragend', stars: 5 },
  { min: 80, label: 'Sehr gut', stars: 4 },
  { min: 65, label: 'Gut', stars: 3 },
  { min: 50, label: 'Noch etwas üben', stars: 2 },
  { min: 0, label: 'Thema erneut wiederholen', stars: 1 },
];

export function getGrade(percent) {
  return SCORE_GRADES.find(g => percent >= g.min) || SCORE_GRADES[SCORE_GRADES.length - 1];
}

export function getSamComment(percent) {
  if (percent >= 95) return 'Hervorragend! Du beherrschst die Inhalte dieser Kategorie absolut sicher.';
  if (percent >= 80) return 'Sehr gut! Du hast die wichtigsten Inhalte dieser Kategorie verstanden.';
  if (percent >= 65) return 'Gut gemacht! Ein paar Details könntest du noch vertiefen.';
  if (percent >= 50) return 'Ein paar Themen sitzen noch nicht ganz. Ich würde dir empfehlen, die markierten Lektionen noch einmal anzuschauen.';
  return 'Da sind noch einige Lücken. Nimm dir Zeit und arbeite die Lektionen noch einmal in Ruhe durch.';
}

export function getSamRecommendation(topicId, errorCount) {
  const topic = findTopic('fundamentals', topicId);
  const name = topic?.title || topicId;
  if (errorCount >= 3) return `Ich würde dir empfehlen, das Kapitel „${name}" noch einmal komplett durchzuarbeiten.`;
  if (errorCount >= 2) return `Du hast Schwierigkeiten bei „${name}". Wiederhole zunächst dieses Kapitel und versuche danach das Übungsquiz erneut.`;
  return `Schau dir „${name}" noch einmal kurz an.`;
}

// ---------- Helpers ----------

function shuffleArray(arr, rng) {
  return shuffle(rng, arr);
}

// ---------- Cross-run Themencheck history ----------

function makeSemanticKey(categoryId, sourceTopicId, questionText) {
  const text = (questionText || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return `${categoryId}::${sourceTopicId}::${text}`;
}

let memoryHistory = [];
let currentRunIndex = 0;

function readHistory() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    }
  } catch { /* fall back to in-memory */ }
  return memoryHistory;
}

function writeHistory(history) {
  const trimmed = history.slice(-HISTORY_LIMIT);
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      return;
    }
  } catch { /* fall back to in-memory */ }
  memoryHistory = trimmed;
}

function getHistoryForCategory(history, categoryId) {
  return history.filter((h) => h.categoryId === categoryId);
}

function computeHistoryStats(categoryHistory) {
  const stats = new Map();
  for (let i = 0; i < categoryHistory.length; i++) {
    const h = categoryHistory[i];
    if (!h || !h.semanticKey) continue;
    const s = stats.get(h.semanticKey);
    if (s) {
      s.count++;
      const t = new Date(h.seenAt).getTime();
      if (t > s.lastSeen) { s.lastSeen = t; s.lastRunIndex = h.runIndex || 0; s.lastIndex = i; }
    } else {
      stats.set(h.semanticKey, {
        count: 1,
        lastSeen: new Date(h.seenAt).getTime(),
        lastRunIndex: h.runIndex || 0,
        lastIndex: i,
      });
    }
  }
  return stats;
}

function scoreCooldown(semanticKey, historyStats, historyLength) {
  const s = historyStats.get(semanticKey);
  if (!s) return 1.0;
  const hoursAgo = (Date.now() - s.lastSeen) / (1000 * 60 * 60);
  let timePenalty = 0;
  for (let i = 0; i < COOLDOWN_HOURS.length; i++) {
    if (hoursAgo < COOLDOWN_HOURS[i]) timePenalty = Math.max(timePenalty, COOLDOWN_PENALTIES[i]);
  }
  const gap = historyLength - s.lastIndex - 1; // how many newer entries since this key
  const gapRelief = Math.min(0.85, gap * 0.03);
  const runsSince = Math.max(0, currentRunIndex - s.lastRunIndex);
  const runPenalty = 0.98 / (runsSince ** 0.55);
  const seenPenalty = Math.min(0.35, (s.count - 1) * 0.12);
  const timeReliefPenalty = Math.max(0, timePenalty - gapRelief);
  const basePenalty = Math.max(0.05, Math.max(runPenalty, timeReliefPenalty));
  const penalty = Math.min(0.98, basePenalty + seenPenalty);
  return Math.max(0.02, 1 - penalty);
}

/**
 * Collects all quiz questions from a lesson (quiz array + inline questions in explanations).
 * Each returned question has a standard shape: { question, options, correct, explanation, sourceTopicId }
 */
export function collectQuestionsFromLesson(lesson, topicId) {
  const questions = [];

  // Quiz questions (standard format)
  if (lesson.quiz && Array.isArray(lesson.quiz)) {
    for (const q of lesson.quiz) {
      if (q.question && q.options && typeof q.correct === 'number') {
        questions.push({
          ...q,
          sourceTopicId: topicId,
          semanticKey: q.semanticKey || makeSemanticKey(topicId, topicId, q.question),
        });
      }
    }
  }

  // Inline questions embedded in explanations
  if (lesson.explanations && Array.isArray(lesson.explanations)) {
    for (const exp of lesson.explanations) {
      if (exp.blocks) {
        for (const block of exp.blocks) {
          if (block.type === 'question' && block.question && block.options && typeof block.correct === 'number') {
            const q = {
              question: block.question,
              options: block.options,
              correct: block.correct,
              explanation: block.explanation || '',
              sourceTopicId: topicId,
              semanticKey: makeSemanticKey(topicId, topicId, block.question),
            };
            questions.push(q);
          }
        }
      }
    }
  }

  return questions;
}

/**
 * Collects Cisco CLI configuration tasks from a lesson's `cliTasks` array
 * (used by Praxis-quiz / Fachgespräch, see LessonRunner.jsx: PracticeQuiz /
 * FachgespraechRunner). Deliberately NOT included in collectQuestionsFromLesson
 * above, so Themencheck/Abschlusscheck - which render every question as a
 * multiple-choice button list - stay unaffected. Each task is normalized to
 * the same `{ question, ... }` shape as multiple-choice questions, tagged
 * `type: 'cli'` so the UI can branch to a CLI input instead of option buttons.
 */
export function collectCliTasksFromLesson(lesson, topicId) {
  if (!lesson.cliTasks || !Array.isArray(lesson.cliTasks)) return [];
  return lesson.cliTasks
    .filter((t) => t.prompt && Array.isArray(t.expectedLines) && t.expectedLines.length > 0)
    .map((t) => ({
      type: 'cli',
      question: t.prompt,
      hint: t.hint,
      expectedLines: t.expectedLines,
      explanation: t.explanation || '',
      sourceTopicId: topicId,
    }));
}

// ---------- Category Summary ----------

/**
 * Generates command-recall multiple-choice questions from Knowledge Items tagged
 * cisco.command.* for a given topic. These questions are intentionally NOT
 * folded into collectQuestionsFromLesson (which feeds category statistics and
 * the lesson question pool) so that command recall stays a separate,
 * maintainable layer that can be enabled per quiz generation strategy.
 */
function collectCommandRecallQuestionsForTopic(topicId, rng, seedSuffix = '') {
  const items = getAllKnowledgeItems().filter((item) => {
    if (!item.conceptCluster?.startsWith('cisco.command.')) return false;
    return item.topicKey === topicKey('cisco-packet-tracer', topicId);
  });

  const questions = [];
  for (const item of items) {
    try {
      const instance = generateQuestion(item.id, null, {
        seed: `themencheck-${topicId}-${item.id}${seedSuffix}`,
        contextType: 'direct_question',
      });
      if (!instance || !instance.prompt || !Array.isArray(instance.options) || typeof instance.correct !== 'number') continue;
      questions.push({
        question: instance.prompt,
        options: instance.options.map((o) => o.label),
        correct: instance.correct,
        explanation: instance.explanation || instance.prompt,
        sourceTopicId: topicId,
        semanticKey: `cmd:${topicId}:${item.id}:${seedSuffix}`,
        isCommandRecall: true,
      });
    } catch {
      // No applicable template or generation failure: skip silently.
    }
  }
  return shuffleArray(questions, rng);
}

/**
 * Auto-generated summary for a category. Returns stats computed from lesson data.
 */
export function getCategorySummary(categoryId) {
  const topics = topicsForCategory(categoryId);
  const category = ACADEMY_CATEGORIES.find(c => c.categoryId === categoryId);
  const fullTopics = getAllFullTopics().filter(t => t.categoryId === categoryId);

  let lessonCount = 0;
  let quizCount = 0;
  let exerciseCount = 0;
  let totalQuestions = 0;
  const topicNames = [];

  for (const topic of topics) {
    const key = topicKey(topic.categoryId, topic.topicId);
    const lesson = LESSONS[key];
    const hasContent = hasLessonContent(topic.categoryId, topic.topicId);

    if (hasContent) {
      lessonCount++;
      topicNames.push(topic.title);
    }

    if (lesson) {
      if (lesson.quiz) quizCount += lesson.quiz.length;
      if (lesson.exercises) exerciseCount += lesson.exercises.length;
      totalQuestions += collectQuestionsFromLesson(lesson, topic.topicId).length;
    }
  }

  // Estimate learning time: ~3 min per lesson + ~1 min per quiz question + ~2 min per exercise
  const estimatedMinutes = Math.round(lessonCount * 3 + quizCount * 1 + exerciseCount * 2);

  // Completed count: must match the topic-card badge semantics (LEARNED+).
  let completedLessons = 0;
  let completedTopics = 0;
  for (const topic of topics) {
    if (!hasLessonContent(topic.categoryId, topic.topicId)) continue;
    const full = fullTopics.find(t => t.topicId === topic.topicId);
    if (full && isTopicLearnedOrBeyond(full)) {
      completedLessons++;
      completedTopics++;
    }
  }

  return {
    categoryId,
    title: category?.title || categoryId,
    description: category?.description || '',
    topicNames,
    lessonCount,
    quizCount,
    exerciseCount,
    totalQuestions,
    estimatedMinutes,
    completedLessons,
    completedTopics,
    totalTopics: topics.length,
    progressPercent: lessonCount > 0 ? Math.round((completedLessons / lessonCount) * 100) : 0,
  };
}

// ---------- Blueprint helpers ----------

function normalizeQuestionText(q) {
  return (q.question || '').toLowerCase()
    .replace(/[^a-z0-9äöüß\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyQuestion(q) {
  if (q.type === 'drag-drop') {
    const mode = q.mode;
    if (mode === 'ordering') return 'recall';
    if (mode === 'matching') return q.question.toLowerCase().includes('troubleshooting') ? 'diagnosis' : 'interpretation';
    return 'interpretation';
  }
  if (q.type === 'multi-select') {
    if (q.competency) return q.competency;
    const t = q.question.toLowerCase();
    if (t.includes('sinnvoll') || t.includes('zutreffend') || t.includes('treffen zu') || t.includes('korrekt')) return 'interpretation';
    return 'interpretation';
  }
  if (q.isDiagnostic) return 'diagnosis';
  if (q.isCommandRecall) return 'recall';
  if (q.type === 'cli') return 'transfer';
  const t = (q.question || '').toLowerCase();
  if (t.includes('was passiert') || t.includes('was zeigt') || t.includes('was bedeutet') || t.includes('interpret')) return 'interpretation';
  if (t.includes('welche folge') || t.includes('was ist das ergebnis') || t.includes('diagnose') || t.includes('fehler')) return 'diagnosis';
  if (t.includes('wie konfigurier') || t.includes('was muss') || t.includes('welche konfiguration') || t.includes('schritt')) return 'transfer';
  return 'recall';
}

function questionTypeGroup(q) {
  if (q.type === 'multi-select') return 'multi-select';
  if (q.type === 'drag-drop') return 'drag-drop';
  if (q.isDiagnostic) return 'diagnostic';
  if (q.isCommandRecall) return 'command-recall';
  if (q.type === 'cli') return 'cli';
  return 'single-select';
}

function questionFacet(q) {
  if (q.relatedKnowledgeIds && q.relatedKnowledgeIds.length) {
    return q.relatedKnowledgeIds[0];
  }
  if (q.sourceTopicId) return `${q.sourceCategoryId || ''}/${q.sourceTopicId}`;
  return 'general';
}

function getCategoryMixSettings(categoryId) {
  const technicalCompetency = { recall: 0.25, interpretation: 0.25, diagnosis: 0.35, transfer: 0.15 };
  const technicalMin = { recall: 3, interpretation: 3, diagnosis: 4, transfer: 2 };
  if (categoryId === 'information-security') {
    return {
      competencyTargets: { recall: 0.25, interpretation: 0.30, diagnosis: 0.30, transfer: 0.15 },
      typeTargets: { 'single-select': 0.45, 'multi-select': 0.15, 'drag-drop': 0.15, diagnostic: 0.25 },
      commandRecallMin: 0,
      minCompetency: { recall: 3, interpretation: 3, diagnosis: 3, transfer: 2 },
    };
  }
  if (categoryId === 'fundamentals') {
    return {
      competencyTargets: { recall: 0.35, interpretation: 0.30, diagnosis: 0.20, transfer: 0.15 },
      typeTargets: { 'single-select': 0.80, 'multi-select': 0.10, 'drag-drop': 0.10, diagnostic: 0.10 },
      commandRecallMin: 0,
      minCompetency: { recall: 4, interpretation: 2, diagnosis: 0, transfer: 0 },
    };
  }
  return {
    competencyTargets: technicalCompetency,
    typeTargets: { 'single-select': 0.45, 'multi-select': 0.15, 'drag-drop': 0.15, diagnostic: 0.25, 'command-recall': 0.20 },
    commandRecallMin: categoryId === 'cisco-packet-tracer' ? 0.20 : 0,
    minCompetency: technicalMin,
  };
}

function enrichQuestion(q, defaultTopicId) {
  return {
    ...q,
    _competency: classifyQuestion(q),
    _typeGroup: questionTypeGroup(q),
    _facet: questionFacet(q),
    _difficulty: q.difficulty || 'medium',
    sourceTopicId: q.sourceTopicId || defaultTopicId,
  };
}

function buildTargets(settings, total, candidates) {
  const counts = { competency: {}, type: {}, facet: {} };
  for (const c of candidates) {
    counts.competency[c._competency] = (counts.competency[c._competency] || 0) + 1;
    counts.type[c._typeGroup] = (counts.type[c._typeGroup] || 0) + 1;
    counts.facet[c._facet] = (counts.facet[c._facet] || 0) + 1;
  }
  const clamp = (n) => Math.max(0, Math.min(total, Math.round(n)));
  const competencyTargets = {};
  for (const [k, ratio] of Object.entries(settings.competencyTargets)) {
    const available = counts.competency[k] || 0;
    const maxFromPool = Math.max(0, Math.floor(available * 0.5));
    competencyTargets[k] = clamp(Math.min(maxFromPool, total * ratio));
  }
  const typeTargets = {};
  for (const [k, ratio] of Object.entries(settings.typeTargets)) {
    const available = counts.type[k] || 0;
    const maxFromPool = Math.max(0, Math.floor(available * 0.5));
    typeTargets[k] = clamp(Math.min(maxFromPool, total * ratio));
  }
  return { competencyTargets, typeTargets, availableTypes: counts.type, availableCompetencies: counts.competency };
}

function chooseDesired(groupCounts, targets) {
  let best = null;
  let bestRatio = Infinity;
  for (const [k, target] of Object.entries(targets)) {
    if (target <= 0) continue;
    const current = groupCounts[k] || 0;
    const ratio = current / target;
    if (ratio < bestRatio) {
      bestRatio = ratio;
      best = k;
    }
  }
  return best;
}

function shuffleNoStreaks(questions, limits, rng) {
  const maxFacet = limits.maxSameFacet || 2;
  const maxType = limits.maxSameType || 2;
  const maxComp = limits.maxSameCompetency || 2;
  const scoreArr = (arr) => {
    let bad = 0;
    let runFacet = 1, runType = 1, runComp = 1;
    let maxRunFacet = 1, maxRunType = 1, maxRunComp = 1;
    for (let i = 1; i < arr.length; i++) {
      runFacet = arr[i]._facet === arr[i - 1]._facet ? runFacet + 1 : 1;
      runType = arr[i]._typeGroup === arr[i - 1]._typeGroup ? runType + 1 : 1;
      runComp = arr[i]._competency === arr[i - 1]._competency ? runComp + 1 : 1;
      maxRunFacet = Math.max(maxRunFacet, runFacet);
      maxRunType = Math.max(maxRunType, runType);
      maxRunComp = Math.max(maxRunComp, runComp);
      if (runFacet > maxFacet) bad += (runFacet - maxFacet) * 2;
      if (runType > maxType) bad += (runType - maxType) * 2;
      if (runComp > maxComp) bad += (runComp - maxComp) * 2;
    }
    bad += Math.max(0, maxRunFacet - maxFacet) * 10;
    bad += Math.max(0, maxRunType - maxType) * 10;
    bad += Math.max(0, maxRunComp - maxComp) * 10;
    return bad;
  };
  let best = [...questions];
  let bestScore = scoreArr(best);
  if (bestScore === 0) return best;

  // Greedy local improvements: try random swaps and keep improving.
  for (let attempt = 0; attempt < 400; attempt++) {
    const a = [...best];
    const i = randomInt(rng, 0, a.length - 1);
    const j = randomInt(rng, 0, a.length - 1);
    [a[i], a[j]] = [a[j], a[i]];
    const s = scoreArr(a);
    if (s < bestScore) {
      best = a;
      bestScore = s;
      if (bestScore === 0) return best;
    }
  }

  // Fallback: fully random restarts if greedy didn't zero-out.
  for (let attempt = 0; attempt < 200; attempt++) {
    const a = shuffle(rng, [...questions]);
    const s = scoreArr(a);
    if (s < bestScore) {
      best = a;
      bestScore = s;
      if (bestScore === 0) return best;
    }
  }
  return best;
}

function getMasteryScoreForFacet(scores, facet) {
  if (scores[facet] !== undefined) return scores[facet];
  // Try cluster prefix match for richer facet ids.
  for (const [k, v] of Object.entries(scores)) {
    if (k.startsWith(facet) || facet.startsWith(k)) return v;
  }
  return 0;
}

function planThemencheck({ candidates, total, categoryId, history, masteryScores, rng }) {
  const settings = getCategoryMixSettings(categoryId);
  const targets = buildTargets(settings, total, candidates);
  const historyStats = computeHistoryStats(history);
  const nonSingleAvailable = candidates.filter((q) => q._typeGroup !== 'single-select').length;
  const desiredNonSingle = Math.min(nonSingleAvailable, Math.max(6, Math.round(total * 0.27)));
  const maxSingle = Math.max(total - desiredNonSingle, 0);
  const selected = [];
  const selectedKeys = new Set();
  const selectedTexts = new Set();
  const counts = { competency: {}, type: {}, facet: {}, topic: {} };

  function isDuplicate(q) {
    if (!q.semanticKey) return false;
    if (selectedKeys.has(q.semanticKey)) return true;
    const text = normalizeQuestionText(q);
    if (selectedTexts.has(text)) return true;
    return false;
  }

  function register(q) {
    selected.push(q);
    selectedKeys.add(q.semanticKey);
    selectedTexts.add(normalizeQuestionText(q));
    counts.competency[q._competency] = (counts.competency[q._competency] || 0) + 1;
    counts.type[q._typeGroup] = (counts.type[q._typeGroup] || 0) + 1;
    counts.facet[q._facet] = (counts.facet[q._facet] || 0) + 1;
    counts.topic[q.sourceTopicId] = (counts.topic[q.sourceTopicId] || 0) + 1;
  }

  function scoreCandidate(q) {
    const recent = scoreCooldown(q.semanticKey, historyStats, history.length);
    const compTarget = targets.competencyTargets[q._competency] || 0;
    const compCurrent = counts.competency[q._competency] || 0;
    const typeTarget = targets.typeTargets[q._typeGroup] || 0;
    const typeCurrent = counts.type[q._typeGroup] || 0;
    const compBoost = compCurrent < compTarget ? 0.25 : compCurrent > compTarget ? -0.25 : 0;
    const compOverflow = compTarget > 0 && compCurrent > compTarget + 1 ? -0.5 : 0;
    const typeBoost = typeCurrent < typeTarget ? 0.25 : typeCurrent > typeTarget ? -0.25 : 0;
    const typeOverflow = typeTarget > 0 && typeCurrent > typeTarget + 1 ? -0.8 : 0;
    const facetScore = getMasteryScoreForFacet(masteryScores, q._facet);
    const weakBoost = facetScore < 0 ? Math.min(1.0, -facetScore * 0.2) : 0;
    const facetCount = counts.facet[q._facet] || 0;
    const facetOverflow = facetCount >= Math.max(2, Math.ceil(total * 0.22)) ? -0.3 : 0;
    const topicCount = (counts.topic && counts.topic[q.sourceTopicId]) || 0;
    const topicOverflow = topicCount >= Math.max(3, Math.ceil(total * 0.25)) ? -0.2 : 0;
    let multiplier = 1 + compBoost + compOverflow + typeBoost + typeOverflow + facetOverflow + topicOverflow;
    multiplier = Math.max(0.3, Math.min(2.0, multiplier));
    return Math.max(0, recent * multiplier + weakBoost) * (0.7 + rng.next() * 0.6);
  }

  function pickFrom(pool) {
    const scored = pool.map((q) => ({ q, score: scoreCandidate(q) })).sort((a, b) => b.score - a.score);
    return weightedPick(rng, scored, (s) => Math.max(0, s.score)).q;
  }

  // Enforce hard minimums if pool allows, capped by availability.
  const minCompetency = { ...settings.minCompetency };
  const priorityOrder = ['diagnosis', 'transfer', 'interpretation', 'recall'];
  for (const comp of priorityOrder) {
    const available = targets.availableCompetencies[comp] || 0;
    const cap = Math.min(minCompetency[comp] || 0, Math.max(0, Math.floor(available * 0.4)));
    while ((counts.competency[comp] || 0) < cap && selected.length < total) {
      const pool = candidates.filter((q) => q._competency === comp && !isDuplicate(q));
      if (pool.length === 0) break;
      const best = pickFrom(pool);
      register(best);
    }
  }

  // Greedy blueprint fill.
  let attempts = 0;
  while (selected.length < total && attempts < total * 5) {
    attempts++;
    const desiredComp = chooseDesired(counts.competency, targets.competencyTargets);
    const desiredType = chooseDesired(counts.type, targets.typeTargets);
    let pool = candidates.filter((q) => !isDuplicate(q));
    if (pool.length === 0) break;
    // Prefer candidates that move us toward underrepresented groups.
    const desiredPool = pool.filter((q) => q._competency === desiredComp || q._typeGroup === desiredType);
    if (desiredPool.length > 0) pool = desiredPool;
    const best = pickFrom(pool);
    register(best);
  }

  // Soft cap: trim if a type or facet is overrepresented beyond the blueprint slack.
  function trim(groupKey, maxRatio, exactMax) {
    const max = exactMax !== undefined ? exactMax : Math.max(2, Math.round(total * maxRatio));
    while ((counts.type[groupKey] || 0) > max && selected.length > 15) {
      const idx = selected.findLastIndex((q) => q._typeGroup === groupKey);
      if (idx === -1) break;
      const removed = selected.splice(idx, 1)[0];
      selectedKeys.delete(removed.semanticKey);
      selectedTexts.delete(normalizeQuestionText(removed));
      counts.competency[removed._competency] = (counts.competency[removed._competency] || 0) - 1;
      counts.type[removed._typeGroup] = (counts.type[removed._typeGroup] || 0) - 1;
      counts.facet[removed._facet] = (counts.facet[removed._facet] || 0) - 1;
      counts.topic[removed.sourceTopicId] = (counts.topic[removed.sourceTopicId] || 0) - 1;
    }
  }
  trim('multi-select', 0.22);
  trim('drag-drop', 0.22);
  trim('diagnostic', 0.35);
  trim('command-recall', 0.35);
  // Cap single-select so mixed types actually appear and repeat less.
  if (Object.keys(counts.type).some((k) => k !== 'single-select')) {
    trim('single-select', undefined, maxSingle);
  }
  // Enforce a soft ceiling on non-single count to keep the pool from exhausting.
  let nonSingleCount = selected.length - (counts.type['single-select'] || 0);
  while (nonSingleCount > desiredNonSingle && selected.length > 0) {
    const idx = selected.findLastIndex((q) => q._typeGroup !== 'single-select');
    if (idx === -1) break;
    const removed = selected.splice(idx, 1)[0];
    selectedKeys.delete(removed.semanticKey);
    selectedTexts.delete(normalizeQuestionText(removed));
    counts.competency[removed._competency] = (counts.competency[removed._competency] || 0) - 1;
    counts.type[removed._typeGroup] = (counts.type[removed._typeGroup] || 0) - 1;
    counts.facet[removed._facet] = (counts.facet[removed._facet] || 0) - 1;
    counts.topic[removed.sourceTopicId] = (counts.topic[removed.sourceTopicId] || 0) - 1;
    nonSingleCount--;
  }

  // Cisco command recall explicit minimum, applied after trimming so it is preserved.
  if (settings.commandRecallMin > 0) {
    const minCmd = Math.max(2, Math.round(total * settings.commandRecallMin));
    while ((counts.type['command-recall'] || 0) < minCmd && selected.length < total) {
      const pool = candidates.filter((q) => q._typeGroup === 'command-recall' && !isDuplicate(q));
      if (pool.length === 0) break;
      const best = pickFrom(pool);
      register(best);
    }
    trim('command-recall', 0.35);
  }

  // Fill back to target total after trimming and handle very small pools.
  while (selected.length < total) {
    const pool = candidates.filter((q) => !isDuplicate(q));
    if (pool.length === 0) break;
    const best = pickFrom(pool);
    register(best);
  }

  const shuffled = shuffleNoStreaks(selected, { maxSameFacet: 2, maxSameType: 3, maxSameCompetency: 3 }, rng);
  // Strip internal blueprint metadata before returning.
  return shuffled.map((q) => {
    const { _competency, _typeGroup, _facet, _difficulty, ...rest } = q;
    return rest;
  });
}

/**
 * Generates a Themencheck for a given category.
 * Draws questions according to a pool-aware blueprint that balances topic, competency,
 * question type, and facet coverage while respecting cross-run cooldown history.
 */
export function generateThemencheck(categoryId) {
  currentRunIndex += 1;
  const rng = createRng(makeSeed({
    subsystem: RNG_NAMESPACE_LEARNING,
    category: categoryId,
    runIndex: currentRunIndex,
  }));
  const topics = topicsForCategory(categoryId);
  const history = getHistoryForCategory(readHistory(), categoryId);
  const topicPools = [];

  for (const topic of topics) {
    const key = topicKey(topic.categoryId, topic.topicId);
    const lesson = LESSONS[key];

    const pool = lesson ? collectQuestionsFromLesson(lesson, topic.topicId) : [];
    const commandRecall = categoryId === 'cisco-packet-tracer' ? collectCommandRecallQuestionsForTopic(topic.topicId, rng) : [];
    const diagnostic = getDiagnosticScenariosForTopic(categoryId, topic.topicId);
    const multiSelect = getMultiSelectQuestionsForTopic(categoryId, topic.topicId);
    const dragDrop = getDragDropQuestionsForTopic(categoryId, topic.topicId);
    const combined = [...pool, ...commandRecall, ...diagnostic, ...multiSelect, ...dragDrop];
    if (combined.length === 0) continue;
    topicPools.push({ topicId: topic.topicId, pool: combined });
  }

  if (topicPools.length === 0) return [];

  const targetTotal = Math.min(30, Math.max(15, topicPools.length * 3));
  const allCandidates = topicPools.flatMap(({ topicId, pool }) =>
    pool.map((q) => enrichQuestion(q, topicId))
  );
  const masteryScores = getAllFacetMasteryScores();
  const selected = planThemencheck({ candidates: allCandidates, total: targetTotal, categoryId, history, masteryScores, rng });

  // Record seen semantic keys so future calls can avoid immediate repetition.
  const seenAt = new Date().toISOString();
  const newEntries = selected.map((q) => ({ semanticKey: q.semanticKey, categoryId, seenAt, runIndex: currentRunIndex }));
  writeHistory([...readHistory(), ...newEntries]);

  return selected;
}

/**
 * Generates the big Abschlusscheck across all categories.
 * Draws up to 10 questions per category, aiming for 50-100 total.
 */
export function generateAbschlusscheck() {
  const rng = createRng(makeSeed({ subsystem: 'abschlusscheck' }));
  const allQuestions = [];

  for (const category of ACADEMY_CATEGORIES) {
    const topics = topicsForCategory(category.categoryId);
    const categoryPool = [];

    for (const topic of topics) {
      const key = topicKey(topic.categoryId, topic.topicId);
      const lesson = LESSONS[key];
      if (!lesson) continue;
      categoryPool.push(...collectQuestionsFromLesson(lesson, topic.topicId));
    }

    if (categoryPool.length === 0) continue;
    const shuffled = shuffleArray(categoryPool, rng);
    const count = Math.min(shuffled.length, 10);
    allQuestions.push(...shuffled.slice(0, count));
  }

  return shuffleArray(allQuestions, rng);
}

// ---------- Availability ----------

export { classifyQuestion, questionTypeGroup, questionFacet };

export function isThemencheckAvailable(categoryId) {
  const topics = topicsForCategory(categoryId);
  const lessonsInCategory = topics.filter(t => hasLessonContent(t.categoryId, t.topicId));
  if (lessonsInCategory.length === 0) return false;

  let hasQuestions = false;
  for (const topic of lessonsInCategory) {
    const key = topicKey(topic.categoryId, topic.topicId);
    const lesson = LESSONS[key];
    if (lesson) {
      const pool = collectQuestionsFromLesson(lesson, topic.topicId);
      if (pool.length > 0) { hasQuestions = true; break; }
    }
  }
  if (!hasQuestions) return false;

  const mode = readAcademyMode().mode;
  if (mode === LEARNING_MODES.COURSE || mode === LEARNING_MODES.SANDBOX) return true;

  const fullTopics = getAllFullTopics().filter(t => t.categoryId === categoryId);
  for (const topic of lessonsInCategory) {
    const full = fullTopics.find(t => t.topicId === topic.topicId);
    if (!full || !isTopicLearnedOrBeyond(full)) return false;
  }
  return true;
}

export function isAbschlusscheckAvailable() {
  const mode = readAcademyMode().mode;
  if (mode === LEARNING_MODES.COURSE || mode === LEARNING_MODES.SANDBOX) {
    let count = 0;
    for (const cat of ACADEMY_CATEGORIES) {
      const topics = topicsForCategory(cat.categoryId);
      for (const t of topics) {
        const lesson = LESSONS[topicKey(t.categoryId, t.topicId)];
        if (lesson && collectQuestionsFromLesson(lesson, t.topicId).length > 0) { count++; break; }
      }
    }
    return count >= 2;
  }

  for (const cat of ACADEMY_CATEGORIES) {
    const topics = topicsForCategory(cat.categoryId);
    const lessonsInCat = topics.filter(t => hasLessonContent(t.categoryId, t.topicId));
    if (lessonsInCat.length === 0) continue;
    if (!isThemencheckAvailable(cat.categoryId)) return false;
  }
  return true;
}

// ---------- Result persistence ----------

function readResults() {
  try {
    return JSON.parse(localStorage.getItem(RESULTS_KEY)) || {};
  } catch { return {}; }
}

function writeResults(data) {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('cyberlearn:themencheck-results'));
}

/**
 * Save a Themencheck result with full detail.
 * @param {string} categoryId - category or 'global'
 * @param {object} result - { questions, answers, startedAt, finishedAt }
 *   questions: array of { question, sourceTopicId, correct (index) }
 *   answers: array of { selectedIndex, correct (bool), sourceTopicId, questionText }
 */
export function saveThemencheckResult(categoryId, result) {
  const data = readResults();
  if (!data[categoryId]) data[categoryId] = [];

  const correctCount = result.answers.filter(a => a.correct).length;
  const totalCount = result.answers.length;
  const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // Errors grouped by topic
  const errorsPerTopic = {};
  for (const a of result.answers) {
    if (!a.correct) {
      errorsPerTopic[a.sourceTopicId] = (errorsPerTopic[a.sourceTopicId] || 0) + 1;
    }
  }

  const entry = {
    date: new Date().toISOString(),
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    durationMs: result.finishedAt - result.startedAt,
    totalQuestions: totalCount,
    correctCount,
    percent,
    errorsPerTopic,
    // Store wrong question texts for adaptive retry
    wrongQuestions: result.answers
      .filter(a => !a.correct)
      .map(a => ({ question: a.questionText, sourceTopicId: a.sourceTopicId })),
    attempt: (data[categoryId].length || 0) + 1,
  };

  data[categoryId].push(entry);
  // Keep last 20 results per category
  if (data[categoryId].length > 20) data[categoryId] = data[categoryId].slice(-20);
  writeResults(data);

  // Record cross-run Themencheck history for anti-repetition.
  const history = readHistory();
  result.answers.forEach((a, i) => {
    const q = result.questions[i] || {};
    const semanticKey = q.semanticKey || makeSemanticKey(categoryId, a.sourceTopicId, a.questionText);
    const existing = history.find((h) => h.semanticKey === semanticKey);
    if (existing) {
      existing.seenAt = new Date().toISOString();
      existing.seenCount += 1;
      existing.correctCount += a.correct ? 1 : 0;
    } else {
      history.push({
        semanticKey,
        categoryId,
        sourceTopicId: a.sourceTopicId,
        seenAt: new Date().toISOString(),
        seenCount: 1,
        correctCount: a.correct ? 1 : 0,
      });
    }
  });
  writeHistory(history);

  // C4: feed individual Themencheck answers into the Academy mastery model.
  // Only real category checks (not 'global') carry a usable sourceTopicId.
  if (categoryId !== 'global') {
    result.answers.forEach((a, i) => {
      const q = result.questions[i];
      if (!q || !q.facet || !q.sourceTopicId) return;
      const evidenceType = evidenceFromThemencheckCompetency(q.competency) || EVIDENCE_TYPES.RECOGNIZED;
      recordLearningResult({
        categoryId,
        topicId: q.sourceTopicId,
        facetIds: [q.facet],
        evidenceType,
        source: `themencheck:${q.semanticKey || `q-${i}`}`,
        correct: !!a.correct,
        partial: false,
        difficulty: q.difficulty || 'medium',
      });
    });
  }

  return entry;
}

/**
 * Get all saved results for a category (or 'global').
 */
export function getThemencheckResults(categoryId) {
  return readResults()[categoryId] || [];
}

/**
 * Get the last result's wrong questions for adaptive retry.
 * Returns question objects that can be used to re-run a mini-quiz.
 */
export function getLastErrors(categoryId) {
  const results = getThemencheckResults(categoryId);
  if (results.length === 0) return [];
  const last = results[results.length - 1];
  return last.wrongQuestions || [];
}

/**
 * Check if the last Themencheck was passed (>= 50%).
 */
export function isThemencheckPassed(categoryId) {
  const results = getThemencheckResults(categoryId);
  if (results.length === 0) return false;
  return results[results.length - 1].percent >= 50;
}

/**
 * Get the best score ever achieved for a category's Themencheck.
 */
export function getBestScore(categoryId) {
  const results = getThemencheckResults(categoryId);
  if (results.length === 0) return null;
  return Math.max(...results.map(r => r.percent));
}
