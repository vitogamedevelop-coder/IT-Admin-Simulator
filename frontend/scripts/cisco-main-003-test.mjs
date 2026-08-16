// Phase 1J: Main Mission 003 – Router-on-a-Stick / Inter-VLAN Routing.

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
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {}, speechSynthesis: null };

const { pathToFileURL } = await import('node:url');
const {
  MISSION_003_ID, startMainMission, evaluateMainMission, executeMissionCommand,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);

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

function buildSolution(state) {
  const p = state.scenario.parameters;
  const cmds = [
    'enable',
    'configure terminal',
  ];
  p.vlans.forEach((vlan) => {
    cmds.push(`vlan ${vlan.id}`, `name ${vlan.name}`, 'exit');
  });
  p.vlans.forEach((vlan) => {
    const startPort = vlan.accessPorts[0].split('/')[1];
    const endPort = vlan.accessPorts[vlan.accessPorts.length - 1].split('/')[1];
    cmds.push(`interface range fa0/${startPort} - ${endPort}`);
    cmds.push('switchport mode access', `switchport access vlan ${vlan.id}`, 'no shutdown', 'exit');
  });
  cmds.push(`interface ${p.uplinkPort.replace('GigabitEthernet', 'gi')}`);
  cmds.push('switchport mode trunk', 'switchport trunk allowed vlan ' + p.vlans.map((v) => v.id).join(','), 'no shutdown', 'exit');
  cmds.push(`interface ${p.routerPhysicalPort.replace('GigabitEthernet', 'gi')}`);
  cmds.push('no shutdown', 'exit');
  p.vlans.forEach((vlan) => {
    cmds.push(`interface ${p.routerPhysicalPort.replace('GigabitEthernet', 'gi')}.${vlan.id}`);
    cmds.push(`encapsulation dot1q ${vlan.id}`);
    cmds.push(`ip address ${vlan.gateway} ${vlan.mask}`);
    cmds.push('no shutdown', 'exit');
  });
  cmds.push('end', 'show ip interface brief', 'copy running-config startup-config');
  return cmds;
}

console.log('Mission 003 scenario and device');
{
  storage.clear();
  const state = startMainMission(MISSION_003_ID, 12345);
  test('mission id is cisco-main-003', () => assert(state.missionId === MISSION_003_ID));
  const p = state.scenario.parameters;
  test('three VLANs generated', () => assert(p.vlans.length === 3));
  test('VLAN IDs unique', () => assert(new Set(p.vlans.map((v) => v.id)).size === 3));
  test('department names unique', () => assert(new Set(p.vlans.map((v) => v.name)).size === 3));
  test('router physical interface initially shutdown', () => assert(state.device.runningConfig.interfaces[p.routerPhysicalPort].administrativelyDown === true));
  test('uplink is connected and not shutdown', () => assert(state.device.runningConfig.interfaces[p.uplinkPort].operationalStatus === 'connected' && !state.device.runningConfig.interfaces[p.uplinkPort].administrativelyDown));
  test('access ports are connected', () => assert(state.device.runningConfig.interfaces[p.vlans[0].accessPorts[0]].operationalStatus === 'connected'));
}

console.log('\nMission 003 success path');
{
  storage.clear();
  const state = startMainMission(MISSION_003_ID, 12345);
  const solution = buildSolution(state);
  for (const cmd of solution) {
    const result = executeMissionCommand(state, cmd);
    assert(result.success, `Command should succeed: ${cmd}\n${result.output}`);
  }
  const evaluation = evaluateMainMission(state);
  test('mission evaluates allCorrect', () => assert(evaluation.allCorrect === true, JSON.stringify(evaluation.checks)));
  test('mission state completed', () => assert(state.completed === true));
  test('all six requirements are ok', () => assert(evaluation.checks.every((c) => c.ok), JSON.stringify(evaluation.checks)));
}

console.log('\nMission 003 failure cases');
{
  storage.clear();
  const state = startMainMission(MISSION_003_ID, 12345);
  const p = state.scenario.parameters;
  // Set everything except router physical up
  for (const cmd of [
    'enable', 'configure terminal',
    ...p.vlans.flatMap((vlan) => [`vlan ${vlan.id}`, `name ${vlan.name}`, 'exit']),
    ...p.vlans.flatMap((vlan) => {
      const startPort = vlan.accessPorts[0].split('/')[1];
      const endPort = vlan.accessPorts[vlan.accessPorts.length - 1].split('/')[1];
      return [`interface range fa0/${startPort} - ${endPort}`, 'switchport mode access', `switchport access vlan ${vlan.id}`, 'no shutdown', 'exit'];
    }),
    `interface ${p.uplinkPort.replace('GigabitEthernet', 'gi')}`, 'switchport mode trunk', 'switchport trunk allowed vlan ' + p.vlans.map((v) => v.id).join(','), 'no shutdown', 'exit',
    ...p.vlans.flatMap((vlan) => [
      `interface ${p.routerPhysicalPort.replace('GigabitEthernet', 'gi')}.${vlan.id}`,
      `encapsulation dot1q ${vlan.id}`,
      `ip address ${vlan.gateway} ${vlan.mask}`,
      'no shutdown', 'exit',
    ]),
    'end', 'show ip interface brief', 'copy running-config startup-config',
  ]) {
    const result = executeMissionCommand(state, cmd);
    assert(result.success, `Command should succeed: ${cmd}\n${result.output}`);
  }
  const noPhys = evaluateMainMission(state);
  test('router physical down fails', () => assert(!noPhys.allCorrect));
  test('router_physical_up check fails', () => assert(noPhys.checks.find((c) => c.id === 'router_physical_up').ok === false));

  storage.clear();
  const state2 = startMainMission(MISSION_003_ID, 12346);
  const p2 = state2.scenario.parameters;
  // Correct everything but set wrong encapsulation VLAN on one subinterface
  const solution2 = buildSolution(state2);
  for (const cmd of solution2.slice(0, solution2.length - 1)) {
    const result = executeMissionCommand(state2, cmd);
    assert(result.success, `Command should succeed: ${cmd}\n${result.output}`);
  }
  const firstVlan = p2.vlans[0].id;
  const wrongVlan = firstVlan === 10 ? 99 : firstVlan - 1;
  executeMissionCommand(state2, 'configure terminal');
  executeMissionCommand(state2, `interface ${p2.routerPhysicalPort.replace('GigabitEthernet', 'gi')}.${firstVlan}`);
  executeMissionCommand(state2, `encapsulation dot1q ${wrongVlan}`);
  executeMissionCommand(state2, 'end');
  executeMissionCommand(state2, 'show ip interface brief');
  executeMissionCommand(state2, 'copy running-config startup-config');
  const wrongEncap = evaluateMainMission(state2);
  test('wrong encapsulation VLAN fails subinterface check', () => assert(!wrongEncap.checks.find((c) => c.id === 'subinterfaces').ok));
}

console.log(`\n${passed} tests passed`);
