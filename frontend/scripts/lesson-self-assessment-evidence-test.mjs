import assert from 'node:assert/strict';

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

import { recordSelfAssessment } from '../src/lib/academyEngine.js';
import { EVIDENCE_TYPES, getEvidenceForFacet } from '../src/lib/learningEvidence.js';

console.log('Self-assessment evidence tests...');

const CAT = 'fundamentals';
const TOPIC = 'osi-model';

recordSelfAssessment(CAT, TOPIC, ['facet-a']);
const entry = getEvidenceForFacet(CAT, TOPIC, 'facet-a');
assert.equal(entry.type, EVIDENCE_TYPES.SELF_REPORTED, 'self-assessment produces self-reported');
assert.notEqual(entry.type, EVIDENCE_TYPES.UNDERSTOOD, 'self-assessment is never understood');

console.log('All self-assessment evidence tests passed.');
