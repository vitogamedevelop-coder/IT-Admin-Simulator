// Phase 1F: L2 Security Side Mission "Offene Türen".

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

// Seed a minimal localStorage stub for modules that read on import.
storage.setItem('it-learn:rpg-state-v1', JSON.stringify({ stateVersion: 8, completedQuests: [], completedCiscoSideMissions: [] }));

const { pathToFileURL } = await import('node:url');

const {
  generateSideMission004, createSide004Device, getSide004Progress,
} = await import(pathToFileURL(join(srcDir, 'lib/ciscoSideMissions.js')).href);
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

console.log('Side Mission 004 scenario and device');
{
  storage.clear();
  const scenario = generateSideMission004(12345);
  test('title is Offene Türen', () => assert(scenario.title === 'Offene Türen'));
  test('free ports are Fa0/5 to Fa0/24', () => {
    assert(scenario.parameters.freePorts.length === 20);
    assert(scenario.parameters.freePorts[0] === 'FastEthernet0/5');
    assert(scenario.parameters.freePorts[19] === 'FastEthernet0/24');
  });
  test('personal ports unchanged', () => assert(scenario.parameters.personalPorts.length === 4));
  test('uplink is Gi0/1', () => assert(scenario.parameters.uplinkPorts.includes('GigabitEthernet0/1')));

  const device = createSide004Device(scenario);
  test('VLAN 10 PERSONAL exists', () => assert(device.runningConfig.vlans[10]?.name === 'PERSONAL'));
  test('personal ports are in VLAN 10', () => {
    for (const id of scenario.parameters.personalPorts) {
      assert(device.runningConfig.interfaces[id].accessVlan === 10);
    }
  });
}

console.log('\nSide Mission 004 success path');
{
  storage.clear();
  const scenario = generateSideMission004(12345);
  const device = createSide004Device(scenario);
  runCommands(device, [
    'configure terminal',
    'vlan 999',
    'name UNUSED',
    'exit',
    'interface range fa0/5 - 24',
    'switchport mode access',
    'switchport access vlan 999',
    'shutdown',
    'exit',
    'end',
    'show vlan brief',
    'copy running-config startup-config',
  ]);
  const progress = getSide004Progress(device, scenario);
  test('all checks pass', () => assert(progress.allCorrect === true, `checks: ${JSON.stringify(progress.checks)}`));
}

console.log('\nFailure cases');
{
  storage.clear();
  const scenario = generateSideMission004(12346);
  const device = createSide004Device(scenario);
  runCommands(device, [
    'configure terminal',
    'vlan 999', 'name UNUSED', 'exit',
    'interface range fa0/5 - 23',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'end', 'copy running-config startup-config',
  ]);
  const oneForgotten = getSide004Progress(device, scenario);
  test('one free port forgotten fails', () => assert(oneForgotten.allCorrect === false));

  storage.clear();
  const scenario2 = generateSideMission004(12347);
  const device2 = createSide004Device(scenario2);
  runCommands(device2, [
    'configure terminal',
    'vlan 999', 'name UNUSED', 'exit',
    'interface range fa0/5 - 24',
    'switchport mode access', 'switchport access vlan 999',
    'end', 'copy running-config startup-config',
  ]);
  const notShutdown = getSide004Progress(device2, scenario2);
  test('ports not shutdown fails', () => assert(notShutdown.allCorrect === false));

  storage.clear();
  const scenario3 = generateSideMission004(12348);
  const device3 = createSide004Device(scenario3);
  runCommands(device3, [
    'configure terminal',
    'vlan 999', 'name UNUSED', 'exit',
    'interface range fa0/5 - 24',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'end',
    'configure terminal',
    'interface fa0/1',
    'switchport access vlan 999',
    'shutdown',
    'end',
    'copy running-config startup-config',
  ]);
  const personalHit = getSide004Progress(device3, scenario3);
  test('personal port damaged fails', () => assert(personalHit.allCorrect === false));

  storage.clear();
  const scenario4 = generateSideMission004(12349);
  const device4 = createSide004Device(scenario4);
  runCommands(device4, [
    'configure terminal',
    'vlan 999', 'name UNUSED', 'exit',
    'interface range fa0/5 - 24',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'end',
    'configure terminal',
    'interface gi0/1',
    'shutdown',
    'end',
    'copy running-config startup-config',
  ]);
  const uplinkDown = getSide004Progress(device4, scenario4);
  test('uplink shutdown fails', () => assert(uplinkDown.allCorrect === false));

  storage.clear();
  const scenario5 = generateSideMission004(12350);
  const device5 = createSide004Device(scenario5);
  runCommands(device5, [
    'configure terminal',
    'vlan 999', 'name UNUSED', 'exit',
    'interface range fa0/5 - 24',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'end',
    'configure terminal',
    'interface gi0/1',
    'switchport mode access', 'switchport access vlan 999',
    'end',
    'copy running-config startup-config',
  ]);
  const uplinkParked = getSide004Progress(device5, scenario5);
  test('uplink in parking VLAN fails', () => assert(uplinkParked.allCorrect === false));

  storage.clear();
  const scenario6 = generateSideMission004(12351);
  const device6 = createSide004Device(scenario6);
  runCommands(device6, [
    'configure terminal',
    'vlan 999', 'name UNUSED', 'exit',
    'interface fa0/5',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/6',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/7',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/8',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/9',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/10',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/11',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/12',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/13',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/14',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/15',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/16',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/17',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/18',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/19',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/20',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/21',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/22',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/23',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface fa0/24',
    'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'end',
    'copy running-config startup-config',
  ]);
  const single = getSide004Progress(device6, scenario6);
  test('individual interface config succeeds', () => assert(single.allCorrect === true, `checks: ${JSON.stringify(single.checks)}`));
}

console.log(`\n${passed} tests passed`);
