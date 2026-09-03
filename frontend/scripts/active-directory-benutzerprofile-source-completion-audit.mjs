import assert from 'node:assert/strict';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { LESSONS, hasLessonContent } from '../src/lib/academyLessonData.js';

const CATEGORY = 'active-directory-virtualbox';
const topics = ACADEMY_TOPICS.filter((t) => t.categoryId === CATEGORY);

const mainBlocks = [
  { topicId: 'ad-foundation', label: 'AD Grundlagen' },
  { topicId: 'domain', label: 'Domäne' },
  { topicId: 'domain-controller', label: 'Domain Controller' },
  { topicId: 'organizational-units', label: 'OU-Verwaltung' },
  { topicId: 'windows-server', label: 'Windows Server Core' },
  { topicId: 'ad-user-profiles', label: 'Benutzerkonten und Benutzerprofile' },
  { topicId: 'users', label: 'Benutzer anlegen' },
  { topicId: 'shares', label: 'Freigaben' },
  { topicId: 'ntfs-permissions', label: 'NTFS-Berechtigungen' },
];

const optionalBlocks = [
  { topicId: 'ad-permissions', label: 'Berechtigungsverwaltung (optionaler/erweiterter Block)' },
  { topicId: 'virtualbox-lab', label: 'VirtualBox-Lab (noch nicht verfügbar)' },
];

console.log('=== Active Directory Benutzerprofile Source Completion Audit ===');

console.log('\nAbgedeckte Hauptthemen:');
let missingMain = 0;
for (const block of mainBlocks) {
  const has = hasLessonContent(CATEGORY, block.topicId);
  const status = has ? '✓' : '✗';
  console.log(`  ${status} ${block.label} (${block.topicId})`);
  if (!has) missingMain += 1;
}
assert.strictEqual(missingMain, 0, 'all main Benutzerprofile blocks must have lesson content');

console.log('\nOptionale / bewusst nicht vertiefte Themen:');
for (const block of optionalBlocks) {
  const has = hasLessonContent(CATEGORY, block.topicId);
  console.log(`  ${has ? 'vorhanden (optional)' : 'nicht vertieft'} ${block.label} (${block.topicId})`);
}

console.log('\nGesamtübersicht Kategorie:');
let withLesson = 0;
let withoutLesson = 0;
for (const t of topics) {
  const has = hasLessonContent(CATEGORY, t.topicId);
  if (has) withLesson += 1; else withoutLesson += 1;
}
console.log(`  Topics insgesamt: ${topics.length}`);
console.log(`  Mit Lesson: ${withLesson}`);
console.log(`  Platzhalter/optional: ${withoutLesson}`);

console.log('\nTemplate/Dummy-User Block:');
const usersKey = topicKey(CATEGORY, 'users');
const usersLesson = LESSONS[usersKey];
assert(usersLesson, 'users lesson must exist');
const full = JSON.stringify(usersLesson);
assert(full.includes('Vorlagen') || full.includes('Template') || full.includes('_Vorlage'), 'users lesson must cover template/dummy user concept');
assert(full.includes('%username%'), 'users lesson must include %username% path expansion');
console.log('  ✓ Vorlagenbenutzerkonzept gefunden');
console.log('  ✓ %username% Pfad-Erweiterung gefunden');

console.log('\n=== Active Directory Benutzerprofile Source Completion Audit passed ===');
console.log('\nBenutzerprofile.txt: fachlich abgeschlossen.');


