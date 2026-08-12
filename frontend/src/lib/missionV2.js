// Mission System V2 – Mission 001 "Der erste Switch"
//
// Defines the first playable main mission and a small runtime that evaluates
// the simulated Cisco device state instead of a fixed command sequence.
//
// Mission 001 is intentionally tiny: a brand-new Layer-2 switch must be
// prepared with the five classic basic configuration requirements:
//   1. hostname Sw1
//   2. enable secret
//   3. local admin user
//   4. no ip domain-lookup
//   5. saved startup-config

import { createCiscoDevice, executeCommand } from './ciscoCliEngine.js';
import { recordSkillEvent, SKILL_DIMENSION, SKILL_SOURCE } from './skillTree.js';
import { HINT_LEVEL_LABELS, createHintState, getNextHint, consumeHint, revealSolution, defineHintLadder } from './missionHintSystem.js';
import { registerMission, updateMissionStatus, MissionStatus } from './missionLog.js';

export const MISSION_001_ID = 'cisco-main-001';

const INITIAL_HOSTNAME = 'Switch';
const TARGET_HOSTNAME = 'Sw1';
const DEFAULT_USERNAME = 'admin';

// Small wordlist for enable-secret and user-secret values.  These are
// mission-only test values, never real credentials.
const SECRET_WORDS = ['cisco', 'nexus', 'switch', 'admin', 'netlab'];
const SECRET_SUFFIXES = ['101', '202', '303', '404', '505'];

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function hasUserCredential(user) {
  return !!user && (!!user.secret || !!user.password);
}

function generateSecret(rng) {
  return `${pick(SECRET_WORDS)}${pick(SECRET_SUFFIXES)}${rng(1, 9)}`;
}

export function generateMission001Scenario(seed = Date.now()) {
  const rng = seededRng(seed);
  const enableSecret = generateSecret(rng);
  const userSecret = generateSecret(rng);

  return {
    missionId: MISSION_001_ID,
    title: 'Der erste Switch',
    seed,
    deviceType: 'layer2_switch',
    initialHostname: INITIAL_HOSTNAME,
    parameters: {
      targetHostname: TARGET_HOSTNAME,
      username: DEFAULT_USERNAME,
      enableSecret,
      userSecret,
    },
    briefing: `Für NEXUS wurde ein neuer Cisco Layer-2-Switch geliefert.\n\nAuftrag:\n- Gerätetyp: Cisco Layer-2-Switch\n- Aktueller Name: ${INITIAL_HOSTNAME}\n- Zielname: ${TARGET_HOSTNAME}\n\nAnforderungen:\n1. Gerätenamen auf ${TARGET_HOSTNAME} setzen\n2. privilegierten Zugriff mit enable secret absichern\n3. lokalen Benutzer ${DEFAULT_USERNAME} mit Passwort anlegen\n4. unnötige DNS-Lookups deaktivieren\n5. Konfiguration dauerhaft speichern`,
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
    type: 'layer2_switch',
    hostname: scenario.initialHostname || INITIAL_HOSTNAME,
    interfaces: ['GigabitEthernet0/1'],
  });
}

export const MISSION_001_REQUIREMENTS = [
  { id: 'hostname', label: 'Gerätename Sw1', skill: 'cisco.basic_configuration.hostname' },
  { id: 'enable_secret', label: 'Enable Secret gesetzt', skill: 'cisco.basic_configuration.enable_secret' },
  { id: 'local_user', label: 'Lokaler Benutzer admin', skill: 'cisco.basic_configuration.local_user' },
  { id: 'no_dns_lookup', label: 'DNS-Lookup deaktiviert', skill: 'cisco.basic_configuration.disable_dns_lookup' },
  { id: 'save_config', label: 'Konfiguration gespeichert', skill: 'cisco.basic_configuration.save_config' },
];

export function getMission001Progress(device, scenario) {
  const p = scenario.parameters;
  const savedConfig = device.startupConfig;

  const checks = {
    hostname: device.hostname === p.targetHostname,
    enable_secret: !!device.runningConfig?.enableSecret,
    local_user: hasUserCredential(device.runningConfig?.users[p.username]),
    no_dns_lookup: !!device.runningConfig?.noIpDomainLookup,
    save_config: savedConfig !== null
      && savedConfig.hostname === p.targetHostname
      && !!savedConfig.enableSecret
      && hasUserCredential(savedConfig.users[p.username])
      && !!savedConfig.noIpDomainLookup,
  };

  const completed = MISSION_001_REQUIREMENTS.filter((r) => checks[r.id]).length;
  const total = MISSION_001_REQUIREMENTS.length;

  return {
    completed,
    total,
    checks: MISSION_001_REQUIREMENTS.map((r) => ({ ...r, ok: checks[r.id] })),
    allCorrect: completed === total,
  };
}

export function mission001RequiredState(scenario) {
  const p = scenario.parameters;
  return {
    hostname: p.targetHostname,
    enableSecret: p.enableSecret,
    noIpDomainLookup: true,
    users: { [p.username]: { secret: p.userSecret } },
    saved: true,
  };
}

export function evaluateMission001State(device, scenario) {
  const progress = getMission001Progress(device, scenario);
  const misconceptions = [];

  if (!progress.checks.find((c) => c.id === 'save_config').ok && progress.completed > 0) {
    misconceptions.push('forgot_save_config');
  }

  return {
    ...progress,
    allCorrect: progress.allCorrect,
    misconceptions,
  };
}

// Hint ladders for each individual requirement so the player can escalate
// help per topic without immediately getting the full solution.
const HINT_LADDERS = {
  hostname: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.hostname',
    nudge: 'Ein Netzwerkgerät sollte im Betrieb eindeutig identifizierbar sein.',
    focus: 'Prüfe den aktuellen Gerätenamen des Switches.',
    directive: 'Der Gerätename wird im Global Configuration Mode gesetzt.',
    solution: {
      answer: 'hostname Sw1',
      explanation: 'Mit "hostname Sw1" wechselt der Prompt sofort zu Sw1(config)#. Der Name hilft, das Gerät in der Konfiguration und in der Netzwerkübersicht zu erkennen.',
    },
  }),
  enable_secret: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.enable_secret',
    nudge: 'Privilegierter Zugriff muss abgesichert werden.',
    focus: 'Überlege, wie Cisco den EXEC-Modus mit einem Secret schützt.',
    directive: 'Setze im Global Configuration Mode ein enable secret.',
    solution: {
      answer: 'enable secret <geheim>',
      explanation: '"enable secret" legt das Passwort für den privilegierten EXEC-Modus sicher ab. Es verhindert, dass Unbefugte Konfigurationen einsehen oder ändern.',
    },
  }),
  local_user: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.local_user',
    nudge: 'Für lokale Anmeldungen benötigt das Gerät einen Benutzer.',
    focus: 'Lege den Benutzer admin mit einem Secret an.',
    directive: 'Verwende im Global Configuration Mode "username ... secret".',
    solution: {
      answer: 'username admin secret <passwort>',
      explanation: 'Lokale Benutzer werden mit "username NAME secret PASSWORT" angelegt. Das ist später für "login local" oder SSH wichtig.',
    },
  }),
  no_dns_lookup: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.disable_dns_lookup',
    nudge: 'Ungewollte DNS-Anfragen können CLI-Fehleingaben langsam machen.',
    focus: 'Schalte DNS-Lookups ab.',
    directive: 'Verwende "no ip domain-lookup" im Global Configuration Mode.',
    solution: {
      answer: 'no ip domain-lookup',
      explanation: '"no ip domain-lookup" verhindert, dass Cisco eingegebene ungültige Befehle als Hostnamen auflöst. Das spart Zeit und Verwirrung.',
    },
  }),
  save_config: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.save_config',
    nudge: 'Die aktuelle Konfiguration geht bei einem Neustart verloren, wenn du nicht speicherst.',
    focus: 'Kopiere die Running-Config in die Startup-Config.',
    directive: 'Verwende den passenden copy- oder write-Befehl im Privileged EXEC Mode.',
    solution: {
      answer: 'copy running-config startup-config',
      explanation: '"copy running-config startup-config" (oder "write memory") kopiert die aktuelle Konfiguration in den NVRAM. Sie übersteht damit Stromausfälle und Neustarts.',
    },
  }),
};

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
    hintState: createHintState(Object.values(HINT_LADDERS)),
    hintsConsumed: [],
    solutionRevealedFor: [],
    completed: false,
    attempts: 0,
  };
  localStorage.setItem(ACTIVE_MISSION_KEY, JSON.stringify({
    missionId: MISSION_001_ID,
    scenario,
    device,
    startedAt: state.startedAt,
    completed: false,
  }));
  registerMission({ instanceId: String(scenario.seed), questId: MISSION_001_ID, source: 'tutorial', title: scenario.title });
  updateMissionStatus(String(scenario.seed), MissionStatus.IN_PROGRESS);
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
      showCommandsUsed: saved.showCommandsUsed || [],
      hintState: createHintState(Object.values(HINT_LADDERS)),
      hintsConsumed: saved.hintsConsumed || [],
      solutionRevealedFor: saved.solutionRevealedFor || [],
      completed: saved.completed || false,
      attempts: saved.attempts || 0,
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
    showCommandsUsed: state.showCommandsUsed,
    hintsConsumed: state.hintsConsumed,
    solutionRevealedFor: state.solutionRevealedFor,
    completed: state.completed,
    attempts: state.attempts,
  }));
}

export function clearActiveMission() {
  localStorage.removeItem(ACTIVE_MISSION_KEY);
}

export function executeMissionCommand(state, input) {
  const result = executeCommand(state.device, input, { helpCompact: true });

  if (result.isHelp) {
    return { ...result, state };
  }

  state.lastCommandAt = Date.now();

  if (result.success) {
    const cmd = result.command?.toLowerCase() || '';
    const isVerify = ['show running-config', 'show startup-config', 'show version'].includes(cmd)
      || cmd.startsWith('show ');
    if (isVerify) {
      state.showCommandsUsed.push(cmd);
      recordSkillEvent('cisco', 'basic_configuration', 'verify_running_config', {
        dimension: SKILL_DIMENSION.VERIFY,
        correct: true,
        source: SKILL_SOURCE.MAIN_MISSION,
        missionId: state.missionId,
      });
    } else {
      const node = result.node;
      if (node?.skill) {
        recordSkillEvent(node.skill.domainId, node.skill.skillId, node.skill.subskillId, {
          dimension: node.skill.dimension || SKILL_DIMENSION.CONFIGURE,
          correct: true,
          source: SKILL_SOURCE.MAIN_MISSION,
          missionId: state.missionId,
        });
      }
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

export function getMissionHint(state, requirementId) {
  const ladder = HINT_LADDERS[requirementId];
  if (!ladder) return null;
  const next = getNextHint(state.hintState, ladder.subskillPath);
  if (!next) return null;
  return {
    level: next.level,
    label: HINT_LEVEL_LABELS[next.level],
    text: next.text,
    explanation: next.explanation,
    requirementId,
  };
}

export function consumeMissionHint(state, requirementId) {
  const ladder = HINT_LADDERS[requirementId];
  if (!ladder) return state;
  const parts = ladder.subskillPath.split('.');
  const domainId = parts[0];
  const skillId = parts[1];
  const subskillId = parts.slice(2).join('.');
  state.hintState = consumeHint(state.hintState, ladder.subskillPath, domainId, skillId, subskillId);
  state.hintsConsumed.push({ requirementId, level: state.hintState.ladders[ladder.subskillPath].currentLevel, at: Date.now() });
  saveActiveMission(state);
  return state;
}

export function revealMissionSolution(state, requirementId, context = {}) {
  const ladder = HINT_LADDERS[requirementId];
  if (!ladder) return { state };
  const parts = ladder.subskillPath.split('.');
  const domainId = parts[0];
  const skillId = parts[1];
  const subskillId = parts.slice(2).join('.');
  const step = ladder.steps.find((s) => s.level === 4);
  const answer = context.answer || step?.text || '';
  const explanation = context.explanation || step?.explanation || '';
  const verificationCommand = context.verificationCommand || '';
  state.hintState = revealSolution(state.hintState, ladder.subskillPath, domainId, skillId, subskillId, { answer, explanation, verificationCommand });
  state.solutionRevealedFor.push({ requirementId, answer, at: Date.now() });
  saveActiveMission(state);
  return { state, answer, explanation };
}

export function evaluateMission001(state) {
  const evaluation = evaluateMission001State(state.device, state.scenario);
  state.attempts += 1;

  if (evaluation.allCorrect) {
    state.completed = true;
    updateMissionStatus(String(state.scenario.seed), MissionStatus.COMPLETED);
  }

  saveActiveMission(state);
  return { ...evaluation, state };
}

export function mission001Feedback(state, evaluation) {
  const progress = getMission001Progress(state.device, state.scenario);
  const feedback = {
    title: state.completed ? 'Auftrag abgeschlossen' : 'Auftrag noch nicht vollständig',
    completed: progress.completed,
    total: progress.total,
    checks: progress.checks,
    hintsUsed: state.hintsConsumed.length,
    solutionRevealed: state.solutionRevealedFor.length,
    showCommandsUsed: state.showCommandsUsed.length,
    mistakes: evaluation.misconceptions,
  };
  return feedback;
}
