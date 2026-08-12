// Phase 1C: Mission 001 "Der erste Switch" tests.

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
  getMission001Progress,
  startMission001,
  executeMissionCommand,
  evaluateMission001,
  MISSION_001_ID,
  MISSION_001_REQUIREMENTS,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// 1. Scenario generation
const scenario = generateMission001Scenario(12345);
assert(scenario.missionId === MISSION_001_ID, 'Mission ID should match');
assert(scenario.deviceType === 'layer2_switch', 'Device type should be layer2_switch');
assert(scenario.initialHostname === 'Switch', 'Initial hostname should be Switch');
assert(scenario.parameters.targetHostname === 'Sw1', 'Target hostname should be Sw1');
assert(scenario.parameters.username === 'admin', 'Username should be admin');
assert(MISSION_001_REQUIREMENTS.length === 5, 'Mission should have exactly 5 requirements');

// 2. Device creation
const device = createMission001Device(scenario);
assert(device.hostname === 'Switch', 'Initial device hostname should be Switch');
assert(device.cli.mode === 'USER_EXEC', 'Initial mode should be USER_EXEC');
assert(device.type === 'layer2_switch', 'Device type should be layer2_switch');

// 3. Complete mission via CLI commands
const state = startMission001();
state.scenario = scenario;
state.device = device;

const cmds = [
  'enable',
  'configure terminal',
  `hostname ${scenario.parameters.targetHostname}`,
  `enable secret ${scenario.parameters.enableSecret}`,
  `username ${scenario.parameters.username} secret ${scenario.parameters.userSecret}`,
  'no ip domain-lookup',
  'end',
  'copy running-config startup-config',
];

for (const cmd of cmds) {
  const result = executeMissionCommand(state, cmd);
  assert(result.success, `Command should succeed: ${cmd} -> ${result.output}`);
}

const progress = getMission001Progress(state.device, state.scenario);
assert(progress.completed === 5, `Progress should be 5/5, got ${progress.completed}/5`);

const rawEval = evaluateMission001State(state.device, state.scenario);
assert(rawEval.allCorrect, 'evaluateMission001State should report complete');
assert(progress.allCorrect, 'All requirements should be fulfilled');

const evaluation = evaluateMission001(state);
assert(evaluation.allCorrect, 'Mission should be complete');
assert(state.completed, 'Mission state should be completed');
assert(state.device.startupConfig !== null, 'Startup config should exist');

// 4. Progress starts at 0/5
const fresh = startMission001();
const freshProgress = getMission001Progress(fresh.device, fresh.scenario);
assert(freshProgress.completed === 0, 'Fresh mission should start at 0/5');
assert(freshProgress.total === 5, 'Total should be 5');

// 5. Wrong hostname is detected
const state2 = startMission001();
state2.scenario = scenario;
state2.device = createMission001Device(scenario);
executeMissionCommand(state2, 'enable');
executeMissionCommand(state2, 'configure terminal');
executeMissionCommand(state2, 'hostname WrongName');
executeMissionCommand(state2, `enable secret ${scenario.parameters.enableSecret}`);
executeMissionCommand(state2, `username ${scenario.parameters.username} secret ${scenario.parameters.userSecret}`);
executeMissionCommand(state2, 'no ip domain-lookup');
executeMissionCommand(state2, 'end');
executeMissionCommand(state2, 'copy running-config startup-config');
const eval2 = evaluateMission001(state2);
assert(!eval2.allCorrect, 'Mission should be incomplete with wrong hostname');
assert(eval2.checks.find((c) => c.id === 'hostname').ok === false, 'Hostname check should fail');

// 6. Config not saved is detected
const state3 = startMission001();
state3.scenario = scenario;
state3.device = createMission001Device(scenario);
const cmds3 = [
  'enable',
  'configure terminal',
  `hostname ${scenario.parameters.targetHostname}`,
  `enable secret ${scenario.parameters.enableSecret}`,
  `username ${scenario.parameters.username} secret ${scenario.parameters.userSecret}`,
  'no ip domain-lookup',
  'end',
];
for (const cmd of cmds3) executeMissionCommand(state3, cmd);
const eval3 = evaluateMission001(state3);
assert(!eval3.allCorrect, 'Mission should be incomplete if not saved');
assert(eval3.misconceptions.includes('forgot_save_config'), 'Should detect forgot_save_config');

// 7. Double fulfillment does not increase progress beyond 5
const state4 = startMission001();
state4.scenario = scenario;
state4.device = device;
const eval4 = evaluateMission001(state4);
assert(eval4.completed === 5, 'Progress should stay 5 after re-evaluation');

// 8. Required state matches scenario
const required = mission001RequiredState(scenario);
assert(required.hostname === scenario.parameters.targetHostname, 'Required hostname should match target Sw1');
assert(required.users[scenario.parameters.username].secret === scenario.parameters.userSecret, 'Required user secret should match');

// 9. Replay produces different secrets
const scenarioA = generateMission001Scenario(11111);
const scenarioB = generateMission001Scenario(22222);
assert(
  scenarioA.parameters.enableSecret !== scenarioB.parameters.enableSecret
  || scenarioA.parameters.userSecret !== scenarioB.parameters.userSecret
  || scenarioA.seed !== scenarioB.seed,
  'Replay should produce a different scenario',
);

console.log('Mission 001 basic configuration tests passed.');
