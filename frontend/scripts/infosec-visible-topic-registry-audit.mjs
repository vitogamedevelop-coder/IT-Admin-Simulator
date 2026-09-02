import fs from 'node:fs';

const { ACADEMY_TOPICS, topicKey } = await import('../src/lib/academyTopics.js');
const { LESSONS } = await import('../src/lib/academyLessonData.js');

function auditRequires(predicate, message) {
  if (!predicate) throw new Error(`InfoSec registry audit failed: ${message}`);
}

console.log('=== InfoSec Visible Topic Registry Audit ===');

const infoSecTopics = ACADEMY_TOPICS.filter((t) => t.categoryId === 'information-security');
const infoSecKeys = infoSecTopics.map((t) => topicKey(t.categoryId, t.topicId));

console.log('A. Visible InfoSec topic count ...');
auditRequires(infoSecTopics.length === 5, `expected 5 visible InfoSec topics, got ${infoSecTopics.length}: ${infoSecKeys.join(', ')}`);

const expectedIds = [
  'security-fundamentals',
  'security-legal-data',
  'security-incidents',
  'security-threats-malware',
  'security-technical-measures',
];

for (const id of expectedIds) {
  auditRequires(infoSecTopics.some((t) => t.topicId === id), `missing expected topic ${id}`);
}

const legacyIds = [
  'security-objectives', 'confidentiality', 'integrity', 'availability', 'authenticity',
  'passwords', 'mfa', 'phishing', 'malware', 'backup', 'logging', 'firewall-basics',
  'hardening', 'incident-response', 'pimo', 'opti', 'isms', 'pdca', 'data-protection',
  'art9-dsgvo', 'information-categories', 'security-breach', 'security-incident',
  'firewall-types', 'ids-ips', 'dmz', 'allowlist-denylist', 'malware-types', 'attacks',
  'malware-prevention', 'required-level',
];

for (const id of legacyIds) {
  auditRequires(!infoSecTopics.some((t) => t.topicId === id), `legacy topic ${id} is still visible`);
}

console.log('B. Lesson registry alignment ...');
const lessonKeys = Object.keys(LESSONS).filter((k) => k.startsWith('information-security/'));
auditRequires(lessonKeys.length === 5, `expected 5 InfoSec lesson keys, got ${lessonKeys.length}: ${lessonKeys.join(', ')}`);
for (const id of expectedIds) {
  auditRequires(LESSONS[topicKey('information-security', id)], `missing lesson for ${id}`);
}
for (const id of legacyIds) {
  auditRequires(!LESSONS[topicKey('information-security', id)], `legacy lesson ${id} still registered`);
}

console.log('C. Save migration / legacy topic cleanup ...');
{
  const storage = {};
  const KEY = 'cyberlearn:academy-progress-v1';
  globalThis.localStorage = {
    getItem: (k) => storage[k] ?? null,
    setItem: (k, v) => { storage[k] = v; },
    removeItem: (k) => { delete storage[k]; },
  };
  globalThis.window = { dispatchEvent: () => {} };

  const legacyTopics = {};
  for (const id of legacyIds) {
    legacyTopics[topicKey('information-security', id)] = {
      status: 'learned',
      theoryScore: 80,
      practiceScore: 70,
      contentSeenPercent: 100,
    };
  }
  for (const id of expectedIds) {
    legacyTopics[topicKey('information-security', id)] = {
      status: 'started',
      theoryScore: 20,
      practiceScore: 0,
      contentSeenPercent: 20,
    };
  }

  const fixture = {
    stateVersion: 10,
    playerProfile: { preferredExplanationStyle: null },
    topics: legacyTopics,
  };

  storage[KEY] = JSON.stringify(fixture);

  const { readAcademyProgress } = await import('../src/lib/academyProgress.js');
  const progress = readAcademyProgress();

  for (const id of legacyIds) {
    auditRequires(!progress.topics[topicKey('information-security', id)], `legacy topic ${id} was not removed from save`);
  }
  for (const id of expectedIds) {
    auditRequires(progress.topics[topicKey('information-security', id)], `existing block topic ${id} missing from save`);
    auditRequires(progress.topics[topicKey('information-security', id)].theoryScore === 20, `${id} progress should be preserved`);
  }
}

console.log('D. Version check ...');
{
  const buildGradle = fs.readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
  auditRequires(/versionCode 18200/.test(buildGradle), 'versionCode must be 18200 for 1.82.0');
}

console.log('=== InfoSec Visible Topic Registry Audit passed ===');
