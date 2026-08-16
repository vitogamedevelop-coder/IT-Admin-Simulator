// Phase 1J: Cisco CLI abbreviation system regression tests.
// Verifies that the command parser accepts Cisco-style unique prefixes,
// rejects ambiguous / invalid input, and works correctly across modes.

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
const { createCiscoDevice, executeCommand, CLI_MODE } = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);

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

function setupSwitch() {
  return createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: 'Sw2' });
}

console.log('Exact commands still work');
{
  const device = setupSwitch();
  test('enable enters privileged EXEC', () => {
    const r = executeCommand(device, 'enable');
    assert(r.success && device.cli.mode === CLI_MODE.PRIVILEGED_EXEC, `got: ${r.output}`);
  });

  const device2 = setupSwitch();
  executeCommand(device2, 'enable');
  const r = executeCommand(device2, 'configure terminal');
  test('configure terminal enters global config', () => assert(r.success && device2.cli.mode === CLI_MODE.GLOBAL_CONFIG));
}

console.log('\nUnique abbreviations accepted');
{
  const device = setupSwitch();
  executeCommand(device, 'en');
  test('"en" accepted as enable', () => assert(device.cli.mode === CLI_MODE.PRIVILEGED_EXEC));

  executeCommand(device, 'conf t');
  test('"conf t" accepted as configure terminal', () => assert(device.cli.mode === CLI_MODE.GLOBAL_CONFIG));

  executeCommand(device, 'int fa0/1');
  test('"int fa0/1" accepted as interface FastEthernet0/1', () => assert(device.cli.mode === CLI_MODE.INTERFACE_CONFIG && device.cli.currentInterface === 'FastEthernet0/1'));

  executeCommand(device, 'sw mo ac');
  test('"sw mo ac" accepted as switchport mode access', () => assert(device.runningConfig.interfaces['FastEthernet0/1'].switchportMode === 'access'));

  executeCommand(device, 'sw ac vl 10');
  test('"sw ac vl 10" accepted as switchport access vlan 10', () => assert(device.runningConfig.interfaces['FastEthernet0/1'].accessVlan === 10));

  executeCommand(device, 'end');
  executeCommand(device, 'sh ru');
  test('"sh ru" accepted as show running-config', () => assert(device.cli.mode === CLI_MODE.PRIVILEGED_EXEC));
}

console.log('\nExtremely short unique abbreviations accepted');
{
  const device = setupSwitch();
  executeCommand(device, 'enable');
  executeCommand(device, 'configure terminal');
  executeCommand(device, 'v 20');
  test('"v 20" accepted as vlan 20', () => assert(device.runningConfig.vlans[20]?.id === 20));

  executeCommand(device, 'exit');
  executeCommand(device, 'interface gi0/1');
  executeCommand(device, 'sw m t');
  test('"sw m t" accepted as switchport mode trunk', () => assert(device.runningConfig.interfaces['GigabitEthernet0/1'].switchportMode === 'trunk'));

  executeCommand(device, 'exit');
  executeCommand(device, 'interface fa0/4');
  executeCommand(device, 'sw m a');
  test('"sw m a" accepted as switchport mode access', () => assert(device.runningConfig.interfaces['FastEthernet0/4'].switchportMode === 'access'));

  executeCommand(device, 'exit');
  executeCommand(device, 'do sh vl b');
  test('"do sh vl b" accepted as do show vlan brief', () => assert(device.cli.mode === CLI_MODE.GLOBAL_CONFIG));
}

console.log('\nAmbiguous abbreviations rejected');
{
  const device = setupSwitch();
  executeCommand(device, 'enable');
  executeCommand(device, 'configure terminal');
  executeCommand(device, 'interface fa0/2');
  const r = executeCommand(device, 's');
  test('"s" rejected as ambiguous in interface config', () => assert(!r.success && r.errorType === 'AMBIGUOUS_COMMAND', `got: ${r.output}`));

  const device2 = setupSwitch();
  executeCommand(device2, 'enable');
  const r2 = executeCommand(device2, 'c');
  test('"c" rejected as ambiguous in privileged EXEC', () => assert(!r2.success && r2.errorType === 'AMBIGUOUS_COMMAND', `got: ${r2.output}`));
}

console.log('\nInvalid abbreviations rejected');
{
  const device = setupSwitch();
  executeCommand(device, 'enable');
  executeCommand(device, 'configure terminal');
  const r = executeCommand(device, 'xyz');
  test('"xyz" rejected as unknown in global config', () => assert(!r.success && r.errorType === 'UNKNOWN_COMMAND'));

  const device2 = setupSwitch();
  executeCommand(device2, 'enable');
  const r2 = executeCommand(device2, 'configure terminal');
  test('"configure terminal" rejected from privileged EXEC? no, accepted', () => assert(r2.success));
}

console.log('\nMode-sensitive resolution');
{
  const device = setupSwitch();
  executeCommand(device, 'enable');
  const r = executeCommand(device, 'hostname Foo');
  test('"hostname" rejected from privileged EXEC', () => assert(!r.success));

  executeCommand(device, 'configure terminal');
  const r2 = executeCommand(device, 'hostname Foo');
  test('"hostname" accepted in global config', () => assert(r2.success && device.hostname === 'Foo'));

  const device2 = setupSwitch();
  executeCommand(device2, 'enable');
  executeCommand(device2, 'configure terminal');
  executeCommand(device2, 'interface fa0/3');
  const r3 = executeCommand(device2, 'switchport mode access');
  test('switchport accepted in interface config', () => assert(r3.success));

  const device3 = setupSwitch();
  executeCommand(device3, 'enable');
  executeCommand(device3, 'configure terminal');
  const r4 = executeCommand(device3, 'switchport mode access');
  test('switchport rejected in global config', () => assert(!r4.success));
}

console.log(`\n${passed} tests passed`);
