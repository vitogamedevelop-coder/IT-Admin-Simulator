import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Router on a Stick" - fills the catalog's existing `cisco-packet-tracer/
// inter-vlan-routing` slot. Builds on "VLAN", "Trunk" and "Router-Grundlagen" -
// this is the classic way to solve the "communication between VLANs" problem
// raised in the VLAN lesson, using subinterfaces on a single router
// connection instead of one physical interface per VLAN.
// =============================================================================

export const CISCO_INTER_VLAN_ROUTING_TOPIC_KEY = topicKey('cisco-packet-tracer', 'inter-vlan-routing');

const ROAS_TOPOLOGY_SVG = `<svg viewBox="0 0 340 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Router on a Stick</text><rect x="40" y="70" width="80" height="40" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="80" y="88" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">VLAN 10</text><text x="80" y="102" text-anchor="middle" fill="#8b949e" font-size="8">PC A</text><rect x="40" y="130" width="80" height="40" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="80" y="148" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">VLAN 20</text><text x="80" y="162" text-anchor="middle" fill="#8b949e" font-size="8">PC B</text><rect x="130" y="100" width="80" height="40" rx="5" fill="#00f0ff" opacity="0.9"/><text x="170" y="118" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">Switch</text><text x="170" y="132" text-anchor="middle" fill="#0a1628" font-size="8">Trunk</text><rect x="240" y="100" width="80" height="40" rx="5" fill="#00f0ff" opacity="0.9"/><text x="280" y="118" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">Router</text><text x="280" y="132" text-anchor="middle" fill="#0a1628" font-size="8">g0/0</text><line x1="120" y1="90" x2="130" y2="110" stroke="#8b949e" stroke-width="2"/><line x1="120" y1="150" x2="130" y2="130" stroke="#8b949e" stroke-width="2"/><line x1="210" y1="120" x2="240" y2="120" stroke="#00f0ff" stroke-width="3"/><text x="80" y="62" text-anchor="middle" fill="#8b949e" font-size="8">Access</text><text x="275" y="170" text-anchor="middle" fill="#8b949e" font-size="8">g0/0.10 VLAN10</text><text x="275" y="185" text-anchor="middle" fill="#8b949e" font-size="8">g0/0.20 VLAN20</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Das Problem: Kommunikation zwischen VLANs', 'classic', [
    { type: 'text', content: 'In der VLAN-Lektion hast du gelernt: Ein Switch alleine leitet nichts zwischen VLANs weiter, dafür wird ein Layer-3-Gerät benötigt. "Router on a Stick" ist die klassische Lösung dafür - ein einzelner Router mit einer einzigen physischen Verbindung zum Switch übernimmt das Routing für ALLE VLANs.' },
  ]));

  exps.push(explanation('topology-visual', 'Topologie: Router on a Stick', 'visual', [
    { type: 'diagram', content: ROAS_TOPOLOGY_SVG },
    { type: 'text', content: 'PC A (VLAN 10) und PC B (VLAN 20) sind am Switch über Access-Ports angeschlossen. Der Uplink zum Router ist ein Trunk. Auf dem Router trennt g0/0.10 und g0/0.20 die beiden VLANs logisch voneinander.' },
  ]));

  exps.push(explanation('warum-classic', 'Warum "Router on a Stick"?', 'classic', [
    { type: 'list', title: 'Die naheliegende, aber unpraktische Alternative', items: [
      'Für jedes VLAN ein eigenes physisches Router-Interface zu verwenden würde funktionieren - ist aber teuer und unflexibel: Router haben nur begrenzt viele Ports, und jedes neue VLAN bräuchte ein weiteres Kabel.',
      '"Router on a Stick" braucht dagegen nur EINE physische Verbindung (den "Stick") zwischen Router und Switch, die als Trunk konfiguriert ist.',
    ] },
  ]));

  exps.push(explanation('subinterface-classic', 'Subinterfaces und 802.1Q-Encapsulation', 'classic', [
    { type: 'text', content: 'Auf der einen physischen Schnittstelle des Routers werden mehrere logische Subinterfaces angelegt - eines pro VLAN. Jedes Subinterface bekommt eine eigene IP-Adresse (das Gateway für genau dieses VLAN) und wird per 802.1Q-Encapsulation demselben VLAN zugeordnet, das auch der Switch dafür verwendet.' },
    { type: 'list', title: 'Wichtig', items: [
      'Ein Subinterface wird mit einem Punkt an den physischen Interface-Namen angehängt, z. B. "g0/0.10" für das Subinterface, das zu VLAN 10 gehört - die Zahl nach dem Punkt ist frei wählbar, wird aber üblicherweise gleich der VLAN-ID gewählt.',
      'Die physische Schnittstelle selbst (z. B. "g0/0") bekommt in diesem Modell KEINE eigene IP-Adresse - nur "no shutdown", damit sie aktiv ist.',
      'Der Switch-seitige Port muss ein Trunk sein, der alle benötigten VLANs erlaubt (siehe Trunk-Lektion).',
    ] },
    { type: 'question', question: 'Warum bekommt bei Router on a Stick die physische Schnittstelle selbst keine eigene IP-Adresse?', options: ['Weil physische Schnittstellen grundsätzlich keine IP-Adressen unterstützen', 'Weil jedes Subinterface eine eigene IP-Adresse für sein VLAN bekommt', 'Weil das Router-Betriebssystem das verbietet', 'Weil das nur bei Switches so ist'], correct: 1, explanation: 'Jedes VLAN bekommt sein eigenes Gateway über ein eigenes Subinterface - die physische Schnittstelle bleibt IP-los, sie transportiert nur den getaggten Verkehr.' },
  ]));

  exps.push(explanation('cli-classic', 'Router on a Stick konfigurieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['interface <Interface>.<Nummer>', 'Legt ein Subinterface an bzw. wechselt in dessen Konfiguration, z. B. "interface g0/0.10".'],
      ['encapsulation dot1q <VLAN-ID>', 'Legt fest, für welches VLAN dieses Subinterface zuständig ist und dass 802.1Q-Tagging verwendet wird - muss der erste Befehl im Subinterface sein.'],
      ['ip address <IP-Adresse> <Subnetzmaske>', 'Vergibt dem Subinterface die Gateway-IP-Adresse für dieses VLAN.'],
      ['no shutdown (auf der physischen Schnittstelle)', 'Aktiviert die zugrunde liegende physische Schnittstelle - ohne sie funktioniert keines der Subinterfaces.'],
    ] },
    { type: 'list', title: 'Beispiel: Router on a Stick für VLAN 10 und VLAN 20 über g0/0', items: [
      'Router(config)# interface g0/0',
      'Router(config-if)# no shutdown',
      'Router(config-if)# exit',
      'Router(config)# interface g0/0.10',
      'Router(config-subif)# encapsulation dot1q 10',
      'Router(config-subif)# ip address 192.168.10.1 255.255.255.0',
      'Router(config-subif)# exit',
      'Router(config)# interface g0/0.20',
      'Router(config-subif)# encapsulation dot1q 20',
      'Router(config-subif)# ip address 192.168.20.1 255.255.255.0',
    ] },
    { type: 'text', content: 'Auf dem Switch muss der verbundene Port zusätzlich als Trunk konfiguriert sein (siehe Trunk-Lektion), der mindestens VLAN 10 und 20 erlaubt.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Router on a Stick löst Inter-VLAN-Routing über eine einzige physische Verbindung mit mehreren Subinterfaces.',
      'Jedes Subinterface (z. B. g0/0.10) gehört per "encapsulation dot1q <VLAN-ID>" zu genau einem VLAN und bekommt seine eigene Gateway-IP.',
      'Die physische Schnittstelle bleibt IP-los, braucht aber "no shutdown".',
      'Der switch-seitige Port muss ein Trunk sein, der alle beteiligten VLANs erlaubt.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'router-on-stick-ordering',
      type: 'ordering',
      question: 'Bringe die Schritte zur Konfiguration eines Subinterfaces für VLAN 10 in die richtige Reihenfolge.',
      items: [
        { id: 'int', label: 'interface g0/0.10' },
        { id: 'encap', label: 'encapsulation dot1q 10' },
        { id: 'ip', label: 'ip address 192.168.10.1 255.255.255.0' },
      ],
      correctOrder: ['int', 'encap', 'ip'],
      explanation: 'Erst das Subinterface wählen, dann die Encapsulation (VLAN-Zuordnung) festlegen, dann die IP-Adresse vergeben.',
    },
    {
      id: 'router-on-stick-select',
      type: 'select-best',
      question: 'Welche IP-Adresse bekommt die physische Schnittstelle g0/0 bei Router on a Stick?',
      options: ['Die Gateway-Adresse von VLAN 1', 'Eine Adresse außerhalb aller VLANs', 'Keine - nur die Subinterfaces bekommen IP-Adressen', 'Dieselbe Adresse wie alle Subinterfaces'],
      correct: 2,
      explanation: 'Die physische Schnittstelle bleibt IP-los, jedes VLAN bekommt sein Gateway über ein eigenes Subinterface.',
    },
    {
      id: 'router-on-stick-cli',
      type: 'cli-input',
      question: 'Konfiguriere ein Subinterface für VLAN 30 auf g0/0 mit der Gateway-Adresse 192.168.30.1/24.',
      expectedLines: ['interface g0/0.30', 'encapsulation dot1q 30', 'ip address 192.168.30.1 255.255.255.0'],
      explanation: 'Subinterface wählen, VLAN per Encapsulation zuordnen, Gateway-IP vergeben.',
    },
    {
      id: 'roas-trunk-missing-select',
      type: 'select-best',
      question: 'Die Subinterfaces und Gateway-IPs sind korrekt, aber VLAN 10 und 20 können nicht kommunizieren. Was prüfst du zuerst auf dem Switch?',
      options: ['Ob der Switch-Port zum Router ein Trunk ist, der VLAN 10 und 20 erlaubt', 'Ob VLAN 1 gelöscht wurde', 'Ob das Router-Interface eine MAC-Adresse hat', 'Ob der Switch neu gestartet werden muss'],
      correct: 0,
      explanation: 'Router-on-a-Stick braucht einen Trunk, der alle beteiligten VLANs erlaubt. Ohne Trunk erreichen die getaggten Frames den Router nicht.',
    },
    {
      id: 'roas-physical-shutdown-select',
      type: 'select-best',
      question: 'Alle Subinterfaces sind konfiguriert, aber "show ip interface brief" zeigt g0/0 als administratively down. Was fehlt?',
      options: ['Eine IP-Adresse auf g0/0', '"no shutdown" auf der physischen Schnittstelle g0/0', 'Eine statische Route', 'Ein VLAN-Name'],
      correct: 1,
      explanation: 'Auch wenn die physische Schnittstelle bei Router-on-a-Stick keine IP-Adresse bekommt, muss sie mit "no shutdown" aktiviert werden, damit die Subinterfaces funktionieren.',
    },
    {
      id: 'roas-wrong-encapsulation-select',
      type: 'select-best',
      question: 'VLAN 10 funktioniert, VLAN 20 nicht. Was ist eine wahrscheinliche Ursache?',
      options: ['Das Subinterface hat die falsche VLAN-ID in "encapsulation dot1q"', 'Die physische Schnittstelle hat keine IP', 'Der Switch ist ein Access-Port', 'VLAN 10 ist das Native VLAN'],
      correct: 0,
      explanation: 'Wenn das Subinterface nicht dem richtigen VLAN zugeordnet ist, werden die Frames dem falschen (oder keinem) Netz zugeordnet.',
    },
    {
      id: 'roas-verify-cli',
      type: 'cli-input',
      question: 'Du hast Router-on-a-Stick konfiguriert. Zeige alle Interfaces und Subinterfaces mit Status und IP-Adresse an.',
      expectedLines: [['show ip interface brief', 'sh ip int br']],
      explanation: '"show ip interface brief" zeigt sowohl physische Interfaces als auch Subinterfaces kompakt.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was ist der zentrale Vorteil von Router on a Stick?', options: ['Er benötigt keine IP-Adressen', 'Nur eine physische Verbindung reicht für das Routing beliebig vieler VLANs', 'Er funktioniert ohne Switch', 'Er ersetzt Trunk-Ports vollständig'], correct: 1, explanation: 'Eine einzige physische Verbindung mit mehreren Subinterfaces reicht für alle VLANs.' },
    { question: 'Welcher Befehl legt fest, zu welchem VLAN ein Subinterface gehört?', options: ['switchport access vlan', 'encapsulation dot1q <VLAN-ID>', 'ip vlan <VLAN-ID>', 'vlan <VLAN-ID>'], correct: 1, explanation: '"encapsulation dot1q" ordnet ein Subinterface einem VLAN zu und aktiviert 802.1Q-Tagging.' },
    { question: 'Wie wird ein Subinterface benannt, das zu VLAN 20 auf g0/0 gehört (übliche Konvention)?', options: ['g0/0-20', 'g0/0/20', 'g0/0.20', 'vlan20.g0/0'], correct: 2, explanation: 'Subinterfaces werden mit einem Punkt an den physischen Interface-Namen angehängt.' },
    { question: 'Was muss der switch-seitige Port zwingend sein, damit Router on a Stick funktioniert?', options: ['Ein Access-Port im nativen VLAN', 'Ein Trunk, der die beteiligten VLANs erlaubt', 'Ein deaktivierter Port', 'Ein Port im VLAN 1'], correct: 1, explanation: 'Ohne Trunk kommen die getaggten Frames der verschiedenen VLANs nicht am Router an.' },
    { question: 'Muss die physische Schnittstelle g0/0 bei Router on a Stick trotzdem aktiviert werden?', options: ['Nein, das übernehmen die Subinterfaces automatisch', 'Ja, mit "no shutdown" auf der physischen Schnittstelle', 'Nein, physische Schnittstellen sind immer aktiv', 'Nur wenn kein Subinterface konfiguriert ist'], correct: 1, explanation: 'Ohne "no shutdown" auf der physischen Schnittstelle funktioniert keines ihrer Subinterfaces.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "VLAN 10 und VLAN 20 sollen über Router on a Stick auf g0/0 kommunizieren können. Fang mit VLAN 10 an: Gateway 192.168.10.1/24."',
      expectedLines: ['interface g0/0.10', 'encapsulation dot1q 10', 'ip address 192.168.10.1 255.255.255.0'],
      explanation: 'Subinterface für VLAN 10 mit Encapsulation und Gateway-IP.',
    },
    {
      prompt: 'Sam: "Jetzt das Subinterface für VLAN 20, Gateway 192.168.20.1/24."',
      expectedLines: ['interface g0/0.20', 'encapsulation dot1q 20', 'ip address 192.168.20.1 255.255.255.0'],
      explanation: 'Gleiches Muster wie bei VLAN 10, nur mit VLAN-ID 20 und der passenden Gateway-Adresse.',
    },
    {
      prompt: 'Sam: "Vergiss nicht, die physische Schnittstelle g0/0 selbst zu aktivieren."',
      expectedLines: ['interface g0/0', 'no shutdown'],
      explanation: 'Ohne "no shutdown" auf der physischen Schnittstelle bleiben alle Subinterfaces wirkungslos.',
    },
  ];
}

export function buildCiscoInterVlanRoutingLesson() {
  return {
    title: 'Router on a Stick',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
