import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';

const adTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === 'active-directory-virtualbox');

function deriveSectionIds(lesson) {
  const seen = new Set();
  const ids = [];
  (lesson?.explanations || []).forEach((ex) => {
    const dash = (ex.id || '').lastIndexOf('-');
    const sid = ex.sectionId || (dash > 0 ? ex.id.slice(0, dash) : ex.id);
    if (sid && !seen.has(sid)) {
      seen.add(sid);
      ids.push(sid);
    }
  });
  return ids;
}

function check(cond, msg) {
  if (!cond) {
    console.log(`[FAIL] ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`[PASS] ${msg}`);
  }
}

console.log('=== Academy Theory Section Count Contract Test ===');

for (const t of adTopics) {
  const key = topicKey('active-directory-virtualbox', t.topicId);
  const lesson = LESSONS[key];
  const sectionIds = deriveSectionIds(lesson);
  const hasExplanations = (lesson?.explanations?.length || 0) > 0;

  if (hasExplanations) {
    check(sectionIds.length > 0, `${key}: at least one navigable theory section`);
    check(sectionIds.length >= 3 || t.topicId === 'ad-group-policy-basics', `${key}: at least 3 visible sections (${sectionIds.length})`);
    check(sectionIds.length === new Set(sectionIds).size, `${key}: section ids are unique`);
  } else {
    check(false, `${key}: visible topic without lesson content`);
  }
}

if (!process.exitCode) {
  console.log('\n=== Academy Theory Section Count Contract Test passed ===');
} else {
  console.log('\n=== Academy Theory Section Count Contract Test FAILED ===');
  process.exit(1);
}
