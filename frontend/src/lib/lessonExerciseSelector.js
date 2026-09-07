// Deterministic, mastery-aware subset of a lesson's full exercise pool for the
// direct theory flow. Uses C4 learningMastery to prioritize weak or pending
// recovery facets and to match the recommended difficulty. The full pool is
// still used by Practice, Fachgespräch, adaptive drills and themencheck.
// ---------------------------------------------------------------------------

import { getReviewPriority, needsRecovery, getRecommendedDifficulty } from './learningMastery.js';

function getDirectExerciseLimit(count) {
  if (count <= 3) return count;
  if (count <= 6) return 3;
  if (count <= 10) return 4;
  if (count <= 14) return 5;
  if (count <= 20) return 6;
  if (count <= 30) return 7;
  return 8;
}

function parseTopicKey(seed) {
  const s = String(seed || '');
  const parts = s.split('/');
  if (parts.length >= 2) return { categoryId: parts[0], topicId: parts[1] };
  return { categoryId: '', topicId: '' };
}

function facetForExercise(ex) {
  if (ex.facet) return ex.facet;
  if (ex.knowledgeFacet) return ex.knowledgeFacet;
  if (Array.isArray(ex.relatedKnowledgeIds) && ex.relatedKnowledgeIds.length > 0) return ex.relatedKnowledgeIds[0];
  return ex.id || '';
}

function scoreForExercise(ex, categoryId, topicId) {
  const facet = facetForExercise(ex);
  const pending = categoryId && topicId ? needsRecovery(categoryId, topicId, facet) : false;

  if (ex.adaptive === 'recovery' && pending) return 10000;
  if (ex.adaptive === 'recovery' && !pending) return -1; // skip unless needed

  let score = 0;
  if (categoryId && topicId && facet) {
    score += getReviewPriority(categoryId, topicId, facet);
    const recommended = getRecommendedDifficulty(categoryId, topicId, facet);
    const exDifficulty = String(ex.difficulty || 'medium').toLowerCase();
    if (exDifficulty === String(recommended).toLowerCase()) score += 50;
    if (pending) score += 200;
  }
  return score;
}

export function selectDirectTheoryExercises(exercises, seed) {
  if (!Array.isArray(exercises) || exercises.length === 0) return [];

  const { categoryId, topicId } = parseTopicKey(seed);

  const max = getDirectExerciseLimit(exercises.length);
  if (exercises.length <= max) return exercises;

  // Score every exercise. Recovery exercises are only kept when their facet
  // currently has recoveryPending (scoreForExercise returns 10000 then).
  const scored = exercises
    .map((ex, idx) => ({ ex, idx, score: scoreForExercise(ex, categoryId, topicId) }))
    .filter((item) => item.score >= 0);

  const forced = scored.filter((item) => item.ex.adaptive === 'recovery' && item.score > 9000);
  const rest = scored.filter((item) => !(item.ex.adaptive === 'recovery' && item.score > 9000));

  // Highest review priority / difficulty fit first; original order breaks ties.
  rest.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.idx - b.idx;
  });

  const selected = [];
  forced.forEach((item) => { if (selected.length < max) selected.push(item.ex); });
  rest.forEach((item) => { if (selected.length < max) selected.push(item.ex); });

  // Preserve original order from the full pool.
  selected.sort((a, b) => exercises.indexOf(a) - exercises.indexOf(b));
  return selected;
}

export { getDirectExerciseLimit };
