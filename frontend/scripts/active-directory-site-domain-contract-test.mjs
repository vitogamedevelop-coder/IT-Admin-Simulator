import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-sites');

const lessonText = JSON.stringify(LESSONS[TOPIC_ID]).toLowerCase();
const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);

function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('=== Active Directory Site vs Domain Contract Test ===\n');

check(LESSONS[TOPIC_ID], 'Lesson exists');

check(/site.*physisc?h|physisc?h.*netzwerk/i.test(lessonText), 'Site is associated with physical network topology');
check(/domain.*logisc?h|logisc?h.*verwaltung|domain.*ident/i.test(lessonText), 'Domain is associated with logical identity/admin structure');
check(/nicht.*1:1|nicht .*gleich|site ≠ domain|site != domain|keine unterdomäne/i.test(lessonText), 'Site is not a 1:1 mapping or subdomain of Domain');
check(/eine domain.*mehrere sites|mehrere sites.*eine domain/i.test(lessonText), 'A domain can contain multiple sites');

const siteDefItem = items.find((i) => i.id.includes('siteDefinition'));
check(siteDefItem, 'Knowledge item for site definition exists');
check(/physische/i.test(siteDefItem.data.definition), 'Site definition item mentions physical network');

const domainItem = items.find((i) => i.id.includes('siteVsDomain'));
check(domainItem, 'Knowledge item for site vs domain exists');
check(/logisch/i.test(domainItem.data.description) && /physisch/i.test(domainItem.data.description), 'Site vs Domain item contrasts logical and physical');

console.log('\n=== Active Directory Site vs Domain Contract Test passed ===');


