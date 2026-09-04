import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

const category = 'active-directory-virtualbox';
const adTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === category);
const adKeys = new Set(adTopics.map((t) => topicKey(category, t.topicId)));
const allKnowledge = getAllKnowledgeItems();

function check(cond, msg) {
  if (!cond) {
    console.log(`[FAIL] ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`[PASS] ${msg}`);
  }
}

console.log('=== Active Directory Curriculum Consolidation Audit ===');

check(adTopics.length >= 12 && adTopics.length <= 18, `AD visible topic count in 12–18 range (found ${adTopics.length})`);
check(adTopics.length <= 20, `No excessive AD topic count (found ${adTopics.length})`);

let mini = 0;
let mega = 0;
let totalSections = 0;
const empty = [];

for (const t of adTopics) {
  const key = topicKey(category, t.topicId);
  const lesson = LESSONS[key];
  const sectionCount = lesson?.explanations?.length || 0;
  const exerciseCount = lesson?.exercises?.length || 0;
  const knowledgeCount = allKnowledge.filter((i) => i.topicKey === key).length;
  const conv = CONVERSATION_TOPICS[key];
  const hasConv = !!conv && Array.isArray(conv.questions) && conv.questions.length > 0;
  totalSections += sectionCount;

  if (sectionCount === 0 && !lesson) {
    empty.push(t.topicId);
  }

  if (sectionCount > 0 && sectionCount < 6) {
    mini += 1;
  }
  if (sectionCount >= 25 && t.topicId !== 'ntfs-permissions') {
    mega += 1;
  }

  console.log(`  ${t.topicId}: theory=${sectionCount}, exercises=${exerciseCount}, knowledge=${knowledgeCount}, conv=${hasConv}, prereq=${t.prerequisites.length}`);
}

check(empty.length === 0, `No empty visible AD topics (offending: ${empty.join(', ') || 'none'})`);
check(mini === 0, `No mini AD topics (<6 theory sections, found ${mini})`);
check(mega === 0, `No mega AD topics (>=25 theory sections, found ${mega})`);

// No orphaned prerequisites
let orphaned = 0;
for (const t of adTopics) {
  for (const pre of t.prerequisites) {
    const resolved = pre.includes('/') ? pre : topicKey(category, pre);
    if (resolved.startsWith(category + '/')) {
      if (!adKeys.has(resolved)) {
        console.log(`[WARN] Orphaned prerequisite: ${pre} on ${t.topicId}`);
        orphaned += 1;
      }
    }
  }
}
check(orphaned === 0, `No orphaned AD prerequisites`);

// No cycles in AD prerequisite graph
try {
  const graph = new Map(adKeys.values().map((k) => [k, []]));
  for (const t of adTopics) {
    const k = topicKey(category, t.topicId);
    for (const pre of t.prerequisites) {
      const resolved = pre.includes('/') ? pre : topicKey(category, pre);
      if (adKeys.has(resolved)) graph.get(k).push(resolved);
    }
  }
  const visiting = new Set();
  const visited = new Set();
  function dfs(node) {
    if (visiting.has(node)) throw new Error(`cycle at ${node}`);
    if (visited.has(node)) return;
    visiting.add(node);
    for (const next of graph.get(node) || []) dfs(next);
    visiting.delete(node);
    visited.add(node);
  }
  for (const k of adKeys) dfs(k);
  check(true, 'No prerequisite cycles in AD category');
} catch (e) {
  check(false, `Prerequisite graph: ${e.message}`);
}

if (!process.exitCode) {
  console.log('\n=== Active Directory Curriculum Consolidation Audit passed ===');
} else {
  console.log('\n=== Active Directory Curriculum Consolidation Audit FAILED ===');
  process.exit(1);
}
