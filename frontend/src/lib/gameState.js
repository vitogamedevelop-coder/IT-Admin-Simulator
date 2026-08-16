import { competencyOverview, readCompetencies } from './competency.js';
import { unlockNotebookEntries } from './notebook.js';
import { applyMainMission } from './academyEngine.js';

const KEY = 'it-learn:rpg-state-v1';

function createKnownCredentials() {
  return { enableSecret: null, localAdminUsername: null, localAdminPassword: null };
}

const initialState = {
  stateVersion: 8,
  contentPackVersion: 1,
  company: 'NEXUS Systems',
  // Purely local display name (no account, no PII beyond a self-chosen
  // nickname) - asked once on first launch, see PlayerNameGate.jsx. `null`
  // means "not set / skipped", callers must fall back to a name-less
  // greeting rather than assuming a value.
  playerName: null,
  careerXp: 0,
  completedQuests: [],
  completedCiscoSideMissions: [],
  activeQuest: null,
  reputation: { helpdesk: 50, management: 50, security: 50, development: 50 },
  infrastructure: {
    clients: { name: 'Arbeitsplätze', status: 'online', unlocked: true },
    network: { name: 'Netzwerkraum', status: 'online', unlocked: true },
    domain: { name: 'Domain Controller', status: 'warning', unlocked: true },
    fileserver: { name: 'Fileserver', status: 'online', unlocked: true },
    linux: { name: 'Linux-Webserver', status: 'locked', unlocked: false },
    backup: { name: 'Backup-System', status: 'locked', unlocked: false },
    soc: { name: 'Security Operations Center', status: 'locked', unlocked: false },
  },
  tools: ['ping', 'ipconfig'],
  incidentsResolved: 0,
  sideMissionsResolved: 0,
  inbox: [],
  completedSideMissions: [],
  sideMissionHistory: {},
  deliveredMissionInstances: [],
  generatedTicketHistory: [],
  runbooks: [],
  specialization: null,
  lastVisitAt: null,
  lastEventDate: null,
  workday: { day: 1, shiftStartedAt: null },
  investigatedScenarios: {},
  importQueue: [],
  importedContentIds: [],
  knownCredentials: createKnownCredentials(),
  dispatchedWorldEvents: [],
  pendingWorldDialog: null,
};

function cloneInitial() {
  return JSON.parse(JSON.stringify(initialState));
}

function migrateState(saved) {
  if (!saved) return cloneInitial();
  const migrated = { ...cloneInitial(), ...saved, reputation: { ...initialState.reputation, ...saved.reputation }, infrastructure: { ...initialState.infrastructure, ...saved.infrastructure } };
  if (!saved.stateVersion || saved.stateVersion < 2) {
    migrated.stateVersion = 2;
    migrated.contentPackVersion = 1;
    migrated.generatedTicketHistory = saved.generatedTicketHistory || [];
  }
  if (!saved.stateVersion || saved.stateVersion < 3) {
    migrated.stateVersion = 3;
    migrated.workday = saved.workday || { day: 1, shiftStartedAt: null };
    migrated.investigatedScenarios = saved.investigatedScenarios || {};
    migrated.importQueue = saved.importQueue || [];
    migrated.importedContentIds = saved.importedContentIds || [];
  }
  if (!saved.stateVersion || saved.stateVersion < 5) {
    // Phase 0 reset: legacy mission progress is cleared so the new adaptive
    // mission system starts from a clean slate. Academy progress is stored
    // separately and is not affected.
    migrated.stateVersion = 5;
    migrated.completedQuests = [];
    migrated.activeQuest = null;
    migrated.completedSideMissions = [];
    migrated.inbox = [];
    migrated.incidentsResolved = 0;
    migrated.sideMissionsResolved = 0;
    migrated.generatedTicketHistory = [];
    migrated.reputation = { ...initialState.reputation };
  }
  if (!saved.stateVersion || saved.stateVersion < 4) {
    migrated.stateVersion = 4;
    migrated.playerName = saved.playerName || null;
  }
  if (!saved.stateVersion || saved.stateVersion < 6) {
    migrated.stateVersion = 6;
    migrated.completedCiscoSideMissions = saved.completedCiscoSideMissions || [];
  }
  if (!saved.stateVersion || saved.stateVersion < 7) {
    migrated.stateVersion = 7;
    migrated.knownCredentials = saved.knownCredentials || createKnownCredentials();
    migrated.dispatchedWorldEvents = saved.dispatchedWorldEvents || [];
    migrated.pendingWorldDialog = saved.pendingWorldDialog || null;
  }
  if (!saved.stateVersion || saved.stateVersion < 8) {
    migrated.stateVersion = 8;
    // Phase 1F introduces main mission 002 and the L2 security side mission.
    // Old quest gate placeholder is replaced by the real main mission ID.
    migrated.completedQuests = (saved.completedQuests || []).map((id) => (id === 'cisco-main-002-gate' ? 'cisco-main-002' : id));
  }
  if (!saved.stateVersion || saved.stateVersion < 9) {
    migrated.stateVersion = 9;
    // Phase 1I.2.4: track completed side-mission metadata and delivered
    // procedural deliveries so the story gate and delivery layer have a
    // single, idempotent source of truth.
    migrated.sideMissionHistory = saved.sideMissionHistory || {};
    for (const id of saved.completedSideMissions || []) {
      if (!migrated.sideMissionHistory[id]) {
        migrated.sideMissionHistory[id] = { completedAt: Date.now(), countsTowardStoryGate: true };
      }
    }
    migrated.deliveredMissionInstances = saved.deliveredMissionInstances || [];
  }
  return migrated;
}

// Sanitizes a raw name-field input into a short, safe display name:
// trims, collapses internal whitespace, strips control characters, caps
// length. Returns '' (not null) when nothing usable remains, so callers can
// tell "user submitted blank" apart from "never asked yet".
export function sanitizePlayerName(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\x00-\x1F\x7F]/g, '') // eslint-disable-line no-control-regex
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20);
}

export function getPlayerName() {
  return readGameState().playerName || null;
}

export function setPlayerName(raw) {
  const state = readGameState();
  const clean = sanitizePlayerName(raw);
  state.playerName = clean || null;
  return writeGameState(state);
}

export function readGameState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return migrateState(saved);
  } catch {
    return cloneInitial();
  }
}

export function writeGameState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('it-learn:game-state'));
  return state;
}

export function careerForState(state = readGameState()) {
  const competencies = competencyOverview();
  const mastery = competencies.length ? competencies.reduce((sum, item) => sum + item.mastery, 0) / competencies.length : 0;
  const score = state.careerXp + state.incidentsResolved * 40 + mastery * 300;
  if (score >= 5000) return { title: 'IT-Architekt', level: 7, next: null };
  if (score >= 3500) return { title: 'Security Engineer', level: 6, next: 5000 };
  if (score >= 2400) return { title: 'Infrastructure Engineer', level: 5, next: 3500 };
  if (score >= 1500) return { title: 'Netzwerkadministrator', level: 4, next: 2400 };
  if (score >= 800) return { title: 'Systemadministrator', level: 3, next: 1500 };
  if (score >= 300) return { title: 'Junior-Administrator', level: 2, next: 800 };
  return { title: 'IT-Trainee', level: 1, next: 300 };
}

export function completeQuest(quest, result) {
  const state = readGameState();
  if (!state.completedQuests.includes(quest.id)) state.completedQuests.push(quest.id);
  state.activeQuest = null;
  state.incidentsResolved += 1;
  state.careerXp += result.xp;
  Object.entries(result.reputation || {}).forEach(([key, amount]) => {
    state.reputation[key] = Math.max(0, Math.min(100, (state.reputation[key] || 50) + amount));
  });
  (quest.unlockTools || []).forEach((tool) => {
    if (!state.tools.includes(tool)) state.tools.push(tool);
  });
  (quest.unlockInfrastructure || []).forEach((key) => {
    if (state.infrastructure[key]) state.infrastructure[key] = { ...state.infrastructure[key], unlocked: true, status: 'online' };
  });
  if (quest.infrastructureEffect) {
    Object.entries(quest.infrastructureEffect).forEach(([key, status]) => {
      if (state.infrastructure[key]) state.infrastructure[key] = { ...state.infrastructure[key], status };
    });
  }
  (quest.unlockNotebook || []).forEach(() => unlockNotebookEntries(quest.id));
  if (!state.runbooks.some((item) => item.id === quest.id)) {
    const steps = quest.steps || [];
    state.runbooks.push({
      id: quest.id,
      title: quest.title,
      category: quest.department,
      symptom: quest.subtitle,
      cause: quest.resolution,
      steps: steps.map((step) => step.options?.find((option) => option.correct)?.label).filter(Boolean),
      mistakes: steps.flatMap((step) => step.options?.filter((option) => !option.correct).map((option) => option.label) || []).slice(0, 4),
      tools: quest.unlockTools || [],
      createdAt: Date.now(),
    });
  }
  // Award Academy practice points for every recommended topic this mission applied.
  (quest.recommendedAcademyTopics || []).forEach((ref) => {
    const [categoryId, topicId] = ref.includes('/') ? ref.split('/') : [null, null];
    if (categoryId && topicId) applyMainMission(categoryId, topicId);
  });
  return writeGameState(state);
}

export function completeCiscoSideMission(missionId, result) {
  const state = readGameState();
  if (!state.completedCiscoSideMissions) state.completedCiscoSideMissions = [];
  if (!state.completedCiscoSideMissions.includes(missionId)) state.completedCiscoSideMissions.push(missionId);
  if (!state.sideMissionHistory) state.sideMissionHistory = {};
  state.sideMissionHistory[missionId] = { completedAt: Date.now(), countsTowardStoryGate: true };
  state.careerXp += result.xp || 20;
  Object.entries(result.reputation || {}).forEach(([key, amount]) => {
    state.reputation[key] = Math.max(0, Math.min(100, (state.reputation[key] || 50) + amount));
  });
  return writeGameState(state);
}

export function ciscoSideMissionsCompleted() {
  const state = readGameState();
  return state.completedCiscoSideMissions || [];
}

function deliveryKey(instanceId, channel) {
  return `${instanceId}:${channel}`;
}

export function hasMissionDelivery(instanceId, channel) {
  const state = readGameState();
  return (state.deliveredMissionInstances || []).includes(deliveryKey(instanceId, channel));
}

export function recordMissionDelivery(instanceId, channel) {
  const state = readGameState();
  if (!state.deliveredMissionInstances) state.deliveredMissionInstances = [];
  const key = deliveryKey(instanceId, channel);
  if (!state.deliveredMissionInstances.includes(key)) {
    state.deliveredMissionInstances.push(key);
    writeGameState(state);
  }
  return state;
}

export function setActiveQuest(id) {
  const state = readGameState();
  state.activeQuest = id;
  return writeGameState(state);
}

export function setSpecialization(specialization) {
  const state = readGameState();
  state.specialization = specialization;
  return writeGameState(state);
}

export function getReturnSummary() {
  const state = readGameState();
  const previous = state.lastVisitAt;
  state.lastVisitAt = Date.now();
  writeGameState(state);
  if (!previous || Date.now() - previous < 6 * 60 * 60 * 1000) return null;
  const hours = Math.round((Date.now() - previous) / 3600000);
  const openMessages = (state.inbox || []).filter((item) => !item.resolved).length;
  return `Willkommen zurück. Deine Systeme liefen ${hours < 24 ? `${hours} Stunden` : `${Math.round(hours / 24)} Tage`} stabil weiter. ${openMessages ? `${openMessages} Meldungen warten im Eingang.` : 'Aktuell liegen keine unbearbeiteten Wiederholungsfälle vor.'}`;
}

export function gameSummary() {
  const state = readGameState();
  const competencies = readCompetencies();
  return { state, career: careerForState(state), learnedTopics: Object.keys(competencies.topics).length };
}
