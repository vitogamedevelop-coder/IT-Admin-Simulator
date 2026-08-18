// =============================================================================
// Knowledge Layer – deterministic, seedable random helpers
//
// A tiny PRNG so that Knowledge Item + Template + seed always produces the
// same Question Instance. Used instead of Math.random() to guarantee
// determinism for tests, persistence and debugging.
// =============================================================================

/**
 * Create a seedable PRNG from an arbitrary string or integer.
 * Returns values in [0, 1).
 */
export function createRng(seed = '') {
  // Convert any seed into a 32-bit integer.
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

  return {
    /** @returns {number} value in [0, 1) */
    next: () => mulberry32(),

    /** @returns {number} integer in [min, max] (inclusive) */
    nextInt: (min, max) => {
      if (min > max) throw new Error(`Invalid range: ${min}..${max}`);
      return Math.floor(mulberry32() * (max - min + 1)) + min;
    },

    /** Pick and remove one element from an array. */
    pickRemove: (arr) => {
      if (arr.length === 0) return undefined;
      const idx = Math.floor(mulberry32() * arr.length);
      return arr.splice(idx, 1)[0];
    },

    /** Pick one element without modifying the array. */
    pick: (arr) => {
      if (arr.length === 0) return undefined;
      return arr[Math.floor(mulberry32() * arr.length)];
    },

    /** Shuffle array in place (Fisher-Yates) and return it. */
    shuffle: (arr) => {
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(mulberry32() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  };
}
