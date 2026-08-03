/**
 * Milestone C5.2 – Academy Professionalization
 *
 * Tests:
 * 1. OSI: Three-Way Handshake + TCP vs UDP + Ports
 * 2. Themencheck: 15-30 questions, even distribution
 * 3. Category Summary: auto-generated stats
 * 4. Result persistence: save/load
 * 5. Adaptive retry: error-based question regeneration
 * 6. Progress tracking: category progress percent
 * 7. Scoring grades + Sam recommendations
 * 8. Availability logic
 * 9. Route + UI integration
 * 10. Abschlusscheck global
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LESSONS } from '../src/lib/academyLessonData.js';
import {
  generateThemencheck, generateAbschlusscheck,
  isThemencheckAvailable, isAbschlusscheckAvailable,
  getGrade, getSamComment, getSamRecommendation, SCORE_GRADES,
  getCategorySummary, saveThemencheckResult, getThemencheckResults,
  getLastErrors, isThemencheckPassed, getBestScore,
  collectQuestionsFromLesson,
} from '../src/lib/academyThemencheck.js';

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
globalThis.CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o?.detail; } };
globalThis.Event = class { constructor(t) { this.type = t; } };

// ============================================================
// 1. OSI: Three-Way Handshake + TCP vs UDP + Ports
// ============================================================
console.log('1. Testing OSI Layer 4 Deep-Dive...');
const osiLesson = LESSONS['fundamentals/osi-model'];
assert(osiLesson, 'OSI lesson exists');

const handshakeClassic = osiLesson.explanations.find(e => e.id === 'handshake-classic');
assert(handshakeClassic, 'Handshake classic section exists');
const handshakeTable = handshakeClassic.blocks.find(b => b.type === 'table');
assert(handshakeTable, 'Handshake has table');
assert.equal(handshakeTable.rows.length, 3, 'Table has 3 steps');
assert.equal(handshakeTable.rows[0][2], 'SYN');
assert.equal(handshakeTable.rows[1][2], 'SYN + ACK');
assert.equal(handshakeTable.rows[2][2], 'ACK');

const tcpVsUdp = osiLesson.explanations.find(e => e.id === 'tcp-vs-udp-classic');
assert(tcpVsUdp, 'TCP vs UDP section exists');
const compTable = tcpVsUdp.blocks.find(b => b.type === 'table');
assert(compTable && compTable.rows.length >= 4, 'Has comparison table with >= 4 rows');

const portsClassic = osiLesson.explanations.find(e => e.id === 'ports-classic');
assert(portsClassic, 'Ports section exists');
const portsTable = portsClassic.blocks.find(b => b.type === 'table');
assert(portsTable, 'Has ports table');
const portServices = portsTable.rows.map(r => r[0]);
assert(portServices.includes('DNS') && portServices.includes('HTTPS') && portServices.includes('SSH'));

assert(osiLesson.quiz.length >= 13, `Quiz has ${osiLesson.quiz.length} questions`);
console.log('   OSI Layer 4 Deep-Dive verified (Handshake + TCP/UDP + Ports + Quiz).');

// ============================================================
// 2. Themencheck: 15-30 questions, even distribution
// ============================================================
console.log('2. Testing Themencheck generation (15-30 questions)...');
const questions = generateThemencheck('fundamentals');
assert(questions.length >= 15, `Generated ${questions.length} questions (need >= 15)`);
assert(questions.length <= 30, `Generated ${questions.length} questions (need <= 30)`);

// Check even distribution: no single topic should dominate (>40% of questions)
const topicCounts = {};
for (const q of questions) {
  topicCounts[q.sourceTopicId] = (topicCounts[q.sourceTopicId] || 0) + 1;
}
const maxPerTopic = Math.max(...Object.values(topicCounts));
assert(maxPerTopic <= Math.ceil(questions.length * 0.4), `No topic dominates: max ${maxPerTopic}/${questions.length}`);

// Every question has required shape
for (const q of questions) {
  assert(q.question, 'question text');
  assert(Array.isArray(q.options), 'options array');
  assert(typeof q.correct === 'number', 'correct index');
  assert(q.sourceTopicId, 'sourceTopicId');
}
console.log(`   Generated ${questions.length} questions from ${Object.keys(topicCounts).length} topics.`);

// ============================================================
// 3. Category Summary
// ============================================================
console.log('3. Testing Category Summary...');
store.clear();
const summary = getCategorySummary('fundamentals');
assert(summary.categoryId === 'fundamentals');
assert(summary.title === 'Grundlagen');
assert(summary.lessonCount > 0, `Has ${summary.lessonCount} lessons`);
assert(summary.totalQuestions > 0, `Has ${summary.totalQuestions} questions`);
assert(summary.exerciseCount > 0, `Has ${summary.exerciseCount} exercises`);
assert(summary.estimatedMinutes > 0, `Estimated ${summary.estimatedMinutes} min`);
assert(Array.isArray(summary.topicNames) && summary.topicNames.length > 0, 'Has topic names');
assert(typeof summary.progressPercent === 'number');
assert(summary.completedLessons === 0, 'No completed lessons initially');
// Verify it auto-updates (check non-existent category)
const emptySummary = getCategorySummary('cisco-packet-tracer');
assert(emptySummary.lessonCount === 0, 'Cisco has 0 lessons');
assert(emptySummary.totalQuestions === 0, 'Cisco has 0 questions');
console.log(`   Summary: ${summary.lessonCount} lessons, ${summary.totalQuestions} questions, ${summary.exerciseCount} exercises, ~${summary.estimatedMinutes} min.`);

// ============================================================
// 4. Result persistence
// ============================================================
console.log('4. Testing result persistence...');
store.clear();

const mockResult = {
  questions: [{ question: 'Q1', sourceTopicId: 'osi-model', correct: 0 }],
  answers: [
    { correct: true, sourceTopicId: 'osi-model', questionText: 'Q1', selectedIndex: 0 },
    { correct: false, sourceTopicId: 'subnetting', questionText: 'Q2', selectedIndex: 1 },
    { correct: false, sourceTopicId: 'subnetting', questionText: 'Q3', selectedIndex: 2 },
  ],
  startedAt: 1000,
  finishedAt: 61000,
};
const saved = saveThemencheckResult('fundamentals', mockResult);
assert.equal(saved.totalQuestions, 3);
assert.equal(saved.correctCount, 1);
assert.equal(saved.percent, 33);
assert.equal(saved.durationMs, 60000);
assert.equal(saved.attempt, 1);
assert.deepEqual(saved.errorsPerTopic, { subnetting: 2 });
assert.equal(saved.wrongQuestions.length, 2);

const loaded = getThemencheckResults('fundamentals');
assert.equal(loaded.length, 1);
assert.equal(loaded[0].percent, 33);

// Save a second result
saveThemencheckResult('fundamentals', {
  ...mockResult,
  answers: [{ correct: true, sourceTopicId: 'osi-model', questionText: 'Q1', selectedIndex: 0 }],
  startedAt: 2000,
  finishedAt: 32000,
});
assert.equal(getThemencheckResults('fundamentals').length, 2);
assert.equal(getThemencheckResults('fundamentals')[1].attempt, 2);
console.log('   Result persistence verified (save, load, multiple attempts).');

// ============================================================
// 5. Adaptive retry
// ============================================================
console.log('5. Testing adaptive retry (getLastErrors)...');
// Reset to single result
store.clear();
saveThemencheckResult('fundamentals', mockResult);
const errors = getLastErrors('fundamentals');
assert.equal(errors.length, 2, 'Has 2 error entries');
assert.equal(errors[0].question, 'Q2');
assert.equal(errors[1].question, 'Q3');
assert.equal(errors[0].sourceTopicId, 'subnetting');

// No errors for unknown category
assert.equal(getLastErrors('linux-virtualbox').length, 0);
console.log('   Adaptive retry verified.');

// ============================================================
// 6. Progress tracking
// ============================================================
console.log('6. Testing progress tracking...');
store.clear();
assert(!isThemencheckPassed('fundamentals'), 'Not passed without results');
assert(getBestScore('fundamentals') === null, 'No best score without results');

saveThemencheckResult('fundamentals', { ...mockResult, answers: mockResult.answers, startedAt: 1, finishedAt: 2 });
assert(!isThemencheckPassed('fundamentals'), '33% is not passed');
assert.equal(getBestScore('fundamentals'), 33);

// Now save a passing result
saveThemencheckResult('fundamentals', {
  ...mockResult,
  answers: [
    { correct: true, sourceTopicId: 'osi-model', questionText: 'Q1', selectedIndex: 0 },
    { correct: true, sourceTopicId: 'osi-model', questionText: 'Q2', selectedIndex: 0 },
  ],
  startedAt: 1,
  finishedAt: 2,
});
assert(isThemencheckPassed('fundamentals'), '100% is passed');
assert.equal(getBestScore('fundamentals'), 100);
store.clear();
console.log('   Progress tracking verified.');

// ============================================================
// 7. Scoring + Sam recommendations
// ============================================================
console.log('7. Testing scoring + Sam recommendations...');
assert.equal(getGrade(100).label, 'Hervorragend');
assert.equal(getGrade(95).stars, 5);
assert.equal(getGrade(80).label, 'Sehr gut');
assert.equal(getGrade(65).label, 'Gut');
assert.equal(getGrade(50).label, 'Noch etwas üben');
assert.equal(getGrade(0).label, 'Thema erneut wiederholen');

assert(getSamComment(100).includes('sicher'));
assert(getSamComment(50).includes('nicht ganz'));
assert(getSamComment(20).includes('Lücken'));

const rec3 = getSamRecommendation('subnetting', 3);
assert(rec3.includes('komplett durchzuarbeiten'), `3 errors: ${rec3}`);
const rec2 = getSamRecommendation('subnetting', 2);
assert(rec2.includes('Schwierigkeiten'), `2 errors: ${rec2}`);
const rec1 = getSamRecommendation('subnetting', 1);
assert(rec1.includes('kurz an'), `1 error: ${rec1}`);
console.log('   Scoring grades and Sam recommendations verified.');

// ============================================================
// 8. Availability logic
// ============================================================
console.log('8. Testing availability logic...');
store.clear();
assert(!isThemencheckAvailable('fundamentals'), 'Not available without completions');
assert(!isThemencheckAvailable('cisco-packet-tracer'), 'Not available for empty category');

// Course mode: available
store.set('cyberlearn:academy-mode-v1', JSON.stringify({ stateVersion: 1, mode: 'course', placementResults: {} }));
assert(isThemencheckAvailable('fundamentals'), 'Available in course mode');
assert(!isThemencheckAvailable('cisco-packet-tracer'), 'Still not for category without lessons');
store.clear();
console.log('   Availability logic verified.');

// ============================================================
// 9. Route + UI integration
// ============================================================
console.log('9. Testing route and UI integration...');
const appSrc = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert(appSrc.includes('AcademyThemencheck'), 'AcademyThemencheck imported');
assert(appSrc.includes('/academy/themencheck/:categoryId'), 'Themencheck route');

const academySrc = fs.readFileSync(new URL('../src/pages/Academy.jsx', import.meta.url), 'utf8');
assert(academySrc.includes('Abschlusscheck'), 'Abschlusscheck in Academy');
assert(academySrc.includes('getCategorySummary'), 'getCategorySummary used');
assert(academySrc.includes('progressPercent'), 'Progress bar in Academy');

const catSrc = fs.readFileSync(new URL('../src/pages/AcademyCategory.jsx', import.meta.url), 'utf8');
assert(catSrc.includes('getCategorySummary'), 'getCategorySummary in Category');
assert(catSrc.includes('progressPercent'), 'Progress percent shown');
assert(catSrc.includes('Lernziele'), 'Learning objectives section');
assert(catSrc.includes('isThemencheckPassed'), 'Check passed status');
assert(catSrc.includes('getBestScore'), 'Best score shown');
assert(catSrc.includes('Themencheck'), 'Themencheck card');

const checkSrc = fs.readFileSync(new URL('../src/pages/AcademyThemencheck.jsx', import.meta.url), 'utf8');
assert(checkSrc.includes('ThemencheckIntro'), 'Has intro screen');
assert(checkSrc.includes('ThemencheckQuiz'), 'Has quiz flow');
assert(checkSrc.includes('ThemencheckResults'), 'Has results screen');
assert(checkSrc.includes('saveThemencheckResult'), 'Saves results');
assert(checkSrc.includes('getLastErrors'), 'Adaptive retry');
assert(checkSrc.includes('getSamRecommendation'), 'Sam recommendations');
assert(checkSrc.includes('RotateCcw'), 'Retry button icon');
assert(checkSrc.includes('Wiederhole meine Fehler'), 'Retry button text');
assert(checkSrc.includes('Stärken'), 'Strengths section');
assert(checkSrc.includes('Verbesserungsbedarf'), 'Weaknesses section');
assert(checkSrc.includes('Kapitel öffnen'), 'Chapter open link');
console.log('   All UI components and routes verified.');

// ============================================================
// 10. Abschlusscheck global
// ============================================================
console.log('10. Testing Abschlusscheck...');
store.set('cyberlearn:academy-mode-v1', JSON.stringify({ stateVersion: 1, mode: 'course', placementResults: {} }));
const globalQ = generateAbschlusscheck();
assert(globalQ.length >= 3, `Abschlusscheck has ${globalQ.length} questions`);
for (const q of globalQ) {
  assert(q.question && q.sourceTopicId);
}
store.clear();
console.log(`   Abschlusscheck verified with ${globalQ.length} questions.`);

// ============================================================
// Bonus: collectQuestionsFromLesson export
// ============================================================
console.log('11. Testing collectQuestionsFromLesson export...');
const osiPool = collectQuestionsFromLesson(osiLesson, 'osi-model');
assert(osiPool.length >= 20, `OSI has ${osiPool.length} collectible questions`);
assert(osiPool.every(q => q.sourceTopicId === 'osi-model'));
console.log(`   collectQuestionsFromLesson works (${osiPool.length} from OSI).`);

console.log('\n=== All Milestone C5.2 Tests PASSED ===');
