import { ciscoCommandRecallKnowledgeItems } from '../src/lib/knowledge/items/ciscoCommandRecall.js';
import { TEMPLATES } from '../src/lib/knowledge/templates.js';

function hasRecallTemplate(item) {
  return TEMPLATES.some((t) => {
    try {
      return t.matches(item);
    } catch {
      return false;
    }
  });
}

const byTopic = new Map();
for (const item of ciscoCommandRecallKnowledgeItems) {
  const topic = item.topicKey;
  if (!byTopic.has(topic)) byTopic.set(topic, []);
  byTopic.get(topic).push(item);
}

let total = 0;
let covered = 0;
let uncovered = 0;

console.log('=== Cisco Command Recall Coverage Audit ===\n');

for (const [topicKey, items] of [...byTopic.entries()].sort()) {
  const topicCovered = [];
  const topicUncovered = [];
  for (const item of items) {
    total++;
    if (hasRecallTemplate(item)) {
      covered++;
      topicCovered.push(item.data.command);
    } else {
      uncovered++;
      topicUncovered.push(item.data.command);
    }
  }
  console.log(`Topic: ${topicKey}`);
  console.log(`  Commands: ${items.length}`);
  console.log(`  Covered:  ${topicCovered.length}`);
  console.log(`  Uncovered:${topicUncovered.length > 0 ? ' ' + topicUncovered.join(', ') : ' none'}`);
}

console.log('\n--- Summary ---');
console.log(`Total command recall items: ${total}`);
console.log(`Covered:  ${covered}`);
console.log(`Uncovered:${uncovered > 0 ? ' ' + uncovered : ' 0'}`);
console.log(`Coverage: ${total === 0 ? 0 : Math.round((covered / total) * 100)}%`);

if (uncovered > 0) {
  console.error('\nAudit FAILED: some commands lack a recall template.');
  process.exit(1);
}

console.log('\n=== Cisco Command Recall Coverage Audit passed ===');

