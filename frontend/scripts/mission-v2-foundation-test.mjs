// Foundation test for Mission System V2:
// - skillTree granular structure and event recording
// - missionTypes registry
// - missionEvents trigger evaluation
// - missionChecklist routine matrix
// - missionHintSystem escalation and solution recording

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

// 1. Skill tree has all required Cisco skills and granular subskills.
const skillTree = read('lib/skillTree.js');
const requiredSkills = [
  'basic_configuration',
  'switching',
  'routing',
  'multilayer_switching',
  'stp',
  'remote_administration',
  'dhcp',
  'acl',
  'packet_filter',
  'nat',
  'verification',
];
for (const skill of requiredSkills) {
  assert(skillTree.includes(`${skill}:`), `Skill tree should contain ${skill}`);
}

// Granular subskills required by Phase 0.5.
// Each entry is [skillId, subskillId].
const requiredSubskills = [
  ['basic_configuration', 'interface_enable'],
  ['switching', 'trunk.allowed_vlans'],
  ['switching', 'trunk.native_vlan'],
  ['routing', 'ospf.wildcard'],
  ['routing', 'ospf.network_method'],
  ['routing', 'ospf.interface_method'],
  ['multilayer_switching', 'ip_routing'],
  ['stp', 'portfast'],
  ['remote_administration', 'rsa_keys'],
  ['dhcp', 'helper_address'],
  ['acl', 'wildcard'],
  ['acl', 'extended.ports'],
  ['packet_filter', 'cbac_inspect_rule'],
  ['nat', 'pat.interface_overload'],
  ['nat', 'port_forwarding'],
];
for (const [skillId, subskillId] of requiredSubskills) {
  assert(skillTree.includes(subskillId), `Skill tree should contain granular subskill ${skillId}.${subskillId}`);
}

assert(skillTree.includes('recordSkillEvent'), 'skillTree should export recordSkillEvent');
assert(skillTree.includes('COMPETENCY_STATE'), 'skillTree should export COMPETENCY_STATE');
assert(skillTree.includes('UNSEEN:'), 'Skill tree should define UNSEEN state');
assert(skillTree.includes('SKILL_DIMENSION'), 'Skill tree should define SKILL_DIMENSION');
assert(skillTree.includes('KNOWLEDGE:'), 'Skill tree should define KNOWLEDGE dimension');
assert(skillTree.includes('CONFIGURE:'), 'Skill tree should define CONFIGURE dimension');
assert(skillTree.includes('VERIFY:'), 'Skill tree should define VERIFY dimension');
assert(skillTree.includes('TROUBLESHOOT:'), 'Skill tree should define TROUBLESHOOT dimension');
assert(skillTree.includes('solutionRevealedCount'), 'Skill event tracking should count revealed solutions');
assert(skillTree.includes('successWithoutHelpStreak'), 'Skill event tracking should count success streaks');
assert(skillTree.includes('SKILL_TREE_SCHEMA_VERSION'), 'Skill tree should have a schema version');
assert(skillTree.includes('migrateSkillTree'), 'Skill tree should have a migration function');
assert(skillTree.includes('subskillsForLessonTopic'), 'Skill tree should map lesson topics to subskills');

// 2. Mission types has four archetypes.
const missionTypes = read('lib/missionTypes.js');
assert(missionTypes.includes("MAIN: 'main'"), 'missionTypes should define MAIN');
assert(missionTypes.includes("TICKET: 'ticket'"), 'missionTypes should define TICKET');
assert(missionTypes.includes("LAB: 'lab'"), 'missionTypes should define LAB');
assert(missionTypes.includes("CONVERSATION: 'conversation'"), 'missionTypes should define CONVERSATION');
assert(missionTypes.includes('DIFFICULTY_LEVEL'), 'missionTypes should define DIFFICULTY_LEVEL');
assert(missionTypes.includes('defineMission'), 'missionTypes should export defineMission');
assert(missionTypes.includes('missionSummary'), 'missionTypes should export missionSummary');

// 3. Event system has triggers and event log.
const missionEvents = read('lib/missionEvents.js');
assert(missionEvents.includes('EVENT_TRIGGER'), 'missionEvents should define EVENT_TRIGGER');
assert(missionEvents.includes('EVENT_TYPE'), 'missionEvents should define EVENT_TYPE');
assert(missionEvents.includes('canEventFire'), 'missionEvents should export canEventFire');
assert(missionEvents.includes('evaluateTrigger'), 'missionEvents should export evaluateTrigger');
assert(missionEvents.includes('recordEvent'), 'missionEvents should export recordEvent');

// 4. Checklist has routine steps and device matrix.
const missionChecklist = read('lib/missionChecklist.js');
assert(missionChecklist.includes('ROUTINE_STEP'), 'missionChecklist should define ROUTINE_STEP');
assert(missionChecklist.includes('DEFAULT_ROUTINE'), 'missionChecklist should define DEFAULT_ROUTINE');
assert(missionChecklist.includes('DEVICE_ROUTINE_MATRIX'), 'missionChecklist should define DEVICE_ROUTINE_MATRIX');
assert(missionChecklist.includes('createChecklist'), 'missionChecklist should export createChecklist');
assert(missionChecklist.includes('buildExamMission'), 'missionChecklist should export buildExamMission');
assert(missionChecklist.includes('IDENTIFY_DEVICE'), 'Routine should start with device identification');
assert(missionChecklist.includes('VERIFICATION'), 'Routine should end with verification');

// 5. Hint system has escalation levels and solution recording.
const missionHintSystem = read('lib/missionHintSystem.js');
assert(missionHintSystem.includes('HINT_LEVEL'), 'missionHintSystem should define HINT_LEVEL');
assert(missionHintSystem.includes('HINT_LEVEL.SOLUTION'), 'missionHintSystem should define SOLUTION level');
assert(missionHintSystem.includes('defineHintLadder'), 'missionHintSystem should export defineHintLadder');
assert(missionHintSystem.includes('consumeHint'), 'missionHintSystem should export consumeHint');
assert(missionHintSystem.includes('revealSolution'), 'missionHintSystem should export revealSolution');
assert(missionHintSystem.includes('buildSolutionExplanation'), 'missionHintSystem should export buildSolutionExplanation');
assert(missionHintSystem.includes('revealedSolution: true'), 'Solution reveal must record revealedSolution: true');
assert(missionHintSystem.includes("subskillPath: 'cisco.basic_configuration.interface_enable'"), 'no shutdown hint ladder should exist');

console.log('Mission V2 foundation test passed.');
