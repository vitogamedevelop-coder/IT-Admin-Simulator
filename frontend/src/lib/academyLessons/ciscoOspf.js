import { topicKey } from '../academyTopics.js';

// =============================================================================
// "OSPF" - fills the catalog's `cisco-packet-tracer/ospf` slot.
// Complete hands-on lesson covering OSPF basics, the two activation methods
// (network and interface), the three authentication variants (null, clear-text,
// MD5), passive-interface, default-route origination and verification commands.
// All content is data-driven so questions can be reused for a later Cisco exam
// special-quiz.
// =============================================================================

export const CISCO_OSPF_TOPIC_KEY = topicKey('cisco-packet-tracer', 'ospf');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------------
  // 1. Grundlagen
  // ---------------------------------------------------------------------------
  exps.push(explanation('intro-classic', 'Was ist OSPF?', 'classic', [
    { type: 'text', content: 'OSPF (Open Shortest Path First) ist ein link-state dynamisches Routing-Protokoll. Jeder Router kennt die komplette Netzwerktopologie seiner OSPF-Area und berechnet mit dem Dijkstra-Algorithmus den kürzesten Pfad zu jedem Zielnetz.' },
    { type: 'list', title: 'Wichtige Begriffe', items: [
      'OSPF-Prozess: Eine laufende Instanz des Routing-Protokolls auf dem Router, identifiziert durch eine Prozessnummer (z. B. 1).',
      'Area: Ein logischer Bereich des OSPF-Netzwerks. Area 0 ist immer die Backbone-Area und muss zentral erreichbar sein.',
      'Nachbarschaft: Zwei OSPF-Router auf demselben direkt verbundenen Netz bilden eine Nachbarschaft, wenn Prozess, Area und Authentifizierung übereinstimmen.',
      'Wildcard Mask: Invertierte Subnetzmaske. Sie legt fest, welche Bits der Interface-IP bei der Network-Anweisung zur Auswahl herangezogen werden.',
    ] },
    { type: 'table', headers: ['Begriff', 'Bedeutung'], rows: [
      ['router ospf 1', 'Wechselt in den OSPF-Prozess 1.'],
      ['network <Netz> <Wildcard> area 0', 'Aktiviert OSPF auf allen Interfaces, deren IP in den angegebenen Bereich fällt.'],
      ['passive-interface <Interface>', 'Beendet OSPF-Hello-Pakete auf dem Interface, behält die Route aber im Protokoll.'],
      ['default-information originate', 'Verbreitet die statische Default Route über OSPF.'],
    ] },
  ]));

  exps.push(explanation('intro-intuitive', 'OSPF einfach erklärt', 'intuitive', [
    { type: 'text', content: 'Stell dir ein Firmennetzwerk als Stadtplan vor. Jeder Router ist ein Kreuzung, jede Leitung ist eine Straße. OSPF verschickt „Stadtpläne“ an alle anderen Router, damit jeder weiß, welche Straße zum Ziel am schnellsten ist. Area 0 ist dabei das zentrale Rathaus, an das alle Stadtteile (Areas) angebunden sein müssen.' },
  ]));

  // ---------------------------------------------------------------------------
  // 2. Wildcard Mask
  // ---------------------------------------------------------------------------
  exps.push(explanation('wildcard-classic', 'Wildcard Mask verstehen', 'classic', [
    { type: 'text', content: 'Die Wildcard Mask ist die Umkehrung der Subnetzmaske. Bei einer Subnetzmaske 255.255.255.0 (= /24) ist die Wildcard Mask 0.0.0.255. Eine 0 in der Wildcard sagt: „dieses Bit muss passen“, eine 255 sagt: „dieses Bit ist egal“.' },
    { type: 'table', headers: ['Subnetzmaske', 'Wildcard Mask'], rows: [
      ['255.255.255.0', '0.0.0.255'],
      ['255.255.255.252', '0.0.0.3'],
      ['255.255.0.0', '0.0.255.255'],
      ['0.0.0.0', '255.255.255.255'],
    ] },
    { type: 'list', title: 'Beispiel', items: [
      'Interface-IP: 10.0.0.5/30, Netz: 10.0.0.4/30, Wildcard: 0.0.0.3',
      'Passende Network-Anweisung: network 10.0.0.4 0.0.0.3 area 0',
    ] },
    { type: 'question', question: 'Welche Wildcard Mask gehört zur Subnetzmaske 255.255.255.252?', options: ['0.0.0.3', '0.0.0.255', '255.255.255.252', '0.0.3.255'], correct: 0, explanation: '255.255.255.252 ist /30, also 30 feste Bits. Invertiert: 0.0.0.3.' },
  ]));

  // ---------------------------------------------------------------------------
  // 3. Methode A - Network-Methode
  // ---------------------------------------------------------------------------
  exps.push(explanation('network-method-classic', 'Methode A: Network-Methode', 'classic', [
    { type: 'text', content: 'Bei der Network-Methode wählst du im OSPF-Prozess mit einer Netzwerk- und Wildcard-Masken-Anweisung aus, auf welchen Interfaces OSPF aktiviert wird. Alle passenden Interfaces werden automatisch in die angegebene Area eingebunden.' },
    { type: 'list', title: 'Beispiel: OSPF auf g0/0 und g0/1 mit Network-Methode', items: [
      'Router(config)# router ospf 1',
      'Router(config-router)# network 10.0.0.4 0.0.0.3 area 0',
      'Router(config-router)# network 10.0.1.0 0.0.0.255 area 0',
    ] },
    { type: 'text', content: 'Wenn g0/2 zum Client-Netz führt und keine OSPF-Nachbarschaft aufbauen soll, wird es anschließend als passive-interface deklariert.' },
    { type: 'list', title: 'Client-Netz ohne Nachbarschaft', items: [
      'Router(config-router)# passive-interface g0/2',
    ] },
    { type: 'question', question: 'Was bewirkt die Network-Anweisung im OSPF-Prozess?', options: ['Sie vergibt IP-Adressen', 'Sie wählt Interfaces anhand ihrer IP-Adresse aus und aktiviert OSPF in der angegebenen Area', 'Sie löscht alte OSPF-Nachbarn', 'Sie ändert die Subnetzmaske'], correct: 1, explanation: 'Network <Netz> <Wildcard> area <Area> aktiviert OSPF auf allen Interfaces, deren IP in den Wildcard-Bereich fällt.' },
  ]));

  // ---------------------------------------------------------------------------
  // 4. Methode B - Interface-Methode
  // ---------------------------------------------------------------------------
  exps.push(explanation('interface-method-classic', 'Methode B: Interface-Methode', 'classic', [
    { type: 'text', content: 'Bei der Interface-Methode aktivierst du OSPF direkt auf dem jeweiligen Interface. Du musst dort Prozessnummer und Area angeben. Anschließend wechselst du in den OSPF-Prozess, um globale Einstellungen wie passive-interface vorzunehmen.' },
    { type: 'list', title: 'Beispiel: OSPF auf g0/0, g0/1 und g0/2 mit Interface-Methode', items: [
      'Router(config)# interface range g0/0-2',
      'Router(config-if-range)# ip ospf 1 area 0',
      'Router(config-if-range)# exit',
      'Router(config)# router ospf 1',
      'Router(config-router)# passive-interface g0/2',
    ] },
    { type: 'text', content: 'Beide Methoden führen zum gleichen Ergebnis: OSPF ist auf den gewünschten Interfaces aktiv. In der Prüfung musst du beide Varianten erkennen und konfigurieren können.' },
    { type: 'question', question: 'Welcher Befehl aktiviert OSPF direkt auf einem Interface?', options: ['router ospf 1', 'network 10.0.0.0 0.0.0.255 area 0', 'ip ospf 1 area 0', 'ip route ospf 1'], correct: 2, explanation: 'ip ospf <Prozess> area <Area> wird direkt im Interface-Kontext verwendet.' },
  ]));

  // ---------------------------------------------------------------------------
  // 5. Authentifizierung A - Null / Keine
  // ---------------------------------------------------------------------------
  exps.push(explanation('auth-null-classic', 'Authentifizierung Typ 0: Keine', 'classic', [
    { type: 'text', content: 'OSPF Typ 0 (Null Authentication) bedeutet, dass keine Authentifizierung verwendet wird. Die Router tauschen OSPF-Pakete ohne Prüfung eines Schlüssels aus. Das ist die Standardeinstellung, aber unsicher.' },
    { type: 'list', title: 'Beispiel: Network-Methode ohne Auth', items: [
      'Router(config)# router ospf 1',
      'Router(config-router)# network 10.0.0.4 0.0.0.3 area 0',
      'Router(config-router)# passive-interface g0/2',
    ] },
    { type: 'list', title: 'Beispiel: Interface-Methode ohne Auth', items: [
      'Router(config)# interface range g0/0-2',
      'Router(config-if-range)# ip ospf 1 area 0',
      'Router(config-if-range)# exit',
      'Router(config)# router ospf 1',
      'Router(config-router)# passive-interface g0/2',
    ] },
  ]));

  // ---------------------------------------------------------------------------
  // 6. Authentifizierung B - Klartext
  // ---------------------------------------------------------------------------
  exps.push(explanation('auth-clear-classic', 'Authentifizierung Typ 1: Klartext', 'classic', [
    { type: 'text', content: 'OSPF Typ 1 (Clear-Text Authentication) sendet den Authentifizierungsschlüssel im Klartext mit. Sicherheitstechnisch schwach, aber prüfungsrelevant. Beide Nachbarn müssen denselben Authentifizierungstyp und denselben Schlüssel verwenden.' },
    { type: 'list', title: 'Variante 1: Area-basierte Klartext-Auth (Network-Methode)', items: [
      'Router(config)# router ospf 1',
      'Router(config-router)# network 10.0.0.4 0.0.0.3 area 0',
      'Router(config-router)# area 0 authentication',
    ] },
    { type: 'list', title: 'Dann auf den betroffenen Interfaces den Schlüssel setzen', items: [
      'Router(config)# interface g0/0',
      'Router(config-if)# ip ospf authentication-key ospfkey',
    ] },
    { type: 'list', title: 'Variante 2: Interface-basierte Klartext-Auth', items: [
      'Router(config)# interface g0/0',
      'Router(config-if)# ip ospf 1 area 0',
      'Router(config-if)# ip ospf authentication',
      'Router(config-if)# ip ospf authentication-key ospfkey',
    ] },
    { type: 'question', question: 'Was muss bei Klartext-Authentifizierung auf beiden OSPF-Nachbarn identisch sein?', options: ['Nur die Prozessnummer', 'Authentifizierungstyp und Schlüssel', 'Nur die Area', 'Nur der Hostname'], correct: 1, explanation: 'Bei OSPF-Authentifizierung müssen beide Seiten denselben Typ und denselben Schlüssel verwenden, sonst entsteht keine Nachbarschaft.' },
  ]));

  // ---------------------------------------------------------------------------
  // 7. Authentifizierung C - MD5
  // ---------------------------------------------------------------------------
  exps.push(explanation('auth-md5-classic', 'Authentifizierung Typ 2: MD5 / message-digest', 'classic', [
    { type: 'text', content: 'OSPF Typ 2 (Message-Digest Authentication) verwendet MD5, um den Schlüssel nicht im Klartext zu übertragen. Auf Cisco-Geräten heißt die Konfiguration ip ospf authentication message-digest plus ip ospf message-digest-key 1 md5 <KEY>.' },
    { type: 'list', title: 'Variante 1: Area-basierte MD5-Auth (Network-Methode)', items: [
      'Router(config)# router ospf 1',
      'Router(config-router)# network 10.0.0.4 0.0.0.3 area 0',
      'Router(config-router)# area 0 authentication message-digest',
    ] },
    { type: 'list', title: 'Dann auf den Interfaces den MD5-Schlüssel setzen', items: [
      'Router(config)# interface g0/0',
      'Router(config-if)# ip ospf message-digest-key 1 md5 ospfkey',
    ] },
    { type: 'list', title: 'Variante 2: Interface-basierte MD5-Auth', items: [
      'Router(config)# interface g0/0',
      'Router(config-if)# ip ospf 1 area 0',
      'Router(config-if)# ip ospf authentication message-digest',
      'Router(config-if)# ip ospf message-digest-key 1 md5 ospfkey',
    ] },
    { type: 'question', question: 'Welcher Befehl aktiviert MD5-Authentifizierung auf einer OSPF-Area?', options: ['area 0 authentication', 'area 0 authentication message-digest', 'ip ospf authentication', 'ip ospf authentication-key'], correct: 1, explanation: 'area 0 authentication message-digest aktiviert MD5 auf Area-Ebene. Anschließend muss auf den Interfaces der message-digest-key gesetzt werden.' },
  ]));

  // ---------------------------------------------------------------------------
  // 8. Passive Interface
  // ---------------------------------------------------------------------------
  exps.push(explanation('passive-classic', 'passive-interface', 'classic', [
    { type: 'text', content: 'Ein passive-interface bewirbt ein Netz weiterhin über OSPF, sendet aber keine OSPF-Hello-Pakete auf diesem Interface. Damit baut der Router dort keine Nachbarschaft auf. Das ist sinnvoll für Client-Netze, in denen keine anderen OSPF-Router erwartet werden.' },
    { type: 'list', title: 'Beispiel', items: [
      'Router(config)# router ospf 1',
      'Router(config-router)# passive-interface g0/2',
    ] },
    { type: 'question', question: 'Warum setzt man ein Client-Interface auf passive?', options: ['Um OSPF komplett zu deaktivieren', 'Um unnötige OSPF-Nachbarschaften und Hello-Pakete zu vermeiden, das Netz aber weiter zu bewerben', 'Um die IP-Adresse zu löschen', 'Um das Interface herunterzufahren'], correct: 1, explanation: 'passive-interface beendet Hello-Pakete, bewirbt die Route aber weiterhin.' },
  ]));

  // ---------------------------------------------------------------------------
  // 9. Default Route in OSPF
  // ---------------------------------------------------------------------------
  exps.push(explanation('default-route-classic', 'Default Route über OSPF bekanntgeben', 'classic', [
    { type: 'text', content: 'Zuerst legst du eine statische Default Route an. Dann teilst du OSPF mit, diese Default Route in das Protokoll einzubinden, damit alle anderen OSPF-Router sie lernen.' },
    { type: 'list', title: 'Beispiel', items: [
      'Router(config)# ip route 0.0.0.0 0.0.0.0 10.11.12.14',
      'Router(config)# router ospf 1',
      'Router(config-router)# default-information originate',
    ] },
    { type: 'question', question: 'Welcher Befehl verteilt die statische Default Route über OSPF?', options: ['ip route 0.0.0.0 0.0.0.0', 'default-information originate', 'network 0.0.0.0 0.0.0.0 area 0', 'passive-interface default'], correct: 1, explanation: 'default-information originate im OSPF-Prozess bewirbt die Default Route an die Nachbarn.' },
  ]));

  // ---------------------------------------------------------------------------
  // 10. Verifizierung
  // ---------------------------------------------------------------------------
  exps.push(explanation('verify-classic', 'OSPF verifizieren', 'classic', [
    { type: 'text', content: 'Nach der Konfiguration musst du prüfen, ob OSPF wie erwartet funktioniert. Fehlende Nachbarn, falsche Areas oder Authentifizierungsfehler zeigen sich in den show-Befehlen.' },
    { type: 'table', headers: ['Befehl', 'Was erwartet man?', 'Was bedeutet es, wenn etwas fehlt?'], rows: [
      ['show ip ospf neighbor', 'Liste der OSPF-Nachbarn mit State FULL/2WAY', 'Keine Nachbarschaft: falsche Area, falsche Authentifizierung, OSPF nicht auf Interface aktiv oder Interface down.'],
      ['show ip route', 'OSPF-Routen mit "O" am Anfang', 'Keine "O"-Routen: OSPF hat keine gültigen Nachbarn oder keine passende Area.'],
      ['show ip protocols', 'Zeigt OSPF-Prozess, Router-ID, Netzwerke', 'OSPF-Prozess nicht sichtbar: router ospf wurde nicht konfiguriert.'],
      ['show ip ospf interface', 'Zeigt OSPF-Status pro Interface', 'Interface nicht gelistet: OSPF nicht auf diesem Interface aktiviert.'],
    ] },
    { type: 'question', question: 'Welcher Befehl zeigt OSPF-Nachbarn und deren Zustand?', options: ['show ip route', 'show ip ospf neighbor', 'show ip protocols', 'show ip interface brief'], correct: 1, explanation: 'show ip ospf neighbor listet alle OSPF-Nachbarn mit ihrem Zustand (z. B. FULL).' },
  ]));

  // ---------------------------------------------------------------------------
  // 11. Fehleranalyse
  // ---------------------------------------------------------------------------
  exps.push(explanation('troubleshooting-classic', 'Warum entsteht keine OSPF-Nachbarschaft?', 'classic', [
    { type: 'text', content: 'Wenn show ip ospf neighbor keine Einträge zeigt, prüfe systematisch die typischen Ursachen.' },
    { type: 'list', title: 'Häufige Fehlerursachen', items: [
      'Falsche Area auf einem oder beiden Seiten.',
      'Falscher oder fehlender Authentifizierungstyp / falscher Schlüssel.',
      'OSPF nicht auf dem Interface aktiviert (Network- oder Interface-Methode fehlt).',
      'Falsche Wildcard Mask in der Network-Anweisung.',
      'Interface ist administrativ down oder falsches Interface gewählt.',
      'passive-interface wurde versehentlich auf dem Verbindungsinterface gesetzt.',
    ] },
    { type: 'question', question: 'Beide Router sind per Kabel verbunden, aber show ip ospf neighbor bleibt leer. Was prüfst du zuerst?', options: ['Ob beide Interfaces up sind und OSPF in derselben Area aktiv ist', 'Ob der Switch-Port ein Access-Port ist', 'Ob das VLAN gelöscht wurde', 'Ob der Router eine Festplatte hat'], correct: 0, explanation: 'Eine OSPF-Nachbarschaft erfordert ein aktives Interface in derselben Area. Ohne diese Basis schlägt alles andere fehl.' },
  ]));

  // ---------------------------------------------------------------------------
  // 12. Zusammenfassung
  // ---------------------------------------------------------------------------
  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'OSPF ist ein link-state Protokoll mit Prozessnummer, Area 0 als Backbone und Nachbarschaften zwischen Routern.',
      'Network-Methode: router ospf 1 → network <Netz> <Wildcard> area 0.',
      'Interface-Methode: interface <Int> → ip ospf <Prozess> area 0.',
      'Authentifizierung: Typ 0 (keine), Typ 1 (Klartext), Typ 2 (MD5 / message-digest).',
      'passive-interface bewirbt ein Netz, sendet aber keine Hello-Pakete.',
      'Default Route: ip route 0.0.0.0 0.0.0.0 <Next-Hop>, dann default-information originate.',
      'Verifizierung: show ip ospf neighbor, show ip route, show ip protocols, show ip ospf interface.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'ospf-wildcard-select',
      type: 'select-best',
      question: 'Ein Interface hat die IP 10.0.0.6/30. Welche Network-Anweisung aktiviert OSPF korrekt auf diesem Interface?',
      options: [
        'network 10.0.0.6 0.0.0.3 area 0',
        'network 10.0.0.4 0.0.0.3 area 0',
        'network 10.0.0.0 0.0.0.255 area 0',
        'network 10.0.0.6 0.0.0.0 area 0',
      ],
      correct: 1,
      explanation: '/30 hat die Wildcard 0.0.0.3. Das Netz beginnt bei 10.0.0.4, da die IP 10.0.0.6 im Netz 10.0.0.4/30 liegt.',
    },
    {
      id: 'ospf-ordering-network',
      type: 'ordering',
      question: 'Bringe die Schritte zur Network-Methode mit passive-interface in die richtige Reihenfolge.',
      items: [
        { id: 'router', label: 'router ospf 1' },
        { id: 'network', label: 'network 10.0.0.4 0.0.0.3 area 0' },
        { id: 'passive', label: 'passive-interface g0/2' },
      ],
      correctOrder: ['router', 'network', 'passive'],
      explanation: 'Zuerst OSPF-Prozess öffnen, dann Network-Anweisung, zuletzt passive-interface.',
    },
    {
      id: 'ospf-ordering-interface',
      type: 'ordering',
      question: 'Bringe die Schritte zur Interface-Methode mit passive-interface in die richtige Reihenfolge.',
      items: [
        { id: 'range', label: 'interface range g0/0-2' },
        { id: 'ipospf', label: 'ip ospf 1 area 0' },
        { id: 'exit', label: 'exit' },
        { id: 'router', label: 'router ospf 1' },
        { id: 'passive', label: 'passive-interface g0/2' },
      ],
      correctOrder: ['range', 'ipospf', 'exit', 'router', 'passive'],
      explanation: 'Interface wählen, OSPF aktivieren, zurück, Prozess öffnen, passive-interface setzen.',
    },
    {
      id: 'ospf-auth-matching',
      type: 'matching',
      question: 'Ordne jeden Authentifizierungstyp der passenden Konfiguration zu.',
      pairs: [
        { left: 'Typ 0', leftLabel: 'Typ 0: Keine Auth', right: 'Keine Auth-Befehle' },
        { left: 'Typ 1', leftLabel: 'Typ 1: Klartext', right: 'ip ospf authentication-key <KEY>' },
        { left: 'Typ 2', leftLabel: 'Typ 2: MD5', right: 'ip ospf message-digest-key 1 md5 <KEY>' },
      ],
      explanation: 'Typ 0 = keine, Typ 1 = authentication-key, Typ 2 = message-digest-key.',
    },
    {
      id: 'ospf-default-route-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte zur Default-Route-Verteilung in OSPF in die richtige Reihenfolge.',
      items: [
        { id: 'iproute', label: 'ip route 0.0.0.0 0.0.0.0 10.11.12.14' },
        { id: 'router', label: 'router ospf 1' },
        { id: 'default', label: 'default-information originate' },
      ],
      correctOrder: ['iproute', 'router', 'default'],
      explanation: 'Zuerst die statische Default Route anlegen, dann OSPF-Prozess, dann default-information originate.',
    },
    {
      id: 'ospf-cli-network',
      type: 'cli-input',
      question: 'Aktiviere OSPF Prozess 1 auf dem Interface g0/0 (IP 10.0.0.5/30) mit der Network-Methode in Area 0.',
      hint: 'Verwende das passende Netz und die passende Wildcard-Maske für /30.',
      expectedLines: [
        'router ospf 1',
        'network 10.0.0.4 0.0.0.3 area 0',
      ],
      explanation: '/30 → Wildcard 0.0.0.3. Netzbeginn für 10.0.0.5/30 ist 10.0.0.4.',
    },
    {
      id: 'ospf-cli-interface',
      type: 'cli-input',
      question: 'Aktiviere OSPF Prozess 1 auf den Interfaces g0/0 bis g0/1 mit der Interface-Methode in Area 0.',
      expectedLines: [
        'interface range g0/0-1',
        'ip ospf 1 area 0',
      ],
      explanation: 'interface range ermöglicht die Konfiguration mehrerer Interfaces gleichzeitig.',
    },
    {
      id: 'ospf-cli-passive',
      type: 'cli-input',
      question: 'Setze g0/2 im OSPF-Prozess 1 auf passive.',
      expectedLines: [
        'router ospf 1',
        'passive-interface g0/2',
      ],
      explanation: 'passive-interface wird im OSPF-Prozesskonfigurationsmodus gesetzt.',
    },
    {
      id: 'ospf-cli-md5-area',
      type: 'cli-input',
      question: 'Konfiguriere auf dem Interface g0/0 die area-basierte MD5-Authentifizierung. Der OSPF-Prozess 1 soll in Area 0 laufen und der Schlüssel lautet ospfkey.',
      hint: 'Aktiviere OSPF im Prozess, aktiviere area 0 authentication message-digest und setze den Schlüssel auf g0/0.',
      expectedLines: [
        'router ospf 1',
        'network 10.0.0.0 0.0.0.255 area 0',
        'area 0 authentication message-digest',
        'interface g0/0',
        'ip ospf message-digest-key 1 md5 ospfkey',
      ],
      explanation: 'Area-basierte MD5-Auth: area 0 authentication message-digest im Prozess, message-digest-key auf dem Interface.',
    },
    {
      id: 'ospf-trouble-select',
      type: 'select-best',
      question: 'show ip ospf neighbor zeigt keine Einträge. Beide Interfaces sind up und im selben Subnetz. Was ist die wahrscheinlichste Ursache?',
      options: [
        'OSPF wurde auf keinem der beiden Interfaces aktiviert oder die Area/Authentifizierung stimmt nicht überein',
        'Das VLAN ist nicht konfiguriert',
        'Der Switch ist ausgeschaltet',
        'Die IP-Adresse ist zu groß',
      ],
      correct: 0,
      explanation: 'Ohne OSPF-Aktivierung oder bei unterschiedlicher Area/Auth entsteht keine Nachbarschaft, auch wenn Layer 1/2 funktionieren.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Welches Feld in der Network-Anweisung legt fest, welche Interface-IPs passen?', options: ['Area', 'Prozessnummer', 'Wildcard Mask', 'Passives Interface'], correct: 2, explanation: 'Die Wildcard Mask bestimmt, welche Bits der Interface-IP zur Auswahl herangezogen werden.' },
    { question: 'Welcher Befehl aktiviert OSPF direkt im Interface-Kontext?', options: ['router ospf 1', 'network 10.0.0.0 0.0.0.255 area 0', 'ip ospf 1 area 0', 'ip route ospf 1'], correct: 2, explanation: 'ip ospf <Prozess> area <Area> wird direkt im Interface-Kontext verwendet.' },
    { question: 'Welcher Authentifizierungstyp wird mit area 0 authentication message-digest aktiviert?', options: ['Typ 0', 'Typ 1', 'Typ 2', 'Typ 3'], correct: 2, explanation: 'message-digest entspricht OSPF Typ 2 (MD5).' },
    { question: 'Was bewirkt passive-interface g0/2?', options: ['OSPF wird auf g0/2 deaktiviert', 'OSPF bewirbt das Netz, sendet aber keine Hello-Pakete auf g0/2', 'g0/2 wird heruntergefahren', 'g0/2 wird zur Backbone-Area'], correct: 1, explanation: 'passive-interface verhindert Nachbarschaften, bewirbt die Route aber weiter.' },
    { question: 'Wie wird eine Default Route über OSPF verteilt?', options: ['network 0.0.0.0 0.0.0.0 area 0', 'default-information originate', 'passive-interface default', 'ip route 0.0.0.0 0.0.0.0'], correct: 1, explanation: 'default-information originate bewirbt die statische Default Route in OSPF.' },
    { question: 'Welcher show-Befehl zeigt OSPF-Nachbarn?', options: ['show ip route', 'show ip ospf neighbor', 'show ip protocols', 'show ip interface brief'], correct: 1, explanation: 'show ip ospf neighbor listet die Nachbarn und deren Zustand.' },
    { question: 'Welche Wildcard Mask gehört zu 255.255.255.252?', options: ['0.0.0.3', '0.0.0.255', '0.0.3.255', '255.255.255.0'], correct: 0, explanation: '/30 → Wildcard 0.0.0.3.' },
    { question: 'Bei welchem Authentifizierungstyp wird der Schlüssel im Klartext übertragen?', options: ['Typ 0', 'Typ 1', 'Typ 2', 'Keiner'], correct: 1, explanation: 'Typ 1 (Clear-Text) überträgt den Schlüssel unverschlüsselt.' },
    { question: 'Was muss bei MD5-Authentifizierung auf dem Interface konfiguriert werden?', options: ['ip ospf authentication-key', 'ip ospf message-digest-key 1 md5 <KEY>', 'area 0 authentication', 'Keine Interface-Konfiguration'], correct: 1, explanation: 'Bei MD5 wird ip ospf message-digest-key mit Schlüsselnummer und md5 auf dem Interface gesetzt.' },
    { question: 'Warum entsteht keine OSPF-Nachbarschaft, wenn ein Router Area 0 und der andere Area 1 verwendet?', options: ['Weil die IP-Adressen falsch sind', 'Weil OSPF-Nachbarn in derselben Area auf dem Verbindungsinterface sein müssen', 'Weil das Kabel defekt ist', 'Weil passive-interface aktiv ist'], correct: 1, explanation: 'OSPF-Nachbarn müssen auf dem gemeinsamen Interface in derselben Area sein.' },
    { question: 'Welcher Buchstabe kennzeichnet OSPF-Routen in show ip route?', options: ['C', 'S', 'O', 'D'], correct: 2, explanation: 'In der Routing-Tabelle steht "O" für OSPF, "C" für Connected, "S" für Static.' },
    { question: 'Welche Aussage beschreibt die Network-Methode korrekt?', options: ['OSPF wird auf jedem Interface manuell aktiviert', 'OSPF wählt Interfaces anhand ihrer IP und der Wildcard Mask aus', 'OSPF wird nur auf Loopbacks aktiviert', 'OSPF erfordert keine Area-Angabe'], correct: 1, explanation: 'Die Network-Methode aktiviert OSPF auf allen Interfaces, deren IP in den Wildcard-Bereich fällt.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Aktiviere OSPF Prozess 1 auf g0/0 mit der Interface-Methode in Area 0."',
      expectedLines: [
        'interface g0/0',
        'ip ospf 1 area 0',
      ],
      explanation: 'ip ospf <Prozess> area <Area> direkt im Interface-Kontext.',
    },
    {
      prompt: 'Sam: "Aktiviere OSPF Prozess 1 auf g0/0 und g0/1 mit der Network-Methode in Area 0. g0/0 hat 10.0.0.5/30, g0/1 hat 10.0.1.1/24."',
      expectedLines: [
        'router ospf 1',
        'network 10.0.0.4 0.0.0.3 area 0',
        'network 10.0.1.0 0.0.0.255 area 0',
      ],
      explanation: 'Netzwerk und Wildcard Mask pro Interface bestimmen, welche Interfaces OSPF sprechen.',
    },
    {
      prompt: 'Sam: "Setze g0/2 im OSPF-Prozess 1 auf passive."',
      expectedLines: [
        'router ospf 1',
        'passive-interface g0/2',
      ],
      explanation: 'passive-interface wird im OSPF-Router-Kontext gesetzt.',
    },
    {
      prompt: 'Sam: "Konfiguriere auf g0/0 die interface-basierte Klartext-Authentifizierung mit dem Schlüssel ospfkey. OSPF-Prozess 1, Area 0."',
      expectedLines: [
        'interface g0/0',
        'ip ospf 1 area 0',
        'ip ospf authentication',
        'ip ospf authentication-key ospfkey',
      ],
      explanation: 'Interface-basierte Klartext-Auth: ip ospf authentication + ip ospf authentication-key.',
    },
    {
      prompt: 'Sam: "Konfiguriere auf g0/0 die interface-basierte MD5-Authentifizierung mit Schlüsselnummer 1 und Schlüssel ospfkey."',
      expectedLines: [
        'interface g0/0',
        'ip ospf 1 area 0',
        'ip ospf authentication message-digest',
        'ip ospf message-digest-key 1 md5 ospfkey',
      ],
      explanation: 'Interface-basierte MD5-Auth: ip ospf authentication message-digest + ip ospf message-digest-key.',
    },
    {
      prompt: 'Sam: "Verteile die Default Route 0.0.0.0/0 über Next-Hop 10.11.12.14 über OSPF."',
      expectedLines: [
        'ip route 0.0.0.0 0.0.0.0 10.11.12.14',
        'router ospf 1',
        'default-information originate',
      ],
      explanation: 'Zuerst statische Default Route, dann default-information originate im OSPF-Prozess.',
    },
    {
      prompt: 'Sam: "Zeige mir die OSPF-Nachbarn an."',
      expectedLines: [['show ip ospf neighbor', 'sh ip ospf neighbor']],
      explanation: 'show ip ospf neighbor zeigt alle OSPF-Nachbarn und deren Zustand.',
    },
  ];
}

export function buildCiscoOspfLesson() {
  return {
    title: 'OSPF',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
    summary: [
      'OSPF ist ein link-state Protokoll mit Prozessnummer, Area 0 und Nachbarschaften.',
      'Network-Methode: router ospf 1 → network <Netz> <Wildcard> area 0.',
      'Interface-Methode: interface <Int> → ip ospf <Prozess> area 0.',
      'Authentifizierung: Typ 0 (keine), Typ 1 (Klartext), Typ 2 (MD5 / message-digest).',
      'passive-interface bewirbt ein Netz, sendet aber keine Hello-Pakete.',
      'Default Route: ip route 0.0.0.0 0.0.0.0 <Next-Hop>, dann default-information originate.',
      'Verifizierung: show ip ospf neighbor, show ip route, show ip protocols, show ip ospf interface.',
    ],
  };
}
