// =============================================================================
// NEXUS Academy - progression engine.
//
// This is the ONLY place that:
//  - clamps competency scores to 0-100
//  - decides status transitions (locked/available/started/learned/applied/
//    consolidated) using the central, tunable thresholds in
//    academyThresholds.js
//  - resolves prerequisites (incl. cross-category) to unlock topics
//  - unlocks tools and emits "world unlock" events for later UI to consume
//
// Every activity function below touches ONLY the specific topic it is
// called for - there is no cross-topic side effect (e.g. a DNS mission can
// only ever move the "dns" topic, never "linux" or "cisco" topics).
//
// Milestone A ("Sam als Mentor & NEXUS Academy") architecture decision:
// this engine (+ academyProgress.js + academyTopics.js) is the SINGLE
// source of truth for Academy topics, lesson content and topic-level
// progress/status going forward. It is NOT merged with gameState.js
// (missions/tools/XP - untouched, still the source of truth for those) or
// competency.js (legacy freetext quest-mastery tracking - untouched,
// documented as a separate parallel system, not bridged in this milestone).
// New Academy lessons (e.g. "Grundbegriffe" in AcademyTopic.jsx) call
// straight into applyMentorLesson/applyQuiz/etc. below - no second topic
// catalog, no second persistence, no second status machine was introduced.
// =============================================================================
import { ACADEMY_TOPICS, TOPIC_STATUS, resolvePrerequisiteRef, topicKey } from './academyTopics.js';
import { ACADEMY_THRESHOLDS, ACTIVITY_SCORE_DELTAS, SCORE_MIN, SCORE_MAX, PLACEMENT_PASS_SCORE } from './academyThresholds.js';
import { readAcademyProgress, writeAcademyProgress, updateTopicProgress, getTopicProgress } from './academyProgress.js';

// Ranks used to enforce monotonic (never-downgrade) status progression once
// a topic is unlocked (LOCKED/AVAILABLE are handled separately, since they
// depend on prerequisites rather than activity).
const STATUS_RANK = {
  [TOPIC_STATUS.AVAILABLE]: 0,
  [TOPIC_STATUS.STARTED]: 1,
  [TOPIC_STATUS.LEARNED]: 2,
  [TOPIC_STATUS.APPLIED]: 3,
  [TOPIC_STATUS.CONSOLIDATED]: 4,
};

export function clampScore(value) {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(value)));
}

// Simple weighted overall competency value (0-100) derived from the three
// separate scores - never stored, always computed on demand.
export function overallScore(topic) {
  return clampScore(topic.theoryScore * 0.3 + topic.practiceScore * 0.4 + topic.retentionScore * 0.3);
}

function rankOf(status) {
  return STATUS_RANK[status] ?? -1;
}

function upgradeStatus(current, candidate) {
  return rankOf(candidate) > rankOf(current) ? candidate : current;
}

// Computes the next status for a topic that is already AVAILABLE or beyond
// (LOCKED topics are handled by refreshUnlocks/prerequisitesMet instead).
// Transitions only ever move forward - scores dipping back down (which
// doesn't happen today, but might once decay/forgetting is modeled) never
// silently demotes a topic the player already reached.
export function computeNextStatus(progress) {
  if (progress.status === TOPIC_STATUS.LOCKED) return progress.status;
  let next = progress.status;
  const { theoryScore, practiceScore, retentionScore, appliedCount, repetitionCount } = progress;

  if (theoryScore >= ACADEMY_THRESHOLDS.started.minAnyScore || practiceScore >= ACADEMY_THRESHOLDS.started.minAnyScore) {
    next = upgradeStatus(next, TOPIC_STATUS.STARTED);
  }
  if (theoryScore >= ACADEMY_THRESHOLDS.learned.minTheoryScore) {
    next = upgradeStatus(next, TOPIC_STATUS.LEARNED);
  }
  if (rankOf(next) >= rankOf(TOPIC_STATUS.LEARNED)
    && practiceScore >= ACADEMY_THRESHOLDS.applied.minPracticeScore
    && appliedCount >= ACADEMY_THRESHOLDS.applied.minApplications) {
    next = upgradeStatus(next, TOPIC_STATUS.APPLIED);
  }
  if (rankOf(next) >= rankOf(TOPIC_STATUS.APPLIED)
    && retentionScore >= ACADEMY_THRESHOLDS.consolidated.minRetentionScore
    && repetitionCount >= ACADEMY_THRESHOLDS.consolidated.minRepetitions) {
    next = upgradeStatus(next, TOPIC_STATUS.CONSOLIDATED);
  }
  return next;
}

// Whether every prerequisite of a topic is fulfilled. A prerequisite counts
// as fulfilled once it reaches 15% overall progress OR has been completed at
// least once (lessonCompletions >= 1) OR the LEARNED status - whichever comes
// first. This ensures a single full pass through a lesson always unlocks the
// next topic without requiring grind.
export function prerequisitesMet(topicDef, progressByKey) {
  return topicDef.prerequisites.every((ref) => {
    const { categoryId, topicId: tid } = resolvePrerequisiteRef(topicDef.categoryId, ref);
    const prereqProgress = progressByKey[topicKey(categoryId, tid)];
    if (!prereqProgress) return false;
    if (rankOf(prereqProgress.status) >= rankOf(TOPIC_STATUS.LEARNED)) return true;
    if ((prereqProgress.lessonCompletions || 0) >= 1) return true;
    return topicOverallProgress(prereqProgress) >= 15;
  });
}

// Promotes any currently-LOCKED topic to AVAILABLE once its prerequisites
// are fulfilled. Never touches topics that are already AVAILABLE or beyond -
// this is purely a one-way unlock pass, mutates `data` in place and returns
// the list of topics that changed (for unlock-event emission by callers).
function refreshUnlocks(data) {
  const changed = [];
  ACADEMY_TOPICS.forEach((topicDef) => {
    const key = topicKey(topicDef.categoryId, topicDef.topicId);
    const progress = data.topics[key];
    if (!progress || progress.status !== TOPIC_STATUS.LOCKED) return;
    if (prerequisitesMet(topicDef, data.topics)) {
      progress.status = TOPIC_STATUS.AVAILABLE;
      changed.push({ categoryId: topicDef.categoryId, topicId: topicDef.topicId, status: TOPIC_STATUS.AVAILABLE });
    }
  });
  return changed;
}

// Run a single unlock pass on the persisted progress data. Call this once
// when the Academy is first accessed so that topics whose prerequisites
// were fulfilled in a previous session (or by the 15 % threshold change)
// get promoted from LOCKED → AVAILABLE immediately.
export function ensureInitialUnlocks() {
  const data = readAcademyProgress();
  const changed = refreshUnlocks(data);
  if (changed.length > 0) {
    writeAcademyProgress(data);
    changed.forEach((u) => emitAcademyUnlockEvent({ ...u, previousStatus: 'locked' }));
  }
  return changed;
}

// Dispatches a window CustomEvent for later UI (Desktop app activation,
// shelf book, whiteboard entry, Sam's new topic, server room devices) to
// react to. No listeners exist yet on purpose - this phase only needs the
// event to be emitted (see task: "Es reicht, wenn das System entsprechende
// Unlock-Events erzeugen kann").
export function emitAcademyUnlockEvent(detail) {
  window.dispatchEvent(new CustomEvent('cyberlearn:academy-unlock', { detail }));
}

// Core write path for every activity below: applies score deltas + optional
// applied/repetition increments to exactly ONE topic, recomputes its status,
// refreshes any newly-unlocked LOCKED topics, persists, and emits unlock
// events for every status change (including topics unlocked as a side
// effect via refreshUnlocks).
function applyToTopic(categoryId, topicId, deltas = {}, options = {}) {
  const data = readAcademyProgress();
  const key = topicKey(categoryId, topicId);
  const current = data.topics[key];
  if (!current) return null;
  if (current.status === TOPIC_STATUS.LOCKED) return current; // no points while locked

  const previousStatus = current.status;
  const updated = {
    ...current,
    theoryScore: clampScore(current.theoryScore + (deltas.theory || 0)),
    practiceScore: clampScore(current.practiceScore + (deltas.practice || 0)),
    retentionScore: clampScore(current.retentionScore + (deltas.retention || 0)),
    appliedCount: current.appliedCount + (options.applied ? 1 : 0),
    repetitionCount: current.repetitionCount + (options.repetition ? 1 : 0),
  };
  updated.status = computeNextStatus(updated);
  data.topics[key] = updated;

  const unlockedByPrereq = refreshUnlocks(data);
  writeAcademyProgress(data);

  if (updated.status !== previousStatus) {
    emitAcademyUnlockEvent({ categoryId, topicId, previousStatus, status: updated.status });
  }
  unlockedByPrereq.forEach((u) => emitAcademyUnlockEvent({ ...u, previousStatus: TOPIC_STATUS.LOCKED }));

  return updated;
}

// ---------------------------------------------------------------------------
// Activity entry points - each maps to exactly one score dimension (per the
// "Kompetenzwerte" spec) and touches only the ONE topic it is called for.
// ---------------------------------------------------------------------------

// Mentor lesson with Sam ("Einführung") -> theoryScore.
export function applyMentorLesson(categoryId, topicId, amount = ACTIVITY_SCORE_DELTAS.mentorLesson.theory) {
  return applyToTopic(categoryId, topicId, { theory: amount });
}

// Mini exercise ("Kurze Wiederholung" / practical drill) -> practiceScore.
export function applyMiniExercise(categoryId, topicId, amount = ACTIVITY_SCORE_DELTAS.miniExercise.practice) {
  return applyToTopic(categoryId, topicId, { practice: amount });
}

// Main mission successfully applying the topic -> practiceScore + a real
// "applied" event (required for the applied status, not just a score).
export function applyMainMission(categoryId, topicId, amount = ACTIVITY_SCORE_DELTAS.mainMission.practice) {
  return applyToTopic(categoryId, topicId, { practice: amount }, { applied: true });
}

// Side mission (repetition/spaced review) -> retentionScore + a repetition
// event (required for consolidated, not just a score).
export function applySideMission(categoryId, topicId, amount = ACTIVITY_SCORE_DELTAS.sideMission.retention) {
  return applyToTopic(categoryId, topicId, { retention: amount }, { repetition: true });
}

// Quiz -> theoryScore OR retentionScore depending on the quiz's intent.
export function applyQuiz(categoryId, topicId, kind = 'theory') {
  const amount = kind === 'retention' ? ACTIVITY_SCORE_DELTAS.quizRetention.retention : ACTIVITY_SCORE_DELTAS.quizTheory.theory;
  return applyToTopic(categoryId, topicId, kind === 'retention' ? { retention: amount } : { theory: amount });
}

// Reflection -> small bonus toward diagnostic understanding, modeled as a
// modest retentionScore bump (reflection consolidates what was learned).
//
// TRANSITIONAL: this is a stand-in, not a final design decision. The data
// model only defines theory/practice/retention scores today, so reflection's
// "diagnostic understanding" is folded into retentionScore for now. Long
// term, reflection may deserve its own dedicated `diagnosticScore` field
// once that's justified - no data model change is made here.
export function applyReflectionBonus(categoryId, topicId, amount = ACTIVITY_SCORE_DELTAS.reflectionBonus.retention) {
  return applyToTopic(categoryId, topicId, { retention: amount });
}

// Records the learner's preferred explanation style globally. This is used
// by LessonRunner to default to the style the player found most helpful.
export function recordPreferredStyle(style) {
  const data = readAcademyProgress();
  data.playerProfile = { ...data.playerProfile, preferredExplanationStyle: style };
  writeAcademyProgress(data);
}

// Records that the learner completed a full lesson with the given style.
// Bumps theoryScore via applyMentorLesson only on the FIRST completion to
// prevent farming by reopening the lesson; subsequent completions only update
// the style and the completion counter. Also marks the lesson content as 100 % seen.
// Marks the percentage of lesson content that has actually been viewed.
// Useful for resume and mastery checks without awarding completion points.
export function recordContentSeen(categoryId, topicId, percent) {
  const progress = getTopicProgress(categoryId, topicId);
  if (!progress || progress.status === TOPIC_STATUS.LOCKED) return null;
  const normalized = clampScore(percent);
  if ((progress.contentSeenPercent || 0) >= normalized) return progress;
  updateTopicProgress(categoryId, topicId, { contentSeenPercent: normalized });
  return topicProgressAfter(topicKey(categoryId, topicId));
}

export function recordLessonCompletion(categoryId, topicId, style) {
  const progress = getTopicProgress(categoryId, topicId);
  if (!progress || progress.status === TOPIC_STATUS.LOCKED) return null;
  const firstCompletion = progress.lessonCompletions === 0;
  const scored = firstCompletion ? applyMentorLesson(categoryId, topicId) : progress;
  if (!scored) return null;
  const key = topicKey(categoryId, topicId);
  updateTopicProgress(categoryId, topicId, {
    lastExplanationStyle: style,
    lessonCompletions: (scored.lessonCompletions || 0) + 1,
    contentSeenPercent: 100,
  });
  // Refresh unlocks now that lessonCompletions >= 1 and contentSeenPercent = 100.
  // This ensures dependents are unlocked immediately after a single completion,
  // even if applyMentorLesson's earlier refreshUnlocks didn't trigger them.
  const data = readAcademyProgress();
  const unlocked = refreshUnlocks(data);
  if (unlocked.length > 0) {
    writeAcademyProgress(data);
    unlocked.forEach((u) => emitAcademyUnlockEvent({ ...u, previousStatus: TOPIC_STATUS.LOCKED }));
  }
  return topicProgressAfter(key);
}

// Records a full quiz result: attempts, perfect runs, best/last score.
// Awards retention points for a perfect run; theory points for a passing run
// are intentionally not added here to avoid double-counting per-question scoring.
export function recordQuizResult(categoryId, topicId, { total, correct }) {
  const progress = getTopicProgress(categoryId, topicId);
  if (!progress || progress.status === TOPIC_STATUS.LOCKED) return null;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const perfect = correct === total && total > 0;
  const nextStreak = perfect ? (progress.quizPerfectStreak || 0) + 1 : 0;
  const patch = {
    quizAttempts: (progress.quizAttempts || 0) + 1,
    quizPerfectCount: (progress.quizPerfectCount || 0) + (perfect ? 1 : 0),
    quizPerfectStreak: nextStreak,
    quizBestScore: Math.max(progress.quizBestScore || 0, percent),
    quizLastScore: percent,
  };
  if (perfect) {
    patch.retentionScore = clampScore((progress.retentionScore || 0) + ACTIVITY_SCORE_DELTAS.quizRetention.retention);
  }
  updateTopicProgress(categoryId, topicId, patch);
  return topicProgressAfter(topicKey(categoryId, topicId));
}

// Whether a topic satisfies the mastery criteria:
//  - full lesson content seen (100 %)
//  - all mandatory sections/exercises completed (no pending required exercise)
//  - three perfect quiz runs
//  - required practice completed if the topic has exercises/missions
export function isTopicMastered(categoryId, topicId, hasPractice = false) {
  const progress = getTopicProgress(categoryId, topicId);
  if (!progress) return false;
  if (progress.contentSeenPercent < 100) return false;
  if ((progress.quizPerfectCount || 0) < 3) return false;
  if (hasPractice && progress.practiceScore < ACADEMY_THRESHOLDS.applied.minPracticeScore) return false;
  return true;
}

// Calculates the overall visible progress for a topic (0-100) from the three
// competency scores, content seen, and quiz mastery. Always returns a clamped integer.
export function topicOverallProgress(topic) {
  if (!topic) return 0;
  const score = overallScore(topic) * 0.6 + (topic.contentSeenPercent || 0) * 0.3 + Math.min((topic.quizPerfectCount || 0) / 3, 1) * 100 * 0.1;
  return clampScore(score);
}

function topicProgressAfter(key, data) {
  return (data || readAcademyProgress()).topics[key];
}

// Marks a lesson as started (used for resume greeting). No score.
export function recordLessonStart(categoryId, topicId) {
  const progress = getTopicProgress(categoryId, topicId);
  if (!progress || progress.status === TOPIC_STATUS.LOCKED) return progress;
  if (progress.startedAt) return progress;
  const key = topicKey(categoryId, topicId);
  updateTopicProgress(categoryId, topicId, { startedAt: Date.now() });
  return topicProgressAfter(key);
}

// Records that a specific lesson section was completed. Idempotent per
// sectionId so repeated navigation does not award points.
export function recordSectionCompletion(categoryId, topicId, sectionId, sectionTitle) {
  const progress = getTopicProgress(categoryId, topicId);
  if (!progress || progress.status === TOPIC_STATUS.LOCKED) return progress;
  if (progress.completedSectionIds.includes(sectionId)) return progress;
  const key = topicKey(categoryId, topicId);
  updateTopicProgress(categoryId, topicId, {
    completedSectionIds: [...progress.completedSectionIds, sectionId],
    lastCompletedSectionId: sectionId,
    lastCompletedSectionTitle: sectionTitle || null,
  });
  return topicProgressAfter(key);
}

// Records a question answer once. Points are only awarded for correct answers.
// Returns the current progress if already answered so callers can skip
// awarding repeated theory points. Wrong answers do not lock the question;
// the player can retry until correct.
export function recordQuestionAnswer(categoryId, topicId, questionId, kind = 'theory', correct = true) {
  const progress = getTopicProgress(categoryId, topicId);
  if (!progress || progress.status === TOPIC_STATUS.LOCKED) return null;
  if (progress.completedQuestionIds.includes(questionId)) return progress;
  if (!correct) return progress;
  const scored = applyQuiz(categoryId, topicId, kind);
  if (!scored) return null;
  const key = topicKey(categoryId, topicId);
  updateTopicProgress(categoryId, topicId, {
    completedQuestionIds: [...scored.completedQuestionIds, questionId],
  });
  return topicProgressAfter(key);
}

// Records an exercise completion once. Returns the current progress if already
// completed so callers can skip awarding repeated practice points.
export function recordExerciseCompletion(categoryId, topicId, exerciseId) {
  const progress = getTopicProgress(categoryId, topicId);
  if (!progress || progress.status === TOPIC_STATUS.LOCKED) return null;
  if (progress.completedExerciseIds.includes(exerciseId)) return progress;
  const scored = applyMiniExercise(categoryId, topicId);
  if (!scored) return null;
  const key = topicKey(categoryId, topicId);
  updateTopicProgress(categoryId, topicId, {
    completedExerciseIds: [...scored.completedExerciseIds, exerciseId],
  });
  return topicProgressAfter(key);
}

// Explicit override used by placement tests: marks a topic as LEARNED
// directly (bypassing the normal score thresholds) and still runs the
// unlock-refresh pass so downstream topics react correctly.
export function markTopicLearned(categoryId, topicId) {
  const data = readAcademyProgress();
  const key = topicKey(categoryId, topicId);
  const current = data.topics[key];
  if (!current) return null;
  const previousStatus = current.status;
  const updated = { ...current, status: upgradeStatus(current.status, TOPIC_STATUS.LEARNED) };
  data.topics[key] = updated;
  const unlockedByPrereq = refreshUnlocks(data);
  writeAcademyProgress(data);
  if (updated.status !== previousStatus) emitAcademyUnlockEvent({ categoryId, topicId, previousStatus, status: updated.status });
  unlockedByPrereq.forEach((u) => emitAcademyUnlockEvent({ ...u, previousStatus: TOPIC_STATUS.LOCKED }));
  return updated;
}

// ---------------------------------------------------------------------------
// Tool unlocking. Tools are recorded on the topic that introduced them
// (`unlockedTools`); `isToolUnlocked` checks across ALL topics so callers
// don't need to know which topic granted a given tool.
// ---------------------------------------------------------------------------
export function unlockTool(categoryId, topicId, toolId) {
  const data = readAcademyProgress();
  const key = topicKey(categoryId, topicId);
  const current = data.topics[key];
  if (!current || current.unlockedTools.includes(toolId)) return data.topics[key] || null;
  const updated = { ...current, unlockedTools: [...current.unlockedTools, toolId] };
  data.topics[key] = updated;
  writeAcademyProgress(data);
  emitAcademyUnlockEvent({ categoryId, topicId, tool: toolId, type: 'tool-unlock' });
  return updated;
}

export function isToolUnlocked(toolId) {
  const data = readAcademyProgress();
  return Object.values(data.topics).some((t) => t.unlockedTools.includes(toolId));
}

// ---------------------------------------------------------------------------
// Placement test support (see academyMode.js for mode selection). A passed
// placement test marks every topicId given as LEARNED directly; a failed
// one changes nothing (no punishment) - callers use the returned per-topic
// scores to show Sam's recommendation for weak areas.
// ---------------------------------------------------------------------------
export function evaluatePlacementTest(correctCount, totalCount) {
  const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  return { percent, passed: percent >= PLACEMENT_PASS_SCORE };
}

export function markLearnedFromPlacement(topicRefs) {
  return topicRefs.map(({ categoryId, topicId }) => markTopicLearned(categoryId, topicId));
}
