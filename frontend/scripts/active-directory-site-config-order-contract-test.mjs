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

console.log('=== Active Directory Site Config Order Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');

const orderItems = ['site anlegen', 'subnetz anlegen', 'dc verschieben', 'site link', 'verifizieren'];
orderItems.forEach((item) => check(lessonText.includes(item), `Mentions "${item}"`));

check(/site.*subnet.*dc.*site link|site.*subnet.*dc.*cost/i.test(lessonText), 'Logical config order Site → Subnet → DC → Site Link/Parameter is suggested');

check(lessonText.includes('verifikation') || lessonText.includes('prüfen'), 'Verification step is mentioned');

console.log('\n=== Active Directory Site Config Order Contract Test passed ===');



