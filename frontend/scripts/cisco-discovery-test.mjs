// Phase 1F: Discovery / show command tests.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

const { pathToFileURL } = await import('node:url');

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {}, speechSynthesis: null };

const { createCiscoDevice, executeCommand } = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);

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

function exec(device, cmd) {
  const result = executeCommand(device, cmd, { helpCompact: true });
  if (!result.success) throw new Error(`Command failed: ${cmd}\n${result.output}`);
  return result.output;
}

console.log('show running-config reflects device profile');
{
  const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge' });
  exec(device, 'enable');
  const output = exec(device, 'show running-config');
  test('contains FastEthernet0/1', () => assert(output.includes('FastEthernet0/1')));
  test('contains FastEthernet0/24', () => assert(output.includes('FastEthernet0/24')));
  test('contains GigabitEthernet0/1', () => assert(output.includes('GigabitEthernet0/1')));
  test('contains GigabitEthernet0/2', () => assert(output.includes('GigabitEthernet0/2')));
  test('does not contain FastEthernet0/25', () => assert(!output.includes('FastEthernet0/25')));
}

console.log('\nshow vlan brief lists VLANs and ports');
{
  const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge' });
  exec(device, 'enable');
  exec(device, 'configure terminal');
  exec(device, 'vlan 10');
  exec(device, 'name PERSONAL');
  exec(device, 'exit');
  exec(device, 'interface range fa0/1 - 4');
  exec(device, 'switchport mode access');
  exec(device, 'switchport access vlan 10');
  exec(device, 'end');

  const output = exec(device, 'show vlan brief');
  test('shows VLAN 10 PERSONAL', () => {
    assert(output.includes('10'));
    assert(output.includes('PERSONAL'));
  });
  test('shows Fa0/1 under VLAN 10', () => assert(output.includes('Fa0/1')));
  test('shows default VLAN 1', () => assert(output.includes('1')));
}

console.log('\nshow interfaces status is dynamic');
{
  const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge' });
  device.runningConfig.interfaces['FastEthernet0/1'].operationalStatus = 'connected';
  device.runningConfig.interfaces['FastEthernet0/2'].operationalStatus = 'notconnect';
  device.runningConfig.interfaces['FastEthernet0/3'].administrativelyDown = true;
  device.runningConfig.interfaces['GigabitEthernet0/1'].operationalStatus = 'connected';

  exec(device, 'enable');
  const output = exec(device, 'show interfaces status');
  test('has Port header', () => assert(output.includes('Port')));
  test('contains Fa0/1', () => assert(output.includes('Fa0/1')));
  test('contains Gi0/1', () => assert(output.includes('Gi0/1')));
  test('contains Fa0/2', () => assert(output.includes('Fa0/2')));
  test('contains Fa0/3', () => assert(output.includes('Fa0/3')));
}

console.log(`\n${passed} tests passed`);
