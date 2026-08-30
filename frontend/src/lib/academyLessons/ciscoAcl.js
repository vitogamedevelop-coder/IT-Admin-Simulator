import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Access Control Lists (ACL)" - fills the catalog's existing
// `cisco-packet-tracer/acl` slot. Covers usage, first-match logic, implicit
// deny, blocklist vs. allowlist, numbered/named standard and extended ACLs,
// host/any, wildcard masks, binding to interfaces (in/out), placement rules,
// VTY hardening, editing with sequence numbers, verification and traffic
// analysis. All content is data-driven for later quiz reuse.
// =============================================================================

export const CISCO_ACL_TOPIC_KEY = topicKey('cisco-packet-tracer', 'acl');

const ACL_PIPELINE_SVG = `<svg viewBox="0 0 320 260" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">ACL Verarbeitung: First Match + Implicit Deny</text><rect x="110" y="35" width="100" height="28" rx="4" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="2"/><text x="160" y="54" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">PAKET</text><polygon points="160,68 155,78 165,78" fill="#00f0ff"/><rect x="30" y="85" width="260" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="160" y="105" text-anchor="middle" fill="#c9d1d9" font-size="8">ACE 10 prüfen → Match? permit/deny → STOP</text><polygon points="160,120 155,130 165,130" fill="#00f0ff"/><rect x="30" y="135" width="260" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="160" y="155" text-anchor="middle" fill="#c9d1d9" font-size="8">ACE 20 prüfen → Match? permit/deny → STOP</text><polygon points="160,170 155,180 165,180" fill="#00f0ff"/><rect x="30" y="185" width="260" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="160" y="205" text-anchor="middle" fill="#c9d1d9" font-size="8">ACE 30 prüfen → Match? permit/deny → STOP</text><polygon points="160,220 155,230 165,230" fill="#ff7b72"/><rect x="70" y="235" width="180" height="20" rx="4" fill="#ff7b72" opacity="0.35" stroke="#ff7b72" stroke-width="2"/><text x="160" y="249" text-anchor="middle" fill="#ff7b72" font-size="8">kein Match → implicit deny</text></svg>`;

const ACL_IN_OUT_SVG = `<svg viewBox="0 0 340 180" class="w-full h-auto max-h-52" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">in / out aus Sicht des Router-Interfaces</text><rect x="120" y="60" width="100" height="70" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="88" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">ROUTER</text><text x="170" y="105" text-anchor="middle" fill="#0a1628" font-size="8">g0/0</text><rect x="20" y="70" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="60" y="90" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">CLIENT</text><rect x="240" y="70" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="280" y="90" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">SERVER</text><line x1="100" y1="85" x2="120" y2="85" stroke="#00f0ff" stroke-width="2"/><polygon points="112,80 112,90 120,85" fill="#00f0ff"/><text x="110" y="75" text-anchor="middle" fill="#00f0ff" font-size="7">in</text><line x1="220" y1="95" x2="240" y2="95" stroke="#00f0ff" stroke-width="2"/><polygon points="232,90 232,100 240,95" fill="#00f0ff"/><text x="230" y="115" text-anchor="middle" fill="#00f0ff" font-size="7">out</text><text x="170" y="160" text-anchor="middle" fill="#8b949e" font-size="8">Richtungen beziehen sich immer auf das Interface, nicht auf den Client</text></svg>`;

const ACL_PLACEMENT_SVG = `<svg viewBox="0 0 340 200" class="w-full h-auto max-h-56" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">ACL-Platzierung</text><rect x="20" y="80" width="70" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="55" y="100" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Quelle</text><rect x="130" y="70" width="80" height="55" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="95" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">Router</text><text x="170" y="112" text-anchor="middle" fill="#0a1628" font-size="8">Extended ACL</text><rect x="250" y="80" width="70" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="285" y="100" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Ziel</text><line x1="90" y1="95" x2="130" y2="95" stroke="#00f0ff" stroke-width="2"/><line x1="210" y1="95" x2="250" y2="95" stroke="#00f0ff" stroke-width="2"/><text x="110" y="120" text-anchor="middle" fill="#8b949e" font-size="7">quellnah</text><rect x="130" y="140" width="80" height="25" rx="3" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="170" y="156" text-anchor="middle" fill="#c9d1d9" font-size="7">Standard ACL eher zielnah</text></svg>`;

const ACL_VTY_SVG = `<svg viewBox="0 0 320 180" class="w-full h-auto max-h-52" xmlns="http://www.w3.org/2000/svg"><text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">VTY-Zugriff absichern</text><rect x="20" y="70" width="90" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="65" y="90" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Admin-PC</text><rect x="130" y="60" width="80" height="60" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="85" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">Router</text><text x="170" y="100" text-anchor="middle" fill="#0a1628" font-size="7">line vty 0 15</text><text x="170" y="113" text-anchor="middle" fill="#0a1628" font-size="7">access-class 10 in</text><rect x="130" y="135" width="80" height="25" rx="3" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="170" y="151" text-anchor="middle" fill="#c9d1d9" font-size="7">ACL 10: 192.168.99.0/24</text><line x1="110" y1="85" x2="130" y2="90" stroke="#00f0ff" stroke-width="2"/><line x1="210" y1="90" x2="240" y2="90" stroke="#ff7b72" stroke-width="2" stroke-dasharray="5,3"/><text x="250" y="93" text-anchor="start" fill="#ff7b72" font-size="7">nicht erlaubte Quellen blockiert</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------------
  // 1. Einsatz und Arbeitsweise
  // ---------------------------------------------------------------------------
  exps.push(explanation('intro-classic', 'Was ist eine ACL?', 'classic', [
    { type: 'text', content: 'Eine Access Control List (ACL) ist eine geordnete Liste von Regeln, mit der ein Cisco-Router oder -Switch Datenverkehr filtern kann. Jede Regel - auch Access Control Entry (ACE) genannt - erlaubt (permit) oder blockiert (deny) bestimmten Verkehr.' },
    { type: 'list', title: 'Wo werden ACLs eingesetzt?', items: [
      'Auf Router-Interfaces zum Filtern von Datenverkehr (Layer 3).',
      'Auf VTY-Leitungen, um SSH/Telnet-Zugriffe auf bestimmte Quellnetze zu beschränken.',
      'In Verbindung mit NAT, um anzugeben, welche Adressen übersetzt werden dürfen.',
    ] },
    { type: 'text', content: 'Eine ACL allein tut noch nichts - sie muss erst an einem Interface oder einer Line gebunden werden.' },
  ]));

  exps.push(explanation('first-match-classic', 'First Match und implicit deny', 'classic', [
    { type: 'text', content: 'Cisco prüft die ACEs einer ACL von oben nach unten. Sobald eine Regel passt, wird sofort permit oder deny ausgeführt - und die restlichen Regeln werden nicht mehr betrachtet. Deshalb ist die Reihenfolge entscheidend.' },
    { type: 'list', title: 'Beispiel: Falsch sortierte ACL', items: [
      'access-list 10 permit any',
      'access-list 10 deny host 192.168.10.10',
    ] },
    { type: 'text', content: 'Der Host 192.168.10.10 wird NICHT blockiert, weil permit any bereits zuerst trifft.' },
    { type: 'text', content: 'Am Ende jeder ACL steht automatisch eine unsichtbare Regel: deny any bzw. bei Extended ACLs deny ip any any. Das nennt man implicit deny. Wenn kein permit trifft, wird der Verkehr verworfen.' },
    { type: 'question', question: 'Warum ist permit any notwendig, nachdem man einzelne Hosts denied hat?', options: ['Damit die ACL funktioniert', 'Damit der restliche Verkehr erlaubt wird, bevor implicit deny greift', 'Damit der Router schneller ist', 'Weil deny sonst nicht ausgewertet wird'], correct: 1, explanation: 'Ohne permit any würde der implizite deny any am Ende den gesamten restlichen Verkehr blockieren.' },
  ]));

  exps.push(explanation('first-match-visual', 'ACL-Verarbeitung: First Match + Implicit Deny', 'visual', [
    { type: 'diagram', content: ACL_PIPELINE_SVG },
    { type: 'text', content: 'Cisco prüft die Regeln von oben nach unten. Das erste passende Match gewinnt und stoppt die Auswertung. Wenn keine Regel passt, greift der unsichtbare implicit deny am Ende.' },
  ]));

  // ---------------------------------------------------------------------------
  // 2. Blocklist vs. Allowlist
  // ---------------------------------------------------------------------------
  exps.push(explanation('blocklist-allowlist-classic', 'Blocklist und Allowlist', 'classic', [
    { type: 'text', content: 'Eine Blocklist sagt: „Bestimmtes ist verboten, der Rest ist erlaubt.“ Eine Allowlist sagt: „Nur Bestimmtes ist erlaubt, der Rest ist verboten.“' },
    { type: 'table', headers: ['Ansatz', 'Regeln', 'Sicherheit'], rows: [
      ['Blocklist', 'deny <unerwünscht>\npermit any', 'Weniger streng: alles außer der Liste kommt durch.'],
      ['Allowlist', 'permit <gewünscht>\nimplicit deny', 'Strenger: nur explizit Erlaubtes kommt durch.'],
    ] },
    { type: 'text', content: 'Für administrationskritische Bereiche wie VTY-Zugriff ist eine Allowlist der sicherere Ansatz.' },
    { type: 'question', question: 'Ein Server-Netz soll nur von drei bekannten Subnetzen erreichbar sein. Welcher Ansatz ist sinnvoller?', options: ['Blocklist mit permit any', 'Allowlist mit permit für die drei Subnetze', 'Standard ACL ohne Richtung', 'Keine ACL'], correct: 1, explanation: 'Eine Allowlist erlaubt nur die bekannten Subnetze, alles andere fällt auf den implicit deny.' },
  ]));

  // ---------------------------------------------------------------------------
  // 3. Standard ACL
  // ---------------------------------------------------------------------------
  exps.push(explanation('standard-classic', 'Standard ACL', 'classic', [
    { type: 'text', content: 'Eine Standard ACL filtert ausschließlich nach der Quell-IP (Source). Deshalb platziert man sie typischerweise näher am Ziel, damit sie nicht versehentlich zu viel Verkehr blockiert.' },
    { type: 'table', headers: ['Attribut', 'Wert'], rows: [
      ['Filterkriterium', 'Nur Source-IP'],
      ['Numbered Bereiche', '1–99 und 1300–1999'],
      ['Schlüsselwörter', 'host, any'],
    ] },
    { type: 'list', title: 'Beispiele Numbered Standard', items: [
      'access-list 10 permit 192.168.10.0 0.0.0.255',
      'access-list 10 deny host 192.168.10.50',
      'access-list 10 permit any',
    ] },
    { type: 'list', title: 'Beispiel Named Standard', items: [
      'ip access-list standard CLIENTS',
      ' permit 192.168.10.0 0.0.0.255',
      ' deny any',
    ] },
    { type: 'question', question: 'Welchen Bereich hat eine Standard ACL mit der Nummer 45?', options: ['100–199', '1–99', '1300–1999', '2000–2699'], correct: 1, explanation: 'Numbered Standard ACLs liegen im Bereich 1–99 (und alternativ 1300–1999).' },
  ]));

  // ---------------------------------------------------------------------------
  // 4. Extended ACL
  // ---------------------------------------------------------------------------
  exps.push(explanation('extended-classic', 'Extended ACL', 'classic', [
    { type: 'text', content: 'Eine Extended ACL filtert deutlich genauer. Mindestens müssen Protokoll, Source, Destination und bei TCP/UDP auch Ports berücksichtigt werden. Weil sie so spezifisch ist, kann sie typischerweise näher an der Quelle platziert werden.' },
    { type: 'table', headers: ['Attribut', 'Wert'], rows: [
      ['Filterkriterium', 'Protokoll, Source, Destination, Port'],
      ['Numbered Bereiche', '100–199 und 2000–2699'],
      ['Schlüsselwörter', 'host, any, eq'],
    ] },
    { type: 'list', title: 'Beispiel Numbered Extended', items: [
      'access-list 110 permit tcp 192.168.10.0 0.0.0.255 host 10.10.10.10 eq 80',
      'access-list 110 deny ip any any',
    ] },
    { type: 'text', content: 'Bedeutung der einzelnen Teile: permit → Aktion, tcp → Protokoll, 192.168.10.0 0.0.0.255 → Source mit Wildcard, host 10.10.10.10 → Destination, eq 80 → Port 80.' },
    { type: 'list', title: 'Beispiel Named Extended', items: [
      'ip access-list extended WEB-ACCESS',
      ' permit tcp 192.168.10.0 0.0.0.255 host 10.10.10.10 eq 80',
      ' deny ip any any',
    ] },
    { type: 'question', question: 'Welchen Nummernbereich hat eine Extended ACL?', options: ['1–99', '100–199 und 2000–2699', '1300–1999', '1–99 und 1300–1999'], correct: 1, explanation: 'Extended ACLs verwenden 100–199 und alternativ 2000–2699.' },
  ]));

  // ---------------------------------------------------------------------------
  // 5. host und any
  // ---------------------------------------------------------------------------
  exps.push(explanation('host-any-classic', 'host und any', 'classic', [
    { type: 'text', content: 'host und any sind Abkürzungen, die das Schreiben von ACLs vereinfachen.' },
    { type: 'table', headers: ['Schlüsselwort', 'Bedeutung', 'Langform'], rows: [
      ['host 192.168.10.10', 'Genau eine IP-Adresse', '192.168.10.10 0.0.0.0'],
      ['any', 'Beliebige Adresse', '0.0.0.0 255.255.255.255'],
      ['eq 80', 'Port ist gleich 80', '—'],
    ] },
    { type: 'question', question: 'Welche Langform hat access-list 10 deny host 192.168.10.10?', options: ['192.168.10.10 0.0.0.0', '0.0.0.0 255.255.255.255', '192.168.10.0 0.0.0.255', 'any'], correct: 0, explanation: 'host <IP> entspricht <IP> 0.0.0.0 - alle Bits müssen passen.' },
  ]));

  // ---------------------------------------------------------------------------
  // 6. Wildcard Masken (Repetition)
  // ---------------------------------------------------------------------------
  exps.push(explanation('wildcard-classic', 'Wildcard Masken in ACLs', 'classic', [
    { type: 'text', content: 'Wildcard Masken funktionieren in ACLs genauso wie bei OSPF: eine 0 bedeutet „Bit muss passen“, eine 255 bedeutet „egal“. Sie sind die Umkehrung der Subnetzmaske.' },
    { type: 'table', headers: ['Subnetz', 'Wildcard'], rows: [
      ['/24 (255.255.255.0)', '0.0.0.255'],
      ['/30 (255.255.255.252)', '0.0.0.3'],
      ['Einzelhost (255.255.255.255)', '0.0.0.0'],
    ] },
    { type: 'question', question: 'Welche Wildcard gehört zu 10.0.0.0/30?', options: ['0.0.0.255', '0.0.0.3', '0.0.255.255', '255.255.255.255'], correct: 1, explanation: '/30 = 255.255.255.252, invertiert = 0.0.0.3.' },
  ]));

  // ---------------------------------------------------------------------------
  // 7. ACL binden: in und out
  // ---------------------------------------------------------------------------
  exps.push(explanation('bind-classic', 'ACL an ein Interface binden', 'classic', [
    { type: 'text', content: 'Eine ACL wird mit ip access-group an ein Layer-3-Interface gebunden. Dabei muss die Richtung aus Sicht des Routers/Interfaces angegeben werden - nicht aus Sicht des Clients.' },
    { type: 'list', title: 'Beispiel', items: [
      'Router(config)# interface g0/0',
      'Router(config-if)# ip access-group 110 in',
    ] },
    { type: 'table', headers: ['Richtung', 'Bedeutung aus Routersicht'], rows: [
      ['in', 'Paket kommt auf diesem Interface in den Router hinein.'],
      ['out', 'Paket verlässt den Router über dieses Interface.'],
    ] },
    { type: 'question', question: 'Ein Paket kommt von einem Client am g0/0 an und soll zum Server ins Internet weitergeleitet werden. Wo filtert ip access-group 110 in?', options: ['Beim Verlassen des Routers', 'Beim Eintreffen auf g0/0', 'Auf dem Client', 'Im Switch'], correct: 1, explanation: 'in bedeutet: Paket kommt auf dem Interface in den Router hinein.' },
  ]));

  exps.push(explanation('bind-visual', 'ACL-Richtung: in vs out', 'visual', [
    { type: 'diagram', content: ACL_IN_OUT_SVG },
    { type: 'text', content: '"in" filtert Verkehr, der über das Interface in den Router hineinkommt. "out" filtert Verkehr, der den Router über das Interface verlässt. Die Richtung ist immer aus Sicht des Router-Interfaces, nicht aus Sicht des Clients.' },
  ]));

  // ---------------------------------------------------------------------------
  // 8. Position der ACL
  // ---------------------------------------------------------------------------
  exps.push(explanation('position-classic', 'Wo gehört die ACL hin?', 'classic', [
    { type: 'text', content: 'Die Platzierung hängt vom Typ und vom Datenfluss ab. Eine Standard ACL filtert nur nach Source, also platziert man sie typischerweise näher am Ziel. Eine Extended ACL kann spezifischer filtern und wird daher oft näher an der Quelle platziert.' },
    { type: 'text', content: 'Beispiel-Topologie: Client (192.168.10.0/24) → Router → Server (10.10.10.10). Ein Extended ACL-Eintrag, der HTTP aus dem Client-Netz zum Server erlaubt, könnte auf dem Router-Interface Richtung Client (g0/0) als inbound gebunden werden, um den Verkehr direkt an der Quelle zu filtern.' },
    { type: 'question', question: 'Warum kann eine Extended ACL oft näher an der Quelle platziert werden als eine Standard ACL?', options: ['Weil sie schneller ist', 'Weil sie neben Source auch Destination, Protokoll und Port filtern kann und daher präziser ist', 'Weil Extended ACLs keine Wildcard brauchen', 'Weil Standard ACLs keine Richtung haben'], correct: 1, explanation: 'Extended ACLs filtern präziser, deshalb blockieren sie typischerweise nicht mehr Verkehr als beabsichtigt.' },
  ]));

  exps.push(explanation('position-visual', 'ACL-Platzierung: Standard vs Extended', 'visual', [
    { type: 'diagram', content: ACL_PLACEMENT_SVG },
    { type: 'text', content: 'Standard ACLs kennen nur die Quelle und sollten deshalb typischerweise näher am Ziel platziert werden, damit sie nicht ungewollten Verkehr auf dem Weg blockieren. Extended ACLs sind präziser und können daher näher an der Quelle eingesetzt werden.' },
  ]));

  // ---------------------------------------------------------------------------
  // 9. Anzahl ACLs pro Interface
  // ---------------------------------------------------------------------------
  exps.push(explanation('count-classic', 'Wie viele ACLs pro Interface?', 'classic', [
    { type: 'text', content: 'Pro Interface, Protokoll und Richtung ist nur eine IPv4-ACL gleichzeitig aktiv. Man kann also eine IPv4-ACL inbound und eine weitere IPv4-ACL outbound auf demselben Interface haben, aber nicht zwei inbound IPv4-ACLs gleichzeitig.' },
    { type: 'table', headers: ['Möglich', 'Nicht möglich'], rows: [
      ['IPv4 ACL inbound + IPv4 ACL outbound auf g0/0', 'Zwei IPv4 ACLs inbound auf g0/0'],
      ['IPv4 ACL + IPv6 ACL auf g0/0', 'Zwei IPv4 ACLs outbound auf g0/0'],
    ] },
    { type: 'question', question: 'Wie viele IPv4-ACLs können gleichzeitig inbound auf g0/0 aktiv sein?', options: ['Beliebig viele', 'Eine', 'Zwei', 'Eine pro Port'], correct: 1, explanation: 'Pro Interface, Protokoll und Richtung ist nur eine ACL aktiv.' },
  ]));

  // ---------------------------------------------------------------------------
  // 10. VTY mit ACL absichern
  // ---------------------------------------------------------------------------
  exps.push(explanation('vty-classic', 'VTY-Leitungen mit ACL absichern', 'classic', [
    { type: 'text', content: 'Um den Fernzugriff auf das Gerät zu beschränken, wird nicht ip access-group an einem Interface verwendet, sondern access-class an den VTY-Lines. SSH/Telnet-Verbindungen werden dann nur von erlaubten Quell-IPs akzeptiert.' },
    { type: 'list', title: 'Beispiel', items: [
      'Router(config)# access-list 10 permit 192.168.100.0 0.0.0.255',
      'Router(config)# line vty 0 15',
      'Router(config-line)# transport input ssh',
      'Router(config-line)# login local',
      'Router(config-line)# access-class 10 in',
    ] },
    { type: 'text', content: 'Wichtig: An einem Interface heißt es ip access-group, an VTY-Lines heißt es access-class.' },
    { type: 'question', question: 'Welcher Befehl bindet eine ACL an die VTY-Lines?', options: ['ip access-group', 'access-class', 'ip access-list', 'line vty access'], correct: 1, explanation: 'An VTY-Lines wird access-class <ACL> in verwendet, nicht ip access-group.' },
  ]));

  exps.push(explanation('vty-visual', 'VTY-Zugriff mit access-class einschränken', 'visual', [
    { type: 'diagram', content: ACL_VTY_SVG },
    { type: 'text', content: 'An VTY-Lines wird nicht ip access-group verwendet, sondern access-class. Damit schränkst du SSH/Telnet-Zugriffe auf bestimmte Quellnetze ein - ein wichtiges Verbindungsstück zum SSH-Topic.' },
  ]));

  // ---------------------------------------------------------------------------
  // 11. ACL editieren
  // ---------------------------------------------------------------------------
  exps.push(explanation('edit-classic', 'Named ACLs editieren', 'classic', [
    { type: 'text', content: 'Named ACLs verwenden Sequenznummern, die standardmäßig in 10er-Schritten vergeben werden (10, 20, 30, ...). Dadurch lassen sich Regeln dazwischen einfügen oder entfernen, ohne die ganze ACL neu zu schreiben.' },
    { type: 'list', title: 'Beispiel', items: [
      'ip access-list extended WEB-ACCESS',
      ' 10 permit tcp 192.168.10.0 0.0.0.255 host 10.10.10.10 eq 80',
      ' 20 deny ip any any',
    ] },
    { type: 'list', title: 'Regel zwischen 10 und 20 einfügen', items: [
      'ip access-list extended WEB-ACCESS',
      ' 15 permit tcp 192.168.10.0 0.0.0.255 host 10.10.10.10 eq 443',
    ] },
    { type: 'list', title: 'Regel entfernen', items: [
      'ip access-list extended WEB-ACCESS',
      ' no 15',
    ] },
    { type: 'list', title: 'Resequencing', items: [
      'ip access-list resequence WEB-ACCESS 10 10',
    ] },
    { type: 'question', question: 'Warum verwendet Cisco bei Named ACLs Sequenznummern?', options: ['Damit man Regeln einfügen und entfernen kann, ohne die ACL komplett neu zu schreiben', 'Damit die ACL schneller funktioniert', 'Damit die Regeln automatisch sortiert werden', 'Weil named ACLs ohne Nummern nicht funktionieren'], correct: 0, explanation: 'Sequenznummern ermöglichen gezieltes Editieren, z. B. 15 permit ... oder no 15.' },
  ]));

  // ---------------------------------------------------------------------------
  // 12. Verifizierung
  // ---------------------------------------------------------------------------
  exps.push(explanation('verify-classic', 'ACLs verifizieren', 'classic', [
    { type: 'text', content: 'Nach der Konfiguration musst du prüfen, welche ACLs existieren, welche Regeln sie enthalten und wo sie gebunden wurden.' },
    { type: 'table', headers: ['Befehl', 'Was zeigt er?'], rows: [
      ['show access-lists', 'Alle ACLs mit Regeln, Typ und Match-Zählern.'],
      ['show ip access-lists', 'Nur IPv4-ACLs.'],
      ['show running-config', 'Gesamte Konfiguration inklusive ACLs und Bindungen.'],
      ['show ip interface g0/0', 'ACL-Bindung auf dem Interface und Richtung.'],
    ] },
    { type: 'question', question: 'Welcher Befehl zeigt, ob auf g0/0 eine ACL gebunden ist?', options: ['show access-lists', 'show ip access-lists', 'show ip interface g0/0', 'show running-config'], correct: 2, explanation: 'show ip interface <Interface> zeigt die auf dem Interface gebundenen ACLs inklusive inbound/outbound.' },
  ]));

  // ---------------------------------------------------------------------------
  // 13. Datenverkehrsanalyse
  // ---------------------------------------------------------------------------
  exps.push(explanation('analysis-classic', 'Datenverkehr durch eine ACL analysieren', 'classic', [
    { type: 'text', content: 'Bei der Analyse geht man Regel für Regel vor: Passt Source? Passt Destination? Passt Protokoll? Passt Port? Welche Aktion folgt? Wenn nichts passt, greift implicit deny.' },
    { type: 'text', content: 'Beispiel-ACL:' },
    { type: 'list', title: 'ACL 110', items: [
      '10 permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.10 eq 443',
      '20 deny ip any host 10.0.0.10',
      '30 permit ip any any',
    ] },
    { type: 'text', content: 'Paket: 192.168.10.25 → 10.0.0.10, TCP 443. Regel 10 passt: permit. Paket: 192.168.20.5 → 10.0.0.10, TCP 80. Regel 10 passt nicht, Regel 20 passt: deny.' },
    { type: 'question', question: 'Welche Regel trifft auf 192.168.10.25 → 10.0.0.10 TCP 443?', options: ['Regel 10', 'Regel 20', 'Regel 30', 'implicit deny'], correct: 0, explanation: 'Regel 10 passt auf das Quellnetz, Zielhost, Protokoll und Port 443.' },
  ]));

  // ---------------------------------------------------------------------------
  // 14. Zusammenfassung
  // ---------------------------------------------------------------------------
  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'ACLs filtern in geordneten Listen: First Match, dann stop.',
      'Am Ende jeder ACL wirkt implicit deny.',
      'Standard ACL: 1–99, 1300–1999, filtert nur nach Source.',
      'Extended ACL: 100–199, 2000–2699, filtert nach Protokoll, Source, Destination, Port.',
      'host = einzelne IP, any = beliebige IP.',
      'Bindung: interface → ip access-group <ACL> in|out.',
      'VTY: line vty 0 15 → access-class <ACL> in.',
      'Pro Interface, Protokoll und Richtung ist nur eine ACL aktiv.',
      'Named ACLs lassen sich mit Sequence Numbers einfach editieren.',
      'Verifizieren: show access-lists, show ip access-lists, show running-config, show ip interface.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'acl-numbered-ranges-matching',
      type: 'matching',
      question: 'Ordne die ACL-Typen ihren Nummernbereichen zu.',
      pairs: [
        { left: 'Standard', leftLabel: 'Standard ACL', right: '1–99 und 1300–1999' },
        { left: 'Extended', leftLabel: 'Extended ACL', right: '100–199 und 2000–2699' },
        { left: 'Named', leftLabel: 'Named ACL', right: 'Beliebiger Name' },
      ],
      explanation: 'Standard ACLs nutzen 1–99/1300–1999, Extended ACLs 100–199/2000–2699, Named ACLs haben keinen Nummernbereich.',
    },
    {
      id: 'acl-blocklist-allowlist-select',
      type: 'select-best',
      question: 'Ein Administrator will nur bekannten Verwaltungsrechnern SSH-Zugriff erlauben. Welcher Ansatz ist passend?',
      options: [
        'Blocklist: permit any, dann deny für unbekannte IPs',
        'Allowlist: permit für die Verwaltungsrechner, Rest durch implicit deny',
        'Standard ACL ohne permit any',
        'Keine ACL, nur login local',
      ],
      correct: 1,
      explanation: 'Eine Allowlist erlaubt nur explizit bekannten Verkehr, alles andere wird durch den implicit deny verworfen.',
    },
    {
      id: 'acl-first-match-ordering',
      type: 'ordering',
      question: 'Bringe die ACL-Regeln so an, dass Host 192.168.10.10 blockiert wird, der Rest aber erlaubt bleibt.',
      items: [
        { id: 'deny', label: 'access-list 10 deny host 192.168.10.10' },
        { id: 'permit', label: 'access-list 10 permit any' },
      ],
      correctOrder: ['deny', 'permit'],
      explanation: 'Deny vor permit, sonst trifft permit any zuerst und der Host wird nicht blockiert (First Match).',
    },
    {
      id: 'acl-traffic-analysis-select',
      type: 'select-best',
      question: 'Gegeben: access-list 110 permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.10 eq 80 / access-list 110 deny ip any host 10.0.0.10 / access-list 110 permit ip any any. Was passiert mit 192.168.10.25 → 10.0.0.10, TCP 80?',
      options: ['permit durch Regel 10', 'deny durch Regel 20', 'permit durch Regel 30', 'implicit deny'], correct: 0,
      explanation: 'Regel 10 passt auf Source-Netz, Zielhost, TCP und Port 80 und erlaubt das Paket.',
    },
    {
      id: 'acl-traffic-analysis-2-select',
      type: 'select-best',
      question: 'Gegeben dieselbe ACL. Was passiert mit 192.168.20.5 → 10.0.0.10, TCP 80?',
      options: ['permit durch Regel 10', 'deny durch Regel 20', 'permit durch Regel 30', 'implicit deny'], correct: 1,
      explanation: 'Quellnetz passt nicht zu Regel 10, Regel 20 passt auf any → 10.0.0.10 und verweigert.',
    },
    {
      id: 'acl-position-select',
      type: 'select-best',
      question: 'Eine Standard ACL soll einen bestimmten Host am Ziel blockieren. Wo sollte sie typischerweise platziert werden?',
      options: ['Möglichst nah an der Quelle', 'Möglichst nah am Ziel', 'Auf dem Client-Switch', 'In der VTY-Line'], correct: 1,
      explanation: 'Standard ACLs filtern nur nach Source und sollten daher näher am Ziel platziert werden, um nicht zu viel Verkehr zu blockieren.',
    },
    {
      id: 'acl-interface-count-select',
      type: 'select-best',
      question: 'Wie viele IPv4-ACLs können gleichzeitig inbound auf g0/0 aktiv sein?',
      options: ['Beliebig viele', 'Eine', 'Zwei', 'Eine pro TCP-Port'], correct: 1,
      explanation: 'Pro Interface, Protokoll und Richtung ist nur eine IPv4-ACL gleichzeitig aktiv.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'acl-cli-standard',
      type: 'cli-input',
      question: 'Erstelle eine Numbered Standard ACL 10, die Host 192.168.10.50 blockiert und allen anderen Verkehr erlaubt.',
      expectedLines: [
        'access-list 10 deny host 192.168.10.50',
        'access-list 10 permit any',
      ],
      explanation: 'Deny den Host, dann permit any, sonst greift implicit deny.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'acl-cli-bind',
      type: 'cli-input',
      question: 'Binde ACL 110 am Interface g0/0 in eingehender Richtung an.',
      expectedLines: [
        'interface g0/0',
        'ip access-group 110 in',
      ],
      explanation: 'ip access-group <ACL> in im Interface-Kontext bindet die ACL eingehend.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'acl-cli-extended',
      type: 'cli-input',
      question: 'Erlaube dem Netz 192.168.10.0/24 HTTP-Zugriff auf Server 10.10.10.10 mit Extended ACL 110.',
      expectedLines: [
        'access-list 110 permit tcp 192.168.10.0 0.0.0.255 host 10.10.10.10 eq 80',
      ],
      explanation: 'tcp, Source mit Wildcard, Host als Destination, eq 80 für Port 80.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'acl-cli-vty',
      type: 'cli-input',
      question: 'Nur das Managementnetz 192.168.99.0/24 darf per SSH auf die VTYs zugreifen. ACL 10 ist bereits passend.',
      expectedLines: [
        'line vty 0 15',
        'access-class 10 in',
      ],
      explanation: 'An VTY-Lines wird access-class <ACL> in verwendet, nicht ip access-group.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'acl-cli-named',
      type: 'cli-input',
      question: 'Erstelle eine Named Standard ACL namens ADMINS, die 192.168.100.0/24 erlaubt und alles andere blockiert.',
      expectedLines: [
        'ip access-list standard ADMINS',
        'permit 192.168.100.0 0.0.0.255',
        'deny any',
      ],
      explanation: 'Named ACLs werden im ACL-Konfigurationsmodus mit permit/deny-Einträgen erstellt.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'acl-cli-edit',
      type: 'cli-input',
      question: 'Füge in der Named Extended ACL WEB-ACCESS zwischen Sequenz 10 und 20 eine HTTPS-Regel für 192.168.10.0/24 → 10.10.10.10 ein.',
      expectedLines: [
        'ip access-list extended WEB-ACCESS',
        '15 permit tcp 192.168.10.0 0.0.0.255 host 10.10.10.10 eq 443',
      ],
      explanation: 'Named ACLs erlauben Einfügen zwischen bestehenden Sequence Numbers, z. B. 15 zwischen 10 und 20.',
    },
    {
      id: 'acl-verify-select',
      type: 'select-best',
      question: 'Welcher Befehl zeigt alle ACLs mit ihren Match-Zählern an?',
      options: ['show ip interface', 'show running-config', 'show access-lists', 'show ip route'], correct: 2,
      explanation: 'show access-lists zeigt alle ACLs, ihre Regeln und ggf. Match-Zähler.',
    },
    {
      id: 'acl-host-any-select',
      type: 'select-best',
      question: 'Welche Langform hat host 10.0.0.5 in einer ACL?',
      options: ['0.0.0.0 255.255.255.255', '10.0.0.5 0.0.0.0', '10.0.0.0 0.0.0.255', 'any'], correct: 1,
      explanation: 'host <IP> bedeutet, dass alle Bits passen müssen, also Wildcard 0.0.0.0.',
    },
    {
      id: 'acl-wrong-direction-select',
      type: 'select-best',
      question: 'Eine ACL 110 wurde erstellt und korrekt geschrieben, zeigt aber keine Wirkung. "show ip interface g0/0" zeigt keine gebundene ACL. "show running-config" zeigt "ip access-group 110 in" unter "interface g0/1". Was ist wahrscheinlich falsch?',
      options: ['ACL ist falsch geschrieben', 'ACL wurde an ein falsches Interface gebunden', 'implicit deny greift', 'Richtung ist grundsätzlich egal'],
      correct: 1,
      explanation: 'ACLs müssen am richtigen Interface und in der richtigen Richtung gebunden werden.',
    },
    {
      id: 'acl-zero-matches-select',
      type: 'select-best',
      question: 'Eine ACL-Regel, die erwartungsgemäß Traffic treffen sollte, zeigt "0 matches". Was ist ein sinnvoller erster Diagnoseschritt?',
      options: ['Sofort den Router neu starten', 'Prüfen, ob die ACL am richtigen Interface und in der richtigen Richtung gebunden ist und der Match wirklich korrekt definiert ist', 'ACL löschen und neu anlegen, ohne zu prüfen'], correct: 1,
      explanation: '0 matches deutet darauf hin, dass das Paket die Regel gar nicht erreicht - entweder wegen falscher Platzierung/Richtung oder weil der Match falsch ist.',
    },
    {
      id: 'acl-rule-order-select',
      type: 'select-best',
      question: 'In welcher Reihenfolge müssen diese Regeln stehen, um HTTP aus 192.168.10.0/24 zu Server 10.10.10.10 zu erlauben und allen anderen Verkehr zu 10.10.10.10 zu verbieten?\n1) permit tcp 192.168.10.0 0.0.0.255 host 10.10.10.10 eq 80\n2) deny ip any host 10.10.10.10\n3) permit ip any any',
      options: ['1, 3, 2', '1, 2, 3', '2, 1, 3', '3, 1, 2'], correct: 1,
      explanation: 'Erst die spezifische Erlaubnis, dann das spezifische Verbot. permit ip any any darf nicht vor dem deny stehen.',
    },
    {
      id: 'acl-implicit-deny-select',
      type: 'select-best',
      question: 'Eine ACL enthält nur "access-list 10 deny host 192.168.10.10". Was passiert mit 192.168.10.20?',
      options: ['Er wird erlaubt, weil nur ein Host verboten wurde', 'Er wird verworfen, weil am Ende jeder ACL implicit deny wirkt', 'Er wird gepingt', 'Es kommt auf die Richtung an'], correct: 1,
      explanation: 'Wenn es kein permit gibt, greift der unsichtbare implicit deny am Ende und verwirft alles andere.',
    },
    {
      id: 'acl-standard-vs-extended-select',
      type: 'select-best',
      question: 'Ein Administrator will allen ausgehenden Telnet-Verkehr aus 192.168.10.0/24 verbieten. Welcher ACL-Typ ist nötig?',
      options: ['Standard ACL', 'Extended ACL', 'VTY access-class', 'Named ACL'], correct: 1,
      explanation: 'Telnet läuft auf TCP 23 und erfordert die Filterung nach Protokoll, Source, Destination und Port - das ist Aufgabe einer Extended ACL.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was ist das Grundprinzip einer ACL bei der Auswertung?', options: ['Last Match', 'First Match', 'Random Match', 'Longest Prefix Match'], correct: 1, explanation: 'Cisco prüft ACLs von oben nach unten. Sobald eine Regel passt, stoppt die Auswertung (First Match).' },
    { question: 'Was steht am Ende jeder ACL automatisch?', options: ['permit any', 'implicit deny', 'deny any any', 'log'], correct: 1, explanation: 'Jede ACL endet automatisch mit einem implicit deny, der nicht sichtbar ist.' },
    { question: 'Welchen Nummernbereich hat eine Standard ACL?', options: ['1–99 und 1300–1999', '100–199 und 2000–2699', '1–99 und 100–199', '2000–2699'], correct: 0, explanation: 'Standard ACLs verwenden 1–99 und 1300–1999.' },
    { question: 'Welchen Nummernbereich hat eine Extended ACL?', options: ['1–99', '100–199 und 2000–2699', '1300–1999', '1–99 und 1300–1999'], correct: 1, explanation: 'Extended ACLs verwenden 100–199 und 2000–2699.' },
    { question: 'Wofür steht any in einer ACL?', options: ['Nur ein Host', 'Beliebige Adresse', 'Nur das eigene Netz', 'Administratoren'], correct: 1, explanation: 'any ist die Abkürzung für 0.0.0.0 255.255.255.255 - beliebige Adresse.' },
    { question: 'Was ist der Unterschied zwischen Standard und Extended ACL?', options: ['Standard filtert nach Protokoll, Extended nach Source', 'Standard filtert nur nach Source, Extended nach Protokoll, Source, Destination, Port', 'Es gibt keinen Unterschied', 'Standard ist nur named, Extended ist numbered'], correct: 1, explanation: 'Standard ACLs filtern nur nach Source-IP, Extended ACLs zusätzlich nach Protokoll, Destination und Port.' },
    { question: 'Welcher Befehl bindet eine ACL an ein Interface?', options: ['ip access-list', 'ip access-group', 'access-class', 'line vty'], correct: 1, explanation: 'ip access-group <ACL> in|out bindet eine ACL an ein Layer-3-Interface.' },
    { question: 'Welcher Befehl bindet eine ACL an VTY-Lines?', options: ['ip access-group', 'access-class', 'ip access-list', 'interface vty'], correct: 1, explanation: 'An VTY-Lines wird access-class <ACL> in verwendet.' },
    { question: 'Wie viele IPv4-ACLs können gleichzeitig inbound auf demselben Interface aktiv sein?', options: ['Beliebig viele', 'Eine', 'Zwei', 'Vier'], correct: 1, explanation: 'Pro Interface, Protokoll und Richtung ist nur eine ACL aktiv.' },
    { question: 'Warum wird eine Standard ACL typischerweise näher am Ziel platziert?', options: ['Weil sie schneller ist', 'Weil sie nur nach Source filtern und sonst zu viel blockieren könnte', 'Weil Extended ACLs nicht bindbar sind', 'Weil sie nur outbound funktioniert'], correct: 1, explanation: 'Da Standard ACLs nur Source-IPs kennen, sollten sie nahe am Ziel platziert werden, um unbeabsichtigte Blockaden zu vermeiden.' },
    { question: 'Was bedeutet eq 80 in einer Extended ACL?', options: ['Port ist gleich 80', 'Protokoll ist 80', 'IP ist 80', 'ACL-Nummer ist 80'], correct: 0, explanation: 'eq steht für „equal“ und filtert auf den angegebenen Port (hier 80).' },
    { question: 'Welcher Befehl zeigt die auf g0/0 gebundenen ACLs?', options: ['show access-lists', 'show ip interface g0/0', 'show running-config', 'show ip route'], correct: 1, explanation: 'show ip interface <Interface> zeigt die inbound/outbound gebundenen ACLs.' },
    { question: 'Welche Sequenznummer ist sinnvoll, um zwischen ACE 10 und ACE 20 eine Regel einzufügen?', options: ['5', '15', '25', '20'], correct: 1, explanation: '15 liegt zwischen 10 und 20 und passt in den Standard-10er-Abstand.' },
    { question: 'Welche Wildcard Mask gehört zu 10.0.0.0/30?', options: ['0.0.0.255', '0.0.0.3', '0.0.3.255', '255.255.255.252'], correct: 1, explanation: '/30 = 255.255.255.252, invertiert = 0.0.0.3.' },
    { question: 'Ein Paket trifft auf keine Regel. Was passiert?', options: ['permit any', 'implicit deny', 'Router fragt nach', 'Es wird weitergeleitet'], correct: 1, explanation: 'Am Ende jeder ACL wirkt ein unsichtbarer deny any / deny ip any any.' },
    { question: 'Eine korrekt geschriebene ACL zeigt keine Wirkung. "show ip interface g0/0" zeigt keine Binding. Was fehlt wahrscheinlich?', options: ['Ein permit any-Eintrag', 'Die ACL wurde nicht an das richtige Interface/Richtung gebunden', 'Die ACL-Nummer ist falsch', 'implicit deny'], correct: 1, explanation: 'ACLs müssen mit ip access-group an ein Interface/Richtung gebunden werden, sonst wirken sie nicht.' },
    { question: 'Eine erwartete ACL-Regel zeigt 0 matches. Was ist ein typischer Grund?', options: ['Die ACL ist nicht an Interface/Richtung gebunden oder der Match trifft nicht', 'Der Router hat keine CPU', 'implicit deny', 'Die Sequenznummer ist zu hoch'], correct: 0, explanation: '0 matches deutet darauf hin, dass das Paket die Regel nicht erreicht - oft liegt das an falscher Bindung/Richtung oder einem falschen Match.' },
    { question: 'Was ist der Unterschied zwischen "ip access-group" und "access-class"?', options: ['Keiner', 'ip access-group bindet an Interfaces, access-class bindet an VTY-Lines', 'access-class ist für Interfaces, ip access-group für VTYs', 'beide sind identisch'], correct: 1, explanation: 'ip access-group gilt für Interface-Traffic, access-class für Management-Zugriff auf VTY-Lines.' },
    { question: 'Warum sollte "permit ip any any" nicht vor spezifischen "deny"-Regeln stehen?', options: ['Weil es dann früher matcht und die denies nie greifen', 'Weil die ACL sonst langsamer wird', 'Weil es einen Syntaxfehler verursacht', 'Weil implicit deny trotzdem zuerst kommt'], correct: 0, explanation: 'First Match Wins: permit any matcht fast alles und die nachfolgenden denies werden nie erreicht.' },
  ];
}

function buildCliTasks() {
  return [
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Blockiere Host 192.168.10.25 mit Standard ACL 10 und erlaube allen anderen Traffic."',
      expectedLines: [
        'access-list 10 deny host 192.168.10.25',
        'access-list 10 permit any',
      ],
      explanation: 'Deny vor permit, sonst trifft permit any zuerst.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Erlaube Netz 192.168.10.0/24 HTTP-Zugriff auf Server 10.10.10.10 mit Extended ACL 110."',
      expectedLines: [
        'access-list 110 permit tcp 192.168.10.0 0.0.0.255 host 10.10.10.10 eq 80',
      ],
      explanation: 'Extended ACL: tcp, Source mit Wildcard, host als Destination, eq 80.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Binde ACL 110 an g0/0 in eingehender Richtung an."',
      expectedLines: [
        'interface g0/0',
        'ip access-group 110 in',
      ],
      explanation: 'ip access-group <ACL> in im Interface-Kontext.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Nur das Managementnetz 192.168.99.0/24 darf den Router per SSH administrieren. ACL 10 ist passend."',
      expectedLines: [
        'line vty 0 15',
        'access-class 10 in',
      ],
      explanation: 'An VTY-Lines: access-class, nicht ip access-group.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Zeige mir alle ACLs mit Match-Zählern an."',
      expectedLines: [['show access-lists', 'sh access-lists']],
      explanation: 'show access-lists zeigt alle ACLs und ihre Regeln.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Füge in die Named Extended ACL WEB-ACCESS eine HTTPS-Regel für 192.168.10.0/24 → 10.10.10.10 zwischen ACE 10 und 20 ein."',
      expectedLines: [
        'ip access-list extended WEB-ACCESS',
        '15 permit tcp 192.168.10.0 0.0.0.255 host 10.10.10.10 eq 443',
      ],
      explanation: 'Named ACLs erlauben Einfügen mit Sequenznummern zwischen bestehenden ACEs.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Erstelle eine Named Standard ACL ADMINS, die 192.168.100.0/24 erlaubt und alles andere blockiert."',
      expectedLines: [
        'ip access-list standard ADMINS',
        'permit 192.168.100.0 0.0.0.255',
        'deny any',
      ],
      explanation: 'Named Standard ACL im ACL-Konfigurationsmodus mit permit und deny any.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Prüfe, ob auf g0/0 eine ACL gebunden ist und in welcher Richtung."',
      expectedLines: [['show ip interface g0/0', 'sh ip int g0/0']],
      explanation: '"show ip interface <IF>" zeigt die inbound/outbound gebundenen ACLs.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Zeige mir alle IPv4-ACLs mit ihren Match-Zählern an."',
      expectedLines: [['show ip access-lists', 'sh ip access-lists']],
      explanation: '"show ip access-lists" listet alle IPv4-ACLs mit Regeln und Match-Zählern.',
    },
  ];
}

export function buildCiscoAclLesson() {
  return {
    title: 'Access Control Lists',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
    summary: [
      'ACLs filtern Datenverkehr als geordnete Regelliste: First Match, dann stop.',
      'Am Ende jeder ACL wirkt implicit deny.',
      'Standard ACL: 1–99, 1300–1999, filtert nach Source.',
      'Extended ACL: 100–199, 2000–2699, filtert nach Protokoll, Source, Destination, Port.',
      'host = einzelne IP, any = beliebige IP.',
      'Bindung an Interface: ip access-group <ACL> in|out.',
      'Bindung an VTY: access-class <ACL> in.',
      'Pro Interface, Protokoll und Richtung nur eine IPv4-ACL.',
      'Standard ACL näher am Ziel, Extended ACL kann näher an der Quelle platziert werden.',
      'Named ACLs lassen sich mit Sequence Numbers editieren und resequence.',
      'Verifizieren: show access-lists, show ip access-lists, show running-config, show ip interface.',
    ],
  };
}
