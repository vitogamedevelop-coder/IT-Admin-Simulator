import { ACADEMY_TOPICS, topicKey } from './academyTopics.js';
import { getFullTopic, getTopicProgress } from './academyProgress.js';
import {
  topicOverallProgress, isTopicMastered,
} from './academyEngine.js';
import { readGameState } from './gameState.js';
import { quests, questById } from './questData.js';
import { sortedInbox } from './sideMissionEngine.js';
import { getTopicScoreDimensions } from './academyLessonData.js';

const SIDE_MISSION_TITLES = {
  'cisco-side-basic-001': 'Die offene Konsole',
  'cisco-side-basic-002': 'Passwörter auf dem Präsentierteller',
  'cisco-side-basic-003': 'Wer darf sich anmelden?',
};

// Ordered "first learning round" sequence within the fundamentals category.
// Topics appear here only once and define the breadth-first progression.
export const FUNDAMENTALS_COURSE_ORDER = [
  'fundamentals/grundbegriffe',
  'fundamentals/topologien',
  'fundamentals/osi-model',
  'fundamentals/tcp-ip-model',
  'fundamentals/binary-system',
  'fundamentals/ipv4',
  'fundamentals/subnet-masks',
  'fundamentals/subnetting',
];

const SIDE_MISSIONS_PER_MAIN_QUEST = 2;

function byCourseOrder(a, b) {
  const ai = FUNDAMENTALS_COURSE_ORDER.indexOf(topicKey(a.categoryId, a.topicId));
  const bi = FUNDAMENTALS_COURSE_ORDER.indexOf(topicKey(b.categoryId, b.topicId));
  const fallbackA = ACADEMY_TOPICS.indexOf(a);
  const fallbackB = ACADEMY_TOPICS.indexOf(b);
  if (ai >= 0 && bi >= 0) return ai - bi;
  if (ai >= 0) return -1;
  if (bi >= 0) return 1;
  return fallbackA - fallbackB;
}

export function allAvailableTopics() {
  return ACADEMY_TOPICS.filter((t) => {
    const tp = getTopicProgress(t.categoryId, t.topicId);
    return tp && tp.status !== 'locked';
  });
}

function topicHasPractice(topic) {
  return !!getTopicScoreDimensions(topic.categoryId, topic.topicId).practice;
}

function isMastered(topic) {
  return isTopicMastered(topic.categoryId, topic.topicId, topicHasPractice(topic));
}

export function getRecommendedLearningTopic() {
  const available = allAvailableTopics();
  if (!available.length) return null;

  // Phase 1: breadth-first until every course topic reached 30 % at least once.
  const under30 = available
    .filter((t) => topicOverallProgress(getFullTopic(t.categoryId, t.topicId)) < 30 && !isMastered(t))
    .sort(byCourseOrder);
  if (under30.length) {
    const topic = under30[0];
    return {
      type: 'learning',
      categoryId: topic.categoryId,
      topicId: topic.topicId,
      title: topic.title,
      reason: 'Empfohlen, weil du dieses Thema bisher am wenigsten bearbeitet hast.',
      progress: topicOverallProgress(getFullTopic(topic.categoryId, topic.topicId)),
      nextStepText: 'Starte die Einführung, um die ersten Grundlagen zu sehen.',
    };
  }

  // Phase 2: weakest non-mastered topic.
  const nonMastered = available.filter((t) => !isMastered(t));
  if (!nonMastered.length) return null;
  const weakest = nonMastered
    .slice()
    .sort((a, b) => {
      const pa = topicOverallProgress(getFullTopic(a.categoryId, a.topicId));
      const pb = topicOverallProgress(getFullTopic(b.categoryId, b.topicId));
      if (pa !== pb) return pa - pb;
      return byCourseOrder(a, b);
    })[0];
  const full = getFullTopic(weakest.categoryId, weakest.topicId);
  let nextStepText = 'Wiederhole das Thema, um es festigen.';
  if ((full.contentSeenPercent || 0) < 100) nextStepText = 'Schließe die restlichen Erklärungen ab.';
  else if ((full.quizPerfectCount || 0) < 3) {
    nextStepText = `Fehlerfreie Quizze: ${full.quizPerfectCount || 0} / 3`;
  } else if (topicHasPractice(weakest) && full.practiceScore < 30) {
    nextStepText = 'Wende das Wissen in einer Übung oder Mission an.';
  }
  return {
    type: 'learning',
    categoryId: weakest.categoryId,
    topicId: weakest.topicId,
    title: weakest.title,
    reason: 'Empfohlen, weil dieses Thema noch nicht vollständig sitzt.',
    progress: topicOverallProgress(full),
    nextStepText,
  };
}

export function getNextMainMission() {
  const state = readGameState();
  const completed = state.completedQuests || [];
  const sideCount = (state.completedSideMissions || []).length;
  const ciscoSideCount = (state.completedCiscoSideMissions || []).length;
  const totalSideCount = sideCount + ciscoSideCount;

  const ordered = quests.slice().sort((a, b) => a.chapter - b.chapter);
  for (const quest of ordered) {
    if (completed.includes(quest.id)) continue;
    const previousDone = (quest.requires || []).every((id) => completed.includes(id));
    const neededSide = Math.max(0, (quest.chapter - 1) * SIDE_MISSIONS_PER_MAIN_QUEST);
    const missingSide = totalSideCount < neededSide;
    const isGate = quest.gate;
    const missingPrevious = (quest.requires || []).filter((id) => !completed.includes(id));
    const locked = !previousDone || missingSide || isGate;
    const reasons = [];
    if (isGate) reasons.push('Der nächste Hauptauftrag wird noch vorbereitet.');
    if (missingPrevious.length) reasons.push(`Schließe zuerst ab: ${missingPrevious.map((id) => questById(id)?.title || id).join(', ')}`);
    if (missingSide) reasons.push(`Noch ${neededSide - totalSideCount} Nebenmission${neededSide - totalSideCount === 1 ? '' : 'en'} erforderlich`);
    return {
      type: 'main',
      quest,
      available: !locked,
      reasons: locked ? reasons : [],
      sideProgress: { completed: totalSideCount, needed: neededSide },
    };
  }
  return null;
}

export function getRecommendedSideMissions(limit = 2) {
  const state = readGameState();
  const open = sortedInbox().filter((item) => !item.resolved);
  const ciscoSideCompleted = new Set(state.completedCiscoSideMissions || []);

  // Cisco side missions become available once Mission 001 is complete and are
  // recommended until at least two of them have been completed (story gate).
  const ciscoSideMissions = [];
  if (state.completedQuests.includes('cisco-main-001')) {
    const allCiscoSide = Object.keys(SIDE_MISSION_TITLES);
    for (const id of allCiscoSide) {
      if (!ciscoSideCompleted.has(id)) {
        ciscoSideMissions.push({ type: 'side', id, title: SIDE_MISSION_TITLES[id], priority: 'P2' });
      }
    }
  }

  const seenTopics = new Set();
  const result = [];
  for (const mission of [...ciscoSideMissions, ...open]) {
    if (seenTopics.has(mission.topic)) continue;
    seenTopics.add(mission.topic);
    result.push(mission);
    if (result.length >= limit) break;
  }
  return result;
}

function relevanceForMain(main) {
  if (!main) return 0;
  if (main.available) return 90;
  const sideSatisfied = main.sideProgress && main.sideProgress.completed >= main.sideProgress.needed;
  if (main.quest?.gate && sideSatisfied) return 60;
  if (main.quest?.gate) return 10;
  return 20;
}

function relevanceForSide(side, state) {
  if (!side || side.length === 0) return 0;
  // Cisco side missions are progress-relevant until the next main gate is satisfied.
  const completed = (state.completedSideMissions || []).length + (state.completedCiscoSideMissions || []).length;
  const nextMain = getNextMainMission();
  const needed = nextMain ? nextMain.sideProgress?.needed || 0 : 0;
  const progressRelevant = nextMain && nextMain.quest?.gate && completed < needed;
  return progressRelevant ? 80 : 40;
}

function relevanceForLearning(learning) {
  return learning ? 30 : 0;
}

export function getCurrentPlayerObjectives() {
  const state = readGameState();
  const learning = getRecommendedLearningTopic();
  const main = getNextMainMission();
  const side = getRecommendedSideMissions(2);

  return {
    learning,
    main,
    side,
    relevance: {
      learning: relevanceForLearning(learning),
      main: relevanceForMain(main),
      side: relevanceForSide(side, state),
    },
  };
}

export function getTopObjective(objectives = getCurrentPlayerObjectives()) {
  const entries = [
    { key: 'learning', item: objectives.learning, score: objectives.relevance.learning },
    { key: 'main', item: objectives.main, score: objectives.relevance.main },
    { key: 'side', item: objectives.side, score: objectives.relevance.side },
  ];
  const sorted = entries.filter((e) => e.item && e.score > 0).sort((a, b) => b.score - a.score);
  return sorted[0] || null;
}

// Map side-mission topics to the Academy topic that should receive retention points.
export function academyTopicForSideMission(topicName) {
  const map = {
    'DHCP': { categoryId: 'fundamentals', topicId: 'dhcp' },
    'DNS': { categoryId: 'fundamentals', topicId: 'dns' },
    'Netzwerk': { categoryId: 'fundamentals', topicId: 'grundbegriffe' },
    'IPv4': { categoryId: 'fundamentals', topicId: 'ipv4' },
    'OSI-Modell': { categoryId: 'fundamentals', topicId: 'osi-model' },
    'Subnetting': { categoryId: 'fundamentals', topicId: 'subnetting' },
  };
  return map[topicName] || null;
}
