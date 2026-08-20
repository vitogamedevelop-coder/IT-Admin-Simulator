// Mission System V2 – data-driven main missions using the Cisco CLI engine.
//
// Defines playable main missions and a small runtime that evaluates the
// simulated Cisco device state instead of a fixed command sequence.

import { createCiscoDevice, executeCommand, evaluateRouterOnAStick } from './ciscoCliEngine.js';
import { recordSkillEvent, SKILL_DIMENSION, SKILL_SOURCE } from './skillTree.js';
import {
  HINT_LEVEL_LABELS, createHintState, getNextHint, consumeHint, revealSolution, defineHintLadder,
} from './missionHintSystem.js';
import { registerMission, updateMissionStatus, MissionStatus } from './missionLog.js';
import { getKnownCredentials } from './credentials.js';

export const MISSION_001_ID = 'cisco-main-001';
export const MISSION_002_ID = 'cisco-main-002';
export const MISSION_003_ID = 'cisco-main-003';
export const MISSION_004_ID = 'cisco-main-004';

// Ordered list of every hand-built main mission that currently exists, in
// curriculum order. This is the single place that needs to be extended when
// a new main mission is added - everything that depends on "what is the
// current end of content" (Phase 1H content-end detection, the procedural
// generator's unlock check) reads this list instead of hardcoding an ID.
export const MAIN_MISSION_ORDER = [MISSION_001_ID, MISSION_002_ID, MISSION_003_ID, MISSION_004_ID];

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
const PERSONAL_PORTS_002 = ['FastEthernet0/1'];
const BUCHHALTUNG_PORTS_002 = ['FastEthernet0/2'];
const UNUSED_PORTS_002 = [
  'FastEthernet0/3', 'FastEthernet0/4', 'FastEthernet0/5', 'FastEthernet0/6',
  'FastEthernet0/7', 'FastEthernet0/8',
];
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
    briefing: `Moin,\n\ndie Personal- und Buchhaltungsabteilung ziehen auf einen kleinen Etagen-Switch um. Beide Bereiche sollen logisch getrennt bleiben.\n\nAn ${TARGET_HOSTNAME_002} hängen derzeit:\n- ein Arbeitsplatz Personal an Fa0/1\n- ein Arbeitsplatz Buchhaltung an Fa0/2\n- Gi0/1 führt zum restlichen Netz\n\nDie übrigen FastEthernet-Anschlüsse werden aktuell nicht genutzt und sollen nicht aktiv herumliegen.\n\nVorgaben:\n\nPersonal:\nVLAN ${PERSONAL_VLAN_ID} / ${PERSONAL_VLAN_NAME}\n\nBuchhaltung:\nVLAN ${BUCHHALTUNG_VLAN_ID} / ${BUCHHALTUNG_VLAN_NAME}\n\nNEXUS Parking-VLAN für ungenutzte Anschlüsse:\nVLAN ${PARKING_VLAN_ID_002} / ${PARKING_VLAN_NAME_002}\n\nDer Uplink muss den Verkehr der produktiven VLANs weitergeben können.\n\nPrüfe die Konfiguration vor dem Speichern kurz und speichere sie dann dauerhaft.\n\n– Sam`,
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
  { id: 'vlan_personal', label: `VLAN ${PERSONAL_VLAN_ID} / ${PERSONAL_VLAN_NAME}`, skill: 'cisco.layer2.vlan_creation', type: 'state' },
  { id: 'vlan_buchhaltung', label: `VLAN ${BUCHHALTUNG_VLAN_ID} / ${BUCHHALTUNG_VLAN_NAME}`, skill: 'cisco.layer2.vlan_creation', type: 'state' },
  { id: 'vlan_unused', label: `VLAN ${PARKING_VLAN_ID_002} / ${PARKING_VLAN_NAME_002}`, skill: 'cisco.layer2.vlan_creation', type: 'state' },
  { id: 'personal_port', label: `Fa0/1 Access VLAN ${PERSONAL_VLAN_ID}`, skill: 'cisco.layer2.access_ports', type: 'state' },
  { id: 'buchhaltung_port', label: `Fa0/2 Access VLAN ${BUCHHALTUNG_VLAN_ID}`, skill: 'cisco.layer2.access_ports', type: 'state' },
  { id: 'unused_ports_parked', label: 'Fa0/3–Fa0/8 Parking-VLAN und deaktiviert', skill: 'cisco.layer2.shutdown', type: 'state' },
  { id: 'uplink_trunk', label: 'Gi0/1 Trunk', skill: 'cisco.layer2.trunking', type: 'state' },
  { id: 'verified', label: 'Konfiguration geprüft', skill: 'cisco.basic_configuration.verify_running_config', type: 'verification' },
  { id: 'saved', label: 'Konfiguration dauerhaft gespeichert', skill: 'cisco.basic_configuration.save_config', type: 'persistence' },
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
  vlan_unused: defineHintLadder({
    subskillPath: 'cisco.layer2.vlan_creation',
    nudge: 'Auch das Parking-VLAN braucht einen eindeutigen Namen, bevor du Ports hinein verschiebst.',
    focus: `Lege das Parking-VLAN ${PARKING_VLAN_ID_002} an.`,
    directive: `Verwende "vlan ${PARKING_VLAN_ID_002}" gefolgt von "name ${PARKING_VLAN_NAME_002}".`,
    solution: {
      answer: `vlan ${PARKING_VLAN_ID_002}\nname ${PARKING_VLAN_NAME_002}\nexit`,
      explanation: 'Das Parking-VLAN nimmt nicht genutzte Access-Ports auf.',
    },
  }),
  personal_port: defineHintLadder({
    subskillPath: 'cisco.layer2.access_ports',
    nudge: 'Der Personal-Arbeitsplatz hängt an Fa0/1.',
    focus: `Setze Fa0/1 auf Access-Modus und ordne ihn VLAN ${PERSONAL_VLAN_ID} zu.`,
    directive: 'Verwende "interface fa0/1", "switchport mode access" und "switchport access vlan 10".',
    solution: {
      answer: `interface fa0/1\nswitchport mode access\nswitchport access vlan ${PERSONAL_VLAN_ID}\nexit`,
      explanation: 'Ein Access-Port gehört genau einem VLAN an.',
    },
  }),
  buchhaltung_port: defineHintLadder({
    subskillPath: 'cisco.layer2.access_ports',
    nudge: 'Der Buchhaltungs-Arbeitsplatz hängt an Fa0/2.',
    focus: `Setze Fa0/2 auf Access-Modus und ordne ihn VLAN ${BUCHHALTUNG_VLAN_ID} zu.`,
    directive: 'Verwende "interface fa0/2", "switchport mode access" und "switchport access vlan 20".',
    solution: {
      answer: `interface fa0/2\nswitchport mode access\nswitchport access vlan ${BUCHHALTUNG_VLAN_ID}\nexit`,
      explanation: 'Jeder Arbeitsplatz landet im passenden Abteilungs-VLAN.',
    },
  }),
  unused_ports_parked: defineHintLadder({
    subskillPath: 'cisco.layer2.shutdown',
    nudge: 'Ports, die aktuell niemand nutzt, sollten nicht offen und im Standard-VLAN bleiben.',
    focus: `Finde heraus, welche Ports noch frei sind, und verschiebe sie in das Parking-VLAN ${PARKING_VLAN_ID_002}.`,
    directive: `Nutze "show interfaces status", um freie Ports zu erkennen. Setze sie per Interface-Range in VLAN ${PARKING_VLAN_ID_002} und fahre sie mit "shutdown" herunter.`,
    solution: {
      answer: `interface range fa0/3 - 8\nswitchport mode access\nswitchport access vlan ${PARKING_VLAN_ID_002}\nshutdown\nexit`,
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
  verified: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.verify_running_config',
    nudge: 'Bevor du speicherst, solltest du prüfen, ob die Konfiguration deinen Vorgaben entspricht.',
    focus: 'Zeige VLANs, Interfaces und den Trunk an, um den Zustand zu verifizieren.',
    directive: 'Verwende "show vlan brief", "show interfaces trunk", "show interfaces status" oder "show running-config".',
    solution: {
      answer: 'show vlan brief',
      explanation: '"show vlan brief" zeigt alle VLANs und die ihnen zugeordneten Access-Ports.',
    },
  }),
  saved: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.save_config',
    nudge: 'Ohne Speichern geht die Konfiguration beim nächsten Neustart verloren.',
    focus: 'Sichere die Running-Config in der Startup-Config.',
    directive: 'Verwende "copy running-config startup-config" oder "write" (auch mit "do" aus Konfigurationsmodi).',
    solution: {
      answer: 'copy running-config startup-config',
      explanation: '"copy running-config startup-config" (oder "write") kopiert die aktuelle Konfiguration in die Startup-Config.',
    },
  }),
};

function effectiveSwitchportMode(iface) {
  if (iface.switchportMode) return iface.switchportMode;
  if (iface.accessVlan != null) return 'access';
  return null;
}

function accessPortsOk(interfaces, vlanId) {
  return interfaces.length > 0
    && interfaces.every((iface) => (effectiveSwitchportMode(iface) === 'access')
      && iface.accessVlan === vlanId
      && !iface.administrativelyDown);
}

function parkedPortsOk(interfaces, parkingVlanId) {
  return interfaces.length > 0
    && interfaces.every((iface) => (effectiveSwitchportMode(iface) === 'access')
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

  const unusedVlan = rc.vlans?.[p.parkingVlanId];
  const vlanUnused = !!unusedVlan && unusedVlan.name === p.parkingVlanName;

  const personalInterfaces = p.personalPorts.map((id) => rc.interfaces[id]).filter(Boolean);
  const personalPort = accessPortsOk(personalInterfaces, p.personalVlanId);

  const buchhaltungInterfaces = p.buchhaltungPorts.map((id) => rc.interfaces[id]).filter(Boolean);
  const buchhaltungPort = accessPortsOk(buchhaltungInterfaces, p.buchhaltungVlanId);

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
      && sc.vlans?.[p.parkingVlanId]?.name === p.parkingVlanName
      && accessPortsOk(savedPersonal, p.personalVlanId)
      && accessPortsOk(savedBuchhaltung, p.buchhaltungVlanId)
      && parkedPortsOk(savedUnused, p.parkingVlanId)
      && uplinkTrunkOk(savedUplink, p.parkingVlanId);
  }

  const checks = {
    vlan_personal: { ok: vlanPersonal, type: 'state' },
    vlan_buchhaltung: { ok: vlanBuchhaltung, type: 'state' },
    vlan_unused: { ok: vlanUnused, type: 'state' },
    personal_port: { ok: personalPort, type: 'state' },
    buchhaltung_port: { ok: buchhaltungPort, type: 'state' },
    unused_ports_parked: { ok: unusedPortsParked, type: 'state' },
    uplink_trunk: { ok: uplinkTrunk, type: 'state' },
    verified: { ok: verified, type: 'verification' },
    saved: { ok: saved, type: 'persistence' },
  };

  const completed = MISSION_002_REQUIREMENTS.filter((r) => checks[r.id].ok).length;
  const total = MISSION_002_REQUIREMENTS.length;

  return {
    completed,
    total,
    checks: MISSION_002_REQUIREMENTS.map((r) => ({ ...r, ok: checks[r.id].ok, type: r.type || checks[r.id].type })),
    allCorrect: completed === total,
  };
}

function _evaluateMission002State(device, scenario, state = null) {
  const progress = _getMission002Progress(device, scenario, state);
  const misconceptions = [];

  if (progress.completed > 0) {
    const verified = progress.checks.find((c) => c.id === 'verified')?.ok;
    const saved = progress.checks.find((c) => c.id === 'saved')?.ok;
    if (!verified && !saved) {
      misconceptions.push('forgot_verify_and_save');
    } else if (!verified) {
      misconceptions.push('forgot_verify');
    } else if (!saved) {
      misconceptions.push('forgot_save');
    }
  }

  return {
    ...progress,
    allCorrect: progress.allCorrect,
    misconceptions,
  };
}

// ============================================================================
// Mission 003: Remote Administration / SSH (Block 1.5)
// ============================================================================
//
// Fixed, non-randomized story mission (HM3): SW-ADM-01 is a Layer-2 admin
// switch that is currently only reachable from the local console. The
// player introduces the full Block-1.5 chain: management VLAN -> SVI ->
// management IP -> default gateway -> domain-name -> RSA key -> SSH -> VTY
// login local / transport input ssh. Hostname, enable secret and a local
// user already exist (carried over from Block 1 / known credentials) so the
// mission focuses purely on the new remote-administration skills.

const TARGET_HOSTNAME_003 = 'SW-ADM-01';
const MGMT_VLAN_ID_003 = 172;
const MGMT_VLAN_NAME_003 = 'ADMIN';
const MGMT_IP_003 = '192.168.172.2';
const MGMT_MASK_003 = '255.255.255.0';
const MGMT_GATEWAY_003 = '192.168.172.1';
const MGMT_DOMAIN_003 = 'nexus.local';
const MGMT_MIN_RSA_MODULUS_003 = 768;

const VERIFY_HINTS_003 = ['show ip ssh', 'show running-config', 'show ip interface brief', 'show vlan brief'];

export function generateMission003Scenario(seed = Date.now()) {
  const known = getKnownCredentials();
  return {
    missionId: MISSION_003_ID,
    title: 'Fernwartung per SSH',
    seed,
    deviceType: 'layer2_switch',
    initialHostname: TARGET_HOSTNAME_003,
    parameters: {
      targetHostname: TARGET_HOSTNAME_003,
      mgmtVlanId: MGMT_VLAN_ID_003,
      mgmtVlanName: MGMT_VLAN_NAME_003,
      mgmtIp: MGMT_IP_003,
      mgmtMask: MGMT_MASK_003,
      mgmtGateway: MGMT_GATEWAY_003,
      domainName: MGMT_DOMAIN_003,
      minRsaModulus: MGMT_MIN_RSA_MODULUS_003,
      username: known.localAdminUsername || 'admin',
      userSecret: known.localAdminPassword || 'nexus505',
      enableSecret: known.enableSecret || 'nexus101',
    },
    briefing: `Moin,\n\n${TARGET_HOSTNAME_003} verwaltest du bisher nur, wenn du direkt am Gerät stehst - für jede kleine Änderung läuft jemand physisch zum Switch. Das soll sich ändern: Fernwartung per SSH.\n\n${TARGET_HOSTNAME_003} ist ein reiner Layer-2-Switch und hat von sich aus keine IP-Adresse. Damit SSH funktioniert, brauchst du:\n\n1. Ein Management-VLAN ${MGMT_VLAN_ID_003} / ${MGMT_VLAN_NAME_003}.\n2. Eine SVI (interface vlan ${MGMT_VLAN_ID_003}) mit der IP ${MGMT_IP_003} / ${MGMT_MASK_003}, aktiviert.\n3. Ein Default Gateway ${MGMT_GATEWAY_003}, damit Zugriffe aus anderen Netzen den Switch erreichen.\n4. Einen Domain-Namen (${MGMT_DOMAIN_003}) - ohne Hostname und Domain lassen sich keine RSA-Schlüssel erzeugen.\n5. Einen RSA-Schlüssel (mindestens ${MGMT_MIN_RSA_MODULUS_003} Bit, 1024 Bit empfohlen).\n6. SSH Version 2 (kein Telnet, keine SSHv1).\n7. Die VTY-Leitungen mit "login local" und "transport input ssh".\n\nPrüfe die Konfiguration und speichere sie danach dauerhaft.\n\n– Sam`,
  };
}

export function createMission003Device(scenario) {
  const params = scenario.parameters;
  const device = createCiscoDevice({
    profile: 'catalyst_8fe_1ge',
    hostname: scenario.initialHostname || TARGET_HOSTNAME_003,
  });

  // Block 1 basics already exist - this mission is purely the Block 1.5 SSH
  // extension, not a repeat of hostname/enable-secret/local-user.
  device.runningConfig.enableSecret = params.enableSecret;
  device.runningConfig.users[params.username] = { secret: params.userSecret };
  device.runningConfig.noIpDomainLookup = true;

  return device;
}

export const MISSION_003_REQUIREMENTS = [
  { id: 'mgmt_vlan', label: `VLAN ${MGMT_VLAN_ID_003} / ${MGMT_VLAN_NAME_003}`, skill: 'cisco.layer2.vlan_creation' },
  { id: 'svi_address', label: `SVI Vlan${MGMT_VLAN_ID_003} mit IP ${MGMT_IP_003}, aktiviert`, skill: 'cisco.remote_administration.management_svi' },
  { id: 'default_gateway', label: `Default Gateway ${MGMT_GATEWAY_003}`, skill: 'cisco.basic_configuration.default_gateway' },
  { id: 'domain_name', label: `Domain-Name ${MGMT_DOMAIN_003}`, skill: 'cisco.basic_configuration.domain_name' },
  { id: 'rsa_key', label: `RSA-Schlüssel (>= ${MGMT_MIN_RSA_MODULUS_003} Bit)`, skill: 'cisco.remote_administration.rsa_keys' },
  { id: 'ssh_version', label: 'SSH Version 2', skill: 'cisco.remote_administration.ssh_version' },
  { id: 'vty_login_local', label: 'VTY login local', skill: 'cisco.remote_administration.vty_login_local' },
  { id: 'vty_transport_ssh', label: 'VTY transport input ssh (kein Telnet)', skill: 'cisco.remote_administration.vty_transport_ssh' },
  { id: 'verified', label: 'Konfiguration geprüft', skill: 'cisco.basic_configuration.verify_running_config' },
  { id: 'saved', label: 'Konfiguration dauerhaft gespeichert', skill: 'cisco.basic_configuration.save_config' },
];

const HINT_LADDERS_003 = {
  mgmt_vlan: defineHintLadder({
    subskillPath: 'cisco.layer2.vlan_creation',
    nudge: 'Für die Fernwartung braucht der Switch zuerst ein eigenes Management-VLAN.',
    focus: `Lege VLAN ${MGMT_VLAN_ID_003} mit dem Namen ${MGMT_VLAN_NAME_003} an.`,
    directive: `Verwende "vlan ${MGMT_VLAN_ID_003}" gefolgt von "name ${MGMT_VLAN_NAME_003}" im Global Configuration Mode.`,
    solution: {
      answer: `vlan ${MGMT_VLAN_ID_003}\nname ${MGMT_VLAN_NAME_003}\nexit`,
      explanation: 'Ein Management-VLAN trennt den Verwaltungszugriff logisch von den Nutzdaten-VLANs.',
    },
  }),
  svi_address: defineHintLadder({
    subskillPath: 'cisco.remote_administration.management_svi',
    nudge: 'Ein reiner Layer-2-Switch hat keine eigene IP-Adresse - die braucht er über eine virtuelle Schnittstelle.',
    focus: `Erstelle die SVI für VLAN ${MGMT_VLAN_ID_003} und weise ihr eine IP-Adresse zu.`,
    directive: `Verwende "interface vlan ${MGMT_VLAN_ID_003}", "ip address ${MGMT_IP_003} ${MGMT_MASK_003}" und "no shutdown".`,
    solution: {
      answer: `interface vlan ${MGMT_VLAN_ID_003}\nip address ${MGMT_IP_003} ${MGMT_MASK_003}\nno shutdown\nexit`,
      explanation: 'Die SVI (Switched Virtual Interface) gibt dem Switch eine eigene, erreichbare IP-Adresse im Management-VLAN.',
    },
  }),
  default_gateway: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.default_gateway',
    nudge: 'Ohne Gateway erreicht der Switch nur Geräte im eigenen Netz.',
    focus: 'Setze ein Default Gateway, damit Zugriffe aus anderen Netzen den Switch erreichen.',
    directive: `Verwende "ip default-gateway ${MGMT_GATEWAY_003}" im Global Configuration Mode.`,
    solution: {
      answer: `ip default-gateway ${MGMT_GATEWAY_003}`,
      explanation: 'Ein Layer-2-Switch routet nicht selbst - er braucht ein Default Gateway, um Antworten außerhalb seines Netzes zuzustellen.',
    },
  }),
  domain_name: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.domain_name',
    nudge: 'RSA-Schlüssel brauchen einen vollständigen Namen aus Hostname und Domain.',
    focus: `Setze den Domain-Namen ${MGMT_DOMAIN_003}.`,
    directive: `Verwende "ip domain-name ${MGMT_DOMAIN_003}" im Global Configuration Mode.`,
    solution: {
      answer: `ip domain-name ${MGMT_DOMAIN_003}`,
      explanation: 'Ohne Hostname und Domain verweigert IOS die Erzeugung von RSA-Schlüsseln.',
    },
  }),
  rsa_key: defineHintLadder({
    subskillPath: 'cisco.remote_administration.rsa_keys',
    nudge: 'SSH braucht einen RSA-Schlüssel zur Verschlüsselung der Verbindung.',
    focus: 'Erzeuge den RSA-Schlüssel mit einem Modulus von mindestens 768 Bit (1024 Bit empfohlen).',
    directive: 'Verwende "crypto key generate rsa" und gib anschließend "1024" als Modulus ein.',
    solution: {
      answer: 'crypto key generate rsa\n1024',
      explanation: '"crypto key generate rsa" fragt interaktiv nach der Schlüssellänge; 1024 Bit ist die von NEXUS empfohlene Größe.',
    },
  }),
  ssh_version: defineHintLadder({
    subskillPath: 'cisco.remote_administration.ssh_version',
    nudge: 'SSH Version 1 gilt als unsicher und wird nicht mehr eingesetzt.',
    focus: 'Erzwinge SSH Version 2.',
    directive: 'Verwende "ip ssh version 2" im Global Configuration Mode.',
    solution: {
      answer: 'ip ssh version 2',
      explanation: '"ip ssh version 2" stellt sicher, dass ausschließlich das sicherere SSHv2 angeboten wird.',
    },
  }),
  vty_login_local: defineHintLadder({
    subskillPath: 'cisco.remote_administration.vty_login_local',
    nudge: 'Ohne lokale Anmeldeprüfung lässt sich SSH nicht sinnvoll absichern.',
    focus: 'Aktiviere die Prüfung gegen die lokale Benutzerdatenbank auf den VTY-Leitungen.',
    directive: 'Verwende "line vty 0 15" gefolgt von "login local".',
    solution: {
      answer: 'line vty 0 15\nlogin local\nexit',
      explanation: '"login local" prüft SSH-Anmeldungen gegen die mit "username" angelegten lokalen Benutzer.',
    },
  }),
  vty_transport_ssh: defineHintLadder({
    subskillPath: 'cisco.remote_administration.vty_transport_ssh',
    nudge: 'Standardmäßig erlauben die VTY-Leitungen auch unverschlüsseltes Telnet.',
    focus: 'Beschränke die VTY-Leitungen auf SSH.',
    directive: 'Verwende "line vty 0 15" gefolgt von "transport input ssh".',
    solution: {
      answer: 'line vty 0 15\ntransport input ssh\nexit',
      explanation: '"transport input ssh" lässt nur noch verschlüsselte SSH-Verbindungen zu und deaktiviert Telnet auf den VTY-Leitungen.',
    },
  }),
  verified: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.verify_running_config',
    nudge: 'Bevor du speicherst, solltest du prüfen, ob SSH wirklich aktiv ist.',
    focus: 'Zeige den SSH-Status und die Konfiguration an.',
    directive: 'Verwende "show ip ssh", "show ip interface brief" oder "show running-config".',
    solution: {
      answer: 'show ip ssh',
      explanation: '"show ip ssh" zeigt, ob SSH aktiv ist und welche Version verwendet wird.',
    },
  }),
  saved: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.save_config',
    nudge: 'Ohne Speichern geht die Konfiguration beim nächsten Neustart verloren.',
    focus: 'Sichere die Running-Config in der Startup-Config.',
    directive: 'Verwende "copy running-config startup-config" oder "write".',
    solution: {
      answer: 'copy running-config startup-config',
      explanation: '"copy running-config startup-config" (oder "write") kopiert die aktuelle Konfiguration in die Startup-Config.',
    },
  }),
};

function mission003Checks(runningConfig, params) {
  const vlan = runningConfig.vlans?.[params.mgmtVlanId];
  const mgmtVlan = !!vlan && vlan.name === params.mgmtVlanName;

  const svi = runningConfig.interfaces?.[`Vlan${params.mgmtVlanId}`];
  const sviAddress = !!svi && svi.ipv4 === params.mgmtIp && svi.mask === params.mgmtMask && !svi.administrativelyDown;

  const defaultGateway = runningConfig.ipDefaultGateway === params.mgmtGateway;
  const domainName = runningConfig.ipDomainName === params.domainName;
  const rsaKey = !!runningConfig.cryptoKey?.exists && runningConfig.cryptoKey.modulus >= params.minRsaModulus;
  const sshVersion = runningConfig.ipSshVersion === 2;
  const vtyLoginLocal = !!runningConfig.lines?.vty?.loginLocal;
  const vtyTransportSsh = Array.isArray(runningConfig.lines?.vty?.transportInput)
    && runningConfig.lines.vty.transportInput.length > 0
    && runningConfig.lines.vty.transportInput.every((t) => t === 'ssh');

  return {
    mgmt_vlan: mgmtVlan,
    svi_address: sviAddress,
    default_gateway: defaultGateway,
    domain_name: domainName,
    rsa_key: rsaKey,
    ssh_version: sshVersion,
    vty_login_local: vtyLoginLocal,
    vty_transport_ssh: vtyTransportSsh,
  };
}

function _getMission003Progress(device, scenario, state = null) {
  const params = scenario.parameters;
  const rc = device.runningConfig;

  const checks = mission003Checks(rc, params);

  const verified = (state?.showCommandsUsed || []).some((c) => VERIFY_HINTS_003.some((v) => c.includes(v)));

  let saved = false;
  if (device.startupConfig !== null) {
    const savedChecks = mission003Checks(device.startupConfig, params);
    saved = Object.values(savedChecks).every(Boolean);
  }

  const allChecks = { ...checks, verified, saved };

  const completed = MISSION_003_REQUIREMENTS.filter((r) => allChecks[r.id]).length;
  const total = MISSION_003_REQUIREMENTS.length;

  return {
    completed,
    total,
    checks: MISSION_003_REQUIREMENTS.map((r) => ({ ...r, ok: allChecks[r.id] })),
    allCorrect: completed === total,
  };
}

export function getMission003Progress(device, scenario) {
  return _getMission003Progress(device, scenario);
}

export function mission003RequiredState(scenario) {
  return scenario.parameters;
}

function _evaluateMission003State(device, scenario, state = null) {
  const progress = _getMission003Progress(device, scenario, state);
  const misconceptions = [];

  if (progress.completed > 0) {
    const verified = progress.checks.find((c) => c.id === 'verified')?.ok;
    const saved = progress.checks.find((c) => c.id === 'saved')?.ok;
    if (!verified && !saved) {
      misconceptions.push('forgot_verify_and_save');
    } else if (!verified) {
      misconceptions.push('forgot_verify');
    } else if (!saved) {
      misconceptions.push('forgot_save');
    }
  }

  return {
    ...progress,
    allCorrect: progress.allCorrect,
    misconceptions,
  };
}

export function evaluateMission003State(device, scenario) {
  return _evaluateMission003State(device, scenario);
}

export function startMission003(seed = Date.now()) {
  return startMainMission(MISSION_003_ID, seed);
}

// ============================================================================
// Mission 004: Router-on-a-Stick / Inter-VLAN Routing
// ============================================================================
//
// Follow-up to HM2: VLAN segmentation works, but departments can no longer
// reach resources in other VLANs. The player introduces a router with 802.1Q
// subinterfaces to enable inter-VLAN routing.

const DEPARTMENT_POOL = ['PERSONAL', 'TECHNIK', 'VERWALTUNG', 'LAGER', 'VERTIEB', 'PRODUKTION'];
const VLAN_ID_POOL_004 = [10, 20, 30, 40, 50, 60];
const SWITCH_HOSTNAMES_004 = ['Sw-HQ-01', 'Sw-HQ-02', 'Sw-AST-01'];
const ROUTER_HOSTNAMES_004 = ['R-HQ-01', 'R-HQ-02', 'R-AST-01'];
const ACCESS_PORTS_PER_VLAN_004 = 4;
const UPLINK_PORT_004 = 'GigabitEthernet0/1';
const ROUTER_PHYSICAL_PORT_004 = 'GigabitEthernet0/0';

function generateMission004Scenario(seed = Date.now()) {
  const rng = seededRng(seed);
  const pickFromArr = (arr) => arr[rng(0, arr.length - 1)];
  const switchHostname = pickFromArr(SWITCH_HOSTNAMES_004);
  const routerHostname = pickFromArr(ROUTER_HOSTNAMES_004);
  const vlanIds = [];
  while (vlanIds.length < 3) {
    const candidate = pickFromArr(VLAN_ID_POOL_004);
    if (!vlanIds.includes(candidate)) vlanIds.push(candidate);
  }
  const usedDepartments = [];
  const vlans = vlanIds.map((id) => {
    let name;
    do {
      name = pickFromArr(DEPARTMENT_POOL);
    } while (usedDepartments.includes(name));
    usedDepartments.push(name);
    const base = `192.168.${id}`;
    return {
      id,
      name,
      network: `${base}.0`,
      mask: '255.255.255.0',
      gateway: `${base}.1`,
      accessPorts: Array.from({ length: ACCESS_PORTS_PER_VLAN_004 }, (_, i) => {
        const portIndex = vlanIds.indexOf(id) * ACCESS_PORTS_PER_VLAN_004 + i + 1;
        return `FastEthernet0/${portIndex}`;
      }),
    };
  });

  const vlanList = vlans.map((v) => `- VLAN ${v.id} ${v.name}: Netz ${v.network}/24, Gateway ${v.gateway}`).join('\n');
  const accessList = vlans.map((v) => `${v.name}: ${v.accessPorts.map((p) => p.replace('FastEthernet', 'Fa')).join(', ')}`).join('\n');

  return {
    missionId: MISSION_004_ID,
    title: 'Inter-VLAN Routing',
    seed,
    deviceType: 'router_on_a_stick',
    initialHostname: switchHostname,
    parameters: {
      switchHostname,
      routerHostname,
      vlans,
      uplinkPort: UPLINK_PORT_004,
      routerPhysicalPort: ROUTER_PHYSICAL_PORT_004,
    },
    briefing: `Moin,

die Segmentierung aus dem letzten Auftrag funktioniert - vielleicht etwas zu gut. Einige Abteilungen erreichen Ressourcen in anderen Netzen nicht mehr.

Wir hängen den Router ${routerHostname} an ${switchHostname} an, um zwischen den VLANs zu routen.

Vorhandene VLANs auf ${switchHostname}:
${vlanList}

Anschlüsse:
${accessList}

Uplink Switch <-> Router: ${UPLINK_PORT_004.replace('GigabitEthernet', 'Gi')} (Trunk, alle obigen VLANs)
Router-Interface für die Subinterfaces: ${ROUTER_PHYSICAL_PORT_004.replace('GigabitEthernet', 'Gi')}

Auftrag:
1. Stelle sicher, dass alle VLANs mit korrektem Namen existieren.
2. Die Arbeitsplatzports liegen in ihrem VLAN und sind aktiv.
3. Der Uplink ist ein Trunk und erlaubt alle benötigten VLANs.
4. Das Router-Physikinterface ist aktiv.
5. Für jedes VLAN legst du ein Subinterface auf ${ROUTER_PHYSICAL_PORT_004.replace('GigabitEthernet', 'Gi')} an, taggst es mit 802.1Q und weist das passende Gateway zu.
6. Prüfe die Konfiguration und speichere sie.

– Sam`,
  };
}

export function createMission004Device(scenario) {
  const device = createCiscoDevice({
    profile: 'router_on_a_stick',
    hostname: scenario.initialHostname,
  });
  const params = scenario.parameters;

  // Access ports are connected and should stay up for their department.
  params.vlans.forEach((vlan) => {
    vlan.accessPorts.forEach((id) => {
      const iface = device.runningConfig.interfaces[id];
      if (iface) {
        iface.operationalStatus = 'connected';
        iface.administrativelyDown = false;
      }
    });
  });

  // Uplink is connected to the router but not yet configured as trunk.
  const uplink = device.runningConfig.interfaces[params.uplinkPort];
  if (uplink) {
    uplink.operationalStatus = 'connected';
    uplink.administrativelyDown = false;
  }

  // Router physical interface is cabled but initially administratively down,
  // so the player must explicitly enable it.
  const routerPhysical = device.runningConfig.interfaces[params.routerPhysicalPort];
  if (routerPhysical) {
    routerPhysical.operationalStatus = 'notconnect';
    routerPhysical.administrativelyDown = true;
  }

  return device;
}

export const MISSION_004_REQUIREMENTS = [
  { id: 'vlans', label: 'VLANs existieren mit korrekten Namen', skill: 'cisco.layer2.vlan_creation' },
  { id: 'access_ports', label: 'Access-Ports liegen in den richtigen VLANs', skill: 'cisco.layer2.access_ports' },
  { id: 'uplink_trunk', label: 'Switch-Uplink ist Trunk für alle VLANs', skill: 'cisco.layer2.trunking' },
  { id: 'router_physical_up', label: 'Router-Physikinterface ist aktiv', skill: 'cisco.routing.router_interface.configure' },
  { id: 'subinterfaces', label: 'Subinterfaces mit 802.1Q und Gateway-IP', skill: 'cisco.routing.inter_vlan.encapsulation_dot1q' },
  { id: 'verified_and_saved', label: 'Konfiguration geprüft und gespeichert', skill: 'cisco.basic_configuration.save_config' },
];

const VERIFY_HINTS_004 = ['show vlan brief', 'show interfaces trunk', 'show ip interface brief', 'show running-config'];

const HINT_LADDERS_004 = {
  vlans: defineHintLadder({
    subskillPath: 'cisco.layer2.vlan_creation',
    nudge: 'Der Router braucht die VLANs, sonst können die Subinterfaces nicht taggen.',
    focus: 'Vergleiche die VLAN-Liste aus dem Auftrag mit der aktuellen Konfiguration.',
    directive: 'Lege fehlende VLANs im Global Configuration Mode mit "vlan <id>" und "name <name>" an.',
    solution: { answer: 'vlan <id>\nname <name>\nexit', explanation: 'Jedes VLAN bekommt eine ID und einen sprechenden Namen.' },
  }),
  access_ports: defineHintLadder({
    subskillPath: 'cisco.layer2.access_ports',
    nudge: 'Die Arbeitsplätze müssen im passenden VLAN erreichbar sein.',
    focus: 'Nutze "interface range", um mehrere Ports gleichzeitig zu konfigurieren.',
    directive: 'Setze jeden Bereich auf Access-Mode, weise das VLAN zu und aktiviere die Ports.',
    solution: { answer: 'interface range fa0/x - y\nswitchport mode access\nswitchport access vlan <id>\nno shutdown\nexit', explanation: 'Access-Ports gehören zu genau einem VLAN und müssen aktiv sein.' },
  }),
  uplink_trunk: defineHintLadder({
    subskillPath: 'cisco.layer2.trunking',
    nudge: 'Der Router muss alle VLAN-Tags über den Uplink sehen.',
    focus: 'Der Uplink-Port muss Trunk-Modus erhalten und alle VLANs erlauben.',
    directive: 'Konfiguriere den Uplink als "switchport mode trunk" und erlaube alle VLANs.',
    solution: { answer: 'interface <uplink>\nswitchport mode trunk\nno shutdown\nexit', explanation: 'Ein Trunk transportiert mehrere VLANs zwischen Switch und Router.' },
  }),
  router_physical_up: defineHintLadder({
    subskillPath: 'cisco.routing.router_interface.configure',
    nudge: 'Das Physikinterface des Routers muss erreichbar sein, bevor Subinterfaces funktionieren.',
    focus: 'Schalte das Router-Interface ein.',
    directive: 'Wechsle auf das Physikinterface und führe "no shutdown" aus.',
    solution: { answer: 'interface <physik>\nno shutdown\nexit', explanation: 'Ohne aktives Physikinterface bleiben alle Subinterfaces down.' },
  }),
  subinterfaces: defineHintLadder({
    subskillPath: 'cisco.routing.inter_vlan.encapsulation_dot1q',
    nudge: 'Für jedes VLAN braucht der Router ein eigenes logisches Interface.',
    focus: 'Erstelle Subinterfaces, tagge sie mit "encapsulation dot1q" und setze die Gateway-IP.',
    directive: 'interface <physik>.<vlan-id>\nencapsulation dot1q <vlan-id>\nip address <gateway> <mask>\nno shutdown\nexit',
    solution: { answer: 'interface <physik>.<vlan-id>\nencapsulation dot1q <vlan-id>\nip address <gateway> <mask>\nno shutdown\nexit', explanation: 'Router-on-a-Stick nutzt 802.1Q-Subinterfaces, damit ein Router-Port mehrere VLANs bedienen kann.' },
  }),
  verified_and_saved: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.save_config',
    nudge: 'Ohne Speichern ist die Konfiguration nach einem Neustart weg.',
    focus: 'Prüfe mit "show"-Befehlen und sichere danach die Konfiguration.',
    directive: 'Verwende "show ip interface brief", "show interfaces trunk" oder "show running-config" und speichere mit "write" bzw. "copy running-config startup-config".',
    solution: { answer: 'show ip interface brief\ncopy running-config startup-config', explanation: 'Zeige die Subinterfaces und den Trunk an, bevor du die Konfiguration dauerhaft speicherst.' },
  }),
};

function _getMission004Progress(device, scenario, state = null) {
  const routing = evaluateRouterOnAStick(device, scenario);

  const verified = (state?.showCommandsUsed || []).some((c) => VERIFY_HINTS_004.some((v) => c.includes(v)));

  let saved = false;
  if (device.startupConfig !== null) {
    const sc = device.startupConfig;
    saved = evaluateRouterOnAStick({ ...device, runningConfig: sc }, scenario).allCorrect;
  }

  const checks = {
    vlans: routing.checks.filter((c) => c.id.startsWith('vlan_') && c.id.endsWith('_exists')).every((c) => c.ok),
    access_ports: routing.checks.filter((c) => c.id.endsWith('_access')).every((c) => c.ok),
    uplink_trunk: routing.checks.find((c) => c.id === 'uplink_trunk')?.ok || false,
    router_physical_up: routing.checks.find((c) => c.id === 'router_physical_up')?.ok || false,
    subinterfaces: routing.checks.filter((c) => c.id.startsWith('subinterface_')).every((c) => c.ok),
    verified_and_saved: verified && saved,
  };

  const completed = MISSION_004_REQUIREMENTS.filter((r) => checks[r.id]).length;
  const total = MISSION_004_REQUIREMENTS.length;

  return {
    completed,
    total,
    checks: MISSION_004_REQUIREMENTS.map((r) => ({ ...r, ok: checks[r.id] })),
    allCorrect: completed === total,
  };
}

export function getMission004Progress(device, scenario) {
  return _getMission004Progress(device, scenario);
}

export function mission004RequiredState(scenario) {
  return scenario.parameters;
}

function _evaluateMission004State(device, scenario, state = null) {
  const progress = _getMission004Progress(device, scenario, state);
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

export function evaluateMission004State(device, scenario) {
  return _evaluateMission004State(device, scenario);
}

// ============================================================================
// Registry
// ============================================================================

const SCENARIO_GENERATORS = {
  [MISSION_001_ID]: generateMission001Scenario,
  [MISSION_002_ID]: generateMission002Scenario,
  [MISSION_003_ID]: generateMission003Scenario,
  [MISSION_004_ID]: generateMission004Scenario,
};

const DEVICE_CREATORS = {
  [MISSION_001_ID]: createMission001Device,
  [MISSION_002_ID]: createMission002Device,
  [MISSION_003_ID]: createMission003Device,
  [MISSION_004_ID]: createMission004Device,
};

const PROGRESS_GETTERS = {
  [MISSION_001_ID]: _getMission001Progress,
  [MISSION_002_ID]: _getMission002Progress,
  [MISSION_003_ID]: _getMission003Progress,
  [MISSION_004_ID]: _getMission004Progress,
};

const EVALUATORS = {
  [MISSION_001_ID]: _evaluateMission001State,
  [MISSION_002_ID]: _evaluateMission002State,
  [MISSION_003_ID]: _evaluateMission003State,
  [MISSION_004_ID]: _evaluateMission004State,
};

const REQUIREMENTS = {
  [MISSION_001_ID]: MISSION_001_REQUIREMENTS,
  [MISSION_002_ID]: MISSION_002_REQUIREMENTS,
  [MISSION_003_ID]: MISSION_003_REQUIREMENTS,
  [MISSION_004_ID]: MISSION_004_REQUIREMENTS,
};

const HINT_LADDERS_BY_MISSION = {
  [MISSION_001_ID]: HINT_LADDERS_001,
  [MISSION_002_ID]: HINT_LADDERS_002,
  [MISSION_003_ID]: HINT_LADDERS_003,
  [MISSION_004_ID]: HINT_LADDERS_004,
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
    const cmd = result.resolvedCommand?.toLowerCase() || result.command?.toLowerCase() || '';
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

export function startMission004(seed = Date.now()) {
  return startMainMission(MISSION_004_ID, seed);
}

export function evaluateMission004(state) {
  return evaluateMainMission(state);
}
