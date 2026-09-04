import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-fsmo-transfer');
const lesson = LESSONS[TOPIC_ID];

function auditRequires(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`PASS: ${message}`);
  }
}

function findGuidedUi(id) {
  return lesson.exercises.find((ex) => ex.id === id && ex.type === 'guided-ui');
}

function validateStep(step, exerciseId) {
  auditRequires(step && typeof step.id === 'string', `${exerciseId}: step has id`);
  auditRequires(['decision', 'navigation'].includes(step.kind), `${exerciseId}: step ${step.id} has valid kind`);
  auditRequires(step.screen && typeof step.screen.title === 'string', `${exerciseId}: step ${step.id} has screen title`);
  auditRequires(typeof step.instruction === 'string', `${exerciseId}: step ${step.id} has instruction`);
  auditRequires(Array.isArray(step.targets) && step.targets.length >= 2, `${exerciseId}: step ${step.id} has targets`);
  auditRequires(step.targets.some((t) => t.id === step.correctTarget), `${exerciseId}: step ${step.id} correctTarget exists in targets`);
  auditRequires(step.targets.every((t) => typeof t.id === 'string' && typeof t.label === 'string'), `${exerciseId}: step ${step.id} targets have id and label`);
  auditRequires(typeof step.feedbackCorrect === 'string', `${exerciseId}: step ${step.id} has feedbackCorrect`);
  auditRequires(typeof step.feedbackWrong === 'string', `${exerciseId}: step ${step.id} has feedbackWrong`);
}

console.log('=== AD FSMO Transfer Guided UI Test ===\n');

auditRequires(!!lesson, 'Lesson ad-fsmo-transfer exists');

const guidedIds = [
  'fsmo-transfer-view-domain-roles-guided-ui',
  'fsmo-transfer-select-target-dc-guided-ui',
  'fsmo-transfer-domain-role-transfer-guided-ui',
  'fsmo-transfer-domain-naming-transfer-guided-ui',
  'fsmo-transfer-schema-snapin-guided-ui',
  'fsmo-transfer-schema-master-transfer-guided-ui',
];

for (const id of guidedIds) {
  const ex = findGuidedUi(id);
  auditRequires(!!ex, `Guided UI ${id} exists`);
  auditRequires(typeof ex.title === 'string', `${id} has title`);
  auditRequires(typeof ex.question === 'string', `${id} has question`);
  auditRequires(typeof ex.explanation === 'string', `${id} has explanation`);
  auditRequires(typeof ex.intro === 'string', `${id} has intro`);
  auditRequires(Array.isArray(ex.steps) && ex.steps.length >= 2, `${id} has at least 2 steps`);
  for (const step of ex.steps) {
    validateStep(step, id);
  }
}

console.log('\n=== AD FSMO Transfer Guided UI Test passed ===');








