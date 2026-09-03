import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey, resolvePrerequisiteRef } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { selectDirectTheoryExercises, getDirectExerciseLimit } from '../src/lib/lessonExerciseSelector.js';

const CATEGORY = 'active-directory-virtualbox';
const OU_KEY = topicKey(CATEGORY, 'organizational-units');
const DC_KEY = topicKey(CATEGORY, 'domain-controller');

function validateGuidedUi(exercise) {
  assert(typeof exercise.id === 'string' && exercise.id.length > 0, 'exercise.id is a non-empty string');
  assert(exercise.type === 'guided-ui', 'exercise.type is guided-ui');
  assert(typeof exercise.question === 'string' && exercise.question.length > 0, `${exercise.id} must have question`);
  assert(typeof exercise.explanation === 'string' && exercise.explanation.length > 0, `${exercise.id} must have explanation`);
  assert(Array.isArray(exercise.steps) && exercise.steps.length > 0, `${exercise.id}: steps must be non-empty array`);

  const stepIds = new Set();
  for (const step of exercise.steps) {
    assert(typeof step.id === 'string' && step.id.length > 0, `step id missing`);
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

console.log('=== Active Directory OU Management Quality Audit ===');

// 1. Lesson exists
console.log('1. Checking lesson existence...');
assert(LESSONS[OU_KEY], `expected lesson ${OU_KEY}`);

// 2. Required sections (theory preserved + new management sections)
console.log('2. Checking required sections...');
const requiredSections = [
  'ou-einstieg-classic',
  'ou-definition-classic',
  'ou-vs-gruppe-classic',
  'ou-hierarchie-classic',
  'dn-einfuehrung-classic',
  'dn-dc-missverstaendnis-classic',
  'ou-zusammenfassung-classic',
  'ou-standardcontainer-classic',
  'ou-management-einstieg-classic',
  'ou-erstellen-classic',
  'ou-verschieben-classic',
  'ou-design-classic',
  'ou-neu-zusammenfassung-classic',
];
const lesson = LESSONS[OU_KEY];
const explanationIds = lesson.explanations.map((e) => e.id);
for (const s of requiredSections) {
  assert(explanationIds.includes(s), `OU lesson must include section ${s}`);
}

// 3. Lesson structure
console.log('3. Checking lesson structure...');
assert(typeof lesson.title === 'string' && lesson.title.length > 0, 'OU lesson must have title');
assert(Array.isArray(lesson.explanations) && lesson.explanations.length >= 10, 'OU lesson must have at least 10 explanations');
assert(Array.isArray(lesson.summary) && lesson.summary.length > 0, 'OU lesson must have summary');

const diagramCount = lesson.explanations.flatMap((e) => e.blocks || []).filter((b) => b.type === 'diagram').length;
assert(diagramCount >= 4, `OU lesson should have at least 4 diagrams (got ${diagramCount})`);

// 4. Exercises
console.log('4. Checking exercises...');
const exercises = lesson.exercises || [];
assert(exercises.length >= 5 && exercises.length <= 8, `OU exercises must be 5-8 (got ${exercises.length})`);
for (const ex of exercises) {
  if (ex.type === 'guided-ui') {
    validateGuidedUi(ex);
  } else {
    assert(typeof ex.question === 'string' && ex.question.length > 0, `OU exercise ${ex.id} must have question`);
    assert(typeof ex.explanation === 'string' && ex.explanation.length > 0, `OU exercise ${ex.id} must have explanation`);
  }
}

const guidedUiExercises = exercises.filter((ex) => ex.type === 'guided-ui');
assert(guidedUiExercises.length >= 2, 'OU lesson must contain at least 2 guided-ui exercises');
assert(guidedUiExercises.some((ex) => ex.id === 'ad-ou-create-guided-ui'), 'OU lesson must contain ad-ou-create-guided-ui');
assert(guidedUiExercises.some((ex) => ex.id === 'ad-ou-move-object-guided-ui'), 'OU lesson must contain ad-ou-move-object-guided-ui');

// 5. Direct exercise load respects limits and includes at least one guided-ui
console.log('5. Checking direct exercise load...');
const selected = selectDirectTheoryExercises(exercises, OU_KEY);
const limit = getDirectExerciseLimit(exercises.length);
assert(selected.length >= Math.min(exercises.length, 3) || selected.length >= limit, 'direct exercise count within expected range');
assert(selected.length <= exercises.length, 'direct exercises must not exceed full pool');
assert(selected.some((ex) => ex.type === 'guided-ui'), 'direct flow should include at least one guided-ui exercise');

// 6. No forbidden out-of-scope procedural terms
console.log('6. Checking for out-of-scope terms...');
const forbiddenTerms = ['Core Server', 'DHCP', 'Sysprep', 'PowerShell', 'MMC', 'NTDSUTIL', 'FSMO Transfer', 'Seize', 'Domain Join'];
const lessonText = JSON.stringify(lesson).toLowerCase();
const violations = [];
for (const term of forbiddenTerms) {
  if (lessonText.includes(term.toLowerCase())) {
    violations.push(term);
  }
}
assert.deepStrictEqual(violations, [], 'OU lesson must not contain out-of-scope procedural terms');

// 7. Factual precision keywords
console.log('7. Checking factual precision keywords...');
const expectedSnippets = [
  'standard-container',
  'organisationseinheit',
  'active directory users and computers',
  'versehentlichem löschen',
  'distinguished name',
  'verschieben',
  'administrativen anforderungen',
  'organigramm',
];
const lowerText = lessonText;
const missingSnippets = expectedSnippets.filter((s) => !lowerText.includes(s));
assert.strictEqual(missingSnippets.length, 0, `OU lesson should mention: ${missingSnippets.join(', ')}`);

// 8. Knowledge items
console.log('8. Checking OU management knowledge items...');
const ouKnowledge = getAllKnowledgeItems().filter((i) => i.topicKey === OU_KEY);
console.log(`   OU knowledge items: ${ouKnowledge.length}`);
assert(ouKnowledge.length >= 10, 'expected at least 10 knowledge items for organizational-units');

const requiredClusters = ['ad.ou', 'ad.dn'];
const clusters = new Set(ouKnowledge.map((i) => i.conceptCluster));
for (const c of requiredClusters) {
  assert(clusters.has(c), `expected concept cluster ${c}`);
}

const ids = ouKnowledge.map((i) => i.id);
assert.strictEqual(new Set(ids).size, ids.length, 'no duplicate knowledge IDs within OU items');

const invalidSources = [];
for (const item of ouKnowledge) {
  const srcLesson = LESSONS[item.sourceTopicKey];
  if (!srcLesson) {
    invalidSources.push({ item: item.id, reason: 'sourceTopicKey missing lesson', sourceTopicKey: item.sourceTopicKey });
    continue;
  }
  const explanationIds = (srcLesson.explanations || []).map((e) => e.id);
  if (!explanationIds.includes(item.sourceSection)) {
    invalidSources.push({ item: item.id, reason: 'sourceSection not found', sourceSection: item.sourceSection });
  }
}
assert.deepStrictEqual(invalidSources, [], 'all OU knowledge items must reference valid source sections');

// 9. Conversation topic
console.log('9. Checking conversation topic...');
const ouConv = CONVERSATION_TOPICS[OU_KEY];
assert(ouConv, `expected conversation topic for ${OU_KEY}`);
assert(Array.isArray(ouConv.questions) && ouConv.questions.length >= 10, 'expected at least 10 conversation questions for organizational-units');
const convIds = ouConv.questions.map((q) => q.id);
assert.strictEqual(new Set(convIds).size, convIds.length, 'conversation question IDs must be unique');

const managementQuestions = ouConv.questions.filter((q) =>
  /standard|container|verschieben|lösch|schutz|administrier|aduc|verwalten|verwaltung/i.test(q.text)
);
assert(managementQuestions.length >= 4, 'expected at least 4 OU-management conversation questions');

// 10. Quiz
console.log('10. Checking final quiz...');
const quiz = lesson.quiz || [];
assert(quiz.length >= 6 && quiz.length <= 8, `OU quiz must be 6-8 questions (got ${quiz.length})`);
for (const q of quiz) {
  assert(Array.isArray(q.options) && q.options.length >= 2, 'OU quiz question must have options');
  assert(typeof q.correct === 'number', 'OU quiz question must have correct index');
}

// 11. No AD-specific guided-ui engine branching in LessonRunner
console.log('11. Checking LessonRunner remains generic for guided-ui...');
const fs = await import('node:fs');
const runnerSrc = fs.readFileSync(new URL('../src/components/LessonRunner.jsx', import.meta.url), 'utf8');
assert(!runnerSrc.includes("topicId === 'organizational-units'"), 'LessonRunner must not special-case organizational-units');
assert(!runnerSrc.includes("topic === 'organizational-units'"), 'LessonRunner must not special-case organizational-units');
assert(runnerSrc.includes("if (ex.type === 'guided-ui')"), 'LessonRunner must branch on guided-ui exercises');

// 12. Prerequisite chain preserved
console.log('12. Checking prerequisite chain...');
const ouTopic = ACADEMY_TOPICS.find((t) => topicKey(t.categoryId, t.topicId) === OU_KEY);
assert(ouTopic, 'organizational-units topic must exist');
const prereqLessons = (ouTopic.prerequisites || []).map((p) => {
  const ref = resolvePrerequisiteRef(CATEGORY, p);
  return topicKey(ref.categoryId, ref.topicId);
});
assert(prereqLessons.includes(DC_KEY), 'organizational-units should require domain-controller');

console.log('\n=== Active Directory OU Management Quality Audit passed ===');

