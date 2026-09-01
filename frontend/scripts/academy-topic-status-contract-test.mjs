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

const { readAcademyProgress, updateTopicProgress, getTopicProgress } = await import('../src/lib/academyProgress.js');
const { computeNextStatus } = await import('../src/lib/academyStatus.js');
const {
  recordSectionCompletion, recordLessonCompletion, recordQuestionAnswer,
} = await import('../src/lib/academyEngine.js');
const { topicKey } = await import('../src/lib/academyTopics.js');
const { TOPIC_STATUS } = await import('../src/lib/academyTopics.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');

function deriveSectionIds(lesson) {
  const seen = new Set();
  const ids = [];
  (lesson?.explanations || []).forEach((ex) => {
    const dash = (ex.id || '').lastIndexOf('-');
    const sid = ex.sectionId || (dash > 0 ? ex.id.slice(0, dash) : ex.id);
    if (sid && !seen.has(sid)) {
      seen.add(sid);
      ids.push(sid);
    }
  });
  return ids;
}

const OSI_KEY = topicKey('fundamentals', 'osi-model');
const OSI_SECTIONS = deriveSectionIds(LESSONS[OSI_KEY]);

function resetFresh() {
  store.clear();
  store.set('cyberlearn:academy-progress-v1', JSON.stringify({ stateVersion: 10, playerProfile: {}, topics: {} }));
}

console.log('=== Academy Topic Status Contract Test ===');

// A. 0 theory / 0 practice / 0 completion
resetFresh();
let p = getTopicProgress('fundamentals', 'osi-model');
console.log('A. 0/0/0 status...');
assert.strictEqual(p.status, TOPIC_STATUS.AVAILABLE, 'fresh osi-model is available');
assert.strictEqual(computeNextStatus(p), TOPIC_STATUS.AVAILABLE, '0/0/0 stays available');

// B. partial theory -> STARTED
resetFresh();
recordSectionCompletion('fundamentals', 'osi-model', OSI_SECTIONS[0], 'Intro', OSI_SECTIONS.length);
p = getTopicProgress('fundamentals', 'osi-model');
console.log('B. partial theory status...');
assert.strictEqual(p.status, TOPIC_STATUS.STARTED, 'one completed section makes the topic STARTED');
assert(p.theoryCompletion > 0, 'partial theory completion is positive');

// C. full theory / low practice -> LEARNED
resetFresh();
OSI_SECTIONS.forEach((sid) => recordSectionCompletion('fundamentals', 'osi-model', sid, sid, OSI_SECTIONS.length));
p = getTopicProgress('fundamentals', 'osi-model');
console.log('C. 100 % theory / low practice status...');
assert.strictEqual(p.theoryCompletion, 100, 'all sections give 100 % theory');
assert.strictEqual(p.status, TOPIC_STATUS.LEARNED, 'full theory makes the topic LEARNED');

// D. 100 % theory / sufficient practice + applied -> APPLIED
resetFresh();
OSI_SECTIONS.forEach((sid) => recordSectionCompletion('fundamentals', 'osi-model', sid, sid, OSI_SECTIONS.length));
updateTopicProgress('fundamentals', 'osi-model', {
  practiceScore: 35,
  appliedCount: 1,
});
p = readAcademyProgress().topics[OSI_KEY];
console.log('D. 100 % theory + sufficient practice + applied...');
assert.strictEqual(computeNextStatus(p), TOPIC_STATUS.APPLIED, 'full theory + practice + applied -> APPLIED');

// E. legacy LEARNED with theoryScore but no theory completion is preserved (not downgraded)
resetFresh();
updateTopicProgress('fundamentals', 'osi-model', {
  status: TOPIC_STATUS.LEARNED,
  theoryScore: 30,
  theoryCompletion: 0,
  contentSeenPercent: 0,
});
p = readAcademyProgress().topics[OSI_KEY];
console.log('E. legacy learned with theoryScore only...');
assert.strictEqual(p.status, TOPIC_STATUS.LEARNED, 'legacy LEARNED status is never downgraded');
assert.strictEqual(p.theoryCompletion, 0, 'theoryCompletion is not invented from theoryScore');

// F. revisit of a complete lesson keeps LEARNED
resetFresh();
recordLessonCompletion('fundamentals', 'osi-model', 'classic');
p = getTopicProgress('fundamentals', 'osi-model');
console.log('F. revisit / full lesson completion...');
assert.strictEqual(p.status, TOPIC_STATUS.LEARNED, 'full lesson completion reaches LEARNED');
recordLessonCompletion('fundamentals', 'osi-model', 'intuitive');
p = getTopicProgress('fundamentals', 'osi-model');
assert.strictEqual(p.status, TOPIC_STATUS.LEARNED, 'revisiting an already learned lesson stays LEARNED');
assert.strictEqual(p.theoryCompletion, 100, 'revisit keeps 100 % theory');

// G. direct question score does NOT make a topic LEARNED without theory completion
resetFresh();
recordQuestionAnswer('fundamentals', 'osi-model', 'q-1', 'theory', true);
p = getTopicProgress('fundamentals', 'osi-model');
console.log('G. question score without theory completion...');
assert.notStrictEqual(p.status, TOPIC_STATUS.LEARNED, 'quiz points alone must not promote to LEARNED');
assert(p.theoryCompletion < 100, 'theoryCompletion stays below 100 when only questions were answered');

console.log('=== Academy Topic Status Contract Test passed ===');
