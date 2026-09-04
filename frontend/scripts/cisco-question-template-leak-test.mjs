import { generateQuestion } from '../src/lib/knowledge/questionGenerator.js';
import { ciscoCommandRecallKnowledgeItems } from '../src/lib/knowledge/items/ciscoCommandRecall.js';
import { TEMPLATES } from '../src/lib/knowledge/templates.js';

const SEEDS = 20;
const FORBIDDEN = [
  'null',
  'undefined',
  'NaN',
  '[object Object]',
];
const PLACEHOLDER_RE = /<[^>]+>/;

const commandTemplates = TEMPLATES.filter((t) => t.id.startsWith('cisco.command.'));
let checked = 0;
let leaks = [];

console.log('=== Cisco Question Template Leak Test ===\n');

for (const item of ciscoCommandRecallKnowledgeItems) {
  for (const template of commandTemplates) {
    if (!template.matches(item)) continue;
    for (let i = 0; i < SEEDS; i += 1) {
      const seed = `leak-${i}`;
      try {
        const q = generateQuestion(item.id, template.id, { seed, contextType: 'direct_question' });
        checked += 1;
        const allText = [q.prompt, q.explanation || '', ...q.options.map((o) => o.label)].join('\n');
        for (const bad of FORBIDDEN) {
          const re = new RegExp(`\\b${bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
          if (re.test(allText)) {
            leaks.push({ item: item.id, template: template.id, seed, found: bad, text: allText.slice(0, 200) });
          }
        }
        if (PLACEHOLDER_RE.test(allText)) {
          leaks.push({ item: item.id, template: template.id, seed, found: 'unresolved placeholder', text: allText.slice(0, 200) });
        }
      } catch (err) {
        leaks.push({ item: item.id, template: template.id, seed, found: `generation error`, text: err.message });
      }
    }
  }
}

console.log(`Checked instances: ${checked}`);
console.log(`Leaks: ${leaks.length}\n`);

if (leaks.length > 0) {
  for (const l of leaks.slice(0, 30)) {
    console.error(`LEAK: ${l.item} / ${l.template} / ${l.seed}: ${l.found}`);
    console.error(`  text: ${l.text.replace(/\n/g, ' | ')}`);
  }
  if (leaks.length > 30) console.error(`... and ${leaks.length - 30} more.`);
  process.exit(1);
}

console.log('=== Cisco Question Template Leak Test passed ===');






