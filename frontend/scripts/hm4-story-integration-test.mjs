// Phase 1J.3 hotfix: HM4 (Router-on-a-Stick) was fully implemented in
// missionV2.js but was never wired into questData.js / worldDispatcher.js,
// so completing it in the real game never actually recorded it as done
// (MissionV2.jsx's complete() handler silently no-ops when questById()
// returns undefined). These tests exercise the REAL code path a player
// goes through - questById() + gameState.completeQuest() - rather than the
// synthetic `completeQuest({ id: MISSION_004_ID })` shortcut used by older
// tests, which is exactly what let this bug slip through unnoticed.

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
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {}, speechSynthesis: null };

const {
  readGameState, completeQuest, completeCiscoSideMission,
} = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
const {
  MISSION_001_ID, MISSION_002_ID, MISSION_003_ID, MISSION_004_ID,
  startMainMission, executeMissionCommand, evaluateMainMission, isMainMission,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
const {
  SIDE_MISSION_001_ID, SIDE_MISSION_002_ID, SIDE_MISSION_003_ID, SIDE_MISSION_004_ID,
} = await import(pathToFileURL(join(srcDir, 'lib/ciscoSideMissions.js')).href);
const { processWorldEvents, acknowledgePendingWorldDialog, getPendingWorldDialog } = await import(pathToFileURL(join(srcDir, 'lib/worldDispatcher.js')).href);
const { readEmails } = await import(pathToFileURL(join(srcDir, 'lib/emails.js')).href);
const { getNextMainMission } = await import(pathToFileURL(join(srcDir, 'lib/objectives.js')).href);
const { questById } = await import(pathToFileURL(join(srcDir, 'lib/questData.js')).href);
const { getTemplate } = await import(pathToFileURL(join(srcDir, 'lib/missionTemplateEngine.js')).href);
const { isTemplateUnlocked } = await import(pathToFileURL(join(srcDir, 'lib/missionGenerator.js')).href);

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

// This is the EXACT logic MissionV2.jsx's runtime.complete() uses - not a
// shortcut. If questById() ever returns undefined again for a main mission,
// this helper (and therefore these tests) will fail the same way the real
// game silently failed before this fix.
function completeMainMissionLikeTheRealUiDoes(missionId) {
  const quest = questById(missionId);
  if (quest) completeQuest(quest, { xp: 80, reputation: { network: 8, management: 4 } });
  return !!quest;
}

function tick() {
  processWorldEvents();
  const pending = getPendingWorldDialog();
  if (pending) acknowledgePendingWorldDialog();
  return pending;
}

function solveHm3(seed) {
  const state = startMainMission(MISSION_003_ID, seed);
  for (const cmd of [
    'enable', 'configure terminal',
    'vlan 172', 'name ADMIN', 'exit',
    'interface vlan 172', 'ip address 192.168.172.2 255.255.255.0', 'no shutdown', 'exit',
    'ip default-gateway 192.168.172.1',
    'ip domain-name nexus.local',
    'crypto key generate rsa', '1024',
    'ip ssh version 2',
    'line vty 0 15', 'login local', 'transport input ssh', 'exit',
    'end', 'show ip ssh', 'copy running-config startup-config',
  ]) executeMissionCommand(state, cmd);
  return state;
}

function solveHm4(seed) {
  const state = startMainMission(MISSION_004_ID, seed);
  const p = state.scenario.parameters;
  const cmds = ['enable', 'configure terminal'];
  p.vlans.forEach((v) => cmds.push(`vlan ${v.id}`, `name ${v.name}`, 'exit'));
  p.vlans.forEach((v) => {
    const start = v.accessPorts[0].split('/')[1];
    const end = v.accessPorts[v.accessPorts.length - 1].split('/')[1];
    cmds.push(`interface range fa0/${start} - ${end}`, 'switchport mode access', `switchport access vlan ${v.id}`, 'no shutdown', 'exit');
  });
  cmds.push(`interface ${p.uplinkPort.replace('GigabitEthernet', 'gi')}`, 'switchport mode trunk', `switchport trunk allowed vlan ${p.vlans.map((v) => v.id).join(',')}`, 'no shutdown', 'exit');
  cmds.push(`interface ${p.routerPhysicalPort.replace('GigabitEthernet', 'gi')}`, 'no shutdown', 'exit');
  p.vlans.forEach((v) => cmds.push(`interface ${p.routerPhysicalPort.replace('GigabitEthernet', 'gi')}.${v.id}`, `encapsulation dot1q ${v.id}`, `ip address ${v.gateway} ${v.mask}`, 'no shutdown', 'exit'));
  cmds.push('end', 'show ip interface brief', 'copy running-config startup-config');
  for (const cmd of cmds) executeMissionCommand(state, cmd);
  return state;
}

function playThroughToHm3Available() {
  storage.clear();
  completeQuest({ id: MISSION_001_ID }, { xp: 10, reputation: {} });
  tick();
  completeCiscoSideMission(SIDE_MISSION_001_ID, { xp: 10, reputation: {} });
  tick();
  completeCiscoSideMission(SIDE_MISSION_002_ID, { xp: 10, reputation: {} });
  tick();
  completeCiscoSideMission(SIDE_MISSION_003_ID, { xp: 10, reputation: {} });
  tick();
  completeQuest({ id: MISSION_002_ID }, { xp: 10, reputation: {} });
  tick();
  completeCiscoSideMission(SIDE_MISSION_004_ID, { xp: 10, reputation: {} });
  tick();
}

console.log('questData registration');
{
  storage.clear();
  test("questById('cisco-main-004') exists", () => assert.ok(questById(MISSION_004_ID)));
  test('HM4 requires HM3', () => assert.deepEqual(questById(MISSION_004_ID).requires, [MISSION_003_ID]));
  test('HM4 is recognised as a main mission by the runtime', () => assert.ok(isMainMission(MISSION_004_ID)));
}

console.log('\nUnlock gating: before vs. after HM3');
{
  playThroughToHm3Available();
  const before = getNextMainMission();
  test('before HM3: next main mission is HM3, not HM4', () => assert.equal(before?.quest?.id, MISSION_003_ID));
  test('before HM3: HM4 is not reachable yet', () => assert.notEqual(before?.quest?.id, MISSION_004_ID));

  const hm3State = solveHm3(555);
  test('HM3 evaluates allCorrect', () => assert.equal(evaluateMainMission(hm3State).allCorrect, true));
  test('HM3 completes via the real UI code path', () => assert.equal(completeMainMissionLikeTheRealUiDoes(MISSION_003_ID), true));

  const after = getNextMainMission();
  test('after HM3: next main mission is HM4', () => assert.equal(after?.quest?.id, MISSION_004_ID));
  test('after HM3: HM4 is available (not locked)', () => assert.equal(after?.available, true));
  test('after HM3: HM4 has a concrete title, not a placeholder', () => assert.equal(after?.quest?.title, questById(MISSION_004_ID).title));
}

console.log('\nWorld-flow: story event + mail, exactly once');
{
  const firstTickDialog = tick();
  test('a Sam dialog about HM4 is created right after HM3', () => assert.equal(firstTickDialog?.eventId, 'post-main-003-sam'));

  const hm4MailsAfterFirstTick = readEmails().filter((e) => e.linkedMissionId === MISSION_004_ID);
  test('exactly one HM4 mail exists after the first tick', () => assert.equal(hm4MailsAfterFirstTick.length, 1));

  // Repeated ticks / "reloads" must not duplicate the dialog, mail, or
  // re-trigger any unlock bookkeeping.
  const secondTickDialog = tick();
  const thirdTickDialog = tick();
  test('reload does not re-create the Sam dialog', () => assert.equal(secondTickDialog, null));
  test('a second reload still does not re-create the Sam dialog', () => assert.equal(thirdTickDialog, null));

  const hm4MailsAfterReloads = readEmails().filter((e) => e.linkedMissionId === MISSION_004_ID);
  test('still exactly one HM4 mail after repeated reload ticks', () => assert.equal(hm4MailsAfterReloads.length, 1));

  const state = readGameState();
  test('post-main-003-sam recorded exactly once in dispatchedWorldEvents', () => assert.equal(state.dispatchedWorldEvents.filter((id) => id === 'post-main-003-sam').length, 1));
  test('cisco-main-004 unlock mail event recorded exactly once', () => assert.equal(state.dispatchedWorldEvents.filter((id) => id === 'main-mission-unlocked:cisco-main-004').length, 1));
}

console.log('\nNavigation target');
{
  const next = getNextMainMission();
  test('ObjectivePanel would navigate to /mission/cisco-main-004', () => assert.equal(`/mission/${next.quest.id}`, '/mission/cisco-main-004'));
}

console.log('\nReal completion path records progress correctly');
{
  const hm4State = solveHm4(777);
  test('HM4 evaluates allCorrect', () => assert.equal(evaluateMainMission(hm4State).allCorrect, true));
  test('HM4 completes via the real UI code path (this is what was broken before the fix)', () => assert.equal(completeMainMissionLikeTheRealUiDoes(MISSION_004_ID), true));

  const finalState = readGameState();
  test('completedQuests now really contains cisco-main-004', () => assert.ok(finalState.completedQuests.includes(MISSION_004_ID)));
}

console.log('\nGenerator unlock reflects the real (non-synthetic) game state');
{
  test('cisco-router-on-a-stick template is unlocked from real state', () => assert.equal(isTemplateUnlocked(getTemplate('cisco-router-on-a-stick')), true));
  test('cisco-router-fault template is unlocked from real state', () => assert.equal(isTemplateUnlocked(getTemplate('cisco-router-fault')), true));
}

console.log(`\n${passed} tests passed`);
