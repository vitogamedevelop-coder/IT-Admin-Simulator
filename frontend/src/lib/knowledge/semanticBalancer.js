// =============================================================================
// NEXUS Knowledge Layer – Semantic Balancer
//
// Selects the next Knowledge Item / Question target based on:
//   - topic mastery / weakness
//   - recency across long-term + session history
//   - multi-level semantic cooldown (topic, cluster, item, archetype,
//     calculation family, prefix bucket)
//   - difficulty fit
//   - right/wrong answer handling
//
// Responsibilities:
//   - decide WHAT to ask next.
//   - NOT generate the actual Question Instance (Question Generator does that).
//   - NOT duplicate Academy progress engine (uses injected progress signals).
// =============================================================================

import { createRng } from './random.js';

// ---------------------------------------------------------------------------
// Tunable weights – central, data-driven configuration.
// ---------------------------------------------------------------------------

export const DEFAULT_WEIGHTS = {
  base: 1.0,
  weakTopicBoost: 2.5,          // additive boost for low topic progress
  notMasteredMultiplier: 1.3,     // multiplier if topic is not mastered
  longUnusedBoost: 0.4,         // additive boost per log2 of steps since last seen
  difficultyMatchMultiplier: 1.2,
  difficultyMismatchMultiplier: 0.8,

  // Cooldown penalties (multiply by these factors per recent occurrence)
  topicRepeatPenalty: 0.35,
  clusterRepeatPenalty: 0.45,
  itemRepeatPenalty: 0.08,
  archetypeRepeatPenalty: 0.55,
  templateRepeatPenalty: 0.25,
  calcFamilyRepeatPenalty: 0.5,
  calcTargetRepeatPenalty: 0.55,
  prefixBucketRepeatPenalty: 0.6,

  // Window sizes for recent history considered "similar"
  sessionLookback: 10,
  longTermLookback: 50,

  // Right / wrong answer handling
  correctAnswerItemCooldown: 0.15,
  correctAnswerClusterCooldown: 0.7,
  wrongAnswerItemRetryBoost: 20.0,
  wrongAnswerClusterRetryBoost: 1.3,
  roleMatchMultiplier: 1.15,
};

function defaultProgress() {
  return { overall: 0, status: 'available', mastered: false };
}

function getProgress(progressByTopic, topicKey) {
  if (!progressByTopic) return defaultProgress();
  return progressByTopic[topicKey] || defaultProgress();
}

function normalizeDifficulty(d) {
  if (!d) return null;
  const s = String(d).toLowerCase();
  if (['easy', 'einfach'].includes(s)) return 'easy';
  if (['medium', 'mittel'].includes(s)) return 'medium';
  if (['hard', 'schwer'].includes(s)) return 'hard';
  return s;
}

function semanticSignature(candidate) {
  const data = candidate.data || {};
  return {
    knowledgeItemId: candidate.id || candidate.knowledgeItemId || null,
    topicKey: candidate.topicKey || null,
    conceptCluster: candidate.conceptCluster || null,
    questionArchetype: candidate.type || candidate.questionArchetype || null,
    templateId: candidate.templateId || null,
    calculationFamily: data.calculationFamily || null,
    calculationTarget: data.target || null,
    roleHints: candidate.roleHints || data.roleHints || null,
    prefixBucket: null, // populated after question generation if needed
    // For later question-instance level balancing we also keep raw params key:
    paramKey: data.calculationFamily || data.target || null,
  };
}

function recencyBoost(records, keyFn, candidateKey, maxBoost, lookback) {
  const recent = (records || []).slice(-lookback);
  const lastIndex = recent.findLastIndex((r) => keyFn(r) === candidateKey);
  if (lastIndex < 0) return maxBoost;
  const stepsAgo = recent.length - lastIndex;
  // More recent => smaller boost; older => up to maxBoost.
  return Math.min(maxBoost, Math.log2(Math.max(1, stepsAgo)) / Math.log2(Math.max(2, lookback)) * maxBoost);
}

function countRecent(records, keyFn, candidateKey, lookback) {
  if (candidateKey === null || candidateKey === undefined) return 0;
  return (records || []).slice(-lookback).filter((r) => keyFn(r) === candidateKey).length;
}

function computeWeight(candidate, state, cfg) {
  const sig = semanticSignature(candidate);
  const progress = getProgress(state.progressByTopic, sig.topicKey);
  let weight = cfg.base;

  // Weak topic boost: lower progress => higher weight.
  const overall = Number.isFinite(progress.overall) ? progress.overall : 0;
  weight += cfg.weakTopicBoost * Math.max(0, 1 - overall / 100);

  // Not mastered bonus.
  if (!progress.mastered) weight *= cfg.notMasteredMultiplier;

  // Long-unused boost: has not appeared in session recently.
  const session = state.history?.session || [];
  const longTerm = state.history?.longTerm || [];
  const itemBoost = recencyBoost(session, (r) => r.knowledgeItemId, sig.knowledgeItemId, cfg.longUnusedBoost, cfg.sessionLookback);
  weight += itemBoost;
  const topicBoost = recencyBoost(longTerm, (r) => r.topicKey, sig.topicKey, cfg.longUnusedBoost * 0.5, cfg.longTermLookback);
  weight += topicBoost;

  // Difficulty fit.
  const targetDifficulty = normalizeDifficulty(state.difficultyProfile);
  const candidateDifficulty = normalizeDifficulty(candidate.difficulty);
  if (targetDifficulty && candidateDifficulty) {
    if (targetDifficulty === candidateDifficulty) {
      weight *= cfg.difficultyMatchMultiplier;
    } else {
      const diffMap = { easy: 0, medium: 1, hard: 2 };
      const delta = Math.abs(diffMap[targetDifficulty] - diffMap[candidateDifficulty]);
      weight *= Math.pow(cfg.difficultyMismatchMultiplier, delta);
    }
  }

  // Session cooldown penalties.
  const itemCount = countRecent(session, (r) => r.knowledgeItemId, sig.knowledgeItemId, cfg.sessionLookback);
  weight *= Math.pow(cfg.itemRepeatPenalty, itemCount);

  const topicCount = countRecent(session, (r) => r.topicKey, sig.topicKey, cfg.sessionLookback);
  weight *= Math.pow(cfg.topicRepeatPenalty, topicCount);

  const clusterCount = countRecent(session, (r) => r.conceptCluster, sig.conceptCluster, cfg.sessionLookback);
  weight *= Math.pow(cfg.clusterRepeatPenalty, clusterCount);

  const archetypeCount = countRecent(session, (r) => r.questionArchetype, sig.questionArchetype, cfg.sessionLookback);
  weight *= Math.pow(cfg.archetypeRepeatPenalty, archetypeCount);

  const templateCount = countRecent(session, (r) => r.templateId, sig.templateId, cfg.sessionLookback);
  weight *= Math.pow(cfg.templateRepeatPenalty, templateCount);

  const familyCount = countRecent(session, (r) => r.calculationFamily, sig.calculationFamily, cfg.sessionLookback);
  weight *= Math.pow(cfg.calcFamilyRepeatPenalty, familyCount);

  const targetCount = countRecent(session, (r) => r.calculationTarget, sig.calculationTarget, cfg.sessionLookback);
  weight *= Math.pow(cfg.calcTargetRepeatPenalty, targetCount);

  const bucketCount = countRecent(session, (r) => r.prefixBucket, sig.prefixBucket, cfg.sessionLookback);
  weight *= Math.pow(cfg.prefixBucketRepeatPenalty, bucketCount);

  // Role preference modifier.
  const currentRole = state.currentRole || candidate.rolePreference;
  const roleHints = sig.roleHints;
  if (currentRole && Array.isArray(roleHints) && roleHints.includes(currentRole)) {
    weight *= cfg.roleMatchMultiplier;
  }

  // Right/wrong handling based on last result.
  const lastResult = state.lastResult || null;
  if (lastResult) {
    if (lastResult.knowledgeItemId === sig.knowledgeItemId) {
      if (lastResult.correct) {
        weight *= cfg.correctAnswerItemCooldown;
      } else {
        weight *= cfg.wrongAnswerItemRetryBoost;
      }
    } else if (lastResult.topicKey === sig.topicKey) {
      if (lastResult.correct) {
        weight *= cfg.correctAnswerClusterCooldown;
      } else {
        weight *= cfg.wrongAnswerClusterRetryBoost;
      }
    }
  }

  return { candidate, weight, sig };
}

// ---------------------------------------------------------------------------
// Hard anti-spam rules
// ---------------------------------------------------------------------------

function buildRule(name, testFn, relaxWhen) {
  return { name, testFn, relaxWhen };
}

function antiSpamRules(history) {
  const session = history?.session || [];
  const last = session[session.length - 1] || null;
  const lastThree = session.slice(-3);

  return [
    buildRule('no-same-item-consecutive', (item) => {
      if (!last || !item.knowledgeItemId || !last.knowledgeItemId) return true;
      return item.knowledgeItemId !== last.knowledgeItemId;
    }),
    buildRule('no-same-template-consecutive', (item) => {
      if (!last || !item.templateId || !last.templateId) return true;
      return item.templateId !== last.templateId;
    }),
    buildRule('no-three-same-topic', (item) => {
      if (lastThree.length < 3) return true;
      const topicKeys = lastThree.map((r) => r.topicKey);
      return topicKeys.some((k) => k !== item.topicKey);
    }),
    buildRule('no-three-same-cluster', (item) => {
      if (lastThree.length < 3) return true;
      const clusters = lastThree.map((r) => r.conceptCluster);
      return clusters.some((k) => k !== item.conceptCluster);
    }),
    buildRule('no-three-same-archetype', (item) => {
      if (lastThree.length < 3) return true;
      const archetypes = lastThree.map((r) => r.questionArchetype);
      return archetypes.some((k) => k !== item.questionArchetype);
    }),
    buildRule('no-three-same-calc-family', (item) => {
      if (!item.calculationFamily) return true;
      if (lastThree.length < 3) return true;
      const families = lastThree.map((r) => r.calculationFamily).filter(Boolean);
      return families.length < 3 || families.some((f) => f !== item.calculationFamily);
    }),
    buildRule('no-three-same-prefix-bucket', (item) => {
      if (!item.prefixBucket) return true;
      if (lastThree.length < 3) return true;
      const buckets = lastThree.map((r) => r.prefixBucket).filter(Boolean);
      return buckets.length < 3 || buckets.some((b) => b !== item.prefixBucket);
    }),
  ];
}

function applyAntiSpamFilters(weighted, rules, minPoolSize = 3) {
  let pool = weighted;
  for (const rule of rules) {
    if (pool.length <= minPoolSize) break;
    const filtered = pool.filter((w) => rule.testFn(w.sig));
    if (filtered.length > 0) {
      pool = filtered;
    }
    // If filter would empty the pool, skip it (fallback behavior).
  }
  return pool;
}

// ---------------------------------------------------------------------------
// Weighted random selection
// ---------------------------------------------------------------------------

function weightedSample(pool, rng) {
  if (!pool.length) return null;
  const total = pool.reduce((sum, w) => sum + Math.max(0, w.weight), 0);
  if (total <= 0) return pool[Math.floor(rng.next() * pool.length)].candidate;
  let roll = rng.next() * total;
  for (const w of pool) {
    const weight = Math.max(0, w.weight);
    if (roll < weight) return w.candidate;
    roll -= weight;
  }
  return pool[pool.length - 1].candidate;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function selectCandidate(candidates, state, options = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const cfg = { ...DEFAULT_WEIGHTS, ...(options.weights || {}) };
  const seed = options.seed ?? 'balancer-default';
  const rng = createRng(seed);

  // Compute weights.
  let pool = candidates.map((c) => computeWeight(c, state, cfg));

  // Apply hard anti-spam rules.
  const rules = antiSpamRules(state.history);
  pool = applyAntiSpamFilters(pool, rules, Math.min(3, candidates.length));

  // Fallback: if hard rules emptied everything, relax completely and keep weights.
  if (!pool.length) {
    pool = candidates.map((c) => computeWeight(c, state, cfg));
  }

  return weightedSample(pool, rng);
}

export function createBalancerState({ history, progressByTopic, lastResult, difficultyProfile } = {}) {
  return {
    history: history || { session: [], longTerm: [] },
    progressByTopic: progressByTopic || {},
    lastResult: lastResult || null,
    difficultyProfile: normalizeDifficulty(difficultyProfile),
  };
}

export function pickWeakestTopicKeys(progressByTopic, count = 3) {
  const entries = Object.entries(progressByTopic || {})
    .map(([topicKey, p]) => ({ topicKey, overall: p.overall ?? 0, mastered: !!p.mastered }))
    .filter((p) => !p.mastered)
    .sort((a, b) => a.overall - b.overall);
  return entries.slice(0, count).map((e) => e.topicKey);
}
