import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-basics');
const lesson = LESSONS[TOPIC_ID];

function auditRequires(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('=== Active Directory Replication Delta Contract Test ===\n');

auditRequires(!!lesson, 'Lesson ad-replication-basics exists');

const haystack = JSON.stringify(lesson).toLowerCase();

auditRequires(/delta/i.test(haystack), 'Lesson mentions Delta-Replikation');
auditRequires(/(nur (die|tatsächlichen)? ?änderungen|änderungen übertragen|kein(e)? komplette(r)? ntds)/i.test(haystack), 'Delta principle is explained as only changes being replicated');
auditRequires(/komplette ntds\.dit|gesamte(n)? datenbestand|ganze(n)? datenbank/i.test(haystack), 'Lesson clarifies that the full database is not transferred each time');

const deltaExercises = lesson.exercises.filter((e) =>
  e.question?.toLowerCase().includes('delta') ||
  e.question?.toLowerCase().includes('abteilung') ||
  e.question?.toLowerCase().includes('änderung') ||
  e.options?.some((o) => o.toLowerCase().includes('delta'))
);
auditRequires(deltaExercises.length >= 2, `At least 2 exercises cover delta concept (found ${deltaExercises.length})`);

const misconception = lesson.exercises.find((e) => e.id === 'ad-repl-full-ntds-misconception');
auditRequires(!!misconception, 'Exercise ad-repl-full-ntds-misconception exists');
auditRequires(/nicht|falsch/i.test(misconception.options[misconception.correct]), 'Misconception answer rejects full NTDS.DIT transfer');

console.log('\n=== Active Directory Replication Delta Contract Test passed ===');


