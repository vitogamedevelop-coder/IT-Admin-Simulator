import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';

const NTFS_KEY = topicKey('active-directory-virtualbox', 'ntfs-permissions');

function validateGuidedUi(exercise) {
  assert(typeof exercise.id === 'string' && exercise.id.length > 0, 'exercise.id is a non-empty string');
  assert(exercise.type === 'guided-ui', 'exercise.type is guided-ui');
  assert(typeof exercise.question === 'string' && exercise.question.length > 0, `${exercise.id}: question missing`);
  assert(typeof exercise.explanation === 'string' && exercise.explanation.length > 0, `${exercise.id}: explanation missing`);
  assert(Array.isArray(exercise.steps) && exercise.steps.length > 0, `${exercise.id}: steps must be non-empty array`);

  const stepIds = new Set();
  for (const step of exercise.steps) {
    assert(typeof step.id === 'string' && step.id.length > 0, 'step id missing');
    assert(!stepIds.has(step.id), `duplicate step id: ${step.id}`);
    stepIds.add(step.id);
    assert(typeof step.instruction === 'string' && step.instruction.length > 0, `${step.id}: instruction missing`);
    assert(Array.isArray(step.targets) && step.targets.length > 1, `${step.id}: targets missing`);

    const targetIds = new Set();
    let correctFound = false;
    for (const target of step.targets) {
      assert(typeof target.id === 'string' && target.id.length > 0, `${step.id}: target id missing`);
      assert(typeof target.label === 'string' && target.label.length > 0, `${step.id}: target label missing`);
      assert(!targetIds.has(target.id), `${step.id}: duplicate target id ${target.id}`);
      targetIds.add(target.id);
      if (target.id === step.correctTarget) correctFound = true;
    }
    assert(typeof step.correctTarget === 'string' && step.correctTarget.length > 0, `${step.id}: correctTarget missing`);
    assert(correctFound, `${step.id}: correctTarget not found in targets`);
    assert(typeof step.feedbackCorrect === 'string' && step.feedbackCorrect.length > 0, `${step.id}: feedbackCorrect missing`);
    assert(typeof step.feedbackWrong === 'string' && step.feedbackWrong.length > 0, `${step.id}: feedbackWrong missing`);
  }
}

function simulate(exercise, selections) {
  let stepIndex = 0;
  let completed = false;
  let wrongClicked = false;

  for (const selection of selections) {
    if (completed) break;
    const step = exercise.steps[stepIndex];
    const targetIds = step.targets.map((t) => t.id);
    assert(targetIds.includes(selection), `selection ${selection} not in step ${step.id}`);

    if (selection === step.correctTarget) {
      if (stepIndex === exercise.steps.length - 1) {
        completed = true;
      } else {
        stepIndex += 1;
      }
    } else {
      wrongClicked = true;
    }
  }

  return { completed, stepIndex, wrongClicked };
}

console.log('=== AD NTFS & Share Permission Guided-UI Contract Tests ===');

const lesson = LESSONS[NTFS_KEY];
assert(lesson, 'ntfs-permissions lesson must exist');

const exercises = (lesson.exercises || []).filter((ex) => ex.type === 'guided-ui');
assert(exercises.length > 0, 'at least one guided-ui exercise must exist');

for (const exercise of exercises) {
  console.log(`1. Validating ${exercise.id}...`);
  validateGuidedUi(exercise);

  console.log(`2. Simulating ${exercise.id} wrong first click...`);
  const firstStepTargets = exercise.steps[0].targets.map((t) => t.id);
  const wrongTarget = firstStepTargets.find((id) => id !== exercise.steps[0].correctTarget);
  const wrongFirst = simulate(exercise, [wrongTarget]);
  assert(!wrongFirst.completed, 'wrong target must not complete');
  assert(wrongFirst.wrongClicked, 'wrong click must register');
  assert.strictEqual(wrongFirst.stepIndex, 0, 'wrong target keeps step index unchanged');

  console.log(`3. Simulating ${exercise.id} correct path...`);
  const correctPath = exercise.steps.map((step) => step.correctTarget);
  const correctRun = simulate(exercise, correctPath);
  assert(correctRun.completed, 'correct selections must complete exercise');
  assert(!correctRun.wrongClicked, 'correct run must have no wrong clicks');

  console.log(`4. Simulating ${exercise.id} recovery after wrong click...`);
  const recoveryPath = [wrongTarget, ...correctPath];
  const recovery = simulate(exercise, recoveryPath);
  assert(recovery.completed, 'retry after wrong click must complete');
  assert(recovery.wrongClicked, 'wrong click must be registered but retried');
}

console.log('\n=== AD NTFS & Share Permission Guided-UI Contract Tests passed ===');
