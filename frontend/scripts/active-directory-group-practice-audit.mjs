import fs from 'node:fs';

const { buildAdGroupPracticeLesson, AD_GROUP_PRACTICE_TOPIC_KEY } = await import('../src/lib/academyLessons/adGroupPractice.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');
const { ACADEMY_TOPICS } = await import('../src/lib/academyTopics.js');

function auditRequires(predicate, message) {
  if (!predicate) throw new Error(`AD Group Practice Audit failed: ${message}`);
}

console.log('=== Active Directory Group Practice Audit ===');

auditRequires(LESSONS[AD_GROUP_PRACTICE_TOPIC_KEY], 'ad-group-practice must be registered in LESSONS');

const lesson = buildAdGroupPracticeLesson();

console.log('A. Title and topic registration ...');
auditRequires(lesson.title === 'Gruppen praktisch anlegen & verschachteln', `unexpected title: ${lesson.title}`);
const topic = ACADEMY_TOPICS.find((t) => t.topicId === 'ad-group-practice' && t.categoryId === 'active-directory-virtualbox');
auditRequires(topic, 'ad-group-practice must exist in ACADEMY_TOPICS');
auditRequires(topic.title === 'Gruppen praktisch anlegen & verschachteln', 'unexpected topic title');
auditRequires(topic.prerequisites.includes('active-directory-virtualbox/ad-permissions'), 'ad-group-practice must require ad-permissions');

console.log('B. Theory explanations ...');
auditRequires(lesson.explanations.length >= 4, `expected at least 4 explanations, got ${lesson.explanations.length}`);
auditRequires(lesson.explanations.some((e) => e.id === 'adg-recap'), 'missing adg-recap');
auditRequires(lesson.explanations.some((e) => e.id === 'adg-functional-vs-permission'), 'missing adg-functional-vs-permission');
auditRequires(lesson.explanations.some((e) => e.id === 'adg-scope-recap'), 'missing adg-scope-recap');
auditRequires(lesson.explanations.some((e) => e.id === 'adg-aduc-recap'), 'missing adg-aduc-recap');

console.log('C. Guided UIs ...');
const guidedUis = lesson.exercises.filter((e) => e.type === 'guided-ui');
auditRequires(guidedUis.length >= 4, `expected at least 4 guided UIs, got ${guidedUis.length}`);
const guidedIds = new Set(guidedUis.map((e) => e.id));
auditRequires(guidedIds.has('adg-guided-create-global'), 'missing global group creation guided UI');
auditRequires(guidedIds.has('adg-guided-create-dl'), 'missing domain local group creation guided UI');
auditRequires(guidedIds.has('adg-guided-add-member'), 'missing add user to group guided UI');
auditRequires(guidedIds.has('adg-guided-nest'), 'missing nest group guided UI');
auditRequires(guidedIds.has('adg-admin-challenge'), 'missing admin challenge guided UI');

for (const gui of guidedUis) {
  auditRequires(Array.isArray(gui.steps) && gui.steps.length >= 1, `${gui.id} must have steps`);
  for (const step of gui.steps) {
    auditRequires(step.kind === 'navigation' || step.kind === 'decision', `${step.id} must have kind navigation or decision`);
    auditRequires(Array.isArray(step.targets) && step.targets.length >= 2, `${step.id} must have targets`);
    auditRequires(step.correctTarget, `${step.id} must define correctTarget`);
  }
}

console.log('D. Troubleshooting exercises ...');
const troubleIds = ['adg-trouble-scope', 'adg-trouble-ou', 'adg-trouble-direct-dl', 'adg-trouble-members-vs-memberof', 'adg-trouble-wrong-permission-group'];
for (const id of troubleIds) {
  auditRequires(lesson.exercises.some((e) => e.id === id), `missing troubleshooting exercise ${id}`);
}

console.log('E. Quiz ...');
auditRequires(lesson.quiz.length >= 5, `expected at least 5 quiz questions, got ${lesson.quiz.length}`);

console.log('F. Version check ...');
{
  const buildGradle = fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
  auditRequires(/versionCode 19200/.test(buildGradle), 'versionCode must be 19200 for 1.92.0');
}

console.log('=== Active Directory Group Practice Audit passed ===');









