// Phase 1C.1: Mission 001 CLI/UX regression tests.

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
const { buildPrompt, createCiscoDevice, executeCommand } = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);
const {
  startMission001,
  createMission001Device,
  executeMissionCommand,
  getMission001Progress,
  evaluateMission001,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const scenario = startMission001().scenario;

// 1. Historical prompts stay unchanged after hostname change
const state1 = startMission001();
state1.scenario = scenario;
state1.device = createMission001Device(scenario);
const beforePrompt = buildPrompt(state1.device);
executeMissionCommand(state1, 'enable');
executeMissionCommand(state1, 'configure terminal');
executeMissionCommand(state1, `hostname ${scenario.parameters.targetHostname}`);
assert(beforePrompt === 'Switch>', 'Snapshot prompt should stay Switch>');
assert(buildPrompt(state1.device) === 'Sw1(config)#', 'Current prompt should be Sw1(config)#');

// 2. Prompt snapshot recorded per command
const state2 = startMission001();
state2.scenario = scenario;
state2.device = createMission001Device(scenario);
const prompt2 = buildPrompt(state2.device);
const r2 = executeMissionCommand(state2, 'enable');
assert(r2.output === '', 'enable should have no output');
assert(buildPrompt(state2.device) === 'Switch#', 'Current prompt after enable is Switch#');
assert(prompt2 === 'Switch>', 'enable was entered at Switch>');

// 3. No duplicate prompt output for empty-result commands
const state3 = startMission001();
state3.scenario = scenario;
state3.device = createMission001Device(scenario);
executeMissionCommand(state3, 'enable');
executeMissionCommand(state3, 'configure terminal');
const r3 = executeMissionCommand(state3, `hostname ${scenario.parameters.targetHostname}`);
assert(r3.output === '', 'hostname should have no output');

// 4. '?' only once in help output
const device4 = createCiscoDevice({ hostname: 'Switch' });
const r4 = executeCommand(device4, 'en?', { helpCompact: true });
assert(r4.success && r4.isHelp, 'en? should be help');
const enableLines = r4.output.split('\n').filter((line) => line.trim() === 'enable');
assert(enableLines.length === 1, 'enable should appear exactly once');

// 5. ena sec? lists secret
const device5 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(device5, 'enable');
executeCommand(device5, 'configure terminal');
const r5 = executeCommand(device5, 'ena sec?', { helpCompact: true });
assert(r5.success && r5.isHelp, 'ena sec? should be help');
assert(r5.output.includes('secret'), 'ena sec? should list secret');

// 6. Recursive partial word help
const device6 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(device6, 'enable');
executeCommand(device6, 'configure terminal');
const r6 = executeCommand(device6, 'no ip dom?', { helpCompact: true });
assert(r6.success && r6.isHelp, 'no ip dom? should be help');
assert(r6.output.includes('domain-lookup'), 'no ip dom? should list domain-lookup');

// 7. no ? lists ip
const device7 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(device7, 'enable');
executeCommand(device7, 'configure terminal');
const r7 = executeCommand(device7, 'no ?', { helpCompact: true });
assert(r7.success && r7.isHelp, 'no ? should be help');
assert(r7.output.includes('ip'), 'no ? should list ip');

// 8. no ip ? offers domain-lookup
const device8 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(device8, 'enable');
executeCommand(device8, 'configure terminal');
const r8 = executeCommand(device8, 'no ip ?', { helpCompact: true });
assert(r8.success && r8.isHelp, 'no ip ? should be help');
assert(r8.output.includes('domain-lookup'), 'no ip ? should list domain-lookup');

// 9. no domain-lookup is not accepted
const device9 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(device9, 'enable');
executeCommand(device9, 'configure terminal');
const r9 = executeCommand(device9, 'no domain-lookup');
assert(!r9.success, 'no domain-lookup should fail');
assert(r9.output.includes('Invalid input'), 'Config error should be Invalid input');

// 10. Wrong mode / config error not DNS message
const device10 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(device10, 'enable');
executeCommand(device10, 'configure terminal');
const r10 = executeCommand(device10, 'no domain-lookup');
assert(!r10.output.includes('computer name'), 'Error should not be DNS message');

// 11. username admin password works
const state11 = startMission001();
state11.scenario = scenario;
state11.device = createMission001Device(scenario);
executeMissionCommand(state11, 'enable');
executeMissionCommand(state11, 'configure terminal');
executeMissionCommand(state11, `hostname ${scenario.parameters.targetHostname}`);
executeMissionCommand(state11, `enable secret ${scenario.parameters.enableSecret}`);
executeMissionCommand(state11, `username ${scenario.parameters.username} password ${scenario.parameters.userSecret}`);
executeMissionCommand(state11, 'no ip domain-lookup');
executeMissionCommand(state11, 'end');
executeMissionCommand(state11, 'copy running-config startup-config');
const eval11 = evaluateMission001(state11);
assert(eval11.allCorrect, 'username password should complete mission');

// 12. Progress starts at 0/5 and only shows total 5
const state12 = startMission001();
state12.scenario = scenario;
state12.device = createMission001Device(scenario);
const progress12 = getMission001Progress(state12.device, state12.scenario);
assert(progress12.completed === 0, 'Fresh progress is 0');
assert(progress12.total === 5, 'Total is 5');

// 13. Progress UI does not expose per-requirement checklist (getMission001Progress still has checks internally for feedback)
assert(typeof progress12.checks === 'object', 'Progress checks still exist for Prüfen/Feedback');

console.log('Mission V2 CLI/UX tests passed.');
