/**
 * Packetfilter lesson validation
 *
 * Verifies that the new cisco-packet-tracer/packet-filter lesson exists,
 * has all required content sections, and covers the six mandatory learning
 * objectives from the course sheet:
 *   1. static vs. dynamic packet filters
 *   2. how traffic is filtered / rule processing
 *   3. configure static packet filters
 *   4. problems of static packet filters
 *   5. benefits and function of dynamic packet filters
 *   6. configure and verify dynamic packet filters
 */
import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { checkCiscoInput } from '../src/lib/ciscoCli.js';

const KEY = 'cisco-packet-tracer/packet-filter';
const lesson = LESSONS[KEY];

assert.ok(lesson, `LESSONS must contain ${KEY}`);
assert.ok(lesson.title, 'Lesson has a title');
assert.ok(lesson.explanations?.length >= 10, `Lesson has at least 10 explanation sections (has ${lesson.explanations?.length})`);
assert.ok(lesson.exercises?.length >= 3, `Lesson has at least 3 exercises (has ${lesson.exercises?.length})`);
assert.ok(lesson.quiz?.length >= 10, `Lesson has at least 10 quiz questions (has ${lesson.quiz?.length})`);
assert.ok(lesson.cliTasks?.length >= 3, `Lesson has at least 3 cliTasks (has ${lesson.cliTasks?.length})`);
assert.ok(lesson.summary?.length >= 5, `Lesson has at least 5 summary lines (has ${lesson.summary?.length})`);

// Collect all text from the lesson for keyword checks.
const blocks = [];
for (const ex of lesson.explanations || []) {
  for (const b of ex.blocks || []) blocks.push(b);
}
for (const ex of lesson.exercises || []) {
  if (ex.question) blocks.push({ type: 'text', content: ex.question });
  if (ex.hint) blocks.push({ type: 'text', content: ex.hint });
  if (ex.explanation) blocks.push({ type: 'text', content: ex.explanation });
}
for (const q of lesson.quiz || []) {
  if (q.question) blocks.push({ type: 'text', content: q.question });
  if (q.explanation) blocks.push({ type: 'text', content: q.explanation });
}
for (const t of lesson.cliTasks || []) {
  if (t.prompt) blocks.push({ type: 'text', content: t.prompt });
  if (t.explanation) blocks.push({ type: 'text', content: t.explanation });
}
for (const s of lesson.summary || []) blocks.push({ type: 'text', content: s });

const fullText = blocks.map((b) => b.content || b.title || '').join('\n').toLowerCase();

function containsAny(keywords) {
  return keywords.some((k) => fullText.includes(k.toLowerCase()));
}

// Learning objective checks (keywords in lesson text).
assert.ok(containsAny(['stateless', 'stateful', 'dynamisch', 'statisch']), 'Covers static vs. dynamic packet filters');
assert.ok(containsAny(['first match', 'first-match', 'regel', 'implicit deny', 'gefiltert']), 'Covers rule processing');
assert.ok(containsAny(['ip access-list', 'access-group', 'konfigurieren', 'permit', 'deny']), 'Covers static filter configuration');
assert.ok(containsAny(['rückverkehr', 'ruckverkehr', 'problem', 'probleme', 'nachteil']), 'Covers problems of static filters');
assert.ok(containsAny(['session', 'zustand', 'verbindungszustand', 'stateful', 'dynamisch']), 'Covers dynamic filter benefits/function');
assert.ok(containsAny(['ip inspect', 'show ip inspect', 'verifizieren', 'kontrolle']), 'Covers dynamic filter configuration and verification');

// Validate at least one cliTask answer can be accepted by checkCiscoInput.
for (const task of lesson.cliTasks || []) {
  const input = task.expectedLines.map((l) => (Array.isArray(l) ? l[0] : l)).join('\n');
  const result = checkCiscoInput(input, task.expectedLines);
  assert.ok(result.allCorrect, `cliTask "${task.prompt.slice(0, 60)}..." should be accepted as correct`);
}

console.log('Packetfilter lesson validation passed:');
console.log(`  - ${lesson.explanations.length} sections`);
console.log(`  - ${lesson.exercises.length} exercises`);
console.log(`  - ${lesson.quiz.length} quiz questions`);
console.log(`  - ${lesson.cliTasks.length} cli tasks`);
console.log(`  - ${lesson.summary.length} summary lines`);
console.log('  - all six learning objectives found');
console.log('  - all cli tasks accepted by checkCiscoInput');
