// =============================================================================
// NEXUS Knowledge Layer – Phase 5.1 Integration Test
//
// Validates the new Learning Objective + Knowledge Facet structure,
// the FacetMastery store, context-aware prompts, and single-owner language.
// =============================================================================

import {
  getAllKnowledgeItems,
  generateQuestion,
  listApplicableTemplates,
  PROMPT_STYLES,
  CONTEXT_DEPENDENCIES,
  createBalancerState,
  selectCandidate,
  recordFacetCorrect,
  recordFacetWrong,
  getAllFacetMasteryScores,
  resetFacetMastery,
} from '../src/lib/knowledge/index.js';

function assertFalse(value, message) {
  if (value) throw new Error(message);
}

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

const actorPhrases = ['Ein Techniker meldet', 'Ein Techniker stellt fest', 'Ein Kollege fragt', 'Ein Kollege berichtet'];
function hasMultipleActorPhrases(text) {
  return actorPhrases.filter((p) => text.includes(p)).length > 1;
}

// ---------------------------------------------------------------------------
// FacetMastery store basics
// ---------------------------------------------------------------------------
console.log('FacetMastery store exports and scoring');
resetFacetMastery();
assertTrue(Object.keys(getAllFacetMasteryScores()).length === 0, 'fresh store is empty');
recordFacetCorrect('osi.layer1.name');
let score = getAllFacetMasteryScores()['osi.layer1.name'];
assertEqual(score, 1, 'first correct increments to 1');
recordFacetCorrect('osi.layer1.name');
score = getAllFacetMasteryScores()['osi.layer1.name'];
assertEqual(score, 2, 'second correct increments to 2');
recordFacetWrong('osi.layer1.name');
score = getAllFacetMasteryScores()['osi.layer1.name'];
assertEqual(score, 1, 'wrong decrements by 1');
recordFacetWrong('osi.layer1.name');
score = getAllFacetMasteryScores()['osi.layer1.name'];
assertEqual(score, 0, 'score floor is 0');

// ---------------------------------------------------------------------------
// Templates expose required metadata
// ---------------------------------------------------------------------------
console.log('Templates expose learningObjective, knowledgeFacet and prompt style');
const items = getAllKnowledgeItems();
let checkedTemplates = 0;
for (const item of items) {
  const templates = listApplicableTemplates(item.id);
  for (const template of templates) {
    const instance = generateQuestion(item.id, template.id, { contextType: 'coworker_question', seed: 'phase5-1' });
    assertTrue(instance.learningObjective, `instance ${instance.instanceId} has learningObjective`);
    assertTrue(instance.knowledgeFacet, `instance ${instance.instanceId} has knowledgeFacet`);
    assertTrue(Object.values(PROMPT_STYLES).includes(instance.promptStyle), `instance ${instance.instanceId} has valid promptStyle`);
    assertTrue(Object.values(CONTEXT_DEPENDENCIES).includes(instance.contextDependency), `instance ${instance.instanceId} has valid contextDependency`);
    assertTrue(instance.conversationText && instance.conversationText.length > 5, `instance ${instance.instanceId} has conversationText`);
    assertFalse(hasMultipleActorPhrases(instance.conversationText), `instance ${instance.instanceId} has multiple actor phrases: ${instance.conversationText}`);
    checkedTemplates += 1;
  }
}
assertTrue(checkedTemplates > 0, 'checked at least one template');

// ---------------------------------------------------------------------------
// Conversation rendering uses single-owner natural language
// ---------------------------------------------------------------------------
console.log('Self-contained templates own the full conversation utterance');
const sample = generateQuestion('switching.deviceCompare', null, { contextType: 'coworker_question', seed: 'phase5-1' });
assertTrue(sample.conversationText.includes('?') || sample.conversationText.length > 20, 'conversationText is a full sentence');

// ---------------------------------------------------------------------------
// Context-aware calculation prompts stay semantically valid
// ---------------------------------------------------------------------------
console.log('Calculation prompts respect parameter-dependent scenarios');
for (let i = 0; i < 50; i += 1) {
  const q = generateQuestion('binary.decimalToBinary', null, { contextType: 'coworker_question', seed: `calc-${i}` });
  const params = q.calculationParams || {};
  const text = q.conversationText;
  const maskOctets = new Set([0, 128, 192, 224, 240, 248, 252, 254, 255]);
  if (text.includes('Subnetzmaske') || text.includes('Subnetzmaske')) {
    assertTrue(maskOctets.has(params.decimal), `decimal ${params.decimal} is not a mask octet but prompt claims subnet mask context`);
  }
}

// ---------------------------------------------------------------------------
// Facet cooldown is enforced by the balancer
// ---------------------------------------------------------------------------
console.log('Facet min-gap is enforced by the semantic balancer');
resetFacetMastery();
const facet = 'subnetting.calculation.networkId';
const candidates = [
  { id: 'a', topicKey: 'fundamentals/subnetting', conceptCluster: 'subnetting.calculation', knowledgeFacet: facet, questionArchetype: 'calculation', difficulty: 'medium' },
  { id: 'b', topicKey: 'fundamentals/binary', conceptCluster: 'binary.values', knowledgeFacet: 'binary.values.order', questionArchetype: 'ordering', difficulty: 'medium' },
  { id: 'c', topicKey: 'fundamentals/ipv4', conceptCluster: 'ipv4.structure', knowledgeFacet: 'ipv4.structure.bits', questionArchetype: 'recall', difficulty: 'medium' },
];
const history = { session: [{ knowledgeFacet: facet, knowledgeItemId: 'a', topicKey: 'fundamentals/subnetting', questionArchetype: 'calculation', templateId: 'subnetting.networkId' }], longTerm: [] };
const stateWithMastery = createBalancerState({ history, facetMasteryMap: { [facet]: 0 } });
const selected = selectCandidate(candidates, stateWithMastery, { seed: 'facet-gap' });
assertTrue(selected.id !== 'a', 'recently used facet should be on cooldown');

// ---------------------------------------------------------------------------
// Balancer prefers weak facets
// ---------------------------------------------------------------------------
console.log('Balancer prefers weak/unmastered facets');
resetFacetMastery();
const weakFacet = 'binary.values.order';
const masteryMap = { 'osi.layer1.name': 5, [weakFacet]: 0 };
const prefCandidates = [
  { id: 'mastered', topicKey: 'fundamentals/osi-model', conceptCluster: 'osi.layers', knowledgeFacet: 'osi.layer1.name', questionArchetype: 'mapping', difficulty: 'medium' },
  { id: 'weak', topicKey: 'fundamentals/binary-system', conceptCluster: 'binary.values', knowledgeFacet: weakFacet, questionArchetype: 'ordering', difficulty: 'medium' },
];
const prefState = createBalancerState({ history: { session: [], longTerm: [] }, facetMasteryMap: masteryMap });
// Run several times; weak should appear more often.
let weakCount = 0;
for (let i = 0; i < 20; i += 1) {
  const choice = selectCandidate(prefCandidates, prefState, { seed: `pref-${i}` });
  if (choice.id === 'weak') weakCount += 1;
}
assertTrue(weakCount >= 10, `weak facet should be preferred (${weakCount}/20)`);

console.log('✅ Phase 5.1 Knowledge Facet & Context tests passed');
