/**
 * NAT lesson validation
 *
 * Verifies that the new cisco-packet-tracer/nat lesson exists, has all required
 * content sections, and covers the eleven mandatory learning objectives from
 * the course sheet.
 */
import assert from 'node:assert/strict';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { checkCiscoInput } from '../src/lib/ciscoCli.js';

const KEY = 'cisco-packet-tracer/nat';
const lesson = LESSONS[KEY];

assert.ok(lesson, `LESSONS must contain ${KEY}`);
assert.ok(lesson.title, 'Lesson has a title');
assert.ok(lesson.explanations?.length >= 10, `Lesson has at least 10 explanation sections (has ${lesson.explanations?.length})`);
assert.ok(lesson.exercises?.length >= 3, `Lesson has at least 3 exercises (has ${lesson.exercises?.length})`);
assert.ok(lesson.quiz?.length >= 10, `Lesson has at least 10 quiz questions (has ${lesson.quiz?.length})`);
assert.ok(lesson.cliTasks?.length >= 3, `Lesson has at least 3 cliTasks (has ${lesson.cliTasks?.length})`);
assert.ok(lesson.summary?.length >= 5, `Lesson has at least 5 summary lines (has ${lesson.summary?.length})`);

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

// Eleven mandatory learning objectives.
assert.ok(containsAny(['nat', 'network address translation', 'übersetz']), 'Covers purpose of NAT');
assert.ok(containsAny(['inside local']), 'Covers Inside Local');
assert.ok(containsAny(['inside global']), 'Covers Inside Global');
assert.ok(containsAny(['outside local']), 'Covers Outside Local');
assert.ok(containsAny(['outside global']), 'Covers Outside Global');
assert.ok(containsAny(['statisch', 'static']), 'Covers static NAT');
assert.ok(containsAny(['dynamisch', 'dynamic']), 'Covers dynamic NAT');
assert.ok(containsAny(['pool']), 'Covers NAT pool');
assert.ok(containsAny(['pat', 'overload']), 'Covers PAT / Overload');
assert.ok(containsAny(['port forwarding', 'portforwarding', 'weiterleiten']), 'Covers port forwarding');
assert.ok(containsAny(['translations', 'statistics', 'verifizieren', 'show ip nat']), 'Covers NAT verification');

// All cliTasks must be accepted by the Cisco CLI checker.
for (const task of lesson.cliTasks || []) {
  const input = task.expectedLines.map((l) => (Array.isArray(l) ? l[0] : l)).join('\n');
  const result = checkCiscoInput(input, task.expectedLines);
  assert.ok(result.allCorrect, `cliTask "${task.prompt.slice(0, 60)}..." should be accepted as correct`);
}

console.log('NAT lesson validation passed:');
console.log(`  - ${lesson.explanations.length} sections`);
console.log(`  - ${lesson.exercises.length} exercises`);
console.log(`  - ${lesson.quiz.length} quiz questions`);
console.log(`  - ${lesson.cliTasks.length} cli tasks`);
console.log(`  - ${lesson.summary.length} summary lines`);
console.log('  - all eleven learning objectives found');
console.log('  - all cli tasks accepted by checkCiscoInput');
