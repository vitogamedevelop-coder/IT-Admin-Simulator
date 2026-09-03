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

const { readAcademyProgress, writeAcademyProgress, exportAcademySave, importAcademySave } = await import('../src/lib/academyProgress.js');

console.log('=== Academy Save Roundtrip Test ===');

store.clear();
const before = readAcademyProgress();
const key = Object.keys(before.topics)[0];
before.topics[key].theoryScore = 42;
before.topics[key].practiceScore = 33;
before.topics[key].completedSectionIds = ['fake-section']; // will be sanitized away
writeAcademyProgress(before);

const exported = exportAcademySave();
assert.strictEqual(exported.format, 'cyberlearn-save-v1', 'export has correct format');
assert(exported.appVersion, 'export has appVersion');
assert(exported.storage['cyberlearn:academy-progress-v1'], 'export contains academy progress');

store.clear();
importAcademySave(exported);
const after = readAcademyProgress();
const topicAfter = after.topics[key];
assert.strictEqual(topicAfter.theoryScore, 42, 'theoryScore survives roundtrip');
assert.strictEqual(topicAfter.practiceScore, 33, 'practiceScore survives roundtrip');
assert(!topicAfter.completedSectionIds.includes('fake-section'), 'sanitization runs again after import');

// Idempotency: importing twice must not corrupt
importAcademySave(exported);
const second = readAcademyProgress();
const secondTopic = second.topics[key];
assert.strictEqual(secondTopic.theoryScore, 42, 'theoryScore stable after second import');

console.log('=== Academy Save Roundtrip Test passed ===');




