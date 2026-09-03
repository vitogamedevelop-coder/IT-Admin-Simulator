import { generateQuestion } from '../src/lib/knowledge/questionGenerator.js';
import { ciscoCommandRecallKnowledgeItems } from '../src/lib/knowledge/items/ciscoCommandRecall.js';
import { TEMPLATES } from '../src/lib/knowledge/templates.js';

const SEEDS = ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'];
const LEAK_PATTERNS = [
  /\bnull\b/i,
  /\bundefined\b/i,
  /\bNaN\b/,
  /\[object Object\]/,
  /<[^>]+>/,
];

const templateIds = TEMPLATES.filter((t) => t.id.startsWith('cisco.command.')).map((t) => t.id);

let generated = 0;
let failures = [];

function record(instance, itemId, templateId, seed, message) {
  failures.push({ itemId, templateId, seed, prompt: instance?.prompt || '', message });
}

console.log('=== Cisco Generated Question Quality Audit ===\n');
console.log(`Templates inspected: ${templateIds.join(', ')}`);
console.log(`Items inspected: ${ciscoCommandRecallKnowledgeItems.length}`);
console.log(`Seeds per combination: ${SEEDS.length}\n`);

for (const item of ciscoCommandRecallKnowledgeItems) {
  for (const templateId of templateIds) {
    const applicable = templateId && TEMPLATES.find((t) => t.id === templateId)?.matches(item);
    if (!applicable) continue;
    for (const seed of SEEDS) {
      try {
        const q = generateQuestion(item.id, templateId, { seed, contextType: 'direct_question' });
        generated += 1;

        if (typeof q.prompt !== 'string' || q.prompt.trim().length === 0) {
          record(q, item.id, templateId, seed, 'empty prompt');
        }
        for (const p of LEAK_PATTERNS) {
          if (p.test(q.prompt)) {
            record(q, item.id, templateId, seed, `prompt leak matches ${p.source}`);
          }
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          record(q, item.id, templateId, seed, `too few options (${q.options?.length || 0})`);
        }
        const labels = q.options.map((o) => String(o.label));
        const unique = new Set(labels);
        if (unique.size !== labels.length) {
          record(q, item.id, templateId, seed, 'duplicate option labels');
        }
        for (const label of labels) {
          if (!label || label.trim().length === 0) {
            record(q, item.id, templateId, seed, 'empty option label');
          }
          for (const p of LEAK_PATTERNS) {
            if (p.test(label)) {
              record(q, item.id, templateId, seed, `option leak matches ${p.source}: ${label}`);
            }
          }
        }
        if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= labels.length) {
          record(q, item.id, templateId, seed, 'invalid correct index');
        }
        if (!q.explanation || String(q.explanation).trim().length === 0) {
          record(q, item.id, templateId, seed, 'missing explanation');
        }
      } catch (err) {
        record(null, item.id, templateId, seed, `generation/validation error: ${err.message}`);
      }
    }
  }
}

console.log(`Generated instances: ${generated}`);
console.log(`Failures: ${failures.length}\n`);

if (failures.length > 0) {
  for (const f of failures.slice(0, 20)) {
    console.error(`FAIL: ${f.itemId} / ${f.templateId} / ${f.seed}: ${f.message}`);
    if (f.prompt) console.error(`  prompt: ${f.prompt}`);
  }
  if (failures.length > 20) console.error(`... and ${failures.length - 20} more.`);
  process.exit(1);
}

console.log('=== Cisco Generated Question Quality Audit passed ===');



