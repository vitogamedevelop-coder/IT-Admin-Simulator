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

import {
  recordSectionView,
  recordSectionCompletion,
  recordQuestionAnswer,
  recordSelfAssessment,
} from '../src/lib/academyEngine.js';
import { EVIDENCE_TYPES, getEvidenceForFacet, getTopicEvidenceSummary } from '../src/lib/learningEvidence.js';

function reset() {
  store.clear();
}

const CAT = 'fundamentals';
const TOPIC = 'osi-model';
const LOCKED_TOPIC = 'tcp-ip-model';

console.log('Lesson section completion semantics tests...');

reset();

// 1. Viewed != understood
recordSectionView(CAT, TOPIC, 'layer1', ['osi.layer1.name']);
assert.equal(getEvidenceForFacet(CAT, TOPIC, 'layer1').type, EVIDENCE_TYPES.VIEWED, 'section viewed');
assert.equal(getEvidenceForFacet(CAT, TOPIC, 'osi.layer1.name').type, EVIDENCE_TYPES.VIEWED, 'facet viewed');

// 2. Completion != mastery (still VIEWED)
recordSectionCompletion(CAT, TOPIC, 'layer1', 'Bitübertragung', 7);
assert.equal(getEvidenceForFacet(CAT, TOPIC, 'layer1').type, EVIDENCE_TYPES.VIEWED, 'completion stays viewed');

// 3. Correct question gives recognized, overwriting the viewed marker upward
recordQuestionAnswer(CAT, TOPIC, 'q1', 'theory', true, EVIDENCE_TYPES.RECOGNIZED, ['osi.layer1.name']);
assert.equal(getEvidenceForFacet(CAT, TOPIC, 'osi.layer1.name').type, EVIDENCE_TYPES.RECOGNIZED, 'recognized overwrites viewed');

// 4. Incorrect question produces no positive evidence
recordQuestionAnswer(CAT, TOPIC, 'q2', 'theory', false, EVIDENCE_TYPES.UNDERSTOOD, ['osi.layer2.name']);
assert.equal(getEvidenceForFacet(CAT, TOPIC, 'osi.layer2.name'), null, 'incorrect question no evidence');

// 5. Explanation-only section stays VIEWED (no extra facet, mirroring LessonRunner)
recordSectionView(CAT, TOPIC, 'summary');
assert.equal(getEvidenceForFacet(CAT, TOPIC, 'summary').type, EVIDENCE_TYPES.VIEWED, 'explanation-only section viewed');

// 6. Self-assessment cannot claim UNDERSTOOD
recordSelfAssessment(CAT, TOPIC, ['osi.self']);
assert.equal(getEvidenceForFacet(CAT, TOPIC, 'osi.self').type, EVIDENCE_TYPES.SELF_REPORTED, 'self-assessment is self-reported');
recordQuestionAnswer(CAT, TOPIC, 'q3', 'theory', true, EVIDENCE_TYPES.UNDERSTOOD, ['osi.self']);
assert.equal(getEvidenceForFacet(CAT, TOPIC, 'osi.self').type, EVIDENCE_TYPES.UNDERSTOOD, 'interactive evidence later overwrites self-reported');

// 7. Locked topic blocks evidence
recordSectionView(CAT, LOCKED_TOPIC, 'layer1', ['tcpip.layer1.name']);
assert.equal(getEvidenceForFacet(CAT, LOCKED_TOPIC, 'layer1'), null, 'locked topic blocks evidence');

// 8. Summary counts
const s = getTopicEvidenceSummary(CAT, TOPIC);
assert.equal(s.viewed, 2, 'two viewed sections');
assert.equal(s.recognized, 1, 'one recognized facet');
assert.equal(s.understood, 1, 'one understood facet');
assert.equal(s[EVIDENCE_TYPES.SELF_REPORTED], 0, 'self-reported was overwritten');

console.log('All section completion semantics tests passed.');
