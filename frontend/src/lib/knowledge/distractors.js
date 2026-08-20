// =============================================================================
// Knowledge Layer – controlled distractor generation
//
// Phase 2 uses only controlled distractor sources:
//   - sibling Knowledge Items
//   - explicitly configured alternative values
//   - deterministic transformations of the correct answer
//
// No free-form invented answers.
// =============================================================================

export class DistractorError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DistractorError';
  }
}

/**
 * Pick up to `count` distractor labels from sibling items.
 * `extractFn(item)` must return a string label or undefined.
 * `correctLabel` is excluded from results.
 */
export function siblingDistractors(item, allItemsById, count, extractFn, rng) {
  if (!item.siblings || item.siblings.length === 0) return [];
  const candidates = item.siblings
    .map((id) => allItemsById[id])
    .filter(Boolean)
    .map(extractFn)
    .filter((label) => typeof label === 'string' && label !== item.correctLabel)
    .filter((label, idx, arr) => arr.indexOf(label) === idx);
  return pickN(candidates, count, rng);
}

/**
 * Pick up to `count` distractor labels from items that share the same
 * `conceptCluster` as `item`. `extractFn(item)` must return a string label.
 * The item's own definition/description/term/subject is excluded.
 */
export function sameClusterDistractors(item, allItemsById, count, extractFn, rng) {
  if (!item?.conceptCluster) return [];
  const pool = Object.values(allItemsById)
    .filter((other) => other && other.id !== item.id && other.conceptCluster === item.conceptCluster)
    .map(extractFn)
    .filter((label) => typeof label === 'string' && label !== String(item.data?.definition || item.data?.description || item.data?.term || item.data?.subject || ''))
    .filter((label, idx, arr) => arr.indexOf(label) === idx);
  return pickN(pool, count, rng);
}

/**
 * Pick distractors from an explicit list of alternative values.
 * `correctValue` is excluded.
 */
export function valueDistractors(alternatives, correctValue, count, rng) {
  const normalizedCorrect = normalizeForComparison(correctValue);
  const candidates = alternatives
    .filter((v) => normalizeForComparison(v) !== normalizedCorrect)
    .filter((v, i, arr) => arr.findIndex((x) => normalizeForComparison(x) === normalizeForComparison(v)) === i);
  return pickN(candidates, count, rng);
}

/**
 * Generate numeric distractors around a correct number.
 * Avoids duplicates and keeps results within bounds if given.
 */
export function numericDistractors(correct, count, rng, { min = -Infinity, max = Infinity, step = 1 } = {}) {
  if (!Number.isFinite(correct)) return [];
  const generated = [];
  let distance = step;
  const safety = 1000;
  let guard = 0;
  while (generated.length < count && guard < safety) {
    guard += 1;
    const candidates = [];
    if (correct - distance >= min) candidates.push(correct - distance);
    if (correct + distance <= max) candidates.push(correct + distance);
    for (const candidate of candidates) {
      if (!generated.includes(candidate)) {
        generated.push(candidate);
      }
      if (generated.length >= count) break;
    }
    distance += step;
  }
  return generated.slice(0, count);
}

/**
 * Transform a list of candidate distractors into option objects with unique IDs.
 * Does NOT include the correct answer.
 */
export function toOptionObjects(values, idPrefix = 'opt', startIndex = 1) {
  return values.map((value, index) => ({
    id: `${idPrefix}-${startIndex + index}`,
    label: String(value),
  }));
}

/**
 * Build a multiple-choice option list from a correct answer and distractor values.
 * Returns { options, correctOptionId }.
 */
export function buildMcOptions(correctValue, distractorValues, rng, idPrefix = 'opt') {
  const all = [
    { id: `${idPrefix}-0`, label: String(correctValue), isCorrect: true },
    ...toOptionObjects(distractorValues, idPrefix, 1).slice(0, 3),
  ];
  if (all.length < 2) {
    throw new DistractorError(`Need at least one distractor for correct value "${correctValue}"`);
  }
  rng.shuffle(all);
  const options = all.map(({ isCorrect: _isCorrect, ...rest }) => rest);
  const correctOptionId = all.find((o) => o.isCorrect).id;
  return { options, correctOptionId };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickN(candidates, count, rng) {
  if (!candidates || candidates.length === 0) return [];
  const pool = [...candidates];
  const result = [];
  const picks = Math.min(count, pool.length);
  for (let i = 0; i < picks; i += 1) {
    result.push(rng.pickRemove(pool));
  }
  return result;
}

function normalizeForComparison(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim().toLowerCase();
}

/**
 * Derive a small set of plausible binary/decimal distractors for a value.
 */
export function binaryDistractorValues(correctDecimal, _rng) {
  const candidates = new Set();
  if (correctDecimal > 0) candidates.add(correctDecimal - 1);
  if (correctDecimal < 255) candidates.add(correctDecimal + 1);
  candidates.add(correctDecimal ^ 1); // flip least significant bit
  candidates.add(correctDecimal + (correctDecimal >= 128 ? -64 : 64));
  return Array.from(candidates).filter((n) => n >= 0 && n <= 255);
}
