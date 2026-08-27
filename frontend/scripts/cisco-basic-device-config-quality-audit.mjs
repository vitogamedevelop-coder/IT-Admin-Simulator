import { LESSONS } from '../src/lib/academyLessonData.js';
import { ACADEMY_TOPICS, topicKey } from '../src/lib/academyTopics.js';
import { CONVERSATION_TOPICS } from '../src/lib/employeeConversations.js';
import { getAllKnowledgeItems } from '../src/lib/knowledge/index.js';
import { SKILL_TREE } from '../src/lib/skillTree.js';
import { normalizeCiscoLine, checkCiscoInput } from '../src/lib/ciscoCli.js';

const basicConfigKey = topicKey('cisco-packet-tracer', 'basic-device-configuration');
const lesson = LESSONS[basicConfigKey];

let failures = 0;
function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`FAIL: ${label}${detail ? ` (${detail})` : ''}`);
    failures += 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

console.log('=== Cisco Basic Device Configuration Quality Audit ===');

assert('Lesson existiert', !!lesson);
assert('Hat Erklärungen', (lesson?.explanations?.length || 0) > 0, `count=${lesson?.explanations?.length}`);
assert('Hat Übungen', (lesson?.exercises?.length || 0) > 0, `count=${lesson?.exercises?.length}`);
assert('Hat Quiz', (lesson?.quiz?.length || 0) > 0, `count=${lesson?.quiz?.length}`);
assert('Hat cliTasks', (lesson?.cliTasks?.length || 0) > 0, `count=${lesson?.cliTasks?.length}`);

// Coverage matrix
const coverage = {
  no: { configure: false, verify: false, troubleshoot: false },
  do: { configure: false, verify: false },
  hostname: { configure: false, verify: false },
  domainName: { configure: false },
  enableSecret: { configure: false },
  localUser: { configure: false, troubleshoot: false },
  loginVsLoginLocal: { configure: false, troubleshoot: false },
  execTimeout: { configure: false, troubleshoot: false },
  passwordEncryption: { configure: false },
  noIpDomainLookup: { configure: false, troubleshoot: false },
  verifyRunningConfig: { verify: false },
  saveConfig: { configure: false, troubleshoot: false },
};

function covers(text, ...phrases) {
  const t = text.toLowerCase();
  return phrases.some((p) => t.includes(p.toLowerCase()));
}

const allTexts = [
  ...(lesson?.explanations || []).flatMap((e) => e.blocks.map((b) => b.content || b.title || JSON.stringify(b.rows || b.items || b.options || []))).join(' '),
  ...(lesson?.exercises || []).map((e) => `${e.id} ${e.question} ${e.explanation}`).join(' '),
  ...(lesson?.quiz || []).map((q) => `${q.question} ${q.explanation}`).join(' '),
  ...(lesson?.cliTasks || []).map((t) => `${t.prompt} ${t.explanation}`).join(' '),
].join(' ');

if (covers(allTexts, 'no ', 'no-')) coverage.no.configure = true;
if (covers(allTexts, 'do show', 'do ')) coverage.do.configure = true;
if (covers(allTexts, 'hostname')) coverage.hostname.configure = true;
if (covers(allTexts, 'domain-name', 'domain name')) coverage.domainName.configure = true;
if (covers(allTexts, 'enable secret')) coverage.enableSecret.configure = true;
if (covers(allTexts, 'username')) coverage.localUser.configure = true;
if (covers(allTexts, 'login local', 'login')) coverage.loginVsLoginLocal.configure = true;
if (covers(allTexts, 'exec-timeout', 'exec timeout')) coverage.execTimeout.configure = true;
if (covers(allTexts, 'service password-encryption')) coverage.passwordEncryption.configure = true;
if (covers(allTexts, 'no ip domain-lookup')) coverage.noIpDomainLookup.configure = true;
if (covers(allTexts, 'show running-config', 'show run')) coverage.verifyRunningConfig.verify = true;
if (covers(allTexts, 'copy running-config startup-config', 'write')) coverage.saveConfig.configure = true;
if (covers(allTexts, 'lockout', 'kein lokaler benutzer', 'keine gültigen zugangsdaten')) {
  coverage.loginVsLoginLocal.troubleshoot = true;
  coverage.localUser.troubleshoot = true;
}
if (covers(allTexts, 'gespeichert', 'startup-config', 'nach einem neustart')) coverage.saveConfig.troubleshoot = true;
if (covers(allTexts, 'domain-lookup', 'tippfehler', 'wartezeit')) coverage.noIpDomainLookup.troubleshoot = true;
if (covers(allTexts, 'exec-timeout 0 0', 'timeout')) coverage.execTimeout.troubleshoot = true;

const missing = Object.entries(coverage)
  .flatMap(([topic, dims]) => Object.entries(dims).filter(([, v]) => !v).map(([dim]) => `${topic}.${dim}`));
assert('Alle wesentlichen Configure/Verify/Troubleshoot-Dimensionen abgedeckt', missing.length === 0, `missing=${missing.join(', ')}`);

// Visualizations
const expIds = new Set((lesson?.explanations || []).map((e) => e.id));
assert('Login-vs-login-local-Visualisierung vorhanden', expIds.has('login-visual'));
assert('Configure-Verify-Save-Workflow vorhanden', expIds.has('workflow-visual'));

// Conversation
const conv = CONVERSATION_TOPICS[basicConfigKey];
assert('Conversation existiert', !!conv);
assert('Conversation hat Fragen', (conv?.questions?.length || 0) >= 6, `count=${conv?.questions?.length}`);

// Knowledge
const knowledge = getAllKnowledgeItems().filter((item) => item.topicKey === basicConfigKey);
assert('Knowledge Items vorhanden', knowledge.length >= 4, `count=${knowledge.length}`);

// Skill tree has basic config subskills
const ciscoSkills = SKILL_TREE.cisco?.skills?.basic_configuration?.subskills || {};
assert('Skill-Tree enthält Basic-Config-Subskills', Object.keys(ciscoSkills).length > 0);
assert('Skill-Tree verify-basic_config vorhanden', !!ciscoSkills.verify_basic_config);
assert('Skill-Tree troubleshoot_console_lockout vorhanden', !!ciscoSkills.troubleshoot_console_lockout);
assert('Skill-Tree troubleshoot_config_not_saved vorhanden', !!ciscoSkills.troubleshoot_config_not_saved);
const validTopicKeys = new Set(ACADEMY_TOPICS.map((t) => topicKey(t.categoryId, t.topicId)));
const invalid = Object.values(ciscoSkills).filter((sub) => sub.lessonTopic && !validTopicKeys.has(sub.lessonTopic));
assert('Skill-Tree lessonTopic-Werte gültig', invalid.length === 0, `invalid=${invalid.map((s) => s.lessonTopic).join(', ')}`);

// CLI engine sanity
assert('CLI-Engine normalisiert Befehle', normalizeCiscoLine('sh run') === 'show running-config');
assert('CLI-Engine akzeptiert write als Speichern', checkCiscoInput('write\n', [['copy running-config startup-config']]).allCorrect);

console.log('');
if (failures === 0) {
  console.log('Cisco Basic Device Configuration Quality Audit bestanden.');
  process.exit(0);
} else {
  console.log(`${failures} Fehler gefunden.`);
  process.exit(1);
}
