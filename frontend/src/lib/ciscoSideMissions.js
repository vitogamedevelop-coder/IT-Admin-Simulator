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
export const SIDE_MISSION_004_ID = 'cisco-side-l2-001';

export const CISCO_SIDE_MISSIONS = [SIDE_MISSION_001_ID, SIDE_MISSION_002_ID, SIDE_MISSION_003_ID, SIDE_MISSION_004_ID];

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
// Side 004: Offene Türen (L2-Switch Security)
// ============================================================================

const PARKING_VLAN_ID = 999;
const PARKING_VLAN_NAME = 'UNUSED';

export function generateSideMission004(seed = Date.now()) {
  const personalPorts = [
    'FastEthernet0/1', 'FastEthernet0/2', 'FastEthernet0/3', 'FastEthernet0/4',
  ];
  const uplinkPorts = ['GigabitEthernet0/1'];
  const allAccess = Array.from({ length: 24 }, (_, i) => `FastEthernet0/${i + 1}`);
  const freePorts = allAccess.filter((id) => !personalPorts.includes(id));

  return {
    missionId: SIDE_MISSION_004_ID,
    title: 'Offene Türen',
    seed,
    deviceType: 'layer2_switch',
    initialHostname: 'Sw2',
    parameters: {
      parkingVlanId: PARKING_VLAN_ID,
      parkingVlanName: PARKING_VLAN_NAME,
      personalPorts,
      uplinkPorts,
      freePorts,
    },
    briefing: `Sam:

„Sw2 geht bald in Betrieb. Auf dem Gerät sind noch mehrere ungenutzte Accessports aktiv.“

„Prüfe, welche Ports tatsächlich benötigt werden. Nicht verwendete Accessports sollen nach NEXUS-Standard in unser Parking-VLAN verschoben und administrativ deaktiviert werden.“

NEXUS-Standard:
- Parking VLAN: ${PARKING_VLAN_ID}
- Name: ${PARKING_VLAN_NAME}

Achtung: Uplinks dürfen nicht betroffen sein.

Aufgabe:
1. Untersuche den Switch mit Show-Befehlen.
2. Erstelle VLAN ${PARKING_VLAN_ID} ${PARKING_VLAN_NAME}.
3. Verschiebe alle ungenutzten FastEthernet-Accessports in das Parking-VLAN.
4. Deaktiviere diese Ports administrativ.
5. Prüfe das Ergebnis und speichere die Konfiguration.`,
  };
}

export const SIDE_004_REQUIREMENTS = [
  { id: 'inspected', label: 'Gerät untersucht', skill: 'cisco.layer2.discovery' },
  { id: 'parking_vlan_created', label: `VLAN ${PARKING_VLAN_ID} ${PARKING_VLAN_NAME}`, skill: 'cisco.layer2.vlan_creation' },
  { id: 'free_ports_parked', label: 'Freie Ports im Parking-VLAN', skill: 'cisco.layer2.access_ports' },
  { id: 'free_ports_shutdown', label: 'Freie Ports administrativ deaktiviert', skill: 'cisco.layer2.shutdown' },
  { id: 'uplink_safe', label: 'Uplink unverändert', skill: 'cisco.layer2.uplink_protection' },
  { id: 'personal_ports_safe', label: 'Arbeitsplatzports unverändert', skill: 'cisco.layer2.uplink_protection' },
  { id: 'config_saved', label: 'Konfiguration gespeichert', skill: 'cisco.basic_configuration.save_config' },
];

const HINT_LADDERS_004 = {
  inspected: defineHintLadder({
    subskillPath: 'cisco.layer2.discovery',
    nudge: 'Bevor du Ports abschaltest, solltest du herausfinden, welche Interfaces der Switch besitzt und welche davon verwendet werden.',
    focus: 'Show-Befehle können dir einen Überblick über Interfaces und bestehende Konfiguration geben.',
    directive: 'Nutze "show running-config" und/oder "show interfaces status".',
    solution: {
      answer: 'show interfaces status',
      explanation: '"show interfaces status" zeigt schnell, welche Ports verbunden sind und welche VLANs ihnen zugeordnet sind.',
    },
  }),
  parking_vlan_created: defineHintLadder({
    subskillPath: 'cisco.layer2.vlan_creation',
    nudge: 'Das Parking-VLAN muss existieren, bevor Ports hinein verschoben werden können.',
    focus: 'VLANs werden im Global Configuration Mode angelegt.',
    directive: 'Verwende "vlan 999" und "name UNUSED".',
    solution: {
      answer: 'vlan 999\nname UNUSED\nexit',
      explanation: 'VLAN 999 mit dem Namen UNUSED wird im Global Config Mode erstellt.',
    },
  }),
  free_ports_parked: defineHintLadder({
    subskillPath: 'cisco.layer2.access_ports',
    nudge: 'Mehrere gleichartige Interfaces können über "interface range" gemeinsam konfiguriert werden.',
    focus: 'Freie Ports sollen als Access-Ports in VLAN 999 landen.',
    directive: 'Nutze "interface range fa0/5 - 24", dann "switchport mode access" und "switchport access vlan 999".',
    solution: {
      answer: 'interface range fa0/5 - 24\nswitchport mode access\nswitchport access vlan 999',
      explanation: 'interface range wendet die nachfolgenden Befehle auf alle Interfaces im Bereich an.',
    },
  }),
  free_ports_shutdown: defineHintLadder({
    subskillPath: 'cisco.layer2.shutdown',
    nudge: 'Nicht verwendete Ports sollten administrativ deaktiviert werden.',
    focus: 'Der Befehl "shutdown" befindet sich im Interface-Config-Modus.',
    directive: 'Füge im Interface-Range-Modus "shutdown" hinzu.',
    solution: {
      answer: 'interface range fa0/5 - 24\nshutdown',
      explanation: '"shutdown" setzt den Port administrativ in den Zustand "administratively down".',
    },
  }),
  uplink_safe: defineHintLadder({
    subskillPath: 'cisco.layer2.uplink_protection',
    nudge: 'Uplinks sind essenziell, damit der Switch erreichbar bleibt.',
    focus: 'Prüfe, ob Gi0/1 oder Gi0/2 versehentlich mitkonfiguriert wurden.',
    directive: 'Vermeide es, Uplinks in das Parking-VLAN zu verschieben oder herunterzufahren.',
    solution: {
      answer: 'show interfaces status',
      explanation: 'Uplinks sollten weiterhin aktiv bleiben und dürfen nicht VLAN 999 zugeordnet sein.',
    },
  }),
  personal_ports_safe: defineHintLadder({
    subskillPath: 'cisco.layer2.uplink_protection',
    nudge: 'Die Arbeitsplatzports für die Personalabteilung müssen weiterhin in VLAN 10 bleiben.',
    focus: 'Achte darauf, dass Fa0/1–Fa0/4 nicht im Range enthalten sind.',
    directive: 'Prüfe mit "show vlan brief", ob VLAN 10 weiterhin die richtigen Ports enthält.',
    solution: {
      answer: 'show vlan brief',
      explanation: 'Fa0/1–Fa0/4 müssen weiterhin VLAN 10 PERSONAL zugeordnet sein.',
    },
  }),
  config_saved: defineHintLadder({
    subskillPath: 'cisco.basic_configuration.save_config',
    nudge: 'Ohne Speichern geht die Konfiguration beim Ausschalten verloren.',
    focus: 'Kopiere die Running-Config in die Startup-Config.',
    directive: 'Verwende "copy running-config startup-config" oder "write memory".',
    solution: {
      answer: 'copy running-config startup-config',
      explanation: 'Speichern kopiert die aktuelle Running-Config in die Startup-Config.',
    },
  }),
};

function createSide004Device(scenario) {
  const device = createCiscoDevice({
    profile: 'catalyst_24fe_2ge',
    hostname: scenario.initialHostname,
  });
  const p = scenario.parameters;

  // VLAN 10 PERSONAL already configured as if the main mission was completed.
  device.runningConfig.vlans = {
    1: { name: 'default' },
    10: { name: 'PERSONAL' },
  };

  // Personal ports in VLAN 10, connected.
  p.personalPorts.forEach((id) => {
    const iface = device.runningConfig.interfaces[id];
    if (iface) {
      iface.switchportMode = 'access';
      iface.accessVlan = 10;
      iface.operationalStatus = 'connected';
      iface.administrativelyDown = false;
    }
  });

  // Uplink connected, not in parking VLAN.
  p.uplinkPorts.forEach((id) => {
    const iface = device.runningConfig.interfaces[id];
    if (iface) {
      iface.operationalStatus = 'connected';
      iface.administrativelyDown = false;
    }
  });

  // Free accessports are active but unused.
  p.freePorts.forEach((id) => {
    const iface = device.runningConfig.interfaces[id];
    if (iface) {
      iface.operationalStatus = 'notconnect';
      iface.administrativelyDown = false;
    }
  });

  device.cli.mode = 'PRIVILEGED_EXEC';
  return device;
}

export function getSide004Progress(device, scenario) {
  const p = scenario.parameters;
  const rc = device.runningConfig;
  const saved = device.startupConfig;

  const inspected = true;

  const parkingVlan = rc.vlans?.[p.parkingVlanId];
  const parkingVlanCreated = !!parkingVlan && parkingVlan.name === p.parkingVlanName;

  const freeInterfaces = p.freePorts.map((id) => rc.interfaces[id]).filter(Boolean);
  const freePortsParked = freeInterfaces.length > 0
    && freeInterfaces.every((iface) => iface.switchportMode === 'access' && iface.accessVlan === p.parkingVlanId);
  const freePortsShutdown = freeInterfaces.length > 0
    && freeInterfaces.every((iface) => iface.administrativelyDown);

  const uplinkInterfaces = p.uplinkPorts.map((id) => rc.interfaces[id]).filter(Boolean);
  const uplinkSafe = uplinkInterfaces.every((iface) => !iface.administrativelyDown && iface.accessVlan !== p.parkingVlanId);

  const personalInterfaces = p.personalPorts.map((id) => rc.interfaces[id]).filter(Boolean);
  const personalPortsSafe = personalInterfaces.every((iface) => !iface.administrativelyDown && iface.accessVlan === 10);

  let configSaved = false;
  if (saved !== null) {
    const sv = saved.vlans?.[p.parkingVlanId];
    configSaved = sv?.name === p.parkingVlanName
      && p.freePorts.every((id) => {
        const ri = rc.interfaces[id];
        const si = saved.interfaces[id];
        return si
          && si.switchportMode === 'access'
          && si.accessVlan === p.parkingVlanId
          && si.administrativelyDown
          && ri.switchportMode === si.switchportMode
          && ri.accessVlan === si.accessVlan
          && ri.administrativelyDown === si.administrativelyDown;
      });
  }

  const checks = {
    inspected,
    parking_vlan_created: parkingVlanCreated,
    free_ports_parked: freePortsParked,
    free_ports_shutdown: freePortsShutdown,
    uplink_safe: uplinkSafe,
    personal_ports_safe: personalPortsSafe,
    config_saved: configSaved,
  };

  const completed = SIDE_004_REQUIREMENTS.filter((r) => checks[r.id]).length;
  return {
    completed,
    total: SIDE_004_REQUIREMENTS.length,
    checks: SIDE_004_REQUIREMENTS.map((r) => ({ ...r, ok: checks[r.id] })),
    allCorrect: completed === SIDE_004_REQUIREMENTS.length,
  };
}

// ============================================================================
// Common runtime
// ============================================================================

const SCENARIO_GENERATORS = {
  [SIDE_MISSION_001_ID]: generateSideMission001,
  [SIDE_MISSION_002_ID]: generateSideMission002,
  [SIDE_MISSION_003_ID]: generateSideMission003,
  [SIDE_MISSION_004_ID]: generateSideMission004,
};

const DEVICE_CREATORS = {
  [SIDE_MISSION_001_ID]: createSide001Device,
  [SIDE_MISSION_002_ID]: createSide002Device,
  [SIDE_MISSION_003_ID]: createSide003Device,
  [SIDE_MISSION_004_ID]: createSide004Device,
};

export { createSide001Device, createSide002Device, createSide003Device, createSide004Device };

const PROGRESS_GETTERS = {
  [SIDE_MISSION_001_ID]: getSide001Progress,
  [SIDE_MISSION_002_ID]: getSide002Progress,
  [SIDE_MISSION_003_ID]: getSide003Progress,
  [SIDE_MISSION_004_ID]: getSide004Progress,
};

const HINT_LADDERS_BY_MISSION = {
  [SIDE_MISSION_001_ID]: HINT_LADDERS_001,
  [SIDE_MISSION_002_ID]: HINT_LADDERS_002,
  [SIDE_MISSION_003_ID]: HINT_LADDERS_003,
  [SIDE_MISSION_004_ID]: HINT_LADDERS_004,
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
    [SIDE_MISSION_004_ID]: 'Ungenutzte Accessports wurden ins Parking-VLAN verschoben und administrativ deaktiviert. Der Uplink und die Arbeitsplatzports für die Personalabteilung bleiben erreichbar.',
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
