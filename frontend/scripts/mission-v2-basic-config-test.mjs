// Phase 1B-1: Mission 001 "Grundkonfiguration" tests.

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
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const { pathToFileURL } = await import('node:url');
const {
  generateMission001Scenario,
  createMission001Device,
  mission001RequiredState,
  evaluateMission001State,
  startMission001,
  executeMissionCommand,
  evaluateMission001,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// 1. Scenario generation
const scenario = generateMission001Scenario(12345);
assert(scenario.missionId === 'cisco-main-001-basic-configuration', 'Mission ID should match');
assert(scenario.parameters.hostname, 'Hostname should be set');
assert(scenario.parameters.interface, 'Interface should be set');
assert(scenario.parameters.network.address, 'Network address should be set');
assert(scenario.parameters.username, 'Username should be set');

// 2. Device creation
const device = createMission001Device(scenario);
assert(device.hostname === 'Router', 'Initial hostname should be Router');
assert(device.cli.mode === 'USER_EXEC', 'Initial mode should be USER_EXEC');

// 3. Complete mission via CLI commands
const state = startMission001();
state.scenario = scenario;
state.device = device;

const cmds = [
  'enable',
  'configure terminal',
  `hostname ${scenario.parameters.hostname}`,
  'no ip domain-lookup',
  `enable secret ${scenario.parameters.enableSecret}`,
  `username ${scenario.parameters.username} secret ${scenario.parameters.password}`,
  `interface ${scenario.parameters.interface}`,
  `ip address ${scenario.parameters.network.address} ${scenario.parameters.network.mask}`,
  'no shutdown',
  `description ${scenario.parameters.description}`,
  'end',
  'copy running-config startup-config',
];

for (const cmd of cmds) {
  const result = executeMissionCommand(state, cmd);
  assert(result.success, `Command should succeed: ${cmd} -> ${result.output}`);
}

const evaluation = evaluateMission001(state);
assert(evaluation.allCorrect, 'Mission should be complete');
assert(state.completed, 'Mission state should be completed');
assert(state.device.startupConfig !== null, 'Startup config should exist');

// 4. Missing no shutdown is detected
const state2 = startMission001();
state2.scenario = scenario;
state2.device = createMission001Device(scenario);
const cmds2 = [
  'enable',
  'configure terminal',
  `hostname ${scenario.parameters.hostname}`,
  `interface ${scenario.parameters.interface}`,
  `ip address ${scenario.parameters.network.address} ${scenario.parameters.network.mask}`,
  'end',
  'copy running-config startup-config',
];
for (const cmd of cmds2) executeMissionCommand(state2, cmd);
const eval2 = evaluateMission001(state2);
assert(!eval2.allCorrect, 'Mission should be incomplete without no shutdown');
assert(eval2.misconceptions.includes('forgot_no_shutdown'), 'Should detect forgot_no_shutdown');

// 5. Wrong IP is detected
const state3 = startMission001();
state3.scenario = scenario;
state3.device = createMission001Device(scenario);
executeMissionCommand(state3, 'enable');
executeMissionCommand(state3, 'configure terminal');
executeMissionCommand(state3, `hostname ${scenario.parameters.hostname}`);
executeMissionCommand(state3, `interface ${scenario.parameters.interface}`);
executeMissionCommand(state3, `ip address 1.2.3.4 ${scenario.parameters.network.mask}`);
executeMissionCommand(state3, 'no shutdown');
executeMissionCommand(state3, 'end');
executeMissionCommand(state3, 'copy running-config startup-config');
const eval3 = evaluateMission001(state3);
assert(!eval3.allCorrect, 'Mission should be incomplete with wrong IP');

// 6. Config not saved is detected
const state4 = startMission001();
state4.scenario = scenario;
state4.device = createMission001Device(scenario);
const cmds4 = [
  'enable',
  'configure terminal',
  `hostname ${scenario.parameters.hostname}`,
  `interface ${scenario.parameters.interface}`,
  `ip address ${scenario.parameters.network.address} ${scenario.parameters.network.mask}`,
  'no shutdown',
  'end',
];
for (const cmd of cmds4) executeMissionCommand(state4, cmd);
const eval4 = evaluateMission001(state4);
assert(!eval4.allCorrect, 'Mission should be incomplete if not saved');
assert(eval4.misconceptions.includes('forgot_save_config'), 'Should detect forgot_save_config');

// 7. Replay produces different parameters
const scenarioA = generateMission001Scenario(11111);
const scenarioB = generateMission001Scenario(22222);
assert(
  scenarioA.parameters.hostname !== scenarioB.parameters.hostname
  || scenarioA.parameters.interface !== scenarioB.parameters.interface
  || scenarioA.parameters.network.address !== scenarioB.parameters.network.address,
  'Replay should produce a different scenario',
);

// 8. Required state matches scenario
const required = mission001RequiredState(scenario);
assert(required.hostname === scenario.parameters.hostname, 'Required hostname should match');
assert(required.interfaces[scenario.parameters.interface].ipv4 === scenario.parameters.network.address, 'Required IP should match');

console.log('Mission 001 basic configuration tests passed.');
