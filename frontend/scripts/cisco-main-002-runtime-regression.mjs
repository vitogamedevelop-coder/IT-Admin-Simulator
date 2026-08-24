import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const {
  startMainMission,
  getMainMissionProgress,
  executeMissionCommand,
  loadActiveMainMission,
} = await import('../src/lib/missionV2.js');

const MISSION_ID = 'cisco-main-002';

function assertAccessPortsGreen(state, label) {
  const progress = getMainMissionProgress(state);
  const personal = progress.checks.find((c) => c.id === 'personal_port');
  const buchhaltung = progress.checks.find((c) => c.id === 'buchhaltung_port');
  assert(personal.ok, `${label}: Fa0/1 Access VLAN 10 must be green`);
  assert(buchhaltung.ok, `${label}: Fa0/2 Access VLAN 20 must be green`);
}

function assertAllGreen(state, label) {
  const progress = getMainMissionProgress(state);
  for (const c of progress.checks) {
    assert(c.ok, `${label}: requirement ${c.id} must be green`);
  }
}

// Test A: pre-configured ports are accepted as soon as the running config state is correct.
{
  const state = startMainMission(MISSION_ID, 12345);
  const rc = state.device.runningConfig;
  const fa1 = rc.interfaces['FastEthernet0/1'];
  const fa2 = rc.interfaces['FastEthernet0/2'];

  fa1.switchportMode = 'access';
  fa1.accessVlan = 10;
  fa1.administrativelyDown = false;

  fa2.switchportMode = 'access';
  fa2.accessVlan = 20;
  fa2.administrativelyDown = false;

  rc.vlans[10] = { id: 10, name: 'PERSONAL' };
  rc.vlans[20] = { id: 20, name: 'BUCHHALTUNG' };
  rc.vlans[999] = { id: 999, name: 'UNUSED' };

  const uplink = rc.interfaces['GigabitEthernet0/1'];
  uplink.switchportMode = 'trunk';
  uplink.trunkAllowedVlans = [10, 20];
  uplink.administrativelyDown = false;

  for (const id of ['FastEthernet0/3', 'FastEthernet0/4', 'FastEthernet0/5', 'FastEthernet0/6', 'FastEthernet0/7', 'FastEthernet0/8']) {
    const iface = rc.interfaces[id];
    iface.switchportMode = 'access';
    iface.accessVlan = 999;
    iface.administrativelyDown = true;
  }

  state.showCommandsUsed = ['do show vlan brief'];
  state.device.startupConfig = JSON.parse(JSON.stringify(state.device.runningConfig));

  assertAccessPortsGreen(state, 'Pre-configured');
  assertAllGreen(state, 'Pre-configured all');
}

// Test B: manual reconfiguration works and remains green after save/reload.
{
  let state = startMainMission(MISSION_ID, 12346);
  const commands = [
    'enable',
    'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    'vlan 999', 'name UNUSED', 'exit',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'no shutdown', 'exit',
    'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'no shutdown', 'exit',
    'interface range fa0/3 - 8', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface gi0/1', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20', 'no shutdown', 'exit',
    'do show vlan brief',
    'do write',
  ];
  for (const cmd of commands) {
    const result = executeMissionCommand(state, cmd);
    assert(!result.error, `Command "${cmd}" failed: ${result.error}`);
    state = result.state;
  }
  assertAccessPortsGreen(state, 'Manual config');

  state = loadActiveMainMission(MISSION_ID);
  assert(state, 'Mission should reload from localStorage');
  assertAccessPortsGreen(state, 'After reload');
}

// Test C: persistence via all supported save commands from configuration modes.
for (const saveCmd of ['do write', 'do wr', 'do write memory', 'do copy running-config startup-config']) {
  let state = startMainMission(MISSION_ID, 12347);
  const base = [
    'enable',
    'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    'vlan 999', 'name UNUSED', 'exit',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'no shutdown', 'exit',
    'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'no shutdown', 'exit',
    'interface range fa0/3 - 8', 'switchport mode access', 'switchport access vlan 999', 'shutdown', 'exit',
    'interface gi0/1', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20', 'no shutdown', 'exit',
    'do show running-config',
    saveCmd,
  ];
  for (const cmd of base) {
    const result = executeMissionCommand(state, cmd);
    assert(!result.error, `Save test "${saveCmd}" command "${cmd}" failed: ${result.error}`);
    state = result.state;
  }
  const progress = getMainMissionProgress(state);
  const saved = progress.checks.find((c) => c.id === 'saved');
  assert(saved.ok, `Save command "${saveCmd}" should persist config (saved green)`);
}

// Test D: save from an interface configuration submode.
{
  let state = startMainMission(MISSION_ID, 12348);
  const commands = [
    'enable',
    'configure terminal',
    'vlan 10', 'name PERSONAL', 'exit',
    'vlan 20', 'name BUCHHALTUNG', 'exit',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'no shutdown',
    'do write',
    'exit',
    'do show running-config',
  ];
  for (const cmd of commands) {
    const result = executeMissionCommand(state, cmd);
    assert(!result.error, `Interface save command "${cmd}" failed: ${result.error}`);
    state = result.state;
  }
  assert(state.device.startupConfig !== null, 'do write from interface mode must set startupConfig');
  assert.deepStrictEqual(state.device.startupConfig, state.device.runningConfig, 'startupConfig must equal runningConfig after do write');
}

console.log('cisco-main-002 runtime regression: PASS');
