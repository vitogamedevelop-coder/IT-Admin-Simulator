// Phase 1J.1 regression tests:
// 1. Procedural side missions count toward the main-mission story gate.
// 2. Mail/inbox sorting uses deliveredAt/createdAt without mutating arrays.
// 3. HM2 separates verified and saved requirements.
// 4. CLI allows interface/vlan parent navigation from submodes and interface-range
//    variations with spaces/commas.

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
  MISSION_002_ID, startMainMission, executeMissionCommand, evaluateMainMission,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
const {
  createCiscoDevice,
} = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);
const {
  sortEmailsByDelivery,
} = await import(pathToFileURL(join(srcDir, 'lib/emails.js')).href);
const {
  evaluateProceduralMission,
} = await import(pathToFileURL(join(srcDir, 'lib/missionGenerator.js')).href);
const {
  allTemplates,
} = await import(pathToFileURL(join(srcDir, 'lib/missionTemplateEngine.js')).href);

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

console.log('Procedural side mission counts toward story gate');
{
  storage.clear();
  const state = readGameState();
  state.completedQuests = ['cisco-main-001'];
  writeGameState(state);

  const template = allTemplates().find((t) => t.id === 'cisco-basic-config-hardening');
  assert(template, 'basic config template exists');

  const rng = { v: 1 };
  const fakeRng = (min, max) => {
    rng.v = (rng.v * 1103515245 + 12345) & 0x7fffffff;
    return min + (rng.v % (max - min + 1));
  };
  const params = template.resolveParameters(fakeRng, 'build', 'ersatzgerat');
  const { device } = template.buildDevice(params, 'build');
  const instanceId = `phase1j1-test-001`;
  const runtime = {
    instanceId,
    templateId: template.id,
    device,
    params,
    archetype: 'build',
    difficulty: 'medium',
    showCommandsUsed: [],
    hintsConsumed: [],
    solutionRevealedFor: [],
    attempts: 0,
    completed: false,
  };

  // Satisfy all selected tasks + save.
  runMissionCommands(runtime, [
    'enable', 'configure terminal',
  ]);
  for (const taskId of params.selectedTaskIds) {
    if (taskId === 'hostname') {
      runMissionCommands(runtime, [`hostname ${params.targetHostname}`]);
    } else if (taskId === 'enable_secret') {
      runMissionCommands(runtime, ['enable secret s3cr3t']);
    } else if (taskId === 'local_user') {
      runMissionCommands(runtime, [`username ${params.username} secret u$er`]);
    } else if (taskId === 'disable_dns_lookup') {
      runMissionCommands(runtime, ['no ip domain-lookup']);
    } else if (taskId === 'console_security') {
      runMissionCommands(runtime, ['line console 0', 'password c0nsole', 'exit']);
    } else if (taskId === 'login') {
      runMissionCommands(runtime, ['line console 0', 'login', 'exit']);
    } else if (taskId === 'login_local') {
      runMissionCommands(runtime, ['line console 0', 'login local', 'exit']);
    } else if (taskId === 'exec_timeout') {
      runMissionCommands(runtime, ['line console 0', `exec-timeout ${params.execTimeoutMinutes} ${params.execTimeoutSeconds}`, 'exit']);
    } else if (taskId === 'service_password_encryption') {
      runMissionCommands(runtime, ['service password-encryption']);
    }
  }
  runMissionCommands(runtime, ['end', 'show running-config', 'copy running-config startup-config']);

  evaluateProceduralMission(runtime);

  test('procedural mission marked completed in runtime state', () => assert(runtime.completed === true));
  const gameState = readGameState();
  test('procedural mission is in sideMissionHistory', () => assert(!!gameState.sideMissionHistory?.[`procedural:${instanceId}`]));
  test('procedural mission countsTowardStoryGate is true', () => assert(gameState.sideMissionHistory[`procedural:${instanceId}`].countsTowardStoryGate === true));
  test('procedural mission source is procedural', () => assert(gameState.sideMissionHistory[`procedural:${instanceId}`].source === 'procedural'));
}

console.log('\nMail sorting by deliveredAt/createdAt without mutation');
{
  storage.clear();
  const original = [
    { id: 'a', date: 100, deliveredAt: 300 },
    { id: 'b', date: 200, deliveredAt: 200 },
    { id: 'c', date: 300, deliveredAt: 100 },
  ];
  const sorted = sortEmailsByDelivery(original);
  test('sorted array is newest delivered first', () => assert(sorted.map((e) => e.id).join(',') === 'a,b,c'));
  test('original array is not mutated', () => assert(original.map((e) => e.id).join(',') === 'a,b,c'));

  const fallback = [
    { id: 'x', createdAt: 10 },
    { id: 'y', date: 20 },
    { id: 'z', createdAt: 30 },
  ];
  const fallbackSorted = sortEmailsByDelivery(fallback);
  test('fallback sort uses createdAt then date', () => assert(fallbackSorted.map((e) => e.id).join(',') === 'z,y,x'));
}

console.log('\nHM2 verified and saved are separate requirements');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 55555);
  runMissionCommands(state, [
    'enable', 'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    'vlan 999', 'name UNUSED', 'exit',
    'interface range fa0/1 - 4', 'switchport mode access', 'switchport access vlan 10', 'exit',
    'interface range fa0/5 - 8', 'switchport mode access', 'switchport access vlan 20', 'exit',
    'interface range fa0/9 - 24', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface gi0/1', 'switchport mode trunk', 'exit',
    'end',
    'show vlan brief',
    'show interfaces trunk',
  ]);
  const progress = evaluateMainMission(state);
  test('verified passes after show commands', () => assert(progress.checks.find((c) => c.id === 'verified').ok === true));
  test('saved fails before save command', () => assert(progress.checks.find((c) => c.id === 'saved').ok === false));
  test('mission not allCorrect before save', () => assert(progress.allCorrect === false));

  runMissionCommands(state, ['copy running-config startup-config']);
  const progressSaved = evaluateMainMission(state);
  test('saved passes after save command', () => assert(progressSaved.checks.find((c) => c.id === 'saved').ok === true));
  test('mission allCorrect after save', () => assert(progressSaved.allCorrect === true));
}

console.log('\nCLI parent/submode navigation');
{
  const device = createCiscoDevice({ type: 'layer2_switch', interfaces: ['FastEthernet0/1', 'FastEthernet0/2', 'GigabitEthernet0/1'] });
  const state = { device, showCommandsUsed: [], hintsConsumed: [], solutionRevealedFor: [], attempts: 0, completed: false };
  runMissionCommands(state, [
    'enable', 'configure terminal',
    'interface fa0/1', 'description first', 'interface fa0/2', 'description second',
  ]);
  test('interface fa0/2 from config-if changes current interface', () => assert(device.cli.currentInterface === 'FastEthernet0/2'));
  test('description was set on fa0/2', () => assert(device.runningConfig.interfaces['FastEthernet0/2'].description === 'second'));

  runMissionCommands(state, [
    'interface range fa0/1 - 2', 'description range-test',
  ]);
  test('interface range from config-if switches to range mode', () => assert(device.cli.mode === 'INTERFACE_RANGE_CONFIG'));
  test('description applied to range', () => assert(device.runningConfig.interfaces['FastEthernet0/1'].description === 'range-test'));

  const vlanDevice = createCiscoDevice({ type: 'layer2_switch', interfaces: ['FastEthernet0/1'] });
  const vlanState = { device: vlanDevice, showCommandsUsed: [], hintsConsumed: [], solutionRevealedFor: [], attempts: 0, completed: false };
  runMissionCommands(vlanState, [
    'enable', 'configure terminal',
    'vlan 10', 'name TEN', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10',
  ]);
  test('interface from config-vlan switches to interface config', () => assert(vlanDevice.cli.mode === 'INTERFACE_CONFIG'));
  test('vlan config-vlan transition works', () => assert(vlanDevice.runningConfig.interfaces['FastEthernet0/1'].accessVlan === 10));
}

console.log('\nInterface range whitespace and comma variations');
{
  for (const rangeCmd of [
    'interface range fa0/1-3',
    'interface range fa0/1 - 3',
    'interface range fa0/1-2, fa0/3',
    'interface range fa0/1 - 2 , fa0/3',
  ]) {
    const d = createCiscoDevice({ type: 'layer2_switch', interfaces: ['FastEthernet0/1', 'FastEthernet0/2', 'FastEthernet0/3', 'GigabitEthernet0/1'] });
    runMissionCommands({ device: d, showCommandsUsed: [], hintsConsumed: [], solutionRevealedFor: [], attempts: 0, completed: false }, [
      'enable', 'configure terminal', rangeCmd, 'description range', 'exit',
    ]);
    test(`range variation accepted: ${rangeCmd}`, () => (
      d.runningConfig.interfaces['FastEthernet0/1'].description === 'range'
      && d.runningConfig.interfaces['FastEthernet0/3'].description === 'range'
    ));
  }
}

console.log(`\n${passed} tests passed`);
