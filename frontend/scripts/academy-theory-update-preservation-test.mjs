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

function buildLegacySave(overrides) {
  const topics = {};
  for (const [key, patch] of Object.entries(overrides)) {
    topics[key] = {
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
  return { stateVersion: 10, playerProfile: { preferredExplanationStyle: null }, topics };
}

console.log('=== Academy Theory Update Preservation Test ===');

// A. Full theory preservation with stale section IDs
store.clear();
const grundKey = topicKey('fundamentals', 'grundbegriffe');
const topKey = topicKey('fundamentals', 'topologien');
const sshKey = topicKey('cisco-packet-tracer', 'ssh');

const oldSave = buildLegacySave({
  [grundKey]: { status: 'learned', theoryScore: 52, practiceScore: 33, theoryCompletion: 100, contentSeenPercent: 100, lessonCompletions: 1, completedSectionIds: ['legacy-grund-1', 'legacy-grund-2'] },
  [topKey]: { status: 'learned', theoryScore: 40, practiceScore: 22, theoryCompletion: 100, contentSeenPercent: 100, lessonCompletions: 1, completedSectionIds: ['legacy-top-1'] },
  [sshKey]: { status: 'learned', theoryScore: 28, practiceScore: 14, theoryCompletion: 100, contentSeenPercent: 100, lessonCompletions: 1, completedSectionIds: ['legacy-ssh-1', 'legacy-ssh-2', 'legacy-ssh-3'] },
});
store.set('cyberlearn:academy-progress-v1', JSON.stringify(oldSave));

const migrated = readAcademyProgress();

console.log('A. Full theory preservation...');
const grund = migrated.topics[grundKey];
assert.strictEqual(grund.status, 'learned', 'learned status must survive update');
assert.strictEqual(grund.theoryCompletion, 100, 'full theory completion must be preserved');
assert.strictEqual(grund.contentSeenPercent, 100, 'full content seen must be preserved');
assert.strictEqual(grund.practiceScore, 33, 'practiceScore must be preserved');
assert.strictEqual(grund.theoryScore, 52, 'theoryScore must be preserved');

const top = migrated.topics[topKey];
assert.strictEqual(top.theoryCompletion, 100, 'topologien theory completion must be preserved');
assert.strictEqual(top.contentSeenPercent, 100, 'topologien content seen must be preserved');

const ssh = migrated.topics[sshKey];
assert.strictEqual(ssh.theoryCompletion, 100, 'cisco ssh theory completion must be preserved');
assert.strictEqual(ssh.contentSeenPercent, 100, 'cisco ssh content seen must be preserved');

// B. Partial theory preservation
store.clear();
const partialKey = topicKey('fundamentals', 'ipv4');
const partialSave = buildLegacySave({
  [partialKey]: { status: 'started', theoryScore: 18, practiceScore: 10, theoryCompletion: 60, contentSeenPercent: 60, completedSectionIds: ['legacy-ipv4-1'] },
});
store.set('cyberlearn:academy-progress-v1', JSON.stringify(partialSave));

const partialMigrated = readAcademyProgress();
const ipv4 = partialMigrated.topics[partialKey];
console.log('B. Partial theory preservation...');
assert(ipv4.theoryCompletion >= 60, `partial theory completion must not drop below 60, got ${ipv4.theoryCompletion}`);
assert(ipv4.contentSeenPercent >= 60, `partial content seen must not drop below 60, got ${ipv4.contentSeenPercent}`);
assert.strictEqual(ipv4.theoryScore, 18, 'partial theoryScore preserved');
assert.strictEqual(ipv4.practiceScore, 10, 'partial practiceScore preserved');

// C. Buggy 1.76.0 save recovery (theoryCompletion was already overwritten to 0)
store.clear();
const recoveryKey = topicKey('fundamentals', 'dns');
const buggySave = buildLegacySave({
  [recoveryKey]: { status: 'learned', theoryScore: 33, practiceScore: 44, theoryCompletion: 0, contentSeenPercent: 0, lessonCompletions: 1, completedSectionIds: [] },
});
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buggySave));
const recovered = readAcademyProgress();
const dns = recovered.topics[recoveryKey];
console.log('C. Buggy 1.76.0 save recovery...');
assert.strictEqual(dns.theoryCompletion, 100, 'theoryCompletion recovers from lessonCompletions >= 1');
assert.strictEqual(dns.contentSeenPercent, 100, 'contentSeenPercent recovers from lessonCompletions >= 1');
assert.strictEqual(dns.practiceScore, 44, 'practiceScore preserved after recovery');

// D. Fresh install
store.clear();
const fresh = readAcademyProgress();
console.log('C. Fresh install...');
const freshGrund = fresh.topics[grundKey];
assert.strictEqual(freshGrund.theoryCompletion, 0, 'fresh install theory completion is 0');
assert.strictEqual(freshGrund.contentSeenPercent, 0, 'fresh install content seen is 0');
assert.strictEqual(freshGrund.status, 'available', 'fresh grundbegriffe is available');

// D. Removed topic drops, new topic stays 0
store.clear();
const removedSave = buildLegacySave({
  ['fundamentals/dead-topic']: { status: 'learned', theoryCompletion: 100, contentSeenPercent: 100, completedSectionIds: ['x'] },
});
store.set('cyberlearn:academy-progress-v1', JSON.stringify(removedSave));
const removedMigrated = readAcademyProgress();
console.log('D. Removed topic dropped...');
assert(!removedMigrated.topics['fundamentals/dead-topic'], 'removed topic must be dropped');

// E. Repeated load is idempotent
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(oldSave));
const first = readAcademyProgress();
const second = readAcademyProgress();
console.log('E. Idempotency...');
assert.strictEqual(second.topics[grundKey].theoryCompletion, first.topics[grundKey].theoryCompletion, 'repeated load does not change theoryCompletion');
assert.strictEqual(second.topics[grundKey].contentSeenPercent, first.topics[grundKey].contentSeenPercent, 'repeated load does not change contentSeenPercent');

console.log('=== Academy Theory Update Preservation Test passed ===');





