// Phase 1J.3 Etappe 3: procedural SSH / Remote Administration (Block 1.5)
// side-mission generator archetypes.
//
// Covers: unlock gating (only after HM3), the four templates
// (cisco-ssh-management-access, cisco-ssh-enable, cisco-ssh-vty-access,
// cisco-ssh-diagnose), the "no artificial management VLAN on a router"
// rule, IP/gateway/subnet consistency, ACCOUNT_NAME_POOL usage, the
// existing GENERATE -> VALIDATE -> ACCEPT/REJECT pipeline, anti-repetition,
// adaptive difficulty reuse, persistence/reload, and a real end-to-end
// completion path per template via the CLI engine.

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
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {}, speechSynthesis: null };

const { readGameState, completeQuest } = await import(pathToFileURL(join(srcDir, 'lib/gameState.js')).href);
const {
  MISSION_001_ID, MISSION_002_ID, MISSION_003_ID,
} = await import(pathToFileURL(join(srcDir, 'lib/missionV2.js')).href);
const {
  getTemplate, seededRng, MISSION_ARCHETYPE,
} = await import(pathToFileURL(join(srcDir, 'lib/missionTemplateEngine.js')).href);
const {
  isSkillGroupUnlocked, isTemplateUnlocked, generatableSkillPaths, generateMissionInstance, validateMissionInstance,
  getInstance, executeProceduralMissionCommand,
  suggestDifficulty, __resetProceduralState,
} = await import(pathToFileURL(join(srcDir, 'lib/missionGenerator.js')).href);
const { ACCOUNT_NAME_POOL } = await import(pathToFileURL(join(srcDir, 'lib/officeWorld.js')).href);

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

function completeThroughHm2() {
  completeQuest({ id: MISSION_001_ID }, { xp: 10, reputation: {} });
  completeQuest({ id: MISSION_002_ID }, { xp: 10, reputation: {} });
}

function completeThroughHm3() {
  completeThroughHm2();
  completeQuest({ id: MISSION_003_ID }, { xp: 10, reputation: {} });
}

const SSH_TEMPLATE_IDS = ['cisco-ssh-management-access', 'cisco-ssh-enable', 'cisco-ssh-vty-access', 'cisco-ssh-diagnose'];
const ACCOUNT_USERNAMES = new Set(ACCOUNT_NAME_POOL.map((p) => p.username));

console.log('Unlock gating: SSH templates only unlock after HM3');
{
  resetAll();
  const stateBefore = readGameState();
  for (const id of SSH_TEMPLATE_IDS) {
    test(`${id} is locked before HM3`, () => assert.equal(isTemplateUnlocked(getTemplate(id), stateBefore), false));
  }
  test('remote_administration skill group is locked before HM3', () => assert.equal(isSkillGroupUnlocked('remote_administration', stateBefore), false));
  test('no remote_administration paths generatable before HM3', () => {
    const paths = generatableSkillPaths(stateBefore);
    assert.ok(!paths.some((p) => p.startsWith('cisco.remote_administration')));
  });

  completeThroughHm3();
  const stateAfter = readGameState();
  for (const id of SSH_TEMPLATE_IDS) {
    test(`${id} is unlocked after HM3`, () => assert.equal(isTemplateUnlocked(getTemplate(id), stateAfter), true));
  }
  test('remote_administration skill group is unlocked after HM3', () => assert.equal(isSkillGroupUnlocked('remote_administration', stateAfter), true));
  test('remote_administration paths generatable after HM3', () => {
    const paths = generatableSkillPaths(stateAfter);
    assert.ok(paths.some((p) => p.startsWith('cisco.remote_administration')));
  });
}

console.log('\nArchetype coverage matches the Phase 1J.3 scope');
{
  const archetypesById = Object.fromEntries(SSH_TEMPLATE_IDS.map((id) => [id, new Set(getTemplate(id).archetypes)]));
  const allArchetypes = new Set(Object.values(archetypesById).flatMap((s) => Array.from(s)));
  test('BUILD is covered', () => assert.ok(allArchetypes.has(MISSION_ARCHETYPE.BUILD)));
  test('COMPLETE is covered', () => assert.ok(allArchetypes.has(MISSION_ARCHETYPE.COMPLETE)));
  test('REPAIR is covered', () => assert.ok(allArchetypes.has(MISSION_ARCHETYPE.REPAIR)));
  test('HARDEN is covered', () => assert.ok(allArchetypes.has(MISSION_ARCHETYPE.HARDEN)));
  test('USER_REPORT is covered', () => assert.ok(allArchetypes.has(MISSION_ARCHETYPE.USER_REPORT)));
  test('AUDIT is covered', () => assert.ok(allArchetypes.has(MISSION_ARCHETYPE.AUDIT)));
  test('DIAGNOSE is covered', () => assert.ok(allArchetypes.has(MISSION_ARCHETYPE.DIAGNOSE)));
  test('no template repeats the entire SSH chain (each has < 9 checks except the dedicated diagnose template)', () => {
    for (const id of ['cisco-ssh-management-access', 'cisco-ssh-enable', 'cisco-ssh-vty-access']) {
      const template = getTemplate(id);
      const rng = seededRng(4242);
      const params = template.resolveParameters(rng, template.archetypes[0], template.contexts[0], 'medium');
      const { device } = template.buildDevice(params, template.archetypes[0]);
      const progress = template.evaluate(device, params, template.archetypes[0], { showCommandsUsed: [] });
      assert.ok(progress.checks.length <= 3, `${id} has ${progress.checks.length} checks, expected a narrow sub-problem`);
    }
  });
}

console.log('\nRouter variant never invents a management VLAN');
{
  for (const id of ['cisco-ssh-enable', 'cisco-ssh-vty-access']) {
    const template = getTemplate(id);
    let sawRouter = false;
    let sawSwitch = false;
    for (let i = 0; i < 60 && !(sawRouter && sawSwitch); i += 1) {
      const rng = seededRng(Date.now() + i * 7919);
      const params = template.resolveParameters(rng, template.archetypes[0], template.contexts[0], 'medium');
      const { device } = template.buildDevice(params, template.archetypes[0]);
      if (params.deviceType === 'router') {
        sawRouter = true;
        test(`${id}: router variant has no VLAN other than the default`, () => assert.deepEqual(Object.keys(device.runningConfig.vlans), ['1']));
        test(`${id}: router variant's routed interface already has the resolved IP`, () => assert.equal(device.runningConfig.interfaces['GigabitEthernet0/0'].ipv4, params.ip));
      } else {
        sawSwitch = true;
      }
    }
    test(`${id}: both switch and router variants occur across seeds`, () => assert.ok(sawRouter && sawSwitch, `router seen=${sawRouter} switch seen=${sawSwitch}`));
  }
}

console.log('\nIP / gateway / subnet consistency');
{
  for (const id of ['cisco-ssh-management-access', 'cisco-ssh-diagnose']) {
    const template = getTemplate(id);
    for (let i = 0; i < 20; i += 1) {
      const rng = seededRng(Date.now() + i * 104729);
      const archetype = template.archetypes[i % template.archetypes.length];
      const params = template.resolveParameters(rng, archetype, template.contexts[0], 'medium');
      const base = params.mgmtIp.split('.').slice(0, 3).join('.');
      test(`${id}: gateway is in the same /24 as the management IP (seed ${i})`, () => assert.equal(params.mgmtGateway, `${base}.1`));
      test(`${id}: mask is a plain /24 (seed ${i})`, () => assert.equal(params.mgmtMask, '255.255.255.0'));
      test(`${id}: management IP ends in .2, distinct from the gateway (seed ${i})`, () => assert.equal(params.mgmtIp, `${base}.2`));
    }
  }
}

console.log('\nManagement VLAN ID and IP network are NOT systematically coupled');
{
  // If VLAN ID and IP network were coupled (e.g. "VLAN X always means
  // 192.168.X.0/24"), every instance for a given VLAN ID would always show
  // the same network, and vice versa. Sampling many instances must show
  // real variation in both directions.
  for (const id of ['cisco-ssh-management-access', 'cisco-ssh-diagnose']) {
    const template = getTemplate(id);
    const networksByVlan = new Map();
    const vlansByNetwork = new Map();
    let sawVlanIdAsThirdOctet = false;
    for (let i = 0; i < 200; i += 1) {
      const rng = seededRng(Date.now() + i * 97);
      const archetype = template.archetypes[i % template.archetypes.length];
      const params = template.resolveParameters(rng, archetype, template.contexts[0], 'medium');
      const networkBase = params.mgmtIp.split('.').slice(0, 3).join('.');
      if (!networksByVlan.has(params.mgmtVlanId)) networksByVlan.set(params.mgmtVlanId, new Set());
      networksByVlan.get(params.mgmtVlanId).add(networkBase);
      if (!vlansByNetwork.has(networkBase)) vlansByNetwork.set(networkBase, new Set());
      vlansByNetwork.get(networkBase).add(params.mgmtVlanId);
      const thirdOctet = Number(params.mgmtIp.split('.')[2]);
      if (thirdOctet === params.mgmtVlanId) sawVlanIdAsThirdOctet = true;
    }
    test(`${id}: at least one VLAN ID is seen with more than one distinct IP network across many instances`, () => {
      assert.ok(Array.from(networksByVlan.values()).some((nets) => nets.size > 1), `distribution: ${JSON.stringify(Object.fromEntries(Array.from(networksByVlan, ([k, v]) => [k, Array.from(v)])))}`);
    });
    test(`${id}: at least one IP network is seen with more than one distinct VLAN ID across many instances`, () => {
      assert.ok(Array.from(vlansByNetwork.values()).some((vlans) => vlans.size > 1), `distribution: ${JSON.stringify(Object.fromEntries(Array.from(vlansByNetwork, ([k, v]) => [k, Array.from(v)])))}`);
    });
    test(`${id}: the IP network's third octet never mirrors the VLAN ID (no "VLAN X -> 192.168.X.0/24" pattern)`, () => assert.equal(sawVlanIdAsThirdOctet, false));
  }
}

console.log('\nManagement network validator rules');
{
  test('mgmt IP within the generated network, gateway within the same network, distinct from the IP', () => {
    const template = getTemplate('cisco-ssh-management-access');
    for (let i = 0; i < 50; i += 1) {
      const rng = seededRng(Date.now() + i * 251);
      const params = template.resolveParameters(rng, MISSION_ARCHETYPE.BUILD, template.contexts[0], 'medium');
      const { device } = template.buildDevice(params, MISSION_ARCHETYPE.BUILD);
      const validation = validateMissionInstance({
        params, device, difficulty: 'medium', channel: 'email', archetype: MISSION_ARCHETYPE.BUILD, skillIds: [], context: template.contexts[0], centralParam: {},
      }, template, readGameState());
      assert.ok(validation.valid, JSON.stringify(validation.reasons));
    }
  });
  test('a management IP that is a network address is rejected', () => {
    const template = getTemplate('cisco-ssh-management-access');
    const rng = seededRng(1);
    const params = template.resolveParameters(rng, MISSION_ARCHETYPE.BUILD, template.contexts[0], 'medium');
    const base = params.mgmtIp.split('.').slice(0, 3).join('.');
    const brokenParams = { ...params, mgmtIp: `${base}.0` };
    const { device } = template.buildDevice(brokenParams, MISSION_ARCHETYPE.BUILD);
    const validation = validateMissionInstance({
      params: brokenParams, device, difficulty: 'medium', channel: 'email', archetype: MISSION_ARCHETYPE.BUILD, skillIds: [], context: template.contexts[0], centralParam: {},
    }, template, readGameState());
    assert.equal(validation.valid, false);
    assert.ok(validation.reasons.includes('mgmt_ip_not_a_valid_host_address'));
  });
  test('a management IP that is a broadcast address is rejected', () => {
    const template = getTemplate('cisco-ssh-management-access');
    const rng = seededRng(1);
    const params = template.resolveParameters(rng, MISSION_ARCHETYPE.BUILD, template.contexts[0], 'medium');
    const base = params.mgmtIp.split('.').slice(0, 3).join('.');
    const brokenParams = { ...params, mgmtIp: `${base}.255` };
    const { device } = template.buildDevice(brokenParams, MISSION_ARCHETYPE.BUILD);
    const validation = validateMissionInstance({
      params: brokenParams, device, difficulty: 'medium', channel: 'email', archetype: MISSION_ARCHETYPE.BUILD, skillIds: [], context: template.contexts[0], centralParam: {},
    }, template, readGameState());
    assert.equal(validation.valid, false);
    assert.ok(validation.reasons.includes('mgmt_ip_not_a_valid_host_address'));
  });
  test('a gateway equal to the management IP is rejected', () => {
    const template = getTemplate('cisco-ssh-management-access');
    const rng = seededRng(1);
    const params = template.resolveParameters(rng, MISSION_ARCHETYPE.BUILD, template.contexts[0], 'medium');
    const brokenParams = { ...params, mgmtGateway: params.mgmtIp };
    const { device } = template.buildDevice(brokenParams, MISSION_ARCHETYPE.BUILD);
    const validation = validateMissionInstance({
      params: brokenParams, device, difficulty: 'medium', channel: 'email', archetype: MISSION_ARCHETYPE.BUILD, skillIds: [], context: template.contexts[0], centralParam: {},
    }, template, readGameState());
    assert.equal(validation.valid, false);
    assert.ok(validation.reasons.includes('mgmt_gateway_equals_mgmt_ip'));
  });
  test('a gateway outside the management network is rejected', () => {
    const template = getTemplate('cisco-ssh-management-access');
    const rng = seededRng(1);
    const params = template.resolveParameters(rng, MISSION_ARCHETYPE.BUILD, template.contexts[0], 'medium');
    const brokenParams = { ...params, mgmtGateway: '203.0.113.1' };
    const { device } = template.buildDevice(brokenParams, MISSION_ARCHETYPE.BUILD);
    const validation = validateMissionInstance({
      params: brokenParams, device, difficulty: 'medium', channel: 'email', archetype: MISSION_ARCHETYPE.BUILD, skillIds: [], context: template.contexts[0], centralParam: {},
    }, template, readGameState());
    assert.equal(validation.valid, false);
    assert.ok(validation.reasons.includes('mgmt_gateway_not_a_valid_host_address'));
  });
}

console.log('\nReload stays deterministic after the network-pool patch');
{
  resetAll();
  completeThroughHm3();
  let instance = null;
  for (let i = 0; i < 40 && !instance; i += 1) {
    const candidate = generateMissionInstance({ seed: Date.now() + i * 7919 });
    if (candidate && ['cisco-ssh-management-access', 'cisco-ssh-diagnose'].includes(candidate.templateId)) instance = candidate;
  }
  test('a management-network SSH instance was generated for the reload check', () => assert.ok(instance));
  if (instance) {
    const first = getInstance(instance.instanceId);
    const second = getInstance(instance.instanceId);
    test('reloading returns an identical management network (no re-rolling)', () => assert.deepEqual(first, second));
  }
}

console.log('\nGenerated accounts come from ACCOUNT_NAME_POOL, not story NPCs');
{
  const template = getTemplate('cisco-ssh-vty-access');
  for (let i = 0; i < 20; i += 1) {
    const rng = seededRng(Date.now() + i * 6151);
    const params = template.resolveParameters(rng, MISSION_ARCHETYPE.USER_REPORT, template.contexts[0], 'medium');
    test(`generated new-user account is a real ACCOUNT_NAME_POOL entry (seed ${i})`, () => assert.ok(ACCOUNT_USERNAMES.has(params.newUsername)));
    test(`existing/new accounts are different people (seed ${i})`, () => assert.notEqual(params.newUsername, params.existingUsername));
  }
}

console.log('\nGENERATE -> VALIDATE -> ACCEPT/REJECT: real generation pipeline produces valid SSH instances');
{
  resetAll();
  completeThroughHm3();
  const state = readGameState();
  const seenTemplates = new Set();
  for (let i = 0; i < 150; i += 1) {
    const instance = generateMissionInstance({ seed: Date.now() + i * 7919 });
    if (!instance) continue;
    if (SSH_TEMPLATE_IDS.includes(instance.templateId)) seenTemplates.add(instance.templateId);
    const template = getTemplate(instance.templateId);
    const validation = validateMissionInstance({
      params: instance.resolvedParameters,
      device: instance.device,
      difficulty: instance.difficulty,
      channel: instance.channel,
      archetype: instance.archetype,
      skillIds: instance.skillIds,
      context: instance.context,
      centralParam: {},
    }, template, state);
    test(`generated ${instance.templateId} instance ${i} is independently valid`, () => assert.ok(validation.valid, JSON.stringify(validation.reasons)));
  }
  test('generation surfaced at least one of the four new SSH templates over many attempts', () => assert.ok(SSH_TEMPLATE_IDS.some((id) => seenTemplates.has(id)), `saw: ${Array.from(seenTemplates).join(', ')}`));
}

console.log('\nFault coverage: cisco-ssh-diagnose realizes every documented fault');
{
  const template = getTemplate('cisco-ssh-diagnose');
  const seenFaults = new Set();
  for (let i = 0; i < 300; i += 1) {
    const rng = seededRng(Date.now() + i * 15485863);
    const params = template.resolveParameters(rng, MISSION_ARCHETYPE.DIAGNOSE, template.contexts[0], 'medium');
    seenFaults.add(params.faultId);
  }
  for (const fault of ['wrong_gateway', 'missing_login_local', 'missing_rsa', 'wrong_ssh_version', 'telnet_still_allowed', 'missing_user']) {
    test(`fault "${fault}" is generated at least once across 300 attempts`, () => assert.ok(seenFaults.has(fault)));
  }
}

console.log('\nEach diagnose fault leaves exactly the expected check failing, everything else already correct');
{
  const template = getTemplate('cisco-ssh-diagnose');
  const faultToCheckId = {
    wrong_gateway: 'default_gateway',
    missing_login_local: 'vty_login_local',
    missing_rsa: 'rsa_key',
    wrong_ssh_version: 'ssh_version',
    telnet_still_allowed: 'vty_transport_ssh',
    missing_user: 'user_exists',
  };
  for (const [faultId, expectedFailingCheck] of Object.entries(faultToCheckId)) {
    let found = false;
    for (let i = 0; i < 200 && !found; i += 1) {
      const rng = seededRng(Date.now() + i * 17);
      const params = template.resolveParameters(rng, MISSION_ARCHETYPE.DIAGNOSE, template.contexts[0], 'medium');
      if (params.faultId !== faultId) continue;
      found = true;
      const { device } = template.buildDevice(params, MISSION_ARCHETYPE.DIAGNOSE);
      const progress = template.evaluate(device, params, MISSION_ARCHETYPE.DIAGNOSE, { showCommandsUsed: [] });
      test(`fault "${faultId}" only fails "${expectedFailingCheck}"`, () => {
        const failing = progress.checks.filter((c) => !c.ok).map((c) => c.id);
        assert.deepEqual(failing, [expectedFailingCheck]);
      });
    }
    test(`a "${faultId}" instance was found within 200 attempts`, () => assert.ok(found));
  }
}

console.log('\nPersistence / reload: a generated instance is byte-identical after reload');
{
  resetAll();
  completeThroughHm3();
  let instance = null;
  for (let i = 0; i < 40 && !instance; i += 1) {
    const candidate = generateMissionInstance({ seed: Date.now() + i * 7919 });
    if (candidate && SSH_TEMPLATE_IDS.includes(candidate.templateId)) instance = candidate;
  }
  test('an SSH instance was generated for the reload check', () => assert.ok(instance));
  if (instance) {
    const first = getInstance(instance.instanceId);
    const second = getInstance(instance.instanceId);
    test('reloading the instance twice returns identical data (no re-rolling)', () => assert.deepEqual(first, second));
  }
}

console.log('\nAdaptive difficulty is reused, not reimplemented, for remote_administration skills');
{
  test('suggestDifficulty returns a valid profile for a fresh remote_administration subskill', () => {
    const difficulty = suggestDifficulty('cisco.remote_administration.rsa_keys');
    assert.ok(['easy', 'medium', 'hard'].includes(difficulty));
  });
}

console.log('\nEnd-to-end completion via the real CLI engine, one archetype per template');
{
  resetAll();
  completeThroughHm3();

  function findInstance(templateId, archetype, maxAttempts = 200) {
    for (let i = 0; i < maxAttempts; i += 1) {
      const rng = seededRng(Date.now() + i * 7919);
      const template = getTemplate(templateId);
      if (!template.archetypes.includes(archetype)) return null;
      const context = template.contexts[i % template.contexts.length];
      const params = template.resolveParameters(rng, archetype, context, 'medium');
      if (templateId === 'cisco-ssh-enable' || templateId === 'cisco-ssh-vty-access') {
        if (params.deviceType !== 'switch') continue; // keep the CLI script simple/deterministic for this check
      }
      const { device } = template.buildDevice(params, archetype);
      return { template, params, device, archetype };
    }
    return null;
  }

  function run(device, cmds) {
    for (const cmd of cmds) {
      const result = executeProceduralMissionCommand({ device, showCommandsUsed: [], attempts: 0, instanceId: '__scratch__' }, cmd);
      assert.ok(result.success, `command failed: ${cmd}\n${result.output}`);
    }
  }

  {
    const found = findInstance('cisco-ssh-management-access', MISSION_ARCHETYPE.BUILD);
    test('cisco-ssh-management-access BUILD instance found', () => assert.ok(found));
    if (found) {
      const { template, params, device } = found;
      run(device, [
        'enable', 'configure terminal',
        `vlan ${params.mgmtVlanId}`, `name ${params.mgmtVlanName}`, 'exit',
        `interface vlan ${params.mgmtVlanId}`, `ip address ${params.mgmtIp} ${params.mgmtMask}`, 'no shutdown', 'exit',
        `ip default-gateway ${params.mgmtGateway}`,
        'end',
      ]);
      test('cisco-ssh-management-access BUILD solved fully', () => assert.equal(template.evaluate(device, params).allCorrect, true));
    }
  }

  {
    const found = findInstance('cisco-ssh-enable', MISSION_ARCHETYPE.BUILD);
    test('cisco-ssh-enable BUILD instance found (switch variant)', () => assert.ok(found));
    if (found) {
      const { template, params, device } = found;
      run(device, [
        'enable', 'configure terminal',
        `ip domain-name ${params.domainName}`,
        'crypto key generate rsa', '1024',
        'ip ssh version 2',
        'end',
      ]);
      test('cisco-ssh-enable BUILD solved fully', () => assert.equal(template.evaluate(device, params).allCorrect, true));
    }
  }

  {
    const found = findInstance('cisco-ssh-vty-access', MISSION_ARCHETYPE.BUILD);
    test('cisco-ssh-vty-access BUILD instance found (switch variant)', () => assert.ok(found));
    if (found) {
      const { template, params, device } = found;
      run(device, [
        'enable', 'configure terminal',
        'line vty 0 15', 'login local', 'transport input ssh', 'exit',
        'end',
      ]);
      test('cisco-ssh-vty-access BUILD solved fully', () => assert.equal(template.evaluate(device, params).allCorrect, true));
    }
  }

  {
    const found = findInstance('cisco-ssh-vty-access', MISSION_ARCHETYPE.USER_REPORT);
    test('cisco-ssh-vty-access USER_REPORT instance found (switch variant)', () => assert.ok(found));
    if (found) {
      const { template, params, device } = found;
      run(device, [
        'enable', 'configure terminal',
        `username ${params.newUsername} secret ${params.newUserSecret}`,
        'end',
      ]);
      test('cisco-ssh-vty-access USER_REPORT solved fully', () => assert.equal(template.evaluate(device, params).allCorrect, true));
    }
  }

  const faultFix = {
    wrong_gateway: (p) => [`ip default-gateway ${p.mgmtGateway}`],
    missing_login_local: () => ['line vty 0 15', 'login local', 'exit'],
    missing_rsa: () => ['crypto key generate rsa', '1024'],
    wrong_ssh_version: () => ['ip ssh version 2'],
    telnet_still_allowed: () => ['line vty 0 15', 'transport input ssh', 'exit'],
    missing_user: (p) => [`username ${p.username} secret ${p.userSecret}`],
  };
  for (const faultId of Object.keys(faultFix)) {
    let found = null;
    for (let i = 0; i < 200 && !found; i += 1) {
      const rng = seededRng(Date.now() + i * 31);
      const template = getTemplate('cisco-ssh-diagnose');
      const params = template.resolveParameters(rng, MISSION_ARCHETYPE.DIAGNOSE, template.contexts[0], 'medium');
      if (params.faultId !== faultId) continue;
      const { device } = template.buildDevice(params, MISSION_ARCHETYPE.DIAGNOSE);
      found = { template, params, device };
    }
    test(`cisco-ssh-diagnose "${faultId}" instance found`, () => assert.ok(found));
    if (found) {
      const { template, params, device } = found;
      run(device, ['enable', 'configure terminal', ...faultFix[faultId](params), 'end']);
      test(`cisco-ssh-diagnose "${faultId}" solved fully by fixing only that fault`, () => assert.equal(template.evaluate(device, params).allCorrect, true));
    }
  }
}

console.log(`\n${passed} tests passed`);
