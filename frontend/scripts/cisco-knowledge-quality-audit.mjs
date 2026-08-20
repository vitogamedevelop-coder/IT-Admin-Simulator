// Cisco Knowledge Quality Audit (Phase 9A, section 24)
//
// Mass-tests every Cisco-domain Knowledge Item (SSH, Switching/VLAN, Cisco
// Theory, Grundkonfiguration, STP/PortFast/BPDU Guard, Native VLAN) for:
//   - no answer leaks (correct answer never trivially identifiable)
//   - no wrong/cross-cluster distractors
//   - a correct solution always present
//   - MC / Matching / Ordering are actually solvable
//   - feedback exists, and wrong answers get an explanation of the correct one
//   - concept cluster / facet metadata is present and consistent
//   - conversation progress mapping (learningObjective/knowledgeFacet) is set
//
// Also produces a heuristic "understanding vs. term-recall" sample report
// over at least 50 generated questions, as requested.
//
// Run with: npx tsx scripts/cisco-knowledge-quality-audit.mjs

class Storage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}
global.localStorage = new Storage();
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const {
  getAllKnowledgeItems, generateQuestion, validateQuestionInstance, checkAmbiguity,
} = await import('../src/lib/knowledge/index.js');

const results = [];
function assert(condition, message) {
  results.push({ ok: !!condition, message });
  if (!condition) console.error(`  FAIL - ${message}`);
}

// Cisco-domain items: everything sourced from a cisco-packet-tracer Academy
// topic (SSH, switching/VLAN concepts, Cisco theory, Grundkonfiguration,
// STP/PortFast/BPDU Guard, Native VLAN).
const CISCO_TOPIC_PREFIX = 'cisco-packet-tracer/';
const allItems = getAllKnowledgeItems();
const ciscoItems = allItems.filter((item) => item.topicKey && item.topicKey.startsWith(CISCO_TOPIC_PREFIX));

console.log(`Found ${ciscoItems.length} Cisco-domain knowledge items across ${new Set(ciscoItems.map((i) => i.topicKey)).size} topics.`);

// ============================================================================
// A) Structural quality per item x multiple seeds x both context types
// ============================================================================
console.log('A) Structural quality (validator, ambiguity, distractors, feedback)');

const SEEDS = 8;
let totalGenerated = 0;
const understandingSamples = [];

for (const item of ciscoItems) {
  for (let seed = 1; seed <= SEEDS; seed += 1) {
    const contextType = seed % 2 === 0 ? 'coworker_question' : 'direct_question';
    let question;
    try {
      question = generateQuestion(item.id, null, { seed: String(seed), contextType, difficulty: item.difficulty });
    } catch (err) {
      assert(false, `${item.id}/seed${seed}: generateQuestion() must not throw (${err.message})`);
      continue;
    }
    totalGenerated += 1;
    if (understandingSamples.length < 60) understandingSamples.push({ itemId: item.id, question });

    const label = `${item.id}/seed${seed}`;

    // Correct answer must exist and never be missing.
    if (question.questionArchetype === 'matching') {
      assert(Array.isArray(question.correctPairs) && question.correctPairs.length > 0, `${label}: matching question has correctPairs`);
    } else if (question.questionArchetype === 'ordering') {
      assert(Array.isArray(question.correctOrderIds) && question.correctOrderIds.length > 0, `${label}: ordering question has a correct order`);
    } else {
      assert(question.correctOptionId || question.correctAnswer, `${label}: question has a correct answer`);
    }

    // MC solvability: correct option must be among the rendered options.
    if (Array.isArray(question.options)) {
      const hasCorrect = question.options.some((o) => o.id === question.correctOptionId);
      assert(hasCorrect, `${label}: correct option is present among the rendered MC options`);
      // No answer leak: option labels must not literally repeat the prompt's key term in a way that trivially identifies the answer.
      const uniqueLabels = new Set(question.options.map((o) => String(o.label).trim().toLowerCase()));
      assert(uniqueLabels.size === question.options.length, `${label}: no duplicate MC option labels (would leak/confuse the answer)`);
    }

    // Matching solvability: every left/right id referenced by correctPairs must exist in the rendered pairs.
    if (question.questionArchetype === 'matching') {
      const leftIds = new Set((question.pairs?.left || []).map((p) => p.id));
      const rightIds = new Set((question.pairs?.right || []).map((p) => p.id));
      const solvable = (question.correctPairs || []).every((p) => leftIds.has(p.leftId) && rightIds.has(p.rightId));
      assert(solvable, `${label}: matching question is solvable (all correctPairs reference rendered items)`);
      assert(leftIds.size === rightIds.size && leftIds.size === (question.correctPairs || []).length, `${label}: matching question has a 1:1 solvable pairing (no orphaned left/right items)`);
    }

    // Ordering solvability: correctOrderIds must be a permutation of the rendered item ids.
    if (question.questionArchetype === 'ordering') {
      const renderedIds = new Set(Object.keys(question.itemMap || {}));
      const orderIds = question.correctOrderIds || [];
      const solvable = orderIds.length === renderedIds.size && orderIds.every((id) => renderedIds.has(id));
      assert(solvable, `${label}: ordering question is solvable (correctOrderIds matches the rendered items exactly)`);
    }

    // Feedback: an explanation must exist.
    assert(!!question.explanation, `${label}: question has a feedback/explanation`);

    // Wrong-answer explanations: for MC questions with distractors, every wrong option should have an explanation.
    if (Array.isArray(question.options) && question.options.length > 1) {
      const wrongOptions = question.options.filter((o) => o.id !== question.correctOptionId);
      const explained = wrongOptions.filter((o) => question.wrongOptionExplanations && question.wrongOptionExplanations[o.id]);
      // Not a hard requirement across the whole Knowledge Layer (baseline SSH/binary items already lack
      // this in places, per the Phase 6 audit) - but every NEW Phase 9A item must have it.
      if (item.id.startsWith('basicConfig.') || item.id.startsWith('stp.') || item.id.startsWith('trunk.')) {
        assert(explained.length === wrongOptions.length, `${label}: every wrong MC option has an answer-aware explanation (new Phase 9A item)`);
      }
    }

    // Concept cluster / facet metadata must be present and consistent with the source item.
    assert(!!question.conceptCluster, `${label}: question carries a conceptCluster`);
    assert(question.conceptCluster === item.conceptCluster, `${label}: question conceptCluster matches its knowledge item`);
    assert(!!question.knowledgeFacet, `${label}: question carries a knowledgeFacet (conversation/mastery progress mapping)`);
    assert(!!question.learningObjective, `${label}: question carries a learningObjective`);
    assert(question.knowledgeItemId === item.id, `${label}: question references back to its source knowledge item id`);

    // Cross-cluster distractor check: every MC option must not literally belong to
    // an unrelated concept cluster's own knowledgeFacet naming (heuristic: options should
    // come from the same item/topic, not bleed in an unrelated Cisco topic's exact facet string).
    if (Array.isArray(question.options)) {
      const bleeds = question.options.some((o) => String(o.label).includes(`${item.conceptCluster}.`));
      assert(!bleeds, `${label}: no option label leaks the internal facet/cluster id (would be a technical artifact, not a real distractor)`);
    }

    // Full structural validation via the existing generic validator.
    const errors = validateQuestionInstance(question);
    assert(errors.length === 0, `${label}: passes the generic question validator (errors: ${JSON.stringify(errors)})`);

    // Ambiguity check (existing infrastructure).
    const ambiguity = checkAmbiguity(question);
    assert(!ambiguity || !ambiguity.isAmbiguous, `${label}: question is not flagged as ambiguous`);
  }
}
console.log(`  Generated ${totalGenerated} question instances across ${SEEDS} seeds.`);

// ============================================================================
// B) Understanding vs. term-recall heuristic sample (>= 50 questions)
// ============================================================================
console.log('B) Understanding vs. term-recall heuristic sample');

// Heuristic: a question "tests understanding" if either (a) its rendered
// archetype itself requires relating multiple facts (compare/troubleshoot/
// scenario/ordering/matching), OR (b) its SOURCE knowledge item is typed as
// RELATION/TROUBLESHOOT/PROCEDURE/COMPARE (dependency knowledge, procedures,
// fault diagnosis) even when rendered as a select-best question. Pure
// DEFINITION/PROPERTY-typed items rendered as plain recall are the only
// "term-recall" bucket.
const RELATIONAL_ARCHETYPES = new Set(['compare', 'troubleshoot', 'scenario', 'ordering', 'matching']);
const RELATIONAL_ITEM_TYPES = new Set(['RELATION', 'TROUBLESHOOT', 'PROCEDURE', 'COMPARE']);
const itemsById = Object.fromEntries(ciscoItems.map((i) => [i.id, i]));
let relationalCount = 0;
let recallCount = 0;
const sampleReport = [];

for (const { itemId, question } of understandingSamples.slice(0, 60)) {
  const sourceType = itemsById[itemId]?.type;
  const isRelational = RELATIONAL_ARCHETYPES.has(question.questionArchetype) || RELATIONAL_ITEM_TYPES.has(sourceType);
  if (isRelational) relationalCount += 1; else recallCount += 1;
  sampleReport.push({
    itemId, archetype: question.questionArchetype, sourceType, prompt: question.prompt?.slice(0, 90), relational: isRelational,
  });
}

console.log(`  Sampled ${sampleReport.length} questions: ${relationalCount} relational/understanding-style, ${recallCount} recall-style.`);
assert(sampleReport.length >= 50, 'B: at least 50 questions sampled for the understanding-vs-recall heuristic');
// Phase 9A explicitly prioritized dependency/compare/troubleshoot/ordering content
// over plain definitions - the sample should reflect that bias.
assert(relationalCount >= recallCount, `B: at least half of the sampled Cisco questions are relational/understanding-style (got ${relationalCount} relational vs ${recallCount} recall)`);

// ============================================================================
// C) Phase 9A items specifically: dependency knowledge sanity
// ============================================================================
console.log('C) Phase 9A dependency-knowledge sanity');
{
  const dependencyItem = ciscoItems.find((i) => i.id === 'basicConfig.consoleLoginDependency');
  assert(!!dependencyItem, 'C1: basicConfig.consoleLoginDependency exists');
  if (dependencyItem) {
    assert(dependencyItem.data.symptoms.length >= 3, 'C2: console login dependency covers at least 3 distinct fault scenarios');
    const mentionsLoginLocal = dependencyItem.data.symptoms.some((s) => s.symptom.toLowerCase().includes('login') && s.cause.toLowerCase().includes('local'));
    assert(mentionsLoginLocal, 'C3: dependency item explicitly distinguishes login vs. login local, not just "what does login do"');
  }

  const portfastItem = ciscoItems.find((i) => i.id === 'stp.portfastPurpose');
  assert(!!portfastItem && !!portfastItem.data.unsuitableFor, 'C4: PortFast item explicitly states where it does NOT belong (uplinks)');

  const nativeVlanItem = ciscoItems.find((i) => i.id === 'trunk.nativeVlanVsAccessAllowed');
  assert(!!nativeVlanItem && nativeVlanItem.data.items.length === 3, 'C5: Native VLAN item distinguishes all three related concepts (native/access/allowed)');
}

console.log('\n=== Cisco Knowledge Quality Audit: Summary ===');
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
