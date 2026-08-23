const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const { startMainMission, getMainMissionProgress, evaluateMainMission, executeMissionCommand, loadActiveMainMission } = await import('../src/lib/missionV2.js');

const MISSION_ID = 'cisco-main-002';
let state = startMainMission(MISSION_ID, 12345);

const commands = [
  'enable',
  'configure terminal',
  'vlan 10',
  'name PERSONAL',
  'exit',
  'vlan 20',
  'name BUCHHALTUNG',
  'exit',
  'vlan 999',
  'name UNUSED',
  'exit',
  'interface fa0/1',
  'switchport mode access',
  'switchport access vlan 10',
  'no shutdown',
  'exit',
  'interface fa0/2',
  'switchport mode access',
  'switchport access vlan 20',
  'no shutdown',
  'exit',
  'interface range fa0/3 - 8',
  'switchport mode access',
  'switchport access vlan 999',
  'shutdown',
  'exit',
  'interface gi0/1',
  'switchport mode trunk',
  'switchport trunk allowed vlan 10,20',
  'no shutdown',
  'exit',
  'do show vlan brief',
  'do write',
];

for (const cmd of commands) {
  const result = executeMissionCommand(state, cmd);
  console.log(`> ${cmd}`);
  if (result.error) console.log('  error:', result.error);
  if (result.output) {
    const lines = result.output.split('\n').filter(Boolean).slice(0, 8);
    console.log('  output:', lines.join('\n  '));
  }
}

// Simulate UI reload from localStorage
state = loadActiveMainMission(MISSION_ID);

console.log('\n--- progress ---');
const progress = getMainMissionProgress(state);
console.log(JSON.stringify(progress.checks, null, 2));

console.log('\n--- interfaces ---');
for (const id of ['FastEthernet0/1', 'FastEthernet0/2', 'GigabitEthernet0/1']) {
  const iface = state.device.runningConfig.interfaces[id];
  console.log(id, iface);
}

console.log('\n--- evaluate ---');
const evaluation = evaluateMainMission(state);
console.log(JSON.stringify(evaluation.checks, null, 2));
console.log('allCorrect:', evaluation.allCorrect);
