import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-sites');

const lesson = LESSONS[TOPIC_ID];
const lessonText = JSON.stringify(lesson).toLowerCase();
const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);

function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('=== Active Directory Intra/Inter Replication Test ===\n');

check(lesson, 'Lesson exists');

check(/intrasite.*gleiche.*site|gleiche.*site.*intrasite|innerhalb.*derselben.*site/i.test(lessonText), 'Intrasite linked to same site');
check(/intersite.*unterschiedliche.*sites|zwischen.*sites.*intersite|unterschiedlicher.*site/i.test(lessonText), 'Intersite linked to different sites');
check(/intersite.*wan|wan.*intersite/i.test(lessonText), 'Intersite linked to WAN context');
check(/intersite.*plan|intersite.*bandbreite|intersite.*latenz|optimiert|bewusst/i.test(lessonText), 'Intersite is described as planned/optimized');

check(!/15.*sekunde|15s|fest.*sekunden|15-sekunden/i.test(lessonText), 'No hardcoded 15-second timing values as truth');
const explanationText = lesson.explanations.map((e) => e.blocks.filter((b) => b.type === 'text').map((b) => b.content).join(' ')).join(' ').toLowerCase();
check(!/(ad|active directory).*technisch.*schlechter|langsamer.*weil.*(ad|active directory).*(schlechter|schwächer)/i.test(explanationText), 'No misleading claim that AD replicates worse over WAN in explanations');

const intrasiteItem = items.find((i) => i.id.includes('intrasite'));
check(intrasiteItem, 'Knowledge item for intrasite exists');
check(/gleiche.*site|innerhalb/i.test(intrasiteItem.data.definition), 'Intrasite item mentions same site');

const intersiteItem = items.find((i) => i.id.includes('intersite'));
check(intersiteItem, 'Knowledge item for intersite exists');
check(/unterschiedliche.*site|zwischen.*site|wan/i.test(intersiteItem.data.definition), 'Intersite item mentions different sites or WAN');

console.log('\n=== Active Directory Intra/Inter Replication Test passed ===');




