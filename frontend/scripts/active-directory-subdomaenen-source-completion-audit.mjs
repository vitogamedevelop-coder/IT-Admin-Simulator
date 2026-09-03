import { topicKey } from '../src/lib/academyTopics.js';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';

function hasTopic(topicId) {
  const key = topicKey('active-directory-virtualbox', topicId);
  return !!hasLessonContent('active-directory-virtualbox', topicId) && !!LESSONS[key];
}

function hasConversation(topicId) {
  const key = topicKey('active-directory-virtualbox', topicId);
  const conv = CONVERSATION_TOPICS[key];
  return !!conv && Array.isArray(conv.questions) && conv.questions.length > 0;
}

function itemsFor(topicId) {
  const key = topicKey('active-directory-virtualbox', topicId);
  return getAllKnowledgeItems().filter((i) => i.topicKey === key);
}

let hasError = false;
function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    hasError = true;
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('=== Active Directory Subdomänen.txt Source Completion Audit ===\n');

const topics = [
  ['ad-tree-forest', 'Trees, Forests & Subdomänen'],
  ['ad-trusts', 'Vertrauensstellungen'],
  ['ad-fsmo-admin-groups', 'FSMO-Rollen & Admin-Gruppen'],
  ['ad-fsmo-transfer', 'FSMO-Rollen anzeigen & verschieben'],
];

for (const [id, title] of topics) {
  check(hasTopic(id), `Topic "${title}" (${id}) has a registered lesson`);
  check(hasConversation(id), `Topic "${title}" (${id}) has conversation questions`);
  check(itemsFor(id).length >= 5, `Topic "${title}" (${id}) has at least 5 knowledge items`);
}

const treeForest = LESSONS[topicKey('active-directory-virtualbox', 'ad-tree-forest')];
const treeText = JSON.stringify(treeForest).toLowerCase();
check(/tree|forest|subdomäne|root domain|child domain|dns-namensraum/.test(treeText), 'Tree/Forest topic covers domain, tree, forest, subdomains');
check(/trust|vertrauensstellung|trusting|trusted|transitiv|parent|child/.test(JSON.stringify(LESSONS[topicKey('active-directory-virtualbox', 'ad-trusts')]).toLowerCase()), 'Trusts topic covers trust direction, transitive, parent/child');

const fsmoAdmin = LESSONS[topicKey('active-directory-virtualbox', 'ad-fsmo-admin-groups')];
const fsmoAdminText = JSON.stringify(fsmoAdmin).toLowerCase();
check(/schema master|domain naming master|enterprise admins|schema admins|least privilege|domain admins/.test(fsmoAdminText), 'FSMO admin groups topic covers forest-wide roles and privileged groups');

const fsmoTransfer = LESSONS[topicKey('active-directory-virtualbox', 'ad-fsmo-transfer')];
const fsmoTransferText = JSON.stringify(fsmoTransfer).toLowerCase();
check(/netdom query fsmo/.test(fsmoTransferText), 'FSMO transfer topic covers netdom query fsmo');
check(/regsvr32 schmmgmt.dll/.test(fsmoTransferText), 'FSMO transfer topic covers regsvr32 schmmgmt.dll');
check(/betriebsmaster|active directory-benutzer und -computer/.test(fsmoTransferText), 'FSMO transfer topic covers ADUC operations master');
check(/active directory-domänen und -vertrauensstellungen/.test(fsmoTransferText), 'FSMO transfer topic covers AD Domains and Trusts');
check(/active directory-schema snap-in/.test(fsmoTransferText), 'FSMO transfer topic covers AD Schema Snap-In');
check(/transfer|seize|ziel-dc|verifizieren/.test(fsmoTransferText), 'FSMO transfer topic covers transfer, target DC, verification');

const allItems = getAllKnowledgeItems();
const hasNetdomItem = allItems.some((i) => /netdom query fsmo/i.test(JSON.stringify(i.data)));
const hasSchmItem = allItems.some((i) => /regsvr32 schmmgmt.dll/i.test(JSON.stringify(i.data)));
check(hasNetdomItem, 'Knowledge item for netdom query fsmo exists');
check(hasSchmItem, 'Knowledge item for regsvr32 schmmgmt.dll exists');

const transferItems = itemsFor('ad-fsmo-transfer');
check(transferItems.some((i) => /transfer/i.test(i.data.subject) && /seize/i.test(i.data.description)), 'Transfer vs Seize knowledge item exists');

check(!/ntdsutil|seize.*praktisch|rollen.*seizen|ntdsutil.*seize/i.test(fsmoTransferText), 'No practical seize procedure with ntdsutil taught in FSMO transfer topic');

if (hasError) {
  console.error('\nSubdomänen.txt source completion audit FAILED.');
  process.exit(1);
}
console.log('\n==================================================');
console.log('Subdomänen.txt');
console.log('FACHLICH ABGESCHLOSSEN');
console.log('==================================================');
console.log('\n=== Active Directory Subdomänen.txt Source Completion Audit passed ===');



