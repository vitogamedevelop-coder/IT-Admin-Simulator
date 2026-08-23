// =============================================================================
// NEXUS Knowledge Layer – Semantic Selection History
//
// Compact, bounded record of previously selected question instances so the
// semantic balancer can avoid immediate repetition and enforce diversity.
//
// Design goals:
//   - Never grow without bound.
//   - Backward compatible: missing history == empty history.
//   - Session scoped (current conversation) + long-term scoped (across reloads).
//   - Deterministic: history is data, selection uses a separate seed.
// =============================================================================

const LONG_TERM_KEY = 'cyberlearn:semantic-history-v1';
const DEFAULT_MAX_LONG_TERM = 200;
const DEFAULT_MAX_SESSION = 50;

function now() {
  return Date.now ? Date.now() : 0;
}

export function createSemanticHistory({ longTerm = [], session = [] } = {}) {
  return {
    longTerm: longTerm.slice(-DEFAULT_MAX_LONG_TERM),
    session: session.slice(-DEFAULT_MAX_SESSION),
    generatedAt: now(),
  };
}

function normalizeExactValue(inst) {
  const p = inst.calculationParams || {};
  return p.value ?? p.decimal ?? p.prefix ?? p.ip ?? '';
}

export function buildExactSignature(inst) {
  return `${inst.knowledgeItemId || ''}#${inst.templateId || ''}#${inst.questionArchetype || ''}#${normalizeExactValue(inst)}`;
}

export function buildHistoryRecord(questionInstance) {
  const inst = questionInstance || {};
  const params = inst.calculationParams || {};
  return {
    knowledgeItemId: inst.knowledgeItemId || null,
    topicKey: inst.topicKey || null,
    conceptCluster: inst.conceptCluster || null,
    learningObjective: inst.learningObjective || null,
    knowledgeFacet: inst.knowledgeFacet || null,
    questionArchetype: inst.questionArchetype || null,
    templateId: inst.context?.templateId || inst.templateId || null,
    calculationFamily: params.calculationFamily || null,
    calculationTarget: params.target || null,
    calculationValue: params.value ?? params.decimal ?? params.prefix ?? null,
    exactSignature: buildExactSignature(inst),
    contextFamily: inst.contextFamily || null,
    relatedTopicKeys: inst.relatedTopicKeys || null,
    prefix: params.prefix ?? null,
    difficulty: inst.difficulty || null,
    correct: inst.lastResult?.correct ?? null,
    askedAt: now(),
  };
}

function normalizePrefixBucket(prefix) {
  if (prefix === null || prefix === undefined) return null;
  const p = Number(prefix);
  if (p <= 8) return '/0-/8';
  if (p <= 15) return '/9-/15';
  if (p <= 23) return '/16-/23';
  if (p <= 26) return '/24-/26';
  if (p <= 30) return '/27-/30';
  return '/31+';
}

function bucketize(record) {
  return {
    ...record,
    prefixBucket: normalizePrefixBucket(record.prefix),
  };
}

export function pushHistoryRecord(history, questionInstance, { correct = null } = {}) {
  const rec = buildHistoryRecord(questionInstance);
  rec.correct = correct;
  const bucketed = bucketize(rec);
  return {
    longTerm: [...history.longTerm, bucketed].slice(-DEFAULT_MAX_LONG_TERM),
    session: [...history.session, bucketed].slice(-DEFAULT_MAX_SESSION),
    generatedAt: history.generatedAt,
  };
}

export function clearSessionHistory(history) {
  return {
    longTerm: history.longTerm,
    session: [],
    generatedAt: history.generatedAt,
  };
}

export function clearLongTermHistory() {
  return createSemanticHistory();
}

export function readLongTermHistory() {
  try {
    const raw = localStorage.getItem(LONG_TERM_KEY);
    if (!raw) return createSemanticHistory();
    const parsed = JSON.parse(raw);
    return createSemanticHistory({ longTerm: Array.isArray(parsed) ? parsed : parsed.longTerm });
  } catch {
    return createSemanticHistory();
  }
}

export function writeLongTermHistory(history) {
  try {
    localStorage.setItem(LONG_TERM_KEY, JSON.stringify(history.longTerm));
  } catch {
    // Ignore storage quota / private mode errors.
  }
  return history;
}

export function recordAsk(questionInstance, { correct = null, persist = true } = {}) {
  const longTerm = readLongTermHistory();
  const updated = pushHistoryRecord(longTerm, questionInstance, { correct });
  if (persist) writeLongTermHistory(updated);
  return updated;
}

export function getRecent(history, count) {
  if (!history) return [];
  return (history.session || []).slice(-count);
}

export function getLongTermRecent(history, count) {
  if (!history) return [];
  return (history.longTerm || []).slice(-count);
}

export function recentValuesForFamily(history, family, limit = 24) {
  if (!history || !family) return new Set();
  const records = [...(history.longTerm || []), ...(history.session || [])];
  const values = records
    .filter((r) => r.calculationFamily === family && r.calculationValue != null)
    .map((r) => r.calculationValue)
    .slice(-limit);
  return new Set(values);
}
