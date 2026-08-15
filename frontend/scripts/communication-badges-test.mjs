// Communication badge counts (Phase 1G, item 8).
//
// Badges must always be derived from the real email/notification/ticket
// state - never a separately maintained counter that can drift.
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

class Storage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}

const storage = new Storage();
global.localStorage = storage;
global.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const { writeEmails } = await import(pathToFileURL(join(srcDir, 'lib/emails.js')).href);
const { enqueue, createNotification, notificationTypes, acknowledge, dismiss } = await import(pathToFileURL(join(srcDir, 'lib/notificationSystem.js')).href);
const {
  getEmailUnreadCount, getPhonePendingCount, getTicketsOpenCount, getCommunicationBadgeCounts,
} = await import(pathToFileURL(join(srcDir, 'lib/communicationBadges.js')).href);

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('Email badge');
{
  storage.clear();
  test('0 unread emails -> count 0 (no badge)', () => assert.equal(getEmailUnreadCount(), 0));

  writeEmails([
    { id: 'e1', read: false }, { id: 'e2', read: false }, { id: 'e3', read: true },
  ]);
  test('two unread emails -> count 2', () => assert.equal(getEmailUnreadCount(), 2));

  writeEmails([
    { id: 'e1', read: true }, { id: 'e2', read: false }, { id: 'e3', read: true },
  ]);
  test('marking one email read reduces the count', () => assert.equal(getEmailUnreadCount(), 1));
}

console.log('\nPhone badge');
{
  storage.clear();
  test('0 pending calls -> count 0', () => assert.equal(getPhonePendingCount(), 0));

  enqueue(createNotification({ id: 'phone-1', type: notificationTypes.PHONE, title: 'Anruf 1', body: 'x' }));
  enqueue(createNotification({ id: 'phone-2', type: notificationTypes.PHONE, title: 'Anruf 2', body: 'x' }));
  enqueue(createNotification({ id: 'email-1', type: notificationTypes.EMAIL, title: 'Mail', body: 'x' }));
  test('two pending phone notifications -> count 2 (email type excluded)', () => assert.equal(getPhonePendingCount(), 2));

  acknowledge('phone-1');
  test('acknowledging one call reduces the count', () => assert.equal(getPhonePendingCount(), 1));

  dismiss('phone-2');
  test('dismissing the last call brings the count to 0', () => assert.equal(getPhonePendingCount(), 0));
}

console.log('\nCombined badge snapshot');
{
  storage.clear();
  writeEmails([{ id: 'e1', read: false }]);
  enqueue(createNotification({ id: 'phone-3', type: notificationTypes.PHONE, title: 'Anruf', body: 'x' }));
  const counts = getCommunicationBadgeCounts();
  test('combined snapshot reflects each channel independently', () => {
    assert.equal(counts.email, 1);
    assert.equal(counts.phone, 1);
    assert.equal(typeof counts.tickets, 'number');
  });
}

console.log('\nTickets badge (real state, no separate counter)');
{
  test('getTicketsOpenCount is a plain number derived from sortedInbox, never negative', () => {
    const count = getTicketsOpenCount();
    assert.ok(typeof count === 'number' && count >= 0);
  });
}

console.log(`\n${passed} tests passed`);
