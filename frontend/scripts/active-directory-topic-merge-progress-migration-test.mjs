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

const cat = 'active-directory-virtualbox';
const ad = (id) => topicKey(cat, id);
const KEY = 'cyberlearn:academy-progress-v1';

function entry(overrides = {}) {
  return {
    status: 'available',
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
    ...overrides,
  };
}

function load(save) {
  store.clear();
  store.set(KEY, JSON.stringify(save));
  return readAcademyProgress();
}

function check(cond, msg) {
  if (!cond) {
    console.log(`[FAIL] ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`[PASS] ${msg}`);
  }
}

console.log('=== Active Directory Topic Merge Progress Migration Test ===');

// A. No progress
let migrated = load({ stateVersion: 10, playerProfile: {}, topics: {} });
check(!!migrated.topics[ad('ad-foundation')], 'A: new ad-foundation topic exists');
check(migrated.topics[ad('ad-foundation')].theoryCompletion === 0, 'A: ad-foundation theory 0');

// B. Old domain fully completed -> merges into ad-foundation as full
migrated = load({
  stateVersion: 10,
  playerProfile: {},
  topics: {
    [ad('domain')]: entry({ contentSeenPercent: 100, completedSectionIds: ['domain-1', 'domain-2', 'domain-3'] }),
  },
});
check(migrated.topics[ad('ad-foundation')].theoryCompletion === 100, 'B: ad-foundation inherits domain as full');

// C. Two merged topics finished
migrated = load({
  stateVersion: 10,
  playerProfile: {},
  topics: {
    [ad('ad-permissions')]: entry({ contentSeenPercent: 100 }),
    [ad('ad-group-practice')]: entry({ contentSeenPercent: 100 }),
  },
});
check(migrated.topics[ad('ad-groups')].theoryCompletion === 100, 'C: ad-groups fully completed from both sources');

// D. Partial progress
migrated = load({
  stateVersion: 10,
  playerProfile: {},
  topics: {
    [ad('ad-mmc-basics')]: entry({ contentSeenPercent: 50 }),
  },
});
check(migrated.topics[ad('ad-administration')].theoryCompletion >= 25, 'D: partial theory preserved as non-zero');

// E. Practice scores combine
migrated = load({
  stateVersion: 10,
  playerProfile: {},
  topics: {
    [ad('ad-replication-site-config')]: entry({ practiceScore: 80, completedExerciseIds: ['e1', 'e2'] }),
    [ad('ad-recycle-bin')]: entry({ practiceScore: 60, completedExerciseIds: ['e3'] }),
  },
});
check(migrated.topics[ad('ad-replication-practice')].practiceScore === 80, 'E: max practice score preserved');

// F. Old save before v10 migrates domain-controller to ad-install
migrated = load({
  stateVersion: 8,
  playerProfile: {},
  topics: {
    [ad('domain-controller')]: entry({ contentSeenPercent: 100 }),
  },
});
check(migrated.topics[ad('ad-install')].theoryCompletion === 100, 'F: old domain-controller full -> ad-install full');

if (!process.exitCode) {
  console.log('\n=== Active Directory Topic Merge Progress Migration Test passed ===');
} else {
  console.log('\n=== Active Directory Topic Merge Progress Migration Test FAILED ===');
  process.exit(1);
}
