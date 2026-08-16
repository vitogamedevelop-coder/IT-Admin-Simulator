// Smoke test for Router-on-a-Stick CLI additions.
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
const { createCiscoDevice, executeCommand, evaluateRouterOnAStick } = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);

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

const device = createCiscoDevice({ profile: 'router_on_a_stick', hostname: 'Sw3' });

const scenario = {
  vlans: [
    { id: 10, name: 'PERSONAL', gateway: '192.168.10.1', mask: '255.255.255.0', accessPorts: ['FastEthernet0/1', 'FastEthernet0/2', 'FastEthernet0/3', 'FastEthernet0/4'] },
    { id: 20, name: 'TECHNIK', gateway: '192.168.20.1', mask: '255.255.255.0', accessPorts: ['FastEthernet0/5', 'FastEthernet0/6', 'FastEthernet0/7', 'FastEthernet0/8'] },
    { id: 30, name: 'VERWALTUNG', gateway: '192.168.30.1', mask: '255.255.255.0', accessPorts: ['FastEthernet0/9', 'FastEthernet0/10', 'FastEthernet0/11', 'FastEthernet0/12'] },
  ],
  uplinkPort: 'GigabitEthernet0/1',
  routerPhysicalPort: 'GigabitEthernet0/0',
};

test('router_on_a_stick profile has 26 physical interfaces', () => assert(Object.keys(device.runningConfig.interfaces).length === 26));

function run(cmds) {
  for (const cmd of cmds) {
    const r = executeCommand(device, cmd, { helpCompact: true });
    if (!r.success) throw new Error(`Command failed: ${cmd}\n${r.output}`);
  }
}

run([
  'enable',
  'configure terminal',
  'vlan 10', 'name PERSONAL', 'exit',
  'vlan 20', 'name TECHNIK', 'exit',
  'vlan 30', 'name VERWALTUNG', 'exit',
  'interface range fa0/1 - 4',
  'switchport mode access', 'switchport access vlan 10', 'no shutdown', 'exit',
  'interface range fa0/5 - 8',
  'switchport mode access', 'switchport access vlan 20', 'no shutdown', 'exit',
  'interface range fa0/9 - 12',
  'switchport mode access', 'switchport access vlan 30', 'no shutdown', 'exit',
  'interface gi0/1',
  'switchport mode trunk', 'no shutdown', 'exit',
  'interface gi0/0',
  'no shutdown', 'exit',
  'interface gi0/0.10',
  'encapsulation dot1q 10',
  'ip address 192.168.10.1 255.255.255.0',
  'no shutdown', 'exit',
  'interface gi0/0.20',
  'encapsulation dot1q 20',
  'ip address 192.168.20.1 255.255.255.0',
  'no shutdown', 'exit',
  'interface gi0/0.30',
  'encapsulation dot1q 30',
  'ip address 192.168.30.1 255.255.255.0',
  'no shutdown', 'exit',
  'end',
  'copy running-config startup-config',
]);

test('subinterfaces created', () => {
  assert(device.runningConfig.interfaces['GigabitEthernet0/0.10']?.type === 'subinterface');
  assert(device.runningConfig.interfaces['GigabitEthernet0/0.20']?.type === 'subinterface');
  assert(device.runningConfig.interfaces['GigabitEthernet0/0.30']?.type === 'subinterface');
});

test('encapsulation and IP set on subinterfaces', () => {
  assert(device.runningConfig.interfaces['GigabitEthernet0/0.10'].encapsulationVlan === 10);
  assert(device.runningConfig.interfaces['GigabitEthernet0/0.10'].ipv4 === '192.168.10.1');
});

test('simulation reports allCorrect', () => {
  const result = evaluateRouterOnAStick(device, scenario);
  console.log('checks:', result.checks.map((c) => `${c.id}=${c.ok}`).join(', '));
  assert(result.allCorrect, JSON.stringify(result.checks));
});

const broken = createCiscoDevice({ profile: 'router_on_a_stick', hostname: 'Sw3' });

function runBroken(cmds) {
  for (const cmd of cmds) {
    const r = executeCommand(broken, cmd, { helpCompact: true });
    if (!r.success) throw new Error(`Command failed: ${cmd}\n${r.output}`);
  }
}

runBroken([
  'enable', 'configure terminal',
  'vlan 10', 'name PERSONAL', 'exit',
  'interface range fa0/1 - 4', 'switchport mode access', 'switchport access vlan 10', 'no shutdown', 'exit',
  'interface gi0/1', 'switchport mode trunk', 'no shutdown', 'exit',
  'interface gi0/0', 'no shutdown', 'exit',
  'interface gi0/0.10', 'encapsulation dot1q 10', 'ip address 192.168.10.1 255.255.255.0', 'shutdown', 'exit',
  'end', 'copy running-config startup-config',
]);

const scenarioSingle = {
  vlans: [{ id: 10, name: 'PERSONAL', gateway: '192.168.10.1', mask: '255.255.255.0', accessPorts: ['FastEthernet0/1', 'FastEthernet0/2', 'FastEthernet0/3', 'FastEthernet0/4'] }],
  uplinkPort: 'GigabitEthernet0/1',
  routerPhysicalPort: 'GigabitEthernet0/1',
};

test('shutdown subinterface breaks reachability', () => {
  const result = evaluateRouterOnAStick(broken, scenarioSingle);
  assert(!result.allCorrect);
  const subCheck = result.checks.find((c) => c.id === 'subinterface_10');
  assert(!subCheck.ok);
});

console.log(`\n${passed} tests passed`);
