import assert from 'node:assert/strict';
import { buildCiscoDhcpLesson } from '../src/lib/academyLessons/ciscoDhcp.js';

function evaluateComposer(selected, correct) {
  if (selected.length !== correct.length) return { allCorrect: false, partial: selected.some((id, i) => id === correct[i]) };
  return { allCorrect: selected.every((id, i) => id === correct[i]), partial: false };
}

const lesson = buildCiscoDhcpLesson();
const composerStep = lesson.session.steps.find((s) => s.type === 'composer');
assert.ok(composerStep, 'session has a composer step');

const { tokens, correctOrder } = composerStep;
assert.ok(tokens.length >= 3, 'composer has enough tokens');
assert.ok(correctOrder.length >= 2, 'composer has a meaningful command');
assert.ok(correctOrder.every((id) => tokens.some((t) => t.id === id)), 'all required tokens present');

const ids = new Set();
for (const t of tokens) {
  assert.ok(t.id && t.label, 'token has id and label');
  assert.ok(!ids.has(t.id), 'token ids unique');
  ids.add(t.id);
  assert.ok(t.label.length <= 40, 'token label fits mobile tap target width');
}

const distractors = tokens.filter((t) => !correctOrder.includes(t.id));
assert.ok(distractors.length >= 2, 'composer has distractors to reject');
assert.ok(distractors.every((d) => !correctOrder.includes(d.id)), 'distractors are not in correct order');

const correctAnswer = evaluateComposer(correctOrder, correctOrder);
assert.equal(correctAnswer.allCorrect, true, 'correct order is all correct');

const partial = evaluateComposer([correctOrder[0], ...distractors.slice(0, 1).map((d) => d.id)], correctOrder);
assert.equal(partial.allCorrect, false, 'mixed order is not all correct');
assert.equal(partial.partial, true, 'mixed order can be partial');

const wrong = evaluateComposer(distractors.map((d) => d.id).slice(0, correctOrder.length), correctOrder);
assert.equal(wrong.allCorrect, false, 'distractor-only order is wrong');

console.log('Learning composer contract OK');
