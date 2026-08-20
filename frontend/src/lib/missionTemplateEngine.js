// Procedural Mission System V1 - Template Engine (Phase 1H)
//
// A MissionTemplate is a data-driven blueprint: it describes which skills it
// trains, which archetypes/contexts/channels it supports, how to generate a
// technically valid initial device state for a given archetype/fault, and
// how to evaluate success. It NEVER implements its own command parsing -
// the Cisco Command Tree in ciscoCliEngine.js remains the single source of
// truth for `?`, Tab, prefixes and command execution (item 16).
//
// This module is intentionally domain-agnostic at the top (MISSION_ARCHETYPE,
// defineMissionTemplate, parameter/constraint helpers). Only the concrete
// template definitions at the bottom are Cisco-specific; a future
// LinuxMissionValidator/templates would live in a sibling file and reuse the
// same `defineMissionTemplate` contract.

import { createCiscoDevice, evaluateRouterOnAStick, createSubinterface } from './ciscoCliEngine.js';
import { defineHintLadder } from './missionHintSystem.js';
import { randomPersonalUsername, ACCOUNT_NAME_POOL } from './officeWorld.js';

// ============================================================================
// Archetypes (item 8)
// ============================================================================

export const MISSION_ARCHETYPE = {
  BUILD: 'build',
  REPAIR: 'repair',
  DIAGNOSE: 'diagnose',
  AUDIT: 'audit',
  COMPLETE: 'complete',
  VERIFY: 'verify',
  CHANGE: 'change',
  USER_REPORT: 'user_report',
  COWORKER_REQUEST: 'coworker_request',
  INCIDENT: 'incident',
  // Proactive security hardening of an already-working configuration (e.g.
  // upgrading a functional-but-weak RSA key size). Distinct from AUDIT
  // (check + fix gaps) and REPAIR (something is actively broken).
  HARDEN: 'harden',
};

export const REQUIREMENT_TYPE = {
  STATE: 'state',
  ACTION: 'action',
  VERIFICATION: 'verification',
  PERSISTENCE: 'persistence',
};

// Delivery channels a template may use (item 21). The generator picks one
// of a template's `allowedChannels` based on the chosen archetype - it is
// never randomized independently of the story fit.
export const MISSION_CHANNEL = {
  EMAIL: 'email',
  TICKET: 'ticket',
  PHONE: 'phone',
  NPC: 'npc',
};

// Archetypes that are inherently "something is broken / urgent" map to
// phone; planned work maps to email; NPC is reserved for story-heavy
// introductions (procedural missions never use NPC dialogs - those stay
// hand-built - but the constant exists for future domains).
export const ARCHETYPE_CHANNEL_AFFINITY = {
  [MISSION_ARCHETYPE.BUILD]: [MISSION_CHANNEL.EMAIL],
  [MISSION_ARCHETYPE.REPAIR]: [MISSION_CHANNEL.PHONE, MISSION_CHANNEL.EMAIL],
  [MISSION_ARCHETYPE.DIAGNOSE]: [MISSION_CHANNEL.PHONE, MISSION_CHANNEL.EMAIL],
  [MISSION_ARCHETYPE.AUDIT]: [MISSION_CHANNEL.EMAIL],
  [MISSION_ARCHETYPE.COMPLETE]: [MISSION_CHANNEL.EMAIL],
  [MISSION_ARCHETYPE.VERIFY]: [MISSION_CHANNEL.EMAIL],
  [MISSION_ARCHETYPE.CHANGE]: [MISSION_CHANNEL.EMAIL],
  [MISSION_ARCHETYPE.USER_REPORT]: [MISSION_CHANNEL.PHONE, MISSION_CHANNEL.EMAIL],
  [MISSION_ARCHETYPE.COWORKER_REQUEST]: [MISSION_CHANNEL.EMAIL],
  [MISSION_ARCHETYPE.INCIDENT]: [MISSION_CHANNEL.PHONE, MISSION_CHANNEL.EMAIL],
  [MISSION_ARCHETYPE.HARDEN]: [MISSION_CHANNEL.EMAIL],
};

// ============================================================================
// Difficulty profiles (item 31)
// ============================================================================

export const DIFFICULTY_PROFILE = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const DIFFICULTY_ORDER = [DIFFICULTY_PROFILE.EASY, DIFFICULTY_PROFILE.MEDIUM, DIFFICULTY_PROFILE.HARD];

export function easierDifficulty(profile) {
  const i = DIFFICULTY_ORDER.indexOf(profile);
  return DIFFICULTY_ORDER[Math.max(0, i - 1)];
}

export function harderDifficulty(profile) {
  const i = DIFFICULTY_ORDER.indexOf(profile);
  return DIFFICULTY_ORDER[Math.min(DIFFICULTY_ORDER.length - 1, i + 1)];
}

// ============================================================================
// Seeded RNG helper (same small LCG used by missionV2.js / ciscoSideMissions.js)
// ============================================================================

export function seededRng(seed) {
  let s = seed;
  return function rand(min, max) {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return Math.floor((s / 2 ** 32) * (max - min + 1)) + min;
  };
}

export function pickFrom(rng, array) {
  return array[rng(0, array.length - 1)];
}

// ============================================================================
// MissionTemplate contract (item 9)
// ============================================================================

// eslint-disable-next-line max-params
export function defineMissionTemplate(def) {
  return {
    id: def.id,
    domain: def.domain,
    requiredSkills: def.requiredSkills || [],
    unlockedBy: def.unlockedBy || [],
    archetypes: def.archetypes || [MISSION_ARCHETYPE.BUILD],
    contexts: def.contexts || ['generic'],
    allowedChannels: def.allowedChannels || [MISSION_CHANNEL.EMAIL],
    parameterDefinitions: def.parameterDefinitions || {},
    faultDefinitions: def.faultDefinitions || {},
    difficultyProfiles: def.difficultyProfiles || DIFFICULTY_ORDER,
    hintDefinitions: def.hintDefinitions || {},
    validationRules: def.validationRules || [],
    requiredResolvedParams: def.requiredResolvedParams || [],
    antiRepetitionMetadata: def.antiRepetitionMetadata || (() => ({})),
    // Behaviour, supplied by the concrete template:
    resolveParameters: def.resolveParameters, // (rng, archetype, context, difficulty) => params
    buildDevice: def.buildDevice,             // (params, archetype, faultId) => { device }
    evaluate: def.evaluate,                   // (device, params, archetype, state) => progress
    buildBriefing: def.buildBriefing,         // (params, archetype, context, difficulty) => string
    buildTitle: def.buildTitle,               // (params, archetype, context) => string
  };
}

// ============================================================================
// Cisco V1 templates - ONLY skills already taught by Main Mission 001/002
// (item 28/29). Curriculum stage: "1. Grundlegende Konfiguration" and
// "2. L2-Switch / VLANs".
// ============================================================================

const BASIC_CONFIG_CONTEXTS = ['ersatzgerat', 'aussenstelle', 'wartungsfenster', 'security_audit'];
const BASIC_CONFIG_SHORT_NAMES = ['Sw1', 'Sw2', 'Sw3', 'Sw4', 'Sw5', 'Sw6'];
const BASIC_CONFIG_LOCATIONS = ['HQ', 'AST', 'BH', 'HR', 'LAG', 'IT', 'VERT'];
const BASIC_CONFIG_LOCATION_BY_CONTEXT = {
  ersatzgerat: 'HQ',
  aussenstelle: 'AST',
  wartungsfenster: 'HQ',
  security_audit: 'IT',
};
const ADMIN_ACCOUNTS = ['admin', 'netadmin'];
const SECRET_WORDS = ['cisco', 'nexus', 'switch', 'netlab', 'admin'];
const SECRET_SUFFIXES = ['101', '202', '303', '404', '505'];

function generateSecret(rng) {
  return `${pickFrom(rng, SECRET_WORDS)}${pickFrom(rng, SECRET_SUFFIXES)}${rng(1, 9)}`;
}

function generateHostname(rng, context) {
  if (rng(0, 99) < 35) {
    return pickFrom(rng, BASIC_CONFIG_SHORT_NAMES);
  }
  const loc = BASIC_CONFIG_LOCATION_BY_CONTEXT[context] || pickFrom(rng, BASIC_CONFIG_LOCATIONS);
  const index = String(rng(1, 9)).padStart(2, '0');
  return `SW-${loc}-${index}`;
}

function generateUsername(rng) {
  // Standard missions use a personal employee account or a generic admin.
  // Service/role accounts are reserved for templates that explicitly explain
  // why a break-glass / service account is needed.
  const roll = rng(1, 100);
  if (roll <= 70) return { type: 'personal', name: randomPersonalUsername() };
  if (roll <= 90) return { type: 'admin', name: pickFrom(rng, ADMIN_ACCOUNTS) };
  return { type: 'admin', name: pickFrom(rng, ADMIN_ACCOUNTS) };
}

function shuffleArray(rng, arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = rng(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ============================================================================
// 1. Basic Switch Configuration Hardening (Phase 1J.1)
//
// Instead of always requiring the same five commands, the template draws a
// random subset of already-unlocked basic-configuration skills on each
// generated mission.  The subset always ends with the save-config check.
// ============================================================================

const BASIC_CONFIG_TASKS = [
  {
    id: 'hostname',
    skill: 'cisco.basic_configuration.hostname',
    label: (params) => `Hostname: ${params.targetHostname}`,
    brief: (params) => `Hostname auf ${params.targetHostname}`,
    preconfigure: (device, params) => { device.hostname = params.targetHostname; },
    evaluate: (device, params) => device.hostname === params.targetHostname,
  },
  {
    id: 'enable_secret',
    skill: 'cisco.basic_configuration.enable_secret',
    label: () => 'Enable Secret gesetzt',
    brief: () => 'Enable Secret setzen',
    evaluate: (device) => !!device.runningConfig.enableSecret,
  },
  {
    id: 'local_user',
    skill: 'cisco.basic_configuration.local_user',
    label: (params) => `Lokaler Benutzer ${params.username}`,
    brief: (params) => `Lokaler Benutzer ${params.username}`,
    preconfigure: (device, params) => { device.runningConfig.users[params.username] = { secret: params.userSecret }; },
    evaluate: (device, params) => !!(device.runningConfig.users[params.username]?.secret || device.runningConfig.users[params.username]?.password),
  },
  {
    id: 'disable_dns_lookup',
    skill: 'cisco.basic_configuration.disable_dns_lookup',
    label: () => 'DNS-Lookup deaktiviert',
    brief: () => 'DNS-Lookup deaktivieren (no ip domain-lookup)',
    preconfigure: (device) => { device.runningConfig.noIpDomainLookup = true; },
    evaluate: (device) => !!device.runningConfig.noIpDomainLookup,
  },
  {
    id: 'console_security',
    skill: 'cisco.basic_configuration.console_security',
    label: () => 'Konsolenzugang per Passwort gesichert',
    brief: () => 'Konsolen-Line mit Passwort sichern',
    preconfigure: (device, params) => { device.runningConfig.lines.console.password = params.consolePassword; },
    evaluate: (device) => !!device.runningConfig.lines.console.password || !!device.runningConfig.lines.console.secret,
  },
  {
    id: 'login',
    skill: 'cisco.basic_configuration.login',
    label: () => 'Line-Login auf Konsole aktiviert',
    brief: () => 'Line-Login auf der Konsole aktivieren (login)',
    preconfigure: (device) => { device.runningConfig.lines.console.login = true; },
    evaluate: (device) => device.runningConfig.lines.console.login || device.runningConfig.lines.console.loginLocal,
  },
  {
    id: 'login_local',
    skill: 'cisco.basic_configuration.login_local',
    label: () => 'Login local auf Konsole aktiviert',
    brief: () => 'Login local auf der Konsole aktivieren',
    preconfigure: (device) => { device.runningConfig.lines.console.loginLocal = true; device.runningConfig.lines.console.login = false; },
    evaluate: (device) => device.runningConfig.lines.console.loginLocal,
  },
  {
    id: 'exec_timeout',
    skill: 'cisco.basic_configuration.exec_timeout',
    label: (params) => `EXEC-Timeout ${params.execTimeoutMinutes}:${String(params.execTimeoutSeconds).padStart(2, '0')}`,
    brief: (params) => `EXEC-Timeout auf ${params.execTimeoutMinutes}:${String(params.execTimeoutSeconds).padStart(2, '0')}`,
    preconfigure: (device, params) => { device.runningConfig.lines.console.execTimeout = { minutes: params.execTimeoutMinutes, seconds: params.execTimeoutSeconds }; },
    evaluate: (device, params) => device.runningConfig.lines.console.execTimeout.minutes === params.execTimeoutMinutes
      && device.runningConfig.lines.console.execTimeout.seconds === params.execTimeoutSeconds,
  },
  {
    id: 'service_password_encryption',
    skill: 'cisco.basic_configuration.service_password_encryption',
    label: () => 'service password-encryption aktiviert',
    brief: () => 'service password-encryption aktivieren',
    preconfigure: (device) => { device.runningConfig.servicePasswordEncryption = true; },
    evaluate: (device) => !!device.runningConfig.servicePasswordEncryption,
  },
];

export const TEMPLATE_BASIC_CONFIG_HARDENING = defineMissionTemplate({
  id: 'cisco-basic-config-hardening',
  domain: 'cisco',
  requiredSkills: [
    ...BASIC_CONFIG_TASKS.map((t) => t.skill),
    'cisco.basic_configuration.save_config',
  ],
  unlockedBy: ['cisco-main-001'],
  archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.AUDIT],
  contexts: BASIC_CONFIG_CONTEXTS,
  allowedChannels: [MISSION_CHANNEL.EMAIL, MISSION_CHANNEL.PHONE],
  difficultyProfiles: [DIFFICULTY_PROFILE.EASY, DIFFICULTY_PROFILE.MEDIUM, DIFFICULTY_PROFILE.HARD],
  hintDefinitions: {
    'cisco.basic_configuration.hostname': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.hostname',
      nudge: 'Ein Netzwerkgerät sollte im Betrieb eindeutig identifizierbar sein.',
      focus: 'Prüfe den aktuellen Gerätenamen des Switches.',
      directive: 'Der Gerätename wird im Global Configuration Mode gesetzt.',
      solution: { answer: 'hostname <name>', explanation: '"hostname <name>" setzt den Gerätenamen sofort im Prompt.' },
    }),
    'cisco.basic_configuration.enable_secret': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.enable_secret',
      nudge: 'Privilegierter Zugriff muss abgesichert werden.',
      focus: 'Cisco schützt den EXEC-Modus mit einem Secret.',
      directive: 'Setze im Global Configuration Mode ein enable secret.',
      solution: { answer: 'enable secret <geheim>', explanation: '"enable secret" schützt den privilegierten Modus.' },
    }),
    'cisco.basic_configuration.local_user': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.local_user',
      nudge: 'Für lokale Anmeldungen wird ein Benutzer benötigt.',
      focus: 'Lege den geforderten Benutzer mit einem Secret an.',
      directive: 'Verwende "username NAME secret PASSWORT" im Global Configuration Mode.',
      solution: { answer: 'username <name> secret <passwort>', explanation: 'Lokale Benutzer werden mit "username NAME secret PASSWORT" angelegt.' },
    }),
    'cisco.basic_configuration.disable_dns_lookup': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.disable_dns_lookup',
      nudge: 'Ungültige Eingaben lösen sonst DNS-Anfragen aus.',
      focus: 'Schalte DNS-Lookups ab.',
      directive: 'Verwende "no ip domain-lookup".',
      solution: { answer: 'no ip domain-lookup', explanation: '"no ip domain-lookup" verhindert unnötige DNS-Versuche.' },
    }),
    'cisco.basic_configuration.console_security': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.console_security',
      nudge: 'Der physische Konsolenzugang muss abgesichert werden.',
      focus: 'Wechsle in die Konsolen-Line und setze ein Passwort.',
      directive: 'Verwende "line console 0" und "password PASSWORT".',
      solution: { answer: 'line console 0\npassword <passwort>', explanation: 'Das Konsolenpasswort wird in der Line-Konfiguration gesetzt.' },
    }),
    'cisco.basic_configuration.login': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.login',
      nudge: 'Ein Passwort allein prüft niemanden, solange es nicht abgefragt wird.',
      focus: 'Aktiviere die Passwortprüfung auf der Konsolen-Line.',
      directive: 'Verwende "login" in "line console 0".',
      solution: { answer: 'line console 0\nlogin', explanation: '"login" aktiviert die Prüfung des Line-Passworts beim Zugang.' },
    }),
    'cisco.basic_configuration.login_local': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.login_local',
      nudge: 'Lokale Benutzer müssen auch wirklich geprüft werden.',
      focus: 'Verwende lokale Benutzer statt eines Line-Passworts.',
      directive: 'Verwende "login local" in "line console 0".',
      solution: { answer: 'line console 0\nlogin local', explanation: '"login local" prüft gegen die lokal angelegten Benutzer.' },
    }),
    'cisco.basic_configuration.exec_timeout': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.exec_timeout',
      nudge: 'Inaktive Konsolensitzungen sollten automatisch beendet werden.',
      focus: 'Setze einen EXEC-Timeout auf der Konsolen-Line.',
      directive: 'Verwende "exec-timeout MINUTEN SEKUNDEN" in "line console 0".',
      solution: { answer: 'line console 0\nexec-timeout 2 0', explanation: '"exec-timeout" beendet inaktive Sitzungen nach der angegebenen Zeit.' },
    }),
    'cisco.basic_configuration.service_password_encryption': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.service_password_encryption',
      nudge: 'Klartextpasswörter in der Konfiguration sind ein Sicherheitsrisiko.',
      focus: 'Verschleiere bestimmte Passwörter in der Konfiguration.',
      directive: 'Aktiviere "service password-encryption" im Global Configuration Mode.',
      solution: { answer: 'service password-encryption', explanation: '"service password-encryption" verschlüsselt Passwörter in der gespeicherten Konfiguration.' },
    }),
    'cisco.basic_configuration.save_config': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.save_config',
      nudge: 'Ohne Speichern geht die Konfiguration beim Neustart verloren.',
      focus: 'Kopiere die Running-Config in die Startup-Config.',
      directive: 'Verwende "copy running-config startup-config" oder "write".',
      solution: { answer: 'copy running-config startup-config', explanation: '"copy running-config startup-config" (oder "write") sichert die Konfiguration dauerhaft.' },
    }),
  },
  requiredResolvedParams: [
    'targetHostname',
    'usernameType',
    'username',
    'enableSecret',
    'userSecret',
    'consolePassword',
    'execTimeoutMinutes',
    'execTimeoutSeconds',
    'selectedTaskIds',
  ],
  resolveParameters(rng, archetype, context) {
    const targetHostname = generateHostname(rng, context);
    const { type: usernameType, name: username } = generateUsername(rng);
    const enableSecret = generateSecret(rng);
    const userSecret = generateSecret(rng);
    const consolePassword = generateSecret(rng);
    const execTimeoutMinutes = rng(1, 5);
    const execTimeoutSeconds = rng(0, 1) === 0 ? rng(1, 59) : 0;

    // Pick a random subset of available basic-config tasks; keep one slot for
    // the mandatory save-config check.
    const count = rng(3, Math.max(3, BASIC_CONFIG_TASKS.length - 1));
    const shuffled = shuffleArray(rng, BASIC_CONFIG_TASKS);
    const selectedTasks = shuffled.slice(0, count);

    return {
      initialHostname: archetype === MISSION_ARCHETYPE.AUDIT ? targetHostname : 'Switch',
      targetHostname,
      usernameType,
      username,
      enableSecret,
      userSecret,
      consolePassword,
      execTimeoutMinutes,
      execTimeoutSeconds,
      selectedTaskIds: selectedTasks.map((t) => t.id),
      context,
    };
  },
  buildDevice(params, archetype) {
    const device = createCiscoDevice({
      type: 'layer2_switch',
      hostname: params.initialHostname,
      interfaces: ['GigabitEthernet0/1'],
    });
    if (archetype === MISSION_ARCHETYPE.AUDIT) {
      // Audit: preconfigure roughly half of the selected tasks so the audit
      // feels like a real check: some items are already compliant, the rest
      // must be found and closed.
      const selected = BASIC_CONFIG_TASKS.filter((t) => params.selectedTaskIds.includes(t.id));
      const preconfigureCount = Math.max(1, Math.floor(selected.length / 2));
      const shuffled = [...selected].sort(() => Math.random() - 0.5);
      for (let i = 0; i < preconfigureCount; i += 1) {
        const task = shuffled[i];
        if (task.preconfigure) task.preconfigure(device, params);
      }
    }
    return { device };
  },
  evaluate(device, params) {
    const selectedTasks = BASIC_CONFIG_TASKS.filter((t) => params.selectedTaskIds.includes(t.id));
    const checks = selectedTasks.map((task) => ({
      id: task.id,
      label: task.label(params),
      skill: task.skill,
      type: REQUIREMENT_TYPE.STATE,
      ok: task.evaluate(device, params),
    }));

    // The saved config must contain every currently selected task in its
    // evaluated state; otherwise the player could save an incomplete setup.
    const savedOk = device.startupConfig !== null
      && selectedTasks.every((task) => task.evaluate({ ...device, runningConfig: device.startupConfig }, params));
    checks.push({
      id: 'save_config',
      label: 'Konfiguration gespeichert',
      skill: 'cisco.basic_configuration.save_config',
      type: REQUIREMENT_TYPE.PERSISTENCE,
      ok: savedOk,
    });

    return { checks, allCorrect: checks.every((c) => c.ok) };
  },
  buildTitle(params, archetype) {
    return archetype === MISSION_ARCHETYPE.AUDIT ? `${params.targetHostname} Sicherheits-Audit` : `${params.targetHostname} einrichten`;
  },
  buildBriefing(params, archetype, context) {
    const contextText = {
      ersatzgerat: 'Ein Ersatzgerät ist eingetroffen und muss vorbereitet werden.',
      aussenstelle: 'Eine Außenstelle bekommt einen neuen Switch.',
      wartungsfenster: 'Im aktuellen Wartungsfenster soll ein weiterer Switch abgesichert werden.',
      security_audit: 'Die Security-Abteilung bittet um einen kurzen Konfigurations-Check.',
    }[context] || 'Ein weiterer Switch braucht die NEXUS-Grundabsicherung.';

    const selectedTasks = BASIC_CONFIG_TASKS.filter((t) => params.selectedTaskIds.includes(t.id));
    const taskList = selectedTasks.map((t) => `- ${t.brief(params)}`).join('\n');
    const auditPrefix = archetype === MISSION_ARCHETYPE.AUDIT
      ? 'Einige Punkte sind bereits korrekt, andere müssen noch gefunden und geschlossen werden:\n\n'
      : '';
    return `${contextText}\n\nAuftrag für ${params.targetHostname}:\n${auditPrefix}${taskList}\n- Konfiguration speichern`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return {
      skillGroup: 'basic_configuration', archetype, context, hostname: params.targetHostname, selectedTaskIds: params.selectedTaskIds,
    };
  },
});

const VLAN_CONTEXTS = ['personal', 'buchhaltung', 'lager', 'vertrieb', 'it_support'];
const VLAN_CONTEXT_NAMES = {
  personal: 'PERSONAL',
  buchhaltung: 'BUCHHALTUNG',
  lager: 'LAGER',
  vertrieb: 'VERTRIEB',
  it_support: 'ITSUPPORT',
};
const VLAN_ID_POOL = [30, 40, 50, 60, 70];
const DECOY_VLAN_ID_POOL = [15, 25, 35, 45];
const VLAN_DEVICE_HOSTNAMES = ['Sw3', 'Sw4', 'Sw5', 'Sw6'];
const EMPLOYEE_NAMES = ['Nina Berger', 'Tom Weiss', 'Julia Krause', 'Marco Feldt'];

// Stage 2/3 shared pools
const STAGE2_VLAN_ID_POOL = [110, 120, 130, 140, 150, 160, 170, 180, 190, 200];
const STAGE2_DEPARTMENT_NAMES = ['PERSONAL', 'TECHNIK', 'VERWALTUNG', 'LAGER', 'MARKETING', 'FINANZEN', 'ENTWICKLUNG', 'HR'];
const STAGE2_DEVICE_HOSTNAMES = ['Sw-HQ-03', 'Sw-HQ-04', 'Sw-AST-02', 'Sw-LAB-01'];
const STAGE3_ROUTER_HOSTNAMES = ['R-HQ-01', 'R-HQ-02', 'R-AST-01', 'R-LAB-01'];

export const TEMPLATE_VLAN_ACCESS_PORT = defineMissionTemplate({
  id: 'cisco-vlan-access-port',
  domain: 'cisco',
  requiredSkills: [
    'cisco.switching.vlan.create',
    'cisco.switching.vlan.name',
    'cisco.switching.access_port.configure',
    'cisco.switching.access_port.assign_vlan',
    'cisco.switching.access_port.verify',
  ],
  unlockedBy: ['cisco-main-002'],
  archetypes: [
    MISSION_ARCHETYPE.BUILD,
    MISSION_ARCHETYPE.REPAIR,
    MISSION_ARCHETYPE.AUDIT,
    MISSION_ARCHETYPE.DIAGNOSE,
    MISSION_ARCHETYPE.COMPLETE,
  ],
  contexts: VLAN_CONTEXTS,
  allowedChannels: [MISSION_CHANNEL.EMAIL, MISSION_CHANNEL.PHONE],
  difficultyProfiles: [DIFFICULTY_PROFILE.EASY, DIFFICULTY_PROFILE.MEDIUM, DIFFICULTY_PROFILE.HARD],
  hintDefinitions: {
    'cisco.switching.vlan.create': defineHintLadder({
      subskillPath: 'cisco.switching.vlan.create',
      nudge: 'Bevor ein Port einem VLAN zugeordnet werden kann, muss das VLAN existieren.',
      focus: 'Wechsle in den VLAN-Konfigurationsmodus und vergib einen Namen.',
      directive: 'Verwende "vlan <id>" gefolgt von "name <name>".',
      solution: { answer: 'vlan <id>\nname <name>\nexit', explanation: '"vlan <id>" legt das VLAN an, "name <name>" vergibt die Bezeichnung.' },
    }),
    'cisco.switching.access_port.assign_vlan': defineHintLadder({
      subskillPath: 'cisco.switching.access_port.assign_vlan',
      nudge: 'Ein Access-Port gehört zu genau einem VLAN.',
      focus: 'Wähle das Interface aus und setze Access-Mode und VLAN.',
      directive: 'Nutze "switchport mode access" und "switchport access vlan <id>".',
      solution: { answer: 'interface <if>\nswitchport mode access\nswitchport access vlan <id>\nexit', explanation: 'Im Interface-Modus werden Access-Mode und VLAN gesetzt.' },
    }),
  },
  requiredResolvedParams: ['hostname', 'vlanId', 'vlanName', 'decoyVlanId', 'targetPort', 'targetPorts', 'employee', 'context'],
  resolveParameters(rng, archetype, context) {
    const vlanId = pickFrom(rng, VLAN_ID_POOL);
    const decoyVlanId = pickFrom(rng, DECOY_VLAN_ID_POOL.filter((id) => id !== vlanId));
    const hostname = pickFrom(rng, VLAN_DEVICE_HOSTNAMES);
    const targetPort = `FastEthernet0/${rng(1, 24)}`;
    const employee = pickFrom(rng, EMPLOYEE_NAMES);
    return {
      hostname,
      vlanId,
      vlanName: VLAN_CONTEXT_NAMES[context] || 'MITARBEITER',
      decoyVlanId,
      targetPort,
      targetPorts: [targetPort],
      employee,
      context,
    };
  },
  buildDevice(params, archetype) {
    const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: params.hostname });
    const iface = device.runningConfig.interfaces[params.targetPort];
    if (iface) {
      iface.operationalStatus = 'connected';
      iface.administrativelyDown = false;
    }
    const uplink = device.runningConfig.interfaces['GigabitEthernet0/1'];
    if (uplink) {
      uplink.operationalStatus = 'connected';
      uplink.administrativelyDown = false;
    }

    if (archetype === MISSION_ARCHETYPE.REPAIR || archetype === MISSION_ARCHETYPE.DIAGNOSE) {
      // The port is already an access port, but in the wrong VLAN - a
      // realistic "someone patched it wrong" fault state.
      device.runningConfig.vlans[params.decoyVlanId] = { id: params.decoyVlanId, name: 'ALT' };
      if (iface) {
        iface.switchportMode = 'access';
        iface.accessVlan = params.decoyVlanId;
      }
    } else if (archetype === MISSION_ARCHETYPE.COMPLETE) {
      // The VLAN already exists (a colleague started the work), only the
      // port assignment is missing.
      device.runningConfig.vlans[params.vlanId] = { id: params.vlanId, name: params.vlanName };
    }
    // BUILD / AUDIT: port stays unconfigured (default VLAN 1) - AUDIT asks
    // the player to notice that nothing has been done yet.

    return { device };
  },
  evaluate(device, params) {
    const rc = device.runningConfig;
    const vlan = rc.vlans?.[params.vlanId];
    const vlanOk = !!vlan && vlan.name === params.vlanName;
    const portsOk = params.targetPorts.every((id) => {
      const iface = rc.interfaces[id];
      return !!iface && iface.switchportMode === 'access' && iface.accessVlan === params.vlanId && !iface.administrativelyDown;
    });
    const checks = [
      { id: 'vlan_created', label: `VLAN ${params.vlanId} ${params.vlanName}`, type: REQUIREMENT_TYPE.STATE, ok: vlanOk },
      { id: 'ports_configured', label: 'Access-Port(s) im richtigen VLAN', type: REQUIREMENT_TYPE.STATE, ok: portsOk },
    ];
    return { checks, allCorrect: checks.every((c) => c.ok) };
  },
  buildTitle(params, archetype) {
    const titles = {
      [MISSION_ARCHETYPE.BUILD]: `Neuer Arbeitsplatz: ${params.vlanName}`,
      [MISSION_ARCHETYPE.REPAIR]: `Falsches VLAN auf ${params.hostname}`,
      [MISSION_ARCHETYPE.AUDIT]: `VLAN-Check ${params.hostname}`,
      [MISSION_ARCHETYPE.DIAGNOSE]: `${params.employee} erreicht ihr Netz nicht`,
      [MISSION_ARCHETYPE.COMPLETE]: `VLAN ${params.vlanName} fertigstellen`,
    };
    return titles[archetype] || `VLAN-Auftrag ${params.hostname}`;
  },
  buildBriefing(params, archetype) {
    switch (archetype) {
      case MISSION_ARCHETYPE.REPAIR:
        return `Auf ${params.hostname} wurde ${params.targetPort} offenbar falsch gepatcht.\n\nDer Port soll zu VLAN ${params.vlanId} ${params.vlanName} gehören. Prüfe den aktuellen Zustand und korrigiere ihn.`;
      case MISSION_ARCHETYPE.AUDIT:
        return `Prüfe auf ${params.hostname}, ob ${params.targetPort} bereits korrekt in VLAN ${params.vlanId} ${params.vlanName} konfiguriert ist. Falls nicht: richte es ein.`;
      case MISSION_ARCHETYPE.DIAGNOSE:
        return `${params.employee} meldet: ihr Rechner an Port ${params.targetPort.replace('FastEthernet', 'Fa')} auf ${params.hostname} erreicht die falschen Systeme.\n\nFinde die Ursache und stelle sicher, dass der Port in VLAN ${params.vlanId} ${params.vlanName} liegt.`;
      case MISSION_ARCHETYPE.COMPLETE:
        return `Ein Kollege hat VLAN ${params.vlanId} ${params.vlanName} auf ${params.hostname} bereits angelegt, aber noch keinen Port zugeordnet.\n\nSchließe die Arbeit ab: ${params.targetPort} soll in dieses VLAN.`;
      default:
        return `Für ${params.employee} wird auf ${params.hostname} ein neuer Arbeitsplatz vorbereitet.\n\nRichte VLAN ${params.vlanId} ${params.vlanName} ein und ordne ${params.targetPort} zu.`;
    }
  },
  antiRepetitionMetadata(params, archetype, context) {
    return { skillGroup: 'switching_vlan', archetype, context, hostname: params.hostname, port: params.targetPort };
  },
});

const TEMPLATE_VLAN_ACCESS_RANGE = defineMissionTemplate({
  id: 'cisco-vlan-access-range',
  domain: 'cisco',
  requiredSkills: [
    'cisco.switching.vlan.create',
    'cisco.switching.vlan.name',
    'cisco.switching.access_port.configure',
    'cisco.switching.access_port.assign_vlan',
  ],
  unlockedBy: ['cisco-main-002'],
  archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.REPAIR, MISSION_ARCHETYPE.DIAGNOSE, MISSION_ARCHETYPE.AUDIT, MISSION_ARCHETYPE.COMPLETE],
  contexts: ['neue_abteilung', 'erweiterung', 'umzug', 'fehler'],
  allowedChannels: [MISSION_CHANNEL.EMAIL, MISSION_CHANNEL.PHONE],
  difficultyProfiles: [DIFFICULTY_PROFILE.EASY, DIFFICULTY_PROFILE.MEDIUM, DIFFICULTY_PROFILE.HARD],
  hintDefinitions: {
    'cisco.switching.vlan.create': defineHintLadder({
      subskillPath: 'cisco.switching.vlan.create',
      nudge: 'Mehrere Ports sollen ein gemeinsames VLAN erhalten.',
      focus: 'Das VLAN muss zuerst angelegt werden.',
      directive: 'Verwende "vlan <id>" und "name <name>" im Global Configuration Mode.',
      solution: { answer: 'vlan <id>\nname <name>\nexit', explanation: 'Ein VLAN braucht eine ID und einen Namen.' },
    }),
    'cisco.switching.access_port.assign_vlan': defineHintLadder({
      subskillPath: 'cisco.switching.access_port.assign_vlan',
      nudge: 'Alle Ports einer Abteilung gehören in dasselbe VLAN.',
      focus: 'Nutze "interface range", um die Ports gemeinsam zu konfigurieren.',
      directive: 'interface range fa0/x - y\nswitchport mode access\nswitchport access vlan <id>\nno shutdown\nexit',
      solution: { answer: 'interface range fa0/x - y\nswitchport mode access\nswitchport access vlan <id>\nno shutdown\nexit', explanation: 'Im Interface-Range-Modus werden alle Befehle auf die gewählten Ports angewendet.' },
    }),
  },
  requiredResolvedParams: ['vlanId', 'vlanName', 'decoyVlanId', 'hostname', 'targetPorts'],
  resolveParameters(rng, _archetype) {
    const vlanId = pickFrom(rng, STAGE2_VLAN_ID_POOL);
    const decoyVlanId = pickFrom(rng, STAGE2_VLAN_ID_POOL.filter((id) => id !== vlanId));
    const vlanName = pickFrom(rng, STAGE2_DEPARTMENT_NAMES);
    const hostname = pickFrom(rng, STAGE2_DEVICE_HOSTNAMES);
    const startPort = rng(1, 20);
    const rangeLen = rng(3, 5);
    const targetPorts = Array.from({ length: rangeLen }, (_, i) => `FastEthernet0/${startPort + i}`);
    return { vlanId, vlanName, decoyVlanId, hostname, targetPorts };
  },
  buildDevice(params, archetype) {
    const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: params.hostname });
    params.targetPorts.forEach((id) => {
      const iface = device.runningConfig.interfaces[id];
      if (iface) {
        iface.operationalStatus = 'connected';
        iface.administrativelyDown = false;
      }
    });
    if (archetype === MISSION_ARCHETYPE.REPAIR || archetype === MISSION_ARCHETYPE.DIAGNOSE) {
      device.runningConfig.vlans[params.decoyVlanId] = { id: params.decoyVlanId, name: 'ALT' };
      params.targetPorts.forEach((id) => {
        const iface = device.runningConfig.interfaces[id];
        if (iface) {
          iface.switchportMode = 'access';
          iface.accessVlan = params.decoyVlanId;
        }
      });
    } else if (archetype === MISSION_ARCHETYPE.COMPLETE) {
      device.runningConfig.vlans[params.vlanId] = { id: params.vlanId, name: params.vlanName };
    }
    return { device };
  },
  evaluate(device, params) {
    const vlan = device.runningConfig.vlans?.[params.vlanId];
    const vlanOk = !!vlan && vlan.name === params.vlanName;
    const portsOk = params.targetPorts.every((id) => {
      const iface = device.runningConfig.interfaces[id];
      return iface && iface.switchportMode === 'access' && iface.accessVlan === params.vlanId && !iface.administrativelyDown;
    });
    return {
      checks: [
        { id: 'vlan_created', label: `VLAN ${params.vlanId} ${params.vlanName}`, type: REQUIREMENT_TYPE.STATE, ok: vlanOk },
        { id: 'ports_configured', label: 'Access-Ports im richtigen VLAN', type: REQUIREMENT_TYPE.STATE, ok: portsOk },
      ],
      allCorrect: vlanOk && portsOk,
    };
  },
  buildTitle(params, archetype) {
    const titles = {
      [MISSION_ARCHETYPE.BUILD]: `Neue Abteilung: ${params.vlanName}`,
      [MISSION_ARCHETYPE.REPAIR]: `Falsches VLAN auf ${params.hostname}`,
      [MISSION_ARCHETYPE.AUDIT]: `VLAN-Check ${params.hostname}`,
      [MISSION_ARCHETYPE.DIAGNOSE]: `Bereich ${params.vlanName} nicht erreichbar`,
      [MISSION_ARCHETYPE.COMPLETE]: `VLAN ${params.vlanName} fertigstellen`,
    };
    return titles[archetype] || `VLAN-Auftrag ${params.hostname}`;
  },
  buildBriefing(params, archetype) {
    const portList = params.targetPorts.map((p) => p.replace('FastEthernet', 'Fa')).join(', ');
    if (archetype === MISSION_ARCHETYPE.REPAIR) {
      return `Auf ${params.hostname} wurden ${portList} offenbar falsch gepatcht. Die Ports sollen zu VLAN ${params.vlanId} ${params.vlanName} gehören. Prüfe den Zustand und korrigiere ihn.`;
    }
    if (archetype === MISSION_ARCHETYPE.DIAGNOSE) {
      return `Einige Mitarbeiter an ${portList} auf ${params.hostname} melden Netzprobleme. Finde heraus, warum und stelle sicher, dass die Ports in VLAN ${params.vlanId} ${params.vlanName} liegen.`;
    }
    if (archetype === MISSION_ARCHETYPE.COMPLETE) {
      return `VLAN ${params.vlanId} ${params.vlanName} ist auf ${params.hostname} bereits angelegt, aber ${portList} wurden noch nicht zugewiesen. Schließe die Konfiguration ab.`;
    }
    return `Für die Abteilung ${params.vlanName} werden auf ${params.hostname} neue Arbeitsplätze an ${portList} benötigt. Richte das VLAN ein, weise die Ports zu und aktiviere sie.`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return { skillGroup: 'switching_vlan', archetype, context, hostname: params.hostname, vlanId: params.vlanId, ports: params.targetPorts };
  },
});

const TEMPLATE_VLAN_MOVE = defineMissionTemplate({
  id: 'cisco-vlan-move',
  domain: 'cisco',
  requiredSkills: [
    'cisco.switching.access_port.assign_vlan',
    'cisco.switching.vlan.verify',
  ],
  unlockedBy: ['cisco-main-002'],
  archetypes: [MISSION_ARCHETYPE.REPAIR, MISSION_ARCHETYPE.CHANGE, MISSION_ARCHETYPE.USER_REPORT, MISSION_ARCHETYPE.INCIDENT],
  contexts: ['mitarbeiter_umzug', 'abteilungswechsel', 'fehler'],
  allowedChannels: [MISSION_CHANNEL.EMAIL, MISSION_CHANNEL.PHONE],
  difficultyProfiles: [DIFFICULTY_PROFILE.EASY, DIFFICULTY_PROFILE.MEDIUM, DIFFICULTY_PROFILE.HARD],
  hintDefinitions: {
    'cisco.switching.access_port.assign_vlan': defineHintLadder({
      subskillPath: 'cisco.switching.access_port.assign_vlan',
      nudge: 'Ein Arbeitsplatz soll in ein anderes VLAN verschoben werden.',
      focus: 'Wähle den Port aus und ändere das Access-VLAN.',
      directive: 'interface <if>\nswitchport access vlan <ziel-vlan>\nexit',
      solution: { answer: 'interface <if>\nswitchport access vlan <ziel-vlan>\nexit', explanation: 'Mit "switchport access vlan" wechselt der Port das VLAN.' },
    }),
  },
  requiredResolvedParams: ['sourceVlanId', 'targetVlanId', 'sourceVlanName', 'targetVlanName', 'hostname', 'targetPort', 'targetPorts'],
  resolveParameters(rng) {
    const ids = [];
    while (ids.length < 2) {
      const candidate = pickFrom(rng, STAGE2_VLAN_ID_POOL);
      if (!ids.includes(candidate)) ids.push(candidate);
    }
    const [sourceVlanId, targetVlanId] = ids;
    const hostname = pickFrom(rng, STAGE2_DEVICE_HOSTNAMES);
    const targetPort = `FastEthernet0/${rng(1, 24)}`;
    const sourceVlanName = pickFrom(rng, STAGE2_DEPARTMENT_NAMES);
    return {
      sourceVlanId,
      targetVlanId,
      sourceVlanName,
      targetVlanName: pickFrom(rng, STAGE2_DEPARTMENT_NAMES.filter((n) => n !== sourceVlanName)),
      hostname,
      targetPort,
      targetPorts: [targetPort],
    };
  },
  buildDevice(params) {
    const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: params.hostname });
    device.runningConfig.vlans[params.sourceVlanId] = { id: params.sourceVlanId, name: params.sourceVlanName };
    device.runningConfig.vlans[params.targetVlanId] = { id: params.targetVlanId, name: params.targetVlanName };
    const iface = device.runningConfig.interfaces[params.targetPort];
    if (iface) {
      iface.operationalStatus = 'connected';
      iface.administrativelyDown = false;
      iface.switchportMode = 'access';
      iface.accessVlan = params.sourceVlanId;
    }
    return { device };
  },
  evaluate(device, params) {
    const iface = device.runningConfig.interfaces[params.targetPort];
    const ok = !!iface && iface.switchportMode === 'access' && iface.accessVlan === params.targetVlanId && !iface.administrativelyDown;
    return { checks: [{ id: 'port_moved', label: `Port ${params.targetPort} in VLAN ${params.targetVlanId}`, type: REQUIREMENT_TYPE.STATE, ok }], allCorrect: ok };
  },
  buildTitle(params, archetype) {
    return archetype === MISSION_ARCHETYPE.INCIDENT ? `Port ${params.targetPort.replace('FastEthernet', 'Fa')} offline` : `VLAN-Wechsel auf ${params.hostname}`;
  },
  buildBriefing(params, archetype, _context, _difficulty) {
    const port = params.targetPort.replace('FastEthernet', 'Fa');
    if (archetype === MISSION_ARCHETYPE.INCIDENT) {
      return `Notfall: Der Arbeitsplatz an ${port} auf ${params.hostname} meldet keinen Netzzugriff mehr. Der Port befindet sich aktuell in VLAN ${params.sourceVlanId} ${params.sourceVlanName}, soll aber VLAN ${params.targetVlanId} ${params.targetVlanName} gehören.`;
    }
    return `Ein Mitarbeiter ist umgezogen: Der Arbeitsplatz an ${port} auf ${params.hostname} soll aus VLAN ${params.sourceVlanId} ${params.sourceVlanName} in VLAN ${params.targetVlanId} ${params.targetVlanName} verschoben werden.`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return { skillGroup: 'switching_vlan', archetype, context, hostname: params.hostname, port: params.targetPort, targetVlanId: params.targetVlanId };
  },
});

const TEMPLATE_TRUNK_UPLINK = defineMissionTemplate({
  id: 'cisco-trunk-uplink',
  domain: 'cisco',
  requiredSkills: [
    'cisco.switching.vlan.create',
    'cisco.switching.trunking',
    'cisco.switching.vlan.verify',
  ],
  unlockedBy: ['cisco-main-002'],
  archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.REPAIR, MISSION_ARCHETYPE.AUDIT],
  contexts: ['neuer_switch', 'uplink', 'infrastruktur'],
  allowedChannels: [MISSION_CHANNEL.EMAIL],
  difficultyProfiles: [DIFFICULTY_PROFILE.EASY, DIFFICULTY_PROFILE.MEDIUM, DIFFICULTY_PROFILE.HARD],
  hintDefinitions: {
    'cisco.switching.trunking': defineHintLadder({
      subskillPath: 'cisco.switching.trunking',
      nudge: 'Zwischen zwei Switches müssen mehrere VLANs transportiert werden.',
      focus: 'Der Uplink-Port muss Trunk-Modus erhalten.',
      directive: 'interface <uplink>\nswitchport mode trunk\nswitchport trunk allowed vlan <vlan-list>\nno shutdown\nexit',
      solution: { answer: 'interface gi0/1\nswitchport mode trunk\nswitchport trunk allowed vlan 10,20\nno shutdown\nexit', explanation: 'Ein Trunk transportiert mehrere VLANs über einen Port.' },
    }),
  },
  requiredResolvedParams: ['hostname', 'uplinkPort', 'vlans'],
  resolveParameters(rng) {
    const vlanCount = rng(2, 3);
    const vlanIds = [];
    while (vlanIds.length < vlanCount) {
      const candidate = pickFrom(rng, STAGE2_VLAN_ID_POOL);
      if (!vlanIds.includes(candidate)) vlanIds.push(candidate);
    }
    const vlans = vlanIds.map((id) => ({ id, name: pickFrom(rng, STAGE2_DEPARTMENT_NAMES) }));
    const hostname = pickFrom(rng, STAGE2_DEVICE_HOSTNAMES);
    return { hostname, uplinkPort: 'GigabitEthernet0/1', vlans };
  },
  buildDevice(params, archetype) {
    const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: params.hostname });
    params.vlans.forEach((v) => { device.runningConfig.vlans[v.id] = { id: v.id, name: v.name }; });
    const uplink = device.runningConfig.interfaces[params.uplinkPort];
    uplink.operationalStatus = 'connected';
    uplink.administrativelyDown = false;
    if (archetype === MISSION_ARCHETYPE.REPAIR) {
      uplink.switchportMode = 'access';
      uplink.accessVlan = 999;
    }
    return { device };
  },
  evaluate(device, params) {
    const uplink = device.runningConfig.interfaces[params.uplinkPort];
    const allowed = uplink.trunkAllowedVlans || Object.keys(device.runningConfig.vlans).map(Number);
    const ok = !!uplink
      && uplink.switchportMode === 'trunk'
      && !uplink.administrativelyDown
      && params.vlans.every((v) => allowed.includes(v.id));
    return { checks: [{ id: 'uplink_trunk', label: 'Uplink ist Trunk für alle VLANs', type: REQUIREMENT_TYPE.STATE, ok }], allCorrect: ok };
  },
  buildTitle(params, archetype) {
    return archetype === MISSION_ARCHETYPE.REPAIR ? `Uplink-Fehler auf ${params.hostname}` : `Trunk-Uplink auf ${params.hostname}`;
  },
  buildBriefing(params, archetype) {
    const vlanList = params.vlans.map((v) => `VLAN ${v.id} ${v.name}`).join(', ');
    if (archetype === MISSION_ARCHETYPE.REPAIR) {
      return `Der Uplink ${params.uplinkPort.replace('GigabitEthernet', 'Gi')} auf ${params.hostname} ist falsch konfiguriert und transportiert die VLANs ${vlanList} nicht. Repariere den Trunk.`;
    }
    return `Der neue Switch ${params.hostname} soll über ${params.uplinkPort.replace('GigabitEthernet', 'Gi')} als Trunk angebunden werden. Zulässige VLANs: ${vlanList}.`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return { skillGroup: 'switching_trunk', archetype, context, hostname: params.hostname, vlanIds: params.vlans.map((v) => v.id) };
  },
});

const TEMPLATE_TRUNK_ALLOWED_VLAN = defineMissionTemplate({
  id: 'cisco-trunk-allowed-vlan',
  domain: 'cisco',
  requiredSkills: [
    'cisco.switching.trunking',
    'cisco.switching.vlan.verify',
  ],
  unlockedBy: ['cisco-main-002'],
  archetypes: [MISSION_ARCHETYPE.REPAIR, MISSION_ARCHETYPE.CHANGE, MISSION_ARCHETYPE.USER_REPORT],
  contexts: ['neues_vlan_auf_trunk', 'fehler', 'erweiterung'],
  allowedChannels: [MISSION_CHANNEL.EMAIL, MISSION_CHANNEL.PHONE],
  difficultyProfiles: [DIFFICULTY_PROFILE.EASY, DIFFICULTY_PROFILE.MEDIUM, DIFFICULTY_PROFILE.HARD],
  hintDefinitions: {
    'cisco.switching.trunking': defineHintLadder({
      subskillPath: 'cisco.switching.trunking',
      nudge: 'Ein VLAN fehlt auf dem bestehenden Trunk.',
      focus: 'Ergänze die Allowed-VLAN-Liste des Uplinks.',
      directive: 'interface <uplink>\nswitchport trunk allowed vlan <vlan-list>\nexit',
      solution: { answer: 'interface gi0/1\nswitchport trunk allowed vlan 10,20,30\nexit', explanation: 'Nur in der Trunk-Allowed-Liste enthaltene VLANs werden über den Uplink transportiert.' },
    }),
  },
  requiredResolvedParams: ['hostname', 'uplinkPort', 'vlans', 'missingVlanId', 'allowedVlanIds'],
  resolveParameters(rng) {
    const vlanIds = [];
    while (vlanIds.length < 3) {
      const candidate = pickFrom(rng, STAGE2_VLAN_ID_POOL);
      if (!vlanIds.includes(candidate)) vlanIds.push(candidate);
    }
    const missingVlanId = vlanIds[2];
    const hostname = pickFrom(rng, STAGE2_DEVICE_HOSTNAMES);
    return {
      hostname,
      uplinkPort: 'GigabitEthernet0/1',
      vlans: vlanIds.map((id) => ({ id, name: pickFrom(rng, STAGE2_DEPARTMENT_NAMES) })),
      missingVlanId,
      allowedVlanIds: vlanIds.slice(0, 2),
    };
  },
  buildDevice(params) {
    const device = createCiscoDevice({ profile: 'catalyst_24fe_2ge', hostname: params.hostname });
    params.vlans.forEach((v) => { device.runningConfig.vlans[v.id] = { id: v.id, name: v.name }; });
    const uplink = device.runningConfig.interfaces[params.uplinkPort];
    uplink.operationalStatus = 'connected';
    uplink.administrativelyDown = false;
    uplink.switchportMode = 'trunk';
    uplink.trunkAllowedVlans = params.allowedVlanIds;
    return { device };
  },
  evaluate(device, params) {
    const uplink = device.runningConfig.interfaces[params.uplinkPort];
    const allowed = uplink.trunkAllowedVlans || [];
    const ok = !!uplink && uplink.switchportMode === 'trunk' && !uplink.administrativelyDown && params.vlans.every((v) => allowed.includes(v.id));
    return { checks: [{ id: 'allowed_vlans', label: 'Alle VLANs auf dem Trunk erlaubt', type: REQUIREMENT_TYPE.STATE, ok }], allCorrect: ok };
  },
  buildTitle(params) {
    return `Fehlendes VLAN auf Trunk ${params.hostname}`;
  },
  buildBriefing(params, _archetype) {
    const vlanList = params.vlans.map((v) => `VLAN ${v.id} ${v.name}`).join(', ');
    return `Auf ${params.hostname} fehlt VLAN ${params.missingVlanId} auf dem Trunk ${params.uplinkPort.replace('GigabitEthernet', 'Gi')}. Aktuell erlaubt: ${params.allowedVlanIds.join(', ')}. Ziel: ${vlanList}.`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return { skillGroup: 'switching_trunk', archetype, context, hostname: params.hostname, missingVlanId: params.missingVlanId };
  },
});

function buildVlanListForRouter(rng, count) {
  const vlanIds = [];
  while (vlanIds.length < count) {
    const candidate = pickFrom(rng, STAGE2_VLAN_ID_POOL);
    if (!vlanIds.includes(candidate)) vlanIds.push(candidate);
  }
  return vlanIds.map((id, index) => {
    const name = pickFrom(rng, STAGE2_DEPARTMENT_NAMES);
    const base = `192.168.${id % 256}`;
    return {
      id,
      name,
      network: `${base}.0`,
      mask: '255.255.255.0',
      gateway: `${base}.1`,
      accessPorts: Array.from({ length: 3 }, (_, j) => `FastEthernet0/${index * 4 + j + 1}`),
    };
  });
}

const TEMPLATE_ROUTER_ON_A_STICK = defineMissionTemplate({
  id: 'cisco-router-on-a-stick',
  domain: 'cisco',
  requiredSkills: [
    'cisco.switching.vlan.create',
    'cisco.switching.access_port.configure',
    'cisco.switching.trunking',
    'cisco.routing.router_interface.configure',
    'cisco.routing.inter_vlan.subinterface',
    'cisco.routing.inter_vlan.encapsulation_dot1q',
    'cisco.routing.inter_vlan.gateway',
  ],
  unlockedBy: ['cisco-main-004'],
  archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.COMPLETE, MISSION_ARCHETYPE.REPAIR],
  contexts: ['neue_abteilung_router', 'standorterweiterung'],
  allowedChannels: [MISSION_CHANNEL.EMAIL, MISSION_CHANNEL.PHONE],
  difficultyProfiles: [DIFFICULTY_PROFILE.EASY, DIFFICULTY_PROFILE.MEDIUM, DIFFICULTY_PROFILE.HARD],
  hintDefinitions: {
    'cisco.routing.inter_vlan.subinterface': defineHintLadder({
      subskillPath: 'cisco.routing.inter_vlan.subinterface',
      nudge: 'Für jedes VLAN braucht der Router ein eigenes logisches Interface.',
      focus: 'Erstelle Subinterfaces auf dem Router-Physikinterface.',
      directive: 'interface <physik>.<vlan-id>\nencapsulation dot1q <vlan-id>\nip address <gateway> <mask>\nno shutdown\nexit',
      solution: { answer: 'interface gi0/0.10\nencapsulation dot1q 10\nip address 192.168.10.1 255.255.255.0\nno shutdown\nexit', explanation: 'Router-on-a-Stick verwendet 802.1Q-Subinterfaces, damit ein Router-Port mehrere VLANs routen kann.' },
    }),
    'cisco.switching.trunking': defineHintLadder({
      subskillPath: 'cisco.switching.trunking',
      nudge: 'Der Router sieht die VLANs nur, wenn der Switch-Uplink ein Trunk ist.',
      focus: 'Konfiguriere den Uplink als Trunk und erlaube alle VLANs.',
      directive: 'interface <uplink>\nswitchport mode trunk\nswitchport trunk allowed vlan <vlan-list>\nno shutdown\nexit',
      solution: { answer: 'interface gi0/1\nswitchport mode trunk\nswitchport trunk allowed vlan 10,20\nno shutdown\nexit', explanation: 'Der Trunk transportiert die getaggten VLANs zwischen Switch und Router.' },
    }),
  },
  requiredResolvedParams: ['hostname', 'routerHostname', 'vlans', 'uplinkPort', 'routerPhysicalPort'],
  resolveParameters(rng, _archetype) {
    const vlanCount = rng(1, 2);
    const vlans = buildVlanListForRouter(rng, vlanCount);
    const hostname = pickFrom(rng, STAGE2_DEVICE_HOSTNAMES);
    const routerHostname = pickFrom(rng, STAGE3_ROUTER_HOSTNAMES);
    return { hostname, routerHostname, vlans, uplinkPort: 'GigabitEthernet0/1', routerPhysicalPort: 'GigabitEthernet0/0' };
  },
  buildDevice(params, archetype) {
    const device = createCiscoDevice({ profile: 'router_on_a_stick', hostname: params.hostname });
    params.vlans.forEach((v) => {
      if (archetype === MISSION_ARCHETYPE.COMPLETE) device.runningConfig.vlans[v.id] = { id: v.id, name: v.name };
      v.accessPorts.forEach((id) => {
        const iface = device.runningConfig.interfaces[id];
        if (iface) {
          iface.operationalStatus = 'connected';
          iface.administrativelyDown = false;
        }
      });
    });
    const uplink = device.runningConfig.interfaces[params.uplinkPort];
    uplink.operationalStatus = 'connected';
    uplink.administrativelyDown = false;
    const physical = device.runningConfig.interfaces[params.routerPhysicalPort];
    physical.operationalStatus = 'notconnect';
    physical.administrativelyDown = true;
    return { device };
  },
  evaluate(device, params) {
    return evaluateRouterOnAStick(device, params);
  },
  buildTitle(params, archetype) {
    return archetype === MISSION_ARCHETYPE.REPAIR ? `Inter-VLAN Routing auf ${params.hostname}` : `Neues VLAN auf ${params.hostname} routen`;
  },
  buildBriefing(params, archetype, _context, _difficulty) {
    const vlanList = params.vlans.map((v) => `- VLAN ${v.id} ${v.name}: ${v.network}/24, Gateway ${v.gateway}`).join('\n');
    const accessList = params.vlans.map((v) => `${v.name}: ${v.accessPorts.map((p) => p.replace('FastEthernet', 'Fa')).join(', ')}`).join('\n');
    if (archetype === MISSION_ARCHETYPE.COMPLETE) {
      return `Auf ${params.hostname} sind die VLANs bereits angelegt, aber ${params.routerHostname} routet sie noch nicht.\n\n${vlanList}\n\nAccess-Ports:\n${accessList}\n\nErstelle die Subinterfaces auf ${params.routerPhysicalPort.replace('GigabitEthernet', 'Gi')} und konfiguriere den Uplink ${params.uplinkPort.replace('GigabitEthernet', 'Gi')} als Trunk.`;
    }
    return `Eine neue Abteilung braucht auf ${params.hostname} Inter-VLAN-Routing.\n\n${vlanList}\n\nAccess-Ports:\n${accessList}\n\nUplink: ${params.uplinkPort.replace('GigabitEthernet', 'Gi')} (Trunk)\nRouter-Interface: ${params.routerPhysicalPort.replace('GigabitEthernet', 'Gi')}\n\nKonfiguriere VLANs, Access-Ports, Trunk und Router-Subinterfaces.`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return { skillGroup: 'inter_vlan', archetype, context, hostname: params.hostname, vlanIds: params.vlans.map((v) => v.id) };
  },
});

const ROUTER_FAULTS = ['wrong_dot1q', 'wrong_gateway', 'router_physical_down', 'missing_subinterface', 'missing_allowed_vlan', 'uplink_access'];

const TEMPLATE_ROUTER_FAULT = defineMissionTemplate({
  id: 'cisco-router-fault',
  domain: 'cisco',
  requiredSkills: [
    'cisco.switching.vlan.verify',
    'cisco.switching.trunking',
    'cisco.routing.router_interface.configure',
    'cisco.routing.inter_vlan.subinterface',
    'cisco.routing.inter_vlan.encapsulation_dot1q',
    'cisco.routing.inter_vlan.gateway',
    'cisco.routing.inter_vlan.troubleshoot',
  ],
  unlockedBy: ['cisco-main-004'],
  archetypes: [MISSION_ARCHETYPE.DIAGNOSE, MISSION_ARCHETYPE.REPAIR, MISSION_ARCHETYPE.INCIDENT],
  contexts: ['kein_zugriff', 'falsches_netz', 'langsam'],
  allowedChannels: [MISSION_CHANNEL.PHONE, MISSION_CHANNEL.EMAIL],
  difficultyProfiles: [DIFFICULTY_PROFILE.EASY, DIFFICULTY_PROFILE.MEDIUM, DIFFICULTY_PROFILE.HARD],
  hintDefinitions: {
    'cisco.routing.inter_vlan.troubleshoot': defineHintLadder({
      subskillPath: 'cisco.routing.inter_vlan.troubleshoot',
      nudge: 'Ein Fehler verhindert das Inter-VLAN-Routing.',
      focus: 'Prüfe Schritt für Schritt: Uplink-Trunk, Router-Physikinterface, Subinterfaces, Encapsulation, Gateway-IP.',
      directive: 'show interfaces trunk\nshow ip interface brief\nshow running-config',
      solution: { answer: 'Vergleiche Subinterfaces, Encapsulation-VLAN, Gateway-IP und Trunk-Allowed-Liste mit dem Auftrag.', explanation: 'Ein einzelner falscher Wert an einer dieser Stellen unterbricht die Kommunikation für das betroffene VLAN.' },
    }),
  },
  requiredResolvedParams: ['hostname', 'routerHostname', 'vlans', 'uplinkPort', 'routerPhysicalPort', 'faultId'],
  resolveParameters(rng) {
    const vlans = buildVlanListForRouter(rng, 2);
    const faultId = pickFrom(rng, ROUTER_FAULTS);
    const hostname = pickFrom(rng, STAGE2_DEVICE_HOSTNAMES);
    const routerHostname = pickFrom(rng, STAGE3_ROUTER_HOSTNAMES);
    return { hostname, routerHostname, vlans, uplinkPort: 'GigabitEthernet0/1', routerPhysicalPort: 'GigabitEthernet0/0', faultId };
  },
  buildDevice(params) {
    const device = createCiscoDevice({ profile: 'router_on_a_stick', hostname: params.hostname });
    params.vlans.forEach((v) => {
      device.runningConfig.vlans[v.id] = { id: v.id, name: v.name };
      v.accessPorts.forEach((id) => {
        const iface = device.runningConfig.interfaces[id];
        if (iface) {
          iface.operationalStatus = 'connected';
          iface.administrativelyDown = false;
          iface.switchportMode = 'access';
          iface.accessVlan = v.id;
        }
      });
    });
    const uplink = device.runningConfig.interfaces[params.uplinkPort];
    uplink.operationalStatus = 'connected';
    uplink.administrativelyDown = false;
    uplink.switchportMode = 'trunk';
    uplink.trunkAllowedVlans = params.vlans.map((v) => v.id);
    const physical = device.runningConfig.interfaces[params.routerPhysicalPort];
    physical.operationalStatus = 'notconnect';
    physical.administrativelyDown = false;
    params.vlans.forEach((v) => {
      const sub = createSubinterface(params.routerPhysicalPort, String(v.id));
      device.runningConfig.interfaces[sub.id] = sub;
      sub.encapsulationVlan = v.id;
      sub.encapsulationDot1q = true;
      sub.ipv4 = v.gateway;
      sub.mask = v.mask;
      sub.administrativelyDown = false;
    });
    const [firstVlan, secondVlan] = params.vlans;
    switch (params.faultId) {
      case 'wrong_dot1q': {
        const sub = device.runningConfig.interfaces[`${params.routerPhysicalPort}.${firstVlan.id}`];
        if (sub) sub.encapsulationVlan = secondVlan.id;
        break;
      }
      case 'wrong_gateway': {
        const sub = device.runningConfig.interfaces[`${params.routerPhysicalPort}.${firstVlan.id}`];
        if (sub) sub.ipv4 = secondVlan.gateway;
        break;
      }
      case 'router_physical_down': {
        physical.administrativelyDown = true;
        break;
      }
      case 'missing_subinterface': {
        delete device.runningConfig.interfaces[`${params.routerPhysicalPort}.${firstVlan.id}`];
        break;
      }
      case 'missing_allowed_vlan': {
        uplink.trunkAllowedVlans = [firstVlan.id];
        break;
      }
      case 'uplink_access': {
        uplink.switchportMode = 'access';
        uplink.accessVlan = firstVlan.id;
        uplink.trunkAllowedVlans = null;
        break;
      }
      default:
        break;
    }
    return { device };
  },
  evaluate(device, params) {
    return evaluateRouterOnAStick(device, params);
  },
  buildTitle(params, archetype) {
    return archetype === MISSION_ARCHETYPE.INCIDENT ? `Inter-VLAN-Ausfall auf ${params.hostname}` : `Inter-VLAN-Fehler auf ${params.hostname}`;
  },
  buildBriefing(params, archetype, context, difficulty) {
    const vlanList = params.vlans.map((v) => `- VLAN ${v.id} ${v.name}: ${v.network}/24, Gateway ${v.gateway}`).join('\n');
    const faultText = {
      wrong_dot1q: 'Ein Subinterface scheint die falsche VLAN-ID zu taggen.',
      wrong_gateway: 'Ein Subinterface hat offenbar die falsche IP-Adresse.',
      router_physical_down: 'Das Router-Physikinterface ist unerwartet down.',
      missing_subinterface: 'Für ein VLAN fehlt das Subinterface komplett.',
      missing_allowed_vlan: 'Ein VLAN fehlt auf dem Trunk.',
      uplink_access: 'Der Uplink ist nicht als Trunk, sondern als Access-Port konfiguriert.',
    }[params.faultId] || 'Eine Konfiguration verhindert das Routing zwischen VLANs.';
    const infra = `Uplink: ${params.uplinkPort.replace('GigabitEthernet', 'Gi')}\nRouter-Interface: ${params.routerPhysicalPort.replace('GigabitEthernet', 'Gi')}`;
    if (difficulty === DIFFICULTY_PROFILE.EASY) {
      return `Auf ${params.hostname} funktioniert das Inter-VLAN-Routing nicht mehr.\n\n${vlanList}\n\n${infra}\n\nHinweis: ${faultText} Finde und behebe den Fehler.`;
    }
    return `Mitarbeiter melden auf ${params.hostname}, dass sie Ressourcen im anderen VLAN nicht erreichen.\n\n${vlanList}\n\n${infra}\n\nDiagnostiziere das Problem und behebe es.`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return { skillGroup: 'inter_vlan', archetype, context, hostname: params.hostname, faultId: params.faultId };
  },
});

// ============================================================================
// SSH / Remote Administration templates (Phase 1J.3 Etappe 3, Block 1.5)
//
// Split into four narrow, coherent sub-problems instead of one template that
// always repeats the entire SSH setup:
//   - cisco-ssh-management-access: management VLAN + SVI + default gateway
//     on an L2 switch (a router never needs this - see below).
//   - cisco-ssh-enable: domain-name + RSA key + "ip ssh version 2", on top
//     of an ALREADY reachable management/routed IP.
//   - cisco-ssh-vty-access: "login local" + "transport input ssh" + adding
//     a specific new local user, on top of already-working SSH.
//   - cisco-ssh-diagnose: SSH was fully working, exactly one realistic fault
//     was introduced (wrong gateway, missing RSA, SSHv1, Telnet still
//     allowed, missing login local, missing user) - find and fix it.
//
// cisco-ssh-enable and cisco-ssh-vty-access both support a `deviceType` of
// 'switch' (management SVI, as built by cisco-ssh-management-access) or
// 'router' (a routed interface that already has a real IP - no artificial
// management VLAN is ever invented for a router that already has a usable
// routed address, per the Block 1.5 curriculum note in AGENTS.md).
// ============================================================================

const SSH_MGMT_VLAN_POOL = [10, 50, 77, 99, 100, 172, 200, 250];
const SSH_MGMT_VLAN_NAMES = ['MGMT', 'MANAGEMENT', 'ADMIN', 'IT', 'NETZADMIN'];
const SSH_SWITCH_HOSTNAMES = ['SW-ADM-02', 'SW-ADM-03', 'SW-AST-04', 'SW-LAB-03', 'SW-HQ-05'];
const SSH_ROUTED_NET_OCTETS = [11, 21, 31, 41, 51];
const SSH_DOMAIN_POOL = ['nexus.local', 'ast.nexus.local', 'lab.nexus.local'];
const SSH_TARGET_MODULUS = 1024;
const SSH_MIN_MODULUS = 768;
const SSH_WEAK_MODULUS = 768; // still >= the SSHv2 floor, but below the NEXUS-preferred size

// Deliberately DISJOINT from SSH_MGMT_VLAN_POOL: the management VLAN ID and
// the IP network it carries must never look systematically coupled (e.g.
// "VLAN 100 always means 192.168.100.0/24"), or players could wrongly infer
// that a VLAN ID and an IP network are inherently the same thing. HM3 keeps
// its own fixed story values (VLAN 172 / 192.168.172.0/24); only procedural
// side missions draw from this independent network pool. A mix of RFC1918
// ranges/octets is used on purpose so no arithmetic pattern with the VLAN
// pool above is possible.
const SSH_MGMT_NETWORK_POOL = [
  { network: '10.20.40.0', mask: '255.255.255.0' },
  { network: '192.168.80.0', mask: '255.255.255.0' },
  { network: '10.70.5.0', mask: '255.255.255.0' },
  { network: '192.168.44.0', mask: '255.255.255.0' },
  { network: '10.30.90.0', mask: '255.255.255.0' },
  { network: '192.168.233.0', mask: '255.255.255.0' },
  { network: '10.90.12.0', mask: '255.255.255.0' },
  { network: '192.168.15.0', mask: '255.255.255.0' },
];

function networkPrefix(networkAddress) {
  return networkAddress.split('.').slice(0, 3).join('.');
}

// Picks a management network completely independently of any VLAN ID -
// see the pool comment above for why this must stay decoupled.
function sshManagementNetwork(rng) {
  const chosen = pickFrom(rng, SSH_MGMT_NETWORK_POOL);
  const prefix = networkPrefix(chosen.network);
  return {
    network: chosen.network, mask: chosen.mask, gateway: `${prefix}.1`, mgmtIp: `${prefix}.2`,
  };
}

function sshRoutedNetwork(rng) {
  const octet = pickFrom(rng, SSH_ROUTED_NET_OCTETS);
  const base = `10.10.${octet}`;
  return { network: `${base}.0`, mask: '255.255.255.0', routerIp: `${base}.1` };
}

function pickAccount(rng, exclude = []) {
  const pool = ACCOUNT_NAME_POOL.filter((p) => p.username && !exclude.includes(p.username));
  return pickFrom(rng, pool.length ? pool : ACCOUNT_NAME_POOL);
}

function buildSshSwitchDevice(hostname) {
  const device = createCiscoDevice({ profile: 'catalyst_8fe_1ge', hostname });
  device.runningConfig.noIpDomainLookup = true;
  return device;
}

// ciscoCliEngine.js does not export its internal createInterface() helper,
// so SVI interfaces built directly (without going through the CLI command
// tree) are shaped explicitly here, mirroring every field a real interface
// object has, so rendering/evaluation code never sees a partially-shaped
// interface.
function buildSviInterfaceObject(vlanId, { ipv4 = null, mask = null, administrativelyDown = true } = {}) {
  const id = `Vlan${vlanId}`;
  return {
    id,
    name: id,
    type: 'svi',
    parentId: null,
    ipv4,
    mask,
    administrativelyDown,
    operationalStatus: administrativelyDown ? 'disabled' : 'up',
    description: '',
    duplex: null,
    speed: null,
    switchportMode: null,
    accessVlan: null,
    trunkAllowedVlans: null,
    nativeVlan: null,
    encapsulationVlan: null,
    encapsulationDot1q: null,
  };
}

function buildSshRouterDevice(hostname, routerIp, mask) {
  const device = createCiscoDevice({ profile: 'router_1ge', hostname });
  device.runningConfig.noIpDomainLookup = true;
  const iface = device.runningConfig.interfaces['GigabitEthernet0/0'];
  iface.ipv4 = routerIp;
  iface.mask = mask;
  iface.operationalStatus = 'connected';
  iface.administrativelyDown = false;
  return device;
}

// Shared "device already has a usable management/routed IP" base, used by
// cisco-ssh-enable and cisco-ssh-vty-access so a router never gets an
// invented management VLAN.
function resolveSshReachabilityParams(rng) {
  const deviceType = pickFrom(rng, ['switch', 'router']);
  if (deviceType === 'switch') {
    const hostname = pickFrom(rng, SSH_SWITCH_HOSTNAMES);
    const mgmtVlanId = pickFrom(rng, SSH_MGMT_VLAN_POOL);
    const mgmtVlanName = pickFrom(rng, SSH_MGMT_VLAN_NAMES);
    const net = sshManagementNetwork(rng);
    return {
      deviceType, hostname, mgmtVlanId, mgmtVlanName, ip: net.mgmtIp, mask: net.mask, gateway: net.gateway,
    };
  }
  const hostname = pickFrom(rng, STAGE3_ROUTER_HOSTNAMES);
  const net = sshRoutedNetwork(rng);
  return {
    deviceType, hostname, ip: net.routerIp, mask: net.mask, gateway: null,
  };
}

function buildReachableSshDevice(params) {
  if (params.deviceType === 'switch') {
    const device = buildSshSwitchDevice(params.hostname);
    device.runningConfig.vlans[params.mgmtVlanId] = { id: params.mgmtVlanId, name: params.mgmtVlanName };
    device.runningConfig.interfaces[`Vlan${params.mgmtVlanId}`] = buildSviInterfaceObject(params.mgmtVlanId, {
      ipv4: params.ip, mask: params.mask, administrativelyDown: false,
    });
    device.runningConfig.ipDefaultGateway = params.gateway;
    return device;
  }
  return buildSshRouterDevice(params.hostname, params.ip, params.mask);
}

const SSH_MGMT_HINTS = {
  'cisco.remote_administration.management_svi': defineHintLadder({
    subskillPath: 'cisco.remote_administration.management_svi',
    nudge: 'Ein reiner Layer-2-Switch braucht eine virtuelle Schnittstelle, um selbst eine IP-Adresse zu bekommen.',
    focus: 'Erstelle die SVI für das Management-VLAN und weise ihr eine IP-Adresse zu.',
    directive: 'interface vlan <id>\nip address <ip> <maske>\nno shutdown\nexit',
    solution: { answer: 'interface vlan 172\nip address 192.168.172.2 255.255.255.0\nno shutdown\nexit', explanation: 'Die SVI gibt dem Switch eine erreichbare IP-Adresse im Management-VLAN.' },
  }),
};

const TEMPLATE_SSH_MANAGEMENT_ACCESS = defineMissionTemplate({
  id: 'cisco-ssh-management-access',
  domain: 'cisco',
  requiredSkills: [
    'cisco.switching.vlan.create',
    'cisco.remote_administration.management_svi',
    'cisco.basic_configuration.default_gateway',
  ],
  unlockedBy: ['cisco-main-003'],
  archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.COMPLETE, MISSION_ARCHETYPE.REPAIR],
  contexts: ['neuer_verwaltungszugang', 'standort_fernwartung', 'sicherheitsaudit'],
  allowedChannels: [MISSION_CHANNEL.EMAIL, MISSION_CHANNEL.PHONE],
  difficultyProfiles: DIFFICULTY_ORDER,
  hintDefinitions: SSH_MGMT_HINTS,
  requiredResolvedParams: ['hostname', 'mgmtVlanId', 'mgmtVlanName', 'mgmtIp', 'mgmtMask', 'mgmtGateway'],
  resolveParameters(rng) {
    const hostname = pickFrom(rng, SSH_SWITCH_HOSTNAMES);
    const mgmtVlanId = pickFrom(rng, SSH_MGMT_VLAN_POOL);
    const mgmtVlanName = pickFrom(rng, SSH_MGMT_VLAN_NAMES);
    const net = sshManagementNetwork(rng);
    return {
      hostname, mgmtVlanId, mgmtVlanName, mgmtIp: net.mgmtIp, mgmtMask: net.mask, mgmtGateway: net.gateway,
    };
  },
  buildDevice(params, archetype) {
    const device = buildSshSwitchDevice(params.hostname);
    if (archetype === MISSION_ARCHETYPE.COMPLETE) {
      // VLAN already created, but nobody got around to the SVI/gateway yet.
      device.runningConfig.vlans[params.mgmtVlanId] = { id: params.mgmtVlanId, name: params.mgmtVlanName };
    }
    if (archetype === MISSION_ARCHETYPE.REPAIR) {
      device.runningConfig.vlans[params.mgmtVlanId] = { id: params.mgmtVlanId, name: params.mgmtVlanName };
      device.runningConfig.interfaces[`Vlan${params.mgmtVlanId}`] = buildSviInterfaceObject(params.mgmtVlanId, {
        ipv4: params.mgmtIp, mask: params.mgmtMask, administrativelyDown: true,
      });
      // Gateway was never set either - a realistic "half-finished" state.
    }
    return { device };
  },
  evaluate(device, params) {
    const vlan = device.runningConfig.vlans?.[params.mgmtVlanId];
    const mgmtVlan = !!vlan && vlan.name === params.mgmtVlanName;
    const svi = device.runningConfig.interfaces?.[`Vlan${params.mgmtVlanId}`];
    const sviAddress = !!svi && svi.ipv4 === params.mgmtIp && svi.mask === params.mgmtMask && !svi.administrativelyDown;
    const defaultGateway = device.runningConfig.ipDefaultGateway === params.mgmtGateway;
    const checks = [
      { id: 'mgmt_vlan', label: `VLAN ${params.mgmtVlanId} / ${params.mgmtVlanName}`, skill: 'cisco.switching.vlan.create', type: REQUIREMENT_TYPE.STATE, ok: mgmtVlan },
      { id: 'svi_address', label: `SVI Vlan${params.mgmtVlanId} mit IP ${params.mgmtIp}, aktiviert`, skill: 'cisco.remote_administration.management_svi', type: REQUIREMENT_TYPE.STATE, ok: sviAddress },
      { id: 'default_gateway', label: `Default Gateway ${params.mgmtGateway}`, skill: 'cisco.basic_configuration.default_gateway', type: REQUIREMENT_TYPE.STATE, ok: defaultGateway },
    ];
    return { checks, allCorrect: checks.every((c) => c.ok) };
  },
  buildTitle(params, archetype) {
    if (archetype === MISSION_ARCHETYPE.REPAIR) return `Verwaltungszugang auf ${params.hostname} nicht erreichbar`;
    if (archetype === MISSION_ARCHETYPE.COMPLETE) return `Verwaltungszugang auf ${params.hostname} fertigstellen`;
    return `Verwaltungszugang für ${params.hostname} einrichten`;
  },
  buildBriefing(params, archetype) {
    const base = `${params.hostname} soll über VLAN ${params.mgmtVlanId} / ${params.mgmtVlanName} erreichbar werden (IP ${params.mgmtIp}/${params.mgmtMask}, Gateway ${params.mgmtGateway}).`;
    if (archetype === MISSION_ARCHETYPE.REPAIR) {
      return `${base}\n\nDie SVI existiert bereits, ist aber nicht erreichbar - vermutlich fehlt etwas an der Aktivierung oder am Gateway. Finde und behebe den Fehler.`;
    }
    if (archetype === MISSION_ARCHETYPE.COMPLETE) {
      return `${base}\n\nDas VLAN ist schon angelegt, die SVI und das Gateway fehlen aber noch.`;
    }
    return `${base}\n\nLege das VLAN an, richte die SVI mit der IP-Adresse ein und setze das Default Gateway.`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return {
      skillGroup: 'remote_administration_access', archetype, context, hostname: params.hostname, mgmtVlanId: params.mgmtVlanId,
    };
  },
});

const TEMPLATE_SSH_ENABLE = defineMissionTemplate({
  id: 'cisco-ssh-enable',
  domain: 'cisco',
  requiredSkills: [
    'cisco.basic_configuration.domain_name',
    'cisco.remote_administration.hostname_domain_dependency',
    'cisco.remote_administration.rsa_keys',
    'cisco.remote_administration.ssh_version',
  ],
  unlockedBy: ['cisco-main-003'],
  archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.COMPLETE, MISSION_ARCHETYPE.HARDEN],
  contexts: ['neues_geraet', 'fernwartung_freischalten', 'sicherheitsrichtlinie'],
  allowedChannels: [MISSION_CHANNEL.EMAIL],
  difficultyProfiles: DIFFICULTY_ORDER,
  hintDefinitions: {
    'cisco.remote_administration.rsa_keys': defineHintLadder({
      subskillPath: 'cisco.remote_administration.rsa_keys',
      nudge: 'SSH braucht einen RSA-Schlüssel zur Verschlüsselung der Verbindung.',
      focus: 'Erzeuge (oder erneuere) den RSA-Schlüssel mit mindestens 1024 Bit.',
      directive: 'crypto key generate rsa\n1024',
      solution: { answer: 'crypto key generate rsa\n1024', explanation: '"crypto key generate rsa" fragt interaktiv nach der Schlüssellänge; 1024 Bit ist der NEXUS-Standard.' },
    }),
  },
  requiredResolvedParams: ['deviceType', 'hostname', 'mgmtVlanId', 'mgmtVlanName', 'ip', 'mask', 'gateway', 'domainName', 'username', 'userSecret'],
  resolveParameters(rng) {
    const reachability = resolveSshReachabilityParams(rng);
    const domainName = pickFrom(rng, SSH_DOMAIN_POOL);
    const account = pickAccount(rng);
    return {
      ...reachability, domainName, username: account.username, userSecret: generateSecret(rng),
    };
  },
  buildDevice(params, archetype) {
    const device = buildReachableSshDevice(params);
    device.runningConfig.users[params.username] = { secret: params.userSecret };
    if (archetype === MISSION_ARCHETYPE.COMPLETE) {
      device.runningConfig.ipDomainName = params.domainName;
      device.runningConfig.cryptoKey = { exists: true, modulus: SSH_TARGET_MODULUS };
      // ssh version left unset - the last small step was forgotten.
    }
    if (archetype === MISSION_ARCHETYPE.HARDEN) {
      device.runningConfig.ipDomainName = params.domainName;
      device.runningConfig.cryptoKey = { exists: true, modulus: SSH_WEAK_MODULUS };
      device.runningConfig.ipSshVersion = 2;
    }
    return { device };
  },
  evaluate(device, params) {
    const domainName = device.runningConfig.ipDomainName === params.domainName;
    const rsaKey = !!device.runningConfig.cryptoKey?.exists && device.runningConfig.cryptoKey.modulus >= SSH_TARGET_MODULUS;
    const sshVersion = device.runningConfig.ipSshVersion === 2;
    const checks = [
      { id: 'domain_name', label: `Domain-Name ${params.domainName}`, skill: 'cisco.basic_configuration.domain_name', type: REQUIREMENT_TYPE.STATE, ok: domainName },
      { id: 'rsa_key', label: `RSA-Schlüssel (>= ${SSH_TARGET_MODULUS} Bit)`, skill: 'cisco.remote_administration.rsa_keys', type: REQUIREMENT_TYPE.STATE, ok: rsaKey },
      { id: 'ssh_version', label: 'SSH Version 2', skill: 'cisco.remote_administration.ssh_version', type: REQUIREMENT_TYPE.STATE, ok: sshVersion },
    ];
    return { checks, allCorrect: checks.every((c) => c.ok) };
  },
  buildTitle(params, archetype) {
    if (archetype === MISSION_ARCHETYPE.HARDEN) return `SSH-Schlüssel auf ${params.hostname} verstärken`;
    if (archetype === MISSION_ARCHETYPE.COMPLETE) return `SSH auf ${params.hostname} fertigstellen`;
    return `SSH auf ${params.hostname} freischalten`;
  },
  buildBriefing(params, archetype) {
    const reach = params.deviceType === 'switch'
      ? `${params.hostname} ist über seine Management-IP bereits erreichbar.`
      : `${params.hostname} hat bereits eine gültige, geroutete IP-Adresse - ein zusätzliches Management-VLAN ist hier nicht nötig.`;
    if (archetype === MISSION_ARCHETYPE.HARDEN) {
      return `${reach}\n\nSSH läuft bereits, aber der RSA-Schlüssel ist mit ${SSH_WEAK_MODULUS} Bit schwächer als der NEXUS-Standard. Erzeuge einen neuen Schlüssel mit mindestens ${SSH_TARGET_MODULUS} Bit.`;
    }
    if (archetype === MISSION_ARCHETYPE.COMPLETE) {
      return `${reach}\n\nDomain-Name und RSA-Schlüssel sind schon gesetzt, aber SSH Version 2 wurde nicht erzwungen. Schließe die Konfiguration ab.`;
    }
    return `${reach}\n\nDamit SSH funktioniert, brauchst du einen Domain-Namen (${params.domainName}), einen RSA-Schlüssel (mindestens ${SSH_TARGET_MODULUS} Bit) und SSH Version 2.`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return {
      skillGroup: 'remote_administration_enable', archetype, context, hostname: params.hostname, deviceType: params.deviceType,
    };
  },
});

const TEMPLATE_SSH_VTY_ACCESS = defineMissionTemplate({
  id: 'cisco-ssh-vty-access',
  domain: 'cisco',
  requiredSkills: [
    'cisco.remote_administration.vty_login_local',
    'cisco.remote_administration.vty_transport_ssh',
    'cisco.remote_administration.local_user',
  ],
  unlockedBy: ['cisco-main-003'],
  archetypes: [MISSION_ARCHETYPE.BUILD, MISSION_ARCHETYPE.USER_REPORT, MISSION_ARCHETYPE.AUDIT],
  contexts: ['neuer_mitarbeiter', 'sicherheitsaudit', 'zugriffsschutz'],
  allowedChannels: [MISSION_CHANNEL.EMAIL, MISSION_CHANNEL.PHONE],
  difficultyProfiles: DIFFICULTY_ORDER,
  hintDefinitions: {
    'cisco.remote_administration.vty_transport_ssh': defineHintLadder({
      subskillPath: 'cisco.remote_administration.vty_transport_ssh',
      nudge: 'Standardmäßig erlauben die VTY-Leitungen auch unverschlüsseltes Telnet.',
      focus: 'Beschränke die VTY-Leitungen auf SSH.',
      directive: 'line vty 0 15\ntransport input ssh',
      solution: { answer: 'line vty 0 15\ntransport input ssh\nexit', explanation: '"transport input ssh" lässt nur noch SSH zu und deaktiviert Telnet auf den VTY-Leitungen.' },
    }),
  },
  requiredResolvedParams: ['deviceType', 'hostname', 'mgmtVlanId', 'mgmtVlanName', 'ip', 'mask', 'gateway', 'domainName', 'existingUsername', 'existingUserSecret', 'newUsername', 'newUserSecret', 'requiredChecks', 'auditPreconfiguredCheck'],
  resolveParameters(rng, archetype) {
    const reachability = resolveSshReachabilityParams(rng);
    const existing = pickAccount(rng);
    const newAccount = pickAccount(rng, [existing.username]);
    const requiredChecks = archetype === MISSION_ARCHETYPE.USER_REPORT
      ? ['new_user']
      : ['login_local', 'transport_ssh'];
    // Deterministic (seed-driven) choice of which VTY check is already
    // compliant in the AUDIT archetype - irrelevant for other archetypes.
    const auditPreconfiguredCheck = pickFrom(rng, ['login_local', 'transport_ssh']);
    return {
      ...reachability,
      domainName: pickFrom(rng, SSH_DOMAIN_POOL),
      existingUsername: existing.username,
      existingUserSecret: generateSecret(rng),
      newUsername: newAccount.username,
      newUserSecret: generateSecret(rng),
      requiredChecks,
      auditPreconfiguredCheck,
    };
  },
  buildDevice(params, archetype) {
    const device = buildReachableSshDevice(params);
    device.runningConfig.ipDomainName = params.domainName;
    device.runningConfig.cryptoKey = { exists: true, modulus: SSH_TARGET_MODULUS };
    device.runningConfig.ipSshVersion = 2;
    device.runningConfig.users[params.existingUsername] = { secret: params.existingUserSecret };
    if (archetype === MISSION_ARCHETYPE.USER_REPORT) {
      // Line is already hardened - the only missing piece is the new account.
      device.runningConfig.lines.vty.loginLocal = true;
      device.runningConfig.lines.vty.login = false;
      device.runningConfig.lines.vty.transportInput = ['ssh'];
    } else if (archetype === MISSION_ARCHETYPE.AUDIT) {
      // Half-compliant, audit-style state: one of the two checks already
      // correct, the other one still open - mirrors TEMPLATE_BASIC_CONFIG_HARDENING's audit pattern.
      if (params.auditPreconfiguredCheck === 'login_local') {
        device.runningConfig.lines.vty.loginLocal = true;
      } else {
        device.runningConfig.lines.vty.transportInput = ['ssh'];
      }
    }
    return { device };
  },
  evaluate(device, params) {
    const loginLocal = !!device.runningConfig.lines?.vty?.loginLocal;
    const transportSsh = Array.isArray(device.runningConfig.lines?.vty?.transportInput)
      && device.runningConfig.lines.vty.transportInput.length > 0
      && device.runningConfig.lines.vty.transportInput.every((t) => t === 'ssh');
    const newUser = !!device.runningConfig.users?.[params.newUsername];
    const all = {
      login_local: { id: 'login_local', label: 'VTY login local', skill: 'cisco.remote_administration.vty_login_local', type: REQUIREMENT_TYPE.STATE, ok: loginLocal },
      transport_ssh: { id: 'transport_ssh', label: 'VTY transport input ssh (kein Telnet)', skill: 'cisco.remote_administration.vty_transport_ssh', type: REQUIREMENT_TYPE.STATE, ok: transportSsh },
      new_user: { id: 'new_user', label: `Benutzer ${params.newUsername} angelegt`, skill: 'cisco.remote_administration.local_user', type: REQUIREMENT_TYPE.STATE, ok: newUser },
    };
    const checks = params.requiredChecks.map((id) => all[id]);
    return { checks, allCorrect: checks.every((c) => c.ok) };
  },
  buildTitle(params, archetype) {
    if (archetype === MISSION_ARCHETYPE.USER_REPORT) return `SSH-Zugang für ${params.newUsername} auf ${params.hostname}`;
    if (archetype === MISSION_ARCHETYPE.AUDIT) return `VTY-Sicherheits-Check ${params.hostname}`;
    return `VTY-Leitungen auf ${params.hostname} absichern`;
  },
  buildBriefing(params, archetype) {
    if (archetype === MISSION_ARCHETYPE.USER_REPORT) {
      return `Ein neuer Kollege braucht Fernzugriff auf ${params.hostname}. SSH und die VTY-Absicherung laufen bereits - lege für ihn den Benutzer ${params.newUsername} an.`;
    }
    if (archetype === MISSION_ARCHETYPE.AUDIT) {
      return `Prüfe auf ${params.hostname}, ob die VTY-Leitungen bereits vollständig auf "login local" und "transport input ssh" abgesichert sind. Ergänze, was fehlt.`;
    }
    return `SSH läuft auf ${params.hostname}, aber die VTY-Leitungen sind noch nicht abgesichert: kein "login local", Telnet ist weiterhin erlaubt. Behebe beides.`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return {
      skillGroup: 'remote_administration_vty', archetype, context, hostname: params.hostname, deviceType: params.deviceType,
    };
  },
});

const SSH_FAULTS = ['wrong_gateway', 'missing_login_local', 'missing_rsa', 'wrong_ssh_version', 'telnet_still_allowed', 'missing_user'];

const TEMPLATE_SSH_DIAGNOSE = defineMissionTemplate({
  id: 'cisco-ssh-diagnose',
  domain: 'cisco',
  requiredSkills: [
    'cisco.remote_administration.troubleshoot',
    'cisco.remote_administration.verify',
    'cisco.remote_administration.rsa_keys',
    'cisco.remote_administration.ssh_version',
    'cisco.remote_administration.vty_login_local',
    'cisco.remote_administration.vty_transport_ssh',
  ],
  unlockedBy: ['cisco-main-003'],
  archetypes: [MISSION_ARCHETYPE.DIAGNOSE, MISSION_ARCHETYPE.REPAIR, MISSION_ARCHETYPE.INCIDENT],
  contexts: ['kein_zugriff', 'zugriff_verweigert', 'plötzlich_offline'],
  allowedChannels: [MISSION_CHANNEL.PHONE, MISSION_CHANNEL.EMAIL],
  difficultyProfiles: DIFFICULTY_ORDER,
  hintDefinitions: {
    'cisco.remote_administration.troubleshoot': defineHintLadder({
      subskillPath: 'cisco.remote_administration.troubleshoot',
      nudge: 'SSH lief bereits - irgendetwas an der Kette VLAN/SVI/Gateway/Domain/RSA/SSH-Version/VTY wurde verändert.',
      focus: 'Prüfe Schritt für Schritt: Erreichbarkeit (SVI/Gateway), dann Domain/RSA/SSH-Version, dann VTY.',
      directive: 'show ip ssh\nshow ip interface brief\nshow running-config',
      solution: { answer: 'Vergleiche Gateway, RSA-Schlüssel, SSH-Version, login local und transport input mit dem bekannten Sollzustand.', explanation: 'Ein einzelner falscher oder fehlender Wert reicht aus, um SSH unbrauchbar zu machen.' },
    }),
  },
  requiredResolvedParams: ['hostname', 'mgmtVlanId', 'mgmtVlanName', 'mgmtIp', 'mgmtMask', 'mgmtGateway', 'domainName', 'username', 'userSecret', 'faultId'],
  resolveParameters(rng) {
    const hostname = pickFrom(rng, SSH_SWITCH_HOSTNAMES);
    const mgmtVlanId = pickFrom(rng, SSH_MGMT_VLAN_POOL);
    const mgmtVlanName = pickFrom(rng, SSH_MGMT_VLAN_NAMES);
    const net = sshManagementNetwork(rng);
    const domainName = pickFrom(rng, SSH_DOMAIN_POOL);
    const account = pickAccount(rng);
    const faultId = pickFrom(rng, SSH_FAULTS);
    return {
      hostname,
      mgmtVlanId,
      mgmtVlanName,
      mgmtIp: net.mgmtIp,
      mgmtMask: net.mask,
      mgmtGateway: net.gateway,
      domainName,
      username: account.username,
      userSecret: generateSecret(rng),
      faultId,
    };
  },
  buildDevice(params) {
    const device = buildSshSwitchDevice(params.hostname);
    device.runningConfig.vlans[params.mgmtVlanId] = { id: params.mgmtVlanId, name: params.mgmtVlanName };
    device.runningConfig.interfaces[`Vlan${params.mgmtVlanId}`] = buildSviInterfaceObject(params.mgmtVlanId, {
      ipv4: params.mgmtIp, mask: params.mgmtMask, administrativelyDown: false,
    });
    device.runningConfig.ipDefaultGateway = params.mgmtGateway;
    device.runningConfig.ipDomainName = params.domainName;
    device.runningConfig.cryptoKey = { exists: true, modulus: SSH_TARGET_MODULUS };
    device.runningConfig.ipSshVersion = 2;
    device.runningConfig.users[params.username] = { secret: params.userSecret };
    device.runningConfig.lines.vty.loginLocal = true;
    device.runningConfig.lines.vty.login = false;
    device.runningConfig.lines.vty.transportInput = ['ssh'];

    switch (params.faultId) {
      case 'wrong_gateway': {
        // Management IP itself is correct - only the gateway is wrong. Stay
        // within the same /24 (a wrong-but-plausible host address), derived
        // from the actual (VLAN-independent) management network prefix.
        device.runningConfig.ipDefaultGateway = `${networkPrefix(params.mgmtIp)}.254`;
        break;
      }
      case 'missing_login_local': {
        device.runningConfig.lines.vty.loginLocal = false;
        break;
      }
      case 'missing_rsa': {
        device.runningConfig.cryptoKey = { exists: false, modulus: null };
        break;
      }
      case 'wrong_ssh_version': {
        device.runningConfig.ipSshVersion = 1;
        break;
      }
      case 'telnet_still_allowed': {
        device.runningConfig.lines.vty.transportInput = ['telnet', 'ssh'];
        break;
      }
      case 'missing_user': {
        device.runningConfig.users = {};
        break;
      }
      default:
        break;
    }
    return { device };
  },
  evaluate(device, params) {
    const rc = device.runningConfig;
    const mgmtVlan = rc.vlans?.[params.mgmtVlanId]?.name === params.mgmtVlanName;
    const svi = rc.interfaces?.[`Vlan${params.mgmtVlanId}`];
    const sviAddress = !!svi && svi.ipv4 === params.mgmtIp && svi.mask === params.mgmtMask && !svi.administrativelyDown;
    const defaultGateway = rc.ipDefaultGateway === params.mgmtGateway;
    const domainName = rc.ipDomainName === params.domainName;
    const rsaKey = !!rc.cryptoKey?.exists && rc.cryptoKey.modulus >= SSH_MIN_MODULUS;
    const sshVersion = rc.ipSshVersion === 2;
    const loginLocal = !!rc.lines?.vty?.loginLocal;
    const transportSsh = Array.isArray(rc.lines?.vty?.transportInput)
      && rc.lines.vty.transportInput.length > 0
      && rc.lines.vty.transportInput.every((t) => t === 'ssh');
    const userExists = !!rc.users?.[params.username];
    const checks = [
      { id: 'mgmt_vlan', label: `VLAN ${params.mgmtVlanId} / ${params.mgmtVlanName}`, skill: 'cisco.switching.vlan.create', type: REQUIREMENT_TYPE.STATE, ok: mgmtVlan },
      { id: 'svi_address', label: `SVI Vlan${params.mgmtVlanId} mit IP ${params.mgmtIp}, aktiviert`, skill: 'cisco.remote_administration.management_svi', type: REQUIREMENT_TYPE.STATE, ok: sviAddress },
      { id: 'default_gateway', label: `Default Gateway ${params.mgmtGateway}`, skill: 'cisco.basic_configuration.default_gateway', type: REQUIREMENT_TYPE.STATE, ok: defaultGateway },
      { id: 'domain_name', label: `Domain-Name ${params.domainName}`, skill: 'cisco.basic_configuration.domain_name', type: REQUIREMENT_TYPE.STATE, ok: domainName },
      { id: 'rsa_key', label: `RSA-Schlüssel (>= ${SSH_MIN_MODULUS} Bit)`, skill: 'cisco.remote_administration.rsa_keys', type: REQUIREMENT_TYPE.STATE, ok: rsaKey },
      { id: 'ssh_version', label: 'SSH Version 2', skill: 'cisco.remote_administration.ssh_version', type: REQUIREMENT_TYPE.STATE, ok: sshVersion },
      { id: 'vty_login_local', label: 'VTY login local', skill: 'cisco.remote_administration.vty_login_local', type: REQUIREMENT_TYPE.STATE, ok: loginLocal },
      { id: 'vty_transport_ssh', label: 'VTY transport input ssh (kein Telnet)', skill: 'cisco.remote_administration.vty_transport_ssh', type: REQUIREMENT_TYPE.STATE, ok: transportSsh },
      { id: 'user_exists', label: `Benutzer ${params.username} vorhanden`, skill: 'cisco.remote_administration.local_user', type: REQUIREMENT_TYPE.STATE, ok: userExists },
    ];
    return { checks, allCorrect: checks.every((c) => c.ok) };
  },
  buildTitle(params, archetype) {
    return archetype === MISSION_ARCHETYPE.INCIDENT ? `SSH-Ausfall auf ${params.hostname}` : `SSH-Fehler auf ${params.hostname}`;
  },
  buildBriefing(params, archetype, context, difficulty) {
    const faultText = {
      wrong_gateway: 'Die Management-IP ist korrekt, aber das Default Gateway zeigt offenbar ins Leere.',
      missing_login_local: 'SSH ist erreichbar, aber die Anmeldung gegen die lokalen Benutzer ("login local") scheint zu fehlen.',
      missing_rsa: 'Es fehlt offenbar ein gültiger RSA-Schlüssel.',
      wrong_ssh_version: 'SSH scheint nicht auf Version 2 erzwungen zu sein.',
      telnet_still_allowed: 'Die VTY-Leitungen scheinen noch unverschlüsseltes Telnet zuzulassen.',
      missing_user: 'Der erwartete Benutzer scheint auf dem Gerät zu fehlen.',
    }[params.faultId] || 'Eine Einstellung verhindert den SSH-Zugriff.';
    if (difficulty === DIFFICULTY_PROFILE.EASY) {
      return `Auf ${params.hostname} funktioniert die SSH-Fernwartung nicht mehr, obwohl sie vorher lief.\n\nHinweis: ${faultText} Finde und behebe den Fehler.`;
    }
    return `Auf ${params.hostname} klappt der SSH-Zugriff plötzlich nicht mehr, obwohl bisher alles funktioniert hat. Diagnostiziere die Ursache in der Kette VLAN/SVI/Gateway/Domain/RSA/SSH-Version/VTY und behebe sie.`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return {
      skillGroup: 'remote_administration_diagnose', archetype, context, hostname: params.hostname, faultId: params.faultId,
    };
  },
});

export const TEMPLATE_REGISTRY = {
  [TEMPLATE_BASIC_CONFIG_HARDENING.id]: TEMPLATE_BASIC_CONFIG_HARDENING,
  [TEMPLATE_VLAN_ACCESS_PORT.id]: TEMPLATE_VLAN_ACCESS_PORT,
  [TEMPLATE_VLAN_ACCESS_RANGE.id]: TEMPLATE_VLAN_ACCESS_RANGE,
  [TEMPLATE_VLAN_MOVE.id]: TEMPLATE_VLAN_MOVE,
  [TEMPLATE_TRUNK_UPLINK.id]: TEMPLATE_TRUNK_UPLINK,
  [TEMPLATE_TRUNK_ALLOWED_VLAN.id]: TEMPLATE_TRUNK_ALLOWED_VLAN,
  [TEMPLATE_ROUTER_ON_A_STICK.id]: TEMPLATE_ROUTER_ON_A_STICK,
  [TEMPLATE_ROUTER_FAULT.id]: TEMPLATE_ROUTER_FAULT,
  [TEMPLATE_SSH_MANAGEMENT_ACCESS.id]: TEMPLATE_SSH_MANAGEMENT_ACCESS,
  [TEMPLATE_SSH_ENABLE.id]: TEMPLATE_SSH_ENABLE,
  [TEMPLATE_SSH_VTY_ACCESS.id]: TEMPLATE_SSH_VTY_ACCESS,
  [TEMPLATE_SSH_DIAGNOSE.id]: TEMPLATE_SSH_DIAGNOSE,
};

export function getTemplate(id) {
  return TEMPLATE_REGISTRY[id] || null;
}

export function allTemplates() {
  return Object.values(TEMPLATE_REGISTRY);
}
