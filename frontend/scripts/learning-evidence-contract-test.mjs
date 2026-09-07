import assert from 'node:assert/strict';

// Browser mock must be defined before modules that use localStorage/window.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

import {
  EVIDENCE_TYPES,
  isEvidenceType,
  rankOfEvidence,
  inferEvidenceType,
  recordEvidence,
  getEvidenceForFacet,
  getTopicEvidenceSummary,
  validateEvidencePayload,
  resolveFacetIds,
} from '../src/lib/learningEvidence.js';

function reset() {
  store.clear();
}

console.log('Evidence contract tests...');

reset();

// 1. Valid evidence types
assert(isEvidenceType('recognized'), 'recognized is valid');
assert(isEvidenceType('understood'), 'understood is valid');
assert(!isEvidenceType('expert'), 'expert is invalid');
assert(!isEvidenceType(undefined), 'undefined is invalid');

// 2. Rank ordering
assert(rankOfEvidence('viewed') < rankOfEvidence('recognized'), 'viewed < recognized');
assert(rankOfEvidence('recognized') < rankOfEvidence('understood'), 'recognized < understood');
assert(rankOfEvidence('understood') < rankOfEvidence('recalled'), 'understood < recalled');
assert(rankOfEvidence('recalled') < rankOfEvidence('applied'), 'recalled < applied');
assert(rankOfEvidence('applied') < rankOfEvidence('diagnosed'), 'applied < diagnosed');
assert(rankOfEvidence('diagnosed') < rankOfEvidence('transferred'), 'diagnosed < transferred');

// 3. Default inference from interaction type
assert.equal(inferEvidenceType('select-best'), EVIDENCE_TYPES.RECOGNIZED, 'select-best -> recognized');
assert.equal(inferEvidenceType('matching'), EVIDENCE_TYPES.UNDERSTOOD, 'matching -> understood');
assert.equal(inferEvidenceType('cli-input'), EVIDENCE_TYPES.RECALLED, 'cli-input -> recalled');
assert.equal(inferEvidenceType('guided-ui'), EVIDENCE_TYPES.APPLIED, 'guided-ui -> applied');
assert.equal(inferEvidenceType('diagnostic'), EVIDENCE_TYPES.DIAGNOSED, 'diagnostic -> diagnosed');
assert.equal(inferEvidenceType('whatever'), EVIDENCE_TYPES.RECOGNIZED, 'unknown -> recognized fallback');
assert.equal(inferEvidenceType('select-best', 'understood'), EVIDENCE_TYPES.UNDERSTOOD, 'override wins');

// 4. Validation
assert.deepEqual(validateEvidencePayload({ evidenceType: 'recognized', categoryId: 'c', topicId: 't', facetIds: ['a'] }), []);
assert(validateEvidencePayload({ evidenceType: 'magic' }).includes('invalid evidenceType: magic'));
assert(validateEvidencePayload({ evidenceType: 'recognized' }).includes('categoryId missing'));
assert(validateEvidencePayload({ evidenceType: 'recognized', categoryId: 'c', topicId: 't' }).includes('facetIds must be a non-empty array'));

// 5. resolveFacetIds
const ids = resolveFacetIds({ relatedKnowledgeIds: ['k1'], facet: 'f1', id: 'q1', sectionId: 's1', topicId: 't1' });
assert.deepEqual(ids, ['k1', 'f1', 's1', 'q1', 't1'], 'resolveFacetIds deduplicates and orders');

// 6. Recording evidence
recordEvidence({ categoryId: 'fundamentals', topicId: 'osi-model', facetIds: ['osi.layer1.name'], evidenceType: 'recognized', correct: true });
const entry = getEvidenceForFacet('fundamentals', 'osi-model', 'osi.layer1.name');
assert.equal(entry.type, 'recognized', 'recorded recognized');

// 7. Partial does not produce full evidence
reset();
recordEvidence({ categoryId: 'fundamentals', topicId: 'osi-model', facetIds: ['osi.layer1.name'], evidenceType: 'recalled', correct: true, partial: true });
assert.equal(getEvidenceForFacet('fundamentals', 'osi-model', 'osi.layer1.name'), null, 'partial produces no full evidence');

// 8. Incorrect does not produce positive evidence
reset();
recordEvidence({ categoryId: 'fundamentals', topicId: 'osi-model', facetIds: ['osi.layer1.name'], evidenceType: 'recalled', correct: false });
assert.equal(getEvidenceForFacet('fundamentals', 'osi-model', 'osi.layer1.name'), null, 'incorrect produces no positive evidence');

// 9. Evidence upgrades and never downgrades
reset();
recordEvidence({ categoryId: 'fundamentals', topicId: 'osi-model', facetIds: ['x'], evidenceType: 'recognized', correct: true });
recordEvidence({ categoryId: 'fundamentals', topicId: 'osi-model', facetIds: ['x'], evidenceType: 'understood', correct: true });
assert.equal(getEvidenceForFacet('fundamentals', 'osi-model', 'x').type, 'understood', 'upgraded to understood');
recordEvidence({ categoryId: 'fundamentals', topicId: 'osi-model', facetIds: ['x'], evidenceType: 'recognized', correct: true });
assert.equal(getEvidenceForFacet('fundamentals', 'osi-model', 'x').type, 'understood', 'does not downgrade');

// 10. Summary
reset();
recordEvidence({ categoryId: 'fundamentals', topicId: 'osi-model', facetIds: ['a'], evidenceType: 'viewed', correct: true });
recordEvidence({ categoryId: 'fundamentals', topicId: 'osi-model', facetIds: ['b'], evidenceType: 'understood', correct: true });
recordEvidence({ categoryId: 'fundamentals', topicId: 'osi-model', facetIds: ['c'], evidenceType: 'understood', correct: true });
const summary = getTopicEvidenceSummary('fundamentals', 'osi-model');
assert.equal(summary.viewed, 1, 'summary viewed');
assert.equal(summary.understood, 2, 'summary understood');
assert.equal(summary.recalled, 0, 'summary recalled');

console.log('All evidence contract tests passed.');
