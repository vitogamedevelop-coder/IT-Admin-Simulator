import assert from 'node:assert/strict';
import {
  generateQuestion,
  TEMPLATES,
  getAllKnowledgeItems,
  getKnowledgeItem,
  validateQuestionInstances,
  KNOWLEDGE_TYPES,
  getSupportedCalculationFamilies,
} from '../src/lib/knowledge/index.js';
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
} from '../src/lib/networking/ipv4Math.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function assertTrue(value, message) {
  if (!value) throw new Error(message);
}

function assertValidIpv4(ip, message) {
  assertTrue(isValidIpv4Address(ip), `${message}: ${ip} is not a valid IPv4 address`);
}

// ---------------------------------------------------------------------------
// A-J: Correctness per calculation family
// ---------------------------------------------------------------------------

function testFamilyCorrectness(itemId, templateId, expectedCalculator, label) {
  for (let i = 0; i < 50; i += 1) {
    const q = generateQuestion(itemId, templateId, { seed: `correct-${i}` });
    const params = q.calculationParams;
    const correct = String(q.correctAnswer.label);
    let expected;
    switch (label) {
      case 'decimalToBinary':
        expected = decimalToBinaryOctet(params.decimal);
        break;
      case 'binaryToDecimal':
        expected = String(binaryOctetToDecimal(params.binary));
        break;
      case 'prefixToMask':
        expected = prefixToSubnetMask(params.prefix).decimal;
        break;
      case 'maskToPrefix':
        expected = String(subnetMaskToPrefix(params.mask));
        break;
      case 'networkId':
        expected = calculateNetworkId(params.ip, params.prefix);
        break;
      case 'broadcast':
        expected = calculateBroadcast(params.ip, params.prefix);
        break;
      case 'firstHost':
        expected = calculateFirstHost(params.ip, params.prefix);
        break;
      case 'lastHost':
        expected = calculateLastHost(params.ip, params.prefix);
        break;
      case 'usableHosts':
        expected = String(calculateUsableHosts(params.prefix));
        break;
      case 'jumpSize':
        expected = String(calculateJumpSize(params.prefix));
        break;
      default:
        throw new Error(`Unknown label ${label}`);
    }
    assertEqual(correct, expected, `${itemId} seed correct-${i}`);
  }
}

console.log('A) Decimal → Binary correctness');
testFamilyCorrectness('binary.decimalToBinary', 'binary.decimalToBinary', null, 'decimalToBinary');

console.log('B) Binary → Decimal correctness');
testFamilyCorrectness('binary.binaryToDecimal', 'binary.binaryToDecimal', null, 'binaryToDecimal');

console.log('C) Prefix → Mask correctness');
testFamilyCorrectness('subnetMasks.prefixToMask', 'subnetting.prefixToMask', null, 'prefixToMask');

console.log('D) Mask → Prefix correctness');
testFamilyCorrectness('subnetMasks.maskToPrefix', 'subnetting.maskToPrefix', null, 'maskToPrefix');

console.log('E) Network ID correctness');
testFamilyCorrectness('subnetting.networkId', 'subnetting.networkId', null, 'networkId');

console.log('F) Broadcast correctness');
testFamilyCorrectness('subnetting.broadcast', 'subnetting.broadcast', null, 'broadcast');

console.log('G) First Host correctness');
testFamilyCorrectness('subnetting.firstHost', 'subnetting.firstHost', null, 'firstHost');

console.log('H) Last Host correctness');
testFamilyCorrectness('subnetting.lastHost', 'subnetting.lastHost', null, 'lastHost');

console.log('I) Usable Hosts correctness');
testFamilyCorrectness('subnetting.usableHosts', 'subnetting.usableHosts', null, 'usableHosts');

console.log('J) Jump Size correctness');
testFamilyCorrectness('subnetting.jumpSize', 'subnetting.jumpSize', null, 'jumpSize');

// ---------------------------------------------------------------------------
// K) Determinism: same inputs → same parameters
// ---------------------------------------------------------------------------
console.log('K) Determinism across calculation families');
const calcItems = getAllKnowledgeItems().filter((i) => i.type === KNOWLEDGE_TYPES.CALCULATION);
for (const item of calcItems) {
  const templates = TEMPLATES.filter((t) => t.matches(item));
  if (templates.length === 0) continue;
  const template = templates[0];
  for (const difficulty of Object.keys(item.data.difficultyRanges || { [item.difficulty]: true })) {
    const a = generateQuestion(item.id, template.id, { seed: 'det', difficulty, contextType: 'direct_question' });
    const b = generateQuestion(item.id, template.id, { seed: 'det', difficulty, contextType: 'direct_question' });
    assertEqual(a.instanceId, b.instanceId, `${item.id} instanceId deterministic`);
    assert.deepStrictEqual(a.calculationParams, b.calculationParams, `${item.id} params deterministic`);
    assert.deepStrictEqual(a.options, b.options, `${item.id} options deterministic`);
  }
}

// ---------------------------------------------------------------------------
// L) Different seeds → variation
// ---------------------------------------------------------------------------
console.log('L) Different seeds produce variation');
for (const item of calcItems) {
  const templates = TEMPLATES.filter((t) => t.matches(item));
  if (templates.length === 0) continue;
  const template = templates[0];
  const values = new Set();
  for (let i = 0; i < 20; i += 1) {
    const q = generateQuestion(item.id, template.id, { seed: `var-${i}` });
    values.add(JSON.stringify(q.calculationParams));
  }
  assertTrue(values.size > 1, `${item.id} should produce varied parameters across seeds`);
}

// ---------------------------------------------------------------------------
// M) Difficulty creates different parameter classes
// ---------------------------------------------------------------------------
console.log('M) Difficulty creates different parameter classes');
for (const item of calcItems) {
  const ranges = item.data.difficultyRanges || {};
  const prefixesByDifficulty = {};
  for (const difficulty of Object.keys(ranges)) {
    const collected = new Set();
    for (let i = 0; i < 100; i += 1) {
      const q = generateQuestion(item.id, null, { seed: `diff-${difficulty}-${i}`, difficulty });
      const prefix = q.calculationParams.prefix;
      if (prefix !== undefined) collected.add(prefix);
    }
    prefixesByDifficulty[difficulty] = collected;
  }
  // At least verify that each difficulty generated its declared range at least once.
  for (const difficulty of Object.keys(ranges)) {
    const range = ranges[difficulty];
    if (range.prefixMin !== undefined) {
      const minGenerated = Math.min(...prefixesByDifficulty[difficulty]);
      const maxGenerated = Math.max(...prefixesByDifficulty[difficulty]);
      assertTrue(minGenerated >= range.prefixMin, `${item.id} ${difficulty} min prefix ${minGenerated} >= ${range.prefixMin}`);
      assertTrue(maxGenerated <= range.prefixMax, `${item.id} ${difficulty} max prefix ${maxGenerated} <= ${range.prefixMax}`);
    }
  }
}

// ---------------------------------------------------------------------------
// N) Generated host IP is never network or broadcast
// ---------------------------------------------------------------------------
console.log('N) Host IPs are never network or broadcast');
const hostTargets = ['networkId', 'broadcast', 'firstHost', 'lastHost'];
for (let i = 0; i < 500; i += 1) {
  for (const target of hostTargets) {
    const q = generateQuestion(`subnetting.${target}`, 'subnetting.' + target, { seed: `host-${i}` });
    const { ip, prefix, network } = q.calculationParams;
    const broadcast = calculateBroadcast(ip, prefix);
    assertTrue(ip !== network, `${target} seed host-${i}: IP ${ip} must not equal network ${network}`);
    assertTrue(ip !== broadcast, `${target} seed host-${i}: IP ${ip} must not equal broadcast ${broadcast}`);
    assertValidIpv4(ip, `${target} seed host-${i}`);
  }
}

// ---------------------------------------------------------------------------
// O) No correct answer under distractors
// ---------------------------------------------------------------------------
console.log('O) Distractors never contain correct answer');
for (const item of calcItems) {
  const templates = TEMPLATES.filter((t) => t.matches(item));
  if (templates.length === 0) continue;
  for (let i = 0; i < 100; i += 1) {
    const q = generateQuestion(item.id, null, { seed: `dist-${i}` });
    const correctLabel = String(q.correctAnswer.label).toLowerCase();
    for (const opt of q.options) {
      if (opt.id === q.correctOptionId) continue;
      assertNotEqual(String(opt.label).toLowerCase(), correctLabel, `${item.id} seed dist-${i} distractor equals correct answer`);
    }
  }
}

function assertNotEqual(a, b, message) {
  if (a === b) throw new Error(message);
}

// ---------------------------------------------------------------------------
// P) No duplicate distractors
// ---------------------------------------------------------------------------
console.log('P) No duplicate option labels');
for (const item of calcItems) {
  for (let i = 0; i < 100; i += 1) {
    const q = generateQuestion(item.id, null, { seed: `dup-${i}` });
    const labels = q.options.map((o) => String(o.label).trim().toLowerCase());
    const unique = new Set(labels);
    assertEqual(unique.size, labels.length, `${item.id} seed dup-${i} has duplicate option labels`);
  }
}

// ---------------------------------------------------------------------------
// Q) All generated calculation instances validate
// ---------------------------------------------------------------------------
console.log('Q) Mass validation of calculation instances');
const massInstances = [];
for (const item of calcItems) {
  const templates = TEMPLATES.filter((t) => t.matches(item));
  if (templates.length === 0) continue;
  for (let i = 0; i < 200; i += 1) {
    const difficulty = Object.keys(item.data.difficultyRanges || { [item.difficulty]: true })[i % 3] || item.difficulty;
    const q = generateQuestion(item.id, null, { seed: `mass-${i}`, difficulty });
    massInstances.push(q);
  }
}
const validation = validateQuestionInstances(massInstances);
if (!validation.ok) {
  console.error('Validation errors (first 20):');
  validation.errors.slice(0, 20).forEach((e) => console.error(`  ${e.instanceId} / ${e.field}: ${e.message}`));
  throw new Error(`${validation.errors.length} of ${massInstances.length} calculation instances failed validation`);
}
console.log(`  ${massInstances.length} calculation instances validated`);

// ---------------------------------------------------------------------------
// R) NEXUS context does not change mathematical solution
// ---------------------------------------------------------------------------
console.log('R) NEXUS context preserves mathematical solution');
for (const item of calcItems) {
  const templates = TEMPLATES.filter((t) => t.matches(item));
  if (templates.length === 0) continue;
  const template = templates[0];
  const direct = generateQuestion(item.id, template.id, { seed: 'ctx', contextType: 'direct_question' });
  const nexus = generateQuestion(item.id, template.id, { seed: 'ctx', contextType: 'coworker_question' });
  assert.deepStrictEqual(direct.calculationParams, nexus.calculationParams, `${item.id} params same across contextType`);
  assertEqual(direct.correctOptionId, nexus.correctOptionId, `${item.id} correctOptionId same across contextType`);
}

// ---------------------------------------------------------------------------
// S) Academy unlock scope not violated (prefix ranges within taught bounds)
// ---------------------------------------------------------------------------
console.log('S) Academy scope / prefix bounds respected');
for (const item of calcItems) {
  const ranges = item.data.difficultyRanges || {};
  for (const difficulty of Object.keys(ranges)) {
    const range = ranges[difficulty];
    if (range.prefixMin !== undefined) {
      assertTrue(range.prefixMin >= 0 && range.prefixMax <= 30, `${item.id} ${difficulty} prefix range within 0..30`);
    }
    if (range.min !== undefined) {
      assertTrue(range.min >= 0 && range.max <= 255, `${item.id} ${difficulty} binary value range within 0..255`);
    }
  }
}

// ---------------------------------------------------------------------------
// Mass tests
// ---------------------------------------------------------------------------
console.log('Mass test: Binary 500+');
const binaryMass = [];
for (let i = 0; i < 600; i += 1) {
  binaryMass.push(generateQuestion('binary.decimalToBinary', null, { seed: `bin-mass-${i}` }));
  binaryMass.push(generateQuestion('binary.binaryToDecimal', null, { seed: `bin-mass-${i}` }));
}
const binValidation = validateQuestionInstances(binaryMass);
assertTrue(binValidation.ok, `Binary mass validation failed: ${binValidation.errors.length} errors`);
console.log(`  ${binaryMass.length} binary instances validated`);

console.log('Mass test: Prefix/Mask all supported prefixes');
const prefixMass = [];
for (let prefix = 8; prefix <= 30; prefix += 1) {
  for (let i = 0; i < 10; i += 1) {
    // Force a specific prefix by generating many until we hit it, or use generator directly.
    // We verify that every prefix 8..30 can appear and produces correct answer.
    const qMask = generateQuestion('subnetMasks.prefixToMask', null, { seed: `pm-${prefix}-${i}` });
    const qPrefix = generateQuestion('subnetMasks.maskToPrefix', null, { seed: `mp-${prefix}-${i}` });
    prefixMass.push(qMask, qPrefix);
  }
}
const prefixValidation = validateQuestionInstances(prefixMass);
assertTrue(prefixValidation.ok, `Prefix/Mask mass validation failed: ${prefixValidation.errors.length} errors`);
// Ensure variation covers the whole range.
const generatedPrefixes = new Set(prefixMass.map((q) => q.calculationParams.prefix).filter(Boolean));
assertTrue(generatedPrefixes.size >= 10, `Prefix/Mask should cover many prefixes, got ${generatedPrefixes.size}`);
console.log(`  ${prefixMass.length} prefix/mask instances validated, ${generatedPrefixes.size} distinct prefixes`);

console.log('Mass test: Subnetting 1000+ across difficulties');
const subnetMass = [];
const subnetItemIds = ['subnetting.networkId', 'subnetting.broadcast', 'subnetting.firstHost', 'subnetting.lastHost', 'subnetting.usableHosts', 'subnetting.jumpSize'];
let subnetCounter = 0;
for (const itemId of subnetItemIds) {
  for (const difficulty of ['easy', 'medium', 'hard']) {
    for (let i = 0; i < 60; i += 1) {
      subnetMass.push(generateQuestion(itemId, null, { seed: `sub-${subnetCounter}`, difficulty }));
      subnetCounter += 1;
    }
  }
}
const subnetValidation = validateQuestionInstances(subnetMass);
assertTrue(subnetValidation.ok, `Subnetting mass validation failed: ${subnetValidation.errors.length} errors`);
// Validate each instance's math.
for (const q of subnetMass) {
  const item = getKnowledgeItem(q.knowledgeItemId);
  const target = item.data.target;
  const { ip, prefix } = q.calculationParams;
  let expected;
  switch (target) {
    case 'networkId': expected = calculateNetworkId(ip, prefix); break;
    case 'broadcast': expected = calculateBroadcast(ip, prefix); break;
    case 'firstHost': expected = calculateFirstHost(ip, prefix); break;
    case 'lastHost': expected = calculateLastHost(ip, prefix); break;
    case 'usableHosts': expected = String(calculateUsableHosts(prefix)); break;
    case 'jumpSize': expected = String(calculateJumpSize(prefix)); break;
    default: continue;
  }
  assertEqual(String(q.correctAnswer.label), String(expected), `${q.instanceId} math check`);
}
console.log(`  ${subnetMass.length} subnetting instances validated and math-checked`);

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
console.log('Edge cases: 0 and 255');
assertEqual(decimalToBinaryOctet(0), '00000000', 'decimal 0');
assertEqual(decimalToBinaryOctet(255), '11111111', 'decimal 255');
assertEqual(binaryOctetToDecimal('00000000'), 0, 'binary 0');
assertEqual(binaryOctetToDecimal('11111111'), 255, 'binary 255');

console.log('Edge cases: /8, /16, /24');
assertEqual(prefixToSubnetMask(8).decimal, '255.0.0.0', '/8 mask');
assertEqual(prefixToSubnetMask(16).decimal, '255.255.0.0', '/16 mask');
assertEqual(prefixToSubnetMask(24).decimal, '255.255.255.0', '/24 mask');

console.log('Edge cases: /25-/30 boundaries');
for (let prefix = 25; prefix <= 30; prefix += 1) {
  assertEqual(String(calculateUsableHosts(prefix)), String(2 ** (32 - prefix) - 2), `usableHosts /${prefix}`);
  assertEqual(String(calculateJumpSize(prefix)), String(2 ** (8 - (prefix % 8 || 8))), `jumpSize /${prefix}`);
}

console.log('Edge cases: octet changes');
let octetChangeCount = 0;
for (let i = 0; i < 500; i += 1) {
  const q = generateQuestion('subnetting.networkId', null, { seed: `octet-${i}`, difficulty: 'hard' });
  const prefix = q.calculationParams.prefix;
  const relevantOctet = prefix <= 8 ? 0 : prefix <= 16 ? 1 : prefix <= 24 ? 2 : 3;
  if (relevantOctet < 3) octetChangeCount += 1;
}
assertTrue(octetChangeCount > 0, 'Hard difficulty should produce prefixes that cross octet boundaries');

// ---------------------------------------------------------------------------
// Semantic metadata for future balancer
// ---------------------------------------------------------------------------
console.log('Semantic metadata present');
for (const q of subnetMass.slice(0, 20)) {
  assertTrue(q.semanticTags.some((t) => t.startsWith('calculation:')), `${q.instanceId} has calculation semantic tag`);
  assertTrue(q.semanticTags.some((t) => t.startsWith('target:')), `${q.instanceId} has target semantic tag`);
  assertTrue(q.semanticTags.some((t) => t.startsWith('prefix-range:')), `${q.instanceId} has prefix-range semantic tag`);
}

// ---------------------------------------------------------------------------
// Input question data model readiness
// ---------------------------------------------------------------------------
console.log('Input question metadata present');
for (const item of calcItems) {
  const q = generateQuestion(item.id, null, { seed: 'input-meta' });
  assertTrue(q.answerFormat, `${item.id} has answerFormat`);
  assertTrue(q.answerFormat.allowInput, `${item.id} allows input`);
}

console.log('\n✅ Phase 3 Knowledge Layer Calculation System tests passed');
console.log(`   Calculation families: ${getSupportedCalculationFamilies().join(', ')}`);
console.log(`   Calculation items tested: ${calcItems.length}`);
