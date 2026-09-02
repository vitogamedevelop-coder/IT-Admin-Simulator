import fs from 'node:fs';

const { buildAdMmcHelpdeskLesson, AD_MMC_HELPDESK_TOPIC_KEY } = await import('../src/lib/academyLessons/adMmcHelpdesk.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');
const { ACADEMY_TOPICS } = await import('../src/lib/academyTopics.js');
const { getKnowledgeItemsByTopic } = await import('../src/lib/knowledge/index.js');
const { adMmcHelpdeskKnowledgeItems } = await import('../src/lib/knowledge/items/adMmcHelpdesk.js');

function auditRequires(predicate, message) {
  if (!predicate) throw new Error(`AD MMC Helpdesk Audit failed: ${message}`);
}

console.log('=== Active Directory MMC Helpdesk Quality Audit ===');

auditRequires(LESSONS[AD_MMC_HELPDESK_TOPIC_KEY], 'ad-mmc-helpdesk must be registered in LESSONS');

const lesson = buildAdMmcHelpdeskLesson();

console.log('A. Title and topic registration ...');
auditRequires(lesson.title === 'MMC für Hilfsadmin', `unexpected title: ${lesson.title}`);
const topic = ACADEMY_TOPICS.find((t) => t.topicId === 'ad-mmc-helpdesk' && t.categoryId === 'active-directory-virtualbox');
auditRequires(topic, 'ad-mmc-helpdesk must exist in ACADEMY_TOPICS');
auditRequires(topic.title === 'MMC für Hilfsadmin', 'unexpected topic title');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-delegation'), 'ad-mmc-helpdesk should require ad-delegation');

console.log('B. Theory explanations ...');
auditRequires(lesson.explanations.length >= 9, `expected at least 9 explanations, got ${lesson.explanations.length}`);
const requiredExplanations = [
  'ad-mmc-helpdesk-why', 'ad-mmc-helpdesk-aduc', 'ad-mmc-helpdesk-ou',
  'ad-mmc-helpdesk-taskpad', 'ad-mmc-helpdesk-command', 'ad-mmc-helpdesk-filter',
  'ad-mmc-helpdesk-console', 'ad-mmc-helpdesk-save', 'ad-mmc-helpdesk-deploy',
  'ad-mmc-helpdesk-verify', 'ad-mmc-helpdesk-end-to-end',
];
for (const id of requiredExplanations) {
  auditRequires(lesson.explanations.some((e) => e.id === id), `missing explanation ${id}`);
}

console.log('C. Core concepts covered ...');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-mmc-helpdesk-taskpad' && e.blocks.some((b) => b.type === 'text' && b.content.includes('Aufgabenblockansicht'))), 'taskpad definition missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-mmc-helpdesk-filter' && e.blocks.some((b) => b.type === 'text' && b.content.includes('Benutzer'))), 'filter on users missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-mmc-helpdesk-console' && e.blocks.some((b) => b.type === 'text' && b.content.includes('Einzelfenster'))), 'restricted single missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-mmc-helpdesk-save' && e.blocks.some((b) => b.type === 'text' && b.content.includes('.msc'))), 'save .msc missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-mmc-helpdesk-deploy' && e.blocks.some((b) => b.type === 'text' && b.content.includes('Homelaufwerk'))), 'deploy home drive missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-mmc-helpdesk-end-to-end' && e.blocks.some((b) => b.type === 'text' && b.content.includes('Delegation'))), 'end-to-end delegation missing');
auditRequires(!lesson.explanations.some((e) => e.blocks.some((b) => b.type === 'text' && /schema|schmmgmt/i.test(b.content))), 'no schema master in theory');

console.log('D. Exercises ...');
auditRequires(lesson.exercises.length >= 12, `expected at least 12 exercises, got ${lesson.exercises.length}`);
const exerciseIds = new Set(lesson.exercises.map((e) => e.id));
const requiredExercises = [
  'ad-mmc-helpdesk-purpose', 'ad-mmc-helpdesk-ordering', 'ad-mmc-helpdesk-matching',
  'ad-mmc-helpdesk-misconception', 'ad-mmc-helpdesk-transfer', 'ad-mmc-helpdesk-admin-challenge',
  'ad-mmc-helpdesk-taskpad-guided-ui', 'ad-mmc-helpdesk-password-task-guided-ui',
  'ad-mmc-helpdesk-view-filter-guided-ui', 'ad-mmc-helpdesk-console-mode-guided-ui',
  'ad-mmc-helpdesk-save-guided-ui', 'ad-mmc-helpdesk-deploy-guided-ui',
  'ad-mmc-helpdesk-t1', 'ad-mmc-helpdesk-t2', 'ad-mmc-helpdesk-t3',
  'ad-mmc-helpdesk-t4', 'ad-mmc-helpdesk-t5', 'ad-mmc-helpdesk-t6',
];
for (const id of requiredExercises) {
  auditRequires(exerciseIds.has(id), `missing exercise ${id}`);
}

console.log('E. Guided UIs ...');
const guidedUis = lesson.exercises.filter((e) => e.type === 'guided-ui');
auditRequires(guidedUis.length === 6, `expected 6 guided UIs, got ${guidedUis.length}`);
for (const gui of guidedUis) {
  auditRequires(Array.isArray(gui.steps) && gui.steps.length >= 1, `${gui.id} must have steps`);
  for (const step of gui.steps) {
    auditRequires(step.kind === 'navigation' || step.kind === 'decision', `${step.id} must have kind navigation or decision`);
    auditRequires(Array.isArray(step.targets) && step.targets.length >= 2, `${step.id} must have targets`);
    auditRequires(step.correctTarget, `${step.id} must define correctTarget`);
  }
}

console.log('F. Taskpad creation flow ...');
const taskpadGui = guidedUis.find((g) => g.id === 'ad-mmc-helpdesk-taskpad-guided-ui');
auditRequires(taskpadGui, 'missing taskpad guided UI');
auditRequires(taskpadGui.steps.some((s) => s.correctTarget === 'stab'), 'taskpad must select OU Stab');
auditRequires(taskpadGui.steps.some((s) => s.correctTarget === 'taskpad'), 'taskpad must create taskpad');

console.log('G. Password task guided UI ...');
const passwordGui = guidedUis.find((g) => g.id === 'ad-mmc-helpdesk-password-task-guided-ui');
auditRequires(passwordGui, 'missing password task guided UI');
auditRequires(passwordGui.steps.some((s) => s.correctTarget === 'menu'), 'password task must select Menu command type');
auditRequires(passwordGui.steps.some((s) => s.correctTarget === 'reset'), 'password task must select reset password');

console.log('H. Filter guided UI ...');
const filterGui = guidedUis.find((g) => g.id === 'ad-mmc-helpdesk-view-filter-guided-ui');
auditRequires(filterGui, 'missing filter guided UI');
auditRequires(filterGui.steps.some((s) => s.correctTarget === 'view'), 'filter must open View menu');
auditRequires(filterGui.steps.some((s) => s.correctTarget === 'user'), 'filter must select user object type');

console.log('I. Console mode guided UI ...');
const consoleGui = guidedUis.find((g) => g.id === 'ad-mmc-helpdesk-console-mode-guided-ui');
auditRequires(consoleGui, 'missing console mode guided UI');
auditRequires(consoleGui.steps.some((s) => s.correctTarget === 'restricted'), 'console mode must select restricted single');
auditRequires(consoleGui.steps.some((s) => s.correctTarget === 'no'), 'console mode must disable saving changes');

console.log('J. Save and deploy guided UIs ...');
const saveGui = guidedUis.find((g) => g.id === 'ad-mmc-helpdesk-save-guided-ui');
auditRequires(saveGui, 'missing save guided UI');
auditRequires(saveGui.steps.some((s) => s.correctTarget === 'file'), 'save must use File menu');
const deployGui = guidedUis.find((g) => g.id === 'ad-mmc-helpdesk-deploy-guided-ui');
auditRequires(deployGui, 'missing deploy guided UI');
auditRequires(deployGui.steps.some((s) => s.correctTarget === 'home'), 'deploy must use home drive target');

console.log('K. Quiz ...');
auditRequires(lesson.quiz.length >= 5, `expected at least 5 quiz questions, got ${lesson.quiz.length}`);

console.log('L. Summary ...');
auditRequires(lesson.summary.length >= 8, `expected at least 8 summary points, got ${lesson.summary.length}`);

console.log('M. Knowledge items ...');
const explanationIds = new Set(lesson.explanations.map((e) => e.id));
const topicItems = getKnowledgeItemsByTopic(AD_MMC_HELPDESK_TOPIC_KEY);
const topicItemIds = new Set(topicItems.map((i) => i.id));
const expectedItemIds = new Set(adMmcHelpdeskKnowledgeItems.map((i) => i.id));
for (const id of expectedItemIds) {
  auditRequires(topicItemIds.has(id), `knowledge item ${id} must be registered`);
}
auditRequires(adMmcHelpdeskKnowledgeItems.length >= 10, `expected at least 10 knowledge items, got ${adMmcHelpdeskKnowledgeItems.length}`);
for (const item of adMmcHelpdeskKnowledgeItems) {
  auditRequires(item.topicKey === AD_MMC_HELPDESK_TOPIC_KEY, `knowledge item ${item.id} must use ad-mmc-helpdesk topicKey`);
  auditRequires(explanationIds.has(item.sourceSection), `knowledge item ${item.id} must reference an existing explanation (got ${item.sourceSection})`);
}

console.log('N. Conversation topic integration ...');
const employeeConversations = fs.readFileSync(new URL('../src/lib/employeeConversations.js', import.meta.url), 'utf8');
auditRequires(employeeConversations.includes("topicKey('active-directory-virtualbox', 'ad-mmc-helpdesk')"), 'ad-mmc-helpdesk conversation topic must exist in employeeConversations.js');
auditRequires(employeeConversations.includes('MMC für Hilfsadmin'), 'conversation title must match ad-mmc-helpdesk topic title');

console.log('O. No new delegation setup ...');
const source = fs.readFileSync(new URL('../src/lib/academyLessons/adMmcHelpdesk.js', import.meta.url), 'utf8');
auditRequires(!/Schema Master|schmmgmt/i.test(source), 'adMmcHelpdesk must not contain schema master content');
const allText = lesson.explanations.flatMap((e) => e.blocks.map((b) => b.content || '')).join(' ');
auditRequires(!/G_S6.*anlegen|DL_StabPwReset.*anlegen/i.test(allText), 'adMmcHelpdesk must not introduce new delegation setup steps; it should reference Thema 16');

console.log('P. Version check ...');
{
  const buildGradle = fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
  auditRequires(/versionCode 18300/.test(buildGradle), 'versionCode must be 18300 for 1.83.0');
}

console.log('=== Active Directory MMC Helpdesk Quality Audit passed ===');
