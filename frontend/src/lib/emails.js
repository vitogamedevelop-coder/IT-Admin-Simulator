// Email registry.
// Phase 0 reset: legacy demo emails have been removed. The EmailApp
// infrastructure remains in place for future mission-driven emails.

export const exampleEmails = [];

export function readEmails() {
  try {
    return JSON.parse(localStorage.getItem('it-learn:emails') || '[]');
  } catch {
    return [];
  }
}

export function writeEmails(emails) {
  localStorage.setItem('it-learn:emails', JSON.stringify(emails));
}

export function seedEmails() {
  const stored = readEmails();
  if (stored.length > 0) return stored;
  writeEmails(exampleEmails);
  return exampleEmails;
}

export function markEmailRead(id) {
  const emails = readEmails().map((e) => (e.id === id ? { ...e, read: true } : e));
  writeEmails(emails);
  return emails;
}

export function emailById(id) {
  return readEmails().find((e) => e.id === id);
}

export function unreadEmailCount() {
  return readEmails().filter((e) => !e.read).length;
}

export function archiveEmail(id) {
  const emails = readEmails().map((e) => (e.id === id ? { ...e, archived: true } : e));
  writeEmails(emails);
  return emails;
}

export function emailDeliveredAt(email) {
  return email.deliveredAt || email.createdAt || email.date || 0;
}

export function sortEmailsByDelivery(emails) {
  return [...emails].sort((a, b) => emailDeliveredAt(b) - emailDeliveredAt(a));
}

export function archiveOldCompletedEmails(isCompletedFn, keep = 3) {
  const emails = readEmails();
  const completed = emails
    .map((e, i) => ({ email: e, index: i }))
    .filter(({ email }) => isCompletedFn(email) && !email.archived)
    .sort((a, b) => emailDeliveredAt(b.email) - emailDeliveredAt(a.email));
  const toArchive = new Set(completed.slice(keep).map(({ email }) => email.id));
  if (toArchive.size === 0) return emails;
  const next = emails.map((e) => (toArchive.has(e.id) ? { ...e, archived: true } : e));
  writeEmails(next);
  return next;
}
