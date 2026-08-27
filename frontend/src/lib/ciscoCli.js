// =============================================================================
// Cisco IOS CLI answer-checking helpers.
//
// Used by the "cli-input" exercise type (theory-mode Praxis exercises) and by
// CLI-based tasks mixed into the Praxis-quiz / Fachgespräch question pools
// (see academyThemencheck.js: collectCliTasksFromLesson). A learner's typed
// commands are graded the way an instructor would read them off a real
// console: case-insensitive, tolerant of the most common IOS abbreviations
// (en, conf t, sh run, wr, int, ...) and compared line by line, since Cisco
// configuration is inherently sequential - not as one exact string.
// =============================================================================

// Interface type names that are routinely typed in their shortest
// unambiguous form on a real console.
const INTERFACE_TYPE_ALIASES = [
  ['fastethernet', 'fa'],
  ['gigabitethernet', 'gi'],
  ['tengigabitethernet', 'te'],
  ['serial', 's'],
  ['ethernet', 'e'],
];

function collapseWhitespace(line) {
  return String(line).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.]+$/, '');
}

// Reduces every interface-type name in a line to its shortest common form
// (fastethernet -> fa, gigabitethernet -> gi, ...) so "interface fa0/1" and
// "interface fastethernet0/1" compare equal. Only applied directly in front
// of a digit so words like "ethernet" used elsewhere are left untouched.
function shortenInterfaceTypes(line) {
  let s = line;
  for (const [long, short] of INTERFACE_TYPE_ALIASES) {
    s = s.replace(new RegExp(`\\b${long}(?=\\d)`, 'g'), short);
  }
  return s;
}

// Removes spaces around "/" and after "," so "fa 0 / 1" and "fa0/1", or
// "vlan 10, 20" and "vlan 10,20", compare equal. Also collapses the space
// between a short interface prefix and its port number ("fa 0/1" -> "fa0/1").
const SHORT_INTERFACE_PREFIXES = INTERFACE_TYPE_ALIASES.map(([, short]) => short);
function normalizeSeparators(line) {
  const prefixPattern = SHORT_INTERFACE_PREFIXES.join('|');
  return line
    .replace(new RegExp(`\\b(${prefixPattern})\\s+(?=\\d)`, 'g'), '$1')
    .replace(/\s*\/\s*/g, '/')
    .replace(/,\s*/g, ',');
}

// Whole-line IOS command abbreviations relevant to the CyberLearn Cisco
// lessons. Anchored to the full (normalized) line - never a substring - so a
// rule can never accidentally corrupt unrelated text.
const LINE_ABBREVIATIONS = [
  [/^en$/, 'enable'],
  [/^conf(ig)?\s*t(erm)?$/, 'configure terminal'],
  [/^wr$/, 'copy running-config startup-config'],
  [/^write$/, 'copy running-config startup-config'],
  [/^copy run(ning-config)?\s+start(up-config)?$/, 'copy running-config startup-config'],
  [/^show run$/, 'show running-config'],
  [/^ex$/, 'exit'],
];

function expandKnownAbbreviations(line) {
  for (const [pattern, full] of LINE_ABBREVIATIONS) {
    if (pattern.test(line)) return full;
  }
  // "br" at the end of a show command is the common abbreviation for "brief".
  if (/\sbr$/.test(line)) return expandKnownAbbreviations(line.replace(/\sbr$/, ' brief'));
  // "sh ..." / "show ..." and "int ..." / "interface ..." are interchangeable
  // prefixes for every command that starts with them (show running-config,
  // show vlan brief, interface fa0/1, ...) - re-checked once more afterwards
  // so e.g. "sh run" first becomes "show run" and then "show running-config".
  if (/^sh\s/.test(line)) return expandKnownAbbreviations(line.replace(/^sh\s/, 'show '));
  if (/^show int\s/.test(line)) return expandKnownAbbreviations(line.replace(/^show int\s/, 'show interfaces '));
  if (/^show ip int\s/.test(line)) return expandKnownAbbreviations(line.replace(/^show ip int\s/, 'show ip interface '));
  if (/^sw\s/.test(line)) return expandKnownAbbreviations(line.replace(/^sw\s/, 'switchport '));
  if (/^int\s/.test(line)) return expandKnownAbbreviations(line.replace(/^int\s/, 'interface '));
  // "show run" (or "sh run") followed by a pipe or any other suffix expands to "show running-config ...".
  if (/^(?:show|sh)\s+run\b/.test(line)) {
    return line.replace(/^(?:show|sh)\s+run\b/, 'show running-config');
  }
  return line;
}

/**
 * Normalizes a single CLI line for comparison: trims/lowercases, collapses
 * whitespace, expands known IOS abbreviations and reduces interface type
 * names to their shortest common form.
 */
export function normalizeCiscoLine(line) {
  let s = collapseWhitespace(line);
  s = expandKnownAbbreviations(s);
  s = shortenInterfaceTypes(s);
  s = normalizeSeparators(s);
  return s;
}

/**
 * Whether a learner's line matches an expected command line. `expectedLine`
 * may be a single string or an array of equally accepted phrasings (on top
 * of the automatic abbreviation/case handling in normalizeCiscoLine).
 */
export function ciscoLineMatches(userLine, expectedLine) {
  const accepted = Array.isArray(expectedLine) ? expectedLine : [expectedLine];
  const normalizedUser = normalizeCiscoLine(userLine);
  return accepted.some((variant) => normalizeCiscoLine(variant) === normalizedUser);
}

// On a real Cisco console, "exit" (or "ex") is a no-op as far as correctness
// goes whenever it's used to leave a submode right before a command that
// switches context anyway (e.g. "vlan 20" -> "vlan 30", or "line console 0"
// -> "username ..."): IOS automatically jumps between submodes, so typing
// "exit" first is neither required nor wrong. checkCiscoInput therefore
// drops every "exit" line from BOTH sides before comparing, so a learner is
// never marked wrong for typing it and never marked wrong for omitting it.
function isExitLine(entry) {
  const first = Array.isArray(entry) ? entry[0] : entry;
  return normalizeCiscoLine(first) === 'exit';
}

/**
 * Compares a learner's multi-line CLI input against an expected command
 * sequence. Each entry of `expectedLines` is either a single expected line
 * or an array of accepted alternative lines/phrasings. Blank lines in the
 * input are ignored, and "exit"/"ex" lines are ignored on both sides (see
 * isExitLine above). Order matters (Cisco configuration is sequential), so
 * line N of the (filtered) input is checked against expected line N.
 */
export function checkCiscoInput(rawInput, expectedLines) {
  const userLines = String(rawInput).split('\n').map((l) => l.trim()).filter(Boolean).filter((l) => normalizeCiscoLine(l) !== 'exit');
  const filteredExpected = expectedLines.filter((e) => !isExitLine(e));
  const results = filteredExpected.map((expected, i) => {
    const userLine = userLines[i];
    const ok = userLine !== undefined && ciscoLineMatches(userLine, expected);
    return { expected: Array.isArray(expected) ? expected[0] : expected, userLine, ok };
  });
  const extraLines = userLines.slice(filteredExpected.length);
  const allCorrect = results.every((r) => r.ok) && extraLines.length === 0 && userLines.length === filteredExpected.length;
  return { results, allCorrect, extraLines };
}
