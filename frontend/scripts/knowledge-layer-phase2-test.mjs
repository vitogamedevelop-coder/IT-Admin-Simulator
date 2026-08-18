import assert from 'node:assert/strict';
import {
  generateQuestion,
  generateRandomQuestion,
  listApplicableTemplates,
  TEMPLATES,
  getAllKnowledgeItems,
  getKnowledgeItemsByTopic,
  validateQuestionInstance,
  validateQuestionInstances,
  isAmbiguous,
  topicKey,
} from '../src/lib/knowledge/index.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function assertTrue(value, message) {
  if (!value) throw new Error(message);
}

// ============================================================
// Templates exist for pilot topics
// ============================================================
console.log('Checking template coverage...');
assertTrue(TEMPLATES.length > 0, 'Templates must exist');

const allItems = getAllKnowledgeItems();
let itemsWithTemplates = 0;
for (const item of allItems) {
  const templates = listApplicableTemplates(item.id);
  if (templates.length > 0) itemsWithTemplates += 1;
}
assertTrue(itemsWithTemplates > 0, 'At least some Knowledge Items must have templates');

// ============================================================
// MC generation
// ============================================================
console.log('Testing MC generation...');
const osiMc = generateQuestion('osi.layer3', 'osi.layer.taskToLayer', { seed: 'test-1' });
assertTrue(osiMc, 'MC question generated');
assertEqual(osiMc.questionArchetype, 'scenario', 'Generated archetype matches template');
assertTrue(Array.isArray(osiMc.options), 'MC has options');
assertTrue(osiMc.options.length >= 2, 'MC has at least 2 options');
assertTrue(osiMc.correctOptionId, 'MC has correctOptionId');
const correctOption = osiMc.options.find((o) => o.id === osiMc.correctOptionId);
assert(correctOption, 'correctOptionId references an existing option');
assertTrue(correctOption.label, 'Correct option has a label');
assertTrue(osiMc.explanation, 'MC has explanation');
assertTrue(osiMc.sourceTopicKey, 'MC preserves sourceTopicKey');

// ============================================================
// Ordering generation
// ============================================================
console.log('Testing Ordering generation...');
const osiOrder = generateQuestion('osi.encapsulationOrder', 'osi.encapsulationOrder.sender', { seed: 'order-1' });
assertTrue(osiOrder, 'Ordering question generated');
assertEqual(osiOrder.questionArchetype, 'ordering', 'Ordering archetype');
assertTrue(Array.isArray(osiOrder.items), 'Ordering has items');
assertTrue(Array.isArray(osiOrder.correctOrderIds), 'Ordering has correctOrderIds');
assertEqual(osiOrder.items.length, osiOrder.correctOrderIds.length, 'Ordering items and solution length match');
assertTrue(osiOrder.explanation, 'Ordering has explanation');

const sshOrder = generateQuestion('ssh.configProcedure', 'ssh.configProcedure', { seed: 'order-ssh' });
assertEqual(sshOrder.questionArchetype, 'ordering', 'SSH ordering archetype');
assertTrue(sshOrder.items.length > 2, 'SSH ordering has multiple steps');

// ============================================================
// Matching generation
// ============================================================
console.log('Testing Matching generation...');
const vlanMatch = generateQuestion('vlan.benefits', 'vlan.benefits', { seed: 'match-1' });
assertTrue(vlanMatch, 'Matching question generated');
assertEqual(vlanMatch.questionArchetype, 'matching', 'Matching archetype is matching');
assertTrue(vlanMatch.pairs && Array.isArray(vlanMatch.pairs.left) && Array.isArray(vlanMatch.pairs.right), 'Matching has left/right arrays');
assertTrue(Array.isArray(vlanMatch.correctPairs), 'Matching has correctPairs');
assertTrue(vlanMatch.explanation, 'Matching has explanation');

const sshVerify = generateQuestion('ssh.verificationCommands', 'ssh.verificationCommands', { seed: 'match-2' });
assertEqual(sshVerify.questionArchetype, 'matching', 'SSH verification matching archetype');
assertTrue(sshVerify.pairs.left.length > 1, 'SSH verification has multiple pairs');

// ============================================================
// Determinism with seed
// ============================================================
console.log('Testing deterministic generation...');
const q1a = generateQuestion('osi.layer3', 'osi.layer.numberToName', { seed: 'determinism' });
const q1b = generateQuestion('osi.layer3', 'osi.layer.numberToName', { seed: 'determinism' });
assertEqual(q1a.instanceId, q1b.instanceId, 'Same seed produces same instanceId');
assert.deepStrictEqual(q1a.options, q1b.options, 'Same seed produces same options');
assertEqual(q1a.correctOptionId, q1b.correctOptionId, 'Same seed produces same correctOptionId');

const q2a = generateQuestion('osi.layer3', 'osi.layer.numberToName', { seed: 'other-seed' });
assertNotEqual(q1a.instanceId, q2a.instanceId, 'Different seed produces different instanceId');

function assertNotEqual(a, b, message) {
  if (a === b) throw new Error(message);
}

// ============================================================
// Exactly one correct answer
// ============================================================
console.log('Testing exactly one correct answer per MC...');
const mcArchetypes = new Set(['recall', 'mapping', 'select-best', 'compare', 'scenario', 'troubleshoot', 'calculation', 'input']);
const generatedMc = [];
for (const item of allItems) {
  for (const template of listApplicableTemplates(item.id)) {
    if (mcArchetypes.has(template.archetype)) {
      generatedMc.push(generateQuestion(item.id, template.id, { seed: 'correct-check' }));
    }
  }
}
for (const q of generatedMc) {
  const correctCount = q.options.filter((o) => o.id === q.correctOptionId).length;
  assertEqual(correctCount, 1, `Question ${q.instanceId} has exactly one correct option`);
}

// ============================================================
// No duplicate options
// ============================================================
console.log('Testing no duplicate option labels...');
for (const q of generatedMc) {
  const labels = q.options.map((o) => String(o.label).trim().toLowerCase());
  const unique = new Set(labels);
  assertEqual(unique.size, labels.length, `Question ${q.instanceId} has duplicate option labels`);
}

// ============================================================
// allowedQuestionTypes respected
// ============================================================
console.log('Testing allowedQuestionTypes binding...');
for (const item of allItems) {
  const templates = listApplicableTemplates(item.id);
  for (const template of templates) {
    assertTrue(item.allowedQuestionTypes.includes(template.archetype),
      `Template ${template.id} for ${item.id} uses archetype ${template.archetype} which is in allowedQuestionTypes`);
  }
}

// ============================================================
// sourceTopicKey preserved
// ============================================================
console.log('Testing sourceTopicKey preservation...');
const sample = generateQuestion('binary.bitValues', 'binary.bitValues.order', { seed: 'source-check' });
assertEqual(sample.sourceTopicKey, 'fundamentals/binary-system', 'sourceTopicKey preserved in binary question');

// ============================================================
// Explanation present
// ============================================================
console.log('Testing explanations present...');
const allQuestions = [];
for (const item of allItems) {
  for (const template of listApplicableTemplates(item.id)) {
    allQuestions.push(generateQuestion(item.id, template.id, { seed: 'explanation-check' }));
  }
}
for (const q of allQuestions) {
  assertTrue(q.explanation && typeof q.explanation === 'string' && q.explanation.length > 0,
    `Question ${q.instanceId} must have an explanation`);
}

// ============================================================
// Ambiguity regression OSI/TCP-IP
// ============================================================
console.log('Testing ambiguity regression for OSI/TCP-IP...');
// We intentionally do not ship a template that asks the ambiguous form,
// but we verify the checker flags it if it ever occurs.
const ambiguousLike = {
  instanceId: 'test-ambiguous',
  questionArchetype: 'mapping',
  conceptCluster: 'osi.tcpipMapping',
  prompt: 'Welche Schicht entspricht OSI Layer 3?',
  options: [],
};
assertTrue(isAmbiguous(ambiguousLike), 'Ambiguous OSI/TCP-IP form is flagged');

// No actual generated question should be ambiguous.
for (const q of allQuestions) {
  assertTrue(!isAmbiguous(q), `Generated question ${q.instanceId} must not be ambiguous`);
}

// ============================================================
// OSI covers multiple layers
// ============================================================
console.log('Testing OSI layer coverage in generated questions...');
const generatedLayers = new Set();
for (let i = 1; i <= 7; i += 1) {
  const q = generateQuestion(`osi.layer${i}`, 'osi.layer.numberToName', { seed: 'layer-coverage' });
  generatedLayers.add(q.correctAnswer.label);
}
assertEqual(generatedLayers.size, 7, 'Generated questions cover all 7 OSI layers');

// ============================================================
// Binary different values
// ============================================================
console.log('Testing binary value variation...');
const binValues = new Set();
for (let i = 0; i < 10; i += 1) {
  const q = generateQuestion('binary.decimalToBinary', 'binary.decimalToBinary', { seed: `bin-${i}` });
  binValues.add(q.correctAnswer.label);
}
assertTrue(binValues.size > 1, 'Binary decimal-to-binary generates different values');

// ============================================================
// Switching/VLAN different knowledge items
// ============================================================
console.log('Testing Switching/VLAN item coverage...');
const vlanItems = getKnowledgeItemsByTopic(topicKey('fundamentals', 'vlan-basics'));
const switchingItems = getKnowledgeItemsByTopic(topicKey('fundamentals', 'switching'));
for (const item of [...vlanItems, ...switchingItems]) {
  const templates = listApplicableTemplates(item.id);
  assertTrue(templates.length > 0, `Switching/VLAN item ${item.id} must have at least one template`);
}

// ============================================================
// SSH different concepts
// ============================================================
console.log('Testing SSH concept coverage...');
const sshItems = getKnowledgeItemsByTopic(topicKey('cisco-packet-tracer', 'ssh'));
const sshConcepts = new Set();
for (const item of sshItems) {
  const templates = listApplicableTemplates(item.id);
  assertTrue(templates.length > 0, `SSH item ${item.id} must have at least one template`);
  for (const t of templates) {
    const q = generateQuestion(item.id, t.id, { seed: 'ssh-concepts' });
    sshConcepts.add(q.conceptCluster);
  }
}
assertTrue(sshConcepts.size >= 3, 'SSH questions cover multiple concept clusters');

// ============================================================
// Invalid instance rejected by validator
// ============================================================
console.log('Testing validator rejects invalid instances...');
const invalid = {
  instanceId: 'invalid-test',
  topicKey: 'fundamentals/osi-model',
  knowledgeItemId: 'osi.layer1',
  conceptCluster: 'osi.layers',
  questionArchetype: 'recall',
  difficulty: 'easy',
  prompt: 'Test',
  sourceTopicKey: 'fundamentals/osi-model',
  explanation: 'Test',
  options: [], // invalid: no options for recall MC
  correctOptionId: null,
};
const errors = validateQuestionInstance(invalid);
assertTrue(errors.length > 0, 'Validator rejects invalid instance');

// ============================================================
// Mass test: several hundred instances
// ============================================================
console.log('Running mass generation test...');
const massInstances = [];
const massCount = 500;
for (let i = 0; i < massCount; i += 1) {
  const q = generateRandomQuestion({ seed: `mass-${i}`, contextType: i % 2 === 0 ? 'direct_question' : 'coworker_question' });
  massInstances.push(q);
}
const massValidation = validateQuestionInstances(massInstances);
if (!massValidation.ok) {
  console.error('Mass validation errors (first 20):');
  massValidation.errors.slice(0, 20).forEach((e) => console.error(`  ${e.instanceId} / ${e.field}: ${e.message}`));
  throw new Error(`${massValidation.errors.length} of ${massCount} mass-generated questions failed validation`);
}
console.log(`  ${massCount} random questions validated successfully`);

// ============================================================
// Natural language sanity (not prüfer-like)
// ============================================================
console.log('Testing natural language sanity...');
const badPhrases = ['Welche der folgenden Aussagen', 'Ordne die folgenden Begriffe'];
const badDetected = [];
for (const q of massInstances) {
  for (const phrase of badPhrases) {
    if (q.prompt.toLowerCase().startsWith(phrase.toLowerCase())) {
      badDetected.push(q.instanceId);
    }
  }
}
assertEqual(badDetected.length, 0, `No generated prompt should start with prüfer-like phrases. Offenders: ${badDetected.slice(0, 5).join(', ')}`);

const coworkerCount = massInstances.filter((q) => q.context.contextType === 'coworker_question').length;
assertTrue(coworkerCount > 0, 'Mass test includes coworker_question contextType variants');

// ============================================================
// Summary
// ============================================================
console.log('\n✅ Phase 2 Knowledge Layer Template tests passed');
console.log(`   Templates: ${TEMPLATES.length}`);
console.log(`   Knowledge Items with templates: ${itemsWithTemplates}/${allItems.length}`);
console.log(`   Mass test: ${massCount} generated + validated`);
