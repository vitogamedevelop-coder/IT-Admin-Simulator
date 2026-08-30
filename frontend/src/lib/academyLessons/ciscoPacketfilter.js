import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Paketfilter" - fills the catalog's `cisco-packet-tracer/packet-filter` slot.
// Builds directly on the ACL lesson. Covers stateless (ACL-based) and stateful
// (Cisco CBAC / ip inspect) packet filtering, rule processing, return traffic,
// verification and troubleshooting. All content is data-driven for later reuse.
// =============================================================================

export const CISCO_PACKETFILTER_TOPIC_KEY = topicKey('cisco-packet-tracer', 'packet-filter');

const PF_STATELESS_SVG = `<svg viewBox="0 0 340 220" class="w-full h-auto max-h-56" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Stateless Filter: Request und Reply getrennt</text><rect x="20" y="80" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="60" y="105" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">Client</text><rect x="240" y="80" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="280" y="105" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">Server</text><rect x="135" y="75" width="70" height="50" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="95" text-anchor="middle" fill="#0a1628" font-size="8" font-weight="bold">Router</text><text x="170" y="110" text-anchor="middle" fill="#0a1628" font-size="7">ACL stateless</text><line x1="100" y1="90" x2="135" y2="90" stroke="#00f0ff" stroke-width="2"/><polygon points="125,85 125,95 135,90" fill="#00f0ff"/><text x="117" y="80" text-anchor="middle" fill="#8b949e" font-size="7">HTTP req</text><line x1="205" y1="90" x2="240" y2="90" stroke="#00f0ff" stroke-width="2"/><polygon points="230,85 230,95 240,90" fill="#00f0ff"/><text x="170" y="135" text-anchor="middle" fill="#c9d1d9" font-size="9">Antwort braucht eigene ACL-Regel</text><line x1="240" y1="115" x2="135" y2="115" stroke="#ff7b72" stroke-width="2" stroke-dasharray="5,3"/><polygon points="145,110 145,120 135,115" fill="#ff7b72"/><text x="190" y="130" text-anchor="middle" fill="#ff7b72" font-size="7">HTTP reply</text><text x="170" y="175" text-anchor="middle" fill="#c9d1d9" font-size="9">Filter kennt keinen Verbindungszustand</text><text x="170" y="195" text-anchor="middle" fill="#8b949e" font-size="8">KEIN SESSION STATE</text></svg>`;

const PF_SPI_SVG = `<svg viewBox="0 0 340 240" class="w-full h-auto max-h-60" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Stateful Inspection: Session merkt Antwort</text><rect x="20" y="80" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="60" y="105" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">Client</text><rect x="240" y="80" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="280" y="105" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">Server</text><rect x="135" y="70" width="70" height="60" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="90" text-anchor="middle" fill="#0a1628" font-size="8" font-weight="bold">Router</text><text x="170" y="105" text-anchor="middle" fill="#0a1628" font-size="7">ACL + SPI</text><rect x="145" y="115" width="50" height="12" rx="2" fill="#ffcc00" opacity="0.9"/><text x="170" y="124" text-anchor="middle" fill="#0a1628" font-size="6" font-weight="bold">Session</text><line x1="100" y1="90" x2="135" y2="90" stroke="#00f0ff" stroke-width="2"/><polygon points="125,85 125,95 135,90" fill="#00f0ff"/><text x="117" y="80" text-anchor="middle" fill="#8b949e" font-size="7">HTTP req</text><line x1="205" y1="90" x2="240" y2="90" stroke="#00f0ff" stroke-width="2"/><polygon points="230,85 230,95 240,90" fill="#00f0ff"/><line x1="240" y1="120" x2="205" y2="120" stroke="#00f0ff" stroke-width="2"/><polygon points="215,115 215,125 205,120" fill="#00f0ff"/><text x="222" y="140" text-anchor="middle" fill="#00f0ff" font-size="7">HTTP reply</text><text x="170" y="175" text-anchor="middle" fill="#c9d1d9" font-size="9">Antwort passt zur gespeicherten Session</text><text x="170" y="195" text-anchor="middle" fill="#c9d1d9" font-size="9">und wird temporär erlaubt</text><text x="170" y="220" text-anchor="middle" fill="#8b949e" font-size="8">Timeout / Verbindungsende → Session weg</text></svg>`;

const PF_BINDING_SVG = `<svg viewBox="0 0 340 200" class="w-full h-auto max-h-52" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">ACL + SPI: entgegengesetzte Flussrichtung</text><rect x="20" y="70" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="60" y="95" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">LAN</text><rect x="240" y="70" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="280" y="95" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">WAN</text><rect x="130" y="55" width="80" height="70" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="75" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">Router</text><text x="170" y="90" text-anchor="middle" fill="#0a1628" font-size="7">g0/1</text><line x1="100" y1="85" x2="130" y2="85" stroke="#00f0ff" stroke-width="2"/><polygon points="120,80 120,90 130,85" fill="#00f0ff"/><line x1="210" y1="85" x2="240" y2="85" stroke="#00f0ff" stroke-width="2"/><polygon points="230,80 230,90 240,85" fill="#00f0ff"/><text x="170" y="35" text-anchor="middle" fill="#ffcc00" font-size="8">SPI: out (beobachtet ausgehenden Verkehr)</text><text x="170" y="150" text-anchor="middle" fill="#ff7b72" font-size="8">ACL: in (blockiert eingehenden Verkehr grundsätzlich)</text></svg>`;

const PF_ESTABLISHED_SVG = `<svg viewBox="0 0 320 180" class="w-full h-auto max-h-52" xmlns="http://www.w3.org/2000/svg"><text x="160" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">established prüft TCP-Flags, speichert aber keinen State</text><rect x="40" y="70" width="100" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="90" y="95" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">Server</text><text x="90" y="120" text-anchor="middle" fill="#8b949e" font-size="7">ACK/RST erlaubt</text><rect x="200" y="70" width="80" height="40" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="240" y="95" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">Internet</text><line x1="140" y1="85" x2="200" y2="85" stroke="#ffcc00" stroke-width="2"/><polygon points="190,80 190,90 200,85" fill="#ffcc00"/><text x="170" y="80" text-anchor="middle" fill="#ffcc00" font-size="7">ACK</text><text x="160" y="150" text-anchor="middle" fill="#c9d1d9" font-size="9">Keine echten Session-State</text><text x="160" y="170" text-anchor="middle" fill="#ff7b72" font-size="8">established ≠ Stateful Inspection</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------------
  // 1. Was ist ein Paketfilter?
  // ---------------------------------------------------------------------------
  exps.push(explanation('intro-classic', 'Was ist ein Paketfilter?', 'classic', [
    { type: 'text', content: 'Ein Paketfilter ist ein Sicherheitsmechanismus, der Datenpakete anhand von Regeln entweder weiterleitet oder verwirft. Auf Cisco-Geräten werden Paketfilter typischerweise mit Access Control Lists (ACLs) und optional mit Stateful Inspection umgesetzt.' },
    { type: 'list', title: 'Was wird gefiltert?', items: [
      'Quell-IP und Ziel-IP',
      'Protokoll (z. B. tcp, udp, ip)',
      'Quell-Port und Ziel-Port',
      'Richtung (in/out bezogen auf das Interface)',
    ] },
  ]));

  // ---------------------------------------------------------------------------
  // 2. Statischer / Stateless Paketfilter
  // ---------------------------------------------------------------------------
  exps.push(explanation('stateless-classic', 'Statischer Paketfilter', 'classic', [
    { type: 'text', content: 'Ein statischer oder stateless Paketfilter entscheidet für jedes Paket allein anhand der konfigurierten Regeln. Er kennt keine vorherigen Pakete und merkt sich keinen Verbindungszustand. Auf unserem Cisco-Lehrniveau basiert der statische Filter auf Extended ACLs.' },
    { type: 'list', title: 'Beispiel: Extended ACL für statisches Filtern', items: [
      'ip access-list extended OUTBOUND',
      ' permit tcp 192.168.10.0 0.0.0.255 any eq 80',
      ' deny ip any any',
    ] },
    { type: 'text', content: 'Diese ACL erlaubt HTTP aus dem internen Netz und blockiert alles andere. Jede Regel wird isoliert betrachtet.' },
    { type: 'question', question: 'Worauf basiert ein statischer Paketfilter auf Cisco-Geräten in diesem Lehrgang?', options: ['Routen', 'ACLs', 'NAT', 'Spanning Tree'], correct: 1, explanation: 'Statische Paketfilter in diesem Lehrgang werden über ACLs realisiert.' },
  ]));

  exps.push(explanation('stateless-visual', 'Stateless Filter: Request und Reply getrennt', 'visual', [
    { type: 'diagram', content: PF_STATELESS_SVG },
    { type: 'text', content: 'Ein stateless Filter entscheidet pro Paket isoliert. Die HTTP-Anfrage wird anhand der ACL erlaubt, die Antwort benötigt eine separate Regel - der Filter weiß nicht, dass sie zur gleichen Verbindung gehört.' },
  ]));

  // ---------------------------------------------------------------------------
  // 3. Abarbeitung der Filterregeln
  // ---------------------------------------------------------------------------
  exps.push(explanation('first-match-classic', 'Abarbeitung: First Match', 'classic', [
    { type: 'text', content: 'Paketfilter arbeiten ihre Regeln der Reihe nach ab. Sobald eine Regel passt, wird die Aktion ausgeführt und die restlichen Regeln übersprungen. Trifft keine Regel, greift der implicit deny am Ende.' },
    { type: 'list', title: 'Beispiel-ACL', items: [
      '10 permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.10 eq 80',
      '20 deny ip any host 10.0.0.10',
      '30 permit ip any any',
    ] },
    { type: 'text', content: 'Traffic 192.168.10.25 → 10.0.0.10 TCP 80 trifft Regel 10: permit. Traffic 192.168.20.5 → 10.0.0.10 TCP 80 passt nicht zu Regel 10, Regel 20 passt: deny.' },
    { type: 'question', question: 'Warum ist die Reihenfolge der Regeln in einem Paketfilter entscheidend?', options: ['Weil sie die Geschwindigkeit bestimmt', 'Weil beim ersten Treffer die Auswertung stoppt', 'Weil sie alphabetisch sortiert sein muss', 'Weil der Router die letzte Regel bevorzugt'], correct: 1, explanation: 'First Match bedeutet: die erste passende Regel gewinnt, danach wird nicht mehr geprüft.' },
  ]));

  // ---------------------------------------------------------------------------
  // 4. Statischen Paketfilter konfigurieren
  // ---------------------------------------------------------------------------
  exps.push(explanation('stateless-config-classic', 'Statischen Paketfilter konfigurieren', 'classic', [
    { type: 'text', content: 'Der statische Paketfilter wird erstellt und anschließend an ein Layer-3-Interface gebunden. Dabei müssen Source, Destination, Protokoll, Port, Interface und Richtung passen.' },
    { type: 'list', title: 'Beispiel: HTTP aus dem internen Netz erlauben', items: [
      'ip access-list extended OUTBOUND',
      ' permit tcp 192.168.10.0 0.0.0.255 any eq 80',
      ' deny ip any any',
      'interface g0/1',
      ' ip access-group OUTBOUND out',
    ] },
    { type: 'text', content: 'out bedeutet aus Sicht des Interfaces/ Routers: Pakete verlassen den Router über g0/1. Die Regeln gelten also für Verkehr, der ins Internet geht.' },
  ]));

  // ---------------------------------------------------------------------------
  // 5. Probleme statischer Paketfilter
  // ---------------------------------------------------------------------------
  exps.push(explanation('stateless-problems-classic', 'Probleme statischer Paketfilter', 'classic', [
    { type: 'text', content: 'Ein statischer Paketfilter merkt sich keine Verbindung. Wenn ein interner Client einen Server im Internet kontaktiert, weiß der Filter beim Rückverkehr nicht, dass dieses Antwortpaket zu einer erlaubten Anfrage gehört.' },
    { type: 'list', title: 'Typische Probleme', items: [
      'Rückverkehr muss separat erlaubt werden.',
      'Regelwerke werden schnell größer und unübersichtlicher.',
      'Zu weit gefasste Freigaben entstehen leicht.',
      'Hoher manueller Pflegeaufwand.',
    ] },
    { type: 'text', content: 'Statische Paketfilter sind nicht grundsätzlich schlecht - für einfache Szenarien sind sie nach wie vor sinnvoll. Ihre Grenze liegt beim Verbindungszustand.' },
    { type: 'question', question: 'Was ist das Hauptproblem eines statischen Paketfilters beim Rückverkehr?', options: ['Er ist zu langsam', 'Er weiß nicht, dass das Antwortpaket zu einer erlaubten Anfrage gehört', 'Er kann keine Ports filtern', 'Er funktioniert nur bei TCP'], correct: 1, explanation: 'Ein stateless Filter hat keinen Verbindungszustand und erkennt die Antwort nicht automatisch.' },
  ]));

  // ---------------------------------------------------------------------------
  // 6. Dynamischer / Stateful Paketfilter
  // ---------------------------------------------------------------------------
  exps.push(explanation('stateful-classic', 'Dynamischer Paketfilter', 'classic', [
    { type: 'text', content: 'Ein dynamischer oder stateful Paketfilter berücksichtigt den Zustand einer Verbindung. Wenn ein interner Client eine Verbindung nach außen aufbaut, merkt sich der Router diese Sitzung. Der Rückverkehr zu dieser Sitzung wird automatisch zugelassen.' },
    { type: 'list', title: 'Ablauf', items: [
      'Client initiiert Verbindung nach außen.',
      'Paketfilter erlaubt ausgehenden Verkehr.',
      'Stateful Inspection speichert die Sitzung.',
      'Antwortpaket kommt zurück.',
      'Paketfilter erkennt die Sitzung und lässt die Antwort durch.',
    ] },
    { type: 'text', content: 'Der entscheidende Unterschied ist nicht „mehr Regeln“, sondern die Session-Verwaltung.' },
  ]));

  exps.push(explanation('stateful-visual', 'Stateful Inspection: Session merkt Antwort', 'visual', [
    { type: 'diagram', content: PF_SPI_SVG },
    { type: 'text', content: 'Beim Stateful Inspection speichert der Router den Zustand der ausgehenden Anfrage. Passt die Antwort zu dieser Session, wird sie temporär erlaubt. Nach Timeout oder Verbindungsende verschwindet die Session wieder.' },
  ]));

  // ---------------------------------------------------------------------------
  // 7. Cisco CBAC / ip inspect
  // ---------------------------------------------------------------------------
  exps.push(explanation('cbac-classic', 'Cisco Stateful Inspection mit ip inspect', 'classic', [
    { type: 'text', content: 'Cisco bietet mit CBAC (Context-Based Access Control) eine klassische Stateful Inspection für IOS. Über den Befehl ip inspect wird eine Inspection Rule definiert, die auf einem Interface in der passenden Richtung angewendet wird. Für unseren Lehrgang verwenden wir ip inspect für tcp und udp.' },
    { type: 'list', title: 'Beispiel: Inspection Rule definieren', items: [
      'ip inspect name INTERNET tcp',
      'ip inspect name INTERNET udp',
    ] },
    { type: 'list', title: 'Beispiel: Inspection Rule anwenden', items: [
      'interface g0/1',
      ' ip inspect INTERNET out',
    ] },
    { type: 'text', content: 'Wichtig: ip inspect überwacht den erlaubten ausgehenden Verkehr und erstellt temporäre Einträge für den passenden Rückverkehr. Eine ACL wird weiterhin benötigt, um den ausgehenden Verkehr grundsätzlich zu erlauben.' },
    { type: 'question', question: 'Wofür steht CBAC?', options: ['Cisco Basic Access Control', 'Context-Based Access Control', 'Cisco Border Access Control', 'Core-Based Access Control'], correct: 1, explanation: 'CBAC steht für Context-Based Access Control - klassische Cisco IOS Stateful Inspection.' },
  ]));

  exps.push(explanation('established-classic', 'Das established-Keyword', 'classic', [
    { type: 'text', content: 'In Extended ACLs kann man TCP-Paketen mit dem Keyword established erlauben, wenn sie ACK- oder RST-Flags gesetzt haben. Das ist praktisch, um Antwortverkehr zu ermöglichen, ohne jeden möglichen Quellport öffnen zu müssen.' },
    { type: 'text', content: 'Wichtig: established prüft lediglich TCP-Flags. Es speichert keine echte Verbindungstabelle und weiß nicht, ob die fragliche Verbindung tatsächlich aktiv war. Das ist keine vollständige Stateful Inspection.' },
    { type: 'list', title: 'Vergleich', items: [
      'established: Flag-basierte Annäherung, kein gespeicherter State.',
      'CBAC / ip inspect: Merkt sich Sessions und erlaubt passenden Rückverkehr temporär.',
    ] },
    { type: 'question', question: 'Was ist der wichtigste Unterschied zwischen established und echter Stateful Inspection?', options: ['established speichert Sessions, CBAC nicht', 'established prüft TCP-Flags, CBAC verwaltet echte Session-Zustände', 'established funktioniert nur bei UDP'], correct: 1, explanation: 'established ist ein Flag-Check in ACLs; Stateful Inspection merkt sich Verbindungen und erlaubt passenden Rückverkehr temporär.' },
  ]));

  exps.push(explanation('established-visual', 'established: Flag-Check, kein Session State', 'visual', [
    { type: 'diagram', content: PF_ESTABLISHED_SVG },
    { type: 'text', content: 'established erlaubt TCP-Pakete mit ACK/RST-Flags, ohne einen echten Verbindungszustand zu speichern. Das ist praktisch, aber keine Stateful Inspection.' },
  ]));

  // ---------------------------------------------------------------------------
  // 8. Zusammenspiel ACL und Inspection
  // ---------------------------------------------------------------------------
  exps.push(explanation('acl-inspect-classic', 'ACL + Inspection im Zusammenspiel', 'classic', [
    { type: 'text', content: 'ACL und Stateful Inspection arbeiten zusammen: die ACL legt fest, welcher Verkehr grundsätzlich erlaubt ist. Die Inspection Rule merkt sich die erlaubten Verbindungen und lässt den Rückverkehr passieren.' },
    { type: 'list', title: 'Beispiel: Kombinierte Konfiguration', items: [
      'ip access-list extended OUTBOUND',
      ' permit tcp 192.168.10.0 0.0.0.255 any eq 80',
      ' deny ip any any',
      'ip inspect name INTERNET tcp',
      'interface g0/1',
      ' ip access-group OUTBOUND out',
      ' ip inspect INTERNET out',
    ] },
    { type: 'text', content: 'Die ACL erlaubt HTTP aus dem internen Netz. ip inspect merkt sich die Sitzungen und lässt die Antwortpakete automatisch zurückkommen.' },
    { type: 'question', question: 'Welche Aufgabe hat die ACL im Zusammenspiel mit ip inspect?', options: ['Sie ersetzt ip inspect', 'Sie legt fest, welcher ausgehende Verkehr grundsätzlich erlaubt ist', 'Sie speichert die Sitzungen', 'Sie verifiziert den Rückverkehr'], correct: 1, explanation: 'Die ACL erlaubt den gewünschten ausgehenden Verkehr; ip inspect speichert den Zustand und erlaubt den Rückverkehr.' },
  ]));

  exps.push(explanation('binding-visual', 'ACL + SPI Binding-Richtung', 'visual', [
    { type: 'diagram', content: PF_BINDING_SVG },
    { type: 'text', content: 'ip inspect überwacht typischerweise den ausgehenden Verkehr (out) und merkt sich die Sessions. Eine ACL blockiert typischerweise eingehenden Verkehr (in), damit unerwünschter Traffic früh abgewiesen wird. Beide beziehen sich auf dasselbe Interface, aber auf entgegengesetzte Richtungen.' },
  ]));

  // ---------------------------------------------------------------------------
  // 9. Dynamische Einträge und Rückverkehr
  // ---------------------------------------------------------------------------
  exps.push(explanation('session-classic', 'Session und Rückverkehr', 'classic', [
    { type: 'text', content: 'Beim Stateful Inspection entstehen temporäre Zustandsinformationen. Diese sind nicht dauerhaft wie eine statische ACL-Regel. Nach Verbindungsende oder Timeout verschwinden sie wieder.' },
    { type: 'list', title: 'Merksatz', items: [
      'Statisch: dauerhaft konfigurierte Regel.',
      'Stateful: temporärer Zustand zu einer tatsächlichen Kommunikation.',
    ] },
    { type: 'text', content: 'Dadurch muss der Rückverkehr nicht mit einer breiten, dauerhaften eingehenden Regel erlaubt werden.' },
  ]));

  // ---------------------------------------------------------------------------
  // 10. Verifizieren
  // ---------------------------------------------------------------------------
  exps.push(explanation('verify-classic', 'Paketfilter verifizieren', 'classic', [
    { type: 'text', content: 'Nach der Konfiguration musst du prüfen, ob die ACL und die Inspection Rule korrekt gesetzt sind und ob aktive Sitzungen existieren.' },
    { type: 'table', headers: ['Befehl', 'Was zeigt er?'], rows: [
      ['show ip inspect config', 'Konfigurierte Inspection Rules und deren Richtungen.'],
      ['show ip inspect interfaces', 'Auf welchen Interfaces SPI in welcher Richtung aktiv ist.'],
      ['show ip inspect sessions', 'Aktive, inspizierte Sitzungen.'],
      ['show ip inspect statistics', 'Session-Anzahl, inspizierte Pakete und Timeouts.'],
      ['show access-lists', 'Alle ACLs mit Regeln und Match-Zählern.'],
      ['show ip interface g0/1', 'Gebundene ACL und Inspection auf dem Interface.'],
      ['show running-config', 'Gesamte Konfiguration.'],
    ] },
    { type: 'question', question: 'Welcher Befehl zeigt aktive Stateful-Inspection-Sitzungen?', options: ['show access-lists', 'show ip inspect sessions', 'show ip route', 'show ip interface'], correct: 1, explanation: 'show ip inspect sessions zeigt die aktiven, inspizierten Verbindungen.' },
  ]));

  // ---------------------------------------------------------------------------
  // 11. Fehlersuche
  // ---------------------------------------------------------------------------
  exps.push(explanation('troubleshooting-classic', 'Fehlersuche bei Paketfiltern', 'classic', [
    { type: 'text', content: 'Wenn Verkehr nicht funktioniert, prüfe systematisch die typischen Ursachen.' },
    { type: 'list', title: 'Häufige Fehler', items: [
      'ACL blockiert den Verkehr bereits (First Match, implicit deny).',
      'Inspection Rule fehlt oder wurde nicht auf dem richtigen Interface/Richtung angewendet.',
      'Falsches Interface oder falsche Richtung (in/out).',
      'Protokoll ist nicht in der Inspection Rule enthalten.',
      'Regelreihenfolge in der ACL ist falsch.',
      'Verbindung wurde bereits beendet, Sitzung ist abgelaufen.',
    ] },
    { type: 'question', question: 'Rückverkehr kommt nicht an, obwohl die ACL ausgehenden Verkehr erlaubt. Was prüfst du?', options: ['Ob die Inspection Rule auf dem richtigen Interface und in der richtigen Richtung aktiv ist', 'Ob der Switch aus ist', 'Ob das VLAN gelöscht wurde', 'Ob der Router einen Neustart braucht'], correct: 0, explanation: 'Für dynamischen Rückverkehr muss ip inspect auf dem Interface aktiv sein, über das der Verkehr das Gerät verlässt.' },
  ]));

  // ---------------------------------------------------------------------------
  // 12. Stateless vs. Stateful Vergleich
  // ---------------------------------------------------------------------------
  exps.push(explanation('comparison-classic', 'Stateless vs. Stateful im Vergleich', 'classic', [
    { type: 'table', headers: ['Stateless', 'Stateful'], rows: [
      ['Feste Regeln', 'Berücksichtigt Verbindungszustand'],
      ['Kein gespeicherter Verbindungszustand', 'Speichert initiierte Sessions'],
      ['Jedes Paket einzeln nach Regeln bewertet', 'Antworten zu bekannten Sessions werden zugelassen'],
      ['Rückverkehr muss im Regelwerk berücksichtigt werden', 'Temporäre Zustandsinformationen'],
      ['ACL-basiert', 'ACL + ip inspect'],
    ] },
    { type: 'question', question: 'Ein Client initiiert TCP-Verbindung zu einem Webserver. Ein Antwortpaket kommt zurück. Was unterscheidet die Entscheidung?', options: ['Stateless prüft nur die Antwort-ACL, Stateful erkennt die bekannte Session', 'Beide verhalten sich gleich', 'Stateful ignoriert die ACL', 'Stateless erlaubt immer den Rückverkehr'], correct: 0, explanation: 'Stateful merkt sich die ausgehende Verbindung und lässt die Antwort automatisch zu; Stateless bewertet das Antwortpaket anhand seiner Regeln.' },
  ]));

  // ---------------------------------------------------------------------------
  // 13. Zusammenfassung
  // ---------------------------------------------------------------------------
  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Ein Paketfilter entscheidet anhand von Regeln über Weiterleitung oder Verwerfen.',
      'Statisch/Stateless basiert auf ACLs; jede Regel wird isoliert geprüft.',
      'First Match: erste passende Regel gewinnt, implicit deny am Ende.',
      'Statische Paketfilter haben Probleme beim Rückverkehr.',
      'Dynamisch/Stateful merkt sich Verbindungen und erlaubt Rückverkehr automatisch.',
      'Cisco CBAC: ip inspect name <NAME> tcp/udp, dann ip inspect <NAME> out/in am Interface.',
      'ACL + ip inspect arbeiten zusammen: ACL erlaubt, ip inspect merkt sich Session.',
      'Dynamische Einträge sind temporär und verschwinden nach Timeout oder Verbindungsende.',
      'Verifizieren: show ip inspect config, show ip inspect sessions, show access-lists, show ip interface.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'packetfilter-stateless-stateful-select',
      type: 'select-best',
      question: 'Welche Aussage beschreibt einen Stateful Paketfilter?',
      options: [
        'Er prüft jedes Paket isoliert nach festen Regeln.',
        'Er merkt sich Verbindungen und erlaubt passenden Rückverkehr automatisch.',
        'Er funktioniert nur ohne ACL.',
        'Er filtert ausschließlich nach Source-IP.',
      ],
      correct: 1,
      explanation: 'Stateful Inspection speichert den Verbindungszustand und lässt Antwortpakete zu, ohne dass sie in der ACL extra erlaubt werden müssen.',
    },
    {
      id: 'packetfilter-return-select',
      type: 'select-best',
      question: 'Ein statischer Paketfilter soll ausgehenden HTTP erlauben. Warum ist Rückverkehr problematisch?',
      options: [
        'Weil der Router HTTP nicht versteht',
        'Weil der Filter nicht weiß, dass die Antwort zu einer erlaubten Anfrage gehört',
        'Weil er keine Wildcard Masken unterstützt',
        'Weil Stateful Inspection Pflicht ist'],
      correct: 1,
      explanation: 'Ein stateless Filter hat keinen Verbindungszustand, deshalb kann er eingehende Antworten nicht automatisch zuordnen.',
    },
    {
      id: 'packetfilter-rule-analysis-select',
      type: 'select-best',
      question: 'Gegeben: ip access-list extended OUTBOUND / permit tcp 192.168.10.0 0.0.0.255 any eq 80 / deny ip any any. Was passiert mit 192.168.10.25 → 203.0.113.10 TCP 80?',
      options: ['permit', 'deny', 'implicit deny', 'weiter geprüft'], correct: 0,
      explanation: 'Die erste Regel passt auf Quellnetz, TCP und Zielport 80: permit.',
    },
    {
      id: 'packetfilter-rule-analysis-2-select',
      type: 'select-best',
      question: 'Dieselbe ACL. Was passiert mit 192.168.10.25 → 203.0.113.10 TCP 443?',
      options: ['permit durch Regel 10', 'deny durch Regel 20', 'implicit deny', 'permit durch Regel 30'], correct: 1,
      explanation: 'Port 443 passt nicht zu eq 80, deshalb greift die deny-Regel.',
    },
    {
      id: 'packetfilter-inspect-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte zur Stateful-Inspection-Konfiguration in die richtige Reihenfolge.',
      items: [
        { id: 'acl', label: 'ACL für ausgehenden Verkehr erstellen' },
        { id: 'inspect', label: 'ip inspect name INTERNET tcp' },
        { id: 'interface', label: 'interface g0/1' },
        { id: 'bind', label: 'ip inspect INTERNET out + ip access-group OUTBOUND out' },
      ],
      correctOrder: ['acl', 'inspect', 'interface', 'bind'],
      explanation: 'Zuerst ACL, dann Inspection Rule, dann Interface und beide Bindungen.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'packetfilter-stateless-config',
      type: 'cli-input',
      question: 'Erlaube aus dem Netz 192.168.10.0/24 HTTP-Zugriff nach draußen mit einer statischen Extended ACL OUTBOUND.',
      expectedLines: [
        'ip access-list extended OUTBOUND',
        'permit tcp 192.168.10.0 0.0.0.255 any eq 80',
        'deny ip any any',
      ],
      explanation: 'Extended ACL: Protokoll, Source, Wildcard, Destination any, eq 80, deny ip any any.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'packetfilter-bind-interface',
      type: 'cli-input',
      question: 'Binde die ACL OUTBOUND und die Inspection Rule INTERNET an g0/1 in ausgehender Richtung.',
      expectedLines: [
        'interface g0/1',
        'ip access-group OUTBOUND out',
        'ip inspect INTERNET out',
      ],
      explanation: 'Beide Befehle werden im Interface-Kontext mit Richtung out angewendet.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      id: 'packetfilter-inspect-rule',
      type: 'cli-input',
      question: 'Erstelle eine Inspection Rule INTERNET, die TCP- und UDP-Sitzungen überwacht.',
      expectedLines: [
        'ip inspect name INTERNET tcp',
        'ip inspect name INTERNET udp',
      ],
      explanation: 'ip inspect name <NAME> <Protokoll> definiert die Protokolle, die inspiziert werden.',
    },
    {
      id: 'packetfilter-verify-select',
      type: 'select-best',
      question: 'Welcher Befehl zeigt aktive Inspection-Sitzungen an?',
      options: ['show access-lists', 'show ip inspect sessions', 'show ip route', 'show ip interface'], correct: 1,
      explanation: 'show ip inspect sessions listet die aktiven, inspizierten Verbindungen.',
    },
    {
      id: 'packetfilter-troubleshoot-select',
      type: 'select-best',
      question: 'Rückverkehr kommt nicht an, obwohl die ACL ausgehenden HTTP erlaubt. Was fehlt wahrscheinlich?',
      options: ['Eine Route', 'Eine Inspection Rule auf dem Interface in Richtung out', 'Eine bessere Subnetzmaske', 'Ein größerer Switch'], correct: 1,
      explanation: 'Ohne ip inspect merkt sich der Router keine Sitzung und lässt eingehende Antworten nicht automatisch zu.',
    },
    {
      id: 'packetfilter-comparison-matching',
      type: 'matching',
      question: 'Ordne die Eigenschaft dem passenden Filtertyp zu.',
      pairs: [
        { left: 'Stateless', leftLabel: 'Stateless', right: 'Kein gespeicherter Verbindungszustand' },
        { left: 'Stateful', leftLabel: 'Stateful', right: 'Temporäre Sessions für Rückverkehr' },
        { left: 'Beide', leftLabel: 'Beide', right: 'Werden an Interfaces gebunden' },
      ],
      explanation: 'Stateless basiert auf ACLs, Stateful merkt sich Verbindungen; beide müssen an Interfaces/VTYs gebunden werden.',
    },
    {
      id: 'packetfilter-established-select',
      type: 'select-best',
      question: 'Eine Extended ACL enthält "permit tcp any any established". Was gilt?',
      options: ['Das ist echte Stateful Inspection mit Session-Tabelle', 'Es werden TCP-Pakete mit ACK/RST erlaubt, ohne dass echte Sessions gespeichert werden', 'Es funktioniert auch für UDP'], correct: 1,
      explanation: 'established prüft TCP-Flags, speichert aber keine echte Verbindungstabelle. Es ist keine vollständige Stateful Inspection.',
    },
    {
      id: 'packetfilter-inspect-undefined-select',
      type: 'select-best',
      question: 'Ein Router zeigt "%Inspect name INTERNET is not defined". Was fehlt?',
      options: ['Die Inspection Rule wurde nicht mit "ip inspect name ..." erstellt', 'Die ACL fehlt', 'Das Interface ist down'], correct: 0,
      explanation: 'Bevor "ip inspect INTERNET" an ein Interface gebunden werden kann, muss die Rule "INTERNET" definiert sein.',
    },
    {
      id: 'packetfilter-wrong-protocol-select',
      type: 'select-best',
      question: 'Die Inspection Rule enthält nur "ip inspect name INTERNET tcp". Ein Client nutzt DNS über UDP. Was passiert?',
      options: ['DNS funktioniert normal', 'Keine UDP-Session wird inspiziert; der Rückverkehr bleibt blockiert, falls keine ACL ihn erlaubt', 'tcp-Rule übernimmt UDP'], correct: 1,
      explanation: 'ip inspect muss das Protokoll explizit enthalten. Für UDP muss auch "ip inspect name INTERNET udp" konfiguriert sein.',
    },
    {
      id: 'packetfilter-direction-select',
      type: 'select-best',
      question: 'Warum sollte ip inspect typischerweise in der Richtung des ausgehenden Verkehrs gebunden werden?',
      options: ['Weil nur so die initiierten Sessions erfasst werden', 'Weil ACLs nur outbound funktionieren', 'Weil eingehender Verkehr nie inspiziert wird'], correct: 0,
      explanation: 'SPI muss die ausgehende Anfrage sehen, um den passenden Rückverkehr zuzulassen. Daher liegt es in Flussrichtung der Anfrage.',
    },
    {
      id: 'packetfilter-expired-session-select',
      type: 'select-best',
      question: 'Eine SPI-Session ist abgelaufen. Was passiert mit dem Rückverkehr zu dieser Session?',
      options: ['Er wird weiter erlaubt', 'Er wird blockiert, weil keine temporäre Session mehr existiert', 'Er wird automatisch an eine ACL delegiert'], correct: 1,
      explanation: 'Stateful-Einträge sind temporär. Nach Timeout oder Verbindungsende verschwinden sie, und der Rückverkehr muss wieder einer festen Regel folgen.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Womit wird in diesem Lehrgang ein statischer Paketfilter auf Cisco-Geräten umgesetzt?', options: ['NAT', 'ACLs', 'Spanning Tree', 'DHCP'], correct: 1, explanation: 'Statische Paketfilter basieren hier auf Access Control Lists.' },
    { question: 'Wie werden Paketfilterregeln abgearbeitet?', options: ['Last Match', 'First Match', 'Zufällig', 'Alphabetisch'], correct: 1, explanation: 'Die erste passende Regel gewinnt, danach stoppt die Auswertung.' },
    { question: 'Was passiert, wenn kein Match in einer ACL gefunden wird?', options: ['permit any', 'implicit deny', 'drop any', 'log'], correct: 1, explanation: 'Am Ende jeder ACL wirkt ein unsichtbares deny any / deny ip any any.' },
    { question: 'Was ist ein Nachteil statischer Paketfilter beim Rückverkehr?', options: ['Sie sind zu schnell', 'Sie kennen den Verbindungszustand nicht', 'Sie können keine Ports filtern', 'Sie funktionieren nur bei UDP'], correct: 1, explanation: 'Stateless Filter wissen nicht, ob ein eingehendes Paket eine Antwort auf eine erlaubte Anfrage ist.' },
    { question: 'Was bedeutet Stateful Inspection?', options: ['Mehr ACL-Regeln', 'Berücksichtigung des Verbindungszustands', 'Nur Rückverkehr erlauben', 'Keine ACL mehr nötig'], correct: 1, explanation: 'Stateful Inspection berücksichtigt Sitzungen und erlaubt passenden Rückverkehr.' },
    { question: 'Welcher Befehl definiert eine Cisco Inspection Rule für TCP?', options: ['ip access-list', 'ip inspect name INTERNET tcp', 'ip access-group', 'line vty'], correct: 1, explanation: 'ip inspect name <NAME> <Protokoll> erstellt die Inspection Rule.' },
    { question: 'Wie wird eine Inspection Rule auf ein Interface angewendet?', options: ['ip access-group', 'ip inspect <NAME> in/out', 'access-class', 'interface inspect'], correct: 1, explanation: 'Im Interface-Kontext: ip inspect <NAME> in oder ip inspect <NAME> out.' },
    { question: 'Was ist der Zweck einer ACL im Zusammenspiel mit ip inspect?', options: ['Sie ersetzt ip inspect', 'Sie erlaubt den gewünschten ausgehenden Verkehr', 'Sie speichert Sessions', 'Sie verhindert jeglichen Verkehr'], correct: 1, explanation: 'Die ACL legt fest, welcher Verkehr grundsätzlich erlaubt ist; ip inspect merkt sich die Sessions.' },
    { question: 'Welcher Befehl zeigt konfigurierte Inspection Rules?', options: ['show ip route', 'show ip inspect config', 'show access-lists', 'show running-config'], correct: 1, explanation: 'show ip inspect config zeigt die definierten Inspection Rules und deren Anwendung.' },
    { question: 'Welcher Befehl zeigt aktive Inspection-Sitzungen?', options: ['show ip interface', 'show ip inspect sessions', 'show ip access-lists', 'show running-config'], correct: 1, explanation: 'show ip inspect sessions zeigt aktive, inspizierte Verbindungen.' },
    { question: 'Wie lange bleiben dynamische Stateful-Einträge bestehen?', options: ['Für immer', 'Solange die Verbindung aktiv ist bzw. bis zum Timeout', 'Nur eine Sekunde', 'Bis zum nächsten Reboot'], correct: 1, explanation: 'Stateful-Einträge sind temporär und verschwinden nach Verbindungsende oder Timeout.' },
    { question: 'Was bedeutet cbac?', options: ['Cisco Basic Access Control', 'Context-Based Access Control', 'Core Border Access Control', 'Cisco Backup Access Control'], correct: 1, explanation: 'CBAC = Context-Based Access Control, die klassische Cisco IOS Stateful Inspection.' },
    { question: 'Was ist der Hauptunterschied zwischen established und echter Stateful Inspection?', options: ['established speichert Sessions, CBAC nicht', 'established prüft TCP-Flags, CBAC verwaltet Session-Zustände', 'established funktioniert nur bei UDP'], correct: 1, explanation: 'established ist ein Flag-Check in ACLs; CBAC merkt sich Sessions und erlaubt passenden Rückverkehr temporär.' },
    { question: 'Warum muss SPI in Flussrichtung der ausgehenden Anfrage liegen?', options: ['Weil nur so die initiierte Session erfasst wird', 'Weil eingehende Pakete nicht inspiziert werden können', 'Weil ACLs nur outbound funktionieren'], correct: 0, explanation: 'SPI muss die ausgehende Verbindung sehen, um den passenden Rückverkehr temporär zuzulassen.' },
    { question: 'Was passiert, wenn eine SPI-Session abgelaufen ist?', options: ['Rückverkehr wird weiter erlaubt', 'Rückverkehr wird blockiert, weil die temporäre Session fehlt', 'Session bleibt für immer aktiv'], correct: 1, explanation: 'Stateful-Einträge sind temporär und enden mit Timeout oder Verbindungsende.' },
    { question: 'Ein Client kann nach außen surfen, aber DNS über UDP funktioniert nicht. Was könnte fehlen?', options: ['Die ACL erlaubt kein TCP', 'Die Inspection Rule enthält nicht udp', 'Das Interface ist down'], correct: 1, explanation: 'ip inspect muss das Protokoll explizit enthalten. Für DNS über UDP muss auch udp inspiziert werden.' },
    { question: 'Wozu dient "show ip inspect config"?', options: ['Zeigt aktive Sitzungen', 'Zeigt konfigurierte Inspection Rules und Bindungen', 'Zeigt die Routingtabelle'], correct: 1, explanation: 'show ip inspect config zeigt definierte Inspection Rules, Protokolle und Interface-Bindungen.' },
  ];
}

function buildCliTasks() {
  return [
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Erstelle eine Extended ACL OUTBOUND, die 192.168.10.0/24 erlaubt, HTTP (Port 80) ins Internet zu nutzen, und alles andere blockiert."',
      expectedLines: [
        'ip access-list extended OUTBOUND',
        'permit tcp 192.168.10.0 0.0.0.255 any eq 80',
        'deny ip any any',
      ],
      explanation: 'Extended ACL mit Protokoll, Source, Wildcard, Destination any und eq 80.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Erstelle die Inspection Rule INTERNET für TCP und UDP."',
      expectedLines: [
        'ip inspect name INTERNET tcp',
        'ip inspect name INTERNET udp',
      ],
      explanation: 'ip inspect name <NAME> <Protokoll> definiert die zu überwachenden Protokolle.',
    },
    {
      startContext: 'Globaler Konfigurationsmodus',
      prompt: 'Sam: "Binde ACL OUTBOUND und Inspection Rule INTERNET auf g0/1 ausgehend an."',
      expectedLines: [
        'interface g0/1',
        'ip access-group OUTBOUND out',
        'ip inspect INTERNET out',
      ],
      explanation: 'Im Interface-Kontext werden beide Befehle mit Richtung out angewendet.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Zeige mir die aktuellen Inspection-Sitzungen an."',
      expectedLines: [['show ip inspect sessions', 'sh ip inspect sessions']],
      explanation: 'show ip inspect sessions zeigt aktive, inspizierte Verbindungen.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Zeige mir die konfigurierten Inspection Rules und deren Interfaces an."',
      expectedLines: [['show ip inspect config', 'sh ip inspect config']],
      explanation: 'show ip inspect config zeigt alle definierten Inspection Rules und deren Bindungen.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Der Rückverkehr aus dem Internet funktioniert nicht, obwohl die ACL ausgehend erlaubt. Was prüfst du zuerst?"',
      expectedLines: [
        'show ip inspect config',
      ],
      explanation: 'Mit show ip inspect config prüft man, ob die Inspection Rule auf dem richtigen Interface und in der richtigen Richtung aktiv ist.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Zeige mir, auf welchen Interfaces SPI in welcher Richtung aktiv ist."',
      expectedLines: [['show ip inspect interfaces', 'sh ip inspect interfaces']],
      explanation: 'show ip inspect interfaces listet die Interfaces mit angewandten Inspection Rules.',
    },
    {
      startContext: 'Privilegierter Modus (Privileged EXEC)',
      prompt: 'Sam: "Zeige mir an, ob auf g0/1 eine ACL und eine Inspection Rule gebunden sind."',
      expectedLines: [['show ip interface g0/1', 'sh ip int g0/1']],
      explanation: 'show ip interface zeigt inbound/outbound ACLs und Inspection Rules auf einem Interface.',
    },
  ];
}

export function buildCiscoPacketfilterLesson() {
  return {
    title: 'Paketfilter',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
    summary: [
      'Paketfilter entscheiden über Weiterleitung oder Verwerfen von Datenpaketen.',
      'Statisch/Stateless basiert auf ACLs; jede Regel wird isoliert geprüft (First Match, implicit deny).',
      'Dynamisch/Stateful berücksichtigt Verbindungszustände und erlaubt passenden Rückverkehr.',
      'Cisco CBAC: ip inspect name <NAME> tcp/udp und ip inspect <NAME> in/out am Interface.',
      'ACL und ip inspect arbeiten zusammen: ACL erlaubt, ip inspect merkt sich die Session.',
      'established in ACLs prüft TCP-Flags, ist aber keine echte Stateful Inspection.',
      'Dynamische Einträge sind temporär und enden mit der Verbindung/dem Timeout.',
      'Verifizieren: show ip inspect config, show ip inspect interfaces, show ip inspect sessions, show ip inspect statistics, show access-lists, show ip interface.',
      'Fehlersuche: ACL-Reihenfolge, fehlende Inspection, falsches Interface/Richtung, fehlendes Protokoll, Session abgelaufen.',
    ],
  };
}
