// Phase 1J.2 regression tests:
// 1. Inbox groups open items before completed items and keeps at most 3 completed visible.
// 2. HM2 uses the small 8FE+1GE device profile and has 9 independent 0/9 progression steps.
// 3. Main-mission unlock mail is dispatched exactly once with idempotency.
// 4. CLI submode navigation and interface range stay intact on the small device.

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

const {
  readGameState, writeGameState,
} = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
const {
  getVisibleInbox, ensureInbox,
} = await import(pathToFileURL(join(srcDir, 'lib/sideMissionEngine.js')).href);
const {
  MISSION_002_ID, startMainMission, executeMissionCommand, evaluateMainMission,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
const {
  processWorldEvents,
} = await import(pathToFileURL(join(srcDir, 'lib/worldDispatcher.js')).href);
const {
  readEmails,
} = await import(pathToFileURL(join(srcDir, 'lib/emails.js')).href);

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runMissionCommands(state, cmds) {
  for (const cmd of cmds) {
    const result = executeMissionCommand(state, cmd);
    if (!result.success) throw new Error(`Command failed: ${cmd}\n${result.output}`);
  }
}

console.log('Inbox open/completed grouping');
{
  storage.clear();
  ensureInbox();
  const s = readGameState();
  s.inbox = [
    { id: 'open1', topic: 'Netzwerk', resolved: false, archived: false, deliveredAt: 50 },
    { id: 'open2', topic: 'Netzwerk', resolved: false, archived: false, deliveredAt: 40 },
    { id: 'done1', topic: 'Netzwerk', resolved: true, archived: false, deliveredAt: 300 },
    { id: 'done2', topic: 'Netzwerk', resolved: true, archived: false, deliveredAt: 200 },
    { id: 'done3', topic: 'Netzwerk', resolved: true, archived: false, deliveredAt: 100 },
    { id: 'done4', topic: 'Netzwerk', resolved: true, archived: false, deliveredAt: 10 },
  ];
  writeGameState(s);
  const visible = getVisibleInbox();
  test('open items come first', () => assert(visible[0].id === 'open1' && visible[1].id === 'open2', visible.map((i) => i.id).join(',')));
  test('only the 3 newest completed items are visible', () => assert(visible.length === 5, `got ${visible.length}`));
  test('completed are sorted newest first', () => assert(visible[2].id === 'done1' && visible[3].id === 'done2' && visible[4].id === 'done3', visible.map((i) => i.id).join(',')));
  test('old completed item is hidden but not archived', () => assert(!visible.find((i) => i.id === 'done4') && !s.inbox.find((i) => i.id === 'done4').archived));
}

console.log('\nHM2 small device profile');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 88888);
  const ifaces = Object.keys(state.device.runningConfig.interfaces);
  test('device has exactly 9 interfaces', () => assert(ifaces.length === 9, ifaces.length));
  test('FastEthernet0/1 exists', () => assert(!!state.device.runningConfig.interfaces['FastEthernet0/1']));
  test('FastEthernet0/8 exists', () => assert(!!state.device.runningConfig.interfaces['FastEthernet0/8']));
  test('FastEthernet0/24 does not exist', () => assert(!state.device.runningConfig.interfaces['FastEthernet0/24']));
  test('GigabitEthernet0/1 exists', () => assert(!!state.device.runningConfig.interfaces['GigabitEthernet0/1']));
  test('GigabitEthernet0/2 does not exist', () => assert(!state.device.runningConfig.interfaces['GigabitEthernet0/2']));
}

console.log('\nHM2 0/9 live progression');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 77777);
  const before = evaluateMainMission(state);
  test('starts at 0/9', () => assert(before.completed === 0 && before.total === 9, `${before.completed}/${before.total}`));

  runMissionCommands(state, ['enable', 'configure terminal', 'vlan 10', 'name PERSONAL', 'exit']);
  const afterVlan10 = evaluateMainMission(state);
  test('VLAN 10 gives 1/9', () => assert(afterVlan10.completed === 1 && afterVlan10.checks.find((c) => c.id === 'vlan_personal').ok, JSON.stringify(afterVlan10.checks)));

  runMissionCommands(state, ['vlan 20', 'name BUCHHALTUNG', 'exit', 'vlan 999', 'name UNUSED', 'exit']);
  const afterVlans = evaluateMainMission(state);
  test('all three VLANs give 3/9', () => assert(afterVlans.completed === 3, `${afterVlans.completed}/9 ${JSON.stringify(afterVlans.checks)}`));

  runMissionCommands(state, ['interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'exit']);
  const afterPersonal = evaluateMainMission(state);
  test('Fa0/1 gives 4/9', () => assert(afterPersonal.completed === 4, `${afterPersonal.completed}/9`));

  runMissionCommands(state, [
    'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'exit',
    'interface range fa0/3 - 8', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface gi0/1', 'switchport mode trunk', 'exit',
    'end', 'show vlan brief',
  ]);
  const afterTrunk = evaluateMainMission(state);
  test('parking + uplink + verify give 8/9 (saved missing)', () => assert(afterTrunk.completed === 8, `${afterTrunk.completed}/9 ${JSON.stringify(afterTrunk.checks)}`));

  runMissionCommands(state, ['copy running-config startup-config']);
  const afterSave = evaluateMainMission(state);
  test('save gives 9/9', () => assert(afterSave.completed === 9 && afterSave.allCorrect, `${afterSave.completed}/9`));
}

console.log('\nMain-mission unlock mail idempotency');
{
  storage.clear();
  let s = readGameState();
  s.completedQuests = ['cisco-main-001'];
  // Two completed side missions are enough to unlock HM2 (requires 2).
  s.completedCiscoSideMissions = ['cisco-side-basic-001', 'cisco-side-basic-002'];
  writeGameState(s);

  const first = processWorldEvents();
  test('HM2 unlock mail dispatched on first gate', () => assert(first.dispatched.includes('main-mission-unlocked:cisco-main-002'), JSON.stringify(first)));
  test('exactly one HM2 mail exists', () => assert(readEmails().filter((e) => e.linkedMissionId === MISSION_002_ID).length === 1));

  const second = processWorldEvents();
  test('duplicate world event is not dispatched', () => assert(!second.dispatched.includes('main-mission-unlocked:cisco-main-002')));
  test('still exactly one HM2 mail after second run', () => assert(readEmails().filter((e) => e.linkedMissionId === MISSION_002_ID).length === 1));
}

console.log('\nCLI submode navigation and interface range on small device');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 66666);
  runMissionCommands(state, ['enable', 'configure terminal', 'interface fa0/1', 'description personal', 'interface fa0/2', 'description buchhaltung']);
  const fa0_2 = state.device.cli.currentInterface;
  test('interface fa0/2 from config-if switches without exit', () => assert(fa0_2 === 'FastEthernet0/2', fa0_2));

  runMissionCommands(state, ['interface range fa0/3 - 8', 'description unused']);
  const range = state.device.cli.currentInterfaceRange;
  test('interface range fa0/3 - 8 works in interface submode', () => assert(Array.isArray(range) && range.length === 6, JSON.stringify(range)));

  runMissionCommands(state, ['exit', 'vlan 10']);
  const vlan = state.device.cli.currentVlanId;
  test('vlan 10 from global config changes to vlan submode', () => assert(vlan === 10, vlan));
}

console.log(`\n${passed} tests passed`);
