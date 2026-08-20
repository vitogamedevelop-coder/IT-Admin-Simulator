// Procedural Cisco Mission System - Solvability Audit.
//
// Standalone script (no test framework) that mass-checks every procedural
// mission template/archetype combination for solvability with a canonical
// command solver, plus a handful of targeted edge-case scenarios (partial
// preconfiguration, alternative valid command orders, hidden-parameter
// leakage into briefings, and Mission 002 verification/persistence gating).
//
// Run with: npx tsx scripts/procedural-mission-solvability-audit.mjs
// (from the frontend/ directory)

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
  TEMPLATE_REGISTRY, MISSION_ARCHETYPE, MISSION_CHANNEL, seededRng,
} from '../src/lib/missionTemplateEngine.js';
import {
  startProceduralMission, executeProceduralMissionCommand, getProceduralMissionProgress,
} from '../src/lib/missionGenerator.js';
import {
  startMission002, executeMissionCommand as executeMainMissionCommand, getMainMissionProgress,
} from '../src/lib/missionV2.js';

// ============================================================================
// Test harness
// ============================================================================

const results = [];
function assert(condition, message) {
  results.push({ ok: !!condition, message });
  if (!condition) {
    console.error(`  FAIL - ${message}`);
  }
  return !!condition;
}

const INSTANCES_KEY = 'cyberlearn:procedural-instances-v1';

// ============================================================================
// Instance / runtime helpers
// ============================================================================

function createAndStartInstance(template, archetype, context, seed) {
  const rng = seededRng(seed);
  const params = template.resolveParameters(rng, archetype, context, 'medium');
  const device = template.buildDevice(params, archetype).device;
  const title = template.buildTitle(params, archetype, context, 'medium');
  const briefing = template.buildBriefing(params, archetype, context, 'medium');

  const instanceId = `audit-${template.id}-${archetype}-${seed}`;
  const instance = {
    instanceId,
    templateId: template.id,
    seed,
    generatedAt: Date.now(),
    channel: template.allowedChannels[0] || MISSION_CHANNEL.EMAIL,
    skillIds: [template.requiredSkills[0]],
    difficulty: 'medium',
    archetype,
    context,
    resolvedParameters: params,
    device,
    title,
    briefing,
    status: 'available',
    readState: { read: false, readAt: null },
    acceptedState: { accepted: false, acceptedAt: null },
    completedState: { completed: false, completedAt: null },
    attempts: 0,
    hintsUsed: [],
    solutionRevealedFor: [],
    showCommandsUsed: [],
  };

  const raw = JSON.parse(storage.getItem(INSTANCES_KEY) || '{}');
  raw[instanceId] = instance;
  storage.setItem(INSTANCES_KEY, JSON.stringify(raw));

  const state = startProceduralMission(instanceId);
  // Attach the instance for the audit's own bookkeeping (title/briefing are
  // not part of the production runtime-state shape, but this script needs
  // them for the hidden-parameter audit below).
  state.instance = instance;
  return state;
}

function runCommands(state, commands, executor = executeProceduralMissionCommand) {
  let current = state;
  for (const cmd of commands) {
    const result = executor(current, cmd);
    current = result.state;
  }
  return current;
}

// ============================================================================
// Canonical solver - one branch per template id in TEMPLATE_REGISTRY.
// ============================================================================

function solveCommands(templateId, archetype, params) {
  const head = ['enable', 'configure terminal'];
  const tail = ['end', 'copy running-config startup-config'];

  switch (templateId) {
    case 'cisco-basic-config-hardening': {
      const selected = new Set(params.selectedTaskIds);
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

    case 'cisco-vlan-access-port': {
      return [
        ...head,
        `vlan ${params.vlanId}`,
        `name ${params.vlanName}`,
        'exit',
        `interface ${params.targetPort}`,
        'switchport mode access',
        `switchport access vlan ${params.vlanId}`,
        'no shutdown',
        'exit',
        ...tail,
      ];
    }

    case 'cisco-vlan-access-range': {
      const ports = params.targetPorts;
      const first = ports[0];
      const last = ports[ports.length - 1];
      const lastSuffix = last.split('/').pop();
      const rangeString = `${first} - ${lastSuffix}`;
      return [
        ...head,
        `vlan ${params.vlanId}`,
        `name ${params.vlanName}`,
        'exit',
        `interface range ${rangeString}`,
        'switchport mode access',
        `switchport access vlan ${params.vlanId}`,
        'no shutdown',
        'exit',
        ...tail,
      ];
    }

    case 'cisco-vlan-move': {
      return [
        ...head,
        `interface ${params.targetPort}`,
        `switchport access vlan ${params.targetVlanId}`,
        'no shutdown',
        'exit',
        ...tail,
      ];
    }

    case 'cisco-trunk-uplink': {
      const body = [];
      params.vlans.forEach((v) => { body.push(`vlan ${v.id}`, `name ${v.name}`, 'exit'); });
      const vlanIds = params.vlans.map((v) => v.id).join(',');
      body.push(
        `interface ${params.uplinkPort}`,
        'switchport mode trunk',
        `switchport trunk allowed vlan ${vlanIds}`,
        'no shutdown',
        'exit',
      );
      return [...head, ...body, ...tail];
    }

    case 'cisco-trunk-allowed-vlan': {
      const allVlanIds = params.vlans.map((v) => v.id).join(',');
      return [
        ...head,
        `interface ${params.uplinkPort}`,
        `switchport trunk allowed vlan ${allVlanIds}`,
        'no shutdown',
        'exit',
        ...tail,
      ];
    }

    case 'cisco-access-port-hardening': {
      const body = [];
      params.accessPorts.forEach((port) => {
        body.push(`interface ${port}`, 'spanning-tree portfast', 'spanning-tree bpduguard enable', 'exit');
      });
      if (archetype === 'diagnose') {
        // Errdisable recovery for the faulty port: verify via a show command
        // first (VERIFICATION requirement), then cycle shutdown/no shutdown.
        body.unshift('do show spanning-tree summary');
        body.push(`interface ${params.faultyPort}`, 'shutdown', 'no shutdown', 'exit');
      }
      return [...head, ...body, ...tail];
    }

    case 'cisco-trunk-native-vlan': {
      return [
        ...head,
        `interface ${params.uplinkPort}`,
        `switchport trunk allowed vlan ${params.targetAllowedVlanIds.join(',')}`,
        `switchport trunk native vlan ${params.targetNativeVlanId}`,
        'no shutdown',
        'exit',
        ...tail,
      ];
    }

    case 'cisco-router-on-a-stick': {
      const body = [];
      params.vlans.forEach((v) => { body.push(`vlan ${v.id}`, `name ${v.name}`, 'exit'); });
      params.vlans.forEach((v) => {
        v.accessPorts.forEach((port) => {
          body.push(
            `interface ${port}`,
            'switchport mode access',
            `switchport access vlan ${v.id}`,
            'no shutdown',
            'exit',
          );
        });
      });
      const vlanIds = params.vlans.map((v) => v.id).join(',');
      body.push(
        `interface ${params.uplinkPort}`,
        'switchport mode trunk',
        `switchport trunk allowed vlan ${vlanIds}`,
        'no shutdown',
        'exit',
      );
      body.push(`interface ${params.routerPhysicalPort}`, 'no shutdown', 'exit');
      params.vlans.forEach((v) => {
        body.push(
          `interface ${params.routerPhysicalPort}.${v.id}`,
          `encapsulation dot1q ${v.id}`,
          `ip address ${v.gateway} ${v.mask}`,
          'no shutdown',
          'exit',
        );
      });
      return [...head, ...body, ...tail];
    }

    case 'cisco-router-fault': {
      const firstVlan = params.vlans[0];
      const allVlanIds = params.vlans.map((v) => v.id).join(',');
      const body = [];
      switch (params.faultId) {
        case 'wrong_dot1q':
          body.push(
            `interface ${params.routerPhysicalPort}.${firstVlan.id}`,
            `encapsulation dot1q ${firstVlan.id}`,
            'exit',
          );
          break;
        case 'wrong_gateway':
          body.push(
            `interface ${params.routerPhysicalPort}.${firstVlan.id}`,
            `ip address ${firstVlan.gateway} ${firstVlan.mask}`,
            'exit',
          );
          break;
        case 'router_physical_down':
          body.push(`interface ${params.routerPhysicalPort}`, 'no shutdown', 'exit');
          break;
        case 'missing_subinterface':
          body.push(
            `interface ${params.routerPhysicalPort}.${firstVlan.id}`,
            `encapsulation dot1q ${firstVlan.id}`,
            `ip address ${firstVlan.gateway} ${firstVlan.mask}`,
            'no shutdown',
            'exit',
          );
          break;
        case 'missing_allowed_vlan':
          body.push(
            `interface ${params.uplinkPort}`,
            `switchport trunk allowed vlan ${allVlanIds}`,
            'exit',
          );
          break;
        case 'uplink_access':
          body.push(
            `interface ${params.uplinkPort}`,
            'switchport mode trunk',
            `switchport trunk allowed vlan ${allVlanIds}`,
            'no shutdown',
            'exit',
          );
          break;
        default:
          throw new Error(`cisco-router-fault: unhandled faultId "${params.faultId}"`);
      }
      return [...head, ...body, ...tail];
    }

    case 'cisco-ssh-management-access': {
      return [
        ...head,
        `vlan ${params.mgmtVlanId}`,
        `name ${params.mgmtVlanName}`,
        'exit',
        `interface Vlan${params.mgmtVlanId}`,
        `ip address ${params.mgmtIp} ${params.mgmtMask}`,
        'no shutdown',
        'exit',
        `ip default-gateway ${params.mgmtGateway}`,
        ...tail,
      ];
    }

    case 'cisco-ssh-enable': {
      return [
        ...head,
        `ip domain-name ${params.domainName}`,
        'crypto key generate rsa',
        '1024',
        'ip ssh version 2',
        ...tail,
      ];
    }

    case 'cisco-ssh-vty-access': {
      const body = ['line vty 0 15', 'login local', 'transport input ssh', 'exit'];
      if (params.requiredChecks.includes('new_user')) {
        body.push(`username ${params.newUsername} secret ${params.newUserSecret}`);
      }
      return [...head, ...body, ...tail];
    }

    case 'cisco-ssh-diagnose': {
      const body = [];
      switch (params.faultId) {
        case 'wrong_gateway':
          body.push(`ip default-gateway ${params.mgmtGateway}`);
          break;
        case 'missing_login_local':
          body.push('line vty 0 15', 'login local', 'exit');
          break;
        case 'missing_rsa':
          body.push('crypto key generate rsa', '1024');
          break;
        case 'wrong_ssh_version':
          body.push('ip ssh version 2');
          break;
        case 'telnet_still_allowed':
          body.push('line vty 0 15', 'transport input ssh', 'exit');
          break;
        case 'missing_user':
          body.push(`username ${params.username} secret ${params.userSecret}`);
          break;
        default:
          throw new Error(`cisco-ssh-diagnose: unhandled faultId "${params.faultId}"`);
      }
      return [...head, ...body, ...tail];
    }

    default:
      throw new Error(`solveCommands: no canonical solver implemented for template "${templateId}"`);
  }
}

// ============================================================================
// A) Canonical solvability mass test - every template x archetype x seed(1-3)
// ============================================================================

console.log('A) Canonical solvability mass test (every template x archetype x seed 1-3)');

const generatedInstances = [];

for (const template of Object.values(TEMPLATE_REGISTRY)) {
  for (const archetype of template.archetypes) {
    for (let seed = 1; seed <= 3; seed += 1) {
      const context = template.contexts[(seed - 1) % template.contexts.length];
      const label = `${template.id}/${archetype}/seed${seed}`;
      let state;
      try {
        state = createAndStartInstance(template, archetype, context, seed);
      } catch (err) {
        assert(false, `${label}: failed to create/start instance: ${err.message}`);
        continue;
      }
      generatedInstances.push({ template, archetype, context, seed, state });

      let cmds;
      try {
        cmds = solveCommands(template.id, archetype, state.params);
      } catch (err) {
        assert(false, `${label}: solver error: ${err.message}`);
        continue;
      }

      const finalState = runCommands(state, cmds);
      const progress = getProceduralMissionProgress(finalState);
      assert(progress.allCorrect, `${label}: canonical solver should produce allCorrect (checks: ${JSON.stringify(progress.checks)})`);

      const missingOk = (progress.checks || []).filter((c) => typeof c.ok !== 'boolean');
      assert(missingOk.length === 0, `${label}: every check must report a boolean "ok" (missing on: ${missingOk.map((c) => c.id).join(', ')})`);
    }
  }
}

// ============================================================================
// B) Alternative valid command sequence (Test F) - omit explicit
// "switchport mode access" when only assigning the access VLAN; the handler
// sets access mode implicitly.
// ============================================================================

console.log('B) Alternative valid command sequence (omit explicit "switchport mode access")');
{
  const template = TEMPLATE_REGISTRY['cisco-vlan-access-port'];
  const archetype = MISSION_ARCHETYPE.BUILD;
  const context = template.contexts[0];
  const state = createAndStartInstance(template, archetype, context, 501);
  const p = state.params;
  const commands = [
    'enable', 'configure terminal',
    `vlan ${p.vlanId}`, `name ${p.vlanName}`, 'exit',
    `interface ${p.targetPort}`,
    `switchport access vlan ${p.vlanId}`,
    'no shutdown', 'exit',
    'end', 'copy running-config startup-config',
  ];
  const finalState = runCommands(state, commands);
  const progress = getProceduralMissionProgress(finalState);
  assert(progress.allCorrect, 'cisco-vlan-access-port: omitting "switchport mode access" (implicit via access vlan assignment) should still pass');
}

// ============================================================================
// C) Partially preconfigured state (Test A) - VLAN already exists on device.
// ============================================================================

console.log('C) Partially preconfigured state (VLAN already created out-of-band)');
{
  const template = TEMPLATE_REGISTRY['cisco-vlan-access-port'];
  const archetype = MISSION_ARCHETYPE.BUILD;
  const context = template.contexts[0];
  const state = createAndStartInstance(template, archetype, context, 502);
  const p = state.params;
  state.device.runningConfig.vlans[p.vlanId] = { id: p.vlanId, name: p.vlanName };
  const commands = [
    'enable', 'configure terminal',
    `interface ${p.targetPort}`,
    'switchport mode access',
    `switchport access vlan ${p.vlanId}`,
    'no shutdown', 'exit',
    'end', 'copy running-config startup-config',
  ];
  const finalState = runCommands(state, commands);
  const progress = getProceduralMissionProgress(finalState);
  assert(progress.allCorrect, 'cisco-vlan-access-port: pre-existing VLAN + running only the interface commands should still pass');
}

// ============================================================================
// D) Fully preconfigured state (Test B) - the target state is already fully
// met before any commands run at all (still needs a save to persist it,
// since evaluate() reads live runningConfig, not startupConfig, for this
// template - so this is a state-only check).
// ============================================================================

console.log('D) Fully preconfigured state (target state already fully met)');
{
  const template = TEMPLATE_REGISTRY['cisco-vlan-access-port'];
  const archetype = MISSION_ARCHETYPE.BUILD;
  const context = template.contexts[0];
  const state = createAndStartInstance(template, archetype, context, 503);
  const p = state.params;
  state.device.runningConfig.vlans[p.vlanId] = { id: p.vlanId, name: p.vlanName };
  const iface = state.device.runningConfig.interfaces[p.targetPort];
  iface.switchportMode = 'access';
  iface.accessVlan = p.vlanId;
  iface.administrativelyDown = false;
  const progress = getProceduralMissionProgress(state);
  assert(progress.allCorrect, 'cisco-vlan-access-port: fully preconfigured target state should already evaluate as allCorrect without running any commands');
}

// ============================================================================
// E) Wrong preconfig then correct (Test C) - REPAIR archetype starts the
// port in the wrong VLAN; the canonical solver must still fix it.
// ============================================================================

console.log('E) Wrong preconfig then correct (REPAIR archetype)');
{
  const template = TEMPLATE_REGISTRY['cisco-vlan-access-port'];
  const archetype = MISSION_ARCHETYPE.REPAIR;
  const context = template.contexts[0];
  const state = createAndStartInstance(template, archetype, context, 504);
  const p = state.params;
  const iface = state.device.runningConfig.interfaces[p.targetPort];
  assert(iface.switchportMode === 'access' && iface.accessVlan === p.decoyVlanId, 'cisco-vlan-access-port REPAIR: initial state should have the port in the wrong (decoy) VLAN');
  const cmds = solveCommands(template.id, archetype, p);
  const finalState = runCommands(state, cmds);
  const progress = getProceduralMissionProgress(finalState);
  assert(progress.allCorrect, 'cisco-vlan-access-port REPAIR: canonical solver should repair the wrong-VLAN fault');
}

// ============================================================================
// F) Hidden-port / hidden-parameter audit (Test D + E) - every interface
// name referenced by resolved parameters must be discoverable by the player
// through the briefing or title text (in full or short form).
// ============================================================================

console.log('F) Hidden-port / hidden-parameter audit (every referenced interface must appear in briefing/title)');

function shortInterfaceName(name) {
  return name
    .replace('GigabitEthernet', 'Gi')
    .replace('FastEthernet', 'Fa')
    .replace('TenGigabitEthernet', 'Te')
    .replace('Vlan', 'Vlan');
}

function isInterfaceLikeString(value) {
  return typeof value === 'string' && (
    value.startsWith('FastEthernet')
    || value.startsWith('GigabitEthernet')
    || value.startsWith('TenGigabitEthernet')
  );
}

function collectReferencedInterfaceStrings(templateId, params) {
  const acc = [];
  const add = (v) => { if (isInterfaceLikeString(v)) acc.push(v); };

  add(params.targetPort);
  if (Array.isArray(params.targetPorts)) params.targetPorts.forEach(add);
  add(params.uplinkPort);
  add(params.routerPhysicalPort);

  // VLAN access ports are only player-actionable in build/complete/repair
  // scenarios. In fault/diagnose templates the access ports are already in
  // their target state and only the router/switch side must be touched, so
  // they do not need to be repeated in the briefing.
  const actionableVlanTemplates = new Set([
    'cisco-vlan-access-port',
    'cisco-vlan-access-range',
    'cisco-vlan-move',
    'cisco-router-on-a-stick',
  ]);
  if (params.vlans && actionableVlanTemplates.has(templateId)) {
    params.vlans.forEach((v) => {
      if (Array.isArray(v.accessPorts)) v.accessPorts.forEach(add);
    });
  }

  return acc;
}

for (const { template, archetype, seed, state } of generatedInstances) {
  const briefing = state.instance.briefing || '';
  const title = state.instance.title || '';
  const interfaceNames = new Set(collectReferencedInterfaceStrings(template.id, state.params));
  for (const fullName of interfaceNames) {
    const shortName = shortInterfaceName(fullName);
    const visible = briefing.includes(shortName) || briefing.includes(fullName)
      || title.includes(shortName) || title.includes(fullName);
    assert(visible, `${template.id}/${archetype}/seed${seed}: interface "${fullName}" (short "${shortName}") is used by the mission but never mentioned in its briefing or title`);
  }
}

// ============================================================================
// G) Verification requirement (Test G) and persistence requirement
// (Test H) for Mission 002.
// ============================================================================

console.log('G) Mission 002: verification and persistence requirements are actually enforced');

function mainProgressFlags(progress) {
  return {
    allCorrect: progress.allCorrect,
    verified: progress.checks.find((c) => c.id === 'verified')?.ok || false,
    saved: progress.checks.find((c) => c.id === 'saved')?.ok || false,
  };
}

{
  let state = startMission002(9001);
  const p = state.scenario.parameters;
  const commands = [
    'enable', 'configure terminal',
    `vlan ${p.personalVlanId}`, `name ${p.personalVlanName}`, 'exit',
    `vlan ${p.buchhaltungVlanId}`, `name ${p.buchhaltungVlanName}`, 'exit',
    `vlan ${p.parkingVlanId}`, `name ${p.parkingVlanName}`, 'exit',
    `interface ${p.personalPorts[0]}`, 'switchport mode access', `switchport access vlan ${p.personalVlanId}`, 'no shutdown', 'exit',
    `interface ${p.buchhaltungPorts[0]}`, 'switchport mode access', `switchport access vlan ${p.buchhaltungVlanId}`, 'no shutdown', 'exit',
    `interface range ${p.unusedPorts[0]} - ${p.unusedPorts[p.unusedPorts.length - 1].split('/').pop()}`,
    'switchport mode access', `switchport access vlan ${p.parkingVlanId}`, 'shutdown', 'exit',
    `interface ${p.uplinkPort}`, 'switchport mode trunk', 'no shutdown', 'exit',
    'end',
  ];
  state = runCommands(state, commands, executeMainMissionCommand);

  const beforeProgress = getMainMissionProgress(state);
  const beforeFlags = mainProgressFlags(beforeProgress);
  assert(beforeFlags.allCorrect === false, 'Mission 002: allCorrect must be false before verifying and saving');
  assert(beforeFlags.verified === false, 'Mission 002: verified must be false before any show command is used');
  assert(beforeFlags.saved === false, 'Mission 002: saved must be false before copy running-config startup-config');

  // At this point `end` already returned to privileged EXEC, so the show
  // command is issued directly (no "do" prefix needed/valid outside config
  // mode).
  state = runCommands(state, ['show running-config', 'copy running-config startup-config'], executeMainMissionCommand);
  const afterProgress = getMainMissionProgress(state);
  const afterFlags = mainProgressFlags(afterProgress);
  assert(afterFlags.allCorrect === true, `Mission 002: allCorrect must become true after verifying and saving (checks: ${JSON.stringify(afterProgress.checks)})`);
  assert(afterFlags.verified === true, 'Mission 002: verified must become true after a show command is used');
  assert(afterFlags.saved === true, 'Mission 002: saved must become true after copy running-config startup-config');
}

// ============================================================================
// H) Partial preconfig for Mission 002 (Test A on the concrete scenario)
// ============================================================================

console.log('H) Mission 002: partial preconfig (switchport mode access already set, VLAN not yet assigned)');
{
  let state = startMission002(9002);
  const p = state.scenario.parameters;
  const personalIface = state.device.runningConfig.interfaces[p.personalPorts[0]];
  const buchhaltungIface = state.device.runningConfig.interfaces[p.buchhaltungPorts[0]];
  personalIface.switchportMode = 'access';
  personalIface.administrativelyDown = false;
  buchhaltungIface.switchportMode = 'access';
  buchhaltungIface.administrativelyDown = false;

  const commands = [
    'enable', 'configure terminal',
    `vlan ${p.personalVlanId}`, `name ${p.personalVlanName}`, 'exit',
    `vlan ${p.buchhaltungVlanId}`, `name ${p.buchhaltungVlanName}`, 'exit',
    `vlan ${p.parkingVlanId}`, `name ${p.parkingVlanName}`, 'exit',
    `interface ${p.personalPorts[0]}`, `switchport access vlan ${p.personalVlanId}`, 'exit',
    `interface ${p.buchhaltungPorts[0]}`, `switchport access vlan ${p.buchhaltungVlanId}`, 'exit',
    `interface range ${p.unusedPorts[0]} - ${p.unusedPorts[p.unusedPorts.length - 1].split('/').pop()}`,
    'switchport mode access', `switchport access vlan ${p.parkingVlanId}`, 'shutdown', 'exit',
    `interface ${p.uplinkPort}`, 'switchport mode trunk', 'no shutdown', 'exit',
    'do show running-config',
    'end',
    'copy running-config startup-config',
  ];
  state = runCommands(state, commands, executeMainMissionCommand);
  const progress = getMainMissionProgress(state);
  assert(progress.allCorrect, `Mission 002 partial preconfig: canonical solver over partially preconfigured access ports should still reach allCorrect (checks: ${JSON.stringify(progress.checks)})`);
}

// ============================================================================
// I) Fully preconfigured target state for Mission 002 (Test B)
// ============================================================================

console.log('I) Mission 002: fully preconfigured target state still requires verification + save');
{
  let state = startMission002(9003);
  const p = state.scenario.parameters;
  const rc = state.device.runningConfig;

  rc.vlans[p.personalVlanId] = { id: p.personalVlanId, name: p.personalVlanName };
  rc.vlans[p.buchhaltungVlanId] = { id: p.buchhaltungVlanId, name: p.buchhaltungVlanName };
  rc.vlans[p.parkingVlanId] = { id: p.parkingVlanId, name: p.parkingVlanName };

  const personalIface = rc.interfaces[p.personalPorts[0]];
  personalIface.switchportMode = 'access';
  personalIface.accessVlan = p.personalVlanId;
  personalIface.administrativelyDown = false;

  const buchhaltungIface = rc.interfaces[p.buchhaltungPorts[0]];
  buchhaltungIface.switchportMode = 'access';
  buchhaltungIface.accessVlan = p.buchhaltungVlanId;
  buchhaltungIface.administrativelyDown = false;

  p.unusedPorts.forEach((id) => {
    const iface = rc.interfaces[id];
    iface.switchportMode = 'access';
    iface.accessVlan = p.parkingVlanId;
    iface.administrativelyDown = true;
  });

  const uplinkIface = rc.interfaces[p.uplinkPort];
  uplinkIface.switchportMode = 'trunk';
  uplinkIface.administrativelyDown = false;

  // State-based requirements should already be satisfied, but verification
  // and persistence are separate action/persistence requirements that must
  // still be earned explicitly.
  const beforeProgress = getMainMissionProgress(state);
  const beforeStateChecks = beforeProgress.checks.filter((c) => c.type === 'state');
  assert(beforeStateChecks.every((c) => c.ok), `Mission 002 full preconfig: all state-based checks should already be true (checks: ${JSON.stringify(beforeStateChecks)})`);
  const beforeFlags = mainProgressFlags(beforeProgress);
  assert(beforeFlags.verified === false, 'Mission 002 full preconfig: verified must still be false before any show command is used');
  assert(beforeFlags.saved === false, 'Mission 002 full preconfig: saved must still be false before a save command is used');
  assert(beforeFlags.allCorrect === false, 'Mission 002 full preconfig: allCorrect must still be false until verified and saved');

  // Already in (or reachable via) privileged EXEC here, so "show" is issued
  // directly without the "do" prefix (which is only valid from config mode).
  state = runCommands(state, ['enable', 'show running-config', 'configure terminal', 'end', 'copy running-config startup-config'], executeMainMissionCommand);
  const afterProgress = getMainMissionProgress(state);
  const afterFlags = mainProgressFlags(afterProgress);
  assert(afterFlags.allCorrect === true, `Mission 002 full preconfig: allCorrect must become true after verifying and saving (checks: ${JSON.stringify(afterProgress.checks)})`);
}

// ============================================================================
// Summary
// ============================================================================

const total = results.length;
const failed = results.filter((r) => !r.ok);
const passed = total - failed.length;

console.log('\n=== Procedural Mission Solvability Audit: Summary ===');
console.log(`Total assertions: ${total}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed.length}`);

if (failed.length > 0) {
  console.log('\nFailed assertions:');
  failed.forEach((f) => console.log(`  - ${f.message}`));
  process.exitCode = 1;
}
