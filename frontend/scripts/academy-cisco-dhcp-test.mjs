// Milestone C7 (part 2): structural tests for the new Cisco "DHCP Relay"
// lesson - the practical skill of determining the correct Layer-3 interface
// for "ip helper-address" across the three existing routing scenarios
// (physical interface, Router on a Stick subinterface, MLS SVI), plus the
// DHCP-server-IP vs. client-gateway-IP distinction and troubleshooting.
import assert from 'node:assert/strict';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey, resolvePrerequisiteRef } from '../src/lib/academyTopics.js';
import { checkCiscoInput } from '../src/lib/ciscoCli.js';
import { collectCliTasksFromLesson, collectQuestionsFromLesson } from '../src/lib/academyThemencheck.js';

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('Catalog: no duplicate DHCP topics, new slot registered exactly once, reachable');
{
  test('cisco-packet-tracer/dhcp is registered exactly once in the catalog', () => {
    const matches = ACADEMY_TOPICS.filter((t) => t.categoryId === 'cisco-packet-tracer' && t.topicId === 'dhcp');
    assert.equal(matches.length, 1, 'expected exactly one cisco-packet-tracer/dhcp entry');
  });

  test('fundamentals/dhcp (Windows-focused DORA lesson) still exists untouched - no duplicate/replacement', () => {
    const matches = ACADEMY_TOPICS.filter((t) => t.categoryId === 'fundamentals' && t.topicId === 'dhcp');
    assert.equal(matches.length, 1, 'expected fundamentals/dhcp to still exist exactly once');
  });

  test('no topicId is duplicated within any single category (catalog-wide sanity check)', () => {
    const seen = new Map();
    for (const t of ACADEMY_TOPICS) {
      const key = topicKey(t.categoryId, t.topicId);
      assert.ok(!seen.has(key), `duplicate topic ${key}`);
      seen.set(key, true);
    }
  });

  test('cisco-packet-tracer/dhcp has lesson content', () => {
    assert.ok(hasLessonContent('cisco-packet-tracer', 'dhcp'));
  });

  // "packet-tracer-ui"/"connect-end-devices"/"switch-basics"/
  // "ip-configuration" were removed from the catalog entirely (Milestone:
  // Cisco-Struktur bereinigen); "basic-device-configuration" now has real
  // lesson content.
  const CONTENTLESS_PLACEHOLDERS = new Set(['acl', 'nat']);
  test('dhcp\'s prerequisite chain never requires a content-less placeholder', () => {
    const visited = new Set();
    const stack = [{ categoryId: 'cisco-packet-tracer', topicId: 'dhcp' }];
    while (stack.length) {
      const current = stack.pop();
      const key = topicKey(current.categoryId, current.topicId);
      if (visited.has(key)) continue;
      visited.add(key);
      const def = ACADEMY_TOPICS.find((t) => t.categoryId === current.categoryId && t.topicId === current.topicId);
      assert.ok(def, `missing topic definition for ${key}`);
      if (current.categoryId === 'cisco-packet-tracer' && CONTENTLESS_PLACEHOLDERS.has(current.topicId) && current.topicId !== 'dhcp') {
        assert.fail(`dhcp transitively depends on content-less placeholder "${current.topicId}"`);
      }
      for (const ref of def.prerequisites) {
        stack.push(resolvePrerequisiteRef(def.categoryId, ref));
      }
    }
  });

  test('dhcp depends on fundamentals/dhcp (conceptual DORA background)', () => {
    const def = ACADEMY_TOPICS.find((t) => t.categoryId === 'cisco-packet-tracer' && t.topicId === 'dhcp');
    assert.ok(def.prerequisites.includes('fundamentals/dhcp'));
  });
}

console.log('\nLesson structure and CLI task/exercise self-consistency');
{
  const lesson = LESSONS[topicKey('cisco-packet-tracer', 'dhcp')];

  test('dhcp: has explanations, exercises and quiz', () => {
    assert.ok(Array.isArray(lesson.explanations) && lesson.explanations.length > 0);
    assert.ok(Array.isArray(lesson.exercises) && lesson.exercises.length > 0);
    assert.ok(Array.isArray(lesson.quiz) && lesson.quiz.length > 0);
  });

  test('dhcp: has at least one cli-input exercise (CLI-first Praxis)', () => {
    const cliExercises = lesson.exercises.filter((e) => e.type === 'cli-input');
    assert.ok(cliExercises.length > 0);
  });

  test('dhcp: every cli-input exercise (incl. multi-line sequences) self-validates against the CLI engine', () => {
    const cliExercises = lesson.exercises.filter((e) => e.type === 'cli-input');
    for (const ex of cliExercises) {
      const sampleInput = ex.expectedLines.map((l) => (Array.isArray(l) ? l[0] : l)).join('\n');
      const outcome = checkCiscoInput(sampleInput, ex.expectedLines);
      assert.ok(outcome.allCorrect, `exercise ${ex.id} does not self-validate: ${JSON.stringify(outcome.results)}`);
    }
  });

  test('dhcp: at least one exercise is a genuinely multi-line CLI sequence', () => {
    const multiLine = lesson.exercises.filter((e) => e.type === 'cli-input' && e.expectedLines.length > 1);
    assert.ok(multiLine.length > 0, 'expected at least one multi-line cli-input exercise');
  });

  test('dhcp: has cliTasks for Praxis/Fachgespräch', () => {
    assert.ok(Array.isArray(lesson.cliTasks) && lesson.cliTasks.length > 0);
  });

  test('dhcp: every cliTask self-validates', () => {
    for (const task of lesson.cliTasks) {
      const sampleInput = task.expectedLines.map((l) => (Array.isArray(l) ? l[0] : l)).join('\n');
      const outcome = checkCiscoInput(sampleInput, task.expectedLines);
      assert.ok(outcome.allCorrect, `cliTask "${task.prompt}" does not self-validate: ${JSON.stringify(outcome.results)}`);
    }
  });

  test('dhcp: collectCliTasksFromLesson picks up all cliTasks with type \'cli\'', () => {
    const collected = collectCliTasksFromLesson(lesson, 'dhcp');
    assert.equal(collected.length, lesson.cliTasks.length);
    assert.ok(collected.every((c) => c.type === 'cli'));
  });

  test('dhcp: multiple-choice quiz/inline questions have a valid shape', () => {
    const mcPool = collectQuestionsFromLesson(lesson, 'dhcp');
    for (const q of mcPool) {
      assert.ok(typeof q.question === 'string' && q.question.length > 0);
      assert.ok(Array.isArray(q.options) && q.options.length >= 2);
      assert.ok(q.correct >= 0 && q.correct < q.options.length);
    }
  });
}

console.log('\nCore DHCP-Relay competency: correct interface, correct IP, all three scenarios, troubleshooting');
{
  const lesson = LESSONS[topicKey('cisco-packet-tracer', 'dhcp')];
  const allCliLines = [
    ...lesson.exercises.filter((e) => e.type === 'cli-input').flatMap((e) => e.expectedLines),
    ...lesson.cliTasks.flatMap((t) => t.expectedLines),
  ].map((l) => (Array.isArray(l) ? l[0] : l));

  test('"ip helper-address" appears in the CLI content', () => {
    assert.ok(allCliLines.some((l) => /^ip helper-address /.test(l)));
  });

  test('Scenario A: a plain physical interface (no dot1Q subinterface, no "vlan" SVI) carries a helper', () => {
    const ex = lesson.exercises.find((e) => e.id === 'dhcp-physisch-cli');
    assert.ok(ex);
    assert.ok(ex.expectedLines.includes('interface fa0/0'));
    assert.ok(ex.expectedLines.some((l) => /^ip helper-address /.test(l)));
  });

  test('Scenario B: a Router-on-a-Stick subinterface (encapsulation dot1Q) carries a helper', () => {
    const ex = lesson.exercises.find((e) => e.id === 'dhcp-subinterface-cli');
    assert.ok(ex);
    assert.ok(ex.expectedLines.some((l) => /^interface fa0\/0\.\d+$/.test(l)));
    assert.ok(ex.expectedLines.some((l) => /^encapsulation dot1q /i.test(l)));
    assert.ok(ex.expectedLines.some((l) => /^ip helper-address /.test(l)));
  });

  test('Scenario C: a Multilayer-Switch SVI ("interface vlan <id>") carries a helper', () => {
    const ex = lesson.exercises.find((e) => e.id === 'dhcp-svi-cli');
    assert.ok(ex);
    assert.ok(ex.expectedLines.some((l) => /^interface vlan \d+$/.test(l)));
    assert.ok(ex.expectedLines.some((l) => /^ip helper-address /.test(l)));
  });

  test('DHCP-server IP and client-gateway IP are never the same address in the "wo vs. welche IP" exercise (no accidental mix-up)', () => {
    const ex = lesson.exercises.find((e) => e.id === 'dhcp-wo-welche-select');
    assert.ok(ex);
    const correctOption = ex.options[ex.correct];
    assert.ok(/10\.20\.20\.20/.test(correctOption), 'expected the DHCP-server IP to be the correct answer');
    assert.ok(!/192\.168\.50\.1\b/.test(correctOption) || /10\.20\.20\.20/.test(correctOption), 'the gateway IP must not be the selected answer');
  });

  test('at least one harder multi-interface decision task exists (which subinterfaces need the helper)', () => {
    const ex = lesson.exercises.find((e) => e.id === 'dhcp-mehrfach-subinterface-select');
    assert.ok(ex, 'expected the multi-subinterface decision exercise');
    assert.ok(/fa0\/0\.10.*fa0\/0\.30|fa0\/0\.30.*fa0\/0\.10/.test(ex.options[ex.correct]));
  });

  test('at least one DHCP-relay troubleshooting exercise exists and is not purely multiple-choice', () => {
    const ex = lesson.exercises.find((e) => e.id === 'dhcp-troubleshooting-svi-cli');
    assert.ok(ex, 'expected a cli-input troubleshooting exercise');
    assert.equal(ex.type, 'cli-input');
    assert.ok(ex.expectedLines.some((l) => /^no ip helper-address /.test(l)), 'expected the fix to remove the wrong helper first');
  });

  test('the Packet-Tracer DHCP-pool explanation keeps "Default Gateway" (client network) and DHCP-server IP conceptually separate', () => {
    const poolQuestion = lesson.explanations
      .flatMap((e) => e.blocks)
      .find((b) => b.type === 'question' && /Default Gateway/.test(b.question));
    assert.ok(poolQuestion, 'expected the DHCP-pool default-gateway comprehension question');
    assert.ok(/Gateway des Clientnetzes/.test(poolQuestion.options[poolQuestion.correct]));
  });
}

console.log('\nExisting STP/SSH lessons remain unaffected by the DHCP addition');
{
  for (const topicId of ['stp', 'ssh']) {
    test(`${topicId}: still registered and has content`, () => {
      assert.ok(hasLessonContent('cisco-packet-tracer', topicId));
    });
  }
}

console.log(`\n${passed} passed`);
if (process.exitCode) {
  console.error('SOME TESTS FAILED');
} else {
  console.log('ALL TESTS PASSED');
}
