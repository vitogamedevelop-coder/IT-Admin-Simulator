import { buildAdFoundationLesson } from '../src/lib/academyLessons/adFoundation.js';
import { buildAdDomainLesson } from '../src/lib/academyLessons/adLogicalComponents.js';
import { buildAdPermissionsLesson } from '../src/lib/academyLessons/adPermissions.js';
import { buildAdGroupPracticeLesson } from '../src/lib/academyLessons/adGroupPractice.js';
import { buildAdMmcBasicsLesson } from '../src/lib/academyLessons/adMmcBasics.js';
import { buildAdDelegationLesson } from '../src/lib/academyLessons/adDelegation.js';
import { buildAdTrustsLesson } from '../src/lib/academyLessons/adTrusts.js';
import { buildAdFsmoAdminGroupsLesson } from '../src/lib/academyLessons/adFsmoAdminGroups.js';
import { buildAdReplicationSiteConfigLesson } from '../src/lib/academyLessons/adReplicationSiteConfig.js';
import { buildAdRecycleBinLesson } from '../src/lib/academyLessons/adRecycleBin.js';
import { buildAdWindowsServerLesson } from '../src/lib/academyLessons/adWindowsServer.js';
import { buildAdSharesLesson } from '../src/lib/academyLessons/adShares.js';
import { buildAdDomainControllerLesson } from '../src/lib/academyLessons/adLogicalComponents.js';

import { LESSONS } from '../src/lib/academyLessonData.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { topicKey } from '../src/lib/academyTopics.js';

function ids(arr) {
  return new Set((arr || []).map((x) => x.id).filter(Boolean));
}

function countExercises(lesson) {
  return (lesson?.exercises || []).length;
}

function countQuiz(lesson) {
  return (lesson?.quiz || []).length;
}

function countGuided(lesson) {
  return (lesson?.exercises || []).filter((e) => e.type === 'guided-ui').length;
}

function checkSubset(sub, superSet, label) {
  const missing = [...sub].filter((x) => !superSet.has(x));
  if (missing.length) {
    console.log(`[FAIL] ${label}: missing ${missing.length} ids, e.g. ${missing[0]}`);
    process.exitCode = 1;
  } else {
    console.log(`[PASS] ${label}: ${sub.size} preserved`);
  }
}

console.log('=== Active Directory Topic Merge Content Preservation Audit ===');

const MERGE_TARGETS = [
  {
    newKey: 'active-directory-virtualbox/ad-foundation',
    old: [buildAdFoundationLesson(), buildAdDomainLesson()],
  },
  {
    newKey: 'active-directory-virtualbox/ad-install',
    old: [buildAdDomainControllerLesson()],
  },
  {
    newKey: 'active-directory-virtualbox/ad-groups',
    old: [buildAdPermissionsLesson(), buildAdGroupPracticeLesson()],
  },
  {
    newKey: 'active-directory-virtualbox/ad-administration',
    old: [buildAdMmcBasicsLesson(), buildAdDelegationLesson()],
  },
  {
    newKey: 'active-directory-virtualbox/ad-trusts',
    old: [buildAdTrustsLesson(), buildAdFsmoAdminGroupsLesson()],
  },
  {
    newKey: 'active-directory-virtualbox/ad-replication-practice',
    old: [buildAdReplicationSiteConfigLesson(), buildAdRecycleBinLesson()],
  },
  {
    newKey: 'active-directory-virtualbox/windows-server',
    old: [buildAdWindowsServerLesson(), buildAdSharesLesson()],
  },
];

for (const { newKey, old } of MERGE_TARGETS) {
  const merged = LESSONS[newKey];
  const oldTheory = old.flatMap((l) => l.explanations || []);
  const oldEx = old.flatMap((l) => l.exercises || []);
  const oldQuiz = old.flatMap((l) => l.quiz || []);

  checkSubset(ids(oldTheory), ids(merged.explanations), `${newKey} explanations`);
  checkSubset(ids(oldEx), ids(merged.exercises), `${newKey} exercises`);
  checkSubset(ids(oldQuiz), ids(merged.quiz), `${newKey} quiz`);

  if (merged.explanations.length < oldTheory.length) {
    console.log(`[FAIL] ${newKey} has fewer explanation objects than old sum (${merged.explanations.length} < ${oldTheory.length})`);
    process.exitCode = 1;
  }
}

// Category-level totals should not have regressed
const newAdTopics = [
  'ad-foundation', 'ad-install', 'organizational-units', 'users', 'ad-user-profiles',
  'ad-groups', 'ad-administration', 'ad-mmc-helpdesk', 'ad-tree-forest', 'ad-trusts',
  'ad-fsmo-transfer', 'ad-replication-basics', 'ad-replication-sites', 'ad-replication-topology',
  'ad-replication-practice', 'ad-group-policy-basics', 'windows-server', 'ntfs-permissions',
];

const sumNew = { theory: 0, exercises: 0, quiz: 0, guided: 0 };
for (const id of newAdTopics) {
  const l = LESSONS[topicKey('active-directory-virtualbox', id)];
  sumNew.theory += l?.explanations?.length || 0;
  sumNew.exercises += countExercises(l);
  sumNew.quiz += countQuiz(l);
  sumNew.guided += countGuided(l);
}

const allItems = getAllKnowledgeItems();
const newKnowledgeCount = allItems.filter((i) => i.topicKey.startsWith('active-directory-virtualbox/')).length;
let newConvCount = 0;
for (const id of newAdTopics) {
  const conv = CONVERSATION_TOPICS[topicKey('active-directory-virtualbox', id)];
  if (conv?.questions) newConvCount += conv.questions.length;
}

// Expected totals computed from the pre-merge state (excluding placeholders)
const expected = {
  theory: 305,
  exercises: 288,
  quiz: 132,
  guided: 48,
  knowledge: 330,
  conversationQuestions: 153,
};

const checks = [
  ['theory sections', sumNew.theory, expected.theory],
  ['exercises', sumNew.exercises, expected.exercises],
  ['quiz questions', sumNew.quiz, expected.quiz],
  ['guided UIs', sumNew.guided, expected.guided],
  ['knowledge items', newKnowledgeCount, expected.knowledge],
  ['conversation questions', newConvCount, expected.conversationQuestions],
];

for (const [label, actual, min] of checks) {
  if (actual >= min) {
    console.log(`[PASS] ${label}: ${actual} >= ${min}`);
  } else {
    console.log(`[FAIL] ${label}: ${actual} < ${min} (regression)`);
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  console.log('\n=== Active Directory Topic Merge Content Preservation Audit passed ===');
} else {
  console.log('\n=== Active Directory Topic Merge Content Preservation Audit FAILED ===');
  process.exit(1);
}
