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
const STATE_VERSION = 7;

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
  return merged;
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
