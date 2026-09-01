// =============================================================================
// NEXUS Academy - single source of truth for status, theory completion and
// score clamping. This module is deliberately free of side effects (no
// localStorage, no events). It only reads the provided progress object.
// =============================================================================
import { TOPIC_STATUS } from './academyTopics.js';
import { ACADEMY_THRESHOLDS, SCORE_MIN, SCORE_MAX } from './academyThresholds.js';

export function clampScore(value) {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(value)));
}

// Theory completion is a 0-100 percentage of *content* seen/completed.
// theoryScore is a separate fine-grained mastery/quiz score and MUST NOT be
// used as a fallback for the theory completion bar (that was the source of the
// 4 % / 6 % / 10 % / 12 % / 16 % confusion).
export function topicTheoryCompletion(topic) {
  return topic?.theoryCompletion || 0;
}

export function isTopicLearnedOrBeyond(topic) {
  return [TOPIC_STATUS.LEARNED, TOPIC_STATUS.APPLIED, TOPIC_STATUS.CONSOLIDATED].includes(topic?.status);
}

export const STATUS_RANK = {
  [TOPIC_STATUS.LOCKED]: -1,
  [TOPIC_STATUS.AVAILABLE]: 0,
  [TOPIC_STATUS.STARTED]: 1,
  [TOPIC_STATUS.LEARNED]: 2,
  [TOPIC_STATUS.APPLIED]: 3,
  [TOPIC_STATUS.CONSOLIDATED]: 4,
};

export function rankOf(status) {
  return STATUS_RANK[status] ?? -1;
}

export function upgradeStatus(current, candidate) {
  return rankOf(candidate) > rankOf(current) ? candidate : current;
}

// Computes the next status for a topic that is already AVAILABLE or beyond.
// Transitions only ever move forward - the starting status is taken as a floor
// so existing legacy states (e.g. learned) are never silently downgraded.
export function computeNextStatus(progress) {
  if (progress.status === TOPIC_STATUS.LOCKED) return progress.status;
  let next = progress.status;
  const theoryCompleted = topicTheoryCompletion(progress);
  const { theoryScore, practiceScore, retentionScore, appliedCount, repetitionCount } = progress;

  // STARTED: any real activity on the topic (question score, exercise score,
  // or any completed content).
  if (
    theoryScore >= ACADEMY_THRESHOLDS.started.minAnyScore
    || practiceScore >= ACADEMY_THRESHOLDS.started.minAnyScore
    || theoryCompleted >= 1
  ) {
    next = upgradeStatus(next, TOPIC_STATUS.STARTED);
  }

  // LEARNED: the full theory content has been completed.
  // theoryScore is intentionally NOT a shortcut to learned (old minTheoryScore 25
  // would make a topic learned without ever finishing the content).
  if (theoryCompleted >= 100) {
    next = upgradeStatus(next, TOPIC_STATUS.LEARNED);
  }

  // APPLIED: learned + practical mastery + at least one real application.
  if (rankOf(next) >= rankOf(TOPIC_STATUS.LEARNED)
    && practiceScore >= ACADEMY_THRESHOLDS.applied.minPracticeScore
    && appliedCount >= ACADEMY_THRESHOLDS.applied.minApplications) {
    next = upgradeStatus(next, TOPIC_STATUS.APPLIED);
  }

  // CONSOLIDATED: applied + retention + repetition.
  if (rankOf(next) >= rankOf(TOPIC_STATUS.APPLIED)
    && retentionScore >= ACADEMY_THRESHOLDS.consolidated.minRetentionScore
    && repetitionCount >= ACADEMY_THRESHOLDS.consolidated.minRepetitions) {
    next = upgradeStatus(next, TOPIC_STATUS.CONSOLIDATED);
  }
  return next;
}
