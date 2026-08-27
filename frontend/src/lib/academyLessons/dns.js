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

const DNS_HIERARCHY_SVG = `<svg viewBox="0 0 420 190" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><text x="210" y="20" text-anchor="middle" fill="#ffcc00" font-size="12">Root .</text><line x1="210" y1="28" x2="210" y2="48" stroke="#8b949e"/><rect x="175" y="48" width="70" height="28" rx="5" fill="#00f0ff" opacity="0.25" stroke="#00f0ff"/><text x="210" y="66" text-anchor="middle" fill="#c9d1d9" font-size="11">example · TLD</text><line x1="210" y1="76" x2="210" y2="92" stroke="#8b949e"/><rect x="165" y="92" width="90" height="28" rx="5" fill="#58a6ff" opacity="0.25" stroke="#58a6ff"/><text x="210" y="110" text-anchor="middle" fill="#c9d1d9" font-size="11">nexus · Domain</text><line x1="210" y1="120" x2="210" y2="136" stroke="#8b949e"/><rect x="158" y="136" width="104" height="28" rx="5" fill="#00ff66" opacity="0.2" stroke="#00ff66"/><text x="210" y="154" text-anchor="middle" fill="#c9d1d9" font-size="11">berlin · Subdomain</text><text x="210" y="183" text-anchor="middle" fill="#8b949e" font-size="10">server01.berlin.nexus.example. · vollständiger FQDN</text></svg>`;
const DNS_RESOLUTION_SVG = `<svg viewBox="0 0 460 185" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg"><g font-size="10" text-anchor="middle"><rect x="8" y="28" width="75" height="34" rx="5" fill="#00f0ff" opacity="0.25" stroke="#00f0ff"/><text x="45" y="49" fill="#c9d1d9">Client</text><rect x="105" y="28" width="90" height="34" rx="5" fill="#58a6ff" opacity="0.25" stroke="#58a6ff"/><text x="150" y="49" fill="#c9d1d9">Resolver</text><rect x="222" y="28" width="70" height="34" rx="5" fill="#ffcc00" opacity="0.25" stroke="#ffcc00"/><text x="257" y="49" fill="#c9d1d9">Root/TLD</text><rect x="320" y="28" width="130" height="34" rx="5" fill="#00ff66" opacity="0.2" stroke="#00ff66"/><text x="385" y="49" fill="#c9d1d9">autoritativ für Zone</text></g><line x1="83" y1="40" x2="105" y2="40" stroke="#00f0ff" stroke-width="2"/><text x="94" y="24" text-anchor="middle" fill="#00f0ff" font-size="9">rekursiv</text><line x1="195" y1="40" x2="222" y2="40" stroke="#ffcc00" stroke-width="2"/><line x1="292" y1="40" x2="320" y2="40" stroke="#ffcc00" stroke-width="2"/><text x="257" y="82" text-anchor="middle" fill="#ffcc00" font-size="9">iterative Referrals – Cache kann Schritte verkürzen</text><text x="230" y="112" text-anchor="middle" fill="#c9d1d9" font-size="10">Client: lokale Quellen → Cache → Resolver</text><text x="230" y="134" text-anchor="middle" fill="#c9d1d9" font-size="10">Server: eigene Zone/Cache → Conditional/General Forwarder → Hierarchie</text><text x="230" y="160" text-anchor="middle" fill="#8b949e" font-size="10">Antwort → Cache → Client erhält den passenden Record</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------
  // 1. Was ist DNS und wozu dient es?
  // ---------------------------------------------------------------------
  exps.push(explanation('was-classic', 'Was ist DNS?', 'classic', [
    { type: 'text', content: 'DNS (Domain Name System) verknüpft menschenlesbare Namen mit technischen Adress- und Dienstinformationen. Netzwerkkommunikation verwendet IP-Adressen, während Menschen stabile Namen wie server01.nexus.local leichter verwenden können.' },
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
    { type: 'text', content: 'DNS bildet einen hierarchischen Namensraum. Ein vollständiger Name wird von rechts nach links eingeordnet: Root, Top-Level-Domain, Domain, gegebenenfalls Subdomain und Host.' },
    { type: 'diagram', content: DNS_HIERARCHY_SVG },
    { type: 'list', title: 'Die Ebenen', items: [
      'Root (.) ist die oberste Ebene. Die 13 benannten Root-Server-Kennungen A bis M werden weltweit durch viele physische Instanzen bereitgestellt.',
      'Top-Level-Domain (TLD): zum Beispiel country-code .de oder generic .com und .org.',
      'Second-Level-Domain beziehungsweise Domain: zum Beispiel nexus.example.',
      'Subdomain: ein delegierbarer Unterbereich wie berlin.nexus.example.',
      'Hostname: server01 bezeichnet das konkrete Ziel innerhalb dieses Pfads.',
    ] },
    { type: 'text', content: 'server01.berlin.nexus.example. ist ein Fully Qualified Domain Name (FQDN). Der abschließende Punkt steht formal für die Root und wird im Alltag meist weggelassen.' },
    { type: 'question', facet: 'fqdn', question: 'Was beschreibt ein FQDN?', options: ['Die vollständige Position eines Namens im DNS-Namensraum', 'Nur die IPv4-Adresse eines Servers', 'Ausschließlich den Namen einer Zone ohne Host'], correct: 0, explanation: 'Ein FQDN enthält den vollständigen hierarchischen Pfad bis zur Root.' },
  ]));

  // ---------------------------------------------------------------------
  // 3. Ablauf einer DNS-Abfrage
  // ---------------------------------------------------------------------
  exps.push(explanation('ablauf-classic', 'Wie eine Namensauflösung abläuft', 'classic', [
    { type: 'text', content: 'Der genaue Ablauf hängt von Betriebssystem, Resolver und DNS-Konfiguration ab. Im hier verwendeten Windows-/DNS-Server-Szenario gilt vereinfacht:' },
    { type: 'list', title: 'Client und Resolver', items: [
      '1. Der Client prüft lokale Quellen wie die Hosts-Datei und seinen DNS-Cache.',
      '2. Fehlt eine passende Antwort, sendet der Stub-Resolver eine rekursive Anfrage an den konfigurierten DNS-Server: Er erwartet eine vollständige Antwort oder einen Fehler.',
      '3. Der DNS-Server prüft eigene Zonendaten und Cache, danach gegebenenfalls Conditional Forwarder oder General Forwarder.',
      '4. Falls nötig folgt eine iterative Auflösung: Root/TLD oder ein bereits bekannter Referral verweist schrittweise zum zuständigen autoritativen Server.',
      '5. Der passende Record wird zurückgegeben und gemäß TTL zwischengespeichert.',
    ] },
    { type: 'diagram', content: DNS_RESOLUTION_SVG },
    { type: 'question', question: 'Wofür wird die Zwischenspeicherung (Caching) von DNS-Antworten hauptsächlich genutzt?', options: ['Um Anfragen zu verschlüsseln', 'Um wiederholte Anfragen zu beschleunigen und Server zu entlasten', 'Um IP-Adressen automatisch zu vergeben', 'Um Domainnamen zu registrieren'], correct: 1, explanation: 'Caching spart wiederholte Anfragen an dieselben Server und beschleunigt die Namensauflösung spürbar.' },
    { type: 'text', content: 'Die Gültigkeitsdauer eines gecachten Eintrags wird über die TTL (Time To Live) gesteuert, die beim jeweiligen DNS-Eintrag hinterlegt ist.' },
  ]));

  exps.push(explanation('query-types-classic', 'Rekursiv und iterativ', 'classic', [
    { type: 'table', headers: ['Abfragetyp', 'Erwartung'], rows: [
      ['rekursiv', '„Gib mir die vollständige Antwort oder einen Fehler.“ – typisch vom Client an seinen Resolver'],
      ['iterativ', '„Hier ist der nächste zuständige Nameserver.“ – Resolver folgt Referrals schrittweise'],
    ] },
    { type: 'text', content: 'Eine iterative Auflösung muss nicht immer bei Root beginnen: Cache und bereits bekannte Referrals können einen späteren Einstieg ermöglichen.' },
    { type: 'question', facet: 'recursive-iterative', question: 'Ein Server kennt die endgültige Antwort nicht, nennt aber den nächsten zuständigen Nameserver. Was ist das?', options: ['iterative Antwort beziehungsweise Referral', 'vollständige rekursive Antwort', 'ein MX-Record'], correct: 0, explanation: 'Iterativ führt ein Verweis zum nächsten zuständigen Server; rekursiv erwartet der Anfragende eine vollständige Antwort.' },
  ]));

  exps.push(explanation('authority-forwarding-classic', 'Autorität, Forwarding und Delegierung', 'classic', [
    { type: 'text', content: 'Autorität gilt immer bezogen auf eine konkrete Zone: Ein DNS-Server kann für nexus.example autoritativ sein, für eine andere Zone aber nur eine Antwort aus Cache oder über weitere Auflösung liefern.' },
    { type: 'table', headers: ['Mechanismus', 'Bedeutung'], rows: [
      ['Conditional Forwarder', 'Anfragen für eine bestimmte Domain gezielt an einen anderen Resolver senden'],
      ['General Forwarder', 'nicht lokal beantwortbare Anfragen allgemein an einen Resolver weitergeben'],
      ['Delegierung', 'Verantwortung für einen Teil des Namensraums an andere autoritative Nameserver übertragen'],
    ] },
    { type: 'text', content: 'Forwarding leitet eine Anfrage weiter. Delegierung überträgt hierarchisch die Zuständigkeit für einen Namensraum – beides ist nicht dasselbe.' },
    { type: 'question', facet: 'forwarding-delegation', question: 'Was unterscheidet Forwarding und Delegierung?', options: ['Forwarding leitet Anfragen weiter; Delegierung überträgt die Zuständigkeit für einen Namensraum.', 'Beide Begriffe bezeichnen immer dasselbe.', 'Delegierung leert ausschließlich den Client-Cache.'], correct: 0, explanation: 'Ein Forwarder ist ein Auflösungsweg. Eine Delegierung bestimmt autoritative Verantwortung im DNS-Baum.' },
  ]));

  // ---------------------------------------------------------------------
  // 4. Wichtige Record-Typen
  // ---------------------------------------------------------------------
  exps.push(explanation('records-classic', 'Die wichtigsten DNS-Eintragstypen', 'classic', [
    { type: 'table', headers: ['Record-Typ', 'Zweck', 'Beispiel'], rows: [
      ['A', 'Name → IPv4-Adresse', 'server1.nexus.local → 192.168.10.5'],
      ['AAAA', 'Name → IPv6-Adresse', 'server1.nexus.example → 2001:db8::5'],
      ['PTR', 'IP-Adresse → Name (Reverse Lookup)', '192.168.10.5 → server1.nexus.local'],
      ['CNAME', 'Alias auf einen anderen Namen, nicht direkt auf eine IP', 'intranet.nexus.local → server1.nexus.local'],
      ['MX', 'Zuständiger Mailserver einer Domain', 'nexus.example → mail.nexus.example'],
      ['SRV', 'Dienst und zuständigen Server auffinden', 'z. B. Domain-Controller-Dienst'],
      ['SOA', 'zentrale Verwaltungsinformationen einer Zone', 'Start of Authority'],
      ['NS', 'für eine Zone zuständiger Nameserver', 'Delegierung zu autoritativem Server'],
    ] },
    { type: 'text', content: 'DNS verwendet Port 53. UDP ist für viele normale Abfragen üblich; TCP gehört ebenfalls zu DNS, etwa bei bestimmten größeren Antworten und Zonenübertragungen. DNS ist daher nicht ausschließlich UDP.' },
    { type: 'text', content: 'Für die tägliche Server-Administration sind A- und PTR-Records besonders sichtbar; die übrigen Record-Typen beantworten andere Fragen wie IPv6, Alias, Mail, Dienst oder Zonenautorität.' },
  ]));

  // ---------------------------------------------------------------------
  // 5. Zonenkonzept
  // ---------------------------------------------------------------------
  exps.push(explanation('zonen-classic', 'Domain und Zone', 'classic', [
    { type: 'text', content: 'Eine Domain ist ein logischer Bereich im DNS-Namensraum. Eine Zone ist der administrativ verwaltete Teil dieses Namensraums, für den ein DNS-Server Daten vorhält. Domain und Zone können ähnlich aussehen, sind aber nicht dasselbe.' },
    { type: 'list', title: 'Lookup-Richtung', items: [
      'Forward Lookup Zone: Name → Adress- oder Dienstinformation, etwa A und AAAA.',
      'Reverse Lookup Zone: IP-bezogene Richtung → Name über PTR.',
    ] },
    { type: 'table', headers: ['Zonentyp', 'Grundidee'], rows: [
      ['Primäre Zone', 'klassisch schreibbare führende Datenquelle einer Zone'],
      ['Sekundäre Zone', 'schreibgeschützte Kopie, die per Zonentransfer aktualisiert wird'],
      ['AD-integrierte Zone', 'Zonendaten werden über Active Directory integriert und repliziert; Details folgen im AD-Bereich'],
      ['Stubzone', 'enthält im Wesentlichen Informationen zu den autoritativen Nameservern einer Zone, keine vollständige Zonenkopie'],
    ] },
    { type: 'question', facet: 'domain-zone', question: 'Was unterscheidet Domain und Zone?', options: ['Domain ist ein logischer Namensbereich; Zone ist ein administrativ verwalteter Teil mit DNS-Daten.', 'Beide Begriffe sind immer vollständig identisch.', 'Eine Zone ist ausschließlich eine einzelne IP-Adresse.'], correct: 0, explanation: 'Zonengrenzen folgen administrativer Zuständigkeit und müssen nicht jede Domain vollständig abbilden.' },
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
        { id: 'local', label: 'Client prüft lokale Quellen und Cache' },
        { id: 'server', label: 'Client stellt rekursive Anfrage an den konfigurierten Resolver' },
        { id: 'server-data', label: 'DNS-Server prüft eigene Zone und Cache' },
        { id: 'forwarder', label: 'Server nutzt gegebenenfalls einen passenden Forwarder' },
        { id: 'hierarchy', label: 'Falls nötig werden iterative Referrals der DNS-Hierarchie verfolgt' },
        { id: 'answer', label: 'Record wird zurückgegeben und gemäß TTL zwischengespeichert' },
      ],
      correctOrder: ['local', 'server', 'server-data', 'forwarder', 'hierarchy', 'answer'],
      explanation: 'Dies ist der typische vereinfachte Ablauf im verwendeten Szenario; Cache, Zonendaten und Konfiguration können einzelne Schritte verkürzen.',
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
        { left: 'AAAA', leftLabel: 'AAAA', right: 'Name → IPv6-Adresse' },
        { left: 'PTR', leftLabel: 'PTR', right: 'IP-Adresse → Name' },
        { left: 'CNAME', leftLabel: 'CNAME', right: 'Alias auf einen anderen Namen' },
        { left: 'MX', leftLabel: 'MX', right: 'Zuständiger Mailserver einer Domain' },
        { left: 'SRV', leftLabel: 'SRV', right: 'Dienst und zuständigen Server auffinden' },
        { left: 'SOA', leftLabel: 'SOA', right: 'Zentrale Verwaltungsinformationen einer Zone' },
        { left: 'NS', leftLabel: 'NS', right: 'Zuständiger Nameserver einer Zone' },
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
        { left: 'Primäre Zone', leftLabel: 'Primäre Zone', right: 'Schreibbare führende Datenquelle' },
        { left: 'Sekundäre Zone', leftLabel: 'Sekundäre Zone', right: 'Schreibgeschützte, per Zonentransfer synchronisierte Kopie' },
        { left: 'AD-integrierte Zone', leftLabel: 'AD-integrierte Zone', right: 'Über Active Directory integrierte und replizierte Zonendaten' },
        { left: 'Stubzone', leftLabel: 'Stubzone', right: 'Informationen zu autoritativen Nameservern statt vollständiger Zonenkopie' },
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
      id: 'dns-fqdn-matching',
      type: 'matching',
      question: 'Ordne die Bestandteile von server01.berlin.nexus.example. ihrer Ebene zu.',
      pairs: [
        { left: 'server01', leftLabel: 'server01', right: 'Hostname' },
        { left: 'berlin', leftLabel: 'berlin', right: 'Subdomain' },
        { left: 'nexus', leftLabel: 'nexus', right: 'Domain-Label' },
        { left: 'example', leftLabel: 'example', right: 'Top-Level-Domain im Beispiel' },
        { left: '.', leftLabel: 'abschließender Punkt', right: 'Root' },
      ],
      explanation: 'Der FQDN beschreibt den vollständigen hierarchischen Pfad eines Namens bis zur Root.',
    },
    {
      id: 'dns-query-types',
      type: 'matching',
      question: 'Ordne die Situation dem Abfragetyp zu.',
      pairs: [
        { left: 'Client erwartet vollständige Antwort oder Fehler', leftLabel: 'Client erwartet vollständige Antwort oder Fehler', right: 'rekursiv' },
        { left: 'Server nennt den nächsten zuständigen Nameserver', leftLabel: 'Server nennt den nächsten zuständigen Nameserver', right: 'iterativ / Referral' },
      ],
      explanation: 'Rekursion verlangt ein Endergebnis; Iteration kann auf den nächsten zuständigen Server verweisen.',
    },
    {
      id: 'dns-forwarding-delegation',
      type: 'matching',
      question: 'Ordne Mechanismus und Bedeutung zu.',
      pairs: [
        { left: 'Forwarding', leftLabel: 'Forwarding', right: 'Anfrage an einen anderen Resolver weitergeben' },
        { left: 'Delegierung', leftLabel: 'Delegierung', right: 'Zuständigkeit für einen Namensraum übertragen' },
        { left: 'Conditional Forwarder', leftLabel: 'Conditional Forwarder', right: 'nur bestimmte Domains gezielt weiterleiten' },
      ],
      explanation: 'Forwarding betrifft den Auflösungsweg; Delegierung die autoritative Verantwortung im Namespace.',
    },
    {
      id: 'dns-ip-works-name-fails',
      type: 'select-best',
      question: 'ping 10.10.10.20 funktioniert, aber ping fileserver.nexus.local nicht. Was prüfst du zuerst?',
      options: ['DNS-Konfiguration und Namensauflösung', 'das Netzwerkkabel trotz erfolgreicher IP-Verbindung austauschen', 'den Mailserver-MX-Record'],
      correct: 0,
      explanation: 'Die grundsätzliche IP-Erreichbarkeit ist vorhanden. Der Unterschied liegt beim Namen, daher ist DNS besonders wahrscheinlich.',
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
    { facet: 'domain-zone', question: 'Welche Aussage ist korrekt?', options: ['Eine Domain ist ein logischer Namensbereich; eine Zone ist ein administrativ verwalteter Teil davon.', 'Domain und Zone sind immer identisch.', 'Eine Zone enthält grundsätzlich nur eine IP-Adresse.'], correct: 0, explanation: 'Zonengrenzen beschreiben administrative DNS-Zuständigkeit und müssen nicht mit der gesamten Domain übereinstimmen.' },
    { facet: 'record-types', question: 'Welcher Record verweist auf eine IPv6-Adresse?', options: ['AAAA', 'A', 'PTR'], correct: 0, explanation: 'AAAA bildet einen Namen auf IPv6 ab; A verwendet IPv4.' },
    { facet: 'record-types', question: 'Welcher Record enthält zentrale Verwaltungsinformationen einer Zone?', options: ['SOA', 'MX', 'CNAME'], correct: 0, explanation: 'SOA steht für Start of Authority.' },
    { facet: 'recursive-iterative', question: 'Was kennzeichnet eine iterative Antwort?', options: ['Sie kann einen Referral zum nächsten zuständigen Nameserver liefern.', 'Sie muss immer die endgültige Antwort enthalten.', 'Sie leert den Client-Cache.'], correct: 0, explanation: 'Iterative Auflösung folgt schrittweise Verweisen; Cache kann den Einstieg verkürzen.' },
    { facet: 'authoritative', question: 'Kann derselbe DNS-Server für eine Zone autoritativ und für eine andere nicht autoritativ sein?', options: ['Ja, Autorität bezieht sich auf die konkrete Zone.', 'Nein, Autorität ist eine dauerhafte globale Servereigenschaft.', 'Nein, jeder DNS-Server ist immer Root-Server.'], correct: 0, explanation: 'Ein Server besitzt maßgebliche Daten nur für die Zonen, für die er zuständig ist.' },
    { facet: 'forwarding-delegation', question: 'Was bewirkt eine Delegierung?', options: ['Sie überträgt die Zuständigkeit für einen Teil des Namensraums.', 'Sie leert den Resolver-Cache.', 'Sie sendet jede Anfrage an einen General Forwarder.'], correct: 0, explanation: 'Delegierung ist hierarchische Verantwortung; Forwarding ist dagegen die Weitergabe einer Anfrage.' },
    { facet: 'dns-transport', question: 'Verwendet DNS ausschließlich UDP?', options: ['Nein, DNS nutzt je nach Situation UDP oder TCP auf Port 53.', 'Ja, TCP gehört nie zu DNS.', 'Nein, DNS verwendet ausschließlich ICMP.'], correct: 0, explanation: 'UDP ist für viele normale Abfragen üblich; TCP wird ebenfalls verwendet, etwa für bestimmte große Antworten und Zonenübertragungen.' },
    { facet: 'troubleshooting', question: 'Eine IP ist erreichbar, der zugehörige FQDN aber nicht. Was ist besonders wahrscheinlich?', options: ['ein Problem der DNS-Namensauflösung', 'zwingend ein defektes Netzwerkkabel', 'ein Fehler der Subnetz-Sprungweite'], correct: 0, explanation: 'Die erfolgreiche IP-Verbindung zeigt grundlegende Erreichbarkeit; der Ausfall beim Namen weist auf DNS.' },
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
      'Aufbau: Root → Top-Level-Domain → Domain → Subdomain → Host; ein FQDN beschreibt den vollständigen Pfad.',
      'Domain ist ein logischer Namensbereich, Zone ein administrativ verwalteter Teil mit DNS-Daten.',
      'Ablauf: lokale Quellen/Cache → Resolver → eigene Zone/Cache → Forwarder → falls nötig iterative Hierarchie → Antwort.',
      'Records: A/AAAA (IPv4/IPv6), PTR (Reverse), CNAME (Alias), MX (Mail), SRV (Dienst), SOA (Verwaltung), NS (Zuständigkeit).',
      'Rekursiv erwartet eine vollständige Antwort; iterativ kann zum nächsten zuständigen Nameserver verweisen.',
      'Forwarding leitet Anfragen weiter, Delegierung überträgt die Zuständigkeit für einen Namensraum.',
      'Ein Server ist immer bezogen auf eine konkrete Zone autoritativ oder nicht autoritativ.',
      'Praxis unter Windows Server: Rolle installieren → Forward Lookup Zone + A-Record → Reverse Lookup Zone + PTR-Record → mit nslookup/Resolve-DnsName/ping testen.',
      'Typische Fehler: Dienst/Erreichbarkeit, fehlender oder falscher Record, veralteter Client-Cache, fehlender PTR, fehlgeschlagener Zonentransfer.',
    ],
  };
}
