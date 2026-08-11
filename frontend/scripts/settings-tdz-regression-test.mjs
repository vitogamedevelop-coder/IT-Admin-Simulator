/**
 * Settings TDZ regression test
 *
 * Root cause of the reported "Cannot access 'z' before initialization" in
 * Settings: a `const` variable (`refreshDiagnostics`) was declared with
 * `useCallback()` AFTER `useEffect` hooks that referenced it in their
 * dependency arrays. Because `const`/`let` are in the Temporal Dead Zone until
 * their initializer runs, the production bundle could throw at runtime when the
 * useEffect dependency array was evaluated before the variable was initialized.
 *
 * This test statically parses `src/pages/Settings.jsx` and enforces that every
 * `const` identifier referenced in a `useEffect`/`useMemo`/`useCallback`
 * dependency array is declared earlier in the same file. It does not catch
 * every possible TDZ, but it reliably catches the exact pattern that caused the
 * Settings crash and acts as a guard against reintroducing it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');
const settingsPath = path.join(projectRoot, 'src', 'pages', 'Settings.jsx');

const source = fs.readFileSync(settingsPath, 'utf-8');
const lines = source.split(/\r?\n/);

// Extract const/let declarations: identifier and line number (1-based).
const declPattern = /^\s*(?:const|let)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g;
const declarations = new Map();
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Reset lastIndex because we re-use the regex object.
  declPattern.lastIndex = 0;
  let m;
  while ((m = declPattern.exec(line)) !== null) {
    const name = m[1];
    if (!declarations.has(name)) {
      declarations.set(name, i + 1);
    }
  }
}

// Find useEffect/useMemo/useCallback calls and their dependency array lines.
// This is intentionally simple: it looks for the hook call on a line and the
// dependency array on the same or the next line(s), then extracts identifiers.
const hookPattern = /\b(useEffect|useMemo|useCallback)\s*\(/g;
const depArrayPattern = /,\s*\[([^\]]*)\]\s*\)/;
const problems = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  hookPattern.lastIndex = 0;
  if (!hookPattern.test(line)) continue;

  // Gather the hook call and the following few lines to find the dependency array.
  const block = lines.slice(i, Math.min(i + 8, lines.length)).join(' ');
  const match = block.match(depArrayPattern);
  if (!match) continue;

  const depString = match[1];
  if (!depString.trim()) continue; // empty dependency array

  // Extract likely identifiers: words that are not strings/numbers/objects.
  const depIdentifiers = [...depString.matchAll(/\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g)].map((m) => m[1]);

  for (const id of depIdentifiers) {
    const declLine = declarations.get(id);
    if (!declLine) continue; // not a local const/let, fine
    if (declLine > i + 1) {
      problems.push(`Line ${i + 1}: hook uses "${id}" in dependency array, but it is declared later on line ${declLine} (TDZ risk)`);
    }
  }
}

if (problems.length > 0) {
  console.error('Settings TDZ regression test FAILED:');
  for (const p of problems) console.error('  -', p);
  process.exit(1);
}

console.log('Settings TDZ regression test passed: no const/let used in hook dependency array before declaration.');
