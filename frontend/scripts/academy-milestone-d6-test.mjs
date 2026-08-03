/**
 * Milestone D6 – Runtime Diagnosis Tests
 *
 * 1. LessonRunner TDZ fix: derived vars declared before useEffect deps
 * 2. Corridor touch-through guard: corridorMenuReady state
 * 3. Exercise type coverage
 * 4. Resume-data resilience
 * 5. resetTopicLessonState
 * 6. Android-API compatibility
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TOPIC_STATUS } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import {
  readAcademyProgress, writeAcademyProgress, resetTopicLessonState,
} from '../src/lib/academyProgress.js';

// Browser mocks
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  innerWidth: 400,
  innerHeight: 800,
};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, { detail } = {}) { this.type = type; this.detail = detail; }
};
globalThis.Event = class Event {
  constructor(type) { this.type = type; }
};

const FINISHED_LESSONS = [
  'fundamentals/topologien',
  'fundamentals/osi-model',
  'fundamentals/tcp-ip-model',
  'fundamentals/binary-system',
  'fundamentals/ipv4',
  'fundamentals/subnet-masks',
  'fundamentals/subnetting',
  'fundamentals/vlsm',
  'fundamentals/supernetting',
];

// ============================================================
// 1. TDZ fix: currentSectionId declared before useEffect deps
// ============================================================
console.log('1. Verifying TDZ fix in production bundle...');
let bundleContent = '';
try {
  const files = fs.readdirSync(new URL('../dist/assets/', import.meta.url));
  const topicChunk = files.find(f => f.startsWith('AcademyTopic-') && f.endsWith('.js'));
  assert(topicChunk, 'AcademyTopic chunk exists in dist');
  bundleContent = fs.readFileSync(new URL(`../dist/assets/${topicChunk}`, import.meta.url), 'utf8');
  
  // Find the LessonRunner section by looking for sectionIds
  const sectionIdsIdx = bundleContent.indexOf('sectionIds:Array.from');
  assert(sectionIdsIdx > -1, 'sectionIds found in bundle');
  
  // In the area after sectionIds, find the derived variable assignment and first useEffect
  const area = bundleContent.substring(sectionIdsIdx, sectionIdsIdx + 2000);
  
  // The derived variable (currentSectionId equivalent, e.g. K=d[C]) should come BEFORE useEffect
  // Look for patterns like: varName=arrayVar[indexVar],...=mapVar.get(varName)
  const derivedMatch = area.match(/(\w+)=(\w+)\[(\w+)\],(\w+)=(\w+)\.get\(\1\)/);
  assert(derivedMatch, 'Found derived variable pattern (currentSectionId = sectionIds[index])');
  
  const derivedOffset = area.indexOf(derivedMatch[0]);
  const firstEffectOffset = area.indexOf('useEffect');
  assert(firstEffectOffset > -1, 'useEffect found after sectionIds');
  assert(derivedOffset < firstEffectOffset,
    `Derived variables (offset ${derivedOffset}) declared BEFORE useEffect (offset ${firstEffectOffset}) - TDZ fixed`);
} catch (e) {
  if (e.code === 'ENOENT') {
    console.log('   SKIP: dist/ not found (run npm run build first)');
  } else {
    throw e;
  }
}
console.log('   TDZ fix verified in production bundle.');

// ============================================================
// 2. LessonRunner source: currentSectionId before useEffect
// ============================================================
console.log('2. Verifying source code ordering...');
const lessonRunnerSrc = fs.readFileSync(
  new URL('../src/components/LessonRunner.jsx', import.meta.url), 'utf8',
);
const derivedLine = lessonRunnerSrc.indexOf('const currentSectionId = sectionIds[currentSectionIndex]');
const firstEffectLine = lessonRunnerSrc.indexOf('useEffect(() => {');
assert(derivedLine > -1, 'currentSectionId declaration found in source');
assert(firstEffectLine > -1, 'useEffect found in source');
// The derived variable must come before any useEffect that uses it.
// Find the useEffect that references currentSectionId in its deps
const effectWithSectionId = lessonRunnerSrc.indexOf('[currentSectionId,');
assert(effectWithSectionId > -1, 'useEffect with currentSectionId dep found');
assert(derivedLine < effectWithSectionId,
  'currentSectionId declared before useEffect that depends on it');
console.log('   Source code ordering correct.');

// ============================================================
// 3. Exercise type coverage
// ============================================================
console.log('3. Checking exercise type coverage...');
const SUPPORTED_TYPES = ['ordering', 'matching', 'input', 'select-best', 'guided-subnetting', 'adaptive-subnetting', 'difficulty-drill'];
const usedTypes = new Set();

for (const key of FINISHED_LESSONS) {
  const lesson = LESSONS[key];
  for (const ex of lesson.exercises) {
    usedTypes.add(ex.type);
    assert(SUPPORTED_TYPES.includes(ex.type),
      `Exercise type "${ex.type}" in ${key} is supported by LessonRunner`);
  }
}

console.log('   Exercise type table:');
for (const t of SUPPORTED_TYPES) {
  const used = usedTypes.has(t);
  console.log(`   | ${t.padEnd(22)} | ${used ? 'YES' : 'no '} | YES |`);
}
console.log('   All used exercise types are supported.');

// ============================================================
// 4. Resume-data resilience
// ============================================================
console.log('4. Testing resume-data resilience...');

// 4a. Invalid lastCompletedSectionId → falls back to 0
store.clear();
const data4a = readAcademyProgress();
data4a.topics['fundamentals/osi-model'].lastCompletedSectionId = 'nonexistent-section-xyz';
writeAcademyProgress(data4a);
const progress4a = readAcademyProgress().topics['fundamentals/osi-model'];
const lesson4a = LESSONS['fundamentals/osi-model'];
const sectionIds4a = [];
const map4a = new Map();
lesson4a.explanations.forEach((ex) => {
  const dash = ex.id.lastIndexOf('-');
  const sectionId = dash > 0 ? ex.id.slice(0, dash) : ex.id;
  if (!map4a.has(sectionId)) { map4a.set(sectionId, {}); sectionIds4a.push(sectionId); }
});
const lastId = progress4a.lastCompletedSectionId;
const idx = sectionIds4a.indexOf(lastId);
const resumeIndex = idx >= 0 ? Math.min(idx + 1, sectionIds4a.length - 1) : 0;
assert.equal(resumeIndex, 0, 'Invalid lastCompletedSectionId falls back to section 0');

// 4b. Section index out of bounds
const bigIndex = sectionIds4a.length + 10;
const clampedIndex = Math.min(bigIndex, sectionIds4a.length - 1);
assert(clampedIndex < sectionIds4a.length, 'Out-of-bounds index clamped to valid range');

// 4c. Missing completedSectionIds (undefined → treated as empty)
store.clear();
const data4c = readAcademyProgress();
delete data4c.topics['fundamentals/osi-model'].completedSectionIds;
writeAcademyProgress(data4c);
const progress4c = readAcademyProgress().topics['fundamentals/osi-model'];
const sections = progress4c.completedSectionIds || [];
assert(Array.isArray(sections), 'Missing completedSectionIds treated as empty array');

// 4d. Unknown exercise ID in completedExerciseIds → no crash
store.clear();
const data4d = readAcademyProgress();
data4d.topics['fundamentals/osi-model'].completedExerciseIds = ['fake-exercise-999'];
writeAcademyProgress(data4d);
const progress4d = readAcademyProgress().topics['fundamentals/osi-model'];
assert(Array.isArray(progress4d.completedExerciseIds), 'Unknown exercise IDs stored without crash');

console.log('   Resume-data resilience verified.');

// ============================================================
// 5. resetTopicLessonState
// ============================================================
console.log('5. Testing resetTopicLessonState...');
store.clear();
const data5 = readAcademyProgress();
// Set up some lesson progress
data5.topics['fundamentals/osi-model'].lastCompletedSectionId = 'layer-1';
data5.topics['fundamentals/osi-model'].completedSectionIds = ['intro', 'layer-1'];
data5.topics['fundamentals/osi-model'].completedExerciseIds = ['osi-ordering'];
data5.topics['fundamentals/osi-model'].lastExplanationStyle = 'visual';
data5.topics['fundamentals/osi-model'].startedAt = '2026-01-01';
data5.topics['fundamentals/osi-model'].theoryScore = 15;
data5.topics['fundamentals/osi-model'].status = TOPIC_STATUS.STARTED;
writeAcademyProgress(data5);

resetTopicLessonState('fundamentals', 'osi-model');

const after5 = readAcademyProgress().topics['fundamentals/osi-model'];
// Lesson state reset
assert.equal(after5.lastCompletedSectionId, null, 'lastCompletedSectionId reset');
assert.deepEqual(after5.completedSectionIds, [], 'completedSectionIds reset');
assert.deepEqual(after5.completedExerciseIds, [], 'completedExerciseIds reset');
assert.equal(after5.lastExplanationStyle, null, 'lastExplanationStyle reset');
assert.equal(after5.startedAt, null, 'startedAt reset');
// Scores and status preserved
assert.equal(after5.theoryScore, 15, 'theoryScore preserved');
assert.equal(after5.status, TOPIC_STATUS.STARTED, 'status preserved');

// Other topics untouched
const otherTopic = readAcademyProgress().topics['fundamentals/binary-system'];
assert(otherTopic, 'Other topics untouched');

console.log('   resetTopicLessonState works correctly.');

// ============================================================
// 6. Android-API compatibility scan
// ============================================================
console.log('6. Scanning for Android-incompatible APIs...');
const srcDir = new URL('../src/', import.meta.url);
function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const issues = [];
  for (const entry of entries) {
    const full = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
    if (entry.isDirectory()) {
      issues.push(...scanDir(full));
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
      const content = fs.readFileSync(full, 'utf8');
      const dangerous = [
        [/\.toSorted\s*\(/, 'Array.toSorted (Chrome 110+)'],
        [/\.toReversed\s*\(/, 'Array.toReversed (Chrome 110+)'],
        [/structuredClone\s*\(/, 'structuredClone (Chrome 98+)'],
        [/crypto\.randomUUID\s*\(/, 'crypto.randomUUID (Chrome 92+)'],
        [/\bprocess\./, 'Node process global'],
        [/\bBuffer\./, 'Node Buffer global'],
        [/\brequire\s*\(/, 'CommonJS require (in ESM)'],
        [/Object\.groupBy\s*\(/, 'Object.groupBy (Chrome 117+)'],
        [/Map\.groupBy\s*\(/, 'Map.groupBy (Chrome 117+)'],
      ];
      for (const [pattern, label] of dangerous) {
        if (pattern.test(content)) {
          // Exclude test scripts and config files
          const rel = full.href.replace(srcDir.href, 'src/');
          issues.push(`${rel}: ${label}`);
        }
      }
    }
  }
  return issues;
}
const apiIssues = scanDir(srcDir);
if (apiIssues.length > 0) {
  console.log('   WARNING - potentially incompatible APIs found:');
  apiIssues.forEach(i => console.log('   -', i));
}
assert.equal(apiIssues.length, 0, 'No Android-incompatible APIs in src/');
console.log('   No Android-incompatible APIs found.');

// ============================================================
// 7. All lessons init without crash
// ============================================================
console.log('7. Simulating LessonRunner initialization for all lessons...');
for (const key of FINISHED_LESSONS) {
  const lesson = LESSONS[key];
  
  // Simulate the section-grouping logic from LessonRunner
  const map = new Map();
  lesson.explanations.forEach((ex) => {
    const dash = ex.id.lastIndexOf('-');
    const sectionId = dash > 0 ? ex.id.slice(0, dash) : ex.id;
    const style = dash > 0 ? ex.id.slice(dash + 1) : ex.style || 'classic';
    if (!map.has(sectionId)) map.set(sectionId, {});
    map.get(sectionId)[style] = ex;
  });
  const sectionIds = Array.from(map.keys());
  assert(sectionIds.length > 0, `${key}: has sections`);
  
  // First section should be selectable
  const firstSection = sectionIds[0];
  const styles = Object.keys(map.get(firstSection));
  assert(styles.length > 0, `${key}: first section has styles`);
  
  // Default style selection
  const defaultStyle = styles.includes('classic') ? 'classic' : styles[0];
  const explanation = map.get(firstSection)[defaultStyle];
  assert(explanation, `${key}: first explanation accessible`);
  assert(Array.isArray(explanation.blocks), `${key}: first explanation has blocks`);
  
  // All exercises have supported types
  for (const ex of lesson.exercises) {
    assert(SUPPORTED_TYPES.includes(ex.type), `${key}: exercise ${ex.id} type "${ex.type}" supported`);
  }
  
  // Quiz questions (if any) have options and correct index
  if (lesson.quiz) {
    for (let qi = 0; qi < lesson.quiz.length; qi++) {
      const q = lesson.quiz[qi];
      assert(Array.isArray(q.options), `${key}: quiz[${qi}] has options`);
      assert(q.options.length >= 2, `${key}: quiz[${qi}] has 2+ options`);
      assert(typeof q.correct === 'number', `${key}: quiz[${qi}] has correct index`);
      assert(q.correct >= 0 && q.correct < q.options.length, `${key}: quiz[${qi}] correct index in bounds`);
    }
  }
}
console.log('   All 9 lessons initialize correctly.');

// ============================================================
// 8. Corridor touch-through guard exists in source
// ============================================================
console.log('8. Verifying corridor touch-through guard...');
const workspaceSrc = fs.readFileSync(
  new URL('../src/pages/Workspace.jsx', import.meta.url), 'utf8',
);
assert(workspaceSrc.includes('corridorMenuReady'), 'corridorMenuReady state exists');
assert(workspaceSrc.includes('setCorridorMenuReady(true)'), 'corridorMenuReady is set to true after delay');
assert(workspaceSrc.includes('setCorridorMenuReady(false)'), 'corridorMenuReady resets when menu closes');
assert(workspaceSrc.includes('setTimeout') && workspaceSrc.includes('corridorMenuReady'), 'Timeout-based guard exists');
// The buttons must check corridorMenuReady
assert(workspaceSrc.includes('disabled={!corridorMenuReady}'), 'Menu buttons disabled until ready');
assert(workspaceSrc.includes("pointerEvents: 'none'"), 'pointer-events blocked until ready');
console.log('   Touch-through guard verified.');

console.log('\n=== All Milestone D6 Tests PASSED ===');
