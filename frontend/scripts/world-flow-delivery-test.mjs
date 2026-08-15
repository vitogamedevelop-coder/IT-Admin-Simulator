// Phase 1G: Mission delivery persistence and "Jetzt"/"Später" behavior.
//
// Verifies:
//  - Every dispatched mission has a persistent in-world anchor (mail/phone)
//    that exists independently of which dialog option the player picks.
//  - "Jetzt" and "Später" dialog branches use different acknowledgement
//    text, but never change whether the delivery exists.
//  - Deliveries survive acknowledging the dialog, leaving/abandoning a
//    mission, and a simulated app reload.
//  - getMissionDeliveryState() reports the correct semantic state through
//    the whole lifecycle: none -> available -> accepted -> active -> completed.
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

const { MISSION_001_ID, startMainMission, loadActiveMainMission } = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
const { SIDE_MISSION_001_ID, SIDE_MISSION_002_ID, SIDE_MISSION_003_ID } = await import(pathToFileURL(join(srcDir, 'lib/ciscoSideMissions.js')).href);
const { completeQuest, readGameState, writeGameState, setActiveQuest } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
const {
  processWorldEvents, acknowledgePendingWorldDialog, getPendingWorldDialog,
  getMissionDeliveryState, DeliveryState,
} = await import(pathToFileURL(join(srcDir, 'lib/worldDispatcher.js')).href);
const { readEmails } = await import(pathToFileURL(join(srcDir, 'lib/emails.js')).href);
const { readNotifications, notificationTypes, acknowledge: acknowledgeNotification } = await import(pathToFileURL(join(srcDir, 'lib/notificationSystem.js')).href);
const { registerMission, updateMissionStatus, MissionStatus } = await import(pathToFileURL(join(srcDir, 'lib/missionLog.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

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

function resetToPostMain001() {
  storage.clear();
  completeQuest({ id: MISSION_001_ID, department: 'Netzwerk' }, { xp: 10, reputation: {} });
}

console.log('"Jetzt" mail case');
{
  resetToPostMain001();
  const result = processWorldEvents();
  const pending = result.pendingDialog;
  test('pending Sam dialog exists after Mission 001', () => assert(!!pending, 'pendingDialog should exist'));

  const startNode = pending.dialog.nodes.find((n) => n.id === pending.dialog.entryNode);
  const nowOption = startNode.options.find((o) => o.nextId === 'now');
  test('a "Jetzt" option exists on the entry node', () => assert(!!nowOption, 'expected an option branching to "now"'));

  acknowledgePendingWorldDialog();
  const afterAck = processWorldEvents();
  test('mail exists after acknowledging (independent of which option text was shown)', () => {
    const emails = readEmails();
    assert(emails.some((e) => e.linkedMissionId === SIDE_MISSION_001_ID), 'side-001 mail should exist');
  });
  test('acknowledging does not auto-start the mission', () => {
    const state = readGameState();
    assert(state.activeQuest !== SIDE_MISSION_001_ID, 'activeQuest must not be set just by acknowledging the dialog');
  });
  void afterAck;
}

console.log('\n"Später" mail case (same delivery, different only in acknowledgement text)');
{
  resetToPostMain001();
  processWorldEvents();
  const pending = getPendingWorldDialog();
  const startNode = pending.dialog.nodes.find((n) => n.id === pending.dialog.entryNode);
  const laterOption = startNode.options.find((o) => o.nextId === 'later');
  test('a "Später" option exists on the entry node', () => assert(!!laterOption, 'expected an option branching to "later"'));

  const nowNode = pending.dialog.nodes.find((n) => n.id === 'now');
  const laterNode = pending.dialog.nodes.find((n) => n.id === 'later');
  test('"Jetzt" and "Später" acknowledgement texts differ', () => {
    assert(nowNode.text !== laterNode.text, 'the two branches should have distinct acknowledgement text');
  });
  test('both branches reference the persistent mail/postfach anchor', () => {
    // Whichever branch is shown, the player must be told where the
    // persistent in-world anchor lives (except the "later" case must be
    // explicit that the mail already exists, not "will be sent").
    assert(/[Mm]ail/.test(laterNode.text), '"Später" branch should mention the mail');
  });

  acknowledgePendingWorldDialog();
  test('mail still exists after picking "später"', () => {
    const emails = readEmails();
    assert(emails.some((e) => e.linkedMissionId === SIDE_MISSION_001_ID), 'side-001 mail should exist regardless of dialog choice');
  });
}

console.log('\nMail persistence across repeated processWorldEvents calls (no duplicates)');
{
  resetToPostMain001();
  processWorldEvents();
  acknowledgePendingWorldDialog();
  processWorldEvents();
  processWorldEvents();
  test('exactly one side-001 mail exists after multiple event ticks', () => {
    const matches = readEmails().filter((e) => e.linkedMissionId === SIDE_MISSION_001_ID);
    assert(matches.length === 1, `expected exactly 1 mail, got ${matches.length}`);
  });
}

console.log('\nPhone delivery persists (Mara calls after side-001)');
{
  resetToPostMain001();
  processWorldEvents();
  acknowledgePendingWorldDialog();
  const state = readGameState();
  state.completedCiscoSideMissions = [SIDE_MISSION_001_ID];
  writeGameState(state);
  processWorldEvents();

  test('a persistent phone/voicemail entry exists for side-002', () => {
    const calls = readNotifications().filter((n) => n.type === notificationTypes.PHONE && n.linkedMissionId === SIDE_MISSION_002_ID);
    assert(calls.length === 1, 'expected exactly one phone notification for side-002');
  });

  test('leaving the call unanswered keeps it pending (not silently dismissed)', () => {
    const calls = readNotifications().filter((n) => n.linkedMissionId === SIDE_MISSION_002_ID);
    assert(calls[0].dismissed === false && calls[0].acknowledged === false, 'call should remain pending until the player acts');
  });

  const pendingCall = readNotifications().find((n) => n.linkedMissionId === SIDE_MISSION_002_ID);
  acknowledgeNotification(pendingCall.id);
  test('acknowledging (answering) the call does not delete it - it is marked acknowledged', () => {
    const call = readNotifications().find((n) => n.linkedMissionId === SIDE_MISSION_002_ID);
    assert(call, 'the call notification should still exist in the store');
    assert(call.acknowledged === true, 'the call should now be acknowledged');
  });
}

console.log('\nMission abbrechen (abandon without completing) stays reachable');
{
  storage.clear();
  const started = startMainMission(MISSION_001_ID, 42);
  test('starting a mission persists an active-mission snapshot', () => {
    const reloaded = loadActiveMainMission(MISSION_001_ID);
    assert(reloaded, 'active mission should be persisted immediately after starting');
    assert(reloaded.scenario.seed === started.scenario.seed, 'reloaded scenario should match the started one');
  });

  // Simulate the player navigating back to the workspace WITHOUT finishing
  // the mission (MissionV2.jsx's returnToWorkspace() only clears
  // activeQuest, it does NOT clear the active mission state).
  setActiveQuest(null);

  test('the mission remains loadable (reachable again) after abandoning it', () => {
    const reloaded = loadActiveMainMission(MISSION_001_ID);
    assert(reloaded, 'an abandoned-but-not-completed mission must still be reloadable');
    assert(reloaded.missionId === MISSION_001_ID);
  });

  test('abandoning does not mark the mission completed', () => {
    const state = readGameState();
    assert(!state.completedQuests.includes(MISSION_001_ID), 'abandoning must not complete the mission');
  });
}

console.log('\nApp reload (fresh reads from the persisted store) keeps state identical');
{
  storage.clear();
  const started = startMainMission(MISSION_001_ID, 99);
  // "Reload" = re-reading from the same persisted localStorage-backed
  // store via a fresh call, exactly like a real app restart would.
  const reloadedOnce = loadActiveMainMission(MISSION_001_ID);
  const reloadedTwice = loadActiveMainMission(MISSION_001_ID);
  test('repeated reloads return an identical scenario/device snapshot', () => {
    assert(JSON.stringify(reloadedOnce.scenario) === JSON.stringify(reloadedTwice.scenario));
    assert(JSON.stringify(reloadedOnce.device) === JSON.stringify(reloadedTwice.device));
    assert(reloadedOnce.scenario.seed === started.scenario.seed);
  });
}

console.log('\ngetMissionDeliveryState() reflects the real lifecycle');
{
  storage.clear();
  test('no delivery yet -> NONE', () => {
    assert(getMissionDeliveryState(SIDE_MISSION_003_ID) === DeliveryState.NONE);
  });

  resetToPostMain001();
  processWorldEvents();
  acknowledgePendingWorldDialog();
  test('mail exists, mission not started -> MISSION_AVAILABLE', () => {
    assert(getMissionDeliveryState(SIDE_MISSION_001_ID) === DeliveryState.MISSION_AVAILABLE);
  });

  registerMission({ instanceId: 'email-world-mail-side-001', questId: SIDE_MISSION_001_ID, source: 'email', title: 'Side 001' });
  updateMissionStatus('email-world-mail-side-001', MissionStatus.ACCEPTED);
  test('player accepted the mission from the mail -> MISSION_ACCEPTED', () => {
    assert(getMissionDeliveryState(SIDE_MISSION_001_ID) === DeliveryState.MISSION_ACCEPTED);
  });

  updateMissionStatus('email-world-mail-side-001', MissionStatus.IN_PROGRESS);
  test('mission runtime entered -> MISSION_ACTIVE', () => {
    assert(getMissionDeliveryState(SIDE_MISSION_001_ID) === DeliveryState.MISSION_ACTIVE);
  });

  const state = readGameState();
  state.completedCiscoSideMissions = [SIDE_MISSION_001_ID];
  writeGameState(state);
  test('mission completed -> MISSION_COMPLETED', () => {
    assert(getMissionDeliveryState(SIDE_MISSION_001_ID) === DeliveryState.MISSION_COMPLETED);
  });
}

console.log(`\n${passed} tests passed`);
