// =============================================================================
// NEXUS Academy - player progress storage + migration.
//
// Separate localStorage key from gameState.js (same pattern as
// competency.js), so this module can evolve independently and NEVER touches
// or risks breaking existing quest/mission save data.
//
// Only the DYNAMIC, per-player fields are persisted here (status, scores,
// unlocked lessons/exercises/tools, related missions). Static catalog fields
// (title, description, prerequisites, categoryId, topicId) always come from
// academyTopics.js. `getFullTopic()` merges both into the complete topic
// shape described in the data model.
//
// Migration contract:
//  - Missing fields are filled with catalog defaults.
//  - Existing progress is never discarded.
//  - New topics added later to academyTopics.js are seeded lazily the first
//    time they're read/written - no explicit migration step is needed per
//    new topic.
// =============================================================================
import { ACADEMY_TOPICS, topicKey } from './academyTopics.js';
import { LESSONS } from './academyLessonData.js';
import { APP_VERSION } from './version.js';
import { computeNextStatus } from './academyStatus.js';

const KEY = 'cyberlearn:academy-progress-v1';
// v4 adds per-topic lesson resume/tracking fields (startedAt, lastCompletedSectionId,
// completedSectionIds, completedQuestionIds, completedExerciseIds) so the
// LessonRunner can persist progress across sessions without awarding points
// for unfinished or repeated visits. Migration fills these automatically.
// v7 (Milestone C5.3): "tcp"/"udp"/"tcp-vs-udp" merged into "tcp-udp", and
// "kommunikationsarten"/"betriebsarten"/"ausbreitungsarten"/"uebertragungsmedien"
// merged into "kommunikation-uebertragung". migrateLegacyTopicMerges() below
// folds any pre-existing progress under the old topicIds into the new,
// merged topic before the normal per-topic migration runs.
// v8 (Milestone: Cisco-Struktur bereinigen): "cisco-packet-tracer/ip-
// configuration" merged into "cisco-packet-tracer/basic-device-
// configuration" (now titled "Grundkonfiguration & IP-Konfiguration").
// "packet-tracer-ui", "connect-end-devices" and "switch-basics" were
// removed outright (content-less placeholders, never had any lesson) -
// any pre-existing progress under those topicIds is simply dropped by the
// generic "topic no longer in catalog" handling below, same as usual.
// v9 (DHCP + Progression-Überarbeitung): introduces theoryCompletion so a
// full theory pass is recorded as 100 % theory progress independently of the
// smaller knowledge-check bumps stored in theoryScore. Existing saves are
// migrated: a previously completed lesson (contentSeenPercent 100 or
// lessonCompletions >= 1) becomes theoryCompletion 100.
// v10 (Stability & Save-Hygiene): introduces load-time sanitization of
// completedSectionIds, completedExerciseIds and completedQuestionIds against
// the current LESSONS registry. Removes phantom IDs and recomputes
// theoryCompletion/contentSeenPercent only from currently existing sections.
const STATE_VERSION = 11;

// Rough "best of" ordering for TOPIC_STATUS, used only to pick the most
// advanced status across a group of legacy topics being merged into one.
const STATUS_RANK = ['locked', 'available', 'started', 'learned', 'applied', 'consolidated'];

// Each entry merges progress from `oldKeys` (pre-Milestone-C5.3 topicIds,
// dropped from the catalog) into `newKey` (the new, merged topic). Purely a
// one-time save-data migration - the actual lesson content lives in
// academyLessons/tcpUdp.js and academyLessons/kommunikationUebertragung.js.
const LEGACY_TOPIC_MERGES = [
  { newKey: 'fundamentals/tcp-udp', oldKeys: ['fundamentals/tcp', 'fundamentals/udp', 'fundamentals/tcp-vs-udp'] },
  { newKey: 'fundamentals/kommunikation-uebertragung', oldKeys: ['fundamentals/kommunikationsarten', 'fundamentals/betriebsarten', 'fundamentals/ausbreitungsarten', 'fundamentals/uebertragungsmedien'] },
  { newKey: 'cisco-packet-tracer/basic-device-configuration', oldKeys: ['cisco-packet-tracer/ip-configuration'] },
  // v11: Active-Directory-Curriculum-Konsolidierung (1.93.0)
  { newKey: 'active-directory-virtualbox/ad-foundation', oldKeys: ['active-directory-virtualbox/domain'] },
  { newKey: 'active-directory-virtualbox/ad-install', oldKeys: ['active-directory-virtualbox/domain-controller'] },
  { newKey: 'active-directory-virtualbox/ad-groups', oldKeys: ['active-directory-virtualbox/ad-permissions', 'active-directory-virtualbox/ad-group-practice'] },
  { newKey: 'active-directory-virtualbox/ad-administration', oldKeys: ['active-directory-virtualbox/ad-mmc-basics', 'active-directory-virtualbox/ad-delegation'] },
  { newKey: 'active-directory-virtualbox/ad-trusts', oldKeys: ['active-directory-virtualbox/ad-fsmo-admin-groups'] },
  { newKey: 'active-directory-virtualbox/ad-replication-practice', oldKeys: ['active-directory-virtualbox/ad-replication-site-config', 'active-directory-virtualbox/ad-recycle-bin'] },
  { newKey: 'active-directory-virtualbox/windows-server', oldKeys: ['active-directory-virtualbox/shares'] },
];

// Returns a copy of `savedTopics` where, for every LEGACY_TOPIC_MERGES entry
// that has progress under any of its `oldKeys`, a combined entry is written
// under `newKey` (numeric fields take the max across the group, status takes
// the most advanced one, array fields are unioned). Old keys are left as-is;
// the generic per-topic migration loop drops them afterward since they no
// longer exist in the current catalog.
function migrateLegacyTopicMerges(savedTopics) {
  const result = { ...savedTopics };
  LEGACY_TOPIC_MERGES.forEach(({ newKey, oldKeys }) => {
    const legacyEntries = oldKeys.map((k) => savedTopics[k]).filter(Boolean);
    if (legacyEntries.length === 0) return;
    const combined = legacyEntries.reduce((acc, entry) => ({
      status: STATUS_RANK.indexOf(entry.status) > STATUS_RANK.indexOf(acc.status) ? entry.status : acc.status,
      theoryScore: Math.max(acc.theoryScore, Number(entry.theoryScore) || 0),
      practiceScore: Math.max(acc.practiceScore, Number(entry.practiceScore) || 0),
      retentionScore: Math.max(acc.retentionScore, Number(entry.retentionScore) || 0),
      contentSeenPercent: Math.max(acc.contentSeenPercent, Number(entry.contentSeenPercent) || 0),
      lessonCompletions: Math.max(acc.lessonCompletions, Number(entry.lessonCompletions) || 0),
      quizAttempts: Math.max(acc.quizAttempts, Number(entry.quizAttempts) || 0),
      quizPerfectCount: Math.max(acc.quizPerfectCount, Number(entry.quizPerfectCount) || 0),
      quizBestScore: Math.max(acc.quizBestScore, Number(entry.quizBestScore) || 0),
      completedSectionIds: [...new Set([...acc.completedSectionIds, ...(entry.completedSectionIds || [])])],
      completedQuestionIds: [...new Set([...acc.completedQuestionIds, ...(entry.completedQuestionIds || [])])],
      completedExerciseIds: [...new Set([...acc.completedExerciseIds, ...(entry.completedExerciseIds || [])])],
    }), {
      status: 'locked', theoryScore: 0, practiceScore: 0, retentionScore: 0, contentSeenPercent: 0,
      lessonCompletions: 0, quizAttempts: 0, quizPerfectCount: 0, quizBestScore: 0,
      completedSectionIds: [], completedQuestionIds: [], completedExerciseIds: [],
    });
    result[newKey] = { ...(result[newKey] || {}), ...combined };
  });
  return result;
}

function defaultProgressForTopic(topicDef) {
  return {
    status: topicDef.status,
    theoryScore: topicDef.theoryScore,
    practiceScore: topicDef.practiceScore,
    retentionScore: topicDef.retentionScore,
    appliedCount: 0,
    repetitionCount: 0,
    availableLessons: [...topicDef.availableLessons],
    availableExercises: [...topicDef.availableExercises],
    unlockedTools: [...topicDef.unlockedTools],
    relatedMissions: [...topicDef.relatedMissions],
    relatedSideMissions: [...topicDef.relatedSideMissions],
    theoryCompletion: 0,
    startedAt: null,
    lastCompletedSectionId: null,
    lastCompletedSectionTitle: null,
    completedSectionIds: [],
    completedQuestionIds: [],
    completedExerciseIds: [],
    lastExplanationStyle: null,
    lessonCompletions: 0,
    contentSeenPercent: 0,
    quizAttempts: 0,
    quizPerfectCount: 0,
    quizPerfectStreak: 0,
    quizBestScore: 0,
    quizLastScore: 0,
    difficultyLevel: 0, // 0=easy, 1=medium, 2=hard
    difficultyExamsPassed: [], // e.g. [0, 1] means easy+medium exams passed
    version: topicDef.version,
  };
}

function cloneDefaults() {
  const topics = {};
  ACADEMY_TOPICS.forEach((topicDef) => {
    topics[topicKey(topicDef.categoryId, topicDef.topicId)] = defaultProgressForTopic(topicDef);
  });
  return {
    stateVersion: STATE_VERSION,
    playerProfile: { preferredExplanationStyle: null },
    topics,
  };
}

// Merges a saved progress blob onto fresh catalog defaults:
//  - every topic currently in the catalog is guaranteed to exist afterward
//  - any progress already saved for a still-existing topic is preserved
//  - progress for topics that no longer exist in the catalog is silently
//    dropped (keeps the store from accumulating orphaned entries)
function migrateProgress(saved) {
  const base = cloneDefaults();
  if (!saved || typeof saved !== 'object') return base;
  const merged = {
    stateVersion: STATE_VERSION,
    playerProfile: { ...base.playerProfile, ...(saved.playerProfile || {}) },
    topics: { ...base.topics },
  };
  const savedTopics = migrateLegacyTopicMerges(saved.topics || {});
  Object.entries(savedTopics).forEach(([key, value]) => {
    // Fresh defaults (incl. any newly-added fields like appliedCount) are
    // spread FIRST, then the old saved value is layered on top - fields the
    // old save doesn't know about simply keep their default.
    if (!merged.topics[key]) return;
    const migrated = { ...merged.topics[key], ...value };
    // v9: seed theoryCompletion from existing progress. A topic that already
    // completed its full theory run is marked as 100 % theory complete; an
    // in-progress topic inherits whatever content-seen value was already
    // recorded. This never reduces an existing 100 % value.
    if (value.theoryCompletion === undefined || value.theoryCompletion === null) {
      if ((value.contentSeenPercent || 0) >= 100 || (value.lessonCompletions || 0) >= 1) {
        migrated.theoryCompletion = 100;
      } else if (typeof value.contentSeenPercent === 'number' && value.contentSeenPercent > 0) {
        migrated.theoryCompletion = value.contentSeenPercent;
      } else {
        migrated.theoryCompletion = 0;
      }
    }
    // v5: normalize legacy score values to a clean 0-100 integer range.
    // Older saves might have stored fractional 0-1 values or accidentally
    // inflated numbers. Values <=1 are treated as fractions and scaled; all
    // values are clamped to 0-100.
    ['theoryScore', 'practiceScore', 'retentionScore'].forEach((field) => {
      const raw = Number(migrated[field]) || 0;
      const scaled = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
      migrated[field] = Math.max(0, Math.min(100, scaled));
    });
    merged.topics[key] = migrated;
  });
  return sanitizeProgress(merged);
}

function uniqueNonEmpty(arr) {
  return [...new Set((arr || []).filter((x) => x && typeof x === 'string'))];
}

// Returns the derived section ids and total section count for a lesson.
// Sections are identified by the short `sectionId` (part before the last dash
// in an explanation's id) because `LessonRunner` records completions per
// section, not per individual explanation style.
function getLessonSectionInfo(key) {
  const lesson = LESSONS[key];
  if (!lesson || !Array.isArray(lesson.explanations)) {
    return { validSectionIds: new Set(), validExplanationIds: new Set(), total: 0 };
  }
  const validExplanationIds = new Set(lesson.explanations.map((e) => e.id).filter(Boolean));
  const validSectionIds = new Set();
  lesson.explanations.forEach((e) => {
    const dash = (e.id || '').lastIndexOf('-');
    const sid = e.sectionId || (dash > 0 ? e.id.slice(0, dash) : e.id);
    if (sid) validSectionIds.add(sid);
  });
  return { validSectionIds, validExplanationIds, total: validSectionIds.size };
}

// Normalizes a saved section/explanation id to the short section id we use.
function normalizeToSectionId(id, validSectionIds, validExplanationIds) {
  if (validSectionIds.has(id)) return id;
  if (!validExplanationIds.has(id)) return null;
  const dash = id.lastIndexOf('-');
  const sid = dash > 0 ? id.slice(0, dash) : id;
  return validSectionIds.has(sid) ? sid : null;
}

// Derives a legacy floor for theory completion / content seen from all
// historically reliable completion markers. A full (100 %) floor is only
// returned for evidence that the learner finished the entire lesson:
//   - the topic was recorded as completed at least once (lessonCompletions >= 1)
//   - the stored theoryCompletion is already 100 %
//   - the stored contentSeenPercent is already 100 %
//   - all currently known sections were recorded as completed
// For everything else the floor is the best partial value we can derive from
// the same content markers. `theoryScore` and `status` are intentionally NOT
// used here: theoryScore is a fine-grained knowledge score, not proof of full
// content completion, and `learned` status only needs minTheoryScore 25.
function deriveLegacyTheoryFloor(progress, key) {
  const { validSectionIds, validExplanationIds, total: totalSections } = getLessonSectionInfo(key);
  const completedSectionIds = uniqueNonEmpty(progress.completedSectionIds)
    .map((id) => normalizeToSectionId(id, validSectionIds, validExplanationIds))
    .filter(Boolean);
  const computed = totalSections > 0 ? Math.round((completedSectionIds.length / totalSections) * 100) : 0;

  const lessonCompleted = (progress.lessonCompletions || 0) >= 1;
  const theoryCompletion = progress.theoryCompletion || 0;
  const contentSeenPercent = progress.contentSeenPercent || 0;

  if (lessonCompleted || theoryCompletion >= 100 || contentSeenPercent >= 100) return 100;
  if (totalSections > 0 && completedSectionIds.length >= totalSections) return 100;

  return Math.max(theoryCompletion, contentSeenPercent, computed);
}

function sanitizeTopicProgress(key, progress, currentVersion) {
  const { validSectionIds, validExplanationIds, total: totalSections } = getLessonSectionInfo(key);
  const validExerciseIds = new Set(LESSONS[key]?.exercises?.map((e) => e.id) || []);

  const seenSectionIds = new Set();
  const sectionIds = [];
  uniqueNonEmpty(progress.completedSectionIds).forEach((id) => {
    const sid = normalizeToSectionId(id, validSectionIds, validExplanationIds);
    if (sid && !seenSectionIds.has(sid)) {
      seenSectionIds.add(sid);
      sectionIds.push(sid);
    }
  });
  const exerciseIds = uniqueNonEmpty(progress.completedExerciseIds).filter((id) => validExerciseIds.has(id));
  const questionIds = uniqueNonEmpty(progress.completedQuestionIds);

  let lastSectionId = progress.lastCompletedSectionId;
  let lastSectionTitle = progress.lastCompletedSectionTitle;
  if (!validSectionIds.has(lastSectionId)) {
    lastSectionId = sectionIds.length ? sectionIds[sectionIds.length - 1] : null;
    lastSectionTitle = null;
  }

  // Monotonic theory rule: a previously measured theory or content-seen value
  // is never reduced just because the underlying section IDs no longer match
  // the current lesson registry. This preserves legitimate player progress
  // across content updates while still back-filling exact section progress
  // when the saved IDs are still valid.
  const computedTheory = totalSections > 0 ? Math.round((sectionIds.length / totalSections) * 100) : 0;
  const computedSeen = totalSections > 0 ? Math.round((sectionIds.length / totalSections) * 100) : 0;
  const legacyTheoryFloor = deriveLegacyTheoryFloor(progress, key);
  const nextTheoryCompletion = Math.max(progress.theoryCompletion || 0, computedTheory, legacyTheoryFloor);
  const nextContentSeen = Math.max(progress.contentSeenPercent || 0, computedSeen, legacyTheoryFloor);

  const normalized = {
    ...progress,
    completedSectionIds: sectionIds,
    completedQuestionIds: questionIds,
    completedExerciseIds: exerciseIds,
    lastCompletedSectionId: lastSectionId,
    lastCompletedSectionTitle: lastSectionTitle,
    theoryCompletion: nextTheoryCompletion,
    contentSeenPercent: nextContentSeen,
    version: currentVersion,
  };
  normalized.status = computeNextStatus(normalized);
  return normalized;
}

function sanitizeProgress(data) {
  if (!data || typeof data !== 'object' || !data.topics) return cloneDefaults();
  const next = { ...data, stateVersion: STATE_VERSION, topics: {} };
  ACADEMY_TOPICS.forEach((topicDef) => {
    const key = topicKey(topicDef.categoryId, topicDef.topicId);
    const progress = data.topics[key];
    if (!progress || typeof progress !== 'object') {
      next.topics[key] = defaultProgressForTopic(topicDef);
    } else {
      next.topics[key] = sanitizeTopicProgress(key, { ...defaultProgressForTopic(topicDef), ...progress }, topicDef.version);
    }
  });
  return next;
}

export function readAcademyProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return migrateProgress(saved);
  } catch {
    return cloneDefaults();
  }
}

export function writeAcademyProgress(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('cyberlearn:academy-progress'));
  return data;
}

export function getTopicProgress(categoryId, topicId) {
  return readAcademyProgress().topics[topicKey(categoryId, topicId)] || null;
}

// Returns the full merged topic record (catalog + player progress) matching
// the data model: categoryId, topicId, title, description, prerequisites,
// status, theoryScore, practiceScore, retentionScore, availableLessons,
// availableExercises, unlockedTools, relatedMissions, relatedSideMissions,
// version.
export function getFullTopic(categoryId, topicId) {
  const topicDef = ACADEMY_TOPICS.find((t) => t.categoryId === categoryId && t.topicId === topicId);
  if (!topicDef) return null;
  const progress = getTopicProgress(categoryId, topicId) || defaultProgressForTopic(topicDef);
  return { ...topicDef, ...progress };
}

export function getAllFullTopics() {
  return ACADEMY_TOPICS.map((topicDef) => getFullTopic(topicDef.categoryId, topicDef.topicId));
}

// Updates a topic's progress fields (shallow-merges the given patch).
// Intentionally the ONLY write path - no scoring/unlock logic lives here yet,
// callers decide what to write (kept minimal for this foundation step).
export function updateTopicProgress(categoryId, topicId, patch) {
  const data = readAcademyProgress();
  const key = topicKey(categoryId, topicId);
  if (!data.topics[key]) return data;
  data.topics[key] = { ...data.topics[key], ...patch };
  return writeAcademyProgress(data);
}

// Resets ONLY the lesson-resume fields for a single topic so the player can
// restart a lesson from scratch. Does NOT touch status, scores, or other
// topic-level progress. Safe to call from the error-recovery UI.
export function resetTopicLessonState(categoryId, topicId) {
  const data = readAcademyProgress();
  const key = topicKey(categoryId, topicId);
  if (!data.topics[key]) return;
  Object.assign(data.topics[key], {
    startedAt: null,
    lastCompletedSectionId: null,
    lastCompletedSectionTitle: null,
    completedSectionIds: [],
    completedQuestionIds: [],
    completedExerciseIds: [],
    lastExplanationStyle: null,
  });
  writeAcademyProgress(data);
}

const ALLOWED_IMPORT_KEYS = [
  'cyberlearn:academy-progress-v1',
  'cyberlearn:academy-mode-v1',
  'cyberlearn:themencheck-results-v1',
  'cyberlearn:academy-intro-seen',
];

function isAllowedImportKey(key) {
  if (ALLOWED_IMPORT_KEYS.includes(key)) return true;
  return typeof key === 'string' && (key.startsWith('cyberlearn:') || key === 'academy-intro-seen');
}

export function exportAcademySave() {
  const storage = {};
  for (let i = 0; i < (localStorage?.length || 0); i += 1) {
    const k = localStorage.key(i);
    if (k && isAllowedImportKey(k)) {
      storage[k] = localStorage.getItem(k);
    }
  }
  return {
    format: 'cyberlearn-save-v1',
    appVersion: APP_VERSION,
    stateVersion: STATE_VERSION,
    exportedAt: new Date().toISOString(),
    storage,
  };
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function importAcademySave(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Ungültiges Import-Format');
  if (payload.format !== 'cyberlearn-save-v1') throw new Error('Unbekanntes Save-Format');
  if (!payload.storage || typeof payload.storage !== 'object') throw new Error('Kein gespeicherter Inhalt');

  Object.entries(payload.storage).forEach(([key, raw]) => {
    if (!isAllowedImportKey(key)) return;
    if (typeof raw !== 'string' && typeof raw !== 'object') return;
    const value = typeof raw === 'string' ? raw : JSON.stringify(raw);
    if (key === 'cyberlearn:academy-progress-v1') {
      const parsed = safeJsonParse(value);
      if (parsed && (typeof parsed !== 'object' || !parsed.topics)) {
        throw new Error('Academy-Progress enthält keine gültigen Topics');
      }
    }
    localStorage.setItem(key, value);
  });

  window.dispatchEvent(new Event('cyberlearn:academy-progress'));
  return true;
}
