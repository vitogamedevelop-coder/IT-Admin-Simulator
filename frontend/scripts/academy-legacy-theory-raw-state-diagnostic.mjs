import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
  get length() { return store.size; },
  key: (i) => Array.from(store.keys())[i] ?? null,
};
globalThis.window = { dispatchEvent: () => {} };
globalThis.Event = class { constructor(t) { this.type = t; } };

const { readAcademyProgress } = await import('../src/lib/academyProgress.js');
const { topicKey } = await import('../src/lib/academyTopics.js');
const { topicTheoryCompletion } = await import('../src/lib/academyEngine.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');

const currentVersion = (await import('../src/lib/academyProgress.js')).STATE_VERSION;

function buildLegacySave(topics) {
  const data = { stateVersion: 10, playerProfile: { preferredExplanationStyle: null }, topics: {} };
  for (const [key, patch] of Object.entries(topics)) {
    data.topics[key] = {
      status: 'locked',
      theoryScore: 0,
      practiceScore: 0,
      retentionScore: 0,
      appliedCount: 0,
      repetitionCount: 0,
      availableLessons: [],
      availableExercises: [],
      unlockedTools: [],
      relatedMissions: [],
      relatedSideMissions: [],
      theoryCompletion: 0,
      startedAt: null,
      lastCompletedSectionId: null,
      lastCompletedSectionTitle: null,
      completedSectionIds: [],
      completedQuestionIds: [],
      completedExerciseIds: [],
      lastExplanationStyle: null,
      lessonCompletions: 0,
      contentSeenPercent: 0,
      quizAttempts: 0,
      quizPerfectCount: 0,
      quizPerfectStreak: 0,
      quizBestScore: 0,
      quizLastScore: 0,
      difficultyLevel: 0,
      difficultyExamsPassed: [],
      version: 1,
      ...patch,
    };
  }
  return data;
}

function printTopic(label, key, raw) {
  const lesson = LESSONS[key];
  const sectionCount = new Set((lesson?.explanations || []).map((e) => {
    const dash = (e.id || '').lastIndexOf('-');
    return e.sectionId || (dash > 0 ? e.id.slice(0, dash) : e.id);
  })).size;

  const display = topicTheoryCompletion(raw);
  console.log(`\n--- ${label} (${key}) ---`);
  console.log(`  status:                 ${raw.status}`);
  console.log(`  theoryCompletion:       ${raw.theoryCompletion}`);
  console.log(`  theoryScore:            ${raw.theoryScore}`);
  console.log(`  contentSeenPercent:     ${raw.contentSeenPercent}`);
  console.log(`  lessonCompletions:      ${raw.lessonCompletions}`);
  console.log(`  completedSectionIds:    [${raw.completedSectionIds.join(', ')}]`);
  console.log(`  completedExerciseIds:   [${(raw.completedExerciseIds || []).join(', ')}]`);
  console.log(`  completedQuestionIds:   [${(raw.completedQuestionIds || []).join(', ')}]`);
  console.log(`  stored version:         ${raw.version}  (current: ${currentVersion})`);
  console.log(`  current section count:  ${sectionCount}`);
  console.log(`  -> topicTheoryCompletion (UI value): ${display}`);
  if (raw.theoryCompletion === 0 && display === 0) {
    console.log('  DIAGNOSIS: No reconstructible 100 % marker. The old save only proves a score or status, not full content completion.');
  }
  if (raw.theoryCompletion === 100) {
    console.log('  DIAGNOSIS: A full-lesson marker (contentSeenPercent/lessonCompletions) is present and reconstructible to 100 %.');
  }
  if (raw.theoryCompletion === 0 && raw.theoryScore > 0) {
    console.log(`  DIAGNOSIS: theoryScore=${raw.theoryScore} is a mastery/quiz score, NOT theory completion. It is deliberately not displayed as theory percent.`);
  }
}

const osiKey = topicKey('fundamentals', 'osi-model');
const dnsKey = topicKey('fundamentals', 'dns');
const commKey = topicKey('fundamentals', 'kommunikation-uebertragung');
const trunkKey = topicKey('cisco-packet-tracer', 'trunk');

console.log('=== Academy Legacy Theory Raw State Diagnostic ===');

// A. Full lesson completion marker exists -> 100 %
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [osiKey]: { status: 'learned', theoryScore: 18, practiceScore: 10, contentSeenPercent: 100, theoryCompletion: 0, lessonCompletions: 0, completedSectionIds: [] },
})));
let migrated = readAcademyProgress();
printTopic('A. OSI – recovered 100 % (contentSeenPercent=100)', osiKey, migrated.topics[osiKey]);
assert.strictEqual(migrated.topics[osiKey].theoryCompletion, 100, 'A. OSI must recover to 100');

// B. No 100 % marker, only learned+theoryScore -> not reconstructed as 100
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [dnsKey]: { status: 'learned', theoryScore: 30, practiceScore: 20, contentSeenPercent: 0, theoryCompletion: 0, lessonCompletions: 0, completedSectionIds: [] },
})));
migrated = readAcademyProgress();
printTopic('B. DNS – still 0 % stored (learned + theoryScore only)', dnsKey, migrated.topics[dnsKey]);
assert.strictEqual(migrated.topics[dnsKey].theoryCompletion, 0, 'B. DNS must NOT be invented as 100');
assert.strictEqual(topicTheoryCompletion(migrated.topics[dnsKey]), 0, 'B. DNS displayed theory must NOT use theoryScore as completion');

// C. completedSectionIds still valid -> 100 %
const topKey = topicKey('fundamentals', 'topologien');
const topSectionIds = LESSONS[topKey]?.explanations?.map((e) => e.id) || [];
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [topKey]: { status: 'learned', theoryScore: 40, practiceScore: 20, theoryCompletion: 0, contentSeenPercent: 0, lessonCompletions: 0, completedSectionIds: topSectionIds },
})));
migrated = readAcademyProgress();
printTopic('C. Topologien – recovered 100 % (full completedSectionIds)', topKey, migrated.topics[topKey]);
assert.strictEqual(migrated.topics[topKey].theoryCompletion, 100, 'C. Topologien must recover to 100');

// D. Cisco Trunk: lessonCompletions -> 100 %
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [trunkKey]: { status: 'learned', theoryScore: 28, practiceScore: 14, theoryCompletion: 0, contentSeenPercent: 0, lessonCompletions: 1, completedSectionIds: [] },
})));
migrated = readAcademyProgress();
printTopic('D. Cisco Trunk – recovered 100 % (lessonCompletions=1)', trunkKey, migrated.topics[trunkKey]);
assert.strictEqual(migrated.topics[trunkKey].theoryCompletion, 100, 'D. Trunk must recover to 100');

// E. Partial content: theoryScore fallback, no 100 % invention
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [commKey]: { status: 'started', theoryScore: 22, theoryCompletion: 25, contentSeenPercent: 30, lessonCompletions: 0, completedSectionIds: [] },
})));
migrated = readAcademyProgress();
printTopic('E. Kommunikation/Übertragung – partial (contentSeenPercent preserved)', commKey, migrated.topics[commKey]);
assert(migrated.topics[commKey].theoryCompletion >= 25, `E. Partial theoryCompletion must not jump to 100 (got ${migrated.topics[commKey].theoryCompletion})`);
assert(topicTheoryCompletion(migrated.topics[commKey]) >= 22, `E. Display at least theoryScore (got ${topicTheoryCompletion(migrated.topics[commKey])})`);

console.log('\n=== Diagnostic summary ===');
console.log('- Recovered to 100 % only where a full-lesson marker exists (contentSeenPercent, lessonCompletions, all sections).');
console.log('- Learned status or theoryScore alone does NOT grant 100 %.');
console.log('- Topics with only theoryScore display 0 % theory completion; theoryScore is a separate mastery value.');
console.log('=== Academy Legacy Theory Raw State Diagnostic passed ===');



