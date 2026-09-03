import fs from 'node:fs';

const load = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

const adPermissions = load('../src/lib/academyLessons/adPermissions.js');
const adGroupPractice = load('../src/lib/academyLessons/adGroupPractice.js');
const adMmcBasics = load('../src/lib/academyLessons/adMmcBasics.js');
const adDelegation = load('../src/lib/academyLessons/adDelegation.js');
const adMmcHelpdesk = load('../src/lib/academyLessons/adMmcHelpdesk.js');
const all = `${adPermissions} ${adGroupPractice} ${adMmcBasics} ${adDelegation} ${adMmcHelpdesk}`;

function check(predicate, message) {
  if (!predicate) throw new Error(`Source Completion Audit failed: ${message}`);
}

console.log('=== Active Directory Berechtigungsverwaltung Source Completion Audit ===');

console.log('A. Grundproblem Berechtigungsverwaltung ...');
check(/Berechtigungsverwaltung|Rechte.*verwalten|Least Privilege/i.test(all), 'Grundproblem fehlt');

console.log('B. Gruppen ...');
check(/Sicherheitsgruppe|Funktionsgruppe|Berechtigungsgruppe/i.test(all), 'Gruppen fehlen');

console.log('C. Sicherheits- / Verteilergruppen ...');
check(/Sicherheitsgruppe/i.test(adGroupPractice) && /Verteilergruppe/i.test(adGroupPractice), 'Sicherheits-/Verteilergruppen fehlen');

console.log('D. Global / Domain Local / Universal ...');
check(/Global/i.test(all) && /Domain local|domänenlokal/i.test(all) && /Universal/i.test(all), 'Gruppenbereiche fehlen');

console.log('E. Verschachtelung ...');
check(/verschachtelt|Mitglied|nested/i.test(all), 'Gruppenverschachtelung fehlt');

console.log('F. A-G-DL-P ...');
check(/A-G-DL-P|A-G-DL/i.test(all), 'A-G-D-L-P fehlt');

console.log('G. A-G-G-P ...');
check(/A-G-G-P|A-G-G/i.test(all), 'A-G-G-P fehlt');

console.log('H. Gruppen anlegen ...');
check(/neue Gruppe|New.*Group|Gruppe.*anlegen/i.test(all), 'Gruppen anlegen fehlt');

console.log('I. Gruppenmitglieder verwalten ...');
check(/Mitglied|Members|Member Of/i.test(all), 'Gruppenmitglieder fehlen');

console.log('J. MMC Grundlagen ...');
check(/MMC/i.test(adMmcBasics), 'MMC Grundlagen fehlen');

console.log('K. Snap-Ins ...');
check(/Snap-In/i.test(adMmcBasics), 'Snap-Ins fehlen');

console.log('L. Konsolenmodi ...');
check(/Autorenmodus|Benutzermodus|restricted|Einzelfenster/i.test(adMmcBasics), 'Konsolenmodi fehlen');

console.log('M. Delegation / Objektverwaltung ...');
check(/Delegation|Objektverwaltung zuweisen/i.test(adDelegation), 'Delegation fehlt');

console.log('N. Passwortreset Delegation ...');
check(/Passwort.*zurücksetzen|Kennwort.*zurücksetzen/i.test(adDelegation), 'Passwortreset-Delegation fehlt');

console.log('O. MMC Taskpad ...');
check(/Aufgabenblockansicht|Taskpad/i.test(adMmcHelpdesk), 'MMC Taskpad fehlt');

console.log('P. MMC einschränken ...');
check(/Konsolenmodus|restricted|Einzelfenster|Filteroptionen/i.test(adMmcHelpdesk), 'MMC Einschränkung fehlt');

console.log('Q. MMC speichern / bereitstellen ...');
check(/\.msc/i.test(adMmcHelpdesk) && /bereitstellen|Homelaufwerk|Deployment/i.test(adMmcHelpdesk), 'MMC speichern/bereitstellen fehlt');

console.log('--- Source coverage check passed ---');

const optionalSchemaMaster = /Schema|schmmgmt/i.test(adMmcHelpdesk);
if (optionalSchemaMaster) {
  console.log('OPTIONAL: Schema Master wird nicht zentral geprüft, keine Pflicht.');
} else {
  console.log('OPTIONAL: Schema Master bewusst ausgelassen.');
}

const buildGradle = fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
check(/versionCode 19100/.test(buildGradle), 'versionCode must be 19100 for 1.91.0');

console.log('\nBerechtigungsverwaltung.txt: FACHLICH ABGESCHLOSSEN ✅');
console.log('=== Active Directory Berechtigungsverwaltung Source Completion Audit passed ===');








