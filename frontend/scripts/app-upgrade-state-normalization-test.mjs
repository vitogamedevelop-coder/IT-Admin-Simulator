import assert from 'node:assert/strict';

const localStore = new Map();
const sessionStore = new Map();
const cacheStore = new Map();

function makeStorage(store) {
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (i) => Array.from(store.keys())[i] ?? null,
  };
}

globalThis.localStorage = makeStorage(localStore);
globalThis.sessionStorage = makeStorage(sessionStore);
globalThis.window = {
  dispatchEvent: () => {},
  location: { reload: () => {} },
  caches: {
    open: async (name) => { if (!cacheStore.has(name)) cacheStore.set(name, new Map()); return cacheStore.get(name); },
    keys: async () => Array.from(cacheStore.keys()),
    delete: async (name) => { const had = cacheStore.has(name); cacheStore.delete(name); return had; },
  },
  navigator: { serviceWorker: null },
};
globalThis.caches = globalThis.window.caches;
Object.defineProperty(globalThis, 'navigator', { value: globalThis.window.navigator, configurable: true });
globalThis.Event = class { constructor(t) { this.type = t; } };

const { handleAppUpgrade } = await import('../src/lib/appUpgrade.js');
const { readAcademyProgress } = await import('../src/lib/academyProgress.js');
const { topicTheoryCompletion } = await import('../src/lib/academyStatus.js');
const { topicKey } = await import('../src/lib/academyTopics.js');

console.log('=== App Upgrade State Normalization Test ===');

const osiKey = topicKey('fundamentals', 'osi-model');

localStore.set('cyberlearn:app-version', '1.77.3');
localStore.set('cyberlearn:academy-progress-v1', JSON.stringify({
  stateVersion: 10,
  playerProfile: {},
  topics: {
    [osiKey]: {
      status: 'started',
      theoryScore: 25,
      practiceScore: 0,
      theoryCompletion: 0,
      contentSeenPercent: 0,
      lessonCompletions: 0,
      completedSectionIds: [],
      completedQuestionIds: [],
      completedExerciseIds: [],
      availableLessons: [],
      availableExercises: [],
      unlockedTools: [],
      relatedMissions: [],
      relatedSideMissions: [],
      appliedCount: 0,
      repetitionCount: 0,
      retentionScore: 0,
      startedAt: null,
      lastCompletedSectionId: null,
      lastCompletedSectionTitle: null,
      lastExplanationStyle: null,
      quizAttempts: 0,
      quizPerfectCount: 0,
      quizPerfectStreak: 0,
      quizBestScore: 0,
      quizLastScore: 0,
      difficultyLevel: 0,
      difficultyExamsPassed: [],
      version: 1,
    },
  },
}));

console.log('A. Old save with theoryScore but no theory completion ...');
const reloading = await handleAppUpgrade();
assert(reloading, 'handleAppUpgrade should request a reload on version change');

const migrated = readAcademyProgress().topics[osiKey];

console.log('B. Progress after upgrade ...');
assert.strictEqual(migrated.theoryCompletion, 0, 'theoryCompletion must not be invented from theoryScore');
assert.strictEqual(topicTheoryCompletion(migrated), 0, 'displayed theory must not use theoryScore');
assert.strictEqual(migrated.status, 'started', 'status must not be promoted to learned without theory completion');
assert.strictEqual(localStore.get('cyberlearn:app-version'), '1.77.4', 'app version marker updated');

console.log('C. Second handleAppUpgrade must be a no-op ...');
sessionStore.clear();
const second = await handleAppUpgrade();
assert(!second, 'second call on same version must not request reload');

console.log('=== App Upgrade State Normalization Test passed ===');
