// Persistence / Update-Safety Audit
//
// Simulates legacy localStorage shapes for the major state domains and
// verifies:
//   - no uncaught exceptions while reading/migrating/using them
//   - migrations are idempotent (running twice never changes the result again)
//   - no unintended full resets / progress loss for valid legacy data
//   - old renamed/removed IDs are remapped or dropped, never duplicated
//
// Read-only with respect to the real app: this script only exercises the
// existing migration functions against synthetic legacy payloads. It does
// NOT touch any real save data.
//
// Run with: npx tsx scripts/persistence-migration-audit.mjs

class Storage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}
const storage = new Storage();
global.localStorage = storage;
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const results = [];
function assert(condition, message) {
  results.push({ ok: !!condition, message });
  if (!condition) console.error(`  FAIL - ${message}`);
}

// ============================================================================
// A) gameState.js - main RPG/story state
// ============================================================================
console.log('A) gameState.js legacy shapes');
{
  const { readGameState, writeGameState } = await import('../src/lib/gameState.js');

  const legacyShapes = [
    { label: 'no save at all', raw: null },
    { label: 'stateVersion 1 (pre-Phase0)', raw: { completedQuests: ['cisco-main-001'], careerXp: 40 } },
    {
      // Note: any save with stateVersion < 5 goes through the deliberate
      // "Phase 0 reset" branch (`< 5`), which wipes completedQuests/inbox/etc.
      // on purpose - so the gate-id remap (a later `< 8` branch) is only
      // meaningfully exercised on saves that are already >= 5.
      label: 'stateVersion 6 with old gate id',
      raw: {
        stateVersion: 6, playerName: 'Alex', careerXp: 120,
        completedQuests: ['cisco-main-001', 'cisco-main-002-gate'],
        activeQuest: null, reputation: { helpdesk: 60 },
      },
    },
    {
      label: 'stateVersion 9 with old mission-003 (pre-renumber)',
      raw: {
        stateVersion: 9, careerXp: 300,
        completedQuests: ['cisco-main-001', 'cisco-main-002', 'cisco-main-003'],
        activeQuest: { id: 'cisco-main-003', seed: 42 },
        sideMissionHistory: {}, deliveredMissionInstances: [],
      },
    },
    {
      label: 'corrupted JSON (unparseable)',
      raw: undefined, corrupt: '{not-json',
    },
    {
      // Regression test for a real bug found by this audit: the `< 10`
      // migration block used to rebuild `completedQuests` from the RAW
      // `saved.completedQuests` instead of the already-migrated value,
      // silently undoing the `< 8` gate-id remap for any pre-v10 save.
      label: 'stateVersion 6 with both legacy gate-id AND pre-renumber id',
      raw: {
        stateVersion: 6, careerXp: 50,
        completedQuests: ['cisco-main-001', 'cisco-main-002-gate', 'cisco-main-003'],
        activeQuest: null,
      },
    },
  ];

  for (const shape of legacyShapes) {
    storage.clear();
    if (shape.corrupt) {
      storage.setItem('it-learn:rpg-state-v1', shape.corrupt);
    } else if (shape.raw !== null) {
      storage.setItem('it-learn:rpg-state-v1', JSON.stringify(shape.raw));
    }

    let migrated;
    try {
      migrated = readGameState();
    } catch (err) {
      assert(false, `${shape.label}: readGameState() must not throw (${err.message})`);
      continue;
    }
    assert(migrated && typeof migrated === 'object', `${shape.label}: produces a usable state object`);
    assert(Array.isArray(migrated.completedQuests), `${shape.label}: completedQuests is an array`);
    if (shape.label === 'stateVersion 6 with old gate id') {
      assert(!migrated.completedQuests.includes('cisco-main-002-gate'), `${shape.label}: legacy gate id remapped`);
      assert(migrated.completedQuests.includes('cisco-main-002'), `${shape.label}: legacy gate id remapped to real mission id`);
    }
    if (shape.label === 'stateVersion 9 with old mission-003 (pre-renumber)') {
      assert(!migrated.completedQuests.includes('cisco-main-003'), `${shape.label}: old mission-003 id no longer present`);
      assert(migrated.completedQuests.includes('cisco-main-004'), `${shape.label}: renumbered id present after migration`);
      assert(migrated.activeQuest?.id === 'cisco-main-004', `${shape.label}: active quest id remapped`);
    }
    if (shape.label === 'stateVersion 6 with both legacy gate-id AND pre-renumber id') {
      assert(!migrated.completedQuests.includes('cisco-main-002-gate'), `${shape.label}: gate-id remap survives the later v10 step`);
      assert(migrated.completedQuests.includes('cisco-main-002'), `${shape.label}: gate-id correctly remapped`);
      assert(!migrated.completedQuests.includes('cisco-main-003'), `${shape.label}: pre-renumber id no longer present`);
      assert(migrated.completedQuests.includes('cisco-main-004'), `${shape.label}: pre-renumber id correctly remapped`);
    }

    // Idempotency: writing the migrated state back and reading again must be
    // a no-op (no further changes, no duplicate remaps).
    writeGameState(migrated);
    let reloaded;
    try {
      reloaded = readGameState();
    } catch (err) {
      assert(false, `${shape.label}: reload after migration must not throw (${err.message})`);
      continue;
    }
    assert(JSON.stringify(reloaded) === JSON.stringify(migrated), `${shape.label}: migration is idempotent (second read is identical)`);
  }
}

// ============================================================================
// B) academyProgress.js - topic keys, legacy merges, score normalization
// ============================================================================
console.log('B) academyProgress.js legacy shapes');
{
  const { readAcademyProgress, writeAcademyProgress } = await import('../src/lib/academyProgress.js');

  const legacyShapes = [
    { label: 'no save', raw: null },
    {
      label: 'pre-merge tcp/udp topics with fractional scores',
      raw: {
        stateVersion: 3,
        topics: {
          'fundamentals/tcp': { status: 'learned', theoryScore: 0.8, practiceScore: 0.6, completedSectionIds: ['intro'] },
          'fundamentals/udp': { status: 'started', theoryScore: 0.4, practiceScore: 0.2, completedSectionIds: ['basics'] },
        },
      },
    },
    {
      label: 'removed topic (packet-tracer-ui) with progress',
      raw: { stateVersion: 6, topics: { 'cisco-packet-tracer/packet-tracer-ui': { status: 'learned', theoryScore: 100 } } },
    },
    { label: 'corrupted JSON', raw: undefined, corrupt: '{bad' },
  ];

  for (const shape of legacyShapes) {
    storage.clear();
    if (shape.corrupt) {
      storage.setItem('cyberlearn:academy-progress-v1', shape.corrupt);
    } else if (shape.raw !== null) {
      storage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(shape.raw));
    }

    let migrated;
    try {
      migrated = readAcademyProgress();
    } catch (err) {
      assert(false, `${shape.label}: readAcademyProgress() must not throw (${err.message})`);
      continue;
    }
    assert(migrated && typeof migrated.topics === 'object', `${shape.label}: produces a topics map`);

    if (shape.label.startsWith('pre-merge')) {
      const merged = migrated.topics['fundamentals/tcp-udp'];
      assert(merged, `${shape.label}: merged topic exists`);
      assert(merged?.theoryScore === 80, `${shape.label}: theory score merged as max of both legacy topics (got ${merged?.theoryScore})`);
      assert(merged?.completedSectionIds?.includes('intro') && merged?.completedSectionIds?.includes('basics'), `${shape.label}: completed sections unioned`);
    }
    if (shape.label.startsWith('removed topic')) {
      assert(!migrated.topics['cisco-packet-tracer/packet-tracer-ui'], `${shape.label}: removed topic dropped, not crashing`);
    }

    writeAcademyProgress(migrated);
    let reloaded;
    try {
      reloaded = readAcademyProgress();
    } catch (err) {
      assert(false, `${shape.label}: reload must not throw (${err.message})`);
      continue;
    }
    assert(JSON.stringify(reloaded) === JSON.stringify(migrated), `${shape.label}: migration is idempotent`);
  }
}

// ============================================================================
// C) missionGenerator.js - procedural mission instances (device + params drift)
// ============================================================================
console.log('C) missionGenerator.js legacy mission instances');
{
  const { readInstances, getInstance } = await import('../src/lib/missionGenerator.js');
  const { TEMPLATE_REGISTRY, MISSION_ARCHETYPE, seededRng } = await import('../src/lib/missionTemplateEngine.js');
  const template = TEMPLATE_REGISTRY['cisco-basic-config-hardening'];
  const INSTANCES_KEY = 'cyberlearn:procedural-instances-v1';

  storage.clear();
  const seed = 777;
  const rng = seededRng(seed);
  const freshParams = template.resolveParameters(rng, MISSION_ARCHETYPE.BUILD, template.contexts[0], 'medium');
  const { device: freshDevice } = template.buildDevice(freshParams, MISSION_ARCHETYPE.BUILD);

  // Simulate a mission instance saved BEFORE some resolvedParameters/device
  // fields existed: strip a resolved param and a nested device field.
  const legacyParams = { ...freshParams };
  delete legacyParams.execTimeoutSeconds;
  const legacyDevice = JSON.parse(JSON.stringify(freshDevice));
  delete legacyDevice.runningConfig.lines.console.loginLocal;
  // Simulate the legacy "ticket" channel, migrated to email long ago.
  const instanceId = 'legacy-bc-777';
  const instance = {
    instanceId, templateId: template.id, seed, generatedAt: Date.now() - 1000000,
    channel: 'email', skillIds: [], difficulty: 'medium', archetype: MISSION_ARCHETYPE.BUILD, context: template.contexts[0],
    resolvedParameters: legacyParams, device: legacyDevice, title: 'old title', briefing: 'old briefing', status: 'active',
    readState: { read: true, readAt: 1 }, acceptedState: { accepted: true, acceptedAt: 1 },
    completedState: { completed: false, completedAt: null }, attempts: 3, hintsUsed: [],
    solutionRevealedFor: [], showCommandsUsed: [],
  };
  storage.setItem(INSTANCES_KEY, JSON.stringify({ [instanceId]: instance }));

  let loaded;
  try {
    loaded = getInstance(instanceId);
  } catch (err) {
    assert(false, `legacy mission instance: getInstance() must not throw (${err.message})`);
  }
  if (loaded) {
    assert(loaded.resolvedParameters.execTimeoutSeconds !== undefined, 'legacy mission instance: missing resolvedParameter restored');
    assert(loaded.device.runningConfig.lines.console.loginLocal === false || loaded.device.runningConfig.lines.console.loginLocal === true, 'legacy mission instance: missing nested device field restored with a default');
    // The real, already-progressed leaf values must survive normalization untouched.
    assert(loaded.attempts === 3, 'legacy mission instance: unrelated progress fields untouched');
    assert(loaded.status === 'active', 'legacy mission instance: status untouched');
  }

  // Idempotency: reading twice must not keep mutating the stored instance.
  const firstRead = JSON.stringify(readInstances());
  readInstances();
  const secondRead = JSON.stringify(readInstances());
  assert(firstRead === secondRead, 'legacy mission instance: repeated reads are idempotent');

  // Deleted/unknown template must not crash, just pass the instance through.
  storage.clear();
  const orphanId = 'orphan-1';
  storage.setItem(INSTANCES_KEY, JSON.stringify({
    [orphanId]: {
      instanceId: orphanId, templateId: 'template-that-no-longer-exists', seed: 1, status: 'available',
      resolvedParameters: {}, device: {}, title: 't', briefing: 'b',
    },
  }));
  try {
    const orphan = getInstance(orphanId);
    assert(orphan !== undefined, 'orphaned template id: getInstance() does not crash');
  } catch (err) {
    assert(false, `orphaned template id: getInstance() must not throw (${err.message})`);
  }
}

// ============================================================================
// D) skillTree.js - pre-dimension flat records
// ============================================================================
console.log('D) skillTree.js legacy flat records');
{
  const { readSkillTree, getSubskill } = await import('../src/lib/skillTree.js');
  const SKILL_TREE_KEY = 'cyberlearn:skill-tree-v2';

  storage.clear();
  storage.setItem(SKILL_TREE_KEY, JSON.stringify({
    'cisco.basic_configuration.hostname': { state: 'secure', exposureCount: 5, correctCount: 5, mastery: 0.9 },
  }));
  let tree;
  try {
    tree = readSkillTree();
  } catch (err) {
    assert(false, `legacy flat skill record: readSkillTree() must not throw (${err.message})`);
  }
  assert(tree && typeof tree === 'object', 'legacy flat skill record: produces usable tree');

  let subskill;
  try {
    subskill = getSubskill('cisco', 'basic_configuration', 'hostname');
  } catch (err) {
    assert(false, `legacy flat skill record: getSubskill() must not throw (${err.message})`);
  }
  assert(subskill && typeof subskill.dimensions === 'object', 'legacy flat skill record: dimensions object present after migration');
  assert(subskill && typeof subskill.mastery === 'number', 'legacy flat skill record: mastery present');

  // A brand-new, never-seen subskill on an otherwise-migrated tree must not throw either.
  let neverSeen;
  try {
    neverSeen = getSubskill('cisco', 'basic_configuration', 'a_subskill_added_much_later');
  } catch (err) {
    assert(false, `newly-added subskill on legacy tree: must not throw (${err.message})`);
  }
  assert(neverSeen && neverSeen.state === 'unseen', 'newly-added subskill on legacy tree: defaults correctly');
}

// ============================================================================
// E) Cross-domain: App-Version bump alone must never touch save data
// ============================================================================
console.log('E) App-version bump does not affect save data');
{
  const { readGameState, writeGameState } = await import('../src/lib/gameState.js');
  storage.clear();
  const before = readGameState();
  before.careerXp = 999;
  before.completedQuests = ['cisco-main-001'];
  writeGameState(before);
  const savedRaw = storage.getItem('it-learn:rpg-state-v1');

  // Simulate an app version bump: nothing in the persistence layer reads
  // APP_VERSION, so re-reading the exact same save must be a pure no-op.
  const after = readGameState();
  assert(after.careerXp === 999, 'version bump: careerXp preserved');
  assert(after.completedQuests.includes('cisco-main-001'), 'version bump: completed quests preserved');
  assert(storage.getItem('it-learn:rpg-state-v1') === savedRaw || JSON.stringify(after) === JSON.parse(savedRaw) && true, 'version bump: reading does not silently rewrite unrelated data');
}

console.log('\n=== Persistence / Migration Audit: Summary ===');
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log(`Total assertions: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (failed > 0) {
  console.log('\nFailed assertions:');
  results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.message}`));
  process.exitCode = 1;
} else {
  console.log('All checks passed.');
}
