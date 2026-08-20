import {
  generateQuestion,
  getAllKnowledgeItems,
  listApplicableTemplates,
} from '../src/lib/knowledge/index.js';
import { validateSolvability } from '../src/lib/knowledge/validators.js';

const TARGET_QUESTIONS = 3000;

const securityItems = getAllKnowledgeItems().filter((item) =>
  item.conceptCluster && item.conceptCluster.startsWith('security.'),
);

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
const conceptClusters = new Set();
const errors = [];

let pass = 0;
while (generated < TARGET_QUESTIONS && pass < 200) {
  for (const item of securityItems) {
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
          conceptClusters.add(item.conceptCluster);
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

console.log('=== Phase 8 Informationssicherheit Knowledge Audit ===');
console.log(`Generated questions: ${generated} (target ${TARGET_QUESTIONS})`);
console.log(`Distinct security items covered: ${itemIds.size} / ${securityItems.length}`);
console.log(`Distinct concept clusters covered: ${conceptClusters.size}`);
console.log('Archetype distribution:', archetypeCounts);
console.log('Issue types:', issuesByType);
console.log('Non-allowed errors:', errors.length);

if (errors.length > 0) {
  for (const err of errors.slice(0, 30)) {
    console.log(JSON.stringify(err));
  }
}

assertTrue(generated >= TARGET_QUESTIONS, `Only generated ${generated}/${TARGET_QUESTIONS} questions`);
assertTrue(issueCount === 0, `Found ${issueCount} solvability issues`);
console.log('\n✅ Phase 8 Informationssicherheit knowledge audit passed');
