// Milestone: Cisco Academy Struktur bereinigen und Grundkonfiguration
// zusammenfuehren.
//
// Verifies:
// 1. "Packet Tracer Oberflaeche", "Endgeraete verbinden" and "Switch-
//    Grundlagen" are fully removed from the catalog (not just hidden).
// 2. The separate "IP-Konfiguration" placeholder is gone too, merged into
//    "basic-device-configuration" (now "Grundkonfiguration & IP-
//    Konfiguration").
// 3. No dead/duplicate topic IDs, no unreachable prerequisites anywhere in
//    the Cisco category.
// 4. The new combined lesson exists, is structurally valid, is CLI-heavy,
//    and self-validates against the CLI engine (incl. a multi-line
//    fresh-device scenario).
// 5. It covers the required curriculum points: no/do, hostname/domain-name,
//    enable secret vs. enable password, local user, login vs. login local,
//    console security, password security, ip domain-lookup, interface/IP/
//    no shutdown, verification, saving.
// 6. generateThemencheck() for "cisco-packet-tracer" dynamically includes
//    questions sourced from the new lesson, and never references the
//    removed placeholder topics.
// 7. Legacy save-data migration folds old "ip-configuration" progress into
//    "basic-device-configuration", and progress for the three removed
//    topics is silently dropped (no crash, no orphaned entries).
import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey, resolvePrerequisiteRef, topicsForCategory } from '../src/lib/academyTopics.js';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';
import { validateLessonDefinition } from '../src/lib/validateLessonDefinition.js';
import { checkCiscoInput } from '../src/lib/ciscoCli.js';
import { collectCliTasksFromLesson, collectQuestionsFromLesson, generateThemencheck } from '../src/lib/academyThemencheck.js';

// Browser mocks (readAcademyProgress/writeAcademyProgress touch localStorage).
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
globalThis.CustomEvent = class CustomEvent { constructor(type, { detail } = {}) { this.type = type; this.detail = detail; } };

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

const REMOVED_TOPIC_IDS = ['packet-tracer-ui', 'connect-end-devices', 'switch-basics', 'ip-configuration'];

console.log('1. Removed placeholders are fully gone from the catalog');
{
  const ciscoTopics = topicsForCategory('cisco-packet-tracer');
  for (const topicId of REMOVED_TOPIC_IDS) {
    test(`"${topicId}" no longer exists in ACADEMY_TOPICS`, () => {
      assert.ok(!ciscoTopics.some((t) => t.topicId === topicId));
    });
    test(`"${topicId}" has no LESSONS entry`, () => {
      assert.ok(!LESSONS[topicKey('cisco-packet-tracer', topicId)]);
    });
    test(`no remaining topic still lists "${topicId}" as a prerequisite`, () => {
      for (const t of ACADEMY_TOPICS) {
        for (const ref of t.prerequisites) {
          const resolved = resolvePrerequisiteRef(t.categoryId, ref);
          assert.ok(!(resolved.categoryId === 'cisco-packet-tracer' && resolved.topicId === topicId),
            `${topicKey(t.categoryId, t.topicId)} still depends on removed topic "${topicId}"`);
        }
      }
    });
  }
}

console.log('\n2. No dead/duplicate topic IDs, no unreachable prerequisites (whole catalog)');
{
  test('no topicId is duplicated within any category', () => {
    const seen = new Set();
    for (const t of ACADEMY_TOPICS) {
      const key = topicKey(t.categoryId, t.topicId);
      assert.ok(!seen.has(key), `duplicate topic ${key}`);
      seen.add(key);
    }
  });

  test('every prerequisite reference resolves to a topic that actually exists', () => {
    for (const t of ACADEMY_TOPICS) {
      for (const ref of t.prerequisites) {
        const { categoryId, topicId } = resolvePrerequisiteRef(t.categoryId, ref);
        const found = ACADEMY_TOPICS.find((x) => x.categoryId === categoryId && x.topicId === topicId);
        assert.ok(found, `${topicKey(t.categoryId, t.topicId)} references missing prerequisite ${categoryId}/${topicId}`);
      }
    }
  });

  test('no circular prerequisite chains in the Cisco category', () => {
    const ciscoTopics = topicsForCategory('cisco-packet-tracer');
    for (const topic of ciscoTopics) {
      const startKey = topicKey(topic.categoryId, topic.topicId);
      // DFS with a path-local "currently on stack" set - a cycle exists only
      // if we revisit a node that is an ANCESTOR in the current path, not
      // merely a node reachable via two different sibling branches (a
      // diamond dependency, which is normal and not a cycle).
      const onPath = new Set();
      const dfs = (categoryId, topicId) => {
        const key = topicKey(categoryId, topicId);
        assert.ok(!onPath.has(key), `cycle detected: "${key}" is its own (transitive) prerequisite, reached while resolving ${startKey}`);
        onPath.add(key);
        const def = ACADEMY_TOPICS.find((t) => t.categoryId === categoryId && t.topicId === topicId);
        for (const ref of def.prerequisites) {
          const resolved = resolvePrerequisiteRef(def.categoryId, ref);
          dfs(resolved.categoryId, resolved.topicId);
        }
        onPath.delete(key);
      };
      dfs(topic.categoryId, topic.topicId);
    }
  });
}

console.log('\n3. "basic-device-configuration" is the new combined lesson, reachable from grundlagen');
{
  const def = ACADEMY_TOPICS.find((t) => t.categoryId === 'cisco-packet-tracer' && t.topicId === 'basic-device-configuration');
  test('topic exists exactly once', () => {
    const matches = ACADEMY_TOPICS.filter((t) => t.categoryId === 'cisco-packet-tracer' && t.topicId === 'basic-device-configuration');
    assert.equal(matches.length, 1);
  });
  test('title reflects the merge', () => {
    assert.equal(def.title, 'Grundkonfiguration & IP-Konfiguration');
  });
  test('prerequisites are only "grundlagen" (no dependency on removed topics)', () => {
    assert.deepEqual(def.prerequisites, ['grundlagen']);
  });
  test('has lesson content and passes structural validation', () => {
    const key = topicKey('cisco-packet-tracer', 'basic-device-configuration');
    assert.ok(hasLessonContent('cisco-packet-tracer', 'basic-device-configuration'));
    assert.deepEqual(validateLessonDefinition(LESSONS[key], key), []);
  });
}

console.log('\n4. Combined lesson is CLI-heavy and self-validates against the engine');
{
  const lesson = LESSONS[topicKey('cisco-packet-tracer', 'basic-device-configuration')];

  test('has explanations, exercises and quiz', () => {
    assert.ok(lesson.explanations.length > 0 && lesson.exercises.length > 0 && lesson.quiz.length > 0);
  });

  test('the majority of exercises are cli-input (CLI-heavy practice as required)', () => {
    const cliCount = lesson.exercises.filter((e) => e.type === 'cli-input').length;
    assert.ok(cliCount > lesson.exercises.length / 2, `expected majority cli-input, got ${cliCount}/${lesson.exercises.length}`);
  });

  test('every cli-input exercise self-validates, including multi-line ones', () => {
    const cliExercises = lesson.exercises.filter((e) => e.type === 'cli-input');
    for (const ex of cliExercises) {
      const sampleInput = ex.expectedLines.map((l) => (Array.isArray(l) ? l[0] : l)).join('\n');
      const outcome = checkCiscoInput(sampleInput, ex.expectedLines);
      assert.ok(outcome.allCorrect, `exercise ${ex.id} does not self-validate: ${JSON.stringify(outcome.results)}`);
    }
  });

  test('the fresh-device scenario (section 8 of the brief) exists as one multi-line cli-input exercise', () => {
    const ex = lesson.exercises.find((e) => e.id === 'basic-fabrikneu-scenario-cli');
    assert.ok(ex, 'expected the "fabrikneuer Router" scenario exercise');
    assert.ok(ex.expectedLines.length >= 6, 'expected a genuinely multi-step command sequence');
    assert.ok(ex.expectedLines.some((l) => /^hostname /.test(l)));
    assert.ok(ex.expectedLines.some((l) => /^ip domain-name /.test(l)));
    assert.ok(ex.expectedLines.some((l) => /^username .* secret /.test(l)));
    assert.ok(ex.expectedLines.some((l) => /^interface /.test(l)));
    assert.ok(ex.expectedLines.some((l) => /^ip address /.test(l)));
    assert.ok(ex.expectedLines.some((l) => l === 'no shutdown'));
    assert.ok(ex.expectedLines.some((l) => /^copy running-config startup-config$/.test(l)));
  });

  test('has cliTasks for Praxis/Fachgespraech, all self-validating', () => {
    assert.ok(lesson.cliTasks.length > 0);
    for (const tsk of lesson.cliTasks) {
      const sampleInput = tsk.expectedLines.map((l) => (Array.isArray(l) ? l[0] : l)).join('\n');
      const outcome = checkCiscoInput(sampleInput, tsk.expectedLines);
      assert.ok(outcome.allCorrect, `cliTask "${tsk.prompt}" does not self-validate`);
    }
  });

  test('collectCliTasksFromLesson picks up all cliTasks', () => {
    const collected = collectCliTasksFromLesson(lesson, 'basic-device-configuration');
    assert.equal(collected.length, lesson.cliTasks.length);
  });

  test('multiple-choice quiz/inline questions have a valid shape', () => {
    const mcPool = collectQuestionsFromLesson(lesson, 'basic-device-configuration');
    for (const q of mcPool) {
      assert.ok(typeof q.question === 'string' && q.question.length > 0);
      assert.ok(Array.isArray(q.options) && q.options.length >= 2);
      assert.ok(q.correct >= 0 && q.correct < q.options.length);
    }
  });
}

console.log('\n5. Required curriculum points are actually covered');
{
  const lesson = LESSONS[topicKey('cisco-packet-tracer', 'basic-device-configuration')];
  const allText = lesson.explanations
    .flatMap((e) => e.blocks.map((b) => [b.title, b.content, b.question, JSON.stringify(b.rows || ''), JSON.stringify(b.items || '')].join(' ')))
    .join(' ');
  const allCliLines = [
    ...lesson.exercises.filter((e) => e.type === 'cli-input').flatMap((e) => e.expectedLines),
    ...lesson.cliTasks.flatMap((t) => t.expectedLines),
  ].map((l) => (Array.isArray(l) ? l[0] : l));

  const REQUIRED_TERMS = [
    'no shutdown', 'ip domain-lookup', 'do show running-config', 'hostname', 'ip domain-name',
    'enable secret', 'enable password', 'Privilege', 'username', 'secret',
    'login local', 'line console 0', 'service password-encryption',
    'interface', 'ip address', 'show ip interface brief', 'show running-config',
    'copy running-config startup-config', 'startup-config',
  ];
  for (const term of REQUIRED_TERMS) {
    test(`theory/exercises mention "${term}"`, () => {
      assert.ok(allText.includes(term) || allCliLines.some((l) => l.includes(term)), `"${term}" not found anywhere in the lesson`);
    });
  }

  test('"no" and "do" are each explicitly taught with a practical example, not just a definition', () => {
    assert.ok(allCliLines.includes('no shutdown'));
    assert.ok(allCliLines.includes('no ip domain-lookup'));
    assert.ok(allCliLines.some((l) => /^do show run/.test(l)));
  });

  test('login vs. login local distinction has a dedicated comprehension question', () => {
    const q = lesson.explanations.flatMap((e) => e.blocks)
      .find((b) => b.type === 'question' && Array.isArray(b.options) && b.options.includes('login local') && b.options.includes('login'));
    assert.ok(q, 'expected a comprehension question that lets the learner choose between "login" and "login local"');
  });

  test('ip domain-lookup troubleshooting scenario (mistyped command / delay) is present', () => {
    const q = lesson.explanations.flatMap((e) => e.blocks).find((b) => b.type === 'question' && /vertipp/.test(b.question || ''));
    assert.ok(q, 'expected the mistyped-command / ip domain-lookup delay scenario');
  });

  test('interface-stays-down troubleshooting (IP correct, but no shutdown missing) is present', () => {
    const ex = lesson.exercises.find((e) => e.id === 'basic-interface-down-troubleshoot-cli');
    assert.ok(ex, 'expected the administratively-down troubleshooting exercise');
  });
}

console.log('\n6. Cisco Themencheck dynamically includes the new lesson, never references removed topics');
{
  test('generateThemencheck("cisco-packet-tracer") includes at least one question sourced from basic-device-configuration', () => {
    // Run a few times since the generator shuffles/samples per topic.
    let found = false;
    for (let i = 0; i < 20 && !found; i++) {
      const questions = generateThemencheck('cisco-packet-tracer');
      found = questions.some((q) => q.sourceTopicId === 'basic-device-configuration');
    }
    assert.ok(found, 'expected at least one Themencheck run (of 20) to include a basic-device-configuration question');
  });

  test('no Themencheck question is ever sourced from a removed placeholder topic', () => {
    for (let i = 0; i < 10; i++) {
      const questions = generateThemencheck('cisco-packet-tracer');
      for (const q of questions) {
        assert.ok(!REMOVED_TOPIC_IDS.includes(q.sourceTopicId), `Themencheck question sourced from removed topic "${q.sourceTopicId}"`);
      }
    }
  });
}

console.log('\n7. Legacy progress migration: ip-configuration folded into basic-device-configuration, removed topics dropped cleanly');
{
  test('migrateProgress folds old ip-configuration progress into basic-device-configuration', async () => {
    const { readAcademyProgress, writeAcademyProgress } = await import('../src/lib/academyProgress.js');
    store.clear();
    const legacySave = {
      stateVersion: 6,
      playerProfile: {},
      topics: {
        'cisco-packet-tracer/ip-configuration': {
          status: 'applied', theoryScore: 80, practiceScore: 60, retentionScore: 0,
          contentSeenPercent: 100, lessonCompletions: 2, quizAttempts: 3, quizPerfectCount: 1, quizBestScore: 90,
          completedSectionIds: ['a', 'b'], completedQuestionIds: ['q1'], completedExerciseIds: ['e1'],
        },
        'cisco-packet-tracer/packet-tracer-ui': { status: 'started', theoryScore: 10 },
        'cisco-packet-tracer/connect-end-devices': { status: 'started', theoryScore: 5 },
        'cisco-packet-tracer/switch-basics': { status: 'available', theoryScore: 0 },
      },
    };
    localStorage.setItem('cyberlearn:academy-progress-v1', JSON.stringify(legacySave));
    const migrated = readAcademyProgress();
    const merged = migrated.topics['cisco-packet-tracer/basic-device-configuration'];
    assert.ok(merged, 'expected a merged entry for basic-device-configuration');
    assert.equal(merged.theoryScore, 80);
    assert.equal(merged.practiceScore, 60);
    assert.equal(merged.status, 'applied');
    assert.ok(merged.completedSectionIds.includes('a') && merged.completedSectionIds.includes('b'));
    // Removed topics must not resurface anywhere in the migrated save.
    assert.ok(!migrated.topics['cisco-packet-tracer/packet-tracer-ui']);
    assert.ok(!migrated.topics['cisco-packet-tracer/connect-end-devices']);
    assert.ok(!migrated.topics['cisco-packet-tracer/switch-basics']);
    assert.ok(!migrated.topics['cisco-packet-tracer/ip-configuration']);
    // Sanity: writing back and re-reading doesn't crash or reintroduce stale keys.
    writeAcademyProgress(migrated);
    const reread = readAcademyProgress();
    assert.ok(reread.topics['cisco-packet-tracer/basic-device-configuration']);
    store.clear();
  });
}

console.log(`\n${passed} passed`);
if (process.exitCode) {
  console.error('SOME TESTS FAILED');
} else {
  console.log('ALL TESTS PASSED');
}
