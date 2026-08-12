// Phase 1C.3: exec-timeout command tree integration and IOS abbreviation tests.

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
  completeInput,
  CLI_ERROR,
} = await import(pathToFileURL(join(srcDir, 'lib/ciscoCliEngine.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const d = createCiscoDevice({ hostname: 'Switch' });
executeCommand(d, 'enable');
executeCommand(d, 'configure terminal');
executeCommand(d, 'line console 0');

// 1. exec-timeout 5 0 works in LINE_CONSOLE_CONFIG
const r1 = executeCommand(d, 'exec-timeout 5 0');
assert(r1.success, 'exec-timeout 5 0 should succeed');
assert(d.runningConfig.lines.console.execTimeout.minutes === 5, 'minutes should be 5');
assert(d.runningConfig.lines.console.execTimeout.seconds === 0, 'seconds should be 0');

// 2. exec-timeout 3 works with optional seconds (defaults to 0)
const r2 = executeCommand(d, 'exec-timeout 3');
assert(r2.success, 'exec-timeout 3 should succeed');
assert(d.runningConfig.lines.console.execTimeout.minutes === 3, 'minutes should be 3');
assert(d.runningConfig.lines.console.execTimeout.seconds === 0, 'seconds should default to 0');

// 3. exec-timeout shows in running-config
executeCommand(d, 'end');
const show = executeCommand(d, 'show running-config');
assert(show.output.includes('exec-timeout 3 0'), 'running-config should show exec-timeout 3 0');
executeCommand(d, 'configure terminal');
executeCommand(d, 'line console 0');

// 4. exec-timeout 5 10 also works
executeCommand(d, 'exec-timeout 5 10');
assert(d.runningConfig.lines.console.execTimeout.minutes === 5, 'minutes should be 5');
assert(d.runningConfig.lines.console.execTimeout.seconds === 10, 'seconds should be 10');

// 5. exec-timeout without args is incomplete
const r3 = executeCommand(d, 'exec-timeout');
assert(!r3.success, 'exec-timeout without args should fail');
assert(r3.errorType === CLI_ERROR.INCOMPLETE_COMMAND, 'should be INCOMPLETE_COMMAND');

// 6. exec is ambiguous with exec-timeout: exec alone should be ambiguous
const r4 = executeCommand(d, 'exec');
assert(!r4.success, 'exec should be ambiguous with exec-timeout');
assert(r4.errorType === CLI_ERROR.AMBIGUOUS_COMMAND, 'should be AMBIGUOUS_COMMAND');

// 7. exec 5 0 is ambiguous (not interpreted as exec-timeout)
const r5 = executeCommand(d, 'exec 5 0');
assert(!r5.success, 'exec 5 0 should be ambiguous');
assert(r5.errorType === CLI_ERROR.AMBIGUOUS_COMMAND, 'should be AMBIGUOUS_COMMAND');

// 8. exec-t 5 0 is a unique abbreviation for exec-timeout
const r6 = executeCommand(d, 'exec-t 5 0');
assert(r6.success, 'exec-t 5 0 should succeed as abbreviation');
assert(d.runningConfig.lines.console.execTimeout.minutes === 5, 'minutes should be 5 after exec-t');

// 9. exec-timeout ? syntax help shows <minutes>
const h1 = getCommandHelp(d, 'exec-timeout ?', { helpCompact: true });
assert(h1.help.includes('<minutes>') || h1.help.includes('0-35791'), 'exec-timeout ? should show minutes help');
assert(h1.inputAfterHelp === 'exec-timeout ', 'inputAfterHelp should preserve trailing space');

// 10. exec-timeout 5 ? syntax help shows <seconds>
const h2 = getCommandHelp(d, 'exec-timeout 5 ?', { helpCompact: true });
assert(h2.help.includes('<seconds>') || h2.help.includes('0-2147483'), 'exec-timeout 5 ? should show seconds help');
assert(h2.inputAfterHelp === 'exec-timeout 5 ', 'inputAfterHelp should preserve trailing space');

// 11. exec? partial word shows both exec and exec-timeout
const h3 = getCommandHelp(d, 'exec?', { helpCompact: true });
assert(h3.help.includes('exec'), 'exec? should list exec');
assert(h3.help.includes('exec-timeout'), 'exec? should list exec-timeout');
assert(h3.inputAfterHelp === 'exec', 'inputAfterHelp should be exec');

// 12. exec-? partial word is unique for exec-timeout
const h4 = getCommandHelp(d, 'exec-?', { helpCompact: true });
assert(h4.help.includes('exec-timeout'), 'exec-? should list exec-timeout');
assert(!h4.help.includes('exec '), 'exec-? should not list bare exec');

// 13. Tab completion: exec- -> exec-timeout
const c1 = completeInput(d, 'exec-');
assert(c1.completion === 'exec-timeout', `Tab should complete exec- to exec-timeout, got ${c1.completion}`);

// 14. Tab on exec gives suggestions, not completion
const c2 = completeInput(d, 'exec');
assert(c2.completion === null, 'Tab on exec should not have unique completion');
assert(c2.suggestions.includes('exec'), 'suggestions should include exec');
assert(c2.suggestions.includes('exec-timeout'), 'suggestions should include exec-timeout');

// 15. exec-timeout in VTY line config works
executeCommand(d, 'end');
executeCommand(d, 'configure terminal');
executeCommand(d, 'line vty 0 15');
const r7 = executeCommand(d, 'exec-timeout 2 30');
assert(r7.success, 'exec-timeout 2 30 in VTY should succeed');
assert(d.runningConfig.lines.vty.execTimeout.minutes === 2, 'vty minutes should be 2');
assert(d.runningConfig.lines.vty.execTimeout.seconds === 30, 'vty seconds should be 30');

console.log('exec-timeout command tree tests passed.');
