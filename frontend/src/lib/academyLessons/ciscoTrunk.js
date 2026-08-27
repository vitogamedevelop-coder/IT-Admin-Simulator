import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Trunk" - fills the catalog's existing `cisco-packet-tracer/trunk` slot.
// Builds on "VLAN" and "Access-Port" - deepens 802.1Q tagging, native VLAN
// and allowed-VLAN lists beyond the short primer already in Grundkonfiguration,
// with heavy CLI-input practice.
// =============================================================================

export const CISCO_TRUNK_TOPIC_KEY = topicKey('cisco-packet-tracer', 'trunk');

const TRUNK_TOPOLOGY_SVG = `<svg viewBox="0 0 340 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="170" y="25" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Trunk zwischen zwei Switches</text><rect x="40" y="60" width="90" height="40" rx="6" fill="#00f0ff" opacity="0.9"/><text x="85" y="85" text-anchor="middle" fill="#0a1628" font-size="11" font-weight="bold">Switch A</text><rect x="210" y="60" width="90" height="40" rx="6" fill="#00f0ff" opacity="0.9"/><text x="255" y="85" text-anchor="middle" fill="#0a1628" font-size="11" font-weight="bold">Switch B</text><rect x="10" y="150" width="70" height="45" rx="6" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="45" y="170" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">PC A</text><text x="45" y="185" text-anchor="middle" fill="#8b949e" font-size="8">VLAN 10</text><rect x="100" y="150" width="70" height="45" rx="6" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="135" y="170" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">PC B</text><text x="135" y="185" text-anchor="middle" fill="#8b949e" font-size="8">VLAN 20</text><rect x="190" y="150" width="70" height="45" rx="6" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="225" y="170" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">PC C</text><text x="225" y="185" text-anchor="middle" fill="#8b949e" font-size="8">VLAN 10</text><rect x="280" y="150" width="45" height="45" rx="6" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="302" y="170" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">PC</text><text x="302" y="185" text-anchor="middle" fill="#8b949e" font-size="8">VLAN 20</text><line x1="45" y1="150" x2="70" y2="100" stroke="#8b949e" stroke-width="2"/><line x1="135" y1="150" x2="100" y2="100" stroke="#8b949e" stroke-width="2"/><line x1="225" y1="150" x2="255" y2="100" stroke="#8b949e" stroke-width="2"/><line x1="302" y1="150" x2="285" y2="100" stroke="#8b949e" stroke-width="2"/><line x1="130" y1="80" x2="210" y2="80" stroke="#00f0ff" stroke-width="3"/><text x="170" y="110" text-anchor="middle" fill="#00f0ff" font-size="9">Trunk VLAN 10,20</text></svg>`;

const FRAME_TAGGING_SVG = `<svg viewBox="0 0 320 120" class="w-full h-auto max-h-48" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="35" width="80" height="50" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="50" y="55" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">Ethernet</text><text x="50" y="72" text-anchor="middle" fill="#8b949e" font-size="8">ungetaggt</text><text x="50" y="95" text-anchor="middle" fill="#8b949e" font-size="8">Access-Port</text><rect x="130" y="35" width="160" height="50" rx="5" fill="#00f0ff" opacity="0.5" stroke="#00f0ff" stroke-width="2"/><text x="170" y="55" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">Ethernet</text><text x="210" y="55" text-anchor="middle" fill="#0a1628" font-size="10" font-weight="bold">802.1Q Tag</text><text x="210" y="72" text-anchor="middle" fill="#0a1628" font-size="8">VLAN-ID</text><text x="170" y="95" text-anchor="middle" fill="#0a1628" font-size="8">Trunk</text><polygon points="105,60 90,55 90,65" fill="#00f0ff"/><polygon points="125,60 110,55 110,65" fill="#00f0ff"/><text x="115" y="30" text-anchor="middle" fill="#8b949e" font-size="9">Tag hinzugefügt</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Warum ein einzelner Access-Port nicht reicht', 'classic', [
    { type: 'text', content: 'Ein Access-Port transportiert genau ein VLAN. Sobald zwei Switches Datenverkehr für mehrere VLANs austauschen müssen, wäre pro VLAN eine eigene Kabelverbindung nötig - unpraktisch und teuer. Der Trunk-Port löst das, indem er mehrere VLANs über eine einzige physische Leitung transportiert.' },
  ]));

  exps.push(explanation('topology-visual', 'Topologie: Access-Ports und Trunk', 'visual', [
    { type: 'diagram', content: TRUNK_TOPOLOGY_SVG },
    { type: 'text', content: 'Endgeräte erhalten Access-Ports für genau ein VLAN. Der Verbindungslink zwischen zwei Switches wird zum Trunk, damit beide VLANs über ein Kabel übertragen werden können.' },
  ]));

  exps.push(explanation('tagging-classic', '802.1Q-Tagging im Detail', 'classic', [
    { type: 'list', title: 'Wie ein Trunk mehrere VLANs unterscheidet', items: [
      'Beim Verlassen eines Trunk-Ports wird jedem Ethernet-Frame ein kleines VLAN-Tag nach IEEE 802.1Q eingefügt, das die VLAN-ID enthält.',
      'Der empfangende Switch liest das Tag, ordnet den Frame dem richtigen VLAN zu und entfernt das Tag wieder, bevor der Frame an einen Access-Port weitergeleitet wird.',
      'Auf einem Access-Port kommen und gehen Frames dagegen immer ungetaggt an - das Endgerät bekommt vom Tagging nichts mit.',
    ] },
  ]));

  exps.push(explanation('tagging-visual', '802.1Q-Tag am Frame', 'visual', [
    { type: 'diagram', content: FRAME_TAGGING_SVG },
    { type: 'text', content: 'Auf einem Access-Port bleibt der Frame ungetaggt. Auf dem Trunk wird ein 802.1Q-Tag mit der VLAN-ID eingefügt, damit der empfangende Switch den Frame wieder korrekt zuordnen kann.' },
  ]));

  exps.push(explanation('native-vlan-classic', 'Native VLAN', 'classic', [
    { type: 'text', content: 'Ein Trunk hat immer ein "Native VLAN" (Standard: VLAN 1). Frames dieses VLANs werden auf dem Trunk ausnahmsweise UNGETAGGT übertragen - historisch für die Kompatibilität mit älteren Geräten, die kein 802.1Q verstehen.' },
    { type: 'list', title: 'Wichtig in der Praxis', items: [
      'Beide Enden eines Trunks müssen dasselbe Native VLAN konfiguriert haben - sonst gibt es eine Fehlkonfiguration (VLAN-Mismatch), die IOS meist mit einer Warnung meldet.',
      'Aus Sicherheitsgründen wird empfohlen, das Native VLAN auf ein eigenes, ungenutztes VLAN zu ändern statt VLAN 1 zu belassen.',
    ] },
    { type: 'question', question: 'Was ist an Frames des Native VLANs auf einem Trunk besonders?', options: ['Sie werden doppelt übertragen', 'Sie werden ungetaggt übertragen', 'Sie werden priorisiert', 'Sie dürfen nicht über den Trunk laufen'], correct: 1, explanation: 'Das Native VLAN ist das einzige VLAN, dessen Frames auf einem Trunk ungetaggt bleiben.' },
  ]));

  exps.push(explanation('cli-classic', 'Trunk konfigurieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['interface <Interface>', 'Wechselt in die Konfiguration der Schnittstelle, die als Trunk arbeiten soll.'],
      ['switchport mode trunk', 'Legt den Port fest als Trunk-Port fest.'],
      ['switchport trunk allowed vlan <Liste>', 'Beschränkt den Trunk auf bestimmte VLANs, z. B. "switchport trunk allowed vlan 10,20,30". Ohne diesen Befehl sind standardmäßig alle VLANs erlaubt.'],
      ['switchport trunk native vlan <VLAN-ID>', 'Legt fest, welches VLAN auf diesem Trunk ungetaggt (als Native VLAN) übertragen wird.'],
      ['show interfaces trunk', 'Zeigt alle aktuell als Trunk konfigurierten Ports inklusive erlaubter VLANs und Native VLAN.'],
    ] },
    { type: 'list', title: 'Beispiel: Trunk zwischen zwei Switches, nur VLAN 10 und 20 erlaubt', items: [
      'Switch(config)# interface gi0/1',
      'Switch(config-if)# switchport mode trunk',
      'Switch(config-if)# switchport trunk allowed vlan 10,20',
    ] },
  ]));

  exps.push(explanation('allowed-semantics-classic', 'Allowed VLANs – ersetzen, ergänzen, entfernen', 'classic', [
    { type: 'table', headers: ['Befehl', 'Wirkung'], rows: [
      ['switchport trunk allowed vlan 10,20', 'Ersetzt die erlaubte Liste durch genau VLAN 10 und 20.'],
      ['switchport trunk allowed vlan add 30', 'Ergänzt VLAN 30 zur bestehenden erlaubten Liste.'],
      ['switchport trunk allowed vlan remove 20', 'Entfernt VLAN 20 aus der erlaubten Liste.'],
    ] },
    { type: 'text', content: 'Wichtig: "allowed vlan" ohne "add" oder "remove" ersetzt die ganze Liste. Das ist ein klassischer Fehler, der VLANs unabsichtlich vom Trunk ausschließt.' },
  ]));

  exps.push(explanation('dtp-classic', 'DTP bewusst ausschalten', 'classic', [
    { type: 'text', content: 'Cisco-Geräte können Trunks dynamisch mit DTP (Dynamic Trunking Protocol) aushandeln. In der Praxis bevorzugt man jedoch eine explizite Konfiguration, weil das Verhalten von Switch-Modell und IOS-Version abhängen kann.' },
    { type: 'list', title: 'Empfohlene Praxis', items: [
      'Access-Ports explizit mit "switchport mode access" konfigurieren.',
      'Trunks explizit mit "switchport mode trunk" konfigurieren.',
      'Optional DTP-Aushandlung mit "switchport nonegotiate" deaktivieren.',
    ] },
  ]));

  exps.push(explanation('verify-flow-classic', 'Trunk-Verifizieren', 'classic', [
    { type: 'list', title: 'Reihenfolge', items: [
      '"show interfaces trunk" - Welche Ports sind Trunk? Welche VLANs sind allowed und active?',
      '"show vlan brief" - Fehlt ein VLAN komplett, erscheint es nirgendwo.',
      '"show running-config" - Zeigt die konkrete Interface-Konfiguration.',
    ] },
    { type: 'text', content: 'Merke: "allowed" bedeutet nicht automatisch "active". Ein VLAN kann auf dem Trunk erlaubt, aber auf dem Switch nicht angelegt sein - dann ist es nicht aktiv.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Ein Trunk transportiert mehrere VLANs über eine Leitung, mit 802.1Q-Tags zur Unterscheidung.',
      'Nur das Native VLAN (Standard VLAN 1) wird auf einem Trunk ungetaggt übertragen - beide Enden müssen übereinstimmen.',
      'Konfiguration: "interface <Interface>" → "switchport mode trunk" → optional "switchport trunk allowed vlan <Liste>".',
      '"switchport trunk allowed vlan" ohne add/remove ersetzt die Liste.',
      'Kontrolle: "show interfaces trunk" zeigt Status, erlaubte VLANs und Native VLAN aller Trunk-Ports.',
      'Allowed ≠ active: ein erlaubtes VLAN muss auch auf dem Switch existieren.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'trunk-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff seiner Bedeutung zu.',
      pairs: [
        { left: '802.1Q-Tag', leftLabel: '802.1Q-Tag', right: 'Kennzeichnet, zu welchem VLAN ein Frame auf dem Trunk gehört' },
        { left: 'Native VLAN', leftLabel: 'Native VLAN', right: 'Das einzige VLAN, das auf einem Trunk ungetaggt übertragen wird' },
        { left: 'allowed vlan', leftLabel: 'allowed vlan', right: 'Schränkt ein, welche VLANs über den Trunk dürfen' },
      ],
      explanation: '802.1Q taggt Frames für die VLAN-Zuordnung, das Native VLAN bleibt ungetaggt, "allowed vlan" grenzt die erlaubten VLANs ein.',
    },
    {
      id: 'trunk-ordering',
      type: 'ordering',
      question: 'Bringe die Befehle zur Trunk-Konfiguration in die richtige Reihenfolge.',
      items: [
        { id: 'int', label: 'interface gi0/1' },
        { id: 'mode', label: 'switchport mode trunk' },
        { id: 'allowed', label: 'switchport trunk allowed vlan 10,20' },
      ],
      correctOrder: ['int', 'mode', 'allowed'],
      explanation: 'Erst die Schnittstelle wählen, dann den Trunk-Modus setzen, danach optional die erlaubten VLANs einschränken.',
    },
    {
      id: 'trunk-cli-basic',
      type: 'cli-input',
      question: 'Konfiguriere GigabitEthernet0/1 als Trunk-Port.',
      expectedLines: ['interface gi0/1', 'switchport mode trunk'],
      explanation: 'interface wählt den Port, switchport mode trunk legt den Port-Typ fest.',
    },
    {
      id: 'trunk-cli-allowed',
      type: 'cli-input',
      question: 'Konfiguriere GigabitEthernet0/2 als Trunk, der nur VLAN 10, 20 und 30 überträgt.',
      hint: 'Denk an die Liste ohne Leerzeichen nach den Kommas.',
      expectedLines: ['interface gi0/2', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20,30'],
      explanation: '"switchport trunk allowed vlan" mit einer kommagetrennten Liste beschränkt den Trunk auf genau diese VLANs.',
    },
    {
      id: 'trunk-allowed-add-cli',
      type: 'cli-input',
      question: 'Der Trunk an GigabitEthernet0/3 erlaubt bereits VLAN 10 und 20. Füge VLAN 30 zur erlaubten Liste hinzu, ohne die bestehenden VLANs zu entfernen.',
      expectedLines: ['interface gi0/3', 'switchport trunk allowed vlan add 30'],
      explanation: '"add" ergänzt VLAN 30 zur bestehenden erlaubten Liste. Ohne "add" würde die Liste auf nur VLAN 30 reduziert werden.',
    },
    {
      id: 'trunk-native-mismatch-select',
      type: 'select-best',
      question: 'Switch A hat "switchport trunk native vlan 10", Switch B hat "switchport trunk native vlan 1". Was ist die Folge?',
      options: ['Keine, Native VLAN spielt keine Rolle', 'Es entsteht ein Native-VLAN-Mismatch; ungetaggte Frames landen im falschen VLAN', 'Der Trunk wird automatisch deaktiviert', 'Alle VLANs werden ungetaggt'],
      correct: 1,
      explanation: 'Beide Enden eines Trunks müssen dasselbe Native VLAN verwenden, sonst werden ungetaggte Frames auf der Gegenseite dem falschen VLAN zugeordnet.',
    },
    {
      id: 'trunk-allowed-vs-active-select',
      type: 'select-best',
      question: '"show interfaces trunk" zeigt VLAN 50 als "allowed", aber nicht als "active". Was fehlt wahrscheinlich?',
      options: ['Das VLAN ist auf dem Trunk nicht erlaubt', 'VLAN 50 wurde auf diesem Switch noch nicht mit "vlan 50" angelegt', 'Der Trunk ist falsch konfiguriert', 'Das Native VLAN ist falsch'],
      correct: 1,
      explanation: '"allowed" bedeutet, dass das VLAN theoretisch über den Trunk darf. "active" bedeutet, dass es auch auf dem Switch existiert.',
    },
    {
      id: 'trunk-access-vs-trunk-select',
      type: 'select-best',
      question: 'Zwei Switches sind verbunden. Auf Switch A ist der Port ein Trunk, auf Switch B ein Access-Port im VLAN 10. Was ist das Problem?',
      options: ['Keines, Access-Ports können Trunks ersetzen', 'Switch B empfängt getaggte Frames, ordnet sie aber VLAN 10 zu statt den VLAN-IDs im Tag', 'Der Link funktioniert wie ein normaler Trunk', 'VLAN 10 wird blockiert'],
      correct: 1,
      explanation: 'Auf einer Seite Trunk, auf der anderen Access führt zu Fehlzuordnungen: getaggte Frames werden nicht korrekt interpretiert.',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Wozu dient ein 802.1Q-Tag?', options: ['Es verschlüsselt den Frame', 'Es kennzeichnet, zu welchem VLAN ein Frame gehört', 'Es priorisiert Sprachverkehr', 'Es ersetzt die MAC-Adresse'], correct: 1, explanation: 'Das Tag transportiert die VLAN-ID, damit der empfangende Switch den Frame richtig zuordnen kann.' },
    { question: 'Welches VLAN wird auf einem Trunk standardmäßig ungetaggt übertragen?', options: ['Das VLAN mit der höchsten ID', 'Das Native VLAN (Standard: VLAN 1)', 'Alle VLANs gleichzeitig', 'Kein VLAN, alles wird immer getaggt'], correct: 1, explanation: 'Nur Frames des Native VLANs bleiben auf einem Trunk ungetaggt.' },
    { question: 'Welcher Befehl legt einen Port als Trunk fest?', options: ['switchport trunk allowed vlan 10', 'switchport mode access', 'switchport mode trunk', 'vlan trunk'], correct: 2, explanation: '"switchport mode trunk" bestimmt den Port-Typ.' },
    { question: 'Was passiert, wenn beide Enden eines Trunks ein unterschiedliches Native VLAN konfiguriert haben?', options: ['Nichts, das ist normal', 'Es entsteht ein VLAN-Mismatch, IOS meldet meist eine Warnung', 'Der Trunk verdoppelt automatisch die Bandbreite', 'Alle VLANs werden automatisch zusammengeführt'], correct: 1, explanation: 'Unterschiedliche Native VLANs an beiden Enden sind eine klassische Fehlkonfiguration.' },
    { question: 'Welcher Befehl zeigt, welche VLANs über welchen Trunk erlaubt sind?', options: ['show vlan brief', 'show interfaces trunk', 'show running-config', 'show ip route'], correct: 1, explanation: '"show interfaces trunk" listet Trunk-Ports mit erlaubten VLANs und Native VLAN.' },
    { question: 'Was bewirkt "switchport trunk allowed vlan add 40"?', options: ['Ersetzt die erlaubte Liste durch VLAN 40', 'Ergänzt VLAN 40 zur bestehenden erlaubten Liste', 'Entfernt VLAN 40 aus der Liste', 'Blockiert VLAN 40'], correct: 1, explanation: 'Mit "add" wird VLAN 40 hinzugefügt; ohne "add" würde die Liste ersetzt werden.' },
    { question: 'Was ist der Unterschied zwischen "allowed" und "active" in "show interfaces trunk"?', options: ['Keiner', 'allowed = erlaubt auf dem Trunk; active = VLAN existiert auf dem Switch', 'active = erlaubt; allowed = existiert', 'allowed ist immer alle VLANs'], correct: 1, explanation: 'Ein VLAN kann auf dem Trunk erlaubt sein, aber nur dann aktiv sein, wenn es auf dem Switch angelegt wurde.' },
    { question: 'Warum sollte man DTP in der Praxis meist deaktivieren bzw. explizite Modi verwenden?', options: ['DTP ist generell verboten', 'Das DTP-Default-Verhalten kann je nach Plattform variieren', 'Trunks funktionieren nur dynamisch', 'Access-Ports brauchen DTP zwingend'], correct: 1, explanation: 'Weil DTP-Defaults plattformabhängig sind, sollte man Access/Trunk explizit konfigurieren.' },
    { question: 'Welcher Befehl deaktiviert die DTP-Aushandlung auf einem Trunk?', options: ['no dtp', 'switchport nonegotiate', 'switchport dtp off', 'dtp disable'], correct: 1, explanation: '"switchport nonegotiate" verhindert, dass der Port DTP-Frames sendet bzw. Trunking dynamisch aushandelt.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Zwischen SW1 und SW2 hängt ein Kabel an GigabitEthernet0/1. Mach daraus einen Trunk."',
      expectedLines: ['interface gi0/1', 'switchport mode trunk'],
      explanation: 'interface + switchport mode trunk reichen für einen einfachen Trunk ohne VLAN-Einschränkung.',
    },
    {
      prompt: 'Sam: "Auf dem Trunk an gi0/3 sollen ausschließlich VLAN 10 und VLAN 99 erlaubt sein."',
      expectedLines: ['interface gi0/3', 'switchport mode trunk', 'switchport trunk allowed vlan 10,99'],
      explanation: '"switchport trunk allowed vlan" grenzt den Trunk auf genau die angegebenen VLANs ein.',
    },
    {
      prompt: 'Sam: "Zeig mir kurz alle aktuell konfigurierten Trunk-Ports."',
      expectedLines: [['show interfaces trunk', 'sh int trunk']],
      explanation: '"show interfaces trunk" zeigt alle Trunk-Ports inklusive erlaubter VLANs und Native VLAN.',
    },
    {
      prompt: 'Sam: "Der Trunk an gi0/3 erlaubt nur VLAN 10 und 20. VLAN 30 muss zusätzlich erlaubt werden, ohne die bestehenden VLANs zu verlieren."',
      expectedLines: ['interface gi0/3', 'switchport trunk allowed vlan add 30'],
      explanation: 'Mit "add" ergänzt man VLAN 30; ohne "add" würde man die bestehenden VLANs überschreiben.',
    },
    {
      prompt: 'Sam: "VLAN 99 ist auf dem Trunk erlaubt, wird aber als nicht aktiv angezeigt. Was fehlt wahrscheinlich und wie prüfst du es?"',
      expectedLines: [['show vlan brief', 'sh vlan brief']],
      explanation: 'Wenn ein VLAN erlaubt, aber nicht aktiv ist, fehlt es auf dem Switch. "show vlan brief" zeigt, ob es existiert.',
    },
  ];
}

export function buildCiscoTrunkLesson() {
  return {
    title: 'Trunk',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
