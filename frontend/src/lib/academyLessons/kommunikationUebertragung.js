import { topicKey } from '../academyTopics.js';

// =============================================================================
// Milestone C5.3 - consolidates the four previously separate placeholder
// topics "Kommunikationsarten", "Betriebsarten", "Ausbreitungsarten" and
// "Übertragungsmedien" into ONE full LessonRunner lesson with four sections
// (following the same multi-section pattern as osi.js). No prior lesson
// content existed for any of the four topics, so this is newly authored
// content rather than a merge of pre-existing material.
// =============================================================================

export const KOMMUNIKATION_UEBERTRAGUNG_TOPIC_KEY = topicKey('fundamentals', 'kommunikation-uebertragung');

const UNICAST_SVG = `<svg viewBox="0 0 200 100" class="w-full h-auto max-h-48" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="50" r="10" fill="#00f0ff"/><circle cx="170" cy="50" r="10" fill="#c9d1d9"/><line x1="40" y1="50" x2="160" y2="50" stroke="#00f0ff" stroke-width="2" marker-end="url(#a1)"/><defs><marker id="a1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#00f0ff"/></marker></defs><text x="30" y="75" fill="#8b949e" font-size="10" text-anchor="middle">Sender</text><text x="170" y="75" fill="#8b949e" font-size="10" text-anchor="middle">Ein Empfänger</text></svg>`;
const BROADCAST_SVG = `<svg viewBox="0 0 200 120" class="w-full h-auto max-h-48" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="60" r="10" fill="#00f0ff"/><circle cx="170" cy="20" r="8" fill="#c9d1d9"/><circle cx="170" cy="60" r="8" fill="#c9d1d9"/><circle cx="170" cy="100" r="8" fill="#c9d1d9"/><line x1="40" y1="60" x2="162" y2="24" stroke="#00f0ff" stroke-width="2"/><line x1="40" y1="60" x2="162" y2="60" stroke="#00f0ff" stroke-width="2"/><line x1="40" y1="60" x2="162" y2="96" stroke="#00f0ff" stroke-width="2"/><text x="30" y="85" fill="#8b949e" font-size="10" text-anchor="middle">Sender</text><text x="170" y="115" fill="#8b949e" font-size="10" text-anchor="middle">Alle im Netz</text></svg>`;
const MULTICAST_SVG = `<svg viewBox="0 0 200 120" class="w-full h-auto max-h-48" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="60" r="10" fill="#00f0ff"/><circle cx="170" cy="30" r="8" fill="#00ff66"/><circle cx="170" cy="90" r="8" fill="#00ff66"/><circle cx="170" cy="60" r="8" fill="#3a3f4b" opacity="0.5"/><line x1="40" y1="60" x2="162" y2="33" stroke="#00f0ff" stroke-width="2"/><line x1="40" y1="60" x2="162" y2="87" stroke="#00f0ff" stroke-width="2"/><text x="30" y="85" fill="#8b949e" font-size="10" text-anchor="middle">Sender</text><text x="170" y="110" fill="#8b949e" font-size="10" text-anchor="middle">Nur die Gruppe</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Warum diese vier Themen zusammengehören', 'classic', [
    { type: 'text', content: 'Wenn zwei oder mehr Geräte kommunizieren, stellen sich immer dieselben vier Grundfragen: Wer redet mit wem (Kommunikationsart)? In welche Richtung fließen die Daten (Betriebsart)? Wie breitet sich das Signal überhaupt aus (Ausbreitungsart)? Und über welches physische Medium (Übertragungsmedium)?' },
    { type: 'text', content: 'Diese vier Bereiche ergänzen sich und werden deshalb hier gemeinsam behandelt.' },
  ]));

  // --- 1. Kommunikationsarten ---
  exps.push(explanation('kommunikation-classic', '1. Kommunikationsarten', 'classic', [
    { type: 'text', content: 'Die Kommunikationsart beschreibt, WER mit WEM spricht: ein Sender mit einem Empfänger, mit allen, oder mit einer bestimmten Gruppe.' },
    { type: 'list', title: 'Die drei Kommunikationsarten', items: [
      'Unicast: Ein Sender kommuniziert mit genau einem Empfänger (1-zu-1).',
      'Broadcast: Ein Sender sendet an ALLE Geräte im Netzwerk (1-zu-alle).',
      'Multicast: Ein Sender sendet an eine ausgewählte Gruppe von Empfängern (1-zu-Gruppe).',
    ] },
    { type: 'diagram', content: UNICAST_SVG },
    { type: 'diagram', content: BROADCAST_SVG },
    { type: 'diagram', content: MULTICAST_SVG },
    { type: 'text', content: 'Praxisbeispiel: Ein normaler Webseitenaufruf ist Unicast. Eine ARP-Anfrage ("Wer hat diese IP-Adresse?") ist Broadcast. Ein Live-Videostream an mehrere Abonnenten einer Gruppe kann Multicast nutzen.' },
    { type: 'text', content: 'Merksatz: "Uni = einer, Broad = breit/alle, Multi = mehrere - aber gezielt."' },
  ]));

  exps.push(explanation('kommunikation-intuitive', '1. Kommunikationsarten', 'intuitive', [
    { type: 'list', title: 'Alltags-Analogie', items: [
      'Unicast = ein persönlicher Brief an eine Person.',
      'Broadcast = eine Durchsage über den Lautsprecher, die alle hören.',
      'Multicast = eine E-Mail an eine bestimmte Verteilerliste, nicht an alle Mitarbeiter.',
    ] },
  ]));

  // --- 2. Betriebsarten ---
  exps.push(explanation('betrieb-classic', '2. Betriebsarten', 'classic', [
    { type: 'text', content: 'Die Betriebsart beschreibt, in welche RICHTUNG(EN) Daten gleichzeitig übertragen werden können.' },
    { type: 'list', title: 'Die drei Betriebsarten', items: [
      'Simplex: Übertragung nur in eine Richtung (z. B. Radio-Rundfunk).',
      'Halbduplex: Beide Seiten können senden und empfangen, aber nicht gleichzeitig (z. B. Walkie-Talkie).',
      'Vollduplex: Beide Seiten können gleichzeitig senden UND empfangen (z. B. Telefonanruf, moderne Netzwerkkabel).',
    ] },
    { type: 'text', content: 'Praxisbeispiel: Ein Videoanruf, bei dem beide Seiten gleichzeitig sprechen und hören können, ist Vollduplex. Ein klassisches Funkgerät, bei dem man erst die Sprechtaste loslassen muss, ist Halbduplex.' },
    { type: 'text', content: 'Merksatz: "Simplex = eine Einbahnstraße, Halbduplex = abwechselnd, Vollduplex = gleichzeitig in beide Richtungen."' },
  ]));

  exps.push(explanation('betrieb-intuitive', '2. Betriebsarten', 'intuitive', [
    { type: 'list', title: 'Alltags-Analogie', items: [
      'Simplex = ein Fernsehsender, der nur sendet - du kannst nicht zurücksprechen.',
      'Halbduplex = ein Funkgerät: erst reden, dann loslassen, dann hören.',
      'Vollduplex = ein normales Telefongespräch: beide reden und hören gleichzeitig.',
    ] },
  ]));

  // --- 3. Ausbreitungsarten ---
  exps.push(explanation('ausbreitung-classic', '3. Ausbreitungsarten', 'classic', [
    { type: 'text', content: 'Die Ausbreitungsart beschreibt, WIE sich ein Signal im Übertragungsmedium fortbewegt - geführt entlang eines physischen Leiters oder ungeführt (frei) durch den Raum.' },
    { type: 'list', title: 'Die zwei Grund-Ausbreitungsarten', items: [
      'Geführte (leitungsgebundene) Ausbreitung: Das Signal läuft entlang eines physischen Mediums - Kupferkabel (elektrische Signale) oder Glasfaser (Lichtimpulse).',
      'Ungeführte (drahtlose) Ausbreitung: Das Signal breitet sich frei als elektromagnetische Welle im Raum aus - z. B. WLAN, Bluetooth, Mobilfunk.',
    ] },
    { type: 'list', title: 'Eigenschaften, die die Ausbreitung beeinflussen', items: [
      'Dämpfung: Das Signal wird mit zunehmender Entfernung schwächer.',
      'Reflexion/Streuung: Besonders bei Funk können Signale an Wänden reflektiert oder gestreut werden.',
      'Störanfälligkeit: Elektrische Leitungen sind anfälliger für elektromagnetische Störungen als Glasfaser oder abgeschirmte Kabel.',
    ] },
    { type: 'text', content: 'Praxisbeispiel: Ein WLAN-Signal wird schwächer, je weiter man sich vom Router entfernt (Dämpfung), und kann durch dicke Wände zusätzlich abgeschwächt werden.' },
  ]));

  exps.push(explanation('ausbreitung-intuitive', '3. Ausbreitungsarten', 'intuitive', [
    { type: 'text', content: 'Geführte Ausbreitung ist wie Wasser in einem Schlauch: Es folgt exakt dem vorgegebenen Weg. Ungeführte Ausbreitung ist wie ein Ruf im Raum: Er breitet sich in alle Richtungen aus und wird mit der Entfernung leiser.' },
  ]));

  // --- 4. Übertragungsmedien ---
  exps.push(explanation('medien-classic', '4. Übertragungsmedien', 'classic', [
    { type: 'text', content: 'Das Übertragungsmedium ist der physische Träger, über den Signale tatsächlich übertragen werden.' },
    { type: 'table', headers: ['Medium', 'Signalart', 'Vorteil', 'Nachteil'], rows: [
      ['Kupferkabel (z. B. Twisted-Pair)', 'Elektrische Signale', 'Günstig, einfach zu verlegen', 'Störanfällig, begrenzte Reichweite/Bandbreite'],
      ['Glasfaser', 'Lichtimpulse', 'Sehr hohe Bandbreite, große Reichweite, störunanfällig', 'Teurer, empfindlicher bei Installation'],
      ['Funk (z. B. WLAN)', 'Elektromagnetische Wellen', 'Keine Verkabelung nötig, mobil', 'Störanfällig, geteilte Bandbreite, Sicherheitsrisiken'],
    ] },
    { type: 'text', content: 'Praxisbeispiel: Ein Rechenzentrum verbindet Server untereinander meist über Glasfaser (hohe Bandbreite, wenig Störung), während Endgeräte im Büro oft per Kupferkabel oder WLAN angebunden werden.' },
    { type: 'text', content: 'Merksatz: "Kupfer = günstig und elektrisch, Glasfaser = schnell und Licht, Funk = frei aber geteilt."' },
  ]));

  exps.push(explanation('medien-intuitive', '4. Übertragungsmedien', 'intuitive', [
    { type: 'list', title: 'Eselsbrücken', items: [
      'Kupfer → elektrische Signale → wie eine klassische Stromleitung.',
      'Glasfaser → Licht → wie ein Lichtstrahl, der durch ein Glasrohr geschickt wird.',
      'Funk → Wellen → wie ein Radiosignal, das sich frei im Raum ausbreitet.',
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Kommunikationsarten: Unicast (1-zu-1), Broadcast (1-zu-alle), Multicast (1-zu-Gruppe).',
      'Betriebsarten: Simplex (eine Richtung), Halbduplex (abwechselnd), Vollduplex (gleichzeitig beide Richtungen).',
      'Ausbreitungsarten: geführt (leitungsgebunden, z. B. Kupfer/Glasfaser) oder ungeführt (drahtlos, z. B. Funk).',
      'Übertragungsmedien: Kupferkabel (elektrisch), Glasfaser (Licht), Funk (elektromagnetische Wellen).',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'kommunikationsarten-matching',
      type: 'matching',
      question: 'Ordne jedes Beispiel der passenden Kommunikationsart zu.',
      pairs: [
        { left: 'Normaler Webseitenaufruf', leftLabel: 'Normaler Webseitenaufruf', right: 'Unicast' },
        { left: 'ARP-Anfrage an alle Geräte im Subnetz', leftLabel: 'ARP-Anfrage an alle Geräte im Subnetz', right: 'Broadcast' },
        { left: 'Live-Stream an eine Abonnentengruppe', leftLabel: 'Live-Stream an eine Abonnentengruppe', right: 'Multicast' },
      ],
      explanation: 'Ein Webseitenaufruf ist 1-zu-1 (Unicast), eine ARP-Anfrage geht an alle (Broadcast), und ein gruppenweiter Stream ist Multicast.',
    },
    {
      id: 'betriebsarten-ordering',
      type: 'select-best',
      question: 'Ein klassisches Walkie-Talkie, bei dem man erst die Sprechtaste loslassen muss, um den anderen zu hören, ist ein Beispiel für...',
      options: ['Simplex', 'Halbduplex', 'Vollduplex', 'Multiplex'],
      correct: 1,
      explanation: 'Bei Halbduplex können beide Seiten senden und empfangen, aber nicht gleichzeitig - genau wie beim Walkie-Talkie.',
    },
    {
      id: 'medien-matching',
      type: 'matching',
      question: 'Ordne jedes Übertragungsmedium der passenden Signalart zu.',
      pairs: [
        { left: 'Kupferkabel', leftLabel: 'Kupferkabel', right: 'Elektrische Signale' },
        { left: 'Glasfaser', leftLabel: 'Glasfaser', right: 'Lichtimpulse' },
        { left: 'WLAN', leftLabel: 'WLAN', right: 'Elektromagnetische Wellen' },
      ],
      explanation: 'Kupfer überträgt elektrisch, Glasfaser über Licht, Funk über elektromagnetische Wellen im Raum.',
    },
    {
      id: 'ausbreitung-input',
      type: 'input',
      question: 'Wie nennt man die Ausbreitungsart, bei der ein Signal frei durch den Raum läuft, ohne an ein physisches Kabel gebunden zu sein? (ein Wort)',
      answers: ['ungeführt', 'ungefuehrt', 'drahtlos'],
      explanation: 'Man spricht von "ungeführter" (oder drahtloser) Ausbreitung, im Gegensatz zur geführten Ausbreitung entlang eines Kabels.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Wie nennt man die Kommunikation von einem Sender zu genau einem Empfänger?', options: ['Broadcast', 'Multicast', 'Unicast', 'Anycast'], correct: 2, explanation: 'Unicast ist die 1-zu-1-Kommunikation.' },
    { question: 'Wie nennt man die Kommunikation von einem Sender an alle Geräte im Netzwerk?', options: ['Unicast', 'Broadcast', 'Multicast', 'Simplex'], correct: 1, explanation: 'Broadcast sendet an alle Teilnehmer im Netzwerksegment.' },
    { question: 'Wie nennt man die Kommunikation an eine ausgewählte Gruppe von Empfängern?', options: ['Unicast', 'Broadcast', 'Multicast', 'Vollduplex'], correct: 2, explanation: 'Multicast adressiert gezielt eine Gruppe, nicht alle und nicht nur einen.' },
    { question: 'Welche Betriebsart erlaubt Übertragung nur in eine Richtung?', options: ['Vollduplex', 'Halbduplex', 'Simplex', 'Multicast'], correct: 2, explanation: 'Simplex erlaubt nur eine Übertragungsrichtung, z. B. klassischer Rundfunk.' },
    { question: 'Welche Betriebsart erlaubt gleichzeitiges Senden und Empfangen auf beiden Seiten?', options: ['Simplex', 'Halbduplex', 'Vollduplex', 'Broadcast'], correct: 2, explanation: 'Vollduplex erlaubt gleichzeitige Kommunikation in beide Richtungen, wie bei einem Telefonanruf.' },
    { question: 'Ein Funkgerät, bei dem abwechselnd gesprochen werden muss, ist ein Beispiel für...', options: ['Simplex', 'Halbduplex', 'Vollduplex', 'Multicast'], correct: 1, explanation: 'Halbduplex: beide Richtungen möglich, aber nicht gleichzeitig.' },
    { question: 'Wie nennt man die Ausbreitung eines Signals entlang eines physischen Kabels?', options: ['Ungeführt', 'Geführt', 'Simplex', 'Multicast'], correct: 1, explanation: 'Geführte (leitungsgebundene) Ausbreitung folgt einem physischen Medium wie Kupfer oder Glasfaser.' },
    { question: 'Wie nennt man die Ausbreitung eines Signals frei im Raum, z. B. bei WLAN?', options: ['Geführt', 'Ungeführt', 'Vollduplex', 'Unicast'], correct: 1, explanation: 'Ungeführte (drahtlose) Ausbreitung verläuft ohne physisches Leitmedium durch den Raum.' },
    { question: 'Welches Übertragungsmedium nutzt Lichtimpulse zur Datenübertragung?', options: ['Kupferkabel', 'Glasfaser', 'WLAN', 'Bluetooth'], correct: 1, explanation: 'Glasfaser übertragt Daten als Lichtimpulse.' },
    { question: 'Welches Übertragungsmedium ist am störanfälligsten gegenüber elektromagnetischen Feldern?', options: ['Glasfaser', 'Kupferkabel', 'Beide gleich stark', 'Keines von beiden'], correct: 1, explanation: 'Kupferkabel übertragen elektrische Signale und sind dadurch anfälliger für elektromagnetische Störungen als Glasfaser.' },
    { question: 'Welches Übertragungsmedium benötigt keine physische Verkabelung zwischen Sender und Empfänger?', options: ['Kupferkabel', 'Glasfaser', 'Funk', 'Koaxialkabel'], correct: 2, explanation: 'Funk überträgt Signale drahtlos als elektromagnetische Wellen.' },
    { question: 'Ein Administrator plant eine Verbindung zwischen zwei Serverräumen über mehrere hundert Meter mit maximaler Bandbreite und Störunanfälligkeit. Welches Medium ist am besten geeignet?', options: ['Kupferkabel', 'Glasfaser', 'WLAN', 'Bluetooth'], correct: 1, explanation: 'Glasfaser bietet hohe Bandbreite über große Distanzen und ist gegen elektromagnetische Störungen unempfindlich.' },
  ];
}

function buildSummary() {
  return [
    'Kommunikationsarten: Unicast (1-zu-1), Broadcast (1-zu-alle), Multicast (1-zu-Gruppe).',
    'Betriebsarten: Simplex, Halbduplex, Vollduplex - abhängig von der möglichen Übertragungsrichtung.',
    'Ausbreitungsarten: geführt (Kabel) vs. ungeführt (drahtlos/Funk).',
    'Übertragungsmedien: Kupfer (elektrisch), Glasfaser (Licht), Funk (elektromagnetische Wellen).',
  ];
}

export function buildKommunikationUebertragungLesson() {
  return {
    title: 'Kommunikations- und Übertragungsarten',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    summary: buildSummary(),
  };
}
