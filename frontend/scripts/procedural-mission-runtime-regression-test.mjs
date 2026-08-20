import {
  startProceduralMission,
  executeProceduralMissionCommand,
  evaluateProceduralMission,
  loadProceduralRuntimeState,
  getInstance,
  writeInstances,
} from '../src/lib/missionGenerator.js';
import {
  getTemplate,
  seededRng,
  MISSION_ARCHETYPE,
} from '../src/lib/missionTemplateEngine.js';

const store = new Map();
global.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
};
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {}, location: { href: '' } };
global.document = { createElement: () => ({}) };

function assertTrue(value, message) {
  if (!value) throw new Error(message);
}

function buildInstance(templateId, seed, archetype, context, difficulty = 'medium') {
  const template = getTemplate(templateId);
  const rng = seededRng(seed);
  const params = template.resolveParameters(rng, archetype, context, difficulty);
  const { device } = template.buildDevice(params, archetype);
  return {
    instanceId: `proc-${templateId}-${seed}-${archetype}-${context}`,
    templateId,
    seed,
    generatedAt: Date.now(),
    channel: 'email',
    skillIds: ['cisco.basic_configuration'],
    difficulty,
    archetype,
    context,
    resolvedParameters: params,
    device,
    title: template.buildTitle(params, archetype, context),
    briefing: template.buildBriefing(params, archetype, context, difficulty),
    status: 'available',
    readState: { read: false, readAt: null },
    acceptedState: { accepted: false, acceptedAt: null },
    completedState: { completed: false, completedAt: null },
    attempts: 0,
    hintsUsed: [],
    solutionRevealedFor: [],
    showCommandsUsed: [],
  };
}

function sendCommands(state, commands) {
  for (const cmd of commands) {
    const result = executeProceduralMissionCommand(state, cmd);
    state = result.state;
    assertTrue(!result.fatalError, `Command "${cmd}" caused fatal error: ${result.error || ''}`);
  }
  return state;
}

function runBasicConfigCommands(state, params, selectedTaskIds) {
  const cmds = ['enable', 'configure terminal'];
  cmds.push(`hostname ${params.targetHostname}`);
  if (selectedTaskIds.includes('enable_secret')) cmds.push(`enable secret ${params.enableSecret}`);
  if (selectedTaskIds.includes('local_user')) cmds.push(`username ${params.username} secret ${params.userSecret}`);
  if (selectedTaskIds.includes('disable_dns_lookup')) cmds.push('no ip domain-lookup');
  if (selectedTaskIds.includes('console_security') || selectedTaskIds.includes('login') || selectedTaskIds.includes('login_local') || selectedTaskIds.includes('exec_timeout')) {
    cmds.push('line console 0');
    if (selectedTaskIds.includes('console_security')) cmds.push(`password ${params.consolePassword}`);
    if (selectedTaskIds.includes('login')) cmds.push('login');
    if (selectedTaskIds.includes('login_local')) cmds.push('login local');
    if (selectedTaskIds.includes('exec_timeout')) cmds.push(`exec-timeout ${params.execTimeoutMinutes} ${params.execTimeoutSeconds}`);
    cmds.push('exit');
  }
  if (selectedTaskIds.includes('service_password_encryption')) cmds.push('service password-encryption');
  cmds.push('end');
  cmds.push('copy running-config startup-config');
  return sendCommands(state, cmds);
}

function runVlanAccessPortCommands(state, params) {
  return sendCommands(state, [
    'enable',
    'configure terminal',
    `vlan ${params.vlanId}`,
    `name ${params.vlanName}`,
    'exit',
    `interface ${params.targetPort}`,
    'switchport mode access',
    `switchport access vlan ${params.vlanId}`,
    'no shutdown',
    'exit',
    'end',
    'copy running-config startup-config',
  ]);
}

// ---------------------------------------------------------------------------
// 1. Basic Config BUILD (SW-AST-04 einrichten)
// ---------------------------------------------------------------------------
{
  const instance = buildInstance('cisco-basic-config-hardening', 1001, MISSION_ARCHETYPE.BUILD, 'aussenstelle');
  writeInstances({ [instance.instanceId]: instance });
  let state = startProceduralMission(instance.instanceId);
  const params = state.params;

  let progress = evaluateProceduralMission(state);
  assertTrue(progress.checks.length > 0, 'BUILD: progress returned checks');
  assertTrue(!progress.allCorrect, 'BUILD: initially not complete');

  state = runBasicConfigCommands(state, params, params.selectedTaskIds);
  progress = evaluateProceduralMission(state);
  if (!progress.allCorrect) {
    console.log('BUILD checks:', progress.checks.map((c) => `${c.id}=${c.ok}`).join(', '));
  }
  assertTrue(progress.allCorrect, 'BUILD: fully configured mission should be complete');

  // serialize + reload
  const reloaded = loadProceduralRuntimeState(instance.instanceId);
  const progressReloaded = evaluateProceduralMission(reloaded);
  assertTrue(progressReloaded.allCorrect, 'BUILD: reloaded state still complete');
}
console.log('✅ Basic Config BUILD regression passed');

// ---------------------------------------------------------------------------
// 2. Basic Config AUDIT (SW-IT-09 Sicherheits-Audit)
// ---------------------------------------------------------------------------
{
  const instance = buildInstance('cisco-basic-config-hardening', 1002, MISSION_ARCHETYPE.AUDIT, 'security_audit');
  writeInstances({ [instance.instanceId]: instance });
  let state = startProceduralMission(instance.instanceId);
  const params = state.params;

  let progress = evaluateProceduralMission(state);
  assertTrue(progress.checks.length > 0, 'AUDIT: progress returned checks');
  const missing = progress.checks.filter((c) => !c.ok && c.id !== 'save_config');
  assertTrue(missing.length > 0, 'AUDIT: some tasks are initially missing');

  state = runBasicConfigCommands(state, params, params.selectedTaskIds);
  progress = evaluateProceduralMission(state);
  assertTrue(progress.allCorrect, 'AUDIT: fully fixed audit should be complete');

  const reloaded = loadProceduralRuntimeState(instance.instanceId);
  const progressReloaded = evaluateProceduralMission(reloaded);
  assertTrue(progressReloaded.allCorrect, 'AUDIT: reloaded state still complete');
}
console.log('✅ Basic Config AUDIT regression passed');

// ---------------------------------------------------------------------------
// 3. VLAN Access Port (Netzwerksegmente Personal & Buchhaltung) – control
// ---------------------------------------------------------------------------
{
  const instance = buildInstance('cisco-vlan-access-port', 1003, MISSION_ARCHETYPE.BUILD, 'personal');
  writeInstances({ [instance.instanceId]: instance });
  let state = startProceduralMission(instance.instanceId);
  const params = state.params;

  let progress = evaluateProceduralMission(state);
  assertTrue(progress.checks.length > 0, 'VLAN: progress returned checks');
  assertTrue(!progress.allCorrect, 'VLAN: initially not complete');

  state = runVlanAccessPortCommands(state, params);
  progress = evaluateProceduralMission(state);
  assertTrue(progress.allCorrect, 'VLAN: fully configured mission should be complete');

  const reloaded = loadProceduralRuntimeState(instance.instanceId);
  const progressReloaded = evaluateProceduralMission(reloaded);
  assertTrue(progressReloaded.allCorrect, 'VLAN: reloaded state still complete');
}
console.log('✅ VLAN Access Port control regression passed');

// ---------------------------------------------------------------------------
// 4. Old/minimal instance migration – missing selectedTaskIds
// ---------------------------------------------------------------------------
{
  const instance = buildInstance('cisco-basic-config-hardening', 1004, MISSION_ARCHETYPE.BUILD, 'ersatzgerat');
  writeInstances({ [instance.instanceId]: instance });
  let raw = JSON.parse(localStorage.getItem('cyberlearn:procedural-instances-v1'));
  delete raw[instance.instanceId].resolvedParameters.selectedTaskIds;
  localStorage.setItem('cyberlearn:procedural-instances-v1', JSON.stringify(raw));

  const loaded = getInstance(instance.instanceId);
  assertTrue(Array.isArray(loaded.resolvedParameters.selectedTaskIds), 'MIGRATION: selectedTaskIds restored');

  let state = startProceduralMission(instance.instanceId);
  let progress = evaluateProceduralMission(state);
  assertTrue(progress.checks.length > 0, 'MIGRATION: evaluate did not crash');

  state = runBasicConfigCommands(state, state.params, state.params.selectedTaskIds);
  progress = evaluateProceduralMission(state);
  assertTrue(progress.allCorrect, 'MIGRATION: fully configured old instance complete');
}
console.log('✅ Old-instance migration regression passed');

// ---------------------------------------------------------------------------
// 5. Mass test across all templates
// ---------------------------------------------------------------------------
{
  const templates = [
    { id: 'cisco-basic-config-hardening', archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.AUDIT], contexts: ['aussenstelle', 'security_audit'] },
    { id: 'cisco-vlan-access-port', archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.REPAIR], contexts: ['personal', 'buchhaltung'] },
    { id: 'cisco-vlan-access-range', archetypes: [MISSION_ARCHETYPE.BUILD], contexts: ['neue_abteilung'] },
    { id: 'cisco-vlan-move', archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.INCIDENT], contexts: ['umzug'] },
    { id: 'cisco-trunk-uplink', archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.REPAIR], contexts: ['personal'] },
    { id: 'cisco-trunk-allowed-vlan', archetypes: [MISSION_ARCHETYPE.BUILD], contexts: ['personal'] },
    { id: 'cisco-router-on-a-stick', archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.COMPLETE], contexts: ['personal'] },
    { id: 'cisco-router-fault', archetypes: [MISSION_ARCHETYPE.REPAIR], contexts: ['personal'] },
    { id: 'cisco-ssh-management-access', archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.REPAIR, MISSION_ARCHETYPE.COMPLETE], contexts: ['neuer_verwaltungszugang'] },
    { id: 'cisco-ssh-enable', archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.COMPLETE, MISSION_ARCHETYPE.HARDEN], contexts: ['neues_geraet'] },
    { id: 'cisco-ssh-vty-access', archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.USER_REPORT, MISSION_ARCHETYPE.AUDIT], contexts: ['neuer_mitarbeiter'] },
    { id: 'cisco-ssh-diagnose', archetypes: [MISSION_ARCHETYPE.DIAGNOSE, MISSION_ARCHETYPE.REPAIR], contexts: ['kein_zugriff'] },
  ];

  let total = 0;
  let exceptions = 0;
  for (const { id, archetypes, contexts } of templates) {
    for (const archetype of archetypes) {
      for (const context of contexts) {
        total += 1;
        const seed = 5000 + total;
        try {
          const instance = buildInstance(id, seed, archetype, context);
          writeInstances({ [instance.instanceId]: instance });
          let state = startProceduralMission(instance.instanceId);
          let progress = evaluateProceduralMission(state);
          assertTrue(progress.checks.length > 0, `MASS ${id}/${archetype}: no checks`);
          // partial: run a harmless show command and re-evaluate
          state = sendCommands(state, ['show running-config']);
          progress = evaluateProceduralMission(state);
          assertTrue(progress.checks.length > 0, `MASS ${id}/${archetype}: no checks after partial`);
          // serialize + reload + evaluate
          const reloaded = loadProceduralRuntimeState(instance.instanceId);
          progress = evaluateProceduralMission(reloaded);
          assertTrue(progress.checks.length > 0, `MASS ${id}/${archetype}: no checks after reload`);
        } catch (e) {
          console.error(`MASS FAIL ${id}/${archetype}/${context}:`, e.message);
          exceptions += 1;
        }
      }
    }
  }
  assertTrue(exceptions === 0, `MASS: ${exceptions} exceptions across ${total} template/archetype/context combos`);
  console.log(`✅ Mass procedural runtime test passed (${total} combos)`);
}

console.log('\n🎉 All procedural mission runtime regression tests passed');
