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
  LINE_CONSOLE_CONFIG: 'LINE_CONSOLE_CONFIG',
  LINE_VTY_CONFIG: 'LINE_VTY_CONFIG',
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

function createInterface(id) {
  return {
    id,
    name: id,
    type: 'physical',
    ipv4: null,
    mask: null,
    administrativelyDown: true,
    description: '',
    duplex: null,
    speed: null,
  };
}

export function createCiscoDevice(options = {}) {
  const type = options.type || 'router';
  const hostname = options.hostname || 'Router';
  const interfaces = options.interfaces || ['GigabitEthernet0/0', 'GigabitEthernet0/1'];
  const defaultGateway = options.defaultGateway || null;
  return {
    type,
    hostname,
    runningConfig: {
      hostname,
      noIpDomainLookup: false,
      enableSecret: null,
      users: {},
      interfaces: Object.fromEntries(interfaces.map((id) => [id, createInterface(id)])),
      lines: {
        console: { password: null, login: false, loginLocal: false, execTimeout: [5, 0] },
        vty: { password: null, login: false, loginLocal: false, execTimeout: [10, 0], range: [0, 15] },
      },
      ipDefaultGateway: defaultGateway,
      banner: '',
    },
    startupConfig: null,
    cli: {
      mode: CLI_MODE.USER_EXEC,
      currentInterface: null,
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
          return name ? { output: '', stateChanged: true } : { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
        }, 'Define default domain name', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'domain_name', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<name>']),
        cmd('default-gateway', (device, tokens) => {
          if (tokens.length < 3) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
          if (!isValidIpv4(tokens[2])) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
          device.runningConfig.ipDefaultGateway = tokens[2];
          return { output: '', stateChanged: true };
        }, 'Specify default gateway', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'default_gateway', dimension: SKILL_DIMENSION.CONFIGURE }, () => ['<ip>']),
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
    cmd('interface', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      const target = resolveInterfaceName(device, tokens[1]);
      if (!target) return { output: '', error: CLI_ERROR.INVALID_ARGUMENT };
      device.cli.mode = CLI_MODE.INTERFACE_CONFIG;
      device.cli.currentInterface = target.id;
      return { output: '', modeChanged: true };
    }, 'Select an interface to configure', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'interface_ip', dimension: SKILL_DIMENSION.CONFIGURE }, () => Object.values(INTERFACE_TYPES).map((t) => `${t.canonical}0/0`)),
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
          const iface = device.runningConfig.interfaces[device.cli.currentInterface];
          iface.administrativelyDown = false;
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
      const iface = device.runningConfig.interfaces[device.cli.currentInterface];
      iface.administrativelyDown = true;
      return { output: '', stateChanged: true };
    }, 'Shut down the interface', { domainId: 'cisco', skillId: 'basic_configuration', subskillId: 'interface_enable', dimension: SKILL_DIMENSION.CONFIGURE }),
    cmd('description', (device, tokens) => {
      if (tokens.length < 2) return { output: '', error: CLI_ERROR.INCOMPLETE_COMMAND };
      const iface = device.runningConfig.interfaces[device.cli.currentInterface];
      iface.description = tokens.slice(1).join(' ');
      return { output: '', stateChanged: true };
    }, 'Interface specific description', null, () => ['<text>']),
    cmd('exit', (device) => {
      device.cli.mode = CLI_MODE.GLOBAL_CONFIG;
      device.cli.currentInterface = null;
      return { output: '', modeChanged: true };
    }, 'Exit from interface configuration mode'),
    cmd('end', (device) => {
      device.cli.mode = CLI_MODE.PRIVILEGED_EXEC;
      device.cli.currentInterface = null;
      device.cli.currentLine = null;
      return { output: '', modeChanged: true };
    }, 'End configuration mode and return to privileged EXEC'),
  ],
  [CLI_MODE.LINE_CONSOLE_CONFIG]: [
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
  // Prefer concrete keyword matches over argument wildcards.
  const concreteMatches = nodes.filter((n) => !isArgumentWildcard(n.keyword) && n.keyword.startsWith(lower));
  if (concreteMatches.length === 1) return { result: concreteMatches[0], error: null };
  if (concreteMatches.length > 1) return { result: null, error: CLI_ERROR.AMBIGUOUS_COMMAND };
  const wildcardMatches = nodes.filter((n) => isArgumentWildcard(n.keyword) && lower.length > 0);
  if (wildcardMatches.length === 1) return { result: wildcardMatches[0], error: null };
  if (wildcardMatches.length > 1) return { result: null, error: CLI_ERROR.AMBIGUOUS_COMMAND };
  return { result: null, error: CLI_ERROR.UNKNOWN_COMMAND };
}

function walkCommandTree(device, tokens, rootNodes) {
  let nodes = rootNodes;
  let node = null;
  let i = 0;
  for (i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const resolved = resolveNode(nodes, token);
    if (resolved.error) {
      return { node, tokens: tokens.slice(i), error: resolved.error, partial: token };
    }
    node = resolved.result;
    if (!node.children || node.children.length === 0) {
      return { node, tokens: tokens.slice(i + 1), error: null };
    }
    nodes = node.children;
  }
  return { node, tokens: [], error: CLI_ERROR.INCOMPLETE_COMMAND };
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
    case CLI_MODE.LINE_CONSOLE_CONFIG:
    case CLI_MODE.LINE_VTY_CONFIG:
      return `${base}(config-line)#`;
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
    return {
      success: false,
      command: trimmed,
      output: formatError(walk.error, walk.partial || tokens.join(' '), modeBefore),
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
      output: formatError(CLI_ERROR.INCOMPLETE_COMMAND, trimmed),
      prompt: buildPrompt(device),
      modeBefore,
      modeAfter: device.cli.mode,
      stateChanged: false,
      errorType: CLI_ERROR.INCOMPLETE_COMMAND,
    };
  }

  const result = node.execute(device, tokens, walk.tokens);
  const modeAfter = device.cli.mode;
  const stateChanged = result.stateChanged || result.modeChanged || false;

  if (stateChanged && node.skill) {
    applySkillMetadata(device, node.skill);
  }

  device.history.push({ input: trimmed, output: result.output, at: Date.now() });

  return {
    success: !result.error,
    command: tokens.join(' '),
    output: result.output,
    prompt: buildPrompt(device),
    modeBefore,
    modeAfter,
    stateChanged,
    errorType: result.error || null,
    node,
  };
}

// ============================================================================
// '?' help handling
// ============================================================================

function handleQuestionMark(device, input, options) {
  const trimmed = input.trimEnd();
  const mode = device.cli.mode;

  // Space before '?': show next keywords / arguments for the entered prefix.
  if (trimmed.endsWith(' ?')) {
    const prefix = trimmed.slice(0, -2).trimEnd();
    return {
      success: true,
      command: trimmed,
      output: renderCommandHelp(device, prefix, options),
      prompt: buildPrompt(device),
      modeBefore: mode,
      modeAfter: mode,
      stateChanged: false,
      errorType: null,
      isHelp: true,
    };
  }

  // '?' directly after a word: partial-word help in the resolved command tree.
  if (trimmed.endsWith('?')) {
    const prefix = trimmed.slice(0, -1).trimEnd();
    return {
      success: true,
      command: trimmed,
      output: renderPartialWordHelp(device, prefix, options),
      prompt: buildPrompt(device),
      modeBefore: mode,
      modeAfter: mode,
      stateChanged: false,
      errorType: null,
      isHelp: true,
    };
  }

  return null;
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
  const matches = nodes.filter((n) => n.keyword.startsWith(lastToken));

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
    || mode === CLI_MODE.LINE_CONSOLE_CONFIG
    || mode === CLI_MODE.LINE_VTY_CONFIG;
}

function buildMarker(command) {
  const lastSpace = command.lastIndexOf(' ');
  const markerPos = lastSpace === -1 ? 0 : lastSpace + 1;
  return `${' '.repeat(markerPos)}^`;
}

export function formatError(errorType, command, mode = CLI_MODE.USER_EXEC) {
  switch (errorType) {
    case CLI_ERROR.UNKNOWN_COMMAND:
      if (isConfigMode(mode)) {
        return `% Invalid input detected at '^' marker.\n${command}\n${buildMarker(command)}`;
      }
      return `% Unknown command or computer name, unable to process.\n"${command}"`;
    case CLI_ERROR.AMBIGUOUS_COMMAND:
      return `% Ambiguous command: "${command}"`;
    case CLI_ERROR.INCOMPLETE_COMMAND:
      return `% Incomplete command.`;
    case CLI_ERROR.INVALID_ARGUMENT:
      return `% Invalid input detected at '^' marker.\n${command}\n${buildMarker(command)}`;
    case CLI_ERROR.WRONG_MODE:
      return `% Invalid input detected at '^' marker.\n${command}\n${buildMarker(command)}`;
    default:
      return `% Unknown error for "${command}"`;
  }
}

// ============================================================================
// Show commands
// ============================================================================

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
    'no service password-encryption',
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

  if (cfg.ipDefaultGateway) {
    lines.push(`ip default-gateway ${cfg.ipDefaultGateway}`);
    lines.push('!');
  }

  Object.entries(cfg.users).forEach(([name, user]) => {
    const method = user.secret ? 'secret' : 'password';
    const value = user.secret || user.password;
    lines.push(`username ${name} ${method} ${value}`);
    lines.push('!');
  });

  Object.values(cfg.interfaces).forEach((iface) => {
    lines.push(`interface ${iface.name}`);
    if (iface.description) lines.push(` description ${iface.description}`);
    if (iface.ipv4 && iface.mask) lines.push(` ip address ${iface.ipv4} ${iface.mask}`);
    lines.push(` ${iface.administrativelyDown ? 'shutdown' : 'no shutdown'}`);
    lines.push('!');
  });

  ['console', 'vty'].forEach((lineType) => {
    const line = cfg.lines[lineType];
    if (lineType === 'console') {
      lines.push('line con 0');
    } else {
      lines.push(`line vty ${line.range?.[0] || 0} ${line.range?.[1] || 15}`);
    }
    if (line.password) lines.push(` password ${line.password}`);
    if (line.loginLocal) lines.push(' login local');
    else if (line.login) lines.push(' login');
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


