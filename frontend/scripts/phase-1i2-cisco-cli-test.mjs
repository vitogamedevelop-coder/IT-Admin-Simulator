import assert from 'node:assert/strict';
import {
  createCiscoDevice,
  executeCommand,
  CLI_MODE,
  DEVICE_PROFILES,
  buildPrompt,
} from '../src/lib/ciscoCliEngine.js';

function withLocalStorage(fn) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.window = globalThis.window || { dispatchEvent: () => {} };
  try {
    fn();
  } finally {
    delete globalThis.localStorage;
  }
}

function enterGlobalConfig(device) {
  if (device.cli.mode === CLI_MODE.USER_EXEC) executeCommand(device, 'enable');
  if (device.cli.mode !== CLI_MODE.PRIVILEGED_EXEC && device.cli.mode !== CLI_MODE.USER_EXEC) executeCommand(device, 'end');
  executeCommand(device, 'configure terminal');
  assert.equal(device.cli.mode, CLI_MODE.GLOBAL_CONFIG);
}

withLocalStorage(() => {
  // Small switch profile exists and has expected ports
  const profile = DEVICE_PROFILES.catalyst_8fe_1ge;
  assert.ok(profile, 'Small switch profile exists');
  assert.ok(profile.interfaces.includes('FastEthernet0/8'), 'Has Fa0/8');
  assert.ok(profile.interfaces.includes('GigabitEthernet0/1'), 'Has Gi0/1');
  assert.equal(profile.interfaces.length, 9, '8 FastEthernet + 1 GigabitEthernet');

  const device = createCiscoDevice({ profile: 'catalyst_8fe_1ge', hostname: 'Sw2' });
  assert.equal(device.cli.mode, CLI_MODE.USER_EXEC);

  // end from global config -> privileged exec
  enterGlobalConfig(device);
  executeCommand(device, 'end');
  assert.equal(device.cli.mode, CLI_MODE.PRIVILEGED_EXEC);
  assert.equal(buildPrompt(device), 'Sw2#');

  // exit from global config -> privileged exec
  enterGlobalConfig(device);
  executeCommand(device, 'exit');
  assert.equal(device.cli.mode, CLI_MODE.PRIVILEGED_EXEC);

  // exit from interface config -> global config
  enterGlobalConfig(device);
  executeCommand(device, 'interface fa0/1');
  assert.equal(device.cli.mode, CLI_MODE.INTERFACE_CONFIG);
  executeCommand(device, 'exit');
  assert.equal(device.cli.mode, CLI_MODE.GLOBAL_CONFIG);

  // end from interface config -> privileged exec
  executeCommand(device, 'interface fa0/1');
  executeCommand(device, 'end');
  assert.equal(device.cli.mode, CLI_MODE.PRIVILEGED_EXEC);

  // exit from vlan config -> global config
  enterGlobalConfig(device);
  executeCommand(device, 'vlan 10');
  assert.equal(device.cli.mode, CLI_MODE.VLAN_CONFIG);
  executeCommand(device, 'exit');
  assert.equal(device.cli.mode, CLI_MODE.GLOBAL_CONFIG);

  // vlan 20 from vlan config works (Packet-Tracer cross-config transition)
  executeCommand(device, 'vlan 10');
  executeCommand(device, 'vlan 20');
  assert.equal(device.cli.mode, CLI_MODE.VLAN_CONFIG);
  assert.equal(device.runningConfig.vlans[20].id, 20, 'VLAN 20 created');

  // do command preserves original config mode
  enterGlobalConfig(device);
  const beforeMode = device.cli.mode;
  const result = executeCommand(device, 'do show running-config');
  assert.ok(result.output.includes('hostname Sw2'), 'do show run produced output');
  assert.equal(device.cli.mode, beforeMode, 'do preserves config mode');

  // Interface range with spaces and comma-separated types
  executeCommand(device, 'interface range fa0/3 - 8, gi0/1');
  assert.equal(device.cli.mode, CLI_MODE.INTERFACE_RANGE_CONFIG);
  assert.deepEqual(device.cli.currentInterfaceRange.sort(), ['FastEthernet0/3', 'FastEthernet0/4', 'FastEthernet0/5', 'FastEthernet0/6', 'FastEthernet0/7', 'FastEthernet0/8', 'GigabitEthernet0/1'].sort(), 'Range expanded correctly');

  // Compact range syntax without spaces
  executeCommand(device, 'end');
  enterGlobalConfig(device);
  executeCommand(device, 'interface range fa0/3-8');
  assert.equal(device.cli.currentInterfaceRange.length, 6, 'Compact range expanded');

  // Invalid hardware port produces error
  executeCommand(device, 'end');
  enterGlobalConfig(device);
  const bad = executeCommand(device, 'interface range fa0/3-20');
  assert.equal(bad.success, false, 'Invalid range rejected');
});

console.log('Phase 1I.2 Cisco CLI Tests: OK');
