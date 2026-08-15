// Phase 1G, item 6/22: centralized objective relevance scoring.
//
// Verifies the priority ladder documented in objectives.js
// (RELEVANCE_TIER): active mission > unread mission mail/call > available
// progression mission > available side mission > adaptive repetition >
// locked future main > future info - and that the top objective always has
// a concrete, actionable label (never a bare "Verfügbar").
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

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

const { MISSION_001_ID, startMainMission } = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
const { SIDE_MISSION_001_ID, SIDE_MISSION_002_ID } = await import(pathToFileURL(join(srcDir, 'lib/ciscoSideMissions.js')).href);
const { completeQuest, readGameState, writeGameState, setActiveQuest } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
const { processWorldEvents, acknowledgePendingWorldDialog } = await import(pathToFileURL(join(srcDir, 'lib/worldDispatcher.js')).href);
const {
  getCurrentPlayerObjectives, getTopObjective, getObjectiveLabel, RELEVANCE_TIER,
} = await import(pathToFileURL(join(srcDir, 'lib/objectives.js')).href);

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('Active mission always wins');
{
  storage.clear();
  completeQuest({ id: MISSION_001_ID }, { xp: 10, reputation: {} });
  processWorldEvents();
  acknowledgePendingWorldDialog();
  // An unread side-001 mail now exists (high relevance), but starting the
  // mission and setting it active must still outrank it.
  startMainMission(MISSION_001_ID, 7);
  setActiveQuest(MISSION_001_ID);

  const objectives = getCurrentPlayerObjectives();
  const top = getTopObjective(objectives);
  test('active mission has the highest relevance tier', () => {
    assert.equal(objectives.relevance.active, RELEVANCE_TIER.ACTIVE_MISSION);
  });
  test('top objective is the active mission, not the unread mail', () => {
    assert.equal(top.key, 'active');
  });
  test('top objective label is concrete (the mission title, not "Verfügbar")', () => {
    const label = getObjectiveLabel(top);
    assert.notEqual(label, 'Verfügbar');
    assert.ok(label.length > 0);
  });
}

console.log('\nUnread mission mail outranks a merely-available side mission');
{
  storage.clear();
  completeQuest({ id: MISSION_001_ID }, { xp: 10, reputation: {} });
  processWorldEvents(); // delivers the post-main-001 Sam dialog + side-001 mail
  acknowledgePendingWorldDialog();

  const objectives = getCurrentPlayerObjectives();
  const top = getTopObjective(objectives);
  test('an unread, mission-linked mail exists', () => {
    assert.ok(objectives.communication, 'communication objective should be populated');
    assert.equal(objectives.communication.missionId, SIDE_MISSION_001_ID);
  });
  test('unread communication outranks a generic available side mission', () => {
    assert.ok(RELEVANCE_TIER.UNREAD_MISSION_COMMUNICATION > RELEVANCE_TIER.AVAILABLE_SIDE_MISSION);
  });
  test('top objective is the unread communication', () => {
    assert.equal(top.key, 'communication');
  });
  test('label mentions reading/listening, not "Verfügbar"', () => {
    const label = getObjectiveLabel(top);
    assert.notEqual(label, 'Verfügbar');
    assert.ok(/[Mm]ail|abhören/.test(label));
  });
}

console.log('\nAlready-completed mission mail no longer counts as an urgent nudge');
{
  storage.clear();
  completeQuest({ id: MISSION_001_ID }, { xp: 10, reputation: {} });
  processWorldEvents();
  acknowledgePendingWorldDialog();
  // Mark side-001 completed WITHOUT ever reading the mail (edge case: the
  // player resolved it some other way, e.g. a future shortcut/cheat).
  const state = readGameState();
  state.completedCiscoSideMissions = [SIDE_MISSION_001_ID];
  writeGameState(state);

  const objectives = getCurrentPlayerObjectives();
  test('communication objective is null once the linked mission is completed', () => {
    assert.equal(objectives.communication, null);
  });
}

console.log('\nSide mission progress-relevance vs. a locked main gate');
{
  storage.clear();
  completeQuest({ id: MISSION_001_ID }, { xp: 10, reputation: {} });
  processWorldEvents();
  acknowledgePendingWorldDialog();

  const objectives = getCurrentPlayerObjectives();
  test('locked main gate has low relevance', () => {
    assert.ok(objectives.relevance.main <= RELEVANCE_TIER.LOCKED_FUTURE_MAIN_READY);
  });
  test('side missions required for progression outrank the locked gate', () => {
    assert.ok(objectives.relevance.side > objectives.relevance.main);
  });
}

console.log('\nphone call delivery counts as unread communication too');
{
  storage.clear();
  completeQuest({ id: MISSION_001_ID }, { xp: 10, reputation: {} });
  processWorldEvents();
  acknowledgePendingWorldDialog();
  const state = readGameState();
  state.completedCiscoSideMissions = [SIDE_MISSION_001_ID];
  writeGameState(state);
  processWorldEvents(); // delivers Mara's phone call for side-002

  const objectives = getCurrentPlayerObjectives();
  test('an unacknowledged phone call becomes the communication objective', () => {
    assert.ok(objectives.communication, 'communication objective should exist');
    assert.equal(objectives.communication.channel, 'phone');
    assert.equal(objectives.communication.missionId, SIDE_MISSION_002_ID);
  });
  test('phone communication label is concrete', () => {
    const top = getTopObjective(objectives);
    const label = getObjectiveLabel(top);
    assert.ok(/abhören/.test(label));
  });
}

console.log(`\n${passed} tests passed`);
