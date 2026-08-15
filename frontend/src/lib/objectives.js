import { ACADEMY_TOPICS, topicKey } from './academyTopics.js';
import { getFullTopic, getTopicProgress } from './academyProgress.js';
import {
  topicOverallProgress, isTopicMastered,
} from './academyEngine.js';
import { readGameState } from './gameState.js';
import { quests, questById } from './questData.js';
import { sortedInbox } from './sideMissionEngine.js';
import { getTopicScoreDimensions } from './academyLessonData.js';
import { readEmails } from './emails.js';
import { readNotifications, pendingNotifications, notificationTypes } from './notificationSystem.js';
import { colleagues } from './officeWorld.js';
import { isMainMission } from './missionV2.js';
import { isCiscoSideMission } from './ciscoSideMissions.js';
import { isProceduralMissionId, instanceIdFromMissionId, getInstance } from './missionGenerator.js';

const SIDE_MISSION_TITLES = {
  'cisco-side-basic-001': 'Die offene Konsole',
  'cisco-side-basic-002': 'Passwörter auf dem Präsentierteller',
  'cisco-side-basic-003': 'Wer darf sich anmelden?',
  'cisco-side-l2-001': 'Offene Türen',
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
  const completedCiscoSide = new Set(state.completedCiscoSideMissions || []);

  const ordered = quests.slice().sort((a, b) => a.chapter - b.chapter);
  for (const quest of ordered) {
    if (completed.includes(quest.id)) continue;
    const previousDone = (quest.requires || []).every((id) => completed.includes(id));
    const requiredCiscoSides = quest.sideMissionsRequired || [];
    const neededSide = requiredCiscoSides.length
      ? requiredCiscoSides.length
      : Math.max(0, (quest.chapter - 1) * SIDE_MISSIONS_PER_MAIN_QUEST);
    const missingCiscoSides = requiredCiscoSides.filter((id) => !completedCiscoSide.has(id));
    const missingSideCount = requiredCiscoSides.length
      ? missingCiscoSides.length
      : Math.max(0, neededSide - totalSideCount);
    const missingSide = missingSideCount > 0;
    const isGate = quest.gate;
    const missingPrevious = (quest.requires || []).filter((id) => !completed.includes(id));
    const locked = !previousDone || missingSide || isGate;
    const reasons = [];
    if (isGate) reasons.push('Der nächste Hauptauftrag wird noch vorbereitet.');
    if (missingPrevious.length) reasons.push(`Schließe zuerst ab: ${missingPrevious.map((id) => questById(id)?.title || id).join(', ')}`);
    if (missingSide) {
      reasons.push(`Noch ${missingSideCount} Nebenmission${missingSideCount === 1 ? '' : 'en'} erforderlich`);
    }
    return {
      type: 'main',
      quest,
      available: !locked,
      reasons: locked ? reasons : [],
      sideProgress: { completed: requiredCiscoSides.length ? requiredCiscoSides.length - missingCiscoSides.length : totalSideCount, needed: neededSide },
    };
  }
  return null;
}

export function getRecommendedSideMissions(limit = 2) {
  const state = readGameState();
  const open = sortedInbox().filter((item) => !item.resolved);
  const ciscoSideCompleted = new Set(state.completedCiscoSideMissions || []);

  const ciscoSideMissions = [];
  if (state.completedQuests.includes('cisco-main-001')) {
    // Basic side missions 001-003 are available after Mission 001.
    const basicSides = ['cisco-side-basic-001', 'cisco-side-basic-002', 'cisco-side-basic-003'];
    for (const id of basicSides) {
      if (!ciscoSideCompleted.has(id)) {
        ciscoSideMissions.push({ type: 'side', id, title: SIDE_MISSION_TITLES[id], priority: 'P2' });
      }
    }
  }
  if (state.completedQuests.includes('cisco-main-002')) {
    // L2 security side mission becomes available after Mission 002.
    if (!ciscoSideCompleted.has('cisco-side-l2-001')) {
      ciscoSideMissions.push({ type: 'side', id: 'cisco-side-l2-001', title: SIDE_MISSION_TITLES['cisco-side-l2-001'], priority: 'P2' });
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

// ============================================================================
// Central relevance/priority scoring (Phase 1G, item 6).
//
// "WAS KANN ODER SOLL DER SPIELER JETZT SINNVOLL TUN?" - a single numeric
// scale used by every objective candidate, so the ObjectivePanel (and any
// other UI) never needs its own if/else priority ladder. Higher wins.
// ============================================================================
export const RELEVANCE_TIER = {
  ACTIVE_MISSION: 100,
  URGENT_STORY_EVENT: 95,
  UNREAD_MISSION_COMMUNICATION: 90,
  AVAILABLE_PROGRESSION_MISSION: 80,
  AVAILABLE_SIDE_MISSION: 70,
  ADAPTIVE_REPETITION: 30,
  LOCKED_FUTURE_MAIN_READY: 20,
  LOCKED_FUTURE_MAIN: 10,
  FUTURE_INFO: 5,
  NONE: 0,
};

// The mission the player is currently, actively working on (Terminal/Mission
// page open right now). This always outranks everything else - there is
// nothing "more relevant" than the thing already in progress.
export function getActiveMissionObjective(state = readGameState()) {
  const missionId = state.activeQuest;
  if (!missionId) return null;
  if (isProceduralMissionId(missionId)) {
    const instance = getInstance(instanceIdFromMissionId(missionId));
    if (!instance) return null;
    return { type: 'active', missionId, title: instance.title };
  }
  if (isMainMission(missionId)) {
    const quest = questById(missionId);
    return { type: 'active', missionId, title: quest?.title || missionId };
  }
  if (isCiscoSideMission(missionId)) {
    const title = SIDE_MISSION_TITLES[missionId] || missionId;
    return { type: 'active', missionId, title };
  }
  return null;
}

function isMissionAlreadyCompleted(missionId, state) {
  return (state.completedQuests || []).includes(missionId)
    || (state.completedCiscoSideMissions || []).includes(missionId)
    || (state.completedSideMissions || []).includes(missionId);
}

// An unread email or an un-acknowledged phone call that is linked to a
// mission. This is the "sehr hohe Relevanz" tier: the player has not even
// looked at the in-world anchor yet, so it outranks "just" a generally
// available mission that they already know about. Mail/calls for a mission
// the player already finished (e.g. read the mail late) are no longer an
// urgent nudge, so completed missions are excluded here.
export function getUnreadMissionCommunication(state = readGameState()) {
  const unreadMail = readEmails().find((e) => !e.read && e.linkedMissionId && !isMissionAlreadyCompleted(e.linkedMissionId, state));
  if (unreadMail) {
    return {
      type: 'communication',
      channel: 'email',
      missionId: unreadMail.linkedMissionId,
      title: `Neue Mail von ${unreadMail.from?.name || 'Sam'} lesen`,
      subject: unreadMail.subject,
    };
  }
  const pendingCall = pendingNotifications(readNotifications())
    .find((n) => n.type === notificationTypes.PHONE && n.linkedMissionId && !isMissionAlreadyCompleted(n.linkedMissionId, state));
  if (pendingCall) {
    const person = colleagues.find((c) => c.id === pendingCall.source?.personId);
    return {
      type: 'communication',
      channel: 'phone',
      missionId: pendingCall.linkedMissionId,
      title: `Nachricht von ${person?.name || 'einem Kollegen'} abhören`,
      subject: pendingCall.title,
    };
  }
  const pendingTicket = pendingNotifications(readNotifications())
    .find((n) => n.type === notificationTypes.TICKET && n.linkedMissionId && !isMissionAlreadyCompleted(n.linkedMissionId, state));
  if (pendingTicket) {
    return {
      type: 'communication',
      channel: 'ticket',
      missionId: pendingTicket.linkedMissionId,
      title: 'Neues Ticket ansehen',
      subject: pendingTicket.title,
    };
  }
  return null;
}

function relevanceForMain(main) {
  if (!main) return RELEVANCE_TIER.NONE;
  if (main.available) return RELEVANCE_TIER.AVAILABLE_PROGRESSION_MISSION;
  const sideSatisfied = main.sideProgress && main.sideProgress.completed >= main.sideProgress.needed;
  if (main.quest?.gate && sideSatisfied) return RELEVANCE_TIER.LOCKED_FUTURE_MAIN_READY;
  if (main.quest?.gate) return RELEVANCE_TIER.LOCKED_FUTURE_MAIN;
  return RELEVANCE_TIER.FUTURE_INFO;
}

function relevanceForSide(side, state) {
  if (!side || side.length === 0) return RELEVANCE_TIER.NONE;
  // Cisco side missions are progress-relevant until the next main gate is satisfied.
  const completed = (state.completedSideMissions || []).length + (state.completedCiscoSideMissions || []).length;
  const nextMain = getNextMainMission();
  const needed = nextMain ? nextMain.sideProgress?.needed || 0 : 0;
  const progressRelevant = nextMain && nextMain.quest?.gate && completed < needed;
  return progressRelevant ? RELEVANCE_TIER.AVAILABLE_PROGRESSION_MISSION - 5 : RELEVANCE_TIER.AVAILABLE_SIDE_MISSION;
}

function relevanceForLearning(learning) {
  return learning ? RELEVANCE_TIER.ADAPTIVE_REPETITION : RELEVANCE_TIER.NONE;
}

export function getCurrentPlayerObjectives() {
  const state = readGameState();
  const active = getActiveMissionObjective(state);
  const communication = active ? null : getUnreadMissionCommunication(state);
  const learning = getRecommendedLearningTopic();
  const main = getNextMainMission();
  const side = getRecommendedSideMissions(2);

  return {
    active,
    communication,
    learning,
    main,
    side,
    relevance: {
      active: active ? RELEVANCE_TIER.ACTIVE_MISSION : RELEVANCE_TIER.NONE,
      communication: communication ? RELEVANCE_TIER.UNREAD_MISSION_COMMUNICATION : RELEVANCE_TIER.NONE,
      learning: relevanceForLearning(learning),
      main: relevanceForMain(main),
      side: relevanceForSide(side, state),
    },
  };
}

// Concrete, actionable label for a given top-objective entry - never a bare
// "Verfügbar". See item 6 of the Phase 1G brief for the expected wording.
export function getObjectiveLabel(entry) {
  if (!entry) return 'Alle Ziele abgeschlossen';
  switch (entry.key) {
    case 'active':
    case 'communication':
      return entry.item.title;
    case 'main':
      return entry.item.quest?.title || 'Verfügbar';
    case 'side':
      return entry.item[0]?.title || 'Verfügbar';
    case 'learning':
      return entry.item.title || 'Verfügbar';
    default:
      return 'Verfügbar';
  }
}

export function getTopObjective(objectives = getCurrentPlayerObjectives()) {
  const entries = [
    { key: 'active', item: objectives.active, score: objectives.relevance.active },
    { key: 'communication', item: objectives.communication, score: objectives.relevance.communication },
    { key: 'main', item: objectives.main, score: objectives.relevance.main },
    { key: 'side', item: objectives.side, score: objectives.relevance.side },
    { key: 'learning', item: objectives.learning, score: objectives.relevance.learning },
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
