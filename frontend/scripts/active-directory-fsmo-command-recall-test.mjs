import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-fsmo-transfer');
const lesson = LESSONS[TOPIC_ID];

function auditRequires(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('=== Active Directory FSMO Command Recall Test ===\n');

auditRequires(!!lesson, 'Lesson ad-fsmo-transfer exists');

const exercises = lesson.exercises;

const netdomGoal = exercises.find((e) => e.id === 'fsmo-transfer-netdom-goal');
auditRequires(!!netdomGoal && netdomGoal.type === 'select-best', 'Exercise netdom goal exists');
auditRequires(netdomGoal.correct === 0 && netdomGoal.options[0].toLowerCase() === 'netdom query fsmo', 'netdom goal answer is "netdom query fsmo"');

const netdomEffect = exercises.find((e) => e.id === 'fsmo-transfer-netdom-effect');
auditRequires(!!netdomEffect && netdomEffect.type === 'select-best', 'Exercise netdom effect exists');
auditRequires(netdomEffect.options[netdomEffect.correct].toLowerCase().includes('aktuellen fsmo-rolleninhaber'), 'netdom effect answer mentions FSMO role holders');

const schmGoal = exercises.find((e) => e.id === 'fsmo-transfer-schmmgmt-goal');
auditRequires(!!schmGoal && schmGoal.type === 'select-best', 'Exercise schmmgmt goal exists');
auditRequires(schmGoal.correct === 0 && schmGoal.options[0].toLowerCase() === 'regsvr32 schmmgmt.dll', 'schmmgmt goal answer is "regsvr32 schmmgmt.dll"');

const schmEffect = exercises.find((e) => e.id === 'fsmo-transfer-schmmgmt-effect');
auditRequires(!!schmEffect && schmEffect.type === 'select-best', 'Exercise schmmgmt effect exists');
auditRequires(schmEffect.options[schmEffect.correct].toLowerCase().includes('schema snap-in'), 'schmmgmt effect answer mentions schema snap-in');

const items = getAllKnowledgeItems().filter((i) => i.topicKey === TOPIC_ID);
auditRequires(items.some((i) => i.id.includes('query') && i.data.subject.toLowerCase().includes('netdom')), 'Knowledge item for netdom query fsmo exists');
auditRequires(items.some((i) => i.id.includes('schemaRegistration') || i.data.subject?.toLowerCase().includes('schmmgmt')), 'Knowledge item for regsvr32 schmmgmt.dll exists');

const netdomCount = exercises.filter((e) => e.question?.toLowerCase().includes('netdom') || e.options?.some((o) => o.toLowerCase().includes('netdom'))).length;
auditRequires(netdomCount >= 2, `At least 2 exercises mention netdom (found ${netdomCount})`);

const schmCount = exercises.filter((e) => e.question?.toLowerCase().includes('schmmgmt') || e.options?.some((o) => o.toLowerCase().includes('schmmgmt'))).length;
auditRequires(schmCount >= 2, `At least 2 exercises mention regsvr32 schmmgmt.dll (found ${schmCount})`);

console.log('\n=== Active Directory FSMO Command Recall Test passed ===');

