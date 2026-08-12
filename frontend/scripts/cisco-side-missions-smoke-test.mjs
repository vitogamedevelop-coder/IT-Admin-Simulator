global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.window = { dispatchEvent: () => {} };

import {
  startCiscoSideMission,
  executeCiscoSideMissionCommand,
  getCiscoSideMissionProgress,
  evaluateCiscoSideMission,
} from '../src/lib/ciscoSideMissions.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Side 001
let state = startCiscoSideMission('cisco-side-basic-001');
console.log('Side 001 started:', state.scenario.title);
executeCiscoSideMissionCommand(state, 'enable');
executeCiscoSideMissionCommand(state, 'configure terminal');
executeCiscoSideMissionCommand(state, 'line console 0');
executeCiscoSideMissionCommand(state, `password ${state.scenario.parameters.password}`);
executeCiscoSideMissionCommand(state, 'login');
executeCiscoSideMissionCommand(state, 'exec-timeout 2 0');
executeCiscoSideMissionCommand(state, 'end');
executeCiscoSideMissionCommand(state, 'copy running-config startup-config');
let p = getCiscoSideMissionProgress(state);
assert(p.completed === p.total, `Side 001 not complete: ${p.completed}/${p.total}`);
let e = evaluateCiscoSideMission(state);
assert(e.allCorrect, 'Side 001 evaluation should be all correct');
console.log('Side 001 passed');

// Side 002
state = startCiscoSideMission('cisco-side-basic-002');
console.log('Side 002 started:', state.scenario.title);
executeCiscoSideMissionCommand(state, 'configure terminal');
executeCiscoSideMissionCommand(state, 'service password-encryption');
executeCiscoSideMissionCommand(state, 'end');
executeCiscoSideMissionCommand(state, 'copy running-config startup-config');
p = getCiscoSideMissionProgress(state);
assert(p.completed === p.total, `Side 002 not complete: ${p.completed}/${p.total}`);
e = evaluateCiscoSideMission(state);
assert(e.allCorrect, 'Side 002 evaluation should be all correct');
console.log('Side 002 passed');

// Side 003
state = startCiscoSideMission('cisco-side-basic-003');
console.log('Side 003 started:', state.scenario.title, 'user', state.scenario.parameters.username);
executeCiscoSideMissionCommand(state, 'configure terminal');
executeCiscoSideMissionCommand(state, 'line console 0');
executeCiscoSideMissionCommand(state, 'login local');
executeCiscoSideMissionCommand(state, 'end');
executeCiscoSideMissionCommand(state, 'copy running-config startup-config');
p = getCiscoSideMissionProgress(state);
assert(p.completed === p.total, `Side 003 not complete: ${p.completed}/${p.total}`);
e = evaluateCiscoSideMission(state);
assert(e.allCorrect, 'Side 003 evaluation should be all correct');
console.log('Side 003 passed');

console.log('All side mission smoke tests passed.');
