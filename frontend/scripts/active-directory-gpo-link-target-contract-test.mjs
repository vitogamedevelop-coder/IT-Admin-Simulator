import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-group-policy-basics');
const lessonText = JSON.stringify(LESSONS[TOPIC_ID]).toLowerCase();

function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('=== Active Directory GPO Link Target Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');
check(/site/i.test(lessonText) && /domain/i.test(lessonText) && /ou/i.test(lessonText), 'All link locations mentioned');
check(/benutzer|user/i.test(lessonText) && /computer/i.test(lessonText), 'User and Computer targets mentioned');
check(lessonText.includes('nicht auf die ou selbst') || lessonText.includes('nicht auf die ou'), 'GPO is explicitly marked as not acting on the OU itself');

console.log('\n=== Active Directory GPO Link Target Contract Test passed ===');

