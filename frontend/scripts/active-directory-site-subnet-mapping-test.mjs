import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-sites');

const lessonText = JSON.stringify(LESSONS[TOPIC_ID]).toLowerCase();

function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('=== Active Directory Site Subnet Mapping Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');

check(/192\.168\.10\.55/.test(LESSONS[TOPIC_ID].explanations.map((e) => JSON.stringify(e.blocks)).join('')) ||
  /192\.168\.10\.55/.test(JSON.stringify(LESSONS[TOPIC_ID].exercises)), 'Subnet scenario with 192.168.10.55 present');

check(/192\.168\.10\.0\/24/.test(JSON.stringify(LESSONS[TOPIC_ID]).toLowerCase()), 'Subnet 192.168.10.0/24 is mentioned');
check(/lechfeld/i.test(lessonText) && /pöcking/i.test(lessonText), 'Both sites LECHFELD and PÖCKING are mentioned');
check(/ip.*subnetz.*site|subnetz.*site.*dc|ip-adresse.*subnetz.*site.*dc/i.test(lessonText), 'IP → Subnet → Site → DC flow described');

check(/bevorzugt.*lokal.*dc|lokaler.*dc|dc.*lechfeld/i.test(lessonText), 'Client is expected to prefer local DC in Lechfeld');

console.log('\n=== Active Directory Site Subnet Mapping Test passed ===');




