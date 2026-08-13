// Cisco side missions for Mission System V2.
// Three short terminal-based side missions that reuse the Cisco CLI engine.

import { createCiscoDevice, executeCommand, renderRunningConfig } from './ciscoCliEngine.js';
import { recordSkillEvent, SKILL_DIMENSION, SKILL_SOURCE } from './skillTree.js';
import { HINT_LEVEL_LABELS, createHintState, getNextHint, consumeHint, revealSolution, defineHintLadder } from './missionHintSystem.js';
import { registerMission, updateMissionStatus, MissionStatus } from './missionLog.js';
import { getKnownCredentials, formatCredentialTemplate } from './credentials.js';

export const SIDE_MISSION_001_ID = 'cisco-side-basic-001';
export const SIDE_MISSION_002_ID = 'cisco-side-basic-002';
export const SIDE_MISSION_003_ID = 'cisco-side-basic-003';

export const CISCO_SIDE_MISSIONS = [SIDE_MISSION_001_ID, SIDE_MISSION_002_ID, SIDE_MISSION_003_ID];

function generateSecret(rng) {
  const words = ['nexus', 'switch', 'cisco', 'admin', 'netlab'];
  const suffixes = ['101', '202', '303', '404', '505'];
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  return `${pick(words)}${pick(suffixes)}${Math.floor(rng() * 9) + 1}`;
}

function seededRng(seed) {
  let s = seed;
  return function rand() {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return s / 2 ** 32;
  };
}

// ============================================================================
// Side 001: Die offene Konsole
// ============================================================================

export function generateSideMission001(seed = Date.now()) {
  const rng = seededRng(seed);
  const password = generateSecret(rng);
  return {
    missionId: SIDE_MISSION_001_ID,
    title: 'Die offene Konsole',
    seed,
    deviceType: 'layer2_switch',
    initialHostname: 'Sw1',
    parameters: {
      password,
      targetExecTimeout: { minutes: 2, seconds: 0 },
    },
    briefing: `Nach der Hauptmission meldet sich Sam:

„Der Switch steht noch im Technikraum. Mir ist aufgefallen, dass aktuell jeder, der sich direkt an die Konsole setzt, sofort Zugriff bekommt.“

„Sichere den lokalen Konsolenzugang ab. Für dieses Gerät reicht zunächst ein separates Konsolenpasswort. Außerdem soll eine unbenutzte Sitzung nach zwei Minuten beendet werden.“

Aufgabe:
1. Wechsle in die Konsolen-Line.
2. Setze ein Konsolenpasswort.
3. Aktiviere die Konsolen-Authentifizierung.
4. Setze exec-timeout auf 2 Minuten 0 Sekunden.
5. Speichere die Konfiguration dauerhaft.`,
  };
}

// Exported for the mission runner UI.
export const SIDE_001_REQUIREMENTS = [
  { id: 'console_configured', label: 'Konsolenzugang konfiguriert', skill: 'cisco.basic_configuration.console_security' },
  { id: 'auth_enabled', label: 'Authentifizierung aktiviert', skill: 'cisco.basic_configuration.login' },
  { id: 'timeout_configured', label: 'Timeout konfiguriert', skill: 'cisco.basic_configuration.exec_timeout' },
  { id: 'config_saved', label: 'Dauerhaft gespeichert', skill: 'cisco.basic_configuration.save_config' },
];

const HINT_LADDERS_001 = {
  console_configured: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.console_security',
    nudge: 'Der physische Konsolenzugang wird über eine bestimmte Line konfiguriert.',
    focus: 'Mit "line console 0" wechselst du in die richtige Konfigurationsebene.',
    directive: 'Setze mit "password" das Konsolenpasswort und aktiviere es.',
    solution: {
      answer: 'line console 0\npassword <passwort>\nlogin\nexit\nend\ncopy running-config startup-config',
      explanation: 'Die Console-Line ist "line console 0". Dort wird das Passwort gesetzt und mit "login" aktiviert.',
    },
  }),
  auth_enabled: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.login',
    nudge: 'Ein Passwort allein prüft niemanden, solange es nicht abgefragt wird.',
    focus: 'Der Befehl "login" aktiviert das Line-Passwort beim Zugang.',
    directive: 'Konfiguriere "login" in der Console-Line.',
    solution: {
      answer: 'login',
      explanation: '"login" in der Line weist Cisco an, das konfigurierte Line-Passwort abzufragen.',
    },
  }),
  timeout_configured: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.exec_timeout',
    nudge: 'Inaktive Konsolensitzungen sollen automatisch beendet werden.',
    focus: 'Der Befehl "exec-timeout" erwartet Minuten und Sekunden.',
    directive: 'Verwende "exec-timeout 2 0" in der Console-Line.',
    solution: {
      answer: 'exec-timeout 2 0',
      explanation: '"exec-timeout 2 0" beendet eine inaktive Sitzung nach 2 Minuten und 0 Sekunden.',
    },
  }),
  config_saved: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.save_config',
    nudge: 'Ohne Speichern geht die Konfiguration beim Ausschalten verloren.',
    focus: 'Kopiere die Running-Config in die Startup-Config.',
    directive: 'Verwende "copy running-config startup-config" oder "write memory".',
    solution: {
      answer: 'copy running-config startup-config',
      explanation: '"copy running-config startup-config" speichert die aktuelle Konfiguration dauerhaft.',
    },
  }),
};

function createSide001Device(scenario) {
  const device = createCiscoDevice({ type: 'layer2_switch', hostname: scenario.initialHostname });
  device.runningConfig.hostname = scenario.initialHostname;
  device.runningConfig.lines.console = {
    password: null,
    login: false,
    loginLocal: false,
    execTimeout: { minutes: 10, seconds: 0 },
  };
  return device;
}

export function getSide001Progress(device, scenario) {
  const line = device.runningConfig.lines.console;
  const saved = device.startupConfig;
  const checks = {
    console_configured: !!line.password,
    auth_enabled: line.login && !line.loginLocal,
    timeout_configured: line.execTimeout
      && line.execTimeout.minutes === scenario.parameters.targetExecTimeout.minutes
      && line.execTimeout.seconds === scenario.parameters.targetExecTimeout.seconds,
    config_saved: saved !== null
      && saved.lines.console.password === line.password
      && saved.lines.console.login === line.login
      && saved.lines.console.execTimeout.minutes === line.execTimeout.minutes
      && saved.lines.console.execTimeout.seconds === line.execTimeout.seconds,
  };
  const completed = SIDE_001_REQUIREMENTS.filter((r) => checks[r.id]).length;
  return {
    completed,
    total: SIDE_001_REQUIREMENTS.length,
    checks: SIDE_001_REQUIREMENTS.map((r) => ({ ...r, ok: checks[r.id] })),
    allCorrect: completed === SIDE_001_REQUIREMENTS.length,
  };
}

// ============================================================================
// Side 002: Passwörter auf dem Präsentierteller
// ============================================================================

export function generateSideMission002(seed = Date.now()) {
  const rng = seededRng(seed);
  const consolePassword = generateSecret(rng);
  return {
    missionId: SIDE_MISSION_002_ID,
    title: 'Passwörter auf dem Präsentierteller',
    seed,
    deviceType: 'layer2_switch',
    initialHostname: 'Sw1',
    parameters: {
      consolePassword,
    },
    briefing: `Sam:

„Ich habe gerade die Konfiguration eines Testgeräts geprüft. Schau dir mal an, wie dort Zugangsdaten gespeichert werden.“

Aufgabe:
1. Prüfe die aktuelle Konfiguration mit "show running-config".
2. Du wirst sehen, dass das Konsolenpasswort im Klartext gespeichert ist.
3. Aktiviere "service password-encryption".
4. Verifiziere das Ergebnis erneut mit "do show running-config" oder "show running-config".
5. Speichere die Konfiguration dauerhaft.`,
  };
}

export const SIDE_002_REQUIREMENTS = [
  { id: 'problem_fixed', label: 'Sicherheitsproblem behoben', skill: 'cisco.basic_configuration.service_password_encryption' },
  { id: 'config_saved', label: 'Konfiguration dauerhaft gespeichert', skill: 'cisco.basic_configuration.save_config' },
];

const HINT_LADDERS_002 = {
  problem_fixed: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.service_password_encryption',
    nudge: 'Im Auszug der Konfiguration ist das Passwort als Klartext sichtbar.',
    focus: 'Cisco bietet einen globalen Befehl, der bestimmte Passwörter in der Konfiguration verschleiert.',
    directive: 'Aktiviere "service password-encryption" und verifiziere mit "do show running-config".',
    solution: {
      answer: 'service password-encryption\ndo show running-config',
      explanation: '"service password-encryption" verhindert die direkte Klartextanzeige bestimmter Passwörter in der Konfiguration. Es handelt sich jedoch nicht um starke moderne Verschlüsselung.',
    },
  }),
  config_saved: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.save_config',
    nudge: 'Auch die Verschleierung sollte dauerhaft gespeichert werden.',
    focus: 'Kopiere die Running-Config in die Startup-Config.',
    directive: 'Verwende "copy running-config startup-config" oder "write memory".',
    solution: {
      answer: 'copy running-config startup-config',
      explanation: 'Speichern kopiert die aktuelle Running-Config in die Startup-Config.',
    },
  }),
};

function createSide002Device(scenario) {
  const device = createCiscoDevice({ type: 'layer2_switch', hostname: scenario.initialHostname });
  device.runningConfig.hostname = scenario.initialHostname;
  device.runningConfig.lines.console = {
    password: scenario.parameters.consolePassword,
    login: true,
    loginLocal: false,
    execTimeout: { minutes: 10, seconds: 0 },
  };
  device.cli.mode = 'PRIVILEGED_EXEC';
  return device;
}

export function getSide002Progress(device, scenario) {
  const saved = device.startupConfig;
  const plainPassword = scenario.parameters.consolePassword;
  const cfg = device.runningConfig;
  const checks = {
    problem_fixed: cfg.servicePasswordEncryption
      && !renderRunningConfigContains(device, `password ${plainPassword}`),
    config_saved: saved !== null && saved.servicePasswordEncryption,
  };
  const completed = SIDE_002_REQUIREMENTS.filter((r) => checks[r.id]).length;
  return {
    completed,
    total: SIDE_002_REQUIREMENTS.length,
    checks: SIDE_002_REQUIREMENTS.map((r) => ({ ...r, ok: checks[r.id] })),
    allCorrect: completed === SIDE_002_REQUIREMENTS.length,
  };
}

function renderRunningConfigContains(device, needle) {
  return renderRunningConfig(device).includes(needle);
}

// ============================================================================
// Side 003: Wer darf sich anmelden?
// ============================================================================

export function generateSideMission003(seed = Date.now()) {
  const rng = seededRng(seed);
  const known = getKnownCredentials();
  const fallbackUsername = ['admin', 'root', 'manager', 'netadmin'][Math.floor(rng() * 4)];
  const username = known.localAdminUsername || fallbackUsername;
  const userSecret = known.localAdminPassword || generateSecret(rng);
  const consolePassword = generateSecret(rng);
  return {
    missionId: SIDE_MISSION_003_ID,
    title: 'Wer darf sich anmelden?',
    seed,
    deviceType: 'layer2_switch',
    initialHostname: 'Sw1',
    parameters: {
      username,
      userSecret,
      consolePassword,
      usesKnownCredentials: known.localAdminUsername != null,
    },
    briefing: formatCredentialTemplate(`Sam:

„Auf dem Gerät existiert bereits ein lokaler Admin-Benutzer ([username]). Trotzdem wird beim Konsolenzugang nur das gemeinsame Konsolenpasswort verwendet.“

„Ich möchte, dass sich Mitarbeiter dort mit ihrem lokalen Benutzerkonto anmelden.“

Aufgabe:
1. Untersuche die aktuelle Konfiguration.
2. Erkenne, dass die Console-Line noch "login" und nicht "login local" verwendet.
3. Ändere die Authentifizierung auf "login local".
4. Speichere die Konfiguration dauerhaft.`),
  };
}

export const SIDE_003_REQUIREMENTS = [
  { id: 'auth_fixed', label: 'Authentifizierungsproblem behoben', skill: 'cisco.basic_configuration.login_local' },
  { id: 'config_saved', label: 'Dauerhaft gespeichert', skill: 'cisco.basic_configuration.save_config' },
];

const HINT_LADDERS_003 = {
  auth_fixed: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.login_local',
    nudge: 'Schau dir an, welche Benutzer bereits auf dem Gerät existieren und wie die Console-Line ihre Anmeldung prüft.',
    focus: 'Vergleiche "login" und "login local".',
    directive: 'Wechsle zu "line console 0" und ändere die Authentifizierung auf die lokale Benutzerdatenbank.',
    solution: {
      answer: 'line console 0\nlogin local\nend\ncopy running-config startup-config',
      explanation: '"login local" in der Line verwendet die lokalen Benutzer (z. B. "username ... secret") anstelle des Line-Passworts.',
    },
  }),
  config_saved: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.save_config',
    nudge: 'Auch die geänderte Authentifizierung sollte dauerhaft gespeichert werden.',
    focus: 'Kopiere die Running-Config in die Startup-Config.',
    directive: 'Verwende "copy running-config startup-config" oder "write memory".',
    solution: {
      answer: 'copy running-config startup-config',
      explanation: 'Speichern kopiert die aktuelle Running-Config in die Startup-Config.',
    },
  }),
};

function createSide003Device(scenario) {
  const device = createCiscoDevice({ type: 'layer2_switch', hostname: scenario.initialHostname });
  device.runningConfig.hostname = scenario.initialHostname;
  device.runningConfig.users = {
    [scenario.parameters.username]: { secret: scenario.parameters.userSecret },
  };
  device.runningConfig.lines.console = {
    password: scenario.parameters.consolePassword,
    login: true,
    loginLocal: false,
    execTimeout: { minutes: 10, seconds: 0 },
  };
  device.cli.mode = 'PRIVILEGED_EXEC';
  return device;
}

export function getSide003Progress(device) {
  const line = device.runningConfig.lines.console;
  const saved = device.startupConfig;
  const checks = {
    auth_fixed: !line.login && line.loginLocal,
    config_saved: saved !== null && !saved.lines.console.login && saved.lines.console.loginLocal,
  };
  const completed = SIDE_003_REQUIREMENTS.filter((r) => checks[r.id]).length;
  return {
    completed,
    total: SIDE_003_REQUIREMENTS.length,
    checks: SIDE_003_REQUIREMENTS.map((r) => ({ ...r, ok: checks[r.id] })),
    allCorrect: completed === SIDE_003_REQUIREMENTS.length,
  };
}

// ============================================================================
// Common runtime
// ============================================================================

const SCENARIO_GENERATORS = {
  [SIDE_MISSION_001_ID]: generateSideMission001,
  [SIDE_MISSION_002_ID]: generateSideMission002,
  [SIDE_MISSION_003_ID]: generateSideMission003,
};

const DEVICE_CREATORS = {
  [SIDE_MISSION_001_ID]: createSide001Device,
  [SIDE_MISSION_002_ID]: createSide002Device,
  [SIDE_MISSION_003_ID]: createSide003Device,
};

export { createSide001Device, createSide002Device, createSide003Device };

const PROGRESS_GETTERS = {
  [SIDE_MISSION_001_ID]: getSide001Progress,
  [SIDE_MISSION_002_ID]: getSide002Progress,
  [SIDE_MISSION_003_ID]: getSide003Progress,
};

const HINT_LADDERS_BY_MISSION = {
  [SIDE_MISSION_001_ID]: HINT_LADDERS_001,
  [SIDE_MISSION_002_ID]: HINT_LADDERS_002,
  [SIDE_MISSION_003_ID]: HINT_LADDERS_003,
};

const ACTIVE_SIDE_KEY = 'cyberlearn:active-side-mission-v1';

function getHINT_LADDERS(missionId) {
  return HINT_LADDERS_BY_MISSION[missionId] || {};
}

export function isCiscoSideMission(missionId) {
  return CISCO_SIDE_MISSIONS.includes(missionId);
}

export function startCiscoSideMission(missionId) {
  const scenario = SCENARIO_GENERATORS[missionId]();
  const device = DEVICE_CREATORS[missionId](scenario);
  const state = {
    missionId,
    scenario,
    device,
    startedAt: Date.now(),
    lastCommandAt: null,
    showCommandsUsed: [],
    hintState: createHintState(Object.values(getHINT_LADDERS(missionId))),
    hintsConsumed: [],
    solutionRevealedFor: [],
    completed: false,
    attempts: 0,
  };
  localStorage.setItem(ACTIVE_SIDE_KEY, JSON.stringify({
    missionId,
    scenario,
    device,
    startedAt: state.startedAt,
    completed: false,
  }));
  registerMission({ instanceId: `${missionId}-${scenario.seed}`, questId: missionId, source: 'side', title: scenario.title });
  updateMissionStatus(`${missionId}-${scenario.seed}`, MissionStatus.IN_PROGRESS);
  return state;
}

export function loadActiveCiscoSideMission() {
  try {
    const raw = localStorage.getItem(ACTIVE_SIDE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!isCiscoSideMission(saved.missionId)) return null;
    return {
      missionId: saved.missionId,
      scenario: saved.scenario,
      device: saved.device,
      startedAt: saved.startedAt,
      lastCommandAt: null,
      showCommandsUsed: saved.showCommandsUsed || [],
      hintState: createHintState(Object.values(getHINT_LADDERS(saved.missionId))),
      hintsConsumed: saved.hintsConsumed || [],
      solutionRevealedFor: saved.solutionRevealedFor || [],
      completed: saved.completed || false,
      attempts: saved.attempts || 0,
    };
  } catch {
    return null;
  }
}

export function saveActiveCiscoSideMission(state) {
  localStorage.setItem(ACTIVE_SIDE_KEY, JSON.stringify({
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

export function clearActiveCiscoSideMission() {
  localStorage.removeItem(ACTIVE_SIDE_KEY);
}

export function executeCiscoSideMissionCommand(state, input) {
  const result = executeCommand(state.device, input, { helpCompact: true });

  if (result.isHelp) {
    return { ...result, state };
  }

  state.lastCommandAt = Date.now();

  if (result.success) {
    const cmd = result.command?.toLowerCase() || '';
    const isVerify = ['show running-config', 'show startup-config', 'show version'].includes(cmd)
      || cmd.startsWith('show ')
      || cmd.startsWith('do show ');
    if (isVerify) {
      state.showCommandsUsed.push(cmd);
      recordSkillEvent('cisco', 'basic_configuration', 'verify_running_config', {
        dimension: SKILL_DIMENSION.VERIFY,
        correct: true,
        source: SKILL_SOURCE.MAIN_MISSION,
        missionId: state.missionId,
      });
    } else if (result.node?.skill) {
      recordSkillEvent(result.node.skill.domainId, result.node.skill.skillId, result.node.skill.subskillId, {
        dimension: result.node.skill.dimension || SKILL_DIMENSION.CONFIGURE,
        correct: true,
        source: SKILL_SOURCE.MAIN_MISSION,
        missionId: state.missionId,
      });
    }
  }

  if (result.errorType) {
    recordSkillEvent('cisco', 'basic_configuration', 'cli_navigation', {
      dimension: SKILL_DIMENSION.CONFIGURE,
      correct: false,
      cliError: result.errorType,
      source: SKILL_SOURCE.MAIN_MISSION,
      missionId: state.missionId,
    });
  }

  saveActiveCiscoSideMission(state);
  return { ...result, state };
}

export function getCiscoSideMissionProgress(state) {
  const getter = PROGRESS_GETTERS[state.missionId];
  return getter(state.device, state.scenario);
}

export function getCiscoSideMissionHint(state, requirementId) {
  const ladder = getHINT_LADDERS(state.missionId)[requirementId];
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

export function consumeCiscoSideMissionHint(state, requirementId) {
  const ladder = getHINT_LADDERS(state.missionId)[requirementId];
  if (!ladder) return state;
  const parts = ladder.subskillPath.split('.');
  const domainId = parts[0];
  const skillId = parts[1];
  const subskillId = parts.slice(2).join('.');
  state.hintState = consumeHint(state.hintState, ladder.subskillPath, domainId, skillId, subskillId);
  state.hintsConsumed.push({ requirementId, level: state.hintState.ladders[ladder.subskillPath].currentLevel, at: Date.now() });
  saveActiveCiscoSideMission(state);
  return state;
}

export function revealCiscoSideMissionSolution(state, requirementId, context = {}) {
  const ladder = getHINT_LADDERS(state.missionId)[requirementId];
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
  saveActiveCiscoSideMission(state);
  return { state, answer, explanation };
}

export function evaluateCiscoSideMission(state) {
  const getter = PROGRESS_GETTERS[state.missionId];
  const evaluation = getter(state.device, state.scenario);
  state.attempts += 1;
  if (evaluation.allCorrect) {
    state.completed = true;
    updateMissionStatus(`${state.missionId}-${state.scenario.seed}`, MissionStatus.COMPLETED);
  }
  saveActiveCiscoSideMission(state);
  return { ...evaluation, state };
}

export function ciscoSideMissionFeedback(state) {
  const getter = PROGRESS_GETTERS[state.missionId];
  const progress = getter(state.device, state.scenario);
  const endings = {
    [SIDE_MISSION_001_ID]: 'Gut. Der Konsolenzugang ist jetzt abgesichert. line console 0, password, login und exec-timeout ergeben zusammen eine brauchbare Basis.',
    [SIDE_MISSION_002_ID]: 'service password-encryption verhindert die direkte Klartextanzeige bestimmter Passwörter in der Konfiguration. Es ist jedoch kein starker kryptografischer Schutz vergleichbar mit modernen Secret-Verfahren.',
    [SIDE_MISSION_003_ID]: 'login local verwendet die lokale Benutzerdatenbank statt des gemeinsamen Line-Passworts. Prüfe in Zukunft immer, ob sich ein passender Benutzer auf dem Gerät befindet.',
  };
  const endingText = endings[state.missionId] || '';
  return {
    title: state.completed ? 'Auftrag abgeschlossen' : 'Auftrag noch nicht vollständig',
    completed: progress.completed,
    total: progress.total,
    checks: progress.checks,
    hintsUsed: state.hintsConsumed.length,
    solutionRevealed: state.solutionRevealedFor.length,
    showCommandsUsed: state.showCommandsUsed.length,
    endingText,
  };
}
