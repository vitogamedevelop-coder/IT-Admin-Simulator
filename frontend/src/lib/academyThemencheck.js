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
import { LEARNING_MODES, readAcademyMode } from './academyMode.js';
import { generateQuestion, getAllKnowledgeItems } from './knowledge/index.js';
import { getDiagnosticScenariosForTopic } from './diagnosticScenarios.js';

const RESULTS_KEY = 'cyberlearn:themencheck-results-v1';
const HISTORY_KEY = 'cyberlearn:themencheck-history-v1';
const HISTORY_LIMIT = 1000;
const COOLDOWN_HOURS = [2, 24, 72];
const COOLDOWN_PENALTIES = [0.8, 0.5, 0.2];

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

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Cross-run Themencheck history ----------

function makeSemanticKey(categoryId, sourceTopicId, questionText) {
  const text = (questionText || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return `${categoryId}::${sourceTopicId}::${text}`;
}

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch { return []; }
}

function writeHistory(history) {
  const trimmed = history.slice(-HISTORY_LIMIT);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

function getHistoryForCategory(history, categoryId) {
  return history.filter((h) => h.categoryId === categoryId);
}

function scoreCooldown(semanticKey, categoryHistory) {
  const entries = categoryHistory.filter((h) => h.semanticKey === semanticKey);
  if (entries.length === 0) return 1.0;
  const last = Math.max(...entries.map((h) => new Date(h.seenAt).getTime()));
  const hoursAgo = (Date.now() - last) / (1000 * 60 * 60);
  let penalty = 0;
  for (let i = 0; i < COOLDOWN_HOURS.length; i++) {
    if (hoursAgo < COOLDOWN_HOURS[i]) penalty = Math.max(penalty, COOLDOWN_PENALTIES[i]);
  }
  penalty += Math.min(0.3, (entries.length - 1) * 0.05);
  return Math.max(0.05, 1 - penalty);
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
function collectCommandRecallQuestionsForTopic(topicId, seedSuffix = '') {
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
  return shuffleArray(questions);
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

// ---------- Question pool with even distribution ----------

function collectCommandRecallQuestionsForCategory(categoryId) {
  const topics = topicsForCategory(categoryId);
  const questions = [];
  // Multiple seeds give the balancer enough distinct command-recall variants.
  const seedSuffixes = ['-a', '-b', '-c', '-d'];
  for (const topic of topics) {
    for (const suffix of seedSuffixes) {
      questions.push(...collectCommandRecallQuestionsForTopic(topic.topicId, suffix));
    }
  }
  return shuffleArray(questions);
}

/**
 * Generates a Themencheck for a given category.
 * Draws questions evenly across all topics (2-3 per topic), aiming for 15-30 total.
 * Respects cross-run cooldown history to reduce immediate repetition.
 * Enforces run-level uniqueness by semantic key.
 * For the Cisco category, command-recall questions are explicitly boosted so the
 * final mix is roughly 15-35% command questions while staying within the cap.
 */
export function generateThemencheck(categoryId) {
  const topics = topicsForCategory(categoryId);
  const history = getHistoryForCategory(readHistory(), categoryId);
  const topicPools = [];

  for (const topic of topics) {
    const key = topicKey(topic.categoryId, topic.topicId);
    const lesson = LESSONS[key];
    if (!lesson) continue;

    const pool = collectQuestionsFromLesson(lesson, topic.topicId);
    const commandRecall = collectCommandRecallQuestionsForTopic(topic.topicId);
    const diagnostic = getDiagnosticScenariosForTopic(categoryId, topic.topicId);
    const combined = [...pool, ...commandRecall, ...diagnostic];
    if (combined.length === 0) continue;
    topicPools.push({ topicId: topic.topicId, pool: combined });
  }

  if (topicPools.length === 0) return [];

  const targetTotal = Math.min(30, Math.max(15, topicPools.length * 3));
  const perTopic = Math.max(1, Math.ceil(targetTotal / topicPools.length));

  const selectedKeys = new Set();
  const selectedTexts = new Set();
  const selectedQuestions = [];

  function normalizeQuestionText(q) {
    return (q.question || '').toLowerCase()
      .replace(/[^a-z0-9äöüß\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function pickFromPool(pool, count) {
    const scored = pool.map((q) => ({
      q,
      score: scoreCooldown(q.semanticKey, history) + (Math.random() * 0.01),
    }));
    scored.sort((a, b) => b.score - a.score);
    const chosen = [];
    for (const { q } of scored) {
      if (chosen.length >= count) break;
      const text = normalizeQuestionText(q);
      if (!selectedKeys.has(q.semanticKey) && !selectedTexts.has(text) && q.semanticKey) {
        selectedKeys.add(q.semanticKey);
        selectedTexts.add(text);
        chosen.push(q);
      }
    }
    return chosen;
  }

  // First pass: one batch per topic, topic distribution balanced.
  for (const { pool } of topicPools) {
    selectedQuestions.push(...pickFromPool(pool, perTopic));
  }

  // Fill up to 15 or targetTotal from remaining under-represented topics.
  const remainingByTopic = topicPools.map(({ pool }) =>
    pool.filter((q) => !selectedKeys.has(q.semanticKey)));
  while (selectedQuestions.length < Math.max(15, targetTotal) && remainingByTopic.some((p) => p.length > 0)) {
    for (const pool of remainingByTopic) {
      if (selectedQuestions.length >= Math.max(15, targetTotal)) break;
      const next = pool
        .map((q) => ({ q, score: scoreCooldown(q.semanticKey, history) + (Math.random() * 0.01) }))
        .sort((a, b) => b.score - a.score)[0];
      if (next) {
        const text = normalizeQuestionText(next.q);
        if (!selectedKeys.has(next.q.semanticKey) && !selectedTexts.has(text)) {
          selectedKeys.add(next.q.semanticKey);
          selectedTexts.add(text);
          selectedQuestions.push(next.q);
        }
      }
    }
    remainingByTopic.forEach((pool) => {
      for (let i = pool.length - 1; i >= 0; i--) {
        if (selectedKeys.has(pool[i].semanticKey)) pool.splice(i, 1);
      }
    });
  }

  // Cisco command-recall boost: 15-35% share.
  const isCisco = categoryId === 'cisco-packet-tracer';
  if (isCisco) {
    const minCommand = Math.max(2, Math.round(targetTotal * 0.25));
    let commandCount = selectedQuestions.filter((q) => q.isCommandRecall).length;
    if (commandCount < minCommand) {
      const usedKeys = new Set(selectedKeys);
      const usedTexts = new Set(selectedTexts);
      const commandBank = collectCommandRecallQuestionsForCategory(categoryId)
        .filter((q) => !usedKeys.has(q.semanticKey) && !usedTexts.has(normalizeQuestionText(q)))
        .sort((a, b) => scoreCooldown(b.semanticKey, history) - scoreCooldown(a.semanticKey, history));
      const needed = minCommand - commandCount;
      const extra = commandBank.slice(0, needed);
      extra.forEach((q) => {
        selectedKeys.add(q.semanticKey);
        usedTexts.add(normalizeQuestionText(q));
      });
      while (selectedQuestions.length + extra.length > targetTotal && selectedQuestions.some((q) => !q.isCommandRecall)) {
        const nonCommand = selectedQuestions.findIndex((q) => !q.isCommandRecall);
        if (nonCommand === -1) break;
        const removed = selectedQuestions.splice(nonCommand, 1)[0];
        selectedKeys.delete(removed.semanticKey);
      }
      selectedQuestions.push(...extra);
    }
  }

  const unique = [];
  const finalTexts = new Set();
  for (const q of selectedQuestions) {
    const text = normalizeQuestionText(q);
    if (!finalTexts.has(text)) {
      finalTexts.add(text);
      unique.push(q);
    }
  }
  return shuffleArray(unique).slice(0, 30);
}

/**
 * Generates the big Abschlusscheck across all categories.
 * Draws up to 10 questions per category, aiming for 50-100 total.
 */
export function generateAbschlusscheck() {
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
    const shuffled = shuffleArray(categoryPool);
    const count = Math.min(shuffled.length, 10);
    allQuestions.push(...shuffled.slice(0, count));
  }

  return shuffleArray(allQuestions);
}

// ---------- Availability ----------

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
