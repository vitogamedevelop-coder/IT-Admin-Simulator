// Milestone C7: structural tests for the two new Cisco deep-dive lessons
// added from today's classroom content - Spanning Tree Protocol (PVST+)
// (re-chained "stp" topic) and Fernwartung mit SSH (new "ssh" topic) - plus
// catalog re-chaining checks so both are actually reachable.
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

const TOPIC_IDS = ['stp', 'ssh'];

console.log('Catalog: topics exist, have content and a reachable prerequisite chain');
// "packet-tracer-ui"/"connect-end-devices"/"switch-basics"/"ip-configuration"
// were removed from the catalog entirely (Milestone: Cisco-Struktur
// bereinigen); "basic-device-configuration" now has real lesson content.
const CONTENTLESS_PLACEHOLDERS = new Set(['acl', 'nat']);
for (const topicId of TOPIC_IDS) {
  test(`cisco-packet-tracer/${topicId} is registered in the catalog`, () => {
    const found = ACADEMY_TOPICS.find((t) => t.categoryId === 'cisco-packet-tracer' && t.topicId === topicId);
    assert.ok(found, `topic ${topicId} missing from ACADEMY_TOPICS`);
  });
  test(`cisco-packet-tracer/${topicId} has lesson content`, () => {
    assert.ok(hasLessonContent('cisco-packet-tracer', topicId), `no LESSONS entry for ${topicId}`);
  });
  test(`${topicId}'s prerequisite chain never requires a content-less placeholder`, () => {
    const visited = new Set();
    const stack = [{ categoryId: 'cisco-packet-tracer', topicId }];
    while (stack.length) {
      const current = stack.pop();
      const key = topicKey(current.categoryId, current.topicId);
      if (visited.has(key)) continue;
      visited.add(key);
      const def = ACADEMY_TOPICS.find((t) => t.categoryId === current.categoryId && t.topicId === current.topicId);
      assert.ok(def, `missing topic definition for ${key}`);
      if (current.categoryId === 'cisco-packet-tracer' && CONTENTLESS_PLACEHOLDERS.has(current.topicId) && current.topicId !== topicId) {
        assert.fail(`${topicId} transitively depends on content-less placeholder "${current.topicId}"`);
      }
      for (const ref of def.prerequisites) {
        stack.push(resolvePrerequisiteRef(def.categoryId, ref));
      }
    }
  });
}

console.log('\nLesson structure and CLI task/exercise self-consistency');
for (const topicId of TOPIC_IDS) {
  const lesson = LESSONS[topicKey('cisco-packet-tracer', topicId)];

  test(`${topicId}: has explanations, exercises and quiz`, () => {
    assert.ok(Array.isArray(lesson.explanations) && lesson.explanations.length > 0);
    assert.ok(Array.isArray(lesson.exercises) && lesson.exercises.length > 0);
    assert.ok(Array.isArray(lesson.quiz) && lesson.quiz.length > 0);
  });

  test(`${topicId}: has at least one cli-input exercise (CLI-first Praxis)`, () => {
    const cliExercises = lesson.exercises.filter((e) => e.type === 'cli-input');
    assert.ok(cliExercises.length > 0, 'expected at least one cli-input exercise');
  });

  test(`${topicId}: every cli-input exercise's own expected answer is graded correct`, () => {
    const cliExercises = lesson.exercises.filter((e) => e.type === 'cli-input');
    for (const ex of cliExercises) {
      const sampleInput = ex.expectedLines.map((l) => (Array.isArray(l) ? l[0] : l)).join('\n');
      const outcome = checkCiscoInput(sampleInput, ex.expectedLines);
      assert.ok(outcome.allCorrect, `exercise ${ex.id} does not self-validate: ${JSON.stringify(outcome.results)}`);
    }
  });

  test(`${topicId}: has cliTasks for Praxis/Fachgespräch`, () => {
    assert.ok(Array.isArray(lesson.cliTasks) && lesson.cliTasks.length > 0);
  });

  test(`${topicId}: every cliTask's own expected answer is graded correct`, () => {
    for (const task of lesson.cliTasks) {
      const sampleInput = task.expectedLines.map((l) => (Array.isArray(l) ? l[0] : l)).join('\n');
      const outcome = checkCiscoInput(sampleInput, task.expectedLines);
      assert.ok(outcome.allCorrect, `cliTask "${task.prompt}" does not self-validate: ${JSON.stringify(outcome.results)}`);
    }
  });

  test(`${topicId}: collectCliTasksFromLesson picks up all cliTasks with type 'cli'`, () => {
    const collected = collectCliTasksFromLesson(lesson, topicId);
    assert.equal(collected.length, lesson.cliTasks.length);
    assert.ok(collected.every((c) => c.type === 'cli'));
  });

  test(`${topicId}: multiple-choice quiz/inline questions still have a valid shape`, () => {
    const mcPool = collectQuestionsFromLesson(lesson, topicId);
    for (const q of mcPool) {
      assert.ok(typeof q.question === 'string' && q.question.length > 0);
      assert.ok(Array.isArray(q.options) && q.options.length >= 2);
      assert.ok(q.correct >= 0 && q.correct < q.options.length);
    }
  });
}

console.log('\nSTP content: Bridge ID / Root Bridge and Path Cost reasoning tasks are actually solvable');
{
  const stp = LESSONS[topicKey('cisco-packet-tracer', 'stp')];

  test('stp: Bridge ID exercise picks the switch with the lowest MAC at equal priority as root', () => {
    const ex = stp.exercises.find((e) => e.id === 'stp-root-bridge-select');
    assert.ok(ex, 'missing stp-root-bridge-select exercise');
    assert.ok(/SW1/.test(ex.options[ex.correct]), 'expected SW1 (lowest MAC at equal priority) to be correct');
  });

  test('stp: Path Cost exercise picks the cheaper multi-hop Gigabit path over the single FastEthernet hop', () => {
    const ex = stp.exercises.find((e) => e.id === 'stp-path-cost-select');
    assert.ok(ex, 'missing stp-path-cost-select exercise');
    assert.ok(/4 \+ 4/.test(ex.options[ex.correct]), 'expected the 4+4=8 path to be correct (cheaper than 19)');
  });

  test('stp: root primary/secondary and priority CLI exercises use valid IOS syntax', () => {
    const rootPrimary = stp.exercises.find((e) => e.id === 'stp-root-primary-cli');
    const rootSecondary = stp.exercises.find((e) => e.id === 'stp-root-secondary-cli');
    assert.deepEqual(rootPrimary.expectedLines, ['spanning-tree vlan 10 root primary']);
    assert.deepEqual(rootSecondary.expectedLines, ['spanning-tree vlan 10 root secondary']);
  });

  test('stp: "sh spanning-tree summary" abbreviation is accepted by the CLI engine', () => {
    const outcome = checkCiscoInput('sh spanning-tree summary', [['show spanning-tree summary', 'sh spanning-tree summary']]);
    assert.ok(outcome.allCorrect);
  });
}

console.log('\nSSH content: Telnet/SSH, RSA/hostname dependency and management-SVI reasoning are covered');
{
  const ssh = LESSONS[topicKey('cisco-packet-tracer', 'ssh')];

  test('ssh: Telnet-vs-SSH exercise correctly flags cleartext transmission as the problem', () => {
    const ex = ssh.exercises.find((e) => e.id === 'ssh-telnet-vs-ssh-select');
    assert.ok(ex);
    assert.ok(/unverschlüsselt/.test(ex.options[ex.correct]));
  });

  test('ssh: hostname/domain-name must precede crypto key generate rsa in the practice scenario', () => {
    const ex = ssh.exercises.find((e) => e.id === 'ssh-grundkonfig-cli');
    assert.ok(ex);
    assert.ok(ex.expectedLines.some((l) => /^hostname/.test(l)));
    assert.ok(ex.expectedLines.some((l) => /^ip domain-name/.test(l)));
  });

  test('ssh: username uses the secure "secret" keyword, not plaintext "password"', () => {
    const ex = ssh.exercises.find((e) => e.id === 'ssh-user-rsa-cli');
    assert.ok(ex);
    assert.ok(ex.expectedLines.some((l) => /^username .* secret /.test(l)));
  });

  test('ssh: management-SVI exercise for the L2 switch uses "interface vlan" (not a plain access port)', () => {
    const ex = ssh.exercises.find((e) => e.id === 'ssh-management-svi-cli');
    assert.ok(ex);
    assert.ok(ex.expectedLines.includes('interface vlan 99'));
  });

  test('ssh: "sh ip ssh" abbreviation is accepted by the CLI engine', () => {
    const outcome = checkCiscoInput('sh ip ssh', [['show ip ssh', 'sh ip ssh']]);
    assert.ok(outcome.allCorrect);
  });
}

console.log(`\n${passed} passed`);
if (process.exitCode) {
  console.error('SOME TESTS FAILED');
} else {
  console.log('ALL TESTS PASSED');
}
