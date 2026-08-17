// Phase 1F (corrected): Main Mission 002 – zwei VLANs, Parking-VLAN, Uplink-Trunk auf Sw2.

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
  MISSION_002_ID, startMainMission, evaluateMainMission, executeMissionCommand,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
const { executeCommand } = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);

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

function runCommands(device, cmds) {
  for (const cmd of cmds) {
    const result = executeCommand(device, cmd, { helpCompact: true });
    if (!result.success) throw new Error(`Command failed: ${cmd}\n${result.output}`);
  }
}

// Like runCommands, but goes through executeMissionCommand so that
// state.showCommandsUsed (used for the "verified" check) is tracked - this
// matters for any test that expects the mission to fully complete.
function runMissionCommands(state, cmds) {
  for (const cmd of cmds) {
    const result = executeMissionCommand(state, cmd);
    if (!result.success) throw new Error(`Command failed: ${cmd}\n${result.output}`);
  }
}

// Full, correct command sequence for the success path / saved regression checks.
const FULL_SOLUTION = [
  'enable',
  'configure terminal',
  'vlan 10',
  'name PERSONAL',
  'exit',
  'vlan 20',
  'name BUCHHALTUNG',
  'exit',
  'vlan 999',
  'name UNUSED',
  'exit',
  'interface fa0/1',
  'switchport mode access',
  'switchport access vlan 10',
  'exit',
  'interface fa0/2',
  'switchport mode access',
  'switchport access vlan 20',
  'exit',
  'interface range fa0/3 - 8',
  'switchport mode access',
  'switchport access vlan 999',
  'shutdown',
  'exit',
  'interface gi0/1',
  'switchport mode trunk',
  'exit',
  'end',
  'show vlan brief',
  'show interfaces trunk',
  'copy running-config startup-config',
];

console.log('Mission 002 scenario and device');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 12345);
  test('mission id is cisco-main-002', () => assert(state.missionId === MISSION_002_ID));
  test('device hostname is Sw2', () => assert(state.device.hostname === 'Sw2'));
  test('device has 9 interfaces (8 FE + 1 GE)', () => assert(Object.keys(state.device.runningConfig.interfaces).length === 9));
  test('FastEthernet0/1 exists', () => assert(!!state.device.runningConfig.interfaces['FastEthernet0/1']));
  test('FastEthernet0/8 exists', () => assert(!!state.device.runningConfig.interfaces['FastEthernet0/8']));
  test('GigabitEthernet0/1 exists', () => assert(!!state.device.runningConfig.interfaces['GigabitEthernet0/1']));
  test('FastEthernet0/24 does not exist on small switch', () => assert(!state.device.runningConfig.interfaces['FastEthernet0/24']));
  test('GigabitEthernet0/2 does not exist on small switch', () => assert(!state.device.runningConfig.interfaces['GigabitEthernet0/2']));

  const personal = state.device.runningConfig.interfaces['FastEthernet0/1'];
  test('personal port is connected but not yet shut down', () => assert(personal.operationalStatus === 'connected' && !personal.administrativelyDown));
  const unused = state.device.runningConfig.interfaces['FastEthernet0/3'];
  test('unused port starts open (not shutdown)', () => assert(!unused.administrativelyDown));
  const uplink = state.device.runningConfig.interfaces['GigabitEthernet0/1'];
  test('uplink starts connected', () => assert(uplink.operationalStatus === 'connected' && !uplink.administrativelyDown));
}

console.log('\nPort discovery before configuration');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 12345);
  const statusResult = executeMissionCommand(state, 'enable');
  assert(statusResult.success);
  const status = executeMissionCommand(state, 'show interfaces status');
  test('show interfaces status reflects device profile', () => {
    assert(status.output.includes('Fa0/1'));
    assert(status.output.includes('Fa0/8'));
    assert(status.output.includes('Gi0/1'));
  });
  const running = executeMissionCommand(state, 'show running-config');
  test('show running-config reflects device profile', () => {
    assert(running.output.includes('FastEthernet0/1'));
    assert(running.output.includes('GigabitEthernet0/1'));
  });
}

console.log('\nMission 002 success path (full solution)');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 12345);
  for (const cmd of FULL_SOLUTION) {
    const result = executeMissionCommand(state, cmd);
    assert(result.success, `Command should succeed: ${cmd}\n${result.output}`);
  }
  const evaluation = evaluateMainMission(state);
  test('mission evaluates allCorrect', () => assert(evaluation.allCorrect === true, `checks: ${JSON.stringify(evaluation.checks)}`));
  test('mission state completed', () => assert(state.completed === true));
  test('all nine requirements are ok', () => assert(evaluation.checks.every((c) => c.ok), JSON.stringify(evaluation.checks)));
}

console.log('\nMission 002 success path (single-interface variant, no ranges)');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 22222);
  runMissionCommands(state, [
    'enable', 'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    'vlan 999', 'name UNUSED', 'exit',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'exit',
    'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'exit',
    'interface fa0/3', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/4', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/5', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/6', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/7', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/8', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface gi0/1', 'switchport mode trunk', 'exit',
    'end',
    'show vlan brief',
    'write',
  ]);
  const evaluation = evaluateMainMission(state);
  test('single-interface configuration also completes the mission', () => assert(evaluation.allCorrect === true, JSON.stringify(evaluation.checks)));
}

console.log('\nMission 002 failure cases');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 12346);
  runCommands(state.device, [
    'enable', 'configure terminal',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'exit',
    'end', 'copy running-config startup-config',
  ]);
  const noVlan = evaluateMainMission(state);
  test('missing VLANs fails', () => assert(noVlan.allCorrect === false));
  test('vlan_personal check fails', () => assert(noVlan.checks.find((c) => c.id === 'vlan_personal').ok === false));

  storage.clear();
  const state2 = startMainMission(MISSION_002_ID, 12347);
  runCommands(state2.device, [
    'enable', 'configure terminal',
    'vlan 10', 'name WRONG', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'exit',
    'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'exit',
    'end', 'copy running-config startup-config',
  ]);
  const wrongName = evaluateMainMission(state2);
  test('wrong VLAN name fails', () => assert(wrongName.allCorrect === false));
  test('vlan_personal check fails for wrong name', () => assert(wrongName.checks.find((c) => c.id === 'vlan_personal').ok === false));

  storage.clear();
  const state3 = startMainMission(MISSION_002_ID, 12348);
  runMissionCommands(state3, FULL_SOLUTION.slice(0, FULL_SOLUTION.length - 1)); // everything except the final save
  const notSaved = evaluateMainMission(state3);
  test('not saved fails', () => assert(notSaved.allCorrect === false));
  test('verified check passes when show commands were used', () => assert(notSaved.checks.find((c) => c.id === 'verified').ok === true));
  test('saved check fails when not saved', () => assert(notSaved.checks.find((c) => c.id === 'saved').ok === false));

  storage.clear();
  const state4 = startMainMission(MISSION_002_ID, 12349);
  runCommands(state4.device, [
    'enable', 'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    // intentionally do not configure fa0/1
    // 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'exit',
    'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'exit',
    'end', 'copy running-config startup-config',
  ]);
  const missingPort = evaluateMainMission(state4);
  test('personal port left unconfigured fails personal_port', () => assert(missingPort.checks.find((c) => c.id === 'personal_port').ok === false));

  storage.clear();
  const state5 = startMainMission(MISSION_002_ID, 12350);
  runCommands(state5.device, [
    'enable', 'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    'vlan 999', 'name UNUSED', 'exit',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'exit',
    'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'exit',
    // unused ports left completely unconfigured / still open in VLAN 1
    'interface gi0/1', 'switchport mode trunk', 'exit',
    'end', 'copy running-config startup-config',
  ]);
  const openPorts = evaluateMainMission(state5);
  test('unused ports left open fails unused_ports_parked', () => assert(openPorts.checks.find((c) => c.id === 'unused_ports_parked').ok === false));

  storage.clear();
  const state6 = startMainMission(MISSION_002_ID, 12351);
  runCommands(state6.device, [
    'enable', 'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    'vlan 999', 'name UNUSED', 'exit',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'exit',
    'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'exit',
    'interface range fa0/3 - 8', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    // uplink left untouched (no trunk)
    'end', 'copy running-config startup-config',
  ]);
  const noTrunk = evaluateMainMission(state6);
  test('uplink not configured as trunk fails uplink_trunk', () => assert(noTrunk.checks.find((c) => c.id === 'uplink_trunk').ok === false));

  storage.clear();
  const state7 = startMainMission(MISSION_002_ID, 12352);
  runCommands(state7.device, [
    'enable', 'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    'vlan 999', 'name UNUSED', 'exit',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'exit',
    'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'exit',
    'interface range fa0/3 - 8', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface gi0/1', 'shutdown', 'exit', // uplink accidentally shut down
    'end', 'copy running-config startup-config',
  ]);
  const uplinkDown = evaluateMainMission(state7);
  test('uplink shut down fails uplink_trunk', () => assert(uplinkDown.checks.find((c) => c.id === 'uplink_trunk').ok === false));

  storage.clear();
  const state8 = startMainMission(MISSION_002_ID, 12353);
  runCommands(state8.device, [
    'enable', 'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    'vlan 999', 'name UNUSED', 'exit',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'exit',
    'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'exit',
    'interface range fa0/3 - 8', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface gi0/1', 'switchport mode access', 'switchport access vlan 999', 'exit', // uplink accidentally parked
    'end', 'copy running-config startup-config',
  ]);
  const uplinkParked = evaluateMainMission(state8);
  test('uplink parked in VLAN 999 fails uplink_trunk', () => assert(uplinkParked.checks.find((c) => c.id === 'uplink_trunk').ok === false));
}

console.log('\nWrite / save abbreviations are all accepted');
{
  for (const saveCmd of ['write', 'write memory', 'wr', 'copy running-config startup-config']) {
    storage.clear();
    const state = startMainMission(MISSION_002_ID, 99000 + saveCmd.length);
    runMissionCommands(state, FULL_SOLUTION.slice(0, FULL_SOLUTION.length - 3)); // everything up to end
    runMissionCommands(state, ['show vlan brief', saveCmd]);
    const evaluation = evaluateMainMission(state);
    test(`"${saveCmd}" saves the configuration and completes the mission`, () => assert(evaluation.allCorrect === true, JSON.stringify(evaluation.checks)));
  }
}

console.log(`\n${passed} tests passed`);
