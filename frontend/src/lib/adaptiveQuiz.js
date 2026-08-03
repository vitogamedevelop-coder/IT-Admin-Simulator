const SKILL_KEY = (moduleId) => `cyberlearn:skill:${moduleId}`;
const DEFAULT_MIN = 1;
const DEFAULT_MAX = 5;

export function getModuleSkill(moduleId) {
  const raw = localStorage.getItem(SKILL_KEY(moduleId));
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? clamp(value) : 1;
}

export function setModuleSkill(moduleId, skill) {
  localStorage.setItem(SKILL_KEY(moduleId), String(clamp(skill)));
}

function clamp(value) {
  return Math.max(DEFAULT_MIN, Math.min(DEFAULT_MAX, value));
}

/**
 * Elo-ähnliche Aktualisierung der Fähigkeit.
 * Richtige Antwort auf eine schwere Frage bringt mehr, falsche auf eine leichte Frage kostet mehr.
 */
export function updateSkill(currentSkill, questionDifficulty, correct) {
  const gap = questionDifficulty - currentSkill;
  const change = correct
    ? 0.2 + Math.max(0, gap) * 0.25
    : -0.25 - Math.max(0, -gap) * 0.25;
  return clamp(currentSkill + change);
}

function questionDifficulty(question) {
  const d = Number.parseInt(question.difficulty, 10);
  return Number.isFinite(d) ? clamp(d) : 2;
}

/**
 * Erste Sortierung beim Start: leichte Fragen zuerst, dann zur persönlichen Fähigkeit aufsteigend.
 */
export function initialQuestionOrder(questions, moduleId) {
  const skill = getModuleSkill(moduleId);
  const target = skill * 0.7;
  return shuffleTies([...questions].sort((a, b) => {
    const da = questionDifficulty(a) - target;
    const db = questionDifficulty(b) - target;
    return Math.abs(da) - Math.abs(db);
  }));
}

/**
 * Nach jeder Antwort: aus den verbleibenden Fragen die passende Herausforderung wählen.
 * Ziel ist leicht über dem aktuellen Skill (Flow-Zone).
 * Falls rescue=true (z. B. 2 falsche hintereinander), wird die einfachste Frage gewählt.
 */
export function pickNextQuestions(remaining, moduleId, { rescue = false } = {}) {
  if (rescue) {
    return shuffleTies([...remaining].sort((a, b) => questionDifficulty(a) - questionDifficulty(b)));
  }
  const skill = getModuleSkill(moduleId);
  const target = skill + 0.35;
  return shuffleTies([...remaining].sort((a, b) => {
    const da = questionDifficulty(a) - target;
    const db = questionDifficulty(b) - target;
    return Math.abs(da) - Math.abs(db);
  }));
}

function shuffleTies(sorted) {
  // Fragen mit gleicher Distanz zum Ziel leicht durcheinandermischen, damit es nicht zu eintönig wird.
  const buckets = [];
  let lastKey = null;
  sorted.forEach((item) => {
    const key = Math.round(questionDifficulty(item));
    if (key !== lastKey) {
      buckets.push([]);
      lastKey = key;
    }
    buckets[buckets.length - 1].push(item);
  });
  buckets.forEach((bucket) => {
    for (let i = bucket.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [bucket[i], bucket[j]] = [bucket[j], bucket[i]];
    }
  });
  return buckets.flat();
}

/**
 * Flow-Einschätzung basierend auf Mihaly Csikszentmihalyis Modell:
 * Balance aus Herausforderung (Fragen-Schwierigkeit) und Fähigkeit (Skill).
 */
export function flowState(skill, streak, recentAccuracy) {
  const challenge = Math.min(5, skill + 0.5);
  const gap = Math.abs(challenge - skill);
  if (streak >= 3 && recentAccuracy >= 0.75 && gap <= 0.8) {
    return { label: 'im Flow', color: '#00ff66', message: 'Perfekte Balance – du lernst im besten Tempo.' };
  }
  if (recentAccuracy >= 0.9 && streak >= 2) {
    return { label: 'leicht', color: '#00f0ff', message: 'Gut! Die Schwierigkeit steigt jetzt leicht an.' };
  }
  if (recentAccuracy <= 0.4 || streak === 0) {
    return { label: 'herausfordernd', color: '#ffcc00', message: 'Herausforderung hoch – kurze Pause oder Lektion wiederholen.' };
  }
  return { label: 'optimiert', color: '#c9d1d9', message: 'Weiter so – das System passt die Fragen an dich an.' };
}

export function progressToFlowLabel(progressPercent) {
  if (progressPercent < 25) return 'Einstieg';
  if (progressPercent < 50) return 'Aufwärmen';
  if (progressPercent < 75) return 'Fokus';
  return 'Endspurt';
}
