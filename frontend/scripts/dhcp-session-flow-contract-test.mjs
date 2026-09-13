const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

import assert from 'node:assert/strict';
import { buildCiscoDhcpLesson, CISCO_DHCP_TOPIC_KEY } from '../src/lib/academyLessons/ciscoDhcp.js';

const EVIDENCE_TYPES = new Set(['viewed', 'recognized', 'understood', 'recalled', 'applied', 'diagnosed', 'transferred']);

const lesson = buildCiscoDhcpLesson();
assert.ok(lesson.session, 'session field exists');
assert.ok(Array.isArray(lesson.session.steps) && lesson.session.steps.length >= 8, 'session has enough steps');

const validTypes = new Set(['narrative', 'choice', 'composer', 'cli', 'next-best-check', 'output-focus', 'spot-fault', 'diagnostic', 'transfer']);
let interactiveCount = 0;

for (let i = 0; i < lesson.session.steps.length; i += 1) {
  const step = lesson.session.steps[i];
  assert.ok(step.id, `step ${i} has id`);
  assert.ok(validTypes.has(step.type), `step ${i} has valid type ${step.type}`);
  assert.ok(step.sectionId, `step ${i} has sectionId`);

  if (step.type !== 'narrative') {
    interactiveCount += 1;
    assert.ok(step.evidenceType && EVIDENCE_TYPES.has(step.evidenceType), `step ${i} has valid evidenceType`);
    assert.ok(Array.isArray(step.relatedKnowledgeIds) && step.relatedKnowledgeIds.length > 0, `step ${i} has facets`);
  }

  switch (step.type) {
    case 'choice':
    case 'diagnostic':
    case 'transfer':
      if (step.type === 'transfer' && step.mode !== 'choice') break;
      assert.ok(step.question, `step ${i} question exists`);
      assert.ok(Array.isArray(step.options) && step.options.length >= 2, `step ${i} options valid`);
      assert.ok(step.options.some((o) => o.correct), `step ${i} has a correct option`);
      break;
    case 'composer':
      assert.ok(step.question, `step ${i} question exists`);
      assert.ok(Array.isArray(step.tokens) && step.tokens.length >= 2, `step ${i} tokens valid`);
      assert.ok(Array.isArray(step.correctOrder) && step.correctOrder.length >= 1, `step ${i} correctOrder valid`);
      assert.ok(step.correctOrder.every((id) => step.tokens.some((t) => t.id === id)), `step ${i} correctOrder ids match tokens`);
      break;
    case 'cli':
      assert.ok(step.question, `step ${i} question exists`);
      assert.ok(step.startContext, `step ${i} startContext exists`);
      assert.ok(Array.isArray(step.expectedLines) && step.expectedLines.length >= 1, `step ${i} expectedLines valid`);
      break;
    case 'next-best-check':
      assert.ok(step.question, `step ${i} question exists`);
      assert.ok(Array.isArray(step.options) && step.options.length >= 2, `step ${i} options valid`);
      assert.ok(step.correct >= 0 && step.correct < step.options.length, `step ${i} correct index valid`);
      break;
    case 'output-focus':
      assert.ok(step.question, `step ${i} question exists`);
      assert.ok(Array.isArray(step.lines) && step.lines.length >= 2, `step ${i} lines valid`);
      assert.ok(step.correctIndex >= 0 && step.correctIndex < step.lines.length, `step ${i} correctIndex valid`);
      break;
    case 'spot-fault':
      assert.ok(step.question, `step ${i} question exists`);
      assert.ok(Array.isArray(step.lines) && step.lines.length >= 2, `step ${i} lines valid`);
      assert.ok(step.faultIndex >= 0 && step.faultIndex < step.lines.length, `step ${i} faultIndex valid`);
      break;
    default:
      break;
  }
}

assert.ok(interactiveCount >= 5, 'session has at least 5 interactive steps');
assert.ok(lesson.session.steps[0].type === 'narrative', 'session starts with narrative');
assert.ok(lesson.session.steps[lesson.session.steps.length - 1].type === 'narrative', 'session ends with narrative');

const ids = new Set();
for (const step of lesson.session.steps) {
  assert.ok(!ids.has(step.id), `unique step id ${step.id}`);
  ids.add(step.id);
}

console.log('DHCP session flow contract OK');
