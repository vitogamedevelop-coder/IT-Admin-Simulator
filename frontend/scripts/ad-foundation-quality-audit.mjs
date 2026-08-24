import assert from 'node:assert/strict';
import {
  validateKnowledgeRegistry,
  getAllKnowledgeItems,
  generateQuestion,
} from '../src/lib/knowledge/index.js';

const AD_ITEMS = getAllKnowledgeItems().filter((i) => i.topicKey === 'active-directory-virtualbox/ad-foundation');
assert(AD_ITEMS.length > 0, 'AD Foundation knowledge items should be in registry');

const validation = validateKnowledgeRegistry(getAllKnowledgeItems());
if (!validation.ok) {
  console.error('Knowledge registry validation failed:');
  for (const e of validation.errors) {
    console.error(`  [${e.itemId || '-'}] ${e.field}: ${e.message}`);
  }
  process.exit(1);
}

const samples = [];
for (const item of AD_ITEMS) {
  for (let s = 0; s < 4; s += 1) {
    const instance = generateQuestion(item.id, null, {
      seed: `audit-${s}`,
      contextType: 'coworker_question',
    });
    assert(instance, `No instance for ${item.id}`);
    assert(instance.options && instance.options.length === 4, `Expected 4 options for ${item.id}`);
    const correct = instance.options.find((o) => o.id === instance.correctOptionId);
    assert(correct, `Correct option missing for ${item.id}`);
    const employee =
      (item.roleHints?.includes('support') && 'Mara (Helpdesk)') ||
      (item.roleHints?.includes('security') && 'Security-Team') ||
      (item.roleHints?.includes('management') && 'Management') ||
      'David (Entwicklung)';
    samples.push({
      employee,
      itemId: item.id,
      facet: instance.knowledgeFacet || item.conceptCluster,
      context: instance.prompt !== instance.conversationText ? instance.prompt : '',
      coreQuestion: instance.prompt,
      correctAnswer: correct.label,
      explanation: instance.explanation,
      sourceStatus: item.sourceStatus,
    });
  }
}

function shuffle(array, rng) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng.next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createRng(seed) {
  let s = Array.from(seed).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0) || 1;
  return {
    next() {
      s = ((s * 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    },
  };
}

const selected = shuffle(samples, createRng('ad-foundation-samples')).slice(0, 20);

console.log('=== AD Foundation Conversation Samples ===\n');
for (let i = 0; i < selected.length; i += 1) {
  const s = selected[i];
  console.log(`--- Sample ${i + 1} ---`);
  console.log(`Employee:        ${s.employee}`);
  console.log(`Context:         ${s.context || '(none)'}`);
  console.log(`Core Question:   ${s.coreQuestion}`);
  console.log(`Facet:           ${s.facet}`);
  console.log(`Correct Answer:  ${s.correctAnswer}`);
  console.log(`Explanation:     ${s.explanation}`);
  console.log(`Source Status:   ${s.sourceStatus}`);
  console.log();
}

const byFacet = {};
for (const s of selected) {
  byFacet[s.facet] = (byFacet[s.facet] || 0) + 1;
}
console.log('=== Facet distribution in 20 samples ===');
for (const [k, v] of Object.entries(byFacet).sort()) {
  console.log(`${k}: ${v}`);
}

console.log('ad-foundation-quality-audit: PASS');
