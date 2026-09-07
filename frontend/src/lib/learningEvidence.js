// =============================================================================
// NEXUS Academy – Learning Evidence Layer (C3)
//
// A small, additive semantic layer on top of academyProgress.js.
// It answers: "Which capability did the learner actually demonstrate?"
// without replacing the existing score/status system.
//
// Design rules:
// - No new parallel store. Evidence is stored inside the per-topic progress
//   object managed by academyProgress.js.
// - No Evidence XP / gamification score. Evidence describes competence, not reward.
// - Compact: one highest-evidence entry per facet/section id.
// - Question type and evidence type are intentionally separate. Content may
//   override the default evidenceType per interaction.
// =============================================================================

import { topicKey } from './academyTopics.js';
import { readAcademyProgress, writeAcademyProgress } from './academyProgress.js';

export const EVIDENCE_TYPES = Object.freeze({
  VIEWED: 'viewed',
  SELF_REPORTED: 'self-reported',
  RECOGNIZED: 'recognized',
  UNDERSTOOD: 'understood',
  RECALLED: 'recalled',
  APPLIED: 'applied',
  DIAGNOSED: 'diagnosed',
  TRANSFERRED: 'transferred',
});

const ALL_TYPES = Object.values(EVIDENCE_TYPES);

const EVIDENCE_RANK = {
  [EVIDENCE_TYPES.VIEWED]: 0,
  [EVIDENCE_TYPES.SELF_REPORTED]: 1,
  [EVIDENCE_TYPES.RECOGNIZED]: 2,
  [EVIDENCE_TYPES.UNDERSTOOD]: 3,
  [EVIDENCE_TYPES.RECALLED]: 4,
  [EVIDENCE_TYPES.APPLIED]: 5,
  [EVIDENCE_TYPES.DIAGNOSED]: 6,
  [EVIDENCE_TYPES.TRANSFERRED]: 7,
};

const INTERACTION_DEFAULTS = {
  // Recognition / recall
  'select-best': EVIDENCE_TYPES.RECOGNIZED,
  single: EVIDENCE_TYPES.RECOGNIZED,
  multi: EVIDENCE_TYPES.UNDERSTOOD, // exact-set multi-select needs more than pure recognition
  // Understanding / structure
  ordering: EVIDENCE_TYPES.UNDERSTOOD,
  matching: EVIDENCE_TYPES.UNDERSTOOD,
  categorization: EVIDENCE_TYPES.UNDERSTOOD,
  // Active recall
  input: EVIDENCE_TYPES.RECALLED,
  'cli-input': EVIDENCE_TYPES.RECALLED,
  // Application / transfer
  'guided-ui': EVIDENCE_TYPES.APPLIED,
  'guided-subnetting': EVIDENCE_TYPES.APPLIED,
  'adaptive-subnetting': EVIDENCE_TYPES.APPLIED,
  'adaptive-number-systems': EVIDENCE_TYPES.APPLIED,
  'adaptive-subnet-requirements': EVIDENCE_TYPES.APPLIED,
  'adaptive-supernetting': EVIDENCE_TYPES.APPLIED,
  'difficulty-drill': EVIDENCE_TYPES.RECALLED,
  // Diagnosis / transfer
  diagnostic: EVIDENCE_TYPES.DIAGNOSED,
  scenario: EVIDENCE_TYPES.DIAGNOSED,
  mission: EVIDENCE_TYPES.APPLIED,
  // Theory-section view only
  section: EVIDENCE_TYPES.VIEWED,
};

export function isEvidenceType(value) {
  return typeof value === 'string' && ALL_TYPES.includes(value);
}

export function rankOfEvidence(type) {
  if (!isEvidenceType(type)) return -1;
  return EVIDENCE_RANK[type];
}

export function inferEvidenceType(interactionType, override) {
  if (isEvidenceType(override)) return override;
  return INTERACTION_DEFAULTS[interactionType] || EVIDENCE_TYPES.RECOGNIZED;
}

export function evidenceFromThemencheckCompetency(competency) {
  switch (competency) {
    case 'recall': return EVIDENCE_TYPES.RECALLED;
    case 'interpretation': return EVIDENCE_TYPES.UNDERSTOOD;
    case 'diagnosis': return EVIDENCE_TYPES.DIAGNOSED;
    case 'transfer': return EVIDENCE_TYPES.TRANSFERRED;
    default: return null;
  }
}

// Quality is deliberately coarse (low/medium/high) so callers can express
// confidence without inventing a numerical formula.
export function isEvidenceQuality(value) {
  return ['low', 'medium', 'high'].includes(value);
}

export function normalizeEvidenceQuality(value, defaults = 'medium') {
  return isEvidenceQuality(value) ? value : defaults;
}

// Facet id resolution: prefer explicit fields, fall back to a stable content id.
export function resolveFacetIds({
  facet,
  knowledgeFacet,
  relatedKnowledgeIds,
  sourceTopicId,
  sourceSection,
  id,
  sectionId,
  topicId,
}) {
  const out = [];
  if (Array.isArray(relatedKnowledgeIds) && relatedKnowledgeIds.length > 0) {
    relatedKnowledgeIds.forEach((k) => { if (k) out.push(String(k)); });
  }
  if (facet) out.push(String(facet));
  if (knowledgeFacet && !out.includes(knowledgeFacet)) out.push(String(knowledgeFacet));
  if (sourceSection && !out.includes(sourceSection)) out.push(String(sourceSection));
  if (sectionId && !out.includes(sectionId)) out.push(String(sectionId));
  if (id && !out.includes(id)) out.push(String(id));
  if (sourceTopicId && !out.includes(sourceTopicId)) out.push(String(sourceTopicId));
  if (topicId && !out.includes(topicId)) out.push(String(topicId));
  return out;
}

export function defaultTopicEvidence() {
  return {};
}

export function applyEvidenceToData(data, {
  categoryId,
  topicId,
  facetIds = [],
  evidenceType,
  source = '',
  quality = 'medium',
  correct = true,
  partial = false,
  at = Date.now(),
}) {
  if (!isEvidenceType(evidenceType)) return null;
  if (evidenceType !== EVIDENCE_TYPES.VIEWED && evidenceType !== EVIDENCE_TYPES.SELF_REPORTED) {
    if (partial || !correct) return null;
  }

  const key = topicKey(categoryId, topicId);
  const topic = data?.topics?.[key];
  if (!topic) return null;

  topic.evidence = topic.evidence || {};
  const targets = facetIds.filter(Boolean);
  if (targets.length === 0) return null;

  const entry = { type: evidenceType, source, quality: normalizeEvidenceQuality(quality), at };
  const newRank = rankOfEvidence(evidenceType);

  targets.forEach((facetId) => {
    const current = topic.evidence[facetId];
    const currentRank = current ? rankOfEvidence(current.type) : -1;
    if (newRank > currentRank || (newRank === currentRank && (!current || at > (current.at || 0)))) {
      topic.evidence[facetId] = { ...entry, facetId };
    }
  });

  return entry;
}

export function recordEvidence(payload) {
  const data = readAcademyProgress();
  const entry = applyEvidenceToData(data, payload);
  if (entry) writeAcademyProgress(data);
  return entry;
}

export function getEvidenceForFacet(categoryId, topicId, facetId) {
  if (!categoryId || !topicId || !facetId) return null;
  const progress = readAcademyProgress().topics[topicKey(categoryId, topicId)];
  return progress?.evidence?.[facetId] || null;
}

export function getTopicEvidenceSummary(categoryId, topicId) {
  const progress = readAcademyProgress().topics[topicKey(categoryId, topicId)];
  const evidence = progress?.evidence || {};
  const summary = Object.fromEntries(ALL_TYPES.map((t) => [t, 0]));
  Object.values(evidence).forEach((entry) => {
    if (entry && summary[entry.type] !== undefined) summary[entry.type] += 1;
  });
  return summary;
}

export function getHighestEvidenceForFacet(categoryId, topicId, facetId) {
  return getEvidenceForFacet(categoryId, topicId, facetId)?.type || null;
}

// Simple helper to decide whether a self-assessment can claim "understood".
// It cannot. Self-reported evidence is weaker than recognition.
export function selfAssessmentEvidence() {
  return EVIDENCE_TYPES.SELF_REPORTED;
}

// Validates an evidence payload. Useful for tests and content authoring.
export function validateEvidencePayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    errors.push('payload must be an object');
    return errors;
  }
  if (!isEvidenceType(payload.evidenceType)) errors.push(`invalid evidenceType: ${payload.evidenceType}`);
  if (!payload.categoryId) errors.push('categoryId missing');
  if (!payload.topicId) errors.push('topicId missing');
  if (!Array.isArray(payload.facetIds) || payload.facetIds.length === 0) {
    if (payload.evidenceType !== EVIDENCE_TYPES.SELF_REPORTED) {
      errors.push('facetIds must be a non-empty array');
    }
  }
  return errors;
}
