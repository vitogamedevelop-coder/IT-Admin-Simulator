import { topicKey } from '../academyTopics.js';

// =============================================================================
// "DNS" - fundamentals topic. Deliberately self-contained: covers the theory
// (what DNS is, hierarchy, record types, resolution process) AND the hands-on
// Windows Server side (install the DNS role, forward/reverse lookup zones,
// primary/secondary zones, A-/PTR-records, testing, typical error patterns,
// the relevant Windows shortcuts) in one lesson, so the learner never has to
// jump to another lesson to follow the configuration steps. Structured
// exactly like every other LessonRunner lesson (theory sections, then
// exercises, then a quiz) - no new mechanics introduced.
// =============================================================================

export const DNS_TOPIC_KEY = topicKey('fundamentals', 'dns');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------
  // 1. Was ist DNS und wozu dient es?
  // ---------------------------------------------------------------------
  exps.push(explanation('was-classic', 'Was ist DNS?', 'classic', [
    { type: 'text', content: 'DNS (Domain Name System) übersetzt für Menschen merkbare Namen (z. B. "www.beispiel.de") in die IP-Adressen, die Rechner für die Kommunikation tatsächlich benötigen (z. B. "192.168.10.5"). Ohne DNS müsste sich jeder Nutzer die IP-Adresse jedes Dienstes merken.' },
    { type: 'list', title: 'Warum wird DNS gebraucht?', items: [
      'Menschen merken sich Namen leichter als Zahlenfolgen.',
      'IP-Adressen eines Dienstes können sich ändern (z. B. bei einem Serverumzug) - der Name bleibt gleich.',
      'Ein Name kann auf mehrere Server verweisen (Lastverteilung, Ausfallsicherheit).',
    ] },
  ]));

  exps.push(explanation('was-intuitive', 'Was ist DNS?', 'intuitive', [
    { type: 'text', content: 'DNS ist wie das Telefonbuch des Internets: Du kennst den Namen einer Firma, aber nicht ihre Telefonnummer. Du schlägst den Namen nach und bekommst die Nummer - genauso schlägt dein Rechner den Namen "www.beispiel.de" nach und bekommt die passende IP-Adresse.' },
  ]));

  // ---------------------------------------------------------------------
  // 2. Hierarchischer Aufbau
  // ---------------------------------------------------------------------
  exps.push(explanation('aufbau-classic', 'Der hierarchische Aufbau von Domainnamen', 'classic', [
    { type: 'text', content: 'Domainnamen sind von rechts nach links hierarchisch aufgebaut. Am Beispiel "www.beispiel.de":' },
    { type: 'list', title: 'Die Ebenen', items: [
      'Root ("."): Die unsichtbare Wurzel ganz oben, kennt nur, welcher Server für jede Top-Level-Domain zuständig ist.',
      'Top-Level-Domain (TLD), z. B. ".de": Verwaltet von einer zentralen Stelle (für ".de" die DENIC).',
      'Domain, z. B. "beispiel.de": Die eigentliche, von einer Organisation registrierte Domain.',
      'Subdomain/Host, z. B. "www.beispiel.de": Ein einzelner Rechner oder Dienst innerhalb der Domain.',
    ] },
    { type: 'text', content: 'In einem Firmennetz übernimmt diese Rolle für die interne Domain (z. B. "it.bv") ein eigener, lokaler DNS-Server - dazu später mehr im Praxisteil.' },
  ]));

  // ---------------------------------------------------------------------
  // 3. Ablauf einer DNS-Abfrage
  // ---------------------------------------------------------------------
  exps.push(explanation('ablauf-classic', 'Wie eine Namensauflösung abläuft', 'classic', [
    { type: 'text', content: 'Wenn ein Client einen Namen auflösen will, läuft im Hintergrund ein fester Ablauf ab.' },
    { type: 'list', title: 'Ablauf (vereinfacht)', items: [
      '1. Der Client prüft zuerst seinen eigenen DNS-Cache - ist die Antwort schon bekannt, wird sie sofort verwendet.',
      '2. Ist nichts im Cache, fragt der Client seinen konfigurierten DNS-Server (z. B. den internen Windows-DNS-Server).',
      '3. Kennt dieser Server die Antwort nicht selbst, fragt er stellvertretend weiter (rekursiv) - notfalls bis zum zuständigen (autoritativen) Server im Internet.',
      '4. Die Antwort wird an den Client zurückgegeben und dort (sowie oft auch auf dem DNS-Server) für eine gewisse Zeit zwischengespeichert.',
    ] },
    { type: 'question', question: 'Wofür wird die Zwischenspeicherung (Caching) von DNS-Antworten hauptsächlich genutzt?', options: ['Um Anfragen zu verschlüsseln', 'Um wiederholte Anfragen zu beschleunigen und Server zu entlasten', 'Um IP-Adressen automatisch zu vergeben', 'Um Domainnamen zu registrieren'], correct: 1, explanation: 'Caching spart wiederholte Anfragen an dieselben Server und beschleunigt die Namensauflösung spürbar.' },
    { type: 'text', content: 'Die Gültigkeitsdauer eines gecachten Eintrags wird über die TTL (Time To Live) gesteuert, die beim jeweiligen DNS-Eintrag hinterlegt ist.' },
  ]));

  // ---------------------------------------------------------------------
  // 4. Wichtige Record-Typen
  // ---------------------------------------------------------------------
  exps.push(explanation('records-classic', 'Die wichtigsten DNS-Eintragstypen', 'classic', [
    { type: 'table', headers: ['Record-Typ', 'Zweck', 'Beispiel'], rows: [
      ['A', 'Name → IPv4-Adresse', 'server1.it.bv → 192.168.10.5'],
      ['PTR', 'IP-Adresse → Name (umgekehrte Richtung)', '192.168.10.5 → server1.it.bv'],
      ['CNAME', 'Alias-Name für einen anderen Namen', 'intranet.it.bv → server1.it.bv'],
      ['MX', 'Zuständiger Mailserver für eine Domain', 'it.bv → mail.it.bv'],
    ] },
    { type: 'text', content: 'Für die tägliche Server-Administration sind vor allem A-Records (Name → IP) und PTR-Records (IP → Name) relevant - beide werden im Praxisteil dieser Lektion konkret angelegt.' },
  ]));

  // ---------------------------------------------------------------------
  // 5. Zonenkonzept
  // ---------------------------------------------------------------------
  exps.push(explanation('zonen-classic', 'Zonen: Forward, Reverse, Primär, Sekundär', 'classic', [
    { type: 'list', title: 'Die vier Begriffe im Überblick', items: [
      'Forward Lookup Zone: Enthält die "normalen" Einträge Name → IP (v. a. A-Records). Das ist die Zone, die bei fast jeder Anfrage genutzt wird.',
      'Reverse Lookup Zone: Enthält die umgekehrte Zuordnung IP → Name (PTR-Records). Wird u. a. für Log-Auswertungen und manche Sicherheitsprüfungen gebraucht.',
      'Primäre Zone: Die "Master"-Kopie einer Zone. Änderungen werden hier vorgenommen.',
      'Sekundäre Zone: Eine schreibgeschützte Kopie einer primären Zone auf einem zweiten Server, die per Zonentransfer automatisch synchronisiert wird - sorgt für Ausfallsicherheit und Lastverteilung.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 6. Praxis: DNS-Rolle unter Windows Server installieren
  // ---------------------------------------------------------------------
  exps.push(explanation('praxis-rolle-classic', 'Praxis: DNS-Rolle unter Windows Server installieren', 'classic', [
    { type: 'text', content: 'Ab hier geht es um die konkrete Einrichtung eines einfachen DNS-Servers unter Windows Server - Schritt für Schritt, wie in der Praxis üblich.' },
    { type: 'list', title: 'DNS-Server-Rolle installieren', items: [
      'Server-Manager öffnen → "Rollen und Features hinzufügen".',
      'Rolle "DNS-Server" auswählen und die Installation abschließen.',
      'Alternativ per PowerShell: Install-WindowsFeature DNS -IncludeManagementTools',
      'Verwaltet wird der Dienst danach über Server-Manager → Tools → DNS (öffnet die Konsole "dnsmgmt.msc").',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 7. Praxis: Forward Lookup Zone + A-Record
  // ---------------------------------------------------------------------
  exps.push(explanation('praxis-forward-classic', 'Praxis: Forward Lookup Zone und A-Record anlegen', 'classic', [
    { type: 'list', title: 'Forward Lookup Zone anlegen', items: [
      'In der DNS-Konsole: Rechtsklick auf "Forward-Lookupzonen" → "Neue Zone...".',
      'Zonentyp wählen: Primär (auf dem Master-Server) oder Sekundär (auf einem zweiten Server, der von einem Primary synchronisiert).',
      'Zonenname vergeben, z. B. "it.bv".',
      'Einstellung für dynamische Updates festlegen (z. B. keine, oder nur sichere Updates in einer AD-integrierten Zone).',
    ] },
    { type: 'list', title: 'A-Record anlegen', items: [
      'Rechtsklick auf die neu angelegte Zone → "Neuer Host (A oder AAAA)...".',
      'Name des Hosts eingeben (z. B. "server1") und die zugehörige IPv4-Adresse (z. B. "192.168.10.5").',
      'Häkchen "Zugehörigen PTR-Eintrag erstellen" aktivieren, wenn direkt auch der Reverse-Eintrag angelegt werden soll (setzt eine passende Reverse Lookup Zone voraus).',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 8. Praxis: Reverse Lookup Zone + PTR-Record
  // ---------------------------------------------------------------------
  exps.push(explanation('praxis-reverse-classic', 'Praxis: Reverse Lookup Zone und PTR-Record anlegen', 'classic', [
    { type: 'list', title: 'Reverse Lookup Zone anlegen', items: [
      'Rechtsklick auf "Reverse-Lookupzonen" → "Neue Zone...".',
      'Zonentyp wählen (Primär/Sekundär), genau wie bei der Forward Lookup Zone.',
      'Die Netzwerk-ID des betroffenen Subnetzes angeben (z. B. "192.168.10").',
    ] },
    { type: 'text', content: 'Ist die Reverse Lookup Zone vorhanden, kann bei jedem A-Record das Häkchen für den zugehörigen PTR-Eintrag gesetzt werden - oder der PTR-Record wird direkt in der Reverse Lookup Zone manuell über "Neuer Zeiger (PTR)..." angelegt.' },
  ]));

  // ---------------------------------------------------------------------
  // 9. Praxis: Namensauflösung testen
  // ---------------------------------------------------------------------
  exps.push(explanation('praxis-test-classic', 'Praxis: Namensauflösung testen', 'classic', [
    { type: 'table', headers: ['Befehl', 'Zweck'], rows: [
      ['nslookup <Name>', 'Fragt gezielt einen DNS-Namen ab und zeigt den antwortenden Server sowie das Ergebnis.'],
      ['Resolve-DnsName <Name>', 'PowerShell-Äquivalent zu nslookup, liefert strukturierte Ausgabe.'],
      ['ping <Name>', 'Löst den Namen implizit auf und zeigt zusätzlich, ob der Host erreichbar ist.'],
      ['ipconfig /flushdns', 'Leert den lokalen DNS-Cache des Clients - wichtig, wenn sich ein Eintrag geändert hat, der Client aber noch die alte, gecachte Antwort verwendet.'],
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 10. Praxis: Typische Fehlerbilder
  // ---------------------------------------------------------------------
  exps.push(explanation('praxis-fehler-classic', 'Typische Fehlerbilder in der Praxis', 'classic', [
    { type: 'list', title: 'Woran es meistens liegt, wenn DNS nicht funktioniert', items: [
      '"Server kann nicht erreicht werden" bei nslookup: Der DNS-Dienst läuft nicht, oder der Client hat die falsche DNS-Server-Adresse konfiguriert.',
      'Ein Name lässt sich nicht auflösen: Der A-Record fehlt, ist falsch geschrieben, oder liegt in der falschen Zone.',
      'Client verwendet noch eine alte IP-Adresse: Der lokale DNS-Cache ist veraltet - "ipconfig /flushdns" hilft.',
      'Die Reverse-Auflösung (IP → Name) schlägt fehl, die normale aber funktioniert: Es fehlt der passende PTR-Eintrag bzw. die Reverse Lookup Zone.',
      'Eine sekundäre Zone zeigt veraltete Daten: Der Zonentransfer vom primären Server ist fehlgeschlagen oder noch nicht gelaufen.',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 11. Windows-Shortcuts und Verwaltungswege
  // ---------------------------------------------------------------------
  exps.push(explanation('shortcuts-classic', 'Wichtige Windows-Shortcuts und Verwaltungswege', 'classic', [
    { type: 'table', headers: ['Befehl/Weg', 'Öffnet'], rows: [
      ['ncpa.cpl', 'Netzwerkverbindungen (Ethernet-Eigenschaften, z. B. um den DNS-Server am Client zu setzen)'],
      ['sysdm.cpl', 'Systemeigenschaften (u. a. Computername/Domain)'],
      ['Server-Manager → Verwalten → Rollen und Features hinzufügen', 'Installation der DNS-Serverrolle'],
      ['Server-Manager → Tools → DNS', 'Öffnet die DNS-Verwaltungskonsole (dnsmgmt.msc)'],
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'DNS übersetzt Namen in IP-Adressen - wie ein Telefonbuch fürs Netzwerk.',
      'Domainnamen sind hierarchisch aufgebaut: Root → TLD → Domain → Subdomain.',
      'Eine Abfrage läuft über Cache → konfigurierten DNS-Server → ggf. rekursiv weiter, mit TTL-gesteuertem Caching.',
      'A-Record: Name → IPv4. PTR-Record: IP → Name. CNAME: Alias. MX: Mailserver.',
      'Forward Lookup Zone = Name → IP, Reverse Lookup Zone = IP → Name. Primäre Zone ist beschreibbar, sekundäre Zone eine synchronisierte Kopie.',
      'Praxis: Rolle installieren → Forward Lookup Zone anlegen → A-Record anlegen → Reverse Lookup Zone anlegen → PTR-Record anlegen → mit nslookup/Resolve-DnsName/ping testen.',
      'Typische Fehlerquellen: Dienst nicht erreichbar, fehlender/falscher Record, veralteter Client-Cache, fehlender PTR, fehlgeschlagener Zonentransfer.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'dns-query-ordering',
      type: 'ordering',
      question: 'Bringe den Ablauf einer Namensauflösung in die richtige Reihenfolge.',
      items: [
        { id: 'cache', label: 'Client prüft den eigenen DNS-Cache' },
        { id: 'server', label: 'Client fragt den konfigurierten DNS-Server' },
        { id: 'recursive', label: 'DNS-Server fragt notfalls rekursiv weiter' },
        { id: 'answer', label: 'Antwort wird an den Client zurückgegeben und zwischengespeichert' },
      ],
      correctOrder: ['cache', 'server', 'recursive', 'answer'],
      explanation: 'Erst der lokale Cache, dann der konfigurierte DNS-Server, bei Bedarf rekursive Weiterleitung, zuletzt die (gecachte) Antwort an den Client.',
    },
    {
      id: 'dns-setup-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte zur Einrichtung eines Windows-DNS-Servers in die richtige Reihenfolge.',
      items: [
        { id: 'role', label: 'DNS-Serverrolle installieren' },
        { id: 'forward', label: 'Forward Lookup Zone anlegen' },
        { id: 'arecord', label: 'A-Record anlegen' },
        { id: 'reverse', label: 'Reverse Lookup Zone anlegen' },
        { id: 'test', label: 'Namensauflösung mit nslookup testen' },
      ],
      correctOrder: ['role', 'forward', 'arecord', 'reverse', 'test'],
      explanation: 'Zuerst die Rolle installieren, dann die Forward Lookup Zone mit A-Records füllen, danach die Reverse Lookup Zone, zum Schluss testen.',
    },
    {
      id: 'dns-record-matching',
      type: 'matching',
      question: 'Ordne jedem Record-Typ seinen Zweck zu.',
      pairs: [
        { left: 'A', leftLabel: 'A', right: 'Name → IPv4-Adresse' },
        { left: 'PTR', leftLabel: 'PTR', right: 'IP-Adresse → Name' },
        { left: 'CNAME', leftLabel: 'CNAME', right: 'Alias-Name für einen anderen Namen' },
        { left: 'MX', leftLabel: 'MX', right: 'Zuständiger Mailserver einer Domain' },
      ],
      explanation: 'A löst vorwärts auf, PTR rückwärts, CNAME ist ein Alias, MX verweist auf den Mailserver.',
    },
    {
      id: 'dns-zone-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff seiner Bedeutung zu.',
      pairs: [
        { left: 'Forward Lookup Zone', leftLabel: 'Forward Lookup Zone', right: 'Enthält Name → IP Einträge' },
        { left: 'Reverse Lookup Zone', leftLabel: 'Reverse Lookup Zone', right: 'Enthält IP → Name Einträge' },
        { left: 'Primäre Zone', leftLabel: 'Primäre Zone', right: 'Beschreibbare Master-Kopie' },
        { left: 'Sekundäre Zone', leftLabel: 'Sekundäre Zone', right: 'Schreibgeschützte, per Zonentransfer synchronisierte Kopie' },
      ],
      explanation: 'Forward = Name→IP, Reverse = IP→Name. Primär ist die Master-Kopie, sekundär eine synchronisierte Kopie davon.',
    },
    {
      id: 'dns-troubleshooting-select',
      type: 'select-best',
      question: 'Ein Client bekommt bei "ping server1.it.bv" die Fehlermeldung "Ping-Anforderung konnte Host nicht finden". Ein anderer Client im selben Netz kann den Namen problemlos auflösen. Was ist die wahrscheinlichste Ursache?',
      options: ['Der A-Record fehlt komplett in der Zone', 'Der Client hat eine falsche oder keine DNS-Server-Adresse konfiguriert', 'Die Reverse Lookup Zone fehlt', 'Der Mailserver ist nicht erreichbar'],
      correct: 1,
      explanation: 'Da andere Clients denselben Namen erfolgreich auflösen, existiert der Record - das Problem liegt meist an der DNS-Konfiguration des betroffenen Clients selbst.',
    },
    {
      id: 'dns-flushdns-input',
      type: 'input',
      question: 'Welcher Befehl leert den lokalen DNS-Cache eines Windows-Clients? (Befehl eingeben)',
      answers: ['ipconfig /flushdns', 'ipconfig/flushdns'],
      explanation: '"ipconfig /flushdns" entfernt alle zwischengespeicherten DNS-Antworten auf dem lokalen Client.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was ist die Hauptaufgabe von DNS?', options: ['IP-Adressen automatisch vergeben', 'Namen in IP-Adressen übersetzen (und umgekehrt)', 'Daten verschlüsseln', 'Netzwerkkabel verwalten'], correct: 1, explanation: 'DNS übersetzt Namen in IP-Adressen - und mit PTR-Records auch umgekehrt.' },
    { question: 'In "www.beispiel.de" - was ist ".de"?', options: ['Die Subdomain', 'Die Top-Level-Domain', 'Der Root-Server', 'Der A-Record'], correct: 1, explanation: '".de" ist die Top-Level-Domain (TLD).' },
    { question: 'Was passiert zuerst, wenn ein Client einen Namen auflösen will?', options: ['Der Root-Server wird direkt gefragt', 'Der lokale DNS-Cache wird geprüft', 'Ein neuer A-Record wird angelegt', 'Der Mailserver wird kontaktiert'], correct: 1, explanation: 'Zuerst wird immer der lokale Cache geprüft, um unnötige Anfragen zu vermeiden.' },
    { question: 'Wofür steht TTL bei einem DNS-Eintrag?', options: ['Total Transfer Load', 'Time To Live - wie lange ein Eintrag gecacht werden darf', 'Transport Layer Type', 'Trunk Transfer List'], correct: 1, explanation: 'Die TTL gibt an, wie lange ein DNS-Eintrag zwischengespeichert werden darf, bevor er erneut abgefragt werden muss.' },
    { question: 'Welcher Record-Typ übersetzt einen Namen in eine IPv4-Adresse?', options: ['PTR', 'A', 'MX', 'CNAME'], correct: 1, explanation: 'Der A-Record bildet Name → IPv4-Adresse ab.' },
    { question: 'Welcher Record-Typ übersetzt eine IP-Adresse zurück in einen Namen?', options: ['A', 'CNAME', 'PTR', 'MX'], correct: 2, explanation: 'Der PTR-Record wird für die umgekehrte Auflösung (IP → Name) verwendet.' },
    { question: 'In welcher Zone werden A-Records angelegt?', options: ['Reverse Lookup Zone', 'Forward Lookup Zone', 'Sekundäre Zone ausschließlich', 'Root-Zone'], correct: 1, explanation: 'A-Records gehören in die Forward Lookup Zone (Name → IP).' },
    { question: 'Was unterscheidet eine sekundäre Zone von einer primären Zone?', options: ['Sie kann nicht abgefragt werden', 'Sie ist eine schreibgeschützte, synchronisierte Kopie der primären Zone', 'Sie enthält nur PTR-Records', 'Sie benötigt keinen DNS-Dienst'], correct: 1, explanation: 'Eine sekundäre Zone ist eine schreibgeschützte Kopie, die per Zonentransfer von der primären Zone aktualisiert wird.' },
    { question: 'Welches Windows-Feature installiert die DNS-Serverrolle über die Kommandozeile?', options: ['Install-WindowsFeature DNS', 'New-DnsServer', 'Add-DnsRole', 'Set-DnsServerZone'], correct: 0, explanation: '"Install-WindowsFeature DNS -IncludeManagementTools" installiert die Rolle samt Verwaltungswerkzeugen.' },
    { question: 'Wo wird die DNS-Serverrolle unter Windows Server grafisch verwaltet?', options: ['Über ncpa.cpl', 'Über die DNS-Konsole (dnsmgmt.msc, Server-Manager → Tools → DNS)', 'Über sysdm.cpl', 'Über den Geräte-Manager'], correct: 1, explanation: 'Server-Manager → Tools → DNS öffnet die DNS-Verwaltungskonsole.' },
    { question: 'Welcher Shortcut öffnet unter Windows die Netzwerkverbindungen, um z. B. den DNS-Server am Client zu setzen?', options: ['sysdm.cpl', 'ncpa.cpl', 'dnsmgmt.msc', 'services.msc'], correct: 1, explanation: '"ncpa.cpl" öffnet die Netzwerkverbindungen mit den Adapter-Eigenschaften.' },
    { question: 'Welcher Befehl zeigt gezielt an, welcher DNS-Server geantwortet hat und was die Antwort war?', options: ['ping', 'tracert', 'nslookup', 'ipconfig /all'], correct: 2, explanation: '"nslookup" zeigt den antwortenden Server und das Ergebnis der Abfrage.' },
    { question: 'Ein Eintrag wurde geändert, der Client verwendet aber weiterhin die alte IP. Was ist der naheliegendste erste Schritt?', options: ['Die Zone löschen und neu anlegen', 'Den lokalen DNS-Cache mit "ipconfig /flushdns" leeren', 'Den DHCP-Dienst neu starten', 'Eine neue Reverse Lookup Zone anlegen'], correct: 1, explanation: 'Ein veralteter Client-Cache ist die häufigste Ursache - "ipconfig /flushdns" behebt das meist direkt.' },
    { question: 'Ein A-Record wurde korrekt angelegt, aber die Reverse-Auflösung (IP → Name) liefert kein Ergebnis. Was fehlt am wahrscheinlichsten?', options: ['Der MX-Record', 'Der passende PTR-Eintrag bzw. die Reverse Lookup Zone', 'Die Top-Level-Domain', 'Der CNAME-Record'], correct: 1, explanation: 'Für die Reverse-Auflösung wird ein PTR-Eintrag in einer passenden Reverse Lookup Zone benötigt.' },
    { question: 'Welchen Vorteil bietet eine sekundäre DNS-Zone auf einem zweiten Server?', options: ['Sie ersetzt die Notwendigkeit von A-Records', 'Ausfallsicherheit und Lastverteilung bei Ausfall des primären Servers', 'Sie verschlüsselt automatisch alle Anfragen', 'Sie erlaubt beliebig viele Root-Server'], correct: 1, explanation: 'Fällt der primäre Server aus, kann der sekundäre Server weiterhin Anfragen aus seiner synchronisierten Kopie beantworten.' },
  ];
}

export function buildDnsLesson() {
  return {
    title: 'DNS',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'DNS übersetzt Namen in IP-Adressen (und mit PTR umgekehrt) - wie ein Telefonbuch fürs Netzwerk.',
      'Aufbau: Root → Top-Level-Domain → Domain → Subdomain.',
      'Ablauf: lokaler Cache → konfigurierter DNS-Server → ggf. rekursive Weiterleitung, gesteuert über die TTL.',
      'Wichtigste Records: A (Name→IP), PTR (IP→Name), CNAME (Alias), MX (Mailserver).',
      'Forward Lookup Zone = Name→IP, Reverse Lookup Zone = IP→Name. Primäre Zone ist beschreibbar, sekundäre Zone eine synchronisierte Kopie.',
      'Praxis unter Windows Server: Rolle installieren → Forward Lookup Zone + A-Record → Reverse Lookup Zone + PTR-Record → mit nslookup/Resolve-DnsName/ping testen.',
      'Typische Fehler: Dienst/Erreichbarkeit, fehlender oder falscher Record, veralteter Client-Cache, fehlender PTR, fehlgeschlagener Zonentransfer.',
    ],
  };
}
