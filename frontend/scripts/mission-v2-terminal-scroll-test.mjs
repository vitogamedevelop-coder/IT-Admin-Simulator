/**
 * Terminal window regression test (Phase 1G, item 13).
 *
 * The Cisco terminal in MissionV2.jsx used to rely on `flex-1 min-h-0`
 * against an *unbounded* page container (`.app-shell` only has
 * `min-height: 100vh`, never a `max-height`). Because the ancestor never
 * actually constrains its height, `flex-1` had no effect and the terminal's
 * history div simply grew with every command - stretching the whole mission
 * page instead of scrolling internally.
 *
 * This is a static source check (the project has no React rendering test
 * harness - see settings-tdz-regression-test.mjs for the same approach),
 * asserting:
 *   - the terminal history area has a fixed, bounded height (not flex-1)
 *   - it has its own scroll handler and internal overflow-y-auto
 *   - sending a command re-anchors the scroll position to the bottom
 *   - manual scroll-up is tracked and respected (auto-scroll only when the
 *     player is already near the bottom)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');
const missionV2Path = path.join(projectRoot, 'src', 'pages', 'MissionV2.jsx');
const source = fs.readFileSync(missionV2Path, 'utf-8');

const problems = [];

function assertSource(condition, message) {
  if (!condition) problems.push(message);
}

// The history area must have a fixed, bounded height class, not flex-1
// (flex-1 against the unbounded .app-shell ancestor is a no-op).
const terminalDivMatch = source.match(/ref=\{terminalRef\}[\s\S]{0,150}className="([^"]+)"/);
assertSource(terminalDivMatch, 'terminalRef div with a className should exist');
if (terminalDivMatch) {
  const cls = terminalDivMatch[1];
  assertSource(/\bh-\d+\b/.test(cls), `terminal history div should have a fixed height class (e.g. "h-64"), got: ${cls}`);
  assertSource(!/\bflex-1\b/.test(cls), `terminal history div should NOT rely on flex-1 against an unbounded ancestor, got: ${cls}`);
  assertSource(/overflow-y-auto/.test(cls), 'terminal history div should scroll internally (overflow-y-auto)');
}

assertSource(/onScroll=\{handleTerminalScroll\}/.test(source), 'terminal history div should track manual scrolling via onScroll={handleTerminalScroll}');
assertSource(/function handleTerminalScroll/.test(source), 'handleTerminalScroll() should be defined');
assertSource(/autoScrollRef\.current = distanceFromBottom/.test(source), 'handleTerminalScroll should update autoScrollRef based on distance from the bottom');
assertSource(/function scrollTerminalToBottom/.test(source), 'scrollTerminalToBottom() should be defined');
assertSource(/scrollTerminalToBottom\(\);/.test(source), 'sendCommand should call scrollTerminalToBottom() so a new own command re-anchors to the current prompt');

// The auto-scroll effect must respect the tracked flag instead of always
// forcing scrollTop = scrollHeight.
const effectMatch = source.match(/useEffect\(\(\) => \{\s*const el = terminalRef\.current;\s*if \(el && autoScrollRef\.current\) \{/);
assertSource(effectMatch, 'the history/helpOutput auto-scroll effect must only scroll when autoScrollRef.current is true (manual scroll-up must not be overridden)');

if (problems.length > 0) {
  console.error('Mission V2 terminal scroll regression test FAILED:');
  for (const p of problems) console.error('  -', p);
  process.exit(1);
}

console.log('Mission V2 terminal scroll regression test passed: fixed-height internal scroll, manual scroll respected, own commands re-anchor to bottom.');
