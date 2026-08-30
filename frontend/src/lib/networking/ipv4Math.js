// =============================================================================
// Pure, testable IPv4 / binary math helpers used by the Academy lessons.
// No UI, no side effects, no localStorage.
// =============================================================================

export function decimalToBinaryOctet(value) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0 || num > 255) {
    throw new Error(`Value must be an integer between 0 and 255, got ${value}`);
  }
  return num.toString(2).padStart(8, '0');
}

export function binaryOctetToDecimal(binary) {
  const cleaned = String(binary).trim();
  if (!/^[01]{8}$/.test(cleaned)) {
    throw new Error(`Binary must be exactly 8 bits, got ${binary}`);
  }
  return parseInt(cleaned, 2);
}

export function prefixToSubnetMask(prefix) {
  const p = Number(prefix);
  if (!Number.isInteger(p) || p < 0 || p > 32) {
    throw new Error(`Prefix must be an integer between 0 and 32, got ${prefix}`);
  }
  const maskBinary = '1'.repeat(p).padEnd(32, '0');
  const octets = [];
  for (let i = 0; i < 32; i += 8) {
    octets.push(parseInt(maskBinary.slice(i, i + 8), 2));
  }
  return { decimal: octets.join('.'), octets, binary: maskBinary };
}

export function subnetMaskToPrefix(mask) {
  const parts = String(mask).trim().split('.');
  if (parts.length !== 4) {
    throw new Error(`Mask must have four octets, got ${mask}`);
  }
  const octets = parts.map((p) => {
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) {
      throw new Error(`Invalid octet ${p} in mask ${mask}`);
    }
    return n;
  });
  const binary = octets.map((n) => decimalToBinaryOctet(n)).join('');
  if (!/^(1*0*)$/.test(binary)) {
    throw new Error(`Mask has non-contiguous ones: ${mask}`);
  }
  const match = binary.match(/^(1*)/);
  return match ? match[1].length : 0;
}

export function isValidSubnetMask(mask) {
  try {
    subnetMaskToPrefix(mask);
    return true;
  } catch {
    return false;
  }
}

export function getRelevantOctet(prefix) {
  const p = Number(prefix);
  if (!Number.isInteger(p) || p < 0 || p > 32) {
    throw new Error(`Prefix must be between 0 and 32, got ${prefix}`);
  }
  if (p === 0) return 0;
  if (p <= 8) return 0;
  if (p <= 16) return 1;
  if (p <= 24) return 2;
  return 3;
}

export function getHostOctet(prefix) {
  const p = Number(prefix);
  if (!Number.isInteger(p) || p < 0 || p > 32) {
    throw new Error(`Prefix must be between 0 and 32, got ${prefix}`);
  }
  if (p === 0) return 0;
  if (p < 8) return 0;
  if (p < 16) return 1;
  if (p < 24) return 2;
  return 3;
}

export function getNetworkBitsInRelevantOctet(prefix) {
  const p = Number(prefix);
  if (!Number.isInteger(p) || p < 0 || p > 32) {
    throw new Error(`Prefix must be between 0 and 32, got ${prefix}`);
  }
  if (p === 0) return 0;
  const remainder = p % 8;
  return remainder === 0 ? 8 : remainder;
}

export function maskValueForBitsInOctet(bits) {
  const b = Number(bits);
  if (!Number.isInteger(b) || b < 0 || b > 8) {
    throw new Error(`Bits must be between 0 and 8, got ${bits}`);
  }
  if (b === 0) return 0;
  if (b === 8) return 255;
  return 256 - (1 << (8 - b));
}

export function isValidIpv4Address(address) {
  const parts = String(address).trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = Number(p);
    return String(n) === p && Number.isInteger(n) && n >= 0 && n <= 255;
  });
}

export function isPrivateIpv4Address(address) {
  if (!isValidIpv4Address(address)) return false;
  const [a, b] = String(address).split('.').map(Number);
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 127) return true; // loopback treated as private/local use
  if (a === 169 && b === 254) return true; // link-local
  return false;
}

// =============================================================================
// Subnetting calculations
// =============================================================================

function ipv4ToLong(address) {
  if (!isValidIpv4Address(address)) {
    throw new Error(`Invalid IPv4 address: ${address}`);
  }
  return String(address).split('.').reduce((acc, part, idx) => acc + (Number(part) << ((3 - idx) * 8)), 0) >>> 0;
}

function longToIpv4(long) {
  const value = long >>> 0;
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ].join('.');
}

function maskForPrefix(prefix) {
  const p = Number(prefix);
  if (!Number.isInteger(p) || p < 0 || p > 32) {
    throw new Error(`Prefix must be between 0 and 32, got ${prefix}`);
  }
  if (p === 0) return 0;
  return (0xffffffff << (32 - p)) >>> 0;
}

export function calculateNetworkId(ip, prefix) {
  const ipLong = ipv4ToLong(ip);
  const maskLong = maskForPrefix(prefix);
  return longToIpv4(ipLong & maskLong);
}

export function calculateBroadcast(ip, prefix) {
  const ipLong = ipv4ToLong(ip);
  const maskLong = maskForPrefix(prefix);
  return longToIpv4(ipLong | (~maskLong >>> 0));
}

export function calculateFirstHost(ip, prefix) {
  const network = ipv4ToLong(calculateNetworkId(ip, prefix));
  const broadcast = ipv4ToLong(calculateBroadcast(ip, prefix));
  if (prefix >= 31) return longToIpv4(network);
  if (network + 1 > broadcast) return longToIpv4(network);
  return longToIpv4(network + 1);
}

export function calculateLastHost(ip, prefix) {
  const network = ipv4ToLong(calculateNetworkId(ip, prefix));
  const broadcast = ipv4ToLong(calculateBroadcast(ip, prefix));
  if (prefix >= 31) return longToIpv4(broadcast);
  if (broadcast - 1 < network) return longToIpv4(broadcast);
  return longToIpv4(broadcast - 1);
}

export function calculateTotalAddresses(prefix) {
  const p = Number(prefix);
  if (!Number.isInteger(p) || p < 0 || p > 32) {
    throw new Error(`Prefix must be between 0 and 32, got ${prefix}`);
  }
  return 2 ** (32 - p);
}

export function calculateUsableHosts(prefix) {
  const total = calculateTotalAddresses(prefix);
  if (total <= 2) return 0;
  return total - 2;
}

export function subnetBitsForCount(requiredSubnets) {
  const count = Number(requiredSubnets);
  if (!Number.isInteger(count) || count < 1) throw new Error(`Required subnets must be a positive integer, got ${requiredSubnets}`);
  return Math.ceil(Math.log2(count));
}

export function prefixForSubnetCount(basePrefix, requiredSubnets) {
  const prefix = Number(basePrefix);
  const newPrefix = prefix + subnetBitsForCount(requiredSubnets);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 30 || newPrefix > 30) throw new Error('Required subnet count does not fit into the base network');
  return newPrefix;
}

export function hostBitsForRequirement(requiredHosts) {
  const hosts = Number(requiredHosts);
  if (!Number.isInteger(hosts) || hosts < 1) throw new Error(`Required hosts must be a positive integer, got ${requiredHosts}`);
  return Math.ceil(Math.log2(hosts + 2));
}

export function prefixForHostRequirement(basePrefix, requiredHosts) {
  const prefix = Number(basePrefix);
  const newPrefix = 32 - hostBitsForRequirement(requiredHosts);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 30 || newPrefix < prefix || newPrefix > 30) throw new Error('Required host count does not fit into the base network');
  return newPrefix;
}

export function generateFixedSubnetSequence(baseIp, basePrefix, newPrefix) {
  const base = Number(basePrefix);
  const target = Number(newPrefix);
  if (!Number.isInteger(base) || !Number.isInteger(target) || base < 0 || target < base || target > 30) throw new Error('Invalid FLSM prefix range');
  const networkLong = ipv4ToLong(calculateNetworkId(baseIp, base));
  const count = 2 ** (target - base);
  const blockSize = 2 ** (32 - target);
  return Array.from({ length: count }, (_, index) => {
    const network = longToIpv4(networkLong + index * blockSize);
    return {
      network,
      prefix: target,
      broadcast: calculateBroadcast(network, target),
      firstHost: calculateFirstHost(network, target),
      lastHost: calculateLastHost(network, target),
      usableHosts: calculateUsableHosts(target),
    };
  });
}

export function generateSubnetRequirementProblem(difficulty = 'easy', rng = Math.random) {
  const profile = difficulty === 'hard'
    ? { basePrefixes: [16, 17, 20, 21, 22, 23], subnetCounts: [3, 5, 6, 7, 9, 12], hosts: [20, 30, 50, 60, 100, 200] }
    : difficulty === 'medium'
      ? { basePrefixes: [23, 24, 25], subnetCounts: [3, 4, 5, 6], hosts: [10, 15, 20, 30, 50] }
      : { basePrefixes: [24], subnetCounts: [2, 4], hosts: [6, 14, 30, 50] };
  const pick = (values) => values[Math.floor(rng() * values.length)];
  const mode = rng() < 0.5 ? 'subnets' : 'hosts';
  const basePrefix = pick(profile.basePrefixes);
  const firstOctet = 10;
  const secondOctet = Math.floor(rng() * 200);
  const candidate = `${firstOctet}.${secondOctet}.${Math.floor(rng() * 256)}.0`;
  const baseNetwork = calculateNetworkId(candidate, basePrefix);
  if (mode === 'subnets') {
    const requiredSubnets = pick(profile.subnetCounts);
    const newPrefix = prefixForSubnetCount(basePrefix, requiredSubnets);
    return {
      mode,
      baseNetwork,
      basePrefix,
      requiredSubnets,
      borrowedBits: subnetBitsForCount(requiredSubnets),
      newPrefix,
      possibleSubnets: 2 ** (newPrefix - basePrefix),
      jumpSize: calculateJumpSize(newPrefix),
      sequence: generateFixedSubnetSequence(baseNetwork, basePrefix, newPrefix),
    };
  }
  const requiredHosts = pick(profile.hosts);
  const newPrefix = prefixForHostRequirement(basePrefix, requiredHosts);
  return {
    mode,
    baseNetwork,
    basePrefix,
    requiredHosts,
    hostBits: hostBitsForRequirement(requiredHosts),
    newPrefix,
    usableHosts: calculateUsableHosts(newPrefix),
    jumpSize: calculateJumpSize(newPrefix),
    sequence: generateFixedSubnetSequence(baseNetwork, basePrefix, newPrefix),
  };
}

export function calculateJumpSize(prefix) {
  const bits = getNetworkBitsInRelevantOctet(prefix);
  const maskValue = maskValueForBitsInOctet(bits);
  return 256 - maskValue;
}

export function getSubnetBlockBounds(ip, prefix) {
  const network = calculateNetworkId(ip, prefix);
  const broadcast = calculateBroadcast(ip, prefix);
  const relevantOctet = getHostOctet(prefix);
  const networkOctets = network.split('.').map(Number);
  const broadcastOctets = broadcast.split('.').map(Number);
  return {
    relevantOctet,
    lower: networkOctets[relevantOctet],
    upper: broadcastOctets[relevantOctet],
    network,
    broadcast,
  };
}

export function generateSubnetProblem({ prefixMin = 16, prefixMax = 30, allowPrivate = true } = {}) {
  const prefix = Math.floor(Math.random() * (prefixMax - prefixMin + 1)) + prefixMin;
  let octets;
  if (allowPrivate && Math.random() > 0.3) {
    const privateSpaces = [
      [10, [0, 255], [0, 255], [1, 254]],
      [172, [16, 31], [0, 255], [1, 254]],
      [192, [168, 168], [0, 255], [1, 254]],
    ];
    const space = privateSpaces[Math.floor(Math.random() * privateSpaces.length)];
    octets = [
      space[0],
      Math.floor(Math.random() * (space[1][1] - space[1][0] + 1)) + space[1][0],
      Math.floor(Math.random() * (space[2][1] - space[2][0] + 1)) + space[2][0],
      Math.floor(Math.random() * (space[3][1] - space[3][0] + 1)) + space[3][0],
    ];
  } else {
    octets = [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 254) + 1,
    ];
  }
  const ip = octets.join('.');
  return {
    ip,
    prefix,
    network: calculateNetworkId(ip, prefix),
    broadcast: calculateBroadcast(ip, prefix),
    firstHost: calculateFirstHost(ip, prefix),
    lastHost: calculateLastHost(ip, prefix),
    total: calculateTotalAddresses(prefix),
    usable: calculateUsableHosts(prefix),
    jump: calculateJumpSize(prefix),
    relevantOctet: getRelevantOctet(prefix),
    hostOctet: getHostOctet(prefix),
  };
}

// Used to create several unique subnetting exercises in a row.
export function generateUniqueSubnetProblems(count = 3, opts = {}) {
  const problems = [];
  const seen = new Set();
  let safety = 0;
  while (problems.length < count && safety < count * 50) {
    safety += 1;
    const p = generateSubnetProblem(opts);
    const key = `${p.ip}/${p.prefix}`;
    if (!seen.has(key)) {
      seen.add(key);
      problems.push(p);
    }
  }
  return problems;
}

// =============================================================================
// VLSM calculations
// =============================================================================

export function hostsToPrefix(hosts) {
  const h = Number(hosts);
  if (!Number.isInteger(h) || h < 0) throw new Error(`Hosts must be non-negative integer, got ${hosts}`);
  if (h === 0) return 32;
  if (h === 1) return 30;
  // Need at least hosts + 2 addresses (network + broadcast).
  const needed = h + 2;
  const hostBits = Math.ceil(Math.log2(needed));
  if (hostBits > 32) throw new Error(`Host count ${h} exceeds IPv4 address space`);
  return 32 - hostBits;
}

export function prefixToHosts(prefix) {
  const p = Number(prefix);
  if (!Number.isInteger(p) || p < 0 || p > 32) throw new Error(`Prefix must be 0..32, got ${prefix}`);
  if (p === 32) return 0;
  if (p === 31) return 0;
  return 2 ** (32 - p) - 2;
}

function alignNetwork(networkLong, blockSizeLong) {
  const remainder = networkLong % blockSizeLong;
  if (remainder === 0n) return networkLong;
  return networkLong + (blockSizeLong - remainder);
}

export function calculateVlsmAllocations(baseNetwork, basePrefix, requiredHostsList) {
  if (!isValidIpv4Address(baseNetwork)) throw new Error(`Invalid base network: ${baseNetwork}`);
  const baseSize = BigInt(2) ** BigInt(32 - basePrefix);
  let current = BigInt(ipv4ToLong(baseNetwork));
  const end = current + baseSize;
  const sorted = requiredHostsList
    .map((h, i) => ({ originalIndex: i, hosts: Number(h) }))
    .sort((a, b) => b.hosts - a.hosts);

  const allocations = [];
  for (const req of sorted) {
    const prefix = hostsToPrefix(req.hosts);
    const blockSize = BigInt(2) ** BigInt(32 - prefix);
    current = alignNetwork(current, blockSize);
    if (current + blockSize > end) {
      throw new Error(`Base network ${baseNetwork}/${basePrefix} cannot accommodate ${req.hosts} hosts`);
    }
    const network = longToIpv4(Number(current));
    const broadcast = longToIpv4(Number(current + blockSize - 1n));
    const first = prefix >= 31 ? network : longToIpv4(Number(current + 1n));
    const last = prefix >= 31 ? broadcast : longToIpv4(Number(current + blockSize - 2n));
    allocations.push({
      originalIndex: req.originalIndex,
      requiredHosts: req.hosts,
      prefix,
      network,
      broadcast,
      firstHost: first,
      lastHost: last,
      totalAddresses: Number(blockSize),
      usableHosts: prefix >= 31 ? 0 : Number(blockSize) - 2,
    });
    current += blockSize;
  }
  // Return in original requested order.
  return allocations.sort((a, b) => a.originalIndex - b.originalIndex);
}

export function generateVlsmProblem() {
  // Base network large enough for a few small subnets.
  const baseOptions = [
    { network: '192.168.0.0', prefix: 24 },
    { network: '10.0.0.0', prefix: 22 },
    { network: '172.16.0.0', prefix: 22 },
  ];
  const base = baseOptions[Math.floor(Math.random() * baseOptions.length)];
  const required = [60, 28, 12, 5].sort(() => Math.random() - 0.5);
  const allocations = calculateVlsmAllocations(base.network, base.prefix, required);
  return { baseNetwork: base.network, basePrefix: base.prefix, requiredHosts: required, allocations };
}

// =============================================================================
// Supernetting / route summarization
// =============================================================================

function parseNetworkRef(value) {
  const [network, prefixRaw] = typeof value === 'string' ? value.split('/') : [value.network, value.prefix];
  const prefix = Number(prefixRaw);
  if (!isValidIpv4Address(network) || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error(`Invalid network reference: ${JSON.stringify(value)}`);
  const networkId = calculateNetworkId(network, prefix);
  const broadcast = calculateBroadcast(network, prefix);
  return { network: networkId, prefix, networkId, broadcast, start: ipv4ToLong(networkId), end: ipv4ToLong(broadcast) };
}

function commonPrefixForRange(first, last) {
  const xor = BigInt(first) ^ BigInt(last);
  let prefix = 0;
  for (let bit = 31; bit >= 0; bit -= 1) {
    if ((xor >> BigInt(bit)) & 1n) break;
    prefix += 1;
  }
  return prefix;
}

export function areNetworksAdjacent(first, second) {
  const a = parseNetworkRef(first);
  const b = parseNetworkRef(second);
  const [left, right] = a.start <= b.start ? [a, b] : [b, a];
  return left.end + 1 === right.start;
}

export function findMinimalSupernet(networks) {
  if (!networks?.length) throw new Error('At least one network is required');
  const ranges = networks.map(parseNetworkRef).sort((a, b) => a.start - b.start);
  const first = ranges[0].start;
  const last = ranges.reduce((max, range) => Math.max(max, range.end), ranges[0].end);
  const superPrefix = commonPrefixForRange(first, last);
  const superNetwork = calculateNetworkId(longToIpv4(first), superPrefix);
  return {
    superNetwork,
    superPrefix,
    ranges,
    firstAddress: longToIpv4(first),
    lastAddress: longToIpv4(last),
    summaryBroadcast: calculateBroadcast(superNetwork, superPrefix),
    totalAddresses: calculateTotalAddresses(superPrefix),
  };
}

export function canAggregateExactly(networks) {
  const summary = findMinimalSupernet(networks);
  let cursor = summary.ranges[0].start;
  let covered = 0;
  for (const range of summary.ranges) {
    if (range.start !== cursor) return { exact: false, reason: 'gap', summary };
    covered += range.end - range.start + 1;
    cursor = range.end + 1;
  }
  const summaryStart = ipv4ToLong(summary.superNetwork);
  const summaryEnd = ipv4ToLong(summary.summaryBroadcast);
  const exact = summary.ranges[0].start === summaryStart && cursor - 1 === summaryEnd && covered === summary.totalAddresses;
  return { exact, reason: exact ? null : 'alignment', summary };
}

export function aggregateWithoutExpansion(networks) {
  if (!networks?.length) throw new Error('At least one network is required');
  let current = networks.map(parseNetworkRef).map((range) => ({ network: range.networkId, prefix: range.prefix }));
  let changed = true;
  while (changed) {
    changed = false;
    current.sort((a, b) => ipv4ToLong(a.network) - ipv4ToLong(b.network) || b.prefix - a.prefix);
    for (let index = 0; index < current.length - 1; index += 1) {
      const first = current[index];
      const second = current[index + 1];
      if (first.prefix !== second.prefix || !areNetworksAdjacent(first, second)) continue;
      const candidate = { network: calculateNetworkId(first.network, first.prefix - 1), prefix: first.prefix - 1 };
      if (candidate.network !== first.network) continue;
      current.splice(index, 2, candidate);
      changed = true;
      break;
    }
  }
  return current.map((network) => `${network.network}/${network.prefix}`);
}

export function aggregateWithExpansion(networks) {
  const summary = findMinimalSupernet(networks);
  const covered = summary.ranges.reduce((sum, range) => sum + range.end - range.start + 1, 0);
  return {
    network: `${summary.superNetwork}/${summary.superPrefix}`,
    addedAddresses: summary.totalAddresses - covered,
    ...summary,
  };
}

export function calculateSupernet(networks) {
  const summary = findMinimalSupernet(networks);
  return {
    superNetwork: summary.superNetwork,
    superPrefix: summary.superPrefix,
    commonBits: summary.superPrefix,
    ranges: summary.ranges,
    totalAddresses: summary.totalAddresses,
  };
}

export function generateSupernetProblem() {
  const startingOctets = [
    [192, 168, 0],
    [172, 16, 0],
    [10, 0, 0],
  ];
  const [a, b, c] = startingOctets[Math.floor(Math.random() * startingOctets.length)];
  const startN = Math.floor(Math.random() * 8) * 4; // multiples of 4 in third octet
  const count = Math.random() < 0.5 ? 2 : 4;
  const networks = [];
  for (let i = 0; i < count; i += 1) {
    networks.push(`${a}.${b}.${c + startN + i}.0/24`);
  }
  const supernet = calculateSupernet(networks);
  // Distractors: keep same prefix but shifted to adjacent block.
  const distractorOffset = 1 << (8 - supernet.superPrefix % 8); // rough step in relevant octet
  const parts = supernet.superNetwork.split('.').map(Number);
  const relevant = getRelevantOctet(supernet.superPrefix);
  const wrong1 = [...parts];
  wrong1[relevant] += distractorOffset;
  const wrong2 = [...parts];
  wrong2[relevant] -= distractorOffset;
  return {
    networks,
    ...supernet,
    distractors: [wrong1.join('.'), wrong2.join('.')].filter((w) => w !== supernet.superNetwork),
  };
}

