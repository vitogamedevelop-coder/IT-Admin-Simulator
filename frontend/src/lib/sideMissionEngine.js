import { competencyOverview, readCompetencies } from './competency.js';
import { readGameState, writeGameState } from './gameState.js';
import { objectivesUnlocked } from './learningObjectives.js';
import { colleagueForTopic, companyStage } from './officeWorld.js';
import { applySideMission } from './academyEngine.js';
import { academyTopicForSideMission } from './objectives.js';

const channels = ['phone', 'mail', 'monitor'];

function masteryFor(topic) {
  return competencyOverview().find((item) => item.name === topic)?.mastery || 0.15;
}

function dueScore(objective) {
  const competency = readCompetencies().topics[objective.topic];
  if (!competency) return 10;
  const overdue = competency.nextReview ? (Date.now() - competency.nextReview) / 86400000 : 1;
  const forgetting = competency.lastSeen ? (Date.now() - competency.lastSeen) / 86400000 : 5;
  return overdue + forgetting * 0.2 + (1 - masteryFor(objective.topic)) * 3;
}

function priorityFor(channel, variant) {
  if (channel === 'monitor') return variant.type === 'evidence' ? 'P1' : 'P2';
  if (channel === 'phone') return 'P2';
  return 'P3';
}

function missionTitle(channel, objective, person) {
  if (channel === 'phone') return `${person.name} ruft an: ${objective.title}`;
  if (channel === 'monitor') return `Monitoring: ${objective.title}`;
  return `E-Mail von ${person.name}: kurze Fachfrage`;
}

const toneIntros = {
  'direkt und freundlich': (name) => `${name} kommt direkt zur Sache:`,
  'technisch neugierig': (name) => `${name} fragt interessiert nach:`,
  'präzise und ruhig': (name) => `${name} beschreibt sachlich:`,
  'fragt nach Risiko und Auswirkung': (name) => `${name} will wissen, wie sich das auf den Betrieb auswirkt:`,
  'hilfreich, aber fordert Begründungen': (name) => `${name} fragt dich nach deiner Einschätzung:`,
  'praxisorientiert': (name) => `${name} braucht eine schnelle, praktische Antwort:`,
};

function personalizedIntro(person) {
  const fn = toneIntros[person.tone];
  return fn ? fn(person.name) : `${person.name} fragt:`;
}

function pruneInbox(state, keepResolved = 3) {
  const resolved = (state.inbox || []).filter((item) => item.resolved && !item.archived)
    .sort((a, b) => (b.resolvedAt || 0) - (a.resolvedAt || 0));
  let changed = false;
  for (const item of resolved.slice(keepResolved)) {
    if (!item.archived) {
      item.archived = true;
      changed = true;
    }
  }
  return changed;
}

export function ensureInbox() {
  const state = readGameState();
  const pruned = pruneInbox(state, 3);
  const today = new Date().toISOString().slice(0, 10);
  const unresolved = (state.inbox || []).filter((item) => !item.resolved && !item.archived);
  if (state.lastEventDate === today) {
    if (pruned) writeGameState(state);
    return unresolved;
  }
  const specializationTopics = { 'Netzwerk': ['DNS', 'DHCP', 'Netzwerk'], 'Windows/AD': ['Berechtigungen', 'Active Directory'], 'Linux': ['Linux'], 'Security': ['IT-Sicherheit', 'Backup'], 'Automatisierung': ['PowerShell', 'Automatisierung'], 'Datenbanken': ['Datenbanken', 'SQL'] };
  const preferred = specializationTopics[state.specialization] || [];
  const objectives = objectivesUnlocked(state.completedQuests).sort((a, b) => (dueScore(b) + (preferred.includes(b.topic) ? 1.2 : 0)) - (dueScore(a) + (preferred.includes(a.topic) ? 1.2 : 0)));
  if (!objectives.length) return [];
  const generated = [];
  const count = Math.min(3, objectives.length);
  for (let index = 0; index < count; index += 1) {
    const objective = objectives[index];
    const channel = channels[(index + state.sideMissionsResolved) % channels.length];
    const variants = objective.variants;
    const variant = variants[(state.sideMissionsResolved + index) % variants.length];
    const person = colleagueForTopic(objective.topic, channel === 'monitor' ? undefined : channel);
    generated.push({
      id: `${today}-${objective.id}-${variant.type}-${index}`,
      objectiveId: objective.id,
      topic: objective.topic,
      title: missionTitle(channel, objective, person),
      channel,
      priority: priorityFor(channel, variant),
      personId: person.id,
      personName: channel === 'monitor' ? 'NEXUS Monitoring' : person.name,
      personRole: channel === 'monitor' ? 'Automatischer Systemalarm' : person.role,
      personTone: person.tone,
      personIntro: channel === 'monitor' ? null : personalizedIntro(person),
      variant,
      countsTowardStoryGate: true,
      createdAt: Date.now() + index,
      deliveredAt: Date.now() + index,
      resolved: false,
      archived: false,
    });
  }
  state.inbox = [...unresolved, ...generated].slice(-8);
  state.lastEventDate = today;
  writeGameState(state);
  return state.inbox.filter((item) => !item.resolved);
}

export function changeMissionAvailable() {
  const state = readGameState();
  const stage = companyStage(state.completedQuests.length);
  const competencies = competencyOverview();
  const strong = competencies.filter((item) => item.mastery >= 0.55).length;
  return stage.id >= 3 && strong >= 3;
}

export function resolveSideMission(id, correct) {
  const state = readGameState();
  const mission = state.inbox.find((item) => item.id === id);
  if (!mission) return state;
  mission.resolved = true;
  mission.correct = correct;
  mission.resolvedAt = Date.now();
  state.sideMissionsResolved += 1;
  state.careerXp += correct ? 20 : 8;
  if (!state.completedSideMissions.includes(id)) state.completedSideMissions.push(id);
  if (!state.sideMissionHistory) state.sideMissionHistory = {};
  state.sideMissionHistory[id] = {
    completedAt: Date.now(),
    countsTowardStoryGate: mission.countsTowardStoryGate !== false,
  };
  if (correct) {
    const academyRef = academyTopicForSideMission(mission.topic);
    if (academyRef) applySideMission(academyRef.categoryId, academyRef.topicId);
  }
  pruneInbox(state, 3);
  return writeGameState(state);
}

export function inboxMission(id) {
  return readGameState().inbox.find((item) => item.id === id);
}

function inboxDeliveredAt(item) {
  return item.deliveredAt || item.createdAt || 0;
}

function isInboxItemCompleted(item) {
  // A side-mission is completed when it has been resolved.
  return item.resolved === true;
}

export function getVisibleInbox() {
  const state = readGameState();
  const all = [...(state.inbox || [])].filter((item) => !item.archived);
  const open = all
    .filter((item) => !isInboxItemCompleted(item))
    .sort((a, b) => inboxDeliveredAt(b) - inboxDeliveredAt(a));
  const completed = all
    .filter((item) => isInboxItemCompleted(item))
    .sort((a, b) => inboxDeliveredAt(b) - inboxDeliveredAt(a))
    .slice(0, 3);
  return [...open, ...completed];
}

export function performInboxRetention() {
  const state = readGameState();
  if (pruneInbox(state, 3)) {
    return writeGameState(state);
  }
  return state;
}

export function sortedInbox() {
  ensureInbox();
  return getVisibleInbox();
}
