// =============================================================================
// Conversation Mastery - records informal hallway-practice results per topic
// so that repeated, independent successes can satisfy Academy prerequisites.
// This is intentionally separate from academyEngine.js to avoid circular
// imports and to keep conversation-specific mastery logic in one place.
// =============================================================================

const KEY = 'cyberlearn:conversation-mastery-v1';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function pushUnique(arr, value) {
  if (value && !arr.includes(value)) arr.push(value);
}

export function recordConversationResult(topicKey, { correct, concept, usedHint = false, samIntervention = false } = {}) {
  const data = read();
  const rec = data[topicKey] || {
    correct: 0,
    incorrect: 0,
    independentCorrect: 0,
    uniqueConcepts: [],
    samHelpedCount: 0,
    lastCorrectAt: null,
  };

  if (correct) {
    rec.correct += 1;
    rec.lastCorrectAt = Date.now();
    if (!samIntervention && !usedHint) {
      rec.independentCorrect += 1;
      pushUnique(rec.uniqueConcepts, concept);
    }
  } else {
    rec.incorrect += 1;
  }

  if (samIntervention) rec.samHelpedCount += 1;

  data[topicKey] = rec;
  write(data);
  return rec;
}

export function getConversationMastery(topicKey) {
  const data = read();
  return data[topicKey] || {
    correct: 0,
    incorrect: 0,
    independentCorrect: 0,
    uniqueConcepts: [],
    samHelpedCount: 0,
    lastCorrectAt: null,
  };
}

export function hasConversationMastery(
  topicKey,
  { minCorrect = 3, minUniqueConcepts = 2, requireIndependent = true } = {},
) {
  const rec = getConversationMastery(topicKey);
  const uniqueCount = new Set(rec.uniqueConcepts).size;
  if (rec.correct < minCorrect) return false;
  if (requireIndependent && rec.independentCorrect < minCorrect) return false;
  if (minUniqueConcepts && uniqueCount < minUniqueConcepts) return false;
  return true;
}

export function resetConversationMastery() {
  localStorage.removeItem(KEY);
}
