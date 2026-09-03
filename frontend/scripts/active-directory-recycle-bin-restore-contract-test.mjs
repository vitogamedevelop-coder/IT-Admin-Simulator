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

console.log('=== Active Directory Recycle Bin Restore Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');

check(/restore/i.test(lessonText), 'Restore is mentioned');
check(/restore to|wiederherstellen in/i.test(lessonText), 'Restore To is mentioned');
check(/ursprünglich/i.test(lessonText) && /ander/i.test(lessonText), 'Restore is linked to original and Restore To to alternative location');

console.log('\n=== Active Directory Recycle Bin Restore Contract Test passed ===');

