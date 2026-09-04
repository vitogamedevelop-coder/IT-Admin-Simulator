import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const TARGET_ID = topicKey('active-directory-virtualbox', 'ad-group-policy-basics');
const target = LESSONS[TARGET_ID];
const targetTextBlocks = target.explanations.flatMap((e) => e.blocks.filter((b) => b.type === 'text' || b.type === 'diagram').map((b) => (b.content || '').toLowerCase()));

const comparisonTopics = [
  'ad-foundation',
  'ad-mmc-basics',
  'ad-mmc-helpdesk',
  'ad-delegation',
  'ad-replication-basics',
  'ad-ou-management',
  'ad-recycle-bin',
];

let hasError = false;
function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    hasError = true;
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('=== Active Directory Group Policy Basics Duplication Audit ===\n');

check(!!target, 'Target lesson exists');

const allIds = new Set();
for (const item of getAllKnowledgeItems()) {
  if (allIds.has(item.id)) {
    console.error(`FAIL: Duplicate knowledge item id ${item.id}`);
    hasError = true;
  }
  allIds.add(item.id);
}
check(true, 'All knowledge item ids are globally unique');

for (const cmpId of comparisonTopics) {
  const cmp = LESSONS[topicKey('active-directory-virtualbox', cmpId)];
  if (!cmp) continue;
  const cmpTextBlocks = cmp.explanations.flatMap((e) => e.blocks.filter((b) => b.type === 'text' || b.type === 'diagram').map((b) => (b.content || '').toLowerCase()));
  const dupes = targetTextBlocks.filter((b) => b.length > 20 && cmpTextBlocks.some((c) => c.includes(b) || b.includes(c)));
  check(dupes.length === 0, `No identical explanation paragraphs between ad-group-policy-basics and ${cmpId} (found ${dupes.length})`);
}

const explanationIds = target.explanations.map((e) => e.id);
check(new Set(explanationIds).size === explanationIds.length, 'All explanation ids are unique within ad-group-policy-basics');

if (hasError) {
  console.error('\nGroup Policy Basics duplication audit FAILED.');
  process.exit(1);
}
console.log('\n=== Active Directory Group Policy Basics Duplication Audit passed ===');

