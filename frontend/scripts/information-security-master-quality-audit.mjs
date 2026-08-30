import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { selectDirectTheoryExercises } from '../src/lib/lessonExerciseSelector.js';

const CATEGORY = 'information-security';
const PRIMARY_BLOCKS = [
  'security-fundamentals',
  'security-legal-data',
  'security-incidents',
  'security-threats-malware',
  'security-technical-measures',
];

let failures = 0;
function assert(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${label}${detail ? ` (${detail})` : ''}`);
  if (!condition) failures += 1;
}

console.log('=== Information Security Master Quality Audit ===');

// 1. Exactly five primary block lessons exist in this category.
const infoSecLessons = Object.entries(LESSONS).filter(([key]) => key.startsWith(`${CATEGORY}/`));
const infoSecLessonIds = infoSecLessons.map(([key]) => key);
assert('Nur 5 InfoSec-Hauptlessons existieren', infoSecLessons.length === PRIMARY_BLOCKS.length, `found=${infoSecLessons.length} keys=${infoSecLessonIds.join(', ')}`);
assert('Hauptlessons sind exakt die 5 Blocks', PRIMARY_BLOCKS.every((id) => infoSecLessonIds.includes(`${CATEGORY}/${id}`)));

// 2. No detail topic has its own Lesson.
const infoSecTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === CATEGORY);
const detailTopics = infoSecTopics.filter((t) => !PRIMARY_BLOCKS.includes(t.topicId));
const unwantedLessons = detailTopics.filter((t) => LESSONS[topicKey(CATEGORY, t.topicId)]);
assert('Detailtopics haben keine eigenen Lessons', unwantedLessons.length === 0, `offending=${unwantedLessons.map((t) => t.topicId).join(', ')}`);

// 3. Block order matches the intended curriculum flow.
const orderInData = infoSecTopics
  .filter((t) => PRIMARY_BLOCKS.includes(t.topicId))
  .sort((a, b) => a.order - b.order)
  .map((t) => t.topicId);
assert('Blocks sind in korrekter Reihenfolge', JSON.stringify(orderInData) === JSON.stringify(PRIMARY_BLOCKS));

// 4. Each block has reasonable direct exercise load.
for (const topicId of PRIMARY_BLOCKS) {
  const key = `${CATEGORY}/${topicId}`;
  const lesson = LESSONS[key];
  if (!lesson) continue;
  const direct = selectDirectTheoryExercises(lesson.exercises || [], key);
  assert(`${topicId}: Direct Exercises zwischen 2 und 8`, direct.length >= 2 && direct.length <= 8, `direct=${direct.length}`);
  assert(`${topicId}: Final Quiz 6-8 Fragen`, (lesson.quiz?.length || 0) >= 6 && (lesson.quiz?.length || 0) <= 8, `quiz=${lesson.quiz?.length || 0}`);
}

// 5. Cross-block transfer references.
const blockTexts = {};
for (const topicId of PRIMARY_BLOCKS) {
  const key = `${CATEGORY}/${topicId}`;
  const lesson = LESSONS[key];
  const text = [
    ...(lesson.explanations || []).flatMap((e) => e.blocks.map((b) => [b.content, b.title, b.question, ...(b.items || [])].filter(Boolean).join(' '))),
    ...(lesson.exercises || []).map((ex) => `${ex.question || ''} ${ex.explanation || ''}`),
    ...(lesson.quiz || []).map((q) => `${q.question || ''} ${q.explanation || ''}`),
  ].join(' ');
  blockTexts[topicId] = text;
}

const transferPhrases = ['aus Block 1', 'aus Block 2', 'aus Block 3', 'aus Block 4', 'du kennst bereits', 'wie in Block', 'wie du bereits', 'wie du in Block', 'gelernt hast'];
let transferCount = 0;
for (const text of Object.values(blockTexts)) {
  if (transferPhrases.some((p) => text.toLowerCase().includes(p.toLowerCase()))) transferCount += 1;
}
assert('Mindestens 2 Blocks verweisen explizit auf vorherige Blocks', transferCount >= 2, `transferCount=${transferCount}`);

// 6. Theory load (sections) should not be wildly imbalanced.
const sectionCounts = PRIMARY_BLOCKS.map((id) => ({ id, count: LESSONS[`${CATEGORY}/${id}`]?.explanations?.length || 0 }));
const maxSections = Math.max(...sectionCounts.map((s) => s.count));
const minSections = Math.min(...sectionCounts.map((s) => s.count));
assert('Section-Anzahl ausgewogen (max <= 2.5*min)', maxSections <= minSections * 2.5, `min=${minSections} max=${maxSections}`);

// 7. Knowledge source links: every InfoSec knowledge item points to a valid block section.
const allItems = getAllKnowledgeItems();
const sourceIds = new Set();
for (const topicId of PRIMARY_BLOCKS) {
  const lesson = LESSONS[`${CATEGORY}/${topicId}`];
  if (lesson) {
    (lesson.explanations || []).forEach((e) => sourceIds.add(e.id));
  }
}
const primaryBlockKeys = new Set(PRIMARY_BLOCKS.map((id) => `${CATEGORY}/${id}`));
const infoSecItems = allItems.filter((item) => item.topicKey.startsWith(`${CATEGORY}/`));
const orphanedSources = infoSecItems.filter((item) => primaryBlockKeys.has(item.sourceTopicKey) && !sourceIds.has(item.sourceSection));
assert('InfoSec Knowledge Items aus Hauptblocks verweisen auf gültige Sections', orphanedSources.length === 0, `orphaned=${orphanedSources.map((i) => i.id).join(', ')}`);

// 8. No duplicate knowledge IDs.
const ids = allItems.map((i) => i.id);
assert('Keine doppelten Knowledge IDs', new Set(ids).size === ids.length);

// 9. Conversation coverage for primary blocks and detail topics.
const requiredConversationTopics = PRIMARY_BLOCKS.concat(
  'security-objectives', 'confidentiality', 'integrity', 'availability', 'authenticity',
  'malware', 'phishing', 'backup', 'logging', 'firewall-basics', 'hardening',
  'pimo', 'opti', 'isms', 'pdca', 'data-protection', 'art9-dsgvo', 'information-categories',
  'security-breach', 'security-incident', 'firewall-types', 'ids-ips', 'dmz', 'allowlist-denylist',
  'malware-types', 'attacks', 'malware-prevention', 'required-level'
);
const missingConversations = requiredConversationTopics.filter((id) => !CONVERSATION_TOPICS[topicKey(CATEGORY, id)]);
assert('Wichtige InfoSec Conversation Topics vorhanden', missingConversations.length === 0, `missing=${missingConversations.join(', ')}`);

// 10. Mobile visual sanity.
for (const topicId of PRIMARY_BLOCKS) {
  const lesson = LESSONS[`${CATEGORY}/${topicId}`];
  const visuals = (lesson.explanations || []).flatMap((e) => e.blocks).filter((b) => b.type === 'diagram');
  assert(`${topicId}: mindestens ein SVG`, visuals.length >= 1, `visuals=${visuals.length}`);
  assert(`${topicId}: alle Visuals sind SVGs`, visuals.every((b) => typeof b.content === 'string' && b.content.includes('<svg') && b.content.includes('viewBox')));
  assert(`${topicId}: SVGs haben keine zu kleine Schrift`, visuals.every((b) => !b.content.includes('font-size="6"') && !b.content.includes("font-size='6'")), 'font-size 6 found');
}

// 11. No large simulation engines in InfoSec lessons.
const allText = Object.values(blockTexts).join(' ').toLowerCase();
assert('Keine großen Simulations-Engines in InfoSec', !/firewall-gui|vpn-client|ids-sensor|packet capture|traffic generator|ipsec configuration/i.test(allText));

console.log('');
if (failures === 0) {
  console.log('Information Security Master Quality Audit passed.');
  process.exit(0);
}
console.log(`${failures} failures.`);
process.exit(1);
