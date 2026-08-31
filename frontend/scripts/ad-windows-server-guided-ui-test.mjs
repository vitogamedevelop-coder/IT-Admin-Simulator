import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';

const WS_KEY = topicKey('active-directory-virtualbox', 'windows-server');

function simulateGuidedUi(exercise) {
  console.log(`  Simulating ${exercise.id}...`);
  const path = [];
  const wrongFirst = exercise.steps[0].targets.find((t) => t.id !== exercise.steps[0].correctTarget).id;
  path.push({ step: exercise.steps[0].id, choice: wrongFirst, correct: false });
  for (const step of exercise.steps) {
    path.push({ step: step.id, choice: step.correctTarget, correct: true });
  }
  return path;
}

console.log('=== AD Windows Server Guided-UI Contract Tests ===');
const lesson = LESSONS[WS_KEY];
assert(lesson, `Windows Server lesson must exist: ${WS_KEY}`);
const guided = lesson.exercises.filter((ex) => ex.type === 'guided-ui');
assert(guided.length >= 2, 'expected at least 2 guided-ui exercises');

for (const ex of guided) {
  console.log(`1. Validating ${ex.id}...`);
  assert(typeof ex.id === 'string' && ex.id.length, `${ex.id}: id missing`);
  assert(typeof ex.question === 'string' && ex.question.length, `${ex.id}: question missing`);
  assert(typeof ex.explanation === 'string' && ex.explanation.length, `${ex.id}: explanation missing`);
  assert(Array.isArray(ex.steps) && ex.steps.length > 0, `${ex.id}: steps required`);
  for (const step of ex.steps) {
    assert(typeof step.id === 'string' && step.id.length, 'step id missing');
    assert(typeof step.instruction === 'string' && step.instruction.length, 'step instruction missing');
    assert(Array.isArray(step.targets) && step.targets.length > 1, 'step targets missing');
    assert(step.targets.some((t) => t.id === step.correctTarget), 'correctTarget not in targets');
  }
  simulateGuidedUi(ex);
}

console.log('=== AD Windows Server Guided-UI Contract Tests passed ===');
