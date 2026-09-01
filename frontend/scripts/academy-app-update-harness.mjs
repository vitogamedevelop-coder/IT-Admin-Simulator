import assert from 'node:assert/strict';
import { APP_VERSION } from '../src/lib/version.js';

// A full simulated old 1.77.3 app state: save, cache, version marker.
const localStore = new Map();
const sessionStore = new Map();
const cacheStore = new Map();
let reloaded = false;

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
  location: { reload: () => { reloaded = true; } },
};
globalThis.caches = {
  open: async (name) => { if (!cacheStore.has(name)) cacheStore.set(name, new Map()); return cacheStore.get(name); },
  keys: async () => Array.from(cacheStore.keys()),
  delete: async (name) => { const had = cacheStore.has(name); cacheStore.delete(name); return had; },
};
globalThis.window.caches = globalThis.caches;
globalThis.window.navigator = { serviceWorker: null };
Object.defineProperty(globalThis, 'navigator', { value: globalThis.window.navigator, configurable: true });
globalThis.Event = class { constructor(t) { this.type = t; } };

const { handleAppUpgrade } = await import('../src/lib/appUpgrade.js');
const { readAcademyProgress } = await import('../src/lib/academyProgress.js');
const { topicKey } = await import('../src/lib/academyTopics.js');

console.log('=== Academy App Update Harness ===');

const topKey = topicKey('fundamentals', 'topologien');
localStore.set('cyberlearn:app-version', '1.77.3');
localStore.set('cyberlearn:academy-progress-v1', JSON.stringify({
  stateVersion: 10,
  playerProfile: { preferredExplanationStyle: null },
  topics: {
    [topKey]: {
      status: 'started',
      theoryScore: 30,
      practiceScore: 10,
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

// Old app-owned cache plus other browser cache.
cacheStore.set('cyberlearn-v1.77.3', new Map([['index.html', { body: 'old index' }]]));
cacheStore.set('browser-other-cache', new Map());

console.log(`A. Simulated update from 1.77.3 to ${APP_VERSION} ...`);
const reloading = await handleAppUpgrade();

console.log('B. Verify cache invalidation ...');
assert(reloading, 'harness must trigger a reload');
assert(reloaded, 'window.location.reload must be called exactly once');
assert(!cacheStore.has('cyberlearn-v1.77.3'), 'old cyberlearn cache must be dropped');
assert(cacheStore.has('browser-other-cache'), 'non-app cache must survive');
assert.strictEqual(localStore.get('cyberlearn:app-version'), APP_VERSION, 'version marker must be current');

console.log('C. Verify save preservation & normalization ...');
const after = readAcademyProgress().topics[topKey];
assert(after, 'topic progress must still exist after upgrade');
assert.strictEqual(after.theoryCompletion, 0, 'theoryCompletion must not be invented from theoryScore');
assert.strictEqual(after.status, 'started', 'status must remain started because theory is incomplete');
assert.strictEqual(after.practiceScore, 10, 'practiceScore must be preserved');
assert.strictEqual(after.theoryScore, 30, 'theoryScore must be preserved');

console.log('D. Verify idempotent second start ...');
sessionStore.clear();
reloaded = false;
const second = await handleAppUpgrade();
assert(!second, 'second startup must not request reload');
assert(!reloaded, 'second startup must not call location.reload');

console.log('=== Academy App Update Harness passed ===');
