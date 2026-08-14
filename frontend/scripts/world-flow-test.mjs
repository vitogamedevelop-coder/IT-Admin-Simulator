// Phase 1E: World-flow integration test.
// Verifies that after Mission 001 the player receives an in-world follow-up
// (Sam dialog + mail), that the ObjectivePanel prioritises side missions over
// the locked main gate, and that side missions are delivered one after another.

import { fileURLToPath } from 'node:url';
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
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  speechSynthesis: null,
};

const { pathToFileURL } = await import('node:url');

const { MISSION_001_ID, MISSION_002_ID } = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
const { SIDE_MISSION_004_ID } = await import(pathToFileURL(join(srcDir, 'lib/ciscoSideMissions.js')).href);
const { completeQuest } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
const { processWorldEvents, acknowledgePendingWorldDialog, getPendingWorldDialog, WORLD_EVENT_IDS } = await import(pathToFileURL(join(srcDir, 'lib/worldDispatcher.js')).href);
const { readEmails } = await import(pathToFileURL(join(srcDir, 'lib/emails.js')).href);
const { readNotifications, notificationTypes } = await import(pathToFileURL(join(srcDir, 'lib/notificationSystem.js')).href);
const { getCurrentPlayerObjectives, getTopObjective } = await import(pathToFileURL(join(srcDir, 'lib/objectives.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('Fresh-state flow after Mission 001');
{
  storage.clear();

  // Onboarded state: Mission 001 completed.
  completeQuest({ id: MISSION_001_ID }, { xp: 60, reputation: { network: 5, management: 3 } });

  // After completing the quest, world events should dispatch.
  const result1 = processWorldEvents();
  test('post-main-001 Sam dialog is pending', () => {
    assert(result1.pendingDialog, 'pendingDialog should be set');
    assert(result1.pendingDialog.eventId === WORLD_EVENT_IDS.POST_MAIN_001_SAM, 'event should be post-main-001-sam');
  });

  test('side-001 mail is delivered', () => {
    const emails = readEmails();
    assert(emails.some((e) => e.linkedMissionId === 'cisco-side-basic-001'), 'email for side-001 should exist');
  });

  test('objective panel priorities side missions over locked main gate', () => {
    const objectives = getCurrentPlayerObjectives();
    const top = getTopObjective(objectives);
    assert(top, 'there should be a top objective');
    assert(top.key === 'side' || top.key === 'learning', `top should be side or learning, got ${top.key}`);
    assert(objectives.relevance.main < objectives.relevance.side, 'locked main should be less relevant than side');
  });

  // Acknowledge Sam dialog.
  acknowledgePendingWorldDialog();
  test('pending world dialog cleared after acknowledgement', () => {
    assert(!getPendingWorldDialog(), 'pending dialog should be null');
  });
}

console.log('\nAfter side-001 completion');
{
  // Simulate side-001 completed.
  const { readGameState, writeGameState } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
  const state = readGameState();
  state.completedCiscoSideMissions.push('cisco-side-basic-001');
  writeGameState(state);

  const result2 = processWorldEvents();
  test('side-002 phone notification is delivered', () => {
    const notifications = readNotifications();
    const phone = notifications.find((n) => n.linkedMissionId === 'cisco-side-basic-002' && n.type === notificationTypes.PHONE);
    assert(phone, 'phone notification for side-002 should exist');
  });

  test('no second Sam dialog is pending after side-001', () => {
    assert(!result2.pendingDialog, 'there should be no pending dialog after side-001');
  });
}

console.log('\nAfter side-002 completion');
{
  const { readGameState, writeGameState } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
  const state = readGameState();
  state.completedCiscoSideMissions.push('cisco-side-basic-002');
  writeGameState(state);

  const result3 = processWorldEvents();
  test('side-003 Sam dialog is pending after side-002', () => {
    assert(result3.pendingDialog, 'pendingDialog should be set for side-003');
    assert(result3.pendingDialog.linkedMissionId === 'cisco-side-basic-003', 'linked mission should be side-003');
  });
  // Acknowledge so the next event (main-002 preparation) can dispatch.
  acknowledgePendingWorldDialog();
}

console.log('\nAfter all three side missions');
{
  const { readGameState, writeGameState } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
  const state = readGameState();
  state.completedCiscoSideMissions.push('cisco-side-basic-003');
  writeGameState(state);

  const objectives = getCurrentPlayerObjectives();
  const top = getTopObjective(objectives);
  test('gate becomes the visible next step when side missions are done', () => {
    assert(top, 'top objective should exist');
    assert(top.key === 'main', `top should be main gate, got ${top.key}`);
  });
}

console.log('\nAfter all three basic side missions');
{
  // Game state already contains all three basic side missions from previous block.
  const result4 = processWorldEvents();
  test('post-side-003 Sam dialog is pending', () => {
    assert(result4.pendingDialog, 'pendingDialog should be set');
    assert(result4.pendingDialog.eventId === WORLD_EVENT_IDS.POST_SIDE_003_SAM, 'event should be post-side-003-sam');
  });
  test('main-002 mail is delivered', () => {
    const emails = readEmails();
    assert(emails.some((e) => e.linkedMissionId === MISSION_002_ID), 'email for main-002 should exist');
  });

  acknowledgePendingWorldDialog();
}

console.log('\nAfter main-002 completion');
{
  const { readGameState, writeGameState } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
  const state = readGameState();
  state.completedQuests.push(MISSION_002_ID);
  writeGameState(state);

  const result5 = processWorldEvents();
  test('post-main-002 Sam dialog is pending', () => {
    assert(result5.pendingDialog, 'pendingDialog should be set');
    assert(result5.pendingDialog.eventId === WORLD_EVENT_IDS.POST_MAIN_002_SAM, 'event should be post-main-002-sam');
  });
  test('security side mail is delivered', () => {
    const emails = readEmails();
    assert(emails.some((e) => e.linkedMissionId === SIDE_MISSION_004_ID), 'email for side-004 should exist');
  });

  acknowledgePendingWorldDialog();
}

console.log(`\n${passed} tests passed`);
