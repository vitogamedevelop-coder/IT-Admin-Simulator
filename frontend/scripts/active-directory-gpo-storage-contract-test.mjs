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

console.log('=== Active Directory GPO Storage Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');
check(/gpc/i.test(lessonText) && /gpt/i.test(lessonText) && /sysvol/i.test(lessonText), 'GPC, GPT and SYSVOL mentioned');
check(/active directory|ad/i.test(lessonText), 'GPC linked to AD');
check(/sysvol/i.test(lessonText), 'GPT linked to SYSVOL');
check(/beide.*teil.*gpo|desselben gpo|gehören.*zum.*gpo/i.test(lessonText), 'GPC and GPT are parts of the same logical GPO');

console.log('\n=== Active Directory GPO Storage Contract Test passed ===');

