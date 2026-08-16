// Regression test for React error #301 / infinite re-render hotfix.
// Verifies that read paths in sideMissionEngine and objectives.js are pure:
// they must NOT dispatch state events or write localStorage while reading.

import assert from 'node:assert/strict';
import { readGameState, writeGameState } from '../src/lib/gameState.js';
import {
  resolveSideMission, getVisibleInbox, sortedInbox, performInboxRetention,
} from '../src/lib/sideMissionEngine.js';
import { getRecommendedSideMissions, getCurrentPlayerObjectives } from '../src/lib/objectives.js';

function runInCleanStore(fn) {
  const store = new Map();
  const dispatched = [];
  let setItemCalls = 0;
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => { setItemCalls += 1; store.set(k, String(v)); },
    removeItem: (k) => store.delete(k),
  };
  globalThis.window = { dispatchEvent: (e) => { dispatched.push(e.type); return true; } };
  try {
    fn({ store, dispatched, setItemCalls: () => setItemCalls });
  } finally {
    delete globalThis.localStorage;
  }
}

function baseState() {
  const s = readGameState();
  s.completedQuests = ['cisco-main-001'];
  s.completedCiscoSideMissions = [];
  s.completedSideMissions = [];
  s.sideMissionHistory = {};
  s.inbox = [];
  s.lastEventDate = new Date().toISOString().slice(0, 10);
  return writeGameState(s);
}

function resetCounters(ctx) {
  ctx.dispatched.length = 0;
}

function gameStateWrites(ctx) {
  return ctx.dispatched.filter((t) => t === 'it-learn:game-state').length;
}

console.log('1. getVisibleInbox is a pure read');
runInCleanStore((ctx) => {
  baseState();
  const s = readGameState();
  s.inbox = [
    { id: 'a', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 1000, createdAt: Date.now() - 1000 },
    { id: 'b', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 2000, createdAt: Date.now() - 2000 },
    { id: 'c', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 3000, createdAt: Date.now() - 3000 },
    { id: 'd', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 4000, createdAt: Date.now() - 4000 },
    { id: 'open', topic: 'Netzwerk', resolved: false, archived: false, createdAt: Date.now() },
  ];
  writeGameState(s);
  resetCounters(ctx);

  const visible = getVisibleInbox();
  assert.strictEqual(visible.length, 5, 'getVisibleInbox should return all non-archived items');
  assert.strictEqual(gameStateWrites(ctx), 0, 'getVisibleInbox must NOT dispatch game-state event');

  // repeated calls remain stable and still do not write
  getVisibleInbox();
  getVisibleInbox();
  assert.strictEqual(gameStateWrites(ctx), 0, 'getVisibleInbox must stay pure across repeated calls');
});

console.log('2. getRecommendedSideMissions / getCurrentPlayerObjectives are pure reads');
runInCleanStore((ctx) => {
  baseState();
  const s = readGameState();
  s.inbox = [
    { id: 'open1', topic: 'Netzwerk', resolved: false, archived: false, createdAt: Date.now() - 500 },
    { id: 'open2', topic: 'Netzwerk', resolved: false, archived: false, createdAt: Date.now() },
  ];
  writeGameState(s);
  resetCounters(ctx);

  getRecommendedSideMissions(2);
  getCurrentPlayerObjectives();
  getCurrentPlayerObjectives();
  assert.strictEqual(gameStateWrites(ctx), 0, 'objective read helpers must NOT dispatch game-state event');
});

console.log('3. sortedInbox no longer triggers writes after initialisation');
runInCleanStore((ctx) => {
  baseState();
  resetCounters(ctx);
  const list = sortedInbox();
  assert.ok(Array.isArray(list));
  // After the initial ensureInbox call (same day, no prune change), there must
  // be no game-state write caused by simply reading the inbox.
  assert.strictEqual(gameStateWrites(ctx), 0, 'sortedInbox should not write game-state when nothing changed');
});

console.log('4. resolveSideMission performs retention and keeps at most 3 resolved visible');
runInCleanStore((_ctx) => {
  baseState();
  const s = readGameState();
  s.inbox = [
    { id: 'old1', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 4000, createdAt: Date.now() - 4000 },
    { id: 'old2', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 3000, createdAt: Date.now() - 3000 },
    { id: 'old3', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 2000, createdAt: Date.now() - 2000 },
    { id: 'old4', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 1000, createdAt: Date.now() - 1000 },
    { id: 'new', topic: 'Netzwerk', resolved: false, archived: false, createdAt: Date.now() },
  ];
  writeGameState(s);

  resolveSideMission('new', true);
  const visible = getVisibleInbox();
  const resolvedVisible = visible.filter((i) => i.resolved);
  assert.strictEqual(resolvedVisible.length, 3, 'after completing a mission, only the newest 3 resolved items stay visible');
  assert.ok(!visible.some((i) => i.id === 'old1'), 'oldest resolved item should be archived');
});

console.log('5. performInboxRetention is idempotent');
runInCleanStore((ctx) => {
  baseState();
  const s = readGameState();
  s.inbox = [
    { id: 'old1', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 3000, createdAt: Date.now() - 3000 },
    { id: 'old2', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 2000, createdAt: Date.now() - 2000 },
    { id: 'old3', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now() - 1000, createdAt: Date.now() - 1000 },
    { id: 'new', topic: 'Netzwerk', resolved: true, archived: false, resolvedAt: Date.now(), createdAt: Date.now() },
  ];
  writeGameState(s);
  resetCounters(ctx);
  performInboxRetention();
  const afterFirst = gameStateWrites(ctx);
  resetCounters(ctx);
  performInboxRetention();
  assert.strictEqual(gameStateWrites(ctx), 0, 'second retention should be a no-op when state already pruned');
  assert.ok(afterFirst >= 1, 'first retention should write if it changed state');
});

console.log('✅ React #301 regression tests passed');
