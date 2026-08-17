// Phase 1J.3: Main Mission 003 – Remote Administration / SSH (Block 1.5).

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

const SOLUTION = [
  'enable', 'configure terminal',
  'vlan 172', 'name ADMIN', 'exit',
  'interface vlan 172', 'ip address 192.168.172.2 255.255.255.0', 'no shutdown', 'exit',
  'ip default-gateway 192.168.172.1',
  'ip domain-name nexus.local',
  'crypto key generate rsa', '1024',
  'ip ssh version 2',
  'line vty 0 15', 'login local', 'transport input ssh', 'exit',
  'end', 'show ip ssh', 'copy running-config startup-config',
];

console.log('Mission 003 scenario and device');
{
  storage.clear();
  const state = startMainMission(MISSION_003_ID, 12345);
  test('mission id is cisco-main-003', () => assert(state.missionId === MISSION_003_ID));
  test('hostname is SW-ADM-01', () => assert(state.device.hostname === 'SW-ADM-01'));
  test('local user already exists (Block 1 carry-over)', () => assert(Object.keys(state.device.runningConfig.users).length === 1));
  test('enable secret already set (Block 1 carry-over)', () => assert(!!state.device.runningConfig.enableSecret));
}

console.log('\nMission 003 success path');
{
  storage.clear();
  const state = startMainMission(MISSION_003_ID, 12345);
  for (const cmd of SOLUTION) {
    const result = executeMissionCommand(state, cmd);
    assert(result.success, `Command should succeed: ${cmd}\n${result.output}`);
  }
  const evaluation = evaluateMainMission(state);
  test('mission evaluates allCorrect', () => assert(evaluation.allCorrect === true, JSON.stringify(evaluation.checks)));
  test('mission state completed', () => assert(state.completed === true));
  test('all ten requirements are ok', () => assert(evaluation.checks.every((c) => c.ok), JSON.stringify(evaluation.checks)));
}

console.log('\nMission 003 failure cases');
{
  storage.clear();
  const state = startMainMission(MISSION_003_ID, 12345);
  test('crypto key refused without domain-name', () => {
    executeMissionCommand(state, 'enable');
    executeMissionCommand(state, 'configure terminal');
    const result = executeMissionCommand(state, 'crypto key generate rsa');
    assert(result.success, 'command itself is syntactically valid');
    assert(result.output.includes('domain'), `expected domain hint, got: ${result.output}`);
    assert(!state.device.runningConfig.cryptoKey.exists, 'no key should have been generated yet');
  });

  storage.clear();
  const state2 = startMainMission(MISSION_003_ID, 12346);
  const solutionWithoutTransportSsh = SOLUTION.filter((c) => c !== 'transport input ssh');
  for (const cmd of solutionWithoutTransportSsh) {
    const result = executeMissionCommand(state2, cmd);
    assert(result.success, `Command should succeed: ${cmd}\n${result.output}`);
  }
  const evalMissingTransport = evaluateMainMission(state2);
  test('missing transport input ssh fails vty_transport_ssh check', () => assert(!evalMissingTransport.checks.find((c) => c.id === 'vty_transport_ssh').ok));
  test('mission not allCorrect without transport input ssh', () => assert(!evalMissingTransport.allCorrect));

  storage.clear();
  const state3 = startMainMission(MISSION_003_ID, 12347);
  for (const cmd of ['enable', 'configure terminal', 'line vty 0 15', 'transport input telnet ssh', 'exit']) {
    executeMissionCommand(state3, cmd);
  }
  test('telnet still allowed on vty fails vty_transport_ssh check', () => {
    const evaluation = evaluateMainMission(state3);
    assert(!evaluation.checks.find((c) => c.id === 'vty_transport_ssh').ok);
  });

  storage.clear();
  const state4 = startMainMission(MISSION_003_ID, 12348);
  for (const cmd of ['enable', 'configure terminal', 'ip domain-name nexus.local', 'crypto key generate rsa', '512']) {
    executeMissionCommand(state4, cmd);
  }
  test('RSA modulus below 768 fails rsa_key check', () => {
    const evaluation = evaluateMainMission(state4);
    assert(!evaluation.checks.find((c) => c.id === 'rsa_key').ok);
  });
}

console.log(`\n${passed} tests passed`);
