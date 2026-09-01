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

const osiKey = topicKey('fundamentals', 'osi-model');
const dnsKey = topicKey('fundamentals', 'dns');
const topKey = topicKey('fundamentals', 'topologien');
const trunkKey = topicKey('cisco-packet-tracer', 'trunk');
const sshKey = topicKey('cisco-packet-tracer', 'ssh');
const commKey = topicKey('fundamentals', 'kommunikation-uebertragung');

const topSectionIds = LESSONS[topKey]?.explanations?.map((e) => e.id) || [];
const firstTopSection = topSectionIds[0];

console.log('=== Academy Theory Legacy Marker Recovery Test ===');

// A. OSI: completed via contentSeenPercent=100, no lessonCompletions marker
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [osiKey]: { status: 'learned', theoryScore: 22, practiceScore: 10, contentSeenPercent: 100, theoryCompletion: 0, lessonCompletions: 0, completedSectionIds: [] },
})));
let migrated = readAcademyProgress();
const osi = migrated.topics[osiKey];
console.log('A. OSI recovers from contentSeenPercent=100...');
assert.strictEqual(osi.theoryCompletion, 100, `OSI theoryCompletion must recover to 100, got ${osi.theoryCompletion}`);
assert.strictEqual(osi.contentSeenPercent, 100, `OSI contentSeenPercent must recover to 100, got ${osi.contentSeenPercent}`);

// B. DNS: already has theoryCompletion=100 but stale completedSectionIds
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [dnsKey]: { status: 'learned', theoryScore: 33, practiceScore: 44, theoryCompletion: 100, contentSeenPercent: 95, lessonCompletions: 0, completedSectionIds: ['legacy-dns-1'] },
})));
migrated = readAcademyProgress();
const dns = migrated.topics[dnsKey];
console.log('B. DNS keeps theoryCompletion=100...');
assert.strictEqual(dns.theoryCompletion, 100, `DNS theoryCompletion must stay 100, got ${dns.theoryCompletion}`);
assert(dns.contentSeenPercent >= 95, `DNS contentSeenPercent must not drop below 95, got ${dns.contentSeenPercent}`);

// C. Topologien: legacy full completion from completedSectionIds that still cover the current lesson
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [topKey]: { status: 'learned', theoryScore: 40, practiceScore: 20, lessonCompletions: 0, contentSeenPercent: 0, theoryCompletion: 0, completedSectionIds: topSectionIds },
})));
migrated = readAcademyProgress();
const topo = migrated.topics[topKey];
console.log('C. Topologien recovers from completedSectionIds...');
assert.strictEqual(topo.theoryCompletion, 100, `Topologien theoryCompletion must recover to 100, got ${topo.theoryCompletion}`);
assert.strictEqual(topo.contentSeenPercent, 100, `Topologien contentSeenPercent must recover to 100, got ${topo.contentSeenPercent}`);

// D. Cisco Trunk: lessonCompletions full marker
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [trunkKey]: { status: 'learned', theoryScore: 28, practiceScore: 14, theoryCompletion: 0, contentSeenPercent: 0, lessonCompletions: 1, completedSectionIds: [] },
})));
migrated = readAcademyProgress();
const trunk = migrated.topics[trunkKey];
console.log('D. Cisco Trunk recovers from lessonCompletions=1...');
assert.strictEqual(trunk.theoryCompletion, 100, `Trunk theoryCompletion must recover to 100, got ${trunk.theoryCompletion}`);
assert.strictEqual(trunk.contentSeenPercent, 100, `Trunk contentSeenPercent must recover to 100, got ${trunk.contentSeenPercent}`);

// E. Cisco SSH: learned via theoryScore with no full lesson completion
// The stored theoryCompletion/contentSeenPercent must not be invented as 100,
// but the displayed theory must fall back to theoryScore instead of showing 0.
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [sshKey]: { status: 'learned', theoryScore: 25, practiceScore: 18, theoryCompletion: 0, contentSeenPercent: 0, lessonCompletions: 0, completedSectionIds: [] },
})));
migrated = readAcademyProgress();
const ssh = migrated.topics[sshKey];
console.log('E. Cisco SSH partial learned falls back to theoryScore...');
assert.strictEqual(ssh.theoryCompletion, 0, `SSH stored theoryCompletion must remain 0, got ${ssh.theoryCompletion}`);
assert.strictEqual(ssh.contentSeenPercent, 0, `SSH stored contentSeenPercent must remain 0, got ${ssh.contentSeenPercent}`);
assert.strictEqual(topicTheoryCompletion(ssh), 25, `SSH displayed theory must fall back to theoryScore 25, got ${topicTheoryCompletion(ssh)}`);

// F. Partial theory preservation
store.clear();
store.set('cyberlearn:academy-progress-v1', JSON.stringify(buildLegacySave({
  [commKey]: { status: 'started', theoryScore: 12, theoryCompletion: 45, contentSeenPercent: 50, lessonCompletions: 0, completedSectionIds: firstTopSection ? [firstTopSection] : [] },
})));
migrated = readAcademyProgress();
const comm = migrated.topics[commKey];
console.log('F. Partial theory preservation...');
assert(comm.theoryCompletion >= 45, `Partial theoryCompletion must not drop below 45, got ${comm.theoryCompletion}`);
assert(comm.contentSeenPercent >= 45, `Partial contentSeenPercent must not drop, got ${comm.contentSeenPercent}`);

// G. Fresh install
store.clear();
migrated = readAcademyProgress();
console.log('G. Fresh install...');
assert.strictEqual(migrated.topics[osiKey].theoryCompletion, 0, 'fresh OSI theoryCompletion is 0');
assert.strictEqual(migrated.topics[osiKey].contentSeenPercent, 0, 'fresh OSI contentSeenPercent is 0');

// H. Idempotency
store.clear();
const legacy = buildLegacySave({
  [osiKey]: { status: 'learned', theoryScore: 22, practiceScore: 10, contentSeenPercent: 100, theoryCompletion: 0, lessonCompletions: 0, completedSectionIds: [] },
});
store.set('cyberlearn:academy-progress-v1', JSON.stringify(legacy));
const first = readAcademyProgress();
const second = readAcademyProgress();
console.log('H. Idempotency...');
assert.strictEqual(second.topics[osiKey].theoryCompletion, first.topics[osiKey].theoryCompletion, 'repeated load stable');
assert.strictEqual(second.topics[osiKey].contentSeenPercent, first.topics[osiKey].contentSeenPercent, 'repeated load stable');

console.log('=== Academy Theory Legacy Marker Recovery Test passed ===');
