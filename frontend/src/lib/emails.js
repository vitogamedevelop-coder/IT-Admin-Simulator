export const exampleEmails = [
  {
    id: 'intro-ipconfig',
    from: { name: 'Mara König', role: 'Helpdesk', personId: 'mara' },
    to: ['Operator'],
    subject: 'Neuer Mitarbeiter ohne Netzwerk',
    date: '2026-07-27T08:17:00+02:00',
    body: 'Guten Morgen,\n\nseit heute Morgen kann ein neuer Mitarbeiter weder das Intranet noch den Fileserver erreichen. Seine Kollegen im selben Büro haben keine Probleme.\n\nKönnten Sie sich das bitte ansehen? Ich habe den Arbeitsplatz als PC-12 in unserer Übersicht markiert.\n\nViele Grüße\nMara König\nHelpdesk',
    priority: 'high',
    read: false,
    attachments: [],
    replies: [
      { label: 'Ich kümmere mich darum.', nextId: null },
    ],
    linkedMissionId: 'first-day',
  },
  {
    id: 'dns-outage-email',
    from: { name: 'David Chen', role: 'Entwicklung', personId: 'david' },
    to: ['Operator', 'Helpdesk'],
    subject: 'Fileserver nicht per Namen erreichbar',
    date: '2026-07-27T09:42:00+02:00',
    body: 'Hallo,\n\n18 Kollegen aus dem Vertrieb können seit kurzem \\FS01\\Vertrieb nicht mehr öffnen. Wenn sie die IP-Adresse direkt verwenden, funktioniert der Zugriff.\n\nKönnten Sie prüfen, ob der DNS-Eintrag noch stimmt?\n\nDanke\nDavid',
    priority: 'high',
    read: false,
    attachments: [],
    linkedMissionId: 'dns-outage',
  },
];

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
