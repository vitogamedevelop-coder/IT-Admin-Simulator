export const learningObjectives = [
  {
    id: 'dhcp-apipa', topic: 'DHCP', title: 'Fehlende DHCP-Zuweisung erkennen', prerequisites: ['ipv4-basic'], unlockQuest: 'first-day',
    variants: [
      { type: 'evidence', prompt: 'Ein Client zeigt 169.254.44.12 und kein Gateway. Was ist die wahrscheinlichste Ursache?', options: ['Kein DHCP-Lease erhalten', 'DNS-Zone defekt', 'NTFS-Rechte fehlen'], answer: 'Kein DHCP-Lease erhalten', explanation: '169.254.0.0/16 ist APIPA und wird ohne DHCP-Lease verwendet.' },
      { type: 'action', prompt: 'Welche Reihenfolge ist bei einem APIPA-Client fachlich sinnvoll?', options: ['Link prüfen → DHCP-Erreichbarkeit → Lease erneuern', 'Firewall abschalten → Neustart → Browsercache', 'DNS leeren → Benutzer löschen'], answer: 'Link prüfen → DHCP-Erreichbarkeit → Lease erneuern', explanation: 'Zuerst physische Verbindung, dann Dienstpfad und anschließend erneute Zuweisung.' },
      { type: 'explain', prompt: 'Mara aus dem Helpdesk fragt: „Warum ist 169.254.x.x ein Warnsignal?“ Erkläre es kurz.', keywords: ['dhcp', 'lease', 'automatisch'], sample: 'Der Client hat keinen DHCP-Lease erhalten und sich deshalb automatisch eine APIPA-Adresse gegeben.' },
    ],
  },
  {
    id: 'dns-isolation', topic: 'DNS', title: 'Namensauflösung als Fehlerquelle isolieren', prerequisites: ['ipv4-basic'], unlockQuest: 'dns-outage',
    variants: [
      { type: 'evidence', prompt: 'FS01 antwortet per IP, aber nicht per Hostname. Welcher Bereich ist primär verdächtig?', options: ['DNS-Namensauflösung', 'Ethernet-Link', 'NTFS'], answer: 'DNS-Namensauflösung', explanation: 'Die IP-Erreichbarkeit bestätigt Link und Routing; der Unterschied liegt beim Namen.' },
      { type: 'action', prompt: 'Welche Diagnose trennt DNS sauber von allgemeiner Erreichbarkeit?', options: ['ping IP, dann nslookup Name', 'Nur Browser öffnen', 'Server ohne Prüfung neu starten'], answer: 'ping IP, dann nslookup Name', explanation: 'Getrennte Tests zeigen, ob IP-Kommunikation und Namensauflösung unabhängig funktionieren.' },
      { type: 'explain', prompt: 'David aus der Entwicklung fragt: „Warum kann ein Server per IP funktionieren, aber per Name nicht?“', keywords: ['dns', 'name', 'ip'], sample: 'Die Netzwerkverbindung zur IP funktioniert, aber DNS übersetzt den Namen nicht in die richtige IP-Adresse.' },
    ],
  },
  {
    id: 'effective-permissions', topic: 'Berechtigungen', title: 'Effektive Freigabe- und NTFS-Rechte bestimmen', prerequisites: ['identity-basic'], unlockQuest: 'permissions',
    variants: [
      { type: 'evidence', prompt: 'Freigaberecht ist Ändern, NTFS ist Lesen. Was darf der Benutzer über das Netzwerk?', options: ['Lesen', 'Ändern', 'Vollzugriff'], answer: 'Lesen', explanation: 'Die restriktivere Kombination begrenzt den effektiven Zugriff.' },
      { type: 'action', prompt: 'Wie vergibst du Projektzugriff langfristig wartbar?', options: ['Über Rollen- und Ressourcengruppen', 'Direkter Vollzugriff pro Benutzer', 'Gemeinsames Administratorkonto'], answer: 'Über Rollen- und Ressourcengruppen', explanation: 'Gruppenbasierte Rechte nach AGDLP sind nachvollziehbar und wartbar.' },
      { type: 'explain', prompt: 'Mara fragt: „Warum reicht das Freigaberecht Ändern nicht aus?“', keywords: ['ntfs', 'restriktiv', 'berechtigung'], sample: 'Beim Netzwerkzugriff werden Freigabe- und NTFS-Rechte kombiniert; die restriktivere Berechtigung gilt.' },
    ],
  },
  {
    id: 'incident-containment', topic: 'IT-Sicherheit', title: 'Sicherheitsvorfälle kontrolliert eindämmen', prerequisites: ['monitoring-baseline', 'identity-basic'], unlockQuest: 'security-incident',
    variants: [
      { type: 'evidence', prompt: 'Ein unbekanntes Administratorkonto wurde angelegt. Was muss erhalten bleiben?', options: ['Logs und Zeitlinie', 'Nur ein Screenshot', 'Keine Daten'], answer: 'Logs und Zeitlinie', explanation: 'Beweisdaten werden für Umfang, Ursprung und Nachbereitung benötigt.' },
      { type: 'action', prompt: 'Welche Erstmaßnahme ist angemessen?', options: ['Zugriff eindämmen und Beweise sichern', 'Alle Logs löschen', 'Bis morgen warten'], answer: 'Zugriff eindämmen und Beweise sichern', explanation: 'Eindämmung begrenzt Schaden, Beweissicherung erhält die Untersuchbarkeit.' },
      { type: 'explain', prompt: 'Lea aus dem SOC fragt: „Warum löschen wir das Konto nicht einfach und machen weiter?“', keywords: ['ursache', 'beweise', 'kompromitt'], sample: 'Das Konto kann nur ein Symptom sein. Wir müssen Beweise erhalten, die Ursache und weitere Kompromittierungen untersuchen.' },
    ],
  },
  {
    id: 'backup-restore', topic: 'Backup', title: 'Backups durch Restore-Tests validieren', prerequisites: ['storage-basic'], unlockQuest: 'security-incident',
    variants: [
      { type: 'evidence', prompt: 'Der Backupjob ist grün. Was beweist wirklich die Wiederherstellbarkeit?', options: ['Ein erfolgreicher Restore-Test', 'Die grüne Farbe', 'Ein RAID'], answer: 'Ein erfolgreicher Restore-Test', explanation: 'Nur ein Restore validiert Daten, Verfahren und Zugriffsrechte.' },
      { type: 'action', prompt: 'Welche Backupstrategie reduziert gemeinsame Ausfallursachen?', options: ['3 Kopien, 2 Medien, 1 extern/offline', 'Eine Kopie auf demselben Server', 'Nur RAID 1'], answer: '3 Kopien, 2 Medien, 1 extern/offline', explanation: 'Die 3-2-1-Regel verteilt Kopien über Medien und Standorte.' },
      { type: 'explain', prompt: 'Herr Weber fragt: „Warum reicht unser RAID nicht als Backup?“', keywords: ['löschen', 'ransomware', 'kopie'], sample: 'RAID hilft bei Plattenausfällen, schützt aber nicht vor Löschen, Ransomware oder logischen Fehlern; dafür braucht es getrennte Kopien.' },
    ],
  },
];

export const foundationalObjectives = [
  { id: 'ipv4-basic', topic: 'Netzwerk', title: 'IPv4, Maske und Gateway unterscheiden' },
  { id: 'identity-basic', topic: 'Active Directory', title: 'Benutzer, Gruppen und Tokens verstehen' },
  { id: 'monitoring-baseline', topic: 'Monitoring', title: 'Normalzustand und Abweichung unterscheiden' },
  { id: 'storage-basic', topic: 'Backup', title: 'Speicherredundanz und Sicherung unterscheiden' },
];

export function objectivesUnlocked(completedQuests) {
  return learningObjectives.filter((objective) => completedQuests.includes(objective.unlockQuest));
}

export function objectiveById(id) {
  return learningObjectives.find((objective) => objective.id === id);
}
