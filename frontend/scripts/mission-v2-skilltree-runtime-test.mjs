// Runtime test for skillTree.js logic.
// Mocks localStorage and window so the module can run in Node.

import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

class Storage {
  constructor() {
    this.data = new Map();
  }
  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
  removeItem(key) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
}

const storage = new Storage();
global.localStorage = storage;
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

const { SKILL_DIMENSION, SKILL_SOURCE, recordSkillEvent, getSubskill, listAllSubskills, listSkillIds, nextSubskillForPractice, subskillsForLessonTopic } = await import(pathToFileURL(join(srcDir, 'lib/skillTree.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// 1. Skill tree has the expected number of subskills.
const all = listAllSubskills('cisco');
assert(all.length >= 80, `Expected at least 80 subskills, got ${all.length}`);

// 2. All skill IDs are unique.
const ids = listSkillIds('cisco');
assert(ids.length === new Set(ids).size, 'Skill IDs are not unique');

// 3. subskillsForLessonTopic returns concrete subskills for cisco-packet-tracer/nat.
const natSubskills = subskillsForLessonTopic('cisco-packet-tracer/nat');
assert(natSubskills.length >= 5, `Expected at least 5 NAT subskills, got ${natSubskills.length}`);
assert(natSubskills.some((s) => s.subskillId.includes('pat')), 'NAT PAT subskill should exist');
assert(natSubskills.some((s) => s.subskillId.includes('port_forwarding')), 'NAT port forwarding subskill should exist');

// 4. recordSkillEvent records a correct configure event and increases mastery.
const before = getSubskill('cisco', 'switching', 'trunk.allowed_vlans');
assert(before.mastery === 0, 'Initial mastery should be 0');
assert(before.dimensions[SKILL_DIMENSION.CONFIGURE].mastery === 0, 'Initial CONFIGURE dimension mastery should be 0');

recordSkillEvent('cisco', 'switching', 'trunk.allowed_vlans', {
  dimension: SKILL_DIMENSION.CONFIGURE,
  correct: true,
  difficulty: 2,
  attempts: 1,
  source: SKILL_SOURCE.LAB,
});

const after = getSubskill('cisco', 'switching', 'trunk.allowed_vlans');
assert(after.mastery > 0, 'Mastery should increase after correct event');
assert(after.dimensions[SKILL_DIMENSION.CONFIGURE].mastery > 0, 'CONFIGURE dimension mastery should increase');
assert(after.dimensions[SKILL_DIMENSION.KNOWLEDGE].mastery === 0, 'KNOWLEDGE dimension should remain 0 when not trained');
assert(after.state === 'practicing' || after.state === 'introduced', 'State should be introduced or practicing');

// 5. usedHint reduces mastery growth compared to no-hint success.
storage.clear();
recordSkillEvent('cisco', 'basic_configuration', 'interface_enable', {
  dimension: SKILL_DIMENSION.CONFIGURE,
  correct: true,
  usedHint: true,
  difficulty: 2,
});
const withHint = getSubskill('cisco', 'basic_configuration', 'interface_enable');

storage.clear();
recordSkillEvent('cisco', 'basic_configuration', 'interface_enable', {
  dimension: SKILL_DIMENSION.CONFIGURE,
  correct: true,
  usedHint: false,
  difficulty: 2,
});
const withoutHint = getSubskill('cisco', 'basic_configuration', 'interface_enable');
assert(withoutHint.mastery > withHint.mastery, 'Mastery without hint should be higher than with hint');

// 6. revealedSolution does not increase mastery.
storage.clear();
recordSkillEvent('cisco', 'basic_configuration', 'save_config', {
  dimension: SKILL_DIMENSION.CONFIGURE,
  revealedSolution: true,
  correct: true,
  difficulty: 2,
});
const afterReveal = getSubskill('cisco', 'basic_configuration', 'save_config');
assert(afterReveal.mastery === 0, 'Mastery should stay 0 after solution reveal');
assert(afterReveal.solutionRevealedCount === 1, 'solutionRevealedCount should be 1');

// 7. Incorrect event with misconception tracks the misconception.
storage.clear();
recordSkillEvent('cisco', 'acl', 'direction_in_out', {
  dimension: SKILL_DIMENSION.CONFIGURE,
  correct: false,
  misconception: 'acl_direction_confusion',
  cliError: false,
});
const afterWrong = getSubskill('cisco', 'acl', 'direction_in_out');
assert(afterWrong.incorrectCount === 1, 'incorrectCount should be 1');
assert(afterWrong.misconceptions['acl_direction_confusion'] === 1, 'Misconception should be recorded');

// 8. nextSubskillForPractice picks an unseen skill first.
storage.clear();
const next = nextSubskillForPractice('cisco');
assert(next !== null, 'nextSubskillForPractice should return a subskill');
assert(next.record.state === 'unseen', 'First practice subskill should be unseen');

console.log('Skill tree runtime test passed.');
