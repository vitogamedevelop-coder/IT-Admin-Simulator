const KEY = 'it-learn:notebook';

export const notebookCategories = [
  { id: 'terminal', label: 'Terminalbefehle' },
  { id: 'network', label: 'Netzwerkgrundlagen' },
  { id: 'osi', label: 'OSI-Modell' },
  { id: 'protocols', label: 'Protokolle & Ports' },
  { id: 'ad', label: 'Active Directory' },
  { id: 'windows', label: 'Windows' },
  { id: 'linux', label: 'Linux' },
  { id: 'security', label: 'IT-Sicherheit' },
  { id: 'troubleshooting', label: 'Fehlersuche' },
];

const defaultEntries = [
  {
    id: 'note-ipconfig',
    category: 'terminal',
    title: 'ipconfig /all',
    explanation: 'Zeigt die aktuelle IPv4-Konfiguration eines Windows-Clients an: IP-Adresse, Subnetzmaske, Standardgateway, DNS-Server, DHCP-Status und MAC-Adresse.',
    syntax: 'ipconfig [/all] [/release] [/renew] [/flushdns]',
    example: 'ipconfig /all',
    useCase: 'Erster Befehl bei Netzwerkproblemen, um die lokale Konfiguration zu prüfen.',
    unlocked: false,
  },
  {
    id: 'note-ping',
    category: 'terminal',
    title: 'ping',
    explanation: 'Prüft mit ICMP-Echo-Anfragen, ob ein Ziel im Netzwerk erreichbar ist.',
    syntax: 'ping <Ziel>',
    example: 'ping 192.168.10.1',
    useCase: 'Trennt Schicht-1- und Schicht-3-Probleme von Anwendungsproblemen.',
    unlocked: false,
  },
  {
    id: 'note-nslookup',
    category: 'terminal',
    title: 'nslookup',
    explanation: 'Fragt einen DNS-Server nach der Auflösung eines Namens in eine IP-Adresse.',
    syntax: 'nslookup <Name>',
    example: 'nslookup fs01.nexus.local',
    useCase: 'Namensauflösung isolieren, wenn ein Ziel per IP erreichbar ist, aber nicht per Name.',
    unlocked: false,
  },
];

export function readNotebook() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.entries) return saved;
  } catch {
    // fall through
  }
  return { entries: defaultEntries, lastSeenAt: null };
}

export function writeNotebook(notebook) {
  localStorage.setItem(KEY, JSON.stringify(notebook));
}

export function seedNotebook() {
  const notebook = readNotebook();
  if (!notebook.entries || notebook.entries.length === 0) {
    writeNotebook({ entries: defaultEntries, lastSeenAt: null });
    return { entries: defaultEntries, lastSeenAt: null };
  }
  return notebook;
}

export function unlockNotebookEntries(questId) {
  const notebook = readNotebook();
  let changed = false;
  notebook.entries = notebook.entries.map((entry) => {
    if (entry.unlockedBy === questId && !entry.unlocked) {
      changed = true;
      return { ...entry, unlocked: true, unlockedAt: Date.now() };
    }
    return entry;
  });
  if (changed) writeNotebook(notebook);
  return notebook;
}

export function notebookEntryById(id) {
  return readNotebook().entries.find((e) => e.id === id);
}

export function unlockedNotebookCount() {
  return readNotebook().entries.filter((e) => e.unlocked).length;
}
