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

console.log('=== Active Directory Site Link vs Connection Object Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');

check(/site link/i.test(lessonText), 'Site Link is mentioned');
check(/connection object/i.test(lessonText), 'Connection Object is mentioned');
check(/logisch/i.test(lessonText) && /site.*ebene|site-ebene|zwischen.*sites/i.test(lessonText), 'Site Link described as logical / site-level');
check(/konkret/i.test(lessonText) && /dc.*ebene|dc-ebene|domain controller/i.test(lessonText), 'Connection Object described as concrete / DC-level');
check(/nicht.*dasselbe|nicht.*gleich|site link.*connection object|connection object.*site link/i.test(lessonText), 'Distinction between Site Link and Connection Object is drawn');

check(/kcc.*connection|connection.*kcc|erzeugt.*connection/i.test(lessonText), 'KCC creates Connection Objects');

console.log('\n=== Active Directory Site Link vs Connection Object Contract Test passed ===');


