// Phase 1F: Main Mission 002 – VLAN auf Sw2.

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

console.log('Mission 002 scenario and device');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 12345);
  test('mission id is cisco-main-002', () => assert(state.missionId === MISSION_002_ID));
  test('device hostname is Sw2', () => assert(state.device.hostname === 'Sw2'));
  test('device has 26 interfaces', () => assert(Object.keys(state.device.runningConfig.interfaces).length === 26));
  test('FastEthernet0/1 exists', () => assert(!!state.device.runningConfig.interfaces['FastEthernet0/1']));
  test('FastEthernet0/24 exists', () => assert(!!state.device.runningConfig.interfaces['FastEthernet0/24']));
  test('GigabitEthernet0/2 exists', () => assert(!!state.device.runningConfig.interfaces['GigabitEthernet0/2']));
  test('invalid FastEthernet0/25 does not exist', () => assert(!state.device.runningConfig.interfaces['FastEthernet0/25']));
  test('invalid GigabitEthernet0/3 does not exist', () => assert(!state.device.runningConfig.interfaces['GigabitEthernet0/3']));
}

console.log('\nMission 002 success path');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 12345);
  const cmds = [
    'enable',
    'configure terminal',
    'vlan 10',
    'name PERSONAL',
    'exit',
    'interface range fa0/1 - 4',
    'switchport mode access',
    'switchport access vlan 10',
    'exit',
    'end',
    'show vlan brief',
    'copy running-config startup-config',
  ];
  for (const cmd of cmds) {
    const result = executeMissionCommand(state, cmd);
    assert(result.success, `Command should succeed: ${cmd}\n${result.output}`);
  }
  const evaluation = evaluateMainMission(state);
  test('mission evaluates allCorrect', () => assert(evaluation.allCorrect === true, `checks: ${JSON.stringify(evaluation.checks)}`));
  test('mission state completed', () => assert(state.completed === true));
}

console.log('\nMission 002 failure cases');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 12346);
  runCommands(state.device, [
    'enable', 'configure terminal',
    'interface range fa0/1 - 4',
    'switchport mode access',
    'switchport access vlan 10',
    'end',
    'copy running-config startup-config',
  ]);
  const noVlan = evaluateMainMission(state);
  test('missing VLAN 10 PERSONAL fails', () => assert(noVlan.allCorrect === false));
  test('vlan_created check fails', () => assert(noVlan.checks.find((c) => c.id === 'vlan_created').ok === false));

  storage.clear();
  const state2 = startMainMission(MISSION_002_ID, 12347);
  runCommands(state2.device, [
    'enable', 'configure terminal',
    'vlan 10', 'name WRONG', 'exit',
    'interface range fa0/1 - 4',
    'switchport mode access',
    'switchport access vlan 10',
    'end',
    'copy running-config startup-config',
  ]);
  const wrongName = evaluateMainMission(state2);
  test('wrong VLAN name fails', () => assert(wrongName.allCorrect === false));

  storage.clear();
  const state3 = startMainMission(MISSION_002_ID, 12348);
  runCommands(state3.device, [
    'enable', 'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'interface range fa0/1 - 4',
    'switchport mode access',
    'switchport access vlan 10',
    'end',
  ]);
  const notSaved = evaluateMainMission(state3);
  test('not saved fails', () => assert(notSaved.allCorrect === false));
  test('config_saved check fails', () => assert(notSaved.checks.find((c) => c.id === 'config_saved').ok === false));
}

console.log(`\n${passed} tests passed`);
