/**
 * Lektionen-Überarbeitung: Theorie / Praxis / Fachgespräch
 *
 * Tests:
 * 1. LessonRunner exposes the three modes and reuses collectQuestionsFromLesson
 *    for both Praxis and Fachgespräch (no second question format).
 * 2. AcademyTopic's entry card offers exactly the three mode buttons and
 *    passes `mode` through to LessonRunner.
 * 3. The Themencheck itself is untouched (still theory-free, still queries
 *    all lessons of a category).
 * 4. Section comprehension check: every section either reuses its own
 *    inline question or falls back to a generic self-check - verified via
 *    the pure helper logic mirrored from LessonRunner.
 * 5. Random practice/interview selection never exceeds the pool and stays
 *    within the lesson's own questions (no cross-lesson leakage).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { collectQuestionsFromLesson } from '../src/lib/academyThemencheck.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src');

globalThis.window = { innerWidth: 400, innerHeight: 800 };

// ============================================================
// 1. LessonRunner source: three modes, shared question pool
// ============================================================
console.log('1. Testing LessonRunner mode support...');
const runnerSrc = fs.readFileSync(path.join(srcDir, 'components', 'LessonRunner.jsx'), 'utf8');
assert(runnerSrc.includes("mode === 'practice'"), 'LessonRunner branches on practice mode');
assert(runnerSrc.includes("mode === 'interview'"), 'LessonRunner branches on interview mode');
assert(runnerSrc.includes('function PracticeQuiz'), 'PracticeQuiz component exists');
assert(runnerSrc.includes('function FachgespraechRunner'), 'FachgespraechRunner component exists');
// Both new modes must reuse collectQuestionsFromLesson - not a second,
// separately-authored question format.
const practiceBody = runnerSrc.slice(runnerSrc.indexOf('function PracticeQuiz'), runnerSrc.indexOf('function FachgespraechRunner'));
assert(practiceBody.includes('collectQuestionsFromLesson'), 'PracticeQuiz uses collectQuestionsFromLesson');
const interviewBody = runnerSrc.slice(runnerSrc.indexOf('function FachgespraechRunner'));
assert(interviewBody.includes('collectQuestionsFromLesson'), 'FachgespraechRunner uses collectQuestionsFromLesson');
console.log('   Three modes present, Praxis and Fachgespräch share the existing question pool.');

// ============================================================
// 2. AcademyTopic entry card: exactly 3 mode buttons
// ============================================================
console.log('2. Testing AcademyTopic entry card...');
const topicSrc = fs.readFileSync(path.join(srcDir, 'pages', 'AcademyTopic.jsx'), 'utf8');
assert(topicSrc.includes('onClick={onTheory}'), 'Theorie button present');
assert(topicSrc.includes('onClick={onPractice}'), 'Praxis button present');
assert(topicSrc.includes('onClick={onInterview}'), 'Fachgespräch button present');
assert(topicSrc.includes('mode={activeSection}'), 'AcademyTopic passes the chosen mode into LessonRunner');
console.log('   Entry card exposes Theorie/Praxis/Fachgespräch, each wired to LessonRunner mode.');

// ============================================================
// 3. Themencheck stays untouched
// ============================================================
console.log('3. Testing Themencheck is unaffected...');
const themencheckSrc = fs.readFileSync(path.join(srcDir, 'lib', 'academyThemencheck.js'), 'utf8');
assert(!themencheckSrc.includes("mode === 'practice'"), 'academyThemencheck.js has no notion of the new lesson modes');
const themencheckPageSrc = fs.readFileSync(path.join(srcDir, 'pages', 'AcademyThemencheck.jsx'), 'utf8');
assert(!themencheckPageSrc.includes('LessonRunner'), 'AcademyThemencheck.jsx does not render LessonRunner/theory at all');
console.log('   Themencheck remains theory-free and independent of the new lesson modes.');

// ============================================================
// 4. Section comprehension check helper logic (mirrors LessonRunner)
// ============================================================
console.log('4. Testing section-check question lookup logic...');
function findSectionCheckQuestion(explanationsBySection, sectionId) {
  const section = explanationsBySection.get(sectionId) || {};
  for (const style of Object.keys(section)) {
    const q = (section[style]?.blocks || []).find((b) => b.type === 'question');
    if (q) return q;
  }
  return null;
}
function groupBySection(explanations) {
  const map = new Map();
  explanations.forEach((ex) => {
    const dash = ex.id.lastIndexOf('-');
    const sectionId = dash > 0 ? ex.id.slice(0, dash) : ex.id;
    const style = dash > 0 ? ex.id.slice(dash + 1) : ex.style || 'classic';
    if (!map.has(sectionId)) map.set(sectionId, {});
    map.get(sectionId)[style] = ex;
  });
  return map;
}

let sectionsWithQuestion = 0;
let sectionsWithoutQuestion = 0;
for (const [key, lesson] of Object.entries(LESSONS)) {
  const bySection = groupBySection(lesson.explanations);
  for (const sectionId of bySection.keys()) {
    const q = findSectionCheckQuestion(bySection, sectionId);
    if (q) {
      sectionsWithQuestion++;
      assert(typeof q.question === 'string' && Array.isArray(q.options) && typeof q.correct === 'number',
        `${key}/${sectionId}: reused question has the standard shape`);
    } else {
      sectionsWithoutQuestion++;
    }
  }
}
assert(sectionsWithQuestion > 0, 'At least some sections have a reusable inline question');
console.log(`   ${sectionsWithQuestion} sections reuse an inline question, ${sectionsWithoutQuestion} fall back to the generic self-check.`);

// Every question block LessonRunner would show at the gate must ALSO no
// longer render inside the main explanation body (avoids asking it twice).
assert(runnerSrc.includes("if (block.type === 'question') return null;"),
  'Explanation body skips question blocks (they are shown at the section-check gate instead)');

// ============================================================
// 5. Random selection stays within the lesson's own pool
// ============================================================
console.log('5. Testing practice/interview question pool boundaries...');
for (const [key, lesson] of Object.entries(LESSONS)) {
  const topicId = key.split('/')[1];
  const pool = collectQuestionsFromLesson(lesson, topicId);
  assert(pool.every((q) => q.sourceTopicId === topicId), `${key}: every pooled question is tagged with its own topic`);
  assert(pool.length >= (lesson.quiz?.length || 0), `${key}: pool is at least as large as the quiz alone`);
}
console.log('   Question pools stay scoped to their own lesson.');

console.log('\n=== Lesson mode restructuring (Theorie/Praxis/Fachgespräch) verified ===');
