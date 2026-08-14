// Phase 1C: Mission V2 routing and registry regression test.

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
const { questById, quests } = await import(pathToFileURL(join(srcDir, 'lib/questData.js')).href);
const { startMission001, loadActiveMission, executeMissionCommand, evaluateMission001, MISSION_001_ID } = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// 1. Legacy questData has at least the main V2 placeholder and the story gate placeholder.
assert(quests.length >= 1, 'Legacy questData should contain at least the main V2 placeholder');

// 2. Mission V2 has stable ID.
assert(MISSION_001_ID === 'cisco-main-001', 'Mission V2 ID stable');

// 3. Starting a mission V2 runtime creates a registered, resumable active mission.
const state = startMission001();
assert(state.missionId === MISSION_001_ID, 'Started mission has correct ID');
assert(state.scenario, 'Scenario exists');
assert(state.device, 'Device exists');
assert(state.startedAt, 'StartedAt set');
assert(state.device.hostname === 'Switch', 'Initial hostname is Switch');

// 4. Reload restores the same active mission.
const reloaded = loadActiveMission();
assert(reloaded, 'Active mission can be reloaded');
assert(reloaded.missionId === state.missionId, 'Reloaded mission ID matches');
assert(reloaded.scenario.seed === state.scenario.seed, 'Reloaded scenario seed matches');

// 5. Invalid mission ID does not create a valid mission.
storage.setItem('cyberlearn:active-main-mission-v1', JSON.stringify({ missionId: 'unknown-mission' }));
const invalid = loadActiveMission();
assert(invalid === null, 'Unknown mission ID returns null');
storage.removeItem('cyberlearn:active-mission-v1');

// 6. Complete a valid Layer-2 switch mission flow.
const full = startMission001();
const p = full.scenario.parameters;
const commands = [
  'enable',
  'configure terminal',
  `hostname ${p.targetHostname}`,
  `enable secret ${p.enableSecret}`,
  `username ${p.username} secret ${p.userSecret}`,
  'no ip domain-lookup',
  'end',
  'copy running-config startup-config',
];
for (const cmd of commands) {
  const result = executeMissionCommand(full, cmd);
  assert(result.success, `Command should succeed: ${cmd}`);
}
const evaluation = evaluateMission001(full);
assert(evaluation.allCorrect, 'Full configuration should evaluate correctly');
assert(full.completed, 'Mission state should be completed');

// 7. The registry route uses the same ID as the runtime.
const quest = questById(MISSION_001_ID);
assert(quest, 'Quest registry contains a placeholder for the mission so the UI can route');
assert(quest.id === MISSION_001_ID, 'Quest registry ID matches runtime ID');
assert(quest.title === 'Der erste Switch', 'Quest title matches mission title');

// 8. Legacy route /quest/cisco-main-001 does not require full legacy quest data.
const legacyQuest = questById('cisco-main-001-basic-configuration');
assert(!legacyQuest, 'Old mission ID should not be in legacy questData');

console.log('Mission V2 runtime routing tests passed.');
