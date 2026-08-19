// =============================================================================
// NEXUS Knowledge Layer – Per-Facet Mastery Scoring
//
// A "knowledge facet" is the smallest assessable learning aspect of a topic,
// e.g. "osi.layer1.name" or "subnetting.broadcast".  Each facet carries a
// bounded mastery score that drives an adaptive semantic cooldown.
//
// Score range: [-5, +5].
// Higher score  -> longer preferred cooldown (already mastered).
// Lower score   -> shorter cooldown, higher priority (needs practice).
//
// Storage is intentionally lightweight: one object keyed by facetId.
// =============================================================================

import { FACET_MASTERY } from './types.js';

const STORAGE_KEY = 'cyberlearn:facet-mastery-v1';

let memoryCache = null;

function readStore() {
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    memoryCache = typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    memoryCache = {};
  }
  return memoryCache;
}

function writeStore(store) {
  memoryCache = store;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage unavailable in SSR/test environments
  }
}

function clampScore(score) {
  return Math.max(FACET_MASTERY.MIN_SCORE, Math.min(FACET_MASTERY.MAX_SCORE, Number.isFinite(score) ? score : 0));
}

export function getFacetMasteryScore(facetId) {
  if (!facetId) return FACET_MASTERY.DEFAULT_SCORE;
  const store = readStore();
  return clampScore(store[facetId] ?? FACET_MASTERY.DEFAULT_SCORE);
}

export function updateFacetMasteryScore(facetId, delta) {
  if (!facetId) return FACET_MASTERY.DEFAULT_SCORE;
  const store = readStore();
  const next = clampScore((store[facetId] ?? FACET_MASTERY.DEFAULT_SCORE) + delta);
  store[facetId] = next;
  writeStore(store);
  return next;
}

export function recordFacetCorrect(facetId) {
  return updateFacetMasteryScore(facetId, FACET_MASTERY.CORRECT_DELTA);
}

export function recordFacetWrong(facetId) {
  return updateFacetMasteryScore(facetId, FACET_MASTERY.WRONG_DELTA);
}

export function resetFacetMastery(facetId = null) {
  const store = readStore();
  if (facetId) {
    delete store[facetId];
  } else {
    Object.keys(store).forEach((k) => delete store[k]);
  }
  writeStore(store);
}

export function getAllFacetMasteryScores() {
  const store = readStore();
  return { ...store };
}

export function getFacetMasteryMap(facetIds) {
  const map = {};
  (facetIds || []).forEach((id) => {
    map[id] = getFacetMasteryScore(id);
  });
  return map;
}

/**
 * Returns { minGap, maxGap, priorityBoost } for a facet based on its score.
 */
export function getFacetCooldownInfo(facetId) {
  const score = getFacetMasteryScore(facetId);
  const minGap = FACET_MASTERY.MIN_GAP_BY_SCORE[String(score)] ?? FACET_MASTERY.MIN_GAP_BY_SCORE['0'];
  return {
    score,
    minGap,
    maxGap: FACET_MASTERY.MAX_GAP,
    // Slight continuous weight modifier so the balancer can prefer weak facets
    // even before the minimum gap is reached.  Negative score -> positive boost.
    priorityBoost: (FACET_MASTERY.DEFAULT_SCORE - score) * 0.15,
  };
}

/**
 * Number of questions since the last occurrence of the facet in the given
 * history records.  Returns Infinity if never seen.
 */
export function gapSinceFacet(records, facetId) {
  if (!facetId || !Array.isArray(records) || records.length === 0) return Infinity;
  const lastIndex = records.findLastIndex((r) => r.knowledgeFacet === facetId);
  if (lastIndex < 0) return Infinity;
  return records.length - lastIndex - 1;
}
