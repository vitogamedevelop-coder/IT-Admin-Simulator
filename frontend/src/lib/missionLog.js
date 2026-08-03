// Persistent Mission Log
// Tracks the lifecycle of every mission instance the player encounters.
// Survives app restarts via localStorage.

const KEY = 'cyberlearn:mission-log-v1';

export const MissionStatus = {
  AVAILABLE: 'available',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DECLINED: 'declined',
  EXPIRED: 'expired',
};

export function readMissionLog() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { missions: {} };
  } catch {
    return { missions: {} };
  }
}

function writeMissionLog(log) {
  localStorage.setItem(KEY, JSON.stringify(log));
  window.dispatchEvent(new Event('cyberlearn:mission-log'));
  return log;
}

// Get or create a mission entry
export function getMissionEntry(instanceId) {
  const log = readMissionLog();
  return log.missions[instanceId] || null;
}

// Register a new mission instance
export function registerMission({ instanceId, questId, source, title }) {
  const log = readMissionLog();
  if (log.missions[instanceId]) return log.missions[instanceId];
  log.missions[instanceId] = {
    instanceId,
    questId,
    source, // 'email' | 'phone' | 'hallway' | 'inbox' | 'notification'
    title,
    status: MissionStatus.AVAILABLE,
    createdAt: Date.now(),
    acceptedAt: null,
    completedAt: null,
    declinedAt: null,
    attemptCount: 0,
  };
  writeMissionLog(log);
  return log.missions[instanceId];
}

// Update mission status
export function updateMissionStatus(instanceId, status) {
  const log = readMissionLog();
  const entry = log.missions[instanceId];
  if (!entry) return null;
  entry.status = status;
  if (status === MissionStatus.ACCEPTED) {
    entry.acceptedAt = entry.acceptedAt || Date.now();
    entry.attemptCount += 1;
  }
  if (status === MissionStatus.IN_PROGRESS) {
    entry.acceptedAt = entry.acceptedAt || Date.now();
  }
  if (status === MissionStatus.COMPLETED) {
    entry.completedAt = Date.now();
  }
  if (status === MissionStatus.DECLINED) {
    entry.declinedAt = Date.now();
  }
  writeMissionLog(log);
  return entry;
}

// Check if a quest has been completed (any instance)
export function isQuestCompleted(questId) {
  const log = readMissionLog();
  return Object.values(log.missions).some(
    (m) => m.questId === questId && m.status === MissionStatus.COMPLETED
  );
}

// Check if a specific instance is completed
export function isInstanceCompleted(instanceId) {
  const entry = getMissionEntry(instanceId);
  return entry?.status === MissionStatus.COMPLETED;
}

// Get all missions by status
export function missionsByStatus(status) {
  const log = readMissionLog();
  return Object.values(log.missions).filter((m) => m.status === status);
}

// Get active (non-completed, non-declined, non-expired) missions
export function activeMissions() {
  const log = readMissionLog();
  return Object.values(log.missions).filter(
    (m) => m.status === MissionStatus.ACCEPTED || m.status === MissionStatus.IN_PROGRESS
  );
}

// Mark email mission as completed when side mission resolves
export function completeMissionByQuestId(questId, source) {
  const log = readMissionLog();
  const matching = Object.values(log.missions).find(
    (m) => m.questId === questId && m.source === source && m.status !== MissionStatus.COMPLETED
  );
  if (matching) {
    matching.status = MissionStatus.COMPLETED;
    matching.completedAt = Date.now();
    writeMissionLog(log);
  }
  return matching;
}

// Deferred missions (accepted but not started)
export function deferredMissions() {
  const log = readMissionLog();
  return Object.values(log.missions).filter(
    (m) => m.status === MissionStatus.ACCEPTED
  );
}
