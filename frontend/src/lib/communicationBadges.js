// Communication badge counts (Phase 1G, item 8).
//
// A single source of truth for "how many unread/open items exist in this
// communication channel". Every badge shown anywhere in the UI (desktop
// icons, hotspot dots, app headers) must be derived from this - never from
// a separately maintained counter that can drift out of sync with the real
// mail/notification/ticket state.
import { readEmails } from './emails.js';
import { readNotifications, pendingNotifications, notificationTypes } from './notificationSystem.js';
import { sortedInbox } from './sideMissionEngine.js';

export function getEmailUnreadCount() {
  return readEmails().filter((e) => !e.read).length;
}

export function getPhonePendingCount() {
  return pendingNotifications(readNotifications()).filter((n) => n.type === notificationTypes.PHONE).length;
}

export function getTicketsOpenCount() {
  return sortedInbox().filter((item) => !item.resolved).length;
}

// Combined snapshot for components that need more than one channel at once.
export function getCommunicationBadgeCounts() {
  return {
    email: getEmailUnreadCount(),
    phone: getPhonePendingCount(),
    tickets: getTicketsOpenCount(),
  };
}
