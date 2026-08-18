
import {
  generateBalancedQuestion,
  generateQuestion,
  getAllKnowledgeItems,
  KNOWLEDGE_TYPES,
  pushHistoryRecord,
  createSemanticHistory,
  readLongTermHistory,
  writeLongTermHistory,
} from '../src/lib/knowledge/index.js';

// Provide a minimal localStorage mock for Node so persistence round-trips work.
const store = new Map();
global.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, value),
  removeItem: (key) => store.delete(key),
};

function assertTrue(value, message) {
  if (!value) throw new Error(message);
}

function assertFalse(value, message) {
  if (value) throw new Error(message);
}

function assertLessThan(actual, max, message) {
  if (!(actual < max)) throw new Error(`${message}: expected < ${max}, got ${actual}`);
}

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function normalizeTopicKey(key) {
  return key || 'unknown';
}

function simulateSelections({
  count = 1000,
  seed = 'phase4',
  progressByTopic = {},
  initialHistory = createSemanticHistory(),
  lastResult = null,
  difficultyProfile = null,
  candidates = null,
  answerFeedback = null,
} = {}) {
  // When candidates are not explicitly provided, let generateBalancedQuestion
  // compute the default candidate list (it already filters for items that
  // have applicable templates). This avoids including items such as
  // osi.toTcpIp which intentionally has no template yet.
  const candidateList = candidates;

  let history = initialHistory;
  const selections = [];
  for (let i = 0; i < count; i += 1) {
    const q = generateBalancedQuestion(
      { history, progressByTopic, lastResult, difficultyProfile },
      {
        seed: `${seed}-${i}`,
        contextType: 'direct_question',
        candidates: candidateList,
      },
    );
    selections.push(q);
    const feedback = answerFeedback ? answerFeedback(q, i) : null;
    history = pushHistoryRecord(history, q, { correct: feedback?.correct ?? null });
    // Preserve lastResult unless the test explicitly provides new feedback.
    if (feedback && feedback.correct !== undefined) {
      lastResult = {
        knowledgeItemId: q.knowledgeItemId,
        topicKey: q.topicKey,
        correct: feedback.correct,
      };
    }
  }
  return selections;
}

// ---------------------------------------------------------------------------
// Root problem regression test: no unreasonable repetition
// ---------------------------------------------------------------------------
console.log('Root problem regression: no immediate topic/cluster repetition');
const rootSelections = simulateSelections({ count: 60, seed: 'root-problem' });
const rootTopicCounts = countBy(rootSelections, (q) => normalizeTopicKey(q.topicKey));
const maxTopic = Math.max(...rootTopicCounts.values());
assertLessThan(maxTopic, 22, `Single topic should not dominate 60 selections (max ${maxTopic})`);

// Check no three consecutive identical knowledge items.
for (let i = 2; i < rootSelections.length; i += 1) {
  const a = rootSelections[i - 2].knowledgeItemId;
  const b = rootSelections[i - 1].knowledgeItemId;
  const c = rootSelections[i].knowledgeItemId;
  assertFalse(a === b && b === c, `Three consecutive identical knowledge items at ${i}: ${a}`);
}

// ---------------------------------------------------------------------------
// Mass distribution test
// ---------------------------------------------------------------------------
console.log('Mass distribution test: 1000+ balanced selections');
const massSelections = simulateSelections({ count: 1200, seed: 'mass-dist' });
const massTopicCounts = countBy(massSelections, (q) => normalizeTopicKey(q.topicKey));
const totalTopics = massTopicCounts.size;
assertTrue(totalTopics >= 4, `Expected at least 4 distinct topics, got ${totalTopics}`);

const sortedTopicCounts = [...massTopicCounts.entries()].sort((a, b) => b[1] - a[1]);
const topTopicRatio = sortedTopicCounts[0][1] / massSelections.length;
assertLessThan(topTopicRatio, 0.30, `Top topic ratio too high: ${topTopicRatio.toFixed(3)}`);

const clusterCounts = countBy(massSelections, (q) => q.conceptCluster || 'none');
const sortedClusters = [...clusterCounts.entries()].sort((a, b) => b[1] - a[1]);
const topClusterRatio = sortedClusters[0][1] / massSelections.length;
assertLessThan(topClusterRatio, 0.25, `Top concept cluster ratio too high: ${topClusterRatio.toFixed(3)}`);

// ---------------------------------------------------------------------------
// OSI layer coverage
// ---------------------------------------------------------------------------
console.log('OSI layer coverage across selections');
const osiItems = getAllKnowledgeItems().filter((i) => i.topicKey === 'fundamentals/osi-model');
assertTrue(osiItems.length > 0, 'OSI knowledge items should exist');
const osiSelections = massSelections.filter((q) => q.topicKey === 'fundamentals/osi-model');
const osiLayers = countBy(osiSelections, (q) => {
  const m = q.knowledgeItemId.match(/^osi\.layer(\d)$/);
  return m ? `L${m[1]}` : 'general';
});
const coveredLayers = [...osiLayers.keys()].filter((k) => k.startsWith('L'));
assertTrue(coveredLayers.length >= 3, `Expected OSI coverage across multiple layers, got ${coveredLayers.join(',')}`);

// ---------------------------------------------------------------------------
// Weak-topic test
// ---------------------------------------------------------------------------
console.log('Weak topic preference test');
const allTopicKeys = new Set(getAllKnowledgeItems().map((i) => i.topicKey));
const weakProgress = {};
for (const key of allTopicKeys) {
  weakProgress[key] = { overall: 80, mastered: true };
}
weakProgress['fundamentals/osi-model'] = { overall: 20, mastered: false };

const weakSelections = simulateSelections({
  count: 200,
  seed: 'weak-topic',
  progressByTopic: weakProgress,
});
const weakTopicCounts = countBy(weakSelections, (q) => normalizeTopicKey(q.topicKey));
const osiCount = weakTopicCounts.get('fundamentals/osi-model') || 0;
const osiRatio = osiCount / weakSelections.length;
assertTrue(osiRatio > 0.12, `Weak OSI topic should be selected more often than uniform (${(osiRatio * 100).toFixed(1)}%)`);
assertLessThan(osiRatio, 0.60, `Weak OSI topic should not dominate (${(osiRatio * 100).toFixed(1)}%)`);

// ---------------------------------------------------------------------------
// Wrong-answer retry test
// ---------------------------------------------------------------------------
console.log('Wrong-answer retry behavior');
const someItem = getAllKnowledgeItems()[0];
assertTrue(someItem, 'Need at least one Knowledge Item for retry test');
let lastResult = { knowledgeItemId: someItem.id, topicKey: someItem.topicKey, correct: false };
const retrySelections = simulateSelections({
  count: 30,
  seed: 'wrong-retry',
  lastResult,
  answerFeedback: () => ({ correct: true }),
});
const retrySameItem = retrySelections.filter((q) => q.knowledgeItemId === someItem.id).length;
assertTrue(retrySameItem >= 1, 'Wrong-answered item should reappear soon');
// It should not be the very next question because of the consecutive-item rule.
assertFalse(retrySelections[0].knowledgeItemId === someItem.id, 'Wrong-answered item should not be immediately repeated');

// ---------------------------------------------------------------------------
// Right-answer cooldown test
// ---------------------------------------------------------------------------
console.log('Right-answer cooldown behavior');
lastResult = { knowledgeItemId: someItem.id, topicKey: someItem.topicKey, correct: true };
const cooldownSelections = simulateSelections({
  count: 20,
  seed: 'right-cooldown',
  lastResult,
});
const cooldownSameItem = cooldownSelections.filter((q) => q.knowledgeItemId === someItem.id).length;
assertLessThan(cooldownSameItem, 4, `Correctly answered item should be suppressed (${cooldownSameItem})`);

// ---------------------------------------------------------------------------
// Determinism test
// ---------------------------------------------------------------------------
console.log('Determinism test');
const runA = simulateSelections({ count: 50, seed: 'det', progressByTopic: weakProgress });
const runB = simulateSelections({ count: 50, seed: 'det', progressByTopic: weakProgress });
for (let i = 0; i < runA.length; i += 1) {
  assertEqual(
    `${runA[i].knowledgeItemId}|${runA[i].context.templateId}`,
    `${runB[i].knowledgeItemId}|${runB[i].context.templateId}`,
    `Determinism mismatch at index ${i}`,
  );
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

// ---------------------------------------------------------------------------
// Session vs long-term history test
// ---------------------------------------------------------------------------
console.log('Session reset preserves long-term memory');
const sessionRun = simulateSelections({ count: 30, seed: 'session-reset' });
let longTermHistory = createSemanticHistory();
for (const q of sessionRun) {
  longTermHistory = pushHistoryRecord(longTermHistory, q);
}
const resetHistory = { longTerm: longTermHistory.longTerm, session: [] };
const afterReset = simulateSelections({ count: 20, seed: 'after-reset', initialHistory: resetHistory });
const afterResetItemIds = new Set(afterReset.map((q) => q.knowledgeItemId));
const recentlyUsed = new Set(sessionRun.slice(-10).map((q) => q.knowledgeItemId));
const overlap = [...recentlyUsed].filter((id) => afterResetItemIds.has(id)).length;
assertLessThan(overlap, 8, 'After session reset, recently used items should still be somewhat suppressed');

// ---------------------------------------------------------------------------
// Calculation parameter balancing
// ---------------------------------------------------------------------------
console.log('Calculation parameter balancing');
const calcItems = getAllKnowledgeItems().filter((i) => i.type === KNOWLEDGE_TYPES.CALCULATION);
assertTrue(calcItems.length > 0, 'Calculation items should exist');
const calcSelections = simulateSelections({
  count: 150,
  seed: 'calc-balance',
  filter: (i) => i.type === KNOWLEDGE_TYPES.CALCULATION,
});
const prefixBuckets = countBy(
  calcSelections.filter((q) => q.calculationParams?.prefix !== undefined),
  (q) => {
    const p = q.calculationParams.prefix;
    if (p <= 8) return '/0-/8';
    if (p <= 15) return '/9-/15';
    if (p <= 23) return '/16-/23';
    if (p <= 26) return '/24-/26';
    return '/27-/30';
  },
);
const sortedBuckets = [...prefixBuckets.entries()].sort((a, b) => b[1] - a[1]);
const topBucketRatio = sortedBuckets[0][1] / calcSelections.length;
assertLessThan(topBucketRatio, 0.45, `Prefix bucket imbalance: ${topBucketRatio.toFixed(3)}`);

const calcTargets = countBy(calcSelections, (q) => q.calculationParams?.target || q.knowledgeItemId);
const sortedTargets = [...calcTargets.entries()].sort((a, b) => b[1] - a[1]);
const topTargetRatio = sortedTargets[0][1] / calcSelections.length;
assertLessThan(topTargetRatio, 0.35, `Calculation target imbalance: ${topTargetRatio.toFixed(3)}`);

// ---------------------------------------------------------------------------
// Question type balancing
// ---------------------------------------------------------------------------
console.log('Question archetype distribution');
const archetypeCounts = countBy(massSelections, (q) => q.questionArchetype || 'none');
const sortedArchetypes = [...archetypeCounts.entries()].sort((a, b) => b[1] - a[1]);
const topArchetypeRatio = sortedArchetypes[0][1] / massSelections.length;
assertLessThan(topArchetypeRatio, 0.45, `Archetype imbalance: ${topArchetypeRatio.toFixed(3)}`);

// ---------------------------------------------------------------------------
// Fallback behavior when candidates are few
// ---------------------------------------------------------------------------
console.log('Fallback with tiny candidate pool');
const tinyCandidates = getAllKnowledgeItems().slice(0, 2);
const tinySelections = simulateSelections({ count: 20, seed: 'tiny', candidates: tinyCandidates });
assertTrue(tinySelections.length === 20, 'Should still produce selections with tiny pool');

// ---------------------------------------------------------------------------
// Backward compatibility: empty history
// ---------------------------------------------------------------------------
console.log('Backward compatibility: empty/missing history');
const emptyHistory = createSemanticHistory();
const firstSelection = generateBalancedQuestion(
  { history: emptyHistory, progressByTopic: {}, lastResult: null },
  { seed: 'empty-history', candidates: getAllKnowledgeItems().slice(0, 5) },
);
assertTrue(firstSelection && firstSelection.knowledgeItemId, 'Should produce a selection with empty history');

// ---------------------------------------------------------------------------
// Storage round-trip
// ---------------------------------------------------------------------------
console.log('History storage round-trip');
const preStore = createSemanticHistory();
const storeableItems = getAllKnowledgeItems().filter((item) => item.id !== 'osi.toTcpIp');
for (let i = 0; i < 10; i += 1) {
  const item = storeableItems[i % storeableItems.length];
  const q = generateQuestion(item.id, null, { seed: `store-${i}` });
  preStore.longTerm = pushHistoryRecord(preStore, q).longTerm;
}
writeLongTermHistory(preStore);
const postStore = readLongTermHistory();
assertEqual(postStore.longTerm.length, 10, 'Stored history should round-trip with 10 entries');

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n✅ Phase 4 Semantic Cooldown & Topic Balancing tests passed');
console.log(`   Total mass selections: ${massSelections.length}`);
console.log(`   Distinct topics in mass run: ${totalTopics}`);
console.log(`   Top topic ratio: ${(topTopicRatio * 100).toFixed(1)}%`);
console.log(`   Top cluster ratio: ${(topClusterRatio * 100).toFixed(1)}%`);
console.log(`   Weak-topic OSI ratio: ${(osiRatio * 100).toFixed(1)}%`);
