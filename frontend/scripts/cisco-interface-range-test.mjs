// Phase 1F: Interface range tests.

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
  return result;
}

console.log('Interface range applies commands to all interfaces');
{
  const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge' });
  exec(device, 'enable');
  exec(device, 'configure terminal');
  exec(device, 'interface range fa0/1 - 4');
  exec(device, 'switchport mode access');
  exec(device, 'switchport access vlan 10');
  exec(device, 'end');

  for (let i = 1; i <= 4; i += 1) {
    const iface = device.runningConfig.interfaces[`FastEthernet0/${i}`];
    test(`Fa0/${i} is access vlan 10`, () => {
      assert(iface.switchportMode === 'access');
      assert(iface.accessVlan === 10);
    });
  }
  test('Fa0/5 is untouched', () => {
    const iface = device.runningConfig.interfaces['FastEthernet0/5'];
    assert(iface.switchportMode !== 'access');
    assert(iface.accessVlan !== 10);
  });
}

console.log('\nInterface range with full interface names');
{
  const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge' });
  exec(device, 'enable');
  exec(device, 'configure terminal');
  exec(device, 'interface range fastethernet0/5 - 8');
  exec(device, 'shutdown');
  exec(device, 'end');

  for (let i = 5; i <= 8; i += 1) {
    test(`Fa0/${i} is shutdown`, () => {
      assert(device.runningConfig.interfaces[`FastEthernet0/${i}`].administrativelyDown === true);
    });
  }
}

console.log('\nInvalid ranges are rejected');
{
  const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge' });
  exec(device, 'enable');
  exec(device, 'configure terminal');
  const invalid = executeCommand(device, 'interface range fa0/23 - 25', { helpCompact: true });
  test('Fa0/25 out of profile range rejected', () => assert(!invalid.success));

  const mixed = executeCommand(device, 'interface range fa0/1 - gi0/2', { helpCompact: true });
  test('mixed interface types rejected', () => assert(!mixed.success));
}

console.log(`\n${passed} tests passed`);
