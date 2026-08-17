// World Flow Dispatcher — triggers in-world story beats after missions.
// Uses existing Mail, Phone/Notification and Sam-Dialog systems.
// Events are data-driven, dispatched once, and persisted in gameState.

import { readGameState, writeGameState } from './gameState.js';
import { readEmails, writeEmails } from './emails.js';
import {
  enqueue, createNotification, notificationTypes, readNotifications, writeNotifications,
} from './notificationSystem.js';
import { createDialog } from './dialogSystem.js';
import { colleagues } from './officeWorld.js';
import { MISSION_001_ID, MISSION_002_ID } from './missionV2.js';
import { getNextMainMission } from './objectives.js';
import {
  SIDE_MISSION_001_ID,
  SIDE_MISSION_002_ID,
  SIDE_MISSION_003_ID,
  SIDE_MISSION_004_ID,
} from './ciscoSideMissions.js';
import { readMissionLog, MissionStatus } from './missionLog.js';

export const WORLD_EVENT_IDS = {
  POST_MAIN_001_SAM: 'post-main-001-sam',
  SIDE_001_MAIL: 'side-001-mail',
  SIDE_002_PHONE: 'side-002-phone',
  SIDE_003_SAM: 'side-003-sam',
  POST_SIDE_003_SAM: 'post-side-003-sam',
  MAIN_002_MAIL: 'main-mission-unlocked:cisco-main-002',
  POST_MAIN_002_SAM: 'post-main-002-sam',
  SECURITY_MAIL: 'security-mail',
};

const WORLD_EVENTS = [
  {
    id: WORLD_EVENT_IDS.POST_MAIN_001_SAM,
    trigger: (state) => state.completedQuests.includes(MISSION_001_ID),
    delivery: 'dialog-sam',
    data: {
      personId: 'sam',
      mode: 'face-to-face',
      title: 'Der erste Switch läuft',
      nodes: [
        {
          id: 'start',
          text: 'Gute Arbeit. Der erste Switch ist einsatzbereit.\n\nBevor wir die nächste Hauptaufgabe angehen, vertiefen wir die Grundkonfiguration an drei kleineren Einsätzen. Willst du dich gleich damit befassen?',
          options: [
            { label: 'Jetzt gleich.', nextId: 'now' },
            { label: 'Erst später.', nextId: 'later' },
          ],
        },
        {
          // "Jetzt"/"Später" never change WHETHER a mail is sent - that is
          // decided purely by the world-event trigger (see WORLD_EVENT_IDS.
          // SIDE_001_MAIL below), not by this dialog choice. Only the
          // acknowledgement text differs, so the player understands where to
          // find the persistent in-world anchor either way.
          id: 'now',
          text: 'Alles klar. Ich hab dir die Details schon in die Mail geschickt - schau gleich rein.',
          onComplete: { action: 'close' },
        },
        {
          id: 'later',
          text: 'Kein Problem, eilt gerade nicht. Die Mail mit dem Auftrag liegt trotzdem in deinem Postfach, wenn du Zeit hast.',
          onComplete: { action: 'close' },
        },
      ],
      entryNode: 'start',
    },
  },
  {
    id: WORLD_EVENT_IDS.SIDE_001_MAIL,
    trigger: (state) => state.completedQuests.includes(MISSION_001_ID)
      && !state.completedCiscoSideMissions.includes(SIDE_MISSION_001_ID),
    delivery: 'email',
    data: {
      id: 'world-mail-side-001',
      from: { personId: 'sam', name: 'Sam Richter', role: 'Senior-Administrator' },
      to: ['spieler@nexus.local'],
      subject: 'Kleiner Folgeauftrag: Konsolenzugang sichern',
      body: 'Hallo,\n\nder neue Switch im Technikraum soll jetzt auch physisch abgesichert werden. Bitte\n\n- ein Konsolenpasswort setzen,\n- die Authentifizierung in der Console-Line aktivieren,\n- einen exec-timeout von 2 Minuten konfigurieren,\n- und die Konfiguration dauerhaft speichern.\n\nViele Grüße\nSam',
      priority: 'high',
    },
    linkedMissionId: SIDE_MISSION_001_ID,
  },
  {
    id: WORLD_EVENT_IDS.SIDE_002_PHONE,
    trigger: (state) => state.completedCiscoSideMissions.includes(SIDE_MISSION_001_ID)
      && !state.completedCiscoSideMissions.includes(SIDE_MISSION_002_ID),
    delivery: 'phone',
    data: {
      personId: 'mara',
      title: 'Mara König ruft an',
      body: 'Hi, hier Mara vom Helpdesk. Ich habe gerade einen Test-Switch geprüft und dort Passwörter im Klartext in der Konfiguration gesehen. Kannst du das bitte prüfen und service password-encryption aktivieren?',
    },
    linkedMissionId: SIDE_MISSION_002_ID,
  },
  {
    id: WORLD_EVENT_IDS.SIDE_003_SAM,
    trigger: (state) => state.completedCiscoSideMissions.includes(SIDE_MISSION_002_ID)
      && !state.completedCiscoSideMissions.includes(SIDE_MISSION_003_ID),
    delivery: 'dialog-sam',
    data: {
      personId: 'sam',
      mode: 'face-to-face',
      title: 'Lokale Anmeldung an der Konsole',
      nodes: [
        {
          id: 'start',
          text: 'Noch ein kleiner Sicherheitspunkt. Auf dem Test-Switch gibt es bereits einen lokalen Admin-Benutzer, aber die Console-Line fragt noch das gemeinsame Line-Passwort ab.\n\nStelle um auf "login local", damit jeder Mitarbeiter mit seinem eigenen Benutzer arbeitet. Willst du dich direkt darum kümmern?',
          options: [
            { label: 'Ich kümmere mich sofort drum.', nextId: 'now' },
            { label: 'Erst später.', nextId: 'later' },
          ],
        },
        {
          id: 'now',
          text: 'Gut. Der Auftrag ist bereits als Nebenmission hinterlegt - du kannst direkt loslegen.',
          onComplete: { action: 'close' },
        },
        {
          id: 'later',
          text: 'In Ordnung. Der Auftrag bleibt hinterlegt, schau später vorbei, wenn du Zeit hast.',
          onComplete: { action: 'close' },
        },
      ],
      entryNode: 'start',
    },
    linkedMissionId: SIDE_MISSION_003_ID,
  },
  {
    id: WORLD_EVENT_IDS.POST_SIDE_003_SAM,
    trigger: (state) => state.completedCiscoSideMissions.includes(SIDE_MISSION_003_ID)
      && !state.completedQuests.includes(MISSION_002_ID)
      && !state.completedCiscoSideMissions.includes(SIDE_MISSION_004_ID),
    delivery: 'dialog-sam',
    data: {
      personId: 'sam',
      mode: 'face-to-face',
      title: 'Der nächste Switch wartet',
      nodes: [
        {
          id: 'start',
          text: 'Die kleinen Aufträge waren Absicht. Ich wollte sehen, ob du einen Switch vorbereiten kannst, ohne dass ich danebenstehe.\n\nJetzt bekommst du etwas, das hier häufiger vorkommt. Personal und Buchhaltung bekommen neue Arbeitsplätze am selben Switch. Die sollen aber nicht einfach in derselben Layer-2-Domäne landen.',
          options: [
            { label: 'Ich bin bereit.', nextId: 'now' },
            { label: 'Erst später.', nextId: 'later' },
          ],
        },
        {
          id: 'now',
          text: 'Gut, dann schau gleich in dein Postfach - die Details stehen schon drin.',
          onComplete: { action: 'close' },
        },
        {
          id: 'later',
          text: 'Kein Problem. Die Mail mit den Details liegt bereits in deinem Postfach, wenn du bereit bist.',
          onComplete: { action: 'close' },
        },
      ],
      entryNode: 'start',
    },
    linkedMissionId: MISSION_002_ID,
  },
  {
    id: WORLD_EVENT_IDS.MAIN_002_MAIL,
    trigger: (state) => {
      const next = getNextMainMission(state);
      return next?.quest?.id === MISSION_002_ID && next.available && !state.completedQuests.includes(MISSION_002_ID);
    },
    delivery: 'email',
    data: {
      id: 'world-mail-main-002',
      from: { personId: 'sam', name: 'Sam Richter', role: 'Senior-Administrator' },
      to: ['spieler@nexus.local'],
      subject: 'Netzwerksegmente Personal & Buchhaltung',
      body: 'Moin,\n\nder Bürobereich wird gerade neu gepatcht.\n\nPersonal und Buchhaltung hängen künftig am selben Access-Switch (Sw2), sollen aber logisch getrennt bleiben.\n\nRichte bitte die beiden Bereiche ein und bereite den Uplink vor.\n\nVorgaben:\n\nPersonal: VLAN 10\nBuchhaltung: VLAN 20\nUnser Parking-VLAN für ungenutzte Anschlüsse: VLAN 999 / UNUSED\n\nPrüf vorher kurz, welche Ports auf Sw2 vorhanden und bereits belegt sind. Offene Anschlüsse sollen nicht aktiv bleiben.\n\n– Sam',
      priority: 'high',
    },
    linkedMissionId: MISSION_002_ID,
  },
  {
    id: WORLD_EVENT_IDS.POST_MAIN_002_SAM,
    trigger: (state) => state.completedQuests.includes(MISSION_002_ID)
      && !state.completedCiscoSideMissions.includes(SIDE_MISSION_004_ID),
    delivery: 'dialog-sam',
    data: {
      personId: 'sam',
      mode: 'face-to-face',
      title: 'Sw2 vor der Übergabe',
      nodes: [
        {
          id: 'start',
          text: 'Sieht gut aus.\n\nBevor der Switch so in Betrieb geht, fehlt mir allerdings noch etwas. Schau dir die übrigen Ports einmal genauer an. Was nicht gebraucht wird, muss auch nicht offen herumstehen.',
          options: [
            { label: 'Verstanden.', nextId: 'now' },
            { label: 'Später.', nextId: 'later' },
          ],
        },
        {
          id: 'now',
          text: 'Gut. Die Mail mit dem genauen Auftrag ist schon unterwegs.',
          onComplete: { action: 'close' },
        },
        {
          id: 'later',
          text: 'Kein Problem. Die Mail mit dem genauen Auftrag liegt bereit, sobald du Zeit findest.',
          onComplete: { action: 'close' },
        },
      ],
      entryNode: 'start',
    },
    linkedMissionId: SIDE_MISSION_004_ID,
  },
  {
    id: WORLD_EVENT_IDS.SECURITY_MAIL,
    trigger: (state) => state.completedQuests.includes(MISSION_002_ID)
      && !state.completedCiscoSideMissions.includes(SIDE_MISSION_004_ID),
    delivery: 'email',
    data: {
      id: 'world-mail-security-004',
      from: { personId: 'sam', name: 'Sam Richter', role: 'Senior-Administrator' },
      to: ['spieler@nexus.local'],
      subject: 'Sw2 vor der Inbetriebnahme absichern',
      body: 'Moin,\n\nSw2 geht bald in Betrieb. Auf dem Gerät sind noch mehrere ungenutzte Accessports aktiv.\n\nPrüfe, welche Ports tatsächlich benötigt werden. Nicht verwendete Accessports sollen nach NEXUS-Standard in unser Parking-VLAN verschoben und administrativ deaktiviert werden.\n\nNEXUS-Standard:\n- Parking VLAN: 999\n- Name: UNUSED\n\nPass auf die Uplinks auf.\n\n– Sam',
      priority: 'high',
    },
    linkedMissionId: SIDE_MISSION_004_ID,
  },
];

function isDispatched(state, id) {
  return (state.dispatchedWorldEvents || []).includes(id);
}

function markDispatched(state, id) {
  if (!state.dispatchedWorldEvents) state.dispatchedWorldEvents = [];
  if (!state.dispatchedWorldEvents.includes(id)) state.dispatchedWorldEvents.push(id);
}

function cleanupStaleNotifications(state) {
  const queue = readNotifications();
  const completed = new Set(state.completedCiscoSideMissions || []);
  let changed = false;
  const cleaned = queue.map((n) => {
    if (n.linkedMissionId && completed.has(n.linkedMissionId) && !n.dismissed && !n.acknowledged) {
      changed = true;
      return { ...n, dismissed: true };
    }
    return n;
  });
  if (changed) {
    writeNotifications(cleaned);
  }
}

function emailExists(id) {
  return readEmails().some((e) => e.id === id);
}

function notificationExists(id) {
  return readNotifications().some((n) => n.id === id);
}

function dispatchEmail(event) {
  const { data, linkedMissionId } = event;
  if (emailExists(data.id)) return true; // already sent; still counts as dispatched
  const now = Date.now();
  const email = {
    ...data,
    date: now,
    deliveredAt: now,
    read: false,
    attachments: [],
    linkedMissionId,
  };
  writeEmails([...readEmails(), email]);
  return true;
}

function dispatchPhone(event) {
  const { data, linkedMissionId } = event;
  if (notificationExists(`phone-${event.id}`)) return false;
  const notification = createNotification({
    id: `phone-${event.id}`,
    type: notificationTypes.PHONE,
    priority: 2,
    source: { personId: data.personId, channel: 'phone' },
    title: data.title,
    body: data.body,
    linkedMissionId,
  });
  enqueue(notification);
  return true;
}

function buildDialogFromEvent(event) {
  const { data } = event;
  return createDialog({
    id: `world-${event.id}`,
    personId: data.personId,
    mode: data.mode || 'face-to-face',
    nodes: data.nodes,
    entryNode: data.entryNode,
  });
}

function dispatchDialogSam(event, state) {
  if (state.pendingWorldDialog) return false;
  state.pendingWorldDialog = {
    eventId: event.id,
    personId: event.data.personId,
    mode: event.data.mode || 'face-to-face',
    nodes: event.data.nodes,
    entryNode: event.data.entryNode,
    linkedMissionId: event.linkedMissionId || null,
  };
  return true;
}

export function getPendingWorldDialog(state = readGameState()) {
  const pending = state.pendingWorldDialog;
  if (!pending) return null;
  const person = colleagues.find((c) => c.id === pending.personId) || { id: pending.personId, name: pending.personId, role: '' };
  return {
    eventId: pending.eventId,
    linkedMissionId: pending.linkedMissionId,
    person,
    dialog: buildDialogFromEvent({
      id: pending.eventId,
      data: {
        personId: pending.personId,
        mode: pending.mode,
        nodes: pending.nodes,
        entryNode: pending.entryNode,
      },
      linkedMissionId: pending.linkedMissionId,
    }),
  };
}

export function acknowledgePendingWorldDialog() {
  const state = readGameState();
  if (!state.pendingWorldDialog) return state;
  markDispatched(state, state.pendingWorldDialog.eventId);
  state.pendingWorldDialog = null;
  return writeGameState(state);
}

export function processWorldEvents() {
  const state = readGameState();
  cleanupStaleNotifications(state);

  const dispatched = [];
  let pendingDialog = null;

  for (const event of WORLD_EVENTS) {
    if (isDispatched(state, event.id)) continue;
    if (!event.trigger(state)) continue;

    let ok = false;
    if (event.delivery === 'email') {
      ok = dispatchEmail(event);
    } else if (event.delivery === 'phone') {
      ok = dispatchPhone(event);
    } else if (event.delivery === 'dialog-sam') {
      ok = dispatchDialogSam(event, state);
      if (ok) pendingDialog = getPendingWorldDialog(state);
    }

    if (ok) {
      markDispatched(state, event.id);
      dispatched.push(event.id);
    }
  }

  if (dispatched.length || state.pendingWorldDialog) {
    writeGameState(state);
  }

  return { dispatched, pendingDialog: pendingDialog || getPendingWorldDialog(state) };
}

export function worldDialogResultAction(_option, _linkedMissionId) {
  // World-flow dialogs never auto-start missions. They only acknowledge the
  // event; the player starts missions manually via mail/phone/objective panel.
  return { action: 'close' };
}

// ============================================================================
// Delivery-state introspection (Phase 1G, item 2).
//
// A single, semantically distinct read of "where is this mission's delivery
// right now" - so callers (ObjectivePanel, tests, ...) never have to
// reinvent this from a boolean soup of completedQuests/emails/notifications.
// This is purely additive: it reads the existing email/notification/
// missionLog/gameState stores, it does not introduce a second, competing
// state machine.
// ============================================================================

export const DeliveryState = {
  // A WORLD_EVENT triggered, but nothing was actually created for the
  // player yet (should not normally be observable from the outside - see
  // dispatchEmail/dispatchPhone/dispatchDialogSam - but kept for completeness).
  EVENT_DISPATCHED: 'eventDispatched',
  // A persistent in-world anchor (email or phone/voicemail entry) exists.
  DELIVERY_CREATED: 'deliveryCreated',
  // The delivery exists, is unread/unacknowledged, and the mission has not
  // been started yet.
  MISSION_AVAILABLE: 'missionAvailable',
  // The player has explicitly accepted the mission (opened the mail/call
  // and chosen to start it) but has not entered the mission runtime yet.
  MISSION_ACCEPTED: 'missionAccepted',
  // The mission runtime is currently active (in progress).
  MISSION_ACTIVE: 'missionActive',
  MISSION_COMPLETED: 'missionCompleted',
  // No delivery exists for this mission at all yet.
  NONE: 'none',
};

function isMissionCompleted(missionId, state) {
  return (state.completedQuests || []).includes(missionId)
    || (state.completedCiscoSideMissions || []).includes(missionId);
}

function findMissionLogEntries(missionId) {
  const log = readMissionLog();
  return Object.values(log.missions).filter((m) => m.questId === missionId);
}

// Returns one of the DeliveryState values for a given mission/quest ID,
// based purely on real, persisted state (emails, notifications, missionLog,
// gameState) - never a separately tracked flag.
export function getMissionDeliveryState(missionId, state = readGameState()) {
  if (isMissionCompleted(missionId, state)) return DeliveryState.MISSION_COMPLETED;

  if (state.activeQuest === missionId) return DeliveryState.MISSION_ACTIVE;

  const logEntries = findMissionLogEntries(missionId);
  if (logEntries.some((m) => m.status === MissionStatus.IN_PROGRESS)) return DeliveryState.MISSION_ACTIVE;
  if (logEntries.some((m) => m.status === MissionStatus.ACCEPTED)) return DeliveryState.MISSION_ACCEPTED;

  const hasEmail = readEmails().some((e) => e.linkedMissionId === missionId);
  const hasNotification = readNotifications().some((n) => n.linkedMissionId === missionId);
  const hasPendingDialog = state.pendingWorldDialog?.linkedMissionId === missionId;

  if (hasEmail || hasNotification) return DeliveryState.MISSION_AVAILABLE;
  if (hasPendingDialog) return DeliveryState.DELIVERY_CREATED;

  const eventDispatched = (state.dispatchedWorldEvents || []).some(
    (id) => WORLD_EVENTS.find((e) => e.id === id)?.linkedMissionId === missionId,
  );
  if (eventDispatched) return DeliveryState.EVENT_DISPATCHED;

  return DeliveryState.NONE;
}
