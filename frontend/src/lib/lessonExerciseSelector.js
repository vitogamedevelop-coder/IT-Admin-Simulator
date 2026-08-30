// Deterministic, balanced subset of a lesson's full exercise pool for the
// direct theory flow. The full pool is still used by Practice, Fachgespräch,
// adaptive drills and themencheck.
// ---------------------------------------------------------------------------

function getDirectExerciseLimit(count) {
  if (count <= 3) return count;
  if (count <= 6) return 3;
  if (count <= 10) return 4;
  if (count <= 14) return 5;
  if (count <= 20) return 6;
  if (count <= 30) return 7;
  return 8;
}

function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function selectDirectTheoryExercises(exercises, seed) {
  if (!Array.isArray(exercises) || exercises.length === 0) return [];

  const max = getDirectExerciseLimit(exercises.length);
  if (exercises.length <= max) return exercises;

  // Group by exercise type; fall back to id prefix for variety if a type dominates.
  const groups = new Map();
  exercises.forEach((ex, idx) => {
    let key = ex.type || 'default';
    if (groups.has(key) && groups.get(key).length > 0) {
      const same = groups.get(key);
      // If every exercise is the same type, split by the first dash-delimited token of the id.
      if (same.length >= 2) {
        const idPart = String(ex.id || `ex-${idx}`).split('-')[0];
        key = `${ex.type || 'default'}-${idPart}`;
      }
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ex, idx });
  });

  // Stable group order: first occurrence in original array.
  const orderedKeys = [];
  const seenKeys = new Set();
  exercises.forEach((ex, idx) => {
    let key = ex.type || 'default';
    if (groups.has(`${ex.type || 'default'}-${String(ex.id || `ex-${idx}`).split('-')[0]}`)) {
      key = `${ex.type || 'default'}-${String(ex.id || `ex-${idx}`).split('-')[0]}`;
    }
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      orderedKeys.push(key);
    }
  });

  const taken = new Set();
  const selected = [];
  let round = 0;
  const seedNum = typeof seed === 'number' ? seed : djb2Hash(String(seed || ''));

  while (selected.length < max) {
    let addedThisRound = false;
    for (let k = 0; k < orderedKeys.length; k += 1) {
      const key = orderedKeys[k];
      const items = groups.get(key).filter(({ idx }) => !taken.has(idx));
      if (items.length === 0) continue;
      // Within a group, deterministically pick one while preserving order.
      const pickIndex = (seedNum + round * 13 + k * 7) % items.length;
      const pick = items[pickIndex];
      selected.push(pick.ex);
      taken.add(pick.idx);
      addedThisRound = true;
      if (selected.length >= max) break;
    }
    if (!addedThisRound) break;
    round += 1;
  }

  // Preserve original order from the full pool.
  selected.sort((a, b) => exercises.indexOf(a) - exercises.indexOf(b));
  return selected;
}

export { getDirectExerciseLimit };
