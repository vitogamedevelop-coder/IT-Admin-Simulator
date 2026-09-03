import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-topology');
const lesson = LESSONS[TOPIC_ID];
const explanationText = lesson.explanations.map((e) => e.blocks.filter((b) => b.type === 'text').map((b) => b.content).join(' ')).join(' ').toLowerCase();
const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);

function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('=== Active Directory KCC Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');

check(/kcc|knowledge consistency checker/i.test(explanationText), 'KCC is mentioned');
check(/topologie.*berechn|berechn.*topologie|topologie.*pfleg|pfleg.*topologie/i.test(explanationText), 'KCC calculates / maintains topology');
check(/verbindungsobjekt|connection object/i.test(explanationText), 'Connection Objects are mentioned');
check(/kcc.*erzeugt|erzeugt.*connection|kcc.*verbindung/i.test(explanationText), 'KCC creates / maintains connection objects');
check(/reagiert.*änderung|neu bewerten|regelmäßig/i.test(explanationText), 'KCC reacts to changes');
check(/kein replikationsdienst|kein(e)? replikationsdienst|repliziert nicht selbst|repliziert keine daten/i.test(explanationText), 'KCC is explicitly distinguished from the replication engine');

const kccItems = items.filter((i) => /kcc/i.test(i.id));
check(kccItems.length >= 2, 'At least 2 KCC-related knowledge items exist');

console.log('\n=== Active Directory KCC Contract Test passed ===');

