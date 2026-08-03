// Milestone A ("Sam als Mentor & NEXUS Academy") prepares - but does NOT
// enforce - a link between missions and Academy topics:
//  - requiredAcademyTopics: topicKey ("categoryId/topicId") refs a mission
//    would eventually be gated behind. Currently informational only - no
//    code reads this to lock/unlock anything yet.
//  - recommendedAcademyTopics: topics that help with this mission, purely
//    informational (e.g. for a future "Sam empfiehlt..." hint).
// Both default to [] and are safe to ignore for any quest that doesn't set
// them - existing quests are unaffected.
export const quests = [
  {
    id: 'first-day', chapter: 1, title: 'Der erste Arbeitstag', subtitle: 'Arbeitsplatz ohne Netzwerk', department: 'Helpdesk', difficulty: 1, minutes: 4,
    requiredAcademyTopics: [], recommendedAcademyTopics: ['fundamentals/grundbegriffe'],
    briefing: '08:17 Uhr. Greta Müller aus der Buchhaltung ruft im Helpdesk an. Sie sitzt an PC-BUCH-01 und sagt: „Ich komme nicht ins Internet und unser Drucker geht auch nicht.“ Du öffnest das Verzeichnis: PC-BUCH-01 hat die IP 192.168.10.47, Standardgateway 192.168.10.1, DNS 192.168.10.10. Dein erster Einsatz bei NEXUS Systems.',
    checklist: [
      { id: 'cable', label: 'Kabel und Link-LED prüfen', done: false },
      { id: 'ipconfig', label: 'IP-Konfiguration mit ipconfig /all prüfen', done: false },
      { id: 'identify', label: 'APIPA erkennen (kein DHCP-Lease)', done: false },
      { id: 'renew', label: 'Neuen Lease mit ipconfig /renew anfordern', done: false },
      { id: 'test', label: 'Gateway, DNS und Internet testen', done: false },
    ],
    unlockTools: ['nslookup', 'Test-NetConnection'], unlockNotebook: ['note-ipconfig', 'note-ping'], infrastructureEffect: { clients: 'online' },
    steps: [
      { type: 'decision', prompt: 'Was prüfst du zuerst?', options: [
        { label: 'Lokale IP-Konfiguration mit ipconfig /all', correct: true, feedback: 'Guter Start: Du sammelst Fakten, bevor du Änderungen vornimmst.', effects: { helpdesk: 2 } },
        { label: 'Windows sofort neu installieren', correct: false, feedback: 'Zu invasiv. Eine strukturierte Diagnose ist schneller und sicherer.', effects: { management: -1 } },
        { label: 'Firewall dauerhaft deaktivieren', correct: false, feedback: 'Das erhöht das Risiko und erklärt die lokale Konfiguration nicht.', effects: { security: -2 } },
      ] },
      { type: 'evidence', prompt: 'Welche Information in der Ausgabe erklärt die Störung?', output: 'Ethernet-Adapter Büro:\n\n   Verbindungsspezifisches DNS-Suffix: nexus.local\n   IPv4-Adresse. . . . . . . . . . : 169.254.31.8\n   Subnetzmaske  . . . . . . . . . : 255.255.0.0\n   Standardgateway . . . . . . . . :\n   DHCP aktiviert. . . . . . . . . : Ja\n   Beschreibung . . . . . . . . . : Intel Ethernet Controller', irrelevant: 'Der Nutzer erwähnt zusätzlich, dass sein Mauszeiger seit heute etwas langsamer wirkt.', options: [
        { label: 'DHCP-Zuweisung ist fehlgeschlagen', correct: true, feedback: 'Richtig. APIPA wird vergeben, wenn kein DHCP-Lease empfangen wird.' },
        { label: 'DNS funktioniert perfekt', correct: false, feedback: 'DNS ist noch nicht relevant; der Client besitzt keine reguläre Netzkonfiguration.' },
        { label: 'Das ist eine öffentliche IP', correct: false, feedback: '169.254.0.0/16 ist Link-Local/APIPA.' },
      ] },
      { type: 'tool', prompt: 'Welchen nächsten Schritt führst du aus?', options: [
        { label: 'Kabel/Link prüfen und ipconfig /renew', correct: true, feedback: 'Du prüfst Schicht 1 und forderst anschließend einen neuen Lease an.' },
        { label: 'DNS-Cache leeren', correct: false, feedback: 'Ohne gültige IP und Gateway löst ein DNS-Flush das Problem nicht.' },
        { label: 'Browserdaten löschen', correct: false, feedback: 'Das Problem liegt unterhalb der Anwendungsschicht.' },
      ] },
      { type: 'result', prompt: 'Nach dem Renew erhält der Client 192.168.10.47/24 und Gateway 192.168.10.1. Was testest du nun?', options: [
        { label: 'Gateway, externe IP und danach DNS-Name', correct: true, feedback: 'Diese Reihenfolge trennt lokalen Link, Routing und Namensauflösung.' },
        { label: 'Nur den Browser', correct: false, feedback: 'Ein Browsertest trennt die möglichen Fehlerquellen nicht sauber.' },
      ] },
    ],
    reflection: {
      hypothesis: 'Der Client hat keinen DHCP-Lease erhalten (APIPA-Adresse 169.254.x.x).',
      decisiveInfo: 'Die ipconfig-Ausgabe zeigte eine APIPA-Adresse statt der erwarteten 192.168.10.x.',
      unnecessarySteps: 'DNS-Cache leeren oder Browserdaten entfernen bringt nichts, wenn das Problem auf Layer 2/3 liegt.',
      takeaway: 'APIPA (169.254.x.x) = DHCP-Lease fehlt. Erst Kabel, dann Lease erneuern.',
    },
    resolution: 'Der Switchport war kurzzeitig ohne Link; danach konnte DHCP wieder einen Lease vergeben. Du hast die Störung ohne riskante Änderungen eingegrenzt.',
  },
  {
    id: 'dns-outage', chapter: 2, title: 'Der verschwundene Fileserver', subtitle: 'DNS-Störung im Vertrieb', department: 'Netzwerk', difficulty: 2, minutes: 6,
    requiredAcademyTopics: [], recommendedAcademyTopics: ['fundamentals/dns'],
    requires: ['first-day'], briefing: '09:42 Uhr. Tom Schmid aus dem Vertrieb schreibt im Chat: „Wir können den Vertriebs-Ordner auf \\\\FS01\\Vertrieb nicht mehr öffnen. Der Server lässt sich aber anpingen.“ Du schaust ins Verzeichnis: FS01 hat die IP 192.168.10.10, FQDN fs01.nexus.local. 18 Kollegen im Vertrieb warten \\\\FS01\\Vertrieb nicht mehr. Per IP antwortet der Server, unter seinem Namen nicht.',
    checklist: [
      { id: 'ping', label: 'Erreichbarkeit per IP testen', done: false },
      { id: 'nslookup', label: 'DNS-Namensauflösung prüfen', done: false },
      { id: 'identify', label: 'Fehlerquelle eingrenzen (DNS vs. Netzwerk)', done: false },
      { id: 'fix', label: 'Korrekten DNS-Eintrag prüfen oder setzen', done: false },
      { id: 'verify', label: 'Zugriff auf \\\\FS01\\Vertrieb testen', done: false },
    ],
    unlockTools: ['tracert', 'Resolve-DnsName'], unlockNotebook: ['note-nslookup'], infrastructureEffect: { fileserver: 'online', domain: 'online' },
    steps: [
      { type: 'evidence', prompt: 'Welches Symptom grenzt den Fehler am besten ein?', options: [
        { label: 'Server per IP erreichbar, per Name nicht', correct: true, feedback: 'Das spricht deutlich für Namensauflösung statt Routing oder Kabel.' },
        { label: 'Maus reagiert langsam', correct: false, feedback: 'Das ist nicht mit dem Fileserverzugriff verbunden.' },
      ] },
      { type: 'tool', prompt: 'Welches Werkzeug verwendest du?', options: [
        { label: 'nslookup FS01', correct: true, feedback: 'Damit prüfst du die DNS-Antwort direkt.' },
        { label: 'format C:', correct: false, feedback: 'Das wäre destruktiv und fachlich unbegründet.' },
        { label: 'chkdsk', correct: false, feedback: 'Lokale Datenträgerprüfung untersucht keine DNS-Auflösung.' },
      ] },
      { type: 'evidence', prompt: 'Was ist anhand dieser Ausgabe die wahrscheinlichste Ursache?', output: 'C:\\> nslookup FS01\nServer:  DC01.nexus.local\nAddress:  192.168.10.10\n\nName:    FS01.nexus.local\nAddress:  192.168.10.25\n\nAktuelle dokumentierte Server-IP: 192.168.10.45', irrelevant: 'Ein Mitarbeiter berichtet gleichzeitig, dass sein Monitor kurz geflackert habe.', options: [
        { label: 'Veralteter DNS-A-Record oder Cache', correct: true, feedback: 'Genau. Der Name zeigt noch auf die vorherige Adresse.' },
        { label: 'Defektes Ethernetkabel aller Nutzer', correct: false, feedback: 'Die Erreichbarkeit per IP widerspricht einem Kabelproblem.' },
        { label: 'Falsche NTFS-Rechte', correct: false, feedback: 'Berechtigungen ändern nicht die aufgelöste IP-Adresse.' },
      ] },
      { type: 'decision', prompt: 'Welche Reparatur ist sicher und nachhaltig?', options: [
        { label: 'DNS-Eintrag korrigieren, Replikation prüfen, Cache gezielt leeren', correct: true, feedback: 'Du behebst Ursache und prüfst anschließend die Verteilung.', effects: { management: 2, security: 1 } },
        { label: 'Auf jedem PC die hosts-Datei ändern', correct: false, feedback: 'Das erzeugt unverwaltete Sonderlösungen und technischen Schulden.', effects: { management: -2 } },
      ] },
      { type: 'documentation', prompt: 'Was gehört in die Abschlussdokumentation?', options: [
        { label: 'Symptom, Ursache, Änderung, Test und betroffene Systeme', correct: true, feedback: 'Damit ist der Vorfall später nachvollziehbar.' },
        { label: 'Nur „geht wieder“', correct: false, feedback: 'Das hilft bei wiederkehrenden Problemen nicht.' },
      ] },
    ],
    reflection: {
      hypothesis: 'Der DNS-A-Record von FS01 zeigt auf eine veraltete IP-Adresse.',
      decisiveInfo: 'nslookup lieferte IP 192.168.10.25, die dokumentierte IP war 192.168.10.45.',
      unnecessarySteps: 'Kabeltest oder chkdsk waren nicht relevant, da der Server per IP erreichbar war.',
      takeaway: 'Server per IP erreichbar, per Name nicht = DNS-Problem. Immer nslookup nutzen.',
    },
    resolution: 'Ein veralteter A-Record verwies auf die alte Server-IP. Nach Korrektur, Replikationsprüfung und Cache-Aktualisierung war die Freigabe wieder erreichbar.',
  },
  {
    id: 'permissions', chapter: 2, title: 'Zugriff verweigert', subtitle: 'Berechtigungsfall im Projektteam', department: 'Windows', difficulty: 2, minutes: 6,
    requires: ['first-day'], briefing: '11:05 Uhr. Sabine Lorenz aus dem Projektteam sieht die Freigabe, kann aber keine Dateien ändern. Andere Teammitglieder können es.',
    checklist: [
      { id: 'identity', label: 'Gruppenmitgliedschaften der Benutzerin prüfen', done: false },
      { id: 'share', label: 'Freigabe- und NTFS-Rechte vergleichen', done: false },
      { id: 'fix', label: 'Korrekte Gruppe nach AGDLP zuweisen', done: false },
      { id: 'token', label: 'Neuanmeldung für aktualisiertes Token', done: false },
    ],
    unlockTools: ['Get-ADUser', 'Get-Acl'], unlockInfrastructure: ['linux'],
    steps: [
      { type: 'decision', prompt: 'Welche Information prüfst du zuerst?', options: [
        { label: 'Gruppenmitgliedschaften sowie Freigabe- und NTFS-Rechte', correct: true, feedback: 'Du prüfst Identität und beide Berechtigungsebenen.' },
        { label: 'Server neu starten', correct: false, feedback: 'Das behebt keine fehlende Gruppenmitgliedschaft.' },
      ] },
      { type: 'evidence', prompt: 'Freigabe: Ändern. NTFS: Lesen. Was ist effektiv erlaubt?', options: [
        { label: 'Lesen', correct: true, feedback: 'Die restriktivere Kombination gilt.' },
        { label: 'Ändern', correct: false, feedback: 'NTFS begrenzt den Zugriff auf Lesen.' },
        { label: 'Vollzugriff', correct: false, feedback: 'Keine der Ebenen gewährt Vollzugriff.' },
      ] },
      { type: 'decision', prompt: 'Wie setzt du die Berechtigung wartbar um?', options: [
        { label: 'Benutzer in passende globale Gruppe, diese in Ressourcengruppe', correct: true, feedback: 'Das folgt AGDLP und bleibt nachvollziehbar.', effects: { security: 2 } },
        { label: 'Direkte Vollzugriffsberechtigung für den Benutzer', correct: false, feedback: 'Einzelrechte sind schwer wartbar und meist zu weitgehend.', effects: { security: -2 } },
      ] },
      { type: 'result', prompt: 'Die Gruppe wurde ergänzt, aber der Zugriff bleibt zunächst unverändert. Warum?', options: [
        { label: 'Das vorhandene Anmeldetoken enthält die neue Gruppe noch nicht', correct: true, feedback: 'Eine neue Anmeldung oder ein aktualisiertes Token ist nötig.' },
        { label: 'DNS verhindert NTFS immer', correct: false, feedback: 'Hier geht es um das Sicherheitstoken, nicht DNS.' },
      ] },
    ],
    reflection: {
      hypothesis: 'Die Benutzerin fehlt in der richtigen Sicherheitsgruppe oder NTFS blockiert.',
      decisiveInfo: 'Freigabe erlaubt "Aendern", aber NTFS nur "Lesen" - die restriktivere Ebene gewinnt.',
      unnecessarySteps: 'Server neu starten oder direkte Einzelrechte vergeben sind unangemessen.',
      takeaway: 'Effektive Berechtigung = Schnittmenge aus Freigabe und NTFS. AGDLP = wartbar.',
    },
    resolution: 'Die Mitarbeiterin wurde nach AGDLP der korrekten Gruppe zugeordnet und meldete sich neu an. Die Rechte sind jetzt wartbar und minimal.',
  },
  {
    id: 'security-incident', chapter: 3, title: 'Schattenkonto', subtitle: 'Unbekannter lokaler Administrator', department: 'Security', difficulty: 4, minutes: 9,
    requires: ['dns-outage', 'permissions'], boss: true, briefing: '16:38 Uhr. Lea Novak aus dem Security-Team meldet: Ein unbekannter lokaler Admin-Account wurde auf SRV-APP01 erstellt. Gleichzeitig gab es eine Anmeldung außerhalb der Geschäftszeit.',
    checklist: [
      { id: 'contain', label: 'Zugriff eindämmen und Beweise sichern', done: false },
      { id: 'triage', label: 'Login-, Konto- und Netzwerkereignisse sammeln', done: false },
      { id: 'investigate', label: 'Angriffskette und Ursprung untersuchen', done: false },
      { id: 'mitigate', label: 'Konto deaktivieren, Credentials rotieren', done: false },
      { id: 'recover', label: 'Validierte Wiederherstellung durchführen', done: false },
      { id: 'document', label: 'Lessons Learned dokumentieren', done: false },
    ],
    unlockTools: ['Get-WinEvent', 'journalctl', 'Wireshark'], unlockInfrastructure: ['backup', 'soc'], infrastructureEffect: { soc: 'online', backup: 'online' },
    steps: [
      { type: 'decision', prompt: 'Was ist die erste Priorität?', options: [
        { label: 'Zugriff eindämmen und Beweise erhalten', correct: true, feedback: 'Du begrenzt Schaden, ohne die Untersuchung zu zerstören.', effects: { security: 3 } },
        { label: 'Sofort alle Logs löschen', correct: false, feedback: 'Das vernichtet Beweise und behindert die Ursachenanalyse.', effects: { security: -5 } },
        { label: 'Bis morgen warten', correct: false, feedback: 'Ein privilegiertes unbekanntes Konto ist zeitkritisch.', effects: { management: -3 } },
      ] },
      { type: 'tool', prompt: 'Welche Daten sicherst du für die Triage?', options: [
        { label: 'Login-, Konto-, Prozess- und Netzwerkereignisse mit Zeitbezug', correct: true, feedback: 'Diese Quellen helfen, Umfang und Ursprung zu bestimmen.' },
        { label: 'Nur einen Screenshot des Desktops', correct: false, feedback: 'Das reicht für eine belastbare Untersuchung nicht.' },
      ] },
      { type: 'evidence', prompt: 'Welche Untersuchung folgt aus dieser Ereigniskette?', output: '16:31:08  Event 4624  Erfolgreiche Anmeldung: svc_backup von 10.20.4.17\n16:33:41  Event 4720  Benutzerkonto temp_support erstellt\n16:34:02  Event 4732  temp_support zu Administratoren hinzugefügt\n16:35:18  Event 1102  Überwachungsprotokoll wurde gelöscht', irrelevant: 'Der Server meldet außerdem einen seit Monaten bekannten Hinweis zum Druckertreiber.', options: [
        { label: 'Servicekonto, Quellsystem, verwendete Rechte und weitere Aktivitäten', correct: true, feedback: 'Du untersuchst die mögliche Angriffskette statt nur das Symptom.' },
        { label: 'Nur den Namen des neuen Kontos', correct: false, feedback: 'Der Name allein zeigt weder Ursprung noch Umfang.' },
      ] },
      { type: 'decision', prompt: 'Welche Eindämmung ist angemessen?', options: [
        { label: 'Unbekanntes Konto deaktivieren, Service-Credentials rotieren, betroffene Systeme isolieren', correct: true, feedback: 'Gezielte Maßnahmen begrenzen Zugriff und erhalten Kontrollierbarkeit.', effects: { security: 4, management: 1 } },
        { label: 'Gesamte Firma ohne Plan abschalten', correct: false, feedback: 'Unkoordinierte Abschaltung kann Betrieb und Beweislage unnötig schädigen.', effects: { management: -3 } },
      ] },
      { type: 'recovery', prompt: 'Wann darf der Server wieder regulär betrieben werden?', options: [
        { label: 'Nach Ursachenbeseitigung, Validierung, Restore-/Integritätsprüfung und Monitoring', correct: true, feedback: 'Wiederherstellung braucht einen nachweislich vertrauenswürdigen Zustand.' },
        { label: 'Sobald das unbekannte Konto gelöscht ist', correct: false, feedback: 'Das Konto kann nur ein Symptom einer tieferen Kompromittierung sein.' },
      ] },
      { type: 'documentation', prompt: 'Was folgt nach der Wiederherstellung?', options: [
        { label: 'Nachbereitung mit Ursache, Zeitlinie, Maßnahmen und Verbesserungen', correct: true, feedback: 'Lessons Learned verhindern Wiederholungen und verbessern Reaktion.' },
        { label: 'Alle Notizen vernichten', correct: false, feedback: 'Nachvollziehbarkeit ist für Sicherheit und Lernen entscheidend.' },
      ] },
    ],
    reflection: {
      hypothesis: 'Ein kompromittiertes Servicekonto (svc_backup) wurde fuer unberechtigte Admin-Erstellung missbraucht.',
      decisiveInfo: 'Die Ereigniskette: Login von externer IP, Konto erstellt, Admin-Rechte vergeben, Logs geloescht.',
      unnecessarySteps: 'Sofort alle Logs loeschen oder die gesamte Firma abschalten waeren kontraproduktiv.',
      takeaway: 'Bei Security-Incidents: Erst eindaemmen und Beweise sichern, nie Beweise zerstoeren.',
    },
    resolution: 'Ein kompromittiertes Servicekonto wurde missbraucht. Du hast den Zugriff eingedämmt, Beweise erhalten, Credentials rotiert und die Umgebung validiert wiederhergestellt.',
  },
];

export function questById(id) {
  return quests.find((quest) => quest.id === id);
}

export function availableQuests(state) {
  return quests.filter((quest) => !state.completedQuests.includes(quest.id) && (quest.requires || []).every((id) => state.completedQuests.includes(id)));
}

export function recommendedQuest(state) {
  if (state.activeQuest) return questById(state.activeQuest);
  return availableQuests(state).sort((a, b) => a.difficulty - b.difficulty)[0] || quests.find((quest) => quest.id === 'security-incident');
}
