import { buildAdDelegationLesson } from '../src/lib/academyLessons/adDelegation.js';

const { exercises } = buildAdDelegationLesson();
const guidedUis = exercises.filter((e) => e.type === 'guided-ui');

if (guidedUis.length !== 3) throw new Error(`expected 3 guided UIs, got ${guidedUis.length}`);

for (const gui of guidedUis) {
  console.log(`\n=== Guided UI: ${gui.id} ===`);
  for (const step of gui.steps) {
    const correct = step.targets.find((t) => t.id === step.correctTarget);
    if (!correct) throw new Error(`step ${step.id} has no target for correctTarget ${step.correctTarget}`);
    console.log(`  [${step.kind}] ${step.id} → correct target: ${correct.label}`);
    const wrong = step.targets.filter((t) => t.id !== step.correctTarget);
    if (wrong.length === 0) throw new Error(`step ${step.id} needs at least one wrong target`);
  }
}

console.log('\n=== AD Delegation Guided UI Test passed ===');


