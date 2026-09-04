import fs from 'node:fs';

const { buildAdTreeForestLesson, AD_TREE_FOREST_TOPIC_KEY } = await import('../src/lib/academyLessons/adTreeForest.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');
const { ACADEMY_TOPICS } = await import('../src/lib/academyTopics.js');
const { getKnowledgeItemsByTopic } = await import('../src/lib/knowledge/index.js');
const { adTreeForestKnowledgeItems } = await import('../src/lib/knowledge/items/adTreeForest.js');

function auditRequires(predicate, message) {
  if (!predicate) throw new Error(`AD Tree Forest Audit failed: ${message}`);
}

console.log('=== Active Directory Tree Forest Quality Audit ===');

auditRequires(LESSONS[AD_TREE_FOREST_TOPIC_KEY], 'ad-tree-forest must be registered in LESSONS');

const lesson = buildAdTreeForestLesson();

console.log('A. Title and topic registration ...');
auditRequires(lesson.title === 'Trees, Forests & Subdomänen', `unexpected title: ${lesson.title}`);
const topic = ACADEMY_TOPICS.find((t) => t.topicId === 'ad-tree-forest' && t.categoryId === 'active-directory-virtualbox');
auditRequires(topic, 'ad-tree-forest must exist in ACADEMY_TOPICS');
auditRequires(topic.title === 'Trees, Forests & Subdomänen', 'unexpected topic title');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-foundation'), 'ad-tree-forest should require ad-foundation');

console.log('B. Theory explanations ...');
auditRequires(lesson.explanations.length >= 10, `expected at least 10 explanations, got ${lesson.explanations.length}`);
const requiredExplanations = [
  'ad-tree-forest-recap', 'ad-tree-forest-domain', 'ad-tree-forest-root',
  'ad-tree-forest-child', 'ad-tree-forest-namespace', 'ad-tree-forest-tree',
  'ad-tree-forest-forest', 'ad-tree-forest-multi-tree', 'ad-tree-forest-shared',
  'ad-tree-forest-distinction', 'ad-tree-forest-lookahead',
];
for (const id of requiredExplanations) {
  auditRequires(lesson.explanations.some((e) => e.id === id), `missing explanation ${id}`);
}

console.log('C. Core concepts covered ...');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-tree-forest-root' && e.blocks.some((b) => b.type === 'text' && b.content.includes('Stammdomäne'))), 'root domain missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-tree-forest-child' && e.blocks.some((b) => b.type === 'text' && b.content.includes('Child Domain'))), 'child domain missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-tree-forest-tree' && e.blocks.some((b) => b.type === 'text' && b.content.includes('zusammenhängendem DNS-Namensraum'))), 'tree namespace missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-tree-forest-forest' && e.blocks.some((b) => b.type === 'text' && b.content.includes('oberste logische AD-Struktur'))), 'forest definition missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-tree-forest-shared' && e.blocks.some((b) => b.type === 'text' && b.content.includes('Schema'))), 'schema shared missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-tree-forest-shared' && e.blocks.some((b) => b.type === 'text' && b.content.includes('Konfigurationspartition'))), 'configuration partition missing');

console.log('D. Visuals ...');
const diagramBlocks = lesson.explanations.flatMap((e) => e.blocks).filter((b) => b.type === 'diagram');
auditRequires(diagramBlocks.length >= 3, `expected at least 3 diagrams, got ${diagramBlocks.length}`);

console.log('E. Exercises ...');
auditRequires(lesson.exercises.length >= 10, `expected at least 10 exercises, got ${lesson.exercises.length}`);
const exerciseIds = new Set(lesson.exercises.map((e) => e.id));
const requiredTypes = ['select-best', 'matching', 'ordering'];
for (const type of requiredTypes) {
  auditRequires(lesson.exercises.some((e) => e.type === type), `missing exercise type ${type}`);
}
const scenarioIds = lesson.exercises.filter((e) => /transfer|misconception|scenario/i.test(e.id));
auditRequires(scenarioIds.length >= 3, 'expected at least 3 scenario/transfer/misconception exercises');
const requiredExercises = [
  'ad-tree-forest-child-domain', 'ad-tree-forest-tree-example', 'ad-tree-forest-different-namespace',
  'ad-tree-forest-matching', 'ad-tree-forest-ordering', 'ad-tree-forest-classification',
  'ad-tree-forest-misconception-1', 'ad-tree-forest-misconception-2', 'ad-tree-forest-misconception-3',
  'ad-tree-forest-transfer-1', 'ad-tree-forest-transfer-2',
];
for (const id of requiredExercises) {
  auditRequires(exerciseIds.has(id), `missing exercise ${id}`);
}

console.log('F. No guided UIs ...');
auditRequires(!lesson.exercises.some((e) => e.type === 'guided-ui'), 'ad-tree-forest should not contain guided UIs');

console.log('G. Quiz ...');
auditRequires(lesson.quiz.length >= 5, `expected at least 5 quiz questions, got ${lesson.quiz.length}`);

console.log('H. Summary ...');
auditRequires(lesson.summary.length >= 8, `expected at least 8 summary points, got ${lesson.summary.length}`);

console.log('I. Knowledge items ...');
const explanationIds = new Set(lesson.explanations.map((e) => e.id));
const topicItems = getKnowledgeItemsByTopic(AD_TREE_FOREST_TOPIC_KEY);
const topicItemIds = new Set(topicItems.map((i) => i.id));
const expectedItemIds = new Set(adTreeForestKnowledgeItems.map((i) => i.id));
for (const id of expectedItemIds) {
  auditRequires(topicItemIds.has(id), `knowledge item ${id} must be registered`);
}
auditRequires(adTreeForestKnowledgeItems.length >= 12, `expected at least 12 knowledge items, got ${adTreeForestKnowledgeItems.length}`);
for (const item of adTreeForestKnowledgeItems) {
  auditRequires(item.topicKey === AD_TREE_FOREST_TOPIC_KEY, `knowledge item ${item.id} must use ad-tree-forest topicKey`);
  auditRequires(explanationIds.has(item.sourceSection), `knowledge item ${item.id} must reference an existing explanation (got ${item.sourceSection})`);
}

console.log('J. Conversation topic integration ...');
const employeeConversations = fs.readFileSync(new URL('../src/lib/employeeConversations.js', import.meta.url), 'utf8');
auditRequires(employeeConversations.includes("topicKey('active-directory-virtualbox', 'ad-tree-forest')"), 'ad-tree-forest conversation topic must exist in employeeConversations.js');
auditRequires(employeeConversations.includes('Trees, Forests & Subdomänen'), 'conversation title must match ad-tree-forest topic title');

console.log('K. No premature trust/FSMO content ...');
const source = fs.readFileSync(new URL('../src/lib/academyLessons/adTreeForest.js', import.meta.url), 'utf8');
auditRequires(!/Trust|trusting|trusted|one-way|two-way|transitive/i.test(source), 'adTreeForest must not introduce trust details');
auditRequires(!/Domain Naming Master|Schema Master|RID Master|PDC Emulator|Infrastructure Master|FSMO/i.test(source), 'adTreeForest must not introduce FSMO details');

console.log('L. Version check ...');
{
  const buildGradle = fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
  auditRequires(/versionCode 19300/.test(buildGradle), 'versionCode must be 19200 for 1.93.0');
}

console.log('=== Active Directory Tree Forest Quality Audit passed ===');









