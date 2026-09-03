const { buildAdTrustsLesson, AD_TRUSTS_TOPIC_KEY } = await import('../src/lib/academyLessons/adTrusts.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');
const { ACADEMY_TOPICS } = await import('../src/lib/academyTopics.js');

const { explanations, exercises } = buildAdTrustsLesson();

function assert(predicate, message) {
  if (!predicate) throw new Error(`Trust Direction Contract Test failed: ${message}`);
}

console.log('=== Active Directory Trust Direction Contract Test ===');

assert(LESSONS[AD_TRUSTS_TOPIC_KEY], 'ad-trusts must be registered in LESSONS');
const topic = ACADEMY_TOPICS.find((t) => t.topicId === 'ad-trusts' && t.categoryId === 'active-directory-virtualbox');
assert(topic, 'ad-trusts must exist in ACADEMY_TOPICS');

console.log('A. Trusting / Trusted direction ...');
const fullText = explanations.flatMap((e) => e.blocks).map((b) => (b.type === 'text' ? b.content : '')).join(' ');
assert(/trusting/i.test(fullText), 'lesson must mention trusting');
assert(/trusted/i.test(fullText), 'lesson must mention trusted');
assert(/vertrauende Domäne/i.test(fullText), 'lesson must mention vertrauende Domäne');
assert(/vertraute Domäne/i.test(fullText), 'lesson must mention vertraute Domäne');

console.log('B. Outgoing / Incoming direction ...');
assert(/outgoing/i.test(fullText), 'lesson must mention outgoing');
assert(/incoming/i.test(fullText), 'lesson must mention incoming');
assert(/ausgehend/i.test(fullText), 'lesson must mention ausgehend');
assert(/eingehend/i.test(fullText), 'lesson must mention eingehend');

console.log('C. Perspective exercises ...');
const perspectiveExercise = exercises.find((e) => e.id === 'ad-trusts-perspective');
assert(perspectiveExercise, 'ad-trusts-perspective exercise must exist');
assert(perspectiveExercise.type === 'select-best', 'perspective exercise must be select-best');

console.log('D. Cross-domain resource scenario ...');
assert(
  exercises.some((e) => /Benutzer.*B.*Ressourcen.*A|B.*Benutzer.*A.*Ressourcen|Ressourcen in A.*Benutzer aus B/i.test(JSON.stringify(e))),
  'exercises must cover the B user → A resource scenario'
);
assert(
  /B-Benutzer.*Ressourcen in A|B-Benutzer.*für.*Ressourcen.*A|Benutzer aus B.*Ressourcen in A/i.test(fullText + JSON.stringify(exercises)),
  'content must clarify that B users can be authorized for A resources'
);

console.log('=== Active Directory Trust Direction Contract Test passed ===');
