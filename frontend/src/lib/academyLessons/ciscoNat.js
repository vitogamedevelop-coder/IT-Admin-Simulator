import { topicKey } from '../academyTopics.js';

// =============================================================================
// "NAT" - fills the catalog's `cisco-packet-tracer/nat` slot.
// Builds directly on ACL knowledge (ACLs select inside sources for dynamic NAT/PAT).
// Covers static NAT, dynamic NAT, PAT/NAT overload, port forwarding, translation
// table analysis, verification and troubleshooting.
// All content is data-driven for later reuse (e.g. the planned Cisco exam routine).
// =============================================================================

export const CISCO_NAT_TOPIC_KEY = topicKey('cisco-packet-tracer', 'nat');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------------
  // 1. Warum NAT?
  // ---------------------------------------------------------------------------
  exps.push(explanation('intro-classic', 'Warum NAT?', 'classic', [
    { type: 'text', content: 'Network Address Translation (NAT) ermöglicht es, private IPv4-Adressen in öffentliche oder andere Adressräume zu übersetzen. Im Internet werden private Adressbereiche normalerweise nicht geroutet, daher brauchen interne Netze eine Übersetzung, um nach außen zu kommunizieren.' },
    { type: 'list', title: 'Typischer Ablauf', items: [
      'Interner Client sendet Paket an einen Server im Internet.',
      'NAT-Router ersetzt die private Source-IP durch eine globale Adresse.',
      'Der externe Server antwortet an die globale Adresse.',
      'NAT-Router übersetzt das Antwortpaket zurück zur privaten Adresse.',
    ] },
    { type: 'text', content: 'NAT ist keine Firewall. NAT kann die Sichtbarkeit interner Netze reduzieren, aber der Hauptzweck ist Adress- und Portübersetzung.' },
  ]));

  // ---------------------------------------------------------------------------
  // 2. Inside und Outside
  // ---------------------------------------------------------------------------
  exps.push(explanation('inside-outside-classic', 'Inside und Outside', 'classic', [
    { type: 'text', content: 'Aus Sicht des NAT-Routers teilen wir die Welt in zwei Seiten: Inside ist das Netz, dessen Adressen übersetzt werden. Outside ist die externe Seite. Jedes Interface muss entsprechend gekennzeichnet werden.' },
    { type: 'table', headers: ['Seite', 'Bedeutung'], rows: [
      ['inside', 'Internes Netz, dessen Adressen übersetzt werden.'],
      ['outside', 'Externes Netz, meist Internet oder WAN.'],
    ] },
    { type: 'list', title: 'Interface-Kennzeichnung', items: [
      'interface g0/0',
      ' ip nat inside',
      'interface g0/1',
      ' ip nat outside',
    ] },
    { type: 'question', question: 'Welches Interface wird typischerweise als inside markiert?', options: ['Das Interface zum LAN', 'Das Interface zum Internet', 'Der Loopback', 'Das Switch-Interface'], correct: 0, explanation: 'inside ist die Seite mit den privaten Adressen, also typischerweise das LAN-Interface.' },
  ]));

  // ---------------------------------------------------------------------------
  // 3. Die vier NAT-Adressbegriffe
  // ---------------------------------------------------------------------------
  exps.push(explanation('address-terms-classic', 'Inside Local, Inside Global, Outside Local, Outside Global', 'classic', [
    { type: 'text', content: 'Cisco unterscheidet vier Adressbegriffe. In einfachen Szenarien sind Outside Local und Outside Global identisch, aber konzeptionell sind sie unterschiedlich.' },
    { type: 'table', headers: ['Begriff', 'Bedeutung', 'Beispiel'], rows: [
      ['Inside Local', 'Private Adresse eines internen Geräts', '192.168.10.10'],
      ['Inside Global', 'Adresse, unter der das interne Gerät nach außen erscheint', '203.0.113.10'],
      ['Outside Global', 'Tatsächliche globale Adresse eines externen Geräts', '198.51.100.20'],
      ['Outside Local', 'Adresse des externen Geräts, wie sie im internen Netz erscheint', '198.51.100.20'],
    ] },
    { type: 'text', content: 'Beispiel: Client 192.168.10.25 wird nach außen als 203.0.113.25 dargestellt. Der externe Server 198.51.100.20 bleibt meist unverändert, also sind Outside Local und Outside Global identisch.' },
    { type: 'question', question: 'Welche Adresse ist die private Adresse eines internen Clients?', options: ['Inside Global', 'Inside Local', 'Outside Global', 'Outside Local'], correct: 1, explanation: 'Inside Local ist die reale private Adresse des internen Geräts.' },
  ]));

  // ---------------------------------------------------------------------------
  // 4. Statisches NAT
  // ---------------------------------------------------------------------------
  exps.push(explanation('static-classic', 'Statisches NAT', 'classic', [
    { type: 'text', content: 'Statisches NAT erstellt eine feste 1:1-Zuordnung zwischen einer Inside-Local- und einer Inside-Global-Adresse. Es wird verwendet, wenn ein interner Host dauerhaft unter einer bestimmten globalen Adresse erreichbar sein soll.' },
    { type: 'list', title: 'Beispiel', items: [
      'ip nat inside source static 192.168.10.10 203.0.113.10',
      'interface g0/0',
      ' ip nat inside',
      'interface g0/1',
      ' ip nat outside',
    ] },
    { type: 'text', content: 'Syntax: ip nat inside source static <inside-local> <inside-global>. Die Reihenfolge ist wichtig: zuerst die private, dann die globale Adresse.' },
    { type: 'question', question: 'Wann wird statisches NAT typischerweise verwendet?', options: ['Wenn viele interne Clients ins Internet sollen', 'Wenn ein interner Server dauerhaft unter einer festen globalen Adresse erreichbar sein soll', 'Wenn keine öffentlichen Adressen verfügbar sind', 'Wenn dynamische Übersetzung gewünscht ist'], correct: 1, explanation: 'Statisches NAT ist eine feste 1:1-Zuordnung, ideal für Server, die extern erreichbar sein sollen.' },
  ]));

  // ---------------------------------------------------------------------------
  // 5. Dynamisches NAT
  // ---------------------------------------------------------------------------
  exps.push(explanation('dynamic-classic', 'Dynamisches NAT', 'classic', [
    { type: 'text', content: 'Dynamisches NAT verwendet einen Pool globaler Adressen. Interne Geräte erhalten bei Bedarf eine verfügbare Adresse aus dem Pool. Die Zuordnung ist nicht dauerhaft an ein bestimmtes Gerät gebunden.' },
    { type: 'list', title: 'Beispiel', items: [
      'access-list 1 permit 192.168.10.0 0.0.0.255',
      'ip nat pool PUBLIC 203.0.113.100 203.0.113.110 netmask 255.255.255.0',
      'ip nat inside source list 1 pool PUBLIC',
      'interface g0/0',
      ' ip nat inside',
      'interface g0/1',
      ' ip nat outside',
    ] },
    { type: 'text', content: 'Die ACL wählt aus, welche Inside-Local-Adressen übersetzt werden dürfen. Der Pool stellt die Inside-Global-Adressen bereit. ip nat inside source list <ACL> pool <POOL> verbindet beides.' },
    { type: 'question', question: 'Was passiert, wenn ein Dynamic-NAT-Pool erschöpft ist?', options: ['Verkehr wird über PAT weitergeleitet', 'Weitere Verbindungen können nicht übersetzt werden', 'Es wird automatisch statisches NAT verwendet', 'Alle Verbindungen werden blockiert'], correct: 1, explanation: 'Ohne Overload kann dynamisches NAT nur so viele gleichzeitige Übersetzungen durchführen, wie Pool-Adressen verfügbar sind.' },
  ]));

  // ---------------------------------------------------------------------------
  // 6. PAT / NAT Overload
  // ---------------------------------------------------------------------------
  exps.push(explanation('pat-classic', 'PAT / NAT Overload', 'classic', [
    { type: 'text', content: 'PAT (Port Address Translation) ermöglicht es, mehreren internen Geräten dieselbe globale IP-Adresse gemeinsam zu nutzen. Zusätzlich zur IP-Adresse werden Port- und Protokollinformationen zur Unterscheidung verwendet.' },
    { type: 'list', title: 'Beispiel mit Interface-Overload', items: [
      'access-list 1 permit 192.168.10.0 0.0.0.255',
      'ip nat inside source list 1 interface g0/1 overload',
      'interface g0/0',
      ' ip nat inside',
      'interface g0/1',
      ' ip nat outside',
    ] },
    { type: 'text', content: 'overload am Ende des Befehls ist entscheidend. Ohne overload wäre es dynamisches NAT ohne Port-Sharing und würde bei einer globalen Adresse schnell erschöpft sein.' },
    { type: 'list', title: 'Beispiel mit Pool-Overload', items: [
      'ip nat pool PUBLIC 203.0.113.100 203.0.113.102 netmask 255.255.255.0',
      'ip nat inside source list 1 pool PUBLIC overload',
    ] },
    { type: 'question', question: 'Was bewirkt das Schlüsselwort overload bei NAT?', options: ['Mehrere Verbindungen teilen sich globale Adressen via Ports', 'Es wird kein Pool verwendet', 'NAT wird deaktiviert', 'Es wird statisches NAT erzwungen'], correct: 0, explanation: 'overload ermöglicht PAT, bei dem mehrere Verbindungen dieselbe globale Adresse gemeinsam nutzen, unterschieden durch Ports.' },
  ]));

  // ---------------------------------------------------------------------------
  // 7. Port Forwarding
  // ---------------------------------------------------------------------------
  exps.push(explanation('port-forward-classic', 'Port Forwarding', 'classic', [
    { type: 'text', content: 'Port Forwarding leitet eingehenden Traffic, der auf einer globalen Adresse und einem bestimmten Port ankommt, an einen definierten internen Host und Port weiter. Es wird oft verwendet, um interne Server aus dem Internet erreichbar zu machen.' },
    { type: 'list', title: 'Beispiel', items: [
      'ip nat inside source static tcp 192.168.10.20 80 203.0.113.10 8080',
      'interface g0/0',
      ' ip nat inside',
      'interface g0/1',
      ' ip nat outside',
    ] },
    { type: 'text', content: 'Bedeutung: tcp, dann Inside-Local 192.168.10.20 und lokaler Port 80, dann Inside-Global 203.0.113.10 und globaler Port 8080. Externe Anfragen an 203.0.113.10:8080 werden an 192.168.10.20:80 weitergeleitet.' },
    { type: 'question', question: 'Was macht diese Regel? ip nat inside source static tcp 192.168.10.20 80 203.0.113.10 8080', options: ['HTTP-Anfragen an 203.0.113.10:8080 werden an 192.168.10.20:80 weitergeleitet', 'HTTP-Anfragen an 192.168.10.20:80 werden an 203.0.113.10:8080 weitergeleitet', 'Alles wird blockiert', 'PAT wird aktiviert'], correct: 0, explanation: 'Die Reihenfolge ist: Protokoll, Inside-Local, Local-Port, Inside-Global, Global-Port. Extern an Global-Port 8080 kommt intern bei Local-Port 80 an.' },
  ]));

  // ---------------------------------------------------------------------------
  // 8. NAT Translation Table
  // ---------------------------------------------------------------------------
  exps.push(explanation('translation-table-classic', 'NAT Translation Table', 'classic', [
    { type: 'text', content: 'Mit show ip nat translations zeigt der Router die aktuellen Übersetzungen an. Die Tabelle enthält pro Verbindung die Spalten Pro, Inside global, Inside local, Outside local und Outside global.' },
    { type: 'table', headers: ['Spalte', 'Bedeutung'], rows: [
      ['Pro', 'Protokoll (z. B. tcp, udp)'],
      ['Inside global', 'Globale Adresse, unter der der interne Host nach außen erscheint'],
      ['Inside local', 'Private Adresse des internen Hosts'],
      ['Outside local', 'Adresse des externen Hosts aus Sicht des internen Netzes'],
      ['Outside global', 'Tatsächliche globale Adresse des externen Hosts'],
    ] },
    { type: 'text', content: 'Bei PAT sieht man zusätzlich die verwendeten Ports, sowohl lokal als auch global.' },
    { type: 'question', question: 'Welcher Befehl zeigt die aktiven NAT-Übersetzungen an?', options: ['show ip nat translations', 'show ip route', 'show access-lists', 'show ip interface'], correct: 0, explanation: 'show ip nat translations listet die aktiven NAT-Übersetzungen auf.' },
  ]));

  // ---------------------------------------------------------------------------
  // 9. Verifikation
  // ---------------------------------------------------------------------------
  exps.push(explanation('verify-classic', 'NAT verifizieren', 'classic', [
    { type: 'text', content: 'Nach der NAT-Konfiguration musst du prüfen, ob Übersetzungen stattfinden, welche Interfaces inside/outside sind und ob die Konfiguration korrekt geladen wurde.' },
    { type: 'table', headers: ['Befehl', 'Zweck'], rows: [
      ['show ip nat translations', 'Aktive Übersetzungen anzeigen.'],
      ['show ip nat statistics', 'NAT-Statistiken, Interfaces, Hits/Misses.'],
      ['show ip interface', 'Kennzeichnung inside/outside prüfen.'],
      ['show running-config', 'Gesamte Konfiguration inklusive NAT.'],
    ] },
    { type: 'text', content: 'show ip nat statistics zeigt außerdem, ob dynamische Übersetzungen aktiv sind und wie viele global/lokal Einträge existieren.' },
  ]));

  // ---------------------------------------------------------------------------
  // 10. Troubleshooting
  // ---------------------------------------------------------------------------
  exps.push(explanation('troubleshooting-classic', 'Fehlersuche bei NAT', 'classic', [
    { type: 'text', content: 'NAT funktioniert nur, wenn Routing, ACL-Auswahl, Pool, Overload und Interface-Kennzeichnung stimmen. Häufige Fehler sind vertauschte inside/outside-Interfaces, falsche Wildcard-Masken, erschöpfte Pools oder fehlendes overload.' },
    { type: 'list', title: 'Prüfreihenfolge', items: [
      'Interfaces: ip nat inside / ip nat outside vorhanden?',
      'Routing: Kennt der Router den Weg ins Zielnetz?',
      'ACL: Matcht die Auswahl-ACL die gewünschten Inside-Local-Adressen?',
      'Pool: Sind genügend globale Adressen vorhanden?',
      'Overload: PAT aktiviert, falls mehrere Clients dieselbe globale IP nutzen sollen?',
      'Port Forwarding: Reihenfolge Local/Local-Port/Global/Global-Port korrekt?',
    ] },
    { type: 'text', content: 'Dynamische Translation Entries können mit clear ip nat translation * entfernt werden. Dies sollte jedoch nicht der erste Schritt sein - zuerst die show-Befehle analysieren.' },
  ]));

  // ---------------------------------------------------------------------------
  // 11. NAT Varianten Vergleich
  // ---------------------------------------------------------------------------
  exps.push(explanation('comparison-classic', 'Vergleich: Static, Dynamic, PAT, Port Forwarding', 'classic', [
    { type: 'table', headers: ['Variante', 'Merkmal', 'Beispiel'], rows: [
      ['Static NAT', 'Feste 1:1-Zuordnung', 'ip nat inside source static 192.168.10.10 203.0.113.10'],
      ['Dynamic NAT', 'Pool-basiert, keine Port-Sharing', 'ip nat inside source list 1 pool PUBLIC'],
      ['PAT', 'Viele Clients über eine oder wenige globale IPs via Ports', 'ip nat inside source list 1 interface g0/1 overload'],
      ['Port Forwarding', 'Globaler Port → interner Host/Port', 'ip nat inside source static tcp 192.168.10.20 80 203.0.113.10 8080'],
    ] },
    { type: 'question', question: 'Welche NAT-Variante eignet sich, wenn 100 interne Clients über eine einzige öffentliche IPv4-Adresse surfen sollen?', options: ['Statisches NAT', 'Dynamisches NAT', 'PAT / Overload', 'Port Forwarding'], correct: 2, explanation: 'PAT ermöglicht es, viele interne Verbindungen über eine globale Adresse zu übersetzen, unterschieden durch Ports.' },
  ]));

  // ---------------------------------------------------------------------------
  // 12. Zusammenfassung
  // ---------------------------------------------------------------------------
  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'NAT übersetzt private in globale Adressen und umgekehrt.',
      'inside/outside Interfaces müssen mit ip nat inside / outside gekennzeichnet werden.',
      'Inside Local = private Adresse, Inside Global = globale Darstellung nach außen.',
      'Statisches NAT = feste 1:1-Zuordnung.',
      'Dynamisches NAT = Pool-basierte Übersetzung ohne Port-Sharing.',
      'PAT / Overload = mehrere Clients teilen sich globale Adressen via Ports.',
      'Port Forwarding leitet externe Ports an interne Hosts weiter.',
      'Verifizieren: show ip nat translations, show ip nat statistics, show ip interface.',
      'Troubleshooting: Interfaces, Routing, ACL, Pool, overload, Reihenfolge beachten.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'nat-terms-matching',
      type: 'matching',
      question: 'Ordne die vier NAT-Adressbegriffe ihrer Bedeutung zu.',
      pairs: [
        { left: 'Inside Local', leftLabel: 'Inside Local', right: 'Private Adresse eines internen Geräts' },
        { left: 'Inside Global', leftLabel: 'Inside Global', right: 'Adresse, unter der das interne Gerät nach außen erscheint' },
        { left: 'Outside Global', leftLabel: 'Outside Global', right: 'Tatsächliche globale Adresse des externen Geräts' },
        { left: 'Outside Local', leftLabel: 'Outside Local', right: 'Adresse des externen Geräts aus Sicht des internen Netzes' },
      ],
      explanation: 'Inside Local/Inside Global beziehen sich auf das interne Gerät, Outside Local/Outside Global auf das externe Gerät.',
    },
    {
      id: 'nat-address-mapping-select',
      type: 'select-best',
      question: 'Ein Client mit 192.168.10.25 wird nach außen als 203.0.113.25 dargestellt. Der externe Server hat 198.51.100.20. Welche Zuordnung ist korrekt?',
      options: [
        '192.168.10.25 = Inside Global, 203.0.113.25 = Inside Local',
        '192.168.10.25 = Inside Local, 203.0.113.25 = Inside Global, 198.51.100.20 = Outside Global und Outside Local',
        '203.0.113.25 = Outside Global, 198.51.100.20 = Inside Global',
        '192.168.10.25 = Outside Local, 198.51.100.20 = Inside Global',
      ],
      correct: 1,
      explanation: '192.168.10.25 ist die private Inside-Local, 203.0.113.25 die globale Inside-Global. Der externe Server 198.51.100.20 ist gleichzeitig Outside Global und Outside Local, da er nicht übersetzt wird.',
    },
    {
      id: 'nat-static-vs-dynamic-select',
      type: 'select-best',
      question: 'Ein interner Webserver soll immer unter der öffentlichen Adresse 203.0.113.20 erreichbar sein. Welche NAT-Variante ist passend?',
      options: ['Statisches NAT', 'Dynamisches NAT', 'PAT', 'Port Forwarding'], correct: 0,
      explanation: 'Statisches NAT bietet eine feste 1:1-Zuordnung zwischen Inside Local und Inside Global.',
    },
    {
      id: 'nat-pat-vs-dynamic-select',
      type: 'select-best',
      question: '100 Clients sollen über eine einzige öffentliche IPv4-Adresse ins Internet. Welche Variante ist passend?',
      options: ['Statisches NAT', 'Dynamisches NAT mit Pool', 'PAT / Overload', 'Port Forwarding'], correct: 2,
      explanation: 'PAT ermöglicht es, viele Verbindungen über eine globale Adresse zu übersetzen, unterschieden durch Ports.',
    },
    {
      id: 'nat-interface-ordering',
      type: 'ordering',
      question: 'Bringe die folgenden Schritte für eine typische PAT-Konfiguration in die richtige Reihenfolge.',
      items: [
        { id: 'acl', label: 'ACL für Inside Sources definieren' },
        { id: 'inside', label: 'ip nat inside am LAN-Interface' },
        { id: 'outside', label: 'ip nat outside am WAN-Interface' },
        { id: 'nat', label: 'ip nat inside source list ... interface ... overload' },
      ],
      correctOrder: ['acl', 'inside', 'outside', 'nat'],
      explanation: 'ACL wählt die zu übersetzenden Adressen, Interfaces werden gekennzeichnet, NAT-Regel verbindet ACL mit Outside-Interface und Overload.',
    },
    {
      id: 'nat-static-cli',
      type: 'cli-input',
      question: 'Konfiguriere statisches NAT: interner Server 192.168.10.20 soll extern als 203.0.113.20 erscheinen. Markiere g0/0 als inside und g0/1 als outside.',
      expectedLines: [
        'ip nat inside source static 192.168.10.20 203.0.113.20',
        'interface g0/0',
        'ip nat inside',
        'interface g0/1',
        'ip nat outside',
      ],
      explanation: 'Statisches NAT mit ip nat inside source static <inside-local> <inside-global> und Interface-Kennzeichnungen.',
    },
    {
      id: 'nat-pat-interface-cli',
      type: 'cli-input',
      question: 'Alle Clients aus 192.168.10.0/24 sollen über die WAN-IP von g0/1 ins Internet (PAT).',
      expectedLines: [
        'access-list 1 permit 192.168.10.0 0.0.0.255',
        'ip nat inside source list 1 interface g0/1 overload',
        'interface g0/0',
        'ip nat inside',
        'interface g0/1',
        'ip nat outside',
      ],
      explanation: 'ACL wählt Inside Sources, overload aktiviert PAT auf dem Outside-Interface g0/1.',
    },
    {
      id: 'nat-pat-pool-cli',
      type: 'cli-input',
      question: 'Konfiguriere PAT mit NAT-Pool PUBLIC 203.0.113.100 bis 203.0.113.102 für 192.168.10.0/24.',
      expectedLines: [
        'access-list 1 permit 192.168.10.0 0.0.0.255',
        'ip nat pool PUBLIC 203.0.113.100 203.0.113.102 netmask 255.255.255.0',
        'ip nat inside source list 1 pool PUBLIC overload',
        'interface g0/0',
        'ip nat inside',
        'interface g0/1',
        'ip nat outside',
      ],
      explanation: 'Pool mit netmask, overload am Ende aktiviert PAT über den Pool.',
    },
    {
      id: 'nat-port-forward-cli',
      type: 'cli-input',
      question: 'Externe Anfragen an 203.0.113.10:8080 sollen an internen Webserver 192.168.10.20:80 weitergeleitet werden (TCP).',
      expectedLines: [
        'ip nat inside source static tcp 192.168.10.20 80 203.0.113.10 8080',
        'interface g0/0',
        'ip nat inside',
        'interface g0/1',
        'ip nat outside',
      ],
      explanation: 'Reihenfolge: tcp, Inside-Local, Local-Port, Inside-Global, Global-Port.',
    },
    {
      id: 'nat-verify-select',
      type: 'select-best',
      question: 'Welcher Befehl zeigt die aktiven NAT-Übersetzungen an?',
      options: ['show ip nat statistics', 'show ip nat translations', 'show ip interface', 'show access-lists'], correct: 1,
      explanation: 'show ip nat translations listet die aktiven Übersetzungen mit pro, inside global, inside local, outside local, outside global.',
    },
    {
      id: 'nat-troubleshoot-select',
      type: 'select-best',
      question: 'Clients können trotz korrekter NAT-Regel nicht ins Internet. Was prüfst du zuerst?',
      options: ['Ob ip nat inside/outside an den Interfaces gesetzt ist', 'Ob der Switch defekt ist', 'Ob das WLAN-Passwort stimmt', 'Ob der DHCP-Server läuft'], correct: 0,
      explanation: 'NAT funktioniert nur, wenn die Interfaces korrekt als inside/outside markiert sind.',
    },
    {
      id: 'nat-overload-difference-select',
      type: 'select-best',
      question: 'Was unterscheidet dynamisches NAT ohne overload von PAT?',
      options: ['PAT verwendet keine globale Adresse', 'PAT erlaubt Port-Sharing über eine oder wenige globale Adressen', 'Dynamisches NAT übersetzt keine Ports', 'PAT funktioniert nur statisch'],
      correct: 1,
      explanation: 'Ohne overload belegt jede Verbindung eine eigene globale Adresse aus dem Pool. PAT teilt sich globale Adressen durch Portunterscheidung.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Wofür wird NAT primär verwendet?', options: ['Routing-Protokolle konfigurieren', 'Private IPv4-Adressen in globale Adressen übersetzen', 'Netzwerkverkehr verschlüsseln', 'Spanning Tree berechnen'], correct: 1, explanation: 'NAT übersetzt private in globale Adressen, damit interne Netze mit externen Netzen kommunizieren können.' },
    { question: 'Was bedeutet Inside Local?', options: ['Die globale Adresse eines internen Geräts', 'Die private Adresse eines internen Geräts', 'Die globale Adresse eines externen Geräts', 'Die private Adresse eines externen Geräts'], correct: 1, explanation: 'Inside Local ist die reale private Adresse des internen Geräts.' },
    { question: 'Was bedeutet Inside Global?', options: ['Die private Adresse eines internen Geräts', 'Die Adresse, unter der ein internes Gerät nach außen erscheint', 'Die globale Adresse eines externen Geräts', 'Die Adresse eines Routers'], correct: 1, explanation: 'Inside Global ist die globale Adresse, unter der der interne Host extern sichtbar ist.' },
    { question: 'In einfachen Szenarien sind Outside Local und Outside Global oft identisch. Warum?', options: ['Weil externe Geräte selten übersetzt werden', 'Weil NAT immer beide Seiten übersetzt', 'Weil sie dieselbe Hardware haben', 'Weil NAT keine externen Adressen kennt'], correct: 0, explanation: 'Wenn externe Adressen nicht verändert werden, stimmen Outside Local und Outside Global überein.' },
    { question: 'Welches Kommando markiert ein Interface als inside?', options: ['ip nat outside', 'ip nat inside', 'ip nat enable', 'nat inside'], correct: 1, explanation: 'interface ... ip nat inside kennzeichnet das LAN-Interface.' },
    { question: 'Welches Kommando markiert ein Interface als outside?', options: ['ip nat inside', 'ip nat outside', 'ip nat wan', 'nat outside'], correct: 1, explanation: 'interface ... ip nat outside kennzeichnet das WAN/Internet-Interface.' },
    { question: 'Welche NAT-Variante bietet eine feste 1:1-Zuordnung?', options: ['PAT', 'Dynamisches NAT', 'Statisches NAT', 'Port Forwarding'], correct: 2, explanation: 'Statisches NAT erzeugt eine feste Zuordnung zwischen Inside Local und Inside Global.' },
    { question: 'Welches Schlüsselwort aktiviert PAT?', options: ['pool', 'overload', 'static', 'dynamic'], correct: 1, explanation: 'overload ermöglicht Port Address Translation, sodass mehrere Verbindungen dieselbe globale Adresse teilen.' },
    { question: 'Welcher Befehl konfiguriert PAT über das Interface g0/1?', options: ['ip nat inside source list 1 interface g0/1 overload', 'ip nat inside source static 192.168.1.1 g0/1', 'ip nat pool PUBLIC g0/1 overload', 'ip nat outside source list 1 g0/1'], correct: 0, explanation: 'ip nat inside source list <ACL> interface <interface> overload ist der Standard-PAT-Befehl über eine Interface-Adresse.' },
    { question: 'Was passiert, wenn ein dynamischer NAT-Pool erschöpft ist?', options: ['Es wird automatisch PAT verwendet', 'Weitere Verbindungen können nicht übersetzt werden', 'Alle Verbindungen werden blockiert', 'NAT fällt auf statisches NAT zurück'], correct: 1, explanation: 'Ohne overload kann dynamisches NAT nur so viele Verbindungen übersetzen, wie Adressen im Pool verfügbar sind.' },
    { question: 'Was bewirkt Port Forwarding?', options: ['Interne Adressen werden ausgeblendet', 'Externer Port wird an internen Host/Port weitergeleitet', 'PAT wird deaktiviert', 'Ein Pool wird erstellt'], correct: 1, explanation: 'Port Forwarding leitet Traffic für einen bestimmten globalen Port an einen internen Host und Port weiter.' },
    { question: 'Welche Reihenfolge hat Port Forwarding? ip nat inside source static tcp 192.168.10.20 80 203.0.113.10 8080', options: ['Global-Port, Local-IP, Local-Port, Global-IP', 'Protokoll, Inside-Local, Local-Port, Inside-Global, Global-Port', 'Local-IP, Global-IP, Protokoll, Port, Port', 'Inside-Global, Inside-Local, Local-Port, Global-Port'], correct: 1, explanation: 'Reihenfolge: Protokoll, Inside-Local, Local-Port, Inside-Global, Global-Port.' },
    { question: 'Welcher Befehl zeigt NAT-Statistiken?', options: ['show ip nat translations', 'show ip nat statistics', 'show ip interface', 'show ip route'], correct: 1, explanation: 'show ip nat statistics zeigt NAT-Status, Interfaces, Hits/Misses und dynamische Mappings.' },
    { question: 'Welcher Befehl zeigt aktive NAT-Übersetzungen?', options: ['show ip route', 'show ip nat translations', 'show ip interface', 'show access-lists'], correct: 1, explanation: 'show ip nat translations listet die aktiven Übersetzungen.' },
    { question: 'Was prüfst du zuerst, wenn NAT nicht funktioniert?', options: ['Ob die NAT-Regel vorhanden ist', 'Ob ip nat inside und outside an den Interfaces gesetzt sind', 'Ob der Switch neu starten muss', 'Ob das WLAN-Passwort geändert wurde'], correct: 1, explanation: 'Ohne inside/outside-Interface-Kennzeichnung führt der Router keine NAT-Übersetzung durch.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Ein interner Server mit 192.168.10.20 soll extern immer unter 203.0.113.20 erreichbar sein. Markiere g0/0 als inside und g0/1 als outside."',
      expectedLines: [
        'ip nat inside source static 192.168.10.20 203.0.113.20',
        'interface g0/0',
        'ip nat inside',
        'interface g0/1',
        'ip nat outside',
      ],
      explanation: 'Statisches NAT mit fester 1:1-Zuordnung und Interface-Kennzeichnungen.',
    },
    {
      prompt: 'Sam: "Alle Clients aus 192.168.10.0/24 sollen über die IP des g0/1-Interfaces ins Internet. Verwende PAT."',
      expectedLines: [
        'access-list 1 permit 192.168.10.0 0.0.0.255',
        'ip nat inside source list 1 interface g0/1 overload',
        'interface g0/0',
        'ip nat inside',
        'interface g0/1',
        'ip nat outside',
      ],
      explanation: 'PAT über Outside-Interface mit overload. ACL wählt Inside Sources.',
    },
    {
      prompt: 'Sam: "Verwende stattdessen einen NAT-Pool PUBLIC (203.0.113.100–203.0.113.102) mit PAT für 192.168.10.0/24."',
      expectedLines: [
        'access-list 1 permit 192.168.10.0 0.0.0.255',
        'ip nat pool PUBLIC 203.0.113.100 203.0.113.102 netmask 255.255.255.0',
        'ip nat inside source list 1 pool PUBLIC overload',
        'interface g0/0',
        'ip nat inside',
        'interface g0/1',
        'ip nat outside',
      ],
      explanation: 'PAT über NAT-Pool: Pool definieren, dann source list ... pool ... overload.',
    },
    {
      prompt: 'Sam: "Leite externe Anfragen an 203.0.113.10:8080 an den internen Webserver 192.168.10.20:80 weiter (TCP)."',
      expectedLines: [
        'ip nat inside source static tcp 192.168.10.20 80 203.0.113.10 8080',
        'interface g0/0',
        'ip nat inside',
        'interface g0/1',
        'ip nat outside',
      ],
      explanation: 'Port Forwarding: tcp, Inside-Local, Local-Port, Inside-Global, Global-Port.',
    },
    {
      prompt: 'Sam: "Wie prüfst du die aktuellen NAT-Übersetzungen?"',
      expectedLines: [['show ip nat translations', 'sh ip nat translations']],
      explanation: 'show ip nat translations zeigt alle aktiven Übersetzungen.',
    },
    {
      prompt: 'Sam: "Wie prüfst du NAT-Statistiken und Interface-Kennzeichnungen?"',
      expectedLines: [['show ip nat statistics', 'sh ip nat statistics']],
      explanation: 'show ip nat statistics zeigt NAT-Status, inside/outside Interfaces, Hits/Misses.',
    },
    {
      prompt: 'Sam: "Clients können nicht ins Internet, obwohl die ACL korrekt ist. Was prüfst du zuerst?"',
      expectedLines: [
        'show ip interface',
      ],
      explanation: 'show ip interface zeigt, ob ip nat inside und ip nat outside an den richtigen Interfaces konfiguriert sind.',
    },
  ];
}

export function buildCiscoNatLesson() {
  return {
    title: 'NAT',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
    summary: [
      'NAT übersetzt private in globale Adressen und umgekehrt.',
      'inside/outside Interfaces werden mit ip nat inside / outside gekennzeichnet.',
      'Inside Local = private Adresse, Inside Global = globale Darstellung nach außen.',
      'Outside Local und Outside Global sind in einfachen Szenarien identisch.',
      'Statisches NAT = feste 1:1-Zuordnung.',
      'Dynamisches NAT = Pool-basierte Übersetzung ohne Port-Sharing.',
      'PAT / Overload = viele Clients teilen sich globale Adressen via Ports.',
      'Port Forwarding = externer Port → interner Host/Port.',
      'Verifizieren: show ip nat translations, show ip nat statistics, show ip interface.',
      'Troubleshooting: Interfaces, Routing, ACL-Auswahl, Pool, overload, Port-Reihenfolge.',
    ],
  };
}
