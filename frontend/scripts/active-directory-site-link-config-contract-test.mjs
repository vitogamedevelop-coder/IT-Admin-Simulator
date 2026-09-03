import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-site-config');
const lessonText = JSON.stringify(LESSONS[TOPIC_ID]).toLowerCase();

function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('=== Active Directory Site Link Config Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');

check(/cost/i.test(lessonText) && /bevorzugt/i.test(lessonText), 'Cost is linked to path preference');
check(/intervall/i.test(lessonText) && /häufig/i.test(lessonText), 'Interval is linked to replication frequency');
check(/zeitplan|schedule/i.test(lessonText) && /erlaubt/i.test(lessonText), 'Schedule is linked to allowed windows');

console.log('\n=== Active Directory Site Link Config Contract Test passed ===');


