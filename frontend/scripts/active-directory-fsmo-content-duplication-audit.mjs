import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const TARGET_TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-fsmo-admin-groups');
const RELATED_TOPIC_IDS = [
  topicKey('active-directory-virtualbox', 'domain-controller'),
  topicKey('active-directory-virtualbox', 'ad-tree-forest'),
  topicKey('active-directory-virtualbox', 'ad-trusts'),
];

function collectLessonText(lesson) {
  const texts = [];
  for (const ex of lesson.explanations || []) {
    const title = ex.title || '';
    const blocks = (ex.blocks || []).map((b) => {
      if (b.type === 'text') return b.content || '';
      if (b.type === 'list') return (b.items || []).join(' ');
      return '';
    }).join(' ');
    texts.push(`${title} ${blocks}`);
  }
  return texts;
}

function normalize(s) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

let hasError = false;
function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    hasError = true;
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('=== Active Directory FSMO Content Duplication Audit ===\n');

const targetLesson = LESSONS[TARGET_TOPIC_ID];
check(!!targetLesson, 'Target lesson ad-fsmo-admin-groups exists');
if (!targetLesson) process.exit(1);

const targetTexts = collectLessonText(targetLesson);

for (const relatedId of RELATED_TOPIC_IDS) {
  if (!hasLessonContent('active-directory-virtualbox', relatedId.split('/')[1])) continue;
  const relatedLesson = LESSONS[relatedId];
  if (!relatedLesson) continue;
  const relatedTexts = collectLessonText(relatedLesson);
  let duplicates = 0;
  for (const t of targetTexts) {
    for (const r of relatedTexts) {
      if (normalize(t) === normalize(r) && t.length > 40) {
        duplicates++;
      }
    }
  }
  check(duplicates === 0, `No identical explanation paragraphs between ad-fsmo-admin-groups and ${relatedId.split('/').pop()} (found ${duplicates})`);
}

const targetIds = new Set(targetLesson.exercises.map((e) => e.id));
const allExerciseIds = new Set();
for (const key of Object.keys(LESSONS)) {
  for (const ex of LESSONS[key].exercises || []) {
    if (allExerciseIds.has(ex.id) && key !== TARGET_TOPIC_ID && targetIds.has(ex.id)) {
      check(false, `Duplicate exercise id across lessons: ${ex.id}`);
    }
    allExerciseIds.add(ex.id);
  }
}

check(targetLesson.explanations.length === new Set(targetLesson.explanations.map((e) => e.id)).size, 'All explanation ids are unique within ad-fsmo-admin-groups');

const itemIds = getAllKnowledgeItems().map((i) => i.id);
const uniqueItemIds = new Set(itemIds);
check(itemIds.length === uniqueItemIds.size, 'All knowledge item ids are globally unique');

const targetItems = getAllKnowledgeItems().filter((i) => i.topicKey === TARGET_TOPIC_ID);
check(targetItems.every((i) => uniqueItemIds.has(i.id)), 'Target topic knowledge items registered');

if (hasError) {
  console.error('\nAudit FAILED.');
  process.exit(1);
}
console.log('\n=== Active Directory FSMO Content Duplication Audit passed ===');
