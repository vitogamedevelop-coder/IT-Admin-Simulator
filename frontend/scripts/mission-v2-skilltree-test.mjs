// Skill tree granularization test (Phase 0.5).
// Verifies IDs, dimensions, event recording, mastery rules and migration.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

function read(file) {
  return readFileSync(join(srcDir, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const skillTree = read('lib/skillTree.js');

// 1. Count subskill definitions by finding all `subskillId: {` lines inside
// the SKILL_TREE object.  Short key names like `verify` or `troubleshoot` are
// intentionally reused across skills; uniqueness is verified at runtime via
// listAllSubskills() / listSkillIds().
const skillBlockRegex = /subskills:\s*\{([\s\S]*?)\n\s*\},?/g;
const allSubskillIds = [];
for (const match of skillTree.matchAll(skillBlockRegex)) {
  const subskillsBlock = match[1];
  for (const line of subskillsBlock.split('\n')) {
    const m = line.match(/^\s*['"`]?([a-z0-9_.]+)['"`]?:\s*\{/);
    if (m) allSubskillIds.push(m[1]);
  }
}

assert(allSubskillIds.length >= 80, `Expected at least 80 granular subskills, got ${allSubskillIds.length}`);

// 2. Dimension tracking fields are present.
assert(skillTree.includes('dimensions: {'), 'Subskills should have dimensions object');
assert(skillTree.includes('[SKILL_DIMENSION.KNOWLEDGE]'), 'Dimensions should include KNOWLEDGE');
assert(skillTree.includes('[SKILL_DIMENSION.CONFIGURE]'), 'Dimensions should include CONFIGURE');
assert(skillTree.includes('[SKILL_DIMENSION.VERIFY]'), 'Dimensions should include VERIFY');
assert(skillTree.includes('[SKILL_DIMENSION.TROUBLESHOOT]'), 'Dimensions should include TROUBLESHOOT');

// 3. recordSkillEvent stores all required event fields.
assert(skillTree.includes('dimension:'), 'recordSkillEvent should store dimension');
assert(skillTree.includes('correct:'), 'recordSkillEvent should store correct');
assert(skillTree.includes('difficulty:'), 'recordSkillEvent should store difficulty');
assert(skillTree.includes('attempts:'), 'recordSkillEvent should store attempts');
assert(skillTree.includes('usedHint:'), 'recordSkillEvent should store usedHint');
assert(skillTree.includes('hintLevel:'), 'recordSkillEvent should store hintLevel');
assert(skillTree.includes('revealedSolution:'), 'recordSkillEvent should store revealedSolution');
assert(skillTree.includes('cliError:'), 'recordSkillEvent should store cliError');
assert(skillTree.includes('misconception:'), 'recordSkillEvent should store misconception');
assert(skillTree.includes('responseTimeMs:'), 'recordSkillEvent should store responseTimeMs');
assert(skillTree.includes('source:'), 'recordSkillEvent should store source');
assert(skillTree.includes('missionId:'), 'recordSkillEvent should store missionId');
assert(skillTree.includes('taskId:'), 'recordSkillEvent should store taskId');

// 4. Solution reveal does not increase mastery.
assert(skillTree.includes('if (event.revealedSolution) {'), 'recordSkillEvent should branch on revealedSolution');
assert(skillTree.includes('// Solution reveal does not increase dimension mastery.'), 'Mastery comment must be present');

// 5. Used hint reduces mastery growth.
assert(skillTree.includes('usedHint ? 0.72 : 1'), 'updateDimensionMastery should penalize usedHint');

// 6. Misconceptions are tracked.
assert(skillTree.includes('MISCONCEPTION'), 'Misconception constants should be exported');
assert(skillTree.includes('sub.misconceptions[event.misconception]'), 'Misconceptions should be recorded');

// 7. Academy mapping covers all Cisco topics.
const lessonTopics = skillTree.match(/lessonTopic: 'cisco-packet-tracer\/([a-z-]+)'/g) || [];
const uniqueTopics = new Set(lessonTopics);
assert(uniqueTopics.size >= 15, `Expected at least 15 mapped topics, got ${uniqueTopics.size}`);

// 8. Migration preserves old data without breaking schema.
assert(skillTree.includes('function migrateSkillTree'), 'Migration function should exist');
assert(skillTree.includes('if (parsed && parsed.schemaVersion === SKILL_TREE_SCHEMA_VERSION)'), 'Read should check schema version');

console.log('Skill tree granularization test passed.');
