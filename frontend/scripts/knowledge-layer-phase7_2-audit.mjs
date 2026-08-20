import {
  generateQuestion,
  getAllKnowledgeItems,
  listApplicableTemplates,
} from '../src/lib/knowledge/index.js';
import { validateSolvability } from '../src/lib/knowledge/validators.js';

const TARGET_QUESTIONS = 1000;

const allItems = getAllKnowledgeItems();

function assertTrue(value, message) {
  if (!value) throw new Error(message);
}

function isStructuredQuestion(q) {
  return ['matching', 'ordering', 'mc', 'input'].includes(q.type);
}

let generated = 0;
let issueCount = 0;
const issuesByType = {};
const archetypeCounts = {};
const itemIds = new Set();
const errors = [];

let pass = 0;
while (generated < TARGET_QUESTIONS && pass < 100) {
  for (const item of allItems) {
    const templates = listApplicableTemplates(item.id);
    if (!templates.length) continue;
    for (const template of templates) {
      const startSeed = pass * 5;
      const endSeed = startSeed + 5;
      for (let seed = startSeed; seed < endSeed && generated < TARGET_QUESTIONS; seed += 1) {
        try {
          const q = generateQuestion(item.id, template.id, { contextType: 'coworker_question', seed: String(seed) });
          if (!isStructuredQuestion(q)) continue;
          generated += 1;
          itemIds.add(item.id);
          archetypeCounts[q.type] = (archetypeCounts[q.type] || 0) + 1;
          const issues = validateSolvability(q);
          const nonAllowed = issues.filter((i) => i.type !== 'object-object-leak');
          if (nonAllowed.length > 0) {
            issueCount += nonAllowed.length;
            errors.push({ item: item.id, template: template.id, seed, questionType: q.type, issues: nonAllowed });
            for (const issue of nonAllowed) {
              issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
            }
          }
        } catch (e) {
          errors.push({ item: item.id, template: template.id, seed, error: e.message });
          issueCount += 1;
        }
      }
    }
  }
  pass += 1;
}

console.log('=== Phase 7.2 Structured-Question Solvability Audit ===');
console.log(`Generated questions: ${generated} (target ${TARGET_QUESTIONS})`);
console.log(`Distinct items covered: ${itemIds.size}`);
console.log('Archetype distribution:', archetypeCounts);
console.log('Issue types:', issuesByType);
console.log('Non-allowed errors:', errors.length);

if (errors.length > 0) {
  for (const err of errors.slice(0, 20)) {
    console.log(JSON.stringify(err));
  }
}

assertTrue(generated >= TARGET_QUESTIONS, `Only generated ${generated}/${TARGET_QUESTIONS} questions`);
assertTrue(issueCount === 0, `Found ${issueCount} solvability issues`);
console.log('\n✅ Phase 7.2 structured-question solvability audit passed');
