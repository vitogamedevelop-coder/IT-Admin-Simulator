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
import { MISSION_001_ID } from './missionV2.js';
import {
  SIDE_MISSION_001_ID,
  SIDE_MISSION_002_ID,
  SIDE_MISSION_003_ID,
} from './ciscoSideMissions.js';

export const WORLD_EVENT_IDS = {
  POST_MAIN_001_SAM: 'post-main-001-sam',
  SIDE_001_MAIL: 'side-001-mail',
  SIDE_002_PHONE: 'side-002-phone',
  SIDE_003_SAM: 'side-003-sam',
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
          text: 'Gute Arbeit. Der erste Switch ist einsatzbereit.\n\nBevor wir die nächste Hauptaufgabe angehen, vertiefen wir die Grundkonfiguration an drei kleineren Einsätzen.',
          options: [
            { label: 'Was kommt als Erstes?', nextId: 'next' },
            { label: 'Ich schaue mich erst um.', nextId: 'close' },
          ],
        },
        {
          id: 'next',
          text: 'Ich schicke dir gleich eine Mail mit dem ersten Auftrag. Bearbeite die Einsätze in Ruhe — du brauchst mindestens zwei von drei, bevor die nächste Hauptmission freigeschaltet werden kann.',
          onComplete: { action: 'close' },
        },
        {
          id: 'close',
          text: 'Melde dich, wenn du Fragen hast. Mein Büro ist im Flur.',
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
          text: 'Noch ein kleiner Sicherheitspunkt. Auf dem Test-Switch gibt es bereits einen lokalen Admin-Benutzer, aber die Console-Line fragt noch das gemeinsame Line-Passwort ab.\n\nStelle um auf "login local", damit jeder Mitarbeiter mit seinem eigenen Benutzer arbeitet.',
          options: [
            { label: 'Ich kümmere mich drum.', nextId: 'accept' },
            { label: 'Erst später.', nextId: 'close' },
          ],
        },
        {
          id: 'accept',
          text: 'Super. Denk daran, die Änderung auch zu speichern.',
          onComplete: { action: 'close' },
        },
        {
          id: 'close',
          text: 'In Ordnung. Schau später vorbei, wenn du Zeit hast.',
          onComplete: { action: 'close' },
        },
      ],
      entryNode: 'start',
    },
    linkedMissionId: SIDE_MISSION_003_ID,
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
  if (emailExists(data.id)) return false;
  const email = {
    ...data,
    date: Date.now(),
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

export function worldDialogResultAction(option, linkedMissionId) {
  if (!option) return null;
  if (option.nextId === 'accept' && linkedMissionId) {
    return { action: 'mission', missionId: linkedMissionId };
  }
  return { action: 'close' };
}
