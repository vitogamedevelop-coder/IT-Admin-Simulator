// Relationship + Context Family Smoke Test
// Stellt sicher, dass contextFamily, relatedTopicKeys und Lore-Lead-Ins
// tatsächlich generiert und in History/Balancer verwendet werden.

class Storage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
}
global.localStorage = new Storage();
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const { getContextFamily, getLoreLeadIn, getRelatedContextFamilies } = await import('../src/lib/knowledge/contextFamilies.js');
const { generateBalancedQuestion, generateQuestion } = await import('../src/lib/knowledge/questionGenerator.js');
const { getKnowledgeItem } = await import('../src/lib/knowledge/index.js');
const { createSemanticHistory, pushHistoryRecord, buildHistoryRecord } = await import('../src/lib/knowledge/semanticHistory.js');
const { createBalancerState } = await import('../src/lib/knowledge/semanticBalancer.js');
const { createRng } = await import('../src/lib/knowledge/random.js');

const results = [];
function assert(condition, message) {
  results.push({ ok: !!condition, message });
  if (!condition) console.error(`  FAIL - ${message}`);
}

console.log('Context family derivation:');
const tcpItem = getKnowledgeItem('nb.tcpudp.tcp');
assert(getContextFamily(tcpItem) === 'tcpudp', `nb.tcpudp.tcp -> tcpudp (got ${getContextFamily(tcpItem)})`);
const switchItem = getKnowledgeItem('switching.macLearning');
assert(getContextFamily(switchItem) === 'switching', `switching.macLearning -> switching`);
const binaryItem = getKnowledgeItem('binary.decimalToBinary');
assert(getContextFamily(binaryItem) === 'binary', `binary.decimalToBinary -> binary`);
const ciscoItem = getKnowledgeItem('basicConfig.configOrder');
assert(getContextFamily(ciscoItem) === 'basicConfig', `basicConfig.configOrder -> basicConfig`);

console.log('Lore lead-in generation:');
const rng = createRng('test-lore');
const lore = getLoreLeadIn(tcpItem, rng);
assert(typeof lore === 'string' && lore.length > 0, 'TCP/UDP item produces a non-empty lore lead-in');
const defaultItem = getKnowledgeItem('nb.dns.definition');
const defaultLore = getLoreLeadIn(defaultItem, rng);
assert(typeof defaultLore === 'string' && defaultLore.length > 0, 'Non-mapped item produces a fallback lore lead-in');

console.log('Related context families:');
const related = getRelatedContextFamilies('tcpudp');
assert(related.includes('dns') && related.includes('ssh'), 'TCP/UDP is related to DNS and SSH');

console.log('Question instances carry contextFamily and relatedTopicKeys:');
const direct = generateQuestion('binary.decimalToBinary', null, { seed: 'cf-test-1' });
assert(direct.contextFamily === 'binary', `direct question has contextFamily binary (got ${direct.contextFamily})`);
const osiItem = getKnowledgeItem('osi.toTcpIp');
assert(getContextFamily(osiItem) === 'osi', 'osi.toTcpIp item resolves to osi contextFamily');
assert(Array.isArray(osiItem.relatedTopicKeys) && osiItem.relatedTopicKeys.length > 0, 'osi.toTcpIp item keeps relatedTopicKeys');

console.log('History records include contextFamily:');
const record = buildHistoryRecord(direct);
assert(record.contextFamily === 'binary', 'history record stores contextFamily');

console.log('Balanced selection does not crash with contextFamily in history:');
const tcpItems = [getKnowledgeItem('nb.tcpudp.tcp'), getKnowledgeItem('switching.macLearning'), getKnowledgeItem('binary.decimalToBinary')];
let history = createSemanticHistory();
for (let i = 0; i < 10; i += 1) {
  const state = createBalancerState({
    history,
    progressByTopic: { 'fundamentals/tcp-udp': { overall: 0, mastered: false } },
    facetMasteryMap: {},
    difficultyProfile: 'medium',
  });
  const q = generateBalancedQuestion(state, { seed: `cf-balance-${i}`, candidates: tcpItems });
  history = pushHistoryRecord(history, q);
  assert(q.contextFamily, `balanced question ${i} has contextFamily`);
}

console.log('\n=== Relationship + Context Family Test: Summary ===');
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log(`Total: ${results.length}, Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) {
  results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.message}`));
  process.exitCode = 1;
} else {
  console.log('All checks passed.');
}
