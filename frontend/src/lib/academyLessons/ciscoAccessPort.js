import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Access-Port" - fills the catalog's existing `cisco-packet-tracer/access-port`
// slot. Builds directly on the "VLAN" lesson (vlan/name/show vlan brief) and
// on the compact access-port primer already in Grundkonfiguration - focuses
// on assigning real ports to VLANs, verifying the result and troubleshooting
// the most common access-port mistakes, with heavy CLI-input practice.
// =============================================================================

export const CISCO_ACCESS_PORT_TOPIC_KEY = topicKey('cisco-packet-tracer', 'access-port');

const ACCESS_VS_TRUNK_SVG = `<svg viewBox="0 0 340 200" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="170" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Access vs Trunk</text><rect x="120" y="40" width="100" height="40" rx="6" fill="#00f0ff" opacity="0.9"/><text x="170" y="66" text-anchor="middle" fill="#0a1628" font-size="12" font-weight="bold">Switch</text><rect x="10" y="120" width="80" height="60" rx="6" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="50" y="145" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">PC A</text><text x="50" y="165" text-anchor="middle" fill="#8b949e" font-size="9">VLAN 10</text><line x1="120" y1="75" x2="90" y2="130" stroke="#8b949e" stroke-width="2"/><text x="75" y="105" text-anchor="middle" fill="#8b949e" font-size="9">Access</text><rect x="120" y="120" width="80" height="60" rx="6" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="160" y="145" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">PC B</text><text x="160" y="165" text-anchor="middle" fill="#8b949e" font-size="9">VLAN 20</text><line x1="170" y1="80" x2="160" y2="120" stroke="#8b949e" stroke-width="2"/><text x="140" y="105" text-anchor="middle" fill="#8b949e" font-size="9">Access</text><rect x="230" y="120" width="80" height="60" rx="6" fill="#00f0ff" opacity="0.5" stroke="#00f0ff" stroke-width="2"/><text x="270" y="145" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">Switch 2</text><text x="270" y="165" text-anchor="middle" fill="#0a1628" font-size="9">VLAN 10,20</text><line x1="220" y1="75" x2="270" y2="120" stroke="#00f0ff" stroke-width="3"/><text x="255" y="105" text-anchor="middle" fill="#00f0ff" font-size="9">Trunk</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Vom VLAN zum Access-Port', 'classic', [
    { type: 'text', content: 'Ein VLAN allein bewirkt noch nichts - erst wenn ein Port diesem VLAN zugewiesen wird, landet ein angeschlossenes Endgerät tatsächlich darin. Genau das übernimmt der Access-Port: die Verbindung zwischen einem einzelnen Endgerät und genau einem VLAN.' },
  ]));

  exps.push(explanation('wozu-classic', 'Wofür genau ist ein Access-Port da?', 'classic', [
    { type: 'list', title: 'Merkmale eines Access-Ports', items: [
      'Verbindet genau EIN Endgerät (PC, Drucker, IP-Telefon, Access Point) mit dem Switch.',
      'Überträgt Frames für genau EIN VLAN - und zwar ungetaggt. Das Endgerät selbst "weiß" nichts von VLANs.',
      'Ist der Port-Typ für praktisch jeden normalen Benutzer-Anschluss - im Gegensatz zum Trunk-Port, der mehrere VLANs zwischen Switches transportiert (siehe nächste Lektion).',
    ] },
  ]));

  exps.push(explanation('access-vs-trunk-visual', 'Access vs Trunk im Überblick', 'visual', [
    { type: 'diagram', content: ACCESS_VS_TRUNK_SVG },
    { type: 'text', content: 'PC A und PC B bekommen jeweils einen Access-Port für genau ihr VLAN. Zur Verbindung zwischen zwei Switches wird ein Trunk genutzt, der beide VLANs getaggt transportiert.' },
  ]));

  exps.push(explanation('cli-classic', 'Einen Port als Access-Port konfigurieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['interface <Interface>', 'Wechselt in den Konfigurationsmodus der angegebenen Schnittstelle, z. B. "interface fa0/3".'],
      ['switchport mode access', 'Legt den Port fest als Access-Port fest (unabhängig davon, welchem VLAN er später zugewiesen wird).'],
      ['switchport access vlan <VLAN-ID>', 'Weist dem Access-Port ein bereits angelegtes VLAN zu.'],
      ['show interfaces switchport', 'Zeigt pro Port detaillierte Switchport-Informationen, u. a. Administrative Mode und zugewiesenes VLAN.'],
      ['show vlan brief', 'Zeigt kompakt, welche Ports welchem VLAN zugewiesen sind - dein schnellster Kontrollbefehl.'],
    ] },
    { type: 'list', title: 'Beispiel: FastEthernet0/3 dem VLAN 20 zuweisen', items: [
      'Switch(config)# interface fa0/3',
      'Switch(config-if)# switchport mode access',
      'Switch(config-if)# switchport access vlan 20',
      'Switch(config-if)# exit',
    ] },
  ]));

  exps.push(explanation('mehrere-ports-classic', 'Mehrere Ports gleichzeitig konfigurieren', 'classic', [
    { type: 'text', content: 'Wenn mehrere Ports dieselbe Konfiguration bekommen sollen (z. B. ein ganzer Bereich von Benutzer-Ports im selben VLAN), musst du nicht jeden Port einzeln durchgehen.' },
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['interface range <Interface-Liste>', 'Wählt mehrere Schnittstellen gleichzeitig aus, z. B. "interface range fa0/1-10" für die Ports 1 bis 10.'],
    ] },
    { type: 'text', content: 'Alle Befehle, die danach eingegeben werden, gelten dann für jeden Port in der ausgewählten Liste gleichzeitig.' },
  ]));

  exps.push(explanation('fehler-classic', 'Typische Fehler bei Access-Ports', 'classic', [
    { type: 'list', title: 'Woran es meistens liegt, wenn ein Endgerät nicht im richtigen VLAN landet', items: [
      'Das VLAN wurde noch nicht angelegt, bevor es einem Port zugewiesen wurde ("switchport access vlan 20" scheitert bzw. bleibt inaktiv, wenn VLAN 20 nicht existiert).',
      'Der Port wurde versehentlich als Trunk statt Access konfiguriert ("switchport mode trunk" statt "switchport mode access").',
      'Ein Tippfehler in der Interface-Bezeichnung (z. B. "fa0/3" statt "fa0/13") - die Konfiguration landet dann auf dem falschen Port.',
      'Vergessen, den Port danach zu prüfen - "show vlan brief" oder "show interfaces switchport" zeigen sofort, ob die Zuweisung wie erwartet angekommen ist.',
    ] },
    { type: 'question', question: 'Ein Port soll VLAN 30 zugewiesen werden, aber "switchport access vlan 30" bleibt ohne Wirkung. Was ist die wahrscheinlichste Ursache?', options: ['Der Switch ist defekt', 'VLAN 30 wurde noch nicht angelegt', 'Der Befehl existiert nicht', 'Access-Ports können keine VLAN-IDs über 20 haben'], correct: 1, explanation: 'Ein VLAN muss zuerst mit "vlan <ID>" angelegt werden, bevor es einem Port zugewiesen werden kann.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Access-Port-Konfiguration: "interface <Interface>" → "switchport mode access" → "switchport access vlan <ID>".',
      'Mehrere Ports gleichzeitig: "interface range <Liste>" vor den restlichen Befehlen.',
      'Kontrolle: "show vlan brief" (welcher Port in welchem VLAN) oder "show interfaces switchport" (Details pro Port).',
      'Häufigster Fehler: das VLAN existiert noch nicht, wenn es einem Port zugewiesen werden soll.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'access-port-ordering',
      type: 'ordering',
      question: 'Bringe die Befehle zur Access-Port-Konfiguration in die richtige Reihenfolge.',
      items: [
        { id: 'int', label: 'interface fa0/5' },
        { id: 'mode', label: 'switchport mode access' },
        { id: 'assign', label: 'switchport access vlan 20' },
      ],
      correctOrder: ['int', 'mode', 'assign'],
      explanation: 'Zuerst die Schnittstelle auswählen, dann den Modus festlegen, dann das VLAN zuweisen.',
    },
    {
      id: 'access-port-select-fehler',
      type: 'select-best',
      question: 'Ein Endgerät an fa0/8 landet trotz "switchport access vlan 40" weiterhin in VLAN 1. Was prüfst du zuerst?',
      options: ['Ob VLAN 40 überhaupt existiert', 'Ob das Netzwerkkabel lang genug ist', 'Ob der Switch neu gestartet werden muss', 'Ob das Endgerät eine feste IP-Adresse hat'],
      correct: 0,
      explanation: 'Ein Port kann keinem VLAN zugewiesen werden, das noch nicht angelegt wurde - das ist die häufigste Fehlerursache.',
    },
    {
      id: 'access-port-cli-single',
      type: 'cli-input',
      question: 'Konfiguriere FastEthernet0/3 als Access-Port im VLAN 20.',
      hint: 'Drei Zeilen: interface, mode, vlan-Zuweisung.',
      expectedLines: ['interface fa0/3', 'switchport mode access', 'switchport access vlan 20'],
      explanation: 'interface wählt den Port, switchport mode access legt den Port-Typ fest, switchport access vlan weist das VLAN zu.',
    },
    {
      id: 'access-port-cli-range',
      type: 'cli-input',
      question: 'Weise die Ports FastEthernet0/1 bis FastEthernet0/10 gemeinsam dem VLAN 10 zu.',
      hint: 'Nutze "interface range", statt jeden Port einzeln zu konfigurieren.',
      expectedLines: ['interface range fa0/1-10', 'switchport mode access', 'switchport access vlan 10'],
      explanation: '"interface range" wendet die folgenden Befehle auf alle ausgewählten Ports gleichzeitig an.',
    },
    {
      id: 'access-port-trunk-mistake-select',
      type: 'select-best',
      question: 'Ein PC an fa0/5 soll VLAN 20 erreichen, aber "show interfaces switchport" zeigt "Administrative Mode: trunk". Was ist zu tun?',
      options: ['Den PC neu starten', 'Den Port als Access-Port konfigurieren und VLAN 20 zuweisen', 'Das VLAN 20 löschen und neu anlegen', 'Ein Trunk-Kabel verwenden'],
      correct: 1,
      explanation: 'Ein Endgeräte-Port muss "switchport mode access" erhalten und einem VLAN zugewiesen werden, damit das Gerät im richtigen VLAN landet.',
    },
    {
      id: 'access-port-verify-cli',
      type: 'cli-input',
      question: 'Ein PC an FastEthernet0/8 soll im VLAN 30 sein. Konfiguriere den Port und verifiziere anschließend mit "show vlan brief".',
      expectedLines: ['interface fa0/8', 'switchport mode access', 'switchport access vlan 30', 'show vlan brief'],
      explanation: 'Konfiguriere den Port, prüfe dann mit "show vlan brief", ob der Port korrekt zugewiesen wurde.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Wie viele VLANs kann ein einzelner Access-Port gleichzeitig bedienen?', options: ['Beliebig viele', 'Genau eines', 'Maximal zwei', 'Keines, dafür ist ein Trunk nötig'], correct: 1, explanation: 'Ein Access-Port überträgt immer nur ein einziges VLAN.' },
    { question: 'Welcher Befehl legt einen Port als Access-Port fest?', options: ['switchport access vlan 10', 'switchport mode trunk', 'switchport mode access', 'interface range fa0/1-10'], correct: 2, explanation: '"switchport mode access" bestimmt den Port-Typ, unabhängig vom später zugewiesenen VLAN.' },
    { question: 'Welcher Befehl zeigt am schnellsten, welche Ports welchem VLAN zugewiesen sind?', options: ['show running-config', 'show vlan brief', 'show interfaces trunk', 'show ip interface brief'], correct: 1, explanation: '"show vlan brief" listet VLANs mit ihren zugewiesenen Ports kompakt auf.' },
    { question: 'Was bewirkt "interface range fa0/1-10"?', options: ['Es löscht die Konfiguration der Ports 1-10', 'Es wählt die Ports 1 bis 10 gleichzeitig zur weiteren Konfiguration aus', 'Es erstellt automatisch VLAN 1 bis 10', 'Es aktiviert Trunking auf allen Ports'], correct: 1, explanation: 'Damit lassen sich mehrere Ports gleichzeitig konfigurieren, ohne jeden einzeln durchzugehen.' },
    { question: '"switchport access vlan 25" zeigt keine Wirkung. Was ist die wahrscheinlichste Ursache?', options: ['Der Port ist defekt', 'VLAN 25 wurde noch nicht angelegt', 'Der Befehl ist falsch geschrieben', 'Access-Ports unterstützen keine geraden VLAN-IDs'], correct: 1, explanation: 'Ein VLAN muss vor der Zuweisung existieren.' },
    { question: 'Ein Port zeigt "Administrative Mode: trunk". Warum ist das für einen einzelnen PC-Port falsch?', options: ['Trunks sind generell verboten', 'Ein PC-Port sollte Access sein und genau ein VLAN transportieren', 'Trunk-Ports können keine IP-Adressen haben', 'Access-Ports sind schneller'], correct: 1, explanation: 'Ein Access-Port ist für ein einzelnes Endgerät gedacht; ein Trunk transportiert mehrere VLANs.' },
    { question: 'Welcher Befehl zeigt detailliert, ob ein Port Access oder Trunk ist?', options: ['show vlan brief', 'show interfaces switchport', 'show interfaces trunk', 'show ip interface brief'], correct: 1, explanation: '"show interfaces switchport" zeigt den administrativen Modus und das zugewiesene VLAN eines Ports.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Am Empfang steht ein neuer PC an FastEthernet0/7. Konfiguriere den Port als Access-Port im VLAN 10."',
      expectedLines: ['interface fa0/7', 'switchport mode access', 'switchport access vlan 10'],
      explanation: 'Ein einzelner Access-Port: interface, mode access, vlan-Zuweisung.',
    },
    {
      prompt: 'Sam: "Die komplette dritte Etage (Ports FastEthernet0/11 bis 0/20) soll ins VLAN 30. Mach das in einem Zug."',
      expectedLines: ['interface range fa0/11-20', 'switchport mode access', 'switchport access vlan 30'],
      explanation: 'Mit "interface range" konfigurierst du mehrere Ports gleichzeitig, statt jeden einzeln.',
    },
    {
      prompt: 'Sam: "Zeig mir kurz die Switchport-Details von GigabitEthernet0/1."',
      expectedLines: [['show interfaces switchport', 'show int switchport']],
      explanation: '"show interfaces switchport" liefert die Details zum Access-/Trunk-Status eines einzelnen Ports.',
    },
  ];
}

export function buildCiscoAccessPortLesson() {
  return {
    title: 'Access-Port',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
