import fs from 'node:fs';

const { buildAdDelegationLesson, AD_DELEGATION_TOPIC_KEY } = await import('../src/lib/academyLessons/adDelegation.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');
const { ACADEMY_TOPICS } = await import('../src/lib/academyTopics.js');
const { getKnowledgeItemsByTopic } = await import('../src/lib/knowledge/index.js');
const { adDelegationKnowledgeItems } = await import('../src/lib/knowledge/items/adDelegation.js');

function auditRequires(predicate, message) {
  if (!predicate) throw new Error(`AD Delegation Audit failed: ${message}`);
}

console.log('=== Active Directory Delegation Quality Audit ===');

auditRequires(LESSONS[AD_DELEGATION_TOPIC_KEY], 'ad-delegation must be registered in LESSONS');

const lesson = buildAdDelegationLesson();

console.log('A. Title and topic registration ...');
auditRequires(lesson.title === 'Delegation & Objektverwaltung', `unexpected title: ${lesson.title}`);
const topic = ACADEMY_TOPICS.find((t) => t.topicId === 'ad-delegation' && t.categoryId === 'active-directory-virtualbox');
auditRequires(topic, 'ad-delegation must exist in ACADEMY_TOPICS');
auditRequires(topic.title === 'Delegation & Objektverwaltung', 'unexpected topic title');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-mmc-basics'), 'ad-delegation should require ad-mmc-basics');

console.log('B. Theory explanations ...');
auditRequires(lesson.explanations.length >= 8, `expected at least 8 explanations, got ${lesson.explanations.length}`);
const requiredExplanations = [
  'ad-delegation-why', 'ad-delegation-least-privilege', 'ad-delegation-group-model',
  'ad-delegation-scope', 'ad-delegation-wizard', 'ad-delegation-principal',
  'ad-delegation-task', 'ad-delegation-vs-mmc', 'ad-delegation-verification', 'ad-delegation-preview',
];
for (const id of requiredExplanations) {
  auditRequires(lesson.explanations.some((e) => e.id === id), `missing explanation ${id}`);
}

console.log('C. Core concepts covered ...');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-delegation-why' && e.blocks.some((b) => b.type === 'text' && b.content.includes('passenden Rechten'))), 'delegation definition missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-delegation-group-model' && e.blocks.some((b) => b.type === 'text' && b.content.includes('S6Offz'))), 'S6Offz chain missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-delegation-group-model' && e.blocks.some((b) => b.type === 'text' && b.content.includes('DL_StabPwReset'))), 'DL_StabPwReset missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-delegation-vs-mmc' && e.blocks.some((b) => b.type === 'text' && b.content.includes('MMC'))), 'delegation vs MMC missing');
auditRequires(!lesson.explanations.some((e) => e.blocks.some((b) => b.type === 'text' && /taskpad|aufgabenblock|homelaufwerk/i.test(b.content))), 'no premature taskpad/mmc content in theory');

console.log('D. Exercises ...');
auditRequires(lesson.exercises.length >= 10, `expected at least 10 exercises, got ${lesson.exercises.length}`);
const exerciseIds = new Set(lesson.exercises.map((e) => e.id));
const requiredExercises = [
  'ad-delegation-purpose', 'ad-delegation-least-privilege', 'ad-delegation-group-ordering',
  'ad-delegation-scope', 'ad-delegation-principal', 'ad-delegation-misconception',
  'ad-delegation-transfer', 'ad-delegation-admin-challenge',
  'ad-delegation-open-wizard-guided-ui', 'ad-delegation-group-guided-ui', 'ad-delegation-password-reset-guided-ui',
  'ad-delegation-troubleshooting-1', 'ad-delegation-troubleshooting-2', 'ad-delegation-troubleshooting-3',
  'ad-delegation-troubleshooting-4', 'ad-delegation-troubleshooting-5',
];
for (const id of requiredExercises) {
  auditRequires(exerciseIds.has(id), `missing exercise ${id}`);
}

console.log('E. Guided UIs ...');
const guidedUis = lesson.exercises.filter((e) => e.type === 'guided-ui');
auditRequires(guidedUis.length === 3, `expected 3 guided UIs, got ${guidedUis.length}`);
for (const gui of guidedUis) {
  auditRequires(Array.isArray(gui.steps) && gui.steps.length >= 1, `${gui.id} must have steps`);
  for (const step of gui.steps) {
    auditRequires(step.kind === 'navigation' || step.kind === 'decision', `${step.id} must have kind navigation or decision`);
    auditRequires(Array.isArray(step.targets) && step.targets.length >= 2, `${step.id} must have targets`);
    auditRequires(step.correctTarget, `${step.id} must define correctTarget`);
  }
}

console.log('F. Wizard open flow ...');
const wizardGui = guidedUis.find((g) => g.id === 'ad-delegation-open-wizard-guided-ui');
auditRequires(wizardGui, 'missing open wizard guided UI');
auditRequires(wizardGui.steps.some((s) => s.correctTarget === 'aduc'), 'open wizard must select ADUC');
auditRequires(wizardGui.steps.some((s) => s.correctTarget === 'stab'), 'open wizard must select OU Stab');
auditRequires(wizardGui.steps.some((s) => s.correctTarget === 'delegate'), 'open wizard must trigger Objektverwaltung zuweisen');

console.log('G. Group guided UI ...');
const groupGui = guidedUis.find((g) => g.id === 'ad-delegation-group-guided-ui');
auditRequires(groupGui, 'missing group guided UI');
auditRequires(groupGui.steps.some((s) => s.correctTarget === 'dl_stab'), 'group guided UI must select DL_StabPwReset');

console.log('H. Password reset task guided UI ...');
const taskGui = guidedUis.find((g) => g.id === 'ad-delegation-password-reset-guided-ui');
auditRequires(taskGui, 'missing password reset guided UI');
auditRequires(taskGui.steps.some((s) => s.correctTarget === 'password_reset'), 'password reset guided UI must select correct task');
auditRequires(taskGui.steps.some((s) => s.correctTarget === 'finish'), 'password reset guided UI must finish');

console.log('I. Quiz ...');
auditRequires(lesson.quiz.length >= 5, `expected at least 5 quiz questions, got ${lesson.quiz.length}`);

console.log('J. Summary ...');
auditRequires(lesson.summary.length >= 5, `expected at least 5 summary points, got ${lesson.summary.length}`);
auditRequires(!lesson.summary.some((s) => /taskpad|aufgabenblock|homelaufwerk/i.test(s)), 'summary must not contain premature taskpad/mmc content');

console.log('K. Knowledge items ...');
const explanationIds = new Set(lesson.explanations.map((e) => e.id));
const topicItems = getKnowledgeItemsByTopic(AD_DELEGATION_TOPIC_KEY);
const topicItemIds = new Set(topicItems.map((i) => i.id));
const expectedItemIds = new Set(adDelegationKnowledgeItems.map((i) => i.id));
for (const id of expectedItemIds) {
  auditRequires(topicItemIds.has(id), `knowledge item ${id} must be registered`);
}
auditRequires(adDelegationKnowledgeItems.length >= 10, `expected at least 10 knowledge items, got ${adDelegationKnowledgeItems.length}`);
for (const item of adDelegationKnowledgeItems) {
  auditRequires(item.topicKey === AD_DELEGATION_TOPIC_KEY, `knowledge item ${item.id} must use ad-delegation topicKey`);
  auditRequires(explanationIds.has(item.sourceSection), `knowledge item ${item.id} must reference an existing explanation (got ${item.sourceSection})`);
}

console.log('L. Conversation topic integration ...');
const employeeConversations = fs.readFileSync(new URL('../src/lib/employeeConversations.js', import.meta.url), 'utf8');
auditRequires(employeeConversations.includes("topicKey('active-directory-virtualbox', 'ad-delegation')"), 'ad-delegation conversation topic must exist in employeeConversations.js');
auditRequires(employeeConversations.includes('Delegation & Objektverwaltung'), 'conversation title must match ad-delegation topic title');

console.log('M. No premature taskpad/mmc provisioning ...');
const source = fs.readFileSync(new URL('../src/lib/academyLessons/adDelegation.js', import.meta.url), 'utf8');
auditRequires(!/taskpad|aufgabenblock|homelaufwerk|konsolenmodus/i.test(source), 'adDelegation.js must not contain premature Taskpad/MMC provisioning content');

console.log('N. Version check ...');
{
  const buildGradle = fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
  auditRequires(/versionCode 18701/.test(buildGradle), 'versionCode must be 18701 for 1.87.1');
}

console.log('=== Active Directory Delegation Quality Audit passed ===');




