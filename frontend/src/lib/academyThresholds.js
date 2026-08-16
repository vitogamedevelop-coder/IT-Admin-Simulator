// =============================================================================
// NEXUS Academy - central, tunable thresholds for status transitions.
//
// These values are the ONLY place status-transition numbers are defined -
// never hardcode a threshold inside a UI component. See academyEngine.js for
// how they're applied (computeNextStatus).
// =============================================================================

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

export const ACADEMY_THRESHOLDS = {
  // available -> started: any real activity on the topic at all.
  started: { minAnyScore: 1 },
  // started -> learned: theoretical foundation reached.
  // With the smaller score deltas this is intentionally attainable after one
  // full explanation pass plus a handful of questions.
  learned: { minTheoryScore: 25 },
  // learned -> applied: REQUIRES both a real mission-application event
  // (not just a score) and a minimum practical competence.
  applied: { minPracticeScore: 20, minApplications: 1 },
  // applied -> consolidated: repeated exposure (e.g. via side missions)
  // plus a solid retention score.
  consolidated: { minRetentionScore: 30, minRepetitions: 2 },
};

// Default score deltas per activity type (see academyEngine.js). Centralized
// so balancing changes never require touching UI or mission code.
export const ACTIVITY_SCORE_DELTAS = {
  // Realistic, incremental gains. A single activity must never push a topic
  // close to completion on its own.
  mentorLesson: { theory: 4 },
  miniExercise: { practice: 6 },
  mainMission: { practice: 12 },
  sideMission: { retention: 6 },
  quizTheory: { theory: 2 },
  quizRetention: { retention: 2 },
  conversationPractice: { practice: 4 },
  // TRANSITIONAL: reflection's "diagnostic understanding" bonus is folded
  // into retentionScore for now, since no dedicated diagnosticScore field
  // exists in the data model yet. See academyEngine.applyReflectionBonus.
  reflectionBonus: { retention: 3 },
};

// Minimum overall placement-test score (0-100) required to mark a topic
// group as "learned" directly (see academyEngine.markLearnedFromPlacement).
export const PLACEMENT_PASS_SCORE = 70;
