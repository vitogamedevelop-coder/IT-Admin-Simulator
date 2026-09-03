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

const { readAcademyProgress, updateTopicProgress } = await import('../src/lib/academyProgress.js');
const { topicKey } = await import('../src/lib/academyTopics.js');
const { recordSectionCompletion, recordLessonCompletion, topicTheoryCompletion } = await import('../src/lib/academyEngine.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');

const DHCP_KEY = topicKey('cisco-packet-tracer', 'dhcp');
const lesson = LESSONS[DHCP_KEY];
const sectionIds = [];
const seen = new Set();
(lesson?.explanations || []).forEach((ex) => {
  const dash = (ex.id || '').lastIndexOf('-');
  const sid = ex.sectionId || (dash > 0 ? ex.id.slice(0, dash) : ex.id);
  if (sid && !seen.has(sid)) {
    seen.add(sid);
    sectionIds.push(sid);
  }
});
const totalSections = sectionIds.length;

function reset() {
  store.clear();
  store.set('cyberlearn:academy-progress-v1', JSON.stringify({ stateVersion: 10, playerProfile: {}, topics: {} }));
}

console.log('=== Cisco DHCP Relay Theory Completion Test ===');
console.log(`DHCP Relay has ${lesson?.explanations?.length ?? 0} explanation styles and ${totalSections} theory sections.`);

// Partial: 1 section -> ~8 %, 6 sections -> ~46 %
reset();
updateTopicProgress('cisco-packet-tracer', 'dhcp', { status: 'available' });
recordSectionCompletion('cisco-packet-tracer', 'dhcp', sectionIds[0], '', totalSections);
let p = readAcademyProgress().topics[DHCP_KEY];
console.log(`A. After 1 section: completed=${p.completedSectionIds.length}, theory=${p.theoryCompletion}%, display=${topicTheoryCompletion(p)}%`);
assert.strictEqual(p.completedSectionIds.length, 1, 'After 1 section, exactly one section recorded');
assert.strictEqual(p.theoryCompletion, Math.round((1 / totalSections) * 100), `After 1 section, theory must be ${Math.round((1 / totalSections) * 100)}`);

reset();
updateTopicProgress('cisco-packet-tracer', 'dhcp', { status: 'available' });
sectionIds.slice(0, 6).forEach((sid) => recordSectionCompletion('cisco-packet-tracer', 'dhcp', sid, '', totalSections));
p = readAcademyProgress().topics[DHCP_KEY];
console.log(`B. After 6 sections: completed=${p.completedSectionIds.length}, theory=${p.theoryCompletion}%, display=${topicTheoryCompletion(p)}%`);
assert.strictEqual(p.completedSectionIds.length, 6, 'After 6 sections, exactly six recorded');
assert.strictEqual(p.theoryCompletion, Math.round((6 / totalSections) * 100), `After 6 sections, theory must be ${Math.round((6 / totalSections) * 100)}`);

// Resume test
reset();
updateTopicProgress('cisco-packet-tracer', 'dhcp', { status: 'available' });
sectionIds.slice(0, 5).forEach((sid) => recordSectionCompletion('cisco-packet-tracer', 'dhcp', sid, '', totalSections));
let afterFirst = readAcademyProgress().topics[DHCP_KEY];
const second = readAcademyProgress().topics[DHCP_KEY];
sectionIds.slice(5).forEach((sid) => recordSectionCompletion('cisco-packet-tracer', 'dhcp', sid, '', totalSections));
recordLessonCompletion('cisco-packet-tracer', 'dhcp', 'classic');
p = readAcademyProgress().topics[DHCP_KEY];
console.log(`C. Resume from 5/5 to full: completed=${p.completedSectionIds.length}, theory=${p.theoryCompletion}%, display=${topicTheoryCompletion(p)}%`);
assert.deepStrictEqual(afterFirst.completedSectionIds, second.completedSectionIds, 'Re-reading localStorage preserves the same section list');
assert.strictEqual(p.completedSectionIds.length, totalSections, 'All sections recorded after full run');
assert.strictEqual(p.theoryCompletion, 100, 'Theory completion must be 100 after full run');
assert.strictEqual(topicTheoryCompletion(p), 100, 'Displayed theory must be 100 after full run');

// Revisit: already 100 %, opening again does not drop
recordSectionCompletion('cisco-packet-tracer', 'dhcp', sectionIds[0], '', totalSections);
p = readAcademyProgress().topics[DHCP_KEY];
console.log(`D. Revisit after 100 %: completed=${p.completedSectionIds.length}, theory=${p.theoryCompletion}%, display=${topicTheoryCompletion(p)}%`);
assert.strictEqual(p.theoryCompletion, 100, 'Revisit must not drop theory below 100');
assert.strictEqual(topicTheoryCompletion(p), 100, 'Revisit display must stay 100');

console.log('=== Cisco DHCP Relay Theory Completion Test passed ===');








