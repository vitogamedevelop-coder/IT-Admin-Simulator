const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

import assert from 'node:assert/strict';
import { buildCiscoDhcpLesson } from '../src/lib/academyLessons/ciscoDhcp.js';
import { getDiagnosticScenariosForTopic } from '../src/lib/diagnosticScenarios.js';
import { getCategorySummary } from '../src/lib/academyThemencheck.js';

const EVIDENCE_TYPES = new Set(['viewed', 'recognized', 'understood', 'recalled', 'applied', 'diagnosed', 'transferred']);

const lesson = buildCiscoDhcpLesson();

// 1. Select-best exercises compare the selected option id to the correct option id.
//    We verify that every select-best exercise has a numeric correct index within range
//    and every option is either a string or an object with a stable id.
const selectBestExercises = lesson.exercises.filter((ex) => ex.type === 'select-best');
assert.ok(selectBestExercises.length >= 1, 'has select-best exercises');
for (const ex of selectBestExercises) {
  assert.ok(Array.isArray(ex.options) && ex.options.length > 1, `${ex.id} has options`);
  assert.ok(ex.correct >= 0 && ex.correct < ex.options.length, `${ex.id} correct index valid`);
  ex.options.forEach((opt, i) => {
    if (typeof opt !== 'string') assert.ok(opt.id || opt.value, `${ex.id} option ${i} has stable id/value`);
  });
  assert.ok(ex.evidenceType && EVIDENCE_TYPES.has(ex.evidenceType), `${ex.id} evidenceType valid`);
}

// 2. CLI exercises show a task instruction and a technically correct starting mode.
const cliExercises = lesson.exercises.filter((ex) => ex.type === 'cli-input');
assert.ok(cliExercises.length >= 2, 'has cli-input exercises');
for (const ex of cliExercises) {
  assert.ok(ex.question && ex.question.length > 5, `${ex.id} CLI task instruction exists`);
  assert.ok(ex.startContext, `${ex.id} has startContext`);
  assert.ok(Array.isArray(ex.expectedLines) && ex.expectedLines.length >= 1, `${ex.id} expectedLines non-empty`);
}

// 3. CLI exercise 3 = recall from interface config mode, exercise 4 = apply from global mode.
const recall = cliExercises[0];
const apply = cliExercises[1];
assert.ok(recall.id === 'dhcp-recall-command', 'first CLI exercise is dhcp-recall-command');
assert.ok(apply.id === 'dhcp-apply-subinterface', 'second CLI exercise is dhcp-apply-subinterface');
assert.ok(recall.startContext.toLowerCase().includes('config-if'), 'recall exercise starts in interface config mode');
assert.ok(recall.expectedLines.length === 1 && recall.expectedLines[0].startsWith('ip helper-address'), 'recall exercise asks only for helper command');
assert.ok(apply.startContext.toLowerCase().includes('global'), 'apply exercise starts in global config mode');
assert.ok(apply.expectedLines.some((line) => line.startsWith('interface ')), 'apply exercise requires entering interface');

// 4. Diagnostic scenario question text no longer contains raw markdown code fences.
const dhcpDiags = getDiagnosticScenariosForTopic('cisco-packet-tracer', 'dhcp');
assert.ok(Array.isArray(dhcpDiags) && dhcpDiags.length > 0, 'has DHCP diagnostic scenarios');
for (const diag of dhcpDiags) {
  assert.ok(!diag.question.includes('```'), 'DHCP diagnostic question has no raw markdown fences');
  assert.ok(diag.diagnostic && diag.diagnostic.problem, 'diagnostic has structured problem field');
}

// 5. Trunk diagnostic distractor wording is unambiguous.
const trunkDiags = getDiagnosticScenariosForTopic('cisco-packet-tracer', 'trunk');
const ambiguous = trunkDiags.find((d) => d.options.some((o) => o.includes('VLAN 30 fehlt') && !o.includes('angelegt') && !o.includes('Allowed')));
assert.ok(!ambiguous, 'trunk diagnostic no longer uses ambiguous "VLAN 30 fehlt" distractor');

// 6. Category summary provides a plausible, question-type-aware Themencheck estimate.
const ciscoSummary = getCategorySummary('cisco-packet-tracer');
assert.ok(ciscoSummary.estimatedThemencheckMinutes >= 5 && ciscoSummary.estimatedThemencheckMinutes <= 90, 'Cisco Themencheck estimate is plausible');
const fundamentalsSummary = getCategorySummary('fundamentals');
assert.ok(fundamentalsSummary.estimatedThemencheckMinutes >= 5 && fundamentalsSummary.estimatedThemencheckMinutes <= 60, 'Fundamentals Themencheck estimate is plausible');

console.log('C5 playtest regression tests OK');
