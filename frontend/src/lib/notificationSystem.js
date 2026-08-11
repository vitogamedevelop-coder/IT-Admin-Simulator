import { readGameState } from './gameState.js';
import { quests } from './questData.js';
import { learningObjectives } from './learningObjectives.js';
import { colleagues } from './officeWorld.js';
import { exampleEmails } from './emails.js';

const NOTIFICATION_KEY = 'it-learn:notifications';

export const notificationTypes = {
  EMAIL: 'email',
  PHONE: 'phone',
  PERSON: 'person',
  SIDE: 'side',
  MAIN: 'main',
  ALERT: 'alert',
};

export const defaultRules = {
  minDelayBetweenMs: 30_000,
  maxIdleMs: 120_000,
  mainMissionDelayMs: 60_000,
  sideMissionDelayMs: 45_000,
  emailDelayMs: 20_000,
  phoneDelayMs: 40_000,
  personDelayMs: 90_000,
};

export function readNotifications() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
  } catch {
    return [];
  }
}

export function writeNotifications(notifications) {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
}

export function pendingNotifications(notifications = readNotifications()) {
  return notifications.filter((n) => !n.dismissed && !n.acknowledged);
}

export function hasBlockingNotification() {
  return pendingNotifications().some((n) => n.priority === 1 && n.blocking);
}

export function nextMainMission(state = readGameState()) {
  const completed = new Set(state.completedQuests);
  return quests.find((quest) => !completed.has(quest.id) && (!quest.requires || quest.requires.every((id) => completed.has(id)))) || null;
}

export function nextSideMissionOpportunities(state = readGameState()) {
  const completed = new Set(state.completedQuests);
  return learningObjectives.filter((objective) => completed.has(objective.unlockQuest));
}

export function createNotification({ id, type, priority = 2, source = {}, title, body, blocking = false, linkedMissionId = null, requires = [] }) {
  return { id, type, priority, source, title, body, createdAt: Date.now(), acknowledged: false, dismissed: false, blocking, linkedMissionId, requires };
}

export function enqueue(notification) {
  const queue = readNotifications();
  if (queue.some((n) => n.id === notification.id)) return queue;
  queue.push(notification);
  writeNotifications(queue);
  return queue;
}

export function acknowledge(id) {
  const queue = readNotifications().map((n) => (n.id === id ? { ...n, acknowledged: true } : n));
  writeNotifications(queue);
  return queue;
}

export function dismiss(id) {
  const queue = readNotifications().map((n) => (n.id === id ? { ...n, dismissed: true } : n));
  writeNotifications(queue);
  return queue;
}

export function scheduleEmailNotification(email) {
  return enqueue(createNotification({
    id: `email-${email.id}`,
    type: notificationTypes.EMAIL,
    priority: email.priority === 'urgent' ? 1 : email.priority === 'high' ? 2 : 3,
    source: { personId: email.from.personId, channel: 'mail' },
    title: email.subject,
    body: email.body.slice(0, 120),
    linkedMissionId: email.linkedMissionId,
  }));
}

export function scheduleMainMissionNotification(quest) {
  const person = colleagues.find((c) => c.id === 'weber') || colleagues[0];
  return enqueue(createNotification({
    id: `main-${quest.id}`,
    type: notificationTypes.MAIN,
    priority: quest.boss ? 1 : 2,
    source: { personId: person.id, channel: 'dialog' },
    title: `Neuer Einsatz: ${quest.title}`,
    body: quest.subtitle,
    linkedMissionId: quest.id,
    blocking: quest.boss,
  }));
}

export function schedulePhoneNotification(dialog) {
  const person = colleagues.find((c) => c.id === dialog.personId) || colleagues[0];
  return enqueue(createNotification({
    id: `phone-${dialog.id}`,
    type: notificationTypes.PHONE,
    priority: 2,
    source: { personId: person.id, channel: 'phone' },
    title: `${person.name} ruft an`,
    body: dialog.nodes?.[0]?.text?.slice(0, 120) || 'Eingehender Anruf',
    linkedMissionId: dialog.onComplete?.missionId,
  }));
}

export function seedInitialNotifications() {
  const state = readGameState();
  const queue = readNotifications();
  if (queue.length > 0) return queue;
  // Initial email introducing the first mission
  const introEmail = exampleEmails.find((e) => e.id === 'intro-ipconfig');
  if (introEmail && !state.completedQuests.includes('first-day')) {
    scheduleEmailNotification(introEmail);
  }
  return readNotifications();
}

export function tickScheduler() {
  if (hasBlockingNotification()) return [];
  const state = readGameState();
  const nextMain = nextMainMission(state);
  if (nextMain && !state.completedQuests.includes(nextMain.id)) {
    const id = `main-${nextMain.id}`;
    if (!readNotifications().some((n) => n.id === id)) {
      scheduleMainMissionNotification(nextMain);
    }
  }
  return readNotifications();
}
