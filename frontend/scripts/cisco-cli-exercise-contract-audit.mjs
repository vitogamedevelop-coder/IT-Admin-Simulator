import { LESSONS } from '../src/lib/academyLessonData.js';
import { normalizeCiscoLine } from '../src/lib/ciscoCli.js';

let failures = 0;
function assert(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${label}${detail ? ` (${detail})` : ''}`);
  if (!condition) failures += 1;
}

const VALID_START_CONTEXTS = [
  /user exec/i, /privileged exec/i, /globaler konfigurationsmodus/i, /interface-konfigurationsmodus/i,
  /line-konfigurationsmodus/i, /router-konfigurationsmodus/i, /vlan-konfigurationsmodus/i,
  /vty-line-konfigurationsmodus/i, /benutzer-modus/i, /privilegierter modus/i,
];

const CONTEXT_RULES = [
  {
    context: /interface-konfigurationsmodus/i,
    check(expected) {
      return !expected.some((l) => normalizeCiscoLine(l).startsWith('interface '));
    },
    message: 'Interface config context must not require "interface ..." in expected lines',
  },
  {
    context: /globaler konfigurationsmodus/i,
    check(expected) {
      const first = normalizeCiscoLine(expected[0] || '');
      // "do show ..." is valid from any config submode and may be the only command.
      return !first.startsWith('no shutdown');
    },
    message: 'Global config context should not start with "no shutdown"',
  },
  {
    context: /user exec|benutzer-modus/i,
    check(expected) {
      const first = normalizeCiscoLine(expected[0] || '');
      return !first.startsWith('configure') && !first.startsWith('interface') && !first.startsWith('no shutdown') && !first.startsWith('ip ');
    },
    message: 'User EXEC context cannot run configuration commands',
  },
  {
    context: /privileged exec|privilegierter modus/i,
    check(expected) {
      const first = normalizeCiscoLine(expected[0] || '');
      return !first.startsWith('configure') || first.startsWith('configure terminal');
    },
    message: 'Privileged EXEC context may enter configure terminal, but not other config commands',
  },
];

function checkExercise(ex, source) {
  assert(`${source}: has expectedLines`, Array.isArray(ex.expectedLines) && ex.expectedLines.length > 0, `id=${ex.id || '?'}`);
  assert(`${source}: has startContext`, typeof ex.startContext === 'string' && ex.startContext.length > 0, `id=${ex.id || '?'}`);
  assert(`${source}: startContext looks valid`, VALID_START_CONTEXTS.some((r) => r.test(ex.startContext)), `id=${ex.id || '?'} context=${ex.startContext}`);

  const expectedNorm = ex.expectedLines.map(normalizeCiscoLine);
  for (const rule of CONTEXT_RULES) {
    if (rule.context.test(ex.startContext)) {
      assert(`${source}: context consistent for ${ex.id || '?'}`, rule.check(expectedNorm), rule.message);
    }
  }

  // Every expected line must normalize without throwing.
  expectedNorm.forEach((line, i) => {
    assert(`${source}: expectedLines[${i}] normalizes`, typeof line === 'string', `id=${ex.id || '?'}`);
  });

  // Case-sanity: upper/lower/mixed "no shutdown" should all be accepted (test normalization equality)
  if (ex.expectedLines.some((l) => normalizeCiscoLine(l).includes('no shutdown'))) {
    const variants = ['no shutdown', 'No shutdown', 'NO SHUTDOWN'];
    const normExpected = normalizeCiscoLine('no shutdown');
    variants.forEach((v) => {
      assert(`${source}: case-insensitive for "no shutdown" in ${ex.id || '?'}`, normalizeCiscoLine(v) === normExpected);
    });
  }
}

console.log('=== Cisco CLI Exercise Contract Audit ===');

for (const [topicId, lesson] of Object.entries(LESSONS)) {
  const exercises = lesson.exercises || [];
  const cliTasks = lesson.cliTasks || [];

  exercises.forEach((ex, idx) => {
    if (ex.type === 'cli-input') checkExercise(ex, `${topicId} exercise[${idx}]`);
  });

  cliTasks.forEach((t, idx) => {
    checkExercise(t, `${topicId} cliTask[${idx}]`);
  });
}

// Explicit regression cases reported by user.
function runRegressionChecks() {
  const basicLesson = LESSONS['cisco-packet-tracer/basic-device-configuration'];
  if (basicLesson) {
    const ex = (basicLesson.exercises || []).find((e) => e.id === 'basic-interface-down-troubleshoot-cli');
    if (ex) {
      assert(
        'basic-interface-down-troubleshoot-cli question mentions interface selection',
        /wähle das interface aus/i.test(ex.question) || /interface.*auswählen/i.test(ex.question),
        ex.question
      );
      assert(
        'basic-interface-down-troubleshoot-cli expects interface selection',
        ex.expectedLines.some((l) => normalizeCiscoLine(l).startsWith('interface ')),
        ex.expectedLines.join(' | ')
      );
      assert(
        'basic-interface-down-troubleshoot-cli expects no shutdown',
        ex.expectedLines.some((l) => normalizeCiscoLine(l) === 'no shutdown'),
        ex.expectedLines.join(' | ')
      );
    } else {
      assert('basic-interface-down-troubleshoot-cli exists', false);
    }
  }
}
runRegressionChecks();

console.log('');
if (failures === 0) {
  console.log('Cisco CLI exercise contract audit passed.');
  process.exit(0);
}
console.log(`${failures} failures.`);
process.exit(1);
