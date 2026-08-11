// Phase 1A: Cisco IOS CLI Engine tests.
//
// Verifies modes, command tree, prefix abbreviation, context-sensitive help,
// device state, running/startup config, show commands and error handling.

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
const { createCiscoDevice, executeCommand, buildPrompt, completeInput, CLI_MODE, CLI_ERROR } = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function send(device, input, options) {
  return executeCommand(device, input, options);
}

// 1. CLI modes
const d1 = createCiscoDevice({ hostname: 'Router' });
assert(d1.cli.mode === CLI_MODE.USER_EXEC, 'Initial mode should be USER_EXEC');
assert(buildPrompt(d1) === 'Router>', 'Initial prompt should be Router>');

let r = send(d1, 'enable');
assert(r.success, 'enable should succeed');
assert(d1.cli.mode === CLI_MODE.PRIVILEGED_EXEC, 'enable should enter PRIVILEGED_EXEC');
assert(buildPrompt(d1) === 'Router#', 'Prompt should be Router#');

r = send(d1, 'configure terminal');
assert(r.success, 'configure terminal should succeed');
assert(d1.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'configure terminal should enter GLOBAL_CONFIG');
assert(buildPrompt(d1) === 'Router(config)#', 'Prompt should be Router(config)#');

r = send(d1, 'hostname R1');
assert(r.success, 'hostname should succeed');
assert(d1.hostname === 'R1', 'Hostname should be R1');
assert(buildPrompt(d1) === 'R1(config)#', 'Prompt should be R1(config)#');

r = send(d1, 'interface GigabitEthernet0/0');
assert(r.success, 'interface selection should succeed');
assert(d1.cli.mode === CLI_MODE.INTERFACE_CONFIG, 'Should enter INTERFACE_CONFIG');
assert(buildPrompt(d1) === 'R1(config-if)#', 'Prompt should be R1(config-if)#');

r = send(d1, 'exit');
assert(r.success, 'exit should succeed');
assert(d1.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'exit should go back to GLOBAL_CONFIG');

r = send(d1, 'end');
assert(r.success, 'end should succeed');
assert(d1.cli.mode === CLI_MODE.PRIVILEGED_EXEC, 'end should go to PRIVILEGED_EXEC');

// 2. Wrong mode rejection
const d2 = createCiscoDevice();
r = send(d2, 'configure terminal');
assert(!r.success, 'configure terminal should fail in USER_EXEC');
assert(r.errorType === CLI_ERROR.UNKNOWN_COMMAND, 'Error should be UNKNOWN_COMMAND');

// 3. Prefix abbreviation
const d3 = createCiscoDevice();
storage.clear();
executeCommand(d3, 'en');
assert(d3.cli.mode === CLI_MODE.PRIVILEGED_EXEC, 'en should expand to enable');

r = send(d3, 'conf t');
assert(r.success, 'conf t should expand to configure terminal');
assert(d3.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'conf t should enter GLOBAL_CONFIG');

// 4. Ambiguous abbreviation
const d4 = createCiscoDevice();
r = send(d4, 'enable');
assert(r.success, 'enable should succeed');
r = send(d4, 'co');
assert(!r.success && r.errorType === CLI_ERROR.AMBIGUOUS_COMMAND, 'co should be ambiguous in privileged EXEC');

// 5. No hardcoded alias table for conf t
const d5 = createCiscoDevice();
r = send(d5, 'enable');
assert(r.success, 'enable should succeed');
r = send(d5, 'conf term');
assert(r.success, 'conf term should succeed via generic prefix resolution');
assert(d5.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'conf term should enter GLOBAL_CONFIG');

// 6. Interface IP and no shutdown
const d6 = createCiscoDevice({ hostname: 'R1' });
storage.clear();
send(d6, 'enable');
send(d6, 'configure terminal');
send(d6, 'interface Gi0/0');
r = send(d6, 'ip address 192.168.1.1 255.255.255.0');
assert(r.success, 'ip address should succeed');
assert(d6.runningConfig.interfaces['GigabitEthernet0/0'].ipv4 === '192.168.1.1', 'IP should be saved');

r = send(d6, 'no shutdown');
assert(r.success, 'no shutdown should succeed');
assert(d6.runningConfig.interfaces['GigabitEthernet0/0'].administrativelyDown === false, 'Interface should be up');

// 7. Invalid IP rejection
r = send(d6, 'ip address 999.1.1.1 255.255.255.0');
assert(!r.success && r.errorType === CLI_ERROR.INVALID_ARGUMENT, 'Invalid IP should be rejected');

// 8. Running vs startup config
const d7 = createCiscoDevice({ hostname: 'R2' });
storage.clear();
send(d7, 'enable');
send(d7, 'configure terminal');
send(d7, 'hostname R2-DEVICE');
r = send(d7, 'end');
assert(r.success, 'end should succeed');
assert(d7.startupConfig === null, 'Startup config should be null before save');

r = send(d7, 'copy running-config startup-config');
assert(r.success, 'copy run start should succeed');
assert(d7.startupConfig !== null, 'Startup config should exist after save');
assert(d7.startupConfig.hostname === 'R2-DEVICE', 'Startup config should contain saved hostname');

send(d7, 'configure terminal');
send(d7, 'hostname R2-CHANGED');
send(d7, 'end');
assert(d7.runningConfig.hostname === 'R2-CHANGED', 'Running config should change');
assert(d7.startupConfig.hostname === 'R2-DEVICE', 'Startup config should remain unchanged');

// 9. Show commands reflect state
const d9 = createCiscoDevice({ hostname: 'R3' });
storage.clear();
send(d9, 'enable');
send(d9, 'configure terminal');
send(d9, 'interface Gi0/0');
send(d9, 'ip address 10.0.0.1 255.255.255.0');
send(d9, 'no shutdown');
send(d9, 'end');

r = send(d9, 'show ip interface brief');
assert(r.success, 'show ip interface brief should succeed');
assert(r.output.includes('10.0.0.1'), 'show ip interface brief should contain IP');
assert(r.output.includes('up'), 'show ip interface brief should reflect up state');

r = send(d9, 'show running-config');
assert(r.success, 'show running-config should succeed');
assert(r.output.includes('hostname R3'), 'show running-config should contain hostname');
assert(r.output.includes('ip address 10.0.0.1 255.255.255.0'), 'show running-config should contain IP');
assert(r.output.includes('no shutdown'), 'show running-config should contain no shutdown');

// 10. Context-sensitive ? help
const d10 = createCiscoDevice();
storage.clear();
send(d10, 'enable');
r = send(d10, '?', { helpCompact: true });
assert(r.success && r.isHelp, '? should be help');
assert(r.output.includes('configure'), 'Privileged EXEC ? should list configure');

r = send(d10, 'co?', { helpCompact: true });
assert(r.success && r.isHelp, 'co? should be help');
assert(r.output.includes('configure'), 'co? should list configure');
assert(r.output.includes('copy'), 'co? should list copy');

r = send(d10, 'configure ?', { helpCompact: true });
assert(r.success && r.isHelp, 'configure ? should be help');
assert(r.output.includes('terminal'), 'configure ? should list terminal');

r = send(d10, 'en?', { helpCompact: true });
assert(r.success && r.isHelp, 'en? should be help');

r = send(d10, 'en ?', { helpCompact: true });
assert(r.success && r.isHelp, 'en ? should be help');

// 11. Tab completion
const d11 = createCiscoDevice();
storage.clear();
send(d11, 'enable');
let completion = completeInput(d11, 'conf');
assert(completion.completion === 'configure', 'Tab should complete conf to configure');
completion = completeInput(d11, 'co');
assert(completion.completion === null && completion.suggestions.length >= 2, 'co should be ambiguous');

// 12. Multi-device independence
const dA = createCiscoDevice({ hostname: 'A' });
const dB = createCiscoDevice({ hostname: 'B' });
storage.clear();
send(dA, 'enable');
send(dA, 'configure terminal');
send(dA, 'hostname A-NEW');
assert(dA.hostname === 'A-NEW', 'Device A hostname changed');
assert(dB.hostname === 'B', 'Device B hostname unchanged');

// 13. Errors
const dErr = createCiscoDevice();
storage.clear();
r = send(dErr, 'enable');
assert(r.success, 'enable should succeed');
r = send(dErr, 'unknowncommand');
assert(!r.success && r.errorType === CLI_ERROR.UNKNOWN_COMMAND, 'Unknown command should fail');

r = send(dErr, 'configure');
assert(!r.success && r.errorType === CLI_ERROR.INCOMPLETE_COMMAND, 'Incomplete command should fail');

r = send(dErr, 'show');
assert(!r.success && r.errorType === CLI_ERROR.INCOMPLETE_COMMAND, 'Incomplete show should fail');

console.log('Cisco CLI Engine tests passed.');
