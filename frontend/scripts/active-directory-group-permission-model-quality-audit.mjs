import fs from 'node:fs';

const { buildAdPermissionsLesson } = await import('../src/lib/academyLessons/adPermissions.js');
const { adPermissionsKnowledgeItems } = await import('../src/lib/knowledge/items/adPermissions.js');

function auditRequires(predicate, message) {
  if (!predicate) throw new Error(`AD Group Permission Model Quality Audit failed: ${message}`);
}

console.log('=== Active Directory Group Permission Model Quality Audit ===');

const lesson = buildAdPermissionsLesson();

console.log('A. Lesson title and structure ...');
auditRequires(lesson.title === 'Gruppen & Berechtigungsverwaltung', `title should be 'Gruppen & Berechtigungsverwaltung', got ${lesson.title}`);
auditRequires(lesson.explanations.length >= 7, `expected at least 7 explanation sections, got ${lesson.explanations.length}`);
auditRequires(lesson.explanations.some((e) => e.id === 'adp-problem'), 'missing adp-problem section');
auditRequires(lesson.explanations.some((e) => e.id === 'adp-least-privilege'), 'missing adp-least-privilege section');
auditRequires(lesson.explanations.some((e) => e.id === 'adp-gruppentypen'), 'missing adp-gruppentypen section');
auditRequires(lesson.explanations.some((e) => e.id === 'adp-bereiche'), 'missing adp-bereiche section');
auditRequires(lesson.explanations.some((e) => e.id === 'adp-verschachtelung'), 'missing adp-verschachtelung section');
auditRequires(lesson.explanations.some((e) => e.id === 'adp-agdlp'), 'missing adp-agdlp section');
auditRequires(lesson.explanations.some((e) => e.id === 'adp-aggp'), 'missing adp-aggp section');
auditRequires(lesson.explanations.some((e) => e.id === 'adp-transfer'), 'missing adp-transfer section');

console.log('B. Exercise pool ...');
auditRequires(lesson.exercises.length >= 10, `expected at least 10 exercises, got ${lesson.exercises.length}`);
const selectBestCount = lesson.exercises.filter((e) => e.type === 'select-best').length;
const matchingCount = lesson.exercises.filter((e) => e.type === 'matching').length;
const orderingCount = lesson.exercises.filter((e) => e.type === 'ordering').length;
auditRequires(selectBestCount >= 6, `expected at least 6 select-best exercises, got ${selectBestCount}`);
auditRequires(matchingCount >= 1, `expected at least 1 matching exercise, got ${matchingCount}`);
auditRequires(orderingCount >= 1, `expected at least 1 ordering exercise, got ${orderingCount}`);
const scenarioCount = lesson.exercises.filter((e) => /Ordner|Personalwechsel|Befehle|Leserechte|20 Mitarbeiter/.test(e.question)).length;
auditRequires(scenarioCount >= 2, `expected at least 2 scenario exercises, got ${scenarioCount}`);

console.log('C. Quiz present ...');
auditRequires(lesson.quiz.length >= 5, `expected at least 5 quiz questions, got ${lesson.quiz.length}`);

console.log('D. Knowledge item facets ...');
const clusters = new Set(adPermissionsKnowledgeItems.map((i) => i.conceptCluster));
const expectedClusters = [
  'ad.permissions.privilege',
  'ad.permissions.group',
  'ad.permissions.group.scope',
  'ad.permissions.nesting',
  'ad.permissions.agdlp',
  'ad.permissions.aggp',
  'ad.permissions.problem',
];
for (const c of expectedClusters) {
  auditRequires(clusters.has(c), `missing knowledge facet ${c}`);
}
auditRequires(adPermissionsKnowledgeItems.length >= 10, `expected at least 10 knowledge items, got ${adPermissionsKnowledgeItems.length}`);

console.log('E. No prohibited byte-size trivia ...');
const adPermissionsSrc = fs.readFileSync(new URL('../src/lib/academyLessons/adPermissions.js', import.meta.url), 'utf8');
const knowledgeSrc = fs.readFileSync(new URL('../src/lib/knowledge/items/adPermissions.js', import.meta.url), 'utf8');
const employeeConvSrc = fs.readFileSync(new URL('../src/lib/employeeConversations.js', import.meta.url), 'utf8');
const combined = `${adPermissionsSrc}\n${knowledgeSrc}\n${employeeConvSrc}`;
auditRequires(!/\b(40\s*Byte|8\s*Byte|Byte.*Gruppe)\b/.test(combined), 'byte-size trivia must not be present');
auditRequires(!/Global.*kann.*auf alle Ressourcen.*zugreifen/.test(combined), 'global group auto-access misconception must be corrected');
auditRequires(!/Universal.*kann.*auf alle Ressourcen.*zugreifen/.test(combined), 'universal group auto-access misconception must be corrected');

console.log('F. Conversation integration ...');
auditRequires(/active-directory-virtualbox.*ad-permissions/.test(employeeConvSrc), 'ad-permissions must be present in employeeConversations');

console.log('G. Fresh build version ...');
auditRequires(/versionCode 18600/.test(fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8')), 'android versionCode must be 18600 for 1.86.0');

console.log('=== Active Directory Group Permission Model Quality Audit passed ===');


