import fs from 'node:fs';

const { buildAdMmcBasicsLesson, AD_MMC_BASICS_TOPIC_KEY } = await import('../src/lib/academyLessons/adMmcBasics.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');
const { ACADEMY_TOPICS } = await import('../src/lib/academyTopics.js');
const { getKnowledgeItemsByTopic } = await import('../src/lib/knowledge/index.js');
const { adMmcBasicsKnowledgeItems } = await import('../src/lib/knowledge/items/adMmcBasics.js');

function auditRequires(predicate, message) {
  if (!predicate) throw new Error(`AD MMC Basics Audit failed: ${message}`);
}

console.log('=== Active Directory MMC Basics Quality Audit ===');

auditRequires(LESSONS[AD_MMC_BASICS_TOPIC_KEY], 'ad-mmc-basics must be registered in LESSONS');

const lesson = buildAdMmcBasicsLesson();

console.log('A. Title and topic registration ...');
auditRequires(lesson.title === 'Microsoft Management Console & Snap-Ins', `unexpected title: ${lesson.title}`);
const topic = ACADEMY_TOPICS.find((t) => t.topicId === 'ad-mmc-basics' && t.categoryId === 'active-directory-virtualbox');
auditRequires(topic, 'ad-mmc-basics must exist in ACADEMY_TOPICS');
auditRequires(topic.title === 'Microsoft Management Console & Snap-Ins', 'unexpected topic title');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-group-practice'), 'ad-mmc-basics should require ad-group-practice');

console.log('B. Theory explanations ...');
auditRequires(lesson.explanations.length >= 8, `expected at least 8 explanations, got ${lesson.explanations.length}`);
const requiredExplanations = [
  'ad-mmc-why', 'ad-mmc-definition', 'ad-mmc-snapin', 'ad-mmc-msc',
  'ad-mmc-tools', 'ad-mmc-open', 'ad-mmc-add', 'ad-mmc-modes',
  'ad-mmc-limited', 'ad-mmc-ui-vs-permission', 'ad-mmc-preview',
];
for (const id of requiredExplanations) {
  auditRequires(lesson.explanations.some((e) => e.id === id), `missing explanation ${id}`);
}

console.log('C. Core concepts covered ...');
auditRequires(lesson.explanations.some((e) => e.blocks.some((b) => b.type === 'text' && b.content.includes('Werkzeugkoffer'))), 'MMC=Werkzeugkoffer mental model missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-mmc-ui-vs-permission' && e.blocks.some((b) => b.type === 'text' && b.content.includes('keine Sicherheitsgrenze'))), 'UI vs permission warning missing');

console.log('D. Exercises ...');
auditRequires(lesson.exercises.length >= 8, `expected at least 8 exercises, got ${lesson.exercises.length}`);
const exerciseIds = new Set(lesson.exercises.map((e) => e.id));
const requiredExercises = [
  'ad-mmc-vs-snapin', 'ad-mmc-snapin-executes', 'ad-mmc-msc', 'ad-mmc-tool-matching',
  'ad-mmc-add-snapin-ordering', 'ad-mmc-author-mode', 'ad-mmc-restricted-single',
  'ad-mmc-ui-vs-permission', 'ad-mmc-add-snapin-guided-ui', 'ad-mmc-tool-selection-guided-ui',
  'ad-mmc-transfer',
];
for (const id of requiredExercises) {
  auditRequires(exerciseIds.has(id), `missing exercise ${id}`);
}

console.log('E. Guided UIs ...');
const guidedUis = lesson.exercises.filter((e) => e.type === 'guided-ui');
auditRequires(guidedUis.length === 2, `expected 2 guided UIs, got ${guidedUis.length}`);
for (const gui of guidedUis) {
  auditRequires(Array.isArray(gui.steps) && gui.steps.length >= 1, `${gui.id} must have steps`);
  for (const step of gui.steps) {
    auditRequires(step.kind === 'navigation' || step.kind === 'decision', `${step.id} must have kind navigation or decision`);
    auditRequires(Array.isArray(step.targets) && step.targets.length >= 2, `${step.id} must have targets`);
    auditRequires(step.correctTarget, `${step.id} must define correctTarget`);
  }
}

console.log('F. Snap-In Add/Remove flow ...');
const addSnapinGui = guidedUis.find((g) => g.id === 'ad-mmc-add-snapin-guided-ui');
auditRequires(addSnapinGui, 'missing add snap-in guided UI');
auditRequires(addSnapinGui.steps.some((s) => s.correctTarget === 'datei'), 'add snap-in flow should include File menu');
auditRequires(addSnapinGui.steps.some((s) => s.correctTarget === 'hinzufuegen'), 'add snap-in flow should include Add action');
auditRequires(addSnapinGui.steps.some((s) => s.correctTarget === 'aduc'), 'add snap-in flow should select ADUC');

console.log('G. Tool selection guided UI ...');
const toolGui = guidedUis.find((g) => g.id === 'ad-mmc-tool-selection-guided-ui');
auditRequires(toolGui, 'missing tool selection guided UI');
auditRequires(toolGui.steps.some((s) => s.correctTarget === 'dns'), 'tool selection should include DNS-Manager correct answer');

console.log('H. Quiz ...');
auditRequires(lesson.quiz.length >= 5, `expected at least 5 quiz questions, got ${lesson.quiz.length}`);

console.log('I. Summary ...');
auditRequires(lesson.summary.length >= 5, `expected at least 5 summary points, got ${lesson.summary.length}`);

console.log('J. Knowledge items ...');
const explanationIds = new Set(lesson.explanations.map((e) => e.id));
const topicItems = getKnowledgeItemsByTopic(AD_MMC_BASICS_TOPIC_KEY);
const topicItemIds = new Set(topicItems.map((i) => i.id));
const expectedItemIds = new Set(adMmcBasicsKnowledgeItems.map((i) => i.id));

for (const id of expectedItemIds) {
  auditRequires(topicItemIds.has(id), `knowledge item ${id} must be registered in knowledge/index.js`);
}
auditRequires(adMmcBasicsKnowledgeItems.length >= 10, `expected at least 10 knowledge items, got ${adMmcBasicsKnowledgeItems.length}`);

for (const item of adMmcBasicsKnowledgeItems) {
  auditRequires(item.topicKey === AD_MMC_BASICS_TOPIC_KEY, `knowledge item ${item.id} must use ad-mmc-basics topicKey`);
  auditRequires(explanationIds.has(item.sourceSection), `knowledge item ${item.id} must reference an existing explanation (got ${item.sourceSection})`);
}

console.log('K. Conversation topic integration ...');
const employeeConversations = fs.readFileSync(new URL('../src/lib/employeeConversations.js', import.meta.url), 'utf8');
auditRequires(employeeConversations.includes("topicKey('active-directory-virtualbox', 'ad-mmc-basics')"), 'ad-mmc-basics conversation topic must exist in employeeConversations.js');
auditRequires(employeeConversations.includes('Microsoft Management Console & Snap-Ins'), 'conversation title must match ad-mmc-basics topic title');

console.log('L. Version check ...');
{
  const buildGradle = fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
  auditRequires(/versionCode 18800/.test(buildGradle), 'versionCode must be 18800 for 1.88.0');
}

console.log('=== Active Directory MMC Basics Quality Audit passed ===');





