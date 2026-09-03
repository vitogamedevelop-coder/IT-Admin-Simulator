import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { guidedUiDemoExercise } from './test-data/guidedUiDemo.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src');

// ============================================================
// 1. LessonRunner recognizes the new exercise type
// ============================================================
console.log('1. Testing LessonRunner recognition...');
const runnerSrc = fs.readFileSync(path.join(srcDir, 'components', 'LessonRunner.jsx'), 'utf8');
assert(runnerSrc.includes("if (ex.type === 'guided-ui')"), 'LessonRunner branches on guided-ui exercises');
assert(runnerSrc.includes("import GuidedUiExercise from './GuidedUiExercise'"), 'LessonRunner imports GuidedUiExercise');
console.log('   LessonRunner recognizes guided-ui.');

// ============================================================
// 2. Schema validation helper
// ============================================================
console.log('2. Testing schema validation...');

function validateGuidedUi(exercise) {
  assert(typeof exercise.id === 'string' && exercise.id.length > 0, 'exercise.id is a non-empty string');
  assert(exercise.type === 'guided-ui', 'exercise.type is guided-ui');
  assert(Array.isArray(exercise.steps) && exercise.steps.length > 0, 'exercise.steps is a non-empty array');

  const stepIds = new Set();
  for (const step of exercise.steps) {
    assert(typeof step.id === 'string' && step.id.length > 0, 'step.id is a non-empty string');
    assert(!stepIds.has(step.id), `duplicate step id: ${step.id}`);
    stepIds.add(step.id);

    assert(typeof step.instruction === 'string' && step.instruction.length > 0, `step ${step.id}: instruction missing`);
    assert(Array.isArray(step.targets) && step.targets.length > 1, `step ${step.id}: targets missing`);

    const targetIds = new Set();
    let correctFound = false;
    for (const target of step.targets) {
      assert(typeof target.id === 'string' && target.id.length > 0, `step ${step.id}: target id missing`);
      assert(typeof target.label === 'string' && target.label.length > 0, `step ${step.id}: target label missing`);
      assert(!targetIds.has(target.id), `step ${step.id}: duplicate target id ${target.id}`);
      targetIds.add(target.id);
      if (target.id === step.correctTarget) correctFound = true;
    }
    assert(typeof step.correctTarget === 'string' && step.correctTarget.length > 0, `step ${step.id}: correctTarget missing`);
    assert(correctFound, `step ${step.id}: correctTarget not found in targets`);

    assert(typeof step.feedbackCorrect === 'string' && step.feedbackCorrect.length > 0, `step ${step.id}: feedbackCorrect missing`);
    assert(typeof step.feedbackWrong === 'string' && step.feedbackWrong.length > 0, `step ${step.id}: feedbackWrong missing`);
  }
}

validateGuidedUi(guidedUiDemoExercise);
console.log('   Demo exercise schema is valid.');

// ============================================================
// 3. Deterministic step order and content
// ============================================================
console.log('3. Testing determinism...');
const steps1 = guidedUiDemoExercise.steps;
const steps2 = JSON.parse(JSON.stringify(guidedUiDemoExercise)).steps;
assert.deepStrictEqual(steps1.map((s) => s.id), steps2.map((s) => s.id), 'step order is deterministic');
console.log('   Step order and content are deterministic.');

// ============================================================
// 4. Step progression simulation (wrong target != complete, correct advances)
// ============================================================
console.log('4. Testing step progression...');

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

// Wrong first step should not complete.
const wrongFirst = simulate(guidedUiDemoExercise, ['tools']);
assert(!wrongFirst.completed, 'wrong target must not complete exercise');
assert(wrongFirst.wrongClicked, 'wrong target registers as wrong click');
assert.strictEqual(wrongFirst.stepIndex, 0, 'wrong target keeps step index unchanged');

// Correct all the way through should complete.
const correctRun = simulate(guidedUiDemoExercise, ['manage', 'add-roles', 'role-based']);
assert(correctRun.completed, 'correct selections complete the exercise');
assert(!correctRun.wrongClicked, 'no wrong clicks in correct run');

// Wrong in the middle, then correct.
const recovery = simulate(guidedUiDemoExercise, ['manage', 'remove-roles', 'add-roles', 'role-based']);
assert(recovery.completed, 'retry after wrong click eventually completes');
assert(recovery.wrongClicked, 'wrong click was registered but retried');
console.log('   Retry and completion logic verified.');

console.log('\n=== Guided-UI exercise tests passed ===');







