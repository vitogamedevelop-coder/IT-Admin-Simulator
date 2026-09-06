// =============================================================================
// CyberLearn – shared, seedable random service
//
// Provides a tiny, deterministic PRNG for all behaviourally relevant
// randomness.  The service is deliberately not one global stream: every
// subsystem creates its own seeded generator, so learning selection,
// question generation, conversations, missions and UI decoration stay
// isolated.
//
// Determinism is for reproducible tests and debugging; productive runs vary
// through runtime seeds/nonces (usually Date.now() + a counter).
// =============================================================================

export const RNG_NAMESPACE_LEARNING = 'learning';
export const RNG_NAMESPACE_QUESTIONS = 'questions';
export const RNG_NAMESPACE_CONVERSATIONS = 'conversations';
export const RNG_NAMESPACE_MISSIONS = 'missions';
export const RNG_NAMESPACE_UI = 'ui';

let nonceCounter = 0;
function nextNonce() {
  nonceCounter += 1;
  return `${Date.now().toString(36)}-${nonceCounter.toString(36)}`;
}

/**
 * Build a deterministic seed string from named ingredients.
 * Subsystem, category and topic keep unrelated namespaces from accidentally
 * sharing the same stream.  A missing nonce is generated at call time so
 * productive runs still differ.
 */
export function makeSeed({
  subsystem = RNG_NAMESPACE_UI,
  category = '',
  topic = '',
  runIndex = 0,
  nonce = '',
} = {}) {
  const parts = [subsystem, category, topic, runIndex, nonce || nextNonce()];
  return parts.filter((p) => p !== '' && p !== 0 && p != null).join('::');
}

// ---------------------------------------------------------------------------
// Core PRNG (Mulberry32).  Same algorithm that the Knowledge Layer already
// used, kept here so there is one canonical implementation.
// ---------------------------------------------------------------------------

export function createRng(seed = '') {
  let h = 1779033703 ^ seed.length;
  const str = String(seed);
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  function mulberry32() {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function next() {
    return mulberry32();
  }

  function nextInt(min, max) {
    if (min > max) throw new Error(`Invalid range: ${min}..${max}`);
    return Math.floor(mulberry32() * (max - min + 1)) + min;
  }

  function pick(arr) {
    if (arr.length === 0) return undefined;
    return arr[nextInt(0, arr.length - 1)];
  }

  function pickRemove(arr) {
    if (arr.length === 0) return undefined;
    const idx = nextInt(0, arr.length - 1);
    return arr.splice(idx, 1)[0];
  }

  // Fisher-Yates in place, returning the same array for chaining.
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return { next, nextInt, pick, pickRemove, shuffle };
}

// ---------------------------------------------------------------------------
// Adapters so helpers work with both the object API above and legacy
// function-style rngs (rng() returning a value in [0, 1)).
// ---------------------------------------------------------------------------

function nextValue(rng) {
  if (rng && typeof rng.next === 'function') return rng.next();
  if (typeof rng === 'function') return rng();
  throw new Error('Invalid rng: expected { next() } or a function returning [0,1)');
}

function nextIntValue(rng, min, max) {
  if (rng && typeof rng.nextInt === 'function') return rng.nextInt(min, max);
  if (typeof rng === 'function') return Math.floor(rng() * (max - min + 1)) + min;
  throw new Error('Invalid rng: expected { nextInt(min, max) } or a function returning [0,1)');
}

export function randomInt(rng, min, max) {
  return nextIntValue(rng, min, max);
}

export function pickOne(rng, arr) {
  if (!arr || arr.length === 0) return undefined;
  return arr[nextIntValue(rng, 0, arr.length - 1)];
}

export function randomBool(rng, probability = 0.5) {
  return nextValue(rng) < probability;
}

/**
 * Fisher-Yates shuffle returning a new array.
 */
export function shuffle(rng, arr) {
  const copy = [...arr];
  return shuffleInPlace(rng, copy);
}

/**
 * Fisher-Yates shuffle mutating the passed array.
 */
export function shuffleInPlace(rng, arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = nextIntValue(rng, 0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Weighted pick.  `getWeight` receives each item and must return a number.
 */
export function weightedPick(rng, items, getWeight) {
  if (!items || items.length === 0) return undefined;
  if (items.length === 1) return items[0];

  const resolveWeight = getWeight || ((item) => (typeof item === 'object' && item != null ? item.weight : 1));
  const weights = items.map((item) => Math.max(0, Number(resolveWeight(item)) || 0));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return items[0];

  let r = nextValue(rng) * total;
  for (let i = 0; i < items.length; i += 1) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Return `count` distinct elements from `arr` without replacement.
 */
export function sampleWithoutReplacement(rng, arr, count) {
  if (!arr || arr.length === 0) return [];
  const n = Math.min(count, arr.length);
  if (rng && typeof rng.pickRemove === 'function') {
    const copy = [...arr];
    const out = [];
    for (let i = 0; i < n; i += 1) out.push(rng.pickRemove(copy));
    return out;
  }
  const shuffled = shuffle(rng, arr);
  return shuffled.slice(0, n);
}
