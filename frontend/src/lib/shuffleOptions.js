const STORAGE_KEY = 'it-learn:shuffled-questions';

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededShuffle(array, seed) {
  const copy = array.map((item, index) => ({ item, index }));
  let current = seed;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    current = (current * 9301 + 49297) % 233280;
    const j = current % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.map((entry) => entry.item);
}

export function optionId(questionId, index) {
  return `${questionId}-opt-${index}`;
}

export function normalizeOptions(options, questionId) {
  if (!Array.isArray(options)) return [];
  return options.map((option, index) => {
    if (typeof option === 'string') {
      return { id: optionId(questionId, index), label: option, correct: false, originalIndex: index };
    }
    return { ...option, id: option.id || optionId(questionId, index), originalIndex: option.originalIndex ?? index };
  });
}

export function shuffledOptions(options, questionId, seedOverride) {
  const normalized = normalizeOptions(options, questionId);
  const seed = seedOverride ?? simpleHash(questionId);
  const shuffled = seededShuffle(normalized, seed);
  // Ensure correct answer is not always first: if the first option is correct and we have more than one,
  // rotate once for a deterministic but non-first placement. This only affects the initial seed.
  if (shuffled.length > 1 && shuffled[0].correct) {
    const first = shuffled.shift();
    shuffled.push(first);
  }
  return shuffled;
}

export function readShuffledOrder(questionId) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data[questionId] || null;
  } catch {
    return null;
  }
}

export function writeShuffledOrder(questionId, order) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    data[questionId] = order;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function clearShuffledOrders() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getOrderedOptions(options, questionId) {
  const saved = readShuffledOrder(questionId);
  const normalized = normalizeOptions(options, questionId);
  if (!saved || saved.length !== normalized.length) {
    const shuffled = shuffledOptions(normalized, questionId, simpleHash(questionId));
    writeShuffledOrder(questionId, shuffled.map((o) => o.id));
    return shuffled;
  }
  const byId = Object.fromEntries(normalized.map((o) => [o.id, o]));
  const ordered = saved.map((id) => byId[id]).filter(Boolean);
  if (ordered.length !== normalized.length) {
    const shuffled = shuffledOptions(normalized, questionId, simpleHash(questionId));
    writeShuffledOrder(questionId, shuffled.map((o) => o.id));
    return shuffled;
  }
  return ordered;
}

export function isCorrectAnswer(option, question) {
  if (option && typeof option === 'object') {
    if ('isCorrect' in option) return option.isCorrect === true;
    return option.correct === true;
  }
  if (Array.isArray(question?.acceptedAnswers)) {
    return question.acceptedAnswers.includes(option);
  }
  return question?.answer === option;
}

export function findCorrectOption(options) {
  return options.find((o) => o.correct);
}

// Pure helper for the LessonRunner question blocks and quizzes: shuffle a plain
// options array while remembering where the original correct index ended up.
// This gives a fresh, unpredictable order each time a question is shown.
export function shuffleOptions(options, correctIndex) {
  const indexed = options.map((opt, i) => ({ opt, i }));
  const shuffled = [...indexed].sort(() => Math.random() - 0.5);
  return {
    options: shuffled.map((item) => item.opt),
    correct: shuffled.findIndex((item) => item.i === correctIndex),
  };
}
