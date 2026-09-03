import { LESSONS } from '../src/lib/academyLessonData.js';
import { topicKey } from '../src/lib/academyTopics.js';

const TOPIC_ID = topicKey('active-directory-virtualbox', 'ad-replication-basics');
const lesson = LESSONS[TOPIC_ID];

function auditRequires(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`PASS: ${message}`);
  }
}

function textContains(...terms) {
  const text = JSON.stringify(lesson).toLowerCase();
  return terms.every((t) => text.includes(t.toLowerCase()));
}

console.log('=== Active Directory Replication Partition Contract Test ===\n');

auditRequires(!!lesson, 'Lesson ad-replication-basics exists');

auditRequires(textContains('schema', 'forestweit'), 'Schema partition is marked forestwide');
auditRequires(textContains('configuration', 'forestweit'), 'Configuration partition is marked forestwide');
auditRequires(textContains('domain', 'domänenspezifisch') || textContains('domain', 'domain-spezifisch') || textContains('domain', 'nur an die dcs dieser domain'), 'Domain partition is marked domain-specific');
auditRequires(textContains('application', 'anwendungsspezifisch') || textContains('application', 'anwendung'), 'Application partition is marked application-specific');

const exercises = lesson.exercises;
const partitionMatch = exercises.find((e) => e.id === 'ad-repl-partition-scope-matching');
auditRequires(!!partitionMatch, 'Partition scope matching exercise exists');
auditRequires(partitionMatch.pairs.some((p) => p.left.toLowerCase().includes('schema') && p.right.toLowerCase().includes('forest')), 'Schema maps to forestwide');
auditRequires(partitionMatch.pairs.some((p) => p.left.toLowerCase().includes('configuration') && p.right.toLowerCase().includes('forest')), 'Configuration maps to forestwide');
auditRequires(partitionMatch.pairs.some((p) => p.left.toLowerCase().includes('domain') && (p.right.toLowerCase().includes('domain') || p.right.toLowerCase().includes('domäne'))), 'Domain maps to domain-specific');
auditRequires(partitionMatch.pairs.some((p) => p.left.toLowerCase().includes('application') && p.right.toLowerCase().includes('anwendung')), 'Application maps to application-specific');

const classif = exercises.find((e) => e.id === 'ad-repl-classification-select');
auditRequires(!!classif, 'Classification exercise exists');
auditRequires(classif.options[classif.correct].toLowerCase().includes('schemaattribut') && classif.options[classif.correct].toLowerCase().includes('user lisa'), 'Classification answer maps items to correct partitions');

console.log('\n=== Active Directory Replication Partition Contract Test passed ===');


