

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

const { readAcademyProgress, updateTopicProgress } = await import('../src/lib/academyProgress.js');

const { recordSectionCompletion, recordLessonCompletion, topicTheoryCompletion } = await import('../src/lib/academyEngine.js');
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

store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify({ stateVersion: 10, playerProfile: {}, topics: {} }));

console.log('=== Academy Live Theory Completion Audit ===');
let pass = 0;
let fail = 0;
for (const [key, lesson] of Object.entries(LESSONS)) {
  const [categoryId, topicId] = key.split('/');
  if (!categoryId || !topicId) continue;

  const sectionIds = deriveSectionIds(lesson);
  if (sectionIds.length === 0) continue;

  updateTopicProgress(categoryId, topicId, { status: 'available' });
  sectionIds.forEach((sid) => recordSectionCompletion(categoryId, topicId, sid, '', sectionIds.length));
  recordLessonCompletion(categoryId, topicId, 'classic');

  const p = readAcademyProgress().topics[key];
  const ok = p.theoryCompletion === 100 && p.completedSectionIds.length === sectionIds.length;
  if (ok) {
    pass += 1;
    console.log(`[PASS] ${key}: sections=${sectionIds.length}, completed=${p.completedSectionIds.length}, theory=${p.theoryCompletion}%`);
  } else {
    fail += 1;
    console.log(`[FAIL] ${key}: sections=${sectionIds.length}, completed=${p.completedSectionIds.length}, theory=${p.theoryCompletion}% (display=${topicTheoryCompletion(p)}%)`);
  }
}

console.log(`\nSummary: ${pass} passed, ${fail} failed out of ${pass + fail} lessons with theory sections.`);
if (fail > 0) process.exit(1);
console.log('=== Academy Live Theory Completion Audit passed ===');




