// Phase 1I – Ticket-System-Entfernung: Akzeptanztests.
//
// Stellt sicher:
//  - Tickets sind kein gültiger neuer Kanal mehr (keine Affinität, keine
//    erlaubten Kanäle in Templates).
//  - Die Badge-Zählung kennt kein `tickets` mehr.
//  - Objectives liefern keinen Ticket-Kommunikations-Hinweis.
//  - Alte Ticket-Instanzen und -Notifications werden auf E-Mail migriert.

import assert from 'node:assert/strict';
import {
  MISSION_CHANNEL,
  ARCHETYPE_CHANNEL_AFFINITY,
  allTemplates,
} from '../src/lib/missionTemplateEngine.js';
import { getCommunicationBadgeCounts } from '../src/lib/communicationBadges.js';
import { getCurrentPlayerObjectives } from '../src/lib/objectives.js';
import {
  readInstances,
  writeInstances,
  migrateTicketChannel,
} from '../src/lib/missionGenerator.js';
import { readNotifications, writeNotifications } from '../src/lib/notificationSystem.js';

function withLocalStorage(fn) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  try {
    fn();
  } finally {
    delete globalThis.localStorage;
  }
}

// 1. Ticket-Kanal ist für neue Missionen nicht mehr erlaubt
withLocalStorage(() => {
  Object.values(ARCHETYPE_CHANNEL_AFFINITY).forEach((channels) => {
    assert.ok(!channels.includes(MISSION_CHANNEL.TICKET), 'Ticket must not be an affinity channel');
  });
  for (const template of allTemplates()) {
    assert.ok(
      !template.allowedChannels.includes(MISSION_CHANNEL.TICKET),
      `Template ${template.id} must not allow ticket channel`,
    );
  }
});

// 2. Badges enthalten nur noch email + phone
withLocalStorage(() => {
  const counts = getCommunicationBadgeCounts();
  assert.deepEqual(Object.keys(counts).sort(), ['email', 'phone']);
  assert.ok(!('tickets' in counts), 'Badge counts must not contain tickets');
});

// 3. Objectives-Communication liefert keinen ticket-Kanal
withLocalStorage(() => {
  const objectives = getCurrentPlayerObjectives();
  if (objectives.communication) {
    assert.ok(objectives.communication.channel !== 'ticket', 'No ticket communication objective');
  }
});

// 4. Migration: bestehende Ticket-Instanz + Notification wird zu E-Mail
withLocalStorage(() => {
  localStorage.removeItem('cyberlearn:ticket-channel-migrated');

  const instanceId = 'test-ticket-instance';
  writeInstances({
    [instanceId]: {
      instanceId,
      templateId: 'cisco-basic-config-hardening',
      channel: 'ticket',
      status: 'available',
      title: 'Test Ticket',
      briefing: 'Test briefing line 1\nline 2',
      resolvedParameters: {},
      archetype: 'build',
      context: 'generic',
      difficulty: 'easy',
      device: { type: 'layer2_switch' },
      readState: { read: false, readAt: null },
      acceptedState: { accepted: false, acceptedAt: null },
      completedState: { completed: false, completedAt: null },
      attempts: 0,
      hintsUsed: [],
      solutionRevealedFor: [],
      showCommandsUsed: [],
    },
  });
  writeNotifications([{
    id: `ticket-${instanceId}`,
    type: 'ticket',
    priority: 2,
    source: { personId: 'lea', channel: 'ticket' },
    title: 'Test Ticket',
    body: 'Test briefing',
    createdAt: Date.now(),
    acknowledged: false,
    dismissed: false,
    blocking: false,
    linkedMissionId: `procedural:${instanceId}`,
  }]);

  migrateTicketChannel();

  const migrated = readInstances()[instanceId];
  assert.equal(migrated.channel, 'email', 'Ticket instance channel migrated to email');

  const notifications = readNotifications();
  assert.ok(notifications.every((n) => n.dismissed || n.acknowledged || n.type !== 'ticket'), 'Ticket notification dismissed');
});

console.log('Phase 1I Ticket-Removal-Tests: OK');
