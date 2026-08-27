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

const OSPF_NEIGHBOR_SVG = `<svg viewBox="0 0 320 160" class="w-full h-auto max-h-48" xmlns="http://www.w3.org/2000/svg"><text x="160" y="18" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">OSPF Nachbarschaft</text><rect x="20" y="50" width="70" height="45" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="55" y="72" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">R1</text><text x="55" y="88" text-anchor="middle" fill="#8b949e" font-size="7">Area 0</text><rect x="230" y="50" width="70" height="45" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="265" y="72" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">R2</text><text x="265" y="88" text-anchor="middle" fill="#8b949e" font-size="7">Area 0</text><line x1="90" y1="72" x2="230" y2="72" stroke="#00f0ff" stroke-width="2"/><polygon points="140,68 140,76 150,72" fill="#00f0ff"/><polygon points="180,76 180,68 170,72" fill="#00f0ff"/><text x="160" y="62" text-anchor="middle" fill="#8b949e" font-size="7">Hello-Pakete</text><rect x="115" y="110" width="90" height="28" rx="4" fill="#00f0ff" opacity="0.9"/><text x="160" y="124" text-anchor="middle" fill="#0a1628" font-size="8" font-weight="bold">State FULL</text><text x="160" y="138" text-anchor="middle" fill="#8b949e" font-size="7">10.0.0.0/30</text></svg>`;

const OSPF_AREA_SVG = `<svg viewBox="0 0 320 220" class="w-full h-auto max-h-56" xmlns="http://www.w3.org/2000/svg"><text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Single-Area OSPF: Area 0 (Backbone)</text><ellipse cx="160" cy="115" rx="120" ry="80" fill="#00f0ff" opacity="0.15" stroke="#00f0ff" stroke-width="2"/><text x="160" y="120" text-anchor="middle" fill="#00f0ff" font-size="14" font-weight="bold" opacity="0.4">Area 0</text><rect x="80" y="60" width="60" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="110" y="80" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">R1</text><rect x="200" y="60" width="60" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="230" y="80" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">R2</text><rect x="130" y="150" width="60" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="160" y="170" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">R3</text><line x1="140" y1="78" x2="200" y2="78" stroke="#00f0ff" stroke-width="2"/><line x1="110" y1="95" x2="150" y2="150" stroke="#00f0ff" stroke-width="2"/><line x1="210" y1="95" x2="170" y2="150" stroke="#00f0ff" stroke-width="2"/><text x="160" y="205" text-anchor="middle" fill="#8b949e" font-size="8">Alle Interfaces gehören zur Area 0</text></svg>`;

const OSPF_PASSIVE_SVG = `<svg viewBox="0 0 320 180" class="w-full h-auto max-h-52" xmlns="http://www.w3.org/2000/svg"><text x="160" y="18" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">passive-interface</text><rect x="120" y="45" width="80" height="45" rx="5" fill="#00f0ff" opacity="0.9"/><text x="160" y="65" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">Router</text><text x="160" y="80" text-anchor="middle" fill="#0a1628" font-size="7">g0/2 passive</text><rect x="20" y="105" width="90" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="65" y="122" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Client LAN</text><line x1="120" y1="90" x2="80" y2="105" stroke="#ff7b72" stroke-width="2" stroke-dasharray="5,3"/><text x="95" y="100" text-anchor="middle" fill="#ff7b72" font-size="7">keine Hellos</text><rect x="210" y="105" width="90" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="255" y="122" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">R2</text><line x1="200" y1="90" x2="240" y2="105" stroke="#00f0ff" stroke-width="2"/><polygon points="215,98 223,98 219,104" fill="#00f0ff"/><text x="220" y="95" text-anchor="middle" fill="#8b949e" font-size="7">Hellos</text><text x="160" y="160" text-anchor="middle" fill="#c9d1d9" font-size="8">Netz weiter beworben, aber keine OSPF-Nachbarschaft</text></svg>`;

const OSPF_WILDCARD_SVG = `<svg viewBox="0 0 340 150" class="w-full h-auto max-h-44" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Wildcard: 0 = prüfen, 1 = ignorieren</text><text x="170" y="45" text-anchor="middle" fill="#8b949e" font-size="10">Subnetzmaske 255.255.255.0 → Wildcard 0.0.0.255</text><rect x="40" y="65" width="260" height="30" rx="4" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="170" y="85" text-anchor="middle" fill="#c9d1d9" font-size="9" font-family="monospace">network 10.0.1.0 0.0.0.255 area 0</text><text x="170" y="115" text-anchor="middle" fill="#c9d1d9" font-size="9">alle IPs von 10.0.1.0 bis 10.0.1.255 passen</text><text x="170" y="135" text-anchor="middle" fill="#8b949e" font-size="8">z. B. 10.0.1.1/24, 10.0.1.254/24</text></svg>`;

const OSPF_COST_SVG = `<svg viewBox="0 0 340 200" class="w-full h-auto max-h-52" xmlns="http://www.w3.org/2000/svg"><text x="170" y="18" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">OSPF Cost: niedriger = besser</text><rect x="20" y="70" width="60" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="50" y="88" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">R1</text><rect x="260" y="70" width="60" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="290" y="88" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">R2</text><path d="M 80 88 Q 130 60 170 88 T 260 88" stroke="#ff7b72" stroke-width="2" fill="none"/><path d="M 80 88 Q 130 130 170 110 T 260 88" stroke="#00f0ff" stroke-width="2" fill="none"/><text x="170" y="60" text-anchor="middle" fill="#ff7b72" font-size="8">oben: Cost 100</text><text x="170" y="135" text-anchor="middle" fill="#00f0ff" font-size="8">unten: Cost 10 + 10 = 20</text><text x="170" y="165" text-anchor="middle" fill="#c9d1d9" font-size="9">OSPF wählt den unteren Pfad (geringere Gesamtkosten)</text></svg>`;

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

  exps.push(explanation('intro-visual', 'OSPF Single-Area', 'visual', [
    { type: 'diagram', content: OSPF_AREA_SVG },
    { type: 'text', content: 'Im Single-Area-Modell gehören alle Router und ihre Interfaces zu einer einzigen OSPF-Area - typischerweise Area 0. Multi-Area-Designs werden später ergänzend behandelt.' },
  ]));

  exps.push(explanation('neighbor-visual', 'OSPF Nachbarschaft', 'visual', [
    { type: 'diagram', content: OSPF_NEIGHBOR_SVG },
    { type: 'text', content: 'Router tauschen Hello-Pakete aus. Stimmen Area und ggf. Authentifizierung überein, entsteht eine Nachbarschaft; der stabile Zustand heißt meist FULL.' },
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

  exps.push(explanation('wildcard-visual', 'Wildcard-Maske im Network-Befehl', 'visual', [
    { type: 'diagram', content: OSPF_WILDCARD_SVG },
    { type: 'text', content: 'Eine 0 in der Wildcard bedeutet „dieses Bit muss übereinstimmen“, eine 255 bedeutet „egal“. Darum wählt "network 10.0.1.0 0.0.0.255 area 0" alle Interfaces aus, deren IP in 10.0.1.0/24 liegt.' },
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

  exps.push(explanation('passive-visual', 'passive-interface im Überblick', 'visual', [
    { type: 'diagram', content: OSPF_PASSIVE_SVG },
    { type: 'text', content: 'Ein passive-interface sendet keine OSPF-Hello-Pakete und baut keine Nachbarschaft auf. Das angehängte Netz wird weiterhin über OSPF bekannt gemacht.' },
  ]));

  // ---------------------------------------------------------------------------
  // 9. OSPF Cost
  // ---------------------------------------------------------------------------
  exps.push(explanation('cost-classic', 'OSPF Cost & günstigster Pfad', 'classic', [
    { type: 'text', content: 'OSPF berechnet die Kosten eines Pfades aus den Kosten der einzelnen Links. Höhere Bandbreite bedeutet niedrigere Kosten. Der Pfad mit den niedrigsten Gesamtkosten wird in die Routing-Tabelle übernommen. Sind mehrere Pfade gleich günstig, kann OSPF sie im Rahmen von Equal-Cost Multipath (ECMP) parallel nutzen.' },
    { type: 'text', content: 'Die klassische Cisco-Default-Formel ist: Cost = Reference-Bandwidth / Interface-Bandwidth. In modernen Netzen muss die Referenzbandbreite häufig angepasst werden, damit schnelle Links auch wirklich niedrige Kosten erhalten. Für den Unterricht reicht zunächst das Prinzip: niedrigere Gesamtkosten = bevorzugter Pfad.' },
  ]));

  exps.push(explanation('cost-visual', 'OSPF Cost im Vergleich', 'visual', [
    { type: 'diagram', content: OSPF_COST_SVG },
    { type: 'text', content: 'Zwei Pfade zum Ziel: der obere Link hat hohe Kosten (z. B. langsame Leitung), der untere Pfad über zwei schnelle Links hat niedrigere Gesamtkosten. OSPF wählt den günstigeren Pfad.' },
  ]));

  // ---------------------------------------------------------------------------
  // 10. Default Route in OSPF
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
      ['show ip route', 'Alle Routen, darunter OSPF-Routen mit "O" am Anfang', 'Keine "O"-Routen: OSPF hat keine gültigen Nachbarn oder keine passende Area.'],
      ['show ip route ospf', 'Nur die über OSPF gelernten Routen', 'Keine Einträge: OSPF hat keine Routen gelernt oder der Prozess funktioniert nicht wie erwartet.'],
      ['show ip protocols', 'Zeigt OSPF-Prozess, Router-ID, Netzwerke', 'OSPF-Prozess nicht sichtbar: router ospf wurde nicht konfiguriert.'],
      ['show ip ospf interface', 'Zeigt OSPF-Status pro Interface', 'Interface nicht gelistet: OSPF nicht auf diesem Interface aktiviert.'],
      ['show running-config', 'Zeigt die konfigurierten Befehle', 'Konfiguration fehlt oder ist falsch - aber configured ≠ functioning.'],
      ['clear ip ospf process', 'Setzt den OSPF-Prozess neu, ändert aber keine Konfiguration', 'Nützlich zum Neustart der Nachbarschaften nach Konfigurationsänderungen, nicht zum Beheben von Syntaxfehlern.'],
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
      'Die Process-ID ist lokal und muss nicht auf allen Nachbarn identisch sein; Area und Authentifizierung müssen jedoch übereinstimmen.',
      'Authentifizierung: Typ 0 (keine), Typ 1 (Klartext), Typ 2 (MD5 / message-digest).',
      'passive-interface bewirbt ein Netz, sendet aber keine Hello-Pakete - es verschwindet nicht automatisch aus OSPF.',
      'passive-interface default gefolgt von no passive-interface ist eine sichere Admin-Routine.',
      'Default Route: ip route 0.0.0.0 0.0.0.0 <Next-Hop>, dann default-information originate (verteilt eine vorhandene statische Default Route).',
      'OSPF Cost: niedrigere Gesamtkosten = bevorzugter Pfad; bei gleichen Kosten ist ECMP möglich.',
      'Verifizierung: show ip ospf neighbor, show ip route, show ip route ospf, show ip protocols, show ip ospf interface, show running-config.',
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
    {
      id: 'ospf-process-id-select',
      type: 'select-best',
      question: 'Router A verwendet "router ospf 1", Router B verwendet "router ospf 10". Können sie trotzdem OSPF-Nachbarn werden?',
      options: ['Nein, die Process-IDs müssen identisch sein', 'Ja, die Process-ID ist lokal und muss nicht übereinstimmen; Area und Authentifizierung müssen passen', 'Nur, wenn beide Area 0 nutzen', 'Nur, wenn beide keine Authentifizierung verwenden'],
      correct: 1,
      explanation: 'Die OSPF-Prozess-ID ist nur lokal relevant. Nachbarschaften bilden sich über Area, Subnetz, Authentifizierung etc.',
    },
    {
      id: 'ospf-full-but-route-select',
      type: 'select-best',
      question: 'show ip ospf neighbor zeigt FULL, aber das Netz 192.168.50.0/24 ist trotzdem nicht in der Routingtabelle. Was prüfst du zuerst?',
      options: ['Ob das Zielnetz überhaupt in OSPF aktiviert ist (network/Wildcard korrekt)', 'Ob das Kabel defekt ist', 'Ob der Router neu gestartet werden muss', 'Ob das Interface administrativ down ist'],
      correct: 0,
      explanation: 'Neighbor FULL heißt, die Adjacency funktioniert. Damit eine Route gelernt wird, muss das Zielnetz beim Nachbarn auch korrekt in OSPF aktiviert sein.',
    },
    {
      id: 'ospf-passive-default-select',
      type: 'select-best',
      question: 'Was bewirkt die Kombination "passive-interface default" gefolgt von "no passive-interface g0/0" in OSPF?',
      options: ['Alle Interfaces außer g0/0 senden weiterhin Hello-Pakete', 'Alle Interfaces sind passiv, nur g0/0 darf Nachbarschaften aufbauen', 'g0/0 ist passiv und alle anderen Interfaces aktiv', 'OSPF wird auf allen Interfaces deaktiviert'],
      correct: 1,
      explanation: 'passive-interface default macht zunächst alle Interfaces passiv; no passive-interface hebt dies für ausgewählte Interfaces wieder auf.',
    },
    {
      id: 'ospf-cost-select',
      type: 'select-best',
      question: 'Zwei Pfade führen zum Ziel. Pfad A hat Gesamtkosten 10, Pfad B Gesamtkosten 100. Was tut OSPF?',
      options: ['Nimmt beide gleichzeitig (ECMP)', 'Nimmt Pfad A, weil er niedrigere Kosten hat', 'Nimmt Pfad B, weil er höhere Kosten hat', 'Verwirft beide Pfade, weil die Kosten unterschiedlich sind'],
      correct: 1,
      explanation: 'OSPF wählt den Pfad mit den niedrigsten Gesamtkosten. ECMP greift nur bei gleichen Kosten.',
    },
    {
      id: 'ospf-default-originate-select',
      type: 'select-best',
      question: 'Welche Voraussetzung gibt es für "default-information originate"?',
      options: ['Es erstellt automatisch eine statische Default Route', 'Es verteilt eine bereits vorhandene statische Default Route über OSPF', 'Es funktioniert nur in Area 0', 'Es setzt passive-interface voraus'],
      correct: 1,
      explanation: '"default-information originate" bewirbt eine vorhandene Default Route in OSPF. Die Route muss zuvor eingegeben werden (z. B. ip route 0.0.0.0 0.0.0.0 <next-hop>).',
    },
    {
      id: 'ospf-show-route-ospf-select',
      type: 'select-best',
      question: 'Welcher Befehl zeigt ausschließlich die über OSPF gelernten Routen?',
      options: ['show ip route', 'show ip route ospf', 'show ip ospf neighbor', 'show ip protocols'],
      correct: 1,
      explanation: '"show ip route ospf" filtert die Routingtabelle auf OSPF-Routen.',
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
    {
      prompt: 'Sam: "Zeige mir nur die OSPF-Routen aus der Routingtabelle an."',
      expectedLines: [['show ip route ospf', 'sh ip route ospf']],
      explanation: '"show ip route ospf" filtert die Routingtabelle auf über OSPF gelernte Routen.',
    },
    {
      prompt: 'Sam: "Prüfe, auf welchen Interfaces OSPF Prozess 1 Area 0 aktiv ist."',
      expectedLines: [['show ip ospf interface', 'sh ip ospf interface']],
      explanation: '"show ip ospf interface" listet pro Interface den OSPF-Status.',
    },
    {
      prompt: 'Sam: "Zeige mir den OSPF-Prozess, die Router-ID und die konfigurierten Netzwerke an."',
      expectedLines: [['show ip protocols', 'sh ip protocols']],
      explanation: '"show ip protocols" zeigt die laufenden Routing-Protokolle inklusive OSPF.',
    },
    {
      prompt: 'Sam: "Starte den OSPF-Prozess neu, damit geänderte Einstellungen wirksam werden."',
      expectedLines: [['clear ip ospf process', 'clear ip ospf process *']],
      explanation: '"clear ip ospf process" startet den OSPF-Prozess neu. Er ändert keine Konfiguration, sondern baut Nachbarschaften neu auf.',
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
