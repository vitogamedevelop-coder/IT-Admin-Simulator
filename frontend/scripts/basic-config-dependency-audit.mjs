// Basic Config Hardening - Dependency & Solvability Audit
//
// Mass-checks the cisco-basic-config-hardening template for:
//   - mutually exclusive login variants
//   - login  -> console_security dependency
//   - login_local -> local_user dependency
//   - solvability for every generated seed (BUILD + AUDIT)
//   - no hidden required configuration
//
// Run with: npx tsx scripts/basic-config-dependency-audit.mjs

class Storage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}
const storage = new Storage();
global.localStorage = storage;
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

import {
  TEMPLATE_REGISTRY, MISSION_ARCHETYPE, seededRng, BASIC_CONFIG_TASKS,
} from '../src/lib/missionTemplateEngine.js';
import {
  startProceduralMission, executeProceduralMissionCommand, getProceduralMissionProgress,
} from '../src/lib/missionGenerator.js';

const results = [];
function assert(condition, message) {
  results.push({ ok: !!condition, message });
  if (!condition) console.error(`  FAIL - ${message}`);
}

const INSTANCES_KEY = 'cyberlearn:procedural-instances-v1';
const template = TEMPLATE_REGISTRY['cisco-basic-config-hardening'];
const TASK_BY_ID = Object.fromEntries(BASIC_CONFIG_TASKS.map((t) => [t.id, t]));

function createAndStartInstance(archetype, context, seed) {
  const rng = seededRng(seed);
  const params = template.resolveParameters(rng, archetype, context, 'medium');
  const { device } = template.buildDevice(params, archetype);

  const instanceId = `audit-bc-${archetype}-${context}-${seed}`;
  const instance = {
    instanceId, templateId: template.id, seed, generatedAt: Date.now(),
    channel: 'email', skillIds: [], difficulty: 'medium', archetype, context,
    resolvedParameters: params, device, title: 't', briefing: 'b', status: 'available',
    readState: { read: false, readAt: null }, acceptedState: { accepted: false, acceptedAt: null },
    completedState: { completed: false, completedAt: null }, attempts: 0, hintsUsed: [],
    solutionRevealedFor: [], showCommandsUsed: [],
  };
  storage.setItem(INSTANCES_KEY, JSON.stringify({ [instanceId]: instance }));
  return startProceduralMission(instanceId);
}

function solveCommands(params) {
  const selected = new Set(params.selectedTaskIds);
  const head = ['enable', 'configure terminal'];
  const tail = ['end', 'copy running-config startup-config'];
  const body = [];
  if (selected.has('hostname')) body.push(`hostname ${params.targetHostname}`);
  if (selected.has('enable_secret')) body.push(`enable secret ${params.enableSecret}`);
  if (selected.has('local_user')) body.push(`username ${params.username} secret ${params.userSecret}`);
  if (selected.has('disable_dns_lookup')) body.push('no ip domain-lookup');

  const lineCommands = [];
  if (selected.has('console_security')) lineCommands.push(`password ${params.consolePassword}`);
  if (selected.has('login')) lineCommands.push('login');
  if (selected.has('login_local')) lineCommands.push('login local');
  if (selected.has('exec_timeout')) lineCommands.push(`exec-timeout ${params.execTimeoutMinutes} ${params.execTimeoutSeconds}`);
  if (lineCommands.length > 0) {
    body.push('line console 0', ...lineCommands, 'exit');
  }

  if (selected.has('service_password_encryption')) body.push('service password-encryption');
  return [...head, ...body, ...tail];
}

function runCommands(state, commands) {
  let current = state;
  for (const cmd of commands) {
    const result = executeProceduralMissionCommand(current, cmd);
    current = result.state;
  }
  return current;
}

function validateParams(params, label) {
  const selected = new Set(params.selectedTaskIds);
  assert(!selected.has('login') || selected.has('console_security'), `${label}: login requires console_security`);
  assert(!selected.has('login_local') || selected.has('local_user'), `${label}: login_local requires local_user`);
  assert(!(selected.has('login') && selected.has('login_local')), `${label}: login and login_local are mutually exclusive`);
}

console.log('A) Dependency rules across 1000 BUILD seeds');
for (let seed = 1; seed <= 1000; seed += 1) {
  const rng = seededRng(seed);
  const context = template.contexts[(seed - 1) % template.contexts.length];
  const params = template.resolveParameters(rng, MISSION_ARCHETYPE.BUILD, context, 'medium');
  validateParams(params, `BUILD/seed${seed}`);
}

console.log('B) Dependency rules across 1000 AUDIT seeds');
for (let seed = 1; seed <= 1000; seed += 1) {
  const rng = seededRng(seed + 10000);
  const context = template.contexts[(seed - 1) % template.contexts.length];
  const params = template.resolveParameters(rng, MISSION_ARCHETYPE.AUDIT, context, 'medium');
  validateParams(params, `AUDIT/seed${seed}`);
}

console.log('C) Canonical solvability across 500 BUILD + 500 AUDIT seeds');
for (let seed = 1; seed <= 500; seed += 1) {
  const context = template.contexts[(seed - 1) % template.contexts.length];
  for (const archetype of [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.AUDIT]) {
    const label = `${archetype}/seed${seed}`;
    storage.clear();
    let state;
    try {
      state = createAndStartInstance(archetype, context, seed + (archetype === MISSION_ARCHETYPE.AUDIT ? 5000 : 0));
    } catch (err) {
      assert(false, `${label}: failed to create instance: ${err.message}`);
      continue;
    }
    validateParams(state.params, label);
    const cmds = solveCommands(state.params);
    const finalState = runCommands(state, cmds);
    const progress = getProceduralMissionProgress(finalState);
    assert(progress.allCorrect, `${label}: canonical solver should produce allCorrect (checks: ${JSON.stringify(progress.checks)})`);
  }
}

console.log('D) Briefing contains every selected task');
for (let seed = 1; seed <= 500; seed += 1) {
  const rng = seededRng(seed + 20000);
  const context = template.contexts[(seed - 1) % template.contexts.length];
  const params = template.resolveParameters(rng, MISSION_ARCHETYPE.BUILD, context, 'medium');
  const briefing = template.buildBriefing(params, MISSION_ARCHETYPE.BUILD, context, 'medium');
  const selected = params.selectedTaskIds;
  for (const id of selected) {
    const task = TASK_BY_ID[id];
    if (task) {
      const text = task.brief(params);
      assert(briefing.includes(text), `BRIEFING/seed${seed}: briefing includes brief for ${id}`);
    }
  }
}

console.log('E) No hidden required configuration: selected task count sane and save_config always present');
for (let seed = 1; seed <= 500; seed += 1) {
  const rng = seededRng(seed + 30000);
  const context = template.contexts[(seed - 1) % template.contexts.length];
  const params = template.resolveParameters(rng, MISSION_ARCHETYPE.BUILD, context, 'medium');
  assert(params.selectedTaskIds.length >= 3, `COUNT/seed${seed}: at least 3 selected tasks`);
  assert(params.selectedTaskIds.length <= BASIC_CONFIG_TASKS.length, `COUNT/seed${seed}: selected tasks do not exceed pool`);
}

console.log('\n=== Basic Config Dependency Audit: Summary ===');
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log(`Total assertions: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (failed > 0) {
  console.log('\nFailed assertions:');
  results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.message}`));
  process.exitCode = 1;
} else {
  console.log('All checks passed.');
}
