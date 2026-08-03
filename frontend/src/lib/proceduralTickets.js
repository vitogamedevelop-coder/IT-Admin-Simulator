export const proceduralTicketTemplates = [
  {
    id: 'client-no-lease', domain: 'network', minStage: 1, prerequisites: ['dhcp-apipa'], channels: ['phone', 'monitor'], priorities: ['P2'],
    systems: ['CLIENT-{n}'], symptoms: ['Keine Verbindung zum Intranet', 'IPv4-Adresse beginnt mit 169.254'], causes: ['DHCP nicht erreichbar', 'Switchport ohne Link', 'falsches VLAN'],
    safeActions: ['Link prüfen', 'IP-Konfiguration lesen', 'DHCP-Pfad testen', 'Lease erneuern'], unsafeActions: ['Firewall dauerhaft deaktivieren', 'Client ohne Diagnose neu installieren'],
  },
  {
    id: 'stale-dns-record', domain: 'network', minStage: 1, prerequisites: ['dns-isolation'], channels: ['phone', 'mail', 'monitor'], priorities: ['P2'],
    systems: ['FS-{n}', 'APP-{n}', 'DC-{n}'], symptoms: ['Per IP erreichbar, per Name nicht', 'Name zeigt auf alte Adresse'], causes: ['veralteter A-Record', 'lokaler DNS-Cache', 'fehlgeschlagene DNS-Replikation'],
    safeActions: ['IP-Erreichbarkeit testen', 'DNS-Antwort prüfen', 'Record und Replikation validieren'], unsafeActions: ['hosts-Datei flächendeckend ändern', 'Server ohne Prüfung neu installieren'],
  },
  {
    id: 'share-permission', domain: 'windows', minStage: 1, prerequisites: ['effective-permissions'], channels: ['phone', 'mail'], priorities: ['P2', 'P3'],
    systems: ['FS-{n}'], symptoms: ['Freigabe sichtbar, Änderung nicht möglich', 'Zugriff nur lesend'], causes: ['restriktive NTFS-Rechte', 'fehlende Gruppenmitgliedschaft', 'altes Anmeldetoken'],
    safeActions: ['Gruppenmitgliedschaft prüfen', 'effektive Rechte ermitteln', 'AGDLP anwenden'], unsafeActions: ['direkten Vollzugriff vergeben', 'gemeinsames Administratorkonto verwenden'],
  },
  {
    id: 'linux-disk-pressure', domain: 'linux', minStage: 2, prerequisites: ['Linux'], channels: ['monitor'], priorities: ['P1', 'P2'],
    systems: ['WEB-LNX-{n}'], symptoms: ['Root-Dateisystem über 90 Prozent', 'Dienst schreibt keine Logs mehr'], causes: ['unkontrolliertes Logwachstum', 'verwaiste temporäre Dateien', 'fehlende Logrotation'],
    safeActions: ['df und du auswerten', 'offene Dateien prüfen', 'Logrotation reparieren'], unsafeActions: ['Logs ungeprüft vollständig löschen', 'Dateisystem ohne Ursachenanalyse erweitern'],
  },
  {
    id: 'backup-restore-check', domain: 'resilience', minStage: 3, prerequisites: ['backup-restore'], channels: ['mail', 'monitor'], priorities: ['P2', 'P3'],
    systems: ['BACKUP-{n}'], symptoms: ['Backupjob erfolgreich, Restore ungeprüft', 'letzter Test überfällig'], causes: ['fehlender Restore-Test', 'abgelaufene Credentials', 'unvollständige Sicherung'],
    safeActions: ['isolierten Restore testen', 'Integrität und Berechtigungen validieren', 'RPO und RTO dokumentieren'], unsafeActions: ['grünen Jobstatus als Beweis akzeptieren', 'RAID als Backup behandeln'],
  },
  {
    id: 'privileged-account', domain: 'security', minStage: 3, prerequisites: ['incident-containment'], channels: ['monitor'], priorities: ['P1'],
    systems: ['DC-{n}', 'SRV-{n}'], symptoms: ['Unbekanntes Administratorkonto', 'Anmeldung außerhalb der Geschäftszeit'], causes: ['kompromittiertes Servicekonto', 'unautorisierte Änderung', 'unzureichend geschütztes Administratorkonto'],
    safeActions: ['Zugriff eindämmen', 'Logs und Zeitlinie sichern', 'Credentials rotieren', 'Umfang untersuchen'], unsafeActions: ['Logs löschen', 'nur das neue Konto entfernen und schließen'],
  },
];

export function eligibleTicketTemplates({ stage, unlockedObjectives }) {
  const known = new Set(unlockedObjectives);
  return proceduralTicketTemplates.filter((template) => template.minStage <= stage && template.prerequisites.every((item) => known.has(item) || known.has(template.domain)));
}

export function instantiateTicket(template, seed = Date.now()) {
  const choose = (values, offset) => values[(seed + offset) % values.length];
  const number = 1 + (seed % 24);
  return {
    templateId: template.id,
    system: choose(template.systems, 1).replace('{n}', String(number).padStart(2, '0')),
    symptom: choose(template.symptoms, 2),
    cause: choose(template.causes, 3),
    priority: choose(template.priorities, 4),
    channel: choose(template.channels, 5),
    safeActions: template.safeActions,
    unsafeActions: template.unsafeActions,
    generatedAt: Date.now(),
  };
}
