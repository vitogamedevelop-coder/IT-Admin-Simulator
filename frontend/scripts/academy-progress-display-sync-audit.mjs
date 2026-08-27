import {
  topicTheoryCompletion,
  topicOverallProgress,
  computeNextStatus,
} from '../src/lib/academyEngine.js';

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

// Simulate the UI expressions used by AcademyCategory and AcademyTopic.
function uiTheoryPercent(topic) {
  return (topic.theoryCompletion ?? topic.theoryScore) ?? 0;
}

console.log('=== Academy Progress Display Sync Audit ===');

// Fall A: theoryCompletion=100, practiceScore=28
const topicA = {
  status: 'available',
  theoryCompletion: 100,
  theoryScore: 26,
  practiceScore: 28,
  retentionScore: 0,
  contentSeenPercent: 100,
  quizPerfectCount: 0,
  appliedCount: 0,
  repetitionCount: 0,
  lessonCompletions: 1,
};
assert('Fall A: topicTheoryCompletion = 100', topicTheoryCompletion(topicA) === 100);
assert('Fall A: UI Theorie = 100%', uiTheoryPercent(topicA) === 100);
assert('Fall A: Praxis unverändert = 28%', topicA.practiceScore === 28);
assert('Fall A: Gesamtfortschritt > 0', topicOverallProgress(topicA) > 0);
assert('Fall A: Gesamtfortschritt nutzt theoryCompletion', topicOverallProgress({ ...topicA, contentSeenPercent: 0 }) === topicOverallProgress(topicA));
assert('Fall A: Status erreicht LEARNED', computeNextStatus(topicA) === 'learned');

// Fall B: theoryCompletion=26, practiceScore=48
const topicB = {
  status: 'available',
  theoryCompletion: 26,
  theoryScore: 0,
  practiceScore: 48,
  retentionScore: 0,
  contentSeenPercent: 26,
  quizPerfectCount: 0,
  appliedCount: 0,
  repetitionCount: 0,
  lessonCompletions: 0,
};
assert('Fall B: topicTheoryCompletion = 26', topicTheoryCompletion(topicB) === 26);
assert('Fall B: UI Theorie = 26%', uiTheoryPercent(topicB) === 26);
assert('Fall B: UI Theorie nicht theoryScore (0)', uiTheoryPercent(topicB) !== 0);

// Fall C: Legacy Save ohne theoryCompletion -> Fallback auf theoryScore
const topicC = {
  status: 'available',
  theoryCompletion: undefined,
  theoryScore: 56,
  practiceScore: 10,
  retentionScore: 0,
  contentSeenPercent: 56,
  quizPerfectCount: 0,
  appliedCount: 0,
  repetitionCount: 0,
  lessonCompletions: 0,
};
assert('Fall C: Legacy topicTheoryCompletion fallback = 56', topicTheoryCompletion(topicC) === 56);
assert('Fall C: UI Theorie fallback = 56%', uiTheoryPercent(topicC) === 56);

// Fall D: contentSeenPercent darf Gesamtfortschritt nicht mehr dominieren
const topicD = {
  status: 'available',
  theoryCompletion: 0,
  theoryScore: 0,
  practiceScore: 0,
  retentionScore: 0,
  contentSeenPercent: 100,
  quizPerfectCount: 0,
  appliedCount: 0,
  repetitionCount: 0,
  lessonCompletions: 0,
};
assert('Fall D: Gesamtfortschritt nicht nur durch contentSeenPercent hochgetrieben', topicOverallProgress(topicD) < 50);

console.log('');
if (failures === 0) {
  console.log('Alle Display-Sync-Checks bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
