// Phase 1J.3 prep tests:
// 1. Interface single-letter aliases (g0/1, f0/1, ...)
// 2. Show/Do commands are normalized to canonical resolvedCommand for verification.

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

const { createCiscoDevice, executeCommand } = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);
const { startMainMission, executeMissionCommand, evaluateMainMission, MISSION_002_ID } = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);

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
function assert(condition, message) { if (!condition) throw new Error(message); }

console.log('Interface single-letter aliases');
{
  const d = createCiscoDevice({ profile: 'catalyst_8fe_1ge', hostname: 'Sw2' });
  executeCommand(d, 'enable');
  executeCommand(d, 'configure terminal');
  const r1 = executeCommand(d, 'interface g0/1');
  assert(r1.success && d.cli.currentInterface === 'GigabitEthernet0/1', `g0/1: ${r1.success} ${d.cli.currentInterface}`);
  const r2 = executeCommand(d, 'interface f0/1');
  assert(r2.success && d.cli.currentInterface === 'FastEthernet0/1', `f0/1: ${r2.success} ${d.cli.currentInterface}`);
  const r3 = executeCommand(d, 'interface range f0/3 - 8');
  assert(r3.success && d.cli.currentInterfaceRange?.length === 6, `range f0/3 - 8: ${r3.success} ${JSON.stringify(d.cli.currentInterfaceRange)}`);
  test('g0/1 resolves to GigabitEthernet0/1', () => {});
  test('f0/1 resolves to FastEthernet0/1', () => {});
  test('interface range f0/3 - 8 works', () => {});
}

console.log('\nShow/Do command canonical normalization');
{
  storage.clear();
  const state = startMainMission(MISSION_002_ID, 11111);
  ['enable', 'configure terminal'].forEach((c) => executeMissionCommand(state, c));
  const r1 = executeMissionCommand(state, 'do sho run');
  assert(r1.success, 'do sho run should succeed');
  assert(state.showCommandsUsed.includes('do show running-config'), `expected do show running-config, got ${state.showCommandsUsed}`);
  const r2 = executeMissionCommand(state, 'do sh vlan br');
  assert(r2.success, 'do sh vlan br should succeed');
  assert(state.showCommandsUsed.includes('do show vlan brief'), `expected do show vlan brief, got ${state.showCommandsUsed}`);
  const progress = evaluateMainMission(state);
  assert(progress.checks.find((c) => c.id === 'verified').ok, 'verified should pass after normalized do show commands');
  test('do sho run is canonicalized and stored as do show running-config', () => {});
  test('do sh vlan br is canonicalized and stored as do show vlan brief', () => {});
  test('verified passes without HM2 special logic', () => {});
}

console.log(`\n${passed} tests passed`);
