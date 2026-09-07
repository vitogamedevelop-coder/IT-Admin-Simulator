// =============================================================================
// NEXUS Academy – Learning Mastery / Recovery / Review Layer (C4)
//
// Builds on C3 evidence. Interprets correct/partial/wrong answers into a
// compact, per-facet mastery state stored inside academyProgress.
//
// Principles:
// - No new parallel store. Mastery lives in topic.mastery[key] in academyProgress.
// - No gamification score. Mastery describes competence, not XP.
// - Bounded state (counters/flags/timestamps), not an event log.
// - Partial is neither correct nor wrong.
// - Wrong creates needsReview/recoveryPending; solution display does NOT clear.
// - Recovery only clears when the learner demonstrates the same competence
//   again in a different question/instance after a minimum gap.
// - Correct != mastered; a single success is not forever.
// =============================================================================

import { topicKey } from './academyTopics.js';
import { readAcademyProgress, writeAcademyProgress } from './academyProgress.js';
import {
  EVIDENCE_TYPES, rankOfEvidence, isEvidenceType, applyEvidenceToData, recordEvidence,
} from './learningEvidence.js';

// Tunable constants. All times in ms.
const MASTERY = {
  MIN_GAP_FOR_RECOVERY: 60 * 1000, // 1 minute; within a lesson several steps should pass
  REVIEW_WINDOW: 7 * 24 * 60 * 60 * 1000,
  RECENT_AGE: 24 * 60 * 60 * 1000,
  STABLE_CONFIDENCE: 0.75,
  STABLE_STABILITY: 0.65,
  PARTIAL_CREDIT: 0.4,
  WRONG_PENALTY: 0.15,
  WRONG_PENALTY_GROWTH: 0.08,
  HINT_PENALTY: 0.85,
  DIFFICULTY: { easy: 0.85, medium: 1.0, hard: 1.2 },
  EVIDENCE_CONFIDENCE: {
    [EVIDENCE_TYPES.VIEWED]: 0.00,
    [EVIDENCE_TYPES.SELF_REPORTED]: 0.05,
    [EVIDENCE_TYPES.RECOGNIZED]: 0.15,
    [EVIDENCE_TYPES.UNDERSTOOD]: 0.25,
    [EVIDENCE_TYPES.RECALLED]: 0.35,
    [EVIDENCE_TYPES.APPLIED]: 0.45,
    [EVIDENCE_TYPES.DIAGNOSED]: 0.55,
    [EVIDENCE_TYPES.TRANSFERRED]: 0.65,
  },
};

export const MASTERY_STATES = Object.freeze({
  NEW: 'new',
  LEARNING: 'learning',
  UNCERTAIN: 'uncertain',
  STABLE: 'stable',
  NEEDS_REVIEW: 'needs-review',
});

function clamp01(v) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function normalizeDifficulty(value) {
  const s = String(value || 'medium').toLowerCase();
  if (s === 'easy' || s === '0' || s === '1') return 'easy';
  if (s === 'hard' || s === '2') return 'hard';
  return 'medium';
}

function difficultyMultiplier(value) {
  return MASTERY.DIFFICULTY[normalizeDifficulty(value)] ?? 1.0;
}

export function defaultFacetMastery() {
  return {
    confidence: 0,
    stability: 0,
    lastEvidenceType: null,
    lastEvidenceAt: null,
    lastSuccessAt: null,
    lastFailureAt: null,
    lastFailureSource: null,
    lastFailureEvidenceRank: -1,
    consecutiveSuccesses: 0,
    recentFailureCount: 0,
    totalAttempts: 0,
    needsReview: false,
    recoveryPending: false,
    lastDifficulty: 'medium',
  };
}

function getOrCreateMastery(topic, facetId) {
  topic.mastery = topic.mastery || {};
  if (!topic.mastery[facetId]) {
    topic.mastery[facetId] = defaultFacetMastery();
  }
  return topic.mastery[facetId];
}

function determineMasteryState(m) {
  if (m.recoveryPending || m.needsReview) return MASTERY_STATES.NEEDS_REVIEW;
  if (m.confidence >= MASTERY.STABLE_CONFIDENCE && m.stability >= MASTERY.STABLE_STABILITY) {
    return MASTERY_STATES.STABLE;
  }
  if (m.consecutiveSuccesses > 0) return MASTERY_STATES.LEARNING;
  if (m.confidence <= 0.25 && m.stability <= 0.3 && m.totalAttempts === 0) return MASTERY_STATES.NEW;
  if (m.recentFailureCount > 0 && m.confidence < MASTERY.STABLE_CONFIDENCE) return MASTERY_STATES.UNCERTAIN;
  return MASTERY_STATES.LEARNING;
}

function timeSeparationFactor(lastAt, at) {
  if (!lastAt) return 1.0;
  const dt = at - lastAt;
  if (dt < 1000) return 0.6; // immediate repetition
  if (dt < 5 * 60 * 1000) return 0.9;
  if (dt < 60 * 60 * 1000) return 1.0;
  if (dt < 24 * 60 * 60 * 1000) return 1.2;
  return 1.4;
}

function updateMasteryFromResult(m, {
  evidenceType,
  correct,
  partial,
  difficulty,
  source,
  at,
  usedHint,
}) {
  const baseConfidence = MASTERY.EVIDENCE_CONFIDENCE[evidenceType] || 0;
  const diffMult = difficultyMultiplier(difficulty);
  const hintMult = usedHint ? MASTERY.HINT_PENALTY : 1.0;
  const evidenceValue = baseConfidence * diffMult * hintMult;

  m.lastEvidenceType = evidenceType;
  m.lastEvidenceAt = at;
  m.lastDifficulty = normalizeDifficulty(difficulty);

  // Success / partial / wrong
  if (correct && !partial) {
    m.totalAttempts += 1;
    m.consecutiveSuccesses += 1;
    m.recentFailureCount = Math.max(0, m.recentFailureCount - 1);

    // Confidence grows with an EMA-like update; first attempts move faster.
    const alpha = m.totalAttempts < 5 ? 0.3 : 0.15;
    m.confidence = clamp01(m.confidence * (1 - alpha) + evidenceValue * alpha);

    // Stability benefits from spaced successes, not immediate repetition.
    // Measure the time since the PREVIOUS successful evidence before updating lastSuccessAt.
    const previousSuccessAt = m.lastSuccessAt;
    const realSpacing = previousSuccessAt ? at - previousSuccessAt : Infinity;
    const spacing = timeSeparationFactor(previousSuccessAt, at);
    // If the same source is used very quickly, spacing factor is low.
    const finalSpacing = realSpacing < MASTERY.MIN_GAP_FOR_RECOVERY ? 0.6 : spacing;
    const stabGain = evidenceValue * 0.12 * finalSpacing * (1 + Math.min(2, m.consecutiveSuccesses) * 0.1);
    m.stability = clamp01(m.stability * 0.94 + stabGain);
    m.lastSuccessAt = at;

    // Recovery may close if this is a different, sufficiently delayed correct
    // response to the same facet (same question too soon does not count).
    if (m.recoveryPending) {
      const sameSource = source && source === m.lastFailureSource;
      const tooSoon = m.lastFailureAt && (at - m.lastFailureAt) < MASTERY.MIN_GAP_FOR_RECOVERY;
      const weaker = m.lastFailureEvidenceRank >= 0 && rankOfEvidence(evidenceType) < m.lastFailureEvidenceRank;
      if (!sameSource && !tooSoon && !weaker) {
        m.recoveryPending = false;
      }
    }

    if (m.confidence >= MASTERY.STABLE_CONFIDENCE) {
      m.needsReview = false;
    }
  } else if (partial) {
    m.totalAttempts += 1;
    m.consecutiveSuccesses = 0;
    const alpha = m.totalAttempts < 5 ? 0.25 : 0.12;
    m.confidence = clamp01(m.confidence * (1 - alpha) + evidenceValue * MASTERY.PARTIAL_CREDIT * alpha);
    m.stability = clamp01(m.stability * 0.95 + evidenceValue * 0.04); // partial gives little stability
    if (m.confidence < 0.4) m.needsReview = true;
  } else { // wrong
    m.totalAttempts += 1;
    m.consecutiveSuccesses = 0;
    m.recentFailureCount = Math.min(3, m.recentFailureCount + 1);
    m.lastFailureAt = at;
    m.lastFailureSource = source;
    m.lastFailureEvidenceRank = rankOfEvidence(evidenceType);
    m.lastFailureAt = at;

    const penalty = MASTERY.WRONG_PENALTY + MASTERY.WRONG_PENALTY_GROWTH * (m.recentFailureCount - 1);
    m.confidence = clamp01(m.confidence - penalty);
    m.stability = clamp01(m.stability - penalty * 0.8);
    m.needsReview = true;
    m.recoveryPending = true;
  }

  // recentFailureCount is a bounded counter; it decays over time
  // by read-side helpers, but we update it here if stale.
  if (m.lastFailureAt && (at - m.lastFailureAt) > MASTERY.REVIEW_WINDOW) {
    m.recentFailureCount = Math.max(0, m.recentFailureCount - 1);
  }
}

export function recordLearningResult({
  categoryId,
  topicId,
  facetIds = [],
  evidenceType,
  source = '',
  correct = true,
  partial = false,
  difficulty = 'medium',
  usedHint = false,
  at = Date.now(),
}) {
  if (!isEvidenceType(evidenceType)) return null;
  if (evidenceType === EVIDENCE_TYPES.VIEWED || evidenceType === EVIDENCE_TYPES.SELF_REPORTED) {
    // VIEWED / SELF_REPORTED do not exercise mastery.
    return recordEvidence({ categoryId, topicId, facetIds, evidenceType, source, at });
  }

  const data = readAcademyProgress();
  const key = topicKey(categoryId, topicId);
  const topic = data?.topics?.[key];
  if (!topic) return null;

  const targets = facetIds.filter(Boolean);
  if (targets.length === 0) return null;

  const evidenceEntry = applyEvidenceToData(data, {
    categoryId,
    topicId,
    facetIds: targets,
    evidenceType,
    source,
    correct,
    partial,
    at,
  });

  if (!evidenceEntry && !partial && !correct) {
    // Wrong/partial still updates mastery even though no positive evidence.
  }

  targets.forEach((facetId) => {
    const m = getOrCreateMastery(topic, facetId);
    updateMasteryFromResult(m, {
      evidenceType,
      correct,
      partial,
      difficulty,
      source,
      at,
      usedHint,
    });
    m.state = determineMasteryState(m);
  });

  writeAcademyProgress(data);
  return { evidence: evidenceEntry, topic: data.topics[key] };
}

export function getFacetMastery(categoryId, topicId, facetId) {
  if (!categoryId || !topicId || !facetId) return null;
  const data = readAcademyProgress();
  const topic = data?.topics?.[topicKey(categoryId, topicId)];
  if (!topic?.mastery?.[facetId]) return { ...defaultFacetMastery(), facetId };
  return { ...topic.mastery[facetId], state: determineMasteryState(topic.mastery[facetId]), facetId };
}

export function getTopicMastery(categoryId, topicId) {
  const data = readAcademyProgress();
  const topic = data?.topics?.[topicKey(categoryId, topicId)];
  const out = {};
  if (topic?.mastery) {
    Object.entries(topic.mastery).forEach(([facetId, m]) => {
      out[facetId] = { ...m, state: determineMasteryState(m), facetId };
    });
  }
  return out;
}

export function needsRecovery(categoryId, topicId, facetId) {
  return !!getFacetMastery(categoryId, topicId, facetId)?.recoveryPending;
}

export function markRecoverySuccess(categoryId, topicId, facetId, { evidenceType = EVIDENCE_TYPES.RECOGNIZED, source, at = Date.now() } = {}) {
  const data = readAcademyProgress();
  const key = topicKey(categoryId, topicId);
  const topic = data?.topics?.[key];
  if (!topic || !topic.mastery?.[facetId]) return false;
  const m = topic.mastery[facetId];
  const sameSource = source && source === m.lastFailureSource;
  const tooSoon = m.lastFailureAt && (at - m.lastFailureAt) < MASTERY.MIN_GAP_FOR_RECOVERY;
  if (sameSource || tooSoon) return false;
  m.recoveryPending = false;
  m.needsReview = m.confidence < MASTERY.STABLE_CONFIDENCE;
  applyEvidenceToData(data, { categoryId, topicId, facetIds: [facetId], evidenceType, source, at, correct: true });
  m.lastEvidenceType = evidenceType;
  m.lastEvidenceAt = at;
  m.state = determineMasteryState(m);
  writeAcademyProgress(data);
  return true;
}

// Review priority: higher = review sooner.
// Soft model: recent failure > partial > low confidence > long unseen.
export function getReviewPriority(categoryId, topicId, facetId) {
  const now = Date.now();
  const m = getFacetMastery(categoryId, topicId, facetId);
  if (!m) return 0;
  let p = 0;
  if (m.recoveryPending) p += 80;
  if (m.needsReview) p += 50;
  if (m.recentFailureCount > 0) p += 30 * m.recentFailureCount;
  if (m.lastFailureAt && now - m.lastFailureAt < MASTERY.RECENT_AGE) p += 20;

  p += (1 - m.confidence) * 40;
  p += (1 - m.stability) * 30;

  // Long time since last evidence raises priority again.
  if (m.lastEvidenceAt) {
    const age = now - m.lastEvidenceAt;
    if (age > MASTERY.REVIEW_WINDOW) p += 15;
    else if (age > MASTERY.RECENT_AGE * 3) p += 5;
  } else {
    p += 5; // never seen
  }

  // Stable masteries get lower priority.
  if (m.state === MASTERY_STATES.STABLE) p -= 60;
  if (m.state === MASTERY_STATES.LEARNING) p += 5;

  return Math.max(0, Math.round(p));
}

export function getReviewCandidates(categoryId, topicId, { limit = 10, includeStable = false } = {}) {
  const topic = readAcademyProgress().topics?.[topicKey(categoryId, topicId)];
  if (!topic?.mastery) return [];
  const now = Date.now();
  const entries = Object.entries(topic.mastery)
    .map(([facetId, m]) => {
      const age = m.lastEvidenceAt ? now - m.lastEvidenceAt : Infinity;
      return { facetId, m: { ...m, state: determineMasteryState(m) }, priority: getReviewPriority(categoryId, topicId, facetId), age };
    })
    .filter((e) => includeStable || e.m.state !== MASTERY_STATES.STABLE)
    .sort((a, b) => b.priority - a.priority || b.age - a.age);
  return entries.slice(0, limit);
}

export function getWeakFacets(categoryId, topicId, { limit = 10 } = {}) {
  const candidates = getReviewCandidates(categoryId, topicId, { limit, includeStable: false });
  return candidates.filter((c) => c.priority > 30 || c.m.recoveryPending || c.m.needsReview);
}

export function getRecommendedDifficulty(categoryId, topicId, facetId) {
  const m = getFacetMastery(categoryId, topicId, facetId);
  if (!m) return 'medium';
  if (m.recoveryPending || m.needsReview || m.confidence < 0.3) return 'easy';
  if (m.confidence >= 0.8 && m.stability >= 0.6) return 'hard';
  return 'medium';
}

export function getMasteryState(categoryId, topicId, facetId) {
  return getFacetMastery(categoryId, topicId, facetId)?.state || MASTERY_STATES.NEW;
}

// Compatibility / diagnostic helpers
export function getMasterySummary(categoryId, topicId) {
  const mastery = getTopicMastery(categoryId, topicId);
  const summary = { total: 0, new: 0, learning: 0, uncertain: 0, stable: 0, needsReview: 0, recoveryPending: 0 };
  Object.values(mastery).forEach((m) => {
    summary.total += 1;
    summary[m.state] = (summary[m.state] || 0) + 1;
    if (m.needsReview) summary.needsReview += 1;
    if (m.recoveryPending) summary.recoveryPending += 1;
  });
  return summary;
}
