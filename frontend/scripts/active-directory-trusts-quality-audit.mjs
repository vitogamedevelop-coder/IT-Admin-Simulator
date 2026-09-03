import fs from 'node:fs';

const { buildAdTrustsLesson, AD_TRUSTS_TOPIC_KEY } = await import('../src/lib/academyLessons/adTrusts.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');
const { ACADEMY_TOPICS } = await import('../src/lib/academyTopics.js');
const { getKnowledgeItemsByTopic } = await import('../src/lib/knowledge/index.js');
const { adTrustsKnowledgeItems } = await import('../src/lib/knowledge/items/adTrusts.js');

function auditRequires(predicate, message) {
  if (!predicate) throw new Error(`AD Trusts Quality Audit failed: ${message}`);
}

console.log('=== Active Directory Trusts Quality Audit ===');

auditRequires(LESSONS[AD_TRUSTS_TOPIC_KEY], 'ad-trusts must be registered in LESSONS');

const lesson = buildAdTrustsLesson();

console.log('A. Title and topic registration ...');
auditRequires(lesson.title === 'Vertrauensstellungen', `unexpected title: ${lesson.title}`);
const topic = ACADEMY_TOPICS.find((t) => t.topicId === 'ad-trusts' && t.categoryId === 'active-directory-virtualbox');
auditRequires(topic, 'ad-trusts must exist in ACADEMY_TOPICS');
auditRequires(topic.title === 'Vertrauensstellungen', 'unexpected topic title');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-tree-forest'), 'ad-trusts should require ad-tree-forest');

console.log('B. Theory explanations ...');
auditRequires(lesson.explanations.length >= 10, `expected at least 10 explanations, got ${lesson.explanations.length}`);
const requiredExplanations = [
  'ad-trusts-intro', 'ad-trusts-trust-vs-permission', 'ad-trusts-one-way',
  'ad-trusts-trusting-trusted', 'ad-trusts-outgoing', 'ad-trusts-incoming',
  'ad-trusts-perspective', 'ad-trusts-two-way', 'ad-trusts-transitive',
  'ad-trusts-parent-child', 'ad-trusts-display', 'ad-trusts-troubleshooting',
];
for (const id of requiredExplanations) {
  auditRequires(lesson.explanations.some((e) => e.id === id), `missing explanation ${id}`);
}

console.log('C. Core concepts covered ...');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-trusts-trust-vs-permission' && e.blocks.some((b) => b.type === 'text' && /Berechtigung|Permission|identität/i.test(b.content))), 'trust vs permission missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-trusts-one-way' && e.blocks.some((b) => b.type === 'text' && /unidirektional|eine Richtung/i.test(b.content))), 'one-way trust missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-trusts-two-way' && e.blocks.some((b) => b.type === 'text' && /bidirektional|beide Richtungen/i.test(b.content))), 'two-way trust missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-trusts-trusting-trusted' && e.blocks.some((b) => b.type === 'text' && /trusting|trusted|vertrauende|vertraute/i.test(b.content))), 'trusting/trusted missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-trusts-outgoing' && e.blocks.some((b) => b.type === 'text' && /outgoing|ausgehend/i.test(b.content))), 'outgoing missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-trusts-incoming' && e.blocks.some((b) => b.type === 'text' && /incoming|eingehend/i.test(b.content))), 'incoming missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-trusts-transitive' && e.blocks.some((b) => b.type === 'text' && /transitiv|Vertrauenspfad/i.test(b.content))), 'transitive missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-trusts-parent-child' && e.blocks.some((b) => b.type === 'text' && /Parent|Child|automatisch/i.test(b.content))), 'parent/child automatic trust missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-trusts-display' && e.blocks.some((b) => b.type === 'text' && /Vertrauensstellungen|Trusts/i.test(b.content))), 'trust display UI missing');
auditRequires(lesson.explanations.some((e) => e.id === 'ad-trusts-troubleshooting' && e.blocks.some((b) => b.type === 'text' && /Berechtigung|ACL|Gruppenmitgliedschaft/i.test(b.content))), 'troubleshooting/permission separation missing');

console.log('D. Visuals ...');
const diagramBlocks = lesson.explanations.flatMap((e) => e.blocks).filter((b) => b.type === 'diagram');
auditRequires(diagramBlocks.length >= 3, `expected at least 3 diagrams, got ${diagramBlocks.length}`);

console.log('E. Exercises ...');
auditRequires(lesson.exercises.length >= 12, `expected at least 12 exercises, got ${lesson.exercises.length}`);
const exerciseIds = new Set(lesson.exercises.map((e) => e.id));
const requiredTypes = ['select-best', 'matching'];
for (const type of requiredTypes) {
  auditRequires(lesson.exercises.some((e) => e.type === type), `missing exercise type ${type}`);
}
const scenarioIds = lesson.exercises.filter((e) => /transfer|misconception|troubleshooting|perspective/i.test(e.id));
auditRequires(scenarioIds.length >= 4, 'expected at least 4 scenario/transfer/misconception exercises');
const requiredExercises = [
  'ad-trusts-trust-vs-access', 'ad-trusts-one-way-direction', 'ad-trusts-trusting-trusted-match',
  'ad-trusts-outgoing-incoming', 'ad-trusts-perspective', 'ad-trusts-two-way',
  'ad-trusts-transitive', 'ad-trusts-parent-child', 'ad-trusts-misconception-access',
  'ad-trusts-misconception-transitive-permission', 'ad-trusts-misconception-trusted-definition',
  'ad-trusts-transfer', 'ad-trusts-troubleshooting',
];
for (const id of requiredExercises) {
  auditRequires(exerciseIds.has(id), `missing exercise ${id}`);
}
const guidedUis = lesson.exercises.filter((e) => e.type === 'guided-ui');
auditRequires(guidedUis.length >= 2, `expected at least 2 guided UIs, got ${guidedUis.length}`);

console.log('F. Quiz ...');
auditRequires(lesson.quiz.length >= 5, `expected at least 5 quiz questions, got ${lesson.quiz.length}`);

console.log('G. Summary ...');
auditRequires(lesson.summary.length >= 8, `expected at least 8 summary points, got ${lesson.summary.length}`);

console.log('H. Knowledge items ...');
const explanationIds = new Set(lesson.explanations.map((e) => e.id));
const topicItems = getKnowledgeItemsByTopic(AD_TRUSTS_TOPIC_KEY);
const topicItemIds = new Set(topicItems.map((i) => i.id));
const expectedItemIds = new Set(adTrustsKnowledgeItems.map((i) => i.id));
for (const id of expectedItemIds) {
  auditRequires(topicItemIds.has(id), `knowledge item ${id} must be registered`);
}
auditRequires(adTrustsKnowledgeItems.length >= 12, `expected at least 12 knowledge items, got ${adTrustsKnowledgeItems.length}`);
for (const item of adTrustsKnowledgeItems) {
  auditRequires(item.topicKey === AD_TRUSTS_TOPIC_KEY, `knowledge item ${item.id} must use ad-trusts topicKey`);
  auditRequires(explanationIds.has(item.sourceSection), `knowledge item ${item.id} must reference an existing explanation (got ${item.sourceSection})`);
}

console.log('I. Conversation topic integration ...');
const employeeConversations = fs.readFileSync(new URL('../src/lib/employeeConversations.js', import.meta.url), 'utf8');
auditRequires(employeeConversations.includes("topicKey('active-directory-virtualbox', 'ad-trusts')"), 'ad-trusts conversation topic must exist in employeeConversations.js');
auditRequires(employeeConversations.includes('Vertrauensstellungen'), 'conversation title must match ad-trusts topic title');

console.log('J. No premature FSMO / privileged-admin content ...');
const source = fs.readFileSync(new URL('../src/lib/academyLessons/adTrusts.js', import.meta.url), 'utf8');
auditRequires(!/Domain Naming Master|Schema Master|RID Master|PDC Emulator|Infrastructure Master|FSMO|netdom query fsmo|schmmgmt\.dll|Schema-Snap-In/i.test(source), 'adTrusts must not introduce FSMO details');
auditRequires(!/Enterprise Admins|Domain Admins|Schema Admins|privilegierte Administratorgruppen/i.test(source), 'adTrusts must not introduce privileged admin groups');

console.log('K. No deep trust-type overload ...');
auditRequires(!/external trust|realm trust|shortcut trust|forest trust|inter-forest|intra-forest/i.test(source), 'adTrusts should not overload trust subtypes');

console.log('L. Version check ...');
{
  const buildGradle = fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
  auditRequires(/versionCode 18900/.test(buildGradle), 'versionCode must be 18900 for 1.89.0');
}

console.log('=== Active Directory Trusts Quality Audit passed ===');






