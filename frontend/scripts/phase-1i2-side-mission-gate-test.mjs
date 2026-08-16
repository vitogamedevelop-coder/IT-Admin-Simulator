import assert from 'node:assert/strict';
import { getNextMainMission, getCompletedProgressSideMissions } from '../src/lib/objectives.js';
import {
  readGameState, writeGameState, completeCiscoSideMission,
} from '../src/lib/gameState.js';
import { resolveSideMission, sortedInbox } from '../src/lib/sideMissionEngine.js';
import { deliverMissionInstance } from '../src/lib/missionGenerator.js';
import { readEmails, archiveOldCompletedEmails } from '../src/lib/emails.js';

function withLocalStorage(fn) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.window = globalThis.window || { dispatchEvent: () => {} };
  try {
    fn();
  } finally {
    delete globalThis.localStorage;
  }
}

function baseState() {
  const state = readGameState();
  state.completedQuests = ['cisco-main-001'];
  state.completedCiscoSideMissions = [];
  state.completedSideMissions = [];
  state.sideMissionHistory = {};
  return writeGameState(state);
}

// 1. After Main 001, Main 002 requires 2 side missions.
withLocalStorage(() => {
  baseState();
  const main = getNextMainMission();
  assert.equal(main.quest.id, 'cisco-main-002');
  assert.equal(main.available, false);
  assert.equal(main.sideProgress.needed, 2);
  assert.equal(main.sideProgress.completed, 0);
  assert.ok(main.reasons.some((r) => r.includes('Noch 2 Nebenmissionen erforderlich')));
});

// 2. One fixed Cisco side mission reduces remaining to 1.
withLocalStorage(() => {
  baseState();
  completeCiscoSideMission('cisco-side-basic-001', { xp: 20 });
  const main = getNextMainMission();
  assert.equal(main.sideProgress.completed, 1);
  assert.equal(main.sideProgress.needed, 2);
  assert.ok(main.reasons.some((r) => r.includes('Noch 1 Nebenmission')));
});

// 3. A second valid side mission (procedural) unlocks Main 002.
withLocalStorage(() => {
  baseState();
  completeCiscoSideMission('cisco-side-basic-001', { xp: 20 });
  const state = readGameState();
  state.inbox = [{
    id: 'proc-001',
    topic: 'Netzwerk',
    channel: 'mail',
    priority: 'P2',
    countsTowardStoryGate: true,
    createdAt: Date.now(),
    resolved: false,
  }];
  writeGameState(state);
  resolveSideMission('proc-001', true);
  const main = getNextMainMission();
  assert.equal(main.available, true, 'Main 002 should be available after 2 valid side missions');
  assert.equal(main.sideProgress.completed, 2);
  assert.equal(main.sideProgress.needed, 2);
});

// 4. Additional side missions keep Main 002 unlocked without inflating the counter.
withLocalStorage(() => {
  baseState();
  completeCiscoSideMission('cisco-side-basic-001', { xp: 20 });
  completeCiscoSideMission('cisco-side-basic-002', { xp: 20 });
  completeCiscoSideMission('cisco-side-basic-003', { xp: 20 });
  const main = getNextMainMission();
  assert.equal(main.available, true);
  assert.equal(main.sideProgress.completed, 2);
});

// 5. Duplicate completion of the same missionInstanceId counts only once.
withLocalStorage(() => {
  baseState();
  completeCiscoSideMission('cisco-side-basic-001', { xp: 20 });
  completeCiscoSideMission('cisco-side-basic-001', { xp: 20 });
  const completed = getCompletedProgressSideMissions(readGameState());
  assert.equal(completed.size, 1);
});

// 6. Procedural delivery is idempotent: same instance/channel creates one mail.
withLocalStorage(() => {
  baseState();
  const instance = {
    instanceId: 'test-instance-1',
    templateId: 'cisco-vlan-access-port',
    channel: 'email',
    title: 'SW-HQ-03 Sicherheits-Audit',
    briefing: 'Test mission briefing',
    status: 'available',
  };
  const first = deliverMissionInstance(instance);
  const second = deliverMissionInstance(instance);
  assert.ok(first, 'First delivery succeeds');
  assert.equal(second, false, 'Duplicate delivery is rejected');
  assert.equal(readEmails().length, 1, 'Only one email exists for the same instance + channel');
});

// 7. Mail inbox is sorted newest-first and completed mails beyond the newest 3 are archived.
withLocalStorage(() => {
  baseState();
  const now = Date.now();
  const emails = [
    { id: 'old-1', subject: 'Old 1', read: true, archived: false, completed: true, date: now - 50000, linkedMissionId: 'm1' },
    { id: 'old-2', subject: 'Old 2', read: true, archived: false, completed: true, date: now - 40000, linkedMissionId: 'm2' },
    { id: 'old-3', subject: 'Old 3', read: true, archived: false, completed: true, date: now - 30000, linkedMissionId: 'm3' },
    { id: 'old-4', subject: 'Old 4', read: true, archived: false, completed: true, date: now - 20000, linkedMissionId: 'm4' },
    { id: 'open-1', subject: 'Open 1', read: false, archived: false, completed: false, date: now - 10000, linkedMissionId: 'm5' },
    { id: 'open-2', subject: 'Open 2', read: false, archived: false, completed: false, date: now, linkedMissionId: 'm6' },
  ];
  globalThis.localStorage.setItem('it-learn:emails', JSON.stringify(emails));
  archiveOldCompletedEmails((e) => !!e.completed, 3);
  const visible = readEmails().filter((e) => !e.archived).sort((a, b) => b.date - a.date);
  assert.equal(visible.length, 5, 'All open mails plus 3 newest completed mails are visible');
  assert.equal(visible[0].id, 'open-2');
  assert.equal(visible[3].id, 'old-3');
  assert.equal(visible[4].id, 'old-2');
  assert.equal(readEmails().find((e) => e.id === 'old-1')?.archived, true);
});

// 8. Inbox (side mission engine) sorts newest first and keeps resolved items briefly visible.
withLocalStorage(() => {
  baseState();
  const state = readGameState();
  const now = Date.now();
  state.inbox = [
    { id: 'a', topic: 'Netzwerk', channel: 'mail', priority: 'P2', countsTowardStoryGate: true, createdAt: now - 3000, resolved: true, resolvedAt: now - 3000 },
    { id: 'b', topic: 'Netzwerk', channel: 'mail', priority: 'P2', countsTowardStoryGate: true, createdAt: now - 2000, resolved: false },
    { id: 'c', topic: 'Netzwerk', channel: 'mail', priority: 'P2', countsTowardStoryGate: true, createdAt: now - 1000, resolved: true, resolvedAt: now - 1000 },
    { id: 'd', topic: 'Netzwerk', channel: 'mail', priority: 'P2', countsTowardStoryGate: true, createdAt: now, resolved: false },
  ];
  writeGameState(state);
  const visible = sortedInbox();
  assert.equal(visible[0].id, 'd');
  assert.equal(visible[1].id, 'c');
  assert.equal(visible[2].id, 'b');
  assert.equal(visible[3].id, 'a');
});

console.log('✅ phase-1i2-side-mission-gate-test.mjs passed');
