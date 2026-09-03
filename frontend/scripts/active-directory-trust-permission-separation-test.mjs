const { buildAdTrustsLesson } = await import('../src/lib/academyLessons/adTrusts.js');

const { explanations, exercises, summary } = buildAdTrustsLesson();

function assert(predicate, message) {
  if (!predicate) throw new Error(`Trust Permission Separation Test failed: ${message}`);
}

console.log('=== Active Directory Trust Permission Separation Test ===');

const explanationText = explanations.flatMap((e) => e.blocks).map((b) => (b.type === 'text' ? b.content : '')).join(' ');
const summaryText = summary.join(' ');
const allAuthoritativeText = explanationText + ' ' + summaryText;

console.log('A. Trust does not equal permission concept is taught ...');
assert(/Trust.{0,40}(?:≠|nicht|nicht automatisch|nicht gleich|bedeutet nicht).{0,40}(?:Berechtigung|Permission|Zugriff|Ressourcen)/is.test(allAuthoritativeText) || /Vertrauensstellung.{0,50}(?:≠|nicht|bedeutet nicht).{0,50}(?:Berechtigung|Zugriff|Ressourcen)/is.test(allAuthoritativeText), 'lesson must teach trust != permission/resource access');
assert(/Berechtigung|Permission|ACL|Gruppenmitgliedschaft/i.test(allAuthoritativeText), 'lesson must mention permissions/ACL/group membership');

console.log('B. Authoritative content does not claim trust grants automatic resource access ...');
const badAuthoritativeClaims = [
  /Trust.{0,30}erm[oö]glicht.{0,30}automatisch.{0,20}Zugriff/i,
  /Trust.{0,30}gibt.{0,30}automatisch.{0,20}Zugriff/i,
  /Trust.{0,30}gew[aä]hrt.{0,30}automatisch.{0,20}Zugriff/i,
  /Trust.{0,30}erlaubt.{0,30}automatisch.{0,20}Zugriff/i,
  /Vertrauensstellung.{0,40}erm[oö]glicht.{0,30}automatisch.{0,20}Zugriff/i,
  /Vertrauensstellung.{0,40}gibt.{0,30}automatisch.{0,20}Zugriff/i,
  /Vertrauensstellung.{0,40}gew[aä]hrt.{0,30}automatisch.{0,20}Zugriff/i,
  /Vertrauensstellung.{0,40}erlaubt.{0,30}automatisch.{0,20}Zugriff/i,
];
for (const regex of badAuthoritativeClaims) {
  assert(!regex.test(allAuthoritativeText), 'authoritative text must not claim trust grants automatic access');
}

console.log('C. Misconception exercises reject the claim ...');
const accessMisconception = exercises.find((e) => /misconception-access/i.test(e.id));
assert(accessMisconception, 'ad-trusts-misconception-access exercise must exist');
assert(accessMisconception.correct !== 0, 'correct answer must reject "trust grants access" misconception');

console.log('D. Transfer exercise requires both trust and permission ...');
const transfer = exercises.find((e) => /ad-trusts-transfer/i.test(e.id));
assert(transfer, 'ad-trusts-transfer exercise must exist');
assert(/Trust/i.test(transfer.explanation || '') && /Berechtigung/i.test(transfer.explanation || ''), 'transfer explanation must mention both trust and permission');

console.log('E. Troubleshooting exercise checks permissions first ...');
const troubleshooting = exercises.find((e) => /ad-trusts-troubleshooting/i.test(e.id));
assert(troubleshooting, 'ad-trusts-troubleshooting exercise must exist');
assert(/Berechtigung|ACL|Gruppe/i.test(troubleshooting.explanation || ''), 'troubleshooting explanation must point to permissions/ACL/groups');

console.log('F. Trust-vs-access exercise preserves separation ...');
const trustVsAccess = exercises.find((e) => /trust-vs-access/i.test(e.id));
assert(trustVsAccess, 'ad-trusts-trust-vs-access exercise must exist');
assert(trustVsAccess.correct !== 0, 'trust-vs-access correct answer must be "no" (access requires permissions)');

console.log('=== Active Directory Trust Permission Separation Test passed ===');

