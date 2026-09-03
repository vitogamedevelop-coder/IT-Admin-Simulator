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

console.log('=== Active Directory Preferred Bridgehead Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');

check(/bridgehead/i.test(lessonText), 'Bridgehead is mentioned');
check(/automatisch/i.test(lessonText) && /standard/i.test(lessonText), 'Automatic bridgehead selection is described as standard');
check((/manuell/i.test(lessonText) && /optional/i.test(lessonText)) || (/manuell/i.test(lessonText) && /bewusst/i.test(lessonText)), 'Manual bridgehead is described as optional/deliberate');
check(/nicht.*immer.*manuell|manuell.*nur.*bewusst|automatisch.*standard/i.test(lessonText), 'Refutes mandatory manual bridgehead claim');

console.log('\n=== Active Directory Preferred Bridgehead Contract Test passed ===');


