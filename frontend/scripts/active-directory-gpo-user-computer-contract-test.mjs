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

console.log('=== Active Directory GPO User/Computer Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');
check(/benutzerkonfiguration|user configuration|benutzer.*konfiguration/i.test(lessonText), 'User Configuration mentioned');
check(/computerkonfiguration|computer configuration|computer.*konfiguration/i.test(lessonText), 'Computer Configuration mentioned');
check(/unabhängig.*vom.*rechner|unabhängig.*vom.*benutzer/i.test(lessonText), 'User and Computer scopes are cleanly separated');

console.log('\n=== Active Directory GPO User/Computer Contract Test passed ===');

