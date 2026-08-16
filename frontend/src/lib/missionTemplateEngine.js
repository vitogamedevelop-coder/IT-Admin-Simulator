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

import { createCiscoDevice } from './ciscoCliEngine.js';
import { defineHintLadder } from './missionHintSystem.js';
import { randomPersonalUsername } from './officeWorld.js';

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

export const TEMPLATE_BASIC_CONFIG_HARDENING = defineMissionTemplate({
  id: 'cisco-basic-config-hardening',
  domain: 'cisco',
  requiredSkills: [
    'cisco.basic_configuration.hostname',
    'cisco.basic_configuration.enable_secret',
    'cisco.basic_configuration.local_user',
    'cisco.basic_configuration.disable_dns_lookup',
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
    'cisco.basic_configuration.save_config': defineHintLadder({
      subskillPath: 'cisco.basic_configuration.save_config',
      nudge: 'Ohne Speichern geht die Konfiguration beim Neustart verloren.',
      focus: 'Kopiere die Running-Config in die Startup-Config.',
      directive: 'Verwende "copy running-config startup-config" oder "write".',
      solution: { answer: 'copy running-config startup-config', explanation: '"copy running-config startup-config" (oder "write") sichert die Konfiguration dauerhaft.' },
    }),
  },
  resolveParameters(rng, archetype, context) {
    const targetHostname = generateHostname(rng, context);
    const { type: usernameType, name: username } = generateUsername(rng);
    const enableSecret = generateSecret(rng);
    const userSecret = generateSecret(rng);
    return {
      initialHostname: archetype === MISSION_ARCHETYPE.AUDIT ? targetHostname : 'Switch',
      targetHostname,
      usernameType,
      username,
      enableSecret,
      userSecret,
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
      // Audit: partially compliant. Hostname and DNS lookup are already
      // correct, but the enable secret / local user / save are still
      // missing - the player must find and close the remaining gaps.
      device.runningConfig.noIpDomainLookup = true;
    }
    return { device };
  },
  evaluate(device, params) {
    const rc = device.runningConfig;
    const usernameType = params.usernameType || 'personal';
    const userLabel = usernameType === 'personal' ? 'Benutzer' : 'Konto';
    const checks = [
      { id: 'hostname', label: `Hostname: ${params.targetHostname}`, ok: device.hostname === params.targetHostname },
      { id: 'enable_secret', label: 'Enable Secret gesetzt', ok: !!rc.enableSecret },
      { id: 'local_user', label: `${userLabel}: ${params.username}`, ok: !!(rc.users[params.username]?.secret || rc.users[params.username]?.password) },
      { id: 'no_dns_lookup', label: 'DNS-Lookup deaktiviert', ok: !!rc.noIpDomainLookup },
      {
        id: 'save_config',
        label: 'Konfiguration gespeichert',
        ok: device.startupConfig !== null
          && device.startupConfig.hostname === params.targetHostname
          && !!device.startupConfig.enableSecret
          && !!(device.startupConfig.users[params.username]?.secret || device.startupConfig.users[params.username]?.password)
          && !!device.startupConfig.noIpDomainLookup,
      },
    ];
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

    const usernameType = params.usernameType || 'personal';
    const userLabel = usernameType === 'personal' ? 'lokaler Benutzer' : 'administratives Konto';
    if (archetype === MISSION_ARCHETYPE.AUDIT) {
      return `${contextText}\n\nPrüfe ${params.targetHostname} gegen den NEXUS-Standard:\n- Hostname: ${params.targetHostname}\n- enable secret gesetzt\n- ${userLabel}: ${params.username}\n- DNS-Lookup deaktiviert\n- Konfiguration gespeichert\n\nSchließe alle noch offenen Lücken.`;
    }
    return `${contextText}\n\nAuftrag für ${params.targetHostname}:\n- Hostname: ${params.targetHostname}\n- enable secret setzen\n- ${userLabel}: ${params.username}\n- DNS-Lookup deaktivieren\n- Konfiguration speichern`;
  },
  antiRepetitionMetadata(params, archetype, context) {
    return { skillGroup: 'basic_configuration', archetype, context, hostname: params.targetHostname };
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
      { id: 'vlan_created', label: `VLAN ${params.vlanId} ${params.vlanName}`, ok: vlanOk },
      { id: 'ports_configured', label: 'Access-Port(s) im richtigen VLAN', ok: portsOk },
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
        return `${params.employee} meldet: ihr Rechner an ${params.hostname} erreicht die falschen Systeme.\n\nFinde die Ursache und stelle sicher, dass der Port in VLAN ${params.vlanId} ${params.vlanName} liegt.`;
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

export const TEMPLATE_REGISTRY = {
  [TEMPLATE_BASIC_CONFIG_HARDENING.id]: TEMPLATE_BASIC_CONFIG_HARDENING,
  [TEMPLATE_VLAN_ACCESS_PORT.id]: TEMPLATE_VLAN_ACCESS_PORT,
};

export function getTemplate(id) {
  return TEMPLATE_REGISTRY[id] || null;
}

export function allTemplates() {
  return Object.values(TEMPLATE_REGISTRY);
}
