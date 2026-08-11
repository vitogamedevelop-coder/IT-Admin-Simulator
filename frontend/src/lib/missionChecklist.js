// Mission Checklist / Exam Routine Matrix (Mission System V2)
//
// Prepares the data model for a fixed mental configuration routine.
// The player learns to work through devices systematically, topic by topic,
// rather than jumping around.  Not every device needs every step.

export const ROUTINE_STEP = {
  IDENTIFY_DEVICE: 'identify_device',
  BASIC_CONFIG: 'basic_config',
  LAYER_2: 'layer_2',
  LAYER_3: 'layer_3',
  EXTRA_SERVICES: 'extra_services',
  SECURITY: 'security',
  VERIFICATION: 'verification',
};

export const ROUTINE_STEP_META = {
  [ROUTINE_STEP.IDENTIFY_DEVICE]: {
    label: 'Gerät identifizieren',
    prompt: 'Welches Gerät wird konfiguriert? Router, Switch oder Multilayer-Switch? Welche Rolle hat es in der Topologie?',
  },
  [ROUTINE_STEP.BASIC_CONFIG]: {
    label: 'Grundkonfiguration',
    prompt: 'Hostname, Passwörter, lokale Benutzer, Konsolen-/VTY-Zugriff, Domain-Lookups abschalten.',
  },
  [ROUTINE_STEP.LAYER_2]: {
    label: 'Layer 2',
    prompt: 'VLANs, Access-Ports, Trunks, Inter-Switch-Links.',
  },
  [ROUTINE_STEP.LAYER_3]: {
    label: 'Layer 3 / Routing',
    prompt: 'Interfaces, IP-Adressen, no shutdown, statische Routen, OSPF, Inter-VLAN-Routing, Default-Route.',
  },
  [ROUTINE_STEP.EXTRA_SERVICES]: {
    label: 'Zusätzliche Dienste',
    prompt: 'DHCP Relay, SSH, SVI, Port Channels, Loopback-Interfaces.',
  },
  [ROUTINE_STEP.SECURITY]: {
    label: 'Security',
    prompt: 'ACL, Stateful Packet Filter, Port Security, Login-Block, Banners.',
  },
  [ROUTINE_STEP.VERIFICATION]: {
    label: 'Verifikation / Test',
    prompt: 'show running-config, show ip interface brief, show ip route, show vlan brief, ping, traceroute.',
  },
};

// Default full routine.  A mission can override which steps apply to each
// device and which commands are expected for verification.
export const DEFAULT_ROUTINE = [
  ROUTINE_STEP.IDENTIFY_DEVICE,
  ROUTINE_STEP.BASIC_CONFIG,
  ROUTINE_STEP.LAYER_2,
  ROUTINE_STEP.LAYER_3,
  ROUTINE_STEP.EXTRA_SERVICES,
  ROUTINE_STEP.SECURITY,
  ROUTINE_STEP.VERIFICATION,
];

// A checklist belongs to a single device in a mission.  It tracks which
// routine steps the player has already addressed and which are still open.
export function createChecklist({
  deviceId,
  deviceName,
  deviceRole,
  steps = DEFAULT_ROUTINE,
}) {
  return {
    deviceId,
    deviceName,
    deviceRole,
    steps: steps.map((stepId) => ({
      stepId,
      completed: false,
      completedAt: null,
      verifiedCommands: [],
      notes: '',
    })),
    startedAt: Date.now(),
    completedAt: null,
  };
}

export function markChecklistStepComplete(checklist, stepId, verificationCommands = []) {
  const step = checklist.steps.find((s) => s.stepId === stepId);
  if (!step) return checklist;
  step.completed = true;
  step.completedAt = Date.now();
  step.verifiedCommands = verificationCommands;

  const allDone = checklist.steps.every((s) => s.completed);
  if (allDone && !checklist.completedAt) {
    checklist.completedAt = Date.now();
  }
  return checklist;
}

export function checklistProgress(checklist) {
  const total = checklist.steps.length;
  const done = checklist.steps.filter((s) => s.completed).length;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

// Exam matrix: for each device role, which routine steps are typically
// relevant.  This is a template; missions can override per device.
export const DEVICE_ROUTINE_MATRIX = {
  router: {
    required: [ROUTINE_STEP.IDENTIFY_DEVICE, ROUTINE_STEP.BASIC_CONFIG, ROUTINE_STEP.LAYER_3, ROUTINE_STEP.SECURITY, ROUTINE_STEP.VERIFICATION],
    optional: [ROUTINE_STEP.EXTRA_SERVICES],
  },
  switch: {
    required: [ROUTINE_STEP.IDENTIFY_DEVICE, ROUTINE_STEP.BASIC_CONFIG, ROUTINE_STEP.LAYER_2, ROUTINE_STEP.VERIFICATION],
    optional: [ROUTINE_STEP.SECURITY],
  },
  multilayer_switch: {
    required: [ROUTINE_STEP.IDENTIFY_DEVICE, ROUTINE_STEP.BASIC_CONFIG, ROUTINE_STEP.LAYER_2, ROUTINE_STEP.LAYER_3, ROUTINE_STEP.VERIFICATION],
    optional: [ROUTINE_STEP.EXTRA_SERVICES, ROUTINE_STEP.SECURITY],
  },
  firewall: {
    required: [ROUTINE_STEP.IDENTIFY_DEVICE, ROUTINE_STEP.BASIC_CONFIG, ROUTINE_STEP.SECURITY, ROUTINE_STEP.VERIFICATION],
    optional: [ROUTINE_STEP.LAYER_3, ROUTINE_STEP.EXTRA_SERVICES],
  },
};

// For the future exam simulation: the player gets a topology and a set of
// requirements and must decide order, missing config and verification.
export function buildExamMission({
  id,
  title,
  devices,
  requirements,
}) {
  return {
    id,
    title,
    type: 'main',
    difficulty: 4,
    devices: devices.map((device) => ({
      ...device,
      checklist: createChecklist({
        deviceId: device.id,
        deviceName: device.name,
        deviceRole: device.role,
        steps: (DEVICE_ROUTINE_MATRIX[device.role]?.required || DEFAULT_ROUTINE).concat(
          (device.optionalSteps || []),
        ),
      }),
    })),
    requirements,
    playerDecidesOrder: true,
    noPresetHints: true,
  };
}

// Suggested verification commands for a routine step.  Later the CLI engine
// can match the player's show commands against these expectations.
export const VERIFICATION_COMMANDS = {
  [ROUTINE_STEP.BASIC_CONFIG]: ['show running-config', 'show version'],
  [ROUTINE_STEP.LAYER_2]: ['show vlan brief', 'show interfaces trunk', 'show interfaces status'],
  [ROUTINE_STEP.LAYER_3]: ['show ip interface brief', 'show ip route', 'show ip protocols'],
  [ROUTINE_STEP.EXTRA_SERVICES]: ['show ip dhcp relay', 'show ssh', 'show svi'],
  [ROUTINE_STEP.SECURITY]: ['show ip access-lists', 'show ip inspect', 'show port-security'],
  [ROUTINE_STEP.VERIFICATION]: ['ping', 'traceroute'],
};
