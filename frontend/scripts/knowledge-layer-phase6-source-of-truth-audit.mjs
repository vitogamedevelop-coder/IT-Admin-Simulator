// =============================================================================
// NEXUS Knowledge Layer – Phase 6 Academy Source-of-Truth Audit
//
// Compares generated Knowledge Items against the Academy lesson data they
// claim to derive from. Reports drift where the knowledge layer deviates.
// =============================================================================

import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { OSI_LAYERS } from '../src/lib/academyLessons/osi.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';

const findings = [];
function report(id, message) {
  findings.push({ id, message });
  console.log(`[${id}] ${message}`);
}

const items = getAllKnowledgeItems();
const byId = Object.fromEntries(items.map((i) => [i.id, i]));
const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));

// Every Knowledge Item must reference a valid Academy topic.
for (const item of items) {
  if (!validTopicKeys.has(item.sourceTopicKey)) {
    report(item.id, `sourceTopicKey "${item.sourceTopicKey}" is not a registered Academy topic`);
  }
  if (!validTopicKeys.has(item.topicKey)) {
    report(item.id, `topicKey "${item.topicKey}" is not a registered Academy topic`);
  }
}

// OSI layer name consistency
for (const layer of OSI_LAYERS) {
  const item = byId[`osi.layer${layer.num}`];
  if (!item) {
    report(`osi.layer${layer.num}`, 'Missing Knowledge Item for Academy OSI layer');
    continue;
  }
  if (item.data.name !== layer.de) {
    report(item.id, `Layer name mismatch: knowledge "${item.data.name}" vs academy "${layer.de}"`);
  }
  if (item.data.enName !== layer.en) {
    report(item.id, `English name mismatch: knowledge "${item.data.enName}" vs academy "${layer.en}"`);
  }
}

// Private IPv4 ranges match common Academy data
const privateItem = byId['ipv4.privateRanges'];
if (privateItem) {
  const expected = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'];
  const actual = privateItem.data.ranges.map((r) => r.network);
  for (const net of expected) {
    if (!actual.includes(net)) {
      report(privateItem.id, `Missing private range from common Academy set: ${net}`);
    }
  }
}

if (findings.length === 0) {
  console.log('\n✅ No Academy/Knowledge drift detected');
} else {
  console.log(`\n⚠ ${findings.length} source-of-truth finding(s) (see above)`);
}
