import assert from 'node:assert/strict';
import {
  validateKnowledgeRegistry,
  getAllKnowledgeItems,
  generateQuestion,
} from '../src/lib/knowledge/index.js';

const NEW_TOPICS = [
  'active-directory-virtualbox/ad-user-profiles',
  'active-directory-virtualbox/ad-permissions',
];

const newItems = getAllKnowledgeItems().filter((i) => NEW_TOPICS.includes(i.topicKey));
assert(newItems.length > 0, 'AD Kapitel 3+4 Items sollten im Registry sein');

const validation = validateKnowledgeRegistry(getAllKnowledgeItems());
if (!validation.ok) {
  console.error('Knowledge registry validation failed:');
  for (const e of validation.errors) {
    console.error(`  [${e.itemId || '-'}] ${e.field}: ${e.message}`);
  }
  process.exit(1);
}

const samples = [];
for (const item of newItems) {
  for (let s = 0; s < 2; s += 1) {
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
      coreQuestion: instance.prompt,
      correctAnswer: correct.label,
      explanation: instance.explanation,
      sourceClassification: item.sourceClassification,
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

const selected = shuffle(samples, createRng('ad-chapters-3-4-samples')).slice(0, 10);

console.log('=== AD Kapitel 3+4 Conversation Samples ===\n');
for (let i = 0; i < selected.length; i += 1) {
  const s = selected[i];
  console.log(`--- Sample ${i + 1} ---`);
  console.log(`Employee:           ${s.employee}`);
  console.log(`Core Question:      ${s.coreQuestion}`);
  console.log(`Facet:              ${s.facet}`);
  console.log(`Correct Answer:     ${s.correctAnswer}`);
  console.log(`Explanation:        ${s.explanation}`);
  console.log(`Source Class:       ${s.sourceClassification}`);
  console.log();
}

console.log(`ad-chapters-3-4-audit: PASS (${newItems.length} items, ${samples.length} generated)`);
