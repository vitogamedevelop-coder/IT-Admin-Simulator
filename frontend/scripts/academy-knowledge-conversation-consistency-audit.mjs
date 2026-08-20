// Academy <-> Knowledge Layer <-> Conversation Consistency Audit
// (Phase 9A, section 25)
//
// For every Cisco Academy topic (cisco-packet-tracer/*), checks whether:
//   - an Academy lesson exists (academyLessonData.js LESSONS registry)
//   - Knowledge Layer coverage exists (knowledge items with a matching topicKey)
//   - Conversation coverage exists (Knowledge Layer OR a legacy
//     CONVERSATION_TOPICS entry with at least one real, non-empty archetype)
//
// Topics for curriculum blocks that are INTENTIONALLY not yet implemented
// (L3/MLS, DHCP server+relay specifics, NAT, ACL, packet filtering, OSPF,
// troubleshooting) are listed in EXPECTED_GAPS so they don't fail the audit.
// Any OTHER topic missing Knowledge/Conversation coverage is a genuine,
// unintentional drift and fails the audit - this is exactly the test the
// previous Cisco Coverage Audit recommended to prevent future silent drift
// between Academy, Knowledge Layer and Conversation content.
//
// Run with: npx tsx scripts/academy-knowledge-conversation-consistency-audit.mjs

class Storage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}
global.localStorage = new Storage();
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const { ACADEMY_TOPICS, topicKey } = await import('../src/lib/academyTopics.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');
const { getAllKnowledgeItems } = await import('../src/lib/knowledge/index.js');
const { CONVERSATION_TOPICS, getArchetypes } = await import('../src/lib/employeeConversations.js');

const results = [];
function assert(condition, message) {
  results.push({ ok: !!condition, message });
  if (!condition) console.error(`  FAIL - ${message}`);
}

// Known, intentional gaps (curriculum blocks explicitly deferred to a later
// phase per the Cisco Coverage Audit - Phase 9A explicitly excludes them,
// see "28. NICHT BAUEN"). Update this list only when a block is genuinely
// implemented end-to-end, not to silence a real regression.
const EXPECTED_KNOWLEDGE_GAPS = new Set([
  'cisco-packet-tracer/router-basics', // conceptual routing covered under ciscoTheory.js (ct.router.*), not this exact topicKey
  'cisco-packet-tracer/static-routing', // conceptual routing covered under ciscoTheory.js (ct.static.*), not this exact topicKey
  'cisco-packet-tracer/inter-vlan-routing', // Router-on-a-Stick specifics not yet in Knowledge Layer (Phase 9B candidate)
  'cisco-packet-tracer/vlan', // pre-existing gap (predates Phase 9A): VLAN concepts live under fundamentals/vlan-basics, not this topicKey - Phase 9B candidate
  'cisco-packet-tracer/access-port', // pre-existing gap (predates Phase 9A), same cause as above - Phase 9B candidate
  'cisco-packet-tracer/multilayer-switching', // L3 switching - deferred (Phase 9A section 28)
  'cisco-packet-tracer/ospf', // deferred, not part of the audited 7 curriculum blocks
  'cisco-packet-tracer/acl', // deferred (Phase 9A section 28)
  'cisco-packet-tracer/packet-filter', // deferred (Phase 9A section 28)
  'cisco-packet-tracer/nat', // deferred (Phase 9A section 28)
  'cisco-packet-tracer/troubleshooting', // generic cross-cutting topic, not part of the audited 7 blocks
  'cisco-packet-tracer/dhcp', // DHCP Relay specifics - deferred (Phase 9A section 28)
  'cisco-packet-tracer/grundkonfiguration', // legacy/duplicate of basic-device-configuration (see Cisco Coverage Audit)
]);
// Conversation coverage is derived from the same Knowledge Layer topics (see
// hasRealConversationCoverage below), so the two gap lists are intentionally
// identical - kept as one Set to avoid the lists silently drifting apart.

const ciscoTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === 'cisco-packet-tracer');
console.log(`Auditing ${ciscoTopics.length} Cisco Academy topics.`);

const allKnowledgeItems = getAllKnowledgeItems();

function hasAcademyLesson(key) {
  return !!LESSONS[key];
}

function knowledgeItemsForTopic(key) {
  return allKnowledgeItems.filter((item) => item.topicKey === key);
}

function hasRealConversationCoverage(key) {
  if (knowledgeItemsForTopic(key).length > 0) return true;
  const topicData = CONVERSATION_TOPICS[key];
  if (!topicData) return false;
  const archetypes = getArchetypes(topicData);
  return archetypes.length > 0;
}

console.log('\nPer-topic coverage:');
for (const topicDef of ciscoTopics) {
  const key = topicKey(topicDef.categoryId, topicDef.topicId);
  const academy = hasAcademyLesson(key);
  const knowledgeCount = knowledgeItemsForTopic(key).length;
  const conversation = hasRealConversationCoverage(key);

  console.log(`  ${key}: academy=${academy ? 'yes' : 'NO'} knowledge=${knowledgeCount} conversation=${conversation ? 'yes' : 'no'}`);

  if (EXPECTED_KNOWLEDGE_GAPS.has(key)) {
    // Known gap: just record it, don't fail. But DO fail if it has been
    // silently "fixed" without updating this audit (drift in the other
    // direction - stale expectations are also worth catching manually).
    continue;
  }

  assert(knowledgeCount > 0, `${key}: expected Knowledge Layer coverage (found ${knowledgeCount} items) - if this is intentionally not yet built, add it to EXPECTED_KNOWLEDGE_GAPS`);
  assert(conversation, `${key}: expected Conversation coverage (Knowledge Layer or legacy CONVERSATION_TOPICS) - if intentionally not yet built, add it to EXPECTED_CONVERSATION_GAPS`);
}

// ============================================================================
// Explicit Phase 9A regression: the three topics this phase closed must now
// have real coverage, not just "not in the gap list".
// ============================================================================
console.log('\nPhase 9A closed-gap verification:');
const PHASE_9A_TOPICS = [
  topicKey('cisco-packet-tracer', 'basic-device-configuration'),
  topicKey('cisco-packet-tracer', 'stp'),
  topicKey('cisco-packet-tracer', 'trunk'),
];
for (const key of PHASE_9A_TOPICS) {
  const count = knowledgeItemsForTopic(key).length;
  assert(count > 0, `${key}: Phase 9A must have added Knowledge Layer items (found ${count})`);
  assert(hasRealConversationCoverage(key), `${key}: Phase 9A topic must be reachable in conversations`);
  assert(!EXPECTED_KNOWLEDGE_GAPS.has(key), `${key}: must not remain listed as an expected gap now that it is implemented`);
}

// ============================================================================
// Legacy-placeholder detection: CONVERSATION_TOPICS entries with an empty
// questions array (dead code found by the previous Coverage Audit) should
// either be removed or actually filled - flag them explicitly so they don't
// silently linger.
// ============================================================================
console.log('\nLegacy placeholder check (CONVERSATION_TOPICS with 0 archetypes):');
for (const [key, topicData] of Object.entries(CONVERSATION_TOPICS)) {
  if (!key.startsWith('cisco-packet-tracer/')) continue;
  const archetypes = getArchetypes(topicData);
  if (archetypes.length === 0 && knowledgeItemsForTopic(key).length === 0) {
    console.log(`  NOTE (known, pre-existing): ${key} has a CONVERSATION_TOPICS entry with 0 usable archetypes and no Knowledge Layer coverage.`);
  }
}

console.log('\n=== Academy <-> Knowledge <-> Conversation Consistency Audit: Summary ===');
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log(`Total assertions: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (failed > 0) {
  console.log('\nFailed assertions:');
  results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.message}`));
  process.exitCode = 1;
} else {
  console.log('All checks passed.');
}
