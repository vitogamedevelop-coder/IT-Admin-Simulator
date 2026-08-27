import { topicKey } from '../academyTopics.js';

// =============================================================================
// "VLAN" - first deep-dive Cisco lesson after "Grundkonfiguration", filling
// the catalog's existing (previously empty) `cisco-packet-tracer/vlan` topic
// slot (see Milestone C6 planning). Builds on the device-agnostic theory in
// fundamentals/vlan-basics and the compact CLI primer already given in
// Grundkonfiguration - deliberately does NOT re-explain "was ist ein VLAN"
// or "warum VLANs" again. Instead adds the pieces that were still missing
// (VLAN-ID-Bereiche, Default VLAN, Kommunikation inner-/zwischen VLANs) and
// then shifts the weight heavily onto actively typed CLI practice, per the
// Milestone C6 requirement that Cisco Praxis/Fachgespräch focus on input
// tasks (type: 'cli-input' exercises, plus `cliTasks` for Praxis-quiz und
// Fachgespräch, checked via lib/ciscoCli.js).
// =============================================================================

export const CISCO_VLAN_TOPIC_KEY = topicKey('cisco-packet-tracer', 'vlan');

const VLAN_SEGMENTATION_SVG = `<svg viewBox="0 0 320 200" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><rect x="90" y="20" width="140" height="40" rx="6" fill="#00f0ff" opacity="0.9"/><text x="160" y="46" text-anchor="middle" fill="#0a1628" font-size="12" font-weight="bold">Switch</text><rect x="20" y="100" width="80" height="70" rx="6" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="60" y="125" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">VLAN 10</text><text x="60" y="145" text-anchor="middle" fill="#8b949e" font-size="9">PC A</text><text x="60" y="160" text-anchor="middle" fill="#8b949e" font-size="9">PC B</text><rect x="120" y="100" width="80" height="70" rx="6" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="160" y="125" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">VLAN 20</text><text x="160" y="145" text-anchor="middle" fill="#8b949e" font-size="9">PC C</text><text x="160" y="160" text-anchor="middle" fill="#8b949e" font-size="9">PC D</text><rect x="220" y="100" width="80" height="70" rx="6" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="260" y="125" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">VLAN 30</text><text x="260" y="145" text-anchor="middle" fill="#8b949e" font-size="9">Server</text><line x1="120" y1="60" x2="60" y2="100" stroke="#8b949e" stroke-width="2"/><line x1="160" y1="60" x2="160" y2="100" stroke="#8b949e" stroke-width="2"/><line x1="200" y1="60" x2="260" y2="100" stroke="#8b949e" stroke-width="2"/></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  // ---------------------------------------------------------------------
  // 1. Einordnung
  // ---------------------------------------------------------------------
  exps.push(explanation('intro-classic', 'VLANs auf einem echten Switch', 'classic', [
    { type: 'text', content: 'In "VLAN-Grundlagen" und in "Grundkonfiguration" hast du bereits gesehen, was ein VLAN ist und wie du eines mit "vlan <ID>" anlegst. In dieser Lektion vertiefst du das: VLAN-ID-Bereiche, das Default VLAN, wie Kommunikation innerhalb und zwischen VLANs abläuft - und vor allem viel aktive CLI-Praxis.' },
  ]));

  exps.push(explanation('segmentation-visual', 'Ein Switch – mehrere logische Netze', 'visual', [
    { type: 'diagram', content: VLAN_SEGMENTATION_SVG },
    { type: 'text', content: 'Derselbe physische Switch kann mehrere logische Broadcastdomänen enthalten. Geräte im selben VLAN können direkt kommunizieren, Geräte in unterschiedlichen VLANs benötigen dafür ein Layer-3-Gerät.' },
  ]));

  // ---------------------------------------------------------------------
  // 2. VLAN-ID-Bereiche
  // ---------------------------------------------------------------------
  exps.push(explanation('id-bereiche-classic', 'VLAN-ID-Bereiche', 'classic', [
    { type: 'table', headers: ['Bereich', 'VLAN-IDs', 'Verwendung'], rows: [
      ['Normal Range', '1 - 1005', 'Für den täglichen Gebrauch - die IDs, die du in der Praxis fast immer vergibst.'],
      ['Reserviert', '1002 - 1005', 'Historisch für Token Ring/FDDI reserviert, in modernen Netzen nicht verwendet.'],
      ['Extended Range', '1006 - 4094', 'Nur auf moderneren Switches verfügbar, für sehr große Umgebungen.'],
    ] },
    { type: 'text', content: 'In der Praxis (und in dieser Lektion) arbeitest du praktisch immer mit VLAN-IDs aus dem Normal Range, meist zweistellige, gut merkbare Nummern wie 10, 20, 30.' },
  ]));

  // ---------------------------------------------------------------------
  // 3. Default VLAN
  // ---------------------------------------------------------------------
  exps.push(explanation('default-vlan-classic', 'Das Default VLAN (VLAN 1)', 'classic', [
    { type: 'list', title: 'Was du über VLAN 1 wissen musst', items: [
      'VLAN 1 existiert auf jedem Cisco-Switch automatisch - es lässt sich nicht löschen und nicht umbenennen.',
      'Jeder Switchport ist im Auslieferungszustand Mitglied von VLAN 1, solange du ihn keinem anderen VLAN zuweist.',
      'In der Praxis wird VLAN 1 aus Sicherheitsgründen meist NICHT für produktiven Datenverkehr verwendet - stattdessen legt man für Endgeräte eigene VLANs an (siehe "Grundkonfiguration": ungenutzte Ports werden bewusst einem isolierten, nicht-produktiven VLAN zugewiesen statt VLAN 1 zu belassen).',
    ] },
    { type: 'question', question: 'Was passiert mit einem Switchport, dem du kein VLAN explizit zuweist?', options: ['Er bleibt VLAN-los und funktioniert nicht', 'Er landet automatisch im Default VLAN (VLAN 1)', 'Er wird automatisch zum Trunk-Port', 'Er wird automatisch deaktiviert'], correct: 1, explanation: 'Jeder Port ist standardmäßig Mitglied von VLAN 1, dem Default VLAN.' },
  ]));

  // ---------------------------------------------------------------------
  // 4. Kommunikation innerhalb und zwischen VLANs
  // ---------------------------------------------------------------------
  exps.push(explanation('kommunikation-classic', 'Kommunikation innerhalb und zwischen VLANs', 'classic', [
    { type: 'list', title: 'Zwei völlig unterschiedliche Fälle', items: [
      'Innerhalb eines VLANs: Zwei Geräte im selben VLAN kann der Switch direkt anhand der MAC-Adresse vermitteln (Layer 2) - kein Router nötig, funktioniert genau wie in einem normalen, nicht segmentierten Netz.',
      'Zwischen zwei VLANs: Ein Switch alleine leitet standardmäßig NICHTS zwischen VLANs weiter - dafür wird ein Layer-3-Gerät benötigt (ein Router oder ein Multilayer-Switch), das die Pakete anhand der IP-Adresse routet.',
    ] },
    { type: 'text', content: 'Genau dieses zweite Problem - Kommunikation zwischen VLANs - lösen die späteren Lektionen "Router on a Stick" und "Multilayer Switch". In dieser Lektion bleibst du zunächst innerhalb eines VLANs.' },
  ]));

  // ---------------------------------------------------------------------
  // 5. VLAN anlegen, benennen, prüfen
  // ---------------------------------------------------------------------
  exps.push(explanation('cli-classic', 'VLAN anlegen, benennen und prüfen', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['vlan <VLAN-ID>', 'Legt ein neues VLAN an bzw. wechselt in dessen Konfigurationsmodus, falls es schon existiert.'],
      ['name <Name>', 'Benennt das aktuelle VLAN (rein informativ, hat keine technische Auswirkung).'],
      ['exit', 'Verlässt den VLAN-Konfigurationsmodus wieder.'],
      ['show vlan', 'Zeigt alle VLANs mit vollständigen Details (u. a. Status, zugewiesene Ports).'],
      ['show vlan brief', 'Kompakte Übersicht: VLAN-ID, Name, Status und zugewiesene Ports auf einen Blick - der Befehl, den du in der Praxis am häufigsten nutzt.'],
    ] },
    { type: 'list', title: 'Beispielkonfiguration: zwei VLANs anlegen', items: [
      'Switch(config)# vlan 10',
      'Switch(config-vlan)# name Verwaltung',
      'Switch(config-vlan)# exit',
      'Switch(config)# vlan 20',
      'Switch(config-vlan)# name Gaeste',
      'Switch(config-vlan)# exit',
      'Switch(config)# do show vlan brief',
    ] },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'VLAN-IDs kommen in der Praxis fast immer aus dem Normal Range (1-1005), typischerweise zweistellige, gut merkbare Nummern.',
      'VLAN 1 ist das nicht löschbare Default VLAN - jeder Port ist ihm zugewiesen, bis du ihn einem anderen VLAN zuweist.',
      'Innerhalb eines VLANs vermittelt der Switch direkt (Layer 2), zwischen VLANs braucht es ein Layer-3-Gerät.',
      'VLAN anlegen und benennen: "vlan <ID>" → "name <Name>" → "exit". Prüfen mit "show vlan" oder kompakter mit "show vlan brief".',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'vlan-id-ranges-matching',
      type: 'matching',
      question: 'Ordne jeden VLAN-ID-Bereich seiner Verwendung zu.',
      pairs: [
        { left: '1 - 1005', leftLabel: '1 - 1005', right: 'Normal Range - für den täglichen Gebrauch' },
        { left: '1002 - 1005', leftLabel: '1002 - 1005', right: 'Reserviert, in modernen Netzen ungenutzt' },
        { left: '1006 - 4094', leftLabel: '1006 - 4094', right: 'Extended Range für sehr große Umgebungen' },
      ],
      explanation: 'Normal Range für den Alltag, ein kleiner reservierter Block ohne moderne Verwendung, Extended Range für sehr große Netze.',
    },
    {
      id: 'vlan-cli-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte zum Anlegen und Benennen eines VLANs in die richtige Reihenfolge.',
      items: [
        { id: 'vlan', label: 'vlan 30' },
        { id: 'name', label: 'name Produktion' },
        { id: 'exit', label: 'exit' },
        { id: 'show', label: 'show vlan brief' },
      ],
      correctOrder: ['vlan', 'name', 'exit', 'show'],
      explanation: 'Erst das VLAN anlegen, dann benennen, den VLAN-Konfigurationsmodus verlassen und zuletzt mit "show vlan brief" prüfen.',
    },
    {
      id: 'vlan-1-select',
      type: 'select-best',
      question: 'Welche Aussage über VLAN 1 ist richtig?',
      options: ['VLAN 1 kann gelöscht werden, sobald ein anderes VLAN existiert', 'VLAN 1 ist das Default VLAN und kann nicht gelöscht werden', 'VLAN 1 existiert nur, wenn man es explizit anlegt', 'VLAN 1 wird automatisch zum Trunk, sobald ein zweites VLAN existiert'],
      correct: 1,
      explanation: 'VLAN 1 ist auf jedem Cisco-Switch automatisch vorhanden und lässt sich nicht löschen.',
    },
    {
      id: 'vlan-intra-inter-select',
      type: 'select-best',
      question: 'Zwei PCs befinden sich im selben VLAN 10. Was benötigen sie, um miteinander zu kommunizieren?',
      options: ['Einen Router', 'Nur den Switch - keine Layer-3-Vermittlung nötig', 'Einen zweiten Switch', 'Eine Trunk-Verbindung'],
      correct: 1,
      explanation: 'Innerhalb eines VLANs reicht die normale Layer-2-Vermittlung durch den Switch, ein Router wird erst für die Kommunikation zwischen VLANs benötigt.',
    },
    {
      id: 'vlan-cli-create-10',
      type: 'cli-input',
      question: 'Lege VLAN 10 an und benenne es "Verwaltung".',
      hint: 'Ein Befehl pro Zeile. Denk an "exit", um den VLAN-Konfigurationsmodus wieder zu verlassen.',
      expectedLines: ['vlan 10', 'name Verwaltung', 'exit'],
      explanation: 'Mit "vlan 10" legst du das VLAN an, "name Verwaltung" vergibt den Namen, "exit" verlässt den VLAN-Konfigurationsmodus.',
    },
    {
      id: 'vlan-cli-create-20-30',
      type: 'cli-input',
      question: 'Lege zusätzlich VLAN 20 ("Gaeste") und VLAN 30 ("Produktion") an.',
      hint: 'Sechs Zeilen: vlan/name/exit für jedes der beiden VLANs.',
      expectedLines: ['vlan 20', 'name Gaeste', 'exit', 'vlan 30', 'name Produktion', 'exit'],
      explanation: 'Für jedes weitere VLAN wiederholst du dasselbe Muster: vlan anlegen, benennen, exit.',
    },
    {
      id: 'vlan-missing-dependency-select',
      type: 'select-best',
      question: 'Du gibst "switchport access vlan 40" ein, aber "show vlan brief" zeigt kein VLAN 40. Was ist die wahrscheinlichste Ursache?',
      options: ['Der Befehl ist falsch geschrieben', 'VLAN 40 wurde noch nicht angelegt', 'Der Port ist falsch ausgewählt', 'VLAN 40 darf nicht als Access-VLAN verwendet werden'],
      correct: 1,
      explanation: 'Ein VLAN muss zuerst mit "vlan <ID>" angelegt werden, bevor es einem Port zugewiesen werden kann.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Aus welchem Bereich vergibst du in der Praxis fast immer deine VLAN-IDs?', options: ['1002 - 1005', '1006 - 4094', '1 - 1005 (Normal Range)', 'Es ist egal, jeder Bereich funktioniert identisch'], correct: 2, explanation: 'Der Normal Range (1-1005) ist der praxisübliche Bereich für VLAN-IDs.' },
    { question: 'Welcher Befehl zeigt eine kompakte Übersicht aller VLANs mit ihren zugewiesenen Ports?', options: ['show running-config', 'show vlan brief', 'show interfaces trunk', 'show ip route'], correct: 1, explanation: '"show vlan brief" ist der Standardbefehl für die kompakte VLAN-Übersicht.' },
    { question: 'Ein Switchport wurde noch nie konfiguriert. In welchem VLAN befindet er sich?', options: ['In keinem VLAN', 'VLAN 99', 'VLAN 1 (Default VLAN)', 'Er ist automatisch ein Trunk'], correct: 2, explanation: 'Jeder Port gehört ohne explizite Konfiguration automatisch zum Default VLAN 1.' },
    { question: 'Zwei PCs stehen in unterschiedlichen VLANs (10 und 20) am selben Switch. Was passiert ohne weitere Konfiguration?', options: ['Sie können normal kommunizieren', 'Der Switch übersetzt automatisch zwischen den VLANs', 'Sie können NICHT kommunizieren, da dafür ein Layer-3-Gerät nötig ist', 'Beide werden automatisch in VLAN 1 verschoben'], correct: 2, explanation: 'Ohne Router oder Multilayer-Switch gibt es keine Kommunikation zwischen unterschiedlichen VLANs.' },
    { question: 'Welche Befehlsfolge legt VLAN 40 mit dem Namen "Server" korrekt an?', options: ['vlan 40 → interface vlan 40 → name Server', 'vlan 40 → name Server → exit', 'name Server → vlan 40 → exit', 'interface vlan 40 → vlan 40 → name Server'], correct: 1, explanation: 'Erst das VLAN mit "vlan 40" anlegen, dann mit "name Server" benennen, danach den Modus mit "exit" verlassen.' },
    { question: 'Ein Trunk-Port erscheint in "show vlan brief" nicht unter einem bestimmten VLAN. Was sagt das?', options: ['Der Port ist defekt', 'Trunk-Ports werden in "show vlan brief" nicht wie Access-Ports einzelnen VLANs zugeordnet', 'Das VLAN existiert nicht', 'Der Trunk ist abgeschaltet'], correct: 1, explanation: '"show vlan brief" zeigt Access-Port-Zuweisungen. Für Trunk-Details nutzt man "show interfaces trunk".' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Wir brauchen ein VLAN für die Buchhaltung - VLAN-ID 50, Name Buchhaltung."',
      expectedLines: ['vlan 50', 'name Buchhaltung', 'exit'],
      explanation: 'vlan 50 legt das VLAN an, name Buchhaltung benennt es, exit verlässt den Modus.',
    },
    {
      prompt: 'Sam: "Zeig mir mal kompakt, welche VLANs aktuell existieren."',
      hint: 'Ein einzelner Befehl reicht.',
      expectedLines: [['show vlan brief', 'sh vlan brief']],
      explanation: '"show vlan brief" zeigt VLAN-ID, Name, Status und zugewiesene Ports auf einen Blick.',
    },
    {
      prompt: 'Sam: "Lege VLAN 60 mit dem Namen IT an und wechsle danach gleich in den Konfigurationsmodus von VLAN 70, das du IoT nennst."',
      expectedLines: ['vlan 60', 'name IT', 'exit', 'vlan 70', 'name IoT', 'exit'],
      explanation: 'Für jedes VLAN wiederholst du: vlan anlegen, benennen, exit - egal wie viele VLANs du direkt hintereinander anlegst.',
    },
  ];
}

export function buildCiscoVlanLesson() {
  return {
    title: 'VLAN',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
