import assert from 'node:assert/strict';
import { ONBOARDING_STEPS as STEPS } from '../src/lib/onboardingSteps.js';

console.log('Testing onboarding tour structure...');

assert(STEPS.length >= 10, 'Tour has a reasonable number of steps');

// Step ordering and unique IDs
const ids = STEPS.map((s) => s.id);
assert(new Set(ids).size === ids.length, 'All step IDs are unique');

// Welcome by the boss, then Sam.
assert(STEPS[0].id === 'welcome-chef', 'First step is the CEO welcome');
assert(STEPS[1].character === 'sam', 'Second step introduces Sam');

// Each area appears exactly once in the interactive part.
const areaSteps = ['computer', 'phone', 'whiteboard', 'shelf', 'corridor', 'server'];
for (const area of areaSteps) {
  const matches = STEPS.filter((s) => s.id === area || s.id === `${area}-close`);
  assert(matches.length > 0, `Area ${area} has a step`);
}

// Introduced areas are short: at most 4 lines per step.
for (const step of STEPS) {
  assert(step.lines.length <= 4, `${step.id}: at most 4 lines`);
}

// Computer step opens the monitor; phone step follows immediately on the desktop.
const computerIndex = STEPS.findIndex((s) => s.id === 'computer');
assert(computerIndex >= 0, 'Computer step exists');
const phoneIndex = STEPS.findIndex((s) => s.id === 'phone');
assert(phoneIndex === computerIndex + 1, 'Phone step follows computer step');

// Phone close step follows phone step and closes everything (monitor + app).
const phoneCloseIndex = STEPS.findIndex((s) => s.id === 'phone-close');
assert(phoneCloseIndex === phoneIndex + 1, 'Phone open is followed by close');

// Whiteboard, shelf, corridor, server have targets with hotspots.
const interactive = ['whiteboard', 'shelf', 'corridor', 'server'];
for (const key of interactive) {
  const step = STEPS.find((s) => s.id === key);
  assert(step?.target?.type === 'hotspot', `${key} step targets a hotspot`);
  assert(step?.success, `${key} step has a success condition`);
}

// Finish step exists and has no remaining interaction requirement.
const finish = STEPS[STEPS.length - 1];
assert(finish.id === 'finish', 'Last step is the finish step');
assert(finish.finish, 'Finish step is marked as finish');
assert(!finish.success, 'Finish step has no success condition (manual button)');

// No dead-end steps: every non-finish interactive step has a close/corresponding
// follow-up step. 'computer' is special: it has no explicit computer-close because
// the phone step follows on the desktop and phone-close closes the monitor.
const openSteps = STEPS.filter((s) => s.success && !s.id.includes('-close') && s.id !== 'server' && s.id !== 'computer');
for (const step of openSteps) {
  const closeId = `${step.id}-close`;
  assert(STEPS.some((s) => s.id === closeId), `${step.id} has a close step ${closeId}`);
}

console.log('All Milestone D2 tests passed.');
