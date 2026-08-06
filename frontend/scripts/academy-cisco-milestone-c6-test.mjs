// Milestone C6 (part 2): structural tests for the new deep-dive Cisco
// lessons (VLAN, Access-Port, Trunk, Router-Grundlagen, Statisches Routing,
// Router on a Stick, Multilayer Switch, Troubleshooting) and for the
// catalog changes (new "multilayer-switching" topic, re-chained
// prerequisites so the whole chain is actually reachable).
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

const NEW_TOPIC_IDS = [
  'vlan', 'access-port', 'trunk', 'router-basics', 'static-routing',
  'inter-vlan-routing', 'multilayer-switching', 'troubleshooting',
];

console.log('Catalog: new/re-chained topics exist and have content');
for (const topicId of NEW_TOPIC_IDS) {
  test(`cisco-packet-tracer/${topicId} is registered in the catalog`, () => {
    const found = ACADEMY_TOPICS.find((t) => t.categoryId === 'cisco-packet-tracer' && t.topicId === topicId);
    assert.ok(found, `topic ${topicId} missing from ACADEMY_TOPICS`);
  });
  test(`cisco-packet-tracer/${topicId} has lesson content`, () => {
    assert.ok(hasLessonContent('cisco-packet-tracer', topicId), `no LESSONS entry for ${topicId}`);
  });
}

console.log('\nPrerequisite chain is reachable (no dependency on content-less placeholders)');
const CONTENTLESS_PLACEHOLDERS = new Set(['packet-tracer-ui', 'connect-end-devices', 'switch-basics', 'basic-device-configuration', 'ip-configuration']);
for (const topicId of NEW_TOPIC_IDS) {
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
for (const topicId of NEW_TOPIC_IDS) {
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

console.log(`\n${passed} passed`);
if (process.exitCode) {
  console.error('SOME TESTS FAILED');
} else {
  console.log('ALL TESTS PASSED');
}
