import { generateQuestion } from '../src/lib/knowledge/questionGenerator.js';
import { ciscoCommandRecallKnowledgeItems } from '../src/lib/knowledge/items/ciscoCommandRecall.js';
import { TEMPLATES } from '../src/lib/knowledge/templates.js';

const SEEDS = ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'];
const commandTemplates = TEMPLATES.filter((t) => t.id.startsWith('cisco.command.'));

function commandPrefix(commandTemplate) {
  return String(commandTemplate).split('<')[0].trim().toLowerCase();
}

let failures = [];
let checked = 0;

console.log('=== Cisco Question Semantic Contract Test ===\n');
console.log(`Command templates: ${commandTemplates.map((t) => t.id).join(', ')}`);

for (const item of ciscoCommandRecallKnowledgeItems) {
  for (const template of commandTemplates) {
    if (!template.matches(item)) continue;
    for (const seed of SEEDS) {
      try {
        const q = generateQuestion(item.id, template.id, { seed, contextType: 'direct_question' });
        checked += 1;
        const correctLabel = q.options[q.correct].label;
        const prompt = q.prompt;

        switch (template.id) {
          case 'cisco.command.goalToCommand':
          case 'cisco.command.contextToCommand': {
            const base = commandPrefix(item.data.command || item.data.example || '');
            if (!correctLabel.toLowerCase().startsWith(base)) {
              failures.push({ item: item.id, template: template.id, seed, message: `COMMAND_RECALL answer should start with "${base}", got: ${correctLabel}` });
            }
            if (!/Welcher Befehl|Befehl ist hier richtig/i.test(prompt)) {
              failures.push({ item: item.id, template: template.id, seed, message: `COMMAND_RECALL prompt should ask for a command, got: ${prompt}` });
            }
            break;
          }
          case 'cisco.command.commandToPurpose':
            if (!item.data.purpose || !correctLabel.toLowerCase().startsWith(item.data.purpose.toLowerCase().slice(0, 20))) {
              failures.push({ item: item.id, template: template.id, seed, message: `COMMAND_EFFECT answer should be the purpose description, got: ${correctLabel}` });
            }
            if (!/Was bewirkt|Wozu dient|Was macht/i.test(prompt)) {
              failures.push({ item: item.id, template: template.id, seed, message: `COMMAND_EFFECT prompt should ask for effect/purpose, got: ${prompt}` });
            }
            break;
          case 'cisco.command.parameterType':
          case 'cisco.command.parameterValue': {
            const expected = item.data.parameter || '';
            if (!expected || !correctLabel.toLowerCase().startsWith(expected.toLowerCase().slice(0, 20))) {
              failures.push({ item: item.id, template: template.id, seed, message: `PARAMETER answer should be the parameter description, got: ${correctLabel}` });
            }
            const expectedPrompt = template.id === 'cisco.command.parameterType'
              ? /(Parameter|Argument).*erwartet/i
              : /repräsentieren/i;
            if (!expectedPrompt.test(prompt)) {
              failures.push({ item: item.id, template: template.id, seed, message: `${template.id} prompt contract mismatch, got: ${prompt}` });
            }
            break;
          }
          default:
            break;
        }
      } catch (err) {
        failures.push({ item: item.id, template: template.id, seed, message: `generation failed: ${err.message}` });
      }
    }
  }
}

console.log(`Checked instances: ${checked}`);
console.log(`Contract failures: ${failures.length}\n`);

if (failures.length > 0) {
  for (const f of failures.slice(0, 20)) {
    console.error(`FAIL: ${f.item} / ${f.template} / ${f.seed}: ${f.message}`);
  }
  if (failures.length > 20) console.error(`... and ${failures.length - 20} more.`);
  process.exit(1);
}

console.log('=== Cisco Question Semantic Contract Test passed ===');


