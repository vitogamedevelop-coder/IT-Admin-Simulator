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

console.log('=== Active Directory Recycle Bin Backup Separation Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');

check(/recycle bin/i.test(lessonText) && /backup/i.test(lessonText), 'Recycle Bin and Backup are both mentioned');
check(/ersetzt.*kein.*backup|ersetzt.*nicht.*backup|nicht.*ersatz.*für.*backup|keine.*backup.*strategie/i.test(lessonText), 'Recycle Bin is explicitly marked as not replacing backup');

console.log('\n=== Active Directory Recycle Bin Backup Separation Test passed ===');


