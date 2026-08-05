import { topicKey } from '../academyTopics.js';

// =============================================================================
// "VLAN-Grundlagen" - fundamentals topic. Purely conceptual (device-agnostic):
// what a VLAN is, why it's used, which problems it solves, and the concepts
// of access/trunk ports and tagging - WITHOUT any vendor CLI. The hands-on
// Cisco configuration (vlan/name/switchport commands) lives in the Cisco
// "Grundkonfiguration" lesson, which briefly re-explains these same concepts
// right before showing the commands so it stays self-contained too.
// =============================================================================

export const VLAN_BASICS_TOPIC_KEY = topicKey('fundamentals', 'vlan-basics');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------
  // 1. Was ist ein VLAN?
  // ---------------------------------------------------------------------
  exps.push(explanation('was-classic', 'Was ist ein VLAN?', 'classic', [
    { type: 'text', content: 'Ein VLAN (Virtual Local Area Network) teilt ein physisches Netzwerk logisch in mehrere getrennte Netze auf - unabhängig davon, wo die Geräte tatsächlich stehen oder verkabelt sind.' },
    { type: 'text', content: 'Ohne VLANs bilden alle Geräte an einem Switch (bzw. mehreren verbundenen Switches) automatisch eine einzige, gemeinsame Broadcast-Domäne (siehe die Switching-Lektion). Ein VLAN teilt genau diese eine große Broadcast-Domäne in mehrere kleinere auf.' },
  ]));

  exps.push(explanation('was-intuitive', 'Was ist ein VLAN?', 'intuitive', [
    { type: 'text', content: 'Stell dir ein Bürogebäude vor, in dem Buchhaltung und Entwicklung im selben Stockwerk sitzen, aber durch unsichtbare Wände voneinander getrennt sind: Sie teilen sich das Gebäude (die physische Verkabelung), sind aber trotzdem zwei getrennte Bereiche, die sich normalerweise nicht gegenseitig "hören".' },
  ]));

  // ---------------------------------------------------------------------
  // 2. Warum VLANs verwenden?
  // ---------------------------------------------------------------------
  exps.push(explanation('warum-classic', 'Warum verwendet man VLANs?', 'classic', [
    { type: 'list', title: 'Gründe für den Einsatz von VLANs', items: [
      'Sicherheit: Abteilungen (z. B. Buchhaltung, Gäste-WLAN, Produktion) lassen sich logisch trennen, auch wenn sie an denselben Switches hängen.',
      'Weniger Broadcast-Verkehr: Jedes VLAN hat seine eigene, kleinere Broadcast-Domäne - weniger unnötiger Verkehr pro Gerät.',
      'Flexibilität: Geräte können VLAN-Zugehörigkeit unabhängig von ihrem physischen Standort haben - ein Umzug in ein anderes Büro erfordert kein Umverkabeln.',
      'Struktur: Netzwerke lassen sich nach Funktion statt nach physischem Standort organisieren (z. B. VLAN 10 = Verwaltung, VLAN 20 = Produktion, VLAN 99 = Management).',
    ] },
  ]));

  // ---------------------------------------------------------------------
  // 3. Welche Probleme lösen VLANs?
  // ---------------------------------------------------------------------
  exps.push(explanation('probleme-classic', 'Welche Probleme lösen VLANs?', 'classic', [
    { type: 'list', title: 'Typische Probleme ohne VLANs', items: [
      'Eine einzige, riesige Broadcast-Domäne: Jeder Broadcast erreicht jedes Gerät - das bremst das Netz und verschwendet Bandbreite.',
      'Keine logische Trennung: Ein Gast im WLAN könnte im selben Netz wie interne Server landen.',
      'Unübersichtliche Struktur: Bei vielen Geräten und Abteilungen im selben Netz wird Fehlersuche und Verwaltung aufwändig.',
    ] },
    { type: 'text', content: 'VLANs lösen diese Probleme, indem sie das eine physische Netz in mehrere kleinere, logisch getrennte Netze aufteilen - jedes mit eigener Broadcast-Domäne und eigenem Adressbereich.' },
    { type: 'question', question: 'Welches Problem lösen VLANs vor allem?', options: ['Zu langsame Internetverbindungen', 'Eine zu große, gemeinsame Broadcast-Domäne und fehlende logische Trennung', 'Fehlende Stromversorgung von Switches', 'Zu wenige physische Netzwerkkabel'], correct: 1, explanation: 'VLANs teilen eine große Broadcast-Domäne in mehrere kleine, logisch getrennte Netze auf.' },
  ]));

  // ---------------------------------------------------------------------
  // 4. Access-Port vs. Trunk-Port (Konzept)
  // ---------------------------------------------------------------------
  exps.push(explanation('ports-classic', 'Access-Port und Trunk-Port (Konzept)', 'classic', [
    { type: 'table', headers: ['Port-Typ', 'Zweck'], rows: [
      ['Access-Port', 'Verbindet ein Endgerät (PC, Drucker) mit genau EINEM VLAN. Das Endgerät selbst "weiß" nichts von VLANs.'],
      ['Trunk-Port', 'Verbindet zwei Switches (oder Switch und Router) und überträgt Datenverkehr für MEHRERE VLANs gleichzeitig über eine einzige physische Leitung.'],
    ] },
    { type: 'text', content: 'Ohne Trunks bräuchte man zwischen zwei Switches für jedes VLAN ein eigenes Kabel. Ein Trunk erlaubt stattdessen eine einzige Verbindung für beliebig viele VLANs.' },
  ]));

  // ---------------------------------------------------------------------
  // 5. Tagging (802.1Q) - Konzept
  // ---------------------------------------------------------------------
  exps.push(explanation('tagging-classic', 'Wie ein Trunk mehrere VLANs unterscheidet: Tagging', 'classic', [
    { type: 'text', content: 'Damit ein Trunk-Port weiß, zu welchem VLAN ein Frame gehört, wird jedem Frame beim Verlassen des Switches eine kleine Kennzeichnung mitgegeben - ein "Tag" mit der VLAN-ID (Standard: IEEE 802.1Q).' },
    { type: 'list', title: 'Merke', items: [
      'Nur auf Trunk-Leitungen werden Frames getaggt - auf einem Access-Port kommt beim Endgerät ein ganz normaler, ungetaggter Frame an.',
      'Der empfangende Switch liest das Tag aus und weiß dadurch, in welches VLAN der Frame gehört bzw. an welche Access-Ports er weitergegeben werden darf.',
      'Dieses Konzept macht es möglich, dass eine einzige physische Leitung Datenverkehr mehrerer VLANs sauber getrennt transportiert.',
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Ein VLAN teilt ein physisches Netzwerk logisch in mehrere getrennte Netze/Broadcast-Domänen.',
      'Gründe: Sicherheit, weniger Broadcast-Verkehr, Flexibilität, bessere Struktur.',
      'VLANs lösen das Problem einer zu großen, gemeinsamen Broadcast-Domäne und fehlender logischer Trennung.',
      'Access-Port: verbindet ein Endgerät mit genau einem VLAN. Trunk-Port: transportiert mehrere VLANs über eine Leitung, meist zwischen Switches.',
      'Auf Trunks werden Frames mit einem VLAN-Tag (IEEE 802.1Q) versehen, damit der empfangende Switch sie dem richtigen VLAN zuordnen kann.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'vlan-reasons-matching',
      type: 'matching',
      question: 'Ordne jeden Grund für VLANs seiner Beschreibung zu.',
      pairs: [
        { left: 'Sicherheit', leftLabel: 'Sicherheit', right: 'Abteilungen logisch trennen, auch am selben Switch' },
        { left: 'Weniger Broadcast-Verkehr', leftLabel: 'Weniger Broadcast-Verkehr', right: 'Kleinere Broadcast-Domänen pro VLAN' },
        { left: 'Flexibilität', leftLabel: 'Flexibilität', right: 'VLAN-Zugehörigkeit unabhängig vom physischen Standort' },
      ],
      explanation: 'VLANs bringen Sicherheit durch Trennung, weniger Broadcast-Verkehr durch kleinere Domänen, und Flexibilität unabhängig vom Standort.',
    },
    {
      id: 'access-trunk-matching',
      type: 'matching',
      question: 'Ordne jeden Port-Typ seinem Zweck zu.',
      pairs: [
        { left: 'Access-Port', leftLabel: 'Access-Port', right: 'Verbindet ein Endgerät mit genau einem VLAN' },
        { left: 'Trunk-Port', leftLabel: 'Trunk-Port', right: 'Transportiert mehrere VLANs über eine Leitung' },
      ],
      explanation: 'Access-Ports bedienen einzelne Endgeräte in einem VLAN, Trunk-Ports verbinden Switches und tragen mehrere VLANs gleichzeitig.',
    },
    {
      id: 'vlan-broadcast-select',
      type: 'select-best',
      question: 'Was passiert mit der Broadcast-Domäne, wenn ein physisches Netz in mehrere VLANs aufgeteilt wird?',
      options: ['Sie wird größer', 'Sie bleibt unverändert eine einzige große Domäne', 'Sie wird in mehrere kleinere Broadcast-Domänen aufgeteilt', 'VLANs haben keinen Einfluss auf Broadcast-Domänen'],
      correct: 2,
      explanation: 'Jedes VLAN bildet seine eigene, kleinere Broadcast-Domäne - genau das ist einer der Hauptgründe für VLANs.',
    },
    {
      id: 'vlan-tagging-select',
      type: 'select-best',
      question: 'Wozu dient das VLAN-Tag (IEEE 802.1Q) auf einem Trunk?',
      options: ['Um die IP-Adresse eines Geräts zu verschlüsseln', 'Um dem empfangenden Switch mitzuteilen, zu welchem VLAN ein Frame gehört', 'Um die Übertragungsgeschwindigkeit zu erhöhen', 'Um Access-Ports zu deaktivieren'],
      correct: 1,
      explanation: 'Das Tag kennzeichnet, zu welchem VLAN ein Frame gehört, damit mehrere VLANs über eine gemeinsame Trunk-Leitung transportiert werden können.',
    },
    {
      id: 'vlan-endgeraet-input',
      type: 'input',
      question: 'Merkt ein normales Endgerät (z. B. ein PC an einem Access-Port) etwas vom VLAN-Tagging? Antworte mit "ja" oder "nein".',
      answers: ['nein', 'nein.'],
      explanation: 'Nein - Tagging findet nur auf Trunk-Leitungen statt. Am Access-Port kommt beim Endgerät ein ganz normaler, ungetaggter Frame an.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was ist ein VLAN?', options: ['Ein zusätzliches physisches Netzwerkkabel', 'Eine logische Aufteilung eines physischen Netzwerks in mehrere getrennte Netze', 'Ein Protokoll zur Namensauflösung', 'Ein Verschlüsselungsverfahren'], correct: 1, explanation: 'Ein VLAN teilt ein physisches Netz logisch in mehrere getrennte Netze auf.' },
    { question: 'Was bilden alle Geräte an einem Switch ohne VLAN-Konfiguration?', options: ['Mehrere kleine Broadcast-Domänen', 'Eine einzige, gemeinsame Broadcast-Domäne', 'Gar keine Broadcast-Domäne', 'Automatisch getrennte VLANs'], correct: 1, explanation: 'Ohne VLANs teilen sich alle angeschlossenen Geräte eine gemeinsame Broadcast-Domäne.' },
    { question: 'Welcher Vorteil spricht für den Einsatz von VLANs?', options: ['Geräte müssen näher beieinander stehen', 'Logische Trennung unabhängig vom physischen Standort', 'VLANs benötigen keine Switches mehr', 'VLANs ersetzen die IP-Adressierung'], correct: 1, explanation: 'VLANs erlauben logische Trennung unabhängig davon, wo ein Gerät physisch verkabelt ist.' },
    { question: 'Welches Problem lösen VLANs vor allem?', options: ['Zu wenige IP-Adressen', 'Eine zu große, gemeinsame Broadcast-Domäne und fehlende logische Trennung', 'Fehlende DNS-Server', 'Zu langsame Router'], correct: 1, explanation: 'VLANs teilen eine große Broadcast-Domäne in mehrere kleinere, logisch getrennte Bereiche auf.' },
    { question: 'Wofür wird ein Access-Port verwendet?', options: ['Um zwei Switches miteinander zu verbinden', 'Um ein Endgerät mit genau einem VLAN zu verbinden', 'Um mehrere VLANs gleichzeitig zu übertragen', 'Um das Internet anzubinden'], correct: 1, explanation: 'Ein Access-Port verbindet ein einzelnes Endgerät mit genau einem VLAN.' },
    { question: 'Wofür wird ein Trunk-Port verwendet?', options: ['Um genau ein VLAN an ein Endgerät zu binden', 'Um mehrere VLANs über eine gemeinsame Leitung zu transportieren', 'Um VLANs vollständig zu deaktivieren', 'Um IP-Adressen zu vergeben'], correct: 1, explanation: 'Ein Trunk-Port transportiert Datenverkehr für mehrere VLANs über eine einzige physische Verbindung, meist zwischen Switches.' },
    { question: 'Warum wird auf einem Trunk ein VLAN-Tag benötigt?', options: ['Um die Kabellänge zu messen', 'Damit der empfangende Switch weiß, zu welchem VLAN ein Frame gehört', 'Um die Portgeschwindigkeit zu erhöhen', 'Um Broadcasts zu verhindern'], correct: 1, explanation: 'Das Tag ordnet jeden Frame eindeutig einem VLAN zu, damit mehrere VLANs dieselbe Leitung nutzen können.' },
    { question: 'Sieht ein normales Endgerät an einem Access-Port das VLAN-Tag?', options: ['Ja, immer', 'Nein, Tagging findet nur auf Trunks statt', 'Nur wenn das Gerät VLAN-fähig ist', 'Nur bei VLAN 1'], correct: 1, explanation: 'Am Access-Port kommt ein normaler, ungetaggter Frame an - das Tagging betrifft nur Trunk-Leitungen.' },
    { question: 'Welcher Standard definiert das VLAN-Tagging?', options: ['IEEE 802.3', 'IEEE 802.1Q', 'IEEE 802.11', 'RFC 791'], correct: 1, explanation: 'IEEE 802.1Q ist der Standard für VLAN-Tagging.' },
    { question: 'Warum ist ein Trunk effizienter als für jedes VLAN ein eigenes Kabel zu verlegen?', options: ['Weil Trunks schneller sind als jede andere Verbindung', 'Weil eine einzige physische Leitung Datenverkehr mehrerer VLANs gleichzeitig transportieren kann', 'Weil Trunks keine Switches benötigen', 'Weil Trunks automatisch verschlüsseln'], correct: 1, explanation: 'Ein Trunk bündelt den Verkehr mehrerer VLANs auf einer Leitung, statt für jedes VLAN ein eigenes Kabel zu benötigen.' },
  ];
}

export function buildVlanBasicsLesson() {
  return {
    title: 'VLAN-Grundlagen',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: [
      'Ein VLAN teilt ein physisches Netzwerk logisch in mehrere getrennte Netze/Broadcast-Domänen auf.',
      'Gründe: Sicherheit, weniger Broadcast-Verkehr, Flexibilität, bessere Struktur.',
      'VLANs lösen das Problem einer zu großen, gemeinsamen Broadcast-Domäne und fehlender logischer Trennung.',
      'Access-Port: ein Endgerät, ein VLAN. Trunk-Port: mehrere VLANs über eine Leitung, meist zwischen Switches.',
      'Auf Trunks werden Frames per VLAN-Tag (IEEE 802.1Q) gekennzeichnet, damit der empfangende Switch sie richtig zuordnet.',
    ],
  };
}
