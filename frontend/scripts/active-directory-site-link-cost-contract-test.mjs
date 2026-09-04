import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-topology');
const lessonText = JSON.stringify(LESSONS[TOPIC_ID]).toLowerCase();

function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('=== Active Directory Site Link Cost Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');
check(/50/.test(lessonText) && /10/.test(lessonText), 'Cost values 50 and 10 are mentioned');
check(/a.*c.*50|direkt.*50|a.*c.*direkt/i.test(lessonText), 'Direct path A → C with cost 50 is described');
check(/a.*b.*10.*b.*c.*10|a.*b.*10.*10.*b.*c|über.*b.*20/i.test(lessonText), 'Indirect path A → B → C with costs 10 + 10 is described');
check(/bevorzugt.*a.*b.*c|a.*b.*c.*bevorzugt|günstig.*a.*b.*c|20.*bevorzugt/i.test(lessonText), 'Indirect path A → B → C is preferred');
check(/20/.test(lessonText), 'Total cost 20 for the preferred path is mentioned');

console.log('\n=== Active Directory Site Link Cost Contract Test passed ===');




