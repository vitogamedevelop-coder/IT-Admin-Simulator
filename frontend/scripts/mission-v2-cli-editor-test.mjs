// Phase 1C.2: Mission 001 CLI editor / help & error fidelity tests.

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
const {
  createCiscoDevice,
  executeCommand,
  getCommandHelp,
  CLI_ERROR,
} = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);
const {
  startMission001,
  createMission001Device,
  executeMissionCommand,
  getMission001Progress,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const scenario = startMission001().scenario;

// 1. getCommandHelp for no ? keeps input "no "
const d1 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(d1, 'enable');
executeCommand(d1, 'configure terminal');
let help = getCommandHelp(d1, 'no ?', { helpCompact: true });
assert(help.isHelp, 'no ? should be help');
assert(help.help.includes('ip'), 'no ? should list ip');
assert(help.inputAfterHelp === 'no ', 'inputAfterHelp should preserve trailing space: "no "');

// 2. getCommandHelp for no ip ? keeps input "no ip "
help = getCommandHelp(d1, 'no ip ?', { helpCompact: true });
assert(help.isHelp, 'no ip ? should be help');
assert(help.help.includes('domain-lookup'), 'no ip ? should list domain-lookup');
assert(help.inputAfterHelp === 'no ip ', 'inputAfterHelp should be "no ip "');

// 3. getCommandHelp for no ip dom? keeps input "no ip dom"
help = getCommandHelp(d1, 'no ip dom?', { helpCompact: true });
assert(help.isHelp, 'no ip dom? should be help');
assert(help.help.includes('domain-lookup'), 'no ip dom? should list domain-lookup');
assert(help.inputAfterHelp === 'no ip dom', 'inputAfterHelp should be "no ip dom"');

// 4. getCommandHelp for ena sec? keeps input "ena sec"
help = getCommandHelp(d1, 'ena sec?', { helpCompact: true });
assert(help.isHelp, 'ena sec? should be help');
assert(help.help.includes('secret'), 'ena sec? should list secret');
assert(help.inputAfterHelp === 'ena sec', 'inputAfterHelp should be "ena sec"');

// 5. Help does not change device state
const d2 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(d2, 'enable');
executeCommand(d2, 'configure terminal');
const before = d2.runningConfig.noIpDomainLookup;
getCommandHelp(d2, 'no ip domain-lookup?', { helpCompact: true });
assert(d2.runningConfig.noIpDomainLookup === before, 'Help should not change device state');

// 6. Help does not increase mission progress
const state = startMission001();
state.scenario = scenario;
state.device = createMission001Device(scenario);
const beforeProgress = getMission001Progress(state.device, state.scenario).completed;
executeMissionCommand(state, 'no ip ?');
const afterProgress = getMission001Progress(state.device, state.scenario).completed;
assert(afterProgress === beforeProgress, 'Help should not increase mission progress');

// 7. '?' is not treated as a normal command by executeMissionCommand
const r = executeMissionCommand(state, 'no ip ?');
assert(r.isHelp, 'executeMissionCommand should return isHelp for ?');

// 8. Error marker for "not ip domain-lookup" points at "not"
const d3 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(d3, 'enable');
executeCommand(d3, 'configure terminal');
const rErr = executeCommand(d3, 'not ip domain-lookup');
assert(!rErr.success, 'not ip domain-lookup should fail');
assert(rErr.errorType === CLI_ERROR.UNKNOWN_COMMAND, 'should be UNKNOWN_COMMAND');
assert(rErr.output.includes('^'), 'error output should include caret');
const lines = rErr.output.split('\n');
const caretLine = lines.find((line) => line.trim() === '^');
const inputLine = lines.find((line) => line.startsWith('not'));
assert(caretLine && inputLine, 'error should have input and caret lines');
assert(lines.indexOf(caretLine) > lines.indexOf(inputLine), 'caret should be below input');
const caretPos = caretLine.indexOf('^');
const notPos = inputLine.indexOf('not');
assert(caretPos === notPos, `caret should align with "not" at ${notPos}, got ${caretPos}`);

// 9. Error marker for "no domain-lookup" points at "domain-lookup"
const rErr2 = executeCommand(d3, 'no domain-lookup');
assert(!rErr2.success, 'no domain-lookup should fail');
const lines2 = rErr2.output.split('\n');
const inputLine2 = lines2.find((line) => line.startsWith('no domain-lookup'));
const caretLine2 = lines2.find((line) => line.trim() === '^');
const domainPos = inputLine2.indexOf('domain-lookup');
const caretPos2 = caretLine2.indexOf('^');
assert(caretPos2 === domainPos, `caret should align with "domain-lookup" at ${domainPos}, got ${caretPos2}`);

// 10. Error marker for "ena foo" points at "foo"
const d4 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(d4, 'enable');
executeCommand(d4, 'configure terminal');
const rErr3 = executeCommand(d4, 'ena foo');
assert(!rErr3.success, 'ena foo should fail');
const lines3 = rErr3.output.split('\n');
const inputLine3 = lines3.find((line) => line.startsWith('ena foo'));
const caretLine3 = lines3.find((line) => line.trim() === '^');
const fooPos = inputLine3.indexOf('foo');
const caretPos3 = caretLine3.indexOf('^');
assert(caretPos3 === fooPos, `caret should align with "foo" at ${fooPos}, got ${caretPos3}`);

// 11. Invalid command in PRIVILEGED_EXEC uses EXEC-style error (no caret)
const d5 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(d5, 'enable');
const rErr4 = executeCommand(d5, 'copy foo startup-config');
assert(!rErr4.success, 'copy foo startup-config should fail');
assert(rErr4.output.includes('Unknown command'), 'EXEC mode should use Unknown command message');
assert(!rErr4.output.includes('^'), 'EXEC error should not include caret');

// 12. Incomplete command has no caret
const rErr5 = executeCommand(d3, 'hostname');
assert(!rErr5.success, 'hostname should fail incomplete');
assert(rErr5.errorType === CLI_ERROR.INCOMPLETE_COMMAND, 'should be INCOMPLETE_COMMAND');
assert(!rErr5.output.includes('^'), 'Incomplete command should not have caret');

// 13. write memory in GLOBAL_CONFIG is invalid
const d6 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(d6, 'enable');
executeCommand(d6, 'configure terminal');
const rWrGlobal = executeCommand(d6, 'write memory');
assert(!rWrGlobal.success, 'write memory in GLOBAL_CONFIG should fail');

// 14. write memory in PRIVILEGED_EXEC works
const d7 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(d7, 'enable');
const rWrPriv = executeCommand(d7, 'write memory');
assert(rWrPriv.success, 'write memory in PRIVILEGED_EXEC should succeed');
assert(d7.startupConfig !== null, 'write memory should save startup config');

// 15. copy running-config startup-config in GLOBAL_CONFIG is invalid
const rCopyGlobal = executeCommand(d6, 'copy running-config startup-config');
assert(!rCopyGlobal.success, 'copy run start in GLOBAL_CONFIG should fail');

// 16. copy running-config startup-config in PRIVILEGED_EXEC works
const d8 = createCiscoDevice({ hostname: 'Switch' });
executeCommand(d8, 'enable');
const rCopyPriv = executeCommand(d8, 'copy running-config startup-config');
assert(rCopyPriv.success, 'copy run start in PRIVILEGED_EXEC should succeed');
assert(d8.startupConfig !== null, 'copy should save startup config');

console.log('Mission V2 CLI editor tests passed.');
