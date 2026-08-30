import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Spanning Tree Protocol (PVST+)" - fills the catalog's existing
// `cisco-packet-tracer/stp` slot (re-chained to depend on "trunk" - see
// academyTopics.js). Builds on VLAN/Trunk knowledge: redundant switch-to-
// switch links are the whole reason STP exists. Covers Bridge ID/Root
// Bridge election, PVST+, port roles, path cost, port states/timers, the
// relevant Cisco IOS commands (root primary/secondary, PortFast, BPDU
// Guard) and verification/troubleshooting via show-commands.
// =============================================================================

export const CISCO_STP_TOPIC_KEY = topicKey('cisco-packet-tracer', 'stp');

const STP_TRIANGLE_SVG = `<svg viewBox="0 0 320 240" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">STP-Topologie</text><rect x="120" y="40" width="80" height="35" rx="5" fill="#00f0ff" opacity="0.9"/><text x="160" y="62" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">SW1 ROOT</text><rect x="30" y="160" width="80" height="35" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="70" y="182" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">SW2</text><rect x="210" y="160" width="80" height="35" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="250" y="182" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">SW3</text><line x1="135" y1="75" x2="75" y2="160" stroke="#00f0ff" stroke-width="3"/><text x="85" y="115" fill="#00f0ff" font-size="8" transform="rotate(-45 85 115)">FWD</text><line x1="185" y1="75" x2="245" y2="160" stroke="#00f0ff" stroke-width="3"/><text x="235" y="115" fill="#00f0ff" font-size="8" transform="rotate(45 235 115)">FWD</text><line x1="110" y1="178" x2="210" y2="178" stroke="#8b949e" stroke-width="3" stroke-dasharray="6,4"/><text x="160" y="170" text-anchor="middle" fill="#8b949e" font-size="8">BLK (Alternate)</text></svg>`;

const PORTFAST_BPDUGUARD_SVG = `<svg viewBox="0 0 320 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">PortFast + BPDU Guard</text><rect x="120" y="50" width="80" height="40" rx="5" fill="#00f0ff" opacity="0.9"/><text x="160" y="68" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">Switch</text><text x="160" y="83" text-anchor="middle" fill="#0a1628" font-size="7">Access Port</text><rect x="40" y="120" width="60" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="70" y="138" text-anchor="middle" fill="#c9d1d9" font-size="8">PC</text><line x1="100" y1="135" x2="120" y2="80" stroke="#00f0ff" stroke-width="2"/><text x="90" y="105" text-anchor="middle" fill="#00f0ff" font-size="7">PortFast OK</text><rect x="220" y="120" width="60" height="30" rx="4" fill="#ff7b72" opacity="0.35" stroke="#ff7b72" stroke-width="2"/><text x="250" y="138" text-anchor="middle" fill="#ff7b72" font-size="8">Switch</text><line x1="200" y1="135" x2="200" y2="90" stroke="#ff7b72" stroke-width="2"/><line x1="200" y1="90" x2="170" y2="90" stroke="#ff7b72" stroke-width="2"/><text x="235" y="105" text-anchor="middle" fill="#ff7b72" font-size="7">BPDU → err-disabled</text></svg>`;

const PVST_VLAN_SVG = `<svg viewBox="0 0 320 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">PVST+: eigener Baum pro VLAN</text><rect x="120" y="50" width="80" height="35" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="160" y="72" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">SW1</text><rect x="30" y="160" width="80" height="35" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="70" y="182" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">SW2</text><rect x="210" y="160" width="80" height="35" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="250" y="182" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">SW3</text><line x1="140" y1="85" x2="75" y2="160" stroke="#00f0ff" stroke-width="3"/><line x1="180" y1="85" x2="245" y2="160" stroke="#00f0ff" stroke-width="3"/><line x1="110" y1="178" x2="210" y2="178" stroke="#8b949e" stroke-width="3" stroke-dasharray="6,4"/><text x="160" y="105" text-anchor="middle" fill="#00f0ff" font-size="8">VLAN 10: SW1 Root</text><line x1="140" y1="115" x2="75" y2="160" stroke="#a371f7" stroke-width="2" stroke-dasharray="4,3"/><line x1="180" y1="115" x2="245" y2="160" stroke="#a371f7" stroke-width="2" stroke-dasharray="4,3"/><line x1="110" y1="193" x2="210" y2="193" stroke="#a371f7" stroke-width="2" stroke-dasharray="4,3"/><text x="160" y="145" text-anchor="middle" fill="#a371f7" font-size="8">VLAN 20: SW3 Root</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('problem-classic', 'Warum brauchen wir STP überhaupt?', 'classic', [
    { type: 'text', content: 'Redundante Verbindungen zwischen Switches sind grundsätzlich sinnvoll: fällt eine Leitung aus, bleibt das Netz über die zweite erreichbar. Ohne Schutzmechanismus leiten Switches Broadcasts aber an ALLE Ports weiter - bei einer Schleife (Loop) läuft ein Broadcast dann endlos im Kreis und vervielfacht sich bei jedem Umlauf.' },
    { type: 'question', question: 'Zwei Switches sind über zwei separate Kabel miteinander verbunden (redundant). Was passiert ohne STP, wenn ein Endgerät einen Broadcast sendet?', options: ['Nichts, Broadcasts werden ignoriert', 'Der Broadcast läuft in einer Schleife endlos zwischen den Switches um und vervielfacht sich - ein Broadcast-Storm', 'Nur einer der beiden Switches leitet ihn weiter', 'Die Verbindung wird automatisch getrennt'], correct: 1, explanation: 'Ohne STP leiten beide Switches den Broadcast über beide Verbindungen weiter - er läuft im Kreis und vervielfacht sich bei jedem Umlauf: ein Broadcast-Storm, der das Netz lahmlegt.' },
    { type: 'list', title: 'Typische Folgen eines Layer-2-Loops', items: [
      'Broadcast-Storm: Broadcasts vervielfachen sich exponentiell und überlasten die Bandbreite.',
      'MAC-Adresstabellen-Instabilität: Switches sehen dieselbe MAC-Adresse abwechselnd auf verschiedenen Ports.',
      'Mehrfachzustellung: Frames können mehrfach beim Empfänger ankommen.',
    ] },
    { type: 'text', content: 'STP (Spanning Tree Protocol) löst dieses Dilemma: Es lässt die Redundanz physisch bestehen, blockiert aber gezielt einzelne Ports logisch, bis daraus eine schleifenfreie Baumstruktur entsteht - fällt eine aktive Verbindung aus, aktiviert STP automatisch einen zuvor blockierten Ersatzweg.' },
  ]));

  exps.push(explanation('stp-topology-visual', 'STP-Topologie: Root, Designated, Alternate', 'visual', [
    { type: 'diagram', content: STP_TRIANGLE_SVG },
    { type: 'text', content: 'Die Root Bridge sitzt oben. Von dort aus wählt jeder weitere Switch den besten Pfad (Root Port, FWD). Verbleibende redundante Links werden blockiert (BLK), dienen aber als Alternate Path. Wichtig: Blocking bedeutet nicht defekt, sondern Schleifenvermeidung.' },
  ]));

  exps.push(explanation('bridge-id-classic', 'Bridge ID und die Wahl der Root Bridge', 'classic', [
    { type: 'text', content: 'STP baut zuerst eine Baumstruktur, indem alle Switches gemeinsam einen Switch als Wurzel (Root Bridge) bestimmen. Jeder Switch hat dafür eine Bridge ID aus zwei Teilen: Bridge Priority (Standard: 32768) und die MAC-Adresse des Switches.' },
    { type: 'table', headers: ['Bestandteil', 'Bedeutung'], rows: [
      ['Bridge Priority', 'Ein konfigurierbarer Zahlenwert, Standard 32768, nur in Schritten von 4096 änderbar (0, 4096, 8192, ... 61440).'],
      ['System-ID-Extension', 'Bei PVST+ wird die VLAN-ID zur Priority hinzugerechnet (z. B. Priority 32768 + VLAN 1 = 32769) - dazu gleich mehr.'],
      ['MAC-Adresse', 'Die eindeutige Hardware-Adresse des Switches, entscheidet als Tie-Breaker bei gleicher Priority.'],
    ] },
    { type: 'text', content: 'Regel: Die niedrigste Bridge ID gewinnt und wird Root Bridge. Bei gleicher Priority entscheidet die niedrigere MAC-Adresse.' },
    { type: 'question', question: 'Drei Switches haben folgende Bridge IDs (Priority.MAC): SW1 = 32769.0001.4354.1357, SW2 = 32769.0060.3456.789A, SW3 = 32769.0060.4567.89AB. Welcher wird Root Bridge und warum?', options: ['SW3, weil die MAC-Adresse am größten ist', 'SW1, weil bei gleicher Priority die kleinste MAC-Adresse gewinnt', 'SW2, weil er in der Mitte liegt', 'Es entscheidet der Zufall'], correct: 1, explanation: 'Alle drei haben dieselbe Priority (32769). Bei Gleichstand gewinnt die kleinste MAC-Adresse - das ist SW1 mit 0001.4354.1357.' },
  ]));

  exps.push(explanation('pvst-classic', 'Cisco PVST+ - ein Spanning Tree pro VLAN', 'classic', [
    { type: 'text', content: 'Der ursprüngliche IEEE-Standard 802.1D kennt nur EINEN Spanning Tree für das gesamte Netz. Cisco-Switches verwenden stattdessen standardmäßig PVST+ (Per-VLAN Spanning Tree Plus): jedes VLAN bekommt seinen EIGENEN Spanning-Tree-Baum, mit eigener Root-Bridge-Wahl und eigenen blockierten Ports.' },
    { type: 'list', title: 'Warum das sinnvoll ist', items: [
      'Ports, die für VLAN 10 blockiert sind, können trotzdem für VLAN 20 aktiv (weiterleitend) sein - die Redundanz wird pro VLAN unterschiedlich genutzt, statt komplett ungenutzt zu bleiben.',
      'Die Root Bridge kann pro VLAN unterschiedlich sein, z. B. SW1 als Root für VLAN 10, SW2 als Root für VLAN 20 - für Lastverteilung.',
    ] },
    { type: 'text', content: 'Deshalb spielt bei PVST+ die VLAN-ID in der Bridge ID eine Rolle: die "System Extension ID" addiert die VLAN-Nummer zur konfigurierten Priority. Bei Standard-Priority 32768 und VLAN 1 ergibt sich z. B. 32768 + 1 = 32769 - der Wert, der z. B. in "show spanning-tree" für VLAN 1 als Priority erscheint.' },
  ]));

  exps.push(explanation('pvst-visual', 'PVST+: unterschiedliche Bäume pro VLAN', 'visual', [
    { type: 'diagram', content: PVST_VLAN_SVG },
    { type: 'text', content: 'Mit PVST+ kann VLAN 10 SW1 als Root sehen und einen Port blockieren, während VLAN 20 SW3 als Root wählt und einen ganz anderen Port blockiert. Lastverteilung und Redundanz werden pro VLAN optimiert.' },
  ]));

  exps.push(explanation('portrollen-classic', 'Portrollen: Root Port, Designated Port, Alternate Port', 'classic', [
    { type: 'text', content: 'Nachdem die Root Bridge feststeht, bestimmt jeder Switch, wie seine eigenen Ports in der Baumstruktur eingeordnet werden.' },
    { type: 'table', headers: ['Portrolle', 'Bedeutung'], rows: [
      ['Root Port (RP)', 'Der EINE Port eines Switches mit dem besten (günstigsten) Pfad zur Root Bridge - genau einer pro Switch (außer auf der Root Bridge selbst).'],
      ['Designated Port (DP)', 'Ein weiterleitender Port auf einem Segment, der für dieses Segment den besten Weg zur Root Bridge repräsentiert. Auf der Root Bridge selbst sind alle aktiven Ports Designated Ports.'],
      ['Alternate / Non-Designated Port', 'Ein blockierter Port, der zwar physisch verbunden ist, aber nicht weiterleitet - er dient als Ersatzweg, falls der aktive Pfad ausfällt.'],
    ] },
    { type: 'list', title: 'Vereinfachter Entscheidungsablauf', items: [
      '1. Root Bridge bestimmen (niedrigste Bridge ID).',
      '2. Root Ports bestimmen: jeder Nicht-Root-Switch wählt seinen Port mit dem günstigsten Pfad zur Root Bridge.',
      '3. Designated Ports bestimmen: pro Segment der Port mit dem besten Weg zur Root Bridge.',
      '4. Alle übrigen Ports werden Alternate / Non-Designated (blockierend).',
    ] },
    { type: 'question', question: 'Welche Portrolle haben grundsätzlich alle aktiven Ports auf der Root Bridge selbst?', options: ['Root Port', 'Alternate Port', 'Designated Port', 'Sie haben keine Rolle'], correct: 2, explanation: 'Die Root Bridge hat keinen Root Port (sie ist ja selbst die Wurzel) - ihre aktiven Ports sind immer Designated Ports.' },
  ]));

  exps.push(explanation('path-cost-classic', 'Path Cost: den günstigsten Weg zur Root Bridge finden', 'classic', [
    { type: 'text', content: 'Um den "besten" Pfad zur Root Bridge zu bestimmen, summiert STP die Path Cost jeder Verbindung auf dem Weg. Schnellere Verbindungen bekommen dabei einen NIEDRIGEREN Kostenwert.' },
    { type: 'table', headers: ['Verbindungsgeschwindigkeit', 'Path Cost'], rows: [
      ['100 Mbit/s (FastEthernet)', '19'],
      ['1000 Mbit/s (GigabitEthernet)', '4'],
    ] },
    { type: 'text', content: 'Die Kosten aller Verbindungen entlang eines Pfads zur Root Bridge werden aufsummiert. Der Pfad mit der niedrigsten Gesamtsumme gewinnt - auch wenn er dafür über mehr Zwischenstationen läuft.' },
    { type: 'question', question: 'Ein Switch hat zwei mögliche Pfade zur Root Bridge: Pfad A führt über eine einzelne 100-Mbit/s-Verbindung (Cost 19). Pfad B führt über zwei hintereinander liegende 1000-Mbit/s-Verbindungen (je Cost 4). Welcher Pfad wird gewählt?', options: ['Pfad A, weil er weniger Zwischenstationen hat', 'Pfad B, weil 4 + 4 = 8 günstiger ist als 19', 'Beide Pfade gleichzeitig', 'Der Pfad mit der höheren Portnummer'], correct: 1, explanation: 'Pfad B kostet in Summe 4 + 4 = 8, Pfad A kostet 19. Trotz zwei Verbindungen ist Pfad B günstiger und wird als Root Port gewählt.' },
  ]));

  exps.push(explanation('portzustaende-classic', 'Portzustände und Timer', 'classic', [
    { type: 'text', content: 'Ein STP-Port durchläuft nach dem Verbinden nicht sofort den weiterleitenden Zustand, sondern mehrere Zwischenzustände - das kostet Zeit (Konvergenz), verhindert aber, dass ein Port versehentlich für kurze Zeit eine Schleife öffnet.' },
    { type: 'table', headers: ['Zustand', 'Was passiert'], rows: [
      ['Blocking', 'Der Port empfängt nur BPDUs (STP-Kontrollnachrichten), leitet aber keine Daten weiter.'],
      ['Listening', 'Der Port beginnt, an der STP-Berechnung teilzunehmen, leitet aber noch keine Daten weiter (typisch 15 Sekunden).'],
      ['Learning', 'Der Port lernt bereits MAC-Adressen, leitet aber weiterhin keine Daten weiter (typisch 15 Sekunden).'],
      ['Forwarding', 'Der Port leitet normal Daten weiter - der eigentliche Betriebszustand.'],
      ['Disabled', 'Der Port ist administrativ abgeschaltet (shutdown) und nimmt nicht an STP teil.'],
    ] },
    { type: 'text', content: 'Eine vollständige Konvergenz nach einer Topologieänderung kann bei klassischem STP daher rund 30-50 Sekunden dauern - ein Grund, warum PortFast (siehe unten) für Endgeräte-Ports so wichtig ist.' },
    { type: 'question', question: 'Ein PC wird an einen neuen Switch-Port angeschlossen. Warum bekommt er bei klassischem STP für einige Sekunden keine IP-Adresse per DHCP, obwohl das Kabel korrekt steckt?', options: ['Der DHCP-Server ist ausgefallen', 'Der Port durchläuft erst Listening und Learning, bevor er in den Forwarding-Zustand wechselt und Daten (also auch DHCP-Anfragen) weiterleitet', 'Das Kabel ist zu lang', 'STP hat mit DHCP nichts zu tun'], correct: 1, explanation: 'Solange der Port nicht im Forwarding-Zustand ist, werden keine Daten weitergeleitet - auch keine DHCP-Anfragen. Das erklärt die anfängliche Verzögerung.' },
  ]));

  exps.push(explanation('root-konfigurieren-classic', 'Root Bridge gezielt festlegen', 'classic', [
    { type: 'text', content: 'In der Praxis überlässt man die Root-Bridge-Wahl nicht dem Zufall der MAC-Adressen, sondern legt gezielt fest, welcher (meist zentrale, leistungsfähige) Switch die Root Bridge sein soll.' },
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['spanning-tree vlan <VLAN-ID> priority <Priority>', 'Setzt die Priority für ein bestimmtes VLAN direkt auf einen Wert (0-61440, in 4096er-Schritten).'],
      ['spanning-tree vlan <VLAN-ID> root primary', 'Komfort-Befehl: senkt die Priority automatisch so weit, dass dieser Switch Root Bridge für das VLAN wird.'],
      ['spanning-tree vlan <VLAN-ID> root secondary', 'Setzt eine niedrige, aber nicht die niedrigste Priority - dieser Switch übernimmt die Root-Rolle, falls die primäre Root Bridge ausfällt.'],
    ] },
    { type: 'list', title: 'Beispiel', items: [
      'Switch(config)# spanning-tree vlan 10 root primary',
      'Switch(config)# spanning-tree vlan 10 root secondary  (auf einem zweiten Switch)',
    ] },
  ]));

  exps.push(explanation('portfast-bpduguard-classic', 'PortFast und BPDU Guard', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['spanning-tree portfast', 'Überspringt auf einem Access-Port Listening/Learning und wechselt sofort in den Forwarding-Zustand - für Ports zu Endgeräten (PCs, Drucker), die selbst keine Loops erzeugen können.'],
      ['spanning-tree portfast trunk', 'Aktiviert PortFast auf einem Trunk-Port - nur als begründeter Sonderfall, z. B. bei Router on a Stick (ein Router-Subinterface hinter einem Trunk-Port ist kein Switch und erzeugt keine Schleife), NICHT für eine normale Switch-zu-Switch-Trunk-Verbindung.'],
      ['spanning-tree bpduguard enable', 'Deaktiviert (err-disabled) einen PortFast-Port sofort, falls auf ihm doch eine BPDU (STP-Nachricht) empfangen wird - das deutet auf einen versehentlich angeschlossenen Switch statt eines Endgeräts hin.'],
    ] },
    { type: 'text', content: 'PortFast darf NIEMALS auf einer echten Switch-zu-Switch-Verbindung aktiviert werden: Würde dort versehentlich eine Schleife entstehen, leitet der Port sofort weiter, ohne die schützenden STP-Zwischenzustände zu durchlaufen - das kann einen Broadcast-Storm auslösen. Genau dieses Risiko soll BPDU Guard absichern, indem er einen solchen Port automatisch deaktiviert.' },
    { type: 'question', question: 'Warum kombiniert man PortFast in der Praxis häufig mit BPDU Guard?', options: ['Damit der Port schneller wird', 'Damit ein Port, der eigentlich nur für ein Endgerät gedacht ist, automatisch abgeschaltet wird, falls doch ein Switch (und damit eine mögliche Schleife) angeschlossen wird', 'Weil beide Befehle technisch identisch sind', 'BPDU Guard ist für VLANs zuständig, PortFast für Trunks'], correct: 1, explanation: 'BPDU Guard schützt genau vor dem Risiko, das PortFast eingeht: Empfängt ein PortFast-Port eine BPDU (also ist dort doch ein Switch angeschlossen), wird er sofort deaktiviert.' },
  ]));

  exps.push(explanation('portfast-bpduguard-visual', 'PortFast + BPDU Guard am Edge-Port', 'visual', [
    { type: 'diagram', content: PORTFAST_BPDUGUARD_SVG },
    { type: 'text', content: 'PortFast ist für Endgeräte-Ports gedacht: der Port geht sofort in Forwarding. BPDU Guard sichert ihn ab, falls stattdessen ein Switch angeschlossen wird. Das ist die Standardkombination für Edge-Ports, nie für Switch-Uplinks.' },
  ]));

  exps.push(explanation('err-disabled-classic', 'err-disabled und BPDU Guard Recovery', 'classic', [
    { type: 'text', content: 'Wenn BPDU Guard auf einem PortFast-Port eine BPDU empfängt, legt er den Port in den Zustand "err-disabled". Der Port ist damit administrativ deaktiviert und leitet keine Daten weiter. Das ist ein Schutzmechanismus, kein Defekt.' },
    { type: 'list', title: 'Sauberes Recovery', items: [
      'Ursache beseitigen: angeschlossenes Gerät prüfen, BPDU-Quelle entfernen, ggf. PortFast/BPDU Guard nur auf echten Edge-Ports lassen.',
      'Interface mit "shutdown" abschalten.',
      'Interface mit "no shutdown" wieder aktivieren.',
      'Mit "show interfaces status" prüfen, ob der Port wieder "connected" statt "err-disabled" anzeigt.',
    ] },
    { type: 'question', question: 'Ein Port zeigt "err-disabled". Was darf NICHT die erste Maßnahme sein?', options: ['Ursache prüfen und beseitigen', 'sofort "shutdown" gefolgt von "no shutdown"', 'Prüfen, ob BPDU Guard ausgelöst hat', '"show interfaces status" betrachten'], correct: 1, explanation: 'Shutdown/no shutdown allein hilft nicht, wenn die Ursache weiterhin besteht - der Port wird ggf. sofort wieder err-disabled.' },
  ]));

  exps.push(explanation('verifizierung-classic', 'STP verifizieren und Ausgaben interpretieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Wofür'], rows: [
      ['show spanning-tree', 'Zeigt pro VLAN die Root Bridge, die eigene Bridge-Priority, sowie jeden Port mit Rolle (Root/Desg/Altn) und Status (FWD/BLK).'],
      ['show spanning-tree vlan <ID>', 'Zeigt den Spanning Tree nur für das angegebene VLAN - wichtig bei PVST+, da jeder VLAN eigene Root haben kann.'],
      ['show spanning-tree summary', 'Kompakte Übersicht: welche VLANs existieren, wie viele blockierte/weiterleitende Ports es gibt, ob PortFast/BPDU-Guard-Verstöße aufgetreten sind.'],
      ['show spanning-tree detail', 'Sehr ausführliche Ausgabe inkl. Timern, Path Cost und Anzahl der Topologieänderungen pro Port.'],
      ['show interfaces status', 'Zeigt u. a. den Port-Zustand: connected / notconnect / disabled / err-disabled. Wichtig für BPDU Guard Recovery.'],
    ] },
    { type: 'list', title: 'Beim Lesen einer Ausgabe klären', items: [
      'Wer ist Root Bridge? (Zeile "Root ID", ggf. "This bridge is the root")',
      'Welcher Port ist Root Port? (Rolle "Root" in der Portliste)',
      'Welche Ports sind Designated? (Rolle "Desg")',
      'Welcher Port ist blockiert/Alternate? (Rolle "Altn", Status "BLK")',
      'Welche Path Cost hat der Root Port? (Spalte "Cost")',
    ] },
    { type: 'question', question: 'In "show spanning-tree" siehst du bei einem Port die Rolle "Altn" und den Status "BLK". Was bedeutet das?', options: ['Der Port ist physisch defekt', 'Der Port ist ein Ersatzweg (Alternate Port) und blockiert aktuell den Datenverkehr, um eine Schleife zu verhindern', 'Der Port gehört zu keinem VLAN', 'Der Port ist die Root Bridge'], correct: 1, explanation: '"Altn"/"BLK" ist der normale, gewünschte Zustand eines Ersatzweg-Ports - er wird erst aktiv, falls der aktive Pfad ausfällt.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'STP verhindert Layer-2-Loops und Broadcast-Storms, ohne auf physische Redundanz zu verzichten.',
      'Root Bridge: niedrigste Bridge ID (Priority + MAC) gewinnt. Cisco PVST+: ein Baum PRO VLAN.',
      'Portrollen: Root Port (bester Weg zur Root), Designated Port (bester Weg pro Segment), Alternate/Non-Designated (blockiert).',
      'Port Role ≠ Port State: z. B. Alternate Port ist oft im Zustand Blocking.',
      'Path Cost: schnellere Verbindung = niedrigerer Wert (100 Mbit/s = 19, 1000 Mbit/s = 4), Kosten entlang des Pfads werden summiert.',
      'Root gezielt setzen: "spanning-tree vlan <ID> root primary/secondary" oder direkt über "priority".',
      'PortFast für Endgeräte-Ports beschleunigt die Konvergenz, BPDU Guard schützt dabei vor versehentlichen Switch-Loops.',
      'BPDU Guard setzt einen Port bei BPDU-Empfang in "err-disabled". Recovery: Ursache beseitigen, dann shutdown/no shutdown, verifizieren mit "show interfaces status".',
      'Verifizieren mit "show spanning-tree", "show spanning-tree vlan <ID>", "show spanning-tree summary", "show spanning-tree detail" und "show interfaces status".',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'stp-root-bridge-select',
      type: 'select-best',
      question: 'SW1 = 32769.0001.4354.1357, SW2 = 32769.0060.3456.789A, SW3 = 32769.0060.4567.89AB - welcher Switch wird Root Bridge?',
      options: ['SW1, wegen der kleinsten MAC-Adresse bei gleicher Priority', 'SW2', 'SW3, wegen der größten MAC-Adresse', 'Alle drei gleichzeitig'],
      correct: 0,
      explanation: 'Bei gleicher Priority (32769) entscheidet die kleinste MAC-Adresse - SW1 mit 0001.4354.1357.',
    },
    {
      id: 'stp-portrollen-matching',
      type: 'matching',
      question: 'Ordne jede Portrolle ihrer Bedeutung zu.',
      pairs: [
        { left: 'Root Port', leftLabel: 'Root Port', right: 'Bester Pfad eines Nicht-Root-Switches zur Root Bridge' },
        { left: 'Designated Port', leftLabel: 'Designated Port', right: 'Bester Weg zur Root Bridge auf einem Segment - weiterleitend' },
        { left: 'Alternate Port', leftLabel: 'Alternate Port', right: 'Blockierter Ersatzweg' },
      ],
      explanation: 'Root Port pro Switch, Designated Port pro Segment, alles andere wird Alternate/blockiert.',
    },
    {
      id: 'stp-path-cost-select',
      type: 'select-best',
      question: 'Pfad A: eine 100-Mbit/s-Verbindung (Cost 19). Pfad B: zwei 1000-Mbit/s-Verbindungen hintereinander (je Cost 4). Welcher Pfad wird zum Root Port?',
      options: ['Pfad A, da weniger Hops', 'Pfad B, da 4 + 4 = 8 günstiger als 19 ist', 'Beide sind gleich gut', 'Keiner, beide werden blockiert'],
      correct: 1,
      explanation: 'Die Summe der Path Costs entscheidet: Pfad B kostet 8, Pfad A kostet 19 - Pfad B gewinnt trotz zweier Hops.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'stp-root-primary-cli',
      type: 'cli-input',
      question: 'Konfiguriere Switch 1 für VLAN 10 als primäre Root Bridge.',
      expectedLines: ['spanning-tree vlan 10 root primary'],
      explanation: 'Der Komfort-Befehl "root primary" senkt die Priority automatisch so weit, dass dieser Switch Root Bridge wird.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'stp-root-secondary-cli',
      type: 'cli-input',
      question: 'Konfiguriere Switch 2 für VLAN 10 als Secondary Root (Backup, falls die primäre Root Bridge ausfällt).',
      expectedLines: ['spanning-tree vlan 10 root secondary'],
      explanation: '"root secondary" setzt eine niedrige, aber nicht die niedrigste Priority.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'stp-priority-cli',
      type: 'cli-input',
      question: 'Setze für VLAN 20 die Priority auf 4096 (statt des Komfort-Befehls "root primary").',
      expectedLines: ['spanning-tree vlan 20 priority 4096'],
      explanation: 'Direkte Priority-Vergabe: "spanning-tree vlan <ID> priority <Wert>".',
    },
    {
      startContext: 'Interface-Konfigurationsmodus',
      id: 'stp-portfast-bpduguard-cli',
      type: 'cli-input',
      question: 'Aktiviere auf dem aktuellen Access-Port (zu einem PC) sowohl PortFast als auch BPDU Guard.',
      expectedLines: ['spanning-tree portfast', 'spanning-tree bpduguard enable'],
      explanation: 'PortFast beschleunigt die Konvergenz, BPDU Guard schützt vor versehentlichen Switch-Loops auf demselben Port.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      id: 'stp-show-cli',
      type: 'cli-input',
      question: 'Zeig dir eine kompakte Übersicht über den Spanning-Tree-Status aller VLANs an.',
      hint: 'Es gibt eine kürzere Variante von "show spanning-tree" für eine Übersicht.',
      expectedLines: [['show spanning-tree summary', 'sh spanning-tree summary']],
      explanation: '"show spanning-tree summary" liefert die kompakte Übersicht über alle VLANs.',
    },
    {
      id: 'stp-role-vs-state-select',
      type: 'select-best',
      question: 'Ein Port hat die Rolle "Alternate" und den Status "Blocking". Was ist richtig?',
      options: ['Der Port ist defekt und muss ersetzt werden', 'Rolle und Zustand sind unterschiedlich: Alternate ist der Ersatzweg, Blocking der aktuelle Zustand', 'Alternate und Blocking bedeuten dasselbe', 'Der Port ist die Root Bridge'],
      correct: 1,
      explanation: 'Rolle (Alternate) beschreibt die Funktion im Spannbaum, Zustand (Blocking) beschreibt den aktuellen Weiterleitungszustand.',
    },
    {
      startContext: 'Interface-Konfigurationsmodus',
      id: 'stp-err-disabled-recovery-cli',
      type: 'cli-input',
      question: 'Nach Beseitigung der Ursache soll ein wegen BPDU Guard in "err-disabled" befindlicher Port wieder aktiviert werden. Gib die notwendigen Befehle an.',
      expectedLines: ['shutdown', 'no shutdown'],
      explanation: 'Nach Behebung der Ursache reicht auf dem Interface "shutdown" gefolgt von "no shutdown", um err-disabled zurückzusetzen.',
    },
    {
      id: 'stp-portfast-on-uplink-select',
      type: 'select-best',
      question: 'Ein Kollege hat "spanning-tree portfast" auf einem Switch-zu-Switch-Uplink aktiviert. Was ist die größte Gefahr?',
      options: ['Der Port wird langsamer', 'Bei einer Schleife wird sofort weitergeleitet - Broadcast-Storm-Risiko', 'BPDU Guard funktioniert nicht mehr', 'Der Trunk wird gelöscht'],
      correct: 1,
      explanation: 'PortFast überspringt Listening/Learning. Auf einem Uplink kann eine versehentliche Schleife sofort aktiv werden und einen Broadcast-Storm auslösen.',
    },
    {
      id: 'stp-pvst-per-vlan-root-select',
      type: 'select-best',
      question: 'Mit PVST+ kann es im selben physischen Netz sein, dass ...?',
      options: ['alle VLANs denselben Root haben müssen', 'VLAN 10 und VLAN 20 unterschiedliche Root Bridges haben', 'es nur einen blockierten Port gibt', 'STP nicht zwischen VLANs unterscheidet'],
      correct: 1,
      explanation: 'PVST+ berechnet pro VLAN einen eigenen Spanning Tree - daher können Root Bridges pro VLAN unterschiedlich sein.',
    },
    {
      id: 'stp-show-interfaces-status-select',
      type: 'select-best',
      question: 'Welcher Befehl zeigt dir sofort, ob ein Port wegen BPDU Guard im Zustand "err-disabled" ist?',
      options: ['show spanning-tree vlan 1', 'show interfaces status', 'show ip interface brief', 'show vlan brief'],
      correct: 1,
      explanation: '"show interfaces status" zeigt den Zustand "err-disabled" neben dem Port an.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was ist die Hauptaufgabe von STP?', options: ['Geschwindigkeit von Verbindungen erhöhen', 'Layer-2-Loops verhindern, während redundante Verbindungen physisch bestehen bleiben', 'IP-Adressen automatisch vergeben', 'VLANs zwischen Switches transportieren'], correct: 1, explanation: 'STP blockiert gezielt Ports, um Schleifen zu verhindern, ohne die physische Redundanz zu entfernen.' },
    { question: 'Woraus besteht die Bridge ID?', options: ['Nur aus der MAC-Adresse', 'Aus Priority und MAC-Adresse (bei PVST+ inkl. VLAN-Bezug)', 'Nur aus der IP-Adresse', 'Aus der Anzahl der Ports'], correct: 1, explanation: 'Die Bridge ID setzt sich aus Priority (inkl. VLAN-Anteil bei PVST+) und MAC-Adresse zusammen.' },
    { question: 'Was unterscheidet Cisco PVST+ vom ursprünglichen 802.1D-Standard?', options: ['PVST+ funktioniert nur mit Glasfaser', 'PVST+ berechnet einen eigenen Spanning Tree pro VLAN statt nur einen für das gesamte Netz', 'PVST+ braucht keine Root Bridge', 'Es gibt keinen Unterschied'], correct: 1, explanation: 'PVST+ = Per-VLAN Spanning Tree Plus - jedes VLAN hat seinen eigenen Baum.' },
    { question: 'Welche Path Cost hat laut Unterrichtsmodell eine 1000-Mbit/s-Verbindung?', options: ['19', '4', '100', '1'], correct: 1, explanation: '1000 Mbit/s (Gigabit) entspricht Path Cost 4, 100 Mbit/s entspricht Path Cost 19.' },
    { question: 'Welcher Befehl macht einen Switch für VLAN 30 gezielt zur primären Root Bridge?', options: ['spanning-tree vlan 30 priority 61440', 'spanning-tree vlan 30 root primary', 'spanning-tree root vlan 30', 'ip root primary vlan 30'], correct: 1, explanation: '"spanning-tree vlan 30 root primary" ist der Komfort-Befehl dafür - eine hohe Priority (61440) würde im Gegenteil die Chancen auf die Root-Rolle verschlechtern.' },
    { question: 'Warum sollte "spanning-tree portfast" nicht auf einer normalen Switch-zu-Switch-Verbindung aktiviert werden?', options: ['Weil PortFast dort langsamer ist', 'Weil ein PortFast-Port sofort weiterleitet, ohne die schützenden STP-Zwischenzustände zu durchlaufen - bei einer Schleife droht ein Broadcast-Storm', 'Weil PortFast nur mit VLAN 1 funktioniert', 'Weil PortFast Trunks automatisch deaktiviert'], correct: 1, explanation: 'PortFast ist nur für Endgeräte-Ports gedacht, die selbst keine Schleifen erzeugen können.' },
    { question: 'Was macht "spanning-tree bpduguard enable"?', options: ['Verschlüsselt BPDUs', 'Deaktiviert einen PortFast-Port automatisch, sobald er eine BPDU empfängt', 'Erhöht die Path Cost', 'Aktiviert PVST+'], correct: 1, explanation: 'BPDU Guard schützt PortFast-Ports vor versehentlich angeschlossenen Switches (und damit Loops).' },
    { question: 'In "show spanning-tree" hat ein Port die Rolle "Root". Was bedeutet das?', options: ['Der Port ist blockiert', 'Es ist der beste Pfad dieses Switches zur Root Bridge', 'Der Port gehört zur Root Bridge selbst', 'Der Port hat keine STP-Funktion'], correct: 1, explanation: 'Der Root Port ist der beste (günstigste) Pfad EINES Switches zur Root Bridge.' },
    { question: 'Was bedeutet "Altn" / "BLK" in der Ausgabe von "show spanning-tree"?', options: ['Der Port ist defekt', 'Es handelt sich um einen blockierten Ersatzweg (Alternate Port)', 'Der Port ist der Root Port', 'Der Port ist auf der Root Bridge'], correct: 1, explanation: 'Alternate ist die Rolle, Blocking der Zustand: ein physisch vorhandener, aber blockierter Ersatzweg.' },
    { question: 'Warum sollte man PortFast NICHT auf einem normalen Switch-zu-Switch-Uplink aktivieren?', options: ['Weil er zu langsam wird', 'Weil der Port sofort Forwarding ohne schützende STP-Zwischenzustände eingeht und Schleifen unmittelbar aktiv werden', 'Weil Trunks kein PortFast unterstützen', 'Weil BPDU Guard dann nicht funktioniert'], correct: 1, explanation: 'PortFast überspringt Listening/Learning - auf Uplinks gefährlich, falls eine Schleife entsteht.' },
    { question: 'Ein Port zeigt "err-disabled". Was ist die richtige Reihenfolge?', options: ['shutdown / no shutdown, dann Ursache suchen', 'Ursache beseitigen, dann shutdown / no shutdown', 'Sofort neuen Port konfigurieren', 'BPDU Guard global deaktivieren'], correct: 1, explanation: 'Zuerst muss die Ursache behoben werden, sonst wird der Port nach shutdown/no shutdown sofort wieder err-disabled.' },
    { question: 'Warum kann VLAN 10 in einem PVST+-Netz eine andere Root Bridge haben als VLAN 20?', options: ['Weil PVST+ pro VLAN einen eigenen Spanning Tree berechnet', 'Weil VLANs unterschiedliche MAC-Adressen haben', 'Weil STP pro VLAN zufällig arbeitet', 'Das ist nicht möglich'], correct: 0, explanation: 'PVST+ berechnet pro VLAN einen eigenen Baum mit eigener Root-Bridge-Wahl.' },
    { question: 'Welcher Befehl zeigt am schnellsten, ob ein Port im Zustand "err-disabled" ist?', options: ['show spanning-tree', 'show interfaces status', 'show vlan brief', 'show ip interface brief'], correct: 1, explanation: '"show interfaces status" zeigt pro Port den Zustand, einschließlich "err-disabled".' },
  ];
}

function buildCliTasks() {
  return [
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Setze für VLAN 30 die Priority direkt auf 4096, ohne den Komfort-Befehl root primary zu benutzen."',
      expectedLines: ['spanning-tree vlan 30 priority 4096'],
      explanation: 'Direkte Priority-Vergabe: "spanning-tree vlan <ID> priority <Wert>" (nur in 4096er-Schritten gültig).',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Setze Switch 2 für VLAN 20 als Secondary Root."',
      expectedLines: ['spanning-tree vlan 20 root secondary'],
      explanation: 'Secondary Root übernimmt die Root-Rolle automatisch, falls die primäre Root Bridge ausfällt.',
    },
    {
      startContext: 'Interface-Konfigurationsmodus',
      prompt: 'Sam: "Aktiviere PortFast und BPDU Guard auf diesem Access-Port zu einem PC."',
      expectedLines: ['spanning-tree portfast', 'spanning-tree bpduguard enable'],
      explanation: 'PortFast für schnelle Konvergenz, BPDU Guard als Schutz vor einem versehentlich angeschlossenen Switch.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Zeig mir kurz, wer aktuell Root Bridge ist und welche Ports blockiert sind."',
      expectedLines: [['show spanning-tree', 'sh spanning-tree']],
      explanation: '"show spanning-tree" zeigt die Root Bridge (Root ID) sowie Rolle und Status jedes Ports (u. a. "Altn"/"BLK" für blockierte Ports).',
    },
  ];
}

export function buildCiscoStpLesson() {
  return {
    title: 'Spanning Tree Protocol (PVST+)',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
