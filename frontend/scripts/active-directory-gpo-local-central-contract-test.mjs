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

console.log('=== Active Directory GPO Local/Central Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');
check(/lokal/i.test(lessonText) && /zentral/i.test(lessonText), 'Local and central policies mentioned');
check(/einzeln.*rechner|nur.*einem.*rechner/i.test(lessonText), 'Local policy linked to single computer');
check(/active directory|ad.*verwaltet|domäne/i.test(lessonText), 'Domain/central policy linked to AD');

console.log('\n=== Active Directory GPO Local/Central Contract Test passed ===');

