// Massen-Audit fuer Conversation-Diversity.
// Misst exacte Wiederholungen, Template-/Concept-/Facet-Verteilung und
// spezifische Inhalte (Binary, TCP/UDP, Geraete) fuer kleine und grosse Pools.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const { pathToFileURL: ptfu } = await import('node:url');

const {
  generateBalancedQuestion,
} = await import(ptfu(join(srcDir, 'lib/knowledge/questionGenerator.js')).href);
const {
  createSemanticHistory,
  pushHistoryRecord,
} = await import(ptfu(join(srcDir, 'lib/knowledge/semanticHistory.js')).href);
const {
  createBalancerState,
} = await import(ptfu(join(srcDir, 'lib/knowledge/semanticBalancer.js')).href);
const {
  getAllKnowledgeItems,
} = await import(ptfu(join(srcDir, 'lib/knowledge/index.js')).href);

const SMALL_TOPIC_KEYS = new Set([
  'fundamentals/binary-system',
  'fundamentals/tcp-udp',
  'fundamentals/switching',
]);

const LARGE_TOPIC_KEYS = new Set([
  'fundamentals/binary-system',
  'fundamentals/tcp-udp',
  'fundamentals/switching',
  'fundamentals/osi-model',
  'fundamentals/tcp-ip-model',
  'fundamentals/ipv4',
  'fundamentals/subnet-masks',
  'fundamentals/subnetting',
  'fundamentals/dns',
  'fundamentals/dhcp',
  'fundamentals/routing',
]);

function normalizeCalcValue(q) {
  const p = q.calculationParams || {};
  if (p.value != null) return String(p.value);
  if (p.decimal != null) return String(p.decimal);
  if (p.prefix != null && p.ip != null) return `${p.ip}/${p.prefix}`;
  if (p.prefix != null) return String(p.prefix);
  if (p.ip != null) return p.ip;
  return null;
}

function exactSignature(q) {
  const val = normalizeCalcValue(q);
  return val !== null ? `${q.knowledgeItemId}#${q.templateId}#${val}` : `${q.knowledgeItemId}#${q.templateId}`;
}

function runScenario(name, candidates, { n = 200, seedPrefix = 'audit' } = {}) {
  const topicKeys = [...new Set(candidates.map((i) => i.topicKey))];
  const progressByTopic = Object.fromEntries(topicKeys.map((k) => [k, { overall: 0, mastered: false }]));

  let history = createSemanticHistory();
  const records = [];

  for (let i = 0; i < n; i += 1) {
    const state = createBalancerState({
      history,
      progressByTopic,
      facetMasteryMap: {},
      difficultyProfile: 'medium',
    });
    try {
      const q = generateBalancedQuestion(state, {
        seed: `${seedPrefix}-${i}`,
        candidates,
        contextType: 'coworker_question',
      });
      records.push(q);
      history = pushHistoryRecord(history, q);
    } catch (err) {
      records.push({ _error: err.message, knowledgeItemId: 'error', templateId: 'error', conceptCluster: 'error', topicKey: 'error' });
    }
  }

  let exactDupesWindow = 0;
  let itemDupesWindow = 0;
  let templateDupesWindow = 0;
  let exactDupesAll = 0;
  const seenAll = new Set();
  const conceptCounts = {};
  const facetCounts = {};
  const itemCounts = {};
  const templateCounts = {};
  const binaryValues = [];
  const tcpUdpItems = [];
  const deviceItems = [];

  for (let i = 0; i < records.length; i += 1) {
    const q = records[i];
    if (q._error) continue;

    const sig = exactSignature(q);
    const itemSig = q.knowledgeItemId;
    const templateSig = q.templateId;

    // sliding window 20
    const windowStart = Math.max(0, i - 20);
    let exactDupe = false;
    let itemDupe = false;
    let templateDupe = false;
    for (let j = i - 1; j >= windowStart; j -= 1) {
      const r = records[j];
      if (r._error) continue;
      if (!exactDupe && exactSignature(r) === sig) { exactDupe = true; exactDupesWindow += 1; }
      if (!itemDupe && r.knowledgeItemId === itemSig) { itemDupe = true; itemDupesWindow += 1; }
      if (!templateDupe && r.templateId && r.templateId === templateSig) { templateDupe = true; templateDupesWindow += 1; }
    }

    if (seenAll.has(sig)) exactDupesAll += 1;
    seenAll.add(sig);

    conceptCounts[q.conceptCluster || q.topicKey] = (conceptCounts[q.conceptCluster || q.topicKey] || 0) + 1;
    facetCounts[q.knowledgeFacet || 'none'] = (facetCounts[q.knowledgeFacet || 'none'] || 0) + 1;
    itemCounts[q.knowledgeItemId] = (itemCounts[q.knowledgeItemId] || 0) + 1;
    templateCounts[q.templateId] = (templateCounts[q.templateId] || 0) + 1;

    if (q.topicKey === 'fundamentals/binary-system') {
      const val = normalizeCalcValue(q);
      if (val != null) binaryValues.push(val);
    }
    if (q.conceptCluster && (q.conceptCluster.includes('tcpudp') || q.topicKey === 'fundamentals/tcp-udp')) {
      tcpUdpItems.push({ id: q.knowledgeItemId, conceptCluster: q.conceptCluster });
    }
    if (q.topicKey === 'fundamentals/switching' || (q.conceptCluster && q.conceptCluster.includes('switch'))) {
      deviceItems.push({ id: q.knowledgeItemId, conceptCluster: q.conceptCluster });
    }
  }

  const distribution = (counts) => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, { count: v, pct: total ? Math.round((v / total) * 1000) / 10 : 0 }]));
  };

  const binaryValueCounts = binaryValues.reduce((acc, v) => {
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});

  const topBinaryRepeats = Object.entries(binaryValueCounts)
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    name,
    n: records.length,
    errors: records.filter((q) => q._error).length,
    exactDupesWindow,
    itemDupesWindow,
    templateDupesWindow,
    exactDupesAll,
    exactDupeRateWindow: records.length ? Math.round((exactDupesWindow / records.length) * 1000) / 10 : 0,
    itemDupeRateWindow: records.length ? Math.round((itemDupesWindow / records.length) * 1000) / 10 : 0,
    templateDupeRateWindow: records.length ? Math.round((templateDupesWindow / records.length) * 1000) / 10 : 0,
    conceptDistribution: distribution(conceptCounts),
    facetDistribution: distribution(facetCounts),
    itemDistribution: distribution(itemCounts),
    templateDistribution: distribution(templateCounts),
    binaryValues: binaryValueCounts,
    topBinaryRepeats,
    tcpUdpCount: tcpUdpItems.length,
    tcpUdpItems: [...new Set(tcpUdpItems.map((x) => x.id))].slice(0, 10),
    deviceCount: deviceItems.length,
    deviceItems: [...new Set(deviceItems.map((x) => x.id))].slice(0, 10),
  };
}

const allItems = getAllKnowledgeItems();
const smallCandidates = allItems.filter((i) => SMALL_TOPIC_KEYS.has(i.topicKey));
const largeCandidates = allItems.filter((i) => LARGE_TOPIC_KEYS.has(i.topicKey) && !i.id.startsWith('cisco.'));

console.log(`=== Conversation Diversity Audit ===`);
console.log(`Total items: ${allItems.length}`);
console.log(`Small pool: ${smallCandidates.length} items`);
console.log(`Large pool: ${largeCandidates.length} items`);

const small = runScenario('small-pool', smallCandidates, { n: 200, seedPrefix: 'small' });
const large = runScenario('large-pool', largeCandidates, { n: 500, seedPrefix: 'large' });

console.log('\n--- SMALL POOL ---');
console.log(JSON.stringify(small, null, 2));

console.log('\n--- LARGE POOL ---');
console.log(JSON.stringify(large, null, 2));
