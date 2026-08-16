// Mission System V2 – data-driven main missions using the Cisco CLI engine.
//
// Defines playable main missions and a small runtime that evaluates the
// simulated Cisco device state instead of a fixed command sequence.

import { createCiscoDevice, executeCommand } from './ciscoCliEngine.js';
import { recordSkillEvent, SKILL_DIMENSION, SKILL_SOURCE } from './skillTree.js';
import {
  HINT_LEVEL_LABELS, createHintState, getNextHint, consumeHint, revealSolution, defineHintLadder,
} from './missionHintSystem.js';
import { registerMission, updateMissionStatus, MissionStatus } from './missionLog.js';

export const MISSION_001_ID = 'cisco-main-001';
export const MISSION_002_ID = 'cisco-main-002';

// Ordered list of every hand-built main mission that currently exists, in
// curriculum order. This is the single place that needs to be extended when
// a new main mission is added - everything that depends on "what is the
// current end of content" (Phase 1H content-end detection, the procedural
// generator's unlock check) reads this list instead of hardcoding an ID.
export const MAIN_MISSION_ORDER = [MISSION_001_ID, MISSION_002_ID];

export function getHighestImplementedMainMissionId() {
  return MAIN_MISSION_ORDER[MAIN_MISSION_ORDER.length - 1] || null;
}

const ACTIVE_MISSION_KEY = 'cyberlearn:active-main-mission-v1';

// ============================================================================
// Helpers
// ============================================================================

function hasUserCredential(user) {
  return !!user && (!!user.secret || !!user.password);
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const SECRET_WORDS = ['cisco', 'nexus', 'switch', 'admin', 'netlab'];
const SECRET_SUFFIXES = ['101', '202', '303', '404', '505'];

function generateSecret(rng) {
  return `${pick(SECRET_WORDS)}${pick(SECRET_SUFFIXES)}${rng(1, 9)}`;
}

function seededRng(seed) {
  let s = seed;
  return function rand(min, max) {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return Math.floor((s / 2 ** 32) * (max - min + 1)) + min;
  };
}

// ============================================================================
// Mission 001: Der erste Switch
// ============================================================================

const INITIAL_HOSTNAME_001 = 'Switch';
const TARGET_HOSTNAME_001 = 'Sw1';
const DEFAULT_USERNAME_001 = 'admin';

export function generateMission001Scenario(seed = Date.now()) {
  const rng = seededRng(seed);
  const enableSecret = generateSecret(rng);
  const userSecret = generateSecret(rng);

  return {
    missionId: MISSION_001_ID,
    title: 'Der erste Switch',
    seed,
    deviceType: 'layer2_switch',
    initialHostname: INITIAL_HOSTNAME_001,
    parameters: {
      targetHostname: TARGET_HOSTNAME_001,
      username: DEFAULT_USERNAME_001,
      enableSecret,
      userSecret,
    },
    briefing: `Für NEXUS wurde ein neuer Cisco Layer-2-Switch geliefert.\n\nAuftrag:\n- Gerätetyp: Cisco Layer-2-Switch\n- Aktueller Name: ${INITIAL_HOSTNAME_001}\n- Zielname: ${TARGET_HOSTNAME_001}\n\nAnforderungen:\n1. Gerätenamen auf ${TARGET_HOSTNAME_001} setzen\n2. privilegierten Zugriff mit enable secret absichern\n3. lokalen Benutzer ${DEFAULT_USERNAME_001} mit Passwort anlegen\n4. unnötige DNS-Lookups deaktivieren\n5. Konfiguration dauerhaft speichern`,
  };
}

export function createMission001Device(scenario) {
  return createCiscoDevice({
    type: 'layer2_switch',
    hostname: scenario.initialHostname || INITIAL_HOSTNAME_001,
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

function _getMission001Progress(device, scenario) {
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

export function getMission001Progress(device, scenario) {
  return _getMission001Progress(device, scenario);
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

function _evaluateMission001State(device, scenario) {
  const progress = _getMission001Progress(device, scenario);
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

export function evaluateMission001State(device, scenario) {
  return _evaluateMission001State(device, scenario);
}

const HINT_LADDERS_001 = {
  hostname: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.hostname',
    nudge: 'Ein Netzwerkgerät sollte im Betrieb eindeutig identifizierbar sein.',
    focus: 'Prüfe den aktuellen Gerätenamen des Switches.',
    directive: 'Der Gerätename wird im Global Configuration Mode gesetzt.',
    solution: {
      answer: 'hostname Sw1',
      explanation: 'Mit "hostname Sw1" wechselt der Prompt sofort zu Sw1(config)#. Der Name hilf, das Gerät in der Konfiguration und in der Netzwerkübersicht zu erkennen.',
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
// Mission 002: Neue Abteilung (zwei VLANs, Parking-VLAN, Uplink-Trunk)
// ============================================================================
//
// Sw2 wird für zwei logisch getrennte Arbeitsplatzbereiche (Personal und
// Buchhaltung) vorbereitet. Die Mission bildet die drei zentralen Layer-2-
// Rollen an einem Gerät ab:
//   - Access Port  -> Client, genau ein produktives VLAN
//   - Trunk Port   -> Uplink zur restlichen Infrastruktur, mehrere VLANs
//   - Parking VLAN -> ungenutzte Ports, isoliert und administrativ down
//
// VLAN 999 "UNUSED" ist eine NEXUS-interne Konvention für dieses Parking-VLAN,
// keine Cisco-Vorgabe.

const TARGET_HOSTNAME_002 = 'Sw2';
const PERSONAL_VLAN_ID = 10;
const PERSONAL_VLAN_NAME = 'PERSONAL';
const BUCHHALTUNG_VLAN_ID = 20;
const BUCHHALTUNG_VLAN_NAME = 'BUCHHALTUNG';
const PARKING_VLAN_ID_002 = 999;
const PARKING_VLAN_NAME_002 = 'UNUSED';
const PERSONAL_PORTS_002 = ['FastEthernet0/1', 'FastEthernet0/2'];
const BUCHHALTUNG_PORTS_002 = ['FastEthernet0/3', 'FastEthernet0/4'];
const UNUSED_PORTS_002 = ['FastEthernet0/5', 'FastEthernet0/6', 'FastEthernet0/7', 'FastEthernet0/8'];
const UPLINK_PORT_002 = 'GigabitEthernet0/1';

const VERIFY_HINTS_002 = ['show vlan brief', 'show interfaces trunk', 'show interfaces status', 'switchport', 'show running-config'];

export function generateMission002Scenario(seed = Date.now()) {
  return {
    missionId: MISSION_002_ID,
    title: 'Neue Abteilung',
    seed,
    deviceType: 'layer2_switch',
    initialHostname: TARGET_HOSTNAME_002,
    parameters: {
      targetHostname: TARGET_HOSTNAME_002,
      personalVlanId: PERSONAL_VLAN_ID,
      personalVlanName: PERSONAL_VLAN_NAME,
      personalPorts: PERSONAL_PORTS_002,
      buchhaltungVlanId: BUCHHALTUNG_VLAN_ID,
      buchhaltungVlanName: BUCHHALTUNG_VLAN_NAME,
      buchhaltungPorts: BUCHHALTUNG_PORTS_002,
      parkingVlanId: PARKING_VLAN_ID_002,
      parkingVlanName: PARKING_VLAN_NAME_002,
      unusedPorts: UNUSED_PORTS_002,
      uplinkPort: UPLINK_PORT_002,
    },
    briefing: `Moin,\n\nder Bürobereich wird gerade neu gepatcht.\n\nPersonal und Buchhaltung hängen künftig am selben Access-Switch, sollen aber logisch getrennt bleiben.\n\n${TARGET_HOSTNAME_002} ist bereits grundkonfiguriert.\n\nRichte bitte die beiden Bereiche ein und bereite den Uplink vor.\n\nVorgaben:\n\nPersonal:\nVLAN ${PERSONAL_VLAN_ID}\n\nBuchhaltung:\nVLAN ${BUCHHALTUNG_VLAN_ID}\n\nUnser Parking-VLAN für ungenutzte Anschlüsse:\nVLAN ${PARKING_VLAN_ID_002} / ${PARKING_VLAN_NAME_002}\n\nPrüf vorher kurz, welche Ports auf ${TARGET_HOSTNAME_002} vorhanden und bereits belegt sind. Offene Anschlüsse sollen nicht aktiv bleiben.\n\n– Sam`,
  };
}

export function createMission002Device(scenario) {
  const device = createCiscoDevice({
    profile: 'catalyst_8fe_1ge',
    hostname: scenario.initialHostname || TARGET_HOSTNAME_002,
  });

  const params = scenario.parameters;

  // Personal + Buchhaltung: workstations are already cabled and powered on,
  // but not yet configured (no switchport mode/VLAN set).
  [...params.personalPorts, ...params.buchhaltungPorts].forEach((id) => {
    const iface = device.runningConfig.interfaces[id];
    if (iface) {
      iface.operationalStatus = 'connected';
      iface.administrativelyDown = false;
    }
  });

  // Unused ports are currently open (not shut down) in the default VLAN -
  // exactly the "offene Anschlüsse" the briefing warns about.
  params.unusedPorts.forEach((id) => {
    const iface = device.runningConfig.interfaces[id];
    if (iface) {
      iface.operationalStatus = 'notconnect';
      iface.administrativelyDown = false;
    }
  });

  // Uplink is already cabled towards the rest of the infrastructure, but
  // still needs to become a trunk.
  const uplink = device.runningConfig.interfaces[params.uplinkPort];
  if (uplink) {
    uplink.operationalStatus = 'connected';
    uplink.administrativelyDown = false;
  }

  return device;
}

export const MISSION_002_REQUIREMENTS = [
  { id: 'vlan_personal', label: `VLAN ${PERSONAL_VLAN_ID} ${PERSONAL_VLAN_NAME}`, skill: 'cisco.layer2.vlan_creation' },
  { id: 'vlan_buchhaltung', label: `VLAN ${BUCHHALTUNG_VLAN_ID} ${BUCHHALTUNG_VLAN_NAME}`, skill: 'cisco.layer2.vlan_creation' },
  { id: 'access_ports_configured', label: 'Arbeitsplatzports als Access Ports im richtigen VLAN', skill: 'cisco.layer2.access_ports' },
  { id: 'unused_ports_parked', label: 'Ungenutzte Ports im Parking-VLAN und deaktiviert', skill: 'cisco.layer2.shutdown' },
  { id: 'uplink_trunk', label: 'Uplink als Trunk vorbereitet', skill: 'cisco.layer2.trunking' },
  { id: 'verified_and_saved', label: 'Konfiguration geprüft und dauerhaft gespeichert', skill: 'cisco.basic_configuration.save_config' },
];

const HINT_LADDERS_002 = {
  vlan_personal: defineHintLadder({
    subskillPath: 'cisco.layer2.vlan_creation',
    nudge: 'Bevor Ports einem VLAN zugeordnet werden können, muss das VLAN existieren.',
    focus: 'Wechsle in den VLAN-Konfigurationsmodus und gib dem VLAN einen sprechenden Namen.',
    directive: `Verwende "vlan ${PERSONAL_VLAN_ID}" gefolgt von "name ${PERSONAL_VLAN_NAME}" im Global Configuration Mode.`,
    solution: {
      answer: `vlan ${PERSONAL_VLAN_ID}\nname ${PERSONAL_VLAN_NAME}\nexit`,
      explanation: 'Mit "vlan <id>" wechselst du in den VLAN-Config-Modus. "name <name>" vergibt die Bezeichnung.',
    },
  }),
  vlan_buchhaltung: defineHintLadder({
    subskillPath: 'cisco.layer2.vlan_creation',
    nudge: 'Die Buchhaltung braucht ein eigenes, zweites VLAN.',
    focus: 'Lege ein zweites VLAN für die Buchhaltung an.',
    directive: `Verwende "vlan ${BUCHHALTUNG_VLAN_ID}" gefolgt von "name ${BUCHHALTUNG_VLAN_NAME}".`,
    solution: {
      answer: `vlan ${BUCHHALTUNG_VLAN_ID}\nname ${BUCHHALTUNG_VLAN_NAME}\nexit`,
      explanation: 'Jede Abteilung, die logisch getrennt sein soll, bekommt ihr eigenes VLAN.',
    },
  }),
  access_ports_configured: defineHintLadder({
    subskillPath: 'cisco.layer2.access_ports',
    nudge: 'Access-Ports gehören zu genau einem VLAN.',
    focus: 'Ordne die Arbeitsplatzports beider Abteilungen ihrem jeweiligen VLAN zu.',
    directive: 'Nutze "interface range" für die Personal- und die Buchhaltungsports und setze jeweils "switchport mode access" sowie "switchport access vlan <id>".',
    solution: {
      answer: `interface range fa0/1 - 4\nswitchport mode access\nswitchport access vlan ${PERSONAL_VLAN_ID}\nexit\ninterface range fa0/5 - 8\nswitchport mode access\nswitchport access vlan ${BUCHHALTUNG_VLAN_ID}\nexit`,
      explanation: 'Im Interface-Range-Modus werden alle Befehle auf alle ausgewählten Ports angewendet.',
    },
  }),
  unused_ports_parked: defineHintLadder({
    subskillPath: 'cisco.layer2.shutdown',
    nudge: 'Ports, die aktuell niemand nutzt, sollten nicht offen und im Standard-VLAN bleiben.',
    focus: `Finde heraus, welche Ports noch frei sind, und verschiebe sie in das Parking-VLAN ${PARKING_VLAN_ID_002}.`,
    directive: `Nutze "show interfaces status", um freie Ports zu erkennen. Setze sie per Interface-Range in VLAN ${PARKING_VLAN_ID_002} und fahre sie mit "shutdown" herunter.`,
    solution: {
      answer: `vlan ${PARKING_VLAN_ID_002}\nname ${PARKING_VLAN_NAME_002}\nexit\ninterface range fa0/9 - 24\nswitchport mode access\nswitchport access vlan ${PARKING_VLAN_ID_002}\nshutdown\nexit`,
      explanation: 'Ungenutzte Accessports gehören nach NEXUS-Standard in ein dediziertes Parking-VLAN und werden administrativ deaktiviert.',
    },
  }),
  uplink_trunk: defineHintLadder({
    subskillPath: 'cisco.layer2.trunking',
    nudge: 'Zwischen Switches werden mehrere VLANs über eine einzige Verbindung transportiert.',
    focus: `Der Uplink (${UPLINK_PORT_002}) verbindet Sw2 mit der restlichen Infrastruktur und muss beide VLANs transportieren können.`,
    directive: 'Wechsle auf die Uplink-Schnittstelle und setze "switchport mode trunk". Fahre den Uplink nicht herunter und weise ihm kein Access-VLAN zu.',
    solution: {
      answer: 'interface gi0/1\nswitchport mode trunk\nexit',
      explanation: 'Ein Trunk-Port transportiert mehrere VLANs gleichzeitig und wird für Switch-zu-Switch- bzw. Switch-zu-Infrastruktur-Verbindungen verwendet.',
    },
  }),
  verified_and_saved: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.save_config',
    nudge: 'Ohne Prüfen und Speichern ist die Arbeit nicht abgeschlossen.',
    focus: 'Kontrolliere VLANs, Ports und den Uplink, bevor du die Konfiguration sicherst.',
    directive: '"show vlan brief" oder "show interfaces trunk" zur Kontrolle, danach "copy running-config startup-config" (oder "write") zum Speichern.',
    solution: {
      answer: 'show vlan brief\ncopy running-config startup-config',
      explanation: '"show vlan brief"/"show interfaces trunk" zeigen den aktuellen Zustand. "copy running-config startup-config" (oder "write") sichert ihn dauerhaft.',
    },
  }),
};

function accessPortsOk(interfaces, vlanId) {
  return interfaces.length > 0
    && interfaces.every((iface) => iface.switchportMode === 'access'
      && iface.accessVlan === vlanId
      && !iface.administrativelyDown);
}

function parkedPortsOk(interfaces, parkingVlanId) {
  return interfaces.length > 0
    && interfaces.every((iface) => iface.switchportMode === 'access'
      && iface.accessVlan === parkingVlanId
      && iface.administrativelyDown);
}

function uplinkTrunkOk(iface, parkingVlanId) {
  if (!iface) return false;
  if (iface.switchportMode !== 'trunk') return false;
  if (iface.administrativelyDown) return false;
  if (iface.accessVlan === parkingVlanId) return false;
  if (iface.trunkAllowedVlans && iface.trunkAllowedVlans.includes(parkingVlanId)) return false;
  return true;
}

function _getMission002Progress(device, scenario, state = null) {
  const p = scenario.parameters;
  const rc = device.runningConfig;

  const personalVlan = rc.vlans?.[p.personalVlanId];
  const vlanPersonal = !!personalVlan && personalVlan.name === p.personalVlanName;

  const buchhaltungVlan = rc.vlans?.[p.buchhaltungVlanId];
  const vlanBuchhaltung = !!buchhaltungVlan && buchhaltungVlan.name === p.buchhaltungVlanName;

  const personalInterfaces = p.personalPorts.map((id) => rc.interfaces[id]).filter(Boolean);
  const buchhaltungInterfaces = p.buchhaltungPorts.map((id) => rc.interfaces[id]).filter(Boolean);
  const accessPortsConfigured = accessPortsOk(personalInterfaces, p.personalVlanId)
    && accessPortsOk(buchhaltungInterfaces, p.buchhaltungVlanId);

  const unusedInterfaces = p.unusedPorts.map((id) => rc.interfaces[id]).filter(Boolean);
  const unusedPortsParked = parkedPortsOk(unusedInterfaces, p.parkingVlanId);

  const uplinkInterface = rc.interfaces[p.uplinkPort];
  const uplinkTrunk = uplinkTrunkOk(uplinkInterface, p.parkingVlanId);

  const verified = (state?.showCommandsUsed || []).some((c) => VERIFY_HINTS_002.some((v) => c.includes(v)));

  let saved = false;
  if (device.startupConfig !== null) {
    const sc = device.startupConfig;
    const savedPersonal = p.personalPorts.map((id) => sc.interfaces[id]).filter(Boolean);
    const savedBuchhaltung = p.buchhaltungPorts.map((id) => sc.interfaces[id]).filter(Boolean);
    const savedUnused = p.unusedPorts.map((id) => sc.interfaces[id]).filter(Boolean);
    const savedUplink = sc.interfaces[p.uplinkPort];
    saved = sc.vlans?.[p.personalVlanId]?.name === p.personalVlanName
      && sc.vlans?.[p.buchhaltungVlanId]?.name === p.buchhaltungVlanName
      && accessPortsOk(savedPersonal, p.personalVlanId)
      && accessPortsOk(savedBuchhaltung, p.buchhaltungVlanId)
      && parkedPortsOk(savedUnused, p.parkingVlanId)
      && uplinkTrunkOk(savedUplink, p.parkingVlanId);
  }

  const checks = {
    vlan_personal: vlanPersonal,
    vlan_buchhaltung: vlanBuchhaltung,
    access_ports_configured: accessPortsConfigured,
    unused_ports_parked: unusedPortsParked,
    uplink_trunk: uplinkTrunk,
    verified_and_saved: verified && saved,
  };

  const completed = MISSION_002_REQUIREMENTS.filter((r) => checks[r.id]).length;
  const total = MISSION_002_REQUIREMENTS.length;

  return {
    completed,
    total,
    checks: MISSION_002_REQUIREMENTS.map((r) => ({ ...r, ok: checks[r.id] })),
    allCorrect: completed === total,
  };
}

function _evaluateMission002State(device, scenario, state = null) {
  const progress = _getMission002Progress(device, scenario, state);
  const misconceptions = [];

  if (!progress.checks.find((c) => c.id === 'verified_and_saved').ok && progress.completed > 0) {
    misconceptions.push('forgot_save_config');
  }

  return {
    ...progress,
    allCorrect: progress.allCorrect,
    misconceptions,
  };
}

// ============================================================================
// Registry
// ============================================================================

const SCENARIO_GENERATORS = {
  [MISSION_001_ID]: generateMission001Scenario,
  [MISSION_002_ID]: generateMission002Scenario,
};

const DEVICE_CREATORS = {
  [MISSION_001_ID]: createMission001Device,
  [MISSION_002_ID]: createMission002Device,
};

const PROGRESS_GETTERS = {
  [MISSION_001_ID]: _getMission001Progress,
  [MISSION_002_ID]: _getMission002Progress,
};

const EVALUATORS = {
  [MISSION_001_ID]: _evaluateMission001State,
  [MISSION_002_ID]: _evaluateMission002State,
};

const REQUIREMENTS = {
  [MISSION_001_ID]: MISSION_001_REQUIREMENTS,
  [MISSION_002_ID]: MISSION_002_REQUIREMENTS,
};

const HINT_LADDERS_BY_MISSION = {
  [MISSION_001_ID]: HINT_LADDERS_001,
  [MISSION_002_ID]: HINT_LADDERS_002,
};

// ============================================================================
// Generic runtime
// ============================================================================

export function isMainMission(missionId) {
  return Object.prototype.hasOwnProperty.call(SCENARIO_GENERATORS, missionId);
}

function getHINT_LADDERS(missionId) {
  return HINT_LADDERS_BY_MISSION[missionId] || {};
}

export function getMainMissionRequirements(missionId) {
  return REQUIREMENTS[missionId] || [];
}

export function startMainMission(missionId, seed = Date.now()) {
  const scenario = SCENARIO_GENERATORS[missionId](seed);
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
  localStorage.setItem(ACTIVE_MISSION_KEY, JSON.stringify({
    missionId,
    scenario,
    device,
    startedAt: state.startedAt,
    completed: false,
  }));
  registerMission({ instanceId: String(scenario.seed), questId: missionId, source: 'main', title: scenario.title });
  updateMissionStatus(String(scenario.seed), MissionStatus.IN_PROGRESS);
  return state;
}

export function startMission001(seed = Date.now()) {
  return startMainMission(MISSION_001_ID, seed);
}

export function startMission002(seed = Date.now()) {
  return startMainMission(MISSION_002_ID, seed);
}

export function loadActiveMainMission(expectedMissionId = null) {
  try {
    const raw = localStorage.getItem(ACTIVE_MISSION_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (expectedMissionId && saved.missionId !== expectedMissionId) return null;
    if (!isMainMission(saved.missionId)) return null;
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

export function loadActiveMission(expectedMissionId = null) {
  return loadActiveMainMission(expectedMissionId);
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

export function getMainMissionProgress(state) {
  const getter = PROGRESS_GETTERS[state.missionId];
  return getter ? getter(state.device, state.scenario, state) : { completed: 0, total: 0, checks: [], allCorrect: false };
}

export function evaluateMainMission(state) {
  const evaluator = EVALUATORS[state.missionId];
  const evaluation = evaluator ? evaluator(state.device, state.scenario, state) : { completed: 0, total: 0, checks: [], allCorrect: false, misconceptions: [] };
  state.attempts += 1;

  if (evaluation.allCorrect) {
    state.completed = true;
    updateMissionStatus(String(state.scenario.seed), MissionStatus.COMPLETED);
  }

  saveActiveMission(state);
  return { ...evaluation, state };
}

export function evaluateMission001(state) {
  return evaluateMainMission(state);
}

export function getMissionHint(state, requirementId) {
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

export function consumeMissionHint(state, requirementId) {
  const ladder = getHINT_LADDERS(state.missionId)[requirementId];
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
  saveActiveMission(state);
  return { state, answer, explanation };
}

function getFeedbackTitle(state) {
  return state.completed ? 'Auftrag abgeschlossen' : 'Auftrag noch nicht vollständig';
}

export function mainMissionFeedback(state, evaluation) {
  const progress = getMainMissionProgress(state);
  return {
    title: getFeedbackTitle(state),
    completed: progress.completed,
    total: progress.total,
    checks: progress.checks,
    hintsUsed: state.hintsConsumed.length,
    solutionRevealed: state.solutionRevealedFor.length,
    showCommandsUsed: state.showCommandsUsed.length,
    mistakes: evaluation.misconceptions,
  };
}

export function mission001Feedback(state, evaluation) {
  return mainMissionFeedback(state, evaluation);
}
