// Cisco IOS Mode & `do` Command Regression Test (Phase 1E, sections 10-13, 26)
//
// Verifies that exit/end/do command-mode transitions and mode isolation
// behave correctly without implementing a generic parent-mode fallback.

import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

// localStorage/window stub so skillTree calls don't crash in Node
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.window = { dispatchEvent: () => {} };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const {
  createCiscoDevice,
  executeCommand,
  CLI_MODE,
  CLI_ERROR,
} = await import(pathToFileURL(join(__dirname, '../src/lib/ciscoCliEngine.js')).href);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✔ PASS: ${label}`);
    passed += 1;
  } else {
    console.error(`  ✘ FAIL: ${label}`);
    failed += 1;
  }
}

/** Create a fresh device for testing. */
function freshDevice() {
  return createCiscoDevice({ type: 'layer2_switch', hostname: 'Sw1' });
}

/** Run a command and return the result. */
function run(device, input) {
  return executeCommand(device, input);
}

/** Enter PRIVILEGED_EXEC mode from a fresh device. */
function enterPrivExec() {
  const device = freshDevice();
  run(device, 'enable');
  return device;
}

/** Enter GLOBAL_CONFIG mode from a fresh device. */
function enterGlobalConfig() {
  const device = enterPrivExec();
  run(device, 'configure terminal');
  return device;
}

/** Enter INTERFACE_CONFIG mode. Uses the first interface on the device. */
function enterInterfaceConfig() {
  const device = enterGlobalConfig();
  const firstIface = Object.keys(device.runningConfig.interfaces)[0];
  run(device, `interface ${firstIface}`);
  return device;
}

/** Enter LINE_CONSOLE_CONFIG mode. */
function enterLineConsoleConfig() {
  const device = enterGlobalConfig();
  run(device, 'line console 0');
  return device;
}

// ---------------------------------------------------------------------------
// Test 1: `do show running-config` from GLOBAL_CONFIG
// ---------------------------------------------------------------------------
console.log('\nTest 1: do show running-config from GLOBAL_CONFIG');
{
  const device = enterGlobalConfig();
  assert(device.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'Device is in GLOBAL_CONFIG mode');

  const result = run(device, 'do show running-config');
  assert(result.success === true, 'Command succeeds');
  assert(typeof result.output === 'string' && result.output.length > 0, 'Output is non-empty');
  assert(result.output.includes('hostname'), 'Output contains hostname (running-config)');
  assert(device.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'Mode stays GLOBAL_CONFIG after do command');
}

// ---------------------------------------------------------------------------
// Test 2: `do show running-config` from LINE_CONSOLE_CONFIG
// ---------------------------------------------------------------------------
console.log('\nTest 2: do show running-config from LINE_CONSOLE_CONFIG');
{
  const device = enterLineConsoleConfig();
  assert(device.cli.mode === CLI_MODE.LINE_CONSOLE_CONFIG, 'Device is in LINE_CONSOLE_CONFIG mode');

  const result = run(device, 'do show running-config');
  assert(result.success === true, 'Command succeeds');
  assert(typeof result.output === 'string' && result.output.length > 0, 'Output is non-empty');
  assert(result.output.includes('hostname'), 'Output contains hostname (running-config)');
  assert(device.cli.mode === CLI_MODE.LINE_CONSOLE_CONFIG, 'Mode stays LINE_CONSOLE_CONFIG after do command');
}

// ---------------------------------------------------------------------------
// Test 3: `do show running-config` from INTERFACE_CONFIG
// ---------------------------------------------------------------------------
console.log('\nTest 3: do show running-config from INTERFACE_CONFIG');
{
  const device = enterInterfaceConfig();
  assert(device.cli.mode === CLI_MODE.INTERFACE_CONFIG, 'Device is in INTERFACE_CONFIG mode');
  const savedIface = device.cli.currentInterface;

  const result = run(device, 'do show running-config');
  assert(result.success === true, 'Command succeeds');
  assert(typeof result.output === 'string' && result.output.length > 0, 'Output is non-empty');
  assert(result.output.includes('hostname'), 'Output contains hostname (running-config)');
  assert(device.cli.mode === CLI_MODE.INTERFACE_CONFIG, 'Mode stays INTERFACE_CONFIG after do command');
  assert(device.cli.currentInterface === savedIface, 'currentInterface preserved after do command');
}

// ---------------------------------------------------------------------------
// Test 4: `do write memory` / `do wr` from GLOBAL_CONFIG
// ---------------------------------------------------------------------------
console.log('\nTest 4: do write memory / do wr from GLOBAL_CONFIG');
{
  // Test `do write memory`
  const device1 = enterGlobalConfig();
  assert(device1.startupConfig === null, 'startupConfig is null before write');
  const result1 = run(device1, 'do write memory');
  assert(result1.success === true, 'do write memory succeeds');
  assert(device1.startupConfig !== null, 'startupConfig is set after do write memory');
  assert(device1.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'Mode stays GLOBAL_CONFIG after do write memory');

  // Test `do wr`
  const device2 = enterGlobalConfig();
  assert(device2.startupConfig === null, 'startupConfig is null before wr');
  const result2 = run(device2, 'do wr');
  assert(result2.success === true, 'do wr succeeds');
  assert(device2.startupConfig !== null, 'startupConfig is set after do wr');
  assert(device2.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'Mode stays GLOBAL_CONFIG after do wr');
}

// ---------------------------------------------------------------------------
// Test 5: `exit` from INTERFACE_CONFIG returns to GLOBAL_CONFIG
// ---------------------------------------------------------------------------
console.log('\nTest 5: exit from INTERFACE_CONFIG returns to GLOBAL_CONFIG');
{
  const device = enterInterfaceConfig();
  assert(device.cli.mode === CLI_MODE.INTERFACE_CONFIG, 'Device is in INTERFACE_CONFIG mode');

  const result = run(device, 'exit');
  assert(result.success === true, 'exit command succeeds');
  assert(device.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'Mode is GLOBAL_CONFIG after exit (not USER_EXEC or PRIVILEGED_EXEC)');
  assert(device.cli.mode !== CLI_MODE.USER_EXEC, 'Mode is NOT USER_EXEC');
  assert(device.cli.mode !== CLI_MODE.PRIVILEGED_EXEC, 'Mode is NOT PRIVILEGED_EXEC');
}

// ---------------------------------------------------------------------------
// Test 6: `exit` from GLOBAL_CONFIG returns to PRIVILEGED_EXEC
// ---------------------------------------------------------------------------
console.log('\nTest 6: exit from GLOBAL_CONFIG returns to PRIVILEGED_EXEC');
{
  const device = enterGlobalConfig();
  assert(device.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'Device is in GLOBAL_CONFIG mode');

  const result = run(device, 'exit');
  assert(result.success === true, 'exit command succeeds');
  assert(device.cli.mode === CLI_MODE.PRIVILEGED_EXEC, 'Mode is PRIVILEGED_EXEC after exit');
}

// ---------------------------------------------------------------------------
// Test 7: `end` from deeper config modes returns directly to PRIVILEGED_EXEC
// ---------------------------------------------------------------------------
console.log('\nTest 7: end from deeper config modes returns directly to PRIVILEGED_EXEC');
{
  // From INTERFACE_CONFIG
  const device1 = enterInterfaceConfig();
  assert(device1.cli.mode === CLI_MODE.INTERFACE_CONFIG, 'Device is in INTERFACE_CONFIG');
  run(device1, 'end');
  assert(device1.cli.mode === CLI_MODE.PRIVILEGED_EXEC, 'end from INTERFACE_CONFIG -> PRIVILEGED_EXEC');
  assert(device1.cli.currentInterface === null, 'currentInterface cleared after end');

  // From LINE_CONSOLE_CONFIG
  const device2 = enterLineConsoleConfig();
  assert(device2.cli.mode === CLI_MODE.LINE_CONSOLE_CONFIG, 'Device is in LINE_CONSOLE_CONFIG');
  run(device2, 'end');
  assert(device2.cli.mode === CLI_MODE.PRIVILEGED_EXEC, 'end from LINE_CONSOLE_CONFIG -> PRIVILEGED_EXEC');
  assert(device2.cli.currentLine === null, 'currentLine cleared after end');

  // From GLOBAL_CONFIG
  const device3 = enterGlobalConfig();
  assert(device3.cli.mode === CLI_MODE.GLOBAL_CONFIG, 'Device is in GLOBAL_CONFIG');
  run(device3, 'end');
  assert(device3.cli.mode === CLI_MODE.PRIVILEGED_EXEC, 'end from GLOBAL_CONFIG -> PRIVILEGED_EXEC');

  // From LINE_VTY_CONFIG
  const device4 = enterGlobalConfig();
  run(device4, 'line vty 0 15');
  assert(device4.cli.mode === CLI_MODE.LINE_VTY_CONFIG, 'Device is in LINE_VTY_CONFIG');
  run(device4, 'end');
  assert(device4.cli.mode === CLI_MODE.PRIVILEGED_EXEC, 'end from LINE_VTY_CONFIG -> PRIVILEGED_EXEC');
  assert(device4.cli.currentLine === null, 'currentLine cleared after end from VTY');
}

// ---------------------------------------------------------------------------
// Test 8: global-config-only command `hostname SwX` fails in INTERFACE_CONFIG
//         (no automatic parent-mode fallback)
// ---------------------------------------------------------------------------
console.log('\nTest 8: hostname SwX in INTERFACE_CONFIG returns unknown/invalid error');
{
  const device = enterInterfaceConfig();
  assert(device.cli.mode === CLI_MODE.INTERFACE_CONFIG, 'Device is in INTERFACE_CONFIG mode');
  const oldHostname = device.hostname;

  const result = run(device, 'hostname SwX');
  assert(result.success === false, 'hostname command fails in INTERFACE_CONFIG');
  assert(
    result.errorType === CLI_ERROR.UNKNOWN_COMMAND || result.errorType === CLI_ERROR.INVALID_ARGUMENT,
    `Error type is UNKNOWN_COMMAND or INVALID_ARGUMENT (got ${result.errorType})`
  );
  assert(device.hostname === oldHostname, 'Hostname unchanged (no parent-mode fallback)');
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${'='.repeat(60)}`);
console.log(`Cisco IOS Mode & Do Command Tests: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(60)}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed.');
}
