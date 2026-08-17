// Cisco IOS CLI Engine (Phase 1A)
//
// A small, stateful, extensible Cisco IOS-like command line interpreter.
// It maintains an internal device state (running / startup config, interfaces,
// CLI mode, ...) and executes commands against that state.

import { recordSkillEvent, SKILL_DIMENSION } from './skillTree.js';

export const CLI_MODE = {
  USER_EXEC: 'USER_EXEC',
  PRIVILEGED_EXEC: 'PRIVILEGED_EXEC',
  GLOBAL_CONFIG: 'GLOBAL_CONFIG',
  INTERFACE_CONFIG: 'INTERFACE_CONFIG',
  INTERFACE_RANGE_CONFIG: 'INTERFACE_RANGE_CONFIG',
  VLAN_CONFIG: 'VLAN_CONFIG',
  LINE_CONSOLE_CONFIG: 'LINE_CONSOLE_CONFIG',
  LINE_VTY_CONFIG: 'LINE_VTY_CONFIG',
  // Interactive follow-up prompt after "crypto key generate rsa" - the next
  // line the player types is interpreted as the RSA modulus size, not a
  // regular IOS command (matches the real/Packet-Tracer interactive flow).
  CRYPTO_RSA_MODULUS_PROMPT: 'CRYPTO_RSA_MODULUS_PROMPT',
};

export const CLI_ERROR = {
  UNKNOWN_COMMAND: 'UNKNOWN_COMMAND',
  AMBIGUOUS_COMMAND: 'AMBIGUOUS_COMMAND',
  INCOMPLETE_COMMAND: 'INCOMPLETE_COMMAND',
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
  WRONG_MODE: 'WRONG_MODE',
};

export const INTERFACE_TYPES = {
  gigabitethernet: { short: 'Gi', canonical: 'GigabitEthernet' },
  fastethernet: { short: 'Fa', canonical: 'FastEthernet' },
  tengigabitethernet: { short: 'Te', canonical: 'TenGigabitEthernet' },
  serial: { short: 'Se', canonical: 'Serial' },
  ethernet: { short: 'Et', canonical: 'Ethernet' },
  loopback: { short: 'Lo', canonical: 'Loopback' },
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function createInterface(id, type = 'physical', parentId = null) {
  return {
    id,
    name: id,
    type,
    parentId,
    ipv4: null,
    mask: null,
    administrativelyDown: true,
    operationalStatus: 'notconnect',
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

export function createSubinterface(parentId, subId) {
  const id = `${parentId}.${subId}`;
  return createInterface(id, 'subinterface', parentId);
}

// ============================================================================
// Device profiles
// ============================================================================
//
// A device profile describes the physical interface layout of a well known
// Cisco device model. `createCiscoDevice({ profile: 'catalyst_24fe_2ge' })`
// builds its interface set from this list instead of the generic defaults.

function buildInterfaceRangeIds(canonicalPrefix, slot, start, end) {
  const ids = [];
  for (let port = start; port <= end; port += 1) {
    ids.push(`${canonicalPrefix}${slot}/${port}`);
  }
  return ids;
}

export const DEVICE_PROFILES = {
  router_on_a_stick: {
    type: 'router',
    label: 'Router-on-a-Stick (Switch + Router in one device model)',
    interfaces: [
      ...buildInterfaceRangeIds('FastEthernet', 0, 1, 24),
      ...buildInterfaceRangeIds('GigabitEthernet', 0, 0, 1),
    ],
  },
  router_1ge: {
    type: 'router',
    label: 'Router with one GigabitEthernet interface',
    interfaces: ['GigabitEthernet0/0'],
  },
  catalyst_24fe_2ge: {
    type: 'layer2_switch',
    label: 'Catalyst 24-Port FastEthernet + 2 GigabitEthernet',
    interfaces: [
      ...buildInterfaceRangeIds('FastEthernet', 0, 1, 24),
      ...buildInterfaceRangeIds('GigabitEthernet', 0, 1, 2),
    ],
  },
  catalyst_8fe_1ge: {
    type: 'layer2_switch',
    label: 'Catalyst 8-Port FastEthernet + 1 GigabitEthernet',
    interfaces: [
      ...buildInterfaceRangeIds('FastEthernet', 0, 1, 8),
      ...buildInterfaceRangeIds('GigabitEthernet', 0, 1, 1),
    ],
  },
};

function defaultVlans() {
  return {
    1: { id: 1, name: 'default' },
  };
}

export function createCiscoDevice(options = {}) {
  const profile = options.profile ? DEVICE_PROFILES[options.profile] : null;
  const type = options.type || profile?.type || 'router';
  const hostname = options.hostname || 'Router';
  const interfaces = options.interfaces || profile?.interfaces || ['GigabitEthernet0/0', 'GigabitEthernet0/1'];
  const defaultGateway = options.defaultGateway || null;
  return {
    type,
    hostname,
    profile: options.profile || null,
    runningConfig: {
      hostname,
      noIpDomainLookup: false,
      ipDomainName: null,
      enableSecret: null,
      users: {},
      interfaces: Object.fromEntries(interfaces.map((id) => [id, createInterface(id)])),
      vlans: defaultVlans(),
      lines: {
        console: { password: null, login: false, loginLocal: false, execTimeout: { minutes: 5, seconds: 0 } },
        vty: {
          password: null, login: false, loginLocal: false, execTimeout: { minutes: 10, seconds: 0 }, range: [0, 15], transportInput: null,
        },
      },
      ipDefaultGateway: defaultGateway,
      servicePasswordEncryption: false,
      // Remote administration (Block 1.5 SSH): cryptoKey.exists tracks whether
      // "crypto key generate rsa" has produced a key, ipSshVersion tracks
      // "ip ssh version <n>".
      cryptoKey: { exists: false, modulus: null },
      ipSshVersion: null,
      banner: '',
    },
    startupConfig: null,
    cli: {
      mode: CLI_MODE.USER_EXEC,
      currentInterface: null,
      currentInterfaceRange: null,
      currentVlanId: null,
      currentLine: null,
    },
    history: [],
  };
}

// ============================================================================
// IP validation
// ============================================================================

function isValidIpv4(ip) {
  const parts = String(ip).split('.').map(Number);
  if (parts.length !== 4) return false;
  return parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255);
}

function isValidMask(mask) {
  if (!isValidIpv4(mask)) return false;
  const parts = mask.split('.').map(Number);
  const binary = parts.map((p) => p.toString(2).padStart(8, '0')).join('');
  const firstZero = binary.indexOf('0');
  const lastOne = binary.lastIndexOf('1');
  return firstZero === -1 || lastOne < firstZero;
}

// ============================================================================
// Interface parsing
// ============================================================================

function parseInterfaceId(input) {
  const lower = input.toLowerCase();
  for (const [long, { short, canonical }] of Object.entries(INTERFACE_TYPES)) {
    if (lower.startsWith(long)) {
      const slot = input.slice(long.length).trim();
      return `${canonical}${slot}`;
    }
    if (lower.startsWith(short.toLowerCase())) {
      const slot = input.slice(short.length).trim();
      return `${canonical}${slot}`;
    }
  }
  // Single-letter abbreviations: g0/1, f0/1, t0/1, e0/0, s0/0/0, l0
  if (lower.length >= 1) {
    const first = lower.charAt(0);
    for (const [long, { canonical }] of Object.entries(INTERFACE_TYPES)) {
      if (first === long.charAt(0)) {
        const slot = input.slice(1).trim();
        return `${canonical}${slot}`;
      }
    }
  }
  return null;
}

function resolveInterfaceName(device, input) {
  const canonical = parseInterfaceId(input);
  if (!canonical) return null;
  const lower = canonical.toLowerCase();
  return Object.values(device.runningConfig.interfaces).find(
    (iface) => iface.name.toLowerCase() === lower || iface.id.toLowerCase() === lower,
  ) || null;
}

function ensureInterface(device, input) {
  const target = resolveInterfaceName(device, input);
  if (target) return target;
  const canonical = parseInterfaceId(input);
  if (!canonical || !canonical.includes('.')) return null;
  const [parentId] = canonical.split('.');
  const parent = device.runningConfig.interfaces[parentId];
  if (!parent) return null;
  const subId = canonical.slice(parentId.length + 1);
  if (!/^\d+$/.test(subId)) return null;
  const subinterface = createSubinterface(parentId, subId);
  device.runningConfig.interfaces[subinterface.id] = subinterface;
  return subinterface;
}

function shortInterfaceName(name) {
  for (const { short, canonical } of Object.values(INTERFACE_TYPES)) {
    if (name.toLowerCase().startsWith(canonical.toLowerCase())) {
      return `${short}${name.slice(canonical.length)}`;
    }
  }
  return name;
}

// ============================================================================
// Interface range parsing
// Supported syntaxes:
//   interface range fa0/3 - 8
//   interface range fa0/3-8
//   interface range fa0/3 - 8, gi0/1
//   interface range fa0/3-8,g0/1
//   interface range fa0/3 - 8, gi0/1 - 2
//   interface range fa0/3-8,g0/1-2
// Long and short interface type names are both accepted.
// ============================================================================

function normalizeRangeInput(rangeTokens) {
  // Tokens may contain attached commas (e.g. "fa0/3-8,g0/1") or be split by
  // whitespace around commas. Normalize into comma-separated segments.
  return rangeTokens
    .join('')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+-\s+/g, '-')
    .replace(/\s+/g, '');
}

function parseRangeSegment(segment) {
  // Match e.g. "fa0/3-8" or "gigabitethernet0/1" or "gi0/1-2".
  const match = segment.match(/^([a-z]+)(\d+)\/(\d+)(?:-(\d+))?$/i);
  if (!match) return null;
  const [, typeToken, slot, startStr, endStr] = match;
  const start = parseInt(startStr, 10);
  const end = endStr != null ? parseInt(endStr, 10) : start;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start < 0) return null;
  return { typeToken, slot, start, end };
}

function resolveInterfaceRange(device, rangeTokens) {
  const normalized = normalizeRangeInput(rangeTokens);
  if (!normalized) return { error: CLI_ERROR.INVALID_ARGUMENT };
  const segments = normalized.split(',').filter(Boolean);
  if (segments.length === 0) return { error: CLI_ERROR.INVALID_ARGUMENT };

  const ids = [];
  const seen = new Set();
  for (const segment of segments) {
    const spec = parseRangeSegment(segment);
    if (!spec) return { error: CLI_ERROR.INVALID_ARGUMENT };
    for (let port = spec.start; port <= spec.end; port += 1) {
      const raw = `${spec.typeToken}${spec.slot}/${port}`;
      const iface = resolveInterfaceName(device, raw);
      if (!iface) return { error: CLI_ERROR.INVALID_ARGUMENT };
      if (!seen.has(iface.id)) {
        seen.add(iface.id);
        ids.push(iface.id);
      }
    }
  }
  if (ids.length === 0) return { error: CLI_ERROR.INVALID_ARGUMENT };
  return { ids };
}

function getTargetInterfaceIds(device) {
  if (device.cli.mode === CLI_MODE.INTERFACE_RANGE_CONFIG) {
    return device.cli.currentInterfaceRange || [];
  }
  if (device.cli.currentInterface) return [device.cli.currentInterface];
  return [];
}

function forEachTargetInterface(device, fn) {
  const ids = getTargetInterfaceIds(device);
  ids.forEach((id) => {
    const iface = device.runningConfig.interfaces[id];
    if (iface) fn(iface);
  });
  return ids.length > 0;
}

// ============================================================================
// VLAN helpers
// ============================================================================

function defaultVlanName(id) {
  return `VLAN${String(id).padStart(4, '0')}`;
}

function ensureVlan(device, id, name) {
  if (!device.runningConfig.vlans[id]) {
    device.runningConfig.vlans[id] = { id, name: name || defaultVlanName(id) };
  }
  return device.runningConfig.vlans[id];
}

// ============================================================================
// Command tree
// ============================================================================

function node(keyword, options = {}) {
  return {
    keyword: keyword.toLowerCase(),
    help: options.help || '',
    execute: options.execute || null,
    children: options.children || null,
    complete: options.complete || null,
    skill: options.skill || null,
  };
}

function cmd(keyword, execute, help, skill = null, complete = null) {
  return node(keyword, { execute, help, skill, complete });
}

function setInterfaceShutdown(device, isDown) {
  forEachTargetInterface(device, (iface) => {
    iface.administrativelyDown = isDown;
    iface.operationalStatus = isDown ? 'disabled' : 'notconnect';
  });
}

function parseVlanList(rawList) {
  const ids = rawList.split(',').map((s) => s.trim()).filter(Boolean).map((s) => parseInt(s, 10));
  if (ids.length === 0) return null;
  if (ids.some((id) => Number.isNaN(id) || id < 1 || id > 4094)) return null;
  return ids;
}

function buildSwitchportNode() {
  return node('switchport', {
    help: 'Set switchport parameters',
    children: [
      node('mode', {
        help: 'Set trunking mode of the interface',
        children: [
          cmd('access', (device) => {
            forEachTargetInterface(device, (iface) => { iface.switchportMode = 'access'; });
            return { output: '', stateChanged: true };
          }, 'Set VLAN classification of the interface as access', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'switchport_mode', dimension: SKILL_DIMENSION.CONFIGURE }),
          cmd('trunk', (device) => {
            forEachTargetInterface(device, (iface) => { iface.switchportMode = 'trunk'; });
            return { output: '', stateChanged: true };
          }, 'Set trunking mode to trunk unconditionally', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'switchport_mode_trunk', dimension: SKILL_DIMENSION.CONFIGURE }),
        ],
      }),
      node('access', {
        help: 'Set access mode characteristics of the interface',
        children: [
          cmd('vlan', (device, tokens) => {
            if (tokens.length < 4) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
            const id = parseInt(tokens[3], 10);
            if (Number.isNaN(id) || id < 1 || id > 4094) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
            ensureVlan(device, id);
            forEachTargetInterface(device, (iface) => {
              if (!iface.switchportMode) iface.switchportMode = 'access';
              iface.accessVlan = id;
            });
            return { output: '', stateChanged: true };
          }, 'Set VLAN when interface is in access mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'switchport_access_vlan', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<vlan-id>']),
        ],
      }),
      node('trunk', {
        help: 'Set trunking characteristics of the interface',
        children: [
          node('allowed', {
            help: 'Set allowed VLAN characteristics when interface is in trunking mode',
            children: [
              cmd('vlan', (device, tokens) => {
                if (tokens.length < 5) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
                const ids = parseVlanList(tokens.slice(4).join(''));
                if (!ids) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
                // "switchport trunk allowed vlan" only edits the trunk's allowed-
                // VLAN list. It must NEVER create VLANs in the VLAN database -
                // that is the job of "vlan <id>" / "name <name>" in global config.
                // A VLAN ID that is merely allowed but not created is configured
                // but not active (see renderInterfacesTrunk's allowed vs. active
                // in management domain split).
                forEachTargetInterface(device, (iface) => { iface.trunkAllowedVlans = ids; });
                return { output: '', stateChanged: true };
              }, 'Set allowed VLANs when interface is in trunking mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'switchport_trunk_allowed_vlan', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<vlan-id[,vlan-id...]>']),
            ],
          }),
        ],
      }),
    ],
  });
}

// Reusable `interface` command that can be entered from GLOBAL_CONFIG,
// INTERFACE_CONFIG, INTERFACE_RANGE_CONFIG and (for VLAN → interface transitions)
// VLAN_CONFIG. It switches to a single interface or an interface range without
// requiring an explicit `exit` first.
function buildInterfaceSelectionCommand() {
  return cmd('interface', (device, tokens) => {
    if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
    if (tokens[1].toLowerCase() === 'range') {
      if (tokens.length < 3) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      const range = resolveInterfaceRange(device, tokens.slice(2));
      if (range.error) return { output: '', error: range.error };
      device.cli.mode = CLI_MODE.INTERFACE_RANGE_CONFIG;
      device.cli.currentInterfaceRange = range.ids;
      device.cli.currentInterface = null;
      device.cli.currentVlanId = null;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true };
    }
    // "interface vlan <id>" enters (creating if necessary) the switched
    // virtual interface (SVI) used for management IPs on L2/L3 switches.
    if (tokens[1].toLowerCase() === 'vlan') {
      if (tokens.length < 3) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      const vlanId = parseInt(tokens[2], 10);
      if (Number.isNaN(vlanId) || vlanId < 1 || vlanId > 4094) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
      const sviId = `Vlan${vlanId}`;
      if (!device.runningConfig.interfaces[sviId]) {
        device.runningConfig.interfaces[sviId] = createInterface(sviId, 'svi');
      }
      device.cli.mode = CLI_MODE.INTERFACE_CONFIG;
      device.cli.currentInterface = sviId;
      device.cli.currentInterfaceRange = null;
      device.cli.currentVlanId = null;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true, stateChanged: true };
    }
    const target = ensureInterface(device, tokens[1]);
    if (!target) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
    device.cli.mode = CLI_MODE.INTERFACE_CONFIG;
    device.cli.currentInterface = target.id;
    device.cli.currentInterfaceRange = null;
    device.cli.currentVlanId = null;
    device.cli.currentLine = null;
    return { output: '', modeChanged: true };
  }, 'Select an interface to configure', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'interface_ip', dimension: SKILL_DIMENSION.CONFIGURE }, () => [...Object.values(INTERFACE_TYPES).map((t) => `${t.canonical}0/0`), 'range', 'vlan']);
}

export const BASE_COMMAND_TREE = {
  [CLI_MODE.USER_EXEC]: [
    cmd('enable', (device) => {
      device.cli.mode = CLI_MODE.PRIVILEGED_EXEC;
      return { output: '', modeChanged: true };
    }, 'Enter privileged EXEC mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'cli_navigation', dimension: SKILL_DIMENSION.CONFIGURE }),
  ],
  [CLI_MODE.PRIVILEGED_EXEC]: [
    cmd('disable', (device) => {
      device.cli.mode = CLI_MODE.USER_EXEC;
      return { output: '', modeChanged: true };
    }, 'Exit privileged EXEC mode'),
    node('configure', {
      help: 'Enter configuration mode',
      children: [
        cmd('terminal', (device) => {
          device.cli.mode = CLI_MODE.GLOBAL_CONFIG;
          return { output: '', modeChanged: true };
        }, 'Enter configuration mode from the terminal', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'cli_navigation', dimension: SKILL_DIMENSION.CONFIGURE }),
      ],
    }),
    node('show', {
      help: 'Show running system information',
      skill: { domainId: 'cisco', skillId: 'verification', subskillId: 'choose_correct_show_command', dimension: SKILL_DIMENSION.VERIFY },
      children: [
        cmd('running-config', (device) => ({ output: renderRunningConfig(device), stateChanged: false }), 'Display running configuration', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'verify_running_config', dimension: SKILL_DIMENSION.VERIFY }),
        cmd('startup-config', (device) => ({ output: renderStartupConfig(device), stateChanged: false }), 'Display startup configuration', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'save_config', dimension: SKILL_DIMENSION.VERIFY }),
        node('ip', {
          help: 'IP information',
          children: [
            node('interface', {
              help: 'IP interface status and configuration',
              children: [
                cmd('brief', (device) => ({ output: renderIpInterfaceBrief(device), stateChanged: false }), 'IP interface status and configuration summary', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'interface_ip', dimension: SKILL_DIMENSION.VERIFY }),
              ],
            }),
            cmd('ssh', (device) => ({ output: renderIpSsh(device), stateChanged: false }), 'Display SSH server connection status', { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'verify', dimension: SKILL_DIMENSION.VERIFY }),
          ],
        }),
        node('vlan', {
          help: 'VLAN status',
          children: [
            cmd('brief', (device) => ({ output: renderVlanBrief(device), stateChanged: false }), 'VLAN status summary', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'vlan_configuration', dimension: SKILL_DIMENSION.VERIFY }),
          ],
        }),
        node('interfaces', {
          help: 'Interface status and configuration',
          children: [
            cmd('status', (device) => ({ output: renderInterfacesStatus(device), stateChanged: false }), 'Display interface status', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'vlan_configuration', dimension: SKILL_DIMENSION.VERIFY }),
            cmd('trunk', (device) => ({ output: renderInterfacesTrunk(device), stateChanged: false }), 'Display interfaces that are in trunking mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'verify_trunk', dimension: SKILL_DIMENSION.VERIFY }),
            node('<interface>', {
              help: 'Interface name',
              complete: () => Object.values(INTERFACE_TYPES).map((t) => `${t.canonical}0/0`),
              children: [
                cmd('switchport', (device, tokens) => {
                  const iface = resolveInterfaceName(device, tokens[2]);
                  if (!iface) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
                  return { output: renderInterfaceSwitchport(iface), stateChanged: false };
                }, 'Display switchport configuration of the interface', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'verify_switchport', dimension: SKILL_DIMENSION.VERIFY }),
              ],
            }),
          ],
        }),
      ],
    }),
    node('copy', {
      help: 'Copy from one file to another',
      skill: { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'save_config', dimension: SKILL_DIMENSION.CONFIGURE },
      children: [
        node('running-config', {
          help: 'Source configuration file',
          children: [
            cmd('startup-config', (device) => {
              device.startupConfig = deepClone(device.runningConfig);
              return { output: '\nDestination filename [startup-config]?\nBuilding configuration...\n[OK]\n', stateChanged: true };
            }, 'Copy running-config to startup-config', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'save_config', dimension: SKILL_DIMENSION.CONFIGURE }),
          ],
        }),
      ],
    }),
    node('write', {
      help: 'Write running configuration to memory',
      // "write" alone (without "memory") is itself a valid, historic IOS
      // shortcut for "write memory". Giving this node its own `execute`
      // (in addition to the "memory" child) lets the generic tree walker
      // accept both "write" and "write memory" as complete commands.
      execute: (device) => {
        device.startupConfig = deepClone(device.runningConfig);
        return { output: '\nBuilding configuration...\n[OK]\n', stateChanged: true };
      },
      skill: { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'save_config', dimension: SKILL_DIMENSION.CONFIGURE },
      children: [
        cmd('memory', (device) => {
          device.startupConfig = deepClone(device.runningConfig);
          return { output: '\nBuilding configuration...\n[OK]\n', stateChanged: true };
        }, 'Write running-config to startup-config', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'save_config', dimension: SKILL_DIMENSION.CONFIGURE }),
      ],
    }),
    cmd('wr', (device) => {
      device.startupConfig = deepClone(device.runningConfig);
      return { output: '\nBuilding configuration...\n[OK]\n', stateChanged: true };
    }, 'Shortcut: write memory', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'save_config', dimension: SKILL_DIMENSION.CONFIGURE }),
  ],
  [CLI_MODE.GLOBAL_CONFIG]: [
    cmd('do', executeDoCommand, 'Execute an EXEC command from configuration mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'do_command', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<command>']),
    cmd('hostname', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      device.runningConfig.hostname = tokens[1];
      device.hostname = tokens[1];
      return { output: '', stateChanged: true };
    }, 'Set system network name', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'hostname', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<name>']),
    node('ip', {
      help: 'Global IP configuration commands',
      children: [
        cmd('domain-name', (device, tokens) => {
          const name = tokens.slice(2).join(' ');
          if (!name) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
          device.runningConfig.ipDomainName = name;
          return { output: '', stateChanged: true };
        }, 'Define default domain name', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'domain_name', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<name>']),
        cmd('default-gateway', (device, tokens) => {
          if (tokens.length < 3) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
          if (!isValidIpv4(tokens[2])) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
          device.runningConfig.ipDefaultGateway = tokens[2];
          return { output: '', stateChanged: true };
        }, 'Specify default gateway', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'default_gateway', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<ip>']),
        node('ssh', {
          help: 'Configure SSH parameters',
          children: [
            cmd('version', (device, tokens) => {
              if (tokens.length < 4) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
              const version = parseInt(tokens[3], 10);
              if (version !== 1 && version !== 2) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
              device.runningConfig.ipSshVersion = version;
              return { output: '', stateChanged: true };
            }, 'Specify the SSH protocol version to be supported', { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'ssh_version', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['1', '2']),
          ],
        }),
      ],
    }),
    node('crypto', {
      help: 'Encryption keys',
      children: [
        node('key', {
          help: 'Long term key operations',
          children: [
            node('generate', {
              help: 'Generate a key',
              children: [
                cmd('rsa', (device) => {
                  const hostname = device.runningConfig.hostname;
                  const domain = device.runningConfig.ipDomainName;
                  const hasCustomHostname = !!hostname && !['Router', 'Switch'].includes(hostname);
                  if (!hasCustomHostname || !domain) {
                    return {
                      output: '% Please define a hostname other than Router/Switch and a domain name (ip domain-name) before generating RSA keys.',
                      stateChanged: false,
                    };
                  }
                  device.cli.mode = CLI_MODE.CRYPTO_RSA_MODULUS_PROMPT;
                  return {
                    output: `The name for the keys will be: ${hostname}.${domain}\n\nChoose the size of the key modulus in the range of 360 to 2048 for your\nGeneral Purpose Keys. Choosing a key modulus greater than 512 may take\na few minutes.\n`,
                    modeChanged: true,
                  };
                }, 'Generate RSA key pairs', { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'rsa_keys', dimension: SKILL_DIMENSION.CONFIGURE }),
              ],
            }),
          ],
        }),
      ],
    }),
    node('service', {
      help: 'Modify service settings',
      children: [
        cmd('password-encryption', (device) => {
          device.runningConfig.servicePasswordEncryption = true;
          return { output: '', stateChanged: true };
        }, 'Encrypt local line and username passwords in configuration files', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'service_password_encryption', dimension: SKILL_DIMENSION.CONFIGURE }),
      ],
    }),
    node('no', {
      help: 'Negate a command or set its defaults',
      children: [
        node('ip', {
          help: 'Negate an IP command',
          children: [
            cmd('domain-lookup', (device) => {
              device.runningConfig.noIpDomainLookup = true;
              return { output: '', stateChanged: true };
            }, 'Disable DNS lookups', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'disable_dns_lookup', dimension: SKILL_DIMENSION.CONFIGURE }),
          ],
        }),
        node('service', {
          help: 'Negate a service setting',
          children: [
            cmd('password-encryption', (device) => {
              device.runningConfig.servicePasswordEncryption = false;
              return { output: '', stateChanged: true };
            }, 'Do not encrypt passwords in configuration files'),
          ],
        }),
      ],
    }),
    node('enable', {
      help: 'Modify enable password parameters',
      children: [
        cmd('secret', (device, tokens) => {
          if (tokens.length < 3) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
          device.runningConfig.enableSecret = tokens[2];
          return { output: '', stateChanged: true };
        }, 'Specify an enable secret password', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'enable_secret', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<password>']),
      ],
    }),
    node('username', {
      help: 'Establish User Name Authentication',
      skill: { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'local_user', dimension: SKILL_DIMENSION.CONFIGURE },
      complete: () => ['<name>'],
      children: [
        node('<name>', {
          help: 'Username name',
          complete: () => ['secret', 'password'],
          children: [
            cmd('secret', (device, tokens) => {
              if (tokens.length < 4) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
              device.runningConfig.users[tokens[1]] = { secret: tokens[3] };
              return { output: '', stateChanged: true };
            }, 'Specify a secret for the user', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'local_user', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<password>']),
            cmd('password', (device, tokens) => {
              if (tokens.length < 4) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
              device.runningConfig.users[tokens[1]] = { password: tokens[3] };
              return { output: '', stateChanged: true };
            }, 'Specify a password for the user', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'local_user', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<password>']),
          ],
        }),
      ],
    }),
    buildInterfaceSelectionCommand(),
    cmd('vlan', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      const id = parseInt(tokens[1], 10);
      if (Number.isNaN(id) || id < 1 || id > 4094) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
      ensureVlan(device, id);
      device.cli.mode = CLI_MODE.VLAN_CONFIG;
      device.cli.currentVlanId = id;
      return { output: '', modeChanged: true };
    }, 'Configure VLAN parameters', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'vlan_configuration', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<1-4094>']),
    node('line', {
      help: 'Select a line to configure',
      children: [
        cmd('console', (device, tokens) => {
          if (tokens.length < 3) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
          device.cli.mode = CLI_MODE.LINE_CONSOLE_CONFIG;
          device.cli.currentLine = 'console';
          return { output: '', modeChanged: true };
        }, 'Select a console line to configure', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'console_security', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['0']),
        cmd('vty', (device, tokens) => {
          if (tokens.length < 3) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
          device.cli.mode = CLI_MODE.LINE_VTY_CONFIG;
          device.cli.currentLine = 'vty';
          return { output: '', modeChanged: true };
        }, 'Select a vty line to configure', { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'vty_login_local', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['0', '15']),
      ],
    }),
    cmd('exit', (device) => {
      device.cli.mode = CLI_MODE.PRIVILEGED_EXEC;
      device.cli.currentInterface = null;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true };
    }, 'Exit from configuration mode'),
    cmd('end', (device) => {
      device.cli.mode = CLI_MODE.PRIVILEGED_EXEC;
      device.cli.currentInterface = null;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true };
    }, 'End configuration mode and return to privileged EXEC'),
  ],
  [CLI_MODE.INTERFACE_CONFIG]: [
    cmd('do', executeDoCommand, 'Execute an EXEC command from configuration mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'do_command', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<command>']),
    node('ip', {
      help: 'Interface Internet Protocol config commands',
      children: [
        cmd('address', (device, tokens) => {
          if (tokens.length < 4) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
          if (!isValidIpv4(tokens[2])) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
          if (!isValidMask(tokens[3])) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
          const iface = device.runningConfig.interfaces[device.cli.currentInterface];
          iface.ipv4 = tokens[2];
          iface.mask = tokens[3];
          return { output: '', stateChanged: true };
        }, 'Set the IP address of an interface', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'interface_ip', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<ip>', '<mask>']),
      ],
    }),
    node('no', {
      help: 'Negate a command or set its defaults',
      children: [
        cmd('shutdown', (device) => {
          setInterfaceShutdown(device, false);
          return { output: '', stateChanged: true };
        }, 'Cancel shutdown and enable the interface', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'interface_enable', dimension: SKILL_DIMENSION.CONFIGURE }),
        node('ip', {
          help: 'Remove IP configuration',
          children: [
            cmd('address', (device) => {
              const iface = device.runningConfig.interfaces[device.cli.currentInterface];
              iface.ipv4 = null;
              iface.mask = null;
              return { output: '', stateChanged: true };
            }, 'Remove the IP address from the interface', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'interface_ip', dimension: SKILL_DIMENSION.CONFIGURE }),
          ],
        }),
      ],
    }),
    cmd('shutdown', (device) => {
      setInterfaceShutdown(device, true);
      return { output: '', stateChanged: true };
    }, 'Shut down the interface', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'interface_enable', dimension: SKILL_DIMENSION.CONFIGURE }),
    cmd('description', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      const description = tokens.slice(1).join(' ');
      forEachTargetInterface(device, (iface) => { iface.description = description; });
      return { output: '', stateChanged: true };
    }, 'Interface specific description', null, () => ['<text>']),
    buildSwitchportNode(),
    buildInterfaceSelectionCommand(),
    node('encapsulation', {
      help: 'Set encapsulation type for a subinterface',
      children: [
        cmd('dot1q', (device, tokens, leftover) => {
          if (!leftover || leftover.length < 1) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
          const vlanId = parseInt(leftover[0], 10);
          if (Number.isNaN(vlanId) || vlanId < 1 || vlanId > 4094) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
          const ids = getTargetInterfaceIds(device);
          if (ids.length === 0) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
          for (const id of ids) {
            const iface = device.runningConfig.interfaces[id];
            if (iface.type !== 'subinterface') return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
            iface.encapsulationVlan = vlanId;
            iface.encapsulationDot1q = true;
          }
          return { output: '', stateChanged: true };
        }, '802.1Q encapsulation with VLAN ID', { domainId: 'cisco', skillId: 'routing', subskillId: 'inter_vlan.encapsulation_dot1q', dimension: SKILL_DIMENSION.CONFIGURE }),
      ],
    }),
    cmd('exit', (device) => {
      device.cli.mode = CLI_MODE.GLOBAL_CONFIG;
      device.cli.currentInterface = null;
      return { output: '', modeChanged: true };
    }, 'Exit from interface configuration mode'),
    cmd('end', (device) => {
      device.cli.mode = CLI_MODE.PRIVILEGED_EXEC;
      device.cli.currentInterface = null;
      device.cli.currentInterfaceRange = null;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true };
    }, 'End configuration mode and return to privileged EXEC'),
  ],
  [CLI_MODE.INTERFACE_RANGE_CONFIG]: [
    cmd('do', executeDoCommand, 'Execute an EXEC command from configuration mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'do_command', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<command>']),
    node('no', {
      help: 'Negate a command or set its defaults',
      children: [
        cmd('shutdown', (device) => {
          setInterfaceShutdown(device, false);
          return { output: '', stateChanged: true };
        }, 'Cancel shutdown and enable the interfaces', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'interface_enable', dimension: SKILL_DIMENSION.CONFIGURE }),
      ],
    }),
    cmd('shutdown', (device) => {
      setInterfaceShutdown(device, true);
      return { output: '', stateChanged: true };
    }, 'Shut down the interfaces', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'interface_enable', dimension: SKILL_DIMENSION.CONFIGURE }),
    cmd('description', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      const description = tokens.slice(1).join(' ');
      forEachTargetInterface(device, (iface) => { iface.description = description; });
      return { output: '', stateChanged: true };
    }, 'Interface specific description', null, () => ['<text>']),
    buildSwitchportNode(),
    buildInterfaceSelectionCommand(),
    cmd('exit', (device) => {
      device.cli.mode = CLI_MODE.GLOBAL_CONFIG;
      device.cli.currentInterfaceRange = null;
      return { output: '', modeChanged: true };
    }, 'Exit from interface range configuration mode'),
    cmd('end', (device) => {
      device.cli.mode = CLI_MODE.PRIVILEGED_EXEC;
      device.cli.currentInterface = null;
      device.cli.currentInterfaceRange = null;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true };
    }, 'End configuration mode and return to privileged EXEC'),
  ],
  [CLI_MODE.VLAN_CONFIG]: [
    cmd('do', executeDoCommand, 'Execute an EXEC command from configuration mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'do_command', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<command>']),
    // Cross-config transition: from VLAN_CONFIG a new VLAN can be created directly.
    cmd('vlan', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      const id = parseInt(tokens[1], 10);
      if (Number.isNaN(id) || id < 1 || id > 4094) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
      ensureVlan(device, id);
      device.cli.currentVlanId = id;
      return { output: '', modeChanged: true, stateChanged: true };
    }, 'Configure VLAN parameters from VLAN config mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'vlan_configuration', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<1-4094>']),
    buildInterfaceSelectionCommand(),
    cmd('name', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      const vlan = device.runningConfig.vlans[device.cli.currentVlanId];
      if (!vlan) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
      vlan.name = tokens.slice(1).join(' ').toUpperCase();
      return { output: '', stateChanged: true };
    }, 'Set VLAN name', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'vlan_configuration', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<name>']),
    cmd('exit', (device) => {
      device.cli.mode = CLI_MODE.GLOBAL_CONFIG;
      device.cli.currentVlanId = null;
      return { output: '', modeChanged: true };
    }, 'Exit from VLAN configuration mode'),
    cmd('end', (device) => {
      device.cli.mode = CLI_MODE.PRIVILEGED_EXEC;
      device.cli.currentInterface = null;
      device.cli.currentInterfaceRange = null;
      device.cli.currentLine = null;
      device.cli.currentVlanId = null;
      return { output: '', modeChanged: true };
    }, 'End configuration mode and return to privileged EXEC'),
  ],
  [CLI_MODE.LINE_CONSOLE_CONFIG]: [
    cmd('do', executeDoCommand, 'Execute an EXEC command from configuration mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'do_command', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<command>']),
    cmd('exec', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      return { output: '' };
    }, 'Execute a command on a line', { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'exec_line', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<command>']),
    node('exec-timeout', {
      help: 'Set interval for closing connection on an EXEC session',
      skill: { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'exec_timeout', dimension: SKILL_DIMENSION.CONFIGURE },
      children: [
        node('<minutes>', {
          help: 'Minutes (0-35791)',
          complete: () => ['<0-35791>'],
          execute: (device, tokens) => {
            const minutes = parseInt(tokens[1], 10);
            if (Number.isNaN(minutes)) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
            const seconds = tokens[2] ? parseInt(tokens[2], 10) : 0;
            if (Number.isNaN(seconds)) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
            device.runningConfig.lines.console.execTimeout = { minutes, seconds };
            return { output: '', stateChanged: true };
          },
          children: [
            node('<seconds>', {
              help: 'Seconds (0-2147483)',
              complete: () => ['<0-2147483>'],
              execute: (device, tokens) => {
                const minutes = parseInt(tokens[1], 10);
                if (Number.isNaN(minutes)) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
                const seconds = parseInt(tokens[2], 10);
                if (Number.isNaN(seconds)) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
                device.runningConfig.lines.console.execTimeout = { minutes, seconds };
                return { output: '', stateChanged: true };
              },
            }),
          ],
        }),
      ],
    }),
    cmd('password', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      device.runningConfig.lines.console.password = tokens[1];
      return { output: '', stateChanged: true };
    }, 'Specify a password on a line', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'console_security', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<password>']),
    node('login', {
      help: 'Enable password checking at login',
      execute: (device) => {
        device.runningConfig.lines.console.login = true;
        device.runningConfig.lines.console.loginLocal = false;
        return { output: '', stateChanged: true };
      },
      skill: { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'login_local', dimension: SKILL_DIMENSION.CONFIGURE },
      children: [
        cmd('local', (device) => {
          device.runningConfig.lines.console.login = false;
          device.runningConfig.lines.console.loginLocal = true;
          return { output: '', stateChanged: true };
        }, 'Enable local username/password checking', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'login_local', dimension: SKILL_DIMENSION.CONFIGURE }),
      ],
    }),
    node('no', {
      help: 'Negate a line configuration command',
      children: [
        cmd('exec-timeout', (device) => {
          device.runningConfig.lines.console.execTimeout = { minutes: 5, seconds: 0 };
          return { output: '', stateChanged: true };
        }, 'Reset EXEC timeout to default'),
        cmd('login', (device) => {
          device.runningConfig.lines.console.login = false;
          device.runningConfig.lines.console.loginLocal = false;
          return { output: '', stateChanged: true };
        }, 'Disable login checking on this line'),
        cmd('password', (device) => {
          device.runningConfig.lines.console.password = null;
          return { output: '', stateChanged: true };
        }, 'Remove the line password'),
      ],
    }),
    cmd('exit', (device) => {
      device.cli.mode = CLI_MODE.GLOBAL_CONFIG;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true };
    }, 'Exit from line configuration mode'),
    cmd('end', (device) => {
      device.cli.mode = CLI_MODE.PRIVILEGED_EXEC;
      device.cli.currentInterface = null;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true };
    }, 'End configuration mode and return to privileged EXEC'),
  ],
  [CLI_MODE.LINE_VTY_CONFIG]: [
    cmd('do', executeDoCommand, 'Execute an EXEC command from configuration mode', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'do_command', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<command>']),
    cmd('exec', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      return { output: '' };
    }, 'Execute a command on a line', { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'exec_line', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<command>']),
    node('exec-timeout', {
      help: 'Set interval for closing connection on an EXEC session',
      skill: { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'exec_timeout', dimension: SKILL_DIMENSION.CONFIGURE },
      children: [
        node('<minutes>', {
          help: 'Minutes (0-35791)',
          complete: () => ['<0-35791>'],
          execute: (device, tokens) => {
            const minutes = parseInt(tokens[1], 10);
            if (Number.isNaN(minutes)) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
            const seconds = tokens[2] ? parseInt(tokens[2], 10) : 0;
            if (Number.isNaN(seconds)) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
            device.runningConfig.lines.vty.execTimeout = { minutes, seconds };
            return { output: '', stateChanged: true };
          },
          children: [
            node('<seconds>', {
              help: 'Seconds (0-2147483)',
              complete: () => ['<0-2147483>'],
              execute: (device, tokens) => {
                const minutes = parseInt(tokens[1], 10);
                if (Number.isNaN(minutes)) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
                const seconds = parseInt(tokens[2], 10);
                if (Number.isNaN(seconds)) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
                device.runningConfig.lines.vty.execTimeout = { minutes, seconds };
                return { output: '', stateChanged: true };
              },
            }),
          ],
        }),
      ],
    }),
    cmd('password', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      device.runningConfig.lines.vty.password = tokens[1];
      return { output: '', stateChanged: true };
    }, 'Specify a password on a line', { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'local_user', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<password>']),
    node('login', {
      help: 'Enable password checking at login',
      execute: (device) => {
        device.runningConfig.lines.vty.login = true;
        device.runningConfig.lines.vty.loginLocal = false;
        return { output: '', stateChanged: true };
      },
      skill: { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'vty_login_local', dimension: SKILL_DIMENSION.CONFIGURE },
      children: [
        cmd('local', (device) => {
          device.runningConfig.lines.vty.login = false;
          device.runningConfig.lines.vty.loginLocal = true;
          return { output: '', stateChanged: true };
        }, 'Enable local username/password checking', { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'vty_login_local', dimension: SKILL_DIMENSION.CONFIGURE }),
      ],
    }),
    node('transport', {
      help: 'Define transport protocols for line',
      children: [
        node('input', {
          help: 'Define which protocols to use to transport incoming connections',
          complete: () => ['ssh', 'telnet', 'all', 'none'],
          execute: (device, tokens) => {
            const values = tokens.slice(2).map((t) => t.toLowerCase());
            if (values.length === 0) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
            const valid = ['ssh', 'telnet', 'all', 'none'];
            if (values.some((v) => !valid.includes(v))) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
            device.runningConfig.lines.vty.transportInput = values.includes('all') ? ['telnet', 'ssh'] : values.includes('none') ? [] : values;
            return { output: '', stateChanged: true };
          },
          skill: { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'vty_transport_ssh', dimension: SKILL_DIMENSION.CONFIGURE },
        }),
      ],
    }),
    node('no', {
      help: 'Negate a line configuration command',
      children: [
        cmd('exec-timeout', (device) => {
          device.runningConfig.lines.vty.execTimeout = { minutes: 10, seconds: 0 };
          return { output: '', stateChanged: true };
        }, 'Reset EXEC timeout to default'),
        cmd('login', (device) => {
          device.runningConfig.lines.vty.login = false;
          device.runningConfig.lines.vty.loginLocal = false;
          return { output: '', stateChanged: true };
        }, 'Disable login checking on this line'),
        cmd('password', (device) => {
          device.runningConfig.lines.vty.password = null;
          return { output: '', stateChanged: true };
        }, 'Remove the line password'),
      ],
    }),
    cmd('exit', (device) => {
      device.cli.mode = CLI_MODE.GLOBAL_CONFIG;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true };
    }, 'Exit from line configuration mode'),
    cmd('end', (device) => {
      device.cli.mode = CLI_MODE.PRIVILEGED_EXEC;
      device.cli.currentInterface = null;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true };
    }, 'End configuration mode and return to privileged EXEC'),
  ],
  [CLI_MODE.CRYPTO_RSA_MODULUS_PROMPT]: [
    node('<modulus>', {
      help: 'The size of the key modulus [512]',
      complete: () => ['<360-2048>'],
      execute: (device, tokens) => {
        const modulus = parseInt(tokens[0], 10);
        if (Number.isNaN(modulus) || modulus < 360 || modulus > 2048) {
          return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
        }
        device.runningConfig.cryptoKey = { exists: true, modulus };
        device.cli.mode = CLI_MODE.GLOBAL_CONFIG;
        return {
          output: `% The key modulus size is ${modulus} bits\n% Generating ${modulus} bit RSA keys, keys will be non-exportable...[OK]`,
          stateChanged: true,
          modeChanged: true,
        };
      },
      skill: { domainId: 'cisco', skillId: 'remote_administration', subskillId: 'rsa_keys', dimension: SKILL_DIMENSION.CONFIGURE },
    }),
  ],
};

// ============================================================================
// Parser and executor
// ============================================================================

function tokenize(input) {
  return input.trim().split(/\s+/).filter(Boolean);
}

function isArgumentWildcard(keyword) {
  return keyword.startsWith('<') && keyword.endsWith('>');
}

function resolveNode(nodes, keyword) {
  const lower = keyword.toLowerCase();
  // Prefer exact concrete keyword matches first.
  const exactMatches = nodes.filter((n) => !isArgumentWildcard(n.keyword) && n.keyword === lower);
  if (exactMatches.length === 1) return { result: exactMatches[0], error: null };
  if (exactMatches.length > 1) return { result: null, error: CLI_ERROR.AMBIGUOUS_COMMAND };
  // Then concrete keyword prefix matches.
  const concreteMatches = nodes.filter((n) => !isArgumentWildcard(n.keyword) && n.keyword.startsWith(lower));
  if (concreteMatches.length === 1) return { result: concreteMatches[0], error: null };
  if (concreteMatches.length > 1) return { result: null, error: CLI_ERROR.AMBIGUOUS_COMMAND };
  // Finally argument wildcards.
  const wildcardMatches = nodes.filter((n) => isArgumentWildcard(n.keyword) && lower.length > 0);
  if (wildcardMatches.length === 1) return { result: wildcardMatches[0], error: null };
  if (wildcardMatches.length > 1) return { result: null, error: CLI_ERROR.AMBIGUOUS_COMMAND };
  return { result: null, error: CLI_ERROR.UNKNOWN_COMMAND };
}

function walkCommandTree(device, tokens, rootNodes) {
  let nodes = rootNodes;
  let node = null;
  const path = [];
  let i = 0;
  for (i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const resolved = resolveNode(nodes, token);
    if (resolved.error) {
      return { node, tokens: tokens.slice(i), path, error: resolved.error, partial: token, errorTokenIndex: i };
    }
    node = resolved.result;
    path.push(node);
    if (!node.children || node.children.length === 0) {
      return { node, tokens: tokens.slice(i + 1), path, error: null };
    }
    nodes = node.children;
  }
  if (node && node.execute) {
    return { node, tokens: [], path, error: null, errorTokenIndex: tokens.length };
  }
  return { node, tokens: [], path, error: CLI_ERROR.INCOMPLETE_COMMAND, errorTokenIndex: tokens.length };
}

export function buildPrompt(device) {
  const base = device.hostname;
  switch (device.cli.mode) {
    case CLI_MODE.USER_EXEC:
      return `${base}>`;
    case CLI_MODE.PRIVILEGED_EXEC:
      return `${base}#`;
    case CLI_MODE.GLOBAL_CONFIG:
      return `${base}(config)#`;
    case CLI_MODE.INTERFACE_CONFIG:
      return `${base}(config-if)#`;
    case CLI_MODE.INTERFACE_RANGE_CONFIG:
      return `${base}(config-if-range)#`;
    case CLI_MODE.VLAN_CONFIG:
      return `${base}(config-vlan)#`;
    case CLI_MODE.LINE_CONSOLE_CONFIG:
    case CLI_MODE.LINE_VTY_CONFIG:
      return `${base}(config-line)#`;
    case CLI_MODE.CRYPTO_RSA_MODULUS_PROMPT:
      return 'How many bits in the modulus [512]:';
    default:
      return `${base}>`;
  }
}

function applySkillMetadata(device, skill) {
  if (!skill) return;
  recordSkillEvent(skill.domainId, skill.skillId, skill.subskillId, {
    dimension: skill.dimension || SKILL_DIMENSION.CONFIGURE,
    correct: true,
    source: 'lab',
  });
}

function executeDoCommand(device, tokens) {
  if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
  const subCommand = tokens.slice(1).join(' ');
  const savedMode = device.cli.mode;
  const savedInterface = device.cli.currentInterface;
  const savedLine = device.cli.currentLine;
  device.cli.mode = CLI_MODE.PRIVILEGED_EXEC;
  device.cli.currentInterface = null;
  device.cli.currentLine = null;
  const result = executeCommand(device, subCommand, { helpCompact: true });
  device.cli.mode = savedMode;
  device.cli.currentInterface = savedInterface;
  device.cli.currentLine = savedLine;
  return {
    output: result.output,
    error: result.error,
    stateChanged: result.stateChanged,
    resolvedCommand: result.success && result.resolvedCommand ? `do ${result.resolvedCommand}` : undefined,
  };
}

export function executeCommand(device, input, options = {}) {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      success: true,
      command: '',
      output: '',
      prompt: buildPrompt(device),
      modeBefore: device.cli.mode,
      modeAfter: device.cli.mode,
      stateChanged: false,
      errorType: null,
    };
  }

  const tokens = tokenize(trimmed);
  const modeBefore = device.cli.mode;

  const questionHelp = handleQuestionMark(device, trimmed, options);
  if (questionHelp) return questionHelp;

  const tree = BASE_COMMAND_TREE[modeBefore] || [];
  const walk = walkCommandTree(device, tokens, tree);

  if (walk.error) {
    let markerStart = -1;
    if (walk.errorTokenIndex >= 0 && walk.errorTokenIndex < tokens.length) {
      let from = 0;
      for (let j = 0; j < walk.errorTokenIndex; j += 1) {
        const pos = findTokenStart(trimmed, tokens[j], from);
        if (pos === -1) break;
        from = pos + tokens[j].length;
      }
      markerStart = findTokenStart(trimmed, walk.partial || tokens[walk.errorTokenIndex], from);
    }
    return {
      success: false,
      command: trimmed,
      output: formatError(walk.error, trimmed, modeBefore, markerStart),
      prompt: buildPrompt(device),
      modeBefore,
      modeAfter: device.cli.mode,
      stateChanged: false,
      errorType: walk.error,
    };
  }

  const node = walk.node;
  if (!node || !node.execute) {
    return {
      success: false,
      command: trimmed,
      resolvedCommand: trimmed,
      output: formatError(CLI_ERROR.INCOMPLETE_COMMAND, trimmed),
      prompt: buildPrompt(device),
      modeBefore,
      modeAfter: device.cli.mode,
      stateChanged: false,
      errorType: CLI_ERROR.INCOMPLETE_COMMAND,
    };
  }

  const pathKeywords = walk.path.map((n) => n.keyword);
  const baseResolved = [...pathKeywords, ...walk.tokens].join(' ').toLowerCase();

  const result = node.execute(device, tokens, walk.tokens);
  const modeAfter = device.cli.mode;
  const stateChanged = result.stateChanged || result.modeChanged || false;
  const resolvedCommand = result.resolvedCommand || baseResolved;

  if (stateChanged && node.skill) {
    applySkillMetadata(device, node.skill);
  }

  device.history.push({ input: trimmed, output: result.output, at: Date.now() });

  if (result.error) {
    return {
      success: false,
      command: tokens.join(' '),
      resolvedCommand,
      output: formatError(result.error, trimmed, modeBefore, -1),
      prompt: buildPrompt(device),
      modeBefore,
      modeAfter,
      stateChanged: false,
      errorType: result.error,
      node,
    };
  }

  return {
    success: true,
    command: trimmed,
    resolvedCommand,
    output: result.output,
    prompt: buildPrompt(device),
    modeBefore,
    modeAfter,
    stateChanged,
    errorType: null,
    node,
  };
}

// ============================================================================
// '?' help handling
// ============================================================================

export function getCommandHelp(device, input, options = {}) {
  const trimmed = input.trimEnd();
  const mode = device.cli.mode;

  // 'do <command>' runs an EXEC command from configuration mode.
  const doTokens = tokenize(trimmed);
  if (doTokens[0] === 'do') {
    const rest = doTokens.slice(1).join(' ');
    const privDevice = {
      ...device,
      cli: { ...device.cli, mode: CLI_MODE.PRIVILEGED_EXEC, currentInterface: null, currentLine: null },
    };
    const help = getCommandHelp(privDevice, rest, options);
    const restAfter = help.inputAfterHelp !== undefined ? help.inputAfterHelp : rest;
    return {
      ...help,
      inputAfterHelp: `do ${restAfter}`,
      mode,
    };
  }

  const isSyntax = trimmed.endsWith(' ?');
  const isPartial = trimmed.endsWith('?') && !isSyntax;

  if (isSyntax) {
    const prefix = trimmed.slice(0, -2).trimEnd();
    const help = renderCommandHelp(device, prefix, options);
    return {
      help,
      inputAfterHelp: `${prefix}${prefix ? ' ' : ''}`,
      isHelp: true,
      mode,
    };
  }

  if (isPartial) {
    const prefix = trimmed.slice(0, -1).trimEnd();
    const help = renderPartialWordHelp(device, prefix, options);
    return {
      help,
      inputAfterHelp: prefix,
      isHelp: true,
      mode,
    };
  }

  return { help: '', inputAfterHelp: trimmed, isHelp: false, mode };
}

function handleQuestionMark(device, input, options) {
  const help = getCommandHelp(device, input, options);
  if (!help.isHelp) return null;
  return {
    success: true,
    command: input,
    output: help.help,
    prompt: buildPrompt(device),
    modeBefore: help.mode,
    modeAfter: help.mode,
    stateChanged: false,
    errorType: null,
    isHelp: true,
  };
}

function findTokenStart(input, token, fromIndex = 0) {
  if (!token) return -1;
  return input.toLowerCase().indexOf(token.toLowerCase(), fromIndex);
}

function findParentAndPartial(device, prefix) {
  const tree = BASE_COMMAND_TREE[device.cli.mode] || [];
  if (!prefix) return { parent: tree, partial: '', resolved: null };
  const tokens = tokenize(prefix);
  if (tokens.length === 0) return { parent: tree, partial: '', resolved: null };

  const partial = tokens[tokens.length - 1].toLowerCase();
  const pathTokens = tokens.slice(0, -1);

  let nodes = tree;
  let resolved = null;
  for (const token of pathTokens) {
    const match = resolveNode(nodes, token);
    if (match.error || !match.result.children || match.result.children.length === 0) {
      return { parent: tree, partial, resolved: null };
    }
    resolved = match.result;
    nodes = match.result.children;
  }
  return { parent: nodes, partial, resolved };
}

function renderPartialWordHelp(device, prefix, options) {
  const { parent, partial } = findParentAndPartial(device, prefix);
  const matches = collectMatches(parent, partial);
  if (matches.length === 0) return '';
  return formatHelpList(matches, options.helpCompact);
}

function renderCommandHelp(device, prefix, options) {
  const tokens = tokenize(prefix);
  const tree = BASE_COMMAND_TREE[device.cli.mode] || [];
  if (tokens.length === 0) {
    return formatHelpList(tree, options.helpCompact);
  }

  const walk = walkCommandTree(device, tokens, tree);
  let node = walk.node;

  // If we walked into an argument wildcard, the wildcard itself is the
  // resolved parent; show its children (the next valid keywords/arguments).
  if ((walk.error && walk.error !== CLI_ERROR.INCOMPLETE_COMMAND) || !node) {
    return '';
  }

  if (isArgumentWildcard(node.keyword) && node.children && node.children.length > 0) {
    node = { children: node.children };
  }

  if (!node.children || node.children.length === 0) {
    return '<cr>';
  }

  return formatHelpList(node.children, options.helpCompact);
}

function collectMatches(nodes, lowerPrefix) {
  return nodes.filter((node) => lowerPrefix === '' || node.keyword.startsWith(lowerPrefix));
}

function formatHelpList(nodes, compact) {
  const maxLen = Math.max(...nodes.map((n) => n.keyword.length), 1);
  const lines = nodes.map((node) => {
    const padded = node.keyword.padEnd(maxLen + 2);
    if (compact) return `${padded}`;
    return `${padded} ${node.help || ''}`;
  });
  return lines.join('\n');
}

// ============================================================================
// Tab completion
// ============================================================================

export function completeInput(device, input) {
  const tokens = tokenize(input);

  if (tokens[0] === 'do') {
    const rest = tokens.slice(1).join(' ');
    if (!rest) return { completion: 'do ', suggestions: [] };
    const privDevice = {
      ...device,
      cli: { ...device.cli, mode: CLI_MODE.PRIVILEGED_EXEC, currentInterface: null, currentLine: null },
    };
    const result = completeInput(privDevice, rest);
    if (result.completion) {
      return { completion: `do ${result.completion}`, suggestions: [] };
    }
    return { completion: null, suggestions: result.suggestions };
  }

  const tree = BASE_COMMAND_TREE[device.cli.mode] || [];

  if (tokens.length === 0) {
    return { completion: null, suggestions: [] };
  }

  let nodes = tree;
  const consumed = [];
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const resolved = resolveNode(nodes, tokens[i]);
    if (resolved.error || !resolved.result.children) {
      return { completion: null, suggestions: [] };
    }
    consumed.push(tokens[i]);
    nodes = resolved.result.children;
  }

  const lastToken = tokens[tokens.length - 1].toLowerCase();
  const exact = nodes.find((n) => n.keyword === lastToken);
  const matches = exact ? [exact] : nodes.filter((n) => n.keyword.startsWith(lastToken));

  if (matches.length === 1) {
    const head = consumed.join(' ');
    return {
      completion: `${head}${head ? ' ' : ''}${matches[0].keyword}`,
      suggestions: [],
    };
  }

  return {
    completion: null,
    suggestions: matches.map((m) => m.keyword),
  };
}

// ============================================================================
// Error formatting
// ============================================================================

function isConfigMode(mode) {
  return mode === CLI_MODE.GLOBAL_CONFIG
    || mode === CLI_MODE.INTERFACE_CONFIG
    || mode === CLI_MODE.INTERFACE_RANGE_CONFIG
    || mode === CLI_MODE.VLAN_CONFIG
    || mode === CLI_MODE.LINE_CONSOLE_CONFIG
    || mode === CLI_MODE.LINE_VTY_CONFIG;
}

function buildMarker(markerStart) {
  if (markerStart < 0) return '';
  return `${' '.repeat(markerStart)}^`;
}

function buildErrorOutput(message, command, markerStart) {
  const marker = buildMarker(markerStart);
  if (marker) return `${message}\n${command}\n${marker}`;
  return `${message}\n${command}`;
}

export function formatError(errorType, command, mode = CLI_MODE.USER_EXEC, markerStart = -1) {
  switch (errorType) {
    case CLI_ERROR.UNKNOWN_COMMAND:
      if (isConfigMode(mode)) {
        return buildErrorOutput("% Invalid input detected at '^' marker.", command, markerStart);
      }
      return `% Unknown command or computer name, unable to resolve request.\n"${command}"`;
    case CLI_ERROR.AMBIGUOUS_COMMAND:
      return `% Ambiguous command: "${command}"`;
    case CLI_ERROR.INCOMPLETE_COMMAND:
      return `% Incomplete command.`;
    case CLI_ERROR.INVALID_ARGUMENT:
      return buildErrorOutput("% Invalid input detected at '^' marker.", command, markerStart);
    case CLI_ERROR.WRONG_MODE:
      return buildErrorOutput("% Invalid input detected at '^' marker.", command, markerStart);
    default:
      return `% Unknown error for "${command}"`;
  }
}

// ============================================================================
// Show commands
// ============================================================================

function maskType7(value) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  let i = 0;
  const len = value.length;
  while (i < len) {
    const a = value.charCodeAt(i++);
    const b = i < len ? value.charCodeAt(i++) : 0;
    const c = i < len ? value.charCodeAt(i++) : 0;
    const bits = (a << 16) | (b << 8) | c;
    out += chars[(bits >> 18) & 63] + chars[(bits >> 12) & 63] + chars[(bits >> 6) & 63] + chars[bits & 63];
  }
  const pad = len % 3 === 0 ? 0 : len % 3 === 1 ? 2 : 1;
  return `7 ${out.slice(0, out.length - pad)}`;
}

export function renderRunningConfig(device) {
  const cfg = device.runningConfig;
  const lines = [
    'Building configuration...',
    '',
    'Current configuration : 0 bytes',
    '!',
    'version 15.2',
    'service timestamps debug datetime msec',
    'service timestamps log datetime msec',
    `${cfg.servicePasswordEncryption ? '' : 'no '}service password-encryption`,
    '!',
    `hostname ${cfg.hostname}`,
    '!',
  ];

  if (cfg.enableSecret) {
    lines.push(`enable secret ${cfg.enableSecret}`);
    lines.push('!');
  }

  if (cfg.noIpDomainLookup) {
    lines.push('no ip domain-lookup');
    lines.push('!');
  }

  if (cfg.ipDomainName) {
    lines.push(`ip domain-name ${cfg.ipDomainName}`);
    lines.push('!');
  }

  if (cfg.ipDefaultGateway) {
    lines.push(`ip default-gateway ${cfg.ipDefaultGateway}`);
    lines.push('!');
  }

  if (cfg.ipSshVersion) {
    lines.push(`ip ssh version ${cfg.ipSshVersion}`);
    lines.push('!');
  }

  Object.entries(cfg.users).forEach(([name, user]) => {
    const method = user.secret ? 'secret' : 'password';
    let value = user.secret || user.password;
    if (method === 'password' && cfg.servicePasswordEncryption) value = maskType7(value);
    lines.push(`username ${name} ${method} ${value}`);
    lines.push('!');
  });

  function renderInterfaceConfig(iface) {
    lines.push(`interface ${iface.name}`);
    if (iface.description) lines.push(` description ${iface.description}`);
    if (iface.type === 'subinterface') {
      if (iface.encapsulationVlan != null) lines.push(` encapsulation dot1q ${iface.encapsulationVlan}`);
      if (iface.ipv4 && iface.mask) lines.push(` ip address ${iface.ipv4} ${iface.mask}`);
      lines.push(` ${iface.administrativelyDown ? 'shutdown' : 'no shutdown'}`);
    } else if (iface.type === 'svi') {
      // Switched virtual interface (management SVI): no switchport lines,
      // just an IP address and admin state, like a routed interface.
      if (iface.ipv4 && iface.mask) lines.push(` ip address ${iface.ipv4} ${iface.mask}`);
      lines.push(` ${iface.administrativelyDown ? 'shutdown' : 'no shutdown'}`);
    } else {
      if (iface.switchportMode === 'access') lines.push(' switchport mode access');
      if (iface.accessVlan) lines.push(` switchport access vlan ${iface.accessVlan}`);
      if (iface.switchportMode === 'trunk') lines.push(' switchport mode trunk');
      if (iface.trunkAllowedVlans) lines.push(` switchport trunk allowed vlan ${iface.trunkAllowedVlans.join(',')}`);
      if (iface.ipv4 && iface.mask) lines.push(` ip address ${iface.ipv4} ${iface.mask}`);
      lines.push(` ${iface.administrativelyDown ? 'shutdown' : 'no shutdown'}`);
    }
    lines.push('!');
  }

  const allInterfaces = Object.values(cfg.interfaces);
  const physicalInterfaces = allInterfaces.filter((i) => i.type === 'physical');
  const subinterfaces = allInterfaces.filter((i) => i.type === 'subinterface');
  const sviInterfaces = allInterfaces.filter((i) => i.type === 'svi').sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  physicalInterfaces.forEach(renderInterfaceConfig);
  subinterfaces.forEach(renderInterfaceConfig);
  sviInterfaces.forEach(renderInterfaceConfig);

  if (cfg.vlans) {
    Object.values(cfg.vlans)
      .filter((vlan) => vlan.id !== 1)
      .sort((a, b) => a.id - b.id)
      .forEach((vlan) => {
        lines.push(`vlan ${vlan.id}`);
        if (vlan.name) lines.push(` name ${vlan.name}`);
        lines.push('!');
      });
  }

  ['console', 'vty'].forEach((lineType) => {
    const line = cfg.lines[lineType];
    if (lineType === 'console') {
      lines.push('line con 0');
    } else {
      lines.push(`line vty ${line.range?.[0] || 0} ${line.range?.[1] || 15}`);
    }
    if (line.execTimeout) lines.push(` exec-timeout ${line.execTimeout.minutes} ${line.execTimeout.seconds}`);
    if (line.password) {
      const display = cfg.servicePasswordEncryption ? ` password ${maskType7(line.password)}` : ` password ${line.password}`;
      lines.push(display);
    }
    if (line.loginLocal) lines.push(' login local');
    else if (line.login) lines.push(' login');
    if (lineType === 'vty' && line.transportInput) {
      lines.push(line.transportInput.length === 0 ? ' transport input none' : ` transport input ${line.transportInput.join(' ')}`);
    }
    lines.push('!');
  });

  lines.push('end');
  return lines.join('\n');
}

export function renderStartupConfig(device) {
  if (!device.startupConfig) {
    return '\nUsing 0 out of 0 bytes\n';
  }
  const backup = device.runningConfig;
  device.runningConfig = device.startupConfig;
  const rendered = renderRunningConfig(device);
  device.runningConfig = backup;
  return rendered;
}

export function renderIpInterfaceBrief(device) {
  const header = 'Interface              IP-Address      OK? Method Status                Protocol';
  const rows = Object.values(device.runningConfig.interfaces).map((iface) => {
    const name = iface.name.padEnd(22);
    const ip = (iface.ipv4 || 'unassigned').padEnd(15);
    const ok = 'YES'.padEnd(5);
    const method = 'manual'.padEnd(8);
    const status = (iface.administrativelyDown ? 'administratively down' : 'up').padEnd(22);
    const protocol = iface.administrativelyDown ? 'down' : 'up';
    return `${name}${ip}${ok}${method}${status}${protocol}`;
  });
  return [header, ...rows].join('\n');
}

export function renderIpSsh(device) {
  const cfg = device.runningConfig;
  if (!cfg.cryptoKey?.exists || !cfg.ipSshVersion) {
    return '%SSH has not been enabled (no valid RSA key / SSH version configured)';
  }
  const versionLine = cfg.ipSshVersion === 2 ? 'SSH Enabled - version 2.0' : `SSH Enabled - version ${cfg.ipSshVersion}.99`;
  return [
    versionLine,
    `Authentication timeout: 120 secs; Authentication retries: 3`,
    `Minimum expected Diffie Hellman key size: 1024 bits`,
  ].join('\n');
}

export function renderVlanBrief(device) {
  const cfg = device.runningConfig;
  const header = 'VLAN Name                             Status    Ports';
  const separator = '---- -------------------------------- --------- -------------------------------';

  const interfaces = Object.values(cfg.interfaces);
  const lines = [header, separator];

  Object.values(cfg.vlans)
    .sort((a, b) => a.id - b.id)
    .forEach((vlan) => {
      let ports;
      if (vlan.id === 1) {
        ports = interfaces.filter((iface) => !iface.accessVlan && iface.switchportMode !== 'trunk');
      } else {
        ports = interfaces.filter((iface) => iface.accessVlan === vlan.id && iface.switchportMode !== 'trunk');
      }
      const portList = ports.map((iface) => shortInterfaceName(iface.name)).join(', ');
      const idCol = String(vlan.id).padEnd(5);
      const nameCol = (vlan.name || '').padEnd(33);
      const statusCol = 'active'.padEnd(10);
      lines.push(`${idCol}${nameCol}${statusCol}${portList}`);
    });

  return lines.join('\n');
}

function interfaceTypeLabel(iface) {
  if (iface.name.toLowerCase().startsWith('fastethernet')) return '10/100BaseTX';
  if (iface.name.toLowerCase().startsWith('gigabitethernet')) return '100/1000BaseTX';
  return 'unknown';
}

function interfaceVlanColumn(iface) {
  if (iface.switchportMode === 'trunk') return 'trunk';
  if (iface.administrativelyDown) return iface.accessVlan ? String(iface.accessVlan) : '1';
  if (iface.switchportMode === 'access' && iface.accessVlan) return String(iface.accessVlan);
  return '1';
}

export function renderInterfacesStatus(device) {
  const header = 'Port      Name                 Status       Vlan       Duplex  Speed Type';
  const rows = Object.values(device.runningConfig.interfaces).map((iface) => {
    const port = shortInterfaceName(iface.name).padEnd(10);
    const name = (iface.description || '').slice(0, 20).padEnd(21);
    const status = (iface.administrativelyDown ? 'disabled' : iface.operationalStatus || 'notconnect').padEnd(13);
    const vlan = interfaceVlanColumn(iface).padEnd(11);
    const duplex = (iface.duplex || 'auto').padEnd(8);
    const speed = (iface.speed || 'auto').padEnd(6);
    const type = interfaceTypeLabel(iface);
    return `${port}${name}${status}${vlan}${duplex}${speed}${type}`;
  });
  return [header, ...rows].join('\n');
}

// ============================================================================
// Trunk / switchport verification (show interfaces trunk, show interfaces
// <interface> switchport) - Phase 1F.
// ============================================================================

export function renderInterfacesTrunk(device) {
  const trunks = Object.values(device.runningConfig.interfaces).filter((iface) => iface.switchportMode === 'trunk');
  if (trunks.length === 0) return '';

  const modeHeader = 'Port        Mode             Encapsulation  Status        Native vlan';
  const modeRows = trunks.map((iface) => {
    const port = shortInterfaceName(iface.name).padEnd(12);
    const mode = 'on'.padEnd(17);
    const encap = '802.1q'.padEnd(15);
    const status = (iface.administrativelyDown ? 'not-trunking' : 'trunking').padEnd(14);
    const nativeVlan = String(iface.nativeVlan || 1);
    return `${port}${mode}${encap}${status}${nativeVlan}`;
  });

  const vlanHeader = '\nPort        Vlans allowed on trunk';
  const vlanRows = trunks.map((iface) => {
    const port = shortInterfaceName(iface.name).padEnd(12);
    const vlans = iface.trunkAllowedVlans ? iface.trunkAllowedVlans.join(',') : '1-4094';
    return `${port}${vlans}`;
  });

  // "Allowed" (configured on the interface) and "active in management
  // domain" (actually present in the VLAN database) are two different
  // things in real IOS. "switchport trunk allowed vlan" never creates a
  // VLAN, so an allowed ID that was never created with "vlan <id>" shows up
  // here but not in the active list.
  const activeHeader = '\nPort        Vlans allowed and active in management domain';
  const activeRows = trunks.map((iface) => {
    const port = shortInterfaceName(iface.name).padEnd(12);
    const allowedIds = iface.trunkAllowedVlans || Object.keys(device.runningConfig.vlans).map(Number);
    const activeIds = allowedIds.filter((id) => !!device.runningConfig.vlans[id]).sort((a, b) => a - b);
    const vlans = activeIds.length ? activeIds.join(',') : 'none';
    return `${port}${vlans}`;
  });

  return [modeHeader, ...modeRows, vlanHeader, ...vlanRows, activeHeader, ...activeRows].join('\n');
}

export function renderInterfaceSwitchport(iface) {
  const mode = iface.switchportMode || 'access';
  const lines = [
    `Name: ${iface.name}`,
    `Switchport: ${iface.switchportMode ? 'Enabled' : 'Disabled'}`,
    `Administrative Mode: ${mode}`,
    `Operational Mode: ${mode}`,
  ];
  if (mode === 'trunk') {
    lines.push('Administrative Trunking Encapsulation: dot1q');
    lines.push(`Trunking Native Mode VLAN: ${iface.nativeVlan || 1} (default)`);
    lines.push(`Trunking VLANs Enabled: ${iface.trunkAllowedVlans ? iface.trunkAllowedVlans.join(',') : 'ALL'}`);
  } else {
    lines.push(`Access Mode VLAN: ${iface.accessVlan || 1}${iface.accessVlan ? '' : ' (default)'}`);
  }
  return lines.join('\n');
}

// ============================================================================
// Router-on-a-Stick simulation helpers
// ============================================================================

function isInterfaceUp(iface, device) {
  if (iface.administrativelyDown) return false;
  if (iface.type === 'subinterface') {
    const parent = device.runningConfig.interfaces[iface.parentId];
    if (!parent || parent.administrativelyDown) return false;
  }
  return true;
}

export function evaluateRouterOnAStick(device, scenario) {
  const p = scenario.parameters || scenario;
  const rc = device.runningConfig;
  const checks = [];

  // VLANs exist with correct names
  p.vlans.forEach((vlan) => {
    const actual = rc.vlans?.[vlan.id];
    checks.push({
      id: `vlan_${vlan.id}_exists`,
      label: `VLAN ${vlan.id} ${vlan.name} existiert`,
      ok: !!actual && actual.name === vlan.name,
    });
  });

  // Access ports for each VLAN
  p.vlans.forEach((vlan) => {
    const accessPorts = vlan.accessPorts || [];
    const ok = accessPorts.length > 0 && accessPorts.every((id) => {
      const iface = rc.interfaces[id];
      return iface && iface.switchportMode === 'access' && iface.accessVlan === vlan.id && !iface.administrativelyDown;
    });
    checks.push({ id: `vlan_${vlan.id}_access`, label: `Access-Ports für VLAN ${vlan.id}`, ok });
  });

  // Uplink is trunk and allows all VLANs
  const uplink = rc.interfaces[p.uplinkPort];
  const uplinkOk = !!uplink
    && uplink.switchportMode === 'trunk'
    && !uplink.administrativelyDown
    && (!uplink.trunkAllowedVlans || p.vlans.every((v) => uplink.trunkAllowedVlans.includes(v.id)));
  checks.push({ id: 'uplink_trunk', label: 'Switch-Uplink ist Trunk', ok: uplinkOk });

  // Router physical interface is up
  const routerPhysical = rc.interfaces[p.routerPhysicalPort];
  const physicalOk = !!routerPhysical && isInterfaceUp(routerPhysical, device);
  checks.push({ id: 'router_physical_up', label: 'Router-Physikinterface ist aktiv', ok: physicalOk });

  // Subinterface per VLAN with dot1q and gateway IP
  p.vlans.forEach((vlan) => {
    const subId = `${p.routerPhysicalPort}.${vlan.id}`;
    const sub = rc.interfaces[subId];
    const ok = !!sub
      && sub.type === 'subinterface'
      && sub.encapsulationVlan === vlan.id
      && sub.ipv4 === vlan.gateway
      && sub.mask === vlan.mask
      && isInterfaceUp(sub, device);
    checks.push({ id: `subinterface_${vlan.id}`, label: `Subinterface für VLAN ${vlan.id}`, ok });
  });

  return { checks, allCorrect: checks.every((c) => c.ok) };
}

export function isVlanReachable(device, vlanId) {
  const uplink = Object.values(device.runningConfig.interfaces).find((i) => i.switchportMode === 'trunk' && !i.administrativelyDown);
  if (!uplink) return false;
  const allowed = uplink.trunkAllowedVlans || Object.keys(device.runningConfig.vlans).map(Number);
  if (!allowed.includes(Number(vlanId))) return false;
  const routerPhysical = Object.values(device.runningConfig.interfaces).find((i) => i.type === 'physical' && i.name.toLowerCase().startsWith('gigabitethernet'));
  if (!routerPhysical || routerPhysical.administrativelyDown) return false;
  const sub = device.runningConfig.interfaces[`${routerPhysical.id}.${vlanId}`];
  if (!sub || sub.encapsulationVlan !== vlanId || sub.administrativelyDown || !sub.ipv4) return false;
  return true;
}


