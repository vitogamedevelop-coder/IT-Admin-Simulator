import { topicKey } from '../academyTopics.js';

// =============================================================================
// "NAT" - fills the catalog's `cisco-packet-tracer/nat` slot.
// Builds directly on ACL knowledge (ACLs select inside sources for dynamic NAT/PAT).
// Covers static NAT, dynamic NAT, PAT/NAT overload, port forwarding, translation
// table analysis, verification and troubleshooting.
// All content is data-driven for later reuse (e.g. the planned Cisco exam routine).
// =============================================================================

export const CISCO_NAT_TOPIC_KEY = topicKey('cisco-packet-tracer', 'nat');

const NAT_TERMS_SVG = `<svg viewBox="0 0 340 200" class="w-full h-auto max-h-52" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Inside Local → Inside Global</text><rect x="20" y="70" width="90" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="65" y="90" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Client</text><text x="65" y="105" text-anchor="middle" fill="#c9d1d9" font-size="8" font-family="monospace">192.168.10.10</text><rect x="135" y="60" width="70" height="60" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="85" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">NAT</text><text x="170" y="100" text-anchor="middle" fill="#0a1628" font-size="7">Router</text><text x="170" y="113" text-anchor="middle" fill="#0a1628" font-size="7">inside/outside</text><rect x="230" y="70" width="90" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="275" y="90" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Internet</text><text x="275" y="105" text-anchor="middle" fill="#c9d1d9" font-size="8" font-family="monospace">203.0.113.10</text><line x1="110" y1="85" x2="135" y2="85" stroke="#00f0ff" stroke-width="2"/><polygon points="125,80 125,90 135,85" fill="#00f0ff"/><line x1="205" y1="85" x2="230" y2="85" stroke="#00f0ff" stroke-width="2"/><polygon points="220,80 220,90 230,85" fill="#00f0ff"/><text x="65" y="135" text-anchor="middle" fill="#8b949e" font-size="7">Inside Local</text><text x="275" y="135" text-anchor="middle" fill="#8b949e" font-size="7">Inside Global</text><rect x="70" y="150" width="200" height="35" rx="4" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="170" y="164" text-anchor="middle" fill="#c9d1d9" font-size="8">Outside Local / Outside Global meist identisch</text><text x="170" y="178" text-anchor="middle" fill="#c9d1d9" font-size="8">(externer Server 198.51.100.20)</text></svg>`;

const NAT_PAT_SVG = `<svg viewBox="0 0 340 240" class="w-full h-auto max-h-60" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">PAT: viele private Hosts → eine öffentliche IP</text><rect x="20" y="50" width="80" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="60" y="65" text-anchor="middle" fill="#c9d1d9" font-size="7" font-weight="bold">192.168.1.10</text><text x="60" y="76" text-anchor="middle" fill="#c9d1d9" font-size="6">:49152</text><rect x="20" y="90" width="80" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="60" y="105" text-anchor="middle" fill="#c9d1d9" font-size="7" font-weight="bold">192.168.1.11</text><text x="60" y="116" text-anchor="middle" fill="#c9d1d9" font-size="6">:49153</text><rect x="20" y="130" width="80" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="60" y="145" text-anchor="middle" fill="#c9d1d9" font-size="7" font-weight="bold">192.168.1.12</text><text x="60" y="156" text-anchor="middle" fill="#c9d1d9" font-size="6">:49154</text><rect x="130" y="90" width="80" height="60" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="115" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">PAT</text><text x="170" y="128" text-anchor="middle" fill="#0a1628" font-size="7">Translation</text><text x="170" y="141" text-anchor="middle" fill="#0a1628" font-size="7">Table</text><rect x="240" y="90" width="80" height="60" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="280" y="110" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Internet</text><text x="280" y="123" text-anchor="middle" fill="#c9d1d9" font-size="7">203.0.113.1</text><text x="280" y="136" text-anchor="middle" fill="#c9d1d9" font-size="7">:49152-49154</text><line x1="100" y1="65" x2="130" y2="100" stroke="#00f0ff" stroke-width="2"/><line x1="100" y1="105" x2="130" y2="115" stroke="#00f0ff" stroke-width="2"/><line x1="100" y1="145" x2="130" y2="130" stroke="#00f0ff" stroke-width="2"/><line x1="210" y1="120" x2="240" y2="120" stroke="#00f0ff" stroke-width="2"/><polygon points="230,115 230,125 240,120" fill="#00f0ff"/><text x="170" y="180" text-anchor="middle" fill="#c9d1d9" font-size="9">Jeder interne Host bekommt eigenen Source-Port</text><text x="170" y="195" text-anchor="middle" fill="#c9d1d9" font-size="9">auf der gemeinsamen öffentlichen IP</text></svg>`;

const NAT_PORT_FORWARD_SVG = `<svg viewBox="0 0 340 200" class="w-full h-auto max-h-52" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Port Forwarding: extern → intern</text><rect x="20" y="70" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="60" y="88" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Client</text><text x="60" y="102" text-anchor="middle" fill="#c9d1d9" font-size="7">203.0.113.1</text><rect x="135" y="60" width="70" height="60" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="85" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">NAT</text><text x="170" y="98" text-anchor="middle" fill="#0a1628" font-size="7">Router</text><text x="170" y="111" text-anchor="middle" fill="#0a1628" font-size="7">:8080</text><rect x="240" y="70" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="280" y="88" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Server</text><text x="280" y="102" text-anchor="middle" fill="#c9d1d9" font-size="7">192.168.10.20:80</text><line x1="100" y1="85" x2="135" y2="85" stroke="#00f0ff" stroke-width="2"/><polygon points="125,80 125,90 135,85" fill="#00f0ff"/><line x1="205" y1="85" x2="240" y2="85" stroke="#00f0ff" stroke-width="2"/><polygon points="230,80 230,90 240,85" fill="#00f0ff"/><text x="170" y="150" text-anchor="middle" fill="#ffcc00" font-size="9">extern 203.0.113.10:8080</text><text x="170" y="168" text-anchor="middle" fill="#ffcc00" font-size="9">↓</text><text x="170" y="186" text-anchor="middle" fill="#00f0ff" font-size="9">intern 192.168.10.20:80</text></svg>`;

const NAT_FLOW_SVG = `<svg viewBox="0 0 340 220" class="w-full h-auto max-h-56" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">NAT Paketfluss mit PAT</text><rect x="20" y="80" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="60" y="100" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Client</text><text x="60" y="114" text-anchor="middle" fill="#c9d1d9" font-size="7">192.168.10.10</text><rect x="130" y="70" width="80" height="60" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="90" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">NAT</text><text x="170" y="103" text-anchor="middle" fill="#0a1628" font-size="7">Router</text><text x="170" y="116" text-anchor="middle" fill="#0a1628" font-size="7">Translation Table</text><rect x="240" y="80" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="280" y="100" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Internet</text><text x="280" y="114" text-anchor="middle" fill="#c9d1d9" font-size="7">8.8.8.8</text><line x1="100" y1="95" x2="130" y2="95" stroke="#00f0ff" stroke-width="2"/><polygon points="120,90 120,100 130,95" fill="#00f0ff"/><text x="115" y="85" text-anchor="middle" fill="#8b949e" font-size="6">src 192.168.10.10</text><line x1="210" y1="95" x2="240" y2="95" stroke="#00f0ff" stroke-width="2"/><polygon points="230,90 230,100 240,95" fill="#00f0ff"/><text x="225" y="85" text-anchor="middle" fill="#8b949e" font-size="6">src 203.0.113.1</text><line x1="240" y1="125" x2="210" y2="125" stroke="#00f0ff" stroke-width="2"/><polygon points="220,120 220,130 210,125" fill="#00f0ff"/><text x="225" y="145" text-anchor="middle" fill="#8b949e" font-size="6">dst 203.0.113.1</text><line x1="130" y1="125" x2="100" y2="125" stroke="#00f0ff" stroke-width="2"/><polygon points="110,120 110,130 100,125" fill="#00f0ff"/><text x="115" y="145" text-anchor="middle" fill="#8b949e" font-size="6">dst 192.168.10.10</text><rect x="60" y="170" width="220" height="30" rx="4" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="170" y="190" text-anchor="middle" fill="#c9d1d9" font-size="9">Source-IP/Port werden übersetzt und in Translation Table gespeichert</text></svg>`;

const NAT_TYPES_SVG = `<svg viewBox="0 0 340 160" class="w-full h-auto max-h-44" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">NAT Varianten</text><rect x="20" y="50" width="95" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="67" y="68" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Static NAT</text><text x="67" y="82" text-anchor="middle" fill="#c9d1d9" font-size="7">1 private IP</text><text x="67" y="92" text-anchor="middle" fill="#c9d1d9" font-size="7">↔ 1 öffentliche IP</text><rect x="122" y="50" width="95" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="169" y="68" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Dynamic NAT</text><text x="169" y="82" text-anchor="middle" fill="#c9d1d9" font-size="7">n private IPs</text><text x="169" y="92" text-anchor="middle" fill="#c9d1d9" font-size="7">→ Pool mit m IPs</text><rect x="224" y="50" width="95" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="271" y="68" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">PAT</text><text x="271" y="82" text-anchor="middle" fill="#c9d1d9" font-size="7">n private IPs</text><text x="271" y="92" text-anchor="middle" fill="#c9d1d9" font-size="7">→ 1 öffentliche IP + Ports</text><rect x="20" y="110" width="300" height="35" rx="4" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="170" y="125" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Port Forwarding</text><text x="170" y="140" text-anchor="middle" fill="#c9d1d9" font-size="7">globaler IP:Port → interner Host:Port (für eingehende Dienste)</text></svg>`;

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

  exps.push(explanation('address-terms-visual', 'NAT-Adressbegriffe im Überblick', 'visual', [
    { type: 'diagram', content: NAT_TERMS_SVG },
    { type: 'text', content: 'Inside Local ist die private Adresse des internen Hosts, Inside Global ist die Adresse, unter der er nach außen erscheint. In einfachen Szenarien sind Outside Local und Outside Global identisch, wenn externe Adressen nicht übersetzt werden.' },
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

  exps.push(explanation('pat-visual', 'PAT Translation Table', 'visual', [
    { type: 'diagram', content: NAT_PAT_SVG },
    { type: 'text', content: 'PAT übersetzt viele private Hosts auf eine oder wenige öffentliche IP-Adressen. Damit der Router die Antworten richtig zurückverteilen kann, merkt er sich in der Translation Table die Source-IP und den Source-Port jedes internen Hosts.' },
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

  exps.push(explanation('port-forward-visual', 'Port Forwarding im Überblick', 'visual', [
    { type: 'diagram', content: NAT_PORT_FORWARD_SVG },
    { type: 'text', content: 'Port Forwarding leitet externe Anfragen auf einer globalen IP und einem Port an einen internen Host und dessen Port weiter. Dabei müssen externer und interner Port nicht identisch sein - im Beispiel wird extern 8080 auf intern 80 abgebildet.' },
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

  exps.push(explanation('packet-flow-visual', 'NAT Paketfluss mit PAT', 'visual', [
    { type: 'diagram', content: NAT_FLOW_SVG },
    { type: 'text', content: 'Ein interner Client sendet ein Paket an das Internet. Der NAT-Router übersetzt Source-IP und Source-Port und speichert die Zuordnung. Die Antwort wird anhand der Translation Table zurückübersetzt und an den Client weitergeleitet.' },
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

  exps.push(explanation('nat-types-visual', 'NAT Varianten im Vergleich', 'visual', [
    { type: 'diagram', content: NAT_TYPES_SVG },
    { type: 'text', content: 'Static NAT ist die 1:1-Zuordnung, Dynamic NAT verwendet einen Pool, PAT teilt sich globale Adressen über Ports. Port Forwarding erlaubt gezielt eingehende Verbindungen zu einem internen Dienst.' },
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
      startContext: 'Globaler Konfigurationsmodus',
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
      startContext: 'Globaler Konfigurationsmodus',
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
      startContext: 'Globaler Konfigurationsmodus',
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
      startContext: 'Globaler Konfigurationsmodus',
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
    {
      id: 'nat-acl-selection-select',
      type: 'select-best',
      question: 'Die NAT-ACL "access-list 1 permit 192.168.10.0 0.0.0.255" dient dazu...',
      options: ['den Traffic zu filtern und zu blockieren', 'auszuwählen, welche Inside-Local-Adressen von NAT übersetzt werden', 'das Outside-Interface zu kennzeichnen'],
      correct: 1,
      explanation: 'Die ACL bei NAT ist eine Auswahl-ACL. Sie entscheidet, welche Quell-IPs übersetzt werden - sie muss nicht zwingend als Paketfilter an ein Interface gebunden werden.',
    },
    {
      id: 'nat-inside-outside-swapped-select',
      type: 'select-best',
      question: 'Ein Router hat g0/0 (LAN) als "ip nat outside" und g0/1 (WAN) als "ip nat inside" markiert. Was ist die Folge?',
      options: ['NAT funktioniert wie erwartet', 'NAT funktioniert nicht, weil inside/outside vertauscht sind', 'PAT wird automatisch deaktiviert'],
      correct: 1,
      explanation: 'inside muss zur privaten Seite, outside zur öffentlichen Seite zeigen. Eine Vertauschung verhindert korrekte Übersetzungen.',
    },
    {
      id: 'nat-empty-translations-select',
      type: 'select-best',
      question: 'show ip nat translations bleibt leer, obwohl Clients surfen wollen. Was prüfst du zuerst?',
      options: ['Ob Traffic die Router-Interfaces überhaupt erreicht, ob ip nat inside/outside stimmt und die Auswahl-ACL die Clients matcht', 'Ob der externe Server online ist', 'Ob der Switch rebootet wurde'],
      correct: 0,
      explanation: 'Eine leere Translation Table deutet darauf hin, dass keine Pakete den NAT-Prozess erreichen - typisch: falsche inside/outside-Kennzeichnung oder ACL matcht die Quelle nicht.',
    },
    {
      id: 'nat-client-out-server-in-select',
      type: 'select-best',
      question: 'Clients können ins Internet surfen (PAT), aber ein interner Webserver ist von außen nicht erreichbar. Was fehlt typischerweise?',
      options: ['Overload', 'Port Forwarding für den gewünschten Dienst', 'Eine größere NAT-ACL'],
      correct: 1,
      explanation: 'PAT ermöglicht ausgehende Verbindungen. Für eingehende Verbindungen zu einem internen Server benötigt man typischerweise Port Forwarding.',
    },
    {
      id: 'nat-port-forward-access-blocked-select',
      type: 'select-best',
      question: 'Port Forwarding ist korrekt konfiguriert, aber externe Clients erreichen den internen Server nicht. Was könnte zusätzlich blockieren?',
      options: ['Eine ACL oder SPI-Regel auf dem externen Interface', 'Fehlendes overload', 'Falsche Default Route'], correct: 0,
      explanation: 'NAT macht den Server technisch erreichbar; ob Verkehr tatsächlich durchkommt, kann zusätzlich durch ACLs oder Stateful Inspection beeinflusst werden.',
    },
    {
      id: 'nat-clear-translations-select',
      type: 'select-best',
      question: 'Was bewirkt "clear ip nat translation *"?',
      options: ['Löscht alle dynamischen NAT-Übersetzungen', 'Löscht die NAT-Konfiguration', 'Startet den Router neu'],
      correct: 0,
      explanation: 'clear ip nat translation * entfernt dynamische Einträge in der Translation Table, nicht die Konfiguration selbst.',
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
    { question: 'Die NAT-ACL "access-list 1 permit 192.168.10.0 0.0.0.255" ist zur Auswahl gedacht. Muss sie mit ip access-group an ein Interface gebunden werden, damit NAT funktioniert?', options: ['Ja, immer', 'Nein, NAT nutzt die ACL intern zur Auswahl der zu übersetzenden Quellen', 'Nur bei PAT'], correct: 1, explanation: 'Die ACL bei NAT dient der Auswahl, nicht zwingend dem Paketfilter-Binding. ip access-group ist optional für den eigentlichen NAT-Prozess.' },
    { question: 'Welche Aussage über NAT und Sicherheit ist technisch am besten?', options: ['NAT ist eine Firewall', 'NAT verbirgt interne Adressen, ersetzt aber keine Firewall/ACL/SPI', 'NAT verschlüsselt den Verkehr'], correct: 1, explanation: 'NAT ändert Adressierung, kann Sichtbarkeit reduzieren, ist aber kein Ersatz für gezielte Sicherheitsmechanismen.' },
    { question: 'Ein Client mit 192.168.20.10 wird von NAT nicht übersetzt. Die ACL lautet "permit 192.168.10.0 0.0.0.255". Was ist die Ursache?', options: ['IP nat outside fehlt', 'Die Quell-IP des Clients matcht nicht auf die ACL', 'Der Pool ist leer'], correct: 1, explanation: 'Die Auswahl-ACL matcht nur 192.168.10.0/24. 192.168.20.10 wird daher nicht übersetzt.' },
    { question: 'Was fehlt in "ip nat inside source list 1 interface g0/1", wenn viele Clients dieselbe globale IP nutzen sollen?', options: ['overload', 'static', 'pool'], correct: 0, explanation: 'overload aktiviert PAT, sodass mehrere Verbindungen dieselbe globale Adresse teilen können.' },
    { question: 'Port Forwarding ist konfiguriert, aber externe Clients kommen nicht durch. NAT funktioniert sonst. Was könnte zusätzlich blockieren?', options: ['Eine ACL/SPI-Regel auf dem externen Interface', 'Fehlendes overload', 'Falsche NAT-Pool-Definition'], correct: 0, explanation: 'NAT macht den Dienst technisch erreichbar; ACLs oder SPI können den Verkehr danach noch blockieren.' },
    { question: 'Clients können ausgehend surfen, aber ein interner Server ist von außen nicht erreichbar. Was fehlt?', options: ['PAT funktioniert nicht', 'Port Forwarding für den eingehenden Dienst', 'Eine größere NAT-ACL'], correct: 1, explanation: 'PAT löst ausgehende Verbindungen. Für eingehende Dienste braucht man typischerweise Port Forwarding.' },
    { question: 'Was passiert, wenn die dynamische PAT-Session abgelaufen ist?', options: ['Die Translation bleibt für immer', 'Die Translation verschwindet und muss bei neuer Verbindung neu erzeugt werden', 'Der Client bekommt eine neue IP'], correct: 1, explanation: 'Dynamische NAT/PAT-Einträge sind temporär und enden mit Timeout oder Verbindungsende.' },
    { question: 'Was bewirkt "clear ip nat translation *"?', options: ['Löscht die NAT-Konfiguration', 'Löscht alle dynamischen Übersetzungen in der Translation Table', 'Startet den Router neu'], correct: 1, explanation: 'clear ip nat translation * entfernt dynamische Einträge, nicht die Konfiguration.' },
  ];
}

function buildCliTasks() {
  return [
    {
      startContext: 'Globaler Konfigurationsmodus',
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
      startContext: 'Globaler Konfigurationsmodus',
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
      startContext: 'Globaler Konfigurationsmodus',
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
      startContext: 'Globaler Konfigurationsmodus',
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
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Wie prüfst du die aktuellen NAT-Übersetzungen?"',
      expectedLines: [['show ip nat translations', 'sh ip nat translations']],
      explanation: 'show ip nat translations zeigt alle aktiven Übersetzungen.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Wie prüfst du NAT-Statistiken und Interface-Kennzeichnungen?"',
      expectedLines: [['show ip nat statistics', 'sh ip nat statistics']],
      explanation: 'show ip nat statistics zeigt NAT-Status, inside/outside Interfaces, Hits/Misses.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
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
