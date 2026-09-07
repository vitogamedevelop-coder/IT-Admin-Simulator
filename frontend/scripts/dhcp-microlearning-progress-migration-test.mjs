import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

import { readAcademyProgress } from '../src/lib/academyProgress.js';

const KEY = 'cyberlearn:academy-progress-v1';

const legacy = {
  stateVersion: 13,
  topics: {
    'cisco-packet-tracer/dhcp': {
      status: 'started',
      theoryScore: 12,
      practiceScore: 0,
      completedSectionIds: ['problem-classic', 'wo-vs-welche-ip-classic', 'summary-classic'],
      completedQuestionIds: [],
      completedExerciseIds: ['dhcp-wo-welche-select', 'dhcp-troubleshooting-svi-cli', 'dhcp-physisch-cli'],
      lessonCompletions: 0,
      theoryCompletion: 50,
      contentSeenPercent: 45,
    },
  },
};

store.set(KEY, JSON.stringify(legacy));

const data = readAcademyProgress();
assert.equal(data.stateVersion, 14, 'migrated to state version 14');

const tp = data.topics['cisco-packet-tracer/dhcp'];
assert.ok(tp, 'topic preserved');
assert.ok(tp.completedSectionIds.includes('mental'), 'problem-classic mapped to mental section');
assert.ok(tp.completedSectionIds.includes('understand'), 'wo-vs-welche-ip-classic mapped to understand section');
assert.ok(tp.completedSectionIds.includes('summary'), 'summary-classic mapped to summary section');
assert.ok(tp.completedExerciseIds.includes('dhcp-understand-where'), 'dhcp-wo-welche-select mapped to dhcp-understand-where');
assert.ok(tp.completedExerciseIds.includes('dhcp-recall-command'), 'dhcp-physisch-cli mapped to dhcp-recall-command');
assert.ok(tp.completedExerciseIds.includes('dhcp-recovery-wrong-svi'), 'dhcp-troubleshooting-svi-cli mapped to dhcp-recovery-wrong-svi');
assert.ok(tp.theoryCompletion >= 50, 'legacy theory completion not reduced');
assert.ok(!tp.mastery || Object.keys(tp.mastery).length === 0 || tp.mastery['ciscoDhcp.helperPlacement'].confidence >= 0, 'mastery defaults are safe');

console.log('DHCP legacy migration OK');
