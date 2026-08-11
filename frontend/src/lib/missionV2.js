// Mission System V2 – Mission 001 "Grundkonfiguration"
//
// Defines the first playable main mission and a small runtime that evaluates
// the simulated Cisco device state instead of a fixed command sequence.

import { createCiscoDevice, executeCommand } from './ciscoCliEngine.js';
import { recordSkillEvent, SKILL_DIMENSION, SKILL_SOURCE } from './skillTree.js';
import { HINT_LEVEL_LABELS, createHintState, getNextHint, consumeHint, revealSolution, stuckHintFor } from './missionHintSystem.js';
import { registerMission, updateMissionStatus, MissionStatus } from './missionLog.js';

export const MISSION_001_ID = 'cisco-main-001-basic-configuration';

const HOSTNAMES = ['SW-01', 'SW-02', 'ACCESS-01', 'R-BRANCH-01'];
const USERNAMES = ['admin', 'netadmin', 'operator'];
const DESCRIPTIONS = [
  'Management interface',
  'Uplink to core switch',
  'Office floor access',
  'Branch office link',
];

// Simple private test networks for the scenario.
const NETWORKS = [
  { address: '192.168.10.1', mask: '255.255.255.0' },
  { address: '10.20.30.1', mask: '255.255.255.0' },
  { address: '172.16.100.1', mask: '255.255.255.0' },
  { address: '192.168.50.1', mask: '255.255.255.0' },
  { address: '10.10.10.1', mask: '255.255.255.0' },
];

const INTERFACES = ['GigabitEthernet0/0', 'GigabitEthernet0/1', 'FastEthernet0/1'];

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateMission001Scenario(seed = Date.now()) {
  const rng = seededRng(seed);
  const hostname = pick(HOSTNAMES);
  const username = pick(USERNAMES);
  const password = `${username}${rng(100, 999)}`;
  const enableSecret = `${hostname.toLowerCase()}${rng(1000, 9999)}`;
  const network = pick(NETWORKS);
  const iface = pick(INTERFACES);
  const description = pick(DESCRIPTIONS);

  return {
    missionId: MISSION_001_ID,
    title: 'Neues Netzwerkgerät vorbereiten',
    seed,
    parameters: {
      hostname,
      username,
      password,
      enableSecret,
      network,
      interface: iface,
      description,
    },
    briefing: `Ein neues Gerät wurde geliefert und muss für den Einsatz vorbereitet werden.\n\nAuftrag:\n- Gerätename: ${hostname}\n- privileged Zugriff mit enable secret sichern\n- lokalen Benutzer ${username} mit Passwort anlegen\n- Management-Schnittstelle ${iface} mit ${network.address} / ${network.mask} konfigurieren\n- Interface aktivieren und mit "${description}" beschriften\n- DNS-Lookups deaktivieren\n- Konfiguration dauerhaft sichern`,
  };
}

function seededRng(seed) {
  let s = seed;
  return function rand(min, max) {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return Math.floor((s / 2 ** 32) * (max - min + 1)) + min;
  };
}

export function createMission001Device(scenario) {
  return createCiscoDevice({
    hostname: 'Router',
    interfaces: INTERFACES,
  });
}

export function mission001RequiredState(scenario) {
  const p = scenario.parameters;
  return {
    hostname: p.hostname,
    enableSecret: p.enableSecret,
    noIpDomainLookup: true,
    users: { [p.username]: { secret: p.password } },
    interfaces: {
      [p.interface]: {
        ipv4: p.network.address,
        mask: p.network.mask,
        administrativelyDown: false,
        description: p.description,
      },
    },
    saved: true,
  };
}

export function evaluateMission001State(device, scenario) {
  const p = scenario.parameters;
  const required = mission001RequiredState(scenario);
  const result = {
    allCorrect: true,
    checks: [],
    missingSkills: [],
    misconceptions: [],
  };

  function check(label, ok, skillPath, misconception) {
    result.checks.push({ label, ok });
    if (!ok) {
      result.allCorrect = false;
      if (skillPath) result.missingSkills.push(skillPath);
      if (misconception) result.misconceptions.push(misconception);
    }
  }

  check('Hostname korrekt', device.hostname === required.hostname, 'cisco.basic_configuration.hostname');
  check('Enable Secret gesetzt', !!device.runningConfig.enableSecret, 'cisco.basic_configuration.enable_secret');
  check('DNS-Lookup deaktiviert', device.runningConfig.noIpDomainLookup, 'cisco.basic_configuration.disable_dns_lookup');
  const requiredUser = Object.keys(required.users)[0];
  check(
    `Benutzer ${requiredUser} angelegt`,
    device.runningConfig.users[requiredUser]?.secret === required.users[requiredUser].secret,
    'cisco.basic_configuration.local_user',
  );

  const iface = device.runningConfig.interfaces[p.interface];
  const requiredIface = required.interfaces[p.interface];
  check(
    `Interface ${p.interface} IP korrekt`,
    iface?.ipv4 === requiredIface.ipv4,
    'cisco.basic_configuration.interface_ip',
  );
  check(
    `Interface ${p.interface} Maske korrekt`,
    iface?.mask === requiredIface.mask,
    'cisco.basic_configuration.interface_ip',
  );
  check(
    `Interface ${p.interface} administrativ aktiv`,
    iface?.administrativelyDown === false,
    'cisco.basic_configuration.interface_enable',
    'forgot_no_shutdown',
  );
  check(
    `Interface ${p.interface} Beschreibung korrekt`,
    iface?.description === requiredIface.description,
    'cisco.basic_configuration.interface_ip',
  );
  check(
    'Konfiguration gespeichert',
    device.startupConfig !== null,
    'cisco.basic_configuration.save_config',
    'forgot_save_config',
  );

  if (device.startupConfig !== null) {
    check(
      'Gespeicherte Konfiguration enthält Hostname',
      device.startupConfig.hostname === required.hostname,
      'cisco.basic_configuration.save_config',
    );
  }

  return result;
}

// ============================================================================
// Mission runtime
// ============================================================================

const ACTIVE_MISSION_KEY = 'cyberlearn:active-mission-v1';

export function startMission001() {
  const scenario = generateMission001Scenario();
  const device = createMission001Device(scenario);
  const state = {
    missionId: MISSION_001_ID,
    scenario,
    device,
    startedAt: Date.now(),
    lastCommandAt: null,
    showCommandsUsed: [],
    hintState: createHintState([]),
    hintsConsumed: [],
    solutionRevealedFor: [],
    completed: false,
    attempts: 0,
  };
  state.hintState = createHintState([stuckHintFor('cisco.basic_configuration.interface_enable')]);
  localStorage.setItem(ACTIVE_MISSION_KEY, JSON.stringify({
    missionId: MISSION_001_ID,
    scenario,
    device,
    startedAt: state.startedAt,
  }));
  registerMission({ instanceId: scenario.seed, questId: MISSION_001_ID, source: 'inbox', title: scenario.title });
  updateMissionStatus(scenario.seed, MissionStatus.IN_PROGRESS);
  return state;
}

export function loadActiveMission() {
  try {
    const raw = localStorage.getItem(ACTIVE_MISSION_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved.missionId !== MISSION_001_ID) return null;
    const state = {
      missionId: saved.missionId,
      scenario: saved.scenario,
      device: saved.device,
      startedAt: saved.startedAt,
      lastCommandAt: null,
      showCommandsUsed: [],
      hintState: createHintState([stuckHintFor('cisco.basic_configuration.interface_enable')]),
      hintsConsumed: [],
      solutionRevealedFor: [],
      completed: false,
      attempts: 0,
    };
    return state;
  } catch {
    return null;
  }
}

export function saveActiveMission(state) {
  localStorage.setItem(ACTIVE_MISSION_KEY, JSON.stringify({
    missionId: state.missionId,
    scenario: state.scenario,
    device: state.device,
    startedAt: state.startedAt,
  }));
}

export function clearActiveMission() {
  localStorage.removeItem(ACTIVE_MISSION_KEY);
}

export function executeMissionCommand(state, input) {
  const result = executeCommand(state.device, input, { helpCompact: true });
  state.lastCommandAt = Date.now();

  if (result.success) {
    const showCommands = ['show running-config', 'show startup-config', 'show ip interface brief', 'show version'];
    const cmd = result.command?.toLowerCase() || '';
    const usedVerify = showCommands.some((s) => cmd === s || cmd.startsWith(`${s} `));
    if (usedVerify) {
      state.showCommandsUsed.push(cmd);
      recordSkillEvent('cisco', 'basic_configuration', 'verify_running_config', {
        dimension: SKILL_DIMENSION.VERIFY,
        correct: true,
        source: SKILL_SOURCE.MAIN_MISSION,
        missionId: state.missionId,
      });
    }
  }

  if (result.errorType) {
    const map = {
      incomplete_command: 'incomplete_command',
      invalid_argument: 'invalid_argument',
      ambiguous_command: 'ambiguous_command',
      unknown_command: 'unknown_command',
      wrong_mode: 'wrong_mode',
    };
    recordSkillEvent('cisco', 'basic_configuration', 'cli_navigation', {
      dimension: SKILL_DIMENSION.CONFIGURE,
      correct: false,
      cliError: map[result.errorType.toLowerCase()] || result.errorType,
      source: SKILL_SOURCE.MAIN_MISSION,
      missionId: state.missionId,
    });
  }

  saveActiveMission(state);
  return { ...result, state };
}

export function getMissionHint(state, subskillPath) {
  const next = getNextHint(state.hintState, subskillPath);
  if (!next) return null;
  return {
    level: next.level,
    label: HINT_LEVEL_LABELS[next.level],
    text: next.text,
    explanation: next.explanation,
  };
}

export function consumeMissionHint(state, subskillPath) {
  const parts = subskillPath.split('.');
  const domainId = parts[0];
  const skillId = parts[1];
  const subskillId = parts.slice(2).join('.');
  state.hintState = consumeHint(state.hintState, subskillPath, domainId, skillId, subskillId);
  state.hintsConsumed.push({ subskillPath, level: state.hintState.ladders[subskillPath].currentLevel, at: Date.now() });
  saveActiveMission(state);
  return state;
}

export function revealMissionSolution(state, subskillPath, answer, explanation, verificationCommand) {
  const parts = subskillPath.split('.');
  const domainId = parts[0];
  const skillId = parts[1];
  const subskillId = parts.slice(2).join('.');
  state.hintState = revealSolution(state.hintState, subskillPath, domainId, skillId, subskillId, { answer, explanation, verificationCommand });
  state.solutionRevealedFor.push({ subskillPath, answer, at: Date.now() });
  saveActiveMission(state);
  return state;
}

export function evaluateMission001(state) {
  const result = evaluateMission001State(state.device, state.scenario);
  state.attempts += 1;

  if (result.allCorrect) {
    state.completed = true;
    updateMissionStatus(state.scenario.seed, MissionStatus.COMPLETED);
  }

  saveActiveMission(state);
  return { ...result, state };
}

export function mission001Feedback(state, evaluation) {
  const feedback = {
    title: state.completed ? 'Auftrag abgeschlossen' : 'Auftrag noch nicht vollständig',
    checks: evaluation.checks,
    hintsUsed: state.hintsConsumed.length,
    solutionRevealed: state.solutionRevealedFor.length,
    showCommandsUsed: state.showCommandsUsed.length,
    mistakes: evaluation.misconceptions,
  };
  return feedback;
}

