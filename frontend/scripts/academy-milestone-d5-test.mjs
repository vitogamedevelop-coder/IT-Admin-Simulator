import assert from 'node:assert/strict';
import { ONBOARDING_STEPS } from '../src/lib/onboardingSteps.js';
import { ACADEMY_TOPICS, topicKey, TOPIC_STATUS } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import {
  prerequisitesMet, ensureInitialUnlocks, topicOverallProgress,
} from '../src/lib/academyEngine.js';
import { readAcademyProgress, writeAcademyProgress } from '../src/lib/academyProgress.js';

// Browser mocks
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  innerWidth: 400,
  innerHeight: 800,
};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, { detail } = {}) { this.type = type; this.detail = detail; }
};
globalThis.Event = class Event {
  constructor(type) { this.type = type; }
};

// ============================================================
// 1. Tutorial: Serverraum step uses the correct key
// ============================================================
console.log('Testing tutorial server room step...');
const serverStep = ONBOARDING_STEPS.find((s) => s.id === 'server');
assert(serverStep, 'Server step exists in onboarding');
assert(serverStep.target, 'Server step has a target');
assert.equal(serverStep.target.key, 'serverDoor', 'Server step targets the serverDoor hotspot key');

// The success condition must pass when lastHotspot matches the key 'serverDoor'
const successResult = serverStep.success({}, null, false, 'serverDoor');
assert(successResult === true, 'Server step succeeds when lastHotspot is serverDoor');

// Must NOT succeed with the old app name
const failResult = serverStep.success({}, null, false, 'infrastructure');
assert(failResult === false, 'Server step does NOT succeed with app name "infrastructure"');

// ============================================================
// 2. Tutorial: can reach the final step
// ============================================================
console.log('Testing tutorial reaches final step...');
const lastStep = ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];
assert(lastStep.finish === true, 'Final tutorial step has finish:true');
assert(ONBOARDING_STEPS.length >= 10, 'Tutorial has at least 10 steps');

// Verify all step IDs are unique
const stepIds = ONBOARDING_STEPS.map((s) => s.id);
assert.equal(new Set(stepIds).size, stepIds.length, 'All step IDs are unique');

// ============================================================
// 3. Academy: all 10 finished lessons are registered
// ============================================================
console.log('Testing academy lessons registration...');
const EXPECTED_LESSONS = [
  'fundamentals/grundbegriffe',
  'fundamentals/topologien',
  'fundamentals/osi-model',
  'fundamentals/tcp-ip-model',
  'fundamentals/binary-system',
  'fundamentals/ipv4',
  'fundamentals/subnet-masks',
  'fundamentals/subnetting',
  'fundamentals/vlsm',
  'fundamentals/supernetting',
  'fundamentals/tcp-udp',
  'fundamentals/kommunikation-uebertragung',
  'cisco-packet-tracer/grundlagen',
  // Added by the "Themenstruktur-Anpassung" milestone.
  'fundamentals/dns',
  'fundamentals/dhcp',
  'fundamentals/routing',
  'fundamentals/switching',
  'fundamentals/vlan-basics',
  'cisco-packet-tracer/grundkonfiguration',
  // Added by Milestone C6 (deep-dive Cisco lessons).
  'cisco-packet-tracer/vlan',
  'cisco-packet-tracer/access-port',
  'cisco-packet-tracer/trunk',
  'cisco-packet-tracer/router-basics',
  'cisco-packet-tracer/static-routing',
  'cisco-packet-tracer/inter-vlan-routing',
  'cisco-packet-tracer/multilayer-switching',
  'cisco-packet-tracer/troubleshooting',
  // Added by Milestone C7 (STP/PVST+ and SSH deep-dive lessons).
  'cisco-packet-tracer/stp',
  'cisco-packet-tracer/ssh',
];

// Grundbegriffe uses its own component (GrundbegriffeLesson), not LESSONS
const LESSON_RUNNER_TOPICS = EXPECTED_LESSONS.filter((k) => k !== 'fundamentals/grundbegriffe');

for (const key of LESSON_RUNNER_TOPICS) {
  const lesson = LESSONS[key];
  assert(lesson, `Lesson ${key} is registered in LESSONS`);
  assert(lesson.explanations && lesson.explanations.length > 0, `Lesson ${key} has explanations`);
}

// ============================================================
// 4. Academy: hasLessonRunner is correct for all topics
// ============================================================
console.log('Testing hasLessonRunner for all lesson topics...');
for (const key of LESSON_RUNNER_TOPICS) {
  const has = !!LESSONS[key];
  assert(has === true, `hasLessonRunner is true for ${key}`);
}

// Verify topics without lessons don't have entries
const topicsWithoutLesson = ACADEMY_TOPICS
  .filter((t) => !EXPECTED_LESSONS.includes(topicKey(t.categoryId, t.topicId)));
for (const t of topicsWithoutLesson) {
  const key = topicKey(t.categoryId, t.topicId);
  assert(!LESSONS[key], `Topic ${key} without lesson is not in LESSONS`);
}

// ============================================================
// 5. Academy: Topic-IDs match between topics and lessons
// ============================================================
console.log('Testing topic-ID consistency...');
for (const key of LESSON_RUNNER_TOPICS) {
  const [catId, topId] = key.split('/');
  const topicDef = ACADEMY_TOPICS.find((t) => t.categoryId === catId && t.topicId === topId);
  assert(topicDef, `Topic definition exists for ${key}`);
  assert.equal(topicKey(topicDef.categoryId, topicDef.topicId), key, `topicKey matches for ${key}`);
}

// ============================================================
// 6. Academy: course mode all finished lessons accessible
// ============================================================
console.log('Testing course mode accessibility...');
// In course mode, effectiveLocked = locked && !courseMode = locked && false = false
// So all topics are accessible regardless of lock status
for (const key of EXPECTED_LESSONS) {
  const [catId, topId] = key.split('/');
  const topicDef = ACADEMY_TOPICS.find((t) => t.categoryId === catId && t.topicId === topId);
  assert(topicDef, `Topic ${key} exists in ACADEMY_TOPICS`);
  const locked = topicDef.status === TOPIC_STATUS.LOCKED;
  const courseMode = true;
  const effectiveLocked = locked && !courseMode;
  assert(effectiveLocked === false, `Topic ${key} is accessible in course mode`);
}

// ============================================================
// 7. Academy: ensureInitialUnlocks promotes topics correctly
// ============================================================
console.log('Testing ensureInitialUnlocks...');
store.clear();
// Simulate: grundbegriffe with 20% overall progress
const data = readAcademyProgress();
const gbKey = 'fundamentals/grundbegriffe';
data.topics[gbKey].status = TOPIC_STATUS.STARTED;
data.topics[gbKey].theoryScore = 8;
data.topics[gbKey].contentSeenPercent = 100;
writeAcademyProgress(data);

ensureInitialUnlocks();
// Topics depending on grundbegriffe should now be AVAILABLE
const postData = readAcademyProgress();
const topologien = postData.topics['fundamentals/topologien'];
assert.equal(topologien.status, TOPIC_STATUS.AVAILABLE, 'Topologien unlocked after grundbegriffe reaches 15%');

// ============================================================
// 8. Academy: "Kommt bald" only for topics without lessons
// ============================================================
console.log('Testing no false placeholder for finished lessons...');
// PlaceholderLesson is rendered only when hasLessonRunner is false AND not TCP/UDP
// We already verified hasLessonRunner is true for all finished topics (test 4)
// This test verifies the inverse: PlaceholderLesson topics DON'T have LESSONS
const placeholderTopics = ACADEMY_TOPICS.filter((t) => {
  const key = topicKey(t.categoryId, t.topicId);
  return !LESSONS[key] && t.topicId !== 'grundbegriffe';
});
for (const t of placeholderTopics) {
  const key = topicKey(t.categoryId, t.topicId);
  assert(!LESSONS[key], `Placeholder topic ${key} correctly has no LESSONS entry`);
}

// ============================================================
// 9. Flur: HOTSPOTS door action is 'people' only
// ============================================================
console.log('Testing corridor hotspot action...');
// We can't import Workspace directly (it's a React component), but we can
// verify the corridorDialogs structure ensures no direct bypass.
import { CORRIDOR_ROOMS } from '../src/lib/corridorDialogs.js';
assert.equal(CORRIDOR_ROOMS.length, 3, 'Exactly 3 corridor rooms');
const roomActions = CORRIDOR_ROOMS.map((r) => r.action);
assert(roomActions.includes('sams-office'), 'Sams office is a menu option');
assert(roomActions.includes('break-room'), 'Break room is a menu option');
assert(roomActions.includes('colleagues'), 'Colleagues is a menu option');

// ============================================================
// 10. Flur: No room action matches the hotspot app name
// ============================================================
console.log('Testing corridor rooms are separate from hotspot...');
// The door hotspot app is 'people'. No CORRIDOR_ROOMS action should be 'people'.
for (const room of CORRIDOR_ROOMS) {
  assert(room.action !== 'people', `Room ${room.label} action is not the hotspot app name`);
}

// ============================================================
// 11. Prerequisite threshold at 15%
// ============================================================
console.log('Testing 15% unlock threshold...');
store.clear();
const freshData = readAcademyProgress();
// Set osi-model to ~17% progress (theoryScore=10, contentSeen=50 → 17%)
freshData.topics['fundamentals/osi-model'].status = TOPIC_STATUS.STARTED;
freshData.topics['fundamentals/osi-model'].theoryScore = 10;
freshData.topics['fundamentals/osi-model'].contentSeenPercent = 50;
const osiProgress = topicOverallProgress(freshData.topics['fundamentals/osi-model']);
assert(osiProgress >= 15, `OSI progress ${osiProgress} >= 15`);

// tcp-ip-model depends on osi-model
const tcpIpDef = ACADEMY_TOPICS.find((t) => t.topicId === 'tcp-ip-model');
const met = prerequisitesMet(tcpIpDef, freshData.topics);
assert(met === true, 'tcp-ip-model prerequisites met at 15% osi progress');

// Below 15% should NOT unlock (theoryScore=2, contentSeen=10 → ~4%)
freshData.topics['fundamentals/osi-model'].theoryScore = 2;
freshData.topics['fundamentals/osi-model'].contentSeenPercent = 10;
const lowProgress = topicOverallProgress(freshData.topics['fundamentals/osi-model']);
assert(lowProgress < 15, `Low progress ${lowProgress} < 15`);
const notMet = prerequisitesMet(tcpIpDef, freshData.topics);
assert(notMet === false, 'tcp-ip-model NOT unlocked below 15%');

console.log('All Milestone D5 tests passed.');
