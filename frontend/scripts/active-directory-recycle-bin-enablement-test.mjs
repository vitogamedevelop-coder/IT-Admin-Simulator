import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-recycle-bin');
const lessonText = JSON.stringify(LESSONS[TOPIC_ID]).toLowerCase();

function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('=== Active Directory Recycle Bin Enablement Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');

check(/aktiviert|aktivierung/i.test(lessonText), 'Enablement is mentioned');
check(/vor.*löschen|vorher.*aktiv/i.test(lessonText), 'Enable before deletion is required');
check(!/erst.*löschen.*dann.*aktivieren|nach.*löschung.*aktivieren.*garantiert/i.test(lessonText), 'No claim that enable after deletion guarantees restore');

console.log('\n=== Active Directory Recycle Bin Enablement Test passed ===');

