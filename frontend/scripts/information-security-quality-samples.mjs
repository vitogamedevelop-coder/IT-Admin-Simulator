import {
  generateQuestion,
  getAllKnowledgeItems,
} from '../src/lib/knowledge/index.js';

function sampleFor(items, seedBase) {
  const out = [];
  for (const item of items) {
    try {
      const q = generateQuestion(item.id, null, { contextType: 'coworker_question', seed: `${seedBase}-${item.id}` });
      out.push({
        employeeRoleHint: item.roleHints?.join(', ') || 'neutral',
        conceptCluster: item.conceptCluster,
        facet: q.knowledgeFacet,
        prompt: q.conversationText || q.prompt,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        correctOrderLabels: q.correctOrderLabels,
        correctPairLabels: q.correctPairLabels,
        explanation: q.explanation,
      });
    } catch (e) {
      out.push({ item: item.id, error: e.message });
    }
  }
  return out;
}

function pick(items, clusters, limitPerCluster = 1) {
  const result = [];
  for (const cluster of clusters) {
    const clusterItems = items.filter((i) => i.conceptCluster === cluster);
    for (let i = 0; i < Math.min(limitPerCluster, clusterItems.length); i += 1) {
      result.push(clusterItems[i]);
    }
  }
  return result;
}

const securityItems = getAllKnowledgeItems().filter((item) =>
  item.conceptCluster && item.conceptCluster.startsWith('security.'),
);

const samples = [];

// 5 CIA
samples.push(...sampleFor(pick(securityItems, [
  'security.cia',
  'security.cia',
  'security.cia',
  'security.cia',
  'security.cia',
], 1), 'cia'));

// 4 PIMO/OPTI
samples.push(...sampleFor(pick(securityItems, [
  'security.pimo',
  'security.pimo',
  'security.opti',
  'security.pimoVsOpti',
], 1), 'pimoOpti'));

// 3 Datenschutz
samples.push(...sampleFor(pick(securityItems, [
  'security.datenschutz',
  'security.art9',
  'security.infoCategories',
], 1), 'datenschutz'));

// 3 Vorkommnis/Meldewesen
samples.push(...sampleFor(pick(securityItems, [
  'security.breachIncident',
  'security.breachIncident',
  'security.breachIncident',
], 1), 'incidents'));

// 5 Malware/Angriffe
samples.push(...sampleFor(pick(securityItems, [
  'security.attacks',
  'security.malware',
  'security.malware',
  'security.malware',
  'security.prevention',
], 1), 'malware'));

// 5 Firewall/DMZ/IDS/IPS
samples.push(...sampleFor(pick(securityItems, [
  'security.firewall',
  'security.firewall',
  'security.dmz',
  'security.idsips',
  'security.allowlist',
], 1), 'tech'));

console.log(JSON.stringify(samples, null, 2));
