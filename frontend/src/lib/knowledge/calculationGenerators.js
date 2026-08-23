// =============================================================================
// NEXUS Knowledge Layer – Parametric Calculation Generators
//
// Phase 3: dynamic, difficulty-driven calculation questions for
// Binary, IPv4, Subnet Masks and Subnetting.
//
// Rules:
//   - All math goes through ipv4Math.js (source of truth).
//   - Every generated distractor is mathematically validated.
//   - Difficulty ranges live in the Knowledge Item, not in code.
//   - Generated IPs are never Network/Broadcast unless the target asks for it.
//   - Output includes semantic metadata for the future balancer.
// =============================================================================

import {
  decimalToBinaryOctet,
  binaryOctetToDecimal,
  prefixToSubnetMask,
  subnetMaskToPrefix,
  calculateNetworkId,
  calculateBroadcast,
  calculateFirstHost,
  calculateLastHost,
  calculateUsableHosts,
  calculateJumpSize,
  isValidIpv4Address,
} from '../networking/ipv4Math.js';

export class CalculationError extends Error {
  constructor(message, itemId, family) {
    super(message);
    this.name = 'CalculationError';
    this.itemId = itemId;
    this.family = family;
  }
}

// ---------------------------------------------------------------------------
// IP / prefix helpers
// ---------------------------------------------------------------------------

const PRIVATE_SPACES = [
  { firstOctet: 10, secondMin: 0, secondMax: 255, thirdMin: 0, thirdMax: 255, label: '10.0.0.0/8' },
  { firstOctet: 172, secondMin: 16, secondMax: 31, thirdMin: 0, thirdMax: 255, label: '172.16.0.0/12' },
  { firstOctet: 192, secondMin: 168, secondMax: 168, thirdMin: 0, thirdMax: 255, label: '192.168.0.0/16' },
];

function ipv4ToLong(address) {
  if (!isValidIpv4Address(address)) throw new Error(`Invalid IPv4 address: ${address}`);
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

/**
 * Generate a private network base aligned to the given prefix.
 * Returns { ip, prefix, network } where ip is a valid host address.
 */
function generatePrivateSubnetParams(rng, difficulty, item) {
  const ranges = item.data.difficultyRanges[difficulty] || item.data.difficultyRanges.medium || {};
  const prefixMin = ranges.prefixMin ?? 24;
  const prefixMax = ranges.prefixMax ?? 30;
  const privateOnly = ranges.privateOnly !== false;

  if (prefixMin < 0 || prefixMax > 30) {
    throw new CalculationError(`Unsupported prefix range /${prefixMin}-/${prefixMax}`, item.id, item.data.calculationFamily);
  }

  const prefix = rng.nextInt(prefixMin, prefixMax);
  const space = privateOnly ? rng.pick(PRIVATE_SPACES) : rng.pick(PRIVATE_SPACES); // keep private for now

  // Build a raw network address, then align it to the prefix block.
  const second = prefix > 8 ? rng.nextInt(space.secondMin, space.secondMax) : 0;
  const third = prefix > 16 ? rng.nextInt(space.thirdMin, space.thirdMax) : 0;
  const fourth = 0;
  const raw = [space.firstOctet, second, third, fourth].join('.');

  const networkLong = ipv4ToLong(raw);
  const blockSize = 2 ** (32 - prefix);
  const alignedLong = networkLong - (networkLong % blockSize);
  const network = longToIpv4(alignedLong);

  // Pick a host offset that is never network (0) or broadcast (blockSize-1).
  const maxOffset = Math.max(1, blockSize - 2);
  const hostOffset = rng.nextInt(1, maxOffset);
  const ip = longToIpv4(alignedLong + hostOffset);

  return { ip, prefix, network };
}

// ---------------------------------------------------------------------------
// Distractor strategies – all math-validated
// ---------------------------------------------------------------------------

function normalizeValue(value) {
  return String(value).trim().toLowerCase();
}

function deduplicate(values, correctValue) {
  const seen = new Set([normalizeValue(correctValue)]);
  return values.filter((v) => {
    const key = normalizeValue(v);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pickUpTo(values, count, rng) {
  const pool = [...values];
  const result = [];
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    result.push(rng.pickRemove(pool));
  }
  return result;
}

const DISTRACTOR_STRATEGIES = {
  decimalToBinary: (params, correct, rng) => {
    const candidates = [];
    if (params.decimal > 0) candidates.push(decimalToBinaryOctet(params.decimal - 1));
    if (params.decimal < 255) candidates.push(decimalToBinaryOctet(params.decimal + 1));
    // Single-bit flip at a random position.
    const bits = correct.split('');
    const pos = rng.nextInt(0, 7);
    bits[pos] = bits[pos] === '1' ? '0' : '1';
    candidates.push(bits.join(''));
    // Reverse nibble (common copy error).
    const reversedNibbles = correct.match(/.{4}/g).reverse().join('');
    candidates.push(reversedNibbles);
    return deduplicate(candidates, correct);
  },

  binaryToDecimal: (params, correct, rng) => {
    const candidates = [];
    if (correct > 0) candidates.push(correct - 1);
    if (correct < 255) candidates.push(correct + 1);
    // Place-value swap: swap MSB/LSB halves (treat as 8-bit).
    const binary = params.binary;
    const swapped = binary.slice(4) + binary.slice(0, 4);
    candidates.push(binaryOctetToDecimal(swapped));
    // One-bit flip.
    const bits = binary.split('');
    const pos = rng.nextInt(0, 7);
    bits[pos] = bits[pos] === '1' ? '0' : '1';
    candidates.push(binaryOctetToDecimal(bits.join('')));
    return deduplicate(candidates, correct);
  },

  prefixToMask: (params, correct, _rng) => {
    const candidates = [];
    if (params.prefix > 8) candidates.push(prefixToSubnetMask(params.prefix - 2).decimal);
    if (params.prefix < 30) candidates.push(prefixToSubnetMask(params.prefix + 2).decimal);
    if (params.prefix > 1) candidates.push(prefixToSubnetMask(params.prefix - 1).decimal);
    if (params.prefix < 31) candidates.push(prefixToSubnetMask(params.prefix + 1).decimal);
    return deduplicate(candidates, correct);
  },

  maskToPrefix: (params, correct, _rng) => {
    const candidates = [];
    if (correct > 0) candidates.push(correct - 1);
    if (correct < 32) candidates.push(correct + 1);
    if (correct > 2) candidates.push(correct - 2);
    if (correct < 30) candidates.push(correct + 2);
    return deduplicate(candidates, correct);
  },

  subnettingNetworkId: (params, correct, _rng) => {
    const candidates = [
      params.ip,
      calculateBroadcast(params.ip, params.prefix),
      calculateFirstHost(params.ip, params.prefix),
      longToIpv4(ipv4ToLong(correct) + 2 ** (32 - params.prefix)), // next network block
    ];
    if (params.prefix < 30) {
      candidates.push(longToIpv4(ipv4ToLong(correct) - 2 ** (32 - params.prefix))); // previous network
    }
    return deduplicate(candidates, correct);
  },

  subnettingBroadcast: (params, correct, _rng) => {
    const candidates = [
      calculateNetworkId(params.ip, params.prefix),
      calculateFirstHost(params.ip, params.prefix),
      calculateLastHost(params.ip, params.prefix),
      longToIpv4(ipv4ToLong(correct) + 2 ** (32 - params.prefix)), // broadcast of next block
    ];
    if (params.prefix < 30) {
      candidates.push(longToIpv4(ipv4ToLong(correct) - 2 ** (32 - params.prefix)));
    }
    return deduplicate(candidates, correct);
  },

  subnettingFirstHost: (params, correct, _rng) => {
    const candidates = [
      calculateNetworkId(params.ip, params.prefix),
      calculateBroadcast(params.ip, params.prefix),
      calculateLastHost(params.ip, params.prefix),
      params.ip,
    ];
    return deduplicate(candidates, correct);
  },

  subnettingLastHost: (params, correct, _rng) => {
    const candidates = [
      calculateNetworkId(params.ip, params.prefix),
      calculateBroadcast(params.ip, params.prefix),
      calculateFirstHost(params.ip, params.prefix),
      params.ip,
    ];
    return deduplicate(candidates, correct);
  },

  subnettingUsableHosts: (params, correct, _rng) => {
    const hostBits = 32 - params.prefix;
    const candidates = [
      2 ** hostBits,           // forgot -2
      2 ** hostBits - 1,       // off by one
      2 ** (hostBits - 1),     // half
      calculateTotalAddresses(params.prefix), // alias
    ];
    return deduplicate(candidates, correct);
  },

  subnettingJumpSize: (params, correct, _rng) => {
    const candidates = [
      params.prefix,           // common confusion
      2 ** (32 - params.prefix), // block size
      correct * 2,
      Math.max(1, Math.floor(correct / 2)),
    ];
    return deduplicate(candidates, correct);
  },
};

function calculateTotalAddresses(prefix) {
  return 2 ** (32 - prefix);
}

function getDistractors(strategy, params, correct, rng, item) {
  const fn = DISTRACTOR_STRATEGIES[strategy];
  if (!fn) throw new CalculationError(`Unknown distractor strategy: ${strategy}`, item.id, item.data.calculationFamily);
  const raw = fn(params, correct, rng);
  return pickUpTo(raw, 3, rng);
}

// ---------------------------------------------------------------------------
// Prompt / explanation builders
// ---------------------------------------------------------------------------

function formatIpPrefix(params) {
  return `${params.ip}/${params.prefix}`;
}

function chooseLead(leads, rng) {
  if (!leads || leads.length === 0) return '';
  return rng.pick(leads);
}

const VALID_MASK_OCTETS = new Set([0, 128, 192, 224, 240, 248, 252, 254, 255]);

function isMaskOctet(value) {
  return VALID_MASK_OCTETS.has(Number(value));
}

function withContext(prompt, contextType, leads, rng) {
  if (contextType !== 'coworker_question' || leads.length === 0) return prompt;
  const lead = chooseLead(leads, rng);
  return `${lead} ${prompt}`;
}

// scenarioConstraints decide which lead pools are valid for generated parameters.
// key: family id
const SCENARIO_CONSTRAINTS = {
  decimalToBinary: {
    compatibleScenarios: (params) => (isMaskOctet(params.decimal) ? ['mask', 'byte'] : ['byte']),
  },
  binaryToDecimal: {
    compatibleScenarios: (params) => (isMaskOctet(params.decimal) ? ['mask', 'byte'] : ['byte']),
  },
  prefixToMask: {
    compatibleScenarios: () => ['mask'],
  },
  maskToPrefix: {
    compatibleScenarios: () => ['mask'],
  },
  subnetting: {
    compatibleScenarios: () => ['subnetting'],
  },
};

const PROMPTS = {
  decimalToBinary: {
    direct: (params) => `Wie lautet die 8-Bit-Binärzahl für ${params.decimal}?`,
    scenarios: {
      mask: [
        'Ich dokumentiere gerade die Subnetzmaske und brauche die Binärdarstellung eines Oktetts.',
        'Für die Subnetzmasken-Dokumentation fehlt mir noch die Binärform.',
      ],
      byte: [
        'Kannst du mir kurz die Binär-Rechnung bestätigen?',
        'Ich brauche für die Dokumentation die Binärdarstellung.',
        'Ich übe gerade die Umrechnung von Dezimal- in Binärwerte.',
      ],
    },
  },
  binaryToDecimal: {
    direct: (params) => `Wie lautet die Dezimalzahl für ${params.binary}?`,
    scenarios: {
      mask: [
        'Ich lese gerade eine Subnetzmaske als Binärwert ab.',
        'Für die Subnetzmaske brauche ich die Dezimaldarstellung.',
      ],
      byte: [
        'Kannst du mir kurz die Dezimalzahl bestätigen?',
        'Ich brauche für die Dokumentation die Dezimalzahl.',
        'Ich übe gerade die Umrechnung von Binär- in Dezimalwerte.',
      ],
    },
  },
  prefixToMask: {
    direct: (params) => `Welche Subnetzmaske gehört zu /${params.prefix}?`,
    scenarios: {
      mask: [
        'Ich dokumentiere gerade die Subnetzmaske.',
        'Kurze Abfrage zur Subnetzmaske:',
        'Für die Konfiguration brauche ich die korrekte Maske:',
      ],
    },
  },
  maskToPrefix: {
    direct: (params) => `Welcher Präfix gehört zur Subnetzmaske ${params.mask}?`,
    scenarios: {
      mask: [
        'Ich dokumentiere gerade den Präfix.',
        'Kurze Abfrage zum CIDR-Präfix:',
        'Für die Konfiguration brauche ich den korrekten Präfix:',
      ],
    },
  },
  subnetting: {
    direct: (params, target) => {
      switch (target) {
        case 'networkId': return `Wie lautet die Netz-ID von ${formatIpPrefix(params)}?`;
        case 'broadcast': return `Wie lautet die Broadcast-Adresse von ${formatIpPrefix(params)}?`;
        case 'firstHost': return `Wie lautet die erste nutzbare Hostadresse im Subnetz ${formatIpPrefix(params)}?`;
        case 'lastHost': return `Wie lautet die letzte nutzbare Hostadresse im Subnetz ${formatIpPrefix(params)}?`;
        case 'usableHosts': return `Wie viele nutzbare Host-Adressen hat ein /${params.prefix}-Subnetz?`;
        case 'jumpSize': return `Wie groß ist die Sprungweite im relevanten Oktett bei /${params.prefix}?`;
        default: return `Berechne ${target} für ${formatIpPrefix(params)}.`;
      }
    },
    scenarios: {
      subnetting: [
        'Ich dokumentiere gerade das Netz der neuen Außenstelle.',
        'Ich rechne gerade ein Subnetz durch.',
        'Für den DHCP-Bereich brauche ich die Grenze des Subnetzes.',
        'Kannst du mir kurz die Berechnung bestätigen?',
      ],
    },
  },
};

function buildPrompt(family, params, item, contextType, rng) {
  const config = PROMPTS[family] || PROMPTS.subnetting;
  const direct = config.direct(params, item.data.target);
  const constraint = SCENARIO_CONSTRAINTS[family];
  if (!constraint || contextType !== 'coworker_question') return direct;
  const scenarios = constraint.compatibleScenarios(params);
  // Only use leads that are semantically valid for the generated parameters.
  const leadPool = scenarios.flatMap((s) => config.scenarios[s] || []);
  return withContext(direct, contextType, leadPool, rng);
}

function buildExplanation(family, params, correctAnswer, item) {
  switch (family) {
    case 'decimalToBinary':
      return `${params.decimal} als 8-Bit-Binärzahl ist ${correctAnswer}.`;
    case 'binaryToDecimal':
      return `${params.binary} als Dezimalzahl ist ${correctAnswer}.`;
    case 'prefixToMask':
      return `/${params.prefix} entspricht der Maske ${correctAnswer}.`;
    case 'maskToPrefix':
      return `Die Maske ${params.mask} entspricht /${correctAnswer}.`;
    case 'subnetting': {
      const net = calculateNetworkId(params.ip, params.prefix);
      const broadcast = calculateBroadcast(params.ip, params.prefix);
      const first = calculateFirstHost(params.ip, params.prefix);
      const last = calculateLastHost(params.ip, params.prefix);
      const usable = calculateUsableHosts(params.prefix);
      const jump = calculateJumpSize(params.prefix);
      return `Für ${params.ip}/${params.prefix} gilt: Netz-ID ${net}, Broadcast ${broadcast}, erste Host-IP ${first}, letzte Host-IP ${last}, nutzbare Hosts ${usable}, Sprungweite ${jump}.`;
    }
    default:
      return item.data.description;
  }
}

function answerFormatForFamily(family, item) {
  switch (family) {
    case 'decimalToBinary': return { type: 'binary', allowInput: true, expectedLength: 8 };
    case 'binaryToDecimal': return { type: 'number', allowInput: true, min: 0, max: 255 };
    case 'prefixToMask': return { type: 'ipv4-mask', allowInput: true };
    case 'maskToPrefix': return { type: 'prefix', allowInput: true, min: 0, max: 32 };
    case 'subnetting': {
      const target = item.data.target;
      if (target === 'usableHosts' || target === 'jumpSize') {
        return { type: 'number', allowInput: true, min: 0 };
      }
      return { type: 'ipv4-address', allowInput: true };
    }
    default:
      return { type: 'text', allowInput: false };
  }
}

function semanticTagsFor(family, params, item, difficulty) {
  const tags = [`calculation:${family}`];
  if (family === 'subnetting' || family === 'prefixToMask' || family === 'maskToPrefix') {
    const range = item.data.difficultyRanges[difficulty] || {};
    tags.push(`target:${item.data.target || 'mask'}`);
    tags.push(`prefix:/${params.prefix}`);
    tags.push(`prefix-range:/${range.prefixMin || ''}-/${range.prefixMax || ''}`);
  }
  if (family === 'decimalToBinary' || family === 'binaryToDecimal') {
    tags.push(`value:${params.decimal ?? params.binary}`);
  }
  tags.push(`difficulty:${difficulty}`);
  return tags;
}

// ---------------------------------------------------------------------------
// Calculation families
// ---------------------------------------------------------------------------

function rejectRecent(value, recentValues, attempt, maxAttempts = 10) {
  if (!recentValues || !recentValues.has(value)) return false;
  return attempt < maxAttempts - 1;
}

const CALCULATION_FAMILIES = {
  decimalToBinary: {
    generateParams(rng, difficulty, item, recentValues = new Set()) {
      const range = item.data.difficultyRanges[difficulty] || item.data.difficultyRanges.medium;
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const decimal = rng.nextInt(range.min, range.max);
        if (!rejectRecent(decimal, recentValues, attempt)) {
          return { decimal, value: decimal };
        }
      }
      throw new CalculationError('decimalToBinary could not pick a non-recent value', item.id, 'decimalToBinary');
    },
    calculate(params) {
      return decimalToBinaryOctet(params.decimal);
    },
  },

  binaryToDecimal: {
    generateParams(rng, difficulty, item, recentValues = new Set()) {
      const range = item.data.difficultyRanges[difficulty] || item.data.difficultyRanges.medium;
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const decimal = rng.nextInt(range.min, range.max);
        if (!rejectRecent(decimal, recentValues, attempt)) {
          return { decimal, binary: decimalToBinaryOctet(decimal), value: decimal };
        }
      }
      throw new CalculationError('binaryToDecimal could not pick a non-recent value', item.id, 'binaryToDecimal');
    },
    calculate(params) {
      return binaryOctetToDecimal(params.binary);
    },
  },

  prefixToMask: {
    generateParams(rng, difficulty, item, recentValues = new Set()) {
      const range = item.data.difficultyRanges[difficulty] || item.data.difficultyRanges.medium;
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const prefix = rng.nextInt(range.prefixMin, range.prefixMax);
        if (!rejectRecent(prefix, recentValues, attempt)) {
          return { prefix, value: prefix };
        }
      }
      throw new CalculationError('prefixToMask could not pick a non-recent prefix', item.id, 'prefixToMask');
    },
    calculate(params) {
      return prefixToSubnetMask(params.prefix).decimal;
    },
  },

  maskToPrefix: {
    generateParams(rng, difficulty, item, recentValues = new Set()) {
      const range = item.data.difficultyRanges[difficulty] || item.data.difficultyRanges.medium;
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const prefix = rng.nextInt(range.prefixMin, range.prefixMax);
        if (!rejectRecent(prefix, recentValues, attempt)) {
          return { prefix, mask: prefixToSubnetMask(prefix).decimal, value: prefix };
        }
      }
      throw new CalculationError('maskToPrefix could not pick a non-recent prefix', item.id, 'maskToPrefix');
    },
    calculate(params) {
      return subnetMaskToPrefix(params.mask);
    },
  },

  subnetting: {
    generateParams(rng, difficulty, item, recentValues = new Set()) {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const params = generatePrivateSubnetParams(rng, difficulty, item);
        const value = `${params.ip}/${params.prefix}`;
        if (!rejectRecent(value, recentValues, attempt)) {
          return { ...params, value };
        }
      }
      const last = generatePrivateSubnetParams(rng, difficulty, item);
      return { ...last, value: `${last.ip}/${last.prefix}` };
    },
    calculate(params, item) {
      const target = item.data.target;
      switch (target) {
        case 'networkId': return calculateNetworkId(params.ip, params.prefix);
        case 'broadcast': return calculateBroadcast(params.ip, params.prefix);
        case 'firstHost': return calculateFirstHost(params.ip, params.prefix);
        case 'lastHost': return calculateLastHost(params.ip, params.prefix);
        case 'usableHosts': return calculateUsableHosts(params.prefix);
        case 'jumpSize': return calculateJumpSize(params.prefix);
        default: throw new CalculationError(`Unknown subnetting target: ${target}`, item.id, 'subnetting');
      }
    },
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate all data needed for a calculation question instance.
 *
 * @param {object} item – Knowledge Item with data.calculationFamily
 * @param {object} rng – seedable RNG
 * @param {object} opts
 * @param {string} opts.difficulty – overrides item.difficulty
 * @param {string} opts.contextType – 'direct_question' | 'coworker_question'
 * @returns {object} { params, correctAnswer, distractors, prompt, explanation, answerFormat, semanticTags }
 */
export function generateCalculationData(item, rng, opts = {}) {
  const { difficulty = null, contextType = 'direct_question', recentValues = new Set() } = opts;
  const familyId = item.data.calculationFamily;
  const family = CALCULATION_FAMILIES[familyId];
  if (!family) {
    throw new CalculationError(`Unknown calculation family: ${familyId}`, item.id, familyId);
  }

  const selectedDifficulty = difficulty || item.difficulty;
  if (!item.data.difficultyRanges[selectedDifficulty]) {
    throw new CalculationError(`No difficulty range for ${selectedDifficulty}`, item.id, familyId);
  }

  const params = family.generateParams(rng, selectedDifficulty, item, recentValues);
  params.calculationFamily = familyId;
  params.target = item.data.target || null;
  const correctAnswer = family.calculate(params, item);
  const strategy = item.data.distractorStrategy || familyId;
  const distractors = getDistractors(strategy, params, correctAnswer, rng, item);

  return {
    params,
    correctAnswer,
    distractors,
    prompt: buildPrompt(familyId, params, item, contextType, rng),
    explanation: buildExplanation(familyId, params, correctAnswer, item),
    answerFormat: answerFormatForFamily(familyId, item),
    semanticTags: semanticTagsFor(familyId, params, item, selectedDifficulty),
  };
}

export function getSupportedCalculationFamilies() {
  return Object.keys(CALCULATION_FAMILIES);
}

export { CALCULATION_FAMILIES, DISTRACTOR_STRATEGIES };
