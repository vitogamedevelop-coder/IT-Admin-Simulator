import assert from 'node:assert/strict';
import { topicKey, ACADEMY_TOPICS } from '../src/lib/academyTopics.js';
import {
  KNOWLEDGE_TYPES,
  QUESTION_ARCHETYPES,
  DIFFICULTY,
  getAllKnowledgeItems,
  getKnowledgeItemsByTopic,
} from '../src/lib/knowledge/index.js';
import { validateKnowledgeRegistry } from '../src/lib/knowledge/validators.js';
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
} from '../src/lib/networking/ipv4Math.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function assertTrue(value, message) {
  if (!value) throw new Error(message);
}

const allItems = getAllKnowledgeItems();
const osiItems = getKnowledgeItemsByTopic(topicKey('fundamentals', 'osi-model'));
const binaryItems = getKnowledgeItemsByTopic(topicKey('fundamentals', 'binary-system'));
const ipv4Items = getKnowledgeItemsByTopic(topicKey('fundamentals', 'ipv4'));
const subnetMaskItems = getKnowledgeItemsByTopic(topicKey('fundamentals', 'subnet-masks'));
const subnettingItems = getKnowledgeItemsByTopic(topicKey('fundamentals', 'subnetting'));
const switchingItems = getKnowledgeItemsByTopic(topicKey('fundamentals', 'switching'));
const vlanItems = getKnowledgeItemsByTopic(topicKey('fundamentals', 'vlan-basics'));
const sshItems = getKnowledgeItemsByTopic(topicKey('cisco-packet-tracer', 'ssh'));

// ============================================================
// Registry-level validation
// ============================================================
console.log('Validating Knowledge Registry...');
const validation = validateKnowledgeRegistry(allItems);
if (!validation.ok) {
  console.error('Validation errors:');
  validation.errors.forEach((e) => console.error(`  ${e.itemId || 'registry'} / ${e.field}: ${e.message}`));
  process.exit(1);
}
console.log(`  Registry OK – ${validation.stats.total} items`);

assertTrue(validation.stats.total > 0, 'Registry must contain pilot Knowledge Items');

// ============================================================
// Unique IDs
// ============================================================
console.log('Checking unique IDs...');
const ids = allItems.map((i) => i.id);
const uniqueIds = new Set(ids);
assertEqual(uniqueIds.size, ids.length, 'All Knowledge Item IDs must be unique');

// ============================================================
// Academy references
// ============================================================
console.log('Checking Academy references...');
const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
for (const item of allItems) {
  assertTrue(validTopicKeys.has(item.topicKey), `topicKey ${item.topicKey} must exist in ACADEMY_TOPICS`);
  assertTrue(validTopicKeys.has(item.sourceTopicKey), `sourceTopicKey ${item.sourceTopicKey} must exist in ACADEMY_TOPICS`);
  assertTrue(item.sourceSection && typeof item.sourceSection === 'string', `sourceSection must be set for ${item.id}`);
}

// ============================================================
// OSI: contains multiple layers, not just Layer 1
// ============================================================
console.log('Checking OSI pilot items...');
const osiLayerItems = osiItems.filter((i) => i.conceptCluster === 'osi.layers');
assertTrue(osiLayerItems.length >= 2, 'OSI must contain multiple layer Knowledge Items');
const layerNumbers = osiLayerItems.map((i) => i.data.layer).sort((a, b) => a - b);
assertTrue(layerNumbers.includes(1), 'OSI Layer 1 must be present');
assertTrue(layerNumbers.includes(2) || layerNumbers.includes(3), 'OSI must contain a layer beyond Layer 1');
assertTrue(layerNumbers.includes(7), 'OSI Layer 7 must be present');

const encapsulation = osiItems.find((i) => i.id === 'osi.encapsulationOrder');
assert(encapsulation, 'OSI encapsulation order item should exist');
assertEqual(encapsulation.type, KNOWLEDGE_TYPES.ORDER, 'Encapsulation item type');
assert.deepStrictEqual(encapsulation.data.senderOrder, [7, 6, 5, 4, 3, 2, 1], 'Sender encapsulation order');
assert.deepStrictEqual(encapsulation.data.receiverOrder, [1, 2, 3, 4, 5, 6, 7], 'Receiver decapsulation order');

// ============================================================
// Binary: calculations are correct
// ============================================================
console.log('Checking Binary pilot items...');
const binaryDecimalToBinary = binaryItems.find((i) => i.id === 'binary.decimalToBinary');
const binaryBinaryToDecimal = binaryItems.find((i) => i.id === 'binary.binaryToDecimal');
const binaryBitValues = binaryItems.find((i) => i.id === 'binary.bitValues');
assert(binaryDecimalToBinary, 'binary.decimalToBinary item should exist');
assert(binaryBinaryToDecimal, 'binary.binaryToDecimal item should exist');
assert(binaryBitValues, 'binary.bitValues item should exist');
assertEqual(binaryBitValues.type, KNOWLEDGE_TYPES.ORDER, 'binary.bitValues type');
assert.deepStrictEqual(binaryBitValues.data.values, [128, 64, 32, 16, 8, 4, 2, 1], 'binary.bitValues values');

// Verify math against ipv4Math.js.
assertEqual(decimalToBinaryOctet(192), '11000000', 'decimalToBinaryOctet(192)');
assertEqual(binaryOctetToDecimal('11000000'), 192, 'binaryOctetToDecimal(11000000)');
assertEqual(decimalToBinaryOctet(255), '11111111', 'decimalToBinaryOctet(255)');
assertEqual(binaryOctetToDecimal('00000000'), 0, 'binaryOctetToDecimal(00000000)');

// ============================================================
// IPv4 / Subnetting: calculations against ipv4Math.js
// ============================================================
console.log('Checking IPv4/Subnetting pilot items...');
assertTrue(ipv4Items.length > 0, 'IPv4 items must exist');
assertTrue(subnettingItems.length > 0, 'Subnetting items must exist');

// Prefix ↔ mask roundtrip.
assert.deepStrictEqual(prefixToSubnetMask(24), {
  decimal: '255.255.255.0',
  octets: [255, 255, 255, 0],
  binary: '11111111.11111111.11111111.00000000'.replace(/\./g, ''),
}, 'prefixToSubnetMask(24)');
assertEqual(subnetMaskToPrefix('255.255.255.0'), 24, 'subnetMaskToPrefix(255.255.255.0)');
assertEqual(subnetMaskToPrefix('255.255.255.192'), 26, 'subnetMaskToPrefix(255.255.255.192)');

// Subnetting calculation sanity checks.
const testIp = '192.168.10.130';
const testPrefix = 26;
assertEqual(calculateNetworkId(testIp, testPrefix), '192.168.10.128', 'networkId');
assertEqual(calculateBroadcast(testIp, testPrefix), '192.168.10.191', 'broadcast');
assertEqual(calculateFirstHost(testIp, testPrefix), '192.168.10.129', 'firstHost');
assertEqual(calculateLastHost(testIp, testPrefix), '192.168.10.190', 'lastHost');
assertEqual(calculateUsableHosts(testPrefix), 62, 'usableHosts /26');
assertEqual(calculateJumpSize(testPrefix), 64, 'jumpSize /26');

// Subnetting calculation items reference existing ipv4Math functions.
for (const item of subnettingItems) {
  if (item.type === KNOWLEDGE_TYPES.CALCULATION) {
    assertTrue(item.data.calculationFamily, `${item.id} must declare a calculationFamily`);
    assertTrue(
      ['subnetting', 'prefixToMask', 'maskToPrefix'].includes(item.data.calculationFamily),
      `${item.id} calculationFamily must reference a supported calculation family`
    );
  }
}

// ============================================================
// Switching / VLAN: relations unambiguous
// ============================================================
console.log('Checking Switching/VLAN pilot items...');
assertTrue(switchingItems.length > 0, 'Switching items must exist');
assertTrue(vlanItems.length > 0, 'VLAN items must exist');

const forwardFloodFilter = switchingItems.find((i) => i.id === 'switching.forwardFloodFilter');
assert(forwardFloodFilter, 'switching.forwardFloodFilter item should exist');
const cases = forwardFloodFilter.data.cases;
assertTrue(cases.length === 3, 'Forward/Flood/Filter must have exactly three cases');
const actions = cases.map((c) => c.action).sort();
assert.deepStrictEqual(actions, ['Filter', 'Flood', 'Forward'], 'Actions must be Forward, Flood, Filter');

const accessTrunk = vlanItems.find((i) => i.id === 'vlan.accessVsTrunk');
assert(accessTrunk, 'vlan.accessVsTrunk item should exist');
assertEqual(accessTrunk.data.items.length, 2, 'accessVsTrunk must compare exactly Access and Trunk');
const portTypes = accessTrunk.data.items.map((i) => i.name).sort();
assert.deepStrictEqual(portTypes, ['Access-Port', 'Trunk-Port'], 'Access and Trunk port names');

// ============================================================
// SSH: facts match existing Block 1.5 content
// ============================================================
console.log('Checking SSH pilot items...');
assertTrue(sshItems.length > 0, 'SSH items must exist');

const telnetVsSsh = sshItems.find((i) => i.id === 'ssh.telnetVsSsh');
assert(telnetVsSsh, 'ssh.telnetVsSsh item should exist');
const sshEntry = telnetVsSsh.data.items.find((i) => i.name === 'SSH');
assert(sshEntry, 'SSH entry in telnetVsSsh must exist');
assertTrue(sshEntry.encrypted, 'SSH must be marked as encrypted');
assertEqual(sshEntry.port, 22, 'SSH port must be 22');
const telnetEntry = telnetVsSsh.data.items.find((i) => i.name === 'Telnet');
assert(telnetEntry, 'Telnet entry must exist');
assertTrue(!telnetEntry.encrypted, 'Telnet must be marked as not encrypted');
assertEqual(telnetEntry.port, 23, 'Telnet port must be 23');

const sshVersion = sshItems.find((i) => i.id === 'ssh.version');
assert(sshVersion, 'ssh.version item should exist');
assertEqual(sshVersion.data.requiredVersion, 2, 'Required SSH version must be 2');
assertEqual(sshVersion.data.command, 'ip ssh version 2', 'SSH version command');

const rsaReq = sshItems.find((i) => i.id === 'ssh.rsaKeyRequirements');
assert(rsaReq, 'ssh.rsaKeyRequirements item should exist');
assertEqual(rsaReq.data.command, 'crypto key generate rsa', 'RSA command');
assertTrue(rsaReq.data.prerequisites.includes('Hostname vergeben'), 'RSA requires hostname');
assertTrue(rsaReq.data.prerequisites.includes('Domain Name vergeben'), 'RSA requires domain name');

const managementSvi = sshItems.find((i) => i.id === 'ssh.managementSvi');
assert(managementSvi, 'ssh.managementSvi item should exist');
assertTrue(managementSvi.data.solution.includes('interface vlan'), 'Management SVI solution mentions interface vlan');
assertTrue(managementSvi.data.solution.includes('no shutdown'), 'Management SVI solution mentions no shutdown');

const sshTroubleshooting = sshItems.find((i) => i.id === 'ssh.troubleshooting');
assert(sshTroubleshooting, 'ssh.troubleshooting item should exist');
assertTrue(sshTroubleshooting.data.symptoms.length >= 2, 'SSH troubleshooting must have multiple symptoms');

// ============================================================
// Difficulty and Question Archetype sanity
// ============================================================
console.log('Checking difficulty/archetype distribution...');
const validDifficulties = Object.values(DIFFICULTY);
const validArchetypes = Object.values(QUESTION_ARCHETYPES);
for (const item of allItems) {
  assertTrue(validDifficulties.includes(item.difficulty), `${item.id} must have valid difficulty`);
  assertTrue(item.allowedQuestionTypes.length > 0, `${item.id} must allow at least one archetype`);
  for (const qt of item.allowedQuestionTypes) {
    assertTrue(validArchetypes.includes(qt), `${item.id} archetype ${qt} must be valid`);
  }
}

// ============================================================
// Source-of-truth preservation
// ============================================================
console.log('Checking Academy Source of Truth preservation...');
for (const item of allItems) {
  assertEqual(item.topicKey, item.sourceTopicKey, `${item.id}: topicKey and sourceTopicKey should match`);
  assertTrue(item.sourceSection.length > 0, `${item.id}: sourceSection must not be empty`);
  assertTrue(item.data && typeof item.data === 'object', `${item.id}: data object required`);
}

// ============================================================
// Summary
// ============================================================
console.log('\n✅ Phase 1 Knowledge Layer tests passed');
console.log(`   Total Knowledge Items: ${allItems.length}`);
console.log(`   OSI: ${osiItems.length}, Binary: ${binaryItems.length}`);
console.log(`   IPv4: ${ipv4Items.length}, Subnet-Masks: ${subnetMaskItems.length}, Subnetting: ${subnettingItems.length}`);
console.log(`   Switching: ${switchingItems.length}, VLAN: ${vlanItems.length}, SSH: ${sshItems.length}`);
