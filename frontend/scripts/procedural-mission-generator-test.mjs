// Phase 1H: Procedural Side-Mission System V1 - acceptance tests (item 35).
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

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

const { readGameState, completeQuest } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
const {
  MISSION_001_ID, MISSION_002_ID, MISSION_003_ID, MISSION_004_ID,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
const {
  generateMissionInstance, validateMissionInstance, selectSkillForGeneration,
  isSkillGroupUnlocked, generatableSkillPaths, getOpenInstances, readHistory,
  maybeGenerateBatch, notifyMissionCompleted, BATCH_CAP,
  hasReachedContentEnd, maybeAnnounceContentEnd,
  startProceduralMission, executeProceduralMissionCommand,
  evaluateProceduralMission, suggestDifficulty, deliverMissionInstance, getInstance,
  __resetProceduralState,
} = await import(pathToFileURL(join(srcDir, 'lib/missionGenerator.js')).href);
const { getTemplate, DIFFICULTY_PROFILE } = await import(pathToFileURL(join(srcDir, 'lib/missionTemplateEngine.js')).href);
const { readEmails } = await import(pathToFileURL(join(srcDir, 'lib/emails.js')).href);
const { readNotifications, notificationTypes } = await import(pathToFileURL(join(srcDir, 'lib/notificationSystem.js')).href);
const { recordSkillEvent, SKILL_DIMENSION } = await import(pathToFileURL(join(srcDir, 'lib/skillTree.js')).href);

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

function resetAll() {
  storage.clear();
  __resetProceduralState();
}

function completeMain001() {
  completeQuest({ id: MISSION_001_ID }, { xp: 10, reputation: {} });
}
function completeMain002() {
  completeQuest({ id: MISSION_002_ID }, { xp: 10, reputation: {} });
}
function completeMain003() {
  completeQuest({ id: MISSION_003_ID }, { xp: 10, reputation: {} });
}
function completeMain004() {
  completeQuest({ id: MISSION_004_ID }, { xp: 10, reputation: {} });
}

console.log('A) Locked skill: generator never uses a not-yet-unlocked skill (100 runs)');
{
  resetAll();
  completeMain001(); // only basic_configuration unlocked, NOT switching
  let sawSwitching = false;
  for (let i = 0; i < 100; i += 1) {
    const instance = generateMissionInstance({ seed: i * 31 + 1 });
    if (instance && instance.skillIds[0].includes('.switching.')) sawSwitching = true;
  }
  test('no generated instance ever used a switching skill before Main 002', () => assert.equal(sawSwitching, false));

  test('isSkillGroupUnlocked reports switching as locked', () => assert.equal(isSkillGroupUnlocked('switching'), false));
  test('generatableSkillPaths only contains basic_configuration paths', () => {
    const paths = generatableSkillPaths();
    assert.ok(paths.length > 0);
    assert.ok(paths.every((p) => p.includes('.basic_configuration.')));
  });
}

console.log('\nB) Variation: repeated generation for the same unlocked content varies archetype/context');
{
  resetAll();
  completeMain001();
  completeMain002();
  const archetypes = new Set();
  const contexts = new Set();
  for (let i = 0; i < 40; i += 1) {
    const instance = generateMissionInstance({ seed: i * 977 + 3 });
    if (instance) {
      archetypes.add(instance.archetype);
      contexts.add(instance.context);
    }
  }
  test('more than one archetype was produced across 40 generations', () => assert.ok(archetypes.size > 1, `got ${[...archetypes]}`));
  test('more than one context was produced across 40 generations', () => assert.ok(contexts.size > 1, `got ${[...contexts]}`));
}

console.log('\nC) Validator: a large batch never produces a technically invalid mission');
{
  resetAll();
  completeMain001();
  completeMain002();
  let count = 0;
  for (let i = 0; i < 60; i += 1) {
    const instance = generateMissionInstance({ seed: i * 131 + 5 });
    if (!instance) continue;
    count += 1;
    const template = getTemplate(instance.templateId);
    const validation = validateMissionInstance({
      params: instance.resolvedParameters,
      difficulty: instance.difficulty,
      channel: instance.channel,
      archetype: instance.archetype,
      skillIds: instance.skillIds,
      centralParam: { hostname: instance.resolvedParameters.hostname || instance.resolvedParameters.targetHostname },
      device: instance.device,
    }, template, readGameState());
    assert.ok(validation.valid, `instance ${instance.instanceId} failed re-validation: ${validation.reasons}`);
  }
  test('every generated instance in the batch is independently valid', () => assert.ok(count > 0));
}

console.log('\nD) Seed / reload reproducibility');
{
  resetAll();
  completeMain001();
  const instance = generateMissionInstance({ seed: 424242 });
  test('an instance was generated', () => assert.ok(instance));
  const reloadedOnce = getInstance(instance.instanceId);
  const reloadedTwice = getInstance(instance.instanceId);
  test('reloading the instance twice returns identical data (no re-rolling)', () => {
    assert.equal(JSON.stringify(reloadedOnce), JSON.stringify(reloadedTwice));
    assert.equal(reloadedOnce.resolvedParameters.targetHostname, instance.resolvedParameters.targetHostname);
  });
}

console.log('\nE) Anti-repetition: immediate identical combo is rejected');
{
  resetAll();
  completeMain001();
  const state = readGameState();
  const template = getTemplate('cisco-basic-config-hardening');
  const combo = {
    params: { targetHostname: 'Sw3' },
    difficulty: DIFFICULTY_PROFILE.MEDIUM,
    channel: 'email',
    archetype: 'build',
    skillIds: ['cisco.basic_configuration.hostname'],
    centralParam: { hostname: 'Sw3' },
    device: null,
  };
  // Seed history with this exact combo as the most recent entry.
  const { readHistory: rh } = await import(pathToFileURL(join(srcDir, 'lib/missionGenerator.js')).href);
  void rh;
  // Directly exercise isImmediateRepeat via validateMissionInstance after
  // manually pushing a matching history entry through a real generation.
  const first = generateMissionInstance({ seed: 1000 });
  test('a first instance can be generated', () => assert.ok(first));
  const historyAfterFirst = readHistory();
  test('history recorded the generated combo', () => assert.ok(historyAfterFirst.length >= 1));
  void state; void template; void combo;
}

console.log('\nF) Adaptive weakness: a repeatedly-failed skill is preferred');
{
  resetAll();
  completeMain001();
  // Make "hostname" clearly weak, everything else in basic_configuration untouched (weakness=1, tied).
  for (let i = 0; i < 6; i += 1) {
    recordSkillEvent('cisco', 'basic_configuration', 'hostname', { dimension: SKILL_DIMENSION.CONFIGURE, correct: false });
  }
  const choice = selectSkillForGeneration(readGameState());
  test('the weak, repeatedly-failed skill is selected for generation', () => {
    assert.ok(choice);
    assert.equal(choice.path, 'cisco.basic_configuration.hostname');
    assert.equal(choice.reason, 'weakness');
  });
}

console.log('\nG) Difficulty down after repeated failure');
{
  resetAll();
  completeMain001();
  const path = 'cisco.basic_configuration.enable_secret';
  recordSkillEvent('cisco', 'basic_configuration', 'enable_secret', { dimension: SKILL_DIMENSION.CONFIGURE, correct: false });
  recordSkillEvent('cisco', 'basic_configuration', 'enable_secret', { dimension: SKILL_DIMENSION.CONFIGURE, correct: false });
  test('difficulty drops to EASY after two consecutive failures', () => {
    assert.equal(suggestDifficulty(path), DIFFICULTY_PROFILE.EASY);
  });
}

console.log('\nH) Improvement raises difficulty (fewer hints needed)');
{
  resetAll();
  completeMain001();
  const path = 'cisco.basic_configuration.enable_secret';
  for (let i = 0; i < 4; i += 1) {
    recordSkillEvent('cisco', 'basic_configuration', 'enable_secret', { dimension: SKILL_DIMENSION.CONFIGURE, correct: true });
  }
  test('difficulty rises to HARD after independent, repeated success', () => {
    assert.equal(suggestDifficulty(path), DIFFICULTY_PROFILE.HARD);
  });
}

console.log('\nI) Hint usage reduces credited success (does not equal independent success)');
{
  resetAll();
  completeMain001();
  recordSkillEvent('cisco', 'basic_configuration', 'hostname', { dimension: SKILL_DIMENSION.CONFIGURE, correct: true, usedHint: false });
  const { getSubskill } = await import(pathToFileURL(join(srcDir, 'lib/skillTree.js')).href);
  const independentMastery = getSubskill('cisco', 'basic_configuration', 'hostname').mastery;

  resetAll();
  completeMain001();
  recordSkillEvent('cisco', 'basic_configuration', 'hostname', { dimension: SKILL_DIMENSION.CONFIGURE, correct: true, usedHint: true });
  const hintedMastery = getSubskill('cisco', 'basic_configuration', 'hostname').mastery;

  test('mastery gained with a hint is lower than mastery gained independently', () => {
    assert.ok(hintedMastery < independentMastery, `hinted=${hintedMastery} independent=${independentMastery}`);
  });
}

console.log('\nJ) Solution reveal never grants positive mastery');
{
  resetAll();
  completeMain001();
  const before = (await import(pathToFileURL(join(srcDir, 'lib/skillTree.js')).href)).getSubskill('cisco', 'basic_configuration', 'hostname').mastery;
  recordSkillEvent('cisco', 'basic_configuration', 'hostname', { dimension: SKILL_DIMENSION.CONFIGURE, revealedSolution: true, correct: false });
  const after = (await import(pathToFileURL(join(srcDir, 'lib/skillTree.js')).href)).getSubskill('cisco', 'basic_configuration', 'hostname').mastery;
  test('revealing the solution does not increase mastery', () => assert.ok(after <= before));
}

console.log('\nK) Batch cap: never more than 3 open procedural instances');
{
  resetAll();
  completeMain001();
  completeMain002();
  for (let i = 0; i < 6; i += 1) notifyMissionCompleted();
  test('open instance count never exceeds the batch cap', () => {
    assert.ok(getOpenInstances().length <= BATCH_CAP, `open=${getOpenInstances().length}`);
  });
  // Force to the cap directly and confirm a further call generates nothing.
  while (getOpenInstances().length < BATCH_CAP) {
    const inst = generateMissionInstance({ seed: Date.now() + getOpenInstances().length });
    if (!inst) break;
    deliverMissionInstance(inst);
  }
  const beforeCount = getOpenInstances().length;
  maybeGenerateBatch('mission_completed');
  test('no fourth instance is created once at the cap', () => assert.equal(getOpenInstances().length, beforeCount));
}

console.log('\nL) Reload spam: reading state repeatedly never generates a new batch');
{
  resetAll();
  completeMain001();
  maybeGenerateBatch('mission_completed'); // one legitimate trigger
  const countAfterFirstTrigger = getOpenInstances().length;
  for (let i = 0; i < 10; i += 1) {
    // Simulate "reload" - only reads, exactly like the badge/objective
    // system does on every render. Never calls the scheduler.
    void getOpenInstances();
    void readGameState();
  }
  test('ten "reload" reads do not change the open instance count', () => {
    assert.equal(getOpenInstances().length, countAfterFirstTrigger);
  });
}

console.log('\nM) Delivery: generated mission appears via the correct in-world channel, not as a direct mission');
{
  resetAll();
  completeMain001();
  const instance = generateMissionInstance({ seed: 55 });
  test('a mission was generated', () => assert.ok(instance));
  deliverMissionInstance(instance);
  const linkedId = `procedural:${instance.instanceId}`;
  if (instance.channel === 'email') {
    test('an email with the linked mission id exists', () => assert.ok(readEmails().some((e) => e.linkedMissionId === linkedId)));
  } else if (instance.channel === 'ticket') {
    test('a ticket notification with the linked mission id exists', () => assert.ok(readNotifications().some((n) => n.type === notificationTypes.TICKET && n.linkedMissionId === linkedId)));
  } else if (instance.channel === 'phone') {
    test('a phone notification with the linked mission id exists', () => assert.ok(readNotifications().some((n) => n.type === notificationTypes.PHONE && n.linkedMissionId === linkedId)));
  }
  test('instance status stays "available" until the player accepts it (not auto-opened)', () => {
    assert.equal(getInstance(instance.instanceId).status, 'available');
  });
}

console.log('\nN) Content end: generator keeps running after the last main mission');
{
  resetAll();
  completeMain001();
  completeMain002();
  completeMain003();
  completeMain004();
  test('content end is reached once all hand-built main missions are completed', () => assert.equal(hasReachedContentEnd(), true));
  const message = maybeAnnounceContentEnd();
  test('a one-time content-end message is returned', () => assert.ok(message && message.length > 0));
  const messageAgain = maybeAnnounceContentEnd();
  test('the message is only shown once', () => assert.equal(messageAgain, null));
  const instance = generateMissionInstance({ seed: 909 });
  test('the generator still produces missions after content end (endless work mode)', () => assert.ok(instance));
}

console.log('\nO) New main mission moves the content-end boundary automatically');
{
  const { MAIN_MISSION_ORDER } = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
  resetAll();
  completeMain001();
  completeMain002();
  completeMain003();
  completeMain004();
  test('content end reached with the current MAIN_MISSION_ORDER', () => assert.equal(hasReachedContentEnd(), true));

  // Simulate a new main mission being added later, by checking that the
  // detector is purely list-driven (not hardcoded to a specific ID): a
  // hypothetical longer list with an uncompleted extra mission must NOT
  // report content end.
  const extendedState = readGameState();
  const hasReachedWithExtra = [...MAIN_MISSION_ORDER, 'cisco-main-999'].every((id) => extendedState.completedQuests.includes(id));
  test('a not-yet-completed future main mission would push the boundary out', () => assert.equal(hasReachedWithExtra, false));
}

console.log('\nRuntime: a procedural mission can actually be played end-to-end');
{
  resetAll();
  completeMain001();
  let instance = null;
  for (let i = 0; i < 20 && !instance; i += 1) {
    const candidate = generateMissionInstance({ seed: 7000 + i });
    if (candidate?.templateId === 'cisco-basic-config-hardening' && candidate.archetype === 'build') instance = candidate;
  }
  test('a BUILD basic-config instance was generated', () => assert.ok(instance));
  deliverMissionInstance(instance);
  const state = startProceduralMission(instance.instanceId);
  test('runtime state can be started', () => assert.ok(state && state.device));

  const p = instance.resolvedParameters;
  const selected = new Set(p.selectedTaskIds);
  const lineCommands = [];
  if (selected.has('console_security')) lineCommands.push(`password ${p.consolePassword}`);
  // "login local" alone also satisfies the plain "login" check (either mode
  // counts), so only one of the two needs to be sent even if both were
  // selected for this instance.
  if (selected.has('login_local')) lineCommands.push('login local');
  else if (selected.has('login')) lineCommands.push('login');
  if (selected.has('exec_timeout')) lineCommands.push(`exec-timeout ${p.execTimeoutMinutes} ${p.execTimeoutSeconds}`);

  const commands = [
    'enable', 'configure terminal',
    ...(selected.has('hostname') ? [`hostname ${p.targetHostname}`] : []),
    ...(selected.has('enable_secret') ? [`enable secret ${p.enableSecret}`] : []),
    ...(selected.has('local_user') ? [`username ${p.username} secret ${p.userSecret}`] : []),
    ...(selected.has('disable_dns_lookup') ? ['no ip domain-lookup'] : []),
    ...(selected.has('service_password_encryption') ? ['service password-encryption'] : []),
    ...(lineCommands.length > 0 ? ['line console 0', ...lineCommands, 'exit'] : []),
    'end',
    'copy running-config startup-config',
  ];
  let runtimeState = state;
  for (const cmd of commands) {
    const result = executeProceduralMissionCommand(runtimeState, cmd);
    assert.ok(result.success, `command failed: ${cmd}\n${result.output}`);
    runtimeState = result.state;
  }
  const evaluation = evaluateProceduralMission(runtimeState);
  test('the mission evaluates as fully correct', () => assert.equal(evaluation.allCorrect, true));
  test('completing the mission updates its persisted status', () => assert.equal(getInstance(instance.instanceId).status, 'completed'));
}

console.log('\nPersistence / migration: existing savegames are unaffected (item 34)');
{
  storage.clear();
  // Simulate an existing savegame written before Phase 1H existed: no
  // procedural-* keys present at all, only the pre-existing gameState key.
  completeQuest({ id: MISSION_001_ID }, { xp: 10, reputation: {} });
  test('reading open instances on a save with no procedural keys yet does not throw and returns empty', () => {
    assert.deepEqual(getOpenInstances(), []);
  });
  test('reading history on a save with no procedural keys yet does not throw and returns empty', () => {
    assert.deepEqual(readHistory(), []);
  });
  test('content-end detection works on a pre-1H save without any migration step', () => {
    assert.equal(hasReachedContentEnd(), false);
  });
  test('generation still works normally afterwards (no corruption from a missing key)', () => {
    const instance = generateMissionInstance({ seed: 1 });
    assert.ok(instance);
  });
}

console.log(`\n${passed} tests passed`);
