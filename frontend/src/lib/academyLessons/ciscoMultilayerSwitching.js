import { topicKey } from '../academyTopics.js';

// =============================================================================
// "Multilayer Switch (MLS)" - fills the newly added `cisco-packet-tracer/
// multilayer-switching` catalog slot (Milestone C6). The second way to solve
// inter-VLAN routing, as an alternative to "Router on a Stick": a Layer-3
// switch routes directly between VLANs via SVIs (Switched Virtual
// Interfaces), without needing a separate router at all.
// =============================================================================

export const CISCO_MULTILAYER_SWITCHING_TOPIC_KEY = topicKey('cisco-packet-tracer', 'multilayer-switching');

const L2_VS_MLS_SVG = `<svg viewBox="0 0 340 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="80" y="20" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">L2-Switch</text><rect x="20" y="35" width="120" height="40" rx="5" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="80" y="58" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold">Switch</text><rect x="30" y="100" width="40" height="35" rx="4" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="50" y="120" text-anchor="middle" fill="#8b949e" font-size="7">VLAN10</text><rect x="90" y="100" width="40" height="35" rx="4" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="110" y="120" text-anchor="middle" fill="#8b949e" font-size="7">VLAN20</text><line x1="50" y1="135" x2="50" y2="170" stroke="#8b949e" stroke-width="1"/><line x1="110" y1="135" x2="110" y2="170" stroke="#8b949e" stroke-width="1"/><text x="80" y="185" text-anchor="middle" fill="#8b949e" font-size="7">nur Layer 2</text><text x="260" y="20" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Multilayer-Switch</text><rect x="200" y="35" width="120" height="40" rx="5" fill="#00f0ff" opacity="0.9"/><text x="260" y="58" text-anchor="middle" fill="#0a1628" font-size="9" font-weight="bold">L3-Switch</text><rect x="210" y="100" width="40" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="1"/><text x="230" y="120" text-anchor="middle" fill="#8b949e" font-size="7">VLAN10</text><rect x="270" y="100" width="40" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="1"/><text x="290" y="120" text-anchor="middle" fill="#8b949e" font-size="7">VLAN20</text><line x1="230" y1="135" x2="230" y2="160" stroke="#00f0ff" stroke-width="2"/><line x1="290" y1="135" x2="290" y2="160" stroke="#00f0ff" stroke-width="2"/><text x="260" y="165" text-anchor="middle" fill="#c9d1d9" font-size="7">SVIs / Routing</text><line x1="245" y1="170" x2="245" y2="180" stroke="#00f0ff" stroke-width="2"/><line x1="275" y1="170" x2="275" y2="180" stroke="#00f0ff" stroke-width="2"/><text x="260" y="195" text-anchor="middle" fill="#8b949e" font-size="7">Layer 2 + Layer 3</text></svg>`;

const ROUTED_PORT_VS_SVI_SVG = `<svg viewBox="0 0 340 200" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="100" y="20" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Routed Port</text><rect x="20" y="40" width="70" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="55" y="62" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">L3-Switch</text><line x1="90" y1="57" x2="150" y2="57" stroke="#00f0ff" stroke-width="2"/><text x="120" y="52" text-anchor="middle" fill="#00f0ff" font-size="7">Fa0/3</text><rect x="150" y="40" width="60" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="180" y="62" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Router</text><text x="100" y="95" text-anchor="middle" fill="#8b949e" font-size="8">interface fa0/3</text><text x="100" y="110" text-anchor="middle" fill="#8b949e" font-size="8">no switchport</text><text x="100" y="125" text-anchor="middle" fill="#8b949e" font-size="8">ip address 10.0.0.1 ...</text><text x="260" y="20" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">SVI</text><rect x="220" y="50" width="80" height="35" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="2"/><text x="260" y="72" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">L3-Switch</text><text x="260" y="105" text-anchor="middle" fill="#8b949e" font-size="8">interface vlan 10</text><text x="260" y="120" text-anchor="middle" fill="#8b949e" font-size="8">ip address 192.168.10.254 ...</text><rect x="235" y="140" width="50" height="25" rx="3" fill="#00f0ff" opacity="0.25" stroke="#00f0ff" stroke-width="1"/><text x="260" y="156" text-anchor="middle" fill="#8b949e" font-size="7">VLAN 10</text></svg>`;

const ROAS_VS_MLS_SVG = `<svg viewBox="0 0 340 200" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="90" y="18" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">Router-on-a-Stick</text><rect x="20" y="35" width="50" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="1"/><text x="45" y="54" text-anchor="middle" fill="#c9d1d9" font-size="8">VLAN10</text><rect x="100" y="35" width="50" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="1"/><text x="125" y="54" text-anchor="middle" fill="#c9d1d9" font-size="8">VLAN20</text><rect x="60" y="90" width="60" height="30" rx="4" fill="#00f0ff" opacity="0.9"/><text x="90" y="109" text-anchor="middle" fill="#0a1628" font-size="8" font-weight="bold">Switch</text><rect x="140" y="90" width="50" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="1"/><text x="165" y="109" text-anchor="middle" fill="#c9d1d9" font-size="8" font-weight="bold">Router</text><line x1="120" y1="105" x2="140" y2="105" stroke="#00f0ff" stroke-width="2"/><text x="130" y="85" text-anchor="middle" fill="#00f0ff" font-size="7">Trunk</text><text x="90" y="155" text-anchor="middle" fill="#8b949e" font-size="8">Subinterfaces: Fa0/0.10 / .20</text><text x="260" y="18" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">Multilayer-Switch</text><rect x="220" y="35" width="40" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="1"/><text x="240" y="54" text-anchor="middle" fill="#c9d1d9" font-size="8">VLAN10</text><rect x="280" y="35" width="40" height="30" rx="4" fill="#00f0ff" opacity="0.35" stroke="#00f0ff" stroke-width="1"/><text x="300" y="54" text-anchor="middle" fill="#c9d1d9" font-size="8">VLAN20</text><rect x="240" y="90" width="80" height="35" rx="4" fill="#00f0ff" opacity="0.9"/><text x="280" y="110" text-anchor="middle" fill="#0a1628" font-size="8" font-weight="bold">L3-Switch</text><text x="260" y="150" text-anchor="middle" fill="#8b949e" font-size="8">SVIs: Vlan10 / Vlan20</text><text x="260" y="165" text-anchor="middle" fill="#8b949e" font-size="8">ip routing</text></svg>`;

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('intro-classic', 'Die zweite Lösung für Inter-VLAN-Routing', 'classic', [
    { type: 'text', content: 'Router on a Stick löst Inter-VLAN-Routing mit einem separaten Router. Ein Multilayer-Switch (MLS, auch Layer-3-Switch genannt) geht einen anderen Weg: Er kann VLANs selbst routen, ohne dass überhaupt ein Router im Spiel ist.' },
  ]));

  exps.push(explanation('l2-l3-visual', 'L2-Switch vs. Multilayer-Switch', 'visual', [
    { type: 'diagram', content: L2_VS_MLS_SVG },
    { type: 'text', content: 'Ein reiner L2-Switch vermittelt nur innerhalb eines VLANs. Ein Multilayer-Switch kann dank zusätzlicher Layer-3-Fähigkeit selbst zwischen VLANs routen - aber erst, wenn "ip routing" aktiviert wurde.' },
  ]));

  exps.push(explanation('l2-l3-classic', 'Layer-2-Switch vs. Multilayer-Switch im Detail', 'classic', [
    { type: 'table', headers: ['Gerät', 'Fähigkeit'], rows: [
      ['L2-Switch', 'Vermittelt nur innerhalb eines VLANs anhand von MAC-Adressen (Layer 2). Für Inter-VLAN-Routing wird immer ein zusätzliches Layer-3-Gerät benötigt.'],
      ['Multilayer-Switch (L3-Switch)', 'Kann zusätzlich zur normalen Switch-Funktion selbst routen (Layer 3) - er übernimmt die Rolle des Routers gleich mit.'],
    ] },
    { type: 'list', title: 'Wann lohnt sich ein MLS statt Router on a Stick?', items: [
      'Wenn ohnehin schon ein Multilayer-Switch im Netz vorhanden ist (typisch im Distribution-/Core-Layer) - kein zusätzliches Gerät nötig.',
      'Bei höherem Datenverkehrsaufkommen zwischen VLANs: MLS-Routing erfolgt in Hardware (ASICs) und ist meist deutlich schneller als das Routing über eine einzelne Router-Verbindung.',
      'Router on a Stick bleibt sinnvoll, wenn ohnehin schon ein Router vorhanden ist oder kein Layer-3-Switch verfügbar ist.',
    ] },
  ]));

  exps.push(explanation('svi-classic', 'SVI - Switched Virtual Interface', 'classic', [
    { type: 'text', content: 'Statt physischer Subinterfaces (wie bei Router on a Stick) verwendet ein Multilayer-Switch für jedes VLAN eine virtuelle Schnittstelle direkt auf dem Switch selbst: die SVI ("interface vlan <ID>"). Sie ist das Gateway für genau dieses VLAN.' },
    { type: 'list', title: 'Voraussetzung: ip routing', items: [
      'Ein Switch routet standardmäßig NICHT zwischen VLANs, auch wenn er technisch ein Multilayer-Switch ist - das globale Routing muss erst mit "ip routing" aktiviert werden.',
      'Ohne "ip routing" bleiben die SVIs zwar erreichbar, aber es findet keine Weiterleitung zwischen unterschiedlichen VLANs statt.',
    ] },
    { type: 'question', question: 'Was ist eine SVI?', options: ['Ein physisches Kabel zwischen zwei Switches', 'Eine virtuelle, VLAN-gebundene Schnittstelle direkt auf dem Multilayer-Switch', 'Ein Sicherheitsprotokoll für Trunks', 'Ein Synonym für Access-Port'], correct: 1, explanation: 'Die SVI ("interface vlan <ID>") ist das Gateway für ein VLAN, direkt auf dem Layer-3-Switch.' },
  ]));

  exps.push(explanation('cli-classic', 'Multilayer-Switching konfigurieren', 'classic', [
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['ip routing', 'Aktiviert globales Routing auf dem Switch - ohne diesen Befehl routet der Switch nicht zwischen VLANs.'],
      ['interface vlan <VLAN-ID>', 'Legt die SVI für ein VLAN an bzw. wechselt in deren Konfiguration, z. B. "interface vlan 10".'],
      ['ip address <IP-Adresse> <Subnetzmaske>', 'Vergibt der SVI die Gateway-IP-Adresse für dieses VLAN.'],
      ['no shutdown', 'Aktiviert die SVI - wie bei jeder anderen Schnittstelle.'],
    ] },
    { type: 'list', title: 'Beispiel: SVIs für VLAN 10 und VLAN 20 auf einem Multilayer-Switch', items: [
      'Switch(config)# ip routing',
      'Switch(config)# interface vlan 10',
      'Switch(config-if)# ip address 192.168.10.1 255.255.255.0',
      'Switch(config-if)# no shutdown',
      'Switch(config-if)# exit',
      'Switch(config)# interface vlan 20',
      'Switch(config-if)# ip address 192.168.20.1 255.255.255.0',
      'Switch(config-if)# no shutdown',
    ] },
    { type: 'text', content: 'Die VLANs selbst (vlan 10 / vlan 20) müssen wie gewohnt vorher angelegt worden sein - eine SVI ersetzt nicht das Anlegen des VLANs, sondern ergänzt es um ein Layer-3-Gateway.' },
  ]));

  exps.push(explanation('routed-port-classic', 'Routed Port – ein physisches Interface als Layer-3-Port', 'classic', [
    { type: 'text', content: 'Neben normalen Switchports und Trunks kann ein Multilayer-Switch einzelne physische Ports auch als Layer-3-Ports betreiben. Das ist nützlich für Punkt-zu-Punkt-Verbindungen zu anderen Routern oder L3-Switches, ohne VLAN-Trunk-Semantik.' },
    { type: 'table', headers: ['Befehl', 'Bedeutung'], rows: [
      ['interface <Interface>', 'Schnittstelle auswählen, z. B. "interface fa0/3".'],
      ['no switchport', 'Deaktiviert die Layer-2-Funktion des Ports - er wird zum Routed Port.'],
      ['ip address <IP> <Maske>', 'Vergibt dem Routed Port eine IP-Adresse.'],
      ['switchport', 'Setzt einen zuvor mit "no switchport" umgewandelten Port wieder zurück in den Layer-2-Modus.'],
    ] },
    { type: 'list', title: 'Wann Routed Port, wann Trunk?', items: [
      'Routed Port: reine Layer-3-Punkt-zu-Punkt-Verbindung, kein VLAN-Trunking nötig.',
      'Trunk: mehrere VLANs sollen über dieselbe physische Leitung transportiert werden.',
    ] },
  ]));

  exps.push(explanation('routed-vs-svi-visual', 'Routed Port vs. SVI', 'visual', [
    { type: 'diagram', content: ROUTED_PORT_VS_SVI_SVG },
    { type: 'text', content: 'Ein Routed Port bekommt die IP direkt auf dem physischen Interface und ist unabhängig von VLANs. Eine SVI ist ein virtuelles Interface für genau ein VLAN und dient als Gateway für dessen Hosts.' },
  ]));

  exps.push(explanation('ip-routing-classic', '"ip routing" ist der entscheidende Schalter', 'classic', [
    { type: 'list', title: 'Was "ip routing" bewirkt', items: [
      'Ein Multilayer-Switch ist technisch zwar fähig, Layer-3-Pakete zu verarbeiten - das Routing ist aber standardmäßig oft deaktiviert.',
      'Erst mit "ip routing" baut der Switch eine Routing-Tabelle auf und leitet Pakete zwischen SVIs und Routed Ports weiter.',
      'Ohne "ip routing" bleiben SVIs zwar erreichbar, aber es findet keine Weiterleitung zwischen VLANs statt.',
    ] },
    { type: 'question', question: 'SVI für VLAN 10 und VLAN 20 sind konfiguriert, aber Hosts können nicht zwischen den VLANs kommunizieren. Was fehlt wahrscheinlich?', options: ['Die VLANs müssen gelöscht werden', '"ip routing" ist nicht aktiviert', 'Es fehlt ein Router-on-a-Stick', 'Der Switch braucht einen reboot'], correct: 1, explanation: 'Ohne das globale Kommando "ip routing" routet der Multilayer-Switch nicht zwischen seinen SVIs.' },
  ]));

  exps.push(explanation('svi-status-classic', 'Wann ist eine SVI wirklich funktionsfähig?', 'classic', [
    { type: 'list', title: 'Voraussetzungen für ein up/up SVI', items: [
      'Das VLAN muss auf dem Switch existieren ("vlan <ID>" oder per "switchport access vlan" automatisch erzeugt).',
      'Die SVI darf nicht mit "shutdown" deaktiviert sein ("no shutdown" nötig).',
      'Es muss mindestens ein aktiver Layer-2-Port oder Trunk für dieses VLAN vorhanden sein - sonst bleibt das SVI auf "up/down".',
      '"ip routing" muss aktiv sein, damit zwischen SVIs geroutet wird.',
    ] },
    { type: 'text', content: 'Merke: "interface vlan 10" existiert und ist "no shutdown" - das reicht nicht. Ohne aktives VLAN bzw. aktiven Port im VLAN bleibt das SVI im Zustand up/down.' },
  ]));

  exps.push(explanation('gateway-vs-default-classic', 'Management-Default-Gateway vs. Default Route', 'classic', [
    { type: 'text', content: 'Achtung: "ip default-gateway" und "ip route 0.0.0.0 0.0.0.0" sind zwei unterschiedliche Mechanismen.' },
    { type: 'table', headers: ['Befehl', 'Wann'], rows: [
      ['ip default-gateway <IP>', 'Nur relevant, wenn der Switch NICHT selbst routet (z. B. reiner L2-Switch für Management-Erreichbarkeit).'],
      ['ip route 0.0.0.0 0.0.0.0 <Next-Hop>', 'Wird verwendet, wenn "ip routing" aktiv ist und unbekannte Ziele über einen bestimmten Next Hop erreicht werden sollen.'],
    ] },
    { type: 'text', content: 'Auf einem routenden Multilayer-Switch ist die Default Route der richtige Weg für fremde Netze, nicht das Management-Gateway.' },
  ]));

  exps.push(explanation('verify-flow-classic', 'Multilayer-Switch verifizieren', 'classic', [
    { type: 'list', title: 'Reihenfolge', items: [
      '"show vlan brief" - Existieren die VLANs und sind Access-Ports zugewiesen?',
      '"show interfaces trunk" - Sind Trunks korrekt und erlauben die nötigen VLANs?',
      '"show ip interface brief" - Sind SVIs und Routed Ports aktiv und adressiert?',
      '"show ip route" - Enthält der Switch Connected- und ggf. statische Routen?',
      '"show interfaces status" - Zeigt der Port-Modus (access / trunk / routed) das Gewünschte?',
    ] },
    { type: 'text', content: 'Wichtig: Ein erfolgreicher Ping auf die Gateway-IP-Adresse beweist noch nicht, dass Inter-VLAN-Routing funktioniert. Teste immer End-to-End zwischen zwei Hosts in unterschiedlichen VLANs.' },
  ]));

  exps.push(explanation('summary-classic', 'Zusammenfassung', 'classic', [
    { type: 'list', title: 'Die wichtigsten Punkte', items: [
      'Ein Multilayer-Switch routet selbst zwischen VLANs - ohne separaten Router, aber nur wenn "ip routing" aktiv ist.',
      'Pro VLAN eine SVI: "interface vlan <ID>" → "ip address <IP> <Maske>" → "no shutdown". Das VLAN muss existieren und aktiv im VLAN sein.',
      'Ein Routed Port entsteht mit "no switchport" und bekommt seine IP direkt auf dem physischen Interface.',
      'Routed Port ≠ SVI: Routed Port = physisches Layer-3-Interface; SVI = virtuelles Gateway pro VLAN.',
      'Default Route ("ip route 0.0.0.0 0.0.0.0") ist auf einem routenden MLS der richtige Weg für fremde Netze, nicht "ip default-gateway".',
      'End-to-End-Tests zwischen Hosts unterschiedlicher VLANs beweisen funktionierendes Routing - ein Gateway-Ping allein reicht nicht.',
    ] },
  ]));

  return exps;
}

function buildExercises() {
  return [
    {
      id: 'mls-l2-l3-matching',
      type: 'matching',
      question: 'Ordne jedem Gerätetyp seine Fähigkeit zu.',
      pairs: [
        { left: 'L2-Switch', leftLabel: 'L2-Switch', right: 'Vermittelt nur innerhalb eines VLANs' },
        { left: 'Multilayer-Switch', leftLabel: 'Multilayer-Switch', right: 'Kann selbst zwischen VLANs routen' },
        { left: 'SVI', leftLabel: 'SVI', right: 'Virtuelles Gateway für ein einzelnes VLAN' },
      ],
      explanation: 'L2-Switches bleiben in einem VLAN, Multilayer-Switches routen selbst, SVIs sind deren Gateway pro VLAN.',
    },
    {
      id: 'mls-ip-routing-select',
      type: 'select-best',
      question: 'Ein Multilayer-Switch hat korrekt konfigurierte SVIs für VLAN 10 und 20, aber es findet trotzdem kein Routing zwischen ihnen statt. Was fehlt vermutlich?',
      options: ['Die VLANs müssen umbenannt werden', 'Der Befehl "ip routing" wurde nicht ausgeführt', 'SVIs unterstützen kein Routing', 'Es muss zusätzlich ein Router angeschlossen werden'],
      correct: 1,
      explanation: 'Ohne globales "ip routing" bleibt der Switch beim reinen Layer-2-Verhalten, egal wie viele SVIs konfiguriert sind.',
    },
    {
      id: 'mls-cli-svi',
      type: 'cli-input',
      question: 'Aktiviere Routing und lege eine SVI für VLAN 30 mit der IP-Adresse 192.168.30.1/24 an.',
      expectedLines: ['ip routing', 'interface vlan 30', 'ip address 192.168.30.1 255.255.255.0', 'no shutdown'],
      explanation: 'ip routing aktiviert das globale Routing, danach folgt die SVI-Konfiguration wie bei jeder anderen Schnittstelle.',
    },
    {
      id: 'mls-routed-port-cli',
      type: 'cli-input',
      question: 'Konfiguriere FastEthernet0/3 als Routed Port mit der IP-Adresse 10.10.10.1/30.',
      expectedLines: ['interface fa0/3', 'no switchport', 'ip address 10.10.10.1 255.255.255.252'],
      explanation: '"no switchport" entfernt die Switchport-Funktion, danach kann der Port wie ein Router-Interface mit einer IP-Adresse versehen werden.',
    },
    {
      id: 'mls-svi-missing-vlan-select',
      type: 'select-best',
      question: 'Eine SVI "interface vlan 50" ist konfiguriert und mit "no shutdown" aktiv, bleibt aber "up/down". Was ist die wahrscheinlichste Ursache?',
      options: ['"ip routing" ist deaktiviert', 'VLAN 50 existiert nicht oder hat keinen aktiven L2-Port', 'Die SVI hat keine IP-Adresse', 'Der Port ist ein Routed Port'],
      correct: 1,
      explanation: 'Eine SVI wird erst operativ up, wenn das zugehörige VLAN existiert und mindestens ein aktiver L2-Port oder Trunk dafür vorhanden ist.',
    },
    {
      id: 'mls-gateway-ping-select',
      type: 'select-best',
      question: 'Ein Host kann seine SVI-Gateway-IP anpingen, aber nicht einen Host im anderen VLAN. Was sagt das aus?',
      options: ['Inter-VLAN-Routing funktioniert', 'Nur die lokale SVI ist erreichbar - Routing zwischen VLANs funktioniert möglicherweise noch nicht', 'Das Kabel ist defekt', 'Die Subnetzmaske ist falsch'],
      correct: 1,
      explanation: 'Ein Ping auf das eigene Gateway beweist nur, dass die SVI erreichbar ist. End-to-End zwischen VLANs testet erst das eigentliche Routing.',
    },
    {
      id: 'mls-routed-vs-trunk-select',
      type: 'select-best',
      question: 'Ein Uplink soll mehrere VLANs zwischen zwei L3-Switches transportieren. Was ist hier die richtige Wahl?',
      options: ['Routed Port', 'Trunk', 'Access-Port', 'SVI'],
      correct: 1,
      explanation: 'Für mehrere VLANs auf einer Leitung wird ein Trunk benötigt. Ein Routed Port ist für reine Layer-3-Punkt-zu-Punkt-Verbindungen gedacht.',
    },
    {
      id: 'mls-recover-switchport-select',
      type: 'select-best',
      question: 'Ein Port wurde versehentlich mit "no switchport" in einen Routed Port verwandelt und soll wieder ein normaler Switchport sein. Was tust du?',
      options: ['"switchport" eingeben', 'Den Port löschen', '"no ip routing" eingeben', '"interface vlan" anlegen'],
      correct: 0,
      explanation: '"switchport" setzt einen zuvor umgewandelten Port wieder in den Layer-2-Modus zurück.',
    },
    {
      id: 'mls-default-gateway-vs-route-select',
      type: 'select-best',
      question: 'Auf einem routenden Multilayer-Switch mit "ip routing" soll der Datenverkehr ins Internet über den Router 203.0.113.1 weitergeleitet werden. Welcher Befehl ist korrekt?',
      options: ['ip default-gateway 203.0.113.1', 'ip route 0.0.0.0 0.0.0.0 203.0.113.1', 'default-gateway 203.0.113.1', 'ip routing 203.0.113.1'],
      correct: 1,
      explanation: 'Wenn "ip routing" aktiv ist, wird eine Default Route verwendet. "ip default-gateway" ist für nicht-routende Geräte (reiner L2-Switch).',
    },
    {
      id: 'mls-show-interfaces-status-select',
      type: 'select-best',
      question: 'Welcher Befehl zeigt dir auf einen Blick, ob ein Port Access, Trunk oder Routed Port ist?',
      options: ['show vlan brief', 'show interfaces status', 'show ip route', 'show running-config'],
      correct: 1,
      explanation: '"show interfaces status" listet pro Port unter anderem den aktuellen Port-Modus (access / trunk / routed).',
    },
  ];
}

function buildQuiz() {
  return [
    { question: 'Was kann ein Multilayer-Switch zusätzlich zu einem normalen L2-Switch?', options: ['Er kann mehr Kabel gleichzeitig anschließen', 'Er kann selbst zwischen VLANs routen (Layer 3)', 'Er benötigt kein Betriebssystem', 'Er kann keine VLANs anlegen'], correct: 1, explanation: 'Der zentrale Unterschied ist die Fähigkeit zum Layer-3-Routing.' },
    { question: 'Wie wird die Gateway-Schnittstelle für ein VLAN auf einem Multilayer-Switch genannt?', options: ['Subinterface', 'Trunk', 'SVI (Switched Virtual Interface)', 'Access-Port'], correct: 2, explanation: 'Die SVI ("interface vlan <ID>") ist das VLAN-Gateway direkt auf dem Switch.' },
    { question: 'Welcher Befehl aktiviert das globale Routing auf einem Multilayer-Switch?', options: ['ip route', 'ip routing', 'router ospf', 'switchport mode routed'], correct: 1, explanation: '"ip routing" schaltet die Layer-3-Funktion des Switches grundsätzlich ein.' },
    { question: 'Wann ist ein MLS gegenüber Router on a Stick oft im Vorteil?', options: ['Wenn nur ein einziges VLAN existiert', 'Bei hohem Datenverkehr zwischen VLANs, da das Routing in Hardware erfolgt', 'Wenn kein VLAN benötigt wird', 'MLS ist nie im Vorteil'], correct: 1, explanation: 'Hardware-basiertes Routing auf einem MLS ist bei viel Inter-VLAN-Verkehr meist performanter.' },
    { question: 'Ersetzt eine SVI das Anlegen eines VLANs mit "vlan <ID>"?', options: ['Ja, die SVI erstellt das VLAN automatisch', 'Nein, das VLAN muss weiterhin separat angelegt werden', 'Nur bei VLAN 1', 'Nur wenn "ip routing" aktiv ist'], correct: 1, explanation: 'Die SVI ergänzt ein bereits angelegtes VLAN um ein Layer-3-Gateway, ersetzt aber nicht das Anlegen des VLANs selbst.' },
    { question: 'Was bewirkt "no switchport" auf einem Multilayer-Switch-Port?', options: ['Der Port wird gelöscht', 'Der Port wird von Layer-2 zu Layer-3 umgewandelt', 'Der Port wird automatisch zum Trunk', 'Der Port bekommt ein Default-VLAN'], correct: 1, explanation: '"no switchport" deaktiviert die Switchport-Funktion und ermöglicht eine IP-Konfiguration direkt auf dem physischen Port.' },
    { question: 'Welcher Zustand zeigt eine SVI an, die zwar konfiguriert und "no shutdown" ist, aber deren VLAN keinen aktiven Port hat?', options: ['up/up', 'administratively down/down', 'up/down', 'down/down'], correct: 2, explanation: 'Das SVI ist administrativ aktiv (up), aber operativ nicht vollständig, weil das VLAN im Moment nicht aktiv ist (down).'
    },
    { question: 'Was ist der Unterschied zwischen "ip default-gateway" und "ip route 0.0.0.0 0.0.0.0" auf einem Multilayer-Switch?', options: ['Keiner', '"ip default-gateway" ist für nicht-routende Switches, "ip route" für Geräte mit "ip routing"', 'Beide aktivieren Routing', 'Beide sind für Management gedacht'], correct: 1, explanation: '"ip default-gateway" dient reinem L2-Management; auf einem routenden MLS verwendet man eine Default Route.' },
    { question: 'Warum beweist ein erfolgreicher Ping auf die Gateway-IP kein funktionierendes Inter-VLAN-Routing?', options: ['Weil Gateways nicht antworten', 'Weil damit nur die lokale SVI getestet wird, nicht die Weiterleitung zwischen VLANs', 'Weil Ping generell kein Routing testet', 'Weil das Gateway immer up ist'], correct: 1, explanation: 'Ein Gateway-Ping zeigt nur, dass die eigene SVI erreichbar ist. End-to-End zwischen VLANs testet das eigentliche Routing.' },
  ];
}

function buildCliTasks() {
  return [
    {
      prompt: 'Sam: "Aktiviere auf dem Multilayer-Switch das Routing und richte die SVI für VLAN 10 mit Gateway 192.168.10.1/24 ein."',
      expectedLines: ['ip routing', 'interface vlan 10', 'ip address 192.168.10.1 255.255.255.0', 'no shutdown'],
      explanation: 'ip routing zuerst, dann SVI anlegen, IP vergeben, aktivieren.',
    },
    {
      prompt: 'Sam: "Jetzt noch die SVI für VLAN 20, Gateway 192.168.20.1/24 - "ip routing" ist schon aktiv."',
      expectedLines: ['interface vlan 20', 'ip address 192.168.20.1 255.255.255.0', 'no shutdown'],
      explanation: '"ip routing" muss nur einmal global aktiviert werden, danach reicht pro VLAN die SVI-Konfiguration.',
    },
    {
      prompt: 'Sam: "FastEthernet0/4 soll ein Routed Port für den Uplink zum Core-Router werden. IP 10.0.0.1/30."',
      expectedLines: ['interface fa0/4', 'no switchport', 'ip address 10.0.0.1 255.255.255.252'],
      explanation: 'Mit "no switchport" wird der Port zu einem Layer-3-Port; danach erhält er eine IP-Adresse.',
    },
    {
      prompt: 'Sam: "Die SVIs scheinen konfiguriert, aber es gibt kein Inter-VLAN-Routing. Zeig mir die Routing-Tabelle."',
      expectedLines: [['show ip route', 'sh ip route']],
      explanation: '"show ip route" zeigt, ob der Switch überhaupt routet und welche Netze verbunden sind.',
    },
    {
      prompt: 'Sam: "Zeig mir die wichtigsten Interface-Status auf einen Blick: IP, Status, Protocol."',
      expectedLines: [['show ip interface brief', 'sh ip int br']],
      explanation: '"show ip interface brief" listet SVIs, Routed Ports und andere Interfaces kompakt auf.',
    },
  ];
}

export function buildCiscoMultilayerSwitchingLesson() {
  return {
    title: 'Multilayer Switch (MLS)',
    explanations: buildExplanations(),
    exercises: buildExercises(),
    quiz: buildQuiz(),
    cliTasks: buildCliTasks(),
  };
}
